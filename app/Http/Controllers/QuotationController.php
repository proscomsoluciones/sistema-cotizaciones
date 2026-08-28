<?php

namespace App\Http\Controllers;

use App\Enums\QuotationStatus;
use App\Http\Requests\StoreQuotationRequest;
use App\Http\Requests\UpdateQuotationRequest;
use App\Mail\QuotationSentMail;
use App\Models\Client;
use App\Models\Product;
use App\Models\Quotation;
use App\Support\Company;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class QuotationController extends Controller
{
    public function index(Request $request): Response
    {
        $perPage = in_array($request->integer('per_page'), [10, 25, 50, 100]) ? $request->integer('per_page') : 10;

        $quotations = Quotation::query()
            ->with('client')
            ->when($request->string('status')->toString(), function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->string('search')->toString(), function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('folio', 'like', "%{$search}%")
                        ->orWhereHas('client', fn ($q) => $q->where('name', 'like', "%{$search}%"));
                });
            })
            ->latest('issue_date')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('cotizaciones/index', [
            'quotations' => $quotations,
            'filters' => $request->only('status', 'search'),
            'statuses' => $this->statusOptions(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('cotizaciones/create', [
            'clients' => Client::query()->orderBy('name')->get(['id', 'name']),
            'products' => Product::query()->where('active', true)->orderBy('name')->get(['id', 'name', 'unit_price', 'unit']),
        ]);
    }

    public function store(StoreQuotationRequest $request): RedirectResponse
    {
        $quotation = DB::transaction(function () use ($request) {
            $quotation = Quotation::create([
                'client_id' => $request->validated('client_id'),
                'status' => QuotationStatus::Draft,
                'issue_date' => $request->validated('issue_date'),
                'valid_until' => $request->validated('valid_until'),
                'tax_rate' => $request->validated('tax_rate'),
                'notes' => $request->validated('notes'),
            ]);

            $this->syncItems($quotation, $request->validated('items'));

            $quotation->load('items');
            $quotation->recalculateTotals();
            $quotation->save();

            return $quotation;
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => "Cotización {$quotation->folio} creada."]);

        return to_route('cotizaciones.show', $quotation);
    }

    public function show(Quotation $quotation): Response
    {
        $quotation->load(['client', 'items.product', 'contract']);

        return Inertia::render('cotizaciones/show', [
            'quotation' => $quotation,
            'approvalUrl' => $quotation->approval_token ? URL::to("/cotizaciones/aprobar/{$quotation->approval_token}") : null,
        ]);
    }

    public function edit(Quotation $quotation): RedirectResponse|Response
    {
        if ($quotation->status !== QuotationStatus::Draft) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Solo se pueden editar cotizaciones en borrador.']);

            return to_route('cotizaciones.show', $quotation);
        }

        $quotation->load(['client', 'items']);

        return Inertia::render('cotizaciones/edit', [
            'quotation' => $quotation,
            'clients' => Client::query()->orderBy('name')->get(['id', 'name']),
            'products' => Product::query()->where('active', true)->orderBy('name')->get(['id', 'name', 'unit_price', 'unit']),
        ]);
    }

    public function update(UpdateQuotationRequest $request, Quotation $quotation): RedirectResponse
    {
        if ($quotation->status !== QuotationStatus::Draft) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Solo se pueden editar cotizaciones en borrador.']);

            return to_route('cotizaciones.show', $quotation);
        }

        DB::transaction(function () use ($request, $quotation) {
            $quotation->update([
                'client_id' => $request->validated('client_id'),
                'issue_date' => $request->validated('issue_date'),
                'valid_until' => $request->validated('valid_until'),
                'tax_rate' => $request->validated('tax_rate'),
                'notes' => $request->validated('notes'),
            ]);

            $quotation->items()->delete();
            $this->syncItems($quotation, $request->validated('items'));

            $quotation->load('items');
            $quotation->recalculateTotals();
            $quotation->save();
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => "Cotización {$quotation->folio} actualizada."]);

        return to_route('cotizaciones.show', $quotation);
    }

    public function destroy(Quotation $quotation): RedirectResponse
    {
        if ($quotation->contract()->exists()) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'No se puede eliminar una cotización con contrato generado.']);

            return to_route('cotizaciones.show', $quotation);
        }

        $quotation->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Cotización eliminada.']);

        return to_route('cotizaciones.index');
    }

    public function send(Quotation $quotation): RedirectResponse
    {
        if (in_array($quotation->status, [QuotationStatus::Approved, QuotationStatus::Rejected], true)) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Esta cotización ya fue respondida por el cliente.']);

            return back();
        }

        if (! $quotation->client->email) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'El cliente no tiene un correo registrado.']);

            return back();
        }

        $quotation->generateApprovalToken();
        $quotation->status = QuotationStatus::Sent;
        $quotation->sent_at = now();
        $quotation->save();

        $approvalUrl = URL::to("/cotizaciones/aprobar/{$quotation->approval_token}");

        Mail::to($quotation->client->email)->send(new QuotationSentMail($quotation, $approvalUrl));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Cotización enviada al cliente.']);

        return back();
    }

    public function pdf(Quotation $quotation): SymfonyResponse
    {
        $quotation->load(['client', 'items']);

        $pdf = Pdf::loadView('pdf.quotation', [
            'quotation' => $quotation,
            'logo' => Company::logoBase64(),
        ]);

        return $pdf->stream("{$quotation->folio}.pdf");
    }

    private function syncItems(Quotation $quotation, array $items): void
    {
        foreach ($items as $item) {
            $quantity = (float) $item['quantity'];
            $unitPrice = (float) $item['unit_price'];

            $quotation->items()->create([
                'product_id' => $item['product_id'] ?? null,
                'description' => $item['description'],
                'quantity' => $quantity,
                'unit_price' => $unitPrice,
                'subtotal' => round($quantity * $unitPrice, 2),
            ]);
        }
    }

    private function statusOptions(): array
    {
        return array_map(
            fn (QuotationStatus $status) => ['value' => $status->value, 'label' => $status->label()],
            QuotationStatus::cases()
        );
    }
}

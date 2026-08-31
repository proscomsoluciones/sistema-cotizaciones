<?php

namespace App\Http\Controllers;

use App\Enums\PaymentStatus;
use App\Models\Contract;
use App\Models\ContractPayment;
use App\Models\Quotation;
use App\Services\ContractGenerator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function index(Request $request): Response
    {
        $perPage = in_array($request->integer('per_page'), [10, 25, 50, 100]) ? $request->integer('per_page') : 15;
        $status = $request->string('status')->toString();
        $search = $request->string('search')->toString();
        $method = $request->string('payment_method')->toString();

        $query = ContractPayment::query()
            ->with(['contract.client', 'contract.quotation'])
            ->when($status, function ($q, $status) {
                if ($status === 'overdue') {
                    $q->where('status', PaymentStatus::Pending)
                        ->whereNotNull('due_date')
                        ->where('due_date', '<', now()->toDateString());
                } elseif (in_array($status, ['paid', 'pending'])) {
                    $q->where('status', $status);
                }
            })
            ->when($method, function ($q, $method) {
                $q->where('payment_method', $method);
            })
            ->when($search, function ($q, $search) {
                $q->where(function ($q) use ($search) {
                    $q->where('label', 'like', "%{$search}%")
                        ->orWhereHas('contract', function ($q) use ($search) {
                            $q->where('contract_number', 'like', "%{$search}%")
                                ->orWhereHas('client', fn ($q) => $q->where('name', 'like', "%{$search}%"))
                                ->orWhereHas('quotation', fn ($q) => $q->where('folio', 'like', "%{$search}%"));
                        });
                });
            });

        $payments = (clone $query)
            ->orderByRaw("CASE WHEN status = 'pending' THEN 0 ELSE 1 END")
            ->orderBy('due_date', 'asc')
            ->orderBy('id', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        // Calculate global statistics
        $totalPaid = (float) ContractPayment::where('status', PaymentStatus::Paid)->sum('paid_amount');
        $totalPending = (float) ContractPayment::where('status', PaymentStatus::Pending)->sum('amount');
        $totalOverdue = (float) ContractPayment::where('status', PaymentStatus::Pending)
            ->whereNotNull('due_date')
            ->where('due_date', '<', now()->toDateString())
            ->sum('amount');
        $paidThisMonth = (float) ContractPayment::where('status', PaymentStatus::Paid)
            ->whereYear('paid_at', now()->year)
            ->whereMonth('paid_at', now()->month)
            ->sum('paid_amount');

        // Available options: Contracts + Cotizaciones (even if no contract generated yet)
        $contracts = Contract::query()
            ->with(['client', 'quotation'])
            ->latest()
            ->get()
            ->map(fn (Contract $contract) => [
                'id' => $contract->id,
                'type' => 'contract',
                'contract_number' => $contract->contract_number,
                'client_name' => $contract->client->name ?? 'Sin cliente',
                'quotation_folio' => $contract->quotation->folio ?? '',
                'total_amount' => $contract->total_amount,
                'pending_total' => $contract->pending_total,
                'label_display' => "Contrato {$contract->contract_number} - {$contract->client->name} ({$contract->quotation->folio})",
            ]);

        $quotationsWithoutContracts = Quotation::query()
            ->whereDoesntHave('contract')
            ->with('client')
            ->latest()
            ->get()
            ->map(fn (Quotation $quotation) => [
                'id' => 'q_' . $quotation->id,
                'type' => 'quotation',
                'quotation_id' => $quotation->id,
                'contract_number' => 'Cotización ' . $quotation->folio,
                'client_name' => $quotation->client->name ?? 'Sin cliente',
                'quotation_folio' => $quotation->folio,
                'total_amount' => $quotation->total,
                'pending_total' => (float) $quotation->total,
                'label_display' => "Cotización {$quotation->folio} - {$quotation->client->name} (" . number_format((float) $quotation->total, 0, ',', '.') . ")",
            ]);

        $allOptions = $contracts->concat($quotationsWithoutContracts);

        return Inertia::render('pagos/index', [
            'payments' => $payments,
            'stats' => [
                'totalPaid' => $totalPaid,
                'totalPending' => $totalPending,
                'totalOverdue' => $totalOverdue,
                'paidThisMonth' => $paidThisMonth,
            ],
            'filters' => [
                'search' => $search,
                'status' => $status,
                'payment_method' => $method,
            ],
            'contracts' => $allOptions,
            'paymentMethods' => [
                ['value' => 'transferencia', 'label' => 'Transferencia'],
                ['value' => 'efectivo', 'label' => 'Efectivo'],
                ['value' => 'tarjeta', 'label' => 'Tarjeta'],
                ['value' => 'cheque', 'label' => 'Cheque'],
                ['value' => 'otro', 'label' => 'Otro'],
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'contract_id' => ['nullable', 'string'],
            'quotation_id' => ['nullable', 'integer', 'exists:quotations,id'],
            'label' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'percentage' => ['nullable', 'numeric', 'between:0,100'],
            'due_date' => ['nullable', 'date'],
            'status' => ['nullable', 'string', 'in:pending,paid'],
            'paid_at' => ['nullable', 'date'],
            'paid_amount' => ['nullable', 'numeric', 'min:0.01'],
            'payment_method' => ['nullable', 'string', 'in:transferencia,efectivo,tarjeta,cheque,otro'],
            'notes' => ['nullable', 'string'],
        ]);

        $contract = null;

        if (! empty($validated['quotation_id'])) {
            $quotation = Quotation::findOrFail($validated['quotation_id']);
            $contract = $quotation->contract ?? (new ContractGenerator)->generate($quotation);
        } else {
            $rawId = $validated['contract_id'] ?? '';
            if (str_starts_with($rawId, 'q_')) {
                $qId = (int) str_replace('q_', '', $rawId);
                $quotation = Quotation::findOrFail($qId);
                $contract = $quotation->contract ?? (new ContractGenerator)->generate($quotation);
            } else {
                $contract = Contract::findOrFail((int) $rawId);
            }
        }

        $isPaid = ($validated['status'] ?? '') === 'paid' || ! empty($validated['paid_at']);

        $payment = $contract->payments()->create([
            'label' => $validated['label'],
            'amount' => $validated['amount'],
            'percentage' => $validated['percentage'] ?? null,
            'due_date' => $validated['due_date'] ?? null,
            'status' => $isPaid ? PaymentStatus::Paid : PaymentStatus::Pending,
            'paid_at' => $isPaid ? ($validated['paid_at'] ?? now()->toDateString()) : null,
            'paid_amount' => $isPaid ? ($validated['paid_amount'] ?? $validated['amount']) : null,
            'payment_method' => $isPaid ? ($validated['payment_method'] ?? 'transferencia') : null,
            'notes' => $validated['notes'] ?? null,
            'order' => $contract->payments()->max('order') + 1,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => "Pago '{$payment->label}' registrado."]);

        return to_route('pagos.index');
    }
}

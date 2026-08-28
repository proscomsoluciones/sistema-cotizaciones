<?php

namespace App\Http\Controllers;

use App\Models\Contract;
use App\Services\ContractGenerator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ContractController extends Controller
{
    public function index(Request $request): Response
    {
        $perPage = in_array($request->integer('per_page'), [10, 25, 50, 100]) ? $request->integer('per_page') : 10;

        $contracts = Contract::query()
            ->with(['client', 'quotation', 'payments'])
            ->when($request->string('search')->toString(), function ($query, $search) {
                $query->where('contract_number', 'like', "%{$search}%")
                    ->orWhereHas('client', fn ($q) => $q->where('name', 'like', "%{$search}%"));
            })
            ->latest('generated_at')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('contratos/index', [
            'contracts' => $contracts,
            'filters' => $request->only('search'),
        ]);
    }

    public function show(Contract $contract): Response
    {
        $contract->load(['client', 'quotation.items', 'payments']);

        return Inertia::render('contratos/show', [
            'contract' => $contract,
        ]);
    }

    public function download(Contract $contract, ContractGenerator $contractGenerator): StreamedResponse
    {
        $contract->load(['client', 'quotation.items', 'payments']);

        $path = $contractGenerator->generatePdf($contract);

        $contract->update(['pdf_path' => $path, 'generated_at' => now()]);

        return Storage::disk('local')->download($path, "{$contract->contract_number}.pdf");
    }

    public function update(Request $request, Contract $contract, ContractGenerator $contractGenerator): RedirectResponse
    {
        $validated = $request->validate([
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'terms' => ['nullable', 'string'],
        ]);

        $contract->update($validated);

        $contract->load(['client', 'quotation.items', 'payments']);
        $path = $contractGenerator->generatePdf($contract);
        $contract->update(['pdf_path' => $path, 'generated_at' => now()]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Fechas y vigencia del contrato actualizadas.']);

        return back();
    }

    public function regeneratePdf(Contract $contract, ContractGenerator $contractGenerator): RedirectResponse
    {
        $contract->load(['client', 'quotation.items', 'payments']);

        $path = $contractGenerator->generatePdf($contract);

        $contract->update(['pdf_path' => $path, 'generated_at' => now()]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'PDF regenerado con los datos actuales.']);

        return to_route('contratos.show', $contract);
    }
}

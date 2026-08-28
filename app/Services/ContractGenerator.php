<?php

namespace App\Services;

use App\Models\Contract;
use App\Models\Quotation;
use App\Support\Company;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

class ContractGenerator
{
    public function generate(Quotation $quotation): Contract
    {
        $startDate = now();
        $endDate = $this->calculateEndDate($quotation, $startDate);

        $contract = Contract::create([
            'quotation_id' => $quotation->id,
            'client_id' => $quotation->client_id,
            'contract_number' => Contract::nextContractNumber(),
            'start_date' => $startDate->toDateString(),
            'end_date' => $endDate,
            'total_amount' => $quotation->total,
            'terms' => $this->defaultTerms($quotation),
        ]);

        $pdfPath = $this->generatePdf($contract->fresh(['quotation.items', 'client', 'payments']));

        $contract->update([
            'pdf_path' => $pdfPath,
            'generated_at' => now(),
        ]);

        return $contract->fresh();
    }

    public function generatePdf(Contract $contract): string
    {
        $pdf = Pdf::loadView('pdf.contract', [
            'contract' => $contract,
            'logo' => Company::logoBase64(),
        ]);

        $path = 'contracts/'.$contract->contract_number.'.pdf';

        Storage::disk('local')->put($path, $pdf->output());

        return $path;
    }

    private function defaultTerms(Quotation $quotation): string
    {
        return $quotation->items->pluck('description')->implode("\n");
    }

    private function calculateEndDate(Quotation $quotation, \Carbon\CarbonInterface $startDate): ?string
    {
        $months = 0;
        foreach ($quotation->items as $item) {
            $unit = strtolower($item->product->unit ?? '');
            $desc = strtolower($item->description);
            if (str_contains($unit, 'mes') || str_contains($desc, 'mes')) {
                $months = max($months, (int) round((float) $item->quantity));
            }
        }

        return $months > 0 ? $startDate->copy()->addMonths($months)->toDateString() : null;
    }
}

<?php

namespace App\Http\Controllers\Public;

use App\Enums\QuotationStatus;
use App\Http\Controllers\Controller;
use App\Mail\QuotationResponseMail;
use App\Models\Quotation;
use App\Services\ContractGenerator;
use App\Support\Company;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class QuotationApprovalController extends Controller
{
    public function show(Quotation $quotation): Response
    {
        $quotation->load(['client', 'items']);

        return Inertia::render('public/quotation-approve', [
            'quotation' => $quotation,
            'canRespond' => $this->canRespond($quotation),
        ]);
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

    public function approve(Quotation $quotation, ContractGenerator $contractGenerator): RedirectResponse
    {
        if (! $this->canRespond($quotation)) {
            return to_route('public.quotations.show', $quotation->approval_token);
        }

        $quotation->status = QuotationStatus::Approved;
        $quotation->approved_at = now();
        $quotation->save();

        $contractGenerator->generate($quotation);

        $quotation->load(['client', 'items']);
        Mail::to(config('company.email', 'jcornejo@proscom.cl'))->send(new QuotationResponseMail($quotation, 'aprobada'));

        return to_route('public.quotations.show', $quotation->approval_token);
    }

    public function reject(Quotation $quotation): RedirectResponse
    {
        if (! $this->canRespond($quotation)) {
            return to_route('public.quotations.show', $quotation->approval_token);
        }

        $quotation->status = QuotationStatus::Rejected;
        $quotation->rejected_at = now();
        $quotation->save();

        $quotation->load(['client', 'items']);
        Mail::to(config('company.email', 'jcornejo@proscom.cl'))->send(new QuotationResponseMail($quotation, 'rechazada'));

        return to_route('public.quotations.show', $quotation->approval_token);
    }

    private function canRespond(Quotation $quotation): bool
    {
        if ($quotation->status !== QuotationStatus::Sent) {
            return false;
        }

        return ! $quotation->valid_until || $quotation->valid_until->isFuture() || $quotation->valid_until->isToday();
    }
}

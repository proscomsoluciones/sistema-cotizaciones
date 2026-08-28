<?php

namespace App\Console\Commands;

use App\Enums\PaymentStatus;
use App\Enums\QuotationStatus;
use App\Mail\DailyAlertsMail;
use App\Models\ContractPayment;
use App\Models\Quotation;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

#[Signature('app:check-alerts')]
#[Description('Expira cotizaciones vencidas y envía un correo con las alertas del día (cotizaciones por vencer, pagos atrasados o por vencer).')]
class CheckAlerts extends Command
{
    public function handle(): void
    {
        $today = now()->startOfDay();

        $expired = Quotation::query()
            ->where('status', QuotationStatus::Sent)
            ->whereDate('valid_until', '<', $today)
            ->get();

        foreach ($expired as $quotation) {
            $quotation->update(['status' => QuotationStatus::Expired]);
        }

        $expiringSoon = Quotation::query()
            ->with('client')
            ->where('status', QuotationStatus::Sent)
            ->whereDate('valid_until', '>=', $today)
            ->whereDate('valid_until', '<=', $today->copy()->addDays(3))
            ->orderBy('valid_until')
            ->get();

        $overduePayments = ContractPayment::query()
            ->with('contract.client')
            ->where('status', PaymentStatus::Pending)
            ->whereDate('due_date', '<', $today)
            ->orderBy('due_date')
            ->get();

        $paymentsDueSoon = ContractPayment::query()
            ->with('contract.client')
            ->where('status', PaymentStatus::Pending)
            ->whereDate('due_date', '>=', $today)
            ->whereDate('due_date', '<=', $today->copy()->addDays(5))
            ->orderBy('due_date')
            ->get();

        $this->info("Cotizaciones expiradas: {$expired->count()}");
        $this->info("Cotizaciones por vencer: {$expiringSoon->count()}");
        $this->info("Pagos atrasados: {$overduePayments->count()}");
        $this->info("Pagos por vencer: {$paymentsDueSoon->count()}");

        if ($expired->isEmpty() && $expiringSoon->isEmpty() && $overduePayments->isEmpty() && $paymentsDueSoon->isEmpty()) {
            $this->info('Nada que reportar hoy.');

            return;
        }

        Mail::to(config('company.email'))->send(new DailyAlertsMail(
            expired: $expired,
            expiringSoon: $expiringSoon,
            overduePayments: $overduePayments,
            paymentsDueSoon: $paymentsDueSoon,
        ));

        $this->info('Correo de alertas enviado a '.config('company.email'));
    }
}

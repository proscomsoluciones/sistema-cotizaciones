<?php

namespace App\Http\Controllers;

use App\Enums\PaymentStatus;
use App\Http\Requests\GeneratePaymentPlanRequest;
use App\Http\Requests\MarkPaymentPaidRequest;
use App\Http\Requests\StoreContractPaymentRequest;
use App\Http\Requests\UpdateContractPaymentRequest;
use App\Models\Contract;
use App\Models\ContractPayment;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class ContractPaymentController extends Controller
{
    public function generatePlan(GeneratePaymentPlanRequest $request, Contract $contract): RedirectResponse
    {
        if ($contract->payments()->where('status', PaymentStatus::Paid)->exists()) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'No se puede regenerar el plan: ya hay pagos registrados.']);

            return to_route('contratos.show', $contract);
        }

        $contract->payments()->delete();

        $total = (float) $contract->total_amount;
        $rows = match ($request->validated('template')) {
            '50_50' => $this->splitByPercentages($total, [50, 50], ['Anticipo (50%)', 'Pago final (50%)']),
            '25_75' => $this->splitByPercentages($total, [25, 75], ['Anticipo (25%)', 'Pago final (75%)']),
            'installments' => $this->splitIntoInstallments($total, (int) $request->validated('installments_count')),
        };

        foreach ($rows as $order => $row) {
            $contract->payments()->create([...$row, 'order' => $order]);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Plan de pagos generado.']);

        return to_route('contratos.show', $contract);
    }

    public function store(StoreContractPaymentRequest $request, Contract $contract): RedirectResponse
    {
        $contract->payments()->create([
            ...$request->validated(),
            'order' => $contract->payments()->max('order') + 1,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Pago agregado al plan.']);

        return to_route('contratos.show', $contract);
    }

    public function update(UpdateContractPaymentRequest $request, Contract $contract, ContractPayment $payment): RedirectResponse
    {
        abort_unless($payment->contract_id === $contract->id, 404);

        $payment->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Pago actualizado.']);

        return to_route('contratos.show', $contract);
    }

    public function destroy(Contract $contract, ContractPayment $payment): RedirectResponse
    {
        abort_unless($payment->contract_id === $contract->id, 404);

        if ($payment->status !== PaymentStatus::Pending) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'No se puede eliminar un pago ya registrado.']);

            return to_route('contratos.show', $contract);
        }

        $payment->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Pago eliminado.']);

        return to_route('contratos.show', $contract);
    }

    public function markPaid(MarkPaymentPaidRequest $request, Contract $contract, ContractPayment $payment): RedirectResponse
    {
        abort_unless($payment->contract_id === $contract->id, 404);

        $payment->update([
            ...$request->validated(),
            'status' => PaymentStatus::Paid,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Pago registrado.']);

        return to_route('contratos.show', $contract);
    }

    public function markPending(Contract $contract, ContractPayment $payment): RedirectResponse
    {
        abort_unless($payment->contract_id === $contract->id, 404);

        $payment->update([
            'status' => PaymentStatus::Pending,
            'paid_at' => null,
            'paid_amount' => null,
            'payment_method' => null,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Pago marcado como pendiente nuevamente.']);

        return to_route('contratos.show', $contract);
    }

    /**
     * @param  array<int, float>  $percentages
     * @param  array<int, string>  $labels
     * @return array<int, array{label: string, percentage: float, amount: float}>
     */
    private function splitByPercentages(float $total, array $percentages, array $labels): array
    {
        $rows = [];
        $allocated = 0.0;

        foreach ($percentages as $index => $percentage) {
            $isLast = $index === count($percentages) - 1;
            $amount = $isLast ? round($total - $allocated, 2) : round($total * $percentage / 100, 2);
            $allocated += $amount;

            $rows[] = ['label' => $labels[$index], 'percentage' => $percentage, 'amount' => $amount];
        }

        return $rows;
    }

    /**
     * @return array<int, array{label: string, percentage: null, amount: float}>
     */
    private function splitIntoInstallments(float $total, int $count): array
    {
        $base = floor(($total / $count) * 100) / 100;
        $rows = [];
        $allocated = 0.0;

        for ($i = 1; $i <= $count; $i++) {
            $amount = $i === $count ? round($total - $allocated, 2) : $base;
            $allocated += $amount;

            $rows[] = ['label' => "Cuota {$i}/{$count}", 'percentage' => null, 'amount' => $amount];
        }

        return $rows;
    }
}

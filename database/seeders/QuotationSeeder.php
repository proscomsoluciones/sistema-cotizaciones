<?php

namespace Database\Seeders;

use App\Enums\PaymentStatus;
use App\Enums\QuotationStatus;
use App\Models\Client;
use App\Models\Product;
use App\Models\Quotation;
use App\Services\ContractGenerator;
use Illuminate\Database\Seeder;

class QuotationSeeder extends Seeder
{
    public function run(): void
    {
        $products = Product::query()->get()->keyBy('name');
        $contractGenerator = app(ContractGenerator::class);

        // 1. Borrador
        $this->createQuotation(
            client: Client::where('name', 'Comercial Andes Ltda.')->first(),
            items: [
                ['product' => $products['Desarrollo de sitio web'], 'quantity' => 1],
                ['product' => $products['Hosting y dominio'], 'quantity' => 1],
            ],
            issueDate: now(),
        );

        // 2. Enviada, esperando respuesta del cliente
        $sent = $this->createQuotation(
            client: Client::where('name', 'Constructora Valle Sur SpA')->first(),
            items: [
                ['product' => $products['Desarrollo de aplicación móvil'], 'quantity' => 1],
                ['product' => $products['Consultoría e implementación TI'], 'quantity' => 10],
            ],
            issueDate: now()->subDays(5),
            validUntil: now()->addDays(10),
        );
        $sent->generateApprovalToken();
        $sent->status = QuotationStatus::Sent;
        $sent->sent_at = now()->subDays(5);
        $sent->save();

        // 3. Aprobada, con contrato y plan de pagos (anticipo ya cobrado)
        $approvedWithPlan = $this->createQuotation(
            client: Client::where('name', 'Clínica Bienestar Ltda.')->first(),
            items: [
                ['product' => $products['Integración de medios de pago'], 'quantity' => 1],
                ['product' => $products['Soporte y mantención mensual'], 'quantity' => 3],
            ],
            issueDate: now()->subDays(20),
        );
        $approvedWithPlan->generateApprovalToken();
        $approvedWithPlan->status = QuotationStatus::Approved;
        $approvedWithPlan->approved_at = now()->subDays(18);
        $approvedWithPlan->save();

        $contractWithPlan = $contractGenerator->generate($approvedWithPlan);
        $total = (float) $contractWithPlan->total_amount;
        $advance = round($total * 0.5);

        $contractWithPlan->payments()->create([
            'label' => 'Anticipo (50%)',
            'percentage' => 50,
            'amount' => $advance,
            'status' => PaymentStatus::Paid,
            'paid_at' => now()->subDays(17),
            'paid_amount' => $advance,
            'payment_method' => 'transferencia',
            'order' => 0,
        ]);
        $contractWithPlan->payments()->create([
            'label' => 'Pago final (50%)',
            'percentage' => 50,
            'amount' => $total - $advance,
            'due_date' => now()->addDays(10),
            'order' => 1,
        ]);

        // 4. Aprobada, con contrato, sin plan de pagos todavía
        $approvedNoPlan = $this->createQuotation(
            client: Client::where('name', 'Distribuidora Pacífico SpA')->first(),
            items: [
                ['product' => $products['Integración de APIs de terceros'], 'quantity' => 1],
                ['product' => $products['Desarrollo de sitio web'], 'quantity' => 1],
            ],
            issueDate: now()->subDays(8),
        );
        $approvedNoPlan->generateApprovalToken();
        $approvedNoPlan->status = QuotationStatus::Approved;
        $approvedNoPlan->approved_at = now()->subDays(7);
        $approvedNoPlan->save();
        $contractGenerator->generate($approvedNoPlan);

        // 5. Rechazada
        $rejected = $this->createQuotation(
            client: Client::where('name', 'Fundación EducaChile')->first(),
            items: [
                ['product' => $products['Consultoría e implementación TI'], 'quantity' => 15],
            ],
            issueDate: now()->subDays(12),
        );
        $rejected->generateApprovalToken();
        $rejected->status = QuotationStatus::Rejected;
        $rejected->rejected_at = now()->subDays(10);
        $rejected->save();
    }

    private function createQuotation(Client $client, array $items, $issueDate, $validUntil = null): Quotation
    {
        $quotation = Quotation::create([
            'folio' => Quotation::nextFolio(),
            'client_id' => $client->id,
            'status' => QuotationStatus::Draft,
            'issue_date' => $issueDate,
            'valid_until' => $validUntil,
            'tax_rate' => 19,
        ]);

        foreach ($items as $item) {
            /** @var Product $product */
            $product = $item['product'];
            $quantity = $item['quantity'];
            $unitPrice = (float) $product->unit_price;

            $quotation->items()->create([
                'product_id' => $product->id,
                'description' => $product->name,
                'quantity' => $quantity,
                'unit_price' => $unitPrice,
                'subtotal' => round($quantity * $unitPrice, 2),
            ]);
        }

        $quotation->load('items');
        $quotation->recalculateTotals();
        $quotation->save();

        return $quotation;
    }
}

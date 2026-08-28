<?php

use App\Enums\QuotationStatus;
use App\Models\Client;
use App\Models\Contract;
use App\Models\Quotation;
use App\Services\ContractGenerator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(RefreshDatabase::class);

test('generates contract for approved quotation idempotently', function () {
    $client = Client::create([
        'name' => 'Empresa Test SpA',
        'rut' => '76.123.456-7',
        'email' => 'contacto@test.cl',
    ]);

    $quotation = Quotation::create([
        'folio' => 'COT-9999',
        'client_id' => $client->id,
        'status' => QuotationStatus::Approved,
        'issue_date' => now(),
        'subtotal' => 500000,
        'tax_rate' => 19,
        'tax_amount' => 95000,
        'total' => 595000,
    ]);

    $generator = new ContractGenerator();
    $contract1 = $generator->generate($quotation);

    expect($contract1)->toBeInstanceOf(Contract::class)
        ->and($contract1->quotation_id)->toBe($quotation->id)
        ->and($contract1->client_id)->toBe($client->id);

    // Call generate a second time for the same quotation
    $contract2 = $generator->generate($quotation->fresh(['contract']));

    expect($contract2->id)->toBe($contract1->id);
});

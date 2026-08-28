<?php

use App\Enums\QuotationStatus;
use App\Mail\QuotationResponseMail;
use App\Models\Client;
use App\Models\Quotation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;

uses(RefreshDatabase::class);

test('sends email notification to company email when quotation is approved', function () {
    Mail::fake();

    $client = Client::create([
        'name' => 'Cliente Test SpA',
        'rut' => '76.987.654-3',
        'email' => 'cliente@test.cl',
    ]);

    $quotation = Quotation::create([
        'folio' => 'COT-1001',
        'client_id' => $client->id,
        'status' => QuotationStatus::Sent,
        'issue_date' => now(),
        'valid_until' => now()->addDays(15),
        'subtotal' => 100000,
        'tax_rate' => 19,
        'tax_amount' => 19000,
        'total' => 119000,
        'approval_token' => 'test-approval-token-approved',
    ]);

    $response = $this->post(route('public.quotations.approve', $quotation->approval_token));

    $response->assertRedirect(route('public.quotations.show', $quotation->approval_token));

    expect($quotation->fresh()->status)->toBe(QuotationStatus::Approved);

    Mail::assertSent(QuotationResponseMail::class, function (QuotationResponseMail $mail) use ($quotation) {
        return $mail->hasTo('jcornejo@proscom.cl') &&
            $mail->quotation->id === $quotation->id &&
            $mail->responseStatus === 'aprobada';
    });
});

test('sends email notification to company email when quotation is rejected', function () {
    Mail::fake();

    $client = Client::create([
        'name' => 'Cliente Test SpA',
        'rut' => '76.987.654-3',
        'email' => 'cliente@test.cl',
    ]);

    $quotation = Quotation::create([
        'folio' => 'COT-1002',
        'client_id' => $client->id,
        'status' => QuotationStatus::Sent,
        'issue_date' => now(),
        'valid_until' => now()->addDays(15),
        'subtotal' => 200000,
        'tax_rate' => 19,
        'tax_amount' => 38000,
        'total' => 238000,
        'approval_token' => 'test-approval-token-rejected',
    ]);

    $response = $this->post(route('public.quotations.reject', $quotation->approval_token));

    $response->assertRedirect(route('public.quotations.show', $quotation->approval_token));

    expect($quotation->fresh()->status)->toBe(QuotationStatus::Rejected);

    Mail::assertSent(QuotationResponseMail::class, function (QuotationResponseMail $mail) use ($quotation) {
        return $mail->hasTo('jcornejo@proscom.cl') &&
            $mail->quotation->id === $quotation->id &&
            $mail->responseStatus === 'rechazada';
    });
});

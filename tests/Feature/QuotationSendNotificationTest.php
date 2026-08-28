<?php

use App\Enums\QuotationStatus;
use App\Mail\QuotationSentMail;
use App\Models\Client;
use App\Models\Quotation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;

uses(RefreshDatabase::class);

test('sends quotation email to client with BCC to company email', function () {
    Mail::fake();

    $user = User::factory()->create();

    $client = Client::create([
        'name' => 'Cliente Envío SpA',
        'rut' => '77.111.222-3',
        'email' => 'cliente.envio@test.cl',
    ]);

    $quotation = Quotation::create([
        'folio' => 'COT-2001',
        'client_id' => $client->id,
        'status' => QuotationStatus::Draft,
        'issue_date' => now(),
        'valid_until' => now()->addDays(10),
        'subtotal' => 300000,
        'tax_rate' => 19,
        'tax_amount' => 57000,
        'total' => 357000,
    ]);

    $response = $this->actingAs($user)->post(route('cotizaciones.send', $quotation));

    $response->assertRedirect();

    expect($quotation->fresh()->status)->toBe(QuotationStatus::Sent);

    Mail::assertSent(QuotationSentMail::class, function (QuotationSentMail $mail) use ($client) {
        return $mail->hasTo('cliente.envio@test.cl') &&
            $mail->hasBcc('jcornejo@proscom.cl');
    });
});

<?php

namespace App\Mail;

use App\Models\Quotation;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class QuotationResponseMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Quotation $quotation,
        public string $responseStatus,
    ) {}

    public function envelope(): Envelope
    {
        $actionText = strtolower($this->responseStatus) === 'aprobada' ? 'APROBADA' : 'RECHAZADA';
        $clientName = $this->quotation->client?->name ?? 'el cliente';

        return new Envelope(
            subject: "Cotización {$this->quotation->folio} fue {$actionText} por {$clientName}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.quotation-response',
        );
    }
}

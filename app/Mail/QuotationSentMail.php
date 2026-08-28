<?php

namespace App\Mail;

use App\Models\Quotation;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class QuotationSentMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Quotation $quotation,
        public string $approvalUrl,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Cotización {$this->quotation->folio}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.quotation-sent',
        );
    }
}

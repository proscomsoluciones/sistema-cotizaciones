<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DailyAlertsMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Collection $expired,
        public Collection $expiringSoon,
        public Collection $overduePayments,
        public Collection $paymentsDueSoon,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Alertas del sistema de cotizaciones — '.now()->format('d/m/Y'),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.daily-alerts',
        );
    }
}

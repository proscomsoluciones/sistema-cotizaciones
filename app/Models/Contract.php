<?php

namespace App\Models;

use App\Enums\PaymentStatus;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Contract extends Model
{
    use HasFactory;

    protected $appends = ['paid_total', 'pending_total'];

    protected $fillable = [
        'quotation_id',
        'client_id',
        'contract_number',
        'start_date',
        'end_date',
        'total_amount',
        'terms',
        'pdf_path',
        'generated_at',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date:Y-m-d',
            'end_date' => 'date:Y-m-d',
            'total_amount' => 'decimal:2',
            'generated_at' => 'datetime',
        ];
    }

    public function quotation(): BelongsTo
    {
        return $this->belongsTo(Quotation::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(ContractPayment::class)->orderBy('order')->orderBy('id');
    }

    protected function paidTotal(): Attribute
    {
        return Attribute::make(
            get: fn (): float => (float) $this->payments
                ->where('status', PaymentStatus::Paid)
                ->sum(fn (ContractPayment $payment) => $payment->paid_amount ?? $payment->amount),
        );
    }

    protected function pendingTotal(): Attribute
    {
        return Attribute::make(
            get: fn (): float => (float) $this->payments
                ->where('status', PaymentStatus::Pending)
                ->sum(fn (ContractPayment $payment) => (float) $payment->amount),
        );
    }

    public static function nextContractNumber(): string
    {
        $last = static::query()->orderByDesc('id')->first();
        $number = $last ? ((int) substr($last->contract_number, 4)) + 1 : 1;

        return 'CON-'.str_pad((string) $number, 4, '0', STR_PAD_LEFT);
    }
}

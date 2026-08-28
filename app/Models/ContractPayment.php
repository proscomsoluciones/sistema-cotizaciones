<?php

namespace App\Models;

use App\Enums\PaymentStatus;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContractPayment extends Model
{
    use HasFactory;

    protected $appends = ['is_overdue'];

    protected $fillable = [
        'contract_id',
        'label',
        'percentage',
        'amount',
        'due_date',
        'status',
        'paid_at',
        'paid_amount',
        'payment_method',
        'notes',
        'order',
    ];

    protected function casts(): array
    {
        return [
            'status' => PaymentStatus::class,
            'percentage' => 'decimal:2',
            'amount' => 'decimal:2',
            'paid_amount' => 'decimal:2',
            'due_date' => 'date:Y-m-d',
            'paid_at' => 'date:Y-m-d',
        ];
    }

    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class);
    }

    protected function isOverdue(): Attribute
    {
        return Attribute::make(
            get: fn (): bool => $this->status === PaymentStatus::Pending
                && $this->due_date !== null
                && $this->due_date->isPast(),
        );
    }
}

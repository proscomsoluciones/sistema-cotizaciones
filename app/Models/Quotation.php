<?php

namespace App\Models;

use App\Enums\QuotationStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class Quotation extends Model
{
    use HasFactory;

    protected $fillable = [
        'folio',
        'client_id',
        'status',
        'issue_date',
        'valid_until',
        'subtotal',
        'tax_rate',
        'tax_amount',
        'total',
        'notes',
        'approval_token',
        'sent_at',
        'approved_at',
        'rejected_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => QuotationStatus::class,
            'issue_date' => 'date:Y-m-d',
            'valid_until' => 'date:Y-m-d',
            'subtotal' => 'decimal:2',
            'tax_rate' => 'decimal:2',
            'tax_amount' => 'decimal:2',
            'total' => 'decimal:2',
            'sent_at' => 'datetime',
            'approved_at' => 'datetime',
            'rejected_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Quotation $quotation) {
            $quotation->folio ??= static::nextFolio();
        });
    }

    public static function nextFolio(): string
    {
        $last = static::query()->orderByDesc('id')->first();
        $number = $last ? ((int) substr($last->folio, 4)) + 1 : 1;

        return 'COT-'.str_pad((string) $number, 4, '0', STR_PAD_LEFT);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(QuotationItem::class);
    }

    public function contract(): HasOne
    {
        return $this->hasOne(Contract::class);
    }

    public function recalculateTotals(): void
    {
        $subtotal = $this->items->sum(fn (QuotationItem $item) => (float) $item->subtotal);
        $taxAmount = round($subtotal * ((float) $this->tax_rate / 100), 2);

        $this->subtotal = $subtotal;
        $this->tax_amount = $taxAmount;
        $this->total = $subtotal + $taxAmount;
    }

    public function generateApprovalToken(): string
    {
        $this->approval_token = Str::random(48);

        return $this->approval_token;
    }
}

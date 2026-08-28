<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'unit_price',
        'unit',
        'sku',
        'active',
    ];

    protected function casts(): array
    {
        return [
            'unit_price' => 'decimal:2',
            'active' => 'boolean',
        ];
    }
}

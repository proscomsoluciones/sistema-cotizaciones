<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MarkPaymentPaidRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'paid_at' => ['required', 'date'],
            'paid_amount' => ['required', 'numeric', 'min:0.01'],
            'payment_method' => ['required', 'in:transferencia,efectivo,tarjeta,cheque,otro'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}

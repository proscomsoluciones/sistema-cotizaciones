<?php

namespace App\Http\Requests;

use App\Enums\PaymentStatus;
use Illuminate\Foundation\Http\FormRequest;

class UpdateContractPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->route('payment')->status === PaymentStatus::Pending;
    }

    public function rules(): array
    {
        return [
            'label' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'due_date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}

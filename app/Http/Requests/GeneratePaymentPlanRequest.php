<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GeneratePaymentPlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'template' => ['required', 'in:50_50,25_75,installments'],
            'installments_count' => ['required_if:template,installments', 'integer', 'min:2', 'max:24'],
        ];
    }
}

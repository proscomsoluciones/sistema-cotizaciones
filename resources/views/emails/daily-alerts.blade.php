<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Alertas del sistema</title>
</head>
<body style="margin:0; padding:0; background-color:#f1f5f9; font-family: Arial, Helvetica, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9; padding: 32px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
                    <tr>
                        <td style="background-color:#ffffff; padding: 24px 32px; border-bottom: 3px solid #082c50;">
                            <img src="{{ \App\Support\Company::emailLogoBase64() }}" alt="Proscom" style="height: 26px;">
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 32px;">
                            <p style="margin:0 0 4px; font-size:12px; letter-spacing:0.04em; text-transform:uppercase; color:#082c50; font-weight:bold;">
                                Resumen diario
                            </p>
                            <p style="margin:0 0 24px; font-size:15px; color:#1a1a1a;">
                                Esto es lo que necesita tu atención hoy, {{ now()->translatedFormat('d \d\e F \d\e Y') }}.
                            </p>

                            @if($expired->isNotEmpty())
                                <p style="margin:0 0 8px; font-size:13px; font-weight:bold; color:#b91c1c;">Cotizaciones que vencieron hoy sin respuesta</p>
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                                    @foreach($expired as $quotation)
                                        <tr>
                                            <td style="padding:8px 12px; font-size:13px; color:#1a1a1a; background-color:#fef2f2; border-bottom:1px solid #fee2e2;">
                                                <strong>{{ $quotation->folio }}</strong> — {{ $quotation->client->name }} ({{ \App\Support\Money::clp($quotation->total) }})
                                            </td>
                                        </tr>
                                    @endforeach
                                </table>
                            @endif

                            @if($expiringSoon->isNotEmpty())
                                <p style="margin:0 0 8px; font-size:13px; font-weight:bold; color:#b45309;">Cotizaciones por vencer en los próximos días</p>
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                                    @foreach($expiringSoon as $quotation)
                                        <tr>
                                            <td style="padding:8px 12px; font-size:13px; color:#1a1a1a; background-color:#fffbeb; border-bottom:1px solid #fef3c7;">
                                                <strong>{{ $quotation->folio }}</strong> — {{ $quotation->client->name }} — vence el {{ $quotation->valid_until->format('d/m/Y') }}
                                            </td>
                                        </tr>
                                    @endforeach
                                </table>
                            @endif

                            @if($overduePayments->isNotEmpty())
                                <p style="margin:0 0 8px; font-size:13px; font-weight:bold; color:#b91c1c;">Pagos atrasados</p>
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                                    @foreach($overduePayments as $payment)
                                        <tr>
                                            <td style="padding:8px 12px; font-size:13px; color:#1a1a1a; background-color:#fef2f2; border-bottom:1px solid #fee2e2;">
                                                <strong>{{ $payment->contract->contract_number }}</strong> ({{ $payment->contract->client->name }}) —
                                                {{ $payment->label }}: {{ \App\Support\Money::clp($payment->amount) }},
                                                vencido desde el {{ $payment->due_date->format('d/m/Y') }}
                                            </td>
                                        </tr>
                                    @endforeach
                                </table>
                            @endif

                            @if($paymentsDueSoon->isNotEmpty())
                                <p style="margin:0 0 8px; font-size:13px; font-weight:bold; color:#b45309;">Pagos por vencer en los próximos días</p>
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
                                    @foreach($paymentsDueSoon as $payment)
                                        <tr>
                                            <td style="padding:8px 12px; font-size:13px; color:#1a1a1a; background-color:#fffbeb; border-bottom:1px solid #fef3c7;">
                                                <strong>{{ $payment->contract->contract_number }}</strong> ({{ $payment->contract->client->name }}) —
                                                {{ $payment->label }}: {{ \App\Support\Money::clp($payment->amount) }},
                                                vence el {{ $payment->due_date->format('d/m/Y') }}
                                            </td>
                                        </tr>
                                    @endforeach
                                </table>
                            @endif

                            <hr style="border:none; border-top:1px solid #e5e7eb; margin:24px 0 0;">

                            <p style="margin:16px 0 0; font-size:12px; color:#888;">
                                Este correo se genera automáticamente todos los días. Puedes revisar el detalle completo en el sistema.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color:#f8fafc; padding: 20px 32px; text-align:center; font-size:11px; color:#94a3b8; line-height:1.6;">
                            <strong style="color:#64748b;">{{ config('company.name') }}</strong><br>
                            {{ config('company.address') }}<br>
                            {{ config('company.email') }} · {{ config('company.phone') }}
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>

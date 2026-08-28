<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Respuesta de Cotización {{ $quotation->folio }}</title>
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
                            @php
                                $isApproved = strtolower($responseStatus) === 'aprobada';
                                $statusLabel = $isApproved ? 'APROBADA' : 'RECHAZADA';
                                $bgColor = $isApproved ? '#f0fdf4' : '#fef2f2';
                                $borderColor = $isApproved ? '#bbf7d0' : '#fee2e2';
                                $textColor = $isApproved ? '#15803d' : '#b91c1c';
                                $responseDate = $isApproved
                                    ? ($quotation->approved_at ? $quotation->approved_at->format('d/m/Y H:i') : now()->format('d/m/Y H:i'))
                                    : ($quotation->rejected_at ? $quotation->rejected_at->format('d/m/Y H:i') : now()->format('d/m/Y H:i'));
                            @endphp

                            <div style="background-color: {{ $bgColor }}; border: 1px solid {{ $borderColor }}; border-radius: 8px; padding: 16px; margin-bottom: 24px; text-align: center;">
                                <p style="margin:0; font-size:12px; letter-spacing:0.05em; text-transform:uppercase; color: {{ $textColor }}; font-weight:bold;">
                                    Notificación de Cotización
                                </p>
                                <h2 style="margin:4px 0 0; font-size:20px; color: {{ $textColor }};">
                                    La cotización {{ $quotation->folio }} ha sido {{ $statusLabel }}
                                </h2>
                            </div>

                            <p style="margin:0 0 16px; font-size:15px; color:#1a1a1a; line-height:1.6;">
                                El cliente <strong>{{ $quotation->client?->name }}</strong> ha respondido a la cotización <strong>{{ $quotation->folio }}</strong>.
                            </p>

                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px; border:1px solid #e2e8f0; border-radius:8px; border-collapse:separate; overflow:hidden;">
                                <tr style="background-color:#f8fafc;">
                                    <td style="padding:12px 16px; font-size:13px; font-weight:bold; color:#475569; border-bottom:1px solid #e2e8f0;" colspan="2">
                                        Detalles de la Cotización
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:10px 16px; font-size:14px; color:#64748b; border-bottom:1px solid #f1f5f9;">Folio:</td>
                                    <td style="padding:10px 16px; font-size:14px; color:#0f172a; font-weight:bold; border-bottom:1px solid #f1f5f9;">{{ $quotation->folio }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:10px 16px; font-size:14px; color:#64748b; border-bottom:1px solid #f1f5f9;">Cliente:</td>
                                    <td style="padding:10px 16px; font-size:14px; color:#0f172a; border-bottom:1px solid #f1f5f9;">{{ $quotation->client?->name }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:10px 16px; font-size:14px; color:#64748b; border-bottom:1px solid #f1f5f9;">Monto Total:</td>
                                    <td style="padding:10px 16px; font-size:14px; color:#0f172a; font-weight:bold; border-bottom:1px solid #f1f5f9;">{{ \App\Support\Money::clp($quotation->total) }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:10px 16px; font-size:14px; color:#64748b; border-bottom:1px solid #f1f5f9;">Fecha de respuesta:</td>
                                    <td style="padding:10px 16px; font-size:14px; color:#0f172a; border-bottom:1px solid #f1f5f9;">{{ $responseDate }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:10px 16px; font-size:14px; color:#64748b;">Estado:</td>
                                    <td style="padding:10px 16px; font-size:14px; font-weight:bold; color: {{ $textColor }};">{{ $statusLabel }}</td>
                                </tr>
                            </table>

                            @if($isApproved)
                                <p style="margin:0 0 24px; font-size:14px; color:#15803d; background-color:#f0fdf4; padding:12px 16px; border-radius:6px; border-left:4px solid #16a34a; line-height:1.5;">
                                    <strong>Contrato Generado:</strong> El contrato asociado a esta cotización se ha generado automáticamente en la plataforma.
                                </p>
                            @endif

                            <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:16px;">
                                <tr>
                                    <td style="border-radius:8px; background-color:#082c50;">
                                        <a href="{{ route('cotizaciones.show', $quotation) }}" style="display:inline-block; padding:12px 28px; font-size:14px; font-weight:bold; color:#ffffff; text-decoration:none; border-radius:8px;">
                                            Ver Cotización en el Sistema
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <hr style="border:none; border-top:1px solid #e5e7eb; margin:28px 0;">

                            <p style="margin:0; font-size:12px; color:#888; line-height:1.6;">
                                Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
                                <a href="{{ route('cotizaciones.show', $quotation) }}" style="color:#082c50;">{{ route('cotizaciones.show', $quotation) }}</a>
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

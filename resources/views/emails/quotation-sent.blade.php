<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cotización {{ $quotation->folio }}</title>
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
                            <p style="margin:0 0 16px; font-size:15px; color:#1a1a1a;">Hola {{ $quotation->client->name }},</p>

                            <p style="margin:0 0 16px; font-size:15px; color:#1a1a1a; line-height:1.6;">
                                Hemos preparado la propuesta técnica y económica correspondiente a la cotización
                                <strong>{{ $quotation->folio }}</strong>.
                            </p>

                            <p style="margin:0 0 24px; font-size:15px; color:#1a1a1a; line-height:1.6;">
                                Puedes revisar el detalle de los servicios, plazos y condiciones haciendo clic en el siguiente botón:
                            </p>

                            <table role="presentation" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="border-radius:8px; background-color:#082c50;">
                                        <a href="{{ $approvalUrl }}" style="display:inline-block; padding:12px 28px; font-size:14px; font-weight:bold; color:#ffffff; text-decoration:none; border-radius:8px;">
                                            Revisar y Gestionar Cotización
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            @if($quotation->valid_until)
                                <p style="margin:24px 0 0; font-size:13px; color:#555;">
                                    Esta cotización es válida hasta el {{ $quotation->valid_until->format('d/m/Y') }}.
                                </p>
                            @endif

                            <hr style="border:none; border-top:1px solid #e5e7eb; margin:28px 0;">

                            <p style="margin:0; font-size:12px; color:#888; line-height:1.6;">
                                Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
                                <a href="{{ $approvalUrl }}" style="color:#082c50;">{{ $approvalUrl }}</a>
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

<?php
use App\Support\Money;

$conditions = [
    'El alcance se limita a lo descrito en la sección de detalle de tareas. Cambios adicionales al alcance se cotizan por separado.',
    'La aprobación de esta cotización se entiende como autorización para iniciar el trabajo.',
];
if ($quotation->valid_until) {
    array_unshift($conditions, 'Esta cotización es válida hasta el '.$quotation->valid_until->format('d/m/Y').'.');
}

$sectionNumber = 0;
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Cotización {{ $quotation->folio }}</title>
    <style>
        body { font-family: "DejaVu Sans", sans-serif; font-size: 10.5px; color: #1a1a1a; line-height: 1.5; }
        .header { width: 100%; border-bottom: 2px solid #0A2540; padding-bottom: 8px; margin-bottom: 12px; }
        .header td { border: none; vertical-align: middle; }
        .header .meta { text-align: right; font-size: 9.5px; color: #444; line-height: 1.5; white-space: nowrap; }
        .doc-title { font-size: 13.5px; font-weight: bold; color: #0A2540; margin: 12px 0 14px 0; text-transform: uppercase; letter-spacing: 0.4px; text-align: center; }
        .parties { width: 100%; margin-bottom: 16px; }
        .parties td { border: none; width: 50%; vertical-align: top; font-size: 10px; line-height: 1.5; }
        .parties .label { font-weight: bold; color: #0A2540; }
        h2 { font-size: 12px; color: #0A2540; margin: 14px 0 6px 0; font-weight: bold; }
        p { text-align: justify; margin: 0 0 6px; }
        ul { margin: 4px 0 12px 16px; padding: 0; }
        li { margin-bottom: 3px; }
        table.data { width: 100%; border-collapse: collapse; margin: 6px 0 12px; }
        table.data th { background-color: #0A2540; color: #fff; padding: 6px 8px; text-align: left; font-size: 10px; }
        table.data td { padding: 6px 8px; font-size: 10px; border-bottom: 1px solid #e5e7eb; }
        table.data tbody tr:nth-child(even) { background-color: #f0f4f8; }
        table.data td.num, table.data th.num { text-align: right; }
        table.summary { width: 100%; border-collapse: collapse; margin: 6px 0 4px; }
        table.summary td { padding: 6px 8px; font-size: 10px; border-bottom: 1px solid #e5e7eb; }
        table.summary td.label { color: #444; }
        table.summary td.value { text-align: right; }
        table.summary tr.total td { background-color: #f0f4f8; font-weight: bold; font-size: 11.5px; border-bottom: none; }
        .caption { font-size: 8.5px; color: #888; font-style: italic; margin-top: 4px; margin-bottom: 12px; }
        .signatures { width: 100%; margin-top: 110px; margin-bottom: 25px; }
        .signatures td { border: none; text-align: center; vertical-align: top; font-size: 10px; }
        .signature-line { border-top: 1px solid #333; width: 190px; margin: 0 auto 6px auto; }
        .footer { position: absolute; bottom: 0px; left: 0px; right: 0px; font-size: 8.5px; color: #888; border-top: 1px solid #eee; padding-top: 6px; }
    </style>
</head>
<body>
    <table class="header">
        <tr>
            <td style="width: 50%;">
                <img src="{{ $logo }}" style="height: 38px; max-width: 220px;">
            </td>
            <td class="meta" style="width: 50%;">
                N.º {{ $quotation->folio }}<br>
                Fecha: {{ $quotation->issue_date->translatedFormat('d \d\e F \d\e Y') }}<br>
                @if($quotation->valid_until)
                    Válida hasta: {{ $quotation->valid_until->format('d/m/Y') }}
                @endif
            </td>
        </tr>
    </table>

    <div class="doc-title">
        COTIZACIÓN DE SERVICIOS DE DESARROLLO
    </div>

    <table class="parties">
        <tr>
            <td style="width: 50%;">
                <div class="label" style="margin-bottom: 3px;">Preparado para:</div>
                <strong>{{ $quotation->client->name }}</strong>
                @if($quotation->client->tax_id)
                    <br>RUT: {{ $quotation->client->tax_id }}
                @endif
                @if($quotation->client->email || $quotation->client->phone)
                    <br>{{ implode(' · ', array_filter([$quotation->client->email, $quotation->client->phone])) }}
                @endif
            </td>
            <td style="width: 50%; text-align: right;">
                <div class="label" style="margin-bottom: 3px;">Preparado por:</div>
                <strong>{{ config('company.name') }}</strong>
                @if(config('company.rut'))
                    <br>RUT: {{ config('company.rut') }}
                @endif
                @if(config('company.email') || config('company.phone'))
                    <br>{{ implode(' · ', array_filter([config('company.email'), config('company.phone')])) }}
                @endif
            </td>
        </tr>
    </table>

    @if($quotation->notes)
        <h2>{{ ++$sectionNumber }}. Objetivo del trabajo</h2>
        <p>{{ $quotation->notes }}</p>
    @endif

    <h2>{{ ++$sectionNumber }}. Detalle de tareas y tiempos estimados</h2>
    <table class="data">
        <thead>
            <tr>
                <th style="width: 6%;">#</th>
                <th>Descripción</th>
                <th class="num" style="width: 14%;">Cantidad</th>
                <th class="num" style="width: 18%;">Precio unitario</th>
                <th class="num" style="width: 18%;">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            @foreach($quotation->items as $index => $item)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>{{ $item->description }}</td>
                    <td class="num">{{ rtrim(rtrim(number_format((float) $item->quantity, 2), '0'), '.') }}</td>
                    <td class="num">{{ Money::clp($item->unit_price) }}</td>
                    <td class="num">{{ Money::clp($item->subtotal) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <h2>{{ ++$sectionNumber }}. Tiempo total y costo estimado</h2>
    <table class="summary">
        <tr>
            <td class="label">Subtotal</td>
            <td class="value">{{ Money::clp($quotation->subtotal) }}</td>
        </tr>
        <tr>
            <td class="label">Impuesto ({{ number_format((float) $quotation->tax_rate, 2) }}%)</td>
            <td class="value">{{ Money::clp($quotation->tax_amount) }}</td>
        </tr>
        <tr class="total">
            <td>Costo total</td>
            <td class="value">{{ Money::clp($quotation->total) }}</td>
        </tr>
    </table>
    <p class="caption">Valor a todo costo por el alcance descrito en la sección anterior.</p>

    <h2>{{ ++$sectionNumber }}. Condiciones</h2>
    <ul>
        @foreach($conditions as $condition)
            <li>{{ $condition }}</li>
        @endforeach
    </ul>

    <table class="signatures">
        <tr>
            <td style="width: 44%;">
                <div class="signature-line"></div>
                <strong>{{ config('company.representative_name') }}</strong><br>
                @if(config('company.representative_rut'))
                    RUT {{ config('company.representative_rut') }}<br>
                @endif
                <span style="color: #555; font-size: 9.5px;">PROSCOM SPA</span>
            </td>
            <td style="width: 12%;"></td>
            <td style="width: 44%;">
                <div class="signature-line"></div>
                <strong>{{ $quotation->client->legal_representative_name ?: $quotation->client->name }}</strong><br>
                @if($quotation->client->legal_representative_rut)
                    RUT {{ $quotation->client->legal_representative_rut }}<br>
                @elseif($quotation->client->tax_id)
                    RUT {{ $quotation->client->tax_id }}<br>
                @endif
                <span style="color: #555; font-size: 9.5px;">{{ $quotation->client->name }}</span>
            </td>
        </tr>
    </table>

    <div class="footer">
        {{ config('company.name') }} · {{ config('company.email') }} · {{ config('company.phone') }}
    </div>
</body>
</html>

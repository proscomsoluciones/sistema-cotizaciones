<?php
use App\Support\Money;
use App\Support\NumberToWordsEs;

$client = $contract->client;
$quotation = $contract->quotation;

$serviceLines = array_filter(array_map('trim', explode("\n", (string) $contract->terms)));
if (empty($serviceLines)) {
    $serviceLines = $quotation?->items->pluck('description')->all() ?? [];
}

$clientRepName = $client->legal_representative_name ?: '[NOMBRE REPRESENTANTE CLIENTE]';
$clientRepRut = $client->legal_representative_rut ?: '[RUT REPRESENTANTE CLIENTE]';
$clientRepReference = $client->legal_representative_reference ?: '[SEÑALAR ESCRITURA PÚBLICA U OTRO ANTECEDENTE]';
$clientRut = $client->tax_id ?: '[RUT CLIENTE]';
$clientAddress = $client->address ?: '[DOMICILIO CLIENTE]';

$signDate = $contract->generated_at ?? now();
$dateFormatted = $signDate->translatedFormat('d \d\e F \d\e Y');

$amountInt = (int) round((float) $contract->total_amount);
$amountWords = NumberToWordsEs::pesos($amountInt);

$paymentDescription = 'conforme a lo acordado entre las partes, contra la(s) factura(s) que emita PROSCOM.';
if ($contract->payments->isNotEmpty()) {
    $paymentDescription = 'según el siguiente plan de pagos: '.$contract->payments
        ->sortBy('order')
        ->map(fn ($payment) => $payment->label.' ('.Money::clp($payment->amount).')'.($payment->due_date ? ' al '.$payment->due_date->format('d/m/Y') : ''))
        ->implode('; ').'.';
}

$plazoDescription = 'contado desde el '.$contract->start_date->format('d/m/Y');
$plazoDescription .= $contract->end_date
    ? ' y hasta el '.$contract->end_date->format('d/m/Y')
    : ', y hasta la total ejecución o conclusión de los Servicios y bolsas de horas contratadas descritos en la cláusula SEGUNDO';
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Contrato {{ $contract->contract_number }}</title>
    <style>
        body { font-family: "DejaVu Sans", sans-serif; font-size: 12px; color: #1a1a1a; line-height: 1.5; }
        .header { width: 100%; margin-bottom: 10px; }
        .header td { border: none; vertical-align: top; }
        .header .company-info { text-align: right; font-size: 9px; color: #555; line-height: 1.4; }
        h1 { font-size: 16px; text-align: center; color: #0A2540; margin: 10px 0 20px; }
        p { text-align: justify; margin: 0 0 10px; }
        .clause-title { font-weight: bold; }
        ul { margin: 4px 0 10px 18px; padding: 0; }
        li { margin-bottom: 4px; }
        table.data { width: 100%; border-collapse: collapse; margin: 10px 0; }
        table.data th, table.data td { border: 1px solid #ccc; padding: 5px 7px; font-size: 10px; text-align: left; }
        table.data th { background-color: #0A2540; color: #fff; }
        .pending { color: #b91c1c; }
        .signatures { width: 100%; margin-top: 110px; margin-bottom: 25px; }
        .signatures td { border: none; text-align: center; vertical-align: top; font-size: 10px; }
        .signature-line { border-top: 1px solid #333; width: 190px; margin: 0 auto 6px auto; }
        .footer { margin-top: 30px; font-size: 9px; color: #888; border-top: 1px solid #eee; padding-top: 8px; }
    </style>
</head>
<body>
    <table class="header">
        <tr>
            <td style="width: 50%;">
                <img src="{{ $logo }}" style="height: 42px; max-width: 240px;">
            </td>
            <td class="company-info" style="width: 50%;">
                <strong>{{ config('company.name') }}</strong><br>
                RUT: {{ config('company.rut') }}<br>
                {{ config('company.address') }}
            </td>
        </tr>
    </table>

    <h1>CONTRATO DE PRESTACIÓN DE SERVICIOS<br>{{ $contract->contract_number }}</h1>

    <p>
        En {{ config('company.city') }}, a {{ $dateFormatted }}, por una parte, <strong>{{ config('company.name') }}</strong>,
        rol único tributario Nro. {{ config('company.rut') }}, sociedad del giro de actividades de {{ config('company.giro') }},
        en adelante indistintamente "el Prestador" o "PROSCOM", domiciliada para estos efectos en {{ config('company.address') }},
        debidamente representada por don <strong>{{ config('company.representative_name') }}</strong>,
        cédula de identidad Nro. {{ config('company.representative_rut') }}; y, por otra parte,
        <strong>{{ $client->name }}</strong>, rol único tributario Nro. {{ $clientRut }}, en adelante "el Cliente",
        domiciliado(a) para estos efectos en {{ $clientAddress }}, debidamente representado(a) por don/doña <strong>{{ $clientRepName }}</strong>,
        cédula de identidad Nro. {{ $clientRepRut }}, se ha convenido el siguiente contrato de prestación de servicios:
    </p>

    <p><span class="clause-title">PRIMERO: Antecedentes.</span>
        PROSCOM SPA es una sociedad cuyo giro corresponde a actividades de {{ config('company.giro') }}, y cuenta con
        los medios técnicos y profesionales necesarios para la prestación de los servicios que se describen en el
        presente instrumento. El Cliente ha manifestado su interés en contratar dichos servicios en los términos que
        a continuación se detallan.
    </p>

    <p><span class="clause-title">SEGUNDO: Objeto del contrato y descripción de los servicios.</span>
        En virtud del presente contrato, PROSCOM se obliga a prestar al Cliente los siguientes servicios (en adelante,
        los "Servicios"):
    </p>
    <ul>
        @forelse($serviceLines as $line)
            <li>{{ $line }}</li>
        @empty
            <li class="pending">(Sin servicios detallados en la cotización de origen)</li>
        @endforelse
    </ul>
    <p>El detalle específico del alcance, entregables y especificaciones técnicas de los Servicios se contiene en la
        cotización {{ $quotation?->folio }}, que forma parte integrante del presente contrato para todos los efectos legales.
    </p>

    <p><span class="clause-title">TERCERO: Plazo de ejecución y entregas.</span>
        Los Servicios se prestarán {{ $plazoDescription }}. Dicho plazo constituye el período máximo estipulado para la completa realización, desarrollo y entrega del trabajo terminado a entera conformidad del Cliente.
        Cualquier modificación de alcance, requerimiento adicional o nueva funcionalidad que no se encuentre expresamente contemplada en la cotización de origen deberá ser cotizada de forma independiente y requerirá la suscripción de un nuevo contrato o anexo de servicios.
    </p>

    <p><span class="clause-title">CUARTO: Precio y forma de pago.</span>
        El Cliente pagará a PROSCOM, como contraprestación por los Servicios, la suma de {{ Money::clp($contract->total_amount) }}
        ({{ $amountWords }}), pagadera {{ $paymentDescription }}
        El atraso en el pago devengará el interés máximo convencional permitido por la ley, sin perjuicio del derecho
        de PROSCOM a suspender la prestación de los Servicios conforme a la cláusula DÉCIMO TERCERO o a poner término
        al contrato conforme a la cláusula DÉCIMO CUARTO.
    </p>

    @if($contract->payments->isNotEmpty())
        <table class="data">
            <thead>
                <tr><th>Concepto</th><th>Monto</th><th>Vencimiento</th></tr>
            </thead>
            <tbody>
                @foreach($contract->payments->sortBy('order') as $payment)
                    <tr>
                        <td>{{ $payment->label }}</td>
                        <td>{{ Money::clp($payment->amount) }}</td>
                        <td>{{ $payment->due_date?->format('d/m/Y') ?? '—' }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    <p><span class="clause-title">QUINTO: Obligaciones del Prestador.</span> PROSCOM se obliga a:</p>
    <ul>
        <li>Prestar los Servicios con la diligencia, competencia técnica y estándares profesionales propios de su giro;</li>
        <li>Destinar el personal idóneo para la correcta ejecución de los Servicios;</li>
        <li>Informar oportunamente al Cliente sobre cualquier circunstancia que pudiere afectar el cumplimiento de los plazos o del objeto del contrato;</li>
        <li>Guardar la debida confidencialidad respecto de la información del Cliente a la que tenga acceso con ocasión del presente contrato.</li>
    </ul>

    <p><span class="clause-title">SEXTO: Obligaciones del Cliente.</span> El Cliente se obliga a:</p>
    <ul>
        <li>Pagar oportunamente el precio pactado en la cláusula CUARTO;</li>
        <li>Proporcionar la información, accesos y colaboración razonablemente necesarios para la correcta prestación de los Servicios;</li>
        <li>Utilizar los resultados de los Servicios conforme a su naturaleza y a la normativa vigente.</li>
    </ul>

    <p><span class="clause-title">SÉPTIMO: Confidencialidad.</span>
        Las partes se obligan a mantener estricta reserva y confidencialidad respecto de toda información técnica,
        comercial o de cualquier otra naturaleza de la que tomen conocimiento con ocasión de la ejecución del presente
        contrato, obligación que se mantendrá vigente incluso después de terminado el contrato, por un plazo de 2 años.
    </p>

    <p><span class="clause-title">OCTAVO: Propiedad intelectual.</span>
        Salvo pacto expreso en contrario, los desarrollos, informes, documentos y demás resultados generados por
        PROSCOM específicamente para el Cliente en el marco de este contrato serán de propiedad del Cliente una vez
        pagado íntegramente el precio pactado. PROSCOM conserva la propiedad de sus metodologías, herramientas,
        know-how y desarrollos preexistentes o de uso general, aun cuando sean utilizados en la prestación de los
        Servicios.
    </p>

    <p><span class="clause-title">NOVENO: Garantías.</span>
        PROSCOM declara que prestará los Servicios empleando un estándar de cuidado, diligencia y competencia técnica
        propio de su giro y conforme a las prácticas usuales de la industria. Salvo lo expresamente pactado, PROSCOM
        no otorga garantías adicionales, expresas o tácitas, respecto de los Servicios, incluyendo, sin limitación,
        garantías de idoneidad para un propósito específico distinto del expresamente convenido, ausencia total de
        errores, o compatibilidad con sistemas, plataformas o desarrollos de terceros no informados previamente por el
        Cliente.
    </p>

    <p><span class="clause-title">DÉCIMO: Limitación de responsabilidad.</span>
        En la máxima medida permitida por la legislación chilena, la responsabilidad total de PROSCOM frente al
        Cliente por cualquier daño, perjuicio o reclamo derivado o relacionado con el presente contrato, sea de
        naturaleza contractual, extracontractual o de otra índole, no podrá exceder el monto total efectivamente
        pagado por el Cliente a PROSCOM en los tres (3) meses anteriores al hecho que origina la responsabilidad. En
        ningún caso PROSCOM responderá por lucro cesante, pérdida de datos, pérdida de oportunidades de negocio, daño
        moral o perjuicios indirectos o consecuenciales, salvo en los casos de dolo o culpa grave de PROSCOM, en que
        regirán las normas generales de responsabilidad contractual de los artículos 1547 y siguientes del Código
        Civil.
    </p>

    <p><span class="clause-title">UNDÉCIMO: Indemnidad.</span>
        El Cliente mantendrá indemne y liberará de toda responsabilidad a PROSCOM, sus socios, representantes,
        trabajadores y dependientes, frente a cualquier reclamo, acción judicial o extrajudicial, multa o perjuicio
        que se origine en: (i) el uso indebido, negligente o contrario a la ley que el Cliente o sus dependientes den
        a los resultados de los Servicios; (ii) información falsa, inexacta o incompleta proporcionada por el Cliente
        a PROSCOM; o (iii) el incumplimiento por parte del Cliente de la normativa legal, reglamentaria o sectorial
        aplicable a su giro o actividad.
    </p>

    <p><span class="clause-title">DUODÉCIMO: Caso fortuito o fuerza mayor.</span>
        Ninguna de las partes será responsable por el incumplimiento o retardo en el cumplimiento de sus obligaciones
        cuando este se deba a caso fortuito o fuerza mayor, en los términos del artículo 45 del Código Civil, tales
        como, sin limitación, fallas generalizadas de internet o de proveedores de infraestructura tecnológica, actos
        de autoridad, catástrofes naturales, pandemias o conflictos sociales. La parte afectada deberá comunicar dicha
        circunstancia a la otra dentro de un plazo razonable, adoptando las medidas necesarias para mitigar sus
        efectos y reanudar el cumplimiento de sus obligaciones tan pronto como ello sea posible.
    </p>

    <p><span class="clause-title">DÉCIMO TERCERO: Suspensión del servicio por incumplimiento de pago.</span>
        Sin perjuicio de lo señalado en la cláusula CUARTO, si el Cliente incurre en mora o simple retardo en el pago
        de cualquier suma adeudada por más de 15 días corridos, PROSCOM podrá suspender la prestación de los
        Servicios, previa comunicación escrita al Cliente, hasta la total regularización de los montos adeudados, sin
        que ello genere responsabilidad alguna para PROSCOM por los perjuicios que dicha suspensión pudiera ocasionar
        al Cliente.
    </p>

    <p><span class="clause-title">DÉCIMO CUARTO: Término anticipado.</span>
        El presente contrato podrá terminar anticipadamente por: (i) mutuo acuerdo de las partes; (ii) incumplimiento
        grave de las obligaciones de alguna de las partes, no subsanado dentro de 10 días hábiles contados desde la
        notificación escrita de la infracción; o (iii) por la sola voluntad de cualquiera de las partes, comunicada
        por escrito a la otra con a lo menos 30 días corridos de anticipación, caso en el cual el Cliente deberá pagar
        los Servicios efectivamente prestados hasta la fecha de término, sin derecho a devolución de lo ya pagado por
        Servicios ejecutados.
    </p>

    <p><span class="clause-title">DÉCIMO QUINTO: Independencia entre las partes.</span>
        Las partes dejan constancia que la relación que las une es de carácter estrictamente comercial y civil, no
        existiendo entre PROSCOM (ni su personal o dependientes) y el Cliente vínculo de subordinación o dependencia
        laboral de ningún tipo, siendo cada parte responsable exclusiva de sus propias obligaciones laborales,
        previsionales y tributarias respecto de su personal.
    </p>

    <p><span class="clause-title">DÉCIMO SEXTO: Cesión.</span>
        Ninguna de las partes podrá ceder, transferir o subcontratar, total o parcialmente, los derechos u
        obligaciones que emanan del presente contrato sin el consentimiento previo y escrito de la otra parte, salvo
        que se trate de una cesión a una sociedad relacionada o filial, o derivada de un proceso de reorganización
        societaria, fusión o adquisición, en cuyo caso bastará la notificación previa a la otra parte.
    </p>

    <p><span class="clause-title">DÉCIMO SÉPTIMO: Modificaciones.</span>
        Toda modificación al presente contrato deberá constar por escrito y ser suscrita por ambas partes, no teniendo
        valor alguno los acuerdos verbales o las prácticas reiteradas entre las partes que no consten de dicha forma.
    </p>

    <p><span class="clause-title">DÉCIMO OCTAVO: Protección de datos personales, seguridad de la información y cumplimiento normativo.</span>
        En el tratamiento de datos personales que pudiera derivarse de la ejecución del presente contrato, del uso del sistema o de los servicios web provistos, las partes se obligan a dar estricto cumplimiento a la legislación vigente sobre Protección de Datos Personales (Ley N.º 19.628 y Ley N.º 21.716 de Protección de Datos Personales en Chile), utilizando dichos datos de manera confidencial, segura y exclusivamente para los fines propios del cumplimiento de las obligaciones contractuales. Asimismo, las partes declaran conocer la Ley Nro. 20.393 sobre responsabilidad penal de las personas jurídicas y se obligan a no incurrir en actos contrarios a la probidad.
    </p>

    <p><span class="clause-title">DÉCIMO NOVENO: Notificaciones.</span>
        Toda comunicación o notificación entre las partes relativa a este contrato se entenderá válidamente efectuada
        si se realiza por escrito a los domicilios o correos electrónicos individualizados en la comparecencia, o a
        los que las partes informen posteriormente por el mismo medio. El correo electrónico de contacto de PROSCOM es
        {{ config('company.email') }}{{ $client->email ? ' y el del Cliente es '.$client->email : '' }}.
    </p>

    <p><span class="clause-title">VIGÉSIMO: Ley aplicable y arbitraje.</span>
        El presente contrato se rige e interpreta conforme a las leyes de la República de Chile. Cualquier dificultad
        que se produzca entre las partes con motivo de la interpretación, aplicación, cumplimiento, validez o
        terminación del presente contrato será resuelta por un árbitro arbitrador, nombrado de común acuerdo por las
        partes o, en subsidio, por la justicia ordinaria a petición de cualquiera de ellas, en contra de cuyas
        resoluciones no procederá recurso alguno, renunciando desde ya las partes a los recursos de casación en la
        forma por incompetencia y ultra petita.
    </p>

    <p><span class="clause-title">VIGÉSIMO PRIMERO: Gastos e impuestos.</span>
        Cada parte solventará los gastos e impuestos que, conforme a la ley, le correspondan con motivo de la
        celebración y ejecución del presente contrato.
    </p>

    <p><span class="clause-title">VIGÉSIMO SEGUNDO: Integridad del contrato y divisibilidad.</span>
        El presente contrato constituye el íntegro acuerdo entre las partes respecto de su objeto, y deja sin efecto
        cualquier negociación, entendimiento o acuerdo previo, verbal o escrito, entre ellas sobre la misma materia.
        Si alguna estipulación de este contrato fuere declarada nula, ilegal o inaplicable por un tribunal competente,
        dicha declaración no afectará la validez y eficacia de las restantes estipulaciones, las que se mantendrán
        plenamente vigentes.
    </p>

    <p><span class="clause-title">VIGÉSIMO TERCERO: Personería.</span>
        La personería de don {{ config('company.representative_name') }} para actuar en representación de PROSCOM SPA
        consta en {{ config('company.representative_reference') }}. La personería de {{ $clientRepName }} para actuar
        en representación de {{ $client->name }} @if($client->legal_representative_reference) consta en {{ $client->legal_representative_reference }}. @else consta debidamente acreditada. @endif
    </p>

    <p><span class="clause-title">VIGÉSIMO CUARTO: Ejemplares y firma.</span>
        El presente contrato se firma en dos ejemplares del mismo tenor y fecha, quedando uno en poder de cada parte.
        Las partes acuerdan que este contrato podrá suscribirse también mediante firma electrónica, simple o
        avanzada, conforme a la Ley Nro. 19.799 sobre Documentos Electrónicos, Firma Electrónica y Servicios de
        Certificación de dicha Firma, la que se entenderá para todos los efectos legales como manifestación válida y
        vinculante de la voluntad de las partes.
    </p>

    <table class="signatures">
        <tr>
            <td style="width: 44%;">
                <div class="signature-line"></div>
                <strong>{{ config('company.representative_name') }}</strong><br>
                RUT {{ config('company.representative_rut') }}<br>
                <span style="color: #555; font-size: 9.5px;">Por PROSCOM SPA</span>
            </td>
            <td style="width: 12%;"></td>
            <td style="width: 44%;">
                <div class="signature-line"></div>
                <strong>{{ $clientRepName }}</strong><br>
                RUT {{ $clientRepRut }}<br>
                <span style="color: #555; font-size: 9.5px;">Por {{ $client->name }}</span>
            </td>
        </tr>
    </table>

    <div class="footer">
        {{ config('company.name') }} · RUT {{ config('company.rut') }} · {{ config('company.address') }} · {{ config('company.email') }}
    </div>
</body>
</html>

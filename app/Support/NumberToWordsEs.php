<?php

namespace App\Support;

class NumberToWordsEs
{
    private const UNITS = [
        '', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve',
        'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve',
    ];

    private const TENS = [
        '', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa',
    ];

    private const HUNDREDS = [
        '', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos',
        'seiscientos', 'setecientos', 'ochocientos', 'novecientos',
    ];

    public static function convert(int $number): string
    {
        if ($number === 0) {
            return 'cero';
        }

        if ($number < 0) {
            return 'menos '.self::convert(-$number);
        }

        if ($number >= 1_000_000_000) {
            $billions = intdiv($number, 1_000_000_000);
            $rest = $number % 1_000_000_000;
            $prefix = $billions === 1 ? 'mil millones' : self::convert($billions).' mil millones';

            return trim($prefix.($rest > 0 ? ' '.self::convert($rest) : ''));
        }

        if ($number >= 1_000_000) {
            $millions = intdiv($number, 1_000_000);
            $rest = $number % 1_000_000;
            $prefix = $millions === 1 ? 'un millón' : self::convert($millions).' millones';

            return trim($prefix.($rest > 0 ? ' '.self::convert($rest) : ''));
        }

        if ($number >= 1000) {
            $thousands = intdiv($number, 1000);
            $rest = $number % 1000;
            $prefix = $thousands === 1 ? 'mil' : self::convert($thousands).' mil';

            return trim($prefix.($rest > 0 ? ' '.self::convert($rest) : ''));
        }

        if ($number >= 100) {
            $hundreds = intdiv($number, 100);
            $rest = $number % 100;

            if ($number === 100) {
                return 'cien';
            }

            return trim(self::HUNDREDS[$hundreds].($rest > 0 ? ' '.self::convert($rest) : ''));
        }

        if ($number < 20) {
            return self::UNITS[$number];
        }

        $tens = intdiv($number, 10);
        $units = $number % 10;

        if ($number < 30) {
            return $units === 0 ? 'veinte' : 'veinti'.self::UNITS[$units];
        }

        return trim(self::TENS[$tens].($units > 0 ? ' y '.self::UNITS[$units] : ''));
    }

    public static function pesos(int $amount): string
    {
        $words = self::convert($amount);

        return ucfirst($words).' pesos chilenos';
    }
}

<?php

namespace App\Support;

class Company
{
    public static function logoBase64(): string
    {
        return self::fileToBase64(config('company.logo_path'));
    }

    public static function emailLogoBase64(): string
    {
        return self::fileToBase64(config('company.logo_email_path'));
    }

    private static function fileToBase64(?string $path): string
    {
        if (! $path || ! file_exists($path)) {
            return '';
        }

        return 'data:image/png;base64,'.base64_encode(file_get_contents($path));
    }
}

<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            ['name' => 'Desarrollo de sitio web', 'unit' => 'proyecto', 'unit_price' => 800000, 'description' => 'Diseño y desarrollo de sitio web a medida.'],
            ['name' => 'Desarrollo de aplicación móvil', 'unit' => 'proyecto', 'unit_price' => 2500000, 'description' => 'Aplicación móvil nativa o multiplataforma (iOS/Android).'],
            ['name' => 'Consultoría e implementación TI', 'unit' => 'hora', 'unit_price' => 35000, 'description' => 'Asesoría técnica y acompañamiento en proyectos de TI.'],
            ['name' => 'Integración de APIs de terceros', 'unit' => 'proyecto', 'unit_price' => 450000, 'description' => 'Conexión e integración con servicios y APIs externas.'],
            ['name' => 'Integración de medios de pago', 'unit' => 'proyecto', 'unit_price' => 550000, 'description' => 'Integración con pasarelas de pago (Webpay/Transbank, Mercado Pago, etc.).'],
            ['name' => 'Soporte y mantención mensual', 'unit' => 'mensual', 'unit_price' => 150000, 'description' => 'Soporte técnico y mantención continua de sistemas.'],
            ['name' => 'Hosting y dominio', 'unit' => 'anual', 'unit_price' => 90000, 'description' => 'Alojamiento web y administración de dominio.'],
        ];

        foreach ($products as $product) {
            Product::updateOrCreate(['name' => $product['name']], $product);
        }
    }
}

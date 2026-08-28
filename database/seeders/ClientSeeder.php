<?php

namespace Database\Seeders;

use App\Models\Client;
use Illuminate\Database\Seeder;

class ClientSeeder extends Seeder
{
    public function run(): void
    {
        $clients = [
            [
                'name' => 'Comercial Andes Ltda.',
                'email' => 'contacto@comercialandes.cl',
                'phone' => '+56 2 2345 6789',
                'address' => 'Av. Apoquindo 4500, Of. 802, Las Condes, Santiago',
                'tax_id' => '76.111.222-3',
                'legal_representative_name' => 'María Fernanda Rojas Pinto',
                'legal_representative_rut' => '14.222.333-4',
                'legal_representative_reference' => 'Escritura Pública de fecha 5 de enero de 2021, otorgada ante el Notario de Santiago don Ricardo Solís',
            ],
            [
                'name' => 'Constructora Valle Sur SpA',
                'email' => 'administracion@vallesur.cl',
                'phone' => '+56 9 8123 4567',
                'address' => 'Camino a Melipilla 8900, Maipú, Santiago',
                'tax_id' => '77.333.444-5',
                'legal_representative_name' => 'Cristián Andrés Muñoz Vera',
                'legal_representative_rut' => '13.444.555-6',
                'legal_representative_reference' => 'Escritura Pública de fecha 12 de marzo de 2019, otorgada ante el Notario de Santiago doña Alejandra Peña',
            ],
            [
                'name' => 'Clínica Bienestar Ltda.',
                'email' => 'gerencia@clinicabienestar.cl',
                'phone' => '+56 2 2987 6543',
                'address' => 'Av. Manquehue Norte 1200, Vitacura, Santiago',
                'tax_id' => '78.555.666-7',
                'legal_representative_name' => 'Patricia Isabel Contreras Díaz',
                'legal_representative_rut' => '11.666.777-8',
                'legal_representative_reference' => 'Escritura Pública de fecha 20 de junio de 2018, otorgada ante el Notario de Santiago don Felipe Aránguiz',
            ],
            [
                'name' => 'Distribuidora Pacífico SpA',
                'email' => 'operaciones@distpacifico.cl',
                'phone' => '+56 32 234 5678',
                'address' => 'Av. Argentina 950, Valparaíso',
                'tax_id' => '79.777.888-9',
                'legal_representative_name' => 'Jorge Eduardo Salinas Bravo',
                'legal_representative_rut' => '12.888.999-0',
                'legal_representative_reference' => 'Escritura Pública de fecha 8 de septiembre de 2022, otorgada ante el Notario de Valparaíso don Manuel Ibarra',
            ],
            [
                'name' => 'Fundación EducaChile',
                'email' => 'contacto@educachile.org',
                'phone' => '+56 2 2456 7890',
                'address' => 'Av. Providencia 2594, Of. 1103, Providencia, Santiago',
                'tax_id' => '65.999.000-1',
                'legal_representative_name' => 'Valentina Soledad Herrera Campos',
                'legal_representative_rut' => '10.999.111-2',
                'legal_representative_reference' => 'Escritura Pública de fecha 15 de noviembre de 2017, otorgada ante el Notario de Santiago don Ricardo Solís',
            ],
        ];

        foreach ($clients as $client) {
            Client::updateOrCreate(['name' => $client['name']], $client);
        }
    }
}

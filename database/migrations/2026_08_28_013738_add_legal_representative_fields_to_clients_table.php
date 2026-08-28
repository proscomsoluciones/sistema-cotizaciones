<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->string('legal_representative_name')->nullable()->after('notes');
            $table->string('legal_representative_rut')->nullable()->after('legal_representative_name');
            $table->text('legal_representative_reference')->nullable()->after('legal_representative_rut');
        });
    }

    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropColumn(['legal_representative_name', 'legal_representative_rut', 'legal_representative_reference']);
        });
    }
};

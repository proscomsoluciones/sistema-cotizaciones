<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contract_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contract_id')->constrained()->cascadeOnDelete();
            $table->string('label');
            $table->decimal('percentage', 5, 2)->nullable();
            $table->decimal('amount', 12, 2);
            $table->date('due_date')->nullable();
            $table->string('status')->default('pending');
            $table->date('paid_at')->nullable();
            $table->decimal('paid_amount', 12, 2)->nullable();
            $table->string('payment_method')->nullable();
            $table->text('notes')->nullable();
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contract_payments');
    }
};

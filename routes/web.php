<?php

use App\Http\Controllers\ClientController;
use App\Http\Controllers\ContractController;
use App\Http\Controllers\ContractPaymentController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\Public\QuotationApprovalController;
use App\Http\Controllers\QuotationController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/login')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('clientes', ClientController::class)->parameters(['clientes' => 'client']);
    Route::resource('productos', ProductController::class)->parameters(['productos' => 'product'])->except('show');

    Route::resource('cotizaciones', QuotationController::class)->parameters(['cotizaciones' => 'quotation']);
    Route::post('cotizaciones/{quotation}/enviar', [QuotationController::class, 'send'])->name('cotizaciones.send');
    Route::get('cotizaciones/{quotation}/pdf', [QuotationController::class, 'pdf'])->name('cotizaciones.pdf');

    Route::get('contratos', [ContractController::class, 'index'])->name('contratos.index');
    Route::get('contratos/{contract}', [ContractController::class, 'show'])->name('contratos.show');
    Route::put('contratos/{contract}', [ContractController::class, 'update'])->name('contratos.update');
    Route::get('contratos/{contract}/descargar', [ContractController::class, 'download'])->name('contratos.download');
    Route::post('contratos/{contract}/regenerar-pdf', [ContractController::class, 'regeneratePdf'])->name('contratos.regenerar-pdf');

    Route::post('contratos/{contract}/pagos/plantilla', [ContractPaymentController::class, 'generatePlan'])->name('contratos.pagos.plantilla');
    Route::post('contratos/{contract}/pagos', [ContractPaymentController::class, 'store'])->name('contratos.pagos.store');
    Route::put('contratos/{contract}/pagos/{payment}', [ContractPaymentController::class, 'update'])->name('contratos.pagos.update');
    Route::delete('contratos/{contract}/pagos/{payment}', [ContractPaymentController::class, 'destroy'])->name('contratos.pagos.destroy');
    Route::post('contratos/{contract}/pagos/{payment}/marcar-pagado', [ContractPaymentController::class, 'markPaid'])->name('contratos.pagos.marcar-pagado');
    Route::post('contratos/{contract}/pagos/{payment}/marcar-pendiente', [ContractPaymentController::class, 'markPending'])->name('contratos.pagos.marcar-pendiente');
});

Route::middleware('throttle:30,1')->group(function () {
    Route::get('cotizaciones/aprobar/{quotation:approval_token}', [QuotationApprovalController::class, 'show'])->name('public.quotations.show');
    Route::get('cotizaciones/aprobar/{quotation:approval_token}/pdf', [QuotationApprovalController::class, 'pdf'])->name('public.quotations.pdf');
    Route::post('cotizaciones/aprobar/{quotation:approval_token}/aprobar', [QuotationApprovalController::class, 'approve'])->name('public.quotations.approve');
    Route::post('cotizaciones/aprobar/{quotation:approval_token}/rechazar', [QuotationApprovalController::class, 'reject'])->name('public.quotations.reject');
});

require __DIR__.'/settings.php';

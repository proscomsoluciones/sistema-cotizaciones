<?php

namespace App\Http\Controllers;

use App\Enums\QuotationStatus;
use App\Models\Contract;
use App\Models\Quotation;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('dashboard', [
            'stats' => [
                'pending' => Quotation::query()->where('status', QuotationStatus::Sent)->count(),
                'approvedThisMonth' => Quotation::query()
                    ->where('status', QuotationStatus::Approved)
                    ->whereMonth('approved_at', now()->month)
                    ->whereYear('approved_at', now()->year)
                    ->count(),
                'contractsTotal' => Contract::query()->count(),
                'approvedTotalValue' => (float) Quotation::query()
                    ->where('status', QuotationStatus::Approved)
                    ->sum('total'),
            ],
            'recentQuotations' => Quotation::query()
                ->with('client')
                ->latest('issue_date')
                ->limit(5)
                ->get(),
        ]);
    }
}

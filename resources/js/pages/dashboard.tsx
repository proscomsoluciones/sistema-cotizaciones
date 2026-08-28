import { Head, Link } from '@inertiajs/react';
import { Clock, FileCheck2, FileSignature, Wallet } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { QuotationStatusBadge } from '@/components/quotation-status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/currency';
import { dashboard } from '@/routes';
import { show } from '@/routes/cotizaciones';
import type { Quotation } from '@/types/models';

type Stats = {
    pending: number;
    approvedThisMonth: number;
    contractsTotal: number;
    approvedTotalValue: number;
};

export default function Dashboard({
    stats,
    recentQuotations,
}: {
    stats: Stats;
    recentQuotations: Quotation[];
}) {
    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                        Panel de Control
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Resumen general de cotizaciones, contratos y estado de gestión de Proscom.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        icon={Clock}
                        label="Cotizaciones pendientes"
                        value={stats.pending}
                        color="from-amber-500 to-amber-600"
                        bgIcon="text-amber-500/10"
                    />
                    <StatCard
                        icon={FileCheck2}
                        label="Aprobadas este mes"
                        value={stats.approvedThisMonth}
                        color="from-emerald-500 to-teal-600"
                        bgIcon="text-emerald-500/10"
                    />
                    <StatCard
                        icon={FileSignature}
                        label="Contratos generados"
                        value={stats.contractsTotal}
                        color="from-[#0A2540] to-slate-800"
                        bgIcon="text-blue-500/10"
                    />
                    <StatCard
                        icon={Wallet}
                        label="Valor total aprobado"
                        value={formatCurrency(stats.approvedTotalValue)}
                        color="from-blue-600 to-indigo-700"
                        bgIcon="text-indigo-500/10"
                    />
                </div>

                <Card className="overflow-hidden border-slate-200/80 shadow-xs dark:border-slate-800/80">
                    <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800/60 dark:bg-slate-900/40">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                                    Cotizaciones Recientes
                                </CardTitle>
                                <p className="text-xs text-slate-500">Últimas propuestas emitidas en la plataforma</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b border-slate-100 bg-slate-50/80 dark:border-slate-800/60 dark:bg-slate-900/60">
                                    <TableHead className="py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Folio</TableHead>
                                    <TableHead className="py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Cliente</TableHead>
                                    <TableHead className="py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Fecha</TableHead>
                                    <TableHead className="py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Estado</TableHead>
                                    <TableHead className="py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentQuotations.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-8 text-center text-sm text-slate-500">
                                            Todavía no hay cotizaciones registradas.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {recentQuotations.map((quotation) => (
                                    <TableRow key={quotation.id} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-900/50">
                                        <TableCell className="font-medium">
                                            <Link href={show(quotation.id)} className="text-[#0A2540] hover:underline dark:text-blue-400">
                                                {quotation.folio}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="text-slate-700 dark:text-slate-300">{quotation.client.name}</TableCell>
                                        <TableCell className="text-slate-500 text-xs">{quotation.issue_date}</TableCell>
                                        <TableCell>
                                            <QuotationStatusBadge status={quotation.status} />
                                        </TableCell>
                                        <TableCell className="text-right font-semibold text-slate-900 dark:text-slate-100">
                                            {formatCurrency(quotation.total)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

function StatCard({
    icon: Icon,
    label,
    value,
    color,
}: {
    icon: LucideIcon;
    label: string;
    value: string | number;
    color: string;
    bgIcon?: string;
}) {
    return (
        <Card className="relative overflow-hidden border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900">
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-white shadow-xs`}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
            <div className="mt-4">
                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{value}</p>
            </div>
        </Card>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};

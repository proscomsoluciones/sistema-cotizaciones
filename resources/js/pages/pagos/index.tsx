import { Head, Link, router } from '@inertiajs/react';
import { Calendar, CheckCircle2, Clock, DollarSign, ExternalLink, Pencil, Receipt, RotateCcw, Trash2, Wallet } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { destroy as destroyPayment, markPending } from '@/actions/App/Http/Controllers/ContractPaymentController';
import ConfirmDeleteDialog from '@/components/confirm-delete-dialog';
import { GlobalPaymentDialog } from '@/components/global-payment-dialog';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
import { MarkPaidDialog, PaymentFormDialog } from '@/components/payment-plan-dialogs';
import { PaymentStatusBadge } from '@/components/payment-status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/lib/date';
import { formatCurrency } from '@/lib/currency';
import { index as pagosIndex } from '@/routes/pagos';
import { show as showContract } from '@/routes/contratos';
import { show as showQuotation } from '@/routes/cotizaciones';
import type { BreadcrumbItem } from '@/types';
import type { ContractPayment } from '@/types/models';
import type { Paginated } from '@/types/pagination';

type ContractWithClient = {
    id: number;
    contract_number: string;
    client?: { id: number; name: string };
    quotation?: { id: number; folio: string };
};

type PaymentExtended = ContractPayment & {
    contract: ContractWithClient;
};

type ContractOption = {
    id: number;
    contract_number: string;
    client_name: string;
    quotation_folio: string;
    total_amount: string;
    pending_total: number;
};

type Props = {
    payments: Paginated<PaymentExtended>;
    stats: {
        totalPaid: number;
        totalPending: number;
        totalOverdue: number;
        paidThisMonth: number;
    };
    filters: {
        search?: string;
        status?: string;
        payment_method?: string;
    };
    contracts: ContractOption[];
    paymentMethods: { value: string; label: string }[];
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Pagos', href: pagosIndex() }];

const PAYMENT_METHOD_LABELS: Record<string, string> = {
    transferencia: 'Transferencia',
    efectivo: 'Efectivo',
    tarjeta: 'Tarjeta',
    cheque: 'Cheque',
    otro: 'Otro',
};

export default function PagosIndex({ payments, stats, filters, contracts, paymentMethods }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    function applyFilters(next: Partial<{ search: string; status: string; payment_method: string }>) {
        router.get(
            pagosIndex().url,
            {
                search,
                status: filters.status,
                payment_method: filters.payment_method,
                ...next,
            },
            { preserveState: true, replace: true }
        );
    }

    function submitSearch(e: FormEvent) {
        e.preventDefault();
        applyFilters({ search });
    }

    return (
        <>
            <Head title="Control de Pagos" />

            <div className="space-y-6 p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <Heading
                        title="Control de Pagos y Cobranzas"
                        description="Administra y haz seguimiento a todos los pagos ingresados y pendientes"
                    />
                    <GlobalPaymentDialog contracts={contracts} />
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="relative overflow-hidden border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Recibido</span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xs">
                                <CheckCircle2 className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                                {formatCurrency(stats.totalPaid)}
                            </p>
                        </div>
                    </Card>

                    <Card className="relative overflow-hidden border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Cobrado Este Mes</span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xs">
                                <Calendar className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                                {formatCurrency(stats.paidThisMonth)}
                            </p>
                        </div>
                    </Card>

                    <Card className="relative overflow-hidden border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Saldo Pendiente por Cobrar</span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-xs">
                                <Clock className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
                                {formatCurrency(stats.totalPending)}
                            </p>
                        </div>
                    </Card>

                    <Card className="relative overflow-hidden border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Pagos Vencidos</span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-xs">
                                <Receipt className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
                                {formatCurrency(stats.totalOverdue)}
                            </p>
                        </div>
                    </Card>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <form onSubmit={submitSearch} className="flex max-w-sm gap-2">
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar cliente, folio, contrato..."
                            className="bg-card"
                        />
                        <Button type="submit" variant="secondary">
                            Buscar
                        </Button>
                    </form>

                    <Select
                        value={filters.status ?? 'all'}
                        onValueChange={(value) => applyFilters({ status: value === 'all' ? '' : value })}
                    >
                        <SelectTrigger className="w-48 bg-card">
                            <SelectValue placeholder="Todos los estados" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los estados</SelectItem>
                            <SelectItem value="paid">Pagados</SelectItem>
                            <SelectItem value="pending">Pendientes</SelectItem>
                            <SelectItem value="overdue">Vencidos</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={filters.payment_method ?? 'all'}
                        onValueChange={(value) => applyFilters({ payment_method: value === 'all' ? '' : value })}
                    >
                        <SelectTrigger className="w-48 bg-card">
                            <SelectValue placeholder="Todos los métodos" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los métodos</SelectItem>
                            {paymentMethods.map((m) => (
                                <SelectItem key={m.value} value={m.value}>
                                    {m.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-card shadow-xs dark:border-slate-800/80">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-slate-100 bg-slate-50/80 dark:border-slate-800/60 dark:bg-slate-900/60">
                                <TableHead className="py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Cliente</TableHead>
                                <TableHead className="py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Origen</TableHead>
                                <TableHead className="py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Concepto</TableHead>
                                <TableHead className="py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Vencimiento / Pago</TableHead>
                                <TableHead className="py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Método</TableHead>
                                <TableHead className="py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Estado</TableHead>
                                <TableHead className="py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Monto</TableHead>
                                <TableHead className="py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.data.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} className="py-12 text-center text-slate-500">
                                        No hay pagos registrados que coincidan con la búsqueda.
                                    </TableCell>
                                </TableRow>
                            )}
                            {payments.data.map((payment) => {
                                const amountDisplay =
                                    payment.status === 'paid' ? (payment.paid_amount ?? payment.amount) : payment.amount;

                                return (
                                    <TableRow key={payment.id} className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-900/50">
                                        <TableCell className="font-semibold text-slate-900 dark:text-slate-100">
                                            {payment.contract?.client?.name ?? 'Sin cliente'}
                                        </TableCell>

                                        <TableCell className="text-xs">
                                            <div className="space-y-0.5">
                                                {payment.contract?.contract_number && (
                                                    <Link
                                                        href={showContract(payment.contract.id)}
                                                        className="font-medium text-slate-700 hover:underline dark:text-slate-300 block"
                                                    >
                                                        {payment.contract.contract_number}
                                                    </Link>
                                                )}
                                                {payment.contract?.quotation?.folio && (
                                                    <Link
                                                        href={showQuotation(payment.contract.quotation.id)}
                                                        className="text-slate-400 hover:underline text-[11px] block"
                                                    >
                                                        Cotiz. {payment.contract.quotation.folio}
                                                    </Link>
                                                )}
                                            </div>
                                        </TableCell>

                                        <TableCell className="font-medium text-slate-700 dark:text-slate-300">
                                            {payment.label}
                                            {payment.notes && (
                                                <p className="text-[11px] text-slate-400 truncate max-w-xs">{payment.notes}</p>
                                            )}
                                        </TableCell>

                                        <TableCell className="text-xs font-medium text-slate-500">
                                            {payment.status === 'paid' ? (
                                                <span>Pagado el {formatDate(payment.paid_at)}</span>
                                            ) : (
                                                <span>Vence el {formatDate(payment.due_date)}</span>
                                            )}
                                        </TableCell>

                                        <TableCell className="text-xs text-slate-600 dark:text-slate-400">
                                            {payment.payment_method
                                                ? PAYMENT_METHOD_LABELS[payment.payment_method] ?? payment.payment_method
                                                : '-'}
                                        </TableCell>

                                        <TableCell>
                                            <PaymentStatusBadge status={payment.status} overdue={payment.is_overdue} />
                                        </TableCell>

                                        <TableCell className="text-right font-semibold text-slate-900 dark:text-slate-100">
                                            {formatCurrency(amountDisplay)}
                                        </TableCell>

                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1.5">
                                                {payment.status === 'pending' ? (
                                                    <>
                                                        <MarkPaidDialog
                                                            contractId={payment.contract_id}
                                                            payment={payment}
                                                            trigger={
                                                                <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
                                                                    <DollarSign className="h-3.5 w-3.5 text-emerald-600" /> Marcar pagado
                                                                </Button>
                                                            }
                                                        />
                                                        <PaymentFormDialog
                                                            contractId={payment.contract_id}
                                                            payment={payment}
                                                            trigger={
                                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                    <Pencil className="h-3.5 w-3.5" />
                                                                </Button>
                                                            }
                                                        />
                                                        <ConfirmDeleteDialog
                                                            trigger={
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:text-rose-600">
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </Button>
                                                            }
                                                            title={`Eliminar "${payment.label}"`}
                                                            description="Esta acción no se puede deshacer."
                                                            url={destroyPayment([payment.contract_id, payment.id]).url}
                                                        />
                                                    </>
                                                ) : (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 text-xs gap-1 text-slate-500"
                                                        title="Marcar como pendiente"
                                                        onClick={() =>
                                                            router.post(
                                                                markPending([payment.contract_id, payment.id]).url,
                                                                {},
                                                                { preserveScroll: true }
                                                            )
                                                        }
                                                    >
                                                        <RotateCcw className="h-3.5 w-3.5" /> Deshacer pago
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>

                <Pagination paginated={payments} />
            </div>
        </>
    );
}

PagosIndex.layout = { breadcrumbs };

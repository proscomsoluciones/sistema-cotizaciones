import { Head, Link, router } from '@inertiajs/react';
import { Download, Eye, Plus, Send } from 'lucide-react';
import type { FormEvent} from 'react';
import { useState } from 'react';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
import { QuotationStatusBadge } from '@/components/quotation-status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
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
import { create, index, pdf, send, show } from '@/routes/cotizaciones';
import type { BreadcrumbItem } from '@/types';
import type { Quotation } from '@/types/models';
import type { Paginated } from '@/types/pagination';

type Props = {
    quotations: Paginated<Quotation>;
    filters: { search?: string; status?: string };
    statuses: { value: string; label: string }[];
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Cotizaciones', href: index() }];

export default function QuotationsIndex({ quotations, filters, statuses }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [sendingId, setSendingId] = useState<number | null>(null);

    function applyFilters(next: Partial<{ search: string; status: string }>) {
        router.get(
            index().url,
            { search, status: filters.status, ...next },
            { preserveState: true, replace: true }
        );
    }

    function submitSearch(e: FormEvent) {
        e.preventDefault();
        applyFilters({ search });
    }

    function sendQuotation(id: number) {
        setSendingId(id);
        router.post(send(id).url, {}, { preserveScroll: true, onFinish: () => setSendingId(null) });
    }

    return (
        <>
            <Head title="Cotizaciones" />

            <div className="space-y-6 p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <Heading title="Cotizaciones" description="Crea, administra y da seguimiento a tus propuestas comerciales" />
                    <Button asChild className="gap-2 shadow-xs">
                        <Link href={create()}>
                            <Plus className="h-4 w-4" /> Nueva cotización
                        </Link>
                    </Button>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <form onSubmit={submitSearch} className="flex max-w-sm gap-2">
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar por folio o cliente..."
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
                            {statuses.map((status) => (
                                <SelectItem key={status.value} value={status.value}>
                                    {status.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-card shadow-xs dark:border-slate-800/80">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-slate-100 bg-slate-50/80 dark:border-slate-800/60 dark:bg-slate-900/60">
                                <TableHead className="py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Folio</TableHead>
                                <TableHead className="py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Cliente</TableHead>
                                <TableHead className="py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Fecha</TableHead>
                                <TableHead className="py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Estado</TableHead>
                                <TableHead className="py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Neto</TableHead>
                                <TableHead className="py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">IVA</TableHead>
                                <TableHead className="py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Total</TableHead>
                                <TableHead className="py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {quotations.data.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} className="py-12 text-center text-slate-500">
                                        No hay cotizaciones que coincidan con la búsqueda.
                                    </TableCell>
                                </TableRow>
                            )}
                            {quotations.data.map((quotation) => (
                                <TableRow key={quotation.id} className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-900/50">
                                    <TableCell className="font-bold text-slate-900 dark:text-slate-100">
                                        {quotation.folio}
                                    </TableCell>
                                    <TableCell className="font-medium text-slate-700 dark:text-slate-300">{quotation.client.name}</TableCell>
                                    <TableCell className="text-xs text-slate-500 font-medium">{formatDate(quotation.issue_date)}</TableCell>
                                    <TableCell>
                                        <QuotationStatusBadge status={quotation.status} />
                                    </TableCell>
                                    <TableCell className="text-right font-medium text-emerald-600 dark:text-emerald-400">
                                        {formatCurrency(quotation.subtotal)}
                                    </TableCell>
                                    <TableCell className="text-right text-xs text-slate-500 font-medium">
                                        {formatCurrency(quotation.tax_amount)}
                                    </TableCell>
                                    <TableCell className="text-right font-semibold text-slate-900 dark:text-slate-100">
                                        {formatCurrency(quotation.total)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {(quotation.status === 'draft' || quotation.status === 'sent') && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="gap-1.5 shadow-2xs"
                                                    disabled={sendingId === quotation.id}
                                                    onClick={() => sendQuotation(quotation.id)}
                                                >
                                                    {sendingId === quotation.id ? (
                                                        <Spinner className="h-3.5 w-3.5" />
                                                    ) : (
                                                        <Send className="h-3.5 w-3.5" />
                                                    )}
                                                    {quotation.status === 'sent' ? 'Reenviar' : 'Enviar'}
                                                </Button>
                                            )}
                                            <Button variant="secondary" size="sm" asChild className="gap-1.5 shadow-2xs font-medium">
                                                <Link href={show(quotation.id)}>
                                                    <Eye className="h-3.5 w-3.5" /> Ver Detalle
                                                </Link>
                                            </Button>
                                            <Button variant="outline" size="sm" asChild className="gap-1.5 shadow-2xs">
                                                <a href={pdf(quotation.id).url} target="_blank" rel="noopener noreferrer">
                                                    <Download className="h-3.5 w-3.5" /> PDF
                                                </a>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <Pagination paginated={quotations} />
            </div>
        </>
    );
}

QuotationsIndex.layout = { breadcrumbs };

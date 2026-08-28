import { Head, Link, router } from '@inertiajs/react';
import { Download, Eye } from 'lucide-react';
import type { FormEvent} from 'react';
import { useState } from 'react';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { download, index, show } from '@/routes/contratos';
import type { BreadcrumbItem } from '@/types';
import type { Contract } from '@/types/models';
import type { Paginated } from '@/types/pagination';

type Props = {
    contracts: Paginated<Contract>;
    filters: { search?: string };
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Contratos', href: index() }];

export default function ContractsIndex({ contracts, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    function submitSearch(e: FormEvent) {
        e.preventDefault();
        router.get(index().url, { search }, { preserveState: true, replace: true });
    }

    return (
        <>
            <Head title="Contratos" />

            <div className="space-y-6 p-4 md:p-6">
                <Heading title="Contratos" description="Contratos generados a partir de cotizaciones aprobadas por los clientes" />

                <form onSubmit={submitSearch} className="flex max-w-sm gap-2">
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar por número o cliente..."
                        className="bg-card"
                    />
                    <Button type="submit" variant="secondary">
                        Buscar
                    </Button>
                </form>

                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-card shadow-xs dark:border-slate-800/80">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-slate-100 bg-slate-50/80 dark:border-slate-800/60 dark:bg-slate-900/60">
                                <TableHead className="py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Número</TableHead>
                                <TableHead className="py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Cliente</TableHead>
                                <TableHead className="py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Cotización</TableHead>
                                <TableHead className="py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Vigencia (Inicio / Término)</TableHead>
                                <TableHead className="py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Total</TableHead>
                                <TableHead className="py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Saldo pendiente</TableHead>
                                <TableHead className="py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {contracts.data.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-12 text-center text-slate-500">
                                        Todavía no se ha generado ningún contrato.
                                    </TableCell>
                                </TableRow>
                            )}
                            {contracts.data.map((contract) => (
                                <TableRow key={contract.id} className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-900/50">
                                    <TableCell className="font-bold text-slate-900 dark:text-slate-100">
                                        {contract.contract_number}
                                    </TableCell>
                                    <TableCell className="font-medium text-slate-700 dark:text-slate-300">{contract.client?.name}</TableCell>
                                    <TableCell className="text-xs text-slate-500">{contract.quotation?.folio}</TableCell>
                                    <TableCell className="text-xs text-slate-500 font-medium">
                                        {formatDate(contract.start_date)}
                                        {contract.end_date ? ` al ${formatDate(contract.end_date)}` : ''}
                                    </TableCell>
                                    <TableCell className="text-right font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(contract.total_amount)}</TableCell>
                                    <TableCell className="text-right">
                                        {contract.payments.length === 0 ? (
                                            <span className="text-xs text-slate-400">Sin plan</span>
                                        ) : contract.pending_total === 0 ? (
                                            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Pagado
                                            </span>
                                        ) : (
                                            <span className="font-medium text-slate-900 dark:text-slate-100">{formatCurrency(contract.pending_total)}</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="secondary" size="sm" asChild className="gap-1.5 shadow-2xs font-medium">
                                                <Link href={show(contract.id)}>
                                                    <Eye className="h-3.5 w-3.5" /> Ver Detalle
                                                </Link>
                                            </Button>
                                            <Button variant="outline" size="sm" asChild className="gap-1.5 shadow-2xs">
                                                <a href={download(contract.id).url}>
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

                <Pagination paginated={contracts} />
            </div>
        </>
    );
}

ContractsIndex.layout = { breadcrumbs };

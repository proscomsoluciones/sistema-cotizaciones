import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';
import type { FormEvent} from 'react';
import { useState } from 'react';
import { ClientDialog } from '@/components/client-dialog';
import ConfirmDeleteDialog from '@/components/confirm-delete-dialog';
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
import { destroy, index, show } from '@/routes/clientes';
import type { BreadcrumbItem } from '@/types';
import type { Client } from '@/types/models';
import type { Paginated } from '@/types/pagination';

type Props = {
    clients: Paginated<Client>;
    filters: { search?: string };
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Clientes', href: index() }];

export default function ClientsIndex({ clients, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    function submitSearch(e: FormEvent) {
        e.preventDefault();
        router.get(index().url, { search }, { preserveState: true, replace: true });
    }

    return (
        <>
            <Head title="Clientes" />

            <div className="space-y-6 p-4 md:p-6 lg:p-8 w-full max-w-7xl mx-auto">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <Heading title="Clientes" description="Administra tu cartera de clientes y representantes legales" />
                    <ClientDialog />
                </div>

                <form onSubmit={submitSearch} className="flex max-w-sm gap-2">
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar por nombre o email..."
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
                                <TableHead className="py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Nombre / Empresa</TableHead>
                                <TableHead className="py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Email</TableHead>
                                <TableHead className="py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Teléfono</TableHead>
                                <TableHead className="py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Cotizaciones</TableHead>
                                <TableHead className="py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {clients.data.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-12 text-center text-slate-500">
                                        No hay clientes registrados que coincidan con la búsqueda.
                                    </TableCell>
                                </TableRow>
                            )}
                            {clients.data.map((client) => (
                                <TableRow key={client.id} className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-900/50">
                                    <TableCell className="font-semibold">
                                        <Link href={show(client.id)} className="text-[#0A2540] hover:underline dark:text-blue-400">
                                            {client.name}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="text-slate-600 dark:text-slate-400">{client.email ?? '—'}</TableCell>
                                    <TableCell className="text-slate-600 dark:text-slate-400">{client.phone ?? '—'}</TableCell>
                                    <TableCell className="text-slate-600 dark:text-slate-400 font-medium">{client.quotations_count ?? 0}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1.5">
                                            <ClientDialog
                                                client={client}
                                                trigger={
                                                    <Button variant="ghost" size="icon" title="Editar cliente">
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                }
                                            />
                                            <ConfirmDeleteDialog
                                                trigger={
                                                    <Button variant="ghost" size="icon" title="Eliminar cliente">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                }
                                                title={`Eliminar a ${client.name}`}
                                                description="Esta acción no se puede deshacer. No se podrá eliminar si tiene cotizaciones asociadas."
                                                url={destroy(client.id).url}
                                            />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <Pagination paginated={clients} />
            </div>
        </>
    );
}

ClientsIndex.layout = {
    breadcrumbs,
};

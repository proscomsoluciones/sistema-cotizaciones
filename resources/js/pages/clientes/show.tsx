import { Head, Link } from '@inertiajs/react';
import { Pencil } from 'lucide-react';
import Heading from '@/components/heading';
import { QuotationStatusBadge } from '@/components/quotation-status-badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/currency';
import { edit, index } from '@/routes/clientes';
import { show as showQuotation } from '@/routes/cotizaciones';
import type { BreadcrumbItem } from '@/types';
import type { Client, Quotation } from '@/types/models';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Clientes', href: index() },
    { title: 'Detalle', href: '#' },
];

export default function ClientShow({ client }: { client: Client & { quotations: Quotation[] } }) {
    return (
        <>
            <Head title={client.name} />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading title={client.name} description={client.email ?? 'Sin email registrado'} />
                    <Button variant="outline" asChild>
                        <Link href={edit(client.id)}>
                            <Pencil /> Editar
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4 rounded-xl border border-sidebar-border/70 p-4 text-sm md:grid-cols-2 dark:border-sidebar-border">
                    <div>
                        <p className="text-muted-foreground">Teléfono</p>
                        <p>{client.phone ?? '—'}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">RUT</p>
                        <p>{client.tax_id ?? '—'}</p>
                    </div>
                    <div className="md:col-span-2">
                        <p className="text-muted-foreground">Dirección</p>
                        <p>{client.address ?? '—'}</p>
                    </div>
                    {client.notes && (
                        <div className="md:col-span-2">
                            <p className="text-muted-foreground">Notas</p>
                            <p>{client.notes}</p>
                        </div>
                    )}
                </div>

                <div className="space-y-3">
                    <Heading
                        variant="small"
                        title="Representante legal"
                        description="Se usa para generar los contratos"
                    />
                    <div className="grid gap-4 rounded-xl border border-sidebar-border/70 p-4 text-sm md:grid-cols-2 dark:border-sidebar-border">
                        <div>
                            <p className="text-muted-foreground">Nombre</p>
                            <p>{client.legal_representative_name ?? '—'}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">RUT del representante</p>
                            <p>{client.legal_representative_rut ?? '—'}</p>
                        </div>
                        <div className="md:col-span-2">
                            <p className="text-muted-foreground">Personería</p>
                            <p>{client.legal_representative_reference ?? '—'}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <Heading variant="small" title="Cotizaciones" />
                    <div className="overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Folio</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {client.quotations.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                                            Este cliente no tiene cotizaciones.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {client.quotations.map((quotation) => (
                                    <TableRow key={quotation.id}>
                                        <TableCell>
                                            <Link href={showQuotation(quotation.id)} className="font-medium hover:underline">
                                                {quotation.folio}
                                            </Link>
                                        </TableCell>
                                        <TableCell>{quotation.issue_date}</TableCell>
                                        <TableCell>
                                            <QuotationStatusBadge status={quotation.status} />
                                        </TableCell>
                                        <TableCell className="text-right">{formatCurrency(quotation.total)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </>
    );
}

ClientShow.layout = { breadcrumbs };

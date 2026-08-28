import { Head, Link, router } from '@inertiajs/react';
import { Copy, Download, Pencil, Send } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import ConfirmDeleteDialog from '@/components/confirm-delete-dialog';
import Heading from '@/components/heading';
import { QuotationStatusBadge } from '@/components/quotation-status-badge';
import { Button } from '@/components/ui/button';
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
import { show as showContract } from '@/routes/contratos';
import { destroy, edit, index, pdf, send } from '@/routes/cotizaciones';
import type { BreadcrumbItem } from '@/types';
import type { Quotation } from '@/types/models';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Cotizaciones', href: index() },
    { title: 'Detalle', href: '#' },
];

export default function QuotationShow({
    quotation,
    approvalUrl,
}: {
    quotation: Quotation;
    approvalUrl: string | null;
}) {
    const canEdit = quotation.status === 'draft';
    const canSend = quotation.status === 'draft' || quotation.status === 'sent';
    const canDelete = !quotation.contract;
    const [sending, setSending] = useState(false);

    function copyLink() {
        if (!approvalUrl) {
return;
}

        navigator.clipboard.writeText(approvalUrl);
        toast.success('Enlace copiado al portapapeles.');
    }

    function sendQuotation() {
        setSending(true);
        router.post(send(quotation.id).url, {}, { onFinish: () => setSending(false) });
    }

    return (
        <>
            <Head title={quotation.folio} />

            <div className="w-full max-w-7xl mx-auto space-y-6 p-4 md:p-6 lg:p-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Heading title={quotation.folio} description={quotation.client.name} />
                        <QuotationStatusBadge status={quotation.status} />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="default" asChild className="gap-2 shadow-xs">
                            <a href={pdf(quotation.id).url} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4" /> Descargar PDF
                            </a>
                        </Button>
                        {canEdit && (
                            <Button variant="outline" asChild>
                                <Link href={edit(quotation.id)}>
                                    <Pencil className="h-4 w-4" /> Editar
                                </Link>
                            </Button>
                        )}
                        {canSend && (
                            <Button variant="secondary" onClick={sendQuotation} disabled={sending}>
                                {sending ? <Spinner className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                                {quotation.status === 'sent' ? 'Reenviar' : 'Enviar al cliente'}
                            </Button>
                        )}
                        {canDelete && (
                            <ConfirmDeleteDialog
                                trigger={<Button variant="destructive">Eliminar</Button>}
                                title={`Eliminar ${quotation.folio}`}
                                description="Esta acción no se puede deshacer."
                                url={destroy(quotation.id).url}
                            />
                        )}
                    </div>
                </div>

                {approvalUrl && (
                    <div className="flex items-center justify-between rounded-xl border border-sidebar-border/70 p-4 text-sm dark:border-sidebar-border">
                        <div>
                            <p className="font-medium">Enlace de aprobación para el cliente</p>
                            <p className="break-all text-muted-foreground">{approvalUrl}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={copyLink}>
                            <Copy />
                        </Button>
                    </div>
                )}

                {quotation.contract && (
                    <div className="rounded-xl border border-green-300 bg-green-50 p-4 text-sm dark:border-green-800 dark:bg-green-950">
                        Esta cotización fue aprobada y ya tiene un contrato generado:{' '}
                        <Link href={showContract(quotation.contract.id)} className="font-medium underline">
                            {quotation.contract.contract_number}
                        </Link>
                    </div>
                )}

                <div className="grid gap-4 rounded-xl border border-sidebar-border/70 p-4 text-sm md:grid-cols-3 dark:border-sidebar-border">
                    <div>
                        <p className="text-muted-foreground">Fecha de emisión</p>
                        <p>{formatDate(quotation.issue_date)}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Válida hasta</p>
                        <p>{formatDate(quotation.valid_until)}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Cliente</p>
                        <p>{quotation.client.name}</p>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <Table className="w-full table-fixed">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[45%] whitespace-normal">Descripción</TableHead>
                                <TableHead className="w-[15%] text-center whitespace-normal">Cantidad</TableHead>
                                <TableHead className="w-[20%] text-right whitespace-normal">Precio unitario</TableHead>
                                <TableHead className="w-[20%] text-right whitespace-normal">Subtotal</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {quotation.items.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="whitespace-normal break-words font-medium">{item.description}</TableCell>
                                    <TableCell className="text-center">{item.quantity}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(item.subtotal)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <div className="ml-auto max-w-xs space-y-1 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{formatCurrency(quotation.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Impuesto ({quotation.tax_rate}%)</span>
                        <span>{formatCurrency(quotation.tax_amount)}</span>
                    </div>
                    <div className="flex justify-between text-base font-semibold">
                        <span>Total</span>
                        <span>{formatCurrency(quotation.total)}</span>
                    </div>
                </div>

                {quotation.notes && (
                    <div className="text-sm">
                        <p className="text-muted-foreground">Notas</p>
                        <p>{quotation.notes}</p>
                    </div>
                )}
            </div>
        </>
    );
}

QuotationShow.layout = { breadcrumbs };

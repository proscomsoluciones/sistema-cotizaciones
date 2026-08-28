import { Head, Link, router } from '@inertiajs/react';
import { Download, Pencil, Plus, RefreshCw, RotateCcw, Trash2 } from 'lucide-react';
import { destroy as destroyPayment, markPending } from '@/actions/App/Http/Controllers/ContractPaymentController';
import ConfirmDeleteDialog from '@/components/confirm-delete-dialog';
import Heading from '@/components/heading';
import { EditContractDatesDialog } from '@/components/edit-contract-dates-dialog';
import { GeneratePlanDialog, MarkPaidDialog, PaymentFormDialog } from '@/components/payment-plan-dialogs';
import { PaymentStatusBadge } from '@/components/payment-status-badge';
import { Button } from '@/components/ui/button';
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
import { download, index, regenerarPdf } from '@/routes/contratos';
import { show as showQuotation } from '@/routes/cotizaciones';
import type { BreadcrumbItem } from '@/types';
import type { Contract } from '@/types/models';

const PAYMENT_METHOD_LABELS: Record<string, string> = {
    transferencia: 'Transferencia',
    efectivo: 'Efectivo',
    tarjeta: 'Tarjeta',
    cheque: 'Cheque',
    otro: 'Otro',
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Contratos', href: index() },
    { title: 'Detalle', href: '#' },
];

export default function ContractShow({ contract }: { contract: Contract }) {
    return (
        <>
            <Head title={contract.contract_number} />

            <div className="w-full max-w-7xl mx-auto space-y-6 p-4 md:p-6 lg:p-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <Heading title={contract.contract_number} description={contract.client?.name} />
                    <div className="flex flex-wrap gap-2">
                        <EditContractDatesDialog contract={contract} />
                        <Button
                            variant="outline"
                            className="gap-2"
                            onClick={() => router.post(regenerarPdf(contract.id).url, {}, { preserveScroll: true })}
                        >
                            <RefreshCw className="h-4 w-4" /> Regenerar PDF
                        </Button>
                        <Button variant="default" asChild className="gap-2 shadow-xs">
                            <a href={download(contract.id).url}>
                                <Download className="h-4 w-4" /> Descargar PDF
                            </a>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 rounded-xl border border-sidebar-border/70 p-4 text-sm md:grid-cols-3 dark:border-sidebar-border">
                    <div>
                        <p className="text-muted-foreground">Cotización origen</p>
                        <p>
                            {contract.quotation && (
                                <Link href={showQuotation(contract.quotation.id)} className="underline">
                                    {contract.quotation.folio}
                                </Link>
                            )}
                        </p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Vigencia</p>
                        <p>
                            {formatDate(contract.start_date)}
                            {contract.end_date ? ` al ${formatDate(contract.end_date)}` : ''}
                        </p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Total</p>
                        <p className="font-medium">{formatCurrency(contract.total_amount)}</p>
                    </div>
                </div>

                {contract.quotation?.items && (
                    <div className="overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Descripción</TableHead>
                                    <TableHead>Cantidad</TableHead>
                                    <TableHead>Precio unitario</TableHead>
                                    <TableHead className="text-right">Subtotal</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {contract.quotation.items.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.description}</TableCell>
                                        <TableCell>{item.quantity}</TableCell>
                                        <TableCell>{formatCurrency(item.unit_price)}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(item.subtotal)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Heading variant="small" title="Plan de pagos" />
                        {contract.payments.length > 0 && (
                            <PaymentFormDialog
                                contractId={contract.id}
                                trigger={
                                    <Button variant="outline" size="sm">
                                        <Plus /> Agregar pago
                                    </Button>
                                }
                            />
                        )}
                    </div>

                    <div className="grid gap-4 rounded-xl border border-sidebar-border/70 p-4 text-sm md:grid-cols-3 dark:border-sidebar-border">
                        <div>
                            <p className="text-muted-foreground">Total del contrato</p>
                            <p className="font-medium">{formatCurrency(contract.total_amount)}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Pagado</p>
                            <p className="font-medium text-green-600 dark:text-green-400">
                                {formatCurrency(contract.paid_total)}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Saldo pendiente</p>
                            <p className="font-medium">{formatCurrency(contract.pending_total)}</p>
                        </div>
                    </div>

                    {contract.payments.length === 0 ? (
                        <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-sidebar-border/70 p-6 dark:border-sidebar-border">
                            <p className="text-sm text-muted-foreground">
                                Todavía no hay un plan de pagos para este contrato.
                            </p>
                            <div className="flex gap-2">
                                <GeneratePlanDialog contractId={contract.id} />
                                <PaymentFormDialog
                                    contractId={contract.id}
                                    trigger={<Button variant="outline">Agregar pago manual</Button>}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Concepto</TableHead>
                                        <TableHead>Vencimiento</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead className="text-right">Monto</TableHead>
                                        <TableHead className="w-40 text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {contract.payments.map((payment) => (
                                        <TableRow key={payment.id}>
                                            <TableCell>
                                                {payment.label}
                                                {payment.status === 'paid' && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Pagado el {formatDate(payment.paid_at)}
                                                        {payment.payment_method &&
                                                            ` · ${PAYMENT_METHOD_LABELS[payment.payment_method]}`}
                                                    </p>
                                                )}
                                            </TableCell>
                                            <TableCell>{formatDate(payment.due_date)}</TableCell>
                                            <TableCell>
                                                <PaymentStatusBadge status={payment.status} overdue={payment.is_overdue} />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(payment.status === 'paid' ? (payment.paid_amount ?? payment.amount) : payment.amount)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-end gap-1">
                                                    {payment.status === 'pending' ? (
                                                        <>
                                                            <MarkPaidDialog
                                                                contractId={contract.id}
                                                                payment={payment}
                                                                trigger={
                                                                    <Button variant="outline" size="sm">
                                                                        Marcar pagado
                                                                    </Button>
                                                                }
                                                            />
                                                            <PaymentFormDialog
                                                                contractId={contract.id}
                                                                payment={payment}
                                                                trigger={
                                                                    <Button variant="ghost" size="icon">
                                                                        <Pencil />
                                                                    </Button>
                                                                }
                                                            />
                                                            <ConfirmDeleteDialog
                                                                trigger={
                                                                    <Button variant="ghost" size="icon">
                                                                        <Trash2 />
                                                                    </Button>
                                                                }
                                                                title={`Eliminar "${payment.label}"`}
                                                                description="Esta acción no se puede deshacer."
                                                                url={destroyPayment([contract.id, payment.id]).url}
                                                            />
                                                        </>
                                                    ) : (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            title="Marcar como pendiente"
                                                            onClick={() =>
                                                                router.post(markPending([contract.id, payment.id]).url, {}, { preserveScroll: true })
                                                            }
                                                        >
                                                            <RotateCcw />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>

                <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">Términos y condiciones</p>
                    <p className="whitespace-pre-line">{contract.terms}</p>
                </div>
            </div>
        </>
    );
}

ContractShow.layout = { breadcrumbs };

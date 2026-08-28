import { Head, router } from '@inertiajs/react';
import { Download } from 'lucide-react';
import { useState } from 'react';
import { QuotationStatusBadge } from '@/components/quotation-status-badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/currency';
import { approve, pdf, reject } from '@/routes/public/quotations';
import type { Quotation } from '@/types/models';

export default function QuotationApprove({
    quotation,
    canRespond,
}: {
    quotation: Quotation;
    canRespond: boolean;
}) {
    const [processing, setProcessing] = useState(false);

    function respond(action: 'approve' | 'reject') {
        setProcessing(true);
        const url = action === 'approve' ? approve(quotation.approval_token!).url : reject(quotation.approval_token!).url;

        router.post(url, {}, { onFinish: () => setProcessing(false) });
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
            <Head title={`Cotización ${quotation.folio}`} />

            <Card className="w-full max-w-2xl">
                <CardHeader className="space-y-4">
                    <div className="w-fit rounded-md bg-white px-3 py-2">
                        <img src="/images/proscom-logo.png" alt="Proscom" className="h-6 w-auto" />
                    </div>
                    <div className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl">Cotización {quotation.folio}</CardTitle>
                            <CardDescription>Para {quotation.client.name}</CardDescription>
                        </div>
                        <QuotationStatusBadge status={quotation.status} />
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Mobile View (< sm) */}
                    <div className="space-y-3 sm:hidden">
                        {quotation.items.map((item) => (
                            <div key={item.id} className="rounded-xl border bg-card p-3.5 space-y-2 text-sm">
                                <p className="font-semibold text-foreground leading-snug">{item.description}</p>
                                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
                                    <span>Cantidad: <strong className="text-foreground font-medium">{item.quantity}</strong></span>
                                    <span>Precio U.: <strong className="text-foreground font-medium">{formatCurrency(item.unit_price)}</strong></span>
                                </div>
                                <div className="flex items-center justify-between font-semibold text-sm pt-1">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="text-foreground">{formatCurrency(item.subtotal)}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop View (>= sm) */}
                    <div className="hidden sm:block overflow-hidden rounded-xl border">
                        <Table className="w-full table-fixed">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[45%]">Descripción</TableHead>
                                    <TableHead className="w-[15%] text-center">Cantidad</TableHead>
                                    <TableHead className="w-[20%] text-right">Precio unitario</TableHead>
                                    <TableHead className="w-[20%] text-right">Subtotal</TableHead>
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

                    <Button variant="default" size="default" asChild className="gap-2 w-full sm:w-auto shadow-xs">
                        <a href={pdf(quotation.approval_token!).url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" /> Descargar PDF Cotización
                        </a>
                    </Button>

                    {quotation.valid_until && (
                        <p className="text-sm text-muted-foreground">
                            Esta cotización es válida hasta el {quotation.valid_until}.
                        </p>
                    )}

                    {canRespond ? (
                        <div className="flex justify-end gap-2">
                            <RespondDialog
                                action="reject"
                                processing={processing}
                                onConfirm={() => respond('reject')}
                            />
                            <RespondDialog
                                action="approve"
                                processing={processing}
                                onConfirm={() => respond('approve')}
                            />
                        </div>
                    ) : (
                        <p className="rounded-lg border bg-muted/50 p-3 text-sm text-muted-foreground">
                            {quotation.status === 'approved' &&
                                'Ya aprobaste esta cotización. Pronto recibirás el contrato correspondiente.'}
                            {quotation.status === 'rejected' && 'Has rechazado esta cotización.'}
                            {quotation.status === 'draft' && 'Esta cotización todavía no ha sido enviada.'}
                            {quotation.status === 'expired' && 'Esta cotización ha expirado.'}
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function RespondDialog({
    action,
    processing,
    onConfirm,
}: {
    action: 'approve' | 'reject';
    processing: boolean;
    onConfirm: () => void;
}) {
    const isApprove = action === 'approve';

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant={isApprove ? 'default' : 'outline'}>
                    {isApprove ? 'Aprobar cotización' : 'Rechazar'}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>{isApprove ? '¿Aprobar esta cotización?' : '¿Rechazar esta cotización?'}</DialogTitle>
                <DialogDescription>
                    {isApprove
                        ? 'Al aprobar, se generará automáticamente el contrato correspondiente.'
                        : 'Esta acción notificará que no deseas continuar con esta cotización.'}
                </DialogDescription>
                <DialogFooter className="gap-2">
                    <DialogClose asChild>
                        <Button variant="secondary">Cancelar</Button>
                    </DialogClose>
                    <Button
                        variant={isApprove ? 'default' : 'destructive'}
                        disabled={processing}
                        onClick={onConfirm}
                    >
                        Confirmar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

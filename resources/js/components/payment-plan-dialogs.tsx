import { router } from '@inertiajs/react';
import { useState } from 'react';
import { generatePlan, store, update, markPaid } from '@/actions/App/Http/Controllers/ContractPaymentController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency } from '@/lib/currency';
import type { ContractPayment, PaymentMethod } from '@/types/models';

type Errors = Record<string, string>;

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
    { value: 'transferencia', label: 'Transferencia' },
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'tarjeta', label: 'Tarjeta' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'otro', label: 'Otro' },
];

export function GeneratePlanDialog({ contractId }: { contractId: number }) {
    const [open, setOpen] = useState(false);
    const [template, setTemplate] = useState('50_50');
    const [installmentsCount, setInstallmentsCount] = useState('3');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Errors>({});

    function submit() {
        setProcessing(true);
        router.post(
            generatePlan(contractId).url,
            { template, installments_count: template === 'installments' ? installmentsCount : undefined },
            {
                preserveScroll: true,
                onError: (e) => setErrors(e as Errors),
                onSuccess: () => setOpen(false),
                onFinish: () => setProcessing(false),
            }
        );
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Generar plan de pagos</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>Generar plan de pagos</DialogTitle>
                <DialogDescription>
                    Elige una plantilla para dividir el total del contrato. Luego puedes agregar hitos manuales.
                </DialogDescription>

                <div className="space-y-4">
                    <div className="grid gap-2">
                        <Label>Plantilla</Label>
                        <Select value={template} onValueChange={setTemplate}>
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="50_50">50% anticipo / 50% al término</SelectItem>
                                <SelectItem value="25_75">25% anticipo / 75% al término</SelectItem>
                                <SelectItem value="installments">Cuotas iguales</SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={errors.template} />
                    </div>

                    {template === 'installments' && (
                        <div className="grid gap-2">
                            <Label htmlFor="installments_count">Número de cuotas</Label>
                            <Input
                                id="installments_count"
                                type="number"
                                min="2"
                                max="24"
                                value={installmentsCount}
                                onChange={(e) => setInstallmentsCount(e.target.value)}
                            />
                            <InputError message={errors.installments_count} />
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button onClick={submit} disabled={processing}>
                        Generar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function PaymentFormDialog({
    contractId,
    payment,
    trigger,
}: {
    contractId: number;
    payment?: ContractPayment;
    trigger: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const [label, setLabel] = useState(payment?.label ?? '');
    const [amount, setAmount] = useState(payment?.amount ?? '');
    const [percentage, setPercentage] = useState(payment?.percentage ?? '');
    const [dueDate, setDueDate] = useState(payment?.due_date ?? '');
    const [notes, setNotes] = useState(payment?.notes ?? '');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Errors>({});

    function submit() {
        setProcessing(true);
        const data = { label, amount, percentage: percentage || null, due_date: dueDate || null, notes: notes || null };
        const options = {
            preserveScroll: true,
            onError: (e: Errors) => setErrors(e),
            onSuccess: () => setOpen(false),
            onFinish: () => setProcessing(false),
        };

        if (payment) {
            router.put(update([contractId, payment.id]).url, data, options);
        } else {
            router.post(store(contractId).url, data, options);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent>
                <DialogTitle>{payment ? 'Editar pago' : 'Agregar pago'}</DialogTitle>
                <DialogDescription>
                    Útil para hitos del proyecto u otros pagos que no encajan en una plantilla.
                </DialogDescription>

                <div className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="label">Concepto</Label>
                        <Input
                            id="label"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            placeholder="Ej. Hito 1 - Aprobación de diseño"
                        />
                        <InputError message={errors.label} />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="amount">Monto</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                            <InputError message={errors.amount} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="percentage">% (opcional)</Label>
                            <Input
                                id="percentage"
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                value={percentage ?? ''}
                                onChange={(e) => setPercentage(e.target.value)}
                            />
                            <InputError message={errors.percentage} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="due_date">Vencimiento</Label>
                            <Input
                                id="due_date"
                                type="date"
                                value={dueDate ?? ''}
                                onChange={(e) => setDueDate(e.target.value)}
                            />
                            <InputError message={errors.due_date} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="notes">Notas (opcional)</Label>
                        <Textarea id="notes" rows={2} value={notes ?? ''} onChange={(e) => setNotes(e.target.value)} />
                        <InputError message={errors.notes} />
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={submit} disabled={processing}>
                        {payment ? 'Guardar cambios' : 'Agregar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function MarkPaidDialog({
    contractId,
    payment,
    trigger,
}: {
    contractId: number;
    payment: ContractPayment;
    trigger: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const [paidAt, setPaidAt] = useState(new Date().toISOString().slice(0, 10));
    const [paidAmount, setPaidAmount] = useState(payment.amount);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('transferencia');
    const [notes, setNotes] = useState('');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Errors>({});

    function submit() {
        setProcessing(true);
        router.post(
            markPaid([contractId, payment.id]).url,
            { paid_at: paidAt, paid_amount: paidAmount, payment_method: paymentMethod, notes: notes || null },
            {
                preserveScroll: true,
                onError: (e) => setErrors(e as Errors),
                onSuccess: () => setOpen(false),
                onFinish: () => setProcessing(false),
            }
        );
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent>
                <DialogTitle>Registrar pago: {payment.label}</DialogTitle>
                <DialogDescription>Monto planificado: {formatCurrency(payment.amount)}</DialogDescription>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="paid_at">Fecha de pago</Label>
                            <Input
                                id="paid_at"
                                type="date"
                                value={paidAt}
                                onChange={(e) => setPaidAt(e.target.value)}
                            />
                            <InputError message={errors.paid_at} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="paid_amount">Monto recibido</Label>
                            <Input
                                id="paid_amount"
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={paidAmount}
                                onChange={(e) => setPaidAmount(e.target.value)}
                            />
                            <InputError message={errors.paid_amount} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Método de pago</Label>
                        <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {PAYMENT_METHODS.map((method) => (
                                    <SelectItem key={method.value} value={method.value}>
                                        {method.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.payment_method} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="mark_paid_notes">Notas (opcional)</Label>
                        <Textarea id="mark_paid_notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
                        <InputError message={errors.notes} />
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={submit} disabled={processing}>
                        Confirmar pago
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

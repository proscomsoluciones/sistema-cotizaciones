import { router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
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
import { store as storePayment } from '@/routes/pagos';
import type { PaymentMethod } from '@/types/models';

type ContractOption = {
    id: number | string;
    label_display?: string;
    contract_number: string;
    client_name: string;
    quotation_folio: string;
    total_amount: string;
    pending_total: number;
};

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
    { value: 'transferencia', label: 'Transferencia' },
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'tarjeta', label: 'Tarjeta' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'otro', label: 'Otro' },
];

export function GlobalPaymentDialog({
    contracts,
    trigger,
}: {
    contracts: ContractOption[];
    trigger?: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const [contractId, setContractId] = useState<string>(contracts[0] ? String(contracts[0].id) : '');
    const [label, setLabel] = useState('');
    const [amount, setAmount] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [isPaidImmediate, setIsPaidImmediate] = useState(true);
    const [paidAt, setPaidAt] = useState(new Date().toISOString().slice(0, 10));
    const [paidAmount, setPaidAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('transferencia');
    const [notes, setNotes] = useState('');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    function handleContractChange(id: string) {
        setContractId(id);
        const selected = contracts.find((c) => String(c.id) === id);
        if (selected && !amount) {
            setAmount(String(selected.pending_total > 0 ? selected.pending_total : selected.total_amount));
        }
    }

    function submit() {
        setProcessing(true);
        const payload = {
            contract_id: contractId,
            label: label || 'Pago registrado',
            amount: amount,
            due_date: dueDate || null,
            status: isPaidImmediate ? 'paid' : 'pending',
            paid_at: isPaidImmediate ? paidAt : null,
            paid_amount: isPaidImmediate ? (paidAmount || amount) : null,
            payment_method: isPaidImmediate ? paymentMethod : null,
            notes: notes || null,
        };

        router.post(storePayment().url, payload, {
            preserveScroll: true,
            onError: (e) => setErrors(e as Record<string, string>),
            onSuccess: () => {
                setOpen(false);
                setLabel('');
                setAmount('');
                setNotes('');
            },
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button className="gap-2 shadow-xs">
                        <Plus className="h-4 w-4" /> Registrar Pago
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogTitle>Registrar Nuevo Pago</DialogTitle>
                <DialogDescription>
                    Ingresa los detalles del pago recibido o programado para un contrato o cotización.
                </DialogDescription>

                <div className="space-y-4 py-2">
                    <div className="grid gap-2">
                        <Label htmlFor="contract_id" className="font-medium">
                            Contrato / Cotización / Cliente <span className="text-rose-500">*</span>
                        </Label>
                        <Select value={contractId} onValueChange={handleContractChange}>
                            <SelectTrigger id="contract_id" className="bg-card">
                                <SelectValue placeholder="Selecciona contrato o cotización" />
                            </SelectTrigger>
                            <SelectContent>
                                {contracts.map((c) => (
                                    <SelectItem key={c.id} value={String(c.id)}>
                                        {c.label_display ?? `${c.contract_number} - ${c.client_name} (${c.quotation_folio})`}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.contract_id} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="label" className="font-medium">
                            Concepto del Pago <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                            id="label"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            placeholder="Ej. Anticipo 50%, Abono N°1, Pago total"
                            required
                        />
                        <InputError message={errors.label} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="amount" className="font-medium">
                                Monto <span className="text-rose-500">*</span>
                            </Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={amount}
                                onChange={(e) => {
                                    setAmount(e.target.value);
                                    if (!paidAmount) setPaidAmount(e.target.value);
                                }}
                                placeholder="0"
                                required
                            />
                            <InputError message={errors.amount} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="status_type" className="font-medium">
                                Estado inicial
                            </Label>
                            <Select
                                value={isPaidImmediate ? 'paid' : 'pending'}
                                onValueChange={(val) => setIsPaidImmediate(val === 'paid')}
                            >
                                <SelectTrigger id="status_type" className="bg-card">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="paid">Pagado (Ya recibido)</SelectItem>
                                    <SelectItem value="pending">Pendiente (Programado)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {isPaidImmediate ? (
                        <div className="space-y-4 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 dark:border-slate-800/80 dark:bg-slate-900/60">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="paid_at" className="text-xs font-semibold">
                                        Fecha de Pago
                                    </Label>
                                    <Input
                                        id="paid_at"
                                        type="date"
                                        value={paidAt}
                                        onChange={(e) => setPaidAt(e.target.value)}
                                        className="bg-card text-xs"
                                    />
                                    <InputError message={errors.paid_at} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="paid_amount" className="text-xs font-semibold">
                                        Monto Recibido
                                    </Label>
                                    <Input
                                        id="paid_amount"
                                        type="number"
                                        step="0.01"
                                        value={paidAmount || amount}
                                        onChange={(e) => setPaidAmount(e.target.value)}
                                        className="bg-card text-xs"
                                    />
                                    <InputError message={errors.paid_amount} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="payment_method" className="text-xs font-semibold">
                                    Método de Pago
                                </Label>
                                <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                                    <SelectTrigger id="payment_method" className="bg-card text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PAYMENT_METHODS.map((m) => (
                                            <SelectItem key={m.value} value={m.value}>
                                                {m.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.payment_method} />
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-2">
                            <Label htmlFor="due_date" className="font-medium">
                                Fecha Límite de Vencimiento
                            </Label>
                            <Input
                                id="due_date"
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="bg-card"
                            />
                            <InputError message={errors.due_date} />
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="notes" className="font-medium">
                            Notas / Comprobante (opcional)
                        </Label>
                        <Textarea
                            id="notes"
                            rows={2}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Ej. Transferencia N° 48201 Banco de Chile"
                            className="bg-card text-sm"
                        />
                        <InputError message={errors.notes} />
                    </div>
                </div>

                <DialogFooter className="pt-2">
                    <Button variant="outline" onClick={() => setOpen(false)} type="button">
                        Cancelar
                    </Button>
                    <Button onClick={submit} disabled={processing || !contractId}>
                        {processing ? 'Guardando...' : 'Guardar Pago'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

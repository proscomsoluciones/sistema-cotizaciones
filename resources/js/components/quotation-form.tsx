import { useForm, router } from '@inertiajs/react';
import { Plus, Trash2, UserPlus } from 'lucide-react';
import type { FormEvent } from 'react';
import { ClientDialog } from '@/components/client-dialog';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency } from '@/lib/currency';
import type { ClientOption, ProductOption } from '@/types/models';

type ItemForm = {
    product_id: string;
    description: string;
    quantity: string;
    unit_price: string;
};

type QuotationFormData = {
    client_id: string;
    issue_date: string;
    valid_until: string;
    tax_rate: string;
    notes: string;
    items: ItemForm[];
};

function emptyItem(): ItemForm {
    return { product_id: '', description: '', quantity: '1', unit_price: '0' };
}

export default function QuotationForm({
    clients,
    products,
    initialData,
    submitUrl,
    method,
    submitLabel,
}: {
    clients: ClientOption[];
    products: ProductOption[];
    initialData: QuotationFormData;
    submitUrl: string;
    method: 'post' | 'put';
    submitLabel: string;
}) {
    const { data, setData, post, put, processing, errors } = useForm<QuotationFormData>(initialData);
    const fieldErrors = errors as Record<string, string>;

    function updateItem(index: number, patch: Partial<ItemForm>) {
        const items = data.items.map((item, i) => (i === index ? { ...item, ...patch } : item));
        setData('items', items);
    }

    function addItem() {
        setData('items', [...data.items, emptyItem()]);
    }

    function removeItem(index: number) {
        setData('items', data.items.filter((_, i) => i !== index));
    }

    function selectProduct(index: number, productId: string) {
        const product = products.find((p) => String(p.id) === productId);

        updateItem(index, {
            product_id: productId,
            description: product?.name ?? data.items[index].description,
            unit_price: product?.unit_price ?? data.items[index].unit_price,
        });
    }

    function submit(e: FormEvent) {
        e.preventDefault();

        if (method === 'post') {
            post(submitUrl);
        } else {
            put(submitUrl);
        }
    }

    const subtotal = data.items.reduce(
        (sum, item) => sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0),
        0
    );
    const taxAmount = subtotal * ((parseFloat(data.tax_rate) || 0) / 100);
    const total = subtotal + taxAmount;

    return (
        <form onSubmit={submit} className="space-y-8">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="grid gap-2 sm:col-span-2 lg:col-span-1">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="client_id" className="font-semibold text-slate-800 dark:text-slate-200">
                            Cliente <span className="text-rose-500">*</span>
                        </Label>
                        <ClientDialog
                            onSuccess={() => router.reload({ only: ['clients'] })}
                            trigger={
                                <Button type="button" variant="ghost" size="sm" className="h-6 gap-1 px-2 text-xs text-blue-600 dark:text-blue-400">
                                    <UserPlus className="h-3.5 w-3.5" /> + Nuevo
                                </Button>
                            }
                        />
                    </div>
                    <Select value={data.client_id} onValueChange={(value) => setData('client_id', value)}>
                        <SelectTrigger id="client_id" className="w-full bg-card">
                            <SelectValue placeholder="Selecciona un cliente" />
                        </SelectTrigger>
                        <SelectContent>
                            {clients.map((client) => (
                                <SelectItem key={client.id} value={String(client.id)}>
                                    {client.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.client_id} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="issue_date" className="font-semibold text-slate-800 dark:text-slate-200">
                        Fecha de Emisión <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                        id="issue_date"
                        type="date"
                        value={data.issue_date}
                        onChange={(e) => setData('issue_date', e.target.value)}
                        className="bg-card"
                        required
                    />
                    <InputError message={errors.issue_date} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="valid_until" className="font-semibold text-slate-800 dark:text-slate-200">
                        Válida Hasta
                    </Label>
                    <Input
                        id="valid_until"
                        type="date"
                        value={data.valid_until}
                        onChange={(e) => setData('valid_until', e.target.value)}
                        className="bg-card"
                    />
                    <InputError message={errors.valid_until} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="tax_rate" className="font-semibold text-slate-800 dark:text-slate-200">
                        Impuesto IVA (%)
                    </Label>
                    <Input
                        id="tax_rate"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={data.tax_rate}
                        onChange={(e) => setData('tax_rate', e.target.value)}
                        className="bg-card"
                        required
                    />
                    <InputError message={errors.tax_rate} />
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800/60">
                    <div>
                        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Líneas de la Cotización</h3>
                        <p className="text-xs text-slate-500">Agrega productos del catálogo o edita las descripciones libremente</p>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-1.5 shadow-2xs">
                        <Plus className="h-4 w-4" /> Agregar línea
                    </Button>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-card shadow-xs dark:border-slate-800/80">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-slate-100 bg-slate-50/80 dark:border-slate-800/60 dark:bg-slate-900/60">
                                <TableHead className="w-56 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Producto Base</TableHead>
                                <TableHead className="py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Descripción del Servicio / Ítem</TableHead>
                                <TableHead className="w-28 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Cantidad</TableHead>
                                <TableHead className="w-36 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Precio Unitario</TableHead>
                                <TableHead className="w-36 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Subtotal</TableHead>
                                <TableHead className="w-12" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.items.map((item, index) => {
                                const rowSubtotal =
                                    (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);

                                return (
                                    <TableRow key={index} className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                                        <TableCell>
                                            <Select
                                                value={item.product_id}
                                                onValueChange={(value) => selectProduct(index, value)}
                                            >
                                                <SelectTrigger className="w-full bg-card text-xs">
                                                    <SelectValue placeholder="Catálogo libre" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {products.map((product) => (
                                                        <SelectItem key={product.id} value={String(product.id)}>
                                                            {product.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                value={item.description}
                                                onChange={(e) => updateItem(index, { description: e.target.value })}
                                                placeholder="Ej. Desarrollo de módulo de cotizaciones..."
                                                className="bg-card text-sm"
                                                required
                                            />
                                            <InputError message={fieldErrors[`items.${index}.description`]} />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0.01"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(index, { quantity: e.target.value })}
                                                className="bg-card text-sm"
                                                required
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={item.unit_price}
                                                onChange={(e) => updateItem(index, { unit_price: e.target.value })}
                                                className="bg-card text-sm"
                                                required
                                            />
                                        </TableCell>
                                        <TableCell className="text-right font-semibold text-slate-900 dark:text-slate-100">
                                            {formatCurrency(rowSubtotal)}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                disabled={data.items.length === 1}
                                                onClick={() => removeItem(index)}
                                                className="text-slate-400 hover:text-rose-600"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
                <InputError message={errors.items} />
            </div>

            <div className="grid gap-6 lg:grid-cols-3 pt-2">
                <div className="grid gap-2 lg:col-span-2">
                    <Label htmlFor="notes" className="font-semibold text-slate-800 dark:text-slate-200">
                        Notas Adicionales / Términos Específicos
                    </Label>
                    <Textarea
                        id="notes"
                        rows={4}
                        value={data.notes}
                        onChange={(e) => setData('notes', e.target.value)}
                        placeholder="Ej. Forma de pago: 50% al inicio y 50% contra entrega. Tiempo estimado: 15 días hábiles."
                        className="bg-card leading-relaxed"
                    />
                    <InputError message={errors.notes} />
                </div>

                <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-50/60 p-6 dark:border-slate-800/80 dark:bg-slate-900/60">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                        Resumen de Totales
                    </h4>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                            <span>Subtotal Neto</span>
                            <span className="font-medium">{formatCurrency(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                            <span>Impuesto IVA ({data.tax_rate || 0}%)</span>
                            <span className="font-medium">{formatCurrency(taxAmount)}</span>
                        </div>
                        <div className="border-t border-slate-200 pt-3 dark:border-slate-700 flex justify-between text-lg font-bold text-slate-900 dark:text-slate-100">
                            <span>Total Final</span>
                            <span className="text-[#0A2540] dark:text-blue-400">{formatCurrency(total)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/60">
                <Button type="submit" size="lg" disabled={processing} className="px-8 shadow-md">
                    {submitLabel}
                </Button>
            </div>
        </form>
    );
}

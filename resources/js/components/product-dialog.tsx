import { useForm } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { store, update } from '@/routes/productos';
import type { Product } from '@/types/models';

type ProductFormData = {
    name: string;
    description: string;
    unit_price: string;
    unit: string;
    sku: string;
    active: boolean;
};

export function ProductDialog({
    product,
    trigger,
    onSuccess,
}: {
    product?: Product;
    trigger?: ReactNode;
    onSuccess?: () => void;
}) {
    const [open, setOpen] = useState(false);
    const isEdit = !!product;

    const { data, setData, post, put, processing, errors, reset } = useForm<ProductFormData>({
        name: product?.name ?? '',
        description: product?.description ?? '',
        unit_price: product?.unit_price ? String(product.unit_price) : '0',
        unit: product?.unit ?? 'Unidad',
        sku: product?.sku ?? '',
        active: product?.active ?? true,
    });

    function handleSubmit(e: FormEvent) {
        e.preventDefault();

        const options = {
            onSuccess: () => {
                setOpen(false);

                if (!isEdit) {
                    reset();
                }

                if (onSuccess) {
                    onSuccess();
                }
            },
        };

        if (isEdit && product) {
            put(update(product.id).url, options);
        } else {
            post(store().url, options);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button className="gap-2 shadow-xs">
                        <Plus className="h-4 w-4" /> Nuevo Producto
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-md rounded-2xl p-6">
                <DialogHeader className="space-y-1">
                    <DialogTitle className="text-xl font-bold">
                        {isEdit ? `Editar Producto: ${product.name}` : 'Nuevo Producto / Servicio'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? 'Actualiza los datos del producto o servicio.'
                            : 'Agrega un producto o servicio al catálogo para utilizarlo en tus cotizaciones.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="prod_name" className="font-medium">
                                Nombre del Producto o Servicio <span className="text-rose-500">*</span>
                            </Label>
                            <Input
                                id="prod_name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Ej. Desarrollo Web Frontend"
                                required
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="unit_price" className="font-medium">
                                    Precio Unitario (CLP) <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                    id="unit_price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.unit_price}
                                    onChange={(e) => setData('unit_price', e.target.value)}
                                    required
                                />
                                <InputError message={errors.unit_price} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="unit" className="font-medium">
                                    Unidad de Medida
                                </Label>
                                <Input
                                    id="unit"
                                    value={data.unit}
                                    onChange={(e) => setData('unit', e.target.value)}
                                    placeholder="Hora / Proyecto / Mes"
                                    required
                                />
                                <InputError message={errors.unit} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="sku">Código / SKU (Opcional)</Label>
                            <Input
                                id="sku"
                                value={data.sku}
                                onChange={(e) => setData('sku', e.target.value)}
                                placeholder="SERV-001"
                            />
                            <InputError message={errors.sku} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Descripción detallada</Label>
                            <Textarea
                                id="description"
                                rows={2}
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Detalles de lo que incluye este ítem..."
                            />
                            <InputError message={errors.description} />
                        </div>

                        <div className="flex items-center space-x-2 pt-1">
                            <Checkbox
                                id="active"
                                checked={data.active}
                                onCheckedChange={(checked) => setData('active', !!checked)}
                            />
                            <Label htmlFor="active" className="text-sm font-medium cursor-pointer">
                                Producto activo para cotizaciones
                            </Label>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 pt-2">
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Cancelar
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={processing}>
                            {isEdit ? 'Guardar Cambios' : 'Crear Producto'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

import { Form, Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { index, store } from '@/routes/productos';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Productos', href: index() },
    { title: 'Nuevo producto', href: '#' },
];

export default function ProductCreate() {
    return (
        <>
            <Head title="Nuevo producto" />

            <div className="max-w-2xl space-y-6 p-4">
                <Heading title="Nuevo producto" description="Agrega un producto o servicio al catálogo" />

                <Form {...store.form()} className="space-y-6">
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nombre</Label>
                                <Input id="name" name="name" required autoFocus />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Descripción</Label>
                                <Textarea id="description" name="description" rows={3} />
                                <InputError message={errors.description} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="unit_price">Precio unitario</Label>
                                    <Input id="unit_price" name="unit_price" type="number" step="0.01" min="0" required />
                                    <InputError message={errors.unit_price} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="unit">Unidad</Label>
                                    <Input id="unit" name="unit" defaultValue="unidad" required />
                                    <InputError message={errors.unit} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="sku">SKU (opcional)</Label>
                                <Input id="sku" name="sku" />
                                <InputError message={errors.sku} />
                            </div>

                            <div className="flex items-center gap-2">
                                <Checkbox id="active" name="active" value="1" defaultChecked />
                                <Label htmlFor="active">Producto activo</Label>
                            </div>

                            <Button type="submit" disabled={processing}>
                                Guardar producto
                            </Button>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

ProductCreate.layout = { breadcrumbs };

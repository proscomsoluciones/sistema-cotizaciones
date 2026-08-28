import { useForm } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
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
import { store, update } from '@/routes/clientes';
import type { Client } from '@/types/models';

type ClientFormData = {
    name: string;
    email: string;
    phone: string;
    tax_id: string;
    address: string;
    legal_representative_name: string;
    legal_representative_rut: string;
    legal_representative_reference: string;
};

export function ClientDialog({
    client,
    trigger,
    onSuccess,
}: {
    client?: Client;
    trigger?: ReactNode;
    onSuccess?: () => void;
}) {
    const [open, setOpen] = useState(false);
    const isEdit = !!client;

    const { data, setData, post, put, processing, errors, reset } = useForm<ClientFormData>({
        name: client?.name ?? '',
        email: client?.email ?? '',
        phone: client?.phone ?? '',
        tax_id: client?.tax_id ?? '',
        address: client?.address ?? '',
        legal_representative_name: client?.legal_representative_name ?? '',
        legal_representative_rut: client?.legal_representative_rut ?? '',
        legal_representative_reference: client?.legal_representative_reference ?? '',
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

        if (isEdit && client) {
            put(update(client.id).url, options);
        } else {
            post(store().url, options);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button className="gap-2 shadow-xs">
                        <Plus className="h-4 w-4" /> Nuevo Cliente
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl p-6">
                <DialogHeader className="space-y-1">
                    <DialogTitle className="text-xl font-bold">
                        {isEdit ? `Editar Cliente: ${client.name}` : 'Nuevo Cliente'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? 'Actualiza los datos de la ficha del cliente.'
                            : 'Ingresa la información del nuevo cliente para asociarle cotizaciones y contratos.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2 sm:col-span-2">
                            <Label htmlFor="name" className="font-medium">
                                Nombre o Razón Social <span className="text-rose-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Ej. Empresa Demo SpA"
                                required
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="tax_id">RUT / Identificación Tributaria</Label>
                            <Input
                                id="tax_id"
                                value={data.tax_id}
                                onChange={(e) => setData('tax_id', e.target.value)}
                                placeholder="76.123.456-7"
                            />
                            <InputError message={errors.tax_id} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="phone">Teléfono</Label>
                            <Input
                                id="phone"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                placeholder="+56 9 1234 5678"
                            />
                            <InputError message={errors.phone} />
                        </div>

                        <div className="grid gap-2 sm:col-span-2">
                            <Label htmlFor="email">Correo electrónico</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="contacto@empresa.cl"
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="grid gap-2 sm:col-span-2">
                            <Label htmlFor="address">Dirección comercial</Label>
                            <Input
                                id="address"
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                placeholder="Av. Providencia 1234, Of. 501, Santiago"
                            />
                            <InputError message={errors.address} />
                        </div>
                    </div>

                    <div className="space-y-3 rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800/80 dark:bg-slate-900/40">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Representante Legal (Para Contratos)
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="grid gap-1.5">
                                <Label htmlFor="legal_representative_name" className="text-xs">Nombre Representante</Label>
                                <Input
                                    id="legal_representative_name"
                                    value={data.legal_representative_name}
                                    onChange={(e) => setData('legal_representative_name', e.target.value)}
                                    placeholder="Juan Pérez"
                                    className="h-8 text-xs"
                                />
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="legal_representative_rut" className="text-xs">RUT Representante</Label>
                                <Input
                                    id="legal_representative_rut"
                                    value={data.legal_representative_rut}
                                    onChange={(e) => setData('legal_representative_rut', e.target.value)}
                                    placeholder="12.345.678-9"
                                    className="h-8 text-xs"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 pt-2">
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Cancelar
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={processing}>
                            {isEdit ? 'Guardar Cambios' : 'Crear Cliente'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

import { Form, Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { index, update } from '@/routes/clientes';
import type { BreadcrumbItem } from '@/types';
import type { Client } from '@/types/models';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Clientes', href: index() },
    { title: 'Editar cliente', href: '#' },
];

export default function ClientEdit({ client }: { client: Client }) {
    return (
        <>
            <Head title={`Editar ${client.name}`} />

            <div className="max-w-2xl space-y-6 p-4">
                <Heading title="Editar cliente" description={client.name} />

                <Form {...update.form(client.id)} className="space-y-6">
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nombre</Label>
                                <Input id="name" name="name" defaultValue={client.name} required autoFocus />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" defaultValue={client.email ?? ''} />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="phone">Teléfono</Label>
                                <Input id="phone" name="phone" defaultValue={client.phone ?? ''} />
                                <InputError message={errors.phone} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="tax_id">RUT</Label>
                                <Input id="tax_id" name="tax_id" defaultValue={client.tax_id ?? ''} placeholder="76.123.456-7" />
                                <InputError message={errors.tax_id} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="address">Dirección</Label>
                                <Textarea id="address" name="address" rows={3} defaultValue={client.address ?? ''} />
                                <InputError message={errors.address} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="notes">Notas</Label>
                                <Textarea id="notes" name="notes" rows={3} defaultValue={client.notes ?? ''} />
                                <InputError message={errors.notes} />
                            </div>

                            <div className="space-y-4 rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                                <Heading
                                    variant="small"
                                    title="Representante legal"
                                    description="Necesario para generar el contrato de este cliente"
                                />

                                <div className="grid gap-2">
                                    <Label htmlFor="legal_representative_name">Nombre completo</Label>
                                    <Input
                                        id="legal_representative_name"
                                        name="legal_representative_name"
                                        defaultValue={client.legal_representative_name ?? ''}
                                    />
                                    <InputError message={errors.legal_representative_name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="legal_representative_rut">RUT del representante</Label>
                                    <Input
                                        id="legal_representative_rut"
                                        name="legal_representative_rut"
                                        defaultValue={client.legal_representative_rut ?? ''}
                                        placeholder="12.345.678-9"
                                    />
                                    <InputError message={errors.legal_representative_rut} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="legal_representative_reference">Personería</Label>
                                    <Textarea
                                        id="legal_representative_reference"
                                        name="legal_representative_reference"
                                        rows={2}
                                        defaultValue={client.legal_representative_reference ?? ''}
                                        placeholder="Ej. Escritura Pública de fecha ... ante el Notario ..."
                                    />
                                    <InputError message={errors.legal_representative_reference} />
                                </div>
                            </div>

                            <Button type="submit" disabled={processing}>
                                Guardar cambios
                            </Button>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

ClientEdit.layout = { breadcrumbs };

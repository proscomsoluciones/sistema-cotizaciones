import { useForm } from '@inertiajs/react';
import { Calendar, Pencil } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { update } from '@/routes/contratos';
import type { Contract } from '@/types/models';

type Props = {
    contract: Contract;
    trigger?: React.ReactNode;
};

export function EditContractDatesDialog({ contract, trigger }: Props) {
    const [open, setOpen] = useState(false);
    const { data, setData, put, processing, errors } = useForm({
        start_date: contract.start_date ? contract.start_date.split('T')[0] : '',
        end_date: contract.end_date ? contract.end_date.split('T')[0] : '',
    });

    function onSubmit(e: FormEvent) {
        e.preventDefault();
        put(update(contract.id).url, {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button variant="outline" size="sm" className="gap-1.5 shadow-2xs">
                        <Pencil className="h-3.5 w-3.5" /> Editar Fechas
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={onSubmit} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" /> Editar Fechas del Servicio
                        </DialogTitle>
                        <DialogDescription>
                            Define la fecha de inicio y término del servicio para el contrato {contract.contract_number}. Si es un servicio por bolsa de horas o entrega por hitos, puedes dejar la fecha de término en blanco.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 py-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="start_date">Fecha de inicio del servicio *</Label>
                            <Input
                                id="start_date"
                                type="date"
                                value={data.start_date}
                                onChange={(e) => setData('start_date', e.target.value)}
                                required
                            />
                            <InputError message={errors.start_date} />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="end_date">Fecha de término del servicio (Opcional)</Label>
                            <Input
                                id="end_date"
                                type="date"
                                value={data.end_date}
                                onChange={(e) => setData('end_date', e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Deja la fecha de término vacía si el servicio se mide por horas contratadas o alcance de entregables.
                            </p>
                            <InputError message={errors.end_date} />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Guardar Fechas
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

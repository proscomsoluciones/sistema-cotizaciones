import { router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

export default function ConfirmDeleteDialog({
    trigger,
    title,
    description,
    url,
}: {
    trigger: React.ReactNode;
    title: string;
    description: string;
    url: string;
}) {
    const [processing, setProcessing] = useState(false);

    return (
        <Dialog>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>{description}</DialogDescription>

                <DialogFooter className="gap-2">
                    <DialogClose asChild>
                        <Button variant="secondary">Cancelar</Button>
                    </DialogClose>
                    <Button
                        variant="destructive"
                        disabled={processing}
                        onClick={() => {
                            setProcessing(true);
                            router.delete(url, {
                                preserveScroll: true,
                                onFinish: () => setProcessing(false),
                            });
                        }}
                    >
                        Eliminar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

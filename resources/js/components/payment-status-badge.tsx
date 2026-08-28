import { Badge } from '@/components/ui/badge';

export type PaymentStatusValue = 'pending' | 'paid';

export function PaymentStatusBadge({ status, overdue }: { status: PaymentStatusValue; overdue?: boolean }) {
    if (status === 'paid') {
        return (
            <Badge
                variant="outline"
                className="inline-flex items-center gap-1.5 rounded-full border-emerald-200 bg-emerald-50/90 px-2.5 py-0.5 text-xs font-medium text-emerald-700 shadow-2xs dark:border-emerald-800/70 dark:bg-emerald-950/80 dark:text-emerald-300"
            >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Pagado
            </Badge>
        );
    }

    if (overdue) {
        return (
            <Badge
                variant="outline"
                className="inline-flex items-center gap-1.5 rounded-full border-rose-200 bg-rose-50/90 px-2.5 py-0.5 text-xs font-medium text-rose-700 shadow-2xs dark:border-rose-800/70 dark:bg-rose-950/80 dark:text-rose-300"
            >
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                Vencido
            </Badge>
        );
    }

    return (
        <Badge
            variant="outline"
            className="inline-flex items-center gap-1.5 rounded-full border-slate-200 bg-slate-100/80 px-2.5 py-0.5 text-xs font-medium text-slate-700 shadow-2xs dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300"
        >
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            Pendiente
        </Badge>
    );
}

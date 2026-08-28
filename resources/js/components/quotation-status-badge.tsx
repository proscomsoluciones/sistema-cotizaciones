import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type QuotationStatusValue = 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';

const STYLES: Record<QuotationStatusValue, { badge: string; dot: string }> = {
    draft: {
        badge: 'border-slate-200 bg-slate-100/80 text-slate-700 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300',
        dot: 'bg-slate-500',
    },
    sent: {
        badge: 'border-sky-200 bg-sky-50/90 text-sky-700 dark:border-sky-800/70 dark:bg-sky-950/80 dark:text-sky-300',
        dot: 'bg-sky-500 animate-pulse',
    },
    approved: {
        badge: 'border-emerald-200 bg-emerald-50/90 text-emerald-700 dark:border-emerald-800/70 dark:bg-emerald-950/80 dark:text-emerald-300',
        dot: 'bg-emerald-500',
    },
    rejected: {
        badge: 'border-rose-200 bg-rose-50/90 text-rose-700 dark:border-rose-800/70 dark:bg-rose-950/80 dark:text-rose-300',
        dot: 'bg-rose-500',
    },
    expired: {
        badge: 'border-amber-200 bg-amber-50/90 text-amber-700 dark:border-amber-800/70 dark:bg-amber-950/80 dark:text-amber-300',
        dot: 'bg-amber-500',
    },
};

const LABELS: Record<QuotationStatusValue, string> = {
    draft: 'Borrador',
    sent: 'Enviada',
    approved: 'Aprobada',
    rejected: 'Rechazada',
    expired: 'Expirada',
};

export function QuotationStatusBadge({ status }: { status: QuotationStatusValue }) {
    const config = STYLES[status] ?? STYLES.draft;

    return (
        <Badge
            variant="outline"
            className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium shadow-2xs', config.badge)}
        >
            <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
            {LABELS[status]}
        </Badge>
    );
}

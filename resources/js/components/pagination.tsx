import { Link, router } from '@inertiajs/react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { Paginated, PaginationLink } from '@/types/pagination';

export default function Pagination<T>({ paginated }: { paginated: Paginated<T> }) {
    function handlePerPageChange(val: string) {
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set('per_page', val);
        urlParams.set('page', '1');

        router.get(
            `${window.location.pathname}?${urlParams.toString()}`,
            {},
            { preserveState: true, replace: true }
        );
    }

    const perPageValue = String(paginated.per_page ?? 10);

    return (
        <nav className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200/80 pt-4 dark:border-slate-800/80">
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <span>
                    Mostrando <strong className="font-semibold text-slate-700 dark:text-slate-300">{paginated.from ?? 0}–{paginated.to ?? 0}</strong> de <strong className="font-semibold text-slate-700 dark:text-slate-300">{paginated.total}</strong> registros
                </span>

                <div className="flex items-center gap-1.5">
                    <span>Mostrar:</span>
                    <Select value={perPageValue} onValueChange={handlePerPageChange}>
                        <SelectTrigger className="h-8 w-20 bg-card text-xs">
                            <SelectValue placeholder={perPageValue} />
                        </SelectTrigger>
                        <SelectContent className="min-w-20">
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                    </Select>
                    <span>por página</span>
                </div>
            </div>

            {paginated.last_page > 1 && (
                <div className="flex flex-wrap gap-1">
                    {paginated.links.map((link: PaginationLink, index) => (
                        <PaginationItem key={index} link={link} />
                    ))}
                </div>
            )}
        </nav>
    );
}

function PaginationItem({ link }: { link: PaginationLink }) {
    const className = cn(
        'flex h-8 min-w-8 items-center justify-center rounded-lg border px-2.5 text-xs font-medium transition-colors',
        link.active
            ? 'border-[#0A2540] bg-[#0A2540] text-white shadow-2xs dark:border-blue-600 dark:bg-blue-600'
            : 'border-slate-200 bg-card text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800',
        !link.url && 'pointer-events-none opacity-40'
    );

    if (!link.url) {
        return (
            <span className={className} dangerouslySetInnerHTML={{ __html: link.label }} />
        );
    }

    return (
        <Link href={link.url} className={className} preserveScroll dangerouslySetInnerHTML={{ __html: link.label }} />
    );
}

import { Head, router } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';
import type { FormEvent} from 'react';
import { useState } from 'react';
import ConfirmDeleteDialog from '@/components/confirm-delete-dialog';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
import { ProductDialog } from '@/components/product-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/currency';
import { destroy, index } from '@/routes/productos';
import type { BreadcrumbItem } from '@/types';
import type { Product } from '@/types/models';
import type { Paginated } from '@/types/pagination';

type Props = {
    products: Paginated<Product>;
    filters: { search?: string };
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Productos', href: index() }];

export default function ProductsIndex({ products, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    function submitSearch(e: FormEvent) {
        e.preventDefault();
        router.get(index().url, { search }, { preserveState: true, replace: true });
    }

    return (
        <>
            <Head title="Productos" />

            <div className="space-y-6 p-4 md:p-6 lg:p-8 w-full max-w-7xl mx-auto">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <Heading title="Catálogo de Productos y Servicios" description="Administra los ítems predefinidos para agilizar tus cotizaciones" />
                    <ProductDialog />
                </div>

                <form onSubmit={submitSearch} className="flex max-w-sm gap-2">
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar por nombre..."
                        className="bg-card"
                    />
                    <Button type="submit" variant="secondary">
                        Buscar
                    </Button>
                </form>

                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-card shadow-xs dark:border-slate-800/80">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-slate-100 bg-slate-50/80 dark:border-slate-800/60 dark:bg-slate-900/60">
                                <TableHead className="py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Nombre</TableHead>
                                <TableHead className="py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">SKU / Código</TableHead>
                                <TableHead className="py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Precio Unitario</TableHead>
                                <TableHead className="py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Unidad</TableHead>
                                <TableHead className="py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Estado</TableHead>
                                <TableHead className="py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.data.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-12 text-center text-slate-500">
                                        No hay productos o servicios registrados que coincidan con la búsqueda.
                                    </TableCell>
                                </TableRow>
                            )}
                            {products.data.map((product) => (
                                <TableRow key={product.id} className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-900/50">
                                    <TableCell className="font-semibold text-slate-900 dark:text-slate-100">{product.name}</TableCell>
                                    <TableCell className="text-xs text-slate-500 font-mono">{product.sku ?? '—'}</TableCell>
                                    <TableCell className="font-medium text-slate-900 dark:text-slate-100">{formatCurrency(product.unit_price)}</TableCell>
                                    <TableCell className="text-xs text-slate-500">{product.unit}</TableCell>
                                    <TableCell>
                                        <Badge variant={product.active ? 'default' : 'secondary'} className={product.active ? 'bg-emerald-500/15 text-emerald-700 border-emerald-300 dark:text-emerald-300' : ''}>
                                            {product.active ? 'Activo' : 'Inactivo'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1.5">
                                            <ProductDialog
                                                product={product}
                                                trigger={
                                                    <Button variant="ghost" size="icon" title="Editar producto">
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                }
                                            />
                                            <ConfirmDeleteDialog
                                                trigger={
                                                    <Button variant="ghost" size="icon" title="Eliminar producto">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                }
                                                title={`Eliminar ${product.name}`}
                                                description="Esta acción no se puede deshacer."
                                                url={destroy(product.id).url}
                                            />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <Pagination paginated={products} />
            </div>
        </>
    );
}

ProductsIndex.layout = { breadcrumbs };

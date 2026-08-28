import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import QuotationForm from '@/components/quotation-form';
import { index, update } from '@/routes/cotizaciones';
import type { BreadcrumbItem } from '@/types';
import type { ClientOption, ProductOption, Quotation } from '@/types/models';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Cotizaciones', href: index() },
    { title: 'Editar cotización', href: '#' },
];

export default function QuotationEdit({
    quotation,
    clients,
    products,
}: {
    quotation: Quotation;
    clients: ClientOption[];
    products: ProductOption[];
}) {
    return (
        <>
            <Head title={`Editar ${quotation.folio}`} />

            <div className="w-full max-w-7xl mx-auto space-y-6 p-4 md:p-6 lg:p-8">
                <div className="rounded-2xl border border-slate-200/80 bg-card p-6 shadow-xs dark:border-slate-800/80">
                    <div className="border-b border-slate-100 pb-5 mb-6 dark:border-slate-800/60">
                        <Heading title={`Editar ${quotation.folio}`} description={quotation.client?.name ?? ''} />
                    </div>

                    <QuotationForm
                        clients={clients}
                        products={products}
                        submitUrl={update(quotation.id).url}
                        method="put"
                        submitLabel="Guardar cambios"
                        initialData={{
                            client_id: String(quotation.client_id),
                            issue_date: quotation.issue_date,
                            valid_until: quotation.valid_until ?? '',
                            tax_rate: quotation.tax_rate,
                            notes: quotation.notes ?? '',
                            items: quotation.items.map((item) => ({
                                product_id: item.product_id ? String(item.product_id) : '',
                                description: item.description,
                                quantity: item.quantity,
                                unit_price: item.unit_price,
                            })),
                        }}
                    />
                </div>
            </div>
        </>
    );
}

QuotationEdit.layout = { breadcrumbs };

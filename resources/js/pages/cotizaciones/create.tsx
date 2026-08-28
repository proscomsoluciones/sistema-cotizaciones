import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import QuotationForm from '@/components/quotation-form';
import { index, store } from '@/routes/cotizaciones';
import type { BreadcrumbItem } from '@/types';
import type { ClientOption, ProductOption } from '@/types/models';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Cotizaciones', href: index() },
    { title: 'Nueva cotización', href: '#' },
];

export default function QuotationCreate({ clients, products }: { clients: ClientOption[]; products: ProductOption[] }) {
    const today = new Date().toISOString().slice(0, 10);

    return (
        <>
            <Head title="Nueva cotización" />

            <div className="w-full max-w-7xl mx-auto space-y-6 p-4 md:p-6 lg:p-8">
                <div className="rounded-2xl border border-slate-200/80 bg-card p-6 shadow-xs dark:border-slate-800/80">
                    <div className="border-b border-slate-100 pb-5 mb-6 dark:border-slate-800/60">
                        <Heading title="Nueva Cotización" description="Arma y configura una propuesta comercial completa para tu cliente" />
                    </div>

                    <QuotationForm
                        clients={clients}
                        products={products}
                        submitUrl={store().url}
                        method="post"
                        submitLabel="Guardar Cotización"
                        initialData={{
                            client_id: '',
                            issue_date: today,
                            valid_until: '',
                            tax_rate: '0',
                            notes: '',
                            items: [{ product_id: '', description: '', quantity: '1', unit_price: '0' }],
                        }}
                    />
                </div>
            </div>
        </>
    );
}

QuotationCreate.layout = { breadcrumbs };

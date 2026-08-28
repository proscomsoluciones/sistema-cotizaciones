import type { PaymentStatusValue } from '@/components/payment-status-badge';
import type { QuotationStatusValue } from '@/components/quotation-status-badge';

export type Client = {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    tax_id: string | null;
    notes: string | null;
    legal_representative_name: string | null;
    legal_representative_rut: string | null;
    legal_representative_reference: string | null;
    quotations_count?: number;
    created_at: string;
    updated_at: string;
};

export type ClientOption = Pick<Client, 'id' | 'name'>;

export type Product = {
    id: number;
    name: string;
    description: string | null;
    unit_price: string;
    unit: string;
    sku: string | null;
    active: boolean;
    created_at: string;
    updated_at: string;
};

export type ProductOption = Pick<Product, 'id' | 'name' | 'unit_price' | 'unit'>;

export type QuotationItem = {
    id: number;
    quotation_id: number;
    product_id: number | null;
    product?: Product | null;
    description: string;
    quantity: string;
    unit_price: string;
    subtotal: string;
};

export type PaymentMethod = 'transferencia' | 'efectivo' | 'tarjeta' | 'cheque' | 'otro';

export type ContractPayment = {
    id: number;
    contract_id: number;
    label: string;
    percentage: string | null;
    amount: string;
    due_date: string | null;
    status: PaymentStatusValue;
    is_overdue: boolean;
    paid_at: string | null;
    paid_amount: string | null;
    payment_method: PaymentMethod | null;
    notes: string | null;
    order: number;
};

export type Contract = {
    id: number;
    quotation_id: number;
    client_id: number;
    client?: Client;
    quotation?: Quotation;
    contract_number: string;
    start_date: string;
    end_date: string | null;
    total_amount: string;
    terms: string;
    pdf_path: string | null;
    generated_at: string | null;
    payments: ContractPayment[];
    paid_total: number;
    pending_total: number;
};

export type Quotation = {
    id: number;
    folio: string;
    client_id: number;
    client: Client;
    status: QuotationStatusValue;
    issue_date: string;
    valid_until: string | null;
    subtotal: string;
    tax_rate: string;
    tax_amount: string;
    total: string;
    notes: string | null;
    approval_token: string | null;
    sent_at: string | null;
    approved_at: string | null;
    rejected_at: string | null;
    items: QuotationItem[];
    contract: Contract | null;
};

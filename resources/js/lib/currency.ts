const formatter = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
});

export function formatCurrency(value: string | number): string {
    const amount = typeof value === 'string' ? parseFloat(value) : value;

    return formatter.format(Number.isFinite(amount) ? amount : 0);
}

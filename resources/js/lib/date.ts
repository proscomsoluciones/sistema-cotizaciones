export function formatDate(dateString?: string | null): string {
    if (!dateString) return '—';
    const cleanDate = dateString.split('T')[0];
    const parts = cleanDate.split('-');
    if (parts.length !== 3) return dateString;
    const [year, month, day] = parts;
    return `${day}-${month}-${year}`;
}

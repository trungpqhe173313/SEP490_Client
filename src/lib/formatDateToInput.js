export const formatDateToInput = (dt) => {
    if (!dt) return "";
    if (typeof dt === 'string') return dt.split('T')[0];
    return dt.toISOString().split('T')[0];
}
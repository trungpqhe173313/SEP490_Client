export const formatLargeNumber = (number) => {
    if (number === null || isNaN(number)) return 0;
    return number.toLocaleString('vi-VN', { maximumFractionDigits: 0 });
}
export const formatImageURL = (url) => {
    if (typeof url === 'string') {
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        return `${process.env.NEXT_PUBLIC_CLOUDINARY_LINK}${url}`;
    }
    return URL.createObjectURL(url);
};

export const removeLeadingZero = (number) => {
    if (number === null || isNaN(number) || number == 0) return 0;
    let result = number.toString().replace(/^0+/, '');
    if (result.startsWith('.')) result = '0' + result;
    return result;
}

export const removeVietnameseTones = (str) => {
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .toLowerCase();
};

export const formatLargeNumber = (number) => {
    if (number === null || isNaN(number)) return 0;
    //if (number < 0) return (number * -1).toLocaleString('vi-VN', { maximumFractionDigits: 0 });
    return number.toLocaleString('vi-VN', { maximumFractionDigits: 0 });
}

export const formatDateToInput = (dt) => {
    if (!dt || isNaN(Date.parse(dt))) return "";
    let dateStr = "";
    if (typeof dt === 'string') {
        dateStr = dt.split('T')[0];
    } else {
        dateStr = dt.toISOString().split('T')[0];
    }
    // Only allow 4-digit years for input type="date"
    const match = dateStr.match(/^(\d{4,})-(\d{2})-(\d{2})$/);
    if (match) {
        // Clamp year to 9999 if too large
        const year = Math.min(parseInt(match[1], 10), 9999).toString().padStart(4, "0");
        return `${year}-${match[2]}-${match[3]}`;
    }
    // If not, fallback to today's date or empty string
    return new Date().toISOString().split('T')[0];
}

export const convertKgToTon = (kg) => {
    if (typeof kg !== "number" || isNaN(kg)) return "0 tấn";
    const ton = kg / 1000;
    const rounded = Math.round(ton * 1000) / 1000;
    const formatted = rounded.toString().replace(".", ",");
    return `${formatted} tấn`;
};
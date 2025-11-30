export const formatImageURL = (url) => {
    if (typeof url === 'string') {
        return `${process.env.NEXT_PUBLIC_CLOUDINARY_LINK}${url}`;
    }
    return URL.createObjectURL(url);
};

export const formatLargeNumber = (number) => {
    if (number === null || isNaN(number)) return 0;
    //if (number < 0) return (number * -1).toLocaleString('vi-VN', { maximumFractionDigits: 0 });
    return number.toLocaleString('vi-VN', { maximumFractionDigits: 0 });
}

export const formatDateToInput = (dt) => {
    if (!dt) return "";
    if (typeof dt === 'string') return dt.split('T')[0];
    return dt.toISOString().split('T')[0];
}

export const convertKgToTon = (kg) => {
  if (typeof kg !== "number" || isNaN(kg)) return "0 tấn";
  const ton = kg / 1000;
  const rounded = Math.round(ton * 1000) / 1000;
  const formatted = rounded.toString().replace(".", ",");
  return `${formatted} tấn`;
};
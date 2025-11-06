export const numberToVietnamese = (num) => {
  if (typeof num !== 'number' || isNaN(num)) return 'Không hợp lệ';

  const units = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];
  const digits = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

  const readTriple = (number) => {
    let hundred = Math.floor(number / 100);
    let ten = Math.floor((number % 100) / 10);
    let unit = number % 10;
    let result = '';

    if (hundred > 0) {
      result += digits[hundred] + ' trăm';
      if (ten === 0 && unit > 0) result += ' linh';
    } else if (ten > 0 || unit > 0) {
      result += 'không trăm';
      if (ten === 0) result += ' linh';
    }

    if (ten > 1) {
      result += ' ' + digits[ten] + ' mươi';
      if (unit === 1) result += ' mốt';
      else if (unit === 5) result += ' lăm';
      else if (unit > 0) result += ' ' + digits[unit];
    } else if (ten === 1) {
      result += ' mười';
      if (unit === 1) result += ' một';
      else if (unit === 5) result += ' lăm';
      else if (unit > 0) result += ' ' + digits[unit];
    } else if (unit > 0) {
      result += ' ' + digits[unit];
    }

    return result.trim();
  };

  if (num < 0) return 'Âm ' + numberToVietnamese(-num);
  if (num === 0) return 'Không đồng';

  if (!Number.isInteger(num)) {
    const [intPart, decimalPart] = num.toString().split('.');
    let result =
      numberToVietnamese(parseInt(intPart)) +
      ' phẩy ' +
      decimalPart.split('').map((d) => digits[d]).join(' ');
    result = result.charAt(0).toUpperCase() + result.slice(1);
    return result + ' đồng';
  }

  let result = '';
  let unitIndex = 0;

  while (num > 0 && unitIndex < units.length) {
    const triple = num % 1000;
    if (triple > 0) {
      const tripleText = readTriple(triple);
      result = tripleText + ' ' + units[unitIndex] + ' ' + result;
    }
    num = Math.floor(num / 1000);
    unitIndex++;
  }

  result = result.trim();
  // Uppercase first letter
  result = result.charAt(0).toUpperCase() + result.slice(1);
  // Add "đồng"
  result += ' đồng';

  return result;
};

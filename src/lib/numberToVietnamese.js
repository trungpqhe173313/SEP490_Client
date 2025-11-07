export const numberToVietnamese = (num) => {
  if (typeof num !== 'number' || isNaN(num)) return 'Không hợp lệ';

  const units = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];
  const digits = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

  const readTriple = (number, fullReading) => {
    let hundred = Math.floor(number / 100);
    let ten = Math.floor((number % 100) / 10);
    let unit = number % 10;
    let result = '';

    if (hundred > 0) {
      result += digits[hundred] + ' trăm';
      if (ten === 0 && unit > 0) result += ' linh';
    } else if (fullReading && (ten > 0 || unit > 0)) {
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
    } else if (ten === 0 && unit > 0) {
      result += ' ' + digits[unit];
    }

    return result.trim();
  };

  // Handle negative
  if (num < 0) return 'Âm ' + numberToVietnamese(-num);

  // Handle zero
  if (num === 0) return 'Không đồng';

  // Handle decimal
  if (!Number.isInteger(num)) {
    const [intPart, decimalPart] = num.toString().split('.');
    let result =
      numberToVietnamese(parseInt(intPart)) +
      ' phẩy ' +
      decimalPart.split('').map((d) => digits[d]).join(' ');
    result = result.charAt(0).toUpperCase() + result.slice(1);
    return result + ' đồng';
  }

  // Split into groups of 3 digits
  const groups = [];
  while (num > 0) {
    groups.push(num % 1000);
    num = Math.floor(num / 1000);
  }

  let result = '';
  for (let i = groups.length - 1; i >= 0; i--) {
    const group = groups[i];
    const unitName = units[i];
    const fullReading = i < groups.length - 1 && group < 100 && group > 0;
    if (group > 0) {
      result += readTriple(group, fullReading) + ' ' + unitName + ' ';
    }
  }

  result = result.trim();
  result = result.charAt(0).toUpperCase() + result.slice(1);
  result += ' đồng';

  return result;
};

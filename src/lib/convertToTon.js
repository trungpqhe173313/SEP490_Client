export const convertKgToTon = (kg) => {
  if (typeof kg !== "number" || isNaN(kg)) return "0 tấn";
  const ton = kg / 1000;
  const rounded = Math.round(ton * 100) / 100;
  const formatted = rounded.toString().replace(".", ",");
  return `${formatted} tấn`;
};


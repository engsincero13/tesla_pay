export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatCompactCurrency = (value: number): string => {
  if (Math.abs(value) >= 1000) {
    return 'R$ ' + (value / 1000).toLocaleString('pt-BR', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }) + 'k';
  }
  return formatCurrency(value);
};

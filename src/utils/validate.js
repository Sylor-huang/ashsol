/**
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}

export function sliceString(str, len) {
  if (!str) return "";
  return `${str.slice(0, len)}...${str.slice(-len)}`;
};

export function tableIndex(index, pagies) {
  return (pagies.page - 1) * pagies.pageSize + 1 + index;
}

export function formatNumber(num, digits = 1){
  const lookup = [
    { value: 1e12, symbol: 'T' },
    { value: 1e9, symbol: 'B' },
    { value: 1e6, symbol: 'M' },
    { value: 1e3, symbol: 'K' }
  ];

  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  const item = lookup.find(item => absNum >= item.value);
  if (!item) return sign + absNum.toFixed(digits);
  const formattedNum = (absNum / item.value).toFixed(digits);
  const cleanNum = formattedNum.replace(/\.?0+$/, '');
  return sign + cleanNum + item.symbol;
};

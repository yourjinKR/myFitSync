import React from 'react';

const MoneyFormatter = ({ amount, currency = 'KRW', symbol = true }) => {
  if (isNaN(amount)) return null;

  const formatter = new Intl.NumberFormat('ko-KR', {
    style: symbol ? 'currency' : 'decimal',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return <span>{formatter.format(amount)}</span>;
};

export default MoneyFormatter;

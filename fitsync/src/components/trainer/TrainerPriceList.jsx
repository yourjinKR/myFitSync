import React from 'react';
import styled from 'styled-components';

const Section = styled.section`
  padding: 24px 0;
  border-bottom: 1px solid #eee;
`;

const SectionTitle = styled.h3`
  font-weight: bold;
  margin-bottom: 16px;
  font-size: 1.3rem;
  color: #222;
`;

const PriceItem = styled.div`
  background-color: #444;
  padding: 16px;
  border-radius: 10px;
  margin-bottom: 16px;
  color: #fff;
  font-size: 1.15rem;
  line-height: 1.6;

  strong {
    font-size: 1.2rem;
    color: #fff;
  }
`;

const Input = styled.input`
  width: 100%;
  font-size: 1.1rem;
  padding: 10px;
  margin-bottom: 16px;
  border-radius: 8px;
  border: 1px solid #ccc;
`;

const TrainerPriceList = ({ priceBase, isEdit, onChange }) => {
  const discountRates = { 1: 0, 10: 0.1, 30: 0.2, 50: 0.3 };

  return (
    <Section>
      <SectionTitle>가격표</SectionTitle>

      {isEdit && (
        <Input
          type="number"
          value={priceBase}
          onChange={(e) => onChange('priceBase', parseInt(e.target.value || '0'))}
          placeholder="기본 회당 가격을 입력하세요"
        />
      )}

      {[50, 30, 10, 1].map((count) => {
        const discount = discountRates[count];
        const pricePer = Math.round(priceBase * (1 - discount));
        const total = pricePer * count;

        return (
          <PriceItem key={count}>
            <div>
              <strong>{count}회</strong> &nbsp;&nbsp; 회당 {pricePer.toLocaleString()}원
            </div>
            <div>총금액 {total.toLocaleString()}원</div>
          </PriceItem>
        );
      })}
    </Section>
  );
};

export default TrainerPriceList;

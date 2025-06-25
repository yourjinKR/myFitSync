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

const TrainerPriceList = ({ priceBase }) => {
  return (
    <Section>
      <SectionTitle>가격표</SectionTitle>
      {[50, 30, 10, 1].map((count) => {
        const discount =
          count === 1 ? 0 : count === 10 ? 0.1 : count === 30 ? 0.2 : 0.3;
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

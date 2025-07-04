import React from 'react';
import styled from 'styled-components';
import TrainerIntroduce from './TrainerIntroduce';
import TrainerPriceList from './TrainerPriceList';

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

const CertList = styled.ul`
  list-style: none;
  padding-left: 0;
  font-size: 1.15rem;
  color: #333;

  li {
    margin-bottom: 10px;
  }
`;

const InfoContent = styled.div`
  font-size: 1.15rem;
  color: #444;
  line-height: 1.6;
  white-space: pre-line;
`;

const ReviewItem = styled.div`
  padding: 14px;
  margin-bottom: 12px;
  background-color: #f9f9f9;
  border-radius: 8px;
  font-size: 1.1rem;
  color: #444;
  line-height: 1.6;

  strong {
    display: block;
    color: #777;
    margin-bottom: 4px;
    font-size: 0.9rem;
  }

  h4 {
    margin: 4px 0 6px;
    font-size: 1.15rem;
    font-weight: bold;
    color: #222;
  }
`;

const MoreButton = styled.button`
  margin-top: 10px;
  background: none;
  border: none;
  color: #007aff;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  padding: 0;
`;

const TrainerIntroSection = ({ trainer, onMoreClick, isEdit, onChange, lessons, onLessonsChange }) => {
  return (
    <>
      {/* 소개 + 이미지 */}
      <Section>
        <SectionTitle>선생님 소개</SectionTitle>
        <TrainerIntroduce
          images={trainer.images}
          description={trainer.description}
          isEdit={isEdit}
          onChange={onChange}
        />
      </Section>

      {/* 자격증 */}
      <Section>
        <SectionTitle>검증된 자격 사항</SectionTitle>
        <CertList>
          {trainer.certifications.map((cert, i) => (
            <li key={i}>📜 {cert}</li>
          ))}
        </CertList>
      </Section>

      {/* 레슨 시간 */}
      <Section>
        <SectionTitle>레슨 가능 시간</SectionTitle>
        <InfoContent>{trainer.availableTime}</InfoContent>
      </Section>

      {/* 최근 후기 */}
      <Section>
        <SectionTitle>최근 후기</SectionTitle>
        {trainer.reviewList
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 2)
          .map((review) => (
            <ReviewItem key={review.id}>
              <strong>{review.date}</strong>
              <h4>{review.title}</h4>
              <div>{review.content}</div>
            </ReviewItem>
          ))}
        <MoreButton onClick={onMoreClick}>더 보기 →</MoreButton>
      </Section>

      {/* 가격표 */}
      <TrainerPriceList
        lessons={lessons || []}
        isEdit={isEdit}
        onLessonsChange={onLessonsChange}
      />
    </>
  );
};

export default TrainerIntroSection;

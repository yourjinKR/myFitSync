import React from 'react';
import styled from 'styled-components';
import TrainerIntroduce from './TrainerIntroduce';
import TrainerPriceList from './TrainerPriceList';
import axios from 'axios';

const Section = styled.section`
  padding: 24px 0;
  border-bottom: 1px solid var(--border-light);
  background: var(--bg-secondary);
`;

const SectionTitle = styled.h3`
  font-weight: bold;
  margin-bottom: 16px;
  font-size: 1.3rem;
  color: var(--text-primary);
`;

const CertList = styled.ul`
  list-style: none;
  padding-left: 0;
  font-size: 1.15rem;
  color: var(--text-primary);

  li {
    margin-bottom: 10px;
  }
`;

const InfoContent = styled.div`
  font-size: 1.15rem;
  color: var(--text-secondary);
  line-height: 1.6;
  white-space: pre-line;
`;

const ReviewItem = styled.div`
  padding: 14px;
  margin-bottom: 12px;
  background-color: var(--bg-tertiary);
  border-radius: 8px;
  font-size: 1.1rem;
  color: var(--text-primary);
  line-height: 1.6;

  strong {
    display: block;
    color: var(--text-tertiary);
    margin-bottom: 4px;
    font-size: 0.9rem;
  }

  h4 {
    margin: 4px 0 6px;
    font-size: 1.15rem;
    font-weight: bold;
    color: var(--primary-blue);
  }
`;

const MoreButton = styled.button`
  margin-top: 10px;
  background: none;
  border: none;
  color: var(--primary-blue);
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  padding: 0;
  &:hover {
    color: var(--primary-blue-hover);
  }
`;

const TrainerIntroSection = ({ trainer, onMoreClick, isEdit, onChange, lessons, onLessonsChange }) => {
  const handleImageUpload = async (formData) => {
  try {
    const res = await axios.post('/trainer/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      withCredentials: true,
    });
    return res.data;
  } catch (err) {
    console.error('업로드 실패', err);
    alert('업로드 실패');
    return null;
  }
};
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
          onImageUpload={handleImageUpload}
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
        onChange={onChange}
      />
    </>
  );
};

export default TrainerIntroSection;

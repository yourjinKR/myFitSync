import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import TrainerProfileHeader from './TrainerProfileHeader';
import TrainerIntroSection from './TrainerIntroSection';
import TrainerReviewSection from './TrainerReviewSection';


const Wrapper = styled.div`
  max-width: 480px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', sans-serif;
  background-color: #fff;
  font-size: 1.1rem;
`;

const TabMenu = styled.div`
  display: flex;
  margin-top: 24px;
  border-bottom: 1px solid #ccc;
`;

const TabButton = styled.button`
  flex: 1;
  padding: 14px 0;
  border: none;
  background: none;
  font-weight: 600;
  font-size: 1.2rem;
  color: ${({ active }) => (active ? '#007aff' : '#999')};
  border-bottom: 3px solid ${({ active }) => (active ? '#007aff' : 'transparent')};
  cursor: pointer;
  transition: all 0.3s;
`;



const TrainerDetailView = () => {
  const [activeTab, setActiveTab] = useState('소개');

  const trainer = {
    name: '홍길동',
    level: '★☆☆☆☆',
    rating: 5.0,
    reviews: 17,
    quote: '나를 죽이지 못하는 고통은 나를 더욱 강하게 만든다.',
    images: Array(6).fill('사진'),
    description: '5년 경력 트레이너입니다.\n다이어트, 체형 교정, 근력 향상 전문!',
    certifications: ['NASM CPT', '생활스포츠지도사 2급'],
    specialties: ['체형 교정', '다이어트'],
    availableTime: '월~토 06:00 ~ 23:00 (일요일 휴무)',
    priceBase: 50000,
    reviewList: [
      {
        id: 1,
        date: '2025-06-23',
        title: '정말 친절한 트레이너!',
        content: '처음 운동하는 저에게도 친절하게 잘 알려주셨어요.',
      },
      {
        id: 2,
        date: '2025-06-21',
        title: '정확한 자세 교정',
        content: '자세 하나하나 체크해주셔서 효과가 확실했어요.',
      },
      {
        id: 3,
        date: '2025-06-20',
        title: '3kg 감량 성공!',
        content: '한 달 만에 3kg 빠졌어요. 믿고 맡기세요!',
      },
    ],
  };

  return (
    <Wrapper>
      <TrainerProfileHeader trainer={trainer} />
      <TabMenu>
        <TabButton active={activeTab === '소개'} onClick={() => setActiveTab('소개')}>
          소개
        </TabButton>
        <TabButton active={activeTab === '후기'} onClick={() => setActiveTab('후기')}>
          후기
        </TabButton>
      </TabMenu>

      {activeTab === '소개' && (
        <TrainerIntroSection trainer={trainer} onMoreClick={() => setActiveTab('후기')} />
      )}

      {activeTab === '후기' && (
        <TrainerReviewSection reviews={trainer.reviewList} />
      )}
    </Wrapper>
  );
};

export default TrainerDetailView;

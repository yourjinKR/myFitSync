import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';

// ✅ 애니메이션
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// ✅ 스타일 정의
const Wrapper = styled.div`
  max-width: 480px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', sans-serif;
  background-color: #fff;
  font-size: 1.05rem;
`;

const ProfileHeader = styled.div`
  text-align: center;
  padding-bottom: 20px;
  border-bottom: 1px solid #ddd;
`;

const ProfileImage = styled.div`
  width: 100px;
  height: 100px;
  margin: 0 auto 14px;
  background-color: #ccc;
  border-radius: 50%;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

const Name = styled.h2`
  font-size: 1.6rem;
  font-weight: bold;
  margin-bottom: 8px;
`;

const Rating = styled.p`
  color: #facc15;
  font-size: 1.2rem;

  span {
    color: #333;
  }
`;

const ReviewCount = styled.p`
  color: #666;
  font-size: 1rem;
  margin-top: 4px;
`;

const Quote = styled.p`
  font-style: italic;
  font-size: 1.05rem;
  color: #555;
  margin-top: 10px;
  padding: 0 10px;
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
  font-size: 1.15rem;
  color: ${({ active }) => (active ? '#007aff' : '#999')};
  border-bottom: 3px solid ${({ active }) => (active ? '#007aff' : 'transparent')};
  cursor: pointer;
  transition: all 0.3s;
`;

const Section = styled.section`
  padding: 24px 0;
  border-bottom: 1px solid #eee;
  animation: ${fadeIn} 0.4s ease-in-out;
`;

const SectionTitle = styled.h3`
  font-weight: bold;
  margin-bottom: 16px;
  font-size: 1.25rem;
  color: #222;
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 16px;
`;

const ImageBox = styled.div`
  background-color: #e2e2e2;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #555;
  font-size: 1rem;
  border-radius: 6px;
  box-shadow: inset 0 0 2px #aaa;
`;

const Description = styled.p`
  font-size: 1.1rem;
  color: #444;
  line-height: 1.7;
  white-space: pre-line;
`;

const InfoContent = styled.div`
  font-size: 1.1rem;
  color: #444;
  line-height: 1.6;
  white-space: pre-line;
`;

const CertList = styled.ul`
  list-style: none;
  padding-left: 0;
  font-size: 1.1rem;
  color: #333;

  li {
    margin-bottom: 10px;
  }
`;

const NoReview = styled.p`
  font-style: italic;
  font-size: 1rem;
  color: #888;
`;

const ReviewItem = styled.div`
  padding: 14px;
  margin-bottom: 12px;
  background-color: #f9f9f9;
  border-radius: 8px;
  font-size: 1rem;
  color: #444;
  line-height: 1.5;
  animation: ${fadeIn} 0.4s ease-in-out;
`;

// ✅ 컴포넌트
const TrainerDetailView = () => {
  const [activeTab, setActiveTab] = useState('소개');

  const trainer = {
    name: '홍길동',
    level: '★☆☆☆☆',
    rating: 5.0,
    reviews: 17,
    quote: '나를 믿지 못하는 그대는 나를 감당할 수 없다',
    images: Array(6).fill('사진'),
    description:
      '안녕하세요! 저는 5년 경력의 퍼스널 트레이너입니다.\n체형 교정부터 다이어트, 근력 향상까지 책임감 있게 도와드립니다!',
    certifications: ['NASM CPT', '생활스포츠지도사 2급'],
    availableTime: '월~토 06:00 ~ 23:00 (일요일 휴무)',
    reviewSummary: [
      '운동이 처음인데도 너무 친절하게 잘 알려주셔서 재밌게 하고 있어요!',
      '한 달 만에 체지방이 3kg 빠졌어요!',
    ],
    priceTable: ['1회: 50,000원', '5회: 240,000원', '10회: 450,000원'],
    reviewList: [
      { id: 1, content: '진짜 열정 넘치고 설명을 잘해줘요. 강추합니다!' },
      { id: 2, content: '운동 루틴이 체계적이라 믿고 따라갈 수 있었어요.' },
    ],
  };

  return (
    <Wrapper>
      <ProfileHeader>
        <ProfileImage />
        <Name>{trainer.name} 선생님</Name>
        <Rating>
          {trainer.level} <span>({trainer.rating})</span>
        </Rating>
        <ReviewCount>⭐ 후기 {trainer.reviews}개</ReviewCount>
        <Quote>"{trainer.quote}"</Quote>
      </ProfileHeader>

      <TabMenu>
        <TabButton active={activeTab === '소개'} onClick={() => setActiveTab('소개')}>
          소개
        </TabButton>
        <TabButton active={activeTab === '후기'} onClick={() => setActiveTab('후기')}>
          후기
        </TabButton>
      </TabMenu>

      {activeTab === '소개' && (
        <>
          <Section>
            <SectionTitle>선생님 소개</SectionTitle>
            <ImageGrid>
              {trainer.images.map((img, i) => (
                <ImageBox key={i}>{img}</ImageBox>
              ))}
            </ImageGrid>
            <Description>{trainer.description}</Description>
          </Section>

          <Section>
            <SectionTitle>검증된 자격 사항</SectionTitle>
            <CertList>
              {trainer.certifications.map((cert, i) => (
                <li key={i}>📜 {cert}</li>
              ))}
            </CertList>
          </Section>

          <Section>
            <SectionTitle>레슨 가능 시간</SectionTitle>
            <InfoContent>{trainer.availableTime}</InfoContent>
          </Section>

          <Section>
            <SectionTitle>최근 후기 요약</SectionTitle>
            <InfoContent>{trainer.reviewSummary.join('\n')}</InfoContent>
          </Section>

          <Section>
            <SectionTitle>가격표</SectionTitle>
            <InfoContent>{trainer.priceTable.join('\n')}</InfoContent>
          </Section>
        </>
      )}

      {activeTab === '후기' && (
        <Section>
          <SectionTitle>최근 후기</SectionTitle>
          {trainer.reviewList.length > 0 ? (
            trainer.reviewList.map((review) => (
              <ReviewItem key={review.id}>{review.content}</ReviewItem>
            ))
          ) : (
            <NoReview>아직 등록된 후기가 없습니다.</NoReview>
          )}
        </Section>
      )}
    </Wrapper>
  );
};

export default TrainerDetailView;

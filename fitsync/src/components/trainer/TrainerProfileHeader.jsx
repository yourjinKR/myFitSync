import React from 'react';
import styled from 'styled-components';

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
`;

const Name = styled.h2`
  font-size: 1.7rem;
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
  font-size: 1.05rem;
  margin-top: 4px;
`;

const Quote = styled.p`
  font-style: italic;
  font-size: 1.15rem;
  color: #555;
  margin-top: 10px;
  padding: 0 10px;
`;

const SummaryBox = styled.div`
  margin-top: 14px;
  padding: 16px;
  background-color: #f7f7f7;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 1.15rem;
  color: #333;
`;

const SummaryItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TrainerProfileHeader = ({ trainer }) => {
  return (
    <ProfileHeader>
      <ProfileImage />
      <Name>{trainer.name} 선생님</Name>
      <Rating>
        {trainer.level} <span>({trainer.rating})</span>
      </Rating>
      <ReviewCount>⭐ 후기 {trainer.reviews}개</ReviewCount>
      <Quote>"{trainer.quote}"</Quote>

      <SummaryBox>
        <SummaryItem>📜 자격증 {trainer.certifications.length}개</SummaryItem>
        <SummaryItem>🏋️‍♂️ 전문: {trainer.specialties.join(', ')}</SummaryItem>
        <SummaryItem>💰 1회 {trainer.priceBase.toLocaleString()}원</SummaryItem>
      </SummaryBox>
    </ProfileHeader>
  );
};

export default TrainerProfileHeader;

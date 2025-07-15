import React from 'react';
import styled from 'styled-components';
import { MdEdit, MdCheck } from 'react-icons/md'; // 수정/저장 아이콘

const ProfileHeader = styled.div`
  text-align: center;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-light);
  background: var(--bg-secondary);
`;

const ProfileImage = styled.div`
  width: 100px;
  height: 100px;
  margin: 0 auto 14px;
  background-color: var(--border-medium);
  border-radius: 50%;
`;

const NameWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const Name = styled.h2`
  font-size: 1.7rem;
  font-weight: bold;
  margin-bottom: 8px;
  color: var(--text-primary);
`;

const EditButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.6rem;
  color: var(--primary-blue);
  padding: 0;
  margin-bottom: 8px;

  &:hover {
    opacity: 0.8;
    color: var(--primary-blue-hover);
  }
`;

const ReviewCount = styled.p`
  color: var(--text-secondary);
  font-size: 1.05rem;
  margin-top: 4px;
`;

const Quote = styled.p`
  font-style: italic;
  font-size: 1.15rem;
  color: var(--text-secondary);
  margin-top: 10px;
  padding: 0 10px;
`;

const QuoteInput = styled.input`
  margin-top: 10px;
  padding: 8px 10px;
  width: 80%;
  font-size: 1.1rem;
  font-style: italic;
  border: 1px solid var(--border-light);
  border-radius: 6px;
  text-align: center;
  background: var(--bg-tertiary);
  color: var(--text-primary);
`;

const SummaryBox = styled.div`
  margin-top: 14px;
  padding: 16px;
  background-color: var(--bg-tertiary);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 1.15rem;
  color: var(--text-primary);
`;

const SummaryItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TrainerProfileHeader = ({ trainer, isEdit, onChange, onEditToggle, loginUserId }) => {
  return (
    <ProfileHeader>
      <ProfileImage />

      <NameWrapper>
        <Name>{trainer.name} 선생님</Name>

        {loginUserId && trainer?.member_email && loginUserId === trainer.member_email && (
          <EditButton onClick={onEditToggle} title={isEdit ? '저장하기' : '수정하기'}>
            {isEdit ? <MdCheck /> : <MdEdit />}
          </EditButton>
        )}
      </NameWrapper>

      <ReviewCount>⭐ 후기 {trainer.reviews}개</ReviewCount>

      {isEdit ? (
        <QuoteInput
          type="text"
          value={trainer.intro ?? ''}
          onChange={(e) => onChange('intro', e.target.value)}
          placeholder="한줄소개를 입력하세요"
        />
      ) : (
        <Quote>
          {trainer.intro && trainer.intro.trim() !== ''
            ? `"${trainer.intro}"`
            : '"한줄소개가 아직 등록되지 않았습니다."'}
        </Quote>
      )}

      <SummaryBox>
        <SummaryItem>📜 자격증 {trainer.certifications.length}개</SummaryItem>
        <SummaryItem>🏋️‍♂️ 전문: {(trainer.specialties || []).join(', ')}</SummaryItem>
        <SummaryItem>💰 1회 {trainer.priceBase.toLocaleString()}원</SummaryItem>
      </SummaryBox>
    </ProfileHeader>
  );
};

export default TrainerProfileHeader;

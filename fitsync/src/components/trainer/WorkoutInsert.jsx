import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalBox = styled.div`
  background: var(--bg-secondary);
  border-radius: 1rem;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  font-size: 1.4rem;
  color: var(--text-primary);
  border: 1px solid var(--border-light);
`;

const ButtonGroup = styled.div`
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;

  button {
    padding: 0.8rem 1.6rem;
    border: none;
    border-radius: 0.6rem;
    font-size: 1.3rem;
    cursor: pointer;
    transition: background 0.2s;
  }

  .go {
    background: var(--primary-blue);
    color: var(--text-primary);

    &:hover {
      background: var(--primary-blue-hover);
    }
  }

  .cancel {
    background: var(--bg-tertiary);
    color: var(--text-secondary);

    &:hover {
      background: var(--border-medium);
    }
  }
`;

const InfoRow = styled.div`
  margin-bottom: 1rem;
  line-height: 1.6;

  strong {
    color: var(--primary-blue);
  }
`;

const WorkoutInsert = ({
  onClose,
  memberName,
  memberIdx,
  trainerIdx,
  date,
  stime,
  etime,
  memo
}) => {
  const navigate = useNavigate();

  const handleGoToRoutineAdd = () => {
    navigate('/routine/add', {
      state: {
        memberName,
        memberIdx,
        trainerIdx,
        date,
        stime,
        etime,
        memo,
      },
    });
    onClose();
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalBox onClick={(e) => e.stopPropagation()}>
        <InfoRow><strong>{memberName}</strong>님</InfoRow>
        <InfoRow>날짜: {date}</InfoRow>
        <InfoRow>시간: {stime || '시간 없음'}~{etime || '시간 없음'}</InfoRow>
        <InfoRow>메모: {memo || '메모 없음'}</InfoRow>

        <ButtonGroup>
          <button className="cancel" onClick={onClose}>취소</button>
          <button className="go" onClick={handleGoToRoutineAdd}>운동 추가하러 가기</button>
        </ButtonGroup>
      </ModalBox>
    </ModalOverlay>
  );
};

export default WorkoutInsert;

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
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  font-size: 1.4rem;
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
  }

  .go {
    background: #5b6eff;
    color: white;
  }

  .cancel {
    background: #ccc;
    color: black;
  }
`;

const WorkoutInsert = ({ onClose, memberName, memberIdx, trainerIdx, date, time }) => {
  const navigate = useNavigate();

  const handleGoToRoutineAdd = () => {
    navigate('/routine/add', {
      state: {
        memberName,
        memberIdx,
        trainerIdx,
        date,
        time,
      },
    });
    onClose();
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalBox onClick={(e) => e.stopPropagation()}>
        <h3>운동 추가</h3>
        <p>
          <strong>{memberName}</strong>님<br />
          날짜: {date}<br />
          시간: {time || '시간 없음'}
        </p>
        <ButtonGroup>
          <button className="cancel" onClick={onClose}>취소</button>
          <button className="go" onClick={handleGoToRoutineAdd}>운동 추가하러 가기</button>
        </ButtonGroup>
      </ModalBox>
    </ModalOverlay>
  );
};

export default WorkoutInsert;

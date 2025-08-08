import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Backdrop = styled.div`
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      backdrop-filter: blur(0px);
    }
    to {
      opacity: 1;
      backdrop-filter: blur(8px);
    }
  }
`;

const Modal = styled.div`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  padding: 3rem;
  border-radius: 20px;
  box-shadow: 
    0 25px 60px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
  min-width: 400px;
  width: 90%;
  max-width: 550px;
  position: relative;
  overflow: hidden;
  animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(74, 144, 226, 0.5), transparent);
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(50px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @media (max-width: 600px) {
    min-width: unset;
    padding: 2.5rem 2rem;
    border-radius: 16px;
  }
`;

const Title = styled.h3`
  font-size: 2.4rem;
  font-weight: 700;
  margin-bottom: 2.5rem;
  color: var(--text-primary);
  text-align: center;
  position: relative;
  letter-spacing: -0.02em;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, var(--primary-blue), var(--primary-blue-light));
    border-radius: 2px;
  }
`;

const Field = styled.div`
  margin-bottom: 2rem;

  label {
    display: block;
    margin-bottom: 0.8rem;
    font-size: 1.4rem;
    font-weight: 600;
    color: var(--primary-blue);
    letter-spacing: -0.01em;
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      left: -8px;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 12px;
      background: linear-gradient(180deg, var(--primary-blue), var(--primary-blue-light));
      border-radius: 2px;
    }
  }

  input, select, textarea {
    width: 100%;
    padding: 1.2rem 1.6rem;
    border-radius: 12px;
    border: 2px solid var(--border-light);
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(10px);
    color: var(--text-primary);
    font-size: 1.4rem;
    font-weight: 500;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

    &:focus {
      border-color: var(--primary-blue);
      background: rgba(74, 144, 226, 0.05);
      box-shadow: 
        0 8px 25px rgba(74, 144, 226, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
      outline: none;
      transform: translateY(-1px);
    }

    &::placeholder {
      color: var(--text-tertiary);
      font-weight: 400;
    }
  }

  input[readonly] {
    background: rgba(255, 255, 255, 0.02);
    color: var(--text-secondary);
    cursor: not-allowed;
    border-color: var(--border-light);
    font-weight: 400;

    &:focus {
      transform: none;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border-color: var(--border-light);
    }
  }

  textarea {
    resize: vertical;
    min-height: 100px;
    line-height: 1.6;
    font-family: inherit;
  }

  div {
    padding: 1.2rem 1.6rem;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 12px;
    border: 1px solid var(--border-light);
    color: var(--text-secondary);
    font-size: 1.4rem;
    font-weight: 400;
    min-height: 20px;
    display: flex;
    align-items: center;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1.2rem;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);

  button {
    padding: 1.2rem 2.4rem;
    border: none;
    border-radius: 12px;
    font-size: 1.4rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    min-width: 120px;
    position: relative;
    overflow: hidden;
    letter-spacing: -0.01em;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
      transition: left 0.5s;
    }

    &:hover::before {
      left: 100%;
    }

    &:active {
      transform: translateY(1px);
    }
  }

  .primary {
    background: linear-gradient(135deg, var(--primary-blue), var(--primary-blue-light));
    color: white;
    box-shadow: 0 8px 25px rgba(74, 144, 226, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);

    &:hover {
      background: linear-gradient(135deg, var(--primary-blue-light), var(--primary-blue));
      box-shadow: 0 12px 35px rgba(74, 144, 226, 0.4);
      transform: translateY(-2px);
    }

    &:active {
      transform: translateY(0);
      box-shadow: 0 6px 20px rgba(74, 144, 226, 0.3);
    }
  }

  .secondary {
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-secondary);
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      color: var(--text-primary);
      transform: translateY(-1px);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }
  }

  .edit {
    background: rgba(74, 144, 226, 0.1);
    color: var(--primary-blue);
    border: 2px solid var(--primary-blue);
    backdrop-filter: blur(10px);

    &:hover {
      background: var(--primary-blue);
      color: white;
      transform: translateY(-1px);
      box-shadow: 0 8px 25px rgba(74, 144, 226, 0.3);
    }
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
  memo,
  scheduleIdx,
  onUpdate
}) => {
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);

  const [editDate, setEditDate] = useState(date);
  const [editStime, setEditStime] = useState(stime || '06:00');
  const [editEtime, setEditEtime] = useState(etime || '07:00');
  const [editMemo, setEditMemo] = useState(memo || '');

  const hours = Array.from({ length: 19 }, (_, i) => {
    const hour = 6 + i;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

const handleEditSubmit = async () => {
  if (!editDate || !editStime || !editEtime) {
    alert('모든 항목을 입력해주세요.');
    return;
  }

  if (editStime >= editEtime) {
    alert('종료 시간은 시작 시간보다 늦어야 합니다.');
    return;
  }

  try {
    await axios.put(`/trainer/schedule/update`, {
      schedule_idx: scheduleIdx,
      schedule_date: editDate,
      schedule_stime: editStime,
      schedule_etime: editEtime,
      schedule_content: editMemo,
    });

    alert('일정이 성공적으로 수정되었습니다.');
    setIsEditMode(false);

    if (typeof onUpdate === 'function') {
      onUpdate();
    }

    onClose();
  } catch (error) {
    console.error('일정 수정 실패:', error);
    alert('일정 수정 중 오류가 발생했습니다.');
  }
};
  const handleGoToRoutineAdd = () => {
    navigate('/routine/view', {
      state: {
        memberName,
        memberIdx,
        trainerIdx,
        date,
        stime,
        etime,
        memo,
        viewer: 'trainer',
        targetMember: memberIdx
      },
    });
    onClose();
  };

  return (
    <Backdrop onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Title>운동 정보</Title>

        <Field>
          <label>회원명</label>
          <input type="text" value={memberName} readOnly />
        </Field>

        {isEditMode ? (
          <>
            <Field>
              <label>날짜</label>
              <input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
              />
            </Field>

            <Field>
              <label>시작 시간</label>
              <select
                value={editStime}
                onChange={(e) => setEditStime(e.target.value)}
              >
                {hours.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </Field>

            <Field>
              <label>종료 시간</label>
              <select
                value={editEtime}
                onChange={(e) => setEditEtime(e.target.value)}
              >
                {hours.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </Field>

            <Field>
              <label>메모</label>
              <textarea
                placeholder="추가 메모를 입력하세요"
                value={editMemo}
                onChange={(e) => setEditMemo(e.target.value)}
              />
            </Field>
          </>
        ) : (
          <>
            <Field>
              <label>날짜</label>
              <div>{date}</div>
            </Field>
            <Field>
              <label>시간</label>
              <div>{stime || '시간 없음'} ~ {etime || '시간 없음'}</div>
            </Field>
            <Field>
              <label>메모</label>
              <div>{memo || '메모 없음'}</div>
            </Field>
          </>
        )}

        <ButtonGroup>
          <button className="secondary" onClick={onClose}>취소</button>
          {isEditMode ? (
            <button className="primary" onClick={handleEditSubmit}>수정 완료</button>
          ) : (
            <>
              <button className="edit" onClick={() => setIsEditMode(true)}>수정하기</button>
              <button className="primary" onClick={handleGoToRoutineAdd}>운동 일지 작성</button>
            </>
          )}
        </ButtonGroup>
      </Modal>
    </Backdrop>
  );
};

export default WorkoutInsert;

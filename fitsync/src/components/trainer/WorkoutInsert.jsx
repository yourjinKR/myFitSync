import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Backdrop = styled.div`
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(20px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2300;
  animation: fadeIn 0.3s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const Modal = styled.div`
  background: linear-gradient(145deg, rgba(42, 42, 42, 0.98), rgba(58, 58, 58, 0.95));
  border: 1px solid rgba(74, 144, 226, 0.3);
  padding: 4rem 3.5rem;
  border-radius: 24px;
  backdrop-filter: blur(40px);
  box-shadow: 
    0 40px 100px rgba(0, 0, 0, 0.5),
    0 20px 50px rgba(74, 144, 226, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  color: var(--text-primary);
  min-width: 400px;
  width: 90%;
  max-width: 580px;
  position: relative;
  animation: modalSlideUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);

  @keyframes modalSlideUp {
    from {
      opacity: 0;
      transform: translateY(60px) scale(0.85);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, transparent, rgba(74, 144, 226, 0.8), transparent);
    border-radius: 24px 24px 0 0;
  }

  @media (max-width: 600px) {
    padding: 3rem 2.5rem;
    border-radius: 20px;
    min-width: unset;
  }
`;

const Title = styled.h3`
  font-size: 2.4rem;
  font-weight: 700;
  margin-bottom: 3rem;
  background: linear-gradient(135deg, #4A90E2 0%, #63B8FF 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
  position: relative;
  text-shadow: 0 4px 8px rgba(74, 144, 226, 0.15);
  letter-spacing: -0.02em;

  &::after {
    content: '';
    position: absolute;
    bottom: -12px;
    left: 50%;
    width: 80px;
    height: 3px;
    background: linear-gradient(90deg, transparent, rgba(74, 144, 226, 0.8), transparent);
    border-radius: 2px;
    transform: translateX(-50%) scaleX(0);
    animation: titleUnderline 0.8s ease-out 0.4s forwards;
  }

  @keyframes titleUnderline {
    to { transform: translateX(-50%) scaleX(1); }
  }

  @media (max-width: 600px) {
    font-size: 2rem;
    margin-bottom: 2.5rem;
  }
`;

const Field = styled.div`
  margin-bottom: 2rem;
  position: relative;

  label {
    display: block;
    margin-bottom: 1rem;
    font-size: 1.5rem;
    font-weight: 600;
    background: linear-gradient(135deg, rgba(74, 144, 226, 0.9), rgba(99, 184, 255, 0.8));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    position: relative;
    padding-left: 1.5rem;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      width: 4px;
      height: 70%;
      background: linear-gradient(180deg, rgba(74, 144, 226, 0.8), rgba(99, 184, 255, 0.6));
      border-radius: 2px;
      transform: translateY(-50%);
    }
  }

  input, select, textarea {
    width: 100%;
    padding: 1.4rem 1.6rem;
    border-radius: 12px;
    border: 1px solid rgba(74, 144, 226, 0.2);
    background: linear-gradient(145deg, rgba(74, 144, 226, 0.05), rgba(99, 184, 255, 0.03));
    color: var(--text-primary);
    font-size: 1.4rem;
    transition: all 0.3s ease;
    box-shadow: 
      0 4px 15px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);

    &:focus {
      border-color: rgba(74, 144, 226, 0.5);
      background: linear-gradient(145deg, rgba(74, 144, 226, 0.08), rgba(99, 184, 255, 0.05));
      box-shadow: 
        0 8px 25px rgba(74, 144, 226, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
      outline: none;
    }

    &::placeholder {
      color: var(--text-tertiary);
      opacity: 0.7;
    }
  }

  input[readonly] {
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.01));
    color: var(--text-secondary);
    border-color: rgba(255, 255, 255, 0.1);
  }

  div {
    padding: 1.4rem 1.6rem;
    border-radius: 12px;
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.01));
    border: 1px solid rgba(255, 255, 255, 0.1);
    font-size: 1.4rem;
    color: var(--text-primary);
    min-height: 2.4rem;
  }

  textarea {
    resize: vertical;
    min-height: 100px;
    line-height: 1.6;
  }

  select {
    cursor: pointer;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%234A90E2' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
    background-position: right 1rem center;
    background-repeat: no-repeat;
    background-size: 1.5rem;
    padding-right: 3rem;
    appearance: none;
    background-color: #000000 !important;
    color: var(--text-primary);
  }

  option {
    background-color: #000000 !important;
    color: var(--text-primary);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1.5rem;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(74, 144, 226, 0.2);

  button {
    padding: 1.4rem 2.8rem;
    border: none;
    border-radius: 16px;
    font-size: 1.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    min-width: 120px;

    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.3), transparent);
      border-radius: 50%;
      transition: all 0.4s ease;
      transform: translate(-50%, -50%);
    }

    &:hover::before {
      width: 300px;
      height: 300px;
    }

    &:active {
      transform: translateY(-1px);
    }
  }

  .primary {
    background: linear-gradient(135deg, var(--primary-blue), var(--primary-blue-light));
    color: white;
    box-shadow: 0 12px 32px rgba(74, 144, 226, 0.3);

    &:hover {
      background: linear-gradient(135deg, var(--primary-blue-hover), var(--primary-blue));
      box-shadow: 0 16px 40px rgba(74, 144, 226, 0.4);
      transform: translateY(-3px);
    }

    &:active {
      transform: translateY(-1px);
    }
  }

  .secondary {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.05));
    color: var(--text-secondary);
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);

    &:hover {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08));
      color: var(--text-primary);
      border-color: rgba(255, 255, 255, 0.25);
      transform: translateY(-2px);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
    }
  }

  .edit {
    background: linear-gradient(135deg, rgba(74, 144, 226, 0.15), rgba(99, 184, 255, 0.1));
    color: var(--primary-blue);
    border: 1px solid rgba(74, 144, 226, 0.3);
    box-shadow: 0 8px 25px rgba(74, 144, 226, 0.15);

    &:hover {
      background: linear-gradient(135deg, rgba(74, 144, 226, 0.25), rgba(99, 184, 255, 0.2));
      border-color: rgba(74, 144, 226, 0.5);
      transform: translateY(-2px);
      box-shadow: 0 12px 32px rgba(74, 144, 226, 0.25);
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

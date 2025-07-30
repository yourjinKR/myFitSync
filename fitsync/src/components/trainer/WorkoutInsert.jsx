import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Backdrop = styled.div`
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: var(--bg-secondary);
  padding: 2rem 2.5rem;
  border-radius: 1.2rem;
  box-shadow: 0 0.2rem 1rem rgba(0, 0, 0, 0.15);
  color: var(--text-primary);
  min-width: 340px;
  width: 90%;
  max-width: 500px;
`;

const Title = styled.h3`
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 1.6rem;
  color: var(--primary-blue);
`;

const Field = styled.div`
  margin-bottom: 1.2rem;

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--text-secondary);
  }

  input, select, textarea {
    width: 100%;
    padding: 0.6rem 1rem;
    border-radius: 0.8rem;
    border: 1px solid var(--border-light);
    background: var(--bg-primary);
    color: var(--text-primary);
    font-size: 1.2rem;
  }

  input[readonly] {
    background: var(--bg-tertiary);
    color: var(--text-secondary);
    cursor: not-allowed;
  }

  textarea {
    resize: vertical;
    min-height: 60px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.8rem;
  margin-top: 1.6rem;

  button {
    padding: 0.6rem 1.4rem;
    border: none;
    border-radius: 0.8rem;
    font-size: 1.2rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
  }

  .primary {
    background: var(--primary-blue);
    color: var(--text-primary);

    &:hover {
      background: var(--primary-blue-hover);
    }
  }

  .secondary {
    background: var(--bg-tertiary);
    color: var(--text-secondary);

    &:hover {
      background: var(--bg-hover);
    }
  }

  .edit {
    background: var(--bg-tertiary);
    color: var(--primary-blue);
    border: 1px solid var(--primary-blue);

    &:hover {
      background: var(--primary-blue);
      color: var(--text-primary);
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

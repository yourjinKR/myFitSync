import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';

const Backdrop = styled.div`
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999; /* 좀 더 높게 */
`;

const Modal = styled.div`
  background: var(--bg-secondary);
  padding: 2rem 2.5rem;
  border-radius: 1.2rem;
  box-shadow: 0 0.2rem 1rem rgba(0, 0, 0, 0.15);
  color: var(--text-primary);
  min-width: 340px;
  width: 100%;
  max-width: 420px;
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

  select, input, textarea {
    width: 100%;
    padding: 0.6rem 1rem;
    border-radius: 0.8rem;
    border: 1px solid var(--border-light);
    background: var(--bg-primary);
    color: var(--text-primary);
    font-size: 1.2rem;
  }

  input::placeholder, textarea::placeholder {
    color: var(--text-tertiary);
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

  button:first-child {
    background: var(--primary-blue);
    color: var(--text-primary);
  }

  button:first-child:hover {
    background: var(--primary-blue-hover);
  }

  button:last-child {
    background: var(--bg-tertiary);
    color: var(--text-secondary);
  }

  button:last-child:hover {
    background: var(--bg-hover);
  }
`;

const ScheduleInsertModal = ({ members = [], trainerIdx, selectedDate, onClose, onInsert }) => {
  const [selectedMember, setSelectedMember] = useState('');
  const [customMember, setCustomMember] = useState('');
  const [startTime, setStartTime] = useState('06:00');
  const [endTime, setEndTime] = useState('07:00');
  const [useCustom, setUseCustom] = useState(false);
  const [memo, setMemo] = useState('');

  const modalRef = useRef();

  const hours = Array.from({ length: 19 }, (_, i) => {
    const hour = (6 + i) % 24;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  const handleSubmit = () => {
    const scheduleName = useCustom ? customMember.trim() : selectedMember;

    if (!scheduleName || !startTime || !endTime) {
      alert('모든 항목을 입력해주세요.');
      return;
    }

    const member = members.find((m) => m.member_name === selectedMember);
    const userIdxToSend = useCustom ? null : (member?.member_idx || null);
    const userNameToSend = useCustom ? customMember.trim() : selectedMember;

    const dayIndex = new Date(selectedDate).getDay();
    const key = `${dayIndex}-${startTime}`;

    // 부모 컴포넌트에 입력값만 전달
    onInsert(key, userNameToSend, startTime, endTime, memo, userIdxToSend);
    onClose();
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return ReactDOM.createPortal(
    <Backdrop>
      <Modal ref={modalRef}>
        <Title>일정 추가</Title>

        <Field>
          <label>회원 선택</label>
          <select
            value={useCustom ? 'custom' : selectedMember}
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'custom') {
                setUseCustom(true);
                setSelectedMember('');
              } else {
                setUseCustom(false);
                setSelectedMember(val);
              }
            }}
          >
            <option value="">-- 선택하세요 --</option>
            {members.map((m, idx) => (
              <option key={idx} value={m.member_name}>
                {m.member_name}
              </option>
            ))}
            <option value="custom">직접 입력</option>
          </select>
        </Field>

        {useCustom && (
          <Field>
            <label>이름 입력</label>
            <input
              type="text"
              placeholder="회원 이름을 입력하세요"
              value={customMember}
              onChange={(e) => setCustomMember(e.target.value)}
            />
          </Field>
        )}

        <Field>
          <label>시작 시간</label>
          <select value={startTime} onChange={(e) => setStartTime(e.target.value)}>
            {hours.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </Field>

        <Field>
          <label>종료 시간</label>
          <select value={endTime} onChange={(e) => setEndTime(e.target.value)}>
            {hours.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </Field>

        <Field>
          <label>메모</label>
          <textarea
            placeholder="추가 메모를 입력하세요"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
        </Field>

        <ButtonGroup>
          <button onClick={handleSubmit}>추가</button>
          <button onClick={onClose}>취소</button>
        </ButtonGroup>
      </Modal>
    </Backdrop>,
    document.body
  );
};

export default ScheduleInsertModal;

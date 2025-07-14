import axios from 'axios';
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

const ScheduleInsertModal = ({
  trainerIdx,
  selectedDate,
  selectedStime = '06:00',
  onClose,
  onInsert,
  members = [],
  schedulesForDate = [],
}) => {
  const modalRef = useRef(null);
  
  const [startTime, setStartTime] = useState(selectedStime || '06:00');
  const [memo, setMemo] = useState('');
  const [selectedMember, setSelectedMember] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [customMember, setCustomMember] = useState('');

  // 종료 시간은 startTime + 1시간으로 계산
  const getEndTime = (stime) => {
    const hour = parseInt(stime.split(':')[0], 10);
    const nextHour = ((hour + 1) % 24).toString().padStart(2, '0');
    return `${nextHour}:00`;
  };
  const endTime = getEndTime(startTime);

  // 시간 옵션: 06:00 ~ 24:00
  const hours = Array.from({ length: 19 }, (_, i) => {
    const hour = (6 + i) % 24;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  // 첫 진입 시 회원 자동 선택
  useEffect(() => {
    if (members.length > 0 && !useCustom && !selectedMember) {
      setSelectedMember(members[0].member.member_name);
    }
  }, [members, useCustom, selectedMember]);

  const isTimeConflict = () => {
    if (!schedulesForDate || !startTime) return false;

    const startHour = parseInt(startTime.split(':')[0], 10);
    const endHour = (startHour + 1) % 24;

    for (const s of schedulesForDate) {
      const sStart = parseInt(s.schedule_stime.split(':')[0], 10);
      const sEndRaw = s.schedule_etime || (s.schedule_stime && ((parseInt(s.schedule_stime.split(':')[0], 10) + 1) % 24).toString().padStart(2, '0') + ':00');
      if (!sEndRaw) continue;
      const sEnd = parseInt(sEndRaw.split(':')[0], 10);

      console.log(`Checking conflict: new ${startHour}-${endHour} vs existing ${sStart}-${sEnd}`);

      if (startHour < sEnd && endHour > sStart) {
        return true;
      }
    }
    return false;
  };

  const handleSubmit = () => {
    const scheduleName = useCustom ? customMember.trim() : selectedMember;

    if (!scheduleName || !startTime) {
      alert('모든 항목을 입력해주세요.');
      return;
    }

    if (isTimeConflict()) {
      alert('해당 시작 시간에 이미 등록된 스케줄이 있습니다.');
      return;
    }

    const member = members.find((m) => m.member.member_name === selectedMember);
    const userIdxToSend = useCustom ? null : (member?.member.member_idx || null);
    const userNameToSend = useCustom ? customMember.trim() : selectedMember;

    const dayIndex = new Date(selectedDate).getDay();
    const key = `${dayIndex}-${startTime}`;
    console.log(key, userNameToSend, startTime, endTime, memo, userIdxToSend);
    
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

  return (
    <Backdrop>
      <Modal ref={modalRef}>
        <Title>일정 추가</Title>

        {/* 회원 선택 */}
        <Field>
          <label>회원 선택</label>
          <select
            value={useCustom ? 'custom' : selectedMember}
            onChange={(e) => {
              if (e.target.value === 'custom') {
                setUseCustom(true);
                setSelectedMember('');
              } else {
                setUseCustom(false);
                setSelectedMember(e.target.value);
              }
            }}
          >
            <option value="">-- 선택하세요 --</option>
            {members.map((m, idx) => (
              <option key={idx} value={m.member.member_name}>
                {m.member.member_name}
              </option>
            ))}
            <option value="custom">직접 입력</option>
          </select>
        </Field>

        {/* 직접 입력 */}
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

        {/* 시작 시간 */}
        <Field>
          <label>시작 시간</label>
          <select
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          >
            {hours.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </Field>

        {/* 종료 시간 (자동 계산) */}
        <Field>
          <label>종료 시간</label>
          <input
            type="text"
            value={endTime}
            readOnly
            style={{ background: '#eee', color: '#888' }}
          />
        </Field>

        {/* 메모 */}
        <Field>
          <label>메모</label>
          <textarea
            placeholder="추가 메모를 입력하세요"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
        </Field>

        {/* 버튼 */}
        <ButtonGroup>
          <button onClick={handleSubmit}>추가</button>
          <button onClick={onClose}>취소</button>
        </ButtonGroup>
      </Modal>
    </Backdrop>
  );
};

export default ScheduleInsertModal;

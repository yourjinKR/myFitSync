import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: backdropFade 0.3s ease-out;

  @keyframes backdropFade {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const Modal = styled.div`
  background: var(--bg-primary);
  border-radius: 10px;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(74, 144, 226, 0.1);
  padding: 3rem;
  width: 90%;
  max-width: 520px;
  color: var(--text-primary);
  animation: modalAppear 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);

  @keyframes modalAppear {
    from {
      opacity: 0;
      transform: scale(0.9) translateY(20px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
`;

const Field = styled.div`
  margin-bottom: 1.8rem;

  label {
    display: block;
    margin-bottom: 0.8rem;
    font-weight: 600;
    color: var(--primary-blue);
    font-size: 2.2rem; /* 글자 크기 1.6rem으로 설정 */
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  input, select, textarea {
    font-size: 2rem; /* select 글자 크기 1.4rem으로 설정 */
    width: 100%;
    padding: 1rem;
    border: 2px solid rgba(74, 144, 226, 0.2);
    border-radius: 5px;
    background: rgba(74, 144, 226, 0.05);
    color: var(--text-primary);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-sizing: border-box;

    &:focus {
      border-color: var(--primary-blue);
      background: rgba(74, 144, 226, 0.1);
      outline: none;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(74, 144, 226, 0.15);
    }

    &:read-only {
      background: rgba(0, 0, 0, 0.05);
      color: var(--text-secondary);
    }
  }

  select {
    color: var(--text-primary);
    background: #000000 !important;
  }

  option {
    color: var(--text-primary);
    background: #000000 !important;
    background: rgba(0, 0, 0, 0.8); /* 옵션 배경색을 완전히 어둡게 설정 */
    font-size: 1.6rem; /* 옵션 글자 크기 크게 설정 */
  }

  textarea {
    min-height: 150px;
    resize: none;
    font-family: inherit;

  }
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2.5rem;
  text-align: center;
  color: var(--primary-blue);
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -0.8rem;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, var(--primary-blue), var(--primary-blue-light));
    border-radius: 2px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: flex-end;
`;

const Button = styled.button`
  padding: 1rem 2rem;
  font-size: 1.6rem;
  font-weight: 600;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 100px;

  &.primary {
    color: white;
    background: linear-gradient(135deg, var(--primary-blue), var(--primary-blue-light));
    box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);

    &:hover {
      box-shadow: 0 6px 20px rgba(74, 144, 226, 0.4);
    }
  }

  &.secondary {
    color: var(--text-secondary);
    background: rgba(0, 0, 0, 0.05);
    border: 1px solid var(--border-medium);

    &:hover {
      background: rgba(0, 0, 0, 0.1);
    }
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

  // 첫 진입 시 회원 자동 선택 제거 - 기본값을 "-- 선택하세요 --"로 유지
  // useEffect(() => {
  //   if (members.length > 0 && !useCustom && !selectedMember) {
  //     setSelectedMember(members[0].member.member_name);
  //   }
  // }, [members, useCustom, selectedMember]);

  const isTimeConflict = () => {
    if (!schedulesForDate || !startTime) return false;

    const startHour = parseInt(startTime.split(':')[0], 10);
    const endHour = (startHour + 1) % 24;

    for (const s of schedulesForDate) {
      const sStart = parseInt(s.schedule_stime.split(':')[0], 10);
      const sEndRaw = s.schedule_etime || (s.schedule_stime && ((parseInt(s.schedule_stime.split(':')[0], 10) + 1) % 24).toString().padStart(2, '0') + ':00');
      if (!sEndRaw) continue;
      const sEnd = parseInt(sEndRaw.split(':')[0], 10);

      if (startHour < sEnd && endHour > sStart) {
        return true;
      }
    }
    return false;
  };

  const handleSubmit = () => {
    const scheduleName = useCustom ? customMember.trim() : selectedMember;

    if (!scheduleName || !startTime) {
      alert('회원을 선택하거나 이름을 입력해주세요.');
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
          <Button className="secondary" onClick={onClose}>
            취소
          </Button>
          <Button className="primary" onClick={handleSubmit}>
            추가
          </Button>
        </ButtonGroup>
      </Modal>
    </Backdrop>
  );
};

export default ScheduleInsertModal;

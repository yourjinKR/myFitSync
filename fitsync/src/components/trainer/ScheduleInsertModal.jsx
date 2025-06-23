import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
`;

const Modal = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  min-width: 300px;
`;

const ScheduleInsertModal = ({ onClose, onInsert }) => {
  const [selectedMember, setSelectedMember] = useState('');
  const [customMember, setCustomMember] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const members = ['김회원', '이회원', '박회원'];

  const handleSubmit = () => {
    const member = customMember.trim() || selectedMember;
    if (!member || !startTime) {
      alert('회원과 시작시간을 입력해주세요.');
      return;
    }

    // 예: 1-08:00 형식의 키
    const dayIndex = new Date().getDay(); // 오늘 요일 인덱스 (0~6)
    const key = `${dayIndex}-${startTime}`;

    onInsert(key, member);
    onClose();
  };

  const modalRef = useRef();
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
        <h3>일정 추가</h3>

        <div>
          <label>회원 선택:</label>
          <select value={selectedMember} onChange={(e) => setSelectedMember(e.target.value)}>
            <option value="">-- 선택하세요 --</option>
            {members.map((name, idx) => (
              <option key={idx} value={name}>{name}</option>
            ))}
          </select>
        </div>

        <div>
          <label>직접 입력:</label>
          <input
            type="text"
            value={customMember}
            placeholder="회원 이름"
            onChange={(e) => setCustomMember(e.target.value)}
          />
        </div>

        <div>
          <label>시작 시간:</label>
          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        </div>

        <div>
          <label>종료 시간:</label>
          <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        </div>

        <div style={{ marginTop: '1rem' }}>
          <button onClick={handleSubmit}>추가</button>
          <button onClick={onClose} style={{ marginLeft: '0.5rem' }}>취소</button>
        </div>
      </Modal>
    </Backdrop>
  );
};

export default ScheduleInsertModal;

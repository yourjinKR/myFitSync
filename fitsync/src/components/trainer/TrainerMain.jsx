// TrainerMain.jsx
import React, { useState } from 'react';
import styled from 'styled-components';
import TrainerCalendarView from './TrainerCalendarView'; // 기존 TrainerMain 분리된 컴포넌트로 저장
import MemberManageView from './MemberManageView';

const Wrapper = styled.div`
  padding: 2rem;
  font-size: 1.6rem;
  background: transparent;
  max-height: calc(100vh - 150px);
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
`;

const TabMenu = styled.div`
  display: flex;
  gap: 0.8rem;
  margin-bottom: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  padding: 1.5rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(74, 144, 226, 0.5), transparent);
  }
`;

const TabButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'active',
})`
  font-size: 1.6rem;
  padding: 1.5rem 3rem;
  border: none;
  border-radius: 10px;
  background: ${({ active }) => 
    active 
      ? 'linear-gradient(135deg, var(--primary-blue), var(--primary-blue-light))'
      : 'transparent'
  };
  color: ${({ active }) => (active ? 'white' : 'var(--text-secondary)')};
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: ${({ active }) => (active ? '600' : '400')};
  flex: 1;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  letter-spacing: 0.5px;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: ${({ active }) => (active ? '80%' : '0%')};
    height: 2px;
    background: linear-gradient(90deg, transparent, white, transparent);
    transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  span {
    position: relative;
    font-size: 1.6rem;
    z-index: 2;
    transition: all 0.3s ease;
  }

  &:hover {
    color: ${({ active }) => (active ? 'white' : 'var(--primary-blue)')};
    background: ${({ active }) => 
      active 
        ? 'linear-gradient(135deg, var(--primary-blue-light), var(--primary-blue))'
        : 'rgba(74, 144, 226, 0.05)'
    }; /* hover 효과를 덜 화려하게 조정 */
  }

  &:active {
    transform: translateY(-1px);
  }
`;

const TrainerMain = () => {
  const [tab, setTab] = useState('calendar'); // 'calendar' or 'members'

  return (
    <Wrapper>
      <TabMenu>
        <TabButton active={tab === 'calendar'} onClick={() => setTab('calendar')}>
          <span>📅 캘린더</span>
        </TabButton>
        <TabButton active={tab === 'members'} onClick={() => setTab('members')}>
          <span>👥 회원관리</span>
        </TabButton>
      </TabMenu>

      {tab === 'calendar' ? <TrainerCalendarView /> : <MemberManageView />}
    </Wrapper>
  );
};

export default TrainerMain;

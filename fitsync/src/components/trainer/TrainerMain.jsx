// TrainerMain.jsx
import React, { useState } from 'react';
import styled from 'styled-components';
import TrainerCalendarView from './TrainerCalendarView'; // 기존 TrainerMain 분리된 컴포넌트로 저장
import MemberManageView from './MemberManageView'; // 너가 만든 회원 관리 UI 컴포넌트

const Wrapper = styled.div`
  padding: 3rem;
  font-size: 1.8rem;
`;

const TabMenu = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
`;

const TabButton = styled.button`
  font-size: 1.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 1rem;
  background: ${({ active }) => (active ? '#5b6eff' : '#eee')};
  color: ${({ active }) => (active ? 'white' : '#333')};
  cursor: pointer;

  &:hover {
    background: #5b6eff;
    color: white;
  }
`;

const TrainerMain = () => {
  const [tab, setTab] = useState('calendar'); // 'calendar' or 'members'

  return (
    <Wrapper>
      <TabMenu>
        <TabButton active={tab === 'calendar'} onClick={() => setTab('calendar')}>
          📅 캘린더
        </TabButton>
        <TabButton active={tab === 'members'} onClick={() => setTab('members')}>
          👥 회원관리
        </TabButton>
      </TabMenu>

      {tab === 'calendar' ? <TrainerCalendarView /> : <MemberManageView />}
    </Wrapper>
  );
};

export default TrainerMain;

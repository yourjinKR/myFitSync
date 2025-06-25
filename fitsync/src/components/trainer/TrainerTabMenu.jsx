import React from 'react';
import styled from 'styled-components';

const TabMenu = styled.div`
  display: flex;
  margin-top: 24px;
  border-bottom: 1px solid #ccc;
`;

const TabButton = styled.button`
  flex: 1;
  padding: 14px 0;
  border: none;
  background: none;
  font-weight: 600;
  font-size: 1.2rem;
  color: ${({ active }) => (active ? '#007aff' : '#999')};
  border-bottom: 3px solid ${({ active }) => (active ? '#007aff' : 'transparent')};
  cursor: pointer;
  transition: all 0.3s;
`;

const TrainerTabMenu = ({ activeTab, setActiveTab }) => {
  return (
    <TabMenu>
      <TabButton
        active={activeTab === '소개'}
        onClick={() => setActiveTab('소개')}
      >
        소개
      </TabButton>
      <TabButton
        active={activeTab === '후기'}
        onClick={() => setActiveTab('후기')}
      >
        후기
      </TabButton>
    </TabMenu>
  );
};

export default TrainerTabMenu;

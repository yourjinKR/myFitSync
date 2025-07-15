import React, { useState } from 'react';
import styled from 'styled-components';
import PaymentMethodList from '../PaymentMethodList';
import BillingKeyIssuer from './BillingKeyIssuer';
import PaymentTester from './PaymentTester';

const Container = styled.div`
  padding: 2rem;
`;

const TabContainer = styled.div`
  margin-bottom: 3rem;
`;

const TabButtons = styled.div`
  display: flex;
  border-bottom: 1px solid var(--border-light);
  margin-bottom: 2rem;
`;

const TabButton = styled.button`
  background: none;
  border: none;
  padding: 1.2rem 2rem;
  cursor: pointer;
  font-size: 1.4rem;
  font-weight: 500;
  color: ${props => props.active ? 'var(--primary-blue)' : 'var(--text-secondary)'};
  border-bottom: 2px solid ${props => props.active ? 'var(--primary-blue)' : 'transparent'};
  transition: all 0.3s ease;
  
  &:hover {
    color: var(--primary-blue);
  }
`;

const TabContent = styled.div`
  min-height: 40rem;
`;

const PaymentMethodTest = () => {
  const [activeTab, setActiveTab] = useState('list');

  const tabs = [
    { id: 'list', label: '내 결제수단', component: <PaymentMethodList /> },
    { id: 'issue', label: '빌링키 발급', component: <BillingKeyIssuer /> },
    { id: 'test', label: '결제 테스트', component: <PaymentTester /> },
  ];

  return (
    <Container>
      <TabContainer>
        <TabButtons>
          {tabs.map(tab => (
            <TabButton
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </TabButton>
          ))}
        </TabButtons>
        
        <TabContent>
          {tabs.find(tab => tab.id === activeTab)?.component}
        </TabContent>
      </TabContainer>
    </Container>
  );
};

export default PaymentMethodTest;

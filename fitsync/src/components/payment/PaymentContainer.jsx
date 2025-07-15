import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
  background: var(--bg-primary);
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 3rem;
  color: var(--text-primary);
  font-size: 2.8rem;
  font-weight: 600;
`;

const NavigationTabs = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 3rem;
  border-bottom: 1px solid var(--border-light);
`;

const TabLink = styled(Link)`
  padding: 1.2rem 2rem;
  text-decoration: none;
  color: var(--text-secondary);
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
  font-size: 1.4rem;
  font-weight: 500;
  
  &:hover {
    color: var(--primary-blue);
    border-bottom-color: var(--primary-blue);
  }
  
  &.active {
    color: var(--primary-blue);
    border-bottom-color: var(--primary-blue);
    font-weight: 600;
  }
`;

const ContentArea = styled.div`
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-light);
  min-height: 40rem;
`;

const PaymentContainer = () => {
    return (
        <Container>
            <Title>💳 결제 관리</Title>
            
            <NavigationTabs>
                <TabLink to="/payment/methods">내 결제수단</TabLink>
                <TabLink to="/payment/test">테스트</TabLink>
            </NavigationTabs>
            
            <ContentArea>
                <Outlet/>
            </ContentArea>
        </Container>
    );
};

export default PaymentContainer;
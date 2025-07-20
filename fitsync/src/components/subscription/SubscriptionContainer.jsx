import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  padding: 20px;
  background: var(--bg-primary);
  min-height: 100vh;
`;

const Header = styled.div`
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 20px;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 8px;
  
  @media (min-width: 375px) {
    font-size: 22px;
  }
  
  @media (min-width: 414px) {
    font-size: 24px;
  }
`;

const Subtitle = styled.p`
  font-size: 13px;
  color: var(--text-secondary);
  
  @media (min-width: 375px) {
    font-size: 14px;
  }
  
  @media (min-width: 414px) {
    font-size: 15px;
  }
`;

// 탭 네비게이션
const TabContainer = styled.div`
  display: flex;
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 24px;
`;

const TabButton = styled.button`
  flex: 1;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
  min-height: 44px;
  
  @media (min-width: 375px) {
    font-size: 14px;
  }
  
  @media (min-width: 414px) {
    font-size: 15px;
  }
  
  background: ${props => 
    props.$active ? 'var(--primary-blue)' : 'transparent'
  };
  color: ${props => 
    props.$active ? 'white' : 'var(--text-secondary)'
  };
  
  &:active {
    transform: scale(0.98);
  }
  
  /* 터치 최적화 */
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
`;

const ContentArea = styled.div`
  /* 컨텐츠 영역 - 자식 컴포넌트들이 여기에 렌더링 */
`;

const SubscriptionContainer = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 현재 경로에 따라 활성 탭 결정
  const getActiveTab = () => {
    const pathname = location.pathname;
    if (pathname.includes('/methods')) return 'methods';
    if (pathname.includes('/history')) return 'history';
    return 'main';
  };

  const handleTabChange = (tab) => {
    switch(tab) {
      case 'main':
        navigate('/subscription');
        break;
      case 'methods':
        navigate('/subscription/methods');
        break;
      case 'history':
        navigate('/subscription/history');
        break;
      default:
        navigate('/subscription');
        break;
    }
  };

  const activeTab = getActiveTab();

  return (
    <Container>
      <Header>
        <Title>FitSync Premium</Title>
        <Subtitle>프리미엄 구독으로 모든 기능을 이용하세요</Subtitle>
      </Header>

      {/* 탭 네비게이션 */}
      <TabContainer>
        <TabButton 
          $active={activeTab === 'main'} 
          onClick={() => handleTabChange('main')}
        >
          구독 관리
        </TabButton>
        <TabButton 
          $active={activeTab === 'methods'} 
          onClick={() => handleTabChange('methods')}
        >
          결제수단
        </TabButton>
        <TabButton 
          $active={activeTab === 'history'} 
          onClick={() => handleTabChange('history')}
        >
          결제내역
        </TabButton>
      </TabContainer>

      <ContentArea>
        <Outlet />
      </ContentArea>
    </Container>
  );
};

export default SubscriptionContainer;

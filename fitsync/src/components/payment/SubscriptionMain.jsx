import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { PaymentUtil } from '../../utils/PaymentUtil';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  padding: 20px;
  background: var(--bg-primary);
  min-height: 100vh;
`;

const Header = styled.div`
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 2.4rem;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  font-size: 1.4rem;
  color: var(--text-secondary);
`;

// 구독 상태 카드
const StatusCard = styled.div`
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  border: 2px solid ${props => 
    props.isSubscriber ? 'var(--primary-blue)' : 'var(--border-light)'
  };
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 1.4rem;
  font-weight: bold;
  margin-bottom: 16px;
  background: ${props => 
    props.isSubscriber ? 'var(--primary-blue)' : 'var(--bg-tertiary)'
  };
  color: ${props => 
    props.isSubscriber ? 'white' : 'var(--text-secondary)'
  };
`;

const StatusIcon = styled.span`
  font-size: 1.6rem;
  margin-right: 8px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoLabel = styled.span`
  font-size: 1.4rem;
  color: var(--text-secondary);
`;

const InfoValue = styled.span`
  font-size: 1.6rem;
  color: var(--text-primary);
  font-weight: 500;
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
  font-size: 1.4rem;
  font-weight: 500;
  transition: all 0.2s ease;
  min-height: 44px;
  
  background: ${props => 
    props.active ? 'var(--primary-blue)' : 'transparent'
  };
  color: ${props => 
    props.active ? 'white' : 'var(--text-secondary)'
  };
  
  &:active {
    transform: scale(0.98);
  }
  
  /* 터치 최적화 */
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
`;

// 액션 버튼들
const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 24px;
`;

const ActionButton = styled.button`
  padding: 16px;
  border-radius: 12px;
  font-size: 1.6rem;
  font-weight: bold;
  min-height: 56px;
  transition: all 0.2s ease;
  
  background: ${props => {
    switch(props.variant) {
      case 'primary':
        return 'var(--primary-blue)';
      case 'success':
        return 'var(--success)';
      case 'secondary':
        return 'var(--bg-tertiary)';
      default:
        return 'var(--bg-secondary)';
    }
  }};
  
  color: ${props => 
    props.variant === 'secondary' ? 'var(--text-secondary)' : 'white'
  };
  
  border: ${props => 
    props.variant === 'secondary' ? '1px solid var(--border-light)' : 'none'
  };
  
  &:active {
    transform: translateY(1px);
    background: ${props => {
      switch(props.variant) {
        case 'primary':
          return 'var(--primary-blue-hover)';
        case 'success':
          return '#228B22';
        case 'secondary':
          return 'var(--bg-tertiary)';
        default:
          return 'var(--bg-tertiary)';
      }
    }};
  }
  
  &:disabled {
    background: var(--border-medium);
    color: var(--text-tertiary);
    cursor: not-allowed;
    transform: none;
  }
  
  /* 터치 최적화 */
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
`;

// 로딩 스피너
const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
`;

const LoadingSpinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-light);
  border-top: 3px solid var(--primary-blue);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// 에러 메시지
const ErrorMessage = styled.div`
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid var(--warning);
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  
  font-size: 1.4rem;
  color: var(--warning);
  text-align: center;
`;

const SubscriptionMain = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('subscription');
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await PaymentUtil.checkSubscriptionStatus();
      
      if (result.status === 'success') {
        setSubscriptionData(result.data);
      } else {
        setError(result.message || '구독 정보를 불러올 수 없습니다.');
      }
    } catch (err) {
      console.error('구독 상태 조회 오류:', err);
      setError('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // 탭에 따라 다른 페이지로 이동
    switch(tab) {
      case 'methods':
        navigate('/payment/methods');
        break;
      case 'history':
        navigate('/payment/history');
        break;
      default:
        // subscription 탭은 현재 페이지 유지
        break;
    }
  };

  const handleSubscribe = () => {
    if (!subscriptionData?.isSubscriber) {
      // 비구독자인 경우 구독 결제 페이지로 이동
      navigate('/payment/methods'); // 먼저 결제수단이 있는지 확인
    }
  };

  const handleManagePayments = () => {
    navigate('/payment/scheduled');
  };

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <LoadingSpinner />
        </LoadingContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Header>
          <Title>구독 관리</Title>
          <Subtitle>FitSync 프리미엄 구독을 관리하세요</Subtitle>
        </Header>
        
        <ErrorMessage>
          {error}
        </ErrorMessage>
        
        <ActionButton 
          variant="primary" 
          onClick={loadSubscriptionData}
          style={{width: '100%', marginTop: '16px'}}
        >
          다시 시도
        </ActionButton>
      </Container>
    );
  }

  const isSubscriber = subscriptionData?.isSubscriber;
  const daysLeft = subscriptionData?.subscriptionDaysLeft;

  return (
    <Container>
      <Header>
        <Title>구독 관리</Title>
        <Subtitle>FitSync 프리미엄 구독을 관리하세요</Subtitle>
      </Header>

      {/* 탭 네비게이션 */}
      <TabContainer>
        <TabButton 
          active={activeTab === 'subscription'} 
          onClick={() => handleTabChange('subscription')}
        >
          구독 관리
        </TabButton>
        <TabButton 
          active={activeTab === 'methods'} 
          onClick={() => handleTabChange('methods')}
        >
          결제수단
        </TabButton>
        <TabButton 
          active={activeTab === 'history'} 
          onClick={() => handleTabChange('history')}
        >
          결제내역
        </TabButton>
      </TabContainer>

      {/* 구독 상태 카드 */}
      <StatusCard isSubscriber={isSubscriber}>
        <StatusBadge isSubscriber={isSubscriber}>
          <StatusIcon>{isSubscriber ? '✅' : '❌'}</StatusIcon>
          {isSubscriber ? '구독 중' : '구독 없음'}
        </StatusBadge>

        {isSubscriber ? (
          <>
            {subscriptionData.lastPaymentDate && (
              <InfoRow>
                <InfoLabel>마지막 결제일</InfoLabel>
                <InfoValue>{formatDate(subscriptionData.lastPaymentDate)}</InfoValue>
              </InfoRow>
            )}
            
            {subscriptionData.subscriptionExpiryDate && (
              <InfoRow>
                <InfoLabel>구독 만료일</InfoLabel>
                <InfoValue>{formatDate(subscriptionData.subscriptionExpiryDate)}</InfoValue>
              </InfoRow>
            )}

            {daysLeft !== null && (
              <InfoRow>
                <InfoLabel>남은 기간</InfoLabel>
                <InfoValue 
                  style={{
                    color: daysLeft <= 3 ? 'var(--warning)' : 'var(--text-primary)'
                  }}
                >
                  {daysLeft > 0 ? `${daysLeft}일` : '만료됨'}
                </InfoValue>
              </InfoRow>
            )}

            {subscriptionData.nextPaymentDate && (
              <InfoRow>
                <InfoLabel>다음 결제 예정일</InfoLabel>
                <InfoValue>{formatDate(subscriptionData.nextPaymentDate)}</InfoValue>
              </InfoRow>
            )}

            <InfoRow>
              <InfoLabel>월 이용료</InfoLabel>
              <InfoValue>
                {subscriptionData.subscriptionAmount?.toLocaleString() || '50,000'}원
              </InfoValue>
            </InfoRow>
          </>
        ) : (
          <InfoRow>
            <InfoLabel>상태</InfoLabel>
            <InfoValue>FitSync 프리미엄 구독을 시작해보세요</InfoValue>
          </InfoRow>
        )}
      </StatusCard>

      {/* 액션 버튼들 */}
      <ActionGrid>
        {isSubscriber ? (
          <>
            <ActionButton 
              variant="primary" 
              onClick={handleManagePayments}
            >
              예약 관리
            </ActionButton>
            <ActionButton 
              variant="secondary" 
              onClick={() => navigate('/payment/methods')}
            >
              결제수단
            </ActionButton>
          </>
        ) : (
          <>
            <ActionButton 
              variant="success" 
              onClick={handleSubscribe}
            >
              구독 시작
            </ActionButton>
            <ActionButton 
              variant="secondary" 
              onClick={() => navigate('/payment/methods')}
            >
              결제수단 등록
            </ActionButton>
          </>
        )}
      </ActionGrid>
    </Container>
  );
};

export default SubscriptionMain;

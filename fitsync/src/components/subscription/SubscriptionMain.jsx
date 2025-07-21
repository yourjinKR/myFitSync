import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { PaymentUtil } from '../../utils/PaymentUtil';

const Container = styled.div`
  /* 컨테이너에서 이미 패딩과 배경이 설정되므로 여기서는 제거 */
`;

// 제거: Header, Title, Subtitle (컨테이너로 이동됨)

// 구독 상태 카드
const StatusCard = styled.div`
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  border: 2px solid ${props => 
    props.$isSubscriber ? 'var(--primary-blue)' : 'var(--border-light)'
  };
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: bold;
  margin-bottom: 16px;
  background: ${props => 
    props.$isSubscriber ? 'var(--primary-blue)' : 'var(--bg-tertiary)'
  };
  color: ${props => 
    props.$isSubscriber ? 'white' : 'var(--text-secondary)'
  };
  
  @media (min-width: 375px) {
    font-size: 14px;
  }
  
  @media (min-width: 414px) {
    font-size: 15px;
  }
`;

const StatusIcon = styled.span`
  font-size: 15px;
  margin-right: 8px;
  
  @media (min-width: 375px) {
    font-size: 16px;
  }
  
  @media (min-width: 414px) {
    font-size: 17px;
  }
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
  font-size: 12px;
  color: var(--text-secondary);
  
  @media (min-width: 375px) {
    font-size: 13px;
  }
  
  @media (min-width: 414px) {
    font-size: 14px;
  }
`;

const InfoValue = styled.span`
  font-size: 13px;
  color: var(--text-primary);
  font-weight: 500;
  
  @media (min-width: 375px) {
    font-size: 14px;
  }
  
  @media (min-width: 414px) {
    font-size: 15px;
  }
`;

// 제거: TabContainer, TabButton (컨테이너로 이동됨)

// 액션 버튼들
const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: ${props => props.$columns === 3 ? '1fr 1fr 1fr' : '1fr 1fr'};
  gap: 12px;
  margin-top: 24px;
`;

const ActionButton = styled.button`
  padding: 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: bold;
  min-height: 56px;
  transition: all 0.2s ease;
  
  @media (min-width: 375px) {
    font-size: 15px;
  }
  
  @media (min-width: 414px) {
    font-size: 16px;
  }
  
  background: ${props => {
    switch(props.$variant) {
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
    props.$variant === 'secondary' ? 'var(--text-secondary)' : 'white'
  };
  
  border: ${props => 
    props.$variant === 'secondary' ? '1px solid var(--border-light)' : 'none'
  };
  
  &:active {
    transform: translateY(1px);
    background: ${props => {
      switch(props.$variant) {
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
  
  font-size: 13px;
  color: var(--warning);
  text-align: center;
  
  @media (min-width: 375px) {
    font-size: 14px;
  }
  
  @media (min-width: 414px) {
    font-size: 15px;
  }
`;

const SubscriptionMain = () => {
  const navigate = useNavigate();
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
      
      // API 응답 구조에 맞게 수정
      if (result && result.data) {
        setSubscriptionData(result.data);
      } else {
        setError(result?.message || '구독 정보를 불러올 수 없습니다.');
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

  const handleSubscribe = () => {
    if (!subscriptionData?.isSubscriber) {
      // 비구독자인 경우 - 아직 구독 결제 페이지가 없으므로 안내 메시지
      alert('구독 결제 페이지를 준비 중입니다. 곧 오픈 예정입니다!');
    }
  };

  const handleManagePayments = () => {
    // 예약 관리 페이지 준비 중 안내
    alert('예약 결제 관리 페이지를 준비 중입니다.');
  };

  const handleManageMethods = () => {
    // 결제수단 관리 페이지로 이동
    navigate('/subscription/methods');
  };

  const handleViewHistory = () => {
    // 결제 내역 페이지로 이동
    navigate('/subscription/history');
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
        <ErrorMessage>
          {error}
        </ErrorMessage>
        
        <ActionButton 
          $variant="primary" 
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
      {/* 구독 상태 카드 */}
      <StatusCard $isSubscriber={isSubscriber}>
        <StatusBadge $isSubscriber={isSubscriber}>
          <StatusIcon>{isSubscriber ? '✅' : '❌'}</StatusIcon>
          {isSubscriber ? '프리미엄 구독 중' : '무료 사용자'}
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
          <>
            <InfoRow>
              <InfoLabel>현재 상태</InfoLabel>
              <InfoValue>기본 기능만 이용 가능</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>프리미엄 혜택</InfoLabel>
              <InfoValue>사용자 맞춤 AI 서비스</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>월 이용료</InfoLabel>
              <InfoValue>3,000원</InfoValue>
            </InfoRow>
          </>
        )}
      </StatusCard>
    </Container>
  );
};

export default SubscriptionMain;

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

// 플랜 비교 컨테이너
const PlansContainer = styled.div`
  margin-bottom: 24px;
`;

const PlansTitle = styled.h2`
  font-size: 18px;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 16px;
  text-align: center;
  
  @media (min-width: 375px) {
    font-size: 19px;
  }
  
  @media (min-width: 414px) {
    font-size: 20px;
  }
`;

const PlansGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
`;

const PlanCard = styled.div`
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 20px;
  border: 2px solid ${props => 
    props.$isPremium ? 'var(--primary-blue)' : 'var(--border-light)'
  };
  position: relative;
  transition: all 0.2s ease;
  cursor: ${props => props.$clickable ? 'pointer' : 'default'};
  
  ${props => props.$clickable && `
    &:active {
      transform: scale(0.98);
    }
  `}
  
  ${props => props.$isPremium && `
    box-shadow: 0 4px 20px rgba(74, 144, 226, 0.2);
  `}
`;

const PlanBadge = styled.div`
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--primary-blue);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: bold;
  
  @media (min-width: 375px) {
    font-size: 11px;
  }
  
  @media (min-width: 414px) {
    font-size: 12px;
  }
`;

const PlanHeader = styled.div`
  text-align: center;
  margin-bottom: 16px;
`;

const PlanTitle = styled.h3`
  font-size: 16px;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 4px;
  
  @media (min-width: 375px) {
    font-size: 17px;
  }
  
  @media (min-width: 414px) {
    font-size: 18px;
  }
`;

const PlanPrice = styled.div`
  font-size: 20px;
  font-weight: bold;
  color: ${props => props.$isPremium ? 'var(--primary-blue)' : 'var(--text-secondary)'};
  margin-bottom: 8px;
  
  @media (min-width: 375px) {
    font-size: 22px;
  }
  
  @media (min-width: 414px) {
    font-size: 24px;
  }
  
  span {
    font-size: 12px;
    color: var(--text-tertiary);
    
    @media (min-width: 375px) {
      font-size: 13px;
    }
    
    @media (min-width: 414px) {
      font-size: 14px;
    }
  }
`;

const PlanFeatures = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

  const PlanFeature = styled.li`
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    font-size: 12px;
    color: var(--text-primary);
    flex-direction: column;
    
    @media (min-width: 375px) {
      font-size: 13px;
    }
    
    @media (min-width: 414px) {
      font-size: 14px;
    }
    
    &:last-child {
      margin-bottom: 0;
    }
    
    &::before {
      content: '${props => props.$available ? '' : ''}';
      margin-right: 8px;
      flex-shrink: 0;
      font-size: 12px;
    }
    
    ${props => !props.$available && `
      color: var(--text-tertiary);
      text-decoration: line-through;
    `}
  `;

const ComparisonCTA = styled.div`
  background: linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-blue-hover) 100%);
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:active {
    transform: scale(0.98);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    animation: shine 2s infinite;
  }
  
  @keyframes shine {
    0% { left: -100%; }
    100% { left: 100%; }
  }
`;

const CTATitle = styled.h3`
  font-size: 18px;
  font-weight: bold;
  color: white;
  margin-bottom: 8px;
  
  @media (min-width: 375px) {
    font-size: 19px;
  }
  
  @media (min-width: 414px) {
    font-size: 20px;
  }
`;

const CTASubtitle = styled.p`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 16px;
  line-height: 1.4;
  
  @media (min-width: 375px) {
    font-size: 14px;
  }
  
  @media (min-width: 414px) {
    font-size: 15px;
  }
`;

const CTAButton = styled.button`
  background: white;
  color: var(--primary-blue);
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: bold;
  transition: all 0.2s ease;
  
  @media (min-width: 375px) {
    font-size: 15px;
  }
  
  @media (min-width: 414px) {
    font-size: 16px;
  }
  
  &:active {
    transform: scale(0.95);
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  }
`;

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
    // 구독 결제 페이지로 이동하거나 결제수단 선택 모달 열기
    navigate('/subscription/methods?showModal=true&directPay=true');
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
      {/* 구독자만 구독 상태 카드 표시 */}
      {isSubscriber && (
        <StatusCard $isSubscriber={isSubscriber}>
          <StatusBadge $isSubscriber={isSubscriber}>
            <StatusIcon>✅</StatusIcon>
            프리미엄 구독 중
          </StatusBadge>

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
        </StatusCard>
      )}

      {/* 비구독자만 보이는 플랜 비교 섹션 */}
      {!isSubscriber && (
        <>
          <PlansContainer>
            <PlansTitle>💪 지금 업그레이드하고 더 많은 혜택을!</PlansTitle>
            
            <PlansGrid>
              {/* 무료 플랜 */}
              <PlanCard $isPremium={false}>
                <PlanHeader>
                  <PlanTitle>기본 플랜</PlanTitle>
                  <PlanPrice>무료</PlanPrice>
                </PlanHeader>
                
                <PlanFeatures>
                  <PlanFeature $available={true}>나만의 루틴 만들기</PlanFeature>
                  <PlanFeature $available={true}>운동 기록 작성</PlanFeature>
                  <PlanFeature $available={true}>트레이너 매칭</PlanFeature>
                  <PlanFeature $available={false}>개인 맞춤 루틴 추천</PlanFeature>
                  <PlanFeature $available={false}>운동 피드백 서비스</PlanFeature>
                </PlanFeatures>
              </PlanCard>

              {/* 프리미엄 플랜 */}
              <PlanCard $isPremium={true} $clickable={true} onClick={handleSubscribe}>
                <PlanBadge>추천!</PlanBadge>
                <PlanHeader>
                  <PlanTitle>프리미엄 플랜</PlanTitle>
                  <PlanPrice $isPremium={true}>
                    3,000원
                    <span>/월</span>
                  </PlanPrice>
                </PlanHeader>
                
                <PlanFeatures>
                  <PlanFeature $available={true}>나만의 루틴 만들기</PlanFeature>
                  <PlanFeature $available={true}>운동 기록 작성</PlanFeature>
                  <PlanFeature $available={true}>트레이너 매칭</PlanFeature>
                  <PlanFeature $available={true}>개인 맞춤 루틴 추천</PlanFeature>
                  <PlanFeature $available={true}>운동 피드백 서비스</PlanFeature>
                </PlanFeatures>
              </PlanCard>
            </PlansGrid>
          </PlansContainer>

          {/* CTA 섹션 */}
          <ComparisonCTA onClick={handleSubscribe}>
            <CTATitle>🚀 지금 바로 시작하세요!</CTATitle>
            <CTASubtitle>
              AI가 분석한 나만의 맞춤 운동으로<br />
              더 효과적인 운동을 경험해보세요
            </CTASubtitle>
            <CTAButton>
              프리미엄으로 업그레이드 ✨
            </CTAButton>
          </ComparisonCTA>
        </>
      )}

      {/* 구독자용 관리 버튼들 */}
      {isSubscriber && (
        <></>
      )}
    </Container>
  );
};

export default SubscriptionMain;

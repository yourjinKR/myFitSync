import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { PaymentUtil } from '../../utils/PaymentUtil';
import useRequireLogin from '../../hooks/useRequireLogin';

// 스타일 컴포넌트들
const Container = styled.div`
  /* 컨테이너에서 이미 패딩과 배경이 설정되므로 여기서는 제거 */
  position: relative;
`;

// 풀 투 리프레시 컨테이너
const PullToRefreshContainer = styled.div`
  position: relative;
  min-hei  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <LoadingSpinner />
          <h3 style={{ fontSize: '18px', marginTop: '16px' }}>결제 내역을 불러오는 중...</h3>
        </LoadingContainer>
      </Container>
    );
  }

  return ( 200px);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
`;

const RefreshIndicator = styled.div`
  position: absolute;
  top: -60px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--primary-blue);
  font-size: 13px !important;
  transition: all 0.3s ease;
  
  @media (min-width: 375px) {
    font-size: 14px !important;
  }
  
  @media (min-width: 414px) {
    font-size: 15px !important;
  }
  
  ${props => props.$visible && `
    top: 20px;
    opacity: 1;
  `}
`;

// 결제 내역 리스트
const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 100px;
`;



// 결제 내역 카드
const HistoryCard = styled.div`
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-light);
  transition: all 0.2s ease;
  overflow: hidden;
`;

// 카드 내용
const CardContent = styled.div`
  padding: 20px;
  background: transparent;
`;

// 결제 정보 행
const PaymentRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.$last ? '0' : '12px'};
`;

// 결제 제목
const PaymentTitle = styled.div`
  font-size: 15px !important;
  font-weight: 600;
  color: var(--text-primary);
  
  @media (min-width: 375px) {
    font-size: 16px !important;
  }
  
  @media (min-width: 414px) {
    font-size: 17px !important;
  }
`;

// 결제 금액
const PaymentAmount = styled.div`
  font-size: 14px !important;
  font-weight: 600;
  color: 'var(--text-primary)';
  
  @media (min-width: 375px) {
    font-size: 15px !important;
  }
  
  @media (min-width: 414px) {
    font-size: 16px !important;
  }
`;

// 결제 날짜
const PaymentDate = styled.div`
  font-size: 11px !important;
  color: var(--text-tertiary);
  
  @media (min-width: 375px) {
    font-size: 12px !important;
  }
  
  @media (min-width: 414px) {
    font-size: 13px !important;
  }
`;

// 결제 방법 정보
const PaymentMethod = styled.div`
  font-size: 12px !important;
  color: var(--text-secondary);
  
  @media (min-width: 375px) {
    font-size: 13px !important;
  }
  
  @media (min-width: 414px) {
    font-size: 14px !important;
  }
`;

// 결제 상태 배지
const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px !important;
  font-weight: 600;
  margin-left: 8px;
  
  @media (min-width: 375px) {
    font-size: 11px !important;
  }
  
  @media (min-width: 414px) {
    font-size: 12px !important;
  }
  
  background: ${props => 
    props.$status === 'PAID' ? 'rgba(74, 144, 226, 0.2)' :
    props.$status === 'FAILED' ? 'rgba(244, 67, 54, 0.2)' :
    props.$status === 'CANCELLED' ? 'rgba(128, 128, 128, 0.2)' :
    props.$status === 'READY' ? 'rgba(255, 193, 7, 0.2)' :
    'var(--bg-tertiary)'
  };
  
  color: ${props => 
    props.$status === 'PAID' ? 'var(--primary-blue)' :
    props.$status === 'FAILED' ? 'var(--warning)' :
    props.$status === 'CANCELLED' ? 'var(--text-tertiary)' :
    props.$status === 'READY' ? '#f57c00' :
    'var(--text-primary)'
  };
`;

// 빈 상태
const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: var(--text-secondary);
  
  .icon {
    font-size: 48px !important;
    margin-bottom: 16px;
    opacity: 0.5;
    
    @media (min-width: 375px) {
      font-size: 56px !important;
    }
    
    @media (min-width: 414px) {
      font-size: 64px !important;
    }
  }
  
  h3 {
    font-size: 16px !important;
    margin-bottom: 8px;
    color: var(--text-primary);
    
    @media (min-width: 375px) {
      font-size: 18px !important;
    }
    
    @media (min-width: 414px) {
      font-size: 20px !important;
    }
  }
  
  p {
    font-size: 13px !important;
    line-height: 1.5;
    
    @media (min-width: 375px) {
      font-size: 14px !important;
    }
    
    @media (min-width: 414px) {
      font-size: 15px !important;
    }
  }
`;

// 로딩 컴포넌트들
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: var(--text-secondary);
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-light);
  border-top: 3px solid var(--primary-blue);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
  
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
  margin-bottom: 16px;
  color: var(--warning);
  text-align: center;
  font-size: 14px !important;
  
  @media (min-width: 375px) {
    font-size: 15px !important;
  }
  
  @media (min-width: 414px) {
    font-size: 16px !important;
  }
`;

const SubscriptionPaymentHistory = () => {
  useRequireLogin();

  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // 터치 관련 refs (풀 투 리프레시용)
  const touchStartY = useRef(0);
  const pullDistance = useRef(0);
  const containerRef = useRef(null);

  useEffect(() => {
    loadPaymentHistory();
  }, []);

  const loadPaymentHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await PaymentUtil.getPaymentHistory();
      
      if (response.success) {
        // API 응답에서 history 배열 추출하고 구독 관련 결제만 필터링
        const allPayments = response.data?.history || [];
        const subscriptionPayments = allPayments.filter(payment => 
          payment.order_name?.includes('구독') ||
          payment.order_name?.includes('subscription') ||
          payment.order_name?.includes('Subscription') ||
          payment.order_name?.includes('FitSync Premium')
        );
        setPaymentHistory(subscriptionPayments);
      } else {
        setError(response.message || '결제 내역을 불러올 수 없습니다.');
      }
    } catch (err) {
      console.error('결제 내역 로드 실패:', err);
      setError(err.message || '네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 풀 투 리프레시 구현
  const handleTouchStart = (e) => {
    if (containerRef.current.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e) => {
    if (containerRef.current.scrollTop === 0) {
      const currentY = e.touches[0].clientY;
      pullDistance.current = Math.max(0, currentY - touchStartY.current);
      
      if (pullDistance.current > 100) {
        setRefreshing(true);
      }
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance.current > 100 && containerRef.current.scrollTop === 0) {
      loadPaymentHistory();
    }
    pullDistance.current = 0;
  };

  // 날짜 포맷팅 - API 응답의 날짜 필드 사용
  const formatDate = (payment) => {
    let dateString = null;
    // 타입별 분기
    if (payment.order_status === 'PAID') {
      dateString = payment.order_paydate || payment.order_regdate;
    } else if (payment.order_status === 'READY') {
      dateString = payment.schedule_date || payment.order_regdate;
    } else {
      dateString = payment.order_regdate || payment.order_paydate;
    }

    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    const parseDate = date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric', 
      hour: '2-digit',
      minute: '2-digit'
    });

    return parseDate;
  };

  // 결제 내역을 최신순으로 정렬
  const sortPaymentsByDate = (payments) => {
    return payments.sort((a, b) => {
      const dateA = new Date(a.order_regdate || a.order_paydate);
      const dateB = new Date(b.order_regdate || b.order_paydate);
      return dateB - dateA; // 최신순으로 정렬
    });
  };

  // 상태 텍스트 - API 응답의 statusDisplayName 사용
  const getStatusText = (payment) => {
    switch (payment.order_status) {
      case 'PAID':
        return '결제완료';
      case 'READY':
        return '결제대기';
      case 'CANCELLED' :
        return '결제취소';
      case 'FAILED':
        return '결제실패';
      default:
        break;
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <LoadingSpinner />
          <h3 style={{ fontSize: '18px', marginTop: '16px' }}>결제 내역을 불러오는 중...</h3>
        </LoadingContainer>
      </Container>
    );
  }

  // 결제 내역을 최신순으로 정렬
  const sortedPayments = sortPaymentsByDate([...paymentHistory]);

  return (
    <Container>
      {error && (
        <ErrorMessage>
          {error}
        </ErrorMessage>
      )}

      <PullToRefreshContainer
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {refreshing && (
          <RefreshIndicator $visible={refreshing}>
            <LoadingSpinner style={{ width: '20px', height: '20px', margin: 0 }} />
            <span>새로고침 중...</span>
          </RefreshIndicator>
        )}

        {paymentHistory.length === 0 ? (
          <EmptyState>
            <div className="icon">📭</div>
            <h3>결제 내역이 없습니다</h3>
            <p>
              구독 결제 내역이 없습니다.<br />
              구독을 시작하면 결제 내역이 표시됩니다.
            </p>
          </EmptyState>
        ) : (
          <HistoryList>
            {sortedPayments.map((payment) => (
              <HistoryCard key={payment.order_idx}>
                <CardContent>
                  <PaymentRow>
                    <PaymentTitle>
                      {payment.order_name || '구독 서비스 결제'}
                      <StatusBadge $status={payment.order_status}>
                        {getStatusText(payment)}
                      </StatusBadge>
                    </PaymentTitle>
                    <PaymentAmount $status={payment.order_status}>
                      {payment.order_status !== 'CANCELLED' ? (`${payment.order_price?.toLocaleString() || '0'}원` || 'N/A') : ('')}
                    </PaymentAmount>
                  </PaymentRow>
                  
                  <PaymentRow>
                    <PaymentDate>
                      {formatDate(payment)}
                    </PaymentDate>
                    <PaymentMethod>
                      {payment.order_status !== 'CANCELLED' ? (payment.order_card || payment.order_provider) : ('')}
                      {payment.order_status !== 'CANCELLED' ? (payment.order_card_num || '') : ('')}
                    </PaymentMethod>
                  </PaymentRow>
                </CardContent>
              </HistoryCard>
            ))}
          </HistoryList>
        )}
      </PullToRefreshContainer>
    </Container>
  );
};

export default SubscriptionPaymentHistory;

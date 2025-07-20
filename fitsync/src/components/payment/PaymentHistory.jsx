import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { PaymentUtil } from '../../utils/PaymentUtil';

const PaymentHistoryContainer = styled.div`
  padding: 2rem;
  background: var(--bg-primary);
  min-height: 100vh;
`;

const PageTitle = styled.h1`
  font-size: 2.4rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 3rem;
  text-align: center;
`;

const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const PaymentCard = styled.div`
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid var(--border-light);
  position: relative;
`;

const PaymentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 500px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const PaymentTitle = styled.h3`
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.8rem;
`;

const PriceDisplay = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-blue);
  
  @media (max-width: 500px) {
    font-size: 1.8rem;
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.6rem 1.2rem;
  border-radius: 20px;
  font-size: 1.2rem;
  font-weight: 600;
  text-transform: uppercase;
  
  ${props => {
    switch (props.status) {
      case 'PAID':
        return `
          background: var(--success);
          color: white;
        `;
      case 'FAILED':
        return `
          background: var(--warning);
          color: white;
        `;
      case 'READY':
        return `
          background: var(--info);
          color: white;
        `;
      default:
        return `
          background: var(--border-medium);
          color: var(--text-primary);
        `;
    }
  }}
`;

const PaymentDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 1.5rem;
  
  /* 카드 정보가 없는 경우 단일 컬럼으로 표시 */
  &.single-column {
    grid-template-columns: 1fr;
  }
  
  @media (max-width: 400px) {
    grid-template-columns: 1fr;
    gap: 1.2rem;
  }
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const DetailLabel = styled.span`
  font-size: 1.3rem;
  color: var(--text-secondary);
  font-weight: 500;
`;

const DetailValue = styled.span`
  font-size: 1.6rem;
  color: var(--text-primary);
  font-weight: 600;
  
  &.price {
    color: var(--primary-blue);
    font-size: 1.8rem;
  }
`;

const DateInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-light);
  
  @media (max-width: 500px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const DateItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

const DateLabel = styled.span`
  font-size: 1.2rem;
  color: var(--text-tertiary);
`;

const DateValue = styled.span`
  font-size: 1.4rem;
  color: var(--text-secondary);
`;

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.6rem;
  color: var(--text-secondary);
`;

const ErrorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  padding: 4rem 2rem;
  text-align: center;
`;

const ErrorMessage = styled.p`
  font-size: 1.6rem;
  color: var(--text-secondary);
  line-height: 1.5;
`;

const RetryButton = styled.button`
  background: var(--primary-blue);
  color: white;
  padding: 1.2rem 2.4rem;
  border-radius: 8px;
  font-size: 1.4rem;
  font-weight: 600;
  transition: background 0.2s ease;
  
  &:active {
    background: var(--primary-blue-dark);
    transform: translateY(1px);
  }
`;

const EmptyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  padding: 6rem 2rem;
  text-align: center;
`;

const EmptyIcon = styled.div`
  width: 80px;
  height: 80px;
  background: var(--bg-tertiary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: var(--text-tertiary);
`;

const EmptyMessage = styled.p`
  font-size: 1.8rem;
  color: var(--text-secondary);
  line-height: 1.5;
`;

const PaymentHistory = () => {
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await PaymentUtil.getPaymentHistory();
      
      if (response.success) {
        setPaymentHistory(response.data.history || []);
      } else {
        setError(response.message || '결제 내역 조회에 실패했습니다.');
      }
    } catch (err) {
      console.error('결제 내역 조회 오류:', err);
      setError(err.message || '결제 내역을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PAID': return '결제완료';
      case 'FAILED': return '결제실패';
      case 'READY': return '결제대기';
      case 'CANCELLED': return '결제취소';
      default: return '알수없음';
    }
  };

  const getDisplayMethodName = (payment) => {
    if (payment.method_name && 
        payment.method_name !== '카카오페이' && 
        payment.method_name !== '토스페이먼츠') {
      return payment.method_name;
    }
    
    switch (payment.method_provider) {
      case 'KAKAOPAY': return '카카오페이';
      case 'TOSSPAYMENTS': return '토스페이먼츠';
      default: return '기타 결제수단';
    }
  };

  const getCardDisplayInfo = (payment) => {
    if (!payment.method_card_num || payment.method_card_num.length < 4) {
      return '****-****-****-****';
    }
    
    const cardName = payment.method_card && 
                    !payment.method_card.includes('실패') && 
                    !payment.method_card.includes('알 수 없는') 
                    ? payment.method_card : '카드';
    
    const last4 = payment.method_card_num.substring(payment.method_card_num.length - 4);
    const maskedNumber = '****-****-****-' + last4;
    
    return `${cardName} ${maskedNumber}`;
  };

  // 카드 결제인지 확인하는 함수
  const isCardPayment = (payment) => {
    // API에서 받은 타입 정보 우선 확인
    if (payment.apiMethodType) {
      return payment.apiMethodType === 'card';
    }
    
    // 간편결제 제공업체 확인
    const easyPayProviders = ['KAKAOPAY', 'TOSSPAYMENTS', 'NAVERPAY', 'PAYCO'];
    if (easyPayProviders.includes(payment.method_provider)) {
      return false;
    }
    
    // 간편결제 이름 확인
    const methodName = payment.method_name || '';
    const easyPayNames = ['카카오페이', '토스페이먼츠', '네이버페이', 'PAYCO'];
    if (easyPayNames.some(name => methodName.includes(name))) {
      return false;
    }
    
    // 기본적으로 카드 결제로 간주
    return true;
  };

  if (loading) {
    return (
      <PaymentHistoryContainer>
        <PageTitle>결제 내역</PageTitle>
        <LoadingWrapper>
          결제 내역을 불러오는 중...
        </LoadingWrapper>
      </PaymentHistoryContainer>
    );
  }

  if (error) {
    return (
      <PaymentHistoryContainer>
        <PageTitle>결제 내역</PageTitle>
        <ErrorWrapper>
          <ErrorMessage>{error}</ErrorMessage>
          <RetryButton onClick={fetchPaymentHistory}>
            다시 시도
          </RetryButton>
        </ErrorWrapper>
      </PaymentHistoryContainer>
    );
  }

  if (paymentHistory.length === 0) {
    return (
      <PaymentHistoryContainer>
        <PageTitle>결제 내역</PageTitle>
        <EmptyWrapper>
          <EmptyIcon>💳</EmptyIcon>
          <EmptyMessage>
            아직 결제 내역이 없습니다.<br />
            첫 구독을 시작해보세요!
          </EmptyMessage>
        </EmptyWrapper>
      </PaymentHistoryContainer>
    );
  }

  return (
    <PaymentHistoryContainer>
      <PageTitle>결제 내역</PageTitle>
      <HistoryList>
        {paymentHistory.map((payment) => (
          <PaymentCard key={payment.order_idx}>
            <PaymentHeader>
              <div>
                <PaymentTitle>{payment.order_name}</PaymentTitle>
                <PriceDisplay>
                  {formatPrice(payment.order_price)}원
                </PriceDisplay>
              </div>
              <StatusBadge status={payment.order_status}>
                {getStatusText(payment.order_status)}
              </StatusBadge>
            </PaymentHeader>
            
            <PaymentDetails className={!isCardPayment(payment) ? 'single-column' : ''}>
              <DetailItem>
                <DetailLabel>결제수단</DetailLabel>
                <DetailValue>
                  {payment.displayMethodName || getDisplayMethodName(payment)}
                </DetailValue>
              </DetailItem>
              
              {isCardPayment(payment) && (
                <DetailItem>
                  <DetailLabel>카드정보</DetailLabel>
                  <DetailValue>{payment.cardDisplayInfo || getCardDisplayInfo(payment)}</DetailValue>
                </DetailItem>
              )}
            </PaymentDetails>
            
            <DateInfo>
              <DateItem>
                <DateLabel>주문일</DateLabel>
                <DateValue>{formatDate(payment.order_regdate)}</DateValue>
              </DateItem>
              
              {payment.order_paydate && (
                <DateItem>
                  <DateLabel>결제일</DateLabel>
                  <DateValue>{formatDate(payment.order_paydate)}</DateValue>
                </DateItem>
              )}
            </DateInfo>
          </PaymentCard>
        ))}
      </HistoryList>
    </PaymentHistoryContainer>
  );
};

export default PaymentHistory;

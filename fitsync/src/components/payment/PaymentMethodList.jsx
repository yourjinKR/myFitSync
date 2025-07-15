import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { PaymentUtil } from '../../utils/PaymentUtil';
import PaymentMethodCard from './PaymentMethodCard';
import LoadingSpinner from './LoadingSpinner';
import MessageDisplay from './MessageDisplay';

const Container = styled.div`
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h2`
  margin: 0;
  color: var(--text-primary);
  font-size: 2rem;
  font-weight: 600;
`;

const AddMethodButton = styled.button`
  background: var(--success);
  color: var(--text-primary);
  border: none;
  padding: 1rem 2rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 1.4rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: #228B22;
    transform: translateY(-1px);
  }
`;

const MethodsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 6rem 2rem;
  color: var(--text-secondary);
  
  h3 {
    margin-bottom: 1rem;
    color: var(--text-tertiary);
    font-size: 1.8rem;
  }
  
  p {
    margin-bottom: 2rem;
    line-height: 1.5;
    font-size: 1.4rem;
  }
`;

const PaymentMethodList = () => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', content: '' });

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      setMessage({ type: '', content: '' });
      
      const response = await PaymentUtil.getBillingKeys();
      
      if (response.success) {
        setPaymentMethods(response.data || []);
      } else {
        setMessage({ 
          type: 'error', 
          content: response.message || '결제수단 목록을 불러오는데 실패했습니다.' 
        });
      }
    } catch (err) {
      console.error('결제수단 목록 로드 실패:', err);
      setMessage({ 
        type: 'error', 
        content: '결제수단 목록을 불러오는데 실패했습니다.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMethodRenamed = (methodIdx, newName) => {
    setPaymentMethods(prev => 
      prev.map(method => 
        method.method_idx === methodIdx 
          ? { ...method, method_name: newName }
          : method
      )
    );
    setMessage({ 
      type: 'success', 
      content: '결제수단 이름이 성공적으로 변경되었습니다.' 
    });
  };

  const handleMethodDeleted = (methodIdx) => {
    setPaymentMethods(prev => 
      prev.filter(method => method.method_idx !== methodIdx)
    );
    setMessage({ 
      type: 'success', 
      content: '결제수단이 삭제되었습니다.' 
    });
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner message="결제수단 목록을 불러오는 중..." />
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>내 결제수단</Title>
        <AddMethodButton onClick={() => window.location.href = '/payment/test'}>
          + 결제수단 추가
        </AddMethodButton>
      </Header>
      
      <MessageDisplay message={message} onClose={() => setMessage({ type: '', content: '' })} />
      
      {paymentMethods.length === 0 ? (
        <EmptyState>
          <h3>등록된 결제수단이 없습니다</h3>
          <p>
            새로운 결제수단을 등록하여<br />
            편리하게 결제를 이용해보세요.
          </p>
          <AddMethodButton onClick={() => window.location.href = '/payment/test'}>
            첫 결제수단 등록하기
          </AddMethodButton>
        </EmptyState>
      ) : (
        <MethodsList>
          {paymentMethods.map((method) => (
            <PaymentMethodCard
              key={method.method_idx}
              method={method}
              onRenamed={handleMethodRenamed}
              onDeleted={handleMethodDeleted}
              onError={(message) => setMessage({ type: 'error', content: message })}
            />
          ))}
        </MethodsList>
      )}
    </Container>
  );
};

export default PaymentMethodList;

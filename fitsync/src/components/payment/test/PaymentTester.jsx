import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { PaymentUtil } from '../../../utils/PaymentUtil';
import MessageDisplay from '../MessageDisplay';
import LoadingSpinner from '../LoadingSpinner';

const Container = styled.div`
  padding: 2rem;
`;

const Title = styled.h3`
  margin-bottom: 2rem;
  color: var(--text-primary);
  font-size: 2rem;
  font-weight: 600;
`;

const TestSection = styled.div`
  background: var(--bg-tertiary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h4`
  margin: 0 0 1.5rem 0;
  color: var(--text-primary);
  font-size: 1.6rem;
  font-weight: 600;
`;

const TestButton = styled.button`
  background: var(--primary-blue);
  color: var(--text-primary);
  border: none;
  padding: 1.2rem 2.4rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.4rem;
  font-weight: 500;
  margin-right: 1rem;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    background: var(--primary-blue-hover);
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PaymentTestButton = styled(TestButton)`
  background: var(--success);
  
  &:hover:not(:disabled) {
    background: #228B22;
  }
`;

const InfoBox = styled.div`
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 6px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  font-size: 1.4rem;
  line-height: 1.5;
  color: var(--text-secondary);
`;

const ResultBox = styled.pre`
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 6px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  font-size: 1.2rem;
  overflow-x: auto;
  white-space: pre-wrap;
  color: var(--text-secondary);
  font-family: 'Courier New', monospace;
`;

const PaymentTester = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [testResults, setTestResults] = useState({});
  const [paymentMethods, setPaymentMethods] = useState([]);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const response = await PaymentUtil.getBillingKeys();
      if (response.success) {
        setPaymentMethods(response.data || []);
      }
    } catch (error) {
      console.error('결제수단 로드 실패:', error);
    }
  };

  const generatePaymentId = () => {
    return [...crypto.getRandomValues(new Uint32Array(2))]
      .map((word) => word.toString(16).padStart(8, "0"))
      .join("");
  };

  const handleBillingPaymentTest = async () => {
    setIsLoading(true);
    setMessage({ type: '', content: '' });

    try {
      const paymentId = generatePaymentId();
      setMessage({ 
        type: 'info', 
        content: `결제 ID: ${paymentId}로 빌링키 결제를 테스트하는 중...` 
      });

      const response = await axios.post('/payment/bill/pay', {
        paymentId,
      });
      
      setTestResults(prev => ({
        ...prev,
        billingPayment: {
          success: true,
          data: response.data,
          timestamp: new Date().toLocaleString()
        }
      }));
      
      if (response.data.success) {
        setMessage({ 
          type: 'success', 
          content: '결제가 성공적으로 완료되었습니다!' 
        });
      } else {
        setMessage({ 
          type: 'error', 
          content: `결제 실패: ${response.data.message}` 
        });
      }
      
    } catch (error) {
      console.error('빌링키 결제 테스트 실패:', error);
      
      let errorMessage = '결제 테스트 중 오류가 발생했습니다.';
      
      if (error.response) {
        errorMessage = `서버 오류: ${error.response.data?.message || error.response.status}`;
        setTestResults(prev => ({
          ...prev,
          billingPayment: {
            success: false,
            error: error.response.data,
            timestamp: new Date().toLocaleString()
          }
        }));
      } else if (error.request) {
        errorMessage = '서버에서 응답이 없습니다. 네트워크를 확인해주세요.';
      } else {
        errorMessage = `요청 오류: ${error.message}`;
      }
      
      setMessage({ type: 'error', content: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetPaymentMethodsTest = async () => {
    setIsLoading(true);
    setMessage({ type: '', content: '' });

    try {
      const response = await PaymentUtil.getBillingKeys();
      
      setTestResults(prev => ({
        ...prev,
        paymentMethods: {
          success: response.success,
          data: response,
          timestamp: new Date().toLocaleString()
        }
      }));
      
      if (response.success) {
        setPaymentMethods(response.data || []);
        setMessage({ 
          type: 'success', 
          content: `${response.data?.length || 0}개의 결제수단을 조회했습니다.` 
        });
      } else {
        setMessage({ 
          type: 'error', 
          content: `조회 실패: ${response.message}` 
        });
      }
    } catch (error) {
      console.error('결제수단 목록 조회 테스트 실패:', error);
      
      let errorMessage = '결제수단 목록 조회 중 오류가 발생했습니다.';
      
      if (error.response) {
        errorMessage = `서버 오류: ${error.response.data?.message || error.response.status}`;
      }
      
      setMessage({ type: 'error', content: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults({});
    setMessage({ type: '', content: '' });
  };

  if (isLoading) {
    return (
      <Container>
        <LoadingSpinner message="테스트를 실행하는 중..." />
      </Container>
    );
  }

  return (
    <Container>
      <Title>🧪 결제 기능 테스트</Title>
      
      <MessageDisplay 
        message={message} 
        onClose={() => setMessage({ type: '', content: '' })} 
      />
      
      <TestSection>
        <SectionTitle>결제수단 관리 테스트</SectionTitle>
        <InfoBox>
          등록된 결제수단을 조회하고 관리 기능을 테스트합니다.
        </InfoBox>
        
        <TestButton onClick={handleGetPaymentMethodsTest} disabled={isLoading}>
          내 결제수단 목록 조회
        </TestButton>
        
        {paymentMethods.length > 0 && (
          <InfoBox>
            <strong>현재 등록된 결제수단: {paymentMethods.length}개</strong>
            <br />
            {paymentMethods.map((method, index) => (
              <div key={method.method_idx}>
                {index + 1}. {method.method_name} ({method.method_provider})
              </div>
            ))}
          </InfoBox>
        )}
      </TestSection>
      
      <TestSection>
        <SectionTitle>빌링키 결제 테스트</SectionTitle>
        <InfoBox>
          등록된 빌링키를 사용하여 실제 결제를 테스트합니다. 
          (테스트 환경에서는 실제 결제가 발생하지 않습니다)
        </InfoBox>
        
        <PaymentTestButton onClick={handleBillingPaymentTest} disabled={isLoading || paymentMethods.length === 0}>
          빌링키 결제 테스트
        </PaymentTestButton>
        
        {paymentMethods.length === 0 && (
          <InfoBox>
            ⚠️ 결제 테스트를 위해서는 먼저 결제수단을 등록해야 합니다.
          </InfoBox>
        )}
      </TestSection>
      
      <TestSection>
        <SectionTitle>테스트 결과</SectionTitle>
        <TestButton onClick={clearResults}>결과 초기화</TestButton>
        
        {Object.keys(testResults).length > 0 && (
          <ResultBox>
            {JSON.stringify(testResults, null, 2)}
          </ResultBox>
        )}
      </TestSection>
    </Container>
  );
};

export default PaymentTester;

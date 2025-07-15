import React, { useState } from 'react';
import styled from 'styled-components';
import { KAKAOPAY, TOSSPAYMENTS, PaymentUtil } from '../../../utils/PaymentUtil';
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

const Description = styled.p`
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 3rem;
  font-size: 1.4rem;
`;

const ProviderGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const ProviderCard = styled.div`
  border: 2px solid var(--border-light);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--bg-tertiary);
  
  &:hover {
    border-color: var(--primary-blue);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(74, 144, 226, 0.2);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ProviderLogo = styled.div`
  width: 6rem;
  height: 6rem;
  margin: 0 auto 1.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.4rem;
  
  ${props => props.provider === 'KAKAOPAY' && `
    background: #FEE500;
    color: #000;
  `}
  
  ${props => props.provider === 'TOSSPAYMENTS' && `
    background: #4A90E2;
    color: #ffffff;
  `}
`;

const ProviderName = styled.h4`
  margin: 0 0 0.8rem 0;
  color: var(--text-primary);
  font-size: 1.8rem;
  font-weight: 600;
`;

const ProviderDescription = styled.p`
  margin: 0;
  color: var(--text-secondary);
  font-size: 1.4rem;
  line-height: 1.4;
`;

const ProcessSteps = styled.div`
  background: var(--bg-tertiary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  padding: 2rem;
  margin-top: 3rem;
`;

const StepsTitle = styled.h4`
  margin: 0 0 1.5rem 0;
  color: var(--text-primary);
  font-size: 1.6rem;
  font-weight: 600;
`;

const StepsList = styled.ol`
  margin: 0;
  padding-left: 2rem;
  color: var(--text-secondary);
  
  li {
    margin-bottom: 0.8rem;
    line-height: 1.4;
    font-size: 1.4rem;
  }
`;

const BillingKeyIssuer = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });

  const handleProviderSelect = async (provider) => {
    setIsLoading(true);
    setMessage({ type: '', content: '' });

    try {
      setMessage({ 
        type: 'info', 
        content: `${provider === 'KAKAOPAY' ? '카카오페이' : '토스페이먼츠'} 빌링키를 발급하는 중...` 
      });

      const result = await PaymentUtil.issueBillingKey(provider);
      
      if (result !== null) {
        // 빌링키 저장
        await PaymentUtil.saveBillingKey({
          method_key: result.billingKey,
          method_provider: provider,
        });
        
        setMessage({ 
          type: 'success', 
          content: '빌링키가 성공적으로 발급되고 저장되었습니다!' 
        });
      } else {
        setMessage({ 
          type: 'error', 
          content: `빌링키 발급 실패: ${result?.message || '알 수 없는 오류'}` 
        });
      }
      
    } catch (error) {
      console.error('빌링키 발급 및 저장 중 오류:', error);
      
      let errorMessage = '빌링키 발급 중 오류가 발생했습니다.';
      
      if (error.response) {
        errorMessage = `서버 오류: ${error.response.data?.message || error.response.status}`;
      } else if (error.request) {
        errorMessage = '네트워크 오류가 발생했습니다. 연결을 확인해주세요.';
      } else {
        errorMessage = `오류: ${error.message}`;
      }
      
      setMessage({ type: 'error', content: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Container>
        <LoadingSpinner message="빌링키를 발급하는 중입니다..." />
      </Container>
    );
  }

  return (
    <Container>
      <Title>새 결제수단 등록</Title>
      <Description>
        빌링키를 발급하여 간편하게 결제할 수 있는 결제수단을 등록하세요. 
        등록된 결제수단은 별도 인증 없이 즉시 결제가 가능합니다.
      </Description>
      
      <MessageDisplay 
        message={message} 
        onClose={() => setMessage({ type: '', content: '' })} 
      />
      
      <ProviderGrid>
        <ProviderCard onClick={() => handleProviderSelect(KAKAOPAY)}>
          <ProviderLogo provider="KAKAOPAY">
            카카오페이
          </ProviderLogo>
          <ProviderName>카카오페이</ProviderName>
          <ProviderDescription>
            카카오톡으로 간편하게<br />
            결제수단을 등록하세요
          </ProviderDescription>
        </ProviderCard>
        
        <ProviderCard onClick={() => handleProviderSelect(TOSSPAYMENTS)}>
          <ProviderLogo provider="TOSSPAYMENTS">
            토스페이먼츠
          </ProviderLogo>
          <ProviderName>토스페이먼츠</ProviderName>
          <ProviderDescription>
            안전하고 빠른<br />
            카드 결제 시스템
          </ProviderDescription>
        </ProviderCard>
      </ProviderGrid>
      
      <ProcessSteps>
        <StepsTitle>📋 빌링키 등록 과정</StepsTitle>
        <StepsList>
          <li>원하는 결제 서비스를 선택합니다</li>
          <li>선택한 서비스의 인증 페이지로 이동합니다</li>
          <li>결제수단(카드)을 등록하고 인증을 완료합니다</li>
          <li>빌링키가 자동으로 발급되어 저장됩니다</li>
          <li>이후 별도 인증 없이 간편 결제가 가능합니다</li>
        </StepsList>
      </ProcessSteps>
    </Container>
  );
};

export default BillingKeyIssuer;

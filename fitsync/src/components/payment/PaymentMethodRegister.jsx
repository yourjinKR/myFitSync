import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { KAKAOPAY, TOSSPAYMENTS, PaymentUtil } from '../../utils/PaymentUtil';
import MessageDisplay from './MessageDisplay';
import LoadingSpinner from './LoadingSpinner';

const Container = styled.div`
  padding: 2rem;
  min-height: 100vh;
  background: var(--bg-primary);
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  background: transparent;
  color: var(--text-secondary);
  border: none;
  padding: 1rem 0;
  margin-bottom: 2rem;
  font-size: 1.4rem;
  cursor: pointer;
  transition: color 0.3s ease;
  
  &:hover {
    color: var(--text-primary);
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 4rem;
`;

const Title = styled.h1`
  color: var(--text-primary);
  font-size: 2.8rem;
  font-weight: 700;
  margin-bottom: 1rem;
`;

const Subtitle = styled.p`
  color: var(--text-secondary);
  font-size: 1.6rem;
  line-height: 1.6;
  max-width: 500px;
  margin: 0 auto;
`;

const ProviderSection = styled.div`
  margin-bottom: 4rem;
`;

const SectionTitle = styled.h2`
  color: var(--text-primary);
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 2rem;
  text-align: center;
`;

const ProviderGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const ProviderCard = styled.button`
  border: 2px solid var(--border-light);
  border-radius: 16px;
  padding: 3rem 2rem;
  background: var(--bg-tertiary);
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  
  &:hover {
    border-color: var(--primary-blue);
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(74, 144, 226, 0.25);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ProviderLogo = styled.div`
  width: 8rem;
  height: 8rem;
  margin: 0 auto 2rem;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.6rem;
  position: relative;
  
  ${props => props.provider === 'KAKAOPAY' && `
    background: linear-gradient(135deg, #FEE500 0%, #F5DC00 100%);
    color: #000;
    box-shadow: 0 4px 15px rgba(254, 229, 0, 0.4);
  `}
  
  ${props => props.provider === 'TOSSPAYMENTS' && `
    background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
    color: #ffffff;
    box-shadow: 0 4px 15px rgba(74, 144, 226, 0.4);
  `}
  
  &::after {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    border-radius: 18px;
    background: linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.1) 100%);
    z-index: -1;
  }
`;

const ProviderName = styled.h3`
  color: var(--text-primary);
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const ProviderDescription = styled.p`
  color: var(--text-secondary);
  font-size: 1.4rem;
  line-height: 1.5;
  margin-bottom: 2rem;
`;

const ProviderFeatures = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  
  li {
    color: var(--text-tertiary);
    font-size: 1.3rem;
    margin-bottom: 0.5rem;
    position: relative;
    padding-left: 1.5rem;
    
    &::before {
      content: '✓';
      position: absolute;
      left: 0;
      color: var(--success);
      font-weight: bold;
    }
  }
`;

const InfoSection = styled.div`
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 3rem;
  margin-bottom: 3rem;
`;

const InfoTitle = styled.h3`
  color: var(--text-primary);
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ProcessSteps = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
`;

const ProcessStep = styled.div`
  text-align: center;
  
  .step-number {
    width: 4rem;
    height: 4rem;
    background: var(--primary-blue);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 1.8rem;
    margin: 0 auto 1.5rem;
  }
  
  .step-title {
    color: var(--text-primary);
    font-size: 1.6rem;
    font-weight: 600;
    margin-bottom: 0.8rem;
  }
  
  .step-description {
    color: var(--text-secondary);
    font-size: 1.3rem;
    line-height: 1.4;
  }
`;

const SecurityNotice = styled.div`
  background: rgba(74, 144, 226, 0.1);
  border: 1px solid var(--primary-blue);
  border-radius: 8px;
  padding: 2rem;
  
  h4 {
    color: var(--primary-blue);
    font-size: 1.6rem;
    font-weight: 600;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.8rem;
  }
  
  p {
    color: var(--text-secondary);
    font-size: 1.4rem;
    line-height: 1.5;
    margin: 0;
  }
`;

const PaymentMethodRegister = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [loadingProvider, setLoadingProvider] = useState(null);

  const handleBackClick = () => {
    navigate('/payment/methods');
  };

  const handleProviderSelect = async (provider) => {
    setIsLoading(true);
    setLoadingProvider(provider);
    setMessage({ type: '', content: '' });

    try {
      const providerName = provider === 'KAKAOPAY' ? '카카오페이' : '토스페이먼츠';
      
      setMessage({ 
        type: 'info', 
        content: `${providerName} 결제수단을 등록하는 중입니다...` 
      });

      // 빌링키 발급
      const result = await PaymentUtil.issueBillingKey(provider);
      
      if (result !== null && result.billingKey) {
        // 빌링키 저장
        const saveResult = await PaymentUtil.saveBillingKey({
          method_key: result.billingKey,
          method_provider: provider,
        });
        
        if (saveResult.success) {
          setMessage({ 
            type: 'success', 
            content: `${providerName} 결제수단이 성공적으로 등록되었습니다!` 
          });
          
          // 3초 후 결제수단 목록으로 이동
          setTimeout(() => {
            navigate('/payment/methods');
          }, 3000);
        } else {
          setMessage({ 
            type: 'error', 
            content: saveResult.message || '결제수단 저장에 실패했습니다.' 
          });
        }
      } else {
        setMessage({ 
          type: 'error', 
          content: '빌링키 발급에 실패했습니다. 다시 시도해 주세요.' 
        });
      }
      
    } catch (error) {
      console.error('결제수단 등록 중 오류:', error);
      
      let errorMessage = '결제수단 등록 중 오류가 발생했습니다.';
      
      if (error.response) {
        errorMessage = `서버 오류: ${error.response.data?.message || error.response.status}`;
      } else if (error.request) {
        errorMessage = '네트워크 오류가 발생했습니다. 연결을 확인해주세요.';
      } else if (error.message) {
        errorMessage = `오류: ${error.message}`;
      }
      
      setMessage({ type: 'error', content: errorMessage });
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  if (isLoading) {
    return (
      <Container>
        <LoadingSpinner 
          message={`${loadingProvider === 'KAKAOPAY' ? '카카오페이' : '토스페이먼츠'} 결제수단을 등록하는 중입니다...`} 
        />
      </Container>
    );
  }

  return (
    <Container>
      <BackButton onClick={handleBackClick}>
        ← 결제수단 목록으로 돌아가기
      </BackButton>
      
      <Header>
        <Title>새 결제수단 등록</Title>
        <Subtitle>
          간편하고 안전한 결제를 위해<br />
          결제수단을 등록해 보세요
        </Subtitle>
      </Header>
      
      <MessageDisplay 
        message={message} 
        onClose={() => setMessage({ type: '', content: '' })} 
      />
      
      <ProviderSection>
        <SectionTitle>결제 서비스 선택</SectionTitle>
        <ProviderGrid>
          <ProviderCard 
            onClick={() => handleProviderSelect(KAKAOPAY)}
            disabled={isLoading}
          >
            <ProviderLogo provider="KAKAOPAY">
              카카오페이
            </ProviderLogo>
            <ProviderName>카카오페이</ProviderName>
            <ProviderDescription>
              카카오톡으로 간편하게 결제하세요
            </ProviderDescription>
            <ProviderFeatures>
              <li>카카오톡 간편 인증</li>
              <li>빠른 결제 처리</li>
              <li>안전한 보안 시스템</li>
            </ProviderFeatures>
          </ProviderCard>
          
          <ProviderCard 
            onClick={() => handleProviderSelect(TOSSPAYMENTS)}
            disabled={isLoading}
          >
            <ProviderLogo provider="TOSSPAYMENTS">
              토스페이먼츠
            </ProviderLogo>
            <ProviderName>토스페이먼츠</ProviderName>
            <ProviderDescription>
              안전하고 빠른 카드 결제 시스템
            </ProviderDescription>
            <ProviderFeatures>
              <li>다양한 카드사 지원</li>
              <li>실시간 결제 승인</li>
              <li>금융보안원 인증</li>
            </ProviderFeatures>
          </ProviderCard>
        </ProviderGrid>
      </ProviderSection>
      
      <InfoSection>
        <InfoTitle>
          📋 등록 과정
        </InfoTitle>
        <ProcessSteps>
          <ProcessStep>
            <div className="step-number">1</div>
            <div className="step-title">서비스 선택</div>
            <div className="step-description">
              원하는 결제 서비스를 선택합니다
            </div>
          </ProcessStep>
          <ProcessStep>
            <div className="step-number">2</div>
            <div className="step-title">인증 페이지</div>
            <div className="step-description">
              선택한 서비스의 인증 페이지로 이동합니다
            </div>
          </ProcessStep>
          <ProcessStep>
            <div className="step-number">3</div>
            <div className="step-title">결제수단 등록</div>
            <div className="step-description">
              카드 정보를 입력하고 인증을 완료합니다
            </div>
          </ProcessStep>
          <ProcessStep>
            <div className="step-number">4</div>
            <div className="step-title">등록 완료</div>
            <div className="step-description">
              빌링키가 자동 발급되어 저장됩니다
            </div>
          </ProcessStep>
        </ProcessSteps>
        
        <SecurityNotice>
          <h4>
            🛡️ 보안 안내
          </h4>
          <p>
            모든 결제 정보는 PCI DSS 레벨 1 인증을 받은 안전한 시스템에서 암호화되어 처리됩니다. 
            카드 정보는 저장되지 않으며, 빌링키만 안전하게 보관되어 향후 결제 시 사용됩니다.
          </p>
        </SecurityNotice>
      </InfoSection>
    </Container>
  );
};

export default PaymentMethodRegister;

import React, { useState } from 'react';
import styled from 'styled-components';
import { PaymentUtil } from '../../utils/PaymentUtil';

// 모달 오버레이
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 16px;
`;

// 모달 컨테이너
const ModalContainer = styled.div`
  background: var(--bg-secondary);
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  animation: slideUp 0.3s ease-out;
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// 모달 헤더
const ModalHeader = styled.div`
  padding: 20px 20px 16px 20px;
  border-bottom: 1px solid var(--border-light);
  position: relative;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: bold;
  color: var(--text-primary);
  text-align: center;
  margin: 0;
  
  @media (min-width: 375px) {
    font-size: 21px;
  }
  
  @media (min-width: 414px) {
    font-size: 22px;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  border: none;
  color: var(--text-secondary);
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--border-light);
    color: var(--text-primary);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

// 모달 컨텐츠
const ModalContent = styled.div`
  padding: 20px;
`;

// 결제 정보 섹션
const PaymentInfo = styled.div`
  background: var(--bg-tertiary);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
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
  font-size: 14px;
  color: var(--text-secondary);
  
  @media (min-width: 375px) {
    font-size: 15px;
  }
`;

const InfoValue = styled.span`
  font-size: 14px;
  color: var(--text-primary);
  font-weight: ${props => props.$bold ? 'bold' : '500'};
  
  @media (min-width: 375px) {
    font-size: 15px;
  }
  
  ${props => props.$highlight && `
    color: var(--primary-blue);
    font-size: 16px;
    
    @media (min-width: 375px) {
      font-size: 17px;
    }
    
    @media (min-width: 414px) {
      font-size: 18px;
    }
  `}
`;

// 선택된 결제수단 표시
const PaymentMethodCard = styled.div`
  background: var(--bg-primary);
  border: 2px solid var(--primary-blue);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
`;

const PaymentMethodHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

const PaymentMethodIcon = styled.span`
  font-size: 20px;
  margin-right: 12px;
`;

const PaymentMethodName = styled.h3`
  font-size: 16px;
  font-weight: bold;
  color: var(--text-primary);
  margin: 0;
  
  @media (min-width: 375px) {
    font-size: 17px;
  }
`;

const PaymentMethodDetails = styled.div`
  font-size: 13px;
  color: var(--text-secondary);
  
  @media (min-width: 375px) {
    font-size: 14px;
  }
`;

// 약관 동의
const TermsSection = styled.div`
  margin-bottom: 24px;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: var(--bg-tertiary);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--border-light);
  }
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  margin: 0;
  cursor: pointer;
`;

const TermsText = styled.label`
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.4;
  cursor: pointer;
  
  @media (min-width: 375px) {
    font-size: 14px;
  }
  
  button {
    color: var(--primary-blue);
    text-decoration: underline;
    background: none;
    border: none;
    padding: 0;
    font: inherit;
    cursor: pointer;
    
    &:hover {
      color: var(--primary-blue-hover);
    }
  }
`;

// 버튼 영역
const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

const Button = styled.button`
  flex: 1;
  padding: 16px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: bold;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  
  @media (min-width: 375px) {
    font-size: 17px;
  }
  
  &:active {
    transform: scale(0.98);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const CancelButton = styled(Button)`
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border: 1px solid var(--border-light);
  
  &:hover:not(:disabled) {
    background: var(--border-light);
    color: var(--text-primary);
  }
`;

const ConfirmButton = styled(Button)`
  background: var(--primary-blue);
  color: white;
  
  &:hover:not(:disabled) {
    background: var(--primary-blue-hover);
  }
`;

// 로딩 상태
const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(42, 42, 42, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 16px;
  gap: 16px;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-light);
  border-top: 3px solid var(--primary-blue);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  font-size: 16px;
  color: var(--text-primary);
  text-align: center;
  
  @media (min-width: 375px) {
    font-size: 17px;
  }
`;

const PaymentConfirmModal = ({ 
  isOpen, 
  onClose, 
  selectedPaymentMethod, 
  onPaymentSuccess,
  onPaymentError 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // 결제수단 아이콘 가져오기
  const getPaymentIcon = (method) => {
    if (method.method_provider === 'KAKAOPAY') {
      return '💛';
    } else if (method.method_provider === 'TOSSPAYMENTS') {
      return '💳';
    }
    return '💳';
  };

  // 간편결제 여부 확인
  const isEasyPayMethod = (method) => {
    return !method.method_card || !method.method_card_num;
  };

  // 결제 실행
  const handlePayment = async () => {
    if (!agreedToTerms) {
      alert('이용약관에 동의해주세요.');
      return;
    }

    setIsProcessing(true);

    try {
      const response = await PaymentUtil.payBillingKey({
        method_idx: selectedPaymentMethod.method_idx,
        method_provider: selectedPaymentMethod.method_provider,
        member_idx: selectedPaymentMethod.member_idx
      });

      if (response.success) {
        onPaymentSuccess(response);
      } else {
        onPaymentError(response.message || '결제에 실패했습니다.');
      }
    } catch (error) {
      console.error('결제 처리 중 오류:', error);
      onPaymentError('네트워크 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  // 모달이 열리지 않았거나 결제수단이 선택되지 않은 경우
  if (!isOpen || !selectedPaymentMethod) {
    return null;
  }

  const isEasyPay = isEasyPayMethod(selectedPaymentMethod);

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        {isProcessing && (
          <LoadingOverlay>
            <LoadingSpinner />
            <LoadingText>
              결제를 처리하고 있습니다...<br />
              잠시만 기다려주세요
            </LoadingText>
          </LoadingOverlay>
        )}

        <ModalHeader>
          <ModalTitle>구독 결제 확인</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>

        <ModalContent>
          {/* 결제 정보 */}
          <PaymentInfo>
            <InfoRow>
              <InfoLabel>상품명</InfoLabel>
              <InfoValue $bold>FitSync 프리미엄 구독</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>구독 기간</InfoLabel>
              <InfoValue>1개월</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>결제 금액</InfoLabel>
              <InfoValue $highlight $bold>3,000원</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>다음 결제일</InfoLabel>
              <InfoValue>
                {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('ko-KR')}
              </InfoValue>
            </InfoRow>
          </PaymentInfo>

          {/* 선택된 결제수단 */}
          <PaymentMethodCard>
            <PaymentMethodHeader>
              <PaymentMethodName>{selectedPaymentMethod.method_name}</PaymentMethodName>
            </PaymentMethodHeader>
            <PaymentMethodDetails>
              {isEasyPay 
                ? `${selectedPaymentMethod.method_provider === 'KAKAOPAY' ? '카카오페이' : selectedPaymentMethod.method_provider}`
                : `${selectedPaymentMethod.method_card} ${selectedPaymentMethod.method_card_num || ''}`
              }
              <br />
              {selectedPaymentMethod.method_provider}
            </PaymentMethodDetails>
          </PaymentMethodCard>

          {/* 약관 동의 */}
          <TermsSection>
            <CheckboxContainer onClick={() => setAgreedToTerms(!agreedToTerms)}>
              <Checkbox
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
              />
              <TermsText>
                <button type="button" onClick={(e) => {e.stopPropagation(); /* 약관 모달 열기 */}}>이용약관</button> 및 
                <button type="button" onClick={(e) => {e.stopPropagation(); /* 개인정보처리방침 모달 열기 */}}> 개인정보처리방침</button>에 동의하며,
                매월 자동결제됨을 확인했습니다.
              </TermsText>
            </CheckboxContainer>
          </TermsSection>

          {/* 버튼 영역 */}
          <ButtonContainer>
            <CancelButton onClick={onClose} disabled={isProcessing}>
              취소
            </CancelButton>
            <ConfirmButton 
              onClick={handlePayment} 
              disabled={!agreedToTerms || isProcessing}
            >
              {isProcessing ? '처리중...' : '결제하기'}
            </ConfirmButton>
          </ButtonContainer>
        </ModalContent>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default PaymentConfirmModal;

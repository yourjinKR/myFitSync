import React, { useState } from 'react';
import styled from 'styled-components';
import { PaymentUtil, KAKAOPAY, TOSSPAYMENTS } from '../../utils/PaymentUtil';
import { KakaoIcon } from '../member/KakaoLoginButton';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
`;

const ModalContent = styled.div`
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 24px;
  margin: 20px;
  max-width: 400px;
  width: 100%;
  border: 2px solid var(--border-light);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const ModalTitle = styled.h2`
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  
  @media (min-width: 375px) {
    font-size: 18px;
  }
  
  @media (min-width: 414px) {
    font-size: 19px;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  
  @media (min-width: 375px) {
    font-size: 26px;
  }
  
  @media (min-width: 414px) {
    font-size: 28px;
  }
  
  &:hover {
    color: var(--text-primary);
  }
`;

const PaymentOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
`;

const PaymentOption = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: var(--bg-tertiary);
  border: 2px solid var(--border-light);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    border-color: var(--primary-blue);
    background: var(--bg-secondary);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const OptionInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const OptionIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background: ${props => props.$bgColor || 'var(--bg-primary)'};
`;

const OptionDetails = styled.div`
  text-align: left;
`;

const OptionTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
  
  @media (min-width: 375px) {
    font-size: 16px;
  }
  
  @media (min-width: 414px) {
    font-size: 17px;
  }
`;

const OptionDescription = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
  
  @media (min-width: 375px) {
    font-size: 13px;
  }
  
  @media (min-width: 414px) {
    font-size: 14px;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px 20px;
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

const ErrorMessage = styled.div`
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid var(--warning);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  color: var(--warning);
  text-align: center;
  font-size: 16px;
`;

const SuccessMessage = styled.div`
  background: rgba(46, 139, 87, 0.1);
  border: 1px solid var(--success);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  color: var(--success);
  text-align: center;
  font-size: 16px;
`;

export const TossIcon = styled.svg`
  width: 24px;
  height: 24px;
  color: #0064ff; /* Toss 공식 색상 */
`;

const TossImageIcon = styled.img`
  width: 24px;
  height: 24px;
  object-fit: contain;
  display: inline-block;
`;

const AddPaymentMethodModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  if (!isOpen) return null;

  const handlePaymentMethodAdd = async (paymentType) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // 1단계: 빌링키 발급
      const result = await PaymentUtil.issueBillingKey(paymentType);
      
      if (result !== null && result.billingKey) {
        // 2단계: 중복 체크
        const duplicateCheckResult = await PaymentUtil.checkDuplicatePaymentMethod(result.billingKey);
        
        if (duplicateCheckResult.success && duplicateCheckResult.data) {
          const { isDuplicate } = duplicateCheckResult.data;
          
          if (isDuplicate) {
            // 중복된 경우 기존 결제수단 교체
            const saveResult = await PaymentUtil.saveBillingKeyWithDuplicateHandling({
              billing_key: result.billingKey,
              method_provider: paymentType,
              method_name: PaymentUtil.setDefaultPaymentMethodName(paymentType),
              replace_existing: true
            });
            
            if (saveResult.success) {
              setSuccess('기존 결제수단이 성공적으로 교체되었습니다!');
            } else {
              setError(saveResult.message || '결제수단 교체에 실패했습니다.');
              return;
            }
          } else {
            // 중복되지 않은 경우 새로운 결제수단 저장
            const saveResult = await PaymentUtil.saveBillingKeyWithDuplicateHandling({
              billing_key: result.billingKey,
              method_provider: paymentType,
              method_name: PaymentUtil.setDefaultPaymentMethodName(paymentType),
              replace_existing: false
            });
            
            if (saveResult.success) {
              setSuccess('결제수단이 성공적으로 등록되었습니다!');
            } else {
              setError(saveResult.message || '결제수단 등록에 실패했습니다.');
              return;
            }
          }
        } else {
          // 중복 체크 실패 시 기본 저장 방식 사용
          const saveResult = await PaymentUtil.saveBillingKey({
            method_key: result.billingKey,
            method_provider: paymentType
          });
          
          if (saveResult.success) {
            setSuccess('결제수단이 성공적으로 등록되었습니다!');
          } else {
            setError(saveResult.message || '결제수단 저장에 실패했습니다.');
            return;
          }
        }
        
        // 2초 후 모달 닫기 및 성공 콜백 호출
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
        
      } else {
        setError('빌링키 발급에 실패했습니다. 다시 시도해 주세요.');
      }
    } catch (err) {
      console.error('결제수단 등록 오류:', err);
      
      let errorMessage = '결제수단 등록 중 오류가 발생했습니다.';
      
      if (err.response) {
        errorMessage = `서버 오류: ${err.response.data?.message || err.response.status}`;
      } else if (err.request) {
        errorMessage = '네트워크 오류가 발생했습니다. 연결을 확인해주세요.';
      } else {
        errorMessage = `오류: ${err.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const paymentOptions = [
    {
      type: KAKAOPAY,
      title: '카카오페이',
      description: '카카오톡으로 간편하게',
      icon: (
        <KakaoIcon viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z" />
        </KakaoIcon>
      ),
      bgColor: '#FEE500'
    },
    {
      type: TOSSPAYMENTS,
      title: '토스페이먼츠',
      description: '신용카드, 체크카드',
      icon: (
        <TossImageIcon src="/toss.png" alt="tossIcon" />
      ),
      bgColor: 'white'
    }
  ];

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>결제수단 등록</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        {loading ? (
          <LoadingContainer>
            <LoadingSpinner />
            <h3 style={{ fontSize: '18px' }}>결제수단을 등록하는 중...</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
              결제사 페이지에서 인증을 완료해주세요
            </p>
          </LoadingContainer>
        ) : (
          <PaymentOptions>
            {paymentOptions.map((option) => (
              <PaymentOption
                key={option.type}
                onClick={() => handlePaymentMethodAdd(option.type)}
                disabled={loading}
              >
                <OptionInfo>
                  <OptionIcon $bgColor={option.bgColor}>
                    {option.icon}
                  </OptionIcon>
                  <OptionDetails>
                    <OptionTitle>{option.title}</OptionTitle>
                    <OptionDescription>{option.description}</OptionDescription>
                  </OptionDetails>
                </OptionInfo>
                <div style={{ fontSize: '20px', color: 'var(--text-secondary)' }}>
                  →
                </div>
              </PaymentOption>
            ))}
          </PaymentOptions>
        )}
      </ModalContent>
    </ModalOverlay>
  );
};

export default AddPaymentMethodModal;

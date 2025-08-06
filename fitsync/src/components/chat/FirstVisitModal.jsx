import React, { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 25000;
  animation: ${fadeIn} 0.3s ease;
  backdrop-filter: blur(6px);
`;

const ModalContent = styled.div`
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 32px 28px;
  width: 90%;
  max-width: 420px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4);
  border: 1px solid var(--border-light);
  animation: ${fadeIn} 0.3s ease;
  text-align: center;
  position: relative;
`;

const WelcomeIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 16px;
  animation: bounce 2s infinite;
  
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-8px);
    }
    60% {
      transform: translateY(-4px);
    }
  }
`;

const ModalTitle = styled.h2`
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 12px 0;
  line-height: 1.3;
`;

const ModalSubtitle = styled.p`
  font-size: 1.5rem;
  color: var(--text-secondary);
  margin: 0 0 24px 0;
  line-height: 1.5;
`;

const FeatureList = styled.div`
  background: var(--bg-tertiary);
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
  border: 1px solid var(--border-light);
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  margin: 12px 0;
  text-align: left;
  
  &:first-child {
    margin-top: 0;
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const FeatureIcon = styled.span`
  font-size: 1.8rem;
  margin-right: 12px;
  flex-shrink: 0;
  width: 24px;
  text-align: center;
`;

const FeatureText = styled.span`
  font-size: 1.4rem;
  color: var(--text-primary);
  font-weight: 500;
  line-height: 1.4;
`;

const CloseButton = styled.button`
  background: var(--primary-blue);
  color: white;
  border: none;
  padding: 14px 32px;
  border-radius: 12px;
  font-size: 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 8px;
  min-height: 48px;
  
  &:hover {
    background: var(--primary-blue-hover);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(74, 144, 226, 0.4);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(74, 144, 226, 0.3);
  }
  
  &:focus {
    outline: 2px solid var(--primary-blue-light);
    outline-offset: 2px;
  }
`;

const FirstVisitModal = ({ isOpen, onClose, trainerName, isTrainer }) => {
  // ESC 키로 모달 닫기
  useEffect(() => {
    if (!isOpen) return;

    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleEnterKey = (e) => {
      if (e.key === 'Enter') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    document.addEventListener('keydown', handleEnterKey);

    // 모달이 열릴 때 포커스 설정
    const modalContent = document.querySelector('[data-first-visit-modal]');
    if (modalContent) {
      modalContent.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.removeEventListener('keydown', handleEnterKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent 
        onClick={(e) => e.stopPropagation()}
        data-first-visit-modal
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="first-visit-title"
        aria-describedby="first-visit-description"
      >
        <WelcomeIcon>💬</WelcomeIcon>
        
        <ModalTitle id="first-visit-title">
          {isTrainer ? '새로운 회원과의 상담이 시작되었습니다!' : `${trainerName || '트레이너'}님과의 상담을 시작합니다!`}
        </ModalTitle>
        
        <ModalSubtitle id="first-visit-description">
          {isTrainer 
            ? '회원님과 원활한 소통을 통해 최적의 PT 서비스를 제공해보세요.'
            : '궁금한 점이나 PT 관련 문의사항을 자유롭게 대화해보세요.'
          }
        </ModalSubtitle>

        <FeatureList>
          <FeatureItem>
            <FeatureIcon>🖼️</FeatureIcon>
            <FeatureText>이미지 첨부 및 공유</FeatureText>
          </FeatureItem>
          <FeatureItem>
            <FeatureIcon>↩️</FeatureIcon>
            <FeatureText>메시지 답장 기능</FeatureText>
          </FeatureItem>
          <FeatureItem>
            <FeatureIcon>🔍</FeatureIcon>
            <FeatureText>채팅 내 메시지 검색</FeatureText>
          </FeatureItem>
          {isTrainer && (
            <FeatureItem>
              <FeatureIcon>🤝</FeatureIcon>
              <FeatureText>PT 매칭 요청 전송</FeatureText>
            </FeatureItem>
          )}
          {!isTrainer && (
            <FeatureItem>
              <FeatureIcon>✅</FeatureIcon>
              <FeatureText>PT 매칭 수락 및 관리</FeatureText>
            </FeatureItem>
          )}
        </FeatureList>

        <CloseButton 
          onClick={onClose}
          aria-label="환영 메시지 닫기"
        >
          채팅 시작하기
        </CloseButton>
      </ModalContent>
    </ModalOverlay>
  );
};

export default FirstVisitModal;
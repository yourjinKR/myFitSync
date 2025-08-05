import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { faqData, initFaqData, PaymentUtil } from '../../utils/PaymentUtil';
import { useSelector } from 'react-redux';
import useRequireLogin from '../../hooks/useRequireLogin';

const Container = styled.div`
  /* 컨테이너에서 이미 패딩과 배경이 설정되므로 여기서는 제거 */
`;

// 제거: Header, Title, Subtitle (컨테이너로 이동됨)

// 프리미엄 서비스 상품 카드
const PremiumServiceCard = styled.div`
  border-radius: 20px;
  padding: 32px 10px;
  margin-bottom: 24px;
  position: relative;
  text-align: center;

  @keyframes float {
    0%, 100% { transform: translate(-50%, -50%) rotate(0deg); }
    50% { transform: translate(-50%, -50%) rotate(180deg); }
  }
`;

const PremiumIcon = styled.div`
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin: 0 auto 16px;
  position: relative;
  z-index: 2;
  
  @media (min-width: 375px) {
    width: 90px;
    height: 90px;
    font-size: 36px;
  }
`;

const PremiumTitle = styled.h2`
  color: white;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 8px;
  position: relative;
  z-index: 2;
  
  @media (min-width: 375px) {
    font-size: 22px;
  }
  
  @media (min-width: 414px) {
    font-size: 24px;
  }
`;

const PremiumSubtitle = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
  margin-bottom: 24px;
  position: relative;
  z-index: 2;
  
  @media (min-width: 375px) {
    font-size: 14px;
  }
  
  @media (min-width: 414px) {
    font-size: 15px;
  }
`;

// 프로그레스 바 컴포넌트
const ProgressSection = styled.div`
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  position: relative;
  z-index: 2;
`;

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const ProgressLabel = styled.span`
  color: white;
  font-size: 13px;
  font-weight: 600;
  
  @media (min-width: 375px) {
    font-size: 14px;
  }
`;

const ProgressDays = styled.span`
  color: rgba(255, 255, 255, 0.9);
  font-size: 12px;
  
  @media (min-width: 375px) {
    font-size: 13px;
  }
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressBarFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #8BC34A);
  border-radius: 4px;
  transition: width 0.3s ease;
  width: ${props => Math.min(100, props.$percentage || 0)}%;
  overflow: hidden;
`;

// 결제 정보 섹션
const PaymentInfoSection = styled.div`
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  position: relative;
  z-index: 2;
`;

const PaymentInfoTitle = styled.div`
  color: white;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  
  @media (min-width: 375px) {
    font-size: 15px;
  }
`;

const PaymentInfoDetails = styled.div`
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
  line-height: 1.4;
  
  @media (min-width: 375px) {
    font-size: 14px;
  }
`;

// 액션 버튼 컨테이너
const ActionButtonsContainer = styled.div`
  display: flex;
  gap: 12px;
  position: relative;
  z-index: 2;
`;

const PremiumActionButton = styled.button`
  flex: 1;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  transition: all 0.2s ease;
  cursor: pointer;
  
  @media (min-width: 375px) {
    font-size: 14px;
    padding: 14px 18px;
  }
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  ${props => props.$variant === 'danger' && `
    border-color: rgba(244, 67, 54, 0.5);
    background: rgba(244, 67, 54, 0.2);
    
    &:hover {
      background: rgba(244, 67, 54, 0.3);
      border-color: rgba(244, 67, 54, 0.7);
    }
  `}
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: bold;
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

// 디데이 카운터 배지
const DaysLeftBadge = styled.div`
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
  
  @media (min-width: 375px) {
    font-size: 13px;
  }
  
  @media (min-width: 414px) {
    font-size: 14px;
  }
  
  /* 남은 일수에 따른 배경색과 글자색 변화 */
  ${props => {
    const days = props.$daysLeft;
    
    if (days === 0) {
      return `
        color: var(--warning);
        background: rgba(244, 67, 54, 0.1);
        border: 1px solid var(--warning);
        animation: pulse 1.5s ease-in-out infinite alternate;
      `;
    } else if (days <= 3) {
      return `
        color: var(--warning);
        background: rgba(244, 67, 54, 0.1);
      `;
    } else if (days <= 7) {
      return `
        color: #ff9800;
        background: rgba(255, 152, 0, 0.1);
      `;
    } else if (days <= 14) {
      return `
        color: #ffc107;
        background: rgba(255, 193, 7, 0.1);
      `;
    } else {
      return `
        color: var(--primary-blue);
        background: rgba(74, 144, 226, 0.1);
      `;
    }
  }}
  
  /* 만료된 경우 */
  ${props => props.$daysLeft < 0 && `
    color: var(--text-tertiary);
    background: var(--bg-tertiary);
  `}
  
  @keyframes pulse {
    from {
      opacity: 1;
    }
    to {
      opacity: 0.6;
    }
  }
  
  /* 만료된 경우 */
  ${props => props.$daysLeft < 0 && `
    color: var(--text-tertiary);
  `}
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
  grid-template-columns: ${props => 
    props.$columns === 3 ? '1fr 1fr 1fr' : 
    props.$columns === 2 ? '1fr 1fr' : '1fr'
  };
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
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
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
    props.$variant === 'secondary' ? 'var(--text-primary)' : 'white'
  };
  
  border: ${props => 
    props.$variant === 'secondary' ? '1px solid var(--border-light)' : 'none'
  };
  
  &:hover {
    ${props => props.$variant === 'secondary' ? `
      background: var(--border-light);
      color: var(--primary-blue);
      border-color: var(--primary-blue);
      transform: translateY(-1px);
    ` : `
      filter: brightness(1.1);
      transform: translateY(-1px);
    `}
  }
  
  &:active {
    transform: translateY(0);
  }
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

// 메뉴 버튼 컴포넌트들
const MenuButtonContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const MenuButton = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: var(--bg-tertiary);
  border: none;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s ease;
  position: relative;
  flex-shrink: 0;
  cursor: pointer;
  
  &:hover {
    background: var(--border-light);
    color: var(--text-primary);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  &::before {
    content: '⋯';
    line-height: 1;
    letter-spacing: 1px;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 32px;
  right: 0;
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  z-index: 100;
  min-width: 110px;
  overflow: hidden;
  display: ${props => props.$visible ? 'block' : 'none'};
`;

const MenuOption = styled.div`
  width: 100%;
  padding: 10px 12px;
  background: none;
  border: none;
  text-align: left;
  font-size: 13px !important;
  color: var(--text-primary);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  
  @media (min-width: 375px) {
    font-size: 14px !important;
  }
  
  &:hover {
    background: var(--bg-tertiary);
  }
  
  &:active {
    background: var(--border-light);
  }
  
  &.cancel {
    color: var(--warning);
  }
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

// 최근 결제 정보 카드
const RecentPaymentCard = styled.div`
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
  border: 1px solid var(--border-light);
`;

const RecentPaymentTitle = styled.h3`
  font-size: 16px;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 16px;
  
  @media (min-width: 375px) {
    font-size: 17px;
  }
  
  @media (min-width: 414px) {
    font-size: 18px;
  }
`;

// 간략한 최근 결제 정보 한 줄 표시
const RecentPaymentSummary = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--bg-tertiary);
  border-radius: 8px;
  margin: 12px 0;
  font-size: 13px;
  
  @media (min-width: 375px) {
    font-size: 14px;
  }
  
  @media (min-width: 414px) {
    font-size: 15px;
  }
`;

const PaymentSummaryText = styled.span`
  color: var(--text-secondary);
  flex: 1;
  margin-right: 12px;
`;

// 제거된 불필요한 스타일 컴포넌트들
// SmallActionButtons 및 SmallActionButton 제거됨

// 제거된 결제 상태 배지

const PaymentStatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 12px;
  
  @media (min-width: 375px) {
    font-size: 13px;
  }
  
  @media (min-width: 414px) {
    font-size: 14px;
  }
  
  ${props => {
    switch(props.$status) {
      case 'PAID':
        return `
          background: rgba(46, 139, 87, 0.2);
          color: var(--success);
          border: 1px solid var(--success);
        `;
      case 'READY':
        return `
          background: rgba(74, 144, 226, 0.2);
          color: var(--primary-blue);
          border: 1px solid var(--primary-blue);
        `;
      case 'FAILED':
        return `
          background: rgba(244, 67, 54, 0.2);
          color: var(--warning);
          border: 1px solid var(--warning);
        `;
      default:
        return `
          background: var(--bg-tertiary);
          color: var(--text-secondary);
          border: 1px solid var(--border-light);
        `;
    }
  }}
`;

const PaymentInfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
`;

const PaymentInfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const PaymentInfoLabel = styled.span`
  font-size: 11px;
  color: var(--text-tertiary);
  
  @media (min-width: 375px) {
    font-size: 12px;
  }
  
  @media (min-width: 414px) {
    font-size: 13px;
  }
`;

const PaymentInfoValue = styled.span`
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

const PaymentActionButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const PaymentActionButton = styled.button`
  flex: 1;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: bold;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  
  @media (min-width: 375px) {
    font-size: 14px;
  }
  
  @media (min-width: 414px) {
    font-size: 15px;
  }
  
  &:active {
    transform: translateY(1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  ${props => props.$variant === 'cancel' ? `
    background: rgba(244, 67, 54, 0.1);
    color: var(--warning);
    border: 1px solid var(--warning);
    
    &:hover:not(:disabled) {
      background: rgba(244, 67, 54, 0.2);
    }
  ` : `
    background: var(--bg-tertiary);
    color: var(--text-secondary);
    border: 1px solid var(--border-light);
    
    &:hover:not(:disabled) {
      background: var(--border-light);
      color: var(--text-primary);
    }
  `}
`;

// FAQ 섹션 스타일 컴포넌트들
const FAQSection = styled.div`
  margin-top: 40px;
  padding: 24px 0;
  border-top: 1px solid var(--border-light);
`;

const FAQTitle = styled.h2`
  font-size: 18px;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 20px;
  text-align: center;
  
  @media (min-width: 375px) {
    font-size: 19px;
  }
  
  @media (min-width: 414px) {
    font-size: 20px;
  }
`;

const FAQList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FAQItem = styled.div`
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-light);
  overflow: hidden;
  transition: all 0.2s ease;
`;

const FAQQuestion = styled.button`
  width: 100%;
  padding: 16px 20px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;

`;

const FAQQuestionText = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
  
  @media (min-width: 375px) {
    font-size: 15px;
  }
  
  @media (min-width: 414px) {
    font-size: 16px;
  }
`;

const FAQToggleIcon = styled.span`
  font-size: 16px;
  color: var(--text-secondary);
  transition: transform 0.2s ease;
  transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  
  @media (min-width: 375px) {
    font-size: 17px;
  }
  
  @media (min-width: 414px) {
    font-size: 18px;
  }
`;

const FAQAnswer = styled.div`
  max-height: ${props => props.$isOpen ? '1000px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease;
  background: var(--bg-tertiary);
`;

const FAQAnswerContent = styled.div`
  padding: 16px 20px;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
  
  @media (min-width: 375px) {
    font-size: 14px !important;
  }
  
  @media (min-width: 414px) {
    font-size: 15px !important;
  }
  
  p {
    margin-bottom: 5px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    @media (min-width: 375px) {
      font-size: 12px !important;
    }
    
    @media (min-width: 414px) {
      font-size: 14px !important;
    }
    
  }
`;

const SubscriptionMain = () => {
  useRequireLogin();

  const navigate = useNavigate();
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [recentOrder, setRecentOrder] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openFAQs, setOpenFAQs] = useState({}); // FAQ 토글 상태를 객체로 변경
  const user = useSelector(state => state.user);

  // FAQ 데이터
  const faqData = initFaqData;

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await PaymentUtil.checkSubscriptionStatus(user.user.member_idx);
      const recnetOrderResult = await PaymentUtil.getRecentHistory();
      
      // 유저 구독 정보
      if (result && result.data) {
        setSubscriptionData(result.data);
      }
      // 유저 최근 거래 정보
      if (recnetOrderResult && recnetOrderResult.data) {
        setRecentOrder(recnetOrderResult.data);
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

  // FAQ 토글 함수
  const toggleFAQ = (id) => {
    setOpenFAQs(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // 예약 결제 취소
  const handleCancelScheduledPayment = async () => {
    if (!recentOrder?.order_idx) return;

    const confirmed = window.confirm(
      '예약된 결제를 취소하시겠습니까?\n\n취소 후 다시 결제를 예약하려면 결제수단 관리에서 새로 등록해주세요.'
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      const response = await PaymentUtil.cancelScheduledPayment(recentOrder.order_idx);
      
      if (response.success) {
        // 구독 정보 새로고침
        await loadSubscriptionData();
      } else {
        alert(`취소 실패: ${response.message || '알 수 없는 오류가 발생했습니다.'}`);
      }
    } catch (error) {
      console.error('예약 취소 오류:', error);
      alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // 결제수단 변경
  const handleChangePaymentMethod = async () => {
    navigate("/subscription/methods", {state : {changeMode : true, recentOrder}});
  };

  // 구독 연장
  const handleSchedulingPayment = async () => {
    const response = await PaymentUtil.reschedule({recentOrder});

    if (response.success) {
    } else {
      alert("자동결제 등록을 실패했습니다 !");
    }
    await loadSubscriptionData();
  }

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

  return (
    <Container>
      {/* 구독자 프리미엄 서비스 카드 */}
      {isSubscriber && (
        <PremiumServiceCard>
          {/* 프리미엄 아이콘 */}
          {/* <PremiumIcon>💎</PremiumIcon> */}
          
          {/* 프리미엄 타이틀 */}
          <PremiumTitle>FitSync Premium</PremiumTitle>
          <PremiumSubtitle>FitSync와 운동을 스마트하고 즐겁게✨</PremiumSubtitle>
          
          {/* 구독 토큰 사용량 */}
          <ProgressSection>
            <ProgressHeader>
              <ProgressLabel>사용량</ProgressLabel>
                <ProgressDays>
                  {subscriptionData?.totalCost >= 0
                    ? `${Math.min(100, ((subscriptionData.totalCost / 5) * 100)).toFixed(2)}% 사용`
                    : '사용량 계산 중'}
                </ProgressDays>
            </ProgressHeader>

            <ProgressBarContainer>
              <ProgressBarFill 
                $percentage={
                  subscriptionData.totalCost > 0 
                    ? Math.min(100, Math.min(100, (subscriptionData.totalCost / 5) * 100)) 
                    : 0
                }
              />
            </ProgressBarContainer>
          </ProgressSection>
          
          {/* 결제 정보 */}
          <PaymentInfoSection>
            <PaymentInfoTitle>
              
            </PaymentInfoTitle>
            <PaymentInfoDetails>
              {formatDate(recentOrder.order_status === 'READY' ? 
                recentOrder.schedule_date : 
                subscriptionData.lastPaymentDate
              )} {' '}
              {recentOrder.order_price?.toLocaleString() || '0'}원 {' '}
              {recentOrder.order_status === 'READY' ? ' 결제 예정 🗓️ ' : ' 결제 완료! ✅ '}
            </PaymentInfoDetails>
          </PaymentInfoSection>
          
          {/* 액션 버튼들 - 예약 상태일 때만 표시 */}
          {recentOrder.order_status === 'READY' ? 
          (<ActionButtonsContainer>
              <PremiumActionButton onClick={handleChangePaymentMethod}>
                결제수단 변경
              </PremiumActionButton>
              <PremiumActionButton 
                $variant="danger" 
                onClick={handleCancelScheduledPayment}
              >
                구독 해지
              </PremiumActionButton>
            </ActionButtonsContainer>
          ) : 
          (<ActionButtonsContainer>
            <PremiumActionButton onClick={handleSchedulingPayment}>
              구독 연장
            </PremiumActionButton>
          </ActionButtonsContainer>)}
        </PremiumServiceCard>
      )}

      {/* 비구독자만 보이는 플랜 비교 섹션 */}
      {!isSubscriber && (
        <>
          {/* 비구독자용 최근 결제 정보 - 간소화된 표시 */}
          {recentOrder && Object.keys(recentOrder).length > 0 && (
            <RecentPaymentCard>
              <RecentPaymentSummary>
                <div style={{ flex: 1 }}>
                  <PaymentSummaryText style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {recentOrder.order_status === 'READY' ? '예약된 결제' : '이전 결제'}
                  </PaymentSummaryText>
                  <PaymentSummaryText>
                    {recentOrder.order_price?.toLocaleString() || '0'}원 · {' '}
                    {recentOrder.order_provider === 'KAKAOPAY' ? '카카오페이' :
                     recentOrder.order_provider === 'TOSSPAYMENTS' ? '토스페이먼츠' :
                     recentOrder.order_provider || '알 수 없음'} · {' '}
                    {formatDate(recentOrder.order_status === 'READY' ? 
                      recentOrder.schedule_date : 
                      (recentOrder.order_paydate || recentOrder.order_regdate)
                    )}
                    {recentOrder.order_status === 'READY' && (
                      <span style={{ color: 'var(--primary-blue)', fontWeight: 'bold', marginLeft: '8px' }}>
                        (결제 대기 중)
                      </span>
                    )}
                  </PaymentSummaryText>
                </div>

                {/* 예약 상태인 경우에만 액션 버튼들 표시 */}
                {recentOrder.order_status === 'READY' && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button 
                      onClick={handleChangePaymentMethod}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: 'var(--primary-blue)',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      결제수단 변경
                    </button>
                    <button 
                      onClick={handleCancelScheduledPayment}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: 'rgba(244, 67, 54, 0.1)',
                        color: 'var(--warning)',
                        border: '1px solid var(--warning)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      취소
                    </button>
                  </div>
                )}
              </RecentPaymentSummary>
            </RecentPaymentCard>
          )}

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

      {/* FAQ 섹션 - 구독 여부와 상관없이 표시 */}
      <FAQSection>
        <FAQTitle>FAQ</FAQTitle>
        <FAQList>
          {faqData.map((faq) => (
            <FAQItem key={faq.id}>
              <FAQQuestion onClick={() => toggleFAQ(faq.id)}>
                <FAQQuestionText>
                  {faq.question}
                </FAQQuestionText>
                <FAQToggleIcon $isOpen={openFAQs[faq.id] || false}>
                  ▼
                </FAQToggleIcon>
              </FAQQuestion>
              <FAQAnswer $isOpen={openFAQs[faq.id] || false}>
                <FAQAnswerContent>
                  {faq.answer}
                </FAQAnswerContent>
              </FAQAnswer>
            </FAQItem>
          ))}
        </FAQList>
      </FAQSection>
    </Container>
  );
};

export default SubscriptionMain;

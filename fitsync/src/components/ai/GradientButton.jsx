import React from 'react';
import styled from 'styled-components';

const BaseButton = styled.button`
  font-size: ${props => props.size === 'small' ? '1.4rem' : 
              props.size === 'large' ? '1.8rem' : '1.6rem'};
  font-weight: 600;
  padding: ${props => props.circular ? 
    (props.size === 'small' ? '1.2rem' : 
     props.size === 'large' ? '2rem' : '1.6rem') :
    (props.size === 'small' ? '1.2rem 1.6rem' : 
     props.size === 'large' ? '2rem 2.4rem' : '1.6rem 2rem')};
  border-radius: ${props => props.circular ? '50%' : '1.2rem'};
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  position: relative;
  overflow: hidden;
  min-width: ${props => props.fullWidth ? '100%' : 'auto'};
  width: ${props => props.circular ? 
    (props.size === 'small' ? '4.8rem' : 
     props.size === 'large' ? '6.4rem' : '5.6rem') : 'auto'};
  height: ${props => props.circular ? 
    (props.size === 'small' ? '4.8rem' : 
     props.size === 'large' ? '6.4rem' : '5.6rem') : 'auto'};
  min-width: ${props => props.circular ? '4.4rem' : 'auto'};
  min-height: ${props => props.circular ? '4.4rem' : 'auto'};
  flex: ${props => props.flex ? 1 : 'none'};
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }

  @media (max-width: 480px) {
    font-size: ${props => props.size === 'small' ? '1.5rem' : 
                        props.size === 'large' ? '2rem' : '1.8rem'};
    padding: ${props => props.circular ? 
      (props.size === 'small' ? '1.5rem' : 
       props.size === 'large' ? '2.2rem' : '1.8rem') :
      (props.size === 'small' ? '1rem 1.2rem' : 
       props.size === 'large' ? '1.6rem 2rem' : '1.2rem 1.6rem')};
    width: ${props => props.circular ? 
      (props.size === 'small' ? '7rem' : 
       props.size === 'large' ? '8.5rem' : '7.5rem') : 'auto'};
    height: ${props => props.circular ? 
      (props.size === 'small' ? '7rem' : 
       props.size === 'large' ? '8.5rem' : '7.5rem') : 'auto'};
    min-width: ${props => props.circular ? '6.5rem' : 'auto'};
    min-height: ${props => props.circular ? '6.5rem' : 'auto'};
  }
`;

const StyledGradientButton = styled(BaseButton)`
  background: linear-gradient(135deg, #7D93FF, #4A70F0, #6B7EFF, #3A5FE0);
  background-size: 300% 300%;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  
  /* 기본 일렁이는 애니메이션 */
  animation: ${props => props.animate !== false ? 'gradientWave 3s ease-in-out infinite' : 'none'};
  
  /* 반짝이는 오버레이 효과 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    animation: ${props => props.animate !== false ? 'shimmer 2.5s infinite' : 'none'};
    z-index: 1;
  }
  
  /* 신비로운 빛 효과 */
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 120%;
    height: 120%;
    background: radial-gradient(
      circle,
      rgba(125, 147, 255, 0.3) 0%,
      transparent 70%
    );
    transform: translate(-50%, -50%);
    animation: ${props => props.animate !== false ? 'mysticGlow 4s ease-in-out infinite' : 'none'};
    z-index: 0;
  }
  
  /* 텍스트와 아이콘이 위에 오도록 */
  & > * {
    position: relative;
    z-index: 2;
  }
  
  /* 아이콘 크기 자동 조절 */
  & svg, & .icon {
    font-size: ${props => {
      if (props.circular) {
        switch (props.size) {
          case 'small': return '1.6rem';
          case 'large': return '2.4rem';
          default: return '2rem';
        }
      }
      return 'inherit';
    }};
    
    @media (max-width: 480px) {
      font-size: ${props => {
        if (props.circular) {
          switch (props.size) {
            case 'small': return '2rem';
            case 'large': return '3rem';
            default: return '2.5rem';
          }
        }
        return 'inherit';
      }} !important;
    }
  }
  
  @keyframes gradientWave {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  
  @keyframes shimmer {
    0% { left: -100%; }
    100% { left: 100%; }
  }
  
  @keyframes mysticGlow {
    0% {
      opacity: 0.3;
      transform: translate(-50%, -50%) scale(1);
    }
    50% {
      opacity: 0.6;
      transform: translate(-50%, -50%) scale(1.1);
    }
    100% {
      opacity: 0.3;
      transform: translate(-50%, -50%) scale(1);
    }
  }
`;

/**
 * GradientButton 컴포넌트
 * 
 * AI 관련 서비스에서 사용되는 그라데이션 효과가 있는 버튼 컴포넌트입니다.
 * 신비로운 애니메이션 효과(일렁이는 그라데이션, 반짝임, 빛 효과)를 제공합니다.
 * 
 * 사용법:
 * 
 * 1. 기본 사용법:
 * <GradientButton onClick={handleClick}>AI 서비스 시작</GradientButton>
 * 
 * 2. 사이즈 조절:
 * <GradientButton size="small">작은 버튼</GradientButton>
 * <GradientButton size="medium">보통 버튼</GradientButton>  // 기본값
 * <GradientButton size="large">큰 버튼</GradientButton>
 * 
 * 3. 동그란 버튼 (아이콘 버튼용):
 * <GradientButton circular size="medium">
 *   <BsStars />
 * </GradientButton>
 * 
 * 4. 전체 폭 사용:
 * <GradientButton fullWidth>전체 폭 버튼</GradientButton>
 * 
 * 5. Flex 레이아웃에서 균등 분할:
 * <div style={{display: 'flex', gap: '1rem'}}>
 *   <GradientButton flex>버튼 1</GradientButton>
 *   <GradientButton flex>버튼 2</GradientButton>
 * </div>
 * 
 * 6. 애니메이션 비활성화:
 * <GradientButton animate={false}>정적 버튼</GradientButton>
 * 
 * 7. 비활성화 상태:
 * <GradientButton disabled>비활성화된 버튼</GradientButton>
 * 
 * Props:
 * - children: 버튼 내용 (텍스트, 아이콘 등)
 * - onClick: 클릭 이벤트 핸들러
 * - disabled: 비활성화 여부 (기본값: false)
 * - size: 버튼 크기 ('small' | 'medium' | 'large', 기본값: 'medium')
 * - circular: 동그란 버튼 여부 (기본값: false)
 * - fullWidth: 전체 폭 사용 여부 (기본값: false)
 * - flex: flex: 1 적용 여부 (기본값: false)
 * - animate: 애니메이션 활성화 여부 (기본값: true)
 * - className: 추가 CSS 클래스
 * - type: 버튼 타입 (기본값: 'button')
 * - ...props: 기타 button 엘리먼트 속성들
 */
const GradientButton = ({
  children,
  onClick,
  disabled = false,
  size = 'medium', // 'small', 'medium', 'large'
  circular = false,
  fullWidth = false,
  flex = false,
  animate = true,
  className,
  type = 'button',
  ...props
}) => {
  return (
    <StyledGradientButton
      onClick={onClick}
      disabled={disabled}
      size={size}
      circular={circular}
      fullWidth={fullWidth}
      flex={flex}
      animate={animate}
      className={className}
      type={type}
      {...props}
    >
      {children}
    </StyledGradientButton>
  );
};

export default GradientButton;
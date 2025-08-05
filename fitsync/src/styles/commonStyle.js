import styled from "styled-components";

// checkbox 스타일링
export const ChecklabelText = styled.label`
  position: relative;
  display: inline-block;
  width: 100%;

  span{
    text-indent: -9999px; 
    display: block;
    width: 0; 
    height: 0; 
    overflow: hidden;
  }
  p {
    padding-left: 30px;
    font-size: 1.4rem;
  }
  
  &:before {
    content: "";
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 24px;
    height: 24px;
    border: 2px solid var(--border-light);
    border-radius: 4px;
    background-color: transparent;
  }
`;


export const Checklabel = styled.label`
  position: relative;
  display: inline-block;
  width: 24px;
  height: 24px;
  border: 2px solid var(--border-light);
  border-radius: 4px;

  span{
    text-indent: -9999px; 
    display: block;
    width: 0; 
    height: 0; 
    overflow: hidden;
  }
`;

export const CheckInput = styled.input`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + ${Checklabel} {
    background-color: var(--check-green);
    border-color: var(--check-green);
  }

  &:checked + ${Checklabel}:before {
    content: "";
    position: absolute;
    left: 6px;
    top: 2px;
    width: 6px;
    height: 12px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }

  &:checked + ${ChecklabelText}:before {
    background-color: var(--primary-blue);
  }

  &:checked + ${ChecklabelText}:after {
    content: "";
    position: absolute;
    top: 48%;
    left: 10px;
    width: 6px;
    height: 12px;
    
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: translateY(-50%) rotate(45deg);
  }
`;

// 프리미엄 버튼 스타일들
export const PrimaryButton = styled.button`
  padding: 10px 20px;
  font-size: 1.3rem;
  font-weight: 500;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 70px;
  background: linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-blue-light) 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(74, 144, 226, 0.2);
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 1px 4px rgba(74, 144, 226, 0.2);
  }
`;

export const SecondaryButton = styled.button`
  padding: 10px 20px;
  font-size: 1.3rem;
  font-weight: 500;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 70px;
  background: rgba(60, 60, 60, 0.4);
  color: var(--text-secondary);
  
  &:hover {
    background: rgba(70, 70, 70, 0.6);
    color: var(--text-primary);
    border-color: rgba(255, 255, 255, 0.3);
  }
  
  &:active {
    background: rgba(50, 50, 50, 0.8);
  }
`;

export const DangerButton = styled.button`
  padding: 12px 24px;
  font-size: 1.4rem;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  min-width: 80px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 
    0 4px 16px rgba(239, 68, 68, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 8px 24px rgba(239, 68, 68, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  &:hover::before {
    left: 100%;
  }
`;

export const IconButton = styled.button`
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(60, 60, 60, 0.5);
  color: var(--text-secondary);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  
  &:hover {
    background: rgba(70, 70, 70, 0.7);
    color: var(--text-primary);
    border-color: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
`;
import React, { useEffect } from 'react';
import styled from 'styled-components';

const MessageContainer = styled.div`
  padding: 1.2rem 1.6rem;
  border-radius: 6px;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.4rem;
  font-weight: 500;
  border: 1px solid;
  
  ${props => props.type === 'success' && `
    background: rgba(46, 139, 87, 0.1);
    color: var(--success);
    border-color: var(--success);
  `}
  
  ${props => props.type === 'error' && `
    background: rgba(244, 67, 54, 0.1);
    color: var(--warning);
    border-color: var(--warning);
  `}
  
  ${props => props.type === 'info' && `
    background: rgba(74, 144, 226, 0.1);
    color: var(--primary-blue);
    border-color: var(--primary-blue);
  `}
  
  ${props => props.type === 'warning' && `
    background: rgba(255, 193, 7, 0.1);
    color: #856404;
    border-color: #856404;
  `}
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  padding: 0;
  margin-left: 1rem;
  color: inherit;
  opacity: 0.7;
  transition: opacity 0.2s ease;
  
  &:hover {
    opacity: 1;
  }
`;

const MessageDisplay = ({ message, onClose, autoClose = true, duration = 5000 }) => {
  useEffect(() => {
    if (autoClose && message.content && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [message.content, autoClose, duration, onClose]);

  if (!message.content) {
    return null;
  }

  return (
    <MessageContainer type={message.type}>
      <span>{message.content}</span>
      {onClose && (
        <CloseButton onClick={onClose} title="닫기">
          ×
        </CloseButton>
      )}
    </MessageContainer>
  );
};

export default MessageDisplay;

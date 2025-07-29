import React, { useState } from 'react';
import styled from 'styled-components';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20000;
  animation: fadeIn 0.2s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalContent = styled.div`
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalTitle = styled.h3`
  font-size: 2rem;
  color: var(--text-primary);
  margin-bottom: 20px;
  text-align: center;
  font-weight: 600;
`;

const InputGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 1.4rem;
  color: var(--text-primary);
  margin-bottom: 8px;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 1.4rem;
  outline: none;
  box-sizing: border-box;
  
  &:focus {
    border-color: var(--primary-blue);
  }
  
  &::placeholder {
    color: var(--text-tertiary);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
`;

const Button = styled.button`
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 1.4rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  
  &.cancel {
    background: var(--bg-tertiary);
    color: var(--text-primary);
    border: 1px solid var(--border-light);
    
    &:hover {
      background: var(--bg-primary);
    }
  }
  
  &.submit {
    background: var(--primary-blue);
    color: white;
    
    &:hover {
      background: var(--primary-blue-hover);
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
`;

const MatchingModal = ({ isOpen, onClose, onSubmit, isLoading }) => {
    const [matchingTotal, setMatchingTotal] = useState('');

    const handleSubmit = () => {
        const total = parseInt(matchingTotal);
        if (total && total > 0) {
            onSubmit(total);
            setMatchingTotal('');
        }
    };

    const handleClose = () => {
        setMatchingTotal('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <ModalOverlay onClick={handleClose}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
                <ModalTitle>PT 매칭 요청</ModalTitle>
                
                <InputGroup>
                    <Label htmlFor="matching-total">PT 진행 횟수</Label>
                    <Input
                        id="matching-total"
                        type="number"
                        min="1"
                        max="200"
                        value={matchingTotal}
                        onChange={(e) => setMatchingTotal(e.target.value)}
                        placeholder="PT 횟수를 입력하세요.(최대200일)"
                        autoFocus
                    />
                </InputGroup>

                <ButtonGroup>
                    <Button 
                        className="cancel" 
                        onClick={handleClose}
                        disabled={isLoading}
                    >
                        취소
                    </Button>
                    <Button 
                        className="submit" 
                        onClick={handleSubmit}
                        disabled={!matchingTotal || parseInt(matchingTotal) <= 0 || isLoading}
                    >
                        {isLoading ? '전송 중...' : '보내기'}
                    </Button>
                </ButtonGroup>
            </ModalContent>
        </ModalOverlay>
    );
};

export default MatchingModal;
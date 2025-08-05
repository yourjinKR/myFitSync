import React, { useState } from 'react';
import styled from 'styled-components';

const FeedbackModal = ({ onClose, onSubmit }) => {
    const [selectedReason, setSelectedReason] = useState('');
    const [customReason, setCustomReason] = useState('');

    const reasons = [
        { 
            value: 'difficulty', 
            label: '운동 난이도가 적절하지 않음',
            description: '너무 쉽거나 어려운 운동이 포함되어 있어요'
        },
        { 
            value: 'exercise_type', 
            label: '운동 종류가 마음에 들지 않음',
            description: '선호하지 않는 운동이나 기구가 포함되어 있어요'
        },
        { 
            value: 'time', 
            label: '운동 시간이 맞지 않음',
            description: '예상보다 시간이 오래 걸리거나 짧아요'
        },
        { 
            value: 'equipment', 
            label: '장비가 없어서 실행하기 어려움',
            description: '집에 없는 장비나 헬스장 전용 기구가 필요해요'
        },
        { 
            value: 'injury', 
            label: '부상 위험이 있는 운동이 포함됨',
            description: '제 몸 상태에 맞지 않는 위험한 동작이 있어요'
        },
        { 
            value: 'structure', 
            label: '루틴 구성이 마음에 들지 않음',
            description: '운동 순서나 분할이 제 스타일과 맞지 않아요'
        },
        {
            value: 'timeout',
            label: '응답시간이 너무 오래 걸림',
            description: 'AI가 응답하는데 너무 오랜 시간이 걸려요'
        },
        { 
            value: 'other', 
            label: '기타',
            description: '위에 해당하지 않는 다른 이유가 있어요'
        },
        
    ];

    const handleSubmit = () => {
        if (!selectedReason) {
            alert('개선이 필요한 이유를 선택해주세요.');
            return;
        }

        const reason = selectedReason === 'other' ? customReason.trim() : selectedReason;
        
        if (selectedReason === 'other' && !reason) {
            alert('기타 이유를 입력해주세요.');
            return;
        }

        onSubmit('DISLIKE', reason);
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <ModalOverlay onClick={handleOverlayClick}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                    <ModalTitle>👎 개선 필요 - 피드백</ModalTitle>
                    <CloseButton onClick={onClose}>×</CloseButton>
                </ModalHeader>

                <FeedbackDescription>
                    어떤 부분이 개선되면 좋을까요? 
                    여러분의 소중한 의견은 더 나은 AI 루틴 제공에 큰 도움이 됩니다.
                </FeedbackDescription>

                <FeedbackOptions>
                    {reasons.map((reason) => (
                        <OptionLabel key={reason.value}>
                            <OptionInput
                                type="radio"
                                name="reason"
                                value={reason.value}
                                checked={selectedReason === reason.value}
                                onChange={(e) => setSelectedReason(e.target.value)}
                            />
                            <OptionText>
                                <strong>{reason.label}</strong>
                                <br />
                                <span style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
                                    {reason.description}
                                </span>
                            </OptionText>
                        </OptionLabel>
                    ))}
                </FeedbackOptions>

                {selectedReason === 'other' && (
                    <TextArea
                        placeholder="구체적인 개선 사항을 알려주세요...&#10;&#10;예시:&#10;- 상체 운동이 너무 많아요&#10;- 스쿼트 대신 런지를 추천해주세요&#10;- 운동 강도를 높여주세요"
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                    />
                )}

                <ModalActions>
                    <CancelButton onClick={onClose}>
                        취소
                    </CancelButton>
                    <SubmitButton 
                        onClick={handleSubmit}
                        disabled={!selectedReason || (selectedReason === 'other' && !customReason.trim())}
                    >
                        피드백 제출
                    </SubmitButton>
                </ModalActions>
            </ModalContent>
        </ModalOverlay>
    );
};

const ModalOverlay = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
`;

const ModalContent = styled.div`
    background: var(--bg-secondary);
    border-radius: 12px;
    max-width: 500px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    padding: 2rem;
    border: 1px solid var(--border-light);
    position: relative;
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border-light);
`;

const ModalTitle = styled.h3`
    color: var(--text-primary);
    font-size: 2rem;
    font-weight: 600;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    @media (max-width: 768px) {
        font-size: 2.5rem;
    }
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    font-size: 2rem;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    transition: all 0.2s ease;
    
    &:hover {
        color: var(--text-primary);
        background: var(--bg-tertiary);
    }
`;

const FeedbackDescription = styled.p`
    color: var(--text-secondary);
    margin-bottom: 1.5rem;
    font-size: 1rem;
    line-height: 1.5;
`;

const FeedbackOptions = styled.div`
    margin-bottom: 1.5rem;
`;

const OptionLabel = styled.label`
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    margin-bottom: 1rem;
    color: var(--text-primary);
    cursor: pointer;
    padding: 0.75rem;
    border-radius: 8px;
    transition: all 0.2s ease;
    
    &:hover {
        background: var(--bg-tertiary);
    }
    
    &:last-child {
        margin-bottom: 0;
    }
`;

const OptionInput = styled.input`
    margin: 0;
    padding: 0;
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    accent-color: var(--primary-blue);
    cursor: pointer;
`;

const OptionText = styled.span`
    font-size: 1rem;
    line-height: 1.4;
    flex: 1;
`;

const TextArea = styled.textarea`
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--border-light);
    border-radius: 8px;
    background: var(--bg-tertiary);
    color: var(--text-primary);
    resize: vertical;
    min-height: 100px;
    margin-bottom: 1rem;
    font-family: inherit;
    font-size: 1rem;
    line-height: 1.5;
    transition: all 0.2s ease;
    
    &:focus {
        outline: none;
        border-color: var(--primary-blue);
        box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
    }
    
    &::placeholder {
        color: var(--text-tertiary);
    }
`;

const ModalActions = styled.div`
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    
    @media (max-width: 768px) {
        flex-direction: column-reverse;
    }
`;

const ActionButton = styled.button`
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: 500;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 100px;
    
    @media (max-width: 768px) {
        width: 100%;
    }
`;

const CancelButton = styled(ActionButton)`
    background: var(--bg-tertiary);
    color: var(--text-secondary);
    border: 1px solid var(--border-light);
    
    &:hover {
        background: var(--bg-primary);
        color: var(--text-primary);
        border-color: var(--border-medium);
    }
`;

const SubmitButton = styled(ActionButton)`
    background: var(--primary-blue);
    color: var(--text-primary);
    
    &:hover {
        background: var(--primary-blue-hover);
    }
    
    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

export default FeedbackModal;

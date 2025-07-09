import React from 'react';
import styled from 'styled-components';

const ResultContainer = styled.div`
    background: var(--bg-secondary);
    padding: 2rem;
    border-radius: 12px;
    border: 1px solid var(--border-light);
`;

const ResultHeader = styled.div`
    text-align: center;
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--border-light);
`;

const ResultTitle = styled.h2`
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
    
    @media (max-width: 768px) {
        font-size: 1.5rem;
    }
`;

const ResultMeta = styled.div`
    font-size: 1rem;
    color: var(--text-secondary);
    
    @media (max-width: 768px) {
        font-size: 0.9rem;
    }
`;

const RoutineContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-bottom: 2rem;
`;

const RoutineCard = styled.div`
    background: var(--bg-tertiary);
    border: 1px solid var(--border-light);
    border-radius: 12px;
    padding: 1.5rem;
    transition: all 0.2s ease;
    
    &:hover {
        border-color: var(--primary-blue-light);
        box-shadow: 0 4px 12px rgba(74, 144, 226, 0.1);
    }
`;

const RoutineHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border-light);
    
    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
    }
`;

const RoutineTitle = styled.h3`
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--primary-blue);
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    @media (max-width: 768px) {
        font-size: 1.1rem;
    }
`;

const RoutineBadge = styled.span`
    background: var(--primary-blue-light);
    color: var(--text-primary);
    padding: 0.375rem 0.75rem;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 500;
    white-space: nowrap;
`;

const ExerciseGrid = styled.div`
    display: grid;
    gap: 1rem;
`;

const ExerciseItem = styled.div`
    background: var(--bg-primary);
    border: 1px solid var(--border-medium);
    border-radius: 8px;
    padding: 1rem;
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    transition: all 0.2s ease;
    
    &:hover {
        border-color: var(--primary-blue);
        background: var(--bg-secondary);
    }
    
    @media (max-width: 768px) {
        flex-direction: column;
        gap: 0.75rem;
    }
`;

const ExerciseIcon = styled.div`
    font-size: 1.5rem;
    flex-shrink: 0;
    
    @media (max-width: 768px) {
        font-size: 1.25rem;
    }
`;

const ExerciseContent = styled.div`
    flex: 1;
    min-width: 0;
`;

const ExerciseName = styled.div`
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
    
    @media (max-width: 768px) {
        font-size: 1rem;
    }
`;

const ExerciseDetails = styled.div`
    font-size: 0.95rem;
    color: var(--text-secondary);
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    
    @media (max-width: 768px) {
        font-size: 0.9rem;
        gap: 0.5rem;
    }
`;

const DetailChip = styled.span`
    background: var(--bg-tertiary);
    color: var(--text-primary);
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.85rem;
    font-weight: 500;
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin: 2rem 0;
    flex-wrap: wrap;
    
    @media (max-width: 768px) {
        flex-direction: column;
        gap: 0.75rem;
    }
`;

const ActionButton = styled.button`
    padding: 1rem 2rem;
    font-size: 1.1rem;
    font-weight: 600;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 160px;
    justify-content: center;
    
    @media (max-width: 768px) {
        width: 100%;
        padding: 0.875rem 1.5rem;
    }
`;

const SaveButton = styled(ActionButton)`
    background: var(--check-green);
    color: var(--text-primary);
    
    &:hover {
        background: var(--success);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(46, 139, 87, 0.3);
    }
`;

const RetryButton = styled(ActionButton)`
    background: var(--warning);
    color: var(--text-primary);
    
    &:hover {
        opacity: 0.9;
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(244, 67, 54, 0.3);
    }
`;

const FeedbackSection = styled.div`
    text-align: center;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border-light);
`;

const FeedbackTitle = styled.h4`
    font-size: 1.1rem;
    color: var(--text-primary);
    margin-bottom: 1rem;
`;

const FeedbackButtons = styled.div`
    display: flex;
    gap: 1rem;
    justify-content: center;
    
    @media (max-width: 768px) {
        flex-direction: column;
        gap: 0.5rem;
    }
`;

const FeedbackButton = styled.button`
    background: ${props => props.positive ? 'var(--check-green)' : 'var(--warning)'};
    color: var(--text-primary);
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    &:hover {
        opacity: 0.9;
        transform: translateY(-1px);
    }
    
    @media (max-width: 768px) {
        justify-content: center;
        width: 100%;
    }
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 3rem 2rem;
    color: var(--text-secondary);
    
    h3 {
        color: var(--text-primary);
        margin-bottom: 1rem;
        font-size: 1.5rem;
    }
    
    p {
        font-size: 1rem;
        line-height: 1.5;
    }
`;

const StepResult = ({ result, onSave, onFeedback, onRetry }) => {
    const handlePositiveFeedback = () => {
        onFeedback('positive');
    };

    const handleNegativeFeedback = () => {
        onFeedback('negative');
    };

    if (!result || !result.content || result.content.length === 0) {
        return (
            <ResultContainer>
                <EmptyState>
                    <h3>⚠️ 결과를 불러올 수 없습니다</h3>
                    <p>AI 루틴 생성 중 문제가 발생했습니다.<br />다시 시도해주세요.</p>
                    <ActionButtons>
                        <RetryButton onClick={onRetry}>
                            🔄 다시 생성하기
                        </RetryButton>
                    </ActionButtons>
                </EmptyState>
            </ResultContainer>
        );
    }

    return (
        <ResultContainer>
            <ResultHeader>
                <ResultTitle>🎉 AI 루틴 생성 완료!</ResultTitle>
                <ResultMeta>
                    생성된 루틴: {result.content.length}개 | 
                    응답 시간: {result.responseTime || 0}초
                    {result.logIdx && ` | 로그 ID: ${result.logIdx}`}
                </ResultMeta>
            </ResultHeader>
            
            <RoutineContainer>
                {result.content.map((routine, idx) => (
                    <RoutineCard key={idx}>
                        <RoutineHeader>
                            <RoutineTitle>
                                🏋️ {routine.routine_name}
                            </RoutineTitle>
                            <RoutineBadge>
                                {routine.exercises?.length || 0}개 운동
                            </RoutineBadge>
                        </RoutineHeader>
                        
                        <ExerciseGrid>
                            {routine.exercises?.map((exercise, i) => (
                                <ExerciseItem key={i}>
                                    <ExerciseIcon>💪</ExerciseIcon>
                                    <ExerciseContent>
                                        <ExerciseName>
                                            {exercise.pt_name}
                                        </ExerciseName>
                                        <ExerciseDetails>
                                            <DetailChip>{exercise.set_num || 0}세트</DetailChip>
                                            <DetailChip>{exercise.set_count || 0}회</DetailChip>
                                            {exercise.set_volume && exercise.set_volume > 0 && (
                                                <DetailChip>{exercise.set_volume}kg</DetailChip>
                                            )}
                                            {exercise.pt_time && (
                                                <DetailChip>{exercise.pt_time}</DetailChip>
                                            )}
                                        </ExerciseDetails>
                                    </ExerciseContent>
                                </ExerciseItem>
                            )) || (
                                <EmptyState>
                                    <p>운동이 포함되지 않았습니다.</p>
                                </EmptyState>
                            )}
                        </ExerciseGrid>
                    </RoutineCard>
                ))}
            </RoutineContainer>

            <ActionButtons>
                <SaveButton onClick={onSave}>
                    💾 루틴 저장하기
                </SaveButton>
                <RetryButton onClick={onRetry}>
                    🔄 다시 생성하기
                </RetryButton>
            </ActionButtons>

            <FeedbackSection>
                <FeedbackTitle>💭 이 루틴이 어떠신가요?</FeedbackTitle>
                <FeedbackButtons>
                    <FeedbackButton positive onClick={handlePositiveFeedback}>
                        👍 좋아요
                    </FeedbackButton>
                    <FeedbackButton onClick={handleNegativeFeedback}>
                        👎 개선 필요
                    </FeedbackButton>
                </FeedbackButtons>
            </FeedbackSection>
        </ResultContainer>
    );
};

export default StepResult;
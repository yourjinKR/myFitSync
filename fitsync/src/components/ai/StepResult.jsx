import React, { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';

// 애니메이션 정의
const slideIn = keyframes`
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
`;

const pulse = keyframes`
    0% { transform: scale(1); }
    50% { transform: scale(1.02); }
    100% { transform: scale(1); }
`;

const likeAnimation = keyframes`
    0% { transform: scale(1); }
    25% { transform: scale(1.1) rotate(-5deg); }
    50% { transform: scale(1.2) rotate(5deg); }
    75% { transform: scale(1.1) rotate(-2deg); }
    100% { transform: scale(1); }
`;

// UserApiLogContainer 스타일을 참고한 메인 컨테이너
const Container = styled.div`
    max-width: 800px;
    margin: 0 auto;
    background: var(--bg-primary);
    min-height: 100vh;
    
    @media (max-width: 768px) {
        max-width: 100%;
    }
`;

// 헤더 섹션
const Header = styled.div`
    margin-bottom: 30px;
    
    @media (max-width: 768px) {
        margin-bottom: 20px;
    }
`;

const HeaderContent = styled.div`
    text-align: center;
    animation: ${slideIn} 0.6s ease-out;
`;

const Title = styled.h1`
    font-size: 3rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    
    @media (max-width: 768px) {
        font-size: 3rem;
    }
`;

const Description = styled.p`
    font-size: 1.6rem;
    color: var(--text-secondary);
    line-height: 1.6;
    
    @media (max-width: 768px) {
        font-size: 1.4rem;
    }
`;

// 결과 통계 섹션 (UserApiLogContainer의 UsageSection 스타일 참고)
const StatsSection = styled.div`
    background: var(--bg-secondary);
    border: 1px solid var(--border-light);
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 20px;
    transition: all 0.2s ease;
    
    &:hover {
        border-color: var(--primary-blue);
    }
    
    @media (max-width: 768px) {
        margin-bottom: 15px;
        padding: 14px;
    }
`;

const StatsHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    
    @media (max-width: 768px) {
        margin-bottom: 10px;
    }
`;

const StatsLabel = styled.span`
    font-size: 1.4rem;
    font-weight: 600;
    color: var(--text-primary);
    
    @media (max-width: 768px) {
        font-size: 1.3rem;
    }
`;

const StatsValue = styled.span`
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--primary-blue);
    
    @media (max-width: 768px) {
        font-size: 1.3rem;
    }
`;

const StatsInfo = styled.div`
    font-size: 1.2rem;
    color: var(--text-secondary);
    text-align: center;
    
    @media (max-width: 768px) {
        font-size: 1.1rem;
    }
`;

// 루틴 리스트 (UserApiLogContainer의 LogList 스타일 참고)
const RoutineList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-bottom: 30px;
    
    @media (max-width: 768px) {
        gap: 12px;
        margin-bottom: 25px;
    }
`;

const RoutineItem = styled.div`
    background: var(--bg-secondary);
    border-radius: 12px;
    border: 2px solid var(--border-light);
    overflow: hidden;
    transition: all 0.2s ease;
    animation: ${slideIn} 0.6s ease-out;
    animation-delay: ${props => props.$index * 0.1}s;
    animation-fill-mode: both;
    
    &:hover {
        border-color: var(--primary-blue-light);
    }
    
    @media (max-width: 768px) {
        border-radius: 8px;
    }
`;

const RoutineHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    background: var(--bg-tertiary);
    
    @media (max-width: 768px) {
        padding: 12px 15px;
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
    }
`;

const RoutineTitle = styled.h3`
    font-size: 2.5rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    @media (max-width: 768px) {
        font-size: 2.5rem;
        width: 100%;
    }
`;

const RoutineBadge = styled.span`
    background: var(--primary-blue);
    color: white;
    padding: 0.4rem 0.8rem;
    border-radius: 20px;
    font-size: 1.2rem;
    font-weight: 600;
    white-space: nowrap;
    
    @media (max-width: 768px) {
        align-self: flex-start;
        font-size: 1.1rem;
        padding: 0.35rem 0.7rem;
    }
`;

// 운동 리스트 (UserApiLogContainer의 ExerciseList 스타일 참고)
const ExerciseList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 16px;
    background: var(--bg-primary);
    
    @media (max-width: 768px) {
        gap: 6px;
        padding: 12px;
    }
`;

const ExerciseItem = styled.div`
    background: var(--bg-secondary);
    border-radius: 6px;
    padding: 12px;
    border: 1px solid var(--border-light);
    transition: all 0.2s ease;
    
    &:hover {
        background: var(--bg-tertiary);
        border-color: var(--primary-blue-light);
    }
    
    @media (max-width: 768px) {
        padding: 10px;
    }
`;

const ExerciseInfo = styled.div`
    margin-bottom: 8px;
    
    @media (max-width: 768px) {
        margin-bottom: 6px;
    }
`;

const ExerciseName = styled.div`
    font-size: 2.0rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 2px;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    @media (max-width: 768px) {
        font-size: 2.0rem;
    }
`;

const ExerciseDetails = styled.div`
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    
    @media (max-width: 768px) {
        gap: 8px;
    }
`;

const DetailItem = styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
    background: var(--bg-tertiary);
    padding: 0.3rem 0.6rem;
    border-radius: 4px;
    
    @media (max-width: 768px) {
        padding: 0.25rem 0.5rem;
    }
`;

const DetailLabel = styled.div`
    font-size: 1.8rem;
    color: var(--text-secondary);
    font-weight: 500;
    
    @media (max-width: 768px) {
        font-size: 1.8rem;
    }
`;

const DetailValue = styled.div`
    font-size: 1.8rem;
    color: var(--text-primary);
    font-weight: 600;
    
    @media (max-width: 768px) {
        font-size: 1.8rem;
    }
`;

// 액션 버튼 섹션
const ActionSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-bottom: 30px;
    
    @media (max-width: 768px) {
        gap: 12px;
        margin-bottom: 25px;
    }
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 12px;
    justify-content: center;
    
    @media (max-width: 768px) {
        flex-direction: column;
        gap: 10px;
    }
`;

const ActionButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    background: ${props => props.$variant === 'primary' ? 'var(--primary-blue)' : 
                      props.$variant === 'success' ? 'var(--check-green)' : 
                      props.$variant === 'danger' ? 'var(--warning)' : 'var(--border-medium)'};
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 25px;
    font-size: 1.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
        transform: translateY(-1px);
        background: ${props => props.$variant === 'primary' ? 'var(--primary-blue-hover)' : 
                            props.$variant === 'success' ? '#45a049' : 
                            props.$variant === 'danger' ? '#d32f2f' : 'var(--border-dark)'};
    }
    
    &:active {
        transform: translateY(0);
    }
    
    @media (max-width: 768px) {
        width: 100%;
        justify-content: center;
        padding: 14px 20px;
        font-size: 1.8rem;
    }
`;

// 피드백 섹션
const FeedbackSection = styled.div`
    background: var(--bg-secondary);
    border: 1px solid var(--border-light);
    border-radius: 12px;
    padding: 20px;
    text-align: center;
    transition: all 0.2s ease;
    
    &:hover {
        border-color: var(--primary-blue);
    }
    
    @media (max-width: 768px) {
        padding: 15px;
    }
`;

const FeedbackTitle = styled.h4`
    font-size: 1.8rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 15px;
    
    @media (max-width: 768px) {
        font-size: 1.6rem;
        margin-bottom: 12px;
    }
`;

const FeedbackButtons = styled.div`
    display: flex;
    gap: 12px;
    justify-content: center;
    
    @media (max-width: 768px) {
        gap: 10px;
    }
`;

const FeedbackButton = styled.button`
    background: ${props => props.$positive ? 'var(--check-green)' : 'var(--warning)'};
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 20px;
    font-size: 1.4rem;
    font-weight: 600;
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 6px;
    opacity: ${props => props.disabled ? 0.5 : 1};
    
    ${props => props.$isAnimating && css`
        animation: ${likeAnimation} 0.8s ease-in-out;
    `}
    
    &:hover:not(:disabled) {
        opacity: 0.9;
        transform: translateY(-1px);
    }
    
    &:disabled {
        transform: none;
    }
    
    @media (max-width: 768px) {
        padding: 12px 24px;
        font-size: 1.3rem;
    }
`;

const FeedbackMessage = styled.div`
    margin-top: 15px;
    padding: 12px 20px;
    border-radius: 20px;
    font-size: 1.4rem;
    font-weight: 500;
    
    ${props => props.$positive && css`
        background: rgba(16, 185, 129, 0.1);
        color: var(--check-green);
        border: 1px solid rgba(16, 185, 129, 0.2);
    `}
    
    ${props => props.$negative && css`
        background: rgba(245, 101, 101, 0.1);
        color: var(--warning);
        border: 1px solid rgba(245, 101, 101, 0.2);
    `}
    
    @media (max-width: 768px) {
        margin-top: 12px;
        padding: 10px 16px;
        font-size: 1.3rem;
    }
`;

// 빈 상태
const EmptyState = styled.div`
    text-align: center;
    padding: 80px 20px;
    
    @media (max-width: 768px) {
        padding: 60px 15px;
    }
`;

const EmptyIcon = styled.div`
    font-size: 6.4rem;
    margin-bottom: 20px;
    animation: ${pulse} 2s ease-in-out infinite;
    
    @media (max-width: 768px) {
        font-size: 4.8rem;
        margin-bottom: 15px;
    }
`;

const EmptyTitle = styled.h3`
    font-size: 2.0rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 10px;
    
    @media (max-width: 768px) {
        font-size: 1.8rem;
    }
`;

const EmptyDescription = styled.p`
    font-size: 1.6rem;
    color: var(--text-secondary);
    line-height: 1.6;
    margin-bottom: 30px;
    
    @media (max-width: 768px) {
        font-size: 1.4rem;
        margin-bottom: 25px;
    }
`;

const StepResult = ({ result, onSave, onFeedback, onRetry, onIgnore, onSubmit, feedbackCompleted = false }) => {
    const [feedbackStatus, setFeedbackStatus] = useState(feedbackCompleted ? 'positive' : null);
    const [isLikeAnimating, setIsLikeAnimating] = useState(false);

    // feedbackCompleted prop이 변경될 때 상태 업데이트
    React.useEffect(() => {
        if (feedbackCompleted) {
            setFeedbackStatus('positive');
        }
    }, [feedbackCompleted]);

    const handlePositiveFeedback = () => {
        if (feedbackStatus) return; // 이미 피드백을 준 경우 무시
        
        setIsLikeAnimating(true);
        
        // 애니메이션 완료 후 onSubmit 호출
        setTimeout(() => {
            setIsLikeAnimating(false);
            setFeedbackStatus('positive');
            onSubmit('LIKE');
        }, 800); // 애니메이션 시간과 맞춤
    };

    const handleNegativeFeedback = () => {
        if (feedbackStatus) return; // 이미 피드백을 준 경우 무시
        
        setFeedbackStatus('negative');
        onFeedback('negative');
    };

    if (!result || !result.content || result.content.length === 0) {
        return (
            <Container>
                <EmptyState>
                    <EmptyIcon>⚠️</EmptyIcon>
                    <EmptyTitle>결과를 불러올 수 없습니다</EmptyTitle>
                    <EmptyDescription>
                        AI 루틴 생성 중 문제가 발생했습니다.<br />
                        다시 시도해주세요.
                    </EmptyDescription>
                    <ActionButtons>
                        <ActionButton $variant="primary" onClick={onRetry}>
                            🔄 다시 생성하기
                        </ActionButton>
                    </ActionButtons>
                </EmptyState>
            </Container>
        );
    }

    return (
        <Container>
            <Header>
                <HeaderContent>
                    <Title>🎉 AI 루틴 생성 완료!</Title>
                    <Description>
                        당신에게 맞는 운동 루틴이 준비되었습니다.
                    </Description>
                </HeaderContent>
            </Header>

            {/* 루틴 리스트 */}
            <RoutineList>
                {result.content.map((routine, idx) => (
                    <RoutineItem key={idx} $index={idx}>
                        <RoutineHeader>
                            <RoutineTitle>
                                {routine.routine_name}
                            </RoutineTitle>
                        </RoutineHeader>
                        
                        <ExerciseList>
                            {routine.exercises?.map((exercise, i) => (
                                <ExerciseItem key={i}>
                                    <ExerciseInfo>
                                        <ExerciseName>
                                            {exercise.pt_name}
                                        </ExerciseName>
                                        <ExerciseDetails>
                                            <DetailItem>
                                                <DetailLabel>세트</DetailLabel>
                                                <DetailValue>{exercise.set_num || 0}</DetailValue>
                                            </DetailItem>
                                            <DetailItem>
                                                <DetailLabel>횟수</DetailLabel>
                                                <DetailValue>{exercise.set_count || 0}회</DetailValue>
                                            </DetailItem>
                                            {exercise.set_volume !== 0 && (
                                                <DetailItem>
                                                    <DetailLabel>중량</DetailLabel>
                                                    <DetailValue>{exercise.set_volume}kg</DetailValue>
                                                </DetailItem>
                                            )}
                                        </ExerciseDetails>
                                    </ExerciseInfo>
                                </ExerciseItem>
                            )) || (
                                <EmptyState>
                                    <p>운동이 포함되지 않았습니다.</p>
                                </EmptyState>
                            )}
                        </ExerciseList>
                    </RoutineItem>
                ))}
            </RoutineList>

            {/* 액션 버튼 */}
            <ActionSection>
                <ActionButtons>
                    <ActionButton $variant="success" onClick={onSave}>
                        💾 루틴으로 저장하기
                    </ActionButton>
                    <ActionButton $variant="danger" onClick={onIgnore}>
                        ❌ 저장하지 않기
                    </ActionButton>
                    <ActionButton $variant="primary" onClick={onRetry}>
                        🔄 다시 생성하기
                    </ActionButton>
                </ActionButtons>
            </ActionSection>

            {/* 피드백 섹션 */}
            <FeedbackSection>
                <FeedbackTitle>💭 이 루틴이 어떠신가요?</FeedbackTitle>
                {feedbackStatus ? (
                    <FeedbackMessage $positive={feedbackStatus === 'positive'} $negative={feedbackStatus === 'negative'}>
                        {feedbackStatus === 'positive' ? (
                            <>
                                <span style={{ fontSize: '1.2em' }}>✅</span>&nbsp;
                                피드백이 완료되었습니다. 감사합니다!
                            </>
                        ) : (
                            <>
                                <span style={{ fontSize: '1.2em' }}>📝</span>&nbsp;
                                개선 피드백이 등록되었습니다.
                            </>
                        )}
                    </FeedbackMessage>
                ) : (
                    <FeedbackButtons>
                        <FeedbackButton 
                            $positive 
                            onClick={handlePositiveFeedback}
                            $isAnimating={isLikeAnimating}
                            disabled={feedbackStatus !== null}
                        >
                            👍 좋아요
                        </FeedbackButton>
                        <FeedbackButton 
                            onClick={handleNegativeFeedback}
                            disabled={feedbackStatus !== null}
                        >
                            👎 개선 필요
                        </FeedbackButton>
                    </FeedbackButtons>
                )}
            </FeedbackSection>
        </Container>
    );
};

export default StepResult;
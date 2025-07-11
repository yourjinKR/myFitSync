import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

// 성공 애니메이션
const successPulse = keyframes`
    0% { 
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
    }
    50% { 
        transform: scale(1.05);
        box-shadow: 0 0 0 20px rgba(76, 175, 80, 0);
    }
    100% { 
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
    }
`;

const fadeInUp = keyframes`
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
`;

const SuccessContainer = styled.div`
    background: var(--bg-secondary);
    padding: 3rem 2rem;
    border-radius: 16px;
    border: 1px solid var(--border-light);
    text-align: center;
    max-width: 600px;
    margin: 0 auto;
    animation: ${fadeInUp} 0.6s ease-out;
    
    @media (max-width: 768px) {
        padding: 2rem 1.5rem;
        margin: 0 1rem;
    }
`;

const SuccessIcon = styled.div`
    width: 120px;
    height: 120px;
    background: var(--check-green);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 2rem;
    font-size: 3rem;
    color: white;
    animation: ${successPulse} 2s infinite;
    
    @media (max-width: 768px) {
        width: 100px;
        height: 100px;
        font-size: 2.5rem;
        margin-bottom: 1.5rem;
    }
`;

const SuccessTitle = styled.h1`
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 1rem;
    
    @media (max-width: 768px) {
        font-size: 2rem;
    }
`;

const SuccessMessage = styled.p`
    font-size: 1.2rem;
    color: var(--text-secondary);
    line-height: 1.6;
    margin-bottom: 2.5rem;
    
    @media (max-width: 768px) {
        font-size: 1.1rem;
        margin-bottom: 2rem;
    }
`;

const SuccessStats = styled.div`
    background: var(--bg-tertiary);
    border: 1px solid var(--border-light);
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2.5rem;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;
    
    @media (max-width: 768px) {
        margin-bottom: 2rem;
        padding: 1rem;
    }
`;

const StatItem = styled.div`
    text-align: center;
`;

const StatValue = styled.div`
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--primary-blue);
    margin-bottom: 0.25rem;
    
    @media (max-width: 768px) {
        font-size: 1.5rem;
    }
`;

const StatLabel = styled.div`
    font-size: 0.9rem;
    color: var(--text-secondary);
    font-weight: 500;
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 1rem;
    justify-content: center;
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
    
    &:hover {
        transform: translateY(-2px);
    }
    
    @media (max-width: 768px) {
        width: 100%;
        padding: 0.875rem 1.5rem;
    }
`;

const PrimaryButton = styled(ActionButton)`
    background: var(--primary-blue);
    color: white;
    
    &:hover {
        background: var(--primary-blue-hover);
        box-shadow: 0 6px 20px rgba(74, 144, 226, 0.4);
    }
`;

const SecondaryButton = styled(ActionButton)`
    background: var(--bg-tertiary);
    color: var(--text-primary);
    border: 1px solid var(--border-medium);
    
    &:hover {
        background: var(--bg-secondary);
        border-color: var(--primary-blue);
    }
`;

const StepSuccess = ({ result, onNewRoutine }) => {
    const navigate = useNavigate();

    const handleViewRoutines = () => {
        navigate('/routine/view');
    };

    const totalExercises = result?.content?.reduce((total, routine) => {
        return total + (routine.exercises?.length || 0);
    }, 0) || 0;

    return (
        <SuccessContainer>
            <SuccessIcon>
                ✅
            </SuccessIcon>
            
            <SuccessTitle>
                🎉 루틴 저장 완료!
            </SuccessTitle>
            
            <SuccessMessage>
                AI가 생성한 운동 루틴이 성공적으로 저장되었습니다.<br />
                이제 나의 루틴에서 확인하고 운동을 시작해보세요!
            </SuccessMessage>
            
            <SuccessStats>
                <StatItem>
                    <StatValue>{result?.content?.length || 0}</StatValue>
                    <StatLabel>저장된 루틴</StatLabel>
                </StatItem>
                <StatItem>
                    <StatValue>{totalExercises}</StatValue>
                    <StatLabel>총 운동 수</StatLabel>
                </StatItem>
                <StatItem>
                    <StatValue>{result?.responseTime || 0}초</StatValue>
                    <StatLabel>생성 시간</StatLabel>
                </StatItem>
            </SuccessStats>
            
            <ActionButtons>
                <PrimaryButton onClick={handleViewRoutines}>
                    📋 나의 루틴 보기
                </PrimaryButton>
                <SecondaryButton onClick={onNewRoutine}>
                    🔄 새 루틴 만들기
                </SecondaryButton>
            </ActionButtons>
        </SuccessContainer>
    );
};

export default StepSuccess;

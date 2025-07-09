import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { getMemberTotalData } from '../../utils/memberUtils';
import StepInputInfo from './StepInputInfo';
import StepResult from './StepResult';
import FeedbackModal from './FeedbackModal';
import IsLoading from '../IsLoading';
import { useWorkoutNames } from '../../hooks/admin/useWorkoutNames';
import AiUtil from '../../utils/AiUtils';

const ServiceContainer = styled.div`
    max-width: 1000px;
    margin: 0 auto;
    padding: 2rem;
    min-height: 100vh;
    background: var(--bg-primary);
`;

const ServiceTitle = styled.h1`
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--text-primary);
    text-align: center;
    margin-bottom: 3rem;
    
    @media (max-width: 768px) {
        font-size: 2rem;
        margin-bottom: 2rem;
    }
`;

const ProgressBar = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 3rem;
    padding: 1.5rem;
    background: var(--bg-secondary);
    border-radius: 12px;
    border: 1px solid var(--border-light);
    position: relative;
    
    @media (max-width: 768px) {
        padding: 1rem;
        margin-bottom: 2rem;
    }
`;

const ProgressStep = styled.div`
    flex: 1;
    text-align: center;
    position: relative;
    
    &:not(:last-child)::after {
        content: '';
        position: absolute;
        top: 20px;
        right: -50%;
        width: 100%;
        height: 3px;
        background: ${props => props.completed ? 'var(--primary-blue)' : 'var(--border-light)'};
        border-radius: 2px;
        transform: translateY(-50%);
        z-index: 1;
    }
`;

const ProgressIcon = styled.div`
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: ${props => 
        props.active ? 'var(--primary-blue)' : 
        props.completed ? 'var(--check-green)' : 'var(--bg-tertiary)'};
    color: var(--text-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 0.75rem;
    font-size: 1.5rem;
    font-weight: bold;
    position: relative;
    z-index: 2;
    transition: all 0.3s ease;
    border: 3px solid ${props => 
        props.active ? 'var(--primary-blue-light)' : 
        props.completed ? 'var(--check-green)' : 'var(--border-medium)'};
    
    @media (max-width: 768px) {
        width: 40px;
        height: 40px;
        font-size: 1.2rem;
    }
`;

const ProgressLabel = styled.div`
    font-size: 1rem;
    color: ${props => props.active ? 'var(--text-primary)' : 'var(--text-secondary)'};
    font-weight: ${props => props.active ? '600' : '400'};
    
    @media (max-width: 768px) {
        font-size: 0.9rem;
    }
`;

const AiServiceContainer = () => {
    const [currentStep, setCurrentStep] = useState(1); // 1: 입력, 2: 로딩, 3: 결과
    const [memberData, setMemberData] = useState(null);
    const [aiResult, setAiResult] = useState(null);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const {rawDataIdx, rawDataMap, fetchWorkoutNames} = useWorkoutNames();

    // 멤버 데이터 로드
    useEffect(() => {
        const fetchMemberData = async () => {
            try {
                const data = await getMemberTotalData();
                setMemberData(data);
            } catch (error) {
                console.error('멤버 데이터 로드 실패:', error);
            }
        };
        fetchMemberData();
    }, []);

    // AI 루틴 생성 처리
    const handleGenerateRoutine = async (inputData) => {
        setCurrentStep(2);
        
        try {
            const startTime = performance.now();
            
            // 입력 데이터를 AI API에 맞게 변환
            const filteredUserInfo = Object.fromEntries(
                Object.entries(inputData).filter(([_, value]) => value !== null && value !== '')
            );
            
            const fullMessage = JSON.stringify(filteredUserInfo);
            console.log('전송할 메시지:', fullMessage);
            
            const response = await axios.post(
                '/ai/createRoutine', 
                { message: fullMessage },
                { withCredentials: true }
            );
            
            const endTime = performance.now();
            const elapsedSeconds = ((endTime - startTime) / 1000).toFixed(2);
            
            const parsedContent = JSON.parse(response.data.content);
            const result = {
                content: parsedContent,
                logIdx: response.data.logIdx,
                responseTime: parseFloat(elapsedSeconds)
            };
            
            setAiResult(result);
            setCurrentStep(3);
        } catch (error) {
            console.error('AI 루틴 생성 실패:', error);
            alert('AI 루틴 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
            setCurrentStep(1);
        }
    };

    // 결과 저장 처리
    const handleSaveResult = async () => {
        if (!aiResult || !aiResult.content) {
            alert('저장할 루틴이 없습니다.');
            return;
        }
        
        AiUtil.saveResult(aiResult, rawDataIdx, rawDataMap);
    };

    // 피드백 처리
    const handleFeedback = async (type, reason = null) => {
        try {
            const feedbackData = {
                logIdx: aiResult?.logIdx,
                type: type,
                reason: reason
            };
            
            // 피드백 API 호출 (실제 엔드포인트에 맞게 수정 필요)
            await axios.post('/api/feedback', feedbackData, { withCredentials: true });
            
            console.log('피드백 전송:', type, reason);
            setShowFeedbackModal(false);
            
            if (type === 'positive') {
                alert('피드백 감사합니다! 더 나은 서비스를 제공하겠습니다.');
            } else {
                alert('소중한 의견 감사합니다. 개선하여 더 나은 루틴을 제공하겠습니다.');
            }
        } catch (error) {
            console.error('피드백 전송 실패:', error);
            setShowFeedbackModal(false);
        }
    };

    const steps = [
        { icon: '📝', label: '정보 입력', step: 1 },
        { icon: '🤖', label: 'AI 생성', step: 2 },
        { icon: '✅', label: '완료', step: 3 }
    ];

    return (
        <ServiceContainer>
            <ServiceTitle>🤖 AI 운동 루틴 추천</ServiceTitle>
            
            {/* 진행 단계 표시 */}
            <ProgressBar>
                {steps.map((step, index) => (
                    <ProgressStep 
                        key={step.step}
                        completed={currentStep > step.step}
                    >
                        <ProgressIcon 
                            active={currentStep === step.step}
                            completed={currentStep > step.step}
                        >
                            {step.icon}
                        </ProgressIcon>
                        <ProgressLabel active={currentStep === step.step}>
                            {step.label}
                        </ProgressLabel>
                    </ProgressStep>
                ))}
            </ProgressBar>

            {/* 단계별 컴포넌트 렌더링 */}
            {currentStep === 1 && (
                <StepInputInfo 
                    memberData={memberData}
                    onGenerate={handleGenerateRoutine}
                />
            )}
            
            {currentStep === 2 && (
                <IsLoading />
            )}
            
            {currentStep === 3 && (
                <StepResult 
                    result={aiResult}
                    onSave={handleSaveResult}
                    onFeedback={() => setShowFeedbackModal(true)}
                    onRetry={() => setCurrentStep(1)}
                />
            )}

            {/* 피드백 모달 */}
            {showFeedbackModal && (
                <FeedbackModal
                    onClose={() => setShowFeedbackModal(false)}
                    onSubmit={handleFeedback}
                />
            )}
        </ServiceContainer>
    );
};

export default AiServiceContainer;
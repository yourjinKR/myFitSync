import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { getMemberTotalData } from '../../utils/memberUtils';
import StepInputInfo from './StepInputInfo';
import StepResult from './StepResult';
import StepSuccess from './StepSuccess';
import FeedbackModal from './FeedbackModal';
import IsLoading from '../IsLoading';
import { useWorkoutNames } from '../../hooks/admin/useWorkoutNames';
import AiUtil from '../../utils/AiUtils';
import { checkAllExerciseNames } from '../../utils/KorUtil';
import { PaymentUtil } from '../../utils/PaymentUtil';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import useRequireLogin from '../../hooks/useRequireLogin';
import { IGNORE, SAVED_NOW } from '../../reducers/type';

const ServiceContainer = styled.div`
    max-width: 1000px;
    margin: 0 auto;
    padding: 2rem;
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
        background: ${props => props.completed ? 'var(--success)' : 'var(--border-light)'};
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

const AiRoutineServiceContainer = () => {
    useRequireLogin();

    const user = useSelector(state => state.user.user);
    const [currentStep, setCurrentStep] = useState(1); // 1: 입력, 2: 로딩, 3: 결과, 4: 완료
    const [memberData, setMemberData] = useState(null);
    const [aiResult, setAiResult] = useState(null);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [feedbackCompleted, setFeedbackCompleted] = useState(false); // 피드백 완료 상태
    const {rawDataIdx, rawDataMap} = useWorkoutNames();
    const [subscriptionData, setSubscriptionData] = useState(null);

    const nav = useNavigate();

    const fetchMemberData = async () => {
        try {
            const memberResponse = await getMemberTotalData();
            const subscriptionResponse = await PaymentUtil.checkSubscriptionStatus(user.member_idx);
            setMemberData(memberResponse);
            setSubscriptionData(subscriptionResponse.data);

        } catch (error) {
            console.error('멤버 데이터 로드 실패:', error);
        }
    };

    // 멤버, 구독 정보 데이터 로드
    useEffect(() => {
        fetchMemberData();
    }, []);

    // // 사용량 초과시 호출되지 않음
    // useEffect(() => {
    //     if (subscriptionData  === null) return;        
    //     if(subscriptionData.totalCost > 3) {
    //         alert('사용량이 초과됐습니다!');
    //         nav(-1);
    // } else {
    //         console.log('아직 사용 가능');
    //     }
    // },[subscriptionData]);

    useEffect(() => {
        if (aiResult === null) return;
        if (Object.keys(aiResult).length === 0) return;

        // console.log('파싱된 결과 : ', result);
        const exception = AiUtil.analyzeAIResult(aiResult, aiResult.split, rawDataMap);

        if (exception !== null && aiResult.logIdx) {
            const apilog = {apilog_idx : aiResult.logIdx, apilog_status_reason : exception};
            AiUtil.updateLogException(apilog);
        }
        
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[aiResult]);

    // AI 루틴 생성 처리
    const handleGenerateRoutine = async (inputData) => {
        
        if (subscriptionData.totalCost > 5) {
            alert('사용량이 초과되어 사용할 수 없음');
            return;
        }
        setCurrentStep(2);
        setFeedbackCompleted(false); // 새로운 루틴 생성 시 피드백 상태 초기화
        

        try {
            const startTime = performance.now();
            
            // 입력 데이터를 AI API에 맞게 변환
            const filteredUserInfo = Object.fromEntries(
                Object.entries(inputData).filter(([_, value]) => value !== null && value !== '')
            );
            
            const fullMessage = JSON.stringify(filteredUserInfo);
            
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
                responseTime: parseFloat(elapsedSeconds),
                split: inputData.split || 4,
            };

            // 이름 체크
            const changedNameResult = checkAllExerciseNames(result, rawDataMap);
            setAiResult(changedNameResult);
            fetchMemberData();

            setCurrentStep(3);
        } catch (error) {
            console.error('AI 루틴 생성 실패:', error);
            alert('AI 루틴 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
            setCurrentStep(1);
        }
    };

    /** 결과 저장 처리 */ 
    const handleSaveResult = async () => {
        if (!aiResult || !aiResult.content) {
            alert('저장할 루틴이 없습니다.');
            return;
        }
        
        try {
            const changedNameAiResult = checkAllExerciseNames(aiResult, rawDataMap);

            const response = await AiUtil.updateLogUserAction({apilog_idx : aiResult.logIdx, apilog_user_action : SAVED_NOW});
            
            await AiUtil.saveResult(changedNameAiResult, rawDataIdx, rawDataMap);
            
            // 저장 성공 후 완료 단계로 이동
            setCurrentStep(4);
        } catch (error) {
            console.error('루틴 저장 실패:', error);
            alert('루틴 저장 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
    };

    /** 결과 저장하지 않기 */ 
    const handleIgnoreResult = async () => {
        if (!aiResult || !aiResult.content) {
            alert('저장할 루틴이 없습니다.');
            return;
        }
        try {
            const response = await AiUtil.updateLogUserAction({apilog_idx : aiResult.logIdx, apilog_user_action : IGNORE});
            nav('/ai/userLog');
        } catch (error) {
            console.error('루틴 저장 실패:', error);
            alert('루틴 저장 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
    }

    /** 결과 다시 생성 */
    const handleRetryResult = async () => {
        if (!aiResult || !aiResult.content) {
            alert('저장할 루틴이 없습니다.');
            return;
        }
        try {
            const response = await AiUtil.updateLogUserAction({apilog_idx : aiResult.logIdx, apilog_user_action : IGNORE});
            setCurrentStep(1);
            setFeedbackCompleted(false); // 다시 시도할때 피드백 상태 초기화
        } catch (error) {
            
        }
    }

    /** 피드백 업데이트 */ 
    const handleFeedback = async (type, reason = null) => {
        try {
            const log = {
                apilog_idx : aiResult?.logIdx,
                apilog_feedback : type,
                apilog_feedback_reason : reason,
            };

            // 피드백 API 호출 (실제 엔드포인트에 맞게 수정 필요)
            await axios.patch('/admin/api/feedback', log, { withCredentials: true });
            
            setShowFeedbackModal(false);
            setFeedbackCompleted(true); // 피드백 완료 상태 설정
            
            if (type === 'positive' || type === 'LIKE') {
                alert('피드백 감사합니다! 더 나은 서비스를 제공하겠습니다.');
            } else {
                alert('소중한 의견 감사합니다. 개선하여 더 나은 루틴을 제공하겠습니다.');
            }
        } catch (error) {
            console.error('피드백 전송 실패:', error);
            setShowFeedbackModal(false);
        }
    };

    // 새 루틴 만들기 처리
    const handleNewRoutine = () => {
        setCurrentStep(1);
        setAiResult(null);
        setFeedbackCompleted(false);
        setShowFeedbackModal(false);
    };

    const steps = [
        { icon: '📝', label: '정보 입력', step: 1 },
        { icon: '🤖', label: 'AI 생성', step: 2 },
        { icon: '✅', label: '결과 확인', step: 3 },
        { icon: '🎉', label: '완료', step: 4 }
    ];

    return (
        <ServiceContainer>
            {/* <ProgressBar>
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
            </ProgressBar> */}

            {/* 단계별 컴포넌트 렌더링 */}
            {currentStep === 1 && (
                <StepInputInfo 
                    memberData={memberData}
                    setMemberData={setMemberData}
                    onGenerate={handleGenerateRoutine}
                    // 구독을 안했지만 최초 1회일 경우 가능
                    // 구독을 했지만 총 사용량이 3 넘지 않을 경우 가능
                    available={
                        subscriptionData
                            ? (
                                (subscriptionData.totalCost < 5 && subscriptionData.isSubscriber) ||
                                (!subscriptionData.isSubscriber && !subscriptionData.isLog)
                            )
                            : false
                    }
                    isSubscriber={subscriptionData?.isSubscriber}
                />
            )}
            
            {currentStep === 2 && (
                <IsLoading />
            )}
            
            {currentStep === 3 && (
                <StepResult 
                    result={aiResult}
                    onSave={handleSaveResult}
                    onIgnore={handleIgnoreResult}
                    onRetry={handleRetryResult}
                    onFeedback={() => setShowFeedbackModal(true)}
                    onSubmit={handleFeedback}
                    feedbackCompleted={feedbackCompleted}
                />
            )}
            
            {currentStep === 4 && (
                <StepSuccess 
                    result={aiResult}
                    onNewRoutine={handleNewRoutine}
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

export default AiRoutineServiceContainer;
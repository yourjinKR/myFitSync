import React, { useState } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import { useWorkoutNames } from "../../hooks/admin/useWorkoutNames";
import { useUserApiLogs } from "../../hooks/admin/useApiLogs";
import AiUtil from "../../utils/AiUtils";
import { SAVED_AFTER } from "../../reducers/type";

const UserApiLogContainer = () => {
    const {member_idx} = useSelector(state => state.user?.user);

    // 사용자 로그 데이터 가져오기 (파싱 포함)
    const { apiLogs, loading } = useUserApiLogs(member_idx);

    // 확장된 로그 아이템 관리
    const [expandedLogId, setExpandedLogId] = useState(null);
    
    // 확장된 루틴 관리 (여러 개 동시 열기 가능)
    const [expandedRoutines, setExpandedRoutines] = useState({});

    // 운동명 파싱 데이터
    const { rawDataIdx, rawDataMap } = useWorkoutNames();

    // 로그 아이템 클릭 핸들러
    const handleLogClick = (logId) => {
        setExpandedLogId(expandedLogId === logId ? null : logId);
    };

    // 루틴 드롭다운 클릭 핸들러
    const handleRoutineClick = (logId, routineIndex) => {
        const routineKey = `${logId}_${routineIndex}`;
        setExpandedRoutines(prev => ({
            ...prev,
            [routineKey]: !prev[routineKey]
        }));
    };

    // 루틴 저장 핸들러
    // 루틴 추천 결과 저장하기
    const handleSaveRoutine = async (log) => {
        const ask = window.confirm('해당 루틴을 저장하시겠습니까?');

        if (!ask) return;

        console.log('click');
        
        const result = {content : log.parsed_response, logIdx : log.apilog_idx}
        try {
            await AiUtil.saveResult(result, rawDataIdx, rawDataMap);

            if (log.apilog_user_action !== 'ignore') {
                console.log('유저 액션 업데이트 안함.');
            } else {
                console.log('유저 액션 업데이트 하겠음');
                await AiUtil.updateLogUserAction({apilog_idx : log.apilog_idx, apilog_user_action : SAVED_AFTER});
            }

            alert('저장이 완료됐습니다!');
        } catch (error) {
            alert('결과물을 저장하지 못했습니다 ! ')
        }
    }

    // JSON 포맷팅
    const formatJson = (jsonString) => {
        try {
            return JSON.stringify(JSON.parse(jsonString), null, 2);
        } catch {
            return jsonString;
        }
    };

    // 루틴 미리보기 텍스트 생성
    const getRoutinePreview = (log) => {
        if (!log.parsed_response || !Array.isArray(log.parsed_response) || log.parsed_response.length === 0) {
            return '루틴 정보 없음';
        }

        const firstRoutine = log.parsed_response[0]?.routine_name || '루틴';
        const remainingCount = log.parsed_response.length - 1;

        if (remainingCount > 0) {
            return `${firstRoutine} 외 ${remainingCount}개`;
        } else {
            return firstRoutine;
        }
    };

    if (loading) {
        return (
            <Container>
                <LoadingMessage>로그를 불러오는 중...</LoadingMessage>
            </Container>
        );
    }

    return (
        <Container>
            <Header>
                <Title>🏋️‍♂️ 내 AI 운동 추천 기록</Title>
                <Description>
                    이전에 받았던 AI 운동 추천 결과를 다시 확인하고 루틴으로 저장할 수 있습니다.
                </Description>
            </Header>

            {apiLogs.length === 0 ? (
                <EmptyState>
                    <EmptyIcon>📝</EmptyIcon>
                    <EmptyTitle>아직 AI 추천 기록이 없습니다</EmptyTitle>
                    <EmptyDescription>
                        AI 운동 추천 서비스를 이용해보세요!
                    </EmptyDescription>
                </EmptyState>
            ) : (
                <LogList>
                    {apiLogs.map((log) => (
                        <LogItem key={log.apilog_idx}>
                            <LogHeader 
                                onClick={() => handleLogClick(log.apilog_idx)}
                                expanded={expandedLogId === log.apilog_idx}
                            >
                                <LogInfo>
                                    <LogPreview>
                                        {getRoutinePreview(log)}
                                    </LogPreview>
                                    <LogDate>
                                        {new Date(log.apilog_request_time).toLocaleString('ko-KR')}
                                    </LogDate>
                                </LogInfo>
                                <ExpandIcon expanded={expandedLogId === log.apilog_idx}>
                                    ▼
                                </ExpandIcon>
                            </LogHeader>

                            {expandedLogId === log.apilog_idx && (
                                <LogContent>
                                    {log.apilog_status === 'success' && log.parsed_response ? (
                                        <SuccessContent>
                                            {/* <ContentSection>
                                                <SectionTitle>📝 요청 내용</SectionTitle>
                                                <UserInfoGrid>
                                                    {log.parsed_userMassage && (
                                                        <>
                                                            <UserInfoItem>
                                                                <InfoLabel>이름</InfoLabel>
                                                                <InfoValue>{log.parsed_userMassage.name || '-'}</InfoValue>
                                                            </UserInfoItem>
                                                            <UserInfoItem>
                                                                <InfoLabel>성별/나이</InfoLabel>
                                                                <InfoValue>{log.parsed_userMassage.gender} / {log.parsed_userMassage.age}세</InfoValue>
                                                            </UserInfoItem>
                                                            <UserInfoItem>
                                                                <InfoLabel>신체정보</InfoLabel>
                                                                <InfoValue>{log.parsed_userMassage.height}cm, {log.parsed_userMassage.weight}kg (BMI: {log.parsed_userMassage.bmi})</InfoValue>
                                                            </UserInfoItem>
                                                            <UserInfoItem>
                                                                <InfoLabel>운동 목적</InfoLabel>
                                                                <InfoValue>{log.parsed_userMassage.purpose}</InfoValue>
                                                            </UserInfoItem>
                                                            <UserInfoItem>
                                                                <InfoLabel>분할</InfoLabel>
                                                                <InfoValue>{log.parsed_userMassage.split}분할 루틴</InfoValue>
                                                            </UserInfoItem>
                                                            {log.parsed_userMassage.disease && (
                                                                <UserInfoItem>
                                                                    <InfoLabel>주의사항</InfoLabel>
                                                                    <InfoValue>{log.parsed_userMassage.disease}</InfoValue>
                                                                </UserInfoItem>
                                                            )}
                                                        </>
                                                    )}
                                                </UserInfoGrid>
                                            </ContentSection> */}

                                            <ContentSection>
                                                <SectionTitle>🎯 AI 추천 결과</SectionTitle>
                                                <RoutineContainer>
                                                    {Array.isArray(log.parsed_response) ? (
                                                        log.parsed_response.map((routine, index) => (
                                                            <RoutineCard key={index}>
                                                                <RoutineHeader
                                                                    onClick={() => handleRoutineClick(log.apilog_idx, index)}
                                                                >
                                                                    <RoutineDay>{routine.routine_name}</RoutineDay>
                                                                    <RoutineExpandIcon 
                                                                        expanded={expandedRoutines[`${log.apilog_idx}_${index}`]}
                                                                    >
                                                                        ▼
                                                                    </RoutineExpandIcon>
                                                                </RoutineHeader>
                                                                {expandedRoutines[`${log.apilog_idx}_${index}`] && (
                                                                    <ExerciseList>
                                                                        {routine.exercises?.map((exercise, exerciseIndex) => (
                                                                            <ExerciseItem key={exerciseIndex}>
                                                                                <ExerciseInfo>
                                                                                    <ExerciseName>{exercise.pt_name}</ExerciseName>
                                                                                </ExerciseInfo>
                                                                                <ExerciseDetails>
                                                                                    <DetailItem>
                                                                                        <DetailLabel>세트</DetailLabel>
                                                                                        <DetailValue>{exercise.set_num}세트</DetailValue>
                                                                                    </DetailItem>
                                                                                    <DetailItem>
                                                                                        <DetailLabel>횟수</DetailLabel>
                                                                                        <DetailValue>{exercise.set_count}회</DetailValue>
                                                                                    </DetailItem>
                                                                                    <DetailItem>
                                                                                        <DetailLabel>중량</DetailLabel>
                                                                                        <DetailValue>{exercise.set_volume}kg</DetailValue>
                                                                                    </DetailItem>
                                                                                </ExerciseDetails>
                                                                            </ExerciseItem>
                                                                        ))}
                                                                    </ExerciseList>
                                                                )}
                                                            </RoutineCard>
                                                        ))
                                                    ) : (
                                                        <CodeBlock>
                                                            <pre>{formatJson(JSON.stringify(log.parsed_response))}</pre>
                                                        </CodeBlock>
                                                    )}
                                                </RoutineContainer>
                                            </ContentSection>

                                            <ActionSection>
                                                <SaveButton onClick={() => handleSaveRoutine(log)}>
                                                    💾 루틴으로 저장하기
                                                </SaveButton>
                                            </ActionSection>
                                        </SuccessContent>
                                    ) : (
                                        <ErrorContent>
                                            <ErrorTitle>❌ 요청 실패</ErrorTitle>
                                            <ErrorMessage>
                                                {log.apilog_error_message || '알 수 없는 오류가 발생했습니다.'}
                                            </ErrorMessage>
                                        </ErrorContent>
                                    )}
                                </LogContent>
                            )}
                        </LogItem>
                    ))}
                </LogList>
            )}
        </Container>
    );
};

// 스타일 컴포넌트
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: var(--bg-primary);
  min-height: 100vh;

  @media (max-width: 768px) {
    padding: 15px;
    max-width: 100%;
  }
`;

const Header = styled.div`
  margin-bottom: 30px;
  text-align: center;

  @media (max-width: 768px) {
    margin-bottom: 20px;
  }
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 10px;

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const Description = styled.p`
  font-size: 16px;
  color: var(--text-secondary);
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 60px;
  font-size: 18px;
  color: var(--text-secondary);

  @media (max-width: 768px) {
    padding: 40px 20px;
    font-size: 16px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;

  @media (max-width: 768px) {
    padding: 60px 15px;
  }
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    font-size: 48px;
    margin-bottom: 15px;
  }
`;

const EmptyTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 10px;

  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const EmptyDescription = styled.p`
  font-size: 16px;
  color: var(--text-secondary);

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const LogList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;

  @media (max-width: 768px) {
    gap: 12px;
  }
`;

const LogItem = styled.div`
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-light);
  overflow: hidden;
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: 768px) {
    border-radius: 8px;
  }
`;

const LogHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: var(--bg-tertiary);
  }

  @media (max-width: 768px) {
    padding: 12px 15px;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
`;

const LogInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  @media (max-width: 768px) {
    width: 100%;
    gap: 2px;
  }
`;

const LogPreview = styled.div`
  font-size: 16px;
  color: var(--text-primary);
  font-weight: 600;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const LogDate = styled.div`
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 400;

  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const ExpandIcon = styled.div`
  font-size: 12px;
  color: var(--text-tertiary);
  transform: ${props => props.expanded ? 'rotate(180deg)' : 'rotate(0deg)'};
  transition: transform 0.2s ease;

  @media (max-width: 768px) {
    align-self: center;
  }
`;

const LogContent = styled.div`
  border-top: 1px solid var(--border-light);
  background: var(--bg-primary);
`;

const SuccessContent = styled.div`
  padding: 20px;

  @media (max-width: 768px) {
    padding: 15px;
  }
`;

const ContentSection = styled.div`
  margin-bottom: 25px;

  &:last-child {
    margin-bottom: 0;
  }

  @media (max-width: 768px) {
    margin-bottom: 20px;
  }
`;

const SectionTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 768px) {
    font-size: 15px;
    margin-bottom: 10px;
  }
`;

const UserInfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 10px;
  }
`;

const UserInfoItem = styled.div`
  background: var(--bg-tertiary);
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--border-light);

  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const InfoLabel = styled.div`
  font-size: 12px;
  color: var(--text-tertiary);
  margin-bottom: 4px;
  font-weight: 500;

  @media (max-width: 768px) {
    font-size: 11px;
  }
`;

const InfoValue = styled.div`
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;

  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const RoutineContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;

  @media (max-width: 768px) {
    gap: 12px;
  }
`;

const RoutineCard = styled.div`
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  overflow: hidden;

  @media (max-width: 768px) {
    border-radius: 6px;
  }
`;

const RoutineHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: var(--bg-tertiary);
  }

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

const RoutineDay = styled.h5`
  font-size: 16px;
  font-weight: 600;
  color: var(--primary-blue);
  margin: 0;

  @media (max-width: 768px) {
    font-size: 15px;
  }
`;

const RoutineExpandIcon = styled.div`
  font-size: 12px;
  color: var(--text-tertiary);
  transform: ${props => props.expanded ? 'rotate(180deg)' : 'rotate(0deg)'};
  transition: transform 0.2s ease;

  @media (max-width: 768px) {
    font-size: 11px;
  }
`;

const ExerciseList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 16px 16px 16px;
  border-top: 1px solid var(--border-light);
  background: var(--bg-primary);

  @media (max-width: 768px) {
    gap: 6px;
    padding: 12px 12px 12px 12px;
  }
`;

const ExerciseItem = styled.div`
  background: var(--bg-tertiary);
  border-radius: 6px;
  padding: 12px;
  border: 1px solid var(--border-light);

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
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;

  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const ExerciseDetails = styled.div`
  display: flex;
  gap: 12px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 6px;
  }
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;

  @media (max-width: 768px) {
    justify-content: space-between;
  }
`;

const DetailLabel = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;

  @media (max-width: 768px) {
    font-size: 11px;
  }
`;

const DetailValue = styled.div`
  font-size: 12px;
  color: var(--text-primary);
  font-weight: 600;

  @media (max-width: 768px) {
    font-size: 11px;
  }
`;

const CodeBlock = styled.div`
  background: var(--bg-tertiary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  padding: 15px;
  overflow-x: auto;

  pre {
    margin: 0;
    color: var(--text-secondary);
    font-family: 'Courier New', monospace;
    font-size: 13px;
    line-height: 1.5;
  }

  @media (max-width: 768px) {
    padding: 12px;
    
    pre {
      font-size: 11px;
    }
  }
`;

const ActionSection = styled.div`
  display: flex;
  justify-content: center;
  padding-top: 20px;
  border-top: 1px solid var(--border-light);

  @media (max-width: 768px) {
    padding-top: 15px;
  }
`;

const SaveButton = styled.button`
  background: var(--primary-blue);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: var(--primary-blue-hover);
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 14px 20px;
    font-size: 15px;
  }
`;

const ErrorContent = styled.div`
  padding: 20px;
  text-align: center;

  @media (max-width: 768px) {
    padding: 15px;
  }
`;

const ErrorTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: var(--warning);
  margin-bottom: 10px;

  @media (max-width: 768px) {
    font-size: 15px;
  }
`;

const ErrorMessage = styled.div`
  font-size: 14px;
  color: var(--text-secondary);
  background: var(--bg-tertiary);
  padding: 15px;
  border-radius: 8px;
  border: 1px solid var(--border-light);

  @media (max-width: 768px) {
    font-size: 13px;
    padding: 12px;
  }
`;

export default UserApiLogContainer;

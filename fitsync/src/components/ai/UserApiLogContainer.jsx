import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import { useWorkoutNames } from "../../hooks/admin/useWorkoutNames";
import { useUserApiLogs } from "../../hooks/admin/useApiLogs";
import AiUtil from "../../utils/AiUtils";
import { SAVED_AFTER } from "../../reducers/type";
import { useNavigate } from "react-router-dom";
import useRequireLogin from "../../hooks/useRequireLogin";
import { PaymentUtil } from "../../utils/PaymentUtil";
import GradientButton from "./GradientButton";
import { BsStars } from "react-icons/bs";
import { PiStarFourFill } from "react-icons/pi";

const UserApiLogContainer = () => {
    const isReady = useRequireLogin();
    const {member_idx} = useSelector(state => state.user?.user);
    const [subscriptionData, setSubscriptionData] = useState(null);
    // 구독 정보 가져오기
    const loadSubscriptionData = async () => {
      const result = await PaymentUtil.checkSubscriptionStatus(member_idx);
      setSubscriptionData(result.data);
    }
    // 불러오기
    useEffect(()=>{
      if (isReady && member_idx) {
        loadSubscriptionData();
      }
    },[isReady, member_idx]);

    // 사용자 로그 데이터 가져오기 (파싱 포함)
    const { apiLogs, loading } = useUserApiLogs(member_idx);

    // 확장된 로그 아이템 관리
    const [expandedLogId, setExpandedLogId] = useState(null);
    
    // 확장된 루틴 관리 (여러 개 동시 열기 가능)
    const [expandedRoutines, setExpandedRoutines] = useState({});

    // 검색 및 필터링 상태
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchResults, setShowSearchResults] = useState(false);

    const nav = useNavigate();

    // 각 로그 아이템의 ref를 저장
    const logRefs = useRef({});

    // 운동명 파싱 데이터
    const { rawDataIdx, rawDataMap } = useWorkoutNames();

    // 루틴 추천으로 이동
    const handleCreateNewRoutine = () => {
      nav('/ai/routine');
    };

    // 로그 아이템 클릭 핸들러
    const handleLogClick = (logId) => {
        const newExpandedId = expandedLogId === logId ? null : logId;
        setExpandedLogId(newExpandedId);
        
        // 드롭다운이 열릴 때만 스크롤 이동
        if (newExpandedId && logRefs.current[logId]) {
            setTimeout(() => {
                logRefs.current[logId].scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 100); // 애니메이션이 시작된 후 스크롤 이동
        }
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

    // 검색어 변경 핸들러
    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        setShowSearchResults(query.length > 0);
    };

    // 검색어 초기화
    const handleClearSearch = () => {
        setSearchQuery('');
        setShowSearchResults(false);
    };

    // 로그 필터링 함수
    const getFilteredLogs = () => {
        if (!searchQuery.trim()) {
            return apiLogs;
        }

        return apiLogs.filter(log => {
            if (!log.parsed_response || !Array.isArray(log.parsed_response)) {
                return false;
            }

            // 루틴 이름이나 운동 이름에서 검색어 찾기
            return log.parsed_response.some(routine => {
                // 루틴 이름에서 검색
                if (routine.routine_name?.toLowerCase().includes(searchQuery.toLowerCase())) {
                    return true;
                }

                // 운동 이름에서 검색
                return routine.exercises?.some(exercise => 
                    exercise.pt_name?.toLowerCase().includes(searchQuery.toLowerCase())
                );
            });
        });
    };

    // 필터링된 로그 데이터
    const filteredLogs = getFilteredLogs();

    // 텍스트 하이라이트 함수
    const highlightText = (text, query) => {
        if (!query.trim()) return text;
        
        const regex = new RegExp(`(${query})`, 'gi');
        const parts = text.split(regex);
        
        return parts.map((part, index) => 
            regex.test(part) ? (
                <HighlightText key={index}>{part}</HighlightText>
            ) : (
                part
            )
        );
    };

    // 루틴에 검색 키워드와 일치하는 운동이 있는지 확인
    const hasMatchingExercise = (routine, query) => {
        if (!query.trim() || !routine.exercises) return false;
        
        return routine.exercises.some(exercise => 
            exercise.pt_name?.toLowerCase().includes(query.toLowerCase())
        );
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
                <HeaderContent>
                    <HeaderText>
                        <Title>Fitsync AI</Title>
                        <Description>
                            AI가 추천한 개인 맞춤 루틴을 확인하고 관리하세요
                        </Description>
                    </HeaderText>
                    <GradientButton onClick={handleCreateNewRoutine} size="small">
                      새 요청&emsp;<PiStarFourFill style={{ position: "relative", zIndex: 2 }}/>
                    </GradientButton>
                </HeaderContent>
                
                {/* AI 사용량 표시 */}
                {subscriptionData?.isSubscriber && (
                  <UsageSection>
                      <UsageHeader>
                          <UsageLabel>AI 사용량</UsageLabel>
                          <UsagePercentage>
                              {subscriptionData?.totalCost >= 0
                                  ? `${Math.min(100, ((subscriptionData?.totalCost / 5) * 100)).toFixed(0)}%`
                                  : '계산 중...'}
                          </UsagePercentage>
                      </UsageHeader>
                      <UsageBarContainer>
                          <UsageBarFill 
                              $percentage={
                                  subscriptionData?.totalCost > 0 
                                      ? Math.min(100, (subscriptionData?.totalCost / 5) * 100) 
                                      : 0
                              }
                          />
                      </UsageBarContainer>
                  </UsageSection>
                )}
            </Header>

            {/* 검색 섹션 */}
            <SearchSection>
                <SearchContainer>
                    <SearchInputWrapper>
                        <SearchIcon>🔍</SearchIcon>
                        <SearchInput
                            type="text"
                            placeholder="운동명이나 루틴명으로 검색..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />
                        {searchQuery && (
                            <ClearButton onClick={handleClearSearch}>
                                ✕
                            </ClearButton>
                        )}
                    </SearchInputWrapper>
                </SearchContainer>
                
                {showSearchResults && (
                    <SearchResults>
                        <ResultsCount>
                            총 {filteredLogs.length}개의 기록에서 "{searchQuery}" 검색 결과
                        </ResultsCount>
                        {filteredLogs.length === 0 && (
                            <NoResults>
                                검색된 결과가 없습니다. 다른 검색어를 입력해보세요.
                            </NoResults>
                        )}
                    </SearchResults>
                )}
            </SearchSection>

            {apiLogs.length === 0 ? (
                <EmptyState>
                    {/* <EmptyIcon>🤖</EmptyIcon> */}
                    <EmptyTitle>AI 루틴 추천을 시작해보세요!</EmptyTitle>
                    <EmptyDescription>
                        개인 맞춤형 운동 루틴을 AI가 추천해드립니다.<br />
                        체형, 목표, 운동 경험을 바탕으로 최적의 루틴을 만들어보세요.
                    </EmptyDescription>
                    <EmptyButton onClick={handleCreateNewRoutine}>
                        ✨ 첫 루틴 만들기
                    </EmptyButton>
                </EmptyState>
            ) : (
                <>
                <LogList>
                    {filteredLogs.map((log) => (
                        <LogItem 
                            key={log.apilog_idx}
                            ref={el => logRefs.current[log.apilog_idx] = el}
                            expanded={expandedLogId === log.apilog_idx}
                        >
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
                                                                    <RoutineDay hasMatch={hasMatchingExercise(routine, searchQuery)}>
                                                                        {searchQuery ? 
                                                                            highlightText(routine.routine_name, searchQuery) : 
                                                                            routine.routine_name
                                                                        }
                                                                    </RoutineDay>
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
                                                                                    <ExerciseName>
                                                                                        {searchQuery ? 
                                                                                            highlightText(exercise.pt_name, searchQuery) : 
                                                                                            exercise.pt_name
                                                                                        }
                                                                                    </ExerciseName>
                                                                                </ExerciseInfo>
                                                                                <ExerciseDetails>
                                                                                    <DetailItem>
                                                                                        <DetailLabel>세트</DetailLabel>
                                                                                        <DetailValue>{exercise.set_num}세트</DetailValue>
                                                                                    </DetailItem>
                                                                                    {exercise.set_count !== 0 && (
                                                                                        <DetailItem>
                                                                                            <DetailLabel>횟수</DetailLabel>
                                                                                            <DetailValue>{exercise.set_count}회</DetailValue>
                                                                                        </DetailItem>
                                                                                    )}
                                                                                    {exercise.set_volume !== 0 && (
                                                                                        <DetailItem>
                                                                                            <DetailLabel>{exercise.set_count !== 0 ? (<>중량</>) : (<>횟수</>)}</DetailLabel>
                                                                                            <DetailValue>{exercise.set_volume} {exercise.set_count !== 0 ? (<>kg</>) : (<>회</>)}</DetailValue>
                                                                                        </DetailItem>
                                                                                    )}
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
                </>
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

  @media (max-width: 768px) {
    padding: 15px;
    max-width: 100%;
  }
`;

const Header = styled.div`
  margin-bottom: 30px;

  @media (max-width: 768px) {
    margin-bottom: 20px;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;

  @media (max-width: 768px) {
    gap: 15px;
  }
`;

const HeaderText = styled.div`
  flex: 1;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const CreateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--primary-blue);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 25px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(74, 144, 226, 0.3);

  &:hover {
    background: var(--primary-blue-hover);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(74, 144, 226, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    padding: 14px 20px;
    font-size: 16px;
  }
`;

const PlusIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  font-size: 16px;
  font-weight: 700;

  @media (max-width: 768px) {
    width: 22px;
    height: 22px;
    font-size: 18px;
  }
`;

const ButtonText = styled.span`
  font-size : 16px;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const UsageSection = styled.div`
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 16px;
  margin-top: 20px;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--primary-blue);
    box-shadow: 0 2px 8px rgba(74, 144, 226, 0.1);
  }

  @media (max-width: 768px) {
    margin-top: 15px;
    padding: 14px;
  }
`;

const UsageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  @media (max-width: 768px) {
    margin-bottom: 10px;
  }
`;

const UsageLabel = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);

  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const UsagePercentage = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: var(--primary-blue);

  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const UsageBarContainer = styled.div`
  width: 100%;
  height: 6px;
  background: var(--bg-tertiary);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
`;

const UsageBarFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, var(--primary-blue), var(--primary-blue-light));
  border-radius: 3px;
  transition: width 0.3s ease;
  width: ${props => Math.min(100, props.$percentage || 0)}%;
  box-shadow: 0 0 8px rgba(74, 144, 226, 0.3);
`;

const UsageInfo = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
  text-align: center;

  @media (max-width: 768px) {
    font-size: 11px;
  }
`;

// 검색 관련 스타일 컴포넌트
const SearchSection = styled.div`
  margin-bottom: 25px;
  
  @media (max-width: 768px) {
    margin-bottom: 20px;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
`;

const SearchInputWrapper = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 15px;
  font-size: 16px;
  color: var(--text-tertiary);
  z-index: 1;

  @media (max-width: 768px) {
    left: 12px;
    font-size: 14px;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 14px 50px 14px 45px;
  font-size: 16px;
  background: var(--bg-secondary);
  border: 2px solid var(--border-light);
  border-radius: 25px;
  color: var(--text-primary);
  transition: all 0.2s ease;

  &:focus {
    border-color: var(--primary-blue);
    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
  }

  &::placeholder {
    color: var(--text-tertiary);
  }

  @media (max-width: 768px) {
    padding: 12px 45px 12px 40px;
    font-size: 14px;
  }
`;

const ClearButton = styled.button`
  position: absolute;
  right: 15px;
  background: var(--text-tertiary);
  color: var(--bg-primary);
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--text-secondary);
    transform: scale(1.1);
  }

  @media (max-width: 768px) {
    right: 12px;
    width: 18px;
    height: 18px;
    font-size: 10px;
  }
`;

const SearchResults = styled.div`
  text-align: center;
`;

const ResultsCount = styled.div`
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 10px;
  padding: 8px 16px;
  background: var(--bg-secondary);
  border-radius: 20px;
  display: inline-block;

  @media (max-width: 768px) {
    font-size: 12px;
    padding: 6px 12px;
  }
`;

const NoResults = styled.div`
  font-size: 14px;
  color: var(--text-tertiary);
  padding: 20px;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 12px;
    padding: 15px;
  }
`;

const HighlightText = styled.span`
  color: var(--primary-blue);
  font-weight: 700;
  font-size : inherit;
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

  @media (max-width: 750px) {
    font-size: 14px;
  }
  @media (max-width: 420px) {
    font-size: 12px;
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
  line-height: 1.6;
  margin-bottom: 30px;

  @media (max-width: 768px) {
    font-size: 14px;
    margin-bottom: 25px;
  }
`;

const EmptyButton = styled.button`
  background: var(--primary-blue);
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);

  &:hover {
    background: var(--primary-blue-hover);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(74, 144, 226, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    width: 100%;
    max-width: 280px;
    padding: 16px 32px;
    font-size: 17px;
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
  border: 2px solid ${props => props.expanded ? 'var(--primary-blue)' : 'var(--border-light)'};
  overflow: hidden;
  transition: all 0.2s ease;
  box-shadow: ${props => props.expanded ? '0 0 0 3px rgba(74, 144, 226, 0.1)' : 'none'};

  &:hover {
    box-shadow: ${props => props.expanded ? '0 0 0 3px rgba(74, 144, 226, 0.1)' : '0 4px 12px rgba(0, 0, 0, 0.15)'};
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
  color: ${props => props.hasMatch ? 'var(--primary-blue)' : 'var(--text-primary)'};
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

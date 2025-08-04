import React, { useState } from 'react';
import styled from 'styled-components';
import { getSimilarNamesByMap } from '../../../utils/KorUtil';
import {
    WorkoutResultContainer,
    ResultSummary,
    SummaryGrid,
    SummaryItem,
    SummaryIcon,
    SummaryLabel,
    SummaryValue,
    MuscleGroupContainer,
    ResultLabel,
    MuscleGroupList,
    MuscleGroupTag,
    RoutinesContainer,
    RoutineCard,
    RoutineCardHeader,
    RoutineCardTitle,
    RoutineCardBadge,
    ExerciseList,
    ExerciseCard,
    ExerciseCardIcon,
    ExerciseCardContent,
    ExerciseCardName,
    ExerciseCardDetails,
    DetailChip,
    ExerciseDescription,
    InvalidBadge,
    EmptyExerciseMessage,
    ExerciseRequestList,
    ExerciseRequestItem,
    ExerciseDetail
} from '../../../styles/chartStyle';
import versionUtils from '../../../utils/utilFunc';
import AiUtil from '../../../utils/AiUtils';
import { FaDownload } from 'react-icons/fa';
import { SAVED_AFTER } from '../../../reducers/type';

// 로그 상세 모달 컴포넌트
const LogDetailModal = ({
    log,
    isOpen,
    onClose,
    onNavigate,
    navigationInfo,
    rawData,
    rawDataIdx,
    rawDataMap,
    memberType
}) => {
    console.log('지금 니가 보고 있는 로그 : ', log);

    // 루틴 추천 결과 저장하기
    const handleSaveResult = async (e) => {
        const ask = window.confirm('해당 루틴을 저장하시겠습니까?');

        if (!ask) return;

        console.log('click');
        
        const result = {content : log.parsed_response, logIdx : log.apilog_idx}
        try {
            const response1 = await AiUtil.saveResult(result, rawDataIdx, rawDataMap);
            const response2 = await AiUtil.updateLogUserAction({apilog_idx : log.apilog_idx, apilog_user_action : SAVED_AFTER});
            alert('저장이 완료됐습니다!');
        } catch (error) {
            alert('결과물을 저장하지 못했습니다 ! ')
        }
    }
    

    // 토글 상태 관리
    const [isBasicInfoExpanded, setIsBasicInfoExpanded] = useState(false);
    const [isUserInfoExpanded, setIsUserInfoExpanded] = useState(false);
    const [isUserInputExpanded, setIsUserInputExpanded] = useState(false);
    const [isAiResponseExpanded, setIsAiResponseExpanded] = useState(false);

    if (!isOpen || !log) return null;

    // 상태별 아이콘과 색상
    const getStatusInfo = (status) => {
        switch (status) {
            case 'success':
                return { icon: '✅', color: '#10b981', text: '성공' };
            case 'error':
                return { icon: '❌', color: '#ef4444', text: '오류' };
            case 'exception':
                return { icon: '⚠️', color: '#f59e0b', text: '예외' };
            default:
                return { icon: '❓', color: '#6b7280', text: '알 수 없음' };
        }
    };

    // JSON 포맷팅
    const formatJson = (jsonString) => {
        try {
            const parsed = JSON.parse(jsonString);
            return JSON.stringify(parsed, null, 2);
        } catch {
            return jsonString;
        }
    };

    // 운동명 유사도 매칭 정보 (rawData 우선, rawDataMap 보조)
    const getSimilarExercises = (userInput) => {
        if (!userInput) return null;

        try {
            let exerciseNames = [];
            // userInput이 문자열인 경우 JSON 파싱 시도
            if (typeof userInput === 'string') {                
                const parsed = JSON.parse(userInput);
                // 다양한 구조에서 운동명 추출
                if (Array.isArray(parsed)) {
                    // 루틴 배열인 경우
                    exerciseNames = parsed.flatMap(routine => 
                        routine.exercises?.map(ex => ex.pt_name || ex.name || ex.exercise_name) || []
                    ).filter(Boolean);
                } else if (parsed.exercises && Array.isArray(parsed.exercises)) {
                    // 단일 루틴인 경우
                    exerciseNames = parsed.exercises.map(ex => ex.pt_name || ex.name || ex.exercise_name).filter(Boolean);
                } else if (Array.isArray(parsed.exercises)) {
                    // exercises 배열인 경우
                    exerciseNames = parsed.exercises.map(ex => ex.name || ex.pt_name || ex.exercise_name).filter(Boolean);
                }
            } else if (Array.isArray(userInput)) {
                // 이미 파싱된 루틴 배열인 경우
                exerciseNames = userInput.flatMap(routine => 
                    routine.exercises?.map(ex => ex.pt_name || ex.name || ex.exercise_name) || []
                ).filter(Boolean);
            }

            if (exerciseNames.length === 0) return null;

            return exerciseNames.map(name => {
                // 1단계: rawData에서 정확한 매칭 검사 (공백 제거 후 비교)
                const normalizedName = name.replace(/\s+/g, '');
                let exactMatch = null;
                
                if (rawData && Array.isArray(rawData)) {
                    exactMatch = rawData.find(item => 
                        item.replace(/\s+/g, '') === normalizedName
                    );
                }

                if (exactMatch) {
                    return {
                        original: name,
                        matched: exactMatch,
                        isValid: true,
                        score: 0, // 정확한 매칭이므로 점수 0
                        matchType: 'exact', // 매칭 유형 추가
                        allMatches: [{ name: exactMatch, score: 0 }] // 디버깅용
                    };
                }

                // 2단계: rawDataMap을 사용한 유사도 매칭
                if (rawDataMap) {
                    const similarResults = getSimilarNamesByMap(name, rawDataMap, 1, 2);
                    
                    // 가장 유사한 결과 선택 (점수가 가장 낮은 것)
                    const bestMatch = similarResults.length > 0 && similarResults[0].name !== '유사 운동명 찾지 못함' 
                        ? similarResults[0] 
                        : null;

                    return {
                        original: name,
                        matched: bestMatch?.name || null,
                        isValid: !!bestMatch,
                        score: bestMatch?.score || null,
                        matchType: bestMatch ? 'similar' : 'none', // 매칭 유형 추가
                        allMatches: similarResults // 디버깅용
                    };
                }

                // 3단계: 매칭 실패
                return {
                    original: name,
                    matched: null,
                    isValid: false,
                    score: null,
                    matchType: 'none',
                    allMatches: []
                };
            });
        } catch (error) {
            console.log('getSimilarExercises parsing error:', error);
            return null;
        }
    };

    // isSplit 여부를 확인 후 없다면 isSplit 계산
    if (log.parsed_userMassage && log.parsed_userMassage.isSplit === undefined && Number(log.parsed_response.length) === Number(log.parsed_userMassage.split)) {
        log.parsed_userMassage.isSplit = true; // isSplit이 없으면 split과 동일한 길이로 설정
    }

    // 사용자 정보 파싱 (log 구조에 맞게 개선)
    const parseUserInfo = (userInput) => {
        // 이미 파싱된 사용자 정보가 있으면 우선 사용
        if (log.parsed_userMassage) {
            return {
                userId: log.parsed_userMassage.name || null,
                name: log.parsed_userMassage.name || null,
                age: log.parsed_userMassage.age || null,
                gender: log.parsed_userMassage.gender || null,
                height: log.parsed_userMassage.height || null,
                weight: log.parsed_userMassage.weight || null,
                bmi: log.parsed_userMassage.bmi || null,
                fat: log.parsed_userMassage.fat || null,
                fat_percentage: log.parsed_userMassage.fat_percentage || null,
                skeletal_muscle: log.parsed_userMassage.skeletal_muscle || null,
                purpose: log.parsed_userMassage.purpose || null,
                goal: log.parsed_userMassage.purpose || log.parsed_userMassage.goal || null,
                split: Number(log.parsed_userMassage.split) || null,
                isSplit: log.parsed_userMassage.isSplit || false,
                disease: log.parsed_userMassage.disease || null,
                day: log.parsed_userMassage.day || null,
                time: log.parsed_userMassage.time || null,
                rawData: log.parsed_userMassage // 디버깅용
            };
        }

        // 파싱된 정보가 없으면 기존 방식으로 파싱
        if (!userInput) return null;

        try {
            const parsed = JSON.parse(userInput);

            // 다양한 가능한 구조들을 확인
            const exercises = parsed.exercises || parsed.exercise_list || parsed.workouts || [];
            const userId = parsed.userId || parsed.user_id || parsed.id || parsed.name || null;
            const goal = parsed.goal || parsed.target || parsed.objective || parsed.purpose || null;
            const preferences = parsed.userPreferences || parsed.preferences || parsed.settings || null;

            // 운동 목록이 있거나 다른 유용한 정보가 있으면 반환
            if (exercises.length > 0 || userId || goal || preferences) {
                return {
                    userId,
                    exercises,
                    goal,
                    userPreferences: preferences,
                    rawData: parsed // 디버깅용
                };
            }
        } catch (error) {
            console.log('User input parsing error:', error);
        }
        return null;
    };

    // 운동 결과 파싱 (AItest.jsx 구조 기반으로 개선)
    const parseWorkoutResult = (aiResponse) => {
        // log.parsed_response가 있으면 우선 사용
        if (log.parsed_response) {
            try {
                let routineArray = null;

                // parsed_response가 이미 파싱된 객체인 경우
                if (typeof log.parsed_response === 'object') {
                    if (Array.isArray(log.parsed_response)) {
                        routineArray = log.parsed_response;
                    } else if (Array.isArray(log.parsed_response.content)) {
                        routineArray = log.parsed_response.content;
                    } else if (Array.isArray(log.parsed_response.routines)) {
                        routineArray = log.parsed_response.routines;
                    } else if (Array.isArray(log.parsed_response.exercises)) {
                        routineArray = [{
                            routine_name: log.parsed_response.routineName || "운동 루틴",
                            exercises: log.parsed_response.exercises
                        }];
                    }
                } else {
                    // 문자열인 경우 JSON 파싱 시도
                    const parsed = JSON.parse(log.parsed_response);
                    if (Array.isArray(parsed)) {
                        routineArray = parsed;
                    } else if (Array.isArray(parsed.content)) {
                        routineArray = parsed.content;
                    } else if (Array.isArray(parsed.routines)) {
                        routineArray = parsed.routines;
                    } else if (Array.isArray(parsed.exercises)) {
                        routineArray = [{
                            routine_name: parsed.routineName || parsed.routine_name || "운동 루틴",
                            exercises: parsed.exercises
                        }];
                    }
                }

                if (routineArray && routineArray.length > 0) {
                    return processWorkoutResult(routineArray);
                }
            } catch (error) {
                console.log('Parsed response processing error:', error);
            }
        }

        // parsed_response가 없거나 파싱 실패시 기존 방식 사용
        if (!aiResponse) return null;

        try {
            const parsed = JSON.parse(aiResponse);

            // AItest에서 사용하는 구조: result.content (배열)
            let routineArray = null;

            // 다양한 구조 확인 (AItest.jsx와 동일한 방식)
            if (Array.isArray(parsed)) {
                routineArray = parsed;
            } else if (Array.isArray(parsed.content)) {
                routineArray = parsed.content;
            } else if (Array.isArray(parsed.routines)) {
                routineArray = parsed.routines;
            } else if (Array.isArray(parsed.exercises)) {
                // 단일 루틴인 경우
                routineArray = [{
                    routine_name: parsed.routineName || parsed.routine_name || "운동 루틴",
                    exercises: parsed.exercises
                }];
            }

            if (!routineArray || routineArray.length === 0) return null;

            return processWorkoutResult(routineArray);
        } catch (error) {
            console.log('AI response parsing error:', error);
        }
        return null;
    };

    // 운동 결과 처리 공통 로직
    const processWorkoutResult = (routineArray) => {
        // 총 운동 수 계산
        const totalExercises = routineArray.reduce((sum, routine) =>
            sum + (routine.exercises?.length || 0), 0
        );

        // 근육군 추출 (운동명에서 유추 - AItest.jsx와 유사한 방식)
        const muscleGroups = [...new Set(
            routineArray.flatMap(routine =>
                routine.exercises?.map(ex => {
                    const name = (ex.pt_name || ex.name || ex.exercise_name || '').toLowerCase();
                    // 한국어 근육군 매핑 (AItest.jsx 참고)
                    if (name.includes('가슴') || name.includes('벤치') || name.includes('chest')) return '가슴';
                    if (name.includes('등') || name.includes('풀업') || name.includes('로우') || name.includes('back')) return '등';
                    if (name.includes('다리') || name.includes('스쿼트') || name.includes('런지') || name.includes('leg')) return '다리';
                    if (name.includes('어깨') || name.includes('숄더') || name.includes('shoulder')) return '어깨';
                    if (name.includes('팔') || name.includes('컬') || name.includes('arm') || name.includes('bicep') || name.includes('tricep')) return '팔';
                    if (name.includes('복근') || name.includes('코어') || name.includes('ab') || name.includes('core')) return '복근';
                    return null;
                }).filter(Boolean) || []
            )
        )];

        // 운동별 유효성 검사 정보 추가 (rawData 우선, rawDataMap 보조)
        const exerciseValidation = routineArray.map(routine => ({
            ...routine,
            exercises: routine.exercises?.map(ex => {
                const exerciseName = ex.pt_name || ex.name || ex.exercise_name || '';
                
                // 1단계: rawData에서 정확한 매칭 검사 (공백 제거 후 비교)
                const normalizedName = exerciseName.replace(/\s+/g, '');
                let isValid = false;
                let matchedName = null;
                let matchScore = null;
                let matchType = 'none';
                
                if (rawData && Array.isArray(rawData) && exerciseName) {
                    const exactMatch = rawData.find(item => 
                        item.replace(/\s+/g, '') === normalizedName
                    );
                    
                    if (exactMatch) {
                        isValid = true;
                        matchedName = exactMatch;
                        matchScore = 0; // 정확한 매칭이므로 점수 0
                        matchType = 'exact';
                    }
                }
                
                // 2단계: 정확한 매칭 실패시 rawDataMap으로 유사도 검사
                if (!isValid && rawDataMap && exerciseName) {
                    const similarResults = getSimilarNamesByMap(exerciseName, rawDataMap, 1, 2);
                    const bestMatch = similarResults.length > 0 && similarResults[0].name !== '유사 운동명 찾지 못함' 
                        ? similarResults[0] 
                        : null;
                    
                    if (bestMatch) {
                        isValid = true;
                        matchedName = bestMatch.name;
                        matchScore = bestMatch.score;
                        matchType = 'similar';
                    }
                }
                
                // 3단계: 모든 매칭 실패시 또는 데이터가 없는 경우
                if (!isValid && !rawData && !rawDataMap) {
                    // 데이터가 없으면 기본적으로 유효한 것으로 처리
                    isValid = true;
                    matchType = 'default';
                }

                return {
                    ...ex,
                    isValid,
                    matchedName,
                    matchScore,
                    matchType,
                    normalizedName
                };
            }) || []
        }));

        // 유효하지 않은 운동들의 개수 계산
        const invalidExerciseCount = exerciseValidation.reduce((count, routine) =>
            count + (routine.exercises?.filter(ex => !ex.isValid).length || 0), 0
        );

        return {
            routines: exerciseValidation,
            totalRoutines: routineArray.length,
            totalExercises,
            muscleGroups,
            invalidExerciseCount,
            validationRatio: totalExercises > 0 ? ((totalExercises - invalidExerciseCount) / totalExercises * 100).toFixed(1) : 100,
            rawData: routineArray // 디버깅용
        };
    };

    const statusInfo = getStatusInfo(log.apilog_status);
    const userInfo = parseUserInfo(log.parsed_userMassage);
    const workoutResult = parseWorkoutResult(log.parsed_response);

    // AI 응답에서 운동명 매칭 정보 추출 (log.parsed_response 우선, 없으면 log.apilog_response 사용)
    const similarExercises = getSimilarExercises(log.parsed_response || log.apilog_response);

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContainer onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                    <HeaderContent>
                        <StatusIndicator color={statusInfo.color}>
                            {statusInfo.icon} {statusInfo.text}
                        </StatusIndicator>
                        <LogId>#{log.apilog_idx}</LogId>
                    </HeaderContent>
                    <CloseButton onClick={onClose}>✕</CloseButton>
                </ModalHeader>

                {/* 네비게이션 */}
                {navigationInfo && (
                    <NavigationBar>
                        <NavButton
                            onClick={() => onNavigate?.(-1)}
                            disabled={navigationInfo.currentIndex === 0}
                        >
                            ← 이전
                        </NavButton>
                        <NavInfo>
                            {navigationInfo.currentIndex + 1} / {navigationInfo.total}
                        </NavInfo>
                        <NavButton
                            onClick={() => onNavigate?.(1)}
                            disabled={navigationInfo.currentIndex === navigationInfo.total - 1}
                        >
                            다음 →
                        </NavButton>
                    </NavigationBar>
                )}

                <ModalBody>
                    {/* 기본 정보 */}
                    {memberType === 'admin' ? (
                        <Section>
                            <ToggleSection>
                                <ToggleSectionTitle 
                                    onClick={() => setIsBasicInfoExpanded(!isBasicInfoExpanded)}
                                    expanded={isBasicInfoExpanded}
                                >
                                    <ToggleIcon expanded={isBasicInfoExpanded}>▶</ToggleIcon>
                                    📋 기본 정보
                                </ToggleSectionTitle>
                                <CollapsibleContent expanded={isBasicInfoExpanded}>
                                    <InfoGrid>
                                        <InfoItem>
                                            <InfoLabel>요청 시간</InfoLabel>
                                            <InfoValue>
                                                {new Date(log.apilog_response_time).toLocaleString('ko-KR')}
                                            </InfoValue>
                                        </InfoItem>
                                        <InfoItem>
                                            <InfoLabel>모델</InfoLabel>
                                            <InfoValue>{log.apilog_model || '-'}</InfoValue>
                                        </InfoItem>
                                        <InfoItem>
                                            <InfoLabel>서비스 타입</InfoLabel>
                                            <InfoValue>{log.apilog_service_type || '-'}</InfoValue>
                                        </InfoItem>
                                        <InfoItem>
                                            <InfoLabel>버전</InfoLabel>
                                            <InfoValue>v{log.apilog_version || '-'}</InfoValue>
                                        </InfoItem>
                                        <InfoItem>
                                            <InfoLabel>응답 속도</InfoLabel>
                                            <InfoValue>
                                                {log.apilog_total_time}초
                                            </InfoValue>
                                        </InfoItem>
                                        {log.apilog_total_time && (
                                            <InfoItem>
                                                <InfoLabel>총 처리 시간</InfoLabel>
                                                <InfoValue>{log.apilog_total_time.toFixed(3)}초</InfoValue>
                                            </InfoItem>
                                        )}
                                        <InfoItem>
                                            <InfoLabel>입력 토큰</InfoLabel>
                                            <InfoValue>{log.apilog_input_tokens?.toLocaleString() || '-'}</InfoValue>
                                        </InfoItem>
                                        <InfoItem>
                                            <InfoLabel>출력 토큰</InfoLabel>
                                            <InfoValue>{log.apilog_output_tokens?.toLocaleString() || '-'}</InfoValue>
                                        </InfoItem>
                                        <InfoItem>
                                            <InfoLabel>사용자 ID</InfoLabel>
                                            <InfoValue>{log.user_id || '-'}</InfoValue>
                                        </InfoItem>
                                    </InfoGrid>
                                </CollapsibleContent>
                            </ToggleSection>
                        </Section>) : (<></>)}

                    {/* 사용자 정보 및 요청 섹션 */}
                    {userInfo && (
                        <Section>
                            <ToggleSection>
                                <ToggleSectionTitle 
                                    onClick={() => setIsUserInfoExpanded(!isUserInfoExpanded)}
                                    expanded={isUserInfoExpanded}
                                >
                                    <ToggleIcon expanded={isUserInfoExpanded}>▶</ToggleIcon>
                                    👤 사용자 정보 및 요청
                                </ToggleSectionTitle>
                                <CollapsibleContent expanded={isUserInfoExpanded}>
                                    <InfoGrid>
                                        <InfoItem>
                                            <InfoLabel>사용자 이름</InfoLabel>
                                            <InfoValue>{userInfo.name || userInfo.userId || log.user_id || '-'}</InfoValue>
                                        </InfoItem>
                                        {userInfo.age && (
                                            <InfoItem>
                                                <InfoLabel>나이</InfoLabel>
                                                <InfoValue>{userInfo.age}세</InfoValue>
                                            </InfoItem>
                                        )}
                                        {userInfo.gender && (
                                            <InfoItem>
                                                <InfoLabel>성별</InfoLabel>
                                                <InfoValue>{userInfo.gender}</InfoValue>
                                            </InfoItem>
                                        )}
                                        {userInfo.height && (
                                            <InfoItem>
                                                <InfoLabel>신장</InfoLabel>
                                                <InfoValue>{userInfo.height}cm</InfoValue>
                                            </InfoItem>
                                        )}
                                        {userInfo.weight && (
                                            <InfoItem>
                                                <InfoLabel>체중</InfoLabel>
                                                <InfoValue>{userInfo.weight}kg</InfoValue>
                                            </InfoItem>
                                        )}
                                        {userInfo.bmi && (
                                            <InfoItem>
                                                <InfoLabel>BMI</InfoLabel>
                                                <InfoValue>{userInfo.bmi}</InfoValue>
                                            </InfoItem>
                                        )}
                                        {userInfo.fat && (
                                            <InfoItem>
                                                <InfoLabel>체지방량</InfoLabel>
                                                <InfoValue>{userInfo.fat}kg</InfoValue>
                                            </InfoItem>
                                        )}
                                        {userInfo.fat_percentage && (
                                            <InfoItem>
                                                <InfoLabel>체지방률</InfoLabel>
                                                <InfoValue>{userInfo.fat_percentage}%</InfoValue>
                                            </InfoItem>
                                        )}
                                        {userInfo.skeletal_muscle && (
                                            <InfoItem>
                                                <InfoLabel>골격근량</InfoLabel>
                                                <InfoValue>{userInfo.skeletal_muscle}kg</InfoValue>
                                            </InfoItem>
                                        )}
                                        {(userInfo.goal || userInfo.purpose) && (
                                            <InfoItem>
                                                <InfoLabel>운동 목표</InfoLabel>
                                                <InfoValue>{userInfo.goal || userInfo.purpose}</InfoValue>
                                            </InfoItem>
                                        )}
                                        {userInfo.split && (
                                            <InfoItem>
                                                <InfoLabel>분할 루틴</InfoLabel>
                                                <InfoValue>
                                                    {userInfo.split}분할 
                                                    {userInfo.isSplit !== undefined && (
                                                        <span style={{ marginLeft: '8px' }}>
                                                            {userInfo.isSplit ? '✅ 적용' : '❌ 미적용'}
                                                        </span>
                                                    )}
                                                </InfoValue>
                                            </InfoItem>
                                        )}
                                        {userInfo.disease && (
                                            <InfoItem>
                                                <InfoLabel>질병/부상</InfoLabel>
                                                <InfoValue>{userInfo.disease}</InfoValue>
                                            </InfoItem>
                                        )}
                                        {userInfo.day && (
                                            <InfoItem>
                                                <InfoLabel>요청 요일</InfoLabel>
                                                <InfoValue>{userInfo.day}</InfoValue>
                                            </InfoItem>
                                        )}
                                        {userInfo.time && (
                                            <InfoItem>
                                                <InfoLabel>운동 시간</InfoLabel>
                                                <InfoValue>{userInfo.time}</InfoValue>
                                            </InfoItem>
                                        )}
                                        {userInfo.exercises && userInfo.exercises.length > 0 && (
                                            <InfoItem style={{ gridColumn: '1 / -1' }}>
                                                <InfoLabel>요청 운동</InfoLabel>
                                                <ExerciseRequestList>
                                                    {userInfo.exercises.map((exercise, index) => (
                                                        <ExerciseRequestItem key={index}>
                                                            <ExerciseCardName>{exercise.name || exercise}</ExerciseCardName>
                                                            {exercise.sets && <ExerciseDetail>세트: {exercise.sets}</ExerciseDetail>}
                                                            {exercise.reps && <ExerciseDetail>횟수: {exercise.reps}</ExerciseDetail>}
                                                            {exercise.weight && <ExerciseDetail>무게: {exercise.weight}kg</ExerciseDetail>}
                                                        </ExerciseRequestItem>
                                                    ))}
                                                </ExerciseRequestList>
                                            </InfoItem>
                                        )}
                                        {userInfo.userPreferences && (
                                            <InfoItem style={{ gridColumn: '1 / -1' }}>
                                                <InfoLabel>사용자 선호도</InfoLabel>
                                                <InfoValue>
                                                    <pre>{JSON.stringify(userInfo.userPreferences, null, 2)}</pre>
                                                </InfoValue>
                                            </InfoItem>
                                        )}
                                    </InfoGrid>
                                </CollapsibleContent>
                            </ToggleSection>
                        </Section>
                    )}

                    {/* 운동 결과 섹션 */}
                    {workoutResult && (
                        <Section>
                            <SectionTitle>🏋️‍♀️ AI 루틴 추천 결과</SectionTitle>
                            <WorkoutResultContainer>
                                {/* 루틴 요약 정보 */}
                                <ResultSummary>
                                    <SummaryGrid>
                                        <SummaryItem>
                                            <SummaryIcon>📊</SummaryIcon>
                                            <SummaryLabel>총 루틴 수</SummaryLabel>
                                            <SummaryValue>{workoutResult.totalRoutines}개</SummaryValue>
                                        </SummaryItem>
                                        <SummaryItem>
                                            <SummaryIcon>🏋️</SummaryIcon>
                                            <SummaryLabel>총 운동 수</SummaryLabel>
                                            <SummaryValue>{workoutResult.totalExercises}개</SummaryValue>
                                        </SummaryItem>
                                        {/* 운동명 유효성 검사 결과 추가 (AItest.jsx 방식) */}
                                        {workoutResult.invalidExerciseCount !== undefined && (
                                            <SummaryItem>
                                                <SummaryIcon>✅</SummaryIcon>
                                                <SummaryLabel>유효성 검사</SummaryLabel>
                                                <SummaryValue>{workoutResult.validationRatio}%</SummaryValue>
                                            </SummaryItem>
                                        )}
                                        {workoutResult.invalidExerciseCount > 0 && (
                                            <SummaryItem>
                                                <SummaryIcon>⚠️</SummaryIcon>
                                                <SummaryLabel>유효하지 않은 운동</SummaryLabel>
                                                <SummaryValue>{workoutResult.invalidExerciseCount}개</SummaryValue>
                                            </SummaryItem>
                                        )}
                                    </SummaryGrid>
                                </ResultSummary>

                                {/* 타겟 근육군 */}
                                {workoutResult.muscleGroups && workoutResult.muscleGroups.length > 0 && (
                                    <MuscleGroupContainer>
                                        <ResultLabel>🎯 타겟 근육군</ResultLabel>
                                        <MuscleGroupList>
                                            {workoutResult.muscleGroups.map((muscle, index) => (
                                                <MuscleGroupTag key={index}>{muscle}</MuscleGroupTag>
                                            ))}
                                            <DownloadIcon onClick={() => handleSaveResult()}><FaDownload size={15} color='var(--primary-blue)'/></DownloadIcon>
                                        </MuscleGroupList>
                                    </MuscleGroupContainer>
                                )}

                                {/* 루틴별 상세 정보 */}
                                <RoutinesContainer>
                                    <ResultLabel>📋 루틴 상세</ResultLabel>
                                    {workoutResult.routines.map((routine, routineIndex) => (
                                        <RoutineCard key={routineIndex}>
                                            <RoutineCardHeader>
                                                <RoutineCardTitle>
                                                    🏋️ {routine.routine_name || `루틴 ${routineIndex + 1}`}
                                                </RoutineCardTitle>
                                                <RoutineCardBadge>
                                                    {routine.exercises?.length || 0}개 운동
                                                </RoutineCardBadge>
                                            </RoutineCardHeader>

                                            {routine.exercises && routine.exercises.length > 0 ? (
                                                <ExerciseList>
                                                    {routine.exercises.map((exercise, exerciseIndex) => {
                                                        // 개선된 파싱에서 추가된 유효성 정보 사용
                                                        const isValid = exercise.isValid !== undefined ? exercise.isValid : true;
                                                        const exerciseName = exercise.pt_name || exercise.name || exercise.exercise_name || '';

                                                        return (
                                                            <ExerciseCard key={exerciseIndex} isValid={isValid}>
                                                                <ExerciseCardIcon>
                                                                    {isValid ? '✅' : '❌'}
                                                                </ExerciseCardIcon>
                                                                <ExerciseCardContent>
                                                                    <ExerciseCardName isValid={isValid}>
                                                                        <span style={{fontSize: '1.2em'}}>{exerciseName}</span>
                                                                        {!isValid && memberType === 'admin' && (
                                                                            <InvalidBadge>
                                                                                유효하지 않은 운동명
                                                                                {exercise.matchScore !== null && (
                                                                                    <span style={{ fontSize: '10px', marginLeft: '4px' }}>
                                                                                        (점수: {exercise.matchScore})
                                                                                    </span>
                                                                                )}
                                                                            </InvalidBadge>
                                                                        )}
                                                                        {isValid && exercise.matchedName && exercise.matchedName !== exerciseName && memberType === 'admin' &&  (
                                                                            <span style={{ 
                                                                                fontSize: '11px', 
                                                                                color: exercise.matchType === 'exact' ? '#059669' : '#0369a1', 
                                                                                marginLeft: '8px',
                                                                                fontStyle: 'italic'
                                                                            }}>
                                                                                → {exercise.matchedName}
                                                                                {exercise.matchScore !== null && ` (점수: ${exercise.matchScore})`}
                                                                                <span style={{
                                                                                    fontSize: '9px',
                                                                                    backgroundColor: exercise.matchType === 'exact' ? '#10b981' : '#0284c7',
                                                                                    color: 'white',
                                                                                    padding: '1px 4px',
                                                                                    borderRadius: '3px',
                                                                                    marginLeft: '4px'
                                                                                }}>
                                                                                    {exercise.matchType === 'exact' ? '정확' : exercise.matchType === 'similar' ? '유사' : '기본'}
                                                                                </span>
                                                                            </span>
                                                                        )}
                                                                        {isValid && exercise.matchType === 'exact' && exercise.matchedName === exerciseName && memberType === 'admin' && (
                                                                            <span style={{
                                                                                fontSize: '9px',
                                                                                backgroundColor: '#10b981',
                                                                                color: 'white',
                                                                                padding: '1px 4px',
                                                                                borderRadius: '3px',
                                                                                marginLeft: '8px'
                                                                            }}>
                                                                                정확 매칭
                                                                            </span>
                                                                        )}
                                                                    </ExerciseCardName>
                                                                    <ExerciseCardDetails>
                                                                        {/* AItest.jsx 방식의 운동 상세 정보 표시 */}
                                                                        {exercise.set_volume && exercise.set_count && exercise.set_num && (
                                                                            <DetailChip>
                                                                                {exercise.set_volume}kg × {exercise.set_count}회 × {exercise.set_num}세트
                                                                            </DetailChip>
                                                                        )}
                                                                        {exercise.set_volume && !exercise.set_count && <DetailChip>무게: {exercise.set_volume}kg</DetailChip>}
                                                                        {exercise.set_count && !exercise.set_volume && <DetailChip>횟수: {exercise.set_count}회</DetailChip>}
                                                                        {exercise.set_num && !exercise.set_volume && <DetailChip>세트: {exercise.set_num}세트</DetailChip>}
                                                                        {exercise.reps && <DetailChip>횟수: {exercise.reps}회</DetailChip>}
                                                                        {exercise.sets && <DetailChip>세트: {exercise.sets}세트</DetailChip>}
                                                                        {exercise.weight && <DetailChip>무게: {exercise.weight}kg</DetailChip>}
                                                                        {exercise.duration && <DetailChip>시간: {exercise.duration}초</DetailChip>}
                                                                        {exercise.rest && <DetailChip>휴식: {exercise.rest}초</DetailChip>}
                                                                    </ExerciseCardDetails>
                                                                    {exercise.description && (
                                                                        <ExerciseDescription>{exercise.description}</ExerciseDescription>
                                                                    )}
                                                                </ExerciseCardContent>
                                                            </ExerciseCard>
                                                        );
                                                    })}
                                                </ExerciseList>
                                            ) : (
                                                <EmptyExerciseMessage>이 루틴에는 운동이 없습니다.</EmptyExerciseMessage>
                                            )}
                                        </RoutineCard>
                                    ))}
                                </RoutinesContainer>
                            </WorkoutResultContainer>
                        </Section>
                    )}


                    {/* 사용자 입력 */}
                    {log.apilog_prompt && memberType === 'admin' && (
                        <Section>
                            <ToggleSection>
                                <ToggleSectionTitle 
                                    onClick={() => setIsUserInputExpanded(!isUserInputExpanded)}
                                    expanded={isUserInputExpanded}
                                >
                                    <ToggleIcon expanded={isUserInputExpanded}>▶</ToggleIcon>
                                    📝 사용자 입력 (원본)
                                </ToggleSectionTitle>
                                <CollapsibleContent expanded={isUserInputExpanded}>
                                    <CodeBlock>
                                        <pre>{formatJson(log.apilog_prompt)}</pre>
                                    </CodeBlock>
                                </CollapsibleContent>
                            </ToggleSection>
                        </Section>
                    )}

                    {/* AI 응답 */}
                    {log.apilog_response && memberType === 'admin' && (
                        <Section>
                            <ToggleSection>
                                <ToggleSectionTitle 
                                    onClick={() => setIsAiResponseExpanded(!isAiResponseExpanded)}
                                    expanded={isAiResponseExpanded}
                                >
                                    <ToggleIcon expanded={isAiResponseExpanded}>▶</ToggleIcon>
                                    🤖 AI 응답 (원본)
                                </ToggleSectionTitle>
                                <CollapsibleContent expanded={isAiResponseExpanded}>
                                    <CodeBlock>
                                        <pre>{formatJson(log.apilog_response)}</pre>
                                    </CodeBlock>
                                </CollapsibleContent>
                            </ToggleSection>
                        </Section>
                    )}

                    {/* 사용자 피드백 */}
                    {log.apilog_feedback && (
                        <Section>
                            <SectionTitle>💬 사용자 피드백</SectionTitle>
                            <FeedbackContainer>
                                <FeedbackType feedback={log.apilog_feedback}>
                                    {log.apilog_feedback === 'LIKE' ? '👍 좋아요' : '👎 싫어요'}
                                </FeedbackType>
                                {log.apilog_feedback_reason && (
                                    <FeedbackReason>
                                        <strong>사유:</strong> {log.apilog_feedback_reason}
                                    </FeedbackReason>
                                )}
                            </FeedbackContainer>
                        </Section>
                    )}

                    {/* 오류 정보 */}
                    {(log.apilog_status === 'error' || log.apilog_status === 'exception') && (
                        <Section>
                            <SectionTitle>🚨 오류 정보</SectionTitle>
                            <ErrorContainer>
                                <ErrorMessage>
                                    {log.apilog_status_reason || '오류 메시지가 없습니다.'}
                                </ErrorMessage>
                            </ErrorContainer>
                        </Section>
                    )}

                    {/* 디버그 정보 - 개발용 */}
                    {memberType === 'admin' && (
                        <Section>
                            <SectionTitle>🔍 디버그 정보</SectionTitle>
                            <InfoGrid>
                                <InfoItem>
                                    <InfoLabel>userInfo 파싱 결과</InfoLabel>
                                    <InfoValue>{userInfo ? '성공' : '실패'}</InfoValue>
                                </InfoItem>
                                <InfoItem>
                                    <InfoLabel>workoutResult 파싱 결과</InfoLabel>
                                    <InfoValue>{workoutResult ? '성공' : '실패'}</InfoValue>
                                </InfoItem>
                                {/* <InfoItem>
                                    <InfoLabel>similarExercises 매칭 결과</InfoLabel>
                                    <InfoValue>{similarExercises ? `${similarExercises.filter(ex => ex.matchType === 'similar').length}개` : '없음'}</InfoValue>
                                </InfoItem> */}
                                {/* 매칭 유형별 카운트 */}
                                {similarExercises && similarExercises.length > 0 && (
                                    <InfoItem>
                                        <InfoLabel>운동명 매칭 유형별 분석</InfoLabel>
                                        <InfoValue>
                                            정확: {similarExercises.filter(ex => ex.matchType === 'exact').length}개, 
                                            유사: {similarExercises.filter(ex => ex.matchType === 'similar').length}개, 
                                            실패: {similarExercises.filter(ex => ex.matchType === 'none').length}개
                                        </InfoValue>
                                    </InfoItem>
                                )}
                                {/* AItest.jsx 방식의 추가 디버그 정보 */}
                                {workoutResult && (
                                    <>
                                        <InfoItem>
                                            <InfoLabel>운동명 유효성 검사</InfoLabel>
                                            <InfoValue>
                                                {workoutResult.invalidExerciseCount !== undefined ?
                                                    `${workoutResult.validationRatio}% (${workoutResult.totalExercises - workoutResult.invalidExerciseCount}/${workoutResult.totalExercises})` :
                                                    '검사 안함'
                                                }
                                            </InfoValue>
                                        </InfoItem>
                                        <InfoItem>
                                            <InfoLabel>근육군 분석</InfoLabel>
                                            <InfoValue>{workoutResult.muscleGroups?.length ? `${workoutResult.muscleGroups.join(', ')}` : '없음'}</InfoValue>
                                        </InfoItem>
                                    </>
                                )}
                                {/* 새로운 로그 구조 정보 */}
                                {log.parsed_userMassage && (
                                    <InfoItem>
                                        <InfoLabel>분할 루틴 정보</InfoLabel>
                                        <InfoValue>
                                            {log.parsed_userMassage.split ? 
                                                `${log.parsed_userMassage.split}분할 (${log.parsed_userMassage.isSplit ? '적용' : '미적용'})` : 
                                                '없음'
                                            }
                                        </InfoValue>
                                    </InfoItem>
                                )}
                                {log.parsed_userMassage?.disease && (
                                    <InfoItem>
                                        <InfoLabel>질병/부상 정보</InfoLabel>
                                        <InfoValue>{log.parsed_userMassage.disease}</InfoValue>
                                    </InfoItem>
                                )}
                                <InfoItem style={{ gridColumn: '1 / -1' }}>
                                    <InfoLabel>로그 필드들</InfoLabel>
                                    <InfoValue>
                                        <pre>{JSON.stringify({
                                            hasUserInput: !!log.parsed_userMassage,
                                            hasResponse: !!log.apilog_response,
                                            hasParsedResponse: !!log.parsed_response,
                                            hasParsedUserMessage: !!log.parsed_userMassage,
                                            hasFeedback: !!log.apilog_feedback,
                                            userId: log.user_id,
                                            totalTime: log.apilog_total_time ? `${log.apilog_total_time}s` : 'N/A',
                                            split: log.parsed_userMassage?.split || 'N/A',
                                            isSplit: log.parsed_userMassage?.isSplit || false
                                        }, null, 2)}</pre>
                                    </InfoValue>
                                </InfoItem>
                            </InfoGrid>
                        </Section>
                    )}
                </ModalBody>
            </ModalContainer>
        </ModalOverlay>
    );
};

const FullScreenModalWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: var(--bg-primary); /* Display.jsx와 동일하게 적용 */
  z-index: 1000;
  overflow-y: auto;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
`;

const FullScreenModalInner = styled.div`
  max-width: 750px;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
  color: var(--font-color); // 필요한 경우 글로벌 변수 사용
`;


// 수정된 스타일 컴포넌트
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--bg-primary); /* 기존 rgba 제거, Display.jsx에 맞춤 */
  z-index: 1000;
  overflow-y: auto;
  display: flex;
  justify-content: center;
`;

// 모달 내부 컨테이너
const ModalContainer = styled.div`
  width: 100%;
  max-width: 750px; /* Display.jsx와 동일 */
  background: var(--bg-secondary); /* 기존과 동일 */
  overflow: hidden;
  box-sizing: border-box;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-light);
  background: var(--bg-tertiary);
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 20px;
  background: ${props => props.color}15;
  color: ${props => props.color};
  font-weight: 600;
  font-size: 14px;
`;

const LogId = styled.div`
  font-family: 'Courier New', monospace;
  color: var(--text-tertiary);
  font-size: 14px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 4px;
  border-radius: 4px;
  
  &:hover {
    background: var(--bg-primary);
    color: var(--text-primary);
  }
`;

const NavigationBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-light);
`;

const NavButton = styled.button`
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-primary);
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &:not(:disabled):hover {
    background: var(--bg-tertiary);
  }
`;

const NavInfo = styled.div`
  font-size: 14px;
  color: var(--text-secondary);
`;

const ModalBody = styled.div`
  max-height: calc(90vh - 120px);
  overflow-y: auto;
  padding: 24px;
`;

const Section = styled.div`
  margin-bottom: 32px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const InfoLabel = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const InfoValue = styled.div`
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
`;

const CodeBlock = styled.div`
  background: var(--bg-primary);
  border-radius: 8px;
  padding: 16px;
  overflow-x: auto;
  border: 1px solid var(--border-light);
  
  pre {
    margin: 0;
    color: var(--text-primary);
    font-family: 'Courier New', monospace;
    font-size: 13px;
    line-height: 1.5;
    white-space: pre-wrap;
  }
`;

const FeedbackContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FeedbackType = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  width: fit-content;
  background: ${props => props.feedback === 'LIKE' ? '#d1fae5' : '#fee2e2'};
  color: ${props => props.feedback === 'LIKE' ? '#065f46' : '#991b1b'};
`;

const FeedbackReason = styled.div`
  background: var(--bg-tertiary);
  padding: 12px;
  border-radius: 6px;
  border: 1px solid var(--border-light);
  font-size: 14px;
  color: var(--text-primary);
`;

const ErrorContainer = styled.div`
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid var(--warning);
  border-radius: 8px;
  padding: 16px;
`;

const ErrorMessage = styled.div`
  color: var(--warning);
  font-weight: 500;
  margin-bottom: 8px;
`;

// 토글 기능을 위한 스타일 컴포넌트들
const ToggleSection = styled.div`
  border: 1px solid var(--border-light);
  border-radius: 8px;
  overflow: hidden;
`;

const ToggleSectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: ${props => props.expanded ? 'var(--bg-tertiary)' : 'var(--bg-secondary)'};
  border-bottom: ${props => props.expanded ? '1px solid var(--border-light)' : 'none'};
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--bg-tertiary);
  }
`;

const ToggleIcon = styled.span`
  display: inline-block;
  transition: transform 0.2s ease;
  transform: ${props => props.expanded ? 'rotate(90deg)' : 'rotate(0deg)'};
  color: #6b7280;
  font-size: 12px;
`;

const CollapsibleContent = styled.div`
  max-height: ${props => props.expanded ? '2000px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease;
  padding: ${props => props.expanded ? '20px' : '0 20px'};
`;

const DownloadIcon = styled.div`
  margin-left: auto;
  cursor: pointer;
  display: flex;
  align-items: center;
`;

// 운동 결과 관련 스타일

export default LogDetailModal;

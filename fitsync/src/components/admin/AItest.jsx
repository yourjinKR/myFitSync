import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ButtonSubmit, Input } from '../../styles/FormStyles';
import { 
    Container, Title,
    AIResultContainer, AIResultHeader, AIResultTitle, AIResultMeta,
    MetaInfoGrid, MetaInfoItem, MetaInfoLabel, MetaInfoValue,
    UserRequestContainer, MonospaceContent, 
    RoutineContainer, RoutineCard, RoutineHeader, RoutineTitle, RoutineBadge,
    ExerciseGrid, ExerciseItem, ExerciseIcon, ExerciseContent, ExerciseName, ExerciseDetails,
    SimilarExercise, InvalidExerciseBadge, ErrorContainer, Section, SectionTitle
} from '../../styles/chartStyle';
import userMock from '../../mock/userMock';
import versionUtils, { calculateAge } from '../../utils/utilFunc';
import { normalizeAndDisassemble, getSimilarNamesByMap } from '../../utils/KorUtil';
import { getMemberTotalData } from '../../utils/memberUtils';

// 스타일 컴포넌트 추가
import styled from 'styled-components';
import { useWorkoutNames } from '../../hooks/admin/useWorkoutNames';
import { useSelector } from 'react-redux';

const PageContainer = styled(Container)`
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
`;

const FormContainer = styled.div`
    background: var(--bg-secondary);
    padding: 2rem;
    border-radius: 0.75rem;
    border: 1px solid var(--border-light);
    margin-bottom: 2rem;
    
    h1 {
        color: var(--text-primary);
        margin-bottom: 1.5rem;
        font-size: 1.5rem;
    }
`;

const InputGroup = styled.div`
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    margin-bottom: 1.5rem;
    
    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 1rem;
    justify-content: flex-start;
    
    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

const StyledInput = styled(Input)`
    background: var(--bg-tertiary);
    border: 1px solid var(--border-light);
    color: var(--text-primary);
    
    &:focus {
        border-color: var(--primary-blue);
    }
`;

const StyledButton = styled(ButtonSubmit)`
    background: var(--primary-blue);
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 500;
    transition: all 0.2s ease;
    
    &:hover {
        background: var(--primary-blue-hover);
        transform: translateY(-1px);
    }
    
    &:first-child {
        background: var(--primary-blue);
        
        &:hover {
            background: var(--primary-blue-hover);
            opacity: 0.9;
        }
    }
`;

// JSON 파싱 및 응답 시간 계산
function parseApiLogData(apiLogItem) {
    const version = apiLogItem.apilog_version;
    try {
        const parsedPrompt = JSON.parse(apiLogItem.apilog_prompt);
        const parsedResponse = JSON.parse(apiLogItem.apilog_response);
        const responseTime = new Date(apiLogItem.apilog_response_time).getTime();
        const requestTime = new Date(apiLogItem.apilog_request_time).getTime();

        let parsedUserMassage = null;
        if (versionUtils.isVersionAtLeast(version, '0.0.7')) {
            try {
                const userMessageContent = parsedPrompt.messages[1]?.content;
                if (userMessageContent) {
                    parsedUserMassage = JSON.parse(userMessageContent);
                    if (parsedUserMassage.split === parsedResponse.length) {
                        parsedUserMassage = { ...parsedUserMassage, isSplit: true };
                    }
                }
            } catch (userMessageError) {
                console.warn('사용자 메시지 파싱 실패:', userMessageError);
                parsedUserMassage = { split: 1 }; // 기본값 설정
            }
        } else {
            // 구버전에서는 기본값 설정
            parsedUserMassage = { split: 1 };
        }

        const result = {
            ...apiLogItem,
            parsed_prompt: parsedPrompt,
            parsed_response: parsedResponse,
            parsed_userMassage: parsedUserMassage,
            apilog_total_time: (responseTime - requestTime) / 1000
        };

        console.log(`로그 ${apiLogItem.apilog_idx} 파싱 성공:`, {
            version,
            split: parsedUserMassage?.split,
            responseLength: parsedResponse.length
        });

        return result;
    } catch (error) {
        console.error(`로그 ${apiLogItem.apilog_idx} JSON 파싱 오류:`, error);
        return {
            ...apiLogItem,
            parsed_prompt: null,
            parsed_response: null,
            parsed_userMassage: { split: 1 },
            apilog_total_time: 0
        };
    }
}

const AItest = () => {
    const user = useSelector(state => state.user);

    const initialValue = {content : '운동 루틴 추천해줘', token : 0};

    const [inputText, setInputText] = useState({content : initialValue.content, token: initialValue.token});
    const [result, setResult] = useState({});
    const [memberIndex, setMemberIndex] = useState(0);
    const [rawData, setRawData] = useState([]);
    const [rawDataMap, setRawDataMap] = useState(new Map());
    const [memberData, setMemberData] = useState(null);
    const [additionalMemberData, setAdditionalMemberData] = useState({split : 4});
    const [responseTime, setResponseTime] = useState(0);

    const {rawDataIdx} = useWorkoutNames();

    const handleInputText = (e) => {
        const {value} = e.target;
        setInputText({...inputText, content : value});
    }

    const handleAdditionalData = (e) => {
        const {name, value} = e.target;
        setAdditionalMemberData({...additionalMemberData, [name]: value});
    }

    const handlmemberIndex = (e) => {
        const {value} = e.target;
        setMemberIndex(value);
    }

    const fetchWorkoutData = async () => {
        const groupedMap = new Map();
        
        try {
            const response = await axios.get('/ai/getTextReact');
            const parseList = response.data.map(name => name.replace(/\s+/g, '')); 
            setRawData(parseList);

            response.data.forEach(originalName => {
                const { normalized, length } = normalizeAndDisassemble(originalName);
                const entry = { name: originalName, name_dis: normalized };

                if (!groupedMap.has(length)) {
                    groupedMap.set(length, []);
                }
                groupedMap.get(length).push(entry);
            });

            setRawDataMap(new Map(groupedMap));
            return parseList; // 최신 데이터를 반환
        } catch (error) {
            console.error('운동명 목록 요청 실패:', error);
            return [];
        }
    };

    useEffect(() => {
        console.log(user.user.isLogin);
        

        const fetchMemberData = async () => {
            try {
                const memberData = await getMemberTotalData();
                setMemberData(memberData);
            } catch (error) {
                console.error('Member data fetch failed:', error);
            }
        };
        fetchMemberData();

        fetchWorkoutData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (Object.keys(result).length === 0) return;

        // console.log('파싱된 결과 : ', result);
        const exception = analyzeAIResult(result, additionalMemberData.split, rawData);
        
        if (exception !== null && result.logIdx) {
            const apilog = {apilog_idx : result.logIdx, apilog_status_reason : exception};
            updateLogException(apilog);
            console.log(exception);
        } else {
            console.log('정상 처리 !!!');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[result]);

    const updateLogException = async (log) => {
        if (log.apilog_status_reason === null || log.apilog_status_reason === '' || log.apilog_status_reason === 'success') {
            log.apilog_status = 'success';
        } else {
            log.apilog_status = 'exception';
        }
        
        console.log(`로그 ${log.apilog_idx} 업데이트:`, {
            status: log.apilog_status,
            reason: log.apilog_status_reason
        });
        
        try {
            const response = await axios.patch('/admin/updateExceptionReason', log);
            console.log(`로그 ${log.apilog_idx} 업데이트 성공:`, response.data);
        } catch (error) {
            console.error(`로그 ${log.apilog_idx} 업데이트 실패:`, error);
        }
    };

    function analyzeAIResult(result, userSplit, validWorkoutNames) {
        console.log('해당 결과를 분석 :', result);
        console.log('사용자 split:', userSplit);
        console.log('유효한 운동명 개수:', validWorkoutNames.length);

        const errors = [];

        if (!Array.isArray(result?.content)) {
            console.warn('AI 응답이 유효한 JSON 배열이 아닙니다:', result);
            return "invalid_json";
        }

        if (result.content.length !== Number(userSplit)) {
            console.warn(`Split 불일치: 응답 길이 ${result.content.length}, 사용자 split ${userSplit}`);
            errors.push("split_mismatch");
        }

        const invalidExercises = [];
        result.content.forEach((routine, routineIndex) => {
            if (!Array.isArray(routine.exercises)) {
                console.warn(`루틴 ${routineIndex}: exercises가 배열이 아닙니다.`);
                return;
            }

            routine.exercises.forEach((ex, exIndex) => {
                if (!ex.pt_name) {
                    console.warn(`루틴 ${routineIndex}, 운동 ${exIndex}: pt_name이 없습니다.`);
                    return;
                }
                
                const name = (ex.pt_name.replace(/\s+/g, ''));
                if (!validWorkoutNames.includes(name)) {
                    console.warn(`유효하지 않은 운동명: ${name}`);
                    invalidExercises.push(ex.pt_name);
                }
            });
        });

        if (invalidExercises.length > 0) {
            console.warn(`총 ${invalidExercises.length}개의 유효하지 않은 운동명 발견:`, invalidExercises);
            errors.push("invalid_exercise: " + invalidExercises.join(", "));
        }

        const result_error = errors.length > 0 ? errors.join("; ") : null;
        console.log('분석 결과:', result_error || 'success');
        return result_error;
    }

    const recheckAllLogs = async () => {
        try {
            // 운동명 데이터가 없다면 먼저 가져오기
            let currentRawData = rawData;
            if (rawData.length === 0) {
                console.log('운동명 데이터를 먼저 가져옵니다...');
                currentRawData = await fetchWorkoutData();
            }

            const response = await axios.get('/admin/getAllApi');
            const logs = response.data;
            
            console.log(`총 ${logs.length}개의 로그를 재검증합니다.`);
            console.log('사용할 운동명 데이터 개수:', currentRawData.length);
            
            let successCount = 0;
            let exceptionCount = 0;

            for (const log of logs) {
                try {
                    const parsedLog = parseApiLogData(log);
                    
                    // 파싱된 로그 데이터 검증
                    if (!parsedLog.parsed_response) {
                        console.warn(`로그 ${log.apilog_idx}: 응답 데이터가 없습니다.`);
                        updateLogException({
                            apilog_idx: log.apilog_idx,
                            apilog_status_reason: 'no_response_data',
                            apilog_status: 'exception'
                        });
                        exceptionCount++;
                        continue;
                    }

                    // split 값 확인 및 기본값 설정
                    let splitValue = parsedLog.parsed_userMassage?.split;
                    if (!splitValue) {
                        console.warn(`로그 ${log.apilog_idx}: split 값이 없습니다. 기본값 1로 설정합니다.`);
                        splitValue = 1;
                    }

                    const result = {
                        content: parsedLog.parsed_response,
                        logIdx: log.apilog_idx,
                        split: splitValue
                    };

                    // 운동명 데이터 재확인
                    if (currentRawData.length === 0) {
                        console.warn('운동명 데이터가 아직 로드되지 않았습니다.');
                        updateLogException({
                            apilog_idx: log.apilog_idx,
                            apilog_status_reason: 'workout_data_not_loaded',
                            apilog_status: 'exception'
                        });
                        exceptionCount++;
                        continue;
                    }

                    const exception = analyzeAIResult(result, splitValue, currentRawData);
                    let apilog = null;

                    if (exception === null) {
                        apilog = {
                            apilog_idx: result.logIdx,
                            apilog_status_reason: 'success',
                            apilog_status: 'success'
                        };
                        successCount++;
                    } else {
                        apilog = {
                            apilog_idx: result.logIdx,
                            apilog_status_reason: exception,
                            apilog_status: 'exception'
                        };
                        exceptionCount++;
                    }
                    
                    updateLogException(apilog);
                } catch (logError) {
                    console.error(`로그 ${log.apilog_idx} 처리 중 오류:`, logError);
                    updateLogException({
                        apilog_idx: log.apilog_idx,
                        apilog_status_reason: 'processing_error',
                        apilog_status: 'exception'
                    });
                    exceptionCount++;
                }
            }

            console.log(`재검증 완료: 성공 ${successCount}개, 예외 ${exceptionCount}개`);
            alert(`재검증 완료!\n성공: ${successCount}개\n예외: ${exceptionCount}개`);
        } catch (error) {
            console.error('모든 API 로그 재검증 실패:', error);
            alert('로그 재검증 중 오류가 발생했습니다.');
        }
    };

    const testAPI = () => {
        console.log('실행');
        
        if (!inputText.content) {
            alert('값을 입력하시오');
            return;
        }
        if (inputText.content.length > 50) {
            console.log(inputText.content.length);
            alert('50자 내외로 작성 바랍니다');
            return;
        }
        if (memberData === null) {
            alert('멤버 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
            return;
        }

        const startTime = performance.now();
        const { member, body } = memberData || {};
        console.log('memberData:', member, body);

        const userInfo = {
            name: member?.member_name || null,
            disease: member?.member_disease || null,
            purpose: member?.member_purpose || null,
            height: body?.body_height || null,
            weight: body?.body_weight || null,
            age: calculateAge(member?.member_birth),
            gender : member?.member_gender,
            bmi: body?.body_bmi || null,
            fat: body?.body_fat || null,
            fat_percentage: body?.body_fat_percentage || null,
            skeletal_muscle: body?.body_skeletal_muscle || null,
            split: additionalMemberData?.split || null
        };

        const filteredUserInfo = Object.fromEntries(
            Object.entries(userInfo).filter(([_, value]) => value !== null)
        );

        const fullMessage = JSON.stringify(filteredUserInfo);
        console.log('전송할 메시지:', fullMessage);
        
        axios.post(
            '/ai/createRoutine', 
            { message: fullMessage },
            { withCredentials: true }
        )
        .then(response => {
            const endTime = performance.now();
            const elapsedSeconds = ((endTime - startTime) / 1000).toFixed(6);
            console.log(`응답 시간: ${elapsedSeconds}초`);
            setResponseTime(parseFloat(elapsedSeconds));

            const parsedContent = JSON.parse(response.data.content);
            const logIdx = response.data.logIdx;

            setResult({content : parsedContent, logIdx : logIdx});
        })
        .catch(error => {
            const endTime = performance.now();
            const elapsedSeconds = ((endTime - startTime) / 1000).toFixed(6);
            console.error(`AI 요청 실패 (응답 시간: ${elapsedSeconds}초):`, error);
        });
    };

    // 해당 구조로 바뀌어야 함 (참고용)
    /*
    const sendDataType = { 
        routine_name : 'AI 추천 루틴',
        member_idx : null,
        writer_idx : 0, // 컨트롤러에 수정 필요
        list : [
            {pt_idx: 0, pt_name: '운동명', routineSet : [{set_num: 0, set_volume: 0, set_count: 0}]},
            {pt_idx: 0, pt_name: '운동명', routineSet : [{set_num: 0, set_volume: 0, set_count: 0}]},
        ]
    }
    */

    // 결과 파싱
    const parseResult = (result) => {
        if (!result.content || !result.logIdx) {
            alert('결과가 없습니다. AI 루틴 생성을 먼저 실행해주세요.');
            return;
        }

        /** 응답결과를 DB 구조에 맞게 파싱 */ 
        const parsedResult = result.content.map((routine, idx) => {
            // routine_name
            const routine_name = routine.routine_name + ' (AI 생성)' || `AI 추천 루틴 ${idx + 1}`;
            
            // list
            const parsedExerciseList = routine.exercises.map(ex => {
                // rawDataIdx.pt_name에 이름이 있다면 pt_idx를 가져오고, 없다면 null로 설정
                let exIdx = rawDataIdx.find(item => item.pt_name === ex.pt_name.replace(/\s+/g, ''))?.pt_idx || null;
                if (exIdx === null) {
                    // 유사한 운동명을 찾기
                    const similarList = getSimilarNamesByMap(ex.pt_name, rawDataMap);
                    // 유사한 운동명이 있다면 첫 번째 것을 사용
                    const similarName = similarList.length > 0 ? similarList[0].name : null;

                    if (similarName) {
                        exIdx = rawDataIdx.find(item => item.pt_name === similarName)?.pt_idx || null;
                    } else {
                        console.warn(`유효하지 않은 운동명: ${ex.pt_name}`);
                    }
                }
                // 운동 세트 정보 파싱
                const routineSet = Array.from({ length: ex.set_num }, () => ({
                    set_volume: ex.set_volume,
                    set_count: ex.set_count
                }));
                
                return {pt_idx : exIdx, name : null, routine_memo : "", routineSet : routineSet};
            });

            const parseData = {
                routine_name : routine_name,
                member_idx : null, 
                writer_idx : 0,
                routines : parsedExerciseList,
            };
            return parseData;
        }); 
        
        console.log(result.content, result.logIdx);
        console.log('파싱된 결과:', parsedResult);
        return parsedResult;
    }
        
    // 루틴 추천 결과 DB에 저장
    const saveResult = async (result) => {
        const parsedResult = parseResult(result);

        for (const routineData of parsedResult) {
            try {
                const response = await axios.post('/routine/add', routineData, {
                    withCredentials: true
                });

                if (response.data.success) {
                    alert('루틴이 성공적으로 저장되었습니다.');
                } else {
                    alert('루틴 저장에 실패했습니다: ' + response.data.msg);
                }
            } catch (error) {
                console.error('루틴 저장 중 오류 발생:', error);
                alert('루틴 저장 중 오류가 발생했습니다. 콘솔을 확인하세요.');
                break; // 에러 발생 시 이후 저장 중단 (필요시 제거 가능)
            }
        }
    };

    // 디버깅용 함수
    const debugWorkoutData = () => {
        console.log('현재 rawData 길이:', rawData.length);
        console.log('현재 rawData 샘플:', rawData.slice(0, 10));
        console.log('현재 rawDataIdx 길이:', rawDataIdx.length);
        console.log('현재 rawDataIdx 샘플:', rawDataIdx.slice(0, 5));
        console.log('현재 rawDataMap 크기:', rawDataMap.size);
        
        alert(`
운동명 데이터 상태:
- rawData: ${rawData.length}개
- rawDataIdx: ${rawDataIdx.length}개
- rawDataMap: ${rawDataMap.size}개 그룹
        `);
    };

    return (
        <PageContainer>
            <FormContainer>
                <Title>🤖 AI 운동 루틴 생성기</Title>
                
                <ButtonGroup>
                    <StyledButton type="button" onClick={recheckAllLogs}>
                        모든 로그 재검증
                    </StyledButton>
                    <StyledButton type="button" onClick={debugWorkoutData}>
                        운동명 데이터 확인
                    </StyledButton>
                </ButtonGroup>
                
                <InputGroup>
                    <StyledInput 
                        type="text" 
                        value={inputText.content}
                        placeholder="챗봇에게 질문할 내용을 입력하세요 (50자 이내)"
                        maxLength={50} 
                        onChange={handleInputText}
                    />
                    <StyledInput 
                        type="number"
                        name="split"
                        value={additionalMemberData.split}
                        placeholder="분할 수 (예: 4)"
                        onChange={handleAdditionalData} 
                    />
                    <StyledInput 
                        type="number"
                        name="index"
                        value={memberIndex}
                        placeholder="멤버 인덱스"
                        onChange={handlmemberIndex} 
                    />
                </InputGroup>
                
                <ButtonGroup>
                    {/* user.isLogin이 false일 경우 */}
                    <StyledButton onClick={testAPI} disabled={!user.user.isLogin}>
                        🚀 AI 루틴 생성
                    </StyledButton>
                </ButtonGroup>
            </FormContainer>

            {/* AI 응답 결과 표시 */}
            {result.content && (
                <AIResultContainer>
                    <AIResultHeader>
                        <div>
                            <AIResultTitle>🤖 AI 운동 루틴 생성 완료</AIResultTitle>
                            <AIResultMeta>
                                응답 시간: {responseTime}초 | 
                                루틴 개수: {Array.isArray(result.content) ? result.content.length : 0}개 | 
                                로그 ID: {result.logIdx}
                            </AIResultMeta>
                        </div>
                    </AIResultHeader>

                    {/* 메타 정보 */}
                    <MetaInfoGrid>
                        <MetaInfoItem>
                            <MetaInfoLabel>⏱️ 응답 시간</MetaInfoLabel>
                            <MetaInfoValue>{responseTime}초</MetaInfoValue>
                        </MetaInfoItem>
                        <MetaInfoItem>
                            <MetaInfoLabel>📋 루틴 개수</MetaInfoLabel>
                            <MetaInfoValue>{Array.isArray(result.content) ? result.content.length : 0}</MetaInfoValue>
                        </MetaInfoItem>
                        <MetaInfoItem>
                            <MetaInfoLabel>🔄 분할 수</MetaInfoLabel>
                            <MetaInfoValue>{additionalMemberData.split}</MetaInfoValue>
                        </MetaInfoItem>
                        <MetaInfoItem>
                            <MetaInfoLabel>👤 사용자</MetaInfoLabel>
                            <MetaInfoValue>
                                {memberData?.member?.member_name || userMock[memberIndex]?.member?.member_name || 'Unknown'}
                            </MetaInfoValue>
                        </MetaInfoItem>
                    </MetaInfoGrid>

                    {/* 사용자 요청 정보 */}
                    <Section>
                        <SectionTitle>📝 사용자 요청</SectionTitle>
                        <UserRequestContainer>
                            <MonospaceContent>
                                {inputText.content}
                            </MonospaceContent>
                        </UserRequestContainer>
                    </Section>

                    {/* AI 응답 루틴 - 전체 상세 정보 */}
                    <Section>
                        <SectionTitle>🤖 AI 응답 (운동 루틴)</SectionTitle>
                        <RoutineContainer>
                            {Array.isArray(result.content) ? result.content.map((routine, idx) => (
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
                                        {routine.exercises?.map((ex, i) => {
                                            const isValid = rawData.includes(ex.pt_name?.replace(/\s+/g, ''));
                                            return (
                                                <ExerciseItem key={i} isValid={isValid}>
                                                    <ExerciseIcon>
                                                        {isValid ? '✅' : '❌'}
                                                    </ExerciseIcon>
                                                    <ExerciseContent>
                                                        <ExerciseName>
                                                            {isValid ? ex.pt_name : (
                                                                <>
                                                                    {ex.pt_name}
                                                                    {getSimilarNamesByMap(ex.pt_name, rawDataMap).slice(0, 1).map((item, index) => (
                                                                        <SimilarExercise key={index}>
                                                                            👉 추천: {item.name}
                                                                        </SimilarExercise>
                                                                    ))}
                                                                </>
                                                            )}
                                                        </ExerciseName>
                                                        <ExerciseDetails>
                                                            {ex.set_volume}kg × {ex.set_count}회 × {ex.set_num}세트
                                                        </ExerciseDetails>
                                                    </ExerciseContent>
                                                    {!isValid && (
                                                        <InvalidExerciseBadge>
                                                            유효하지 않은 운동
                                                        </InvalidExerciseBadge>
                                                    )}
                                                </ExerciseItem>
                                            );
                                        })}
                                    </ExerciseGrid>
                                </RoutineCard>
                            )) : (
                                <ErrorContainer>
                                    ⚠️ 루틴 정보가 없거나 형식이 잘못되었습니다.
                                </ErrorContainer>
                            )}
                        </RoutineContainer>
                    </Section>
                    <StyledButton type="button" onClick={() => saveResult(result)}>
                        저장
                    </StyledButton>
                    <StyledButton type="button" onClick={() => setResult({})}>
                        취소
                    </StyledButton>
                </AIResultContainer>
            )}
        </PageContainer>
    );
};

export default AItest;
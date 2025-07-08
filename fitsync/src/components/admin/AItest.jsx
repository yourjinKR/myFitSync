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
            parsedUserMassage = JSON.parse(parsedPrompt.messages[1]?.content);
            if (parsedUserMassage.split === parsedResponse.length) {
                parsedUserMassage = { ...parsedUserMassage, isSplit: true };
            }
        }

        return {
            ...apiLogItem,
            parsed_prompt: parsedPrompt,
            parsed_response: parsedResponse,
            parsed_userMassage: parsedUserMassage,
            apilog_total_time: (responseTime - requestTime) / 1000
        };
    } catch (error) {
        console.error('JSON 파싱 오류:', error);
        return apiLogItem;
    }
}

const AItest = () => {
    const initialValue = {content : '운동 루틴 추천해줘', token : 0};

    const [inputText, setInputText] = useState({content : initialValue.content, token: initialValue.token});
    const [result, setResult] = useState({});
    const [memberIndex, setMemberIndex] = useState(0);
    const [rawData, setRawData] = useState([]);
    const [rawDataMap, setRawDataMap] = useState(new Map());
    const [memberData, setMemberData] = useState(null);
    const [additionalMemberData, setAdditionalMemberData] = useState({split : 4});
    const [responseTime, setResponseTime] = useState(0);

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

    useEffect(() => {
        const fetchMemberData = async () => {
            try {
                const memberData = await getMemberTotalData();
                setMemberData(memberData);
            } catch (error) {
                console.error('Member data fetch failed:', error);
            }
        };
        fetchMemberData();

        const fetchWorkoutNames = async () => {
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
            } catch (error) {
                console.error('운동명 목록 요청 실패:', error);
            }
        }
        fetchWorkoutNames();
    }, []);

    useEffect(() => {
        if (Object.keys(result).length === 0) return;

        console.log('파싱된 결과 : ', result);
        const exception = analyzeAIResult(result, additionalMemberData.split, rawData);
        
        if (exception !== null && result.logIdx) {
            const apilog = {apilog_idx : result.logIdx, apilog_status_reason : exception};
            updateLogException(apilog);
            console.log(exception);
        } else {
            console.log('정상 처리 !!!');
        }
    },[result, additionalMemberData.split, rawData]);

    const updateLogException = async (log) => {
        if (log.apilog_status_reason === null || log.apilog_status_reason === '') {
            log.apilog_status = 'success';
        } else {
            log.apilog_status = 'exception';
        }
        console.log('업데이트할 로그:', log);
        try {
            await axios.patch('/admin/updateExceptionReason', log)
                .then((res) => console.log('API 로그 업데이트 결과:', res.data));
        } catch (error) {
            console.error('API 로그 업데이트 실패:', error);
        }
    };

    function analyzeAIResult(result, userSplit, validWorkoutNames) {
        console.log('해당 결과를 분석 :', result);

        const errors = [];

        if (!Array.isArray(result?.content)) {
            console.warn('AI 응답이 유효한 JSON 배열이 아닙니다:', result);
            return "invalid_json";
        }

        if (result.content.length !== Number(userSplit)) {
            errors.push("split_mismatch");
        }

        const invalidExercises = [];
        result.content.forEach(routine => {
            if (!Array.isArray(routine.exercises)) return;

            routine.exercises.forEach(ex => {
                const name = (ex.pt_name.replace(/\s+/g, ''));
                if (!validWorkoutNames.includes(name)) {
                    console.warn(`유효하지 않은 운동명: ${name}`);
                    invalidExercises.push(ex.pt_name);
                }
            });
        });

        if (invalidExercises.length > 0) {
            errors.push("invalid_exercise: " + invalidExercises.join(", "));
        }

        return errors.length > 0 ? errors.join("; ") : null;
    }

    const recheckAllLogs = () => {
        axios.get('/admin/getAllApi')
            .then(response => {
                const logs = response.data;
                logs.forEach(log => {
                    const parsedLog = parseApiLogData(log);

                    const result = {
                        content: parsedLog.parsed_response,
                        logIdx: log.apilog_idx,
                        split: parsedLog.parsed_userMassage?.split
                    };

                    const exception = analyzeAIResult(result, result.split, rawData);
                    const apilog = {apilog_idx: result.logIdx, apilog_status_reason: exception};
                    updateLogException(apilog);
                });
            })
            .catch(error => {
                console.error('모든 API 로그 재검증 실패:', error);
            });
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

    return (
        <PageContainer>
            <FormContainer>
                <Title>🤖 AI 운동 루틴 생성기</Title>
                
                <ButtonGroup>
                    <StyledButton type="button" onClick={recheckAllLogs}>
                        모든 로그 재검증
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
                    <StyledButton onClick={testAPI}>
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
                </AIResultContainer>
            )}
        </PageContainer>
    );
};

export default AItest;
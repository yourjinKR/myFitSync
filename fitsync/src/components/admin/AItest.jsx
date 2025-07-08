import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ButtonSubmit, Input } from '../../styles/FormStyles';
import { 
    AIResultContainer, AIResultHeader, AIResultTitle, AIResultMeta,
    MetaInfoGrid, MetaInfoItem, MetaInfoLabel, MetaInfoValue,
    UserRequestContainer, MonospaceContent, RoutineContainer, RoutineHeader, RoutineTitle, RoutineBadge,
    ExerciseGrid, ExerciseItem, ExerciseIcon, ExerciseContent, ExerciseName, ExerciseDetails,
    SimilarExercise, InvalidExerciseBadge, ErrorContainer, Section, SectionTitle
} from '../../styles/chartStyle';
import userMock from '../../mock/userMock';
import versionUtils, { calculateAge } from '../../utils/utilFunc';
import { normalizeAndDisassemble, getSimilarNamesByMap } from '../../utils/KorUtil';
import { getMemberTotalData } from '../../utils/memberUtils';

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
    // 길이를 기준으로 운동명과 자모음 분해 운동명을 매핑
    const [rawDataMap, setRawDataMap] = useState(new Map());
    // 멤버 데이터
    const [memberData, setMemberData] = useState(null);
    // 추가 질문 : 분할 수... 등등
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

                // 운동명과 자모음 분해 운동명을 길이별로 그룹화
                response.data.forEach(originalName => {
                    const { normalized, length } = normalizeAndDisassemble(originalName);

                    const entry = { name: originalName, name_dis: normalized };

                    if (!groupedMap.has(length)) {
                        groupedMap.set(length, []);
                    }
                    groupedMap.get(length).push(entry);
                });

                // set할 때는 새로운 Map 객체로 전달하여 리액트가 변경 감지하도록 함
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
        
        // exception이 null 아닐 경우
        if (exception !== null && result.logIdx) {
            const apilog = {apilog_idx : result.logIdx, apilog_status_reason : exception};
            updateLogException(apilog);
            console.log(exception);
        } else {
            console.log('정상 처리 !!!');
        }
    },[result, additionalMemberData.split, rawData]);

    /** 로그 업데이트 함수 */
    const updateLogException = async (log) => {
        if (log.apilog_status_reason === null || log.apilog_status_reason === '') {
            log.apilog_status = 'success';  // 예외 사유가 없으면 상태를 success로 설정
        } else {
            log.apilog_status = 'exception';  // 예외 사유가 있으면 상태를 exception으로 설정
        }
        console.log('업데이트할 로그:', log);
        try {
            await axios.patch('/admin/updateExceptionReason', log)
                .then((res) => console.log('API 로그 업데이트 결과:', res.data));
        } catch (error) {
            console.error('API 로그 업데이트 실패:', error);
        }
    };

    /** AI 응답 결과에서 예외 상황을 분석하여 문자열로 반환 예외가 없으면 null 반환 */
    function analyzeAIResult(result, userSplit, validWorkoutNames) {
        console.log('해당 결과를 분석 :', result);

        const errors = [];

        // 1. JSON 구조 검증
        if (!Array.isArray(result?.content)) {
            console.warn('AI 응답이 유효한 JSON 배열이 아닙니다:', result);
            return "invalid_json";
        }

        // 2. split 분할 수 불일치
        if (result.content.length !== Number(userSplit)) {
            errors.push("split_mismatch");
        }

        // 3. 운동명 유효성 검사
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

    /** 모든 api log 재검증 함수 */
    const recheckAllLogs = () => {
        axios.get('/admin/getAllApi') // 모든 API 로그 가져오기
            .then(response => {
                const logs = response.data;
                logs.forEach(log => {
                    const parsedLog = parseApiLogData(log); // 로그 데이터 파싱

                    const result = {
                        content: parsedLog.parsed_response,
                        logIdx: log.apilog_idx,
                        split: parsedLog.parsed_userMassage?.split
                    };

                    const exception = analyzeAIResult(result, result.split, rawData); // 예외 분석
                    const apilog = {apilog_idx: result.logIdx, apilog_status_reason: exception};
                    updateLogException(apilog); // 로그 업데이트
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
        // if (resultText) {
        //     console.log('결과값 이미 존재');
        //     return;
        // }

        const startTime = performance.now();

        const { member, body } = memberData || {};
        console.log('memberData:', member, body);

        const userInfo = {
            name: member?.member_name || null,
            // type: member?.member_type || null,
            // activity_area: member?.member_activity_area || null,
            // day: member?.member_day || null,
            // time: member?.member_time || null,
            disease: member?.member_disease || null,
            purpose: member?.member_purpose || null,
            // price: member?.member_price > 0 ? member.member_price : null,

            height: body?.body_height || null,
            weight: body?.body_weight || null,
            age: calculateAge(member?.member_birth),  // 나이는 임시값이므로 수정 필요
            gender : member?.member_gender, // 임시 입력
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
        
    };

    return (
        <div>
            <ButtonSubmit type="button" onClick={recheckAllLogs}>모든 로그 재검증</ButtonSubmit>
            <h1>chapGPT 토큰 계산기</h1>
            <Input 
                type="text" 
                value={inputText.content}
                placeholder="챗봇에게 질문할 내용을 입력하세요 (50자 이내)"
                maxLength={50} 
                onChange={handleInputText}/>
            <Input 
                type="number"
                name="split"
                value={additionalMemberData.split}
                placeholder="분할 수 (예: 4)"
                onChange={handleAdditionalData} />
            <Input 
                type="number"
                name="index"
                value={memberIndex}
                placeholder="멤버 인덱스"
                onChange={handlmemberIndex} />
            <ButtonSubmit onClick={testAPI}>전송</ButtonSubmit>

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
                            <MetaInfoLabel>응답 시간</MetaInfoLabel>
                            <MetaInfoValue>{responseTime}초</MetaInfoValue>
                        </MetaInfoItem>
                        <MetaInfoItem>
                            <MetaInfoLabel>루틴 개수</MetaInfoLabel>
                            <MetaInfoValue>{Array.isArray(result.content) ? result.content.length : 0}</MetaInfoValue>
                        </MetaInfoItem>
                        <MetaInfoItem>
                            <MetaInfoLabel>분할 수</MetaInfoLabel>
                            <MetaInfoValue>{additionalMemberData.split}</MetaInfoValue>
                        </MetaInfoItem>
                        <MetaInfoItem>
                            <MetaInfoLabel>사용자</MetaInfoLabel>
                            <MetaInfoValue>{userMock[memberIndex]?.member?.member_name || 'Unknown'}</MetaInfoValue>
                        </MetaInfoItem>
                    </MetaInfoGrid>

                    {/* 사용자 요청 정보 */}
                    <Section>
                        <SectionTitle>📝 사용자 요청:</SectionTitle>
                        <UserRequestContainer>
                            <MonospaceContent>
                                {inputText.content}
                            </MonospaceContent>
                        </UserRequestContainer>
                    </Section>

                    {/* AI 응답 루틴 - 전체 상세 정보 */}
                    <Section>
                        <SectionTitle>🤖 AI 응답 (운동 루틴):</SectionTitle>
                        <RoutineContainer>
                            {Array.isArray(result.content) ? result.content.map((routine, idx) => (
                                <div key={idx} style={{ 
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '0.5rem',
                                    padding: '1rem',
                                    background: '#eff6ff',
                                    marginBottom: '1rem'
                                }}>
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
                                </div>
                            )) : (
                                <ErrorContainer>
                                    ⚠️ 루틴 정보가 없거나 형식이 잘못되었습니다.
                                </ErrorContainer>
                            )}
                        </RoutineContainer>
                    </Section>
                </AIResultContainer>
            )}

        </div>
    );
};

export default AItest;
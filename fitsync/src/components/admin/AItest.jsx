import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ButtonSubmit, Input } from '../../styles/FormStyles';
import userMock from '../../mock/userMock';
import versionUtils, { calculateAge } from '../../util/utilFunc';

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
    const [memberData, setMemberData] = useState(userMock[0]);
    const [memberIndex, setMemberIndex] = useState(0);
    const [rawData, setRawData] = useState([]);
    // 추가 질문 나이, 분할 수... 등등
    const [additionalMemberData, setAdditionalMemberData] = useState({split : null});

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
        axios.get('/member/infoTemp?member_email=you720223721@gmail.com')
        .then(response => {
            setMemberData(response.data);
            console.log('멤버 데이터:', response.data);
            
        })
        .catch(error => {
            console.error('Error fetching member data:', error);
        });

        const fetchWorkoutNames = async () => {
            try {
                const response = await axios.get('/ai/getTextReact'); // 서버 주소에 맞게 조정
                const parseList = response.data.map(name => name.replace(/\s+/g, '')); 
                setRawData(parseList); // 문자열 형태의 JSON 배열: '["벤치프레스", "랫풀다운", ...]'
            } catch (error) {
                console.error('운동명 목록 요청 실패:', error);
            }
        }
        fetchWorkoutNames();
    }, []);

    useEffect(() => {
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
    },[result]);

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

    // 모든 api log 재검증 함수
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
        // if (resultText) {
        //     console.log('결과값 이미 존재');
        //     return;
        // }

        const startTime = performance.now();

        // const infoParts = [];
        // const { member, body } = memberData || {};
        // DUMMY USER DATA
        const { member, body } = userMock[memberIndex] || {};
        console.log('memberData:', userMock[memberIndex]);

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

        axios.post('/ai/getAiTest', {
            message: fullMessage
        })
        .then(response => {
            const endTime = performance.now();
            const elapsedSeconds = ((endTime - startTime) / 1000).toFixed(6);
            console.log(`응답 시간: ${elapsedSeconds}초`);

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
        </div>
    );
};

export default AItest;
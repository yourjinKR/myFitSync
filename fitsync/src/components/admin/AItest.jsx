import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ButtonSubmit, Input } from '../../styles/FormStyles';
import userMock from '../../mock/userMock';
import { calculateAge } from '../../util/utilFunc';

const initialMemberData = {
    member : {
        gym_idx : 0, // 헬스장 인덱스
        member_activity_area : null, // 활동 지역
        member_day : null, // 운동 요일
        member_disease : "허리 디스크", // 질병
        member_email : "you720223721@gmail.com", // 이메일
        member_idx : 1, // 회원 인덱스
        member_image : "https://lh3.googleusercontent.com/a/ACg8ocI49MTJ7xlsarzH_vhDR_-zgZs37M0fZVOlPQHPcJICy2NPUA=s96-c", // 프로필 이미지
        member_info : null, // 회원 정보
        member_info_image : null, // 회원 정보 이미지
        member_name : "유어진", // 회원 이름
        member_num : null, // 회원 번호
        member_price : 0, // pt 1회당 레슨 가격
        member_purpose : "근육 증가", // 운동 목적
        member_status : "active", // 회원 상태 (온라인 여부)
        member_time : "20:00~23:00", // 운동 시간대
        member_type : "user" // 회원 타입 (user, trainer 등)
    },
    body: {
        body_bmi : 0, // BMI
        body_fat : 0, // 체지방
        body_fat_percentage : 0, // 체지방률
        body_height : 186, // 키
        body_idx : 1, // 인덱스
        body_regdate : 1751250959000, // 등록일
        body_skeletal_muscle : 0, // 골격근
        body_weight : 72, // 체중
        member_idx : 1 // 회원 인덱스
    }
}

const AItest = () => {
    const initialValue = {content : '운동 루틴 추천해줘', token : 0};

    const [inputText, setInputText] = useState({content : initialValue.content, token: initialValue.token});
    const [result, setResult] = useState({});
    const [memberData, setMemberData] = useState(initialMemberData);
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
                setRawData(response.data); // 문자열 형태의 JSON 배열: '["벤치프레스", "랫풀다운", ...]'
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
        try {
            await axios.patch('/ai/updateExceptionReason', log)
                .then((res) => console.log(res.data));
        } catch (error) {
            console.error('API 로그 업데이트 실패:', error);
        }
    };

    /** AI 응답 결과에서 예외 상황을 분석하여 문자열로 반환 예외가 없으면 null 반환 */
    function analyzeAIResult(result, userSplit, validWorkoutNames) {
        console.log('검사 : ', result);

        const errors = [];

        // 1. JSON 구조 검증
        if (!Array.isArray(result?.content)) {
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
            if (!validWorkoutNames.includes(ex.pt_name)) {
                invalidExercises.push(ex.pt_name);
            }
            });
        });

        if (invalidExercises.length > 0) {
            errors.push("invalid_exercise: " + invalidExercises.join(", "));
        }

        return errors.length > 0 ? errors.join("; ") : null;
    }

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
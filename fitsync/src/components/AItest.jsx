import React, { useState } from 'react';
import axios from 'axios';

const user = {
  member: {
    memberIdx: 101,
    day: "월,수,금",
    type: "일반",                 // 예: 일반, 트레이너
    purpose: "체중 감량",
    time: "18:00~22:00",
    disease: "고혈압",
    activityArea: "서울 강남구",
    awards: "2022 피트니스 대회 1등",
    info: "운동을 시작한지 3년차입니다. 지속적인 체형 관리가 목표입니다.",
  },
  body: {
    height: 175,                   // cm
    weight: 72.5,                  // kg
    skeletalMuscle: 32.1,          // kg
    fat: 15.2,                     // kg
    fatPercentage: 21.0,           // %
    bmi: 23.7,
    regDate: "2025-06-26"          // ISO 형식 권장
  }
};


const AItest = () => {
    const initialValue = {content : '', token : 0};

    const [inputText, setInputText] = useState({content : initialValue.content, token: initialValue.token});
    const [resultText, setResultText] = useState('');

    const handleInputText = (e) => {
        const {value} = e.target;
        setInputText({...inputText, content : value});
    }

    const testAPI = () => {
        // if (!inputText.content) {
        //     alert('값을 입력하시오');
        //     return;
        // }
        // if (inputText.content.length > 50) {
        //     console.log(inputText.content.length);
        //     alert('50자 내외로 작성 바랍니다');
        //     return;
        // }
        // if (resultText) {
        //     console.log('결과값 이미 존재');
        //     return;
        // }

        // 고해상도 타이머 시작
        const startTime = performance.now();

        axios.post('/ai/getAiTest', {
            message: inputText.content
        })
        .then(response => {
            const endTime = performance.now();
            const elapsedSeconds = ((endTime - startTime) / 1000).toFixed(6); // 소수점 6자리까지
            console.log(`응답 시간: ${elapsedSeconds}초`);

            console.log(response.data);
            setResultText(response.data);
        })
        .catch(error => {
            const endTime = performance.now();
            const elapsedSeconds = ((endTime - startTime) / 1000).toFixed(6);
            console.error(`AI 요청 실패 (응답 시간: ${elapsedSeconds}초):`, error);
        });
    };

    // function func() {
    //     const startTime = performance.now();
    //     axios.get('/getTextReact', 'data')
    //     .then(response=> {
    //         console.log(response);
    //         const endTime = performance.now();
    //         console.log(((endTime - startTime) / 1000).toFixed(6));
    //     });
    // }
    // func();

    return (
        <div>
            <h1>chapGPT 토큰 계산기</h1>
            <input type="text" value={inputText.content} onChange={handleInputText}/>
            <button onClick={testAPI}>전송</button>
            <h3>응답요청</h3>
            <p>응답 내용 : {inputText.content}</p>
            <p>토큰 수 : {inputText.token}</p>
            <h3>결과창</h3>
        </div>
    );
};

export default AItest;
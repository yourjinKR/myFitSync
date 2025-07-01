import React, { useState } from 'react';
import axios from 'axios';

// 로그 파싱 함수
function parseApiLogData(apiLogItem) {
    try {
        // prompt와 response를 객체로 파싱
        const parsedPrompt = JSON.parse(apiLogItem.apilog_prompt);
        const parsedResponse = JSON.parse(apiLogItem.apilog_response);

        return {
            ...apiLogItem,
            parsed_prompt: parsedPrompt,
            parsed_response: parsedResponse,
            // 원본도 유지
            original_prompt: apiLogItem.apilog_prompt,
            original_response: apiLogItem.apilog_response
        };
    } catch (error) {
        console.error('JSON 파싱 오류:', error);
        return apiLogItem; // 오류 시 원본 반환
    }
}

const AdminApiContainer = () => {
    const [apiLogs, setApiLogs] = useState([]);

    // 모든 API 로그를 가져오는 함수
    const getAllApi = async () => {
        axios.get('/admin/getAllApi')
            .then(response => {
                console.log('API 로그:', response.data);
                const apiLogs = response.data.map(item => parseApiLogData(item));
                console.log('파싱된 API 로그:', apiLogs);
            })
            .catch(error => {
                console.error('API 로그 가져오기 실패:', error);
            });
    }
    return (
        <div>
            api 모니터링 페이지입니다.
            <button type="button" onClick={getAllApi}>API 로그 가져오기</button>
        </div>
    );
};

export default AdminApiContainer;
import axios from 'axios';
import versionUtils from './utilFunc';

export const ApilogUtil = {
    /**
     * API 로그 데이터 파싱 및 응답 시간 계산
     * @param {Object} apiLogItem - API 로그 아이템
     * @returns {Object} 파싱된 API 로그 데이터
     */
    parseApiLogData : (apiLogItem) => {
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
    },

    /** api log 개요 통계 가져오기  */
    getApiStats : async ({status=null, model=null, version=null, serviceType=null, fromDate=null, toDate=null}) => {
        try {
            const response = await axios.get('/admin/api/stats', {
                params: {
                    status: 'success',
                    // model: 'gpt-4o',
                    // version: 'v0.0.3',
                    // serviceType: '사용자 정보 기반 운동 루틴 추천',
                    fromDate: '2025-07-01',
                    toDate: '2025-07-29'
                }
            });
            console.log("통계 개요 : ", response.data);
            return response.data;
        } catch (error) {
            console.error("통계 개요 호출 실패 : ", error);
        }
    }
};




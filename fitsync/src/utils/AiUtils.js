import axios from "axios";
import { findBestMatch } from "./KorUtil";
import versionUtils from "./utilFunc";

const AiUtil = {
    /** 응답결과를 DB 구조에 맞게 파싱 */ 
    parseResult(result, rawDataIdx, rawDataMap) {
        if (!result.content || !result.logIdx) {
            alert('결과가 없습니다. AI 루틴 생성을 먼저 실행해주세요.');
            return;
        }

        const parsedResult = result.content.map((routine, idx) => {
            // routine_name
            const routine_name = routine.routine_name + ' (AI 생성)' || `AI 추천 루틴 ${idx + 1}`;
            
            // list
            const parsedExerciseList = routine.exercises.map(ex => {
                // rawDataIdx.pt_name에 이름이 있다면 pt_idx를 가져오고, 없다면 null로 설정
                let exIdx = rawDataIdx.find(item => item.pt_name === ex.pt_name.replace(/\s+/g, ''))?.pt_idx || null;
                if (exIdx === null) {
                    // 개선된 매칭 함수 사용
                    const matchResult = findBestMatch(ex.pt_name, rawDataMap);
                    
                    if (matchResult.found) {
                        exIdx = rawDataIdx.find(item => item.pt_name === matchResult.matchedName)?.pt_idx || null;
                        if (matchResult.score > 0) {
                        }
                    } else {
                        console.warn(`유효하지 않은 운동명: ${ex.pt_name}`);
                    }
                }
                // 운동 세트 정보 파싱
                const routineSet = Array.from({ length: ex.set_num }, () => ({
                    set_volume: ex.set_volume,
                    set_count: ex.set_count
                }));
                
                return {pt_idx : exIdx, name : null, routine_memo : "", sets : routineSet};
            });

            const parseData = {
                routine_name : routine_name, 
                member_idx : null, 
                writer_idx : 0,
                routines : parsedExerciseList,
            };
            return parseData;
        }); 
        
        return parsedResult;
    },

    /** 결과 저장 함수 */
    async saveResult(result, rawDataIdx, rawDataMap) {
        const parsedResult = this.parseResult(result, rawDataIdx, rawDataMap);
        
        for (const routineData of parsedResult) {
            try {
                const response = await axios.post('/routine/add', routineData, {
                    withCredentials: true
                });

                if (response.data.success) {
                } else {
                    console.error('루틴 저장에 실패했습니다: ' + response.data.msg);
                }
            } catch (error) {
                console.error('루틴 저장 중 오류 발생:', error);
                alert('루틴 저장 중 오류가 발생했습니다. 콘솔을 확인하세요.');
                break;
            }
        }
    },

    /** 로그 예외 업데이트 */
    async updateLogException (log) {
        if (log.apilog_status_reason === null || log.apilog_status_reason === '') {
            log.apilog_status = 'success';
        } else {
            log.apilog_status = 'exception';
        }
        try {
            await axios.patch('/admin/api/exception', log)
                .then((res) => console.log('API 로그 업데이트 결과:', res.data));
        } catch (error) {
            console.error('API 로그 업데이트 실패:', error);
        }
    },

    /** 로그 사용자 행동 분석 업데이트 */
    async updateLogUserAction (log) {
        try {
            const response = await axios.patch('/admin/api/action', log);
            return response.data;
        } catch (error) {
            console.error('API 로그 업데이트 실패:', error);
        }
    },

    /** 로그 분석 함수
     * @param {Object} result - ApiResponseDTO
     */
    analyzeAIResult (result, userSplit, rawDataMap) {
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
                const name = ex.pt_name.replace(/\s+/g, '');
                const matchResult = findBestMatch(name, rawDataMap);
                
                if (!matchResult.found) {
                    console.warn(`유효하지 않은 운동명: ${name}`);
                    invalidExercises.push(ex.pt_name);
                }
            });
        });

        if (invalidExercises.length > 0) {
            errors.push("invalid_exercise: " + invalidExercises.join(", "));
        }

        return errors.length > 0 ? errors.join("; ") : null;
    },

    /**
     * @typedef {Object} ParsedApiLog
     * @property {number} apilog_idx - API 로그 고유 ID
     * @property {number} member_idx - 회원 고유 ID
     * @property {string} apilog_prompt - 원본 프롬프트 문자열(JSON)
     * @property {string} apilog_response - 원본 응답 문자열(JSON)
     * @property {number|string|Date} apilog_request_time - 요청 시각
     * @property {number|string|Date} apilog_response_time - 응답 시각
     * @property {number} apilog_input_tokens - 입력 토큰 수
     * @property {number} apilog_output_tokens - 출력 토큰 수
     * @property {string} apilog_model - 사용된 모델명
     * @property {string} apilog_version - API 버전
     * @property {string} apilog_service_type - 서비스 타입
     * @property {string} apilog_status - API 응답 상태
     * @property {string} apilog_status_reason - 상태 사유
     * @property {string} apilog_feedback - 피드백 내용
     * @property {string} apilog_feedback_reason - 피드백 사유
     * @property {string} apilog_user_action - 사용자 액션
     * @property {Object} parsed_prompt - 파싱된 프롬프트
     * @property {Object[]} parsed_response - 파싱된 응답
     * @property {Object|null} parsed_userMassage - 파싱된 사용자 메시지
     * @property {number} apilog_total_time - 요청~응답까지 소요 시간(초)
     */

    /**
     * API 로그 데이터 파싱 및 응답 시간 계산
     * @param {Object} apiLogItem - API 로그 아이템
     * @returns {ParsedApiLog} 파싱된 API 로그 데이터
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

    /** parseApiLogData 함수 return 값 예시 */
    exampleParsedApilog : {
        apilog_idx : 0,
        member_idx : 0,
        apilog_prompt : "",
        apilog_response : "",
        apilog_request_time : 0,
        apilog_response_time : 0,
        apilog_input_tokens : 0,
        apilog_output_tokens : 0,
        apilog_model : "",
        apilog_version : "",
        apilog_status : "",
        apilog_service_type : "",
        apilog_feedback : "",
        apilog_feedback_reason : "",
        apilog_status_reason : "",
        apilog_user_action : "",
        parsed_prompt : {},
        parsed_response : [{}],
        parsed_userMassage : {},
        apilog_total_time : 0
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
            return response.data;
        } catch (error) {
            console.error("통계 개요 호출 실패 : ", error);
        }
    },

    /** 운동 피드백 AI 서비스 */
    feedbackService : async ({message}) => {
        try {
            const response = await axios.post(
                'ai/feedback', 
                { message },
                { withCredentials: true }
            )
            console.log(response);
        } catch (error) {
            console.error('피드백 요청 실패');
        }
    }
};

export default AiUtil;

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
                            console.log(`Found similar exercise: ${ex.pt_name} → ${matchResult.matchedName} (score: ${matchResult.score})`);
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
        
        // console.log(result.content, result.logIdx);
        // console.log('파싱된 결과:', parsedResult);
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
                    console.log('루틴이 성공적으로 저장되었습니다.');
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
        console.log('업데이트할 로그:', log);
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
            console.log("사용자 행동 업데이트 : ", response);
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

export default AiUtil;

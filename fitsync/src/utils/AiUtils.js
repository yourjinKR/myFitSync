import axios from "axios";
import { getSimilarNamesByMap } from "./KorUtil";

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
                
                let finalName = null;
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
                    alert('루틴이 성공적으로 저장되었습니다.');
                } else {
                    alert('루틴 저장에 실패했습니다: ' + response.data.msg);
                }
            } catch (error) {
                console.error('루틴 저장 중 오류 발생:', error);
                alert('루틴 저장 중 오류가 발생했습니다. 콘솔을 확인하세요.');
                break;
            }
        }
    },

    /** 로그 업데이트 */
    async updateLogException (log) {
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
    },

    /** 로그 분석 함수 */
    analyzeAIResult (result, userSplit, validWorkoutNames) {
        console.log('해당 결과를 분석 :', result);
        console.log('유저 분할:', userSplit);
        

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
    },
};

export default AiUtil;

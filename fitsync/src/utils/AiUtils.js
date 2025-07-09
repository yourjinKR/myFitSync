import axios from "axios";
import { getSimilarNamesByMap } from "./KorUtil";

const AiUtil = {
    /** 결과 파싱 함수 */
    parseResult(result, rawDataIdx, rawDataMap) {
        if (!result.content || !result.logIdx) {
            alert('결과가 없습니다. AI 루틴 생성을 먼저 실행해주세요.');
            return [];
        }

        const parsedResult = result.content.map((routine, idx) => {
            const routine_name = routine.routine_name + ' (AI 생성)' || `AI 추천 루틴 ${idx + 1}`;
            
            const parsedExerciseList = routine.exercises.map(ex => {
                let exIdx = rawDataIdx.find(item => item.pt_name === ex.pt_name.replace(/\s+/g, ''))?.pt_idx || null;

                if (exIdx === null) {
                    const similarList = getSimilarNamesByMap(ex.pt_name, rawDataMap);
                    const similarName = similarList.length > 0 ? similarList[0].name : null;
                    if (similarName) {
                        exIdx = rawDataIdx.find(item => item.pt_name === similarName)?.pt_idx || null;
                    } else {
                        console.warn(`유효하지 않은 운동명: ${ex.pt_name}`);
                    }
                }

                const routineSet = Array.from({ length: ex.set_num }, () => ({
                    set_volume: ex.set_volume,
                    set_count: ex.set_count
                }));

                return {
                    pt_idx: exIdx,
                    name: null,
                    routine_memo: "",
                    routineSet: routineSet
                };
            });

            return {
                routine_name,
                member_idx: null,
                writer_idx: 0,
                list: parsedExerciseList
            };
        });

        console.log(result.content, result.logIdx);
        console.log('파싱된 결과:', parsedResult);
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
    }
};

export default AiUtil;

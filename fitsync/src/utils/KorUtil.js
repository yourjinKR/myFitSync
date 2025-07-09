import { disassemble } from 'es-hangul';

// 된소리 자음 매핑
const tenseConsonantMap = {
    'ㄲ': 'ㄱ',
    'ㄸ': 'ㄷ',
    'ㅃ': 'ㅂ',
    'ㅆ': 'ㅅ',
    'ㅉ': 'ㅈ',
};

/**
 * 자모음 분해 및 정규화
 * @param {string} name - 분해할 한글 문자열
 * @returns {Object} - { normalized: 정규화된 문자열, length: 길이 }
 */
export function normalizeAndDisassemble(name) {
    const trimmed = name.replace(/\s+/g, '');
    const dis = disassemble(trimmed);
    const normalized = dis
        .replace(/ㅐ/g, 'ㅔ')
        .replace(/[ㄲㄸㅃㅆㅉ]/g, ch => tenseConsonantMap[ch] || ch);
    return { normalized, length: normalized.length };
}

/**
 * 레벤슈타인 거리 계산 (편집 거리)
 * @param {string} a - 비교할 첫 번째 문자열
 * @param {string} b - 비교할 두 번째 문자열
 * @returns {number} - 편집 거리
 */
export function levenshtein(a, b) {
    const matrix = Array.from({ length: a.length + 1 }, (_, i) =>
        Array(b.length + 1).fill(i === 0 ? 0 : i)
    );
    for (let j = 1; j <= b.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1, // 삭제
                matrix[i][j - 1] + 1, // 삽입
                matrix[i - 1][j - 1] + cost // 치환
            );
        }
    }
    return matrix[a.length][b.length];
}

/**
 * 유사한 운동명 찾기 (배열 버전)
 * @param {string} input - 입력된 운동명
 * @param {Array} dataList - 운동명 데이터 리스트
 * @param {number} maxLengthDiff - 최대 길이 차이 (기본값: 1)
 * @param {number} maxDistance - 최대 편집 거리 (기본값: 2)
 * @returns {Array} - 유사한 운동명 리스트
 */
export function getSimilarNamesByList(input, dataList, maxLengthDiff = 1, maxDistance = 2) {
    const { normalized: inputDis, length: inputLen } = normalizeAndDisassemble(input);

    const result = dataList
        .filter(item => Math.abs(item.length - inputLen) <= maxLengthDiff)
        .map(item => {
            const score = levenshtein(inputDis, item.name_dis);
            return { name: item.name, score };
        })
        .filter(({ score }) => score <= maxDistance)
        .sort((a, b) => a.score - b.score);
    
    console.log(input, '과 유사한 운동명:', result);

    return result.length > 0 ? result : [{ name: '유사 운동명 찾지 못함', score: 0 }];
}

/**
 * 유사한 운동명 찾기 (맵 버전)
 * @param {string} input - 입력된 운동명
 * @param {Map} dataMap - 운동명 데이터 맵 (길이별로 그룹화된 운동명)
 * @param {number} maxLengthDiff - 최대 길이 차이 (기본값: 1)
 * @param {number} maxDistance - 최대 편집 거리 (기본값: 2)
 * @returns {Array} - 유사한 운동명 리스트
 */
export function getSimilarNamesByMap(input, dataMap, maxLengthDiff = 1, maxDistance = 2) {
    const { normalized: inputDis, length: inputLen } = normalizeAndDisassemble(input);

    const candidates = Array.from(dataMap.entries())
        .filter(([length, items]) => Math.abs(length - inputLen) <= maxLengthDiff)
        .flatMap(([, items]) => items);

    const result = candidates
        .map(item => {
            const score = levenshtein(inputDis, item.name_dis);
            return { name: item.name, score };
        })
        .filter(({ score }) => score <= maxDistance)
        .sort((a, b) => a.score - b.score);

    return result.length > 0 ? result : [{ name: '유사 운동명 찾지 못함', score: 0 }];
}

/**
 * 운동명 데이터를 길이별로 그룹화하여 맵 생성
 * @param {Array} workoutNames - 운동명 배열
 * @returns {Map} - 길이별로 그룹화된 운동명 맵
 */
export function createWorkoutNameMap(workoutNames) {
    const groupedMap = new Map();
    
    workoutNames.forEach(originalName => {
        const { normalized, length } = normalizeAndDisassemble(originalName);
        const entry = { name: originalName, name_dis: normalized };

        if (!groupedMap.has(length)) {
            groupedMap.set(length, []);
        }
        groupedMap.get(length).push(entry);
    });

    return groupedMap;
}

/**
 * 운동명 데이터를 객체 형태로 변환
 * @param {Array} workoutNames - 운동명 배열
 * @returns {Array} - 변환된 운동명 객체 배열
 */
export function createWorkoutNameObjects(workoutNames) {
    return workoutNames.map(name => {
        const { normalized, length } = normalizeAndDisassemble(name);
        return { name: name, name_dis: normalized, length: length };
    });
}

/** 운동명을  */

/** 응답 결과의 운동명들을 전부 확인 후 각각 이름을 유사어로 반환 */
export function checkAllExerciseNames(result, dataMap) {
    console.log('Checking all exercise names in the result...');
    
    const changedNameResult = result.content.map(routine => {
        // console.log(routine.exercises);
        const updatedExercises = routine.exercises.map(exercise => {
            // console.log(`Checking exercise: ${exercise.pt_name}`);
            const similarNames = getSimilarNamesByMap(exercise.pt_name, dataMap);
            if (similarNames.length > 0) {
                // console.log(`Found similar names for ${exercise.pt_name}:`, similarNames);
                return { ...exercise, pt_name: similarNames[0].name };
            } else {
                console.warn(`No similar names found for ${exercise.pt_name}`);
                return exercise; // 유사한 이름이 없으면 원래 이름 유지
            }
        });
        return {
            ...routine,
            exercises: updatedExercises
        };
    });
    return {
        ...result,
        content: changedNameResult
    };
}

/** DB에 저장되지 않은 운동명, 이름을 다르게 부르는 운동명 */ 
const exceptionNames = [
    {pt_idx: 24, pt_name: '카프 레이즈'},
    {pt_idx: 2, pt_name: '데드리프트'},
    {pt_idx: 238, pt_name: '윗몸 일으키기'}, 
];

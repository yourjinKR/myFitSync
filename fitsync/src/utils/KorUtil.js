import { disassemble } from 'es-hangul';

// 된소리 자음 매핑
const tenseConsonantMap = {
    'ㄲ': 'ㄱ',
    'ㄸ': 'ㄷ',
    'ㅃ': 'ㅂ',
    'ㅆ': 'ㅅ',
    'ㅉ': 'ㅈ',
};

// 매칭 결과 상수 정의
export const MATCH_RESULT = {
    NO_MATCH_FOUND: -1,
    EXACT_MATCH: 0
};

// 매칭 타입 상수 정의
export const MATCH_TYPE = {
    EXACT: 'exact',
    SIMILAR: 'similar',
    NONE: 'none'
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
 * 유사한 운동명 찾기 (배열 버전) - 개선된 버전
 * @param {string} input - 입력된 운동명
 * @param {Array} dataList - 운동명 데이터 리스트
 * @param {number} maxLengthDiff - 최대 길이 차이 (기본값: 1)
 * @param {number} maxDistance - 최대 편집 거리 (기본값: 2)
 * @returns {Array} - 유사한 운동명 리스트 (빈 배열이면 매칭 실패)
 */
export function getSimilarNamesByList(input, dataList, maxLengthDiff = 1, maxDistance = 2) {
    const { normalized: inputDis, length: inputLen } = normalizeAndDisassemble(input);

    const result = dataList
        .filter(item => Math.abs(item.length - inputLen) <= maxLengthDiff)
        .map(item => {
            const score = levenshtein(inputDis, item.name_dis);
            return { 
                name: item.name, 
                score,
                matchType: score === MATCH_RESULT.EXACT_MATCH ? MATCH_TYPE.EXACT : MATCH_TYPE.SIMILAR
            };
        })
        .filter(({ score }) => score <= maxDistance)
        .sort((a, b) => a.score - b.score);
    
    return result;
}

/**
 * 유사한 운동명 찾기 (맵 버전) - 개선된 버전
 * @param {string} input - 입력된 운동명
 * @param {Map} dataMap - 운동명 데이터 맵 (길이별로 그룹화된 운동명)
 * @param {number} maxLengthDiff - 최대 길이 차이 (기본값: 1)
 * @param {number} maxDistance - 최대 편집 거리 (기본값: 2)
 * @returns {Array} - 유사한 운동명 리스트 (빈 배열이면 매칭 실패)
 */
export function getSimilarNamesByMap(input, dataMap, maxLengthDiff = 1, maxDistance = 2) {
    const { normalized: inputDis, length: inputLen } = normalizeAndDisassemble(input);

    const candidates = Array.from(dataMap.entries())
        .filter(([length, items]) => Math.abs(length - inputLen) <= maxLengthDiff)
        .flatMap(([, items]) => items);

    const result = candidates
        .map(item => {
            const score = levenshtein(inputDis, item.name_dis);
            return { 
                name: item.name, 
                score,
                matchType: score === MATCH_RESULT.EXACT_MATCH ? MATCH_TYPE.EXACT : MATCH_TYPE.SIMILAR,
                idx: item.idx || null
            };
        })
        .filter(({ score }) => score <= maxDistance)
        .sort((a, b) => a.score - b.score);

    return result;
}

/**
 * 최적의 매칭 결과를 찾는 래퍼 함수
 * @param {string} input - 입력된 운동명
 * @param {Map} dataMap - 운동명 데이터 맵
 * @param {number} maxLengthDiff - 최대 길이 차이 (기본값: 1)
 * @param {number} maxDistance - 최대 편집 거리 (기본값: 2)
 * @returns {Object} - 매칭 결과 객체
 */
export function findBestMatch(input, dataMap, maxLengthDiff = 1, maxDistance = 2) {
    const matches = getSimilarNamesByMap(input, dataMap, maxLengthDiff, maxDistance);
    
    if (!matches || matches.length === 0) {
        return {
            found: false,
            originalName: input,
            matchedName: null,
            score: MATCH_RESULT.NO_MATCH_FOUND,
            matchType: MATCH_TYPE.NONE,
            isValid: false
        };
    }

    const bestMatch = matches[0];
    return {
        found: true,
        originalName: input,
        matchedName: bestMatch.name,
        score: bestMatch.score,
        matchType: bestMatch.matchType,
        isValid: true,
        idx: bestMatch.idx,
        allMatches: matches
    };
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

/**
 * 응답 결과의 운동명들을 전부 확인 후 각각 이름을 유사어로 반환 - 개선된 버전
 * @param {Object} result - AI 응답 결과 객체
 * @param {Map} dataMap - 운동명 데이터 맵
 * @returns {Object} - 매칭 정보가 포함된 결과 객체
 */
export function checkAllExerciseNames(result, dataMap) {
    
    const changedNameResult = result.content.map(routine => {
        const updatedExercises = routine.exercises.map(exercise => {
            const originalName = exercise.pt_name;
            const matchResult = findBestMatch(originalName, dataMap);
            
            if (matchResult.found) {
                if (matchResult.score > 0) {
                    console.log(`Found similar name for ${originalName}: ${matchResult.matchedName} (score: ${matchResult.score})`);
                }
                
                return { 
                    ...exercise, 
                    pt_name: matchResult.matchedName,
                    // 매칭 정보도 함께 저장
                    originalName: originalName,
                    matchInfo: {
                        isValid: true,
                        matchType: matchResult.matchType,
                        score: matchResult.score
                    }
                };
            } else {
                console.warn(`No similar names found for ${originalName}`);
                return {
                    ...exercise,
                    matchInfo: {
                        isValid: false,
                        matchType: MATCH_TYPE.NONE,
                        score: MATCH_RESULT.NO_MATCH_FOUND
                    }
                };
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

/**
 * 생년월일(YYYYMMDD 또는 timestamp)을 현재 나이로 변환하는 함수
 *
 * @param {string|number} memberBirth - YYYYMMDD (예: "19900315") 또는 밀리초 단위 timestamp (예: 953478000000)
 * @returns {number} 현재 나이
 * @throws {Error} 입력값이 올바르지 않을 때
 */
export const calculateAge = (memberBirth) => {
    try {
        let birthDate;

        if (typeof memberBirth === 'number' && memberBirth > 100000000000) {
            // timestamp (밀리초 단위)인 경우
            birthDate = new Date(memberBirth);
        } else {
            // 문자열로 변환
            const birthStr = String(memberBirth);

            // 8자리가 아닌 경우 에러
            if (!/^\d{8}$/.test(birthStr)) {
                throw new Error("생년월일은 8자리 YYYYMMDD 또는 timestamp(밀리초)여야 합니다.");
            }

            const birthYear = parseInt(birthStr.slice(0, 4), 10);
            const birthMonth = parseInt(birthStr.slice(4, 6), 10);
            const birthDay = parseInt(birthStr.slice(6, 8), 10);

            birthDate = new Date(birthYear, birthMonth - 1, birthDay);

            // 유효성 체크
            if (
                birthDate.getFullYear() !== birthYear ||
                birthDate.getMonth() !== birthMonth - 1 ||
                birthDate.getDate() !== birthDay
            ) {
                throw new Error("존재하지 않는 날짜입니다.");
            }
        }

        // 현재 날짜
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();

        const monthDiff = today.getMonth() - birthDate.getMonth();
        const dayDiff = today.getDate() - birthDate.getDate();

        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
            age -= 1;
        }

        return age;

    } catch (error) {
        throw new Error(`나이 계산 실패: ${error.message}`);
    }
};



const versionUtils = {
    /** 현재 버전이 target 이상인지 확인 */
    isVersionAtLeast: (current, target) => {
        const currentParts = current.split('.').map(Number);
        const targetParts = target.split('.').map(Number);

        for (let i = 0; i < Math.max(currentParts.length, targetParts.length); i++) {
            const cur = currentParts[i] || 0;
            const tar = targetParts[i] || 0;
            if (cur > tar) return true;
            if (cur < tar) return false;
        }
        return true;
    },

    /** 두 버전이 동일한지 확인 */
    isVersionEqual: (v1, v2) => {
        const p1 = v1.split('.').map(Number);
        const p2 = v2.split('.').map(Number);

        const maxLen = Math.max(p1.length, p2.length);
        for (let i = 0; i < maxLen; i++) {
            if ((p1[i] || 0) !== (p2[i] || 0)) return false;
        }
        return true;
    },

    /** 현재 버전이 target보다 더 높은지 확인 */
    isVersionGreater: (v1, v2) => {
        const p1 = v1.split('.').map(Number);
        const p2 = v2.split('.').map(Number);

        for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
            const a = p1[i] || 0;
            const b = p2[i] || 0;
            if (a > b) return true;
            if (a < b) return false;
        }
        return false;
    },

    /** sort를 위한 버전 비교 함수 */
    compareVersions: (a, b) => {
        const p1 = a.split('.').map(Number);
        const p2 = b.split('.').map(Number);

        for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
            const v1 = p1[i] || 0;
            const v2 = p2[i] || 0;
            if (v1 > v2) return 1;
            if (v1 < v2) return -1;
        }
        return 0;
    },

    /** 버전 문자열을 숫자 형태로 변환 (정렬/비교용) */
    versionToNumber: (version, padding = 3) =>
        version
            .split('.')
            .map(num => String(num).padStart(padding, '0'))
            .join(''),

    /** 버전이 주어진 범위 내에 있는지 확인 */
    isVersionInRange: (version, min, max) =>
        versionUtils.isVersionAtLeast(version, min) &&
        !versionUtils.isVersionGreater(version, max)
};

export default versionUtils;

/**
 * YYYYMMDD 형태의 생년월일을 현재 나이로 변환하는 함수
 * 
 * @param {string|number} memberBirth - YYYYMMDD 형태의 생년월일 (예: "19900315" 또는 19900315)
 * @returns {number} 현재 나이
 * @throws {Error} 입력값이 올바르지 않을 때
 */
export const calculateAge = (memberBirth) => {
    try {
        // 입력값을 문자열로 변환
        const birthStr = String(memberBirth);
        
        // 8자리가 아닌 경우 에러 처리
        if (birthStr.length !== 8) {
            throw new Error("생년월일은 8자리 YYYYMMDD 형태여야 합니다.");
        }
        
        // 년, 월, 일 분리
        const birthYear = parseInt(birthStr.slice(0, 4));
        const birthMonth = parseInt(birthStr.slice(4, 6));
        const birthDay = parseInt(birthStr.slice(6, 8));
        
        // 생년월일 Date 객체 생성 (월은 0부터 시작하므로 -1)
        const birthDate = new Date(birthYear, birthMonth - 1, birthDay);
        
        // 유효한 날짜인지 확인
        if (birthDate.getFullYear() !== birthYear || 
            birthDate.getMonth() !== birthMonth - 1 || 
            birthDate.getDate() !== birthDay) {
            throw new Error("존재하지 않는 날짜입니다.");
        }
        
        // 현재 날짜
        const today = new Date();
        
        // 나이 계산
        let age = today.getFullYear() - birthDate.getFullYear();
        
        // 생일이 지나지 않았다면 나이에서 1을 뺌
        const todayMonth = today.getMonth();
        const todayDay = today.getDate();
        const birthMonthIndex = birthDate.getMonth();
        const birthDayOfMonth = birthDate.getDate();
        
        if (todayMonth < birthMonthIndex || 
            (todayMonth === birthMonthIndex && todayDay < birthDayOfMonth)) {
            age -= 1;
        }
        
        return age;
        
    } catch (error) {
        if (error.message.includes("생년월일") || error.message.includes("존재하지")) {
            throw error;
        } else {
            throw new Error(`올바르지 않은 날짜 형식입니다: ${memberBirth}`);
        }
    }
}
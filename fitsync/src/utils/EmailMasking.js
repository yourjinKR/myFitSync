// 이메일 주소를 마스킹 처리하는 함수
export const maskEmail = (email) => {
  // 입력값 검증
  if (!email || typeof email !== 'string') {
    return email || '';
  }

  // @가 없는 경우 원본 반환
  const atIndex = email.indexOf('@');
  if (atIndex === -1) {
    return email;
  }

  // @ 앞부분과 뒷부분 분리
  const localPart = email.substring(0, atIndex);
  const domainPart = email.substring(atIndex);

  // @ 앞부분이 3자리 이하면 그대로 반환
  if (localPart.length <= 3) {
    return email;
  }

  // @ 앞부분이 4자리 이상이면 마스킹 처리
  const visiblePart = localPart.substring(0, 3); // 앞의 3자리
  const maskedPart = '*'.repeat(localPart.length - 3); // 나머지는 * 처리
  const maskedEmail = visiblePart + maskedPart + domainPart;
  return maskedEmail;
};

// 이메일 마스킹 여부를 확인하는 함수 (테스트/디버깅용)
export const shouldMaskEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  
  const atIndex = email.indexOf('@');
  if (atIndex === -1) return false;
  
  const localPart = email.substring(0, atIndex);
  return localPart.length > 3;
};

// 여러 이메일을 한번에 마스킹 처리하는 함수 (배치 처리용)
export const maskEmails = (emails) => {
  if (!Array.isArray(emails)) {
    return [];
  }

  return emails.map(email => maskEmail(email));
};

// 개발/테스트용 마스킹 예시 함수
export const getEmailMaskingExamples = () => {
  const testCases = [
    'a@gmail.com',           // 1자리 - 마스킹 없음
    'ab@gmail.com',          // 2자리 - 마스킹 없음  
    'abc@gmail.com',         // 3자리 - 마스킹 없음
    'abcd@gmail.com',        // 4자리 - abc*@gmail.com
    'abcde@gmail.com',       // 5자리 - abc**@gmail.com
    'buddy199797@gmail.com', // 10자리 - bud*******@gmail.com
    'testuser123@naver.com', // 11자리 - tes********@naver.com
    'admin@company.co.kr',   // 5자리 - adm**@company.co.kr
  ];

  const results = testCases.map(email => {
    const masked = maskEmail(email);
    const result = {
      원본: email,
      결과: masked,
      마스킹됨: email !== masked
    };
    return result;
  });

  return results;
};
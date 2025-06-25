import { useState, useRef } from 'react';

// 폼 입력값과 유효성 검사를 관리하는 커스텀 훅
export function useFormValidation(init, validateFn) {
  const [info, setInfo] = useState(init);         // 입력값 상태
  const [invalid, setInvalid] = useState({});     // 에러 상태
  const inputRefs = useRef({});                   // 각 input의 ref

  // 입력값 변경 시 값과 에러 상태 갱신
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInfo((prev) => ({ ...prev, [name]: value }));
    setInvalid((prev) => ({ ...prev, [name]: false }));
  };

  // 유효성 검사: 실패 시 첫 에러 필드에 포커스
  const validate = () => {
    const newInvalid = validateFn(info);
    setInvalid(newInvalid);
    const firstInvalidKey = Object.keys(newInvalid)[0];
    if (firstInvalidKey) {
      inputRefs.current[firstInvalidKey] && inputRefs.current[firstInvalidKey].focus();
      return false;
    }
    return true;
  };

  return { info, setInfo, invalid, setInvalid, inputRefs, handleChange, validate };
}
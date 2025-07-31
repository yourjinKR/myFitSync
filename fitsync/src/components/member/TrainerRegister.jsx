import axios from 'axios';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormGroup, Label, TimeSelect, TimeInputWrapper, ButtonSubmit } from '../../styles/FormStyles';
import { useFormValidation } from '../../hooks/useFormValidation';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../../action/userAction';
import AreaDropDown from '../../hooks/AreaDropDown';

const TrainerRegisterWrapper = styled.div`
  width: 100%;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-light);
  height: 100%;
  padding: 20px;

  label { 
    font-size: 2.2rem;
    color: var(--text-white);
  }

  select {
    margin-bottom: 0 !important;
  }
`;

const ButtonBox = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  gap: 10px;
`;


// 체크박스 커스텀 스타일
const CheckboxWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 8px;

  label {
    font-size: 1.8rem;
    color: var(--text-black);
  }
`;

const CustomCheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1rem;
  font-weight: ${({ $active }) => ($active ? 700 : 500)};
  color: ${({ $active, $invalid }) =>
    $invalid ? '#ff4d4f' : $active ? '#4B6FFF' : '#393e53'} !important;
  background: ${({ $active, $invalid }) =>
    $invalid
      ? "#fff0f0"
      : $active
      ? "#eaf0ff"
      : "#fff"};
  border: 2px solid
    ${({ $active, $invalid }) =>
      $invalid ? '#ff4d4f' : $active ? '#4B6FFF' : '#e3e7f1'};
  border-radius: 10px;
  padding: 8px 18px;
  transition: background 0.18s, color 0.18s, border 0.18s, font-weight 0.18s;
  user-select: none;
  min-width: 120px;
  min-height: 36px;
  box-sizing: border-box;

  &:hover {
    border-color: #7D93FF;
    background: #f4f7ff;
    color: #7D93FF !important;
    font-weight: 700;
  }

  /* 내부 span 등에도 강제 적용 */
  * {
    color: inherit !important;
    font-weight: inherit !important;
  }
`;

const CustomCheckbox = styled.input.attrs({ type: 'checkbox' })`
  display: none;
`;


const GenderSelectWrapper = styled.div`
  display: flex;
  gap: 15px;
  width: 100%; /* 전체 폭 사용 */
  margin-bottom: 8px;
`;

const GenderButton = styled.button`
  flex: 1 1 0;
  height: 45px;
  border-radius: 10px;
  border: 2px solid
    ${({ selected, $invalid }) =>
      $invalid ? "#ff4d4f" : selected ? "#4B6FFF" : "#e3e7f1"};
  background: ${({ selected, $invalid }) =>
    $invalid
      ? "#fff0f0" // 에러 시 연한 빨간 배경
      : selected
      ? "#eaf0ff"
      : "#fff"};
  color: ${({ selected, $invalid }) =>
    $invalid
      ? "#ff4d4f"
      : selected
      ? "#4B6FFF"
      : "var(--text-black)"};
  font-size: 1.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  outline: none;
  min-width: 0;
  padding: 0;

  &:hover {
    border-color: #7D93FF;
    background: #f4f7ff;
    color: #7D93FF;
  }
`;

const timeOptions = [];
for (let h = 0; h < 24; h++) {
  const hh = h.toString().padStart(2, '0');
  timeOptions.push(`${hh}:00`);
}


const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

// 1. 운동목적 옵션 배열 추가
const purposeOptions = [
  "체중 관리",
  "근육 증가",
  "체형 교정",
  "체력 증진",
  "재활",
  "바디 프로필"
];

// 2. init에 member_purpose: []로 변경
const init = {
  member_type: "trainer",
  member_time_start: '',
  member_time_end: '',
  member_activity_area: '',
  member_day: [],
  member_purpose: [] // 배열로!
};

const textAreaPattern = /^.{1,500}$/;
const textPattern = /^[가-힣a-zA-Z0-9\s]{1,30}$/;
const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

// 유효성 검사 함수 수정
function validateFn(info) {
  const newInvalid = {};
  if (!info.member_gender) newInvalid.member_gender = true;
  if (!info.sido1 || info.sido1 === "시/도 선택") newInvalid.sido1 = true;
  if (!info.gugun1 || info.gugun1 === "군/구 선택") newInvalid.gugun1 = true;
  if (!info.member_day || info.member_day.length === 0) newInvalid.member_day = true;
  if (!info.member_purpose || info.member_purpose.length === 0) newInvalid.member_purpose = true; // 추가
  if (!info.member_time_start || !timePattern.test(info.member_time_start)) newInvalid.member_time_start = true;
  if (!info.member_time_end || !timePattern.test(info.member_time_end)) newInvalid.member_time_end = true;
  if (
    info.member_time_start &&
    info.member_time_end &&
    timePattern.test(info.member_time_start) &&
    timePattern.test(info.member_time_end) &&
    info.member_time_start >= info.member_time_end
  ) {
    newInvalid.member_time_start = true;
    newInvalid.member_time_end = true;
  }
  return newInvalid;
}

const TrainerRegister = () => {
  const nav = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.user);
  const { info, setInfo, invalid, setInvalid, inputRefs, handleChange, validate } = useFormValidation(init, validateFn);


  useEffect(() => {
    setInfo({
      ...info,
      ...user
    })
  }, [])

  // 요일 체크박스 상태 관리
  const handleDayChange = (e) => {
    const { value, checked } = e.target;
    setInfo((prev) => ({
      ...prev,
      member_day: checked
        ? [...prev.member_day, value]
        : prev.member_day.filter((d) => d !== value)
    }));
    setInvalid((prev) => ({ ...prev, member_day: false }));
  };

  // 운동 목적 체크박스 상태 관리
  const handleChangePurpose = (e) => {
    const { value, checked } = e.target;
    setInfo((prev) => ({
      ...prev,
      member_purpose: checked
        ? [...prev.member_purpose, value]
        : prev.member_purpose.filter((p) => p !== value)
    }));
    setInvalid((prev) => ({ ...prev, member_purpose: false }));
  };

  // 시간 선택 핸들러
  const handleTimeSelect = (e) => {
    handleChange(e);
  };

  // 정보 전송
  const handleSubmit = () => {
    if (!validate()) {
      // 시간 논리 오류(시작 >= 종료)는 가장 먼저 체크
      if (
        info.member_time_start &&
        info.member_time_end &&
        info.member_time_start >= info.member_time_end
      ) {
        alert('수업 시작 시간은 종료 시간보다 이전이어야 합니다.');
        return;
      }

      // 각 필수항목에 맞는 알럿을 순서대로 표시
      const alertMsg = {
        member_gender: '성별을 선택해주세요.',
        sido1: '시/도를 선택해주세요.',
        gugun1: '군/구를 선택해주세요.',
        member_day: '수업 가능 요일을 1개 이상 선택해주세요.',
        member_purpose: '운동 목적을 1개 이상 선택해주세요.', // 추가
        member_time_start: '수업 시작 시간은 24시간제 HH:MM 형식으로 입력해주세요.',
        member_time_end: '수업 종료 시간은 24시간제 HH:MM 형식으로 입력해주세요.'
      };
      for (const key of Object.keys(alertMsg)) {
        if (invalid[key]) {
          alert(alertMsg[key]);
          return;
        }
      }
      alert('입력값을 확인해주세요.');
      return;
    }

    // member_day와 member_purpose를 문자열로 변환해서 전송
    const sendInfo = {
      ...info,
      member_day: Array.isArray(info.member_day) ? info.member_day.join(',') : info.member_day,
      member_purpose: Array.isArray(info.member_purpose) ? info.member_purpose.join(',') : info.member_purpose,
      member_activity_area: `${info.sido1 || ''} ${info.gugun1 || ''}`.trim()
    };

    postInfo(sendInfo);
  };

  const postInfo = async (sendInfoParam) => {
    // sendInfoParam이 있으면 그걸 사용, 없으면 info에서 변환
    const sendInfo = sendInfoParam || {
      ...info,
      member_day: Array.isArray(info.member_day) ? info.member_day.join(',') : info.member_day,
      member_purpose: Array.isArray(info.member_purpose) ? info.member_purpose.join(',') : info.member_purpose,
      member_activity_area: `${info.sido1 || ''} ${info.gugun1 || ''}`.trim()
    };

    const response = await axios.post('/member/register', sendInfo);
    if (response.data.success) {
      dispatch(setUser(response.data.user));
      alert('회원 정보가 등록되었습니다.');
      nav("/");
    } else {
      alert('회원 정보 등록에 실패했습니다.');
    }
  };


  return (
    <TrainerRegisterWrapper>
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSubmit();
        }}
      >
         <FormGroup>
          <Label>성별 <span>(필수)</span></Label>
          <GenderSelectWrapper>
            <GenderButton
              type="button"
              selected={info.member_gender === "남성"}
              $invalid={invalid.member_gender}
              onClick={() => handleChange({ target: { name: "member_gender", value: "남성" } })}
            >
              남성
            </GenderButton>
            <GenderButton
              type="button"
              selected={info.member_gender === "여성"}
              $invalid={invalid.member_gender}
              onClick={() => handleChange({ target: { name: "member_gender", value: "여성" } })}
            >
              여성
            </GenderButton>
          </GenderSelectWrapper>
        </FormGroup>
        <FormGroup>
          <Label htmlFor='member_day'>수업 가능 요일 <span>(필수)</span></Label>
          <CheckboxWrapper>
            {days.map((day) => (
              <CustomCheckboxLabel
                key={day}
                $active={info.member_day.includes(day)}
                $invalid={invalid.member_day}
              >
                <CustomCheckbox
                  name="member_day"
                  value={day}
                  checked={info.member_day.includes(day)}
                  onChange={handleDayChange}
                />
                {day}
              </CustomCheckboxLabel>
            ))}
          </CheckboxWrapper>
        </FormGroup>
        <FormGroup>
          <Label htmlFor='member_time_start'>수업 가능 시간 <span>(필수, 24시간제)</span></Label>
          <TimeInputWrapper>
            <TimeSelect
              name="member_time_start"
              id="member_time_start"
              value={info.member_time_start}
              onChange={handleTimeSelect}
              ref={el => (inputRefs.current.member_time_start = el)}
              $invalid={invalid.member_time_start}
            >
              <option value="">시작 시간</option>
              {timeOptions.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </TimeSelect>
            <span>~</span>
            <TimeSelect
              name="member_time_end"
              id="member_time_end"
              value={info.member_time_end}
              onChange={handleChange}
              $invalid={invalid.member_time_end}
              ref={el => (inputRefs.current.member_time_end = el)}
            >
              <option value="">종료 시간</option>
              {timeOptions
                .filter(
                  (t) =>
                    !info.member_time_start || t > info.member_time_start // 시작시간 이후만
                )
                .map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
            </TimeSelect>
          </TimeInputWrapper>
        </FormGroup>
        <FormGroup>
          <Label htmlFor='member_activity_area'>활동지역 <span>(필수)</span></Label>
          <AreaDropDown handleChange={handleChange} invalid={invalid} inputRefs={inputRefs} info={info}/>
        </FormGroup>
        <FormGroup>
          <Label htmlFor='member_purpose'>운동목적 <span>(필수, 1개 이상)</span></Label>
          <CheckboxWrapper>
            {purposeOptions.map((purpose) => (
              <CustomCheckboxLabel
                key={purpose}
                $active={info.member_purpose.includes(purpose)}
                $invalid={invalid.member_purpose}
              >
                <CustomCheckbox
                  name="member_purpose"
                  value={purpose}
                  checked={info.member_purpose.includes(purpose)}
                  onChange={handleChangePurpose}
                />
                {purpose}
              </CustomCheckboxLabel>
            ))}
          </CheckboxWrapper>
        </FormGroup>
        <ButtonBox>
          <ButtonSubmit type="submit">등록</ButtonSubmit>
        </ButtonBox>
      </form>
    </TrainerRegisterWrapper>
  );
};

export default TrainerRegister;
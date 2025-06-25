import axios from 'axios';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormGroup, Label, Input, TextArea, TimeSelect, TimeInputWrapper, ButtonSubmit } from '../../styles/FormStyles';
import { useFormValidation } from '../../hooks/useFormValidation';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../../action/userAction';

const TrainerRegisterWrapper = styled.div`
  margin: 0 auto;
  padding: 15px;
  background: #fff;
  border-radius: 16px;
`;

// 체크박스 커스텀 스타일
const CheckboxWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 8px;
`;

const CustomCheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  color: ${({ $active }) => ($active ? '#fff' : '#393e53')};
  background: ${({ $active }) => ($active ? '#7D93FF' : '#f4f6fb')};
  border: 2px solid #7D93FF;
  border-radius: 20px;
  padding: 8px 18px;
  transition: background 0.18s, color 0.18s, border 0.18s;
  user-select: none;
  min-width: 60px;
  min-height: 36px;
  box-sizing: border-box;

  &:hover {
    background: #e3e7f9;
    color: #5e72e4;
  }
`;

const CustomCheckbox = styled.input.attrs({ type: 'checkbox' })`
  display: none;
`;

const timeOptions = [];
for (let h = 0; h < 24; h++) {
  const hh = h.toString().padStart(2, '0');
  timeOptions.push(`${hh}:00`);
}


const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

const init = {
  member_type: "trainer",
  member_time_start: '',
  member_time_end: '',
  member_activity_area: '',
  member_info: '',
  member_day: []
};

const textAreaPattern = /^.{1,500}$/;
const textPattern = /^[가-힣a-zA-Z0-9\s]{1,30}$/;
const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

// 유효성 검사 함수
function validateFn(info) {
  const newInvalid = {};
  if (!info.member_day || info.member_day.length === 0) {
    newInvalid.member_day = true;
  }
  if (!info.member_time_start || !timePattern.test(info.member_time_start)) {
    newInvalid.member_time_start = true;
  }
  if (!info.member_time_end || !timePattern.test(info.member_time_end)) {
    newInvalid.member_time_end = true;
  }
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
  if (!info.member_activity_area || !textPattern.test(info.member_activity_area)) {
    newInvalid.member_activity_area = true;
  }
  if (!info.member_info || !textAreaPattern.test(info.member_info)) {
    newInvalid.member_info = true;
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
        member_day: '수업 가능 요일을 1개 이상 선택해주세요.',
        member_time_start: '수업 시작 시간은 24시간제 HH:MM 형식으로 입력해주세요.',
        member_time_end: '수업 종료 시간은 24시간제 HH:MM 형식으로 입력해주세요.',
        member_activity_area: '활동지역을 1~30자 이내로 입력해주세요.',
        member_info: '자기소개를 1~500자 이내로 입력해주세요.'
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

    // member_day를 문자열로 변환해서 전송
    const sendInfo = {
      ...info,
      member_day: Array.isArray(info.member_day) ? info.member_day.join(',') : info.member_day
    };

    postInfo(sendInfo);
  };

  const postInfo = async (sendInfo) => {
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
      <FormGroup>
        <h3 htmlFor='member_day'>수업 가능 요일 <span>(필수)</span></h3>
        <CheckboxWrapper>
          {days.map((day) => (
            <CustomCheckboxLabel
              key={day}
              $active={info.member_day.includes(day)}
              style={invalid.member_day ? { outline: '2px solid #ff4d4f' } : {}}
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
            onChange={handleTimeSelect}
            ref={el => (inputRefs.current.member_time_end = el)}
            $invalid={invalid.member_time_end}
          >
            <option value="">종료 시간</option>
            {timeOptions.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </TimeSelect>
        </TimeInputWrapper>
      </FormGroup>
      <FormGroup>
        <Label htmlFor='member_activity_area'>활동지역 <span>(필수)</span></Label>
        <Input
          type="text"
          onChange={handleChange}
          value={info.member_activity_area}
          name="member_activity_area"
          id="member_activity_area"
          placeholder="예) 서울 강남구"
          ref={el => (inputRefs.current.member_activity_area = el)}
          $invalid={invalid.member_activity_area}
        />
      </FormGroup>
      <FormGroup>
        <Label htmlFor='member_info'>자기소개 <span>(필수)</span></Label>
        <TextArea
          onChange={handleChange}
          value={info.member_info}
          name="member_info"
          id="member_info"
          placeholder="자신을 소개해 주세요. (최대 500자)"
          ref={el => (inputRefs.current.member_info = el)}
          $invalid={invalid.member_info}
        />
      </FormGroup>
      <ButtonSubmit onClick={handleSubmit}>추가정보등록</ButtonSubmit>
    </TrainerRegisterWrapper>
  );
};

export default TrainerRegister;
import axios from 'axios';
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { FormGroup, Label, Input, TimeSelect, TimeInputWrapper, ButtonSubmit, Select } from '../../styles/FormStyles';
import { useFormValidation } from '../../hooks/useFormValidation';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../../action/userAction';

const MemberRegisterWrapper = styled.div`
  margin: 0 auto;
  padding: 15px;
  background: #fff;
  border-radius: 16px;
`;

// 00:00 ~ 23:00까지 1시간 단위로 옵션 생성
const timeOptions = [];
for (let h = 0; h < 24; h++) {
  const hh = h.toString().padStart(2, '0');
  timeOptions.push(`${hh}:00`);
}

const init = {
  member_type: "user",
  body_height: '',
  body_weight: '',
  member_purpose: '',
  member_disease: '',
  member_time_start: '',
  member_time_end: '',
  body_skeletal_muscle: '',
  body_bmi: '',
  body_fat: '',
  body_fat_percentage: ''
};

const numberPattern = /^(?:[1-9]\d{0,2}|0)(?:\.\d)?$/;
const percentPattern = /^(?:100(?:\.0)?|[1-9]?\d(?:\.\d)?)$/;
const textPattern = /^[가-힣a-zA-Z0-9\s]{1,30}$/;
const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

const validateFn = (info) => {
  const newInvalid = {};

  // 필수 입력값 유효성 검사
  if (!info.body_height || !numberPattern.test(info.body_height) || info.body_height < 0 || info.body_height > 300) {
    newInvalid.body_height = true;
  }
  if (!info.body_weight || !numberPattern.test(info.body_weight) || info.body_weight < 0 || info.body_weight > 300) {
    newInvalid.body_weight = true;
  }
  if (!info.member_purpose || !textPattern.test(info.member_purpose)) {
    newInvalid.member_purpose = true;
  }
  if (!info.member_disease || !textPattern.test(info.member_disease)) {
    newInvalid.member_disease = true;
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

  // 선택 입력값은 값이 있을 때만 유효성 검사
  if (info.body_skeletal_muscle && !numberPattern.test(info.body_skeletal_muscle)) {
    newInvalid.body_skeletal_muscle = true;
  }
  if (info.body_bmi && !percentPattern.test(info.body_bmi)) {
    newInvalid.body_bmi = true;
  }
  if (info.body_fat && !numberPattern.test(info.body_fat)) {
    newInvalid.body_fat = true;
  }
  if (info.body_fat_percentage && !percentPattern.test(info.body_fat_percentage)) {
    newInvalid.body_fat_percentage = true;
  }

  return newInvalid;
};

const MemberRegister = () => {
  const { info, invalid, inputRefs, handleChange, validate, setInfo } = useFormValidation(init, validateFn);
  const nav = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.user);
  useEffect(()=>{
    setInfo({
      ...info,
      ...user
    })
  },[])
  const handleSubmit = () => {
    if (!validate()) {
      const alertMsg = {
        body_height: '키는 0 이상 300 이하의 숫자(소수점 1자리까지)로 입력해주세요.',
        body_weight: '몸무게는 0 이상 300 이하의 숫자(소수점 1자리까지)로 입력해주세요.',
        member_purpose: '운동목적을 선택해주세요.',
        member_disease: '질병은 한글, 영문, 숫자, 공백으로 최대 30자까지 입력해주세요.',
        member_time_start: '운동 시작 시간은 24시간제 HH:MM 형식으로 입력해주세요.',
        member_time_end: '운동 종료 시간은 24시간제 HH:MM 형식으로 입력해주세요.',
        body_skeletal_muscle: '골격근량은 0 이상 300 이하의 숫자(소수점 1자리까지)로 입력해주세요.',
        body_bmi: 'BMI는 0 이상 100 이하의 숫자(소수점 1자리까지)로 입력해주세요.',
        body_fat: '체지방량은 0 이상 300 이하의 숫자(소수점 1자리까지)로 입력해주세요.',
        body_fat_percentage: '체지방률은 0 이상 100 이하의 숫자(소수점 1자리까지)로 입력해주세요.',
      };

      // 운동 시간대 논리 오류(시작 >= 종료)는 가장 먼저 체크
      if (
        info.member_time_start &&
        info.member_time_end &&
        info.member_time_start >= info.member_time_end
      ) {
        alert('운동 시작 시간은 종료 시간보다 이전이어야 합니다.');
        return;
      }

      // 각 invalid 항목에 맞는 알럿을 순서대로 표시
      for (const key of Object.keys(alertMsg)) {
        if (invalid[key]) {
          alert(alertMsg[key]);
          return;
        }
      }
      // 혹시라도 매칭되는 항목이 없을 경우
      alert('입력값을 확인해주세요.');
      return;
    }

    postInfo();
  };

  const postInfo = async () => {
    
    const response = await axios.post('/member/register', info);
    if (response.data.success) {
      dispatch(setUser(response.data.user));
      alert('회원 정보가 등록되었습니다.');
      nav("/");
    } else {
      alert('회원 정보 등록에 실패했습니다.');
    }
  }

  return (
    <MemberRegisterWrapper>
      <FormGroup>
        <Label htmlFor='body_height'>키 <span>(필수)</span></Label>
        <Input
          type="number"
          step="0.1"
          min="0"
          max="300"
          onChange={handleChange}
          value={info.body_height}
          name="body_height"
          id="body_height"
          placeholder="cm"
          ref={el => (inputRefs.current.body_height = el)}
          $invalid={invalid.body_height}
          inputMode="decimal"
        />
      </FormGroup>
      <FormGroup>
        <Label htmlFor='body_weight'>몸무게 <span>(필수)</span></Label>
        <Input
          type="number"
          step="0.1"
          min="0"
          max="300"
          onChange={handleChange}
          value={info.body_weight}
          name="body_weight"
          id="body_weight"
          placeholder="kg"
          ref={el => (inputRefs.current.body_weight = el)}
          $invalid={invalid.body_weight}
          inputMode="decimal"
        />
      </FormGroup>
      <FormGroup>
        <Label htmlFor='member_purpose'>운동목적 <span>(필수)</span></Label>
        <Select
          onChange={handleChange}
          value={info.member_purpose}
          name="member_purpose"
          id="member_purpose"
          ref={el => (inputRefs.current.member_purpose = el)}
          $invalid={invalid.member_purpose}
        >
          <option value="">선택</option>
          <option value="체중 관리">체중 관리</option>
          <option value="근육 증가">근육 증가</option>
          <option value="체형 교정">체형 교정</option>
          <option value="체력 증진">체력 증진</option>
          <option value="재활">재활</option>
          <option value="바디 프로필">바디 프로필</option>
        </Select>
      </FormGroup>
      <FormGroup>
        <Label htmlFor='member_disease'>질병 <span>(필수)</span></Label>
        <Input
          type="text"
          onChange={handleChange}
          value={info.member_disease}
          name="member_disease"
          id="member_disease"
          placeholder="예) 고혈압, 당뇨 등"
          ref={el => (inputRefs.current.member_disease = el)}
          $invalid={invalid.member_disease}
        />
      </FormGroup>
      <FormGroup>
        <Label htmlFor='member_time_start'>운동 시간대 <span>(필수, 24시간제)</span></Label>
        <TimeInputWrapper>
          <TimeSelect
            name="member_time_start"
            id="member_time_start"
            value={info.member_time_start}
            onChange={handleChange}
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
        <Label htmlFor='body_skeletal_muscle'>골격근량 <span>(선택)</span></Label>
        <Input
          type="number"
          step="0.1"
          min="0"
          max="300"
          onChange={handleChange}
          value={info.body_skeletal_muscle}
          name="body_skeletal_muscle"
          id="body_skeletal_muscle"
          placeholder="kg"
          ref={el => (inputRefs.current.body_skeletal_muscle = el)}
          $invalid={invalid.body_skeletal_muscle}
          inputMode="decimal"
        />
      </FormGroup>
      <FormGroup>
        <Label htmlFor='body_bmi'>BMI <span>(선택)</span></Label>
        <Input
          type="number"
          step="0.1"
          min="0"
          max="100"
          onChange={handleChange}
          value={info.body_bmi}
          name="body_bmi"
          id="body_bmi"
          ref={el => (inputRefs.current.body_bmi = el)}
          $invalid={invalid.body_bmi}
          inputMode="decimal"
        />
      </FormGroup>
      <FormGroup>
        <Label htmlFor='body_fat'>체지방량 <span>(선택)</span></Label>
        <Input
          type="number"
          step="0.1"
          min="0"
          max="300"
          onChange={handleChange}
          value={info.body_fat}
          name="body_fat"
          id="body_fat"
          placeholder="kg"
          ref={el => (inputRefs.current.body_fat = el)}
          $invalid={invalid.body_fat}
          inputMode="decimal"
        />
      </FormGroup>
      <FormGroup>
        <Label htmlFor='body_fat_percentage'>체지방률 <span>(선택)</span></Label>
        <Input
          type="number"
          step="0.1"
          min="0"
          max="100"
          onChange={handleChange}
          value={info.body_fat_percentage}
          name="body_fat_percentage"
          id="body_fat_percentage"
          placeholder="%"
          ref={el => (inputRefs.current.body_fat_percentage = el)}
          $invalid={invalid.body_fat_percentage}
          inputMode="decimal"
        />
      </FormGroup>
      <ButtonSubmit onClick={handleSubmit}>추가정보등록</ButtonSubmit>
    </MemberRegisterWrapper>
  );
};

export default MemberRegister;
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FormGroup, Label, Input, TimeSelect, TimeInputWrapper, ButtonSubmit, Select } from '../../styles/FormStyles';
import { useFormValidation } from '../../hooks/useFormValidation';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../../action/userAction';
import AreaDropDown from '../../hooks/AreaDropDown';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const MemberRegisterWrapper = styled.div`
  width: 100%;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-light);
  height: 100%;

  label { 
    font-size: 2.2rem;
    color: var(--text-white);
  }

  .swiper-slide {
    padding: 20px;
  }
`;

const ButtonBox = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  gap: 10px;
`;


const GenderSelectWrapper = styled.div`
  display: flex;
  gap: 15px;
  width: 100%; /* 전체 폭 사용 */
  margin-bottom: 8px;
`;

const GenderButton = styled.button`
  flex: 1 1 0; /* 두 버튼이 50%씩 */
  height: 45px;
  border-radius: 10px;
 
  border: 2px solid
    ${({ selected, $invalid }) =>
      $invalid ? "#ff4d4f" : selected ? "#7D93FF" : "#e3e7f1"};
  background: ${({ selected }) => (selected ? "#eaf0ff" : "#fff")};
  color: var(--text-black);
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
  }
`;

// 시간 옵션 배열 예시
const timeOptions = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00", "21:00", "22:00"
];

const init = {
  member_type: "user",
  member_gender: '', // 추가
  member_birth: '',  // 추가
  body_height: '',
  body_weight: '',
  member_purpose: '',
  member_activity_area : '',
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

  // 성별, 생년월일 필수 추가 (8자리 숫자)
  if (!info.member_gender) {
    newInvalid.member_gender = true;
  }
  if (
    !info.member_birth ||
    !/^\d{8}$/.test(info.member_birth) ||
    Number(info.member_birth.slice(4, 6)) < 1 ||
    Number(info.member_birth.slice(4, 6)) > 12 ||
    Number(info.member_birth.slice(6, 8)) < 1 ||
    Number(info.member_birth.slice(6, 8)) > 31
  ) {
    newInvalid.member_birth = true;
  }
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

  if (!info.sido1 || info.sido1 === "시/도 선택") {
    newInvalid.sido1 = true;
  }
  if (!info.gugun1 || info.gugun1 === "군/구 선택") {
    newInvalid.gugun1 = true;
  }

  // member_disease는 선택사항이므로 필수 체크 제거
  
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
  const { info, invalid, inputRefs, handleChange, validate, setInfo, setInvalid } = useFormValidation(init, validateFn);
  
  const nav = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.user);
  const [swiper, setSwiper] = useState(null);


  useEffect(()=>{
    if (user) {
      setInfo(prevInfo => ({
        ...prevInfo,
        ...user
      }))
    }
  },[user, setInfo])
  const handleSubmit = () => {
    if (!validate()) {
      const alertMsg = {
        body_height: '키는 0 이상 300 이하의 숫자(소수점 1자리까지)로 입력해주세요.',
        body_weight: '몸무게는 0 이상 300 이하의 숫자(소수점 1자리까지)로 입력해주세요.',
        member_purpose: '운동목적을 선택해주세요.',
        member_time_start: '운동 시작 시간은 24시간제 HH:MM 형식으로 입력해주세요.',
        member_time_end: '운동 종료 시간은 24시간제 HH:MM 형식으로 입력해주세요.',
        body_skeletal_muscle: '골격근량은 0 이상 300 이하의 숫자(소수점 1자리까지)로 입력해주세요.',
        body_bmi: 'BMI는 0 이상 100 이하의 숫자(소수점 1자리까지)로 입력해주세요.',
        body_fat: '체지방량은 0 이상 300 이하의 숫자(소수점 1자리까지)로 입력해주세요.',
        body_fat_percentage: '체지방률은 0 이상 100 이하의 숫자(소수점 1자리까지)로 입력해주세요.'
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
    // 시/도 + 군/구 합치기
    const sendInfo = {
      ...info,
      member_activity_area: `${info.sido1 || ''} ${info.gugun1 || ''}`.trim()
    };

    const response = await axios.post('/member/register', sendInfo, {
      withCredentials: true
    });
    if (response.data.success) {
      dispatch(setUser(response.data.user));
      alert('회원 정보가 등록되었습니다.');
      nav("/");
    } else {
      alert('회원 정보 등록에 실패했습니다.');
    }
  }

  // 1번 슬라이드(키, 몸무게, 지역)
  const handleNextStep1 = () => {
    const invalid1 = {};

    // 모든 항목에 대해 invalid 체크
    if (!info.member_gender) invalid1.member_gender = true;
    if (
      !info.member_birth ||
      !/^\d{8}$/.test(info.member_birth) ||
      Number(info.member_birth.slice(4, 6)) < 1 ||
      Number(info.member_birth.slice(4, 6)) > 12 ||
      Number(info.member_birth.slice(6, 8)) < 1 ||
      Number(info.member_birth.slice(6, 8)) > 31
    ) invalid1.member_birth = true;
    if (
      !info.body_height ||
      isNaN(info.body_height) ||
      info.body_height < 0 ||
      info.body_height > 300
    ) invalid1.body_height = true;
    if (
      !info.body_weight ||
      isNaN(info.body_weight) ||
      info.body_weight < 0 ||
      info.body_weight > 300
    ) invalid1.body_weight = true;
    if (!info.sido1 || info.sido1 === "시/도 선택") invalid1.sido1 = true;
    if (!info.gugun1 || info.gugun1 === "군/구 선택") invalid1.gugun1 = true;

    setInvalid(prev => ({ ...prev, ...invalid1 }));

    // 첫 번째로 잘못된 항목만 alert
    if (invalid1.member_gender) {
      alert('성별을 선택해주세요.');
      return;
    }
    if (invalid1.member_birth) {
      alert('생년월일을 8자리로 올바르게 입력해주세요.');
      return;
    }
    if (invalid1.body_height) {
      alert('키를 올바르게 입력해주세요.');
      return;
    }
    if (invalid1.body_weight) {
      alert('몸무게를 올바르게 입력해주세요.');
      return;
    }
    if (invalid1.sido1) {
      alert('시/도를 선택해주세요.');
      return;
    }
    if (invalid1.gugun1) {
      alert('군/구를 선택해주세요.');
      return;
    }

    // 모두 통과하면 다음 슬라이드로
    swiper.slideNext();
  };

  // 2번 슬라이드(운동목적, 불편사항, 시간대)
  const handleNextStep2 = () => {
    const invalid2 = {};

    if (!info.member_purpose) invalid2.member_purpose = true;
    // 불편사항(member_disease)은 더 이상 필수 아님!
    if (!info.member_time_start) invalid2.member_time_start = true;
    if (!info.member_time_end) invalid2.member_time_end = true;

    setInvalid(prev => ({ ...prev, ...invalid2 }));

    if (invalid2.member_purpose) {
      alert('운동 목적을 선택해주세요.');
      return;
    }
    if (invalid2.member_time_start) {
      alert('운동 시작 시간을 선택해주세요.');
      return;
    }
    if (invalid2.member_time_end) {
      alert('운동 종료 시간을 선택해주세요.');
      return;
    }
    if (
      info.member_time_start &&
      info.member_time_end &&
      info.member_time_start >= info.member_time_end
    ) {
      alert('운동 시작 시간은 종료 시간보다 이전이어야 합니다.');
      return;
    }

    swiper.slideNext();
  };

  return (
    <MemberRegisterWrapper>
      <Swiper
        spaceBetween={30}
        pagination={{
          type: 'progressbar',
        }}
        modules={[Pagination]}
        className="mySwiper"
        allowTouchMove={false} 
        onSwiper={setSwiper}
      >
        <SwiperSlide>
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
            <Label htmlFor='member_birth'>생년월일 <span>(필수, 8자리)</span></Label>
            <Input
              type="text"
              name="member_birth"
              id="member_birth"
              value={info.member_birth}
              onChange={handleChange}
              ref={el => (inputRefs.current.member_birth = el)}
              $invalid={invalid.member_birth}
              placeholder="예: 19990101"
              maxLength={8}
              inputMode="numeric"
              pattern="\d*"
            />
          </FormGroup>
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
            <Label htmlFor='sido1'>지역 <span>(필수)</span></Label>
            <AreaDropDown handleChange={handleChange} invalid={invalid} inputRefs={inputRefs} info={info}/>
          </FormGroup>
          <ButtonSubmit onClick={handleNextStep1}>다음</ButtonSubmit>
        </SwiperSlide>
        <SwiperSlide>
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
            <Label htmlFor='member_time_start'>운동 시작 시간 <span>(필수)</span></Label>
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
              <Select
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
              </Select>
            </TimeInputWrapper>
          </FormGroup>
          <FormGroup>
            <Label htmlFor='member_disease'>불편상항 <span>(선택)</span></Label>
            <Select 
              onChange={handleChange} 
              name="member_disease"
              id="member_disease"
              ref={el => (inputRefs.current.member_disease = el)}
              $invalid={invalid.member_disease}
            >
              <option value="없음">없음</option>
              <option value="손목">손목</option>
              <option value="팔꿈치">팔꿈치</option>
              <option value="어깨">어깨</option>
              <option value="목">목</option>
              <option value="허리">허리</option>
              <option value="골반">골반</option>
              <option value="발목">발목</option>
              <option value="무릎">무릎</option>
              <option value="심장">심장</option>
              <option value="기저질환">기저질환</option>
              <option value="저혈압">저혈압</option>
              <option value="고혈압">고혈압</option>
            </Select>
          </FormGroup>
      
          <ButtonBox>
            <ButtonSubmit onClick={() => swiper.slidePrev()} $invalid={"var(--primary-gray)"}>이전</ButtonSubmit>
            <ButtonSubmit onClick={handleNextStep2}>다음</ButtonSubmit>
          </ButtonBox>
        </SwiperSlide>
        <SwiperSlide>
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
          <ButtonBox>
            <ButtonSubmit onClick={() => swiper.slidePrev()} $invalid={"var(--primary-gray)"}>이전</ButtonSubmit>
            
            <ButtonSubmit onClick={handleSubmit}>추가정보등록</ButtonSubmit>
          </ButtonBox>
        </SwiperSlide>
      </Swiper>

    </MemberRegisterWrapper>
  );
};

export default MemberRegister;

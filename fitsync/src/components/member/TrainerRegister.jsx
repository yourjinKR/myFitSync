import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormValidation } from '../../hooks/useFormValidation';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../../action/userAction';
import AreaDropDown from '../../hooks/AreaDropDown';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const timeOptions = [];
for (let h = 0; h < 24; h++) {
  const hh = h.toString().padStart(2, '0');
  timeOptions.push(`${hh}:00`);
}

const days = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'];
const purposeOptions = [
  "체중 관리",
  "근육 증가", 
  "체형 교정",
  "체력 증진",
  "재활",
  "바디 프로필"
];

const init = {
  member_type: "trainer",
  member_time_start: '',
  member_time_end: '',
  member_activity_area: '',
  member_day: [],
  member_purpose: []
};

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

function validateFn(info) {
  const newInvalid = {};
  if (!info.member_gender) newInvalid.member_gender = true;
  if (!info.sido1 || info.sido1 === "시/도 선택") newInvalid.sido1 = true;
  if (!info.gugun1 || info.gugun1 === "군/구 선택") newInvalid.gugun1 = true;
  if (!info.member_day || info.member_day.length === 0) newInvalid.member_day = true;
  if (!info.member_purpose || info.member_purpose.length === 0) newInvalid.member_purpose = true;
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

// 메인 컨테이너
const TrainerRegisterWrapper = styled.div`
  width: 100%;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid var(--border-light);
  height: calc(100vh - 150px);

  label { 
    font-size: 2.2rem;
    color: var(--text-primary);
  }

  .swiper-slide {
    padding: 20px;
  }
`;

// 폼 그룹
const FormGroup = styled.div`
  margin-bottom: 2rem;
`;

// 라벨
const Label = styled.label`
  display: block;
  font-size: 2.2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;

  span {
    color: var(--primary-blue);
    font-size: 1.6rem;
  }
`;

// 질문 텍스트
const Question = styled.h2`
  font-size: 2.6rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2.5rem;
  line-height: 1.4;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 2.2rem;
    margin-bottom: 2rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.8rem;
  }
`;

// 버튼 박스
const ButtonBox = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  gap: 10px;
`;

// 제출 버튼
const ButtonSubmit = styled.button`
  flex: 1;
  height: 45px;
  border-radius: 10px;
  border: none;
  background: ${({ $invalid }) => $invalid || 'var(--primary-blue)'};
  color: white;
  font-size: 1.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  width : 100%;
`;

// 성별 선택 래퍼
const GenderSelectWrapper = styled.div`
  display: flex;
  gap: 15px;
  width: 100%;
  margin-bottom: 8px;
`;

// 성별 버튼
const GenderButton = styled.button`
  flex: 1 1 0;
  height: 45px;
  border-radius: 10px;
  border: 2px solid
    ${({ selected, $invalid }) =>
      $invalid ? "#ff4d4f" : selected ? "var(--primary-blue)" : "var(--border-light)"};
  background: ${({ selected }) => (selected ? "rgba(74, 144, 226, 0.1)" : "transparent")};
  color: ${({ selected }) => (selected ? "var(--primary-blue)" : "var(--text-primary)")};
  font-size: 1.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  outline: none;
  min-width: 0;
  padding: 0;

  &:hover {
    border-color: var(--primary-blue);
    background: rgba(74, 144, 226, 0.05);
  }
`;

// 요일 선택 그리드
const DayGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
  }

  @media (max-width: 480px) {
  }
`;

// 요일 체크박스 아이템
const DayCheckboxItem = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  border: 2px solid ${({ selected }) => selected ? 'var(--primary-blue)' : 'var(--border-light)'};
  border-radius: 0.8rem;
  background: ${({ selected }) => selected ? 'rgba(74, 144, 226, 0.15)' : 'transparent'};
  color: ${({ selected }) => selected ? 'var(--primary-blue)' : 'var(--text-primary)'};
  font-size: 1.4rem;
  font-weight: ${({ selected }) => selected ? '600' : '500'};
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  user-select: none;
  text-align: center;
  min-height: 4.5rem;
  
  &:hover {
    border-color: var(--primary-blue);
    background: rgba(74, 144, 226, 0.1);
    color: var(--primary-blue);
  }

  ${({ selected }) => selected && `
    &::after {
      content: '✓';
      position: absolute;
      top: 0.3rem;
      right: 0.4rem;
      font-size: 1.1rem;
      color: var(--primary-blue);
      font-weight: bold;
    }
  `}

  input {
    display: none;
  }
`;

// 전문분야 체크박스 그리드
const PurposeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
  }
`;

// 전문분야 체크박스 아이템
const PurposeCheckboxItem = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.2rem;
  border: 2px solid ${({ selected }) => selected ? 'var(--primary-blue)' : 'var(--border-light)'};
  border-radius: 0.8rem;
  background: ${({ selected }) => selected ? 'rgba(74, 144, 226, 0.15)' : 'transparent'};
  color: ${({ selected }) => selected ? 'var(--primary-blue)' : 'var(--text-primary)'};
  font-size: 1.5rem;
  font-weight: ${({ selected }) => selected ? '600' : '500'};
  cursor: pointer;
  position: relative;
  user-select: none;
  
  &:hover {
    border-color: var(--primary-blue);
    background: rgba(74, 144, 226, 0.1);
  }

  ${({ selected }) => selected && `
    &::after {
      content: '✓';
      position: absolute;
      top: 0.3rem;
      right: 0.6rem;
      font-size: 1.2rem;
      color: var(--primary-blue);
      font-weight: bold;
    }
  `}

  input {
    display: none;
  }
`;

// 시간 선택 컨테이너
const TimeInputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1rem;

  span {
    font-size: 2rem;
    color: var(--text-primary);
    font-weight: 600;
    min-width: 30px;
    text-align: center;
  }

  @media (max-width: 768px) {
    gap: 1rem;
    
    span {
      font-size: 1.8rem;
      margin: 0.5rem 0;
    }
  }
`;

// Select 컴포넌트
const Select = styled.select`
  width: 100%;
  padding: 1.5rem 2rem;
  border: 2px solid ${({ $invalid }) => ($invalid ? "#ff4d4f" : "var(--border-light)")};
  border-radius: 12px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1.8rem;
  font-weight: 500;
  cursor: pointer;
  text-align: center;
  
  &:focus {
    border-color: var(--primary-blue);
    outline: none;
    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
  }

  &:hover {
    border-color: var(--primary-blue);
  }

  option {
    background: var(--bg-secondary);
    color: var(--text-primary);
    font-size: 1.6rem;
    padding: 0.5rem;
  }

  @media (max-width: 768px) {
    width: 100%;
    max-width: 250px;
    padding: 1.3rem 1.5rem;
    font-size: 1.6rem;
  }
`;

const TrainerRegister = () => {
  const nav = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.user);
  const { info, setInfo, invalid, setInvalid, inputRefs, handleChange } = useFormValidation(init, validateFn);
  
  // Swiper 인스턴스
  const [swiper, setSwiper] = useState(null);

  useEffect(() => {
    if (user) {
      setInfo(prev => ({
        ...prev,
        ...user
      }));
    }
  }, [user, setInfo]);

  // 요일 체크박스 상태 관리
  const handleDayChange = (day) => {
    const newDays = info.member_day.includes(day)
      ? info.member_day.filter(d => d !== day)
      : [...info.member_day, day];
    
    setInfo(prev => ({ ...prev, member_day: newDays }));
    setInvalid(prev => ({ ...prev, member_day: false }));
  };

  // 운동 목적 체크박스 상태 관리
  const handlePurposeChange = (purpose) => {
    const newPurposes = info.member_purpose.includes(purpose)
      ? info.member_purpose.filter(p => p !== purpose)
      : [...info.member_purpose, purpose];
    
    setInfo(prev => ({ ...prev, member_purpose: newPurposes }));
    setInvalid(prev => ({ ...prev, member_purpose: false }));
  };

  // 1단계 다음 버튼 (성별, 요일, 시간)
  const handleNextStep1 = () => {
    if (!info.member_gender) {
      alert('성별을 선택해주세요.');
      return;
    }
    if (!info.member_day || info.member_day.length === 0) {
      alert('수업 가능한 요일을 선택해주세요.');
      return;
    }
    if (!info.member_time_start || !info.member_time_end) {
      alert('수업 가능한 시간을 선택해주세요.');
      return;
    }
    swiper.slideNext();
  };

  // 최종 제출
  const handleSubmit = () => {
    if (!info.sido1 || info.sido1 === "시/도 선택" || !info.gugun1 || info.gugun1 === "군/구 선택") {
      alert('활동 지역을 선택해주세요.');
      return;
    }
    if (!info.member_purpose || info.member_purpose.length === 0) {
      alert('전문 분야를 선택해주세요.');
      return;
    }

    const sendInfo = {
      ...info,
      member_day: Array.isArray(info.member_day) ? info.member_day.join(',') : info.member_day,
      member_purpose: Array.isArray(info.member_purpose) ? info.member_purpose.join(',') : info.member_purpose,
      member_activity_area: `${info.sido1 || ''} ${info.gugun1 || ''}`.trim()
    };

    postInfo(sendInfo);
  };

  const postInfo = async (sendInfo) => {
    try {
      const response = await axios.post('/member/register', sendInfo);
      if (response.data.success) {
        dispatch(setUser(response.data.user));
        alert('회원 정보가 등록되었습니다.');
        nav("/");
      } else {
        alert('회원 정보 등록에 실패했습니다.');
      }
    } catch (error) {
      alert('오류가 발생했습니다.');
    }
  };

  return (
    <TrainerRegisterWrapper>
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
        {/* 1단계: 성별, 수업 가능 요일 및 시간 */}
        <SwiperSlide>
          <FormGroup>
            <Question>성별을 선택해주세요</Question>
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
            <Label>수업 가능한 요일을 선택해주세요 <span>(복수 선택 가능)</span></Label>
            <DayGrid>
              {days.map((day) => (
                <DayCheckboxItem
                  key={day}
                  selected={info.member_day.includes(day)}
                  onClick={(e) => {
                    e.preventDefault();
                    handleDayChange(day);
                  }}
                >
                  <input 
                    type="checkbox" 
                    checked={info.member_day.includes(day)}
                    readOnly 
                  />
                  {day}
                </DayCheckboxItem>
              ))}
            </DayGrid>
          </FormGroup>
          
          <FormGroup>
            <Label>수업 가능한 시간을 선택해주세요 <span>(필수)</span></Label>
            <TimeInputWrapper>
              <Select
                name="member_time_start"
                value={info.member_time_start}
                onChange={handleChange}
                $invalid={invalid.member_time_start}
              >
                <option value="">시작 시간</option>
                {timeOptions.map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </Select>
              <span>~</span>
              <Select
                name="member_time_end"
                value={info.member_time_end}
                onChange={handleChange}
                $invalid={invalid.member_time_end}
              >
                <option value="">종료 시간</option>
                {timeOptions
                  .filter(time => !info.member_time_start || time > info.member_time_start)
                  .map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
              </Select>
            </TimeInputWrapper>
          </FormGroup>

          <ButtonSubmit onClick={handleNextStep1}>다음</ButtonSubmit>
        </SwiperSlide>

        {/* 2단계: 활동 지역 및 전문 분야 */}
        <SwiperSlide>
          <FormGroup>
            <Label>활동 지역을 선택해주세요 <span>(필수)</span></Label>
            <AreaDropDown 
              handleChange={handleChange}
              invalid={invalid}
              inputRefs={inputRefs}
              info={info}
            />
          </FormGroup>

          <FormGroup>
            <Label>전문 분야를 선택해주세요 <span>(복수 선택 가능)</span></Label>
            <PurposeGrid>
              {purposeOptions.map((purpose) => (
                <PurposeCheckboxItem
                  key={purpose}
                  selected={info.member_purpose.includes(purpose)}
                  onClick={(e) => {
                    e.preventDefault();
                    handlePurposeChange(purpose);
                  }}
                >
                  <input 
                    type="checkbox" 
                    checked={info.member_purpose.includes(purpose)}
                    readOnly 
                  />
                  {purpose}
                </PurposeCheckboxItem>
              ))}
            </PurposeGrid>
          </FormGroup>

          <ButtonBox>
            <ButtonSubmit onClick={() => swiper.slidePrev()} $invalid={"var(--primary-gray)"}>이전</ButtonSubmit>
            <ButtonSubmit onClick={handleSubmit}>등록 완료</ButtonSubmit>
          </ButtonBox>
        </SwiperSlide>
      </Swiper>
    </TrainerRegisterWrapper>
  );
};

export default TrainerRegister;

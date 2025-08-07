import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormValidation } from '../../hooks/useFormValidation';
import styled, { keyframes } from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../../action/userAction';
import AreaDropDown from '../../hooks/AreaDropDown';

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

// 애니메이션 키프레임
const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

// 메인 컨테이너
const Container = styled.div`
  min-height: 100vh;
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 4rem 2rem;

  @media (max-width: 768px) {
    padding: 2rem 1rem;
  }
`;

// 폼 래퍼
const FormWrapper = styled.div`
  width: 100%;
  max-width: 60rem;
  background: transparent;
  display: flex;
  flex-direction: column;
  gap: 0;
`;

// 단계별 컨테이너 (항상 표시되되, 조건부로 렌더링)
const StepContainer = styled.div`
  opacity: ${({ isVisible }) => isVisible ? 1 : 0};
  max-height: ${({ isVisible }) => isVisible ? 'none' : '0'};
  overflow: hidden;
  transition: all 0.6s ease-out;
  transform: translateY(${({ isVisible }) => isVisible ? '0' : '20px'});
  margin-bottom: ${({ isVisible }) => isVisible ? '4rem' : '0'};
  
  ${({ isVisible }) => !isVisible && `
    pointer-events: none;
    margin-bottom: 0;
  `}
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

// 옵션 그리드
const OptionGrid = styled.div`
  display: grid;
  grid-template-columns: ${({ columns }) => `repeat(${columns}, 1fr)`};
  gap: 1.5rem;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

// 옵션 버튼
const OptionButton = styled.button`
  padding: 2rem;
  border: 2px solid ${({ selected }) => selected ? 'var(--primary-blue)' : 'var(--border-light)'};
  border-radius: 1.5rem;
  background: ${({ selected }) => selected ? 'var(--primary-blue)' : 'transparent'};
  color: ${({ selected }) => selected ? 'white' : 'var(--text-primary)'};
  font-size: 1.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: var(--primary-blue);
    background: ${({ selected }) => selected ? 'var(--primary-blue)' : 'rgba(74, 144, 226, 0.1)'};
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
    font-size: 1.6rem;
  }
`;

// 체크박스 그리드
const CheckboxGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  gap: 1rem;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

// 요일 선택용 특별 그리드
const DayGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.8rem;
  margin-bottom: 3rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

// 요일 체크박스 아이템 (더 컴팩트한 버전)
const DayCheckboxItem = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 0.5rem;
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
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
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

  @media (max-width: 768px) {
    padding: 1.2rem;
    font-size: 1.4rem;
    min-height: auto;
  }
`;

// 체크박스 아이템
const CheckboxItem = styled.label`
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
  transition: all 0.3s ease;
  position: relative;
  user-select: none;
  
  &:hover {
    border-color: var(--primary-blue);
    background: rgba(74, 144, 226, 0.1);
    color: var(--primary-blue);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
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

  @media (max-width: 768px) {
    padding: 1rem;
    font-size: 1.4rem;
  }
`;

// 시간 선택 컨테이너
const TimeContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1.5rem;
  }
`;

// 시간 선택박스
const TimeSelect = styled.select`
  padding: 1.5rem 2rem;
  border: 2px solid var(--border-light);
  border-radius: 1rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1.6rem;
  cursor: pointer;
  min-width: 15rem;
  
  &:focus {
    border-color: var(--primary-blue);
    outline: none;
  }

  @media (max-width: 768px) {
    width: 100%;
    min-width: auto;
  }
`;

// 지역 선택 래퍼
const AreaWrapper = styled.div`
  width: 100%;
  margin-bottom: 3rem;
  
  .area-select {
    width: 100%;
    padding: 1.5rem;
    border: 2px solid var(--border-light);
    border-radius: 1rem;
    background: var(--bg-secondary);
    color: var(--text-primary);
    font-size: 1.6rem;
    margin-bottom: 1rem;
    cursor: pointer;
    
    &:focus {
      border-color: var(--primary-blue);
      outline: none;
    }
  }
`;

// 다음 버튼
const NextButton = styled.button`
  width: 100%;
  max-width: 30rem;
  margin: 0 auto;
  padding: 1.8rem 2rem;
  border: none;
  border-radius: 1.5rem;
  background: var(--primary-blue);
  color: white;
  font-size: 1.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: var(--primary-blue-hover);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(74, 144, 226, 0.3);
  }
  
  &:disabled {
    background: var(--border-light);
    color: var(--text-tertiary);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
    font-size: 1.6rem;
  }
`;

// 이용약관 컨테이너
const TermsContainer = styled.div`
  background: var(--bg-secondary);
  border: 2px solid var(--border-light);
  border-radius: 1.5rem;
  padding: 2rem;
  margin-bottom: 2rem;
  max-height: 400px;
  overflow-y: auto;

  @media (max-width: 768px) {
    padding: 1.5rem;
    max-height: 300px;
  }
`;

// 이용약관 텍스트
const TermsText = styled.div`
  color: var(--text-secondary);
  font-size: 1.4rem;
  line-height: 1.6;
  
  h3 {
    color: var(--text-primary);
    font-size: 1.6rem;
    font-weight: 600;
    margin-bottom: 1rem;
    margin-top: 1.5rem;
    
    &:first-child {
      margin-top: 0;
    }
  }
  
  p {
    margin-bottom: 1rem;
  }
  
  ul {
    margin-left: 1.5rem;
    margin-bottom: 1rem;
  }
  
  li {
    margin-bottom: 0.5rem;
  }

  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
`;

// 동의 체크박스 컨테이너
const AgreementContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 3rem;
  padding: 1.5rem;
  border: 2px solid ${({ agreed }) => agreed ? 'var(--primary-blue)' : 'var(--border-light)'};
  border-radius: 1rem;
  background: ${({ agreed }) => agreed ? 'rgba(74, 144, 226, 0.1)' : 'transparent'};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: var(--primary-blue);
    background: rgba(74, 144, 226, 0.05);
  }

  @media (max-width: 768px) {
    padding: 1rem;
    gap: 0.8rem;
  }
`;

// 동의 체크박스
const AgreementCheckbox = styled.input`
  width: 2rem;
  height: 2rem;
  cursor: pointer;

  @media (max-width: 768px) {
    width: 1.8rem;
    height: 1.8rem;
  }
`;

// 동의 텍스트
const AgreementText = styled.span`
  color: var(--text-primary);
  font-size: 1.6rem;
  font-weight: 500;
  user-select: none;

  @media (max-width: 768px) {
    font-size: 1.4rem;
  }
`;



const TrainerRegister = () => {
  const nav = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.user);
  const { info, setInfo, invalid, setInvalid, inputRefs, handleChange, validate } = useFormValidation(init, validateFn);

  // 각 단계의 완료 상태 관리
  const [stepCompleted, setStepCompleted] = useState({
    schedule: false,
    purpose: false
  });

  // 이용약관 동의 상태
  const [termsAgreed, setTermsAgreed] = useState(false);

  // 이용약관 동의 시 스크롤 처리
  useEffect(() => {
    if (termsAgreed) {
      setTimeout(() => {
        const submitSection = document.querySelector('[data-step="submit"]');
        if (submitSection) {
          submitSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    }
  }, [termsAgreed]);

  useEffect(() => {
    if (user) {
      setInfo(prev => ({
        ...prev,
        ...user
      }));
    }
  }, [user, setInfo]);

  // 지역 정보 변경 감지 및 스크롤 처리
  useEffect(() => {
    const hasAllAreaInfo = (info.sido1 && info.sido1 !== "시/도 선택") && 
                          (info.gugun1 && info.gugun1 !== "군/구 선택" && info.gugun1 !== "구/군 선택");
    
    if (hasAllAreaInfo) {
      setTimeout(() => {
        const purposeSection = document.querySelector('[data-step="purpose"]');
        if (purposeSection) {
          purposeSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  }, [info.sido1, info.gugun1]);

  // 성별 선택 핸들러
  const handleGenderSelect = (gender) => {
    handleChange({ target: { name: "member_gender", value: gender } });
    
    // 성별 선택 후 요일 선택으로 스크롤
    setTimeout(() => {
      const scheduleSection = document.querySelector('[data-step="schedule"]');
      if (scheduleSection) {
        scheduleSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 300);
  };

  // 요일 체크박스 상태 관리
  const handleDayChange = (day) => {
    const newDays = info.member_day.includes(day)
      ? info.member_day.filter(d => d !== day)
      : [...info.member_day, day];
    
    setInfo(prev => ({ ...prev, member_day: newDays }));
    setInvalid(prev => ({ ...prev, member_day: false }));
  };

  // 시간 선택 핸들러
  const handleTimeChange = (e) => {
    handleChange(e);
    
    // 시작시간과 종료시간이 모두 선택되면 지역 단계로 스크롤
    const newInfo = { ...info, [e.target.name]: e.target.value };
    if (newInfo.member_time_start && newInfo.member_time_end) {
      setTimeout(() => {
        const areaSection = document.querySelector('[data-step="area"]');
        if (areaSection) {
          areaSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  };

  // 운동 목적 체크박스 상태 관리
  const handlePurposeChange = (purpose) => {
    const newPurposes = info.member_purpose.includes(purpose)
      ? info.member_purpose.filter(p => p !== purpose)
      : [...info.member_purpose, purpose];
    
    setInfo(prev => ({ ...prev, member_purpose: newPurposes }));
    setInvalid(prev => ({ ...prev, member_purpose: false }));
    
    // 스크롤 제거 - 이미 적절한 위치에 스크롤되어 있음
  };

  // 최종 제출
  const handleSubmit = () => {
    if (!validate()) {
      alert('모든 필수 항목을 입력해주세요.');
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
    <Container>
      <FormWrapper>
        {/* 단계 1: 성별 선택 */}
        <StepContainer isVisible={true}>
          <Question>성별을 선택해주세요</Question>
          <OptionGrid columns={2}>
            <OptionButton
              selected={info.member_gender === "남성"}
              onClick={() => handleGenderSelect("남성")}
            >
              남성
            </OptionButton>
            <OptionButton
              selected={info.member_gender === "여성"}
              onClick={() => handleGenderSelect("여성")}
            >
              여성
            </OptionButton>
          </OptionGrid>
        </StepContainer>

        {/* 단계 2: 수업 가능 요일 */}
        <StepContainer isVisible={!!info.member_gender} data-step="schedule">
          <Question>수업 가능한 요일을 선택해주세요 (복수 선택 가능)</Question>
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
          {info.member_day.length > 0 && (
            <NextButton 
              onClick={() => {
                setStepCompleted(prev => ({ ...prev, schedule: true }));
                setTimeout(() => {
                  const timeSection = document.querySelector('[data-step="time"]');
                  if (timeSection) {
                    timeSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }, 300);
              }}
              style={{ marginBottom: '3rem' }}
            >
              다음
            </NextButton>
          )}
        </StepContainer>

        {/* 단계 3: 수업 시간 */}
        <StepContainer isVisible={stepCompleted.schedule} data-step="time">
          <Question>수업 가능한 시간을 선택해주세요</Question>
          <TimeContainer>
            <TimeSelect
              name="member_time_start"
              value={info.member_time_start}
              onChange={handleTimeChange}
            >
              <option value="">시작 시간</option>
              {timeOptions.map((time) => (
                <option key={time} value={time}>{time}</option>
              ))}
            </TimeSelect>
            <span style={{ color: 'var(--text-primary)', fontSize: '2rem' }}>~</span>
            <TimeSelect
              name="member_time_end"
              value={info.member_time_end}
              onChange={handleTimeChange}
            >
              <option value="">종료 시간</option>
              {timeOptions
                .filter(time => !info.member_time_start || time > info.member_time_start)
                .map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
            </TimeSelect>
          </TimeContainer>
        </StepContainer>

        {/* 단계 4: 활동 지역 */}
        <StepContainer isVisible={info.member_time_start && info.member_time_end} data-step="area">
          <Question>활동 지역을 선택해주세요</Question>
          <AreaWrapper>
            <AreaDropDown 
              handleChange={handleChange}
              invalid={invalid}
              inputRefs={inputRefs}
              info={info}
            />
          </AreaWrapper>
        </StepContainer>

        {/* 단계 5: 전문 분야 */}
        <StepContainer isVisible={info.sido1 && info.gugun1} data-step="purpose">
          <Question>전문 분야를 선택해주세요 (복수 선택 가능)</Question>
          <CheckboxGrid>
            {purposeOptions.map((purpose) => (
              <CheckboxItem
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
              </CheckboxItem>
            ))}
          </CheckboxGrid>
          {/* 전문분야 완료 버튼 - 항상 렌더링하되 조건부로 표시 */}
          <NextButton 
            onClick={() => {
              if (info.member_purpose.length === 0) return; // 클릭 방지
              setStepCompleted(prev => ({ ...prev, purpose: true }));
              // 이용약관 동의서로 스크롤 - 다른 단계들과 동일한 방식으로 변경
              setTimeout(() => {
                const termsSection = document.querySelector('[data-step="terms"]');
                if (termsSection) {
                  termsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }, 300);
            }}
            style={{ 
              marginBottom: '3rem', 
              opacity: info.member_purpose.length > 0 ? 1 : 0,
              visibility: info.member_purpose.length > 0 ? 'visible' : 'hidden',
              pointerEvents: info.member_purpose.length > 0 ? 'auto' : 'none',
              transform: 'none', 
              transition: 'opacity 0.3s ease, visibility 0.3s ease'
            }}
          >
            다음
          </NextButton>
        </StepContainer>

        {/* 단계 6: 이용약관 동의 */}
        <StepContainer isVisible={stepCompleted.purpose} data-step="terms">
          <Question>이용약관에 동의해주세요</Question>
          <TermsContainer>
            <TermsText>
              <h3>개인정보 수집 및 이용 동의</h3>
              <p>
                FitSync는 트레이너 서비스 제공을 위해 다음과 같은 개인정보를 수집 및 이용합니다.
              </p>
              <ul>
                <li>수집 항목: 성별, 활동 지역, 수업 가능 시간, 전문 분야</li>
                <li>수집 목적: 트레이너 프로필 생성 및 매칭 서비스 제공</li>
                <li>보유 기간: 회원 탈퇴 시까지</li>
              </ul>

              <h3>서비스 이용약관</h3>
              <p>
                본 서비스를 이용함에 있어 다음 사항에 동의합니다:
              </p>
              <ul>
                <li>제공된 정보는 정확하고 최신 정보입니다.</li>
                <li>서비스 이용 시 관련 법령 및 이용약관을 준수합니다.</li>
                <li>타인의 권리를 침해하지 않으며, 건전한 서비스 이용을 약속합니다.</li>
                <li>서비스 개선을 위한 통계 및 분석에 활용될 수 있습니다.</li>
              </ul>

              <h3>마케팅 정보 수신 동의 (선택)</h3>
              <p>
                새로운 서비스, 이벤트 정보 등을 SMS, 이메일로 받아보실 수 있습니다.
                (동의하지 않아도 서비스 이용이 가능합니다)
              </p>
            </TermsText>
          </TermsContainer>
          
          <AgreementContainer 
            agreed={termsAgreed}
            onClick={() => setTermsAgreed(!termsAgreed)}
          >
            <AgreementCheckbox
              type="checkbox"
              checked={termsAgreed}
              onChange={(e) => setTermsAgreed(e.target.checked)}
            />
            <AgreementText>
              위 이용약관 및 개인정보 수집·이용에 동의합니다.
            </AgreementText>
          </AgreementContainer>
        </StepContainer>

        {/* 최종 등록 버튼 */}
        <StepContainer isVisible={termsAgreed} data-step="submit">
          <NextButton onClick={handleSubmit}>
            등록 완료
          </NextButton>
        </StepContainer>
      </FormWrapper>
    </Container>
  );
};

export default TrainerRegister;
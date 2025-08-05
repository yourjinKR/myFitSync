import React, { useState, useEffect, useRef, use } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { PrimaryButton, SecondaryButton, ButtonGroup } from '../../styles/commonStyle';
import AreaDropDown from '../../hooks/AreaDropDown';
import { area0, areaAll } from '../../utils/AreaData';

const Row = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  gap: 12px;
`;
const Label = styled.label`
  width: 100px;
  font-weight: 500;
  color: var(--text-secondary);
  font-size: 1.4rem;
`;

const Value = styled.div`
  flex: 1;
  color: var(--text-primary);
  font-size: 1.4rem;
  font-weight: 500;
  background: var(--bg-tertiary);
  border-radius: 6px;
  padding: 8px 12px;
  border: 1px solid var(--border-light);
`;

const Select = styled.select`
  flex: 1;
  font-size: 1.4rem;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid var(--border-light);
  background: var(--bg-tertiary);
  color: var(--text-primary);
`;

const TimeInputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
`;

const TimeSelect = styled.select`
  flex: 1;
  font-size: 1.4rem;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid var(--border-light);
  background: var(--bg-tertiary);
  color: var(--text-primary);
`;

const TimeSeparator = styled.span`
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 1.4rem;
  text-align: center;
  padding: 0 4px;
`;

const UserInfo = ({ user, setIsInfoEdit }) => {
  const [userData, setUserData] = useState(user);
  const [edited, setEdited] = useState({});
  const [areaInfo, setAreaInfo] = useState({});
  const inputRefs = useRef({});
  const [areaInvalid, setAreaInvalid] = useState({});
  const timeOptions = Array.from({ length: 24 }, (_, i) => `${i}:00`).concat(Array.from({ length: 24 }, (_, i) => `${i}:30`));

  useEffect(() => {
    if (user === null) return;
    setUserData(user);
    
    // 활동지역이 있으면 시/도, 군/구로 분리
    if (user.member_activity_area) {
      const area = user.member_activity_area;
      
      // 시/도 찾기 (area0에서 일치하는 것 찾기)
      const sido = area0.find(sidoName => 
        sidoName !== "시/도 선택" && area.includes(sidoName)
      ) || "";
      
      if (sido) {
        // 해당 시/도의 군/구 목록 인덱스 찾기
        const sidoIndex = area0.indexOf(sido);
        const areaKey = `area${sidoIndex - 1}`;
        const gugunArray = areaAll[areaKey] || [];
        
        // 구/군 찾기 (해당 지역의 구/군 목록에서 일치하는 것 찾기)
        let gugun = "";
        
        // 원래 문자열에서 시/도 부분을 제거한 나머지 부분
        const remainingPart = area.replace(sido, '').trim();
        
        // 남은 부분과 정확히 일치하는 구/군 찾기
        gugun = gugunArray.find(item => 
          item !== "구/군 선택" && remainingPart === item
        );
        
        // 정확히 일치하는 것이 없으면 포함된 구/군 찾기
        if (!gugun) {
          gugun = gugunArray.find(item => 
            item !== "구/군 선택" && remainingPart.includes(item)
          ) || "";
        }
        
        // 시/도 값과 구/군 값 설정
        setAreaInfo({
          sido1: sido,
          gugun1: gugun || "구/군 선택" // 구/군이 없으면 기본값 설정
        });
      } else {
        // 시/도를 찾지 못한 경우 전체 문자열을 sido1로 설정
        setAreaInfo({
          sido1: area,
          gugun1: "구/군 선택"
        });
      }
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEdited(prev => ({ ...prev, [name]: value }));

    // AreaDropDown의 경우 areaInfo도 업데이트
    if (name === 'sido1') {
      // 시/도가 변경되면 구/군은 '구/군 선택'으로 초기화
      setAreaInfo(prev => ({ 
        ...prev, 
        [name]: value,
        gugun1: "구/군 선택" 
      }));
    } else if (name === 'gugun1') {
      // 구/군 선택 옵션이 선택되었을 때는 빈 문자열로 처리
      const newValue = value === "구/군 선택" ? "" : value;
      setAreaInfo(prev => ({ ...prev, [name]: newValue }));
    }
  };

  const handleSave = async () => {
    try {
      // 필수 필드 검증
      const purpose = edited.member_purpose || userData.member_purpose;
      const timeStart = edited.member_time_start || (userData.member_time && userData.member_time.split("~")[0]);
      const timeEnd = edited.member_time_end || (userData.member_time && userData.member_time.split("~")[1]);
      
      // 활동지역: areaInfo에서 가져오거나 기존 값 사용
      let activityArea;
      if (areaInfo.sido1 && areaInfo.sido1 !== "시/도 선택") {
        if (areaInfo.gugun1 && areaInfo.gugun1 !== "구/군 선택") {
          activityArea = `${areaInfo.sido1} ${areaInfo.gugun1}`;
        } else {
          activityArea = areaInfo.sido1;
        }
      } else {
        activityArea = edited.member_activity_area || userData.member_activity_area || '';
      }
      
      // 필수 필드 검증
      if (!purpose) {
        alert('운동목적을 선택해주세요.');
        return;
      }
      
      if (!timeStart || !timeEnd) {
        alert('운동시간대를 모두 선택해주세요.');
        return;
      }
      
      if (!activityArea) {
        alert('활동지역을 선택해주세요.');
        return;
      }
      
      // 시간 정보 합치기
      const member_time = `${timeStart}~${timeEnd}`;
      
      const postData = {
        member_purpose: purpose,
        member_time: member_time,
        member_disease: edited.member_disease || userData.member_disease || '없음',
        member_activity_area: activityArea
      }
      
      const response = await axios.post('/user/info', postData, { withCredentials: true });
      if(!response.data.success) {
        alert(response.data.message || '정보 저장에 실패했습니다.');
        return;
      }else{
        setIsInfoEdit(false);
      }
    } catch (err) {
      console.error(err);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <>
      <Row>
        <Label>운동목적</Label>
        {
          <Select name="member_purpose" value={edited.member_purpose || userData.member_purpose || ''} onChange={handleChange}>
            <option value="">선택</option>
            <option value="체중 관리">체중 관리</option>
            <option value="근육 증가">근육 증가</option>
            <option value="체형 교정">체형 교정</option>
            <option value="체력 증진">체력 증진</option>
            <option value="재활">재활</option>
            <option value="바디 프로필">바디 프로필</option>
          </Select>
        }
      </Row>
      <Row>
        <Label>운동시간대</Label>
        {
          <TimeInputWrapper>
            <TimeSelect name="member_time_start" value={edited.member_time_start || (userData.member_time && userData.member_time.split("~")[0]) || ''} onChange={handleChange}>
              <option value="">시작 시간</option>
              {timeOptions.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </TimeSelect>
            <TimeSeparator>~</TimeSeparator>
            <TimeSelect name="member_time_end" value={edited.member_time_end || (userData.member_time && userData.member_time.split("~")[1]) || ''} onChange={handleChange}>
              <option value="">종료 시간</option>
              {timeOptions
                .filter(t => !(edited.member_time_start || (userData.member_time && userData.member_time.split("~")[0])) || t > (edited.member_time_start || userData.member_time.split("~")[0]))
                .map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
            </TimeSelect>
          </TimeInputWrapper>
        }
      </Row>
      <Row>
        <Label>불편사항</Label>
        {
          <Select name="member_disease" value={edited.member_disease || userData.member_disease || ''} onChange={handleChange}>
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
        }
      </Row>
      <Row>
        <Label>활동지역</Label>
        {
          <div style={{ flex: 1 }}>
            <AreaDropDown
              handleChange={handleChange}
              invalid={areaInvalid}
              inputRefs={inputRefs}
              info={areaInfo}
              variant="userInfo"
            />
          </div>
        }
      </Row>
      <ButtonGroup>
        {
          <>
            <PrimaryButton onClick={handleSave}>저장</PrimaryButton>
            <SecondaryButton onClick={() => setIsInfoEdit(false)}>취소</SecondaryButton>
          </>
       }
      </ButtonGroup>
    </>
  );
};

export default UserInfo;

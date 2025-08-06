import React, { useState, useEffect } from 'react';
import { area0, areaAll } from '../utils/AreaData'; // 시/도/군/구 데이터
import { Select } from '../styles/FormStyles';
import styled from 'styled-components';

const SelectBox = styled.div`
  display: flex;
  gap: ${props => props.$variant === 'userInfo' ? '8px' : '17px'};

  select {
    ${props => props.$variant === 'userInfo' ? `
      flex: 1;
      padding: 8px 12px;
      font-size: 1.4rem;
      border: 1px solid var(--border-light);
      border-radius: 6px;
      background: var(--bg-tertiary);
      color: var(--text-primary);
      font-weight: 500;
      transition: border 0.2s;
      outline: none;
      margin-bottom: 0;

      &:focus {
        border-color: var(--primary-blue);
      }

      option {
        color: var(--text-primary);
        font-size: 1.4rem;
      }
    ` : `
      margin-bottom: 22px;
      font-size: 1.8rem;
      option {
        color: var(--text-black);
        font-size: 1.8rem;
      }
    `}
  }
`;

const AreaDropDown = ({handleChange, invalid, inputRefs, info, variant}) => {
  // 구/군 옵션 목록을 위한 상태
  const [gugunOptions, setGugunOptions] = useState(['구/군 선택']);
  
  // 초기화 및 값 변경 시 구/군 목록 업데이트
  useEffect(() => {
    // 시/도가 선택되지 않았거나 "시/도 선택"인 경우 기본 옵션만 설정
    if (!info.sido1 || info.sido1 === "시/도 선택") {
      setGugunOptions(['구/군 선택']);
      return;
    }
    
    // 시/도에 해당하는 구/군 목록 가져오기
    const sidoIndex = area0.indexOf(info.sido1);
    if (sidoIndex > 0) {
      const areaKey = `area${sidoIndex}`;
      const options = [...areaAll[areaKey]] || ['구/군 선택'];
      
      // 기존 gugun1 값이 옵션에 없으면 추가
      if (
        info.gugun1 && 
        info.gugun1 !== '구/군 선택' && 
        !options.includes(info.gugun1)
      ) {
        // 기존 구/군 선택 옵션을 유지하고 나머지 옵션들 추가
        if (options[0] === '구/군 선택') {
          options.push(info.gugun1);
        } else {
          options.unshift('구/군 선택');
          options.push(info.gugun1);
        }
      }
      
      setGugunOptions(options);
    } else {
      setGugunOptions(['구/군 선택']);
    }
  }, [info.sido1, info.gugun1]);

  return (
    <SelectBox $variant={variant}>
      {variant === 'userInfo' ? (
        <>
          <select
            onChange={handleChange}
            value={info.sido1 || ""}
            name="sido1"
            id="sido1"
            ref={el => (inputRefs.current.sido1 = el)}
            style={{ borderColor: invalid.sido1 ? '#ff4d4f' : undefined }}
          >
            {area0.map(sido => (
              <option key={sido} value={sido}>{sido}</option>
            ))}
          </select>
          <select
            onChange={handleChange}
            value={info.gugun1 || "구/군 선택"}
            name="gugun1"
            id="gugun1"
            ref={el => (inputRefs.current.gugun1 = el)}
            style={{ borderColor: invalid.gugun1 ? '#ff4d4f' : undefined }}
          >
            {gugunOptions.map(gugun => (
              <option key={gugun} value={gugun}>{gugun}</option>
            ))}
          </select>
        </>
      ) : (
        <>
          <Select
            onChange={handleChange}
            value={info.sido1 || ""}
            name="sido1"
            id="sido1"
            ref={el => (inputRefs.current.sido1 = el)}
            $invalid={invalid.sido1}
          >
            {area0.map(sido => (
              <option key={sido} value={sido}>{sido}</option>
            ))}
          </Select>
          <Select
            onChange={handleChange}
            value={info.gugun1 || "구/군 선택"}
            name="gugun1"
            id="gugun1"
            ref={el => (inputRefs.current.gugun1 = el)}
            $invalid={invalid.gugun1}
          >
            {gugunOptions.map(gugun => (
              <option key={gugun} value={gugun}>{gugun}</option>
            ))}
          </Select>
        </>
      )}
    </SelectBox>
  );
};

export default AreaDropDown;
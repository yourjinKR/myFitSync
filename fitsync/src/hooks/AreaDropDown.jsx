import React, { useEffect } from 'react';
import { selectBOX } from '../utils/AreaData'; // 시/도/군/구 데이터
import { Select } from '../styles/FormStyles';
import styled from 'styled-components';

const SelectBox = styled.div`
  display: flex;
  gap: 17px;

  select {
    margin-bottom : 22px;
    font-size: 1.8rem;
    option {
      color: var(--text-black);
      font-size: 1.8rem;
    }
  }
`;

const AreaDropDown = ({handleChange, invalid, inputRefs, info}) => {
  useEffect(() => {
    // Call the selectBOX function here to execute its logic
    selectBOX();
  }, []); // The empty dependency array ensures this runs once after the initial render

  return (
    <SelectBox>
      <Select
        onChange={handleChange}
        value={info.sido1}
        name="sido1"
        id="sido1"
        ref={el => (inputRefs.current.sido1 = el)}
        $invalid={invalid.sido1}
      />
      <Select
        onChange={handleChange}
        value={info.gugun1}
        name="gugun1"
        id="gugun1"
        ref={el => (inputRefs.current.gugun1 = el)}
        $invalid={invalid.gugun1}
      />
    </SelectBox>
  );
};

export default AreaDropDown;
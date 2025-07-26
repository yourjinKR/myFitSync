import React, { useEffect } from 'react';
import { selectBOX } from '../utils/AreaData'; // 시/도/군/구 데이터

const AreaDropDown = () => {
  useEffect(() => {
    // Call the selectBOX function here to execute its logic
    selectBOX();
  }, []); // The empty dependency array ensures this runs once after the initial render

  return (
    <div>
      <select name="sido1" id="sido1"></select>
      <select name="gugun1" id="gugun1"></select>
    </div>
  );
};

export default AreaDropDown;
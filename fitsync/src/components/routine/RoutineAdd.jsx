import React from 'react';
import styled from 'styled-components';

const RoutineAdd = () => {
  const RoutineAddWrapper = styled.div`
    padding:15px;
  `;

  const SearchBox = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 20px 0;
    & input {
      padding: 5px 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
  `;

  const handleSearch = () => {
    
  }

  return (
    <RoutineAddWrapper>
      <SearchBox>
        <input type="text" />
        <button onClick={handleSearch} type="button">검색</button>
      </SearchBox>
      <button type="button">부위 선택</button>
    </RoutineAddWrapper>
  );
};

export default RoutineAdd;
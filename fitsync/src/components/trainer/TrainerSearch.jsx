import React from 'react';
import TrainerProfileList from './TrainerProfileList';
import TrainerInfoList from './TrainerInfoList';
import styled from 'styled-components';

const SearchBox = styled.div`
  display:flex;
  justify-content: flex-end;
  margin:10px;
  gap:5px;
  & > input {
    border:1px solid #ccc;
    border-radius:5px;
    font-size:1.4rem;
    padding: 5px 10px;
  }
  & > button {
    border:1px solid #ccc;
    border-radius:5px;
    padding: 0 10px;
  }
`;

const TrainerSearch = () => {
  return (
    <div>
      <TrainerProfileList/>
      <SearchBox>
        <input type="text" />
        <button>검색</button>
      </SearchBox>
      <TrainerInfoList/>
    </div>
  );
};

export default TrainerSearch;
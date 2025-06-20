import React from 'react';
import styled from 'styled-components';

const EmptyData = styled.div`
  font-weight:bold;
  color:#d9d9d9;
  font-size:2rem;

`;

const RoutineList = () => {
  const List = [];
  return (
    <div>
      {
        List.length > 0 ? 
        <>
        </>
        :
        <EmptyData>
          데이터가 없습니다.
        </EmptyData>
      }
    </div>
  );
};

export default RoutineList;
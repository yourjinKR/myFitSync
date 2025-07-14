import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Routine from './Routine';
import axios from 'axios';

const EmptyData = styled.div`
  width: 100%;
  font-weight: bold;
  font-size: 2rem;
  color: var(--text-tertiary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  padding: 50px 0;
  text-align: center;
  margin-top: 12px;
  background: var(--bg-secondary);
`;

const RoutineListWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const RoutineList = () => {
  const [routinelist, setRoutinelist] = useState([]);

  const handleRoutineResponse = async () => {
    const response = await axios.get("/routine/getList", { withCredentials: true });
    const data = response.data;
    setRoutinelist(data.vo);
  };

  useEffect(() => {
    handleRoutineResponse();
  }, []);

  return (
    <RoutineListWrapper>
      {
        routinelist && routinelist.length > 0 ?
          <>
            {
              routinelist.map((routine, idx) => (
                <Routine
                  key={routine.routine_list_idx || idx}
                  data={routine}
                  onDelete={handleRoutineResponse} // 삭제 후 목록 갱신용 콜백 전달
                />
              ))
            }
          </>
          :
          <EmptyData>
            데이터가 없습니다.
          </EmptyData>
      }
    </RoutineListWrapper>
  );
};

export default RoutineList;
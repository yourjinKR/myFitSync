import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import MuscleGroup from './MuscleGroup';

const FilterWrapper = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 1001;
  height: 0;
  display: flex;
  align-items: flex-end;
  transition: 0.25s ease;
  overflow: hidden;
  background: rgba(0,0,0,0.4);

  h3 {
    text-align: center;
    font-size: 1.8rem;
    color: var(--text-primary);
    margin-bottom: 12px;
  }
  &.on {
    height: 100%;
  }
`;
const FilterInner = styled.div`
  padding: 18px 16px 16px 16px;
  background: var(--bg-secondary);
  height: 70%;
  width: 100%;
  border-radius: 16px 16px 0 0;
  box-shadow: 0 -4px 24px rgba(0,0,0,0.25);
  display: flex;
  flex-direction: column;
`;

const MuscleList = styled.div`
  border: 1px solid var(--border-light);
  margin-top: 10px;
  background: var(--bg-primary);
  border-radius: 12px;
  height: 92%;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 8px 0;
`;


const WorkoutFilter = ({init, setList, filterRef, category}) => {
  const [muscle, setMuscle] = useState(0);
  useEffect(() => {
    filterRef.current.classList.remove("on");
    const newList = init.filter(data => {
      if(parseInt(muscle) !== 0){
        return data.pt_category === category[muscle - 1];
      }else{
        return true;
      }
    });
    setList(newList);
  },[filterRef, muscle]);

  const handleFilter = (e) => {
    if (e.target === e.currentTarget) {
      filterRef.current.classList.remove("on");
    }
  }
 
  return (
    <FilterWrapper onClick={handleFilter} ref={filterRef}>
      <FilterInner>
        <h3>근육 그룹</h3>
        <MuscleList>
          <MuscleGroup 
            key={0} 
            idx={0}
            data={'전체'} 
            muscle={muscle}
            setMuscle={setMuscle} />
          {category.map((data,idx) => (
            <MuscleGroup 
              key={idx} 
              idx={idx + 1}
              data={data} 
              muscle={muscle}
              setMuscle={setMuscle} />
          ))}
        </MuscleList>
      </FilterInner>
    </FilterWrapper>
  );
};

export default React.memo(WorkoutFilter);
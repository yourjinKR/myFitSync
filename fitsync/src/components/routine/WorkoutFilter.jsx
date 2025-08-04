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
  transition: all 0.3s ease;
  overflow: hidden;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);

  h3 {
    text-align: center;
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 2rem;
  }
  
  &.on {
    height: 100%;
  }
`;
const FilterInner = styled.div`
  padding: 2.5rem 2rem 2rem;
  background: var(--bg-secondary);
  height: 75%;
  width: 100%;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -8px 32px rgba(0,0,0,0.3);
  display: flex;
  flex-direction: column;
  border-top: 3px solid var(--primary-blue);
`;

const MuscleList = styled.div`
  border: 2px solid var(--border-light);
  margin-top: 1.5rem;
  background: var(--bg-primary);
  border-radius: 16px;
  height: 85%;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 1.5rem 0;
  
  /* 스크롤바 스타일 */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--bg-tertiary);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--border-medium);
    border-radius: 4px;
    
    &:hover {
      background: var(--border-dark);
    }
  }
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
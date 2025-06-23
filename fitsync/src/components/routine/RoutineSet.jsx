import React from 'react';
import { useOutletContext } from 'react-router-dom';

const RoutineSet = () => {
  const { routineData, setRoutineData } = useOutletContext();
  console.log(" routineData", routineData)
  return (
    <div>
      
    </div>
  );
};

export default RoutineSet;
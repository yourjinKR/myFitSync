import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';

const RoutineMain = () => {
  const [routineData, setRoutineData] = useState({
    name: '',
    exercises: [],
  });
  
  useEffect(() => {
  },[routineData])

  return (
    <Outlet
      context={{ routineData, setRoutineData }}
    />
  );
};

export default RoutineMain;
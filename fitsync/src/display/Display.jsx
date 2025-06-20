import React from 'react';
import Header from '../layout/Header';
import { Route, Routes } from 'react-router-dom';
import Main from '../components/Main';
import Test from '../components/Test';
import styled from 'styled-components';
import Nav from '../layout/Nav';
import TrainerSearch from '../components/trainer/TrainerSearch';
import RoutineView from '../components/routine/RoutineView';

const DisplayWrapper = styled.div`
 max-width : 750px;
 width : 100%;
 margin: 0 auto;
 position: relative;
 height:100vh;
`;
const Display = () => {
  return (
    <DisplayWrapper>
      <Header/>
      <Routes>
        <Route path='/' element={<Main/>}/>
        <Route path='/trainer/search' element={<TrainerSearch/>}/>
        <Route path='/routine' element={<RoutineView />}/>
      </Routes>
      <Nav/>
    </DisplayWrapper>
  );
};

export default Display;
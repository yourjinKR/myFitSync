import React, { useEffect, useState } from 'react';
import Header from '../layout/Header';
import { Route, Routes } from 'react-router-dom';
import Main from '../components/Main';
import Test from '../components/Test';
import styled from 'styled-components';
import Nav from '../layout/Nav';
import TrainerSearch from '../components/trainer/TrainerSearch';
import RoutineView from '../components/routine/RoutineView';
import RoutineAdd from '../components/routine/RoutineAdd';
import RoutineSet from '../components/routine/RoutineSet';
import RoutineMain from '../components/routine/RoutineMain';
import Login from '../components/member/Login';
import googleAuthManager from '../util/googleAuth';
import TrainerMain from '../components/trainer/TrainerMain';
import TrainerDetailView from '../components/trainer/TrainerDetailView';
import Register from '../components/member/Register';

const DisplayWrapper = styled.div`
 max-width : 750px;
 width : 100%;
 margin: 0 auto;
 position: relative;
 height:100vh;
`;
const DisplayInnner = styled.div`
  position: relative;
  overflow: auto;
  height: calc(100% - 114px);
`;

const Display = () => {

  useEffect(() => {
    // 앱 시작 시 Google API 미리 로드
    initializeApp();
    
  }, []);

  const initializeApp = async () => {
    try {
      // Google API 스크립트 미리 로드 (백그라운드에서)
      await googleAuthManager.loadScript();
    } catch (error) {
      console.error('앱 초기화 실패:', error);
    }
  };
  
  return (
    <DisplayWrapper>
      <Header/>
      <DisplayInnner>
        <Routes>
          <Route path='/' element={<Main/>}/>
          <Route path='/login' element={<Login/>}/>
          <Route path='/Register' element={<Register/>}/>
          <Route path='/trainer' element={<TrainerMain/>}/>
          <Route path='/trainer/view' element={<TrainerDetailView/>}/>
          <Route path='/trainer/search' element={<TrainerSearch/>}/>
          <Route path='/routine' element={<RoutineMain/>}>
            <Route path='view' element={<RoutineView />}/>
            <Route path='add' element={<RoutineAdd />}/>
            <Route path='set' element={<RoutineSet />}/>
          </Route>
        </Routes>
      </DisplayInnner>
      <Nav/>
    </DisplayWrapper>
  );
};

export default Display;
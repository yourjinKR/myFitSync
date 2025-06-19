import React from 'react';
import Header from '../layout/Header';
import { Route, Routes } from 'react-router-dom';
import Main from '../components/Main';
import Test from '../components/Test';

const Display = () => {
  return (
    <div>
      <Header/>
      <Routes>
        <Route path='/' element={<Main/>}/>
        <Route path='/test' element={<Test/>}/>
      </Routes>
    </div>
  );
};

export default Display;
import React from 'react';
import Header from '../layout/Header';
import { Route, Routes } from 'react-router-dom';
import Main from '../components/Main';

const Display = () => {
  return (
    <div>
      <Header/>
      <Routes>
        <Route path='/' element={<Main/>}/>
      </Routes>
    </div>
  );
};

export default Display;
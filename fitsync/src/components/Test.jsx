import axios from 'axios';
import React, { useEffect } from 'react';

const Test = () => {
  const getTest = async () => {
    const resp = await axios.get("/api/test");
    const data = resp.data;
    console.log(" data", data);
  }

  useEffect(() => {
    getTest();
  },[])

  return (
    <div>
      
    </div>
  );
};

export default Test;
import React, { useEffect, useState } from 'react';
import TrainerProfileList from './TrainerProfileList';
import TrainerInfoList from './TrainerInfoList';
import styled from 'styled-components';
import axios from 'axios';

const SearchBox = styled.div`
  display:flex;
  justify-content: flex-end;
  margin:10px;
  gap:5px;
  & > input {
    border:1px solid #ccc;
    border-radius:5px;
    font-size:1.4rem;
    padding: 5px 10px;
  }
  & > button {
    border:1px solid #ccc;
    border-radius:5px;
    padding: 0 10px;
  }
`;

const handleTrainerSearchSubmit = (e) => {
  e.preventDefault();
  console.log('검색 시작');

}


const TrainerSearch = () => {
  const [trainers, setTrainers] = useState([]);

  // 컴포넌트 마운트 시 트레이너 목록 조회
  useEffect(() => {
    fetchTrainers();
  }, []);

  // 트레이너 목록을 서버에서 가져오는 함수 - 기존 MemberController의 임시 API 활용
  const fetchTrainers = async () => {
    try {
      // 실제 API 호출
      const response = await axios.get('/member/trainers');
      
      setTrainers(response.data || []);
      
    } catch (error) {
      console.error('트레이너 목록 조회 실패:', error);
      setTrainers([]);
    } finally {
    }
  };

  return (
    <div>
      <TrainerProfileList/>
      <SearchBox>
        <form onSubmit={handleTrainerSearchSubmit}>
          <input type="text" />
          <button>검색</button>
        </form>
      </SearchBox>
      <TrainerInfoList trainers={trainers} setTrainers={setTrainers} fetchTrainers={fetchTrainers}/>
    </div>
  );
};

export default TrainerSearch;
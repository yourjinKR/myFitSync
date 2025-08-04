import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import ReviewList from './review/ReviewList';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

const MainWrapper = styled.div`
  position:relative;
  padding: 15px;
`;
const Slogan = styled.h3`
  font-size:2.4rem;
  word-break:keep-all;
`;

const FindTrainerCTA = styled.button`
  border-radius:10px;
  box-shadow:0 0 5px rgba(0,0,0,0.1);
  width:100%;
  padding: 30px;
  font-size:3rem;
  margin:15px 0;
  border:1px solid #ccc;
`;

const Main = () => {
  const nav = useNavigate();

  const { isLogin, member_type, member_idx } = useSelector((state) => state.user.user);
  const [isMatched, setIsMatched] = useState(false);
  const [trainerInfo, setTrainerInfo] = useState(null);
  const [nextSchedule, setNextSchedule] = useState(null);

  // 트레이너면 강제로 트레이너 메인페이지로 이동
  useEffect(() => {
    if (isLogin && member_type === 'trainer' && member_idx) {
      nav(`/trainer/${member_idx}`);
    }
  }, [isLogin, member_type, member_idx, nav]);


useEffect(() => {
  if (isLogin && member_type === 'user') {
    axios.get(`/user/matched-member/${member_idx}`)
      .then(res => {
        const matched = res.data && res.data.matching_complete === 1;
        console.log('matched 상태:', matched);
        setIsMatched(matched);
      })
      .catch(err => {
        console.error('매칭 확인 실패', err);
        setIsMatched(false); // 실패 시 기본값 false
      });
  }
}, [isLogin, member_type, member_idx]);

// useEffect(() => {
//   if (isLogin && member_type === 'user') {
//     // 매칭된 트레이너 정보 조회
//     axios.get(`/user/${member_idx}/matched-trainer`)
//       .then(res => setTrainerInfo(res.data))
//       .catch(err => console.error('트레이너 정보 조회 실패', err));

//     // 다음 PT 스케줄 조회
//     axios.get(`/user/${member_idx}/next-schedule`)
//       .then(res => setNextSchedule(res.data))
//       .catch(err => console.error('다음 스케줄 조회 실패', err));
//   }
// }, [isLogin, member_type, member_idx]);


  const handleCTA = () => {
    nav('/trainer/search');
  };

  return (
    <>
      <MainWrapper>
        {!isLogin && (
          <>
            <Slogan>회원가입하고 나에게 맞는 트레이너를 찾아보세요!</Slogan>
            <FindTrainerCTA onClick={() => nav(handleCTA)}>
              PT찾기
            </FindTrainerCTA>
          </>
        )}

        {isLogin && member_type === 'user' && (
          isMatched ? (
            <>
              <Slogan>매칭된 트레이너와 함께<br />운동을 이어가보세요!</Slogan>
              <FindTrainerCTA onClick={() => nav('/mytrainer')}>
                내 트레이너 보기
              </FindTrainerCTA>
            </>
          ) : (
            <>
              <Slogan>아직 트레이너가 없으신가요?<br />지금 바로 찾아보세요!</Slogan>
              <FindTrainerCTA onClick={handleCTA}>
                PT찾기
              </FindTrainerCTA>
            </>
          )
        )}
      </MainWrapper>
      <ReviewList />
    </>
  );
};

export default Main;

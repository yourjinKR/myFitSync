import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import ReviewList from './review/ReviewList';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import TrainerCalendarView from './trainer/TrainerCalendarView';
import chatApi from '../utils/ChatApi';

const MainWrapper = styled.div`
  position:relative;
  padding: 2rem;
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

const TrainerCard = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-top: 2.5rem;
  padding: 2rem;
  background: rgba(255,255,255,0.04);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.10);
  border: 1px solid rgba(255,255,255,0.10);
  backdrop-filter: blur(18px);
  transition: box-shadow 0.2s, transform 0.2s;
  position: relative;
  cursor: pointer;

  img {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    margin-right: 2rem;
    object-fit: cover;
    box-shadow: 0 2px 8px rgba(74,144,226,0.15);
    border: 2px solid var(--primary-blue-light);
    background: var(--bg-secondary);
  }

  .info {
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
  }

  h3 {
    margin: 0;
    color: var(--primary-blue);
    font-size: 2.1rem;
    font-weight: 600;
    letter-spacing: -0.5px;
    text-shadow: 0 2px 8px rgba(74,144,226,0.10);
  }

  p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 1.5rem;
    font-weight: 400;
    letter-spacing: 0.02em;
    text-shadow: 0 1px 2px rgba(0,0,0,0.08);
  }
`;

const ScheduleCard = styled.div`
  margin-top: 2rem;
  padding: 2rem 2.5rem;
  background: rgba(74,144,226,0.08);
  border-radius: 14px;
  box-shadow: 0 4px 18px rgba(74,144,226,0.10), 0 1px 0 rgba(255,255,255,0.08);
  border: 1px solid var(--primary-blue-light);
  backdrop-filter: blur(12px);
  transition: box-shadow 0.2s, background 0.2s;
  position: relative;

  h4 {
    margin: 0 0 1rem 0;
    font-size: 1.7rem;
    font-weight: 600;
    color: var(--primary-blue);
    letter-spacing: -0.5px;
    text-shadow: 0 2px 8px rgba(74,144,226,0.10);
  }

  p {
    margin: 0.5rem 0;
    color: var(--text-primary);
    font-size: 1.5rem;
    font-weight: 400;
    letter-spacing: 0.02em;
    text-shadow: 0 1px 2px rgba(0,0,0,0.08);
    background: rgba(255,255,255,0.03);
    border-radius: 6px;
    padding: 0.7rem 1.2rem;
    display: inline-block;
  }
`;

const ChatButton = styled.button`
  padding: 1rem 2.2rem;
  font-size: 1.35rem;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(90deg, var(--primary-blue) 60%, var(--primary-blue-light) 100%);
  border: none;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(74,144,226,0.18), 0 1px 0 rgba(255,255,255,0.10);
  backdrop-filter: blur(10px);
  transition: background 0.2s, box-shadow 0.2s, transform 0.2s;
  cursor: pointer;
  outline: none;
  text-shadow: 0 2px 8px rgba(0,0,0,0.18), 0 1px 0 rgba(255,255,255,0.10);
  letter-spacing: 0.02em;
  &:hover {
    background: linear-gradient(90deg, var(--primary-blue-light) 0%, var(--primary-blue) 100%);
    color: #fff;
    box-shadow: 0 6px 24px rgba(74,144,226,0.28);
    transform: translateY(-2px) scale(1.05);
    text-shadow: 0 4px 16px rgba(0,0,0,0.22);
  }
`;


const Main = () => {
  const nav = useNavigate();

  const { isLogin, member_type, member_idx } = useSelector((state) => state.user.user);
  const [isMatched, setIsMatched] = useState(false);
  const [trainerInfo, setTrainerInfo] = useState(null);
  const [nextSchedule, setNextSchedule] = useState(null);
  const { user } = useSelector(state => state.user);

  // 트레이너면 강제로 트레이너 메인페이지로 이동
  useEffect(() => {
    if (isLogin && member_type === 'trainer' && member_idx) {
      nav(`/trainer/${member_idx}`);
    }
  }, [isLogin, member_type, member_idx, nav]);

  // 매칭 확인
  useEffect(() => {
    if (isLogin && member_type === 'user' && member_idx) {
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

  // 트레이너 정보 및 스케줄 조회
  useEffect(() => {
    if (isLogin && member_type === 'user' && member_idx) {
      // 매칭된 트레이너 정보 조회
      axios.get(`/user/${member_idx}/matched-trainer`)
        .then(res => setTrainerInfo(res.data))
        .catch(err => console.error('트레이너 정보 조회 실패', err));

      // 다음 PT 스케줄 조회
      axios.get(`/user/${member_idx}/next-schedule`)
        .then(res => setNextSchedule(res.data))
        .catch(err => console.error('다음 스케줄 조회 실패', err));
    }
  }, [isLogin, member_type, member_idx]);

  const handleCTA = () => {
    nav('/trainer/search');
  };

  const handleChatCTA = async (trainer) => {

     const response = await chatApi.registerRoom(trainer.member_idx, null, trainer.member_name);
     if(response) {
        // trainerInfo 객체 생성
      const completeTrainerInfo = {
        member_idx: trainer.member_idx,
        member_name: trainer.name || trainer.member_name || '트레이너',
        member_image: trainer.profile_image || trainer.member_image,
        member_gender: trainer.member_gender,
        member_birth: trainer.member_birth,
        member_email: trainer.member_email,
        member_type: trainer.member_type || 'trainer',
        member_info: trainer.description || trainer.member_info,
        member_purpose: trainer.member_purpose,
        member_time: trainer.availableTime || trainer.member_time,
        member_activity_area: trainer.member_activity_area,
        member_intro: trainer.intro || trainer.member_intro,
        member_disease: trainer.member_disease
      };

      // roomData 생성
      const enhancedRoomData = {
        ...response,
        // 트레이너 정보
        trainer_idx: trainer.member_idx,
        trainer_name: trainer.name || trainer.member_name || '트레이너',
        trainer_image: trainer.profile_image || trainer.member_image,
        trainer_gender: trainer.member_gender,
        trainer_birth: trainer.member_birth,
        trainer_email: trainer.member_email,
        trainer_type: trainer.member_type || 'trainer',
        
        // 현재 사용자(회원) 정보
        user_idx: user.member_idx,
        user_name: user.member_name || '회원',
        user_image: user.member_image,
        user_gender: user.member_gender,
        user_birth: user.member_birth,
        user_email: user.member_email,
        user_type: user.member_type || 'user'
      };


      nav(`/chat/${response.room_idx}`, {
        state: {
          roomData: enhancedRoomData,
          trainerInfo: completeTrainerInfo
        }
      });
     }
  }

return (
  <>
    <MainWrapper>
      {!isLogin && (
        <>
          <Slogan>회원가입하고 나에게 맞는 트레이너를 찾아보세요!</Slogan>
          <FindTrainerCTA onClick={() => nav(handleCTA)}>
            PT찾기
          </FindTrainerCTA>
          <ReviewList />
        </>
      )}

      {isLogin && member_type === 'user' && (
        isMatched ? (
          <>
            <Slogan>매칭된 트레이너와 함께<br />운동을 이어가보세요!</Slogan>

            {/* 매칭된 트레이너 정보 카드 */}
            {trainerInfo && (
              <TrainerCard>
                <img src={trainerInfo.member_image} alt="트레이너 프로필" />
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems : 'center' , width: '100%'}}>
                  <div className="info">
                    <h3>{trainerInfo.member_name} 트레이너</h3>
                    <p>{trainerInfo.member_email}</p>
                  </div>
                  <ChatButton onClick={() => handleChatCTA(trainerInfo)}>
                    대화하기
                  </ChatButton>
                </div>
              </TrainerCard>
            )}

            {/* 다음 PT 스케줄 정보 카드 */}
            {nextSchedule && (
              <ScheduleCard>
                <h4>다음 스케줄</h4>
                <p>
                  {new Date(nextSchedule.schedule_date).toLocaleDateString()} (
                  {nextSchedule.schedule_stime} ~ {nextSchedule.schedule_etime})
                </p>
                <p>{nextSchedule.schedule_content}</p>
              </ScheduleCard>
            )}
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

    <div style={{padding:'0 2rem 2rem'}}>
      <TrainerCalendarView autoHeight={'auto'}/>
    </div>
  </>
);

};

export default Main;
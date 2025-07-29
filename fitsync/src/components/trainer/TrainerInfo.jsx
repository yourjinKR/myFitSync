import React from 'react';
import styled from 'styled-components';
import MoneyFormatter from '../../utils/MoneyFormatter';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ChatApi from '../../utils/ChatApi';

const InfoWrapper = styled.div`
  display:flex;
  border-bottom:1px solid #ccc;
  padding:10px;
  gap:10px;
  align-items:center;
`;

const InfoBox = styled.div`
  width: calc(100% - 155px);
`;

const ImgBox = styled.div`
  width: 75px;
  height: 75px;
  border: 1px solid #ccc;
  overflow: hidden;
  border-radius: 8px;
  flex-shrink: 0;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;
const ChatCTA = styled.button`
  border-radius:5px;
  padding: 5px 10px;
  border:1px solid #ccc;
`;

const TrainerInfo = ({idx, trainerData}) => {

  const navigate = useNavigate();
  const { user } = useSelector(state => state.user); // Redux에서 현재 로그인 사용자 정보 가져오기

  // 1:1 상담 버튼 클릭
  const handleChatClick = async () => {

    // 로그인 검증
    if (!user || !user.isLogin) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    // 자기 자신과 채팅 방지
    if (user.member_email === trainerData.member_email) {
    alert('자기 자신과는 채팅할 수 없습니다.');
    return;
  }

    try {
      // 채팅방 참여자 정보 설정
      const trainer_idx = trainerData.member_idx; // 실제 트레이너 ID 우선 사용
      const room_name = `${trainerData.member_name}님과의 상담`;

      console.log('채팅방 생성 요청:', { trainer_idx, room_name });

      // 채팅방 생성/조회 API 호출
      const roomData = await ChatApi.registerRoom(trainer_idx, null, room_name);

      console.log('채팅방 생성/조회 성공:', roomData);

      // 채팅방으로 이동 (state를 통해 추가 정보 전달)
      navigate(`/chat/${roomData.room_idx}`, {
        state: {
          roomData,                 // 채팅방 기본 정보
          trainerInfo: trainerData  // 트레이너 상세 정보 (UI 표시용)
        }
      });

    } catch (error) {
      console.error('채팅방 생성 실패:', error);
      
      // 에러 메시지를 사용자에게 친화적으로 표시
      if (error.response?.status === 401) {
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
        navigate('/login');
      } else if (error.response?.status === 500) {
        alert('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } else {
        alert('채팅방 생성에 실패했습니다. 다시 시도해주세요.');
      }
    }

  };

  // 트레이너 상세보기
  const handleTrainerDetail = () => {
    navigate(`/trainer/view/${trainerData.member_idx}`, {
      state: { trainerData }
    });
  };  

  // 기본값 처리
  const trainerName = trainerData?.member_name || `트레이너 ${idx + 1}`;
  const trainerInfo = trainerData?.member_info || '트레이너 소개 정보가 없습니다.';
  const trainerPurpose = trainerData?.member_purpose || `트레이너의 전문 분야`;
  const trainerImage = trainerData?.member_image;

  return (
    <InfoWrapper>
      <ImgBox onClick={handleTrainerDetail}>
        <img src={trainerImage} alt={`${trainerName} 프로필`} />
      </ImgBox>
      <InfoBox>
        <h3>{trainerName}</h3>
        <p>{trainerInfo}</p>
        <p>{trainerPurpose}</p>
      </InfoBox>
      <ChatCTA onClick={handleChatClick} >1:1 상담</ChatCTA>
    </InfoWrapper>
  );
};

export default TrainerInfo;
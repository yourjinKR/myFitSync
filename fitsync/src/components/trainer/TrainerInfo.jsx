import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ChatApi from '../../utils/ChatApi';
import { FaMapMarkerAlt, FaClock, FaComments } from 'react-icons/fa';

const TrainerCard = styled.div`
  background: var(--bg-secondary);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--border-light);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.01), rgba(147, 197, 253, 0.005));
    pointer-events: none;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
    border-color: rgba(59, 130, 246, 0.2);
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #3B82F6, #60A5FA);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.3s ease;
  }

  &:hover::after {
    transform: scaleX(1);
  }
  
  @media (min-width: 768px) {
    border-radius: 20px;
    padding: 24px;
  }
`;

const TrainerHeader = styled.div`
  display: flex;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 16px;
  
  @media (min-width: 768px) {
    gap: 20px;
    margin-bottom: 20px;
  }
`;

const ProfileImage = styled.div`
  width: 70px;
  height: 70px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid ${props => {
    if (props.gender === '남자') return '#3B82F6';
    if (props.gender === '여자') return '#EC4899';
    return 'var(--border-light)';
  }};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  ${TrainerCard}:hover & {
    border-color: ${props => {
      if (props.gender === '남자') return '#1D4ED8';
      if (props.gender === '여자') return '#BE185D';
      return 'var(--primary-blue)';
    }};
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.1);
    
    img {
      transform: scale(1.02);
    }
  }
  
  @media (min-width: 768px) {
    width: 80px;
    height: 80px;
    border-radius: 14px;
  }
`;

const TrainerBasicInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 8px;

  .trainer-name {
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 6px;
    line-height: 1.3;
    
    @media (min-width: 768px) {
      font-size: 1.5rem;
      margin-bottom: 6px;
      gap: 8px;
    }
  }

  .trainer-location {
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--text-secondary);
    font-size: 1.1rem;

    .location-icon {
      color: var(--primary-blue);
      flex-shrink: 0;
    }
    
    @media (min-width: 768px) {
      gap: 6px;
      font-size: 1.2rem;
    }
  }

  .trainer-time {
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--text-secondary);
    font-size: 1.1rem;

    .time-icon {
      color: var(--primary-blue);
      flex-shrink: 0;
    }
    
    @media (min-width: 768px) {
      gap: 6px;
      font-size: 1.2rem;
    }
  }

  .trainer-details {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 8px;
    padding: 10px;
    background: var(--bg-primary);
    border-radius: 10px;
    border-left: 3px solid ${props => 
      props.gender === '남자' 
        ? 'var(--primary-blue)'
        : 'var(--primary-pink)'
    };
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
    
    @media (min-width: 768px) {
      padding: 12px;
      border-radius: 12px;
      gap: 10px;
      margin-top: 10px;
    }
  }

  .trainer-purpose {
    background: linear-gradient(135deg, #6366F1, #8B5CF6);
    color: white;
    padding: 6px 12px;
    border-radius: 16px;
    font-size: 0.8rem;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    align-self: flex-start;
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.25);
    
    &::before {
      content: '💪';
      font-size: 0.75rem;
    }
    
    @media (min-width: 768px) {
      padding: 7px 14px;
      border-radius: 18px;
      font-size: 0.85rem;
      gap: 5px;
    }
  }

  .trainer-intro {
    color: var(--text-primary);
    line-height: 1.4;
    font-size: 1.05rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    opacity: 0.9;
    
    @media (min-width: 768px) {
      line-height: 1.45;
      font-size: 1.1rem;
      -webkit-line-clamp: 2;
    }
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 12px;

  .btn {
    flex: 1;
    padding: 12px 16px;
    border: none;
    border-radius: 12px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    position: relative;
    overflow: hidden;

    &.chat-btn {
      background: linear-gradient(135deg, #3B82F6, #60A5FA);
      color: white;
      box-shadow: 0 3px 12px rgba(59, 130, 246, 0.3);
      border: 2px solid transparent;

      &:hover {
        background: linear-gradient(135deg, #1D4ED8, #3B82F6);
        box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);
      }

      &:active {
        transform: scale(0.98);
      }
    }
    
    @media (min-width: 768px) {
      padding: 14px 18px;
      border-radius: 14px;
      font-size: 1rem;
      gap: 8px;
      
      &.chat-btn:hover {
        box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
      }
    }
  }
`;

const GenderBadge = styled.span`
  background: ${props => {
    if (props.gender === '남자') return 'linear-gradient(135deg, #3B82F6, #60A5FA)';
    if (props.gender === '여자') return 'linear-gradient(135deg, #EC4899, #F472B6)';
    return 'linear-gradient(135deg, #9E9E9E, #757575)';
  }};
  color: white;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  box-shadow: 0 3px 10px ${props => {
    if (props.gender === '남자') return 'rgba(59, 130, 246, 0.3)';
    if (props.gender === '여자') return 'rgba(236, 72, 153, 0.3)';
    return 'rgba(158, 158, 158, 0.3)';
  }};
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }
  
  &:hover::before {
    left: 100%;
  }
  
  &:hover {
    transform: scale(1.05);
  }
  
  @media (min-width: 768px) {
    padding: 7px 16px;
    border-radius: 24px;
    font-size: 0.85rem;
  }
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
      const trainer_idx = trainerData.member_idx;
      const room_name = `${trainerData.member_name}님과의 상담`;

      // 채팅방 생성/조회 API 호출
      const roomData = await ChatApi.registerRoom(trainer_idx, null, room_name);

      // 완전한 trainerInfo 객체 생성 - 모든 필드 포함
      const completeTrainerInfo = {
        member_idx: trainerData.member_idx,
        member_name: trainerData.member_name || '트레이너',
        member_image: trainerData.member_image,
        member_gender: trainerData.member_gender, // 성별 정보 추가
        member_email: trainerData.member_email,
        member_type: trainerData.member_type || 'trainer',
        member_info: trainerData.member_info,
        member_purpose: trainerData.member_purpose,
        member_time: trainerData.member_time,
        member_activity_area: trainerData.member_activity_area,
        member_intro: trainerData.member_intro, // 추가 정보
        member_birth: trainerData.member_birth, // 추가 정보
        member_disease: trainerData.member_disease // 추가 정보
      };

      // 향상된 roomData 생성 - 완전한 사용자 정보 포함
      const enhancedRoomData = {
        ...roomData,
        // 트레이너 정보 (완전한 데이터)
        trainer_idx: trainerData.member_idx,
        trainer_name: trainerData.member_name || '트레이너',
        trainer_image: trainerData.member_image,
        trainer_gender: trainerData.member_gender,
        trainer_email: trainerData.member_email,
        trainer_type: trainerData.member_type || 'trainer',
        
        // 현재 사용자(회원) 정보 (완전한 데이터)
        user_idx: user.member_idx,
        user_name: user.member_name || '회원',
        user_image: user.member_image,
        user_gender: user.member_gender,
        user_email: user.member_email,
        user_type: user.member_type || 'user'
      };

      // 채팅방으로 이동 - 향상된 데이터와 함께
      navigate(`/chat/${roomData.room_idx}`, {
        state: {
          roomData: enhancedRoomData,
          trainerInfo: completeTrainerInfo
        }
      });

    } catch (error) {
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
  const trainerPurpose = trainerData?.member_purpose || `전문 분야`;
  const trainerImage = trainerData?.member_image;
  const trainerGender = trainerData?.member_gender;
  const trainerArea = trainerData?.member_activity_area || '활동 지역 미등록';
  const trainerTime = trainerData?.member_time || '시간 미등록';

  return (
    <TrainerCard onClick={handleTrainerDetail}>
      <TrainerHeader>
        <ProfileImage gender={trainerGender}>
          <img 
            src={trainerImage || '/default-profile.png'} 
            alt={`${trainerName} 프로필`} 
            onError={(e) => {
              e.target.src = '/default-profile.png';
            }}
          />
        </ProfileImage>
        <TrainerBasicInfo gender={trainerGender}>
          <div className="trainer-name">
            {trainerName}
            {trainerGender && <GenderBadge gender={trainerGender}>{trainerGender}</GenderBadge>}
          </div>
          <div className="trainer-location">
            <FaMapMarkerAlt className="location-icon" />
            {trainerArea}
          </div>
          <div className="trainer-time">
            <FaClock className="time-icon" />
            {trainerTime}
          </div>
          <div className="trainer-details">
            <div className="trainer-purpose">{trainerPurpose}</div>
            <div className="trainer-intro">{trainerInfo}</div>
          </div>
        </TrainerBasicInfo>
      </TrainerHeader>

      <ActionButtons onClick={(e) => e.stopPropagation()}>
        <button className="btn chat-btn" onClick={handleChatClick}>
          <FaComments />
          1:1 상담
        </button>
      </ActionButtons>
    </TrainerCard>
  );
};

export default TrainerInfo;
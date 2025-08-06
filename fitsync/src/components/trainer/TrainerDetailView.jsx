import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { MdChat } from 'react-icons/md';
import ChatApi from '../../utils/ChatApi';

import TrainerProfileHeader from './TrainerProfileHeader';
import TrainerIntroSection from './TrainerIntroSection';
import TrainerReviewSection from './TrainerReviewSection';

// 스타일 컴포넌트 추가
import styled from 'styled-components';

// 컨테이너
const Container = styled.div`
  margin: 0 auto;
  padding: 1.5rem;
  font-size: 1.4rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  min-height: 100vh;
`;

// 탭 메뉴
const TabMenu = styled.div`
  display: flex;
  border-bottom: 1px solid var(--border-light);
  margin-top: 2rem;
  background: var(--bg-secondary);
  border-radius: 1rem 1rem 0 0;
  overflow: hidden;
`;

// 탭 버튼
const TabButton = styled.button`
  flex: 1;
  padding: 1rem 0;
  border: none;
  background: ${({ $active }) => ($active ? 'var(--bg-tertiary)' : 'transparent')};
  font-weight: 600;
  font-size: 1.2rem;
  color: ${({ $active }) => ($active ? 'var(--primary-blue)' : 'var(--text-secondary)')};
  border-bottom: ${({ $active }) => ($active ? '0.2rem solid var(--primary-blue)' : 'transparent')};
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
`;

// 플로팅 버튼 (상담하기 버튼)
const FloatingButton = styled.button`
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: var(--primary-blue);
  color: var(--text-primary);
  border: none;
  box-shadow: 0 0.2rem 0.6rem rgba(0,0,0,0.2);
  cursor: pointer;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  transition: background 0.2s;
  
  &:hover {
    background: var(--primary-blue-hover);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: var(--border-medium);
  }
`;

// 모달 백드롭
const ModalBackdrop = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;

// 모달 박스
const ModalBox = styled.div`
  background: var(--bg-secondary);
  padding: 2rem;
  border-radius: 1rem;
  font-size: 1.1rem;
  color: var(--text-primary);
  min-width: 260px;
  box-shadow: 0 0.2rem 1rem rgba(0,0,0,0.15);
  text-align: center;
`;

// 모달 버튼
const ModalButton = styled.button`
  margin: 1rem 0.5rem 0 0;
  padding: 0.6rem 1.2rem;
  border-radius: 0.6rem;
  border: none;
  background: var(--primary-blue);
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: var(--primary-blue-hover);
  }
  &:last-child {
    background: var(--bg-tertiary);
    color: var(--text-secondary);
    &:hover {
      background: var(--border-medium);
    }
  }
`;

const TrainerDetailView = () => {
  const { trainerIdx } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.user);
  const loginUserId = user?.member_email;

  const [trainer, setTrainer] = useState(null);
  const [editedTrainer, setEditedTrainer] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('소개');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isConsultLoading, setIsConsultLoading] = useState(false); // 상담 버튼 로딩 상태

useEffect(() => {
  async function fetchData() {
    try {
      const res = await axios.get(`/trainer/profile/${trainerIdx}`);
      const data = res.data;

      // 이미지 idx만 배열로 가져옴
      const imageIdxList = data.member_info_image
        ? data.member_info_image.split(',').map(idx => parseInt(idx)).filter(idx => !isNaN(idx))
        : [];
      let imageUrls = [];

      try {
        if (imageIdxList.length > 0) {

          const imageRes = await axios.post(`/trainer/images`, imageIdxList);
          const urls = imageRes.data; // ["url1", "url2", ...]

          // id와 url 매핑하여 객체 배열 생성
          imageUrls = imageIdxList.map((id, idx) => ({
            id,
            url: urls[idx]
          }));
        }
      } catch (error) {
        console.error('이미지 URL 가져오기 실패:', error);
        imageUrls = [];
      }
      
      
      const trainerData = {
        member_idx: data.member_idx,
        member_email: data.member_email,
        name: data.member_name,
        images: imageUrls,  // 수정된 부분 반영
        description: data.member_info,
        certifications: data.awards
          ? data.awards.map(a => `${a.awards_category} - ${a.awards_name}`)
          : [],
        availableTime: data.member_time
          ? `${data.member_time}`
          : '',
        priceBase: data.member_price || 0,
        reviewList: data.reviews || [],
        intro: data.member_intro || '',
        specialties: data.specialties || [],
        profile_image: data.member_image,
        gym_idx: data.gym_idx,
        gymInfo: data.gymInfo,
        member_hidden: data.member_hidden,
        member_purpose : data.member_purpose,
        member_day: data.member_day,

        // 채팅방 생성 시 필요한 필드들
        member_name: data.member_name,
        member_image: data.member_image,
        member_gender: data.member_gender,
        member_birth: data.member_birth,
        member_type: data.member_type || 'trainer',
        member_info: data.member_info,
        member_purpose: data.member_purpose,
        member_time: data.member_time,
        member_activity_area: data.member_activity_area,
        member_intro: data.member_intro,
        member_disease: data.member_disease
      };
      console.log(trainerData);
      // 레슨 데이터도 함께 불러오기
      const lessonRes = await axios.get(`/trainer/lesson/${trainerIdx}`);
      const lessons = lessonRes.data || [];

      setTrainer({ ...trainerData, lessons });
      setEditedTrainer({ ...trainerData, lessons });
    } catch (error) {
      console.error(error);
    }
  }

  fetchData();
}, [trainerIdx]);


  const isLoggedIn = !!loginUserId;

  // 상담 버튼 클릭 핸들러
  const handleConsultClick = async () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    // 자기 자신과 채팅 방지
    if (user.member_email === trainer.member_email) {
      alert('자기 자신과는 채팅할 수 없습니다.');
      return;
    }

    setIsConsultLoading(true);

    try {
      // 채팅방 참여자 정보 설정
      const trainer_idx = trainer.member_idx;
      const room_name = `${trainer.name || trainer.member_name}님과의 상담`;

      // 채팅방 생성/조회 API 호출
      const roomData = await ChatApi.registerRoom(trainer_idx, null, room_name);

      // 완전한 trainerInfo 객체 생성
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

      // roomData 구성
      const enhancedRoomData = {
        ...roomData,
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

      console.log('🔥 채팅방 이동 시 전달되는 데이터:', {
        roomData: enhancedRoomData,
        trainerInfo: completeTrainerInfo,
        trainer_gender: enhancedRoomData.trainer_gender,
        user_gender: enhancedRoomData.user_gender
      });

      // 채팅방으로 이동
      navigate(`/chat/${roomData.room_idx}`, {
        state: {
          roomData: enhancedRoomData,
          trainerInfo: completeTrainerInfo
        }
      });

    } catch (error) {
      console.error('채팅방 생성 오류:', error);
      
      // 에러 메시지를 사용자에게 표시
      if (error.response?.status === 401) {
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
        navigate('/login');
      } else if (error.response?.status === 500) {
        alert('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } else {
        alert('채팅방 생성에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsConsultLoading(false);
    }
  };

  const handleEditToggle = async () => {
    if (isEditMode) {
      const payload = {
        member_idx: trainerIdx,
        member_intro: editedTrainer.intro || '',
        member_info: editedTrainer.description || '',
        member_info_image: editedTrainer.images?.map(img => img.id).join(',') || '',
        gym_idx: editedTrainer.gymInfo?.gym_idx || editedTrainer.gym_idx || null,
        member_purpose: editedTrainer.member_purpose || '',
        member_day: editedTrainer.member_day || '',
        member_time: editedTrainer.member_time || '',
      };
      console.log('[payload]', payload);
      try {
        await axios.put(`/trainer/update/${trainerIdx}`, payload, {
          withCredentials: true,
        });

        await axios.post(`/trainer/lesson/${trainerIdx}`, editedTrainer.lessons, {
          withCredentials: true,
        });
        setTrainer(editedTrainer);
      } catch (err) {
        alert('수정 중 오류가 발생했습니다.');
        console.error('[프론트] 수정 실패:', err);
      }
    }

    setIsEditMode(!isEditMode);
  };

  const handleChange = (field, value) => {
    setEditedTrainer(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!trainer || !editedTrainer) return <div style={{ fontSize: '1.1rem' }}>로딩 중...</div>;

  // 레슨 정렬: 횟수 적은 순으로
  const sortedLessons = (isEditMode ? editedTrainer.lessons : trainer.lessons)
    .slice()
    .sort((a, b) => (a.lesson_num || 0) - (b.lesson_num || 0));

  return (
    <Container>
      <TrainerProfileHeader
        trainer={isEditMode ? editedTrainer : trainer}
        isEdit={isEditMode}
        onChange={handleChange}
        onEditToggle={handleEditToggle}
        loginUserId={loginUserId}
      />

      {/* 탭 메뉴 */}
      <TabMenu>
        {['소개', '후기'].map(tab => (
          <TabButton
            key={tab}
            $active={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            type="button"
          >
            {tab}
          </TabButton>
        ))}
      </TabMenu>

      {/* 섹션 렌더링 */}
      {activeTab === '소개' && (
        <TrainerIntroSection
          trainer={isEditMode ? editedTrainer : trainer}
          isEdit={isEditMode}
          onChange={handleChange}
          onMoreClick={() => setActiveTab('후기')}
          lessons={sortedLessons}
          onLessonsChange={newLessons => handleChange('lessons', newLessons)}
          onTimeChange={(start, end) => handleChange('member_time', `${start}~${end}`)}
        />
      )}

      {activeTab === '후기' && <TrainerReviewSection reviews={trainer.reviewList} />}

      {/* 상담 버튼 */}
      {loginUserId !== trainer.member_email && (
        <FloatingButton 
          onClick={handleConsultClick} 
          disabled={isConsultLoading}
          title={isConsultLoading ? "채팅방 생성 중..." : "상담하기"}
        >
          {isConsultLoading ? (
            <div style={{ 
              width: '20px', 
              height: '20px', 
              border: '2px solid transparent',
              borderTop: '2px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          ) : (
            <MdChat />
          )}
        </FloatingButton>
      )}

      {/* 로그인 모달 */}
      {showLoginModal && (
        <ModalBackdrop>
          <ModalBox>
            <p>로그인이 필요한 기능입니다.</p>
            <ModalButton onClick={() => navigate('/login')}>로그인 하러가기</ModalButton>
            <ModalButton onClick={() => setShowLoginModal(false)}>닫기</ModalButton>
          </ModalBox>
        </ModalBackdrop>
      )}

      {/* 채팅방로딩 애니메이션을 위한 CSS */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </Container>
  );
};

export default TrainerDetailView;
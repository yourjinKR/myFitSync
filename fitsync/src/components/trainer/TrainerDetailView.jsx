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
  padding: 2rem;
  font-size: 1.6rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  min-height: 100vh;
`;

// 탭 메뉴
const TabMenu = styled.div`
  display: flex;
  border-bottom: 1px solid var(--border-light);
  margin-top: 2.5rem;
  background: var(--bg-secondary);
  border-radius: 1rem 1rem 0 0;
  overflow: hidden;
`;

// 탭 버튼
const TabButton = styled.button`
  flex: 1;
  padding: 1.5rem 0;
  border: none;
  background: ${({ $active }) => ($active ? 'var(--bg-tertiary)' : 'transparent')};
  font-weight: 700;
  font-size: 1.6rem;
  color: ${({ $active }) => ($active ? 'var(--primary-blue)' : 'var(--text-secondary)')};
  border-bottom: ${({ $active }) => ($active ? '0.25rem solid var(--primary-blue)' : 'transparent')};
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
`;

// 플로팅 버튼 (상담하기 버튼)
const FloatingButton = styled.button`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  background: var(--primary-blue);
  color: var(--text-primary);
  border: none;
  box-shadow: 0 0.3rem 0.8rem rgba(0,0,0,0.25);
  cursor: pointer;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
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
  padding: 2.5rem;
  border-radius: 1.2rem;
  font-size: 1.4rem;
  color: var(--text-primary);
  min-width: 320px;
  box-shadow: 0 0.3rem 1.2rem rgba(0,0,0,0.2);
  text-align: center;
`;

// 모달 버튼
const ModalButton = styled.button`
  margin: 1.2rem 0.6rem 0 0;
  padding: 0.8rem 1.5rem;
  border-radius: 0.8rem;
  border: none;
  background: var(--primary-blue);
  color: var(--text-primary);
  font-size: 1.3rem;
  font-weight: 600;
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

  // 성별 정보 보완을 위한 추가 API 호출 함수
  const fetchMemberGenderInfo = async (memberIdx) => {
    try {
      console.log(`성별 정보 보완을 위해 회원 정보 조회: ${memberIdx}`);
      
      // 1. 트레이너 목록 API를 활용한 성별 정보 조회
      const trainerListResponse = await axios.get('/member/trainers', {
        withCredentials: true
      });
      
      if (trainerListResponse.data && Array.isArray(trainerListResponse.data)) {
        const matchingTrainer = trainerListResponse.data.find(t => t.member_idx === parseInt(memberIdx));
        if (matchingTrainer && matchingTrainer.member_gender) {
          console.log(`트레이너 목록에서 성별 정보 발견: ${matchingTrainer.member_gender}`);
          return matchingTrainer.member_gender;
        }
      }

      // 2. 회원 프로필 API 시도
      try {
        const memberResponse = await axios.get(`/member/user/profile/${memberIdx}`, {
          withCredentials: true
        });
        
        if (memberResponse.data && memberResponse.data.member_gender) {
          console.log(`회원 프로필에서 성별 정보 발견: ${memberResponse.data.member_gender}`);
          return memberResponse.data.member_gender;
        }
      } catch (profileError) {
        console.warn('회원 프로필 API 호출 실패:', profileError);
      }

      // 3. 로컬 스토리지에서 캐시된 정보 확인
      const cachedGender = localStorage.getItem(`member_gender_${memberIdx}`);
      if (cachedGender && cachedGender !== 'null') {
        console.log(`로컬 스토리지에서 성별 정보 발견: ${cachedGender}`);
        return cachedGender;
      }

      console.warn(`회원 ${memberIdx}의 성별 정보를 찾을 수 없음`);
      return null;
    } catch (error) {
      console.error('성별 정보 조회 중 오류:', error);
      return null;
    }
  };

  // 성별 정보를 로컬 스토리지에 캐시하는 함수
  const cacheGenderInfo = (memberIdx, gender) => {
    if (memberIdx && gender) {
      try {
        localStorage.setItem(`member_gender_${memberIdx}`, gender);
        console.log(`성별 정보 캐시됨: ${memberIdx} -> ${gender}`);
      } catch (error) {
        console.warn('성별 정보 캐시 실패:', error);
      }
    }
  };

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
        
        // 성별 정보 보완 로직
        let finalGender = data.member_gender;
        
        if (!finalGender || finalGender === null) {
          console.warn('API 응답에 성별 정보 없음, 추가 조회 시도');
          const supplementaryGender = await fetchMemberGenderInfo(data.member_idx);
          
          if (supplementaryGender) {
            finalGender = supplementaryGender;
            // 성공적으로 조회된 성별 정보를 캐시
            cacheGenderInfo(data.member_idx, finalGender);
          }
        } else {
          // API에서 정상적으로 성별 정보가 온 경우에도 캐시
          cacheGenderInfo(data.member_idx, finalGender);
        }
        
        const trainerData = {
          member_idx: data.member_idx,
          member_email: data.member_email,
          name: data.member_name,
          images: imageUrls,
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
          member_purpose: data.member_purpose,
          member_day: data.member_day,

          // 채팅방 생성 시 필요한 필드들
          member_name: data.member_name,
          member_image: data.member_image,
          member_gender: finalGender,
          member_birth: data.member_birth,
          member_type: data.member_type || 'trainer',
          member_info: data.member_info,
            member_time: data.member_time,
          member_activity_area: data.member_activity_area,
          member_intro: data.member_intro,
          member_disease: data.member_disease
        };
        
        // 레슨 데이터도 함께 불러오기
        const lessonRes = await axios.get(`/trainer/lesson/${trainerIdx}`);
        const lessons = lessonRes.data || [];

        const finalTrainerData = { ...trainerData, lessons };
        setTrainer(finalTrainerData);
        setEditedTrainer(finalTrainerData);

      } catch (error) {
        console.error('트레이너 데이터 로드 오류:', error);
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

      // 성별 정보 재확인 로직
      let trainerGender = trainer.member_gender;
      
      if (!trainerGender || trainerGender === null) {
        console.warn('채팅방 생성 시점에 성별 정보 없음, 재조회 시도');
        const supplementaryGender = await fetchMemberGenderInfo(trainer.member_idx);
        if (supplementaryGender) {
          trainerGender = supplementaryGender;
          // 트레이너 상태 업데이트
          setTrainer(prev => ({ ...prev, member_gender: trainerGender }));
          setEditedTrainer(prev => ({ ...prev, member_gender: trainerGender }));
          console.log('채팅방 생성 시점에 성별 정보 보완됨:', trainerGender);
        }
      }

      // trainerInfo 객체 생성
      const completeTrainerInfo = {
        member_idx: trainer.member_idx,
        member_name: trainer.name || trainer.member_name || '트레이너',
        member_image: trainer.profile_image || trainer.member_image,
        member_gender: trainerGender,
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
        ...roomData,
        // 트레이너 정보
        trainer_idx: trainer.member_idx,
        trainer_name: trainer.name || trainer.member_name || '트레이너',
        trainer_image: trainer.profile_image || trainer.member_image,
        trainer_gender: trainerGender,
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
        
        // editedTrainer의 필드를 trainer 형태로 변환하여 상태 업데이트
        const updatedTrainer = {
          ...trainer,
          intro: editedTrainer.intro || '',
          description: editedTrainer.description || '',
          member_intro: editedTrainer.intro || '',
          member_info: editedTrainer.description || '',
          member_info_image: editedTrainer.images?.map(img => img.id).join(',') || '',
          gym_idx: editedTrainer.gymInfo?.gym_idx || editedTrainer.gym_idx || null,
          gymInfo: editedTrainer.gymInfo || trainer.gymInfo,
          member_purpose: editedTrainer.member_purpose || '',
          member_day: editedTrainer.member_day || '',
          member_time: editedTrainer.member_time || '',
          lessons: editedTrainer.lessons || trainer.lessons,
          images: editedTrainer.images || trainer.images
        };
        
        setTrainer(updatedTrainer);
        setEditedTrainer(updatedTrainer); // editedTrainer도 동기화
        console.log('[수정 완료] 업데이트된 trainer:', updatedTrainer);
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
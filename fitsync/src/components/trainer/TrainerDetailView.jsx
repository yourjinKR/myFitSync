import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { MdChat } from 'react-icons/md';

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

// 플로팅 버튼
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

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get(`/trainer/profile/${trainerIdx}`);
        const data = res.data;
        const trainerData = {
          member_idx: data.member_idx,
          member_email: data.member_email,
          name: data.member_name,
          images: data.member_info_image ? data.member_info_image.split(',') : [],
          description: data.member_info,
          certifications: data.awards ? data.awards.map(a => `${a.awards_category} - ${a.awards_name}`) : [],
          availableTime: data.member_time ? `월~토 ${data.member_time} (일요일 휴무)` : '',
          priceBase: data.member_price || 0,
          reviewList: data.reviews || [],
          intro: data.member_intro || '',
          specialties: data.specialties || [],
        };

        // 레슨 데이터도 함께 불러오기
        const lessonRes = await axios.get(`/trainer/lesson/${trainerIdx}`);
        const lessons = lessonRes.data || [];
        
        // state 세팅
        setTrainer({ ...trainerData, lessons });
        setEditedTrainer({ ...trainerData, lessons });
      } catch (error) {
        console.error(error);
      }
    }

    fetchData();
  }, [trainerIdx]);

  const isLoggedIn = !!loginUserId;

  const handleConsultClick = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
    } else {
      navigate(`/consult/${trainer.member_idx}`);
    }
  };

  const handleEditToggle = async () => {
    if (isEditMode) {
      console.log('[디버깅] editedTrainer.images:', editedTrainer.images);
      // 저장 로직
      const payload = {
        member_idx: trainerIdx,
        member_intro: editedTrainer.intro || '',
        member_info: editedTrainer.description || '',
        member_info_image: editedTrainer.images?.map(img => img.id).join(',') || '',
      };
      try {
        await axios.put(`/trainer/update/${trainerIdx}`, payload, {
          withCredentials: true,
        });

        await axios.post(`/trainer/lesson/${trainerIdx}`, editedTrainer.lessons, {
          withCredentials: true,
        });
        alert('수정이 완료되었습니다.');
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
        />
      )}

      {activeTab === '후기' && <TrainerReviewSection reviews={trainer.reviewList} />}

      {/* 상담 버튼 */}
      {loginUserId !== trainer.member_email && (
        <FloatingButton onClick={handleConsultClick} title="상담하기">
          <MdChat />
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
    </Container>
  );
};

export default TrainerDetailView;

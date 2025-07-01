import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TrainerProfileHeader from './TrainerProfileHeader';
import TrainerIntroSection from './TrainerIntroSection';
import TrainerReviewSection from './TrainerReviewSection';
import { useParams } from 'react-router-dom';

const TrainerDetailView = ({ loginUserId }) => {
  const { trainerIdx } = useParams();
  const [trainer, setTrainer] = useState(null);
  const [activeTab, setActiveTab] = useState('소개');

  useEffect(() => {
    axios.get(`/trainer/profile/${trainerIdx}`)
      .then((res) => {
        const data = res.data;
        setTrainer({
          member_idx: data.member_idx,
          name: data.member_name,
          images: data.member_info_image ? data.member_info_image.split(',') : [],
          description: data.member_info,
          certifications: data.awards ? data.awards.map(a => a.awards_category + ' - ' + a.awards_name) : [],
          availableTime: '월~토 06:00 ~ 23:00 (일요일 휴무)', // 필요시 API 추가
          priceBase: data.member_price,
          reviewList: data.reviews || [],
        });
      })
      .catch((err) => {
        console.error(err);
      });
  }, [trainerIdx]);

  if (!trainer) return <div>로딩 중...</div>;

  const isOwner = loginUserId === trainer.member_idx;
  const isLoggedIn = !!loginUserId;

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: 20 }}>
      <TrainerProfileHeader trainer={trainer} />

      {/* 버튼 조건부 렌더링 */}
      {isOwner && <button>프로필 수정</button>}
      {!isOwner && isLoggedIn && <button>1:1 상담하기</button>}

      <div style={{ display: 'flex', borderBottom: '1px solid #ccc', marginTop: 24 }}>
        <button
          style={{
            flex: 1,
            padding: '14px 0',
            border: 'none',
            background: 'none',
            fontWeight: 600,
            fontSize: '1.2rem',
            color: activeTab === '소개' ? '#007aff' : '#999',
            borderBottom: activeTab === '소개' ? '3px solid #007aff' : 'transparent',
            cursor: 'pointer',
          }}
          onClick={() => setActiveTab('소개')}
        >
          소개
        </button>
        <button
          style={{
            flex: 1,
            padding: '14px 0',
            border: 'none',
            background: 'none',
            fontWeight: 600,
            fontSize: '1.2rem',
            color: activeTab === '후기' ? '#007aff' : '#999',
            borderBottom: activeTab === '후기' ? '3px solid #007aff' : 'transparent',
            cursor: 'pointer',
          }}
          onClick={() => setActiveTab('후기')}
        >
          후기
        </button>
      </div>

      {activeTab === '소개' && (
        <TrainerIntroSection
          trainer={trainer}
          onMoreClick={() => setActiveTab('후기')}
        />
      )}
      {activeTab === '후기' && (
        <TrainerReviewSection reviews={trainer.reviewList} />
      )}
    </div>
  );
};

export default TrainerDetailView;

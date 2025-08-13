import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Review from '../review/Review';
import ReviewInsert from '../review/ReviewInsert';
import styled from 'styled-components';

const Section = styled.section`
  background: linear-gradient(145deg, var(--bg-secondary) 0%, rgba(40, 44, 52, 0.95) 100%);
  border-radius: 16px;
  border: 1px solid rgba(74, 144, 226, 0.15);
  padding: 32px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, 
      transparent, 
      rgba(74, 144, 226, 0.6) 20%, 
      var(--primary-blue) 50%, 
      rgba(74, 144, 226, 0.6) 80%, 
      transparent
    );
    opacity: 0.8;
  }
  
  @media (max-width: 768px) {
    padding: 24px;
    border-radius: 12px;
  }
`;

const Container = styled.div`
  /* 내부 패딩 제거 - Section에서 이미 padding 처리 */
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 24px;
  color: var(--text-primary);
  padding-bottom: 12px;
  border-bottom: 3px solid transparent;
  background: linear-gradient(90deg, var(--primary-blue), var(--primary-blue-light)) bottom;
  background-size: 100% 3px;
  background-repeat: no-repeat;
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;

  &::before {
    content: '⭐';
    font-size: 1.8rem;
    filter: drop-shadow(0 2px 4px rgba(74, 144, 226, 0.3));
  }

  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, 
      rgba(74, 144, 226, 0.3), 
      transparent
    );
    margin-left: 12px;
  }
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
    margin-bottom: 20px;
    
    &::before {
      font-size: 1.6rem;
    }
  }
`;

const ReviewCount = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-secondary);
  font-size: 1.4rem;
  margin-bottom: 20px;
  font-weight: 500;
  background: rgba(74, 144, 226, 0.08);
  padding: 12px 20px;
  border-radius: 25px;
  border: 1px solid rgba(74, 144, 226, 0.15);
  backdrop-filter: blur(10px);
  width: fit-content;

  &::before {
    content: '💬';
    font-size: 1.6rem;
    filter: drop-shadow(0 2px 4px rgba(74, 144, 226, 0.2));
  }

  span {
    font-weight: 600;
    color: var(--primary-blue);
  }
`;

const WriteButton = styled.button`
  background: linear-gradient(135deg, var(--primary-blue), var(--primary-blue-light));
  color: white;
  font-size: 1.4rem;
  font-weight: 600;
  cursor: pointer;
  padding: 14px 28px;
  border: none;
  border-radius: 25px;
  box-shadow: 
    0 6px 20px rgba(74, 144, 226, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  margin-bottom: 28px;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: '✍️';
    font-size: 1.2rem;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, 
      transparent, 
      rgba(255, 255, 255, 0.25), 
      transparent
    );
    transition: left 0.6s;
  }

  &:hover {
    box-shadow: 
      0 8px 25px rgba(74, 144, 226, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
    transform: translateY(-3px);

    &::after {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(-1px);
  }
`;

const ReviewList = styled.div`
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 80px 40px;
  color: var(--text-secondary);
  font-size: 1.6rem;
  background: linear-gradient(145deg, 
    rgba(74, 144, 226, 0.05) 0%, 
    rgba(40, 44, 52, 0.8) 50%, 
    rgba(74, 144, 226, 0.05) 100%
  );
  border-radius: 20px;
  border: 2px dashed rgba(74, 144, 226, 0.25);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  
  &::before {
    content: '💬';
    display: block;
    font-size: 5rem;
    margin-bottom: 20px;
    opacity: 0.7;
    filter: drop-shadow(0 6px 12px rgba(74, 144, 226, 0.3));
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  span {
    position: relative;
    z-index: 1;
    display: block;
    margin-top: 12px;
    font-size: 1.3rem;
    color: var(--primary-blue-light);
    font-style: italic;
    opacity: 0.9;
    font-weight: 500;
  }
`;

const TrainerReviewSection = () => {
  const { trainerIdx } = useParams();
  const memberIdx = useSelector(state => state.user.user?.member_idx);

  const [reviews, setReviews] = useState([]);
  const [canWriteReview, setCanWriteReview] = useState(false);
  const [showInsert, setShowInsert] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      if (trainerIdx) {
        const res = await axios.get(`/trainer/reviews/${trainerIdx}`);
        const filtered = Array.isArray(res.data) ? res.data.filter(r => r !== undefined && r !== null) : [];
        setReviews(filtered);
      }
    } catch (err) {
      console.error('리뷰 가져오기 실패:', err);
    }
  }, [trainerIdx]);

  const checkEligibility = useCallback(async () => {
    if (trainerIdx && memberIdx) {
      try {
        const res = await axios.get(`/user/check-review-eligibility`, {
          params: { trainerIdx, memberIdx }
        });
        setCanWriteReview(res.data === true);
      } catch (err) {
        console.error('작성 가능 여부 요청 실패:', err);
      }
    }
  }, [trainerIdx, memberIdx]);

  const handleReviewSubmitted = () => {
    // 리뷰 작성 완료 후 목록 새로고침
    fetchReviews();
    // 리뷰 작성 자격 다시 확인
    checkEligibility();
  };

  useEffect(() => {
    fetchReviews();
    checkEligibility();
  }, [trainerIdx, memberIdx, fetchReviews, checkEligibility]);

  return (
    <Section>
      <SectionTitle>리뷰</SectionTitle>
      <Container>
        <ReviewCount>
          <span>{reviews.length}</span>개의 소중한 후기
        </ReviewCount>

        {canWriteReview && (
          <WriteButton onClick={() => setShowInsert(true)}>리뷰 작성하기</WriteButton>
        )}

        {showInsert && (
          <ReviewInsert
            memberIdx={memberIdx}
            trainerIdx={trainerIdx}
            onClose={() => setShowInsert(false)}
            onReviewSubmitted={handleReviewSubmitted}
          />
        )}
      </Container>

      <ReviewList>
        {reviews.length === 0 ? (
          <EmptyMessage>
            작성된 리뷰가 없습니다
            <span>첫 번째 리뷰를 작성해보세요!</span>
          </EmptyMessage>
        ) : (
          reviews.map((r, index) => (
            <Review
              key={r.matching_idx || index}
              review={r}
            />
          ))
        )}
      </ReviewList>
    </Section>
  );
};

export default TrainerReviewSection;


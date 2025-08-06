import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Review from '../review/Review';
import ReviewInsert from '../review/ReviewInsert';
import styled from 'styled-components';

const Section = styled.section`
  padding: 22px 0 18px 0;
  background: var(--bg-secondary);
  position: relative;

  &:not(:last-of-type) {
    border-bottom: none;
    margin-bottom: 0;
  }

  & + & {
    /* 어두운 회색 막대형 구분선 */
    margin-top: 0;
    border-top: 0;
    &::before {
      content: '';
      display: block;
      width: calc(100% - 1px); // 좌우 여백을 주어 섹션 크기에 맞게
      height: 14px;
      background: #23272f;
      position: absolute;
      top: -7px;
      border-radius: 7px;
      z-index: 1;
    }
  }

  @media (max-width: 500px) {
    padding: 16px 0 12px 0;
    & + &::before {
      width: calc(100% - 16px);
      height: 9px;
      left: 8px;
      top: -4px;
    }
  }
`;

const Container = styled.div`
  padding-left: 20px;
  padding-right: 20px;
  @media (max-width: 500px) {
    padding-left: 8px;
    padding-right: 8px;
  }
`;

const SectionTitle = styled.h2`
  font-weight: 800;
  margin-bottom: 13px;
  font-size: 1.22rem;
  color: white;
  letter-spacing: -0.01em;
  position: relative;
  z-index: 2;
  padding-left: 20px;

  &::after {
    content: '';
    display: block;
    width: calc(100% - 40px);
    height: 3px;
    background: var(--primary-blue-light);
    border-radius: 2px;
    margin: 10px 0 0 0;
    margin-left: 0;
    margin-bottom: 30px;
    position: relative;
    left: 0;
  }

  @media (max-width: 500px) {
    font-size: 1.09rem;
    padding-left: 8px;
    &::after {
      width: calc(100% - 16px);
      height: 2px;
      margin-top: 7px;
      left: 0;
    }
  }
`;

const ReviewCount = styled.p`
  color: var(--text-tertiary);
  font-size: 1.01rem;
  margin-bottom: 10px;
`;

const WriteButton = styled.button`
  background: linear-gradient(90deg, var(--primary-blue) 60%, var(--primary-blue-light) 100%);
  color: var(--text-primary);
  border: none;
  padding: 9px 18px;
  font-size: 1.01rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
  margin-bottom: 18px;
  margin-top: 2px;
  transition: background 0.18s;
  &:hover {
    background: var(--primary-blue-hover);
    color: #fff;
  }
`;

const ReviewList = styled.div`
  margin-top: 10px;
`;

const TrainerReviewSection = () => {
  const { trainerIdx } = useParams();
  const memberIdx = useSelector(state => state.user.user?.member_idx);

  const [reviews, setReviews] = useState([]);
  const [canWriteReview, setCanWriteReview] = useState(false);
  const [showInsert, setShowInsert] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        if (trainerIdx) {
          const res = await axios.get(`/trainer/reviews/${trainerIdx}`);
          const filtered = Array.isArray(res.data) ? res.data.filter(r => r !== undefined && r !== null) : [];
          setReviews(filtered);
        }
      } catch (err) {
        console.error('리뷰 가져오기 실패:', err);
      }
    };

    const checkEligibility = async () => {
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
    };

    fetchReviews();
    checkEligibility();
  }, [trainerIdx, memberIdx]);

  return (
    <Section>
      <SectionTitle>리뷰</SectionTitle>
      <Container>
        <ReviewCount>총 {reviews.length}개의 리뷰</ReviewCount>

        {canWriteReview && (
          <WriteButton onClick={() => setShowInsert(true)}>리뷰 작성하기</WriteButton>
        )}

        {showInsert && (
          <ReviewInsert
            trainerIdx={trainerIdx}
            memberIdx={memberIdx}
            onClose={() => setShowInsert(false)}
          />
        )}
      </Container>

      <ReviewList>
        {reviews.map((r, index) => (
          <Review
            key={r.matching_idx || index}
            review={r}
          />
        ))}
      </ReviewList>
    </Section>
  );
};

export default TrainerReviewSection;


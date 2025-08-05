import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Review from '../review/Review';
import ReviewInsert from '../review/ReviewInsert';
import styled from 'styled-components';

const Section = styled.section`
  padding: 22px 0 18px 0;
  border-bottom: 1.5px solid var(--border-light);
  background: var(--bg-secondary);
  &:last-of-type {
    border-bottom: none;
  }
  @media (max-width: 500px) {
    padding: 16px 0 12px 0;
  }
`;

const SectionTitle = styled.h2`
  font-weight: 800;
  margin-bottom: 13px;
  font-size: 1.22rem;
  color: var(--primary-blue);
  letter-spacing: -0.01em;
  @media (max-width: 500px) {
    font-size: 1.09rem;
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

const TrainerReviewSection = ({ reviews: propReviews }) => {
  const { trainerIdx } = useParams();
  const memberIdx = useSelector(state => state.user.user?.member_idx);

  const [reviews, setReviews] = useState([]);
  const [canWriteReview, setCanWriteReview] = useState(false);
  const [showInsert, setShowInsert] = useState(false);

  useEffect(() => {
    if (propReviews && Array.isArray(propReviews)) {
      setReviews(propReviews.filter(r => r !== undefined && r !== null));
      return;
    }

    if (!trainerIdx || !memberIdx) return;

    axios.get(`/trainer/reviews/${trainerIdx}`)
      .then(res => {
        const data = Array.isArray(res.data) ? res.data.filter(r => r !== undefined && r !== null) : [];
        setReviews(data);
      });

    axios.get(`/user/check-review-eligibility`, {
      params: { trainerIdx, memberIdx }
    })
    .then(res => setCanWriteReview(res.data === true))
    .catch(err => console.error('작성 가능 여부 요청 실패:', err));
  }, [trainerIdx, memberIdx, propReviews]);

  return (
    <Section>
      <SectionTitle>리뷰</SectionTitle>
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

      <ReviewList>
        {reviews.map((r, index) => (
          <Review
            key={r.review_idx ?? index}
            review={r}
          />
        ))}
      </ReviewList>
    </Section>
  );
};

export default TrainerReviewSection;

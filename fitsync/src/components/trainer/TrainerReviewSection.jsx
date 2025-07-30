import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Review from '../review/Review';
import ReviewInsert from '../review/ReviewInsert';

const TrainerReviewSection = () => {
  const { trainerIdx } = useParams();
  const memberIdx = useSelector(state => state.user.user?.member_idx);

  const [reviews, setReviews] = useState([]);
  const [canWriteReview, setCanWriteReview] = useState(false);
  const [showInsert, setShowInsert] = useState(false);
  
  useEffect(() => {
    
    if (!trainerIdx || !memberIdx) return;

    // 리뷰 목록 불러오기
    axios.get(`/trainer/reviews/${trainerIdx}`)
      .then(res => setReviews(res.data))
      .catch(err => console.error('리뷰 목록 요청 실패:', err));
    
    // 리뷰 작성 가능 여부 체크
    axios.get(`/user/check-review-eligibility`, {
      params: { trainerIdx, memberIdx }
    })
      .then(res => setCanWriteReview(res.data === true))
      .catch(err => console.error('작성 가능 여부 요청 실패:', err));
  }, [trainerIdx, memberIdx]);

  return (
    <section>
      <h2>리뷰</h2>
      <p>총 {reviews.length}개의 리뷰</p>

      {canWriteReview && (
        <button onClick={() => setShowInsert(true)}>리뷰 작성하기</button>
      )}

      {showInsert && (
        <ReviewInsert
          trainerIdx={trainerIdx}
          memberIdx={memberIdx}
          onClose={() => setShowInsert(false)}
        />
      )}

      <div>
        {reviews.map((r, index) => (
          <Review
            key={r.review_idx ?? index}
            score={r.review_star}
            content={r.review_content}
            title={r.review_title}
            memberName={r.member_name}
          />
        ))}
      </div>
    </section>
  );
};

export default TrainerReviewSection;

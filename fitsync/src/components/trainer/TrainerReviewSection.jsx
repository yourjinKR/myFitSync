import React from 'react';
import styled from 'styled-components';

const Section = styled.section`
  padding: 24px 0;
  border-bottom: 1px solid #eee;
`;

const SectionTitle = styled.h3`
  font-weight: bold;
  margin-bottom: 16px;
  font-size: 1.3rem;
  color: #222;
`;

const ReviewItem = styled.div`
  padding: 14px;
  margin-bottom: 12px;
  background-color: #f9f9f9;
  border-radius: 8px;
  font-size: 1.1rem;
  color: #444;
  line-height: 1.6;

  strong {
    display: block;
    color: #777;
    margin-bottom: 4px;
    font-size: 0.9rem;
  }

  h4 {
    margin: 4px 0 6px;
    font-size: 1.15rem;
    font-weight: bold;
    color: #222;
  }
`;

const NoReview = styled.p`
  font-style: italic;
  font-size: 1rem;
  color: #888;
`;

const TrainerReviewSection = ({ reviews }) => {
  return (
    <Section>
      <SectionTitle>모든 후기</SectionTitle>
      {reviews.length > 0 ? (
        reviews
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .map((review) => (
            <ReviewItem key={review.id}>
              <strong>{review.date}</strong>
              <h4>{review.title}</h4>
              <div>{review.content}</div>
            </ReviewItem>
          ))
      ) : (
        <NoReview>아직 등록된 후기가 없습니다.</NoReview>
      )}
    </Section>
  );
};

export default TrainerReviewSection;

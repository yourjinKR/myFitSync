// Review.js
import React from 'react';
import ReviewScore from './ReviewScore';
import styled from 'styled-components';

const ReviewWrapper = styled.div`
  border-radius: 10px;
  box-shadow: 5px 5px 5px rgba(0,0,0,0.1);
  width: 100%;
  padding: 15px;
  border: 1px solid #ccc;
  box-sizing: border-box;
  height: ${({ height }) => (height ? `${height}px` : 'auto')};
  display: flex;
  flex-direction: column;
  justify-content: flex-start;

  & .review-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    h3 {
      font-size: 2.2rem;
      margin: 0;
    }
  }
  p{
    font-size:1.4rem
  }
`;

const Review = ({ content, score, height, title, memberName}) => {

  
  return (
    <ReviewWrapper height={height}>
      <div className="review-top">
        <h3>{memberName} 회원님</h3>
        <ReviewScore score={score} />
      </div>
      <div>{title}</div>
      <p>{content}</p>
    </ReviewWrapper>
  );
};

export default Review;

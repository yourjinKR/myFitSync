import React, { useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 2rem;
  box-sizing: border-box;
`;

const FormContainer = styled.div`
  background: linear-gradient(145deg, var(--bg-secondary) 0%, rgba(40, 44, 52, 0.95) 100%);
  border-radius: 20px;
  border: 1px solid rgba(74, 144, 226, 0.2);
  padding: 3rem 2.5rem;
  box-shadow: 
    0 15px 50px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, 
      transparent, 
      rgba(74, 144, 226, 0.6) 20%, 
      var(--primary-blue) 50%, 
      rgba(74, 144, 226, 0.6) 80%, 
      transparent
    );
  }
  
  @media (max-width: 600px) {
    padding: 2rem 1.5rem;
    margin: 1rem;
    border-radius: 16px;
  }
`;

const FormTitle = styled.h3`
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 2.5rem;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  
  &::before {
    content: '✍️';
    font-size: 2rem;
    filter: drop-shadow(0 2px 4px rgba(74, 144, 226, 0.3));
  }
  
  @media (max-width: 600px) {
    font-size: 2rem;
    margin-bottom: 2rem;
  }
`;

const InputField = styled.input`
  width: 100%;
  padding: 1.4rem 1.6rem;
  font-size: 1.5rem;
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  margin-bottom: 2rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(20px);
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  
  &:focus {
    outline: none;
    border-color: var(--primary-blue);
    box-shadow: 
      0 4px 16px rgba(0, 0, 0, 0.1),
      0 0 0 3px rgba(74, 144, 226, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.08);
  }
  
  &::placeholder {
    color: var(--text-tertiary);
    opacity: 1;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 1.4rem 1.6rem;
  font-size: 1.5rem;
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  margin-bottom: 2rem;
  resize: vertical;
  transition: all 0.3s ease;
  backdrop-filter: blur(20px);
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  font-family: inherit;
  line-height: 1.6;
  
  &:focus {
    outline: none;
    border-color: var(--primary-blue);
    box-shadow: 
      0 4px 16px rgba(0, 0, 0, 0.1),
      0 0 0 3px rgba(74, 144, 226, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.08);
  }
  
  &::placeholder {
    color: var(--text-tertiary);
    opacity: 1;
  }
`;

const StarSection = styled.div`
  margin-bottom: 3rem;
`;

const StarLabel = styled.p`
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &::before {
    content: '⭐';
    font-size: 1.4rem;
  }
`;

const StarRating = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  padding: 1rem 0;
  background: rgba(74, 144, 226, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(74, 144, 226, 0.1);
`;

const Star = styled.span`
  font-size: 2.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  
  &:hover {
    transform: scale(1.2);
    filter: drop-shadow(0 4px 8px rgba(74, 144, 226, 0.4));
  }
  
  &:active {
    transform: scale(1.1);
  }
  
  @media (max-width: 600px) {
    font-size: 2.2rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  
  @media (max-width: 600px) {
    flex-direction: column;
    gap: 0.8rem;
  }
`;

const Button = styled.button`
  padding: 1.2rem 2.4rem;
  font-size: 1.4rem;
  font-weight: 600;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  ${({ $primary }) => $primary ? `
    background: linear-gradient(135deg, var(--primary-blue), var(--primary-blue-light));
    color: white;
    box-shadow: 0 4px 16px rgba(74, 144, 226, 0.3);
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s;
    }
    
    &:hover {
      box-shadow: 0 6px 20px rgba(74, 144, 226, 0.4);
      transform: translateY(-2px);
      
      &::after {
        left: 100%;
      }
    }
  ` : `
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-secondary);
    border: 1px solid rgba(255, 255, 255, 0.2);
    
    &:hover {
      background: rgba(255, 255, 255, 0.15);
      color: var(--text-primary);
      border-color: rgba(255, 255, 255, 0.3);
    }
  `}
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 600px) {
    padding: 1rem 2rem;
    font-size: 1.3rem;
  }
`;

const ReviewInsert = ({ memberIdx, trainerIdx, matchingIdx, onClose, onReviewSubmitted }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [score, setScore] = useState(5);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title || !score || !memberIdx) {
      alert('제목, 별점이 필요합니다.');
      return;
    }

    // matchingIdx가 있으면 직접 사용, 없으면 백엔드에서 자동 찾기
    const requestData = {
      review_title: title,
      review_content: content,
      review_star: score,
      member_idx: memberIdx,
      trainer_idx: trainerIdx, // 트레이너 정보 추가로 전달
      review_hidden: 'N'
    };

    // matchingIdx가 있으면 추가
    if (matchingIdx) {
      requestData.matching_idx = matchingIdx;
    }

    setLoading(true);
    try {
      await axios.post('/user/reviewinsert', requestData);
      alert('리뷰가 등록되었습니다.');
      onClose();
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (err) {
      alert('리뷰 등록 실패: ' + (err.response?.data || '에러가 발생했습니다.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <FormContainer onClick={e => e.stopPropagation()}>
        <FormTitle>리뷰 작성</FormTitle>
        
        <InputField
          placeholder="제목을 입력해주세요"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        
        <TextArea
          placeholder="솔직한 후기를 작성해주세요. 다른 회원들에게 도움이 되는 소중한 정보가 됩니다."
          value={content}
          onChange={e => setContent(e.target.value)}
        />
        
        <StarSection>
          <StarLabel>별점을 선택해주세요</StarLabel>
          <StarRating>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star 
                key={i} 
                onClick={() => setScore(i + 1)}
              >
                {i < score ? '⭐️' : '☆'}
              </Star>
            ))}
          </StarRating>
        </StarSection>
        
        <ButtonGroup>
          <Button onClick={onClose} disabled={loading}>취소</Button>
          <Button $primary onClick={handleSubmit} disabled={loading}>
            {loading ? '등록 중...' : '등록하기'}
          </Button>
        </ButtonGroup>
      </FormContainer>
    </ModalOverlay>
  );
};

export default ReviewInsert;

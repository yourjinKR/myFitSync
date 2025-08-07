import React, { useState } from 'react';
import ReviewScore from './ReviewScore';
import styled from 'styled-components';
import axios from 'axios';
import { useSelector } from 'react-redux';

const ReviewWrapper = styled.div`
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  width: 100%;
  padding: 16px 18px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
  position: relative;

  .review-top {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    gap: 15px;
  }

  .profile-section {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
  }

  .profile-image {
    width: 55px;
    height: 55px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--border-light);
    background: var(--bg-secondary);
  }

  .profile-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .member-name {
    font-size: 1.7rem;
    margin: 0;
    color: var(--primary-blue);
    font-weight: 700;
    letter-spacing: -0.01em;
    margin-bottom: 25px;
  }

  .review-date {
    font-size: 1.2rem;
    color: var(--text-tertiary);
    margin: 0;
  }

  .review-title {
    font-size: 1.6rem;
    font-weight: 800;
    color: var(--text-primary);
    margin: 5px 0 3px 67px;
    word-break: break-all;
    line-height: 1.4;
    margin-top: -30px;
  }

  .review-content {
    font-size: 1.4rem;
    color: var(--text-secondary);
    line-height: 1.7;
    margin: 15px 0 0 67px;
    word-break: break-all;
  }
  
  @media (max-width: 500px) {
    padding: 14px 16px;
    margin-bottom: 16px;
    
    .profile-image {
      width: 50px;
      height: 50px;
    }
    
    .member-name {
      font-size: 1.5rem;
    }
    
    .review-date {
      font-size: 1.1rem;
    }
    
    .review-title {
      font-size: 1.4rem;
      margin: 4px 0 2px 62px;
    }
    
    .review-content {
      font-size: 1.3rem;
      margin: 0 0 0 62px;
    }
  }
`;

const ReportBtn = styled.button`
  background: transparent;
  color: var(--text-tertiary);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  transition: color 0.18s, background 0.18s;
  &:hover, &:focus {
    background: var(--border-light);
    color: var(--text-secondary);
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.55);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;

const ModalBox = styled.div`
  background: var(--bg-secondary);
  border-radius: 1.5rem;
  padding: 2.8rem 1.8rem 1.8rem 1.8rem;
  width: 95vw;
  max-width: 450px;
  box-sizing: border-box;
  box-shadow: 0 0.25rem 1.5rem rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const ModalTitle = styled.h2`
  margin: 0 0 1.5rem 0;
  color: var(--primary-blue);
  font-size: 1.7rem;
  font-weight: 700;
  text-align: center;
  letter-spacing: -0.01em;
`;

const ModalDesc = styled.div`
  color: var(--text-secondary);
  font-size: 1.3rem;
  text-align: center;
  margin-bottom: 1.5rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 110px;
  resize: none;
  margin-bottom: 1.5rem;
  padding: 1.2rem;
  font-size: 1.3rem;
  border-radius: 0.9rem;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 2px solid var(--border-light);
  transition: border 0.18s, background 0.18s;
  outline: none;

  &:focus {
    border: 2px solid var(--primary-blue);
    background: var(--bg-secondary);
  }

  &::placeholder {
    color: var(--text-tertiary);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.9rem;
`;

const Button = styled.button`
  padding: 0.9rem 2rem;
  font-size: 1.3rem;
  font-weight: 600;
  border-radius: 1rem;
  border: none;
  background: ${({ primary }) =>
    primary ? 'linear-gradient(90deg, var(--primary-blue) 60%, var(--primary-blue-light) 100%)' : 'var(--border-light)'};
  color: ${({ primary }) => (primary ? 'var(--text-primary)' : 'var(--text-secondary)')};
  box-shadow: ${({ primary }) => primary ? '0 0.06rem 0.25rem rgba(74,144,226,0.12)' : 'none'};
  transition: background 0.18s, color 0.18s;
  cursor: pointer;

  &:hover, &:focus {
    background: ${({ primary }) =>
      primary
        ? 'linear-gradient(90deg, var(--primary-blue-hover) 60%, var(--primary-blue) 100%)'
        : 'var(--border-medium)'};
    color: ${({ primary }) => (primary ? 'var(--bg-primary)' : 'var(--text-primary)')};
    outline: none;
  }
`;

const Review = ({ review = {} }) => {
  const {
    matching_idx,
    review_title,
    review_content,
    review_star,
    member_name,
    member_image,
  } = review;

  const [modalVisible, setModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const member = useSelector(state => state.user.user); // 로그인 유저 정보

  const openModal = () => {
    setReportReason('');
    setModalVisible(true);
  };
  const closeModal = () => setModalVisible(false);

  const handleSubmit = async () => {
    if (!reportReason.trim()) {
      alert('신고 사유를 입력해주세요.');
      return;
    }

    const reportData = {
      idx_num: matching_idx,
      report_category: 'review',
      report_content: reportReason,
      report_hidden: 0,
      member_idx: member?.member_idx,
    };

    try {
      await axios.post('/member/report/review', reportData);
      alert('신고가 접수되었습니다.');
      closeModal();
    } catch (err) {
      console.error('신고 실패:', err.response?.data || err.message);
      alert('신고 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <>
      <ReviewWrapper>
        <div className="review-top">
          <div className="profile-section">
            <img 
              className="profile-image" 
              src={member_image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDUiIGhlaWdodD0iNDUiIHZpZXdCb3g9IjAgMCA0NSA0NSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjIuNSIgY3k9IjIyLjUiIHI9IjIyLjUiIGZpbGw9IiNGNUY1RjUiLz4KPGNpcmNsZSBjeD0iMjIuNSIgY3k9IjE3IiByPSI4IiBmaWxsPSIjQzRDNEM0Ii8+CjxwYXRoIGQ9Ik0zNiA0MEMzNiAzMi4yNjggMjkuNzMyIDI2IDIyIDI2UzggMzIuMjY4IDggNDBIMzZaIiBmaWxsPSIjQzRDNEM0Ii8+Cjwvc3ZnPgo='} 
              alt={`${member_name || '익명'} 프로필`}
              onError={(e) => {
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDUiIGhlaWdodD0iNDUiIHZpZXdCb3g9IjAgMCA0NSA0NSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjIuNSIgY3k9IjIyLjUiIHI9IjIyLjUiIGZpbGw9IiNGNUY1RjUiLz4KPGNpcmNsZSBjeD0iMjIuNSIgY3k9IjE3IiByPSI4IiBmaWxsPSIjQzRDNEM0Ii8+CjxwYXRoIGQ9Ik0zNiA0MEMzNiAzMi4yNjggMjkuNzMyIDI2IDIyIDI2UzggMzIuMjY4IDggNDBIMzZaIiBmaWxsPSIjQzRDNEM0Ii8+Cjwvc3ZnPgo=';
              }}
            />
            <div className="profile-info">
              <h3 className="member-name">{member_name || '익명'} 회원님</h3>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px'}}>
            <ReviewScore score={review_star} />
            <ReportBtn onClick={openModal}>⚠</ReportBtn>
          </div>
        </div>
        <div className="review-title">{review_title}</div>
        <div className="review-content">{review_content}</div>
      </ReviewWrapper>

      {modalVisible && (
        <ModalOverlay onClick={closeModal}>
          <ModalBox onClick={e => e.stopPropagation()}>
            <ModalTitle>리뷰 신고하기</ModalTitle>
            <ModalDesc>신고 사유를 입력해주세요</ModalDesc>
            <TextArea
              placeholder="신고 사유를 자세히 작성해 주세요."
              value={reportReason}
              onChange={e => setReportReason(e.target.value)}
            />
            <ButtonGroup>
              <Button onClick={closeModal}>취소</Button>
              <Button onClick={handleSubmit} primary>신고</Button>
            </ButtonGroup>
          </ModalBox>
        </ModalOverlay>
      )}
    </>
  );
};

export default Review;

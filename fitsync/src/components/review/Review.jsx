import React, { useState } from 'react';
import ReviewScore from './ReviewScore';
import styled from 'styled-components';
import axios from 'axios';
import { useSelector } from 'react-redux';

const ReviewWrapper = styled.div`
  border-radius: 14px;
  box-shadow: 0 0.08rem 0.5rem rgba(74,144,226,0.10);
  width: 100%;
  padding: 22px 18px 18px 18px;
  border: 1.5px solid var(--border-light);
  background: var(--bg-tertiary);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  margin-bottom: 22px;
  position: relative;

  .review-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;

    h3 {
      font-size: 1.13rem;
      margin: 0;
      color: var(--primary-blue);
      font-weight: 700;
      letter-spacing: -0.01em;
    }
  }

  .review-title {
    font-size: 1.09rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 7px 0 5px 0;
    word-break: break-all;
  }

  .review-content {
    font-size: 1.05rem;
    color: var(--text-secondary);
    line-height: 1.7;
    margin: 0;
    word-break: break-all;
  }
`;

const ReportBtn = styled.button`
  background: linear-gradient(90deg, var(--primary-blue) 60%, var(--primary-blue-light) 100%);
  color: var(--text-primary);
  border: none;
  border-radius: 8px;
  padding: 7px 16px;
  font-size: 1.01rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.18s, color 0.18s;
  &:hover, &:focus {
    background: var(--primary-blue-hover);
    color: #fff;
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
  border-radius: 1.2rem;
  padding: 2.2rem 1.5rem 1.5rem 1.5rem;
  width: 95vw;
  max-width: 400px;
  box-sizing: border-box;
  box-shadow: 0 0.2rem 1.2rem rgba(0,0,0,0.18);
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const ModalTitle = styled.h2`
  margin: 0 0 1.2rem 0;
  color: var(--primary-blue);
  font-size: 1.4rem;
  font-weight: 700;
  text-align: center;
  letter-spacing: -0.01em;
`;

const ModalDesc = styled.div`
  color: var(--text-secondary);
  font-size: 1.08rem;
  text-align: center;
  margin-bottom: 1.2rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 90px;
  resize: none;
  margin-bottom: 1.2rem;
  padding: 1rem;
  font-size: 1.08rem;
  border-radius: 0.7rem;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1.5px solid var(--border-light);
  transition: border 0.18s, background 0.18s;
  outline: none;

  &:focus {
    border: 1.5px solid var(--primary-blue);
    background: var(--bg-secondary);
  }

  &::placeholder {
    color: var(--text-tertiary);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.7rem;
`;

const Button = styled.button`
  padding: 0.7rem 1.6rem;
  font-size: 1.08rem;
  font-weight: 600;
  border-radius: 0.8rem;
  border: none;
  background: ${({ primary }) =>
    primary ? 'linear-gradient(90deg, var(--primary-blue) 60%, var(--primary-blue-light) 100%)' : 'var(--border-light)'};
  color: ${({ primary }) => (primary ? 'var(--text-primary)' : 'var(--text-secondary)')};
  box-shadow: ${({ primary }) => primary ? '0 0.05rem 0.2rem rgba(74,144,226,0.10)' : 'none'};
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
    review_idx,
    review_title,
    review_content,
    review_star,
    member_name
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
      idx_num: review_idx,
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
          <h3>{member_name} 회원님</h3>
          <ReportBtn onClick={openModal}>신고</ReportBtn>
        </div>
        <ReviewScore score={review_star} />
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

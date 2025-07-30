import React, { useState } from 'react';
import axios from 'axios';

const ReviewInsert = ({ matchingIdx, memberIdx, onClose }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [score, setScore] = useState(5);

  const handleSubmit = () => {
    if (!title || !score || !memberIdx) {
      console.log(matchingIdx, memberIdx);
      
      alert('제목, 별점, 매칭 정보가 필요합니다.');
      return;
    }

    axios.post('/user/reviewinsert', {
      review_title: title,
      review_content: content,
      review_star: score,
      member_idx: memberIdx,
      review_hidden: 'N'
    })
      .then(() => {
        alert('리뷰가 등록되었습니다.');
        onClose();
      })
      .catch(err => {
        alert('리뷰 등록 실패: ' + (err.response?.data || '에러'));
      });
  };

  return (
    <div className="review-insert">
      <h3>리뷰 작성</h3>
      <input
        placeholder="제목"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <textarea
        placeholder="내용을 입력하세요"
        value={content}
        onChange={e => setContent(e.target.value)}
      />
      <div>
        <p>별점:</p>
        <div>
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} onClick={() => setScore(i + 1)} style={{ cursor: 'pointer' }}>
              {i < score ? '⭐️' : '☆'}
            </span>
          ))}
        </div>
      </div>
      <button onClick={handleSubmit}>등록</button>
      <button onClick={onClose}>취소</button>
    </div>
  );
};

export default ReviewInsert;

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import TrainerIntroduce from './TrainerIntroduce';
import TrainerPriceList from './TrainerPriceList';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import TrainerMapContainer from './TrainerMapContainer';

// Styled Components
const Section = styled.section`
  padding: 24px 0;
  border-bottom: 1px solid var(--border-light);
  background: var(--bg-secondary);
`;

const SectionTitle = styled.h3`
  font-weight: bold;
  margin-bottom: 16px;
  font-size: 1.3rem;
  color: var(--text-primary);
`;

const CertList = styled.ul`
  list-style: none;
  padding-left: 0;
  font-size: 1.15rem;
  color: var(--text-primary);

  li {
    margin-bottom: 10px;
    cursor: pointer;
  }
`;

const InfoContent = styled.div`
  font-size: 1.15rem;
  color: var(--text-secondary);
  line-height: 1.6;
  white-space: pre-line;
`;

const ReviewItem = styled.div`
  padding: 14px;
  margin-bottom: 12px;
  background-color: var(--bg-tertiary);
  border-radius: 8px;
  font-size: 1.1rem;
  color: var(--text-primary);
  line-height: 1.6;

  strong {
    display: block;
    color: var(--text-tertiary);
    margin-bottom: 4px;
    font-size: 0.9rem;
  }

  h4 {
    margin: 4px 0 6px;
    font-size: 1.15rem;
    font-weight: bold;
    color: var(--primary-blue);
  }
`;

const MoreButton = styled.button`
  margin-top: 10px;
  background: none;
  border: none;
  color: var(--primary-blue);
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  padding: 0;
  &:hover {
    color: var(--primary-blue-hover);
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 10px;
  max-width: 90%;
  max-height: 90%;
  text-align: center;

  img {
    max-width: 100%;
    max-height: 80vh;
    border-radius: 8px;
  }
`;

const TrainerIntroSection = ({ trainer, onMoreClick, isEdit, onChange, lessons, onLessonsChange }) => {
  const { trainerIdx } = useParams();
  const [awards, setAwards] = useState([]);
  const [selectedAward, setSelectedAward] = useState(null);
  const [newAward, setNewAward] = useState({ category: '', name: '', file: null });

  useEffect(() => {
    const fetchAwards = async () => {
      try {
        const res = await axios.get(`/trainer/${trainerIdx}/awards`);
        setAwards(res.data);
      } catch (err) {
        console.error('Failed to fetch awards:', err);
      }
    };
    if (trainerIdx) fetchAwards();
  }, [trainerIdx]);

  const handleAwardChange = (field, value) => setNewAward(prev => ({ ...prev, [field]: value }));

  const handleAwardFileChange = (e) => setNewAward(prev => ({ ...prev, file: e.target.files[0] }));

  const handleImageUpload = async (formData) => {
    try {
      const res = await axios.post('/trainer/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      return res.data;
    } catch (err) {
      console.error('업로드 실패', err);
      alert('업로드 실패');
      return null;
    }
  };

  const handleAwardSubmit = async () => {
    if (!newAward.category || !newAward.name || !newAward.file) {
      alert('모든 항목을 입력해주세요.');
      return;
    }

    const formData = new FormData();
    formData.append('category', newAward.category);
    formData.append('name', newAward.name);
    formData.append('file', newAward.file);

    try {
      await axios.post(`/trainer/${trainerIdx}/award`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      alert('등록 요청이 완료되었습니다 (관리자 승인 후 노출됩니다)');
      setNewAward({ category: '', name: '', file: null });
    } catch (err) {
      console.error(err);
      alert('등록 실패');
    }
  };

  return (
    <>
      <Section>
        <SectionTitle>선생님 소개</SectionTitle>
        <TrainerIntroduce
          images={trainer.images}
          description={trainer.description}
          isEdit={isEdit}
          onChange={onChange}
          onImageUpload={handleImageUpload}
        />
      </Section>

      <Section>
        <SectionTitle>검증된 자격 사항</SectionTitle>
        <CertList>
          {awards.length === 0 && <li>데이터가 없습니다.</li>}
          {awards.map((a, i) => (
            <li key={i} onClick={() => setSelectedAward(a)}>
              📜 [{a.awards_category}] {a.awards_name}
            </li>
          ))}
        </CertList>

        {isEdit && (
          <div style={{ marginTop: '16px' }}>
            <label>
              카테고리:
              <select
                value={newAward.category}
                onChange={(e) => handleAwardChange('category', e.target.value)}
              >
                <option value="">선택</option>
                <option value="자격증">자격증</option>
                <option value="학위">학위</option>
                <option value="수상경력">수상경력</option>
              </select>
            </label>
            <br />
            <label>
              이름:
              <input
                type="text"
                value={newAward.name}
                onChange={(e) => handleAwardChange('name', e.target.value)}
              />
            </label>
            <br />
            <label>
              증명 이미지:
              <input type="file" onChange={handleAwardFileChange} />
            </label>
            <br />
            <button onClick={handleAwardSubmit}>+ 자격 사항 추가</button>
          </div>
        )}
      </Section>

      {selectedAward && (
        <ModalOverlay onClick={() => setSelectedAward(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <h4>{selectedAward.awards_name}</h4>
            <img
              src={selectedAward.awards_certificate}
              alt={`${selectedAward.awards_name} 증명서`}
            />
          </ModalContent>
        </ModalOverlay>
      )}

      <Section>
        <SectionTitle>레슨 가능 시간</SectionTitle>
        <InfoContent>{trainer.availableTime}</InfoContent>
      </Section>

      <Section>
        <SectionTitle>최근 후기</SectionTitle>
        {trainer.reviewList
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 2)
          .map((review) => (
            <ReviewItem key={review.id}>
              <strong>{review.date}</strong>
              <h4>{review.title}</h4>
              <div>{review.content}</div>
            </ReviewItem>
          ))}
        <MoreButton onClick={onMoreClick}>더 보기 →</MoreButton>
      </Section>

      <TrainerPriceList
        lessons={lessons || []}
        isEdit={isEdit}
        onLessonsChange={onLessonsChange}
        onChange={onChange}
        />

      <SectionTitle>위치</SectionTitle>
      {trainer.gymInfo !== null || isEdit ? (
        <TrainerMapContainer 
          gymInfo={trainer.gymInfo}
          isEdit={isEdit}
          onChange={onChange}/>) : (<>등록된 체육관이 없습니다 !</>)}
    </>
  );
};

export default TrainerIntroSection;

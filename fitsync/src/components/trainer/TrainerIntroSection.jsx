import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import TrainerIntroduce from './TrainerIntroduce';
import TrainerPriceList from './TrainerPriceList';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import TrainerMapContainer from './TrainerMapContainer';

// Styled Components
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

const SectionTitle = styled.h3`
  font-weight: 800;
  margin-bottom: 13px;
  font-size: 2.22rem;
  color: var(--primary-blue);
  letter-spacing: -0.01em;
  @media (max-width: 500px) {
    font-size: 2.09rem;
  }
`;

const CertList = styled.ul`
  list-style: none;
  padding-left: 0;
  font-size: 1.09rem;
  color: var(--text-primary);
  margin-bottom: 0.7rem;
  li {
    margin-bottom: 8px;
    cursor: pointer;
    transition: color 0.18s;
    &:hover { color: var(--primary-blue); }
  }
`;

const InfoContent = styled.div`
  font-size: 1.09rem;
  color: var(--text-secondary);
  line-height: 1.7;
  white-space: pre-line;
  margin-bottom: 0.5rem;
  @media (max-width: 500px) {
    font-size: 0.98rem;
  }
`;

const ReviewItem = styled.div`
  padding: 12px;
  margin-bottom: 10px;
  background-color: var(--bg-tertiary);
  border-radius: 8px;
  font-size: 1.05rem;
  color: var(--text-primary);
  line-height: 1.6;

  strong {
    display: block;
    color: var(--text-tertiary);
    margin-bottom: 3px;
    font-size: 0.89rem;
    font-weight: 600;
  }

  h4 {
    margin: 3px 0 5px;
    font-size: 1.09rem;
    font-weight: bold;
    color: var(--primary-blue);
  }
`;

const MoreButton = styled.button`
  margin-top: 7px;
  background: none;
  border: none;
  color: var(--primary-blue);
  font-size: 1.01rem;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
  border-radius: 0.7rem;
  transition: color 0.18s, background 0.18s;
  &:hover {
    color: var(--primary-blue-hover);
    background: var(--bg-tertiary);
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
  background: var(--bg-secondary);
  padding: 18px;
  border-radius: 10px;
  max-width: 92vw;
  max-height: 90vh;
  text-align: center;

  img {
    max-width: 100%;
    max-height: 60vh;
    border-radius: 8px;
    margin-top: 1rem;
  }
`;

const NoGym = styled.div`
  color: var(--text-tertiary);
  font-size: 1.01rem;
  text-align: center;
  margin: 1.2rem 0 1.5rem 0;
`;

const EditField = styled.input`
  width: 100%;
  font-size: 1.09rem;
  color: var(--text-primary);
  background: var(--bg-tertiary);
  border: 1.5px solid var(--border-medium);
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 10px;
  margin-top: 4px;
  transition: border 0.18s, background 0.18s;
  &:focus {
    border: 1.5px solid var(--primary-blue);
    background: var(--bg-secondary);
  }
  &::placeholder {
    color: var(--text-tertiary);
    opacity: 1;
  }
`;

const EditSelect = styled.select`
  width: 100%;
  font-size: 1.09rem;
  color: var(--text-primary);
  background: var(--bg-tertiary);
  border: 1.5px solid var(--border-medium);
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 10px;
  margin-top: 4px;
  transition: border 0.18s, background 0.18s;
  &:focus {
    border: 1.5px solid var(--primary-blue);
    background: var(--bg-secondary);
  }
`;

const EditLabel = styled.label`
  font-size: 1.05rem;
  color: var(--primary-blue-light);
  font-weight: 600;
  margin-bottom: 2px;
  display: block;
`;

const EditFileInput = styled.input`
  margin-top: 4px;
  margin-bottom: 10px;
  color: var(--text-primary);
  background: var(--bg-tertiary);
  border-radius: 8px;
  padding: 8px 0;
  &::file-selector-button {
    background: var(--primary-blue);
    color: #fff;
    border: none;
    border-radius: 6px;
    padding: 6px 14px;
    font-size: 1.01rem;
    cursor: pointer;
    margin-right: 10px;
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

  const normalizedImages = (trainer.images || []).map(img => {
  if (typeof img === 'object' && img.url) return img;  // 이미 url이 있으면 그대로
  return { id: img, url: null };  // attach_idx 문자열이라면 객체로 변환
});

  return (
    <>
      <Section>
        <SectionTitle>선생님 소개</SectionTitle>
        <TrainerIntroduce
          images={normalizedImages}
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
          <div style={{ marginTop: '13px' }}>
            <EditLabel>
              카테고리:
              <EditSelect
                value={newAward.category}
                onChange={(e) => handleAwardChange('category', e.target.value)}
              >
                <option value="">선택</option>
                <option value="자격증">자격증</option>
                <option value="학위">학위</option>
                <option value="수상경력">수상경력</option>
              </EditSelect>
            </EditLabel>
            <EditLabel>
              이름:
              <EditField
                type="text"
                value={newAward.name}
                onChange={(e) => handleAwardChange('name', e.target.value)}
                placeholder="자격/수상명 입력"
              />
            </EditLabel>
            <EditLabel>
              증명 이미지:
              <EditFileInput type="file" onChange={handleAwardFileChange} />
            </EditLabel>
            <MoreButton onClick={handleAwardSubmit}>+ 자격 사항 추가</MoreButton>
          </div>
        )}
      </Section>

      {selectedAward && (
        <ModalOverlay onClick={() => setSelectedAward(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <h4 style={{ color: 'var(--primary-blue)', fontWeight: 700 }}>{selectedAward.awards_name}</h4>
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

      <Section>
        <SectionTitle>레슨 가격</SectionTitle>
        <TrainerPriceList
          lessons={lessons || []}
          isEdit={isEdit}
          onLessonsChange={onLessonsChange}
          onChange={onChange}
        />
      </Section>

      <Section>
        <SectionTitle>위치</SectionTitle>
        {trainer.gymInfo !== null || isEdit ? (
          <TrainerMapContainer
            gymInfo={trainer.gymInfo}
            isEdit={isEdit}
            onChange={onChange}
          />
        ) : (
          <NoGym>등록된 체육관이 없습니다 !</NoGym>
        )}
      </Section>
    </>
  );
};

export default TrainerIntroSection;

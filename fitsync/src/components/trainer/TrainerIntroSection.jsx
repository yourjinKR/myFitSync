import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import TrainerIntroduce from './TrainerIntroduce';
import TrainerPriceList from './TrainerPriceList';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import TrainerMapContainer from './TrainerMapContainer';
import Review from '../review/Review';
import SchoolIcon from '@mui/icons-material/School';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'; // 수료증(자격증) 아이콘

// Styled Components
const Section = styled.section`
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid rgba(74, 144, 226, 0.1);
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
  
  @media (max-width: 768px) {
    padding: 20px;
    border-radius: 10px;
  }
`;

// SectionTitle과 내용 구분선
const SectionTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 20px;
  color: var(--text-primary);
  padding-bottom: 8px;
  border-bottom: 2px solid var(--primary-blue);
  
  @media (max-width: 768px) {
    font-size: 1.6rem;
    margin-bottom: 16px;
  }
`;

// 자격사항 아이콘
const AwardIconCircle = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: ${({ category }) =>
    category === '자격증' ? 'linear-gradient(135deg, #4A90E2, #6BA3E8)'
    : category === '학위' ? 'linear-gradient(135deg, #FFB800, #FFC842)'
    : 'linear-gradient(135deg, #A259FF, #B873FF)'};
  margin-right: 1.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  color: #fff;
  font-size: 2rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.25);
  }
  
  @media (max-width: 500px) {
    width: 3.5rem;
    height: 3.5rem;
    font-size: 1.8rem;
    margin-right: 1.2rem;
  }
`;

const CertList = styled.ul`
  list-style: none;
  padding: 0;
  font-size: 1.6rem;
  color: var(--text-primary);
  
  li {
    margin-bottom: 2rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    padding: 1.5rem;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 
      0 4px 16px rgba(0, 0, 0, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
    
    &:hover { 
      background: rgba(74, 144, 226, 0.08);
      transform: translateY(-2px);
      box-shadow: 
        0 8px 25px rgba(0, 0, 0, 0.12),
        inset 0 1px 0 rgba(255, 255, 255, 0.12);
    }
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  @media (max-width: 500px) {
    font-size: 1.4rem;
    
    li {
      padding: 1.2rem;
      margin-bottom: 1.5rem;
    }
  }
`;

const AwardName = styled.span`
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
  transition: color 0.3s ease;
  
  @media (max-width: 500px) {
    font-size: 1.4rem;
  }
`;

const InfoContent = styled.div`
  font-size: 1.6rem;
  color: var(--text-secondary);
  line-height: 1.7;
  white-space: pre-line;
  margin-bottom: 0.8rem;
  padding: 1.5rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  font-weight: 500;
  
  @media (max-width: 500px) {
    font-size: 1.4rem;
    padding: 1.2rem;
  }
`;

const MoreButton = styled.button`
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 1.4rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.8rem 0;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  transition: all 0.2s ease;
  
  &:hover {
    color: var(--primary-blue);
    
    .arrow-icon {
      transform: translateX(4px);
    }
  }
  
  .arrow-icon {
    font-size: 1.6rem;
    transition: transform 0.2s ease;
  }
`;

const MoreButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  padding: 2rem;
  box-sizing: border-box;
`;

const ModalContent = styled.div`
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  h4 {
    color: white;
    font-weight: 700;
    font-size: 2rem;
    margin-bottom: 2rem;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
    text-align: center;
  }

  img {
    max-width: 90vw;
    max-height: 80vh;
    object-fit: contain;
    border-radius: 0;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  }
`;

const CloseButton = styled.button`
  position: fixed;
  top: 30px;
  right: 30px;
  background: rgba(0, 0, 0, 0.7);
  border: none;
  border-radius: 50%;
  font-size: 2rem;
  width: 40px;
  height: 40px;
  cursor: pointer;
  font-weight: bold;
  z-index: 2001;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.9);
    transform: scale(1.1);
  }
  
  @media (max-width: 500px) {
    top: 20px;
    right: 20px;
    width: 35px;
    height: 35px;
    font-size: 1.8rem;
  }
`;

const NoDataMessage = styled.div`
  text-align: center;
  padding: 60px 32px;
  color: var(--text-secondary);
  font-size: 1.6rem;
  background: linear-gradient(145deg, var(--bg-tertiary) 0%, rgba(58, 58, 58, 0.8) 100%);
  border-radius: 16px;
  border: 2px dashed rgba(74, 144, 226, 0.3);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(5px);
  
  &::before {
    content: '🏆';
    display: block;
    font-size: 4rem;
    margin-bottom: 16px;
    opacity: 0.6;
    filter: drop-shadow(0 4px 8px rgba(74, 144, 226, 0.3));
  }
  
  span {
    position: relative;
    z-index: 1;
    display: block;
    margin-top: 8px;
    font-size: 1.2rem;
    color: var(--primary-blue-light);
    font-style: italic;
    opacity: 0.8;
  }
`;

const NoReviews = styled.div`
  text-align: center;
  padding: 60px 32px;
  color: var(--text-secondary);
  font-size: 1.6rem;
  background: linear-gradient(145deg, var(--bg-tertiary) 0%, rgba(58, 58, 58, 0.8) 100%);
  border-radius: 16px;
  border: 2px dashed rgba(74, 144, 226, 0.3);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(5px);
  
  &::before {
    content: '💭';
    display: block;
    font-size: 4rem;
    margin-bottom: 16px;
    opacity: 0.6;
    filter: drop-shadow(0 4px 8px rgba(74, 144, 226, 0.3));
  }
  
  span {
    position: relative;
    z-index: 1;
    display: block;
    margin-top: 8px;
    font-size: 1.2rem;
    color: var(--primary-blue-light);
    font-style: italic;
    opacity: 0.8;
  }
`;

const NoGym = styled.div`
  text-align: center;
  padding: 60px 32px;
  color: var(--text-secondary);
  font-size: 1.6rem;
  background: linear-gradient(145deg, var(--bg-tertiary) 0%, rgba(58, 58, 58, 0.8) 100%);
  border-radius: 16px;
  border: 2px dashed rgba(74, 144, 226, 0.3);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(5px);
  
  &::before {
    content: '🏋️';
    display: block;
    font-size: 4rem;
    margin-bottom: 16px;
    opacity: 0.6;
    filter: drop-shadow(0 4px 8px rgba(74, 144, 226, 0.3));
  }

  
  span {
    position: relative;
    z-index: 1;
    display: block;
    margin-top: 8px;
    font-size: 1.2rem;
    color: var(--primary-blue-light);
    font-style: italic;
    opacity: 0.8;
  }
`;

const EditField = styled.input`
  width: 100%;
  font-size: 1.4rem;
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.2rem 1.5rem;
  margin-bottom: 1.5rem;
  margin-top: 0.5rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(20px);
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  
  &:focus {
    outline: none;
    border-color: var(--primary-blue);
    box-shadow: 
      0 4px 16px rgba(0, 0, 0, 0.08),
      0 0 0 3px rgba(74, 144, 226, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.08);
  }
  
  &::placeholder {
    color: var(--text-tertiary);
    opacity: 1;
  }
`;

const EditSelect = styled.select`
  width: 100%;
  font-size: 1.4rem;
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.2rem 1.5rem;
  margin-bottom: 1.5rem;
  margin-top: 0.5rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(20px);
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  
  &:focus {
    outline: none;
    border-color: var(--primary-blue);
    box-shadow: 
      0 4px 16px rgba(0, 0, 0, 0.08),
      0 0 0 3px rgba(74, 144, 226, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.08);
  }
`;

const EditLabel = styled.label`
  font-size: 1.4rem;
  color: var(--primary-blue-light);
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: block;
  text-shadow: 0 1px 3px rgba(74, 144, 226, 0.1);
`;

const EditFileInput = styled.input`
  margin-top: 0.5rem;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem;
  width: 100%;
  backdrop-filter: blur(20px);
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  
  &::file-selector-button {
    background: linear-gradient(135deg, var(--primary-blue), var(--primary-blue-light));
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 0.8rem 1.6rem;
    font-size: 1.2rem;
    font-weight: 600;
    cursor: pointer;
    margin-right: 1.2rem;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(74, 144, 226, 0.2);
  }
  
  &::file-selector-button:hover {
    box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
    transform: translateY(-1px);
  }
`;

// 요일 버튼 스타일
const DayButton = styled.button`
  background: ${({ selected }) => 
    selected 
      ? 'linear-gradient(135deg, var(--primary-blue), var(--primary-blue-light))'
      : 'rgba(255, 255, 255, 0.05)'
  };
  color: ${({ selected }) => (selected ? '#fff' : 'var(--text-primary)')};
  border: 1px solid ${({ selected }) => 
    selected ? 'var(--primary-blue)' : 'rgba(255, 255, 255, 0.1)'
  };
  border-radius: 10px;
  padding: 1rem 1.6rem;
  margin-right: 1rem;
  margin-bottom: 1rem;
  font-size: 1.4rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(20px);
  box-shadow: ${({ selected }) =>
    selected 
      ? '0 4px 12px rgba(74, 144, 226, 0.3)'
      : '0 2px 8px rgba(0, 0, 0, 0.08)'
  };
  
  &:hover {
    background: ${({ selected }) => 
      selected 
        ? 'linear-gradient(135deg, var(--primary-blue-hover), var(--primary-blue))'
        : 'rgba(74, 144, 226, 0.1)'
    };
    color: ${({ selected }) => (selected ? '#fff' : 'var(--primary-blue)')};
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(74, 144, 226, 0.4);
  }
`;

// 시간 선택 셀렉트 스타일
const TimeSelect = styled.select`
  font-size: 1.4rem;
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem 1.5rem;
  margin-right: 1.2rem;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(20px);
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  
  &:focus {
    outline: none;
    border-color: var(--primary-blue);
    box-shadow: 
      0 4px 16px rgba(0, 0, 0, 0.08),
      0 0 0 3px rgba(74, 144, 226, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.08);
  }
`;

const TimeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
`;

const EditContainer = styled.div`
  padding-left: 25px;
  padding-right: 25px;
  @media (max-width: 500px) {
    padding-left: 12px;
    padding-right: 12px;
  }
`;

const TimeLabel = styled.div`
  margin-bottom: 12px;
  font-weight: 700;
  color: white;
  font-size: 1.5rem;
  padding-left: 25px;
  padding-right: 25px;
  @media (max-width: 500px) {
    padding-left: 12px;
    padding-right: 12px;
    font-size: 1.3rem;
  }
`;

const daysKor = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'];

// 시간 옵션 생성 함수 (중복 제거)
const getTimeOptions = () => {
  const options = [];
  for (let h = 6; h <= 23; h++) {
    const label = `${h.toString().padStart(2, '0')}:00`;
    options.push(label);
  }
  return options;
};
const timeOptions = getTimeOptions();

const TrainerIntroSection = ({ trainer, onMoreClick, isEdit, onChange, lessons, onLessonsChange, onTimeChange }) => {
  const { trainerIdx } = useParams();
  const [awards, setAwards] = useState([]);
  const [selectedAward, setSelectedAward] = useState(null);
  const [newAward, setNewAward] = useState({ category: '', name: '', file: null });
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchAwards = async () => {
      try {
        const res = await axios.get(`/trainer/awards/${trainerIdx}`);
        setAwards(res.data);
      } catch (err) {
        console.error('Failed to fetch awards:', err);
      }
    };
    
    const fetchReviews = async () => {
      try {
        const res = await axios.get(`/trainer/reviews/${trainerIdx}`);
        const reviewData = Array.isArray(res.data) ? res.data : [];
        setReviews(reviewData);
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
      }
    };
    
    if (trainerIdx) {
      fetchAwards();
      fetchReviews();
    }
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
    if (typeof img === 'object' && img.url) return img;
    return { id: img, url: null };
  });

  const [selectedDays, setSelectedDays] = useState(() =>
    trainer.member_day ? trainer.member_day.split(',').map(d => d.trim()) : []
  );
  const [startTime, setStartTime] = useState(() =>
    trainer.member_time ? trainer.member_time.split('~')[0]?.trim() : ''
  );
  const [endTime, setEndTime] = useState(() =>
    trainer.member_time ? trainer.member_time.split('~')[1]?.trim() : ''
  );

  useEffect(() => {
    if (isEdit) {
      setSelectedDays(trainer.member_day ? trainer.member_day.split(',').map(d => d.trim()) : []);
      setStartTime(trainer.member_time ? trainer.member_time.split('~')[0]?.trim() : '');
      setEndTime(trainer.member_time ? trainer.member_time.split('~')[1]?.trim() : '');
    }
  }, [isEdit, trainer.member_day, trainer.member_time]);

  const handleDayClick = (day) => {
    let newDays;
    if (selectedDays.includes(day)) {
      newDays = selectedDays.filter(d => d !== day);
    } else {
      newDays = [...selectedDays, day];
    }
    setSelectedDays(newDays);
    onChange('member_day', newDays.join(','));
  };

  const handleTimeChange = (type, value) => {
    if (type === 'start') {
      const newStart = value;
      setStartTime(newStart);
      if (onTimeChange) onTimeChange(newStart, endTime);
    } else {
      const newEnd = value;
      setEndTime(newEnd);
      if (onTimeChange) onTimeChange(startTime, newEnd);
    }
  };

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
        {awards.length === 0 ? (
          <NoDataMessage>
            데이터가 없습니다
            <span>자격증이나 수상경력을 추가해보세요!</span>
          </NoDataMessage>
        ) : (
          <CertList>
            {awards.map((a, i) => (
              <li key={i} onClick={() => setSelectedAward(a)}>
                <AwardIconCircle category={a.awards_category}>
                  {a.awards_category === '자격증' && <WorkspacePremiumIcon style={{ fontSize: '3.5rem' }}/>}
                  {a.awards_category === '학위' && <SchoolIcon style={{ fontSize: '3.5rem' }}/>}
                  {a.awards_category === '수상경력' && <EmojiEventsIcon style={{ fontSize: '3.5rem' }} />}
                </AwardIconCircle>
                <AwardName>{a.awards_name}</AwardName>
              </li>
            ))}
          </CertList>
        )}

        {isEdit && (
          <EditContainer style={{ marginTop: '13px' }}>
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
          </EditContainer>
        )}
      </Section>

      {selectedAward && (
        <ModalOverlay onClick={() => setSelectedAward(null)}>
          <CloseButton onClick={() => setSelectedAward(null)} aria-label="닫기">&times;</CloseButton>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <img src={selectedAward.awards_certificate} alt={`${selectedAward.awards_name} 증명서`} />
          </ModalContent>
        </ModalOverlay>
      )}

      <Section>
        <SectionTitle>레슨 스케줄</SectionTitle>
        {isEdit ? (
          <>
            <TimeLabel>가능 요일</TimeLabel>
            <TimeRow>
              {daysKor.map((day) => (
                <DayButton
                  key={day}
                  type="button"
                  selected={selectedDays.includes(day)}
                  onClick={() => handleDayClick(day)}
                >
                  {day}
                </DayButton>
              ))}
            </TimeRow>
            <TimeLabel>가능 시간</TimeLabel>
            <TimeRow>
              <TimeSelect
                value={startTime}
                onChange={e => handleTimeChange('start', e.target.value)}
              >
                <option value="">시작 시간</option>
                {timeOptions.map(opt => (
                  <option key={`start-${opt}`} value={opt}>{opt}</option>
                ))}
              </TimeSelect>
              ~
              <TimeSelect
                value={endTime}
                onChange={e => handleTimeChange('end', e.target.value)}
              >
                <option value="">종료 시간</option>
                {timeOptions.map(opt => (
                  <option key={`end-${opt}`} value={opt}>{opt}</option>
                ))}
              </TimeSelect>
            </TimeRow>
          </>
        ) : (
          <InfoContent>
            {trainer.member_day && trainer.member_time
              ? `${trainer.member_day} / ${trainer.member_time}`
              : trainer.availableTime || '정보 없음'}
          </InfoContent>
        )}
      </Section>

      <Section>
        <SectionTitle>최근 후기</SectionTitle>
        {reviews && reviews.length > 0 ? (
          <>
            {reviews
              ?.sort((a, b) => b.matching_idx - a.matching_idx)
              .slice(0, 2)
              .map((review) => (
                <Review key={review.matching_idx} review={review} />
            ))}
            <MoreButtonContainer>
              <MoreButton onClick={onMoreClick}>
                더보기
                <span className="arrow-icon">↗</span>
              </MoreButton>
            </MoreButtonContainer>
          </>
        ) : (
          <NoReviews>
            작성된 후기가 없습니다
            <span>첫 번째 후기를 기다리고 있어요!</span>
          </NoReviews>
        )}
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
          <NoGym>
            등록된 체육관이 없습니다
            <span>체육관 정보를 등록해보세요!</span>
          </NoGym>
        )}
      </Section>
    </>
  );
};

export default TrainerIntroSection;

import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

const WorkoutView = ({ ptId: propPtId, isModal = false, onClose }) => {
  const routePtId = useParams().ptId;
  const navigate = useNavigate();
  const ptId = propPtId || routePtId;

  const [workout, setWorkout] = useState(null);
  const [recommend, setRecommend] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        const response = await axios.get(`/routine/pt/${ptId}`);
        const { pt, randomPt } = response.data;

        const [pt_image_png, pt_image_gif] = pt.pt_image.split(',');
        const workoutData = { ...pt, pt_image_png, pt_image_gif };

        const [rec_png, rec_gif] = randomPt?.pt_image?.split(',') || [];
        const recommendData = randomPt ? { ...randomPt, pt_image_png: rec_png, pt_image_gif: rec_gif } : null;

        setWorkout(workoutData);
        setRecommend(recommendData);
      } catch (err) {
        console.error(err);
        setError(true);
      }
    };
    fetchWorkout();
  }, [ptId]);

  // 스크롤 초기화는 페이지 전용일 때만
  useEffect(() => {
    if (workout && !isModal) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [workout, isModal]);

  if (error) return <Wrapper>운동 정보를 불러오는 데 실패했습니다.</Wrapper>;
  if (!workout) return <Wrapper />;

  const contentSteps = workout.pt_content?.split('|').map(step => step.trim()) || [];

  const Content = (
    <Wrapper>
      {workout.pt_hidden === 1 && (
        <HiddenBox>이 운동은 현재 비공개 상태입니다.</HiddenBox>
      )}

      {isModal && <CloseButton onClick={onClose}>×</CloseButton>}

      <Title>{workout.pt_name}</Title>
      <Category>{workout.pt_category}</Category>

      <ImageSection>
        {workout.pt_image_gif && <img src={workout.pt_image_gif} alt="운동 동작" />}
      </ImageSection>

      <Section>
        <SectionTitle>운동 설명</SectionTitle>
        <StepList>
          {contentSteps.map((step, idx) => (
            <li key={idx}>{step}</li>
          ))}
        </StepList>
      </Section>

      {workout.pt_writer && (
        <Writer>작성자: {workout.pt_writer}</Writer>
      )}

      {!isModal && recommend && (
        <RecommendSection>
          <RecommendTitle>이런 운동은 어떠세요?</RecommendTitle>
          <RecommendCard onClick={() => {
            navigate(`/workout/${recommend.pt_idx}`);
          }}>
            <img src={recommend.pt_image_png} alt={recommend.pt_name} />
            <div>
              <h4>{recommend.pt_name}</h4>
              <p>{recommend.pt_category}</p>
            </div>
          </RecommendCard>
        </RecommendSection>
      )}
    </Wrapper>
  );

  return isModal ? (
    <FullscreenOverlay onClick={onClose}>
      <FullscreenContent onClick={(e) => e.stopPropagation()}>
        {Content}
      </FullscreenContent>
    </FullscreenOverlay>
  ) : Content;
};

export default WorkoutView;


const Wrapper = styled.div`
  position : fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  overflow-y: auto;
  background: var(--bg-primary);
  max-width: 900px;
  margin: 0 auto;
  padding: 4rem 2rem;
  color: var(--text-primary);
`;

const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
  font-weight: 700;
  line-height: 1.2;
`;

const Category = styled.p`
  font-size: 1.6rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  opacity: 0.8;
`;

const ImageSection = styled.div`
  margin-bottom: 3rem;
  position: relative;
  width: 100%;
  max-width: 502px;
  aspect-ratio: 1 / 1;
  background-color: var(--bg-tertiary);
  border: 2px solid var(--border-light);
  border-radius: 12px;
  overflow: hidden;
  margin-right: auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;

  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: 10px;
  }

  @media (max-width: 540px) {
    max-width: 90vw;
  }
`;

const Section = styled.section`
  margin-top: 2rem;
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 2.2rem;
  margin-bottom: 1.5rem;
  color: var(--primary-blue);
  font-weight: 700;
`;

const StepList = styled.ul`
  list-style: decimal;
  padding-left: 2rem;
  
  li {
    font-size: 1.6rem;
    line-height: 1.6;
    margin-bottom: 1rem;
    color: var(--text-primary);
  }
`;

const Writer = styled.p`
  margin-top: 30px;
  font-size: 1.4rem;
  color: var(--text-tertiary);
`;

const HiddenBox = styled.div`
  padding: 12px;
  margin-bottom: 20px;
  border-left: 5px solid var(--warning);
  background-color: rgba(244, 67, 54, 0.1);
  color: var(--warning);
  font-size: 1.4rem;
`;

const RecommendSection = styled.div`
  margin-top: 60px;
`;

const RecommendTitle = styled.h3`
  font-size: 2rem;
  margin-bottom: 16px;
  color: var(--primary-blue);
`;

const RecommendCard = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;
  padding: 2rem;
  background-color: var(--bg-secondary);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid var(--border-light);

  img {
    width: 12rem;
    height: auto;
    border-radius: 12px;
    background-color: var(--bg-white);
    border: 1px solid var(--border-light);
  }

  div {
    h4 {
      font-size: 1.8rem;
      margin-bottom: 0.6rem;
      color: var(--text-primary);
      font-weight: 700;
    }
    
    p {
      font-size: 1.4rem;
      color: var(--text-secondary);
      opacity: 0.8;
    }
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 20px;
  font-size: 2.4rem;
  color: var(--text-secondary);
  z-index: 10;

  @media (max-width: 768px) {
    top: 12px;
    right: 16px;
    font-size: 2rem;
  }
`;

const FullscreenOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  max-width: 750px;
  height: 100vh;
  margin: 0 auto;
  background-color: var(--bg-primary);
  z-index: 3000;
  overflow-y: auto;
  display: flex;
  flex-direction: column;

  @media (min-width: 750px) {
    left: 50%;
    transform: translateX(-50%);
  }
`;

const FullscreenContent = styled.div`
  flex: 1;
  background: var(--bg-primary);
  color: var(--text-primary);
`;
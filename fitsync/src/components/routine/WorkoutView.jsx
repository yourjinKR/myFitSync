import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import styled from 'styled-components';

const WorkoutView = () => {
  const { ptId } = useParams();
  const [workout, setWorkout] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        const response = await axios.get(`/routine/pt/${ptId}`);
        const [pt_image_png, pt_image_gif] = response.data.pt_image.split(',');
        const workoutData = { ...response.data, pt_image_png, pt_image_gif };
        setWorkout(workoutData);
      } catch (err) {
        console.error(err);
        setError(true);
      }
    };
    fetchWorkout();
  }, [ptId]);

  if (error) return <Wrapper>운동 정보를 불러오는 데 실패했습니다.</Wrapper>;
  if (!workout) return <Wrapper>불러오는 중...</Wrapper>;

  const contentSteps = workout.pt_content?.split('|').map(step => step.trim()) || [];

  return (
    <Wrapper>
      {workout.pt_hidden === 1 && (
        <HiddenBox>이 운동은 현재 비공개 상태입니다.</HiddenBox>
      )}

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
    </Wrapper>
  );
};

export default WorkoutView;


const Wrapper = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
  background-color: var(--bg-secondary);
  border-radius: 12px;
`;

const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 10px;
  color: var(--text-primary);
`;

const Category = styled.p`
  font-size: 1.6rem;
  color: var(--text-secondary);
  margin-bottom: 20px;
`;

const ImageSection = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 30px;

  img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-light);
  }
`;

const Section = styled.section`
  margin-top: 20px;
`;

const SectionTitle = styled.h2`
  font-size: 2.2rem;
  margin-bottom: 15px;
  color: var(--primary-blue);
`;

const StepList = styled.ul`
  list-style: decimal;
  padding-left: 20px;

  li {
    font-size: 1.6rem;
    line-height: 1.6;
    margin-bottom: 10px;
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

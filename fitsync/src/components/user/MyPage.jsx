import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import BodyComparisonChart from './BodyComparisonChart';
import Routine from '../routine/Routine';
import axios from 'axios';
import LatestBodyInfo from './LatestBodyInfo';
import TrainerProfileHeader from '../trainer/TrainerProfileHeader';
import { useSelector } from 'react-redux';
import { PrimaryButton, SecondaryButton, ButtonGroup } from '../../styles/commonStyle';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  background: var(--bg-primary);
  min-height: 100vh;

  @media (max-width: 768px) {
    padding: 16px;
    gap: 20px;
  }
`;

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

const RoutineSection = styled.section`
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

const LoadingMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: var(--text-secondary);
  font-size: 1.4rem;
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: var(--warning);
  font-size: 1.4rem;
`;

const EmptyMessage = styled.div`
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
    content: '💪';
    display: block;
    font-size: 4rem;
    margin-bottom: 16px;
    opacity: 0.6;
    filter: drop-shadow(0 4px 8px rgba(74, 144, 226, 0.3));
  }
  
  &::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: conic-gradient(
      from 0deg,
      transparent 0deg,
      rgba(74, 144, 226, 0.1) 60deg,
      transparent 120deg
    );
    animation: rotate 8s linear infinite;
    pointer-events: none;
  }
  
  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
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

const RoutineListWrapper = styled.div`
  position: relative;
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  
  @media (max-width: 650px) {
    gap: 1rem;
  }
  
`;

const ShowMoreButton = styled.button`
  width: 100%;
  padding: 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 1.4rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--bg-secondary);
    color: var(--text-primary);
    border-color: var(--primary-blue);
  }
`;

const MyPage = () => {
  const { user: loginUser } = useSelector((state) => state.user); // Redux에서 유저 정보 가져옴
  const [user, setUser] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [routineList, setRoutineList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartKey, setChartKey] = useState(0);
  const [showAllRoutines, setShowAllRoutines] = useState(false);

  useEffect(() => {
    if (loginUser) {
      setUser(loginUser); // 로그인된 유저 정보를 세팅
    }
    handleRoutineResponse();
  }, [loginUser]);

  const handleRoutineResponse = async () => {
    try {
      const response = await axios.get("/routine/getList", { withCredentials: true });
      const vo = response.data.vo;
      setRoutineList(vo ?? []);
    } catch (error) {
      console.error('루틴 데이터 불러오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

    useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('/user/profile', { withCredentials: true });
        setUser(res.data);
        
      } catch (error) {
        console.error('유저 정보 불러오기 실패', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const onEditToggle = () => setIsEdit((prev) => !prev);

  const onChange = (field, value) => {
    setUser((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageChange = (newImageUrl) => {
  setUser((prev) => ({
    ...prev,
    member_image: newImageUrl,
  }));
};


  const handleBodyUpdate = () => setChartKey((prev) => prev + 1);

  if (loading || !user) return (
    <Container>
      <LoadingMessage>로딩중...</LoadingMessage>
    </Container>
  );
  
  if (!user) return (
    <Container>
      <ErrorMessage>유저 정보를 불러올 수 없습니다.</ErrorMessage>
    </Container>
  );

  return (
    <Container>
      <TrainerProfileHeader
        trainer={user}
        mode="user"
        isEdit={isEdit}
        onEditToggle={onEditToggle}
        onChange={onChange}
        loginUserId={loginUser?.member_email}
        onImageChange={handleImageChange}
      />
      <Section>
        <SectionTitle>최근 인바디 정보</SectionTitle>
        <LatestBodyInfo onUpdate={handleBodyUpdate} />
      </Section>
      <Section>
        <SectionTitle>인바디 변화 그래프</SectionTitle>
        <BodyComparisonChart key={chartKey} />
      </Section>
      <RoutineSection>
        <SectionTitle>내 루틴</SectionTitle>
        <RoutineListWrapper>
          {routineList.length > 0 ? (
            <>
                {(showAllRoutines ? routineList : routineList.slice(0, 4)).map((routineItem) => (
                  <Routine 
                    data={routineItem} 
                    key={routineItem.routine_list_idx}
                    onDelete={handleRoutineResponse}
                  />
                ))}
              {routineList.length > 4 && (
                <ShowMoreButton onClick={() => setShowAllRoutines(!showAllRoutines)}>
                  {showAllRoutines ? '접기' : `더보기 (${routineList.length - 4}개 더)`}
                </ShowMoreButton>
              )}
            </>
          ) : (
            <EmptyMessage>
              등록된 루틴이 없습니다
              <span>새로운 루틴을 추가해보세요!</span>
            </EmptyMessage>
          )}
        </RoutineListWrapper>
      </RoutineSection>
    </Container>
  );
};

export default MyPage;

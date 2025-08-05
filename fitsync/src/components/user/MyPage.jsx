import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import BodyComparisonChart from './BodyComparisonChart';
import TrainerCalendarView from '../trainer/TrainerCalendarView';
import Routine from '../routine/Routine';
import axios from 'axios';
import LatestBodyInfo from './LatestBodyInfo';
import TrainerProfileHeader from '../trainer/TrainerProfileHeader';
import { useSelector } from 'react-redux';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 16px;
  max-width: 100%;
`;

const Section = styled.section`
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 16px;
  overflow-x: auto;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: #222;
`;

const MyPage = () => {
  const { user: loginUser } = useSelector((state) => state.user); // Redux에서 유저 정보 가져옴
  const [user, setUser] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [routineList, setRoutineList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartKey, setChartKey] = useState(0);

  useEffect(() => {
    if (loginUser) {
      setUser(loginUser); // 로그인된 유저 정보를 세팅
    }
    handleRoutineResponse();
  }, []);

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

  if (loading || !user) return <div>로딩중...</div>;
  if (!user) return <div>유저 정보를 불러올 수 없습니다.</div>;

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
      <Section>
        <SectionTitle>내 루틴</SectionTitle>
        {routineList.length > 0 ? (
          <div
            style={{
              overflowX: routineList.length >= 3 ? 'auto' : 'visible',
              paddingBottom: routineList.length >= 3 ? '8px' : '0',
            }}
          >
            {routineList.map((routineItem) => (
              <div
                key={routineItem.routine_list_idx}
                style={{ flexShrink: 0 }}
              >
                <Routine data={routineItem} />
              </div>
            ))}
          </div>
        ) : (
          <div>등록된 루틴이 없습니다.</div>
        )}
      </Section>
    </Container>
  );
};

export default MyPage;

// MyPage.jsx
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import BodyComparisonChart from './BodyComparisonChart';
import TrainerCalendarView from '../trainer/TrainerCalendarView';
import Routine from '../routine/Routine';
import axios from 'axios';


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
    const [routineList, setRoutineList] = useState([]);
    const [loading, setLoading] = useState(true);

    // API에서 데이터 받아오는 함수
    const handleRoutineResponse = async () => {
      try {
        const response = await axios.get("/routine/getList", { withCredentials: true });
        const data = response.data;
        const vo = data.vo;

        if (vo !== undefined && vo.length !== 0) {
          vo.forEach((item) => {
            // 필요한 가공이 있으면 여기서
          });
        }
        setRoutineList(vo);
      } catch (error) {
        console.error('루틴 데이터 불러오기 실패:', error);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    handleRoutineResponse();
  }, []);

  if (loading) return <div>로딩중...</div>;
  
  return (
    <Container>
      <Section>
        <SectionTitle>운동 캘린더</SectionTitle>
        <TrainerCalendarView />
      </Section>
      <Section>
        <SectionTitle>인바디 변화 그래프</SectionTitle>
        <BodyComparisonChart />
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
                style={{
                  flexShrink: 0,
                }}
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

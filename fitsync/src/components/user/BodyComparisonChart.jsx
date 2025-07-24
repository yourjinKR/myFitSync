import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Legend,
  Tooltip
} from 'chart.js';
import axios from 'axios';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import BodyInputForm from './BodyInputForm';

ChartJS.register(LineElement, PointElement, LinearScale, Title, CategoryScale, Legend, Tooltip);

const Container = styled.div`
  padding: 2.4rem 1.2rem;
  background: linear-gradient(120deg, #fafdff 70%, var(--bg-secondary) 100%);
  border-radius: 1.4rem;
  box-shadow: 0 0.2rem 1.2rem rgba(0,0,0,0.10);
  max-width: 760px;
  margin: 0 auto;
  min-height: 480px;
`;

const ChartTitle = styled.h2`
  color: var(--primary-blue);
  font-size: 2.1rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin-bottom: 2.2rem;
  text-align: center;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 70px 16px;
  font-size: 1.18rem;
  color: var(--primary-blue);
  background: linear-gradient(120deg, #fafdff 70%, var(--bg-tertiary) 100%);
  border-radius: 1.2rem;
  max-width: 420px;
  margin: 0 auto;

  strong {
    font-weight: 700;
  }
`;

const StyledButton = styled.button`
  margin-top: 2.2rem;
  padding: 1.1rem 2.2rem;
  background: linear-gradient(90deg, var(--primary-blue) 60%, var(--primary-blue-light) 100%);
  color: var(--text-primary);
  border-radius: 0.9rem;
  font-size: 1.18rem;
  font-weight: 700;
  border: none;
  cursor: pointer;

  &:hover {
    background: var(--primary-blue-hover);
    color: var(--bg-primary);
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.55);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3000;
`;

const ModalContent = styled.div`
  background: var(--bg-secondary);
  padding: 2.2rem 1.2rem;
  border-radius: 1.2rem;
  max-width: 440px;
  width: 96vw;
`;

const chartColors = {
  weight: '#1976d2',
  muscle: '#43a047',
  fat: '#ff9800',
  fatPercent: '#d500f9',
  bmi: '#0091ea',
};

const BodyComparisonChart = () => {
  const [bodyData, setBodyData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const { member_idx } = useSelector((state) => state.user.user);

  const fetchData = () => {
    axios.get(`/user/body/${member_idx}`)
      .then(res => setBodyData(res.data))
      .catch(err => console.error('📉 인바디 데이터 불러오기 실패:', err));
  };

  useEffect(() => {
    if (member_idx) fetchData();
  }, [member_idx]);

  const sortedData = [...bodyData].sort(
    (a, b) => new Date(a.body_regdate) - new Date(b.body_regdate)
  );

  const labels = sortedData.map(d => new Date(d.body_regdate).toLocaleDateString());
  const data = {
    labels,
    datasets: [
      {
        label: '몸무게 (kg)',
        data: sortedData.map(d => d.body_weight),
        borderColor: chartColors.weight,
        yAxisID: 'yWeight',
      },
      {
        label: '골격근량 (kg)',
        data: sortedData.map(d => d.body_skeletal_muscle),
        borderColor: chartColors.muscle,
        yAxisID: 'yMuscle',
      },
      {
        label: '체지방량 (kg)',
        data: sortedData.map(d => d.body_fat),
        borderColor: chartColors.fat,
        yAxisID: 'yFat',
      },
      {
        label: '체지방률 (%)',
        data: sortedData.map(d => d.body_fat_percentage),
        borderColor: chartColors.fatPercent,
        yAxisID: 'yFatPercent',
      },
      {
        label: 'BMI',
        data: sortedData.map(d => d.body_bmi),
        borderColor: chartColors.bmi,
        yAxisID: 'yBMI',
      },
    ]
  };

  const options = {
    responsive: true,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'top' },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        ticks: { color: '#444' },
        grid: { color: '#eee' },
      },
      yWeight: {
        type: 'linear',
        position: 'left',
        title: { display: true, text: '몸무게' },
        grid: { drawOnChartArea: false },
      },
      yMuscle: {
        type: 'linear',
        position: 'right',
        title: { display: true, text: '골격근량' },
        grid: { drawOnChartArea: false },
      },
      yFat: {
        type: 'linear',
        position: 'right',
        title: { display: true, text: '체지방량' },
        offset: true,
        grid: { drawOnChartArea: false },
      },
      yFatPercent: {
        type: 'linear',
        position: 'right',
        title: { display: true, text: '체지방률' },
        offset: true,
        grid: { drawOnChartArea: false },
      },
      yBMI: {
        type: 'linear',
        position: 'right',
        title: { display: true, text: 'BMI' },
        offset: true,
        grid: { drawOnChartArea: false },
      },
    }
  };

  const hasIncompleteData = bodyData.some(
    d => !d.body_weight || !d.body_skeletal_muscle || !d.body_fat || !d.body_fat_percentage || !d.body_bmi
  );

  if (!bodyData || bodyData.length === 0) {
    return (
      <EmptyState>
        아직 인바디 데이터가 없어요. <br />
        인바디를 측정해서 기입하면 <strong>몸무게, 골격근량, 체지방률 등의 변화를</strong> 차트로 확인할 수 있어요!
        <br />
        <StyledButton onClick={() => setShowModal(true)}>정보 입력</StyledButton>
        {showModal && (
          <ModalOverlay onClick={() => setShowModal(false)}>
            <ModalContent onClick={e => e.stopPropagation()}>
              <BodyInputForm onSuccess={() => {
                setShowModal(false);
                fetchData();
              }} />
            </ModalContent>
          </ModalOverlay>
        )}
      </EmptyState>
    );
  }

  return (
    <Container>
      <ChartTitle>체성분 변화 차트</ChartTitle>
      <Line data={data} options={options} />
      {hasIncompleteData && (
        <StyledButton onClick={() => setShowModal(true)}>정보 추가하기</StyledButton>
      )}
      {showModal && (
        <ModalOverlay onClick={() => setShowModal(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <BodyInputForm onSuccess={() => {
              setShowModal(false);
              fetchData();
            }} />
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default BodyComparisonChart;

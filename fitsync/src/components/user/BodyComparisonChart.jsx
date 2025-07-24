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

// 스타일 정의
const Container = styled.div`
  padding: 2.4rem 1.2rem;
  background: #fff;
  border-radius: 1.4rem;
  box-shadow: 0 0 14px rgba(0, 0, 0, 0.06);
  max-width: 860px;
  margin: 0 auto;
  min-height: 520px;
`;

const ChartTitle = styled.h2`
  color: #222;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  text-align: center;
`;

const ToggleWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-bottom: 1.5rem;
`;

const ToggleButton = styled.button`
  padding: 0.6rem 1.2rem;
  border-radius: 20px;
  background: ${({ active }) => (active ? '#1976d2' : '#eee')};
  color: ${({ active }) => (active ? '#fff' : '#444')};
  border: none;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: ${({ active }) => (active ? '#1565c0' : '#ddd')};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 70px 20px;
  font-size: 1.15rem;
  color: #333;
  background: #f8f9fa;
  border-radius: 1.2rem;
  max-width: 480px;
  margin: 0 auto;

  strong {
    font-weight: 700;
  }
`;

const StyledButton = styled.button`
  margin-top: 2rem;
  padding: 1rem 2rem;
  background: #1976d2;
  color: #fff;
  border-radius: 0.8rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  cursor: pointer;

  &:hover {
    background: #145ea8;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
`;

const ModalContent = styled.div`
  background: #fff;
  padding: 2rem 1.5rem;
  border-radius: 1rem;
  max-width: 480px;
  width: 95vw;
`;

// 색상 정의
const chartColors = {
  weight: '#1976d2',
  muscle: '#43a047',
  fat: '#ff9800',
  fatPercent: '#d500f9',
  bmi: '#0091ea',
};

// 본체 컴포넌트
const BodyComparisonChart = () => {
  const [bodyData, setBodyData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [activeMetrics, setActiveMetrics] = useState(['weight', 'muscle', 'fat', 'fatPercent', 'bmi']);
  const { member_idx } = useSelector((state) => state.user.user);

  const fetchData = () => {
    axios.get(`/user/body/${member_idx}`)
      .then(res => setBodyData(res.data))
      .catch(err => console.error('📉 인바디 데이터 불러오기 실패:', err));
  };

  useEffect(() => {
    if (member_idx) fetchData();
  }, [member_idx]);

  const toggleMetric = (metric) => {
    setActiveMetrics(prev =>
      prev.includes(metric) ? prev.filter(m => m !== metric) : [...prev, metric]
    );
  };

  const sortedData = [...bodyData].sort(
    (a, b) => new Date(a.body_regdate) - new Date(b.body_regdate)
  );

  const labels = sortedData.map(d =>
    new Date(d.body_regdate).toLocaleDateString('ko-KR', {
      year: '2-digit', month: '2-digit', day: '2-digit'
    })
  );

  const datasetsConfig = {
    weight: {
      label: '몸무게 (kg)',
      data: sortedData.map(d => d.body_weight),
      borderColor: chartColors.weight,
      yAxisID: 'yWeight',
    },
    muscle: {
      label: '골격근량 (kg)',
      data: sortedData.map(d => d.body_skeletal_muscle),
      borderColor: chartColors.muscle,
      yAxisID: 'yMuscle',
    },
    fat: {
      label: '체지방량 (kg)',
      data: sortedData.map(d => d.body_fat),
      borderColor: chartColors.fat,
      yAxisID: 'yFat',
    },
    fatPercent: {
      label: '체지방률 (%)',
      data: sortedData.map(d => d.body_fat_percentage),
      borderColor: chartColors.fatPercent,
      yAxisID: 'yFatPercent',
    },
    bmi: {
      label: 'BMI',
      data: sortedData.map(d => d.body_bmi),
      borderColor: chartColors.bmi,
      yAxisID: 'yBMI',
    },
  };

  const data = {
    labels,
    datasets: activeMetrics.map(metric => ({
      ...datasetsConfig[metric],
      tension: 0.3,
    }))
  };

  const options = {
    responsive: true,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'top', labels: { font: { size: 14 } } },
      tooltip: {
        callbacks: {
          label: ctx => `${ctx.dataset.label}: ${ctx.formattedValue}`
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#555' },
        grid: { color: '#e0e0e0' }
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
        offset: true,
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
        <strong>첫 인바디 정보를 입력하고</strong> 그래프를 시작해보세요!
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

      <ToggleWrapper>
        {Object.keys(datasetsConfig).map(metric => (
          <ToggleButton
            key={metric}
            active={activeMetrics.includes(metric)}
            onClick={() => toggleMetric(metric)}
          >
            {datasetsConfig[metric].label}
          </ToggleButton>
        ))}
      </ToggleWrapper>

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

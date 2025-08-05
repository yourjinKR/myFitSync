import React, { useEffect, useState, useCallback } from 'react';
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
import { PrimaryButton, ButtonGroup } from '../../styles/commonStyle';

ChartJS.register(LineElement, PointElement, LinearScale, Title, CategoryScale, Legend, Tooltip);

// 스타일 정의
const ToggleWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
`;

const ToggleButton = styled.button`
  padding: 8px 16px;
  border-radius: 8px;
  background: ${({ active }) => (active ? 'var(--primary-blue)' : 'var(--bg-tertiary)')};
  color: ${({ active }) => (active ? 'white' : 'var(--text-secondary)')};
  border: 1px solid ${({ active }) => (active ? 'var(--primary-blue)' : 'var(--border-light)')};
  font-weight: 500;
  font-size: 1.4rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ active }) => (active ? 'var(--primary-blue-light)' : 'var(--bg-secondary)')};
    color: ${({ active }) => (active ? 'white' : 'var(--text-primary)')};
    transform: translateY(-1px);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  font-size: 1.4rem;
  color: var(--text-secondary);
  background: var(--bg-tertiary);
  border-radius: 8px;
  border: 1px solid var(--border-light);

  strong {
    color: var(--text-primary);
    font-weight: 600;
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
  background: var(--bg-secondary);
  padding: 20px;
  border-radius: 12px;
  max-width: 480px;
  width: 95vw;
  border: 1px solid var(--border-light);
`;

const chartColors = {
  weight: '#4A90E2',      // 파란색 (Primary Blue)
  muscle: '#43A047',      // 초록색 
  fat: '#FF9800',         // 주황색
  fatPercent: '#E91E63',  // 핑크색
  bmi: '#00BCD4',         // 청록색
};

const BodyComparisonChart = () => {
  const [bodyData, setBodyData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('weight');
  const { member_idx } = useSelector((state) => state.user.user);

  const fetchData = useCallback(() => {
    axios.get(`/user/body/${member_idx}`)
      .then(res => setBodyData(res.data))
      .catch(err => console.error('📉 인바디 데이터 불러오기 실패:', err));
  }, [member_idx]);

  useEffect(() => {
    if (member_idx) fetchData();
  }, [member_idx, fetchData]);

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
    datasets: [{
      ...datasetsConfig[selectedMetric],
      tension: 0.3,
      borderWidth: 3,
      pointRadius: 5,
      pointHoverRadius: 7,
      pointBackgroundColor: datasetsConfig[selectedMetric].borderColor,
      pointBorderColor: '#2a2a2a',  // 다크 배경색으로 명시
      pointBorderWidth: 2,
      pointHoverBackgroundColor: datasetsConfig[selectedMetric].borderColor,
      pointHoverBorderColor: '#ffffff',  // 흰색으로 명시
      pointHoverBorderWidth: 2,
      fill: false
    }]
  };

  const generateScales = (metric) => {
    return {
      x: {
        ticks: { 
          color: '#ffffff',  // 흰색으로 명시
          font: { size: 12 }
        },
        grid: { 
          color: '#404040',  // 회색으로 명시
          borderColor: '#404040'
        },
        border: {
          color: '#404040'
        }
      },
      [datasetsConfig[metric].yAxisID]: {
        type: 'linear',
        position: 'left',
        title: { 
          display: true, 
          text: datasetsConfig[metric].label,
          color: '#ffffff',  // 흰색으로 명시
          font: { size: 14 }
        },
        ticks: {
          color: '#ffffff',  // 흰색으로 명시
          font: { size: 12 }
        },
        grid: { 
          drawOnChartArea: true,
          color: '#404040'  // 회색으로 명시
        },
        border: {
          color: '#404040'
        }
      }
    };
  };

  const options = {
    responsive: true,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { 
        position: 'top', 
        labels: { 
          font: { size: 14 },
          color: '#ffffff'  // 흰색으로 명시
        } 
      },
      tooltip: {
        backgroundColor: '#3a3a3a',  // 다크 회색
        titleColor: '#ffffff',       // 흰색
        bodyColor: '#ffffff',        // 흰색
        borderColor: '#404040',      // 회색
        borderWidth: 1,
        callbacks: {
          label: ctx => `${ctx.dataset.label}: ${ctx.formattedValue}`
        }
      }
    },
    scales: generateScales(selectedMetric)
  };

  if (!bodyData || bodyData.length === 0) {
    return (
      <EmptyState>
        아직 인바디 데이터가 없어요. <br />
        <strong>첫 인바디 정보를 입력하고</strong> 그래프를 시작해보세요!
        <ButtonGroup>
          <PrimaryButton onClick={() => setShowModal(true)}>정보 입력</PrimaryButton>
        </ButtonGroup>
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
    <>
      <ToggleWrapper>
        {Object.keys(datasetsConfig).map(metric => (
          <ToggleButton
            key={metric}
            active={selectedMetric === metric}
            onClick={() => setSelectedMetric(metric)}
          >
            {datasetsConfig[metric].label}
          </ToggleButton>
        ))}
      </ToggleWrapper>

      <Line data={data} options={options} />

      <ButtonGroup>
        <PrimaryButton onClick={() => setShowModal(true)}>정보 추가하기</PrimaryButton>
      </ButtonGroup>

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
    </>
  );
};

export default BodyComparisonChart;

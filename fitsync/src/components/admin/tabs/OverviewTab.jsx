import React from 'react';
import styled from 'styled-components';
import StatisticsCards from '../stats/StatisticsCards';
import FeedbackStats from '../stats/FeedbackStats';
import ServiceVersionStats from '../stats/ServiceVersionStats';
import ModelPerformanceChart from '../charts/ModelPerformanceChart';
import ServiceSuccessChart from '../charts/ServiceSuccessChart';

// 개요 탭 컴포넌트
const OverviewTab = ({
    logs,
    filteredLogs,
    stats,
    isLoading,
    dateRange
}) => {
    return (
        <TabContainer>
            <TabHeader>
                <TabTitle>📊 대시보드 개요</TabTitle>
                <TabDescription>
                    주요 성능 지표와 서비스 현황을 한눈에 확인하세요
                </TabDescription>
            </TabHeader>

            <TabContent>
                {/* 주요 통계 카드 */}
                <Section>
                    <SectionTitle>주요 지표</SectionTitle>
                    <StatisticsCards
                        stats={stats}
                        isLoading={isLoading}
                    />
                </Section>
            </TabContent>
        </TabContainer>
    );
};

// 스타일 컴포넌트
const TabContainer = styled.div`
  background: #f9fafb;
  border-radius: 8px;
  height: 100%;
  overflow-y: auto;
`;

const TabHeader = styled.div`
  background: white;
  padding: 24px;
  border-radius: 8px 8px 0 0;
  border-bottom: 1px solid #e5e7eb;
`;

const TabTitle = styled.h2`
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 700;
  color: #111827;
`;

const TabDescription = styled.p`
  margin: 0;
  color: #6b7280;
  font-size: 14px;
`;

const TabContent = styled.div`
  padding: 24px;
`;

const Section = styled.div`
  margin-bottom: 32px;
`;

const SectionTitle = styled.h3`
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: #374151;
`;

const ChartsSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
`;

const ChartContainer = styled.div`
  height: 400px;
`;

const StatsSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
`;

const StatsContainer = styled.div`
  height: 500px;
`;

const SummarySection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const SummaryTitle = styled.h3`
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: #374151;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
`;

const SummaryCard = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: ${props => props.good ?
        'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)' :
        '#fafafa'
    };
  border: 1px solid ${props => props.good ? '#bbf7d0' : '#e5e7eb'};
  border-radius: 12px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const SummaryIcon = styled.div`
  font-size: 28px;
  min-width: 40px;
  text-align: center;
`;

const SummaryContent = styled.div`
  flex: 1;
`;

const SummaryLabel = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const SummaryValue = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${props => props.good ? '#059669' : '#374151'};
  margin-bottom: 2px;
`;

const SummaryDetail = styled.div`
  font-size: 11px;
  color: #9ca3af;
`;

export default OverviewTab;

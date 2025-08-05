import React from 'react';
import styled from 'styled-components';
import StatisticsCards from '../stats/StatisticsCards';

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
  background: var(--bg-primary);
  border-radius: 0.75rem;
  height: 100%;
  overflow-y: auto;
`;

const TabHeader = styled.div`
  background: var(--bg-secondary);
  padding: 2.5rem;
  border-radius: 0.75rem 0.75rem 0 0;
  border-bottom: 1px solid var(--border-light);
  
  @media (max-width: 768px) {
    padding: 2rem;
  }
`;

const TabTitle = styled.h2`
  margin: 0 0 0.8rem 0;
  font-size: 2.8rem;
  font-weight: 700;
  color: var(--text-primary);
  
  @media (max-width: 768px) {
    font-size: 2.4rem;
  }
`;

const TabDescription = styled.p`
  margin: 0;
  color: var(--text-secondary);
  font-size: 1.6rem;
  line-height: 1.5;
  
  @media (max-width: 768px) {
    font-size: 1.4rem;
  }
`;

const TabContent = styled.div`
  padding: 2.5rem 0;
  
  @media (max-width: 768px) {
    padding: 2rem;
  }
`;

const Section = styled.div`
  margin-bottom: 3.5rem;
  
  @media (max-width: 768px) {
    margin-bottom: 3rem;
  }
`;

const SectionTitle = styled.h3`
  margin: 0 0 2rem 0;
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-primary);
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
    }
`;

export default OverviewTab;
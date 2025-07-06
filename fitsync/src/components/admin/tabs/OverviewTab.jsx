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

                {/* 차트 섹션 */}
                <ChartsSection>
                    <ChartContainer>
                        <ModelPerformanceChart
                            logs={filteredLogs}
                            isLoading={isLoading}
                            dateRange={dateRange}
                        />
                    </ChartContainer>
                    <ChartContainer>
                        <ServiceSuccessChart
                            logs={filteredLogs}
                            isLoading={isLoading}
                            dateRange={dateRange}
                        />
                    </ChartContainer>
                </ChartsSection>

                {/* 통계 섹션 */}
                <StatsSection>
                    <StatsContainer>
                        <FeedbackStats
                            stats={stats}
                            isLoading={isLoading}
                        />
                    </StatsContainer>
                    <StatsContainer>
                        <ServiceVersionStats
                            logs={filteredLogs}
                            isLoading={isLoading}
                        />
                    </StatsContainer>
                </StatsSection>

                {/* 요약 정보 */}
                {stats && !isLoading && (
                    <SummarySection>
                        <SummaryTitle>📈 실시간 요약</SummaryTitle>
                        <SummaryGrid>
                            <SummaryCard good={stats.successRate >= 95}>
                                <SummaryIcon>🎯</SummaryIcon>
                                <SummaryContent>
                                    <SummaryLabel>서비스 상태</SummaryLabel>
                                    <SummaryValue good={stats.successRate >= 95}>
                                        {stats.successRate >= 95 ? '매우 양호' :
                                            stats.successRate >= 90 ? '양호' :
                                                stats.successRate >= 80 ? '보통' : '주의 필요'}
                                    </SummaryValue>
                                    <SummaryDetail>성공률 {stats.successRate}%</SummaryDetail>
                                </SummaryContent>
                            </SummaryCard>

                            <SummaryCard good={stats.avgResponseTime <= 500}>
                                <SummaryIcon>⚡</SummaryIcon>
                                <SummaryContent>
                                    <SummaryLabel>응답 성능</SummaryLabel>
                                    <SummaryValue good={stats.avgResponseTime <= 500}>
                                        {stats.avgResponseTime <= 300 ? '매우 빠름' :
                                            stats.avgResponseTime <= 500 ? '빠름' :
                                                stats.avgResponseTime <= 1000 ? '보통' : '느림'}
                                    </SummaryValue>
                                    <SummaryDetail>평균 {stats.avgResponseTime}ms</SummaryDetail>
                                </SummaryContent>
                            </SummaryCard>

                            <SummaryCard good={stats.feedbackStats?.total > 0 &&
                                ((stats.feedbackStats.like / stats.feedbackStats.total) * 100) >= 80}>
                                <SummaryIcon>💬</SummaryIcon>
                                <SummaryContent>
                                    <SummaryLabel>사용자 만족도</SummaryLabel>
                                    <SummaryValue good={stats.feedbackStats?.total > 0 &&
                                        ((stats.feedbackStats.like / stats.feedbackStats.total) * 100) >= 80}>
                                        {!stats.feedbackStats || stats.feedbackStats.total === 0 ? '데이터 없음' :
                                            ((stats.feedbackStats.like / stats.feedbackStats.total) * 100) >= 90 ? '매우 높음' :
                                                ((stats.feedbackStats.like / stats.feedbackStats.total) * 100) >= 80 ? '높음' :
                                                    ((stats.feedbackStats.like / stats.feedbackStats.total) * 100) >= 60 ? '보통' : '낮음'}
                                    </SummaryValue>
                                    <SummaryDetail>
                                        {stats.feedbackStats && stats.feedbackStats.total > 0
                                            ? `${((stats.feedbackStats.like / stats.feedbackStats.total) * 100).toFixed(1)}% 만족`
                                            : '피드백 수집 필요'}
                                    </SummaryDetail>
                                </SummaryContent>
                            </SummaryCard>

                            <SummaryCard>
                                <SummaryIcon>👥</SummaryIcon>
                                <SummaryContent>
                                    <SummaryLabel>사용자 활동</SummaryLabel>
                                    <SummaryValue>
                                        {stats.uniqueUsers >= 100 ? '활발함' :
                                            stats.uniqueUsers >= 50 ? '보통' :
                                                stats.uniqueUsers >= 10 ? '저조함' : '매우 저조함'}
                                    </SummaryValue>
                                    <SummaryDetail>{stats.uniqueUsers}명 활성 사용자</SummaryDetail>
                                </SummaryContent>
                            </SummaryCard>
                        </SummaryGrid>
                    </SummarySection>
                )}
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

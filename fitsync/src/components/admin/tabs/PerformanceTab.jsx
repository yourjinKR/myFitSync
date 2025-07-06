import React from 'react';
import styled from 'styled-components';
import ResponseTimeChart from '../charts/ResponseTimeChart';
import ModelPerformanceChart from '../charts/ModelPerformanceChart';
import ServiceSuccessChart from '../charts/ServiceSuccessChart';

// 성능 탭 컴포넌트
const PerformanceTab = ({ 
  logs, 
  filteredLogs,
  stats, 
  isLoading,
  dateRange 
}) => {
  // 성능 지표 계산
  const getPerformanceMetrics = () => {
    if (!stats) return null;

    const responseTimes = filteredLogs
      .map(log => parseFloat(log.apilog_response_time))
      .filter(time => !isNaN(time) && time > 0)
      .sort((a, b) => a - b);

    if (responseTimes.length === 0) return null;

    const p50 = responseTimes[Math.floor(responseTimes.length * 0.5)];
    const p90 = responseTimes[Math.floor(responseTimes.length * 0.9)];
    const p95 = responseTimes[Math.floor(responseTimes.length * 0.95)];
    const p99 = responseTimes[Math.floor(responseTimes.length * 0.99)];

    return {
      p50: p50?.toFixed(0) || 0,
      p90: p90?.toFixed(0) || 0,
      p95: p95?.toFixed(0) || 0,
      p99: p99?.toFixed(0) || 0,
      min: responseTimes[0]?.toFixed(0) || 0,
      max: responseTimes[responseTimes.length - 1]?.toFixed(0) || 0
    };
  };

  // 처리량 계산
  const getThroughputMetrics = () => {
    if (!filteredLogs || filteredLogs.length === 0) return null;

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const lastHourLogs = filteredLogs.filter(log => 
      new Date(log.apilog_timestamp) >= oneHourAgo
    );
    const lastDayLogs = filteredLogs.filter(log => 
      new Date(log.apilog_timestamp) >= oneDayAgo
    );

    return {
      perMinute: (lastHourLogs.length / 60).toFixed(1),
      perHour: lastHourLogs.length,
      perDay: lastDayLogs.length
    };
  };

  const performanceMetrics = getPerformanceMetrics();
  const throughputMetrics = getThroughputMetrics();

  return (
    <TabContainer>
      <TabHeader>
        <TabTitle>⚡ 성능 모니터링</TabTitle>
        <TabDescription>
          응답시간, 처리량, 시스템 성능 지표를 실시간으로 모니터링합니다
        </TabDescription>
      </TabHeader>

      <TabContent>
        {/* 핵심 성능 지표 */}
        <MetricsSection>
          <SectionTitle>🎯 핵심 성능 지표</SectionTitle>
          <MetricsGrid>
            {/* 응답시간 백분위수 */}
            <MetricCard>
              <CardTitle>⏱️ 응답시간 분포</CardTitle>
              {performanceMetrics ? (
                <PercentileGrid>
                  <PercentileItem>
                    <PercentileLabel>P50 (중간값)</PercentileLabel>
                    <PercentileValue good={performanceMetrics.p50 <= 300}>
                      {performanceMetrics.p50}ms
                    </PercentileValue>
                  </PercentileItem>
                  <PercentileItem>
                    <PercentileLabel>P90</PercentileLabel>
                    <PercentileValue good={performanceMetrics.p90 <= 500}>
                      {performanceMetrics.p90}ms
                    </PercentileValue>
                  </PercentileItem>
                  <PercentileItem>
                    <PercentileLabel>P95</PercentileLabel>
                    <PercentileValue good={performanceMetrics.p95 <= 800}>
                      {performanceMetrics.p95}ms
                    </PercentileValue>
                  </PercentileItem>
                  <PercentileItem>
                    <PercentileLabel>P99</PercentileLabel>
                    <PercentileValue good={performanceMetrics.p99 <= 1500}>
                      {performanceMetrics.p99}ms
                    </PercentileValue>
                  </PercentileItem>
                  <PercentileItem>
                    <PercentileLabel>최소</PercentileLabel>
                    <PercentileValue>{performanceMetrics.min}ms</PercentileValue>
                  </PercentileItem>
                  <PercentileItem>
                    <PercentileLabel>최대</PercentileLabel>
                    <PercentileValue slow={performanceMetrics.max > 3000}>
                      {performanceMetrics.max}ms
                    </PercentileValue>
                  </PercentileItem>
                </PercentileGrid>
              ) : (
                <NoDataMessage>응답시간 데이터가 없습니다</NoDataMessage>
              )}
            </MetricCard>

            {/* 처리량 지표 */}
            <MetricCard>
              <CardTitle>📊 처리량 지표</CardTitle>
              {throughputMetrics ? (
                <ThroughputGrid>
                  <ThroughputItem>
                    <ThroughputLabel>분당 요청</ThroughputLabel>
                    <ThroughputValue good={throughputMetrics.perMinute >= 1}>
                      {throughputMetrics.perMinute}
                    </ThroughputValue>
                  </ThroughputItem>
                  <ThroughputItem>
                    <ThroughputLabel>시간당 요청</ThroughputLabel>
                    <ThroughputValue good={throughputMetrics.perHour >= 60}>
                      {throughputMetrics.perHour}
                    </ThroughputValue>
                  </ThroughputItem>
                  <ThroughputItem>
                    <ThroughputLabel>일간 요청</ThroughputLabel>
                    <ThroughputValue good={throughputMetrics.perDay >= 1000}>
                      {throughputMetrics.perDay}
                    </ThroughputValue>
                  </ThroughputItem>
                </ThroughputGrid>
              ) : (
                <NoDataMessage>처리량 데이터가 없습니다</NoDataMessage>
              )}
            </MetricCard>

            {/* 시스템 상태 */}
            <MetricCard>
              <CardTitle>🔧 시스템 상태</CardTitle>
              <SystemHealth>
                <HealthItem good={stats?.successRate >= 95}>
                  <HealthIcon>
                    {stats?.successRate >= 95 ? '🟢' : 
                     stats?.successRate >= 90 ? '🟡' : '🔴'}
                  </HealthIcon>
                  <HealthContent>
                    <HealthLabel>서비스 가용성</HealthLabel>
                    <HealthValue good={stats?.successRate >= 95}>
                      {stats?.successRate}%
                    </HealthValue>
                  </HealthContent>
                </HealthItem>
                <HealthItem good={stats?.errorRate <= 5}>
                  <HealthIcon>
                    {stats?.errorRate <= 1 ? '🟢' : 
                     stats?.errorRate <= 5 ? '🟡' : '🔴'}
                  </HealthIcon>
                  <HealthContent>
                    <HealthLabel>오류율</HealthLabel>
                    <HealthValue error={stats?.errorRate > 5}>
                      {stats?.errorRate}%
                    </HealthValue>
                  </HealthContent>
                </HealthItem>
                <HealthItem good={stats?.avgResponseTime <= 500}>
                  <HealthIcon>
                    {stats?.avgResponseTime <= 300 ? '🟢' : 
                     stats?.avgResponseTime <= 500 ? '🟡' : '🔴'}
                  </HealthIcon>
                  <HealthContent>
                    <HealthLabel>평균 응답시간</HealthLabel>
                    <HealthValue good={stats?.avgResponseTime <= 500}>
                      {stats?.avgResponseTime}ms
                    </HealthValue>
                  </HealthContent>
                </HealthItem>
              </SystemHealth>
            </MetricCard>
          </MetricsGrid>
        </MetricsSection>

        {/* 성능 차트 */}
        <ChartsSection>
          <ChartContainer>
            <ResponseTimeChart 
              logs={filteredLogs} 
              isLoading={isLoading}
              dateRange={dateRange}
            />
          </ChartContainer>
          <ChartContainer>
            <ModelPerformanceChart 
              logs={filteredLogs} 
              isLoading={isLoading}
              dateRange={dateRange}
            />
          </ChartContainer>
        </ChartsSection>

        {/* 서비스 성능 분석 */}
        <AnalysisSection>
          <SectionTitle>🔍 서비스 성능 분석</SectionTitle>
          <AnalysisContainer>
            <ServiceSuccessChart 
              logs={filteredLogs} 
              isLoading={isLoading}
              dateRange={dateRange}
            />
          </AnalysisContainer>
        </AnalysisSection>

        {/* 성능 권장사항 */}
        {stats && (
          <RecommendationsSection>
            <SectionTitle>💡 성능 최적화 권장사항</SectionTitle>
            <RecommendationsList>
              {stats.avgResponseTime > 1000 && (
                <RecommendationItem priority="high">
                  <RecommendationIcon>🚨</RecommendationIcon>
                  <RecommendationContent>
                    <RecommendationTitle>응답시간 개선 필요</RecommendationTitle>
                    <RecommendationDescription>
                      평균 응답시간이 {stats.avgResponseTime}ms입니다. 
                      데이터베이스 쿼리 최적화나 캐싱 도입을 검토하세요.
                    </RecommendationDescription>
                  </RecommendationContent>
                </RecommendationItem>
              )}
              
              {stats.errorRate > 5 && (
                <RecommendationItem priority="high">
                  <RecommendationIcon>⚠️</RecommendationIcon>
                  <RecommendationContent>
                    <RecommendationTitle>오류율 감소 필요</RecommendationTitle>
                    <RecommendationDescription>
                      오류율이 {stats.errorRate}%입니다. 
                      에러 로그를 분석하여 주요 오류 원인을 파악하세요.
                    </RecommendationDescription>
                  </RecommendationContent>
                </RecommendationItem>
              )}
              
              {stats.successRate >= 98 && stats.avgResponseTime <= 500 && (
                <RecommendationItem priority="good">
                  <RecommendationIcon>✅</RecommendationIcon>
                  <RecommendationContent>
                    <RecommendationTitle>우수한 성능</RecommendationTitle>
                    <RecommendationDescription>
                      현재 성능이 매우 우수합니다. 이 수준을 유지하세요.
                    </RecommendationDescription>
                  </RecommendationContent>
                </RecommendationItem>
              )}
              
              {throughputMetrics && throughputMetrics.perMinute < 1 && (
                <RecommendationItem priority="medium">
                  <RecommendationIcon>📈</RecommendationIcon>
                  <RecommendationContent>
                    <RecommendationTitle>사용량 증대 방안</RecommendationTitle>
                    <RecommendationDescription>
                      처리량이 낮습니다. 사용자 유입 증대 방안을 검토하세요.
                    </RecommendationDescription>
                  </RecommendationContent>
                </RecommendationItem>
              )}
            </RecommendationsList>
          </RecommendationsSection>
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

const MetricsSection = styled.div`
  margin-bottom: 32px;
`;

const SectionTitle = styled.h3`
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: #374151;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
`;

const MetricCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const CardTitle = styled.h4`
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
`;

const PercentileGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
`;

const PercentileItem = styled.div`
  text-align: center;
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;
`;

const PercentileLabel = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
`;

const PercentileValue = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${props => {
    if (props.good) return '#059669';
    if (props.slow) return '#dc2626';
    return '#374151';
  }};
`;

const ThroughputGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ThroughputItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;
`;

const ThroughputLabel = styled.span`
  font-size: 14px;
  color: #6b7280;
`;

const ThroughputValue = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: ${props => props.good ? '#059669' : '#374151'};
`;

const SystemHealth = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const HealthItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;
`;

const HealthIcon = styled.span`
  font-size: 16px;
`;

const HealthContent = styled.div`
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HealthLabel = styled.span`
  font-size: 14px;
  color: #6b7280;
`;

const HealthValue = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${props => {
    if (props.good) return '#059669';
    if (props.error) return '#dc2626';
    return '#374151';
  }};
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

const AnalysisSection = styled.div`
  margin-bottom: 32px;
`;

const AnalysisContainer = styled.div`
  height: 400px;
`;

const RecommendationsSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const RecommendationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const RecommendationItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  border-radius: 8px;
  background: ${props => {
    switch (props.priority) {
      case 'high': return '#fef2f2';
      case 'medium': return '#fffbeb';
      case 'good': return '#f0fdf4';
      default: return '#f9fafb';
    }
  }};
  border: 1px solid ${props => {
    switch (props.priority) {
      case 'high': return '#fecaca';
      case 'medium': return '#fed7aa';
      case 'good': return '#bbf7d0';
      default: return '#e5e7eb';
    }
  }};
`;

const RecommendationIcon = styled.span`
  font-size: 20px;
  margin-top: 2px;
`;

const RecommendationContent = styled.div`
  flex: 1;
`;

const RecommendationTitle = styled.h5`
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
`;

const RecommendationDescription = styled.p`
  margin: 0;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
`;

const NoDataMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
  color: #9ca3af;
  font-size: 14px;
`;

export default PerformanceTab;

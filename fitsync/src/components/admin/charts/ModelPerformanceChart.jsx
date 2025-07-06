import React from 'react';
import styled from 'styled-components';

// 모델 성능 비교 차트 컴포넌트
const ModelPerformanceChart = ({ logs, isLoading, dateRange }) => {
  // 모델별 성능 데이터 계산
  const getModelPerformanceData = () => {
    if (!logs || logs.length === 0) return [];

    const modelStats = {};
    
    logs.forEach(log => {
      const model = log.model || 'Unknown';
      if (!modelStats[model]) {
        modelStats[model] = {
          model,
          totalRequests: 0,
          successCount: 0,
          errorCount: 0,
          totalResponseTime: 0,
          avgResponseTime: 0,
          successRate: 0
        };
      }
      
      modelStats[model].totalRequests++;
      if (log.responseStatus === 'SUCCESS') {
        modelStats[model].successCount++;
      } else {
        modelStats[model].errorCount++;
      }
      
      if (log.responseTime) {
        modelStats[model].totalResponseTime += parseFloat(log.responseTime);
      }
    });

    // 평균 응답시간과 성공률 계산
    return Object.values(modelStats).map(stat => ({
      ...stat,
      avgResponseTime: stat.totalRequests > 0 
        ? (stat.totalResponseTime / stat.totalRequests).toFixed(2)
        : 0,
      successRate: stat.totalRequests > 0 
        ? ((stat.successCount / stat.totalRequests) * 100).toFixed(1)
        : 0
    }));
  };

  const modelData = getModelPerformanceData();

  if (isLoading) {
    return (
      <ChartContainer>
        <ChartTitle>모델 성능 비교</ChartTitle>
        <LoadingMessage>데이터를 불러오는 중...</LoadingMessage>
      </ChartContainer>
    );
  }

  if (modelData.length === 0) {
    return (
      <ChartContainer>
        <ChartTitle>모델 성능 비교</ChartTitle>
        <NoDataMessage>표시할 데이터가 없습니다.</NoDataMessage>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer>
      <ChartTitle>모델 성능 비교</ChartTitle>
      <ChartContent>
        <MetricsGrid>
          {modelData.map((model, index) => (
            <ModelCard key={model.model}>
              <ModelName>{model.model}</ModelName>
              <MetricsRow>
                <MetricItem>
                  <MetricLabel>총 요청</MetricLabel>
                  <MetricValue>{model.totalRequests.toLocaleString()}</MetricValue>
                </MetricItem>
                <MetricItem>
                  <MetricLabel>성공률</MetricLabel>
                  <MetricValue success={parseFloat(model.successRate) >= 95}>
                    {model.successRate}%
                  </MetricValue>
                </MetricItem>
              </MetricsRow>
              <MetricsRow>
                <MetricItem>
                  <MetricLabel>평균 응답시간</MetricLabel>
                  <MetricValue fast={parseFloat(model.avgResponseTime) <= 500}>
                    {model.avgResponseTime}ms
                  </MetricValue>
                </MetricItem>
                <MetricItem>
                  <MetricLabel>에러 수</MetricLabel>
                  <MetricValue error={model.errorCount > 0}>
                    {model.errorCount}
                  </MetricValue>
                </MetricItem>
              </MetricsRow>
              <PerformanceBar>
                <SuccessBar 
                  width={model.successRate}
                  success={parseFloat(model.successRate) >= 95}
                />
              </PerformanceBar>
            </ModelCard>
          ))}
        </MetricsGrid>
        
        {dateRange && (
          <DateRangeInfo>
            기간: {dateRange.start} ~ {dateRange.end}
          </DateRangeInfo>
        )}
      </ChartContent>
    </ChartContainer>
  );
};

// 스타일 컴포넌트
const ChartContainer = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height: 100%;
`;

const ChartTitle = styled.h3`
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
`;

const ChartContent = styled.div`
  height: calc(100% - 50px);
  display: flex;
  flex-direction: column;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  flex: 1;
`;

const ModelCard = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  background: #fafafa;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const ModelName = styled.h4`
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  text-align: center;
  padding-bottom: 8px;
  border-bottom: 2px solid #3498db;
`;

const MetricsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
`;

const MetricItem = styled.div`
  text-align: center;
`;

const MetricLabel = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
`;

const MetricValue = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${props => {
    if (props.success) return '#27ae60';
    if (props.fast) return '#3498db';
    if (props.error && props.children !== '0') return '#e74c3c';
    return '#2c3e50';
  }};
`;

const PerformanceBar = styled.div`
  width: 100%;
  height: 8px;
  background: #ecf0f1;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 8px;
`;

const SuccessBar = styled.div`
  height: 100%;
  width: ${props => props.width}%;
  background: ${props => props.success ? '#27ae60' : '#f39c12'};
  transition: width 0.3s ease;
`;

const LoadingMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666;
  font-size: 14px;
`;

const NoDataMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #999;
  font-size: 14px;
`;

const DateRangeInfo = styled.div`
  text-align: center;
  font-size: 12px;
  color: #666;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #eee;
`;

export default ModelPerformanceChart;

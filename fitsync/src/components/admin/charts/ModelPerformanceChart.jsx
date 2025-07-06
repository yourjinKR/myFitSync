import React from 'react';
import styled from 'styled-components';

// 모델 성능 비교 차트 컴포넌트
const ModelPerformanceChart = ({ logs, isLoading, dateRange }) => {
    // 모델별 성능 데이터 계산
    const getModelPerformanceData = () => {
        if (!logs || logs.length === 0) return [];

        const modelStats = {};

        logs.forEach(log => {
            const model = log.apilog_model || 'Unknown';
            if (!modelStats[model]) {
                modelStats[model] = {
                    model,
                    totalRequests: 0,
                    successCount: 0,
                    failCount: 0,
                    totalResponseTime: 0,
                    avgResponseTime: 0,
                    successRate: 0
                };
            }

            modelStats[model].totalRequests++;
            if (log.apilog_status === 'success') {
                modelStats[model].successCount++;
            } else {
                modelStats[model].failCount++;
            }

            if (log.apilog_total_time) {
                modelStats[model].totalResponseTime += parseFloat(log.apilog_total_time);
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
                                    <MetricValue fast={parseFloat(model.avgResponseTime) <= 5}>
                                        {model.avgResponseTime}초
                                    </MetricValue>
                                </MetricItem>
                                <MetricItem>
                                    <MetricLabel>에러 및 예외</MetricLabel>
                                    <MetricValue error={model.failCount > 0}>
                                        {model.failCount}
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
  border-radius: 6px;
  padding: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height: 100%;
  
  @media (min-width: 480px) {
    padding: 16px;
    border-radius: 7px;
  }
  
  @media (min-width: 768px) {
    padding: 20px;
    border-radius: 8px;
  }
`;

const ChartTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  
  @media (min-width: 480px) {
    font-size: 16px;
    margin-bottom: 16px;
  }
  
  @media (min-width: 768px) {
    font-size: 18px;
    margin-bottom: 20px;
  }
`;

const ChartContent = styled.div`
  height: calc(100% - 40px);
  display: flex;
  flex-direction: column;
  
  @media (min-width: 480px) {
    height: calc(100% - 45px);
  }
  
  @media (min-width: 768px) {
    height: calc(100% - 50px);
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  flex: 1;
  
  @media (min-width: 480px) {
    gap: 12px;
  }
  
  @media (min-width: 640px) {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 16px;
  }
`;

const ModelCard = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 12px;
  background: #fafafa;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }
  
  @media (min-width: 480px) {
    padding: 14px;
    border-radius: 7px;
    
    &:hover {
      transform: translateY(-2px);
    }
  }
  
  @media (min-width: 768px) {
    padding: 16px;
    border-radius: 8px;
  }
`;

const ModelName = styled.h4`
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  text-align: center;
  padding-bottom: 6px;
  border-bottom: 2px solid #3498db;
  
  @media (min-width: 480px) {
    font-size: 15px;
    margin-bottom: 10px;
    padding-bottom: 7px;
  }
  
  @media (min-width: 768px) {
    font-size: 16px;
    margin-bottom: 12px;
    padding-bottom: 8px;
  }
`;

const MetricsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 8px;
  
  @media (min-width: 480px) {
    gap: 10px;
    margin-bottom: 10px;
  }
  
  @media (min-width: 768px) {
    gap: 12px;
    margin-bottom: 12px;
  }
`;

const MetricItem = styled.div`
  text-align: center;
`;

const MetricLabel = styled.div`
  font-size: 10px;
  color: #666;
  margin-bottom: 3px;
  
  @media (min-width: 480px) {
    font-size: 11px;
    margin-bottom: 4px;
  }
  
  @media (min-width: 768px) {
    font-size: 12px;
  }
`;

const MetricValue = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${props => {
        if (props.success) return '#27ae60';
        if (props.fast) return '#3498db';
        if (props.error && props.children !== '0') return '#e74c3c';
        return '#2c3e50';
    }};
    
  @media (min-width: 480px) {
    font-size: 14px;
  }
  
  @media (min-width: 768px) {
    font-size: 16px;
  }
`;

const PerformanceBar = styled.div`
  width: 100%;
  height: 6px;
  background: #ecf0f1;
  border-radius: 3px;
  overflow: hidden;
  margin-top: 6px;
  
  @media (min-width: 480px) {
    height: 7px;
    margin-top: 7px;
  }
  
  @media (min-width: 768px) {
    height: 8px;
    margin-top: 8px;
    border-radius: 4px;
  }
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
  height: 150px;
  color: #666;
  font-size: 12px;
  
  @media (min-width: 480px) {
    height: 180px;
    font-size: 13px;
  }
  
  @media (min-width: 768px) {
    height: 200px;
    font-size: 14px;
  }
`;

const NoDataMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 150px;
  color: #999;
  font-size: 12px;
  
  @media (min-width: 480px) {
    height: 180px;
    font-size: 13px;
  }
  
  @media (min-width: 768px) {
    height: 200px;
    font-size: 14px;
  }
`;

const DateRangeInfo = styled.div`
  text-align: center;
  font-size: 10px;
  color: #666;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #eee;
  
  @media (min-width: 480px) {
    font-size: 11px;
    margin-top: 10px;
    padding-top: 10px;
  }
  
  @media (min-width: 768px) {
    font-size: 12px;
    margin-top: 12px;
    padding-top: 12px;
  }
`;

export default ModelPerformanceChart;

import React from 'react';
import styled from 'styled-components';

// 응답시간 분포 차트 컴포넌트
const ResponseTimeChart = ({ logs, isLoading, dateRange }) => {
  // 응답시간 분포 데이터 계산
  const getResponseTimeData = () => {
    if (!logs || logs.length === 0) return { ranges: [], stats: null };

    const responseTimes = logs
      .map(log => parseFloat(log.apilog_response_time))
      .filter(time => !isNaN(time) && time > 0);

    if (responseTimes.length === 0) {
      return { ranges: [], stats: null };
    }

    // 통계 계산
    const sorted = responseTimes.sort((a, b) => a - b);
    const total = responseTimes.length;
    const sum = responseTimes.reduce((acc, time) => acc + time, 0);
    const avg = sum / total;
    const median = sorted[Math.floor(total / 2)];
    const p95 = sorted[Math.floor(total * 0.95)];
    const min = sorted[0];
    const max = sorted[total - 1];

    // 응답시간 범위별 분포
    const ranges = [
      { label: '< 100ms', min: 0, max: 100, color: '#27ae60' },
      { label: '100-500ms', min: 100, max: 500, color: '#3498db' },
      { label: '500ms-1s', min: 500, max: 1000, color: '#f39c12' },
      { label: '1s-3s', min: 1000, max: 3000, color: '#e67e22' },
      { label: '> 3s', min: 3000, max: Infinity, color: '#e74c3c' }
    ].map(range => {
      const count = responseTimes.filter(time => time >= range.min && time < range.max).length;
      const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
      return { ...range, count, percentage };
    });

    return {
      ranges,
      stats: { avg, median, p95, min, max, total }
    };
  };

  const { ranges, stats } = getResponseTimeData();

  if (isLoading) {
    return (
      <ChartContainer>
        <ChartTitle>응답시간 분포</ChartTitle>
        <LoadingMessage>데이터를 불러오는 중...</LoadingMessage>
      </ChartContainer>
    );
  }

  if (!stats || stats.total === 0) {
    return (
      <ChartContainer>
        <ChartTitle>응답시간 분포</ChartTitle>
        <NoDataMessage>응답시간 데이터가 없습니다.</NoDataMessage>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer>
      <ChartTitle>응답시간 분포</ChartTitle>
      <ChartContent>
        {/* 통계 요약 */}
        <StatsGrid>
          <StatItem>
            <StatLabel>평균</StatLabel>
            <StatValue fast={stats.avg <= 500}>
              {stats.avg.toFixed(0)}ms
            </StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>중간값</StatLabel>
            <StatValue fast={stats.median <= 500}>
              {stats.median.toFixed(0)}ms
            </StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>95%tile</StatLabel>
            <StatValue fast={stats.p95 <= 1000}>
              {stats.p95.toFixed(0)}ms
            </StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>최대</StatLabel>
            <StatValue slow={stats.max > 3000}>
              {stats.max.toFixed(0)}ms
            </StatValue>
          </StatItem>
        </StatsGrid>

        {/* 분포 차트 */}
        <DistributionChart>
          {ranges.map((range, index) => (
            <RangeItem key={range.label}>
              <RangeHeader>
                <RangeLabel>{range.label}</RangeLabel>
                <RangeValue color={range.color}>
                  {range.count}건 ({range.percentage}%)
                </RangeValue>
              </RangeHeader>
              <RangeBarContainer>
                <RangeBar 
                  width={range.percentage}
                  color={range.color}
                />
              </RangeBarContainer>
            </RangeItem>
          ))}
        </DistributionChart>

        {/* 성능 지표 */}
        <PerformanceIndicators>
          <Indicator good={parseFloat(ranges[0].percentage) + parseFloat(ranges[1].percentage) >= 80}>
            <IndicatorIcon>🚀</IndicatorIcon>
            <IndicatorText>
              <div>고속 응답 (&lt; 500ms)</div>
              <div>{(parseFloat(ranges[0].percentage) + parseFloat(ranges[1].percentage)).toFixed(1)}%</div>
            </IndicatorText>
          </Indicator>
          
          <Indicator warning={parseFloat(ranges[4].percentage) > 10}>
            <IndicatorIcon>⚠️</IndicatorIcon>
            <IndicatorText>
              <div>느린 응답 (&gt; 3s)</div>
              <div>{ranges[4].percentage}%</div>
            </IndicatorText>
          </Indicator>
        </PerformanceIndicators>
        
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
  gap: 12px;
  
  @media (min-width: 480px) {
    height: calc(100% - 45px);
    gap: 16px;
  }
  
  @media (min-width: 768px) {
    height: calc(100% - 50px);
    gap: 20px;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
  
  @media (min-width: 480px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    padding: 12px;
    border-radius: 5px;
  }
  
  @media (min-width: 768px) {
    gap: 12px;
    padding: 16px;
    border-radius: 6px;
  }
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatLabel = styled.div`
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

const StatValue = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${props => {
    if (props.fast) return '#27ae60';
    if (props.slow) return '#e74c3c';
    return '#2c3e50';
  }};
  
  @media (min-width: 480px) {
    font-size: 14px;
  }
  
  @media (min-width: 768px) {
    font-size: 16px;
  }
`;

const DistributionChart = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  @media (min-width: 480px) {
    gap: 10px;
  }
  
  @media (min-width: 768px) {
    gap: 12px;
  }
`;

const RangeItem = styled.div`
  padding: 8px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: #fafafa;
  
  @media (min-width: 480px) {
    padding: 10px;
    border-radius: 5px;
  }
  
  @media (min-width: 768px) {
    padding: 12px;
    border-radius: 6px;
  }
`;

const RangeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  
  @media (min-width: 480px) {
    margin-bottom: 7px;
  }
  
  @media (min-width: 768px) {
    margin-bottom: 8px;
  }
`;

const RangeLabel = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: #333;
  
  @media (min-width: 480px) {
    font-size: 13px;
  }
  
  @media (min-width: 768px) {
    font-size: 14px;
  }
`;

const RangeValue = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.color};
  
  @media (min-width: 480px) {
    font-size: 13px;
  }
  
  @media (min-width: 768px) {
    font-size: 14px;
  }
`;

const RangeBarContainer = styled.div`
  width: 100%;
  height: 4px;
  background: #ecf0f1;
  border-radius: 2px;
  overflow: hidden;
  
  @media (min-width: 480px) {
    height: 5px;
    border-radius: 2.5px;
  }
  
  @media (min-width: 768px) {
    height: 6px;
    border-radius: 3px;
  }
`;

const RangeBar = styled.div`
  height: 100%;
  width: ${props => Math.max(props.width, 1)}%;
  background: ${props => props.color};
  transition: width 0.3s ease;
  border-radius: inherit;
`;

const PerformanceIndicators = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  
  @media (min-width: 480px) {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  
  @media (min-width: 768px) {
    gap: 12px;
  }
`;

const Indicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 4px;
  background: ${props => {
    if (props.good) return '#d4edda';
    if (props.warning) return '#fff3cd';
    return '#f8f9fa';
  }};
  border: 1px solid ${props => {
    if (props.good) return '#c3e6cb';
    if (props.warning) return '#ffeaa7';
    return '#e0e0e0';
  }};
  
  @media (min-width: 480px) {
    gap: 10px;
    padding: 10px;
    border-radius: 5px;
  }
  
  @media (min-width: 768px) {
    gap: 12px;
    padding: 12px;
    border-radius: 6px;
  }
`;

const IndicatorIcon = styled.span`
  font-size: 16px;
  
  @media (min-width: 480px) {
    font-size: 18px;
  }
  
  @media (min-width: 768px) {
    font-size: 20px;
  }
`;

const IndicatorText = styled.div`
  font-size: 10px;
  
  > div:first-child {
    color: #666;
    margin-bottom: 2px;
  }
  
  > div:last-child {
    font-weight: 600;
    color: #333;
  }
  
  @media (min-width: 480px) {
    font-size: 11px;
  }
  
  @media (min-width: 768px) {
    font-size: 12px;
  }
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

export default ResponseTimeChart;

import React from 'react';
import styled from 'styled-components';

// 서비스 성공률 차트 컴포넌트
const ServiceSuccessChart = ({ logs, isLoading, dateRange }) => {
  // 서비스별 성공률 데이터 계산
  const getServiceSuccessData = () => {
    if (!logs || logs.length === 0) return [];

    const serviceStats = {};
    
    logs.forEach(log => {
      const service = log.apilog_service_type || 'Unknown';
      if (!serviceStats[service]) {
        serviceStats[service] = {
          service,
          totalRequests: 0,
          successCount: 0,
          errorCount: 0,
          exceptionCount: 0,
          successRate: 0
        };
      }
      
      serviceStats[service].totalRequests++;
      
      if (log.apilog_status === 'success') {
        serviceStats[service].successCount++;
      } else if (log.apilog_status === 'fail') {
        serviceStats[service].errorCount++;
      } else if (log.apilog_status === 'exception') {
        serviceStats[service].exceptionCount++;
      }
    });

    // 성공률 계산 및 정렬
    return Object.values(serviceStats)
      .map(stat => ({
        ...stat,
        successRate: stat.totalRequests > 0 
          ? ((stat.successCount / stat.totalRequests) * 100).toFixed(1)
          : 0
      }))
      .sort((a, b) => parseFloat(b.successRate) - parseFloat(a.successRate));
  };

  const serviceData = getServiceSuccessData();

  if (isLoading) {
    return (
      <ChartContainer>
        <ChartTitle>서비스별 성공률</ChartTitle>
        <LoadingMessage>데이터를 불러오는 중...</LoadingMessage>
      </ChartContainer>
    );
  }

  if (serviceData.length === 0) {
    return (
      <ChartContainer>
        <ChartTitle>서비스별 성공률</ChartTitle>
        <NoDataMessage>표시할 데이터가 없습니다.</NoDataMessage>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer>
      <ChartTitle>서비스별 성공률</ChartTitle>
      <ChartContent>
        <ServiceList>
          {serviceData.map((service, index) => (
            <ServiceItem key={service.service}>
              <ServiceHeader>
                <ServiceName>{service.service}</ServiceName>
                <SuccessRate success={parseFloat(service.successRate) >= 95}>
                  {service.successRate}%
                </SuccessRate>
              </ServiceHeader>
              
              <SuccessBarContainer>
                <SuccessBar 
                  width={service.successRate}
                  success={parseFloat(service.successRate) >= 95}
                />
              </SuccessBarContainer>
              
              <StatusBreakdown>
                <StatusItem>
                  <StatusIcon success>✅</StatusIcon>
                  <StatusLabel>성공</StatusLabel>
                  <StatusCount>{service.successCount.toLocaleString()}</StatusCount>
                </StatusItem>
                <StatusItem>
                  <StatusIcon error>❌</StatusIcon>
                  <StatusLabel>오류</StatusLabel>
                  <StatusCount>{service.errorCount.toLocaleString()}</StatusCount>
                </StatusItem>
                <StatusItem>
                  <StatusIcon exception>⚠️</StatusIcon>
                  <StatusLabel>예외</StatusLabel>
                  <StatusCount>{service.exceptionCount.toLocaleString()}</StatusCount>
                </StatusItem>
                <StatusItem>
                  <StatusIcon total>📊</StatusIcon>
                  <StatusLabel>총계</StatusLabel>
                  <StatusCount>{service.totalRequests.toLocaleString()}</StatusCount>
                </StatusItem>
              </StatusBreakdown>
            </ServiceItem>
          ))}
        </ServiceList>
        
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

const ServiceList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
`;

const ServiceItem = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  background: #fafafa;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }
`;

const ServiceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const ServiceName = styled.h4`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
`;

const SuccessRate = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.success ? '#27ae60' : '#f39c12'};
`;

const SuccessBarContainer = styled.div`
  width: 100%;
  height: 8px;
  background: #ecf0f1;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
`;

const SuccessBar = styled.div`
  height: 100%;
  width: ${props => props.width}%;
  background: ${props => props.success ? '#27ae60' : '#f39c12'};
  transition: width 0.3s ease;
  border-radius: 4px;
`;

const StatusBreakdown = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
`;

const StatusItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const StatusIcon = styled.span`
  font-size: 16px;
  margin-bottom: 4px;
`;

const StatusLabel = styled.span`
  font-size: 11px;
  color: #666;
  margin-bottom: 2px;
`;

const StatusCount = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #2c3e50;
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

export default ServiceSuccessChart;

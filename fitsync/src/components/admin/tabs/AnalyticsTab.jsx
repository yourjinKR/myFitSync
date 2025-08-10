import React, { useState } from 'react';
import styled from 'styled-components';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    TimeScale,
    Filler
} from 'chart.js';

// Chart.js 컴포넌트 등록
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    TimeScale,
    Filler
);

// 분석 탭 컴포넌트
const AnalyticsTab = ({
    logs,
    filteredLogs,
    stats,
    isLoading,
    dateRange
}) => {
    const [selectedAnalysis, setSelectedAnalysis] = useState('timeline');

    // 시간대별 요청 분석
    const getTimelineData = () => {
        if (!filteredLogs || filteredLogs.length === 0) return null;

        const hourlyData = {};
        filteredLogs.forEach(log => {
            const hour = new Date(log.apilog_response_time).getHours();
            if (!hourlyData[hour]) {
                hourlyData[hour] = { total: 0, success: 0, error: 0 };
            }
            hourlyData[hour].total++;
            if (log.apilog_status === 'success') {
                hourlyData[hour].success++;
            } else {
                hourlyData[hour].error++;
            }
        });

        const hours = Array.from({ length: 24 }, (_, i) => i);
        return {
            labels: hours.map(h => `${h}:00`),
            datasets: [
                {
                    label: '총 요청',
                    data: hours.map(h => hourlyData[h]?.total || 0),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                },
                {
                    label: '성공 요청',
                    data: hours.map(h => hourlyData[h]?.success || 0),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                }
            ]
        };
    };

    // 모델별 사용량 분석
    const getModelUsageData = () => {
        if (!filteredLogs || filteredLogs.length === 0) return null;

        const modelUsage = {};
        filteredLogs.forEach(log => {
            const model = log.apilog_model || 'Unknown';
            modelUsage[model] = (modelUsage[model] || 0) + 1;
        });

        const sortedModels = Object.entries(modelUsage)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10);

        return {
            labels: sortedModels.map(([model]) => model),
            datasets: [{
                label: '사용 횟수',
                data: sortedModels.map(([, count]) => count),
                backgroundColor: [
                    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
                    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6b7280'
                ],
                borderWidth: 1
            }]
        };
    };

    // 응답시간 분포 분석
    const getResponseTimeDistribution = () => {
        if (!filteredLogs || filteredLogs.length === 0) return null;

        const ranges = [
            { label: '< 3s', min: 0, max: 3000 },
            { label: '3s-6s', min: 3000, max: 6000 },
            { label: '6s-9s', min: 6000, max: 9000 },
            { label: '9s-12s', min: 9000, max: 12000 },
            { label: '12s-15s', min: 12000, max: 15000 },
            { label: '15s-18s', min: 15000, max: 18000 },
            { label: '18s-20s', min: 18000, max: 20000 },
            { label: '> 20s', min: 20000, max: Infinity }
        ];

        const distribution = ranges.map(range => {
            const count = filteredLogs.filter(log => {
                const time = (log.apilog_total_time * 1000) || 0; // ms 단위로 변환
                return time >= range.min && time < range.max;
            }).length;
            return count;
        });

        return {
            labels: ranges.map(r => r.label),
            datasets: [{
                label: '요청 수',
                data: distribution,
                backgroundColor: [
                    '#10b981', '#3b82f6', '#f59e0b', '#f97316', '#ef4444', '#dc2626', '#991b1b', '#7f1d1d'
                ],
                borderWidth: 1
            }]
        };
    };

    // 에러 분석
    const getErrorAnalysis = () => {
        if (!filteredLogs || filteredLogs.length === 0) return null;

        const errorLogs = filteredLogs.filter(log =>
            log.apilog_status === 'error' || log.apilog_status === 'exception'
        );

        const errorByModel = {};
        const errorByService = {};
        const errorOverTime = {};

        errorLogs.forEach(log => {
            // 모델별 에러
            const model = log.apilog_model || 'Unknown';
            errorByModel[model] = (errorByModel[model] || 0) + 1;

            // 서비스별 에러
            const service = log.apilog_service_type || 'Unknown';
            errorByService[service] = (errorByService[service] || 0) + 1;

            // 시간별 에러
            const hour = new Date(log.apilog_timestamp).getHours();
            errorOverTime[hour] = (errorOverTime[hour] || 0) + 1;
        });

        return {
            errorByModel: Object.entries(errorByModel).sort(([, a], [, b]) => b - a),
            errorByService: Object.entries(errorByService).sort(([, a], [, b]) => b - a),
            errorOverTime,
            totalErrors: errorLogs.length
        };
    };

    const timelineData = getTimelineData();
    const modelUsageData = getModelUsageData();
    const responseTimeData = getResponseTimeDistribution();
    const errorAnalysis = getErrorAnalysis();

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    return (
        <TabContainer>
            <TabHeader>
                <TabTitle>📈 고급 분석</TabTitle>
                <TabDescription>
                    상세한 사용 패턴과 성능 트렌드를 분석합니다
                </TabDescription>
            </TabHeader>

            <TabContent>
                {/* 분석 유형 선택 */}
                <AnalysisSelector>
                    <SelectorTitle>분석 유형 선택</SelectorTitle>
                    <SelectorButtons>
                        <SelectorButton
                            active={selectedAnalysis === 'timeline'}
                            onClick={() => setSelectedAnalysis('timeline')}
                        >
                            📊 시간대별 분석
                        </SelectorButton>
                        {/* <SelectorButton
                            active={selectedAnalysis === 'models'}
                            onClick={() => setSelectedAnalysis('models')}
                        >
                            🤖 모델 사용량
                        </SelectorButton> */}
                        <SelectorButton
                            active={selectedAnalysis === 'performance'}
                            onClick={() => setSelectedAnalysis('performance')}
                        >
                            ⚡ 성능 분포
                        </SelectorButton>
                        <SelectorButton
                            active={selectedAnalysis === 'errors'}
                            onClick={() => setSelectedAnalysis('errors')}
                        >
                            🚨 에러 분석
                        </SelectorButton>
                    </SelectorButtons>
                </AnalysisSelector>

                {/* 선택된 분석 내용 */}
                <AnalysisContent>
                    {selectedAnalysis === 'timeline' && (
                        <AnalysisSection>
                            <SectionTitle>📊 시간대별 요청 패턴</SectionTitle>
                            <AnalysisGrid>
                                <ChartContainer>
                                    {timelineData ? (
                                        <Line data={timelineData} options={chartOptions} />
                                    ) : (
                                        <NoDataMessage>시간대별 데이터가 없습니다</NoDataMessage>
                                    )}
                                </ChartContainer>
                                <InsightsPanel>
                                    <InsightsTitle>📈 인사이트</InsightsTitle>
                                    <InsightsList>
                                        {timelineData && (
                                            <>
                                                <InsightItem>
                                                    <InsightIcon>🕐</InsightIcon>
                                                    <InsightText>
                                                        요청이 가장 많은 시간대: {
                                                            timelineData.datasets[0].data.indexOf(
                                                                Math.max(...timelineData.datasets[0].data)
                                                            )
                                                        }:00
                                                    </InsightText>
                                                </InsightItem>
                                                <InsightItem>
                                                    <InsightIcon>😴</InsightIcon>
                                                    <InsightText>
                                                        요청이 가장 적은 시간대: {
                                                            timelineData.datasets[0].data.indexOf(
                                                                Math.min(...timelineData.datasets[0].data.filter(v => v > 0))
                                                            )
                                                        }:00
                                                    </InsightText>
                                                </InsightItem>
                                                <InsightItem>
                                                    <InsightIcon>📈</InsightIcon>
                                                    <InsightText>
                                                        일일 평균 요청: {
                                                            (timelineData.datasets[0].data.reduce((a, b) => a + b, 0) / 24).toFixed(1)
                                                        }건/시간
                                                    </InsightText>
                                                </InsightItem>
                                            </>
                                        )}
                                    </InsightsList>
                                </InsightsPanel>
                            </AnalysisGrid>
                        </AnalysisSection>
                    )}

                    {selectedAnalysis === 'models' && (
                        <AnalysisSection>
                            <SectionTitle>🤖 모델별 사용량 분석</SectionTitle>
                            <AnalysisGrid>
                                <ChartContainer>
                                    {modelUsageData ? (
                                        <Bar data={modelUsageData} options={chartOptions} />
                                    ) : (
                                        <NoDataMessage>모델 사용량 데이터가 없습니다</NoDataMessage>
                                    )}
                                </ChartContainer>
                                <InsightsPanel>
                                    <InsightsTitle>📊 통계</InsightsTitle>
                                    {modelUsageData && (
                                        <ModelStats>
                                            <StatRow>
                                                <StatLabel>총 모델 수</StatLabel>
                                                <StatValue>{modelUsageData.labels.length}개</StatValue>
                                            </StatRow>
                                            <StatRow>
                                                <StatLabel>가장 인기 모델</StatLabel>
                                                <StatValue>{modelUsageData.labels[0]}</StatValue>
                                            </StatRow>
                                            <StatRow>
                                                <StatLabel>사용량</StatLabel>
                                                <StatValue>
                                                    {modelUsageData.datasets[0].data[0]}회
                                                    ({((modelUsageData.datasets[0].data[0] /
                                                        modelUsageData.datasets[0].data.reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%)
                                                </StatValue>
                                            </StatRow>
                                        </ModelStats>
                                    )}
                                </InsightsPanel>
                            </AnalysisGrid>
                        </AnalysisSection>
                    )}

                    {selectedAnalysis === 'performance' && (
                        <AnalysisSection>
                            <SectionTitle>⚡ 응답시간 분포 분석</SectionTitle>
                            <AnalysisGrid>
                                <ChartContainer>
                                    {responseTimeData ? (
                                        <Doughnut
                                            data={responseTimeData}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: {
                                                        position: 'right',
                                                    },
                                                }
                                            }}
                                        />
                                    ) : (
                                        <NoDataMessage>응답시간 분포 데이터가 없습니다</NoDataMessage>
                                    )}
                                </ChartContainer>
                                <InsightsPanel>
                                    <InsightsTitle>⚡ 성능 요약</InsightsTitle>
                                    {responseTimeData && (
                                        <PerformanceStats>
                                            <StatRow>
                                                <StatLabel>빠른 응답 (&lt; 9s)</StatLabel>
                                                <StatValue good>
                                                    {(((responseTimeData.datasets[0].data[0] + responseTimeData.datasets[0].data[1] + responseTimeData.datasets[0].data[2]) /
                                                        responseTimeData.datasets[0].data.reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%
                                                </StatValue>
                                            </StatRow>
                                            <StatRow>
                                                <StatLabel>보통 응답 (9s-15s)</StatLabel>
                                                <StatValue>
                                                    {(((responseTimeData.datasets[0].data[3] + responseTimeData.datasets[0].data[4]) /
                                                        responseTimeData.datasets[0].data.reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%
                                                </StatValue>
                                            </StatRow>
                                            <StatRow>
                                                <StatLabel>느린 응답 (&gt; 15s)</StatLabel>
                                                <StatValue warning>
                                                    {(((responseTimeData.datasets[0].data[5] + responseTimeData.datasets[0].data[6] + responseTimeData.datasets[0].data[7]) /
                                                        responseTimeData.datasets[0].data.reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%
                                                </StatValue>
                                            </StatRow>
                                        </PerformanceStats>
                                    )}
                                </InsightsPanel>
                            </AnalysisGrid>
                        </AnalysisSection>
                    )}

                    {selectedAnalysis === 'errors' && (
                        <AnalysisSection>
                            <SectionTitle>🚨 에러 분석 리포트</SectionTitle>
                            {errorAnalysis ? (
                                <ErrorAnalysisGrid>
                                    <ErrorCard>
                                        <ErrorCardTitle>모델별 에러</ErrorCardTitle>
                                        <ErrorList>
                                            {errorAnalysis.errorByModel.slice(0, 5).map(([model, count]) => (
                                                <ErrorItem key={model}>
                                                    <ErrorLabel>{model}</ErrorLabel>
                                                    <ErrorCount>{count}건</ErrorCount>
                                                </ErrorItem>
                                            ))}
                                        </ErrorList>
                                    </ErrorCard>

                                    <ErrorCard>
                                        <ErrorCardTitle>서비스별 에러</ErrorCardTitle>
                                        <ErrorList>
                                            {errorAnalysis.errorByService.slice(0, 5).map(([service, count]) => (
                                                <ErrorItem key={service}>
                                                    <ErrorLabel>{service}</ErrorLabel>
                                                    <ErrorCount>{count}건</ErrorCount>
                                                </ErrorItem>
                                            ))}
                                        </ErrorList>
                                    </ErrorCard>

                                    <ErrorCard>
                                        <ErrorCardTitle>에러 요약</ErrorCardTitle>
                                        <ErrorSummary>
                                            <SummaryRow>
                                                <SummaryLabel>총 에러 수</SummaryLabel>
                                                <SummaryValue error>{errorAnalysis.totalErrors}건</SummaryValue>
                                            </SummaryRow>
                                            <SummaryRow>
                                                <SummaryLabel>에러율</SummaryLabel>
                                                <SummaryValue error>
                                                    {((errorAnalysis.totalErrors / filteredLogs.length) * 100).toFixed(2)}%
                                                </SummaryValue>
                                            </SummaryRow>
                                        </ErrorSummary>
                                    </ErrorCard>
                                </ErrorAnalysisGrid>
                            ) : (
                                <NoDataMessage>에러 분석 데이터가 없습니다</NoDataMessage>
                            )}
                        </AnalysisSection>
                    )}
                </AnalysisContent>

                {/* 전체 요약 */}
                {stats && (
                    <SummarySection>
                        <SummaryTitle>📋 분석 요약</SummaryTitle>
                        <SummaryCards>
                            <SummaryCard>
                                <SummaryCardIcon>📊</SummaryCardIcon>
                                <SummaryCardContent>
                                    <SummaryCardTitle>데이터 볼륨</SummaryCardTitle>
                                    <SummaryCardValue>{stats.totalRequests.toLocaleString()}건</SummaryCardValue>
                                    <SummaryCardDetail>총 API 요청</SummaryCardDetail>
                                </SummaryCardContent>
                            </SummaryCard>

                            <SummaryCard>
                                <SummaryCardIcon>⚡</SummaryCardIcon>
                                <SummaryCardContent>
                                    <SummaryCardTitle>평균 성능</SummaryCardTitle>
                                    <SummaryCardValue>{stats.avgResponseTime}ms</SummaryCardValue>
                                    <SummaryCardDetail>응답시간</SummaryCardDetail>
                                </SummaryCardContent>
                            </SummaryCard>

                            <SummaryCard>
                                <SummaryCardIcon>✅</SummaryCardIcon>
                                <SummaryCardContent>
                                    <SummaryCardTitle>안정성</SummaryCardTitle>
                                    <SummaryCardValue>{stats.successRate}%</SummaryCardValue>
                                    <SummaryCardDetail>성공률</SummaryCardDetail>
                                </SummaryCardContent>
                            </SummaryCard>

                            <SummaryCard>
                                <SummaryCardIcon>👥</SummaryCardIcon>
                                <SummaryCardContent>
                                    <SummaryCardTitle>사용자</SummaryCardTitle>
                                    <SummaryCardValue>{stats.uniqueUsers}</SummaryCardValue>
                                    <SummaryCardDetail>고유 사용자</SummaryCardDetail>
                                </SummaryCardContent>
                            </SummaryCard>
                        </SummaryCards>
                    </SummarySection>
                )}
            </TabContent>
        </TabContainer>
    );
};

// 스타일 컴포넌트들 (다음 응답에서 계속)
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
    padding: 2rem 0;
  }
`;

const AnalysisSelector = styled.div`
  background: var(--bg-secondary);
  border-radius: 0.75rem;
  padding: 2.2rem;
  margin-bottom: 2.8rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.3);
  border: 1px solid var(--border-light);
  
  @media (max-width: 768px) {
    padding: 2rem;
    margin-bottom: 2.5rem;
  }
`;

const SelectorTitle = styled.h3`
  margin: 0 0 1.8rem 0;
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--text-primary);
  
  @media (max-width: 768px) {
    font-size: 1.6rem;
    margin-bottom: 1.5rem;
  }
`;

const SelectorButtons = styled.div`
  display: flex;
  gap: 1.4rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: 1.2rem;
  }
`;

const SelectorButton = styled.button`
  padding: 1rem 1.8rem;
  border: 1px solid ${props => props.active ? 'var(--primary-blue)' : 'var(--border-light)'};
  background: ${props => props.active ? 'var(--primary-blue)' : 'var(--bg-tertiary)'};
  color: ${props => props.active ? 'var(--text-primary)' : 'var(--text-secondary)'};
  border-radius: 0.5rem;
  font-size: 1.4rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--primary-blue);
    ${props => !props.active && `background: var(--bg-secondary); color: var(--text-primary);`}
  }
  
  @media (max-width: 768px) {
    padding: 0.9rem 1.6rem;
    font-size: 1.3rem;
  }
`;

const AnalysisContent = styled.div`
  margin-bottom: 2.8rem;
  
  @media (max-width: 768px) {
    margin-bottom: 2.5rem;
  }
`;

const AnalysisSection = styled.div`
  background: var(--bg-secondary);
  border-radius: 0.75rem;
  padding: 2.8rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.3);
  border: 1px solid var(--border-light);
  
  @media (max-width: 768px) {
    padding: 2.5rem;
  }
`;

const SectionTitle = styled.h3`
  margin: 0 0 2.2rem 0;
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-primary);
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
    margin-bottom: 2rem;
  }
`;

const AnalysisGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2.8rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }
`;

const ChartContainer = styled.div`
  height: 450px;
  position: relative;
  
  @media (max-width: 768px) {
    height: 400px;
  }
`;

const InsightsPanel = styled.div`
  background: var(--bg-tertiary);
  border-radius: 0.75rem;
  padding: 2.2rem;
  border: 1px solid var(--border-light);
  
  @media (max-width: 768px) {
    padding: 2rem;
  }
`;

const InsightsTitle = styled.h4`
  margin: 0 0 1.8rem 0;
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--text-primary);
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }
`;

const InsightsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
  
  @media (max-width: 768px) {
    gap: 1.2rem;
  }
`;

const InsightItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  
  @media (max-width: 768px) {
    gap: 0.8rem;
  }
`;

const InsightIcon = styled.span`
  font-size: 1.8rem;
  margin-top: 0.2rem;
  
  @media (max-width: 768px) {
    font-size: 1.6rem;
  }
`;

const InsightText = styled.span`
  font-size: 1.4rem;
  color: var(--text-secondary);
  line-height: 1.5;
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
`;

const ModelStats = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
  @media (max-width: 768px) {
    gap: 0.8rem;
  }
`;

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-light);
  
  &:last-child {
    border-bottom: none;
  }
`;

const StatLabel = styled.span`
  font-size: 1.4rem;
  color: var(--text-secondary);
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
`;

const StatValue = styled.span`
  font-size: 1.4rem;
  font-weight: 600;
  color: ${props => {
        if (props.good) return 'var(--success)';
        if (props.warning) return 'var(--warning)';
        if (props.error) return 'var(--warning)';
        return 'var(--text-primary)';
    }};
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
`;

const PerformanceStats = styled(ModelStats)``;

const ErrorAnalysisGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2.2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const ErrorCard = styled.div`
  background: var(--bg-tertiary);
  border: 1px solid var(--warning);
  border-radius: 0.75rem;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1.8rem;
  }
`;

const ErrorCardTitle = styled.h4`
  margin: 0 0 1.4rem 0;
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--warning);
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 1.2rem;
  }
`;

const ErrorList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
  @media (max-width: 768px) {
    gap: 0.8rem;
  }
`;

const ErrorItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 0;
  border-bottom: 1px solid var(--border-light);

  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: 768px) {
    padding: 0.7rem 0;
  }
`;

const ErrorLabel = styled.span`
  font-size: 1.3rem;
  color: var(--text-secondary);
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const ErrorCount = styled.span`
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--warning);
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const ErrorSummary = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
  @media (max-width: 768px) {
    gap: 0.8rem;
  }
`;

const SummaryRow = styled(StatRow)``;
const SummaryLabel = styled(StatLabel)``;
const SummaryValue = styled(StatValue)``;

const SummarySection = styled.div`
  background: var(--bg-secondary);
  border-radius: 0.75rem;
  padding: 2.8rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.3);
  border: 1px solid var(--border-light);
  
  @media (max-width: 768px) {
    padding: 2.5rem;
  }
`;

const SummaryTitle = styled.h3`
  margin: 0 0 2.2rem 0;
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-primary);
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
    margin-bottom: 2rem;
  }
`;

const SummaryCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.8rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const SummaryCard = styled.div`
  display: flex;
  align-items: center;
  gap: 1.4rem;
  padding: 2rem;
  background: var(--bg-tertiary);
  border-radius: 0.75rem;
  border: 1px solid var(--border-light);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.4);
  }
  
  @media (max-width: 768px) {
    padding: 1.8rem;
    gap: 1.2rem;
  }
`;

const SummaryCardIcon = styled.span`
  font-size: 2.8rem;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const SummaryCardContent = styled.div`
  flex: 1;
`;

const SummaryCardTitle = styled.div`
  font-size: 1.3rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const SummaryCardValue = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.3rem;
  
  @media (max-width: 768px) {
    font-size: 1.6rem;
  }
`;

const SummaryCardDetail = styled.div`
  font-size: 1.2rem;
  color: var(--text-tertiary);
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const NoDataMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-tertiary);
  font-size: 1.6rem;
  
  @media (max-width: 768px) {
    font-size: 1.4rem;
  }
`;

export default AnalyticsTab;

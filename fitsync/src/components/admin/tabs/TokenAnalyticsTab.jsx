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
} from 'chart.js';
import { useTokenAnalytics } from '../../../hooks/admin/useTokenAnalytics';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const TokenAnalyticsTab = ({ logs, filteredLogs, isLoading, dateRange, subscriberInfo }) => {
    const tokenAnalytics = useTokenAnalytics(logs, filteredLogs);
    const [selectedPeriod, setSelectedPeriod] = useState('daily');
    const [selectedView, setSelectedView] = useState('cost'); // tokens, cost

    if (isLoading || !tokenAnalytics) {
        return (
            <LoadingContainer>
                <div>토큰 분석 데이터를 로딩중...</div>
            </LoadingContainer>
        );
    }

    const { overallStats, dailyData, weeklyData, monthlyData, userAnalysis, modelAnalysis, hourlyPattern, projections, todayStats } = tokenAnalytics;

    // 기간별 데이터 선택
    const getPeriodData = () => {
        switch (selectedPeriod) {
            case 'daily': return dailyData;
            case 'weekly': return weeklyData;
            case 'monthly': return monthlyData;
            default: return dailyData;
        }
    };

    const periodData = getPeriodData();

    // 차트 데이터 설정
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#ffffff',
                    font: { size: 12 }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(42, 42, 42, 0.9)',
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                borderColor: '#4A90E2',
                borderWidth: 1
            }
        },
        scales: {
            x: {
                ticks: { color: '#b0b0b0', font: { size: 11 } },
                grid: { color: 'rgba(255, 255, 255, 0.1)' }
            },
            y: {
                ticks: { color: '#b0b0b0', font: { size: 11 } },
                grid: { color: 'rgba(255, 255, 255, 0.1)' }
            }
        }
    };

    // 토큰 사용량 차트 데이터
    const tokenUsageChartData = {
        labels: periodData.map(item => item.period),
        datasets: [
            {
                label: 'Input 토큰',
                data: periodData.map(item => item.inputTokens),
                borderColor: '#4A90E2',
                backgroundColor: 'rgba(74, 144, 226, 0.2)',
                fill: true
            },
            {
                label: 'Output 토큰',
                data: periodData.map(item => item.outputTokens),
                borderColor: '#F44336',
                backgroundColor: 'rgba(244, 67, 54, 0.2)',
                fill: true
            }
        ]
    };

    // 비용 차트 데이터
    const costChartData = {
        labels: periodData.map(item => item.period),
        datasets: [
            {
                label: `비용 (${selectedView === 'cost' ? 'KRW' : 'USD'})`,
                data: periodData.map(item => selectedView === 'cost' ? item.costKRW : item.costUSD),
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                fill: true
            }
        ]
    };

    // 모델별 사용량 도넛 차트
    const modelUsageData = {
        labels: modelAnalysis.map(model => model.model),
        datasets: [
            {
                data: modelAnalysis.map(model => model.totalTokens),
                backgroundColor: [
                    '#4A90E2',
                    '#F44336',
                    '#4CAF50',
                    '#FF9800',
                    '#9C27B0',
                    '#607D8B'
                ],
                borderWidth: 2,
                borderColor: '#2a2a2a'
            }
        ]
    };

    // 시간대별 사용 패턴 차트
    const hourlyPatternData = {
        labels: hourlyPattern.map(item => `${item.hour}시`),
        datasets: [
            {
                label: '요청 수',
                data: hourlyPattern.map(item => item.requests),
                backgroundColor: 'rgba(74, 144, 226, 0.6)',
                borderColor: '#4A90E2',
                borderWidth: 1
            }
        ]
    };

    return (
        <Container>
            {/* 오늘의 핵심 지표 */}
            <TodaySection>
                {/* <TodaySectionTitle>오늘의 핵심 지표</TodaySectionTitle> */}
                <TodayStatsGrid>
                    <TodayStatCard>
                        <TodayStatIcon>🔥</TodayStatIcon>
                        <TodayStatContent>
                            <TodayStatTitle>금일 총 요청</TodayStatTitle>
                            <TodayStatValue>{todayStats.totalRequests.toLocaleString()}</TodayStatValue>
                            <TodayStatSubtext>실시간 API 호출</TodayStatSubtext>
                        </TodayStatContent>
                    </TodayStatCard>

                    <TodayStatCard>
                        <TodayStatIcon>💰</TodayStatIcon>
                        <TodayStatContent>
                            <TodayStatTitle>금일 비용</TodayStatTitle>
                            <TodayStatValue>₩{todayStats.totalCostKRW.toLocaleString()}</TodayStatValue>
                            <TodayStatSubtext>${todayStats.totalCostUSD.toFixed(2)}</TodayStatSubtext>
                        </TodayStatContent>
                    </TodayStatCard>

                    <TodayStatCard>
                        <TodayStatIcon>🎯</TodayStatIcon>
                        <TodayStatContent>
                            <TodayStatTitle>금일 성공률</TodayStatTitle>
                            <TodayStatValue>{todayStats.successRate}%</TodayStatValue>
                            <TodayStatSubtext>평균 응답: {todayStats.avgResponseTime}초</TodayStatSubtext>
                        </TodayStatContent>
                    </TodayStatCard>

                    <TodayStatCard>
                        <TodayStatIcon>💳</TodayStatIcon>
                        <TodayStatContent>
                            <TodayStatTitle>현재 구독자</TodayStatTitle>
                            <TodayStatValue>{subscriberInfo?.total?.toLocaleString() || 0}</TodayStatValue>
                            <TodayStatSubtext>Premium 이용자</TodayStatSubtext>
                        </TodayStatContent>
                    </TodayStatCard>
                </TodayStatsGrid>
            </TodaySection>

            {/* 통계 요약 카드 */}
            <StatsGrid>
                <StatCard>
                    <StatTitle>총 토큰 사용량</StatTitle>
                    <StatValue>{overallStats.totalTokens.toLocaleString()}</StatValue>
                    <StatSubtext>
                        Input: {overallStats.totalInputTokens.toLocaleString()} | 
                        Output: {overallStats.totalOutputTokens.toLocaleString()}
                    </StatSubtext>
                </StatCard>
                
                <StatCard>
                    <StatTitle>총 비용</StatTitle>
                    <StatValue>₩{overallStats.totalCostKRW.toLocaleString()}</StatValue>
                    <StatSubtext>${overallStats.totalCostUSD.toFixed(2)}</StatSubtext>
                </StatCard>
                
                <StatCard>
                    <StatTitle>평균 비용/요청</StatTitle>
                    <StatValue>₩{Math.round(overallStats.avgCostPerRequest * 1300).toLocaleString()}</StatValue>
                    <StatSubtext>${overallStats.avgCostPerRequest.toFixed(4)}</StatSubtext>
                </StatCard>
                
                <StatCard>
                    <StatTitle>평균 토큰/요청</StatTitle>
                    <StatValue>{overallStats.avgTokensPerRequest.toLocaleString()}</StatValue>
                    <StatSubtext>요청당 평균</StatSubtext>
                </StatCard>
            </StatsGrid>

            {/* 예측 정보 */}
            {projections && (
                <ProjectionCard>
                    <h3>비용 예측 (최근 7일 평균 기준)</h3>
                    <ProjectionGrid>
                        <div>
                            <span>일간 예상:</span>
                            <strong>₩{projections.dailyAvgCost.toLocaleString()}</strong>
                        </div>
                        <div>
                            <span>주간 예상:</span>
                            <strong>₩{projections.weeklyProjection.toLocaleString()}</strong>
                        </div>
                        <div>
                            <span>월간 예상:</span>
                            <strong>₩{projections.monthlyProjection.toLocaleString()}</strong>
                        </div>
                        <div>
                            <span>연간 예상:</span>
                            <strong>₩{projections.yearlyProjection.toLocaleString()}</strong>
                        </div>
                    </ProjectionGrid>
                </ProjectionCard>
            )}

            {/* 필터 컨트롤 */}
            <ControlPanel>
                <ControlGroup>
                    <label>기간:</label>
                    <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
                        <option value="daily">일간</option>
                        <option value="weekly">주간</option>
                        <option value="monthly">월간</option>
                    </select>
                </ControlGroup>
                
                <ControlGroup>
                    <label>표시:</label>
                    <select value={selectedView} onChange={(e) => setSelectedView(e.target.value)}>
                        <option value="cost">비용</option>
                        <option value="tokens">토큰</option>
                    </select>
                </ControlGroup>
            </ControlPanel>

            {/* 차트 그리드 */}
            <ChartsGrid>
                {/* 기간별 토큰 사용량 */}
                {/* <ChartCard>
                    <ChartTitle>{selectedPeriod === 'daily' ? '일간' : selectedPeriod === 'weekly' ? '주간' : '월간'} 토큰 사용량</ChartTitle>
                    <ChartContainer>
                        <Line data={tokenUsageChartData} options={chartOptions} />
                    </ChartContainer>
                </ChartCard> */}

                {/* 기간별 비용 */}
                <ChartCard>
                    <ChartTitle>{selectedPeriod === 'daily' ? '일간' : selectedPeriod === 'weekly' ? '주간' : '월간'} 비용</ChartTitle>
                    <ChartContainer>
                        <Line data={costChartData} options={chartOptions} />
                    </ChartContainer>
                </ChartCard>

                {/* 모델별 사용량 */}
                {/* <ChartCard>
                    <ChartTitle>모델별 토큰 사용량</ChartTitle>
                    <ChartContainer>
                        <Doughnut 
                            data={modelUsageData} 
                            options={{
                                ...chartOptions,
                                scales: undefined
                            }} 
                        />
                    </ChartContainer>
                </ChartCard> */}

                {/* 시간대별 패턴 */}
                {/* <ChartCard>
                    <ChartTitle>시간대별 요청 패턴</ChartTitle>
                    <ChartContainer>
                        <Bar data={hourlyPatternData} options={chartOptions} />
                    </ChartContainer>
                </ChartCard> */}
            </ChartsGrid>

            {/* 상세 테이블 */}
            <TablesContainer>
                {/* 모델별 상세 분석 */}
                <TableCard>
                    <h3>모델별 상세 분석</h3>
                    <Table>
                        <thead>
                            <tr>
                                <th>모델</th>
                                <th>요청 수</th>
                                <th>총 토큰</th>
                                <th>평균 토큰/요청</th>
                                <th>총 비용 (KRW)</th>
                                <th>평균 비용/요청</th>
                            </tr>
                        </thead>
                        <tbody>
                            {modelAnalysis.map((model, index) => (
                                <tr key={index}>
                                    <td>{model.model}</td>
                                    <td>{model.requests.toLocaleString()}</td>
                                    <td>{model.totalTokens.toLocaleString()}</td>
                                    <td>{model.avgTokensPerRequest.toLocaleString()}</td>
                                    <td>₩{model.costKRW.toLocaleString()}</td>
                                    <td>₩{Math.round(model.avgCostPerRequest * 1300).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </TableCard>

                {/* 사용자별 상위 분석 */}
                <TableCard>
                    <h3>사용자별 상위 10명</h3>
                    <Table>
                        <thead>
                            <tr>
                                <th>사용자 ID</th>
                                <th>요청 수</th>
                                <th>총 토큰</th>
                                <th>총 비용 (KRW)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {userAnalysis.slice(0, 10).map((user, index) => (
                                <tr key={index}>
                                    <td>{user.userId}</td>
                                    <td>{user.requests.toLocaleString()}</td>
                                    <td>{user.totalTokens.toLocaleString()}</td>
                                    <td>₩{user.costKRW.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </TableCard>
            </TablesContainer>
        </Container>
    );
};

const Container = styled.div`
    color: var(--text-primary);
`;

const LoadingContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 400px;
    color: var(--text-secondary);
`;

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
`;

const StatCard = styled.div`
    background: var(--bg-secondary);
    padding: 20px;
    border-radius: 12px;
    border: 1px solid var(--border-light);
`;

const StatTitle = styled.h3`
    font-size: 1.4rem;
    color: var(--text-secondary);
    margin-bottom: 10px;
`;

const StatValue = styled.div`
    font-size: 2.4rem;
    font-weight: bold;
    color: var(--primary-blue);
    margin-bottom: 5px;
`;

const StatSubtext = styled.div`
    font-size: 1.2rem;
    color: var(--text-tertiary);
`;

const ProjectionCard = styled.div`
    background: var(--bg-secondary);
    padding: 20px;
    border-radius: 12px;
    border: 1px solid var(--border-light);
    margin-bottom: 30px;

    h3 {
        font-size: 1.6rem;
        margin-bottom: 15px;
        color: var(--text-primary);
    }
`;

const ProjectionGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;

    div {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        background: var(--bg-tertiary);
        border-radius: 8px;

        span {
            color: var(--text-secondary);
            font-size: 1.3rem;
        }

        strong {
            color: var(--primary-blue);
            font-size: 1.4rem;
        }
    }
`;

const ControlPanel = styled.div`
    display: flex;
    gap: 20px;
    margin-bottom: 30px;
`;

const ControlGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;

    label {
        font-size: 1.4rem;
        color: var(--text-secondary);
    }

    select {
        background: var(--bg-secondary);
        color: var(--text-primary);
        border: 1px solid var(--border-light);
        border-radius: 6px;
        padding: 8px 12px;
        font-size: 1.3rem;
    }
`;

const ChartsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 20px;
    margin-bottom: 40px;
`;

const ChartCard = styled.div`
    background: var(--bg-secondary);
    padding: 20px;
    border-radius: 12px;
    border: 1px solid var(--border-light);
`;

const ChartTitle = styled.h3`
    font-size: 1.6rem;
    margin-bottom: 20px;
    color: var(--text-primary);
`;

const ChartContainer = styled.div`
    height: 300px;
    width: 100%;
`;

const TablesContainer = styled.div`
    display: grid;
    grid-template-columns: 1fr;
    gap: 30px;
`;

const TableCard = styled.div`
    background: var(--bg-secondary);
    padding: 20px;
    border-radius: 12px;
    border: 1px solid var(--border-light);

    h3 {
        font-size: 1.6rem;
        margin-bottom: 20px;
        color: var(--text-primary);
    }
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;

    th, td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid var(--border-light);
        font-size: 1.3rem;
    }

    th {
        background: var(--bg-tertiary);
        color: var(--text-secondary);
        font-weight: 600;
    }

    td {
        color: var(--text-primary);
    }

    tr:hover {
        background: var(--bg-tertiary);
    }
`;

// 오늘의 데이터 관련 스타일
const TodaySection = styled.div`
    background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
    padding: 25px;
    border-radius: 16px;
    border: 2px solid var(--primary-blue);
    margin-bottom: 30px;
    box-shadow: 0 8px 24px rgba(74, 144, 226, 0.15);
`;

const TodaySectionTitle = styled.h2`
    font-size: 2.2rem;
    font-weight: 700;
    color: var(--primary-blue);
    margin-bottom: 20px;
    text-align: center;
    background: linear-gradient(135deg, var(--primary-blue), var(--primary-blue-light));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
`;

const TodayStatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
`;

const TodayStatCard = styled.div`
    background: ${props => props.highlight ? 
        'linear-gradient(135deg, rgba(74, 144, 226, 0.15) 0%, rgba(74, 144, 226, 0.05) 100%)' : 
        'var(--bg-primary)'};
    padding: 20px;
    border-radius: 12px;
    border: 1px solid ${props => props.highlight ? 'var(--primary-blue)' : 'var(--border-light)'};
    display: flex;
    align-items: center;
    gap: 15px;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 12px 28px rgba(74, 144, 226, 0.2);
        border-color: var(--primary-blue);
    }

    ${props => props.highlight && `
        &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, var(--primary-blue), var(--primary-blue-light));
        }
    `}
`;

const TodayStatIcon = styled.div`
    font-size: 3.5rem;
    min-width: 60px;
    text-align: center;
    filter: drop-shadow(0 2px 4px rgba(74, 144, 226, 0.3));
`;

const TodayStatContent = styled.div`
    flex: 1;
`;

const TodayStatTitle = styled.h3`
    font-size: 1.4rem;
    color: var(--text-secondary);
    margin-bottom: 8px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const TodayStatValue = styled.div`
    font-size: 2.8rem;
    font-weight: 700;
    color: var(--primary-blue);
    margin-bottom: 5px;
    line-height: 1;
    text-shadow: 0 2px 4px rgba(74, 144, 226, 0.2);
`;

const TodayStatSubtext = styled.div`
    font-size: 1.2rem;
    color: var(--text-tertiary);
    font-weight: 400;
`;

export default TokenAnalyticsTab;

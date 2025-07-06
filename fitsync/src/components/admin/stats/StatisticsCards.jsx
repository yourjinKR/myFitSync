import React from 'react';
import styled from 'styled-components';

// 주요 통계 카드 컴포넌트
const StatisticsCards = ({ stats, isLoading }) => {
    if (isLoading) {
        return (
            <CardsContainer>
                <LoadingCard>
                    <LoadingMessage>통계를 계산 중...</LoadingMessage>
                </LoadingCard>
            </CardsContainer>
        );
    }

    if (!stats) {
        return (
            <CardsContainer>
                <ErrorCard>
                    <ErrorMessage>통계 데이터를 불러올 수 없습니다.</ErrorMessage>
                </ErrorCard>
            </CardsContainer>
        );
    }

    const {
        totalRequests,
        successCount,
        errorCount,
        exceptionCount,
        successRate,
        errorRate,
        avgResponseTime,
        totalTokens,
        totalTime,
        uniqueUsers
    } = stats;

    // 문자열 값들을 숫자로 변환 (통계 훅에서 문자열로 저장되어 있을 수 있음)
    const totalTimeNumber = parseFloat(totalTime) || 0;
    const avgResponseTimeNumber = parseFloat(avgResponseTime) || 0;
    const errorRateNumber = parseFloat(errorRate) || 0;

    return (
        <CardsContainer>
            {/* 총 요청 수 */}
            <StatCard>
                <CardIcon>📊</CardIcon>
                <CardContent>
                    <CardTitle>총 요청</CardTitle>
                    <CardValue>{totalRequests.toLocaleString()}</CardValue>
                    <CardSubtext>전체 API 호출 수</CardSubtext>
                </CardContent>
            </StatCard>

            {/* 성공률 */}
            <StatCard success={successRate >= 95}>
                <CardIcon>{successRate >= 90 ? '✅' : successRate >= 80 ? '⚠️' : '❌'}</CardIcon>
                <CardContent>
                    <CardTitle>성공률</CardTitle>
                    <CardValue success={successRate >= 95}>
                        {successRate}%
                    </CardValue>
                    <CardSubtext>
                        성공: {successCount.toLocaleString()}건
                    </CardSubtext>
                </CardContent>
            </StatCard>

            {/* 평균 응답시간 */}
            <StatCard fast={avgResponseTimeNumber <= 500}>
                <CardIcon>{avgResponseTimeNumber <= 500 ? '🚀' : avgResponseTimeNumber <= 1000 ? '⏱️' : '🐌'}</CardIcon>
                <CardContent>
                    <CardTitle>평균 응답시간</CardTitle>
                    <CardValue fast={avgResponseTimeNumber <= 500}>
                        {avgResponseTime}초
                    </CardValue>
                    <CardSubtext>
                        {avgResponseTimeNumber <= 5 ? '매우 빠름' :
                            avgResponseTimeNumber <= 10 ? '보통' : '개선 필요'}
                    </CardSubtext>
                </CardContent>
            </StatCard>

            {/* 오류율 */}
            <StatCard error={errorRateNumber > 5}>
                <CardIcon>{errorRateNumber <= 1 ? '🛡️' : errorRateNumber <= 5 ? '⚠️' : '🚨'}</CardIcon>
                <CardContent>
                    <CardTitle>오류율</CardTitle>
                    <CardValue error={errorRateNumber > 5}>
                        {errorRate}%
                    </CardValue>
                    <CardSubtext>
                        오류: {errorCount.toLocaleString()}건 / 예외: {exceptionCount.toLocaleString()}건
                    </CardSubtext>
                </CardContent>
            </StatCard>

            {/* 토큰 사용량 */}
            <StatCard>
                <CardIcon>💎</CardIcon>
                <CardContent>
                    <CardTitle>총 토큰</CardTitle>
                    <CardValue>{totalTokens.toLocaleString()}</CardValue>
                    <CardSubtext>
                        평균: {totalRequests > 0 ? Math.round(totalTokens / totalRequests).toLocaleString() : 0}토큰/요청
                    </CardSubtext>
                </CardContent>
            </StatCard>

            {/* 사용자 수 */}
            <StatCard>
                <CardIcon>👥</CardIcon>
                <CardContent>
                    <CardTitle>고유 사용자</CardTitle>
                    <CardValue>{uniqueUsers.toLocaleString()}</CardValue>
                    <CardSubtext>
                        평균: {uniqueUsers > 0 ? (totalRequests / uniqueUsers).toFixed(1) : 0}요청/사용자
                    </CardSubtext>
                </CardContent>
            </StatCard>

            {/* 총 처리시간 */}
            <StatCard>
                <CardIcon>⏰</CardIcon>
                <CardContent>
                    <CardTitle>총 처리시간</CardTitle>
                    <CardValue>{totalTime}초</CardValue>
                    <CardSubtext>
                        {totalTimeNumber >= 3600 ? `${(totalTimeNumber / 3600).toFixed(1)}시간` :
                            totalTimeNumber >= 60 ? `${(totalTimeNumber / 60).toFixed(1)}분` : '1분 미만'}
                    </CardSubtext>
                </CardContent>
            </StatCard>

            {/* 처리율 */}
            <StatCard>
                <CardIcon>📈</CardIcon>
                <CardContent>
                    <CardTitle>처리율</CardTitle>
                    <CardValue>
                        {totalTimeNumber > 0 ? (totalRequests / totalTimeNumber * 60).toFixed(1) : 0}
                    </CardValue>
                    <CardSubtext>요청/분</CardSubtext>
                </CardContent>
            </StatCard>
        </CardsContainer>
    );
};

// 스타일 컴포넌트
const CardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 16px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }

  ${props => props.success && `
    border-left: 4px solid #10b981;
    background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%);
  `}

  ${props => props.fast && `
    border-left: 4px solid #3b82f6;
    background: linear-gradient(135deg, #ffffff 0%, #eff6ff 100%);
  `}

  ${props => props.error && `
    border-left: 4px solid #ef4444;
    background: linear-gradient(135deg, #ffffff 0%, #fef2f2 100%);
  `}
`;

const CardIcon = styled.div`
  font-size: 32px;
  min-width: 48px;
  text-align: center;
`;

const CardContent = styled.div`
  flex: 1;
`;

const CardTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const CardValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 4px;
  color: ${props => {
        if (props.success) return '#059669';
        if (props.fast) return '#2563eb';
        if (props.error) return '#dc2626';
        return '#111827';
    }};
`;

const CardSubtext = styled.div`
  font-size: 12px;
  color: #9ca3af;
  line-height: 1.4;
`;

const LoadingCard = styled(StatCard)`
  grid-column: 1 / -1;
  justify-content: center;
  min-height: 120px;
`;

const LoadingMessage = styled.div`
  color: #6b7280;
  font-size: 16px;
`;

const ErrorCard = styled(StatCard)`
  grid-column: 1 / -1;
  justify-content: center;
  min-height: 120px;
  border-color: #fecaca;
  background: #fef2f2;
`;

const ErrorMessage = styled.div`
  color: #dc2626;
  font-size: 16px;
`;

export default StatisticsCards;

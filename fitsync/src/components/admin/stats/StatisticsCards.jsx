import React from 'react';
import styled from 'styled-components';

// 주요 통계 카드 컴포넌트
const StatisticsCards = ({ stats, isLoading, subscriberInfo }) => {
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
                <CardIcon>💰</CardIcon>
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
                    <CardTitle>누적 사용자</CardTitle>
                    <CardValue>{uniqueUsers.toLocaleString()}</CardValue>
                    <CardSubtext>
                        평균: {uniqueUsers > 0 ? (totalRequests / uniqueUsers).toFixed(1) : 0}요청/사용자
                    </CardSubtext>
                </CardContent>
            </StatCard>

            {/* 현재 구독자 수 */}
            <StatCard>
                <CardIcon>💎</CardIcon>
                <CardContent>
                    <CardTitle>현재 구독자</CardTitle>
                    <CardValue>{subscriberInfo?.total?.toLocaleString() || 0}</CardValue>
                    <CardSubtext>FitSync Premium 구독자</CardSubtext>
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
        </CardsContainer>
    );
};

// 스타일 컴포넌트
const CardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2.2rem;
  margin-bottom: 3.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
    margin-bottom: 3rem;
  }
`;

const StatCard = styled.div`
  background: var(--bg-secondary);
  border-radius: 0.75rem;
  padding: 2.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-light);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 2rem;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  }

  ${props => props.success && `
    border-left: 4px solid var(--success);
    background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
  `}

  ${props => props.fast && `
    border-left: 4px solid var(--primary-blue);
    background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
  `}

  ${props => props.error && `
    border-left: 4px solid var(--warning);
    background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
  `}
  
  @media (max-width: 768px) {
    padding: 2.2rem;
    gap: 1.8rem;
  }
`;

const CardIcon = styled.div`
  font-size: 4rem;
  min-width: 5.5rem;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 3.5rem;
    min-width: 5rem;
  }
`;

const CardContent = styled.div`
  flex: 1;
`;

const CardTitle = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 1.4rem;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
    margin-bottom: 0.8rem;
  }
`;

const CardValue = styled.div`
  font-size: 3.2rem;
  font-weight: 700;
  margin-bottom: 0.6rem;
  color: ${props => {
        if (props.success) return 'var(--success)';
        if (props.fast) return 'var(--primary-blue)';
        if (props.error) return 'var(--warning)';
        return 'var(--text-primary)';
    }};
  
  @media (max-width: 768px) {
    font-size: 2.8rem;
    margin-bottom: 0.5rem;
  }
`;

const CardSubtext = styled.div`
  font-size: 1.3rem;
  color: var(--text-tertiary);
  line-height: 1.4;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const LoadingCard = styled(StatCard)`
  grid-column: 1 / -1;
  justify-content: center;
  min-height: 140px;
  
  @media (max-width: 768px) {
    min-height: 120px;
  }
`;

const LoadingMessage = styled.div`
  color: var(--text-secondary);
  font-size: 1.8rem;
  
  @media (max-width: 768px) {
    font-size: 1.6rem;
  }
`;

const ErrorCard = styled(StatCard)`
  grid-column: 1 / -1;
  justify-content: center;
  min-height: 140px;
  border-color: var(--warning);
  background: var(--bg-tertiary);
  
  @media (max-width: 768px) {
    min-height: 120px;
  }
`;

const ErrorMessage = styled.div`
  color: var(--warning);
  font-size: 1.8rem;
  
  @media (max-width: 768px) {
    font-size: 1.6rem;
  }
`;

export default StatisticsCards;

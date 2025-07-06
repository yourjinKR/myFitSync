import React from 'react';
import styled from 'styled-components';

// 피드백 통계 컴포넌트
const FeedbackStats = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <Container>
        <LoadingMessage>피드백 통계를 계산 중...</LoadingMessage>
      </Container>
    );
  }

  if (!stats || !stats.feedbackStats || stats.feedbackStats.total === 0) {
    return (
      <Container>
        <EmptyState>
          <EmptyIcon>💬</EmptyIcon>
          <EmptyTitle>피드백 데이터가 없습니다</EmptyTitle>
          <EmptyDescription>사용자 피드백이 수집되면 여기에 표시됩니다.</EmptyDescription>
        </EmptyState>
      </Container>
    );
  }

  const { feedbackStats } = stats;
  const likePercentage = ((feedbackStats.like / feedbackStats.total) * 100).toFixed(1);
  const dislikePercentage = ((feedbackStats.dislike / feedbackStats.total) * 100).toFixed(1);

  return (
    <Container>
      <Header>
        <Title>💬 사용자 피드백</Title>
        <TotalCount>총 {feedbackStats.total}건</TotalCount>
      </Header>
      
      <Content>
        <StatsOverview>
          <OverallRating good={parseFloat(likePercentage) >= 80}>
            <RatingIcon>
              {parseFloat(likePercentage) >= 90 ? '🎉' :
               parseFloat(likePercentage) >= 80 ? '😊' :
               parseFloat(likePercentage) >= 60 ? '😐' : '😞'}
            </RatingIcon>
            <RatingText>
              <RatingTitle>전체 만족도</RatingTitle>
              <RatingValue good={parseFloat(likePercentage) >= 80}>
                {likePercentage}%
              </RatingValue>
            </RatingText>
          </OverallRating>
        </StatsOverview>

        <FeedbackBreakdown>
          <FeedbackItem type="like">
            <FeedbackHeader>
              <FeedbackIcon>👍</FeedbackIcon>
              <FeedbackLabel>좋아요</FeedbackLabel>
              <FeedbackCount>{feedbackStats.like}건</FeedbackCount>
            </FeedbackHeader>
            <ProgressBarContainer>
              <ProgressBar 
                width={likePercentage}
                color="#10b981"
              />
            </ProgressBarContainer>
            <FeedbackPercentage>{likePercentage}%</FeedbackPercentage>
          </FeedbackItem>

          <FeedbackItem type="dislike">
            <FeedbackHeader>
              <FeedbackIcon>👎</FeedbackIcon>
              <FeedbackLabel>싫어요</FeedbackLabel>
              <FeedbackCount>{feedbackStats.dislike}건</FeedbackCount>
            </FeedbackHeader>
            <ProgressBarContainer>
              <ProgressBar 
                width={dislikePercentage}
                color="#ef4444"
              />
            </ProgressBarContainer>
            <FeedbackPercentage>{dislikePercentage}%</FeedbackPercentage>
          </FeedbackItem>
        </FeedbackBreakdown>

        <FeedbackInsights>
          <InsightTitle>📊 분석 인사이트</InsightTitle>
          <InsightList>
            {parseFloat(likePercentage) >= 90 && (
              <InsightItem type="positive">
                <InsightIcon>🌟</InsightIcon>
                <InsightText>매우 높은 사용자 만족도를 기록하고 있습니다!</InsightText>
              </InsightItem>
            )}
            
            {parseFloat(likePercentage) >= 70 && parseFloat(likePercentage) < 90 && (
              <InsightItem type="good">
                <InsightIcon>👍</InsightIcon>
                <InsightText>양호한 사용자 만족도를 유지하고 있습니다.</InsightText>
              </InsightItem>
            )}
            
            {parseFloat(dislikePercentage) > 30 && (
              <InsightItem type="warning">
                <InsightIcon>⚠️</InsightIcon>
                <InsightText>부정적 피드백이 다소 높습니다. 개선이 필요할 수 있습니다.</InsightText>
              </InsightItem>
            )}
            
            {feedbackStats.total < 10 && (
              <InsightItem type="info">
                <InsightIcon>📈</InsightIcon>
                <InsightText>더 많은 피드백 수집이 필요합니다.</InsightText>
              </InsightItem>
            )}
            
            {feedbackStats.total >= 100 && (
              <InsightItem type="milestone">
                <InsightIcon>🎯</InsightIcon>
                <InsightText>충분한 피드백 데이터가 수집되었습니다.</InsightText>
              </InsightItem>
            )}
          </InsightList>
        </FeedbackInsights>

        <QuickActions>
          <ActionTitle>🎯 권장 액션</ActionTitle>
          <ActionList>
            {parseFloat(dislikePercentage) > 20 && (
              <ActionItem>부정적 피드백 원인 분석 및 개선 방안 수립</ActionItem>
            )}
            {feedbackStats.total < 50 && (
              <ActionItem>피드백 수집 캠페인 실시</ActionItem>
            )}
            {parseFloat(likePercentage) >= 85 && (
              <ActionItem>현재 서비스 품질 유지 및 확대 적용</ActionItem>
            )}
          </ActionList>
        </QuickActions>
      </Content>
    </Container>
  );
};

// 스타일 컴포넌트
const Container = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: 100%;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #374151;
`;

const TotalCount = styled.div`
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const StatsOverview = styled.div`
  text-align: center;
  padding: 20px;
  background: #f9fafb;
  border-radius: 8px;
`;

const OverallRating = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
`;

const RatingIcon = styled.div`
  font-size: 32px;
`;

const RatingText = styled.div`
  text-align: left;
`;

const RatingTitle = styled.div`
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 4px;
`;

const RatingValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${props => props.good ? '#059669' : '#dc2626'};
`;

const FeedbackBreakdown = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FeedbackItem = styled.div`
  padding: 16px;
  border-radius: 8px;
  background: ${props => props.type === 'like' ? '#f0fdf4' : '#fef2f2'};
  border: 1px solid ${props => props.type === 'like' ? '#bbf7d0' : '#fecaca'};
`;

const FeedbackHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
`;

const FeedbackIcon = styled.span`
  font-size: 20px;
`;

const FeedbackLabel = styled.span`
  font-weight: 600;
  color: #374151;
  flex: 1;
`;

const FeedbackCount = styled.span`
  font-size: 14px;
  color: #6b7280;
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 4px;
`;

const ProgressBar = styled.div`
  height: 100%;
  width: ${props => props.width}%;
  background: ${props => props.color};
  border-radius: 4px;
  transition: width 0.3s ease;
`;

const FeedbackPercentage = styled.div`
  text-align: right;
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
`;

const FeedbackInsights = styled.div`
  background: #f8fafc;
  padding: 16px;
  border-radius: 8px;
`;

const InsightTitle = styled.h4`
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
`;

const InsightList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const InsightItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px;
  border-radius: 6px;
  background: ${props => {
    switch (props.type) {
      case 'positive': return '#ecfdf5';
      case 'good': return '#eff6ff';
      case 'warning': return '#fffbeb';
      case 'info': return '#f0f9ff';
      case 'milestone': return '#faf5ff';
      default: return '#f9fafb';
    }
  }};
`;

const InsightIcon = styled.span`
  font-size: 16px;
  margin-top: 1px;
`;

const InsightText = styled.span`
  font-size: 13px;
  color: #374151;
  line-height: 1.4;
`;

const QuickActions = styled.div`
  background: #fef7ff;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e9d5ff;
`;

const ActionTitle = styled.h4`
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
`;

const ActionList = styled.ul`
  margin: 0;
  padding-left: 16px;
  list-style-type: none;
`;

const ActionItem = styled.li`
  font-size: 13px;
  color: #6b21a8;
  margin-bottom: 6px;
  position: relative;
  
  &:before {
    content: '→';
    position: absolute;
    left: -16px;
    color: #a855f7;
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const LoadingMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #6b7280;
  font-size: 14px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const EmptyTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #374151;
`;

const EmptyDescription = styled.p`
  margin: 0;
  color: #6b7280;
  font-size: 14px;
`;

export default FeedbackStats;

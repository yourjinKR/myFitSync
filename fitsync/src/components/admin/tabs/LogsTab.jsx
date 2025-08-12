import React from 'react';
import styled from 'styled-components';
import { PRICING, USD_TO_KRW } from '../../../hooks/admin/useTokenAnalytics';

// 토큰 비용 계산 함수
const calculateTokenCost = (inputTokens, outputTokens, model) => {
    const pricing = PRICING[model] || PRICING.default;
    const costUSD = (inputTokens * pricing.input) + (outputTokens * pricing.output);
    const costKRW = costUSD * USD_TO_KRW;
    return Math.round(costKRW);
};

const LogsTab = ({ filteredLogs, apiLogs, setSelectedLog, selectedLog, isLoading, stats, memberType }) => {
    const logs = filteredLogs || [];

    return (
        <TabContainer>
            <TabHeader>
                <TabTitle>📋 API 로그</TabTitle>
                <TabDescription>
                    전체 API 호출 로그를 확인하고 상세 정보를 조회할 수 있습니다
                </TabDescription>
            </TabHeader>

            <TabContent>
                <LogSummary>
                    {memberType === 'admin' && (
                      <>
                        <SummaryItem>
                            <SummaryLabel>전체 로그</SummaryLabel>
                            <SummaryValue>{apiLogs?.length || 0}</SummaryValue>
                        </SummaryItem>
                        <SummaryItem>
                            <SummaryLabel>필터된 로그</SummaryLabel>
                            <SummaryValue>{logs.length}</SummaryValue>
                        </SummaryItem>
                      </>
                    )}
                    {stats && (
                        <>
                            <SummaryItem>
                                <SummaryLabel>성공률</SummaryLabel>
                                <SummaryValue>{stats.successRate}%</SummaryValue>
                            </SummaryItem>
                            <SummaryItem>
                                <SummaryLabel>평균 응답시간</SummaryLabel>
                                <SummaryValue>{stats.avgResponseTime}초</SummaryValue>
                            </SummaryItem>
                        </>
                    )}
                </LogSummary>

                {isLoading ? (
                    <LoadingMessage>로그를 불러오는 중...</LoadingMessage>
                ) : logs.length === 0 ? (
                    <EmptyMessage>표시할 로그가 없습니다.</EmptyMessage>
                ) : (
                    <LogContainer>
                        <LogHeader>
                            <HeaderCell>시간</HeaderCell>
                            <HeaderCell>상태</HeaderCell>
                            <HeaderCell>모델</HeaderCell>
                            {memberType === 'admin' && <HeaderCell>사용자</HeaderCell>}
                            <HeaderCell>토큰</HeaderCell>
                            <HeaderCell>비용</HeaderCell>
                            <HeaderCell>응답시간</HeaderCell>
                            <HeaderCell>버전</HeaderCell>
                            <HeaderCell>피드백</HeaderCell>
                            <HeaderCell>사용자 반응</HeaderCell>
                        </LogHeader>
                        
                        <LogList>
                            {logs.map((log, index) => (
                                <LogItem
                                    key={log.apilog_idx || index}
                                    onClick={() => setSelectedLog?.(log)}
                                    status={log.apilog_status}
                                > 
                                    <LogTime>
                                        <div>{new Date(log.apilog_request_time).toLocaleDateString('ko-KR')}</div>
                                        <div className="time-detail">
                                            {new Date(log.apilog_request_time).toLocaleTimeString('ko-KR')}
                                        </div>
                                    </LogTime>
                                    
                                    <LogStatus status={log.apilog_status}>
                                        <StatusBadge status={log.apilog_status}>
                                            {log.apilog_status === 'success' ? '✅' : 
                                             log.apilog_status === 'error' ? '❌' : '⚠️'}
                                            {log.apilog_status}
                                        </StatusBadge>
                                        {log.apilog_status_reason && (
                                            <StatusReason title={log.apilog_status_reason}>
                                                ⓘ
                                            </StatusReason>
                                        )}
                                    </LogStatus>
                                    
                                    <LogModel>
                                        <ModelBadge model={log.apilog_model}>
                                            {log.apilog_model || '-'}
                                        </ModelBadge>
                                    </LogModel>
                                    
                                    {memberType === 'admin' && (
                                        <LogUser>
                                            <UserBadge>#{log.member_idx}</UserBadge>
                                        </LogUser>
                                    )}
                                    
                                    <LogTokens>
                                        <TokenTotal>
                                            {((log.apilog_input_tokens || 0) + (log.apilog_output_tokens || 0)).toLocaleString()}
                                        </TokenTotal>
                                        <TokenDetail>
                                            입력: {(log.apilog_input_tokens || 0).toLocaleString()} | 
                                            출력: {(log.apilog_output_tokens || 0).toLocaleString()}
                                        </TokenDetail>
                                    </LogTokens>
                                    
                                    <LogCost>
                                        <CostAmount>
                                            {calculateTokenCost(
                                                log.apilog_input_tokens || 0,
                                                log.apilog_output_tokens || 0,
                                                log.apilog_model
                                            ).toLocaleString()}원
                                        </CostAmount>
                                    </LogCost>
                                    
                                    <LogResponseTime>
                                        <ResponseTime fast={log.apilog_total_time < 5}>
                                            {log.apilog_total_time ? log.apilog_total_time.toFixed(2) : '-'}초
                                        </ResponseTime>
                                    </LogResponseTime>

                                    <LogVersion>
                                        <VersionBadge>v{log.apilog_version || '0.0.0'}</VersionBadge>
                                    </LogVersion>
                                    <LogFeedback>
                                        {log.apilog_feedback === 'LIKE' ? (
                                            <FeedbackIcon positive title="좋아요">👍</FeedbackIcon>
                                        ) : log.apilog_feedback === 'DISLIKE' ? (
                                            <FeedbackIcon negative title={`싫어요: ${log.apilog_feedback_reason || ''}`}>👎</FeedbackIcon>
                                        ) : (
                                            <FeedbackIcon neutral>➖</FeedbackIcon>
                                        )}
                                    </LogFeedback>

                                    <LogUserAction>
                                      <LogUserActionBadge action={log.apilog_user_action}>{log.apilog_user_action}</LogUserActionBadge>
                                    </LogUserAction>
                                    
                                </LogItem>
                            ))}
                        </LogList>
                    </LogContainer>
                )}
            </TabContent>
        </TabContainer>
    );
};

// 스타일 컴포넌트들
const TabContainer = styled.div`
  background: var(--bg-primary);
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const TabHeader = styled.div`
  background: var(--bg-secondary);
  padding: 24px;
  border-radius: 8px;
  border: 1px solid var(--border-light);
`;

const TabTitle = styled.h2`
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
`;

const TabDescription = styled.p`
  margin: 0;
  color: var(--text-secondary);
  font-size: 14px;
`;

const TabContent = styled.div`
  flex: 1;
  padding: 2rem 0;
  overflow-y: auto;
`;

const LogSummary = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const SummaryItem = styled.div`
  background: var(--bg-secondary);
  padding: 16px;
  border-radius: 8px;
  text-align: center;
  min-width: 120px;
  border: 1px solid var(--border-light);
`;

const SummaryLabel = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 4px;
`;

const SummaryValue = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
  font-size: 16px;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
  font-size: 16px;
`;

const LogContainer = styled.div`
  background: var(--bg-secondary);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-light);
`;

const LogHeader = styled.div`
  display: grid;
  grid-template-columns: 0.5fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr 0.6fr 0.6fr;
  gap: 12px;
  padding: 16px;
  background: var(--bg-tertiary);
  border-bottom: 2px solid var(--border-light);
  font-weight: 600;
  font-size: 12px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr 0.8fr 0.8fr 0.6fr 1fr;
    gap: 8px;
  }
`;

const HeaderCell = styled.div`
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const LogList = styled.div`
  overflow-y: auto;
`;

const LogItem = styled.div`
  display: grid;
  grid-template-columns: 0.5fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr 0.6fr 0.6fr;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid var(--border-light);
  cursor: pointer;
  transition: all 0.2s ease;
  align-items: center;
  
  &:last-child {
    border-bottom: none;
  }
  
  ${props => props.status === 'success' && `
    border-left: 3px solid var(--success);
  `}
  
  ${props => props.status === 'fail' && `
    border-left: 3px solid var(--warning);
  `}
  
  ${props => props.status === 'exception' && `
    border-left: 3px solid #f59e0b;
  `}
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr 0.8fr 0.8fr 0.6fr 1fr;
    gap: 8px;
  }
`;

const LogTime = styled.div`
  font-size: 13px;
  color: var(--text-primary);
  
  .time-detail {
    font-size: 11px;
    color: var(--text-tertiary);
    margin-top: 2px;
  }
`;

const LogStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const StatusBadge = styled.span`
  font-size: 11px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
  background: ${props => {
    switch (props.status) {
      case 'success': return 'rgba(46, 139, 87, 0.2)';
      case 'error': return 'rgba(244, 67, 54, 0.2)';
      case 'exception': return 'rgba(245, 158, 11, 0.2)';
      default: return 'var(--bg-tertiary)';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'success': return 'var(--success)';
      case 'error': return 'var(--warning)';
      case 'exception': return '#f59e0b';
      default: return 'var(--text-tertiary)';
    }
  }};
`;

const StatusReason = styled.span`
  color: var(--warning);
  font-size: 12px;
`;

const LogModel = styled.div``;

const ModelBadge = styled.span`
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 8px;
  background: ${props => props.model?.includes('gpt-4') ? 
    'rgba(74, 144, 226, 0.2)' : 'rgba(46, 139, 87, 0.2)'};
  color: ${props => props.model?.includes('gpt-4') ? 
    'var(--primary-blue)' : 'var(--success)'};
  font-weight: 500;
`;

const LogUser = styled.div``;

const UserBadge = styled.span`
  font-size: 11px;
  font-family: monospace;
  background: var(--bg-tertiary);
  padding: 4px 6px;
  border-radius: 6px;
  color: var(--text-secondary);
`;

const LogTokens = styled.div``;

const TokenTotal = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
`;

const TokenDetail = styled.div`
  font-size: 10px;
  color: var(--text-tertiary);
  margin-top: 2px;
`;

const LogCost = styled.div``;

const CostAmount = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: var(--primary-blue);
`;

const LogResponseTime = styled.div``;

const ResponseTime = styled.div`
  font-size: 12px;
  color: ${props => props.fast ? 'var(--success)' : 'var(--text-secondary)'};
  font-weight: ${props => props.fast ? '600' : '400'};
`;

const LogFeedback = styled.div`
`;

const FeedbackIcon = styled.span`
  font-size: 16px;
  cursor: pointer;
  opacity: ${props => props.neutral ? '0.5' : '1'};
`;

const LogVersion = styled.div``;

const VersionBadge = styled.span`
  font-size: 10px;
  font-family: monospace;
  background: var(--bg-tertiary);
  padding: 2px 6px;
  border-radius: 4px;
  color: var(--text-tertiary);
`;

const LogUserAction = styled.div``;

const LogUserActionBadge = styled.div`
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  background: ${props => {
    switch (props.action) {
      case 'saved-immediate': return 'rgba(46, 139, 87, 0.2)'; // 초록계열 - 즉시 저장
      case 'saved-after': return 'rgba(74, 144, 226, 0.2)'; // 파란계열 - 나중에 저장  
      case 'ignored': return 'rgba(136, 136, 136, 0.2)'; // 회색계열 - 무시
      default: return 'var(--bg-tertiary)';
    }
  }};
  
  color: ${props => {
    switch (props.action) {
      case 'saved-immediate': return 'var(--success)';
      case 'saved-after': return 'var(--primary-blue)';
      case 'ignored': return 'var(--primary-gray)';
      default: return 'var(--text-tertiary)';
    }
  }};
  
  &::before {
    content: ${props => {
      switch (props.action) {
        case 'saved-immediate': return '"⚡ "'; // 번개 - 즉시 반응
        case 'saved-after': return '"⏰ "'; // 시계 - 나중에 반응
        case 'ignored': return '"❌ "'; // X표 - 무시
        default: return '"❓ "';
      }
    }};
    margin-right: 2px;
  }
`;

export default LogsTab;

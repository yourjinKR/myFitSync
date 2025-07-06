import React from 'react';
import styled from 'styled-components';

// 로그 탭 컴포넌트 (간단한 버전)
const LogsTab = ({ filteredLogs, apiLogs, setSelectedLog, selectedLog, isLoading, stats }) => {
    // props 안전성을 위한 기본값 설정
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
                    <SummaryItem>
                        <SummaryLabel>전체 로그</SummaryLabel>
                        <SummaryValue>{apiLogs?.length || 0}</SummaryValue>
                    </SummaryItem>
                    <SummaryItem>
                        <SummaryLabel>필터된 로그</SummaryLabel>
                        <SummaryValue>{logs.length}</SummaryValue>
                    </SummaryItem>
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
                    <LogList>
                        {logs.map((log, index) => (
                            <LogItem
                                key={log.apilog_idx || index}
                                onClick={() => setSelectedLog?.(log)}
                            >
                                <LogTime>
                                    {new Date(log.apilog_request_time).toLocaleString('ko-KR')}
                                </LogTime>
                                <LogStatus status={log.apilog_status}>
                                    {log.apilog_status}
                                </LogStatus>
                                <LogModel>{log.apilog_model || '-'}</LogModel>
                                <LogResponseTime>
                                    {/* 응답 시간 X.XX 초, 소수점 2자리 */}
                                    {log.apilog_total_time ? log.apilog_total_time.toFixed(2) : '-'}초
                                </LogResponseTime>
                            </LogItem>
                        ))}
                    </LogList>
                )}
            </TabContent>
        </TabContainer>
    );
};

// 스타일 컴포넌트
const TabContainer = styled.div`
  background: #f9fafb;
  border-radius: 8px;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const TabHeader = styled.div`
  background: white;
  padding: 24px;
  border-radius: 8px 8px 0 0;
  border-bottom: 1px solid #e5e7eb;
`;

const TabTitle = styled.h2`
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 700;
  color: #111827;
`;

const TabDescription = styled.p`
  margin: 0;
  color: #6b7280;
  font-size: 14px;
`;

const TabContent = styled.div`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
`;

const LogSummary = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const SummaryItem = styled.div`
  background: white;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
  min-width: 120px;
`;

const SummaryLabel = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
`;

const SummaryValue = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: #111827;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #6b7280;
  font-size: 16px;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #6b7280;
  font-size: 16px;
`;

const LogList = styled.div`
  background: white;
  border-radius: 8px;
  overflow: hidden;
`;

const LogItem = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 16px;
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  
  &:hover {
    background: #f9fafb;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const LogTime = styled.div`
  font-size: 13px;
  color: #6b7280;
`;

const LogStatus = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${props => {
        switch (props.status) {
            case 'success': return '#10b981';
            case 'error': return '#ef4444';
            case 'exception': return '#f59e0b';
            default: return '#6b7280';
        }
    }};
`;

const LogModel = styled.div`
  font-size: 13px;
  color: #374151;
`;

const LogResponseTime = styled.div`
  font-size: 13px;
  color: #6b7280;
  text-align: right;
`;

export default LogsTab;

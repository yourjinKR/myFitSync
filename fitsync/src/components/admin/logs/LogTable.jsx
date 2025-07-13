import React, { useState } from 'react';
import styled from 'styled-components';

// 로그 테이블 컴포넌트
const LogTable = ({ 
  logs, 
  isLoading, 
  onLogSelect, 
  selectedLog,
  totalCount,
  currentPage = 1,
  itemsPerPage = 50 
}) => {
  const [sortField, setSortField] = useState('timestamp');
  const [sortDirection, setSortDirection] = useState('desc');

  // 정렬 처리
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // 상태별 스타일 결정
  const getStatusColor = (status) => {
    switch (status) {
      case 'SUCCESS': return 'var(--success)';
      case 'ERROR': return 'var(--warning)';
      case 'EXCEPTION': return '#f59e0b';
      default: return 'var(--text-tertiary)';
    }
  };

  // 응답시간별 색상
  const getResponseTimeColor = (time) => {
    const responseTime = parseFloat(time);
    if (responseTime <= 500) return 'var(--success)';
    if (responseTime <= 1000) return 'var(--primary-blue)';
    if (responseTime <= 3000) return '#f59e0b';
    return 'var(--warning)';
  };

  // 시간 포맷팅
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('ko-KR', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <TableContainer>
        <LoadingOverlay>
          <LoadingSpinner />
          <LoadingText>로그를 불러오는 중...</LoadingText>
        </LoadingOverlay>
      </TableContainer>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <TableContainer>
        <EmptyState>
          <EmptyIcon>📋</EmptyIcon>
          <EmptyTitle>표시할 로그가 없습니다</EmptyTitle>
          <EmptyDescription>
            필터 조건을 변경하거나 새로고침을 시도해보세요.
          </EmptyDescription>
        </EmptyState>
      </TableContainer>
    );
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, logs.length);

  return (
    <TableContainer>
      <TableHeader>
        <ResultInfo>
          총 {totalCount?.toLocaleString() || logs.length.toLocaleString()}건 중 
          {startIndex + 1}-{endIndex}번째 표시
        </ResultInfo>
      </TableHeader>

      <TableWrapper>
        <Table>
          <thead>
            <tr>
              <SortableHeader onClick={() => handleSort('timestamp')}>
                시간
                {sortField === 'timestamp' && (
                  <SortIcon>{sortDirection === 'asc' ? '↑' : '↓'}</SortIcon>
                )}
              </SortableHeader>
              <SortableHeader onClick={() => handleSort('apilog_response_status')}>
                상태
                {sortField === 'apilog_response_status' && (
                  <SortIcon>{sortDirection === 'asc' ? '↑' : '↓'}</SortIcon>
                )}
              </SortableHeader>
              <SortableHeader onClick={() => handleSort('apilog_model')}>
                모델
                {sortField === 'apilog_model' && (
                  <SortIcon>{sortDirection === 'asc' ? '↑' : '↓'}</SortIcon>
                )}
              </SortableHeader>
              <SortableHeader onClick={() => handleSort('apilog_service_type')}>
                서비스
                {sortField === 'apilog_service_type' && (
                  <SortIcon>{sortDirection === 'asc' ? '↑' : '↓'}</SortIcon>
                )}
              </SortableHeader>
              <SortableHeader onClick={() => handleSort('apilog_version')}>
                버전
                {sortField === 'apilog_version' && (
                  <SortIcon>{sortDirection === 'asc' ? '↑' : '↓'}</SortIcon>
                )}
              </SortableHeader>
              <SortableHeader onClick={() => handleSort('apilog_response_time')}>
                응답시간
                {sortField === 'apilog_response_time' && (
                  <SortIcon>{sortDirection === 'asc' ? '↑' : '↓'}</SortIcon>
                )}
              </SortableHeader>
              <SortableHeader onClick={() => handleSort('apilog_input_tokens')}>
                토큰
                {sortField === 'apilog_input_tokens' && (
                  <SortIcon>{sortDirection === 'asc' ? '↑' : '↓'}</SortIcon>
                )}
              </SortableHeader>
              <HeaderCell>사용자</HeaderCell>
            </tr>
          </thead>
          <tbody>
            {logs.slice(startIndex, endIndex).map((log) => (
              <TableRow 
                key={log.apilog_idx}
                onClick={() => onLogSelect?.(log)}
                selected={selectedLog?.apilog_idx === log.apilog_idx}
              >
                <Cell>
                  <TimeStamp>
                    {formatTimestamp(log.apilog_timestamp)}
                  </TimeStamp>
                </Cell>
                <Cell>
                  <StatusBadge color={getStatusColor(log.apilog_response_status)}>
                    {log.apilog_response_status === 'SUCCESS' ? '✅' :
                     log.apilog_response_status === 'ERROR' ? '❌' : '⚠️'}
                    {log.apilog_response_status}
                  </StatusBadge>
                </Cell>
                <Cell>
                  <ModelName>{log.apilog_model || '-'}</ModelName>
                </Cell>
                <Cell>
                  <ServiceName>{log.apilog_service_type || '-'}</ServiceName>
                </Cell>
                <Cell>
                  <VersionBadge>v{log.apilog_version || '-'}</VersionBadge>
                </Cell>
                <Cell>
                  <ResponseTime color={getResponseTimeColor(log.apilog_response_time)}>
                    {log.apilog_response_time ? `${parseFloat(log.apilog_response_time).toFixed(0)}ms` : '-'}
                  </ResponseTime>
                </Cell>
                <Cell>
                  <TokenCount>
                    {log.apilog_input_tokens ? log.apilog_input_tokens.toLocaleString() : '-'}
                  </TokenCount>
                </Cell>
                <Cell>
                  <UserId>{log.user_id || '-'}</UserId>
                </Cell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </TableWrapper>
    </TableContainer>
  );
};

// 스타일 컴포넌트
const TableContainer = styled.div`
  background: var(--bg-secondary);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-light);
  position: relative;
  min-height: 400px;
`;

const TableHeader = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-light);
  background: var(--bg-tertiary);
`;

const ResultInfo = styled.div`
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  max-height: 600px;
  overflow-y: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
`;

const HeaderCell = styled.th`
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: var(--text-primary);
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-light);
  white-space: nowrap;
`;

const SortableHeader = styled(HeaderCell)`
  cursor: pointer;
  user-select: none;
  position: relative;
  
  &:hover {
    background: var(--bg-primary);
  }
`;

const SortIcon = styled.span`
  margin-left: 4px;
  color: var(--primary-blue);
  font-weight: bold;
`;

const TableRow = styled.tr`
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--bg-tertiary);
  }
  
  ${props => props.selected && `
    background: var(--primary-blue-light);
    border-left: 3px solid var(--primary-blue);
  `}
`;

const Cell = styled.td`
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-light);
  vertical-align: middle;
`;

const TimeStamp = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: var(--text-secondary);
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  color: white;
  background: ${props => props.color};
  white-space: nowrap;
`;

const ModelName = styled.div`
  font-weight: 500;
  color: var(--text-primary);
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ServiceName = styled.div`
  color: var(--text-secondary);
  font-size: 13px;
`;

const VersionBadge = styled.span`
  background: var(--bg-tertiary);
  color: var(--text-primary);
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 500;
  border: 1px solid var(--border-light);
`;

const ResponseTime = styled.div`
  font-weight: 600;
  color: ${props => props.color};
  font-family: 'Courier New', monospace;
`;

const TokenCount = styled.div`
  font-family: 'Courier New', monospace;
  color: var(--text-secondary);
  text-align: right;
`;

const UserId = styled.div`
  font-size: 12px;
  color: var(--text-tertiary);
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-light);
  border-top: 4px solid var(--primary-blue);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  color: var(--text-primary);
  font-size: 16px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const EmptyTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 18px;
  color: var(--text-primary);
`;

const EmptyDescription = styled.p`
  margin: 0;
  color: var(--text-secondary);
  font-size: 14px;
`;

export default LogTable;

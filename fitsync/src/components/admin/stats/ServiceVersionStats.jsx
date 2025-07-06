import React from 'react';
import styled from 'styled-components';

// 서비스별 버전 통계 컴포넌트
const ServiceVersionStats = ({ logs, isLoading }) => {
    // 서비스별 버전 통계 계산
    const getServiceVersionStats = () => {
        if (!logs || logs.length === 0) return [];

        const serviceVersionMap = {};

        logs.forEach(log => {
            const service = log.apilog_service_type || '기타';
            const version = log.apilog_version || '알 수 없음';

            if (!serviceVersionMap[service]) {
                serviceVersionMap[service] = {
                    service,
                    versions: {},
                    totalRequests: 0,
                    latestVersion: version
                };
            }

            if (!serviceVersionMap[service].versions[version]) {
                serviceVersionMap[service].versions[version] = {
                    version,
                    requestCount: 0,
                    successCount: 0,
                    errorCount: 0,
                    avgResponseTime: 0,
                    totalResponseTime: 0,
                    firstSeen: log.apilog_timestamp,
                    lastSeen: log.apilog_timestamp
                };
            }

            const versionStat = serviceVersionMap[service].versions[version];
            versionStat.requestCount++;
            serviceVersionMap[service].totalRequests++;

            if (log.apilog_response_status === 'SUCCESS') {
                versionStat.successCount++;
            } else {
                versionStat.errorCount++;
            }

            if (log.apilog_response_time) {
                versionStat.totalResponseTime += parseFloat(log.apilog_response_time);
            }

            // 최신 버전 업데이트
            if (version > serviceVersionMap[service].latestVersion) {
                serviceVersionMap[service].latestVersion = version;
            }

            // 타임스탬프 업데이트
            if (log.apilog_timestamp < versionStat.firstSeen) {
                versionStat.firstSeen = log.apilog_timestamp;
            }
            if (log.apilog_timestamp > versionStat.lastSeen) {
                versionStat.lastSeen = log.apilog_timestamp;
            }
        });

        // 평균 응답시간 계산 및 정렬
        return Object.values(serviceVersionMap).map(service => {
            const sortedVersions = Object.values(service.versions)
                .map(version => ({
                    ...version,
                    avgResponseTime: version.requestCount > 0
                        ? (version.totalResponseTime / version.requestCount).toFixed(2)
                        : 0,
                    successRate: version.requestCount > 0
                        ? ((version.successCount / version.requestCount) * 100).toFixed(1)
                        : 0,
                    usage: ((version.requestCount / service.totalRequests) * 100).toFixed(1)
                }))
                .sort((a, b) => {
                    // 버전 번호로 정렬
                    const aVersion = a.version.split('.').map(Number);
                    const bVersion = b.version.split('.').map(Number);
                    for (let i = 0; i < Math.max(aVersion.length, bVersion.length); i++) {
                        const aPart = aVersion[i] || 0;
                        const bPart = bVersion[i] || 0;
                        if (aPart !== bPart) return bPart - aPart;
                    }
                    return 0;
                });

            return {
                ...service,
                versions: sortedVersions
            };
        });
    };

    const serviceStats = getServiceVersionStats();

    if (isLoading) {
        return (
            <Container>
                <LoadingMessage>버전 통계를 계산 중...</LoadingMessage>
            </Container>
        );
    }

    if (serviceStats.length === 0) {
        return (
            <Container>
                <EmptyState>
                    <EmptyIcon>🔧</EmptyIcon>
                    <EmptyTitle>서비스 버전 데이터가 없습니다</EmptyTitle>
                    <EmptyDescription>서비스별 버전 정보가 수집되면 여기에 표시됩니다.</EmptyDescription>
                </EmptyState>
            </Container>
        );
    }

    return (
        <Container>
            <Header>
                <Title>🔧 서비스별 버전 현황</Title>
                <ServiceCount>{serviceStats.length}개 서비스</ServiceCount>
            </Header>

            <Content>
                {serviceStats.map((service) => (
                    <ServiceSection key={service.service}>
                        <ServiceHeader>
                            <ServiceName>{service.service}</ServiceName>
                            <ServiceInfo>
                                <InfoItem>
                                    <InfoLabel>총 요청</InfoLabel>
                                    <InfoValue>{service.totalRequests.toLocaleString()}</InfoValue>
                                </InfoItem>
                                <InfoItem>
                                    <InfoLabel>활성 버전</InfoLabel>
                                    <InfoValue>{Object.keys(service.versions).length}개</InfoValue>
                                </InfoItem>
                                <InfoItem>
                                    <InfoLabel>최신 버전</InfoLabel>
                                    <LatestVersion>v{service.latestVersion}</LatestVersion>
                                </InfoItem>
                            </ServiceInfo>
                        </ServiceHeader>

                        <VersionList>
                            {service.versions.map((version, index) => (
                                <VersionItem
                                    key={version.version}
                                    isLatest={version.version === service.latestVersion}
                                    isOld={index >= 3} // 4번째 이후는 구버전으로 표시
                                >
                                    <VersionHeader>
                                        <VersionName isLatest={version.version === service.latestVersion}>
                                            v{version.version}
                                            {version.version === service.latestVersion && <LatestBadge>최신</LatestBadge>}
                                        </VersionName>
                                        <VersionUsage>{version.usage}%</VersionUsage>
                                    </VersionHeader>

                                    <VersionMetrics>
                                        <MetricItem>
                                            <MetricIcon>📊</MetricIcon>
                                            <MetricContent>
                                                <MetricLabel>요청 수</MetricLabel>
                                                <MetricValue>{version.requestCount.toLocaleString()}</MetricValue>
                                            </MetricContent>
                                        </MetricItem>

                                        <MetricItem>
                                            <MetricIcon success={parseFloat(version.successRate) >= 95}>
                                                {parseFloat(version.successRate) >= 95 ? '✅' : '⚠️'}
                                            </MetricIcon>
                                            <MetricContent>
                                                <MetricLabel>성공률</MetricLabel>
                                                <MetricValue success={parseFloat(version.successRate) >= 95}>
                                                    {version.successRate}%
                                                </MetricValue>
                                            </MetricContent>
                                        </MetricItem>

                                        <MetricItem>
                                            <MetricIcon fast={parseFloat(version.avgResponseTime) <= 500}>
                                                {parseFloat(version.avgResponseTime) <= 500 ? '🚀' : '⏱️'}
                                            </MetricIcon>
                                            <MetricContent>
                                                <MetricLabel>평균 응답시간</MetricLabel>
                                                <MetricValue fast={parseFloat(version.avgResponseTime) <= 500}>
                                                    {version.avgResponseTime}ms
                                                </MetricValue>
                                            </MetricContent>
                                        </MetricItem>
                                    </VersionMetrics>

                                    <VersionTimeline>
                                        <TimelineItem>
                                            <TimelineLabel>첫 사용</TimelineLabel>
                                            <TimelineValue>
                                                {new Date(version.firstSeen).toLocaleDateString('ko-KR')}
                                            </TimelineValue>
                                        </TimelineItem>
                                        <TimelineItem>
                                            <TimelineLabel>마지막 사용</TimelineLabel>
                                            <TimelineValue>
                                                {new Date(version.lastSeen).toLocaleDateString('ko-KR')}
                                            </TimelineValue>
                                        </TimelineItem>
                                    </VersionTimeline>

                                    <UsageBar>
                                        <UsageProgress
                                            width={version.usage}
                                            isLatest={version.version === service.latestVersion}
                                        />
                                    </UsageBar>
                                </VersionItem>
                            ))}
                        </VersionList>
                    </ServiceSection>
                ))}
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

const ServiceCount = styled.div`
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
`;

const Content = styled.div`
  max-height: 600px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const ServiceSection = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
`;

const ServiceHeader = styled.div`
  background: #f9fafb;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
`;

const ServiceName = styled.h4`
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
`;

const ServiceInfo = styled.div`
  display: flex;
  gap: 24px;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const InfoLabel = styled.span`
  font-size: 12px;
  color: #6b7280;
`;

const InfoValue = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #374151;
`;

const LatestVersion = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #059669;
`;

const VersionList = styled.div`
  display: flex;
  flex-direction: column;
`;

const VersionItem = styled.div`
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
  background: ${props => {
        if (props.isLatest) return '#f0fdf4';
        if (props.isOld) return '#fafafa';
        return 'white';
    }};
  
  &:last-child {
    border-bottom: none;
  }
`;

const VersionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const VersionName = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.isLatest ? '#059669' : '#374151'};
`;

const LatestBadge = styled.span`
  background: #059669;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
`;

const VersionUsage = styled.div`
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
`;

const VersionMetrics = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 12px;
`;

const MetricItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MetricIcon = styled.span`
  font-size: 16px;
`;

const MetricContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const MetricLabel = styled.span`
  font-size: 11px;
  color: #6b7280;
`;

const MetricValue = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${props => {
        if (props.success) return '#059669';
        if (props.fast) return '#2563eb';
        return '#374151';
    }};
`;

const VersionTimeline = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const TimelineItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const TimelineLabel = styled.span`
  font-size: 11px;
  color: #6b7280;
`;

const TimelineValue = styled.span`
  font-size: 12px;
  color: #374151;
  font-weight: 500;
`;

const UsageBar = styled.div`
  width: 100%;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
`;

const UsageProgress = styled.div`
  height: 100%;
  width: ${props => props.width}%;
  background: ${props => props.isLatest ? '#059669' : '#3b82f6'};
  border-radius: 2px;
  transition: width 0.3s ease;
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

export default ServiceVersionStats;

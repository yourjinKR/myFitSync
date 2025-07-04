// AdminApiContainer.jsx
import axios from 'axios';
import React, { useState, useEffect, useMemo } from 'react';
import {
    Container, Inner, Title, Button, Select, StatCard, StatTitle, StatValue,
    Table, Th, Td, StatusTag, ModalOverlay, ModalContent, Section, SectionTitle,
    SectionContent, RoutineCard, Exercise
} from '../../styles/chartStyle';
import versionUtils from '../../util/utilFunc';

// JSON 파싱 및 응답 시간 계산
function parseApiLogData(apiLogItem) {
    const version = apiLogItem.apilog_version;
    try {
        const parsedPrompt = JSON.parse(apiLogItem.apilog_prompt);
        const parsedResponse = JSON.parse(apiLogItem.apilog_response);
        const responseTime = new Date(apiLogItem.apilog_response_time).getTime();
        const requestTime = new Date(apiLogItem.apilog_request_time).getTime();

        let parsedUserMassage = null;
        if (versionUtils.isVersionAtLeast(version, '0.0.7')) {
            parsedUserMassage = JSON.parse(parsedPrompt.messages[1]?.content);
            if (parsedUserMassage.split === parsedResponse.length) {
                parsedUserMassage = { ...parsedUserMassage, isSplit: true };
            }
        }

        return {
            ...apiLogItem,
            parsed_prompt: parsedPrompt,
            parsed_response: parsedResponse,
            parsed_userMassage: parsedUserMassage,
            apilog_total_time: (responseTime - requestTime) / 1000
        };
    } catch (error) {
        console.error('JSON 파싱 오류:', error);
        return apiLogItem;
    }
}

const AdminApiContainer = () => {
    const [apiLogs, setApiLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedLog, setSelectedLog] = useState(null);
    const [filter, setFilter] = useState('all');
    const [rawData, setRawData] = useState([]);

    const filteredLogs = useMemo(
        () => apiLogs.filter(log => filter === 'all' || log.apilog_status === filter),
        [apiLogs, filter]
    );

    const handleSelectedLog = (direction) => {
        const currentIndex = apiLogs.findIndex(log => log.apilog_idx === selectedLog?.apilog_idx);
        const newIndex = currentIndex + direction;
        if (newIndex >= 0 && newIndex < apiLogs.length) {
            setSelectedLog(apiLogs[newIndex]);
        }
    };

    const fetchWorkoutNames = async () => {
        try {
            const response = await axios.get('/ai/getTextReact');
            setRawData(response.data.map(name => name.replace(/\s+/g, '')));
        } catch (error) {
            console.error('운동명 목록 요청 실패:', error);
        }
    };

    const fetchApiLogs = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/admin/getAllApi');
            setApiLogs(response.data.map(item => parseApiLogData(item)));
        } catch (error) {
            console.error('API 로그 가져오기 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatistics = () => {
        if (apiLogs.length === 0) return null;
        const total = apiLogs.length;
        const successCount = apiLogs.filter(log => log.apilog_status === 'success').length;
        const totalTokens = apiLogs.reduce((sum, log) => sum + (log.apilog_input_tokens || 0) + (log.apilog_output_tokens || 0), 0);
        const totalTime = apiLogs.reduce((sum, log) => sum + (log.apilog_response_time - log.apilog_request_time), 0);

        return {
            totalRequests: total,
            successRate: ((successCount / total) * 100).toFixed(1),
            avgTokens: (totalTokens / total).toFixed(0),
            avgResponseTime: (totalTime / total / 1000).toFixed(2)
        };
    };

    useEffect(() => {
        fetchWorkoutNames();
        fetchApiLogs();
    }, []);

    const stats = getStatistics();

    return (
        <Container>
            <Inner>
                <Title>API 모니터링 대시보드</Title>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <Button onClick={fetchApiLogs} disabled={loading}>
                        {loading ? '로딩 중...' : 'API 로그 새로고침'}
                    </Button>
                    <Select value={filter} onChange={(e) => setFilter(e.target.value)}>
                        <option value="all">전체</option>
                        <option value="success">성공</option>
                        <option value="error">오류</option>
                        <option value="exception">예외</option>
                    </Select>
                </div>

                {stats && (
                    <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '2rem' }}>
                        <StatCard><StatTitle>총 요청 수</StatTitle><StatValue color="#2563eb">{stats.totalRequests}</StatValue></StatCard>
                        <StatCard><StatTitle>성공률</StatTitle><StatValue color="#059669">{stats.successRate}%</StatValue></StatCard>
                        <StatCard><StatTitle>평균 토큰</StatTitle><StatValue color="#7c3aed">{stats.avgTokens}</StatValue></StatCard>
                        <StatCard><StatTitle>평균 응답시간</StatTitle><StatValue color="#ea580c">{stats.avgResponseTime}초</StatValue></StatCard>
                    </div>
                )}

                <div style={{ background: 'white', borderRadius: '0.75rem', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                    <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e5e7eb' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>API 로그 목록</h3>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <Table>
                            <thead>
                                <tr>
                                    <Th>ID</Th><Th>사용자</Th><Th>버전</Th><Th>상태</Th><Th>토큰</Th><Th>시간</Th><Th>액션</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.map(log => (
                                    <tr key={log.apilog_idx}>
                                        <Td>{log.apilog_idx}</Td>
                                        <Td>{log.member_idx}</Td>
                                        <Td>{log.apilog_version}</Td>
                                        <Td><StatusTag status={log.apilog_status}>{log.apilog_status}</StatusTag></Td>
                                        <Td>{(log.apilog_input_tokens || 0) + (log.apilog_output_tokens || 0)}</Td>
                                        <Td>{log.apilog_total_time}초</Td>
                                        <Td><button onClick={() => setSelectedLog(log)} style={{ color: '#4f46e5' }}>상세보기</button></Td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </div>

                {selectedLog && (
                    <ModalOverlay>
                        <ModalContent>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>API 로그 상세 - ID: {selectedLog.apilog_idx}</h3>
                                <button onClick={() => setSelectedLog(null)} style={{ color: '#6b7280' }}>✕</button>
                            </div>
                            <button onClick={() => handleSelectedLog(-1)} disabled={apiLogs.findIndex(log => log.apilog_idx === selectedLog?.apilog_idx) <= 0} style={{ fontSize: '1.5rem' }}>⬅️</button>
                            <button onClick={() => handleSelectedLog(1)} disabled={apiLogs.findIndex(log => log.apilog_idx === selectedLog?.apilog_idx) >= apiLogs.length - 1} style={{ fontSize: '1.5rem' }}>➡️</button>
                            <Section>
                                <SectionTitle>사용자 요청:</SectionTitle>
                                <SectionContent>
                                    {selectedLog.parsed_userMassage ? (
                                        <ul>
                                            {Object.entries(selectedLog.parsed_userMassage).map(([key, value]) => (
                                                <li key={key}><strong>{key}:</strong> {String(value)}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <>{selectedLog.parsed_prompt?.messages?.[1]?.content || '파싱 오류'}</>
                                    )}
                                </SectionContent>
                            </Section>
                            {(selectedLog.apilog_status === 'success' || selectedLog.apilog_status === 'exception') && selectedLog.parsed_response && (
                                <Section>
                                    <SectionTitle>AI 응답 (운동 루틴):</SectionTitle>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {Array.isArray(selectedLog.parsed_response) ? selectedLog.parsed_response.map((routine, idx) => (
                                            <RoutineCard key={idx}>
                                                <h5 style={{ fontWeight: '500', color: '#1e3a8a', marginBottom: '0.5rem' }}>{routine.routine_name}</h5>
                                                <ul style={{ paddingLeft: '1rem' }}>
                                                    {routine.exercises.map((ex, i) => {
                                                        const isValid = rawData.includes(ex.pt_name.replace(/\s+/g, ''));
                                                        return (
                                                            <Exercise key={i} style={{ color: isValid ? 'inherit' : 'red' }}>
                                                                {isValid ? '✅' : '❌'} {ex.pt_name}: {ex.set_volume} × {ex.set_count}회 × {ex.set_num}세트
                                                            </Exercise>
                                                        );
                                                    })}
                                                </ul>
                                            </RoutineCard>
                                        )) : <div>루틴 정보가 없거나 형식이 잘못되었습니다.</div>}
                                    </div>
                                </Section>
                            )}
                        </ModalContent>
                    </ModalOverlay>
                )}
            </Inner>
        </Container>
    );
};

export default AdminApiContainer;

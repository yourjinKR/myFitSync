import axios from 'axios';
import React, { useState, useEffect, useMemo } from 'react';
import { Container, Inner, Title, Button, Select, StatCard, StatTitle, StatValue, Table, Th, Td, StatusTag, ModalOverlay, ModalContent, Section, SectionTitle, SectionContent, RoutineCard, Exercise } from '../../styles/chartStyle';
import versionUtils from '../../util/utilFunc';

/** 로그 JSON 파싱 함수 */
function parseApiLogData(apiLogItem) {
    const version = apiLogItem.apilog_version;
    
    try {
        const parsedPrompt = JSON.parse(apiLogItem.apilog_prompt);
        const parsedResponse = JSON.parse(apiLogItem.apilog_response);
        // 응답 - 호출 = 답변 속도
        const response_time = new Date(apiLogItem.apilog_response_time).getTime();
        const request_time = new Date(apiLogItem.apilog_request_time).getTime();

        let parsedUserMassage = null;
        if (versionUtils.isVersionAtLeast(version, "0.0.7")) {
            // 0.0.7 이상이면 실행
            parsedUserMassage = JSON.parse(parsedPrompt.messages[1]?.content);
            // 분할 수 체크
            if(parsedUserMassage.split==parsedResponse.length) {
                parsedUserMassage = {...parsedUserMassage, isSplit : true}
            }
        }   

        return {
            ...apiLogItem,
            parsed_prompt: parsedPrompt,
            parsed_response: parsedResponse,
            parsed_userMassage: parsedUserMassage,
            apilog_total_time: (response_time - request_time) / 1000 // 초 단위로 변환
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
    const [dateRange, setDateRange] = useState('today');

    const [rawData, setRawData] = useState(null); // 백엔드에서 받은 JSON 문자열

    const handleSelectedLog = (num) => {
        if (!selectedLog) return;

        const currentIndex = apiLogs.findIndex(log => log.apilog_idx === selectedLog.apilog_idx);
        const newIndex = currentIndex + num;

        if (newIndex >= 0 && newIndex < apiLogs.length) {
            setSelectedLog(apiLogs[newIndex]);
        }
    };

    // 컴포넌트 최초 마운트 시 운동명 리스트 요청
    useEffect(() => {
        const fetchWorkoutNames = async () => {
        try {
            const response = await axios.get('/ai/getTextReact'); // 서버 주소에 맞게 조정
            const parseList = response.data.map(name => name.replace(/\s+/g, '')); 
            setRawData(parseList); // 문자열 형태의 JSON 배열: '["벤치프레스", "랫풀다운", ...]'
        } catch (error) {
            console.error('운동명 목록 요청 실패:', error);
        }
    };

        fetchWorkoutNames();
    }, []); // 최초 렌더링에 한 번만 실행    

    // 모든 API 로그를 가져오는 함수
    const getAllApi = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/admin/getAllApi');
            const parsedLogs = response.data.map(item => parseApiLogData(item));
            setApiLogs(parsedLogs);
            console.log('파싱된 API 로그:', parsedLogs);
        } catch (error) {
            console.error('API 로그 가져오기 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    // 통계 데이터 계산
    const getStatistics = () => {
        if (apiLogs.length === 0) return null;

        const totalRequests = apiLogs.length;
        const successRate = (apiLogs.filter(log => log.apilog_status === 'success').length / totalRequests * 100).toFixed(1);
        const avgTokens = (apiLogs.reduce((sum, log) => sum + (log.apilog_input_tokens || 0) + (log.apilog_output_tokens || 0), 0) / totalRequests).toFixed(0);
        const avgResponseTime = (apiLogs.reduce((sum, log) => sum + (log.apilog_response_time - log.apilog_request_time), 0) / totalRequests / 1000).toFixed(2);

        return { totalRequests, successRate, avgTokens, avgResponseTime };
    };

    // 차트 데이터 준비
    const getChartData = () => {
        const hourlyData = {};
        const modelData = {};
        const statusData = { success: 0, error: 0 };

        apiLogs.forEach(log => {
            // 시간별 데이터
            const hour = new Date(log.apilog_request_time).getHours();
            hourlyData[hour] = (hourlyData[hour] || 0) + 1;

            // 모델별 데이터
            modelData[log.apilog_model] = (modelData[log.apilog_model] || 0) + 1;

            // 상태별 데이터
            statusData[log.apilog_status] = (statusData[log.apilog_status] || 0) + 1;
        });

        const timeSeriesData = Array.from({ length: 24 }, (_, i) => ({
            hour: `${i}:00`,
            requests: hourlyData[i] || 0
        }));

        const modelChartData = Object.entries(modelData).map(([model, count]) => ({
            model,
            count
        }));

        const statusChartData = Object.entries(statusData).map(([status, count]) => ({
            name: status,
            value: count
        }));

        return { timeSeriesData, modelChartData, statusChartData };
    };

    const stats = getStatistics();
    const chartData = getChartData();
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    useEffect(() => {
        getAllApi();
    }, []);

    return (
        <Container>
            <Inner>
                <Title>API 모니터링 대시보드</Title>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <Button onClick={getAllApi} disabled={loading}>
                        {loading ? '로딩 중...' : 'API 로그 새로고침'}
                    </Button>
                    <Select value={filter} onChange={(e) => setFilter(e.target.value)}>
                        <option value="all">전체</option>
                        <option value="success">성공</option>
                        <option value="error">오류</option>
                        <option value="exception">예외</option>
                    </Select>
                </div>

                {/* 통계 카드 */}
                {stats && (
                    <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '2rem' }}>
                        <StatCard><StatTitle>총 요청 수</StatTitle><StatValue color="#2563eb">{stats.totalRequests}</StatValue></StatCard>
                        <StatCard><StatTitle>성공률</StatTitle><StatValue color="#059669">{stats.successRate}%</StatValue></StatCard>
                        <StatCard><StatTitle>평균 토큰</StatTitle><StatValue color="#7c3aed">{stats.avgTokens}</StatValue></StatCard>
                        <StatCard><StatTitle>평균 응답시간</StatTitle><StatValue color="#ea580c">{stats.avgResponseTime}초</StatValue></StatCard>
                    </div>
                )}

                {/* 테이블 */}
                <div style={{ background: 'white', borderRadius: '0.75rem', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                    <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e5e7eb' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>API 로그 목록</h3>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <Table>
                            <thead>
                                <tr>
                                    <Th>ID</Th>
                                    <Th>사용자</Th>
                                    {/* <Th>모델</Th> */}
                                    <Th>버전</Th>
                                    <Th>상태</Th>
                                    <Th>토큰</Th>
                                    <Th>시간</Th>
                                    <Th>액션</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {apiLogs
                                    .filter(log => filter === 'all' || log.apilog_status === filter)
                                    .map(log => (
                                        <tr key={log.apilog_idx}>
                                            <Td>{log.apilog_idx}</Td>
                                            <Td>{log.member_idx}</Td>
                                            {/* <Td>{log.apilog_model}</Td> */}
                                            <Td>{log.apilog_version}</Td>
                                            <Td><StatusTag status={log.apilog_status}>{log.apilog_status}</StatusTag></Td>
                                            <Td>{(log.apilog_input_tokens || 0) + (log.apilog_output_tokens || 0)}</Td>
                                            <Td>{log.apilog_total_time}초</Td>
                                            <Td>
                                                <button onClick={() => setSelectedLog(log)} style={{ color: '#4f46e5' }}>상세보기</button>
                                            </Td>
                                        </tr>
                                    ))}
                            </tbody>
                        </Table>
                    </div>
                </div>

                {/* 모달 */}
                {selectedLog && (
                    <ModalOverlay>
                        <ModalContent>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>API 로그 상세 - ID: {selectedLog.apilog_idx}</h3>
                                <button onClick={() => setSelectedLog(null)} style={{ color: '#6b7280' }}>✕</button>
                            </div>
                            
                            <button onClick={() => handleSelectedLog(-1)} disabled={apiLogs.findIndex(log => log.apilog_idx === selectedLog?.apilog_idx) <= 0} style={{ fontSize: '1.5rem'}}>⬅️</button>
                            <button onClick={() => handleSelectedLog(1)} disabled={apiLogs.findIndex(log => log.apilog_idx === selectedLog?.apilog_idx) >= apiLogs.length - 1} style={{ fontSize: '1.5rem'}}>➡️</button>
                            <Section>
                                <SectionTitle>사용자 요청:</SectionTitle>
                                <SectionContent>
                                    {selectedLog.parsed_userMassage ? (
                                        <ul>
                                            {Object.entries(selectedLog.parsed_userMassage).map(([key, value]) => (
                                            <li key={key}>
                                                <strong>{key}:</strong> {String(value)}
                                            </li>
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
                                        {Array.isArray(selectedLog.parsed_response) ? (
                                            selectedLog.parsed_response.map((routine, index) => (
                                            <RoutineCard key={index}>
                                                <h5 style={{ fontWeight: '500', color: '#1e3a8a', marginBottom: '0.5rem' }}>
                                                {routine.routine_name}
                                                </h5>
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
                                            ))
                                        ) : (
                                            <div>루틴 정보가 없거나 형식이 잘못되었습니다.</div>
                                        )}
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
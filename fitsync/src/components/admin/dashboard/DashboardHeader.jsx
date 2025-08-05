import React from 'react';
import { Title } from '../../../styles/chartStyle';

/**
 * 대시보드 헤더 컴포넌트
 * @param {Object} props
 * @param {boolean} props.autoRefresh - 자동 새로고침 상태
 * @param {Function} props.setAutoRefresh - 자동 새로고침 상태 변경 함수
 */
const DashboardHeader = ({ autoRefresh, setAutoRefresh }) => {
    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '2rem' 
        }}>
            <Title>🚀 API 모니터링 대시보드</Title>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    fontSize: '1.6rem' 
                }}>
                    <input 
                        type="checkbox" 
                        checked={autoRefresh} 
                        onChange={(e) => setAutoRefresh(e.target.checked)} 
                    />
                    자동 새로고침 (30초)
                </label>
            </div>
        </div>
    );
};

export default DashboardHeader;

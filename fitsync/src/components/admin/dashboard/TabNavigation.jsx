import React from 'react';
import styled from 'styled-components';

/**
 * 탭 네비게이션 컴포넌트
 * @param {Object} props
 * @param {string} props.activeTab - 현재 활성 탭
 * @param {Function} props.setActiveTab - 탭 변경 함수
 * @param {Function} props.fetchApiLogs - API 로그 새로고침 함수
 * @param {boolean} props.loading - 로딩 상태
 */
const TabNavigation = ({ activeTab, setActiveTab, fetchApiLogs, loading }) => {
    const tabs = [
        { id: 'overview', label: '📊 개요', icon: '📊' },
        { id: 'tokens', label: '💰 비용', icon: '💰' },
        { id: 'analytics', label: '📈 분석', icon: '📈' },
        { id: 'logs', label: '📋 로그', icon: '📋' },
        // { id: 'performance', label: '⚡ 성능', icon: '⚡' }
    ];

    return (
        <TabContainer>
            <TabsWrapper>
                {tabs.map(tab => (
                    <TabButton
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        isActive={activeTab === tab.id}
                    >
                        {tab.label}
                    </TabButton>
                ))}
            </TabsWrapper>
            
            <RefreshButtonWrapper>
                <RefreshButton onClick={fetchApiLogs} disabled={loading}>
                    {loading ? '🔄 로딩 중...' : '🔄 새로고침'}
                </RefreshButton>
            </RefreshButtonWrapper>
        </TabContainer>
    );
};

const TabContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.8rem;
    margin-bottom: 3.2rem;
    border-bottom: 1px solid var(--border-light);
    padding-bottom: 0;
    
    @media (max-width: 768px) {
        gap: 0.4rem;
        margin-bottom: 2.4rem;
        flex-direction: column;
        align-items: flex-start;
    }
`;

const TabsWrapper = styled.div`
    display: flex;
    gap: 0.8rem;
    
    @media (max-width: 768px) {
        gap: 0.4rem;
        overflow-x: auto;
        scrollbar-width: none;
        -ms-overflow-style: none;
        width: 100%;
        
        &::-webkit-scrollbar {
            display: none;
        }
    }
`;

const RefreshButtonWrapper = styled.div`
    display: flex;
    align-items: center;
    
    @media (max-width: 768px) {
        width: 100%;
        justify-content: flex-end;
        margin-top: 1rem;
    }
`;

const RefreshButton = styled.button`
    padding: 0.8rem 1.6rem;
    background: var(--primary-blue);
    color: white;
    border: none;
    border-radius: 0.6rem;
    font-size: 1.3rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    
    &:hover:not(:disabled) {
        background: var(--primary-blue-hover);
        transform: translateY(-1px);
    }
    
    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }
    
    &:active:not(:disabled) {
        transform: translateY(0);
    }
    
    @media (max-width: 768px) {
        padding: 0.8rem 1.4rem;
        font-size: 1.2rem;
    }
`;

const TabButton = styled.button`
    padding: 1.2rem 2.4rem;
    border: none;
    background: ${props => props.isActive ? 'var(--primary-blue)' : 'var(--bg-secondary)'};
    color: ${props => props.isActive ? 'var(--text-primary)' : 'var(--text-secondary)'};
    border-radius: 0.8rem 0.8rem 0 0;
    cursor: pointer;
    font-size: 1.4rem;
    font-weight: ${props => props.isActive ? '600' : '400'};
    transition: all 0.2s ease;
    white-space: nowrap;
    min-width: fit-content;
    
    &:hover {
        background: ${props => props.isActive ? 'var(--primary-blue-hover)' : 'var(--bg-tertiary)'};
        color: var(--text-primary);
    }
    
    &:focus {
        outline: 2px solid var(--primary-blue);
        outline-offset: 2px;
    }
    
    @media (max-width: 768px) {
        padding: 1rem 1.6rem;
        font-size: 1.2rem;
    }
`;

export default TabNavigation;

import React from 'react';
import styled from 'styled-components';

/**
 * 탭 네비게이션 컴포넌트
 * @param {Object} props
 * @param {string} props.activeTab - 현재 활성 탭
 * @param {Function} props.setActiveTab - 탭 변경 함수
 */
const TabNavigation = ({ activeTab, setActiveTab }) => {
    const tabs = [
        { id: 'overview', label: '📊 개요', icon: '📊' },
        { id: 'analytics', label: '📈 분석', icon: '📈' },
        { id: 'logs', label: '📋 로그', icon: '📋' },
        // { id: 'performance', label: '⚡ 성능', icon: '⚡' }
    ];

    return (
        <TabContainer>
            {tabs.map(tab => (
                <TabButton
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    isActive={activeTab === tab.id}
                >
                    {tab.label}
                </TabButton>
            ))}
        </TabContainer>
    );
};

const TabContainer = styled.div`
    display: flex;
    gap: 0.8rem;
    margin-bottom: 3.2rem;
    border-bottom: 1px solid var(--border-light);
    padding-bottom: 0;
    
    @media (max-width: 768px) {
        gap: 0.4rem;
        margin-bottom: 2.4rem;
        overflow-x: auto;
        scrollbar-width: none;
        -ms-overflow-style: none;
        
        &::-webkit-scrollbar {
            display: none;
        }
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

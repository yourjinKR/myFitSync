import React from 'react';

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
        <div style={{ 
            display: 'flex', 
            gap: '0.5rem', 
            marginBottom: '2rem', 
            borderBottom: '1px solid #e5e7eb' 
        }}>
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                        padding: '0.75rem 1.5rem',
                        border: 'none',
                        background: activeTab === tab.id ? '#4f46e5' : 'transparent',
                        color: activeTab === tab.id ? 'white' : '#6b7280',
                        borderRadius: '0.5rem 0.5rem 0 0',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: activeTab === tab.id ? '600' : '400',
                        transition: 'all 0.2s'
                    }}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

export default TabNavigation;

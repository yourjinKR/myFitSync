import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import googleAuthManager from '../util/googleAuth';

const GoogleLoginButton = ({ onLoginSuccess, onLoginFailure, buttonOptions = {} }) => {
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState(null);
    const buttonRef = useRef(null);

    useEffect(() => {
        initializeButton();

        return () => {
            // 컴포넌트가 언마운트될 때 버튼을 정리합니다.
            if (buttonRef.current) {
                buttonRef.current.innerHTML = '';
            }
        };
    }, []);

    const initializeButton = async () => {
        try {
            setError(null);

            // Google Auth API 초기화 (전역에서 한 번만)
            await googleAuthManager.initialize();

            // Google 로그인 버튼을 렌더링
            if (buttonRef.current) {
                buttonRef.current.innerHTML = ''; // 기존 버튼을 제거
                googleAuthManager.renderButton(
                    buttonRef.current,
                    handleCredentialResponse, // 로그인 후 처리 함수
                    buttonOptions
                );
                setIsReady(true);
            }

        } catch (err) {
            console.error('Google 로그인 버튼 초기화 실패:', err);
            setError(err.message);
        }
    };

    const handleCredentialResponse = async (response) => {
        try {
            const idToken = response.credential; // JWT 토큰을 가져옵니다.

            // JWT를 서버로 전달하여 인증 처리
            const result = await axios.post('/auth/google', {
                idToken: idToken // 서버로 JWT 토큰을 보냅니다.
            }, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (result.data.success) {
                onLoginSuccess(result.data.user); // 로그인 성공
            } else {
                onLoginFailure(result.data.message); // 로그인 실패 메시지
            }

        } catch (error) {
            console.error('로그인 오류:', error);
            onLoginFailure('로그인 처리 중 오류가 발생했습니다.'); // 오류 메시지
        }
    };

    if (error) {
        return (
            <div style={{ padding: '10px', border: '1px solid #ff6b6b', borderRadius: '4px', backgroundColor: '#ffe0e0' }}>
                <div style={{ color: '#d63031', marginBottom: '10px' }}>
                    {error} {/* 오류 메시지 표시 */}
                </div>
                <button 
                    onClick={initializeButton} 
                    style={{ 
                        padding: '8px 16px', 
                        backgroundColor: '#0984e3', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    다시 시도
                </button>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '40px' }}>
            {!isReady && (
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px',
                    padding: '10px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '4px'
                }}>
                    <div className="spinner" style={{
                        width: '20px',
                        height: '20px',
                        border: '2px solid #e9ecef',
                        borderTop: '2px solid #0984e3',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                    <span>Google 로그인 준비 중...</span>
                </div>
            )}

            <div 
                ref={buttonRef} 
                style={{ 
                    display: isReady ? 'block' : 'none' 
                }}
            />
        </div>
    );
};

export default GoogleLoginButton;

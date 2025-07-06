// src/utils/googleAuth.js - 전역 Google API 관리
class GoogleAuthManager {
    constructor() {
        this.isScriptLoaded = false;
        this.isInitialized = false;
        this.clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
        this.loadPromise = null;
    }
    
    // Google 스크립트 로드 (앱 전체에서 한 번만)
    loadScript() {
        if (this.loadPromise) {
            return this.loadPromise;
        }
        
        // 이미 로드된 경우
        if (window.google && window.google.accounts) {
            this.isScriptLoaded = true;
            return Promise.resolve();
        }
        
        this.loadPromise = new Promise((resolve, reject) => {
            const existingScript = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
            
            if (existingScript) {
                if (window.google && window.google.accounts) {
                    this.isScriptLoaded = true;
                    resolve();
                } else {
                    existingScript.addEventListener('load', () => {
                        this.isScriptLoaded = true;
                        resolve();
                    });
                    existingScript.addEventListener('error', reject);
                }
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            
            script.onload = () => {
                this.isScriptLoaded = true;
                resolve();
            };
            
            script.onerror = () => {
                reject(new Error('Google 스크립트 로드 실패'));
            };
            
            document.head.appendChild(script);
        });
        
        return this.loadPromise;
    }
    
    // Google API 초기화 (앱 전체에서 한 번만)
    async initialize() {
        if (this.isInitialized) {
            return;
        }
        
        if (!this.isScriptLoaded) {
            await this.loadScript();
        }
        
        if (!this.clientId) {
            throw new Error('Google Client ID가 설정되지 않았습니다.');
        }
        
        // 약간의 지연을 두고 초기화
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (!window.google || !window.google.accounts) {
            throw new Error('Google API를 사용할 수 없습니다.');
        }
        
        this.isInitialized = true;
    }
    
    // 버튼 렌더링
    renderButton(element, callback, options = {}) {
        if (!this.isInitialized) {
            throw new Error('Google API가 초기화되지 않았습니다.');
        }
        
        const defaultOptions = {
            theme: 'outline',
            size: 'large',
            width: 250,
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left'
        };
        
        window.google.accounts.id.initialize({
            client_id: this.clientId,
            callback: callback,
            auto_select: false,
            cancel_on_tap_outside: true
        });
        
        window.google.accounts.id.renderButton(element, { ...defaultOptions, ...options });
    }
    
    // 로그아웃
    logout() {
        if (window.google && window.google.accounts) {
            window.google.accounts.id.disableAutoSelect();
        }
    }
}

// 싱글톤 인스턴스 생성
const googleAuthManager = new GoogleAuthManager();
export default googleAuthManager;
import { createGlobalStyle } from 'styled-components';
import '@fontsource/noto-sans-kr';

const GlobalStyle = createGlobalStyle`
  /* CSS 변수로 컬러 팔레트 정의 */
  :root {
    /* 배경 컬러 */
    --bg-primary: #1a1a1a;        /* 메인 배경 (검정+회색) */
    --bg-secondary: #2a2a2a;      /* 카드/컨테이너 배경 */
    --bg-tertiary: #3a3a3a;       /* 호버/활성 상태 */
    --bg-white: #ffffff;     
    
    /* 텍스트 컬러 */
    --text-primary: #ffffff;       /* 주요 텍스트 */
    --text-secondary: #b0b0b0;     /* 보조 텍스트 */
    --text-tertiary: #808080;      /* 비활성 텍스트 */
    --text-black: #222;
    
    /* 포인트 컬러 (파란색 계열) */
    --primary-blue: #4A90E2;       /* 메인 블루 */
    --primary-blue-hover: #357ABD; /* 호버 블루 */
    --primary-blue-light: #6BA3E8; /* 라이트 블루 */
    --primary-blue-dark: #2C5F8A;  /* 다크 블루 */
    
    /* 상태 컬러 */
    --success: #2e8b57;
    --warning: #F44336;
    --info: var(--primary-blue);
    
    /* 보더 컬러 */
    --border-light: #404040;
    --border-medium: #606060;
    --border-dark: #808080;

    --check-green: #4CAF50; /* 체크박스 체크 색상 */

    --start-red: #F44336; /* 체크박스 체크 색상 */
    --stop-green: #4CAF50; /* 체크박스 체크 색상 */
    --reset-gay: #808080; /* 체크박스 체크 색상 */
  }

  /* reset.css 기반 */
  *, *::before, *::after {
    margin: 0;
    padding: 0;
    border: 0;
    box-sizing: border-box;
    font-size: 10px;
    color: var(--text-primary);
  }

  @media (max-width: 750px) {
    *, *::before, *::after {
      font-size: 1.4vw; /* 모바일에서 폰트 크기 조정 */
    }
  }
 
  @media (max-width: 500px) {
    *, *::before, *::after {
      font-size: 1.6vw; /* 모바일에서 폰트 크기 조정 */
    }
  }
 
  html, body {
    height: 100%;
    font-family: 'Noto Sans KR', sans-serif;
    background-color: var(--bg-primary);
    color: var(--text-primary);
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  ul, ol {
    list-style: none;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  button {
    background: none;
    border: none;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.2s ease;
  }

  input, textarea {
    font-family: inherit;
    outline: none;
    border: none;
    background-color: var(--bg-secondary);
    color: var(--text-primary);
    border-radius: 8px;
    padding: 12px;
    border: 1px solid var(--border-light);
    
    &::placeholder {
      color: var(--text-tertiary);
    }
  }

  /* 스크롤바 스타일링 */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: var(--bg-secondary);
  }

  ::-webkit-scrollbar-thumb {
    background: var(--border-medium);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: var(--border-dark);
  }
`;

export default GlobalStyle;
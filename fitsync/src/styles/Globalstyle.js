import { createGlobalStyle } from 'styled-components';
import '@fontsource/noto-sans-kr';

const GlobalStyle = createGlobalStyle`
  /* reset.css 기반 */
  *, *::before, *::after {
    margin: 0;
    padding: 0;
    border: 0;
    box-sizing: border-box;
    font-size:10px;
  }
 
  html, body {
    height: 100%;
    font-family: 'Noto Sans KR', sans-serif;
    background-color: #fff;
    color: #000;
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
  }

  input, textarea {
    font-family: inherit;
    outline: none;
    border: none;
  }
`;

export default GlobalStyle;
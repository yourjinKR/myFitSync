// api/client.js
import axios from 'axios';

const baseURL =
  process.env.REACT_APP_API_BASE_URL /* CRA */ ??
  '';

const api = axios.create({
  baseURL,
  withCredentials: false,        // 쿠키가 필요하면 true
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
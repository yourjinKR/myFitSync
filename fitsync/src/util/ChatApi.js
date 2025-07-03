import axios from 'axios';

// 모든 요청에 쿠키 포함
axios.defaults.withCredentials = true;

const chatApi = {
  // 채팅방 생성 또는 조회
  registerRoom: async (trainer_idx, user_idx, room_name) => {
    const response = await axios.post('/api/chat/room', {
      trainer_idx,
      room_name
    }, { withCredentials: true });
    return response.data;
  },

  // 사용자 채팅방 목록 조회
  readRoomList: async () => {
    const response = await axios.get('/api/chat/rooms', {
      withCredentials: true
    });
    return response.data;
  },

  // 채팅방 메시지 목록 조회
  readMessageList: async (room_idx, page = 0, size = 50) => {
    const response = await axios.get(`/api/chat/room/${room_idx}/messages`, {
      params: { page, size },
      withCredentials: true
    });
    return response.data;
  },

  // 메시지 검색
  searchMessage: async (room_idx, keyword) => {
    const response = await axios.get(`/api/chat/room/${room_idx}/search`, {
      params: { keyword },
      withCredentials: true
    });
    return response.data;
  },

  // 읽지 않은 메시지 수 조회
  unreadCount: async (room_idx) => {
    const response = await axios.get(`/api/chat/room/${room_idx}/unread`, {
      withCredentials: true
    });
    return response.data;
  },

  // 파일 업로드
  uploadFile: async (file, message_idx) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('message_idx', message_idx);

    const response = await axios.post('/api/chat/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      withCredentials: true
    });
    return response.data;
  },

  // 첨부파일 삭제
  deleteFile: async (attach_idx) => {
    const response = await axios.delete(`/api/chat/file/${attach_idx}`, {
      withCredentials: true
    });
    return response.data;
  },

  // 메시지 첨부파일 조회
  readFile: async (message_idx) => {
    const response = await axios.get(`/api/chat/message/${message_idx}/files`, {
      withCredentials: true
    });
    return response.data;
  }
};

export default chatApi;
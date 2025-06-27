import axios from 'axios';

const chatApi = {
  // 채팅방 생성 또는 조회
  registerRoom: async (trainer_idx, user_idx, room_name) => {
    const response = await axios.post('/api/chat/room', {
      trainer_idx,
      user_idx,
      room_name
    });
    return response.data;
  },

  // 사용자 채팅방 목록 조회
  readRoomList: async (member_idx) => {
    const response = await axios.get(`/api/chat/rooms/${member_idx}`);
    return response.data;
  },

  // 채팅방 메시지 목록 조회
  readMessageList: async (room_idx, page = 0, size = 50) => {
    const response = await axios.get(`/api/chat/room/${room_idx}/messages`, {
      params: { page, size }
    });
    return response.data;
  },

  // 메시지 검색
  searchMessage: async (room_idx, keyword) => {
    const response = await axios.get(`/api/chat/room/${room_idx}/search`, {
      params: { keyword }
    });
    return response.data;
  },

  // 읽지 않은 메시지 수 조회
  unreadCount: async (room_idx, receiver_idx) => {
    const response = await axios.get(`/api/chat/room/${room_idx}/unread/${receiver_idx}`);
    return response.data;
  },

  // 파일 업로드
  uploadFile: async (file, message_idx) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('message_idx', message_idx);

    const response = await axios.post('/api/chat/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // 첨부파일 삭제
  deleteFile: async (attach_idx) => {
    const response = await axios.delete(`/api/chat/file/${attach_idx}`);
    return response.data;
  },

  // 메시지 첨부파일 조회
  readFile: async (message_idx) => {
    const response = await axios.get(`/api/chat/message/${message_idx}/files`);
    return response.data;
  }
};

export default chatApi;
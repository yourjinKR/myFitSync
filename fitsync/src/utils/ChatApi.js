import axios from 'axios';

// 모든 요청에 쿠키 포함
axios.defaults.withCredentials = true;

// 매칭 상태 조회 캐시 관리
const matchingStatusCache = new Map();
const CACHE_EXPIRY_TIME = 30000; // 30초

// 채팅 API통신 담당모듈
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
  },

  // 매칭 요청 생성
  createMatching: async (user_idx, matching_total) => {
    const response = await axios.post('/api/chat/matching', {
      user_idx,
      matching_total
    }, { withCredentials: true });
    return response.data;
  },

  // 매칭 수락 완료
  acceptMatching: async (matching_idx) => {
    // 수락 시 해당 매칭의 캐시 무효화
    matchingStatusCache.delete(matching_idx);
    
    const response = await axios.put(`/api/chat/accept/${matching_idx}`, {}, {
      withCredentials: true
    });
    return response.data;
  },

  // 현재 회원의 모든 진행중인 매칭 확인
  checkAnyActiveMatching: async () => {
    const response = await axios.get('/api/chat/check-any-active-matching', {
      withCredentials: true
    });
    return response.data;
  },

  // 최적화된 매칭 상태 조회 (캐시 포함)
  getMatchingStatus: async (matching_idx, forceRefresh = false) => {
    const cacheKey = matching_idx;
    const now = Date.now();

    // 강제 새로고침이 아니고 캐시에 유효한 데이터가 있으면 반환
    if (!forceRefresh && matchingStatusCache.has(cacheKey)) {
      const cachedData = matchingStatusCache.get(cacheKey);
      if (now - cachedData.timestamp < CACHE_EXPIRY_TIME) {
        return cachedData.data;
      } else {
        // 캐시 만료시 삭제
        matchingStatusCache.delete(cacheKey);
      }
    }

    try {
      const response = await axios.get(`/api/chat/matching/${matching_idx}/status`, {
        withCredentials: true
      });

      // 성공한 경우에만 캐시에 저장
      if (response.data.success) {
        matchingStatusCache.set(cacheKey, {
          data: response.data,
          timestamp: now
        });
        
        // 캐시 크기 관리 (최대 50개)
        if (matchingStatusCache.size > 50) {
          const firstKey = matchingStatusCache.keys().next().value;
          matchingStatusCache.delete(firstKey);
        }
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 복합 할인 매칭 가격 계산 API
  calculateMatchingPrice: async (matching_total) => {
    try {
      const response = await axios.get(`/api/chat/matching/price/${matching_total}`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      throw error;
    }
  },

  // 매칭 상태 캐시 전체 삭제
  clearMatchingStatusCache: () => {
    matchingStatusCache.clear();
  },

  // 특정 매칭의 캐시 무효화
  invalidateMatchingStatusCache: (matching_idx) => {
    if (matchingStatusCache.has(matching_idx)) {
      matchingStatusCache.delete(matching_idx);
      return true;
    }
    return false;
  },

  // 캐시 정보 조회 (디버깅용)
  getCacheInfo: () => {
    const cacheEntries = Array.from(matchingStatusCache.entries()).map(([key, value]) => ({
      matching_idx: key,
      timestamp: value.timestamp,
      age: Date.now() - value.timestamp,
      isExpired: Date.now() - value.timestamp > CACHE_EXPIRY_TIME
    }));
    
    return {
      size: matchingStatusCache.size,
      entries: cacheEntries
    };
  }
};

// 주기적으로 만료된 캐시 정리 (10분마다)
setInterval(() => {
  const now = Date.now();
  const expiredKeys = [];
  
  for (const [key, value] of matchingStatusCache.entries()) {
    if (now - value.timestamp > CACHE_EXPIRY_TIME) {
      expiredKeys.push(key);
    }
  }
  
  expiredKeys.forEach(key => matchingStatusCache.delete(key));
}, 10 * 60 * 1000); // 10분

export default chatApi;
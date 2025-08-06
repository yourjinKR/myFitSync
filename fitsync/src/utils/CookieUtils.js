// 쿠키 설정 함수
export const setCookie = (name, value, days = 30) => {
  try {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  } catch (error) {
    console.warn('쿠키 설정 실패:', error);
  }
};

// 쿠키 조회 함수
export const getCookie = (name) => {
  try {
    const nameEQ = name + "=";
    const cookiesArray = document.cookie.split(';');
    
    for (let cookie of cookiesArray) {
      let trimmedCookie = cookie.trim();
      if (trimmedCookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(trimmedCookie.substring(nameEQ.length));
      }
    }
    return null;
  } catch (error) {
    console.warn('쿠키 조회 실패:', error);
    return null;
  }
};

// 쿠키 삭제 함수
export const deleteCookie = (name) => {
  try {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
  } catch (error) {
    console.warn('쿠키 삭제 실패:', error);
  }
};

// 채팅방 방문 기록 확인 함수
export const hasVisitedChatRoom = (roomId) => {
  try {
    const visitedRoomsJson = getCookie('visitedChatRooms');
    if (!visitedRoomsJson) {
      return false;
    }
    
    const visitedRooms = JSON.parse(visitedRoomsJson);
    return Array.isArray(visitedRooms) && visitedRooms.includes(String(roomId));
  } catch (error) {
    console.warn('채팅방 방문 기록 확인 실패:', error);
    return false;
  }
};

// 채팅방 방문 기록 추가 함수
export const markChatRoomAsVisited = (roomId) => {
  try {
    const roomIdStr = String(roomId);
    let visitedRooms = [];
    
    // 기존 방문 기록 가져오기
    const existingVisitedRoomsJson = getCookie('visitedChatRooms');
    if (existingVisitedRoomsJson) {
      try {
        const existingVisitedRooms = JSON.parse(existingVisitedRoomsJson);
        if (Array.isArray(existingVisitedRooms)) {
          visitedRooms = existingVisitedRooms;
        }
      } catch (parseError) {
        console.warn('기존 방문 기록 파싱 실패, 새로 시작:', parseError);
        visitedRooms = [];
      }
    }
    
    // 이미 방문한 채팅방이 아닌 경우에만 추가
    if (!visitedRooms.includes(roomIdStr)) {
      visitedRooms.push(roomIdStr);
      
      // 최대 50개까지만 저장 (메모리 절약)
      if (visitedRooms.length > 50) {
        visitedRooms = visitedRooms.slice(-50);
      }
      
      // 쿠키에 저장 (30일 유효)
      setCookie('visitedChatRooms', JSON.stringify(visitedRooms), 30);
    }
  } catch (error) {
    console.warn('채팅방 방문 기록 저장 실패:', error);
  }
};

// 모든 채팅방 방문 기록 삭제 함수 (설정 페이지 등에서 사용 가능)
export const clearAllChatRoomVisitHistory = () => {
  try {
    deleteCookie('visitedChatRooms');
  } catch (error) {
    console.warn('채팅방 방문 기록 삭제 실패:', error);
  }
};

// 방문 기록 통계 조회 함수 (디버깅용)
export const getChatRoomVisitStats = () => {
  try {
    const visitedRoomsJson = getCookie('visitedChatRooms');
    if (!visitedRoomsJson) {
      return {
        totalVisited: 0,
        visitedRooms: [],
        lastUpdated: null
      };
    }
    
    const visitedRooms = JSON.parse(visitedRoomsJson);
    return {
      totalVisited: Array.isArray(visitedRooms) ? visitedRooms.length : 0,
      visitedRooms: Array.isArray(visitedRooms) ? visitedRooms : [],
      cookieExists: true
    };
  } catch (error) {
    console.warn('방문 기록 통계 조회 실패:', error);
    return {
      totalVisited: 0,
      visitedRooms: [],
      error: error.message
    };
  }
};
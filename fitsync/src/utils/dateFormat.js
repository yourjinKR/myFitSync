function formatDate(date) {
  let result = '';
  const d = new Date(date || Date.now());
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  // const hours = String(d.getHours()).padStart(2, '0');
  // const minutes = String(d.getMinutes()).padStart(2, '0');
  // const seconds = String(d.getSeconds()).padStart(2, '0');
  // result = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  result = `${year}-${month}-${day}`;
  return result;
}

// 시간 차이를 상세하게 계산
function getTimeDifference(targetDate) {
  if (!targetDate) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  
  const now = new Date();
  const target = new Date(targetDate);
  
  const diffTime = Math.abs(now - target);
  
  const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffTime % (1000 * 60)) / 1000);
  
  return { days, hours, minutes, seconds, isPast: now > target };
}

// 날짜 차이를 텍스트로 반환 (시,분,초 포함)
function getDateDiffText(targetDate) {
  const timeDiff = getTimeDifference(targetDate);
  const { days, hours, minutes, seconds, isPast } = timeDiff;
  
  let result = '';
  
  // 1일 이상 차이나는 경우
  if (days > 0) {
    if (days > 7) {
      result = formatDate(targetDate)
    } else {
      result = isPast ? `${days}일 전` : `${days}일 후`;
    }
  }
  // 1일 미만인 경우 시간으로 표시
  else if (hours > 0) {
    result = isPast ? `${hours}시간 전` : `${hours}시간 후`;
  }
  // 1시간 미만인 경우 분으로 표시
  else if (minutes > 0) {
    result = isPast ? `${minutes}분 전` : `${minutes}분 후`;
  }
  // 1분 미만인 경우
  else {
    result = isPast ? `${seconds}초 전` : `${seconds}초 후`;
  }
  
  // 거의 같은 시간인 경우 (10초 이내)
  if (days === 0 && hours === 0 && minutes === 0 && seconds < 10) {
    result = '방금 전';
  }
  
  return result;
}

// 상세한 시간 차이 텍스트
function getDetailedTimeDiffText(targetDate) {
  const timeDiff = getTimeDifference(targetDate);
  const { days, hours, minutes, seconds, isPast } = timeDiff;
  
  let parts = [];
  
  if (days > 0) parts.push(`${days}일`);
  if (hours > 0) parts.push(`${hours}시간`);
  if (minutes > 0) parts.push(`${minutes}분`);
  if (seconds > 0 && days === 0 && hours === 0) parts.push(`${seconds}초`);
  
  if (parts.length === 0) return '방금 전';
  
  const timeText = parts.join(' ');
  return isPast ? `${timeText} 전` : `${timeText} 후`;
}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  formatDate, 
  getTimeDifference,
  getDateDiffText,
  getDetailedTimeDiffText
};
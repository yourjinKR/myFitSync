export const getWebSocketUrl = () => {
  const currentHost = window.location.hostname;
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  
  // 개발환경: localhost에서 접속
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    return `ws://localhost:7070/chat`;
  }
  
  // 로컬 네트워크: 192.168.x.x, 10.x.x.x, 172.x.x.x에서 접속
  if (currentHost.startsWith('192.168.') || 
      currentHost.startsWith('10.') || 
      currentHost.startsWith('172.')) {
    return `ws://${currentHost}:7070/chat`;
  }
  
  // 프로덕션: 현재 호스트 사용
  const port = window.location.port ? `:${window.location.port}` : '';
  return `${protocol}//${currentHost}${port}/chat`;
};

export const getNetworkInfo = () => {
  const hostname = window.location.hostname;
  console.log('🌐 현재 네트워크 정보:', {
    hostname,
    protocol: window.location.protocol,
    port: window.location.port,
    websocketUrl: getWebSocketUrl()
  });
  
  return {
    hostname,
    isLocal: hostname === 'localhost' || hostname === '127.0.0.1',
    isPrivateNetwork: hostname.startsWith('192.168.') || 
                     hostname.startsWith('10.') || 
                     hostname.startsWith('172.'),
    websocketUrl: getWebSocketUrl()
  };
};
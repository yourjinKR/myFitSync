// Vercel Functions를 사용한 프록시 대안 방법

export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', 'https://fitsyncproject.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Cookie, Set-Cookie');

  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // POST 요청만 허용
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // 백엔드 서버로 요청 프록시
    const backendUrl = 'https://chen-creature-receiving-media.trycloudflare.com/auth/google';
    
    console.log('Proxying request to:', backendUrl);
    console.log('Request body:', req.body);
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // 쿠키를 그대로 전달
        'Cookie': req.headers.cookie || '',
        // 기타 필요한 헤더들
        'User-Agent': req.headers['user-agent'] || '',
        'X-Forwarded-For': req.headers['x-forwarded-for'] || req.connection?.remoteAddress || '',
        'X-Real-IP': req.headers['x-real-ip'] || req.connection?.remoteAddress || ''
      },
      body: JSON.stringify(req.body)
    });

    console.log('Backend response status:', response.status);
    
    // 백엔드 응답 헤더에서 Set-Cookie 처리
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      res.setHeader('Set-Cookie', setCookieHeader);
    }

    // 응답 데이터 가져오기
    const data = await response.json();
    console.log('Backend response data:', data);

    // 백엔드 응답을 그대로 클라이언트에 전달
    res.status(response.status).json(data);

  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message,
      details: 'Failed to proxy request to backend server'
    });
  }
}
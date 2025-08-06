// Vercel Functions를 사용한 프록시 (확실한 대안)

export default async function handler(req, res) {
  console.log('=== Google Auth Proxy Function Started ===');
  console.log('Request method:', req.method);
  console.log('Request headers:', JSON.stringify(req.headers, null, 2));
  console.log('Request body:', JSON.stringify(req.body, null, 2));

  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', 'https://fitsyncproject.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Cookie, Set-Cookie');

  // OPTIONS 요청 처리 (CORS preflight)
  if (req.method === 'OPTIONS') {
    console.log('OPTIONS 요청 처리됨');
    res.status(200).end();
    return;
  }

  // POST 요청만 허용
  if (req.method !== 'POST') {
    console.log('POST가 아닌 요청:', req.method);
    res.status(405).json({ 
      error: 'Method not allowed',
      allowedMethod: 'POST',
      receivedMethod: req.method 
    });
    return;
  }

  try {
    // 백엔드 서버 URL
    const backendUrl = 'https://chen-creature-receiving-media.trycloudflare.com/auth/google';
    
    console.log('백엔드 요청 시작:', backendUrl);
    
    // 요청 헤더 구성
    const requestHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': req.headers['user-agent'] || 'Vercel-Function-Proxy',
      'X-Forwarded-For': req.headers['x-forwarded-for'] || req.connection?.remoteAddress || '',
      'X-Real-IP': req.headers['x-real-ip'] || req.connection?.remoteAddress || '',
      'X-Forwarded-Proto': 'https',
      'X-Forwarded-Host': 'fitsyncproject.vercel.app'
    };

    // 쿠키가 있으면 전달
    if (req.headers.cookie) {
      requestHeaders['Cookie'] = req.headers.cookie;
    }

    console.log('요청 헤더:', JSON.stringify(requestHeaders, null, 2));

    // 백엔드로 프록시 요청
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(req.body)
    });

    console.log('백엔드 응답 상태:', response.status);
    console.log('백엔드 응답 헤더:', JSON.stringify([...response.headers.entries()], null, 2));

    // 백엔드 응답에서 Set-Cookie 헤더 처리
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      console.log('Set-Cookie 헤더 감지:', setCookieHeader);
      res.setHeader('Set-Cookie', setCookieHeader);
    }

    // 응답 데이터 처리
    let responseData;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      const textData = await response.text();
      console.log('JSON이 아닌 응답:', textData);
      
      // HTML 응답인 경우 (에러 페이지 등)
      if (textData.includes('<!DOCTYPE html>') || textData.includes('<html>')) {
        responseData = {
          success: false,
          message: '백엔드 서버에서 HTML 응답을 받았습니다. 서버 설정을 확인해주세요.',
          details: 'Backend returned HTML instead of JSON'
        };
      } else {
        responseData = {
          success: false,
          message: '백엔드 서버에서 예상치 못한 응답을 받았습니다.',
          details: textData
        };
      }
    }

    console.log('처리된 응답 데이터:', JSON.stringify(responseData, null, 2));

    // 클라이언트에 응답 전달
    res.status(response.status).json(responseData);

  } catch (error) {
    console.error('=== Proxy Error ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // 네트워크 오류인지 확인
    if (error.cause && error.cause.code === 'ECONNREFUSED') {
      res.status(502).json({
        error: 'Backend connection failed',
        message: 'Cloudflare Tunnel이 실행되지 않았거나 백엔드 서버가 응답하지 않습니다.',
        details: 'ECONNREFUSED - Check if backend server is running'
      });
    } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
      res.status(502).json({
        error: 'Backend fetch failed',
        message: '백엔드 서버에 연결할 수 없습니다.',
        details: error.message
      });
    } else {
      res.status(500).json({
        error: 'Internal server error',
        message: '프록시 처리 중 오류가 발생했습니다.',
        details: error.message
      });
    }
  }
}
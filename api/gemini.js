export default async function handler(request, response) {
  // 1. 取得 App 發過來的 URL 路徑與參數
  const url = new URL(request.url, `https://${request.headers.host}`);
  
  // 2. 重新拼裝成 Google 官方的絕對路徑（完美對接 C# 端路由）
  const googleUrl = `https://generativelanguage.googleapis.com${url.pathname.replace('/api/[...gemini].js', '/v1beta/models')}${url.search}`;

  // 3. 處理語音 JSON 數據 Payload
  let bodyContent = null;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    bodyContent = JSON.stringify(request.body);
  }

  // 4. 複製並淨化 Headers 標頭，徹底移除殘留標籤
  const cleanHeaders = new Headers();
  for (const [key, value] of Object.entries(request.headers)) {
    if (!key.toLowerCase().startsWith('x-vercel-') && key.toLowerCase() !== 'host') {
      cleanHeaders.set(key, value);
    }
  }
  // 強迫將 Host 蓋印為 Google 官方名稱
  cleanHeaders.set('host', 'generativelanguage.googleapis.com');

  try {
    // 🌟 5. 由 Vercel 美國實體伺服器代為發出請求
    const res = await fetch(googleUrl, {
      method: request.method,
      headers: cleanHeaders,
      body: bodyContent
    });

    const data = await res.text();
    response.status(res.status).send(data);
  } catch (error) {
    response.status(500).send(error.message);
  }
}

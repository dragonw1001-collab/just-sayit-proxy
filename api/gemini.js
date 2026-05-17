export default async function handler(request, response) {
  const apiKey = request.query.key;
  
  if (!apiKey) {
    return response.status(400).send("Missing Gemini API Key.");
  }

  // 1. 定死終點站
  const googleUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

  // 2. 🌟 終極淨化：只保留最核心的 JSON 宣告與 Host，徹底丟棄會導致 fetch failed 的舊數據長度標籤
  const cleanHeaders = new Headers();
  cleanHeaders.set('Content-Type', 'application/json');
  cleanHeaders.set('host', 'generativelanguage.googleapis.com');

  // 3. 轉發內容主體
  let bodyContent = null;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    bodyContent = typeof request.body === 'string' ? request.body : JSON.stringify(request.body);
  }

  try {
    // 4. 由 Vercel 美國伺服器直發 Google
    const res = await fetch(googleUrl, {
      method: request.method,
      headers: cleanHeaders,
      body: bodyContent
    });

    const data = await res.text();
    response.status(res.status).send(data);
  } catch (error) {
    response.status(500).send("中轉站轉發失敗: " + error.message);
  }
}

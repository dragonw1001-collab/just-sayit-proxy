export default async function handler(request, response) {
  // 1. 直接從 Vercel 內建的 query 中抓取 C# 傳過來的 API Key
  const apiKey = request.query.key;
  
  if (!apiKey) {
    return response.status(400).send("Missing Gemini API Key in query parameters.");
  }

  // 2. 核心突破：直接將終點站鎖定在官方的 gemini-3-flash-preview
  const googleUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

  // 3. 處理語音 JSON 數據 Payload
  let bodyContent = null;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    // Vercel 會自動解析 body，我們將它轉回字串發給 Google
    bodyContent = JSON.stringify(request.body);
  }

  // 4. 複製並淨化 Headers 標頭
  const cleanHeaders = new Headers();
  for (const [key, value] of Object.entries(request.headers)) {
    if (!key.toLowerCase().startsWith('x-vercel-') && key.toLowerCase() !== 'host') {
      cleanHeaders.set(key, value);
    }
  }
  // 強迫將 Host 蓋印為 Google 官方名稱
  cleanHeaders.set('host', 'generativelanguage.googleapis.com');

  try {
    // 🌟 5. 由 Vercel 美國實體伺服器直發 Google 終點站
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

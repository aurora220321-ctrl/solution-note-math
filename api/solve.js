export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST 요청만 지원합니다.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ 
      error: 'Vercel 환경변수에 GEMINI_API_KEY가 설정되어 있지 않습니다.' 
    });
  }

  try {
    const { contents, systemInstruction } = req.body;

    if (!contents || !Array.isArray(contents)) {
      return res.status(400).json({ error: '유효한 요청 본문(contents)이 아닙니다.' });
    }

    const payload = { contents };
    if (systemInstruction) {
      payload.systemInstruction = systemInstruction;
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || 'Gemini API 호출에 실패했습니다.'
      });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: `서버 오류: ${err.message}` });
  }
}

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { messages } = JSON.parse(event.body);

    const geminiMessages = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const apiKey = process.env.GEMINI_API_KEY;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: geminiMessages,
          generationConfig: { temperature: 0.7, maxOutputTokens: 1000 }
        })
      }
    );

    const data = await response.json();
    
    if (data.error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ content: [{ type: 'text', text: 'GEMINI ERROR: ' + data.error.message }] })
      };
    }

    const aiMessage = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from Gemini';

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: [{ type: 'text', text: aiMessage }] })
    };
  } catch (error) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ content: [{ type: 'text', text: 'CATCH ERROR: ' + error.message }] }) 
    };
  }
};
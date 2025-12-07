// Fix for Node not having fetch by default in Netlify Functions
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed"
    };
  }

  try {
    const body = JSON.parse(event.body);
    const userMessages = body.messages || [];

    // Convert frontend messages to Gemini format
    const geminiMessages = userMessages.map(msg => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }]
    }));

    // System prompt for the AI's personality
    const systemPrompt = `
      You are LaunchPath AI — a smart, helpful assistant 
      specializing in business, finance, entrepreneurship, 
      productivity, school support, and motivation.
    `;

    // Fetch from Google Gemini API using Netlify environment key
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: geminiMessages,
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000
          }
        })
      }
    );

    const data = await response.json();

    // Extract AI response
    const aiText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, something went wrong.";

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: [{ type: "text", text: aiText }]
      })
    };

  } catch (err) {
    console.error("Function Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Server error — check Netlify logs."
      })
    };
  }
};

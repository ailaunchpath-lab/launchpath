export const handler = async (event) => {
  try {
    const { message } = JSON.parse(event.body);

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Missing API key" }),
      };
    }

    const completion = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + apiKey,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: message }],
            },
          ],
        }),
      }
    );

    const data = await completion.json();

    if (!data.candidates || !data.candidates.length) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "No response from AI model" }),
      };
    }

    const reply =
      data.candidates[0].content.parts[0].text ||
      "No response generated.";

    return {
      statusCode: 200,
      body: JSON.stringify({ reply }),
      headers: { "Content-Type": "application/json" },
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Server error",
        details: err.message,
      }),
    };
  }
};

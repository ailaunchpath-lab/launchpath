import fetch from "node-fetch";

export const handler = async (event, context) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const messages = body.messages || [];

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" +
        process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: messages.map((m) => ({
                text: m.content,
              })),
            },
          ],
        }),
      }
    );

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error("Function error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error" }),
    };
  }
};

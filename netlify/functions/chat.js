export default async (request) => {
  try {
    const { message } = JSON.parse(request.body);

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing API key" }), {
        status: 500,
      });
    }

    const completion = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
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
      return new Response(
        JSON.stringify({ error: "No response from AI model" }),
        { status: 500 }
      );
    }

    const aiResponse =
      data.candidates[0].content.parts[0].text || "No response generated.";

    return new Response(JSON.stringify({ reply: aiResponse }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Server error", details: err.message }), {
      status: 500,
    });
  }
};

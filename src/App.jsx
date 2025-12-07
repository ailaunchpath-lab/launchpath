const response = await fetch("/.netlify/functions/chat", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ message: input }),
});

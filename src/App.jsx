import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

export default function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(null);

  // Listen for auth changes
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Sign out
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Add user's message to list
  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    // Placeholder AI response (your old UI had this until backend worked)
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "assistant", text: "Sorry, something went wrong." }]);
    }, 600);
  };

  // UI bubble rendering
  const renderMessage = (msg, index) => {
    const isUser = msg.role === "user";

    return (
      <div
        key={index}
        style={{
          display: "flex",
          justifyContent: isUser ? "flex-end" : "flex-start",
          marginBottom: "12px",
        }}
      >
        {!isUser && (
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: "#000",
              color: "#fff",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 10,
            }}
          >
            🚀
          </div>
        )}

        <div
          style={{
            background: isUser ? "#000" : "#fff",
            color: isUser ? "#fff" : "#000",
            padding: "12px 18px",
            borderRadius: "14px",
            maxWidth: "80%",
            border: isUser ? "none" : "1px solid #ddd",
          }}
        >
          {msg.text}
        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <div style={{ padding: 40, fontSize: 22 }}>
        You must be logged in to use LaunchPath.
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top Navigation */}
      <div
        style={{
          padding: "20px 30px",
          borderBottom: "1px solid #e5e5e5",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div style={{ fontSize: 28, fontWeight: 600 }}>🚀 LaunchPath</div>

        <div style={{ display: "flex", gap: 20 }}>
          <div>{user.email}</div>
          <button onClick={handleLogout} style={{ padding: "6px 14px" }}>
            Logout
          </button>
        </div>
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "30px 40px", background: "#f5f5f5" }}>
        {messages.map((msg, i) => renderMessage(msg, i))}
      </div>

      {/* Input bar */}
      <div
        style={{
          padding: 20,
          borderTop: "1px solid #ddd",
          display: "flex",
          gap: 10,
          background: "#fff",
        }}
      >
        <input
          type="text"
          placeholder="Ask LaunchPath anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{
            flex: 1,
            padding: "14px 16px",
            borderRadius: 10,
            border: "1px solid #ccc",
            fontSize: 16,
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            padding: "12px 18px",
            borderRadius: 10,
            background: "#000",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          ➤
        </button>
      </div>
    </div>
  );
}

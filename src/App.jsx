import React, { useState, useEffect } from "react";
import { Send, LogOut, Sparkles } from "lucide-react";
import { supabase } from "./supabaseClient";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  async function sendMessage() {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();

      const botMessage = {
        role: "assistant",
        content: data.reply || "Sorry, something went wrong.",
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Server error — check function logs." },
      ]);
    }

    setInput("");
    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.reload();
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles size={24} /> LaunchPath
        </h1>

        {user && (
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-gray-200 px-3 py-1 rounded-lg"
          >
            <LogOut size={16} /> Logout
          </button>
        )}
      </header>

      {/* Chat Messages */}
      <div className="mb-20 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-3 rounded-xl max-w-[75%] ${
              msg.role === "user"
                ? "bg-black text-white ml-auto"
                : "bg-white text-black"
            }`}
          >
            {msg.content}
          </div>
        ))}

        {loading && (
          <div className="bg-white p-3 rounded-xl w-fit">
            Thinking...
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center">
        <div className="flex bg-white shadow-md rounded-xl p-2 w-[90%] max-w-xl">
          <input
            className="flex-1 outline-none px-3"
            placeholder="Ask LaunchPath anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-black text-white p-2 rounded-lg flex items-center"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

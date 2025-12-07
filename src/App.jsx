import React, { useState, useRef, useEffect } from 'react';
import { supabase } from './supabaseClient';

// HARDCODED DARK SVG ICONS
const RocketIcon = ({ className = "w-7 h-7" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
  </svg>
);

const SendIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m22 2-7 20-4-9-9-4 20-7z"/>
    <path d="M22 2 11 13"/>
  </svg>
);

const LogOutIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

export default function LaunchPathAI() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setShowAuthModal(true);
      }
      setCheckingAuth(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setShowAuthModal(false);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user && !showAuthModal) {
      inputRef.current?.focus();
    }
  }, [user, showAuthModal]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (error) {
      alert('Error logging in with Google: ' + error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGuestContinue = () => {
    setUser('guest');
    setShowAuthModal(false);
  };

  const handleLogout = async () => {
    if (user !== 'guest') {
      await supabase.auth.signOut();
    }
    setUser(null);
    setMessages([]);
    setShowAuthModal(true);
  };

  // ⭐⭐⭐ FIXED ONLY THIS FUNCTION ⭐⭐⭐
  const sendMessage = async (messageText) => {
    const userMessage = messageText || input;
    if (!userMessage.trim() || loading) return;

    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })   // ✅ FIXED: Netlify expects "message"
      });

      const data = await response.json();

      const assistantMessage = data.reply || 'Sorry, something went wrong.'; // ✅ FIXED: match chat.js

      setMessages([...newMessages, { role: 'assistant', content: assistantMessage }]);
    } catch (error) {
      setMessages([...newMessages, { role: 'assistant', content: 'Sorry, there was an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };
  // ⭐⭐⭐ END OF FIX ⭐⭐⭐

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div style={{ backgroundColor: '#000000', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <RocketIcon className="w-8 h-8 text-white animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '32px', maxWidth: '400px', width: '100%', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
            <div className="text-center mb-8">
              <div style={{ backgroundColor: '#000000', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <RocketIcon className="w-8 h-8 text-white" />
              </div>
              <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#000000', marginBottom: '8px' }}>Welcome to LaunchPath</h2>
              <p style={{ fontSize: '16px', color: '#6B7280' }}>Your AI assistant for everything</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleGoogleLogin}
                disabled={authLoading}
                style={{ width: '100%', padding: '14px 20px', backgroundColor: 'white', border: '2px solid #E5E7EB', borderRadius: '12px', fontSize: '16px', fontWeight: '600', color: '#1F2937', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {authLoading ? 'Loading...' : 'Continue with Google'}
              </button>

              <button
                onClick={handleGuestContinue}
                style={{ width: '100%', padding: '14px 20px', backgroundColor: '#000000', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', color: 'white', cursor: 'pointer' }}
              >
                Continue as Guest
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white border-b-4 border-black px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div style={{ backgroundColor: '#000000', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RocketIcon className="w-7 h-7 text-white" />
            </div>
            <span style={{ fontSize: '24px', fontWeight: '900', color: '#000000' }}>LaunchPath</span>
          </div>

          <div className="flex items-center gap-4">
            {user && user !== 'guest' && (
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>{user.email}</span>
            )}
            {user === 'guest' && (
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Guest</span>
            )}
            {user && (
              <button
                onClick={handleLogout}
                style={{ backgroundColor: '#F3F4F6', padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', fontSize: '14px', color: '#374151' }}
              >
                <LogOutIcon className="w-4 h-4" />
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 flex flex-col">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div style={{ backgroundColor: '#000000', width: '96px', height: '96px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}>
              <RocketIcon className="w-14 h-14 text-white" />
            </div>
            <h1 style={{ fontSize: '36px', fontWeight: '900', color: '#000000', marginBottom: '12px' }}>LaunchPath</h1>
            <p style={{ fontSize: '18px', color: '#4B5563', fontWeight: '500', marginBottom: '32px', maxWidth: '450px' }}>Your AI assistant for everything — with expertise in business, finance & investing</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl px-4">
              {["Explain quantum physics simply", "How do I start investing in stocks?", "Help me with my chemistry homework", "Best business ideas for beginners", "Write a poem about the ocean", "How does compound interest work?"].map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(prompt)}
                  style={{ backgroundColor: 'white', border: '3px solid #000000', padding: '16px', borderRadius: '12px', textAlign: 'left', fontSize: '15px', fontWeight: '600', color: '#1F2937', cursor: 'pointer' }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div style={{ backgroundColor: '#000000', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px', flexShrink: 0 }}>
                    <RocketIcon className="w-6 h-6 text-white" />
                  </div>
                )}
                <div style={{ maxWidth: '600px', padding: '12px 20px', borderRadius: '16px', backgroundColor: msg.role === 'user' ? '#000000' : 'white', color: msg.role === 'user' ? 'white' : '#1F2937', border: msg.role === 'user' ? 'none' : '3px solid #E5E7EB', fontWeight: '500' }}>
                  <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div style={{ backgroundColor: '#000000', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}>
                  <RocketIcon className="w-6 h-6 text-white" />
                </div>
                <div style={{ backgroundColor: 'white', border: '3px solid #E5E7EB', borderRadius: '16px', padding: '12px 20px' }}>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        <div style={{ backgroundColor: 'white', border: '3px solid #000000', borderRadius: '16px', padding: '12px' }}>
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask me anything..."
              style={{ flex: 1, padding: '12px 16px', backgroundColor: 'transparent', color: '#1F2937', fontWeight: '500', fontSize: '16px', border: 'none', outline: 'none' }}
              disabled={loading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={{ backgroundColor: '#000000', color: 'white', padding: '12px 24px', borderRadius: '12px', fontWeight: '700', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer', opacity: loading || !input.trim() ? 0.4 : 1, display: 'flex', alignItems: 'center', gap: '8px', border: 'none' }}
            >
              <SendIcon className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

interface Message {
  id?: number;
  isUserMessage: boolean;
  content: string;
  createdAt?: string;
}

interface Conversation {
  id: number;
  questionCount: number;
}

export default function AskimateGuestChat() {
  const [, setLocation] = useLocation();
  const [guestSessionId, setGuestSessionId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize guest session
  useEffect(() => {
    const stored = localStorage.getItem("askimate_guest_session_id");
    if (stored) {
      setGuestSessionId(stored);
    } else {
      const newSessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("askimate_guest_session_id", newSessionId);
      setGuestSessionId(newSessionId);
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !guestSessionId) return;

    const userMessage: Message = {
      isUserMessage: true,
      content: inputValue,
    };

    setMessages([...messages, userMessage]);
    setInputValue("");
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/askimate/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Guest-Session-Id": guestSessionId,
        },
        body: JSON.stringify({
          message: inputValue,
          conversationId: conversationId || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle limit reached
        if (data.error === "GUEST_LIMIT_REACHED") {
          setLimitReached(true);
          setMessages((prev) => [
            ...prev.slice(0, -1),
            {
              isUserMessage: false,
              content:
                "You've reached the 2-question limit for guest chat. Sign up to continue your conversation with unlimited access.",
            },
          ]);
          setLoading(false);
          return;
        }

        throw new Error(data.error || "Failed to send message");
      }

      // Success
      if (!conversationId) {
        setConversationId(data.conversation.id);
        localStorage.setItem("askimate_conversation_id", data.conversation.id);
      }

      // Add mentor response (simulated for now)
      const mentorResponse: Message = {
        isUserMessage: false,
        content: "Thank you for your question. Our mentor will review this and get back to you within 24-48 hours.",
      };

      setMessages((prev) => [...prev, mentorResponse]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
      setMessages((prev) => prev.slice(0, -1)); // Remove the unsent message
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Chat with AskiMate AI — Guest Access</title>
        <meta name="description" content="Try AskiMate AI mentor chat for free. Ask up to 2 questions as a guest." />
      </Helmet>
      <Navbar />

      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full p-4 sm:p-6">
        {/* Heading section */}
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Chat with Your Mentor
          </h1>
          <p className="text-sm text-muted-foreground">
            Guest access: {limitReached ? "Limit reached" : "2 questions remaining"}
          </p>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 bg-white rounded-xl border border-border/60 p-4 sm:p-6 mb-6 flex flex-col overflow-y-auto">
          {messages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <p className="text-foreground font-medium mb-1">Start your conversation</p>
              <p className="text-sm text-muted-foreground">
                Ask a question about your education journey
              </p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-4 flex ${msg.isUserMessage ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs sm:max-w-md px-4 py-3 rounded-lg ${
                  msg.isUserMessage
                    ? "bg-primary text-white rounded-br-none"
                    : "bg-muted/50 text-foreground rounded-bl-none"
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="mb-4 flex justify-start">
              <div className="bg-muted/50 text-foreground px-4 py-3 rounded-lg rounded-bl-none">
                <p className="text-sm">Typing...</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Limit Reached Message */}
        {limitReached && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-amber-900 mb-3">
              You've used your 2 free guest questions. Sign up to continue this conversation and access unlimited mentoring.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => setLocation("/askimate-signup")}
                className="bg-primary hover:bg-primary/90 text-white text-sm"
              >
                Sign Up Now
              </Button>
              <Button
                onClick={() => setLocation("/askimate-login")}
                variant="outline"
                className="text-sm"
              >
                Log In
              </Button>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-900">{error}</p>
          </div>
        )}

        {/* Input Area */}
        {!limitReached && (
          <div className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !loading) {
                  handleSendMessage();
                }
              }}
              placeholder="Type your question..."
              className="flex-1 px-4 py-3 rounded-lg border border-border/60 bg-white text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              disabled={loading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={loading || !inputValue.trim()}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              Send
            </Button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

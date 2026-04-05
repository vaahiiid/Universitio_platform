import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

interface AiMeta {
  reviewLevel?: string;
  needsHumanReview?: boolean;
}

interface Message {
  id?: number;
  isUserMessage: boolean;
  content: string;
  createdAt?: string;
  aiMeta?: AiMeta;
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

    const content = inputValue.trim();

    const userMessage: Message = {
      isUserMessage: true,
      content,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setLoading(true);
    setError("");

    try {
      // Step 1: chat route — enforces guest limit and tracks conversation
      const chatRes = await fetch(`${import.meta.env.BASE_URL}api/askimate/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Guest-Session-Id": guestSessionId,
        },
        body: JSON.stringify({
          message: content,
          conversationId: conversationId || undefined,
        }),
      });

      const chatData = await chatRes.json();

      if (!chatRes.ok) {
        if (chatData.error === "GUEST_LIMIT_REACHED") {
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
        throw new Error(chatData.error || "Failed to send message");
      }

      if (!conversationId) {
        setConversationId(chatData.conversation.id);
        localStorage.setItem("askimate_conversation_id", chatData.conversation.id);
      }

      // Step 2: AI endpoint — get the real KB answer to display immediately
      // Build history from existing messages for conversation context
      const aiHistory = messages
        .filter((m) => !m.aiMeta || m.aiMeta.reviewLevel !== undefined)
        .flatMap((m) =>
          m.isUserMessage
            ? [{ role: "user" as const, content: m.content }]
            : [{ role: "assistant" as const, content: m.content }]
        )
        .slice(-10);

      let aiMessage: Message;
      try {
        const aiRes = await fetch(`${import.meta.env.BASE_URL}api/askimate/ai`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: content, history: aiHistory }),
        });

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          console.log("[AskiMate-Guest] AI response:", {
            message: content.slice(0, 60),
            mode: aiData.mode,
            reviewLevel: aiData.reviewLevel,
            needsHumanReview: aiData.needsHumanReview,
            sources: (aiData.sources ?? []).map((s: { id: string }) => s.id),
          });
          aiMessage = {
            isUserMessage: false,
            content: aiData.answer,
            aiMeta: {
              reviewLevel: aiData.reviewLevel,
              needsHumanReview: aiData.needsHumanReview,
            },
          };
        } else {
          throw new Error("AI response error");
        }
      } catch {
        aiMessage = {
          isUserMessage: false,
          content:
            "I'm having trouble answering right now. Please try again or speak with a human advisor.",
        };
      }

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
      setMessages((prev) => prev.slice(0, -1));
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
              <div className="max-w-xs sm:max-w-md">
                <div
                  className={`px-4 py-3 rounded-lg ${
                    msg.isUserMessage
                      ? "bg-primary text-white rounded-br-none"
                      : "bg-muted/50 text-foreground rounded-bl-none"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
                {/* AI metadata strip — only for AI responses */}
                {!msg.isUserMessage && msg.aiMeta && (
                  <div className="mt-1.5 px-1 space-y-0.5">
                    {msg.aiMeta.needsHumanReview && (
                      <p className="text-xs text-amber-700">
                        This question may need review by a human advisor.{" "}
                        <a
                          href="/askimate-signup"
                          className="underline hover:text-amber-800"
                        >
                          Sign up to chat with a mentor
                        </a>
                        .
                      </p>
                    )}
                  </div>
                )}
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

import { Helmet } from "react-helmet-async";
import { useLocation } from "wouter";
import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Check, MessageSquare, BookOpen, Zap, Sparkles } from "lucide-react";

interface Message {
  id?: number;
  isUserMessage: boolean;
  content: string;
  createdAt?: string;
}

export default function AskiMateLanding() {
  const [, setLocation] = useLocation();
  const [guestSessionId, setGuestSessionId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
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

  // Auto-scroll chat container to bottom (not entire page)
  useEffect(() => {
    if (messagesEndRef.current) {
      // Scroll only the chat container, not the entire page
      const chatContainer = messagesEndRef.current.closest('.overflow-y-auto');
      if (chatContainer) {
        // Scroll to the bottom of the chat container
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !guestSessionId) return;

    const userMessage: Message = {
      isUserMessage: true,
      content: inputValue,
    };

    setMessages([...messages, userMessage]);
    const sentMessage = inputValue;
    setInputValue("");
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/askimate/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Guest-Session-Id": guestSessionId,
        },
        body: JSON.stringify({
          message: sentMessage,
          conversationId: conversationId || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "GUEST_LIMIT_REACHED") {
          setLimitReached(true);
          setShowSignupPrompt(true);
          setMessages((prev) => [
            ...prev.slice(0, -1),
            {
              isUserMessage: false,
              content:
                "You've reached your 2 free guest questions. Sign up to continue your conversation with 5 free questions per week.",
            },
          ]);
          setLoading(false);
          return;
        }
        throw new Error(data.error || "Failed to send message");
      }

      if (!conversationId) {
        setConversationId(data.conversation.id);
      }

      const mentorResponse: Message = {
        isUserMessage: false,
        content: "Thank you for your question. Our mentor will review this and get back to you within 24-48 hours.",
      };

      setMessages((prev) => [...prev, mentorResponse]);
    } catch (err) {
      console.error("Error sending message:", err);
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>AskiMate AI — Your Personal Education Mentor</title>
        <meta name="description" content="Get personalised mentoring guidance for your education journey. Real mentors, real answers, real support." />
        <link rel="canonical" href="https://universitio.com/askimate" />
      </Helmet>
      <Navbar />

      {/* HERO: REAL CHAT-FIRST SECTION */}
      <section className="pt-20 md:pt-24 pb-12 md:pb-16 bg-gradient-to-br from-primary/10 via-background to-background border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
            {/* LEFT: Hero Text with Subtle Animation */}
            <div className="flex flex-col justify-center">
              <div className="inline-block w-fit mb-6">
                <div className="flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 border border-primary/20">
                  <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                  <span className="text-sm font-medium text-primary">Powered by Real Mentors</span>
                </div>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
                Smart Guidance, Instantly
              </h1>

              <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
                Ask your mentors anything. Get real answers tailored to your education journey. Start with 2 free questions, upgrade for unlimited access.
              </p>

              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm text-foreground">Expert mentors online now</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm text-foreground">Start free, no credit card</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm text-foreground">Get personalized guidance</span>
                </li>
              </ul>
            </div>

            {/* RIGHT: REAL WORKING CHAT INTERFACE */}
            <div className="flex flex-col relative">
              {/* Animated Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none animate-shimmer"></div>
              
              <div className="flex-1 flex flex-col bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden relative z-10">
                {/* Chat Header */}
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border/40 px-6 py-4 flex items-start justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">Chat with a Mentor</h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      {limitReached ? "Sign up to continue" : "Ask your question"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 ml-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-700 font-medium">Online</span>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-96 max-h-96">
                  {messages.length === 0 && (
                    <div className="flex items-center justify-center h-full text-center">
                      <div>
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                          <MessageSquare className="w-6 h-6 text-primary" />
                        </div>
                        <p className="text-sm font-medium text-foreground">Ask your first question</p>
                      </div>
                    </div>
                  )}

                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.isUserMessage ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2.5 rounded-lg text-sm leading-relaxed ${
                          msg.isUserMessage
                            ? "bg-primary text-white rounded-br-none"
                            : "bg-muted/50 text-foreground rounded-bl-none"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}

                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-muted/50 text-foreground px-4 py-2.5 rounded-lg rounded-bl-none text-sm">
                        Typing...
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input / Signup Prompt */}
                {showSignupPrompt ? (
                  <div className="border-t border-border/40 bg-amber-50 p-4">
                    <p className="text-sm text-amber-900 mb-3 font-medium">
                      You've used your 2 free guest questions
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setLocation("/askimate-signup")}
                        className="flex-1 bg-primary hover:bg-primary/90 text-white text-sm"
                      >
                        Sign Up Free
                      </Button>
                      <Button
                        onClick={() => setLocation("/askimate-login")}
                        variant="outline"
                        className="flex-1 text-sm"
                      >
                        Log In
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-border/40 p-4 bg-white">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && !loading && !limitReached) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        placeholder="Ask anything..."
                        className="flex-1 px-4 py-2.5 rounded-lg border border-border/60 bg-white text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                        disabled={loading || limitReached}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={loading || !inputValue.trim() || limitReached}
                        className="bg-primary hover:bg-primary/90 text-white px-4"
                        size="sm"
                      >
                        Send
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PLANS SECTION */}
      <section className="py-16 md:py-20 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Choose Your Plan
            </h2>
            <p className="text-muted-foreground">
              Start free and upgrade anytime
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Basic Plan */}
            <div className="rounded-2xl border border-border/60 p-8 bg-white hover:border-border transition-colors">
              <h3 className="text-2xl font-bold text-foreground mb-2">Basic Mentoring</h3>
              <p className="text-muted-foreground text-sm mb-6">For students learning independently</p>

              <div className="mb-8">
                <div className="text-5xl font-bold text-foreground">Free</div>
                <p className="text-sm text-muted-foreground mt-1">Forever</p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">Ask up to 5 questions per week</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">Get clear, structured guidance for your applications</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">Understand your next steps with confidence</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">Explore your study options before committing</span>
                </li>
              </ul>

              <Button
                onClick={() => setLocation("/askimate-signup")}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Get Started
              </Button>
            </div>

            {/* Premium Plan */}
            <div className="rounded-2xl border-2 border-primary p-8 bg-gradient-to-br from-primary/5 to-background relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <span className="bg-primary text-white px-4 py-1 rounded-full text-xs font-semibold">
                  Most Popular
                </span>
              </div>

              <h3 className="text-2xl font-bold text-foreground mb-2">Premium Mentoring</h3>
              <p className="text-muted-foreground text-sm mb-6">For priority support & real-time access</p>

              <div className="mb-8">
                <div className="text-5xl font-bold text-foreground">
                  £12<span className="text-2xl text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">3-day free trial, cancel anytime</p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">Ask unlimited questions anytime</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">Priority live chat with real-time responses</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium text-foreground">Full document review support</span>
                </li>
                <li className="flex items-start gap-3 ml-3 pl-3 border-l-2 border-primary/30">
                  <span className="text-xs text-foreground">Personal Statement feedback</span>
                </li>
                <li className="flex items-start gap-3 ml-3 pl-3 border-l-2 border-primary/30">
                  <span className="text-xs text-foreground">CV and cover letter review</span>
                </li>
                <li className="flex items-start gap-3 ml-3 pl-3 border-l-2 border-primary/30">
                  <span className="text-xs text-foreground">Application form feedback</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">Ongoing guidance throughout your journey</span>
                </li>
              </ul>

              <div className="space-y-2">
                <Button
                  onClick={async () => {
                    const token = localStorage.getItem("askimate_token");
                    if (token) {
                      // User is logged in, show plan options
                      try {
                        const res = await fetch(`${import.meta.env.BASE_URL}api/askimate/checkout-session`, {
                          method: "POST",
                          headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({ plan: "monthly" }),
                        });
                        if (res.ok) {
                          const data = await res.json();
                          if (data.url) {
                            window.location.href = data.url;
                          }
                        }
                      } catch (error) {
                        console.error("Checkout failed:", error);
                      }
                    } else {
                      // Not logged in, go to signup
                      setLocation("/askimate-signup");
                    }
                  }}
                  className="w-full bg-primary hover:bg-primary/90 text-white"
                  size="lg"
                >
                  Start Free Trial
                </Button>
                <p className="text-xs text-center text-muted-foreground">3-day trial, then £12/month. Cancel anytime.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-primary/10 via-background to-background border-y border-border/40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Ready to get expert guidance?
          </h2>
          <p className="text-muted-foreground mb-6">
            Join thousands of students getting personalized mentoring. Your first 2 questions are free.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => setLocation("/askimate-signup")}
              className="bg-primary hover:bg-primary/90 text-white"
              size="lg"
            >
              Sign Up Now
            </Button>
            <Button
              onClick={() => setLocation("/askimate-login")}
              variant="outline"
              size="lg"
            >
              Already Have an Account?
            </Button>
          </div>
        </div>
      </section>

      {/* WHY ASKIMATE SECTION */}
      <section className="py-16 md:py-20 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose AskiMate?
            </h2>
            <p className="text-muted-foreground">
              Designed for students who want to succeed independently
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 border border-border/60 rounded-xl hover:border-border transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Real Mentors</h3>
              <p className="text-sm text-muted-foreground">
                Connect with experienced mentors who have personally navigated education decisions and can guide you through yours.
              </p>
            </div>

            <div className="p-6 border border-border/60 rounded-xl hover:border-border transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Personalized Guidance</h3>
              <p className="text-sm text-muted-foreground">
                Get advice tailored to your situation, goals, and challenges—not generic answers.
              </p>
            </div>

            <div className="p-6 border border-border/60 rounded-xl hover:border-border transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Flexible & Affordable</h3>
              <p className="text-sm text-muted-foreground">
                Start free with 5 questions per week, upgrade to Premium when you need more support.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes shimmer {
          0%, 100% {
            opacity: 0;
          }
          50% {
            opacity: 0.3;
          }
        }
        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

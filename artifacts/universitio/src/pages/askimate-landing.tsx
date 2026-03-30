import { Helmet } from "react-helmet-async";
import { useLocation } from "wouter";
import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Check, MessageSquare, BookOpen, Zap, ArrowRight } from "lucide-react";

interface Message {
  id?: number;
  isUserMessage: boolean;
  content: string;
  createdAt?: string;
}

interface AnimatedMessage {
  text: string;
  isUser: boolean;
  delay: number;
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

  // Animated messages for hero visualization
  const heroMessages: AnimatedMessage[] = [
    { text: "Which universities have the best engineering programs?", isUser: true, delay: 0.5 },
    { text: "That's a great question! Let me share some insights...", isUser: false, delay: 1.5 },
    { text: "I'm struggling with my personal statement. Any tips?", isUser: true, delay: 2.5 },
    { text: "Absolutely! Here are some key principles to follow...", isUser: false, delay: 3.5 },
  ];

  const [visibleMessages, setVisibleMessages] = useState<AnimatedMessage[]>([]);

  // Animate hero messages
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    heroMessages.forEach((msg, idx) => {
      const timer = setTimeout(() => {
        setVisibleMessages((prev) => [...prev, msg]);
      }, msg.delay * 1000);
      timers.push(timer);
    });

    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

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
        <meta name="description" content="Get personalised mentoring guidance for your education journey. Human-first support, flexible plans, real mentors." />
        <link rel="canonical" href="https://universitio.com/askimate" />
      </Helmet>
      <Navbar />

      {/* Enhanced Hero Section */}
      <section className="pt-20 md:pt-28 pb-16 md:pb-20 bg-gradient-to-br from-primary/10 via-background to-background border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Hero Text */}
            <div className="flex flex-col">
              <div className="inline-block bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold mb-6 w-fit">
                🆕 NEW — Try Free for 3 Days
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
                Expert Mentoring at Your Fingertips
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Get real guidance from experienced mentors. Ask questions about your education journey, get feedback on your applications, and make confident decisions—all on your schedule.
              </p>

              <div className="flex gap-3 mb-8">
                <Button
                  onClick={() => document.getElementById("chat-section")?.scrollIntoView({ behavior: "smooth" })}
                  className="bg-primary hover:bg-primary/90 text-white"
                  size="lg"
                >
                  Start Chatting Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  onClick={() => document.getElementById("plans-section")?.scrollIntoView({ behavior: "smooth" })}
                  variant="outline"
                  size="lg"
                >
                  View Plans
                </Button>
              </div>

              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm text-foreground">Expert mentors with real education experience</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm text-foreground">Personalised guidance tailored to your goals</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm text-foreground">Start free, upgrade anytime—no commitment</span>
                </li>
              </ul>
            </div>

            {/* Right: Animated Chat Visualization */}
            <div className="hidden lg:flex flex-col">
              <div className="bg-white rounded-2xl border border-border/60 shadow-lg overflow-hidden h-full min-h-96">
                {/* Mock Chat Header */}
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border/40 px-6 py-4">
                  <p className="text-sm font-semibold text-foreground">AskiMate Mentor</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Online</p>
                </div>

                {/* Animated Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col">
                  {visibleMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.isUser ? "justify-end" : "justify-start"} animate-fadeIn`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2.5 rounded-lg text-sm leading-relaxed ${
                          msg.isUser
                            ? "bg-primary text-white rounded-br-none"
                            : "bg-muted/50 text-foreground rounded-bl-none"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Mock Input */}
                <div className="border-t border-border/40 bg-white p-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ask anything..."
                      disabled
                      className="flex-1 px-4 py-2.5 rounded-lg border border-border/60 bg-muted/30 text-sm text-muted-foreground cursor-not-allowed"
                    />
                    <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-lg text-sm font-medium opacity-50 cursor-not-allowed">
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chat Section */}
      <section id="chat-section" className="py-16 md:py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Chat with a Mentor Right Now
            </h2>
            <p className="text-lg text-muted-foreground">
              Get started with 2 free questions—no signup required
            </p>
          </div>

          {/* Chat Interface */}
          <div className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border/40 px-6 py-4">
              <h3 className="text-lg font-semibold text-foreground">Chat with a Mentor</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {limitReached ? "Sign up to continue" : "Start your free conversation"}
              </p>
            </div>

            {/* Messages */}
            <div className="overflow-y-auto p-6 space-y-4 min-h-96 max-h-96">
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

            {/* Input / Signup Prompt */}
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
                      if (e.key === "Enter" && !loading) {
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
      </section>

      {/* Plans Section */}
      <section id="plans-section" className="py-16 md:py-20 bg-gradient-to-br from-background to-primary/5 border-t border-border/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Choose Your Plan
            </h2>
            <p className="text-lg text-muted-foreground">
              Start free and upgrade anytime
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Basic Plan */}
            <div className="rounded-2xl border border-border/60 p-8 bg-white hover:border-border transition-colors">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">Basic Mentoring</h3>
                <p className="text-muted-foreground text-sm">For students who want guidance on their own terms</p>
              </div>

              <div className="mb-8">
                <div className="text-5xl font-bold text-foreground mb-2">Free</div>
                <p className="text-sm text-muted-foreground">Forever, no credit card required</p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">Up to 5 questions per week</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">Response within 24–48 hours</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">General guidance and advice</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">Access to mentor network</span>
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

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">Premium Mentoring</h3>
                <p className="text-muted-foreground text-sm">For students who want priority support and real-time access</p>
              </div>

              <div className="mb-8">
                <div className="text-5xl font-bold text-foreground mb-2">
                  £12<span className="text-2xl text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground">3-day free trial, cancel anytime</p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">Ask questions anytime</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">Priority live chat access</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">Real-time responses when online</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">Same-day replies guaranteed</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">Full document review and feedback</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">Personalised application strategy</span>
                </li>
              </ul>

              <Button
                onClick={() => setLocation("/askimate-signup")}
                className="w-full bg-primary hover:bg-primary/90 text-white"
                size="lg"
              >
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-20 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Students Choose AskiMate
            </h2>
            <p className="text-muted-foreground">
              Designed for independent learners who want expert guidance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 border border-border/60 rounded-xl hover:border-border transition-colors">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-sm mb-2">Real Mentors</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Connect with experienced mentors who've guided hundreds of students through their education journey.
              </p>
            </div>

            <div className="p-6 border border-border/60 rounded-xl hover:border-border transition-colors">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-sm mb-2">Document Feedback</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Upload essays, personal statements, and CVs for detailed feedback from experienced mentors.
              </p>
            </div>

            <div className="p-6 border border-border/60 rounded-xl hover:border-border transition-colors">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-sm mb-2">Flexible Plans</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Start free with 5 questions per week, upgrade to Premium for unlimited access and priority support.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

import { Helmet } from "react-helmet-async";
import { useLocation } from "wouter";
import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Check, MessageSquare, BookOpen, Zap } from "lucide-react";

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

      // Add mentor response
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

  const plans = [
    {
      name: "Basic Mentoring",
      price: "Free",
      period: "",
      monthlyPrice: null,
      features: [
        "Up to 5 questions per week",
        "Response within 24–48 hours",
        "General guidance",
        "Access to mentor network",
      ],
      cta: "Get Started",
      highlighted: false,
    },
    {
      name: "Premium Mentoring",
      price: "£12",
      period: "monthly",
      trial: "3 days free",
      altPrices: [
        { amount: "£30", period: "every 3 months", monthly: "£10/month" },
        { amount: "£65", period: "every 6 months", monthly: "£10.83/month" },
      ],
      features: [
        "Ask questions anytime",
        "Priority live chat access",
        "Real-time responses when online",
        "Same-day replies guaranteed",
        "Full document review",
        "Personalised application strategy",
      ],
      cta: "Start Free Trial",
      highlighted: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>AskiMate AI — Your Personal Education Mentor</title>
        <meta name="description" content="Get personalised mentoring guidance for your education journey. Human-first support, flexible plans, real mentors." />
        <link rel="canonical" href="https://universitio.com/askimate" />
      </Helmet>
      <Navbar />

      {/* Interactive Hero Section */}
      <section className="flex-1 py-12 md:py-16 bg-gradient-to-br from-primary/5 via-background to-background border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Grid: Chat on left, Info on right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
            {/* Left: Chat Interface */}
            <div className="flex flex-col">
              <div className="flex-1 flex flex-col bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden">
                {/* Chat Header */}
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border/40 px-6 py-4">
                  <h2 className="text-lg font-semibold text-foreground">Chat with a Mentor</h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    {limitReached ? "Sign up to continue" : "Start your free conversation"}
                  </p>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-96 max-h-96">
                  {messages.length === 0 && (
                    <div className="flex items-center justify-center h-full text-center">
                      <div>
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                          <MessageSquare className="w-6 h-6 text-primary" />
                        </div>
                        <p className="text-sm font-medium text-foreground mb-1">Ask your first question</p>
                        <p className="text-xs text-muted-foreground">
                          {limitReached ? "Sign up to continue" : "You have 2 free questions"}
                        </p>
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
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      {limitReached
                        ? "Limit reached - sign up to continue"
                        : messages.length >= 2
                          ? "1 question remaining"
                          : "2 free questions"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Info & Plans */}
            <div className="flex flex-col justify-between">
              {/* Description */}
              <div className="mb-8">
                <div className="inline-block bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold mb-4">
                  🆕 NEW — Try Free for 3 Days
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 leading-tight">
                  Your Personal Education Mentor
                </h1>
                <p className="text-base text-muted-foreground leading-relaxed mb-6">
                  Get expert guidance from real mentors. Ask questions, get feedback on your applications, and navigate your education journey with confidence.
                </p>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">Experienced mentors ready to help</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">Personalized guidance for your goals</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">Start free, upgrade anytime</span>
                  </li>
                </ul>
              </div>

              {/* Plans Compact */}
              <div className="space-y-3">
                <div className="p-4 rounded-lg border border-border/60 bg-white hover:border-border transition-colors cursor-pointer" onClick={() => setLocation("/askimate-signup")}>
                  <p className="font-semibold text-foreground text-sm">Basic Mentoring</p>
                  <p className="text-xs text-muted-foreground mt-1">Free · 5 questions/week</p>
                </div>
                <div className="p-4 rounded-lg border-2 border-primary bg-primary/5 cursor-pointer" onClick={() => setLocation("/askimate-signup")}>
                  <p className="font-semibold text-foreground text-sm">Premium Mentoring</p>
                  <p className="text-xs text-muted-foreground mt-1">£12/month · 3 days free trial</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section (Streamlined) */}
      <section className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Why students choose AskiMate
            </h2>
            <p className="text-muted-foreground text-sm">
              Designed for independent learners who want expert guidance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 border border-border/60 rounded-xl hover:border-border transition-colors">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-sm mb-2">Real Mentors</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Connect with experienced mentors who've guided hundreds of students.
              </p>
            </div>

            <div className="p-5 border border-border/60 rounded-xl hover:border-border transition-colors">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-sm mb-2">Document Feedback</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Upload essays, statements, and CVs for detailed feedback.
              </p>
            </div>

            <div className="p-5 border border-border/60 rounded-xl hover:border-border transition-colors">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-sm mb-2">Flexible Plans</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Start free with 5 questions per week, upgrade for unlimited access.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { FileUp, MessageSquare, Settings, LogOut, Loader2, Send } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAskiMateAuth } from "@/contexts/AskiMateAuthContext";

function AskiMateDashboardContent() {
  const { user, logout } = useAskiMateAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"profile" | "documents" | "chat" | "subscription">("profile");
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    mobile: user?.mobile || "",
    dateOfBirth: user?.dateOfBirth || "",
    termsAccepted: user?.termsAccepted || true,
    privacyAccepted: user?.privacyAccepted || true,
    marketingConsent: user?.marketingConsent || false,
  });

  const [documents, setDocuments] = useState([
    { id: 1, name: "Personal Statement.pdf", uploadedAt: "2025-03-20", size: "245 KB" },
    { id: 2, name: "CV.docx", uploadedAt: "2025-03-18", size: "180 KB" },
  ]);

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Chat state
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleProfileChange = (field: string, value: unknown) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setLocation("/askimate");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleSaveProfile = async () => {
    setUpdateError("");
    setUpdateSuccess(false);
    try {
      // Call real API endpoint to update profile
      await fetch(`${import.meta.env.BASE_URL}api/askimate/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("askimate_token")}`,
        },
        body: JSON.stringify({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          mobile: profileData.mobile,
          dateOfBirth: profileData.dateOfBirth,
          marketingConsent: profileData.marketingConsent,
        }),
      }).then(async (res) => {
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || "Failed to save profile");
        }
        setUpdateSuccess(true);
        setTimeout(() => setUpdateSuccess(false), 3000);
      });
    } catch (error) {
      setUpdateError(error instanceof Error ? error.message : "Failed to save profile");
    }
  };

  const [planInfo, setPlanInfo] = useState<any>(null);

  // Load plan info on mount
  useEffect(() => {
    const loadPlanInfo = async () => {
      try {
        const token = localStorage.getItem("askimate_token");
        if (token) {
          const res = await fetch(`${import.meta.env.BASE_URL}api/askimate/plan-info`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (res.ok) {
            const data = await res.json();
            setPlanInfo(data);
          }
        }
      } catch (error) {
        console.error("Failed to load plan info:", error);
      }
    };
    loadPlanInfo();
  }, []);

  // Handle Stripe checkout success redirect
  useEffect(() => {
    const handleCheckoutSuccess = async () => {
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get("session_id");
      
      if (sessionId) {
        try {
          const token = localStorage.getItem("askimate_token");
          const res = await fetch(`${import.meta.env.BASE_URL}api/askimate/confirm-premium`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ sessionId }),
          });
          if (res.ok) {
            // Reload plan info to show updated status
            const planRes = await fetch(`${import.meta.env.BASE_URL}api/askimate/plan-info`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            if (planRes.ok) {
              const data = await planRes.json();
              setPlanInfo(data);
            }
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
            setUpdateSuccess(true);
            setTimeout(() => setUpdateSuccess(false), 5000);
          } else {
            const error = await res.json();
            setUpdateError(error.error || "Payment verification failed");
          }
        } catch (error) {
          console.error("Failed to confirm premium:", error);
          setUpdateError("Failed to confirm premium subscription");
        }
      }
    };
    handleCheckoutSuccess();
  }, []);

  const getPlanStatus = () => {
    if (!user) return { plan: "Free", status: "No plan" };
    
    if (user.plan === "free") {
      const remaining = planInfo?.questionsRemaining || 5;
      return { plan: "Basic Mentoring (Free)", status: `${remaining} questions remaining this week` };
    }
    
    if (user.plan === "premium" && planInfo?.trialStatus?.isTrialing) {
      return { 
        plan: "Premium Mentoring (Free Trial)", 
        status: `${planInfo.trialStatus.daysLeft} day${planInfo.trialStatus.daysLeft !== 1 ? "s" : ""} remaining` 
      };
    }
    
    if (user.plan === "premium") {
      return { plan: "Premium Mentoring", status: "Paid subscription" };
    }
    
    return { plan: "Free", status: "Basic Mentoring" };
  };

  // Load conversations when chat tab opens
  useEffect(() => {
    if (activeTab === "chat" && user) {
      const loadConversations = async () => {
        setChatLoading(true);
        try {
          const token = localStorage.getItem("askimate_token");
          const res = await fetch(`${import.meta.env.BASE_URL}api/askimate/conversations`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            setConversations(data.conversations || []);
            if (data.conversations && data.conversations.length > 0 && !selectedConversation) {
              setSelectedConversation(data.conversations[0].id);
            }
          }
        } catch (error) {
          console.error("Failed to load conversations:", error);
        } finally {
          setChatLoading(false);
        }
      };
      loadConversations();
    }
  }, [activeTab, user]);

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      const loadMessages = async () => {
        setChatLoading(true);
        try {
          const token = localStorage.getItem("askimate_token");
          const res = await fetch(`${import.meta.env.BASE_URL}api/askimate/chat/${selectedConversation}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            setMessages(data.messages || []);
          }
        } catch (error) {
          console.error("Failed to load messages:", error);
        } finally {
          setChatLoading(false);
        }
      };
      loadMessages();
    }
  }, [selectedConversation]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !user) return;

    const content = messageInput.trim();
    let convId = selectedConversation;

    // If no conversation selected, create one on first message
    if (!convId) {
      setSending(true);
      try {
        // First message without a conversation will create it
        const token = localStorage.getItem("askimate_token");
        const res = await fetch(`${import.meta.env.BASE_URL}api/askimate/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: content,
          }),
        });

        if (!res.ok) {
          const error = await res.json();
          setUpdateError(error.error || "Failed to send message");
          setSending(false);
          return;
        }

        const data = await res.json();
        convId = data.conversation.id;
        setSelectedConversation(convId);
        
        // Add user message to UI
        setMessages([{
          id: data.message.id,
          isUserMessage: true,
          sender: "user",
          content: content,
          createdAt: new Date().toISOString(),
        }]);

        // Reload conversations to show the new one
        const convRes = await fetch(`${import.meta.env.BASE_URL}api/askimate/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (convRes.ok) {
          const convData = await convRes.json();
          setConversations(convData.conversations || []);
        }

        setMessageInput("");
      } catch (error) {
        console.error("Failed to send message:", error);
        setUpdateError("Failed to send message");
      } finally {
        setSending(false);
      }
      return;
    }

    // Normal message send to existing conversation
    setMessageInput("");
    setSending(true);

    try {
      const token = localStorage.getItem("askimate_token");
      const res = await fetch(`${import.meta.env.BASE_URL}api/askimate/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: content,
          conversationId: convId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Add user message to UI
        setMessages((prev) => [...prev, {
          id: data.message.id,
          isUserMessage: true,
          sender: "user",
          content: content,
          createdAt: new Date().toISOString(),
        }]);
      } else {
        const error = await res.json();
        setUpdateError(error.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setUpdateError("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Dashboard — AskiMate AI</title>
        <meta name="description" content="Your AskiMate profile and mentoring dashboard." />
      </Helmet>
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-border/60 p-6 sticky top-32">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                  {profileData.firstName[0]}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{profileData.firstName} {profileData.lastName}</p>
                  <p className="text-xs text-muted-foreground">Free Plan</p>
                </div>
              </div>

              <nav className="space-y-2">
                {[
                  { id: "profile", label: "Profile", icon: Settings },
                  { id: "documents", label: "Documents", icon: FileUp },
                  { id: "chat", label: "Messages", icon: MessageSquare },
                  { id: "subscription", label: "Subscription", icon: FileUp },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === item.id
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}
              </nav>

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg mt-6 border-t border-border pt-6 disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
                {isLoggingOut ? "Logging out..." : "Log Out"}
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="bg-white rounded-xl border border-border/60 p-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">Profile Settings</h2>

                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">First Name</label>
                      <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) => handleProfileChange("firstName", e.target.value)}
                        className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Last Name</label>
                      <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) => handleProfileChange("lastName", e.target.value)}
                        className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Email Address (Cannot be changed)</label>
                    <input
                      type="email"
                      value={profileData.email}
                      disabled
                      className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-muted text-muted-foreground cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Mobile Number</label>
                    <input
                      type="tel"
                      value={profileData.mobile}
                      onChange={(e) => handleProfileChange("mobile", e.target.value)}
                      className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Date of Birth (Optional)</label>
                    <input
                      type="date"
                      value={profileData.dateOfBirth}
                      onChange={(e) => handleProfileChange("dateOfBirth", e.target.value)}
                      className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>

                  <div className="border-t border-border pt-6 space-y-4">
                    <h3 className="font-semibold text-foreground">Consent & Preferences</h3>

                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={profileData.termsAccepted}
                        disabled
                        className="mt-1 cursor-not-allowed"
                      />
                      <span className="text-sm text-muted-foreground">
                        Terms & Conditions accepted (set at signup)
                      </span>
                    </label>

                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={profileData.privacyAccepted}
                        disabled
                        className="mt-1 cursor-not-allowed"
                      />
                      <span className="text-sm text-muted-foreground">
                        Privacy Policy accepted (set at signup)
                      </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profileData.marketingConsent}
                        onChange={(e) => handleProfileChange("marketingConsent", e.target.checked)}
                        className="mt-1"
                      />
                      <span className="text-sm text-muted-foreground">
                        Send me tips, updates, and promotional offers
                      </span>
                    </label>
                  </div>

                  {updateError && (
                    <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                      {updateError}
                    </div>
                  )}

                  {updateSuccess && (
                    <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded px-3 py-2">
                      Profile updated successfully!
                    </div>
                  )}

                  <Button
                    onClick={handleSaveProfile}
                    className="bg-primary hover:bg-primary/90 text-white"
                  >
                    Save Changes
                  </Button>
                </form>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === "documents" && (
              <div className="bg-white rounded-xl border border-border/60 p-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">Your Documents</h2>

                <div className="mb-8 p-6 border-2 border-dashed border-border/60 rounded-lg text-center hover:border-primary/40 transition-colors cursor-pointer">
                  <FileUp className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="font-medium text-foreground mb-1">Drop files to upload</p>
                  <p className="text-sm text-muted-foreground">or click to browse</p>
                  <p className="text-xs text-muted-foreground mt-2">Supports PDF, DOC, DOCX</p>
                </div>

                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border border-border/40 rounded-lg hover:bg-muted/30 transition-colors">
                      <div>
                        <p className="font-medium text-foreground">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Uploaded {doc.uploadedAt} • {doc.size}
                        </p>
                      </div>
                      <button className="text-red-600 hover:text-red-700 font-medium text-sm">
                        Delete
                      </button>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground mt-6">
                  Free plan: up to 3 documents. Premium: unlimited uploads.
                </p>
              </div>
            )}

            {/* Chat Tab */}
            {activeTab === "chat" && (
              <div className="bg-white rounded-xl border border-border/60 p-8 h-[600px] flex flex-col">
                <h2 className="text-2xl font-bold text-foreground mb-6">Messages</h2>

                {chatLoading && conversations.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <MessageSquare className="w-16 h-16 text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">No conversations yet</p>
                    <p className="text-sm text-muted-foreground">Start a conversation on the AskiMate page</p>
                  </div>
                ) : (
                  <>
                    {/* Messages List */}
                    <div className="flex-1 overflow-y-auto mb-6 space-y-4 pr-2">
                      {messages.length === 0 && !chatLoading && (
                        <div className="flex items-center justify-center h-full text-center">
                          <div>
                            <MessageSquare className="w-12 h-12 text-muted-foreground/20 mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">No messages in this conversation yet</p>
                          </div>
                        </div>
                      )}
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div>
                            {msg.sender === "mentor" && (
                              <p className="text-xs font-semibold text-green-600 mb-1 ml-1">Mentor</p>
                            )}
                            <div
                              className={`max-w-xs px-4 py-2.5 rounded-lg text-sm ${
                                msg.sender === "user"
                                  ? "bg-primary text-white rounded-br-none"
                                  : msg.sender === "mentor"
                                    ? "bg-green-100 text-green-900 rounded-bl-none border border-green-200"
                                    : "bg-muted/50 text-foreground rounded-bl-none"
                              }`}
                            >
                              {msg.content}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="flex gap-3 pt-4 border-t border-border/40">
                      <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey && !sending) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        placeholder="Type your question... (Enter to send)"
                        className="flex-1 border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                        disabled={sending}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim() || sending}
                        className="bg-primary hover:bg-primary/90 text-white"
                      >
                        {sending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Subscription Tab */}
            {activeTab === "subscription" && (
              <div className="bg-white rounded-xl border border-border/60 p-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">Your Subscription</h2>

                <div className={`p-6 rounded-lg mb-6 border ${
                  getPlanStatus().plan.includes("Premium")
                    ? "bg-primary/5 border-primary/20"
                    : "bg-muted/30 border-border/40"
                }`}>
                  <p className="text-sm text-muted-foreground mb-2">Current Plan</p>
                  <p className="text-2xl font-bold text-foreground mb-4">{getPlanStatus().plan}</p>
                  <p className="text-sm text-muted-foreground mb-4">{getPlanStatus().status}</p>
                  {getPlanStatus().plan.includes("Basic Mentoring") && (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">Choose your premium plan:</p>
                      <div className="flex gap-3 flex-wrap">
                        {[
                          { label: "Monthly £12", plan: "monthly" },
                          { label: "3 Months £30", plan: "quarterly" },
                          { label: "6 Months £65", plan: "semi-annual" },
                        ].map((option) => (
                          <Button 
                            key={option.plan}
                            onClick={async () => {
                              try {
                                const token = localStorage.getItem("askimate_token");
                                const res = await fetch(`${import.meta.env.BASE_URL}api/askimate/checkout-session`, {
                                  method: "POST",
                                  headers: { 
                                    Authorization: `Bearer ${token}`,
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({ plan: option.plan }),
                                });
                                if (res.ok) {
                                  const data = await res.json();
                                  if (data.url) {
                                    window.location.href = data.url;
                                  }
                                } else {
                                  setUpdateError("Failed to start checkout");
                                }
                              } catch (error) {
                                console.error("Checkout failed:", error);
                                setUpdateError("Checkout failed. Please try again.");
                              }
                            }}
                            variant="default"
                            className="bg-primary hover:bg-primary/90 text-white"
                          >
                            {option.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {getPlanStatus().plan.includes("Basic Mentoring") && (
                  <>
                    <div className="space-y-4">
                      <h3 className="font-semibold text-foreground">Usage This Week</h3>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-sm text-muted-foreground">Questions Remaining</p>
                            <p className="text-sm font-medium text-foreground">{planInfo?.questionsRemaining || 5} / 5</p>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-primary h-2 rounded-full" style={{ width: `${((5 - (planInfo?.questionsRemaining || 5)) / 5) * 100}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 p-6 bg-primary/5 border border-primary/20 rounded-lg">
                      <h3 className="font-semibold text-foreground mb-2">Why Upgrade to Premium?</h3>
                      <ul className="text-sm text-muted-foreground space-y-2">
                        <li>✓ Unlimited questions anytime</li>
                        <li>✓ Priority live chat with real-time responses</li>
                        <li>✓ Full document review support</li>
                        <li>✓ 3-day free trial included</li>
                      </ul>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function AskiMateDashboard() {
  return (
    <ProtectedRoute>
      <AskiMateDashboardContent />
    </ProtectedRoute>
  );
}

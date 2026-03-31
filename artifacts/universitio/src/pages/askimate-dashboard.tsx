import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { FileUp, MessageSquare, Settings, LogOut, Loader2, Send } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAskiMateAuth } from "@/contexts/AskiMateAuthContext";
import { useToast } from "@/hooks/use-toast";
import { playNotificationSound, isIncomingMessage } from "@/utils/askimate-realtime";

function AskiMateDashboardContent() {
  const { user, logout } = useAskiMateAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"profile" | "chat" | "subscription">("chat");
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
  const [unreadCount, setUnreadCount] = useState(0);
  const [editingConvId, setEditingConvId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  
  // Message detection: single source of truth for message identity
  const knownMessageIds = useRef<Set<number>>(new Set());
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleProfileChange = (field: string, value: unknown) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  // Format message timestamp
  const formatMessageTime = (date: string | Date | null) => {
    if (!date) return "";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
  };

  const createNewConversation = async () => {
    try {
      const token = localStorage.getItem("askimate_token");
      const response = await fetch("/api/askimate/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const newConversation = data.conversation;
        
        // Add to conversations immediately (avoid race condition)
        setConversations((prev) => [newConversation, ...prev]);
        setSelectedConversation(newConversation.id);
        setMessages([]);
        setLastMessageId(null);
      } else {
        console.error("Failed to create conversation:", response.status);
      }
    } catch (error) {
      console.error("Failed to create new conversation:", error);
    }
  };

  const renameConversation = async (conversationId: number, newTitle: string) => {
    if (!newTitle.trim()) {
      // Don't rename to empty title, just exit edit mode
      setEditingConvId(null);
      setEditingTitle("");
      return;
    }

    // Get the old title for reverting on failure
    const oldTitle = conversations.find(c => c.id === conversationId)?.title || "New Chat";
    
    try {
      const token = localStorage.getItem("askimate_token");
      const response = await fetch(`/api/askimate/conversations/${conversationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: newTitle.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        // Update with server-confirmed data
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === conversationId ? { ...conv, title: data.conversation.title } : conv
          )
        );
        setEditingConvId(null);
        setEditingTitle("");
      } else {
        // API error: revert optimistic update
        console.error("Failed to rename conversation:", response.status);
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === conversationId ? { ...conv, title: oldTitle } : conv
          )
        );
        setEditingConvId(null);
        setEditingTitle("");
      }
    } catch (error) {
      console.error("Failed to rename conversation:", error);
      // Network error: revert optimistic update
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId ? { ...conv, title: oldTitle } : conv
        )
      );
      setEditingConvId(null);
      setEditingTitle("");
    }
  };

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem("askimate_token");
      const res = await fetch(`${import.meta.env.BASE_URL}api/askimate/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      // Clear all user-specific chat state to prevent leakage to next user
      setConversations([]);
      setSelectedConversation(null);
      setMessages([]);
      setMessageInput("");
      setUnreadCount(0);
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

  // Load conversations when chat tab opens and poll for new ones
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
      
      // Poll for new conversations every 5 seconds
      const interval = setInterval(loadConversations, 5000);
      return () => clearInterval(interval);
    }
  }, [activeTab, user, selectedConversation]);

  // Reset state when conversation changes
  useEffect(() => {
    if (selectedConversation) {
      setMessages([]);
      setMessageInput("");
      knownMessageIds.current.clear();
    }
  }, [selectedConversation]);

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      const loadMessages = async (isInitial: boolean = true) => {
        if (isInitial) setChatLoading(true);
        try {
          const token = localStorage.getItem("askimate_token");
          const res = await fetch(`${import.meta.env.BASE_URL}api/askimate/chat/${selectedConversation}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            const allMessages = data.messages || [];
            
            setMessages((prev) => {
              // Determine which messages are truly new
              const newMessages = allMessages.filter((msg: any) => !knownMessageIds.current.has(msg.id));
              
              // On initial load: add all messages
              if (isInitial) {
                allMessages.forEach((msg: any) => knownMessageIds.current.add(msg.id));
                return allMessages;
              }
              
              // On delta poll: only add new messages
              if (newMessages.length === 0) return prev;
              
              // Process new messages: sound + toast BEFORE marking as known
              newMessages.forEach((msg: any) => {
                // Check if incoming BEFORE adding to knownMessageIds
                if (isIncomingMessage(msg, 'user')) {
                  // Trigger notification for new incoming message
                  playNotificationSound();
                  
                  // Show toast for all incoming mentor messages, regardless of which tab the user is on
                  const preview = msg.content.length > 50 ? msg.content.substring(0, 50) + '...' : msg.content;
                  toast({
                    title: "New message from your mentor",
                    description: preview,
                  });
                }
                
                // NOW mark as known (after notification check)
                knownMessageIds.current.add(msg.id);
              });
              
              return [...prev, ...newMessages];
            });
          }
        } catch (error) {
          console.error("Failed to load messages:", error);
        } finally {
          if (isInitial) setChatLoading(false);
        }
      };
      
      // Mark messages as read
      const markAsRead = async () => {
        try {
          const token = localStorage.getItem("askimate_token");
          await fetch(`${import.meta.env.BASE_URL}api/askimate/chat/${selectedConversation}/mark-read`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          });
          setTimeout(() => fetchUnreadCount(), 100);
        } catch (error) {
          console.error("Failed to mark as read:", error);
        }
      };
      
      // Initial load + mark as read
      loadMessages(true);
      markAsRead();
      
      // Poll for new messages every 2 seconds
      const interval = setInterval(() => {
        loadMessages(false);
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [selectedConversation, activeTab, toast]);

  // Auto-scroll to bottom only if user is already near bottom
  useEffect(() => {
    if (!messagesContainerRef.current) return;
    
    const container = messagesContainerRef.current;
    // Check if user is already near bottom (within 100px of bottom)
    const isNearBottom = 
      container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    
    // Only scroll if near bottom OR it's the first message (user needs initial context)
    if (isNearBottom || messages.length === 1) {
      // Use requestAnimationFrame to ensure DOM is fully updated before scrolling
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      });
    }
  }, [messages.length]);

  // Fetch unread count - single source of truth for unread state
  // Called on mount, every 3 seconds as fallback, and immediately after mark-read
  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem("askimate_token");
      const res = await fetch(`${import.meta.env.BASE_URL}api/askimate/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  };

  // Poll unread count every 3 seconds as fallback
  useEffect(() => {
    const interval = setInterval(fetchUnreadCount, 3000);
    fetchUnreadCount(); // Fetch immediately on mount
    return () => clearInterval(interval);
  }, []);

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
          setUpdateError(error.message || error.error || "Failed to send message");
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
        console.log(`[USER] Message sent to conversation ${convId}:`, data.message);
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
        console.warn(`[USER] Message blocked - Status ${res.status}:`, error);
        setUpdateError(error.message || error.error || "Failed to send message");
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
        <div className={`grid gap-8 ${activeTab === "chat" ? "grid-cols-1 lg:grid-cols-5" : "grid-cols-1 lg:grid-cols-4"}`}>
          {/* Compact Navigation Sidebar */}
          <div className={`${activeTab === "chat" ? "lg:col-span-1" : "lg:col-span-1"}`}>
            <div className={`bg-white rounded-xl border border-border/60 sticky top-32 ${activeTab === "chat" ? "p-4" : "p-6"}`}>
              {/* Profile Card - More Compact in Chat Mode */}
              <div className={`${activeTab === "chat" ? "hidden" : "flex items-center gap-4 mb-6"}`}>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                  {profileData.firstName[0]}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{profileData.firstName} {profileData.lastName}</p>
                  <p className="text-xs text-muted-foreground">Free Plan</p>
                </div>
              </div>

              {/* Compact Profile Indicator in Chat Mode */}
              {activeTab === "chat" && (
                <div className="text-center mb-4 pb-4 border-b border-border/40">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm mx-auto mb-2">
                    {profileData.firstName[0]}
                  </div>
                  <p className="text-xs text-foreground font-medium truncate">{profileData.firstName}</p>
                  <p className="text-xs text-muted-foreground">Free Plan</p>
                </div>
              )}

              <nav className={`${activeTab === "chat" ? "space-y-1" : "space-y-2"}`}>
                {[
                  { id: "chat", label: "Chat", icon: MessageSquare },
                  { id: "profile", label: "Profile", icon: Settings },
                  { id: "subscription", label: "Subscription", icon: FileUp },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    title={item.label}
                    className={`relative w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === "chat" ? "justify-center" : "gap-3"
                    } ${
                      activeTab === item.id
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    {activeTab !== "chat" && <span className="flex-1 text-left">{item.label}</span>}
                    {item.id === "chat" && unreadCount > 0 && (
                      <span className={`inline-flex items-center justify-center text-xs font-bold text-white bg-red-600 rounded-full ${activeTab === "chat" ? "w-5 h-5 absolute -top-2 -right-2" : "w-6 h-6"}`}>
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </button>
                ))}
              </nav>

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                title="Log Out"
                className={`w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg mt-4 border-t border-border pt-4 disabled:opacity-50 ${
                  activeTab === "chat" ? "justify-center" : "gap-3"
                }`}
              >
                <LogOut className="w-4 h-4" />
                {activeTab !== "chat" && <span className="flex-1 text-left">Log Out</span>}
              </button>
            </div>
          </div>

          {/* Main Content - Expands in Chat Mode */}
          <div className={`${activeTab === "chat" ? "lg:col-span-4 space-y-6" : "lg:col-span-3 space-y-6"}`}>
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


            {/* Chat Tab */}
            {activeTab === "chat" && (
              <div className="bg-white rounded-xl border border-border/60 p-8 h-[calc(100vh-200px)] flex flex-col">
                <h2 className="text-2xl font-bold text-foreground mb-6">Chat</h2>

                <div className="flex gap-6 flex-1 overflow-hidden">
                  {/* Conversation List Sidebar */}
                  <div className="w-56 border-r border-border/40 pr-4 overflow-y-auto space-y-3">
                    <button
                      onClick={createNewConversation}
                      className="w-full px-3 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      + New Chat
                    </button>
                    
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Conversations</p>
                      {conversations.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No conversations yet</p>
                      ) : (
                        conversations.map((conv) => (
                          <div
                            key={conv.id}
                            className={`group w-full text-left p-2.5 rounded text-sm transition-colors cursor-pointer ${
                              selectedConversation === conv.id
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-foreground hover:bg-muted/30"
                            }`}
                            onClick={() => {
                              setSelectedConversation(conv.id);
                              setEditingConvId(null);
                            }}
                          >
                            {editingConvId === conv.id ? (
                              <input
                                autoFocus
                                type="text"
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    renameConversation(conv.id, editingTitle);
                                  } else if (e.key === "Escape") {
                                    setEditingConvId(null);
                                    setEditingTitle("");
                                  }
                                }}
                                onBlur={() => {
                                  if (editingTitle.trim()) {
                                    renameConversation(conv.id, editingTitle);
                                  } else {
                                    setEditingConvId(null);
                                  }
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full px-2 py-1 rounded text-xs bg-white border border-primary text-foreground"
                              />
                            ) : (
                              <>
                                <div className="flex items-center justify-between gap-2">
                                  <div className="truncate flex-1">{conv.title}</div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingConvId(conv.id);
                                      setEditingTitle(conv.title);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground hover:bg-muted/70 transition-all"
                                  >
                                    Rename
                                  </button>
                                </div>
                                <div className={`text-xs px-1.5 py-0.5 rounded mt-1 inline-block ${conv.status === "closed" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                                  {conv.status === "closed" ? "Closed" : "Open"}
                                </div>
                              </>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Chat Content */}
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Conversation Header */}
                    {selectedConversation && (
                      <div className="mb-4 pb-3 border-b border-border/40">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-foreground text-sm">
                              {conversations.find(c => c.id === selectedConversation)?.title}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {conversations.find(c => c.id === selectedConversation)?.status === "closed" ? "Closed" : "Open"}
                            </p>
                          </div>
                          {conversations.find(c => c.id === selectedConversation)?.status === "open" && (
                            <button
                              onClick={async () => {
                                try {
                                  await fetch(`${import.meta.env.BASE_URL}api/askimate/chat/${selectedConversation}/close`, {
                                    method: "POST",
                                    headers: { Authorization: `Bearer ${localStorage.getItem("askimate_token")}` },
                                  });
                                  // Reload conversations
                                  const token = localStorage.getItem("askimate_token");
                                  const res = await fetch(`${import.meta.env.BASE_URL}api/askimate/conversations`, {
                                    headers: { Authorization: `Bearer ${token}` },
                                  });
                                  if (res.ok) {
                                    const data = await res.json();
                                    setConversations(data.conversations || []);
                                  }
                                } catch (err) {
                                  console.error("Failed to close conversation:", err);
                                }
                              }}
                              className="text-xs text-red-600 hover:text-red-700 font-medium"
                            >
                              Close
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Closed Conversation Banner */}
                    {selectedConversation && conversations.find(c => c.id === selectedConversation)?.status === "closed" && (
                      <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-xs text-red-700 font-medium">This conversation has been closed</p>
                      </div>
                    )}

                {updateError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700 font-medium">{updateError}</p>
                    <button 
                      onClick={() => setUpdateError("")}
                      className="text-xs text-red-600 hover:text-red-800 mt-1 underline"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {chatLoading && conversations.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <>
                    {/* Messages List */}
                    <div ref={messagesContainerRef} className="flex-1 overflow-y-auto mb-6 space-y-4 pr-2">
                      {messages.length === 0 && !chatLoading && (
                        <div className="flex items-center justify-center h-full text-center">
                          <div>
                            <MessageSquare className="w-12 h-12 text-muted-foreground/20 mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">
                              {conversations.length === 0 ? "Start a new conversation below" : "No messages in this conversation yet"}
                            </p>
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
                            <p className={`text-xs mt-1 ${
                              msg.sender === "user"
                                ? "text-muted-foreground text-right"
                                : "text-muted-foreground"
                            }`}>
                              {formatMessageTime(msg.createdAt)}
                            </p>
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
                </div>
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

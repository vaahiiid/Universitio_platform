import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "wouter";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  MessageSquare, Settings, LogOut, Loader2, Send, Trash2,
  CreditCard, ChevronLeft, Plus, Pencil, Check,
} from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAskiMateAuth } from "@/contexts/AskiMateAuthContext";
import { useToast } from "@/hooks/use-toast";
import { playNotificationSound } from "@/utils/askimate-realtime";
import { trackEvent } from "@/lib/analytics";
import logoImg from "@assets/universitio logo.png";
import ReactMarkdown from "react-markdown";

type Tab = "chat" | "profile" | "subscription";

function fmtTime(date: string | Date | null) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function AskiMateDashboardContent() {
  const { user, logout, refreshUser } = useAskiMateAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // ─ Navigation ──────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<Tab>("chat");

  // ─ Profile ─────────────────────────────────────────────────────────────
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    mobile: user?.mobile || "",
    dateOfBirth: user?.dateOfBirth || "",
    termsAccepted: user?.termsAccepted ?? true,
    privacyAccepted: user?.privacyAccepted ?? true,
    marketingConsent: user?.marketingConsent || false,
  });
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // ─ Plan / subscription ─────────────────────────────────────────────────
  const [planInfo, setPlanInfo] = useState<any>(null);

  // ─ Chat state ──────────────────────────────────────────────────────────
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [editingConvId, setEditingConvId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [showNewMessageButton, setShowNewMessageButton] = useState(false);
  const [lastNewMessageId, setLastNewMessageId] = useState<number | null>(null);
  const [deletingConvId, setDeletingConvId] = useState<number | null>(null);
  const [newChatMode, setNewChatMode] = useState(false);

  // ─ Typing / waiting indicator ──────────────────────────────────────────
  const [isWaiting, setIsWaiting] = useState(false);

  // ─ Resend verification email ───────────────────────────────────────────
  const [resendStatus, setResendStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [resendCooldown, setResendCooldown] = useState(0);

  // ─ Notification ────────────────────────────────────────────────────────
  const [visibleNotification, setVisibleNotification] = useState(false);
  const [notificationMessageId, setNotificationMessageId] = useState<number | null>(null);
  const [notificationPreview, setNotificationPreview] = useState("");
  const [notificationConvId, setNotificationConvId] = useState<number | null>(null);

  // ─ Refs ────────────────────────────────────────────────────────────────
  const knownMessageIds = useRef<Set<number>>(new Set());
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const newChatModeRef = useRef(false);
  // Keep ref in sync with state so polling closures always see the latest value
  useEffect(() => { newChatModeRef.current = newChatMode; }, [newChatMode]);

  // ─ Derived ─────────────────────────────────────────────────────────────
  const activeConvs = conversations.filter((c) => c.status === "open");
  const archivedConvs = conversations.filter((c) => c.status === "closed");
  const selectedConv = conversations.find((c) => c.id === selectedConversation) || null;

  const navItems = [
    { id: "chat" as Tab, label: "Chat", icon: MessageSquare },
    { id: "profile" as Tab, label: "Profile", icon: Settings },
    { id: "subscription" as Tab, label: "Subscription", icon: CreditCard },
  ];

  // ─ Resend verification cooldown timer ─────────────────────────────────
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleResendVerification = async () => {
    if (resendCooldown > 0 || resendStatus === "loading") return;
    setResendStatus("loading");
    try {
      const token = localStorage.getItem("askimate_token");
      const res = await fetch(`${import.meta.env.BASE_URL}api/askimate/auth/resend-verification`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setResendStatus("sent");
        setResendCooldown(60);
      } else {
        const err = await res.json();
        if (err.error === "ALREADY_VERIFIED") {
          setResendStatus("sent");
        } else {
          setResendStatus("error");
        }
      }
    } catch {
      setResendStatus("error");
    }
    setTimeout(() => setResendStatus((s) => (s !== "sent" ? "idle" : s)), 5000);
  };

  // ─ Logout ──────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setConversations([]);
      setSelectedConversation(null);
      setMessages([]);
      setUnreadCount(0);
      setLocation("/askimate");
    } catch {
      /* ignore */
    } finally {
      setIsLoggingOut(false);
    }
  };

  // ─ Plan info ───────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("askimate_token");
      if (!token) return;
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}api/askimate/plan-info`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setPlanInfo(await res.json());
      } catch { /* ignore */ }
    };
    load();
  }, []);

  // ─ Stripe checkout success ─────────────────────────────────────────────
  useEffect(() => {
    const handle = async () => {
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get("session_id");
      const cancelled = params.get("cancelled");

      // Always clean up the URL immediately
      if (sessionId || cancelled) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      if (cancelled) {
        setUpdateError("Payment was cancelled. You can try again from the Subscription tab.");
        setActiveTab("subscription");
        return;
      }

      if (!sessionId) return;

      try {
        const token = localStorage.getItem("askimate_token");

        // Call backend to verify Stripe payment and activate the purchased plan
        const res = await fetch(`${import.meta.env.BASE_URL}api/askimate/confirm-premium`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });

        if (res.ok) {
          const confirmData = await res.json();

          // Refresh both planInfo and the auth context user (so user.plan updates immediately)
          const [planRes] = await Promise.all([
            fetch(`${import.meta.env.BASE_URL}api/askimate/plan-info`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            refreshUser(),
          ]);
          if (planRes.ok) setPlanInfo(await planRes.json());

          // Navigate to subscription tab so user sees their new plan immediately
          setActiveTab("subscription");
          setPaymentSuccess(true);
          setTimeout(() => setPaymentSuccess(false), 12000);

          // Fire GA4 conversion event — only here, only after backend confirms payment and plan activation
          trackEvent("subscribe_paid", {
            plan: confirmData.planLabel || "premium",
            currency: "GBP",
          });

          toast({
            title: "🎉 Payment successful!",
            description: confirmData.planLabel
              ? `Your ${confirmData.planLabel} plan is now active.`
              : "Your Premium plan is now active.",
          });
        } else {
          const err = await res.json();
          setUpdateError(err.error || "Payment verification failed. Please contact support.");
          setActiveTab("subscription");
        }
      } catch {
        setUpdateError("Failed to confirm payment. Please contact support if you were charged.");
        setActiveTab("subscription");
      }
    };
    handle();
  }, []);


  // ─ Save profile ────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    setUpdateError("");
    setUpdateSuccess(false);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/askimate/profile`, {
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
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save profile");
      }
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      setUpdateError(error instanceof Error ? error.message : "Failed to save profile");
    }
  };

  // ─ Unread count ────────────────────────────────────────────────────────
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
    } catch { /* ignore */ }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 3000);
    return () => clearInterval(interval);
  }, []);

  // ─ Load conversations ──────────────────────────────────────────────────
  useEffect(() => {
    if (activeTab !== "chat" || !user) return;
    const load = async () => {
      setChatLoading(true);
      try {
        const token = localStorage.getItem("askimate_token");
        const res = await fetch(`${import.meta.env.BASE_URL}api/askimate/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const convs = data.conversations || [];
          setConversations(convs);
          if (convs.length > 0 && !selectedConversation && !newChatModeRef.current) {
            setSelectedConversation(convs[0].id);
          }
        }
      } catch { /* ignore */ } finally {
        setChatLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [activeTab, user]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─ Create conversation ─────────────────────────────────────────────────
  const createNewConversation = () => {
    setSelectedConversation(null);
    setMessages([]);
    setLastNewMessageId(null);
    setShowNewMessageButton(false);
    knownMessageIds.current.clear();
    setNewChatMode(true);
  };

  // ─ Rename conversation ─────────────────────────────────────────────────
  const renameConversation = async (id: number, newTitle: string) => {
    if (!newTitle.trim()) { setEditingConvId(null); setEditingTitle(""); return; }
    const old = conversations.find((c) => c.id === id)?.title || "New Chat";
    setEditingConvId(null);
    setEditingTitle("");
    try {
      const token = localStorage.getItem("askimate_token");
      const res = await fetch(`${import.meta.env.BASE_URL}api/askimate/conversations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: newTitle.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setConversations((prev) => prev.map((c) => c.id === id ? { ...c, title: data.conversation.title } : c));
      } else {
        setConversations((prev) => prev.map((c) => c.id === id ? { ...c, title: old } : c));
      }
    } catch {
      setConversations((prev) => prev.map((c) => c.id === id ? { ...c, title: old } : c));
    }
  };

  // ─ Delete conversation ─────────────────────────────────────────────────
  const deleteConversation = async (id: number) => {
    try {
      const token = localStorage.getItem("askimate_token");
      const res = await fetch(`${import.meta.env.BASE_URL}api/askimate/conversations/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setConversations((prev) => prev.filter((c) => c.id !== id));
        if (selectedConversation === id) {
          setSelectedConversation(null);
          setMessages([]);
          knownMessageIds.current.clear();
        }
        setDeletingConvId(null);
        toast({ title: "Chat deleted", description: "The conversation has been removed." });
      } else {
        toast({ title: "Error", description: "Failed to delete the conversation.", variant: "destructive" });
        setDeletingConvId(null);
      }
    } catch {
      toast({ title: "Error", description: "An error occurred.", variant: "destructive" });
      setDeletingConvId(null);
    }
  };

  // ─ End chat ────────────────────────────────────────────────────────────
  const handleEndChat = async () => {
    if (!selectedConversation) return;
    try {
      await fetch(`${import.meta.env.BASE_URL}api/askimate/chat/${selectedConversation}/close`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("askimate_token")}` },
      });
      const token = localStorage.getItem("askimate_token");
      const res = await fetch(`${import.meta.env.BASE_URL}api/askimate/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
        setSelectedConversation(null);
      }
    } catch { /* ignore */ }
  };

  // ─ Load messages ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedConversation) return;
    setMessages([]);
    setMessageInput("");
    setLastNewMessageId(null);
    setShowNewMessageButton(false);
    knownMessageIds.current.clear();
  }, [selectedConversation]);

  useEffect(() => {
    if (!selectedConversation) return;

    const load = async (isInitial = true) => {
      if (isInitial) setChatLoading(true);
      try {
        const token = localStorage.getItem("askimate_token");
        const res = await fetch(`${import.meta.env.BASE_URL}api/askimate/chat/${selectedConversation}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const all = data.messages || [];
          setMessages((prev) => {
            const newMsgs = all.filter((m: any) => !knownMessageIds.current.has(m.id));
            if (isInitial) {
              all.forEach((m: any) => knownMessageIds.current.add(m.id));
              return all;
            }
            if (newMsgs.length === 0) return prev;
            newMsgs.forEach((m: any) => knownMessageIds.current.add(m.id));
            // Log AI messages for debugging
            const aiNew = newMsgs.filter((m: any) => m.sender === "ai");
            if (aiNew.length > 0) {
              aiNew.forEach((m: any) => {
                console.log("[AskiMate-Dashboard] AI message polled:", {
                  mode: m.metadata?.mode,
                  reviewLevel: m.metadata?.reviewLevel,
                  needsHumanReview: m.metadata?.needsHumanReview,
                  sources: (m.metadata?.sources ?? []).map((s: { id: string }) => s.id),
                });
              });
            }
            // Detect new incoming (mentor/ai) messages and trigger indicator
            const incomingNew = newMsgs.filter((m: any) => m.sender !== "user");
            if (incomingNew.length > 0) {
              const lastIncoming = incomingNew[incomingNew.length - 1];
              setLastNewMessageId(lastIncoming.id);
              // Clear the typing indicator — the reply has arrived via polling
              setIsWaiting(false);
              const container = messagesContainerRef.current;
              if (container) {
                const nearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
                if (!nearBottom) setShowNewMessageButton(true);
              }
            }
            return [...prev, ...newMsgs];
          });
        }
      } catch { /* ignore */ } finally {
        if (isInitial) setChatLoading(false);
      }
    };

    const markRead = async () => {
      try {
        const token = localStorage.getItem("askimate_token");
        await fetch(`${import.meta.env.BASE_URL}api/askimate/chat/${selectedConversation}/mark-read`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        setTimeout(fetchUnreadCount, 100);
      } catch { /* ignore */ }
    };

    load(true);
    markRead();
    const interval = setInterval(() => load(false), 2000);
    return () => clearInterval(interval);
  }, [selectedConversation]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─ Notifications ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedConversation || activeTab === "chat") return;
    const last = [...messages].reverse().find((m) => m.sender === "mentor");
    if (last && last.id !== notificationMessageId) {
      setNotificationMessageId(last.id);
      setNotificationConvId(selectedConversation);
      const preview = last.content.length > 50 ? last.content.slice(0, 50) + "…" : last.content;
      setNotificationPreview(preview);
      setVisibleNotification(true);
      playNotificationSound();
      const t = setTimeout(() => setVisibleNotification(false), 5000);
      return () => clearTimeout(t);
    }
  }, [messages, selectedConversation, activeTab, notificationMessageId]);

  // ─ Auto-clear notification when user switches to chat tab ──────────────
  useEffect(() => {
    if (activeTab === "chat") setVisibleNotification(false);
  }, [activeTab]);

  // ─ Auto scroll ─────────────────────────────────────────────────────────
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const nearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    if (nearBottom || messages.length === 1) {
      requestAnimationFrame(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }));
    }
  }, [messages.length]);

  // ─ Send message ────────────────────────────────────────────────────────
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !user) return;
    const content = messageInput.trim();
    let convId = selectedConversation;

    // First message: create conversation
    if (!convId) {
      setSending(true);
      setIsWaiting(true);
      try {
        const token = localStorage.getItem("askimate_token");
        const res = await fetch(`${import.meta.env.BASE_URL}api/askimate/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ message: content }),
        });
        if (!res.ok) {
          const err = await res.json();
          if (err.error === "EMAIL_NOT_VERIFIED") {
            // Silently handled by the verification banner
          } else {
            setUpdateError(err.message || err.error || "Failed to send message");
          }
          setIsWaiting(false);
          return;
        }
        const data = await res.json();
        convId = data.conversation.id;
        setNewChatMode(false);
        setSelectedConversation(convId);
        knownMessageIds.current.add(data.message.id);
        setMessages([{ id: data.message.id, isUserMessage: true, sender: "user", content, createdAt: new Date().toISOString() }]);
        const convRes = await fetch(`${import.meta.env.BASE_URL}api/askimate/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (convRes.ok) setConversations((await convRes.json()).conversations || []);
        setMessageInput("");
      } catch {
        setUpdateError("Failed to send message");
      } finally {
        setSending(false);
        setIsWaiting(false);
      }
      return;
    }

    setMessageInput("");
    setSending(true);
    setIsWaiting(true);
    try {
      const token = localStorage.getItem("askimate_token");
      console.log("[AskiMate-Dashboard] Sending message:", content.slice(0, 60));
      const res = await fetch(`${import.meta.env.BASE_URL}api/askimate/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: content, conversationId: convId }),
      });
      if (res.ok) {
        const data = await res.json();
        knownMessageIds.current.add(data.message.id);
        setMessages((prev) => [...prev, { id: data.message.id, isUserMessage: true, sender: "user", content, createdAt: new Date().toISOString() }]);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 0);
        // Always immediately fetch conversation history after send.
        // The server inserts the AI message synchronously before returning, so it is in the DB.
        fetch(`${import.meta.env.BASE_URL}api/askimate/chat/${convId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then(async (r) => {
          setIsWaiting(false);
          if (!r.ok) return;
          const fresh = await r.json();
          const all: any[] = fresh.messages || [];
          setMessages((prev) => {
            const newMsgs = all.filter((m) => !knownMessageIds.current.has(m.id));
            if (newMsgs.length === 0) return prev;
            newMsgs.forEach((m) => knownMessageIds.current.add(m.id));
            return [...prev, ...newMsgs];
          });
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 50);
        }).catch(() => { setIsWaiting(false); /* fallback to 2s poll */ });
      } else {
        const err = await res.json();
        if (err.error !== "EMAIL_NOT_VERIFIED") {
          setUpdateError(err.message || err.error || "Failed to send message");
        }
        setIsWaiting(false);
      }
    } catch {
      setUpdateError("Failed to send message");
      setIsWaiting(false);
    } finally {
      setSending(false);
    }
  };

  // ══════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════
  return (
    <DashboardLayout>
      <Helmet>
        <title>Dashboard — AskiMate AI</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* ─── APP SHELL ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col overflow-hidden bg-slate-50 flex-1 min-h-0">

        {/* ── TOP HEADER ─────────────────────────────────────────────────── */}
        <header className="h-14 flex-shrink-0 bg-white border-b border-border/60 flex items-center justify-between px-4 lg:px-6 z-20">
          <img src={logoImg} alt="Universitio" className="h-7 w-auto" />

          {/* Mobile: current tab name */}
          <span className="lg:hidden text-sm font-semibold text-foreground">
            {activeTab === "chat" ? "Messages" : activeTab === "profile" ? "Profile" : "Subscription"}
          </span>

          {/* Unread pill — visible on mobile when outside chat tab */}
          {unreadCount > 0 && activeTab !== "chat" && (
            <button
              onClick={() => setActiveTab("chat")}
              className="flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full lg:hidden"
            >
              <MessageSquare className="w-3 h-3" />
              {unreadCount > 99 ? "99+" : unreadCount}
            </button>
          )}

          {/* Desktop: placeholder to maintain layout */}
          <div className="hidden lg:block w-20" />
        </header>

        {/* ── BODY ───────────────────────────────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden min-h-0">

          {/* ── DESKTOP SIDEBAR ─────────────────────────────────────────── */}
          <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-border/60 flex-shrink-0">
            {/* User profile card */}
            <div className="px-5 py-5 border-b border-border/60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {profileData.firstName?.[0] || "?"}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {profileData.firstName} {profileData.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {user?.plan === "premium" ? "Premium" : "Free"} Plan
                  </p>
                </div>
              </div>
            </div>

            {/* Nav items */}
            <nav className="flex-1 px-3 py-4 space-y-0.5">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === item.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.id === "chat" && unreadCount > 0 && (
                    <span className="bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            {/* Logout */}
            <div className="px-3 py-4 border-t border-border/60">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-left">{isLoggingOut ? "Signing out…" : "Sign Out"}</span>
              </button>
            </div>
          </aside>

          {/* ── MAIN CONTENT ────────────────────────────────────────────── */}
          <main className="flex-1 overflow-hidden flex flex-col">

            {/* ══ CHAT TAB ══════════════════════════════════════════════ */}
            {activeTab === "chat" && (
              <div className="flex flex-1 overflow-hidden min-h-0">

                {/* Desktop: Conversation sidebar */}
                <div className="hidden lg:flex flex-col w-64 bg-white border-r border-border/60 flex-shrink-0">
                  <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-foreground">Conversations</h2>
                    <button
                      onClick={createNewConversation}
                      className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors"
                      title="New chat"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto py-2">
                    {activeConvs.length > 0 && (
                      <div className="px-2">
                        <p className="text-xs font-semibold text-muted-foreground px-2 mb-1.5 mt-1">Active</p>
                        {activeConvs.map((conv) => (
                          <div
                            key={conv.id}
                            className={`group flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors mb-0.5 ${
                              selectedConversation === conv.id
                                ? "bg-primary/10 text-primary"
                                : "text-foreground hover:bg-muted/50"
                            }`}
                            onClick={() => { setSelectedConversation(conv.id); setNewChatMode(false); setEditingConvId(null); }}
                          >
                            {editingConvId === conv.id ? (
                              <input
                                autoFocus
                                type="text"
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") renameConversation(conv.id, editingTitle);
                                  else if (e.key === "Escape") { setEditingConvId(null); setEditingTitle(""); }
                                }}
                                onBlur={() => { if (editingTitle.trim()) renameConversation(conv.id, editingTitle); else setEditingConvId(null); }}
                                onClick={(e) => e.stopPropagation()}
                                className="flex-1 px-2 py-0.5 rounded text-xs bg-white border border-primary text-foreground"
                              />
                            ) : (
                              <>
                                <span className="flex-1 text-sm truncate min-w-0">{conv.title}</span>
                                {conv.mentorTakenOver && (
                                  <span className="flex-shrink-0 w-2 h-2 rounded-full bg-primary/70 ml-1" title="Mentor Supervised" />
                                )}
                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setEditingConvId(conv.id); setEditingTitle(conv.title); }}
                                    className="p-1 rounded hover:bg-muted/80 text-muted-foreground"
                                    title="Rename"
                                  >
                                    <Pencil className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setDeletingConvId(conv.id); }}
                                    className="p-1 rounded hover:bg-red-100 text-muted-foreground hover:text-red-600"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {activeConvs.length === 0 && (
                      <div className="px-4 py-3">
                        <p className="text-xs text-muted-foreground">No active chats</p>
                      </div>
                    )}

                    {archivedConvs.length > 0 && (
                      <div className="px-2 mt-3">
                        <p className="text-xs font-semibold text-muted-foreground px-2 mb-1.5">Archived</p>
                        {archivedConvs.map((conv) => (
                          <div
                            key={conv.id}
                            className={`group flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors mb-0.5 ${
                              selectedConversation === conv.id
                                ? "bg-primary/10 opacity-100"
                                : "opacity-60 hover:opacity-80 hover:bg-muted/50"
                            }`}
                            onClick={() => { setSelectedConversation(conv.id); setNewChatMode(false); setEditingConvId(null); }}
                          >
                            <span className="flex-1 text-sm truncate text-muted-foreground">{conv.title}</span>
                            <span className="text-xs bg-muted/60 text-muted-foreground px-1.5 py-0.5 rounded flex-shrink-0">arch</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); setDeletingConvId(conv.id); }}
                              className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-100 text-muted-foreground hover:text-red-600 flex-shrink-0"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile: Conversation list (when no conv selected and not in new-chat mode) */}
                {!selectedConversation && !newChatMode && (
                  <div className="lg:hidden flex-1 overflow-y-auto bg-white">
                    <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between">
                      <h2 className="font-semibold text-foreground">Your Chats</h2>
                      <button
                        onClick={createNewConversation}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        New Chat
                      </button>
                    </div>

                    {chatLoading && conversations.length === 0 ? (
                      <div className="flex items-center justify-center h-40">
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : conversations.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-48 text-center px-6">
                        <MessageSquare className="w-10 h-10 text-muted-foreground/20 mb-3" />
                        <p className="font-medium text-foreground mb-1">No chats yet</p>
                        <p className="text-sm text-muted-foreground mb-4">Start a conversation with your mentor</p>
                        <button
                          onClick={createNewConversation}
                          className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
                        >
                          Start New Chat
                        </button>
                      </div>
                    ) : (
                      <div className="divide-y divide-border/40">
                        {activeConvs.map((conv) => (
                          <button
                            key={conv.id}
                            onClick={() => { setSelectedConversation(conv.id); setNewChatMode(false); }}
                            className="w-full text-left px-4 py-3.5 hover:bg-muted/20 transition-colors flex items-center gap-3"
                          >
                            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                              <MessageSquare className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground text-sm truncate">{conv.title}</p>
                              <p className="text-xs text-green-600 font-medium">Active</p>
                            </div>
                            <ChevronLeft className="w-4 h-4 text-muted-foreground rotate-180 flex-shrink-0" />
                          </button>
                        ))}
                        {archivedConvs.map((conv) => (
                          <button
                            key={conv.id}
                            onClick={() => { setSelectedConversation(conv.id); setNewChatMode(false); }}
                            className="w-full text-left px-4 py-3.5 hover:bg-muted/20 transition-colors flex items-center gap-3 opacity-60"
                          >
                            <div className="w-9 h-9 rounded-full bg-muted text-muted-foreground flex items-center justify-center flex-shrink-0">
                              <MessageSquare className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-muted-foreground text-sm truncate">{conv.title}</p>
                              <p className="text-xs text-muted-foreground">Archived</p>
                            </div>
                            <ChevronLeft className="w-4 h-4 text-muted-foreground rotate-180 flex-shrink-0" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Chat panel — visible when conv selected OR in new-chat mode */}
                <div className={`flex-1 flex flex-col overflow-hidden ${!selectedConversation && !newChatMode ? "hidden lg:flex" : "flex"}`}>
                  {selectedConversation && selectedConv ? (
                    <>
                      {/* Conversation header */}
                      <div className="flex items-center gap-2 px-4 py-3 bg-white border-b border-border/60 flex-shrink-0">
                        <button
                          onClick={() => setSelectedConversation(null)}
                          className="lg:hidden p-1.5 hover:bg-muted rounded-lg transition-colors flex-shrink-0"
                          title="Back to chats"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>

                        <div className="flex-1 min-w-0">
                          {editingConvId === selectedConv.id ? (
                            <input
                              autoFocus
                              type="text"
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") renameConversation(selectedConv.id, editingTitle);
                                else if (e.key === "Escape") { setEditingConvId(null); setEditingTitle(""); }
                              }}
                              onBlur={() => {
                                if (editingTitle.trim()) renameConversation(selectedConv.id, editingTitle);
                                else setEditingConvId(null);
                              }}
                              className="text-sm font-semibold bg-transparent border-b border-primary outline-none w-full"
                            />
                          ) : (
                            <h3 className="text-sm font-semibold text-foreground truncate">{selectedConv.title}</h3>
                          )}
                          <div className="flex items-center gap-2">
                            <p className={`text-xs ${selectedConv.status === "closed" ? "text-amber-600" : "text-green-600"}`}>
                              {selectedConv.status === "closed" ? "Archived" : "Active"}
                            </p>
                            {selectedConv.mentorTakenOver && (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                Mentor Supervised
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          {selectedConv.status === "open" && (
                            <button
                              onClick={() => { setEditingConvId(selectedConv.id); setEditingTitle(selectedConv.title); }}
                              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                              title="Rename"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => setDeletingConvId(selectedConv.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
                            title="Delete chat"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Archived banner */}
                      {selectedConv.status === "closed" && (
                        <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 flex-shrink-0">
                          <p className="text-xs text-amber-800 font-medium">This chat is archived. Create a new chat to continue.</p>
                        </div>
                      )}

                      {/* Email verification banner */}
                      {user?.emailVerified === false && (
                        <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-200 flex-shrink-0">
                          <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-amber-800">Email not verified</p>
                              <p className="text-xs text-amber-700 mt-0.5">
                                Please verify your email address to use the chat. Check your inbox for the verification link.
                              </p>
                              {resendStatus === "sent" && (
                                <p className="text-xs text-green-700 mt-1 font-medium">
                                  ✓ Verification email sent — check your inbox.
                                  {resendCooldown > 0 && ` Resend again in ${resendCooldown}s.`}
                                </p>
                              )}
                              {resendStatus === "error" && (
                                <p className="text-xs text-red-700 mt-1">Failed to send. Please try again.</p>
                              )}
                            </div>
                            <button
                              onClick={handleResendVerification}
                              disabled={resendStatus === "loading" || resendCooldown > 0}
                              className="flex-shrink-0 text-xs font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg transition-colors"
                            >
                              {resendStatus === "loading" ? "Sending…" : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend email"}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Error banner */}
                      {updateError && (
                        <div className="px-4 py-2 bg-red-50 border-b border-red-200 flex items-center justify-between flex-shrink-0">
                          <p className="text-xs text-red-700">{updateError}</p>
                          <button onClick={() => setUpdateError("")} className="text-xs text-red-600 font-medium ml-3">Dismiss</button>
                        </div>
                      )}

                      {/* Messages */}
                      {chatLoading && messages.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center">
                          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                        </div>
                      ) : (
                        <div
                          ref={messagesContainerRef}
                          className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0 bg-slate-50"
                        >
                          {messages.length === 0 && (
                            <div className="flex items-center justify-center h-full text-center">
                              <div>
                                <MessageSquare className="w-10 h-10 text-muted-foreground/20 mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">No messages yet. Start the conversation below.</p>
                              </div>
                            </div>
                          )}

                          {[...new Map(messages.map((m) => [m.id, m])).values()].map((msg) => (
                            <div key={msg.id}>
                              {msg.id === lastNewMessageId && lastNewMessageId !== null && (
                                <div className="flex items-center gap-2 my-2">
                                  <div className="flex-1 h-px bg-green-300" />
                                  <span className="text-xs font-semibold text-green-700">New message</span>
                                  <div className="flex-1 h-px bg-green-300" />
                                </div>
                              )}
                              {msg.sender === "system" ? (
                                <div className="flex justify-center my-3">
                                  <div className="flex items-center gap-2 bg-primary/5 border border-primary/15 text-primary/80 text-xs font-medium px-4 py-2 rounded-full shadow-sm max-w-xs text-center">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50 flex-shrink-0" />
                                    {msg.content}
                                  </div>
                                </div>
                              ) : (
                              <div className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} ${msg.id === lastNewMessageId ? "animate-pulse" : ""}`}>
                                <div>
                                  {msg.sender === "mentor" && (
                                    <p className="text-xs font-semibold text-green-700 mb-1 ml-1">Mentor</p>
                                  )}
                                  {msg.sender === "ai" && (
                                    <p className="text-xs font-semibold text-primary/60 mb-1 ml-1">AskiMate AI</p>
                                  )}
                                  <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                                    msg.sender === "user"
                                      ? "max-w-xs sm:max-w-sm bg-primary text-white rounded-br-sm"
                                      : msg.sender === "mentor"
                                        ? `max-w-xs sm:max-w-sm bg-white text-foreground rounded-bl-sm border border-green-200 shadow-sm ${msg.id === lastNewMessageId ? "ring-2 ring-green-400" : ""}`
                                        : "max-w-xs sm:max-w-lg bg-white text-foreground rounded-bl-sm border border-border/60 shadow-sm"
                                  }`}>
                                    {msg.sender === "ai" ? (
                                      <ReactMarkdown
                                        components={{
                                          p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                                          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                                          em: ({ children }) => <em className="italic">{children}</em>,
                                          h1: ({ children }) => <h1 className="text-base font-bold mb-2 mt-1">{children}</h1>,
                                          h2: ({ children }) => <h2 className="text-sm font-bold mb-1.5 mt-1">{children}</h2>,
                                          h3: ({ children }) => <h3 className="text-sm font-semibold mb-1 mt-1">{children}</h3>,
                                          ul: ({ children }) => <ul className="list-disc list-outside pl-4 mb-2 space-y-0.5">{children}</ul>,
                                          ol: ({ children }) => <ol className="list-decimal list-outside pl-4 mb-2 space-y-0.5">{children}</ol>,
                                          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                                          a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary/80">{children}</a>,
                                          code: ({ children }) => <code className="bg-slate-100 rounded px-1 py-0.5 text-xs font-mono">{children}</code>,
                                          blockquote: ({ children }) => <blockquote className="border-l-2 border-border pl-3 italic text-muted-foreground my-1">{children}</blockquote>,
                                          hr: () => <hr className="border-border/40 my-2" />,
                                        }}
                                      >
                                        {msg.content}
                                      </ReactMarkdown>
                                    ) : (
                                      msg.content
                                    )}
                                  </div>
                                  <p className={`text-xs mt-1 text-muted-foreground ${msg.sender === "user" ? "text-right" : "text-left"}`}>
                                    {fmtTime(msg.createdAt)}
                                  </p>
                                  {/* AI metadata strip */}
                                  {msg.sender === "ai" && msg.metadata?.needsHumanReview && (
                                    <p className="text-xs text-amber-600 mt-1 ml-1 italic">
                                      A mentor will follow up on this shortly.
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                            </div>
                          ))}

                          {/* Typing / waiting indicator */}
                          {isWaiting && (
                            <div className="flex justify-start">
                              <div>
                                <p className="text-xs font-semibold text-primary/60 mb-1 ml-1">AskiMate AI</p>
                                <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-white border border-border/60 shadow-sm flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce [animation-delay:0ms]" />
                                  <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce [animation-delay:150ms]" />
                                  <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce [animation-delay:300ms]" />
                                  <span className="ml-2 text-xs text-muted-foreground">{selectedConv?.mentorTakenOver ? "Your mentor will reply shortly…" : "AskiMate is preparing your answer…"}</span>
                                </div>
                              </div>
                            </div>
                          )}

                          <div ref={messagesEndRef} />

                          {showNewMessageButton && (
                            <button
                              onClick={() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); setShowNewMessageButton(false); }}
                              className="fixed bottom-20 lg:bottom-24 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-green-700 transition-colors text-sm font-medium"
                            >
                              ↓ New message
                            </button>
                          )}
                        </div>
                      )}

                      {/* Input area */}
                      {selectedConv.status === "open" ? (
                        <div className="border-t border-border/60 bg-white flex-shrink-0">
                          {/* Chat action bar: End Chat + New Chat */}
                          <div className="flex items-center gap-4 px-4 pt-2.5">
                            <button
                              onClick={createNewConversation}
                              className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 font-medium transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                              New Chat
                            </button>
                            <button
                              onClick={handleEndChat}
                              className="text-xs text-amber-600 hover:text-amber-700 font-medium transition-colors"
                            >
                              End Chat
                            </button>
                          </div>
                          {/* Send row */}
                          <div className="px-4 pt-2 pb-3 flex gap-2">
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
                              placeholder={selectedConv?.mentorTakenOver ? "Message your mentor…" : "Type your question…"}
                              className="flex-1 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-slate-50"
                              disabled={sending}
                            />
                            <Button
                              onClick={handleSendMessage}
                              disabled={!messageInput.trim() || sending}
                              className="bg-primary hover:bg-primary/90 text-white rounded-xl flex-shrink-0"
                            >
                              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="border-t border-border/60 bg-white flex-shrink-0">
                          <div className="flex items-center justify-center gap-3 px-4 pt-2.5">
                            <button
                              onClick={createNewConversation}
                              className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 font-medium transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                              New Chat
                            </button>
                          </div>
                          <p className="px-4 pt-1.5 pb-3 text-xs text-muted-foreground text-center">
                            This archived chat is read-only.
                          </p>
                        </div>
                      )}
                    </>
                  ) : newChatMode ? (
                    /* New conversation panel */
                    <div className="flex-1 flex flex-col bg-slate-50">
                      {/* Mobile back button */}
                      <div className="lg:hidden flex items-center gap-2 px-4 py-3 bg-white border-b border-border/60 flex-shrink-0">
                        <button
                          onClick={() => setNewChatMode(false)}
                          className="p-1.5 rounded-lg hover:bg-muted/60 text-muted-foreground"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="font-semibold text-foreground text-sm">New Chat</span>
                      </div>
                      {/* Centred input area */}
                      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                          <MessageSquare className="w-6 h-6 text-primary/60" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-1">New Conversation</h3>
                        <p className="text-sm text-muted-foreground mb-6">Ask AskiMate anything about studying in the UK</p>
                        <div className="w-full max-w-md flex gap-2">
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
                            placeholder="Type your question…"
                            disabled={sending}
                            autoFocus
                            className="flex-1 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white"
                          />
                          <Button
                            onClick={handleSendMessage}
                            disabled={sending || !messageInput.trim()}
                            className="bg-primary text-white hover:bg-primary/90 rounded-xl px-4"
                          >
                            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* No conversation selected */
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50">
                      <MessageSquare className="w-12 h-12 text-muted-foreground/20 mb-4" />
                      <h3 className="font-semibold text-foreground mb-2">No conversation selected</h3>
                      <p className="text-sm text-muted-foreground mb-4">Select a conversation from the sidebar or start a new one</p>
                      <Button onClick={createNewConversation} className="bg-primary hover:bg-primary/90 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        New Chat
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ══ PROFILE TAB ═══════════════════════════════════════════ */}
            {activeTab === "profile" && (
              <div className="flex-1 overflow-y-auto bg-white">
                <div className="max-w-xl mx-auto px-5 py-8">
                  <h2 className="text-xl font-bold text-foreground mb-6">Profile Settings</h2>
                  <form
                    className="space-y-5"
                    onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">First Name</label>
                        <input
                          type="text"
                          value={profileData.firstName}
                          onChange={(e) => setProfileData((p) => ({ ...p, firstName: e.target.value }))}
                          className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Last Name</label>
                        <input
                          type="text"
                          value={profileData.lastName}
                          onChange={(e) => setProfileData((p) => ({ ...p, lastName: e.target.value }))}
                          className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        Email Address <span className="text-muted-foreground font-normal">(cannot be changed)</span>
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        disabled
                        className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-muted text-muted-foreground cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Mobile Number</label>
                      <input
                        type="tel"
                        value={profileData.mobile}
                        onChange={(e) => setProfileData((p) => ({ ...p, mobile: e.target.value }))}
                        className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        Date of Birth <span className="text-muted-foreground font-normal">(optional)</span>
                      </label>
                      <input
                        type="date"
                        value={profileData.dateOfBirth}
                        onChange={(e) => setProfileData((p) => ({ ...p, dateOfBirth: e.target.value }))}
                        className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>

                    <div className="border-t border-border pt-5 space-y-3">
                      <h3 className="font-semibold text-foreground text-sm">Consent & Preferences</h3>
                      <label className="flex items-start gap-3">
                        <input type="checkbox" checked={profileData.termsAccepted} disabled className="mt-0.5 cursor-not-allowed" />
                        <span className="text-sm text-muted-foreground">Terms & Conditions accepted (set at signup)</span>
                      </label>
                      <label className="flex items-start gap-3">
                        <input type="checkbox" checked={profileData.privacyAccepted} disabled className="mt-0.5 cursor-not-allowed" />
                        <span className="text-sm text-muted-foreground">Privacy Policy accepted (set at signup)</span>
                      </label>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profileData.marketingConsent}
                          onChange={(e) => setProfileData((p) => ({ ...p, marketingConsent: e.target.checked }))}
                          className="mt-0.5"
                        />
                        <span className="text-sm text-muted-foreground">Send me tips, updates, and promotional offers</span>
                      </label>
                    </div>

                    {updateError && (
                      <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{updateError}</div>
                    )}
                    {updateSuccess && (
                      <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded px-3 py-2">Profile updated successfully!</div>
                    )}

                    <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">Save Changes</Button>
                  </form>
                </div>
              </div>
            )}

            {/* ══ SUBSCRIPTION TAB ══════════════════════════════════════ */}
            {activeTab === "subscription" && (() => {
              // Derive plan state from planInfo (backend is authoritative after expiry check)
              const isPremiumActive = planInfo?.isPremiumActive ?? false;
              const isExpired = planInfo?.isExpired ?? false;
              const currentPlanKey = planInfo?.planKey ?? null;
              const daysRemaining = planInfo?.daysRemaining ?? null;
              const planExpiresAt = planInfo?.planExpiresAt ? new Date(planInfo.planExpiresAt) : null;
              const planActivatedAt = planInfo?.planActivatedAt ? new Date(planInfo.planActivatedAt) : null;

              // Tier order for Upgrade / Downgrade labels
              const tierOrder: Record<string, number> = { monthly: 1, quarterly: 2, "semi-annual": 3 };
              const currentTier = currentPlanKey ? (tierOrder[currentPlanKey] ?? 0) : 0;

              // Determine label for a plan's action button
              const getButtonLabel = (planKey: string): string => {
                if (!isPremiumActive && !isExpired) return "Get Started";  // free user
                if (isExpired) {
                  return planKey === currentPlanKey ? "Renew Plan" : "Buy Plan";
                }
                // Active premium
                if (planKey === currentPlanKey) return "Renew Plan";
                const thisTier = tierOrder[planKey] ?? 0;
                if (thisTier > currentTier) return "Upgrade";
                return "Downgrade";
              };

              const startCheckout = async (plan: string) => {
                try {
                  setUpdateError("");
                  const token = localStorage.getItem("askimate_token");
                  const res = await fetch(`${import.meta.env.BASE_URL}api/askimate/checkout-session`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                    body: JSON.stringify({ plan }),
                  });
                  if (res.ok) {
                    const data = await res.json();
                    if (data.url) window.location.href = data.url;
                  } else {
                    setUpdateError("Failed to start checkout. Please try again.");
                  }
                } catch {
                  setUpdateError("Checkout failed. Please try again.");
                }
              };

              const PLANS = [
                {
                  key: "monthly",
                  label: "Monthly",
                  price: "£12",
                  priceNote: "per month",
                  days: 30,
                  savingsBadge: "",
                },
                {
                  key: "quarterly",
                  label: "3 Months",
                  price: "£30",
                  priceNote: "for 90 days",
                  days: 90,
                  savingsBadge: "Save £6",
                },
                {
                  key: "semi-annual",
                  label: "6 Months",
                  price: "£65",
                  priceNote: "for 180 days",
                  days: 180,
                  savingsBadge: "Best value",
                },
              ];

              return (
                <div className="flex-1 overflow-y-auto bg-white">
                  <div className="max-w-xl mx-auto px-5 py-8">
                    <h2 className="text-xl font-bold text-foreground mb-6">Your Subscription</h2>

                    {/* ── Payment success banner ── */}
                    {paymentSuccess && (
                      <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-green-800">Payment confirmed!</p>
                          <p className="text-xs text-green-700 mt-0.5">
                            Your plan has been activated. Details are shown below.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* ── Error banner ── */}
                    {updateError && (
                      <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl">
                        <p className="text-sm text-red-800">{updateError}</p>
                        <button
                          onClick={() => setUpdateError("")}
                          className="text-xs text-red-600 underline mt-1"
                        >
                          Dismiss
                        </button>
                      </div>
                    )}

                    {/* ── Expired banner ── */}
                    {isExpired && (
                      <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                        <CreditCard className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-amber-800">Your plan has expired</p>
                          <p className="text-xs text-amber-700 mt-0.5">
                            You're now on the free tier (5 questions per week). Renew or purchase a new plan below to restore full access.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* ── Plan status card ── */}
                    <div className={`p-5 rounded-2xl border-2 mb-7 ${
                      isPremiumActive
                        ? "bg-gradient-to-br from-primary/5 to-white border-primary/35"
                        : isExpired
                          ? "bg-amber-50/50 border-amber-200"
                          : "bg-muted/15 border-border/50"
                    }`}>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                            Current Plan
                          </p>
                          <p className="text-lg font-bold text-foreground leading-tight">
                            {isPremiumActive
                              ? `Premium — ${planInfo?.planLabel ?? "Monthly"}`
                              : isExpired
                                ? `${planInfo?.planLabel ?? "Premium"} (Expired)`
                                : "Basic Mentoring"}
                          </p>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full flex-shrink-0 border ${
                          isPremiumActive
                            ? "bg-primary text-white border-primary"
                            : isExpired
                              ? "bg-amber-100 text-amber-700 border-amber-300"
                              : "bg-muted text-muted-foreground border-border"
                        }`}>
                          {isPremiumActive ? "Active" : isExpired ? "Expired" : "Free"}
                        </span>
                      </div>

                      {/* Active premium details */}
                      {isPremiumActive && (
                        <div className="space-y-2 pt-3 border-t border-primary/15">
                          {planActivatedAt && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Activated</span>
                              <span className="font-medium text-foreground">
                                {planActivatedAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                              </span>
                            </div>
                          )}
                          {planExpiresAt && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Active until</span>
                              <span className="font-semibold text-primary">
                                {planExpiresAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                              </span>
                            </div>
                          )}
                          {daysRemaining !== null && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Days remaining</span>
                              <span className={`font-semibold ${daysRemaining <= 7 ? "text-amber-600" : "text-foreground"}`}>
                                {daysRemaining} day{daysRemaining !== 1 ? "s" : ""}
                                {daysRemaining <= 7 ? " — expiring soon" : ""}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Questions</span>
                            <span className="font-semibold text-primary">Unlimited</span>
                          </div>
                        </div>
                      )}

                      {/* Free / Expired usage bar */}
                      {!isPremiumActive && (
                        <div className="pt-3 border-t border-border/30">
                          <div className="flex justify-between items-center mb-1.5 text-xs text-muted-foreground">
                            <span>Weekly questions</span>
                            <span className="font-semibold text-foreground">
                              {planInfo?.questionsUsed ?? 0} / 5 used
                            </span>
                          </div>
                          <div className="w-full bg-muted/50 rounded-full h-1.5">
                            <div
                              className="bg-primary h-1.5 rounded-full transition-all"
                              style={{ width: `${Math.min(100, ((planInfo?.questionsUsed ?? 0) / 5) * 100)}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1.5">
                            {planInfo?.questionsRemaining ?? 5} remaining this week · Resets every Monday
                          </p>
                        </div>
                      )}
                    </div>

                    {/* ── All Plans — always shown ── */}
                    <div className="mb-2">
                      <p className="text-sm font-semibold text-foreground mb-4">
                        {isPremiumActive ? "Your plan options" : "Choose a plan"}
                      </p>
                      <div className="space-y-3">
                        {PLANS.map((plan) => {
                          const isCurrent = isPremiumActive && plan.key === currentPlanKey;
                          const btnLabel = getButtonLabel(plan.key);
                          const isUpgrade = btnLabel === "Upgrade";
                          const isDowngrade = btnLabel === "Downgrade";

                          return (
                            <div
                              key={plan.key}
                              className={`rounded-xl border-2 p-4 transition-all ${
                                isCurrent
                                  ? "border-primary/50 bg-primary/4"
                                  : "border-border/50 hover:border-primary/30 hover:bg-muted/10"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <span className="font-semibold text-foreground text-sm">{plan.label}</span>
                                    {isCurrent && (
                                      <span className="text-[11px] font-bold bg-primary text-white px-2 py-0.5 rounded-full">
                                        Current Plan
                                      </span>
                                    )}
                                    {plan.savingsBadge && !isCurrent && (
                                      <span className="text-[11px] font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                        {plan.savingsBadge}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    <span className="font-semibold text-foreground">{plan.price}</span>
                                    {" · "}
                                    {plan.priceNote}
                                    {" · "}
                                    Unlimited questions
                                  </p>
                                  {isCurrent && isPremiumActive && planExpiresAt && (
                                    <p className="text-xs text-primary mt-1">
                                      Renewing adds {plan.days} days on top of your current expiry
                                    </p>
                                  )}
                                </div>
                                <Button
                                  size="sm"
                                  variant={isDowngrade ? "outline" : "default"}
                                  className={`flex-shrink-0 min-w-[90px] ${
                                    isDowngrade
                                      ? "border-border/60 text-muted-foreground hover:bg-muted/20"
                                      : isUpgrade
                                        ? "bg-primary hover:bg-primary/90 text-white"
                                        : isCurrent
                                          ? "bg-primary/10 text-primary hover:bg-primary/15 border border-primary/30"
                                          : "bg-primary hover:bg-primary/90 text-white"
                                  }`}
                                  onClick={() => startCheckout(plan.key)}
                                >
                                  {btnLabel}
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* ── Premium benefits (always show) ── */}
                    <div className="mt-6 p-4 bg-primary/5 border border-primary/15 rounded-xl">
                      <p className="text-xs font-semibold text-foreground mb-2.5">
                        What's included with any Premium plan:
                      </p>
                      <ul className="text-xs text-muted-foreground space-y-1.5">
                        {[
                          "Unlimited questions — no weekly cap",
                          "Priority replies from UK education specialists",
                          "Personal Statement & application review",
                          "UCAS, clearing & visa guidance",
                          "Time stacks — renew without losing existing access",
                        ].map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })()}
          </main>
        </div>

        {/* ── MOBILE BOTTOM NAV ──────────────────────────────────────────── */}
        <nav className="lg:hidden flex-shrink-0 bg-white border-t border-border/60 flex items-stretch h-16">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors ${
                activeTab === item.id ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <div className="relative">
                <item.icon className="w-5 h-5" />
                {item.id === "chat" && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center leading-none">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <span>{item.label}</span>
            </button>
          ))}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex-1 flex flex-col items-center justify-center gap-1 text-xs font-medium text-red-500 disabled:opacity-50"
          >
            <LogOut className="w-5 h-5" />
            <span>{isLoggingOut ? "…" : "Logout"}</span>
          </button>
        </nav>
      </div>

      {/* ─── NOTIFICATION TOAST ─────────────────────────────────────────────── */}
      {visibleNotification && (
        <div
          className="fixed bottom-20 lg:bottom-6 right-4 lg:right-6 bg-[#42147d] text-white px-5 py-3.5 rounded-xl shadow-2xl max-w-xs z-50 cursor-pointer select-none"
          onClick={() => {
            setActiveTab("chat");
            if (notificationConvId) setSelectedConversation(notificationConvId);
            setVisibleNotification(false);
          }}
        >
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm mb-1">Mentor sent a new message</p>
              <p className="text-xs text-white/80 break-words">{notificationPreview}</p>
              <p className="text-xs text-white/50 mt-1.5">Tap to open chat →</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setVisibleNotification(false); }}
              className="text-white/70 hover:text-white text-lg leading-none font-bold ml-1 flex-shrink-0"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* ─── DELETE CHAT MODAL ──────────────────────────────────────────────── */}
      {deletingConvId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h2 className="text-lg font-semibold mb-2">Delete chat?</h2>
            <p className="text-sm text-muted-foreground mb-6">
              This will permanently remove the conversation and all messages. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeletingConvId(null)}
                className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteConversation(deletingConvId)}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default function AskiMateDashboard() {
  return (
    <ProtectedRoute>
      <AskiMateDashboardContent />
    </ProtectedRoute>
  );
}

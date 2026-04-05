import { useEffect, useState, useCallback, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  Search, MessageSquare, Loader2, Zap, Send, Edit2, Trash2,
  ChevronLeft, Users, X, BookCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { isIncomingMessage } from "@/utils/askimate-realtime";

// ── Types ──────────────────────────────────────────────────────────────────────
interface AskiMateUserData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
  plan: "free" | "premium";
  isTrialActive: boolean;
  trialStartedAt: Date | null;
  trialEndsAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  weeklyUsage: number;
  conversationCount: number;
  unreadCount?: number;
}

interface Conversation {
  id: number;
  title: string;
  status?: "open" | "closed";
  questionCount: number;
  unreadCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface AiMessageMeta {
  reviewLevel?: "safe_auto" | "cautious_auto" | "escalate_human";
  needsHumanReview?: boolean;
  sources?: Array<{ id?: string; title?: string; score?: number }>;
  aiAttempt?: string;
}

interface Message {
  id: number;
  conversationId: number;
  sender: "user" | "ai" | "mentor";
  isUserMessage: boolean;
  content: string;
  metadata?: AiMessageMeta | null;
  createdAt: Date;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const FREE_LIMIT = 5;

// ── Helpers ────────────────────────────────────────────────────────────────────
function fmtTime(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function fmtDate(d: Date | string | null) {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function fmtRelative(d: Date | string | null) {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  const diff = Date.now() - date.getTime();
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return fmtDate(date);
}

function PlanBadge({ plan, isTrialActive }: { plan: "free" | "premium"; isTrialActive: boolean }) {
  if (plan === "premium" && isTrialActive)
    return <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">Trial</span>;
  if (plan === "premium")
    return <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">Premium</span>;
  return <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">Free</span>;
}

// ── Edit User Modal ────────────────────────────────────────────────────────────
function EditUserModal({
  user,
  onSave,
  onClose,
}: {
  user: AskiMateUserData;
  onSave: (user: AskiMateUserData, updates: Partial<AskiMateUserData>) => Promise<void>;
  onClose: () => void;
}) {
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [mobile, setMobile] = useState(user.mobile || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(user, { firstName, lastName, mobile: mobile || undefined });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
        <h3 className="text-lg font-bold text-foreground mb-5">Edit User</h3>
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">First Name</label>
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Last Name</label>
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Mobile (optional)</label>
            <input type="text" value={mobile} onChange={(e) => setMobile(e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button className="bg-primary hover:bg-primary/90 text-white" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Right Panel: Chat Panel ────────────────────────────────────────────────────
function AdminChatPanel({
  user,
  conversation,
  onConversationUpdated,
  fetchUnreadCount,
}: {
  user: AskiMateUserData;
  conversation: Conversation;
  onConversationUpdated: () => void;
  fetchUnreadCount: () => void;
}) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [showNewMessageButton, setShowNewMessageButton] = useState(false);
  const [lastNewMessageId, setLastNewMessageId] = useState<number | null>(null);
  const [localConvStatus, setLocalConvStatus] = useState(conversation.status || "open");
  const [approveForKb, setApproveForKb] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const knownMessageIds = useRef<Set<number>>(new Set());

  // Reset on conversation change
  useEffect(() => {
    setMessages([]);
    setReplyText("");
    setLastNewMessageId(null);
    setShowNewMessageButton(false);
    setLocalConvStatus(conversation.status || "open");
    setApproveForKb(false);
    knownMessageIds.current.clear();
  }, [conversation.id, conversation.status]);

  // Auto scroll
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const nearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    if (nearBottom || messages.length === 1) {
      requestAnimationFrame(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }));
    }
  }, [messages.length]);

  const fetchMessages = useCallback(async (isInitial = true) => {
    try {
      const response = await apiFetch<{ data: Message[] }>(
        `/admin/askimate-conversations/${conversation.id}/messages`
      );
      const all = response.data.map((m) => ({ ...m, createdAt: new Date(m.createdAt) }));

      setMessages((prev) => {
        const newMsgs = all.filter((m) => !knownMessageIds.current.has(m.id));

        if (isInitial) {
          all.forEach((m) => knownMessageIds.current.add(m.id));
          return all;
        }

        if (newMsgs.length === 0) return prev;

        newMsgs.forEach((msg) => {
          if (isIncomingMessage(msg, "admin") && localConvStatus === "open") {
            setLastNewMessageId(msg.id);
            const container = messagesContainerRef.current;
            if (container) {
              const nearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
              if (!nearBottom) setShowNewMessageButton(true);
            }
          }
          knownMessageIds.current.add(msg.id);
        });

        return [...prev, ...newMsgs];
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch messages";
      setError(msg);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [conversation.id, user.id, localConvStatus]);

  // Initial load + mark read
  useEffect(() => {
    fetchMessages(true);

    const markAsRead = async () => {
      try {
        await apiFetch(`/admin/askimate-conversations/${conversation.id}/mark-read`, { method: "POST" });
        setTimeout(fetchUnreadCount, 100);
      } catch { /* ignore */ }
    };
    markAsRead();
  }, [fetchMessages, conversation.id, fetchUnreadCount]);

  // Poll every 2s (initial load handled by the effect above)
  useEffect(() => {
    const interval = setInterval(() => fetchMessages(false), 2000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  const handleSendReply = async () => {
    if (!replyText.trim() || sending) return;
    const msg = replyText.trim();
    setSending(true);
    setError("");
    try {
      // Build KB context from conversation if approving
      const lastUserMsg = [...messages].reverse().find((m) => m.sender === "user");
      const lastAiWithMeta = [...messages].reverse().find((m) => m.sender === "ai" && m.metadata);
      const aiCtx =
        approveForKb && lastUserMsg
          ? {
              sourceQuestion: lastUserMsg.content,
              aiAnswer: lastAiWithMeta?.metadata?.aiAttempt,
              reviewLevel: lastAiWithMeta?.metadata?.reviewLevel,
              topSources: (lastAiWithMeta?.metadata?.sources ?? [])
                .map((s) => s.id || s.title || "")
                .filter(Boolean),
            }
          : undefined;

      const response = await apiFetch<{ data: Message }>(
        `/admin/askimate-conversations/${conversation.id}/mentor-reply`,
        { method: "POST", body: JSON.stringify({ message: msg, approveForKb, aiContext: aiCtx }) }
      );
      knownMessageIds.current.add(response.data.id);
      setMessages((prev) => [...prev, response.data]);
      setReplyText("");
      if (approveForKb) {
        toast({ title: "Approved for Knowledge Base", description: "Your reply has been queued for KB ingestion." });
        setApproveForKb(false);
      }
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  const handleToggleStatus = async () => {
    const isOpen = localConvStatus === "open";
    try {
      await apiFetch(
        `/admin/askimate-conversations/${conversation.id}/${isOpen ? "close" : "reopen"}`,
        { method: "POST" }
      );
      setLocalConvStatus(isOpen ? "closed" : "open");
      onConversationUpdated();
    } catch (err) {
      toast({ title: "Error", description: "Failed to update conversation status.", variant: "destructive" });
    }
  };

  const getSenderStyle = (sender: "user" | "ai" | "mentor") => {
    if (sender === "user") return "bg-primary text-white rounded-br-sm";
    if (sender === "mentor") return "bg-green-100 text-green-900 border border-green-200 rounded-bl-sm";
    return "bg-white text-foreground border border-border/60 rounded-bl-sm shadow-sm";
  };

  const getSenderLabel = (sender: "user" | "ai" | "mentor") => {
    if (sender === "user") return `${user.firstName} ${user.lastName}`;
    if (sender === "mentor") return "You (Mentor)";
    return "AskiMate AI";
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Conversation sub-header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/60 bg-slate-50 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${localConvStatus === "open" ? "bg-green-500" : "bg-amber-400"}`} />
          <span className="text-sm font-medium text-foreground truncate">{conversation.title}</span>
          <span className="text-xs text-muted-foreground flex-shrink-0">· {conversation.questionCount} msgs</span>
        </div>
        <button
          onClick={handleToggleStatus}
          className={`text-xs font-medium px-2.5 py-1 rounded-lg transition-colors flex-shrink-0 ${
            localConvStatus === "open"
              ? "text-amber-700 bg-amber-50 hover:bg-amber-100"
              : "text-blue-700 bg-blue-50 hover:bg-blue-100"
          }`}
        >
          {localConvStatus === "open" ? "Close Chat" : "Reopen"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-b border-red-200 flex items-center justify-between flex-shrink-0">
          <p className="text-xs text-red-700">{error}</p>
          <button onClick={() => { setError(""); fetchMessages(false); }} className="text-xs text-red-600 font-medium ml-2">Retry</button>
        </div>
      )}

      {/* Messages */}
      {loading && messages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0 bg-slate-50">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <MessageSquare className="w-10 h-10 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No messages in this conversation yet.</p>
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} ${msg.id === lastNewMessageId ? "animate-pulse" : ""}`}
            >
              <div className="max-w-sm w-full">
                <p className={`text-xs font-medium mb-1 ${msg.sender === "user" ? "text-right text-muted-foreground" : msg.sender === "mentor" ? "text-green-700" : "text-blue-600"}`}>
                  {getSenderLabel(msg.sender)}
                </p>
                <div className={`px-4 py-2.5 rounded-2xl text-sm ${getSenderStyle(msg.sender)} ${msg.id === lastNewMessageId ? "ring-2 ring-blue-400" : ""}`}>
                  {msg.content}
                </div>

                {/* AI context strip — only on AI messages that carry metadata */}
                {msg.sender === "ai" && msg.metadata && (
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5 px-1">
                    {msg.metadata.reviewLevel && (
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                          msg.metadata.reviewLevel === "escalate_human"
                            ? "bg-red-100 text-red-700"
                            : msg.metadata.reviewLevel === "cautious_auto"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {msg.metadata.reviewLevel === "escalate_human"
                          ? "⚠ Needs mentor"
                          : msg.metadata.reviewLevel === "cautious_auto"
                          ? "~ Cautious auto"
                          : "✓ Safe auto"}
                      </span>
                    )}
                    {msg.metadata.sources?.slice(0, 2).map((s, i) => (
                      <span key={i} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
                        {s.title || s.id}
                      </span>
                    ))}
                    {msg.metadata.reviewLevel === "escalate_human" && msg.metadata.aiAttempt && (
                      <details className="w-full mt-1">
                        <summary className="text-[10px] text-blue-600 cursor-pointer hover:underline select-none">
                          AI attempt ↓
                        </summary>
                        <p className="text-xs text-foreground bg-blue-50 border border-blue-100 rounded-lg p-2 mt-1 leading-relaxed whitespace-pre-wrap">
                          {msg.metadata.aiAttempt}
                        </p>
                      </details>
                    )}
                  </div>
                )}

                <p className={`text-xs mt-1 text-muted-foreground ${msg.sender === "user" ? "text-right" : "text-left"}`}>
                  {fmtTime(msg.createdAt)}
                </p>
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />

          {showNewMessageButton && (
            <button
              onClick={() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); setShowNewMessageButton(false); }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              ↓ New message
            </button>
          )}
        </div>
      )}

      {/* Reply input */}
      {localConvStatus === "open" ? (
        <div className="px-4 pt-3 pb-4 border-t border-border/60 bg-white flex-shrink-0">
          {/* KB approval toggle */}
          <label className="flex items-center gap-2 mb-2 cursor-pointer select-none group w-fit">
            <input
              type="checkbox"
              checked={approveForKb}
              onChange={(e) => setApproveForKb(e.target.checked)}
              disabled={sending}
              className="rounded border-border cursor-pointer accent-green-600"
            />
            <BookCheck className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${approveForKb ? "text-green-600" : "text-muted-foreground"}`} />
            <span className={`text-xs transition-colors ${approveForKb ? "text-green-700 font-medium" : "text-muted-foreground"}`}>
              Approve this reply for Knowledge Base
            </span>
          </label>

          <div className="flex items-end gap-2">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !sending) {
                  e.preventDefault();
                  handleSendReply();
                }
              }}
              placeholder="Reply as mentor…"
              rows={1}
              className="flex-1 border border-border rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none bg-slate-50 leading-relaxed"
              style={{ minHeight: "42px", maxHeight: "120px", overflowY: "auto" }}
              disabled={sending}
            />
            <Button
              onClick={handleSendReply}
              disabled={!replyText.trim() || sending}
              className="bg-primary hover:bg-primary/90 text-white rounded-2xl flex-shrink-0 h-[42px] w-[42px] p-0"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5 px-1">Enter to send · Shift+Enter for new line</p>
        </div>
      ) : (
        <div className="px-4 py-4 border-t border-border/60 bg-white flex items-center justify-center gap-2 flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">This conversation is closed. Reopen it to reply.</p>
        </div>
      )}
    </div>
  );
}

// ── Right Panel: User chat view ───────────────────────────────────────────────
function AdminUserPanel({
  user,
  onEdit,
  onDelete,
  onBack,
  fetchGlobalUnreadCount,
}: {
  user: AskiMateUserData;
  onEdit: (user: AskiMateUserData) => void;
  onDelete: (user: AskiMateUserData) => void;
  onBack: () => void;
  fetchGlobalUnreadCount: () => void;
}) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [convLoading, setConvLoading] = useState(true);
  const [selectedConvId, setSelectedConvId] = useState<number | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await apiFetch<{ data: Conversation[] }>(`/admin/askimate-users/${user.id}/conversations`);
      const convs = res.data.map((c) => ({
        ...c,
        createdAt: new Date(c.createdAt),
        updatedAt: new Date(c.updatedAt),
      }));
      setConversations(convs);
      // Auto-select: first conversation with unread, else first open, else first
      setSelectedConvId((prev) => {
        if (prev) return prev; // keep current selection
        const withUnread = convs.find((c) => (c.unreadCount || 0) > 0);
        if (withUnread) return withUnread.id;
        const firstOpen = convs.find((c) => c.status === "open");
        if (firstOpen) return firstOpen.id;
        return convs[0]?.id || null;
      });
    } catch { /* ignore */ } finally {
      setConvLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    setConvLoading(true);
    setSelectedConvId(null);
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [user.id, fetchConversations]);

  const selectedConv = conversations.find((c) => c.id === selectedConvId) || null;
  const openConvs = conversations.filter((c) => c.status === "open");
  const closedConvs = conversations.filter((c) => c.status === "closed");

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* User header */}
      <div className="flex items-center gap-3 px-5 py-3.5 bg-white border-b border-border/60 flex-shrink-0">
        {/* Mobile: back button */}
        <button
          onClick={onBack}
          className="lg:hidden p-1.5 hover:bg-muted rounded-lg transition-colors flex-shrink-0"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
          {user.firstName[0]}{user.lastName[0]}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-sm font-semibold text-foreground truncate">
              {user.firstName} {user.lastName}
            </h2>
            <PlanBadge plan={user.plan} isTrialActive={user.isTrialActive} />
            {user.plan === "free" && user.weeklyUsage >= FREE_LIMIT && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">Limit hit</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onEdit(user)}
            className="p-2 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit user"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(user)}
            className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete user"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Conversation tabs */}
      {!convLoading && conversations.length > 0 && (
        <div className="flex items-center gap-1.5 px-4 py-2 bg-white border-b border-border/60 overflow-x-auto flex-shrink-0">
          {[...openConvs, ...closedConvs].map((conv) => {
            const hasUnread = (conv.unreadCount || 0) > 0;
            return (
              <button
                key={conv.id}
                onClick={() => {
                  setSelectedConvId(conv.id);
                  // Immediately clear unread badge for this tab — server confirms via mark-read
                  if ((conv.unreadCount || 0) > 0) {
                    setConversations((prev) => prev.map((c) => c.id === conv.id ? { ...c, unreadCount: 0 } : c));
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                  selectedConvId === conv.id
                    ? "bg-primary text-white"
                    : hasUnread
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : conv.status === "closed"
                        ? "bg-muted/50 text-muted-foreground"
                        : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                <span className="truncate max-w-[120px]">{conv.title}</span>
                {hasUnread && selectedConvId !== conv.id && (
                  <span className="w-4 h-4 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
                    {conv.unreadCount}
                  </span>
                )}
                {conv.status === "closed" && (
                  <span className="text-xs opacity-60 flex-shrink-0">arch</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Main area */}
      {convLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : conversations.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50">
          <MessageSquare className="w-12 h-12 text-muted-foreground/20 mb-4" />
          <h3 className="font-semibold text-foreground mb-1">No conversations yet</h3>
          <p className="text-sm text-muted-foreground">This user hasn't started any chats.</p>
        </div>
      ) : !selectedConv ? (
        <div className="flex-1 flex items-center justify-center bg-slate-50">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          <AdminChatPanel
            user={user}
            conversation={selectedConv}
            onConversationUpdated={fetchConversations}
            fetchUnreadCount={fetchGlobalUnreadCount}
          />
        </div>
      )}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function AskiMateUsersAdmin() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<AskiMateUserData[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [selectedUser, setSelectedUser] = useState<AskiMateUserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [globalUnreadCount, setGlobalUnreadCount] = useState(0);
  const [editingUser, setEditingUser] = useState<AskiMateUserData | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<AskiMateUserData | null>(null);
  const [mobileShowPanel, setMobileShowPanel] = useState(false);

  // Listen for sidebar reset event
  useEffect(() => {
    const handle = () => { setSelectedUser(null); setMobileShowPanel(false); };
    window.addEventListener("askimate-reset-selected-user", handle);
    return () => window.removeEventListener("askimate-reset-selected-user", handle);
  }, []);

  // Fetch users
  const fetchUsers = useCallback(async (pageNum = 1) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ page: String(pageNum), limit: "20", ...(search && { search }) });
      const response = await apiFetch<{ data: AskiMateUserData[]; pagination: PaginationData }>(`/admin/askimate-users?${query}`);
      setUsers(response.data);
      setPagination(response.pagination);
      setPage(pageNum);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchUsers(1); }, [fetchUsers]);

  // Global unread count
  const fetchGlobalUnreadCount = useCallback(async () => {
    try {
      const res = await apiFetch<{ unreadCount: number }>("/admin/unread-count");
      setGlobalUnreadCount(res.unreadCount || 0);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchGlobalUnreadCount();
    const interval = setInterval(fetchGlobalUnreadCount, 3000);
    return () => clearInterval(interval);
  }, [fetchGlobalUnreadCount]);

  // Per-user unread counts
  const fetchPerUserUnread = useCallback(async () => {
    if (!users.length || selectedUser) return;
    const unreadMap = new Map<number, number>();
    await Promise.all(users.map(async (u) => {
      try {
        const res = await apiFetch<{ data: Conversation[] }>(`/admin/askimate-users/${u.id}/conversations`);
        const total = (res.data || []).reduce((sum, c) => sum + (c.unreadCount || 0), 0);
        unreadMap.set(u.id, total);
      } catch { /* ignore */ }
    }));
    setUsers((prev) => prev.map((u) => ({ ...u, unreadCount: unreadMap.get(u.id) ?? u.unreadCount ?? 0 })));
  }, [users.length, selectedUser]);

  useEffect(() => {
    const interval = setInterval(fetchPerUserUnread, 4000);
    return () => clearInterval(interval);
  }, [fetchPerUserUnread]);

  // Handlers
  const handleDeleteUser = async (user: AskiMateUserData) => {
    try {
      await apiFetch(`/admin/askimate-users/${user.id}`, { method: "DELETE" });
      toast({ title: "User deleted", description: `${user.firstName} ${user.lastName} has been removed.` });
      fetchUsers(page);
      setDeleteConfirm(null);
      if (selectedUser?.id === user.id) { setSelectedUser(null); setMobileShowPanel(false); }
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to delete user", variant: "destructive" });
    }
  };

  const handleEditUser = async (user: AskiMateUserData, updates: Partial<AskiMateUserData>) => {
    try {
      await apiFetch(`/admin/askimate-users/${user.id}`, { method: "PUT", body: JSON.stringify(updates) });
      toast({ title: "User updated" });
      fetchUsers(page);
      setEditingUser(null);
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to update user", variant: "destructive" });
    }
  };

  const handleSelectUser = (user: AskiMateUserData) => {
    setSelectedUser(user);
    setMobileShowPanel(true);
    // Immediately clear this user's unread badge — mark-read will confirm server-side
    const cleared = user.unreadCount || 0;
    if (cleared > 0) {
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, unreadCount: 0 } : u));
      setGlobalUnreadCount((prev) => Math.max(0, prev - cleared));
    }
  };

  const totalUsers = pagination?.total || 0;

  return (
    <AdminLayout fullHeight>
      <Helmet>
        <title>AskiMate Users — Admin</title>
      </Helmet>

      {/* ── Two-panel messaging layout ─────────────────────────────────── */}
      <div className="flex overflow-hidden border-t border-border/60 bg-white h-full">

        {/* ── LEFT PANEL: User list ────────────────────────────────────── */}
        <div className={`flex flex-col border-r border-border/60 flex-shrink-0 w-full lg:w-80 xl:w-96 ${mobileShowPanel ? "hidden lg:flex" : "flex"}`}>
          {/* Header */}
          <div className="px-4 py-3.5 border-b border-border/60 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <h1 className="text-sm font-bold text-foreground">AskiMate Users</h1>
                {globalUnreadCount > 0 && (
                  <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white bg-red-600 rounded-full animate-pulse">
                    {globalUnreadCount > 99 ? "99+" : globalUnreadCount}
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground">{totalUsers} users</span>
            </div>
            {/* Search */}
            <div className="flex items-center gap-2 bg-muted/40 rounded-lg px-3 py-2">
              <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <input
                type="text"
                placeholder="Search users…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm focus:outline-none"
              />
              {search && (
                <button onClick={() => setSearch("")} className="text-muted-foreground hover:text-foreground">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* User list */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center px-4">
                <Users className="w-8 h-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No users found</p>
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {users.map((user) => {
                  const hasUnread = (user.unreadCount || 0) > 0;
                  const isSelected = selectedUser?.id === user.id;
                  return (
                    <button
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      className={`w-full text-left px-4 py-3 transition-colors flex items-center gap-3 ${
                        isSelected
                          ? "bg-primary/8 border-l-2 border-primary"
                          : hasUnread
                            ? "bg-blue-50/50 hover:bg-blue-50"
                            : "hover:bg-muted/20"
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        hasUnread ? "bg-blue-100 text-blue-700" : "bg-primary/10 text-primary"
                      }`}>
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className={`text-sm truncate ${hasUnread ? "font-semibold text-foreground" : "font-medium text-foreground"}`}>
                            {user.firstName} {user.lastName}
                          </span>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {fmtRelative(user.updatedAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <PlanBadge plan={user.plan} isTrialActive={user.isTrialActive} />
                          {hasUnread && (
                            <span className="text-xs font-semibold text-blue-600 animate-pulse">
                              {user.unreadCount} unread
                            </span>
                          )}
                          {!hasUnread && (
                            <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border/60 flex-shrink-0">
              <span className="text-xs text-muted-foreground">Page {pagination.page} of {pagination.totalPages}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={pagination.page === 1} onClick={() => fetchUsers(pagination.page - 1)}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled={pagination.page === pagination.totalPages} onClick={() => fetchUsers(pagination.page + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT PANEL: User chat view ──────────────────────────────── */}
        <div className={`flex-1 overflow-hidden ${mobileShowPanel || selectedUser ? "flex flex-col" : "hidden lg:flex flex-col"}`}>
          {selectedUser ? (
            <AdminUserPanel
              key={selectedUser.id}
              user={selectedUser}
              onEdit={setEditingUser}
              onDelete={setDeleteConfirm}
              onBack={() => { setSelectedUser(null); setMobileShowPanel(false); }}
              fetchGlobalUnreadCount={fetchGlobalUnreadCount}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50">
              <MessageSquare className="w-14 h-14 text-muted-foreground/15 mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Select a user</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Choose a user from the list to view their conversations and reply as mentor.
              </p>
              {globalUnreadCount > 0 && (
                <div className="mt-4 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700 font-medium">{globalUnreadCount} unread message{globalUnreadCount !== 1 ? "s" : ""} waiting</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Delete Confirmation ─────────────────────────────────────────── */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-foreground mb-2">Delete User?</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to delete <strong>{deleteConfirm.firstName} {deleteConfirm.lastName}</strong>?
              This will also delete all their conversations and messages. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
              <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={() => handleDeleteUser(deleteConfirm)}>
                Delete User
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit User Modal ─────────────────────────────────────────────── */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onSave={handleEditUser}
          onClose={() => setEditingUser(null)}
        />
      )}
    </AdminLayout>
  );
}

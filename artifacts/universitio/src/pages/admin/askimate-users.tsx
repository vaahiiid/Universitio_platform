import { useEffect, useState, useCallback, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Search, Download, MessageSquare, ChevronRight, Loader2, Zap, ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

interface AskiMateUserData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  plan: "free" | "premium";
  isTrialActive: boolean;
  trialStartedAt: Date | null;
  trialEndsAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  weeklyUsage: number;
  conversationCount: number;
}

interface Conversation {
  id: number;
  title: string;
  questionCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Message {
  id: number;
  conversationId: number;
  sender: "user" | "ai" | "mentor";
  isUserMessage: boolean;
  content: string;
  createdAt: Date;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ApiResponse {
  data: AskiMateUserData[];
  pagination: PaginationData;
}

const FREE_LIMIT = 5;

function formatDate(d: Date | string | null) {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function formatDateTime(d: Date | string | null) {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTime(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function PlanBadge({ plan, isTrialActive }: { plan: "free" | "premium"; isTrialActive: boolean }) {
  const isPremium = plan === "premium";
  if (isPremium && isTrialActive) {
    return <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">Trial Active</span>;
  }
  if (isPremium) {
    return <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">Premium</span>;
  }
  return <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">Free</span>;
}

function UsageBadge({ weeklyUsage, plan }: { weeklyUsage: number; plan: "free" | "premium" }) {
  if (plan === "premium") return null;
  const isLimitHit = weeklyUsage >= FREE_LIMIT;
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
      isLimitHit
        ? "bg-red-100 text-red-700"
        : "bg-amber-100 text-amber-700"
    }`}>
      {weeklyUsage}/{FREE_LIMIT} questions
    </span>
  );
}

function UserListRow({ user, onSelect }: { user: AskiMateUserData; onSelect: (user: AskiMateUserData) => void }) {
  return (
    <button
      onClick={() => onSelect(user)}
      className="w-full border-b border-border/40 hover:bg-muted/30 transition-colors p-4 text-left"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-sm font-semibold text-primary">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div>
              <p className="font-medium text-foreground">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-2 flex-wrap justify-end max-w-xs">
            <PlanBadge plan={user.plan} isTrialActive={user.isTrialActive} />
            <UsageBadge weeklyUsage={user.weeklyUsage} plan={user.plan} />
          </div>
          <div className="text-right hidden md:block min-w-20">
            <p className="text-sm font-medium text-foreground">{user.conversationCount}</p>
            <p className="text-xs text-muted-foreground">conversations</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        </div>
      </div>
    </button>
  );
}

function ChatView({
  user,
  conversation,
  onBack,
}: {
  user: AskiMateUserData;
  conversation: Conversation;
  onBack: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom only on new messages (not on every poll)
  useEffect(() => {
    const messagesContainer = document.querySelector('[class*="overflow-y-auto"]');
    if (messagesContainer) {
      const isNearBottom = 
        messagesContainer.scrollHeight - messagesContainer.scrollTop - messagesContainer.clientHeight < 100;
      if (isNearBottom || messages.length === 1) { // Scroll if new message or first message
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [messages.length]); // Only trigger on length change, not full array change

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      console.log(`
==== [ADMIN] CONVERSATION DEBUG ====
conversationId: ${conversation.id}
conversationTitle: ${conversation.title}
conversationQuestionCount: ${conversation.questionCount}
Fetching messages...
`);
      const response = await apiFetch<{ data: Message[] }>(
        `/admin/askimate-conversations/${conversation.id}/messages`
      );
      
      console.log(`[ADMIN] FETCH RESULT: ${response.data.length} messages returned`);
      response.data.forEach((msg, idx) => {
        console.log(`  [${idx + 1}] id=${msg.id} | conversationId=${msg.conversationId} | sender=${msg.sender} | isUserMessage=${msg.isUserMessage} | createdAt=${msg.createdAt} | content=${msg.content.substring(0, 50)}`);
      });
      console.log(`==== END DEBUG ====`);
      
      const newMessages = response.data.map((m) => ({ ...m, createdAt: new Date(m.createdAt) }));
      // Smart merge: only update if messages actually changed
      setMessages((prev) => {
        const prevIds = new Set(prev.map((m) => m.id));
        const newIds = new Set(newMessages.map((m) => m.id));
        if (prevIds.size === newIds.size && [...prevIds].every((id) => newIds.has(id))) {
          return prev; // No change, don't re-render
        }
        return newMessages; // New messages, update
      });
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to fetch messages";
      console.error("[ADMIN] FETCH FAILED:", errMsg);
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  }, [conversation.id]);

  useEffect(() => {
    fetchMessages();
    
    // Mark all messages as read for admin
    const markAsRead = async () => {
      try {
        await apiFetch(`/admin/askimate-conversations/${conversation.id}/mark-read`, {
          method: "POST",
        });
      } catch (err) {
        console.error("Failed to mark messages as read:", err);
      }
    };
    markAsRead();
  }, [fetchMessages, conversation.id]);

  // Polling: Refetch messages every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMessages();
    }, 4000);

    return () => clearInterval(interval);
  }, [fetchMessages]);

  const handleSendReply = async () => {
    if (!replyText.trim()) return;

    setSending(true);
    setError("");
    const msgText = replyText;
    try {
      console.log(`
==== [ADMIN SEND] MENTOR REPLY ====
conversationId: ${conversation.id}
messageContent: ${msgText.substring(0, 100)}
Sending request...
`);
      
      const response = await apiFetch<{ data: Message }>(
        `/admin/askimate-conversations/${conversation.id}/mentor-reply`,
        {
          method: "POST",
          body: JSON.stringify({ message: msgText }),
        }
      );

      console.log(`[ADMIN SEND] SUCCESS - Response:`, response.data);
      console.log(`[ADMIN SEND] Inserted: id=${response.data.id} | sender=${response.data.sender} | conversationId=${response.data.conversationId}`);
      
      setMessages([
        ...messages,
        { ...response.data, createdAt: new Date(response.data.createdAt) },
      ]);
      setReplyText("");
      console.log(`==== END SEND ====`);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to send reply";
      console.error(`[ADMIN SEND] FAILED:`, errMsg);
      setError(errMsg);
    } finally {
      setSending(false);
    }
  };

  const getSenderLabel = (sender: "user" | "ai" | "mentor") => {
    switch (sender) {
      case "user":
        return `${user.firstName} ${user.lastName}`;
      case "ai":
        return "AskiMate AI";
      case "mentor":
        return "Mentor";
      default:
        return "Unknown";
    }
  };

  const getSenderColor = (sender: "user" | "ai" | "mentor") => {
    switch (sender) {
      case "user":
        return "bg-primary text-white";
      case "ai":
        return "bg-blue-100 text-blue-900 border border-blue-200";
      case "mentor":
        return "bg-green-100 text-green-900 border border-green-200";
      default:
        return "bg-gray-100 text-gray-900";
    }
  };

  return (
    <div className="space-y-6 h-[calc(100vh-200px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-primary hover:underline font-medium text-sm">
          ← Back
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-foreground">{conversation.title}</h2>
            <span className={`text-xs px-2 py-1 rounded ${conversation.status === "closed" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
              {conversation.status === "closed" ? "Closed" : "Open"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{conversation.questionCount} questions</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchMessages}
            disabled={loading}
            className="text-primary hover:underline font-medium text-sm disabled:text-muted-foreground"
          >
            {loading ? "Refetching..." : "Refetch"}
          </button>
          {conversation.status === "closed" ? (
            <button 
              onClick={async () => {
                try {
                  await apiFetch(`/admin/askimate-conversations/${conversation.id}/reopen`, { method: "POST" });
                  fetchMessages();
                } catch (err) {
                  console.error("Failed to reopen conversation:", err);
                }
              }}
              className="text-blue-600 hover:underline font-medium text-sm"
            >
              Reopen
            </button>
          ) : (
            <button 
              onClick={async () => {
                try {
                  await apiFetch(`/admin/askimate-conversations/${conversation.id}/close`, { method: "POST" });
                  fetchMessages();
                } catch (err) {
                  console.error("Failed to close conversation:", err);
                }
              }}
              className="text-red-600 hover:underline font-medium text-sm"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div className="bg-white rounded-xl border border-border/60 flex-1 overflow-y-auto p-6 space-y-4">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
            <p className="text-sm font-medium text-red-700">{error}</p>
            <button 
              onClick={fetchMessages}
              className="text-xs text-red-600 hover:text-red-800 mt-2 underline"
            >
              Try again
            </button>
          </div>
        )}
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>No messages yet</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-lg rounded-lg px-4 py-2 ${getSenderColor(msg.sender)}`}
                >
                  <p className="text-xs font-semibold mb-1 opacity-70">
                    {getSenderLabel(msg.sender)} • {formatTime(msg.createdAt)}
                  </p>
                  <p className="text-sm break-words">{msg.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Reply Input */}
      <div className="bg-white rounded-xl border border-border/60 p-4">
        <div className="flex gap-3">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !sending) {
                e.preventDefault();
                handleSendReply();
              }
            }}
            placeholder="Reply as mentor... (Enter to send, Shift+Enter for new line)"
            rows={2}
            className="flex-1 border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
          />
          <Button
            onClick={handleSendReply}
            disabled={!replyText.trim() || sending}
            className="bg-primary hover:bg-primary/90 text-white self-end"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function UserDetailView({ user, onBack }: { user: AskiMateUserData; onBack: () => void }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      try {
        const response = await apiFetch<{ data: Conversation[] }>(
          `/admin/askimate-users/${user.id}/conversations`
        );
        setConversations(
          response.data.map((c) => ({
            ...c,
            createdAt: new Date(c.createdAt),
            updatedAt: new Date(c.updatedAt),
          }))
        );
      } catch (err) {
        console.error("Failed to fetch conversations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user.id]);

  if (selectedConversation) {
    return (
      <ChatView
        user={user}
        conversation={selectedConversation}
        onBack={() => setSelectedConversation(null)}
      />
    );
  }

  const daysUntilTrialEnds = user.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(user.trialEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="text-primary hover:underline font-medium text-sm"
      >
        ← Back to Users
      </button>

      <div className="bg-white rounded-xl border border-border/60 p-8 space-y-8">
        {/* Profile Section */}
        <div className="pb-8 border-b border-border/40">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center text-2xl font-bold text-primary flex-shrink-0">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {user.firstName} {user.lastName}
              </h2>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>Email: {user.email}</p>
                <p>Joined: {formatDateTime(user.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Plan & Trial Status */}
        <div className="pb-8 border-b border-border/40">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Plan & Trial Status
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
              <span className="text-sm font-medium text-muted-foreground">Current Plan</span>
              <PlanBadge plan={user.plan} isTrialActive={user.isTrialActive} />
            </div>

            {user.plan === "premium" && (
              <>
                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                  <span className="text-sm font-medium text-muted-foreground">Trial Start</span>
                  <span className="text-sm text-foreground">{formatDate(user.trialStartedAt)}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                  <span className="text-sm font-medium text-muted-foreground">Trial Ends</span>
                  <span className={`text-sm font-medium ${user.isTrialActive ? "text-green-600" : "text-red-600"}`}>
                    {formatDate(user.trialEndsAt)} {user.isTrialActive && daysUntilTrialEnds !== null && `(${daysUntilTrialEnds}d left)`}
                  </span>
                </div>
              </>
            )}

            {user.plan === "free" && (
              <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground">Weekly Usage</span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${user.weeklyUsage >= FREE_LIMIT ? "text-red-600" : "text-amber-600"}`}>
                    {user.weeklyUsage}/{FREE_LIMIT}
                  </span>
                  {user.weeklyUsage >= FREE_LIMIT && (
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">Limit Hit</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Conversations */}
        <div>
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Conversations ({conversations.length})
          </h3>

          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-6 text-center bg-muted/20 rounded-lg">
              <p className="text-muted-foreground">No conversations yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className="w-full text-left p-4 bg-muted/20 hover:bg-muted/40 rounded-lg transition-colors border border-border/40"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{conv.title}</p>
                        <span className={`text-xs px-2 py-1 rounded ${conv.status === "closed" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                          {conv.status === "closed" ? "Closed" : "Open"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {conv.questionCount} questions • {formatDateTime(conv.updatedAt)}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AskiMateUsersAdmin() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<AskiMateUserData[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [selectedUser, setSelectedUser] = useState<AskiMateUserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUsers = useCallback(
    async (pageNum = 1) => {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          page: String(pageNum),
          limit: "20",
          ...(search && { search }),
        });
        const response = await apiFetch<ApiResponse>(`/admin/askimate-users?${query}`);
        setUsers(response.data);
        setPagination(response.pagination);
        setPage(pageNum);
      } catch (err) {
        console.error("Failed to fetch AskiMate users:", err);
      } finally {
        setLoading(false);
      }
    },
    [search]
  );

  useEffect(() => {
    fetchUsers(1);
  }, [search, fetchUsers]);

  // Poll unread count every 3 seconds
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await apiFetch<{ unreadCount: number }>("/admin/unread-count");
        setUnreadCount(response.unreadCount || 0);
      } catch (err) {
        console.error("Failed to fetch unread count:", err);
      }
    };

    const interval = setInterval(fetchUnreadCount, 3000);
    fetchUnreadCount(); // Fetch immediately on mount
    return () => clearInterval(interval);
  }, []);

  const totalUsers = pagination?.total || 0;

  return (
    <AdminLayout>
      <Helmet>
        <title>AskiMate Users — Admin</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground">AskiMate AI Users</h1>
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center px-3 py-1 text-sm font-bold text-white bg-red-600 rounded-full">
                  {unreadCount > 99 ? "99+" : unreadCount} unread
                </span>
              )}
            </div>
            <p className="text-muted-foreground mt-1">{totalUsers} users total</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={totalUsers === 0}
            onClick={() => {
              const csv = [
                ["Name", "Email", "Plan", "Trial Active", "Conversations"].join(","),
                ...users.map((u) =>
                  [
                    `"${u.firstName} ${u.lastName}"`,
                    u.email,
                    u.plan,
                    u.isTrialActive ? "Yes" : "No",
                    u.conversationCount,
                  ].join(",")
                ),
              ].join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "askimate-users.csv";
              a.click();
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        {selectedUser ? (
          <UserDetailView user={selectedUser} onBack={() => setSelectedUser(null)} />
        ) : (
          <>
            {/* Search */}
            <div className="bg-white rounded-xl border border-border/60 p-4">
              <div className="flex items-center gap-3 bg-muted/30 rounded-lg px-4 py-2.5">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent text-sm focus:outline-none"
                />
              </div>
            </div>

            {/* Users List */}
            <div className="bg-white rounded-xl border border-border/60 overflow-hidden">
              {loading ? (
                <div className="p-8 text-center flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  <span className="text-muted-foreground">Loading users...</span>
                </div>
              ) : users.length > 0 ? (
                <>
                  <div>
                    {users.map((user) => (
                      <UserListRow key={user.id} user={user} onSelect={setSelectedUser} />
                    ))}
                  </div>
                  {pagination && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-border/40 bg-muted/10">
                      <span className="text-sm text-muted-foreground">
                        Page {pagination.page} of {pagination.totalPages}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={pagination.page === 1}
                          onClick={() => fetchUsers(pagination.page - 1)}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={pagination.page === pagination.totalPages}
                          onClick={() => fetchUsers(pagination.page + 1)}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">No users found</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

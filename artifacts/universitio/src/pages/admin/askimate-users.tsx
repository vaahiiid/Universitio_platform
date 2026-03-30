import { useEffect, useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Search, Download, MessageSquare, FileText, ChevronRight, Loader2, Clock, Zap } from "lucide-react";
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

function FieldRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="grid grid-cols-3 gap-2 py-2 border-b border-border/40 last:border-0">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground col-span-2">{value}</span>
    </div>
  );
}

function UserDetailView({ user, onBack }: { user: AskiMateUserData; onBack: () => void }) {
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
              <div className="space-y-2">
                <FieldRow label="Email" value={user.email} />
                <FieldRow label="Joined" value={formatDateTime(user.createdAt)} />
                <FieldRow label="Last Updated" value={formatDateTime(user.updatedAt)} />
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

        {/* Usage & Activity */}
        <div>
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Activity
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/20 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Total Conversations</p>
              <p className="text-3xl font-bold text-foreground">{user.conversationCount}</p>
            </div>
            {user.plan === "free" && (
              <div className="p-4 bg-muted/20 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">This Week's Questions</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-foreground">{user.weeklyUsage}</p>
                  <span className="text-sm text-muted-foreground">/ {FREE_LIMIT} limit</span>
                </div>
              </div>
            )}
          </div>
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

  const totalUsers = pagination?.total || 0;

  return (
    <AdminLayout>
      <Helmet>
        <title>AskiMate Users — Admin</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">AskiMate AI Users</h1>
            <p className="text-muted-foreground mt-1">{totalUsers} users total</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={totalUsers === 0}
            onClick={() => {
              const csv = [
                ["Name", "Email", "Plan", "Trial Active", "Trial Start", "Trial End", "Conversations", "Weekly Usage"].join(","),
                ...users.map((u) =>
                  [
                    `"${u.firstName} ${u.lastName}"`,
                    u.email,
                    u.plan,
                    u.isTrialActive ? "Yes" : "No",
                    formatDate(u.trialStartedAt),
                    formatDate(u.trialEndsAt),
                    u.conversationCount,
                    u.plan === "free" ? `${u.weeklyUsage}/${FREE_LIMIT}` : "Unlimited",
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

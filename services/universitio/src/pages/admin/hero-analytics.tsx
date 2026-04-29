import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { apiFetch } from "@/lib/api";
import { BarChart2, MessageCircle, MousePointerClick, AlertTriangle, TrendingUp, Clock, Tag, UserCheck } from "lucide-react";

interface TopTheme {
  theme: string;
  count: number;
}

interface HeroAnalyticsData {
  totalAllTime: number;
  totalThisWeek: number;
  uniqueVisitorsThisWeek: number;
  answeredThisWeek: number;
  rateLimitedThisWeek: number;
  ctrClicksThisWeek: number;
  ctrRate: number | null;
  needsReviewThisWeek: number;
  topThemes: TopTheme[];
  recentQuestions: {
    id: number;
    question: string | null;
    outcome: string;
    needsHumanReview: boolean | null;
    createdAt: string;
  }[];
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const OUTCOME_CONFIG: Record<string, { label: string; color: string }> = {
  answered: { label: "Answered", color: "bg-emerald-100 text-emerald-700" },
  rate_limited: { label: "Rate Limited", color: "bg-amber-100 text-amber-700" },
  error: { label: "Error", color: "bg-red-100 text-red-700" },
};

export default function HeroAnalyticsPage() {
  const [data, setData] = useState<HeroAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<HeroAnalyticsData>("/admin/hero-analytics")
      .then(setData)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  const statCards = data
    ? [
        {
          label: "Questions This Week",
          value: data.totalThisWeek,
          sub: `${data.totalAllTime} all time`,
          icon: MessageCircle,
          color: "text-violet-600",
          bg: "bg-violet-50",
        },
        {
          label: "Unique Visitors",
          value: data.uniqueVisitorsThisWeek,
          sub: "Distinct IPs this week",
          icon: UserCheck,
          color: "text-indigo-600",
          bg: "bg-indigo-50",
        },
        {
          label: "Answered This Week",
          value: data.answeredThisWeek,
          sub: `${data.rateLimitedThisWeek} rate-limited`,
          icon: TrendingUp,
          color: "text-emerald-600",
          bg: "bg-emerald-50",
        },
        {
          label: "Hero → AskiMate Clicks",
          value: data.ctrClicksThisWeek,
          sub: data.ctrRate !== null ? `${data.ctrRate}% of answered` : "No data yet",
          icon: MousePointerClick,
          color: "text-blue-600",
          bg: "bg-blue-50",
        },
        {
          label: "Needs Human Review",
          value: data.needsReviewThisWeek,
          sub: "This week",
          icon: AlertTriangle,
          color: "text-amber-600",
          bg: "bg-amber-50",
        },
      ]
    : [];

  const maxThemeCount = data && data.topThemes.length > 0 ? data.topThemes[0].count : 1;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-violet-600" />
            Hero Chat Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Engagement and question data from the homepage hero chat demo.
          </p>
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-border p-5 animate-pulse h-28" />
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-sm">
            Failed to load analytics: {error}
          </div>
        )}

        {data && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {statCards.map((card) => (
                <div key={card.label} className="bg-white rounded-xl border border-border p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 ${card.bg} rounded-lg flex items-center justify-center`}>
                      <card.icon className={`w-5 h-5 ${card.color}`} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{card.value}</p>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="text-xs text-muted-foreground/70 mt-0.5">{card.sub}</p>
                </div>
              ))}
            </div>

            {data.ctrRate !== null && (
              <div className="bg-violet-50 border border-violet-200 rounded-xl px-5 py-4">
                <p className="text-sm font-medium text-violet-800">
                  Hero → AskiMate click rate this week:{" "}
                  <span className="text-xl font-bold">{data.ctrRate}%</span>
                </p>
                <p className="text-xs text-violet-600 mt-1">
                  {data.ctrClicksThisWeek} visitor{data.ctrClicksThisWeek !== 1 ? "s" : ""} clicked
                  the "Try AskiMate AI" CTA on the homepage out of {data.answeredThisWeek} answered
                  question{data.answeredThisWeek !== 1 ? "s" : ""}. Once an interactive hero chat
                  is added, this will track post-answer conversions specifically.
                </p>
              </div>
            )}

            {data.topThemes.length > 0 && (
              <div className="bg-white rounded-xl border border-border">
                <div className="px-5 py-4 border-b border-border flex items-center gap-2">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  <h2 className="font-semibold text-foreground">Top Question Themes</h2>
                  <span className="ml-auto text-xs text-muted-foreground">All time</span>
                </div>
                <div className="px-5 py-4 space-y-3">
                  {data.topThemes.map(({ theme, count }) => (
                    <div key={theme}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-foreground">{theme}</span>
                        <span className="text-xs font-medium text-muted-foreground">{count}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          className="bg-violet-500 h-2 rounded-full transition-all"
                          style={{ width: `${Math.round((count / maxThemeCount) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl border border-border">
              <div className="px-5 py-4 border-b border-border flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <h2 className="font-semibold text-foreground">Recent Questions</h2>
                <span className="ml-auto text-xs text-muted-foreground">
                  Last {data.recentQuestions.length} questions
                </span>
              </div>
              {data.recentQuestions.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-muted-foreground">
                  No questions recorded yet. Questions appear here once visitors use the hero chat.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {data.recentQuestions.map((item) => {
                    const cfg = OUTCOME_CONFIG[item.outcome] ?? { label: item.outcome, color: "bg-gray-100 text-gray-600" };
                    return (
                      <div key={item.id} className="px-5 py-3.5 flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground leading-snug">{item.question}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className={`inline-flex text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>
                              {cfg.label}
                            </span>
                            {item.needsHumanReview && (
                              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700">
                                <AlertTriangle className="w-3 h-3" />
                                Needs review
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                          {timeAgo(item.createdAt)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

import { lazy, Suspense, useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { trackPageView } from "@/lib/analytics";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AdminAuthProvider, useAdminAuth } from "@/contexts/AdminAuthContext";
import { AskiMateAuthProvider } from "@/contexts/AskiMateAuthContext";
import { CanonicalHead } from "@/components/seo/CanonicalHead";

import Home from "@/pages/Home";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Services from "@/pages/Services";
import FreeConsultation from "@/pages/free-consultation";
import AssessmentForm from "@/pages/assessment-form";

const AskiMateLanding = lazy(() => import("@/pages/askimate-landing"));
const AskiMateSignup = lazy(() => import("@/pages/askimate-signup"));
const AskiMateLogin = lazy(() => import("@/pages/askimate-login"));
const AskiMateDashboard = lazy(() => import("@/pages/askimate-dashboard"));
const AskiMateGuestChat = lazy(() => import("@/pages/askimate-guest-chat"));
const BlogPage = lazy(() => import("@/pages/blog-page"));
const BlogPostPage = lazy(() => import("@/pages/blog-post"));
const BlogCategoryPage = lazy(() => import("@/pages/blog-category"));
const Partners = lazy(() => import("@/pages/partners"));
const StudentReferral = lazy(() => import("@/pages/student-referral"));
const Careers = lazy(() => import("@/pages/careers"));
const TermsAndConditions = lazy(() => import("@/pages/terms-and-conditions"));
const PrivacyPolicy = lazy(() => import("@/pages/privacy-policy"));
const NotFound = lazy(() => import("@/pages/not-found"));

const ResetPassword = lazy(() => import("@/pages/reset-password"));

const AdminLogin = lazy(() => import("@/pages/admin/login"));
const AdminDashboard = lazy(() => import("@/pages/admin/dashboard"));
const ConsultationsPage = lazy(() => import("@/pages/admin/consultations"));
const AssessmentsPage = lazy(() => import("@/pages/admin/assessments"));
const AdminPartnersPage = lazy(() => import("@/pages/admin/admin-partners"));
const ReferralsPage = lazy(() => import("@/pages/admin/referrals"));
const MessagesPage = lazy(() => import("@/pages/admin/messages"));
const BlogImportPage = lazy(() => import("@/pages/admin/blog-import"));
const MembersPage = lazy(() => import("@/pages/admin/members"));
const ServiceRequestsPage = lazy(() => import("@/pages/admin/service-requests"));
const AskiMateUsersPage = lazy(() => import("@/pages/admin/askimate-users"));
const AskiMateMembersPage = lazy(() => import("@/pages/admin/askimate-members"));
const HeroAnalyticsPage = lazy(() => import("@/pages/admin/hero-analytics"));

const queryClient = new QueryClient();

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-6 h-6 border-2 border-[#42147d] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function DomainRedirectGuard() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const host = window.location.hostname;
    if (host === "universitio.com" || host === "localhost" || host.endsWith(".replit.dev") || host.endsWith(".repl.co") || host.endsWith(".replit.app")) return;
    const canonical = "https://universitio.com" + window.location.pathname + window.location.search + window.location.hash;
    window.location.replace(canonical);
  }, []);
  return null;
}

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
    trackPageView(location);
  }, [location]);
  return null;
}

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-6 h-6 border-2 border-[#42147d] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/admin/login" />;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <>
      <DomainRedirectGuard />
      <CanonicalHead />
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/about" component={About} />
          <Route path="/services" component={Services} />
          <Route path="/contact" component={Contact} />
          <Route path="/free-consultation" component={FreeConsultation} />
          <Route path="/assessment-form" component={AssessmentForm} />
          <Route path="/askimate" component={AskiMateLanding} />
          <Route path="/askimate-signup" component={AskiMateSignup} />
          <Route path="/askimate-login" component={AskiMateLogin} />
          <Route path="/askimate-dashboard" component={AskiMateDashboard} />
          <Route path="/askimate-try" component={AskiMateGuestChat} />
          <Route path="/blog" component={BlogPage} />
          <Route path="/blog/category/:category" component={BlogCategoryPage} />
          <Route path="/blog/:slug" component={BlogPostPage} />
          <Route path="/partners" component={Partners} />
          <Route path="/student-referral" component={StudentReferral} />
          <Route path="/careers" component={Careers} />
          <Route path="/terms-and-conditions" component={TermsAndConditions} />
          <Route path="/privacy-policy" component={PrivacyPolicy} />
          <Route path="/reset-password" component={ResetPassword} />

          <Route path="/admin/login" component={AdminLogin} />
          <Route path="/admin">
            {() => <AdminGuard><AdminDashboard /></AdminGuard>}
          </Route>
          <Route path="/admin/consultations/:id?">
            {() => <AdminGuard><ConsultationsPage /></AdminGuard>}
          </Route>
          <Route path="/admin/assessments/:id?">
            {() => <AdminGuard><AssessmentsPage /></AdminGuard>}
          </Route>
          <Route path="/admin/partners/:id?">
            {() => <AdminGuard><AdminPartnersPage /></AdminGuard>}
          </Route>
          <Route path="/admin/referrals/:id?">
            {() => <AdminGuard><ReferralsPage /></AdminGuard>}
          </Route>
          <Route path="/admin/messages/:id?">
            {() => <AdminGuard><MessagesPage /></AdminGuard>}
          </Route>
          <Route path="/admin/blog-import">
            {() => <AdminGuard><BlogImportPage /></AdminGuard>}
          </Route>
          <Route path="/admin/members">
            {() => <AdminGuard><MembersPage /></AdminGuard>}
          </Route>
          <Route path="/admin/service-requests/:id?">
            {() => <AdminGuard><ServiceRequestsPage /></AdminGuard>}
          </Route>
          <Route path="/admin/askimate-users/:id?">
            {() => <AdminGuard><AskiMateUsersPage /></AdminGuard>}
          </Route>
          <Route path="/admin/askimate-members">
            {() => <AdminGuard><AskiMateMembersPage /></AdminGuard>}
          </Route>
          <Route path="/admin/hero-analytics">
            {() => <AdminGuard><HeroAnalyticsPage /></AdminGuard>}
          </Route>
          <Route path="/admin/:rest*">
            {() => <AdminGuard><Redirect to="/admin" /></AdminGuard>}
          </Route>

          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AdminAuthProvider>
          <AskiMateAuthProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </AskiMateAuthProvider>
        </AdminAuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

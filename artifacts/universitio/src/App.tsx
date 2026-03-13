import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AdminAuthProvider, useAdminAuth } from "@/contexts/AdminAuthContext";

import Home from "@/pages/Home";
import FreeConsultation from "@/pages/free-consultation";
import AssessmentForm from "@/pages/assessment-form";
import BlogPage from "@/pages/blog-page";
import BlogPostPage from "@/pages/blog-post";
import BlogCategoryPage from "@/pages/blog-category";
import Partners from "@/pages/partners";
import StudentReferral from "@/pages/student-referral";
import Careers from "@/pages/careers";
import NotFound from "@/pages/not-found";

import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import ConsultationsPage from "@/pages/admin/consultations";
import AssessmentsPage from "@/pages/admin/assessments";
import AdminPartnersPage from "@/pages/admin/admin-partners";
import ReferralsPage from "@/pages/admin/referrals";
import BlogImportPage from "@/pages/admin/blog-import";

const queryClient = new QueryClient();

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
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
      <ScrollToTop />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/free-consultation" component={FreeConsultation} />
        <Route path="/assessment-form" component={AssessmentForm} />
        <Route path="/blog" component={BlogPage} />
        <Route path="/blog/category/:category" component={BlogCategoryPage} />
        <Route path="/blog/:slug" component={BlogPostPage} />
        <Route path="/partners" component={Partners} />
        <Route path="/student-referral" component={StudentReferral} />
        <Route path="/careers" component={Careers} />

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
        <Route path="/admin/blog-import">
          {() => <AdminGuard><BlogImportPage /></AdminGuard>}
        </Route>
        <Route path="/admin/:rest*">
          {() => <AdminGuard><Redirect to="/admin" /></AdminGuard>}
        </Route>

        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AdminAuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </AdminAuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

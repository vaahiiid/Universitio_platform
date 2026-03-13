import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

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
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

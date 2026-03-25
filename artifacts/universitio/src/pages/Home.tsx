import { useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { TrustIndicators } from "@/components/home/TrustIndicators";
import { TrustStrip } from "@/components/home/TrustStrip";
import { ServicesGrid } from "@/components/home/ServicesGrid";
import { WhyChoosePreview } from "@/components/home/WhyChoosePreview";
import { AssessmentCTA } from "@/components/home/AssessmentCTA";
import { GlobalReach } from "@/components/home/GlobalReach";
import { StudyDestinations } from "@/components/home/StudyDestinations";
import { Partnerships } from "@/components/home/Partnerships";
import { SocialProof } from "@/components/home/SocialProof";

export default function Home() {
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const id = hash.replace("#", "");
      const timer = setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* 1 — Hero: primary CTA for ready users */}
        <Hero />
        {/* 2 — Accreditation strip + Stats + University marquee */}
        <TrustIndicators />
        {/* 3 — Compact Trust & About */}
        <TrustStrip />
        {/* 4 — Services */}
        <ServicesGrid />
        {/* 5 — Why Choose Preview */}
        <WhyChoosePreview />
        {/* 6 — Assessment CTA: capture undecided users after they understand the service */}
        <AssessmentCTA />
        {/* 7 — Global Reach + Countries */}
        <GlobalReach />
        {/* 8 — Study Destinations */}
        <StudyDestinations />
        {/* 9 — Partner & Student Referral */}
        <Partnerships />
        {/* 10 — Testimonials, Blog, Contact */}
        <SocialProof />
      </main>
      <Footer />
    </div>
  );
}

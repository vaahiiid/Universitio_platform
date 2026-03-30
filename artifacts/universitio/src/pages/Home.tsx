import { useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { TrustIndicators } from "@/components/home/TrustIndicators";
import { TrustStrip } from "@/components/home/TrustStrip";
import { ServicesPreview } from "@/components/home/ServicesPreview";
import { WhyChoosePreview } from "@/components/home/WhyChoosePreview";
import { AskiMatePreview } from "@/components/home/AskiMatePreview";
import { AssessmentCTA } from "@/components/home/AssessmentCTA";
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
        {/* 4 — Services Preview */}
        <ServicesPreview />
        {/* 4.5 — AskiMate Preview */}
        <AskiMatePreview />
        {/* 5 — Why Choose Preview */}
        <WhyChoosePreview />
        {/* 6 — Assessment CTA: capture undecided users after they understand the service */}
        <AssessmentCTA />
        {/* 7 — Study Destinations (merged with Global Reach) */}
        <StudyDestinations />
        {/* 8 — Partner & Student Referral */}
        <Partnerships />
        {/* 10 — Testimonials, Blog, Contact */}
        <SocialProof />
      </main>
      <Footer />
    </div>
  );
}

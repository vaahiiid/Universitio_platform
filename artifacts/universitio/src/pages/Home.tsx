import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { TrustIndicators } from "@/components/home/TrustIndicators";
import { AboutAndServices } from "@/components/home/AboutAndServices";
import { AssessmentCTA } from "@/components/home/AssessmentCTA";
import { GlobalReach } from "@/components/home/GlobalReach";
import { StudyDestinations } from "@/components/home/StudyDestinations";
import { Partnerships } from "@/components/home/Partnerships";
import { SocialProof } from "@/components/home/SocialProof";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* 1 — Hero: primary CTA for ready users */}
        <Hero />
        {/* 2 — Accreditation strip + Stats + University marquee */}
        <TrustIndicators />
        {/* 3 — About, Services, Special Pathways */}
        <AboutAndServices />
        {/* 4 — Assessment CTA: capture undecided users after they understand the service */}
        <AssessmentCTA />
        {/* 5 — Why Choose Us + Countries */}
        <GlobalReach />
        {/* 6 — Study Destinations */}
        <StudyDestinations />
        {/* 7 — Partner & Student Referral */}
        <Partnerships />
        {/* 8 — Testimonials, Blog, Contact */}
        <SocialProof />
      </main>
      <Footer />
    </div>
  );
}

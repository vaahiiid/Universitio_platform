import { useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { TrustIndicators } from "@/components/home/TrustIndicators";
import { TrustStrip } from "@/components/home/TrustStrip";
import { ServicesPreview } from "@/components/home/ServicesPreview";
import { WhyChoosePreview } from "@/components/home/WhyChoosePreview";
import { AskiMatePreview } from "@/components/home/AskiMatePreview";
import { ConsultationCTA } from "@/components/home/ConsultationCTA";
import { AIMotionSection } from "@/components/home/AIMotionSection";
import { AssessmentCTA } from "@/components/home/AssessmentCTA";
import { StudyDestinations } from "@/components/home/StudyDestinations";
import { Partnerships } from "@/components/home/Partnerships";
import { SocialProof } from "@/components/home/SocialProof";
import { FinalCTA } from "@/components/home/FinalCTA";
import { Helmet } from "react-helmet-async";

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
      <Helmet>
        <title>AskiMate AI — Smart Study Abroad Assistant | Universitio</title>
        <meta
          name="description"
          content="Meet AskiMate AI — ask study abroad questions, check your admission chances, compare countries and courses, and get personalised guidance powered by AI and supported by real experts."
        />
        <link rel="canonical" href="https://universitio.com/" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://universitio.com/#organization",
              "name": "Universitio",
              "url": "https://universitio.com",
              "logo": {
                "@type": "ImageObject",
                "url": "https://universitio.com/logo.png"
              },
              "sameAs": [
                "https://www.instagram.com/universitio_",
                "https://www.facebook.com/universitioco",
                "https://www.linkedin.com/company/universitio"
              ]
            },
            {
              "@type": "WebSite",
              "@id": "https://universitio.com/#website",
              "name": "Universitio",
              "url": "https://universitio.com"
            }
          ]
        })}</script>
      </Helmet>
      <Navbar />
      <main>
        {/* 1 — AI-focused hero */}
        <Hero />
        {/* 2 — Accreditation strip + Stats + University marquee */}
        <TrustIndicators />
        {/* 3 — AskiMate feature cards: "What AskiMate AI Actually Does" */}
        <AskiMatePreview />
        {/* 4 — Free Consultation: "Need Expert Help?" */}
        <ConsultationCTA />
        {/* 5 — AI decision-graph animation + stats */}
        <AIMotionSection />
        {/* 6 — AI-first trust & positioning strip */}
        <TrustStrip />
        {/* 7 — Other Services by Universitio */}
        <ServicesPreview />
        {/* 8 — Why Choose */}
        <WhyChoosePreview />
        {/* 9 — Partner + Student Referral (two-column, single section) */}
        <Partnerships />
        {/* 10 — Assessment CTA */}
        <AssessmentCTA />
        {/* 11 — Study Destinations */}
        <StudyDestinations />
        {/* 12 — Testimonials, Blog, Contact */}
        <SocialProof />
        {/* 13 — Final CTA: Start with AI. Finish with expert support. */}
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}

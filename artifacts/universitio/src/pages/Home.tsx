import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { TrustIndicators } from "@/components/home/TrustIndicators";
import { AboutAndServices } from "@/components/home/AboutAndServices";
import { GlobalReach } from "@/components/home/GlobalReach";
import { Partnerships } from "@/components/home/Partnerships";
import { SocialProof } from "@/components/home/SocialProof";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <TrustIndicators />
        <AboutAndServices />
        <GlobalReach />
        <Partnerships />
        <SocialProof />
      </main>
      <Footer />
    </div>
  );
}

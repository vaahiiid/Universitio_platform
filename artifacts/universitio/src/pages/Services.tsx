import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ServicesGrid } from "@/components/home/ServicesGrid";

export default function Services() {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Our Services — Comprehensive Education Support</title>
        <meta name="description" content="Explore our full range of education services including university applications, IELTS preparation, interview coaching, accommodation assistance, and more." />
        <link rel="canonical" href="https://universitio.com/services" />
      </Helmet>
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="py-20 md:py-28 bg-gradient-to-br from-primary/8 via-background to-background border-b border-border/40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-block bg-accent text-accent-foreground px-4 py-1.5 rounded-full text-xs font-semibold mb-6">
              COMPREHENSIVE SUPPORT
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Our Services
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Complete guidance at every stage of your educational journey — from application planning to arrival in your chosen country.
            </p>
          </div>
        </section>

        {/* Services Section */}
        <div className="py-6 md:py-8">
          <ServicesGrid />
        </div>

        {/* CTA Section */}
        <section className="py-16 md:py-20 bg-gradient-to-r from-primary/10 to-primary/5 border-t border-border/40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Choose any service above and submit a request. Our team will review your information and get in touch to discuss your needs.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

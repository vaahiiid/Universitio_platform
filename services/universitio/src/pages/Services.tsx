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
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              "@id": "https://universitio.com/services",
              "name": "Our Services — Comprehensive Education Support",
              "description": "Explore our full range of education services including university applications, IELTS preparation, interview coaching, accommodation assistance, and more.",
              "url": "https://universitio.com/services",
              "isPartOf": {
                "@type": "WebSite",
                "@id": "https://universitio.com/#website",
                "name": "Universitio",
                "url": "https://universitio.com"
              }
            },
            {
              "@type": "ItemList",
              "@id": "https://universitio.com/services#list",
              "name": "Universitio Education Services",
              "description": "Comprehensive education support services for international students studying abroad.",
              "url": "https://universitio.com/services",
              "numberOfItems": 6,
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "item": {
                    "@type": "Service",
                    "name": "Study Admissions",
                    "description": "Expert guidance through the entire university application process, from course selection to offer acceptance.",
                    "provider": { "@type": "Organization", "name": "Universitio", "url": "https://universitio.com" },
                    "serviceType": "Education Admissions Consulting",
                    "url": "https://universitio.com/services"
                  }
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "item": {
                    "@type": "Service",
                    "name": "IELTS Preparation",
                    "description": "Structured IELTS preparation coaching to help students achieve their required English language scores.",
                    "provider": { "@type": "Organization", "name": "Universitio", "url": "https://universitio.com" },
                    "serviceType": "English Language Test Preparation",
                    "url": "https://universitio.com/services"
                  }
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "item": {
                    "@type": "Service",
                    "name": "Interview Preparation",
                    "description": "Personalised interview coaching to help students confidently face university and visa interviews.",
                    "provider": { "@type": "Organization", "name": "Universitio", "url": "https://universitio.com" },
                    "serviceType": "Interview Coaching",
                    "url": "https://universitio.com/services"
                  }
                },
                {
                  "@type": "ListItem",
                  "position": 4,
                  "item": {
                    "@type": "Service",
                    "name": "SOP & CV Guidance",
                    "description": "Professional support writing Statements of Purpose, personal statements, and CVs for university applications.",
                    "provider": { "@type": "Organization", "name": "Universitio", "url": "https://universitio.com" },
                    "serviceType": "Application Document Preparation",
                    "url": "https://universitio.com/services"
                  }
                },
                {
                  "@type": "ListItem",
                  "position": 5,
                  "item": {
                    "@type": "Service",
                    "name": "Student Accommodation",
                    "description": "Assistance finding and reserving accommodation in the UK for international students.",
                    "provider": { "@type": "Organization", "name": "Universitio", "url": "https://universitio.com" },
                    "serviceType": "Student Accommodation Assistance",
                    "areaServed": "United Kingdom",
                    "url": "https://universitio.com/services"
                  }
                },
                {
                  "@type": "ListItem",
                  "position": 6,
                  "item": {
                    "@type": "Service",
                    "name": "Airport Transfer",
                    "description": "Airport pickup service from UK airports to the student's city of residence.",
                    "provider": { "@type": "Organization", "name": "Universitio", "url": "https://universitio.com" },
                    "serviceType": "Airport Transfer",
                    "areaServed": "United Kingdom",
                    "url": "https://universitio.com/services"
                  }
                }
              ]
            }
          ]
        })}</script>
      </Helmet>
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="py-20 md:py-28 bg-gradient-to-br from-primary/8 via-background to-background border-b border-border/40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-block bg-accent text-accent-foreground px-4 py-1.5 rounded-full text-xs font-semibold mb-6">
              EXPERT GUIDANCE
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Your Complete Partner in Global Education
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Strategic support across every stage—from application strategy to day-one arrival. We remove the complexity, so you can focus on success.
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

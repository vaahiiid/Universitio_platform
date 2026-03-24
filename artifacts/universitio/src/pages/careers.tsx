import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Briefcase, ArrowRight } from "lucide-react";

export default function Careers() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Helmet>
        <title>Careers in Education Consulting | Universitio</title>
        <meta name="description" content="Explore career opportunities at Universitio. Join our team of education consultants helping international students reach top universities worldwide." />
      </Helmet>
      <Navbar />
      <main className="flex-grow pt-28 pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
            <Briefcase className="w-4 h-4" />
            Careers at Universitio
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Careers in International Education & Student Recruitment
          </h1>

          <div className="bg-white rounded-3xl border border-border shadow-sm p-10 md:p-14 mb-12">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <Briefcase className="w-8 h-8 text-primary" />
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">
              No Current Vacancies
            </h2>

            <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto mb-6">
              Thank you for your interest in joining Universitio. We do not have
              any open positions at the moment, but we are always keen to hear
              from talented individuals who share our passion for helping
              international students succeed.
            </p>

            <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto mb-8">
              If you would like to be considered for future opportunities,
              please send your CV and a brief cover letter to{" "}
              <a
                href="mailto:info@universitio.com"
                className="text-primary font-semibold hover:underline"
              >
                info@universitio.com
              </a>
              . We will keep your details on file and get in touch should a
              suitable role arise.
            </p>

            <div className="border-t border-border pt-8 mt-8">
              <p className="text-sm text-muted-foreground mb-6">
                In the meantime, discover what we do and how we support students
                worldwide.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/#about">
                  <Button
                    variant="outline"
                    className="rounded-full px-8 border-primary/30 text-primary"
                  >
                    About Universitio
                  </Button>
                </Link>
                <Link href="/free-consultation">
                  <Button className="rounded-full px-8 bg-primary hover:bg-primary/90 text-white shadow-md">
                    Book a Free Consultation{" "}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

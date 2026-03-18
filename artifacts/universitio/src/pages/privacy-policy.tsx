import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Privacy Policy | Universitio</title>
        <meta name="description" content="Universitio's Privacy Policy explains how we collect, use, and protect your personal data in accordance with UK GDPR." />
        <link rel="canonical" href="https://universitio.com/privacy-policy" />
      </Helmet>
      <main className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: March 2026 &mdash; Universitio Ltd (Company No. 15168670)</p>

        {/* Table of Contents */}
        <nav className="bg-muted/30 rounded-lg p-6 mb-8 border border-border">
          <h2 className="font-semibold text-foreground mb-4">Table of Contents</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li><a href="#who-we-are" className="text-primary underline hover:text-primary/80">Who We Are</a></li>
            <li><a href="#data-we-collect" className="text-primary underline hover:text-primary/80">Data We Collect</a></li>
            <li><a href="#how-we-collect-data" className="text-primary underline hover:text-primary/80">How We Collect Data</a></li>
            <li><a href="#how-we-use-data" className="text-primary underline hover:text-primary/80">How We Use Data</a></li>
            <li><a href="#legal-basis" className="text-primary underline hover:text-primary/80">Legal Basis</a></li>
            <li><a href="#marketing" className="text-primary underline hover:text-primary/80">Marketing</a></li>
            <li><a href="#data-sharing" className="text-primary underline hover:text-primary/80">Data Sharing</a></li>
            <li><a href="#international-transfers" className="text-primary underline hover:text-primary/80">International Transfers</a></li>
            <li><a href="#data-security" className="text-primary underline hover:text-primary/80">Data Security</a></li>
            <li><a href="#data-retention" className="text-primary underline hover:text-primary/80">Data Retention</a></li>
            <li><a href="#your-rights" className="text-primary underline hover:text-primary/80">Your Rights</a></li>
            <li><a href="#complaints" className="text-primary underline hover:text-primary/80">Complaints</a></li>
            <li><a href="#cookies" className="text-primary underline hover:text-primary/80">Cookies</a></li>
            <li><a href="#third-party-links" className="text-primary underline hover:text-primary/80">Third-Party Links</a></li>
            <li><a href="#changes" className="text-primary underline hover:text-primary/80">Changes</a></li>
            <li><a href="#contact" className="text-primary underline hover:text-primary/80">Contact</a></li>
          </ol>
        </nav>

        <div className="prose prose-sm max-w-none space-y-6 text-foreground">

          <section id="who-we-are">
            <h2 className="text-xl font-semibold mb-3">1. Who We Are</h2>
            <p>Universitio Ltd is the data controller of your personal data.</p>
          </section>

          <section id="data-we-collect">
            <h2 className="text-xl font-semibold mb-3">2. Data We Collect</h2>
            <p>We may collect:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Identity data (name, DOB, nationality)</li>
              <li>Contact data (email, phone)</li>
              <li>Education data (qualifications, preferences)</li>
              <li>Documents (CV, SOP, transcripts)</li>
              <li>Communication data</li>
              <li>Technical data (IP, browser, usage)</li>
              <li>Marketing preferences</li>
            </ul>
          </section>

          <section id="how-we-collect-data">
            <h2 className="text-xl font-semibold mb-3">3. How We Collect Data</h2>
            <p>We collect data when you:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>fill in forms</li>
              <li>contact us</li>
              <li>use our services</li>
              <li>upload documents</li>
            </ul>
            <p className="mt-2">We may also collect technical data automatically and limited data from partners or public sources.</p>
          </section>

          <section id="how-we-use-data">
            <h2 className="text-xl font-semibold mb-3">4. How We Use Data</h2>
            <p>We use your data to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>respond to enquiries</li>
              <li>provide consultancy services</li>
              <li>assess eligibility</li>
              <li>support applications</li>
              <li>communicate with you</li>
              <li>send relevant opportunities and updates</li>
              <li>improve services</li>
              <li>comply with legal obligations</li>
            </ul>
          </section>

          <section id="legal-basis">
            <h2 className="text-xl font-semibold mb-3">5. Legal Basis</h2>
            <p>We rely on:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Contract</li>
              <li>Legitimate interests</li>
              <li>Consent (for marketing where applicable)</li>
              <li>Legal obligations</li>
            </ul>
          </section>

          <section id="marketing">
            <h2 className="text-xl font-semibold mb-3">6. Marketing</h2>
            <p>We may send relevant communications unless you opt out.</p>
            <p>You can unsubscribe at any time.</p>
            <p>We do not sell your data.</p>
          </section>

          <section id="data-sharing">
            <h2 className="text-xl font-semibold mb-3">7. Data Sharing</h2>
            <p>We may share data with:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>universities and institutions</li>
              <li>service providers (hosting, email, systems)</li>
              <li>legal authorities (if required)</li>
            </ul>
            <p className="mt-2">We do not allow third parties to use your data for their own marketing.</p>
          </section>

          <section id="international-transfers">
            <h2 className="text-xl font-semibold mb-3">8. International Transfers</h2>
            <p>Data may be transferred outside the UK with appropriate safeguards.</p>
          </section>

          <section id="data-security">
            <h2 className="text-xl font-semibold mb-3">9. Data Security</h2>
            <p>We use appropriate security measures to protect your data.</p>
          </section>

          <section id="data-retention">
            <h2 className="text-xl font-semibold mb-3">10. Data Retention</h2>
            <p>We retain data for up to three (3) years after your last interaction, or longer if legally required.</p>
          </section>

          <section id="your-rights">
            <h2 className="text-xl font-semibold mb-3">11. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>access your data</li>
              <li>correct it</li>
              <li>request deletion</li>
              <li>object to processing</li>
              <li>withdraw consent</li>
              <li>complain to the ICO</li>
            </ul>
            <p className="mt-2">Contact: <a href="mailto:info@universitio.co.uk" className="text-primary underline hover:text-primary/80">info@universitio.co.uk</a></p>
            <p>Response time: up to 30 days</p>
          </section>

          <section id="complaints">
            <h2 className="text-xl font-semibold mb-3">12. Complaints</h2>
            <p>You may contact us first or complain to the ICO (<a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">ico.org.uk</a>).</p>
          </section>

          <section id="cookies">
            <h2 className="text-xl font-semibold mb-3">13. Cookies</h2>
            <p>We use essential cookies only.</p>
            <p>See our Cookie Policy for details.</p>
          </section>

          <section id="third-party-links">
            <h2 className="text-xl font-semibold mb-3">14. Third-Party Links</h2>
            <p>We are not responsible for external websites.</p>
          </section>

          <section id="changes">
            <h2 className="text-xl font-semibold mb-3">15. Changes</h2>
            <p>We may update this policy. Please review periodically.</p>
          </section>

          <section id="contact">
            <h2 className="text-xl font-semibold mb-3">16. Contact</h2>
            <p>Email: <a href="mailto:info@universitio.co.uk" className="text-primary underline hover:text-primary/80">info@universitio.co.uk</a></p>
            <p>Phone: <a href="tel:+447963345465" className="text-primary underline hover:text-primary/80">+44 7963 345465</a></p>
            <p>Address: Birmingham, UK</p>
          </section>

        </div>
      </main>
    </div>
  );
}

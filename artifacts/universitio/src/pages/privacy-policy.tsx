import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: March 2025 &mdash; Universitio Ltd (Company No. 15168670)</p>

        <div className="prose prose-sm max-w-none space-y-6 text-foreground">

          <section>
            <h2 className="text-xl font-semibold mb-3">1. Who We Are</h2>
            <p>Universitio Ltd (&ldquo;Universitio&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is the data controller for the personal data you submit through this website. We are registered in England and Wales (Company No. 15168670).</p>
            <p className="mt-2">Contact details: <a href="mailto:info@universitio.co.uk" className="text-primary underline">info@universitio.co.uk</a> &middot; +44 7963 345465 &middot; 44 Birmingham Road, Birmingham, B72 1QQ.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. What Data We Collect</h2>
            <p>Depending on the service you enquire about, we may collect the following personal data:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Identity data:</strong> full name, date of birth, nationality</li>
              <li><strong>Contact data:</strong> email address, phone number</li>
              <li><strong>Educational data:</strong> previous qualifications, field of study, English language level</li>
              <li><strong>Preference data:</strong> preferred study destinations, universities of interest, budget</li>
              <li><strong>Documents:</strong> CV or personal statement if voluntarily uploaded</li>
              <li><strong>Communication data:</strong> messages and enquiries you send to us</li>
              <li><strong>Consent records:</strong> your marketing preferences and the date you accepted our terms</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. How We Use Your Data</h2>
            <p>We use your personal data to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Respond to your enquiries and provide education consultancy services</li>
              <li>Assess your eligibility and prepare university applications on your behalf</li>
              <li>Send you information about programmes, scholarships, and events relevant to your interests (where you have not opted out)</li>
              <li>Improve our services and website through aggregated, anonymised analysis</li>
              <li>Comply with our legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Legal Basis for Processing</h2>
            <p>We rely on the following legal bases under UK GDPR:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Contract:</strong> processing necessary to provide the service you have requested</li>
              <li><strong>Legitimate interests:</strong> improving our services and communicating relevant updates</li>
              <li><strong>Consent:</strong> sending marketing communications (you may withdraw consent at any time)</li>
              <li><strong>Legal obligation:</strong> retaining records as required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. How We Share Your Data</h2>
            <p>We do not sell your personal data. We may share your data with:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Universities and partner institutions</strong> — solely to process your application, with your knowledge</li>
              <li><strong>Technology service providers</strong> — hosting, database, and email services operating under data processing agreements</li>
              <li><strong>Legal or regulatory authorities</strong> — where required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. International Transfers</h2>
            <p>Some of the universities and partner institutions we work with are located outside the UK and EEA. Where we transfer your data internationally, we ensure appropriate safeguards are in place in accordance with UK GDPR.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Data Retention</h2>
            <p>We retain your personal data for as long as necessary to provide our services and comply with our legal obligations. Enquiry records are typically retained for 3 years. You may request deletion of your data at any time (subject to legal retention requirements).</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Your Rights</h2>
            <p>Under UK GDPR, you have the right to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Access the personal data we hold about you</li>
              <li>Correct inaccurate data</li>
              <li>Request erasure of your data</li>
              <li>Object to or restrict our processing</li>
              <li>Data portability</li>
              <li>Withdraw consent (for marketing) at any time</li>
              <li>Lodge a complaint with the Information Commissioner&apos;s Office (ICO) at <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-primary underline">ico.org.uk</a></li>
            </ul>
            <p className="mt-2">To exercise any of these rights, please email <a href="mailto:info@universitio.co.uk" className="text-primary underline">info@universitio.co.uk</a>. We will respond within 30 days.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Cookies</h2>
            <p>This website uses essential cookies only. We do not currently use tracking or advertising cookies. Our website analytics, if used, are configured to anonymise IP addresses.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. Material changes will be communicated on this page. We encourage you to review this policy periodically.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Contact Us</h2>
            <p>For any privacy-related questions or to exercise your rights:</p>
            <ul className="mt-2 space-y-1">
              <li>Email: <a href="mailto:info@universitio.co.uk" className="text-primary underline">info@universitio.co.uk</a></li>
              <li>Phone: <a href="tel:+447963345465" className="text-primary underline">+44 7963 345465</a></li>
              <li>Post: 44 Birmingham Road, Birmingham, B72 1QQ, United Kingdom</li>
            </ul>
          </section>

        </div>
      </div>
    </div>
  );
}

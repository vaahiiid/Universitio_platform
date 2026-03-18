import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Terms and Conditions | Universitio</title>
        <meta name="description" content="Terms and Conditions for Universitio Ltd (Co. No. 15168670), a UK-registered education consultancy." />
        <link rel="canonical" href="https://universitio.com/terms-and-conditions" />
      </Helmet>
      <main className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <h1 className="text-3xl font-bold text-foreground mb-2">Terms and Conditions</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: March 2026 &mdash; Universitio Ltd (Company No. 15168670)</p>

        {/* Table of Contents */}
        <nav className="bg-muted/30 rounded-lg p-6 mb-8 border border-border">
          <h2 className="font-semibold text-foreground mb-4">Table of Contents</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li><a href="#about-us" className="text-primary underline hover:text-primary/80">About Us</a></li>
            <li><a href="#acceptance-of-terms" className="text-primary underline hover:text-primary/80">Acceptance of Terms</a></li>
            <li><a href="#our-services" className="text-primary underline hover:text-primary/80">Our Services</a></li>
            <li><a href="#user-responsibilities" className="text-primary underline hover:text-primary/80">User Responsibilities</a></li>
            <li><a href="#no-guarantee-of-outcome" className="text-primary underline hover:text-primary/80">No Guarantee of Outcome</a></li>
            <li><a href="#fees-and-refund-policy" className="text-primary underline hover:text-primary/80">Fees and Refund Policy</a></li>
            <li><a href="#data-use-and-marketing" className="text-primary underline hover:text-primary/80">Data Use and Marketing</a></li>
            <li><a href="#data-retention" className="text-primary underline hover:text-primary/80">Data Retention</a></li>
            <li><a href="#website-use" className="text-primary underline hover:text-primary/80">Website Use</a></li>
            <li><a href="#intellectual-property" className="text-primary underline hover:text-primary/80">Intellectual Property</a></li>
            <li><a href="#third-party-links" className="text-primary underline hover:text-primary/80">Third-Party Links</a></li>
            <li><a href="#service-availability" className="text-primary underline hover:text-primary/80">Service Availability</a></li>
            <li><a href="#events-outside-our-control" className="text-primary underline hover:text-primary/80">Events Outside Our Control</a></li>
            <li><a href="#complaints" className="text-primary underline hover:text-primary/80">Complaints</a></li>
            <li><a href="#limitation-of-liability" className="text-primary underline hover:text-primary/80">Limitation of Liability</a></li>
            <li><a href="#changes-to-terms" className="text-primary underline hover:text-primary/80">Changes to Terms</a></li>
            <li><a href="#governing-law" className="text-primary underline hover:text-primary/80">Governing Law</a></li>
            <li><a href="#contact" className="text-primary underline hover:text-primary/80">Contact</a></li>
          </ol>
        </nav>

        <div className="prose prose-sm max-w-none space-y-6 text-foreground">

          <section id="about-us">
            <h2 className="text-xl font-semibold mb-3">1. About Us</h2>
            <p>Universitio Ltd (&ldquo;Universitio&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is a UK-registered education consultancy company (Company No. 15168670), with its registered office at:</p>
            <p className="ml-4">44 Birmingham Road, Birmingham, B72 1QQ, United Kingdom</p>
          </section>

          <section id="acceptance-of-terms">
            <h2 className="text-xl font-semibold mb-3">2. Acceptance of Terms</h2>
            <p>By accessing our website, submitting any form, or using our services, you confirm that you accept these Terms and Conditions and agree to comply with them.</p>
            <p>If you do not agree, you must not use our services.</p>
          </section>

          <section id="our-services">
            <h2 className="text-xl font-semibold mb-3">3. Our Services</h2>
            <p>We provide education consultancy and student support services, including:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Free assessments and consultations</li>
              <li>University and course selection guidance</li>
              <li>Application support</li>
              <li>Scholarship and funding guidance</li>
              <li>English language preparation advice</li>
              <li>Interview preparation</li>
              <li>Referral programmes</li>
              <li>General student support</li>
            </ul>
            <p className="mt-2">We do not provide immigration, visa, or legal advice.</p>
          </section>

          <section id="user-responsibilities">
            <h2 className="text-xl font-semibold mb-3">4. User Responsibilities</h2>
            <p>You agree to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Provide accurate, complete, and up-to-date information</li>
              <li>Submit genuine and verifiable documents</li>
              <li>Respond promptly when requested</li>
            </ul>
            <p className="mt-2">We are not responsible for outcomes resulting from incorrect or misleading information.</p>
          </section>

          <section id="no-guarantee-of-outcome">
            <h2 className="text-xl font-semibold mb-3">5. No Guarantee of Outcome</h2>
            <p>We do not guarantee:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>admission to any institution</li>
              <li>scholarship or funding</li>
              <li>visa approval</li>
              <li>accommodation</li>
              <li>timelines</li>
            </ul>
            <p className="mt-2">All final decisions are made by third parties.</p>
          </section>

          <section id="fees-and-refund-policy">
            <h2 className="text-xl font-semibold mb-3">6. Fees and Refund Policy</h2>
            
            <h3 className="text-lg font-semibold mt-4 mb-2">6.1 Free Services</h3>
            <p>Free services are not subject to refunds.</p>
            
            <h3 className="text-lg font-semibold mt-4 mb-2">6.2 Paid Services</h3>
            <p>All paid services are non-refundable, unless we are unable to deliver the service at all.</p>
            <p>No refund applies if:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>the service has started or been delivered</li>
              <li>you change your mind</li>
              <li>you fail to provide required information</li>
              <li>your application is unsuccessful</li>
              <li>third parties reject or delay outcomes</li>
            </ul>
            <p className="mt-2">Approved refunds are limited to the undelivered portion only.</p>
          </section>

          <section id="data-use-and-marketing">
            <h2 className="text-xl font-semibold mb-3">7. Data Use and Marketing</h2>
            <p>By submitting forms or using our services, your data may be stored and used for:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>service delivery and communication</li>
              <li>follow-ups and support</li>
              <li>relevant marketing communications</li>
            </ul>
            <p className="mt-2">We do not sell your personal data.</p>
            <p>You may unsubscribe at any time via email or direct request.</p>
          </section>

          <section id="data-retention">
            <h2 className="text-xl font-semibold mb-3">8. Data Retention</h2>
            <p>We may retain your data for up to one (1) year in active systems after your last interaction.</p>
            <p>Data may be retained longer where required for legal, compliance, or dispute purposes.</p>
          </section>

          <section id="website-use">
            <h2 className="text-xl font-semibold mb-3">9. Website Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>misuse the website</li>
              <li>attempt unauthorised access</li>
              <li>introduce harmful code</li>
            </ul>
            <p className="mt-2">We may suspend access if misuse occurs.</p>
          </section>

          <section id="intellectual-property">
            <h2 className="text-xl font-semibold mb-3">10. Intellectual Property</h2>
            <p>All website content is owned by Universitio Ltd.</p>
            <p>You may not use or reproduce it without permission.</p>
          </section>

          <section id="third-party-links">
            <h2 className="text-xl font-semibold mb-3">11. Third-Party Links</h2>
            <p>We are not responsible for third-party websites or services.</p>
          </section>

          <section id="service-availability">
            <h2 className="text-xl font-semibold mb-3">12. Service Availability</h2>
            <p>We do not guarantee uninterrupted or error-free access to our website or services.</p>
          </section>

          <section id="events-outside-our-control">
            <h2 className="text-xl font-semibold mb-3">13. Events Outside Our Control</h2>
            <p>We are not liable for delays or failures caused by events outside our control, including:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>natural disasters</li>
              <li>pandemics</li>
              <li>government actions</li>
              <li>system failures</li>
              <li>third-party delays</li>
            </ul>
          </section>

          <section id="complaints">
            <h2 className="text-xl font-semibold mb-3">14. Complaints</h2>
            <p>Complaints must be submitted to:</p>
            <p className="ml-4">📧 <a href="mailto:info@universitio.co.uk" className="text-primary underline hover:text-primary/80">info@universitio.co.uk</a></p>
            <p className="mt-2">We aim to respond within 28 working days.</p>
            <p>If unresolved, you may seek support from:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Citizens Advice</li>
              <li>Trading Standards</li>
              <li>ICO (for data issues)</li>
              <li>UK courts where applicable</li>
            </ul>
          </section>

          <section id="limitation-of-liability">
            <h2 className="text-xl font-semibold mb-3">15. Limitation of Liability</h2>
            <p>We are not liable for indirect or consequential losses.</p>
            <p>Our liability is limited to the amount paid for the service.</p>
          </section>

          <section id="changes-to-terms">
            <h2 className="text-xl font-semibold mb-3">16. Changes to Terms</h2>
            <p>We may update these Terms at any time.</p>
            <p>Continued use constitutes acceptance.</p>
          </section>

          <section id="governing-law">
            <h2 className="text-xl font-semibold mb-3">17. Governing Law</h2>
            <p>These Terms are governed by the laws of England and Wales.</p>
          </section>

          <section id="contact">
            <h2 className="text-xl font-semibold mb-3">18. Contact</h2>
            <p>Email: <a href="mailto:info@universitio.co.uk" className="text-primary underline hover:text-primary/80">info@universitio.co.uk</a></p>
            <p>Phone: <a href="tel:+447963345465" className="text-primary underline hover:text-primary/80">+44 7963 345465</a></p>
            <p>Address: 44 Birmingham Road, Birmingham, B72 1QQ, UK</p>
          </section>

        </div>
      </main>
    </div>
  );
}

import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <h1 className="text-3xl font-bold text-foreground mb-2">Terms and Conditions</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: March 2025 &mdash; Universitio Ltd (Company No. 15168670)</p>

        <div className="prose prose-sm max-w-none space-y-6 text-foreground">

          <section>
            <h2 className="text-xl font-semibold mb-3">1. About Us</h2>
            <p>Universitio Ltd (&ldquo;Universitio&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is a UK-registered education consultancy (Company No. 15168670) with its principal office at 44 Birmingham Road, Birmingham, B72 1QQ, United Kingdom.</p>
            <p className="mt-2">By submitting any enquiry, application or referral form on this website, or by using our services, you agree to these Terms and Conditions in full.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Our Services</h2>
            <p>Universitio provides education consultancy and student placement services, including but not limited to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Free university application assessments</li>
              <li>Free initial consultations</li>
              <li>University selection and application support</li>
              <li>Scholarship and funding guidance</li>
              <li>English language test preparation advice</li>
              <li>Partner agent and referral programmes</li>
            </ul>
            <p className="mt-2">We do not provide immigration, visa, or legal advice. For immigration matters, please consult a regulated immigration adviser registered with the Office of the Immigration Services Commissioner (OISC).</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Accuracy of Information</h2>
            <p>You agree to provide accurate, complete, and up-to-date information when completing any form on this website. Universitio accepts no liability for outcomes arising from information you have provided that is inaccurate or misleading.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. No Guarantee of Outcome</h2>
            <p>While we endeavour to secure the best possible outcome for every student, Universitio cannot guarantee admission to any university, institution, or programme. Final admission decisions rest solely with the receiving institution.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Fees</h2>
            <p>Many of our student services are provided free of charge. Where fees apply, these will be communicated to you clearly before any agreement is entered into. All fees are quoted in Pounds Sterling (GBP) and are subject to VAT where applicable.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Intellectual Property</h2>
            <p>All content on this website, including text, logos, images, and graphics, is the property of Universitio Ltd or its licensors and is protected by UK and international copyright law. You may not reproduce or distribute any content without our prior written consent.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Limitation of Liability</h2>
            <p>To the fullest extent permitted by law, Universitio shall not be liable for any indirect, incidental, or consequential loss or damage arising from your use of this website or our services. Our total liability shall not exceed the total fees paid by you for the specific service giving rise to the claim.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Data Protection</h2>
            <p>We process your personal data in accordance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018. Please read our <Link href="/privacy-policy" className="text-primary underline">Privacy Policy</Link> to understand how we collect, use, and protect your information.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Governing Law</h2>
            <p>These Terms and Conditions are governed by and construed in accordance with the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Changes to These Terms</h2>
            <p>We reserve the right to update these Terms and Conditions at any time. Material changes will be notified via our website. Continued use of our services after any change constitutes your acceptance of the revised terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Contact</h2>
            <p>If you have any questions about these Terms, please contact us:</p>
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

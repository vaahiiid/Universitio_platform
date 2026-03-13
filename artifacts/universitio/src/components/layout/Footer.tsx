import { Link } from "wouter";
import { Instagram, Facebook, Linkedin } from "lucide-react";
import { useEffect } from "react";
import logoImg from "@assets/universitio logo.png";
import { trackEvent } from "@/lib/analytics";

export function Footer() {
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (document.getElementById("icef-badge-script")) return;
    const script = document.createElement("script");
    script.id = "icef-badge-script";
    script.src = "https://www-cdn.icef.com/scripts/iasbadgeid.js";
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    document.body.appendChild(script);
  }, []);

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="pt-16 pb-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">

          {/* Brand Column */}
          <div className="lg:col-span-4">
            <img
              src={logoImg}
              alt="Universitio"
              className="h-10 w-auto object-contain mb-5"
              style={{ filter: "brightness(0) invert(1)" }}
            />
            <p className="text-primary-foreground/70 text-sm leading-relaxed mb-6 max-w-xs">
              Your global gateway to education abroad. Expert, personalised guidance for international students applying to top universities worldwide.
            </p>

            <div className="flex items-center gap-3 mb-8">
              <a href="https://www.instagram.com/universitio_" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/60 transition-all">
                <Instagram size={16} />
              </a>
              <a href="https://www.facebook.com/universitioco" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/60 transition-all">
                <Facebook size={16} />
              </a>
              <a href="https://www.linkedin.com/company/universitio" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/60 transition-all">
                <Linkedin size={16} />
              </a>
              <span aria-label="TikTok" className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/60">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
              </span>
              <span aria-label="YouTube" className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/60">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span id="iasBadge" data-account-id="6539"></span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">Quick Links</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
              <li><Link href="/#about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/#services" className="hover:text-white transition-colors">Our Services</Link></li>
              <li><Link href="/free-consultation" className="hover:text-white transition-colors">Free Consultation</Link></li>
              <li><Link href="/assessment-form" className="hover:text-white transition-colors">Free Assessment</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Work With Us */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">Work With Us</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
              <li><Link href="/partners" className="hover:text-white transition-colors">Become a Partner</Link></li>
              <li><Link href="/student-referral" className="hover:text-white transition-colors">Refer a Student</Link></li>
              <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="/#contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">Contact</h4>
            <ul className="space-y-4 text-sm text-primary-foreground/70">
              <li className="flex items-start gap-3">
                <svg className="w-4 h-4 mt-0.5 shrink-0 text-white/40" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                <a href="https://web.whatsapp.com/send?phone=447963345465" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" onClick={() => trackEvent("whatsapp_click", { event_category: "contact", event_label: "WhatsApp Button" })}>+44 7963 345465</a>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-4 h-4 mt-0.5 shrink-0 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                <a href="mailto:info@universitio.co.uk" className="hover:text-white transition-colors">info@universitio.co.uk</a>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-4 h-4 mt-0.5 shrink-0 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                <span>44 Birmingham Road, Birmingham,<br />England, B72 1QQ</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 py-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-primary-foreground/50">
          <div className="text-center md:text-left">
            <p>&copy; {currentYear} Universitio Ltd. All rights reserved.</p>
            <p className="mt-1">Registered in England and Wales &middot; Company No. 15168670 &middot; ICEF Accredited &middot; British Council Agent &middot; ICO Registered</p>
          </div>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms &amp; Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { Link } from "wouter";
import { Facebook, Instagram, Linkedin } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          <div className="col-span-1 lg:col-span-1">
            <span className="font-display font-bold text-2xl tracking-tight text-white mb-4 block">
              Universitio
            </span>
            <p className="text-primary-foreground/70 mb-6 text-sm leading-relaxed">
              Your global gateway to education abroad. Expert guidance for international students applying to top universities worldwide.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-primary-foreground/60 hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-primary-foreground/60 hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-primary-foreground/60 hover:text-white transition-colors">
                <Linkedin size={20} />
              </a>
              {/* TikTok placeholder icon using a generic icon or text since Lucide doesn't have official TikTok */}
              <a href="#" className="text-primary-foreground/60 hover:text-white transition-colors font-bold text-sm flex items-center">
                TikTok
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/80">
              <li><Link href="/#about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/#services" className="hover:text-white transition-colors">Our Services</Link></li>
              <li><Link href="/free-consultation" className="hover:text-white transition-colors">Free Consultation</Link></li>
              <li><Link href="/assessment-form" className="hover:text-white transition-colors">Assessment Form</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Partnerships</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/80">
              <li><Link href="/#agents" className="hover:text-white transition-colors">Become an Agent</Link></li>
              <li><Link href="/#earn" className="hover:text-white transition-colors">Earn as a Student</Link></li>
              <li><Link href="/#contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Contact Info</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/80">
              <li>Email: info@universitio.co.uk</li>
              <li>WhatsApp: +44 7XXX XXXXXX</li>
              <li>Telegram: @universitio</li>
              <li className="pt-2">
                <div className="flex gap-2 items-center flex-wrap">
                  <span className="bg-white/10 px-2 py-1 rounded text-xs">ICEF Accredited</span>
                  <span className="bg-white/10 px-2 py-1 rounded text-xs">British Council Certified</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-primary-foreground/60">
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <p>© {currentYear} Universitio Ltd. All rights reserved.</p>
            <p className="mt-1">Universitio Ltd is registered in England and Wales. Company No. 15168670.</p>
          </div>
          <div className="flex space-x-6">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

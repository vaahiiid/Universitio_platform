import { Link } from "wouter";
import { ArrowLeft, Home, BookOpen, Calendar } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="text-[120px] font-extrabold leading-none text-primary/10 select-none mb-2">404</div>
        <h1 className="text-3xl font-bold text-foreground mb-3">Page not found</h1>
        <p className="text-muted-foreground mb-8">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="inline-flex items-center justify-center gap-2 rounded-full bg-primary text-white px-6 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors">
            <Home className="w-4 h-4" />
            Go to Homepage
          </Link>
          <Link href="/blog" className="inline-flex items-center justify-center gap-2 rounded-full border border-border text-foreground px-6 py-2.5 text-sm font-medium hover:bg-muted transition-colors">
            <BookOpen className="w-4 h-4" />
            Browse Blog
          </Link>
          <Link href="/free-consultation" className="inline-flex items-center justify-center gap-2 rounded-full border border-border text-foreground px-6 py-2.5 text-sm font-medium hover:bg-muted transition-colors">
            <Calendar className="w-4 h-4" />
            Free Consultation
          </Link>
        </div>

        <div className="mt-8">
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Universitio
          </Link>
        </div>
      </div>
    </div>
  );
}

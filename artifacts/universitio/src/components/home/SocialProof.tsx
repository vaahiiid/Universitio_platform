import { Link } from "wouter";
import { siteData } from "@/data/siteData";
import { blogPosts } from "@/data/blog/postsData";
import { trackEvent } from "@/lib/analytics";
import { Star, Mail, MapPin, CheckCircle2, ArrowRight, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useForm } from "react-hook-form";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api";
import { ConsentFields } from "@/components/ui/ConsentFields";

const homePostsData = [...blogPosts]
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  .slice(0, 4);

function StarRating({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < count ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`}
        />
      ))}
    </div>
  );
}

export function SocialProof() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [marketingOptOut, setMarketingOptOut] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState("");
  const { toast } = useToast();
  const autoplayPlugin = useRef(Autoplay({ delay: 4000, stopOnInteraction: true }));

  const onSubmit = async (data: Record<string, unknown>) => {
    if (!termsAccepted) {
      setTermsError("You must accept the Terms and Conditions and Privacy Policy to continue.");
      return;
    }
    setTermsError("");
    setSubmitting(true);
    try {
      await apiFetch("/leads/contact", {
        method: "POST",
        body: JSON.stringify({
          fullName: data.name,
          email: data.email,
          phone: data.phone || "",
          subject: data.subject,
          message: data.message,
          marketingOptOut,
          termsAccepted,
        }),
      });
      toast({ title: "Thank you!", description: "Your message has been sent successfully." });
      setIsSubmitted(true);
      reset();
    } catch {
      toast({ title: "Something went wrong", description: "Please try again or contact us directly.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Testimonials */}
      <section id="testimonials" aria-label="Student Testimonials" className="py-12 md:py-20 bg-gradient-to-b from-muted/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">What Our Students Say</h2>
              <p className="text-muted-foreground text-lg">Real feedback from students we've helped — rated on Trustpilot.</p>
            </div>
            <a href="https://www.trustpilot.com/review/universitio.co.uk" target="_blank" rel="noopener noreferrer" className="text-secondary font-medium hover:text-primary transition-colors flex items-center gap-1 group shrink-0">
              Read all reviews on Trustpilot <ExternalLink className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </a>
          </div>

          {/* Trustpilot TrustBox widget */}
          <div className="mb-10">
            <div
              className="trustpilot-widget"
              data-locale="en-US"
              data-template-id="56278e9abfbbba0bdcd568bc"
              data-businessunit-id="655257df9abd4cf92d9631e5"
              data-style-height="52px"
              data-style-width="100%"
              data-token="14179466-0ff9-404f-bd08-ff89a834a80f"
            >
              <a href="https://www.trustpilot.com/review/universitio.com" target="_blank" rel="noopener">Trustpilot</a>
            </div>
          </div>

          {/* Testimonial Carousel */}
          <div className="relative px-4 md:px-14">
            <Carousel
              opts={{ align: "start", loop: true }}
              plugins={[autoplayPlugin.current]}
              className="w-full"
            >
              <CarouselContent className="-ml-4 md:-ml-6">
                {siteData.testimonials.map((test, i) => (
                  <CarouselItem key={i} className="pl-4 md:pl-6 basis-full sm:basis-1/2 lg:basis-1/3">
                    <div className="bg-card rounded-2xl p-7 shadow-sm border border-border flex flex-col justify-between h-full hover:shadow-lg transition-shadow group">
                      <div>
                        <div className="mb-4">
                          <StarRating count={test.stars} />
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-6 italic">
                          &ldquo;{test.quote}&rdquo;
                        </p>
                      </div>
                      <div className="border-t border-border pt-4">
                        <p className="font-bold text-foreground text-sm">{test.author}</p>
                        <p className="text-xs text-muted-foreground mt-1">{test.program}</p>
                        <p className="text-xs font-medium text-secondary mt-1">{test.origin}</p>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="-left-4 md:-left-6 bg-white border-border shadow-md hover:bg-primary hover:text-white hover:border-primary transition-all h-10 w-10" />
              <CarouselNext className="-right-4 md:-right-6 bg-white border-border shadow-md hover:bg-primary hover:text-white hover:border-primary transition-all h-10 w-10" />
            </Carousel>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section id="blog" aria-label="Latest Blog Articles" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Latest Insights & Guidance</h2>
            <p className="text-lg text-muted-foreground">
              Expert advice on studying abroad, UK university applications, and student life.
            </p>
          </div>

          {/* Desktop Grid */}
          <div className="hidden md:grid md:grid-cols-3 gap-8 mb-12">
            {homePostsData.slice(0, 4).map((post) => (
              <div key={post.id} className="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
                <div className="aspect-[16/9] w-full bg-muted overflow-hidden">
                  <img
                    src={`${import.meta.env.BASE_URL}${post.image}`}
                    alt={post.imageAlt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="text-xs font-semibold text-secondary mb-3">
                    {new Date(post.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">{post.title}</h3>
                  <p className="text-muted-foreground text-sm mb-6 line-clamp-3 flex-grow">{post.excerpt}</p>
                  <Link href={`/blog/${post.slug}`} className="text-sm font-semibold text-foreground border-b-2 border-secondary pb-1 inline-block hover:text-secondary transition-colors">
                    Read More
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Carousel */}
          <div className="md:hidden mb-10 relative px-4">
            <Carousel
              opts={{ align: "start", loop: false }}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {homePostsData.slice(0, 4).map((post) => (
                  <CarouselItem key={post.id} className="pl-4 basis-full">
                    <div className="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
                      <div className="aspect-[16/9] w-full bg-muted overflow-hidden">
                        <img
                          src={`${import.meta.env.BASE_URL}${post.image}`}
                          alt={post.imageAlt}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-4 flex flex-col flex-grow">
                        <div className="text-xs font-semibold text-secondary mb-2">
                          {new Date(post.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">{post.title}</h3>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-grow">{post.excerpt}</p>
                        <Link href={`/blog/${post.slug}`} className="text-sm font-semibold text-foreground border-b-2 border-secondary pb-1 inline-block hover:text-secondary transition-colors">
                          Read More
                        </Link>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="-left-2 top-1/2 -translate-y-1/2 h-9 w-9 bg-white/90 border border-border shadow-sm hover:bg-primary hover:text-white hover:border-primary transition-all" />
              <CarouselNext className="-right-2 top-1/2 -translate-y-1/2 h-9 w-9 bg-white/90 border border-border shadow-sm hover:bg-primary hover:text-white hover:border-primary transition-all" />
            </Carousel>
          </div>

          <div className="text-center">
            <Link href="/blog">
              <Button variant="outline" size="lg" className="rounded-full px-8 font-semibold">
                Visit Our Blog
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </>
  );
}

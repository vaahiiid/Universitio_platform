import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { siteData } from "@/data/siteData";

export function WhyChoosePreview() {
  // Show only first 3 cards
  const preview = siteData.whyChooseUs.slice(0, 3);

  return (
    <section className="py-12 md:py-18 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Why Students Choose Universitio
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">
            Genuine expertise, personalised support, and proven results.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 mb-8">
          {preview.map((item, i) => (
            <div
              key={i}
              className="flex gap-4 items-start bg-slate-50 rounded-2xl p-5 border border-border/60 hover:border-primary/20 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-bold text-foreground text-sm mb-1">{item.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link href="/about">
            <div className="inline-block">
              <Button variant="outline" className="rounded-full border-primary/30 hover:border-primary/60 transition-all">
                See full details →
              </Button>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}

import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronRight, GraduationCap, MapPin, Search } from "lucide-react";

export function Hero() {
  return (
    <section id="home" aria-label="Introduction" className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50/50">
      {/* Decorative background elements */}
      <div className="absolute top-20 right-0 w-[800px] h-[800px] bg-secondary/5 rounded-full blur-3xl -z-10 mix-blend-multiply" />
      <div className="absolute bottom-0 left-[-20%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10 mix-blend-multiply" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-border/50 px-3 py-1.5 rounded-full text-sm font-medium text-primary mb-6 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-secondary animate-pulse"></span>
              <span>UK-Registered Company · ICEF Accredited</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-foreground">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">University Application Support</span> for International Students
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              Personalised support for international students, from choosing the right university, college, or school to submitting a strong application and preparing for your study abroad journey.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/free-consultation">
                <Button size="lg" className="w-full sm:w-auto text-base rounded-full bg-primary hover:bg-primary/90 px-8 h-14 shadow-lg shadow-primary/20 hover:shadow-xl transition-all hover:-translate-y-0.5 group">
                  Book a Free Consultation
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/assessment-form">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base rounded-full px-8 h-14 bg-white/50 backdrop-blur hover:bg-white border-border/80 hover:border-primary/30 transition-all">
                  Check Your Chances
                </Button>
              </Link>
            </div>

            <p className="mt-5 text-sm text-muted-foreground">
              Have a quick question?{" "}
              <Link href="/askimate" className="text-primary font-semibold hover:underline">
                Ask our AI study assistant →
              </Link>
            </p>
            
            <div className="mt-8 flex items-center gap-4 text-sm text-muted-foreground font-medium">
              <div className="flex -space-x-2">
                {[1,2,3,4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}&backgroundColor=e2e8f0`} alt="Avatar" className="w-full h-full" />
                  </div>
                ))}
              </div>
              <p>Trusted by 1,000+ students globally</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative h-[500px] w-full hidden lg:block"
          >
            {/* Custom Abstract Illustration instead of image */}
            <div className="absolute inset-0 w-full h-full flex items-center justify-center">
              <div className="relative w-[400px] h-[400px]">
                {/* Center Globe/Circle */}
                <div className="absolute inset-0 bg-gradient-to-tr from-primary to-secondary rounded-full opacity-10 animate-pulse" />
                <div className="absolute inset-8 bg-gradient-to-tr from-primary to-secondary rounded-full opacity-20" />
                <div className="absolute inset-16 bg-white shadow-2xl rounded-full flex items-center justify-center border border-white">
                  <GraduationCap className="w-24 h-24 text-primary" strokeWidth={1.5} />
                </div>
                
                {/* Floating Elements */}
                <motion.div 
                  animate={{ y: [0, -15, 0] }} 
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-10 left-0 bg-white p-4 rounded-2xl shadow-xl border border-border/50 flex items-center gap-3"
                >
                  <div className="bg-blue-100 p-2 rounded-lg"><MapPin className="w-5 h-5 text-secondary" /></div>
                  <div className="text-sm font-semibold">UK Universities</div>
                </motion.div>

                <motion.div 
                  animate={{ y: [0, 15, 0] }} 
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute bottom-20 -left-10 bg-white p-4 rounded-2xl shadow-xl border border-border/50 flex items-center gap-3"
                >
                  <div className="bg-emerald-100 p-2 rounded-lg"><Search className="w-5 h-5 text-emerald-600" /></div>
                  <div className="text-sm font-semibold">Admissions Guidance</div>
                </motion.div>

                <motion.div 
                  animate={{ y: [0, -10, 0] }} 
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                  className="absolute top-1/3 -right-10 bg-white p-4 rounded-2xl shadow-xl border border-border/50 flex flex-col gap-2"
                >
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Acceptance Rate</div>
                  <div className="text-2xl font-bold text-primary">98%</div>
                </motion.div>
                
                {/* Orbit Rings */}
                <div className="absolute -inset-10 border border-slate-200 rounded-full border-dashed animate-[spin_60s_linear_infinite]" />
                <div className="absolute -inset-24 border border-slate-200 rounded-full border-dashed animate-[spin_90s_linear_infinite_reverse]" />
              </div>
            </div>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}

import { 
  GraduationCap, Globe, BookOpen, UserCheck, 
  Search, FileText, CheckCircle, MessagesSquare, 
  MapPin, Clock, Award, ShieldCheck, HeartHandshake,
  BadgeCheck
} from "lucide-react";

export const siteData = {
  stats: [
    { value: "1,000+", label: "Students Helped" },
    { value: "20+", label: "Countries Represented" },
    { value: "500+", label: "Successful Applications" },
    { value: "5+", label: "Years of Experience" },
    { value: "100%", label: "Application Support" }
  ],
  
  services: [
    {
      id: "uk-uni",
      icon: GraduationCap,
      title: "UK University Applications",
      description: "Expert guidance for applying to leading UK universities, from Russell Group to specialist institutions."
    },
    {
      id: "global-uni",
      icon: Globe,
      title: "Global University Applications",
      description: "Support for applications worldwide, including the US, Canada, Australia, Europe, and beyond."
    },
    {
      id: "school-college",
      icon: BookOpen,
      title: "School & College Applications",
      description: "Helping younger students and families navigate school and college applications with confidence."
    },
    {
      id: "pre-departure",
      icon: CheckCircle,
      title: "Pre-Departure Guidance",
      description: "Practical preparation support to help students get ready for life as an international student abroad."
    },
    {
      id: "phd-research",
      icon: Search,
      title: "PhD & Research Support",
      description: "Tailored support for postgraduate researchers targeting competitive PhD programmes worldwide."
    },
    {
      id: "app-review",
      icon: FileText,
      title: "Application Review",
      description: "Professional review of your personal statement, CV, and supporting documents before submission."
    },
    {
      id: "interview-docs",
      icon: MessagesSquare,
      title: "Interview & Documentation",
      description: "Preparation guidance for university interviews and help organising your application documents."
    },
    {
      id: "course-country",
      icon: MapPin,
      title: "Course & Country Selection",
      description: "Personalised consultation to help you choose the right course, country, and institution for your goals."
    }
  ],

  pathways: [
    {
      id: "dependants",
      title: "Studying with Family in the UK",
      description: "Planning to study in the UK alongside family members? We help you understand the options available for accompanying family, navigating the relevant application processes, and ensuring you have all the documentation in order before applying.",
      ctaText: "Explore This Pathway",
      link: "/free-consultation?interest=family-study"
    },
    {
      id: "phd",
      title: "PhD & Research Applicants",
      description: "Applying for a PhD or research programme requires a different approach. We work with research applicants to refine their research proposals, identify supervisors, and navigate the complex application requirements.",
      ctaText: "PhD Consultation",
      link: "/free-consultation?interest=phd"
    },
    {
      id: "school",
      title: "School Students Preparing for University",
      description: "Starting early gives students a real advantage. We support younger students planning ahead — from A-Level and IB course selection to building a strong university application profile.",
      ctaText: "Start Early",
      link: "/free-consultation?interest=school"
    }
  ],

  studyDestinations: [
    {
      country: "United Kingdom",
      flag: "🇬🇧",
      description: "Full guidance for applications to UK schools, colleges, and universities, including specialist support for the UK admissions process.",
      highlights: ["Russell Group universities", "Further education colleges", "Independent schools", "UCAS applications"]
    },
    {
      country: "United States",
      flag: "🇺🇸", 
      description: "Support for students applying to leading institutions across the USA, from Ivy League universities to community colleges.",
      highlights: ["Common App support", "Undergraduate & postgraduate", "Liberal arts colleges", "Research universities"]
    },
    {
      country: "Canada",
      flag: "🇨🇦",
      description: "Personalised admissions support for colleges and universities in Canada, one of the world's most welcoming destinations for international students.",
      highlights: ["University of Toronto", "McGill University", "College of Applied Arts", "Province-based applications"]
    },
    {
      country: "Europe",
      flag: "🇪🇺",
      description: "Guidance for study opportunities across selected European destinations, including English-taught programmes and internationally recognised institutions.",
      highlights: ["English-taught programmes", "Netherlands, Germany & beyond", "Bachelor's & Master's", "European application systems"]
    }
  ],

  accreditations: [
    {
      id: "icef",
      logoKey: "icef",
      name: "ICEF Accredited",
      statement: "A global quality benchmark in international student recruitment"
    },
    {
      id: "british-council",
      logoKey: "british-council",
      name: "British Council Certified",
      statement: "Committed to recognised UK education standards and best practices"
    },
    {
      id: "ico",
      logoKey: "ico",
      name: "ICO Registered",
      statement: "Fully compliant with UK GDPR and data protection regulations"
    },
    {
      id: "birmingham-chambers",
      logoKey: "birmingham-chambers",
      name: "Greater Birmingham Chambers",
      statement: "Part of the UK's trusted business network"
    },
    {
      id: "trustpilot",
      logoKey: "trustpilot",
      name: "Trustpilot",
      statement: "Rated 4.6 — based on verified student reviews"
    },
    {
      id: "companies-house",
      logoKey: "companies-house",
      name: "UK-Registered Company",
      statement: "Company No. 15168670 — Registered in England and Wales"
    }
  ],

  universities: [
    "University of Oxford", "University of Cambridge", "Imperial College London", 
    "UCL", "University of Edinburgh", "King's College London", 
    "University of Manchester", "University of Birmingham", "LSE", 
    "University of Leeds", "Durham University", "University of Bristol", 
    "University of Glasgow", "University of Warwick", "Queen Mary London", 
    "University of Sheffield"
  ],

  whyChooseUs: [
    {
      icon: HeartHandshake,
      title: "Personalised Guidance",
      description: "Every student receives one-to-one support tailored to their specific goals, background, and ambitions."
    },
    {
      icon: MapPin,
      title: "UK-Focused Expertise",
      description: "Deep knowledge of the UK education system, admissions requirements, and what universities are really looking for."
    },
    {
      icon: Globe,
      title: "Worldwide Study Options",
      description: "We support applications to universities in the UK, US, Canada, Australia, Europe, and across the globe."
    },
    {
      icon: ShieldCheck,
      title: "Trusted & Accredited",
      description: "ICEF accredited, British Council certified, and ICO registered — your data and your future are in safe hands."
    },
    {
      icon: CheckCircle,
      title: "Simple & Stress-Free",
      description: "We handle the complexity so you can focus on your future. Clear steps, clear communication, no confusion."
    },
    {
      icon: BadgeCheck,
      title: "Real Education Professionals",
      description: "Our team are certified UK education professionals with years of hands-on application experience."
    }
  ],

  countries: [
    { name: "India", flag: "🇮🇳" },
    { name: "Pakistan", flag: "🇵🇰" },
    { name: "Nigeria", flag: "🇳🇬" },
    { name: "Bangladesh", flag: "🇧🇩" },
    { name: "Ghana", flag: "🇬🇭" },
    { name: "Iran", flag: "🇮🇷" },
    { name: "UAE", flag: "🇦🇪" },
    { name: "Saudi Arabia", flag: "🇸🇦" },
    { name: "Kenya", flag: "🇰🇪" },
    { name: "Turkey", flag: "🇹🇷" }
  ],

  testimonials: [
    {
      quote: "Universitio made what felt like an overwhelming process feel manageable. They guided me every step of the way, and I received an offer from my first-choice university. I couldn't have done it without them.",
      author: "Priya S.",
      origin: "India",
      program: "MSc Computer Science, University of Manchester"
    },
    {
      quote: "Professional, knowledgeable, and genuinely caring. The team helped me prepare a strong personal statement and I was accepted to three universities. Highly recommended.",
      author: "Ahmed K.",
      origin: "Nigeria",
      program: "LLB Law, University of Birmingham"
    },
    {
      quote: "As an international student, I had so many questions about the UK system. Universitio answered everything patiently and helped me navigate the entire application process too.",
      author: "Sara M.",
      origin: "Pakistan",
      program: "BSc Nursing, University of Leeds"
    },
    {
      quote: "The PhD guidance I received was exceptional. They helped me identify the right supervisors and refine my research proposal significantly.",
      author: "Dr. Reza F.",
      origin: "Iran",
      program: "PhD Engineering, University of Sheffield"
    }
  ],

  blogPosts: [
    {
      id: 1,
      image: "blog-1.png",
      date: "12 March 2026",
      title: "How to Write a Strong UCAS Personal Statement",
      excerpt: "Your personal statement is one of the most important parts of your UCAS application. Here's our expert guide to making it stand out."
    },
    {
      id: 2,
      image: "blog-2.png",
      date: "5 March 2026",
      title: "UK Study 2026: What International Students Need to Know",
      excerpt: "A clear overview of the UK application requirements, documentation process, and what to expect when applying from abroad."
    },
    {
      id: 3,
      image: "blog-3.png",
      date: "26 February 2026",
      title: "Choosing Between Russell Group and Post-1992 Universities",
      excerpt: "Understanding the difference between university types in the UK can help you make a more informed decision about where to apply."
    }
  ]
};
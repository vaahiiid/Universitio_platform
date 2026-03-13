import { 
  GraduationCap, Globe, BookOpen, UserCheck, 
  Search, FileText, CheckCircle, MessagesSquare, 
  MapPin, Clock, Award, ShieldCheck, HeartHandshake,
  BadgeCheck, PenLine, FlaskConical
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
      title: "University Applications",
      description: "End-to-end guidance for UK, US, Canadian, and European university admissions."
    },
    {
      id: "personal-statement",
      icon: PenLine,
      title: "Personal Statement & CV",
      description: "Professional preparation of personal statements, CVs, and supporting documents that stand out."
    },
    {
      id: "phd-research",
      icon: FlaskConical,
      title: "PhD Proposal & Research",
      description: "Tailored support for research proposals, supervisor identification, and competitive PhD applications."
    },
    {
      id: "course-country",
      icon: MapPin,
      title: "Course & Country Selection",
      description: "Personalised consultation to help you choose the right course, country, and institution."
    },
    {
      id: "school-college",
      icon: BookOpen,
      title: "School & College Applications",
      description: "Helping younger students and families navigate school and college admissions with confidence."
    },
    {
      id: "interview-docs",
      icon: MessagesSquare,
      title: "Interview & Documentation",
      description: "Preparation guidance for university interviews and help organising your application documents."
    },
    {
      id: "app-review",
      icon: FileText,
      title: "Application Review",
      description: "Professional review of your full application package before submission."
    },
    {
      id: "pre-departure",
      icon: CheckCircle,
      title: "Pre-Departure Guidance",
      description: "Practical preparation to help you get ready for life as an international student abroad."
    }
  ],

  pathways: [
    {
      id: "dependants",
      title: "Studying with Family in the UK",
      description: "We help you understand the options available for accompanying family, navigating the relevant application processes, and ensuring you have all the documentation in order.",
      ctaText: "Explore This Pathway",
      link: "/free-consultation?interest=family-study"
    },
    {
      id: "phd",
      title: "PhD & Research Applicants",
      description: "We work with research applicants to refine their research proposals, identify supervisors, and navigate the complex application requirements.",
      ctaText: "PhD Consultation",
      link: "/free-consultation?interest=phd"
    },
    {
      id: "school",
      title: "School Students Preparing for University",
      description: "We support younger students planning ahead — from A-Level and IB course selection to building a strong university application profile.",
      ctaText: "Start Early",
      link: "/free-consultation?interest=school"
    }
  ],

  studyDestinations: [
    {
      country: "United Kingdom",
      flag: "🇬🇧",
      description: "Full guidance for UK schools, colleges, and universities — including Russell Group, UCAS applications, and specialist admissions support."
    },
    {
      country: "United States",
      flag: "🇺🇸", 
      description: "Support for leading US institutions, from Ivy League universities to liberal arts colleges, with Common App guidance."
    },
    {
      country: "Canada",
      flag: "🇨🇦",
      description: "Personalised admissions support for Canadian colleges and universities — one of the most welcoming study destinations."
    },
    {
      country: "Europe",
      flag: "🇪🇺",
      description: "Guidance for English-taught programmes across the Netherlands, Germany, and other selected European destinations."
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
      name: "British Council Agent",
      statement: "Certification award as an agent of the British Council"
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
    { name: "Nigeria", flag: "🇳🇬" },
    { name: "Pakistan", flag: "🇵🇰" },
    { name: "Saudi Arabia", flag: "🇸🇦" },
    { name: "United Arab Emirates", flag: "🇦🇪" },
    { name: "Qatar", flag: "🇶🇦" },
    { name: "Bangladesh", flag: "🇧🇩" },
    { name: "Iran", flag: "🇮🇷" },
    { name: "Turkey", flag: "🇹🇷" },
    { name: "China", flag: "🇨🇳" },
    { name: "Hong Kong", flag: "🇭🇰" }
  ],

  testimonials: [
    {
      quote: "Universitio made what felt like an overwhelming process feel manageable. They guided me every step of the way, and I received an offer from my first-choice university. I couldn't have done it without them.",
      author: "Priya S.",
      origin: "India",
      program: "MSc Computer Science, University of Manchester",
      stars: 5
    },
    {
      quote: "Professional, knowledgeable, and genuinely caring. The team helped me prepare a strong personal statement and I was accepted to three universities. Highly recommended.",
      author: "Ahmed K.",
      origin: "Nigeria",
      program: "LLB Law, University of Birmingham",
      stars: 5
    },
    {
      quote: "As an international student, I had so many questions about the UK system. Universitio answered everything patiently and helped me navigate the entire application process too.",
      author: "Sara M.",
      origin: "Pakistan",
      program: "BSc Nursing, University of Leeds",
      stars: 5
    },
    {
      quote: "The PhD guidance I received was exceptional. They helped me identify the right supervisors and refine my research proposal significantly.",
      author: "Dr. Reza F.",
      origin: "Iran",
      program: "PhD Engineering, University of Sheffield",
      stars: 5
    },
    {
      quote: "I was unsure about which country to study in. Universitio helped me weigh up my options, and I ended up choosing Canada — the best decision I've made. They handled everything brilliantly.",
      author: "Fatima A.",
      origin: "Saudi Arabia",
      program: "MBA, University of Toronto",
      stars: 5
    },
    {
      quote: "From my first enquiry to receiving my offer letter, the team at Universitio were supportive and responsive. They truly understand what international students need.",
      author: "Chen W.",
      origin: "China",
      program: "BEng Mechanical Engineering, University of Bristol",
      stars: 5
    },
    {
      quote: "I applied through Universitio for a Master's programme and got accepted within weeks. Their knowledge of UK admissions is outstanding. I felt confident throughout.",
      author: "Oluwaseun D.",
      origin: "Nigeria",
      program: "MSc Finance, University of Warwick",
      stars: 5
    },
    {
      quote: "Excellent service from start to finish. They helped me with my personal statement, interview preparation, and even pre-departure advice. Very professional team.",
      author: "Yusuf B.",
      origin: "Turkey",
      program: "BSc Architecture, UCL",
      stars: 5
    },
    {
      quote: "I was nervous about applying to universities abroad, but Universitio made the whole process feel straightforward. They were always available to answer my questions.",
      author: "Maria G.",
      origin: "Bangladesh",
      program: "MSc Public Health, University of Glasgow",
      stars: 5
    },
    {
      quote: "The team helped my daughter secure a place at a top London school. Their understanding of the UK education system at every level is impressive.",
      author: "Hassan R.",
      origin: "Qatar",
      program: "A-Levels, London School",
      stars: 5
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

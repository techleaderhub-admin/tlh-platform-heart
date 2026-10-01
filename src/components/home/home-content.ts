/**
 * Home page content.
 * Kept separate from the layout so the same FAQ text feeds both the visible page
 * and the FAQPage structured data (search engines and AI assistants read both).
 *
 * Content rules for this page: no pricing and no course or curriculum details.
 */

export const SITE_URL = "https://techleaderhub.com";

export const LINKS = {
  masterclass: "/masterclass",
  journeyVideo: "https://youtu.be/TnDhnKljrqo",
  nikhilLinkedIn: "https://www.linkedin.com/in/nikhil-rai-android/",
  droidSkool: "https://www.droidskool.com/",
  instagram: "https://www.instagram.com/techleaderhubofficial/",
  facebook: "https://www.facebook.com/techleaderhub",
  youtube: "https://www.youtube.com/@DroidSkool",
  linkedin: "https://www.linkedin.com/company/techleaderhub",
} as const;

export const PORTRAITS = {
  hero: "https://d1yei2z3i6k35z.cloudfront.net/14545770/6a36be05580af9.29314886_Nikhil-Rai-LinkedIn.png",
  story: "https://d1yei2z3i6k35z.cloudfront.net/14545770/6a36be055d6675.68723283_black.png",
  headshot: "https://d1yei2z3i6k35z.cloudfront.net/14545770/6a36be055d6675.68723283_black.png",
} as const;

export const recognition = [
  {
    quote: "I've wanted to switch for a year. I still haven't applied.",
    detail:
      "You browse openings on weekends and polish your resume, then the week takes over again. The gap feels too big to start.",
  },
  {
    quote: "I clear the coding round, then lose it in system design.",
    detail:
      "Your code works. But interviewers push on architecture and trade-offs, and the answers don't come out the way you know them.",
  },
  {
    quote: "Six months of interviews. Same desk. Same salary.",
    detail:
      "You're doing what everyone tells you to do: more LeetCode, more applications. Nothing moves.",
  },
] as const;

export const steps = [
  {
    title: "Diagnose",
    text: "Find out exactly why you're stuck, whether it's technical depth, architecture, interview performance or how your profile reads.",
  },
  {
    title: "Rebuild",
    text: "Close the gaps interviewers actually test, and turn your experience into evidence a product company can see.",
  },
  {
    title: "Land",
    text: "Walk into interviews prepared, handle the offer conversation with confidence, and step up as a leader.",
  },
] as const;

export const authorityPillars = [
  {
    title: "Production engineering",
    text: "Nikhil has built and scaled real-world Android products across demanding product and technology environments.",
  },
  {
    title: "Architecture & leadership",
    text: "His work sits beyond feature coding — architecture, technical decisions, scalability and the engineering trade-offs that senior interviews test.",
  },
  {
    title: "Career acceleration",
    text: "Droid Skool builds practical Android capability; Tech Leader Hub turns experienced engineering depth into stronger interviews, positioning and technical leadership.",
  },
] as const;

export const stories = [
  {
    name: "Supratim Bhattacharya",
    role: "Senior Software Platform Engineer, Kochava",
    photo: "https://d1yei2z3i6k35z.cloudfront.net/14545770/6a37dfe2432933.63988140_supratim.png",
    quote:
      "Building apps with Clean Architecture and Dependency Injection taught me the 'why' behind architectural decisions, not just the 'how'. Now, I can independently design scalable applications, and my confidence in technical interviews has skyrocketed.",
  },
  {
    name: "Parth Mittal",
    role: "Senior Mobile Developer, Arks Ventures",
    photo:
      "https://d1yei2z3i6k35z.cloudfront.net/14545770/6a37dfe248e122.31088968_parth-student.png",
    quote:
      "As a Flutter developer, I wanted to dive into native Android but wasn't aware of the deeper mechanics behind advanced concepts… I finally got hands-on knowledge of advanced native topics I had only heard about before.",
  },
  {
    name: "Chandan Badtya",
    role: "Software Development Engineer",
    photo:
      "https://d1yei2z3i6k35z.cloudfront.net/14545770/6a38f0dd332308.37337715_chandan_badtya.png",
    quote:
      "Before this program, I knew Android basics but was always confused about which architecture and structure to use in real projects… Since joining, I have successfully built two professional-level apps with proper architecture.",
  },
] as const;

export const fitFor = [
  "You work as an Android developer and have a few years of real production experience.",
  "You've been wanting to switch, or interviewing, for months without the result you want.",
  "You're ready to change how you prepare, not just prepare more.",
] as const;

export const fitNotFor = [
  "You're still learning Kotlin or Android, or you don't yet have meaningful production experience.",
] as const;

export const droidSkoolPath = {
  eyebrow: "Recommended starting point",
  title: "Build first. Then accelerate.",
  description:
    "Not every Android developer needs Tech Leader Hub today. If you're still building your Kotlin and Android foundation, creating real projects, or working toward job-readiness, Droid Skool is the place to start. Once you have real production experience and you're ready for stronger product-company opportunities, Tech Leader Hub is built for that next step.",
  droidSkool: {
    title: "Droid Skool",
    subtitle: "Build & become job-ready",
    badge: "For beginners & early-career developers",
    points: [
      "Learn Kotlin and Android through practical, structured training.",
      "Build real apps and portfolio-ready projects.",
      "Get mentorship, feedback and interview preparation.",
    ],
  },
  techLeaderHub: {
    title: "Tech Leader Hub",
    subtitle: "Accelerate your career",
    badge: "For experienced Android engineers",
    points: [
      "Find and close the gaps holding your career move back.",
      "Build the architecture, system-design and interview skills product companies test.",
      "Position yourself for stronger roles and technical leadership.",
    ],
  },
} as const;

export type Faq = {
  id: string;
  question: string;
  /** First sentence answers the question on its own; that's the part AI tools quote. */
  answer: string;
  link?: { label: string; href: string };
};

export const faqs: Faq[] = [
  {
    id: "what-is-tech-leader-hub",
    question: "What is Tech Leader Hub?",
    answer:
      "Tech Leader Hub is a career acceleration platform for experienced Android developers who want to move into stronger product-company roles and grow toward technical leadership. It was founded by Nikhil Rai, a former Ola Maps architect with more than 13 years in Android.",
    link: { label: "See how it works", href: "#approach" },
  },
  {
    id: "who-is-nikhil-rai",
    question: "Who is Nikhil Rai?",
    answer:
      "Nikhil Rai is an Android architect and career coach with more than 13 years of experience at Ola, PayU and Gameskraft, and the founder of Droid Skool and Tech Leader Hub.",
    link: { label: "Read his story", href: "#nikhil" },
  },
  {
    id: "who-is-it-for",
    question: "Who is Tech Leader Hub for?",
    answer:
      "Tech Leader Hub is for working Android developers who have been wanting to switch jobs for months, or have been interviewing without converting, and are ready to fix what's actually holding them back. It isn't designed for beginners learning Android for the first time.",
    link: { label: "Check if it's a fit", href: "#fit" },
  },
  {
    id: "where-to-start",
    question: "I've wanted to switch jobs for months but keep delaying. Where do I start?",
    answer:
      "Start by finding out exactly what's holding you back before you study anything new. Most developers who delay aren't short on time; they're missing a clear picture of what product companies test and how far they are from it. The free live masterclass is the quickest way to get that picture.",
    link: { label: "Join the free masterclass", href: LINKS.masterclass },
  },
  {
    id: "why-interviews-fail",
    question: "Why do experienced Android developers fail product-company interviews?",
    answer:
      "Most experienced Android developers fail on depth and communication, not on syntax. Product companies test architecture decisions, system design and how clearly you explain trade-offs, while many developers prepare by solving more coding problems. Closing that gap is the core of Tech Leader Hub.",
  },
  {
    id: "different-from-course",
    question: "How is Tech Leader Hub different from an Android course?",
    answer:
      "Tech Leader Hub isn't a course. A course teaches topics to everyone in the same order; Tech Leader Hub works on your specific career move, starting from a diagnosis of your gaps and ending with the interviews and offer in front of you.",
  },
  {
    id: "working-full-time",
    question: "Can I prepare while working full-time or serving my notice period?",
    answer:
      "Yes. Tech Leader Hub is built for working engineers, so the work is planned around a full-time job, and the notice period is treated as part of the strategy rather than an obstacle.",
  },
  {
    id: "only-android",
    question: "Is Tech Leader Hub only for Android developers?",
    answer:
      "Today, yes. Android is where Tech Leader Hub starts because that's where Nikhil's 13+ years of experience lie. The longer-term plan is to support backend, full-stack, staff and architect career paths as well.",
  },
  {
    id: "job-guarantee",
    question: "Does Tech Leader Hub guarantee a job?",
    answer:
      "No. Tech Leader Hub does not guarantee a job or an interview call. What Tech Leader Hub gives you is an exact career path: identify the gaps holding you back, strengthen your profile and positioning, build the skills product companies test, and prepare deliberately to handle technical, architecture and system-design interviews with confidence.",
  },
  {
    id: "get-started",
    question: "How do I get started with Tech Leader Hub?",
    answer:
      "Join the free 90-minute live masterclass. You'll see the gaps that keep experienced Android developers stuck, and leave knowing what to work on next.",
    link: { label: "Reserve your seat", href: LINKS.masterclass },
  },
];

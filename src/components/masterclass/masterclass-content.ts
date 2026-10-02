/**
 * /masterclass landing page content.
 *
 * All copy lives here so it can be edited without touching the layout. Copy follows the
 * approved webinar brief (Oct 2026). Registration still saves to the existing
 * `masterclass_registrations` table that the admin dashboard reads.
 */

/* ---------- Event ---------- */

export const EVENT = {
  /** Weekly live session, Sunday 11:00 AM India time (IST, UTC+5:30). */
  weekday: 0,
  hourIst: 11,
  minuteIst: 0,
  durationLabel: "2 hours",
  dayLabel: "Every Sunday",
  timeLabel: "11:00 AM IST",
  platform: "Live on Zoom",
  /** Shown scratched out next to "Free Access". */
  anchorPrice: "₹999",
} as const;

/**
 * Hero video (2-minute VSL) on YouTube. Loads only when the visitor presses play.
 */
export const VSL = {
  youtubeId: "fAg36WhbQyc",
  label: "Watch the 2-minute overview",
} as const;

/* ---------- Calls to action ---------- */

export const CTA = {
  primary: "RESERVE MY FREE SEAT & CLAIM MY ATS-PROOF RESUME TEMPLATE NOW",
  short: "Reserve my free seat",
  micro: "100% free · Live on Zoom · Takes 30 seconds",
} as const;

/* ---------- Section 1: Hero ---------- */

export const HERO = {
  preHeadline:
    "ATTENTION: EXPERIENCED ANDROID DEVELOPERS & IT PROFESSIONALS STUCK IN THE SERVICE-COMPANY TRAP",
  headlineLead: "How Senior Android Engineers Can Transition Into Tech Leaders and Unlock",
  headlineHighlight: "₹36+ LPA Product Roles",
  description:
    "Stop writing legacy code for ₹8 LPA. Discover the exact Clean Architecture frameworks, System Design (HLD/LLD) blueprints, and AI-augmented strategies required to escape stagnant jobs, bulletproof your career against layoffs, and command a premium 40+ LPA package at tier-1 product companies.",
} as const;

/* ---------- Problem & solution ---------- */

export const PROBLEM = {
  eyebrow: "The service-company trap",
  title: "You're not stuck because you lack talent. You're stuck inside the wrong system.",
  intro:
    "You've put in the years. You ship features, fix bugs and close tickets. Yet the salary barely moves, the interviews keep slipping away, and every layoff headline lands a little closer to home.",
  pains: [
    {
      title: "12-hour shifts for ₹8–15 LPA",
      text: "Exhausting days maintaining legacy code in a service firm, while your salary stays stuck in the middle.",
    },
    {
      title: "Interview paralysis",
      text: "You clear the coding round, then freeze when the System Design (HLD/LLD) questions begin.",
    },
    {
      title: "Fear of layoffs and AI",
      text: "Constant anxiety about restructuring, and about being replaced by AI or by someone who uses it better.",
    },
    {
      title: "A junior mindset that keeps you small",
      text: "Chasing syntax and closing assigned Jira tickets instead of owning systems and business outcomes.",
    },
  ],
} as const;

export const SOLUTION = {
  eyebrow: "The Tech Leader Hub system",
  title: "Product companies don't pay for more effort. They pay for Tech Leaders.",
  intro:
    "In this masterclass you'll see the system that moves experienced Android engineers out of the service trap and into tier-1 product roles, step by step.",
  shifts: [
    {
      from: "Reactive Jira ticket-closer",
      to: "Visionary architect who owns System Design, Clean Architecture and business outcomes",
    },
    {
      from: "Outbound begging and the HR black hole",
      to: "Inbound attraction with an ATS-optimized resume and a high-signal GitHub portfolio",
    },
    {
      from: "Random LeetCode and isolated, frustrated effort",
      to: "A strict 90-day, AI-augmented roadmap with hostile mock interviews",
    },
  ],
} as const;

/* ---------- Section 3: 3 secrets ---------- */

export const SECRETS = [
  {
    number: "Secret 1",
    title: "The Tech Leader Identity Shift",
    text: 'Stop operating with a fear-driven "junior mindset" focused solely on chasing random syntax and closing assigned Jira tickets. Product companies do not pay ₹30+ LPA to basic coders; they pay Tech Leaders who confidently own systems and business outcomes. You will learn how to drop keyword stuffing and undirected LeetCode practice, and instead build undeniable authority in System Design, Clean Architecture, MVVM, and cross-team communication.',
    tags: ["System Design", "Clean Architecture", "MVVM", "Cross-team communication"],
  },
  {
    number: "Secret 2",
    title: "The Recruiter Magnet System",
    text: "Recruiters do not hunt for candidates based on generic PDF resumes or tier-3 college marks. You must shift from outbound begging to inbound attraction. I will show you exactly how to build an ATS-optimized resume tailored to specific roles and a production-grade GitHub README.md portfolio that showcases your real-world impact and architectural thought process 24/7, forcing tier-1 HRs to actively search for you.",
    tags: ["ATS-optimized resume", "GitHub README.md portfolio", "Inbound recruiters"],
  },
  {
    number: "Secret 3",
    title: "The Tech Leader Hub Roadmap and AI-Augmented Execution",
    text: "Success requires a proven system, not isolated, frustrated effort. You will discover my strict 90-day roadmap that prioritizes a mindset reset, rapid skill stacking in Kotlin and core Android concepts, and real-world project execution. Furthermore, you will learn how to utilize AI tools with efficient prompting to accelerate your learning, simulate hostile mock interviews, and build complex applications 10x faster.",
    tags: ["90-day roadmap", "Kotlin skill stacking", "AI mock interviews", "Build 10x faster"],
  },
] as const;

/* ---------- Section 4: Who is this webinar for ---------- */

export const AUDIENCE = [
  {
    title: "Mid-Level Android Developers Stuck in Service Companies",
    years: "2-6 Years Experience",
    text: "If you are currently working in TCS, Infosys, Wipro, or mid-tier service firms where your salary is stuck in the middle, this masterclass will give you the deep architectural knowledge required to escape the service-company trap and lead product development.",
  },
  {
    title: "Senior Android Engineers Facing a Career Ceiling",
    years: "6-13 Years Experience",
    text: "If you feel permanently stuck in your current job, are unable to transition to better companies, and suffer from interview paralysis during High-Level Design (HLD) rounds, this system provides the exact blueprints to confidently crack tier-1 interviews.",
  },
  {
    title: "Experienced Developers Returning or Pivoting",
    years: "10-13 Years Experience",
    text: "If you are returning from a career break or are trapped in legacy Java stacks, and fear becoming obsolete due to AI, this webinar delivers a rapid identity reboot and AI-augmented execution strategies to make your portfolio look cutting-edge, not outdated.",
  },
] as const;

/* ---------- Section 5: Why attend ---------- */

export const WHY_ATTEND = [
  {
    title: "Crack HLD & LLD Interviews Without Fear",
    text: "Stop freezing during high-stakes technical rounds. Discover the exact System Design blueprints and Clean Architecture patterns that tier-1 recruiters actually demand.",
  },
  {
    title: "Escape the 12-Hour Service Trap",
    text: "Stop working exhausting shifts just to maintain outdated legacy code. Learn the systematic transition path to secure high-growth, product-based roles.",
  },
  {
    title: 'Build an Unshakeable "High-Income Floor"',
    text: "Eliminate layoff vulnerability by learning the exact strategies to command ₹36+ LPA, making you virtually unfireable in the face of corporate restructuring.",
  },
  {
    title: "Leverage AI-Augmented Execution",
    text: "Don't let AI replace you. Learn how to integrate generative AI tools into your daily development workflow to code 10x faster and stay ahead of industry shifts.",
  },
  {
    title: 'Shatter the "Degree Myth"',
    text: "Realize that top companies hire based on capability, not academic marks. Learn how to position your skills so effectively that your tier-3 college background becomes completely irrelevant.",
  },
  {
    title: "Claim 3 Exclusive Action Gifts",
    text: "By attending and staying until the end, you will receive my foundational E-Book PDF, the Tech Leader Identity Scorecard, and a ready-to-use ATS-Proof Resume Template to instantly fix your job applications.",
  },
] as const;

/* ---------- Bonuses ---------- */

export const BONUSES = [
  {
    kind: "book",
    label: "Bonus 1",
    title: "The Android Career Blueprint",
    format: "PDF of E-Book",
  },
  {
    kind: "scorecard",
    label: "Bonus 2",
    title: "The Tech Leader Identity Scorecard",
    format: "6-Point Self-Assessment PDF",
  },
  {
    kind: "resume",
    label: "Bonus 3",
    title: "The ATS-Proof Resume Template",
    format: "Ready-to-use Google Docs/Notion format",
  },
] as const;

/* ---------- Section 2: About the speaker ---------- */

export const SPEAKER = {
  name: "Nikhil Rai",
  title: "India's #1 Android Career Coach & Founder of Tech Leader Hub",
  experienceTitle: "My Experience & Expertise",
  experience:
    "I am Nikhil Rai, India’s #1 Android Career Coach and the founder of Tech Leader Hub and Droid Skool. Over the past 13+ years, I have served as a Lead and Architect for top-tier product companies including OLA, PayU, Gameskraft, and Verizon. I have architected and scaled platforms like Ola Maps, LazyPay, Pocket52, and Verizon Messages that are actively used by more than 100 million users on a daily basis.",
  missionTitle: "My Mission",
  mission:
    'I am living proof that the "Degree Myth" is a lie. I graduated with second-division marks—59% in 10th, 53% in 12th, and 59% in my B.Tech—yet I scaled to a ₹60 LPA base package plus lucrative ESOPs. My concrete mission is to help 100,000 Android developers completely escape low-paying service roles, eradicate layoff anxiety, and command premium compensation packages ranging from ₹16 LPA to ₹60+ LPA. Together, we are reviving the Nalanda spirit to build a legacy of Sovereign Tech Leaders who achieve absolute financial freedom.',
  stats: [
    { value: "13+", label: "Years as Lead / Architect" },
    { value: "100M+", label: "Daily users on platforms he architected" },
    { value: "₹60 LPA", label: "Base package plus ESOPs" },
    { value: "Tier-3", label: "College background, second-division marks" },
  ],
  companies: ["OLA", "PayU", "Gameskraft", "Verizon"],
  platforms: ["Ola Maps", "LazyPay", "Pocket52", "Verizon Messages"],
} as const;

/* ---------- Section 6: Case studies ---------- */

export type CaseStudy = {
  name: string;
  headline: string;
  story: string;
  from: string;
  to: string;
  /** Optional photo (WebP in /public preferred). */
  photo?: string;
  /** Optional YouTube ID for a video testimonial; shows a click-to-play block when set. */
  videoId?: string;
};

export const CASE_STUDIES: CaseStudy[] = [
  {
    name: "Abhishek",
    headline: "The Tier-3 to Product Leap",
    story:
      "Graduating from a Tier-3 college, Abhishek was trapped in a low-paying service-based company earning just ₹5 LPA. He was taught to shift his focus away from basic coding and master high-level Android architecture and product-company interview frameworks. By restructuring his code using MVVM and the repository pattern, he articulated his architecture cleanly in interviews, making a massive jump to ₹15 LPA, and eventually scaling his career to command a ₹36+ LPA package at a tier-1 product company.",
    from: "₹5 LPA",
    to: "₹36+ LPA",
  },
  {
    name: "Chandan Badtya",
    headline: "Defeating the Degree Myth",
    story:
      'Chandan struggled with low academic marks and started his career at a very small, unknown company with limited growth. He shattered the "Degree Myth" by deploying a high-signal GitHub portfolio and an ATS-proof resume. By bypassing traditional HR filters and demonstrating clean execution, he attracted tier-1 recruiters directly and is currently earning a ₹36+ LPA package along with highly lucrative ESOPs.',
    from: "Small, unknown company",
    to: "₹36+ LPA + ESOPs",
    photo:
      "https://d1yei2z3i6k35z.cloudfront.net/14545770/6a38f0dd332308.37337715_chandan_badtya.png",
  },
  {
    name: "Parth Mittal",
    headline: "The High-Income Pivot",
    story:
      "Parth started his career doing web development at Infosys, feeling stagnant with frozen salary growth. He strategically pivoted his entire career trajectory into modern Android app development by following our strict 90-day roadmap. He built a highly specialized technical portfolio, successfully escaped the service sector, and secured a premium Android package of more than ₹25 LPA.",
    from: "Web developer at Infosys",
    to: "₹25+ LPA Android role",
    photo:
      "https://d1yei2z3i6k35z.cloudfront.net/14545770/6a37dfe248e122.31088968_parth-student.png",
  },
];

/* ---------- Section 7: FAQ ---------- */

export const FAQS = [
  {
    question: "Is this masterclass actually free?",
    answer:
      "Yes, registration is 100% free. However, the session lasts for a full 2 hours, so you must commit your time, sit in a quiet place without distractions, and be ready to take notes.",
  },
  {
    question: "Do I need an elite computer science degree to achieve a ₹36+ LPA salary?",
    answer:
      "Absolutely not. I graduated with 59% in my B.Tech, and I earn a ₹60 LPA base package. Tier-1 product companies hire based on clean architectural execution and capability, not academic marksheets.",
  },
  {
    question: "Is this webinar meant for freshers or absolute beginners?",
    answer:
      "No. This is specifically engineered for working professionals and mid-to-senior developers with 2 to 13 years of experience who are stuck in service companies or facing a career ceiling.",
  },
  {
    question: "Will you be teaching basic Kotlin syntax during this session?",
    answer:
      "No. This is a high-level strategic masterclass. We will focus on shifting your identity to a Tech Leader, mastering System Design (HLD/LLD) blueprints, and outlining the exact 90-day roadmap to scale your career.",
  },
  {
    question: "I work in a service-based IT company (TCS, Infosys, etc.). Will this work for me?",
    answer:
      "Yes. This framework is explicitly designed to help developers escape the 12-hour service-company trap and transition into premium product-based roles.",
  },
  {
    question: "I am terrified of System Design interviews. Can you help?",
    answer:
      'Yes. We directly address "Interview Paralysis" and imposter syndrome by breaking down exactly what tier-1 tech recruiters demand to see in your architectural blueprints.',
  },
  {
    question: "Will there be a replay available if I miss the live session?",
    answer:
      "No. This is an exclusive live event. To receive the exact roadmap and claim the free action gifts, you must attend live and stay until the very end.",
  },
  {
    question: "How does AI fit into Android development right now?",
    answer:
      "AI is not going to replace you, but an Android developer using our AI-integration framework will. I will show you how to utilize AI tools to accelerate your learning and build real-world applications faster.",
  },
  {
    question: "Are the promised bonuses actually free?",
    answer:
      "Yes. If you stay until the end of the 2-hour webinar, you will receive the E-Book PDF, the Tech Leader Identity Scorecard, and the ATS-Proof Resume Template at no cost.",
  },
  {
    question: "How quickly can I expect to see results in my career?",
    answer:
      "By following the strict 90-day Tech Leader Hub roadmap—focusing on a mindset reset, rapid skill stacking, and building a recruiter magnet portfolio—you can drastically accelerate your path to product company interviews.",
  },
] as const;

/* ---------- Final CTA ---------- */

export const FINAL_CTA = {
  eyebrow: "Live only · No replay",
  title: "Your next role won't wait for the right time. Your seat this Sunday is free.",
  text: "Two focused hours. The identity shift, the recruiter magnet system and the 90-day AI-augmented roadmap, plus three action gifts for staying until the end.",
} as const;

/* ---------- Section 8: Footer disclaimer ---------- */

export const DISCLAIMER =
  "*Disclaimer: This website is not a part of the Facebook website or Facebook Inc. Additionally, this site is NOT endorsed by Facebook in any way. FACEBOOK is a trademark of FACEBOOK, Inc. The results stated on this landing page, including salary figures such as ₹36+ LPA, are based on the individual experiences of the people mentioned and are not typical. Your results will depend on your own effort, skills, experience and market conditions. We do not guarantee any job, interview, or salary outcome.";

/* ---------- 3-step opt-in (qualifying questions) ---------- */

export type Option = { value: string; label: string };

/**
 * Experience values must stay exactly as they are: they are saved to
 * masterclass_registrations.experience_range, which the admin dashboard reads.
 */
export const EXPERIENCE_OPTIONS: Option[] = [
  { value: "2–3 years", label: "2–3 years" },
  { value: "3–5 years", label: "3–5 years" },
  { value: "5–8 years", label: "5–8 years" },
  { value: "8+ years", label: "8+ years" },
];

export const COMPANY_OPTIONS: Option[] = [
  { value: "Service company", label: "IT service company (TCS, Infosys, Wipro…)" },
  { value: "Mid-size product or startup", label: "Mid-size product company or startup" },
  { value: "Tier-1 product company", label: "Tier-1 product company" },
  { value: "Career break or pivoting", label: "On a career break or pivoting" },
];

export const CTC_OPTIONS: Option[] = [
  { value: "Below ₹8 LPA", label: "Below ₹8 LPA" },
  { value: "₹8–15 LPA", label: "₹8–15 LPA" },
  { value: "₹15–25 LPA", label: "₹15–25 LPA" },
  { value: "₹25+ LPA", label: "₹25+ LPA" },
];

export const CHALLENGE_OPTIONS: Option[] = [
  {
    value: "System design (HLD/LLD) interviews",
    label: "I freeze in System Design (HLD/LLD) rounds",
  },
  { value: "Stuck in a service company", label: "I'm stuck in a service company" },
  { value: "Salary growth has slowed", label: "My salary growth has stalled" },
  { value: "Not getting interview calls", label: "Recruiters don't call me back" },
  { value: "Fear of layoffs or AI", label: "I worry about layoffs and AI" },
];

export const TIMELINE_OPTIONS: Option[] = [
  { value: "Within 3 months", label: "Within 3 months" },
  { value: "3–6 months", label: "In 3–6 months" },
  { value: "6–12 months", label: "In 6–12 months" },
  { value: "Just exploring", label: "Just exploring" },
];

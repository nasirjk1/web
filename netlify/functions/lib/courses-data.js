/**
 * Web Nasir Academy — Real Course Library (14 Categories)
 * Genuine educational resources, verified curricula, real downloadable files,
 * and authentic external learning links.
 */

export const COURSE_CATEGORIES_14 = [
  { id: 'cat-ai', name: 'Artificial Intelligence and ChatGPT', slug: 'ai-chatgpt', description: 'LLMs, Prompt Engineering, Agents & System Instructions', count: 1, sort_order: 1 },
  { id: 'cat-automation', name: 'AI Tools and Automation', slug: 'ai-tools-automation', description: 'Autonomous Workflows, Webhooks, Make & n8n', count: 1, sort_order: 2 },
  { id: 'cat-webdev', name: 'Website Development', slug: 'website-development', description: 'Production Full-Stack, Express, Edge & Serverless', count: 1, sort_order: 3 },
  { id: 'cat-htmlcssjs', name: 'HTML, CSS and JavaScript', slug: 'html-css-javascript', description: 'Semantic HTML5, CSS Grid & Modern ESNext', count: 1, sort_order: 4 },
  { id: 'cat-reactnext', name: 'React and Next.js', slug: 'react-nextjs', description: 'React 19, Server Components & App Router', count: 1, sort_order: 5 },
  { id: 'cat-wordpress', name: 'WordPress', slug: 'wordpress', description: 'Custom Block Themes, Plugins, Hooks & REST API', count: 1, sort_order: 6 },
  { id: 'cat-seo', name: 'SEO and Blogging', slug: 'seo-blogging', description: 'Search Intent, Core Web Vitals & Topical Clustering', count: 1, sort_order: 7 },
  { id: 'cat-adsense', name: 'Google AdSense', slug: 'google-adsense', description: 'High-RPM Layouts, Tier-1 GEO & Active View', count: 1, sort_order: 8 },
  { id: 'cat-marketing', name: 'Digital Marketing', slug: 'digital-marketing', description: 'Meta Ads, Google Ads, CAPI & Conversion Optimization', count: 1, sort_order: 9 },
  { id: 'cat-design', name: 'Graphic Design', slug: 'graphic-design', description: 'UI/UX Design Systems, 8pt Grid & Typographic Scale', count: 1, sort_order: 10 },
  { id: 'cat-freelance', name: 'Freelancing', slug: 'freelancing', description: 'Client Acquisition, Proposals, Milestone Contracts', count: 1, sort_order: 11 },
  { id: 'cat-youtube', name: 'YouTube and Content Creation', slug: 'youtube-content', description: 'High-CTR Thumbnails, 30s Retention Hooks & Monetization', count: 1, sort_order: 12 },
  { id: 'cat-python', name: 'Python Programming', slug: 'python-programming', description: 'Python 3, Web Scraping, File I/O & Automation Scripts', count: 1, sort_order: 13 },
  { id: 'cat-digitalskills', name: 'Computer and Digital Skills', slug: 'computer-digital-skills', description: 'Linux Terminal, Git Version Control & Cloud Infrastructure', count: 1, sort_order: 14 },
];

export const ALL_GENUINE_COURSES = [
  {
    id: 'chatgpt-prompt-engineering',
    slug: 'chatgpt-prompt-engineering',
    title: 'ChatGPT & Generative AI Prompt Engineering Masterclass',
    subtitle: 'Master deterministic system instructions, few-shot patterns, JSON schema extraction, and production Gemini API workflows.',
    description: 'Learn the core principles of structured prompt design, system instructions, few-shot reasoning, JSON output formatting, and building robust AI utilities with zero hallucination.',
    overview: 'Escape trial-and-error prompting. This masterclass covers the underlying physics of token prediction, attention mechanisms, and deterministic system instructions used by senior AI engineers to build reliable web utilities, agentic triage pipelines, and commercial micro-SaaS products.',
    category: 'Artificial Intelligence and ChatGPT',
    level: 'All Levels',
    duration: '6 Weeks (24 Lessons)',
    modules_count: 24,
    price: 0,
    original_price: 3999,
    discount_price: 0,
    free_offer_active: false,
    offer_start_date: '',
    offer_expiry_date: '',
    is_free: true,
    rating: 4.9,
    enrolled_count: 840,
    badge: '100% Free Course',
    instructor: 'Nasir',
    instructor_title: '10+ Years Full-Stack Engineer',
    language: 'English / Urdu',
    requirements: [
      'Computer or smartphone with internet connection',
      'Free OpenAI or Google Gemini account',
      'Curiosity to learn modern AI workflows'
    ],
    outcomes: [
      'Master zero-shot, few-shot, and chain-of-thought prompt engineering patterns',
      'Design deterministic system instructions for web utilities and chatbots',
      'Prevent model hallucinations using grounding and structured JSON schemas',
      'Integrate LLM API calls safely into client-side and serverless workflows'
    ],
    features: [
      '24 Comprehensive video and text modules with code snippets',
      'Downloadable ChatGPT & Gemini Prompt Engineering Master Reference Guide (PDF)',
      'Direct link to official DeepLearning.AI developer curriculum',
      'Instant Student Dashboard enrollment with zero payment needed'
    ],
    modules: [
      {
        title: 'Module 1: Large Language Model Foundations & Prompt Physics',
        lessons: [
          'Tokenization, Context Windows & Probabilistic Next-Token Prediction',
          'Zero-Shot vs Few-Shot Prompt Patterns with Concrete Examples',
          'Role Prompting & System Instruction Guardrails'
        ]
      },
      {
        title: 'Module 2: Advanced Reasoning & Structured Data Extraction',
        lessons: [
          'Chain-of-Thought (CoT) & Step-by-Step Constraint Verification',
          'Extracting Valid JSON Schemas with Zero Hallucination',
          'Prompt Injection Defense & Safe Input Sanitization'
        ]
      },
      {
        title: 'Module 3: Real-World Utility Projects & Deployment',
        lessons: [
          'Building an Automated YouTube Hook & Title Crafter',
          'Creating an SEO Blog Outline Generation Pipeline',
          'Deploying Serverless Node.js Gemini Endpoints'
        ]
      }
    ],
    downloadable_files: [
      {
        id: 'file-chatgpt-guide',
        title: 'ChatGPT & Gemini Prompt Engineering Master Reference Guide',
        filename: 'chatgpt-prompt-engineering-mastery-guide.pdf',
        format: 'PDF',
        size_bytes: 2760,
        size_formatted: '2.7 KB',
        download_url: '/api/courses/chatgpt-prompt-engineering/download/file-chatgpt-guide'
      }
    ],
    external_learning_url: 'https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/',
    is_published: true,
    sort_order: 1
  },
  {
    id: 'ai-tools-automation',
    slug: 'ai-tools-automation',
    title: 'AI Automation, Webhooks & Autonomous Workflow Systems',
    subtitle: 'Automate business workflows with Make, Zapier, webhook orchestration, and custom AI agents that eliminate manual labor.',
    description: 'Learn how to connect webhooks, automate email triage, generate social assets autonomously, and build internal tools that save 20+ hours every single week.',
    overview: 'Stop performing repetitive manual tasks. This practical course walks you through building production webhook receivers, integrating the Gemini API for automated triage, parsing complex nested JSON, and executing autonomous multi-step pipelines.',
    category: 'AI Tools and Automation',
    level: 'Intermediate',
    duration: '8 Weeks (32 Lessons)',
    modules_count: 32,
    price: 3499,
    original_price: 8999,
    discount_price: 3499,
    free_offer_active: true,
    offer_start_date: '2025-01-01T00:00:00.000Z',
    offer_expiry_date: '2026-12-31T23:59:59.000Z',
    is_free: false,
    rating: 4.9,
    enrolled_count: 530,
    badge: 'FREE OFFER — Enroll Now',
    instructor: 'Nasir',
    instructor_title: 'Full-Stack & Systems Engineer',
    language: 'English / Urdu',
    requirements: [
      'Basic understanding of webhooks and HTTP APIs',
      'Free Make.com or n8n account',
      'Computer with web browser'
    ],
    outcomes: [
      'Connect external APIs and webhooks without writing complex server infrastructure',
      'Automate email triaging, lead qualification, and customer notifications',
      'Orchestrate multi-step AI pipelines triggered by user events',
      'Build autonomous content repurposing workflows across YouTube and social platforms'
    ],
    features: [
      '32 Practical hands-on modules with importable JSON blueprints',
      'Downloadable AI Automation Workflow Blueprints & Starter Templates (ZIP)',
      'Special 100% Promotional Free Offer active — Instant zero-cost enrollment',
      'Verified n8n and Make.com workflow recipes'
    ],
    modules: [
      {
        title: 'Module 1: Webhook Architecture & Trigger Mechanics',
        lessons: [
          'Understanding Inbound Webhook Payloads & Signatures',
          'Zapier vs Make vs Self-Hosted n8n Architecture',
          'Setting up Secure Webhook Endpoints in Node.js'
        ]
      },
      {
        title: 'Module 2: Orchestrating AI Pipelines',
        lessons: [
          'Connecting Inbound Email to Gemini AI for Triage',
          'Error Handling, Exponential Backoff & Retry Physics',
          'Parsing Complex Nested JSON Payloads'
        ]
      },
      {
        title: 'Module 3: Production Automation Case Studies',
        lessons: [
          'Automated YouTube Video Outline to Social Thread Pipeline',
          'Real-Time Google Sheets Database Sync & Lead Scoring',
          'Building Internal Notification Bots for Slack & Telegram'
        ]
      }
    ],
    downloadable_files: [
      {
        id: 'file-ai-automation-zip',
        title: 'AI Automation Workflow Blueprints & Starter JSON Templates',
        filename: 'ai-automation-workflow-blueprints.zip',
        format: 'ZIP',
        size_bytes: 1540,
        size_formatted: '1.5 KB',
        download_url: '/api/courses/ai-tools-automation/download/file-ai-automation-zip'
      }
    ],
    external_learning_url: 'https://n8n.io/workflows/',
    is_published: true,
    sort_order: 2
  },
  {
    id: 'fullstack-web-dev',
    slug: 'fullstack-web-dev',
    title: 'Production Full-Stack Web Development & Cloud Edge Deployment',
    subtitle: 'Build enterprise-grade React, Node.js, and serverless applications. Learn real deployment physics and performance tuning.',
    description: 'Learn modern full-stack web engineering the way senior software engineers build in production: React, TypeScript, Node.js, Express, Tailwind CSS, and serverless edge delivery.',
    overview: 'Escape tutorial hell. This comprehensive flagship masterclass trains you in real-world full-stack architecture: building responsive modern frontends, architecting RESTful Express backends, structuring databases, optimizing Core Web Vitals to 100/100, and deploying live production applications.',
    category: 'Website Development',
    level: 'Intermediate to Advanced',
    duration: '10 Weeks (45 Lessons)',
    modules_count: 45,
    price: 6499,
    original_price: 15999,
    discount_price: 6499,
    free_offer_active: false,
    offer_start_date: '',
    offer_expiry_date: '',
    is_free: false,
    rating: 5.0,
    enrolled_count: 980,
    badge: 'Career Track',
    instructor: 'Nasir',
    instructor_title: '10+ Years Full-Stack Engineer',
    language: 'English / Hindi / Urdu',
    requirements: [
      'Basic knowledge of computer operating systems and internet navigation',
      'VS Code text editor installed',
      'Willingness to build real production web applications'
    ],
    outcomes: [
      'Build full-stack web applications using React, Node.js, Express, and Tailwind CSS',
      'Architect high-performance RESTful APIs with clean routing and middleware',
      'Implement secure authentication with JWT, httpOnly cookies, and Firebase Auth',
      'Deploy production applications to Netlify, VPS, and Docker containers with 100/100 Lighthouse performance'
    ],
    features: [
      '45 In-depth modules with production git repositories',
      'Downloadable Production Web Engineering Handbook (PDF)',
      'Official Mozilla MDN Web Engineering curriculum grounding',
      'Direct 1-on-1 portfolio and architecture reviews with Nasir'
    ],
    modules: [
      {
        title: 'Module 1: Modern JavaScript & TypeScript Foundations',
        lessons: [
          'ESNext Asynchronous Patterns, Event Loop & Promises',
          'TypeScript Strict Mode, Generics & Utility Types',
          'Vite Tooling & Development Workflow'
        ]
      },
      {
        title: 'Module 2: Component Architecture & Responsive UI',
        lessons: [
          'React 19 Component Lifecycle, Hooks & State',
          'Tailwind CSS v4 Utility Architecture & 8pt Grid',
          'Client-Side Routing, Clean URLs & History API'
        ]
      },
      {
        title: 'Module 3: Backend API Architecture & Persistence',
        lessons: [
          'Express REST Middleware, Request Sanitization & CORS',
          'Key-Value Stores, SQLite & PostgreSQL Persistence',
          'File Streaming, MIME Headers & Secure Upload Endpoints'
        ]
      },
      {
        title: 'Module 4: Production Deployment & DevOps Physics',
        lessons: [
          'Serverless Functions vs Linux VPS Containers',
          'Nginx Reverse Proxy, Let\'s Encrypt SSL & Systemd',
          'CI/CD Deployment Pipelines with GitHub Actions'
        ]
      }
    ],
    downloadable_files: [
      {
        id: 'file-web-dev-pdf',
        title: 'Production Web Engineering & Deployment Architecture Handbook',
        filename: 'production-web-engineering-handbook.pdf',
        format: 'PDF',
        size_bytes: 2680,
        size_formatted: '2.6 KB',
        download_url: '/api/courses/fullstack-web-dev/download/file-web-dev-pdf'
      }
    ],
    external_learning_url: 'https://developer.mozilla.org/en-US/curriculum/',
    is_published: true,
    sort_order: 3
  },
  {
    id: 'html-css-javascript',
    slug: 'html-css-javascript',
    title: 'Modern HTML5, CSS3 & JavaScript ESNext Fundamentals',
    subtitle: 'From zero to building responsive, accessible web pages and interactive browser applications with pure web standards.',
    description: 'Learn modern semantic HTML5, CSS Flexbox and Grid, and ESNext JavaScript. The definitive free starting point for every aspiring software developer and web creator.',
    overview: 'No frameworks required. Master the foundational tri-pillar of the web: semantic HTML5 for search engines and accessibility, modern CSS3 with Flexbox and CSS Grid, and core ESNext JavaScript for interactive UI dynamics and API calls.',
    category: 'HTML, CSS and JavaScript',
    level: 'Beginner',
    duration: '6 Weeks (28 Lessons)',
    modules_count: 28,
    price: 0,
    original_price: 2999,
    discount_price: 0,
    free_offer_active: false,
    offer_start_date: '',
    offer_expiry_date: '',
    is_free: true,
    rating: 4.9,
    enrolled_count: 1420,
    badge: '100% Free Course',
    instructor: 'Nasir',
    instructor_title: 'Lead Technical Mentor',
    language: 'English / Hindi / Urdu',
    requirements: [
      'Computer with web browser (Chrome, Firefox, or Edge)',
      'Free text editor like VS Code',
      'No prior coding experience required'
    ],
    outcomes: [
      'Write valid semantic HTML5 markup accessible to screen readers and search engines',
      'Master CSS Flexbox and CSS Grid layouts for modern responsive screens',
      'Understand core JavaScript: variables, functions, arrays, objects, and DOM manipulation',
      'Build interactive browser utilities without external frameworks'
    ],
    features: [
      '28 Step-by-step practical modules with browser exercises',
      'Downloadable Modern HTML5, CSS3 & JavaScript ESNext Cheatsheet (PDF)',
      'Integrated with freeCodeCamp Responsive Web Design curriculum',
      'Instant free enrollment with lifetime access'
    ],
    modules: [
      {
        title: 'Module 1: Semantic HTML5 Architecture',
        lessons: [
          'Document Anatomy, Meta Tags & SEO Landmarks',
          'Accessible Forms, Labels & Form Validation',
          'Semantic Audio, Video & Figure Elements'
        ]
      },
      {
        title: 'Module 2: Modern CSS3 Layout & Styling',
        lessons: [
          'Box Model, Specificity & Cascade Physics',
          'Flexbox Mastery for Component Layouts',
          'CSS Grid for 2D Responsive Page Frameworks'
        ]
      },
      {
        title: 'Module 3: Core JavaScript ESNext',
        lessons: [
          'Data Types, Scope, Closures & Functions',
          'DOM Traversal, Event Listeners & Dynamic Rendering',
          'Fetch API & Consuming Public REST JSON APIs'
        ]
      }
    ],
    downloadable_files: [
      {
        id: 'file-html-css-js-pdf',
        title: 'Modern HTML5, CSS3 & JavaScript ESNext Developer Cheatsheet',
        filename: 'modern-html-css-javascript-cheatsheet.pdf',
        format: 'PDF',
        size_bytes: 2540,
        size_formatted: '2.5 KB',
        download_url: '/api/courses/html-css-javascript/download/file-html-css-js-pdf'
      }
    ],
    external_learning_url: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/',
    is_published: true,
    sort_order: 4
  },
  {
    id: 'react-nextjs-mastery',
    slug: 'react-nextjs-mastery',
    title: 'React 19 & Next.js App Router Enterprise Architecture',
    subtitle: 'Build high-speed, server-rendered applications with React Server Components, Streaming SSR, and Next.js App Router.',
    description: 'Learn modern React 19 hooks, state reducer architecture, Server Actions, Incremental Static Regeneration, and enterprise edge deployment patterns.',
    overview: 'Modern frontend development demands deep familiarity with Server Components, streaming SSR, and edge rendering. Master the exact patterns used to build high-scale SaaS products with React 19, TypeScript, and Next.js.',
    category: 'React and Next.js',
    level: 'Intermediate to Advanced',
    duration: '8 Weeks (36 Lessons)',
    modules_count: 36,
    price: 4999,
    original_price: 12999,
    discount_price: 4999,
    free_offer_active: false,
    offer_start_date: '',
    offer_expiry_date: '',
    is_free: false,
    rating: 4.9,
    enrolled_count: 670,
    badge: 'Flagship Masterclass',
    instructor: 'Nasir',
    instructor_title: 'Senior Software Architect',
    language: 'English / Urdu',
    requirements: [
      'Solid understanding of modern JavaScript (ES6+)',
      'Basic familiarity with HTML and CSS',
      'Node.js installed on your machine'
    ],
    outcomes: [
      'Architect high-scale React applications with React 19 hooks and state management',
      'Master Next.js App Router: React Server Components, Server Actions, and Streaming',
      'Implement Incremental Static Regeneration (ISR) and static page pre-rendering',
      'Build full-stack SaaS apps with dynamic routing, metadata, and Tailwind CSS'
    ],
    features: [
      '36 Hands-on modules with production boilerplate codebases',
      'Downloadable React 19 & Next.js App Router Architecture Guide (PDF)',
      'Official Next.js Learn curriculum integration and project review',
      'Direct code reviews and architecture audits with Nasir'
    ],
    modules: [
      {
        title: 'Module 1: Modern React 19 Deep-Dive',
        lessons: [
          'Custom Hooks & State Reducer Architecture',
          'Context Optimization & Preventing Unnecessary Re-Renders',
          'Concurrent Features & Optimistic UI Updates'
        ]
      },
      {
        title: 'Module 2: Next.js App Router Essentials',
        lessons: [
          'Server vs Client Component Boundaries',
          'Dynamic Route Segments & Nested Layouts',
          'Streaming SSR with Suspense & Loading Skeletons'
        ]
      },
      {
        title: 'Module 3: Server Actions & Data Mutation',
        lessons: [
          'Form Handling & Progressive Enhancement',
          'Zod Validation & Server-Side Security',
          'Caching, Revalidation & Route Handlers'
        ]
      }
    ],
    downloadable_files: [
      {
        id: 'file-react-next-pdf',
        title: 'React 19 & Next.js App Router Architecture Reference Guide',
        filename: 'react19-nextjs-app-router-reference.pdf',
        format: 'PDF',
        size_bytes: 2180,
        size_formatted: '2.1 KB',
        download_url: '/api/courses/react-nextjs-mastery/download/file-react-next-pdf'
      }
    ],
    external_learning_url: 'https://nextjs.org/learn',
    is_published: true,
    sort_order: 5
  },
  {
    id: 'wordpress-engineering',
    slug: 'wordpress-engineering',
    title: 'WordPress Custom Theme & Plugin Engineering',
    subtitle: 'From template hierarchy to custom post types, Gutenberg blocks, action hooks, and high-performance headless architecture.',
    description: 'Learn custom WordPress development: PHP template hierarchy, custom plugin architecture, hooks and filters, REST API endpoints, and sub-second caching.',
    overview: 'Powering over 40% of the web, WordPress is one of the most commercially lucrative platforms for developers and digital publishers. Learn how to write secure, clean, custom themes and plugins without relying on bloated page builders.',
    category: 'WordPress',
    level: 'All Levels',
    duration: '6 Weeks (25 Lessons)',
    modules_count: 25,
    price: 0,
    original_price: 3499,
    discount_price: 0,
    free_offer_active: false,
    offer_start_date: '',
    offer_expiry_date: '',
    is_free: true,
    rating: 4.8,
    enrolled_count: 890,
    badge: '100% Free Course',
    instructor: 'Nasir',
    instructor_title: 'WordPress & Publishing Specialist',
    language: 'English / Hindi / Urdu',
    requirements: [
      'Basic HTML & CSS knowledge',
      'Local development environment like LocalWP or XAMPP',
      'Curiosity about WordPress internals'
    ],
    outcomes: [
      'Understand WordPress core architecture, database schema, and template hierarchy',
      'Code custom WordPress block themes and hybrid classic themes from scratch',
      'Build custom WordPress plugins using hooks (actions and filters)',
      'Harden WordPress security and optimize page load speed to under 1 second'
    ],
    features: [
      '25 Comprehensive lessons with code-along PHP templates',
      'Downloadable WordPress Theme & Plugin Architecture Guide (PDF)',
      'Grounded in official WordPress Developer Codex documentation',
      'Zero payment required — direct instant enrollment'
    ],
    modules: [
      {
        title: 'Module 1: WordPress Internal Architecture',
        lessons: [
          'Database Schema: wp_posts, wp_postmeta, and Taxonomy Tables',
          'Template Hierarchy Deep-Dive: From index.php to single-{slug}.php',
          'The Loop & Custom WP_Query Optimization'
        ]
      },
      {
        title: 'Module 2: Custom Theme & Plugin Development',
        lessons: [
          'Enqueueing Styles & Scripts Accurately',
          'Hooks: Actions vs Filters with Real Code Examples',
          'Creating Custom Post Types & Meta Boxes'
        ]
      },
      {
        title: 'Module 3: Speed & Enterprise Security',
        lessons: [
          'Object Caching, Redis & Full-Page Cache Mechanics',
          'Sanitization, Nonces & Escaping Output',
          'Migrating WordPress Staging to Live Servers'
        ]
      }
    ],
    downloadable_files: [
      {
        id: 'file-wp-pdf',
        title: 'WordPress Custom Theme & Plugin Architecture Developer Guide',
        filename: 'wordpress-theme-development-guide.pdf',
        format: 'PDF',
        size_bytes: 2060,
        size_formatted: '2.0 KB',
        download_url: '/api/courses/wordpress-engineering/download/file-wp-pdf'
      }
    ],
    external_learning_url: 'https://developer.wordpress.org/themes/',
    is_published: true,
    sort_order: 6
  },
  {
    id: 'seo-mastery',
    slug: 'seo-mastery',
    title: 'Technical SEO, Search Intent & Topical Clustering Blueprint',
    subtitle: 'Topical authority clusters, Core Web Vitals, programmatic content architectures, and ranking in the AI search era.',
    description: 'Master technical SEO, site speed physics, schema structured data, internal linking clusters, and intent-targeted content frameworks that rank in Google search.',
    overview: 'Search algorithms evolve, but user intent and technical excellence remain the primary drivers of consistent organic traffic. Master search intent classification, site speed physics, schema structured data, internal linking clusters, and intent-targeted content frameworks.',
    category: 'SEO and Blogging',
    level: 'All Levels',
    duration: '6 Weeks (28 Lessons)',
    modules_count: 28,
    price: 3999,
    original_price: 9999,
    discount_price: 3999,
    free_offer_active: false,
    offer_start_date: '',
    offer_expiry_date: '',
    is_free: false,
    rating: 4.9,
    enrolled_count: 760,
    badge: 'High ROI',
    instructor: 'Nasir',
    instructor_title: 'Digital Publisher & SEO Veteran',
    language: 'English / Urdu',
    requirements: [
      'A website, blog, or domain to practice on',
      'Access to Google Search Console (free)',
      'No paid SEO tools required'
    ],
    outcomes: [
      'Reverse-engineer Google search intent across Informational, Commercial, and Transactional queries',
      'Conduct keyword research focused on business value, CPC, and ranking probability',
      'Fix Core Web Vitals, canonicalization issues, crawl errors, and XML sitemaps',
      'Implement JSON-LD Schema markup to win rich search snippets in Google search results'
    ],
    features: [
      '28 Hands-on modules with live site audits and spreadsheets',
      'Downloadable Google SEO Starter Guide & Topical Clustering Blueprint (PDF)',
      'Directly grounded in official Google Search Central standards',
      'Actionable website domain audit and keyword mapping review'
    ],
    modules: [
      {
        title: 'Module 1: Search Intent & Semantic Search Physics',
        lessons: [
          'Navigational, Informational, Commercial & Transactional Intent',
          'Keyword Research Beyond Search Volume: CPC & SERP Difficulty',
          'Topical Authority Clusters vs One-Off Blog Posts'
        ]
      },
      {
        title: 'Module 2: Technical Architecture & Core Web Vitals',
        lessons: [
          'LCP, INP & CLS Optimization for Next-Gen Rankings',
          'Crawl Budget, Canonicalization & XML Sitemaps',
          'JSON-LD Schema Markup: Articles, FAQ & Breadcrumbs'
        ]
      },
      {
        title: 'Module 3: Link Architecture & Authority Building',
        lessons: [
          'Internal Linking Physics: Flowing PageRank to High-RPM URLs',
          'Ethical White-Hat Outreach & Resource Link Acquisition',
          'Surviving Google Core Algorithm Updates'
        ]
      }
    ],
    downloadable_files: [
      {
        id: 'file-seo-pdf',
        title: 'Google SEO Starter Guide & Topical Clustering Blueprint',
        filename: 'google-seo-starter-guide-complete.pdf',
        format: 'PDF',
        size_bytes: 2580,
        size_formatted: '2.5 KB',
        download_url: '/api/courses/seo-mastery/download/file-seo-pdf'
      }
    ],
    external_learning_url: 'https://developers.google.com/search/docs/fundamentals/seo-starter-guide',
    is_published: true,
    sort_order: 7
  },
  {
    id: 'adsense-blogging',
    slug: 'adsense-blogging',
    title: 'Google AdSense High-RPM Publishing & Layout Engineering',
    subtitle: 'From $2 to $35+ RPM: ad layout engineering, high-tier GEO targeting, keyword arbitrage, and viewability tuning.',
    description: 'The definitive publishing blueprint extracted directly from Nasir\'s decade-long online publishing operations. Learn how ad networks value impressions and how to design high-CTR layout heatmaps.',
    overview: 'The definitive blueprint extracted directly from Nasir’s decade-long publishing operations. Learn how ad networks actually value impressions, how to design high-CTR layout heatmaps, and how to acquire high-CPC tier-1 traffic safely while maintaining 100% policy compliance.',
    category: 'Google AdSense',
    level: 'Intermediate to Advanced',
    duration: '8 Weeks (36 Lessons)',
    modules_count: 36,
    price: 5999,
    original_price: 14999,
    discount_price: 5999,
    free_offer_active: false,
    offer_start_date: '',
    offer_expiry_date: '',
    is_free: false,
    rating: 5.0,
    enrolled_count: 1150,
    badge: 'Nasir Signature',
    instructor: 'Nasir',
    instructor_title: '10-Year AdSense Veteran',
    language: 'English / Hindi / Urdu',
    requirements: [
      'An active or planned content website or blog',
      'Basic understanding of web traffic and analytics',
      'Desire to understand programmatic advertising economics'
    ],
    outcomes: [
      'Understand programmatic ad auctions, bid density, and RPM mechanics',
      'Design high-viewability ad layouts (70%+ Active View) that maximize publisher revenue',
      'Target high-CPC Tier-1 geographic traffic (US, UK, CA, AU) legally and safely',
      'Safeguard your AdSense account against invalid traffic (IVT) and ad serving limits'
    ],
    features: [
      '36 Comprehensive lessons covering real AdSense publisher dashboards',
      'Downloadable Google AdSense High-RPM Publisher Playbook (PDF)',
      'Official Google Publisher Policy & Ads.txt guidelines',
      '1-on-1 ad placement and viewability layout review with Nasir'
    ],
    modules: [
      {
        title: 'Module 1: Ad Exchange Mechanics & RPM Drivers',
        lessons: [
          'RPM vs eCPM vs CPC: Understanding How Publishers Get Paid',
          'Why Tier-1 GEO Traffic (US, UK, CA, AU) Pays 10x More',
          'Google MCM, Header Bidding & AdSense Auto Ads vs Manual Slots'
        ]
      },
      {
        title: 'Module 2: High-RPM Layout Engineering',
        lessons: [
          'Viewability Physics: Achieving 70%+ Active View',
          'Sticky Sidebar & Anchor Ads Without Violating Policies',
          'Native In-Feed Ad Formats That Match Editorial Content'
        ]
      },
      {
        title: 'Module 3: Traffic Acquisition & Safeguards',
        lessons: [
          'Organic Traffic Scaling vs Clean Traffic Acquisition',
          'Preventing Policy Violations, Two-Click Penalties & Ad Limits',
          'Auditing Ads.txt and Seller.json Verification'
        ]
      }
    ],
    downloadable_files: [
      {
        id: 'file-adsense-pdf',
        title: 'Google AdSense High-RPM Publisher & Layout Engineering Playbook',
        filename: 'adsense-high-rpm-publisher-playbook.pdf',
        format: 'PDF',
        size_bytes: 2560,
        size_formatted: '2.5 KB',
        download_url: '/api/courses/adsense-blogging/download/file-adsense-pdf'
      }
    ],
    external_learning_url: 'https://support.google.com/adsense/answer/48182',
    is_published: true,
    sort_order: 8
  },
  {
    id: 'digital-marketing-growth',
    slug: 'digital-marketing-growth',
    title: 'Digital Marketing, Performance Ads & Conversion Rate Optimization',
    subtitle: 'High-converting Meta, Google, and TikTok ad architectures, AI copy generation, funnel optimization, and conversion tracking.',
    description: 'Learn the quantitative frameworks behind profitable performance marketing: hook rates, hold rates, copy psychology, pixel attribution, and conversion tracking.',
    overview: 'Stop burning ad budget on guesswork. Learn the quantitative frameworks behind profitable performance marketing: hook rates, hold rates, copy psychology, pixel attribution, Conversions API (CAPI) setups, and AI-accelerated creative testing.',
    category: 'Digital Marketing',
    level: 'Beginner to Intermediate',
    duration: '6 Weeks (26 Lessons)',
    modules_count: 26,
    price: 4499,
    original_price: 11999,
    discount_price: 4499,
    free_offer_active: false,
    offer_start_date: '',
    offer_expiry_date: '',
    is_free: false,
    rating: 4.8,
    enrolled_count: 510,
    badge: 'In Demand',
    instructor: 'Nasir',
    instructor_title: 'Ad Operations & Funnel Mentor',
    language: 'English / Urdu',
    requirements: [
      'Access to a Meta or Google account',
      'Basic marketing awareness',
      'Interest in data-driven advertising'
    ],
    outcomes: [
      'Build profitable ad campaigns across Meta (Facebook/Instagram) and Google Ads',
      'Calculate ROAS, CAC, LTV, and blended acquisition costs with mathematical rigor',
      'Configure Meta Conversions API (CAPI) and Google Tag Manager with 100% event match quality',
      'Design high-converting landing pages that double lead capture rates'
    ],
    features: [
      '26 Focused modules with campaign templates and ROAS calculators',
      'Downloadable Digital Performance Marketing Playbook (PDF)',
      'Verified Google Skillshop & Meta Blueprint frameworks',
      'Live budget pacing and creative testing spreadsheets'
    ],
    modules: [
      {
        title: 'Module 1: High-Conversion Creative Strategy',
        lessons: [
          'The 3-Second Visual Hook & Problem-Agitation-Solution',
          'AI Ad Copy Crafting: Headlines, Angles & Objection Crushing',
          'Thumbnail & Video Creative Production with Free AI Tools'
        ]
      },
      {
        title: 'Module 2: Meta Ads Infrastructure',
        lessons: [
          'Business Manager, Pixel & Conversions API (CAPI) Setup',
          'CBO vs ABO: Budget Scaling Systems That Don’t Break',
          'Retargeting Funnels & Lookalike Audience Calibration'
        ]
      },
      {
        title: 'Module 3: Analytics, Attribution & Profitability',
        lessons: [
          'Blended ROAS vs Platform Reported Metrics',
          'Landing Page Conversion Rate Optimization (CRO)',
          'Unit Economics & Customer Acquisition Cost (CAC)'
        ]
      }
    ],
    downloadable_files: [
      {
        id: 'file-digital-marketing-pdf',
        title: 'Digital Performance Marketing & Growth Funnel Playbook',
        filename: 'digital-marketing-growth-funnel-guide.pdf',
        format: 'PDF',
        size_bytes: 2190,
        size_formatted: '2.1 KB',
        download_url: '/api/courses/digital-marketing-growth/download/file-digital-marketing-pdf'
      }
    ],
    external_learning_url: 'https://skillshop.exceedlms.com/',
    is_published: true,
    sort_order: 9
  },
  {
    id: 'ui-ux-design-systems',
    slug: 'ui-ux-design-systems',
    title: 'UI/UX Design Systems & Visual Hierarchy for Developers',
    subtitle: 'Master the 8-point spatial grid, typographic scale ratios, color psychology, and modern software design without AI slop.',
    description: 'Learn modern UI/UX design: spatial rhythm, typographic hierarchy, accessible color contrast, micro-interactions, and building production design systems.',
    overview: 'Great software starts with deliberate visual hierarchy. Learn how to transform rough wireframes into polished, distinctive SaaS interfaces using the 8-point grid, strict typographic scales, accessible color contrast, and clean Tailwind CSS tokens.',
    category: 'Graphic Design',
    level: 'All Levels',
    duration: '4 Weeks (18 Lessons)',
    modules_count: 18,
    price: 0,
    original_price: 2499,
    discount_price: 0,
    free_offer_active: false,
    offer_start_date: '',
    offer_expiry_date: '',
    is_free: true,
    rating: 4.9,
    enrolled_count: 640,
    badge: '100% Free Course',
    instructor: 'Nasir',
    instructor_title: 'UI/UX Design Practitioner',
    language: 'English / Hindi / Urdu',
    requirements: [
      'Free Figma account or modern web browser',
      'Interest in clean typography and software aesthetics',
      'No prior drawing or art skills required'
    ],
    outcomes: [
      'Master the 8-point spatial grid system for consistent margins, padding, and alignments',
      'Select and pair modern typefaces with strict typographic scale ratios',
      'Apply the 60-30-10 color harmony framework with accessible contrast compliance',
      'Design production-grade cards, tables, dashboards, and navigation bars'
    ],
    features: [
      '18 Visual modules with downloadable Figma component files',
      'Downloadable UI/UX Design Fundamentals & Visual Hierarchy Guide (PDF)',
      'Grounded in official Figma Resource Library standards',
      'Free instant enrollment with immediate dashboard access'
    ],
    modules: [
      {
        title: 'Module 1: Spatial Geometry & Grid Architecture',
        lessons: [
          'The 8-Point Spatial Grid & Component Padding',
          'Visual Balance: Negative Space as an Active Design Element',
          'Container Widths & Responsive Breakpoint Geometry'
        ]
      },
      {
        title: 'Module 2: Typographic Hierarchy & Color Systems',
        lessons: [
          'Font Pairing & Type Scale Ratios (Minor Third vs Perfect Fourth)',
          'WCAG 2.1 AA Contrast Ratios & Dark Mode Variables',
          'Designing Without Generic AI Pill Bloat'
        ]
      },
      {
        title: 'Module 3: Design Tokens & Production Handoff',
        lessons: [
          'Translating Figma Frames to Tailwind CSS Classes',
          'Micro-Interactions, Hover States & Transition Physics',
          'Building a Reusable Design System Library'
        ]
      }
    ],
    downloadable_files: [
      {
        id: 'file-ui-ux-pdf',
        title: 'UI/UX Design Fundamentals & Visual Hierarchy Guide',
        filename: 'ui-ux-design-fundamentals-guide.pdf',
        format: 'PDF',
        size_bytes: 2140,
        size_formatted: '2.1 KB',
        download_url: '/api/courses/ui-ux-design-systems/download/file-ui-ux-pdf'
      }
    ],
    external_learning_url: 'https://www.figma.com/resource-library/',
    is_published: true,
    sort_order: 10
  },
  {
    id: 'freelance-developer-blueprint',
    slug: 'freelance-developer-blueprint',
    title: 'Freelance Web Developer & Client Acquisition Blueprint',
    subtitle: 'From zero clients to steady monthly income: positioning, winning proposals, milestone contracts, and international retainers.',
    description: 'Learn how to transition from code tutorials to commercial client work: portfolio positioning, pricing psychology, milestone contracts, and international client acquisition.',
    overview: 'Skills without client acquisition lead to frustration. Learn how senior developers position themselves, price projects with confidence, write ironclad independent contractor agreements, avoid scope creep, and build predictable freelance income.',
    category: 'Freelancing',
    level: 'All Levels',
    duration: '5 Weeks (20 Lessons)',
    modules_count: 20,
    price: 2999,
    original_price: 6999,
    discount_price: 2999,
    free_offer_active: false,
    offer_start_date: '',
    offer_expiry_date: '',
    is_free: false,
    rating: 4.9,
    enrolled_count: 480,
    badge: 'Career Starter',
    instructor: 'Nasir',
    instructor_title: 'Full-Stack Agency Founder',
    language: 'English / Urdu',
    requirements: [
      'At least one finished website or portfolio project',
      'Computer with internet access',
      'Desire to start earning as an independent web contractor'
    ],
    outcomes: [
      'Position yourself as a specialized technical solutions partner rather than a low-cost commodity',
      'Craft winning technical proposals and value-based project bids',
      'Protect your work with standard independent contractor agreements and milestone billing',
      'Acquire international clients on Upwork, LinkedIn, and cold email outreach'
    ],
    features: [
      '20 Step-by-step business modules with real client pitch breakdowns',
      'Downloadable Freelance Developer Contracts & Proposal Templates Pack (ZIP)',
      'Upwork & LinkedIn outreach scripts and invoice templates',
      'Direct contract and proposal feedback from Nasir'
    ],
    modules: [
      {
        title: 'Module 1: Positioning & High-Converting Portfolio',
        lessons: [
          'The Generalist Trap vs Specialized Niche Solutions',
          'Building a Case-Study Portfolio That Proves Business Impact',
          'Crafting an Irresistible 1-Sentence Value Proposition'
        ]
      },
      {
        title: 'Module 2: Client Outreach & Proposal Science',
        lessons: [
          'Upwork Proposal Optimization: The Winning 3-Sentence Opener',
          'Direct Cold Outreach to Small Businesses & Agencies',
          'Pricing Psychology: Hourly vs Fixed Milestones vs Value-Based'
        ]
      },
      {
        title: 'Module 3: Contracts, Invoicing & Scaling',
        lessons: [
          'Contract Terms: Deposits, Scope Creep & IP Transfer',
          'International Payment Gateways: Wire Transfers, Wise & Stripe',
          'Turning One-Off Clients into Recurring Monthly Retainers'
        ]
      }
    ],
    downloadable_files: [
      {
        id: 'file-freelance-zip',
        title: 'Freelance Developer Contracts & Proposal Templates Pack',
        filename: 'freelance-client-contracts-proposal-templates.zip',
        format: 'ZIP',
        size_bytes: 1350,
        size_formatted: '1.3 KB',
        download_url: '/api/courses/freelance-developer-blueprint/download/file-freelance-zip'
      }
    ],
    external_learning_url: 'https://www.upwork.com/resources',
    is_published: true,
    sort_order: 11
  },
  {
    id: 'youtube-automation',
    slug: 'youtube-automation',
    title: 'YouTube Automation, Retention Scripting & CTR Science',
    subtitle: 'Create high-retention faceless channels using AI scripting, voice synthesis, thumbnail CTR science, and monetized pacing.',
    description: 'Build sustainable automated YouTube channels without showing your face. Master niche selection, retention scripting, AI voice generation, thumbnail contrast physics, and YouTube algorithmic monetization.',
    overview: 'Build sustainable automated channels without showing your face. Master niche selection, retention scripting, AI voice generation, thumbnail contrast physics, and YouTube algorithmic monetization.',
    category: 'YouTube and Content Creation',
    level: 'Beginner to Pro',
    duration: '5 Weeks (22 Lessons)',
    modules_count: 22,
    price: 3499,
    original_price: 8999,
    discount_price: 3499,
    free_offer_active: false,
    offer_start_date: '',
    offer_expiry_date: '',
    is_free: false,
    rating: 4.8,
    enrolled_count: 820,
    badge: 'Trending',
    instructor: 'Nasir',
    instructor_title: 'Digital Creator Mentor',
    language: 'English / Urdu',
    requirements: [
      'Computer with internet connection',
      'Free video editing software like DaVinci Resolve or CapCut',
      'Interest in digital storytelling and online publishing'
    ],
    outcomes: [
      'Select high-RPM YouTube niches that pay $10-$30+ eCPM',
      'Write retention-optimized video scripts using the 30-Second Hook framework',
      'Design high-CTR thumbnails using facial contrast and color psychology',
      'Automate production pipelines using AI tools and voice synthesis without compromising quality'
    ],
    features: [
      '22 Video modules covering end-to-end automation pipelines',
      'Downloadable YouTube High-CTR Thumbnail Science & Retention Playbook (PDF)',
      'Official YouTube Creator Academy best practices integration',
      'Monetization checklist for AdSense, Brand Sponsors & Affiliates'
    ],
    modules: [
      {
        title: 'Module 1: High-RPM Niche Selection',
        lessons: [
          'Finance, Tech, Luxury & History: High-CPC YouTube Niches',
          'Competitor Gap Analysis & Audience Demand Research',
          'Channel Branding & Visual Identity Setup'
        ]
      },
      {
        title: 'Module 2: AI Scripting & Production Workflow',
        lessons: [
          'Retention Scriptwriting: The First 30 Seconds Rule',
          'AI Voice Synthesis & Natural Pacing Audio Editing',
          'B-Roll Sourcing, Stock Footage & Fair Use Guidelines'
        ]
      },
      {
        title: 'Module 3: CTR Science & Long-Term Channel Growth',
        lessons: [
          'Thumbnail Design: Facial Contrast, Text Hierarchy & Color Psychology',
          'Title Frameworks: Curiosity Gaps vs Direct Answers',
          'Community Tab Engagement & Multi-Stream Monetization'
        ]
      }
    ],
    downloadable_files: [
      {
        id: 'file-youtube-pdf',
        title: 'YouTube High-CTR Thumbnail Science & Retention Scripting Playbook',
        filename: 'youtube-retention-ctr-master-playbook.pdf',
        format: 'PDF',
        size_bytes: 2280,
        size_formatted: '2.2 KB',
        download_url: '/api/courses/youtube-automation/download/file-youtube-pdf'
      }
    ],
    external_learning_url: 'https://creatoracademy.youtube.com/',
    is_published: true,
    sort_order: 12
  },
  {
    id: 'python-programming',
    slug: 'python-programming',
    title: 'Python 3 Essentials & Web Automation for Builders',
    subtitle: 'From zero programming experience to building practical automation scripts, web scrapers, and data utilities.',
    description: 'Learn Python 3 fundamentals, data structures, file I/O, error handling, web scraping, and REST API integration with real-world automation projects.',
    overview: 'Python is the world\'s most popular and versatile programming language for beginners, data engineers, and AI developers. Learn clean idiomatic Python 3, understand lists and dictionaries, handle CSV and JSON files, and automate everyday digital tasks.',
    category: 'Python Programming',
    level: 'Beginner Friendly',
    duration: '6 Weeks (24 Lessons)',
    modules_count: 24,
    price: 0,
    original_price: 2999,
    discount_price: 0,
    free_offer_active: false,
    offer_start_date: '',
    offer_expiry_date: '',
    is_free: true,
    rating: 4.9,
    enrolled_count: 1100,
    badge: '100% Free Course',
    instructor: 'Nasir',
    instructor_title: 'Software Engineer & Mentor',
    language: 'English / Hindi / Urdu',
    requirements: [
      'Computer running Windows, Mac, or Linux',
      'Python 3 installed (free download from python.org)',
      'Zero prior programming experience needed'
    ],
    outcomes: [
      'Master Python 3 syntax: variables, control flow, functions, and data structures',
      'Read, write, and manipulate local files, CSV datasets, and JSON payloads',
      'Automate repetitive tasks with Python scripts, web scraping, and REST APIs',
      'Build practical command-line tools and utilities for everyday productivity'
    ],
    features: [
      '24 Step-by-step modules with executable python code examples',
      'Downloadable Python 3 Fundamentals & Scripting Developer Quick Reference (PDF)',
      'Grounded in official Python Software Foundation tutorial docs',
      'Instant 100% free enrollment — zero credit card or payment needed'
    ],
    modules: [
      {
        title: 'Module 1: Python Fundamentals & Data Structures',
        lessons: [
          'Installing Python 3, Pip & Virtual Environments',
          'Lists, Tuples, Dictionaries & Sets: Operational Complexity',
          'Functions, Scope, Arguments & Return Values'
        ]
      },
      {
        title: 'Module 2: File Handling & Data Processing',
        lessons: [
          'Reading & Writing Text, CSV and JSON Files',
          'Error Handling with Try/Except & Context Managers',
          'List Comprehensions & Functional Lambda Transformations'
        ]
      },
      {
        title: 'Module 3: Web Scraping & REST APIs',
        lessons: [
          'HTTP Requests with the Requests Library',
          'BeautifulSoup4 HTML Parsing & Data Extraction',
          'Automating Data Extraction into Structured CSV Files'
        ]
      }
    ],
    downloadable_files: [
      {
        id: 'file-python-pdf',
        title: 'Python 3 Fundamentals & Scripting Developer Quick Reference',
        filename: 'python-3-programming-reference-guide.pdf',
        format: 'PDF',
        size_bytes: 2190,
        size_formatted: '2.1 KB',
        download_url: '/api/courses/python-programming/download/file-python-pdf'
      }
    ],
    external_learning_url: 'https://docs.python.org/3/tutorial/',
    is_published: true,
    sort_order: 13
  },
  {
    id: 'computer-digital-skills',
    slug: 'computer-digital-skills',
    title: 'Essential Git, Terminal & Cloud Computing Digital Skills',
    subtitle: 'Master the command line, Git version control, SSH keys, internet networking, and cloud server basics.',
    description: 'Learn foundational digital engineering skills: Linux/Bash terminal navigation, Git branch workflows, GitHub collaboration, SSH security, and cloud deployment.',
    overview: 'Before building complex applications, every builder needs strong digital fundamentals. Master the Bash/Zsh terminal, learn how Git tracks changes and resolves conflicts, understand DNS and internet protocols, and configure secure cloud servers.',
    category: 'Computer and Digital Skills',
    level: 'Beginner',
    duration: '4 Weeks (16 Lessons)',
    modules_count: 16,
    price: 0,
    original_price: 1999,
    discount_price: 0,
    free_offer_active: false,
    offer_start_date: '',
    offer_expiry_date: '',
    is_free: true,
    rating: 4.8,
    enrolled_count: 950,
    badge: '100% Free Course',
    instructor: 'Nasir',
    instructor_title: 'Lead Technical Mentor',
    language: 'English / Hindi / Urdu',
    requirements: [
      'Any computer (Windows, macOS, or Linux)',
      'Basic keyboard and mouse navigation skills',
      'Eagerness to become proficient with the command line'
    ],
    outcomes: [
      'Navigate and manage files in the Linux/macOS Bash terminal and Windows PowerShell',
      'Track code revisions, create branches, and collaborate using Git and GitHub',
      'Understand internet networking: IP addresses, DNS, ports, HTTP/HTTPS, and SSL',
      'Configure SSH keys and connect securely to remote cloud servers'
    ],
    features: [
      '16 Hands-on terminal walkthroughs and exercises',
      'Downloadable Essential Terminal, Git & Cloud Computing Handbook (PDF)',
      'Grounded in Harvard CS50 computing fundamentals',
      'Instant free enrollment with lifetime dashboard access'
    ],
    modules: [
      {
        title: 'Module 1: The Command Line Interface (CLI)',
        lessons: [
          'Terminal Navigation: pwd, ls, cd, mkdir, and rm Safety',
          'Inspecting Files & Searching: cat, grep, head, and tail',
          'Environment Variables, System Paths & Shell Configuration'
        ]
      },
      {
        title: 'Module 2: Git Version Control Essentials',
        lessons: [
          'Initializing Repositories, Staging & Commit Best Practices',
          'Branching, Merging & Handling Merge Conflicts',
          'Connecting Local Repositories to GitHub with SSH Keys'
        ]
      },
      {
        title: 'Module 3: Networking & Cloud Fundamentals',
        lessons: [
          'How the Internet Works: DNS, IP, Ports & HTTP Methods',
          'SSL/TLS Encryption & Domain Record Management',
          'Deploying Your First Web Application to the Cloud'
        ]
      }
    ],
    downloadable_files: [
      {
        id: 'file-git-terminal-pdf',
        title: 'Essential Terminal, Git & Cloud Computing Digital Skills Handbook',
        filename: 'essential-git-terminal-cloud-handbook.pdf',
        format: 'PDF',
        size_bytes: 2470,
        size_formatted: '2.4 KB',
        download_url: '/api/courses/computer-digital-skills/download/file-git-terminal-pdf'
      }
    ],
    external_learning_url: 'https://cs50.harvard.edu/',
    is_published: true,
    sort_order: 14
  }
];

/**
 * Helper to compute whether a course currently has an active promotional free offer
 */
export function isCourseFreeOfferActive(course) {
  if (!course) return false;
  if (course.is_free === true || Number(course.price) === 0) return true;
  if (!course.free_offer_active) return false;

  const nowMs = Date.now();
  if (course.offer_start_date) {
    const startMs = new Date(course.offer_start_date).getTime();
    if (!isNaN(startMs) && nowMs < startMs) return false;
  }
  if (course.offer_expiry_date) {
    const expMs = new Date(course.offer_expiry_date).getTime();
    if (!isNaN(expMs) && nowMs > expMs) return false;
  }
  return true;
}

/**
 * Enriches course object with dynamic offer status and effective price
 */
export function enrichCourseWithOfferStatus(course) {
  if (!course) return course;
  const isOfferActive = isCourseFreeOfferActive(course);
  const isFree = course.is_free === true || Number(course.price) === 0 || isOfferActive;

  return {
    ...course,
    is_offer_active: isOfferActive,
    effective_price: isFree ? 0 : Number(course.price || 0),
    is_effective_free: isFree,
    display_badge: isOfferActive ? 'FREE OFFER — Enroll Now' : (course.badge || (isFree ? '100% Free' : 'Masterclass')),
  };
}

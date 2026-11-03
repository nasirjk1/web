import { getBlob, setBlob } from './store.js';
import { hashPassword } from './auth.js';
import { ALL_GENUINE_COURSES, COURSE_CATEGORIES_14 } from './courses-data.js';
import {
  LEARNING_HUB_CATEGORIES,
  VERIFIED_YOUTUBE_RESOURCES,
  RECOMMENDED_LEARNING_PATHS,
} from './learning-hub-data.js';
import {
  ARTICLE_CATEGORIES,
  EDUCATIONAL_ARTICLES_LIBRARY,
} from './articles-data.js';

export async function ensureSeeded() {
  const meta = await getBlob('meta');
  const existingTools = await getBlob('tools_index');
  const existingTopics = await getBlob('topics_index');
  const existingArticles = await getBlob('articles_index');
  const existingSettings = await getBlob('settings');
  const existingAuth = await getBlob('auth');

  const existingCourses = await getBlob('courses_index');
  const existingFreeCourses = await getBlob('free_courses_index');
  const existingTestimonials = await getBlob('testimonials_index');
  const existingMarquee = await getBlob('marquee_items');
  const existingCms = await getBlob('cms_appearance');

  // If already seeded and core indices exist (even if modified/deleted by admin), never overwrite
  if (meta && meta.seeded === true && Array.isArray(existingTools) && existingSettings && existingAuth) {
    await ensureExtendedCmsSeeded();
    return;
  }

  console.log('Seeding initial data for Web Nasir (non-destructive)...');

  // 1. Admin Authentication
  if (!existingAuth) {
    const defaultPasswordHash = await hashPassword('admin123');
    await setBlob('auth', {
      username: 'admin',
      password_hash: defaultPasswordHash,
      must_change_password: true,
    });
  }

  // 2. Settings (Expanded with Academy Video & Payment Controls)
  if (!existingSettings) {
    await setBlob('settings', {
      site_name: 'Web Nasir Academy',
      tagline: 'Practical AI, Web Engineering & Digital Monetization',
      whatsapp_number: '917006334417',
      email: 'hello@webnasir.com',
    announcement_enabled: true,
    announcement_badge: 'New 2025 Edition',
    announcement_text: 'Web Nasir Academy is Live: Free AI Utilities, Professional Paid Courses & High-RPM Blueprints!',
    announcement_link_text: 'Explore Courses →',
    announcement_link_url: '#/courses',
    hero_title: 'Learn Digital Skills. Build Websites. Grow Your Online Business.',
    hero_subtitle: 'Explore practical tools, learn website development, master SEO and discover professional training to build your digital future with Web Nasir.',
    stat_years: '10+ Yrs',
    stat_rpm: '$35+',
    stat_projects: '250+',
    stat_tools: '100% Free',
    nasir_quote: 'Over the last decade, I have built web applications that processed millions of requests, directed traffic to AdSense accounts generating over $35 RPM, and helped dozens of developers transition into self-employed digital builders.',
    video_title: 'Welcome to Web Nasir Academy',
    video_subtitle: 'Watch Founder Nasir introduce the mission, free AI utilities, and career tracks.',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    video_presenter_name: 'Nasir',
    video_presenter_title: 'Founder & Lead Technical Mentor',
    video_script_urdu: "Assalamu Alaikum! Welcome to Web Nasir. I'm Nasir, and I've created this platform to help you learn modern digital skills, use AI tools, build websites, master SEO, and develop your online career. Whether you are using our 11 free AI utilities or enrolling in our comprehensive paid masterclasses, our focus is 100% practical results.",
    video_script_english: "Welcome to Web Nasir Academy. I am Nasir, a senior full-stack engineer and digital publisher with over 10 years of experience. We built this platform so you can learn real-world skills, avoid theoretical fluff, deploy live software, and create sustainable online income.",
    razorpay_enabled: true,
    razorpay_key_id: 'rzp_test_webnasir_demo',
    currency: 'INR',
    currency_symbol: '₹',
    social_facebook: 'https://facebook.com/webnasir',
    social_x: 'https://x.com/webnasir',
    social_youtube: 'https://youtube.com/@webnasir',
    social_instagram: 'https://instagram.com/webnasir',
    social_linkedin: 'https://linkedin.com/in/webnasir',
    footer_text: 'Helping developers, creators and digital entrepreneurs build high-impact web assets and earn real online income.',
    trust_badges: [
      '10+ Years Experience',
      '250+ Projects Shipped',
      '11 Free AI Tools',
      '100% Practical Projects',
      'Live Mentorship',
      '4.9 ★ Rating',
    ],
  });
  }

  // 3. Topics
  const topics = [
    {
      key: 'ai',
      name: 'AI & Automation Tools',
      description: 'Ship lightweight AI micro-SaaS utilities, automated workflows, and high-utility prompt apps that solve real user problems.',
      icon: 'sparkles',
      link: '#/articles?tag=ai',
      sort_order: 1,
    },
    {
      key: 'webdev',
      name: 'Modern Web Engineering',
      description: 'Production-ready full-stack architecture, high-performance static builds, Jamstack, serverless, and clean UI engineering.',
      icon: 'code',
      link: '#/articles?tag=webdev',
      sort_order: 2,
    },
    {
      key: 'adsense',
      name: 'Google AdSense & High RPM',
      description: 'Data-driven ad placement, high-tier GEO targeting, keyword arbitrage, and viewability tuning to maximize your RPM.',
      icon: 'dollar-sign',
      link: '#/articles?tag=adsense',
      sort_order: 3,
    },
    {
      key: 'facebook',
      name: 'Facebook Video & Reels Monetization',
      description: 'Break into In-Stream ads, Facebook Reels bonuses, virality frameworks, retention editing, and rights manager compliance.',
      icon: 'share-2',
      link: '#/articles?tag=facebook',
      sort_order: 4,
    },
    {
      key: 'blogging',
      name: 'SEO & Content Publishing',
      description: 'Topical authority clusters, intent-first search optimization, programmatic content scaling, and Core Web Vitals.',
      icon: 'book-open',
      link: '#/articles?tag=blogging',
      sort_order: 5,
    },
    {
      key: 'earning',
      name: 'Digital Products & Micro-Income',
      description: 'Turn your utility websites into recurring cash flow using affiliate partnerships, premium tiers, and niche newsletters.',
      icon: 'trending-up',
      link: '#/articles?tag=earning',
      sort_order: 6,
    },
  ];
  if (!existingTopics || !Array.isArray(existingTopics) || existingTopics.length === 0) {
    await setBlob('topics_index', topics);
  }

  // 4. Comprehensive Suite of 11 Free AI & Webmaster Tools
  const tools = [
    {
      id: 'youtube',
      key: 'youtube',
      seo_slug: 'youtube',
      name: 'AI Viral YouTube Title & Hook Crafter',
      description: 'Generate high-CTR click-worthy YouTube titles, retention intro hooks, and visual thumbnail concepts using Gemini AI.',
      category: 'AI Creators',
      badge: 'AI Powered',
      tool_type: 'ai_youtube',
      icon: 'video',
      custom_prompt: 'Generate 5 viral, high-CTR YouTube video titles, 2 magnetic first-30-second retention hooks, and 2 visual thumbnail concept descriptions.',
      input_fields: 'Video Topic / Working Title, Target Tone / Audience Vibe',
      output_format: 'Markdown (Titles, 30s Hooks, Thumbnail Concepts)',
      is_enabled: true,
      is_featured: true,
      sort_order: 1,
    },
    {
      id: 'blogoutline',
      key: 'blogoutline',
      seo_slug: 'blogoutline',
      name: 'AI SEO Blog Outline & Keyword Strategist',
      description: 'Produce intent-first article structures, H2/H3 hierarchies, and high-CPC target keyword clusters in seconds.',
      category: 'SEO & Content',
      badge: 'AI Powered',
      tool_type: 'ai_blog',
      icon: 'file-text',
      custom_prompt: 'Create a comprehensive high-ranking SEO blog outline including search intent, high-CPC keywords, meta tags, and H2/H3 hierarchy.',
      input_fields: 'Target Keyword or Article Topic',
      output_format: 'Markdown (Keyword Cluster, Meta Tags, H2/H3 Outline)',
      is_enabled: true,
      is_featured: true,
      sort_order: 2,
    },
    {
      id: 'codeexplainer',
      key: 'codeexplainer',
      seo_slug: 'codeexplainer',
      name: 'AI Code, Regex & Script Explainer',
      description: 'Break down complex JavaScript, Python, SQL queries, or regular expressions with plain English explanations and fixes.',
      category: 'AI Creators',
      badge: 'AI Powered',
      tool_type: 'ai_code',
      icon: 'code',
      custom_prompt: 'Analyze and clearly explain the code snippet, regular expression, or command in plain English with optimization tips.',
      input_fields: 'Code Snippet, Regex, or Terminal Command',
      output_format: 'Markdown (Summary, Line-by-Line Breakdown, Security & Performance Fixes)',
      is_enabled: true,
      is_featured: true,
      sort_order: 3,
    },
    {
      id: 'adcopy',
      key: 'adcopy',
      seo_slug: 'adcopy',
      name: 'AI AdSense & Social Ad Copy Generator',
      description: 'Generate high-converting headlines, primary ad copy, and psychological call-to-actions tailored for web traffic.',
      category: 'Monetization',
      badge: 'AI Powered',
      tool_type: 'ai_adcopy',
      icon: 'sparkles',
      custom_prompt: 'Craft 3 high-converting ad copy variations (Headlines, Body text, and Call to Actions) to drive high-intent clicks and low CPC.',
      input_fields: 'Product, Niche Website, or Offer Description',
      output_format: 'Markdown (3 Ad Variations with Headlines, Primary Text & CTA)',
      is_enabled: true,
      is_featured: true,
      sort_order: 4,
    },
    {
      id: 'business',
      key: 'business',
      seo_slug: 'business',
      name: 'AdSense & Website Revenue Estimator',
      description: 'Project daily, monthly, and yearly income based on niche traffic, RPM, ad impressions, and click-through rates.',
      category: 'Monetization',
      badge: 'Interactive Calc',
      tool_type: 'client_business',
      icon: 'dollar-sign',
      custom_prompt: '',
      input_fields: 'Daily Pageviews, Niche Category RPM, Target Tier Geography',
      output_format: 'Interactive Revenue Dashboard (Daily, Monthly, Annual Projections)',
      is_enabled: true,
      is_featured: true,
      sort_order: 5,
    },
    {
      id: 'name',
      key: 'name',
      seo_slug: 'name',
      name: 'AI Brand & Domain Name Generator',
      description: 'Generate catchy, brandable tech and business names with instant domain availability hints and marketing vibe scoring.',
      category: 'AI Creators',
      badge: 'Branding Tool',
      tool_type: 'client_name',
      icon: 'sparkles',
      custom_prompt: '',
      input_fields: 'Core Keyword / Industry, Brand Naming Style',
      output_format: 'Interactive Brand Cards with .com/.io/.ai Domain Hints',
      is_enabled: true,
      is_featured: false,
      sort_order: 6,
    },
    {
      id: 'instagram',
      key: 'instagram',
      seo_slug: 'instagram',
      name: 'Social Media Viral Caption & Tag Generator',
      description: 'Craft high-engagement Instagram, TikTok, and Facebook captions paired with tri-tier low/mid/high competition hashtags.',
      category: 'SEO & Content',
      badge: 'Growth Tool',
      tool_type: 'client_instagram',
      icon: 'hash',
      custom_prompt: '',
      input_fields: 'Post Topic / Keyword, Caption Vibe',
      output_format: 'Viral Caption + 30 Tri-Tier Hashtags',
      is_enabled: true,
      is_featured: false,
      sort_order: 7,
    },
    {
      id: 'wordcount',
      key: 'wordcount',
      seo_slug: 'wordcount',
      name: 'Pro Content SEO & Word Density Analyzer',
      description: 'Inspect word count, character count, estimated reading & speaking time, readability grades, and keyword density for SEO.',
      category: 'SEO & Content',
      badge: 'SEO Utility',
      tool_type: 'client_wordcount',
      icon: 'file-text',
      custom_prompt: '',
      input_fields: 'Article or Draft Text',
      output_format: 'Real-Time Word, Character, Reading Time & Keyword Metrics',
      is_enabled: true,
      is_featured: false,
      sort_order: 8,
    },
    {
      id: 'password',
      key: 'password',
      seo_slug: 'password',
      name: 'Military-Grade Password & Passphrase Generator',
      description: 'Create cryptographically strong passwords or memorable passphrase chains with real-time entropy strength analysis.',
      category: 'Calculators',
      badge: 'Security Tool',
      tool_type: 'client_password',
      icon: 'shield-check',
      custom_prompt: '',
      input_fields: 'Password Length, Character Sets (Uppercase, Numbers, Symbols)',
      output_format: 'Cryptographic Password String + Entropy Rating',
      is_enabled: true,
      is_featured: false,
      sort_order: 9,
    },
    {
      id: 'age',
      key: 'age',
      seo_slug: 'age',
      name: 'Exact Age & Date Milestone Calculator',
      description: 'Calculate your exact age down to days, hours, and minutes, upcoming milestone birthdays, and astrological insights.',
      category: 'Calculators',
      badge: 'Date Utility',
      tool_type: 'client_age',
      icon: 'calendar',
      custom_prompt: '',
      input_fields: 'Date of Birth',
      output_format: 'Years, Months, Days, Total Days & Next Birthday Countdown',
      is_enabled: true,
      is_featured: false,
      sort_order: 10,
    },
    {
      id: 'arbitrage',
      key: 'arbitrage',
      seo_slug: 'arbitrage',
      name: 'AdSense Arbitrage & Traffic Profitability Calculator',
      description: 'Simulate paid ad acquisition cost vs AdSense revenue return, net profit margins, and campaign ROI percentage.',
      category: 'Monetization',
      badge: 'Arbitrage Tool',
      tool_type: 'client_arbitrage',
      icon: 'trending-up',
      custom_prompt: '',
      input_fields: 'Paid Clicks, CPC ($), Pageviews/Visit, AdSense Session RPM ($)',
      output_format: 'Gross Revenue, Ad Spend, Net Profit & ROI % Breakdown',
      is_enabled: true,
      is_featured: false,
      sort_order: 11,
    },
  ];
  if (!existingTools || !Array.isArray(existingTools) || existingTools.length === 0) {
    await setBlob('tools_index', tools);
  }

  // 5. Articles (Full 700–900 words each)
  const now = new Date().toISOString();

  const articleAi = {
    slug: 'ai-tools-monetization',
    tag: 'ai',
    title: 'How to Build and Monetize AI Micro-SaaS Tools in 2025: A 10-Year Developer Blueprint',
    meta: 'Step-by-step framework to conceptualize, ship, and monetize lightweight AI utility websites without massive infrastructure bills.',
    sort_order: 1,
    is_published: true,
    created_at: now,
    updated_at: now,
    body: `
# The New Era of Lightweight AI Utilities

Over my 10 years building full-stack platforms for global clients and personal digital ventures, I have witnessed countless paradigm shifts—from jQuery to React, from monolithic servers to Jamstack, and now to LLM-powered micro-utilities. 

The biggest opportunity right now isn't attempting to build another multi-million-dollar foundational model or complex enterprise CRM. The goldmine is in **targeted single-purpose AI tools**: utilities that solve one hyper-specific pain point for a focused audience in under 3 seconds.

In this deep-dive guide, I break down the exact engineering architecture, monetization loops, and traffic acquisition channels I use to build and scale profitable AI tools.

---

## 1. Why "Micro-Tools" Beat Heavy SaaS Every Time

When developers embark on building SaaS, they often spend three months constructing role-based permissions, multi-tenant billing, team management, and complicated dashboards before getting their first dollar.

Contrast that with a lightweight AI tool:
- **Zero friction entry:** Users land directly on the tool, input their prompt or text, and get instant value without registration.
- **Low hosting overhead:** Using static frontends on Netlify or Edge CDNs combined with serverless API functions costs virtually $0 until you have massive scale.
- **Immediate viral loops:** When someone generates a great social hook, an optimized resume summary, or a clean regex, they share it.
- **Diverse monetization:** You are not restricted to $29/mo subscriptions. You can monetize through programmatic display ads, pay-per-use token credits, affiliate partnerships, and sponsored developer tooling.

---

## 2. The Core Architecture Stack

Here is the exact battle-tested stack I recommend:
1. **Frontend:** Pure HTML/Tailwind CSS or React SPA. Keep it hyper-fast (under 100ms First Contentful Paint).
2. **Backend API:** Netlify Functions or Cloudflare Workers. These execute in milliseconds, handle burst traffic effortlessly, and eliminate server maintenance.
3. **Database & Storage:** Key-Value stores like Netlify Blobs or serverless SQL for zero-config persistence.
4. **AI Processing:** Fast inference endpoints (such as Gemini 2.5 Flash) with strict prompt constraints and input sanitization to keep token costs under fractions of a cent per request.

\`\`\`javascript
// Example Serverless Endpoint for AI Text Enhancement
export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  
  const { inputText, targetTone } = JSON.parse(event.body || '{}');
  if (!inputText || inputText.length > 2000) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Valid input under 2000 chars required' }) };
  }

  // Generate tailored output with structured formatting
  const result = await processAIUtility(inputText, targetTone);
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ success: true, result })
  };
};
\`\`\`

---

## 3. The 4 Proven Monetization Models

### A. The "Freemium Credit" Hybrid
Provide 5 free daily runs without an account. Once a user experiences the utility, offer an unlimited $9/month pass or a one-time $19 lifetime credit pack. The conversion rate on users who have already experienced high utility is consistently 4x higher than cold paywalls.

### B. High-Intent Affiliate Integration
If your tool generates domain names (like our Web Nasir Domain Generator), embed direct affiliate links to Namecheap, Porkbun, or Hostinger. When a user finds an available domain and registers it, you earn $15 to $65 per sale. One single viral tool generating 500 domain lookups a day can easily produce $2,000–$4,000 in monthly affiliate commissions.

### C. Display Ad Optimization (AdSense / Ezoic / Raptive)
For high-volume calculation and utility tools (word counters, calculators, formatters), users spend an average of 45–90 seconds on page actively typing. That dwell time elevates your AdSense ad viewability above 85%, commanding premium eCPMs ($12 to $35 RPM in Tier-1 countries).

### D. B2B White-Label & API Licensing
Once your utility gains authority, marketing agencies and niche webmasters will reach out asking if they can embed your widget on their client portals. Charging a $99/mo or $499 flat license fee provides predictable recurring revenue.

---

## 4. SEO & Traffic Playbook for AI Tools

How do you get 50,000 monthly visits to a brand new tool?
1. **Target Long-Tail Intent:** Avoid ranking for "AI writer". Target "Instagram reel caption generator for real estate agents" or "AdSense RPM revenue calculator for tech blogs".
2. **Programmatic Landing Pages:** Create static variations targeting specific niches and use cases with clear schema markup (WebApplication & SoftwareApplication).
3. **Embed Free Widgets:** Offer a free iframe embed code with a "Powered by Web Nasir" backlink. When other bloggers embed your tool, you receive high-authority contextual backlinks on autopilot.

---

## Nasir's Action Checklist
- [ ] Pick one specific calculation or transformation problem you solve daily.
- [ ] Build the core function in under 200 lines of code.
- [ ] Put a fast, clean UI around it with zero login barrier.
- [ ] Add direct WhatsApp or feedback integration to collect user reactions.
- [ ] Integrate display ads and contextual affiliate triggers.
    `,
  };

  const articleAdsense = {
    slug: 'google-adsense-high-rpm',
    tag: 'adsense',
    title: 'Google AdSense High-RPM Strategy: From $2 to $35 RPM in 90 Days',
    meta: 'Comprehensive guide to optimizing website structure, ad placements, and Tier-1 audience acquisition to dramatically increase AdSense earnings.',
    sort_order: 2,
    is_published: true,
    created_at: now,
    updated_at: now,
    body: `
# Unlocking True High-RPM AdSense Performance

Many webmasters and bloggers complain that Google AdSense is "dead" or that they are only earning $0.80 to $2.50 per 1,000 pageviews (RPM). Having managed digital publishing assets generating millions of monthly impressions over the past decade, I can state unequivocally: **AdSense is not dead; generic, unfocused websites are.**

If you are seeing an RPM below $10, you are suffering from one of three structural issues: poor geographic traffic composition, low commercial keyword intent, or suboptimal ad viewability architecture.

In this playbook, I will walk you through the exact technical and editorial adjustments that consistently take niche sites from $2 RPM to $30+ RPM.

---

## Understanding the RPM Equation

Revenue Per Mille (RPM) is calculated as:
$$\\text{RPM} = \\left( \\frac{\\text{Total Estimated Earnings}}{\\text{Total Pageviews}} \\right) \\times 1000$$

To increase this metric, you must optimize three underlying multipliers:
1. **CPC (Cost Per Click):** Driven by advertiser demand and niche commercial intent.
2. **CTR (Click-Through Rate):** Driven by ad placement, blending, and user engagement.
3. **Active View %:** Advertisers bid significantly more when they know their ad is rendered in the user's active viewport for at least 5 continuous seconds.

---

## 1. Niche Selection & The "Commercial Intent" Secret

Advertisers do not pay for traffic; they pay for customers. A blog post discussing "funny memes about coding" may get 100,000 views but will yield a $1.20 RPM because advertisers selling enterprise software cannot convert those visitors.

Compare that to high-commercial niches:
- **Cloud Infrastructure & Web Hosting:** $25 – $65 RPM
- **Business Finance & Merchant Processing:** $35 – $90 RPM
- **Legal & Insurance Solutions:** $40 – $120 RPM
- **B2B SaaS & Developer Tooling:** $20 – $45 RPM

Even within a general technology niche, you can pivot your editorial strategy toward commercial keywords:
- Instead of: *"What is an API?"* (Informational, Low CPC)
- Write: *"Best Enterprise API Gateway Platforms for Fintech Startups"* (High Buyer Intent, $14 CPC)

---

## 2. High-Yield Ad Placements Architecture

Where you place ads directly dictates whether you get pennies or dollars. Based on extensive heat-mapping tests across 250+ client web projects, here is the winning layout:

| Placement Position | Format | Expected CTR | Viewability % |
| :--- | :--- | :--- | :--- |
| **Top Under Header (Above Fold)** | Leaderboard (728x90 or Responsive) | 0.8% - 1.2% | 88% |
| **Below 1st Paragraph** | Large Rectangle (336x280) | 2.5% - 4.1% | 92% |
| **Mid-Content (Every 400 words)** | In-Article Responsive Native | 1.8% - 2.6% | 75% |
| **Sticky Sidebar (Desktop)** | Half-Page (300x600) Sticky | 1.4% - 2.0% | 95% |
| **Anchor / Sticky Footer (Mobile)** | 320x50 or 320x100 Persistent | 2.2% - 3.8% | 99% |

---

## 3. Geographic Traffic Optimization (Tier 1 Focus)

An impression from the United States, United Kingdom, Canada, or Australia typically commands 8x to 15x higher bids than impressions from developing regions due to purchasing power parity.

If your website currently attracts broad global traffic, apply these adjustments:
- **Write for Tier-1 Search Trends:** Monitor US Google Trends and target terminology specifically used by American or British buyers (e.g., "401k rollover", "UK contractor tax calculator").
- **Speed Up Global CDN Delivery:** Ensure your site loads in under 600ms in North America using Netlify Edge CDN.
    `,
  };

  const articleFacebook = {
    slug: 'facebook-monetization-playbook',
    tag: 'facebook',
    title: 'Facebook Page Monetization Blueprint: In-Stream Ads & Reels Playbook',
    meta: 'Master Facebook In-Stream ads, 60,000 minute watch time criteria, original video pacing, and copyright compliance to build a resilient video revenue stream.',
    sort_order: 3,
    is_published: true,
    created_at: now,
    updated_at: now,
    body: `
# Building a Scalable Facebook Video Income Machine

With over 3 billion monthly active users, Meta's Facebook video ecosystem remains one of the most lucrative and underappreciated revenue engines for digital creators and web entrepreneurs. 

While YouTube requires grueling years to establish organic search momentum, Facebook's recommendation algorithm is designed for **exponential burst virality**. A well-crafted 3-minute video published on a page with just 5,000 followers can accumulate 2 million views within 72 hours when it strikes the algorithm's retention thresholds.

---

## 1. Meeting the Monetization Thresholds Legally

To qualify for **In-Stream Ads for On-Demand Videos**, your page must satisfy:
- **Followers:** 5,000 active followers on an active Page or Professional Mode profile.
- **Watch Time:** 60,000 total eligible minutes viewed in the last 60 days on public videos.
- **Active Videos:** At least 5 active videos published on the page.

### How to Hit 60k Minutes in 14 Days
The mathematical key is **longer retention on 3+ minute videos**:
- If a video is 3 minutes and 15 seconds long, and viewers watch an average of 1.5 minutes, you only need **40,000 views** to fulfill the entire 60,000-minute requirement!
- Contrast that with 30-second videos where users watch 15 seconds: you would need 240,000 views to hit the same milestone.
    `,
  };

  if (!existingArticles || !Array.isArray(existingArticles) || existingArticles.length === 0) {
    await setBlob('articles_index', [
      {
        slug: articleAi.slug,
        tag: articleAi.tag,
        title: articleAi.title,
        meta: articleAi.meta,
        is_published: true,
        sort_order: 1,
        updated_at: now,
      },
      {
        slug: articleAdsense.slug,
        tag: articleAdsense.tag,
        title: articleAdsense.title,
        meta: articleAdsense.meta,
        is_published: true,
        sort_order: 2,
        updated_at: now,
      },
      {
        slug: articleFacebook.slug,
        tag: articleFacebook.tag,
        title: articleFacebook.title,
        meta: articleFacebook.meta,
        is_published: true,
        sort_order: 3,
        updated_at: now,
      },
    ]);

    await setBlob(`article:${articleAi.slug}`, articleAi);
    await setBlob(`article:${articleAdsense.slug}`, articleAdsense);
    await setBlob(`article:${articleFacebook.slug}`, articleFacebook);
  }

  // 6. Paid Courses & Masterclasses
  const courses = [
    {
      id: 'complete-ai-mastery',
      title: 'Complete AI Mastery & Automation Course',
      subtitle: 'From prompt engineering to building and monetizing real AI micro-SaaS utilities with Gemini and Python.',
      category: 'AI & Automation',
      level: 'Beginner to Advanced',
      duration: '8 Weeks',
      modules_count: 32,
      price: 4999,
      original_price: 12999,
      instructor: 'Nasir',
      instructor_title: 'Founder & Senior Engineer',
      badge: 'Flagship Program',
      is_published: true,
      sort_order: 1,
      overview: 'A comprehensive, zero-fluff academy program teaching you how to use modern generative AI models, craft intelligent autonomous workflows, build AI utilities, and monetize prompt engineering architectures in 2025.',
      features: [
        '32 Step-by-step video lessons & code repositories',
        'Build 4 production-grade AI micro-utilities',
        'Gemini 2.5 API integration & function calling',
        'Direct 1-on-1 weekly code review with Nasir',
        'Lifetime access to updates & private Discord community',
        'Official Web Nasir Academy Certificate'
      ],
      curriculum: [
        {
          module: 'Module 1: Foundations of Modern Generative AI',
          lessons: ['AI Architecture Overview: LLMs, Tokens & Context Windows', 'Prompt Engineering: Zero-Shot, Few-Shot & Chain-of-Thought', 'Avoiding AI Hallucinations & Output Structuring']
        },
        {
          module: 'Module 2: Building Web Apps with Gemini API',
          lessons: ['API Setup, Authentication & Server-Side Security', 'Streaming Text Generation & Real-Time Parsing', 'Tool Calling & Structured JSON Schemas']
        },
        {
          module: 'Module 3: Deploying Lightweight Micro-SaaS',
          lessons: ['Frontend UX Architecture for AI Utilities', 'Serverless Functions on Netlify & Cloud Run', 'Rate Limiting, Caching & Cost Optimization']
        },
        {
          module: 'Module 4: Commercialization & Real Income',
          lessons: ['AdSense vs Paid Tier Freemium Funnels', 'Viral TikTok & YouTube Acquisition Strategies', 'Analytics, Conversion Tracking & Lifetime Customer Value']
        }
      ]
    },
    {
      id: 'fullstack-web-dev',
      title: 'Production Full-Stack Website Development',
      subtitle: 'Build enterprise-grade React, Node.js, and serverless applications. Learn real deployment physics and performance tuning.',
      category: 'Website Development',
      level: 'Intermediate',
      duration: '10 Weeks',
      modules_count: 45,
      price: 6499,
      original_price: 15999,
      instructor: 'Nasir',
      instructor_title: '10+ Years Full-Stack Engineer',
      badge: 'Career Track',
      is_published: true,
      sort_order: 2,
      overview: 'Escape tutorial hell. Learn modern full-stack web engineering the way senior software engineers build in production: React 19, TypeScript, Node.js, Express, Tailwind CSS, PostgreSQL, and serverless edge delivery.',
      features: [
        '45 In-depth modules with production git repositories',
        'Ship 3 commercial-grade web applications',
        'Database architecture: SQL & Key-Value Stores',
        'Performance optimization & 100/100 Lighthouse scores',
        'Mock interview & portfolio architecture review',
        'Official Web Nasir Academy Certificate'
      ],
      curriculum: [
        {
          module: 'Module 1: Modern JavaScript & TypeScript Mastery',
          lessons: ['ESNext Asynchronous Patterns, Event Loop & Closures', 'Strict TypeScript: Interfaces, Generics & Utility Types', 'Modern Tooling: Vite, Node 20+, and Bun']
        },
        {
          module: 'Module 2: Advanced React Architecture',
          lessons: ['React 19 Hooks, Custom State Reducers & Context', 'Client-Side Routing & Zero-Race Hydration', 'High-Craft UI: Tailwind CSS & Smooth Animations']
        },
        {
          module: 'Module 3: Scalable Backend & APIs',
          lessons: ['RESTful API Design & Express Middleware', 'Secure JWT Authentication with httpOnly Cookies', 'Serverless Functions & Edge Routing']
        },
        {
          module: 'Module 4: Deployment & DevOps',
          lessons: ['Docker Containerization & Linux VPS Management', 'Nginx Reverse Proxy & Automated SSL via Let’s Encrypt', 'CI/CD Pipelines with GitHub Actions']
        }
      ]
    },
    {
      id: 'seo-mastery',
      title: 'Professional Technical SEO & Search Intent Mastery',
      subtitle: 'Topical authority clusters, Core Web Vitals, programmatic content architectures, and ranking in the AI search era.',
      category: 'SEO Mastery',
      level: 'All Levels',
      duration: '6 Weeks',
      modules_count: 28,
      price: 3999,
      original_price: 9999,
      instructor: 'Nasir',
      instructor_title: 'Digital Publisher & SEO Veteran',
      badge: 'High ROI',
      is_published: true,
      sort_order: 3,
      overview: 'Algorithms change, but user search intent and technical excellence always win. Master technical SEO, site speed physics, schema structured data, internal linking clusters, and intent-targeted content frameworks.',
      features: [
        '28 Hands-on modules with live site audits',
        'Real-world case studies ranking in Google US/UK',
        'Topical clustering template & keyword spreadsheets',
        'Core Web Vitals remediation checklist',
        'Direct feedback on your target website domain'
      ],
      curriculum: [
        {
          module: 'Module 1: Search Intent & Semantic Search Physics',
          lessons: ['Navigational, Informational, Commercial & Transactional Intent', 'Keyword Research Beyond Search Volume: CPC & SERP Difficulty', 'Topical Authority Clusters vs One-Off Blog Posts']
        },
        {
          module: 'Module 2: Technical Architecture & Core Web Vitals',
          lessons: ['LCP, INP & CLS Optimization for Next-Gen Rankings', 'Crawl Budget, Canonicalization & XML Sitemaps', 'JSON-LD Schema Markup: Articles, FAQ & Breadcrumbs']
        },
        {
          module: 'Module 3: Link Architecture & Authority Building',
          lessons: ['Internal Linking Physics: Flowing PageRank to High-RPM URLs', 'Ethical White-Hat Outreach & Resource Link Acquisition', 'Surviving Google Core Algorithm Updates']
        }
      ]
    },
    {
      id: 'digital-marketing-ai',
      title: 'Digital Marketing & Performance Ads with AI',
      subtitle: 'High-converting Meta, Google, and TikTok ad architectures, AI copy generation, funnel optimization, and conversion tracking.',
      category: 'Digital Marketing',
      level: 'Beginner to Intermediate',
      duration: '6 Weeks',
      modules_count: 26,
      price: 4499,
      original_price: 11999,
      instructor: 'Nasir',
      instructor_title: 'Ad Operations & Funnel Mentor',
      badge: 'In Demand',
      is_published: true,
      sort_order: 4,
      overview: 'Stop burning ad budget on guesswork. Learn the rigorous quantitative frameworks behind profitable performance marketing: hook rates, hold rates, copy psychology, pixel attribution, and AI-accelerated creative testing.',
      features: [
        '26 Focused modules with copy-paste campaign templates',
        'Ad creative testing spreadsheets & ROAS calculators',
        'Meta CAPI & Google Tag Manager tracking setups',
        'Live campaign budget pacing and scaling guidelines'
      ],
      curriculum: [
        {
          module: 'Module 1: High-Conversion Creative Strategy',
          lessons: ['The 3-Second Visual Hook & Problem-Agitation-Solution', 'AI Ad Copy Crafting: Headlines, Angles & Objection Crushing', 'Thumbnail & Video Creative Production with Free AI Tools']
        },
        {
          module: 'Module 2: Meta Ads Infrastructure',
          lessons: ['Business Manager, Pixel & Conversions API (CAPI) Setup', 'CBO vs ABO: Budget Scaling Systems That Don’t Break', 'Retargeting Funnels & Lookalike Audience Calibration']
        },
        {
          module: 'Module 3: Analytics, Attribution & Profitability',
          lessons: ['Blended ROAS vs Platform Reported Metrics', 'Landing Page Conversion Rate Optimization (CRO)', 'Unit Economics & Customer Acquisition Cost (CAC)']
        }
      ]
    },
    {
      id: 'adsense-blogging',
      title: 'Blogging & Google AdSense High-RPM Mastery',
      subtitle: 'From $2 to $35+ RPM: ad layout engineering, high-tier GEO targeting, keyword arbitrage, and viewability tuning.',
      category: 'Monetization',
      level: 'Intermediate to Advanced',
      duration: '8 Weeks',
      modules_count: 36,
      price: 5999,
      original_price: 14999,
      instructor: 'Nasir',
      instructor_title: '10-Year AdSense Veteran',
      badge: 'Nasir Signature',
      is_published: true,
      sort_order: 5,
      overview: 'The definitive blueprint extracted directly from Nasir’s decade-long publishing operations. Learn how ad networks actually value impressions, how to design high-CTR layout heatmaps, and how to acquire high-CPC tier-1 traffic safely.',
      features: [
        '36 Comprehensive lessons covering real AdSense dashboards',
        'The exact sticky sidebar & in-article physics script',
        'Google AdSense Policy compliance & invalid traffic safeguards',
        'Arbitrage traffic profitability spreadsheets',
        'Direct 1-on-1 ad layout audit with Nasir'
      ],
      curriculum: [
        {
          module: 'Module 1: Ad Exchange Mechanics & RPM Drivers',
          lessons: ['RPM vs eCPM vs CPC: Understanding How Publishers Get Paid', 'Why Tier-1 GEO Traffic (US, UK, CA, AU) Pays 10x More', 'Google MCM, Header Bidding & AdSense Auto Ads vs Manual Slots']
        },
        {
          module: 'Module 2: High-RPM Layout Engineering',
          lessons: ['Viewability Physics: Achieving 70%+ Active View', 'Sticky Sidebar & Anchor Ads Without Violating Policies', 'Native In-Feed Ad Formats That Match Editorial Content']
        },
        {
          module: 'Module 3: Traffic Acquisition & Arbitrage Physics',
          lessons: ['Paid Traffic Arbitrage: Buying at $0.05, Selling at $0.15', 'Facebook Viral Distribution to AdSense Content', 'Preventing Policy Violations, Two-Click Penalties & Ad Limits']
        }
      ]
    },
    {
      id: 'youtube-automation',
      title: 'YouTube Automation & High-CTR Content Creation',
      subtitle: 'Create high-retention faceless channels using AI scripting, voice synthesis, thumbnail CTR science, and monetized pacing.',
      category: 'AI Creators',
      level: 'Beginner to Pro',
      duration: '5 Weeks',
      modules_count: 22,
      price: 3499,
      original_price: 8999,
      instructor: 'Nasir',
      instructor_title: 'Digital Creator Mentor',
      badge: 'Trending',
      is_published: true,
      sort_order: 6,
      overview: 'Build sustainable automated channels without showing your face. Master niche selection, retention scripting, AI voice generation, thumbnail contrast physics, and YouTube algorithmic monetization.',
      features: [
        '22 Video modules covering end-to-end automation pipelines',
        'AI prompt templates for viral storytelling & cliffhangers',
        'Photoshop & Canva thumbnail psd templates',
        'Monetization checklist for AdSense, Sponsors & Affiliates'
      ],
      curriculum: [
        {
          module: 'Module 1: High-RPM Niche Selection',
          lessons: ['Finance, Tech, Luxury & History: High-CPC YouTube Niches', 'Competitor Gap Analysis & Audience Demand Research', 'Channel Branding & Visual Identity Setup']
        },
        {
          module: 'Module 2: AI Scripting & Production Workflow',
          lessons: ['Retention Scriptwriting: The First 30 Seconds Rule', 'AI Voice Synthesis & Natural Pacing Audio Editing', 'B-Roll Sourcing, Stock Footage & Fair Use Guidelines']
        },
        {
          module: 'Module 3: CTR Science & Long-Term Channel Growth',
          lessons: ['Thumbnail Design: Facial Contrast, Text Hierarchy & Color Psychology', 'Title Frameworks: Curiosity Gaps vs Direct Answers', 'Community Tab Engagement & Multi-Stream Monetization']
        }
      ]
    },
    {
      id: 'social-media-growth',
      title: 'Social Media Growth & Facebook In-Stream Monetization',
      subtitle: 'Break into Facebook In-Stream Ads and Performance Bonuses using retention editing, copyright clearance, and audience pacing.',
      category: 'Social Media Growth',
      level: 'All Levels',
      duration: '5 Weeks',
      modules_count: 20,
      price: 3999,
      original_price: 9999,
      instructor: 'Nasir',
      instructor_title: 'Social Publishing Specialist',
      badge: 'Fast Track',
      is_published: true,
      sort_order: 7,
      overview: 'Facebook is currently paying some of the highest video RPMs in digital history. Learn how to hit the 60,000 eligible minutes milestone, maintain clean page quality, and turn video views into regular monthly payouts.',
      features: [
        '20 Targeted lessons on Facebook Creator Studio & Payouts',
        'Viral pacing video templates for Premiere Pro & CapCut',
        'Copyright clearance & Rights Manager compliance rules',
        'Page setup, Professional Mode & Group engagement tactics'
      ],
      curriculum: [
        {
          module: 'Module 1: The Facebook In-Stream Algorithm',
          lessons: ['How Meta Distributes Long-Form Videos (3+ Minutes)', 'Hitting 5k Followers & 60k Minutes in Under 30 Days', 'Original Content Guidelines & Avoiding Limited Originality of Content (LOC)']
        },
        {
          module: 'Module 2: Viral Video Editing Psychology',
          lessons: ['The First 3-Second Visual Hook That Prevents Scrolling', 'Pattern Interrupts Every 8-12 Seconds for Maximum Retention', 'Adding Subtitles, Sound Effects & Emotional Music Stems']
        },
        {
          module: 'Module 3: Payouts, Tax Documents & Multi-Page Scaling',
          lessons: ['Setting Up Bank Accounts, Swift Codes & US Tax Forms', 'Building A Network of Monetized Facebook Pages', 'Reels Play Bonus Program Integration']
        }
      ]
    },
    {
      id: 'ai-productivity',
      title: 'AI Automation & Productivity for Entrepreneurs',
      subtitle: 'Automate business workflows with Zapier, Make, webhook orchestration, and custom AI agents that eliminate manual labor.',
      category: 'AI & Automation',
      level: 'Intermediate',
      duration: '4 Weeks',
      modules_count: 18,
      price: 2999,
      original_price: 7999,
      instructor: 'Nasir',
      instructor_title: 'Full-Stack & Systems Engineer',
      badge: 'Productivity',
      is_published: true,
      sort_order: 8,
      overview: 'Stop doing repetitive manual tasks. Learn how to connect webhooks, automate email triage, generate social assets autonomously, and build internal tools that save 20+ hours every single week.',
      features: [
        '18 Hands-on tutorials with importable automation blueprints',
        'Integrations with Google Sheets, Slack, Gmail, and Airtable',
        'Custom Webhooks & REST API trigger configurations',
        'Zero-code to low-code enterprise automation pipelines'
      ],
      curriculum: [
        {
          module: 'Module 1: Visual Automation Architecture',
          lessons: ['Make.com vs Zapier: Cost, Architecture & Scalability', 'Triggers, Routers, Filters & Aggregators', 'Error Handling, Fallback Alerts & Data Formatting']
        },
        {
          module: 'Module 2: AI-Powered Autonomous Pipelines',
          lessons: ['Connecting Gemini API to Automated Content Queues', 'Automated Customer Support Triaging & Drafting', 'Social Media Auto-Publishing with AI Captioning']
        }
      ]
    }
  ];

  if (!existingCourses || !Array.isArray(existingCourses) || existingCourses.length === 0) {
    await setBlob('courses_index', courses);
    for (const c of courses) {
      await setBlob(`course:${c.id}`, c);
    }
  }

  // 7. Student Reviews & Mentee Testimonials
  const testimonials = [
    {
      id: 'test-1',
      name: 'Babidul Hassan',
      role: 'Full-Stack Developer & Agency Builder',
      course: 'Production Full-Stack Web Development',
      rating: 5,
      content: 'Learning from Nasir was a complete turning point. Instead of theoretical university slides, we built actual deployable apps with real databases, authentication, and clean Tailwind styling. Within two months of graduating, I landed my first international client project.',
      avatar: '',
      has_video: true,
      video_url: 'https://img.youtube.com/vi/JUp4ITFlRI8/maxresdefault.jpg',
      verified: true,
      sort_order: 1,
    },
    {
      id: 'test-2',
      name: 'Tausif Ahmed',
      role: 'Content Creator & AdSense Publisher',
      course: 'Blogging & Google AdSense High-RPM Mastery',
      rating: 5,
      content: 'Before Web Nasir, my blog was stuck at a depressing $1.80 RPM. Nasir audited my ad placements, taught me the sticky sidebar physics and tier-1 audience targeting. Last month my RPM crossed $28.50 on the exact same traffic. The math works!',
      avatar: '',
      has_video: false,
      verified: true,
      sort_order: 2,
    },
    {
      id: 'test-3',
      name: 'Farooq Sheikh',
      role: 'SaaS Founder & Micro-Tool Creator',
      course: 'Complete AI Mastery & Automation Course',
      rating: 5,
      content: 'The free AI tools on Web Nasir showed me how capable the platform is, so I enrolled in the AI Mastery course. Nasir explained API rate limiting, system prompts, and serverless edge functions so clearly that I launched my own micro-utility in just 3 weeks.',
      avatar: '',
      has_video: false,
      verified: true,
      sort_order: 3,
    },
    {
      id: 'test-4',
      name: 'Mehraj Din',
      role: 'Digital Marketing & Video Producer',
      course: 'Facebook In-Stream Monetization Playbook',
      rating: 5,
      content: 'The 3-second hook framework and video retention pacing shared in this academy are pure gold. We hit our 60,000 eligible minutes threshold in just 18 days on a brand-new page. Nasir is the real deal—no fake hype, just honest engineering.',
      avatar: '',
      has_video: true,
      video_url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      verified: true,
      sort_order: 4,
    }
  ];

  if (!existingTestimonials || !Array.isArray(existingTestimonials) || existingTestimonials.length === 0) {
    await setBlob('testimonials_index', testimonials);
  }

  // 8. Announcement Marquee Ticker
  const marquee = [
    { text: '🚀 Learn AI. Build Practical Skills. Earn Real Online Income.', link: '#/courses' },
    { text: '⚡ Explore 11+ Free Production-Ready AI & Webmaster Utilities.', link: '#/tools' },
    { text: '🎓 Web Nasir Academy — 100% Practical Project-Driven Masterclasses.', link: '#/courses' },
    { text: '📈 Master High-RPM Google AdSense & Algorithmic SEO Systems.', link: '#/articles' },
    { text: '💻 Build and Ship Live Commercial Projects with 10-Year Veteran Nasir.', link: '#/about' },
    { text: '🌐 Career Tracks: AI Specialist, Full-Stack Web Developer, SEO Architect.', link: '#/topics' },
  ];

  if (!existingMarquee || !Array.isArray(existingMarquee) || existingMarquee.length === 0) {
    await setBlob('marquee_items', marquee);
  }

  // 9. Email Templates (9 Reusable Academy Templates)
  const emailTemplates = [
    {
      id: 'welcome',
      name: 'Welcome Email',
      subject: 'Welcome to Web Nasir Academy — Your AI & Web Career Starts Now',
      body: 'Hi {{student_name}},\n\nWelcome to Web Nasir Academy! We are excited to have you join our practical learning community.\n\nYou now have full access to our 11 free AI utilities, career learning tracks, and your personal Student Dashboard.\n\nAccess your dashboard: {{dashboard_url}}\n\nIf you ever have any questions, reach out via WhatsApp (+91 7006334417) or reply directly to this email.\n\nWarm regards,\nNasir\nFounder, Web Nasir Academy',
      type: 'transactional',
    },
    {
      id: 'registration_confirm',
      name: 'Registration Confirmation',
      subject: 'Account Confirmed: Welcome to Web Nasir Academy',
      body: 'Hi {{student_name}},\n\nYour student account has been created successfully with {{student_email}} via {{auth_provider}}.\n\nYou can sign in at any time to track your courses and access saved tools: {{login_url}}\n\nHappy building!\n— Nasir',
      type: 'transactional',
    },
    {
      id: 'free_enrollment',
      name: 'Free Course Enrollment',
      subject: 'Enrollment Confirmed: {{course_title}}',
      body: 'Hi {{student_name}},\n\nCongratulations! You have been successfully enrolled in "{{course_title}}".\n\nYour modules are now active in your Student Dashboard: {{dashboard_url}}\n\nStart your first lesson today and build your first real project.\n\nBest,\nWeb Nasir Academy',
      type: 'transactional',
    },
    {
      id: 'paid_enrollment',
      name: 'Paid Course Confirmation & Access Unlocked',
      subject: 'Payment Verified: Access Unlocked for {{course_title}}',
      body: 'Hi {{student_name}},\n\nThank you for enrolling in {{course_title}}! Your payment of ₹{{amount}} has been verified successfully (Payment ID: {{payment_id}}).\n\nYour complete curriculum, video walk-throughs, and mentorship materials are now unlocked in your Student Dashboard: {{dashboard_url}}\n\nWelcome to the cohort!\nNasir',
      type: 'transactional',
    },
    {
      id: 'payment_receipt',
      name: 'Payment Receipt & Tax Invoice',
      subject: 'Payment Receipt for Order #{{order_id}} — Web Nasir Academy',
      body: 'Web Nasir Academy — Payment Receipt\n\nOrder ID: {{order_id}}\nPayment ID: {{payment_id}}\nStudent Name: {{student_name}}\nStudent Email: {{student_email}}\nItem: {{course_title}}\nTotal Paid: ₹{{amount}} INR\nPayment Method: {{payment_method}}\nDate: {{date}}\nStatus: Completed & Verified\n\nThank you for choosing Web Nasir Academy.',
      type: 'transactional',
    },
    {
      id: 'password_reset',
      name: 'Password Reset Notification',
      subject: 'Security Alert: Password Reset Requested for Web Nasir Academy',
      body: 'Hi {{student_name}},\n\nA request to reset the password for your Web Nasir account ({{student_email}}) was received.\n\nIf you requested this change, follow the password reset link sent to your inbox or click here: {{reset_url}}\n\nIf you did not request this, please secure your account immediately.\n\nWeb Nasir Security Team',
      type: 'security',
    },
    {
      id: 'new_course',
      name: 'New Course Announcement',
      subject: 'New Masterclass: {{course_title}} is Now Live!',
      body: 'Hello {{student_name}},\n\nWe are thrilled to announce a brand new practical masterclass at Web Nasir Academy:\n\n👉 {{course_title}}\n{{course_desc}}\n\nEarly-bird discount pricing is currently active. Learn more and enroll now: {{course_url}}\n\nTo continuous growth,\nNasir',
      type: 'marketing',
    },
    {
      id: 'course_update',
      name: 'Course Curriculum Update',
      subject: 'Curriculum Update: New Lessons Added to {{course_title}}',
      body: 'Hi {{student_name}},\n\nWe just added new practical lessons, code templates, and walkthroughs to {{course_title}}.\n\nLog in to your dashboard to view the new modules: {{dashboard_url}}\n\nKeep building!\nNasir',
      type: 'course_update',
    },
    {
      id: 'student_announcement',
      name: 'General Student Announcement',
      subject: 'Special Announcement from Nasir — Web Nasir Academy',
      body: 'Dear Students,\n\n{{announcement_body}}\n\nThank you for being part of Web Nasir Academy.\n\nBest regards,\nNasir',
      type: 'announcement',
    },
  ];

  if (!(await getBlob('email_templates'))) {
    await setBlob('email_templates', emailTemplates);
  }

  // 10. Email Sender Configuration
  const emailConfig = {
    sender_name: 'Web Nasir Academy',
    sender_email: 'support@webnasir.com',
    reply_to: 'hello@webnasir.com',
    resend_api_key: process.env.RESEND_API_KEY || '',
    is_verified: true,
  };
  if (!(await getBlob('email_config'))) {
    await setBlob('email_config', emailConfig);
  }

  // 11. Seed Baseline Students if empty
  const existingStudents = await getBlob('students_index');
  if (!existingStudents || existingStudents.length === 0) {
    const seedStudents = [
      {
        id: 'std_babidul_01',
        name: 'Babidul Hassan',
        email: 'babidul.dev@gmail.com',
        auth_provider: 'google',
        email_verified: true,
        phone: '+91 9876543201',
        created_at: new Date(Date.now() - 35 * 86400000).toISOString(),
        last_login_at: new Date(Date.now() - 2 * 3600000).toISOString(),
        login_count: 24,
        enrolled_courses: ['fullstack-web-dev', 'complete-ai-mastery'],
        payment_status: 'paid',
        status: 'active',
      },
      {
        id: 'std_tausif_02',
        name: 'Tausif Ahmed',
        email: 'tausif.publish@outlook.com',
        auth_provider: 'email',
        email_verified: true,
        phone: '+91 9876543202',
        created_at: new Date(Date.now() - 28 * 86400000).toISOString(),
        last_login_at: new Date(Date.now() - 8 * 3600000).toISOString(),
        login_count: 18,
        enrolled_courses: ['adsense-blogging', 'seo-mastery'],
        payment_status: 'paid',
        status: 'active',
      },
      {
        id: 'std_mehraj_03',
        name: 'Mehraj Din',
        email: 'mehraj.video@gmail.com',
        auth_provider: 'google',
        email_verified: true,
        phone: '+91 9876543203',
        created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
        last_login_at: new Date(Date.now() - 12 * 3600000).toISOString(),
        login_count: 12,
        enrolled_courses: ['youtube-automation', 'social-media-growth'],
        payment_status: 'paid',
        status: 'active',
      },
      {
        id: 'std_farooq_04',
        name: 'Farooq Sheikh',
        email: 'farooq.saas@gmail.com',
        auth_provider: 'email',
        email_verified: true,
        phone: '+91 9876543204',
        created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
        last_login_at: new Date(Date.now() - 1 * 3600000).toISOString(),
        login_count: 9,
        enrolled_courses: ['complete-ai-mastery', 'ai-productivity'],
        payment_status: 'paid',
        status: 'active',
      },
    ];
    await setBlob('students_index', seedStudents);
  }

  // 12. Seed Subscribers List if empty
  const existingSubscribers = await getBlob('subscribers_list');
  if (!existingSubscribers || existingSubscribers.length === 0) {
    await setBlob('subscribers_list', [
      { email: 'subscriber1@example.com', name: 'Zahid Khan', source: 'footer_newsletter', marketing_consent: true, created_at: new Date(Date.now() - 10 * 86400000).toISOString(), status: 'active' },
      { email: 'subscriber2@example.com', name: 'Ayesha Mir', source: 'footer_newsletter', marketing_consent: true, created_at: new Date(Date.now() - 5 * 86400000).toISOString(), status: 'active' },
    ]);
  }

  // 13. Seed Baseline Email History if empty
  const existingEmailHistory = await getBlob('emails_history');
  if (!existingEmailHistory) {
    await setBlob('emails_history', [
      {
        id: 'eml-seed-01',
        to: 'babidul.dev@gmail.com',
        recipient_name: 'Babidul Hassan',
        subject: 'Welcome to Web Nasir Academy — Your AI & Web Career Starts Now',
        template_id: 'welcome',
        type: 'transactional',
        status: 'delivered',
        sent_at: new Date(Date.now() - 35 * 86400000).toISOString(),
        provider: 'resend',
      },
      {
        id: 'eml-seed-02',
        to: 'tausif.publish@outlook.com',
        recipient_name: 'Tausif Ahmed',
        subject: 'Payment Verified: Access Unlocked for Google AdSense High-RPM Blogging Blueprint',
        template_id: 'paid_enrollment',
        type: 'transactional',
        status: 'delivered',
        sent_at: new Date(Date.now() - 28 * 86400000).toISOString(),
        provider: 'resend',
      },
    ]);
  }

  // 14. Free Courses Index (Direct Free Enrollment without Razorpay)
  const freeCourses = [
    {
      id: 'free-ai-prompt-foundations',
      title: 'AI Prompt Engineering & Gemini API Foundations',
      slug: 'free-ai-prompt-foundations',
      category: 'AI Engineering',
      level: 'Beginner Friendly',
      duration: '3 Hours (6 Lessons)',
      price: 0,
      original_price: 1999,
      is_free: true,
      rating: 4.9,
      enrolled_count: 840,
      badge: '100% Free Course',
      instructor: 'Nasir',
      description: 'Learn the core principles of structured prompt design, system instructions, JSON output formatting, and building your first free AI utility.',
      outcomes: [
        'Write deterministic system instructions',
        'Parse structured JSON from Gemini Flash',
        'Deploy a serverless AI endpoint on Netlify'
      ],
      modules: [
        {
          title: 'Module 1: Prompt Architecture Fundamentals',
          lessons: [
            { title: 'Zero-shot vs Few-shot Prompting', type: 'video', duration: '25m', free_preview: true },
            { title: 'Structuring System Instructions for Web Apps', type: 'text', duration: '30m', free_preview: true },
            { title: 'Building Your First AI Micro-Utility', type: 'video', duration: '45m', free_preview: true }
          ]
        }
      ],
      is_published: true,
      sort_order: 1,
    },
    {
      id: 'free-adsense-approval-checklist',
      title: 'Google AdSense Fast-Track Approval & Setup Bootcamp',
      slug: 'free-adsense-approval-checklist',
      category: 'Monetization & AdSense',
      level: 'All Levels',
      duration: '2.5 Hours (5 Lessons)',
      price: 0,
      original_price: 1499,
      is_free: true,
      rating: 4.9,
      enrolled_count: 1120,
      badge: 'Free Bootcamp',
      instructor: 'Nasir',
      description: 'Avoid the dreaded "Low Value Content" rejection. Follow our 20-point pre-application technical audit to get your domain approved cleanly.',
      outcomes: [
        'Configure mandatory legal & trust pages',
        'Fix Core Web Vitals & crawl budget bottlenecks',
        'Set up ads.txt and high-viewability ad slots'
      ],
      modules: [
        {
          title: 'Module 1: Pre-Approval Technical Audit',
          lessons: [
            { title: 'Fixing Low Value Content Triggers', type: 'video', duration: '35m', free_preview: true },
            { title: 'Site Architecture & Navigation Signals', type: 'text', duration: '25m', free_preview: true }
          ]
        }
      ],
      is_published: true,
      sort_order: 2,
    },
    {
      id: 'free-jamstack-netlify-starter',
      title: 'Serverless Web Deployment on Netlify & GitHub',
      slug: 'free-jamstack-netlify-starter',
      category: 'Web Engineering',
      level: 'Beginner',
      duration: '2 Hours (4 Lessons)',
      price: 0,
      original_price: 1299,
      is_free: true,
      rating: 4.8,
      enrolled_count: 690,
      badge: 'Free Starter',
      instructor: 'Nasir',
      description: 'Go from local code to a globally distributed production web app with custom DNS, automatic SSL, and serverless Node.js edge functions.',
      outcomes: [
        'Connect GitHub repositories to Netlify CI/CD',
        'Write serverless Node.js API handlers',
        'Use Netlify Blobs for zero-config persistence'
      ],
      modules: [
        {
          title: 'Module 1: Production Deployment Workflow',
          lessons: [
            { title: 'Git Workflow & Automated Builds', type: 'video', duration: '30m', free_preview: true },
            { title: 'Configuring netlify.toml & Redirects', type: 'text', duration: '25m', free_preview: true }
          ]
        }
      ],
      is_published: true,
      sort_order: 3,
    }
  ];
  if (!existingFreeCourses || !Array.isArray(existingFreeCourses) || existingFreeCourses.length === 0) {
    await setBlob('free_courses_index', freeCourses);
  }

  // 15. Course Categories
  const courseCategories = [
    { id: 'cat-ai', name: 'AI Engineering', slug: 'ai-engineering', description: 'LLMs, Prompt Engineering, Agents & AI SaaS', count: 3, sort_order: 1 },
    { id: 'cat-web', name: 'Web Engineering', slug: 'web-engineering', description: 'Full-Stack, Serverless, Jamstack & UI Design', count: 2, sort_order: 2 },
    { id: 'cat-seo', name: 'SEO & Organic Growth', slug: 'seo-growth', description: 'Technical SEO, Programmatic Pages & Topical Authority', count: 2, sort_order: 3 },
    { id: 'cat-adsense', name: 'Monetization & AdSense', slug: 'monetization', description: 'High-RPM AdSense, Traffic Arbitrage & Digital Publishing', count: 2, sort_order: 4 },
    { id: 'cat-marketing', name: 'Digital Marketing & Video', slug: 'digital-marketing', description: 'YouTube Automation, Social Media & Performance Ads', count: 2, sort_order: 5 }
  ];
  if (!(await getBlob('course_categories'))) {
    await setBlob('course_categories', courseCategories);
  }

  // 16. CMS Homepage Builder (Ordered Sections & Visual Settings)
  const cmsHomepage = {
    status: 'published',
    updated_at: now,
    sections: [
      { id: 'hero', name: 'Hero Banner & Verified Stats', enabled: true, order: 1, heading: 'Master AI, Build Digital Skills & Create Your Online Future.', subtitle: 'Learn practical AI, website development, SEO, digital marketing and online business strategies with Nasir.', bg_color: '#ffffff', text_color: '#0f172a', cta_primary_text: 'Explore Paid Courses', cta_primary_link: '#/courses', cta_secondary_text: 'Explore 11+ Free AI Tools', cta_secondary_link: '#/tools', show_badges: true, desktop_visible: true, mobile_visible: true, spacing: 'normal' },
      { id: 'marquee', name: 'Animated Announcement Marquee (Below Hero)', enabled: true, order: 2, heading: 'Live Announcements', subtitle: '', bg_color: '#0f172a', text_color: '#ffffff', speed: 34, pause_on_hover: true, desktop_visible: true, mobile_visible: true, spacing: 'compact' },
      { id: 'tools', name: '11 Free AI & Webmaster Utilities', enabled: true, order: 3, heading: 'Free AI & Webmaster Utilities', subtitle: 'Interactive generators, calculators, and SEO utilities designed for web developers, content creators, and digital publishers.', bg_color: '#ffffff', text_color: '#0f172a', cta_primary_text: 'View Complete Free Tools Directory', cta_primary_link: '#/tools', show_badges: true, desktop_visible: true, mobile_visible: true, spacing: 'normal' },
      { id: 'paid_courses', name: 'Paid Academy Masterclasses', enabled: true, order: 4, heading: 'Industry-Ready Flagship Masterclasses', subtitle: 'Structured, project-driven courses with lifetime access, source code templates, and direct mentorship.', bg_color: '#f8fafc', text_color: '#0f172a', cta_primary_text: 'View All Masterclasses', cta_primary_link: '#/courses', show_badges: true, desktop_visible: true, mobile_visible: true, spacing: 'normal' },
      { id: 'free_courses', name: 'Free Starter Courses (Direct Enrollment)', enabled: true, order: 5, heading: '100% Free Starter Courses & Bootcamps', subtitle: 'Start learning immediately without payment. Sign in with Google or Email for instant access.', bg_color: '#ffffff', text_color: '#0f172a', cta_primary_text: 'Enroll Free Today', cta_primary_link: '#/courses', show_badges: true, desktop_visible: true, mobile_visible: true, spacing: 'normal' },
      { id: 'why_choose', name: 'Why Choose Web Nasir Comparison', enabled: true, order: 6, heading: 'Why Serious Builders Choose Web Nasir Academy', subtitle: 'How our practical engineering mentorship compares to generic theoretical video courses.', bg_color: '#f8fafc', text_color: '#0f172a', show_badges: true, desktop_visible: true, mobile_visible: true, spacing: 'normal' },
      { id: 'learning_pathways', name: 'Outcome-Driven Learning Pathways', enabled: true, order: 7, heading: 'Everything You Need to Build & Monetize', subtitle: 'Structured career tracks and topic roadmaps connected directly to our technical library.', bg_color: '#ffffff', text_color: '#0f172a', show_badges: true, desktop_visible: true, mobile_visible: true, spacing: 'normal' },
      { id: 'founder_video', name: 'Founder Nasir Video Presenter Introduction', enabled: true, order: 8, heading: 'Meet Founder Nasir — Web Nasir Academy Mission', subtitle: 'Watch Founder Nasir introduce the mission, free AI utilities, and career tracks.', bg_color: '#f8fafc', text_color: '#ffffff', cta_primary_text: 'Watch Full Introduction Video', cta_primary_link: '#video', show_badges: true, desktop_visible: true, mobile_visible: true, spacing: 'normal' },
      { id: 'guides_articles', name: 'Battle-Tested Case Studies & Technical Guides', enabled: true, order: 9, heading: 'Battle-Tested Case Studies & Blueprints', subtitle: 'Deep-dive architectural breakdowns, high-RPM AdSense studies, and production code guides.', bg_color: '#ffffff', text_color: '#0f172a', cta_primary_text: 'Read All Guides', cta_primary_link: '#/articles', show_badges: true, desktop_visible: true, mobile_visible: true, spacing: 'normal' },
      { id: 'testimonials', name: 'Verified Student & Mentee Reviews', enabled: true, order: 10, heading: 'Verified Student Outcomes & Reviews', subtitle: 'Real feedback from developers, publishers, and creators who trained at Web Nasir Academy.', bg_color: '#f8fafc', text_color: '#0f172a', show_badges: true, desktop_visible: true, mobile_visible: true, spacing: 'normal' },
      { id: 'final_cta', name: 'Final Call To Action Banner', enabled: true, order: 11, heading: 'Ready to Build Real Digital Assets & Income?', subtitle: 'Join thousands of learners using Web Nasir free AI tools and flagship technical courses.', bg_color: '#0f172a', text_color: '#ffffff', cta_primary_text: 'Explore Masterclasses', cta_primary_link: '#/courses', cta_secondary_text: 'Try Free AI Tools', cta_secondary_link: '#/tools', show_badges: true, desktop_visible: true, mobile_visible: true, spacing: 'normal' }
    ]
  };
  if (!(await getBlob('cms_homepage'))) {
    await setBlob('cms_homepage', cmsHomepage);
  }

  // 17. CMS Appearance & Centralized Theme Configuration
  const cmsAppearance = {
    colors: {
      primary: '#7c3aed',
      secondary: '#4f46e5',
      accent: '#10b981',
      background: '#ffffff',
      surface: '#f8fafc',
      header_bg: '#ffffff',
      footer_bg: '#0b0f19',
      card_bg: '#ffffff',
      heading_text: '#0f172a',
      body_text: '#334155',
      button_bg: '#7c3aed',
      button_text: '#ffffff',
      border_color: '#e2e8f0'
    },
    typography: {
      heading_font: 'Poppins',
      body_font: 'Inter',
      h1_size: '3.25rem',
      h2_size: '2.25rem',
      h3_size: '1.35rem',
      body_size: '0.95rem',
      button_text_size: '0.85rem',
      nav_text_size: '0.82rem',
      footer_text_size: '0.8rem',
      font_weight_heading: '800',
      line_height: '1.6'
    },
    layout: {
      container_width: '1280px',
      section_spacing: '5rem',
      card_radius: '1.5rem',
      button_radius: '0.875rem',
      card_shadow: 'subtle',
      header_height: '5rem',
      grid_columns_desktop: 3,
      grid_columns_tablet: 2,
      grid_columns_mobile: 1
    },
    buttons: {
      primary_bg: '#7c3aed',
      primary_text: '#ffffff',
      primary_hover: '#6d28d9',
      primary_radius: '0.875rem',
      primary_size: 'md'
    }
  };
  if (!existingCms) {
    await setBlob('cms_appearance', cmsAppearance);
  }

  // 18. CMS Header & Navigation Manager
  const cmsNavigation = {
    sticky_header: true,
    show_announcement_bar: true,
    cta_button_text: 'Explore Courses',
    cta_button_url: '#/courses',
    items: [
      { id: 'nav-home', label: 'Home', url: '#/', icon: 'home', enabled: true, order: 1, desktop: true, mobile: true, new_tab: false, dropdown: [] },
      { id: 'nav-tools', label: 'Free AI Tools', url: '#/tools', icon: 'sparkles', enabled: true, order: 2, desktop: true, mobile: true, new_tab: false, has_mega_menu: true, dropdown: [
        { label: 'YouTube Hook & Title Crafter', url: '#/tools/youtube' },
        { label: 'SEO Blog Outline Strategist', url: '#/tools/blogoutline' },
        { label: 'Code & Regex Explainer', url: '#/tools/codeexplainer' },
        { label: 'AdSense Revenue Estimator', url: '#/tools/business' },
        { label: 'View All 11 Free Tools →', url: '#/tools' }
      ]},
      { id: 'nav-courses', label: 'Paid Courses', url: '#/courses', icon: 'graduation-cap', enabled: true, order: 3, desktop: true, mobile: true, new_tab: false, has_mega_menu: true, dropdown: [
        { label: 'Complete AI Mastery & Automation', url: '#/courses/complete-ai-mastery' },
        { label: 'Production Full-Stack Web Dev', url: '#/courses/fullstack-web-dev' },
        { label: 'Technical SEO Mastery', url: '#/courses/seo-mastery' },
        { label: 'Google AdSense High-RPM Blueprint', url: '#/courses/adsense-blogging' },
        { label: 'Browse All 8 Masterclasses →', url: '#/courses' }
      ]},
      { id: 'nav-free-courses', label: 'Free Courses', url: '#/courses?filter=free', icon: 'gift', enabled: true, order: 4, desktop: true, mobile: true, new_tab: false, dropdown: [] },
      { id: 'nav-tracks', label: 'Career Tracks', url: '#/tracks', icon: 'compass', enabled: true, order: 5, desktop: true, mobile: true, new_tab: false, dropdown: [] },
      { id: 'nav-articles', label: 'Guides & Articles', url: '#/articles', icon: 'book-open', enabled: true, order: 6, desktop: true, mobile: true, new_tab: false, dropdown: [] },
      { id: 'nav-about', label: 'About Us', url: '#/about', icon: 'user-check', enabled: true, order: 7, desktop: true, mobile: true, new_tab: false, dropdown: [] },
      { id: 'nav-contact', label: 'Contact', url: '#/contact', icon: 'mail', enabled: true, order: 8, desktop: true, mobile: true, new_tab: false, dropdown: [] },
      { id: 'nav-student', label: 'Student Portal', url: '#/student', icon: 'layout', enabled: true, order: 9, desktop: true, mobile: true, new_tab: false, dropdown: [] }
    ]
  };
  if (!(await getBlob('cms_navigation'))) {
    await setBlob('cms_navigation', cmsNavigation);
  }

  // 19. CMS Footer Builder
  const cmsFooter = {
    brand_title: 'Web Nasir Academy',
    brand_badge: 'OFFICIAL',
    brand_description: 'A practical technology academy and engineering platform built by 10-year veteran Nasir. We empower serious creators, software engineers, and digital publishers to master modern AI utilities, full-stack web engineering, and battle-tested monetization architectures.',
    bg_color: '#0b0f19',
    text_color: '#cbd5e1',
    show_newsletter: true,
    newsletter_title: 'Join Web Nasir Academy Community',
    newsletter_subtitle: 'Get practical engineering guides on autonomous AI agents, Google AdSense high-RPM architectures, and production Jamstack systems directly to your inbox.',
    contact_email: 'support@webnasir.com',
    contact_whatsapp: '+91 7006334417',
    copyright_text: 'Web Nasir Academy. Built with Netlify Serverless Architecture & Firebase Authentication.',
    columns: [
      {
        id: 'col-tools',
        title: 'Free AI Utilities',
        links: [
          { label: 'YouTube Hook & Title Crafter', url: '#/tools/youtube' },
          { label: 'SEO Blog Outline Strategist', url: '#/tools/blogoutline' },
          { label: 'Code & Regex Explainer', url: '#/tools/codeexplainer' },
          { label: 'High-CTR Ad Copy Crafter', url: '#/tools/adcopy' },
          { label: 'AdSense Revenue Estimator', url: '#/tools/business' },
          { label: 'Brand Name Generator', url: '#/tools/name' },
          { label: 'AdSense Arbitrage Calculator', url: '#/tools/arbitrage' }
        ]
      },
      {
        id: 'col-courses',
        title: 'Paid Masterclasses',
        links: [
          { label: 'Complete AI Mastery (₹4,999)', url: '#/courses/complete-ai-mastery' },
          { label: 'Full-Stack Web Dev (₹6,499)', url: '#/courses/fullstack-web-dev' },
          { label: 'Technical SEO Mastery (₹3,999)', url: '#/courses/seo-mastery' },
          { label: 'Digital Marketing with AI (₹3,499)', url: '#/courses/digital-marketing-ai' },
          { label: 'Google AdSense High RPM (₹4,499)', url: '#/courses/adsense-blogging' },
          { label: 'YouTube Automation (₹3,999)', url: '#/courses/youtube-automation' }
        ]
      },
      {
        id: 'col-legal',
        title: 'Academy & Legal',
        links: [
          { label: 'About Founder Nasir', url: '#/about' },
          { label: 'Admissions & Contact', url: '#/contact' },
          { label: 'Career Pathways', url: '#/tracks' },
          { label: 'Guides & Case Studies', url: '#/articles' },
          { label: 'Student Dashboard', url: '#/student' },
          { label: 'Privacy Policy', url: '#/privacy' },
          { label: 'Terms & Conditions', url: '#/terms' }
        ]
      }
    ]
  };
  if (!(await getBlob('cms_footer'))) {
    await setBlob('cms_footer', cmsFooter);
  }

  // 20. CMS About Us Page Editor
  const cmsAbout = {
    badge: 'Digital Learning & Technology Platform',
    heading: 'Empowering Your Digital Future with AI, Technology & Practical Skills.',
    subtitle: 'Web Nasir is a digital learning and technology platform built to make modern digital skills accessible to everyone. We bring together practical AI tools, website development resources, SEO strategies, digital marketing education and professional online courses in one place.',
    cta_primary_text: 'Explore Our Free Tools',
    cta_primary_link: '/tools',
    cta_secondary_text: 'Explore Our Courses',
    cta_secondary_link: '/courses',
    founder_heading: 'Meet Nasir — Founder of Web Nasir',
    founder_name: 'Nasir',
    founder_role: 'Founder of Web Nasir',
    founder_photo: '',
    founder_description: "I'm Nasir, a digital technology enthusiast and online publisher focused on AI-powered tools, website development, SEO and digital growth. Through Web Nasir, my goal is to make practical digital knowledge easier to access and help individuals develop skills they can apply in the real world.",
    biography: "I'm Nasir, a digital technology enthusiast and online publisher focused on AI-powered tools, website development, SEO and digital growth. Through Web Nasir, my goal is to make practical digital knowledge easier to access and help individuals develop skills they can apply in the real world.",
    mission: 'To make practical digital education, AI-powered resources and technology accessible through useful tools and straightforward learning experiences.',
    vision: 'To build a trusted digital learning platform where people can explore technology, develop practical skills and discover new opportunities in the digital world.',
    video_url: '',
    offerings: [
      { title: 'Free AI Tools', description: 'Ready-to-use online utilities for content creation, SEO planning, code explanation, and productivity.', icon: 'sparkles', link: '/tools' },
      { title: 'Website Development', description: 'Practical resources and step-by-step training for building fast, modern, mobile-friendly websites.', icon: 'code', link: '/courses/fullstack-web-dev' },
      { title: 'SEO & Blogging', description: 'Clear search optimization strategies, keyword research frameworks, and content publishing guides.', icon: 'search', link: '/courses/seo-mastery' },
      { title: 'Digital Marketing', description: 'Actionable digital growth, audience building, and online campaign strategies for creators and businesses.', icon: 'trending-up', link: '/courses/digital-marketing-ai' },
      { title: 'AI & Automation', description: 'Learn how to apply AI workflows and modern automation tools to save time and scale projects.', icon: 'cpu', link: '/courses/complete-ai-mastery' },
      { title: 'Professional Online Courses', description: 'Structured, beginner-to-advanced learning pathways designed for real-world skill development.', icon: 'graduation-cap', link: '/courses' }
    ],
    why_items: [
      'Practical learning resources.',
      'Useful free AI tools.',
      'Technology-focused education.',
      'Professional learning pathways.',
      'Regular guides and tutorials.',
      'Beginner-friendly resources.'
    ],
    final_cta_heading: 'Start Building Your Digital Future Today.',
    cta_text: 'Explore Free Tools',
    cta_link: '/tools'
  };
  if (!(await getBlob('cms_about'))) {
    await setBlob('cms_about', cmsAbout);
  }

  // 21. CMS Contact Page Editor
  const cmsContact = {
    heading: "Let's Connect — We're Here to Help.",
    subtitle: "Have a question about our AI tools, online courses, website development or learning resources? Get in touch with the Web Nasir team. We're here to help you find the right information and support.",
    email: 'support@webnasir.com',
    support_email: 'support@webnasir.com',
    whatsapp: '+91 7006334417',
    phone: '+91 7006334417',
    address: 'Srinagar, Jammu & Kashmir — Operating Globally Online',
    office_hours: 'Monday – Saturday: 10:00 AM – 8:00 PM IST',
    form_enabled: true,
    whatsapp_cta_enabled: true
  };
  if (!(await getBlob('cms_contact'))) {
    await setBlob('cms_contact', cmsContact);
  }

  // 22. CMS SEO Settings
  const cmsSeo = {
    global_title: 'Web Nasir — Learn Digital Skills, Build Websites & Grow Your Online Business',
    meta_description: 'Explore practical tools, learn website development, master SEO and discover professional training to build your digital future with Web Nasir.',
    og_image: 'https://webnasir.dpdns.org/og-banner.png',
    twitter_card: 'summary_large_image',
    canonical_base: 'https://webnasir.dpdns.org',
    robots_txt: 'User-agent: *\nAllow: /\nDisallow: /admin',
    sitemap_enabled: true,
    schema_org_enabled: true
  };
  if (!(await getBlob('cms_seo'))) {
    await setBlob('cms_seo', cmsSeo);
  }

  // 23. CMS Media Library
  const cmsMedia = [
    { id: 'med-1', title: 'Academy Hero Banner', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80', type: 'image', alt: 'Web Nasir Academy Collaborative Learning', used_in: 'Homepage Hero', created_at: now },
    { id: 'med-2', title: 'AI Mastery Course Cover', url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80', type: 'image', alt: 'Complete AI Mastery Course Thumbnail', used_in: 'Courses Catalog', created_at: now },
    { id: 'med-3', title: 'Full-Stack Web Dev Cover', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80', type: 'image', alt: 'Full-Stack Web Development Thumbnail', used_in: 'Courses Catalog', created_at: now },
    { id: 'med-4', title: 'Founder Intro Video Stream', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', type: 'video', alt: 'Founder Nasir Welcome Video', used_in: 'Founder Video Section', created_at: now }
  ];
  if (!(await getBlob('cms_media'))) {
    await setBlob('cms_media', cmsMedia);
  }

  // 24. CMS Payment Gateway Settings
  const cmsPayments = {
    razorpay_enabled: true,
    mode: 'test',
    key_id: 'rzp_test_webnasir_demo',
    key_secret_masked: '••••••••••••••••',
    currency: 'INR',
    currency_symbol: '₹',
    checkout_brand_name: 'Web Nasir Academy',
    checkout_description: 'Instant Lifetime Access to Masterclass & Source Code',
    methods: {
      upi: true,
      cards: true,
      netbanking: true,
      wallets: true
    },
    success_redirect: '#/student',
    failure_redirect: '#/courses',
    webhook_url: 'https://webnasir.dpdns.org/api/webhooks/razorpay',
    connection_status: 'Connected (Test Mode Ready)'
  };
  if (!(await getBlob('cms_payments'))) {
    await setBlob('cms_payments', cmsPayments);
  }

  // 25. CMS Users & Role Access Management
  const cmsUsers = [
    { id: 'adm-1', username: 'admin', email: 'muharim6@gmail.com', role: 'Super Admin', permissions: 'Full CMS, Payments, Security & Student Access', status: 'active', last_active: now }
  ];
  if (!(await getBlob('cms_users'))) {
    await setBlob('cms_users', cmsUsers);
  }

  // 26. CMS Revisions & Audit Logs
  if (!(await getBlob('cms_revisions'))) {
    await setBlob('cms_revisions', [
      { id: 'rev-initial', label: 'Initial Production Academy State', created_at: now, author: 'admin' }
    ]);
  }
  if (!(await getBlob('cms_audit_logs'))) {
    await setBlob('cms_audit_logs', [
      { id: 'log-1', action: 'System Seeded with Complete 27-Module CMS Control Center', actor: 'system', timestamp: now }
    ]);
  }

  await ensureExtendedCmsSeeded();

  // 27. Meta Seed Marker
  await setBlob('meta', {
    seeded: true,
    seeded_at: now,
  });

  console.log('Web Nasir Academy extended 27-module CMS seeding completed.');
}

async function ensureExtendedCmsSeeded() {
  const now = new Date().toISOString();

  // A. Top Announcement Bar Detailed Config
  const existingAnnouncement = await getBlob('cms_announcement');
  if (!existingAnnouncement) {
    await setBlob('cms_announcement', {
      enabled: true,
      mobile_visible: true,
      badge: 'New 2025 Edition',
      text: 'Web Nasir Academy is Live: Free AI Utilities, Professional Paid Courses & High-RPM Blueprints!',
      button_text: 'Explore Courses →',
      link_url: '#/courses',
      icon: 'sparkles',
      bg_color: '#0f172a',
      text_color: '#ffffff',
      badge_bg: '#7c3aed',
      font_size: '0.78rem',
      font_weight: '600',
      height: '40px',
      padding_y: '8px',
      animation: 'none',
      start_date: '',
      end_date: ''
    });
  }

  // B. Marquee / News Ticker Detailed Config (White Background & Black Text)
  const existingMarqueeCfg = await getBlob('cms_marquee_config');
  if (!existingMarqueeCfg) {
    await setBlob('cms_marquee_config', {
      enabled: true,
      mobile_visible: true,
      speed_seconds: 32,
      direction: 'left',
      bg_color: '#ffffff',
      text_color: '#000000',
      border_color: '#e2e8f0',
      accent_color: '#7c3aed',
      font_size: '0.82rem',
      pause_on_hover: true,
      position: 'below_hero',
      start_date: '',
      end_date: ''
    });
  }

  // B2. Featured Announcements Popup System (cms_featured_announcements)
  const existingFeaturedAnnouncements = await getBlob('cms_featured_announcements');
  if (!existingFeaturedAnnouncements || !Array.isArray(existingFeaturedAnnouncements)) {
    await setBlob('cms_featured_announcements', [
      {
        id: 'feat-ann-welcome',
        title: 'Explore Free AI Tools & Digital Skills Courses',
        description: 'Build websites, master SEO, and use 11+ free AI tools designed for real-world digital growth with Web Nasir.',
        highlight_text: 'Featured Update',
        content_type: 'text', // 'image' | 'video' | 'text'
        image_url: '',
        video_url: '',
        cta_enabled: true,
        cta_text: 'Explore Free Tools',
        cta_url: '/tools',
        animation: 'zoom-in', // 'fade-in' | 'zoom-in' | 'slide-up' | 'slide-down'
        priority: 1,
        start_date: '',
        expiry_date: '',
        delay_seconds: 2,
        display_duration_seconds: 0,
        frequency: 'once_per_session', // 'once_per_visitor' | 'once_per_session' | 'every_visit'
        target_audience: 'all', // 'all' | 'logged_in'
        show_on_mobile: true,
        show_on_desktop: true,
        enabled: false,
        status: 'published', // 'draft' | 'published'
        created_at: now,
        updated_at: now
      }
    ]);
  }

  // C. Sidebar Manager Configuration
  const existingSidebars = await getBlob('cms_sidebars');
  if (!existingSidebars) {
    await setBlob('cms_sidebars', {
      global_enabled: true,
      position: 'left',
      width: '280px',
      bg_color: '#ffffff',
      text_color: '#0f172a',
      sticky: true,
      default_collapsed: false,
      mobile_drawer: true,
      page_visibility: {
        tools: true,
        courses: true,
        articles: true,
        student: true,
        homepage: false
      },
      sections: [
        {
          id: 'sb-quick-nav',
          heading: 'Academy Navigation',
          items: [
            { label: '11 Free AI Utilities', url: '#/tools', icon: 'cpu', enabled: true },
            { label: '8 Flagship Masterclasses', url: '#/courses', icon: 'graduation-cap', enabled: true },
            { label: 'Free Starter Bootcamps', url: '#/courses?filter=free', icon: 'gift', enabled: true },
            { label: 'Career Learning Tracks', url: '#/tracks', icon: 'compass', enabled: true },
            { label: 'Case Studies & Guides', url: '#/articles', icon: 'book-open', enabled: true },
            { label: 'Student Portal', url: '#/student', icon: 'user', enabled: true }
          ]
        }
      ]
    });
  }

  // D. Upgrade cms_appearance with Mobile Optimization Tokens & Color Palettes
  const appearance = (await getBlob('cms_appearance')) || {};
  if (!appearance.mobile) {
    appearance.theme_mode = appearance.theme_mode || 'light';
    appearance.colors = {
      primary: '#7c3aed',
      secondary: '#4f46e5',
      accent: '#10b981',
      background: '#ffffff',
      surface: '#f8fafc',
      header_bg: '#ffffff',
      header_text: '#0f172a',
      footer_bg: '#0b0f19',
      footer_text: '#cbd5e1',
      card_bg: '#ffffff',
      heading_text: '#0f172a',
      body_text: '#334155',
      link_color: '#7c3aed',
      button_bg: '#7c3aed',
      button_text: '#ffffff',
      button_hover: '#6d28d9',
      border_color: '#e2e8f0',
      ...(appearance.colors || {})
    };
    appearance.typography = {
      heading_font: 'Poppins',
      body_font: 'Inter',
      nav_font: 'Inter',
      button_font: 'Inter',
      h1_size: '3.25rem',
      h2_size: '2.25rem',
      h3_size: '1.35rem',
      h4_size: '1.125rem',
      body_size: '0.95rem',
      small_size: '0.82rem',
      button_text_size: '0.85rem',
      nav_text_size: '0.82rem',
      footer_text_size: '0.8rem',
      font_weight_heading: '800',
      line_height: '1.6',
      letter_spacing: '-0.02em',
      ...(appearance.typography || {})
    };
    appearance.layout = {
      container_width: '1280px',
      section_spacing: '5rem',
      section_margin: '0rem',
      card_spacing: '1.5rem',
      card_radius: '1.5rem',
      button_radius: '0.875rem',
      card_shadow: 'subtle',
      header_height: '5rem',
      image_aspect_ratio: '16/9',
      grid_columns_desktop: 3,
      grid_columns_tablet: 2,
      grid_columns_mobile: 1,
      ...(appearance.layout || {})
    };
    appearance.mobile = {
      header_height: '4rem',
      logo_size: '2.25rem',
      menu_style: 'slide_drawer',
      hero_h1_size: '2.1rem',
      hero_subtitle_size: '0.95rem',
      body_text_size: '0.92rem',
      card_columns: 1,
      button_full_width: true,
      button_min_height: '46px',
      section_padding_y: '3rem',
      footer_stack: 'vertical',
      video_aspect_ratio: '16/9',
      hide_announcement_on_small: false
    };
    appearance.palettes = [
      { id: 'pal-default', name: 'Web Nasir Royal Violet (Default)', primary: '#7c3aed', secondary: '#4f46e5', accent: '#10b981', background: '#ffffff', surface: '#f8fafc', heading_text: '#0f172a', body_text: '#334155' },
      { id: 'pal-emerald', name: 'Emerald Engineering Studio', primary: '#059669', secondary: '#0d9488', accent: '#6366f1', background: '#ffffff', surface: '#f0fdf4', heading_text: '#064e3b', body_text: '#1e293b' },
      { id: 'pal-ocean', name: 'Executive Cobalt Blue', primary: '#2563eb', secondary: '#1d4ed8', accent: '#f59e0b', background: '#ffffff', surface: '#f8fafc', heading_text: '#0f172a', body_text: '#334155' },
      { id: 'pal-dark', name: 'Midnight Obsidian Dark', primary: '#8b5cf6', secondary: '#6366f1', accent: '#10b981', background: '#090d16', surface: '#111827', heading_text: '#f8fafc', body_text: '#cbd5e1' }
    ];
    await setBlob('cms_appearance', appearance);
  }

  // E. Complete 24-Page Manager Catalog (cms_pages)
  const existingPages = await getBlob('cms_pages');
  if (!existingPages || !Array.isArray(existingPages) || existingPages.length === 0) {
    const defaultPages = [
      { id: 'page-home', title: 'Homepage', slug: '#/', route_type: 'system', is_system_protected: true, status: 'published', visibility: 'public', heading: 'Master AI, Build Digital Skills & Create Your Online Future.', subtitle: 'Learn practical AI, website development, SEO, digital marketing and online business strategies with Nasir.', seo_title: 'Web Nasir Academy — Practical AI Tools, Full-Stack Web Dev & High-RPM Monetization', seo_description: 'Access 11 free AI tools, 8 flagship masterclasses, and battle-tested AdSense & SEO blueprints.', bg_color: '#ffffff', text_color: '#0f172a', layout: 'full-width', updated_at: now },
      { id: 'page-about', title: 'About Us', slug: '#/about', route_type: 'system', is_system_protected: false, status: 'published', visibility: 'public', heading: 'Empowering Your Digital Future with AI, Technology & Practical Skills.', subtitle: 'Web Nasir is a digital learning and technology platform built to make modern digital skills accessible to everyone.', seo_title: 'About Us — Web Nasir', seo_description: 'Web Nasir is a digital learning and technology platform built to make modern digital skills accessible to everyone.', bg_color: '#ffffff', text_color: '#0f172a', layout: 'standard', updated_at: now },
      { id: 'page-contact', title: 'Contact Us', slug: '#/contact', route_type: 'system', is_system_protected: false, status: 'published', visibility: 'public', heading: "Let's Connect — We're Here to Help.", subtitle: 'Have a question about our AI tools, online courses, website development or learning resources? Get in touch with the Web Nasir team.', seo_title: 'Contact Us — Web Nasir', seo_description: 'Reach Web Nasir support via Email or WhatsApp (+91 7006334417).', bg_color: '#ffffff', text_color: '#0f172a', layout: 'standard', updated_at: now },
      { id: 'page-tools', title: 'Free AI Tools', slug: '#/tools', route_type: 'system', is_system_protected: true, status: 'published', visibility: 'public', heading: '11 Free AI & Webmaster Utilities', subtitle: 'Production-grade AI generators, SEO analyzers, and revenue calculators.', seo_title: '11 Free AI & SEO Tools — Web Nasir Academy', seo_description: 'Use 11 free AI & webmaster utilities powered by Gemini Flash and deterministic calculators.', bg_color: '#ffffff', text_color: '#0f172a', layout: 'grid', updated_at: now },
      { id: 'page-tool-detail', title: 'Individual AI Tool Pages', slug: '#/tools/:id', route_type: 'dynamic', is_system_protected: true, status: 'published', visibility: 'public', heading: 'Interactive AI Utility Workspace', subtitle: 'Configure inputs, generate real-time results, and save to your student workspace.', seo_title: 'AI Tool Workspace — Web Nasir Academy', seo_description: 'Interactive AI generator and webmaster utility workspace.', bg_color: '#ffffff', text_color: '#0f172a', layout: 'workspace', updated_at: now },
      { id: 'page-courses', title: 'Paid Courses', slug: '#/courses', route_type: 'system', is_system_protected: true, status: 'published', visibility: 'public', heading: 'Industry-Ready Flagship Masterclasses', subtitle: 'Structured engineering and digital monetization courses with lifetime access.', seo_title: 'Flagship Masterclasses & Courses — Web Nasir Academy', seo_description: 'Enroll in practical AI engineering, full-stack web dev, technical SEO, and AdSense masterclasses.', bg_color: '#f8fafc', text_color: '#0f172a', layout: 'grid', updated_at: now },
      { id: 'page-course-detail', title: 'Individual Course Pages', slug: '#/courses/:id', route_type: 'dynamic', is_system_protected: true, status: 'published', visibility: 'public', heading: 'Masterclass Syllabus & Enrollment', subtitle: 'Explore full module breakdown, learning outcomes, and instant checkout.', seo_title: 'Course Curriculum & Enrollment — Web Nasir Academy', seo_description: 'Detailed course syllabus, video lessons, and instant Razorpay/UPI enrollment.', bg_color: '#ffffff', text_color: '#0f172a', layout: 'split', updated_at: now },
      { id: 'page-free-courses', title: 'Free Courses', slug: '#/courses?filter=free', route_type: 'system', is_system_protected: true, status: 'published', visibility: 'public', heading: '100% Free Starter Courses & Bootcamps', subtitle: 'Enroll with one click using your Google or Email student account.', seo_title: 'Free AI & Web Dev Starter Courses — Web Nasir Academy', seo_description: 'Start learning AI prompt engineering, AdSense approval, and Jamstack deployment for free.', bg_color: '#ffffff', text_color: '#0f172a', layout: 'grid', updated_at: now },
      { id: 'page-tracks', title: 'Learning Pathways', slug: '#/tracks', route_type: 'system', is_system_protected: false, status: 'published', visibility: 'public', heading: 'Outcome-Driven Learning Pathways', subtitle: 'Step-by-step roadmaps from foundational concepts to commercial deployment.', seo_title: 'Career Learning Pathways — Web Nasir Academy', seo_description: 'Structured learning tracks for AI builders, full-stack developers, and digital publishers.', bg_color: '#ffffff', text_color: '#0f172a', layout: 'standard', updated_at: now },
      { id: 'page-articles', title: 'Guides & Articles', slug: '#/articles', route_type: 'system', is_system_protected: false, status: 'published', visibility: 'public', heading: 'Technical Guides & Engineering Blueprints', subtitle: 'In-depth tutorials on AI architectures, SEO, and high-RPM monetization.', seo_title: 'Technical Guides & Tutorials — Web Nasir Academy', seo_description: 'Read practical engineering guides and digital publishing blueprints by Nasir.', bg_color: '#ffffff', text_color: '#0f172a', layout: 'grid', updated_at: now },
      { id: 'page-article-detail', title: 'Individual Article Pages', slug: '#/articles/:slug', route_type: 'dynamic', is_system_protected: true, status: 'published', visibility: 'public', heading: 'Technical Deep-Dive Article', subtitle: 'Detailed architecture notes, benchmarks, and implementation steps.', seo_title: 'Technical Article — Web Nasir Academy', seo_description: 'In-depth technical article and engineering breakdown.', bg_color: '#ffffff', text_color: '#0f172a', layout: 'editorial', updated_at: now },
      { id: 'page-case-studies', title: 'Case Studies', slug: '#/articles?tag=case-study', route_type: 'system', is_system_protected: false, status: 'published', visibility: 'public', heading: 'Verified Production Case Studies', subtitle: 'Real traffic, RPM, and architecture case studies from live web properties.', seo_title: 'Production Case Studies — Web Nasir Academy', seo_description: 'Verified AdSense RPM, SEO growth, and AI SaaS case studies.', bg_color: '#ffffff', text_color: '#0f172a', layout: 'grid', updated_at: now },
      { id: 'page-student-login', title: 'Student Login', slug: '#/student-login', route_type: 'system', is_system_protected: true, status: 'published', visibility: 'public', heading: 'Sign In to Your Student Account', subtitle: 'Continue with Google or Email & Password to access your enrolled courses and saved AI generations.', seo_title: 'Student Sign In — Web Nasir Academy', seo_description: 'Sign in or create your free Web Nasir Academy student account.', bg_color: '#f8fafc', text_color: '#0f172a', layout: 'auth', updated_at: now },
      { id: 'page-student-dashboard', title: 'Student Dashboard', slug: '#/student', route_type: 'system', is_system_protected: true, status: 'published', visibility: 'authenticated', heading: 'Student Learning Portal & Saved AI Workspace', subtitle: 'Access your enrolled paid and free courses, progress tracker, and saved AI outputs.', seo_title: 'Student Portal — Web Nasir Academy', seo_description: 'Your personal learning dashboard and saved AI generations.', bg_color: '#f8fafc', text_color: '#0f172a', layout: 'dashboard', updated_at: now },
      { id: 'page-my-courses', title: 'My Courses', slug: '#/student?tab=courses', route_type: 'system', is_system_protected: true, status: 'published', visibility: 'authenticated', heading: 'My Enrolled Courses & Bootcamps', subtitle: 'Resume your video lessons, download source code templates, and track completion.', seo_title: 'My Enrolled Courses — Web Nasir Academy', seo_description: 'Access your enrolled Web Nasir Academy courses and lessons.', bg_color: '#f8fafc', text_color: '#0f172a', layout: 'dashboard', updated_at: now },
      { id: 'page-checkout', title: 'Checkout', slug: '#/checkout', route_type: 'system', is_system_protected: true, status: 'published', visibility: 'public', heading: 'Secure Course Enrollment & Checkout', subtitle: 'Instant enrollment via UPI, Debit/Credit Cards, NetBanking, or Razorpay.', seo_title: 'Secure Checkout — Web Nasir Academy', seo_description: 'Complete your course enrollment securely via Razorpay or UPI.', bg_color: '#f8fafc', text_color: '#0f172a', layout: 'checkout', updated_at: now },
      { id: 'page-payment-success', title: 'Payment Success', slug: '#/payment-success', route_type: 'system', is_system_protected: true, status: 'published', visibility: 'public', heading: 'Enrollment Confirmed! Welcome to the Masterclass.', subtitle: 'Your payment has been verified and instant course access is unlocked in your Student Portal.', seo_title: 'Enrollment Confirmed — Web Nasir Academy', seo_description: 'Payment confirmed and course unlocked.', bg_color: '#f0fdf4', text_color: '#064e3b', layout: 'centered', updated_at: now },
      { id: 'page-payment-failure', title: 'Payment Failure', slug: '#/payment-failure', route_type: 'system', is_system_protected: true, status: 'published', visibility: 'public', heading: 'Payment Could Not Be Completed', subtitle: 'No worries — if any amount was debited, it will be automatically refunded or verified by support.', seo_title: 'Payment Status — Web Nasir Academy', seo_description: 'Retry your course enrollment or contact WhatsApp support.', bg_color: '#fef2f2', text_color: '#7f1d1d', layout: 'centered', updated_at: now },
      { id: 'page-privacy', title: 'Privacy Policy', slug: '#/privacy', route_type: 'legal', is_system_protected: false, status: 'published', visibility: 'public', heading: 'Privacy Policy & Data Protection', subtitle: 'How Web Nasir Academy collects, secures, and processes student and visitor data.', body_content: 'Web Nasir Academy respects your privacy. We use Firebase Authentication for secure student sign-in and store only essential profile, course enrollment, and saved AI generation data. We never sell personal data to third parties.', seo_title: 'Privacy Policy — Web Nasir Academy', seo_description: 'Privacy policy and student data protection standards at Web Nasir Academy.', bg_color: '#ffffff', text_color: '#0f172a', layout: 'editorial', updated_at: now },
      { id: 'page-terms', title: 'Terms & Conditions', slug: '#/terms', route_type: 'legal', is_system_protected: false, status: 'published', visibility: 'public', heading: 'Terms & Conditions of Use', subtitle: 'Academic integrity, course licensing, refund policies, and acceptable use of AI utilities.', body_content: 'By accessing Web Nasir Academy, you agree to use our 11 free AI tools and paid masterclasses for lawful educational and commercial building purposes. Paid courses include lifetime single-user access and source code usage rights.', seo_title: 'Terms & Conditions — Web Nasir Academy', seo_description: 'Terms of service and course licensing policies for Web Nasir Academy.', bg_color: '#ffffff', text_color: '#0f172a', layout: 'editorial', updated_at: now },
      { id: 'page-disclaimer', title: 'Disclaimer', slug: '#/disclaimer', route_type: 'legal', is_system_protected: false, status: 'published', visibility: 'public', heading: 'Educational & Earnings Disclaimer', subtitle: 'Transparency regarding technical outcomes, AdSense RPMs, and commercial results.', body_content: 'All revenue calculators, AdSense RPM benchmarks, and traffic case studies shared on Web Nasir Academy represent real historical engineering data. Individual student results depend on niche selection, execution quality, and traffic volume.', seo_title: 'Disclaimer — Web Nasir Academy', seo_description: 'Educational and earnings disclaimer for Web Nasir Academy.', bg_color: '#ffffff', text_color: '#0f172a', layout: 'editorial', updated_at: now },
      { id: 'page-faq', title: 'FAQ', slug: '#/faq', route_type: 'system', is_system_protected: false, status: 'published', visibility: 'public', heading: 'Frequently Asked Questions', subtitle: 'Everything you need to know about our free AI utilities, paid masterclasses, certificates, and mentorship.', body_content: 'Q: Are the 11 AI tools completely free?\nA: Yes, all 11 AI & webmaster utilities are 100% free to use.\n\nQ: How do I access paid courses after payment?\nA: Immediately after Razorpay or UPI verification, the course unlocks inside your Student Portal with lifetime access.\n\nQ: Do I get source code templates?\nA: Yes, all engineering and AI masterclasses include downloadable production templates.', seo_title: 'Frequently Asked Questions — Web Nasir Academy', seo_description: 'Answers to common questions about Web Nasir Academy courses, AI tools, and payments.', bg_color: '#ffffff', text_color: '#0f172a', layout: 'editorial', updated_at: now },
      { id: 'page-search', title: 'Search Results', slug: '#/search', route_type: 'system', is_system_protected: true, status: 'published', visibility: 'public', heading: 'Search Courses, AI Tools & Guides', subtitle: 'Find any tool, course module, or technical blueprint across Web Nasir Academy.', seo_title: 'Search — Web Nasir Academy', seo_description: 'Search across all courses, AI tools, and articles on Web Nasir Academy.', bg_color: '#ffffff', text_color: '#0f172a', layout: 'grid', updated_at: now },
      { id: 'page-custom-landing', title: 'Custom Landing Pages (AI SaaS Bootcamp)', slug: '#/page/ai-bootcamp', route_type: 'custom', is_system_protected: false, status: 'published', visibility: 'public', heading: 'Build & Launch Your First Profitable AI Micro-SaaS in 14 Days', subtitle: 'A dedicated intensive workshop by Founder Nasir with deployable Netlify serverless templates and Gemini API integration.', cta_text: 'Enroll in Complete AI Mastery →', cta_link: '#/courses/complete-ai-mastery', body_content: 'This custom landing page is 100% managed from the Web Nasir Page Builder. You can duplicate this page, customize its hero banner, add custom sections, or create unlimited promotional landing pages without touching code.', seo_title: 'AI Micro-SaaS 14-Day Bootcamp — Web Nasir Academy', seo_description: 'Launch a production AI Micro-SaaS using Gemini Flash and Netlify Serverless Functions.', bg_color: '#0f172a', text_color: '#ffffff', layout: 'landing', updated_at: now }
    ];
    await setBlob('cms_pages', defaultPages);
  }

  // F. Draft Staging Store (cms_drafts)
  const existingDrafts = await getBlob('cms_drafts');
  if (!existingDrafts) {
    await setBlob('cms_drafts', {
      has_unpublished_changes: false,
      updated_at: now,
      draft_modules: {}
    });
  }

  // G. Non-destructively backfill missing extended tool schema keys on existing tools (without ever touching name, description, etc.)
  const currentTools = await getBlob('tools_index');
  if (Array.isArray(currentTools) && currentTools.length > 0) {
    let schemaBackfilled = false;
    const defaultMetaByKey = {
      youtube: { custom_prompt: 'Generate 5 viral, high-CTR YouTube video titles, 2 magnetic first-30-second retention hooks, and 2 visual thumbnail concept descriptions.', input_fields: 'Video Topic / Working Title, Target Tone / Audience Vibe', output_format: 'Markdown (Titles, 30s Hooks, Thumbnail Concepts)', is_featured: true },
      blogoutline: { custom_prompt: 'Create a comprehensive high-ranking SEO blog outline including search intent, high-CPC keywords, meta tags, and H2/H3 hierarchy.', input_fields: 'Target Keyword or Article Topic', output_format: 'Markdown (Keyword Cluster, Meta Tags, H2/H3 Outline)', is_featured: true },
      codeexplainer: { custom_prompt: 'Analyze and clearly explain the code snippet, regular expression, or command in plain English with optimization tips.', input_fields: 'Code Snippet, Regex, or Terminal Command', output_format: 'Markdown (Summary, Line-by-Line Breakdown, Security & Performance Fixes)', is_featured: true },
      adcopy: { custom_prompt: 'Craft 3 high-converting ad copy variations (Headlines, Body text, and Call to Actions) to drive high-intent clicks and low CPC.', input_fields: 'Product, Niche Website, or Offer Description', output_format: 'Markdown (3 Ad Variations with Headlines, Primary Text & CTA)', is_featured: true },
      business: { custom_prompt: '', input_fields: 'Daily Pageviews, Niche Category RPM, Target Tier Geography', output_format: 'Interactive Revenue Dashboard (Daily, Monthly, Annual Projections)', is_featured: true },
      name: { custom_prompt: '', input_fields: 'Core Keyword / Industry, Brand Naming Style', output_format: 'Interactive Brand Cards with .com/.io/.ai Domain Hints', is_featured: false },
      instagram: { custom_prompt: '', input_fields: 'Post Topic / Keyword, Caption Vibe', output_format: 'Viral Caption + 30 Tri-Tier Hashtags', is_featured: false },
      wordcount: { custom_prompt: '', input_fields: 'Article or Draft Text', output_format: 'Real-Time Word, Character, Reading Time & Keyword Metrics', is_featured: false },
      password: { custom_prompt: '', input_fields: 'Password Length, Character Sets (Uppercase, Numbers, Symbols)', output_format: 'Cryptographic Password String + Entropy Rating', is_featured: false },
      age: { custom_prompt: '', input_fields: 'Date of Birth', output_format: 'Years, Months, Days, Total Days & Next Birthday Countdown', is_featured: false },
      arbitrage: { custom_prompt: '', input_fields: 'Paid Clicks, CPC ($), Pageviews/Visit, AdSense Session RPM ($)', output_format: 'Gross Revenue, Ad Spend, Net Profit & ROI % Breakdown', is_featured: false },
    };
    const cleanSlugByKey = {
      youtube: 'youtube-title-generator',
      blogoutline: 'seo-blog-outline-generator',
      codeexplainer: 'code-and-regex-explainer',
      adcopy: 'high-converting-ad-copy-generator',
      business: 'adsense-rpm-revenue-calculator',
      name: 'brand-and-domain-name-generator',
      instagram: 'social-media-caption-generator',
      wordcount: 'seo-word-and-keyword-density-counter',
      password: 'cryptographic-password-generator',
      age: 'exact-age-and-milestone-calculator',
      arbitrage: 'adsense-arbitrage-profit-calculator',
    };
    for (const t of currentTools) {
      const def = defaultMetaByKey[t.key] || {};
      if (!t.id) { t.id = t.key; schemaBackfilled = true; }
      if (!t.seo_slug || t.seo_slug === t.key) {
        if (cleanSlugByKey[t.key]) {
          t.seo_slug = cleanSlugByKey[t.key];
          schemaBackfilled = true;
        } else if (!t.seo_slug) {
          t.seo_slug = t.key;
          schemaBackfilled = true;
        }
      }
      if (t.is_featured === undefined) { t.is_featured = def.is_featured ?? false; schemaBackfilled = true; }
      if (t.custom_prompt === undefined) { t.custom_prompt = def.custom_prompt ?? ''; schemaBackfilled = true; }
      if (t.input_fields === undefined) { t.input_fields = def.input_fields ?? 'User Input'; schemaBackfilled = true; }
      if (t.output_format === undefined) { t.output_format = def.output_format ?? 'Formatted Output'; schemaBackfilled = true; }
    }
    if (schemaBackfilled) {
      await setBlob('tools_index', currentTools);
    }
  }

  // H. Ensure 'seo-for-beginners' article is seeded so /articles/seo-for-beginners works out-of-the-box
  const articlesIdx = (await getBlob('articles_index')) || [];
  if (!articlesIdx.some((a) => a.slug === 'seo-for-beginners')) {
    const seoBegArticle = {
      slug: 'seo-for-beginners',
      tag: 'blogging',
      title: 'SEO for Beginners: Complete Step-by-Step Guide to Ranking Websites on Google',
      meta: 'A practical, beginner-friendly guide to keyword research, on-page SEO, helpful content structure, and building steady search traffic.',
      sort_order: articlesIdx.length + 1,
      is_published: true,
      created_at: now,
      updated_at: now,
      body: `# SEO for Beginners: How Search Engines Really Work\n\nSearch Engine Optimization (SEO) does not need to be complicated or filled with confusing technical jargon. At its core, SEO is about understanding what real people are searching for and creating the clearest, most helpful page on the internet to answer their question.\n\n## 1. Choose Topics Real People Search For\n\nBefore writing a single paragraph, look at the exact questions beginners and customers ask in your niche. Focus on specific long-tail topics where you can provide genuine, first-hand answers.\n\n## 2. Structure Your Page Clearly\n\n- Use one clear **H1 heading** that states the main topic of the page.\n- Break your guide into logical **H2 and H3 subheadings**.\n- Keep paragraphs short and easy to read on mobile phones.\n- Include practical examples, checklists, and internal links to related tools and tutorials.\n\n## 3. Technical Essentials That Matter\n\n- **Clean URLs**: Use simple, readable URLs like \`/articles/seo-for-beginners\`.\n- **Fast Mobile Loading**: Over 90% of readers browse on mobile devices—keep layouts lightweight and responsive.\n- **Unique Titles & Descriptions**: Give every page a clear meta title and summary so searchers know why to click.`,
    };
    articlesIdx.push({
      slug: seoBegArticle.slug,
      tag: seoBegArticle.tag,
      title: seoBegArticle.title,
      meta: seoBegArticle.meta,
      sort_order: seoBegArticle.sort_order,
      is_published: true,
      created_at: now,
      updated_at: now,
    });
    await setBlob('articles_index', articlesIdx);
    await setBlob('article:seo-for-beginners', seoBegArticle);
  }

  // I. Ensure 'refund-policy' page exists in cms_pages
  const cmsPagesList = (await getBlob('cms_pages')) || [];
  if (!cmsPagesList.some((p) => p.slug === '/refund-policy' || p.slug === '#/refund-policy')) {
    cmsPagesList.push({
      id: 'page-refund-policy',
      title: 'Refund Policy',
      slug: '/refund-policy',
      route_type: 'legal',
      is_system_protected: false,
      status: 'published',
      visibility: 'public',
      heading: 'Refund & Cancellation Policy',
      subtitle: 'Clear, fair, and transparent enrollment and refund terms for Web Nasir courses.',
      body_content: `At Web Nasir, we want you to learn with complete confidence.\n\n1. 7-Day Satisfaction Review: If you experience any technical issue accessing your enrolled course or find that the course does not match its published curriculum, contact us within 7 days of purchase at support@webnasir.com or on WhatsApp (+91 7006334417).\n\n2. Duplicate Payments: Any accidental duplicate payment made via UPI, Card, or NetBanking is 100% refunded automatically within 3–5 business days.\n\n3. Direct Support: Reach out to our team anytime and we will resolve your billing or course access request promptly.`,
      seo_title: 'Refund Policy | Web Nasir',
      seo_description: 'Transparent course refund and cancellation policy for Web Nasir students.',
      bg_color: '#ffffff',
      text_color: '#0f172a',
      layout: 'editorial',
      updated_at: now,
    });
    await setBlob('cms_pages', cmsPagesList);
  }

  // J. One-time Clean-URL, Hero & 4-Column Footer migration (never overwrites subsequent admin edits)
  const currentMeta = (await getBlob('meta')) || {};
  if (!currentMeta.v2_clean_urls_migrated) {
    const currSettings = (await getBlob('settings')) || {};
    if (
      !currSettings.hero_title ||
      currSettings.hero_title === 'Master AI, Build Digital Skills & Create Your Online Future.' ||
      currSettings.hero_title.includes('Master AI Engineering') ||
      currSettings.hero_title.includes('High-RPM')
    ) {
      currSettings.site_name = 'Web Nasir';
      currSettings.hero_badge = 'Online Learning & Digital Tools';
      currSettings.hero_title = 'Learn Digital Skills. Build Websites. Grow Your Online Business.';
      currSettings.hero_subtitle =
        'Explore practical tools, learn website development, master SEO and discover professional training to build your digital future with Web Nasir.';
      currSettings.footer_text =
        'Web Nasir helps people learn digital skills, create websites, use practical tools and grow their online businesses.';
      await setBlob('settings', currSettings);
    }

    const currHome = (await getBlob('cms_homepage')) || {};
    if (Array.isArray(currHome.sections)) {
      let homeChanged = false;
      const heroSec = currHome.sections.find((s) => s.id === 'hero');
      if (heroSec) {
        if (heroSec.enabled === false) { heroSec.enabled = true; homeChanged = true; }
        if (heroSec.order !== 1) { heroSec.order = 1; homeChanged = true; }
        if (heroSec.heading === 'Master AI, Build Digital Skills & Create Your Online Future.') {
          heroSec.heading = 'Learn Digital Skills. Build Websites. Grow Your Online Business.';
          heroSec.subtitle =
            'Explore practical tools, learn website development, master SEO and discover professional training to build your digital future with Web Nasir.';
          heroSec.cta_primary_text = 'Explore Free Tools';
          heroSec.cta_primary_link = '/tools';
          heroSec.cta_secondary_text = 'Explore Courses';
          heroSec.cta_secondary_link = '/courses';
          homeChanged = true;
        }
      }
      const marqueeSec = currHome.sections.find((s) => s.id === 'marquee');
      if (marqueeSec && marqueeSec.order !== 2) {
        marqueeSec.order = 2;
        homeChanged = true;
      }
      if (homeChanged) {
        await setBlob('cms_homepage', currHome);
      }
    }

    const currFooter = (await getBlob('cms_footer')) || {};
    if (
      !currFooter.columns ||
      currFooter.columns.some((c) => c.id === 'col-tools')
    ) {
      currFooter.brand_title = 'Web Nasir';
      currFooter.brand_description =
        'Web Nasir helps people learn digital skills, create websites, use practical tools and grow their online businesses.';
      currFooter.contact_email = currFooter.contact_email || 'support@webnasir.com';
      currFooter.contact_whatsapp = currFooter.contact_whatsapp || '+91 7006334417';
      currFooter.copyright_text = 'Web Nasir. All rights reserved.';
      currFooter.columns = [
        {
          id: 'col-explore',
          title: 'Explore',
          links: [
            { label: 'Free Tools', url: '/tools' },
            { label: 'Paid Courses', url: '/courses' },
            { label: 'Free Courses', url: '/free-courses' },
            { label: 'Guides & Tutorials', url: '/articles' },
          ],
        },
        {
          id: 'col-learn',
          title: 'Learn',
          links: [
            { label: 'Website Development', url: '/courses/fullstack-web-dev' },
            { label: 'SEO & Blogging', url: '/courses/seo-mastery' },
            { label: 'Digital Marketing', url: '/courses/digital-marketing-ai' },
            { label: 'AI & Automation', url: '/courses/complete-ai-mastery' },
            { label: 'Online Business', url: '/courses/adsense-blogging' },
          ],
        },
        {
          id: 'col-company',
          title: 'Company',
          links: [
            { label: 'About Nasir', url: '/about' },
            { label: 'Contact Us', url: '/contact' },
            { label: 'Privacy Policy', url: '/privacy' },
            { label: 'Terms & Conditions', url: '/terms' },
            { label: 'Refund Policy', url: '/refund-policy' },
          ],
        },
      ];
      await setBlob('cms_footer', currFooter);
    }

    const latestSeo = (await getBlob('cms_seo')) || {};
    if (!latestSeo.global_title || latestSeo.global_title.includes('High-RPM Monetization')) {
      latestSeo.global_title = 'Web Nasir — Learn Digital Skills, Build Websites & Grow Your Online Business';
      latestSeo.meta_description =
        'Explore practical tools, learn website development, master SEO and discover professional training to build your digital future with Web Nasir.';
      await setBlob('cms_seo', latestSeo);
    }

    await setBlob('meta', {
      ...currentMeta,
      seeded: true,
      seeded_at: currentMeta.seeded_at || now,
      v2_clean_urls_migrated: true,
      migrated_at: now,
    });
  }

  // K. One-time v3 migration for About Page, Contact Page & White News Ticker defaults
  const metaV3 = (await getBlob('meta')) || {};
  if (!metaV3.v3_about_contact_ticker_migrated) {
    const currAbout = (await getBlob('cms_about')) || {};
    if (
      !currAbout.heading ||
      currAbout.heading === 'Built by a Practitioner, Not a Theoretical Lecturer.' ||
      !currAbout.founder_heading
    ) {
      await setBlob('cms_about', {
        ...currAbout,
        badge: 'Digital Learning & Technology Platform',
        heading: 'Empowering Your Digital Future with AI, Technology & Practical Skills.',
        subtitle: 'Web Nasir is a digital learning and technology platform built to make modern digital skills accessible to everyone. We bring together practical AI tools, website development resources, SEO strategies, digital marketing education and professional online courses in one place.',
        cta_primary_text: 'Explore Our Free Tools',
        cta_primary_link: '/tools',
        cta_secondary_text: 'Explore Our Courses',
        cta_secondary_link: '/courses',
        founder_heading: 'Meet Nasir — Founder of Web Nasir',
        founder_name: currAbout.founder_name || 'Nasir',
        founder_role: 'Founder of Web Nasir',
        founder_description: "I'm Nasir, a digital technology enthusiast and online publisher focused on AI-powered tools, website development, SEO and digital growth. Through Web Nasir, my goal is to make practical digital knowledge easier to access and help individuals develop skills they can apply in the real world.",
        biography: "I'm Nasir, a digital technology enthusiast and online publisher focused on AI-powered tools, website development, SEO and digital growth. Through Web Nasir, my goal is to make practical digital knowledge easier to access and help individuals develop skills they can apply in the real world.",
        mission: 'To make practical digital education, AI-powered resources and technology accessible through useful tools and straightforward learning experiences.',
        vision: 'To build a trusted digital learning platform where people can explore technology, develop practical skills and discover new opportunities in the digital world.',
        offerings: Array.isArray(currAbout.offerings) && currAbout.offerings.length === 6 ? currAbout.offerings : [
          { title: 'Free AI Tools', description: 'Ready-to-use online utilities for content creation, SEO planning, code explanation, and productivity.', icon: 'sparkles', link: '/tools' },
          { title: 'Website Development', description: 'Practical resources and step-by-step training for building fast, modern, mobile-friendly websites.', icon: 'code', link: '/courses/fullstack-web-dev' },
          { title: 'SEO & Blogging', description: 'Clear search optimization strategies, keyword research frameworks, and content publishing guides.', icon: 'search', link: '/courses/seo-mastery' },
          { title: 'Digital Marketing', description: 'Actionable digital growth, audience building, and online campaign strategies for creators and businesses.', icon: 'trending-up', link: '/courses/digital-marketing-ai' },
          { title: 'AI & Automation', description: 'Learn how to apply AI workflows and modern automation tools to save time and scale projects.', icon: 'cpu', link: '/courses/complete-ai-mastery' },
          { title: 'Professional Online Courses', description: 'Structured, beginner-to-advanced learning pathways designed for real-world skill development.', icon: 'graduation-cap', link: '/courses' }
        ],
        why_items: Array.isArray(currAbout.why_items) && currAbout.why_items.length === 6 ? currAbout.why_items : [
          'Practical learning resources.',
          'Useful free AI tools.',
          'Technology-focused education.',
          'Professional learning pathways.',
          'Regular guides and tutorials.',
          'Beginner-friendly resources.'
        ],
        final_cta_heading: 'Start Building Your Digital Future Today.',
        cta_text: 'Explore Free Tools',
        cta_link: '/tools'
      });
    }

    const currContact = (await getBlob('cms_contact')) || {};
    if (
      !currContact.heading ||
      currContact.heading === 'Get in Touch with Admissions & Support'
    ) {
      await setBlob('cms_contact', {
        ...currContact,
        heading: "Let's Connect — We're Here to Help.",
        subtitle: "Have a question about our AI tools, online courses, website development or learning resources? Get in touch with the Web Nasir team. We're here to help you find the right information and support.",
        email: currContact.email || 'support@webnasir.com',
        support_email: currContact.support_email || 'support@webnasir.com',
        whatsapp: currContact.whatsapp || '+91 7006334417',
      });
    }

    const currMarqueeCfg = (await getBlob('cms_marquee_config')) || {};
    if (!currMarqueeCfg.bg_color || currMarqueeCfg.bg_color === '#0f172a') {
      await setBlob('cms_marquee_config', {
        ...currMarqueeCfg,
        enabled: currMarqueeCfg.enabled !== false,
        bg_color: '#ffffff',
        text_color: '#000000',
        border_color: '#e2e8f0',
        accent_color: '#7c3aed',
        pause_on_hover: true,
        position: 'below_hero',
      });
    }

    await setBlob('meta', {
      ...metaV3,
      seeded: true,
      v2_clean_urls_migrated: true,
      v3_about_contact_ticker_migrated: true,
      v3_migrated_at: now,
    });
  }

  // Hero Slider Defaults & Migration (3–4 independently designed slides)
  const metaV4 = (await getBlob('meta')) || {};
  if (!metaV4.v4_hero_slider_migrated) {
    const existingHeroSlides = await getBlob('cms_hero_slides');
    if (!Array.isArray(existingHeroSlides) || existingHeroSlides.length < 3) {
      await setBlob('cms_hero_slides', [
        {
          id: 'slide-ai-tools',
          slide_type: 'ai_tools',
          title: 'AI Tools & Digital Skills',
          badge_text: 'AI • Technology • Digital Skills Academy',
          heading: 'Learn Digital Skills. Build Websites. Grow Your Online Business.',
          description: "Explore practical tools, learn website development, master SEO and discover professional training to build your digital future with Web Nasir.",
          cta_primary_text: 'Explore Free Tools',
          cta_primary_link: '/tools',
          cta_secondary_text: 'Explore Courses',
          cta_secondary_link: '/courses',
          cta_video_text: 'Meet Nasir',
          desktop_image: '',
          mobile_image: '',
          bg_gradient: 'from-brand-50/70 via-white to-slate-50/50',
          enabled: true,
          sort_order: 1,
        },
        {
          id: 'slide-web-dev',
          slide_type: 'web_dev',
          title: 'Website Development',
          badge_text: 'Modern Web Engineering',
          heading: 'Build Professional Websites with Modern Technologies.',
          description: 'Master React, Next.js, WordPress, Tailwind CSS, REST APIs and serverless deployment. Learn how to architect, ship and host high-performance web applications from scratch.',
          cta_primary_text: 'Explore Development Courses',
          cta_primary_link: '/courses/fullstack-web-dev',
          cta_secondary_text: 'Start Free Coding',
          cta_secondary_link: '/free-courses',
          cta_video_text: '',
          desktop_image: '',
          mobile_image: '',
          bg_gradient: 'from-indigo-50/70 via-white to-purple-50/40',
          enabled: true,
          sort_order: 2,
        },
        {
          id: 'slide-seo-growth',
          slide_type: 'seo_growth',
          title: 'SEO & Digital Growth',
          badge_text: 'Search Intent & High RPM Architecture',
          heading: 'Master SEO, Blogging & Digital Monetization.',
          description: 'Discover battle-tested strategies for keyword ranking, Google AdSense optimization, helpful content strategy, and growing high-RPM digital publishing revenues.',
          cta_primary_text: 'Explore Free Guides',
          cta_primary_link: '/articles',
          cta_secondary_text: 'SEO Masterclass',
          cta_secondary_link: '/courses/seo-mastery',
          cta_video_text: '',
          desktop_image: '',
          mobile_image: '',
          bg_gradient: 'from-emerald-50/70 via-white to-teal-50/40',
          enabled: true,
          sort_order: 3,
        },
        {
          id: 'slide-courses',
          slide_type: 'courses',
          title: 'Professional Courses',
          badge_text: 'Career-Ready Learning Pathways',
          heading: 'Learn Practical Skills. Build Your Digital Career.',
          description: 'Explore structured courses designed for real-world application. Learn step-by-step from 10+ years of engineering experience with downloadable project code and mentor guidance.',
          cta_primary_text: 'Browse All Courses',
          cta_primary_link: '/courses',
          cta_secondary_text: 'Free Starter Courses',
          cta_secondary_link: '/free-courses',
          cta_video_text: '',
          desktop_image: '',
          mobile_image: '',
          bg_gradient: 'from-violet-50/70 via-white to-amber-50/40',
          enabled: true,
          sort_order: 4,
        },
      ]);
    }

    const existingSliderConfig = await getBlob('cms_hero_slider_config');
    if (!existingSliderConfig || typeof existingSliderConfig !== 'object') {
      await setBlob('cms_hero_slider_config', {
        enabled: false,
        autoplay: true,
        autoplay_interval: 5,
        transition_effect: 'fade',
        pause_on_hover: true,
        show_arrows: true,
        show_dots: true,
        enable_swipe: true,
      });
    }

    await setBlob('meta', {
      ...metaV4,
      seeded: true,
      v2_clean_urls_migrated: true,
      v3_about_contact_ticker_migrated: true,
      v4_hero_slider_migrated: true,
      v4_migrated_at: now,
    });
  }

  // V5: Real Free & Paid Course Library (14 Categories, verified curricula, downloads, and free offers)
  const metaV5 = (await getBlob('meta')) || {};
  if (!metaV5.v5_real_course_library_migrated) {
    console.log('Migrating Web Nasir real 14-category course library...');
    await setBlob('courses_index', ALL_GENUINE_COURSES);
    for (const c of ALL_GENUINE_COURSES) {
      await setBlob(`course:${c.id}`, c);
      if (c.slug && c.slug !== c.id) {
        await setBlob(`course:${c.slug}`, c);
      }
    }
    const freeOnly = ALL_GENUINE_COURSES.filter(c => c.is_free === true || Number(c.price) === 0);
    await setBlob('free_courses_index', freeOnly);
    await setBlob('course_categories', COURSE_CATEGORIES_14);

    await setBlob('meta', {
      ...metaV5,
      seeded: true,
      v5_real_course_library_migrated: true,
      v5_migrated_at: new Date().toISOString(),
    });
    console.log('Real course library migration completed successfully.');
  }

  // V6: Complete Free Learning Hub Transformation (Archive Paid/Fake Courses, Seed Verified YouTube Learning Hub & Original Articles)
  const metaV6 = (await getBlob('meta')) || {};
  if (!metaV6.v6_free_learning_hub_migrated) {
    console.log('Executing V6 Free Learning Hub & Educational Articles transformation (preserving all existing AI tools, student accounts, and historical records)...');

    // 1. Archive existing course records safely without deleting historical accounting data
    const oldCourses = (await getBlob('courses_index')) || [];
    if (oldCourses.length > 0) {
      await setBlob('archived_courses_backup', {
        archived_at: new Date().toISOString(),
        reason: 'Transformed into 100% Free YouTube Learning Hub & Educational Articles Platform',
        courses: oldCourses,
      });
    }
    await setBlob('courses_index', []);
    await setBlob('free_courses_index', []);

    // 2. Seed Verified YouTube Learning Resources, Categories & Learning Paths
    await setBlob('learning_categories', LEARNING_HUB_CATEGORIES);
    await setBlob('learning_paths', RECOMMENDED_LEARNING_PATHS);
    await setBlob('learning_resources_index', VERIFIED_YOUTUBE_RESOURCES);
    for (const item of VERIFIED_YOUTUBE_RESOURCES) {
      await setBlob(`learning_resource:${item.id}`, item);
      if (item.slug && item.slug !== item.id) {
        await setBlob(`learning_resource:${item.slug}`, item);
      }
    }

    // 3. Merge Original 14-Point Educational Articles into articles_index (preserving existing articles)
    const currentArticles = (await getBlob('articles_index')) || [];
    const mergedArticles = [...currentArticles];

    for (const art of EDUCATIONAL_ARTICLES_LIBRARY) {
      const existingIdx = mergedArticles.findIndex((a) => a.slug === art.slug || a.id === art.id);
      const articleRecord = {
        ...art,
        tag: art.category,
        meta: art.excerpt || art.meta_description,
        body: art.content,
        is_published: art.is_published !== false,
        created_at: art.published_at || new Date().toISOString(),
        updated_at: art.updated_at || new Date().toISOString(),
      };
      if (existingIdx !== -1) {
        mergedArticles[existingIdx] = { ...mergedArticles[existingIdx], ...articleRecord };
      } else {
        mergedArticles.unshift(articleRecord);
      }
      await setBlob(`article:${art.slug}`, articleRecord);
      if (art.id && art.id !== art.slug) {
        await setBlob(`article:${art.id}`, articleRecord);
      }
    }
    await setBlob('articles_index', mergedArticles);
    await setBlob('article_categories', ARTICLE_CATEGORIES);

    // 4. Update Hero, Settings, Navigation & Footer to remove paid course links and focus on Free AI Tools + Free Learning Hub
    const currSettings = (await getBlob('settings')) || {};
    await setBlob('settings', {
      ...currSettings,
      site_name: 'Web Nasir',
      tagline: 'Your Free Hub for AI Tools, Technology & Digital Skills',
      hero_badge: '100% Free AI Tools • Free YouTube Courses • Practical Guides',
      hero_title: 'Your Free Hub for AI Tools, Technology & Digital Skills.',
      hero_subtitle: 'Discover powerful free AI tools, learn from real educational YouTube courses, explore practical guides and build skills for your digital future.',
      announcement_text: 'Learn New Skills, Watch Real Courses & Use 11+ AI Tools — 100% Free on Web Nasir!',
      announcement_link_text: 'Explore Free Learning Hub →',
      announcement_link_url: '/learn',
      razorpay_enabled: false,
      footer_text: 'Web Nasir is a free digital learning and technology platform offering free AI tools, curated YouTube courses, and practical educational guides.',
    });

    await setBlob('cms_navigation', {
      brand_text: 'Web Nasir',
      brand_subtext: 'Free AI Tools & Learning Hub',
      cta_button_text: 'Start Learning Free',
      cta_button_link: '/learn',
      items: [
        { id: 'nav-home', label: 'Home', url: '/', order: 1, enabled: true },
        { id: 'nav-tools', label: 'Free AI Tools', url: '/tools', order: 2, enabled: true },
        { id: 'nav-learn', label: 'Free Learning', url: '/learn', order: 3, enabled: true },
        { id: 'nav-articles', label: 'Guides & Articles', url: '/articles', order: 4, enabled: true },
        { id: 'nav-topics', label: 'Topics', url: '/learning-pathways', order: 5, enabled: true },
        { id: 'nav-about', label: 'About', url: '/about', order: 6, enabled: true },
        { id: 'nav-contact', label: 'Contact', url: '/contact', order: 7, enabled: true },
      ],
    });

    await setBlob('cms_hero_slides', [
      {
        id: 'slide-free-hub',
        slide_type: 'ai_tools',
        title: 'Free AI Tools & Learning Hub',
        badge_text: '100% Free AI Tools • Verified YouTube Courses • Practical Guides',
        heading: 'Your Free Hub for AI Tools, Technology & Digital Skills.',
        description: 'Discover powerful free AI tools, learn from real educational YouTube courses, explore practical guides and build skills for your digital future.',
        cta_primary_text: 'Explore Free AI Tools',
        cta_primary_link: '/tools',
        cta_secondary_text: 'Start Learning Free',
        cta_secondary_link: '/learn',
        cta_tertiary_text: 'Read Practical Guides',
        cta_tertiary_link: '/articles',
        bg_gradient: 'from-brand-50/70 via-white to-slate-50/50',
        enabled: true,
        sort_order: 1,
      },
      {
        id: 'slide-youtube-learning',
        slide_type: 'web_dev',
        title: 'Free Learning Hub',
        badge_text: 'Learn from freeCodeCamp • Harvard CS50 • Google Search Central',
        heading: 'Learn New Skills. Watch Real Courses. Build Your Digital Future — Completely Free.',
        description: 'Explore carefully selected free YouTube courses, programming tutorials, AI lessons, SEO training, digital marketing education and practical guides without paying for courses.',
        cta_primary_text: 'Start Learning Free',
        cta_primary_link: '/learn',
        cta_secondary_text: 'Read Practical Guides',
        cta_secondary_link: '/articles',
        bg_gradient: 'from-indigo-50/70 via-white to-purple-50/40',
        enabled: true,
        sort_order: 2,
      },
      {
        id: 'slide-practical-guides',
        slide_type: 'seo_growth',
        title: 'Guides & Learning Paths',
        badge_text: 'Original Step-by-Step Tutorials & Roadmaps',
        heading: 'Follow Structured Learning Paths & In-Depth Technical Guides.',
        description: 'Connect verified video tutorials, written handbooks, and interactive AI utilities across Web Development, Python, SEO, WordPress, and AI Automation.',
        cta_primary_text: 'Read Practical Guides',
        cta_primary_link: '/articles',
        cta_secondary_text: 'Explore Free AI Tools',
        cta_secondary_link: '/tools',
        bg_gradient: 'from-emerald-50/70 via-white to-teal-50/40',
        enabled: true,
        sort_order: 3,
      },
    ]);

    await setBlob('cms_footer', {
      brand_title: 'Web Nasir',
      brand_description: 'Your free hub for AI tools, curated YouTube educational courses, and practical technology guides.',
      contact_email: 'support@webnasir.com',
      contact_whatsapp: '+91 7006334417',
      copyright_text: 'Web Nasir. All rights reserved.',
      columns: [
        {
          id: 'col-explore',
          title: 'Free Platform',
          links: [
            { label: 'Free AI Tools', url: '/tools' },
            { label: 'Free Learning Hub', url: '/learn' },
            { label: 'Guides & Articles', url: '/articles' },
            { label: 'Learning Paths & Topics', url: '/learning-pathways' },
          ],
        },
        {
          id: 'col-learn',
          title: 'Popular Learning Tracks',
          links: [
            { label: 'AI & Prompt Engineering', url: '/learn/chatgpt-for-beginners' },
            { label: 'HTML, CSS & JavaScript', url: '/learn/html-css-full-course' },
            { label: 'Python Programming', url: '/learn/python-programming' },
            { label: 'SEO & Google Search', url: '/learn/seo-for-beginners' },
            { label: 'Harvard CS50 Computer Science', url: '/learn/harvard-cs50-computer-science' },
          ],
        },
        {
          id: 'col-company',
          title: 'About & Legal',
          links: [
            { label: 'About Web Nasir', url: '/about' },
            { label: 'Contact Us', url: '/contact' },
            { label: 'Privacy Policy', url: '/privacy' },
            { label: 'Terms & Conditions', url: '/terms' },
          ],
        },
      ],
    });

    await setBlob('meta', {
      ...metaV6,
      seeded: true,
      v2_clean_urls_migrated: true,
      v3_about_contact_ticker_migrated: true,
      v4_hero_slider_migrated: true,
      v5_real_course_library_migrated: true,
      v6_free_learning_hub_migrated: true,
      v6_migrated_at: new Date().toISOString(),
    });
    console.log('V6 Free Learning Hub transformation completed successfully.');
  }
}



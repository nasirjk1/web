const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const JSZip = require('jszip');

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'downloads', 'courses');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function createCoursePdf({ filename, title, category, author, sections }) {
  const pdfDoc = await PDFDocument.create();
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontMono = await pdfDoc.embedFont(StandardFonts.Courier);

  // Cover / Header Page
  let page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();

  // Top header banner
  page.drawRectangle({
    x: 0,
    y: height - 120,
    width: width,
    height: 120,
    color: rgb(0.06, 0.09, 0.16), // #0f172a
  });

  page.drawText('WEB NASIR ACADEMY — OFFICIAL LEARNING RESOURCE', {
    x: 40,
    y: height - 40,
    size: 10,
    font: fontBold,
    color: rgb(0.65, 0.45, 0.95),
  });

  page.drawText(title, {
    x: 40,
    y: height - 70,
    size: 18,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText(`Category: ${category}  •  Lead Mentor: ${author}  •  Licensed for Educational Study`, {
    x: 40,
    y: height - 95,
    size: 9,
    font: fontRegular,
    color: rgb(0.8, 0.85, 0.95),
  });

  let y = height - 150;

  for (const sec of sections) {
    if (y < 120) {
      page = pdfDoc.addPage([595.28, 841.89]);
      y = height - 60;
    }

    // Section title
    page.drawText(sec.heading, {
      x: 40,
      y: y,
      size: 13,
      font: fontBold,
      color: rgb(0.12, 0.15, 0.25),
    });
    y -= 18;

    // Section points / lines
    for (const point of sec.points) {
      if (y < 80) {
        page = pdfDoc.addPage([595.28, 841.89]);
        y = height - 60;
      }

      const isBullet = point.startsWith('•') || point.startsWith('-');
      const isCode = point.startsWith('    ') || point.startsWith('//') || point.startsWith('$') || point.startsWith('const ');
      const textToDraw = point;
      const indent = isCode ? 55 : (isBullet ? 48 : 40);
      const font = isCode ? fontMono : (isBullet ? fontRegular : fontRegular);
      const fontSize = isCode ? 8.5 : 9.5;
      const textColor = isCode ? rgb(0.2, 0.3, 0.5) : rgb(0.2, 0.25, 0.35);

      // Simple word wrapping for long points
      const maxChars = isCode ? 75 : 85;
      if (textToDraw.length > maxChars && !isCode) {
        const words = textToDraw.split(' ');
        let line = '';
        for (const w of words) {
          if ((line + w).length > maxChars) {
            page.drawText(line, { x: indent, y, size: fontSize, font, color: textColor });
            y -= 14;
            line = '  ' + w + ' ';
          } else {
            line += w + ' ';
          }
        }
        if (line.trim()) {
          page.drawText(line, { x: indent, y, size: fontSize, font, color: textColor });
          y -= 14;
        }
      } else {
        page.drawText(textToDraw, {
          x: indent,
          y,
          size: fontSize,
          font,
          color: textColor,
        });
        y -= 14;
      }
    }
    y -= 12; // Gap after section
  }

  // Footer on last page
  page.drawText('Web Nasir Academy  •  webnasir.dpdns.org  •  Practical AI, Web Engineering & Digital Monetization', {
    x: 40,
    y: 30,
    size: 8,
    font: fontRegular,
    color: rgb(0.5, 0.55, 0.65),
  });

  const pdfBytes = await pdfDoc.save();
  const filePath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filePath, pdfBytes);
  const stat = fs.statSync(filePath);
  console.log(`Generated PDF: ${filename} (${(stat.size / 1024).toFixed(1)} KB)`);
  return { filename, size: stat.size, sizeFormatted: `${(stat.size / 1024).toFixed(1)} KB` };
}

async function createCourseZip({ filename, files }) {
  const zip = new JSZip();
  for (const [relativePath, content] of Object.entries(files)) {
    zip.file(relativePath, content);
  }
  const content = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  const filePath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filePath, content);
  const stat = fs.statSync(filePath);
  console.log(`Generated ZIP: ${filename} (${(stat.size / 1024).toFixed(1)} KB)`);
  return { filename, size: stat.size, sizeFormatted: `${(stat.size / 1024).toFixed(1)} KB` };
}

async function main() {
  console.log('Generating genuine course learning downloads...');

  // 1. AI & ChatGPT
  await createCoursePdf({
    filename: 'chatgpt-prompt-engineering-mastery-guide.pdf',
    title: 'ChatGPT & Gemini Prompt Engineering Master Reference Guide',
    category: 'Artificial Intelligence and ChatGPT',
    author: 'Nasir (Web Nasir Academy)',
    sections: [
      {
        heading: '1. Foundational Architecture: How Generative Models Process Prompts',
        points: [
          '• Large Language Models predict next tokens based on probabilistic distribution over vocabulary.',
          '• System Instructions set permanent behavioral guardrails, tone, and operational schema.',
          '• Context Window Physics: Tokens in earlier positions receive slightly attenuated attention vs end tokens.',
          '• Zero-Shot vs Few-Shot: Providing 2-3 exemplar input/output pairs dramatically increases schema adherence.'
        ]
      },
      {
        heading: '2. Battle-Tested System Instruction Templates',
        points: [
          'Role Definition: "You are a senior full-stack engineer and digital publishing architect."',
          'Boundary Constraint: "Provide direct, production-ready code with no markdown preamble or placeholders."',
          'Structured Output Request: "Always respond with strictly valid JSON adhering to the provided TypeScript interface."',
          '    interface PromptResponse { status: "success" | "error"; payload: Record<string, unknown>; }'
        ]
      },
      {
        heading: '3. Chain-of-Thought & Deterministic Parsing Strategies',
        points: [
          '• Instruct the model to reason through constraints step-by-step before emitting the final output.',
          '• Enforce schema validation on server responses using Zod or JSON Schema before persisting to database.',
          '• Fallback Handlers: Always catch JSON.parse errors and retry with temperature 0.0 for deterministic output.'
        ]
      }
    ]
  });

  // 2. AI Tools and Automation (ZIP)
  await createCourseZip({
    filename: 'ai-automation-workflow-blueprints.zip',
    files: {
      'README.md': `# AI Tools & Automation Starter Blueprints\nWeb Nasir Academy — Official Resource\n\n## Overview\nThis package contains production-ready JSON blueprints for automated webhook orchestration connecting Gemini API to web services.\n\n### Blueprints Included:\n1. webhook-ai-triage.json - Automated email/inquiry classification and response drafting\n2. content-repurposing-pipeline.json - Blog post to multi-channel social summary generator\n3. webhook-handler.js - Express serverless handler for inbound webhook authentication and Gemini API invocation.\n`,
      'webhook-ai-triage.json': JSON.stringify({
        name: 'Inquiry AI Triaging & Drafting',
        trigger: 'Webhook Inbound POST',
        actions: [
          { step: 1, action: 'Extract Subject and Body' },
          { step: 2, action: 'Call Gemini 3.8 Flash for Sentiment & Intent Analysis' },
          { step: 3, action: 'Draft Response with High-Confidence Context' },
          { step: 4, action: 'Notify Admin Slack/Email Channel' }
        ]
      }, null, 2),
      'content-repurposing-pipeline.json': JSON.stringify({
        name: 'Content Repurposing Automation',
        trigger: 'New Article Published',
        actions: [
          { step: 1, action: 'Extract H1, H2s and Key Takeaways' },
          { step: 2, action: 'Generate 5 Tweet Hooks & LinkedIn Digest' },
          { step: 3, action: 'Create YouTube Video Script Outline' }
        ]
      }, null, 2),
      'webhook-handler.js': `// Web Nasir Webhook Automation Handler\nimport express from 'express';\nconst app = express();\napp.use(express.json());\n\napp.post('/api/automation/trigger', async (req, res) => {\n  const { eventType, data } = req.body;\n  console.log('Automated Event Received:', eventType);\n  // Process with Gemini API...\n  res.json({ success: true, processedAt: new Date().toISOString() });\n});\n`
    }
  });

  // 3. Website Development (PDF)
  await createCoursePdf({
    filename: 'production-web-engineering-handbook.pdf',
    title: 'Production Web Engineering & Deployment Architecture Handbook',
    category: 'Website Development',
    author: 'Nasir (Lead Technical Mentor)',
    sections: [
      {
        heading: '1. Production Web Stack Architecture',
        points: [
          '• Full-Stack Architecture: Separation of Concerns between Edge Presentation and State Persistence.',
          '• Node.js & Express API Bridge: Unified routing layer capable of serving static assets and dynamic endpoints.',
          '• Serverless vs Long-Running Containers: Balancing cold-start latency against state persistence requirements.',
          '• DNS Configuration: Apex records (A/ALIAS), CNAME delegation, and automated SSL certificate renewal.'
        ]
      },
      {
        heading: '2. Core Web Vitals & Performance Engineering',
        points: [
          '• Largest Contentful Paint (LCP): Preload critical hero images, eliminate render-blocking CSS, and self-host fonts.',
          '• Interaction to Next Paint (INP): Keep main thread tasks under 50ms; defer heavy DOM calculations to microtasks.',
          '• Cumulative Layout Shift (CLS): Explicitly define width and height attributes on all image, video, and ad containers.'
        ]
      },
      {
        heading: '3. Production Deployment Checklist',
        points: [
          '• Strict Content Security Policy (CSP) and HTTPS strict transport security.',
          '• Cache-Control headers: Immutable static assets with content hashing, strong validation on HTML roots.',
          '• Zero-Downtime Deployment strategies using atomic symlinks or blue/green container deployments.'
        ]
      }
    ]
  });

  // 4. HTML, CSS and JavaScript (PDF)
  await createCoursePdf({
    filename: 'modern-html-css-javascript-cheatsheet.pdf',
    title: 'Modern HTML5, CSS3 & Modern JavaScript ESNext Developer Cheatsheet',
    category: 'HTML, CSS and JavaScript',
    author: 'Nasir',
    sections: [
      {
        heading: '1. Semantic HTML5 & Accessibility (a11y)',
        points: [
          '• Use semantic landmarks: <main>, <nav>, <header>, <footer>, <article>, and <aside>.',
          '• Interactive elements: Always use native <button> instead of <div onclick> to maintain keyboard focus & ARIA roles.',
          '• Accessible Forms: Explicitly pair <label for="field-id"> with input elements to support screen readers.'
        ]
      },
      {
        heading: '2. Modern CSS: Grid, Flexbox & CSS Variables',
        points: [
          '• Flexbox: Best for 1-dimensional component alignment (navbars, card headers, button groups).',
          '• CSS Grid: Best for 2-dimensional page layouts: grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)).',
          '• CSS Custom Properties: Define tokens at :root level for scalable light/dark mode and brand theming.'
        ]
      },
      {
        heading: '3. ESNext Modern JavaScript Essentials',
        points: [
          '• Asynchronous programming: async/await with clean try/catch blocks over promise callback chains.',
          '• Destructuring & Spread: const { id, title, ...meta } = course; const updated = { ...course, rating: 5 };',
          '• Array Methods: Array.prototype.map(), filter(), reduce(), and some() for immutable data operations.'
        ]
      }
    ]
  });

  // 5. React and Next.js (PDF)
  await createCoursePdf({
    filename: 'react19-nextjs-app-router-reference.pdf',
    title: 'React 19 & Next.js App Router Architecture Reference Guide',
    category: 'React and Next.js',
    author: 'Nasir',
    sections: [
      {
        heading: '1. React 19 Core Fundamentals & Hooks',
        points: [
          '• useState vs useReducer: Use reducers when state transitions depend on previous state or complex payloads.',
          '• useEffect Discipline: Avoid using effects for data transformations that can be computed during render.',
          '• Custom Hooks: Encapsulate asynchronous fetch logic, local storage sync, and window listeners into reusable hooks.'
        ]
      },
      {
        heading: '2. Next.js App Router & Server Components',
        points: [
          '• Server Components by Default: Fetch data directly on the server without client bundle overhead.',
          '• "use client" Boundary: Push interactive state (buttons, form inputs, modal dialogs) to the leaves of the tree.',
          '• Static Data Fetching & Caching: fetch(url, { next: { revalidate: 3600 } }) for Incremental Static Regeneration.'
        ]
      }
    ]
  });

  // 6. WordPress (PDF)
  await createCoursePdf({
    filename: 'wordpress-theme-development-guide.pdf',
    title: 'WordPress Custom Theme & Plugin Architecture Developer Guide',
    category: 'WordPress',
    author: 'Nasir',
    sections: [
      {
        heading: '1. The WordPress Template Hierarchy',
        points: [
          '• Template resolution order: single-{post_type}.php -> single.php -> singular.php -> index.php.',
          '• Proper enqueueing: Always register styles and scripts via wp_enqueue_scripts action hook, never hardcoded in header.',
          '• Security: Sanitize on input (sanitize_text_field) and escape on output (esc_html, esc_attr, esc_url).'
        ]
      },
      {
        heading: '2. Custom Post Types & REST API Integration',
        points: [
          '• Register Custom Post Types with register_post_type() specifying show_in_rest => true.',
          '• Add custom endpoints via register_rest_route() with permission_callback validation.',
          '• Headless WordPress: Fetching structured JSON via wp-json/wp/v2/posts for modern React frontend rendering.'
        ]
      }
    ]
  });

  // 7. SEO and Blogging (PDF)
  await createCoursePdf({
    filename: 'google-seo-starter-guide-complete.pdf',
    title: 'Google SEO Starter Guide & Topical Clustering Blueprint',
    category: 'SEO and Blogging',
    author: 'Nasir (Digital Publisher & SEO Veteran)',
    sections: [
      {
        heading: '1. Understanding Search Intent & SERP Reality',
        points: [
          '• Informational Intent: Comprehensive walkthroughs, clear definitions, checklists, and code snippets.',
          '• Navigational & Transactional Intent: Direct tool interfaces, clear CTA buttons, and immediate utility.',
          '• Avoiding Thin Content: Answer questions thoroughly with structured headings (H1, H2, H3) and scannable lists.'
        ]
      },
      {
        heading: '2. Technical SEO & Schema Structured Data',
        points: [
          '• JSON-LD Structured Data: Implement Article, Course, FAQPage, and BreadcrumbList schemas.',
          '• Canonical Tags: Prevent duplicate content issues across URL parameters and trailing slash variations.',
          '• XML Sitemaps: Clean, self-updating sitemaps submitted to Google Search Console and Bing Webmaster Tools.'
        ]
      },
      {
        heading: '3. Topical Authority Clustering',
        points: [
          '• Pillar Page Architecture: High-level overview linking out to 8-12 specialized sub-topic cluster guides.',
          '• Internal Linking Physics: Pass PageRank from authoritative older articles to new technical guides.',
          '• Descriptive Anchor Text: Avoid "click here"; use keyword-rich anchor text matching the target URL topic.'
        ]
      }
    ]
  });

  // 8. Google AdSense (PDF)
  await createCoursePdf({
    filename: 'adsense-high-rpm-publisher-playbook.pdf',
    title: 'Google AdSense High-RPM Publisher & Layout Engineering Playbook',
    category: 'Google AdSense',
    author: 'Nasir (10-Year AdSense Veteran)',
    sections: [
      {
        heading: '1. The Economics of RPM, eCPM and CPC',
        points: [
          '• RPM = (Estimated Earnings / Page Views) * 1000. Influenced directly by Tier-1 GEO mix, CTR, and advertiser CPC.',
          '• Tier-1 Traffic Value: Visitors from US, UK, Canada, and Australia command 5x-10x higher bid pressure.',
          '• Active View Viewability: Ad networks penalize impressions below 70% active viewability.'
        ]
      },
      {
        heading: '2. High-Yield Layout Placement Physics',
        points: [
          '• Sticky Sidebar Unit (300x600): High active view time when users read long-form technical tutorials.',
          '• In-Article Native Placements: Insert responsive banners every 4-5 paragraphs where attention naturally rests.',
          '• Policy Compliance: Never place ads directly touching buttons or mislabeled as interactive application content.'
        ]
      },
      {
        heading: '3. Protecting Your AdSense Account',
        points: [
          '• Strict adherence to Google Webmaster & Publisher policies regarding invalid traffic (IVT).',
          '• Monitor Google Analytics 4 for abnormal traffic spikes or low session durations from untrusted referral sources.',
          '• Maintain complete Ads.txt records with verified publisher ID to prevent domain spoofing.'
        ]
      }
    ]
  });

  // 9. Digital Marketing (PDF)
  await createCoursePdf({
    filename: 'digital-marketing-growth-funnel-guide.pdf',
    title: 'Digital Performance Marketing & Growth Funnel Playbook',
    category: 'Digital Marketing',
    author: 'Nasir',
    sections: [
      {
        heading: '1. Full-Funnel Digital Marketing Architecture',
        points: [
          '• Top of Funnel (TOFU): Educational YouTube videos, free AI utilities, and organic search content.',
          '• Middle of Funnel (MOFU): Free starter courses, downloadable cheat sheets, and newsletter subscriptions.',
          '• Bottom of Funnel (BOFU): Comprehensive masterclasses, 1-on-1 mentorship, and certified career tracks.'
        ]
      },
      {
        heading: '2. Conversion Rate Optimization (CRO)',
        points: [
          '• The 5-Second Test: Can a new visitor understand your value proposition in under 5 seconds?',
          '• Frictionless CTAs: Single primary call-to-action per section; clear benefit-driven button copy.',
          '• Social Proof & Trust Badges: Verified student reviews, real case studies, and transparent instructor background.'
        ]
      }
    ]
  });

  // 10. Graphic Design (PDF)
  await createCoursePdf({
    filename: 'ui-ux-design-fundamentals-guide.pdf',
    title: 'UI/UX Design Fundamentals & Visual Hierarchy Guide',
    category: 'Graphic Design',
    author: 'Nasir',
    sections: [
      {
        heading: '1. Visual Hierarchy & Typographic Scale',
        points: [
          '• The 8-Point Grid System: Maintain spatial rhythm by sizing margins, padding, and gaps in multiples of 8px.',
          '• Typographic Hierarchy: Clear distinction between H1 (display), H2 (section), H3 (card), and body copy.',
          '• Line Length & Readability: Optimal reading line length is between 55 and 75 characters per line.'
        ]
      },
      {
        heading: '2. Color Psychology & Contrast Compliance',
        points: [
          '• 60-30-10 Color Rule: 60% dominant neutral background, 30% structural secondary, 10% high-contrast accent.',
          '• WCAG 2.1 AA Compliance: Text must maintain at least 4.5:1 contrast ratio against background for readability.',
          '• Zero-Pill Discipline: Avoid wrapping every metadata tag in rounded pills; use typographic weight and subtle badges.'
        ]
      }
    ]
  });

  // 11. Freelancing (ZIP)
  await createCourseZip({
    filename: 'freelance-developer-contract-proposal-templates.zip',
    files: {
      'README.md': `# Freelance Developer Contracts & Proposal Templates\nWeb Nasir Academy — Official Resource\n\n## Included Assets\n1. freelance-client-agreement.md - Standard Independent Contractor Agreement with IP rights transfer upon final payment.\n2. technical-project-proposal-template.md - High-win client proposal breakdown with milestone pricing.\n3. invoice-template.html - Clean, printable HTML invoice template.\n`,
      'freelance-client-agreement.md': `# INDEPENDENT CONTRACTOR SERVICE AGREEMENT\n\n**Client:** [Client Name / Company]\n**Developer:** [Your Name / Web Nasir Alumni]\n**Effective Date:** [Date]\n\n## 1. Scope of Work\nThe Developer agrees to architect, build, and deliver the software application specified in Schedule A.\n\n## 2. Payment Terms\n- 40% upfront deposit upon contract signing.\n- 30% milestone payment upon staging demo approval.\n- 30% final balance upon production deployment.\n\n## 3. Intellectual Property\nAll intellectual property and code repository ownership transfers to the Client immediately upon receipt of final payment.\n`,
      'technical-project-proposal-template.md': `# Technical Project Proposal\n\n## Executive Summary\nClear breakdown of the client's business challenge and the modern technical solution to resolve it.\n\n## Technical Architecture\n- Frontend: React / Next.js with Tailwind CSS\n- Backend: Node.js / Express API\n- Database: PostgreSQL / Firestore\n\n## Milestone Timeline & Budget\n- Milestone 1: UX Wireframes & API Schema (Week 1)\n- Milestone 2: Core Application Logic & Database (Weeks 2-3)\n- Milestone 3: Testing, QA & Production Deployment (Week 4)\n`
    }
  });

  // 12. YouTube and Content Creation (PDF)
  await createCoursePdf({
    filename: 'youtube-retention-ctr-master-playbook.pdf',
    title: 'YouTube High-CTR Thumbnail Science & Retention Scripting Playbook',
    category: 'YouTube and Content Creation',
    author: 'Nasir',
    sections: [
      {
        heading: '1. The Mathematics of Click-Through Rate (CTR)',
        points: [
          '• Thumbnail Contrast Physics: High dynamic range, clear foreground focal points, and maximum 3-word text overlays.',
          '• Title Frameworks: Curiosity Gap vs Direct Benefit. "I Built a $10k AI App in 48 Hours" vs "How to Use AI".',
          '• Mobile Feed Preview: Test your thumbnail at 120px width to ensure readability on smartphone screens.'
        ]
      },
      {
        heading: '2. The First 30 Seconds Retention Rule',
        points: [
          '• Hook Immediately: Validate the thumbnail promise in the first 5 seconds; never start with a generic animated logo.',
          '• Micro-Cliffhangers: Introduce an unanswered question or benchmark result that resolves at the climax of the video.',
          '• Pattern Interrupts: Change camera angle, on-screen text, sound effect, or B-roll every 7-10 seconds to maintain focus.'
        ]
      }
    ]
  });

  // 13. Python Programming (PDF)
  await createCoursePdf({
    filename: 'python-3-programming-reference-guide.pdf',
    title: 'Python 3 Fundamentals & Scripting Developer Quick Reference',
    category: 'Python Programming',
    author: 'Nasir',
    sections: [
      {
        heading: '1. Core Data Structures & Idiomatic Python',
        points: [
          '• Lists, Tuples, and Dictionaries: Choosing mutable vs immutable collections based on performance.',
          '• List Comprehensions: [x**2 for x in numbers if x % 2 == 0] for readable, efficient transformations.',
          '• Context Managers: with open("data.json", "r") as f: Ensures file handles close automatically even on exceptions.'
        ]
      },
      {
        heading: '2. Working with REST APIs & Web Scraping',
        points: [
          '• The requests library: Handling GET/POST requests, HTTP headers, authentication tokens, and timeouts.',
          '• JSON handling: json.loads() and json.dumps() with indent formatting for structured API payloads.',
          '• Virtual Environments: Always isolate project dependencies using python -m venv venv.'
        ]
      }
    ]
  });

  // 14. Computer and Digital Skills (PDF)
  await createCoursePdf({
    filename: 'essential-git-terminal-cloud-handbook.pdf',
    title: 'Essential Terminal, Git & Cloud Computing Digital Skills Handbook',
    category: 'Computer and Digital Skills',
    author: 'Nasir',
    sections: [
      {
        heading: '1. Essential Terminal Commands (Bash / Zsh)',
        points: [
          '• Navigation: cd, ls -la, pwd, mkdir -p, and rm -rf (use with extreme caution).',
          '• File inspection & editing: cat, less, head, tail -f, grep -r "pattern", and nano/vim.',
          '• Permissions & Environment: chmod +x script.sh, export PORT=3000, and env inspection.'
        ]
      },
      {
        heading: '2. Git Version Control Workflows',
        points: [
          '• Standard Workflow: git status -> git add . -> git commit -m "feat: descriptive message" -> git push.',
          '• Branching Strategy: git checkout -b feature/branch-name; never develop directly on production main.',
          '• Resolving Merge Conflicts: Inspect conflict markers, verify code logic, stage resolved files, and commit.'
        ]
      },
      {
        heading: '3. Cloud Hosting & Serverless Deployment',
        points: [
          '• Static Hosting vs VPS: When to use Netlify/Vercel (Jamstack) vs Docker containers on Linux VPS.',
          '• Environment Variables: Never commit .env files containing API keys or private credentials to public git repos.',
          '• Automated CI/CD Pipelines: Continuous integration triggers automated builds and tests upon each git push.'
        ]
      }
    ]
  });

  console.log('All genuine learning resource files generated successfully in public/downloads/courses/!');
}

main().catch(console.error);

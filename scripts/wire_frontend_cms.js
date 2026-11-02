import fs from 'node:fs';

let html = fs.readFileSync('public/index.html', 'utf8');

console.log('1. Adding dynamic CMS Theme Engine & Free Courses section to public/index.html...');

// Add free_courses and cms to window.APP_STATE
const stateMarker = 'testimonials: [';
const defaultFreeCourses = `freeCourses: [
        {
          id: 'free-ai-prompt-foundations',
          title: 'AI Prompt Engineering & Gemini API Foundations',
          category: 'AI Engineering',
          level: 'Beginner Friendly',
          duration: '3 Hours (6 Lessons)',
          price: 0,
          original_price: 1999,
          is_free: true,
          rating: 4.9,
          enrolled_count: 840,
          badge: '100% Free Course',
          description: 'Learn the core principles of structured prompt design, system instructions, JSON output formatting, and building your first free AI utility.'
        },
        {
          id: 'free-adsense-approval-checklist',
          title: 'Google AdSense Fast-Track Approval & Setup Bootcamp',
          category: 'Monetization & AdSense',
          level: 'All Levels',
          duration: '2.5 Hours (5 Lessons)',
          price: 0,
          original_price: 1499,
          is_free: true,
          rating: 4.9,
          enrolled_count: 1120,
          badge: 'Free Bootcamp',
          description: 'Avoid the dreaded Low Value Content rejection. Follow our 20-point pre-application technical audit to get your domain approved cleanly.'
        },
        {
          id: 'free-jamstack-netlify-starter',
          title: 'Serverless Web Deployment on Netlify & GitHub',
          category: 'Web Engineering',
          level: 'Beginner',
          duration: '2 Hours (4 Lessons)',
          price: 0,
          original_price: 1299,
          is_free: true,
          rating: 4.8,
          enrolled_count: 690,
          badge: 'Free Starter',
          description: 'Go from local code to a globally distributed production web app with custom DNS, automatic SSL, and serverless Node.js edge functions.'
        }
      ],
      cms: {},
      `;

if (!html.includes('freeCourses: [')) {
  html = html.replace(stateMarker, defaultFreeCourses + stateMarker);
}

// Add Free Starter Courses Section right after Paid Academy Masterclasses in renderHomeView
const freeCoursesSectionHtml = `
        <!-- SECTION D2: FREE STARTER COURSES & BOOTCAMPS (Direct Free Enrollment) -->
        <section class="py-16 sm:py-20 bg-white border-b border-bordercol" id="homepage-section-free_courses">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div>
                <div class="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 mb-2">
                  <i data-lucide="gift" class="w-3.5 h-3.5"></i>
                  <span>Zero Payment Required • Direct Access</span>
                </div>
                <h2 class="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-tight" id="cms-heading-free_courses">
                  100% Free Starter Courses & Bootcamps
                </h2>
                <p class="text-sm text-slate-600 max-w-2xl mt-2" id="cms-subtitle-free_courses">
                  Start learning immediately without a credit card or payment gateway. Sign in with Google or Email to unlock instant access inside your Student Dashboard.
                </p>
              </div>
              <a href="#/courses" class="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
                <span>Browse All Courses</span>
                <i data-lucide="arrow-right" class="w-4 h-4"></i>
              </a>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              \${(window.APP_STATE.freeCourses || []).map(fc => \`
                <div class="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between">
                  <div>
                    <div class="flex items-center justify-between gap-2 mb-4">
                      <span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">\${fc.badge || '100% Free'}</span>
                      <span class="text-xs font-bold text-amber-500 flex items-center gap-1">★ \${fc.rating || '4.9'} (\${fc.enrolled_count || 500}+)</span>
                    </div>
                    <h3 class="text-lg font-bold font-heading text-slate-900 leading-snug mb-2">\${fc.title}</h3>
                    <p class="text-xs text-slate-600 leading-relaxed mb-4">\${fc.description}</p>
                  </div>
                  <div class="pt-4 border-t border-slate-100 space-y-3">
                    <div class="flex items-center justify-between text-xs">
                      <span class="text-slate-500 font-medium"><i data-lucide="clock" class="w-3.5 h-3.5 inline mr-1"></i>\${fc.duration || '2.5 Hours'}</span>
                      <div>
                        <span class="text-xs line-through text-slate-400 mr-1">₹\${fc.original_price || 1499}</span>
                        <span class="text-base font-black text-emerald-600">FREE</span>
                      </div>
                    </div>
                    <button onclick="handleQuickFreeEnroll('\${fc.id}')" class="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all">
                      <i data-lucide="unlock" class="w-3.5 h-3.5"></i>
                      <span>Enroll Free Immediately</span>
                    </button>
                  </div>
                </div>
              \`).join('')}
            </div>
          </div>
        </section>
`;

if (!html.includes('id="homepage-section-free_courses"')) {
  html = html.replace('<!-- SECTION E: WHY CHOOSE WEB NASIR ACADEMY', `${freeCoursesSectionHtml}\n        <!-- SECTION E: WHY CHOOSE WEB NASIR ACADEMY`);
}

// Add applyCmsBundleUI(cms) function to dynamically apply colors, fonts, SEO, navigation, footer, and homepage visibility
const cmsThemeEngineCode = `
    function applyCmsBundleUI(cms) {
      if (!cms) return;
      window.APP_STATE.cms = cms;

      // 1. Apply Free Courses if present
      if (Array.isArray(cms.free_courses) && cms.free_courses.length > 0) {
        window.APP_STATE.freeCourses = cms.free_courses;
      }

      // 2. Apply Appearance (Colors, Typography, Layout)
      if (cms.appearance) {
        const app = cms.appearance;
        let styleEl = document.getElementById('cms-dynamic-theme');
        if (!styleEl) {
          styleEl = document.createElement('style');
          styleEl.id = 'cms-dynamic-theme';
          document.head.appendChild(styleEl);
        }
        const c = app.colors || {};
        const t = app.typography || {};
        const l = app.layout || {};
        styleEl.textContent = \`
          :root {
            --cms-primary: \${c.primary || '#7c3aed'};
            --cms-secondary: \${c.secondary || '#4f46e5'};
            --cms-accent: \${c.accent || '#10b981'};
            --cms-bg: \${c.background || '#ffffff'};
            --cms-heading: \${c.heading_text || '#0f172a'};
            --cms-body: \${c.body_text || '#334155'};
          }
          body {
            background-color: \${c.background || '#ffffff'};
            color: \${c.body_text || '#334155'};
            font-family: '\${t.body_font || 'Inter'}', sans-serif;
            line-height: \${t.line_height || '1.6'};
          }
          h1, h2, h3, h4, .font-heading {
            font-family: '\${t.heading_font || 'Poppins'}', sans-serif;
          }
          .gradient-hero-btn {
            background: linear-gradient(135deg, \${c.primary || '#7c3aed'} 0%, \${c.secondary || '#4f46e5'} 100%) !important;
            border-radius: \${l.button_radius || '0.875rem'} !important;
          }
          header.sticky {
            background-color: \${c.header_bg || 'rgba(255,255,255,0.95)'} !important;
          }
          footer.bg-navy {
            background-color: \${c.footer_bg || '#0b0f19'} !important;
          }
        \`;
      }

      // 3. Apply SEO Settings
      if (cms.seo) {
        if (cms.seo.global_title) document.title = cms.seo.global_title;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && cms.seo.meta_description) metaDesc.setAttribute('content', cms.seo.meta_description);
      }

      // 4. Apply Footer Overrides
      if (cms.footer) {
        const f = cms.footer;
        const sumEl = document.getElementById('footer-summary');
        if (sumEl && f.brand_description) sumEl.textContent = f.brand_description;
      }

      // 5. Apply Homepage Section Custom Headings & Visibility
      if (cms.homepage && Array.isArray(cms.homepage.sections)) {
        cms.homepage.sections.forEach(sec => {
          const hEl = document.getElementById('cms-heading-' + sec.id);
          if (hEl && sec.heading) hEl.textContent = sec.heading;
          const sEl = document.getElementById('cms-subtitle-' + sec.id);
          if (sEl && sec.subtitle) sEl.textContent = sec.subtitle;
        });
      }
    }
`;

if (!html.includes('function applyCmsBundleUI')) {
  html = html.replace('function applySettingsUI(s) {', `${cmsThemeEngineCode}\n    function applySettingsUI(s) {`);
}

// Also fetch /cms-bundle in initAppData
const oldInitPromise = `const [settings, topics, tools, articles, courses, testimonials, marquee] = await Promise.all([
          apiFetch('/settings'),
          apiFetch('/topics'),
          apiFetch('/tools'),
          apiFetch('/articles'),
          apiFetch('/courses'),
          apiFetch('/testimonials'),
          apiFetch('/marquee'),
        ]);`;

const newInitPromise = `const [settings, topics, tools, articles, courses, testimonials, marquee, cmsBundle] = await Promise.all([
          apiFetch('/settings'),
          apiFetch('/topics'),
          apiFetch('/tools'),
          apiFetch('/articles'),
          apiFetch('/courses'),
          apiFetch('/testimonials'),
          apiFetch('/marquee'),
          apiFetch('/cms-bundle'),
        ]);
        if (cmsBundle && Object.keys(cmsBundle).length > 0) {
          applyCmsBundleUI(cmsBundle);
        }`;

html = html.replace(oldInitPromise, newInitPromise);

fs.writeFileSync('public/index.html', html, 'utf8');
fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully wired public/index.html and index.html with CMS Theme Engine & Free Courses!');

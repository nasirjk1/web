import fs from 'node:fs';

let html = fs.readFileSync('public/index.html', 'utf8');

console.log('Upgrading public/index.html with Full Visual Builder Bridge, 24-Page Router, Mobile Design Tokens & Section Tagging...');

// 1. Tag all 11 homepage sections in renderHomeView with data-cms-section="..." so they can be reordered, styled, hidden/shown, and click-selected in the Visual Builder
const sectionReplacements = [
  {
    find: '<!-- SECTION A: HERO SECTION -->\n        <section class="',
    replace: '<!-- SECTION A: HERO SECTION -->\n        <section id="homepage-section-hero" data-cms-section="hero" class="'
  },
  {
    find: '<!-- SECTION B: ANIMATED ANNOUNCEMENT MARQUEE (DIRECTLY BELOW HERO) -->\n        <div class="',
    replace: '<!-- SECTION B: ANIMATED ANNOUNCEMENT MARQUEE (DIRECTLY BELOW HERO) -->\n        <div id="homepage-section-marquee" data-cms-section="marquee" class="'
  },
  {
    find: '<!-- SECTION C: 11 FREE AI & WEBMASTER UTILITIES -->\n        <section id="tools" class="',
    replace: '<!-- SECTION C: 11 FREE AI & WEBMASTER UTILITIES -->\n        <section id="tools" data-cms-section="tools" class="'
  },
  {
    find: '<!-- SECTION D: PAID ACADEMY MASTERCLASSES -->\n        <section class="',
    replace: '<!-- SECTION D: PAID ACADEMY MASTERCLASSES -->\n        <section id="homepage-section-paid_courses" data-cms-section="paid_courses" class="'
  },
  {
    find: 'id="homepage-section-free_courses"',
    replace: 'id="homepage-section-free_courses" data-cms-section="free_courses"'
  },
  {
    find: '<!-- SECTION E: WHY CHOOSE WEB NASIR ACADEMY (Reference Comparison Style) -->\n        <section class="',
    replace: '<!-- SECTION E: WHY CHOOSE WEB NASIR ACADEMY (Reference Comparison Style) -->\n        <section id="homepage-section-why_choose" data-cms-section="why_choose" class="'
  },
  {
    find: '<!-- SECTION F: CAREER TRACKS -->\n        <section class="',
    replace: '<!-- SECTION F: CAREER TRACKS -->\n        <section id="homepage-section-learning_pathways" data-cms-section="learning_pathways" class="'
  },
  {
    find: '<!-- SECTION G: FOUNDER NASIR VIDEO PRESENTER SECTION (Moved to Position 8) -->\n        <section id="video" class="',
    replace: '<!-- SECTION G: FOUNDER NASIR VIDEO PRESENTER SECTION (Moved to Position 8) -->\n        <section id="video" data-cms-section="founder_video" class="'
  },
  {
    find: '<!-- SECTION H: GUIDES & CASE STUDIES -->\n        <section class="',
    replace: '<!-- SECTION H: GUIDES & CASE STUDIES -->\n        <section id="homepage-section-guides_articles" data-cms-section="guides_articles" class="'
  },
  {
    find: '<!-- SECTION I: STUDENT TESTIMONIALS -->\n        <section class="',
    replace: '<!-- SECTION I: STUDENT TESTIMONIALS -->\n        <section id="homepage-section-testimonials" data-cms-section="testimonials" class="'
  },
  {
    find: '<!-- SECTION J: FINAL CALL TO ACTION -->\n        <section class="',
    replace: '<!-- SECTION J: FINAL CALL TO ACTION -->\n        <section id="homepage-section-final_cta" data-cms-section="final_cta" class="'
  }
];

for (const sr of sectionReplacements) {
  if (html.includes(sr.find) && !html.includes(sr.replace)) {
    html = html.replace(sr.find, sr.replace);
  }
}

// 2. Add applyCmsBundleUI(cms), 24-page renderers, and Visual Website Builder postMessage Bridge right before applySettingsUI(settings)
const cmsBridgeCode = `
    // ==========================================
    // COMPLETE VISUAL CMS ENGINE, 24-PAGE RENDERER & LIVE BUILDER BRIDGE
    // ==========================================
    function applyCmsBundleUI(cms) {
      if (!cms) return;
      window.APP_STATE.cms = { ...(window.APP_STATE.cms || {}), ...cms };

      if (Array.isArray(cms.free_courses) && cms.free_courses.length > 0) {
        window.APP_STATE.freeCourses = cms.free_courses;
      }

      // 1. Apply Global Design System & Dedicated Mobile Optimization CSS Variables
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
        const m = app.mobile || {};
        styleEl.textContent = \`
          :root {
            --cms-primary: \${c.primary || '#7c3aed'};
            --cms-secondary: \${c.secondary || '#4f46e5'};
            --cms-accent: \${c.accent || '#10b981'};
            --cms-bg: \${c.background || '#ffffff'};
            --cms-surface: \${c.surface || '#f8fafc'};
            --cms-heading: \${c.heading_text || '#0f172a'};
            --cms-body: \${c.body_text || '#334155'};
            --cms-border: \${c.border_color || '#e2e8f0'};
            --cms-container: \${l.container_width || '1280px'};
            --cms-card-radius: \${l.card_radius || '1.5rem'};
            --cms-btn-radius: \${l.button_radius || '0.875rem'};
          }
          html, body {
            overflow-x: hidden;
            max-width: 100vw;
            background-color: \${c.background || '#ffffff'};
            color: \${c.body_text || '#334155'};
            font-family: '\${t.body_font || 'Inter'}', sans-serif;
            font-size: \${t.body_size || '0.95rem'};
            line-height: \${t.line_height || '1.6'};
          }
          h1, h2, h3, h4, .font-heading {
            font-family: '\${t.heading_font || 'Poppins'}', sans-serif;
            letter-spacing: \${t.letter_spacing || '-0.02em'};
          }
          .gradient-hero-btn {
            background: linear-gradient(135deg, \${c.button_bg || c.primary || '#7c3aed'} 0%, \${c.secondary || '#4f46e5'} 100%) !important;
            color: \${c.button_text || '#ffffff'} !important;
            border-radius: \${l.button_radius || '0.875rem'} !important;
          }
          header.sticky, header {
            background-color: \${c.header_bg || 'rgba(255,255,255,0.95)'} !important;
            color: \${c.header_text || '#0f172a'};
          }
          footer.bg-navy, footer {
            background-color: \${c.footer_bg || '#0b0f19'} !important;
          }
          @media (max-width: 767px) {
            h1 {
              font-size: \${m.hero_h1_size || '2.05rem'} !important;
              line-height: 1.18 !important;
            }
            body {
              font-size: \${m.body_text_size || '0.92rem'} !important;
            }
            section[data-cms-section] {
              padding-top: \${m.section_padding_y || '3rem'} !important;
              padding-bottom: \${m.section_padding_y || '3rem'} !important;
            }
            button, a.gradient-hero-btn {
              min-height: \${m.button_min_height || '44px'};
            }
            \${m.hide_announcement_on_small ? '#top-announcement-bar { display: none !important; }' : ''}
          }
          /* Builder Selection Highlight */
          .cms-builder-hovered {
            outline: 2px dashed #8b5cf6 !important;
            outline-offset: -2px !important;
            cursor: pointer !important;
          }
          .cms-builder-selected {
            outline: 3px solid #7c3aed !important;
            outline-offset: -3px !important;
            position: relative !important;
          }
        \`;
      }

      // 2. Apply Top Announcement Bar Config (with Schedule & Mobile visibility)
      if (cms.announcement) {
        const ann = cms.announcement;
        const topBar = document.getElementById('top-announcement-bar');
        if (topBar) {
          const isVisible = ann.enabled !== false && ann.schedule_active !== false;
          if (!isVisible) {
            topBar.classList.add('hidden');
          } else {
            topBar.classList.remove('hidden');
            if (ann.bg_color) topBar.style.backgroundColor = ann.bg_color;
            if (ann.text_color) topBar.style.color = ann.text_color;
            if (ann.font_size) topBar.style.fontSize = ann.font_size;
            const aBadge = document.getElementById('announcement-badge');
            const aText = document.getElementById('announcement-text');
            const aLink = document.getElementById('announcement-link');
            if (aBadge && ann.badge) aBadge.textContent = ann.badge + ':';
            if (aText && ann.text) aText.textContent = ann.text;
            if (aLink) {
              if (ann.button_text) aLink.textContent = ann.button_text;
              if (ann.link_url) aLink.href = ann.link_url;
            }
          }
        }
      }

      // 3. Apply Marquee Config (Speed, Direction, Colors, Schedule)
      if (cms.marquee_config) {
        const mc = cms.marquee_config;
        const mWrap = document.getElementById('homepage-section-marquee');
        const mTrack = document.getElementById('marquee-track');
        if (mWrap) {
          if (mc.enabled === false || mc.schedule_active === false) {
            mWrap.style.display = 'none';
          } else {
            mWrap.style.display = '';
            if (mc.bg_color) mWrap.style.backgroundColor = mc.bg_color;
            if (mc.text_color) mWrap.style.color = mc.text_color;
            if (mc.font_size) mWrap.style.fontSize = mc.font_size;
          }
        }
        if (mTrack && mc.speed_seconds) {
          mTrack.style.animationDuration = mc.speed_seconds + 's';
          mTrack.style.animationDirection = mc.direction === 'right' ? 'reverse' : 'normal';
        }
      }

      // 4. Apply Global SEO Settings
      if (cms.seo) {
        if (cms.seo.global_title) document.title = cms.seo.global_title;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && cms.seo.meta_description) metaDesc.setAttribute('content', cms.seo.meta_description);
      }

      // 5. Apply Footer Overrides
      if (cms.footer) {
        const f = cms.footer;
        const sumEl = document.getElementById('footer-summary');
        if (sumEl && f.brand_description) sumEl.textContent = f.brand_description;
        const footerEl = document.querySelector('footer');
        if (footerEl && f.bg_color) footerEl.style.backgroundColor = f.bg_color;
      }

      // 6. Apply Homepage Section Customizations
      applyHomepageSectionOverrides();
    }

    function applyHomepageSectionOverrides() {
      const cms = window.APP_STATE.cms || {};
      if (!cms.homepage || !Array.isArray(cms.homepage.sections)) return;

      const appView = document.getElementById('app-view');
      const isMobileViewport = window.innerWidth < 768;

      const sortedSections = [...cms.homepage.sections].sort((a, b) => (a.order || 0) - (b.order || 0));

      sortedSections.forEach((sec) => {
        const secEl = document.querySelector(\`[data-cms-section="\${sec.id}"]\`);
        if (!secEl) return;

        // Visibility check (global enabled + desktop/mobile responsive visibility)
        const visible = sec.enabled !== false && (isMobileViewport ? sec.mobile_visible !== false : sec.desktop_visible !== false);
        secEl.style.display = visible ? '' : 'none';

        // Background & Text colors
        if (sec.bg_color) secEl.style.backgroundColor = sec.bg_color;
        if (sec.text_color) secEl.style.color = sec.text_color;
        if (sec.padding_y) {
          secEl.style.paddingTop = sec.padding_y;
          secEl.style.paddingBottom = sec.padding_y;
        }

        // Heading & Subtitle overrides
        const headingEl = secEl.querySelector('h1, h2');
        if (headingEl && sec.heading) headingEl.textContent = sec.heading;
        const subEl = secEl.querySelector('p');
        if (subEl && sec.subtitle) subEl.textContent = sec.subtitle;

        // Primary CTA button override
        if (sec.cta_primary_text) {
          const primaryBtn = secEl.querySelector('a.gradient-hero-btn span, button.gradient-hero-btn span');
          if (primaryBtn) primaryBtn.textContent = sec.cta_primary_text;
          const primaryAnchor = secEl.querySelector('a.gradient-hero-btn');
          if (primaryAnchor && sec.cta_primary_link) primaryAnchor.setAttribute('href', sec.cta_primary_link);
        }

        // Reorder DOM node inside appView if on homepage
        if (appView && secEl.parentElement === appView) {
          appView.appendChild(secEl);
        }
      });
    }

    // Dynamic Page Renderer for CMS Legal, System & Custom Landing Pages
    function renderCmsManagedPageView(container, pageSlug) {
      const pages = (window.APP_STATE.cms && window.APP_STATE.cms.pages) || [];
      const page = pages.find(p => p.slug === pageSlug) || {
        title: pageSlug.replace('#/', '').toUpperCase(),
        heading: pageSlug.replace('#/', '').replace(/-/g, ' ').replace(/\\b\\w/g, c => c.toUpperCase()),
        subtitle: 'Official Web Nasir Academy Documentation & Resource Page',
        body_content: 'This page is managed through the Web Nasir Admin Page Builder.',
        bg_color: '#ffffff',
        text_color: '#0f172a'
      };

      if (page.seo_title) document.title = page.seo_title;

      container.innerHTML = \`
        <div style="background-color:\${page.bg_color || '#ffffff'}; color:\${page.text_color || '#0f172a'};" class="min-h-[65vh] py-16 sm:py-24 border-b border-slate-200">
          <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div class="space-y-4">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold border border-brand-200">
                <span>Web Nasir Academy • \${page.route_type || 'Official Page'}</span>
              </div>
              <h1 class="text-3xl sm:text-5xl font-black font-heading tracking-tight">\${page.heading || page.title}</h1>
              \${page.subtitle ? \`<p class="text-base sm:text-lg opacity-80 leading-relaxed">\${page.subtitle}</p>\` : ''}
            </div>

            \${page.hero_image ? \`
              <div class="rounded-3xl overflow-hidden border border-slate-200 shadow-lg">
                <img src="\${page.hero_image}" alt="\${page.title}" class="w-full h-auto object-cover max-h-96" loading="lazy">
              </div>
            \` : ''}

            <div class="prose max-w-none bg-white/95 text-slate-800 p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-sm sm:text-base leading-relaxed whitespace-pre-line">
              \${page.body_content || 'Managed via Web Nasir Visual Page Builder.'}
            </div>

            \${(Array.isArray(page.sections) && page.sections.length > 0) ? \`
              <div class="space-y-6">
                \${page.sections.map(s => \`
                  <div class="p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200 text-slate-900 space-y-2">
                    <h3 class="text-xl font-bold font-heading">\${s.heading || s.title || 'Section'}</h3>
                    <p class="text-sm text-slate-600 leading-relaxed">\${s.content || s.subtitle || ''}</p>
                  </div>
                \`).join('')}
              </div>
            \` : ''}

            <div class="pt-4 flex flex-wrap items-center gap-4">
              <a href="\${page.cta_link || '#/courses'}" class="gradient-hero-btn text-white text-xs sm:text-sm font-bold px-6 py-3.5 rounded-xl inline-flex items-center gap-2 shadow-md">
                <span>\${page.cta_text || 'Explore Flagship Courses'}</span>
                <i data-lucide="arrow-right" class="w-4 h-4"></i>
              </a>
              <a href="#/" class="px-5 py-3.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs sm:text-sm font-bold hover:bg-slate-50">
                Back to Homepage
              </a>
            </div>
          </div>
        </div>
      \`;
      lucide.createIcons();
    }

    // Search Results View (#/search)
    function renderSearchResultsView(container) {
      const tools = window.APP_STATE.tools || [];
      const courses = window.APP_STATE.courses || [];
      const freeCourses = window.APP_STATE.freeCourses || [];
      const articles = window.APP_STATE.articles || [];

      container.innerHTML = \`
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
          <div class="text-center max-w-2xl mx-auto space-y-3">
            <h1 class="text-3xl sm:text-4xl font-black font-heading text-slate-900">Search Web Nasir Academy</h1>
            <p class="text-sm text-slate-600">Find any free AI utility, paid masterclass, free starter bootcamp, or engineering guide.</p>
            <input id="global-search-box" oninput="executeGlobalSearchLive(this.value)" type="text" placeholder="Search AI tools, courses, SEO, AdSense..." class="w-full px-5 py-3.5 rounded-2xl border border-slate-300 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-brand-600">
          </div>
          <div id="global-search-results" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            \${courses.slice(0, 3).map(c => \`<a href="#/courses/\${c.id}" class="p-5 rounded-2xl bg-white border border-slate-200 hover:border-brand-400 transition-all"><span class="text-[10px] font-bold uppercase text-brand-700">Paid Course • ₹\${c.price}</span><h3 class="font-bold text-slate-900 mt-1">\${c.title}</h3><p class="text-xs text-slate-500 mt-1 line-clamp-2">\${c.subtitle || c.overview || ''}</p></a>\`).join('')}
            \${freeCourses.map(fc => \`<a href="#/courses" class="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 transition-all"><span class="text-[10px] font-bold uppercase text-emerald-700">100% Free Course</span><h3 class="font-bold text-slate-900 mt-1">\${fc.title}</h3><p class="text-xs text-slate-500 mt-1 line-clamp-2">\${fc.description || ''}</p></a>\`).join('')}
            \${tools.slice(0, 6).map(t => \`<a href="#/tools/\${t.key}" class="p-5 rounded-2xl bg-white border border-slate-200 hover:border-brand-400 transition-all"><span class="text-[10px] font-bold uppercase text-indigo-700">Free AI Tool</span><h3 class="font-bold text-slate-900 mt-1">\${t.name}</h3><p class="text-xs text-slate-500 mt-1 line-clamp-2">\${t.description || ''}</p></a>\`).join('')}
          </div>
        </div>
      \`;
      window.executeGlobalSearchLive = function(q) {
        const query = String(q || '').toLowerCase().trim();
        const resEl = document.getElementById('global-search-results');
        if (!resEl) return;
        const matchedCourses = courses.filter(c => (c.title + ' ' + (c.subtitle || '')).toLowerCase().includes(query));
        const matchedFree = freeCourses.filter(fc => (fc.title + ' ' + (fc.description || '')).toLowerCase().includes(query));
        const matchedTools = tools.filter(t => (t.name + ' ' + (t.description || '')).toLowerCase().includes(query));
        const matchedArticles = articles.filter(a => (a.title + ' ' + (a.summary || '')).toLowerCase().includes(query));
        resEl.innerHTML = [
          ...matchedCourses.map(c => \`<a href="#/courses/\${c.id}" class="p-5 rounded-2xl bg-white border border-slate-200 hover:border-brand-400 transition-all"><span class="text-[10px] font-bold uppercase text-brand-700">Paid Course • ₹\${c.price}</span><h3 class="font-bold text-slate-900 mt-1">\${c.title}</h3><p class="text-xs text-slate-500 mt-1 line-clamp-2">\${c.subtitle || ''}</p></a>\`),
          ...matchedFree.map(fc => \`<a href="#/courses" class="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 transition-all"><span class="text-[10px] font-bold uppercase text-emerald-700">100% Free Course</span><h3 class="font-bold text-slate-900 mt-1">\${fc.title}</h3><p class="text-xs text-slate-500 mt-1 line-clamp-2">\${fc.description || ''}</p></a>\`),
          ...matchedTools.map(t => \`<a href="#/tools/\${t.key}" class="p-5 rounded-2xl bg-white border border-slate-200 hover:border-brand-400 transition-all"><span class="text-[10px] font-bold uppercase text-indigo-700">Free AI Tool</span><h3 class="font-bold text-slate-900 mt-1">\${t.name}</h3><p class="text-xs text-slate-500 mt-1 line-clamp-2">\${t.description || ''}</p></a>\`),
          ...matchedArticles.map(a => \`<a href="#/articles/\${a.slug}" class="p-5 rounded-2xl bg-white border border-slate-200 hover:border-brand-400 transition-all"><span class="text-[10px] font-bold uppercase text-amber-700">Guide / Case Study</span><h3 class="font-bold text-slate-900 mt-1">\${a.title}</h3><p class="text-xs text-slate-500 mt-1 line-clamp-2">\${a.summary || ''}</p></a>\`)
        ].join('') || '<div class="col-span-full text-center py-12 text-sm text-slate-500">No matching tools, courses, or guides found.</div>';
      };
    }

    // ==========================================
    // INTERACTIVE VISUAL BUILDER POSTMESSAGE BRIDGE
    // ==========================================
    (function setupVisualBuilderBridge() {
      const isBuilderPreview = window.location.search.includes('builder_preview=1') || window.parent !== window;
      if (!isBuilderPreview) return;

      window.addEventListener('message', (event) => {
        const msg = event.data;
        if (!msg || typeof msg !== 'object') return;

        // 1. Live Draft Update from Visual Website Builder
        if (msg.type === 'CMS_LIVE_PREVIEW_UPDATE') {
          if (msg.cms) {
            applyCmsBundleUI(msg.cms);
          }
          if (msg.settings) {
            window.APP_STATE.settings = { ...window.APP_STATE.settings, ...msg.settings };
            applySettingsUI(window.APP_STATE.settings);
          }
          if (msg.rerender) {
            router();
            if (msg.cms) applyCmsBundleUI(msg.cms);
          }
        }

        // 2. Highlight & Scroll to Selected Section in Center Preview
        if (msg.type === 'CMS_BUILDER_SELECT_SECTION') {
          document.querySelectorAll('.cms-builder-selected').forEach(el => el.classList.remove('cms-builder-selected'));
          const target = document.querySelector(\`[data-cms-section="\${msg.sectionId}"]\`);
          if (target) {
            target.classList.add('cms-builder-selected');
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }

        // 3. Navigate Preview Iframe to Any Page
        if (msg.type === 'CMS_BUILDER_NAVIGATE' && msg.slug) {
          window.location.hash = msg.slug;
        }

        // 4. Automated Responsive Viewport QA Measurement
        if (msg.type === 'CMS_RUN_VIEWPORT_QA') {
          const docEl = document.documentElement;
          const scrollWidth = docEl.scrollWidth;
          const clientWidth = docEl.clientWidth;
          const hasHorizontalOverflow = scrollWidth > clientWidth + 2;
          const buttons = Array.from(document.querySelectorAll('button, a.gradient-hero-btn')).filter(b => b.offsetParent !== null);
          const smallTouchTargets = buttons.filter(b => b.getBoundingClientRect().height < 36).length;
          const images = Array.from(document.querySelectorAll('img'));
          const brokenImages = images.filter(img => img.complete && img.naturalWidth === 0).length;

          window.parent.postMessage({
            type: 'CMS_VIEWPORT_QA_RESULT',
            viewportWidth: clientWidth,
            scrollWidth,
            hasHorizontalOverflow,
            buttonsChecked: buttons.length,
            smallTouchTargets,
            imagesChecked: images.length,
            brokenImages,
            passed: !hasHorizontalOverflow && brokenImages === 0
          }, '*');
        }
      });

      // Click-to-select any section inside the Live Preview
      document.addEventListener('click', (e) => {
        if (!window.location.search.includes('builder_preview=1')) return;
        const secEl = e.target.closest('[data-cms-section]');
        if (secEl) {
          document.querySelectorAll('.cms-builder-selected').forEach(el => el.classList.remove('cms-builder-selected'));
          secEl.classList.add('cms-builder-selected');
          const sectionId = secEl.getAttribute('data-cms-section');
          window.parent.postMessage({
            type: 'CMS_ELEMENT_CLICKED',
            sectionId,
            tagName: e.target.tagName,
            text: (e.target.textContent || '').trim().slice(0, 120)
          }, '*');
        }
      }, true);
    })();
`;

if (!html.includes('function applyCmsBundleUI(cms)')) {
  html = html.replace('function applySettingsUI(settings) {', `${cmsBridgeCode}\n    function applySettingsUI(settings) {`);
}

// 3. Upgrade router() to support all 24 pages AND apply homepage section overrides after rendering Homepage
const oldRouterBlock = `      } else if (hash === '#/about') {
        renderAboutPageView(appView);
      } else if (hash === '#/contact') {
        renderContactPageView(appView);
      } else {
        renderHomeView(appView);
      }

      lucide.createIcons();`;

const newRouterBlock = `      } else if (hash === '#/about') {
        renderAboutPageView(appView);
      } else if (hash === '#/contact') {
        renderContactPageView(appView);
      } else if (hash === '#/student-login') {
        renderHomeView(appView);
        setTimeout(() => { if (typeof openStudentAuthModal === 'function') openStudentAuthModal(); }, 100);
      } else if (hash === '#/checkout') {
        renderCoursesCatalogView(appView);
      } else if (hash === '#/search') {
        renderSearchResultsView(appView);
      } else if (hash === '#/privacy' || hash === '#/terms' || hash === '#/disclaimer' || hash === '#/faq' || hash === '#/payment-success' || hash === '#/payment-failure' || hash.startsWith('#/page/')) {
        renderCmsManagedPageView(appView, hash);
      } else {
        renderHomeView(appView);
      }

      if (hash === '#/' || hash === '#' || hash === '') {
        applyHomepageSectionOverrides();
      }

      lucide.createIcons();`;

if (html.includes(oldRouterBlock)) {
  html = html.replace(oldRouterBlock, newRouterBlock);
}

fs.writeFileSync('public/index.html', html, 'utf8');
fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully upgraded public/index.html and index.html with Full Visual Builder Bridge & 24-Page Router!');

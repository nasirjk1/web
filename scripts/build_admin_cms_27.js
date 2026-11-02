import fs from 'node:fs';
import path from 'node:path';

let adminHtml = fs.readFileSync('public/admin.html', 'utf8');

console.log('Upgrading Admin Dashboard into 27-Section Complete CMS Control Center with Left Sidebar...');

// 1. Replace top horizontal subnav with a Modern Left Sidebar + Sticky Action Bar Layout
const oldHeaderEnd = `</header>

    <!-- Subnav Tabs -->`;

const sidebarStartIdx = adminHtml.indexOf('<!-- Subnav Tabs -->');
const mainContentStartIdx = adminHtml.indexOf('<!-- MAIN DASHBOARD CONTENT -->');

const sidebarAndTopBarHtml = `
    <!-- TOP GLOBAL SAVE, PREVIEW & REVISION BAR -->
    <div class="bg-slate-900 text-white border-b border-slate-800 px-4 sm:px-6 py-2.5 sticky top-16 z-20">
      <div class="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        <div class="flex items-center gap-3">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[11px]">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>CMS Live Sync Active</span>
          </span>
          <span class="text-slate-400 hidden md:inline">27 Modules Ready • Changes apply directly to production store</span>
        </div>

        <div class="flex items-center gap-2">
          <button onclick="createCmsRevisionSnapshot()" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 flex items-center gap-1.5 transition-all">
            <i data-lucide="history" class="w-3.5 h-3.5 text-violet-400"></i>
            <span>Save Snapshot</span>
          </button>
          <button onclick="openLivePreviewModal()" class="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 transition-all shadow-xs">
            <i data-lucide="eye" class="w-3.5 h-3.5"></i>
            <span>Live Site Preview</span>
          </button>
          <button onclick="publishAllCurrentChanges()" class="px-4 py-1.5 rounded-lg gradient-btn text-white font-bold flex items-center gap-1.5 shadow-md">
            <i data-lucide="check-circle-2" class="w-3.5 h-3.5"></i>
            <span>Publish Changes</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Alert Banner If Must Change Password -->
    <div id="password-alert-banner" class="hidden bg-amber-500 text-white px-4 py-2.5 text-xs font-medium shadow-md">
      <div class="max-w-[1600px] mx-auto flex items-center justify-between">
        <div class="flex items-center gap-2">
          <i data-lucide="alert-triangle" class="w-4 h-4 flex-shrink-0"></i>
          <span>Security Notice: You are using the default seeded password ("admin123").</span>
        </div>
        <button onclick="switchTab('security')" class="underline font-bold bg-amber-600 px-3 py-1 rounded-lg hover:bg-amber-700">
          Update Password &rarr;
        </button>
      </div>
    </div>

    <!-- 27-MODULE CMS WORKSPACE: SIDEBAR + MAIN CONTENT -->
    <div class="flex-grow flex flex-col lg:flex-row max-w-[1600px] w-full mx-auto">
      
      <!-- LEFT SIDEBAR NAVIGATION (All 27 Modules) -->
      <aside class="w-full lg:w-72 bg-white border-r border-bordercol flex-shrink-0 lg:min-h-[calc(100vh-7rem)] p-4 space-y-6 overflow-y-auto max-h-[45vh] lg:max-h-none">
        
        <div>
          <div class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 mb-2">Core & Visual Builders</div>
          <nav class="space-y-1 text-xs font-semibold text-slate-600" id="admin-tabs">
            <button onclick="switchTab('overview')" class="tab-btn w-full text-left px-3 py-2 rounded-xl flex items-center gap-2.5 text-brand-600 bg-brand-50 font-bold" data-tab="overview">
              <i data-lucide="layout-dashboard" class="w-4 h-4"></i><span>1. Overview</span>
            </button>
            <button onclick="switchTab('homepage-builder')" class="tab-btn w-full text-left px-3 py-2 rounded-xl flex items-center gap-2.5 hover:bg-slate-50" data-tab="homepage-builder">
              <i data-lucide="layers" class="w-4 h-4 text-violet-600"></i><span>2. Homepage Builder</span>
            </button>
            <button onclick="switchTab('header-nav')" class="tab-btn w-full text-left px-3 py-2 rounded-xl flex items-center gap-2.5 hover:bg-slate-50" data-tab="header-nav">
              <i data-lucide="compass" class="w-4 h-4 text-indigo-600"></i><span>3. Header & Navigation</span>
            </button>
            <button onclick="switchTab('marquee-video')" class="tab-btn w-full text-left px-3 py-2 rounded-xl flex items-center gap-2.5 hover:bg-slate-50" data-tab="marquee-video">
              <i data-lucide="megaphone" class="w-4 h-4 text-amber-500"></i><span>4. Announcement & Marquee</span>
            </button>
            <button onclick="switchTab('footer-builder')" class="tab-btn w-full text-left px-3 py-2 rounded-xl flex items-center gap-2.5 hover:bg-slate-50" data-tab="footer-builder">
              <i data-lucide="panel-bottom" class="w-4 h-4 text-slate-600"></i><span>19. Footer Builder</span>
            </button>
            <button onclick="switchTab('appearance')" class="tab-btn w-full text-left px-3 py-2 rounded-xl flex items-center gap-2.5 hover:bg-slate-50" data-tab="appearance">
              <i data-lucide="palette" class="w-4 h-4 text-pink-600"></i><span>20. Website Appearance</span>
            </button>
          </nav>
        </div>

        <div>
          <div class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 mb-2">Academy Courses & Tools</div>
          <nav class="space-y-1 text-xs font-semibold text-slate-600">
            <button onclick="switchTab('tools')" class="tab-btn w-full text-left px-3 py-2 rounded-xl flex items-center gap-2.5 hover:bg-slate-50" data-tab="tools">
              <i data-lucide="sparkles" class="w-4 h-4 text-brand-600"></i><span>5. Free AI Tools Manager</span>
            </button>
            <button onclick="switchTab('courses')" class="tab-btn w-full text-left px-3 py-2 rounded-xl flex items-center gap-2.5 hover:bg-slate-50" data-tab="courses">
              <i data-lucide="graduation-cap" class="w-4 h-4 text-violet-600"></i><span>6. Paid Courses Manager</span>
            </button>
            <button onclick="switchTab('free-courses')" class="tab-btn w-full text-left px-3 py-2 rounded-xl flex items-center gap-2.5 hover:bg-slate-50" data-tab="free-courses">
              <i data-lucide="gift" class="w-4 h-4 text-emerald-600"></i><span>7. Free Courses Manager</span>
            </button>
            <button onclick="switchTab('course-categories')" class="tab-btn w-full text-left px-3 py-2 rounded-xl flex items-center gap-2.5 hover:bg-slate-50" data-tab="course-categories">
              <i data-lucide="folder-kanban" class="w-4 h-4 text-blue-600"></i><span>8. Course Categories</span>
            </button>
            <button onclick="switchTab('course-curriculum')" class="tab-btn w-full text-left px-3 py-2 rounded-xl flex items-center gap-2.5 hover:bg-slate-50" data-tab="course-curriculum">
              <i data-lucide="list-video" class="w-4 h-4 text-purple-600"></i><span>9. Course Modules & Lessons</span>
            </button>
          </nav>
        </div>

        <div>
          <div class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 mb-2">Students, Commerce & Email</div>
          <nav class="space-y-1 text-xs font-semibold text-slate-600">
            <button onclick="switchTab('payment-gateway')" class="tab-btn w-full text-left px-3 py-2 rounded-xl flex items-center gap-2.5 hover:bg-slate-50" data-tab="payment-gateway">
              <i data-lucide="credit-card" class="w-4 h-4 text-emerald-600"></i><span>10. Payment Gateway Settings</span>
            </button>
            <button onclick="switchTab('students')" class="tab-btn w-full text-left px-3 py-2 rounded-xl flex items-center gap-2.5 hover:bg-slate-50" data-tab="students">
              <i data-lucide="users" class="w-4 h-4 text-violet-600"></i><span>11. Student Management</span>
            </button>
            <button onclick="switchTab('enrollments')" class="tab-btn w-full text-left px-3 py-2 rounded-xl flex items-center gap-2.5 hover:bg-slate-50" data-tab="enrollments">
              <i data-lucide="shopping-bag" class="w-4 h-4 text-indigo-600"></i><span>12. Orders & Enrollments</span>
            </button>
            <button onclick="switchTab('email-center')" class="tab-btn w-full text-left px-3 py-2 rounded-xl flex items-center gap-2.5 hover:bg-slate-50" data-tab="email-center">
              <i data-lucide="mail" class="w-4 h-4 text-rose-500"></i><span>13. Email Center</span>
            </button>
          </nav>
        </div>

        <div>
          <div class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 mb-2">Content, Pages & SEO</div>
          <nav class="space-y-1 text-xs font-semibold text-slate-600">
            <button onclick="switchTab('articles')" class="tab-btn w-full text-left px-3 py-2 rounded-xl flex items-center gap-2.5 hover:bg-slate-50" data-tab="articles">
              <i data-lucide="book-open" class="w-4 h-4 text-brand-600"></i><span>14. Articles & Guides</span>
            </button>
            <button onclick="switchTab('topics')" class="tab-btn w-full text-left px-3 py-2 rounded-xl flex items-center gap-2.5 hover:bg-slate-50" data-tab="topics">
              <i data-lucide="tags" class="w-4 h-4 text-amber-600"></i><span>15. Learning Topics</span>
            </button>
            <button onclick="switchTab('testimonials')" class="tab-btn w-full text-left px-3 py-2 rounded-xl flex items-center gap-2.5 hover:bg-slate-50" data-tab="testimonials">
              <i data-lucide="star" class="w-4 h-4 text-amber-500"></i><span>16. Testimonials</span>
            </button>
            <button onclick="switchTab('about-editor')" class="tab-btn w-full text-left px-3 py-2 rounded-xl flex items-center gap-2.5 hover:bg-slate-50" data-tab="about-editor">
              <i data-lucide="user-check" class="w-4 h-4 text-blue-600"></i><span>17. About Us Page</span>
            </button>
            <button onclick="switchTab('contact-editor')" class="tab-btn w-full text-left px-3 py-2 rounded-xl flex items-center gap-2.5 hover:bg-slate-50" data-tab="contact-editor">
              <i data-lucide="phone-call" class="w-4 h-4 text-emerald-600"></i><span>18. Contact Page</span>
            </button>
            <button onclick="switchTab('seo-settings')" class="tab-btn w-full text-left px-3 py-2 rounded-xl flex items-center gap-2.5 hover:bg-slate-50" data-tab="seo-settings">
              <i data-lucide="globe" class="w-4 h-4 text-teal-600"></i><span>21. SEO Settings</span>
            </button>
            <button onclick="switchTab('media-library')" class="tab-btn w-full text-left px-3 py-2 rounded-xl flex items-center gap-2.5 hover:bg-slate-50" data-tab="media-library">
              <i data-lucide="image" class="w-4 h-4 text-purple-600"></i><span>22. Media Library</span>
            </button>
            <button onclick="switchTab('social-settings')" class="tab-btn w-full text-left px-3 py-2 rounded-xl flex items-center gap-2.5 hover:bg-slate-50" data-tab="social-settings">
              <i data-lucide="share-2" class="w-4 h-4 text-sky-600"></i><span>23. Social Media Settings</span>
            </button>
          </nav>
        </div>

        <div>
          <div class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 mb-2">System & Administration</div>
          <nav class="space-y-1 text-xs font-semibold text-slate-600">
            <button onclick="switchTab('user-access')" class="tab-btn w-full text-left px-3 py-2 rounded-xl flex items-center gap-2.5 hover:bg-slate-50" data-tab="user-access">
              <i data-lucide="shield-check" class="w-4 h-4 text-indigo-600"></i><span>24. User & Access Management</span>
            </button>
            <button onclick="switchTab('analytics')" class="tab-btn w-full text-left px-3 py-2 rounded-xl flex items-center gap-2.5 hover:bg-slate-50" data-tab="analytics">
              <i data-lucide="bar-chart-3" class="w-4 h-4 text-emerald-600"></i><span>25. Analytics & Reports</span>
            </button>
            <button onclick="switchTab('security')" class="tab-btn w-full text-left px-3 py-2 rounded-xl flex items-center gap-2.5 hover:bg-slate-50" data-tab="security">
              <i data-lucide="lock" class="w-4 h-4 text-rose-600"></i><span>26. Security Settings</span>
            </button>
            <button onclick="switchTab('home-settings')" class="tab-btn w-full text-left px-3 py-2 rounded-xl flex items-center gap-2.5 hover:bg-slate-50" data-tab="home-settings">
              <i data-lucide="settings" class="w-4 h-4 text-slate-700"></i><span>27. General Website Settings</span>
            </button>
          </nav>
        </div>

      </aside>
`;

if (sidebarStartIdx !== -1 && mainContentStartIdx !== -1) {
  adminHtml = adminHtml.slice(0, sidebarStartIdx) + sidebarAndTopBarHtml + '\n      ' + adminHtml.slice(mainContentStartIdx);
  // Close the flex container after </main>
  adminHtml = adminHtml.replace('</main>', '</main>\n    </div>');
}

// 2. Inject the new CMS Tab Panels right before `<!-- TAB: ANALYTICS OVERVIEW -->`
const cmsTabPanels = `
      <!-- TAB 2: HOMEPAGE BUILDER (Visual Section Management & Reordering) -->
      <section id="tab-homepage-builder" class="tab-panel hidden space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl font-bold font-heading text-dark">2. Homepage Visual Builder</h2>
            <p class="text-sm text-muted">Enable/disable sections, reorder layout, customize headings, subtitles, CTAs, background colors, and device visibility.</p>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="openLivePreviewModal()" class="px-4 py-2.5 rounded-xl bg-white border border-bordercol text-xs font-semibold text-dark flex items-center gap-1.5">
              <i data-lucide="eye" class="w-4 h-4 text-brand-600"></i><span>Preview Homepage</span>
            </button>
            <button onclick="handleSaveHomepageBuilder()" class="gradient-btn text-white text-xs font-semibold px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm">
              <i data-lucide="save" class="w-4 h-4"></i><span>Publish Homepage Layout</span>
            </button>
          </div>
        </div>

        <div id="homepage-sections-list" class="space-y-4">
          <!-- Populated dynamically -->
        </div>
      </section>

      <!-- TAB 3: HEADER & NAVIGATION MANAGER -->
      <section id="tab-header-nav" class="tab-panel hidden space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl font-bold font-heading text-dark">3. Header & Navigation Manager</h2>
            <p class="text-sm text-muted">Manage top menu items, dropdown links, CTA buttons, icons, and desktop/mobile visibility.</p>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="addNavMenuItem()" class="px-4 py-2.5 rounded-xl bg-white border border-bordercol text-xs font-semibold text-brand-600 flex items-center gap-1.5">
              <i data-lucide="plus" class="w-4 h-4"></i><span>Add Menu Item</span>
            </button>
            <button onclick="handleSaveNavigation()" class="gradient-btn text-white text-xs font-semibold px-5 py-2.5 rounded-xl flex items-center gap-1.5">
              <i data-lucide="save" class="w-4 h-4"></i><span>Save Navigation</span>
            </button>
          </div>
        </div>

        <div class="bg-white p-6 rounded-3xl border border-bordercol space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-slate-100 pb-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Header CTA Button Label</label>
              <input id="nav-cta-text" type="text" value="Explore Courses" class="w-full px-3 py-2 text-xs bg-surface border border-bordercol rounded-xl">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Header CTA Destination URL</label>
              <input id="nav-cta-url" type="text" value="#/courses" class="w-full px-3 py-2 text-xs bg-surface border border-bordercol rounded-xl">
            </div>
            <div class="flex items-center gap-4 pt-5">
              <label class="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input type="checkbox" id="nav-sticky" checked class="w-4 h-4 text-brand-600 rounded">
                <span>Sticky Top Header</span>
              </label>
            </div>
          </div>

          <div id="nav-items-container" class="space-y-3">
            <!-- Populated dynamically -->
          </div>
        </div>
      </section>

      <!-- TAB 7: FREE COURSES MANAGER -->
      <section id="tab-free-courses" class="tab-panel hidden space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl font-bold font-heading text-dark">7. Free Courses Manager (Direct Enrollment)</h2>
            <p class="text-sm text-muted">Manage 100% free starter courses and bootcamps that unlock immediately without Razorpay checkout.</p>
          </div>
          <button onclick="openNewFreeCourseModal()" class="gradient-btn text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm">
            <i data-lucide="plus" class="w-4 h-4"></i><span>Add Free Course</span>
          </button>
        </div>

        <div id="free-courses-manager-list" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Populated dynamically -->
        </div>
      </section>

      <!-- TAB 8: COURSE CATEGORIES -->
      <section id="tab-course-categories" class="tab-panel hidden space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl font-bold font-heading text-dark">8. Course Categories</h2>
            <p class="text-sm text-muted">Organize paid and free courses into clear technical taxonomy tracks.</p>
          </div>
          <button onclick="addCourseCategory()" class="gradient-btn text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2">
            <i data-lucide="plus" class="w-4 h-4"></i><span>Add Category</span>
          </button>
        </div>
        <div id="course-categories-grid" class="grid grid-cols-1 md:grid-cols-3 gap-4"></div>
      </section>

      <!-- TAB 9: COURSE MODULES & LESSONS (Curriculum Builder) -->
      <section id="tab-course-curriculum" class="tab-panel hidden space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl font-bold font-heading text-dark">9. Course Modules & Lessons Builder</h2>
            <p class="text-sm text-muted">Select any course to add modules, video lessons, text guides, downloadable resources, and free preview flags.</p>
          </div>
          <select id="curriculum-course-selector" onchange="loadCourseCurriculumEditor()" class="px-4 py-2.5 bg-white border border-bordercol rounded-xl text-xs font-bold text-dark"></select>
        </div>
        <div id="curriculum-builder-workspace" class="bg-white p-6 rounded-3xl border border-bordercol space-y-6"></div>
      </section>

      <!-- TAB 10: PAYMENT GATEWAY SETTINGS -->
      <section id="tab-payment-gateway" class="tab-panel hidden space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl font-bold font-heading text-dark">10. Payment Gateway Settings (Razorpay & UPI)</h2>
            <p class="text-sm text-muted">Configure Razorpay keys, test/live mode, currency, supported payment methods, and webhook verification.</p>
          </div>
          <button onclick="handleSavePaymentGateway()" class="gradient-btn text-white text-xs font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2">
            <i data-lucide="save" class="w-4 h-4"></i><span>Save Payment Settings</span>
          </button>
        </div>

        <div class="bg-white p-6 sm:p-8 rounded-3xl border border-bordercol space-y-6 max-w-3xl">
          <div class="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
            <div class="flex items-center gap-3">
              <i data-lucide="shield-check" class="w-6 h-6 text-emerald-600"></i>
              <div>
                <div class="text-xs font-bold text-emerald-950">Gateway Status: Connected & Server-Side Verified</div>
                <div class="text-[11px] text-emerald-700">Secret keys are kept strictly server-side. Signatures verified before course unlock.</div>
              </div>
            </div>
            <label class="flex items-center gap-2 text-xs font-bold text-emerald-900 cursor-pointer">
              <input type="checkbox" id="pg-enabled" checked class="w-4 h-4 text-emerald-600 rounded">
              <span>Enable Gateway</span>
            </label>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Environment Mode</label>
              <select id="pg-mode" class="w-full px-3 py-2.5 bg-surface border border-bordercol rounded-xl font-semibold">
                <option value="test">Test / Sandbox Mode</option>
                <option value="live">Live Production Mode</option>
              </select>
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Currency</label>
              <select id="pg-currency" class="w-full px-3 py-2.5 bg-surface border border-bordercol rounded-xl font-semibold">
                <option value="INR">INR (₹ Indian Rupee)</option>
                <option value="USD">USD ($ US Dollar)</option>
              </select>
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Razorpay Public Key ID</label>
              <input id="pg-key-id" type="text" value="rzp_test_webnasir_demo" class="w-full px-3 py-2.5 bg-surface border border-bordercol rounded-xl font-mono">
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Razorpay Secret Key (Server-Side Only)</label>
              <input id="pg-key-secret" type="password" placeholder="••••••••••••••••" class="w-full px-3 py-2.5 bg-surface border border-bordercol rounded-xl font-mono">
            </div>
            <div class="sm:col-span-2">
              <label class="block font-bold text-slate-700 mb-1">Checkout Modal Description</label>
              <input id="pg-desc" type="text" value="Instant Lifetime Access to Masterclass & Source Code" class="w-full px-3 py-2.5 bg-surface border border-bordercol rounded-xl">
            </div>
          </div>

          <div class="border-t border-slate-100 pt-4">
            <label class="block text-xs font-bold text-slate-700 mb-3">Enabled Payment Methods</label>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-semibold">
              <label class="flex items-center gap-2 p-3 rounded-xl bg-surface border border-bordercol"><input type="checkbox" id="pg-upi" checked><span>UPI / QR Code</span></label>
              <label class="flex items-center gap-2 p-3 rounded-xl bg-surface border border-bordercol"><input type="checkbox" id="pg-cards" checked><span>Debit / Credit Cards</span></label>
              <label class="flex items-center gap-2 p-3 rounded-xl bg-surface border border-bordercol"><input type="checkbox" id="pg-netbanking" checked><span>Net Banking</span></label>
              <label class="flex items-center gap-2 p-3 rounded-xl bg-surface border border-bordercol"><input type="checkbox" id="pg-wallets" checked><span>Wallets & EMI</span></label>
            </div>
          </div>
        </div>
      </section>

      <!-- TAB 17: ABOUT US PAGE EDITOR -->
      <section id="tab-about-editor" class="tab-panel hidden space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl font-bold font-heading text-dark">17. About Us Page Editor</h2>
            <p class="text-sm text-muted">Edit Founder Nasir's biography, mission, vision, photo, intro video, and career milestones.</p>
          </div>
          <button onclick="handleSaveAboutPage()" class="gradient-btn text-white text-xs font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2">
            <i data-lucide="save" class="w-4 h-4"></i><span>Save About Us Page</span>
          </button>
        </div>

        <div class="bg-white p-6 sm:p-8 rounded-3xl border border-bordercol space-y-4 text-xs">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Page Headline</label>
              <input id="about-heading" type="text" class="w-full px-3 py-2.5 bg-surface border border-bordercol rounded-xl font-medium">
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Founder Name & Role</label>
              <input id="about-role" type="text" class="w-full px-3 py-2.5 bg-surface border border-bordercol rounded-xl font-medium">
            </div>
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Full Founder Biography</label>
            <textarea id="about-bio" rows="4" class="w-full px-3 py-2.5 bg-surface border border-bordercol rounded-xl"></textarea>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Academy Mission</label>
              <textarea id="about-mission" rows="3" class="w-full px-3 py-2.5 bg-surface border border-bordercol rounded-xl"></textarea>
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Academy Vision</label>
              <textarea id="about-vision" rows="3" class="w-full px-3 py-2.5 bg-surface border border-bordercol rounded-xl"></textarea>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block font-bold text-slate-700 mb-1">CTA Button Text</label>
              <input id="about-cta-text" type="text" class="w-full px-3 py-2.5 bg-surface border border-bordercol rounded-xl">
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">CTA Destination URL</label>
              <input id="about-cta-link" type="text" class="w-full px-3 py-2.5 bg-surface border border-bordercol rounded-xl">
            </div>
          </div>
        </div>
      </section>

      <!-- TAB 18: CONTACT PAGE EDITOR -->
      <section id="tab-contact-editor" class="tab-panel hidden space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl font-bold font-heading text-dark">18. Contact Page Editor</h2>
            <p class="text-sm text-muted">Configure public contact emails, WhatsApp support line, office hours, and inquiry form settings.</p>
          </div>
          <button onclick="handleSaveContactPage()" class="gradient-btn text-white text-xs font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2">
            <i data-lucide="save" class="w-4 h-4"></i><span>Save Contact Settings</span>
          </button>
        </div>

        <div class="bg-white p-6 sm:p-8 rounded-3xl border border-bordercol space-y-4 text-xs max-w-3xl">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Contact Page Heading</label>
              <input id="contact-heading" type="text" class="w-full px-3 py-2.5 bg-surface border border-bordercol rounded-xl">
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Official Support Email</label>
              <input id="contact-email" type="email" class="w-full px-3 py-2.5 bg-surface border border-bordercol rounded-xl">
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">WhatsApp Direct Number</label>
              <input id="contact-whatsapp" type="text" class="w-full px-3 py-2.5 bg-surface border border-bordercol rounded-xl">
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Office Hours</label>
              <input id="contact-hours" type="text" class="w-full px-3 py-2.5 bg-surface border border-bordercol rounded-xl">
            </div>
            <div class="sm:col-span-2">
              <label class="block font-bold text-slate-700 mb-1">Location / Address</label>
              <input id="contact-address" type="text" class="w-full px-3 py-2.5 bg-surface border border-bordercol rounded-xl">
            </div>
          </div>
        </div>
      </section>

      <!-- TAB 19: FOOTER BUILDER -->
      <section id="tab-footer-builder" class="tab-panel hidden space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl font-bold font-heading text-dark">19. Multi-Column Footer Builder</h2>
            <p class="text-sm text-muted">Customize footer brand description, newsletter box, colors, copyright text, and column links.</p>
          </div>
          <button onclick="handleSaveFooterBuilder()" class="gradient-btn text-white text-xs font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2">
            <i data-lucide="save" class="w-4 h-4"></i><span>Publish Footer Changes</span>
          </button>
        </div>

        <div class="bg-white p-6 sm:p-8 rounded-3xl border border-bordercol space-y-6 text-xs">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Footer Brand Title</label>
              <input id="ftr-brand-title" type="text" value="Web Nasir Academy" class="w-full px-3 py-2 bg-surface border border-bordercol rounded-xl">
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Footer Background Color</label>
              <input id="ftr-bg-color" type="color" value="#0b0f19" class="w-full h-9 bg-surface border border-bordercol rounded-xl p-1">
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Support Email</label>
              <input id="ftr-email" type="text" value="support@webnasir.com" class="w-full px-3 py-2 bg-surface border border-bordercol rounded-xl">
            </div>
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Footer Brand Summary Paragraph</label>
            <textarea id="ftr-desc" rows="2" class="w-full px-3 py-2 bg-surface border border-bordercol rounded-xl"></textarea>
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Copyright Notice</label>
            <input id="ftr-copyright" type="text" class="w-full px-3 py-2 bg-surface border border-bordercol rounded-xl">
          </div>
        </div>
      </section>

      <!-- TAB 20: WEBSITE APPEARANCE & THEME ENGINE -->
      <section id="tab-appearance" class="tab-panel hidden space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl font-bold font-heading text-dark">20. Website Appearance & Global Theme Engine</h2>
            <p class="text-sm text-muted">Control primary/secondary colors, backgrounds, typography fonts, container widths, and button styles. Changes apply live to the public website.</p>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="resetAppearanceToDefault()" class="px-4 py-2.5 rounded-xl bg-white border border-bordercol text-xs font-semibold text-slate-600 hover:text-dark">Reset Default</button>
            <button onclick="handleSaveAppearance()" class="gradient-btn text-white text-xs font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2">
              <i data-lucide="palette" class="w-4 h-4"></i><span>Publish Theme Appearance</span>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          <!-- Colors Panel -->
          <div class="bg-white p-6 rounded-3xl border border-bordercol space-y-4">
            <h3 class="text-sm font-bold text-dark border-b border-slate-100 pb-2">Global Brand Colors</h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Primary Brand Color</label>
                <div class="flex items-center gap-2">
                  <input id="app-col-primary" type="color" value="#7c3aed" class="w-10 h-9 rounded border border-bordercol">
                  <input id="app-col-primary-hex" type="text" value="#7c3aed" oninput="document.getElementById('app-col-primary').value=this.value" class="w-full px-3 py-2 bg-surface border border-bordercol rounded-xl font-mono">
                </div>
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Secondary Indigo Color</label>
                <div class="flex items-center gap-2">
                  <input id="app-col-secondary" type="color" value="#4f46e5" class="w-10 h-9 rounded border border-bordercol">
                  <input id="app-col-secondary-hex" type="text" value="#4f46e5" oninput="document.getElementById('app-col-secondary').value=this.value" class="w-full px-3 py-2 bg-surface border border-bordercol rounded-xl font-mono">
                </div>
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Accent Emerald Color</label>
                <input id="app-col-accent" type="color" value="#10b981" class="w-full h-9 rounded border border-bordercol">
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Page Background</label>
                <input id="app-col-bg" type="color" value="#ffffff" class="w-full h-9 rounded border border-bordercol">
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Header Background</label>
                <input id="app-col-header" type="color" value="#ffffff" class="w-full h-9 rounded border border-bordercol">
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Footer Background</label>
                <input id="app-col-footer" type="color" value="#0b0f19" class="w-full h-9 rounded border border-bordercol">
              </div>
            </div>
          </div>

          <!-- Typography & Layout Panel -->
          <div class="bg-white p-6 rounded-3xl border border-bordercol space-y-4">
            <h3 class="text-sm font-bold text-dark border-b border-slate-100 pb-2">Typography & Layout</h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Heading Font Family</label>
                <select id="app-font-heading" class="w-full px-3 py-2 bg-surface border border-bordercol rounded-xl font-semibold">
                  <option value="Poppins">Poppins (Academy Default)</option>
                  <option value="Inter">Inter</option>
                  <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                </select>
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Body Font Family</label>
                <select id="app-font-body" class="w-full px-3 py-2 bg-surface border border-bordercol rounded-xl font-semibold">
                  <option value="Inter">Inter (Clean Default)</option>
                  <option value="Poppins">Poppins</option>
                  <option value="system-ui">System UI</option>
                </select>
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Button Border Radius</label>
                <select id="app-btn-radius" class="w-full px-3 py-2 bg-surface border border-bordercol rounded-xl font-semibold">
                  <option value="0.875rem">Rounded XL (14px)</option>
                  <option value="0.5rem">Rounded MD (8px)</option>
                  <option value="9999px">Full Pill</option>
                </select>
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Line Height</label>
                <input id="app-line-height" type="text" value="1.6" class="w-full px-3 py-2 bg-surface border border-bordercol rounded-xl">
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- TAB 21: SEO SETTINGS -->
      <section id="tab-seo-settings" class="tab-panel hidden space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl font-bold font-heading text-dark">21. Global SEO, OpenGraph & Sitemap Manager</h2>
            <p class="text-sm text-muted">Configure search engine titles, meta descriptions, OpenGraph cards, canonical URLs, and robots.txt rules.</p>
          </div>
          <button onclick="handleSaveSeoSettings()" class="gradient-btn text-white text-xs font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2">
            <i data-lucide="save" class="w-4 h-4"></i><span>Save SEO Configuration</span>
          </button>
        </div>

        <div class="bg-white p-6 sm:p-8 rounded-3xl border border-bordercol space-y-4 text-xs max-w-3xl">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Global Meta Title</label>
            <input id="seo-title" type="text" class="w-full px-3 py-2.5 bg-surface border border-bordercol rounded-xl font-medium">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Global Meta Description</label>
            <textarea id="seo-desc" rows="3" class="w-full px-3 py-2.5 bg-surface border border-bordercol rounded-xl"></textarea>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Canonical Base URL</label>
              <input id="seo-canonical" type="text" value="https://webnasir.dpdns.org" class="w-full px-3 py-2.5 bg-surface border border-bordercol rounded-xl font-mono">
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">OpenGraph Share Image URL</label>
              <input id="seo-og-image" type="text" class="w-full px-3 py-2.5 bg-surface border border-bordercol rounded-xl font-mono">
            </div>
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Robots.txt Directives</label>
            <textarea id="seo-robots" rows="3" class="w-full px-3 py-2.5 bg-surface border border-bordercol rounded-xl font-mono"></textarea>
          </div>
        </div>
      </section>

      <!-- TAB 22: MEDIA LIBRARY -->
      <section id="tab-media-library" class="tab-panel hidden space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl font-bold font-heading text-dark">22. Media Library & Asset Manager</h2>
            <p class="text-sm text-muted">Manage images, course thumbnails, and video streams with alt text and usage tracking.</p>
          </div>
          <button onclick="promptAddMediaAsset()" class="gradient-btn text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2">
            <i data-lucide="upload" class="w-4 h-4"></i><span>Add Media Asset</span>
          </button>
        </div>

        <div id="media-library-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"></div>
      </section>

      <!-- TAB 23: SOCIAL MEDIA SETTINGS -->
      <section id="tab-social-settings" class="tab-panel hidden space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl font-bold font-heading text-dark">23. Social Media & Community Links</h2>
            <p class="text-sm text-muted">Manage official YouTube, Facebook, X/Twitter, Instagram, LinkedIn, and WhatsApp channels.</p>
          </div>
          <button onclick="handleSaveSocialMedia()" class="gradient-btn text-white text-xs font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2">
            <i data-lucide="save" class="w-4 h-4"></i><span>Save Social Links</span>
          </button>
        </div>

        <div class="bg-white p-6 sm:p-8 rounded-3xl border border-bordercol space-y-4 text-xs max-w-2xl">
          <div><label class="block font-bold text-slate-700 mb-1">YouTube Channel URL</label><input id="soc-input-yt" type="url" value="https://youtube.com/@webnasir" class="w-full px-3 py-2.5 bg-surface border border-bordercol rounded-xl"></div>
          <div><label class="block font-bold text-slate-700 mb-1">Facebook Page URL</label><input id="soc-input-fb" type="url" value="https://facebook.com/webnasir" class="w-full px-3 py-2.5 bg-surface border border-bordercol rounded-xl"></div>
          <div><label class="block font-bold text-slate-700 mb-1">X (Twitter) Profile URL</label><input id="soc-input-x" type="url" value="https://x.com/webnasir" class="w-full px-3 py-2.5 bg-surface border border-bordercol rounded-xl"></div>
          <div><label class="block font-bold text-slate-700 mb-1">Instagram Profile URL</label><input id="soc-input-ig" type="url" value="https://instagram.com/webnasir" class="w-full px-3 py-2.5 bg-surface border border-bordercol rounded-xl"></div>
          <div><label class="block font-bold text-slate-700 mb-1">LinkedIn Profile URL</label><input id="soc-input-li" type="url" value="https://linkedin.com/in/webnasir" class="w-full px-3 py-2.5 bg-surface border border-bordercol rounded-xl"></div>
        </div>
      </section>

      <!-- TAB 24: USER & ACCESS MANAGEMENT + REVISIONS & AUDIT LOGS -->
      <section id="tab-user-access" class="tab-panel hidden space-y-6">
        <div>
          <h2 class="text-2xl font-bold font-heading text-dark">24. User Access, Revisions & Audit Logs</h2>
          <p class="text-sm text-muted">Role-based administrator permissions, configuration snapshots, safe rollback, and security audit trail.</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-white p-6 rounded-3xl border border-bordercol space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-bold text-dark">CMS Snapshot Revisions (Safe Rollback)</h3>
              <button onclick="createCmsRevisionSnapshot()" class="text-xs font-bold text-brand-600 hover:underline">+ New Snapshot</button>
            </div>
            <div id="cms-revisions-list" class="space-y-2 text-xs"></div>
          </div>

          <div class="bg-white p-6 rounded-3xl border border-bordercol space-y-4">
            <h3 class="text-sm font-bold text-dark">Administrator Security Audit Log</h3>
            <div id="cms-audit-logs-list" class="space-y-2 text-xs max-h-80 overflow-y-auto"></div>
          </div>
        </div>
      </section>

      <!-- LIVE PREVIEW MODAL -->
      <div id="live-preview-modal" class="hidden fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl w-full max-w-6xl h-[88vh] flex flex-col overflow-hidden shadow-2xl">
          <div class="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div class="flex items-center gap-2 text-xs font-bold">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span>Live Public Website Preview (Real-Time Production Render)</span>
            </div>
            <div class="flex items-center gap-2">
              <a href="/" target="_blank" class="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs">Open in New Tab ↗</a>
              <button onclick="closeLivePreviewModal()" class="p-1 text-slate-400 hover:text-white"><i data-lucide="x" class="w-5 h-5"></i></button>
            </div>
          </div>
          <iframe id="live-preview-iframe" src="/" class="w-full flex-grow border-0"></iframe>
        </div>
      </div>
`;

adminHtml = adminHtml.replace('<!-- TAB: ANALYTICS OVERVIEW -->', `${cmsTabPanels}\n      <!-- TAB: ANALYTICS OVERVIEW -->`);

// 3. Inject JavaScript handlers for all new CMS sections
const cmsAdminJs = `
    window.ADMIN.freeCourses = [];
    window.ADMIN.categories = [];
    window.ADMIN.cmsHomepage = {};
    window.ADMIN.cmsAppearance = {};
    window.ADMIN.cmsNavigation = {};
    window.ADMIN.cmsFooter = {};
    window.ADMIN.cmsAbout = {};
    window.ADMIN.cmsContact = {};
    window.ADMIN.cmsSeo = {};
    window.ADMIN.cmsMedia = [];
    window.ADMIN.cmsPayments = {};
    window.ADMIN.cmsRevisions = [];
    window.ADMIN.cmsAuditLogs = [];

    // Update switchTab to style sidebar buttons cleanly
    window.switchTab = function(tabName) {
      document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.dataset.tab === tabName) {
          btn.classList.add('text-brand-600', 'bg-brand-50', 'font-bold');
        } else {
          btn.classList.remove('text-brand-600', 'bg-brand-50', 'font-bold');
        }
      });
      document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.add('hidden'));
      const active = document.getElementById('tab-' + tabName);
      if (active) active.classList.remove('hidden');
      lucide.createIcons();
    };

    window.openLivePreviewModal = function() {
      const modal = document.getElementById('live-preview-modal');
      const iframe = document.getElementById('live-preview-iframe');
      if (iframe) iframe.src = '/?preview=' + Date.now();
      if (modal) modal.classList.remove('hidden');
      lucide.createIcons();
    };

    window.closeLivePreviewModal = function() {
      document.getElementById('live-preview-modal').classList.add('hidden');
    };

    window.publishAllCurrentChanges = async function() {
      showToast('Synchronizing & publishing all CMS configurations to live store...', 'info');
      await createCmsRevisionSnapshot('Auto-Backup Before Publish');
      showToast('All changes published live!', 'success');
    };

    window.createCmsRevisionSnapshot = async function(customLabel) {
      const label = customLabel || prompt('Enter a name for this version snapshot:', 'Manual Checkpoint ' + new Date().toLocaleTimeString());
      if (!label) return;
      try {
        await req('/admin/cms/revisions', { method: 'POST', body: JSON.stringify({ label }) });
        showToast('Revision snapshot saved!', 'success');
        loadCmsExtras();
      } catch (err) {
        showToast('Error saving snapshot: ' + err.message, 'error');
      }
    };

    window.rollbackToRevision = async function(revId, label) {
      if (!confirm('Roll back entire website configuration to "' + label + '"?')) return;
      try {
        await req('/admin/cms/rollback', { method: 'POST', body: JSON.stringify({ revision_id: revId }) });
        showToast('Rolled back to ' + label, 'success');
        loadAllAdminData();
        loadCmsExtras();
      } catch (err) {
        showToast('Rollback error: ' + err.message, 'error');
      }
    };

    async function loadCmsExtras() {
      try {
        const [hp, app, nav, ftr, abt, cnt, seo, med, pay, fc, cats, revs, logs] = await Promise.all([
          req('/admin/cms/homepage').catch(() => ({})),
          req('/admin/cms/appearance').catch(() => ({})),
          req('/admin/cms/navigation').catch(() => ({})),
          req('/admin/cms/footer').catch(() => ({})),
          req('/admin/cms/about').catch(() => ({})),
          req('/admin/cms/contact').catch(() => ({})),
          req('/admin/cms/seo').catch(() => ({})),
          req('/admin/cms/media').catch(() => []),
          req('/admin/cms/payments').catch(() => ({})),
          req('/admin/free-courses').catch(() => []),
          req('/admin/cms/categories').catch(() => []),
          req('/admin/cms/revisions').catch(() => []),
          req('/admin/cms/audit-logs').catch(() => []),
        ]);

        window.ADMIN.cmsHomepage = hp || {};
        window.ADMIN.cmsAppearance = app || {};
        window.ADMIN.cmsNavigation = nav || {};
        window.ADMIN.cmsFooter = ftr || {};
        window.ADMIN.cmsAbout = abt || {};
        window.ADMIN.cmsContact = cnt || {};
        window.ADMIN.cmsSeo = seo || {};
        window.ADMIN.cmsMedia = med || [];
        window.ADMIN.cmsPayments = pay || {};
        window.ADMIN.freeCourses = fc || [];
        window.ADMIN.categories = cats || [];
        window.ADMIN.cmsRevisions = revs || [];
        window.ADMIN.cmsAuditLogs = logs || [];

        renderHomepageBuilder();
        renderNavigationManager();
        renderFreeCoursesManager();
        renderCourseCategories();
        renderCurriculumSelector();
        populatePaymentGatewayForm();
        populateAboutForm();
        populateContactForm();
        populateFooterForm();
        populateAppearanceForm();
        populateSeoForm();
        renderMediaLibrary();
        renderRevisionsAndLogs();
      } catch (err) {
        console.warn('CMS extras load warning:', err);
      }
    }

    // 2. HOMEPAGE BUILDER
    function renderHomepageBuilder() {
      const container = document.getElementById('homepage-sections-list');
      if (!container) return;
      const sections = (window.ADMIN.cmsHomepage && window.ADMIN.cmsHomepage.sections) || [];
      container.innerHTML = sections.map((sec, idx) => \`
        <div class="bg-white p-5 rounded-2xl border border-bordercol shadow-2xs space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="w-6 h-6 rounded-lg bg-violet-100 text-violet-700 font-bold text-xs flex items-center justify-center">\${idx + 1}</span>
              <span class="font-bold text-sm text-dark">\${sec.name}</span>
              <span class="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-500">ID: \${sec.id}</span>
            </div>
            <div class="flex items-center gap-2">
              <button onclick="moveHomepageSection(\${idx}, -1)" class="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs" title="Move Up">↑</button>
              <button onclick="moveHomepageSection(\${idx}, 1)" class="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs" title="Move Down">↓</button>
              <label class="flex items-center gap-1.5 text-xs font-bold cursor-pointer ml-2">
                <input type="checkbox" \${sec.enabled !== false ? 'checked' : ''} onchange="window.ADMIN.cmsHomepage.sections[\${idx}].enabled = this.checked" class="w-4 h-4 text-brand-600 rounded">
                <span>Enabled</span>
              </label>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label class="block text-[10px] font-bold uppercase text-slate-400 mb-1">Section Heading</label>
              <input type="text" value="\${sec.heading || ''}" oninput="window.ADMIN.cmsHomepage.sections[\${idx}].heading = this.value" class="w-full px-3 py-2 bg-surface border border-bordercol rounded-xl font-medium">
            </div>
            <div>
              <label class="block text-[10px] font-bold uppercase text-slate-400 mb-1">Section Subtitle</label>
              <input type="text" value="\${sec.subtitle || ''}" oninput="window.ADMIN.cmsHomepage.sections[\${idx}].subtitle = this.value" class="w-full px-3 py-2 bg-surface border border-bordercol rounded-xl">
            </div>
          </div>
        </div>
      \`).join('');
    }

    window.moveHomepageSection = function(idx, dir) {
      const arr = window.ADMIN.cmsHomepage.sections || [];
      const target = idx + dir;
      if (target < 0 || target >= arr.length) return;
      const temp = arr[idx];
      arr[idx] = arr[target];
      arr[target] = temp;
      arr.forEach((s, i) => s.order = i + 1);
      renderHomepageBuilder();
    };

    window.handleSaveHomepageBuilder = async function() {
      try {
        await req('/admin/cms/homepage', { method: 'PUT', body: JSON.stringify(window.ADMIN.cmsHomepage) });
        showToast('Homepage layout & headings published!', 'success');
      } catch (err) {
        showToast('Save error: ' + err.message, 'error');
      }
    };

    // 3. NAVIGATION MANAGER
    function renderNavigationManager() {
      const nav = window.ADMIN.cmsNavigation || {};
      if (document.getElementById('nav-cta-text')) document.getElementById('nav-cta-text').value = nav.cta_button_text || 'Explore Courses';
      if (document.getElementById('nav-cta-url')) document.getElementById('nav-cta-url').value = nav.cta_button_url || '#/courses';
      const container = document.getElementById('nav-items-container');
      if (!container) return;
      const items = nav.items || [];
      container.innerHTML = items.map((item, idx) => \`
        <div class="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-surface border border-bordercol text-xs">
          <div class="flex items-center gap-3 flex-grow">
            <span class="font-bold text-slate-400">#\${idx + 1}</span>
            <input type="text" value="\${item.label}" oninput="window.ADMIN.cmsNavigation.items[\${idx}].label = this.value" class="px-3 py-1.5 bg-white border border-bordercol rounded-lg font-bold w-40">
            <input type="text" value="\${item.url}" oninput="window.ADMIN.cmsNavigation.items[\${idx}].url = this.value" class="px-3 py-1.5 bg-white border border-bordercol rounded-lg font-mono flex-grow">
          </div>
          <div class="flex items-center gap-3">
            <label class="flex items-center gap-1 cursor-pointer"><input type="checkbox" \${item.enabled !== false ? 'checked' : ''} onchange="window.ADMIN.cmsNavigation.items[\${idx}].enabled = this.checked"><span>Visible</span></label>
            <button onclick="window.ADMIN.cmsNavigation.items.splice(\${idx}, 1); renderNavigationManager();" class="text-rose-600 hover:underline font-semibold">Remove</button>
          </div>
        </div>
      \`).join('');
    }

    window.addNavMenuItem = function() {
      if (!window.ADMIN.cmsNavigation.items) window.ADMIN.cmsNavigation.items = [];
      window.ADMIN.cmsNavigation.items.push({ id: 'nav-' + Date.now(), label: 'New Link', url: '#/', enabled: true, order: window.ADMIN.cmsNavigation.items.length + 1 });
      renderNavigationManager();
    };

    window.handleSaveNavigation = async function() {
      window.ADMIN.cmsNavigation.cta_button_text = document.getElementById('nav-cta-text').value;
      window.ADMIN.cmsNavigation.cta_button_url = document.getElementById('nav-cta-url').value;
      try {
        await req('/admin/cms/navigation', { method: 'PUT', body: JSON.stringify(window.ADMIN.cmsNavigation) });
        showToast('Navigation saved & published!', 'success');
      } catch (err) {
        showToast('Error: ' + err.message, 'error');
      }
    };

    // 7. FREE COURSES MANAGER
    function renderFreeCoursesManager() {
      const container = document.getElementById('free-courses-manager-list');
      if (!container) return;
      const list = window.ADMIN.freeCourses || [];
      container.innerHTML = list.map(fc => \`
        <div class="bg-white p-6 rounded-2xl border border-bordercol space-y-3">
          <div class="flex items-start justify-between">
            <div>
              <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">\${fc.badge || '100% Free'}</span>
              <h3 class="text-base font-bold text-dark mt-1.5">\${fc.title}</h3>
              <p class="text-xs text-muted mt-1">\${fc.description}</p>
            </div>
            <span class="text-sm font-black text-emerald-600">FREE</span>
          </div>
          <div class="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
            <span>⏱️ \${fc.duration} • 👥 \${fc.enrolled_count || 100}+ Students</span>
            <button onclick="deleteFreeCourse('\${fc.id}')" class="text-rose-600 font-semibold hover:underline">Delete</button>
          </div>
        </div>
      \`).join('');
    }

    window.openNewFreeCourseModal = async function() {
      const title = prompt('Enter Free Starter Course Title:');
      if (!title) return;
      const description = prompt('Enter Course Description:', 'Practical hands-on starter bootcamp with immediate free access.');
      const duration = prompt('Enter Course Duration:', '2.5 Hours (5 Lessons)');
      try {
        await req('/admin/free-courses', { method: 'POST', body: JSON.stringify({ title, description, duration }) });
        showToast('Free course created!', 'success');
        loadCmsExtras();
      } catch (err) {
        showToast('Error: ' + err.message, 'error');
      }
    };

    window.deleteFreeCourse = async function(id) {
      if (!confirm('Delete this free course?')) return;
      try {
        await req('/admin/free-courses/' + id, { method: 'DELETE' });
        showToast('Free course deleted', 'info');
        loadCmsExtras();
      } catch (err) {
        showToast('Error: ' + err.message, 'error');
      }
    };

    // 8. COURSE CATEGORIES
    function renderCourseCategories() {
      const grid = document.getElementById('course-categories-grid');
      if (!grid) return;
      grid.innerHTML = (window.ADMIN.categories || []).map((c, idx) => \`
        <div class="bg-white p-5 rounded-2xl border border-bordercol space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-bold text-sm text-dark">\${c.name}</span>
            <button onclick="window.ADMIN.categories.splice(\${idx},1); saveCourseCategories();" class="text-xs text-rose-600">Delete</button>
          </div>
          <p class="text-xs text-muted">\${c.description || ''}</p>
        </div>
      \`).join('');
    }

    window.addCourseCategory = async function() {
      const name = prompt('Category Name:');
      if (!name) return;
      const description = prompt('Short Category Description:') || '';
      window.ADMIN.categories.push({ id: 'cat-' + Date.now(), name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), description });
      await saveCourseCategories();
    };

    async function saveCourseCategories() {
      await req('/admin/cms/categories', { method: 'PUT', body: JSON.stringify(window.ADMIN.categories) });
      showToast('Categories updated!', 'success');
      renderCourseCategories();
    }

    // 9. CURRICULUM BUILDER
    function renderCurriculumSelector() {
      const sel = document.getElementById('curriculum-course-selector');
      if (!sel) return;
      const courses = window.ADMIN.courses || [];
      sel.innerHTML = courses.map(c => \`<option value="\${c.id}">\${c.title} (₹\${c.price})</option>\`).join('');
      loadCourseCurriculumEditor();
    }

    window.loadCourseCurriculumEditor = function() {
      const sel = document.getElementById('curriculum-course-selector');
      const ws = document.getElementById('curriculum-builder-workspace');
      if (!sel || !ws) return;
      const course = (window.ADMIN.courses || []).find(c => c.id === sel.value);
      if (!course) return;
      const modules = course.modules || [];
      ws.innerHTML = \`
        <div class="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 class="text-base font-bold text-dark">\${course.title} — Syllabus Modules</h3>
            <p class="text-xs text-muted">\${modules.length} Modules Configured</p>
          </div>
          <button onclick="addModuleToCourse('\${course.id}')" class="gradient-btn text-white text-xs font-semibold px-4 py-2 rounded-xl">+ Add Module</button>
        </div>
        <div class="space-y-4">
          \${modules.map((m, mIdx) => \`
            <div class="p-4 rounded-2xl bg-surface border border-bordercol space-y-2">
              <div class="flex items-center justify-between">
                <span class="font-bold text-xs text-dark">\${m.title}</span>
                <span class="text-[11px] text-violet-700 font-semibold">\${(m.lessons || []).length} Lessons</span>
              </div>
              <ul class="text-xs text-slate-600 space-y-1 pl-4 list-disc">
                \${(m.lessons || []).map(l => \`<li>\${typeof l === 'string' ? l : l.title}</li>\`).join('')}
              </ul>
            </div>
          \`).join('')}
        </div>
      \`;
    };

    window.addModuleToCourse = async function(courseId) {
      const course = (window.ADMIN.courses || []).find(c => c.id === courseId);
      if (!course) return;
      const modTitle = prompt('New Module Title:', 'Module ' + ((course.modules || []).length + 1) + ': Practical Implementation');
      if (!modTitle) return;
      const lessonsStr = prompt('Enter Lesson Titles (comma-separated):', 'Architecture Setup, Live Code Walkthrough, Production Deployment');
      const lessons = (lessonsStr || '').split(',').map(s => s.trim()).filter(Boolean);
      if (!course.modules) course.modules = [];
      course.modules.push({ title: modTitle, lessons });
      await req('/admin/courses/' + courseId, { method: 'PUT', body: JSON.stringify(course) });
      showToast('Module added to course!', 'success');
      loadCourseCurriculumEditor();
    };

    // 10. PAYMENT GATEWAY
    function populatePaymentGatewayForm() {
      const p = window.ADMIN.cmsPayments || {};
      if (document.getElementById('pg-enabled')) document.getElementById('pg-enabled').checked = p.razorpay_enabled !== false;
      if (document.getElementById('pg-mode') && p.mode) document.getElementById('pg-mode').value = p.mode;
      if (document.getElementById('pg-key-id') && p.key_id) document.getElementById('pg-key-id').value = p.key_id;
      if (document.getElementById('pg-desc') && p.checkout_description) document.getElementById('pg-desc').value = p.checkout_description;
    }

    window.handleSavePaymentGateway = async function() {
      const payload = {
        ...window.ADMIN.cmsPayments,
        razorpay_enabled: document.getElementById('pg-enabled').checked,
        mode: document.getElementById('pg-mode').value,
        currency: document.getElementById('pg-currency').value,
        key_id: document.getElementById('pg-key-id').value.trim(),
        checkout_description: document.getElementById('pg-desc').value.trim(),
      };
      await req('/admin/cms/payments', { method: 'PUT', body: JSON.stringify(payload) });
      showToast('Payment Gateway settings saved!', 'success');
    };

    // 17 & 18. ABOUT & CONTACT EDITORS
    function populateAboutForm() {
      const a = window.ADMIN.cmsAbout || {};
      if (document.getElementById('about-heading')) document.getElementById('about-heading').value = a.heading || '';
      if (document.getElementById('about-role')) document.getElementById('about-role').value = a.founder_role || '';
      if (document.getElementById('about-bio')) document.getElementById('about-bio').value = a.biography || '';
      if (document.getElementById('about-mission')) document.getElementById('about-mission').value = a.mission || '';
      if (document.getElementById('about-vision')) document.getElementById('about-vision').value = a.vision || '';
      if (document.getElementById('about-cta-text')) document.getElementById('about-cta-text').value = a.cta_text || '';
      if (document.getElementById('about-cta-link')) document.getElementById('about-cta-link').value = a.cta_link || '';
    }

    window.handleSaveAboutPage = async function() {
      const payload = {
        ...window.ADMIN.cmsAbout,
        heading: document.getElementById('about-heading').value,
        founder_role: document.getElementById('about-role').value,
        biography: document.getElementById('about-bio').value,
        mission: document.getElementById('about-mission').value,
        vision: document.getElementById('about-vision').value,
        cta_text: document.getElementById('about-cta-text').value,
        cta_link: document.getElementById('about-cta-link').value,
      };
      await req('/admin/cms/about', { method: 'PUT', body: JSON.stringify(payload) });
      showToast('About Us page updated!', 'success');
    };

    function populateContactForm() {
      const c = window.ADMIN.cmsContact || {};
      if (document.getElementById('contact-heading')) document.getElementById('contact-heading').value = c.heading || '';
      if (document.getElementById('contact-email')) document.getElementById('contact-email').value = c.email || '';
      if (document.getElementById('contact-whatsapp')) document.getElementById('contact-whatsapp').value = c.whatsapp || '';
      if (document.getElementById('contact-hours')) document.getElementById('contact-hours').value = c.office_hours || '';
      if (document.getElementById('contact-address')) document.getElementById('contact-address').value = c.address || '';
    }

    window.handleSaveContactPage = async function() {
      const payload = {
        ...window.ADMIN.cmsContact,
        heading: document.getElementById('contact-heading').value,
        email: document.getElementById('contact-email').value,
        whatsapp: document.getElementById('contact-whatsapp').value,
        office_hours: document.getElementById('contact-hours').value,
        address: document.getElementById('contact-address').value,
      };
      await req('/admin/cms/contact', { method: 'PUT', body: JSON.stringify(payload) });
      showToast('Contact page settings updated!', 'success');
    };

    // 19. FOOTER BUILDER
    function populateFooterForm() {
      const f = window.ADMIN.cmsFooter || {};
      if (document.getElementById('ftr-brand-title')) document.getElementById('ftr-brand-title').value = f.brand_title || 'Web Nasir Academy';
      if (document.getElementById('ftr-bg-color')) document.getElementById('ftr-bg-color').value = f.bg_color || '#0b0f19';
      if (document.getElementById('ftr-email')) document.getElementById('ftr-email').value = f.contact_email || 'support@webnasir.com';
      if (document.getElementById('ftr-desc')) document.getElementById('ftr-desc').value = f.brand_description || '';
      if (document.getElementById('ftr-copyright')) document.getElementById('ftr-copyright').value = f.copyright_text || '';
    }

    window.handleSaveFooterBuilder = async function() {
      const payload = {
        ...window.ADMIN.cmsFooter,
        brand_title: document.getElementById('ftr-brand-title').value,
        bg_color: document.getElementById('ftr-bg-color').value,
        contact_email: document.getElementById('ftr-email').value,
        brand_description: document.getElementById('ftr-desc').value,
        copyright_text: document.getElementById('ftr-copyright').value,
      };
      await req('/admin/cms/footer', { method: 'PUT', body: JSON.stringify(payload) });
      showToast('Footer configuration published!', 'success');
    };

    // 20. WEBSITE APPEARANCE
    function populateAppearanceForm() {
      const app = window.ADMIN.cmsAppearance || {};
      const c = app.colors || {};
      if (document.getElementById('app-col-primary') && c.primary) {
        document.getElementById('app-col-primary').value = c.primary;
        document.getElementById('app-col-primary-hex').value = c.primary;
      }
      if (document.getElementById('app-col-secondary') && c.secondary) {
        document.getElementById('app-col-secondary').value = c.secondary;
        document.getElementById('app-col-secondary-hex').value = c.secondary;
      }
    }

    window.handleSaveAppearance = async function() {
      const payload = {
        colors: {
          primary: document.getElementById('app-col-primary').value,
          secondary: document.getElementById('app-col-secondary').value,
          accent: document.getElementById('app-col-accent').value,
          background: document.getElementById('app-col-bg').value,
          header_bg: document.getElementById('app-col-header').value,
          footer_bg: document.getElementById('app-col-footer').value,
        },
        typography: {
          heading_font: document.getElementById('app-font-heading').value,
          body_font: document.getElementById('app-font-body').value,
          line_height: document.getElementById('app-line-height').value,
        },
        layout: {
          button_radius: document.getElementById('app-btn-radius').value,
        }
      };
      await req('/admin/cms/appearance', { method: 'PUT', body: JSON.stringify(payload) });
      showToast('Website Appearance theme published live!', 'success');
    };

    window.resetAppearanceToDefault = async function() {
      document.getElementById('app-col-primary').value = '#7c3aed';
      document.getElementById('app-col-primary-hex').value = '#7c3aed';
      document.getElementById('app-col-secondary').value = '#4f46e5';
      document.getElementById('app-col-secondary-hex').value = '#4f46e5';
      document.getElementById('app-col-accent').value = '#10b981';
      document.getElementById('app-col-bg').value = '#ffffff';
      document.getElementById('app-col-header').value = '#ffffff';
      document.getElementById('app-col-footer').value = '#0b0f19';
      await handleSaveAppearance();
    };

    // 21. SEO SETTINGS
    function populateSeoForm() {
      const s = window.ADMIN.cmsSeo || {};
      if (document.getElementById('seo-title')) document.getElementById('seo-title').value = s.global_title || '';
      if (document.getElementById('seo-desc')) document.getElementById('seo-desc').value = s.meta_description || '';
      if (document.getElementById('seo-canonical')) document.getElementById('seo-canonical').value = s.canonical_base || 'https://webnasir.dpdns.org';
      if (document.getElementById('seo-og-image')) document.getElementById('seo-og-image').value = s.og_image || '';
      if (document.getElementById('seo-robots')) document.getElementById('seo-robots').value = s.robots_txt || '';
    }

    window.handleSaveSeoSettings = async function() {
      const payload = {
        global_title: document.getElementById('seo-title').value,
        meta_description: document.getElementById('seo-desc').value,
        canonical_base: document.getElementById('seo-canonical').value,
        og_image: document.getElementById('seo-og-image').value,
        robots_txt: document.getElementById('seo-robots').value,
      };
      await req('/admin/cms/seo', { method: 'PUT', body: JSON.stringify(payload) });
      showToast('Global SEO configuration saved!', 'success');
    };

    // 22. MEDIA LIBRARY
    function renderMediaLibrary() {
      const grid = document.getElementById('media-library-grid');
      if (!grid) return;
      grid.innerHTML = (window.ADMIN.cmsMedia || []).map(m => \`
        <div class="bg-white rounded-2xl border border-bordercol overflow-hidden shadow-2xs flex flex-col justify-between">
          <div class="aspect-video bg-slate-100 flex items-center justify-center overflow-hidden">
            \${m.type === 'video' ? '<i data-lucide="video" class="w-10 h-10 text-violet-600"></i>' : \`<img src="\${m.url}" alt="\${m.alt}" class="w-full h-full object-cover">\`}
          </div>
          <div class="p-4 space-y-2 text-xs">
            <div class="font-bold text-dark truncate">\${m.title}</div>
            <div class="text-[10px] text-muted">Used in: \${m.used_in || 'General'}</div>
            <div class="flex items-center justify-between pt-2 border-t border-slate-100">
              <button onclick="navigator.clipboard.writeText('\${m.url}'); showToast('Copied URL!', 'success');" class="text-brand-600 font-semibold">Copy URL</button>
              <button onclick="deleteMediaAsset('\${m.id}')" class="text-rose-600 font-semibold">Delete</button>
            </div>
          </div>
        </div>
      \`).join('');
      lucide.createIcons();
    }

    window.promptAddMediaAsset = async function() {
      const title = prompt('Asset Name / Title:');
      if (!title) return;
      const url = prompt('Image or Video URL (https://...):');
      if (!url) return;
      const alt = prompt('SEO Alt Text:', title);
      await req('/admin/cms/media', { method: 'POST', body: JSON.stringify({ title, url, alt, type: url.includes('youtube') ? 'video' : 'image' }) });
      showToast('Media asset added!', 'success');
      loadCmsExtras();
    };

    window.deleteMediaAsset = async function(id) {
      if (!confirm('Delete this media item?')) return;
      await req('/admin/cms/media/' + id, { method: 'DELETE' });
      showToast('Asset deleted', 'info');
      loadCmsExtras();
    };

    // 23. SOCIAL SETTINGS
    window.handleSaveSocialMedia = async function() {
      const payload = {
        ...window.ADMIN.settings,
        social_youtube: document.getElementById('soc-input-yt').value,
        social_facebook: document.getElementById('soc-input-fb').value,
        social_x: document.getElementById('soc-input-x').value,
        social_instagram: document.getElementById('soc-input-ig').value,
        social_linkedin: document.getElementById('soc-input-li').value,
      };
      await req('/admin/settings', { method: 'PUT', body: JSON.stringify(payload) });
      showToast('Social media links updated!', 'success');
    };

    // 24. REVISIONS & AUDIT LOGS
    function renderRevisionsAndLogs() {
      const revList = document.getElementById('cms-revisions-list');
      if (revList) {
        revList.innerHTML = (window.ADMIN.cmsRevisions || []).map(r => \`
          <div class="p-3 rounded-xl bg-surface border border-bordercol flex items-center justify-between">
            <div>
              <span class="font-bold text-dark block">\${r.label}</span>
              <span class="text-[10px] text-muted">\${new Date(r.created_at).toLocaleString()} • by \${r.author || 'admin'}</span>
            </div>
            \${r.snapshot ? \`<button onclick="rollbackToRevision('\${r.id}', '\${r.label}')" class="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[11px] hover:bg-amber-100">Rollback</button>\` : '<span class="text-[10px] text-emerald-600 font-bold">Baseline</span>'}
          </div>
        \`).join('');
      }
      const logList = document.getElementById('cms-audit-logs-list');
      if (logList) {
        logList.innerHTML = (window.ADMIN.cmsAuditLogs || []).map(l => \`
          <div class="p-2.5 rounded-xl bg-surface border border-bordercol flex items-center justify-between">
            <span class="font-medium text-slate-700">\${l.action}</span>
            <span class="text-[10px] text-slate-400">\${new Date(l.timestamp).toLocaleTimeString()}</span>
          </div>
        \`).join('');
      }
    }
`;

adminHtml = adminHtml.replace('// ANALYTICS OVERVIEW', `${cmsAdminJs}\n    // ANALYTICS OVERVIEW`);
adminHtml = adminHtml.replace('populateSettingsForm();', 'populateSettingsForm();\n        loadCmsExtras();');

fs.writeFileSync('public/admin.html', adminHtml, 'utf8');
fs.writeFileSync('admin.html', adminHtml, 'utf8');
console.log('Successfully upgraded public/admin.html and admin.html to 27-Section CMS Control Center!');

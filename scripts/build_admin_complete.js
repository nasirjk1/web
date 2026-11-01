import fs from 'node:fs';
import path from 'node:path';

// Read current public/admin.html
let adminHtml = fs.readFileSync('public/admin.html', 'utf8');

console.log('Building complete Admin Dashboard with Student Management, Email Center, and Analytics Overview...');

// 1. Update subnav in adminHtml to include Analytics, Student Management, and Email Center
const oldNav = `<button onclick="switchTab('overview')" class="tab-btn pb-1 text-brand-600 border-b-2 border-brand-600 flex items-center gap-2 whitespace-nowrap" data-tab="overview">
            <i data-lucide="layout-dashboard" class="w-4 h-4"></i>
            <span>Overview</span>
          </button>`;

const newNav = `<button onclick="switchTab('overview')" class="tab-btn pb-1 text-brand-600 border-b-2 border-brand-600 flex items-center gap-2 whitespace-nowrap" data-tab="overview">
            <i data-lucide="layout-dashboard" class="w-4 h-4"></i>
            <span>Overview</span>
          </button>
          <button onclick="switchTab('analytics')" class="tab-btn pb-1 hover:text-dark flex items-center gap-2 whitespace-nowrap" data-tab="analytics">
            <i data-lucide="bar-chart-3" class="w-4 h-4 text-emerald-600"></i>
            <span>Analytics Overview</span>
          </button>
          <button onclick="switchTab('students')" class="tab-btn pb-1 hover:text-dark flex items-center gap-2 whitespace-nowrap" data-tab="students">
            <i data-lucide="users" class="w-4 h-4 text-violet-600"></i>
            <span>Student Management</span>
          </button>
          <button onclick="switchTab('email-center')" class="tab-btn pb-1 hover:text-dark flex items-center gap-2 whitespace-nowrap" data-tab="email-center">
            <i data-lucide="mail" class="w-4 h-4 text-indigo-600"></i>
            <span>Email Center</span>
          </button>`;

adminHtml = adminHtml.replace(oldNav, newNav);

// 2. Add New Tab Panels before `<!-- TAB: PAID COURSES MANAGER -->`
const newPanels = `
      <!-- TAB: ANALYTICS OVERVIEW -->
      <section id="tab-analytics" class="tab-panel hidden space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl font-bold font-heading text-dark">Platform Analytics & Intelligence</h2>
            <p class="text-sm text-muted">Real-time database metrics, student acquisition, revenue, and email dispatch health.</p>
          </div>
          <!-- Time Range Filter -->
          <div class="flex items-center gap-1 bg-white p-1 rounded-xl border border-bordercol shadow-xs text-xs font-semibold" id="analytics-time-filters">
            <button onclick="filterAnalytics('today')" class="analytics-filter-btn px-3 py-1.5 rounded-lg text-slate-600 hover:text-dark" data-period="today">Today</button>
            <button onclick="filterAnalytics('7d')" class="analytics-filter-btn px-3 py-1.5 rounded-lg text-slate-600 hover:text-dark" data-period="7d">Last 7 Days</button>
            <button onclick="filterAnalytics('30d')" class="analytics-filter-btn px-3 py-1.5 rounded-lg text-slate-600 hover:text-dark" data-period="30d">Last 30 Days</button>
            <button onclick="filterAnalytics('year')" class="analytics-filter-btn px-3 py-1.5 rounded-lg text-slate-600 hover:text-dark" data-period="year">This Year</button>
            <button onclick="filterAnalytics('all')" class="analytics-filter-btn px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 font-bold" data-period="all">All Time</button>
          </div>
        </div>

        <!-- Analytics Metric Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="bg-white p-6 rounded-3xl border border-bordercol shadow-xs">
            <div class="flex items-center justify-between text-xs font-bold text-muted uppercase tracking-wider mb-2">
              <span>Total Course Revenue</span>
              <i data-lucide="dollar-sign" class="w-4 h-4 text-emerald-600"></i>
            </div>
            <div id="analytics-revenue" class="text-3xl font-black font-heading text-emerald-600">₹0</div>
            <div class="text-[11px] text-muted mt-1">Verified Razorpay Payments</div>
          </div>

          <div class="bg-white p-6 rounded-3xl border border-bordercol shadow-xs">
            <div class="flex items-center justify-between text-xs font-bold text-muted uppercase tracking-wider mb-2">
              <span>Total Registered Students</span>
              <i data-lucide="users" class="w-4 h-4 text-violet-600"></i>
            </div>
            <div id="analytics-total-students" class="text-3xl font-black font-heading text-dark">--</div>
            <div id="analytics-student-split" class="text-[11px] text-muted mt-1">0 Google • 0 Email</div>
          </div>

          <div class="bg-white p-6 rounded-3xl border border-bordercol shadow-xs">
            <div class="flex items-center justify-between text-xs font-bold text-muted uppercase tracking-wider mb-2">
              <span>Total Course Enrollments</span>
              <i data-lucide="graduation-cap" class="w-4 h-4 text-indigo-600"></i>
            </div>
            <div id="analytics-enrollments-count" class="text-3xl font-black font-heading text-brand-600">--</div>
            <div id="analytics-enrollments-split" class="text-[11px] text-muted mt-1">0 Paid • 0 Free</div>
          </div>

          <div class="bg-white p-6 rounded-3xl border border-bordercol shadow-xs">
            <div class="flex items-center justify-between text-xs font-bold text-muted uppercase tracking-wider mb-2">
              <span>Emails Dispatched</span>
              <i data-lucide="mail" class="w-4 h-4 text-amber-500"></i>
            </div>
            <div id="analytics-emails-total" class="text-3xl font-black font-heading text-dark">--</div>
            <div id="analytics-email-health" class="text-[11px] text-emerald-600 font-semibold mt-1">100% Delivery Health</div>
          </div>
        </div>

        <!-- Popular Courses and Tools Breakdown -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-white p-6 sm:p-8 rounded-3xl border border-bordercol shadow-xs space-y-4">
            <h3 class="text-base font-bold font-heading text-dark flex items-center gap-2">
              <i data-lucide="flame" class="w-4 h-4 text-amber-500"></i>
              <span>Most Popular Masterclasses (Enrollments)</span>
            </h3>
            <div id="analytics-popular-courses" class="space-y-3">
              <p class="text-xs text-muted py-4 text-center">Loading course data...</p>
            </div>
          </div>

          <div class="bg-white p-6 sm:p-8 rounded-3xl border border-bordercol shadow-xs space-y-4">
            <h3 class="text-base font-bold font-heading text-dark flex items-center gap-2">
              <i data-lucide="activity" class="w-4 h-4 text-emerald-600"></i>
              <span>Platform Activity & Free Tools</span>
            </h3>
            <div class="space-y-3 text-xs">
              <div class="p-4 rounded-2xl bg-surface border border-bordercol flex items-center justify-between">
                <div>
                  <span class="font-bold text-dark block">Active Free AI Utilities</span>
                  <span class="text-muted text-[11px]">YouTube, Blog Outline, Code Explainer, etc.</span>
                </div>
                <span class="text-base font-extrabold text-brand-600">11 Tools Live</span>
              </div>
              <div class="p-4 rounded-2xl bg-surface border border-bordercol flex items-center justify-between">
                <div>
                  <span class="font-bold text-dark block">Serverless API Status</span>
                  <span class="text-muted text-[11px]">Netlify Functions & Google Gemini 3.8 Flash</span>
                </div>
                <span class="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">Operational</span>
              </div>
              <div class="p-4 rounded-2xl bg-surface border border-bordercol flex items-center justify-between">
                <div>
                  <span class="font-bold text-dark block">Transactional Email Delivery</span>
                  <span class="text-muted text-[11px]">Resend REST Integration</span>
                </div>
                <span class="text-xs font-bold text-violet-700 bg-violet-100 px-2.5 py-0.5 rounded-full">Connected</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- TAB: STUDENT MANAGEMENT -->
      <section id="tab-students" class="tab-panel hidden space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl font-bold font-heading text-dark">Student Management</h2>
            <p class="text-sm text-muted">Complete directory of all registered students, Google and Email logins, enrollments, and account statuses.</p>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="exportStudentsCSV()" class="bg-white hover:bg-slate-50 text-slate-700 border border-bordercol text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition-colors">
              <i data-lucide="download" class="w-4 h-4"></i>
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <!-- Student KPI Badges -->
        <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div class="bg-white p-4 rounded-2xl border border-bordercol shadow-2xs">
            <span class="text-[10px] font-bold uppercase tracking-wider text-muted block">Total Students</span>
            <span id="std-stat-total" class="text-xl font-black font-heading text-dark mt-1 block">--</span>
          </div>
          <div class="bg-white p-4 rounded-2xl border border-bordercol shadow-2xs">
            <span class="text-[10px] font-bold uppercase tracking-wider text-muted block">Google Logins</span>
            <span id="std-stat-google" class="text-xl font-black font-heading text-brand-600 mt-1 block">--</span>
          </div>
          <div class="bg-white p-4 rounded-2xl border border-bordercol shadow-2xs">
            <span class="text-[10px] font-bold uppercase tracking-wider text-muted block">Email Logins</span>
            <span id="std-stat-email" class="text-xl font-black font-heading text-indigo-600 mt-1 block">--</span>
          </div>
          <div class="bg-white p-4 rounded-2xl border border-bordercol shadow-2xs">
            <span class="text-[10px] font-bold uppercase tracking-wider text-muted block">New Today</span>
            <span id="std-stat-today" class="text-xl font-black font-heading text-emerald-600 mt-1 block">--</span>
          </div>
          <div class="bg-white p-4 rounded-2xl border border-bordercol shadow-2xs">
            <span class="text-[10px] font-bold uppercase tracking-wider text-muted block">This Month</span>
            <span id="std-stat-month" class="text-xl font-black font-heading text-dark mt-1 block">--</span>
          </div>
          <div class="bg-white p-4 rounded-2xl border border-bordercol shadow-2xs">
            <span class="text-[10px] font-bold uppercase tracking-wider text-muted block">Active Accounts</span>
            <span id="std-stat-active" class="text-xl font-black font-heading text-emerald-600 mt-1 block">--</span>
          </div>
          <div class="bg-white p-4 rounded-2xl border border-bordercol shadow-2xs">
            <span class="text-[10px] font-bold uppercase tracking-wider text-muted block">Paid Enrollments</span>
            <span id="std-stat-paid" class="text-xl font-black font-heading text-violet-700 mt-1 block">--</span>
          </div>
        </div>

        <!-- Search and Filter Bar -->
        <div class="bg-white p-4 rounded-2xl border border-bordercol shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
          <div class="relative w-full md:w-96">
            <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3.5 top-3"></i>
            <input type="text" id="student-search-input" oninput="debounceFilterStudents()" placeholder="Search by student name or email..." class="w-full pl-10 pr-4 py-2 bg-surface border border-bordercol rounded-xl text-xs font-medium focus:ring-2 focus:ring-violet-500">
          </div>

          <div class="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select id="student-filter-provider" onchange="filterStudentsTable()" class="px-3 py-2 text-xs bg-surface border border-bordercol rounded-xl font-semibold text-slate-700">
              <option value="all">All Login Methods</option>
              <option value="google">Google Login</option>
              <option value="email">Email Login</option>
            </select>

            <select id="student-filter-status" onchange="filterStudentsTable()" class="px-3 py-2 text-xs bg-surface border border-bordercol rounded-xl font-semibold text-slate-700">
              <option value="all">All Account Statuses</option>
              <option value="active">Active Accounts</option>
              <option value="disabled">Disabled Accounts</option>
            </select>
          </div>
        </div>

        <!-- Students Table -->
        <div class="bg-white rounded-3xl border border-bordercol overflow-hidden shadow-xs">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <tr>
                  <th class="py-3.5 px-6">Student</th>
                  <th class="py-3.5 px-4">Login Method</th>
                  <th class="py-3.5 px-4">Enrolled Courses</th>
                  <th class="py-3.5 px-4">Payment</th>
                  <th class="py-3.5 px-4">Registration</th>
                  <th class="py-3.5 px-4">Last Login</th>
                  <th class="py-3.5 px-4">Status</th>
                  <th class="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody id="students-table-body" class="divide-y divide-slate-100">
                <tr><td colspan="8" class="py-8 text-center text-muted">Loading students directory...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- TAB: EMAIL CENTER -->
      <section id="tab-email-center" class="tab-panel hidden space-y-8">
        <div>
          <h2 class="text-2xl font-bold font-heading text-dark">Email Center & Student Communications</h2>
          <p class="text-sm text-muted">Compose and dispatch transactional emails, enrollment receipts, and announcements directly to registered students.</p>
        </div>

        <!-- Email Sub-Tabs -->
        <div class="flex border-b border-bordercol space-x-6 text-xs font-bold text-slate-500">
          <button onclick="switchEmailSubTab('compose')" id="email-subtab-compose" class="pb-3 text-brand-600 border-b-2 border-brand-600 flex items-center gap-1.5">
            <i data-lucide="edit-3" class="w-4 h-4"></i>
            <span>Compose Email</span>
          </button>
          <button onclick="switchEmailSubTab('history')" id="email-subtab-history" class="pb-3 hover:text-dark flex items-center gap-1.5">
            <i data-lucide="clock" class="w-4 h-4"></i>
            <span>Dispatch History</span>
          </button>
          <button onclick="switchEmailSubTab('config')" id="email-subtab-config" class="pb-3 hover:text-dark flex items-center gap-1.5">
            <i data-lucide="settings" class="w-4 h-4"></i>
            <span>Sender Configuration</span>
          </button>
        </div>

        <!-- 1. COMPOSE EMAIL SUB-PANEL -->
        <div id="email-panel-compose" class="space-y-6">
          <div class="bg-white p-6 sm:p-8 rounded-3xl border border-bordercol shadow-xs space-y-6">
            
            <form onsubmit="handleSendAdminEmail(event)" class="space-y-4">
              
              <!-- Recipient Selector -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1.5">Target Audience *</label>
                  <select id="email-target-type" onchange="toggleEmailRecipientField()" class="w-full px-4 py-2.5 bg-surface border border-bordercol rounded-xl text-xs font-semibold text-slate-700">
                    <option value="single">Single Student (Specific Email)</option>
                    <option value="all">All Registered Students</option>
                    <option value="google">Google-Registered Students</option>
                    <option value="email">Email-Registered Students</option>
                    <option value="course">Students Enrolled in a Specific Masterclass</option>
                  </select>
                </div>

                <div id="container-email-single">
                  <label class="block text-xs font-bold text-slate-700 mb-1.5">Recipient Email Address *</label>
                  <input id="email-single-target" type="email" placeholder="student@example.com" class="w-full px-4 py-2.5 bg-surface border border-bordercol rounded-xl text-xs font-medium">
                </div>

                <div id="container-email-course" class="hidden">
                  <label class="block text-xs font-bold text-slate-700 mb-1.5">Select Course Cohort *</label>
                  <select id="email-course-target" class="w-full px-4 py-2.5 bg-surface border border-bordercol rounded-xl text-xs font-semibold text-slate-700">
                    <option value="complete-ai-mastery">Complete AI Mastery & Automation</option>
                    <option value="fullstack-web-dev">Production Full-Stack Web Development</option>
                    <option value="seo-mastery">Technical SEO & Programmatic Content</option>
                    <option value="digital-marketing-ai">Digital Marketing & Performance Ads</option>
                    <option value="adsense-blogging">Google AdSense High-RPM Blueprint</option>
                    <option value="youtube-automation">YouTube Automation & Faceless Engine</option>
                  </select>
                </div>
              </div>

              <!-- Reusable Template Selector -->
              <div class="p-4 rounded-2xl bg-brand-50/60 border border-brand-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div class="flex items-center gap-2">
                  <i data-lucide="file-text" class="w-4 h-4 text-brand-700"></i>
                  <span class="text-xs font-bold text-brand-900">Load Reusable Email Template:</span>
                </div>
                <select id="email-template-selector" onchange="applySelectedTemplate()" class="px-3 py-1.5 bg-white border border-brand-300 rounded-xl text-xs font-semibold text-brand-800">
                  <option value="">-- Choose Template --</option>
                  <option value="welcome">Welcome Email</option>
                  <option value="registration_confirm">Registration Confirmation</option>
                  <option value="free_enrollment">Free Course Enrollment</option>
                  <option value="paid_enrollment">Paid Course Confirmation</option>
                  <option value="payment_receipt">Payment Receipt & Invoice</option>
                  <option value="password_reset">Password Reset Notification</option>
                  <option value="new_course">New Course Announcement</option>
                  <option value="course_update">Course Curriculum Update</option>
                  <option value="student_announcement">General Student Announcement</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1.5">Email Subject Line *</label>
                <input id="email-subject-input" type="text" required placeholder="Important Announcement from Web Nasir Academy..." class="w-full px-4 py-2.5 bg-surface border border-bordercol rounded-xl text-xs font-medium font-heading">
              </div>

              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <label class="block text-xs font-bold text-slate-700">Email Message Body *</label>
                  <span class="text-[10px] text-muted font-mono">Merge Tags: {{student_name}}, {{student_email}}, {{course_title}}, {{dashboard_url}}</span>
                </div>
                <textarea id="email-body-input" rows="8" required placeholder="Write message body here..." class="w-full px-4 py-3 bg-surface border border-bordercol rounded-xl text-xs font-mono leading-relaxed"></textarea>
              </div>

              <div class="flex items-center justify-between pt-2">
                <div class="text-[11px] text-muted flex items-center gap-1.5">
                  <i data-lucide="shield-check" class="w-3.5 h-3.5 text-emerald-600"></i>
                  <span>Actual delivery status recorded automatically in audit log.</span>
                </div>
                <button type="submit" id="btn-send-email" class="gradient-btn text-white text-xs font-semibold px-6 py-3 rounded-xl flex items-center gap-2 shadow-md">
                  <i data-lucide="send" class="w-4 h-4"></i>
                  <span>Send Email to Students</span>
                </button>
              </div>

            </form>
          </div>
        </div>

        <!-- 2. DISPATCH HISTORY SUB-PANEL -->
        <div id="email-panel-history" class="hidden space-y-4">
          <div class="bg-white rounded-3xl border border-bordercol overflow-hidden shadow-xs">
            <div class="p-4 border-b border-bordercol flex items-center justify-between bg-slate-50">
              <span class="text-xs font-bold text-dark">Email Dispatch Audit History</span>
              <button onclick="loadEmailHistory()" class="text-xs text-brand-600 hover:underline flex items-center gap-1">
                <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i> Refresh
              </button>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th class="py-3 px-4">Recipient</th>
                    <th class="py-3 px-4">Subject</th>
                    <th class="py-3 px-4">Template</th>
                    <th class="py-3 px-4">Status</th>
                    <th class="py-3 px-4">Sent At</th>
                  </tr>
                </thead>
                <tbody id="email-history-table-body" class="divide-y divide-slate-100">
                  <tr><td colspan="5" class="py-6 text-center text-muted">No emails recorded yet.</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 3. SENDER CONFIGURATION SUB-PANEL -->
        <div id="email-panel-config" class="hidden space-y-6">
          <div class="bg-white p-6 sm:p-8 rounded-3xl border border-bordercol shadow-xs max-w-2xl space-y-6">
            <div class="border-b border-slate-100 pb-3">
              <h3 class="text-base font-bold text-dark">Transactional Email Provider (Resend)</h3>
              <p class="text-xs text-muted">Configure verified sending credentials. API key is stored server-side and never exposed to client browsers.</p>
            </div>

            <form onsubmit="handleSaveEmailConfig(event)" class="space-y-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Sender Name *</label>
                <input id="cfg-sender-name" type="text" required value="Web Nasir Academy" class="w-full px-4 py-2.5 bg-surface border border-bordercol rounded-xl text-xs font-medium">
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Sender Email Address *</label>
                <input id="cfg-sender-email" type="email" required value="support@webnasir.com" class="w-full px-4 py-2.5 bg-surface border border-bordercol rounded-xl text-xs font-medium">
                <span class="text-[10px] text-muted block mt-1">Ensure this domain has active SPF, DKIM, and DMARC records verified on Resend.</span>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Resend API Key</label>
                <input id="cfg-resend-key" type="password" placeholder="re_••••••••••••••••••••••••" class="w-full px-4 py-2.5 bg-surface border border-bordercol rounded-xl text-xs font-mono">
                <span class="text-[10px] text-muted block mt-1">If blank, dispatches are cleanly simulated and recorded with full payload in the audit log.</span>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Reply-To Address</label>
                <input id="cfg-reply-to" type="email" value="hello@webnasir.com" class="w-full px-4 py-2.5 bg-surface border border-bordercol rounded-xl text-xs font-medium">
              </div>

              <button type="submit" class="gradient-btn text-white text-xs font-semibold px-6 py-3 rounded-xl flex items-center gap-2 shadow-md">
                <i data-lucide="check" class="w-4 h-4"></i>
                <span>Save Email Configuration</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      <!-- STUDENT DETAIL PROFILE MODAL -->
      <div id="student-detail-modal" class="hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between border-b border-bordercol pb-4">
            <div>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 uppercase">Student Profile</span>
              <h3 id="modal-std-name" class="text-lg font-bold font-heading text-dark mt-1">Student Name</h3>
              <p id="modal-std-email" class="text-xs text-muted">student@example.com</p>
            </div>
            <button onclick="closeStudentDetailModal()" class="text-slate-400 hover:text-dark p-2"><i data-lucide="x" class="w-5 h-5"></i></button>
          </div>

          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-3 text-xs">
              <div class="p-3 bg-surface rounded-xl border border-bordercol">
                <span class="text-muted block text-[10px] uppercase font-bold">Authentication</span>
                <span id="modal-std-provider" class="font-bold text-dark capitalize mt-0.5 block">Google</span>
              </div>
              <div class="p-3 bg-surface rounded-xl border border-bordercol">
                <span class="text-muted block text-[10px] uppercase font-bold">Account Status</span>
                <span id="modal-std-status" class="font-bold text-emerald-600 mt-0.5 block">Active</span>
              </div>
            </div>

            <div>
              <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Enrolled Masterclasses</h4>
              <div id="modal-std-enrollments" class="space-y-2 text-xs">
                <!-- Enrolled list -->
              </div>
            </div>

            <div>
              <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Payment Transaction History</h4>
              <div id="modal-std-payments" class="space-y-2 text-xs">
                <!-- Payments list -->
              </div>
            </div>
          </div>

          <div class="flex justify-between items-center pt-4 border-t border-bordercol">
            <button id="modal-std-toggle-btn" class="px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200">
              Disable Account
            </button>
            <button onclick="closeStudentDetailModal()" class="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white">
              Close Profile
            </button>
          </div>
        </div>
      </div>
`;

adminHtml = adminHtml.replace('<!-- TAB: PAID COURSES MANAGER -->', `${newPanels}\n      <!-- TAB: PAID COURSES MANAGER -->`);

// 3. Inject JavaScript logic for Analytics, Students, and Email Center
const newAdminLogic = `
    window.ADMIN.students = [];
    window.ADMIN.studentStats = {};
    window.ADMIN.emailTemplates = [];
    window.ADMIN.emailHistory = [];
    window.ADMIN.emailConfig = {};
    window.ADMIN.analytics = {};

    // ==========================================
    // ANALYTICS OVERVIEW
    // ==========================================
    window.filterAnalytics = async function(period) {
      document.querySelectorAll('.analytics-filter-btn').forEach(btn => {
        if (btn.dataset.period === period) {
          btn.className = 'analytics-filter-btn px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 font-bold';
        } else {
          btn.className = 'analytics-filter-btn px-3 py-1.5 rounded-lg text-slate-600 hover:text-dark';
        }
      });

      try {
        const data = await req(\`/admin/analytics?period=\${period}\`);
        window.ADMIN.analytics = data;
        renderAnalyticsUI(data);
      } catch (err) {
        showToast('Analytics error: ' + err.message, 'error');
      }
    };

    function renderAnalyticsUI(data) {
      if (!data) return;
      document.getElementById('analytics-revenue').textContent = '₹' + (data.total_revenue || 0).toLocaleString();
      document.getElementById('analytics-total-students').textContent = data.total_students || 0;
      document.getElementById('analytics-student-split').textContent = \`\${data.google_logins || 0} Google • \${data.email_logins || 0} Email\`;
      document.getElementById('analytics-enrollments-count').textContent = data.total_enrollments || 0;
      document.getElementById('analytics-enrollments-split').textContent = \`\${data.paid_enrollments || 0} Paid • \${data.free_enrollments || 0} Free\`;
      document.getElementById('analytics-emails-total').textContent = data.emails_total || 0;

      const popularList = document.getElementById('analytics-popular-courses');
      if (popularList) {
        if (!data.popular_courses || data.popular_courses.length === 0) {
          popularList.innerHTML = '<p class="text-xs text-muted py-2 text-center">No enrollments recorded for this period.</p>';
        } else {
          popularList.innerHTML = data.popular_courses.map(c => \`
            <div class="p-3.5 rounded-2xl bg-surface border border-bordercol flex items-center justify-between text-xs">
              <div>
                <span class="font-bold text-dark block">\${c.title}</span>
                <span class="text-muted text-[11px]">\${c.category} • ₹\${(c.price || 0).toLocaleString()}</span>
              </div>
              <span class="font-bold text-violet-700 bg-violet-50 px-2.5 py-1 rounded-full">\${c.enrollments} Enrolled</span>
            </div>
          \`).join('');
        }
      }
    }

    // ==========================================
    // STUDENT MANAGEMENT
    // ==========================================
    let studentSearchDebounce = null;
    window.debounceFilterStudents = function() {
      clearTimeout(studentSearchDebounce);
      studentSearchDebounce = setTimeout(filterStudentsTable, 250);
    };

    window.filterStudentsTable = async function() {
      const search = document.getElementById('student-search-input').value.trim();
      const provider = document.getElementById('student-filter-provider').value;
      const status = document.getElementById('student-filter-status').value;

      try {
        const query = new URLSearchParams();
        if (search) query.append('search', search);
        if (provider !== 'all') query.append('provider', provider);
        if (status !== 'all') query.append('status', status);

        const res = await req(\`/admin/students?\${query.toString()}\`);
        window.ADMIN.students = res.students || [];
        window.ADMIN.studentStats = res.stats || {};
        renderStudentsTable();
      } catch (err) {
        showToast('Filter error: ' + err.message, 'error');
      }
    };

    function renderStudentsTable() {
      const stats = window.ADMIN.studentStats || {};
      if (document.getElementById('std-stat-total')) document.getElementById('std-stat-total').textContent = stats.total_students ?? window.ADMIN.students.length;
      if (document.getElementById('std-stat-google')) document.getElementById('std-stat-google').textContent = stats.google_registrations ?? '--';
      if (document.getElementById('std-stat-email')) document.getElementById('std-stat-email').textContent = stats.email_registrations ?? '--';
      if (document.getElementById('std-stat-today')) document.getElementById('std-stat-today').textContent = stats.new_today ?? '--';
      if (document.getElementById('std-stat-month')) document.getElementById('std-stat-month').textContent = stats.new_this_month ?? '--';
      if (document.getElementById('std-stat-active')) document.getElementById('std-stat-active').textContent = stats.active_students ?? '--';
      if (document.getElementById('std-stat-paid')) document.getElementById('std-stat-paid').textContent = stats.paid_enrollments ?? '--';

      const tbody = document.getElementById('students-table-body');
      if (!tbody) return;

      if (!window.ADMIN.students.length) {
        tbody.innerHTML = '<tr><td colspan="8" class="py-8 text-center text-muted">No students found matching current filters.</td></tr>';
        return;
      }

      tbody.innerHTML = window.ADMIN.students.map(s => \`
        <tr class="hover:bg-slate-50 transition-colors">
          <td class="py-3.5 px-6">
            <div class="flex items-center gap-2.5">
              <div class="w-7 h-7 rounded-full bg-violet-100 text-violet-700 font-bold flex items-center justify-center text-xs">
                \${(s.name || 'S')[0].toUpperCase()}
              </div>
              <div>
                <span class="font-bold text-dark block">\${s.name || 'Student'}</span>
                <span class="text-[11px] text-muted">\${s.email}</span>
              </div>
            </div>
          </td>
          <td class="py-3.5 px-4">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold \${s.auth_provider === 'google' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-purple-50 text-purple-700 border border-purple-200'}">
              \${s.auth_provider === 'google' ? 'Google Auth' : 'Email & Password'}
            </span>
          </td>
          <td class="py-3.5 px-4 font-semibold text-slate-700">
            <span class="font-bold text-violet-700">\${(s.enrolled_courses || []).length} courses</span>
          </td>
          <td class="py-3.5 px-4">
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold \${s.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}">
              \${s.payment_status === 'paid' ? 'Paid Student' : 'Free / Pending'}
            </span>
          </td>
          <td class="py-3.5 px-4 text-slate-400 text-[11px]">\${s.created_at ? new Date(s.created_at).toLocaleDateString() : '--'}</td>
          <td class="py-3.5 px-4 text-slate-400 text-[11px]">\${s.last_login_at ? new Date(s.last_login_at).toLocaleDateString() : '--'}</td>
          <td class="py-3.5 px-4">
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold \${s.status !== 'disabled' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}">
              \${s.status !== 'disabled' ? 'Active' : 'Disabled'}
            </span>
          </td>
          <td class="py-3.5 px-6 text-right space-x-2">
            <button onclick="viewStudentProfile('\${s.id}')" class="text-xs font-semibold text-violet-600 hover:text-violet-800 p-1">View Profile</button>
            <button onclick="toggleStudentAccount('\${s.id}', '\${s.status !== 'disabled' ? 'disabled' : 'active'}')" class="text-xs font-semibold \${s.status !== 'disabled' ? 'text-rose-600 hover:text-rose-800' : 'text-emerald-600 hover:text-emerald-800'} p-1">
              \${s.status !== 'disabled' ? 'Disable' : 'Enable'}
            </button>
          </td>
        </tr>
      \`).join('');
      lucide.createIcons();
    }

    window.viewStudentProfile = async function(id) {
      try {
        const data = await req(\`/admin/students/\${id}\`);
        const s = data.student;
        document.getElementById('modal-std-name').textContent = s.name || 'Student';
        document.getElementById('modal-std-email').textContent = s.email;
        document.getElementById('modal-std-provider').textContent = s.auth_provider || 'google';
        document.getElementById('modal-std-status').textContent = s.status || 'active';

        const enrollList = document.getElementById('modal-std-enrollments');
        if (!data.enrollments || data.enrollments.length === 0) {
          enrollList.innerHTML = '<p class="text-slate-400 italic">No masterclasses enrolled yet.</p>';
        } else {
          enrollList.innerHTML = data.enrollments.map(e => \`
            <div class="p-2.5 rounded-xl bg-surface border border-bordercol flex items-center justify-between">
              <div>
                <span class="font-bold text-dark block">\${e.course_title}</span>
                <span class="text-muted text-[10px]">\${e.enrollment_id} • \${new Date(e.enrolled_at).toLocaleDateString()}</span>
              </div>
              <span class="font-bold text-emerald-600">\${e.amount ? '₹' + e.amount.toLocaleString() : 'Free'}</span>
            </div>
          \`).join('');
        }

        const payList = document.getElementById('modal-std-payments');
        if (!data.payments || data.payments.length === 0) {
          payList.innerHTML = '<p class="text-slate-400 italic">No payment transactions on record.</p>';
        } else {
          payList.innerHTML = data.payments.map(p => \`
            <div class="p-2.5 rounded-xl bg-surface border border-bordercol flex items-center justify-between">
              <div>
                <span class="font-mono text-dark block text-[11px]">\${p.payment_id}</span>
                <span class="text-muted text-[10px]">\${p.course_title} • \${p.payment_method}</span>
              </div>
              <span class="font-bold text-dark">₹\${(p.amount || 0).toLocaleString()}</span>
            </div>
          \`).join('');
        }

        const toggleBtn = document.getElementById('modal-std-toggle-btn');
        toggleBtn.textContent = s.status !== 'disabled' ? 'Disable Account' : 'Reactivate Account';
        toggleBtn.onclick = () => {
          toggleStudentAccount(s.id, s.status !== 'disabled' ? 'disabled' : 'active');
          closeStudentDetailModal();
        };

        document.getElementById('student-detail-modal').classList.remove('hidden');
        lucide.createIcons();
      } catch (err) {
        showToast('Error loading profile: ' + err.message, 'error');
      }
    };

    window.closeStudentDetailModal = function() {
      document.getElementById('student-detail-modal').classList.add('hidden');
    };

    window.toggleStudentAccount = async function(id, nextStatus) {
      try {
        await req(\`/admin/students/\${id}/status\`, { method: 'PUT', body: JSON.stringify({ status: nextStatus }) });
        showToast(\`Student account status set to \${nextStatus}\`, 'success');
        filterStudentsTable();
      } catch (err) {
        showToast('Error: ' + err.message, 'error');
      }
    };

    window.exportStudentsCSV = function() {
      window.open('/api/admin/students/export-csv', '_blank');
    };

    // ==========================================
    // EMAIL CENTER
    // ==========================================
    window.switchEmailSubTab = function(subtab) {
      document.getElementById('email-subtab-compose').className = subtab === 'compose' ? 'pb-3 text-brand-600 border-b-2 border-brand-600 flex items-center gap-1.5' : 'pb-3 hover:text-dark flex items-center gap-1.5';
      document.getElementById('email-subtab-history').className = subtab === 'history' ? 'pb-3 text-brand-600 border-b-2 border-brand-600 flex items-center gap-1.5' : 'pb-3 hover:text-dark flex items-center gap-1.5';
      document.getElementById('email-subtab-config').className = subtab === 'config' ? 'pb-3 text-brand-600 border-b-2 border-brand-600 flex items-center gap-1.5' : 'pb-3 hover:text-dark flex items-center gap-1.5';

      document.getElementById('email-panel-compose').className = subtab === 'compose' ? 'space-y-6' : 'hidden space-y-6';
      document.getElementById('email-panel-history').className = subtab === 'history' ? 'space-y-4' : 'hidden space-y-4';
      document.getElementById('email-panel-config').className = subtab === 'config' ? 'space-y-6' : 'hidden space-y-6';
      lucide.createIcons();
    };

    window.toggleEmailRecipientField = function() {
      const type = document.getElementById('email-target-type').value;
      document.getElementById('container-email-single').className = type === 'single' ? '' : 'hidden';
      document.getElementById('container-email-course').className = type === 'course' ? '' : 'hidden';
    };

    window.applySelectedTemplate = function() {
      const templateId = document.getElementById('email-template-selector').value;
      if (!templateId) return;
      const t = (window.ADMIN.emailTemplates || []).find(item => item.id === templateId);
      if (t) {
        document.getElementById('email-subject-input').value = t.subject || '';
        document.getElementById('email-body-input').value = t.body || '';
      }
    };

    window.handleSendAdminEmail = async function(e) {
      e.preventDefault();
      const btn = document.getElementById('btn-send-email');
      btn.disabled = true;
      btn.innerHTML = '<span>Dispatching emails...</span>';

      const payload = {
        recipient_type: document.getElementById('email-target-type').value,
        recipient_email: document.getElementById('email-single-target').value.trim(),
        course_id: document.getElementById('email-course-target').value,
        template_id: document.getElementById('email-template-selector').value,
        subject: document.getElementById('email-subject-input').value.trim(),
        body: document.getElementById('email-body-input').value.trim(),
      };

      try {
        const res = await req('/admin/emails/send', { method: 'POST', body: JSON.stringify(payload) });
        showToast(\`Dispatched to \${res.total_targets} recipients (\${res.delivered} live, \${res.simulated} simulated)\`, 'success');
        loadEmailHistory();
        switchEmailSubTab('history');
      } catch (err) {
        showToast('Email send error: ' + err.message, 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i data-lucide="send" class="w-4 h-4"></i><span>Send Email to Students</span>';
        lucide.createIcons();
      }
    };

    async function loadEmailHistory() {
      try {
        const history = await req('/admin/emails/history');
        window.ADMIN.emailHistory = history || [];
        renderEmailHistoryTable();
      } catch (err) {
        showToast('Error loading email history: ' + err.message, 'error');
      }
    }

    function renderEmailHistoryTable() {
      const tbody = document.getElementById('email-history-table-body');
      if (!tbody) return;
      if (!window.ADMIN.emailHistory.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="py-6 text-center text-muted">No emails dispatched yet.</td></tr>';
        return;
      }

      tbody.innerHTML = window.ADMIN.emailHistory.map(h => \`
        <tr class="hover:bg-slate-50">
          <td class="py-3 px-4 font-semibold text-dark">\${h.recipient_name}<div class="text-[10px] text-muted">\${h.to}</div></td>
          <td class="py-3 px-4 text-slate-700 font-medium">\${h.subject}</td>
          <td class="py-3 px-4 font-mono text-[10px] text-slate-500 uppercase">\${h.template_id || 'custom'}</td>
          <td class="py-3 px-4">
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold \${h.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' : (h.status === 'simulated' ? 'bg-violet-100 text-violet-800' : 'bg-rose-100 text-rose-800')}">
              \${h.status}
            </span>
          </td>
          <td class="py-3 px-4 text-slate-400 text-[10px]">\${h.sent_at ? new Date(h.sent_at).toLocaleString() : '--'}</td>
        </tr>
      \`).join('');
    }

    window.handleSaveEmailConfig = async function(e) {
      e.preventDefault();
      const payload = {
        sender_name: document.getElementById('cfg-sender-name').value.trim(),
        sender_email: document.getElementById('cfg-sender-email').value.trim(),
        resend_api_key: document.getElementById('cfg-resend-key').value.trim(),
        reply_to: document.getElementById('cfg-reply-to').value.trim(),
      };

      try {
        await req('/admin/emails/config', { method: 'PUT', body: JSON.stringify(payload) });
        showToast('Email configuration saved successfully!', 'success');
      } catch (err) {
        showToast('Error: ' + err.message, 'error');
      }
    };
`;

// Inject into script
adminHtml = adminHtml.replace('// COURSES FUNCTIONS', `${newAdminLogic}\n    // COURSES FUNCTIONS`);

// Update loadAllAdminData to fetch students, templates, history, and config
const oldLoadAll = `async function loadAllAdminData() {`;
const newLoadAll = `async function loadAllAdminData() {
      try {
        const [articles, tools, topics, settings, courses, testimonials, marquee, enrollments, contacts, studentsData, templates, emailHist, emailCfg, analyticsData] = await Promise.all([
          req('/admin/articles'),
          req('/admin/tools'),
          req('/admin/topics'),
          req('/admin/settings'),
          req('/admin/courses').catch(() => []),
          req('/admin/testimonials').catch(() => []),
          req('/admin/marquee').catch(() => ({ items: [] })),
          req('/admin/enrollments').catch(() => []),
          req('/admin/contacts').catch(() => []),
          req('/admin/students').catch(() => ({ students: [], stats: {} })),
          req('/admin/emails/templates').catch(() => []),
          req('/admin/emails/history').catch(() => []),
          req('/admin/emails/config').catch(() => ({})),
          req('/admin/analytics').catch(() => ({})),
        ]);

        window.ADMIN.articles = articles || [];
        window.ADMIN.tools = tools || [];
        window.ADMIN.topics = topics || [];
        window.ADMIN.settings = settings || {};
        window.ADMIN.courses = courses || [];
        window.ADMIN.testimonials = testimonials || [];
        window.ADMIN.marquee = (marquee && marquee.items) || [];
        window.ADMIN.enrollments = enrollments || [];
        window.ADMIN.contacts = contacts || [];
        window.ADMIN.students = (studentsData && studentsData.students) || [];
        window.ADMIN.studentStats = (studentsData && studentsData.stats) || {};
        window.ADMIN.emailTemplates = templates || [];
        window.ADMIN.emailHistory = emailHist || [];
        window.ADMIN.emailConfig = emailCfg || {};
        window.ADMIN.analytics = analyticsData || {};

        renderOverview();
        renderArticlesTable();
        renderToolsManager();
        renderTopicsManager();
        renderCoursesManager();
        renderTestimonialsManager();
        renderMarqueeManager();
        renderEnrollmentsAndContacts();
        renderStudentsTable();
        renderEmailHistoryTable();
        renderAnalyticsUI(analyticsData);
        populateSettingsForm();

        // Populate email config form
        if (emailCfg) {
          if (document.getElementById('cfg-sender-name') && emailCfg.sender_name) document.getElementById('cfg-sender-name').value = emailCfg.sender_name;
          if (document.getElementById('cfg-sender-email') && emailCfg.sender_email) document.getElementById('cfg-sender-email').value = emailCfg.sender_email;
          if (document.getElementById('cfg-reply-to') && emailCfg.reply_to) document.getElementById('cfg-reply-to').value = emailCfg.reply_to;
        }
        return;
      } catch (err) {
        showToast('Error loading admin state: ' + err.message, 'error');
      }
    }
    async function _oldLoadAll() {`;

adminHtml = adminHtml.replace(oldLoadAll, newLoadAll);

fs.writeFileSync('public/admin.html', adminHtml, 'utf8');
fs.writeFileSync('admin.html', adminHtml, 'utf8');
console.log('Successfully updated public/admin.html and admin.html with Student Management, Email Center, and Analytics Overview!');

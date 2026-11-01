import fs from 'node:fs';
import path from 'node:path';

// Read current public/admin.html to inspect its structure
const currentAdmin = fs.readFileSync('public/admin.html', 'utf8');

// We will construct the enhanced admin HTML with the 4 additional tabs:
// 1. Paid Courses Manager
// 2. Student Reviews & Testimonials
// 3. Marquee Ticker & Video Settings
// 4. Enrollments & Inquiries

const updatedAdmin = currentAdmin
  // Add tabs to the subnav
  .replace(
    `<button onclick="switchTab('home-settings')" class="tab-btn pb-1 hover:text-dark flex items-center gap-2 whitespace-nowrap" data-tab="home-settings">
            <i data-lucide="home" class="w-4 h-4"></i>
            <span>Home Page Settings</span>
          </button>`,
    `<button onclick="switchTab('home-settings')" class="tab-btn pb-1 hover:text-dark flex items-center gap-2 whitespace-nowrap" data-tab="home-settings">
            <i data-lucide="home" class="w-4 h-4"></i>
            <span>Home Page Settings</span>
          </button>
          <button onclick="switchTab('courses')" class="tab-btn pb-1 hover:text-dark flex items-center gap-2 whitespace-nowrap" data-tab="courses">
            <i data-lucide="graduation-cap" class="w-4 h-4 text-violet-600"></i>
            <span>Paid Courses (Masterclasses)</span>
          </button>
          <button onclick="switchTab('testimonials')" class="tab-btn pb-1 hover:text-dark flex items-center gap-2 whitespace-nowrap" data-tab="testimonials">
            <i data-lucide="star" class="w-4 h-4 text-amber-500"></i>
            <span>Student Reviews</span>
          </button>
          <button onclick="switchTab('marquee-video')" class="tab-btn pb-1 hover:text-dark flex items-center gap-2 whitespace-nowrap" data-tab="marquee-video">
            <i data-lucide="video" class="w-4 h-4 text-indigo-600"></i>
            <span>Marquee & Founder Video</span>
          </button>
          <button onclick="switchTab('enrollments')" class="tab-btn pb-1 hover:text-dark flex items-center gap-2 whitespace-nowrap" data-tab="enrollments">
            <i data-lucide="users" class="w-4 h-4 text-emerald-600"></i>
            <span>Student Enrollments & Inquiries</span>
          </button>`
  )
  // Add tabs to overview metrics
  .replace(
    `<div id="metric-topics-count" class="text-3xl font-extrabold font-heading text-dark">--</div>
            <div class="text-xs text-muted mt-1">AI, AdSense, Facebook, etc.</div>
          </div>`,
    `<div id="metric-topics-count" class="text-3xl font-extrabold font-heading text-dark">--</div>
            <div class="text-xs text-muted mt-1">AI, AdSense, Facebook, etc.</div>
          </div>
          <div class="bg-white p-6 rounded-2xl border border-bordercol shadow-xs">
            <div class="text-xs font-bold uppercase tracking-wider text-muted mb-2">Masterclasses</div>
            <div id="metric-courses-count" class="text-3xl font-extrabold font-heading text-violet-600">--</div>
            <div class="text-xs text-violet-600 font-semibold mt-1">Academy Courses</div>
          </div>
          <div class="bg-white p-6 rounded-2xl border border-bordercol shadow-xs">
            <div class="text-xs font-bold uppercase tracking-wider text-muted mb-2">Student Reviews</div>
            <div id="metric-reviews-count" class="text-3xl font-extrabold font-heading text-amber-600">--</div>
            <div class="text-xs text-amber-600 font-semibold mt-1">Verified Testimonials</div>
          </div>`
  );

// Insert the sections for the 4 new tabs right before `<!-- TAB 2: HOME PAGE SETTINGS -->`
const newTabSections = `
      <!-- TAB: PAID COURSES MANAGER -->
      <section id="tab-courses" class="tab-panel hidden space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl font-bold font-heading text-dark">Academy Paid Courses (Masterclasses)</h2>
            <p class="text-sm text-muted">Manage the 8 high-impact courses, curriculum modules, pricing in INR, badges, and active visibility.</p>
          </div>
          <button onclick="openNewCourseModal()" class="gradient-btn text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm self-start">
            <i data-lucide="plus" class="w-4 h-4"></i>
            <span>Add Masterclass</span>
          </button>
        </div>

        <div id="courses-manager-list" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Dynamically populated -->
        </div>
      </section>

      <!-- TAB: STUDENT REVIEWS -->
      <section id="tab-testimonials" class="tab-panel hidden space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl font-bold font-heading text-dark">Student Reviews & Video Feedback</h2>
            <p class="text-sm text-muted">Manage student testimonials, ratings, earning metrics, and verified feedback shown on the homepage.</p>
          </div>
          <button onclick="openNewTestimonialModal()" class="gradient-btn text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm self-start">
            <i data-lucide="plus" class="w-4 h-4"></i>
            <span>Add Student Review</span>
          </button>
        </div>

        <div id="testimonials-manager-list" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Dynamically populated -->
        </div>
      </section>

      <!-- TAB: MARQUEE & FOUNDER VIDEO -->
      <section id="tab-marquee-video" class="tab-panel hidden space-y-8">
        <div>
          <h2 class="text-2xl font-bold font-heading text-dark">Marquee Ticker & Founder Video Presenter</h2>
          <p class="text-sm text-muted">Configure the top running marquee announcement items and the Founder Video Presenter settings.</p>
        </div>

        <!-- Founder Video Settings -->
        <div class="bg-white p-6 sm:p-8 rounded-3xl border border-bordercol shadow-sm space-y-6">
          <div class="flex items-center gap-2 text-base font-bold text-dark border-b border-slate-100 pb-3">
            <i data-lucide="video" class="w-5 h-5 text-violet-600"></i>
            <span>Founder Video Presenter Settings</span>
          </div>

          <form onsubmit="handleSaveVideoSettings(event)" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Section Title</label>
                <input id="setting-video_title" type="text" class="w-full px-4 py-2.5 bg-surface border border-bordercol rounded-xl text-sm font-medium">
              </div>
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Subtitle / Subheading</label>
                <input id="setting-video_subtitle" type="text" class="w-full px-4 py-2.5 bg-surface border border-bordercol rounded-xl text-sm font-medium">
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Video URL (MP4, WebM, or YouTube embed URL)</label>
              <input id="setting-video_url" type="text" placeholder="https://example.com/video.mp4 or YouTube embed" class="w-full px-4 py-2.5 bg-surface border border-bordercol rounded-xl text-sm font-medium font-mono">
              <span class="text-[11px] text-muted block mt-1">If blank, the interactive Web Speech Presenter audio narration with real-time subtitles plays automatically.</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">English Narration Script</label>
                <textarea id="setting-video_script_english" rows="4" class="w-full px-4 py-2.5 bg-surface border border-bordercol rounded-xl text-xs font-medium"></textarea>
              </div>
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Urdu / Hindi Narration Script</label>
                <textarea id="setting-video_script_urdu" rows="4" class="w-full px-4 py-2.5 bg-surface border border-bordercol rounded-xl text-xs font-medium"></textarea>
              </div>
            </div>

            <button type="submit" class="gradient-btn text-white text-xs font-semibold px-6 py-3 rounded-xl flex items-center gap-2">
              <i data-lucide="check" class="w-4 h-4"></i>
              <span>Save Founder Video Settings</span>
            </button>
          </form>
        </div>

        <!-- Marquee Items -->
        <div class="bg-white p-6 sm:p-8 rounded-3xl border border-bordercol shadow-sm space-y-6">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div class="flex items-center gap-2 text-base font-bold text-dark">
              <i data-lucide="repeat" class="w-5 h-5 text-indigo-600"></i>
              <span>Marquee Ticker Items</span>
            </div>
            <button onclick="addMarqueeRow()" class="text-xs text-brand-600 font-bold hover:underline flex items-center gap-1">
              <i data-lucide="plus" class="w-3.5 h-3.5"></i> Add Ticker Item
            </button>
          </div>

          <div id="marquee-items-list" class="space-y-3">
            <!-- Populated via script -->
          </div>

          <button onclick="handleSaveMarqueeItems()" class="gradient-btn text-white text-xs font-semibold px-6 py-3 rounded-xl flex items-center gap-2">
            <i data-lucide="save" class="w-4 h-4"></i>
            <span>Save All Marquee Items</span>
          </button>
        </div>
      </section>

      <!-- TAB: STUDENT ENROLLMENTS & INQUIRIES -->
      <section id="tab-enrollments" class="tab-panel hidden space-y-8">
        <div>
          <h2 class="text-2xl font-bold font-heading text-dark">Student Enrollments & Contact Inquiries</h2>
          <p class="text-sm text-muted">View all direct course checkout enrollments and contact messages from academy students.</p>
        </div>

        <div class="space-y-6">
          <div class="bg-white rounded-3xl border border-bordercol overflow-hidden shadow-sm">
            <div class="p-5 border-b border-bordercol bg-slate-50 flex items-center justify-between">
              <h3 class="text-sm font-bold text-dark flex items-center gap-2">
                <i data-lucide="graduation-cap" class="w-4 h-4 text-violet-600"></i>
                <span>Course Enrollments</span>
              </h3>
              <span id="enrollments-count-badge" class="text-xs px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-800 font-bold">0 records</span>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th class="py-3 px-4">Student</th>
                    <th class="py-3 px-4">Phone / WhatsApp</th>
                    <th class="py-3 px-4">Course</th>
                    <th class="py-3 px-4">Amount</th>
                    <th class="py-3 px-4">Payment Method</th>
                    <th class="py-3 px-4">Status</th>
                    <th class="py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody id="enrollments-table-body" class="divide-y divide-slate-100">
                  <tr><td colspan="7" class="py-6 text-center text-muted">No enrollments yet.</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="bg-white rounded-3xl border border-bordercol overflow-hidden shadow-sm">
            <div class="p-5 border-b border-bordercol bg-slate-50 flex items-center justify-between">
              <h3 class="text-sm font-bold text-dark flex items-center gap-2">
                <i data-lucide="mail" class="w-4 h-4 text-brand-600"></i>
                <span>Contact Messages & Inquiries</span>
              </h3>
              <span id="contacts-count-badge" class="text-xs px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-800 font-bold">0 records</span>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th class="py-3 px-4">Name</th>
                    <th class="py-3 px-4">Email</th>
                    <th class="py-3 px-4">Subject</th>
                    <th class="py-3 px-4">Message</th>
                    <th class="py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody id="contacts-table-body" class="divide-y divide-slate-100">
                  <tr><td colspan="5" class="py-6 text-center text-muted">No messages yet.</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
`;

let finalAdmin = updatedAdmin.replace('<!-- TAB 2: HOME PAGE SETTINGS -->', `${newTabSections}\n      <!-- TAB 2: HOME PAGE SETTINGS -->`);

// Now add the Modals for Course and Testimonial
const newModals = `
  <!-- COURSE EDIT / CREATE MODAL -->
  <div id="course-modal" class="hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl">
      <div class="flex items-center justify-between border-b border-bordercol pb-4">
        <div>
          <h3 id="course-modal-title" class="text-lg font-bold font-heading text-dark">Add New Masterclass</h3>
          <p class="text-xs text-muted">Configure course details, pricing, syllabus, and enrollment stats.</p>
        </div>
        <button onclick="closeCourseModal()" class="text-slate-400 hover:text-dark p-2"><i data-lucide="x" class="w-5 h-5"></i></button>
      </div>

      <form onsubmit="handleSaveCourseForm(event)" class="space-y-4">
        <input type="hidden" id="modal-course-id">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Course Title *</label>
            <input id="modal-course-title" type="text" required class="w-full px-3 py-2 text-xs bg-surface border border-bordercol rounded-xl">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Category</label>
            <input id="modal-course-category" type="text" placeholder="AI Engineering, Web Development, etc." class="w-full px-3 py-2 text-xs bg-surface border border-bordercol rounded-xl">
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Short Description *</label>
          <textarea id="modal-course-desc" rows="2" required class="w-full px-3 py-2 text-xs bg-surface border border-bordercol rounded-xl"></textarea>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Price (₹ INR) *</label>
            <input id="modal-course-price" type="number" required class="w-full px-3 py-2 text-xs bg-surface border border-bordercol rounded-xl">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Original Price (₹)</label>
            <input id="modal-course-original" type="number" class="w-full px-3 py-2 text-xs bg-surface border border-bordercol rounded-xl">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Rating (e.g. 4.9)</label>
            <input id="modal-course-rating" type="number" step="0.1" class="w-full px-3 py-2 text-xs bg-surface border border-bordercol rounded-xl">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Duration</label>
            <input id="modal-course-duration" type="text" placeholder="10 Weeks" class="w-full px-3 py-2 text-xs bg-surface border border-bordercol rounded-xl">
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Badge (e.g. Bestseller)</label>
            <input id="modal-course-badge" type="text" class="w-full px-3 py-2 text-xs bg-surface border border-bordercol rounded-xl">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Level (Beginner, Advanced)</label>
            <input id="modal-course-level" type="text" class="w-full px-3 py-2 text-xs bg-surface border border-bordercol rounded-xl">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Enrolled Count</label>
            <input id="modal-course-enrolled" type="number" class="w-full px-3 py-2 text-xs bg-surface border border-bordercol rounded-xl">
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Curriculum Highlights (one item per line)</label>
          <textarea id="modal-course-highlights" rows="3" placeholder="LLM Prompt Engineering&#10;Autonomous AI Agents&#10;Full-Stack SaaS Building" class="w-full px-3 py-2 text-xs bg-surface border border-bordercol rounded-xl"></textarea>
        </div>

        <div class="flex items-center gap-2 pt-2">
          <input type="checkbox" id="modal-course-active" checked class="w-4 h-4 text-violet-600 rounded">
          <label for="modal-course-active" class="text-xs font-bold text-slate-700">Publish this course actively on the Academy storefront</label>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-bordercol">
          <button type="button" onclick="closeCourseModal()" class="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-dark">Cancel</button>
          <button type="submit" class="gradient-btn text-white text-xs font-semibold px-5 py-2.5 rounded-xl">Save Masterclass</button>
        </div>
      </form>
    </div>
  </div>

  <!-- TESTIMONIAL EDIT / CREATE MODAL -->
  <div id="testimonial-modal" class="hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl">
      <div class="flex items-center justify-between border-b border-bordercol pb-4">
        <div>
          <h3 id="testimonial-modal-title" class="text-lg font-bold font-heading text-dark">Add Student Review</h3>
          <p class="text-xs text-muted">Showcase verified student achievements and reviews.</p>
        </div>
        <button onclick="closeTestimonialModal()" class="text-slate-400 hover:text-dark p-2"><i data-lucide="x" class="w-5 h-5"></i></button>
      </div>

      <form onsubmit="handleSaveTestimonialForm(event)" class="space-y-4">
        <input type="hidden" id="modal-testimonial-id">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Student Name *</label>
            <input id="modal-testimonial-name" type="text" required class="w-full px-3 py-2 text-xs bg-surface border border-bordercol rounded-xl">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Role / Job Title</label>
            <input id="modal-testimonial-role" type="text" placeholder="AI Specialist, Freelancer" class="w-full px-3 py-2 text-xs bg-surface border border-bordercol rounded-xl">
          </div>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Location</label>
            <input id="modal-testimonial-location" type="text" placeholder="Lahore / Mumbai" class="w-full px-3 py-2 text-xs bg-surface border border-bordercol rounded-xl">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Rating (1-5)</label>
            <input id="modal-testimonial-rating" type="number" min="1" max="5" value="5" class="w-full px-3 py-2 text-xs bg-surface border border-bordercol rounded-xl">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Earning Metric</label>
            <input id="modal-testimonial-metric" type="text" placeholder="$1,800/mo" class="w-full px-3 py-2 text-xs bg-surface border border-bordercol rounded-xl">
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Course Enrolled</label>
          <input id="modal-testimonial-course" type="text" placeholder="Complete AI Mastery Masterclass" class="w-full px-3 py-2 text-xs bg-surface border border-bordercol rounded-xl">
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Review Text *</label>
          <textarea id="modal-testimonial-text" rows="3" required class="w-full px-3 py-2 text-xs bg-surface border border-bordercol rounded-xl"></textarea>
        </div>

        <div class="flex items-center gap-2 pt-2">
          <input type="checkbox" id="modal-testimonial-verified" checked class="w-4 h-4 text-emerald-600 rounded">
          <label for="modal-testimonial-verified" class="text-xs font-bold text-slate-700">Show Verified Student Badge</label>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-bordercol">
          <button type="button" onclick="closeTestimonialModal()" class="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-dark">Cancel</button>
          <button type="submit" class="gradient-btn text-white text-xs font-semibold px-5 py-2.5 rounded-xl">Save Review</button>
        </div>
      </form>
    </div>
  </div>
`;

finalAdmin = finalAdmin.replace('<!-- TOOL MODAL -->', `${newModals}\n  <!-- TOOL MODAL -->`);

// Now add the JS handlers and data loaders in the script block
const newScriptHandlers = `
    window.ADMIN.courses = [];
    window.ADMIN.testimonials = [];
    window.ADMIN.marquee = [];
    window.ADMIN.enrollments = [];
    window.ADMIN.contacts = [];

    // COURSES FUNCTIONS
    function renderCoursesManager() {
      const container = document.getElementById('courses-manager-list');
      if (!container) return;
      if (!window.ADMIN.courses.length) {
        container.innerHTML = '<div class="col-span-2 text-center py-8 text-muted">No masterclasses found.</div>';
        return;
      }

      container.innerHTML = window.ADMIN.courses.map(c => \`
        <div class="bg-white p-6 rounded-2xl border border-bordercol shadow-xs space-y-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-violet-100 text-violet-800 uppercase">\${c.category || 'Masterclass'}</span>
              <h3 class="text-base font-bold text-dark mt-1">\${c.title}</h3>
              <p class="text-xs text-muted line-clamp-2 mt-1">\${c.description}</p>
            </div>
            <div class="text-right flex-shrink-0">
              <span class="text-base font-extrabold text-violet-600">₹\${(c.price || 0).toLocaleString()}</span>
              \${c.original_price ? \`<span class="text-xs text-slate-400 line-through block">₹\${c.original_price.toLocaleString()}</span>\` : ''}
            </div>
          </div>

          <div class="flex items-center gap-4 text-xs text-slate-500 border-t border-slate-100 pt-3">
            <span>⭐ <strong>\${c.rating || '4.9'}</strong></span>
            <span>⏱️ <strong>\${c.duration || '8 Weeks'}</strong></span>
            <span>👥 <strong>\${c.enrolled_count || 120}+ Enrolled</strong></span>
            <span class="ml-auto text-[10px] font-bold px-2 py-0.5 rounded \${c.is_active !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}">
              \${c.is_active !== false ? 'Active' : 'Hidden'}
            </span>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button onclick="editCourse('\${c.id}')" class="text-xs font-semibold text-violet-600 hover:text-violet-800 px-3 py-1.5 rounded-lg bg-violet-50">Edit</button>
            <button onclick="toggleCourseActive('\${c.id}', \${c.is_active === false})" class="text-xs font-semibold text-slate-600 hover:text-dark px-3 py-1.5 rounded-lg bg-slate-100">\${c.is_active !== false ? 'Deactivate' : 'Activate'}</button>
            <button onclick="deleteCourse('\${c.id}')" class="text-xs font-semibold text-rose-600 hover:text-rose-800 px-3 py-1.5 rounded-lg bg-rose-50">Delete</button>
          </div>
        </div>
      \`).join('');
      lucide.createIcons();
    }

    window.openNewCourseModal = function() {
      document.getElementById('course-modal-title').textContent = 'Add New Masterclass';
      document.getElementById('modal-course-id').value = '';
      document.getElementById('modal-course-title').value = '';
      document.getElementById('modal-course-category').value = 'AI Engineering';
      document.getElementById('modal-course-desc').value = '';
      document.getElementById('modal-course-price').value = 4999;
      document.getElementById('modal-course-original').value = 9999;
      document.getElementById('modal-course-rating').value = 4.9;
      document.getElementById('modal-course-duration').value = '8 Weeks';
      document.getElementById('modal-course-badge').value = 'New Masterclass';
      document.getElementById('modal-course-level').value = 'Beginner to Advanced';
      document.getElementById('modal-course-enrolled').value = 100;
      document.getElementById('modal-course-highlights').value = '';
      document.getElementById('modal-course-active').checked = true;
      document.getElementById('course-modal').classList.remove('hidden');
    };

    window.closeCourseModal = function() {
      document.getElementById('course-modal').classList.add('hidden');
    };

    window.editCourse = function(id) {
      const c = window.ADMIN.courses.find(item => item.id === id);
      if (!c) return;
      document.getElementById('course-modal-title').textContent = 'Edit Masterclass';
      document.getElementById('modal-course-id').value = c.id;
      document.getElementById('modal-course-title').value = c.title || '';
      document.getElementById('modal-course-category').value = c.category || '';
      document.getElementById('modal-course-desc').value = c.description || '';
      document.getElementById('modal-course-price').value = c.price || 0;
      document.getElementById('modal-course-original').value = c.original_price || 0;
      document.getElementById('modal-course-rating').value = c.rating || 4.9;
      document.getElementById('modal-course-duration').value = c.duration || '';
      document.getElementById('modal-course-badge').value = c.badge || '';
      document.getElementById('modal-course-level').value = c.level || '';
      document.getElementById('modal-course-enrolled').value = c.enrolled_count || 0;
      document.getElementById('modal-course-highlights').value = (c.highlights || []).join('\\n');
      document.getElementById('modal-course-active').checked = c.is_active !== false;
      document.getElementById('course-modal').classList.remove('hidden');
    };

    window.handleSaveCourseForm = async function(e) {
      e.preventDefault();
      const id = document.getElementById('modal-course-id').value;
      const rawHighlights = document.getElementById('modal-course-highlights').value;
      const highlights = rawHighlights.split('\\n').map(h => h.trim()).filter(Boolean);

      const payload = {
        title: document.getElementById('modal-course-title').value.trim(),
        category: document.getElementById('modal-course-category').value.trim(),
        description: document.getElementById('modal-course-desc').value.trim(),
        price: Number(document.getElementById('modal-course-price').value) || 0,
        original_price: Number(document.getElementById('modal-course-original').value) || 0,
        rating: Number(document.getElementById('modal-course-rating').value) || 4.9,
        duration: document.getElementById('modal-course-duration').value.trim(),
        badge: document.getElementById('modal-course-badge').value.trim(),
        level: document.getElementById('modal-course-level').value.trim(),
        enrolled_count: Number(document.getElementById('modal-course-enrolled').value) || 0,
        highlights,
        is_active: document.getElementById('modal-course-active').checked,
      };

      try {
        if (id) {
          await req(\`/admin/courses/\${id}\`, { method: 'PUT', body: JSON.stringify(payload) });
          showToast('Masterclass updated successfully!', 'success');
        } else {
          await req('/admin/courses', { method: 'POST', body: JSON.stringify(payload) });
          showToast('Masterclass added successfully!', 'success');
        }
        closeCourseModal();
        loadAllAdminData();
      } catch (err) {
        showToast('Error saving course: ' + err.message, 'error');
      }
    };

    window.toggleCourseActive = async function(id, is_active) {
      try {
        await req(\`/admin/courses/\${id}\`, { method: 'PUT', body: JSON.stringify({ is_active }) });
        showToast('Course status updated!', 'success');
        loadAllAdminData();
      } catch (err) {
        showToast('Error: ' + err.message, 'error');
      }
    };

    window.deleteCourse = async function(id) {
      if (!confirm('Are you sure you want to delete this masterclass?')) return;
      try {
        await req(\`/admin/courses/\${id}\`, { method: 'DELETE' });
        showToast('Course deleted', 'info');
        loadAllAdminData();
      } catch (err) {
        showToast('Delete error: ' + err.message, 'error');
      }
    };

    // TESTIMONIALS FUNCTIONS
    function renderTestimonialsManager() {
      const container = document.getElementById('testimonials-manager-list');
      if (!container) return;
      if (!window.ADMIN.testimonials.length) {
        container.innerHTML = '<div class="col-span-2 text-center py-8 text-muted">No student reviews found.</div>';
        return;
      }

      container.innerHTML = window.ADMIN.testimonials.map(t => \`
        <div class="bg-white p-6 rounded-2xl border border-bordercol shadow-xs space-y-4">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-violet-100 text-violet-700 font-bold flex items-center justify-center text-sm">\${t.name.split(' ').map(n=>n[0]).join('').slice(0,2)}</div>
              <div>
                <h4 class="text-sm font-bold text-dark flex items-center gap-1.5">
                  <span>\${t.name}</span>
                  \${t.verified !== false ? '<i data-lucide="check-circle" class="w-3.5 h-3.5 text-emerald-500"></i>' : ''}
                </h4>
                <p class="text-xs text-muted">\${t.role} · \${t.location || 'Student'}</p>
              </div>
            </div>
            <span class="text-xs font-bold text-amber-500">★ \${t.rating || 5}.0</span>
          </div>

          <p class="text-xs text-slate-600 italic">"\${t.text}"</p>

          <div class="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-3">
            <span class="font-medium text-brand-700">\${t.course || 'Academy Masterclass'}</span>
            \${t.earnings_metric ? \`<span class="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">\${t.earnings_metric}</span>\` : ''}
          </div>

          <div class="flex justify-end gap-2 border-t border-slate-100 pt-2">
            <button onclick="editTestimonial('\${t.id}')" class="text-xs font-semibold text-violet-600 hover:text-violet-800 px-3 py-1.5 rounded-lg bg-violet-50">Edit</button>
            <button onclick="deleteTestimonial('\${t.id}')" class="text-xs font-semibold text-rose-600 hover:text-rose-800 px-3 py-1.5 rounded-lg bg-rose-50">Delete</button>
          </div>
        </div>
      \`).join('');
      lucide.createIcons();
    }

    window.openNewTestimonialModal = function() {
      document.getElementById('testimonial-modal-title').textContent = 'Add Student Review';
      document.getElementById('modal-testimonial-id').value = '';
      document.getElementById('modal-testimonial-name').value = '';
      document.getElementById('modal-testimonial-role').value = '';
      document.getElementById('modal-testimonial-location').value = '';
      document.getElementById('modal-testimonial-rating').value = 5;
      document.getElementById('modal-testimonial-metric').value = '';
      document.getElementById('modal-testimonial-course').value = '';
      document.getElementById('modal-testimonial-text').value = '';
      document.getElementById('modal-testimonial-verified').checked = true;
      document.getElementById('testimonial-modal').classList.remove('hidden');
    };

    window.closeTestimonialModal = function() {
      document.getElementById('testimonial-modal').classList.add('hidden');
    };

    window.editTestimonial = function(id) {
      const t = window.ADMIN.testimonials.find(item => item.id === id);
      if (!t) return;
      document.getElementById('testimonial-modal-title').textContent = 'Edit Student Review';
      document.getElementById('modal-testimonial-id').value = t.id;
      document.getElementById('modal-testimonial-name').value = t.name || '';
      document.getElementById('modal-testimonial-role').value = t.role || '';
      document.getElementById('modal-testimonial-location').value = t.location || '';
      document.getElementById('modal-testimonial-rating').value = t.rating || 5;
      document.getElementById('modal-testimonial-metric').value = t.earnings_metric || '';
      document.getElementById('modal-testimonial-course').value = t.course || '';
      document.getElementById('modal-testimonial-text').value = t.text || '';
      document.getElementById('modal-testimonial-verified').checked = t.verified !== false;
      document.getElementById('testimonial-modal').classList.remove('hidden');
    };

    window.handleSaveTestimonialForm = async function(e) {
      e.preventDefault();
      const id = document.getElementById('modal-testimonial-id').value;
      const payload = {
        name: document.getElementById('modal-testimonial-name').value.trim(),
        role: document.getElementById('modal-testimonial-role').value.trim(),
        location: document.getElementById('modal-testimonial-location').value.trim(),
        rating: Number(document.getElementById('modal-testimonial-rating').value) || 5,
        earnings_metric: document.getElementById('modal-testimonial-metric').value.trim(),
        course: document.getElementById('modal-testimonial-course').value.trim(),
        text: document.getElementById('modal-testimonial-text').value.trim(),
        verified: document.getElementById('modal-testimonial-verified').checked,
      };

      try {
        if (id) {
          await req(\`/admin/testimonials/\${id}\`, { method: 'PUT', body: JSON.stringify(payload) });
          showToast('Student review updated!', 'success');
        } else {
          await req('/admin/testimonials', { method: 'POST', body: JSON.stringify(payload) });
          showToast('Student review created!', 'success');
        }
        closeTestimonialModal();
        loadAllAdminData();
      } catch (err) {
        showToast('Error saving review: ' + err.message, 'error');
      }
    };

    window.deleteTestimonial = async function(id) {
      if (!confirm('Delete this review?')) return;
      try {
        await req(\`/admin/testimonials/\${id}\`, { method: 'DELETE' });
        showToast('Review deleted', 'info');
        loadAllAdminData();
      } catch (err) {
        showToast('Delete error: ' + err.message, 'error');
      }
    };

    // MARQUEE & VIDEO SETTINGS
    function renderMarqueeManager() {
      const container = document.getElementById('marquee-items-list');
      if (!container) return;
      container.innerHTML = window.ADMIN.marquee.map((item, idx) => \`
        <div class="flex items-center gap-3 p-3 bg-surface rounded-xl border border-bordercol">
          <input type="text" value="\${item}" class="marquee-input flex-grow px-3 py-2 text-xs bg-white border border-bordercol rounded-lg font-medium">
          <button onclick="removeMarqueeRow(\${idx})" class="text-rose-500 hover:text-rose-700 p-1.5"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
        </div>
      \`).join('');
      lucide.createIcons();
    }

    window.addMarqueeRow = function() {
      window.ADMIN.marquee.push('✨ New Announcement Item');
      renderMarqueeManager();
    };

    window.removeMarqueeRow = function(idx) {
      window.ADMIN.marquee.splice(idx, 1);
      renderMarqueeManager();
    };

    window.handleSaveMarqueeItems = async function() {
      const inputs = document.querySelectorAll('.marquee-input');
      const items = Array.from(inputs).map(inp => inp.value.trim()).filter(Boolean);
      try {
        await req('/admin/marquee', { method: 'PUT', body: JSON.stringify({ items }) });
        showToast('Marquee items saved!', 'success');
        loadAllAdminData();
      } catch (err) {
        showToast('Error saving marquee: ' + err.message, 'error');
      }
    };

    window.handleSaveVideoSettings = async function(e) {
      e.preventDefault();
      const payload = {
        video_title: document.getElementById('setting-video_title').value.trim(),
        video_subtitle: document.getElementById('setting-video_subtitle').value.trim(),
        video_url: document.getElementById('setting-video_url').value.trim(),
        video_script_english: document.getElementById('setting-video_script_english').value.trim(),
        video_script_urdu: document.getElementById('setting-video_script_urdu').value.trim(),
      };

      try {
        await req('/admin/settings', { method: 'PUT', body: JSON.stringify(payload) });
        showToast('Founder video settings updated!', 'success');
        loadAllAdminData();
      } catch (err) {
        showToast('Error: ' + err.message, 'error');
      }
    };

    // ENROLLMENTS & CONTACTS
    function renderEnrollmentsAndContacts() {
      const enrollTbody = document.getElementById('enrollments-table-body');
      const countBadge = document.getElementById('enrollments-count-badge');
      if (enrollTbody && countBadge) {
        countBadge.textContent = \`\${window.ADMIN.enrollments.length} records\`;
        if (window.ADMIN.enrollments.length === 0) {
          enrollTbody.innerHTML = '<tr><td colspan="7" class="py-6 text-center text-muted">No student enrollments yet.</td></tr>';
        } else {
          enrollTbody.innerHTML = window.ADMIN.enrollments.map(e => \`
            <tr class="hover:bg-slate-50">
              <td class="py-3 px-4 font-semibold text-dark">\${e.student_name || 'Anonymous'}<div class="text-[10px] text-muted">\${e.student_email || ''}</div></td>
              <td class="py-3 px-4 text-slate-600">\${e.student_phone || '--'}</td>
              <td class="py-3 px-4 font-medium text-brand-700">\${e.course_title || e.course_id}</td>
              <td class="py-3 px-4 font-bold text-dark">₹\${(e.amount || 0).toLocaleString()}</td>
              <td class="py-3 px-4 uppercase text-[10px] font-bold text-slate-500">\${e.payment_method || 'UPI / Razorpay'}</td>
              <td class="py-3 px-4"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">\${e.status || 'Active'}</span></td>
              <td class="py-3 px-4 text-slate-400 text-[10px]">\${e.created_at ? new Date(e.created_at).toLocaleDateString() : '--'}</td>
            </tr>
          \`).join('');
        }
      }

      const contactsTbody = document.getElementById('contacts-table-body');
      const contactBadge = document.getElementById('contacts-count-badge');
      if (contactsTbody && contactBadge) {
        contactBadge.textContent = \`\${window.ADMIN.contacts.length} records\`;
        if (window.ADMIN.contacts.length === 0) {
          contactsTbody.innerHTML = '<tr><td colspan="5" class="py-6 text-center text-muted">No contact inquiries yet.</td></tr>';
        } else {
          contactsTbody.innerHTML = window.ADMIN.contacts.map(c => \`
            <tr class="hover:bg-slate-50">
              <td class="py-3 px-4 font-semibold text-dark">\${c.name}</td>
              <td class="py-3 px-4 text-slate-600">\${c.email}</td>
              <td class="py-3 px-4 font-medium text-brand-700">\${c.subject || '--'}</td>
              <td class="py-3 px-4 text-slate-600 max-w-xs truncate">\${c.message}</td>
              <td class="py-3 px-4 text-slate-400 text-[10px]">\${c.created_at ? new Date(c.created_at).toLocaleDateString() : '--'}</td>
            </tr>
          \`).join('');
        }
      }
    }
`;

// Update `loadAllAdminData` to load courses, testimonials, marquee, enrollments, contacts
const updatedLoadAllAdminData = `
    async function loadAllAdminData() {
      try {
        const [articles, tools, topics, settings, courses, testimonials, marquee, enrollments, contacts] = await Promise.all([
          req('/admin/articles'),
          req('/admin/tools'),
          req('/admin/topics'),
          req('/admin/settings'),
          req('/admin/courses').catch(() => []),
          req('/admin/testimonials').catch(() => []),
          req('/admin/marquee').catch(() => ({ items: [] })),
          req('/admin/enrollments').catch(() => []),
          req('/admin/contacts').catch(() => []),
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

        renderOverview();
        renderArticlesTable();
        renderToolsManager();
        renderTopicsManager();
        renderCoursesManager();
        renderTestimonialsManager();
        renderMarqueeManager();
        renderEnrollmentsAndContacts();
        populateSettingsForm();
      } catch (err) {
        showToast('Error loading admin state: ' + err.message, 'error');
      }
    }
`;

finalAdmin = finalAdmin.replace(/async function loadAllAdminData\(\) \{[\s\S]*?\n    \}/, updatedLoadAllAdminData);

// Update renderOverview to show metric counts
finalAdmin = finalAdmin.replace(
  `document.getElementById('metric-topics-count').textContent = window.ADMIN.topics.length;`,
  `document.getElementById('metric-topics-count').textContent = window.ADMIN.topics.length;
      if (document.getElementById('metric-courses-count')) document.getElementById('metric-courses-count').textContent = window.ADMIN.courses.length;
      if (document.getElementById('metric-reviews-count')) document.getElementById('metric-reviews-count').textContent = window.ADMIN.testimonials.length;`
);

// Update populateSettingsForm to load video settings
finalAdmin = finalAdmin.replace(
  `document.getElementById('setting-footer_text').value = s.footer_text || '';`,
  `document.getElementById('setting-footer_text').value = s.footer_text || '';
      if (document.getElementById('setting-video_title')) document.getElementById('setting-video_title').value = s.video_title || '';
      if (document.getElementById('setting-video_subtitle')) document.getElementById('setting-video_subtitle').value = s.video_subtitle || '';
      if (document.getElementById('setting-video_url')) document.getElementById('setting-video_url').value = s.video_url || '';
      if (document.getElementById('setting-video_script_english')) document.getElementById('setting-video_script_english').value = s.video_script_english || '';
      if (document.getElementById('setting-video_script_urdu')) document.getElementById('setting-video_script_urdu').value = s.video_script_urdu || '';`
);

// Inject newScriptHandlers right before `// PASSWORD`
finalAdmin = finalAdmin.replace('// PASSWORD', `${newScriptHandlers}\n    // PASSWORD`);

fs.writeFileSync(path.resolve('public/admin.html'), finalAdmin, 'utf8');
fs.writeFileSync(path.resolve('admin.html'), finalAdmin, 'utf8');
console.log('Successfully generated public/admin.html and admin.html with Academy management tabs');

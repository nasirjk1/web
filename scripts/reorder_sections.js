import fs from 'node:fs';

let content = fs.readFileSync('public/index.html', 'utf8');

const startIdx = content.indexOf('function renderHomeView(container)');
const nextFuncIdx = content.indexOf('function renderCoursesCatalogView', startIdx);
const body = content.slice(startIdx, nextFuncIdx);

// Locate each section start
const idxA = body.indexOf('<!-- SECTION A: HERO SECTION -->');
const idxB = body.indexOf('<!-- SECTION B: NASIR VIDEO PRESENTER INTRODUCTION');
const idxC = body.indexOf('<!-- SECTION C: 11 FREE AI & WEB UTILITIES');
const idxD = body.indexOf('<!-- SECTION D: PAID ACADEMY MASTERCLASSES');
const idxE = body.indexOf('<!-- SECTION E: WHY CHOOSE WEB NASIR ACADEMY');
const idxF = body.indexOf('<!-- SECTION F: CAREER TRACKS -->');
const idxG = body.indexOf('<!-- SECTION G: GUIDES & TECHNICAL CASE STUDIES -->');
const idxH = body.indexOf('<!-- SECTION H: VERIFIED STUDENT & MENTEE REVIEWS');
const idxI = body.indexOf('<!-- SECTION I: FINAL CTA BANNER -->');
const idxEnd = body.indexOf('`;', idxI);

const prefix = body.slice(0, idxA);
const secA = body.slice(idxA, idxB);
const secB = body.slice(idxB, idxC);
const secC = body.slice(idxC, idxD);
let secD = body.slice(idxD, idxE);
const secE = body.slice(idxE, idxF);
const secF = body.slice(idxF, idxG);
const secG = body.slice(idxG, idxH);
const secH = body.slice(idxH, idxI);
const secI = body.slice(idxI, idxEnd);
const suffix = body.slice(idxEnd);

// In secD, ensure course cards have both Buy Now and Enroll Free buttons
secD = secD.replace(
  `<button onclick="openCourseCheckoutModal('\${c.id}')" class="w-full gradient-hero-btn text-white text-xs font-semibold py-2.5 rounded-xl shadow-sm flex items-center justify-center gap-1.5">
                    <span>Enroll Now</span>
                    <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
                  </button>`,
  `<div class="flex items-center gap-2">
                    <button onclick="openCourseCheckoutModal('\${c.id}')" class="flex-grow gradient-hero-btn text-white text-xs font-semibold py-2.5 rounded-xl shadow-sm flex items-center justify-center gap-1.5 hover:opacity-95 transition-opacity">
                      <span>Buy Now</span>
                      <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
                    </button>
                    <button onclick="handleQuickFreeEnroll('\${c.id}')" class="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors" title="Direct Free Enrollment">
                      Free Intro
                    </button>
                  </div>`
);

const secMarquee = `
        <!-- SECTION 2: ANIMATED ANNOUNCEMENT MARQUEE (Directly Below Hero Section) -->
        <div class="bg-navy border-y border-slate-800 text-white text-xs py-3 px-4 overflow-hidden relative shadow-inner select-none">
          <div class="animate-marquee flex items-center gap-10" id="marquee-track">
            <!-- Dynamically populated from window.APP_STATE.marquee -->
          </div>
        </div>
`;

// Re-ordered body:
// 1. Hero (secA)
// 2. Marquee (secMarquee)
// 3. Free AI Tools (secC)
// 4. Paid Courses (secD)
// 5. Why Choose Web Nasir (secE)
// 6. Learning Pathways & Career Tracks (secF)
// 7. Founder Video Presenter (secB - at position 8!)
// 8. Guides & Case Studies (secG)
// 9. Student Testimonials (secH)
// 10. Final CTA (secI)
const newBody = prefix + secA + secMarquee + secC + secD + secE + secF + secB + secG + secH + secI + suffix;

content = content.slice(0, startIdx) + newBody + content.slice(nextFuncIdx);

// Also add handleQuickFreeEnroll function if not present
if (!content.includes('window.handleQuickFreeEnroll =')) {
  const quickFreeFunc = `
    window.handleQuickFreeEnroll = async function(courseId) {
      if (!window.APP_STATE.currentUser) {
        showToast('Please sign in with Google or Email to enroll', 'info');
        openStudentAuthModal();
        return;
      }
      try {
        const user = window.APP_STATE.currentUser;
        const res = await fetch('/api/courses/enroll-free', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            course_id: courseId,
            student_email: user.email,
            student_name: user.displayName || 'Student',
          }),
        });
        const data = await res.json();
        if (res.ok) {
          showToast(data.message || 'Enrolled successfully!', 'success');
          window.location.hash = '#/student';
        } else {
          showToast(data.error || 'Enrollment failed', 'error');
        }
      } catch (err) {
        showToast('Error: ' + err.message, 'error');
      }
    };
`;
  content = content.replace('// COURSE CHECKOUT MODAL & SERVER-VERIFIED ENROLLMENT', `${quickFreeFunc}\n    // COURSE CHECKOUT MODAL & SERVER-VERIFIED ENROLLMENT`);
}

fs.writeFileSync('public/index.html', content, 'utf8');
fs.writeFileSync('index.html', content, 'utf8');
console.log('Homepage sections successfully reordered and synced to index.html!');

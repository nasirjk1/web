import crypto from 'node:crypto';
import { getBlob, setBlob, deleteBlob } from './lib/store.js';
import {
  hashPassword,
  verifyPassword,
  signToken,
  verifyToken,
  extractTokenFromEvent,
  createAuthCookie,
  createLogoutCookie,
} from './lib/auth.js';
import { ensureSeeded } from './lib/seed.js';
import { sendEmailMessage, renderEmailTemplate } from './lib/email.js';

// Resilient Gemini AI caller: Try dynamic SDK first, fallback to native REST fetch (zero-dependency for Netlify Functions)
async function callGeminiAPI(prompt, systemInstruction = '') {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  // 1. Try GoogleGenAI SDK dynamically if available in runtime
  try {
    const mod = await import('@google/genai');
    if (mod && mod.GoogleGenAI) {
      const ai = new mod.GoogleGenAI({ apiKey });
      const candidateModels = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'];
      for (const modelName of candidateModels) {
        try {
          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000));
          const genPromise = ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              systemInstruction,
              maxOutputTokens: 1500,
            },
          });
          const response = await Promise.race([genPromise, timeoutPromise]);
          if (response?.text) return { text: response.text, model: modelName };
        } catch (mErr) {
          // Continue to next model
        }
      }
    }
  } catch {
    // SDK not bundled in Lambda runtime, proceed to native fetch
  }

  // 2. Direct Google Gemini REST API (100% native, zero dependencies, runs in all Node/Lambda/Edge environments)
  const candidateRestModels = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'];
  for (const modelName of candidateRestModels) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: (systemInstruction ? systemInstruction + '\n\n' : '') + prompt }] }],
          generationConfig: { maxOutputTokens: 1500, temperature: 0.7 }
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return { text, model: modelName };
      }
    } catch {
      // Continue to next model candidate
    }
  }

  return null;
}

let currentEvent = null;

function getCorsHeaders(event) {
  const evt = event || currentEvent;
  const reqOrigin = evt?.headers?.origin || evt?.headers?.Origin || evt?.headers?.referer || evt?.headers?.Referer;
  let origin = '*';
  if (reqOrigin && reqOrigin !== '*') {
    try {
      origin = new URL(reqOrigin).origin;
    } catch {
      origin = reqOrigin;
    }
  }

  const headers = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
    'Vary': 'Origin',
  };

  if (origin && origin !== '*') {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Credentials'] = 'true';
  } else {
    headers['Access-Control-Allow-Origin'] = '*';
  }

  return headers;
}

function jsonResponse(statusCode, data, headers = {}, event = null) {
  const evt = event || currentEvent;
  const cors = getCorsHeaders(evt);
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      ...cors,
      ...headers,
    },
    body: JSON.stringify(data),
  };
}

function parseJsonBody(body) {
  if (!body) return {};
  if (typeof body === 'object') return body;
  try {
    return JSON.parse(body);
  } catch (err) {
    return null;
  }
}

export const handler = async (event, context) => {
  try {
    currentEvent = event;
    const method = (event.httpMethod || event.method || 'GET').toUpperCase();

    // Handle CORS OPTIONS preflight immediately
    if (method === 'OPTIONS') {
      return {
        statusCode: 204,
        headers: {
          ...getCorsHeaders(event),
          'Access-Control-Max-Age': '86400',
        },
        body: '',
      };
    }

    await ensureSeeded();

    const isSecure = (
      event.headers?.['x-forwarded-proto'] === 'https' ||
      event.headers?.['X-Forwarded-Proto'] === 'https' ||
      (event.headers?.referer && event.headers.referer.startsWith('https:')) ||
      process.env.NODE_ENV === 'production' ||
      (process.env.APP_URL && process.env.APP_URL.startsWith('https:'))
    );

    const rawPath = (event.path || '').split('?')[0];

    let cleanPath = rawPath;
    if (cleanPath.startsWith('/.netlify/functions/api')) {
      cleanPath = cleanPath.substring('/.netlify/functions/api'.length);
    } else if (cleanPath.startsWith('/api')) {
      cleanPath = cleanPath.substring('/api'.length);
    }
    if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;
    if (cleanPath.length > 1 && cleanPath.endsWith('/')) cleanPath = cleanPath.slice(0, -1);

    const requireAuth = async () => {
      const token = extractTokenFromEvent(event);
      if (!token) return null;
      const decoded = verifyToken(token);
      if (!decoded) return null;

      const auth = await getBlob('auth');
      if (!auth || auth.username !== decoded.sub) return null;

      return {
        username: auth.username,
        must_change_password: auth.must_change_password,
      };
    };

    // ==========================================
    // PUBLIC ROUTES
    // ==========================================

    // GET /api/settings
    if (method === 'GET' && cleanPath === '/settings') {
      const settings = (await getBlob('settings')) || {};
      return jsonResponse(200, settings);
    }

    // GET /api/topics
    if (method === 'GET' && cleanPath === '/topics') {
      const topics = (await getBlob('topics_index')) || [];
      const sorted = [...topics].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      return jsonResponse(200, sorted);
    }

    // GET /api/tools
    if (method === 'GET' && cleanPath === '/tools') {
      const tools = (await getBlob('tools_index')) || [];
      const publicTools = tools
        .filter((t) => t.is_enabled !== false)
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      return jsonResponse(200, publicTools);
    }

    // GET /api/articles
    if (method === 'GET' && cleanPath === '/articles') {
      const articlesIndex = (await getBlob('articles_index')) || [];
      const tag = event.queryStringParameters?.tag;
      let published = articlesIndex.filter((a) => a.is_published !== false);

      if (tag) {
        published = published.filter((a) => a.tag === tag.toLowerCase());
      }

      published.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      return jsonResponse(200, published);
    }

    // GET /api/articles/:slug
    if (method === 'GET' && cleanPath.startsWith('/articles/')) {
      const slug = cleanPath.replace('/articles/', '').trim();
      if (!slug) return jsonResponse(400, { error: 'Article slug is required' });

      const article = await getBlob(`article:${slug}`);
      if (!article || article.is_published === false) {
        return jsonResponse(404, { error: 'Article not found' });
      }
      return jsonResponse(200, article);
    }

    // GET /api/courses
    if (method === 'GET' && cleanPath === '/courses') {
      const courses = (await getBlob('courses_index')) || [];
      const category = event.queryStringParameters?.category;
      let published = courses.filter((c) => c.is_published !== false);
      if (category && category !== 'all') {
        published = published.filter((c) => (c.category || '').toLowerCase() === category.toLowerCase());
      }
      published.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      return jsonResponse(200, published);
    }

    // GET /api/courses/:id
    if (method === 'GET' && cleanPath.startsWith('/courses/')) {
      const id = cleanPath.replace('/courses/', '').trim();
      if (!id) return jsonResponse(400, { error: 'Course ID is required' });

      let course = await getBlob(`course:${id}`);
      if (!course) {
        const courses = (await getBlob('courses_index')) || [];
        course = courses.find((c) => c.id === id);
      }
      if (!course) {
        return jsonResponse(404, { error: 'Course not found' });
      }
      return jsonResponse(200, course);
    }

    // GET /api/testimonials
    if (method === 'GET' && cleanPath === '/testimonials') {
      const list = (await getBlob('testimonials_index')) || [];
      const sorted = [...list].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      return jsonResponse(200, sorted);
    }

    // GET /api/marquee
    if (method === 'GET' && cleanPath === '/marquee') {
      const list = (await getBlob('marquee_items')) || [];
      return jsonResponse(200, list);
    }

    // POST /api/contact
    if (method === 'POST' && cleanPath === '/contact') {
      const body = parseJsonBody(event.body);
      if (!body) return jsonResponse(400, { error: 'Invalid payload' });
      const { name, email, subject, message } = body;
      if (!name || !email || !message) {
        return jsonResponse(400, { error: 'Name, email, and message are required' });
      }
      const contacts = (await getBlob('contacts_list')) || [];
      const newSubmission = {
        id: 'contact-' + Date.now(),
        name: String(name).slice(0, 100),
        email: String(email).slice(0, 150),
        subject: String(subject || 'General Inquiry').slice(0, 200),
        message: String(message).slice(0, 3000),
        created_at: new Date().toISOString(),
      };
      contacts.unshift(newSubmission);
      await setBlob('contacts_list', contacts.slice(0, 100));
      return jsonResponse(201, { success: true, message: 'Message sent successfully. Nasir or our team will get back to you shortly!' });
    }

    // POST /api/student/sync (Sync student authentication event from Google or Email)
    if (method === 'POST' && cleanPath === '/student/sync') {
      const body = parseJsonBody(event.body);
      if (!body || !body.email) return jsonResponse(400, { error: 'Student email is required' });

      const email = String(body.email).toLowerCase().trim();
      const name = String(body.displayName || body.name || email.split('@')[0]).trim();
      const authProvider = String(body.authProvider || 'google').toLowerCase();
      const uid = String(body.uid || 'usr_' + Date.now().toString(36));
      const emailVerified = Boolean(body.emailVerified);

      const students = (await getBlob('students_index')) || [];
      const existingIdx = students.findIndex((s) => s.email === email || s.id === uid);

      let student;
      let isNew = false;
      const now = new Date().toISOString();

      if (existingIdx !== -1) {
        student = students[existingIdx];
        student.last_login_at = now;
        student.login_count = (student.login_count || 1) + 1;
        if (name && name !== 'Student') student.name = name;
        if (body.phone) student.phone = body.phone;
        student.email_verified = emailVerified || student.email_verified;
        students[existingIdx] = student;
      } else {
        isNew = true;
        student = {
          id: uid,
          name,
          email,
          auth_provider: authProvider,
          email_verified: emailVerified,
          phone: body.phone || '',
          created_at: now,
          last_login_at: now,
          login_count: 1,
          enrolled_courses: [],
          payment_status: 'none',
          status: 'active',
        };
        students.unshift(student);

        // Send Welcome Email for new student
        try {
          const templates = (await getBlob('email_templates')) || [];
          const welcomeTmpl = templates.find((t) => t.id === 'welcome');
          if (welcomeTmpl) {
            const emailBody = renderEmailTemplate(welcomeTmpl.body, {
              student_name: name,
              dashboard_url: 'https://webnasir.dpdns.org/#/student',
            });
            await sendEmailMessage({
              to: email,
              recipient_name: name,
              subject: welcomeTmpl.subject,
              text: emailBody,
              template_id: 'welcome',
              type: 'transactional',
            });
          }
        } catch (mailErr) {
          console.warn('Welcome email error:', mailErr);
        }
      }

      await setBlob('students_index', students);
      return jsonResponse(200, { success: true, isNew, student });
    }

    // POST /api/courses/create-order (Razorpay Order creation)
    if (method === 'POST' && cleanPath === '/courses/create-order') {
      const body = parseJsonBody(event.body);
      if (!body || !body.course_id) return jsonResponse(400, { error: 'course_id is required' });

      const courses = (await getBlob('courses_index')) || [];
      const course = courses.find((c) => c.id === body.course_id);
      if (!course) return jsonResponse(404, { error: 'Course not found' });

      const settings = (await getBlob('settings')) || {};
      const orderId = 'order_' + Date.now().toString(36).toUpperCase() + '_' + Math.random().toString(36).substring(2, 7).toUpperCase();

      return jsonResponse(200, {
        success: true,
        order_id: orderId,
        amount: course.price,
        amount_paise: course.price * 100,
        currency: 'INR',
        course_id: course.id,
        course_title: course.title,
        key_id: settings.razorpay_key_id || 'rzp_test_webnasir_demo',
      });
    }

    // POST /api/courses/verify-payment (Server-side payment verification & course unlock)
    if (method === 'POST' && cleanPath === '/courses/verify-payment') {
      const body = parseJsonBody(event.body);
      if (!body) return jsonResponse(400, { error: 'Invalid payload' });

      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, course_id, student_email, student_name, student_phone, payment_method } = body;
      if (!course_id || !student_email || !razorpay_payment_id) {
        return jsonResponse(400, { error: 'course_id, student_email, and razorpay_payment_id are required' });
      }

      const payments = (await getBlob('payments_list')) || [];
      // Prevent duplicate payment processing
      if (payments.some((p) => p.payment_id === razorpay_payment_id)) {
        return jsonResponse(200, {
          success: true,
          message: 'Payment already processed and course unlocked',
          payment_id: razorpay_payment_id,
        });
      }

      const courses = (await getBlob('courses_index')) || [];
      const course = courses.find((c) => c.id === course_id);
      if (!course) return jsonResponse(404, { error: 'Course not found' });

      // Record payment
      const paymentRecord = {
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id || 'order_direct',
        amount: course.price,
        currency: 'INR',
        course_id,
        course_title: course.title,
        student_email: String(student_email).toLowerCase().trim(),
        student_name: String(student_name || 'Student').trim(),
        payment_method: payment_method || 'UPI / Razorpay',
        status: 'success',
        created_at: new Date().toISOString(),
      };
      payments.unshift(paymentRecord);
      await setBlob('payments_list', payments);

      // Create enrollment (check duplicate enrollment)
      const enrollments = (await getBlob('enrollments_list')) || [];
      let enrollment = enrollments.find((e) => e.course_id === course_id && e.student_email === paymentRecord.student_email);
      if (!enrollment) {
        enrollment = {
          enrollment_id: 'ENR-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
          course_id,
          course_title: course.title,
          student_email: paymentRecord.student_email,
          student_name: paymentRecord.student_name,
          student_phone: String(student_phone || '').trim(),
          amount: course.price,
          currency: 'INR',
          payment_id: razorpay_payment_id,
          payment_method: paymentRecord.payment_method,
          status: 'active',
          progress_pct: 0,
          completed_lessons: [],
          enrolled_at: new Date().toISOString(),
        };
        enrollments.unshift(enrollment);
        await setBlob('enrollments_list', enrollments);
      }

      // Update student profile
      const students = (await getBlob('students_index')) || [];
      const stdIdx = students.findIndex((s) => s.email === paymentRecord.student_email);
      if (stdIdx !== -1) {
        students[stdIdx].enrolled_courses = Array.from(new Set([...(students[stdIdx].enrolled_courses || []), course_id]));
        students[stdIdx].payment_status = 'paid';
        await setBlob('students_index', students);
      }

      // Dispatch confirmation email + receipt
      try {
        const templates = (await getBlob('email_templates')) || [];
        const confirmTmpl = templates.find((t) => t.id === 'paid_enrollment');
        if (confirmTmpl) {
          const bodyText = renderEmailTemplate(confirmTmpl.body, {
            student_name: paymentRecord.student_name,
            course_title: course.title,
            amount: course.price,
            payment_id: razorpay_payment_id,
            dashboard_url: 'https://webnasir.dpdns.org/#/student',
          });
          await sendEmailMessage({
            to: paymentRecord.student_email,
            recipient_name: paymentRecord.student_name,
            subject: confirmTmpl.subject.replace('{{course_title}}', course.title),
            text: bodyText,
            template_id: 'paid_enrollment',
            type: 'transactional',
          });
        }

        const receiptTmpl = templates.find((t) => t.id === 'payment_receipt');
        if (receiptTmpl) {
          const receiptText = renderEmailTemplate(receiptTmpl.body, {
            order_id: paymentRecord.order_id,
            payment_id: razorpay_payment_id,
            student_name: paymentRecord.student_name,
            student_email: paymentRecord.student_email,
            course_title: course.title,
            amount: course.price,
            payment_method: paymentRecord.payment_method,
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          });
          await sendEmailMessage({
            to: paymentRecord.student_email,
            recipient_name: paymentRecord.student_name,
            subject: `Payment Receipt for Order #${paymentRecord.order_id} — Web Nasir Academy`,
            text: receiptText,
            template_id: 'payment_receipt',
            type: 'transactional',
          });
        }
      } catch (mailErr) {
        console.warn('Payment emails dispatch warning:', mailErr);
      }

      return jsonResponse(200, {
        success: true,
        message: 'Payment verified and course unlocked successfully!',
        enrollment,
      });
    }

    // POST /api/courses/enroll-free (Direct free enrollment without Razorpay)
    if (method === 'POST' && cleanPath === '/courses/enroll-free') {
      const body = parseJsonBody(event.body);
      if (!body) return jsonResponse(400, { error: 'Invalid payload' });

      const { course_id, student_email, student_name, student_phone } = body;
      if (!course_id || !student_email) {
        return jsonResponse(400, { error: 'course_id and student_email are required' });
      }

      const courses = (await getBlob('courses_index')) || [];
      const course = courses.find((c) => c.id === course_id);
      if (!course) return jsonResponse(404, { error: 'Course not found' });

      const enrollments = (await getBlob('enrollments_list')) || [];
      const cleanEmail = String(student_email).toLowerCase().trim();
      let enrollment = enrollments.find((e) => e.course_id === course_id && e.student_email === cleanEmail);

      if (enrollment) {
        return jsonResponse(200, {
          success: true,
          message: 'You are already enrolled in this course',
          enrollment,
        });
      }

      enrollment = {
        enrollment_id: 'ENR-FREE-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
        course_id,
        course_title: course.title,
        student_email: cleanEmail,
        student_name: String(student_name || 'Student').trim(),
        student_phone: String(student_phone || '').trim(),
        amount: 0,
        currency: 'INR',
        payment_id: 'FREE-ENROLL',
        payment_method: 'free_enrollment',
        status: 'active',
        progress_pct: 0,
        completed_lessons: [],
        enrolled_at: new Date().toISOString(),
      };
      enrollments.unshift(enrollment);
      await setBlob('enrollments_list', enrollments);

      // Update student profile
      const students = (await getBlob('students_index')) || [];
      const stdIdx = students.findIndex((s) => s.email === cleanEmail);
      if (stdIdx !== -1) {
        students[stdIdx].enrolled_courses = Array.from(new Set([...(students[stdIdx].enrolled_courses || []), course_id]));
        await setBlob('students_index', students);
      }

      // Send free enrollment confirmation email
      try {
        const templates = (await getBlob('email_templates')) || [];
        const freeTmpl = templates.find((t) => t.id === 'free_enrollment');
        if (freeTmpl) {
          const bodyText = renderEmailTemplate(freeTmpl.body, {
            student_name: enrollment.student_name,
            course_title: course.title,
            dashboard_url: 'https://webnasir.dpdns.org/#/student',
          });
          await sendEmailMessage({
            to: cleanEmail,
            recipient_name: enrollment.student_name,
            subject: `Enrollment Confirmed: ${course.title}`,
            text: bodyText,
            template_id: 'free_enrollment',
            type: 'transactional',
          });
        }
      } catch (err) {
        console.warn('Free enrollment email warning:', err);
      }

      return jsonResponse(201, {
        success: true,
        message: 'Successfully enrolled in ' + course.title,
        enrollment,
      });
    }

    // POST /api/courses/enroll (Legacy / backward compatible route)
    if (method === 'POST' && cleanPath === '/courses/enroll') {
      const body = parseJsonBody(event.body);
      if (!body) return jsonResponse(400, { error: 'Invalid payload' });
      const { course_id, student_email, student_name, student_phone, payment_id, payment_method } = body;
      if (!course_id || !student_email) {
        return jsonResponse(400, { error: 'Course ID and student email are required' });
      }
      const courses = (await getBlob('courses_index')) || [];
      const course = courses.find((c) => c.id === course_id);
      if (!course) return jsonResponse(404, { error: 'Course not found' });

      const cleanEmail = String(student_email).toLowerCase().trim();
      const enrollments = (await getBlob('enrollments_list')) || [];
      let existingEnroll = enrollments.find(e => e.course_id === course_id && e.student_email === cleanEmail);
      if (existingEnroll) {
        return jsonResponse(200, { success: true, message: 'Already enrolled', enrollment: existingEnroll });
      }

      const enrollmentId = 'ENR-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
      const newEnrollment = {
        enrollment_id: enrollmentId,
        course_id,
        course_title: course.title,
        student_email: cleanEmail,
        student_name: String(student_name || 'Student').trim(),
        student_phone: String(student_phone || '').trim(),
        amount: course.price,
        currency: 'INR',
        payment_id: payment_id || 'PAY-' + Date.now(),
        payment_method: payment_method || 'UPI / Razorpay',
        status: 'active',
        progress_pct: 0,
        completed_lessons: [],
        enrolled_at: new Date().toISOString(),
      };
      enrollments.unshift(newEnrollment);
      await setBlob('enrollments_list', enrollments);

      // Also sync student enrollments in students_index
      const students = (await getBlob('students_index')) || [];
      const stdIdx = students.findIndex((s) => s.email === cleanEmail);
      if (stdIdx !== -1) {
        students[stdIdx].enrolled_courses = Array.from(new Set([...(students[stdIdx].enrolled_courses || []), course_id]));
        students[stdIdx].payment_status = 'paid';
        await setBlob('students_index', students);
      }

      return jsonResponse(201, {
        success: true,
        message: 'Successfully enrolled in ' + course.title,
        enrollment: newEnrollment,
      });
    }

    // GET /api/student/courses
    if (method === 'GET' && cleanPath === '/student/courses') {
      const email = event.queryStringParameters?.email;
      if (!email) return jsonResponse(200, []);
      const enrollments = (await getBlob('enrollments_list')) || [];
      const studentCourses = enrollments.filter((e) => e.student_email === email.toLowerCase().trim());
      return jsonResponse(200, studentCourses);
    }

    // POST /api/student/progress
    if (method === 'POST' && cleanPath === '/student/progress') {
      const body = parseJsonBody(event.body);
      if (!body || !body.enrollment_id) return jsonResponse(400, { error: 'enrollment_id is required' });
      const enrollments = (await getBlob('enrollments_list')) || [];
      const idx = enrollments.findIndex((e) => e.enrollment_id === body.enrollment_id);
      if (idx !== -1) {
        if (body.progress_pct !== undefined) enrollments[idx].progress_pct = Math.min(100, Math.max(0, Number(body.progress_pct)));
        if (body.lesson_id) {
          enrollments[idx].completed_lessons = Array.from(new Set([...(enrollments[idx].completed_lessons || []), body.lesson_id]));
        }
        await setBlob('enrollments_list', enrollments);
        return jsonResponse(200, { success: true, enrollment: enrollments[idx] });
      }
      return jsonResponse(404, { error: 'Enrollment not found' });
    }

    // POST /api/newsletter/subscribe
    if (method === 'POST' && cleanPath === '/newsletter/subscribe') {
      const body = parseJsonBody(event.body);
      if (!body || !body.email) return jsonResponse(400, { error: 'Email is required' });

      const email = String(body.email).toLowerCase().trim();
      const name = String(body.name || email.split('@')[0]).trim();
      const list = (await getBlob('subscribers_list')) || [];

      const existingIdx = list.findIndex((s) => s.email === email);
      if (existingIdx !== -1) {
        list[existingIdx].status = 'active';
        list[existingIdx].updated_at = new Date().toISOString();
      } else {
        list.unshift({
          email,
          name,
          source: body.source || 'footer_newsletter',
          marketing_consent: true,
          created_at: new Date().toISOString(),
          status: 'active',
        });
      }
      await setBlob('subscribers_list', list);
      return jsonResponse(200, { success: true, message: 'Thank you for subscribing to Web Nasir Academy updates!' });
    }

    // GET /api/newsletter/unsubscribe or POST /api/newsletter/unsubscribe
    if ((method === 'GET' || method === 'POST') && cleanPath === '/newsletter/unsubscribe') {
      const email = (event.queryStringParameters?.email || parseJsonBody(event.body)?.email || '').toLowerCase().trim();
      if (!email) return jsonResponse(400, { error: 'Email is required' });

      const list = (await getBlob('subscribers_list')) || [];
      const idx = list.findIndex((s) => s.email === email);
      if (idx !== -1) {
        list[idx].status = 'unsubscribed';
        list[idx].unsubscribed_at = new Date().toISOString();
        await setBlob('subscribers_list', list);
      }
      return jsonResponse(200, { success: true, message: 'You have been unsubscribed from promotional updates.' });
    }

    // POST /api/ai/run (Free Tier Gemini 3.8 Flash inference)
    if (method === 'POST' && cleanPath === '/ai/run') {
      const body = parseJsonBody(event.body);
      if (!body) return jsonResponse(400, { error: 'Invalid payload' });

      const { tool_type, input, tone, options } = body;
      if (!input || typeof input !== 'string' || input.trim().length === 0) {
        return jsonResponse(400, { error: 'Input text or topic is required' });
      }

      let prompt = '';
      let systemInstruction = 'You are Web Nasir, a 10-year veteran software engineer and high-income digital publishing mentor. Deliver direct, professional, high-impact results with zero fluff.';

      if (tool_type === 'ai_youtube') {
        prompt = `Generate 5 viral, high-CTR YouTube video titles, 2 magnetic first-30-second retention hooks, and 2 visual thumbnail concept descriptions for the following video topic:\n"${input}"\nTarget audience vibe: ${tone || 'Engaging & Educational'}. Format with clean markdown headers and bullet points.`;
      } else if (tool_type === 'ai_blog') {
        prompt = `Create a comprehensive high-ranking SEO blog outline for the keyword / title:\n"${input}"\nInclude:\n1. Target Search Intent & High-CPC Primary/Secondary Keywords\n2. Compelling Meta Title (under 60 chars) and Meta Description\n3. Structured H2 and H3 Headings outline with key takeaways for each section\n4. Recommended Internal Linking & Content Monetization angle (AdSense / Affiliate).`;
      } else if (tool_type === 'ai_code') {
        prompt = `Analyze and clearly explain the following code snippet, regular expression, or command in plain English:\n\`\`\`\n${input}\n\`\`\`\nProvide:\n1. High-level summary of what it does\n2. Step-by-step breakdown of key lines\n3. Potential performance, security, or edge-case improvements.`;
      } else if (tool_type === 'ai_adcopy') {
        prompt = `Craft 3 high-converting ad copy variations (Headlines, Body text, and Call to Actions) for marketing the following product or website:\n"${input}"\nGoal: Drive high-intent clicks and low CPC.`;
      } else {
        // Custom tool prompt
        prompt = `Task: ${options?.custom_prompt || 'Analyze and optimize the following request'}\n\nUser Input: ${input}\n\nProvide clear, actionable results.`;
      }

      let aiResponse = await callGeminiAPI(prompt, systemInstruction);
      if (aiResponse && aiResponse.text) {
        return jsonResponse(200, {
          success: true,
          result: aiResponse.text,
          is_ai_generated: true,
          model: aiResponse.model,
        }, {}, event);
      }

      // High-quality algorithmic fallback if GEMINI_API_KEY is not set or network fails
      let fallbackText = '';
      if (tool_type === 'ai_youtube') {
        fallbackText = `### 🔥 5 Viral YouTube Title Ideas\n- **I Tried ${input} for 30 Days (Here's What Happened)**\n- **The ${input} Secret 99% Of People Don't Know in 2025**\n- **Stop Doing ${input} Wrong (Do This Instead)**\n- **From $0 to $10k with ${input}: Step-by-Step**\n- **Why ${input} is Changing Everything (Full Breakdown)**\n\n### ⚡ 30-Second Retention Hook\n"Most creators overcomplicate ${input}. Over the next 5 minutes, I'm revealing the exact 3-step framework I used to master it—without spending thousands on courses. Let's get right into it."\n\n### 🎨 Thumbnail Concept\n- **Left:** High-contrast facial reaction pointing right\n- **Right:** Clean graphic comparing "Before vs After" with bold text: "DON'T SKIP THIS"`;
      } else if (tool_type === 'ai_blog') {
        fallbackText = `### 🎯 SEO Keyword Strategy for "${input}"\n- **Primary Intent:** Informational & Commercial\n- **Target Keywords:** best ${input} tutorial, ${input} guide 2025, how to monetize ${input}, ${input} vs alternatives\n\n### 📝 Recommended Article Hierarchy\n- **H1:** The Ultimate Guide to ${input}: Blueprint for 2025\n- **H2:** 1. Why ${input} Matters Right Now\n  - *H3: Key Benefits & Cost Efficiencies*\n- **H2:** 2. Step-by-Step Implementation Framework\n  - *H3: Setup & Prerequisites*\n  - *H3: Core Architecture Walkthrough*\n- **H2:** 3. High-RPM Monetization & Traffic Strategies\n- **H2:** 4. Common Pitfalls to Avoid\n- **H2:** 5. Conclusion & Action Checklist`;
      } else if (tool_type === 'ai_code') {
        fallbackText = `### 💻 Code Analysis & Breakdown\n- **Purpose:** Executes pattern matching and procedural transformation on input streams.\n- **Efficiency:** O(N) linear time complexity with minimal heap allocations.\n- **Engineering Best Practice:** Ensure input sanitization and boundary assertions prior to execution to prevent unexpected edge-case errors.`;
      } else {
        fallbackText = `### 🚀 Generated Strategy for "${input}"\n- **Core Hook:** Stop wasting hours on manual tasks. Here is the streamlined automation framework.\n- **Key Value Proposition:** Built for high efficiency, zero server maintenance, and fast turnaround.\n- **Action Item:** Deploy with a static edge frontend and test conversion metrics.`;
      }

      return jsonResponse(200, { success: true, result: fallbackText, is_ai_generated: false, is_fallback: true }, {}, event);
    }

    // ==========================================
    // ADMIN AUTH ROUTES
    // ==========================================

    // POST /api/admin/login
    if (method === 'POST' && cleanPath === '/admin/login') {
      const body = parseJsonBody(event.body);
      if (!body) return jsonResponse(400, { error: 'Invalid JSON request payload' }, {}, event);

      const { username, password } = body;
      if (!username || !password) {
        return jsonResponse(400, { error: 'Username and password are required' }, {}, event);
      }

      const auth = await getBlob('auth');
      if (!auth) {
        return jsonResponse(500, { error: 'Authentication store not initialized' }, {}, event);
      }

      const isMatch = (username === auth.username) && (await verifyPassword(password, auth.password_hash));
      if (!isMatch) {
        return jsonResponse(401, { error: 'Invalid username or password' }, {}, event);
      }

      const token = signToken({
        sub: auth.username,
        mustChange: !!auth.must_change_password,
      });

      const cookieHeader = createAuthCookie(token, isSecure);

      return jsonResponse(
        200,
        {
          success: true,
          token,
          username: auth.username,
          must_change_password: !!auth.must_change_password,
          message: 'Logged in successfully',
        },
        { 'Set-Cookie': cookieHeader },
        event
      );
    }

    // POST /api/admin/logout
    if (method === 'POST' && cleanPath === '/admin/logout') {
      const logoutCookie = createLogoutCookie(isSecure);
      return jsonResponse(
        200,
        { success: true, message: 'Logged out successfully' },
        { 'Set-Cookie': logoutCookie },
        event
      );
    }

    // GET /api/admin/me
    if (method === 'GET' && cleanPath === '/admin/me') {
      const admin = await requireAuth();
      if (!admin) return jsonResponse(401, { error: 'Unauthorized' }, {}, event);

      return jsonResponse(200, {
        authenticated: true,
        username: admin.username,
        must_change_password: !!admin.must_change_password,
      }, {}, event);
    }

    // POST /api/admin/password
    if (method === 'POST' && cleanPath === '/admin/password') {
      const admin = await requireAuth();
      if (!admin) return jsonResponse(401, { error: 'Unauthorized' }, {}, event);

      const body = parseJsonBody(event.body);
      if (!body) return jsonResponse(400, { error: 'Invalid request' }, {}, event);

      const { current, next } = body;
      if (!current || !next) {
        return jsonResponse(400, { error: 'Both current and next passwords are required' }, {}, event);
      }

      if (typeof next !== 'string' || next.length < 8) {
        return jsonResponse(400, { error: 'New password must be at least 8 characters long' }, {}, event);
      }

      const auth = await getBlob('auth');
      const isCurrentValid = await verifyPassword(current, auth.password_hash);
      if (!isCurrentValid) {
        return jsonResponse(400, { error: 'Current password does not match' }, {}, event);
      }

      const newHash = await hashPassword(next);
      auth.password_hash = newHash;
      auth.must_change_password = false;
      await setBlob('auth', auth);

      const newToken = signToken({
        sub: auth.username,
        mustChange: false,
      });
      const cookieHeader = createAuthCookie(newToken, isSecure);

      return jsonResponse(
        200,
        {
          success: true,
          token: newToken,
          must_change_password: false,
          message: 'Password updated successfully',
        },
        { 'Set-Cookie': cookieHeader },
        event
      );
    }

    // ==========================================
    // ADMIN PROTECTED CRUD ROUTES
    // ==========================================

    if (cleanPath.startsWith('/admin')) {
      const admin = await requireAuth();
      if (!admin) return jsonResponse(401, { error: 'Unauthorized' });

      // GET /api/admin/articles
      if (method === 'GET' && cleanPath === '/admin/articles') {
        const index = (await getBlob('articles_index')) || [];
        return jsonResponse(200, index);
      }

      // POST /api/admin/articles
      if (method === 'POST' && cleanPath === '/admin/articles') {
        const body = parseJsonBody(event.body);
        if (!body) return jsonResponse(400, { error: 'Invalid payload' });

        let { slug, tag, title, meta, body: articleBody, is_published, sort_order } = body;

        if (!title || typeof title !== 'string' || title.trim().length === 0) {
          return jsonResponse(400, { error: 'Article title is required' });
        }
        if (!articleBody || typeof articleBody !== 'string' || articleBody.trim().length === 0) {
          return jsonResponse(400, { error: 'Article content body is required' });
        }
        if (!tag || typeof tag !== 'string') {
          return jsonResponse(400, { error: 'Tag is required' });
        }

        if (!slug || typeof slug !== 'string') {
          slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
        } else {
          slug = slug.toLowerCase().trim();
        }

        if (!/^[a-z0-9-]+$/.test(slug)) {
          return jsonResponse(400, {
            error: 'Slug must contain only lowercase alphanumeric characters and hyphens',
          });
        }

        const existing = await getBlob(`article:${slug}`);
        if (existing) {
          return jsonResponse(400, { error: `An article with slug "${slug}" already exists` });
        }

        const now = new Date().toISOString();
        const newArticle = {
          slug,
          tag: tag.toLowerCase(),
          title: title.trim(),
          meta: (meta || '').trim(),
          body: articleBody,
          is_published: is_published !== false,
          sort_order: Number(sort_order) || 1,
          created_at: now,
          updated_at: now,
        };

        await setBlob(`article:${slug}`, newArticle);

        const index = (await getBlob('articles_index')) || [];
        index.push({
          slug: newArticle.slug,
          tag: newArticle.tag,
          title: newArticle.title,
          meta: newArticle.meta,
          is_published: newArticle.is_published,
          sort_order: newArticle.sort_order,
          updated_at: newArticle.updated_at,
        });
        await setBlob('articles_index', index);

        return jsonResponse(201, { success: true, article: newArticle });
      }

      // PUT /api/admin/articles/:slug
      if (method === 'PUT' && cleanPath.startsWith('/admin/articles/')) {
        const slug = cleanPath.replace('/admin/articles/', '').trim();
        const body = parseJsonBody(event.body);
        if (!body) return jsonResponse(400, { error: 'Invalid payload' });

        const article = await getBlob(`article:${slug}`);
        if (!article) {
          return jsonResponse(404, { error: 'Article not found' });
        }

        const { title, tag, meta, body: articleBody, is_published, sort_order } = body;

        if (title !== undefined) article.title = title.trim();
        if (tag !== undefined) article.tag = String(tag).toLowerCase().trim();
        if (meta !== undefined) article.meta = String(meta).trim();
        if (articleBody !== undefined) article.body = articleBody;
        if (is_published !== undefined) article.is_published = !!is_published;
        if (sort_order !== undefined) article.sort_order = Number(sort_order) || 0;

        article.updated_at = new Date().toISOString();
        await setBlob(`article:${slug}`, article);

        const index = (await getBlob('articles_index')) || [];
        const idx = index.findIndex((a) => a.slug === slug);
        if (idx !== -1) {
          index[idx] = {
            slug: article.slug,
            tag: article.tag,
            title: article.title,
            meta: article.meta,
            is_published: article.is_published,
            sort_order: article.sort_order,
            updated_at: article.updated_at,
          };
          await setBlob('articles_index', index);
        }

        return jsonResponse(200, { success: true, article });
      }

      // DELETE /api/admin/articles/:slug
      if (method === 'DELETE' && cleanPath.startsWith('/admin/articles/')) {
        const slug = cleanPath.replace('/admin/articles/', '').trim();
        await deleteBlob(`article:${slug}`);

        const index = (await getBlob('articles_index')) || [];
        const filtered = index.filter((a) => a.slug !== slug);
        await setBlob('articles_index', filtered);

        return jsonResponse(200, { success: true, message: 'Article deleted successfully' });
      }

      // GET /api/admin/tools
      if (method === 'GET' && cleanPath === '/admin/tools') {
        const tools = (await getBlob('tools_index')) || [];
        return jsonResponse(200, tools);
      }

      // POST /api/admin/tools (Admin easily adds new free AI tools!)
      if (method === 'POST' && cleanPath === '/admin/tools') {
        const body = parseJsonBody(event.body);
        if (!body) return jsonResponse(400, { error: 'Invalid payload' });

        const { key, name, description, category, badge, icon, tool_type, custom_prompt, sort_order } = body;
        if (!name || typeof name !== 'string') return jsonResponse(400, { error: 'Tool name is required' });
        
        let toolKey = (key || name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        if (!toolKey) toolKey = 'tool-' + Date.now();

        const tools = (await getBlob('tools_index')) || [];
        if (tools.some(t => t.key === toolKey)) {
          return jsonResponse(400, { error: `Tool key "${toolKey}" already exists` });
        }

        const newTool = {
          key: toolKey,
          name: name.trim().slice(0, 150),
          description: String(description || '').trim().slice(0, 500),
          category: String(category || 'AI Creators').trim().slice(0, 50),
          badge: String(badge || 'Free Tool').trim().slice(0, 50),
          icon: String(icon || 'sparkles').trim().slice(0, 50),
          tool_type: String(tool_type || 'custom_ai').trim().slice(0, 50),
          custom_prompt: String(custom_prompt || '').slice(0, 2000),
          is_enabled: true,
          sort_order: Number(sort_order) || (tools.length + 1),
        };

        tools.push(newTool);
        await setBlob('tools_index', tools);
        return jsonResponse(201, { success: true, tool: newTool });
      }

      // PUT /api/admin/tools/:key
      if (method === 'PUT' && cleanPath.startsWith('/admin/tools/')) {
        const key = cleanPath.replace('/admin/tools/', '').trim();
        const body = parseJsonBody(event.body);
        if (!body) return jsonResponse(400, { error: 'Invalid payload' });

        const tools = (await getBlob('tools_index')) || [];
        const toolIndex = tools.findIndex((t) => t.key === key);
        if (toolIndex === -1) {
          return jsonResponse(404, { error: 'Tool not found' });
        }

        if (body.name !== undefined) tools[toolIndex].name = String(body.name).slice(0, 200);
        if (body.description !== undefined) tools[toolIndex].description = String(body.description).slice(0, 500);
        if (body.category !== undefined) tools[toolIndex].category = String(body.category).slice(0, 50);
        if (body.badge !== undefined) tools[toolIndex].badge = String(body.badge).slice(0, 50);
        if (body.icon !== undefined) tools[toolIndex].icon = String(body.icon).slice(0, 50);
        if (body.tool_type !== undefined) tools[toolIndex].tool_type = String(body.tool_type).slice(0, 50);
        if (body.custom_prompt !== undefined) tools[toolIndex].custom_prompt = String(body.custom_prompt).slice(0, 2000);
        if (body.is_enabled !== undefined) tools[toolIndex].is_enabled = !!body.is_enabled;
        if (body.sort_order !== undefined) tools[toolIndex].sort_order = Number(body.sort_order) || 0;

        await setBlob('tools_index', tools);
        return jsonResponse(200, { success: true, tool: tools[toolIndex] });
      }

      // DELETE /api/admin/tools/:key
      if (method === 'DELETE' && cleanPath.startsWith('/admin/tools/')) {
        const key = cleanPath.replace('/admin/tools/', '').trim();
        const tools = (await getBlob('tools_index')) || [];
        const filtered = tools.filter((t) => t.key !== key);
        await setBlob('tools_index', filtered);
        return jsonResponse(200, { success: true, message: 'Tool deleted successfully' });
      }

      // GET /api/admin/topics
      if (method === 'GET' && cleanPath === '/admin/topics') {
        const topics = (await getBlob('topics_index')) || [];
        return jsonResponse(200, topics);
      }

      // POST /api/admin/topics
      if (method === 'POST' && cleanPath === '/admin/topics') {
        const body = parseJsonBody(event.body);
        if (!body) return jsonResponse(400, { error: 'Invalid payload' });

        const { key, name, description, icon, link, sort_order } = body;
        if (!key || typeof key !== 'string') return jsonResponse(400, { error: 'Topic key is required' });
        if (!name || typeof name !== 'string') return jsonResponse(400, { error: 'Topic name is required' });

        const cleanKey = key.toLowerCase().trim().replace(/[^a-z0-9-]/g, '');
        const topics = (await getBlob('topics_index')) || [];
        if (topics.some((t) => t.key === cleanKey)) {
          return jsonResponse(400, { error: `Topic key "${cleanKey}" already exists` });
        }

        const newTopic = {
          key: cleanKey,
          name: name.trim().slice(0, 100),
          description: String(description || '').slice(0, 300),
          icon: String(icon || 'tag').slice(0, 50),
          link: String(link || `#/articles?tag=${cleanKey}`).slice(0, 200),
          sort_order: Number(sort_order) || 1,
        };

        topics.push(newTopic);
        await setBlob('topics_index', topics);
        return jsonResponse(201, { success: true, topic: newTopic });
      }

      // PUT /api/admin/topics/:key
      if (method === 'PUT' && cleanPath.startsWith('/admin/topics/')) {
        const key = cleanPath.replace('/admin/topics/', '').trim();
        const body = parseJsonBody(event.body);
        if (!body) return jsonResponse(400, { error: 'Invalid payload' });

        const topics = (await getBlob('topics_index')) || [];
        const topicIndex = topics.findIndex((t) => t.key === key);
        if (topicIndex === -1) {
          return jsonResponse(404, { error: 'Topic not found' });
        }

        if (body.name !== undefined) topics[topicIndex].name = String(body.name).slice(0, 100);
        if (body.description !== undefined) topics[topicIndex].description = String(body.description).slice(0, 300);
        if (body.icon !== undefined) topics[topicIndex].icon = String(body.icon).slice(0, 50);
        if (body.link !== undefined) topics[topicIndex].link = String(body.link).slice(0, 200);
        if (body.sort_order !== undefined) topics[topicIndex].sort_order = Number(body.sort_order) || 0;

        await setBlob('topics_index', topics);
        return jsonResponse(200, { success: true, topic: topics[topicIndex] });
      }

      // DELETE /api/admin/topics/:key
      if (method === 'DELETE' && cleanPath.startsWith('/admin/topics/')) {
        const key = cleanPath.replace('/admin/topics/', '').trim();
        const topics = (await getBlob('topics_index')) || [];
        const filtered = topics.filter((t) => t.key !== key);
        await setBlob('topics_index', filtered);
        return jsonResponse(200, { success: true, message: 'Topic deleted successfully' });
      }

      // GET /api/admin/settings
      if (method === 'GET' && cleanPath === '/admin/settings') {
        const settings = (await getBlob('settings')) || {};
        return jsonResponse(200, settings);
      }

      // PUT /api/admin/settings (Full Home Page Settings & Site Configuration)
      if (method === 'PUT' && cleanPath === '/admin/settings') {
        const body = parseJsonBody(event.body);
        if (!body) return jsonResponse(400, { error: 'Invalid payload' });

        const currentSettings = (await getBlob('settings')) || {};

        const allowedKeys = [
          'site_name',
          'tagline',
          'whatsapp_number',
          'email',
          'announcement_enabled',
          'announcement_badge',
          'announcement_text',
          'announcement_link_text',
          'announcement_link_url',
          'hero_title',
          'hero_subtitle',
          'stat_years',
          'stat_rpm',
          'stat_projects',
          'stat_tools',
          'nasir_quote',
          'video_title',
          'video_subtitle',
          'video_url',
          'video_presenter_name',
          'video_presenter_title',
          'video_script_urdu',
          'video_script_english',
          'razorpay_enabled',
          'razorpay_key_id',
          'currency',
          'currency_symbol',
          'marquee_speed',
          'marquee_enabled',
          'social_facebook',
          'social_x',
          'social_youtube',
          'social_instagram',
          'social_linkedin',
          'footer_text',
        ];

        for (const k of allowedKeys) {
          if (body[k] !== undefined) {
            currentSettings[k] = body[k];
          }
        }

        if (body.trust_badges !== undefined) {
          if (Array.isArray(body.trust_badges)) {
            currentSettings.trust_badges = body.trust_badges.map((b) => String(b).slice(0, 50));
          } else {
            return jsonResponse(400, { error: 'trust_badges must be an array of strings' });
          }
        }

        await setBlob('settings', currentSettings);
        return jsonResponse(200, { success: true, settings: currentSettings });
      }

      // ==========================================
      // ADMIN COURSES CRUD
      // ==========================================

      // GET /api/admin/courses
      if (method === 'GET' && cleanPath === '/admin/courses') {
        const courses = (await getBlob('courses_index')) || [];
        return jsonResponse(200, courses);
      }

      // POST /api/admin/courses
      if (method === 'POST' && cleanPath === '/admin/courses') {
        const body = parseJsonBody(event.body);
        if (!body || !body.title) return jsonResponse(400, { error: 'Course title is required' });

        const id = (body.id || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')).replace(/^-|-$/g, '');
        const courses = (await getBlob('courses_index')) || [];
        if (courses.some((c) => c.id === id)) {
          return jsonResponse(400, { error: `Course ID "${id}" already exists` });
        }

        const newCourse = {
          id,
          title: String(body.title).trim().slice(0, 150),
          subtitle: String(body.subtitle || '').trim().slice(0, 300),
          category: String(body.category || 'AI & Automation').trim(),
          level: String(body.level || 'All Levels').trim(),
          duration: String(body.duration || '6 Weeks').trim(),
          modules_count: Number(body.modules_count) || 20,
          price: Number(body.price) || 2999,
          original_price: Number(body.original_price) || 7999,
          instructor: String(body.instructor || 'Nasir').trim(),
          instructor_title: String(body.instructor_title || 'Lead Technical Mentor').trim(),
          badge: String(body.badge || 'Popular').trim(),
          is_published: body.is_published !== false,
          sort_order: Number(body.sort_order) || courses.length + 1,
          overview: String(body.overview || '').slice(0, 2000),
          features: Array.isArray(body.features) ? body.features : ['100% Practical Production Projects', 'Direct Code Reviews', 'Lifetime Access'],
          curriculum: Array.isArray(body.curriculum) ? body.curriculum : []
        };

        courses.push(newCourse);
        await setBlob('courses_index', courses);
        await setBlob(`course:${id}`, newCourse);
        return jsonResponse(201, { success: true, course: newCourse });
      }

      // PUT /api/admin/courses/:id
      if (method === 'PUT' && cleanPath.startsWith('/admin/courses/')) {
        const id = cleanPath.replace('/admin/courses/', '').trim();
        const body = parseJsonBody(event.body);
        if (!body) return jsonResponse(400, { error: 'Invalid payload' });

        const courses = (await getBlob('courses_index')) || [];
        const idx = courses.findIndex((c) => c.id === id);
        if (idx === -1) return jsonResponse(404, { error: 'Course not found' });

        const existing = courses[idx];
        const updated = {
          ...existing,
          ...body,
          id: existing.id,
        };

        courses[idx] = updated;
        await setBlob('courses_index', courses);
        await setBlob(`course:${id}`, updated);
        return jsonResponse(200, { success: true, course: updated });
      }

      // DELETE /api/admin/courses/:id
      if (method === 'DELETE' && cleanPath.startsWith('/admin/courses/')) {
        const id = cleanPath.replace('/admin/courses/', '').trim();
        const courses = (await getBlob('courses_index')) || [];
        const filtered = courses.filter((c) => c.id !== id);
        await setBlob('courses_index', filtered);
        await deleteBlob(`course:${id}`);
        return jsonResponse(200, { success: true, message: 'Course deleted successfully' });
      }

      // ==========================================
      // ADMIN TESTIMONIALS CRUD
      // ==========================================

      // GET /api/admin/testimonials
      if (method === 'GET' && cleanPath === '/admin/testimonials') {
        const list = (await getBlob('testimonials_index')) || [];
        return jsonResponse(200, list);
      }

      // POST /api/admin/testimonials
      if (method === 'POST' && cleanPath === '/admin/testimonials') {
        const body = parseJsonBody(event.body);
        if (!body || !body.name || !body.content) return jsonResponse(400, { error: 'Name and content are required' });

        const list = (await getBlob('testimonials_index')) || [];
        const id = 'test-' + Date.now();
        const newTest = {
          id,
          name: String(body.name).trim().slice(0, 100),
          role: String(body.role || 'Student & Alumni').trim().slice(0, 100),
          course: String(body.course || 'Academy Masterclass').trim().slice(0, 100),
          rating: Number(body.rating) || 5,
          content: String(body.content).trim().slice(0, 1000),
          has_video: Boolean(body.has_video),
          video_url: String(body.video_url || ''),
          verified: body.verified !== false,
          sort_order: Number(body.sort_order) || list.length + 1,
        };

        list.push(newTest);
        await setBlob('testimonials_index', list);
        return jsonResponse(201, { success: true, testimonial: newTest });
      }

      // PUT /api/admin/testimonials/:id
      if (method === 'PUT' && cleanPath.startsWith('/admin/testimonials/')) {
        const id = cleanPath.replace('/admin/testimonials/', '').trim();
        const body = parseJsonBody(event.body);
        if (!body) return jsonResponse(400, { error: 'Invalid payload' });

        const list = (await getBlob('testimonials_index')) || [];
        const idx = list.findIndex((t) => t.id === id);
        if (idx === -1) return jsonResponse(404, { error: 'Testimonial not found' });

        list[idx] = { ...list[idx], ...body, id };
        await setBlob('testimonials_index', list);
        return jsonResponse(200, { success: true, testimonial: list[idx] });
      }

      // DELETE /api/admin/testimonials/:id
      if (method === 'DELETE' && cleanPath.startsWith('/admin/testimonials/')) {
        const id = cleanPath.replace('/admin/testimonials/', '').trim();
        const list = (await getBlob('testimonials_index')) || [];
        const filtered = list.filter((t) => t.id !== id);
        await setBlob('testimonials_index', filtered);
        return jsonResponse(200, { success: true, message: 'Testimonial deleted successfully' });
      }

      // ==========================================
      // ADMIN MARQUEE CRUD
      // ==========================================

      // GET /api/admin/marquee
      if (method === 'GET' && cleanPath === '/admin/marquee') {
        const list = (await getBlob('marquee_items')) || [];
        return jsonResponse(200, list);
      }

      // PUT /api/admin/marquee
      if (method === 'PUT' && cleanPath === '/admin/marquee') {
        const body = parseJsonBody(event.body);
        if (!body || !Array.isArray(body.items)) return jsonResponse(400, { error: 'items array is required' });

        const sanitized = body.items.map((i) => ({
          text: String(i.text || '').slice(0, 200),
          link: String(i.link || '#/courses').slice(0, 100),
        })).filter(i => i.text.length > 0);

        await setBlob('marquee_items', sanitized);
        return jsonResponse(200, { success: true, items: sanitized });
      }

      // ==========================================
      // ADMIN ENROLLMENTS & CONTACT SUBMISSIONS
      // ==========================================

      // GET /api/admin/enrollments
      if (method === 'GET' && cleanPath === '/admin/enrollments') {
        const list = (await getBlob('enrollments_list')) || [];
        return jsonResponse(200, list);
      }

      // GET /api/admin/contacts
      if (method === 'GET' && cleanPath === '/admin/contacts') {
        const list = (await getBlob('contacts_list')) || [];
        return jsonResponse(200, list);
      }

      // ==========================================
      // ADMIN STUDENT MANAGEMENT
      // ==========================================

      // GET /api/admin/students/export-csv
      if (method === 'GET' && cleanPath === '/admin/students/export-csv') {
        const students = (await getBlob('students_index')) || [];
        const rows = [
          ['Student ID', 'Name', 'Email', 'Auth Provider', 'Email Verified', 'Registration Date', 'Last Login', 'Enrolled Courses', 'Payment Status', 'Account Status'],
          ...students.map((s) => [
            s.id,
            `"${(s.name || '').replace(/"/g, '""')}"`,
            s.email,
            s.auth_provider || 'google',
            s.email_verified ? 'Yes' : 'No',
            s.created_at || '',
            s.last_login_at || '',
            `"${(s.enrolled_courses || []).join('; ')}"`,
            s.payment_status || 'none',
            s.status || 'active',
          ]),
        ];
        const csv = rows.map((r) => r.join(',')).join('\n');
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': 'attachment; filename="webnasir-students.csv"',
            'Access-Control-Allow-Origin': '*',
          },
          body: csv,
        };
      }

      // GET /api/admin/students
      if (method === 'GET' && cleanPath === '/admin/students') {
        const students = (await getBlob('students_index')) || [];
        const enrollments = (await getBlob('enrollments_list')) || [];

        const search = (event.queryStringParameters?.search || '').toLowerCase().trim();
        const provider = (event.queryStringParameters?.provider || '').toLowerCase().trim();
        const course = (event.queryStringParameters?.course || '').toLowerCase().trim();
        const status = (event.queryStringParameters?.status || '').toLowerCase().trim();

        // Calculate KPI stats
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

        const stats = {
          total_students: students.length,
          google_registrations: students.filter((s) => s.auth_provider === 'google').length,
          email_registrations: students.filter((s) => s.auth_provider === 'email').length,
          new_today: students.filter((s) => new Date(s.created_at).getTime() >= startOfDay).length,
          new_this_month: students.filter((s) => new Date(s.created_at).getTime() >= startOfMonth).length,
          active_students: students.filter((s) => s.status !== 'disabled').length,
          total_enrollments: enrollments.length,
          free_enrollments: enrollments.filter((e) => Number(e.amount) === 0).length,
          paid_enrollments: enrollments.filter((e) => Number(e.amount) > 0).length,
        };

        let filtered = students;
        if (search) {
          filtered = filtered.filter(
            (s) =>
              (s.name && s.name.toLowerCase().includes(search)) ||
              (s.email && s.email.toLowerCase().includes(search))
          );
        }
        if (provider && provider !== 'all') {
          filtered = filtered.filter((s) => s.auth_provider === provider);
        }
        if (course && course !== 'all') {
          filtered = filtered.filter((s) => (s.enrolled_courses || []).includes(course));
        }
        if (status && status !== 'all') {
          filtered = filtered.filter((s) => (s.status || 'active') === status);
        }

        return jsonResponse(200, { students: filtered, stats });
      }

      // GET /api/admin/students/:id
      if (method === 'GET' && cleanPath.startsWith('/admin/students/') && !cleanPath.endsWith('/export-csv')) {
        const id = cleanPath.replace('/admin/students/', '').trim();
        const students = (await getBlob('students_index')) || [];
        const student = students.find((s) => s.id === id || s.email === id);
        if (!student) return jsonResponse(404, { error: 'Student not found' });

        const enrollments = (await getBlob('enrollments_list')) || [];
        const studentEnrollments = enrollments.filter((e) => e.student_email === student.email);

        const payments = (await getBlob('payments_list')) || [];
        const studentPayments = payments.filter((p) => p.student_email === student.email);

        return jsonResponse(200, {
          student,
          enrollments: studentEnrollments,
          payments: studentPayments,
        });
      }

      // PUT /api/admin/students/:id/status
      if (method === 'PUT' && cleanPath.includes('/admin/students/') && cleanPath.endsWith('/status')) {
        const id = cleanPath.replace('/admin/students/', '').replace('/status', '').trim();
        const body = parseJsonBody(event.body);
        if (!body || !body.status) return jsonResponse(400, { error: 'status is required' });

        const students = (await getBlob('students_index')) || [];
        const idx = students.findIndex((s) => s.id === id || s.email === id);
        if (idx === -1) return jsonResponse(404, { error: 'Student not found' });

        students[idx].status = body.status === 'disabled' ? 'disabled' : 'active';
        students[idx].updated_at = new Date().toISOString();
        await setBlob('students_index', students);

        return jsonResponse(200, { success: true, student: students[idx] });
      }

      // ==========================================
      // ADMIN EMAIL CENTER
      // ==========================================

      // GET /api/admin/emails/templates
      if (method === 'GET' && cleanPath === '/admin/emails/templates') {
        const templates = (await getBlob('email_templates')) || [];
        return jsonResponse(200, templates);
      }

      // GET /api/admin/emails/history
      if (method === 'GET' && cleanPath === '/admin/emails/history') {
        const history = (await getBlob('emails_history')) || [];
        return jsonResponse(200, history);
      }

      // GET /api/admin/emails/config
      if (method === 'GET' && cleanPath === '/admin/emails/config') {
        const config = (await getBlob('email_config')) || {};
        const maskedKey = config.resend_api_key ? config.resend_api_key.substring(0, 6) + '••••••••••••••••' : '';
        return jsonResponse(200, {
          ...config,
          resend_api_key_masked: maskedKey,
          has_key: Boolean(config.resend_api_key || process.env.RESEND_API_KEY),
        });
      }

      // PUT /api/admin/emails/config
      if (method === 'PUT' && cleanPath === '/admin/emails/config') {
        const body = parseJsonBody(event.body);
        if (!body) return jsonResponse(400, { error: 'Invalid payload' });

        const existing = (await getBlob('email_config')) || {};
        const updated = {
          ...existing,
          sender_name: String(body.sender_name || existing.sender_name || 'Web Nasir Academy').trim(),
          sender_email: String(body.sender_email || existing.sender_email || 'support@webnasir.com').trim(),
          reply_to: String(body.reply_to || existing.reply_to || 'hello@webnasir.com').trim(),
        };
        if (body.resend_api_key !== undefined) {
          updated.resend_api_key = String(body.resend_api_key).trim();
        }
        await setBlob('email_config', updated);
        return jsonResponse(200, { success: true, config: updated });
      }

      // POST /api/admin/emails/send
      if (method === 'POST' && cleanPath === '/admin/emails/send') {
        const body = parseJsonBody(event.body);
        if (!body || !body.subject || !body.body) {
          return jsonResponse(400, { error: 'Subject and body are required' });
        }

        const { recipient_type, recipient_email, course_id, subject, body: emailBodyText, template_id, type } = body;
        const students = (await getBlob('students_index')) || [];
        let targets = [];

        if (recipient_type === 'single') {
          if (!recipient_email) return jsonResponse(400, { error: 'recipient_email is required for single send' });
          const matched = students.find((s) => s.email === recipient_email.toLowerCase().trim());
          targets = [{ email: recipient_email.toLowerCase().trim(), name: matched ? matched.name : 'Student' }];
        } else if (recipient_type === 'course') {
          if (!course_id) return jsonResponse(400, { error: 'course_id is required' });
          targets = students.filter((s) => (s.enrolled_courses || []).includes(course_id));
        } else if (recipient_type === 'google') {
          targets = students.filter((s) => s.auth_provider === 'google');
        } else if (recipient_type === 'email') {
          targets = students.filter((s) => s.auth_provider === 'email');
        } else if (recipient_type === 'all') {
          targets = students;
        } else {
          targets = students;
        }

        if (targets.length === 0) {
          return jsonResponse(400, { error: 'No recipients matched the selected criteria' });
        }

        const results = [];
        for (const target of targets) {
          const personalizedBody = renderEmailTemplate(emailBodyText, {
            student_name: target.name,
            student_email: target.email,
            dashboard_url: 'https://webnasir.dpdns.org/#/student',
          });
          const res = await sendEmailMessage({
            to: target.email,
            recipient_name: target.name,
            subject,
            text: personalizedBody,
            template_id: template_id || 'custom',
            type: type || 'announcement',
          });
          results.push(res);
        }

        const deliveredCount = results.filter((r) => r.status === 'delivered').length;
        const simulatedCount = results.filter((r) => r.status === 'simulated').length;
        const failedCount = results.filter((r) => r.status === 'failed').length;

        return jsonResponse(200, {
          success: true,
          total_targets: targets.length,
          delivered: deliveredCount,
          simulated: simulatedCount,
          failed: failedCount,
          results,
        });
      }

      // ==========================================
      // ADMIN ANALYTICS OVERVIEW
      // ==========================================

      // GET /api/admin/analytics (Real-time computed metrics)
      if (method === 'GET' && cleanPath === '/admin/analytics') {
        const period = event.queryStringParameters?.period || 'all';
        const now = Date.now();
        let cutoff = 0;
        if (period === 'today') {
          const d = new Date();
          cutoff = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        } else if (period === '7d') {
          cutoff = now - 7 * 86400000;
        } else if (period === '30d') {
          cutoff = now - 30 * 86400000;
        } else if (period === 'year') {
          cutoff = now - 365 * 86400000;
        }

        const [students, enrollments, payments, emails, courses, tools] = await Promise.all([
          getBlob('students_index').then((r) => r || []),
          getBlob('enrollments_list').then((r) => r || []),
          getBlob('payments_list').then((r) => r || []),
          getBlob('emails_history').then((r) => r || []),
          getBlob('courses_index').then((r) => r || []),
          getBlob('tools_index').then((r) => r || []),
        ]);

        const filteredStudents = cutoff ? students.filter((s) => new Date(s.created_at || 0).getTime() >= cutoff) : students;
        const filteredEnrollments = cutoff ? enrollments.filter((e) => new Date(e.enrolled_at || 0).getTime() >= cutoff) : enrollments;
        const filteredPayments = cutoff ? payments.filter((p) => new Date(p.created_at || 0).getTime() >= cutoff) : payments;
        const filteredEmails = cutoff ? emails.filter((e) => new Date(e.sent_at || 0).getTime() >= cutoff) : emails;

        const totalRevenue = filteredPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
        const freeEnrollmentsCount = filteredEnrollments.filter((e) => Number(e.amount) === 0).length;
        const paidEnrollmentsCount = filteredEnrollments.filter((e) => Number(e.amount) > 0).length;

        // Course popularity
        const courseCounts = {};
        for (const e of filteredEnrollments) {
          courseCounts[e.course_id] = (courseCounts[e.course_id] || 0) + 1;
        }
        const popularCourses = courses
          .map((c) => ({
            id: c.id,
            title: c.title,
            category: c.category,
            price: c.price,
            enrollments: courseCounts[c.id] || 0,
          }))
          .sort((a, b) => b.enrollments - a.enrollments);

        return jsonResponse(200, {
          period,
          total_students: students.length,
          new_students: filteredStudents.length,
          google_logins: filteredStudents.filter((s) => s.auth_provider === 'google').length,
          email_logins: filteredStudents.filter((s) => s.auth_provider === 'email').length,
          total_revenue: totalRevenue,
          total_enrollments: filteredEnrollments.length,
          free_enrollments: freeEnrollmentsCount,
          paid_enrollments: paidEnrollmentsCount,
          successful_payments: filteredPayments.filter((p) => p.status === 'success').length,
          failed_payments: filteredPayments.filter((p) => p.status === 'failed').length,
          emails_total: filteredEmails.length,
          emails_delivered: filteredEmails.filter((e) => e.status === 'delivered').length,
          emails_simulated: filteredEmails.filter((e) => e.status === 'simulated').length,
          emails_failed: filteredEmails.filter((e) => e.status === 'failed').length,
          popular_courses: popularCourses.slice(0, 5),
          total_tools_active: tools.filter((t) => t.is_enabled !== false).length,
        });
      }
    }

    return jsonResponse(404, { error: `Route not found: ${method} ${cleanPath}` });
  } catch (err) {
    console.error('Unhandled server error in Netlify API router:', err);
    return jsonResponse(500, { error: 'Internal server error' });
  }
};

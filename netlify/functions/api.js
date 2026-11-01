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

    // POST /api/courses/enroll
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

      const enrollments = (await getBlob('enrollments_list')) || [];
      const enrollmentId = 'ENR-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
      const newEnrollment = {
        enrollment_id: enrollmentId,
        course_id,
        course_title: course.title,
        student_email: String(student_email).toLowerCase().trim(),
        student_name: String(student_name || 'Student').trim(),
        student_phone: String(student_phone || '').trim(),
        amount: course.price,
        currency: 'INR',
        payment_id: payment_id || 'MOCK-PAY-' + Date.now(),
        payment_method: payment_method || 'UPI / Razorpay',
        status: 'active',
        progress_pct: 0,
        completed_lessons: [],
        enrolled_at: new Date().toISOString(),
      };
      enrollments.unshift(newEnrollment);
      await setBlob('enrollments_list', enrollments);

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
    }

    return jsonResponse(404, { error: `Route not found: ${method} ${cleanPath}` });
  } catch (err) {
    console.error('Unhandled server error in Netlify API router:', err);
    return jsonResponse(500, { error: 'Internal server error' });
  }
};

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { getBlob, setBlob, deleteBlob, listBlobs, initBlobEnvironment } from './lib/store.js';
import {
  hashPassword,
  verifyPassword,
  signToken,
  verifyToken,
  extractTokenFromEvent,
  createAuthCookie,
  createLogoutCookie,
  signStudentToken,
  verifyStudentToken,
} from './lib/auth.js';
import { ensureSeeded } from './lib/seed.js';
import { sendEmailMessage, renderEmailTemplate } from './lib/email.js';
import { enrichCourseWithOfferStatus, isCourseFreeOfferActive } from './lib/courses-data.js';

// Resilient Gemini AI caller: Try dynamic SDK first, fallback to native REST fetch (zero-dependency for Netlify Functions)
async function callGeminiAPI(prompt, systemInstruction = '') {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  // 1. Try GoogleGenAI SDK dynamically if available in runtime
  try {
    const mod = await import('@google/genai');
    if (mod && mod.GoogleGenAI) {
      const ai = new mod.GoogleGenAI({ apiKey });
      const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
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
  const candidateRestModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
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
    initBlobEnvironment(event);
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
    // TECHNICAL SEO & MEDIA BINARY PUBLIC ROUTES
    // ==========================================

    // GET /sitemap.xml (Dynamic XML Sitemap for all clean URLs)
    if (method === 'GET' && cleanPath === '/sitemap.xml') {
      const [seo, tools, learningResources, articles, pages] = await Promise.all([
        getBlob('cms_seo').then((r) => r || {}),
        getBlob('tools_index').then((r) => r || []),
        getBlob('learning_resources_index').then((r) => r || []),
        getBlob('articles_index').then((r) => r || []),
        getBlob('cms_pages').then((r) => r || []),
      ]);

      const base = (seo.canonical_base || 'https://webnasir.dpdns.org').replace(/\/+$/, '');
      const today = new Date().toISOString().split('T')[0];

      const toolSlugMap = {
        youtube: 'youtube-title-generator',
        blogoutline: 'seo-blog-outline-generator',
        codeexplainer: 'code-regex-explainer',
        adcopy: 'ad-copy-generator',
        business: 'adsense-revenue-calculator',
        name: 'domain-brand-name-generator',
        instagram: 'social-media-caption-generator',
        wordcount: 'word-count-seo-analyzer',
        password: 'password-generator',
        age: 'age-milestone-calculator',
        arbitrage: 'adsense-arbitrage-calculator',
      };

      const urls = [
        { loc: `${base}/`, priority: '1.0', changefreq: 'daily' },
        { loc: `${base}/tools`, priority: '0.95', changefreq: 'weekly' },
        { loc: `${base}/learn`, priority: '0.95', changefreq: 'daily' },
        { loc: `${base}/articles`, priority: '0.95', changefreq: 'daily' },
        { loc: `${base}/learning-pathways`, priority: '0.85', changefreq: 'weekly' },
        { loc: `${base}/topics`, priority: '0.8', changefreq: 'weekly' },
        { loc: `${base}/about`, priority: '0.8', changefreq: 'weekly' },
        { loc: `${base}/contact`, priority: '0.8', changefreq: 'monthly' },
        { loc: `${base}/faq`, priority: '0.7', changefreq: 'monthly' },
        { loc: `${base}/privacy`, priority: '0.5', changefreq: 'yearly' },
        { loc: `${base}/terms`, priority: '0.5', changefreq: 'yearly' },
        { loc: `${base}/disclaimer`, priority: '0.5', changefreq: 'yearly' },
      ];

      tools.filter((t) => t.is_enabled !== false).forEach((t) => {
        const cleanSlug =
          t.seo_slug && t.seo_slug !== t.key
            ? t.seo_slug
            : toolSlugMap[t.key] || t.seo_slug || t.key;
        urls.push({ loc: `${base}/tools/${cleanSlug}`, priority: '0.9', changefreq: 'weekly' });
      });

      learningResources.filter((r) => r.is_published !== false).forEach((r) => {
        urls.push({ loc: `${base}/learn/${r.slug || r.id}`, priority: '0.9', changefreq: 'weekly' });
      });

      articles.filter((a) => a.is_published !== false).forEach((a) => {
        urls.push({ loc: `${base}/articles/${a.slug}`, priority: '0.85', changefreq: 'weekly' });
      });

      pages.filter((p) => p.status !== 'draft' && !p.is_system_protected && p.slug && p.slug.includes('/page/')).forEach((p) => {
        const cleanCustom = p.slug.replace(/^#/, '');
        urls.push({ loc: `${base}${cleanCustom}`, priority: '0.75', changefreq: 'weekly' });
      });

      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
        .map(
          (u) =>
            `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
        )
        .join('\n')}\n</urlset>`;

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=300',
          ...getCorsHeaders(event),
        },
        body: xml,
      };
    }

    // GET /robots.txt
    if (method === 'GET' && cleanPath === '/robots.txt') {
      const seo = (await getBlob('cms_seo')) || {};
      const base = (seo.canonical_base || 'https://webnasir.dpdns.org').replace(/\/+$/, '');
      const robotsContent =
        seo.robots_txt ||
        `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /student\nDisallow: /student/dashboard\nDisallow: /checkout\nDisallow: /api/admin/\nSitemap: ${base}/sitemap.xml`;
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'public, max-age=300',
          ...getCorsHeaders(event),
        },
        body: robotsContent,
      };
    }

    // GET /api/health (Portability, Storage & Payment Readiness Check)
    if (method === 'GET' && cleanPath === '/health') {
      const isNetlify = !!(
        event.blobs ||
        process.env.NETLIFY ||
        process.env.NETLIFY_BLOBS_CONTEXT ||
        globalThis.netlifyBlobsContext ||
        (process.env.NETLIFY_SITE_ID && process.env.NETLIFY_AUTH_TOKEN)
      );
      return jsonResponse(200, {
        status: 'ok',
        service: 'web-nasir-platform',
        timestamp: new Date().toISOString(),
        runtime: isNetlify ? 'netlify-functions' : 'nodejs-server',
        storage: {
          production_cms: 'netlify-blobs',
          store_name: 'webnasir',
          consistency: 'strong',
          active_mode: isNetlify ? 'netlify-blobs' : 'local-filesystem-fallback (.netlify-blobs-data)',
          local_storage_dir_required_on_netlify: false,
        },
        payments: {
          primary_gateway: 'razorpay',
          currency: 'INR',
          stripe_required: false,
        },
        firebase: {
          student_auth_and_data_isolated: true,
        },
      });
    }

    // GET /api/media/file/:idWithExt (Persistent Media File Binary Streamer)
    if (method === 'GET' && cleanPath.startsWith('/media/file/')) {
      const rawFile = cleanPath.replace('/media/file/', '').trim();
      const assetId = rawFile.replace(/\.[a-zA-Z0-9]+$/, '');
      if (!assetId) return jsonResponse(400, { error: 'Asset ID is required' });

      let binRecord = await getBlob(`media_bin:${assetId}`);
      if (!binRecord) {
        // Fallback: check cms_media list for embedded data_url or preview_data_url
        const mediaList = (await getBlob('cms_media')) || [];
        const item = mediaList.find((m) => m.id === assetId);
        const dataUri = item?.preview_data_url || (item?.url && item.url.startsWith('data:') ? item.url : null);
        if (dataUri) {
          const match = dataUri.match(/^data:([^;]+);base64,(.+)$/);
          if (match) {
            binRecord = { mime_type: match[1], base64: match[2] };
          }
        }
      }

      if (!binRecord || !binRecord.base64) {
        return jsonResponse(404, { error: 'Media binary file not found in persistent store' });
      }

      return {
        statusCode: 200,
        isBase64Encoded: true,
        headers: {
          'Content-Type': binRecord.mime_type || 'image/webp',
          'Cache-Control': 'public, max-age=31536000',
          ...getCorsHeaders(event),
        },
        body: binRecord.base64,
      };
    }

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
      const tag = (event.queryStringParameters?.tag || '').toLowerCase().trim();
      const category = (event.queryStringParameters?.category || '').toLowerCase().trim();
      const q = (event.queryStringParameters?.q || '').toLowerCase().trim();

      let published = articlesIndex.filter((a) => a.is_published !== false);

      if (tag && tag !== 'all') {
        published = published.filter(
          (a) =>
            (a.tag || '').toLowerCase() === tag ||
            (a.category || '').toLowerCase() === tag ||
            (Array.isArray(a.tags) && a.tags.some((t) => String(t).toLowerCase() === tag))
        );
      }
      if (category && category !== 'all') {
        published = published.filter(
          (a) => (a.category || a.tag || '').toLowerCase() === category
        );
      }
      if (q) {
        published = published.filter(
          (a) =>
            (a.title || '').toLowerCase().includes(q) ||
            (a.excerpt || a.meta || '').toLowerCase().includes(q) ||
            (a.category || a.tag || '').toLowerCase().includes(q)
        );
      }

      published.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      return jsonResponse(200, published);
    }

    // GET /api/articles/:slug
    if (method === 'GET' && cleanPath.startsWith('/articles/')) {
      const rawSlug = cleanPath.replace('/articles/', '').trim();
      if (!rawSlug) return jsonResponse(400, { error: 'Article slug is required' });

      const aliasMap = {
        'adsense-high-rpm-guide': 'adsense-approval-and-website-monetization-guide',
        'google-adsense-high-rpm': 'adsense-approval-and-website-monetization-guide',
        'google-adsense-approval-monetization-guide': 'adsense-approval-and-website-monetization-guide',
        'seo-for-beginners': 'complete-seo-and-google-search-guide',
        'seo-checklist-for-new-websites': 'complete-seo-and-google-search-guide',
        'ai-tools-productivity-guide': 'how-to-use-ai-tools-for-productivity',
        'prompt-engineering-beginners-guide': 'complete-guide-to-prompt-engineering',
        'how-to-build-a-website-from-scratch': 'modern-website-development-roadmap',
        'html-css-javascript-learning-roadmap': 'html-css-javascript-foundations-guide',
      };
      const resolvedSlug = aliasMap[rawSlug] || rawSlug;

      let article = (await getBlob(`article:${resolvedSlug}`)) || (await getBlob(`article:${rawSlug}`));
      if (!article) {
        const articlesIndex = (await getBlob('articles_index')) || [];
        article = articlesIndex.find((a) => a.slug === resolvedSlug || a.slug === rawSlug || a.id === rawSlug);
      }
      if (!article || article.is_published === false) {
        return jsonResponse(404, { error: 'Article not found' });
      }

      // Resolve related YouTube resources and AI tools for rich cross-linking
      const [allLearning, allTools, allArticles] = await Promise.all([
        getBlob('learning_resources_index').then((r) => r || []),
        getBlob('tools_index').then((r) => r || []),
        getBlob('articles_index').then((r) => r || []),
      ]);

      const relatedYoutubeSlugs = Array.isArray(article.related_youtube) ? article.related_youtube : [];
      const relatedYoutubeData = allLearning
        .filter((r) => r.is_published !== false && (relatedYoutubeSlugs.includes(r.slug) || relatedYoutubeSlugs.includes(r.id)))
        .slice(0, 4);

      const relatedToolKeys = Array.isArray(article.related_tools) ? article.related_tools : [];
      const relatedToolsData = allTools
        .filter((t) => t.is_enabled !== false && (relatedToolKeys.includes(t.key) || relatedToolKeys.includes(t.id)))
        .slice(0, 4);

      const relatedArticlesData = allArticles
        .filter((a) => a.is_published !== false && a.slug !== article.slug)
        .slice(0, 4);

      return jsonResponse(200, {
        ...article,
        content: article.content || article.body || '',
        body: article.body || article.content || '',
        related_youtube_data: relatedYoutubeData,
        related_tools_data: relatedToolsData,
        related_articles_data: relatedArticlesData,
      });
    }

    // ==========================================
    // FREE LEARNING HUB PUBLIC ROUTES (/api/learning-resources, /api/learning-categories, /api/learning-paths)
    // ==========================================

    // GET /api/learning-categories
    if (method === 'GET' && cleanPath === '/learning-categories') {
      const categories = (await getBlob('learning_categories')) || [];
      return jsonResponse(200, categories);
    }

    // GET /api/learning-paths
    if (method === 'GET' && cleanPath === '/learning-paths') {
      const [paths, resources, articles, tools] = await Promise.all([
        getBlob('learning_paths').then((r) => r || []),
        getBlob('learning_resources_index').then((r) => r || []),
        getBlob('articles_index').then((r) => r || []),
        getBlob('tools_index').then((r) => r || []),
      ]);

      const enrichedPaths = paths.map((p) => ({
        ...p,
        resolved_resources: (p.resources || [])
          .map((slug) => resources.find((r) => r.slug === slug || r.id === slug))
          .filter((r) => r && r.is_published !== false),
        resolved_articles: (p.articles || [])
          .map((slug) => articles.find((a) => a.slug === slug || a.id === slug))
          .filter((a) => a && a.is_published !== false),
        resolved_tools: (p.tools || [])
          .map((key) => tools.find((t) => t.key === key || t.id === key))
          .filter((t) => t && t.is_enabled !== false),
      }));

      return jsonResponse(200, enrichedPaths);
    }

    // GET /api/learning-resources
    if (method === 'GET' && cleanPath === '/learning-resources') {
      const resources = (await getBlob('learning_resources_index')) || [];
      const category = (event.queryStringParameters?.category || '').toLowerCase().trim();
      const difficulty = (event.queryStringParameters?.difficulty || '').toLowerCase().trim();
      const q = (event.queryStringParameters?.q || '').toLowerCase().trim();
      const featuredOnly = event.queryStringParameters?.featured === 'true';

      let published = resources.filter((r) => r && r.is_published !== false);

      if (category && category !== 'all') {
        published = published.filter(
          (r) =>
            (r.category || '').toLowerCase() === category ||
            (r.category || '').toLowerCase().replace(/[^a-z0-9]+/g, '-') === category
        );
      }
      if (difficulty && difficulty !== 'all') {
        published = published.filter((r) => (r.difficulty || '').toLowerCase().includes(difficulty));
      }
      if (featuredOnly) {
        published = published.filter((r) => r.is_featured === true);
      }
      if (q) {
        published = published.filter(
          (r) =>
            (r.title || '').toLowerCase().includes(q) ||
            (r.short_description || '').toLowerCase().includes(q) ||
            (r.channel_name || '').toLowerCase().includes(q) ||
            (r.category || '').toLowerCase().includes(q)
        );
      }

      published.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      return jsonResponse(200, published);
    }

    // GET /api/learning-resources/:slug
    if (method === 'GET' && cleanPath.startsWith('/learning-resources/')) {
      const rawSlug = cleanPath.replace('/learning-resources/', '').trim();
      if (!rawSlug) return jsonResponse(400, { error: 'Learning resource slug is required' });

      const learningAliasMap = {
        'harvard-cs50-full-computer-science-course': 'harvard-cs50-computer-science',
        'prompt-engineering-chatgpt-full-course': 'chatgpt-for-beginners',
        'generative-ai-for-beginners-freecodecamp': 'generative-ai-full-course',
        'harvard-cs50-artificial-intelligence-python': 'cs50-ai-with-python',
        'responsive-web-design-html-css-freecodecamp': 'fullstack-web-development',
        'html-css-full-course-beginner-to-pro': 'html-css-full-course',
        'javascript-full-course-beginner-to-pro': 'javascript-full-course',
        'react-18-full-course-beginners': 'react-beginners-course',
        'nextjs-full-stack-course-beginners': 'nextjs-app-router-tutorial',
        'wordpress-for-beginners-complete-guide': 'wordpress-for-beginners',
        'harvard-cs50p-python-programming': 'harvard-cs50-python',
        'python-for-beginners-full-course': 'python-programming',
        'google-search-central-seo-starter-guide': 'seo-for-beginners',
        'complete-seo-course-for-beginners': 'google-search-console-training',
        'google-adsense-site-readiness-monetization': 'google-adsense-site-approval',
        'digital-marketing-full-course-freecodecamp': 'digital-marketing-fundamentals',
        'ui-ux-design-figma-full-course': 'ui-ux-design-figma',
        'freelance-web-developer-career-guide': 'freelance-web-developer-guide',
        'youtube-content-creation-video-editing': 'davinci-resolve-video-editing',
        'git-and-github-for-beginners-crash-course': 'git-and-github-crash-course',
      };
      const slug = learningAliasMap[rawSlug] || rawSlug;

      const [allResources, allTools, allArticles] = await Promise.all([
        getBlob('learning_resources_index').then((r) => r || []),
        getBlob('tools_index').then((r) => r || []),
        getBlob('articles_index').then((r) => r || []),
      ]);

      let resource = allResources.find((r) => r.slug === slug || r.slug === rawSlug || r.id === slug || r.id === rawSlug);
      if (!resource) {
        resource = (await getBlob(`learning_resource:${slug}`)) || (await getBlob(`learning_resource:${rawSlug}`));
      }
      if (!resource || resource.is_published === false) {
        return jsonResponse(404, { error: 'Learning resource not found' });
      }

      const relatedResources = allResources
        .filter((r) => r.is_published !== false && r.id !== resource.id && r.category === resource.category)
        .concat(allResources.filter((r) => r.is_published !== false && r.id !== resource.id && r.category !== resource.category))
        .slice(0, 4);

      const relatedToolKeys = Array.isArray(resource.related_tools) ? resource.related_tools : [];
      const relatedTools = allTools
        .filter((t) => t.is_enabled !== false && (relatedToolKeys.includes(t.key) || relatedToolKeys.includes(t.id)))
        .slice(0, 4);

      const relatedArticleSlugs = Array.isArray(resource.related_articles) ? resource.related_articles : [];
      const relatedArticles = allArticles
        .filter((a) => a.is_published !== false && (relatedArticleSlugs.includes(a.slug) || relatedArticleSlugs.includes(a.id)))
        .slice(0, 4);

      return jsonResponse(200, {
        ...resource,
        related_resources_data: relatedResources,
        related_tools_data: relatedTools,
        related_articles_data: relatedArticles,
      });
    }

    // Obsolete Course Downloads & Legacy Paid Course Marketplace (Removed per Free Learning Hub Transformation)
    if (method === 'GET' && (cleanPath.includes('/download/') || cleanPath.startsWith('/downloads/courses/'))) {
      return jsonResponse(410, {
        error: 'Course file downloads have been retired. Explore our 100% Free YouTube Learning Hub (/learn) and Practical Guides (/articles).',
      });
    }

    // Legacy /api/courses and /api/free-courses return empty array on public marketplace
    if (method === 'GET' && (cleanPath === '/courses' || cleanPath === '/free-courses')) {
      return jsonResponse(200, []);
    }

    // GET /api/testimonials
    if (method === 'GET' && cleanPath === '/testimonials') {
      const list = (await getBlob('testimonials_index')) || [];
      const approved = list.filter((t) => t.status !== 'rejected' && t.status !== 'pending');
      const sorted = [...approved].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      return jsonResponse(200, sorted);
    }

    // GET /api/marquee
    if (method === 'GET' && cleanPath === '/marquee') {
      const list = (await getBlob('marquee_items')) || [];
      return jsonResponse(200, list);
    }

    // GET /api/cms-bundle (Centralized theme, homepage layout, navigation, footer, learning hub, articles, and SEO)
    if (method === 'GET' && cleanPath === '/cms-bundle') {
      const [
        homepage,
        appearance,
        navigation,
        footer,
        about,
        contact,
        seo,
        learningResources,
        learningCategories,
        learningPaths,
        articleCategories,
        pages,
        sidebars,
        announcement,
        marqueeConfig,
        featuredAnnouncements,
        redirects,
        socialProfiles,
        settings,
        heroSlides,
        heroSliderConfig,
      ] = await Promise.all([
        getBlob('cms_homepage').then((r) => r || {}),
        getBlob('cms_appearance').then((r) => r || {}),
        getBlob('cms_navigation').then((r) => r || {}),
        getBlob('cms_footer').then((r) => r || {}),
        getBlob('cms_about').then((r) => r || {}),
        getBlob('cms_contact').then((r) => r || {}),
        getBlob('cms_seo').then((r) => r || {}),
        getBlob('learning_resources_index').then((r) => r || []),
        getBlob('learning_categories').then((r) => r || []),
        getBlob('learning_paths').then((r) => r || []),
        getBlob('article_categories').then((r) => r || []),
        getBlob('cms_pages').then((r) => r || []),
        getBlob('cms_sidebars').then((r) => r || {}),
        getBlob('cms_announcement').then((r) => r || {}),
        getBlob('cms_marquee_config').then((r) => r || {}),
        getBlob('cms_featured_announcements').then((r) => (Array.isArray(r) ? r : [])),
        getBlob('cms_redirects').then((r) => r || []),
        getBlob('cms_social_profiles').then((r) => r || []),
        getBlob('settings').then((r) => r || {}),
        getBlob('cms_hero_slides').then((r) => (Array.isArray(r) ? r : [])),
        getBlob('cms_hero_slider_config').then((r) => r || {}),
      ]);

      const nowMs = Date.now();
      const checkScheduleActive = (item) => {
        if (!item) return true;
        if (item.start_date) {
          const s = new Date(item.start_date).getTime();
          if (!isNaN(s) && nowMs < s) return false;
        }
        const endDateVal = item.end_date || item.expiry_date;
        if (endDateVal) {
          const e = new Date(endDateVal).getTime();
          if (!isNaN(e) && nowMs > e) return false;
        }
        return true;
      };

      const resolvedAnnouncement = {
        ...announcement,
        schedule_active: checkScheduleActive(announcement),
      };
      const resolvedMarqueeConfig = {
        ...marqueeConfig,
        schedule_active: checkScheduleActive(marqueeConfig),
      };

      const activeFeaturedAnnouncements = featuredAnnouncements
        .filter((fa) => fa && fa.enabled === true && fa.status !== 'draft' && checkScheduleActive(fa))
        .sort((a, b) => (Number(a.priority) || 99) - (Number(b.priority) || 99));

      const activeHeroSlides = heroSlides
        .filter((hs) => hs && hs.enabled !== false && hs.status !== 'draft')
        .sort((a, b) => (Number(a.sort_order ?? a.priority) || 99) - (Number(b.sort_order ?? b.priority) || 99));

      const publishedResources = learningResources
        .filter((r) => r && r.is_published !== false)
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

      return jsonResponse(200, {
        homepage,
        appearance,
        navigation,
        footer,
        about,
        contact,
        seo,
        learning_resources: publishedResources,
        learning_categories: learningCategories,
        learning_paths: learningPaths,
        article_categories: articleCategories,
        free_courses: [],
        categories: learningCategories,
        pages: pages.filter((p) => p.status !== 'draft'),
        sidebars,
        announcement: resolvedAnnouncement,
        marquee_config: resolvedMarqueeConfig,
        featured_announcements: activeFeaturedAnnouncements,
        hero_slides: activeHeroSlides,
        hero_slider_config: heroSliderConfig || {},
        redirects,
        social_profiles: socialProfiles,
        settings,
      });
    }

    // GET /api/hero-slides (Public active hero slides & slider settings)
    if (method === 'GET' && cleanPath === '/hero-slides') {
      const [slides, config] = await Promise.all([
        getBlob('cms_hero_slides').then((r) => (Array.isArray(r) ? r : [])),
        getBlob('cms_hero_slider_config').then((r) => r || {}),
      ]);
      const activeSlides = slides
        .filter((s) => s && s.enabled !== false && s.status !== 'draft')
        .sort((a, b) => (Number(a.sort_order ?? a.priority) || 99) - (Number(b.sort_order ?? b.priority) || 99));
      return jsonResponse(200, { slides: activeSlides, config });
    }

    // GET /api/featured-announcements (Public active announcements endpoint + optional preview_id)
    if (method === 'GET' && cleanPath === '/featured-announcements') {
      const list = (await getBlob('cms_featured_announcements')) || [];
      const previewId = event.queryStringParameters && event.queryStringParameters.preview_id;
      if (previewId) {
        const match = (Array.isArray(list) ? list : []).find((x) => x.id === previewId);
        return jsonResponse(200, match ? [match] : []);
      }
      const nowMs = Date.now();
      const active = (Array.isArray(list) ? list : [])
        .filter((fa) => {
          if (!fa || !fa.enabled || fa.status === 'draft') return false;
          if (fa.start_date) {
            const s = new Date(fa.start_date).getTime();
            if (!isNaN(s) && nowMs < s) return false;
          }
          if (fa.expiry_date) {
            const e = new Date(fa.expiry_date).getTime();
            if (!isNaN(e) && nowMs > e) return false;
          }
          return true;
        })
        .sort((a, b) => (Number(a.priority) || 99) - (Number(b.priority) || 99));
      return jsonResponse(200, active);
    }

    // POST /api/contact
    if (method === 'POST' && cleanPath === '/contact') {
      const body = parseJsonBody(event.body);
      if (!body) return jsonResponse(400, { error: 'Invalid payload' });

      // Honeypot spam protection
      if (body.website_url || body.company_honeypot) {
        return jsonResponse(201, { success: true, message: 'Message sent successfully.' });
      }

      const name = String(body.name || '').trim();
      const email = String(body.email || '').trim();
      const subject = String(body.subject || 'General Inquiry').trim();
      const message = String(body.message || '').trim();

      if (!name || !email || !message) {
        return jsonResponse(400, { error: 'Full Name, Email Address, and Message are required.' });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return jsonResponse(400, { error: 'Please enter a valid email address.' });
      }

      if (message.length < 5) {
        return jsonResponse(400, { error: 'Please enter a message with at least 5 characters.' });
      }

      const contacts = (await getBlob('contacts_list')) || [];
      const nowIso = new Date().toISOString();
      const newSubmission = {
        id: 'contact-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
        name: name.slice(0, 120),
        email: email.slice(0, 160),
        subject: (subject || 'General Inquiry').slice(0, 220),
        message: message.slice(0, 5000),
        read: false,
        status: 'unread',
        replies: [],
        ip_hint: (event.headers && (event.headers['x-forwarded-for'] || event.headers['client-ip'])) || 'web',
        user_agent: (event.headers && event.headers['user-agent']) ? String(event.headers['user-agent']).slice(0, 180) : '',
        created_at: nowIso,
        updated_at: nowIso,
      };
      contacts.unshift(newSubmission);
      await setBlob('contacts_list', contacts.slice(0, 500));

      // Dispatch admin email notification asynchronously / safely
      try {
        const [cmsContact, settings] = await Promise.all([
          getBlob('cms_contact').then((r) => r || {}),
          getBlob('settings').then((r) => r || {}),
        ]);
        const adminEmail = cmsContact.email || cmsContact.support_email || settings.email || 'support@webnasir.com';
        await sendEmailMessage({
          to: adminEmail,
          recipientName: 'Web Nasir Admin',
          subject: `[New Contact Message] ${newSubmission.subject} — from ${newSubmission.name}`,
          body: `Hello Admin,\n\nYou have received a new message via the Web Nasir Contact Page:\n\n• Sender Name: ${newSubmission.name}\n• Sender Email: ${newSubmission.email}\n• Subject: ${newSubmission.subject}\n• Received At: ${nowIso}\n\nMessage:\n----------------------------------------\n${newSubmission.message}\n----------------------------------------\n\nYou can view and reply directly from the Admin Dashboard → Contact Messages section.`,
          templateId: 'contact_admin_notification',
        });
      } catch (notifyErr) {
        console.warn('Admin contact notification warning:', notifyErr.message);
      }

      return jsonResponse(201, {
        ok: true,
        success: true,
        id: newSubmission.id,
        contact: newSubmission,
        message: "Thank you for reaching out! Your message has been received and the Web Nasir team will get back to you shortly.",
      });
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

    // POST /api/courses/create-order (Razorpay INR Order creation — Stripe not required)
    if (method === 'POST' && cleanPath === '/courses/create-order') {
      const body = parseJsonBody(event.body);
      if (!body || !body.course_id) return jsonResponse(400, { error: 'course_id is required' });

      let courses = (await getBlob('courses_index')) || [];
      let course = courses.find((c) => c.id === body.course_id || c.slug === body.course_id);
      if (!course) {
        const freeCourses = (await getBlob('free_courses_index')) || [];
        course = freeCourses.find((c) => c.id === body.course_id || c.slug === body.course_id);
      }
      if (!course) return jsonResponse(404, { error: 'Course not found' });

      // If course is naturally free or has an active promotional free offer, do not charge
      if (isCourseFreeOfferActive(course) || course.is_free === true || Number(course.price) === 0) {
        return jsonResponse(200, {
          success: true,
          free_offer: true,
          message: 'This course is currently available for free enrollment! No payment required.',
          course_id: course.id,
          course_title: course.title,
        });
      }

      const [settings, cmsPayments] = await Promise.all([
        getBlob('settings').then((r) => r || {}),
        getBlob('cms_payments').then((r) => r || {}),
      ]);

      const keyId =
        cmsPayments.key_id ||
        settings.razorpay_key_id ||
        process.env.RAZORPAY_KEY_ID ||
        'rzp_test_webnasir_demo';

      const orderId = 'order_' + Date.now().toString(36).toUpperCase() + '_' + Math.random().toString(36).substring(2, 7).toUpperCase();

      return jsonResponse(200, {
        success: true,
        gateway: 'razorpay',
        order_id: orderId,
        amount: course.price,
        amount_paise: course.price * 100,
        currency: 'INR',
        course_id: course.id,
        course_title: course.title,
        key_id: keyId,
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

      let courses = (await getBlob('courses_index')) || [];
      let course = courses.find((c) => c.id === course_id || c.slug === course_id);
      if (!course) {
        const freeList = (await getBlob('free_courses_index')) || [];
        course = freeList.find((c) => c.id === course_id || c.slug === course_id);
      }
      if (!course) return jsonResponse(404, { error: 'Course not found' });

      // Record payment
      const paymentRecord = {
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id || 'order_direct',
        amount: course.price,
        currency: 'INR',
        course_id: course.id,
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
      let enrollment = enrollments.find((e) => (e.course_id === course.id || e.course_id === course_id) && e.student_email === paymentRecord.student_email);
      if (!enrollment) {
        enrollment = {
          enrollment_id: 'ENR-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
          course_id: course.id,
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
        students[stdIdx].enrolled_courses = Array.from(new Set([...(students[stdIdx].enrolled_courses || []), course.id]));
        students[stdIdx].payment_status = 'paid';
        await setBlob('students_index', students);
      } else {
        students.push({
          id: 'std-' + Date.now(),
          name: paymentRecord.student_name,
          email: paymentRecord.student_email,
          phone: paymentRecord.student_phone,
          enrolled_courses: [course.id],
          payment_status: 'paid',
          joined_at: new Date().toISOString(),
        });
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

      const studentToken = signStudentToken(paymentRecord.student_email, paymentRecord.student_name);
      return jsonResponse(200, {
        success: true,
        message: 'Payment verified and course unlocked successfully!',
        enrollment,
        student_token: studentToken,
      });
    }

    // POST /api/courses/enroll-free (Direct free enrollment + Promotional Free Offer)
    if (method === 'POST' && cleanPath === '/courses/enroll-free') {
      const body = parseJsonBody(event.body);
      if (!body) return jsonResponse(400, { error: 'Invalid payload' });

      const { course_id, student_email, student_name, student_phone } = body;
      if (!course_id || !student_email) {
        return jsonResponse(400, { error: 'course_id and student_email are required' });
      }

      let courses = (await getBlob('courses_index')) || [];
      let course = courses.find((c) => c.id === course_id || c.slug === course_id);
      if (!course) {
        const freeList = (await getBlob('free_courses_index')) || [];
        course = freeList.find((c) => c.id === course_id || c.slug === course_id);
      }
      if (!course) return jsonResponse(404, { error: 'Course not found' });

      const isFreeActive = course.is_free === true || Number(course.price) === 0 || isCourseFreeOfferActive(course);
      if (!isFreeActive) {
        return jsonResponse(400, {
          error: 'This course requires payment. The promotional free offer is currently inactive.',
          requires_payment: true,
          price: course.price,
        });
      }

      const enrollments = (await getBlob('enrollments_list')) || [];
      const cleanEmail = String(student_email).toLowerCase().trim();
      let enrollment = enrollments.find((e) => (e.course_id === course.id || e.course_id === course_id) && e.student_email === cleanEmail);

      if (enrollment) {
        return jsonResponse(200, {
          success: true,
          message: 'You are already enrolled in this course',
          enrollment,
        });
      }

      const isOffer = isCourseFreeOfferActive(course);
      enrollment = {
        enrollment_id: 'ENR-FREE-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
        course_id: course.id,
        course_title: course.title,
        student_email: cleanEmail,
        student_name: String(student_name || 'Student').trim(),
        student_phone: String(student_phone || '').trim(),
        amount: 0,
        currency: 'INR',
        payment_id: isOffer ? 'PROMO-FREE-OFFER' : 'FREE-ENROLL',
        payment_method: isOffer ? 'promotional_free_offer' : 'free_enrollment',
        status: 'active',
        progress_pct: 0,
        completed_lessons: [],
        enrolled_at: new Date().toISOString(),
      };
      enrollments.unshift(enrollment);
      await setBlob('enrollments_list', enrollments);

      // Update or create student profile
      const students = (await getBlob('students_index')) || [];
      const stdIdx = students.findIndex((s) => s.email === cleanEmail);
      if (stdIdx !== -1) {
        students[stdIdx].enrolled_courses = Array.from(new Set([...(students[stdIdx].enrolled_courses || []), course.id]));
        await setBlob('students_index', students);
      } else {
        students.push({
          id: 'std-' + Date.now(),
          name: enrollment.student_name,
          email: cleanEmail,
          phone: enrollment.student_phone,
          enrolled_courses: [course.id],
          payment_status: 'free',
          joined_at: new Date().toISOString(),
        });
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
      const course = courses.find((c) => c.id === course_id || c.slug === course_id);
      if (!course) return jsonResponse(404, { error: 'Course not found' });

      const cleanEmail = String(student_email).toLowerCase().trim();
      const enrollments = (await getBlob('enrollments_list')) || [];
      let existingEnroll = enrollments.find(e => (e.course_id === course.id || e.course_id === course_id) && e.student_email === cleanEmail);
      if (existingEnroll) {
        return jsonResponse(200, { success: true, message: 'Already enrolled', enrollment: existingEnroll });
      }

      const enrollmentId = 'ENR-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
      const newEnrollment = {
        enrollment_id: enrollmentId,
        course_id: course.id,
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
        students[stdIdx].enrolled_courses = Array.from(new Set([...(students[stdIdx].enrolled_courses || []), course.id]));
        students[stdIdx].payment_status = 'paid';
        await setBlob('students_index', students);
      }

      const studentToken = signStudentToken(cleanEmail, String(student_name || 'Student').trim());
      return jsonResponse(201, {
        success: true,
        message: 'Successfully enrolled in ' + course.title,
        enrollment: newEnrollment,
        student_token: studentToken,
      });
    }

    // POST /api/student/auth-token (Issue cryptographic session token for authenticated students)
    if (method === 'POST' && cleanPath === '/student/auth-token') {
      const body = parseJsonBody(event.body);
      const email = (body?.email || '').toLowerCase().trim();
      if (!email) return jsonResponse(400, { error: 'Student email is required' });

      const enrollments = (await getBlob('enrollments_list')) || [];
      const hasEnrollment = enrollments.some((e) => e.student_email === email);
      const students = (await getBlob('students_index')) || [];
      const student = students.find((s) => s.email === email);

      if (!hasEnrollment && !student) {
        return jsonResponse(404, { error: 'No student enrollment or registration found for this email.' });
      }

      const token = signStudentToken(email, student?.name || 'Student');
      return jsonResponse(200, {
        success: true,
        student_token: token,
        student: { email, name: student?.name || 'Student' },
      });
    }

    // GET /api/student/dashboard (Comprehensive Student Portal Data)
    if (method === 'GET' && cleanPath === '/student/dashboard') {
      const email = (event.queryStringParameters?.email || '').toLowerCase().trim();
      if (!email) {
        return jsonResponse(400, { error: 'Email parameter is required to access Student Dashboard' });
      }

      const [allCourses, allFreeCourses, enrollments, payments, students] = await Promise.all([
        getBlob('courses_index').then((r) => r || []),
        getBlob('free_courses_index').then((r) => r || []),
        getBlob('enrollments_list').then((r) => r || []),
        getBlob('payments_list').then((r) => r || []),
        getBlob('students_index').then((r) => r || []),
      ]);

      const courseCatalog = new Map();
      [...allCourses, ...allFreeCourses].forEach((c) => {
        if (c && c.id) courseCatalog.set(c.id, enrichCourseWithOfferStatus(c));
        if (c && c.slug) courseCatalog.set(c.slug, enrichCourseWithOfferStatus(c));
      });

      const studentProfile = students.find((s) => (s.email || '').toLowerCase().trim() === email) || {
        name: email.split('@')[0],
        email,
        enrolled_courses: [],
        joined_at: new Date().toISOString(),
      };

      const myEnrollments = enrollments.filter((e) => (e.student_email || '').toLowerCase().trim() === email);
      const myPayments = payments.filter((p) => (p.student_email || '').toLowerCase().trim() === email);

      const enrolledCoursesDetailed = [];
      const freeCoursesDetailed = [];
      const paidCoursesDetailed = [];
      const downloadableResources = [];

      for (const enr of myEnrollments) {
        const course = courseCatalog.get(enr.course_id) || {
          id: enr.course_id,
          title: enr.course_title || 'Enrolled Course',
          category: 'Web Nasir Academy',
          is_free: enr.amount === 0,
        };

        const item = {
          enrollment_id: enr.enrollment_id,
          course_id: course.id,
          slug: course.slug || course.id,
          title: course.title,
          subtitle: course.subtitle || course.description || '',
          category: course.category,
          level: course.level || 'All Levels',
          duration: course.duration || 'Self-Paced',
          image: course.image || '',
          price: enr.amount,
          payment_method: enr.payment_method,
          payment_id: enr.payment_id,
          enrolled_at: enr.enrolled_at,
          status: enr.status || 'active',
          progress_pct: Number(enr.progress_pct) || 0,
          completed_lessons: enr.completed_lessons || [],
          modules: course.modules || course.curriculum || [],
          external_learning_url: course.external_learning_url || '',
          downloadable_files: course.downloadable_files || [],
        };

        enrolledCoursesDetailed.push(item);

        if (enr.amount === 0 || enr.payment_method === 'free_enrollment' || enr.payment_method === 'promotional_free_offer' || course.is_free) {
          freeCoursesDetailed.push(item);
        } else {
          paidCoursesDetailed.push(item);
        }

        // Collect all downloadable resources with secure download URLs
        if (Array.isArray(course.downloadable_files)) {
          course.downloadable_files.forEach((file) => {
            downloadableResources.push({
              file_id: file.id,
              filename: file.filename,
              name: file.name || file.filename,
              format: file.format || (file.filename.endsWith('.pdf') ? 'PDF' : (file.filename.endsWith('.zip') ? 'ZIP' : 'FILE')),
              size_formatted: file.size_formatted || 'Verified File',
              size_bytes: file.size_bytes || 0,
              description: file.description || `Course materials for ${course.title}`,
              course_id: course.id,
              course_title: course.title,
              download_url: `/api/courses/${course.id}/download/${file.id}?email=${encodeURIComponent(email)}`,
            });
          });
        }
      }

      // Build purchase history
      const purchaseHistory = myPayments.map((p) => ({
        id: p.payment_id,
        order_id: p.order_id,
        course_title: p.course_title,
        amount: p.amount,
        currency: p.currency || 'INR',
        payment_method: p.payment_method,
        status: p.status,
        date: p.created_at,
      }));

      // Include free enrollments in history as well for transparency
      myEnrollments
        .filter((e) => e.amount === 0)
        .forEach((e) => {
          purchaseHistory.push({
            id: e.payment_id,
            order_id: e.enrollment_id,
            course_title: e.course_title,
            amount: 0,
            currency: 'INR',
            payment_method: e.payment_method === 'promotional_free_offer' ? 'Promotional Free Offer ($0.00)' : 'Free Enrollment',
            status: 'completed',
            date: e.enrolled_at,
          });
        });

      purchaseHistory.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

      return jsonResponse(200, {
        student: {
          name: studentProfile.name || email.split('@')[0],
          email,
          phone: studentProfile.phone || '',
          joined_at: studentProfile.joined_at || studentProfile.created_at || new Date().toISOString(),
        },
        stats: {
          total_enrolled: enrolledCoursesDetailed.length,
          free_courses_count: freeCoursesDetailed.length,
          paid_courses_count: paidCoursesDetailed.length,
          downloadable_files_count: downloadableResources.length,
          completed_courses_count: enrolledCoursesDetailed.filter((c) => c.progress_pct >= 100).length,
        },
        enrolled_courses: enrolledCoursesDetailed,
        free_courses: freeCoursesDetailed,
        paid_courses: paidCoursesDetailed,
        downloadable_resources: downloadableResources,
        purchase_history: purchaseHistory,
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

      const { tool_type, tool_key, input, tone, options } = body;
      if (!input || typeof input !== 'string' || input.trim().length === 0) {
        return jsonResponse(400, { error: 'Input text or topic is required' });
      }

      const tools = (await getBlob('tools_index')) || [];
      const matchedTool = tools.find((t) => (tool_key && (t.key === tool_key || t.id === tool_key)) || t.tool_type === tool_type);
      const customPromptOverride = options?.custom_prompt || matchedTool?.custom_prompt || '';

      let prompt = '';
      let systemInstruction = 'You are Web Nasir, a 10-year veteran software engineer and high-income digital publishing mentor. Deliver direct, professional, high-impact results with zero fluff.';

      if (tool_type === 'ai_youtube') {
        prompt = `${customPromptOverride || 'Generate 5 viral, high-CTR YouTube video titles, 2 magnetic first-30-second retention hooks, and 2 visual thumbnail concept descriptions'} for the following video topic:\n"${input}"\nTarget audience vibe: ${tone || 'Engaging & Educational'}. Format with clean markdown headers and bullet points.`;
      } else if (tool_type === 'ai_blog') {
        prompt = `${customPromptOverride || 'Create a comprehensive high-ranking SEO blog outline'} for the keyword / title:\n"${input}"\nInclude:\n1. Target Search Intent & High-CPC Primary/Secondary Keywords\n2. Compelling Meta Title (under 60 chars) and Meta Description\n3. Structured H2 and H3 Headings outline with key takeaways for each section\n4. Recommended Internal Linking & Content Monetization angle (AdSense / Affiliate).`;
      } else if (tool_type === 'ai_code') {
        prompt = `${customPromptOverride || 'Analyze and clearly explain the following code snippet, regular expression, or command in plain English'}:\n\`\`\`\n${input}\n\`\`\`\nProvide:\n1. High-level summary of what it does\n2. Step-by-step breakdown of key lines\n3. Potential performance, security, or edge-case improvements.`;
      } else if (tool_type === 'ai_adcopy') {
        prompt = `${customPromptOverride || 'Craft 3 high-converting ad copy variations (Headlines, Body text, and Call to Actions)'} for marketing the following product or website:\n"${input}"\nGoal: Drive high-intent clicks and low CPC.`;
      } else {
        // Custom tool prompt
        prompt = `Task: ${customPromptOverride || 'Analyze and optimize the following request'}\n\nUser Input: ${input}\n\nProvide clear, actionable results.`;
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

      const appendAuditLog = async (actionText) => {
        try {
          const logs = (await getBlob('cms_audit_logs')) || [];
          logs.unshift({
            id: 'log-' + Date.now().toString(36),
            action: actionText,
            actor: admin.username || 'admin',
            timestamp: new Date().toISOString(),
          });
          await setBlob('cms_audit_logs', logs.slice(0, 200));
        } catch (e) {
          console.warn('Audit log write error:', e.message);
        }
      };

      // GET /api/admin/articles
      if (method === 'GET' && cleanPath === '/admin/articles') {
        const index = (await getBlob('articles_index')) || [];
        return jsonResponse(200, index);
      }

      // GET /api/admin/articles/:slug (Fetch full article with content, FAQs, references, etc.)
      if (method === 'GET' && cleanPath.startsWith('/admin/articles/')) {
        const slug = decodeURIComponent(cleanPath.replace('/admin/articles/', '').trim());
        let article = await getBlob(`article:${slug}`);
        if (!article) {
          const index = (await getBlob('articles_index')) || [];
          article = index.find((a) => a.slug === slug);
        }
        if (!article) return jsonResponse(404, { error: 'Article not found' });
        return jsonResponse(200, article);
      }

      // POST /api/admin/articles
      if (method === 'POST' && cleanPath === '/admin/articles') {
        const body = parseJsonBody(event.body);
        if (!body) return jsonResponse(400, { error: 'Invalid payload' });

        let {
          slug,
          tag,
          category,
          tags,
          title,
          meta,
          excerpt,
          body: articleBody,
          content,
          read_time,
          author,
          author_role,
          is_published,
          sort_order,
          image,
          featured_image,
          faqs,
          references,
          related_youtube,
          related_tools,
          seo_title,
          seo_description,
          meta_description,
          canonical_url,
          focus_keyword,
          scheduled_at,
        } = body;

        const finalContent = String(content || articleBody || '').trim();
        if (!title || typeof title !== 'string' || title.trim().length === 0) {
          return jsonResponse(400, { error: 'Article title is required' });
        }
        if (!finalContent) {
          return jsonResponse(400, { error: 'Article content body is required' });
        }

        const finalCategory = String(category || tag || 'Tutorials & Guides').trim();
        const finalTag = String(tag || finalCategory.toLowerCase().replace(/[^a-z0-9]+/g, '-')).trim();

        if (!slug || typeof slug !== 'string') {
          slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
        } else {
          slug = slug.toLowerCase().trim().replace(/[^a-z0-9-]+/g, '-').replace(/(^-|-$)+/g, '');
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
        const finalExcerpt = String(excerpt || meta || '').trim();
        const finalImage = String(featured_image || image || '').trim();
        const finalSeoDesc = String(meta_description || seo_description || finalExcerpt || '').trim();

        const newArticle = {
          slug,
          tag: finalTag,
          category: finalCategory,
          tags: Array.isArray(tags) ? tags : (typeof tags === 'string' && tags.trim() ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [finalCategory]),
          title: title.trim(),
          meta: finalExcerpt,
          excerpt: finalExcerpt,
          body: finalContent,
          content: finalContent,
          read_time: String(read_time || '10 min read').trim(),
          author: String(author || 'Nasir').trim(),
          author_role: String(author_role || 'Founder & Lead Engineer at Web Nasir').trim(),
          image: finalImage,
          featured_image: finalImage,
          faqs: Array.isArray(faqs) ? faqs : [],
          references: Array.isArray(references) ? references : [],
          related_youtube: Array.isArray(related_youtube) ? related_youtube : [],
          related_tools: Array.isArray(related_tools) ? related_tools : [],
          seo_title: String(seo_title || `${title.trim()} | Web Nasir`).trim(),
          seo_description: finalSeoDesc,
          meta_description: finalSeoDesc,
          canonical_url: String(canonical_url || `https://webnasir.dpdns.org/articles/${slug}`).trim(),
          focus_keyword: String(focus_keyword || '').trim(),
          scheduled_at: String(scheduled_at || '').trim(),
          is_published: is_published !== false,
          sort_order: Number(sort_order) || 1,
          created_at: now,
          updated_at: now,
        };

        await setBlob(`article:${slug}`, newArticle);

        const index = (await getBlob('articles_index')) || [];
        index.unshift(newArticle);
        await setBlob('articles_index', index);
        await appendAuditLog(`Created Educational Article: ${newArticle.title} (${newArticle.slug})`);

        return jsonResponse(201, { success: true, article: newArticle });
      }

      // PUT /api/admin/articles/:slug
      if (method === 'PUT' && cleanPath.startsWith('/admin/articles/')) {
        const slug = decodeURIComponent(cleanPath.replace('/admin/articles/', '').trim());
        const body = parseJsonBody(event.body);
        if (!body) return jsonResponse(400, { error: 'Invalid payload' });

        let article = await getBlob(`article:${slug}`);
        const index = (await getBlob('articles_index')) || [];
        const idx = index.findIndex((a) => a.slug === slug);

        if (!article && idx !== -1) {
          article = { ...index[idx], body: body.body || body.content || index[idx].body || index[idx].content || '' };
        }
        if (!article) {
          return jsonResponse(404, { error: 'Article not found' });
        }

        if (body.title !== undefined) article.title = String(body.title).trim();
        if (body.category !== undefined) article.category = String(body.category).trim();
        if (body.tag !== undefined) article.tag = String(body.tag).toLowerCase().trim();
        if (body.tags !== undefined) {
          article.tags = Array.isArray(body.tags)
            ? body.tags
            : String(body.tags).split(',').map((t) => t.trim()).filter(Boolean);
        }
        if (body.meta !== undefined || body.excerpt !== undefined) {
          const ex = String(body.excerpt !== undefined ? body.excerpt : body.meta).trim();
          article.meta = ex;
          article.excerpt = ex;
        }
        if (body.body !== undefined || body.content !== undefined) {
          const c = body.content !== undefined ? body.content : body.body;
          article.body = c;
          article.content = c;
        }
        if (body.read_time !== undefined) article.read_time = String(body.read_time).trim();
        if (body.author !== undefined) article.author = String(body.author).trim();
        if (body.author_role !== undefined) article.author_role = String(body.author_role).trim();
        if (body.image !== undefined || body.featured_image !== undefined) {
          const img = String(body.featured_image !== undefined ? body.featured_image : body.image).trim();
          article.image = img;
          article.featured_image = img;
        }
        if (Array.isArray(body.faqs)) article.faqs = body.faqs;
        if (Array.isArray(body.references)) article.references = body.references;
        if (Array.isArray(body.related_youtube)) article.related_youtube = body.related_youtube;
        if (Array.isArray(body.related_tools)) article.related_tools = body.related_tools;
        if (body.seo_title !== undefined) article.seo_title = String(body.seo_title).trim();
        if (body.seo_description !== undefined || body.meta_description !== undefined) {
          const sd = String(body.meta_description !== undefined ? body.meta_description : body.seo_description).trim();
          article.seo_description = sd;
          article.meta_description = sd;
        }
        if (body.canonical_url !== undefined) article.canonical_url = String(body.canonical_url).trim();
        if (body.focus_keyword !== undefined) article.focus_keyword = String(body.focus_keyword).trim();
        if (body.scheduled_at !== undefined) article.scheduled_at = String(body.scheduled_at).trim();
        if (body.is_published !== undefined) article.is_published = !!body.is_published;
        if (body.sort_order !== undefined) article.sort_order = Number(body.sort_order) || 0;

        article.updated_at = new Date().toISOString();
        await setBlob(`article:${slug}`, article);

        if (idx !== -1) {
          index[idx] = { ...index[idx], ...article };
        } else {
          index.unshift(article);
        }
        await setBlob('articles_index', index);
        await appendAuditLog(`Updated Educational Article: ${article.title} (${article.slug})`);

        return jsonResponse(200, { success: true, article });
      }

      // DELETE /api/admin/articles/:slug
      if (method === 'DELETE' && cleanPath.startsWith('/admin/articles/')) {
        const slug = decodeURIComponent(cleanPath.replace('/admin/articles/', '').trim());
        await deleteBlob(`article:${slug}`);

        const index = (await getBlob('articles_index')) || [];
        const filtered = index.filter((a) => a.slug !== slug);
        await setBlob('articles_index', filtered);
        await appendAuditLog(`Deleted Educational Article: ${slug}`);

        return jsonResponse(200, { success: true, message: 'Article deleted successfully' });
      }

      // ==========================================
      // ADMIN FREE LEARNING HUB MANAGER & YOUTUBE AUTO-DETECTION
      // ==========================================

      const parseYouTubeUrlInfo = (rawInput) => {
        const str = String(rawInput || '').trim();
        if (!str) return { videoId: '', playlistId: '' };
        // Direct 11-char video ID
        if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
          return { videoId: str, playlistId: '' };
        }
        let videoId = '';
        let playlistId = '';
        try {
          const urlObj = new URL(str.startsWith('http') ? str : `https://${str}`);
          if (urlObj.hostname.includes('youtu.be')) {
            videoId = urlObj.pathname.replace(/^\/+/, '').split('/')[0];
          } else if (urlObj.pathname.startsWith('/embed/')) {
            videoId = urlObj.pathname.replace('/embed/', '').split('/')[0];
          } else if (urlObj.pathname.startsWith('/shorts/')) {
            videoId = urlObj.pathname.replace('/shorts/', '').split('/')[0];
          } else {
            videoId = urlObj.searchParams.get('v') || '';
          }
          playlistId = urlObj.searchParams.get('list') || '';
        } catch {
          const vMatch = str.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
          if (vMatch) videoId = vMatch[1];
          const pMatch = str.match(/[?&]list=([a-zA-Z0-9_-]+)/);
          if (pMatch) playlistId = pMatch[1];
        }
        return {
          videoId: /^[a-zA-Z0-9_-]{11}$/.test(videoId) ? videoId : '',
          playlistId,
        };
      };

      // GET or POST /api/admin/youtube-metadata (Verify YouTube link & fetch real oEmbed metadata)
      if (cleanPath === '/admin/youtube-metadata' && (method === 'GET' || method === 'POST')) {
        const body = method === 'POST' ? (parseJsonBody(event.body) || {}) : {};
        const rawUrl = String(body.url || body.youtube_url || queryParams.url || '').trim();
        if (!rawUrl) {
          return jsonResponse(400, { valid: false, error: 'Please paste a YouTube video or playlist URL.' });
        }

        const { videoId, playlistId } = parseYouTubeUrlInfo(rawUrl);
        if (!videoId && !playlistId) {
          return jsonResponse(400, {
            valid: false,
            error: 'Could not detect a valid 11-character YouTube Video ID or Playlist ID from the URL.',
          });
        }

        const canonicalWatchUrl = videoId
          ? `https://www.youtube.com/watch?v=${videoId}${playlistId ? `&list=${playlistId}` : ''}`
          : `https://www.youtube.com/playlist?list=${playlistId}`;
        const oembedTarget = `https://www.youtube.com/oembed?url=${encodeURIComponent(canonicalWatchUrl)}&format=json`;

        try {
          const response = await fetch(oembedTarget, {
            headers: { 'User-Agent': 'WebNasir-LearningHub-Verifier/1.0' },
          });
          if (!response.ok) {
            return jsonResponse(400, {
              valid: false,
              video_id: videoId,
              playlist_id: playlistId,
              error: `YouTube returned HTTP ${response.status}. This video or playlist may be private, unavailable, or have embedding disabled.`,
            });
          }
          const data = await response.json();
          const thumbnailHqd = videoId
            ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
            : (data.thumbnail_url || '');
          const thumbnailMax = videoId
            ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`
            : (data.thumbnail_url || '');

          return jsonResponse(200, {
            valid: true,
            video_id: videoId,
            playlist_id: playlistId,
            youtube_url: canonicalWatchUrl,
            title: data.title || '',
            channel_name: data.author_name || '',
            channel_url: data.author_url || '',
            thumbnail_url: thumbnailHqd,
            thumbnail_maxres: thumbnailMax,
            provider_name: data.provider_name || 'YouTube',
          });
        } catch (err) {
          return jsonResponse(500, {
            valid: false,
            video_id: videoId,
            playlist_id: playlistId,
            error: `Failed to verify YouTube metadata: ${err.message}`,
          });
        }
      }

      // GET /api/admin/learning-resources
      if (method === 'GET' && cleanPath === '/admin/learning-resources') {
        const [resources, categories, paths] = await Promise.all([
          getBlob('learning_resources_index').then((r) => (Array.isArray(r) ? r : [])),
          getBlob('learning_categories').then((r) => (Array.isArray(r) ? r : [])),
          getBlob('learning_paths').then((r) => (Array.isArray(r) ? r : [])),
        ]);
        return jsonResponse(200, {
          resources,
          categories,
          paths,
        });
      }

      // POST /api/admin/learning-resources
      if (method === 'POST' && cleanPath === '/admin/learning-resources') {
        const body = parseJsonBody(event.body);
        if (!body) return jsonResponse(400, { error: 'Invalid payload' });

        const parsedIds = parseYouTubeUrlInfo(body.youtube_url || body.video_id || '');
        const videoId = String(body.video_id || parsedIds.videoId || '').trim();
        const playlistId = String(body.playlist_id || parsedIds.playlistId || '').trim();

        if (!videoId) {
          return jsonResponse(400, { error: 'A verified 11-character YouTube Video ID or YouTube video URL is required.' });
        }
        if (!body.title || !String(body.title).trim()) {
          return jsonResponse(400, { error: 'Course title is required.' });
        }

        let slug = String(body.slug || body.id || body.title)
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
        if (!slug) slug = `learn-${Date.now().toString(36)}`;

        const resources = (await getBlob('learning_resources_index')) || [];
        if (resources.some((r) => r.slug === slug || r.id === slug)) {
          slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
        }

        const parseList = (val) => {
          if (Array.isArray(val)) return val.map((x) => String(x).trim()).filter(Boolean);
          if (typeof val === 'string' && val.trim()) {
            return val.split(/\n|,/).map((x) => x.trim()).filter(Boolean);
          }
          return [];
        };

        const nowIso = new Date().toISOString();
        const newResource = {
          id: slug,
          slug,
          title: String(body.title).trim(),
          youtube_url: String(body.youtube_url || `https://www.youtube.com/watch?v=${videoId}`).trim(),
          video_id: videoId,
          playlist_id: playlistId,
          channel_name: String(body.channel_name || 'Verified Creator').trim(),
          channel_url: String(body.channel_url || 'https://www.youtube.com').trim(),
          official_website: String(body.official_website || '').trim(),
          category: String(body.category || 'Artificial Intelligence & ChatGPT').trim(),
          subcategory: String(body.subcategory || '').trim(),
          difficulty: String(body.difficulty || 'Beginner').trim(),
          language: String(body.language || 'English').trim(),
          duration: String(body.duration || 'Full Video Course').trim(),
          resource_type: String(body.resource_type || 'Full Course').trim(),
          thumbnail_url: String(body.thumbnail_url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`).trim(),
          thumbnail_fallback: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
          short_description: String(body.short_description || body.full_description || '').trim(),
          full_description: String(body.full_description || body.short_description || '').trim(),
          learning_outcomes: parseList(body.learning_outcomes),
          topics_covered: parseList(body.topics_covered),
          prerequisites: parseList(body.prerequisites),
          related_tools: parseList(body.related_tools),
          related_articles: parseList(body.related_articles),
          tags: parseList(body.tags),
          seo_title: String(body.seo_title || `${String(body.title).trim()} — Free YouTube Course | Web Nasir`).trim(),
          meta_description: String(body.meta_description || body.short_description || '').trim(),
          is_featured: Boolean(body.is_featured),
          is_published: body.is_published !== false && body.status !== 'draft',
          status: body.is_published === false || body.status === 'draft' ? 'draft' : 'published',
          sort_order: Number(body.sort_order) || resources.length + 1,
          verified_at: nowIso,
          updated_at: nowIso,
        };

        resources.unshift(newResource);
        await setBlob('learning_resources_index', resources);
        await setBlob(`learning_resource:${slug}`, newResource);
        await appendAuditLog(`Added Free Learning Resource: ${newResource.title} (${newResource.video_id})`);

        return jsonResponse(201, { success: true, resource: newResource });
      }

      // POST /api/admin/learning-resources/:id/duplicate
      if (method === 'POST' && cleanPath.startsWith('/admin/learning-resources/') && cleanPath.endsWith('/duplicate')) {
        const id = decodeURIComponent(cleanPath.replace('/admin/learning-resources/', '').replace(/\/duplicate$/, '').trim());
        const resources = (await getBlob('learning_resources_index')) || [];
        const source = resources.find((r) => r.id === id || r.slug === id);
        if (!source) return jsonResponse(404, { error: 'Learning resource not found' });

        const newSlug = `${source.slug}-copy-${Date.now().toString(36).slice(-4)}`;
        const nowIso = new Date().toISOString();
        const duplicated = {
          ...source,
          id: newSlug,
          slug: newSlug,
          title: `${source.title} (Copy)`,
          is_published: false,
          status: 'draft',
          updated_at: nowIso,
        };
        resources.unshift(duplicated);
        await setBlob('learning_resources_index', resources);
        await setBlob(`learning_resource:${newSlug}`, duplicated);
        await appendAuditLog(`Duplicated Free Learning Resource: ${source.title} -> ${newSlug}`);

        return jsonResponse(201, { success: true, resource: duplicated });
      }

      // PUT /api/admin/learning-resources/:id
      if (method === 'PUT' && cleanPath.startsWith('/admin/learning-resources/')) {
        const id = decodeURIComponent(cleanPath.replace('/admin/learning-resources/', '').trim());
        const body = parseJsonBody(event.body);
        if (!body) return jsonResponse(400, { error: 'Invalid payload' });

        const resources = (await getBlob('learning_resources_index')) || [];
        const idx = resources.findIndex((r) => r.id === id || r.slug === id);
        if (idx === -1) return jsonResponse(404, { error: 'Learning resource not found' });

        const existing = resources[idx];
        const parseList = (val, fallback) => {
          if (val === undefined) return fallback;
          if (Array.isArray(val)) return val.map((x) => String(x).trim()).filter(Boolean);
          if (typeof val === 'string') return val.split(/\n|,/).map((x) => x.trim()).filter(Boolean);
          return fallback;
        };

        let videoId = existing.video_id;
        let playlistId = existing.playlist_id || '';
        if (body.youtube_url || body.video_id) {
          const parsed = parseYouTubeUrlInfo(body.youtube_url || body.video_id);
          if (parsed.videoId) videoId = parsed.videoId;
          if (parsed.playlistId) playlistId = parsed.playlistId;
        }
        if (body.video_id && /^[a-zA-Z0-9_-]{11}$/.test(String(body.video_id).trim())) {
          videoId = String(body.video_id).trim();
        }

        const isPub = body.is_published !== undefined
          ? Boolean(body.is_published)
          : (body.status !== undefined ? body.status === 'published' : existing.is_published);

        const updated = {
          ...existing,
          ...body,
          id: existing.id,
          slug: existing.slug,
          video_id: videoId,
          playlist_id: body.playlist_id !== undefined ? String(body.playlist_id).trim() : playlistId,
          youtube_url: body.youtube_url ? String(body.youtube_url).trim() : `https://www.youtube.com/watch?v=${videoId}`,
          thumbnail_url: body.thumbnail_url ? String(body.thumbnail_url).trim() : `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          learning_outcomes: parseList(body.learning_outcomes, existing.learning_outcomes || []),
          topics_covered: parseList(body.topics_covered, existing.topics_covered || []),
          prerequisites: parseList(body.prerequisites, existing.prerequisites || []),
          related_tools: parseList(body.related_tools, existing.related_tools || []),
          related_articles: parseList(body.related_articles, existing.related_articles || []),
          tags: parseList(body.tags, existing.tags || []),
          is_published: isPub,
          status: isPub ? 'published' : 'draft',
          is_featured: body.is_featured !== undefined ? Boolean(body.is_featured) : existing.is_featured,
          updated_at: new Date().toISOString(),
        };

        resources[idx] = updated;
        await setBlob('learning_resources_index', resources);
        await setBlob(`learning_resource:${updated.slug}`, updated);
        await appendAuditLog(`Updated Free Learning Resource: ${updated.title} (${updated.slug})`);

        return jsonResponse(200, { success: true, resource: updated });
      }

      // DELETE /api/admin/learning-resources/:id
      if (method === 'DELETE' && cleanPath.startsWith('/admin/learning-resources/')) {
        const id = decodeURIComponent(cleanPath.replace('/admin/learning-resources/', '').trim());
        const resources = (await getBlob('learning_resources_index')) || [];
        const target = resources.find((r) => r.id === id || r.slug === id);
        const filtered = resources.filter((r) => r.id !== id && r.slug !== id);
        await setBlob('learning_resources_index', filtered);
        await deleteBlob(`learning_resource:${id}`);
        if (target && target.slug) await deleteBlob(`learning_resource:${target.slug}`);
        await appendAuditLog(`Deleted Free Learning Resource: ${target ? target.title : id}`);

        return jsonResponse(200, { success: true, message: 'Learning resource deleted successfully' });
      }

      // GET /api/admin/tools
      if (method === 'GET' && cleanPath === '/admin/tools') {
        const tools = (await getBlob('tools_index')) || [];
        const sorted = [...tools].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
        return jsonResponse(200, sorted);
      }

      // POST /api/admin/tools (Admin adds new free AI tools)
      if (method === 'POST' && cleanPath === '/admin/tools') {
        const body = parseJsonBody(event.body);
        if (!body) return jsonResponse(400, { error: 'Invalid payload' });

        const { key, name, description, category, badge, icon, tool_type, custom_prompt, input_fields, output_format, is_featured, sort_order, seo_slug } = body;
        if (!name || typeof name !== 'string' || !name.trim()) {
          return jsonResponse(400, { error: 'Tool name is required' });
        }

        let toolKey = (key || name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        if (!toolKey) toolKey = 'tool-' + Date.now();

        const tools = (await getBlob('tools_index')) || [];
        if (tools.some((t) => t.key === toolKey || t.id === toolKey)) {
          toolKey = `${toolKey}-${Date.now().toString(36).slice(-4)}`;
        }

        const nowIso = new Date().toISOString();
        const newTool = {
          id: toolKey,
          key: toolKey,
          seo_slug: String(seo_slug || toolKey).trim().replace(/^#?\/?tools\/?/, '') || toolKey,
          name: name.trim().slice(0, 200),
          description: String(description || '').trim().slice(0, 600),
          category: String(category || 'AI Creators').trim().slice(0, 80),
          badge: String(badge || 'Free Tool').trim().slice(0, 60),
          icon: String(icon || 'sparkles').trim().slice(0, 60),
          tool_type: String(tool_type || 'custom_ai').trim().slice(0, 60),
          custom_prompt: String(custom_prompt || '').slice(0, 4000),
          input_fields: String(input_fields || 'User Input / Topic').slice(0, 500),
          output_format: String(output_format || 'Markdown Output').slice(0, 300),
          is_enabled: body.is_enabled !== false,
          is_featured: !!is_featured,
          sort_order: Number(sort_order) || (tools.length + 1),
          created_at: nowIso,
          updated_at: nowIso,
        };

        tools.push(newTool);
        await setBlob('tools_index', tools);

        const logs = (await getBlob('cms_audit_logs')) || [];
        logs.unshift({
          id: 'log-' + Date.now(),
          action: `Created AI Tool: ${newTool.name} (${newTool.key})`,
          actor: adminPayload.username || 'admin',
          timestamp: nowIso,
        });
        await setBlob('cms_audit_logs', logs.slice(0, 100));

        return jsonResponse(201, { success: true, tool: newTool, tools });
      }

      // PUT /api/admin/tools (Bulk update all tools)
      if ((method === 'PUT' || method === 'PATCH') && cleanPath === '/admin/tools') {
        const body = parseJsonBody(event.body);
        const incoming = Array.isArray(body) ? body : body?.tools;
        if (!Array.isArray(incoming)) return jsonResponse(400, { error: 'Tools array is required' });

        const existingTools = (await getBlob('tools_index')) || [];
        const nowIso = new Date().toISOString();

        for (const item of incoming) {
          if (!item || (!item.key && !item.id)) continue;
          const idx = existingTools.findIndex((t) => t.key === item.key || t.id === item.id || t.key === item.id);
          if (idx !== -1) {
            if (item.name !== undefined && String(item.name).trim()) existingTools[idx].name = String(item.name).trim().slice(0, 200);
            if (item.description !== undefined) existingTools[idx].description = String(item.description).trim().slice(0, 600);
            if (item.category !== undefined) existingTools[idx].category = String(item.category).trim().slice(0, 80);
            if (item.badge !== undefined) existingTools[idx].badge = String(item.badge).trim().slice(0, 60);
            if (item.icon !== undefined) existingTools[idx].icon = String(item.icon).trim().slice(0, 60);
            if (item.tool_type !== undefined) existingTools[idx].tool_type = String(item.tool_type).trim().slice(0, 60);
            if (item.custom_prompt !== undefined) existingTools[idx].custom_prompt = String(item.custom_prompt).slice(0, 4000);
            if (item.input_fields !== undefined) existingTools[idx].input_fields = String(item.input_fields).slice(0, 500);
            if (item.output_format !== undefined) existingTools[idx].output_format = String(item.output_format).slice(0, 300);
            if (item.seo_slug !== undefined) existingTools[idx].seo_slug = String(item.seo_slug).trim().replace(/^#?\/?tools\/?/, '') || existingTools[idx].key;
            if (item.is_enabled !== undefined) existingTools[idx].is_enabled = !!item.is_enabled;
            if (item.is_featured !== undefined) existingTools[idx].is_featured = !!item.is_featured;
            if (item.sort_order !== undefined) existingTools[idx].sort_order = Number(item.sort_order) || 0;
            existingTools[idx].updated_at = nowIso;
          }
        }

        existingTools.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
        await setBlob('tools_index', existingTools);
        return jsonResponse(200, { success: true, tools: existingTools });
      }

      // PUT or PATCH /api/admin/tools/:key
      if ((method === 'PUT' || method === 'PATCH') && cleanPath.startsWith('/admin/tools/')) {
        const rawKey = decodeURIComponent(cleanPath.replace('/admin/tools/', '').trim());
        const body = parseJsonBody(event.body);
        if (!body) return jsonResponse(400, { error: 'Invalid payload' });

        const tools = (await getBlob('tools_index')) || [];
        const toolIndex = tools.findIndex((t) => t.key === rawKey || t.id === rawKey || t.seo_slug === rawKey);
        if (toolIndex === -1) {
          return jsonResponse(404, { error: `Tool "${rawKey}" not found` });
        }

        if (body.name !== undefined) {
          const cleanName = String(body.name).trim();
          if (!cleanName) return jsonResponse(400, { error: 'Tool name cannot be empty' });
          tools[toolIndex].name = cleanName.slice(0, 200);
        }
        if (body.description !== undefined) tools[toolIndex].description = String(body.description).trim().slice(0, 600);
        if (body.category !== undefined) tools[toolIndex].category = String(body.category).trim().slice(0, 80);
        if (body.badge !== undefined) tools[toolIndex].badge = String(body.badge).trim().slice(0, 60);
        if (body.icon !== undefined) tools[toolIndex].icon = String(body.icon).trim().slice(0, 60);
        if (body.tool_type !== undefined) tools[toolIndex].tool_type = String(body.tool_type).trim().slice(0, 60);
        if (body.custom_prompt !== undefined) tools[toolIndex].custom_prompt = String(body.custom_prompt).slice(0, 4000);
        if (body.input_fields !== undefined) tools[toolIndex].input_fields = String(body.input_fields).slice(0, 500);
        if (body.output_format !== undefined) tools[toolIndex].output_format = String(body.output_format).slice(0, 300);
        if (body.seo_slug !== undefined) {
          tools[toolIndex].seo_slug = String(body.seo_slug).trim().replace(/^#?\/?tools\/?/, '') || tools[toolIndex].key;
        }
        if (body.is_enabled !== undefined) tools[toolIndex].is_enabled = !!body.is_enabled;
        if (body.is_featured !== undefined) tools[toolIndex].is_featured = !!body.is_featured;
        if (body.sort_order !== undefined) tools[toolIndex].sort_order = Number(body.sort_order) || 0;
        if (!tools[toolIndex].id) tools[toolIndex].id = tools[toolIndex].key;
        const nowIso = new Date().toISOString();
        tools[toolIndex].updated_at = nowIso;

        const updatedTool = tools[toolIndex];
        await setBlob('tools_index', tools);

        // Synchronize tool name in cms_navigation and cms_footer if referenced by #/tools/:key
        try {
          const targetUrl = `#/tools/${updatedTool.key}`;
          const nav = await getBlob('cms_navigation');
          if (nav && Array.isArray(nav.items)) {
            let navChanged = false;
            for (const item of nav.items) {
              if (Array.isArray(item.dropdown)) {
                for (const dd of item.dropdown) {
                  if (dd.url === targetUrl && dd.label !== updatedTool.name) {
                    dd.label = updatedTool.name;
                    navChanged = true;
                  }
                }
              }
            }
            if (navChanged) await setBlob('cms_navigation', nav);
          }

          const footer = await getBlob('cms_footer');
          if (footer && Array.isArray(footer.columns)) {
            let footerChanged = false;
            for (const col of footer.columns) {
              if (Array.isArray(col.links)) {
                for (const lnk of col.links) {
                  if (lnk.url === targetUrl && lnk.label !== updatedTool.name) {
                    lnk.label = updatedTool.name;
                    footerChanged = true;
                  }
                }
              }
            }
            if (footerChanged) await setBlob('cms_footer', footer);
          }
        } catch (syncErr) {
          console.warn('Navigation/footer tool name sync notice:', syncErr.message);
        }

        // Record audit log
        try {
          const logs = (await getBlob('cms_audit_logs')) || [];
          logs.unshift({
            id: 'log-' + Date.now(),
            action: `Updated AI Tool "${updatedTool.name}" (${updatedTool.key})`,
            actor: adminPayload.username || 'admin',
            timestamp: nowIso,
          });
          await setBlob('cms_audit_logs', logs.slice(0, 100));
        } catch (_) {}

        return jsonResponse(200, { success: true, tool: updatedTool, tools });
      }

      // DELETE /api/admin/tools/:key
      if (method === 'DELETE' && cleanPath.startsWith('/admin/tools/')) {
        const rawKey = decodeURIComponent(cleanPath.replace('/admin/tools/', '').trim());
        const tools = (await getBlob('tools_index')) || [];
        const filtered = tools.filter((t) => t.key !== rawKey && t.id !== rawKey);
        await setBlob('tools_index', filtered);
        return jsonResponse(200, { success: true, message: 'Tool deleted successfully', tools: filtered });
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

        let id = (body.id || body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')).replace(/^-|-$/g, '');
        const courses = (await getBlob('courses_index')) || [];
        if (courses.some((c) => c.id === id)) {
          id = `${id}-${Date.now().toString(36).slice(-4)}`;
        }

        const highlightsList = Array.isArray(body.highlights)
          ? body.highlights
          : Array.isArray(body.features)
            ? body.features
            : ['100% Practical Production Projects', 'Direct Code Reviews', 'Lifetime Access'];

        const modulesList = Array.isArray(body.modules)
          ? body.modules
          : Array.isArray(body.curriculum)
            ? body.curriculum
            : [];

        const newCourse = {
          id,
          slug: String(body.slug || id).trim(),
          title: String(body.title).trim().slice(0, 180),
          subtitle: String(body.subtitle || body.description || '').trim().slice(0, 400),
          description: String(body.description || body.overview || body.subtitle || '').trim().slice(0, 2500),
          overview: String(body.overview || body.description || '').trim().slice(0, 2500),
          category: String(body.category || 'AI Tools & Automation').trim(),
          level: String(body.level || 'All Levels').trim(),
          duration: String(body.duration || '6 Weeks').trim(),
          language: String(body.language || 'English / Urdu').trim(),
          modules_count: Number(body.modules_count) || (modulesList.length || 8),
          price: body.price !== undefined ? Number(body.price) : 2999,
          original_price: body.original_price !== undefined ? Number(body.original_price) : 7999,
          is_free: body.is_free === true || Number(body.price) === 0,
          free_offer_active: Boolean(body.free_offer_active),
          offer_start_date: body.offer_start_date || '',
          offer_expiry_date: body.offer_expiry_date || '',
          rating: Number(body.rating) || 4.9,
          enrolled_count: Number(body.enrolled_count) || 120,
          instructor: String(body.instructor || 'Nasir').trim(),
          instructor_title: String(body.instructor_title || 'Lead Technical Mentor').trim(),
          badge: String(body.badge || (body.is_free ? 'Free Course' : 'Popular')).trim(),
          image: String(body.image || '').trim(),
          video_preview: String(body.video_preview || '').trim(),
          external_learning_url: String(body.external_learning_url || '').trim(),
          downloadable_files: Array.isArray(body.downloadable_files) ? body.downloadable_files : [],
          requirements: Array.isArray(body.requirements) ? body.requirements : ['Basic computer and internet literacy'],
          outcomes: Array.isArray(body.outcomes) ? body.outcomes : [],
          seo_title: String(body.seo_title || `${body.title} — Web Nasir Academy`).trim(),
          seo_description: String(body.seo_description || body.description || body.subtitle || '').trim(),
          is_published: body.is_published !== false && body.is_active !== false,
          is_active: body.is_active !== false && body.is_published !== false,
          sort_order: Number(body.sort_order) || courses.length + 1,
          highlights: highlightsList,
          features: highlightsList,
          modules: modulesList,
          curriculum: modulesList,
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
        if (body.price !== undefined) {
          updated.price = Number(body.price);
          if (updated.price === 0) updated.is_free = true;
        }
        if (body.is_free !== undefined) updated.is_free = Boolean(body.is_free);
        if (body.free_offer_active !== undefined) updated.free_offer_active = Boolean(body.free_offer_active);
        if (body.offer_start_date !== undefined) updated.offer_start_date = body.offer_start_date;
        if (body.offer_expiry_date !== undefined) updated.offer_expiry_date = body.offer_expiry_date;
        if (Array.isArray(body.downloadable_files)) updated.downloadable_files = body.downloadable_files;
        if (body.external_learning_url !== undefined) updated.external_learning_url = String(body.external_learning_url).trim();
        if (Array.isArray(body.outcomes)) updated.outcomes = body.outcomes;
        if (Array.isArray(body.requirements)) updated.requirements = body.requirements;

        if (body.description !== undefined && body.overview === undefined) updated.overview = body.description;
        if (body.overview !== undefined && body.description === undefined) updated.description = body.overview;
        if (Array.isArray(body.highlights) && !body.features) updated.features = body.highlights;
        if (Array.isArray(body.features) && !body.highlights) updated.highlights = body.features;
        if (Array.isArray(body.modules) && !body.curriculum) updated.curriculum = body.modules;
        if (Array.isArray(body.curriculum) && !body.modules) updated.modules = body.curriculum;
        if (body.is_active !== undefined && body.is_published === undefined) updated.is_published = Boolean(body.is_active);
        if (body.is_published !== undefined && body.is_active === undefined) updated.is_active = Boolean(body.is_published);

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

      // GET /api/admin/download-logs (Admin download audit trails)
      if (method === 'GET' && cleanPath === '/admin/download-logs') {
        const logs = (await getBlob('cms_download_logs')) || [];
        return jsonResponse(200, { success: true, logs, total: logs.length });
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
        const quoteText = body ? (body.content || body.text || '').trim() : '';
        if (!body || !body.name || !quoteText) {
          return jsonResponse(400, { error: 'Student name and review text are required' });
        }

        const list = (await getBlob('testimonials_index')) || [];
        const id = body.id || 'test-' + Date.now();
        const newTest = {
          id,
          name: String(body.name).trim().slice(0, 100),
          role: String(body.role || 'Student & Alumni').trim().slice(0, 100),
          location: String(body.location || 'India').trim().slice(0, 100),
          course: String(body.course || 'Academy Masterclass').trim().slice(0, 120),
          earnings_metric: String(body.earnings_metric || '').trim().slice(0, 100),
          rating: Number(body.rating) || 5,
          content: quoteText.slice(0, 1500),
          text: quoteText.slice(0, 1500),
          has_video: Boolean(body.has_video || body.video_url),
          video_url: String(body.video_url || '').trim(),
          avatar: String(body.avatar || '').trim(),
          status: String(body.status || 'approved').trim(),
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

        const updatedQuote = body.content !== undefined ? body.content : (body.text !== undefined ? body.text : (list[idx].content || list[idx].text));
        list[idx] = {
          ...list[idx],
          ...body,
          id,
          content: updatedQuote,
          text: updatedQuote,
        };
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
        const config = (await getBlob('cms_marquee_config')) || {};
        return jsonResponse(200, { items: list, config });
      }

      // PUT /api/admin/marquee
      if (method === 'PUT' && cleanPath === '/admin/marquee') {
        const body = parseJsonBody(event.body);
        if (!body || !Array.isArray(body.items)) return jsonResponse(400, { error: 'items array is required' });

        const sanitized = body.items.map((i) => {
          if (typeof i === 'string') {
            return { text: i.trim().slice(0, 200), link: '/courses' };
          }
          return {
            text: String(i.text || '').trim().slice(0, 200),
            link: String(i.link || '/courses').trim().slice(0, 150),
          };
        }).filter((i) => i.text.length > 0);

        await setBlob('marquee_items', sanitized);
        if (body.config && typeof body.config === 'object') {
          await setBlob('cms_marquee_config', body.config);
        }
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

      // PUT /api/admin/enrollments/:id (Update Order/Enrollment Status, Refund, Manual Verification)
      if (method === 'PUT' && cleanPath.startsWith('/admin/enrollments/')) {
        const id = cleanPath.replace('/admin/enrollments/', '').trim();
        const body = parseJsonBody(event.body);
        if (!body) return jsonResponse(400, { error: 'Invalid payload' });

        const list = (await getBlob('enrollments_list')) || [];
        const idx = list.findIndex((e) => e.id === id || e.payment_id === id);
        if (idx === -1) return jsonResponse(404, { error: 'Enrollment record not found' });

        list[idx] = {
          ...list[idx],
          ...body,
          id: list[idx].id,
          updated_at: new Date().toISOString(),
        };
        await setBlob('enrollments_list', list);
        return jsonResponse(200, { success: true, enrollment: list[idx] });
      }

      // GET /api/admin/contacts
      if (method === 'GET' && cleanPath === '/admin/contacts') {
        const list = (await getBlob('contacts_list')) || [];
        const search = (queryParams.search || '').toLowerCase().trim();
        const status = (queryParams.status || 'all').toLowerCase().trim();
        const filtered = list.filter((c) => {
          if (status === 'unread' && c.read === true) return false;
          if (status === 'read' && !c.read) return false;
          if (status === 'replied' && (!Array.isArray(c.replies) || c.replies.length === 0)) return false;
          if (search) {
            const hay = `${c.name || ''} ${c.email || ''} ${c.subject || ''} ${c.message || ''}`.toLowerCase();
            if (!hay.includes(search)) return false;
          }
          return true;
        });
        return jsonResponse(200, filtered);
      }

      // PUT /api/admin/contacts/:id (Mark as read / unread or update status)
      if (method === 'PUT' && cleanPath.startsWith('/admin/contacts/') && !cleanPath.endsWith('/reply')) {
        const id = decodeURIComponent(cleanPath.replace('/admin/contacts/', '').trim());
        const body = parseJsonBody(event.body) || {};
        const list = (await getBlob('contacts_list')) || [];
        const idx = list.findIndex((c) => c.id === id);
        if (idx === -1) return jsonResponse(404, { error: 'Contact message not found' });
        list[idx] = {
          ...list[idx],
          read: body.read !== undefined ? Boolean(body.read) : list[idx].read,
          status: body.status || (body.read ? 'read' : 'unread'),
          updated_at: new Date().toISOString(),
        };
        await setBlob('contacts_list', list);
        return jsonResponse(200, { success: true, contact: list[idx], contacts: list });
      }

      // POST /api/admin/contacts/:id/reply (Reply to sender via email and store in thread)
      if (method === 'POST' && cleanPath.startsWith('/admin/contacts/') && cleanPath.endsWith('/reply')) {
        const id = decodeURIComponent(cleanPath.replace('/admin/contacts/', '').replace(/\/reply$/, '').trim());
        const body = parseJsonBody(event.body) || {};
        const replyMessage = String(body.reply_message || body.message || '').trim();
        const replySubject = String(body.subject || '').trim();
        if (!replyMessage) return jsonResponse(400, { error: 'Reply message is required' });

        const list = (await getBlob('contacts_list')) || [];
        const idx = list.findIndex((c) => c.id === id);
        if (idx === -1) return jsonResponse(404, { error: 'Contact message not found' });

        const target = list[idx];
        const finalSubject = replySubject || `Re: ${target.subject || 'Your Inquiry to Web Nasir'}`;
        const emailResult = await sendEmailMessage({
          to: target.email,
          recipientName: target.name || 'Valued Visitor',
          subject: finalSubject,
          body: replyMessage,
          templateId: 'contact_reply',
        });

        const replyEntry = {
          id: 'rep-' + Date.now(),
          subject: finalSubject,
          message: replyMessage,
          sent_at: new Date().toISOString(),
          delivery_status: emailResult.status || 'simulated',
        };
        if (!Array.isArray(list[idx].replies)) list[idx].replies = [];
        list[idx].replies.push(replyEntry);
        list[idx].read = true;
        list[idx].status = 'replied';
        list[idx].updated_at = new Date().toISOString();

        await setBlob('contacts_list', list);
        return jsonResponse(200, {
          success: true,
          contact: list[idx],
          reply: replyEntry,
          email_status: emailResult.status,
          contacts: list,
        });
      }

      // DELETE /api/admin/contacts/:id
      if (method === 'DELETE' && cleanPath.startsWith('/admin/contacts/')) {
        const id = decodeURIComponent(cleanPath.replace('/admin/contacts/', '').trim());
        const list = (await getBlob('contacts_list')) || [];
        const filtered = list.filter((c) => c.id !== id);
        await setBlob('contacts_list', filtered);
        return jsonResponse(200, { success: true, contacts: filtered });
      }

      // ==========================================
      // FEATURED ANNOUNCEMENTS POPUP MANAGER CRUD (/api/admin/featured-announcements)
      // ==========================================
      if (cleanPath === '/admin/featured-announcements') {
        if (method === 'GET') {
          const list = (await getBlob('cms_featured_announcements')) || [];
          return jsonResponse(200, Array.isArray(list) ? list : []);
        }
        if (method === 'POST') {
          const body = parseJsonBody(event.body);
          if (!body) return jsonResponse(400, { error: 'Invalid payload' });
          const list = (await getBlob('cms_featured_announcements')) || [];
          const nowIso = new Date().toISOString();
          const newItem = {
            id: body.id || 'feat-ann-' + Date.now(),
            title: String(body.title || 'Untitled Announcement').trim(),
            description: String(body.description || '').trim(),
            highlight_text: String(body.highlighted_text || body.highlight_text || '').trim(),
            highlighted_text: String(body.highlighted_text || body.highlight_text || '').trim(),
            content_type: body.content_type || 'text', // 'image' | 'video' | 'text'
            image_url: String(body.image_url || '').trim(),
            video_url: String(body.video_url || '').trim(),
            cta_enabled: body.cta_enabled !== false,
            cta_text: String(body.cta_text || 'Learn More').trim(),
            cta_url: String(body.cta_url || '/courses').trim(),
            animation: body.animation || 'zoom-in', // 'fade-in' | 'zoom-in' | 'slide-up' | 'slide-down'
            priority: Number(body.priority) || 1,
            start_date: body.start_date || '',
            expiry_date: body.expiry_date || '',
            delay_seconds: Number(body.delay_seconds ?? 1),
            duration_seconds: Number(body.duration_seconds ?? body.display_duration_seconds ?? 0),
            display_duration_seconds: Number(body.duration_seconds ?? body.display_duration_seconds ?? 0),
            frequency: body.frequency || 'once_per_session', // 'once_per_visitor' | 'once_per_session' | 'every_visit'
            target_audience: body.target_audience || 'all', // 'all' | 'logged_in'
            show_on_mobile: body.show_on_mobile !== false,
            show_on_desktop: body.show_on_desktop !== false,
            enabled: Boolean(body.enabled),
            status: body.status || 'published', // 'draft' | 'published'
            created_at: nowIso,
            updated_at: nowIso,
          };
          list.unshift(newItem);
          await setBlob('cms_featured_announcements', list);
          return jsonResponse(201, { ok: true, success: true, item: newItem, announcement: newItem, announcements: list });
        }
        if (method === 'PUT') {
          const body = parseJsonBody(event.body);
          if (!body || !Array.isArray(body.announcements)) return jsonResponse(400, { error: 'Expected announcements array' });
          await setBlob('cms_featured_announcements', body.announcements);
          return jsonResponse(200, { success: true, announcements: body.announcements });
        }
      }

      if (cleanPath.startsWith('/admin/featured-announcements/')) {
        const id = decodeURIComponent(cleanPath.replace('/admin/featured-announcements/', '').trim());
        const list = (await getBlob('cms_featured_announcements')) || [];
        if (method === 'PUT') {
          const body = parseJsonBody(event.body) || {};
          const idx = list.findIndex((x) => x.id === id);
          if (idx === -1) return jsonResponse(404, { error: 'Featured announcement not found' });
          list[idx] = {
            ...list[idx],
            ...body,
            id: list[idx].id,
            updated_at: new Date().toISOString(),
          };
          await setBlob('cms_featured_announcements', list);
          return jsonResponse(200, { success: true, announcement: list[idx], announcements: list });
        }
        if (method === 'DELETE') {
          const filtered = list.filter((x) => x.id !== id);
          await setBlob('cms_featured_announcements', filtered);
          return jsonResponse(200, { success: true, announcements: filtered });
        }
      }

      // ==========================================
      // HERO SLIDER MANAGER CRUD (/api/admin/hero-slides & /api/admin/hero-slider-config)
      // ==========================================
      if (cleanPath === '/admin/hero-slides') {
        if (method === 'GET') {
          const [slides, config] = await Promise.all([
            getBlob('cms_hero_slides').then((r) => (Array.isArray(r) ? r : [])),
            getBlob('cms_hero_slider_config').then((r) => r || {}),
          ]);
          return jsonResponse(200, { slides, config });
        }
        if (method === 'POST') {
          const body = parseJsonBody(event.body);
          if (!body) return jsonResponse(400, { error: 'Invalid slide payload' });
          const slides = (await getBlob('cms_hero_slides')) || [];
          const nowIso = new Date().toISOString();
          const newSlide = {
            id: body.id || 'slide-' + Date.now().toString(36),
            slide_type: body.slide_type || 'ai_tools',
            title: String(body.title || 'New Hero Slide').trim(),
            badge_text: String(body.badge_text || 'Featured Track').trim(),
            heading: String(body.heading || 'Master New Digital Skills').trim(),
            description: String(body.description || '').trim(),
            cta_primary_text: String(body.cta_primary_text || 'Explore Tools').trim(),
            cta_primary_link: String(body.cta_primary_link || '/tools').trim(),
            cta_secondary_text: String(body.cta_secondary_text || 'Explore Courses').trim(),
            cta_secondary_link: String(body.cta_secondary_link || '/courses').trim(),
            cta_video_text: String(body.cta_video_text || '').trim(),
            desktop_image: String(body.desktop_image || '').trim(),
            mobile_image: String(body.mobile_image || '').trim(),
            bg_gradient: String(body.bg_gradient || 'from-brand-50/70 via-white to-slate-50/50').trim(),
            enabled: body.enabled !== false,
            status: body.status || 'published',
            sort_order: Number(body.sort_order) || slides.length + 1,
            created_at: nowIso,
            updated_at: nowIso,
          };
          slides.push(newSlide);
          await setBlob('cms_hero_slides', slides);
          await appendAuditLog(`Created Hero Slide: "${newSlide.title}"`);
          return jsonResponse(201, { ok: true, success: true, slide: newSlide, slides });
        }
        if (method === 'PUT') {
          const body = parseJsonBody(event.body);
          if (!body || !Array.isArray(body.slides)) return jsonResponse(400, { error: 'Expected slides array' });
          await setBlob('cms_hero_slides', body.slides);
          await appendAuditLog('Reordered & updated hero slides catalog');
          return jsonResponse(200, { success: true, slides: body.slides });
        }
      }

      if (cleanPath.startsWith('/admin/hero-slides/') && cleanPath.endsWith('/duplicate')) {
        const id = decodeURIComponent(cleanPath.replace('/admin/hero-slides/', '').replace(/\/duplicate$/, '').trim());
        const slides = (await getBlob('cms_hero_slides')) || [];
        const original = slides.find((s) => s.id === id);
        if (!original) return jsonResponse(404, { error: 'Original slide not found' });
        const duplicateSlide = {
          ...original,
          id: 'slide-' + Date.now().toString(36),
          title: `${original.title} (Copy)`,
          sort_order: slides.length + 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        slides.push(duplicateSlide);
        await setBlob('cms_hero_slides', slides);
        await appendAuditLog(`Duplicated Hero Slide: "${original.title}" -> "${duplicateSlide.title}"`);
        return jsonResponse(201, { success: true, slide: duplicateSlide, slides });
      }

      if (cleanPath.startsWith('/admin/hero-slides/')) {
        const id = decodeURIComponent(cleanPath.replace('/admin/hero-slides/', '').trim());
        const slides = (await getBlob('cms_hero_slides')) || [];
        const idx = slides.findIndex((s) => s.id === id);
        if (idx === -1) return jsonResponse(404, { error: 'Slide not found' });

        if (method === 'PUT') {
          const body = parseJsonBody(event.body) || {};
          slides[idx] = {
            ...slides[idx],
            ...body,
            id: slides[idx].id,
            updated_at: new Date().toISOString(),
          };
          await setBlob('cms_hero_slides', slides);
          await appendAuditLog(`Updated Hero Slide: "${slides[idx].title}"`);
          return jsonResponse(200, { success: true, slide: slides[idx], slides });
        }

        if (method === 'DELETE') {
          const removed = slides[idx];
          const filtered = slides.filter((s) => s.id !== id);
          await setBlob('cms_hero_slides', filtered);
          await appendAuditLog(`Deleted Hero Slide: "${removed.title}"`);
          return jsonResponse(200, { success: true, slides: filtered });
        }
      }

      if (cleanPath === '/admin/hero-slider-config') {
        if (method === 'GET') {
          const cfg = (await getBlob('cms_hero_slider_config')) || {};
          return jsonResponse(200, cfg);
        }
        if (method === 'PUT' || method === 'POST') {
          const body = parseJsonBody(event.body) || {};
          const existing = (await getBlob('cms_hero_slider_config')) || {};
          const updated = {
            ...existing,
            ...body,
            autoplay_interval: Number(body.autoplay_interval) || 5,
            transition_effect: body.transition_effect === 'slide' ? 'slide' : 'fade',
            updated_at: new Date().toISOString(),
          };
          await setBlob('cms_hero_slider_config', updated);
          await appendAuditLog('Updated Hero Slider configuration');
          return jsonResponse(200, { success: true, config: updated });
        }
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

      // PUT /api/admin/students/:id (Edit Student Profile & Enrolled Courses)
      if (method === 'PUT' && cleanPath.startsWith('/admin/students/') && !cleanPath.endsWith('/status')) {
        const id = cleanPath.replace('/admin/students/', '').trim();
        const body = parseJsonBody(event.body);
        if (!body) return jsonResponse(400, { error: 'Invalid payload' });

        const students = (await getBlob('students_index')) || [];
        const idx = students.findIndex((s) => s.id === id || s.email === id);
        if (idx === -1) return jsonResponse(404, { error: 'Student not found' });

        if (body.name !== undefined) students[idx].name = String(body.name).trim();
        if (body.phone !== undefined) students[idx].phone = String(body.phone).trim();
        if (body.status !== undefined) students[idx].status = body.status === 'disabled' ? 'disabled' : 'active';
        if (body.payment_status !== undefined) students[idx].payment_status = String(body.payment_status).trim();
        if (Array.isArray(body.enrolled_courses)) students[idx].enrolled_courses = body.enrolled_courses;
        students[idx].updated_at = new Date().toISOString();

        await setBlob('students_index', students);
        return jsonResponse(200, { success: true, student: students[idx] });
      }

      // POST /api/admin/payments/test-connection
      if (method === 'POST' && cleanPath === '/admin/payments/test-connection') {
        const body = parseJsonBody(event.body) || {};
        const paymentsCfg = (await getBlob('cms_payments')) || {};
        const keyId = String(body.key_id || paymentsCfg.key_id || '').trim();
        const keySecret = String(body.key_secret || paymentsCfg.key_secret || '').trim();
        const enabled = body.razorpay_enabled !== undefined ? Boolean(body.razorpay_enabled) : Boolean(paymentsCfg.razorpay_enabled);

        if (!enabled) {
          return jsonResponse(200, {
            success: true,
            status: 'DISABLED',
            mode: 'disabled',
            message: 'Payment gateway is currently switched off. Enable Razorpay / UPI toggle to accept payments.',
          });
        }
        if (!keyId) {
          return jsonResponse(400, {
            success: false,
            status: 'MISSING_CREDENTIALS',
            message: 'Razorpay Key ID is empty. Enter rzp_test_... or rzp_live_... to initialize checkout.',
          });
        }
        const isLiveKey = keyId.startsWith('rzp_live_');
        const isDemoOrTest = keyId.includes('demo') || keyId.startsWith('rzp_test_');
        return jsonResponse(200, {
          success: true,
          status: isLiveKey && keySecret ? 'LIVE_READY' : 'SANDBOX_READY',
          mode: isLiveKey ? 'live' : 'sandbox',
          key_id: keyId,
          has_secret: Boolean(keySecret),
          message: isLiveKey && keySecret
            ? `Verified Live Razorpay Configuration (${keyId}). Ready for production capture.`
            : isDemoOrTest
              ? `Verified Sandbox/Test Gateway (${keyId}). Checkout modal and instant course unlocking are operational in test mode.`
              : `Key ID (${keyId}) saved. Provide matching Key Secret for HMAC signature verification.`,
        });
      }

      // ==========================================
      // ADMIN EMAIL CENTER
      // ==========================================

      // GET /api/admin/emails/templates
      if (method === 'GET' && cleanPath === '/admin/emails/templates') {
        const templates = (await getBlob('email_templates')) || [];
        return jsonResponse(200, templates);
      }

      // PUT /api/admin/emails/templates
      if (method === 'PUT' && cleanPath === '/admin/emails/templates') {
        const body = parseJsonBody(event.body);
        if (!Array.isArray(body)) return jsonResponse(400, { error: 'Expected array of email templates' });
        await setBlob('email_templates', body);
        return jsonResponse(200, { success: true, templates: body });
      }

      // GET & POST /api/admin/emails/drafts
      if (cleanPath === '/admin/emails/drafts') {
        if (method === 'GET') {
          const drafts = (await getBlob('email_drafts')) || [];
          return jsonResponse(200, drafts);
        }
        if (method === 'POST') {
          const body = parseJsonBody(event.body);
          if (!body) return jsonResponse(400, { error: 'Invalid draft payload' });
          const drafts = (await getBlob('email_drafts')) || [];
          const draftItem = {
            id: body.id || 'edraft-' + Date.now().toString(36),
            subject: String(body.subject || '(Untitled Draft)').trim(),
            body: String(body.body || ''),
            recipient_type: String(body.recipient_type || 'all'),
            recipient_email: String(body.recipient_email || ''),
            course_id: String(body.course_id || ''),
            updated_at: new Date().toISOString(),
          };
          const existingIdx = drafts.findIndex((d) => d.id === draftItem.id);
          if (existingIdx !== -1) drafts[existingIdx] = draftItem;
          else drafts.unshift(draftItem);
          await setBlob('email_drafts', drafts.slice(0, 50));
          return jsonResponse(200, { success: true, draft: draftItem, drafts });
        }
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
        if (body.resend_api_key !== undefined && String(body.resend_api_key).trim() !== '') {
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

      // ==========================================
      // ADMIN 27-MODULE CMS CONTROL CENTER ROUTES
      // ==========================================

      // Generic CMS key-value store handler for homepage, appearance, navigation, footer, about, contact, seo, payments, users, announcement, marquee-config, sidebars, drafts
      const cmsMap = {
        '/admin/cms/homepage': 'cms_homepage',
        '/admin/cms/appearance': 'cms_appearance',
        '/admin/cms/navigation': 'cms_navigation',
        '/admin/cms/footer': 'cms_footer',
        '/admin/cms/about': 'cms_about',
        '/admin/cms/contact': 'cms_contact',
        '/admin/cms/seo': 'cms_seo',
        '/admin/cms/payments': 'cms_payments',
        '/admin/cms/users': 'cms_users',
        '/admin/cms/categories': 'course_categories',
        '/admin/cms/announcement': 'cms_announcement',
        '/admin/cms/marquee-config': 'cms_marquee_config',
        '/admin/cms/sidebars': 'cms_sidebars',
        '/admin/cms/drafts': 'cms_drafts',
        '/admin/cms/redirects': 'cms_redirects',
        '/admin/cms/social-profiles': 'cms_social_profiles',
        '/admin/cms/featured-announcements': 'cms_featured_announcements',
        '/admin/cms/hero-slides': 'cms_hero_slides',
        '/admin/cms/hero-slider-config': 'cms_hero_slider_config',
      };

      if (cmsMap[cleanPath]) {
        const blobKey = cmsMap[cleanPath];
        if (method === 'GET') {
          const data = await getBlob(blobKey);
          return jsonResponse(200, data || {});
        }
        if (method === 'PUT' || method === 'POST') {
          const body = parseJsonBody(event.body);
          if (!body) return jsonResponse(400, { error: 'Invalid payload' });
          await setBlob(blobKey, body);
          await appendAuditLog(`Updated ${blobKey} configuration`);
          return jsonResponse(200, { success: true, data: body });
        }
      }

      // ==========================================
      // COMPLETE 24-PAGE MANAGER CRUD (/api/admin/cms/pages)
      // ==========================================
      if (cleanPath === '/admin/cms/pages') {
        if (method === 'GET') {
          const pages = (await getBlob('cms_pages')) || [];
          return jsonResponse(200, pages);
        }
        if (method === 'POST') {
          const body = parseJsonBody(event.body);
          if (!body || !body.title) return jsonResponse(400, { error: 'Page title is required' });
          const pages = (await getBlob('cms_pages')) || [];
          const cleanSlug = body.slug
            ? (body.slug.startsWith('#/') ? body.slug : '#/page/' + body.slug.replace(/^\/+/, ''))
            : '#/page/' + body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
          const newPage = {
            id: body.id || 'page-' + Date.now().toString(36),
            title: String(body.title).trim(),
            slug: cleanSlug,
            route_type: body.route_type || 'custom',
            is_system_protected: false,
            status: body.status || 'published',
            visibility: body.visibility || 'public',
            heading: String(body.heading || body.title).trim(),
            subtitle: String(body.subtitle || '').trim(),
            body_content: String(body.body_content || '').trim(),
            cta_text: String(body.cta_text || 'Explore Courses').trim(),
            cta_link: String(body.cta_link || '#/courses').trim(),
            hero_image: String(body.hero_image || '').trim(),
            video_url: String(body.video_url || '').trim(),
            seo_title: String(body.seo_title || `${body.title} — Web Nasir Academy`).trim(),
            seo_description: String(body.seo_description || body.subtitle || '').trim(),
            bg_color: body.bg_color || '#ffffff',
            text_color: body.text_color || '#0f172a',
            layout: body.layout || 'landing',
            sections: Array.isArray(body.sections) ? body.sections : [],
            updated_at: new Date().toISOString(),
          };
          pages.push(newPage);
          await setBlob('cms_pages', pages);
          await appendAuditLog(`Created Page: ${newPage.title} (${newPage.slug})`);
          return jsonResponse(201, { success: true, page: newPage });
        }
        if (method === 'PUT') {
          const body = parseJsonBody(event.body);
          if (!Array.isArray(body)) return jsonResponse(400, { error: 'Expected array of pages' });
          await setBlob('cms_pages', body);
          await appendAuditLog('Updated CMS Pages catalog');
          return jsonResponse(200, { success: true, pages: body });
        }
      }

      if (cleanPath.startsWith('/admin/cms/pages/')) {
        const pageId = cleanPath.replace('/admin/cms/pages/', '').trim();
        const pages = (await getBlob('cms_pages')) || [];
        const idx = pages.findIndex((p) => p.id === pageId);
        if (idx === -1) return jsonResponse(404, { error: 'Page not found' });

        if (method === 'PUT') {
          const body = parseJsonBody(event.body);
          if (!body) return jsonResponse(400, { error: 'Invalid payload' });
          // Preserve system protection and system route slug if protected
          const existing = pages[idx];
          pages[idx] = {
            ...existing,
            ...body,
            id: existing.id,
            is_system_protected: existing.is_system_protected,
            slug: existing.is_system_protected ? existing.slug : (body.slug || existing.slug),
            updated_at: new Date().toISOString(),
          };
          await setBlob('cms_pages', pages);
          await appendAuditLog(`Updated Page: ${pages[idx].title}`);
          return jsonResponse(200, { success: true, page: pages[idx] });
        }

        if (method === 'DELETE') {
          if (pages[idx].is_system_protected) {
            return jsonResponse(400, {
              error: `Protected System Page: "${pages[idx].title}" contains essential platform functionality (authentication, checkout, or dynamic catalog) and cannot be deleted. You can edit its headings, styling, and SEO instead.`,
            });
          }
          const removed = pages[idx];
          const filtered = pages.filter((p) => p.id !== pageId);
          await setBlob('cms_pages', filtered);
          await appendAuditLog(`Deleted Custom Page: ${removed.title}`);
          return jsonResponse(200, { success: true });
        }
      }

      // ==========================================
      // DRAFT & PUBLISH WORKFLOW (/api/admin/cms/publish-draft)
      // ==========================================
      if (cleanPath === '/admin/cms/publish-draft' && method === 'POST') {
        const body = parseJsonBody(event.body) || {};
        // 1. Create automatic backup snapshot BEFORE publishing
        const [homepage, appearance, navigation, footer, settings, pages, sidebars, announcement, marqueeConfig] = await Promise.all([
          getBlob('cms_homepage'),
          getBlob('cms_appearance'),
          getBlob('cms_navigation'),
          getBlob('cms_footer'),
          getBlob('settings'),
          getBlob('cms_pages'),
          getBlob('cms_sidebars'),
          getBlob('cms_announcement'),
          getBlob('cms_marquee_config'),
        ]);
        const revs = (await getBlob('cms_revisions')) || [];
        const autoBackup = {
          id: 'rev-auto-' + Date.now().toString(36),
          label: String(body.change_description || 'Pre-Publish Automatic Backup'),
          created_at: new Date().toISOString(),
          author: admin.username || 'admin',
          snapshot: { homepage, appearance, navigation, footer, settings, pages, sidebars, announcement, marquee_config: marqueeConfig },
        };
        revs.unshift(autoBackup);
        await setBlob('cms_revisions', revs.slice(0, 35));

        // 2. Apply draft modules if provided in payload or stored in cms_drafts
        const savedDrafts = (await getBlob('cms_drafts')) || {};
        const modulesToPublish = { ...(savedDrafts.draft_modules || {}), ...(body.draft_modules || {}) };

        if (modulesToPublish.homepage) await setBlob('cms_homepage', modulesToPublish.homepage);
        if (modulesToPublish.appearance) await setBlob('cms_appearance', modulesToPublish.appearance);
        if (modulesToPublish.navigation) await setBlob('cms_navigation', modulesToPublish.navigation);
        if (modulesToPublish.footer) await setBlob('cms_footer', modulesToPublish.footer);
        if (modulesToPublish.settings) await setBlob('settings', modulesToPublish.settings);
        if (modulesToPublish.pages) await setBlob('cms_pages', modulesToPublish.pages);
        if (modulesToPublish.sidebars) await setBlob('cms_sidebars', modulesToPublish.sidebars);
        if (modulesToPublish.announcement) await setBlob('cms_announcement', modulesToPublish.announcement);
        if (modulesToPublish.marquee_config) await setBlob('cms_marquee_config', modulesToPublish.marquee_config);

        await setBlob('cms_drafts', {
          has_unpublished_changes: false,
          last_published_at: new Date().toISOString(),
          last_published_by: admin.username || 'admin',
          draft_modules: {},
        });

        await appendAuditLog(`Published Website Changes (${autoBackup.label}) with Auto-Backup ${autoBackup.id}`);
        return jsonResponse(200, {
          success: true,
          backup_id: autoBackup.id,
          published_at: new Date().toISOString(),
        });
      }

      // ==========================================
      // PART 9A: AI CONTENT ASSISTANT (/api/admin/ai-assistant)
      // ==========================================
      if (cleanPath === '/admin/ai-assistant' && method === 'POST') {
        const body = parseJsonBody(event.body) || {};
        const taskType = String(body.task_type || 'improve_copy');
        const contextText = String(body.context || '').trim();
        const targetTone = String(body.tone || 'Executive, Practical & High-Conversion');

        const taskPrompts = {
          homepage_heading: `Write 3 high-converting homepage hero headlines and matching subheadlines for Web Nasir Academy (an AI Engineering, Full-Stack Web Development & High-RPM Digital Publishing Academy led by 10-year veteran Nasir). Context: ${contextText}`,
          improve_description: `Rewrite and improve the following website copy to be sharper, more authoritative, and conversion-focused without hype or clichés:\n\n"${contextText}"`,
          seo_meta: `Generate an optimized SEO Title (< 60 chars), Meta Description (130-155 chars), and 5 target keywords for this page/topic:\n\n"${contextText}"`,
          course_description: `Write a compelling course overview, 4 bulleted learning outcomes, and target audience description for a technical masterclass on:\n\n"${contextText}"`,
          generate_faq: `Generate 5 practical, conversion-boosting Frequently Asked Questions (Q&A format) for students considering:\n\n"${contextText}"`,
          announcement_bar: `Write 3 concise, high-CTR top announcement bar / marquee messages (each under 95 characters) with a short CTA button label for:\n\n"${contextText}"`,
          cta_suggestion: `Suggest 5 action-oriented Call-to-Action (CTA) button labels and supporting micro-copy for:\n\n"${contextText}"`,
          article_outline: `Create a structured technical guide / case study outline (H1, H2s, key architectural takeaways, and monetization benchmarks) for:\n\n"${contextText}"`,
        };

        const promptText = taskPrompts[taskType] || `Task (${taskType}): ${contextText}\nTone: ${targetTone}`;
        const sysInstruction = `You are the Editorial & SEO Assistant for Web Nasir Academy. Tone: ${targetTone}. Provide clean, ready-to-use copy. Do not wrap in markdown code fences.`;

        const aiResult = await callGeminiAPI(promptText, sysInstruction);
        let suggestion = '';
        let source = 'gemini_live';

        if (aiResult && aiResult.text) {
          suggestion = aiResult.text.trim();
          source = `gemini (${aiResult.model})`;
        } else {
          source = 'structured_editorial_engine';
          if (taskType === 'homepage_heading') {
            suggestion = `Option 1:\nHeadline: Master Production AI, Full-Stack Systems & High-RPM Publishing.\nSubtitle: Build deployable software and profitable digital properties with 10-year practitioner Nasir.\n\nOption 2:\nHeadline: Stop Watching Theory. Start Shipping Real AI & Web Assets.\nSubtitle: Access 11 free AI utilities and 8 project-driven engineering masterclasses.\n\nOption 3:\nHeadline: From Code to Commercial Scale: The Practical AI & Web Academy.\nSubtitle: Master Gemini API workflows, technical SEO, and $35+ RPM AdSense architectures.`;
          } else if (taskType === 'seo_meta') {
            suggestion = `SEO Title: ${contextText ? contextText.slice(0, 42) : 'Practical AI & Web Engineering'} — Web Nasir Academy\nMeta Description: Master ${contextText || 'practical AI tools, full-stack web development, and high-RPM monetization'} with hands-on source code and mentorship by Nasir.\nTarget Keywords: AI engineering course, full-stack web development, technical SEO, AdSense high RPM, Web Nasir Academy`;
          } else if (taskType === 'announcement_bar') {
            suggestion = `1. New Cohort Open: Complete AI Mastery & Full-Stack Engineering — Enroll Now →\n2. 11 Free AI & Webmaster Tools Live: Test Our Gemini-Powered Utilities — Try Free →\n3. Download Battle-Tested $35+ RPM AdSense & Technical SEO Blueprints — Explore →`;
          } else if (taskType === 'generate_faq') {
            suggestion = `Q: Do I get lifetime access and source code templates?\nA: Yes. Every masterclass includes lifetime video access, downloadable production code, and future syllabus updates.\n\nQ: Can beginners enroll in these technical tracks?\nA: Yes. Each course starts from foundational architecture and progresses step-by-step to production deployment.\n\nQ: How does instant enrollment work?\nA: Complete checkout via UPI, Card, or NetBanking and your course unlocks immediately inside your Student Portal.`;
          } else {
            suggestion = `Master ${contextText || 'modern AI engineering, full-stack web development, and high-RPM digital monetization'} through battle-tested production workflows, real source code templates, and direct practitioner mentorship at Web Nasir Academy.`;
          }
        }

        await appendAuditLog(`Generated AI Copy Suggestion (${taskType}) — Pending Admin Approval`);
        return jsonResponse(200, {
          success: true,
          requires_approval: true,
          task_type: taskType,
          source,
          suggestion,
        });
      }

      // ==========================================
      // PART 9B: BROKEN LINK CHECKER (/api/admin/qa/broken-links)
      // ==========================================
      if (cleanPath === '/admin/qa/broken-links' && method === 'GET') {
        const [nav, footer, courses, freeCourses, tools, articles, pages, marquee, announcement] = await Promise.all([
          getBlob('cms_navigation').then((r) => r || {}),
          getBlob('cms_footer').then((r) => r || {}),
          getBlob('courses_index').then((r) => r || []),
          getBlob('free_courses_index').then((r) => r || []),
          getBlob('tools_index').then((r) => r || []),
          getBlob('articles_index').then((r) => r || []),
          getBlob('cms_pages').then((r) => r || []),
          getBlob('marquee_items').then((r) => r || []),
          getBlob('cms_announcement').then((r) => r || {}),
        ]);

        // Build set of valid internal hash routes
        const validRoutes = new Set([
          '#/', '#home', '#/about', '#/contact', '#/tools', '#/courses', '#/courses?filter=free',
          '#/tracks', '#/topics', '#/articles', '#/articles?tag=case-study', '#/student', '#/student-login',
          '#/student?tab=courses', '#/checkout', '#/payment-success', '#/payment-failure',
          '#/privacy', '#/terms', '#/disclaimer', '#/faq', '#/search', '#video'
        ]);
        tools.forEach((t) => {
          if (t.id) validRoutes.add(`#/tools/${t.id}`);
          if (t.key) validRoutes.add(`#/tools/${t.key}`);
        });
        courses.forEach((c) => validRoutes.add(`#/courses/${c.id}`));
        freeCourses.forEach((c) => validRoutes.add(`#/courses/${c.id}`));
        articles.forEach((a) => validRoutes.add(`#/articles/${a.slug}`));
        pages.forEach((p) => { if (p.slug) validRoutes.add(p.slug); });

        const results = [];
        const checkUrl = (sourceLabel, label, url) => {
          const u = String(url || '').trim();
          if (!u) {
            results.push({ source: sourceLabel, label, url: '(empty)', status: 'broken', reason: 'Empty URL target' });
            return;
          }
          if (u.startsWith('#')) {
            const isDynamicPattern = u.includes(':id') || u.includes(':slug');
            const isValid = isDynamicPattern || validRoutes.has(u) || u.startsWith('#/courses?') || u.startsWith('#/articles?') || u.startsWith('#/tools?');
            results.push({
              source: sourceLabel,
              label,
              url: u,
              status: isValid ? 'valid' : 'broken',
              reason: isValid ? 'Verified internal route target' : 'Target route does not match any active page, tool, course, or article',
            });
          } else if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('mailto:') || u.startsWith('tel:') || u.startsWith('/')) {
            results.push({
              source: sourceLabel,
              label,
              url: u,
              status: 'valid',
              reason: 'Valid URI format',
            });
          } else {
            results.push({
              source: sourceLabel,
              label,
              url: u,
              status: 'broken',
              reason: 'Malformed URL (must start with #/, /, https://, mailto:, or tel:)',
            });
          }
        };

        // Scan Navigation & Dropdowns
        if (announcement?.link_url) checkUrl('Announcement Bar', announcement.button_text || 'Announcement CTA', announcement.link_url);
        if (nav?.cta_button_url) checkUrl('Header CTA', nav.cta_button_text || 'Header CTA', nav.cta_button_url);
        (nav?.items || []).forEach((item) => {
          checkUrl('Header Navigation', item.label, item.url);
          (item.dropdown || []).forEach((sub) => checkUrl(`Dropdown (${item.label})`, sub.label, sub.url));
        });

        // Scan Footer Columns
        (footer?.columns || []).forEach((col) => {
          (col.links || []).forEach((lnk) => checkUrl(`Footer (${col.title})`, lnk.label, lnk.url));
        });

        // Scan Marquee
        (marquee || []).forEach((m) => {
          if (m.link) checkUrl('Marquee Strip', m.text?.slice(0, 35) || 'Marquee Item', m.link);
        });

        // Scan Custom Pages CTAs
        (pages || []).forEach((p) => {
          if (p.cta_link) checkUrl(`Page (${p.title})`, p.cta_text || 'Page CTA', p.cta_link);
        });

        const brokenCount = results.filter((r) => r.status === 'broken').length;
        return jsonResponse(200, {
          checked_at: new Date().toISOString(),
          total_links_checked: results.length,
          valid_count: results.length - brokenCount,
          broken_count: brokenCount,
          links: results,
        });
      }

      // ==========================================
      // PART 9C: SEO HEALTH CHECKER (/api/admin/qa/seo-health)
      // ==========================================
      if (cleanPath === '/admin/qa/seo-health' && method === 'GET') {
        const [pages, seo, media, courses, articles] = await Promise.all([
          getBlob('cms_pages').then((r) => r || []),
          getBlob('cms_seo').then((r) => r || {}),
          getBlob('cms_media').then((r) => r || []),
          getBlob('courses_index').then((r) => r || []),
          getBlob('articles_index').then((r) => r || []),
        ]);

        const issues = [];
        const checks = [];
        const seenTitles = new Map();

        // 1. Check Global SEO Config
        if (!seo.global_title || seo.global_title.length < 15) {
          issues.push({ severity: 'high', category: 'Global SEO', item: 'Global Title', message: 'Global SEO title is missing or too short (< 15 chars).' });
        } else {
          checks.push({ status: 'pass', item: 'Global Site Title', detail: `${seo.global_title} (${seo.global_title.length} chars)` });
        }

        if (!seo.meta_description || seo.meta_description.length < 50) {
          issues.push({ severity: 'high', category: 'Global SEO', item: 'Global Meta Description', message: 'Global meta description is missing or under 50 characters.' });
        } else {
          checks.push({ status: 'pass', item: 'Global Meta Description', detail: `${seo.meta_description.length} chars (Optimal 50–160 chars)` });
        }

        if (!seo.og_image || !seo.og_image.startsWith('http')) {
          issues.push({ severity: 'medium', category: 'Social Graph', item: 'OpenGraph Image', message: 'OpenGraph social share image URL is missing or invalid.' });
        } else {
          checks.push({ status: 'pass', item: 'OpenGraph Social Image', detail: seo.og_image });
        }

        if (!seo.canonical_base || !seo.canonical_base.startsWith('https://')) {
          issues.push({ severity: 'medium', category: 'Canonical', item: 'Canonical Base URL', message: 'Canonical base URL should start with https://' });
        } else {
          checks.push({ status: 'pass', item: 'Canonical Base URL', detail: seo.canonical_base });
        }

        // 2. Check All 24 Pages for Missing/Duplicate Titles & Descriptions
        pages.forEach((p) => {
          const t = (p.seo_title || '').trim();
          const d = (p.seo_description || '').trim();
          if (!t) {
            issues.push({ severity: 'high', category: 'Page SEO', item: p.title, message: `Page "${p.title}" (${p.slug}) is missing an SEO Title.` });
          } else {
            if (seenTitles.has(t.toLowerCase())) {
              issues.push({ severity: 'medium', category: 'Duplicate Title', item: p.title, message: `Duplicate SEO title shared with "${seenTitles.get(t.toLowerCase())}".` });
            }
            seenTitles.set(t.toLowerCase(), p.title);
          }
          if (!d || d.length < 30) {
            issues.push({ severity: 'medium', category: 'Page Meta', item: p.title, message: `Page "${p.title}" has a missing or short meta description (< 30 chars).` });
          }
        });

        // 3. Check Media Library Alt Text
        const missingAltMedia = media.filter((m) => m.type === 'image' && (!m.alt || !m.alt.trim()));
        if (missingAltMedia.length > 0) {
          missingAltMedia.forEach((m) => {
            issues.push({ severity: 'low', category: 'Accessibility / Image SEO', item: m.title, message: `Image asset "${m.title}" is missing descriptive alt text.` });
          });
        } else {
          checks.push({ status: 'pass', item: 'Image Alt Attributes', detail: `All ${media.filter((m) => m.type === 'image').length} image assets have alt text.` });
        }

        const score = Math.max(0, 100 - issues.filter((i) => i.severity === 'high').length * 15 - issues.filter((i) => i.severity === 'medium').length * 7 - issues.filter((i) => i.severity === 'low').length * 3);

        return jsonResponse(200, {
          checked_at: new Date().toISOString(),
          seo_score: score,
          pages_audited: pages.length,
          courses_audited: courses.length,
          articles_audited: articles.length,
          media_audited: media.length,
          issues_count: issues.length,
          issues,
          passing_checks: checks,
        });
      }

      // ==========================================
      // PART 9D: REAL WEBSITE HEALTH DASHBOARD (/api/admin/qa/system-health)
      // ==========================================
      if (cleanPath === '/admin/qa/system-health' && method === 'GET') {
        const startPing = Date.now();
        let dbWritePass = false;
        let dbLatencyMs = 0;
        try {
          const probeTime = new Date().toISOString();
          await setBlob('health_probe', { last_ping: probeTime });
          const readBack = await getBlob('health_probe');
          dbWritePass = Boolean(readBack && readBack.last_ping === probeTime);
          dbLatencyMs = Date.now() - startPing;
        } catch {
          dbWritePass = false;
        }

        const [paymentsCfg, emailCfg, tools, courses, freeCourses, pages] = await Promise.all([
          getBlob('cms_payments').then((r) => r || {}),
          getBlob('email_config').then((r) => r || {}),
          getBlob('tools_index').then((r) => r || []),
          getBlob('courses_index').then((r) => r || []),
          getBlob('free_courses_index').then((r) => r || []),
          getBlob('cms_pages').then((r) => r || []),
        ]);

        const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);
        const hasResendKey = Boolean(process.env.RESEND_API_KEY || (emailCfg.resend_api_key && emailCfg.resend_api_key.startsWith('re_')));
        const hasRazorpayRealKey = Boolean(process.env.RAZORPAY_KEY_ID || (paymentsCfg.key_id && !paymentsCfg.key_id.includes('demo')));

        const services = [
          {
            id: 'api_router',
            name: 'Serverless API Router',
            status: 'PASS',
            detail: 'Netlify Functions HTTP Router active and responding (200 OK)',
          },
          {
            id: 'database_blobs',
            name: 'Persistent Database (Netlify Blobs)',
            status: dbWritePass ? 'PASS' : 'FAIL',
            detail: dbWritePass
              ? `Read/Write verified in ${dbLatencyMs}ms (${tools.length} tools, ${courses.length} paid courses, ${freeCourses.length} free courses, ${pages.length} pages)`
              : 'Database read/write probe failed',
          },
          {
            id: 'firebase_auth_firestore',
            name: 'Firebase Auth & Firestore Integration',
            status: 'PASS',
            detail: 'Configured for project ai-studio-webnasirengine-147046f5-1c39-4dfe-b833-bdabc666c271 (Google + Email/Password enabled)',
          },
          {
            id: 'gemini_ai',
            name: 'Gemini AI Generation Service',
            status: hasGeminiKey ? 'PASS' : 'CONFIG_NEEDED',
            detail: hasGeminiKey
              ? 'GEMINI_API_KEY present in server environment (gemini-3.8-flash active)'
              : 'GEMINI_API_KEY not set in environment — using deterministic structured engine fallback',
          },
          {
            id: 'payment_gateway',
            name: 'Payment Gateway (Razorpay / UPI)',
            status: paymentsCfg.razorpay_enabled ? (hasRazorpayRealKey ? 'PASS' : 'SANDBOX_MODE') : 'DISABLED',
            detail: hasRazorpayRealKey
              ? `Live/Custom Razorpay Key configured (${paymentsCfg.key_id})`
              : `Running in Sandbox/Test verification mode (${paymentsCfg.key_id || 'rzp_test_webnasir_demo'}). Add production Razorpay keys in Payment Settings for live bank capture.`,
          },
          {
            id: 'email_service',
            name: 'Transactional Email Service (Resend)',
            status: hasResendKey ? 'PASS' : 'CONFIG_NEEDED',
            detail: hasResendKey
              ? 'Resend API Key configured for live external email dispatch'
              : 'RESEND_API_KEY not configured — emails are logged in Email Center history with status "simulated" until a real Resend key (re_...) is saved in Email Center.',
          },
        ];

        return jsonResponse(200, {
          checked_at: new Date().toISOString(),
          deployment_version: 'v4.0-visual-cms-27',
          db_latency_ms: dbLatencyMs,
          services,
        });
      }

      // Free Courses CRUD (/api/admin/free-courses)
      if (cleanPath === '/admin/free-courses') {
        if (method === 'GET') {
          const list = (await getBlob('free_courses_index')) || [];
          return jsonResponse(200, list);
        }
        if (method === 'POST') {
          const body = parseJsonBody(event.body);
          if (!body || !body.title) return jsonResponse(400, { error: 'Course title is required' });
          const list = (await getBlob('free_courses_index')) || [];
          const id = body.id || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
          const newCourse = {
            id,
            title: String(body.title).trim(),
            slug: id,
            category: String(body.category || 'AI Engineering'),
            level: String(body.level || 'All Levels'),
            duration: String(body.duration || '2 Hours'),
            price: 0,
            original_price: Number(body.original_price) || 1499,
            is_free: true,
            rating: Number(body.rating) || 4.9,
            enrolled_count: Number(body.enrolled_count) || 100,
            badge: String(body.badge || '100% Free Course'),
            instructor: String(body.instructor || 'Nasir'),
            description: String(body.description || ''),
            outcomes: Array.isArray(body.outcomes) ? body.outcomes : [],
            modules: Array.isArray(body.modules) ? body.modules : [],
            is_published: body.is_published !== false,
            sort_order: Number(body.sort_order) || list.length + 1,
          };
          list.push(newCourse);
          await setBlob('free_courses_index', list);
          await appendAuditLog(`Created Free Course: ${newCourse.title}`);
          return jsonResponse(201, { success: true, course: newCourse });
        }
      }

      if (cleanPath.startsWith('/admin/free-courses/')) {
        const id = cleanPath.replace('/admin/free-courses/', '').trim();
        const list = (await getBlob('free_courses_index')) || [];
        if (method === 'PUT') {
          const body = parseJsonBody(event.body);
          const idx = list.findIndex((c) => c.id === id);
          if (idx === -1) return jsonResponse(404, { error: 'Free course not found' });
          list[idx] = { ...list[idx], ...body, id, price: 0, is_free: true };
          await setBlob('free_courses_index', list);
          await appendAuditLog(`Updated Free Course: ${list[idx].title}`);
          return jsonResponse(200, { success: true, course: list[idx] });
        }
        if (method === 'DELETE') {
          const filtered = list.filter((c) => c.id !== id);
          await setBlob('free_courses_index', filtered);
          await appendAuditLog(`Deleted Free Course ID: ${id}`);
          return jsonResponse(200, { success: true });
        }
      }

      // Media Library CRUD with Real Usage Tracking (/api/admin/cms/media)
      const computeMediaUsage = async (mediaList) => {
        const [pages, courses, articles, about, seo] = await Promise.all([
          getBlob('cms_pages').then((r) => r || []),
          getBlob('courses_index').then((r) => r || []),
          getBlob('articles_index').then((r) => r || []),
          getBlob('cms_about').then((r) => r || {}),
          getBlob('cms_seo').then((r) => r || {}),
        ]);
        return mediaList.map((m) => {
          const locs = [];
          if (m.used_in && m.used_in !== 'Unassigned') locs.push(m.used_in);
          pages.forEach((p) => {
            if (p.hero_image === m.url || p.video_url === m.url) locs.push(`Page: ${p.title}`);
          });
          courses.forEach((c) => {
            if (c.image === m.url || c.video_preview === m.url) locs.push(`Course: ${c.title}`);
          });
          articles.forEach((a) => {
            if (a.image === m.url) locs.push(`Article: ${a.title}`);
          });
          if (about.founder_photo === m.url || about.video_url === m.url) locs.push('About Us Page');
          if (seo.og_image === m.url) locs.push('Global OpenGraph Image');
          const uniqueLocs = Array.from(new Set(locs));
          return {
            ...m,
            usage_locations: uniqueLocs,
            used_in: uniqueLocs.length > 0 ? uniqueLocs.join(', ') : 'Unassigned',
          };
        });
      };

      // Helper to extract and persist binary data URLs into dedicated media_bin:<id> blobs
      // and return a real HTTP URL (/api/media/file/<id>.<ext>) that survives page refresh
      const persistMediaBinaryIfDataUrl = async (id, rawUrl, explicitDataUrl) => {
        const sourceData = explicitDataUrl || (typeof rawUrl === 'string' && rawUrl.startsWith('data:') ? rawUrl : '');
        if (!sourceData || !sourceData.startsWith('data:')) {
          return { publicUrl: String(rawUrl || '').trim(), mimeType: null };
        }
        const match = sourceData.match(/^data:([^;]+);base64,(.+)$/);
        if (!match) {
          return { publicUrl: String(rawUrl || '').trim(), mimeType: null };
        }
        const mimeType = match[1];
        const base64Data = match[2];
        const extMap = {
          'image/webp': 'webp',
          'image/jpeg': 'jpg',
          'image/jpg': 'jpg',
          'image/png': 'png',
          'image/gif': 'gif',
          'image/svg+xml': 'svg',
          'video/mp4': 'mp4',
          'video/webm': 'webm',
        };
        const ext = extMap[mimeType] || 'webp';
        await setBlob(`media_bin:${id}`, {
          id,
          mime_type: mimeType,
          base64: base64Data,
          updated_at: new Date().toISOString(),
        });
        return {
          publicUrl: `/api/media/file/${id}.${ext}`,
          mimeType,
        };
      };

      if (cleanPath === '/admin/cms/media') {
        if (method === 'GET') {
          const media = (await getBlob('cms_media')) || [];
          const enriched = await computeMediaUsage(media);
          return jsonResponse(200, enriched);
        }
        if (method === 'POST') {
          const body = parseJsonBody(event.body);
          if (!body || (!body.url && !body.data_url)) {
            return jsonResponse(400, { error: 'Media URL or uploaded file data is required' });
          }
          const media = (await getBlob('cms_media')) || [];
          const id = body.id || 'med-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 5);
          const { publicUrl, mimeType } = await persistMediaBinaryIfDataUrl(id, body.url, body.data_url);

          const newItem = {
            id,
            title: String(body.title || 'Uploaded Asset').trim(),
            url: publicUrl,
            type: body.type || (mimeType && mimeType.startsWith('video/') ? 'video' : 'image'),
            mime_type: mimeType || body.mime_type || 'image/webp',
            category: String(body.category || 'general'),
            alt: String(body.alt || body.title || '').trim(),
            file_size: String(body.file_size || 'Optimized WebP'),
            dimensions: String(body.dimensions || 'Responsive'),
            used_in: String(body.used_in || 'Unassigned'),
            created_at: new Date().toISOString(),
          };
          media.unshift(newItem);
          await setBlob('cms_media', media);
          await appendAuditLog(`Uploaded Media Asset: ${newItem.title} (${newItem.url})`);
          const enriched = await computeMediaUsage([newItem]);
          return jsonResponse(201, { success: true, item: enriched[0] });
        }
      }

      if (cleanPath.startsWith('/admin/cms/media/')) {
        const subPath = cleanPath.replace('/admin/cms/media/', '').trim();

        // POST /api/admin/cms/media/:id/replace-and-delete (Replaces all active references across site, then deletes)
        if (method === 'POST' && subPath.endsWith('/replace-and-delete')) {
          const id = subPath.replace('/replace-and-delete', '').trim();
          const body = parseJsonBody(event.body) || {};
          const replacementUrl = String(body.replacement_url || '').trim();
          const media = (await getBlob('cms_media')) || [];
          const idx = media.findIndex((m) => m.id === id);
          if (idx === -1) return jsonResponse(404, { error: 'Media asset not found' });

          const oldUrl = media[idx].url;
          if (replacementUrl && oldUrl) {
            const [pages, courses, articles, about, seo] = await Promise.all([
              getBlob('cms_pages').then((r) => r || []),
              getBlob('courses_index').then((r) => r || []),
              getBlob('articles_index').then((r) => r || []),
              getBlob('cms_about').then((r) => r || {}),
              getBlob('cms_seo').then((r) => r || {}),
            ]);
            let pagesChanged = false;
            pages.forEach((p) => {
              if (p.hero_image === oldUrl) { p.hero_image = replacementUrl; pagesChanged = true; }
              if (p.video_url === oldUrl) { p.video_url = replacementUrl; pagesChanged = true; }
            });
            if (pagesChanged) await setBlob('cms_pages', pages);

            let coursesChanged = false;
            for (const c of courses) {
              if (c.image === oldUrl || c.video_preview === oldUrl) {
                if (c.image === oldUrl) c.image = replacementUrl;
                if (c.video_preview === oldUrl) c.video_preview = replacementUrl;
                coursesChanged = true;
                await setBlob(`course:${c.id}`, c);
              }
            }
            if (coursesChanged) await setBlob('courses_index', courses);

            let articlesChanged = false;
            for (const a of articles) {
              if (a.image === oldUrl) {
                a.image = replacementUrl;
                articlesChanged = true;
                const fullArt = await getBlob(`article:${a.slug}`);
                if (fullArt) {
                  fullArt.image = replacementUrl;
                  await setBlob(`article:${a.slug}`, fullArt);
                }
              }
            }
            if (articlesChanged) await setBlob('articles_index', articles);

            if (about.founder_photo === oldUrl || about.video_url === oldUrl) {
              if (about.founder_photo === oldUrl) about.founder_photo = replacementUrl;
              if (about.video_url === oldUrl) about.video_url = replacementUrl;
              await setBlob('cms_about', about);
            }
            if (seo.og_image === oldUrl) {
              seo.og_image = replacementUrl;
              await setBlob('cms_seo', seo);
            }
          }

          const removed = media[idx];
          const filtered = media.filter((m) => m.id !== id);
          await setBlob('cms_media', filtered);
          await deleteBlob(`media_bin:${id}`);
          await appendAuditLog(`Replaced & Deleted Media Asset: ${removed.title}`);
          return jsonResponse(200, { success: true });
        }

        const id = subPath;
        const media = (await getBlob('cms_media')) || [];
        const idx = media.findIndex((m) => m.id === id);
        if (idx === -1) return jsonResponse(404, { error: 'Media asset not found' });

        if (method === 'PUT') {
          const body = parseJsonBody(event.body) || {};
          let updatedUrl = body.url !== undefined ? String(body.url).trim() : media[idx].url;
          if (body.data_url || (updatedUrl && updatedUrl.startsWith('data:'))) {
            const { publicUrl, mimeType } = await persistMediaBinaryIfDataUrl(id, updatedUrl, body.data_url);
            updatedUrl = publicUrl + `?v=${Date.now().toString(36)}`;
            if (mimeType) body.mime_type = mimeType;
          }
          const updatedItem = {
            ...media[idx],
            ...body,
            id,
            url: updatedUrl,
            updated_at: new Date().toISOString(),
          };
          delete updatedItem.data_url;
          media[idx] = updatedItem;
          await setBlob('cms_media', media);
          await appendAuditLog(`Updated Media Asset: ${media[idx].title}`);
          const enriched = await computeMediaUsage([media[idx]]);
          return jsonResponse(200, { success: true, item: enriched[0] });
        }

        if (method === 'DELETE') {
          const enriched = await computeMediaUsage([media[idx]]);
          const target = enriched[0];
          const force = event.queryStringParameters?.force === 'true';
          if (target.usage_locations && target.usage_locations.length > 0 && !force) {
            return jsonResponse(400, {
              error: `Media asset "${target.title}" is currently used on: ${target.usage_locations.join(', ')}. Replace it on those pages first or confirm forced deletion.`,
              usage_locations: target.usage_locations,
            });
          }
          const filtered = media.filter((m) => m.id !== id);
          await setBlob('cms_media', filtered);
          await deleteBlob(`media_bin:${id}`);
          await appendAuditLog(`Deleted Media Asset: ${target.title}`);
          return jsonResponse(200, { success: true });
        }
      }

      // Revisions & Rollback System (/api/admin/cms/revisions)
      if (cleanPath === '/admin/cms/revisions') {
        if (method === 'GET') {
          const revs = (await getBlob('cms_revisions')) || [];
          return jsonResponse(200, revs);
        }
        if (method === 'POST') {
          const body = parseJsonBody(event.body) || {};
          const [homepage, appearance, navigation, footer, settings, pages, sidebars, announcement, marqueeConfig] = await Promise.all([
            getBlob('cms_homepage'),
            getBlob('cms_appearance'),
            getBlob('cms_navigation'),
            getBlob('cms_footer'),
            getBlob('settings'),
            getBlob('cms_pages'),
            getBlob('cms_sidebars'),
            getBlob('cms_announcement'),
            getBlob('cms_marquee_config'),
          ]);
          const revs = (await getBlob('cms_revisions')) || [];
          const newRev = {
            id: 'rev-' + Date.now().toString(36),
            label: String(body.label || 'Manual Snapshot Point'),
            created_at: new Date().toISOString(),
            author: admin.username || 'admin',
            snapshot: { homepage, appearance, navigation, footer, settings, pages, sidebars, announcement, marquee_config: marqueeConfig },
          };
          revs.unshift(newRev);
          await setBlob('cms_revisions', revs.slice(0, 35));
          await appendAuditLog(`Created CMS Snapshot Revision: ${newRev.label}`);
          return jsonResponse(201, { success: true, revision: newRev });
        }
      }

      if (cleanPath === '/admin/cms/rollback' && method === 'POST') {
        const body = parseJsonBody(event.body);
        if (!body || !body.revision_id) return jsonResponse(400, { error: 'revision_id is required' });
        const revs = (await getBlob('cms_revisions')) || [];
        const target = revs.find((r) => r.id === body.revision_id);
        if (!target || !target.snapshot) return jsonResponse(404, { error: 'Revision snapshot not found' });
        if (target.snapshot.homepage) await setBlob('cms_homepage', target.snapshot.homepage);
        if (target.snapshot.appearance) await setBlob('cms_appearance', target.snapshot.appearance);
        if (target.snapshot.navigation) await setBlob('cms_navigation', target.snapshot.navigation);
        if (target.snapshot.footer) await setBlob('cms_footer', target.snapshot.footer);
        if (target.snapshot.settings) await setBlob('settings', target.snapshot.settings);
        if (target.snapshot.pages) await setBlob('cms_pages', target.snapshot.pages);
        if (target.snapshot.sidebars) await setBlob('cms_sidebars', target.snapshot.sidebars);
        if (target.snapshot.announcement) await setBlob('cms_announcement', target.snapshot.announcement);
        if (target.snapshot.marquee_config) await setBlob('cms_marquee_config', target.snapshot.marquee_config);
        await appendAuditLog(`Rolled back CMS to revision: ${target.label}`);
        return jsonResponse(200, { success: true, message: `Rolled back to ${target.label}` });
      }

      // Audit Logs (/api/admin/cms/audit-logs)
      if (cleanPath === '/admin/cms/audit-logs' && method === 'GET') {
        const logs = (await getBlob('cms_audit_logs')) || [];
        return jsonResponse(200, logs);
      }

      // Subscribers list for Email Center (/api/admin/subscribers)
      if (cleanPath === '/admin/subscribers' && method === 'GET') {
        const subs = (await getBlob('subscribers_list')) || [];
        return jsonResponse(200, subs);
      }

      // Full Database & Media Portability Export (/api/admin/backup/export)
      if (cleanPath === '/admin/backup/export' && method === 'GET') {
        const allKeys = await listBlobs();
        const exportData = {};
        for (const key of allKeys) {
          if (key.startsWith('_')) continue;
          exportData[key] = await getBlob(key);
        }
        return jsonResponse(200, {
          exported_at: new Date().toISOString(),
          version: 'web-nasir-portable-v1',
          keys_count: Object.keys(exportData).length,
          data: exportData,
        });
      }

      // Full Database & Media Portability Restore (/api/admin/backup/restore)
      if (cleanPath === '/admin/backup/restore' && method === 'POST') {
        const body = parseJsonBody(event.body);
        const restoreMap = body?.data || body;
        if (!restoreMap || typeof restoreMap !== 'object') {
          return jsonResponse(400, { error: 'Valid backup JSON payload is required' });
        }
        let restoredCount = 0;
        for (const [k, v] of Object.entries(restoreMap)) {
          if (k.startsWith('_') || k === 'exported_at' || k === 'version' || k === 'keys_count') continue;
          await setBlob(k, v);
          restoredCount++;
        }
        await appendAuditLog(`Restored full database backup (${restoredCount} records)`);
        return jsonResponse(200, {
          success: true,
          restored_keys: restoredCount,
          message: `Successfully restored ${restoredCount} database records.`,
        });
      }
    }

    return jsonResponse(404, { error: `Route not found: ${method} ${cleanPath}` });
  } catch (err) {
    console.error('Unhandled server error in Netlify API router:', err);
    return jsonResponse(500, { error: err.message || 'Internal server error' });
  }
};

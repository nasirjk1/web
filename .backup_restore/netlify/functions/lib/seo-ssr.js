import { getBlob } from './store.js';
import { ensureSeeded } from './seed.js';

export const TOOL_SLUG_TO_KEY = {
  'youtube-title-generator': 'youtube',
  'seo-blog-outline-generator': 'blogoutline',
  'code-regex-explainer': 'codeexplainer',
  'code-and-regex-explainer': 'codeexplainer',
  'ad-copy-generator': 'adcopy',
  'high-converting-ad-copy-generator': 'adcopy',
  'adsense-revenue-calculator': 'business',
  'adsense-rpm-revenue-calculator': 'business',
  'domain-brand-name-generator': 'name',
  'brand-and-domain-name-generator': 'name',
  'social-media-caption-generator': 'instagram',
  'word-count-seo-analyzer': 'wordcount',
  'seo-word-and-keyword-density-counter': 'wordcount',
  'password-generator': 'password',
  'cryptographic-password-generator': 'password',
  'age-milestone-calculator': 'age',
  'exact-age-and-milestone-calculator': 'age',
  'adsense-arbitrage-calculator': 'arbitrage',
  'adsense-arbitrage-profit-calculator': 'arbitrage',
  youtube: 'youtube',
  blogoutline: 'blogoutline',
  codeexplainer: 'codeexplainer',
  adcopy: 'adcopy',
  business: 'business',
  name: 'name',
  instagram: 'instagram',
  wordcount: 'wordcount',
  password: 'password',
  age: 'age',
  arbitrage: 'arbitrage',
};

export const TOOL_KEY_TO_SLUG = {
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

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Resolves a request pathname into SEO metadata, HTTP status code, JSON-LD schema,
 * and server-rendered fallback HTML content for search engines and social crawlers.
 */
export async function resolveRouteSeoData(rawPathname) {
  await ensureSeeded();

  const pathname = (rawPathname || '/').split('?')[0].replace(/\/+$/, '') || '/';

  const [settings, seo, tools, courses, freeCourses, articles, topics, pages] = await Promise.all([
    getBlob('settings').then((r) => r || {}),
    getBlob('cms_seo').then((r) => r || {}),
    getBlob('tools_index').then((r) => r || []),
    getBlob('courses_index').then((r) => r || []),
    getBlob('free_courses_index').then((r) => r || []),
    getBlob('articles_index').then((r) => r || []),
    getBlob('topics_index').then((r) => r || []),
    getBlob('cms_pages').then((r) => r || []),
  ]);

  const baseDomain = (seo.canonical_base || seo.canonical_url || 'https://webnasir.dpdns.org').replace(/\/+$/, '');
  const siteName = settings.site_name || 'Web Nasir';
  const defaultTitle = seo.global_title || 'Web Nasir — Master AI, Build Digital Skills & Grow Your Online Future';
  const defaultDesc =
    seo.meta_description ||
    "Explore powerful AI tools, learn website development, master SEO and digital marketing, and build practical skills through Web Nasir's free resources and professional courses.";
  const ogImage = seo.og_image || `${baseDomain}/favicon.svg`;

  let statusCode = 200;
  let title = defaultTitle;
  let description = defaultDesc;
  let canonicalPath = pathname === '/index.html' ? '/' : pathname;
  let robots = 'index, follow';
  let ogType = 'website';
  let breadcrumbs = [{ name: 'Home', url: `${baseDomain}/` }];
  let entitySchema = null;
  let ssrMainHtml = '';

  // Private / noindex routes
  if (
    pathname === '/admin' ||
    pathname === '/admin.html' ||
    pathname === '/student' ||
    pathname === '/student/dashboard' ||
    pathname === '/student-login' ||
    pathname === '/checkout' ||
    pathname === '/payment-success' ||
    pathname === '/payment-failure'
  ) {
    robots = 'noindex, nofollow';
  }

  if (pathname === '/' || pathname === '/index.html') {
    canonicalPath = '/';
    const heroTitle = 'Master AI, Build Digital Skills & Grow Your Online Future.';
    const heroSub =
      "Explore powerful AI tools, learn website development, master SEO and digital marketing, and build practical skills through Web Nasir's free resources and professional courses.";
    title = seo.global_title || 'Web Nasir — Master AI, Build Digital Skills & Grow Your Online Future';
    description = heroSub;
    ssrMainHtml = `
      <section class="py-12 px-4 max-w-6xl mx-auto text-center">
        <p class="text-xs font-bold uppercase tracking-wider text-purple-700">AI • Technology • Digital Skills Academy</p>
        <h1 class="text-4xl font-extrabold text-slate-900 mt-2">${escapeHtml(heroTitle)}</h1>
        <p class="mt-4 text-lg text-slate-600">${escapeHtml(heroSub)}</p>
        <div class="mt-6 flex flex-wrap justify-center gap-4">
          <a href="/tools">Explore Free AI Tools</a>
          <a href="/courses">Explore Paid Courses</a>
          <a href="/about">Watch Introduction</a>
        </div>
      </section>
    `;
  } else if (pathname === '/about') {
    const about = (await getBlob('cms_about')) || {};
    const aboutHeading = about.heading || 'Empowering Your Digital Future with AI, Technology & Practical Skills.';
    title = 'About Us — Empowering Your Digital Future | Web Nasir';
    description =
      about.subtitle ||
      'Web Nasir is a digital learning and technology platform built to make modern digital skills accessible to everyone. We bring together practical AI tools, website development resources, SEO strategies, digital marketing education and professional online courses in one place.';
    breadcrumbs.push({ name: 'About Us', url: `${baseDomain}/about` });
    ssrMainHtml = `<section class="py-12 px-4 max-w-4xl mx-auto"><h1>${escapeHtml(aboutHeading)}</h1><p>${escapeHtml(description)}</p><h2>${escapeHtml(about.founder_heading || 'Meet Nasir — Founder of Web Nasir')}</h2><p>${escapeHtml(about.founder_description || about.biography || '')}</p><div class="mt-6 flex gap-4"><a href="/tools">Explore Our Free Tools</a><a href="/courses">Explore Our Courses</a></div></section>`;
  } else if (pathname === '/contact') {
    const contact = (await getBlob('cms_contact')) || {};
    const contactHeading = contact.heading || "Let's Connect — We're Here to Help.";
    title = 'Contact Us — Get in Touch with Web Nasir | Web Nasir';
    description =
      contact.subtitle ||
      "Have a question about our AI tools, online courses, website development or learning resources? Get in touch with the Web Nasir team. We're here to help you find the right information and support.";
    breadcrumbs.push({ name: 'Contact Us', url: `${baseDomain}/contact` });
    ssrMainHtml = `<section class="py-12 px-4 max-w-4xl mx-auto"><h1>${escapeHtml(contactHeading)}</h1><p>${escapeHtml(description)}</p></section>`;
  } else if (pathname === '/tools') {
    title = 'Free Online Tools — Content, SEO & Website Calculators | Web Nasir';
    description =
      'Use 11+ free online tools to create better content faster, plan SEO articles, estimate website revenue, explain code, and save time.';
    breadcrumbs.push({ name: 'Free Online Tools', url: `${baseDomain}/tools` });
    ssrMainHtml = `<section class="py-12 px-4 max-w-6xl mx-auto"><h1>Free Online Tools That Save You Time</h1><p>${escapeHtml(description)}</p><ul>${tools
      .filter((t) => t.is_enabled !== false)
      .map((t) => `<li><a href="/tools/${escapeHtml(t.seo_slug || TOOL_KEY_TO_SLUG[t.key] || t.key)}">${escapeHtml(t.name)}</a> — ${escapeHtml(t.description)}</li>`)
      .join('')}</ul></section>`;
  } else if (pathname.startsWith('/tools/')) {
    const rawToolSlug = pathname.replace('/tools/', '').trim();
    const mappedKey = TOOL_SLUG_TO_KEY[rawToolSlug] || rawToolSlug;
    const tool = tools.find(
      (t) =>
        t.key === mappedKey ||
        t.id === mappedKey ||
        t.seo_slug === rawToolSlug ||
        TOOL_KEY_TO_SLUG[t.key] === rawToolSlug
    );
    if (tool && tool.is_enabled !== false) {
      const cleanSlug =
        tool.seo_slug && tool.seo_slug !== tool.key
          ? tool.seo_slug
          : TOOL_KEY_TO_SLUG[tool.key] || tool.seo_slug || tool.key;
      canonicalPath = `/tools/${cleanSlug}`;
      title = `${tool.name} — Free Online Tool | Web Nasir`;
      description = tool.description || defaultDesc;
      breadcrumbs.push({ name: 'Free Online Tools', url: `${baseDomain}/tools` });
      breadcrumbs.push({ name: tool.name, url: `${baseDomain}${canonicalPath}` });
      entitySchema = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: tool.name,
        description,
        applicationCategory: 'WebApplication',
        operatingSystem: 'All',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      };
      ssrMainHtml = `<section class="py-12 px-4 max-w-4xl mx-auto"><h1>${escapeHtml(tool.name)}</h1><p>${escapeHtml(description)}</p></section>`;
    } else {
      statusCode = 404;
      robots = 'noindex, nofollow';
      title = 'Tool Not Found (404) | Web Nasir';
      description = 'The requested online tool could not be found.';
      ssrMainHtml = `<section class="py-16 px-4 text-center"><h1>404 — Tool Not Found</h1><p><a href="/tools">Browse all free online tools</a></p></section>`;
    }
  } else if (pathname === '/courses') {
    title = 'Online Courses — Website Development, SEO, AI & Digital Marketing | Web Nasir';
    description =
      'Learn digital skills step by step with practical courses in website development, SEO, blogging, digital marketing, and AI automation.';
    breadcrumbs.push({ name: 'Courses', url: `${baseDomain}/courses` });
    ssrMainHtml = `<section class="py-12 px-4 max-w-6xl mx-auto"><h1>Practical Online Courses to Grow Your Skills</h1><p>${escapeHtml(description)}</p><ul>${courses
      .filter((c) => c.is_published !== false)
      .map((c) => `<li><a href="/courses/${escapeHtml(c.slug || c.id)}">${escapeHtml(c.title)}</a> — ${escapeHtml(c.subtitle || '')}</li>`)
      .join('')}</ul></section>`;
  } else if (pathname === '/free-courses') {
    title = 'Free Online Courses & Starter Guides | Web Nasir';
    description =
      'Start learning for free with beginner-friendly courses on AI prompts, Google AdSense approval, and modern website deployment.';
    breadcrumbs.push({ name: 'Free Courses', url: `${baseDomain}/free-courses` });
    ssrMainHtml = `<section class="py-12 px-4 max-w-6xl mx-auto"><h1>100% Free Starter Courses</h1><p>${escapeHtml(description)}</p></section>`;
  } else if (pathname.startsWith('/courses/')) {
    const courseSlug = pathname.replace('/courses/', '').trim();
    const course =
      courses.find((c) => c.id === courseSlug || c.slug === courseSlug) ||
      freeCourses.find((c) => c.id === courseSlug || c.slug === courseSlug);
    if (course && course.is_published !== false) {
      canonicalPath = `/courses/${course.slug || course.id}`;
      title = `${course.title} — Online Course | Web Nasir`;
      description = course.subtitle || course.description || course.overview || defaultDesc;
      breadcrumbs.push({ name: 'Courses', url: `${baseDomain}/courses` });
      breadcrumbs.push({ name: course.title, url: `${baseDomain}${canonicalPath}` });
      entitySchema = {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: course.title,
        description,
        provider: { '@type': 'Organization', name: 'Web Nasir', sameAs: baseDomain },
        offers: {
          '@type': 'Offer',
          price: String(course.price ?? 0),
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock',
        },
      };
      ssrMainHtml = `<section class="py-12 px-4 max-w-4xl mx-auto"><h1>${escapeHtml(course.title)}</h1><p>${escapeHtml(description)}</p></section>`;
    } else {
      statusCode = 404;
      robots = 'noindex, nofollow';
      title = 'Course Not Found (404) | Web Nasir';
      description = 'The requested course could not be found.';
      ssrMainHtml = `<section class="py-16 px-4 text-center"><h1>404 — Course Not Found</h1><p><a href="/courses">Browse all courses</a></p></section>`;
    }
  } else if (pathname === '/articles' || pathname === '/guides') {
    canonicalPath = '/articles';
    title = 'Guides & Tutorials — SEO, Blogging, Website Building & Online Income | Web Nasir';
    description =
      'Read practical guides and step-by-step tutorials on SEO for beginners, Google AdSense, website development, and growing your online business.';
    breadcrumbs.push({ name: 'Guides & Tutorials', url: `${baseDomain}/articles` });
    ssrMainHtml = `<section class="py-12 px-4 max-w-5xl mx-auto"><h1>Guides & Step-by-Step Tutorials</h1><p>${escapeHtml(description)}</p><ul>${articles
      .filter((a) => a.is_published !== false)
      .map((a) => `<li><a href="/articles/${escapeHtml(a.slug)}">${escapeHtml(a.title)}</a> — ${escapeHtml(a.meta || '')}</li>`)
      .join('')}</ul></section>`;
  } else if (pathname.startsWith('/articles/') || pathname.startsWith('/guides/')) {
    const rawSlug = pathname.replace(/^\/(articles|guides)\//, '').trim();
    const aliasMap = {
      'adsense-high-rpm-guide': 'google-adsense-high-rpm',
    };
    const slug = aliasMap[rawSlug] || rawSlug;
    const fallbackArticles = {
      'seo-for-beginners': {
        slug: 'seo-for-beginners',
        tag: 'blogging',
        title: 'SEO for Beginners: Complete Step-by-Step Guide to Ranking Websites in 2025',
        meta: 'Learn how search engines work, how to find low-competition keywords, structure helpful articles, and grow organic traffic from scratch.',
        is_published: true,
      },
    };
    const article =
      (await getBlob(`article:${slug}`)) ||
      (await getBlob(`article:${rawSlug}`)) ||
      articles.find((a) => a.slug === slug || a.slug === rawSlug) ||
      fallbackArticles[rawSlug];
    if (article && article.is_published !== false) {
      canonicalPath = `/articles/${article.slug}`;
      ogType = 'article';
      title = `${article.seo_title || article.title} | Web Nasir Guides`;
      description = article.seo_description || article.meta || article.summary || defaultDesc;
      breadcrumbs.push({ name: 'Guides & Tutorials', url: `${baseDomain}/articles` });
      breadcrumbs.push({ name: article.title, url: `${baseDomain}${canonicalPath}` });
      entitySchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description,
        author: { '@type': 'Person', name: article.author || 'Nasir' },
        publisher: { '@type': 'Organization', name: 'Web Nasir' },
        mainEntityOfPage: `${baseDomain}${canonicalPath}`,
      };
      ssrMainHtml = `<article class="py-12 px-4 max-w-4xl mx-auto"><h1>${escapeHtml(article.title)}</h1><p>${escapeHtml(description)}</p></article>`;
    } else {
      statusCode = 404;
      robots = 'noindex, nofollow';
      title = 'Article Not Found (404) | Web Nasir';
      description = 'The requested guide or tutorial could not be found.';
      ssrMainHtml = `<section class="py-16 px-4 text-center"><h1>404 — Article Not Found</h1><p><a href="/articles">Browse all guides</a></p></section>`;
    }
  } else if (pathname === '/topics') {
    title = 'Choose What You Want to Learn — Topics & Skills | Web Nasir';
    description =
      'Explore learning topics across website development, SEO & blogging, digital marketing, AI tools, and online business.';
    breadcrumbs.push({ name: 'Topics', url: `${baseDomain}/topics` });
    ssrMainHtml = `<section class="py-12 px-4 max-w-5xl mx-auto"><h1>Choose What You Want to Learn</h1><p>${escapeHtml(description)}</p></section>`;
  } else if (pathname === '/learning-pathways' || pathname === '/tracks') {
    canonicalPath = '/learning-pathways';
    title = 'Learning Pathways — Step-by-Step Digital Skill Roadmaps | Web Nasir';
    description =
      'Follow clear, step-by-step learning pathways to master website development, SEO, content publishing, and online business.';
    breadcrumbs.push({ name: 'Learning Pathways', url: `${baseDomain}/learning-pathways` });
    ssrMainHtml = `<section class="py-12 px-4 max-w-5xl mx-auto"><h1>Structured Learning Pathways</h1><p>${escapeHtml(description)}</p></section>`;
  } else if (pathname === '/student/dashboard' || pathname === '/student') {
    canonicalPath = '/student/dashboard';
    robots = 'noindex, nofollow';
    title = 'Student Dashboard — My Courses & Saved Tools | Web Nasir';
    description = 'Access your enrolled courses, lesson progress, and saved tool outputs at Web Nasir.';
    ssrMainHtml = `<section class="py-12 px-4 max-w-4xl mx-auto"><h1>Student Learning Dashboard</h1><p>${escapeHtml(description)}</p></section>`;
  } else if (pathname === '/privacy' || pathname === '/privacy-policy') {
    canonicalPath = '/privacy';
    title = 'Privacy Policy | Web Nasir';
    description = 'Read how Web Nasir protects your privacy, account information, and student data.';
    breadcrumbs.push({ name: 'Privacy Policy', url: `${baseDomain}/privacy` });
    ssrMainHtml = `<section class="py-12 px-4 max-w-4xl mx-auto"><h1>Privacy Policy</h1><p>${escapeHtml(description)}</p></section>`;
  } else if (pathname === '/terms' || pathname === '/terms-and-conditions') {
    canonicalPath = '/terms';
    title = 'Terms & Conditions | Web Nasir';
    description = 'Terms and conditions for using Web Nasir online tools, courses, and educational resources.';
    breadcrumbs.push({ name: 'Terms & Conditions', url: `${baseDomain}/terms` });
    ssrMainHtml = `<section class="py-12 px-4 max-w-4xl mx-auto"><h1>Terms & Conditions</h1><p>${escapeHtml(description)}</p></section>`;
  } else if (pathname === '/refund-policy') {
    title = 'Refund & Cancellation Policy | Web Nasir';
    description = 'Transparent course enrollment, cancellation, and refund policy for Web Nasir students.';
    breadcrumbs.push({ name: 'Refund Policy', url: `${baseDomain}/refund-policy` });
    ssrMainHtml = `<section class="py-12 px-4 max-w-4xl mx-auto"><h1>Refund & Cancellation Policy</h1><p>${escapeHtml(description)}</p></section>`;
  } else if (pathname === '/disclaimer') {
    title = 'Educational & Earnings Disclaimer | Web Nasir';
    description = 'Educational and earnings disclaimer for Web Nasir courses, guides, and calculators.';
    breadcrumbs.push({ name: 'Disclaimer', url: `${baseDomain}/disclaimer` });
    ssrMainHtml = `<section class="py-12 px-4 max-w-4xl mx-auto"><h1>Disclaimer</h1><p>${escapeHtml(description)}</p></section>`;
  } else if (pathname === '/faq') {
    title = 'Frequently Asked Questions | Web Nasir';
    description = 'Answers to common questions about Web Nasir free online tools, courses, payments, and support.';
    breadcrumbs.push({ name: 'FAQ', url: `${baseDomain}/faq` });
    ssrMainHtml = `<section class="py-12 px-4 max-w-4xl mx-auto"><h1>Frequently Asked Questions</h1><p>${escapeHtml(description)}</p></section>`;
  } else if (pathname === '/search') {
    robots = 'noindex, follow';
    title = 'Search Tools, Courses & Guides | Web Nasir';
    description = 'Search across all free online tools, courses, and tutorials on Web Nasir.';
    ssrMainHtml = `<section class="py-12 px-4 max-w-4xl mx-auto"><h1>Search Web Nasir</h1></section>`;
  } else {
    // Check CMS pages
    const customPage = pages.find(
      (p) =>
        p.slug === pathname ||
        p.slug === `#${pathname}` ||
        p.slug?.replace(/^#/, '') === pathname
    );
    if (customPage && customPage.status !== 'draft') {
      canonicalPath = customPage.slug.replace(/^#/, '');
      title = customPage.seo_title || `${customPage.title} | Web Nasir`;
      description = customPage.seo_description || customPage.subtitle || defaultDesc;
      breadcrumbs.push({ name: customPage.title, url: `${baseDomain}${canonicalPath}` });
      ssrMainHtml = `<section class="py-12 px-4 max-w-4xl mx-auto"><h1>${escapeHtml(customPage.heading || customPage.title)}</h1><p>${escapeHtml(description)}</p></section>`;
    } else {
      statusCode = 404;
      robots = 'noindex, nofollow';
      title = 'Page Not Found (404) | Web Nasir';
      description = 'The page you are looking for does not exist or has been moved.';
      ssrMainHtml = `<section class="py-16 px-4 text-center"><h1>404 — Page Not Found</h1><p>${escapeHtml(description)}</p><p><a href="/">Return to Homepage</a></p></section>`;
    }
  }

  const canonicalUrl = `${baseDomain}${canonicalPath === '/' ? '/' : canonicalPath}`;

  const jsonLdGraph = [
    {
      '@context': 'https://schema.org',
      '@type': seo.schema_type || 'EducationalOrganization',
      name: siteName,
      url: baseDomain,
      description: defaultDesc,
      founder: { '@type': 'Person', name: 'Nasir' },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: `+${(settings.whatsapp_number || '917006334417').replace(/[^0-9]/g, '')}`,
        email: settings.email || 'support@webnasir.com',
        contactType: 'customer support',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteName,
      url: baseDomain,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${baseDomain}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((b, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: b.name,
        item: b.url,
      })),
    },
  ];

  if (entitySchema) {
    jsonLdGraph.push(entitySchema);
  }

  return {
    statusCode,
    title,
    description,
    canonicalUrl,
    robots,
    ogType,
    ogImage,
    jsonLd: JSON.stringify(jsonLdGraph),
    ssrMainHtml,
  };
}

/**
 * Injects resolved route SEO metadata and initial semantic HTML into index.html template string.
 */
export function injectSeoIntoHtml(rawHtml, seoData) {
  if (!rawHtml || !seoData) return rawHtml;
  let html = rawHtml;

  const safeTitle = escapeHtml(seoData.title);
  const safeDesc = escapeHtml(seoData.description);
  const safeCanonical = escapeHtml(seoData.canonicalUrl);
  const safeRobots = escapeHtml(seoData.robots);
  const safeOgType = escapeHtml(seoData.ogType || 'website');
  const safeOgImage = escapeHtml(seoData.ogImage);

  html = html.replace(/<title[^>]*>[\s\S]*?<\/title>/i, `<title id="dynamic-title">${safeTitle}</title>`);
  html = html.replace(
    /<meta[^>]*name="description"[^>]*>/i,
    `<meta id="dynamic-description" name="description" content="${safeDesc}">`
  );
  html = html.replace(
    /<meta[^>]*name="robots"[^>]*>/i,
    `<meta id="dynamic-robots" name="robots" content="${safeRobots}">`
  );
  html = html.replace(
    /<link[^>]*rel="canonical"[^>]*>/i,
    `<link id="dynamic-canonical" rel="canonical" href="${safeCanonical}">`
  );
  html = html.replace(
    /<meta[^>]*property="og:title"[^>]*>/i,
    `<meta id="dynamic-og-title" property="og:title" content="${safeTitle}">`
  );
  html = html.replace(
    /<meta[^>]*property="og:description"[^>]*>/i,
    `<meta id="dynamic-og-desc" property="og:description" content="${safeDesc}">`
  );
  html = html.replace(
    /<meta[^>]*property="og:type"[^>]*>/i,
    `<meta id="dynamic-og-type" property="og:type" content="${safeOgType}">`
  );
  html = html.replace(
    /<meta[^>]*property="og:url"[^>]*>/i,
    `<meta id="dynamic-og-url" property="og:url" content="${safeCanonical}">`
  );
  html = html.replace(
    /<meta[^>]*property="og:image"[^>]*>/i,
    `<meta id="dynamic-og-image" property="og:image" content="${safeOgImage}">`
  );
  html = html.replace(
    /<meta[^>]*name="twitter:title"[^>]*>/i,
    `<meta id="dynamic-twitter-title" name="twitter:title" content="${safeTitle}">`
  );
  html = html.replace(
    /<meta[^>]*name="twitter:description"[^>]*>/i,
    `<meta id="dynamic-twitter-desc" name="twitter:description" content="${safeDesc}">`
  );
  html = html.replace(
    /<script[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/i,
    `<script id="dynamic-schema" type="application/ld+json">${seoData.jsonLd}</script>`
  );

  if (seoData.ssrMainHtml) {
    html = html.replace(
      /<main id="app-view"[^>]*>[\s\S]*?<\/main>/i,
      `<main id="app-view" class="flex-grow">${seoData.ssrMainHtml}</main>`
    );
  }

  return html;
}

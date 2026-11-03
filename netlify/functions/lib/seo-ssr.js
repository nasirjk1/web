import { getBlob } from './store.js';
import { ensureSeeded } from './seed.js';
import { VERIFIED_YOUTUBE_RESOURCES } from './learning-hub-data.js';
import { EDUCATIONAL_ARTICLES_LIBRARY } from './articles-data.js';

export const LEARNING_SLUG_ALIASES = {
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

export const ARTICLE_SLUG_ALIASES = {
  'adsense-high-rpm-guide': 'adsense-approval-and-website-monetization-guide',
  'google-adsense-high-rpm': 'adsense-approval-and-website-monetization-guide',
  'google-adsense-approval-monetization-guide': 'adsense-approval-and-website-monetization-guide',
  'ai-tools-productivity-guide': 'how-to-use-ai-tools-for-productivity',
  'prompt-engineering-beginners-guide': 'complete-guide-to-prompt-engineering',
  'how-to-build-a-website-from-scratch': 'modern-website-development-roadmap',
  'html-css-javascript-learning-roadmap': 'html-css-javascript-foundations-guide',
  'seo-checklist-for-new-websites': 'complete-seo-and-google-search-guide',
};

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

  const [settings, seo, tools, learningResources, articles, topics, pages] = await Promise.all([
    getBlob('settings').then((r) => r || {}),
    getBlob('cms_seo').then((r) => r || {}),
    getBlob('tools_index').then((r) => r || []),
    getBlob('learning_resources_index').then((r) => r || []),
    getBlob('articles_index').then((r) => r || []),
    getBlob('topics_index').then((r) => r || []),
    getBlob('cms_pages').then((r) => r || []),
  ]);

  const baseDomain = (seo.canonical_base || seo.canonical_url || 'https://webnasir.dpdns.org').replace(/\/+$/, '');
  const siteName = settings.site_name || 'Web Nasir';
  const defaultTitle = seo.global_title || 'Web Nasir — Your Free Hub for AI Tools, Technology & Digital Skills';
  const defaultDesc =
    seo.meta_description ||
    'Discover powerful free AI tools, learn from real educational YouTube courses, explore practical guides and build skills for your digital future.';
  let ogImage = seo.og_image || `${baseDomain}/favicon.svg`;

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
    pathname === '/student-login'
  ) {
    robots = 'noindex, nofollow';
  }

  if (pathname === '/' || pathname === '/index.html') {
    canonicalPath = '/';
    const heroTitle = 'Your Free Hub for AI Tools, Technology & Digital Skills.';
    const heroSub =
      'Discover powerful free AI tools, learn from real educational YouTube courses, explore practical guides and build skills for your digital future.';
    title = seo.global_title || 'Web Nasir — Your Free Hub for AI Tools, Technology & Digital Skills';
    description = heroSub;
    ssrMainHtml = `
      <section class="py-12 px-4 max-w-6xl mx-auto text-center">
        <p class="text-xs font-bold uppercase tracking-wider text-purple-700">100% Free AI Tools • Free YouTube Learning • Practical Guides</p>
        <h1 class="text-4xl font-extrabold text-slate-900 mt-2">${escapeHtml(heroTitle)}</h1>
        <p class="mt-4 text-lg text-slate-600">${escapeHtml(heroSub)}</p>
        <div class="mt-6 flex flex-wrap justify-center gap-4">
          <a href="/tools">Explore Free AI Tools</a>
          <a href="/learn">Start Learning Free</a>
          <a href="/articles">Read Practical Guides</a>
        </div>
      </section>
    `;
  } else if (pathname === '/about') {
    const about = (await getBlob('cms_about')) || {};
    const aboutHeading = about.heading || 'Empowering Your Digital Future with Free AI Tools & Open Learning.';
    title = 'About Us — Free AI Tools & Digital Learning Hub | Web Nasir';
    description =
      about.subtitle ||
      'Web Nasir is a 100% free digital learning and technology platform built to make modern AI tools, verified YouTube courses, and practical educational articles accessible to everyone.';
    breadcrumbs.push({ name: 'About Us', url: `${baseDomain}/about` });
    ssrMainHtml = `<section class="py-12 px-4 max-w-4xl mx-auto"><h1>${escapeHtml(aboutHeading)}</h1><p>${escapeHtml(description)}</p><h2>${escapeHtml(about.founder_heading || 'Meet Nasir — Founder of Web Nasir')}</h2><p>${escapeHtml(about.founder_description || about.biography || '')}</p><div class="mt-6 flex gap-4"><a href="/tools">Explore Free AI Tools</a><a href="/learn">Explore Free Learning Hub</a></div></section>`;
  } else if (pathname === '/contact') {
    const contact = (await getBlob('cms_contact')) || {};
    const contactHeading = contact.heading || "Let's Connect — We're Here to Help.";
    title = 'Contact Us — Get in Touch with Web Nasir | Web Nasir';
    description =
      contact.subtitle ||
      "Have a question about our free AI tools, YouTube learning hub, website development tutorials or educational guides? Get in touch with the Web Nasir team.";
    breadcrumbs.push({ name: 'Contact Us', url: `${baseDomain}/contact` });
    ssrMainHtml = `<section class="py-12 px-4 max-w-4xl mx-auto"><h1>${escapeHtml(contactHeading)}</h1><p>${escapeHtml(description)}</p></section>`;
  } else if (pathname === '/tools') {
    title = 'Free AI Tools — Writing, SEO, Coding, YouTube & Productivity | Web Nasir';
    description =
      'Use 11+ free AI tools to generate YouTube titles, plan SEO blog outlines, explain code and regex, write ad copy, and calculate website revenue.';
    breadcrumbs.push({ name: 'Free AI Tools', url: `${baseDomain}/tools` });
    ssrMainHtml = `<section class="py-12 px-4 max-w-6xl mx-auto"><h1>Free AI Tools & Utilities</h1><p>${escapeHtml(description)}</p><ul>${tools
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
      title = `${tool.name} — Free AI Tool | Web Nasir`;
      description = tool.description || defaultDesc;
      breadcrumbs.push({ name: 'Free AI Tools', url: `${baseDomain}/tools` });
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
      ssrMainHtml = `<section class="py-16 px-4 text-center"><h1>404 — Tool Not Found</h1><p><a href="/tools">Browse all free AI tools</a></p></section>`;
    }
  } else if (pathname === '/learn' || pathname === '/courses' || pathname === '/free-courses') {
    canonicalPath = '/learn';
    title = 'Free Learning Hub — Watch Real YouTube Courses & Build Digital Skills | Web Nasir';
    description =
      'Explore carefully selected free YouTube courses, programming tutorials, AI lessons, SEO training, digital marketing education and practical guides from trusted educators.';
    breadcrumbs.push({ name: 'Free Learning Hub', url: `${baseDomain}/learn` });
    entitySchema = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Web Nasir Free Learning Hub',
      description,
      url: `${baseDomain}/learn`,
    };
    ssrMainHtml = `<section class="py-12 px-4 max-w-6xl mx-auto"><h1>Free Learning Hub — Learn New Skills. Watch Real Courses. Build Your Digital Future — Completely Free.</h1><p>${escapeHtml(description)}</p><ul>${learningResources
      .filter((r) => r.is_published !== false && r.status !== 'draft')
      .map((r) => `<li><a href="/learn/${escapeHtml(r.slug || r.id)}">${escapeHtml(r.title)}</a> by ${escapeHtml(r.channel_name)} (${escapeHtml(r.category)})</li>`)
      .join('')}</ul></section>`;
  } else if (pathname.startsWith('/learn/') || pathname.startsWith('/courses/')) {
    const rawResourceSlug = pathname.replace(/^\/(learn|courses)\//, '').trim();
    const resourceSlug = LEARNING_SLUG_ALIASES[rawResourceSlug] || rawResourceSlug;
    const resource =
      (await getBlob(`learning_resource:${resourceSlug}`)) ||
      (await getBlob(`learning_resource:${rawResourceSlug}`)) ||
      learningResources.find((r) => r.slug === resourceSlug || r.slug === rawResourceSlug || r.id === resourceSlug || r.id === rawResourceSlug) ||
      VERIFIED_YOUTUBE_RESOURCES.find((r) => r.slug === resourceSlug || r.slug === rawResourceSlug || r.id === resourceSlug || r.id === rawResourceSlug);
    if (resource && resource.is_published !== false && resource.status !== 'draft') {
      canonicalPath = `/learn/${rawResourceSlug}`;
      title = resource.seo_title || `${resource.title} — Free YouTube Course by ${resource.channel_name} | Web Nasir`;
      description = resource.meta_description || resource.short_description || resource.full_description || defaultDesc;
      if (resource.thumbnail_url) ogImage = resource.thumbnail_url;
      breadcrumbs.push({ name: 'Free Learning Hub', url: `${baseDomain}/learn` });
      breadcrumbs.push({ name: resource.title, url: `${baseDomain}${canonicalPath}` });
      entitySchema = {
        '@context': 'https://schema.org',
        '@type': ['LearningResource', 'VideoObject'],
        name: resource.title,
        description,
        learningResourceType: resource.resource_type || 'Video Course',
        educationalLevel: resource.difficulty || 'Beginner',
        inLanguage: resource.language || 'English',
        isAccessibleForFree: true,
        thumbnailUrl: resource.thumbnail_url || `https://i.ytimg.com/vi/${resource.video_id}/hqdefault.jpg`,
        embedUrl: `https://www.youtube-nocookie.com/embed/${resource.video_id}`,
        contentUrl: resource.youtube_url || `https://www.youtube.com/watch?v=${resource.video_id}`,
        uploadDate: resource.verified_at || '2025-01-01T00:00:00Z',
        creator: {
          '@type': 'Organization',
          name: resource.channel_name,
          url: resource.channel_url || 'https://www.youtube.com',
        },
        provider: {
          '@type': 'Organization',
          name: resource.channel_name,
          sameAs: resource.channel_url || 'https://www.youtube.com',
        },
      };
      ssrMainHtml = `<article class="py-12 px-4 max-w-4xl mx-auto"><h1>${escapeHtml(resource.title)}</h1><p>Original Creator: <strong>${escapeHtml(resource.channel_name)}</strong> | Category: ${escapeHtml(resource.category)} | Level: ${escapeHtml(resource.difficulty)}</p><p>${escapeHtml(resource.full_description || description)}</p><p><a href="${escapeHtml(resource.youtube_url)}" target="_blank" rel="noopener noreferrer">Watch Free on YouTube</a></p></article>`;
    } else {
      statusCode = 404;
      robots = 'noindex, nofollow';
      title = 'Learning Resource Not Found (404) | Web Nasir';
      description = 'The requested free learning resource could not be found.';
      ssrMainHtml = `<section class="py-16 px-4 text-center"><h1>404 — Learning Resource Not Found</h1><p><a href="/learn">Browse the Free Learning Hub</a></p></section>`;
    }
  } else if (pathname === '/articles' || pathname === '/guides') {
    canonicalPath = '/articles';
    title = 'Educational Articles & Practical Guides — AI, Web Dev, SEO & Python | Web Nasir';
    description =
      'Read in-depth, original educational articles and step-by-step tutorials on AI tools, prompt engineering, HTML/CSS/JS, Python, WordPress, SEO, and website monetization.';
    breadcrumbs.push({ name: 'Guides & Articles', url: `${baseDomain}/articles` });
    ssrMainHtml = `<section class="py-12 px-4 max-w-5xl mx-auto"><h1>Educational Articles & Step-by-Step Practical Guides</h1><p>${escapeHtml(description)}</p><ul>${articles
      .filter((a) => a.is_published !== false)
      .map((a) => `<li><a href="/articles/${escapeHtml(a.slug)}">${escapeHtml(a.title)}</a> — ${escapeHtml(a.excerpt || a.meta || '')}</li>`)
      .join('')}</ul></section>`;
  } else if (pathname.startsWith('/articles/') || pathname.startsWith('/guides/')) {
    const rawSlug = pathname.replace(/^\/(articles|guides)\//, '').trim();
    const slug = ARTICLE_SLUG_ALIASES[rawSlug] || rawSlug;
    const article =
      (await getBlob(`article:${slug}`)) ||
      (await getBlob(`article:${rawSlug}`)) ||
      articles.find((a) => a.slug === slug || a.slug === rawSlug) ||
      EDUCATIONAL_ARTICLES_LIBRARY.find((a) => a.slug === slug || a.slug === rawSlug);
    if (article && article.is_published !== false) {
      canonicalPath = `/articles/${rawSlug}`;
      ogType = 'article';
      title = `${article.seo_title || article.title} | Web Nasir Guides`;
      description = article.meta_description || article.seo_description || article.excerpt || article.meta || defaultDesc;
      if (article.featured_image || article.image) ogImage = article.featured_image || article.image;
      breadcrumbs.push({ name: 'Guides & Articles', url: `${baseDomain}/articles` });
      breadcrumbs.push({ name: article.title, url: `${baseDomain}${canonicalPath}` });
      entitySchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description,
        image: ogImage,
        datePublished: article.created_at || article.updated_at || '2025-02-01T00:00:00Z',
        dateModified: article.updated_at || '2025-02-15T00:00:00Z',
        author: { '@type': 'Person', name: article.author || 'Nasir' },
        publisher: { '@type': 'Organization', name: 'Web Nasir', url: baseDomain },
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

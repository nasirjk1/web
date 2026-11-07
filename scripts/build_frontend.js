import fs from 'fs';
import path from 'path';

// Complete Web Nasir Academy Redesign based on https://academy.webotapp.com/
// Preserving all 11 existing tools, Gemini AI integration, Firebase Auth, and Store APIs

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Web Nasir Academy — AI, Web Engineering & Digital Monetization</title>
  <meta name="description" content="Master practical AI tools, full-stack website development, technical SEO, and Google AdSense & Facebook monetization with 10-year veteran Nasir. 11+ Free AI Utilities & Professional Masterclasses.">
  <meta property="og:title" content="Web Nasir Academy — AI, Web Engineering & Digital Monetization">
  <meta property="og:description" content="Learn practical AI, web development, SEO, and battle-tested monetization strategies with Nasir. Access 11+ free tools and project-driven courses.">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary_large_image">
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@500;600;700;800;900&display=swap" rel="stylesheet">
  
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            brand: {
              50: '#f5f3ff',
              100: '#ede9fe',
              200: '#ddd6fe',
              300: '#c4b5fd',
              400: '#a78bfa',
              500: '#8b5cf6',
              600: '#7c3aed',
              700: '#6d28d9',
              800: '#5b21b6',
              900: '#4c1d95',
            },
            dark: '#0f172a',
            navy: '#0b1120',
            muted: '#64748b',
            surface: '#f8fafc',
            bordercol: '#e2e8f0',
          },
          fontFamily: {
            heading: ['Poppins', 'sans-serif'],
            body: ['Inter', 'sans-serif'],
          }
        }
      }
    }
  </script>
  
  <!-- Lucide Icons -->
  <script src="https://unpkg.com/lucide@latest"></script>

  <style>
    body {
      font-family: 'Inter', sans-serif;
      color: #0f172a;
      background-color: #ffffff;
      scroll-behavior: smooth;
    }
    h1, h2, h3, h4, h5, h6, .font-heading {
      font-family: 'Poppins', sans-serif;
    }
    .gradient-hero-btn {
      background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
      box-shadow: 0 4px 14px 0 rgba(124, 58, 237, 0.35);
      transition: all 0.2s ease;
    }
    .gradient-hero-btn:hover {
      box-shadow: 0 6px 20px 0 rgba(124, 58, 237, 0.5);
      transform: translateY(-1px);
    }
    .gradient-border-card {
      position: relative;
      background: #ffffff;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .gradient-border-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 35px -10px rgba(124, 58, 237, 0.12), 0 4px 12px -2px rgba(15, 23, 42, 0.04);
      border-color: #c4b5fd;
    }
    /* Infinite Marquee */
    @keyframes marquee {
      0% { transform: translateX(0%); }
      100% { transform: translateX(-50%); }
    }
    .animate-marquee {
      display: flex;
      width: max-content;
      animation: marquee 32s linear infinite;
    }
    .animate-marquee:hover {
      animation-play-state: paused;
    }
    /* Dropdown Hover Physics */
    .dropdown-container {
      position: relative;
    }
    .dropdown-menu {
      visibility: hidden;
      opacity: 0;
      transform: translateY(8px);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      pointer-events: none;
    }
    .dropdown-container:hover .dropdown-menu {
      visibility: visible;
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }
    /* Markdown Article Styler */
    .article-content h1 { font-size: 2rem; font-weight: 700; margin-top: 2rem; margin-bottom: 1rem; color: #0f172a; }
    .article-content h2 { font-size: 1.5rem; font-weight: 700; margin-top: 1.75rem; margin-bottom: 0.75rem; color: #0f172a; border-bottom: 2px solid #f1f5f9; padding-bottom: 0.5rem; }
    .article-content h3 { font-size: 1.25rem; font-weight: 600; margin-top: 1.25rem; margin-bottom: 0.5rem; color: #1e293b; }
    .article-content p { margin-bottom: 1.15rem; line-height: 1.75; color: #334155; font-size: 1.05rem; }
    .article-content ul { list-style-type: disc; margin-left: 1.5rem; margin-bottom: 1.25rem; color: #334155; }
    .article-content li { margin-bottom: 0.5rem; line-height: 1.6; }
    .article-content pre { background: #0f172a; color: #f8fafc; padding: 1.25rem; border-radius: 0.75rem; overflow-x: auto; margin-bottom: 1.5rem; font-family: monospace; font-size: 0.9rem; }
    .article-content code { background: #f1f5f9; color: #7c3aed; padding: 0.2rem 0.4rem; border-radius: 0.25rem; font-family: monospace; font-size: 0.9em; }
    .article-content pre code { background: transparent; color: inherit; padding: 0; }
    
    @keyframes pulse-ring {
      0% { transform: scale(0.95); opacity: 0.8; }
      50% { transform: scale(1.15); opacity: 0; }
      100% { transform: scale(0.95); opacity: 0; }
    }
    .pulse-ring {
      animation: pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite;
    }
  </style>
</head>
<body class="min-h-screen flex flex-col bg-white text-dark antialiased selection:bg-brand-100 selection:text-brand-900">

  <!-- TOP ANNOUNCEMENT BAR (Admin Manageable) -->
  <div id="top-announcement-bar" class="bg-navy text-white text-xs py-2 px-4 text-center font-medium border-b border-slate-800 transition-all">
    <div class="max-w-7xl mx-auto flex items-center justify-center gap-2">
      <span class="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
      <span id="announcement-badge" class="font-semibold text-brand-300">New 2025 Edition:</span>
      <span id="announcement-text">Web Nasir Academy is Live: Free AI Utilities, Professional Paid Courses & High-RPM Blueprints!</span>
      <a id="announcement-link" href="#/courses" class="underline text-brand-300 hover:text-white font-semibold ml-1">Explore Courses &rarr;</a>
    </div>
  </div>

  <!-- MOVING TICKER MARQUEE (Reference Style) -->
  <div class="bg-brand-50/70 border-b border-brand-100/60 overflow-hidden py-2 text-xs font-semibold text-brand-900 select-none">
    <div class="animate-marquee flex items-center gap-8" id="marquee-track">
      <!-- Injected dynamically from APP_STATE.marquee -->
    </div>
  </div>

  <!-- ACADEMY HEADER & MEGA NAVIGATION -->
  <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
      
      <!-- Brand Logo -->
      <a href="#/" class="flex items-center gap-3 group">
        <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-700 via-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/25 group-hover:scale-105 transition-transform">
          <i data-lucide="sparkles" class="w-6 h-6"></i>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <span class="text-xl font-bold font-heading tracking-tight text-slate-900" id="nav-brand-name">Web Nasir</span>
            <span class="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-brand-100 text-brand-700 border border-brand-200/60">Academy</span>
          </div>
          <span class="text-[11px] text-muted block -mt-0.5 font-medium" id="nav-tagline">AI, Web & Monetization</span>
        </div>
      </a>

      <!-- Desktop Mega-Menu Navigation -->
      <nav class="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-700">
        
        <!-- HOME -->
        <a href="#/" class="nav-link py-2 hover:text-brand-600 transition-colors">HOME</a>

        <!-- FREE AI TOOLS (DROPDOWN) -->
        <div class="dropdown-container py-2">
          <button class="nav-link flex items-center gap-1 hover:text-brand-600 transition-colors cursor-pointer uppercase tracking-wider">
            <span>Free AI Tools</span>
            <i data-lucide="chevron-down" class="w-3.5 h-3.5 opacity-60"></i>
          </button>
          <div class="dropdown-menu absolute top-full left-0 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-4 z-50">
            <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100 mb-2">11+ Free Production Utilities</div>
            <div class="space-y-1">
              <a href="#/tools" class="flex items-center gap-3 p-2 rounded-xl hover:bg-brand-50/70 group transition-all">
                <div class="w-8 h-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center shrink-0"><i data-lucide="grid" class="w-4 h-4"></i></div>
                <div><div class="font-bold text-slate-800 text-xs group-hover:text-brand-700">All 11 AI Tools</div><div class="text-[10px] text-slate-500 font-normal">Browse complete utility suite</div></div>
              </a>
              <a href="#/tools?cat=AI%20Creators" class="flex items-center gap-3 p-2 rounded-xl hover:bg-brand-50/70 group transition-all">
                <div class="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center shrink-0"><i data-lucide="video" class="w-4 h-4"></i></div>
                <div><div class="font-bold text-slate-800 text-xs group-hover:text-brand-700">AI Creators</div><div class="text-[10px] text-slate-500 font-normal">YouTube hook, code & name tools</div></div>
              </a>
              <a href="#/tools?cat=SEO%20%26%20Content" class="flex items-center gap-3 p-2 rounded-xl hover:bg-brand-50/70 group transition-all">
                <div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0"><i data-lucide="file-text" class="w-4 h-4"></i></div>
                <div><div class="font-bold text-slate-800 text-xs group-hover:text-brand-700">SEO & Content</div><div class="text-[10px] text-slate-500 font-normal">Blog outlines, hashtags, word count</div></div>
              </a>
              <a href="#/tools?cat=Monetization" class="flex items-center gap-3 p-2 rounded-xl hover:bg-brand-50/70 group transition-all">
                <div class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0"><i data-lucide="dollar-sign" class="w-4 h-4"></i></div>
                <div><div class="font-bold text-slate-800 text-xs group-hover:text-brand-700">Monetization</div><div class="text-[10px] text-slate-500 font-normal">Ad copy, RPM & arbitrage calcs</div></div>
              </a>
              <a href="#/tools?cat=Calculators" class="flex items-center gap-3 p-2 rounded-xl hover:bg-brand-50/70 group transition-all">
                <div class="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0"><i data-lucide="calculator" class="w-4 h-4"></i></div>
                <div><div class="font-bold text-slate-800 text-xs group-hover:text-brand-700">Calculators & Security</div><div class="text-[10px] text-slate-500 font-normal">Password generator & age tracker</div></div>
              </a>
            </div>
          </div>
        </div>

        <!-- PAID COURSES (DROPDOWN) -->
        <div class="dropdown-container py-2">
          <button class="nav-link flex items-center gap-1 hover:text-brand-600 transition-colors cursor-pointer uppercase tracking-wider text-brand-700 font-bold">
            <span>Paid Courses</span>
            <i data-lucide="chevron-down" class="w-3.5 h-3.5 opacity-60"></i>
          </button>
          <div class="dropdown-menu absolute top-full left-0 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-4 z-50">
            <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100 mb-2">Professional Training Masterclasses</div>
            <div class="space-y-1">
              <a href="#/courses" class="flex items-center gap-3 p-2 rounded-xl hover:bg-brand-50/70 group transition-all">
                <div class="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center shrink-0"><i data-lucide="graduation-cap" class="w-4 h-4"></i></div>
                <div><div class="font-bold text-slate-800 text-xs group-hover:text-brand-700">All 8 Academy Programs</div><div class="text-[10px] text-slate-500 font-normal">View complete curriculum & enroll</div></div>
              </a>
              <a href="#/courses?cat=AI%20%26%20Automation" class="flex items-center gap-3 p-2 rounded-xl hover:bg-brand-50/70 group transition-all">
                <div class="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0"><i data-lucide="cpu" class="w-4 h-4"></i></div>
                <div><div class="font-bold text-slate-800 text-xs group-hover:text-brand-700">Complete AI Mastery</div><div class="text-[10px] text-slate-500 font-normal">Build & monetize micro-SaaS with Gemini</div></div>
              </a>
              <a href="#/courses?cat=Website%20Development" class="flex items-center gap-3 p-2 rounded-xl hover:bg-brand-50/70 group transition-all">
                <div class="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0"><i data-lucide="code" class="w-4 h-4"></i></div>
                <div><div class="font-bold text-slate-800 text-xs group-hover:text-brand-700">Full-Stack Web Development</div><div class="text-[10px] text-slate-500 font-normal">React 19, TypeScript, Node & serverless</div></div>
              </a>
              <a href="#/courses?cat=SEO%20Mastery" class="flex items-center gap-3 p-2 rounded-xl hover:bg-brand-50/70 group transition-all">
                <div class="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0"><i data-lucide="trending-up" class="w-4 h-4"></i></div>
                <div><div class="font-bold text-slate-800 text-xs group-hover:text-brand-700">Professional SEO Mastery</div><div class="text-[10px] text-slate-500 font-normal">Topical clusters, schema & Core Web Vitals</div></div>
              </a>
              <a href="#/courses?cat=Monetization" class="flex items-center gap-3 p-2 rounded-xl hover:bg-brand-50/70 group transition-all">
                <div class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0"><i data-lucide="badge-dollar-sign" class="w-4 h-4"></i></div>
                <div><div class="font-bold text-slate-800 text-xs group-hover:text-brand-700">High-RPM Google AdSense</div><div class="text-[10px] text-slate-500 font-normal">From $2 to $35+ RPM layout physics</div></div>
              </a>
            </div>
          </div>
        </div>

        <!-- CAREER TRACKS (DROPDOWN) -->
        <div class="dropdown-container py-2">
          <button class="nav-link flex items-center gap-1 hover:text-brand-600 transition-colors cursor-pointer uppercase tracking-wider">
            <span>Career Tracks</span>
            <i data-lucide="chevron-down" class="w-3.5 h-3.5 opacity-60"></i>
          </button>
          <div class="dropdown-menu absolute top-full left-0 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-4 z-50">
            <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100 mb-2">Outcome-Driven Pathways</div>
            <div class="space-y-1">
              <a href="#/tracks" class="block p-2 rounded-xl hover:bg-brand-50/70">
                <div class="font-bold text-slate-800 text-xs">AI Specialist Track</div>
                <div class="text-[10px] text-slate-500">Autonomous agents & API micro-tools</div>
              </a>
              <a href="#/tracks" class="block p-2 rounded-xl hover:bg-brand-50/70">
                <div class="font-bold text-slate-800 text-xs">Web Developer Track</div>
                <div class="text-[10px] text-slate-500">Commercial React, serverless & APIs</div>
              </a>
              <a href="#/tracks" class="block p-2 rounded-xl hover:bg-brand-50/70">
                <div class="font-bold text-slate-800 text-xs">SEO & Publishing Architect</div>
                <div class="text-[10px] text-slate-500">High-traffic websites & topical dominance</div>
              </a>
              <a href="#/tracks" class="block p-2 rounded-xl hover:bg-brand-50/70">
                <div class="font-bold text-slate-800 text-xs">Digital Marketing & Performance Ads</div>
                <div class="text-[10px] text-slate-500">Meta CAPI, funnels & conversion scaling</div>
              </a>
            </div>
          </div>
        </div>

        <!-- GUIDES & ARTICLES -->
        <a href="#/articles" class="nav-link py-2 hover:text-brand-600 transition-colors uppercase tracking-wider">Articles</a>

        <!-- TOPICS -->
        <a href="#/topics" class="nav-link py-2 hover:text-brand-600 transition-colors uppercase tracking-wider">Topics</a>

        <!-- ABOUT US -->
        <a href="#/about" class="nav-link py-2 hover:text-brand-600 transition-colors uppercase tracking-wider">About Nasir</a>

        <!-- CONTACT -->
        <a href="#/contact" class="nav-link py-2 hover:text-brand-600 transition-colors uppercase tracking-wider">Contact</a>
      </nav>

      <!-- Right CTAs & Student Portal -->
      <div class="hidden sm:flex items-center gap-3">
        <!-- Auth / Student Dashboard Container -->
        <div id="auth-nav-container">
          <button onclick="handleGoogleSignIn()" class="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-surface hover:bg-slate-100 border border-bordercol rounded-xl transition-all shadow-xs">
            <svg class="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
            <span>Student Login</span>
          </button>
        </div>

        <a href="#/courses" class="gradient-hero-btn text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md">
          <i data-lucide="graduation-cap" class="w-4 h-4"></i>
          <span>Explore Courses</span>
        </a>
      </div>

      <!-- Mobile Hamburger Button -->
      <button id="mobile-menu-btn" class="lg:hidden p-2 rounded-lg text-slate-600 hover:text-dark hover:bg-slate-100">
        <i data-lucide="menu" class="w-6 h-6"></i>
      </button>
    </div>

    <!-- Mobile Drawer -->
    <div id="mobile-menu" class="hidden lg:hidden border-b border-bordercol bg-white px-4 pt-3 pb-6 space-y-3">
      <a href="#/" class="mobile-nav-link block px-3 py-2 rounded-lg font-medium text-slate-800 hover:bg-brand-50 hover:text-brand-600">Home</a>
      <a href="#/courses" class="mobile-nav-link block px-3 py-2 rounded-lg font-medium text-brand-700 bg-brand-50/60 font-semibold">Paid Courses (8 Masterclasses)</a>
      <a href="#/tools" class="mobile-nav-link block px-3 py-2 rounded-lg font-medium text-slate-800 hover:bg-brand-50 hover:text-brand-600">Free AI Tools (11)</a>
      <a href="#/tracks" class="mobile-nav-link block px-3 py-2 rounded-lg font-medium text-slate-800 hover:bg-brand-50 hover:text-brand-600">Career Tracks</a>
      <a href="#/articles" class="mobile-nav-link block px-3 py-2 rounded-lg font-medium text-slate-800 hover:bg-brand-50 hover:text-brand-600">Guides & Articles</a>
      <a href="#/topics" class="mobile-nav-link block px-3 py-2 rounded-lg font-medium text-slate-800 hover:bg-brand-50 hover:text-brand-600">Topics</a>
      <a href="#/about" class="mobile-nav-link block px-3 py-2 rounded-lg font-medium text-slate-800 hover:bg-brand-50 hover:text-brand-600">About Nasir</a>
      <a href="#/contact" class="mobile-nav-link block px-3 py-2 rounded-lg font-medium text-slate-800 hover:bg-brand-50 hover:text-brand-600">Contact</a>
      <div id="mobile-auth-container" class="pt-2">
        <button onclick="handleGoogleSignIn()" class="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 rounded-xl">
          <span>Student Sign In</span>
        </button>
      </div>
      <div class="pt-1">
        <a href="#/courses" class="gradient-hero-btn text-center text-white text-xs font-semibold py-2.5 rounded-xl block">Explore Paid Courses</a>
      </div>
    </div>
  </header>

  <!-- Router View Container -->
  <main id="app-view" class="flex-grow">
    <div class="py-24 text-center">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-brand-600 border-t-transparent"></div>
      <p class="mt-4 text-sm text-muted">Loading Web Nasir Academy...</p>
    </div>
  </main>

  <!-- Floating WhatsApp Contact Button -->
  <div class="fixed bottom-6 right-6 z-50 flex items-center group">
    <div class="hidden md:block mr-3 bg-dark text-white text-xs font-medium py-1.5 px-3 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
      Chat with Nasir on WhatsApp
    </div>
    <a id="whatsapp-float-link" href="https://wa.me/917006334417?text=Hi%20Nasir,%20I%20am%20interested%20in%20Web%20Nasir%20Academy%20courses%20and%20tools!" target="_blank" rel="noopener noreferrer" class="relative flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/30 transition-transform hover:scale-110">
      <span class="absolute inset-0 rounded-full bg-emerald-400 opacity-75 pulse-ring"></span>
      <i data-lucide="message-circle" class="w-7 h-7 relative z-10"></i>
    </a>
  </div>

  <!-- ACADEMY FOOTER (5-Column Reference Style) -->
  <footer class="bg-navy text-slate-300 border-t border-slate-800 pt-16 pb-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
        
        <!-- Column 1: Brand Info -->
        <div class="lg:col-span-2 space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
              <i data-lucide="sparkles" class="w-5 h-5"></i>
            </div>
            <span class="text-xl font-bold font-heading text-white">Web Nasir Academy</span>
          </div>
          <p class="text-xs text-slate-400 leading-relaxed max-w-sm" id="footer-summary">
            A practical technology academy and engineering platform built by 10-year veteran Nasir. We empower creators, software engineers, and digital publishers to master modern AI utilities, full-stack web engineering, and battle-tested monetization architectures.
          </p>
          <div class="flex items-center gap-3 pt-2">
            <a id="soc-yt" href="https://youtube.com/@webnasir" target="_blank" rel="noopener" class="w-8 h-8 rounded-lg bg-slate-800 hover:bg-brand-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"><i data-lucide="youtube" class="w-4 h-4"></i></a>
            <a id="soc-fb" href="https://facebook.com/webnasir" target="_blank" rel="noopener" class="w-8 h-8 rounded-lg bg-slate-800 hover:bg-brand-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"><i data-lucide="facebook" class="w-4 h-4"></i></a>
            <a id="soc-x" href="https://x.com/webnasir" target="_blank" rel="noopener" class="w-8 h-8 rounded-lg bg-slate-800 hover:bg-brand-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"><i data-lucide="twitter" class="w-4 h-4"></i></a>
            <a id="soc-li" href="https://linkedin.com/in/webnasir" target="_blank" rel="noopener" class="w-8 h-8 rounded-lg bg-slate-800 hover:bg-brand-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"><i data-lucide="linkedin" class="w-4 h-4"></i></a>
            <a id="soc-ig" href="https://instagram.com/webnasir" target="_blank" rel="noopener" class="w-8 h-8 rounded-lg bg-slate-800 hover:bg-brand-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"><i data-lucide="instagram" class="w-4 h-4"></i></a>
          </div>
        </div>

        <!-- Column 2: Free Tools -->
        <div class="space-y-3">
          <h4 class="text-xs font-bold uppercase tracking-wider text-white">Free AI Utilities</h4>
          <ul class="space-y-2 text-xs text-slate-400">
            <li><a href="#/tools/youtube" class="hover:text-brand-400 transition-colors">YouTube Hook & Title Crafter</a></li>
            <li><a href="#/tools/blogoutline" class="hover:text-brand-400 transition-colors">SEO Blog Outline Strategist</a></li>
            <li><a href="#/tools/codeexplainer" class="hover:text-brand-400 transition-colors">Code & Regex Explainer</a></li>
            <li><a href="#/tools/adcopy" class="hover:text-brand-400 transition-colors">High-CTR Ad Copy Crafter</a></li>
            <li><a href="#/tools/business" class="hover:text-brand-400 transition-colors">AdSense Revenue Estimator</a></li>
            <li><a href="#/tools/arbitrage" class="hover:text-brand-400 transition-colors">AdSense Arbitrage Calculator</a></li>
          </ul>
        </div>

        <!-- Column 3: Academy Courses -->
        <div class="space-y-3">
          <h4 class="text-xs font-bold uppercase tracking-wider text-white">Paid Masterclasses</h4>
          <ul class="space-y-2 text-xs text-slate-400">
            <li><a href="#/courses" class="hover:text-brand-400 transition-colors">Complete AI Mastery</a></li>
            <li><a href="#/courses" class="hover:text-brand-400 transition-colors">Full-Stack Web Development</a></li>
            <li><a href="#/courses" class="hover:text-brand-400 transition-colors">Technical SEO Mastery</a></li>
            <li><a href="#/courses" class="hover:text-brand-400 transition-colors">Digital Marketing with AI</a></li>
            <li><a href="#/courses" class="hover:text-brand-400 transition-colors">Google AdSense High RPM</a></li>
            <li><a href="#/courses" class="hover:text-brand-400 transition-colors">Facebook In-Stream Ads</a></li>
          </ul>
        </div>

        <!-- Column 4: Support & Company -->
        <div class="space-y-3">
          <h4 class="text-xs font-bold uppercase tracking-wider text-white">Company & Support</h4>
          <ul class="space-y-2 text-xs text-slate-400">
            <li><a href="#/about" class="hover:text-brand-400 transition-colors">About Founder Nasir</a></li>
            <li><a href="#/contact" class="hover:text-brand-400 transition-colors">Contact & Admissions</a></li>
            <li><a href="#/tracks" class="hover:text-brand-400 transition-colors">Career Tracks</a></li>
            <li><a href="#/articles" class="hover:text-brand-400 transition-colors">Guides & Case Studies</a></li>
            <li><a href="#/student" class="hover:text-brand-400 transition-colors">Student Dashboard</a></li>
            <li><a href="https://wa.me/917006334417" target="_blank" class="text-emerald-400 hover:underline">WhatsApp: +91 7006334417</a></li>
          </ul>
        </div>

      </div>

      <div class="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <p>&copy; <span id="year-curr">2025</span> Web Nasir Academy. Deployed on Production Netlify Serverless Architecture.</p>
        <div class="flex items-center gap-6">
          <a href="#/about" class="hover:text-slate-400">About Author</a>
          <a href="#/contact" class="hover:text-slate-400">Contact & Support</a>
          <a href="#/tools" class="hover:text-brand-400">Free Tools Directory</a>
          <button onclick="window.scrollTo({top: 0, behavior: 'smooth'})" class="hover:text-white flex items-center gap-1">
            <span>Back to top</span>
            <i data-lucide="arrow-up" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>
    </div>
  </footer>

  <!-- USER SAVED GENERATIONS MODAL -->
  <div id="saved-modal" class="hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 shadow-2xl">
      <div class="flex items-center justify-between pb-4 border-b border-bordercol mb-4">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
            <i data-lucide="bookmark" class="w-4 h-4"></i>
          </div>
          <h3 class="text-lg font-bold font-heading text-dark">My Saved Generations & Bookmarks</h3>
        </div>
        <button onclick="closeSavedModal()" class="p-2 text-slate-400 hover:text-dark rounded-lg"><i data-lucide="x" class="w-5 h-5"></i></button>
      </div>
      <div id="saved-list" class="space-y-4">
        <p class="text-xs text-muted py-8 text-center">Loading your saved items from Firestore...</p>
      </div>
    </div>
  </div>

  <!-- NASIR VIDEO PRESENTER & VOICE MODAL -->
  <div id="video-modal" class="hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 overflow-hidden">
      <div class="p-4 sm:p-6 bg-navy text-white flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white">
            <i data-lucide="play" class="w-5 h-5 fill-white"></i>
          </div>
          <div>
            <h3 class="text-base font-bold font-heading" id="modal-video-title">Meet Nasir — Academy Introduction</h3>
            <p class="text-xs text-brand-300">10-Year Software Engineer & Mentor</p>
          </div>
        </div>
        <button onclick="closeNasirVideoModal()" class="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <div class="p-6 space-y-6">
        <!-- Video Player Container -->
        <div class="aspect-video w-full bg-slate-950 rounded-2xl overflow-hidden relative shadow-inner">
          <iframe id="video-iframe" class="w-full h-full" src="" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>

        <!-- Audio Presenter Narration Controls (Web Speech API) -->
        <div class="p-5 rounded-2xl bg-surface border border-slate-200 space-y-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span class="text-xs font-bold uppercase tracking-wider text-slate-800">Founder Voice Narration</span>
              </div>
              <p class="text-xs text-slate-500 mt-0.5">Listen to Nasir's direct introduction via synthetic speech presenter</p>
            </div>
            <div class="flex items-center gap-2">
              <button id="speech-lang-toggle" onclick="toggleSpeechLanguage()" class="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50">
                Language: <span id="speech-curr-lang" class="text-brand-700">Urdu</span>
              </button>
              <button id="speech-play-btn" onclick="toggleSpeechPresenter()" class="gradient-hero-btn text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm">
                <i data-lucide="volume-2" class="w-4 h-4"></i>
                <span id="speech-btn-label">Listen to Introduction</span>
              </button>
            </div>
          </div>

          <!-- Live Subtitles Container -->
          <div id="subtitles-box" class="p-3 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-800 min-h-12 leading-relaxed">
            <span class="text-slate-400 italic">Click "Listen to Introduction" to play audio with synchronized subtitles.</span>
          </div>
        </div>

        <!-- Video Transcript -->
        <div class="space-y-2">
          <button onclick="document.getElementById('full-transcript').classList.toggle('hidden')" class="text-xs font-bold text-brand-700 hover:underline flex items-center gap-1">
            <i data-lucide="file-text" class="w-3.5 h-3.5"></i>
            <span>View Full Presentation Script & Transcript</span>
          </button>
          <div id="full-transcript" class="hidden p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-2">
            <p id="transcript-text">
              "Assalamu Alaikum! Welcome to Web Nasir. I'm Nasir, and I've created this platform to help you learn modern digital skills, use AI tools, build websites, master SEO, and develop your online career. Whether you are using our 11 free AI utilities or enrolling in our comprehensive paid masterclasses, our focus is 100% practical results."
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- COURSE ENROLLMENT / CHECKOUT MODAL (Razorpay & UPI) -->
  <div id="checkout-modal" class="hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200">
      <div class="flex items-center justify-between pb-4 border-b border-bordercol mb-6">
        <div>
          <h3 class="text-lg font-bold font-heading text-dark">Course Enrollment</h3>
          <p class="text-xs text-muted" id="checkout-course-title">Complete AI Mastery</p>
        </div>
        <button onclick="closeCheckoutModal()" class="p-2 text-slate-400 hover:text-dark rounded-xl">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <form onsubmit="handleExecuteEnrollment(event)" class="space-y-4">
        <input type="hidden" id="checkout-course-id" value="">

        <div class="p-4 rounded-2xl bg-brand-50/70 border border-brand-200/60 flex items-center justify-between">
          <div>
            <div class="text-[11px] font-bold text-brand-800 uppercase tracking-wider">Tuition Investment</div>
            <div class="text-2xl font-extrabold text-brand-900 mt-0.5" id="checkout-price-display">₹4,999</div>
          </div>
          <div class="text-right">
            <span class="text-xs line-through text-slate-400" id="checkout-orig-price">₹12,999</span>
            <span class="block text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full mt-0.5">Save Over 60%</span>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Full Student Name</label>
          <input id="checkout-student-name" type="text" required placeholder="e.g. Babidul Hassan" class="w-full px-4 py-2.5 bg-surface border border-bordercol rounded-xl text-sm font-medium">
        </div>

        <div>
          <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Student Email Address</label>
          <input id="checkout-student-email" type="email" required placeholder="you@example.com" class="w-full px-4 py-2.5 bg-surface border border-bordercol rounded-xl text-sm font-medium">
        </div>

        <div>
          <label class="block text-xs font-bold uppercase text-slate-700 mb-1">WhatsApp / Phone Number</label>
          <input id="checkout-student-phone" type="tel" required placeholder="+91 9876543210" class="w-full px-4 py-2.5 bg-surface border border-bordercol rounded-xl text-sm font-medium">
        </div>

        <div>
          <label class="block text-xs font-bold uppercase text-slate-700 mb-2">Preferred Payment Gateway</label>
          <div class="grid grid-cols-2 gap-3 text-xs">
            <label class="flex items-center gap-2 p-3 rounded-xl border border-brand-300 bg-brand-50/50 cursor-pointer">
              <input type="radio" name="pay-method" value="Razorpay UPI" checked class="text-brand-600">
              <span class="font-bold text-slate-800">UPI / QR Code</span>
            </label>
            <label class="flex items-center gap-2 p-3 rounded-xl border border-slate-200 hover:border-slate-300 cursor-pointer">
              <input type="radio" name="pay-method" value="Cards / NetBanking" class="text-brand-600">
              <span class="font-bold text-slate-800">Card / NetBanking</span>
            </label>
          </div>
        </div>

        <div class="pt-2">
          <button id="checkout-submit-btn" type="submit" class="w-full gradient-hero-btn text-white font-semibold py-3.5 rounded-xl text-sm shadow-md flex items-center justify-center gap-2">
            <i data-lucide="shield-check" class="w-4 h-4"></i>
            <span>Complete Secure Enrollment</span>
          </button>
        </div>

        <p class="text-[10px] text-slate-400 text-center leading-relaxed">
          🔒 Secure 256-bit encryption. Instant enrollment record created. Access your lessons immediately in the Student Dashboard.
        </p>
      </form>
    </div>
  </div>

  <!-- TOAST CONTAINER -->
  <div id="toast-container" class="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none"></div>

  <!-- SYNCHRONOUS PRE-HYDRATED APPLICATION STATE -->
  <script>
    // Global State with Instant Hydration Defaults (Guaranteed Synchronous Execution Before Router)
    window.APP_STATE = {
      settings: {
        site_name: 'Web Nasir Academy',
        tagline: 'Practical AI, Web Engineering & Digital Monetization',
        whatsapp_number: '917006334417',
        email: 'hello@webnasir.com',
        announcement_enabled: true,
        announcement_badge: 'New 2025 Edition',
        announcement_text: 'Web Nasir Academy is Live: Free AI Utilities, Professional Paid Courses & High-RPM Blueprints!',
        announcement_link_text: 'Explore Courses →',
        announcement_link_url: '#/courses',
        hero_title: 'Master AI, Build Digital Skills & Create Your Online Future.',
        hero_subtitle: 'Learn practical AI, website development, SEO, digital marketing and online business strategies with Nasir. Access powerful free tools and professional training designed for real-world results.',
        stat_years: '10+ Yrs',
        stat_rpm: '$35+',
        stat_projects: '250+',
        stat_tools: '100% Free',
        nasir_quote: 'Over the last decade, I have built web applications that processed millions of requests, directed traffic to AdSense accounts generating over $35 RPM, and helped dozens of developers transition into self-employed digital builders.',
        video_title: 'Welcome to Web Nasir Academy',
        video_subtitle: 'Watch Founder Nasir introduce the mission, free AI utilities, and career tracks.',
        video_url: '', // No founder video supplied yet — placeholder shown instead; do NOT re-add a YouTube video.
        video_presenter_name: 'Nasir',
        video_presenter_title: 'Founder & Lead Technical Mentor',
        video_script_urdu: "Assalamu Alaikum! Welcome to Web Nasir. I'm Nasir, and I've created this platform to help you learn modern digital skills, use AI tools, build websites, master SEO, and develop your online career. Whether you are using our 11 free AI utilities or enrolling in our comprehensive paid masterclasses, our focus is 100% practical results.",
        video_script_english: "Welcome to Web Nasir Academy. I am Nasir, a senior full-stack engineer and digital publisher with over 10 years of experience. We built this platform so you can learn real-world skills, avoid theoretical fluff, deploy live software, and create sustainable online income.",
        razorpay_enabled: true,
        razorpay_key_id: 'rzp_test_webnasir_demo',
        currency: 'INR',
        currency_symbol: '₹',
        social_facebook: 'https://facebook.com/webnasir',
        social_x: 'https://x.com/webnasir',
        social_youtube: 'https://youtube.com/@webnasir',
        social_instagram: 'https://instagram.com/webnasir',
        social_linkedin: 'https://linkedin.com/in/webnasir',
        footer_text: 'Helping developers, creators and digital entrepreneurs build high-impact web assets and earn real online income.',
        trust_badges: [
          '10+ Years Experience',
          '250+ Projects Shipped',
          '11 Free AI Tools',
          '100% Practical Projects',
          'Live Mentorship',
          '4.9 ★ Rating',
        ],
      },
      topics: [
        { key: 'ai', name: 'AI & Automation Tools', description: 'Ship lightweight AI micro-SaaS utilities, automated workflows, and high-utility prompt apps that solve real user problems.', icon: 'sparkles', link: '#/articles?tag=ai', sort_order: 1 },
        { key: 'webdev', name: 'Modern Web Engineering', description: 'Production-ready full-stack architecture, high-performance static builds, Jamstack, serverless, and clean UI engineering.', icon: 'code', link: '#/articles?tag=webdev', sort_order: 2 },
        { key: 'adsense', name: 'Google AdSense & High RPM', description: 'Data-driven ad placement, high-tier GEO targeting, keyword arbitrage, and viewability tuning to maximize your RPM.', icon: 'dollar-sign', link: '#/articles?tag=adsense', sort_order: 3 },
        { key: 'facebook', name: 'Facebook Video & Reels Monetization', description: 'Break into In-Stream ads, Facebook Reels bonuses, virality frameworks, retention editing, and rights manager compliance.', icon: 'share-2', link: '#/articles?tag=facebook', sort_order: 4 },
        { key: 'blogging', name: 'SEO & Content Publishing', description: 'Topical authority clusters, intent-first search optimization, programmatic content scaling, and Core Web Vitals.', icon: 'book-open', link: '#/articles?tag=blogging', sort_order: 5 },
        { key: 'earning', name: 'Digital Products & Micro-Income', description: 'Turn your utility websites into recurring cash flow using affiliate partnerships, premium tiers, and niche newsletters.', icon: 'trending-up', link: '#/articles?tag=earning', sort_order: 6 }
      ],
      tools: [
        { key: 'youtube', name: 'AI Viral YouTube Title & Hook Crafter', description: 'Generate high-CTR click-worthy YouTube titles, retention intro hooks, and visual thumbnail concepts using Gemini AI.', category: 'AI Creators', badge: 'AI Powered', tool_type: 'ai_youtube', icon: 'video', is_enabled: true, sort_order: 1 },
        { key: 'blogoutline', name: 'AI SEO Blog Outline & Keyword Strategist', description: 'Produce intent-first article structures, H2/H3 hierarchies, and high-CPC target keyword clusters in seconds.', category: 'SEO & Content', badge: 'AI Powered', tool_type: 'ai_blog', icon: 'file-text', is_enabled: true, sort_order: 2 },
        { key: 'codeexplainer', name: 'AI Code, Regex & Script Explainer', description: 'Break down complex JavaScript, Python, SQL queries, or regular expressions with plain English explanations and fixes.', category: 'AI Creators', badge: 'AI Powered', tool_type: 'ai_code', icon: 'code', is_enabled: true, sort_order: 3 },
        { key: 'adcopy', name: 'AI AdSense & Social Ad Copy Generator', description: 'Generate high-converting headlines, primary ad copy, and psychological call-to-actions tailored for web traffic.', category: 'Monetization', badge: 'AI Powered', tool_type: 'ai_adcopy', icon: 'sparkles', is_enabled: true, sort_order: 4 },
        { key: 'business', name: 'AdSense & Website Revenue Estimator', description: 'Project daily, monthly, and yearly income based on niche traffic, RPM, ad impressions, and click-through rates.', category: 'Monetization', badge: 'Interactive Calc', tool_type: 'client_business', icon: 'dollar-sign', is_enabled: true, sort_order: 5 },
        { key: 'name', name: 'AI Brand & Domain Name Generator', description: 'Generate catchy, brandable tech and business names with instant domain availability hints and marketing vibe scoring.', category: 'AI Creators', badge: 'Branding Tool', tool_type: 'client_name', icon: 'sparkles', is_enabled: true, sort_order: 6 },
        { key: 'instagram', name: 'Social Media Viral Caption & Tag Generator', description: 'Craft high-engagement Instagram, TikTok, and Facebook captions paired with tri-tier low/mid/high competition hashtags.', category: 'SEO & Content', badge: 'Growth Tool', tool_type: 'client_instagram', icon: 'hash', is_enabled: true, sort_order: 7 },
        { key: 'wordcount', name: 'Pro Content SEO & Word Density Analyzer', description: 'Inspect word count, character count, estimated reading & speaking time, readability grades, and keyword density for SEO.', category: 'SEO & Content', badge: 'SEO Utility', tool_type: 'client_wordcount', icon: 'file-text', is_enabled: true, sort_order: 8 },
        { key: 'password', name: 'Military-Grade Password & Passphrase Generator', description: 'Create cryptographically strong passwords or memorable passphrase chains with real-time entropy strength analysis.', category: 'Calculators', badge: 'Security Tool', tool_type: 'client_password', icon: 'shield-check', is_enabled: true, sort_order: 9 },
        { key: 'age', name: 'Exact Age & Date Milestone Calculator', description: 'Calculate your exact age down to days, hours, and minutes, upcoming milestone birthdays, and astrological insights.', category: 'Calculators', badge: 'Date Utility', tool_type: 'client_age', icon: 'calendar', is_enabled: true, sort_order: 10 },
        { key: 'arbitrage', name: 'AdSense Arbitrage & Traffic Profitability Calculator', description: 'Simulate paid ad acquisition cost vs AdSense revenue return, net profit margins, and campaign ROI percentage.', category: 'Monetization', badge: 'Arbitrage Tool', tool_type: 'client_arbitrage', icon: 'trending-up', is_enabled: true, sort_order: 11 }
      ],
      articles: [
        { slug: 'ai-tools-monetization', tag: 'ai', title: 'How to Build and Monetize AI Micro-SaaS Tools in 2025: A 10-Year Developer Blueprint', meta: 'Step-by-step framework to conceptualize, ship, and monetize lightweight AI utility websites without massive infrastructure bills.', sort_order: 1, is_published: true },
        { slug: 'adsense-high-rpm-guide', tag: 'adsense', title: 'From $2 to $35 RPM: Engineering High-Income Google AdSense Architectures', meta: 'Detailed breakdown of ad layout engineering, high-tier GEO audience acquisition, sticky ad placement physics, and Core Web Vitals optimization.', sort_order: 2, is_published: true },
        { slug: 'facebook-monetization-playbook', tag: 'facebook', title: 'Facebook Video Monetization: The 3-Second Hook & Retention Framework That Pays $10k/Month', meta: 'Master Facebook In-Stream Ads and Performance Bonuses using retention editing, copyright clearance, and audience pacing.', sort_order: 3, is_published: true }
      ],
      courses: [
        {
          id: 'complete-ai-mastery',
          title: 'Complete AI Mastery & Automation Course',
          subtitle: 'From prompt engineering to building and monetizing real AI micro-SaaS utilities with Gemini and Python.',
          category: 'AI & Automation',
          level: 'Beginner to Advanced',
          duration: '8 Weeks',
          modules_count: 32,
          price: 4999,
          original_price: 12999,
          instructor: 'Nasir',
          instructor_title: 'Founder & Senior Engineer',
          badge: 'Flagship Program',
          is_published: true,
          sort_order: 1,
          overview: 'A comprehensive, zero-fluff academy program teaching you how to use modern generative AI models, craft intelligent autonomous workflows, build AI utilities, and monetize prompt engineering architectures in 2025.',
          features: [
            '32 Step-by-step video lessons & code repositories',
            'Build 4 production-grade AI micro-utilities',
            'Gemini 2.5 API integration & function calling',
            'Direct 1-on-1 weekly code review with Nasir',
            'Lifetime access to updates & private Discord community',
            'Official Web Nasir Academy Certificate'
          ],
          curriculum: [
            { module: 'Module 1: Foundations of Generative AI', lessons: ['LLM Architecture Overview: Tokens & Context', 'Advanced Prompt Engineering & Chain-of-Thought', 'Preventing Hallucinations'] },
            { module: 'Module 2: Web Apps with Gemini API', lessons: ['API Keys & Serverless Proxy Architecture', 'Streaming Real-Time Output', 'Structured JSON Schemas & Function Calling'] },
            { module: 'Module 3: Micro-SaaS Deployment', lessons: ['Clean Frontend UX for AI Apps', 'Rate Limiting & Netlify Blobs Caching', 'Edge Serverless Execution'] },
            { module: 'Module 4: Monetization & Traffic', lessons: ['AdSense vs Paid Subscription Models', 'Viral Distribution Channels', 'Customer Analytics & Retention'] }
          ]
        },
        {
          id: 'fullstack-web-dev',
          title: 'Production Full-Stack Website Development',
          subtitle: 'Build enterprise-grade React, Node.js, and serverless applications. Learn real deployment physics and performance tuning.',
          category: 'Website Development',
          level: 'Intermediate',
          duration: '10 Weeks',
          modules_count: 45,
          price: 6499,
          original_price: 15999,
          instructor: 'Nasir',
          instructor_title: '10+ Years Full-Stack Engineer',
          badge: 'Career Track',
          is_published: true,
          sort_order: 2,
          overview: 'Escape tutorial hell. Learn modern full-stack web engineering the way senior software engineers build in production: React 19, TypeScript, Node.js, Express, Tailwind CSS, PostgreSQL, and serverless edge delivery.',
          features: [
            '45 In-depth modules with production git repositories',
            'Ship 3 commercial-grade web applications',
            'Database architecture: SQL & Key-Value Stores',
            'Performance optimization & 100/100 Lighthouse scores',
            'Mock interview & portfolio architecture review',
            'Official Web Nasir Academy Certificate'
          ],
          curriculum: [
            { module: 'Module 1: TypeScript & Modern JS', lessons: ['Asynchronous Patterns, Event Loop & Closures', 'Strict TypeScript Generics & Types', 'Vite & Next-Gen Tooling'] },
            { module: 'Module 2: Advanced React Architecture', lessons: ['React 19 Hooks & State Reducers', 'Client-Side Routing & Zero-Race Hydration', 'High-Craft UI: Tailwind & Motion'] },
            { module: 'Module 3: Scalable Backend & APIs', lessons: ['RESTful API Design & Express Middleware', 'JWT Auth with httpOnly Cookies', 'Serverless Functions & Edge Routing'] },
            { module: 'Module 4: Deployment & DevOps', lessons: ['Docker Containerization & Linux VPS Management', 'Nginx Reverse Proxy & Let’s Encrypt SSL', 'CI/CD Pipelines with GitHub Actions'] }
          ]
        },
        {
          id: 'seo-mastery',
          title: 'Professional Technical SEO & Search Intent Mastery',
          subtitle: 'Topical authority clusters, Core Web Vitals, programmatic content architectures, and ranking in the AI search era.',
          category: 'SEO Mastery',
          level: 'All Levels',
          duration: '6 Weeks',
          modules_count: 28,
          price: 3999,
          original_price: 9999,
          instructor: 'Nasir',
          instructor_title: 'Digital Publisher & SEO Veteran',
          badge: 'High ROI',
          is_published: true,
          sort_order: 3,
          overview: 'Algorithms change, but user search intent and technical excellence always win. Master technical SEO, site speed physics, schema structured data, internal linking clusters, and intent-targeted content frameworks.',
          features: [
            '28 Hands-on modules with live site audits',
            'Real-world case studies ranking in Google US/UK',
            'Topical clustering template & keyword spreadsheets',
            'Core Web Vitals remediation checklist',
            'Direct feedback on your target website domain'
          ],
          curriculum: [
            { module: 'Module 1: Search Intent & Semantic Search Physics', lessons: ['Navigational vs Commercial Intent', 'Keyword Research Beyond Search Volume: CPC & Competition', 'Topical Authority Clusters vs One-Off Posts'] },
            { module: 'Module 2: Technical Architecture & Core Web Vitals', lessons: ['LCP, INP & CLS Optimization for Next-Gen Rankings', 'Crawl Budget, Canonicalization & Sitemaps', 'JSON-LD Schema Markup: Articles & FAQ'] },
            { module: 'Module 3: Link Architecture & Authority Building', lessons: ['Internal Linking Physics: Flowing PageRank to High-RPM URLs', 'Ethical White-Hat Outreach & Resource Links', 'Surviving Google Core Algorithm Updates'] }
          ]
        },
        {
          id: 'digital-marketing-ai',
          title: 'Digital Marketing & Performance Ads with AI',
          subtitle: 'High-converting Meta, Google, and TikTok ad architectures, AI copy generation, funnel optimization, and conversion tracking.',
          category: 'Digital Marketing',
          level: 'Beginner to Intermediate',
          duration: '6 Weeks',
          modules_count: 26,
          price: 4499,
          original_price: 11999,
          instructor: 'Nasir',
          instructor_title: 'Ad Operations & Funnel Mentor',
          badge: 'In Demand',
          is_published: true,
          sort_order: 4,
          overview: 'Stop burning ad budget on guesswork. Learn the rigorous quantitative frameworks behind profitable performance marketing: hook rates, hold rates, copy psychology, pixel attribution, and AI-accelerated creative testing.',
          features: [
            '26 Focused modules with copy-paste campaign templates',
            'Ad creative testing spreadsheets & ROAS calculators',
            'Meta CAPI & Google Tag Manager tracking setups',
            'Live campaign budget pacing and scaling guidelines'
          ],
          curriculum: [
            { module: 'Module 1: High-Conversion Creative Strategy', lessons: ['The 3-Second Visual Hook', 'AI Ad Copy Crafting: Headlines, Angles & Objections', 'Thumbnail & Creative Production with Free AI Tools'] },
            { module: 'Module 2: Meta Ads Infrastructure', lessons: ['Business Manager, Pixel & CAPI Setup', 'CBO vs ABO: Budget Scaling Systems', 'Retargeting Funnels & Lookalike Audiences'] },
            { module: 'Module 3: Analytics & Profitability', lessons: ['Blended ROAS vs Platform Reported Metrics', 'Landing Page Conversion Rate Optimization (CRO)', 'Unit Economics & Customer Acquisition Cost (CAC)'] }
          ]
        },
        {
          id: 'adsense-blogging',
          title: 'Blogging & Google AdSense High-RPM Mastery',
          subtitle: 'From $2 to $35+ RPM: ad layout engineering, high-tier GEO targeting, keyword arbitrage, and viewability tuning.',
          category: 'Monetization',
          level: 'Intermediate to Advanced',
          duration: '8 Weeks',
          modules_count: 36,
          price: 5999,
          original_price: 14999,
          instructor: 'Nasir',
          instructor_title: '10-Year AdSense Veteran',
          badge: 'Nasir Signature',
          is_published: true,
          sort_order: 5,
          overview: 'The definitive blueprint extracted directly from Nasir’s decade-long publishing operations. Learn how ad networks actually value impressions, how to design high-CTR layout heatmaps, and how to acquire high-CPC tier-1 traffic safely.',
          features: [
            '36 Comprehensive lessons covering real AdSense dashboards',
            'The exact sticky sidebar & in-article physics script',
            'Google AdSense Policy compliance & invalid traffic safeguards',
            'Arbitrage traffic profitability spreadsheets',
            'Direct 1-on-1 ad layout audit with Nasir'
          ],
          curriculum: [
            { module: 'Module 1: Ad Exchange Mechanics & RPM Drivers', lessons: ['RPM vs eCPM vs CPC: How Publishers Get Paid', 'Why Tier-1 GEO Traffic (US, UK) Pays 10x More', 'Google MCM & AdSense Auto Ads vs Manual Slots'] },
            { module: 'Module 2: High-RPM Layout Engineering', lessons: ['Viewability Physics: Achieving 70%+ Active View', 'Sticky Sidebar & Anchor Ads Without Violations', 'Native In-Feed Ad Formats That Match Editorial Content'] },
            { module: 'Module 3: Traffic Acquisition & Arbitrage Physics', lessons: ['Paid Traffic Arbitrage: Buying at $0.05, Selling at $0.15', 'Facebook Viral Distribution to AdSense Content', 'Preventing Policy Violations & Ad Limits'] }
          ]
        },
        {
          id: 'youtube-automation',
          title: 'YouTube Automation & High-CTR Content Creation',
          subtitle: 'Create high-retention faceless channels using AI scripting, voice synthesis, thumbnail CTR science, and monetized pacing.',
          category: 'AI Creators',
          level: 'Beginner to Pro',
          duration: '5 Weeks',
          modules_count: 22,
          price: 3499,
          original_price: 8999,
          instructor: 'Nasir',
          instructor_title: 'Digital Creator Mentor',
          badge: 'Trending',
          is_published: true,
          sort_order: 6,
          overview: 'Build sustainable automated channels without showing your face. Master niche selection, retention scripting, AI voice generation, thumbnail contrast physics, and YouTube algorithmic monetization.',
          features: [
            '22 Video modules covering end-to-end automation pipelines',
            'AI prompt templates for viral storytelling & cliffhangers',
            'Photoshop & Canva thumbnail psd templates',
            'Monetization checklist for AdSense, Sponsors & Affiliates'
          ],
          curriculum: [
            { module: 'Module 1: High-RPM Niche Selection', lessons: ['Finance, Tech, Luxury & History: High-CPC YouTube Niches', 'Competitor Gap Analysis & Audience Demand Research', 'Channel Branding & Visual Identity Setup'] },
            { module: 'Module 2: AI Scripting & Production Workflow', lessons: ['Retention Scriptwriting: The First 30 Seconds Rule', 'AI Voice Synthesis & Natural Pacing Audio Editing', 'B-Roll Sourcing, Stock Footage & Fair Use Guidelines'] },
            { module: 'Module 3: CTR Science & Long-Term Channel Growth', lessons: ['Thumbnail Design: Facial Contrast & Color Psychology', 'Title Frameworks: Curiosity Gaps vs Direct Answers', 'Community Tab Engagement & Multi-Stream Monetization'] }
          ]
        },
        {
          id: 'social-media-growth',
          title: 'Social Media Growth & Facebook In-Stream Monetization',
          subtitle: 'Break into Facebook In-Stream Ads and Performance Bonuses using retention editing, copyright clearance, and audience pacing.',
          category: 'Social Media Growth',
          level: 'All Levels',
          duration: '5 Weeks',
          modules_count: 20,
          price: 3999,
          original_price: 9999,
          instructor: 'Nasir',
          instructor_title: 'Social Publishing Specialist',
          badge: 'Fast Track',
          is_published: true,
          sort_order: 7,
          overview: 'Facebook is currently paying some of the highest video RPMs in digital history. Learn how to hit the 60,000 eligible minutes milestone, maintain clean page quality, and turn video views into regular monthly payouts.',
          features: [
            '20 Targeted lessons on Facebook Creator Studio & Payouts',
            'Viral pacing video templates for Premiere Pro & CapCut',
            'Copyright clearance & Rights Manager compliance rules',
            'Page setup, Professional Mode & Group engagement tactics'
          ],
          curriculum: [
            { module: 'Module 1: The Facebook In-Stream Algorithm', lessons: ['How Meta Distributes Long-Form Videos (3+ Minutes)', 'Hitting 5k Followers & 60k Minutes in Under 30 Days', 'Original Content Guidelines & Avoiding Violations'] },
            { module: 'Module 2: Viral Video Editing Psychology', lessons: ['The First 3-Second Visual Hook That Prevents Scrolling', 'Pattern Interrupts Every 8-12 Seconds for Maximum Retention', 'Adding Subtitles, Sound Effects & Emotional Music Stems'] },
            { module: 'Module 3: Payouts & Multi-Page Scaling', lessons: ['Setting Up Bank Accounts & US Tax Forms', 'Building A Network of Monetized Facebook Pages', 'Reels Play Bonus Program Integration'] }
          ]
        },
        {
          id: 'ai-productivity',
          title: 'AI Automation & Productivity for Entrepreneurs',
          subtitle: 'Automate business workflows with Zapier, Make, webhook orchestration, and custom AI agents that eliminate manual labor.',
          category: 'AI & Automation',
          level: 'Intermediate',
          duration: '4 Weeks',
          modules_count: 18,
          price: 2999,
          original_price: 7999,
          instructor: 'Nasir',
          instructor_title: 'Full-Stack & Systems Engineer',
          badge: 'Productivity',
          is_published: true,
          sort_order: 8,
          overview: 'Stop doing repetitive manual tasks. Learn how to connect webhooks, automate email triage, generate social assets autonomously, and build internal tools that save 20+ hours every single week.',
          features: [
            '18 Hands-on tutorials with importable automation blueprints',
            'Integrations with Google Sheets, Slack, Gmail, and Airtable',
            'Custom Webhooks & REST API trigger configurations',
            'Zero-code to low-code enterprise automation pipelines'
          ],
          curriculum: [
            { module: 'Module 1: Visual Automation Architecture', lessons: ['Make.com vs Zapier: Cost & Scalability', 'Triggers, Routers, Filters & Aggregators', 'Error Handling & Fallback Alerts'] },
            { module: 'Module 2: AI-Powered Autonomous Pipelines', lessons: ['Connecting Gemini API to Automated Content Queues', 'Automated Customer Support Triaging & Drafting', 'Social Media Auto-Publishing with AI Captioning'] }
          ]
        }
      ],
      testimonials: [
        {
          id: 'test-1',
          name: 'Babidul Hassan',
          role: 'Full-Stack Developer & Agency Builder',
          course: 'Production Full-Stack Web Development',
          rating: 5,
          content: 'Learning from Nasir was a complete turning point. Instead of theoretical slides, we built actual deployable apps with real databases, authentication, and clean Tailwind styling. Within two months of graduating, I landed my first international client project.',
          avatar: '',
          has_video: true,
          video_url: 'https://img.youtube.com/vi/JUp4ITFlRI8/maxresdefault.jpg',
          verified: true,
          sort_order: 1,
        },
        {
          id: 'test-2',
          name: 'Tausif Ahmed',
          role: 'Content Creator & AdSense Publisher',
          course: 'Blogging & Google AdSense High-RPM Mastery',
          rating: 5,
          content: 'Before Web Nasir, my blog was stuck at a depressing $1.80 RPM. Nasir audited my ad placements, taught me the sticky sidebar physics and tier-1 audience targeting. Last month my RPM crossed $28.50 on the exact same traffic. The math works!',
          avatar: '',
          has_video: false,
          verified: true,
          sort_order: 2,
        },
        {
          id: 'test-3',
          name: 'Farooq Sheikh',
          role: 'SaaS Founder & Micro-Tool Creator',
          course: 'Complete AI Mastery & Automation Course',
          rating: 5,
          content: 'The free AI tools on Web Nasir showed me how capable the platform is, so I enrolled in the AI Mastery course. Nasir explained API rate limiting, system prompts, and serverless edge functions so clearly that I launched my own micro-utility in just 3 weeks.',
          avatar: '',
          has_video: false,
          verified: true,
          sort_order: 3,
        },
        {
          id: 'test-4',
          name: 'Mehraj Din',
          role: 'Digital Marketing & Video Producer',
          course: 'Facebook In-Stream Monetization Playbook',
          rating: 5,
          content: 'The 3-second hook framework and video retention pacing shared in this academy are pure gold. We hit our 60,000 eligible minutes threshold in just 18 days on a brand-new page. Nasir is the real deal—no fake hype, just honest engineering.',
          avatar: '',
          has_video: true,
          video_url: '',
          verified: true,
          sort_order: 4,
        }
      ],
      marquee: [
        { text: '🚀 Learn AI. Build Practical Skills. Earn Real Online Income.', link: '#/courses' },
        { text: '⚡ Explore 11+ Free Production-Ready AI & Webmaster Utilities.', link: '#/tools' },
        { text: '🎓 Web Nasir Academy — 100% Practical Project-Driven Masterclasses.', link: '#/courses' },
        { text: '📈 Master High-RPM Google AdSense & Algorithmic SEO Systems.', link: '#/articles' },
        { text: '💻 Build and Ship Live Commercial Projects with 10-Year Veteran Nasir.', link: '#/about' },
        { text: '🌐 Career Tracks: AI Specialist, Full-Stack Web Developer, SEO Architect.', link: '#/tracks' },
      ],
      currentUser: null,
      enrolledCourses: [],
    };

    // Stubs for auth & bookmark actions until Firebase module finishes loading
    window.handleGoogleSignIn = function() {
      if (window._fbSignIn) return window._fbSignIn();
      showToast('Connecting to Google Sign-in...', 'info');
    };
    window.handleSignOut = function() {
      if (window._fbSignOut) return window._fbSignOut();
    };
    window.saveResultToFirestore = function(toolKey, toolName, inputPrompt, outputResult) {
      if (window._fbSaveResult) return window._fbSaveResult(toolKey, toolName, inputPrompt, outputResult);
      showToast('Please wait, storage service is connecting...', 'info');
    };
    window.openSavedModal = function() {
      if (window._fbOpenSaved) return window._fbOpenSaved();
      const modal = document.getElementById('saved-modal');
      if (modal) modal.classList.remove('hidden');
    };
    window.closeSavedModal = function() {
      const modal = document.getElementById('saved-modal');
      if (modal) modal.classList.add('hidden');
    };
  </script>

  <!-- MAIN ACADEMY SCRIPT -->
  <script>
    // UI Helpers
    function showToast(message, type = 'info') {
      const container = document.getElementById('toast-container');
      const toast = document.createElement('div');
      const bg = type === 'success' ? 'bg-emerald-600' : type === 'error' ? 'bg-rose-600' : 'bg-slate-900';
      toast.className = \`\${bg} text-white text-xs sm:text-sm font-medium px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 pointer-events-auto transform transition-all duration-300 translate-y-2 opacity-0\`;
      toast.innerHTML = \`<span>\${message}</span>\`;
      container.appendChild(toast);
      
      requestAnimationFrame(() => toast.classList.remove('translate-y-2', 'opacity-0'));
      setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
      }, 3500);
    }

    function parseSimpleMarkdown(md) {
      if (!md) return '';
      let html = md
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\\*\\*(.*?)\\*\\*/gim, '<strong>$1</strong>')
        .replace(/\\*(.*?)\\*/gim, '<em>$1</em>')
        .replace(/\`\`\`([a-z]*)\\n([\\s\\S]*?)\`\`\`/gim, '<pre><code>$2</code></pre>')
        .replace(/\`([^\`]+)\`/gim, '<code>$1</code>')
        .replace(/^\\> (.*$)/gim, '<blockquote>$1</blockquote>')
        .replace(/^\\- (.*$)/gim, '<li>$1</li>')
        .replace(/^---$/gim, '<hr class="my-8 border-slate-200">');

      html = html.replace(/(<li>[\\s\\S]*?<\\/li>)/gim, '<ul>$1</ul>');
      
      const lines = html.split('\\n\\n');
      html = lines.map(line => {
        line = line.trim();
        if (!line) return '';
        if (line.startsWith('<h') || line.startsWith('<pre') || line.startsWith('<ul') || line.startsWith('<block') || line.startsWith('<hr')) {
          return line;
        }
        return \`<p>\${line}</p>\`;
      }).join('\\n');

      return html;
    }

    async function apiFetch(endpoint) {
      try {
        const res = await fetch('/api' + endpoint);
        if (!res.ok) throw new Error('Failed to load: ' + res.status);
        return await res.json();
      } catch (err) {
        console.warn('API fetch warning:', endpoint, err.message);
        return null;
      }
    }

    function renderMarqueeTrack() {
      const track = document.getElementById('marquee-track');
      if (!track) return;
      const items = window.APP_STATE.marquee || [];
      // Double items for seamless infinite loop
      const doubled = [...items, ...items];
      track.innerHTML = doubled.map(item => \`
        <a href="\${item.link || '#/courses'}" class="flex items-center gap-2 hover:text-brand-600 transition-colors whitespace-nowrap">
          <span>\${item.text}</span>
          <span class="text-brand-300 opacity-60">✦</span>
        </a>
      \`).join('');
    }

    function applySettingsUI(settings) {
      if (!settings) return;
      if (document.getElementById('nav-brand-name')) document.getElementById('nav-brand-name').textContent = settings.site_name || 'Web Nasir Academy';
      if (document.getElementById('nav-tagline')) document.getElementById('nav-tagline').textContent = settings.tagline || 'AI, Web & Monetization';
      
      const topBar = document.getElementById('top-announcement-bar');
      if (topBar) {
        if (settings.announcement_enabled === false) {
          topBar.classList.add('hidden');
        } else {
          topBar.classList.remove('hidden');
          const aBadge = document.getElementById('announcement-badge');
          const aText = document.getElementById('announcement-text');
          const aLink = document.getElementById('announcement-link');
          if (aBadge) aBadge.textContent = (settings.announcement_badge || 'New 2025 Edition') + ':';
          if (aText) aText.textContent = settings.announcement_text || 'Web Nasir Academy is Live!';
          if (aLink) {
            aLink.textContent = settings.announcement_link_text || 'Explore Courses →';
            aLink.href = settings.announcement_link_url || '#/courses';
          }
        }
      }

      if (settings.whatsapp_number) {
        const cleanWa = settings.whatsapp_number.replace(/[^0-9]/g, '');
        const waLink = document.getElementById('whatsapp-float-link');
        if (waLink) waLink.href = \`https://wa.me/\${cleanWa}?text=Hi%20Nasir,%20I%20am%20interested%20in%20Web%20Nasir%20Academy%20courses%20and%20tools!\`;
      }

      if (settings.footer_text) {
        const fSummary = document.getElementById('footer-summary');
        if (fSummary) fSummary.textContent = settings.footer_text;
      }

      if (settings.social_facebook && document.getElementById('soc-fb')) document.getElementById('soc-fb').href = settings.social_facebook;
      if (settings.social_x && document.getElementById('soc-x')) document.getElementById('soc-x').href = settings.social_x;
      if (settings.social_youtube && document.getElementById('soc-yt')) document.getElementById('soc-yt').href = settings.social_youtube;
      if (settings.social_instagram && document.getElementById('soc-ig')) document.getElementById('soc-ig').href = settings.social_instagram;
      if (settings.social_linkedin && document.getElementById('soc-li')) document.getElementById('soc-li').href = settings.social_linkedin;
    }

    // ==========================================
    // ROUTER
    // ==========================================
    function router() {
      const hash = window.location.hash || '#/';
      const appView = document.getElementById('app-view');
      window.scrollTo(0, 0);

      // Close mobile menu on navigate
      const mobMenu = document.getElementById('mobile-menu');
      if (mobMenu) mobMenu.classList.add('hidden');

      if (hash === '#/' || hash === '#' || hash === '') {
        renderHomeView(appView);
      } else if (hash.startsWith('#/courses/')) {
        const courseId = hash.replace('#/courses/', '').trim();
        renderCourseDetailView(appView, courseId);
      } else if (hash.startsWith('#/courses')) {
        renderCoursesCatalogView(appView);
      } else if (hash.startsWith('#/tracks')) {
        renderCareerTracksView(appView);
      } else if (hash.startsWith('#/student')) {
        renderStudentDashboardView(appView);
      } else if (hash.startsWith('#/tools/')) {
        const toolKey = hash.replace('#/tools/', '').trim();
        renderToolWorkspacePage(appView, toolKey);
      } else if (hash.startsWith('#/tools')) {
        renderToolsDirectoryView(appView);
      } else if (hash.startsWith('#/articles/')) {
        const slug = hash.replace('#/articles/', '').trim();
        renderArticleDetailPage(appView, slug);
      } else if (hash.startsWith('#/articles')) {
        renderArticlesListView(appView);
      } else if (hash === '#/topics') {
        renderTopicsCatalogView(appView);
      } else if (hash === '#/about') {
        renderAboutPageView(appView);
      } else if (hash === '#/contact') {
        renderContactPageView(appView);
      } else {
        renderHomeView(appView);
      }

      lucide.createIcons();
    }

    // ==========================================
    // VIEW 1: PREMIUM HOMEPAGE (ACADEMY WEBOTAPP INSPIRED)
    // ==========================================
    function renderHomeView(container) {
      const s = window.APP_STATE.settings || {};
      const tools = (window.APP_STATE.tools || []).slice(0, 11);
      const courses = (window.APP_STATE.courses || []).slice(0, 8);
      const topics = window.APP_STATE.topics || [];
      const articles = window.APP_STATE.articles || [];
      const testimonials = window.APP_STATE.testimonials || [];

      container.innerHTML = \`
        <!-- SECTION A: HERO SECTION -->
        <section class="relative bg-gradient-to-b from-brand-50/40 via-white to-white pt-12 sm:pt-20 pb-16 sm:pb-24 border-b border-bordercol overflow-hidden">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            
            <!-- Trust Badge Pill -->
            <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/80 text-brand-800 text-xs font-bold mb-6 shadow-xs animate-bounce">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>10+ Years Full-Stack Engineering & High-RPM Digital Publishing</span>
            </div>

            <!-- Hero Headline -->
            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black font-heading text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.12]">
              \${s.hero_title || 'Master AI, Build Digital Skills & Create Your Online Future.'}
            </h1>

            <!-- Hero Subtitle -->
            <p class="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mt-6 leading-relaxed">
              \${s.hero_subtitle || 'Learn practical AI, website development, SEO, digital marketing and online business strategies with Nasir. Access powerful free tools and professional training designed for real-world results.'}
            </p>

            <!-- Hero CTAs -->
            <div class="flex flex-col sm:flex-row items-center justify-center gap-3.5 mt-8">
              <a href="#/courses" class="w-full sm:w-auto gradient-hero-btn text-white font-semibold px-8 py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-600/30">
                <i data-lucide="graduation-cap" class="w-4 h-4"></i>
                <span>Explore Paid Courses</span>
              </a>
              <a href="#/tools" class="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-semibold px-8 py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 transition-all">
                <i data-lucide="sparkles" class="w-4 h-4 text-brand-600"></i>
                <span>Explore 11+ Free AI Tools</span>
              </a>
              <button onclick="openNasirVideoModal()" class="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 transition-all">
                <i data-lucide="play" class="w-4 h-4 fill-white text-white"></i>
                <span>Watch Nasir Intro</span>
              </button>
            </div>

            <!-- Verified Statistics Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto mt-14 pt-10 border-t border-slate-200">
              <div class="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
                <div class="text-2xl sm:text-3xl font-black font-heading text-slate-900">\${s.stat_years || '10+ Yrs'}</div>
                <div class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Engineering Experience</div>
              </div>
              <div class="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
                <div class="text-2xl sm:text-3xl font-black font-heading text-brand-700">\${s.stat_rpm || '$35+'}</div>
                <div class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">AdSense RPM Record</div>
              </div>
              <div class="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
                <div class="text-2xl sm:text-3xl font-black font-heading text-slate-900">\${s.stat_projects || '250+'}</div>
                <div class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Projects Shipped</div>
              </div>
              <div class="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
                <div class="text-2xl sm:text-3xl font-black font-heading text-emerald-600">11 Active</div>
                <div class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Free Webmaster Utilities</div>
              </div>
            </div>

            <!-- Trust Badges Strip -->
            <div class="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 text-xs font-semibold text-slate-500">
              \${(s.trust_badges || []).map(b => \`
                <div class="flex items-center gap-1.5">
                  <i data-lucide="check-circle-2" class="w-3.5 h-3.5 text-emerald-500"></i>
                  <span>\${b}</span>
                </div>
              \`).join('')}
            </div>

          </div>
        </section>

        <!-- SECTION B: NASIR VIDEO PRESENTER INTRODUCTION (Academy WebotApp Inspired) -->
        <section class="py-16 sm:py-20 bg-slate-50 border-b border-bordercol">
          <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="bg-navy rounded-3xl overflow-hidden shadow-2xl border border-slate-800 text-white p-6 sm:p-10 lg:p-12">
              <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                <!-- Left: Content & Script -->
                <div class="lg:col-span-7 space-y-4">
                  <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 border border-brand-400/30 text-brand-300 text-xs font-bold uppercase tracking-wider">
                    <span class="w-2 h-2 rounded-full bg-brand-400 animate-pulse"></span>
                    <span>Founder & Mentor Video Introduction</span>
                  </div>
                  <h2 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading text-white tracking-tight">
                    \${s.video_title || 'Meet Founder Nasir — Web Nasir Academy Mission'}
                  </h2>
                  <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    \${s.video_subtitle || 'Watch Founder Nasir introduce the mission, free AI utilities, and career tracks.'}
                  </p>

                  <div class="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 leading-relaxed italic border-l-4 border-l-brand-500">
                    "\${s.video_script_urdu || s.video_script_english || 'Welcome to Web Nasir Academy. Our focus is 100% practical results and building real software.'}"
                  </div>

                  <div class="flex flex-wrap items-center gap-3 pt-2">
                    <button onclick="openNasirVideoModal()" class="gradient-hero-btn text-white font-semibold px-6 py-3 rounded-xl text-xs flex items-center gap-2 shadow-md">
                      <i data-lucide="play" class="w-4 h-4 fill-white"></i>
                      <span>Watch Full Introduction Video</span>
                    </button>
                    <a href="#/about" class="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-5 py-3 rounded-xl text-xs border border-slate-700 transition-colors">
                      Read Nasir's Biography
                    </a>
                  </div>
                </div>

                <!-- Right: Video Card Thumbnail & Play Trigger -->
                <div class="lg:col-span-5">
                  <div onclick="openNasirVideoModal()" class="group relative aspect-video sm:aspect-4/3 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden cursor-pointer shadow-xl">
                    <!-- Studio Ambient Backing -->
                    <div class="absolute inset-0 bg-gradient-to-tr from-brand-950 via-slate-950 to-indigo-950 flex flex-col items-center justify-center p-6 text-center">
                      <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-brand-600 via-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-xl shadow-brand-600/50 group-hover:scale-110 transition-transform mb-3">
                        <i data-lucide="play" class="w-7 h-7 sm:w-8 sm:h-8 fill-white ml-1"></i>
                      </div>
                      <span class="text-xs font-bold uppercase tracking-wider text-brand-300">Play Video Presenter</span>
                      <span class="text-[11px] text-slate-400 mt-0.5">Assalamu Alaikum • 3 Min Overview</span>
                    </div>

                    <div class="absolute bottom-3 left-3 right-3 p-3 bg-slate-950/80 backdrop-blur-md rounded-xl border border-white/10 flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <div class="w-7 h-7 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center">N</div>
                        <div>
                          <div class="text-xs font-bold text-white">Nasir</div>
                          <div class="text-[10px] text-slate-400">Lead Technical Mentor</div>
                        </div>
                      </div>
                      <span class="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/30">Verified</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        <!-- SECTION C: 11 FREE AI & WEB UTILITIES (Preserved 100% of Functionality) -->
        <section class="py-16 sm:py-24 bg-white border-b border-bordercol">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div class="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div>
                <div class="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 uppercase tracking-wider mb-2">
                  <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
                  <span>Zero-Login Utilities</span>
                </div>
                <h2 class="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
                  Free AI & Webmaster Utilities
                </h2>
                <p class="text-sm text-slate-600 max-w-xl mt-2 leading-relaxed">
                  Interactive generators, calculators, and SEO utilities designed for web developers, content creators, and digital publishers.
                </p>
              </div>

              <!-- Category Filter Controls -->
              <div class="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl" id="tools-category-tabs">
                <button onclick="filterToolsByCategory('all')" class="tool-filter-btn px-3 py-1.5 text-xs font-semibold rounded-lg bg-white text-slate-900 shadow-xs" data-cat="all">All Tools (11)</button>
                <button onclick="filterToolsByCategory('AI Creators')" class="tool-filter-btn px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900" data-cat="AI Creators">AI Creators</button>
                <button onclick="filterToolsByCategory('Monetization')" class="tool-filter-btn px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900" data-cat="Monetization">Monetization</button>
                <button onclick="filterToolsByCategory('SEO & Content')" class="tool-filter-btn px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900" data-cat="SEO & Content">SEO & Content</button>
                <button onclick="filterToolsByCategory('Calculators')" class="tool-filter-btn px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900" data-cat="Calculators">Calculators</button>
              </div>
            </div>

            <!-- Tools Cards Grid -->
            <div id="homepage-tools-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              \${tools.map(t => renderToolTileHtml(t)).join('')}
            </div>

            <div class="text-center mt-12">
              <a href="#/tools" class="inline-flex items-center gap-2 text-xs font-bold text-brand-700 hover:text-brand-900 bg-brand-50 hover:bg-brand-100 px-6 py-3 rounded-xl transition-all">
                <span>View Complete Free Tools Directory (11 Tools)</span>
                <i data-lucide="arrow-right" class="w-4 h-4"></i>
              </a>
            </div>

          </div>
        </section>

        <!-- SECTION D: PAID ACADEMY MASTERCLASSES (Reference Course Section) -->
        <section class="py-16 sm:py-24 bg-slate-50 border-b border-bordercol" id="academy-courses">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div class="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div>
                <div class="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 uppercase tracking-wider mb-2">
                  <i data-lucide="graduation-cap" class="w-3.5 h-3.5"></i>
                  <span>Professional Training Programs</span>
                </div>
                <h2 class="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
                  Paid Courses & Career Masterclasses
                </h2>
                <p class="text-sm text-slate-600 max-w-xl mt-2 leading-relaxed">
                  Rigorous, project-driven curricula designed to transition you into a high-earning developer, AI specialist, or digital publisher.
                </p>
              </div>

              <div class="flex items-center gap-2">
                <a href="#/courses" class="text-xs font-bold text-brand-700 hover:underline flex items-center gap-1">
                  <span>View All 8 Programs</span>
                  <i data-lucide="chevron-right" class="w-4 h-4"></i>
                </a>
              </div>
            </div>

            <!-- Course Cards Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              \${courses.map(c => renderCourseCardHtml(c)).join('')}
            </div>

          </div>
        </section>

        <!-- SECTION E: WHY CHOOSE WEB NASIR ACADEMY (Reference Comparison Style) -->
        <section class="py-16 sm:py-24 bg-white border-b border-bordercol">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center max-w-3xl mx-auto mb-16">
              <div class="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 uppercase tracking-wider mb-2">
                <i data-lucide="shield-check" class="w-3.5 h-3.5"></i>
                <span>The Web Nasir Advantage</span>
              </div>
              <h2 class="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
                Why Learn at Web Nasir Academy?
              </h2>
              <p class="text-sm text-slate-600 mt-2 leading-relaxed">
                Most online academies teach outdated syntax on artificial toy examples. Web Nasir teaches you commercial production systems that earn real revenue.
              </p>
            </div>

            <!-- Comparison Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
              
              <!-- Traditional Training -->
              <div class="p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-lg">✕</div>
                  <div>
                    <h3 class="font-bold font-heading text-base text-slate-900">Traditional Theory & Generic Bootcamps</h3>
                    <p class="text-xs text-slate-500">Outdated curricula & simulated sandbox exercises</p>
                  </div>
                </div>
                <ul class="space-y-3 text-xs text-slate-600 pt-2">
                  <li class="flex items-start gap-2">
                    <span class="text-rose-500 font-bold">✕</span>
                    <span>Basic "To-Do List" tutorial clones that nobody pays money for.</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-rose-500 font-bold">✕</span>
                    <span>Zero lessons on ad layouts, SEO indexing, or traffic monetization.</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-rose-500 font-bold">✕</span>
                    <span>Taught by theoretical instructors who have never deployed live software with paying clients.</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-rose-500 font-bold">✕</span>
                    <span>Expensive multi-thousand dollar fees with zero free utilities provided.</span>
                  </li>
                </ul>
              </div>

              <!-- Web Nasir Academy -->
              <div class="p-8 rounded-3xl bg-gradient-to-br from-brand-900 to-navy border border-brand-800 text-white space-y-4 shadow-xl">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-lg shadow-md">✓</div>
                  <div>
                    <h3 class="font-bold font-heading text-base text-white">Web Nasir Academy</h3>
                    <p class="text-xs text-brand-300">10-Year Production Infrastructure & Real Revenue Systems</p>
                  </div>
                </div>
                <ul class="space-y-3 text-xs text-slate-200 pt-2">
                  <li class="flex items-start gap-2">
                    <span class="text-emerald-400 font-bold">✓</span>
                    <span><strong>100% Practical Production Projects:</strong> Ship live AI utilities and full-stack software.</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-emerald-400 font-bold">✓</span>
                    <span><strong>Real Monetization Physics:</strong> Direct blueprints for $35+ AdSense RPM and Meta video monetization.</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-emerald-400 font-bold">✓</span>
                    <span><strong>Mentored Directly by Nasir:</strong> 10+ years of active engineering and publishing in the trenches.</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-emerald-400 font-bold">✓</span>
                    <span><strong>11+ Free Production Utilities:</strong> Available 24/7 with zero login barrier.</span>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </section>

        <!-- SECTION F: CAREER TRACKS -->
        <section class="py-16 sm:py-24 bg-slate-50 border-b border-bordercol">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center max-w-2xl mx-auto mb-12">
              <div class="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 uppercase tracking-wider mb-2">
                <i data-lucide="compass" class="w-3.5 h-3.5"></i>
                <span>Learning Pathways</span>
              </div>
              <h2 class="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
                Structured Career Pathways
              </h2>
              <p class="text-sm text-slate-600 mt-2">
                Choose a specialized career track with mapped curriculum modules, hands-on projects, and mentoring.
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              \${topics.map(t => \`
                <a href="\${t.link || '#/courses'}" class="gradient-border-card p-6 rounded-3xl border border-slate-200 flex flex-col justify-between group">
                  <div class="space-y-3">
                    <div class="w-11 h-11 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-colors shadow-xs">
                      <i data-lucide="\${t.icon || 'code'}" class="w-5 h-5"></i>
                    </div>
                    <h3 class="text-base font-bold font-heading text-slate-900 group-hover:text-brand-600 transition-colors">\${t.name}</h3>
                    <p class="text-xs text-slate-500 leading-relaxed line-clamp-2">\${t.description}</p>
                  </div>
                  <div class="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-brand-700">
                    <span>Explore Pathway</span>
                    <i data-lucide="arrow-right" class="w-4 h-4 group-hover:translate-x-1 transition-transform"></i>
                  </div>
                </a>
              \`).join('')}
            </div>
          </div>
        </section>

        <!-- SECTION G: GUIDES & TECHNICAL CASE STUDIES -->
        <section class="py-16 sm:py-24 bg-white border-b border-bordercol">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
              <div>
                <div class="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 uppercase tracking-wider mb-2">
                  <i data-lucide="book-open" class="w-3.5 h-3.5"></i>
                  <span>Production Documentation</span>
                </div>
                <h2 class="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
                  Battle-Tested Case Studies
                </h2>
                <p class="text-sm text-slate-600 mt-2">
                  Read Nasir's technical writeups covering real code repositories, high-RPM architectures, and video pacing physics.
                </p>
              </div>
              <a href="#/articles" class="text-xs font-bold text-brand-700 hover:underline flex items-center gap-1">
                <span>View All Articles</span>
                <i data-lucide="chevron-right" class="w-4 h-4"></i>
              </a>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              \${articles.map(a => \`
                <div class="gradient-border-card rounded-3xl border border-slate-200 overflow-hidden flex flex-col justify-between">
                  <div class="p-6 space-y-3">
                    <div class="flex items-center justify-between text-xs text-slate-400">
                      <span class="font-bold text-brand-700 uppercase tracking-wider text-[10px] bg-brand-50 px-2.5 py-0.5 rounded-md">\${(a.tag || 'Guide').toUpperCase()}</span>
                      <span>8 min read</span>
                    </div>
                    <h3 class="text-base font-bold font-heading text-slate-900 leading-snug hover:text-brand-600 transition-colors">
                      <a href="#/articles/\${a.slug}">\${a.title}</a>
                    </h3>
                    <p class="text-xs text-slate-500 leading-relaxed line-clamp-3">\${a.meta}</p>
                  </div>
                  <div class="p-6 pt-0">
                    <a href="#/articles/\${a.slug}" class="text-xs font-bold text-brand-700 hover:text-brand-900 flex items-center gap-1 group">
                      <span>Read Complete Guide</span>
                      <i data-lucide="arrow-right" class="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform"></i>
                    </a>
                  </div>
                </div>
              \`).join('')}
            </div>
          </div>
        </section>

        <!-- SECTION H: VERIFIED STUDENT & MENTEE REVIEWS (Reference Style) -->
        <section class="py-16 sm:py-24 bg-slate-50 border-b border-bordercol">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center max-w-2xl mx-auto mb-14">
              <div class="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 uppercase tracking-wider mb-2">
                <i data-lucide="star" class="w-3.5 h-3.5 fill-amber-400 text-amber-400"></i>
                <span>Alumni Transformations</span>
              </div>
              <h2 class="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
                Real Career Transformations
              </h2>
              <p class="text-sm text-slate-600 mt-2">
                Honest feedback from students and digital creators who studied with Nasir.
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              \${testimonials.map(t => \`
                <div class="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4 hover:border-brand-300 transition-all">
                  <div class="space-y-3">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center text-amber-400">
                        \${Array(t.rating || 5).fill('<i data-lucide="star" class="w-3.5 h-3.5 fill-amber-400 text-amber-400"></i>').join('')}
                      </div>
                      \${t.has_video ? \`<span class="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full flex items-center gap-1"><i data-lucide="video" class="w-3 h-3"></i> Video Review</span>\` : ''}
                    </div>
                    <p class="text-xs text-slate-600 leading-relaxed italic">"\${t.content}"</p>
                  </div>
                  <div class="pt-4 border-t border-slate-100 flex items-center gap-3">
                    <div class="w-9 h-9 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      \${t.name[0]}
                    </div>
                    <div class="min-w-0">
                      <h4 class="text-xs font-bold text-slate-900 truncate">\${t.name}</h4>
                      <p class="text-[10px] text-slate-500 truncate">\${t.role}</p>
                    </div>
                  </div>
                </div>
              \`).join('')}
            </div>
          </div>
        </section>

        <!-- SECTION I: FINAL CTA BANNER -->
        <section class="py-16 sm:py-20 bg-gradient-to-tr from-brand-950 via-navy to-slate-950 text-white relative overflow-hidden">
          <div class="max-w-4xl mx-auto px-4 text-center relative z-10 space-y-6">
            <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black font-heading tracking-tight">
              Your Digital Future Starts with Web Nasir Academy.
            </h2>
            <p class="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
              Stop consuming fragmented theory. Join our project-based academy, master modern AI utilities, and build real online revenue.
            </p>
            <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <a href="#/courses" class="w-full sm:w-auto gradient-hero-btn text-white font-semibold px-8 py-3.5 rounded-2xl text-sm shadow-xl shadow-brand-600/40">
                Explore Paid Courses
              </a>
              <a href="#/tools" class="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white font-semibold px-8 py-3.5 rounded-2xl text-sm border border-slate-700 transition-colors">
                Explore Free AI Tools
              </a>
              <a href="#/contact" class="w-full sm:w-auto text-brand-300 hover:text-white font-semibold px-6 py-3.5 text-sm underline">
                Contact Nasir Directly &rarr;
              </a>
            </div>
          </div>
        </section>
      \`;

      renderMarqueeTrack();
    }

    // --- TOOL TILE HTML RENDERER ---
    function renderToolTileHtml(tool) {
      const iconMap = {
        youtube: 'video',
        blogoutline: 'file-text',
        codeexplainer: 'code',
        adcopy: 'sparkles',
        business: 'dollar-sign',
        name: 'sparkles',
        instagram: 'hash',
        wordcount: 'file-text',
        password: 'shield-check',
        age: 'calendar',
        arbitrage: 'trending-up',
      };
      const icon = tool.icon || iconMap[tool.key] || 'wrench';

      return \`
        <div class="tool-tile gradient-border-card p-6 rounded-3xl border border-slate-200 flex flex-col justify-between group" data-category="\${tool.category || 'AI Creators'}">
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div class="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-all shadow-xs">
                <i data-lucide="\${icon}" class="w-6 h-6"></i>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">Free Tool</span>
                \${tool.badge ? \`<span class="text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200/60">\${tool.badge}</span>\` : ''}
              </div>
            </div>

            <div>
              <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">\${tool.category || 'AI Creators'}</div>
              <h3 class="text-base font-bold font-heading text-slate-900 group-hover:text-brand-600 transition-colors leading-snug">
                \${tool.name}
              </h3>
              <p class="text-xs text-slate-600 leading-relaxed mt-2 line-clamp-3">
                \${tool.description}
              </p>
            </div>
          </div>

          <div class="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
            <span class="text-[11px] font-medium text-slate-400">Zero Login Required</span>
            <a href="#/tools/\${tool.key}" class="gradient-hero-btn text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs">
              <span>Launch Tool</span>
              <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
            </a>
          </div>
        </div>
      \`;
    }

    // --- COURSE CARD HTML RENDERER ---
    function renderCourseCardHtml(c) {
      return \`
        <div class="gradient-border-card rounded-3xl border border-slate-200/90 overflow-hidden flex flex-col justify-between group bg-white shadow-xs">
          <div>
            <!-- Banner / Badge Header -->
            <div class="p-5 bg-gradient-to-br from-brand-900 to-navy text-white relative">
              <div class="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider">
                <span class="px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-xs text-white">\${c.badge || 'Popular'}</span>
                <span class="text-brand-300">\${c.level || 'All Levels'}</span>
              </div>
              <h3 class="text-base font-bold font-heading text-white mt-3 leading-snug line-clamp-2">
                \${c.title}
              </h3>
              <div class="flex items-center gap-3 text-[11px] text-slate-300 mt-2">
                <span>⏱ \${c.duration || '6 Weeks'}</span>
                <span>•</span>
                <span>📚 \${c.modules_count || 24} Modules</span>
              </div>
            </div>

            <div class="p-5 space-y-3">
              <p class="text-xs text-slate-600 leading-relaxed line-clamp-2">\${c.subtitle}</p>

              <!-- Features checklist -->
              <div class="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                \${(c.features || []).slice(0, 3).map(f => \`
                  <div class="flex items-center gap-1.5 text-[11px]">
                    <i data-lucide="check" class="w-3.5 h-3.5 text-emerald-500 shrink-0"></i>
                    <span class="truncate">\${f}</span>
                  </div>
                \`).join('')}
              </div>
            </div>
          </div>

          <div class="p-5 pt-0 border-t border-slate-100 mt-2">
            <div class="flex items-center justify-between mb-3 pt-3">
              <div>
                <span class="text-lg font-black text-slate-900">₹\${(c.price || 2999).toLocaleString()}</span>
                <span class="text-xs line-through text-slate-400 ml-1">₹\${(c.original_price || 7999).toLocaleString()}</span>
              </div>
              <span class="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">Save 60%+</span>
            </div>

            <a href="#/courses/\${c.id}" class="w-full gradient-hero-btn text-white text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-xs">
              <span>View Curriculum & Enroll</span>
              <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
            </a>
          </div>
        </div>
      \`;
    }

    // Category Filter Handler for Homepage Tools
    window.filterToolsByCategory = function(cat) {
      document.querySelectorAll('.tool-filter-btn').forEach(btn => {
        if (btn.dataset.cat === cat) {
          btn.className = 'tool-filter-btn px-3 py-1.5 text-xs font-semibold rounded-lg bg-white text-slate-900 shadow-xs';
        } else {
          btn.className = 'tool-filter-btn px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900';
        }
      });

      document.querySelectorAll('.tool-tile').forEach(tile => {
        if (cat === 'all' || tile.dataset.category === cat) {
          tile.style.display = '';
        } else {
          tile.style.display = 'none';
        }
      });
    };

    // ==========================================
    // VIEW 2: COURSES CATALOG PAGE (#/courses)
    // ==========================================
    function renderCoursesCatalogView(container) {
      const courses = window.APP_STATE.courses || [];

      container.innerHTML = \`
        <div class="bg-gradient-to-b from-brand-50/50 via-white to-white py-14 border-b border-bordercol text-center">
          <div class="max-w-4xl mx-auto px-4">
            <div class="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 uppercase tracking-wider mb-2">
              <i data-lucide="graduation-cap" class="w-3.5 h-3.5"></i>
              <span>Web Nasir Academy Programs</span>
            </div>
            <h1 class="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
              Paid Masterclasses & Professional Training
            </h1>
            <p class="text-sm text-slate-600 max-w-2xl mx-auto mt-2">
              Transform into a production-grade software engineer, AI specialist, or high-income digital publisher with 1-on-1 mentorship from Nasir.
            </p>

            <div class="max-w-md mx-auto mt-6">
              <input id="courses-search-input" oninput="filterCoursesDirectoryLive()" type="text" placeholder="Search courses by keyword or skill..." class="w-full px-4 py-3 bg-white border border-bordercol rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs">
            </div>
          </div>
        </div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div id="courses-catalog-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            \${courses.map(c => renderCourseCardHtml(c)).join('')}
          </div>
        </div>
      \`;

      lucide.createIcons();
    }

    window.filterCoursesDirectoryLive = function() {
      const q = (document.getElementById('courses-search-input').value || '').toLowerCase();
      document.querySelectorAll('#courses-catalog-grid > div').forEach(card => {
        card.style.display = card.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    };

    // ==========================================
    // VIEW 3: COURSE DETAIL PAGE (#/courses/:id)
    // ==========================================
    function renderCourseDetailView(container, courseId) {
      const c = (window.APP_STATE.courses || []).find(x => x.id === courseId) || (window.APP_STATE.courses || [])[0];
      if (!c) {
        container.innerHTML = '<div class="py-24 text-center">Course not found. <a href="#/courses" class="text-brand-600 underline">Browse courses</a></div>';
        return;
      }

      container.innerHTML = \`
        <!-- Course Header -->
        <div class="bg-navy text-white py-16 border-b border-slate-800">
          <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <a href="#/courses" class="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-300 hover:text-white mb-6">
              <i data-lucide="arrow-left" class="w-4 h-4"></i>
              <span>Back to all courses</span>
            </a>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div class="lg:col-span-8 space-y-4">
                <div class="flex items-center gap-2">
                  <span class="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-brand-500 text-white">\${c.badge || 'Program'}</span>
                  <span class="text-xs text-brand-300">\${c.category}</span>
                </div>
                <h1 class="text-3xl sm:text-4xl font-extrabold font-heading text-white tracking-tight leading-snug">
                  \${c.title}
                </h1>
                <p class="text-sm text-slate-300 leading-relaxed max-w-2xl">
                  \${c.subtitle}
                </p>

                <div class="flex flex-wrap items-center gap-6 pt-2 text-xs text-slate-300">
                  <div class="flex items-center gap-2">
                    <i data-lucide="clock" class="w-4 h-4 text-brand-400"></i>
                    <span>Duration: \${c.duration || '8 Weeks'}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <i data-lucide="book-open" class="w-4 h-4 text-brand-400"></i>
                    <span>Modules: \${c.modules_count || 32} Lessons</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <i data-lucide="user" class="w-4 h-4 text-brand-400"></i>
                    <span>Instructor: Nasir (10+ Yrs Exp)</span>
                  </div>
                </div>
              </div>

              <!-- Sticky Enroll Box -->
              <div class="lg:col-span-4 bg-white text-slate-900 p-6 rounded-3xl border border-slate-200 shadow-2xl space-y-4">
                <div class="flex items-baseline justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span class="text-3xl font-black text-slate-900">₹\${(c.price || 4999).toLocaleString()}</span>
                    <span class="text-sm line-through text-slate-400 ml-1.5">₹\${(c.original_price || 12999).toLocaleString()}</span>
                  </div>
                  <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">Save 60%+</span>
                </div>

                <button onclick="openCourseCheckoutModal('\${c.id}')" class="w-full gradient-hero-btn text-white font-semibold py-3.5 rounded-xl text-sm shadow-md flex items-center justify-center gap-2">
                  <i data-lucide="shield-check" class="w-4 h-4"></i>
                  <span>Enroll in Masterclass</span>
                </button>

                <div class="text-[11px] text-slate-500 space-y-1.5 pt-2">
                  <div class="flex items-center gap-2"><i data-lucide="check" class="w-3.5 h-3.5 text-emerald-500"></i><span>Instant LMS Access</span></div>
                  <div class="flex items-center gap-2"><i data-lucide="check" class="w-3.5 h-3.5 text-emerald-500"></i><span>1-on-1 Code Reviews with Nasir</span></div>
                  <div class="flex items-center gap-2"><i data-lucide="check" class="w-3.5 h-3.5 text-emerald-500"></i><span>Official Web Nasir Certificate</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Curriculum & Details Section -->
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div class="lg:col-span-8 space-y-10">
              
              <!-- Program Overview -->
              <div class="space-y-4">
                <h2 class="text-2xl font-bold font-heading text-slate-900">Program Overview</h2>
                <p class="text-sm text-slate-700 leading-relaxed">
                  \${c.overview || 'This course is crafted to give you production-grade, commercial web engineering and AI skills. Every lesson focuses on live code, real monetization models, and battle-tested architectures.'}
                </p>
              </div>

              <!-- Interactive Curriculum Breakdown -->
              <div class="space-y-4">
                <h2 class="text-2xl font-bold font-heading text-slate-900">Interactive Curriculum Breakdown</h2>
                <div class="space-y-3">
                  \${(c.curriculum || []).map((m, idx) => \`
                    <div class="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                      <div class="p-4 bg-slate-50/80 font-bold text-xs text-slate-900 flex items-center justify-between">
                        <span>\${m.module}</span>
                        <span class="text-[10px] text-slate-400 font-normal">\${(m.lessons || []).length} Lessons</span>
                      </div>
                      <div class="divide-y divide-slate-100 p-2">
                        \${(m.lessons || []).map(l => \`
                          <div class="py-2 px-3 text-xs text-slate-700 flex items-center gap-2">
                            <i data-lucide="play-circle" class="w-3.5 h-3.5 text-brand-600 shrink-0"></i>
                            <span>\${l}</span>
                          </div>
                        \`).join('')}
                      </div>
                    </div>
                  \`).join('')}
                </div>
              </div>

            </div>

            <!-- Sidebar Info -->
            <div class="lg:col-span-4 space-y-6">
              <div class="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
                <h3 class="font-bold font-heading text-sm text-slate-900">Instructor Profile</h3>
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-2xl bg-brand-600 text-white font-bold text-base flex items-center justify-center">N</div>
                  <div>
                    <h4 class="text-sm font-bold text-slate-900">Nasir</h4>
                    <p class="text-xs text-slate-500">10+ Years Senior Engineer</p>
                  </div>
                </div>
                <p class="text-xs text-slate-600 leading-relaxed">
                  Founder of Web Nasir. Architect of high-RPM AdSense systems, publisher of viral digital assets, and developer of production React & serverless applications.
                </p>
              </div>
            </div>
          </div>
        </div>
      \`;

      lucide.createIcons();
    }

    // ==========================================
    // VIEW 4: CAREER TRACKS (#/tracks)
    // ==========================================
    function renderCareerTracksView(container) {
      const tracks = [
        {
          title: 'AI Specialist & Micro-SaaS Architect',
          desc: 'Build lightweight, autonomous AI utilities, fine-tune system prompts, integrate Gemini and LLM APIs, and deploy serverless revenue engines.',
          duration: '8 Weeks',
          target_salary: '$40,000 - $80,000 / Freelance $60/hr',
          skills: ['Gemini 2.5 Flash', 'Prompt Engineering', 'Serverless Functions', 'Micro-SaaS Monetization'],
          course_id: 'complete-ai-mastery',
        },
        {
          title: 'Full-Stack Web Engineering Specialist',
          desc: 'Master production full-stack web applications with React 19, TypeScript, Express, PostgreSQL, and high-performance Jamstack builds.',
          duration: '10 Weeks',
          target_salary: '$50,000 - $95,000 / High-Value Contracts',
          skills: ['React 19', 'TypeScript', 'Node.js', 'Docker & VPS Management'],
          course_id: 'fullstack-web-dev',
        },
        {
          title: 'SEO Architect & High-RPM Publisher',
          desc: 'Master topical clustering, Core Web Vitals, AdSense ad viewability engineering, and traffic arbitrage systems that yield $35+ RPM.',
          duration: '8 Weeks',
          target_salary: '$5,000 - $15,000/mo Digital Publishing Revenue',
          skills: ['Google AdSense High RPM', 'Semantic Search', 'Arbitrage Physics', 'Core Web Vitals'],
          course_id: 'adsense-blogging',
        },
        {
          title: 'Digital Marketing & Performance Media Buyer',
          desc: 'Scale high-intent Meta and Google ad campaigns, engineer high-converting landing pages, and implement server-side tracking (CAPI).',
          duration: '6 Weeks',
          target_salary: '$45,000 - $75,000 / ROAS Retainers',
          skills: ['Meta Ads CAPI', 'Funnel Optimization', 'Creative Hook Testing', 'ROAS Scaling'],
          course_id: 'digital-marketing-ai',
        }
      ];

      container.innerHTML = \`
        <div class="bg-gradient-to-b from-brand-50/50 via-white to-white py-14 border-b border-bordercol text-center">
          <div class="max-w-4xl mx-auto px-4">
            <div class="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 uppercase tracking-wider mb-2">
              <i data-lucide="compass" class="w-3.5 h-3.5"></i>
              <span>Curated Career Pathways</span>
            </div>
            <h1 class="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
              Outcome-Driven Career Tracks
            </h1>
            <p class="text-sm text-slate-600 max-w-2xl mx-auto mt-2">
              Structured roadmaps combining practical project training, free utility exercises, and personal mentorship.
            </p>
          </div>
        </div>

        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
          \${tracks.map(t => \`
            <div class="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div class="space-y-3 max-w-2xl">
                <div class="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-md">
                  <span>⏱ \${t.duration}</span>
                  <span>•</span>
                  <span>Target: \${t.target_salary}</span>
                </div>
                <h3 class="text-xl font-bold font-heading text-slate-900">\${t.title}</h3>
                <p class="text-xs text-slate-600 leading-relaxed">\${t.desc}</p>
                <div class="flex flex-wrap gap-2 pt-1">
                  \${t.skills.map(s => \`<span class="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">\${s}</span>\`).join('')}
                </div>
              </div>
              <a href="#/courses/\${t.course_id}" class="gradient-hero-btn text-white text-xs font-semibold px-6 py-3 rounded-xl flex items-center justify-center gap-2 whitespace-nowrap self-start md:self-auto">
                <span>View Track Syllabus</span>
                <i data-lucide="arrow-right" class="w-4 h-4"></i>
              </a>
            </div>
          \`).join('')}
        </div>
      \`;

      lucide.createIcons();
    }

    // ==========================================
    // VIEW 5: STUDENT DASHBOARD (#/student)
    // ==========================================
    async function renderStudentDashboardView(container) {
      container.innerHTML = \`
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div class="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <h1 class="text-2xl font-bold font-heading text-slate-900">Student Learning Dashboard</h1>
                <p class="text-xs text-slate-500 mt-1">Access your enrolled masterclasses, lesson progress, and saved generations.</p>
              </div>
              <div id="student-auth-badge">
                <!-- Auth status -->
              </div>
            </div>

            <!-- Enrolled Courses Section -->
            <div class="space-y-4">
              <h2 class="text-lg font-bold font-heading text-slate-900">My Enrolled Courses</h2>
              <div id="enrolled-courses-list" class="space-y-4">
                <p class="text-xs text-slate-400 py-6 text-center">Loading student records...</p>
              </div>
            </div>

            <!-- Quick Bookmarks -->
            <div class="pt-6 border-t border-slate-100 flex items-center justify-between">
              <div>
                <h3 class="text-sm font-bold text-slate-900">Saved AI Tool Generations</h3>
                <p class="text-xs text-slate-500">Access prompts and outputs saved from free tools</p>
              </div>
              <button onclick="openSavedModal()" class="gradient-hero-btn text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5">
                <i data-lucide="bookmark" class="w-3.5 h-3.5"></i>
                <span>Open Saved Items</span>
              </button>
            </div>
          </div>
        </div>
      \`;

      lucide.createIcons();

      // Check current user or fetch student courses
      const email = window.APP_STATE.currentUser?.email || localStorage.getItem('webnasir_student_email');
      const listEl = document.getElementById('enrolled-courses-list');

      if (!email) {
        listEl.innerHTML = \`
          <div class="p-8 text-center rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <i data-lucide="lock" class="w-8 h-8 text-slate-400 mx-auto"></i>
            <h3 class="text-sm font-bold text-slate-800">Student Authentication Required</h3>
            <p class="text-xs text-slate-500 max-w-sm mx-auto">Please sign in with Google or enter your enrolled student email to view your course player and progress.</p>
            <div class="flex items-center justify-center gap-3 pt-2">
              <button onclick="handleGoogleSignIn()" class="gradient-hero-btn text-white text-xs font-semibold px-4 py-2.5 rounded-xl">Sign in with Google</button>
            </div>
          </div>
        \`;
        lucide.createIcons();
        return;
      }

      const enrolled = await apiFetch(\`/student/courses?email=\${encodeURIComponent(email)}\`);
      if (Array.isArray(enrolled) && enrolled.length > 0) {
        listEl.innerHTML = enrolled.map(e => \`
          <div class="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">\${e.status || 'Active'}</span>
                <span class="text-xs text-slate-400">Enrolled: \${new Date(e.enrolled_at || Date.now()).toLocaleDateString()}</span>
              </div>
              <h3 class="text-base font-bold text-slate-900">\${e.course_title}</h3>
              <div class="text-xs text-slate-500">Progress: <strong>\${e.progress_pct || 0}%</strong> Completed</div>
            </div>
            <a href="#/courses/\${e.course_id}" class="gradient-hero-btn text-white text-xs font-semibold px-5 py-2.5 rounded-xl flex items-center justify-center gap-1.5 self-start sm:self-auto">
              <span>Continue Learning</span>
              <i data-lucide="play" class="w-3.5 h-3.5 fill-white"></i>
            </a>
          </div>
        \`).join('');
      } else {
        listEl.innerHTML = \`
          <div class="p-8 text-center rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <i data-lucide="book-open" class="w-8 h-8 text-slate-400 mx-auto"></i>
            <h3 class="text-sm font-bold text-slate-800">No Enrolled Courses Found for \${email}</h3>
            <p class="text-xs text-slate-500">Browse our 8 academy masterclasses and enroll to start learning.</p>
            <a href="#/courses" class="inline-block gradient-hero-btn text-white text-xs font-semibold px-4 py-2 rounded-xl mt-2">Browse Courses</a>
          </div>
        \`;
      }
      lucide.createIcons();
    }

    // ==========================================
    // VIEW 6: ABOUT PAGE (#/about)
    // ==========================================
    function renderAboutPageView(container) {
      container.innerHTML = \`
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
          
          <div class="text-center space-y-4">
            <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-bold">
              <span>10+ Years in Full-Stack Web & Digital Publishing</span>
            </div>
            <h1 class="text-3xl sm:text-5xl font-black font-heading text-slate-900 tracking-tight">
              About Founder Nasir & Web Nasir Academy
            </h1>
            <p class="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              No academic fluff. Everything taught in this academy is extracted directly from production repositories, commercial ad accounts, and high-RPM digital publishing systems.
            </p>
          </div>

          <!-- Video Introduction Embed -->
          <div class="p-8 rounded-3xl bg-navy text-white space-y-6 shadow-xl border border-slate-800">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-bold font-heading text-white">Nasir's Video Presentation</h3>
                <p class="text-xs text-brand-300">Watch the founder introduction and philosophy</p>
              </div>
              <button onclick="openNasirVideoModal()" class="gradient-hero-btn text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md">
                <i data-lucide="play" class="w-4 h-4 fill-white"></i>
                <span>Play Video Presenter</span>
              </button>
            </div>
          </div>

          <!-- Biography & Principles -->
          <div class="prose max-w-none text-slate-700 text-sm leading-relaxed space-y-6">
            <h2 class="text-xl font-bold font-heading text-slate-900">The 10-Year Journey</h2>
            <p>
              Over the last decade, I have built web applications that processed millions of requests, directed traffic to AdSense accounts generating over $35 RPM, and helped dozens of developers transition into self-employed digital builders.
            </p>
            <p>
              When I started in web development, information was scarce, full of broken tutorials, and dominated by theoretical coursework that had zero relevance to earning a living online. Web Nasir Academy was created to be the platform I wished I had 10 years ago: 100% practical, zero-fluff, commercial code with direct mentorship.
            </p>

            <h2 class="text-xl font-bold font-heading text-slate-900">Core Academy Principles</h2>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 not-prose pt-2">
              <div class="p-5 rounded-2xl bg-surface border border-slate-200 space-y-2">
                <h4 class="font-bold text-slate-900 text-xs uppercase tracking-wider">1. Production Code First</h4>
                <p class="text-xs text-slate-600 leading-relaxed">No toy calculators or basic to-do lists. We build real full-stack systems and serverless AI utilities.</p>
              </div>
              <div class="p-5 rounded-2xl bg-surface border border-slate-200 space-y-2">
                <h4 class="font-bold text-slate-900 text-xs uppercase tracking-wider">2. Real Unit Economics</h4>
                <p class="text-xs text-slate-600 leading-relaxed">Code must create value. We teach AdSense viewability, Meta video monetization, and customer acquisition.</p>
              </div>
              <div class="p-5 rounded-2xl bg-surface border border-slate-200 space-y-2">
                <h4 class="font-bold text-slate-900 text-xs uppercase tracking-wider">3. Free Utilities for All</h4>
                <p class="text-xs text-slate-600 leading-relaxed">Our 11 AI utilities remain 100% free and open to empower creators and webmasters worldwide.</p>
              </div>
            </div>
          </div>

          <!-- Contact Nasir Direct -->
          <div class="p-8 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div>
              <h3 class="text-lg font-bold font-heading text-slate-900">Have Questions or Want 1-on-1 Consulting?</h3>
              <p class="text-xs text-slate-600 mt-1">Connect with Nasir directly on WhatsApp or Email for course queries or code audits.</p>
            </div>
            <div class="flex items-center gap-3">
              <a href="https://wa.me/917006334417" target="_blank" class="gradient-hero-btn text-white text-xs font-semibold px-5 py-3 rounded-xl flex items-center gap-1.5 shadow-md">
                <i data-lucide="message-circle" class="w-4 h-4"></i>
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

        </div>
      \`;

      lucide.createIcons();
    }

    // ==========================================
    // VIEW 7: CONTACT PAGE (#/contact)
    // ==========================================
    function renderContactPageView(container) {
      container.innerHTML = \`
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
          
          <div class="text-center space-y-4">
            <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-bold">
              <span>Direct Admissions & Consulting</span>
            </div>
            <h1 class="text-3xl sm:text-5xl font-black font-heading text-slate-900 tracking-tight">
              Get in Touch with Nasir
            </h1>
            <p class="text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
              Have questions about our paid masterclasses, custom AI utility development, or AdSense auditing? Send a message below.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            <!-- Contact Info Sidebar -->
            <div class="md:col-span-5 space-y-6">
              <div class="p-6 rounded-3xl bg-navy text-white space-y-4 shadow-xl">
                <h3 class="font-bold font-heading text-base text-white">Contact Information</h3>
                <div class="space-y-3 text-xs text-slate-300">
                  <p class="flex items-center gap-2.5">
                    <i data-lucide="mail" class="w-4 h-4 text-brand-400"></i>
                    <a href="mailto:hello@webnasir.com" class="hover:underline">hello@webnasir.com</a>
                  </p>
                  <p class="flex items-center gap-2.5">
                    <i data-lucide="phone" class="w-4 h-4 text-emerald-400"></i>
                    <a href="https://wa.me/917006334417" class="hover:underline text-emerald-300 font-bold">+91 7006334417</a>
                  </p>
                  <p class="flex items-center gap-2.5">
                    <i data-lucide="clock" class="w-4 h-4 text-amber-400"></i>
                    <span>Response Time: Under 12 Hours</span>
                  </p>
                </div>

                <div class="pt-4 border-t border-slate-800 text-[11px] text-slate-400">
                  Available for technical consultations, code reviews, and enterprise AdSense layout optimization.
                </div>
              </div>
            </div>

            <!-- Contact Form -->
            <div class="md:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
              <form onsubmit="handleContactSubmit(event)" class="space-y-4">
                <div>
                  <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Your Full Name</label>
                  <input id="contact-name" type="text" required placeholder="e.g. Babidul Hassan" class="w-full px-4 py-2.5 bg-surface border border-bordercol rounded-xl text-sm font-medium">
                </div>

                <div>
                  <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Email Address</label>
                  <input id="contact-email" type="email" required placeholder="you@example.com" class="w-full px-4 py-2.5 bg-surface border border-bordercol rounded-xl text-sm font-medium">
                </div>

                <div>
                  <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Inquiry Subject</label>
                  <input id="contact-subject" type="text" required placeholder="e.g. Course Enrollment or AdSense Audit" class="w-full px-4 py-2.5 bg-surface border border-bordercol rounded-xl text-sm font-medium">
                </div>

                <div>
                  <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Your Message</label>
                  <textarea id="contact-message" rows="4" required placeholder="How can Nasir help your engineering or digital publishing journey?" class="w-full px-4 py-2.5 bg-surface border border-bordercol rounded-xl text-sm font-medium leading-relaxed"></textarea>
                </div>

                <button id="contact-submit-btn" type="submit" class="w-full gradient-hero-btn text-white font-semibold py-3.5 rounded-xl text-sm shadow-md flex items-center justify-center gap-2">
                  <i data-lucide="send" class="w-4 h-4"></i>
                  <span>Send Message to Nasir</span>
                </button>
              </form>
            </div>

          </div>
        </div>
      \`;

      lucide.createIcons();
    }

    window.handleContactSubmit = async function(e) {
      e.preventDefault();
      const btn = document.getElementById('contact-submit-btn');
      btn.disabled = true;
      btn.innerHTML = '<span>Sending message...</span>';

      const payload = {
        name: document.getElementById('contact-name').value,
        email: document.getElementById('contact-email').value,
        subject: document.getElementById('contact-subject').value,
        message: document.getElementById('contact-message').value,
      };

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok) {
          showToast(data.message || 'Message sent successfully!', 'success');
          e.target.reset();
        } else {
          showToast(data.error || 'Failed to send message', 'error');
        }
      } catch (err) {
        showToast('Connection error: ' + err.message, 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i data-lucide="send" class="w-4 h-4"></i><span>Send Message to Nasir</span>';
        lucide.createIcons();
      }
    };

    // ==========================================
    // VIEW 8: TOOLS DIRECTORY (#/tools)
    // ==========================================
    function renderToolsDirectoryView(container) {
      const tools = window.APP_STATE.tools || [];

      container.innerHTML = \`
        <div class="bg-gradient-to-b from-brand-50/50 via-white to-white py-14 border-b border-bordercol text-center">
          <div class="max-w-4xl mx-auto px-4">
            <div class="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 uppercase tracking-wider mb-2">
              <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
              <span>Free Webmaster Suite</span>
            </div>
            <h1 class="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
              11+ Free AI Utilities & Calculators
            </h1>
            <p class="text-muted text-base max-w-2xl mx-auto mt-3">
              Lightweight, zero-login interactive utilities built for instant calculations, viral hooks, SEO analysis, and social media growth.
            </p>

            <div class="max-w-md mx-auto mt-6">
              <input id="tools-search-input" oninput="filterToolsDirectoryLive()" type="text" placeholder="Search by tool name or function..." class="w-full px-4 py-3 bg-white border border-bordercol rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs">
            </div>
          </div>
        </div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div id="tools-directory-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            \${tools.map(t => renderToolTileHtml(t)).join('')}
          </div>
        </div>
      \`;

      lucide.createIcons();
    }

    window.filterToolsDirectoryLive = function() {
      const q = (document.getElementById('tools-search-input').value || '').toLowerCase();
      document.querySelectorAll('.tool-tile').forEach(tile => {
        tile.style.display = tile.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    };

    // ==========================================
    // VIEW 9: DEDICATED TOOL WORKSPACES
    // ==========================================
    function renderToolWorkspacePage(container, key) {
      const tool = (window.APP_STATE.tools || []).find(t => t.key === key) || { name: key, description: '' };

      container.innerHTML = \`
        <div class="bg-surface py-8 border-b border-bordercol">
          <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <a href="#/tools" class="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-800">
              <i data-lucide="arrow-left" class="w-4 h-4"></i>
              <span>Back to all tools</span>
            </a>
            <div class="flex items-center gap-2">
              <span class="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">100% Free Tool</span>
              <button onclick="openSavedModal()" class="text-xs font-semibold text-slate-600 hover:text-brand-600 flex items-center gap-1">
                <i data-lucide="bookmark" class="w-3.5 h-3.5"></i>
                <span class="hidden sm:inline">My Saved Results</span>
              </button>
            </div>
          </div>
        </div>

        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div id="tool-interactive-container" class="bg-white rounded-3xl border border-bordercol p-6 sm:p-10 shadow-lg">
            <!-- Tool Injected Here -->
          </div>
        </div>
      \`;

      const target = document.getElementById('tool-interactive-container');

      switch (key) {
        case 'youtube':
          mountAiYoutubeTool(target);
          break;
        case 'blogoutline':
          mountAiBlogOutlineTool(target);
          break;
        case 'codeexplainer':
          mountAiCodeTool(target);
          break;
        case 'adcopy':
          mountAiAdCopyTool(target);
          break;
        case 'age':
          mountAgeCalculator(target);
          break;
        case 'name':
          mountNameGenerator(target);
          break;
        case 'business':
          mountBusinessCalculator(target);
          break;
        case 'instagram':
          mountInstagramGenerator(target);
          break;
        case 'password':
          mountPasswordGenerator(target);
          break;
        case 'wordcount':
          mountWordCounter(target);
          break;
        case 'arbitrage':
          mountArbitrageCalculator(target);
          break;
        default:
          mountCustomAiTool(target, tool);
      }

      lucide.createIcons();
    }

    // --- AI TOOL 1: YOUTUBE TITLE & RETENTION HOOK ---
    function mountAiYoutubeTool(el) {
      el.innerHTML = \`
        <div class="max-w-2xl mx-auto">
          <div class="text-center mb-8">
            <div class="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <i data-lucide="video" class="w-6 h-6"></i>
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold font-heading text-dark">AI Viral YouTube Title & Hook Crafter</h2>
            <p class="text-xs text-muted mt-1">Generate 5 viral, high-CTR titles, 30-second retention hooks, and thumbnail concepts.</p>
          </div>

          <div class="bg-surface p-6 rounded-2xl border border-bordercol mb-8 space-y-4">
            <div>
              <label class="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-2">Video Topic / Core Idea</label>
              <input id="yt-topic" type="text" value="How I Made $5,000 with AI Micro-SaaS" placeholder="e.g. Google AdSense high RPM, learning python in 30 days" class="w-full px-4 py-3 bg-white border border-bordercol rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium">
            </div>
            <div>
              <label class="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-2">Audience Tone</label>
              <select id="yt-tone" class="w-full px-4 py-2.5 bg-white border border-bordercol rounded-xl text-sm font-medium">
                <option value="Curious & Intriguing">Curious & Intriguing (Highest CTR)</option>
                <option value="Urgent & Contrarian">Urgent & Contrarian ("Stop doing this")</option>
                <option value="Educational & Authoritative">Educational & Authoritative</option>
              </select>
            </div>
            <button id="yt-submit-btn" onclick="executeAiTool('ai_youtube', 'yt-topic', 'yt-tone', 'yt-output', 'AI YouTube Title Crafter')" class="w-full gradient-hero-btn text-white font-semibold py-3.5 rounded-xl text-sm shadow-md flex items-center justify-center gap-2">
              <i data-lucide="sparkles" class="w-4 h-4"></i>
              <span>Generate Viral Titles & Retention Hooks</span>
            </button>
          </div>

          <div id="yt-output" class="hidden space-y-4"></div>
        </div>
      \`;
    }

    // --- AI TOOL 2: SEO BLOG OUTLINE & KEYWORDS ---
    function mountAiBlogOutlineTool(el) {
      el.innerHTML = \`
        <div class="max-w-2xl mx-auto">
          <div class="text-center mb-8">
            <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <i data-lucide="file-text" class="w-6 h-6"></i>
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold font-heading text-dark">AI SEO Blog Outline & Keyword Strategist</h2>
            <p class="text-xs text-muted mt-1">Structure intent-driven H2/H3 article hierarchies and high-CPC keywords to rank fast.</p>
          </div>

          <div class="bg-surface p-6 rounded-2xl border border-bordercol mb-8 space-y-4">
            <div>
              <label class="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-2">Target Article Keyword / Topic</label>
              <input id="blog-topic" type="text" value="Google AdSense High RPM Strategy" class="w-full px-4 py-3 bg-white border border-bordercol rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium">
            </div>
            <button id="blog-submit-btn" onclick="executeAiTool('ai_blog', 'blog-topic', null, 'blog-output', 'AI Blog Outline Strategist')" class="w-full gradient-hero-btn text-white font-semibold py-3.5 rounded-xl text-sm shadow-md flex items-center justify-center gap-2">
              <i data-lucide="sparkles" class="w-4 h-4"></i>
              <span>Generate SEO Outline & Keywords</span>
            </button>
          </div>

          <div id="blog-output" class="hidden space-y-4"></div>
        </div>
      \`;
    }

    // --- AI TOOL 3: CODE & REGEX EXPLAINER ---
    function mountAiCodeTool(el) {
      el.innerHTML = \`
        <div class="max-w-2xl mx-auto">
          <div class="text-center mb-8">
            <div class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <i data-lucide="code" class="w-6 h-6"></i>
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold font-heading text-dark">AI Code, Regex & Script Explainer</h2>
            <p class="text-xs text-muted mt-1">Paste any regular expression, SQL query, or script for an instant plain-English breakdown.</p>
          </div>

          <div class="bg-surface p-6 rounded-2xl border border-bordercol mb-8 space-y-4">
            <div>
              <label class="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-2">Paste Code / Regex Snippet</label>
              <textarea id="code-snippet" rows="5" class="w-full px-4 py-3 bg-white border border-bordercol rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 leading-relaxed">^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$</textarea>
            </div>
            <button id="code-submit-btn" onclick="executeAiTool('ai_code', 'code-snippet', null, 'code-output', 'AI Code Explainer')" class="w-full gradient-hero-btn text-white font-semibold py-3.5 rounded-xl text-sm shadow-md flex items-center justify-center gap-2">
              <i data-lucide="sparkles" class="w-4 h-4"></i>
              <span>Explain Code Snippet</span>
            </button>
          </div>

          <div id="code-output" class="hidden space-y-4"></div>
        </div>
      \`;
    }

    // --- AI TOOL 4: AD COPY GENERATOR ---
    function mountAiAdCopyTool(el) {
      el.innerHTML = \`
        <div class="max-w-2xl mx-auto">
          <div class="text-center mb-8">
            <div class="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <i data-lucide="sparkles" class="w-6 h-6"></i>
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold font-heading text-dark">AI AdSense & Social Ad Copy Generator</h2>
            <p class="text-xs text-muted mt-1">Craft punchy headlines and click-optimized ad copy variations for low CPC campaigns.</p>
          </div>

          <div class="bg-surface p-6 rounded-2xl border border-bordercol mb-8 space-y-4">
            <div>
              <label class="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-2">Product, Website, or Offer</label>
              <input id="ad-input" type="text" value="Free AI Keyword Research Tool for Bloggers" class="w-full px-4 py-3 bg-white border border-bordercol rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium">
            </div>
            <button id="ad-submit-btn" onclick="executeAiTool('ai_adcopy', 'ad-input', null, 'ad-output', 'AI Ad Copy Generator')" class="w-full gradient-hero-btn text-white font-semibold py-3.5 rounded-xl text-sm shadow-md flex items-center justify-center gap-2">
              <i data-lucide="sparkles" class="w-4 h-4"></i>
              <span>Generate 3 High-CTR Ad Variations</span>
            </button>
          </div>

          <div id="ad-output" class="hidden space-y-4"></div>
        </div>
      \`;
    }

    // --- CLIENT UTILITY 5: ADSENSE & REVENUE ESTIMATOR ---
    function mountBusinessCalculator(el) {
      el.innerHTML = \`
        <div class="max-w-2xl mx-auto">
          <div class="text-center mb-8">
            <div class="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <i data-lucide="dollar-sign" class="w-6 h-6"></i>
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold font-heading text-dark">AdSense & Website Revenue Estimator</h2>
            <p class="text-xs text-muted mt-1">Calculate your projected monthly earnings based on traffic, page views, and niche RPM.</p>
          </div>

          <div class="bg-surface p-6 rounded-2xl border border-bordercol space-y-5">
            <div>
              <div class="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Monthly Pageviews</span>
                <span id="calc-views-val" class="font-mono text-brand-600">100,000 views</span>
              </div>
              <input id="calc-views" type="range" min="5000" max="1000000" step="5000" value="100000" oninput="runBusinessCalc()" class="w-full accent-brand-600">
            </div>

            <div>
              <div class="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Estimated RPM (Revenue Per 1,000 Views)</span>
                <span id="calc-rpm-val" class="font-mono text-brand-600">$18.00 RPM</span>
              </div>
              <input id="calc-rpm" type="range" min="1" max="60" step="0.5" value="18" oninput="runBusinessCalc()" class="w-full accent-brand-600">
              <div class="flex justify-between text-[10px] text-muted mt-1">
                <span>General Tech ($8)</span>
                <span>AdSense Tier-1 ($18)</span>
                <span>Finance & SaaS ($35+)</span>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-3 pt-4 border-t border-bordercol text-center">
              <div class="bg-white p-3 rounded-xl border border-bordercol">
                <div class="text-[10px] font-bold text-slate-500 uppercase">Daily</div>
                <div id="calc-daily" class="text-base font-extrabold text-dark font-mono">$60.00</div>
              </div>
              <div class="bg-white p-3 rounded-xl border border-brand-300 bg-brand-50/30">
                <div class="text-[10px] font-bold text-brand-700 uppercase">Monthly</div>
                <div id="calc-monthly" class="text-lg font-extrabold text-brand-700 font-mono">$1,800.00</div>
              </div>
              <div class="bg-white p-3 rounded-xl border border-bordercol">
                <div class="text-[10px] font-bold text-slate-500 uppercase">Yearly</div>
                <div id="calc-yearly" class="text-base font-extrabold text-dark font-mono">$21,600.00</div>
              </div>
            </div>

            <div class="flex justify-end pt-2">
              <button onclick="saveResultToFirestore('business', 'AdSense Revenue Estimator', 'Views: ' + document.getElementById('calc-views').value + ', RPM: $' + document.getElementById('calc-rpm').value, 'Monthly: ' + document.getElementById('calc-monthly').textContent + ', Yearly: ' + document.getElementById('calc-yearly').textContent)" class="text-xs font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1">
                <i data-lucide="bookmark" class="w-3.5 h-3.5"></i>
                <span>Save Calculation to Account</span>
              </button>
            </div>
          </div>
        </div>
      \`;
      runBusinessCalc();
    }

    window.runBusinessCalc = function() {
      const views = Number(document.getElementById('calc-views')?.value || 100000);
      const rpm = Number(document.getElementById('calc-rpm')?.value || 18);
      
      if (document.getElementById('calc-views-val')) document.getElementById('calc-views-val').textContent = views.toLocaleString() + ' views';
      if (document.getElementById('calc-rpm-val')) document.getElementById('calc-rpm-val').textContent = '$' + rpm.toFixed(2) + ' RPM';

      const monthly = (views / 1000) * rpm;
      const daily = monthly / 30;
      const yearly = monthly * 12;

      if (document.getElementById('calc-daily')) document.getElementById('calc-daily').textContent = '$' + daily.toFixed(2);
      if (document.getElementById('calc-monthly')) document.getElementById('calc-monthly').textContent = '$' + monthly.toFixed(2);
      if (document.getElementById('calc-yearly')) document.getElementById('calc-yearly').textContent = '$' + yearly.toFixed(2);
    };

    // --- CLIENT UTILITY 6: DOMAIN & BRAND NAME GENERATOR ---
    function mountNameGenerator(el) {
      el.innerHTML = \`
        <div class="max-w-2xl mx-auto">
          <div class="text-center mb-8">
            <div class="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <i data-lucide="sparkles" class="w-6 h-6"></i>
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold font-heading text-dark">AI Brand & Domain Name Generator</h2>
            <p class="text-xs text-muted mt-1">Generate catchy, high-recall startup and domain names with instant suffix pairing.</p>
          </div>

          <div class="bg-surface p-6 rounded-2xl border border-bordercol space-y-4">
            <div>
              <label class="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-2">Seed Keywords</label>
              <input id="name-seed" type="text" value="Cloud Fast Data" class="w-full px-4 py-3 bg-white border border-bordercol rounded-xl text-sm font-medium">
            </div>
            <button onclick="runNameGen()" class="w-full gradient-hero-btn text-white font-semibold py-3.5 rounded-xl text-sm shadow-md">
              Generate 10 Brand Names
            </button>
            <div id="name-results" class="grid grid-cols-2 gap-3 pt-4"></div>
          </div>
        </div>
      \`;
      runNameGen();
    }

    window.runNameGen = function() {
      const seed = (document.getElementById('name-seed')?.value || 'Tech Web').split(' ')[0] || 'App';
      const prefixes = ['Hyper', 'Nova', 'Omni', 'Apex', 'Meta', 'Zen', 'Pulse', 'Strat', 'Velo', 'Aero'];
      const suffixes = ['flow', 'stack', 'hub', 'ly', 'forge', 'pulse', 'base', 'craft', 'io', 'scale'];
      
      const names = [];
      for (let i = 0; i < 10; i++) {
        const p = prefixes[Math.floor(Math.random() * prefixes.length)];
        const s = suffixes[Math.floor(Math.random() * suffixes.length)];
        names.push(i % 2 === 0 ? \`\${p}\${seed}\` : \`\${seed}\${s}\`);
      }

      const resBox = document.getElementById('name-results');
      if (resBox) {
        resBox.innerHTML = names.map(n => \`
          <div class="p-3 bg-white rounded-xl border border-bordercol flex items-center justify-between text-xs font-bold text-dark hover:border-brand-300">
            <span>\${n}.com</span>
            <button onclick="navigator.clipboard.writeText('\${n}.com'); showToast('Copied ' + '\${n}.com', 'success');" class="text-brand-600 hover:text-brand-800 text-[10px]">Copy</button>
          </div>
        \`).join('');
      }
    };

    // --- CLIENT UTILITY 7: INSTAGRAM & SOCIAL CAPTIONS ---
    function mountInstagramGenerator(el) {
      el.innerHTML = \`
        <div class="max-w-2xl mx-auto">
          <div class="text-center mb-8">
            <div class="w-12 h-12 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <i data-lucide="hash" class="w-6 h-6"></i>
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold font-heading text-dark">Social Media Viral Caption & Tag Generator</h2>
            <p class="text-xs text-muted mt-1">Instant high-engagement captions paired with categorized hashtags for Reels & Posts.</p>
          </div>

          <div class="bg-surface p-6 rounded-2xl border border-bordercol space-y-4">
            <div>
              <label class="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-2">Topic or Vibe</label>
              <input id="insta-topic" type="text" value="Web Development Coding Workflow" class="w-full px-4 py-3 bg-white border border-bordercol rounded-xl text-sm font-medium">
            </div>
            <button onclick="runInstaGen()" class="w-full gradient-hero-btn text-white font-semibold py-3.5 rounded-xl text-sm shadow-md">
              Generate Reel Captions & Hashtags
            </button>
            <div id="insta-output" class="p-4 bg-white rounded-xl border border-bordercol text-xs leading-relaxed space-y-3"></div>
          </div>
        </div>
      \`;
      runInstaGen();
    }

    window.runInstaGen = function() {
      const topic = document.getElementById('insta-topic')?.value || 'coding';
      const out = document.getElementById('insta-output');
      if (out) {
        out.innerHTML = \`
          <p class="font-bold text-slate-900">⚡ 3 Things I Wish I Knew Before Starting \${topic}:</p>
          <p class="text-slate-700">1. Consistency beats intensity every single day.<br>2. Build real projects, stop re-watching tutorials.<br>3. Monetization starts with solving one painful problem.</p>
          <p class="text-slate-500 font-mono text-[11px] pt-2 border-t border-slate-100">
            #\${topic.replace(/\\s+/g, '')} #WebDeveloper #CodingLife #100DaysOfCode #BuildInPublic #SoftwareEngineer #TechTok #DigitalNomad
          </p>
          <div class="flex justify-end pt-1">
            <button onclick="navigator.clipboard.writeText(document.getElementById('insta-output').innerText); showToast('Copied Caption & Hashtags!', 'success');" class="text-brand-600 font-bold hover:underline">Copy Caption</button>
          </div>
        \`;
      }
    };

    // --- CLIENT UTILITY 8: WORD & SEO DENSITY COUNTER ---
    function mountWordCounter(el) {
      el.innerHTML = \`
        <div class="max-w-2xl mx-auto">
          <div class="text-center mb-8">
            <div class="w-12 h-12 bg-slate-100 text-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <i data-lucide="file-text" class="w-6 h-6"></i>
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold font-heading text-dark">Pro Content SEO & Word Density Analyzer</h2>
            <p class="text-xs text-muted mt-1">Instant metrics for words, characters, reading time, speaking time, and top repeated keywords.</p>
          </div>

          <div class="space-y-4">
            <textarea id="word-input" oninput="runWordCount()" rows="8" placeholder="Paste your article or copy draft here..." class="w-full p-4 bg-white border border-bordercol rounded-2xl text-xs sm:text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs">Web development and artificial intelligence are converging rapidly in 2025. Modern full-stack developers who leverage serverless functions, lightweight AI models, and optimized Google AdSense placement can build highly sustainable online assets without huge server expenses.</textarea>

            <div class="grid grid-cols-4 gap-3 text-center">
              <div class="bg-surface p-3 rounded-xl border border-bordercol"><div class="text-[10px] font-bold text-slate-500">Words</div><div id="wc-words" class="text-lg font-bold text-dark font-mono">0</div></div>
              <div class="bg-surface p-3 rounded-xl border border-bordercol"><div class="text-[10px] font-bold text-slate-500">Characters</div><div id="wc-chars" class="text-lg font-bold text-dark font-mono">0</div></div>
              <div class="bg-surface p-3 rounded-xl border border-bordercol"><div class="text-[10px] font-bold text-slate-500">Reading Time</div><div id="wc-read" class="text-lg font-bold text-brand-600 font-mono">0m</div></div>
              <div class="bg-surface p-3 rounded-xl border border-bordercol"><div class="text-[10px] font-bold text-slate-500">Speaking Time</div><div id="wc-speak" class="text-lg font-bold text-slate-700 font-mono">0m</div></div>
            </div>
          </div>
        </div>
      \`;
      runWordCount();
    }

    window.runWordCount = function() {
      const text = document.getElementById('word-input')?.value || '';
      const words = text.trim() ? text.trim().split(/\\s+/).length : 0;
      const chars = text.length;
      const readMin = Math.ceil(words / 200);
      const speakMin = Math.ceil(words / 130);

      if (document.getElementById('wc-words')) document.getElementById('wc-words').textContent = words;
      if (document.getElementById('wc-chars')) document.getElementById('wc-chars').textContent = chars;
      if (document.getElementById('wc-read')) document.getElementById('wc-read').textContent = readMin + 'm';
      if (document.getElementById('wc-speak')) document.getElementById('wc-speak').textContent = speakMin + 'm';
    };

    // --- CLIENT UTILITY 9: MILITARY-GRADE PASSWORD GENERATOR ---
    function mountPasswordGenerator(el) {
      el.innerHTML = \`
        <div class="max-w-2xl mx-auto">
          <div class="text-center mb-8">
            <div class="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-3">
              <i data-lucide="shield-check" class="w-6 h-6"></i>
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold font-heading text-dark">Military-Grade Password & Key Generator</h2>
            <p class="text-xs text-muted mt-1">Generate cryptographically secure 256-bit entropy passwords and secrets client-side.</p>
          </div>

          <div class="bg-surface p-6 rounded-2xl border border-bordercol space-y-4">
            <div class="flex items-center gap-2">
              <input id="pwd-out" type="text" readonly class="w-full px-4 py-3 bg-white border border-bordercol rounded-xl text-sm font-mono font-bold text-brand-700 select-all">
              <button onclick="navigator.clipboard.writeText(document.getElementById('pwd-out').value); showToast('Password Copied!', 'success');" class="gradient-hero-btn text-white px-4 py-3 rounded-xl text-xs font-semibold">Copy</button>
            </div>

            <div class="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Length: <span id="pwd-len-val">24</span></span>
              <input id="pwd-len" type="range" min="12" max="64" value="24" oninput="document.getElementById('pwd-len-val').textContent = this.value; runPwdGen();" class="w-1/2 accent-brand-600">
            </div>

            <button onclick="runPwdGen()" class="w-full py-3 bg-white border border-bordercol hover:bg-slate-50 font-semibold rounded-xl text-xs text-slate-700 flex items-center justify-center gap-2">
              <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
              <span>Generate New Secure Password</span>
            </button>
          </div>
        </div>
      \`;
      runPwdGen();
    }

    window.runPwdGen = function() {
      const len = Number(document.getElementById('pwd-len')?.value || 24);
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
      const arr = new Uint32Array(len);
      window.crypto.getRandomValues(arr);
      let pwd = '';
      for (let i = 0; i < len; i++) {
        pwd += chars[arr[i] % chars.length];
      }
      const out = document.getElementById('pwd-out');
      if (out) out.value = pwd;
    };

    // --- CLIENT UTILITY 10: AGE & MILESTONE CALCULATOR ---
    function mountAgeCalculator(el) {
      el.innerHTML = \`
        <div class="max-w-2xl mx-auto">
          <div class="text-center mb-8">
            <div class="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <i data-lucide="calendar" class="w-6 h-6"></i>
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold font-heading text-dark">Exact Age & Milestone Calculator</h2>
            <p class="text-xs text-muted mt-1">Find your exact age down to days, hours, and next milestone birthdays.</p>
          </div>

          <div class="bg-surface p-6 rounded-2xl border border-bordercol space-y-4">
            <div>
              <label class="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-2">Select Your Date of Birth</label>
              <input id="age-dob" type="date" value="1998-05-15" onchange="runAgeCalc()" class="w-full px-4 py-3 bg-white border border-bordercol rounded-xl text-sm font-medium">
            </div>
            <div id="age-result" class="grid grid-cols-3 gap-3 pt-3 text-center"></div>
          </div>
        </div>
      \`;
      runAgeCalc();
    }

    window.runAgeCalc = function() {
      const dobVal = document.getElementById('age-dob')?.value;
      if (!dobVal) return;
      const dob = new Date(dobVal);
      const now = new Date();
      
      let years = now.getFullYear() - dob.getFullYear();
      let months = now.getMonth() - dob.getMonth();
      let days = now.getDate() - dob.getDate();

      if (days < 0) {
        months--;
        days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
      }
      if (months < 0) {
        years--;
        months += 12;
      }

      const res = document.getElementById('age-result');
      if (res) {
        res.innerHTML = \`
          <div class="p-3 bg-white rounded-xl border border-bordercol"><div class="text-[10px] font-bold text-slate-500 uppercase">Years</div><div class="text-xl font-black text-brand-700">\${years}</div></div>
          <div class="p-3 bg-white rounded-xl border border-bordercol"><div class="text-[10px] font-bold text-slate-500 uppercase">Months</div><div class="text-xl font-black text-dark">\${months}</div></div>
          <div class="p-3 bg-white rounded-xl border border-bordercol"><div class="text-[10px] font-bold text-slate-500 uppercase">Days</div><div class="text-xl font-black text-slate-700">\${days}</div></div>
        \`;
      }
    };

    // --- CLIENT UTILITY 11: ADSENSE ARBITRAGE & PROFIT CALCULATOR ---
    function mountArbitrageCalculator(el) {
      el.innerHTML = \`
        <div class="max-w-2xl mx-auto">
          <div class="text-center mb-8">
            <div class="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <i data-lucide="trending-up" class="w-6 h-6"></i>
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold font-heading text-dark">AdSense Arbitrage & Traffic Profitability Calculator</h2>
            <p class="text-xs text-muted mt-1">Simulate paid ad acquisition cost vs AdSense revenue return, net profit margins, and campaign ROI percentage.</p>
          </div>

          <div class="bg-surface p-6 rounded-2xl border border-bordercol space-y-5">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Total Ad Spend / Budget ($)</label>
                <input id="arb-spend" type="number" value="500" min="10" step="10" oninput="runArbitrageCalc()" class="w-full px-4 py-2.5 bg-white border border-bordercol rounded-xl text-sm font-mono font-bold">
              </div>
              <div>
                <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Cost Per Click (CPC Paid) ($)</label>
                <input id="arb-cpc" type="number" value="0.04" min="0.005" step="0.005" oninput="runArbitrageCalc()" class="w-full px-4 py-2.5 bg-white border border-bordercol rounded-xl text-sm font-mono font-bold">
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Pageviews Per Visitor (PV/V)</label>
                <input id="arb-pv" type="number" value="2.5" min="1" step="0.1" oninput="runArbitrageCalc()" class="w-full px-4 py-2.5 bg-white border border-bordercol rounded-xl text-sm font-mono font-bold">
              </div>
              <div>
                <label class="block text-xs font-bold uppercase text-slate-700 mb-1">AdSense RPM Received ($)</label>
                <input id="arb-rpm" type="number" value="28" min="1" step="0.5" oninput="runArbitrageCalc()" class="w-full px-4 py-2.5 bg-white border border-bordercol rounded-xl text-sm font-mono font-bold">
              </div>
            </div>

            <div class="grid grid-cols-3 gap-3 pt-4 border-t border-bordercol text-center">
              <div class="bg-white p-3 rounded-xl border border-bordercol">
                <div class="text-[10px] font-bold text-slate-500 uppercase">Gross Revenue</div>
                <div id="arb-gross" class="text-base font-extrabold text-dark font-mono">$875.00</div>
              </div>
              <div class="bg-white p-3 rounded-xl border border-emerald-300 bg-emerald-50/40">
                <div class="text-[10px] font-bold text-emerald-800 uppercase">Net Profit</div>
                <div id="arb-net" class="text-lg font-extrabold text-emerald-700 font-mono">+$375.00</div>
              </div>
              <div class="bg-white p-3 rounded-xl border border-bordercol">
                <div class="text-[10px] font-bold text-slate-500 uppercase">Campaign ROI</div>
                <div id="arb-roi" class="text-base font-extrabold text-brand-700 font-mono">+75.0%</div>
              </div>
            </div>

            <div class="flex justify-end pt-2">
              <button onclick="saveResultToFirestore('arbitrage', 'AdSense Arbitrage Calculator', 'Spend: $' + document.getElementById('arb-spend').value + ', CPC: $' + document.getElementById('arb-cpc').value + ', RPM: $' + document.getElementById('arb-rpm').value, 'Net Profit: ' + document.getElementById('arb-net').textContent + ', ROI: ' + document.getElementById('arb-roi').textContent)" class="text-xs font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1">
                <i data-lucide="bookmark" class="w-3.5 h-3.5"></i>
                <span>Save Arbitrage Calculation</span>
              </button>
            </div>
          </div>
        </div>
      \`;
      runArbitrageCalc();
    }

    window.runArbitrageCalc = function() {
      const spend = Number(document.getElementById('arb-spend')?.value || 500);
      const cpc = Number(document.getElementById('arb-cpc')?.value || 0.04);
      const pv = Number(document.getElementById('arb-pv')?.value || 2.5);
      const rpm = Number(document.getElementById('arb-rpm')?.value || 28);

      const visitors = cpc > 0 ? (spend / cpc) : 0;
      const totalPageviews = visitors * pv;
      const grossRevenue = (totalPageviews / 1000) * rpm;
      const netProfit = grossRevenue - spend;
      const roi = spend > 0 ? ((netProfit / spend) * 100) : 0;

      if (document.getElementById('arb-gross')) document.getElementById('arb-gross').textContent = '$' + grossRevenue.toFixed(2);
      if (document.getElementById('arb-net')) {
        document.getElementById('arb-net').textContent = (netProfit >= 0 ? '+$' : '-$') + Math.abs(netProfit).toFixed(2);
        document.getElementById('arb-net').className = netProfit >= 0 ? 'text-lg font-extrabold text-emerald-700 font-mono' : 'text-lg font-extrabold text-rose-600 font-mono';
      }
      if (document.getElementById('arb-roi')) {
        document.getElementById('arb-roi').textContent = (roi >= 0 ? '+' : '') + roi.toFixed(1) + '%';
        document.getElementById('arb-roi').className = roi >= 0 ? 'text-base font-extrabold text-brand-700 font-mono' : 'text-base font-extrabold text-rose-600 font-mono';
      }
    };

    function mountCustomAiTool(el, tool) {
      el.innerHTML = \`
        <div class="max-w-2xl mx-auto">
          <div class="text-center mb-8">
            <h2 class="text-2xl sm:text-3xl font-extrabold font-heading text-dark">\${tool.name}</h2>
            <p class="text-xs text-muted mt-1">\${tool.description}</p>
          </div>
          <div class="bg-surface p-6 rounded-2xl border border-bordercol space-y-4">
            <div>
              <label class="block text-xs font-bold uppercase text-slate-700 mb-2">Input Prompt</label>
              <textarea id="custom-tool-input" rows="4" class="w-full px-4 py-3 bg-white border border-bordercol rounded-xl text-sm" placeholder="Enter topic or context..."></textarea>
            </div>
            <button onclick="executeAiTool('custom', 'custom-tool-input', null, 'custom-output', '\${tool.name}')" class="w-full gradient-hero-btn text-white font-semibold py-3.5 rounded-xl text-sm shadow-md">
              Run AI Tool
            </button>
          </div>
          <div id="custom-output" class="hidden space-y-4 mt-6"></div>
        </div>
      \`;
    }

    // --- SHARED AI TOOL EXECUTION ENGINE (Connecting to /api/ai/run) ---
    window.executeAiTool = async function(toolType, inputId, toneId, outputId, toolDisplayName) {
      const inputEl = document.getElementById(inputId);
      const outputEl = document.getElementById(outputId);
      if (!inputEl || !outputEl) return;

      const inputVal = inputEl.value.trim();
      if (!inputVal) {
        showToast('Please enter an input before running the tool!', 'error');
        return;
      }

      const toneVal = toneId ? document.getElementById(toneId)?.value : 'Engaging & Professional';

      outputEl.classList.remove('hidden');
      outputEl.innerHTML = \`
        <div class="p-8 text-center bg-surface rounded-2xl border border-bordercol space-y-3">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-brand-600 border-t-transparent"></div>
          <p class="text-xs font-semibold text-slate-600">Generating with Gemini AI models...</p>
        </div>
      \`;

      try {
        const res = await fetch('/api/ai/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tool_type: toolType,
            input: inputVal,
            tone: toneVal,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'AI generation failed');
        }

        outputEl.innerHTML = \`
          <div class="p-6 bg-surface rounded-2xl border border-brand-200 space-y-4 animate-fade-in shadow-xs">
            <div class="flex items-center justify-between pb-3 border-b border-bordercol">
              <span class="text-xs font-bold uppercase tracking-wider text-brand-700 flex items-center gap-1.5">
                <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
                <span>Generated Output</span>
              </span>
              <div class="flex items-center gap-2">
                <button onclick="navigator.clipboard.writeText(decodeURIComponent('\${encodeURIComponent(data.result)}')); showToast('Copied to clipboard!', 'success');" class="text-xs font-semibold text-slate-700 hover:text-dark px-3 py-1 bg-white border border-bordercol rounded-lg">Copy</button>
                <button onclick="saveResultToFirestore('\${toolType}', '\${toolDisplayName || 'AI Tool'}', decodeURIComponent('\${encodeURIComponent(inputVal)}'), decodeURIComponent('\${encodeURIComponent(data.result)}'))" class="gradient-hero-btn text-white text-xs font-semibold px-3 py-1 rounded-lg flex items-center gap-1">
                  <i data-lucide="bookmark" class="w-3 h-3"></i>
                  <span>Save Result</span>
                </button>
              </div>
            </div>
            <div class="prose prose-sm text-slate-800 leading-relaxed font-sans whitespace-pre-wrap">\${parseSimpleMarkdown(data.result)}</div>
          </div>
        \`;
        lucide.createIcons();
      } catch (err) {
        outputEl.innerHTML = \`
          <div class="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
            <strong>Error:</strong> \${err.message}. Please try again in a few moments.
          </div>
        \`;
      }
    };

    // ==========================================
    // VIEW 10: ARTICLES LIST (#/articles)
    // ==========================================
    function renderArticlesListView(container) {
      const articles = window.APP_STATE.articles || [];

      container.innerHTML = \`
        <div class="bg-gradient-to-b from-brand-50/50 via-white to-white py-14 border-b border-bordercol text-center">
          <div class="max-w-4xl mx-auto px-4">
            <div class="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 uppercase tracking-wider mb-2">
              <i data-lucide="book-open" class="w-3.5 h-3.5"></i>
              <span>Engineering Knowledge Base</span>
            </div>
            <h1 class="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
              Guides & Case Studies
            </h1>
            <p class="text-sm text-slate-600 max-w-2xl mx-auto mt-2">
              Real-world technical documentation on Google AdSense, Facebook video monetization, and AI web applications.
            </p>
          </div>
        </div>

        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6">
          \${articles.map(a => \`
            <div class="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-brand-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div class="space-y-2 max-w-2xl">
                <span class="text-[10px] font-bold text-brand-700 uppercase tracking-wider bg-brand-50 px-2 py-0.5 rounded-md">\${(a.tag || 'Guide').toUpperCase()}</span>
                <h3 class="text-lg font-bold font-heading text-slate-900 leading-snug hover:text-brand-600 transition-colors">
                  <a href="#/articles/\${a.slug}">\${a.title}</a>
                </h3>
                <p class="text-xs text-slate-600 leading-relaxed line-clamp-2">\${a.meta}</p>
              </div>
              <a href="#/articles/\${a.slug}" class="gradient-hero-btn text-white text-xs font-semibold px-5 py-2.5 rounded-xl flex items-center justify-center gap-1.5 whitespace-nowrap self-start sm:self-auto">
                <span>Read Guide</span>
                <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
              </a>
            </div>
          \`).join('')}
        </div>
      \`;

      lucide.createIcons();
    }

    // ==========================================
    // VIEW 11: ARTICLE DETAIL READER (#/articles/:slug)
    // ==========================================
    async function renderArticleDetailPage(container, slug) {
      container.innerHTML = \`
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div class="py-16 text-center">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-brand-600 border-t-transparent"></div>
            <p class="mt-4 text-xs text-muted">Loading article from store...</p>
          </div>
        </div>
      \`;

      const article = await apiFetch('/articles/' + slug);
      if (!article) {
        container.innerHTML = '<div class="py-24 text-center">Article not found. <a href="#/articles" class="text-brand-600 underline">Back to guides</a></div>';
        return;
      }

      container.innerHTML = \`
        <div class="bg-surface py-8 border-b border-bordercol">
          <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <a href="#/articles" class="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-800">
              <i data-lucide="arrow-left" class="w-4 h-4"></i>
              <span>Back to all guides</span>
            </a>
            <span class="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-md">\${(article.tag || 'Guide').toUpperCase()}</span>
          </div>
        </div>

        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <article class="bg-white rounded-3xl border border-bordercol p-6 sm:p-12 shadow-sm space-y-6">
            <h1 class="text-2xl sm:text-4xl font-extrabold font-heading text-slate-900 leading-tight">\${article.title}</h1>
            <p class="text-sm text-slate-600 italic border-l-4 border-brand-500 pl-4 py-1 bg-slate-50 rounded-r-xl">\${article.meta}</p>
            <div class="article-content text-slate-800 leading-relaxed border-t border-slate-100 pt-6">
              \${parseSimpleMarkdown(article.body || article.content || '')}
            </div>
          </article>
        </div>
      \`;

      lucide.createIcons();
    }

    // ==========================================
    // VIEW 12: TOPICS CATALOG (#/topics)
    // ==========================================
    function renderTopicsCatalogView(container) {
      const topics = window.APP_STATE.topics || [];

      container.innerHTML = \`
        <div class="bg-gradient-to-b from-brand-50/50 via-white to-white py-14 border-b border-bordercol text-center">
          <div class="max-w-4xl mx-auto px-4">
            <div class="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 uppercase tracking-wider mb-2">
              <i data-lucide="tags" class="w-3.5 h-3.5"></i>
              <span>Topics Taxonomy</span>
            </div>
            <h1 class="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
              Curriculum Topics & Tracks
            </h1>
            <p class="text-sm text-slate-600 max-w-2xl mx-auto mt-2">
              Explore educational pathways across AI engineering, full-stack web, technical SEO, and digital publishing.
            </p>
          </div>
        </div>

        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            \${topics.map(t => \`
              <a href="\${t.link || '#/courses'}" class="gradient-border-card p-6 rounded-3xl border border-slate-200 flex flex-col justify-between group">
                <div class="space-y-3">
                  <div class="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-colors">
                    <i data-lucide="\${t.icon || 'tag'}" class="w-5 h-5"></i>
                  </div>
                  <h3 class="text-base font-bold font-heading text-slate-900 group-hover:text-brand-600 transition-colors">\${t.name}</h3>
                  <p class="text-xs text-slate-600 leading-relaxed">\${t.description}</p>
                </div>
                <div class="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-brand-700">
                  <span>View Articles & Courses</span>
                  <i data-lucide="arrow-right" class="w-4 h-4 group-hover:translate-x-1 transition-transform"></i>
                </div>
              </a>
            \`).join('')}
          </div>
        </div>
      \`;

      lucide.createIcons();
    }

    // ==========================================
    // NASIR VIDEO PRESENTER MODAL & AUDIO SYNTHESIS
    // ==========================================
    let speechActive = false;
    let currentSpeechLang = 'urdu';

    window.openNasirVideoModal = function() {
      const modal = document.getElementById('video-modal');
      const iframe = document.getElementById('video-iframe');
      const s = window.APP_STATE.settings || {};

      if (iframe) {
        // No founder video supplied: leave the iframe empty (the modal shows
        // a "coming soon" placeholder). Never build a URL from an empty string.
        // Phase 2: a stored Rick Astley URL (dQw4w9WgXcQ) is treated as no video.
        const url = /dQw4w9WgXcQ/i.test(String(s.video_url || '')) ? '' : String(s.video_url || '').trim();
        iframe.src = url ? (url.includes('autoplay') ? url : url + (url.includes('?') ? '&' : '?') + 'autoplay=1') : '';
      }

      if (modal) modal.classList.remove('hidden');
      lucide.createIcons();
    };

    window.closeNasirVideoModal = function() {
      const modal = document.getElementById('video-modal');
      const iframe = document.getElementById('video-iframe');
      if (iframe) iframe.src = '';
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      speechActive = false;
      const btnLabel = document.getElementById('speech-btn-label');
      if (btnLabel) btnLabel.textContent = 'Listen to Introduction';
      if (modal) modal.classList.add('hidden');
    };

    window.toggleSpeechLanguage = function() {
      currentSpeechLang = currentSpeechLang === 'urdu' ? 'english' : 'urdu';
      const label = document.getElementById('speech-curr-lang');
      if (label) label.textContent = currentSpeechLang === 'urdu' ? 'Urdu' : 'English';
      if (speechActive) {
        window.speechSynthesis.cancel();
        speechActive = false;
        toggleSpeechPresenter();
      }
    };

    window.toggleSpeechPresenter = function() {
      if (!window.speechSynthesis) {
        showToast('Speech synthesis not supported in this browser.', 'error');
        return;
      }

      const s = window.APP_STATE.settings || {};
      const scriptText = currentSpeechLang === 'urdu' ? 
        (s.video_script_urdu || "Assalamu Alaikum! Welcome to Web Nasir. I'm Nasir, and I've created this platform to help you learn modern digital skills, use AI tools, build websites, master SEO, and develop your online career.") :
        (s.video_script_english || "Welcome to Web Nasir Academy. I am Nasir, a senior full-stack engineer and digital publisher with over 10 years of experience. We built this platform so you can learn real-world skills and build real online income.");

      const btnLabel = document.getElementById('speech-btn-label');
      const subBox = document.getElementById('subtitles-box');

      if (speechActive) {
        window.speechSynthesis.cancel();
        speechActive = false;
        if (btnLabel) btnLabel.textContent = 'Listen to Introduction';
        if (subBox) subBox.innerHTML = '<span class="text-slate-400 italic">Audio paused.</span>';
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(scriptText);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.lang = currentSpeechLang === 'urdu' ? 'ur-PK' : 'en-US';

      speechActive = true;
      if (btnLabel) btnLabel.textContent = 'Pause Narration';
      if (subBox) subBox.innerHTML = \`<span class="text-brand-700 font-bold">🎙 Playing (\${currentSpeechLang.toUpperCase()}):</span> \${scriptText}\`;

      utterance.onend = function() {
        speechActive = false;
        if (btnLabel) btnLabel.textContent = 'Replay Introduction';
      };

      utterance.onerror = function() {
        speechActive = false;
        if (btnLabel) btnLabel.textContent = 'Listen to Introduction';
      };

      window.speechSynthesis.speak(utterance);
    };

    // ==========================================
    // COURSE CHECKOUT MODAL & ENROLLMENT (Razorpay & UPI)
    // ==========================================
    window.openCourseCheckoutModal = function(courseId) {
      const c = (window.APP_STATE.courses || []).find(x => x.id === courseId);
      if (!c) return;

      document.getElementById('checkout-course-id').value = c.id;
      document.getElementById('checkout-course-title').textContent = c.title;
      document.getElementById('checkout-price-display').textContent = '₹' + (c.price || 4999).toLocaleString();
      document.getElementById('checkout-orig-price').textContent = '₹' + (c.original_price || 12999).toLocaleString();

      if (window.APP_STATE.currentUser) {
        document.getElementById('checkout-student-name').value = window.APP_STATE.currentUser.displayName || '';
        document.getElementById('checkout-student-email').value = window.APP_STATE.currentUser.email || '';
      }

      document.getElementById('checkout-modal').classList.remove('hidden');
      lucide.createIcons();
    };

    window.closeCheckoutModal = function() {
      document.getElementById('checkout-modal').classList.add('hidden');
    };

    window.handleExecuteEnrollment = async function(e) {
      e.preventDefault();
      const btn = document.getElementById('checkout-submit-btn');
      btn.disabled = true;
      btn.innerHTML = '<span>Processing Secure Enrollment...</span>';

      const courseId = document.getElementById('checkout-course-id').value;
      const sName = document.getElementById('checkout-student-name').value;
      const sEmail = document.getElementById('checkout-student-email').value;
      const sPhone = document.getElementById('checkout-student-phone').value;
      const pMethod = document.querySelector('input[name="pay-method"]:checked')?.value || 'Razorpay UPI';

      try {
        const res = await fetch('/api/courses/enroll', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            course_id: courseId,
            student_name: sName,
            student_email: sEmail,
            student_phone: sPhone,
            payment_method: pMethod,
            payment_id: 'RZP-' + Date.now().toString(36).toUpperCase(),
          }),
        });

        const data = await res.json();
        if (res.ok) {
          showToast('Enrollment Successful! Welcome to Web Nasir Academy.', 'success');
          localStorage.setItem('webnasir_student_email', sEmail);
          closeCheckoutModal();
          window.location.hash = '#/student';
        } else {
          showToast(data.error || 'Enrollment failed', 'error');
        }
      } catch (err) {
        showToast('Enrollment error: ' + err.message, 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i data-lucide="shield-check" class="w-4 h-4"></i><span>Complete Secure Enrollment</span>';
        lucide.createIcons();
      }
    };

    // ==========================================
    // INITIALIZATION & BACKGROUND API SYNC
    // ==========================================
    async function initAppData() {
      const yearEl = document.getElementById('year-curr');
      if (yearEl) yearEl.textContent = new Date().getFullYear();

      // 1. Instant Synchronous Pre-Hydration Render
      applySettingsUI(window.APP_STATE.settings);
      window.addEventListener('hashchange', router);
      router();

      // 2. Background Sync with Netlify Store
      try {
        const [settings, topics, tools, articles, courses, testimonials, marquee] = await Promise.all([
          apiFetch('/settings'),
          apiFetch('/topics'),
          apiFetch('/tools'),
          apiFetch('/articles'),
          apiFetch('/courses'),
          apiFetch('/testimonials'),
          apiFetch('/marquee'),
        ]);

        let hasUpdates = false;
        if (settings && Object.keys(settings).length > 0) {
          window.APP_STATE.settings = { ...window.APP_STATE.settings, ...settings };
          // Phase 2: a stored Rick Astley URL (dQw4w9WgXcQ) is treated as no video.
          if (/dQw4w9WgXcQ/i.test(String(window.APP_STATE.settings.video_url || ''))) window.APP_STATE.settings.video_url = '';
          applySettingsUI(window.APP_STATE.settings);
          hasUpdates = true;
        }
        if (Array.isArray(topics) && topics.length > 0) {
          window.APP_STATE.topics = topics;
          hasUpdates = true;
        }
        if (Array.isArray(tools) && tools.length > 0) {
          window.APP_STATE.tools = tools;
          hasUpdates = true;
        }
        if (Array.isArray(articles) && articles.length > 0) {
          window.APP_STATE.articles = articles;
          hasUpdates = true;
        }
        if (Array.isArray(courses) && courses.length > 0) {
          window.APP_STATE.courses = courses;
          hasUpdates = true;
        }
        if (Array.isArray(testimonials) && testimonials.length > 0) {
          window.APP_STATE.testimonials = testimonials;
          hasUpdates = true;
        }
        if (Array.isArray(marquee) && marquee.length > 0) {
          window.APP_STATE.marquee = marquee;
          renderMarqueeTrack();
        }

        if (hasUpdates) {
          router();
        }
      } catch (err) {
        console.warn('Background sync complete (offline/pre-hydrated).');
      }
    }

    // Mobile Hamburger Toggle
    document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
      document.getElementById('mobile-menu')?.classList.toggle('hidden');
    });

    // Execute Immediate Launch
    initAppData();
  </script>

  <!-- NON-BLOCKING DEFERRED FIREBASE MODULE -->
  <script type="module">
    import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
    import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
    import { getFirestore, doc, setDoc, getDoc, collection, addDoc, getDocs, deleteDoc, query, orderBy, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

    let fbApp, fbAuth, fbDb;

    async function initFirebase() {
      try {
        const res = await fetch('/firebase-applet-config.json');
        if (!res.ok) return;
        const config = await res.json();
        fbApp = initializeApp(config);
        fbDb = getFirestore(fbApp, config.firestoreDatabaseId);
        fbAuth = getAuth(fbApp);
        window.fbAuth = fbAuth;
        window.fbDb = fbDb;
        if (window.APP_STATE) window.APP_STATE.firebaseReady = true;

        onAuthStateChanged(fbAuth, async (user) => {
          if (window.APP_STATE) window.APP_STATE.currentUser = user;
          updateAuthUI(user);
          if (user) {
            try {
              await setDoc(doc(fbDb, 'users', user.uid), {
                userId: user.uid,
                email: user.email,
                displayName: user.displayName || 'Creator',
                photoURL: user.photoURL || '',
                updatedAt: new Date().toISOString(),
              }, { merge: true });
            } catch (err) {
              console.warn('Firestore user sync warning:', err);
            }
          }
        });
      } catch (err) {
        console.warn('Firebase init warning:', err);
      }
    }

    function updateAuthUI(user) {
      const container = document.getElementById('auth-nav-container');
      const mobileContainer = document.getElementById('mobile-auth-container');
      if (!container) return;

      if (user) {
        const photo = user.photoURL || '';
        const name = user.displayName || user.email?.split('@')[0] || 'User';
        const html = \`
          <div class="flex items-center gap-2">
            <a href="#/student" class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl transition-all">
              <i data-lucide="graduation-cap" class="w-3.5 h-3.5"></i>
              <span>Dashboard</span>
            </a>
            <div class="flex items-center gap-2 pl-2 border-l border-slate-200">
              \${photo ? \`<img src="\${photo}" class="w-7 h-7 rounded-full border border-brand-300">\` : \`<div class="w-7 h-7 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center">\${name[0].toUpperCase()}</div>\`}
              <span class="text-xs font-semibold text-slate-700 hidden xl:inline max-w-[90px] truncate">\${name}</span>
              <button onclick="handleSignOut()" class="text-slate-400 hover:text-rose-600 p-1" title="Sign Out">
                <i data-lucide="log-out" class="w-4 h-4"></i>
              </button>
            </div>
          </div>
        \`;
        container.innerHTML = html;
        if (mobileContainer) {
          mobileContainer.innerHTML = \`
            <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-bordercol">
              <span class="text-xs font-bold text-dark">\${name}</span>
              <div class="flex items-center gap-2">
                <a href="#/student" class="text-xs font-semibold text-brand-600">Dashboard</a>
                <button onclick="handleSignOut()" class="text-xs font-semibold text-rose-600">Sign Out</button>
              </div>
            </div>
          \`;
        }
      } else {
        container.innerHTML = \`
          <button onclick="handleGoogleSignIn()" class="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-surface hover:bg-slate-100 border border-bordercol rounded-xl transition-all shadow-xs">
            <svg class="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
            <span>Student Login</span>
          </button>
        \`;
        if (mobileContainer) {
          mobileContainer.innerHTML = \`
            <button onclick="handleGoogleSignIn()" class="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 rounded-xl">
              <span>Student Sign In</span>
            </button>
          \`;
        }
      }
      lucide.createIcons();
    }

    window._fbSignIn = async function() {
      if (!fbAuth) {
        showToast('Firebase Auth is readying...', 'info');
        return;
      }
      try {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(fbAuth, provider);
        showToast('Signed in successfully!', 'success');
      } catch (err) {
        showToast('Sign-in error: ' + err.message, 'error');
      }
    };
    window.handleGoogleSignIn = window._fbSignIn;

    window._fbSignOut = async function() {
      if (!fbAuth) return;
      try {
        await signOut(fbAuth);
        showToast('Signed out', 'info');
      } catch (err) {}
    };
    window.handleSignOut = window._fbSignOut;

    window._fbSaveResult = async function(toolKey, toolName, inputPrompt, outputResult) {
      if (!window.APP_STATE.currentUser) {
        showToast('Please sign in to save your result!', 'info');
        window.handleGoogleSignIn();
        return;
      }
      try {
        const colRef = collection(fbDb, 'users', window.APP_STATE.currentUser.uid, 'saved_generations');
        await addDoc(colRef, {
          userId: window.APP_STATE.currentUser.uid,
          toolKey,
          toolName,
          inputPrompt: String(inputPrompt).slice(0, 5000),
          outputResult: String(outputResult).slice(0, 20000),
          createdAt: new Date().toISOString(),
        });
        showToast('Saved to your Web Nasir account history!', 'success');
      } catch (err) {
        showToast('Error saving: ' + err.message, 'error');
      }
    };
    window.saveResultToFirestore = window._fbSaveResult;

    window._fbOpenSaved = async function() {
      const modal = document.getElementById('saved-modal');
      const list = document.getElementById('saved-list');
      if (modal) modal.classList.remove('hidden');

      if (!window.APP_STATE?.currentUser) {
        list.innerHTML = \`<div class="text-center py-8"><p class="text-sm text-muted">Please sign in with Google to view your saved history.</p><button onclick="handleGoogleSignIn()" class="mt-3 gradient-hero-btn text-white text-xs font-semibold px-4 py-2 rounded-xl">Sign In Now</button></div>\`;
        return;
      }

      list.innerHTML = \`<p class="text-xs text-muted py-6 text-center">Loading from Firestore...</p>\`;

      try {
        const colRef = collection(fbDb, 'users', window.APP_STATE.currentUser.uid, 'saved_generations');
        const snap = await getDocs(colRef);
        if (snap.empty) {
          list.innerHTML = \`<div class="text-center py-8"><i data-lucide="bookmark" class="w-8 h-8 text-slate-300 mx-auto mb-2"></i><p class="text-sm text-dark font-bold">No saved generations yet</p><p class="text-xs text-muted mt-1">Run any AI tool or calculator and click "Save Result" to bookmark it here.</p></div>\`;
          lucide.createIcons();
          return;
        }

        const items = [];
        snap.forEach(d => items.push({ id: d.id, ...d.data() }));
        items.sort((a,b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        list.innerHTML = items.map(item => \`
          <div class="p-4 rounded-2xl bg-surface border border-bordercol hover:border-brand-300 transition-all text-xs space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-brand-700 uppercase tracking-wider text-[11px]">\${item.toolName || item.toolKey}</span>
              <span class="text-slate-400 text-[10px]">\${item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}</span>
            </div>
            \${item.inputPrompt ? \`<div class="text-slate-600 line-clamp-1"><strong>Prompt:</strong> \${item.inputPrompt}</div>\` : ''}
            <div class="p-3 bg-white rounded-xl border border-slate-200 font-mono text-[11px] max-h-36 overflow-y-auto whitespace-pre-wrap text-slate-800">\${item.outputResult}</div>
            <div class="flex justify-end gap-2 pt-1">
              <button onclick="navigator.clipboard.writeText(decodeURIComponent('\${encodeURIComponent(item.outputResult)}')); showToast('Copied result!', 'success');" class="text-brand-600 hover:underline font-semibold text-[11px]">Copy Text</button>
            </div>
          </div>
        \`).join('');
        lucide.createIcons();
      } catch (err) {
        list.innerHTML = \`<p class="text-xs text-rose-600 py-4 text-center">Failed to load history: \${err.message}</p>\`;
      }
    };
    window.openSavedModal = window._fbOpenSaved;

    initFirebase();
  </script>
</body>
</html>`;

fs.writeFileSync(path.resolve('public/index.html'), html, 'utf-8');
fs.writeFileSync(path.resolve('index.html'), html, 'utf-8');
console.log('Successfully generated public/index.html and index.html');

# Web Nasir — AI & Web Income

A high-performance, Netlify-native website and management platform for the **Web Nasir** brand, curated by senior full-stack developer and digital publisher Nasir (10+ years experience).

The visual design, color hierarchy, and typography reference [Academy WebotApp](https://academy.webotapp.com/), featuring a light clean education/tech aesthetic, `#7c3aed` violet palette, `#0f172a` navy headings, Poppins & Inter typography, rounded cards (12–16px), soft shadows, and pill badges.

---

## 🏗️ Architecture

- **Static Frontend**: Netlify Global CDN (`public/index.html` and `public/admin.html`).
- **Backend API**: Netlify Functions running in Node.js (`netlify/functions/api.js`).
- **Free AI Models**: Server-side free inference powered by Gemini 3.8 Flash (`@google/genai`).
- **Database & Persistence**:
  - Netlify Blobs (`@netlify/blobs`) for system settings, articles, and tools index.
  - Google Cloud Firestore (`firebase-blueprint.json` & `firestore.rules`) for user accounts and private saved tool history.
- **Authentication**:
  - Public User Auth: Firebase Google Sign-In with popup.
  - Admin Dashboard Auth: JWT in `httpOnly` secure cookies with bcrypt hashing.
- **Hidden Admin URL**: Public visitors see zero admin links on the site; only users who visit `/admin` directly can access the login portal.

```text
web-nasir/
├── netlify.toml               # Netlify build, redirects (/api/*, /admin, /*)
├── package.json               # Serverless dependencies & scripts
├── firebase-blueprint.json    # Firestore intermediate blueprint
├── firestore.rules            # Hardened Zero-Trust ABAC security rules
├── firebase-applet-config.json# Firebase configuration
├── public/
│   ├── index.html             # Public website (Hash router, professional tool tiles, Google auth)
│   └── admin.html             # Admin dashboard (Home page settings + Free AI tool manager)
├── netlify/functions/
│   ├── api.js                 # Single API router for /api/* with free AI generation & tools CRUD
│   └── lib/
│       ├── store.js           # Netlify Blobs abstraction with local persistence fallback
│       ├── auth.js            # JWT sign/verify, bcrypt hashing, cookie serializers
│       └── seed.js            # 10+ free tools, articles, and home page settings
├── server.ts                  # Local development bridge for Vite/Express runtime
└── README.md
```

---

## 🚀 Key Features Added

### 1. 100% Free AI & Webmaster Utilities (Professional Tile Look)
- **AI Viral YouTube Title & Hook Crafter**: Generate high-CTR titles, 30s retention hooks, and thumbnail concepts.
- **AI SEO Blog Outline & Keyword Strategist**: Intent-driven article structures and high-CPC keyword targets.
- **AI Code, Regex & Script Explainer**: Plain-English breakdowns and optimizations for complex code or regex.
- **AI AdSense & Social Ad Copy Generator**: Click-optimized headlines and ad copy variations.
- **AdSense & Website Revenue Estimator**: Interactive calculator for traffic, RPM, and earnings.
- **AI Brand & Domain Name Generator**: Instant brand names with simulated TLD availability and vibe score.
- **Social Media Viral Caption & Hashtags**: High/mid/niche hashtag clusters and hooks.
- **Military-Grade Password Tool**: In-browser cryptographic entropy generator.
- **Content SEO & Word Density Analyzer**: Real-time reading time, word count, and keyword density.
- **Exact Age & Milestone Calculator**: Exact years, months, days, hours lived, and next birthday countdown.

### 2. Admin Panel: Home Page Settings & Free AI Tool Manager
- **Home Page Settings Tab**:
  - Toggle announcement bar, set badge, text, and link.
  - Edit hero headline and subtitle.
  - Configure the 4 home page metrics (Experience, Top RPM, Deployments, Free Tools).
  - Update Nasir's quote and credentials.
  - Customize trust badges and social media links.
- **Dynamic Free AI Tools Manager**:
  - Admin can easily click **"Add New Free Tool"** to add any new tool.
  - Configure tool name, slug, category, badge label, icon, tool type, and custom AI prompt instructions.
  - Any new tool added appears on the home page and tools hub immediately!
  - Edit, toggle, reorder, or delete tools on the fly.

### 3. Google Sign-In & User Saved History (Firebase)
- Users can sign in with Google directly from the navigation bar.
- On any AI tool or calculator output, users can click **"Save to My Account"**.
- Saved generations are stored privately in Firestore (`/users/{userId}/saved_generations`) and can be reviewed or copied anytime via the **"Saved"** drawer.

### 4. Admin Access
- **Admin Portal URL**: `/admin` (completely hidden from all public links, mobile menus, and footer)
- **Default Username**: `admin`
- **Default Password**: `admin123` *(requires password change upon initial login)*

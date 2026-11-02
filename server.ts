import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
// @ts-ignore
import { handler } from './netlify/functions/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Global CORS middleware
app.use((req, res, next) => {
  const reqOrigin = req.headers.origin || req.headers.referer;
  let origin = '';
  if (reqOrigin) {
    try {
      origin = new URL(reqOrigin as string).origin;
    } catch {
      origin = reqOrigin as string;
    }
  }

  if (origin && origin !== '*') {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Access-Token');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Serve Firebase Applet Config explicitly
app.get('/firebase-applet-config.json', (req, res) => {
  const configPath = path.join(__dirname, 'public', 'firebase-applet-config.json');
  res.sendFile(configPath);
});

// Admin direct routes
app.get(['/admin', '/admin.html'], (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Forward /sitemap.xml, /robots.txt, /api/*, and /.netlify/functions/api/* to the Netlify function handler
app.all(
  ['/sitemap.xml', '/robots.txt', '/api', '/api/*', '/.netlify/functions/api', '/.netlify/functions/api/*'],
  async (req, res) => {
    try {
      const rawPath = req.originalUrl.split('?')[0];
      const event = {
        httpMethod: req.method,
        path: rawPath,
        queryStringParameters: req.query as Record<string, string>,
        headers: req.headers as Record<string, string>,
        body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : null,
      };

      const response = await handler(event, {});

      if (response.headers) {
        for (const [key, value] of Object.entries(response.headers)) {
          if (value !== undefined) {
            if (key.toLowerCase() === 'access-control-allow-origin' && value === '*' && req.headers.origin) {
              res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
              res.setHeader('Access-Control-Allow-Credentials', 'true');
            } else {
              res.setHeader(key, value as string);
            }
          }
        }
      }

      const multiHeaders = (response as any).multiValueHeaders;
      if (multiHeaders) {
        for (const [key, values] of Object.entries(multiHeaders)) {
          if (Array.isArray(values)) {
            res.setHeader(key, values);
          }
        }
      }

      if ((response as any).isBase64Encoded && response.body) {
        const buf = Buffer.from(response.body, 'base64');
        return res.status(response.statusCode).send(buf);
      }

      res.status(response.statusCode).send(response.body);
    } catch (err: any) {
      console.error('Server bridge error:', err);
      res.status(500).json({ error: 'Server bridge error', details: err.message });
    }
  }
);

// 301 Redirects for legacy query URLs or /articles -> /guides
app.get('/articles', (req, res) => {
  res.redirect(301, '/guides');
});
app.get('/articles/:slug', (req, res) => {
  res.redirect(301, `/guides/${req.params.slug}`);
});

// Serve static directory
app.use(express.static(path.join(__dirname, 'public')));

// Fallback to public/index.html for all clean SPA routes (/about, /contact, /tools, /tools/:slug, /courses, /courses/:slug, /free-courses, /guides, /guides/:slug, /topics, etc.)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Web Nasir server running on http://0.0.0.0:${PORT}`);
});

import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { handler as netlifyApiHandler } from './netlify/functions/api.js';
import { resolveRouteSeoData, injectSeoIntoHtml } from './netlify/functions/lib/seo-ssr.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Parse JSON and URL-encoded bodies (50MB limit to support base64 image/video uploads in Media Library)
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Bridge adapter to invoke the Netlify Function (exports.handler) directly from Express
  const invokeNetlifyFunction = async (req: express.Request, res: express.Response) => {
    try {
      const event = {
        path: req.originalUrl.split('?')[0],
        httpMethod: req.method,
        headers: req.headers as Record<string, string>,
        queryStringParameters: req.query as Record<string, string>,
        body: req.body && Object.keys(req.body).length > 0 ? JSON.stringify(req.body) : null,
        isBase64Encoded: false,
      };

      const result: any = await netlifyApiHandler(event, {});

      if (result.headers) {
        for (const [key, value] of Object.entries(result.headers)) {
          if (value !== undefined) {
            res.setHeader(key, value as string);
          }
        }
      }

      const status = result.statusCode || 200;
      if (result.isBase64Encoded && result.body) {
        return res.status(status).send(Buffer.from(result.body, 'base64'));
      }
      return res.status(status).send(result.body);
    } catch (error) {
      console.error('Error in Netlify API Bridge:', error);
      return res.status(500).json({ error: 'Internal Server Bridge Error' });
    }
  };

  // Mount API routes to match Netlify redirects (/api/* and /.netlify/functions/api/*)
  app.all('/api/*', invokeNetlifyFunction);
  app.all('/.netlify/functions/api/*', invokeNetlifyFunction);
  app.all('/downloads/courses/*', invokeNetlifyFunction);
  app.get('/sitemap.xml', invokeNetlifyFunction);
  app.get('/robots.txt', invokeNetlifyFunction);

  // Serve static files from /public (disable automatic index.html on '/' so SSR metadata injection runs)
  const publicDir = path.join(__dirname, 'public');
  app.use(express.static(publicDir, { index: false }));

  // Serve firebase-applet-config.json if present in root
  app.get('/firebase-applet-config.json', (req, res) => {
    const configPath = path.join(__dirname, 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      res.setHeader('Content-Type', 'application/json');
      return res.sendFile(configPath);
    }
    return res.status(404).json({ error: 'Firebase config not found' });
  });

  // Clean URL route for /admin
  app.get(['/admin', '/admin/'], (req, res) => {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    res.sendFile(path.join(publicDir, 'admin.html'));
  });

  // Canonical 301 Redirects for legacy paths
  app.get('/guides', (req, res) => {
    return res.redirect(301, '/articles');
  });
  app.get('/guides/:slug', (req, res) => {
    return res.redirect(301, `/articles/${req.params.slug}`);
  });
  app.get('/tracks', (req, res) => {
    return res.redirect(301, '/learning-pathways');
  });
  app.get('/student', (req, res) => {
    return res.redirect(301, '/student/dashboard');
  });

  // Dynamic SSR Metadata + Clean URL Handler for all frontend routes
  app.get('*', async (req, res) => {
    try {
      const indexHtmlPath = path.join(publicDir, 'index.html');
      const rawHtml = fs.readFileSync(indexHtmlPath, 'utf8');
      const seoData = await resolveRouteSeoData(req.path);
      const enrichedHtml = injectSeoIntoHtml(rawHtml, seoData);

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      if (seoData.robots.includes('noindex')) {
        res.setHeader('X-Robots-Tag', seoData.robots);
      }
      return res.status(seoData.statusCode || 200).send(enrichedHtml);
    } catch (err) {
      console.error('SSR injection fallback notice:', err);
      return res.sendFile(path.join(publicDir, 'index.html'));
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Web Nasir server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

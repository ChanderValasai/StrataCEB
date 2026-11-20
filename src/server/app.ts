import express from 'express';
import {
  assertDatabaseConfigured,
  checkDatabaseHealth,
} from '../db/index.ts';
import {
  createFaqRecord,
  createGalleryRecord,
  createInquiryRecord,
  createLabReportRecord,
  createNewsRecord,
  createProductRecord,
  createProjectRecord,
  deleteFaqRecord,
  deleteGalleryRecord,
  deleteInquiryRecord,
  deleteLabReportRecord,
  deleteNewsRecord,
  deleteProductRecord,
  deleteProjectRecord,
  getAdminOverviewBundle,
  getPublicSiteBundle,
  updateFaqRecord,
  updateInquiryRecord,
  updateLabReportRecord,
  updateNewsRecord,
  updateProductRecord,
  updateProjectRecord,
  updateSiteSettingsRecord,
} from '../db/queries.ts';
import { updateUserRole } from '../db/users.ts';
import { buildJsonLdGraph, buildSeoMetadata, SEO_DEFAULTS } from '../lib/seo.ts';
import { AuthRequest, requireAdminRole, requireAuth } from '../middleware/auth.ts';

export const app = express();
app.set('trust proxy', 1);

const jsonParser = express.json({ limit: '1mb' });
app.use((req, res, next) => {
  // Vercel serverless may pre-parse req.body before invoking the handler
  if (req.body !== undefined && typeof req.body === 'object') {
    return next();
  }
  return jsonParser(req, res, next);
});

// Security and crawlability headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (req.path.startsWith('/assets/aistudio/') || req.path === '/favicon.svg') {
    res.setHeader(
      'Cache-Control',
      'public, max-age=604800, stale-while-revalidate=86400'
    );
  }
  next();
});

export function resolveBaseUrl(req: express.Request): string {
  const configured = process.env.APP_URL?.trim();
  if (configured) {
    return configured.replace(/\/+$/, '');
  }
  const forwardedProto = req.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const protocol = forwardedProto || req.protocol || 'https';
  const host = req.get('x-forwarded-host') || req.get('host') || 'localhost:3000';
  return `${protocol}://${host}`.replace(/\/+$/, '');
}

function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatApiError(error: unknown, fallback: string): string {
  if (!(error instanceof Error)) {
    return typeof error === 'string' && error.trim() ? error : fallback;
  }
  const pgErr = error as Error & {
    code?: string;
    detail?: string;
    cause?: unknown;
  };
  const cause = pgErr.cause;
  const parts: string[] = [error.message || fallback];

  if (cause instanceof Error && cause.message && cause.message !== error.message) {
    const causePg = cause as Error & { code?: string; detail?: string };
    const codeTag = causePg.code ? ` [${causePg.code}]` : '';
    parts.push(`${cause.message}${codeTag}`);
  } else if (pgErr.code) {
    parts.push(`[${pgErr.code}]`);
  }

  return parts.join(' — ');
}

export async function injectSeoIntoHtml(
  rawHtml: string,
  req: express.Request
): Promise<string> {
  const baseUrl = resolveBaseUrl(req);
  const pathname = req.path || '/';
  let bundle = null;
  try {
    assertDatabaseConfigured();
    bundle = await getPublicSiteBundle();
  } catch {
    bundle = null;
  }

  const meta = buildSeoMetadata(baseUrl, pathname, bundle);
  const escapedTitle = escapeHtmlAttr(meta.title);
  const escapedDesc = escapeHtmlAttr(meta.description);
  const escapedUrl = escapeHtmlAttr(meta.canonicalUrl);
  const escapedImage = escapeHtmlAttr(meta.ogImage);
  const escapedImageAlt = escapeHtmlAttr(meta.ogImageAlt);
  const escapedSiteName = escapeHtmlAttr(meta.siteName);
  const escapedRobots = escapeHtmlAttr(meta.robots);

  let html = rawHtml
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapedTitle}</title>`)
    .replace(
      /<meta\s+name="description"[^>]*>/i,
      `<meta name="description" content="${escapedDesc}" />`
    )
    .replace(
      /<meta\s+name="robots"[^>]*>/i,
      `<meta name="robots" content="${escapedRobots}" />`
    )
    .replace(
      /<meta\s+name="googlebot"[^>]*>/i,
      `<meta name="googlebot" content="${escapedRobots}" />`
    )
    .replace(
      /(?:<link\s+rel="canonical"[^>]*>|<!--\s*SEO_CANONICAL_LINK\s*-->)/i,
      `<link rel="canonical" href="${escapedUrl}" />`
    )
    .replace(
      /<meta\s+property="og:type"[^>]*>/i,
      `<meta property="og:type" content="${escapeHtmlAttr(meta.ogType)}" />`
    )
    .replace(
      /<meta\s+property="og:site_name"[^>]*>/i,
      `<meta property="og:site_name" content="${escapedSiteName}" />`
    )
    .replace(
      /<meta\s+property="og:title"[^>]*>/i,
      `<meta property="og:title" content="${escapedTitle}" />`
    )
    .replace(
      /<meta\s+property="og:description"[^>]*>/i,
      `<meta property="og:description" content="${escapedDesc}" />`
    )
    .replace(
      /<meta\s+property="og:url"[^>]*>/i,
      `<meta property="og:url" content="${escapedUrl}" />`
    )
    .replace(
      /<meta\s+property="og:image"[^>]*>/i,
      `<meta property="og:image" content="${escapedImage}" />`
    )
    .replace(
      /<meta\s+property="og:image:alt"[^>]*>/i,
      `<meta property="og:image:alt" content="${escapedImageAlt}" />`
    )
    .replace(
      /<meta\s+name="twitter:title"[^>]*>/i,
      `<meta name="twitter:title" content="${escapedTitle}" />`
    )
    .replace(
      /<meta\s+name="twitter:description"[^>]*>/i,
      `<meta name="twitter:description" content="${escapedDesc}" />`
    )
    .replace(
      /<meta\s+name="twitter:image"[^>]*>/i,
      `<meta name="twitter:image" content="${escapedImage}" />`
    )
    .replace(
      /<meta\s+name="twitter:image:alt"[^>]*>/i,
      `<meta name="twitter:image:alt" content="${escapedImageAlt}" />`
    );

  if (meta.isAdmin) {
    html = html.replace(
      /<script\s+id="limestone-jsonld"[^>]*>[\s\S]*?<\/script>/i,
      ''
    );
  } else {
    const jsonLd = JSON.stringify(buildJsonLdGraph(baseUrl, bundle)).replace(
      /<\/script>/gi,
      '<\\/script>'
    );
    html = html.replace(
      /<script\s+id="limestone-jsonld"[^>]*>[\s\S]*?<\/script>/i,
      `<script id="limestone-jsonld" type="application/ld+json">${jsonLd}</script>`
    );
  }

  return html;
}

// Simple in-memory IP rate limiter for public inquiry submission
const inquiryHits = new Map<string, number[]>();
const RATE_WINDOW_MS = 60_000;
const RATE_MAX_HITS = 8;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (inquiryHits.get(ip) ?? []).filter(
    (ts) => now - ts < RATE_WINDOW_MS
  );
  if (timestamps.length >= RATE_MAX_HITS) {
    inquiryHits.set(ip, timestamps);
    return true;
  }
  timestamps.push(now);
  inquiryHits.set(ip, timestamps);
  return false;
}

function slugify(value: string): string {
  const base = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${base || 'item'}-${Date.now().toString(36)}`;
}

// Health endpoint with live PostgreSQL and schema check
app.get('/api/health', async (_req, res) => {
  const mode = process.env.DATABASE_URL
    ? 'database_url'
    : process.env.SQL_HOST
      ? 'cloudsql_env'
      : 'unconfigured';

  try {
    const health = await checkDatabaseHealth();
    if (!health.connected || !health.schemaReady) {
      const message =
        health.error ||
        (!health.schemaReady
          ? 'Connected to PostgreSQL, but database schema tables (e.g. site_settings) are missing. Run db/schema_and_seed.sql.'
          : 'Database health check failed.');
      console.error('GET /api/health failed:', message);
      return res.status(500).json({
        status: 'error',
        databaseMode: mode,
        databaseConnected: health.connected,
        schemaReady: health.schemaReady,
        error: message,
      });
    }

    return res.json({
      status: 'ok',
      databaseMode: mode,
      databaseConnected: true,
      schemaReady: true,
    });
  } catch (error: unknown) {
    console.error('GET /api/health unexpected error:', error);
    return res.status(500).json({
      status: 'error',
      databaseMode: mode,
      databaseConnected: false,
      schemaReady: false,
      error: formatApiError(error, 'Database health check failed.'),
    });
  }
});

// Search Engine Crawl Directives
app.get('/robots.txt', (req, res) => {
  try {
    const baseUrl = resolveBaseUrl(req);
    res.type('text/plain').send(
      [
        'User-agent: *',
        'Allow: /',
        'Disallow: /admin',
        'Disallow: /api/admin/',
        '',
        `Sitemap: ${baseUrl}/sitemap.xml`,
      ].join('\n')
    );
  } catch (error: unknown) {
    console.error('GET /robots.txt error:', error);
    res.status(500).type('text/plain').send('User-agent: *\nAllow: /');
  }
});

// Dynamic XML Sitemap
app.get('/sitemap.xml', async (req, res) => {
  try {
    const baseUrl = resolveBaseUrl(req);
    let lastMod = new Date().toISOString().slice(0, 10);
    try {
      assertDatabaseConfigured();
      const bundle = await getPublicSiteBundle();
      const latestNewsDate = bundle.news[0]?.publishedAt;
      if (latestNewsDate && /^\d{4}-\d{2}-\d{2}$/.test(latestNewsDate)) {
        lastMod = latestNewsDate;
      }
    } catch (error: unknown) {
      console.error('GET /sitemap.xml database fallback warning:', error);
    }

    const urls = [
      {
        loc: `${baseUrl}/`,
        lastmod: lastMod,
        changefreq: 'weekly',
        priority: '1.0',
      },
      {
        loc: `${baseUrl}/story`,
        lastmod: lastMod,
        changefreq: 'monthly',
        priority: '0.8',
      },
      {
        loc: `${baseUrl}${SEO_DEFAULTS.conceptNotePath}`,
        lastmod: lastMod,
        changefreq: 'monthly',
        priority: '0.7',
      },
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (entry) => `  <url>
    <loc>${escapeHtmlAttr(entry.loc)}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

    res.type('application/xml').send(xml);
  } catch (error: unknown) {
    console.error('GET /sitemap.xml error:', error);
    res.status(500).json({
      error: formatApiError(error, 'Failed to generate sitemap.'),
    });
  }
});

// Public site data
app.get('/api/site-data', async (_req, res) => {
  try {
    assertDatabaseConfigured();
    const bundle = await getPublicSiteBundle();
    res.json(bundle);
  } catch (error: unknown) {
    console.error('GET /api/site-data error:', error);
    res.status(500).json({
      error: formatApiError(error, 'Unable to load website content.'),
    });
  }
});

// Public inquiry submission with validation and honeypot spam protection
app.post('/api/inquiries', async (req, res) => {
  const clientIp = req.ip || 'unknown';
  if (isRateLimited(clientIp)) {
    return res
      .status(429)
      .json({ error: 'Too many requests. Please wait a minute before trying again.' });
  }

  const body = req.body ?? {};
  // Honeypot anti-spam field (must remain empty)
  if (typeof body.website === 'string' && body.website.trim().length > 0) {
    return res.status(400).json({ error: 'Invalid submission.' });
  }

  const customerName = String(body.customerName ?? '').trim();
  const organizationName = String(body.organizationName ?? '').trim() || null;
  const email = String(body.email ?? '').trim();
  const phone = String(body.phone ?? '').trim();
  const inquiryType = String(body.inquiryType ?? 'Product Inquiry').trim();
  const productInterest = String(body.productInterest ?? 'General').trim();
  const estimatedQuantity = String(body.estimatedQuantity ?? '').trim() || null;
  const projectLocation = String(body.projectLocation ?? '').trim();
  const message = String(body.message ?? '').trim();

  if (!customerName || customerName.length < 2) {
    return res.status(400).json({ error: 'Full name is required.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }
  if (!phone || phone.length < 7) {
    return res.status(400).json({ error: 'Please provide a valid phone number.' });
  }
  if (!projectLocation) {
    return res.status(400).json({ error: 'Project location is required.' });
  }
  if (!message || message.length < 10) {
    return res
      .status(400)
      .json({ error: 'Please include brief project details (at least 10 characters).' });
  }

  try {
    assertDatabaseConfigured();
    const created = await createInquiryRecord({
      customerName,
      organizationName,
      email,
      phone,
      inquiryType,
      productInterest,
      estimatedQuantity,
      projectLocation,
      message,
    });
    res.status(201).json({
      id: created.id,
      status: created.status,
      createdAt: created.createdAt,
    });
  } catch (error: unknown) {
    console.error('POST /api/inquiries error:', error);
    res.status(500).json({
      error: formatApiError(error, 'Unable to submit inquiry.'),
    });
  }
});

// Authenticated admin endpoints
app.get('/api/admin/me', requireAuth, (req: AuthRequest, res) => {
  res.json({ user: req.dbUser });
});

app.get('/api/admin/overview', requireAuth, async (req: AuthRequest, res) => {
  try {
    const isAdmin = req.dbUser?.role === 'admin';
    const data = await getAdminOverviewBundle(isAdmin);
    res.json({ ...data, currentUser: req.dbUser });
  } catch (error: unknown) {
    console.error('GET /api/admin/overview error:', error);
    res.status(500).json({
      error: formatApiError(error, 'Unable to load dashboard data.'),
    });
  }
});

// Products CRUD
app.post('/api/admin/products', requireAuth, async (req: AuthRequest, res) => {
  const body = req.body ?? {};
  const name = String(body.name ?? '').trim();
  const summary = String(body.summary ?? '').trim();
  const categoryId = Number(body.categoryId);
  if (!name || !summary || !Number.isFinite(categoryId)) {
    return res
      .status(400)
      .json({ error: 'Product name, summary, and category are required.' });
  }
  try {
    const created = await createProductRecord({
      categoryId,
      name,
      slug: slugify(name),
      summary,
      description: String(body.description ?? summary).trim(),
      dimensions:
        String(body.dimensions ?? '').trim() || 'Pending mold confirmation',
      dimensionStatus:
        body.dimensionStatus === 'confirmed'
          ? 'confirmed'
          : 'pending_confirmation',
      binderSpec:
        String(body.binderSpec ?? '').trim() || 'Pending mix confirmation',
      applications: String(body.applications ?? '').trim() || 'Pending confirmation',
      features: String(body.features ?? '').trim() || 'Interlocking CSEB unit',
      imageUrl:
        String(body.imageUrl ?? '').trim() ||
        '/assets/aistudio/compressed-stabilised-earth-blocks_ccb5ffe6.jpg',
      technicalDocUrl: body.technicalDocUrl ? String(body.technicalDocUrl).trim() : null,
      availabilityStatus: String(body.availabilityStatus ?? 'planned_production'),
      isPublished: body.isPublished !== false,
    });
    res.status(201).json(created);
  } catch (error: unknown) {
    console.error('POST /api/admin/products error:', error);
    res.status(500).json({
      error: formatApiError(error, 'Failed to create product.'),
    });
  }
});

app.patch('/api/admin/products/:id', requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Invalid product ID.' });
  }
  try {
    const body = req.body ?? {};
    const updated = await updateProductRecord(id, {
      categoryId: body.categoryId ? Number(body.categoryId) : undefined,
      name: body.name !== undefined ? String(body.name).trim() : undefined,
      summary: body.summary !== undefined ? String(body.summary).trim() : undefined,
      description:
        body.description !== undefined ? String(body.description).trim() : undefined,
      dimensions:
        body.dimensions !== undefined ? String(body.dimensions).trim() : undefined,
      dimensionStatus: body.dimensionStatus,
      binderSpec:
        body.binderSpec !== undefined ? String(body.binderSpec).trim() : undefined,
      applications:
        body.applications !== undefined ? String(body.applications).trim() : undefined,
      features:
        body.features !== undefined ? String(body.features).trim() : undefined,
      availabilityStatus: body.availabilityStatus,
      isPublished:
        typeof body.isPublished === 'boolean' ? body.isPublished : undefined,
    });
    if (!updated) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    res.json(updated);
  } catch (error: unknown) {
    console.error('PATCH /api/admin/products/:id error:', error);
    res.status(500).json({
      error: formatApiError(error, 'Failed to update product.'),
    });
  }
});

app.delete('/api/admin/products/:id', requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Invalid product ID.' });
  }
  try {
    const deleted = await deleteProductRecord(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    res.json({ deleted: true, id });
  } catch (error: unknown) {
    console.error('DELETE /api/admin/products/:id error:', error);
    res.status(500).json({
      error: formatApiError(error, 'Failed to delete product.'),
    });
  }
});

// Lab Reports CRUD
app.post('/api/admin/lab-reports', requireAuth, async (req: AuthRequest, res) => {
  const body = req.body ?? {};
  const title = String(body.title ?? '').trim();
  const reportCode = String(body.reportCode ?? '').trim();
  const institution = String(body.institution ?? '').trim();
  const summary = String(body.summary ?? '').trim();
  if (!title || !reportCode || !institution || !summary) {
    return res
      .status(400)
      .json({ error: 'Title, report code, institution, and summary are required.' });
  }
  try {
    const created = await createLabReportRecord({
      title,
      reportCode,
      institution,
      testAgeDays: String(body.testAgeDays ?? '14 & 28 days').trim(),
      verificationStatus:
        body.verificationStatus === 'verified' ? 'verified' : 'planned',
      summary,
      documentUrl: body.documentUrl ? String(body.documentUrl).trim() : null,
      publishedDate:
        String(body.publishedDate ?? '').trim() ||
        new Date().toISOString().slice(0, 10),
    });
    res.status(201).json(created);
  } catch (error: unknown) {
    console.error('POST /api/admin/lab-reports error:', error);
    res.status(500).json({
      error: formatApiError(error, 'Failed to create lab report.'),
    });
  }
});

app.patch(
  '/api/admin/lab-reports/:id',
  requireAuth,
  async (req: AuthRequest, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: 'Invalid report ID.' });
    }
    try {
      const body = req.body ?? {};
      const updated = await updateLabReportRecord(id, {
        title: body.title !== undefined ? String(body.title).trim() : undefined,
        verificationStatus:
          body.verificationStatus === 'verified' ||
          body.verificationStatus === 'planned'
            ? body.verificationStatus
            : undefined,
        summary: body.summary !== undefined ? String(body.summary).trim() : undefined,
        publishedDate:
          body.publishedDate !== undefined
            ? String(body.publishedDate).trim()
            : undefined,
      });
      if (!updated) {
        return res.status(404).json({ error: 'Lab report not found.' });
      }
      res.json(updated);
    } catch (error: unknown) {
      console.error('PATCH /api/admin/lab-reports/:id error:', error);
      res.status(500).json({
        error: formatApiError(error, 'Failed to update lab report.'),
      });
    }
  }
);

app.delete(
  '/api/admin/lab-reports/:id',
  requireAuth,
  async (req: AuthRequest, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: 'Invalid report ID.' });
    }
    try {
      const deleted = await deleteLabReportRecord(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Lab report not found.' });
      }
      res.json({ deleted: true, id });
    } catch (error: unknown) {
      console.error('DELETE /api/admin/lab-reports/:id error:', error);
      res.status(500).json({
        error: formatApiError(error, 'Failed to delete lab report.'),
      });
    }
  }
);

// Projects CRUD
app.post('/api/admin/projects', requireAuth, async (req: AuthRequest, res) => {
  const body = req.body ?? {};
  const title = String(body.title ?? '').trim();
  const location = String(body.location ?? '').trim();
  const description = String(body.description ?? '').trim();
  if (!title || !location || !description) {
    return res
      .status(400)
      .json({ error: 'Project title, location, and description are required.' });
  }
  try {
    const created = await createProjectRecord({
      title,
      location,
      projectType: String(body.projectType ?? 'Demonstration Build').trim(),
      status: String(body.status ?? 'planned_demo'),
      description,
      imageUrl:
        String(body.imageUrl ?? '').trim() ||
        '/assets/aistudio/SMB-1024x536_225f679f.webp',
      isPublished: body.isPublished !== false,
    });
    res.status(201).json(created);
  } catch (error: unknown) {
    console.error('POST /api/admin/projects error:', error);
    res.status(500).json({
      error: formatApiError(error, 'Failed to create project.'),
    });
  }
});

app.patch('/api/admin/projects/:id', requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Invalid project ID.' });
  }
  try {
    const body = req.body ?? {};
    const updated = await updateProjectRecord(id, {
      status: body.status !== undefined ? String(body.status) : undefined,
      isPublished:
        typeof body.isPublished === 'boolean' ? body.isPublished : undefined,
    });
    if (!updated) {
      return res.status(404).json({ error: 'Project not found.' });
    }
    res.json(updated);
  } catch (error: unknown) {
    console.error('PATCH /api/admin/projects/:id error:', error);
    res.status(500).json({
      error: formatApiError(error, 'Failed to update project.'),
    });
  }
});

app.delete('/api/admin/projects/:id', requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Invalid project ID.' });
  }
  try {
    const deleted = await deleteProjectRecord(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Project not found.' });
    }
    res.json({ deleted: true, id });
  } catch (error: unknown) {
    console.error('DELETE /api/admin/projects/:id error:', error);
    res.status(500).json({
      error: formatApiError(error, 'Failed to delete project.'),
    });
  }
});

// Gallery CRUD
app.post('/api/admin/gallery', requireAuth, async (req: AuthRequest, res) => {
  const body = req.body ?? {};
  const title = String(body.title ?? '').trim();
  const caption = String(body.caption ?? '').trim();
  if (!title || !caption) {
    return res.status(400).json({ error: 'Title and caption are required.' });
  }
  try {
    const created = await createGalleryRecord({
      title,
      category: String(body.category ?? 'product').trim(),
      caption,
      imageUrl:
        String(body.imageUrl ?? '').trim() ||
        '/assets/aistudio/SMB-1024x536_225f679f.webp',
      isPublished: body.isPublished !== false,
    });
    res.status(201).json(created);
  } catch (error: unknown) {
    console.error('POST /api/admin/gallery error:', error);
    res.status(500).json({
      error: formatApiError(error, 'Failed to create gallery item.'),
    });
  }
});

app.delete('/api/admin/gallery/:id', requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Invalid gallery ID.' });
  }
  try {
    const deleted = await deleteGalleryRecord(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Gallery item not found.' });
    }
    res.json({ deleted: true, id });
  } catch (error: unknown) {
    console.error('DELETE /api/admin/gallery/:id error:', error);
    res.status(500).json({
      error: formatApiError(error, 'Failed to delete gallery item.'),
    });
  }
});

// FAQs CRUD
app.post('/api/admin/faqs', requireAuth, async (req: AuthRequest, res) => {
  const body = req.body ?? {};
  const question = String(body.question ?? '').trim();
  const answer = String(body.answer ?? '').trim();
  if (!question || !answer) {
    return res.status(400).json({ error: 'Question and answer are required.' });
  }
  try {
    const created = await createFaqRecord({
      question,
      answer,
      category: String(body.category ?? 'General').trim(),
      sortOrder: Number(body.sortOrder ?? 10),
      isPublished: body.isPublished !== false,
    });
    res.status(201).json(created);
  } catch (error: unknown) {
    console.error('POST /api/admin/faqs error:', error);
    res.status(500).json({
      error: formatApiError(error, 'Failed to create FAQ.'),
    });
  }
});

app.patch('/api/admin/faqs/:id', requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Invalid FAQ ID.' });
  }
  try {
    const body = req.body ?? {};
    const updated = await updateFaqRecord(id, {
      isPublished:
        typeof body.isPublished === 'boolean' ? body.isPublished : undefined,
      question: body.question !== undefined ? String(body.question).trim() : undefined,
      answer: body.answer !== undefined ? String(body.answer).trim() : undefined,
    });
    if (!updated) {
      return res.status(404).json({ error: 'FAQ not found.' });
    }
    res.json(updated);
  } catch (error: unknown) {
    console.error('PATCH /api/admin/faqs/:id error:', error);
    res.status(500).json({
      error: formatApiError(error, 'Failed to update FAQ.'),
    });
  }
});

app.delete('/api/admin/faqs/:id', requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Invalid FAQ ID.' });
  }
  try {
    const deleted = await deleteFaqRecord(id);
    if (!deleted) {
      return res.status(404).json({ error: 'FAQ not found.' });
    }
    res.json({ deleted: true, id });
  } catch (error: unknown) {
    console.error('DELETE /api/admin/faqs/:id error:', error);
    res.status(500).json({
      error: formatApiError(error, 'Failed to delete FAQ.'),
    });
  }
});

// News CRUD
app.post('/api/admin/news', requireAuth, async (req: AuthRequest, res) => {
  const body = req.body ?? {};
  const title = String(body.title ?? '').trim();
  const summary = String(body.summary ?? '').trim();
  const content = String(body.content ?? '').trim();
  if (!title || !summary || !content) {
    return res
      .status(400)
      .json({ error: 'Title, summary, and content are required.' });
  }
  try {
    const created = await createNewsRecord({
      title,
      slug: slugify(title),
      category: String(body.category ?? 'Business Update').trim(),
      summary,
      content,
      publishedAt:
        String(body.publishedAt ?? '').trim() ||
        new Date().toISOString().slice(0, 10),
      isPublished: body.isPublished !== false,
    });
    res.status(201).json(created);
  } catch (error: unknown) {
    console.error('POST /api/admin/news error:', error);
    res.status(500).json({
      error: formatApiError(error, 'Failed to publish news.'),
    });
  }
});

app.patch('/api/admin/news/:id', requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Invalid news ID.' });
  }
  try {
    const body = req.body ?? {};
    const updated = await updateNewsRecord(id, {
      isPublished:
        typeof body.isPublished === 'boolean' ? body.isPublished : undefined,
    });
    if (!updated) {
      return res.status(404).json({ error: 'News item not found.' });
    }
    res.json(updated);
  } catch (error: unknown) {
    console.error('PATCH /api/admin/news/:id error:', error);
    res.status(500).json({
      error: formatApiError(error, 'Failed to update news item.'),
    });
  }
});

app.delete('/api/admin/news/:id', requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Invalid news ID.' });
  }
  try {
    const deleted = await deleteNewsRecord(id);
    if (!deleted) {
      return res.status(404).json({ error: 'News item not found.' });
    }
    res.json({ deleted: true, id });
  } catch (error: unknown) {
    console.error('DELETE /api/admin/news/:id error:', error);
    res.status(500).json({
      error: formatApiError(error, 'Failed to delete news item.'),
    });
  }
});

// Inquiries Management
app.patch('/api/admin/inquiries/:id', requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Invalid inquiry ID.' });
  }
  try {
    const body = req.body ?? {};
    const updated = await updateInquiryRecord(id, {
      status: body.status ? String(body.status) : undefined,
      adminNotes:
        body.adminNotes !== undefined ? String(body.adminNotes) : undefined,
    });
    if (!updated) {
      return res.status(404).json({ error: 'Inquiry not found.' });
    }
    res.json(updated);
  } catch (error: unknown) {
    console.error('PATCH /api/admin/inquiries/:id error:', error);
    res.status(500).json({
      error: formatApiError(error, 'Failed to update inquiry.'),
    });
  }
});

app.delete('/api/admin/inquiries/:id', requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Invalid inquiry ID.' });
  }
  try {
    const deleted = await deleteInquiryRecord(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Inquiry not found.' });
    }
    res.json({ deleted: true, id });
  } catch (error: unknown) {
    console.error('DELETE /api/admin/inquiries/:id error:', error);
    res.status(500).json({
      error: formatApiError(error, 'Failed to delete inquiry.'),
    });
  }
});

// Site Settings & User Roles (Admin only)
app.patch(
  '/api/admin/settings/:id',
  requireAuth,
  requireAdminRole,
  async (req: AuthRequest, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: 'Invalid settings ID.' });
    }
    try {
      const body = req.body ?? {};
      const updated = await updateSiteSettingsRecord(id, {
        companyName:
          body.companyName !== undefined ? String(body.companyName).trim() : undefined,
        tagline: body.tagline !== undefined ? String(body.tagline).trim() : undefined,
        plantLocation:
          body.plantLocation !== undefined
            ? String(body.plantLocation).trim()
            : undefined,
        contactEmail:
          body.contactEmail !== undefined
            ? String(body.contactEmail).trim()
            : undefined,
        contactPhone:
          body.contactPhone !== undefined
            ? String(body.contactPhone).trim()
            : undefined,
        solarCapacity:
          body.solarCapacity !== undefined
            ? String(body.solarCapacity).trim()
            : undefined,
        plannedMonthlyCapacity:
          body.plannedMonthlyCapacity !== undefined
            ? String(body.plannedMonthlyCapacity).trim()
            : undefined,
        disclaimerText:
          body.disclaimerText !== undefined
            ? String(body.disclaimerText).trim()
            : undefined,
      });
      if (!updated) {
        return res.status(404).json({ error: 'Settings record not found.' });
      }
      res.json(updated);
    } catch (error: unknown) {
      console.error('PATCH /api/admin/settings/:id error:', error);
      res.status(500).json({
        error: formatApiError(error, 'Failed to update settings.'),
      });
    }
  }
);

app.patch(
  '/api/admin/users/:id/role',
  requireAuth,
  requireAdminRole,
  async (req: AuthRequest, res) => {
    const id = Number(req.params.id);
    const role = req.body?.role === 'admin' ? 'admin' : 'editor';
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: 'Invalid user ID.' });
    }
    try {
      const updated = await updateUserRole(id, role);
      if (!updated) {
        return res.status(404).json({ error: 'User not found.' });
      }
      res.json(updated);
    } catch (error: unknown) {
      console.error('PATCH /api/admin/users/:id/role error:', error);
      res.status(500).json({
        error: formatApiError(error, 'Failed to update user role.'),
      });
    }
  }
);

// Global Express error handler so middleware errors return structured JSON instead of crashing
app.use(
  (
    err: unknown,
    req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(`Unhandled Express error on ${req.method} ${req.originalUrl}:`, err);
    if (res.headersSent) {
      return;
    }
    res.status(500).json({
      error: formatApiError(err, 'Internal server error.'),
    });
  }
);

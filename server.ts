import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import { getOrCreateUser, listAllUsers, updateUserRole } from './src/db/users.ts';
import {
  getOrSeedPortalSettings,
  savePortalSettings,
  listBranchControls,
  upsertBranchControl,
  deleteBranchControl,
  listFeedbackRatings,
  insertFeedbackRating,
  deleteFeedbackRating,
  appendAuditLog,
  listAuditLogs,
} from './src/db/adminRepo.ts';
import { runMapsGroundingQuery } from './src/services/mapsGrounding.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface FeedSource {
  id: string;
  name: string;
  category: string;
  url: string;
}

interface CurrentAffairItem {
  id: string;
  title: string;
  summary: string;
  link: string;
  source: string;
  category: string;
  image: string;
  pubDate: string;
  timestamp: number;
  dateKey: string;
  timeDisplay: string;
}

interface CurrentAffairsDayGroup {
  dateKey: string;
  dateLabel: string;
  items: CurrentAffairItem[];
}

const INDIAN_CA_FEEDS: FeedSource[] = [
  {
    id: 'hindu-national',
    name: 'The Hindu · India',
    category: 'National',
    url: 'https://www.thehindu.com/news/national/feeder/default.rss'
  },
  {
    id: 'hindu-business',
    name: 'The Hindu · Business',
    category: 'Banking & Economy',
    url: 'https://www.thehindu.com/business/feeder/default.rss'
  },
  {
    id: 'et-economy',
    name: 'Economic Times',
    category: 'Banking & Economy',
    url: 'https://economictimes.indiatimes.com/news/economy/rssfeeds/1373380680.cms'
  },
  {
    id: 'bs-economy',
    name: 'Business Standard',
    category: 'Banking & Economy',
    url: 'https://www.business-standard.com/rss/economy-policy-102.rss'
  },
  {
    id: 'livemint-economy',
    name: 'Livemint · Economy',
    category: 'Banking & Economy',
    url: 'https://www.livemint.com/rss/economy'
  },
  {
    id: 'toi-india',
    name: 'Times of India',
    category: 'National',
    url: 'https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms'
  },
  {
    id: 'hindu-science',
    name: 'The Hindu · Science & Tech',
    category: 'Science & Tech',
    url: 'https://www.thehindu.com/sci-tech/science/feeder/default.rss'
  },
  {
    id: 'hindu-world',
    name: 'The Hindu · World',
    category: 'International',
    url: 'https://www.thehindu.com/news/international/feeder/default.rss'
  }
];

let cachedPayload: {
  fetchedAt: string;
  expiresAt: number;
  sources: string[];
  totalItems: number;
  days: CurrentAffairsDayGroup[];
} | null = null;

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_m, dec) => String.fromCharCode(Number(dec)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_m, hex) => String.fromCharCode(parseInt(hex, 16)));
}

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractTagContent(block: string, tagName: string): string {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
  const match = block.match(regex);
  return match ? match[1].trim() : '';
}

function extractImageUrl(block: string, rawDescription: string): string {
  const mediaContent = block.match(/<media:content[^>]*\burl=["']([^"']+)["']/i);
  if (mediaContent && mediaContent[1]) return mediaContent[1];

  const mediaThumb = block.match(/<media:thumbnail[^>]*\burl=["']([^"']+)["']/i);
  if (mediaThumb && mediaThumb[1]) return mediaThumb[1];

  const enclosureImg = block.match(/<enclosure[^>]*\burl=["']([^"']+)["'][^>]*>/i);
  if (enclosureImg && enclosureImg[1]) return enclosureImg[1];

  const decodedDesc = decodeHtmlEntities(rawDescription);
  const imgTag = decodedDesc.match(/<img[^>]*\bsrc=["']([^"']+)["']/i);
  if (imgTag && imgTag[1]) return imgTag[1];

  const imgFallback = block.match(/<img[^>]*\bsrc=["']([^"']+)["']/i);
  if (imgFallback && imgFallback[1]) return imgFallback[1];

  return '';
}

function formatDateInIst(ts: number): { dateKey: string; dateLabel: string; timeDisplay: string } {
  const dateObj = new Date(ts);
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(dateObj);

  const year = parts.find((p) => p.type === 'year')?.value || '2026';
  const month = parts.find((p) => p.type === 'month')?.value || '01';
  const day = parts.find((p) => p.type === 'day')?.value || '01';
  const dateKey = `${year}-${month}-${day}`;

  const dateLabel = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(dateObj);

  const timeDisplay = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(dateObj);

  return { dateKey, dateLabel, timeDisplay };
}

function getTodayAndYesterdayIstKeys(): { todayKey: string; yesterdayKey: string } {
  const now = Date.now();
  const todayKey = formatDateInIst(now).dateKey;
  const yesterdayKey = formatDateInIst(now - 24 * 60 * 60 * 1000).dateKey;
  return { todayKey, yesterdayKey };
}

async function fetchSingleFeed(feed: FeedSource): Promise<CurrentAffairItem[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(feed.url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        Accept: 'application/rss+xml, application/xml, text/xml, */*'
      }
    });
    if (!response.ok) return [];
    const xml = await response.text();
    const itemMatches = xml.match(/<item\b[\s\S]*?<\/item>/gi) || [];

    const items: CurrentAffairItem[] = [];
    for (let i = 0; i < Math.min(itemMatches.length, 18); i++) {
      const block = itemMatches[i];
      const rawTitle = extractTagContent(block, 'title');
      const rawLink = extractTagContent(block, 'link');
      const rawDesc = extractTagContent(block, 'description');
      const rawContent = extractTagContent(block, 'content:encoded');
      const rawPubDate = extractTagContent(block, 'pubDate');

      const title = stripTags(decodeHtmlEntities(rawTitle));
      const link = decodeHtmlEntities(rawLink).trim();
      if (!title || !link || !link.startsWith('http')) continue;

      const summaryRaw = stripTags(decodeHtmlEntities(rawDesc || rawContent));
      const summary =
        summaryRaw.length > 240 ? `${summaryRaw.slice(0, 237).trim()}...` : summaryRaw;

      const image = extractImageUrl(block, rawDesc || rawContent);
      const parsedTs = rawPubDate ? Date.parse(rawPubDate) : NaN;
      const timestamp = Number.isFinite(parsedTs) ? parsedTs : Date.now() - i * 60000;
      const { dateKey, timeDisplay } = formatDateInIst(timestamp);

      items.push({
        id: `${feed.id}-${i}-${Buffer.from(link).toString('base64').slice(0, 12)}`,
        title,
        summary: summary || `Latest Indian ${feed.category.toLowerCase()} update reported by ${feed.name}.`,
        link,
        source: feed.name,
        category: feed.category,
        image,
        pubDate: rawPubDate || new Date(timestamp).toUTCString(),
        timestamp,
        dateKey,
        timeDisplay
      });
    }
    return items;
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

async function aggregateCurrentAffairs(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedPayload && cachedPayload.expiresAt > now) {
    return cachedPayload;
  }

  const results = await Promise.all(INDIAN_CA_FEEDS.map((f) => fetchSingleFeed(f)));
  const flat = results.flat();

  const seenTitles = new Set<string>();
  const deduped: CurrentAffairItem[] = [];

  flat.sort((a, b) => b.timestamp - a.timestamp);
  for (const item of flat) {
    const key = item.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 64);
    if (!key || seenTitles.has(key)) continue;
    seenTitles.add(key);
    deduped.push(item);
  }

  const { todayKey, yesterdayKey } = getTodayAndYesterdayIstKeys();
  const groupMap = new Map<string, CurrentAffairsDayGroup>();

  for (const item of deduped) {
    let group = groupMap.get(item.dateKey);
    if (!group) {
      const { dateLabel } = formatDateInIst(item.timestamp);
      let decoratedLabel = dateLabel;
      if (item.dateKey === todayKey) {
        decoratedLabel = `Today · ${dateLabel}`;
      } else if (item.dateKey === yesterdayKey) {
        decoratedLabel = `Yesterday · ${dateLabel}`;
      }
      group = {
        dateKey: item.dateKey,
        dateLabel: decoratedLabel,
        items: []
      };
      groupMap.set(item.dateKey, group);
    }
    group.items.push(item);
  }

  const days = Array.from(groupMap.values()).sort((a, b) =>
    b.dateKey.localeCompare(a.dateKey)
  );

  if (deduped.length === 0 && cachedPayload && cachedPayload.totalItems > 0) {
    return {
      ...cachedPayload,
      expiresAt: now + 60 * 1000
    };
  }

  const activeSources = Array.from(new Set(deduped.map((d) => d.source)));

  cachedPayload = {
    fetchedAt: new Date(now).toISOString(),
    expiresAt: now + 5 * 60 * 1000,
    sources: activeSources,
    totalItems: deduped.length,
    days
  };

  return cachedPayload;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '1mb' }));

  app.get('/api/current-affairs', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-store');
    try {
      const force = req.query.refresh === '1';
      const data = await aggregateCurrentAffairs(force);
      res.json({
        success: true,
        fetchedAt: data.fetchedAt,
        sources: data.sources,
        totalItems: data.totalItems,
        days: data.days
      });
    } catch (err) {
      console.error('Current affairs fetch error:', err);
      res.status(500).json({
        success: false,
        error: 'Unable to fetch Indian current affairs feeds right now.'
      });
    }
  });

  // Google Maps Grounding via gemini-4-hydrogen (server-side)
  app.post('/api/maps/grounding', async (req, res) => {
    try {
      const { query, latitude, longitude } = req.body || {};
      if (!query || typeof query !== 'string' || !query.trim()) {
        return res.status(400).json({ error: 'Please provide a location or branch query.' });
      }
      const result = await runMapsGroundingQuery({
        query: query.trim(),
        latitude: typeof latitude === 'number' ? latitude : undefined,
        longitude: typeof longitude === 'number' ? longitude : undefined,
      });
      res.json({ success: true, ...result });
    } catch (error: any) {
      console.error('Maps grounding error:', error);
      res.status(500).json({
        success: false,
        error: error?.message || 'Unable to fetch Google Maps location intelligence right now.',
      });
    }
  });

  // Authenticated Cloud SQL Sync for logged-in Firebase users
  app.get('/api/portal/sync', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const email = req.user!.email || 'unknown@user';
      const displayName = String(req.user!.name || '');

      const dbUser = await getOrCreateUser(uid, email, displayName);
      const [settings, branches, feedback] = await Promise.all([
        getOrSeedPortalSettings(),
        listBranchControls(),
        listFeedbackRatings(),
      ]);

      const avgRating =
        feedback.length > 0
          ? Number(
              (
                feedback.reduce((sum, f) => sum + Number(f.rating || 5), 0) /
                feedback.length
              ).toFixed(1)
            )
          : null;

      res.json({
        success: true,
        user: dbUser,
        settings,
        branchControls: branches,
        feedbackSummary: {
          count: feedback.length,
          average: avgRating,
        },
      });
    } catch (error: any) {
      console.error('Portal sync failed:', error);
      res.status(500).json({
        success: false,
        error: error?.message || 'Unable to synchronize portal settings.',
      });
    }
  });

  // Submit feedback rating to Cloud SQL (auth-protected)
  app.post('/api/feedback', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { rating, tags, comment } = req.body || {};
      const email = req.user!.email || 'anonymous';
      await getOrCreateUser(req.user!.uid, email, String(req.user!.name || ''));
      const entry = await insertFeedbackRating({
        rating: Number(rating) || 5,
        tags: Array.isArray(tags) ? tags.map(String) : [],
        comment: typeof comment === 'string' ? comment : '',
        submittedByEmail: email,
      });
      res.json({ success: true, entry });
    } catch (error: any) {
      console.error('Feedback save failed:', error);
      res.status(500).json({
        success: false,
        error: error?.message || 'Unable to save feedback.',
      });
    }
  });

  // Admin Panel Full Control Center Endpoints (requires Firebase Auth + admin role)
  app.get('/api/admin/overview', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const email = req.user!.email || '';
      const dbUser = await getOrCreateUser(uid, email, String(req.user!.name || ''));
      if (dbUser.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Administrator privileges required to view full Admin Control Center.',
        });
      }

      const [settings, branches, feedback, auditLogs, usersList] = await Promise.all([
        getOrSeedPortalSettings(),
        listBranchControls(),
        listFeedbackRatings(),
        listAuditLogs(),
        listAllUsers(),
      ]);

      res.json({
        success: true,
        user: dbUser,
        settings,
        branchControls: branches,
        feedbackRatings: feedback,
        auditLogs,
        users: usersList,
      });
    } catch (error: any) {
      console.error('Admin overview failed:', error);
      res.status(500).json({
        success: false,
        error: error?.message || 'Unable to load Admin Control Center.',
      });
    }
  });

  app.put('/api/admin/settings', requireAuth, async (req: AuthRequest, res) => {
    try {
      const dbUser = await getOrCreateUser(
        req.user!.uid,
        req.user!.email || '',
        String(req.user!.name || '')
      );
      if (dbUser.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Admin role required.' });
      }

      const body = req.body || {};
      const updated = await savePortalSettings(
        {
          maintenanceMode:
            typeof body.maintenanceMode === 'boolean' ? body.maintenanceMode : undefined,
          maintenanceMessage:
            typeof body.maintenanceMessage === 'string' ? body.maintenanceMessage : undefined,
          notificationMessage:
            typeof body.notificationMessage === 'string' ? body.notificationMessage : undefined,
          defaultEmiInsurance:
            body.defaultEmiInsurance === 'double' ||
            body.defaultEmiInsurance === 'single' ||
            body.defaultEmiInsurance === 'none'
              ? body.defaultEmiInsurance
              : undefined,
          defaultThemeMode:
            body.defaultThemeMode === 'dark' || body.defaultThemeMode === 'light'
              ? body.defaultThemeMode
              : undefined,
          scene3dDefaultMode:
            typeof body.scene3dDefaultMode === 'boolean' ? body.scene3dDefaultMode : undefined,
          featurePermissionsJson:
            body.featurePermissionsJson && typeof body.featurePermissionsJson === 'object'
              ? body.featurePermissionsJson
              : undefined,
        },
        dbUser.email
      );

      await appendAuditLog({
        actorUid: dbUser.uid,
        actorEmail: dbUser.email,
        action: 'UPDATE_PORTAL_SETTINGS',
        details: `Maint=${updated.maintenanceMode}, 3D=${updated.scene3dDefaultMode}, EMI=${updated.defaultEmiInsurance}`,
      });

      const settings = await getOrSeedPortalSettings();
      const auditLogs = await listAuditLogs();
      res.json({ success: true, settings, auditLogs });
    } catch (error: any) {
      console.error('Update portal settings failed:', error);
      res.status(500).json({
        success: false,
        error: error?.message || 'Unable to save portal settings.',
      });
    }
  });

  app.put('/api/admin/branches', requireAuth, async (req: AuthRequest, res) => {
    try {
      const dbUser = await getOrCreateUser(
        req.user!.uid,
        req.user!.email || '',
        String(req.user!.name || '')
      );
      if (dbUser.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Admin role required.' });
      }

      const { branchName, priorityStatus, isLocked, adminNote } = req.body || {};
      if (!branchName || typeof branchName !== 'string' || !branchName.trim()) {
        return res.status(400).json({ success: false, error: 'Branch name is required.' });
      }

      const validPriority =
        priorityStatus === 'high' ||
        priorityStatus === 'critical' ||
        priorityStatus === 'resolved'
          ? priorityStatus
          : 'normal';

      const saved = await upsertBranchControl(
        {
          branchName: branchName.trim(),
          priorityStatus: validPriority,
          isLocked: Boolean(isLocked),
          adminNote: typeof adminNote === 'string' ? adminNote.trim() : '',
        },
        dbUser.email
      );

      await appendAuditLog({
        actorUid: dbUser.uid,
        actorEmail: dbUser.email,
        action: 'UPSERT_BRANCH_CONTROL',
        details: `${saved.branchName} -> priority=${saved.priorityStatus}, locked=${saved.isLocked}`,
      });

      const [branchControls, auditLogs] = await Promise.all([
        listBranchControls(),
        listAuditLogs(),
      ]);
      res.json({ success: true, branchControls, auditLogs });
    } catch (error: any) {
      console.error('Upsert branch control failed:', error);
      res.status(500).json({
        success: false,
        error: error?.message || 'Unable to update branch control.',
      });
    }
  });

  app.delete('/api/admin/branches/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const dbUser = await getOrCreateUser(
        req.user!.uid,
        req.user!.email || '',
        String(req.user!.name || '')
      );
      if (dbUser.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Admin role required.' });
      }

      const id = Number(req.params.id);
      if (!Number.isFinite(id)) {
        return res.status(400).json({ success: false, error: 'Invalid branch control ID.' });
      }
      await deleteBranchControl(id);
      await appendAuditLog({
        actorUid: dbUser.uid,
        actorEmail: dbUser.email,
        action: 'DELETE_BRANCH_CONTROL',
        details: `Removed branch override #${id}`,
      });

      const [branchControls, auditLogs] = await Promise.all([
        listBranchControls(),
        listAuditLogs(),
      ]);
      res.json({ success: true, branchControls, auditLogs });
    } catch (error: any) {
      console.error('Delete branch control failed:', error);
      res.status(500).json({
        success: false,
        error: error?.message || 'Unable to remove branch control.',
      });
    }
  });

  app.delete('/api/admin/feedback/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const dbUser = await getOrCreateUser(
        req.user!.uid,
        req.user!.email || '',
        String(req.user!.name || '')
      );
      if (dbUser.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Admin role required.' });
      }
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) {
        return res.status(400).json({ success: false, error: 'Invalid feedback ID.' });
      }
      await deleteFeedbackRating(id);
      await appendAuditLog({
        actorUid: dbUser.uid,
        actorEmail: dbUser.email,
        action: 'DELETE_FEEDBACK',
        details: `Deleted feedback entry #${id}`,
      });

      const [feedbackRatings, auditLogs] = await Promise.all([
        listFeedbackRatings(),
        listAuditLogs(),
      ]);
      res.json({ success: true, feedbackRatings, auditLogs });
    } catch (error: any) {
      console.error('Delete feedback failed:', error);
      res.status(500).json({
        success: false,
        error: error?.message || 'Unable to delete feedback entry.',
      });
    }
  });

  app.put('/api/admin/users/:id/role', requireAuth, async (req: AuthRequest, res) => {
    try {
      const dbUser = await getOrCreateUser(
        req.user!.uid,
        req.user!.email || '',
        String(req.user!.name || '')
      );
      if (dbUser.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Admin role required.' });
      }
      const id = Number(req.params.id);
      const role = req.body?.role === 'admin' ? 'admin' : 'viewer';
      if (!Number.isFinite(id)) {
        return res.status(400).json({ success: false, error: 'Invalid user ID.' });
      }
      const updatedUser = await updateUserRole(id, role);
      await appendAuditLog({
        actorUid: dbUser.uid,
        actorEmail: dbUser.email,
        action: 'UPDATE_USER_ROLE',
        details: `User #${id} -> role=${role}`,
      });

      const [usersList, auditLogs] = await Promise.all([
        listAllUsers(),
        listAuditLogs(),
      ]);
      res.json({ success: true, updatedUser, users: usersList, auditLogs });
    } catch (error: any) {
      console.error('Update user role failed:', error);
      res.status(500).json({
        success: false,
        error: error?.message || 'Unable to update user role.',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();

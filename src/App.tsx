/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from 'react';
import { AdminDashboard } from './components/AdminDashboard';
import { EcoEarthStoryPage } from './components/EcoEarthStoryPage';
import { PublicSite } from './components/PublicSite';
import { SeoHead } from './components/SeoHead';
import type { PublicSiteBundle } from './types/limestone';

const EMPTY_BUNDLE: PublicSiteBundle = {
  settings: null,
  categories: [],
  products: [],
  rawMaterials: [],
  processSteps: [],
  qualityTests: [],
  labReports: [],
  projects: [],
  gallery: [],
  faqs: [],
  news: [],
};

type ViewMode = 'public' | 'story' | 'admin';

function resolveViewModeFromPath(pathname: string): ViewMode {
  if (pathname.startsWith('/admin')) return 'admin';
  if (pathname.startsWith('/story')) return 'story';
  return 'public';
}

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>(() =>
    resolveViewModeFromPath(window.location.pathname)
  );
  const [siteData, setSiteData] = useState<PublicSiteBundle>(EMPTY_BUNDLE);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSiteData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/site-data');
      const rawText = await res.text();
      let parsed: (PublicSiteBundle & { error?: string }) | null = null;

      if (rawText) {
        try {
          parsed = JSON.parse(rawText);
        } catch {
          parsed = null;
        }
      }

      if (!res.ok) {
        const detail =
          parsed?.error ||
          rawText
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 220) ||
          res.statusText ||
          'Failed to load website data.';
        const fullMessage = `HTTP ${res.status}${res.statusText ? ` ${res.statusText}` : ''}: ${detail}`;
        console.error('[Lime Stone] GET /api/site-data failed:', {
          url: '/api/site-data',
          status: res.status,
          statusText: res.statusText,
          error: detail,
          body: parsed ?? rawText,
        });
        throw new Error(fullMessage);
      }

      if (!parsed) {
        const invalidMsg =
          'HTTP 200: Server returned an empty or non-JSON response for /api/site-data.';
        console.error('[Lime Stone] Invalid /api/site-data response:', rawText);
        throw new Error(invalidMsg);
      }

      setSiteData(parsed);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Unable to reach Lime Stone server.';
      console.error('[Lime Stone] Failed to load website data:', err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSiteData();
  }, [fetchSiteData]);

  useEffect(() => {
    const onPopState = () => {
      setViewMode(resolveViewModeFromPath(window.location.pathname));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  function navigateTo(mode: ViewMode, sectionId?: string) {
    const targetPath =
      mode === 'admin' ? '/admin' : mode === 'story' ? '/story' : '/';
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
    setViewMode(mode);

    if (sectionId) {
      window.setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0 });
        }
      }, 60);
    } else {
      window.scrollTo({ top: 0 });
    }
  }

  return (
    <>
      <SeoHead viewMode={viewMode} siteData={siteData} />
      {viewMode === 'admin' ? (
        <AdminDashboard
          onBackToSite={() => navigateTo('public')}
          onDataUpdated={fetchSiteData}
        />
      ) : viewMode === 'story' ? (
        <EcoEarthStoryPage
          settings={siteData.settings}
          onBackToAbout={() => navigateTo('public', 'about')}
          onGoToInquiry={() => navigateTo('public', 'contact')}
        />
      ) : (
        <PublicSite
          data={siteData}
          loading={loading}
          error={error}
          onRetry={fetchSiteData}
          onOpenAdmin={() => navigateTo('admin')}
          onOpenStory={() => navigateTo('story')}
        />
      )}
    </>
  );
}

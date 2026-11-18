/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from 'react';
import { AdminDashboard } from './components/AdminDashboard';
import { PublicSite } from './components/PublicSite';
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

export default function App() {
  const [viewMode, setViewMode] = useState<'public' | 'admin'>(() =>
    window.location.pathname.startsWith('/admin') ? 'admin' : 'public'
  );
  const [siteData, setSiteData] = useState<PublicSiteBundle>(EMPTY_BUNDLE);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSiteData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/site-data');
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load website data.');
      }
      setSiteData(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Unable to reach Lime Stone server.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSiteData();
  }, [fetchSiteData]);

  useEffect(() => {
    const onPopState = () => {
      setViewMode(
        window.location.pathname.startsWith('/admin') ? 'admin' : 'public'
      );
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  function navigateTo(mode: 'public' | 'admin') {
    const targetPath = mode === 'admin' ? '/admin' : '/';
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
    setViewMode(mode);
    window.scrollTo({ top: 0 });
  }

  if (viewMode === 'admin') {
    return (
      <AdminDashboard
        onBackToSite={() => navigateTo('public')}
        onDataUpdated={fetchSiteData}
      />
    );
  }

  return (
    <PublicSite
      data={siteData}
      loading={loading}
      error={error}
      onRetry={fetchSiteData}
      onOpenAdmin={() => navigateTo('admin')}
    />
  );
}

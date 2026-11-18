import { type FormEvent, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  FileCheck2,
  HelpCircle,
  Image as ImageIcon,
  Layers,
  LayoutDashboard,
  LogOut,
  Newspaper,
  Package,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { auth, googleAuthProvider } from '../lib/firebase';
import type { AdminOverviewBundle, InquiryItem } from '../types/limestone';

type AdminTab =
  | 'overview'
  | 'inquiries'
  | 'products'
  | 'reports'
  | 'projects'
  | 'content'
  | 'settings';

interface AdminDashboardProps {
  onBackToSite: () => void;
  onDataUpdated: () => void;
}

export function AdminDashboard({
  onBackToSite,
  onDataUpdated,
}: AdminDashboardProps) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [bundle, setBundle] = useState<AdminOverviewBundle | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Inquiry filters
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState<string>('all');
  const [inquirySearch, setInquirySearch] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryItem | null>(
    null
  );
  const [noteDraft, setNoteDraft] = useState('');

  // Add Product form
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategoryId, setNewProdCategoryId] = useState<number>(1);
  const [newProdDimensions, setNewProdDimensions] = useState('');
  const [newProdDimConfirmed, setNewProdDimConfirmed] = useState(false);
  const [newProdSummary, setNewProdSummary] = useState('');
  const [newProdApps, setNewProdApps] = useState('');

  // Add Lab Report form
  const [newReportTitle, setNewReportTitle] = useState('');
  const [newReportCode, setNewReportCode] = useState('');
  const [newReportInst, setNewReportInst] = useState(
    'TIEST, Tharparkar'
  );
  const [newReportAge, setNewReportAge] = useState('14 & 28 days');
  const [newReportStatus, setNewReportStatus] = useState<'planned' | 'verified'>(
    'planned'
  );
  const [newReportSummary, setNewReportSummary] = useState('');

  // Add Project form
  const [newProjTitle, setNewProjTitle] = useState('');
  const [newProjLocation, setNewProjLocation] = useState('Mithi, Tharparkar');
  const [newProjType, setNewProjType] = useState('Demonstration Build');
  const [newProjDesc, setNewProjDesc] = useState('');

  // Add FAQ & News forms
  const [newFaqQ, setNewFaqQ] = useState('');
  const [newFaqA, setNewFaqA] = useState('');
  const [newNewsTitle, setNewNewsTitle] = useState('');
  const [newNewsSummary, setNewNewsSummary] = useState('');
  const [newNewsContent, setNewNewsContent] = useState('');

  // Settings draft
  const [settingsForm, setSettingsForm] = useState({
    companyName: '',
    tagline: '',
    plantLocation: '',
    contactEmail: '',
    contactPhone: '',
    solarCapacity: '',
    plannedMonthlyCapacity: '',
    disclaimerText: '',
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  async function authedFetch(url: string, options: RequestInit = {}) {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Authentication session expired. Please sign in again.');
    }
    const idToken = await user.getIdToken();
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
        ...(options.headers ?? {}),
      },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Request failed (${res.status})`);
    }
    return data;
  }

  async function loadOverview() {
    if (!auth.currentUser) return;
    setLoading(true);
    setApiError(null);
    try {
      const data: AdminOverviewBundle = await authedFetch('/api/admin/overview');
      setBundle(data);
      if (data.categories.length > 0) {
        setNewProdCategoryId(data.categories[0].id);
      }
      if (data.settings) {
        setSettingsForm({
          companyName: data.settings.companyName,
          tagline: data.settings.tagline,
          plantLocation: data.settings.plantLocation,
          contactEmail: data.settings.contactEmail,
          contactPhone: data.settings.contactPhone,
          solarCapacity: data.settings.solarCapacity,
          plannedMonthlyCapacity: data.settings.plannedMonthlyCapacity,
          disclaimerText: data.settings.disclaimerText,
        });
      }
    } catch (err: unknown) {
      setApiError(
        err instanceof Error ? err.message : 'Unable to load admin console.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (firebaseUser) {
      loadOverview();
    } else {
      setBundle(null);
    }
  }, [firebaseUser]);

  function notify(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3500);
  }

  async function handleGoogleSignIn() {
    setAuthBusy(true);
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (err: unknown) {
      setAuthError(
        err instanceof Error ? err.message : 'Google sign-in failed.'
      );
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleSignOut() {
    await signOut(auth);
    setBundle(null);
  }

  async function handleUpdateInquiry(
    id: number,
    status: string,
    adminNotes?: string | null
  ) {
    try {
      await authedFetch(`/api/admin/inquiries/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, adminNotes }),
      });
      await loadOverview();
      onDataUpdated();
      notify(`Inquiry #${id} updated to "${status}".`);
      if (selectedInquiry?.id === id) {
        setSelectedInquiry(null);
      }
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Failed to update inquiry.');
    }
  }

  async function handleDeleteInquiry(id: number) {
    try {
      await authedFetch(`/api/admin/inquiries/${id}`, { method: 'DELETE' });
      await loadOverview();
      notify(`Inquiry #${id} removed.`);
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Failed to delete inquiry.');
    }
  }

  async function handleCreateProduct(e: FormEvent) {
    e.preventDefault();
    try {
      await authedFetch('/api/admin/products', {
        method: 'POST',
        body: JSON.stringify({
          categoryId: newProdCategoryId,
          name: newProdName,
          dimensions: newProdDimensions,
          dimensionStatus: newProdDimConfirmed
            ? 'confirmed'
            : 'pending_confirmation',
          summary: newProdSummary,
          applications: newProdApps,
        }),
      });
      setNewProdName('');
      setNewProdDimensions('');
      setNewProdSummary('');
      setNewProdApps('');
      await loadOverview();
      onDataUpdated();
      notify('Product added to catalog.');
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Failed to add product.');
    }
  }

  async function handleToggleProductPublish(id: number, current: boolean) {
    try {
      await authedFetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isPublished: !current }),
      });
      await loadOverview();
      onDataUpdated();
      notify(!current ? 'Product published.' : 'Product unpublished.');
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Failed to update product.');
    }
  }

  async function handleDeleteProduct(id: number) {
    try {
      await authedFetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      await loadOverview();
      onDataUpdated();
      notify('Product deleted.');
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Failed to delete product.');
    }
  }

  async function handleCreateReport(e: FormEvent) {
    e.preventDefault();
    try {
      await authedFetch('/api/admin/lab-reports', {
        method: 'POST',
        body: JSON.stringify({
          title: newReportTitle,
          reportCode: newReportCode,
          institution: newReportInst,
          testAgeDays: newReportAge,
          verificationStatus: newReportStatus,
          summary: newReportSummary,
        }),
      });
      setNewReportTitle('');
      setNewReportCode('');
      setNewReportSummary('');
      await loadOverview();
      onDataUpdated();
      notify('Laboratory report saved.');
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Failed to create report.');
    }
  }

  async function handleToggleReportVerification(id: number, status: string) {
    const nextStatus = status === 'verified' ? 'planned' : 'verified';
    try {
      await authedFetch(`/api/admin/lab-reports/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ verificationStatus: nextStatus }),
      });
      await loadOverview();
      onDataUpdated();
      notify(`Report status updated to ${nextStatus}.`);
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Failed to update report.');
    }
  }

  async function handleDeleteReport(id: number) {
    try {
      await authedFetch(`/api/admin/lab-reports/${id}`, { method: 'DELETE' });
      await loadOverview();
      onDataUpdated();
      notify('Laboratory report deleted.');
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Failed to delete report.');
    }
  }

  async function handleCreateProject(e: FormEvent) {
    e.preventDefault();
    try {
      await authedFetch('/api/admin/projects', {
        method: 'POST',
        body: JSON.stringify({
          title: newProjTitle,
          location: newProjLocation,
          projectType: newProjType,
          description: newProjDesc,
          status: 'planned_demo',
        }),
      });
      setNewProjTitle('');
      setNewProjDesc('');
      await loadOverview();
      onDataUpdated();
      notify('Project added.');
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Failed to create project.');
    }
  }

  async function handleDeleteProject(id: number) {
    try {
      await authedFetch(`/api/admin/projects/${id}`, { method: 'DELETE' });
      await loadOverview();
      onDataUpdated();
      notify('Project deleted.');
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Failed to delete project.');
    }
  }

  async function handleCreateFaq(e: FormEvent) {
    e.preventDefault();
    try {
      await authedFetch('/api/admin/faqs', {
        method: 'POST',
        body: JSON.stringify({
          question: newFaqQ,
          answer: newFaqA,
          category: 'General',
        }),
      });
      setNewFaqQ('');
      setNewFaqA('');
      await loadOverview();
      onDataUpdated();
      notify('FAQ entry added.');
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Failed to create FAQ.');
    }
  }

  async function handleDeleteFaq(id: number) {
    try {
      await authedFetch(`/api/admin/faqs/${id}`, { method: 'DELETE' });
      await loadOverview();
      onDataUpdated();
      notify('FAQ removed.');
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Failed to delete FAQ.');
    }
  }

  async function handleCreateNews(e: FormEvent) {
    e.preventDefault();
    try {
      await authedFetch('/api/admin/news', {
        method: 'POST',
        body: JSON.stringify({
          title: newNewsTitle,
          summary: newNewsSummary,
          content: newNewsContent,
          category: 'Plant Update',
        }),
      });
      setNewNewsTitle('');
      setNewNewsSummary('');
      setNewNewsContent('');
      await loadOverview();
      onDataUpdated();
      notify('News update published.');
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Failed to publish news.');
    }
  }

  async function handleDeleteNews(id: number) {
    try {
      await authedFetch(`/api/admin/news/${id}`, { method: 'DELETE' });
      await loadOverview();
      onDataUpdated();
      notify('News item deleted.');
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Failed to delete news.');
    }
  }

  async function handleSaveSettings(e: FormEvent) {
    e.preventDefault();
    if (!bundle?.settings) return;
    try {
      await authedFetch(`/api/admin/settings/${bundle.settings.id}`, {
        method: 'PATCH',
        body: JSON.stringify(settingsForm),
      });
      await loadOverview();
      onDataUpdated();
      notify('Website settings saved.');
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Failed to save settings.');
    }
  }

  async function handleRoleChange(userId: number, role: 'admin' | 'editor') {
    try {
      await authedFetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      });
      await loadOverview();
      notify('Administrator role updated.');
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Failed to update role.');
    }
  }

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F7F6] p-6">
        <div className="text-sm text-[#4F5652]">Checking session...</div>
      </div>
    );
  }

  if (!firebaseUser) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F6F7F6] px-6 py-12">
        <div className="w-full max-w-md rounded-xl border border-[#DCE0DB] bg-white p-8">
          <div className="flex items-center justify-between">
            <span className="font-display text-xl font-bold text-[#141716]">
              Lime Stone Admin
            </span>
            <button
              type="button"
              onClick={onBackToSite}
              className="inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-[#4F5652] hover:text-[#141716] cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Public Site</span>
            </button>
          </div>

          <div className="mt-6 border-t border-[#E1E4E0] pt-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#1B4D3E]/10 text-[#1B4D3E]">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <h1 className="mt-4 font-display text-2xl font-semibold text-[#141716]">
              Administrator Sign-In
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[#4F5652]">
              Sign in with your Google account to manage Lime Stone products,
              TIEST laboratory reports, demonstration projects, FAQs, and
              customer inquiries.
            </p>

            {authError && (
              <p
                role="alert"
                className="mt-4 rounded-lg border border-[#FECDCA] bg-[#FEF3F2] px-3.5 py-2.5 text-xs font-medium text-[#B42318]"
              >
                {authError}
              </p>
            )}

            <button
              type="button"
              disabled={authBusy}
              onClick={handleGoogleSignIn}
              className="mt-6 flex min-h-11 w-full items-center justify-center rounded-lg bg-[#1B4D3E] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#153C30] disabled:opacity-60 cursor-pointer"
            >
              {authBusy ? 'Signing in...' : 'Sign in with Google'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filteredInquiries = (bundle?.inquiries ?? []).filter((inq) => {
    const matchesStatus =
      inquiryStatusFilter === 'all' || inq.status === inquiryStatusFilter;
    const q = inquirySearch.trim().toLowerCase();
    const matchesQuery =
      !q ||
      inq.customerName.toLowerCase().includes(q) ||
      inq.email.toLowerCase().includes(q) ||
      inq.projectLocation.toLowerCase().includes(q) ||
      inq.productInterest.toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

  const navItems: { id: AdminTab; label: string; icon: typeof LayoutDashboard }[] =
    [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'inquiries', label: 'Inquiries', icon: ClipboardList },
      { id: 'products', label: 'Products', icon: Package },
      { id: 'reports', label: 'Lab Reports', icon: FileCheck2 },
      { id: 'projects', label: 'Projects & Gallery', icon: ImageIcon },
      { id: 'content', label: 'FAQs & News', icon: Newspaper },
      { id: 'settings', label: 'Settings & Team', icon: Settings },
    ];

  return (
    <div className="flex min-h-screen bg-[#F6F7F6] text-[#141716]">
      {/* Fixed Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-[#E1E4E0] bg-white lg:flex">
        <div className="border-b border-[#E1E4E0] px-6 py-5">
          <span className="font-display text-lg font-bold tracking-tight text-[#141716]">
            Lime Stone
          </span>
          <p className="mt-0.5 text-xs text-[#555D58]">
            Plant &amp; Content Console
          </p>
        </div>

        <nav aria-label="Admin Navigation" className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex min-h-10 w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#1B4D3E] text-white'
                    : 'text-[#4F5652] hover:bg-[#F1F3F0] hover:text-[#141716]'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="border-t border-[#E1E4E0] p-4">
          <p className="truncate text-xs font-medium text-[#141716]">
            {bundle?.currentUser?.email ?? firebaseUser.email}
          </p>
          <p className="mt-0.5 text-xs text-[#555D58]">
            Role: {bundle?.currentUser?.role ?? 'loading'}
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={onBackToSite}
              className="flex min-h-9 flex-1 items-center justify-center rounded-md border border-[#D4D9D3] px-2.5 text-xs font-medium text-[#141716] hover:bg-[#F6F7F6] cursor-pointer"
            >
              Public Site
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex min-h-9 items-center justify-center gap-1 rounded-md border border-[#D4D9D3] px-2.5 text-xs font-medium text-[#4F5652] hover:text-[#B42318] cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Console Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Bar */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E1E4E0] bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#555D58]">Admin Console</span>
            <span aria-hidden="true" className="text-[#AEB5AE]">
              /
            </span>
            <h1 className="font-display text-lg font-semibold text-[#141716] capitalize">
              {navItems.find((n) => n.id === activeTab)?.label ?? 'Overview'}
            </h1>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <select
              aria-label="Select admin section"
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as AdminTab)}
              className="min-h-10 rounded-lg border border-[#D4D9D3] bg-white px-3 text-xs font-medium"
            >
              {navItems.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={onBackToSite}
              className="min-h-10 rounded-lg border border-[#D4D9D3] px-3 text-xs font-medium"
            >
              Public Site
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="min-h-10 rounded-lg border border-[#D4D9D3] px-3 text-xs font-medium"
            >
              Sign Out
            </button>
          </div>

          <button
            type="button"
            onClick={loadOverview}
            disabled={loading}
            className="hidden min-h-9 items-center rounded-lg border border-[#D4D9D3] bg-white px-3.5 text-xs font-medium text-[#141716] hover:bg-[#F6F7F6] lg:inline-flex cursor-pointer"
          >
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </header>

        {/* Feedback Banners */}
        {toast && (
          <div
            role="status"
            className="mx-6 mt-4 flex items-center gap-2 rounded-lg border border-[#C6D8D0] bg-white px-4 py-2.5 text-sm text-[#1B4D3E]"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{toast}</span>
          </div>
        )}

        {apiError && (
          <div
            role="alert"
            className="mx-6 mt-4 flex items-center justify-between rounded-lg border border-[#FECDCA] bg-[#FEF3F2] px-4 py-2.5 text-sm text-[#B42318]"
          >
            <span>{apiError}</span>
            <button
              type="button"
              onClick={() => setApiError(null)}
              className="text-xs font-medium underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="flex-1 p-6">
          {loading && !bundle ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((skeleton) => (
                <div
                  key={skeleton}
                  className="h-24 animate-pulse rounded-xl border border-[#E1E4E0] bg-white p-5"
                />
              ))}
            </div>
          ) : !bundle ? (
            <div className="rounded-xl border border-[#E1E4E0] bg-white p-8 text-center">
              <p className="text-sm text-[#4F5652]">
                Unable to load administrative records.
              </p>
              <button
                type="button"
                onClick={loadOverview}
                className="mt-4 rounded-lg bg-[#1B4D3E] px-4 py-2 text-xs font-medium text-white cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-[#E1E4E0] bg-white p-5">
                      <p className="text-xs text-[#555D58]">Total Inquiries</p>
                      <p className="mt-2 font-mono text-2xl font-medium tabular-nums">
                        {bundle.inquiries.length}
                      </p>
                      <p className="mt-1 text-xs text-[#4F5652]">
                        {
                          bundle.inquiries.filter((i) => i.status === 'new')
                            .length
                        }{' '}
                        awaiting review
                      </p>
                    </div>
                    <div className="rounded-xl border border-[#E1E4E0] bg-white p-5">
                      <p className="text-xs text-[#555D58]">Published Products</p>
                      <p className="mt-2 font-mono text-2xl font-medium tabular-nums">
                        {bundle.products.filter((p) => p.isPublished).length}
                      </p>
                      <p className="mt-1 text-xs text-[#4F5652]">
                        Across {bundle.categories.length} categories
                      </p>
                    </div>
                    <div className="rounded-xl border border-[#E1E4E0] bg-white p-5">
                      <p className="text-xs text-[#555D58]">Lab Reports</p>
                      <p className="mt-2 font-mono text-2xl font-medium tabular-nums">
                        {bundle.labReports.length}
                      </p>
                      <p className="mt-1 text-xs text-[#4F5652]">
                        {
                          bundle.labReports.filter(
                            (r) => r.verificationStatus === 'verified'
                          ).length
                        }{' '}
                        verified ·{' '}
                        {
                          bundle.labReports.filter(
                            (r) => r.verificationStatus === 'planned'
                          ).length
                        }{' '}
                        planned
                      </p>
                    </div>
                    <div className="rounded-xl border border-[#E1E4E0] bg-white p-5">
                      <p className="text-xs text-[#555D58]">Projects &amp; FAQs</p>
                      <p className="mt-2 font-mono text-2xl font-medium tabular-nums">
                        {bundle.projects.length} / {bundle.faqs.length}
                      </p>
                      <p className="mt-1 text-xs text-[#4F5652]">
                        {bundle.news.length} news announcements
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#E1E4E0] bg-white">
                    <div className="flex items-center justify-between border-b border-[#E1E4E0] px-6 py-4">
                      <h2 className="font-display text-base font-semibold">
                        Recent Customer Inquiries
                      </h2>
                      <button
                        type="button"
                        onClick={() => setActiveTab('inquiries')}
                        className="text-xs font-medium text-[#1B4D3E] hover:underline cursor-pointer"
                      >
                        Manage All
                      </button>
                    </div>

                    {bundle.inquiries.length === 0 ? (
                      <div className="p-8 text-center text-sm text-[#555D58]">
                        No customer inquiries submitted yet. New inquiries from
                        the public contact form will appear here.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="border-b border-[#E1E4E0] bg-[#F6F7F6] text-xs text-[#555D58]">
                            <tr>
                              <th className="px-6 py-3 font-medium">Name</th>
                              <th className="px-6 py-3 font-medium">Product</th>
                              <th className="px-6 py-3 font-medium">Location</th>
                              <th className="px-6 py-3 font-medium">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E1E4E0]">
                            {bundle.inquiries.slice(0, 5).map((inq) => (
                              <tr key={inq.id} className="hover:bg-[#FAFBF9]">
                                <td className="px-6 py-3 font-medium">
                                  {inq.customerName}
                                </td>
                                <td className="px-6 py-3 text-[#4F5652]">
                                  {inq.productInterest}
                                </td>
                                <td className="px-6 py-3 text-[#4F5652]">
                                  {inq.projectLocation}
                                </td>
                                <td className="px-6 py-3 capitalize">
                                  <span
                                    className={
                                      inq.status === 'responded'
                                        ? 'text-[#16A34A] font-medium'
                                        : inq.status === 'new'
                                          ? 'text-[#D97706] font-medium'
                                          : 'text-[#4F5652]'
                                    }
                                  >
                                    {inq.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* INQUIRIES TAB */}
              {activeTab === 'inquiries' && (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-1 rounded-lg border border-[#DCE0DB] bg-white p-1">
                      {['all', 'new', 'reviewed', 'responded', 'archived'].map(
                        (st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setInquiryStatusFilter(st)}
                            className={`min-h-9 rounded-md px-3 text-xs font-medium capitalize cursor-pointer ${
                              inquiryStatusFilter === st
                                ? 'bg-[#1B4D3E] text-white'
                                : 'text-[#4F5652] hover:text-[#141716]'
                            }`}
                          >
                            {st}
                          </button>
                        )
                      )}
                    </div>

                    <div className="relative w-full sm:w-72">
                      <Search
                        className="pointer-events-none absolute top-3 left-3 h-4 w-4 text-[#868E89]"
                        aria-hidden="true"
                      />
                      <input
                        type="search"
                        value={inquirySearch}
                        onChange={(e) => setInquirySearch(e.target.value)}
                        placeholder="Search name, email, location..."
                        className="min-h-10 w-full rounded-lg border border-[#DCE0DB] bg-white pr-3 pl-9 text-sm"
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#E1E4E0] bg-white">
                    {filteredInquiries.length === 0 ? (
                      <div className="p-10 text-center text-sm text-[#555D58]">
                        No inquiries match the selected filter.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="border-b border-[#E1E4E0] bg-[#F6F7F6] text-xs text-[#555D58]">
                            <tr>
                              <th className="px-5 py-3 font-medium">ID</th>
                              <th className="px-5 py-3 font-medium">Customer</th>
                              <th className="px-5 py-3 font-medium">Product</th>
                              <th className="px-5 py-3 font-medium">Quantity</th>
                              <th className="px-5 py-3 font-medium">Location</th>
                              <th className="px-5 py-3 font-medium">Status</th>
                              <th className="px-5 py-3 font-medium text-right">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E1E4E0]">
                            {filteredInquiries.map((inq) => (
                              <tr key={inq.id} className="hover:bg-[#FAFBF9]">
                                <td className="px-5 py-3 font-mono text-xs tabular-nums">
                                  #{inq.id}
                                </td>
                                <td className="px-5 py-3">
                                  <p className="font-medium text-[#141716]">
                                    {inq.customerName}
                                  </p>
                                  <p className="text-xs text-[#555D58]">
                                    {inq.email} · {inq.phone}
                                  </p>
                                </td>
                                <td className="px-5 py-3 text-xs text-[#4F5652]">
                                  {inq.productInterest}
                                </td>
                                <td className="px-5 py-3 font-mono text-xs tabular-nums text-[#4F5652]">
                                  {inq.estimatedQuantity || '—'}
                                </td>
                                <td className="px-5 py-3 text-xs text-[#4F5652]">
                                  {inq.projectLocation}
                                </td>
                                <td className="px-5 py-3">
                                  <select
                                    aria-label={`Status for inquiry ${inq.id}`}
                                    value={inq.status}
                                    onChange={(e) =>
                                      handleUpdateInquiry(
                                        inq.id,
                                        e.target.value,
                                        inq.adminNotes
                                      )
                                    }
                                    className="rounded-md border border-[#D4D9D3] bg-white px-2 py-1 text-xs font-medium capitalize"
                                  >
                                    <option value="new">new</option>
                                    <option value="reviewed">reviewed</option>
                                    <option value="responded">responded</option>
                                    <option value="archived">archived</option>
                                  </select>
                                </td>
                                <td className="px-5 py-3 text-right">
                                  <div className="inline-flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedInquiry(inq);
                                        setNoteDraft(inq.adminNotes ?? '');
                                      }}
                                      className="text-xs font-medium text-[#1B4D3E] hover:underline cursor-pointer"
                                    >
                                      Details
                                    </button>
                                    <button
                                      type="button"
                                      aria-label={`Delete inquiry ${inq.id}`}
                                      onClick={() => handleDeleteInquiry(inq.id)}
                                      className="p-1 text-[#555D58] hover:text-[#DC2626] cursor-pointer"
                                    >
                                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {selectedInquiry && (
                    <div className="rounded-xl border border-[#DCE0DB] bg-white p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs text-[#555D58]">
                            Inquiry #{selectedInquiry.id} ·{' '}
                            {selectedInquiry.inquiryType}
                          </p>
                          <h3 className="mt-1 font-display text-lg font-semibold">
                            {selectedInquiry.customerName}
                            {selectedInquiry.organizationName
                              ? ` (${selectedInquiry.organizationName})`
                              : ''}
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedInquiry(null)}
                          className="text-xs font-medium text-[#4F5652] underline cursor-pointer"
                        >
                          Close
                        </button>
                      </div>
                      <p className="mt-4 rounded-lg bg-[#F6F7F6] p-4 text-sm text-[#141716]">
                        {selectedInquiry.message}
                      </p>
                      <div className="mt-4">
                        <label
                          htmlFor="admin-notes"
                          className="block text-xs font-medium text-[#4F5652]"
                        >
                          Internal Follow-up Notes
                        </label>
                        <textarea
                          id="admin-notes"
                          rows={2}
                          value={noteDraft}
                          onChange={(e) => setNoteDraft(e.target.value)}
                          className="mt-1.5 w-full rounded-lg border border-[#D4D9D3] p-2.5 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateInquiry(
                              selectedInquiry.id,
                              selectedInquiry.status,
                              noteDraft
                            )
                          }
                          className="mt-3 rounded-lg bg-[#1B4D3E] px-4 py-2 text-xs font-medium text-white cursor-pointer"
                        >
                          Save Notes
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* PRODUCTS TAB */}
              {activeTab === 'products' && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                  <div className="rounded-xl border border-[#E1E4E0] bg-white p-6 lg:col-span-5">
                    <h2 className="flex items-center gap-2 font-display text-base font-semibold">
                      <Plus className="h-4 w-4 text-[#1B4D3E]" aria-hidden="true" />
                      <span>Add Product</span>
                    </h2>
                    <form onSubmit={handleCreateProduct} className="mt-4 space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-[#4F5652]">
                          Category
                        </label>
                        <select
                          value={newProdCategoryId}
                          onChange={(e) =>
                            setNewProdCategoryId(Number(e.target.value))
                          }
                          className="mt-1 w-full rounded-lg border border-[#D4D9D3] bg-white px-3 py-2 text-sm"
                        >
                          {bundle.categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#4F5652]">
                          Product Name
                        </label>
                        <input
                          required
                          value={newProdName}
                          onChange={(e) => setNewProdName(e.target.value)}
                          placeholder="e.g. Lime Stone Corner Wall Block"
                          className="mt-1 w-full rounded-lg border border-[#D4D9D3] px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#4F5652]">
                          Dimensions
                        </label>
                        <input
                          value={newProdDimensions}
                          onChange={(e) => setNewProdDimensions(e.target.value)}
                          placeholder="e.g. 230 × 220 × 115 mm or Pending confirmation"
                          className="mt-1 w-full rounded-lg border border-[#D4D9D3] px-3 py-2 text-sm"
                        />
                        <label className="mt-2 flex items-center gap-2 text-xs text-[#4F5652]">
                          <input
                            type="checkbox"
                            checked={newProdDimConfirmed}
                            onChange={(e) =>
                              setNewProdDimConfirmed(e.target.checked)
                            }
                          />
                          <span>Mold dimensions confirmed</span>
                        </label>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#4F5652]">
                          Summary
                        </label>
                        <textarea
                          required
                          rows={2}
                          value={newProdSummary}
                          onChange={(e) => setNewProdSummary(e.target.value)}
                          className="mt-1 w-full rounded-lg border border-[#D4D9D3] px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#4F5652]">
                          Applications
                        </label>
                        <input
                          value={newProdApps}
                          onChange={(e) => setNewProdApps(e.target.value)}
                          placeholder="Residential walls, pathways, etc."
                          className="mt-1 w-full rounded-lg border border-[#D4D9D3] px-3 py-2 text-sm"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full rounded-lg bg-[#1B4D3E] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#153C30] cursor-pointer"
                      >
                        Create Product
                      </button>
                    </form>
                  </div>

                  <div className="rounded-xl border border-[#E1E4E0] bg-white lg:col-span-7">
                    <div className="border-b border-[#E1E4E0] px-6 py-4">
                      <h2 className="font-display text-base font-semibold">
                        Catalog Entries ({bundle.products.length})
                      </h2>
                    </div>
                    <div className="divide-y divide-[#E1E4E0]">
                      {bundle.products.map((prod) => (
                        <div
                          key={prod.id}
                          className="flex flex-wrap items-center justify-between gap-4 px-6 py-4"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-[#141716]">
                              {prod.name}
                            </p>
                            <p className="mt-0.5 font-mono text-xs text-[#555D58]">
                              {prod.dimensions} ·{' '}
                              {prod.isPublished ? 'Published' : 'Hidden'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleToggleProductPublish(
                                  prod.id,
                                  prod.isPublished
                                )
                              }
                              className="rounded-md border border-[#D4D9D3] px-3 py-1.5 text-xs font-medium hover:bg-[#F6F7F6] cursor-pointer"
                            >
                              {prod.isPublished ? 'Unpublish' : 'Publish'}
                            </button>
                            <button
                              type="button"
                              aria-label={`Delete ${prod.name}`}
                              onClick={() => handleDeleteProduct(prod.id)}
                              className="p-1.5 text-[#555D58] hover:text-[#DC2626] cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* LAB REPORTS TAB */}
              {activeTab === 'reports' && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                  <div className="rounded-xl border border-[#E1E4E0] bg-white p-6 lg:col-span-5">
                    <h2 className="font-display text-base font-semibold">
                      Add Lab Report / Trial Record
                    </h2>
                    <form onSubmit={handleCreateReport} className="mt-4 space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-[#4F5652]">
                          Report Title
                        </label>
                        <input
                          required
                          value={newReportTitle}
                          onChange={(e) => setNewReportTitle(e.target.value)}
                          placeholder="e.g. 28-Day Lime-Cement Compressive Trial"
                          className="mt-1 w-full rounded-lg border border-[#D4D9D3] px-3 py-2 text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-[#4F5652]">
                            Report Code
                          </label>
                          <input
                            required
                            value={newReportCode}
                            onChange={(e) => setNewReportCode(e.target.value)}
                            placeholder="TIEST-2026-02"
                            className="mt-1 w-full rounded-lg border border-[#D4D9D3] px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#4F5652]">
                            Verification Status
                          </label>
                          <select
                            value={newReportStatus}
                            onChange={(e) =>
                              setNewReportStatus(
                                e.target.value as 'planned' | 'verified'
                              )
                            }
                            className="mt-1 w-full rounded-lg border border-[#D4D9D3] bg-white px-3 py-2 text-sm"
                          >
                            <option value="planned">Planned (Pending)</option>
                            <option value="verified">Verified Result</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#4F5652]">
                          Institution
                        </label>
                        <input
                          required
                          value={newReportInst}
                          onChange={(e) => setNewReportInst(e.target.value)}
                          className="mt-1 w-full rounded-lg border border-[#D4D9D3] px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#4F5652]">
                          Test Age
                        </label>
                        <input
                          value={newReportAge}
                          onChange={(e) => setNewReportAge(e.target.value)}
                          className="mt-1 w-full rounded-lg border border-[#D4D9D3] px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#4F5652]">
                          Summary / Findings
                        </label>
                        <textarea
                          required
                          rows={3}
                          value={newReportSummary}
                          onChange={(e) => setNewReportSummary(e.target.value)}
                          className="mt-1 w-full rounded-lg border border-[#D4D9D3] px-3 py-2 text-sm"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full rounded-lg bg-[#1B4D3E] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#153C30] cursor-pointer"
                      >
                        Save Report Record
                      </button>
                    </form>
                  </div>

                  <div className="rounded-xl border border-[#E1E4E0] bg-white lg:col-span-7">
                    <div className="border-b border-[#E1E4E0] px-6 py-4">
                      <h2 className="font-display text-base font-semibold">
                        Published Lab Reports ({bundle.labReports.length})
                      </h2>
                    </div>
                    <div className="divide-y divide-[#E1E4E0]">
                      {bundle.labReports.map((rep) => (
                        <div key={rep.id} className="px-6 py-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="font-mono text-xs text-[#555D58]">
                                {rep.reportCode} · {rep.institution}
                              </p>
                              <h3 className="mt-1 font-medium text-[#141716]">
                                {rep.title}
                              </h3>
                              <p className="mt-1 text-xs text-[#4F5652]">
                                {rep.summary}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  handleToggleReportVerification(
                                    rep.id,
                                    rep.verificationStatus
                                  )
                                }
                                className={`rounded-md border px-3 py-1.5 text-xs font-medium cursor-pointer ${
                                  rep.verificationStatus === 'verified'
                                    ? 'border-[#16A34A] text-[#16A34A]'
                                    : 'border-[#D97706] text-[#D97706]'
                                }`}
                              >
                                {rep.verificationStatus === 'verified'
                                  ? 'Verified'
                                  : 'Planned (Mark Verified)'}
                              </button>
                              <button
                                type="button"
                                aria-label={`Delete ${rep.title}`}
                                onClick={() => handleDeleteReport(rep.id)}
                                className="p-1.5 text-[#555D58] hover:text-[#DC2626] cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4" aria-hidden="true" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* PROJECTS & GALLERY TAB */}
              {activeTab === 'projects' && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                  <div className="rounded-xl border border-[#E1E4E0] bg-white p-6 lg:col-span-5">
                    <h2 className="font-display text-base font-semibold">
                      Add Demonstration / Project
                    </h2>
                    <form onSubmit={handleCreateProject} className="mt-4 space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-[#4F5652]">
                          Project Title
                        </label>
                        <input
                          required
                          value={newProjTitle}
                          onChange={(e) => setNewProjTitle(e.target.value)}
                          placeholder="e.g. Mithi School Boundary Demo Wall"
                          className="mt-1 w-full rounded-lg border border-[#D4D9D3] px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#4F5652]">
                          Location
                        </label>
                        <input
                          required
                          value={newProjLocation}
                          onChange={(e) => setNewProjLocation(e.target.value)}
                          className="mt-1 w-full rounded-lg border border-[#D4D9D3] px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#4F5652]">
                          Type
                        </label>
                        <input
                          value={newProjType}
                          onChange={(e) => setNewProjType(e.target.value)}
                          className="mt-1 w-full rounded-lg border border-[#D4D9D3] px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#4F5652]">
                          Description
                        </label>
                        <textarea
                          required
                          rows={3}
                          value={newProjDesc}
                          onChange={(e) => setNewProjDesc(e.target.value)}
                          className="mt-1 w-full rounded-lg border border-[#D4D9D3] px-3 py-2 text-sm"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full rounded-lg bg-[#1B4D3E] px-4 py-2.5 text-sm font-medium text-white cursor-pointer"
                      >
                        Publish Project
                      </button>
                    </form>
                  </div>

                  <div className="space-y-6 lg:col-span-7">
                    <div className="rounded-xl border border-[#E1E4E0] bg-white">
                      <div className="border-b border-[#E1E4E0] px-6 py-4">
                        <h2 className="font-display text-base font-semibold">
                          Projects &amp; Demonstrations ({bundle.projects.length})
                        </h2>
                      </div>
                      <div className="divide-y divide-[#E1E4E0]">
                        {bundle.projects.map((proj) => (
                          <div
                            key={proj.id}
                            className="flex items-start justify-between gap-4 px-6 py-4"
                          >
                            <div>
                              <p className="font-medium text-[#141716]">
                                {proj.title}
                              </p>
                              <p className="mt-0.5 text-xs text-[#555D58]">
                                {proj.location} · {proj.projectType} ·{' '}
                                {proj.status}
                              </p>
                              <p className="mt-1.5 text-xs text-[#4F5652]">
                                {proj.description}
                              </p>
                            </div>
                            <button
                              type="button"
                              aria-label={`Delete ${proj.title}`}
                              onClick={() => handleDeleteProject(proj.id)}
                              className="p-1.5 text-[#555D58] hover:text-[#DC2626] cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* FAQS & NEWS TAB */}
              {activeTab === 'content' && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div className="space-y-6">
                    <div className="rounded-xl border border-[#E1E4E0] bg-white p-6">
                      <h2 className="flex items-center gap-2 font-display text-base font-semibold">
                        <HelpCircle
                          className="h-4 w-4 text-[#1B4D3E]"
                          aria-hidden="true"
                        />
                        <span>Add FAQ</span>
                      </h2>
                      <form onSubmit={handleCreateFaq} className="mt-4 space-y-3">
                        <input
                          required
                          value={newFaqQ}
                          onChange={(e) => setNewFaqQ(e.target.value)}
                          placeholder="Question"
                          className="w-full rounded-lg border border-[#D4D9D3] px-3 py-2 text-sm"
                        />
                        <textarea
                          required
                          rows={3}
                          value={newFaqA}
                          onChange={(e) => setNewFaqA(e.target.value)}
                          placeholder="Answer"
                          className="w-full rounded-lg border border-[#D4D9D3] px-3 py-2 text-sm"
                        />
                        <button
                          type="submit"
                          className="rounded-lg bg-[#1B4D3E] px-4 py-2 text-xs font-medium text-white cursor-pointer"
                        >
                          Add FAQ
                        </button>
                      </form>
                    </div>

                    <div className="rounded-xl border border-[#E1E4E0] bg-white">
                      <div className="border-b border-[#E1E4E0] px-6 py-4">
                        <h3 className="font-display text-sm font-semibold">
                          FAQs ({bundle.faqs.length})
                        </h3>
                      </div>
                      <div className="divide-y divide-[#E1E4E0]">
                        {bundle.faqs.map((faq) => (
                          <div
                            key={faq.id}
                            className="flex items-start justify-between gap-3 px-6 py-3.5"
                          >
                            <div>
                              <p className="text-sm font-medium">{faq.question}</p>
                              <p className="mt-1 text-xs text-[#555D58]">
                                {faq.answer}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteFaq(faq.id)}
                              className="p-1 text-[#555D58] hover:text-[#DC2626] cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="rounded-xl border border-[#E1E4E0] bg-white p-6">
                      <h2 className="flex items-center gap-2 font-display text-base font-semibold">
                        <Layers
                          className="h-4 w-4 text-[#1B4D3E]"
                          aria-hidden="true"
                        />
                        <span>Publish News Update</span>
                      </h2>
                      <form onSubmit={handleCreateNews} className="mt-4 space-y-3">
                        <input
                          required
                          value={newNewsTitle}
                          onChange={(e) => setNewNewsTitle(e.target.value)}
                          placeholder="Update Headline"
                          className="w-full rounded-lg border border-[#D4D9D3] px-3 py-2 text-sm"
                        />
                        <input
                          required
                          value={newNewsSummary}
                          onChange={(e) => setNewNewsSummary(e.target.value)}
                          placeholder="Short summary"
                          className="w-full rounded-lg border border-[#D4D9D3] px-3 py-2 text-sm"
                        />
                        <textarea
                          required
                          rows={3}
                          value={newNewsContent}
                          onChange={(e) => setNewNewsContent(e.target.value)}
                          placeholder="Full announcement details"
                          className="w-full rounded-lg border border-[#D4D9D3] px-3 py-2 text-sm"
                        />
                        <button
                          type="submit"
                          className="rounded-lg bg-[#1B4D3E] px-4 py-2 text-xs font-medium text-white cursor-pointer"
                        >
                          Publish Update
                        </button>
                      </form>
                    </div>

                    <div className="rounded-xl border border-[#E1E4E0] bg-white">
                      <div className="border-b border-[#E1E4E0] px-6 py-4">
                        <h3 className="font-display text-sm font-semibold">
                          News &amp; Announcements ({bundle.news.length})
                        </h3>
                      </div>
                      <div className="divide-y divide-[#E1E4E0]">
                        {bundle.news.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-start justify-between gap-3 px-6 py-3.5"
                          >
                            <div>
                              <p className="text-xs text-[#555D58]">
                                {item.publishedAt} · {item.category}
                              </p>
                              <p className="mt-0.5 text-sm font-medium">
                                {item.title}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteNews(item.id)}
                              className="p-1 text-[#555D58] hover:text-[#DC2626] cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SETTINGS & TEAM TAB */}
              {activeTab === 'settings' && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                  <div className="rounded-xl border border-[#E1E4E0] bg-white p-6 lg:col-span-7">
                    <h2 className="font-display text-base font-semibold">
                      Plant &amp; Website Settings
                    </h2>
                    {bundle.currentUser.role !== 'admin' ? (
                      <p className="mt-3 text-sm text-[#555D58]">
                        Only accounts with the administrator role can modify global
                        website settings.
                      </p>
                    ) : (
                      <form onSubmit={handleSaveSettings} className="mt-4 space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label className="block text-xs font-medium text-[#4F5652]">
                              Company Name
                            </label>
                            <input
                              value={settingsForm.companyName}
                              onChange={(e) =>
                                setSettingsForm((s) => ({
                                  ...s,
                                  companyName: e.target.value,
                                }))
                              }
                              className="mt-1 w-full rounded-lg border border-[#D4D9D3] px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-[#4F5652]">
                              Plant Location
                            </label>
                            <input
                              value={settingsForm.plantLocation}
                              onChange={(e) =>
                                setSettingsForm((s) => ({
                                  ...s,
                                  plantLocation: e.target.value,
                                }))
                              }
                              className="mt-1 w-full rounded-lg border border-[#D4D9D3] px-3 py-2 text-sm"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label className="block text-xs font-medium text-[#4F5652]">
                              Contact Email
                            </label>
                            <input
                              value={settingsForm.contactEmail}
                              onChange={(e) =>
                                setSettingsForm((s) => ({
                                  ...s,
                                  contactEmail: e.target.value,
                                }))
                              }
                              className="mt-1 w-full rounded-lg border border-[#D4D9D3] px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-[#4F5652]">
                              Contact Phone
                            </label>
                            <input
                              value={settingsForm.contactPhone}
                              onChange={(e) =>
                                setSettingsForm((s) => ({
                                  ...s,
                                  contactPhone: e.target.value,
                                }))
                              }
                              className="mt-1 w-full rounded-lg border border-[#D4D9D3] px-3 py-2 text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#4F5652]">
                            Tagline
                          </label>
                          <input
                            value={settingsForm.tagline}
                            onChange={(e) =>
                              setSettingsForm((s) => ({
                                ...s,
                                tagline: e.target.value,
                              }))
                            }
                            className="mt-1 w-full rounded-lg border border-[#D4D9D3] px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#4F5652]">
                            Material &amp; Testing Disclaimer
                          </label>
                          <textarea
                            rows={3}
                            value={settingsForm.disclaimerText}
                            onChange={(e) =>
                              setSettingsForm((s) => ({
                                ...s,
                                disclaimerText: e.target.value,
                              }))
                            }
                            className="mt-1 w-full rounded-lg border border-[#D4D9D3] px-3 py-2 text-sm"
                          />
                        </div>
                        <button
                          type="submit"
                          className="rounded-lg bg-[#1B4D3E] px-5 py-2.5 text-sm font-medium text-white cursor-pointer"
                        >
                          Save Settings
                        </button>
                      </form>
                    )}
                  </div>

                  <div className="rounded-xl border border-[#E1E4E0] bg-white p-6 lg:col-span-5">
                    <h2 className="font-display text-base font-semibold">
                      Authorized Users
                    </h2>
                    {bundle.users.length === 0 ? (
                      <p className="mt-3 text-sm text-[#555D58]">
                        User directory visible to primary administrators only.
                      </p>
                    ) : (
                      <div className="mt-4 divide-y divide-[#E1E4E0]">
                        {bundle.users.map((u) => (
                          <div
                            key={u.id}
                            className="flex items-center justify-between gap-3 py-3"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">
                                {u.email}
                              </p>
                              <p className="text-xs text-[#555D58]">
                                {u.displayName || 'Google Account'}
                              </p>
                            </div>
                            <select
                              aria-label={`Role for ${u.email}`}
                              value={u.role}
                              onChange={(e) =>
                                handleRoleChange(
                                  u.id,
                                  e.target.value as 'admin' | 'editor'
                                )
                              }
                              className="rounded-md border border-[#D4D9D3] bg-white px-2.5 py-1 text-xs font-medium"
                            >
                              <option value="admin">admin</option>
                              <option value="editor">editor</option>
                            </select>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

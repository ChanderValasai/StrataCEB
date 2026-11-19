import { type FormEvent, useRef, useState } from 'react';
import {
  ArrowRight,
  Check,
  ChevronDown,
  Droplets,
  ExternalLink,
  FileText,
  Lock,
  Mail,
  Menu,
  Phone,
  X,
} from 'lucide-react';
import type { GalleryItem, PublicSiteBundle } from '../types/limestone';
import { ResilientImage } from './ResilientImage';

interface PublicSiteProps {
  data: PublicSiteBundle;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onOpenAdmin: () => void;
  onOpenStory: () => void;
}

const WALL_BLOCK_PHOTOS = [
  {
    src: '/assets/aistudio/compressed-stabilised-earth-blocks_ccb5ffe6.jpg',
    label: 'Close-up interlocking block',
  },
  {
    src: '/assets/aistudio/interlocking-stabilized-soil-blocks_5532fc6f.jpg',
    label: 'Pressed interlocking soil blocks',
  },
  {
    src: '/assets/aistudio/compressed-earth-block_405e7519.jpg',
    label: 'Block profiles and dry-stack wall',
  },
  {
    src: '/assets/aistudio/Hr4-10-Automatic-Clay-Brick-Making-Machine-in-Pakistan-Mud-Block-Machine-Earth-Block-Machine-Cabro-Block-Machine_3b872809.jpg',
    label: 'Interlocking wall course stack',
  },
];

const PAVING_BLOCK_PHOTOS = [
  {
    src: '/assets/aistudio/images__20__df0911e6.jfif',
    label: 'Interlocking road paving sand bed',
  },
  {
    src: '/assets/aistudio/Paver-Block-Image_96fc06de.jpg',
    label: 'Installed walkway and floor patterns',
  },
  {
    src: '/assets/aistudio/Paving-Blocks_a9253d6d.jpg',
    label: 'Interlocking dumbbell paving units',
  },
  {
    src: '/assets/aistudio/images__21__700ce1da.jfif',
    label: 'Interlocking paver profile shapes',
  },
];

const PROCESS_STEP_MEDIA: Record<
  number,
  { src: string; alt: string; caption: string; fit: 'cover' | 'contain' }
> = {
  1: {
    src: '/assets/aistudio/Gemini_Generated_Image_orhk1yorhk1yorhk_5d952a5d.jfif',
    alt: 'Thar white clay, Thar desert sand, 0-5 mm crushed stone, hydrated lime, and cement raw materials',
    caption:
      'Staged raw inputs: Thar white clay, Thar desert sand, 0–5 mm crushed stone, hydrated lime, and cement.',
    fit: 'cover',
  },
  2: {
    src: '/assets/aistudio/Gyp_qual_e9524d29.jpeg',
    alt: 'Gypsum purity, fineness, water content, and salt (NaCl, Cl, Na) screening thresholds chart',
    caption:
      'Gypsum & salt screening reference thresholds for purity, fineness, moisture, and soluble salts.',
    fit: 'contain',
  },
};

function getRawMaterialMedia(
  name: string
): { src: string; fit: 'cover' | 'contain' } | null {
  const normalized = name.toLowerCase();
  if (normalized.includes('white clay')) {
    return {
      src: '/assets/aistudio/Thar_White_Clay_6cccc474.jfif',
      fit: 'cover',
    };
  }
  if (normalized.includes('desert sand')) {
    return {
      src: '/assets/aistudio/Thar_Desert_Sand_f476688f.jfif',
      fit: 'cover',
    };
  }
  if (normalized.includes('crushed stone')) {
    return {
      src: '/assets/aistudio/Crushed_Stone__0_5_mm__b7b2193c.jfif',
      fit: 'cover',
    };
  }
  if (normalized.includes('hydrated lime')) {
    return {
      src: '/assets/aistudio/Hydrated_Lime_3d4d229f.jfif',
      fit: 'contain',
    };
  }
  if (normalized.includes('cement')) {
    return {
      src: '/assets/aistudio/Cement_2524b46a.jfif',
      fit: 'contain',
    };
  }
  return null;
}

const HERO_PHOTOS = [
  {
    src: '/assets/aistudio/SMB-1024x536_225f679f.webp',
    label: 'Stabilized interlocking earth block wall under construction',
  },
  {
    src: '/assets/aistudio/images__25__aa06fb5c.jfif',
    label: 'Completed two-story exposed earth block residence',
  },
  {
    src: '/assets/aistudio/images__23__f237e0cc.jfif',
    label: 'Interlocking earth masonry terrace and timber roof',
  },
  {
    src: '/assets/aistudio/images__24__91e88d57.jfif',
    label: 'Earth block columns, ventilated screen, and masonry steps',
  },
];

export function PublicSite({
  data,
  loading,
  error,
  onRetry,
  onOpenAdmin,
  onOpenStory,
}: PublicSiteProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [heroPhotoIdx, setHeroPhotoIdx] = useState<number>(0);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>('all');
  const [wallPhotoIdx, setWallPhotoIdx] = useState<number>(0);
  const [pavingPhotoIdx, setPavingPhotoIdx] = useState<number>(0);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [qualityFilter, setQualityFilter] = useState<'all' | 'planned' | 'verified'>('all');
  const [galleryFilter, setGalleryFilter] = useState<string>('all');
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  // Inquiry Form State
  const [customerName, setCustomerName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [inquiryType, setInquiryType] = useState('Product Inquiry');
  const [productInterest, setProductInterest] = useState(
    'Lime Stone Interlocking Wall Block'
  );
  const [estimatedQuantity, setEstimatedQuantity] = useState('');
  const [projectLocation, setProjectLocation] = useState('');
  const [message, setMessage] = useState('');
  const [websiteHoneypot, setWebsiteHoneypot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submittedReceipt, setSubmittedReceipt] = useState<{
    id: number;
    productInterest: string;
  } | null>(null);

  const nameInputRef = useRef<HTMLInputElement>(null);

  function scrollToContact(preselectedProduct?: string) {
    setMobileNavOpen(false);
    if (preselectedProduct) {
      setProductInterest(preselectedProduct);
    }
    const el = document.getElementById('contact');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    window.setTimeout(() => {
      nameInputRef.current?.focus({ preventScroll: true });
    }, 350);
  }

  async function handleInquirySubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    if (!customerName.trim() || customerName.trim().length < 2) {
      setFormError('Please enter your full name.');
      nameInputRef.current?.focus();
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 7) {
      setFormError('Please enter a valid phone number.');
      return;
    }
    if (!projectLocation.trim()) {
      setFormError('Please specify the project location.');
      return;
    }
    if (!message.trim() || message.trim().length < 10) {
      setFormError('Please include a brief project message (at least 10 characters).');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          organizationName,
          email,
          phone,
          inquiryType,
          productInterest,
          estimatedQuantity,
          projectLocation,
          message,
          website: websiteHoneypot,
        }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(result.error || 'Unable to submit inquiry.');
      }
      setSubmittedReceipt({
        id: result.id,
        productInterest,
      });
      setCustomerName('');
      setOrganizationName('');
      setEmail('');
      setPhone('');
      setEstimatedQuantity('');
      setProjectLocation('');
      setMessage('');
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? err.message : 'Unable to send inquiry right now.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F7F6] p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="h-14 animate-pulse rounded-lg bg-[#E7EAE6]" />
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="h-80 animate-pulse rounded-xl bg-[#E7EAE6] lg:col-span-6" />
            <div className="h-80 animate-pulse rounded-xl bg-[#E7EAE6] lg:col-span-6" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F7F6] p-6">
        <div className="max-w-md rounded-xl border border-[#DCE0DB] bg-white p-8 text-center">
          <h1 className="font-display text-xl font-semibold text-[#141716]">
            Unable to load website content
          </h1>
          <p className="mt-2 text-sm text-[#4F5652]">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-5 rounded-lg bg-[#1B4D3E] px-5 py-2.5 text-sm font-medium text-white cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const settings = data.settings;
  const filteredProducts =
    selectedCategorySlug === 'all'
      ? data.products
      : data.products.filter((prod) => {
          const cat = data.categories.find((c) => c.id === prod.categoryId);
          return cat?.slug === selectedCategorySlug;
        });

  const activeStep =
    data.processSteps[activeStepIndex] ?? data.processSteps[0] ?? null;

  const filteredTests =
    qualityFilter === 'all'
      ? data.qualityTests
      : data.qualityTests.filter((t) => t.verificationStatus === qualityFilter);

  const galleryCategories = [
    'all',
    ...Array.from(new Set(data.gallery.map((g) => g.category))),
  ];
  const filteredGallery =
    galleryFilter === 'all'
      ? data.gallery
      : data.gallery.filter((g) => g.category === galleryFilter);

  const verifiedReportCount = data.labReports.filter(
    (r) => r.verificationStatus === 'verified'
  ).length;

  return (
    <div className="min-h-screen bg-[#F6F7F6] text-[#141716]">
      {/* Top Bar: Strict 3-Zone Contract */}
      <header className="sticky top-0 z-30 border-b border-[#E1E4E0] bg-[#F6F7F6]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-6 py-4 lg:px-10">
          {/* Zone 1: Single-line Wordmark + Logo */}
          <a
            href="#home"
            className="inline-flex items-center gap-2.5 font-display text-xl font-bold tracking-tight text-[#141716] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1B4D3E]"
          >
            <span className="h-9 w-9 overflow-hidden rounded-lg border border-[#DCE0DB] bg-[#E7EAE6] shrink-0">
              <img
                src="/assets/aistudio/image_f0f2901d.png"
                alt="Lime Stone Eco-Earth Block logo"
                decoding="sync"
                referrerPolicy="no-referrer"
                className="h-full w-full scale-110 object-cover"
              />
            </span>
            <span>Lime Stone</span>
          </a>

          {/* Zone 2: 5 Single-line Nav Links */}
          <nav
            aria-label="Primary"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[#4F5652]"
          >
            <a
              href="#about"
              className="whitespace-nowrap shrink-0 transition-colors hover:text-[#141716] hover:underline hover:underline-offset-4"
            >
              About
            </a>
            <a
              href="#products"
              className="whitespace-nowrap shrink-0 transition-colors hover:text-[#141716] hover:underline hover:underline-offset-4"
            >
              Products
            </a>
            <a
              href="#process"
              className="whitespace-nowrap shrink-0 transition-colors hover:text-[#141716] hover:underline hover:underline-offset-4"
            >
              Process
            </a>
            <a
              href="#quality"
              className="whitespace-nowrap shrink-0 transition-colors hover:text-[#141716] hover:underline hover:underline-offset-4"
            >
              Quality
            </a>
            <a
              href="#projects"
              className="whitespace-nowrap shrink-0 transition-colors hover:text-[#141716] hover:underline hover:underline-offset-4"
            >
              Projects
            </a>
          </nav>

          {/* Zone 3: 1 Primary CTA + Mobile Hamburger */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => scrollToContact()}
              className="hidden sm:inline-flex items-center justify-center rounded-lg bg-[#1B4D3E] px-5 py-2.5 text-sm font-medium text-white whitespace-nowrap shrink-0 transition-colors hover:bg-[#153C30] cursor-pointer"
            >
              Send Inquiry
            </button>
            <button
              type="button"
              onClick={() => setMobileNavOpen((p) => !p)}
              aria-expanded={mobileNavOpen}
              aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[#D4D9D3] bg-white text-[#141716] md:hidden cursor-pointer"
            >
              {mobileNavOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {mobileNavOpen && (
          <div className="border-t border-[#E1E4E0] bg-white px-6 py-4 md:hidden">
            <nav aria-label="Mobile" className="flex flex-col gap-1">
              {[
                { label: 'About', href: '#about' },
                { label: 'Products', href: '#products' },
                { label: 'Process', href: '#process' },
                { label: 'Quality', href: '#quality' },
                { label: 'Projects', href: '#projects' },
                { label: 'FAQs & News', href: '#faqs' },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileNavOpen(false)}
                  className="flex min-h-11 items-center text-sm font-medium text-[#141716]"
                >
                  {link.label}
                </a>
              ))}
              <button
                type="button"
                onClick={() => scrollToContact()}
                className="mt-2 min-h-11 w-full rounded-lg bg-[#1B4D3E] px-5 py-2.5 text-sm font-medium text-white cursor-pointer"
              >
                Send Inquiry
              </button>
            </nav>
          </div>
        )}
      </header>

      <main>
        {/* 1. HERO SECTION */}
        <section
          id="home"
          className="mx-auto max-w-7xl px-6 pt-10 pb-12 lg:px-10 lg:pt-16 lg:pb-16"
        >
          <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="flex flex-col justify-between gap-8 lg:col-span-6 lg:py-2">
              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-2 text-sm text-[#555D58]">
                  <span>Lime Stone (Eco-Earth Block)</span>
                  <span aria-hidden="true">·</span>
                  <span>{settings?.plantLocation ?? 'Mithi, Tharparkar, Sindh'}</span>
                </div>

                <h1
                  className="font-display font-semibold tracking-tight text-[#141716] leading-[1.08]"
                  style={{
                    fontSize: 'clamp(2.25rem, 4vw, 3.6rem)',
                    textWrap: 'balance',
                  }}
                >
                  Interlocking eco-earth blocks for cooler, low-carbon construction
                  in Tharparkar.
                </h1>

                <p className="max-w-xl text-base leading-relaxed text-[#4A514D] sm:text-lg">
                  {settings?.tagline}
                </p>

                <p className="max-w-xl border-t border-[#E1E4E0] pt-4 text-xs leading-relaxed text-[#555D58] sm:text-sm">
                  {settings?.disclaimerText}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-5">
                <button
                  type="button"
                  onClick={() => scrollToContact()}
                  className="inline-flex min-h-11 items-center gap-2.5 rounded-lg bg-[#1B4D3E] px-6 py-3 text-sm font-medium text-white whitespace-nowrap shrink-0 transition-colors hover:bg-[#153C30] cursor-pointer"
                >
                  <span>Request Product Inquiry</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
                <a
                  href="/assets/aistudio/Lime_Stone_Concept_Note_1fb85817.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[#141716] underline decoration-[#B8BEB7] underline-offset-4 whitespace-nowrap shrink-0 hover:text-[#1B4D3E] hover:decoration-[#1B4D3E]"
                >
                  <FileText className="h-4 w-4" aria-hidden="true" />
                  <span>Concept Note PDF</span>
                </a>
              </div>
            </div>

            <div className="flex flex-col overflow-hidden rounded-xl border border-[#DCE0DB] bg-white lg:col-span-6">
              <ResilientImage
                src={(HERO_PHOTOS[heroPhotoIdx] ?? HERO_PHOTOS[0]).src}
                alt={(HERO_PHOTOS[heroPhotoIdx] ?? HERO_PHOTOS[0]).label}
                fallbackTitle="Lime Stone Eco-Earth Blocks"
                loading="eager"
                fetchPriority="high"
                decoding="sync"
                containerClassName="flex-1 min-h-[280px] sm:min-h-[340px]"
                className="h-full w-full object-cover"
              />
              <div className="grid grid-cols-4 gap-2 border-t border-[#E1E4E0] bg-[#F6F7F6] p-3">
                {HERO_PHOTOS.map((photo, idx) => {
                  const selected = idx === heroPhotoIdx;
                  return (
                    <button
                      key={photo.src}
                      type="button"
                      onClick={() => setHeroPhotoIdx(idx)}
                      aria-label={`View ${photo.label}`}
                      aria-pressed={selected}
                      className={`overflow-hidden rounded-lg border transition-all cursor-pointer ${
                        selected
                          ? 'border-[#1B4D3E] ring-2 ring-[#1B4D3E]/25'
                          : 'border-[#DCE0DB] opacity-80 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={photo.src}
                        alt={photo.label}
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        className="aspect-[4/3] w-full object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 4-Column Plant Baseline Strip */}
          <div className="mt-12 grid grid-cols-1 divide-y divide-[#E1E4E0] rounded-xl border border-[#E1E4E0] bg-white sm:grid-cols-2 sm:divide-y-0 sm:divide-x lg:grid-cols-4">
            <div className="p-6">
              <p className="text-xs font-medium text-[#555D58]">Planned Capacity</p>
              <p className="mt-2 font-mono text-2xl font-medium text-[#141716] tabular-nums">
                30,000 / mo
              </p>
              <p className="mt-1 text-sm text-[#4F5652]">
                First CSEB plant in Tharparkar
              </p>
            </div>
            <div className="p-6">
              <p className="text-xs font-medium text-[#555D58]">Energy Source</p>
              <p className="mt-2 font-mono text-2xl font-medium text-[#141716] tabular-nums">
                5–8 kW Solar
              </p>
              <p className="mt-1 text-sm text-[#4F5652]">
                Zero kiln firing or fuel burning
              </p>
            </div>
            <div className="p-6 sm:border-t sm:border-[#E1E4E0] lg:border-t-0">
              <p className="text-xs font-medium text-[#555D58]">Wall Block Mold</p>
              <p className="mt-2 font-mono text-xl font-medium text-[#141716] tabular-nums">
                230 × 220 × 115 mm
              </p>
              <p className="mt-1 text-sm text-[#4F5652]">
                ST-H201 semi-automatic press
              </p>
            </div>
            <div className="p-6 sm:border-t sm:border-[#E1E4E0] lg:border-t-0">
              <p className="text-xs font-medium text-[#555D58]">Local Team</p>
              <p className="mt-2 font-mono text-2xl font-medium text-[#141716] tabular-nums">
                ~5 Workers
              </p>
              <p className="mt-1 text-sm text-[#4F5652]">
                Mithi operators &amp; curing yard
              </p>
            </div>
          </div>
        </section>

        {/* 2. ABOUT US & SUSTAINABILITY */}
        <section
          id="about"
          className="border-t border-[#E1E4E0] bg-white py-16 lg:py-24"
        >
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-5">
                <p className="text-sm font-medium text-[#1B4D3E]">
                  About Lime Stone &amp; Sustainability
                </p>
                <h2
                  className="mt-3 font-display text-3xl font-semibold tracking-tight text-[#141716] sm:text-4xl"
                  style={{ textWrap: 'balance' }}
                >
                  Addressing Tharparkar’s masonry cost, heat, and transport gap.
                </h2>
                <p className="mt-5 text-base leading-relaxed text-[#4A514D]">
                  Today, construction across Tharparkar relies on fired clay bricks
                  hauled from outside the district—driving up freight costs,
                  delays, fuel consumption, and smoke emissions. Led by{' '}
                  <span className="font-medium text-[#141716]">
                    {settings?.projectLead ?? 'Ganpat Meghwar'}
                  </span>
                  , Lime Stone establishes local solar-powered CSEB manufacturing
                  right in Mithi.
                </p>
                <div className="mt-6 space-y-2 border-t border-[#E1E4E0] pt-5 text-sm text-[#4F5652]">
                  <p>
                    <span className="font-medium text-[#141716]">Initiative:</span>{' '}
                    {settings?.grantNote}
                  </p>
                  <p>
                    <span className="font-medium text-[#141716]">Workforce:</span>{' '}
                    {settings?.teamSize}
                  </p>
                </div>

                {/* Project Lead Profile Card */}
                <div className="mt-6 flex items-center gap-4 rounded-xl border border-[#DCE0DB] bg-[#F6F7F6] p-4">
                  <img
                    src="/assets/aistudio/ganpatProfile_a980c522.jpg"
                    alt={`${settings?.projectLead ?? 'Ganpat Meghwar'} — Founder & Project Lead, Lime Stone (Eco-Earth Block)`}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="h-20 w-20 shrink-0 rounded-lg border border-[#DCE0DB] object-cover object-top"
                  />
                  <div className="min-w-0 space-y-1">
                    <p className="font-display text-base font-semibold text-[#141716]">
                      {settings?.projectLead ?? 'Ganpat Meghwar'}
                    </p>
                    <p className="text-xs text-[#4F5652]">
                      Founder &amp; Project Lead · BBA, Sukkur IBA University
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-xs">
                      <a
                        href={`mailto:${settings?.contactEmail ?? 'raiganpat401@gmail.com'}`}
                        className="inline-flex items-center gap-1 font-mono text-[#1B4D3E] hover:underline"
                      >
                        <Mail className="h-3 w-3 shrink-0" aria-hidden="true" />
                        <span>{settings?.contactEmail ?? 'raiganpat401@gmail.com'}</span>
                      </a>
                      <a
                        href={`tel:${(settings?.contactPhone ?? '+923212472380').replace(/\s+/g, '')}`}
                        className="inline-flex items-center gap-1 font-mono text-[#1B4D3E] hover:underline"
                      >
                        <Phone className="h-3 w-3 shrink-0" aria-hidden="true" />
                        <span>{settings?.contactPhone ?? '+923212472380'}</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Connected Story / Hidden Blog Page Link */}
                <div className="mt-5">
                  <a
                    href="/story"
                    onClick={(e) => {
                      e.preventDefault();
                      onOpenStory();
                    }}
                    className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#1B4D3E] bg-white px-4 py-2.5 text-sm font-medium text-[#1B4D3E] transition-colors hover:bg-[#1B4D3E] hover:text-white"
                  >
                    <span>Read Full Story: The Story of Eco-Earth</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                </div>
              </div>

              <div className="divide-y divide-[#E1E4E0] border-t border-b border-[#E1E4E0] lg:col-span-7">
                {[
                  {
                    num: '01.',
                    title: 'Zero Firing & Cleaner Production',
                    body: 'Blocks cure at ambient temperature under damp cover instead of burning kiln fuels—eliminating firing smoke while operating mainly on a 5–8 kW solar array.',
                  },
                  {
                    num: '02.',
                    title: 'Mortar-Reduced Interlocking Assembly',
                    body: 'Interlocking geometry aligns wall and paving courses rapidly, cutting mortar consumption, reducing skilled-labor bottlenecks, and allowing clean unplastered walls.',
                  },
                  {
                    num: '03.',
                    title: 'Local Materials & Regional Employment',
                    body: 'Built from Tharparkar clay, desert sand, and 0–5 mm crushed stone to reduce outside brick transport while creating skilled local plant jobs in Mithi.',
                  },
                ].map((item) => (
                  <div
                    key={item.num}
                    className="grid grid-cols-1 gap-3 py-6 sm:grid-cols-12 sm:gap-6"
                  >
                    <div className="sm:col-span-2">
                      <span className="font-mono text-sm font-medium text-[#1B4D3E] tabular-nums">
                        {item.num}
                      </span>
                    </div>
                    <div className="sm:col-span-10">
                      <h3 className="font-display text-lg font-semibold text-[#141716]">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#4F5652] sm:text-base">
                        {item.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 3. PRODUCTS & SOLUTIONS CATALOG */}
        <section
          id="products"
          className="border-t border-[#E1E4E0] bg-[#F6F7F6] py-16 lg:py-24"
        >
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <p className="text-sm font-medium text-[#1B4D3E]">
                  Products &amp; Solutions
                </p>
                <h2
                  className="mt-2 font-display text-3xl font-semibold tracking-tight text-[#141716] sm:text-4xl"
                  style={{ textWrap: 'balance' }}
                >
                  Interlocking block systems for walls and paving.
                </h2>
              </div>

              <div
                role="tablist"
                aria-label="Filter product categories"
                className="flex flex-wrap items-center gap-1 rounded-lg border border-[#DCE0DB] bg-white p-1"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={selectedCategorySlug === 'all'}
                  onClick={() => setSelectedCategorySlug('all')}
                  className={`min-h-10 rounded-md px-4 py-2 text-xs font-medium whitespace-nowrap cursor-pointer sm:text-sm ${
                    selectedCategorySlug === 'all'
                      ? 'bg-[#1B4D3E] text-white'
                      : 'text-[#4F5652] hover:text-[#141716]'
                  }`}
                >
                  All Products
                </button>
                {data.categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    role="tab"
                    aria-selected={selectedCategorySlug === cat.slug}
                    onClick={() => setSelectedCategorySlug(cat.slug)}
                    className={`min-h-10 rounded-md px-4 py-2 text-xs font-medium whitespace-nowrap cursor-pointer sm:text-sm ${
                      selectedCategorySlug === cat.slug
                        ? 'bg-[#1B4D3E] text-white'
                        : 'text-[#4F5652] hover:text-[#141716]'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
              {filteredProducts.map((product) => {
                const categoryName =
                  data.categories.find((c) => c.id === product.categoryId)?.name ??
                  'CSEB Product';
                const isWallBlock =
                  product.slug === 'lime-stone-interlocking-wall-block' ||
                  product.name.toLowerCase().includes('wall block');
                const isPavingBlock =
                  product.slug === 'lime-stone-interlocking-paving-block' ||
                  product.name.toLowerCase().includes('paving block');

                const galleryPhotos = isWallBlock
                  ? WALL_BLOCK_PHOTOS
                  : isPavingBlock
                    ? PAVING_BLOCK_PHOTOS
                    : null;
                const activeIdx = isWallBlock ? wallPhotoIdx : pavingPhotoIdx;
                const setActiveIdx = isWallBlock
                  ? setWallPhotoIdx
                  : setPavingPhotoIdx;
                const activePhoto = galleryPhotos
                  ? (galleryPhotos[activeIdx] ?? galleryPhotos[0])
                  : null;
                const displayImage = activePhoto
                  ? activePhoto.src
                  : product.imageUrl;

                return (
                  <article
                    key={product.id}
                    className="flex flex-col overflow-hidden rounded-xl border border-[#DCE0DB] bg-white"
                  >
                    <ResilientImage
                      src={displayImage}
                      alt={
                        activePhoto
                          ? `${product.name} — ${activePhoto.label}`
                          : product.name
                      }
                      fallbackTitle={product.name}
                      containerClassName="aspect-[16/9] w-full border-b border-[#E1E4E0]"
                      className="h-full w-full object-cover"
                    />
                    {galleryPhotos && (
                      <div className="grid grid-cols-4 gap-2 border-b border-[#E1E4E0] bg-[#F6F7F6] p-3">
                        {galleryPhotos.map((photo, idx) => {
                          const selected = idx === activeIdx;
                          return (
                            <button
                              key={photo.src}
                              type="button"
                              onClick={() => setActiveIdx(idx)}
                              aria-label={`View ${photo.label}`}
                              aria-pressed={selected}
                              className={`overflow-hidden rounded-lg border transition-all cursor-pointer ${
                                selected
                                  ? 'border-[#1B4D3E] ring-2 ring-[#1B4D3E]/25'
                                  : 'border-[#DCE0DB] opacity-80 hover:opacity-100'
                              }`}
                            >
                              <img
                                src={photo.src}
                                alt={photo.label}
                                loading="lazy"
                                decoding="async"
                                referrerPolicy="no-referrer"
                                className="aspect-[4/3] w-full object-cover"
                              />
                            </button>
                          );
                        })}
                      </div>
                    )}
                    <div className="flex flex-1 flex-col justify-between p-6 sm:p-8">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-[#555D58]">
                          <span className="font-medium text-[#1B4D3E]">
                            {categoryName}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>
                            {product.availabilityStatus === 'available'
                              ? 'Available'
                              : product.availabilityStatus === 'trial_phase'
                                ? 'Pre-Production Trial Phase'
                                : 'Planned Production'}
                          </span>
                        </div>

                        <h3 className="mt-2 font-display text-2xl font-semibold text-[#141716]">
                          {product.name}
                        </h3>
                        <p className="mt-3 text-sm leading-relaxed text-[#4A514D] sm:text-base">
                          {product.description}
                        </p>

                        <dl className="mt-6 space-y-3 border-t border-[#E1E4E0] pt-5 text-sm">
                          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                            <dt className="text-[#555D58]">Dimensions</dt>
                            <dd className="font-mono font-medium text-[#141716] tabular-nums">
                              {product.dimensions}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                            <dt className="text-[#555D58]">Binder Target</dt>
                            <dd className="text-right text-[#141716]">
                              {product.binderSpec}
                            </dd>
                          </div>
                          <div className="pt-1">
                            <dt className="text-[#555D58]">Intended Uses</dt>
                            <dd className="mt-1 text-[#4F5652]">
                              {product.applications}
                            </dd>
                          </div>
                        </dl>
                      </div>

                      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[#E1E4E0] pt-5">
                        <button
                          type="button"
                          onClick={() => scrollToContact(product.name)}
                          className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#1B4D3E] px-4 py-2 text-xs font-medium text-white hover:bg-[#153C30] cursor-pointer sm:text-sm"
                        >
                          <span>Inquire About This Block</span>
                          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>

                        {product.technicalDocUrl && (
                          <a
                            href={product.technicalDocUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#4F5652] underline underline-offset-4 hover:text-[#141716]"
                          >
                            <span>Concept Spec PDF</span>
                            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* 4. MANUFACTURING PROCESS & RAW MATERIALS */}
        <section
          id="process"
          className="border-t border-[#E1E4E0] bg-white py-16 lg:py-24"
        >
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-[#1B4D3E]">
                Manufacturing Process (10 Stages)
              </p>
              <h2
                className="mt-2 font-display text-3xl font-semibold tracking-tight text-[#141716] sm:text-4xl"
                style={{ textWrap: 'balance' }}
              >
                From local Tharparkar subsoil to cured interlocking blocks.
              </h2>
            </div>

            {/* Interactive 10-Step Manufacturing Stepper */}
            <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 lg:col-span-5 lg:grid-cols-2">
                {data.processSteps.map((step, index) => {
                  const isActive = index === activeStepIndex;
                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => setActiveStepIndex(index)}
                      className={`flex flex-col items-start rounded-lg border p-3.5 text-left transition-colors cursor-pointer ${
                        isActive
                          ? 'border-[#1B4D3E] bg-[#1B4D3E] text-white'
                          : 'border-[#E1E4E0] bg-[#F6F7F6] text-[#141716] hover:border-[#B8BEB7]'
                      }`}
                    >
                      <span
                        className={`font-mono text-xs tabular-nums ${
                          isActive ? 'text-white/80' : 'text-[#1B4D3E]'
                        }`}
                      >
                        Step {String(step.stepNumber).padStart(2, '0')}
                      </span>
                      <span className="mt-1 text-xs font-medium leading-snug sm:text-sm">
                        {step.title}
                      </span>
                    </button>
                  );
                })}
              </div>

              {activeStep && (
                <div className="flex flex-col justify-between rounded-xl border border-[#DCE0DB] bg-[#F6F7F6] p-6 sm:p-8 lg:col-span-7">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono text-sm font-medium text-[#1B4D3E] tabular-nums">
                        Stage {String(activeStep.stepNumber).padStart(2, '0')} of{' '}
                        {data.processSteps.length}
                      </span>
                      <span className="font-mono text-xs text-[#4F5652]">
                        {activeStep.keyParameter}
                      </span>
                    </div>

                    <h3 className="mt-4 font-display text-2xl font-semibold text-[#141716]">
                      {activeStep.title}
                    </h3>
                    <p className="mt-3 text-base leading-relaxed text-[#4A514D]">
                      {activeStep.description}
                    </p>

                    {PROCESS_STEP_MEDIA[activeStep.stepNumber] && (
                      <figure className="mt-5 overflow-hidden rounded-lg border border-[#DCE0DB] bg-white">
                        <ResilientImage
                          src={PROCESS_STEP_MEDIA[activeStep.stepNumber].src}
                          alt={PROCESS_STEP_MEDIA[activeStep.stepNumber].alt}
                          fallbackTitle={activeStep.title}
                          containerClassName="w-full bg-white"
                          className={`w-full ${
                            PROCESS_STEP_MEDIA[activeStep.stepNumber].fit ===
                            'contain'
                              ? 'max-h-72 object-contain p-3 bg-white'
                              : 'aspect-[16/10] max-h-72 object-cover'
                          }`}
                        />
                        <figcaption className="border-t border-[#E1E4E0] px-4 py-2.5 text-xs text-[#4F5652]">
                          {PROCESS_STEP_MEDIA[activeStep.stepNumber].caption}
                        </figcaption>
                      </figure>
                    )}
                  </div>

                  <div className="mt-8 space-y-4 border-t border-[#DCE0DB] pt-6">
                    <div>
                      <p className="text-xs font-medium text-[#555D58]">
                        Quality Control Checkpoint
                      </p>
                      <p className="mt-1 text-sm text-[#141716]">
                        {activeStep.qualityControlNote}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        disabled={activeStepIndex === 0}
                        onClick={() =>
                          setActiveStepIndex((idx) => Math.max(0, idx - 1))
                        }
                        className="min-h-10 rounded-lg border border-[#D4D9D3] bg-white px-4 text-xs font-medium text-[#141716] disabled:opacity-40 cursor-pointer"
                      >
                        Previous Stage
                      </button>
                      <button
                        type="button"
                        disabled={activeStepIndex >= data.processSteps.length - 1}
                        onClick={() =>
                          setActiveStepIndex((idx) =>
                            Math.min(data.processSteps.length - 1, idx + 1)
                          )
                        }
                        className="min-h-10 rounded-lg bg-[#1B4D3E] px-4 text-xs font-medium text-white disabled:opacity-40 cursor-pointer"
                      >
                        Next Stage
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Raw Materials Grid */}
            <div className="mt-16 border-t border-[#E1E4E0] pt-14">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <p className="text-sm font-medium text-[#1B4D3E]">
                    Raw Materials (6 Core Inputs)
                  </p>
                  <h3 className="mt-2 font-display text-2xl font-semibold text-[#141716]">
                    Locally sourced minerals stabilized for durability.
                  </h3>
                </div>
                <p className="max-w-md text-xs text-[#555D58] sm:text-sm">
                  All clay, sand, and water sources are screened for soluble salts
                  and gypsum before batching.
                </p>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {data.rawMaterials.map((mat) => {
                  const media = getRawMaterialMedia(mat.name);
                  return (
                    <div
                      key={mat.id}
                      className="flex flex-col overflow-hidden rounded-xl border border-[#E1E4E0] bg-[#F6F7F6]"
                    >
                      {media ? (
                        <ResilientImage
                          src={media.src}
                          alt={mat.name}
                          fallbackTitle={mat.name}
                          containerClassName={`aspect-[16/10] w-full border-b border-[#E1E4E0] ${
                            media.fit === 'contain' ? 'bg-white' : ''
                          }`}
                          className={`h-full w-full ${
                            media.fit === 'contain'
                              ? 'object-contain p-3 bg-white'
                              : 'object-cover'
                          }`}
                        />
                      ) : (
                        <div className="flex aspect-[16/10] w-full flex-col items-center justify-center border-b border-[#E1E4E0] bg-gradient-to-br from-[#EDF2EF] to-[#E2E9E5] p-6 text-center">
                          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#CBD6CF] bg-white text-[#1B4D3E]">
                            <Droplets className="h-5 w-5" aria-hidden="true" />
                          </div>
                          <p className="mt-3 font-mono text-sm font-medium text-[#141716] tabular-nums">
                            ~11% Dry Weight Moisture
                          </p>
                          <p className="mt-1 text-xs text-[#4F5652]">
                            Salt- &amp; gypsum-screened local water
                          </p>
                        </div>
                      )}

                      <div className="flex flex-1 flex-col justify-between p-6">
                        <div>
                          <h4 className="font-display text-lg font-semibold text-[#141716]">
                            {mat.name}
                          </h4>
                          <p className="mt-1 text-xs text-[#1B4D3E]">
                            {mat.sourceLocation}
                          </p>
                          <p className="mt-3 text-sm leading-relaxed text-[#4A514D]">
                            {mat.purpose}
                          </p>
                        </div>
                        <p className="mt-4 border-t border-[#DCE0DB] pt-3 text-xs text-[#555D58]">
                          {mat.technicalNotes}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* 5. QUALITY ASSURANCE & TIEST LAB TESTING */}
        <section
          id="quality"
          className="border-t border-[#E1E4E0] bg-[#F6F7F6] py-16 lg:py-24"
        >
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div className="max-w-2xl">
                <p className="text-sm font-medium text-[#1B4D3E]">
                  Quality Assurance &amp; Laboratory Testing
                </p>
                <h2
                  className="mt-2 font-display text-3xl font-semibold tracking-tight text-[#141716] sm:text-4xl"
                  style={{ textWrap: 'balance' }}
                >
                  Transparent distinction between planned trials and verified results.
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[#4A514D] sm:text-base">
                  Our lime-cement formulation has not yet been tested. Laboratory
                  trials are scheduled at{' '}
                  <span className="font-medium text-[#141716]">
                    Thar Institute of Engineering Science and Technology (TIEST)
                  </span>{' '}
                  prior to commercial production.
                </p>
              </div>

              <div className="flex items-center gap-1 rounded-lg border border-[#DCE0DB] bg-white p-1">
                {(['all', 'planned', 'verified'] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setQualityFilter(status)}
                    className={`min-h-10 rounded-md px-3.5 text-xs font-medium capitalize cursor-pointer sm:text-sm ${
                      qualityFilter === status
                        ? 'bg-[#1B4D3E] text-white'
                        : 'text-[#4F5652] hover:text-[#141716]'
                    }`}
                  >
                    {status === 'all' ? 'All Checks' : status}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality Checks Table */}
            <div className="mt-8 overflow-hidden rounded-xl border border-[#DCE0DB] bg-white">
              {filteredTests.length === 0 ? (
                <div className="p-8 text-center text-sm text-[#555D58]">
                  No {qualityFilter} laboratory test results have been published yet.
                  Verified TIEST test results will appear here once completed.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-[#E1E4E0] bg-[#F6F7F6] text-xs text-[#555D58]">
                      <tr>
                        <th className="px-6 py-3.5 font-medium">Test Protocol</th>
                        <th className="px-6 py-3.5 font-medium">Methodology</th>
                        <th className="px-6 py-3.5 font-medium">Institution</th>
                        <th className="px-6 py-3.5 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E1E4E0]">
                      {filteredTests.map((test) => (
                        <tr key={test.id}>
                          <td className="px-6 py-4">
                            <p className="font-medium text-[#141716]">
                              {test.title}
                            </p>
                            <p className="mt-0.5 text-xs text-[#555D58]">
                              {test.category}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-xs leading-relaxed text-[#4F5652] sm:text-sm">
                            {test.methodology}
                          </td>
                          <td className="px-6 py-4 text-xs text-[#4F5652]">
                            {test.institution}
                          </td>
                          <td className="px-6 py-4 text-xs font-medium whitespace-nowrap">
                            {test.verificationStatus === 'verified' ? (
                              <span className="text-[#16A34A]">
                                Verified Result
                              </span>
                            ) : (
                              <span className="text-[#D97706]">
                                Planned · Pending Results
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Lab Reports List */}
            <div className="mt-6 rounded-xl border border-[#DCE0DB] bg-white p-6">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E1E4E0] pb-4">
                <h3 className="font-display text-lg font-semibold text-[#141716]">
                  Laboratory Documentation ({verifiedReportCount} Verified ·{' '}
                  {data.labReports.length - verifiedReportCount} Planned)
                </h3>
              </div>
              <div className="divide-y divide-[#E1E4E0]">
                {data.labReports.map((rep) => (
                  <div
                    key={rep.id}
                    className="flex flex-wrap items-start justify-between gap-4 py-4"
                  >
                    <div className="max-w-3xl">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#555D58]">
                        <span className="font-mono">{rep.reportCode}</span>
                        <span aria-hidden="true">·</span>
                        <span>{rep.institution}</span>
                        <span aria-hidden="true">·</span>
                        <span>{rep.testAgeDays}</span>
                      </div>
                      <p className="mt-1 font-medium text-[#141716]">{rep.title}</p>
                      <p className="mt-1 text-sm text-[#4F5652]">{rep.summary}</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-medium">
                      <span
                        className={
                          rep.verificationStatus === 'verified'
                            ? 'text-[#16A34A]'
                            : 'text-[#D97706]'
                        }
                      >
                        {rep.verificationStatus === 'verified'
                          ? 'Verified Report'
                          : 'Planned Trial'}
                      </span>
                      {rep.documentUrl && (
                        <a
                          href={rep.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#1B4D3E] underline underline-offset-4"
                        >
                          View Document
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 6. APPLICATIONS, PROJECTS & GALLERY */}
        <section
          id="projects"
          className="border-t border-[#E1E4E0] bg-white py-16 lg:py-24"
        >
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <p className="text-sm font-medium text-[#1B4D3E]">
                  Target Applications
                </p>
                <h2
                  className="mt-2 font-display text-3xl font-semibold tracking-tight text-[#141716]"
                  style={{ textWrap: 'balance' }}
                >
                  Intended structural &amp; paving uses.
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[#4A514D]">
                  Applications below represent target use cases outlined in our
                  concept plan. Structural deployment remains subject to TIEST
                  laboratory validation and project-specific engineering sign-off.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-7">
                <div className="rounded-xl border border-[#E1E4E0] bg-[#F6F7F6] p-5">
                  <p className="text-xs font-medium text-[#1B4D3E]">
                    Wall Masonry (Pending TIEST Validation)
                  </p>
                  <ul className="mt-3 space-y-1.5 text-sm text-[#141716]">
                    <li>Residential houses &amp; boundary walls</li>
                    <li>Schools &amp; classroom blocks</li>
                    <li>Basic health units &amp; clinics</li>
                    <li>Community shelters &amp; NGO facilities</li>
                  </ul>
                </div>
                <div className="rounded-xl border border-[#E1E4E0] bg-[#F6F7F6] p-5">
                  <p className="text-xs font-medium text-[#1B4D3E]">
                    Surface Paving (Pending Mold &amp; Soaked Test)
                  </p>
                  <ul className="mt-3 space-y-1.5 text-sm text-[#141716]">
                    <li>Interior &amp; courtyard flooring</li>
                    <li>Pedestrian walkways &amp; footpaths</li>
                    <li>Residential driveways &amp; parking zones</li>
                    <li>Low-traffic road stabilization layers</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Projects & Demonstrations */}
            <div className="mt-16 border-t border-[#E1E4E0] pt-14">
              <h3 className="font-display text-2xl font-semibold text-[#141716]">
                Projects &amp; Demonstrations
              </h3>
              <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
                {data.projects.map((proj) => (
                  <article
                    key={proj.id}
                    className="overflow-hidden rounded-xl border border-[#DCE0DB] bg-[#F6F7F6]"
                  >
                    <ResilientImage
                      src={proj.imageUrl}
                      alt={proj.title}
                      fallbackTitle={proj.title}
                      containerClassName="aspect-[16/9] w-full border-b border-[#DCE0DB]"
                      className="h-full w-full object-cover"
                    />
                    <div className="p-6">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#555D58]">
                        <span>{proj.location}</span>
                        <span aria-hidden="true">·</span>
                        <span>{proj.projectType}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-medium text-[#1B4D3E]">
                          {proj.status === 'planned_demo'
                            ? 'Planned Demonstration'
                            : proj.status === 'completed'
                              ? 'Regional Reference'
                              : 'In Progress'}
                        </span>
                      </div>
                      <h4 className="mt-2 font-display text-xl font-semibold text-[#141716]">
                        {proj.title}
                      </h4>
                      <p className="mt-2 text-sm leading-relaxed text-[#4A514D]">
                        {proj.description}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* Gallery */}
            <div className="mt-16 border-t border-[#E1E4E0] pt-14">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h3 className="font-display text-2xl font-semibold text-[#141716]">
                  Visual Gallery
                </h3>
                <div className="flex flex-wrap gap-1 rounded-lg border border-[#DCE0DB] bg-[#F6F7F6] p-1">
                  {galleryCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setGalleryFilter(cat)}
                      className={`min-h-9 rounded-md px-3 text-xs font-medium capitalize cursor-pointer ${
                        galleryFilter === cat
                          ? 'bg-[#1B4D3E] text-white'
                          : 'text-[#4F5652] hover:text-[#141716]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                {filteredGallery.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setLightboxItem(item)}
                    className="group overflow-hidden rounded-xl border border-[#DCE0DB] bg-[#F6F7F6] text-left cursor-pointer"
                  >
                    <ResilientImage
                      src={item.imageUrl}
                      alt={item.title}
                      fallbackTitle={item.title}
                      containerClassName="aspect-[16/9] w-full"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                    <div className="p-4">
                      <p className="text-xs capitalize text-[#1B4D3E]">
                        {item.category}
                      </p>
                      <p className="mt-1 font-display text-base font-semibold text-[#141716]">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs text-[#4F5652]">{item.caption}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 7. FAQS & NEWS UPDATES */}
        <section
          id="faqs"
          className="border-t border-[#E1E4E0] bg-[#F6F7F6] py-16 lg:py-24"
        >
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
              {/* FAQs */}
              <div className="lg:col-span-7">
                <p className="text-sm font-medium text-[#1B4D3E]">
                  Frequently Asked Questions
                </p>
                <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-[#141716]">
                  Common questions on Lime Stone CSEBs.
                </h2>

                <div className="mt-6 divide-y divide-[#DCE0DB] rounded-xl border border-[#DCE0DB] bg-white">
                  {data.faqs.map((faq) => {
                    const isOpen = openFaqId === faq.id;
                    return (
                      <div key={faq.id}>
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          onClick={() =>
                            setOpenFaqId(isOpen ? null : faq.id)
                          }
                          className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left cursor-pointer"
                        >
                          <span className="font-medium text-[#141716]">
                            {faq.question}
                          </span>
                          <ChevronDown
                            className={`h-4 w-4 shrink-0 text-[#555D58] transition-transform duration-150 ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                            aria-hidden="true"
                          />
                        </button>
                        {isOpen && (
                          <div className="px-6 pb-5 text-sm leading-relaxed text-[#4A514D]">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* News & Updates */}
              <div className="lg:col-span-5">
                <p className="text-sm font-medium text-[#1B4D3E]">
                  News &amp; Milestones
                </p>
                <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-[#141716]">
                  Plant &amp; testing updates.
                </h2>
                <div className="mt-6 space-y-4">
                  {data.news.map((item) => (
                    <article
                      key={item.id}
                      className="rounded-xl border border-[#DCE0DB] bg-white p-6"
                    >
                      <div className="flex items-center gap-2 text-xs text-[#555D58]">
                        <span className="font-mono tabular-nums">
                          {item.publishedAt}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="text-[#1B4D3E]">{item.category}</span>
                      </div>
                      <h3 className="mt-2 font-display text-lg font-semibold text-[#141716]">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#4A514D]">
                        {item.summary}
                      </p>
                      <p className="mt-2 text-xs leading-relaxed text-[#555D58]">
                        {item.content}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. CONTACT & PRODUCT INQUIRY */}
        <section
          id="contact"
          className="border-t border-[#E1E4E0] bg-white py-16 lg:py-24"
        >
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <p className="text-sm font-medium text-[#1B4D3E]">
                  Contact &amp; Inquiries
                </p>
                <h2
                  className="mt-2 font-display text-3xl font-semibold tracking-tight text-[#141716] sm:text-4xl"
                  style={{ textWrap: 'balance' }}
                >
                  Request product information or discuss a project.
                </h2>
                <p className="mt-4 text-base leading-relaxed text-[#4A514D]">
                  Connect with our Mithi team regarding residential builds, NGO
                  community shelters, contractor trials, or paving inquiries.
                  Online payment and automated order checkout are intentionally
                  disabled while laboratory validation proceeds.
                </p>

                <dl className="mt-8 space-y-4 border-t border-[#E1E4E0] pt-6 text-sm">
                  <div>
                    <dt className="text-xs text-[#555D58]">Plant Location</dt>
                    <dd className="mt-0.5 font-medium text-[#141716]">
                      {settings?.plantLocation}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[#555D58]">Project Lead</dt>
                    <dd className="mt-0.5 font-medium text-[#141716]">
                      {settings?.projectLead}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[#555D58]">Email</dt>
                    <dd className="mt-0.5 font-mono text-[#141716]">
                      <a
                        href={`mailto:${settings?.contactEmail ?? 'raiganpat401@gmail.com'}`}
                        className="hover:text-[#1B4D3E] hover:underline"
                      >
                        {settings?.contactEmail ?? 'raiganpat401@gmail.com'}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[#555D58]">Phone</dt>
                    <dd className="mt-0.5 font-mono text-[#141716]">
                      <a
                        href={`tel:${(settings?.contactPhone ?? '+923212472380').replace(/\s+/g, '')}`}
                        className="hover:text-[#1B4D3E] hover:underline"
                      >
                        {settings?.contactPhone ?? '+923212472380'}
                      </a>
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-xl border border-[#DCE0DB] bg-[#F6F7F6] p-6 sm:p-8 lg:col-span-7">
                {submittedReceipt ? (
                  <div
                    role="status"
                    className="rounded-lg border border-[#C6D8D0] bg-white p-6"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1B4D3E] text-white">
                        <Check className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-semibold text-[#141716]">
                          Inquiry Received (Ref #{submittedReceipt.id})
                        </h3>
                        <p className="mt-1 text-sm text-[#4F5652]">
                          Thank you. Your inquiry regarding{' '}
                          <span className="font-medium text-[#141716]">
                            {submittedReceipt.productInterest}
                          </span>{' '}
                          has been logged for review by our Mithi plant team.
                        </p>
                        <button
                          type="button"
                          onClick={() => setSubmittedReceipt(null)}
                          className="mt-4 text-sm font-medium text-[#1B4D3E] underline underline-offset-4 cursor-pointer"
                        >
                          Submit another inquiry
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form
                    onSubmit={handleInquirySubmit}
                    noValidate
                    className="space-y-4"
                  >
                    {/* Anti-spam honeypot field */}
                    <div className="hidden" aria-hidden="true">
                      <label htmlFor="website-field">Website</label>
                      <input
                        id="website-field"
                        type="text"
                        tabIndex={-1}
                        autoComplete="off"
                        value={websiteHoneypot}
                        onChange={(e) => setWebsiteHoneypot(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="inq-name"
                          className="block text-xs font-medium text-[#4F5652]"
                        >
                          Full Name *
                        </label>
                        <input
                          ref={nameInputRef}
                          id="inq-name"
                          required
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Your name"
                          className="mt-1 min-h-11 w-full rounded-lg border border-[#D4D9D3] bg-white px-3.5 text-sm"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="inq-org"
                          className="block text-xs font-medium text-[#4F5652]"
                        >
                          Organization / NGO (Optional)
                        </label>
                        <input
                          id="inq-org"
                          value={organizationName}
                          onChange={(e) => setOrganizationName(e.target.value)}
                          placeholder="Company, studio, or organization"
                          className="mt-1 min-h-11 w-full rounded-lg border border-[#D4D9D3] bg-white px-3.5 text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="inq-email"
                          className="block text-xs font-medium text-[#4F5652]"
                        >
                          Email Address *
                        </label>
                        <input
                          id="inq-email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@domain.com"
                          className="mt-1 min-h-11 w-full rounded-lg border border-[#D4D9D3] bg-white px-3.5 text-sm"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="inq-phone"
                          className="block text-xs font-medium text-[#4F5652]"
                        >
                          Phone Number *
                        </label>
                        <input
                          id="inq-phone"
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+92 300 0000000"
                          className="mt-1 min-h-11 w-full rounded-lg border border-[#D4D9D3] bg-white px-3.5 text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="inq-type"
                          className="block text-xs font-medium text-[#4F5652]"
                        >
                          Inquiry Type
                        </label>
                        <select
                          id="inq-type"
                          value={inquiryType}
                          onChange={(e) => setInquiryType(e.target.value)}
                          className="mt-1 min-h-11 w-full rounded-lg border border-[#D4D9D3] bg-white px-3.5 text-sm"
                        >
                          <option value="Product Inquiry">Product Inquiry</option>
                          <option value="Technical & Lab Results">
                            Technical &amp; Lab Results
                          </option>
                          <option value="NGO / Institutional Project">
                            NGO / Institutional Project
                          </option>
                          <option value="General Contact">General Contact</option>
                        </select>
                      </div>
                      <div>
                        <label
                          htmlFor="inq-product"
                          className="block text-xs font-medium text-[#4F5652]"
                        >
                          Product of Interest
                        </label>
                        <select
                          id="inq-product"
                          value={productInterest}
                          onChange={(e) => setProductInterest(e.target.value)}
                          className="mt-1 min-h-11 w-full rounded-lg border border-[#D4D9D3] bg-white px-3.5 text-sm"
                        >
                          {data.products.map((p) => (
                            <option key={p.id} value={p.name}>
                              {p.name}
                            </option>
                          ))}
                          <option value="Both Wall & Paving Blocks">
                            Both Wall &amp; Paving Blocks
                          </option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="inq-qty"
                          className="block text-xs font-medium text-[#4F5652]"
                        >
                          Estimated Quantity (Optional)
                        </label>
                        <input
                          id="inq-qty"
                          value={estimatedQuantity}
                          onChange={(e) => setEstimatedQuantity(e.target.value)}
                          placeholder="e.g. 5,000 blocks"
                          className="mt-1 min-h-11 w-full rounded-lg border border-[#D4D9D3] bg-white px-3.5 text-sm"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="inq-location"
                          className="block text-xs font-medium text-[#4F5652]"
                        >
                          Project Location *
                        </label>
                        <input
                          id="inq-location"
                          required
                          value={projectLocation}
                          onChange={(e) => setProjectLocation(e.target.value)}
                          placeholder="e.g. Mithi, Islamkot, Umerkot"
                          className="mt-1 min-h-11 w-full rounded-lg border border-[#D4D9D3] bg-white px-3.5 text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="inq-message"
                        className="block text-xs font-medium text-[#4F5652]"
                      >
                        Project Details &amp; Message *
                      </label>
                      <textarea
                        id="inq-message"
                        required
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Describe your building type, timeline, or technical questions..."
                        className="mt-1 w-full rounded-lg border border-[#D4D9D3] bg-white p-3.5 text-sm"
                      />
                    </div>

                    {formError && (
                      <p role="alert" className="text-xs font-medium text-[#B42318]">
                        {formError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#1B4D3E] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#153C30] disabled:opacity-60 cursor-pointer"
                    >
                      {submitting ? 'Submitting Inquiry...' : 'Submit Inquiry'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Lightbox Modal for Gallery */}
      {lightboxItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={lightboxItem.title}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          onClick={() => setLightboxItem(null)}
        >
          <div
            className="max-w-3xl overflow-hidden rounded-xl bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxItem.imageUrl}
              alt={lightboxItem.title}
              decoding="async"
              referrerPolicy="no-referrer"
              className="max-h-[70vh] w-full object-cover"
            />
            <div className="flex items-start justify-between gap-4 p-5">
              <div>
                <p className="font-display text-lg font-semibold text-[#141716]">
                  {lightboxItem.title}
                </p>
                <p className="mt-1 text-sm text-[#4F5652]">
                  {lightboxItem.caption}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLightboxItem(null)}
                className="rounded-lg border border-[#D4D9D3] px-3 py-1.5 text-xs font-medium cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quiet Footer */}
      <footer className="border-t border-[#E1E4E0] bg-[#F6F7F6] py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 sm:flex-row sm:items-center lg:px-10">
          <div className="flex items-center gap-3 text-sm text-[#555D58]">
            <span className="h-9 w-9 overflow-hidden rounded-lg border border-[#DCE0DB] bg-[#E7EAE6] shrink-0">
              <img
                src="/assets/aistudio/image_f0f2901d.png"
                alt="Lime Stone Eco-Earth Block logo"
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="h-full w-full scale-110 object-cover"
              />
            </span>
            <div className="space-y-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-display font-semibold text-[#141716]">
                  Lime Stone (Eco-Earth Block)
                </span>
                <span aria-hidden="true">·</span>
                <span>{settings?.plantLocation}</span>
              </div>
              <p className="text-xs">
                Lime-cement stabilized compressed earth blocks (not natural limestone).
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm text-[#555D58]">
            <a href="#products" className="whitespace-nowrap hover:text-[#141716]">
              Products
            </a>
            <a href="#quality" className="whitespace-nowrap hover:text-[#141716]">
              TIEST Trials
            </a>
            <a href="#contact" className="whitespace-nowrap hover:text-[#141716]">
              Contact
            </a>
            <button
              type="button"
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-1.5 font-medium text-[#141716] whitespace-nowrap hover:text-[#1B4D3E] cursor-pointer"
            >
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Admin Console</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

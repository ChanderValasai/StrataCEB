/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { type FormEvent, useRef, useState } from 'react';
import { ArrowRight, Check, Menu, X } from 'lucide-react';
import { ResilientImage } from './components/ResilientImage';

type InterestTopic = 'General Updates' | 'Technical Specs' | 'Partnership';

interface ApplicationProfile {
  id: string;
  title: string;
  summary: string;
  dimensions: string;
  note: string;
}

const MATERIAL_BASELINES = [
  {
    label: 'Compressive Strength',
    value: '> 7.0 MPa',
    detail: 'Stabilized structural grade',
  },
  {
    label: 'Firing Temperature',
    value: '0 °C Ambient',
    detail: 'Hydraulically pressed & cured',
  },
  {
    label: 'Subsoil Sourcing',
    value: '90–95%',
    detail: 'Local mineral earth & aggregate',
  },
  {
    label: 'Thermal Behavior',
    value: 'High Mass',
    detail: 'Passive indoor stabilization',
  },
];

const CORE_PRINCIPLES = [
  {
    index: '01.',
    title: 'Hydraulic Density & Compaction',
    description:
      'Selected mineral subsoils are blended with minimal low-carbon stabilizer and compacted under high hydraulic pressure, creating dense blocks without energy-intensive kiln firing.',
  },
  {
    index: '02.',
    title: 'Modular Masonry Precision',
    description:
      'Uniform block geometry and interlocking faces maintain tight course tolerances, reducing mortar waste and enabling clean, exposed architectural wall assemblies.',
  },
  {
    index: '03.',
    title: 'Passive Hygrothermal Mass',
    description:
      'Heavy earthen walls naturally buffer indoor temperature fluctuations and ambient humidity, supporting quieter, thermally balanced interior environments.',
  },
];

const APPLICATION_PROFILES: ApplicationProfile[] = [
  {
    id: 'residential',
    title: 'Load-Bearing Envelopes',
    summary:
      'Single- and multi-story residential walls designed for exposed interior and exterior mineral finishes.',
    dimensions: '295 × 140 × 90 mm standard modular profile',
    note: 'Suitable for dry-stack interlocking or thin-bed lime mortar joints.',
  },
  {
    id: 'civic',
    title: 'Civic & Studio Pavilions',
    summary:
      'Acoustic and thermal mass walls for community spaces, studios, and low-rise public architecture.',
    dimensions: '300 × 150 × 100 mm architectural face profile',
    note: 'Supports integrated vertical reinforcement channels where required.',
  },
  {
    id: 'partitions',
    title: 'Interior Thermal Partitions',
    summary:
      'Non-kiln interior walls engineered to regulate daylight heat gain and dampen airborne sound.',
    dimensions: '240 × 115 × 90 mm acoustic partition profile',
    note: 'Available in natural regional soil gradations once catalog launches.',
  },
];

const INTEREST_OPTIONS: InterestTopic[] = [
  'General Updates',
  'Technical Specs',
  'Partnership',
];

export default function App() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string>(
    APPLICATION_PROFILES[0].id
  );
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [interest, setInterest] = useState<InterestTopic>('General Updates');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [submittedRecord, setSubmittedRecord] = useState<{
    email: string;
    interest: InterestTopic;
  } | null>(null);

  const emailInputRef = useRef<HTMLInputElement>(null);

  const activeProfile =
    APPLICATION_PROFILES.find((item) => item.id === selectedProfileId) ??
    APPLICATION_PROFILES[0];

  function scrollToUpdatesAndFocus() {
    setMobileNavOpen(false);
    const updatesSection = document.getElementById('updates');
    if (updatesSection) {
      updatesSection.scrollIntoView({ behavior: 'smooth' });
    }
    window.setTimeout(() => {
      emailInputRef.current?.focus({ preventScroll: true });
    }, 350);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedEmail = email.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedEmail) {
      setEmailError('Please enter an email address to receive updates.');
      emailInputRef.current?.focus();
      return;
    }

    if (!emailPattern.test(trimmedEmail)) {
      setEmailError('Please enter a valid email address (e.g. name@domain.com).');
      emailInputRef.current?.focus();
      return;
    }

    setEmailError(null);
    setSubmittedRecord({
      email: trimmedEmail,
      interest,
    });
  }

  function handleResetForm() {
    setSubmittedRecord(null);
    setEmail('');
    setName('');
    setEmailError(null);
    window.setTimeout(() => {
      emailInputRef.current?.focus();
    }, 50);
  }

  return (
    <div className="min-h-screen bg-[#F6F7F6] text-[#141716]">
      {/* Top Bar: 3-Zone Contract */}
      <header className="sticky top-0 z-30 border-b border-[#E1E4E0] bg-[#F6F7F6]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-6 py-4 lg:px-10">
          {/* Zone 1: Single-line Brand Wordmark */}
          <a
            href="#overview"
            className="font-display text-xl font-bold tracking-tight text-[#141716] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1B4D3E]"
          >
            StrataCEB
          </a>

          {/* Zone 2: 4 Single-line Text Navigation Links */}
          <nav
            aria-label="Primary"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[#4F5652]"
          >
            <a
              href="#overview"
              className="whitespace-nowrap shrink-0 transition-colors duration-150 hover:text-[#141716] hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1B4D3E]"
            >
              Overview
            </a>
            <a
              href="#material"
              className="whitespace-nowrap shrink-0 transition-colors duration-150 hover:text-[#141716] hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1B4D3E]"
            >
              Material
            </a>
            <a
              href="#applications"
              className="whitespace-nowrap shrink-0 transition-colors duration-150 hover:text-[#141716] hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1B4D3E]"
            >
              Applications
            </a>
            <a
              href="#updates"
              className="whitespace-nowrap shrink-0 transition-colors duration-150 hover:text-[#141716] hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1B4D3E]"
            >
              Updates
            </a>
          </nav>

          {/* Zone 3: 1 Primary Action + Mobile Menu Toggle */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={scrollToUpdatesAndFocus}
              className="hidden sm:inline-flex items-center justify-center rounded-lg bg-[#1B4D3E] px-5 py-2.5 text-sm font-medium text-white whitespace-nowrap shrink-0 transition-colors duration-150 hover:bg-[#153C30] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B4D3E] cursor-pointer"
            >
              Request Updates
            </button>
            <button
              type="button"
              onClick={() => setMobileNavOpen((prev) => !prev)}
              aria-expanded={mobileNavOpen}
              aria-label={mobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[#D8DCD7] bg-white text-[#141716] md:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B4D3E] cursor-pointer"
            >
              {mobileNavOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileNavOpen && (
          <div className="border-t border-[#E1E4E0] bg-white px-6 py-4 md:hidden">
            <nav aria-label="Mobile" className="flex flex-col gap-1">
              <a
                href="#overview"
                onClick={() => setMobileNavOpen(false)}
                className="flex min-h-11 items-center text-sm font-medium text-[#141716] hover:text-[#1B4D3E]"
              >
                Overview
              </a>
              <a
                href="#material"
                onClick={() => setMobileNavOpen(false)}
                className="flex min-h-11 items-center text-sm font-medium text-[#141716] hover:text-[#1B4D3E]"
              >
                Material
              </a>
              <a
                href="#applications"
                onClick={() => setMobileNavOpen(false)}
                className="flex min-h-11 items-center text-sm font-medium text-[#141716] hover:text-[#1B4D3E]"
              >
                Applications
              </a>
              <a
                href="#updates"
                onClick={() => setMobileNavOpen(false)}
                className="flex min-h-11 items-center text-sm font-medium text-[#141716] hover:text-[#1B4D3E]"
              >
                Updates
              </a>
              <button
                type="button"
                onClick={scrollToUpdatesAndFocus}
                className="mt-2 flex min-h-11 w-full items-center justify-center rounded-lg bg-[#1B4D3E] px-5 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-[#153C30] cursor-pointer"
              >
                Request Updates
              </button>
            </nav>
          </div>
        )}
      </header>

      <main>
        {/* Hero Welcome Section */}
        <section id="overview" className="mx-auto max-w-7xl px-6 pt-12 pb-12 lg:px-10 lg:pt-16 lg:pb-16">
          <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Hero Copy Column */}
            <div className="flex flex-col justify-between gap-8 lg:col-span-6 lg:py-2">
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-2 text-sm text-[#555D58]">
                  <span>Compressed Earth Block</span>
                  <span aria-hidden="true">·</span>
                  <span>Architectural Masonry</span>
                  <span aria-hidden="true">·</span>
                  <span>Welcome Page</span>
                </div>

                <h1
                  className="font-display font-semibold tracking-tight text-[#141716] leading-[1.08]"
                  style={{
                    fontSize: 'clamp(2.25rem, 4vw, 3.65rem)',
                    textWrap: 'balance',
                  }}
                >
                  Engineered earth masonry for enduring, low-carbon structures.
                </h1>

                <p className="max-w-xl text-base leading-relaxed text-[#4A514D] sm:text-lg">
                  Welcome. Our full Compressed Earth Block catalog, mix-design
                  documentation, and production details are currently being
                  prepared. Join the update list below to be notified as project
                  specifications go live.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-2">
                <button
                  type="button"
                  onClick={scrollToUpdatesAndFocus}
                  className="inline-flex min-h-11 items-center gap-2.5 rounded-lg bg-[#1B4D3E] px-6 py-3 text-sm font-medium text-white whitespace-nowrap shrink-0 transition-colors duration-150 hover:bg-[#153C30] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B4D3E] cursor-pointer"
                >
                  <span>Get Launch Updates</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
                <a
                  href="#material"
                  className="inline-flex min-h-11 items-center text-sm font-medium text-[#141716] underline decoration-[#B8BEB7] underline-offset-4 whitespace-nowrap shrink-0 transition-colors duration-150 hover:text-[#1B4D3E] hover:decoration-[#1B4D3E] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1B4D3E]"
                >
                  Explore Material Overview
                </a>
              </div>
            </div>

            {/* Hero Media Column */}
            <div className="lg:col-span-6">
              <ResilientImage
                src="/src/assets/images/hero_ceb_blocks_1794981440956.jpg"
                alt="Precision-pressed Compressed Earth Blocks arranged on a concrete plinth in natural daylight"
                fallbackTitle="Compressed Earth Block Specimen"
                containerClassName="h-full min-h-[300px] sm:min-h-[380px] rounded-xl border border-[#DCE0DB]"
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* Full-Width 4-Column Baseline Specification Strip */}
          <div className="mt-12 grid grid-cols-1 divide-y divide-[#E1E4E0] rounded-xl border border-[#E1E4E0] bg-white sm:grid-cols-2 sm:divide-y-0 sm:divide-x lg:grid-cols-4">
            {MATERIAL_BASELINES.map((metric, idx) => (
              <div
                key={metric.label}
                className={`p-6 ${
                  idx >= 2 ? 'sm:border-t sm:border-[#E1E4E0] lg:border-t-0' : ''
                }`}
              >
                <p className="text-xs font-medium text-[#555D58]">{metric.label}</p>
                <p className="mt-2 font-mono text-2xl font-medium tracking-tight text-[#141716] tabular-nums">
                  {metric.value}
                </p>
                <p className="mt-1.5 text-sm text-[#4F5652]">{metric.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Material Principles Section */}
        <section
          id="material"
          className="border-t border-[#E1E4E0] bg-white py-16 lg:py-24"
        >
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-5">
                <p className="text-sm font-medium text-[#1B4D3E]">
                  Material Overview
                </p>
                <h2
                  className="mt-3 font-display text-3xl font-semibold tracking-tight text-[#141716] sm:text-4xl"
                  style={{ textWrap: 'balance' }}
                >
                  Built from local subsoil, compressed for structural permanence.
                </h2>
                <p className="mt-5 max-w-md text-base leading-relaxed text-[#4A514D]">
                  Compressed Earth Blocks replace kiln-fired clay and high-embodied
                  concrete units with densely compacted earth. Every block cures at
                  ambient temperature while delivering reliable structural performance.
                </p>
              </div>

              <div className="divide-y divide-[#E1E4E0] border-t border-b border-[#E1E4E0] lg:col-span-7">
                {CORE_PRINCIPLES.map((item) => (
                  <div
                    key={item.index}
                    className="grid grid-cols-1 gap-3 py-7 sm:grid-cols-12 sm:gap-6"
                  >
                    <div className="sm:col-span-2">
                      <span className="font-mono text-sm font-medium text-[#1B4D3E] tabular-nums">
                        {item.index}
                      </span>
                    </div>
                    <div className="sm:col-span-10">
                      <h3 className="font-display text-lg font-semibold text-[#141716]">
                        {item.title}
                      </h3>
                      <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#4F5652] sm:text-base">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Architectural Applications Showcase */}
        <section
          id="applications"
          className="border-t border-[#E1E4E0] bg-[#F6F7F6] py-16 lg:py-24"
        >
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <p className="text-sm font-medium text-[#1B4D3E]">
                  Planned Assemblies
                </p>
                <h2
                  className="mt-2 font-display text-3xl font-semibold tracking-tight text-[#141716] sm:text-4xl"
                  style={{ textWrap: 'balance' }}
                >
                  Designed for modern architectural masonry.
                </h2>
              </div>

              {/* Interactive Application Selector */}
              <div
                role="tablist"
                aria-label="Masonry assembly profiles"
                className="flex flex-wrap items-center gap-1 rounded-lg border border-[#DCE0DB] bg-white p-1"
              >
                {APPLICATION_PROFILES.map((profile) => {
                  const isActive = profile.id === activeProfile.id;
                  return (
                    <button
                      key={profile.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setSelectedProfileId(profile.id)}
                      className={`min-h-10 rounded-md px-4 py-2 text-xs font-medium whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B4D3E] cursor-pointer sm:text-sm ${
                        isActive
                          ? 'bg-[#1B4D3E] text-white'
                          : 'text-[#4F5652] hover:text-[#141716]'
                      }`}
                    >
                      {profile.title}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-stretch">
              <div className="relative overflow-hidden rounded-xl border border-[#DCE0DB] lg:col-span-8">
                <ResilientImage
                  src="/src/assets/images/ceb_architectural_wall_1794981441615.jpg"
                  alt="Contemporary low-rise building built with smooth Compressed Earth Block masonry walls"
                  fallbackTitle="CEB Architectural Masonry"
                  containerClassName="aspect-[16/9] w-full"
                  className="h-full w-full object-cover"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
                />
                <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-2 px-6 py-4 text-xs text-white/95 sm:text-sm">
                  <span className="font-medium">
                    Exposed Compressed Earth Masonry Envelope
                  </span>
                  <span className="text-white/80">
                    Dry-stack &amp; thin-joint assembly
                  </span>
                </div>
              </div>

              {/* Selected Profile Specification Panel */}
              <div className="flex flex-col justify-between rounded-xl border border-[#DCE0DB] bg-white p-6 sm:p-8 lg:col-span-4">
                <div>
                  <p className="text-xs font-medium text-[#555D58]">
                    Selected Assembly Profile
                  </p>
                  <h3 className="mt-2 font-display text-2xl font-semibold text-[#141716]">
                    {activeProfile.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#4A514D] sm:text-base">
                    {activeProfile.summary}
                  </p>
                </div>

                <div className="mt-8 space-y-4 border-t border-[#E1E4E0] pt-6">
                  <div>
                    <p className="text-xs text-[#555D58]">Reference Format</p>
                    <p className="mt-1 font-mono text-sm font-medium text-[#141716] tabular-nums">
                      {activeProfile.dimensions}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#555D58]">Assembly Note</p>
                    <p className="mt-1 text-sm text-[#4F5652]">
                      {activeProfile.note}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Launch Updates & Early Inquiry Form */}
        <section
          id="updates"
          className="border-t border-[#E1E4E0] bg-white py-16 lg:py-24"
        >
          <div className="mx-auto max-w-3xl px-6 lg:px-10">
            <div className="rounded-xl border border-[#DCE0DB] bg-[#F6F7F6] p-6 sm:p-10">
              <p className="text-sm font-medium text-[#1B4D3E]">
                Project Launch Notice
              </p>
              <h2
                className="mt-2 font-display text-2xl font-semibold tracking-tight text-[#141716] sm:text-3xl"
                style={{ textWrap: 'balance' }}
              >
                Further details will be shared soon.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#4A514D] sm:text-base">
                Leave your email address to receive full technical datasheets,
                regional soil testing criteria, and availability updates once the
                complete site goes live.
              </p>

              {submittedRecord ? (
                <div
                  role="status"
                  className="mt-8 rounded-lg border border-[#C6D8D0] bg-white p-6"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#1B4D3E] text-white">
                      <Check className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold text-[#141716]">
                        Update request recorded
                      </h3>
                      <p className="mt-1 text-sm text-[#4F5652]">
                        We will send{' '}
                        <span className="font-medium text-[#141716]">
                          {submittedRecord.interest}
                        </span>{' '}
                        to{' '}
                        <span className="font-mono text-xs text-[#141716] sm:text-sm">
                          {submittedRecord.email}
                        </span>{' '}
                        when the full project documentation is published.
                      </p>
                      <button
                        type="button"
                        onClick={handleResetForm}
                        className="mt-4 inline-flex min-h-10 items-center text-sm font-medium text-[#1B4D3E] underline underline-offset-4 hover:text-[#153C30] cursor-pointer"
                      >
                        Register another address
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
                  <div>
                    <span className="block text-xs font-medium text-[#4F5652]">
                      Topic of Interest
                    </span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {INTEREST_OPTIONS.map((option) => {
                        const selected = interest === option;
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setInterest(option)}
                            className={`min-h-10 rounded-lg border px-4 py-2 text-xs font-medium whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B4D3E] cursor-pointer sm:text-sm ${
                              selected
                                ? 'border-[#1B4D3E] bg-[#1B4D3E] text-white'
                                : 'border-[#D4D9D3] bg-white text-[#4F5652] hover:border-[#AEB5AE] hover:text-[#141716]'
                            }`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="visitor-name"
                        className="block text-xs font-medium text-[#4F5652]"
                      >
                        Name or Organization (Optional)
                      </label>
                      <input
                        id="visitor-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Studio or company name"
                        className="mt-1.5 w-full min-h-11 rounded-lg border border-[#D4D9D3] bg-white px-3.5 py-2.5 text-sm text-[#141716] placeholder:text-[#868E89] focus:border-[#1B4D3E] focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/20"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="visitor-email"
                        className="block text-xs font-medium text-[#4F5652]"
                      >
                        Email Address
                      </label>
                      <input
                        ref={emailInputRef}
                        id="visitor-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (emailError) {
                            setEmailError(null);
                          }
                        }}
                        aria-invalid={Boolean(emailError)}
                        aria-describedby={emailError ? 'visitor-email-error' : undefined}
                        placeholder="you@organization.com"
                        className={`mt-1.5 w-full min-h-11 rounded-lg border bg-white px-3.5 py-2.5 text-sm text-[#141716] placeholder:text-[#868E89] focus:outline-none focus:ring-2 ${
                          emailError
                            ? 'border-[#B42318] focus:border-[#B42318] focus:ring-[#B42318]/20'
                            : 'border-[#D4D9D3] focus:border-[#1B4D3E] focus:ring-[#1B4D3E]/20'
                        }`}
                      />
                    </div>
                  </div>

                  {emailError && (
                    <p
                      id="visitor-email-error"
                      role="alert"
                      className="text-xs font-medium text-[#B42318]"
                    >
                      {emailError}
                    </p>
                  )}

                  <div className="pt-1">
                    <button
                      type="submit"
                      className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#1B4D3E] px-6 py-3 text-sm font-medium text-white whitespace-nowrap shrink-0 transition-colors duration-150 hover:bg-[#153C30] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B4D3E] cursor-pointer"
                    >
                      Notify Me
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-[#E1E4E0] bg-[#F6F7F6] py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 sm:flex-row sm:items-center lg:px-10">
          <div className="flex flex-wrap items-center gap-3 text-sm text-[#555D58]">
            <span className="font-display font-semibold text-[#141716]">
              StrataCEB
            </span>
            <span aria-hidden="true">·</span>
            <span>Compressed Earth Block Welcome Template</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm text-[#555D58]">
            <a
              href="#overview"
              className="whitespace-nowrap transition-colors hover:text-[#141716]"
            >
              Overview
            </a>
            <a
              href="#material"
              className="whitespace-nowrap transition-colors hover:text-[#141716]"
            >
              Material
            </a>
            <a
              href="#applications"
              className="whitespace-nowrap transition-colors hover:text-[#141716]"
            >
              Applications
            </a>
            <a
              href="mailto:hello@strataceb.example"
              className="whitespace-nowrap transition-colors hover:text-[#141716]"
            >
              hello@strataceb.example
            </a>
            <span className="whitespace-nowrap">© 2026 StrataCEB</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

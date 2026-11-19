import { ArrowLeft, ArrowRight, Mail, Phone } from 'lucide-react';
import type { SiteSettings } from '../types/limestone';

interface EcoEarthStoryPageProps {
  settings: SiteSettings | null;
  onBackToAbout: () => void;
  onGoToInquiry: () => void;
}

const ENGINEERING_PILLARS = [
  {
    num: '01.',
    title: 'The Desert Soil Matrix',
    body: 'Eco-Earth optimizes local resources by blending abundant fine dune sand (ratee) with pulverized natural depression clay (tarai silt) to achieve maximum structural density.',
  },
  {
    num: '02.',
    title: 'High-Pressure Hydraulic Compression',
    body: 'Using heavy-duty hydraulic presses, the raw earth mix is mechanically compressed to squeeze out air pockets, creating a rock-hard, durable artificial stone.',
  },
  {
    num: '03.',
    title: 'Salt and Heat Resistance',
    body: 'Stabilized with a minimal, precise percentage of sulfate-resistant cement, the blocks block out rising saline groundwater and resist efflorescence, solving the "salt and calor" damage that plagues traditional structures.',
  },
  {
    num: '04.',
    title: 'Net-Zero Manufacturing',
    body: 'Each production hub is powered by an off-grid solar photovoltaic array, ensuring zero-emission production directly in energy-scarce rural areas.',
  },
];

export function EcoEarthStoryPage({
  settings,
  onBackToAbout,
  onGoToInquiry,
}: EcoEarthStoryPageProps) {
  const contactEmail = settings?.contactEmail || 'raiganpat401@gmail.com';
  const contactPhone = settings?.contactPhone || '+923212472380';
  const projectLead = settings?.projectLead || 'Ganpat Meghwar';
  const plantLocation = settings?.plantLocation || 'Mithi, Tharparkar, Sindh, Pakistan';

  return (
    <div className="min-h-screen bg-[#F6F7F6] text-[#141716]">
      <header className="sticky top-0 z-30 border-b border-[#E1E4E0] bg-[#F6F7F6]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4 lg:px-10">
          <button
            type="button"
            onClick={onBackToAbout}
            className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-[#141716] hover:text-[#1B4D3E] cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Back to About Lime Stone &amp; Sustainability</span>
          </button>

          <button
            type="button"
            onClick={onGoToInquiry}
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#1B4D3E] px-4 py-2 text-xs font-medium text-white whitespace-nowrap transition-colors hover:bg-[#153C30] sm:text-sm cursor-pointer"
          >
            Send Inquiry
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12 lg:px-10 lg:py-16">
        <article className="overflow-hidden rounded-xl border border-[#DCE0DB] bg-white">
          {/* Article Header */}
          <div className="border-b border-[#E1E4E0] p-8 sm:p-12">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#1B4D3E]">
              <span>About Lime Stone &amp; Sustainability</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#555D58]">{plantLocation}</span>
            </div>

            <h1
              className="mt-4 font-display text-3xl font-semibold tracking-tight text-[#141716] sm:text-4xl lg:text-[2.65rem] lg:leading-[1.12]"
              style={{ textWrap: 'balance' }}
            >
              Building a Greener Future in the Desert: The Story of Eco-Earth
            </h1>

            {/* Author & Founder Strip */}
            <div className="mt-8 flex flex-col gap-5 border-t border-[#E1E4E0] pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <img
                  src="/assets/aistudio/ganpatProfile_a980c522.jpg"
                  alt={`${projectLead} — Founder of Lime Stone (Eco-Earth Block)`}
                  loading="eager"
                  fetchPriority="high"
                  decoding="sync"
                  referrerPolicy="no-referrer"
                  className="h-16 w-16 shrink-0 rounded-xl border border-[#DCE0DB] object-cover object-top"
                />
                <div>
                  <p className="font-display text-base font-semibold text-[#141716]">
                    {projectLead}
                  </p>
                  <p className="text-xs text-[#4F5652] sm:text-sm">
                    Founder &amp; Project Lead · BBA Student, Sukkur IBA University
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-[#4F5652] sm:text-sm">
                <a
                  href={`mailto:${contactEmail}`}
                  className="inline-flex items-center gap-1.5 font-mono text-[#141716] hover:text-[#1B4D3E]"
                >
                  <Mail className="h-3.5 w-3.5 text-[#1B4D3E]" aria-hidden="true" />
                  <span>{contactEmail}</span>
                </a>
                <a
                  href={`tel:${contactPhone.replace(/\s+/g, '')}`}
                  className="inline-flex items-center gap-1.5 font-mono text-[#141716] hover:text-[#1B4D3E]"
                >
                  <Phone className="h-3.5 w-3.5 text-[#1B4D3E]" aria-hidden="true" />
                  <span>{contactPhone}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Narrative Section */}
          <div className="space-y-6 p-8 text-base leading-relaxed text-[#383F3B] sm:p-12 sm:text-lg sm:leading-relaxed">
            <p>
              For generations, construction across Tharparkar has operated under a heavy
              environmental and economic handicap. Traditional building has relied on fired
              red bricks hauled from kilns far outside the district—a process that drives up
              freight costs, burns fossil fuels, and pumps smoke into the regional air. But
              more importantly, those conventional bricks are ill-suited for the harsh
              realities of the desert. Exposed to scorching summer temperatures exceeding
              45°C and aggressive saline groundwater, traditional walls suffer from rapid
              cracking, moisture wicking, and structural degradation.
            </p>

            <p>
              Enter <span className="font-semibold text-[#141716]">Ganpat Meghwar</span>, a
              BBA student at Sukkur IBA University with a vision to rewrite the narrative of
              industrial development in rural Sindh. Recognizing that Tharparkar needed
              solutions rooted in its own geography, Ganpat founded{' '}
              <span className="font-semibold text-[#141716]">Eco-Earth</span>: a pioneering,
              youth-led industrial initiative bringing solar-powered green manufacturing
              directly to the heart of the desert.
            </p>
          </div>

          {/* Engineering for the Desert */}
          <div className="border-t border-[#E1E4E0] bg-[#FAFBF9] p-8 sm:p-12">
            <p className="text-sm font-medium text-[#1B4D3E]">
              Materials &amp; Process Philosophy
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-[#141716] sm:text-3xl">
              Engineering for the Desert
            </h2>
            <p className="mt-3 max-w-2xl text-base text-[#4A514D]">
              What makes Eco-Earth uniquely suited for Tharparkar is its scientific approach
              to local materials:
            </p>

            <div className="mt-8 divide-y divide-[#E1E4E0] border-t border-b border-[#E1E4E0]">
              {ENGINEERING_PILLARS.map((pillar) => (
                <div
                  key={pillar.num}
                  className="grid grid-cols-1 gap-3 py-6 sm:grid-cols-12 sm:gap-6"
                >
                  <div className="sm:col-span-2">
                    <span className="font-mono text-sm font-medium text-[#1B4D3E] tabular-nums">
                      {pillar.num}
                    </span>
                  </div>
                  <div className="sm:col-span-10">
                    <h3 className="font-display text-lg font-semibold text-[#141716]">
                      {pillar.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#4F5652] sm:text-base">
                      {pillar.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer CTA inside Story Page */}
          <div className="flex flex-col items-start justify-between gap-6 border-t border-[#E1E4E0] bg-white p-8 sm:flex-row sm:items-center sm:p-12">
            <div>
              <h2 className="font-display text-xl font-semibold text-[#141716]">
                Connect with {projectLead} &amp; the Mithi Team
              </h2>
              <p className="mt-1 text-sm text-[#4F5652]">
                Discuss pilot builds, TIEST testing milestones, or regional supply inquiries.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onBackToAbout}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#D4D9D3] bg-white px-4 py-2.5 text-sm font-medium text-[#141716] hover:bg-[#F6F7F6] cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                <span>Back to Overview</span>
              </button>
              <button
                type="button"
                onClick={onGoToInquiry}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#1B4D3E] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#153C30] cursor-pointer"
              >
                <span>Request Product Inquiry</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}

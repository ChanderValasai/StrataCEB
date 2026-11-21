import { count } from 'drizzle-orm';
import { db } from './index.js';
import {
  faqs,
  galleryItems,
  labReports,
  newsArticles,
  processSteps,
  productCategories,
  products,
  projects,
  qualityTests,
  rawMaterials,
  siteSettings,
} from './schema.js';

let seedPromise: Promise<void> | null = null;

export async function ensureSeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = runSeed().catch((error) => {
      seedPromise = null;
      throw error;
    });
  }
  return seedPromise;
}

async function runSeed(): Promise<void> {
  const existingSettings = await db
    .select({ value: count() })
    .from(siteSettings);

  if (Number(existingSettings[0]?.value ?? 0) > 0) {
    return;
  }

  await db.insert(siteSettings).values({
    companyName: 'Lime Stone (Eco-Earth Block)',
    tagline:
      'Solar-powered interlocking Compressed Stabilized Earth Blocks crafted from local Tharparkar minerals.',
    plantLocation: 'Mithi, Tharparkar, Sindh, Pakistan',
    projectLead: 'Ganpat Meghwar',
    contactEmail: 'raiganpat401@gmail.com',
    contactPhone: '+923212472380',
    solarCapacity: '5–8 kW Solar Array (Planned)',
    plannedMonthlyCapacity: '30,000 blocks / month (Planned)',
    teamSize: '~5 local workers (operators, mixing, curing & yard)',
    grantNote: 'PAIDAR Micro Grant (4th Cycle) Proposal · Submitted to TRDP',
    disclaimerText:
      'Important Notice: Lime Stone is the commercial brand name of our lime-cement stabilized compressed earth block (CSEB), not natural limestone. Laboratory trials at TIEST are planned prior to commercial production.',
  });

  const insertedCategories = await db
    .insert(productCategories)
    .values([
      {
        name: 'Interlocking Wall Blocks',
        slug: 'interlocking-wall-blocks',
        description:
          'Load-bearing and partition interlocking Compressed Stabilized Earth Blocks engineered for mortar-reduced, unplastered masonry.',
        sortOrder: 1,
      },
      {
        name: 'Interlocking Floor & Road Paving Blocks',
        slug: 'interlocking-paving-blocks',
        description:
          'High-density interlocking earth paving blocks designed for floors, pathways, driveways, parking zones, and low-traffic roads.',
        sortOrder: 2,
      },
    ])
    .returning();

  const wallCatId = insertedCategories[0].id;
  const pavingCatId = insertedCategories[1].id;

  await db.insert(products).values([
    {
      categoryId: wallCatId,
      name: 'Lime Stone Interlocking Wall Block',
      slug: 'lime-stone-interlocking-wall-block',
      summary:
        'Precision-pressed interlocking wall masonry unit using local Thar clay, desert sand, crushed stone, and lime-cement binder.',
      description:
        'Manufactured on the ST-H201 semi-automatic hydraulic press using local Tharparkar raw materials. The interlocking geometry aligns courses cleanly without plaster or mortar-heavy joints while providing natural earthen thermal mass against Thar heat.',
      dimensions: '230 × 220 × 115 mm',
      dimensionStatus: 'confirmed',
      binderSpec:
        '~8% total binder (hydrated lime + cement blend); ~11% dry-weight moisture',
      applications:
        'Load-bearing residential houses, schools, health units, community shelters, and demonstration walls (subject to TIEST structural verification).',
      features:
        'Zero kiln firing; interlocking mortar-saving profile; ambient damp curing (14–28 days); natural thermal mass.',
      imageUrl: '/assets/aistudio/compressed-stabilised-earth-blocks_ccb5ffe6.jpg',
      technicalDocUrl: '/assets/aistudio/Lime_Stone_Concept_Note_1fb85817.pdf',
      availabilityStatus: 'trial_phase',
      isPublished: true,
    },
    {
      categoryId: pavingCatId,
      name: 'Lime Stone Interlocking Floor & Road Paving Block',
      slug: 'lime-stone-interlocking-paving-block',
      summary:
        'Dense hydraulically compressed interlocking paving unit for walkways, floors, driveways, and low-traffic surfaces.',
      description:
        'Formulated with graded 0–5 mm crushed stone, Thar desert sand, white clay, and lime-cement stabilization for abrasion-resistant surface paving. Final mold dimensions and mix ratios will be confirmed following TIEST soaked-strength and water-absorption trials.',
      dimensions: 'Pending final paving mold confirmation',
      dimensionStatus: 'pending_confirmation',
      binderSpec:
        'Cement-only vs. lime-cement trial blends (~8% target binder under evaluation)',
      applications:
        'Courtyard floors, pedestrian pathways, driveways, parking zones, and low-traffic stabilization layers.',
      features:
        'Interlocking lateral restraint; locally sourced mineral aggregate; solar-powered hydraulic pressing; replaceable modular units.',
      imageUrl: '/assets/aistudio/images__20__df0911e6.jfif',
      technicalDocUrl: '/assets/aistudio/Lime_Stone_Concept_Note_1fb85817.pdf',
      availabilityStatus: 'planned_production',
      isPublished: true,
    },
  ]);

  await db.insert(rawMaterials).values([
    {
      name: 'Thar White Clay',
      sourceLocation: 'Candidate sources near Bughar (east of Mithi) & Nagarparkar kaolin',
      purpose: 'Natural plastic binder providing green compaction strength and cohesion.',
      technicalNotes:
        'Every candidate deposit undergoes salt and gypsum screening before batching; sources with excessive salts are rejected.',
      sortOrder: 1,
      isPublished: true,
    },
    {
      name: 'Thar Desert Sand',
      sourceLocation: 'Tharparkar local sand deposits, Sindh',
      purpose: 'Fine mineral filler balancing clay plasticity and reducing drying shrinkage.',
      technicalNotes:
        'Screened for organic impurities and tested for soluble salt/gypsum content alongside clay.',
      sortOrder: 2,
      isPublished: true,
    },
    {
      name: 'Crushed Stone (0–5 mm)',
      sourceLocation: 'Regional stone crusher suppliers',
      purpose: 'Coarse mineral skeleton enhancing compressive density and surface wear resistance.',
      technicalNotes:
        'Graded 0–5 mm fraction; supplier pricing confirmation is part of pre-production validation.',
      sortOrder: 3,
      isPublished: true,
    },
    {
      name: 'Hydrated Lime',
      sourceLocation: 'Regional lime suppliers',
      purpose: 'Pozzolanic stabilizer reacting with clay minerals for long-term durability.',
      technicalNotes:
        'Used in lime-cement blend (~8% total binder); improves long-term cohesion and reduces reliance on pure cement.',
      sortOrder: 4,
      isPublished: true,
    },
    {
      name: 'Cement',
      sourceLocation: 'Standard Portland cement suppliers',
      purpose: 'Provides early-stage handling and structural strength during initial curing.',
      technicalNotes:
        'Blended with hydrated lime to mitigate slow early lime strength; compared against cement-only trials at TIEST.',
      sortOrder: 5,
      isPublished: true,
    },
    {
      name: 'Water',
      sourceLocation: 'Mithi local water sources (salt-screened)',
      purpose: 'Activates binder hydration and achieves optimum compaction moisture.',
      technicalNotes:
        'Added at approximately 11% of dry mix weight; checked for salinity and gypsum prior to mixing and curing.',
      sortOrder: 6,
      isPublished: true,
    },
  ]);

  await db.insert(processSteps).values([
    {
      stepNumber: 1,
      title: 'Raw Material Sourcing',
      description:
        'Procure Thar white clay (Bughar / Nagarparkar candidate deposits), Thar desert sand, 0–5 mm crushed stone, hydrated lime, and cement locally.',
      qualityControlNote: 'Verify source consistency and transport proximity to Mithi plant.',
      keyParameter: 'Local Tharparkar mineral sourcing',
    },
    {
      stepNumber: 2,
      title: 'Salt & Gypsum Screening',
      description:
        'Inspect raw clay, sand, and water sources for soluble salts and gypsum to prevent efflorescence or long-term durability loss.',
      qualityControlNote: 'Switch material sources immediately if excessive salts or gypsum are detected.',
      keyParameter: 'Pre-batch salinity & gypsum check',
    },
    {
      stepNumber: 3,
      title: 'Material Preparation',
      description:
        'Dry, pulverize, and sieve clay and sand aggregates to remove lumps and ensure uniform particle-size distribution.',
      qualityControlNote: 'Consistent gradation prevents voids and uneven block surfaces.',
      keyParameter: '0–5 mm aggregate sizing',
    },
    {
      stepNumber: 4,
      title: 'Dry Mixing',
      description:
        'Proportion clay, sand, crushed stone, hydrated lime, and cement inside the locally fabricated mixer and hopper until homogeneous.',
      qualityControlNote: 'Uniform binder dispersion ensures consistent block strength.',
      keyParameter: '~8% total lime-cement binder',
    },
    {
      stepNumber: 5,
      title: 'Controlled Water Addition',
      description:
        'Introduce clean, tested water gradually into the dry blend to reach optimal compaction moisture without over-wetting.',
      qualityControlNote: 'Perform hand-ball drop check alongside measured batching.',
      keyParameter: '~11% moisture by dry weight',
    },
    {
      stepNumber: 6,
      title: 'Hydraulic Compression',
      description:
        'Feed conditioned mix into the ST-H201 semi-automatic hydraulic press powered by a 5–8 kW solar array to compact interlocking blocks.',
      qualityControlNote: 'Monitor hydraulic pressure and mold fill uniformity.',
      keyParameter: 'ST-H201 press · 230 × 220 × 115 mm mold',
    },
    {
      stepNumber: 7,
      title: 'Block Ejection & Handling',
      description:
        'Eject freshly pressed green blocks cleanly onto level pallets and transfer carefully to shaded curing beds.',
      qualityControlNote: 'Check fresh block weight, edge crispness, and interlock geometry.',
      keyParameter: 'Batch weight & dimension check',
    },
    {
      stepNumber: 8,
      title: 'Damp Curing',
      description:
        'Keep blocks damp under protective cover for the first 7 days, followed by continued protection until at least 14–28 days.',
      qualityControlNote: 'Prevents rapid desert evaporation so lime-cement hydration completes.',
      keyParameter: '7 days covered · 14–28 days total cure',
    },
    {
      stepNumber: 9,
      title: 'Quality Inspection & Lab Testing',
      description:
        'Conduct weight and dimensional verification on every batch, plus dry compressive, soaked strength, and water absorption tests on samples.',
      qualityControlNote: 'Benchmark performance against local fired red bricks at TIEST.',
      keyParameter: '14-day & 28-day sample validation',
    },
    {
      stepNumber: 10,
      title: 'Yard Storage & Distribution',
      description:
        'Stack cured, inspected blocks in yard bays for dispatch to homeowners, contractors, NGOs, and regional paving projects.',
      qualityControlNote: 'Trace batch cure completion date before site delivery.',
      keyParameter: 'Target 30,000 blocks / month capacity',
    },
  ]);

  await db.insert(qualityTests).values([
    {
      title: 'Raw Material Salt & Gypsum Screening',
      category: 'Raw Material Control',
      methodology: 'Source testing on Thar white clay, desert sand, and mixing water',
      targetStandard: 'Low-salinity, gypsum-free source qualification prior to production',
      verificationStatus: 'planned',
      institution: 'Plant QA / TIEST Pre-Production Check',
      notes: 'Critical mitigation for Tharparkar saline soil and water risk.',
      sortOrder: 1,
    },
    {
      title: 'Dry Compressive Strength (14 & 28 Days)',
      category: 'Mechanical Performance',
      methodology: 'Comparison of cement-only vs. ~8% lime-cement trial mixes against local red brick benchmark',
      targetStandard: 'Pending TIEST laboratory verification',
      verificationStatus: 'planned',
      institution: 'Thar Institute of Engineering Science and Technology (TIEST)',
      notes: 'Formulation has not yet been tested; results will be published upon trial completion.',
      sortOrder: 2,
    },
    {
      title: 'Soaked (Wet) Compressive Strength',
      category: 'Durability & Moisture',
      methodology: 'Wet immersion compressive testing at 14 and 28 days',
      targetStandard: 'Pending TIEST laboratory verification',
      verificationStatus: 'planned',
      institution: 'Thar Institute of Engineering Science and Technology (TIEST)',
      notes: 'Evaluates structural retention under monsoon or ground-moisture exposure.',
      sortOrder: 3,
    },
    {
      title: 'Water Absorption Test',
      category: 'Durability & Moisture',
      methodology: 'Percentage moisture uptake measurement across trial mixes and local red brick',
      targetStandard: 'Pending TIEST laboratory verification',
      verificationStatus: 'planned',
      institution: 'Thar Institute of Engineering Science and Technology (TIEST)',
      notes: 'Determines suitability for exterior unplastered walls and paving.',
      sortOrder: 4,
    },
    {
      title: 'Batch Weight & Dimensional Verification',
      category: 'Production Control',
      methodology: 'Per-batch physical inspection of mass and interlocking mold tolerances',
      targetStandard: '230 × 220 × 115 mm (wall block mold reference)',
      verificationStatus: 'planned',
      institution: 'Mithi Plant Production Team',
      notes: 'Enforced on every production batch once plant operations commence.',
      sortOrder: 5,
    },
  ]);

  await db.insert(labReports).values([
    {
      title: 'Pre-Production Comparative Mix Trial Protocol (TIEST)',
      reportCode: 'TIEST-TRIAL-PLAN-01',
      institution: 'Thar Institute of Engineering Science and Technology (TIEST), Tharparkar',
      testAgeDays: '14 & 28 days (Planned)',
      verificationStatus: 'planned',
      summary:
        'Scheduled laboratory trial comparing cement-only and lime-cement (~8% binder) mixes on dry compressive strength, soaked strength, water absorption, and unit cost alongside local red bricks.',
      documentUrl: '/assets/aistudio/Lime_Stone_Concept_Note_1fb85817.pdf',
      publishedDate: 'Pending Completion',
    },
  ]);

  await db.insert(projects).values([
    {
      title: 'Mithi Demonstration Wall & Paving Section',
      location: 'Mithi, Tharparkar, Sindh',
      projectType: 'Demonstration Build',
      status: 'planned_demo',
      description:
        'Planned on-site demonstration wall and interlocking paving section to showcase mortar-reduced assembly, finish quality, and real-world durability to local builders, homeowners, and NGOs.',
      imageUrl: '/src/assets/images/ceb_architectural_wall_1794981441615.jpg',
      isPublished: true,
    },
    {
      title: 'Regional Sindh CSEB & Tuff-Tile Precedent Context',
      location: 'Sindh Province, Pakistan',
      projectType: 'Regional Precedent',
      status: 'completed',
      description:
        'Similar interlocking pavers and compressed stabilized earth/soil blocks are already proven across Sindh for pathways, driveways, parking zones, and community structures—establishing regional market readiness.',
      imageUrl: '/assets/aistudio/interlocking-stabilized-soil-blocks_5532fc6f.jpg',
      isPublished: true,
    },
  ]);

  await db.insert(galleryItems).values([
    {
      title: 'Interlocking Stabilized Earth Block (Close-Up)',
      category: 'product',
      caption:
        'Compressed stabilized earth block showing dual alignment cores and mortar-reduced interlocking profile.',
      imageUrl: '/assets/aistudio/compressed-stabilised-earth-blocks_ccb5ffe6.jpg',
      isPublished: true,
    },
    {
      title: 'Freshly Pressed Interlocking Soil Blocks',
      category: 'manufacturing',
      caption:
        'Interlocking compressed blocks stacked beside the hydraulic press during production.',
      imageUrl: '/assets/aistudio/interlocking-stabilized-soil-blocks_5532fc6f.jpg',
      isPublished: true,
    },
    {
      title: 'Interlocking Block Profile & Wall Bond Variations',
      category: 'product',
      caption:
        'Modular interlocking wall block configurations and corner bonding layouts.',
      imageUrl: '/assets/aistudio/compressed-earth-block_405e7519.jpg',
      isPublished: true,
    },
    {
      title: 'Stacked Interlocking Masonry Course Sample',
      category: 'product',
      caption:
        'Dry-stacked interlocking earth block sample showing stepped masonry courses.',
      imageUrl:
        '/assets/aistudio/Hr4-10-Automatic-Clay-Brick-Making-Machine-in-Pakistan-Mud-Block-Machine-Earth-Block-Machine-Cabro-Block-Machine_3b872809.jpg',
      isPublished: true,
    },
    {
      title: 'Low-Carbon Earth Masonry Pavilion Concept',
      category: 'demonstration',
      caption:
        'Contemporary unplastered earthen wall assembly illustrating thermal mass and mortar-reduced joints.',
      imageUrl: '/src/assets/images/ceb_architectural_wall_1794981441615.jpg',
      isPublished: true,
    },
    {
      title: 'Interlocking Road & Pathway Paving Installation',
      category: 'product',
      caption:
        'Interlocking paving blocks being laid over compacted sand bed for driveways and low-traffic roads.',
      imageUrl: '/assets/aistudio/images__20__df0911e6.jfif',
      isPublished: true,
    },
    {
      title: 'Paving Pattern & Walkway Assemblies',
      category: 'demonstration',
      caption:
        'Modular interlocking floor and pathway paving patterns across pedestrian and courtyard surfaces.',
      imageUrl: '/assets/aistudio/Paver-Block-Image_96fc06de.jpg',
      isPublished: true,
    },
    {
      title: 'Interlocking Paver Block Shapes Reference',
      category: 'product',
      caption:
        'Reference geometry profiles including Dumble, Unipaver, Trihex, Hexagon, and Brick paving forms.',
      imageUrl: '/assets/aistudio/images__21__700ce1da.jfif',
      isPublished: true,
    },
    {
      title: 'Interlocking Floor & Road Paver Units',
      category: 'product',
      caption:
        'Interlocking dumbbell-profile paving units aligned for lateral load transfer.',
      imageUrl: '/assets/aistudio/Paving-Blocks_a9253d6d.jpg',
      isPublished: true,
    },
    {
      title: 'Tharparkar Raw Material Stockpile',
      category: 'manufacturing',
      caption:
        'Thar white clay, desert sand, 0–5 mm crushed stone, hydrated lime, and cement staged for batching.',
      imageUrl:
        '/assets/aistudio/Gemini_Generated_Image_orhk1yorhk1yorhk_5d952a5d.jfif',
      isPublished: true,
    },
    {
      title: 'Gypsum & Salt Screening Reference Chart',
      category: 'testing',
      caption:
        'Quality screening thresholds for calcium sulfate purity, particle fineness, moisture, and soluble salts.',
      imageUrl: '/assets/aistudio/Gyp_qual_e9524d29.jpeg',
      isPublished: true,
    },
    {
      title: 'Thar White Clay Deposit',
      category: 'manufacturing',
      caption:
        'Candidate Thar white clay deposit for natural block plasticity and cohesion.',
      imageUrl: '/assets/aistudio/Thar_White_Clay_6cccc474.jfif',
      isPublished: true,
    },
    {
      title: 'Thar Desert Sand',
      category: 'manufacturing',
      caption:
        'Local Tharparkar desert sand used to balance clay plasticity and shrinkage.',
      imageUrl: '/assets/aistudio/Thar_Desert_Sand_f476688f.jfif',
      isPublished: true,
    },
    {
      title: 'Crushed Stone (0–5 mm)',
      category: 'manufacturing',
      caption:
        'Graded 0–5 mm crushed stone aggregate providing structural skeleton.',
      imageUrl: '/assets/aistudio/Crushed_Stone__0_5_mm__b7b2193c.jfif',
      isPublished: true,
    },
    {
      title: 'Hydrated Lime Stabilizer',
      category: 'manufacturing',
      caption:
        'Hydrated lime component used in ~8% lime-cement stabilization trials.',
      imageUrl: '/assets/aistudio/Hydrated_Lime_3d4d229f.jfif',
      isPublished: true,
    },
    {
      title: 'Portland Cement Co-Stabilizer',
      category: 'manufacturing',
      caption:
        'Cement component supporting early green strength in lime-cement blends.',
      imageUrl: '/assets/aistudio/Cement_2524b46a.jfif',
      isPublished: true,
    },
    {
      title: 'Interlocking Earth Block Wall Construction',
      category: 'demonstration',
      caption:
        'Stabilized interlocking earth block pallet staged alongside load-bearing wall assembly.',
      imageUrl: '/assets/aistudio/SMB-1024x536_225f679f.webp',
      isPublished: true,
    },
    {
      title: 'Exposed Compressed Earth Block Residence',
      category: 'demonstration',
      caption:
        'Completed two-story residence featuring unplastered interlocking earth block walls.',
      imageUrl: '/assets/aistudio/images__25__aa06fb5c.jfif',
      isPublished: true,
    },
    {
      title: 'Earth Masonry Balcony & Timber Canopy',
      category: 'demonstration',
      caption:
        'Upper terrace and sunshade framing integrated with exposed earth block masonry.',
      imageUrl: '/assets/aistudio/images__23__f237e0cc.jfif',
      isPublished: true,
    },
    {
      title: 'Ventilated Earth Masonry Screen & Columns',
      category: 'demonstration',
      caption:
        'Earth block structural columns, stepped entrance, and perforated ventilation wall.',
      imageUrl: '/assets/aistudio/images__24__91e88d57.jfif',
      isPublished: true,
    },
  ]);

  await db.insert(faqs).values([
    {
      question: 'What is Lime Stone?',
      answer:
        'Lime Stone is the commercial brand name for our lime-cement stabilized Compressed Stabilized Earth Blocks (CSEBs) planned for production in Mithi, Tharparkar. It is an engineered eco-earth block, not natural quarried limestone.',
      category: 'General',
      sortOrder: 1,
      isPublished: true,
    },
    {
      question: 'What are Compressed Stabilized Earth Blocks (CSEBs)?',
      answer:
        'CSEBs are dense masonry blocks made by compressing a damp mixture of local clay, sand, aggregate, and a small percentage of lime-cement stabilizer inside a hydraulic press, then damp-curing them without kiln firing.',
      category: 'Technology',
      sortOrder: 2,
      isPublished: true,
    },
    {
      question: 'What raw materials are used in Lime Stone blocks?',
      answer:
        'Our formulation combines locally available Thar white clay (candidate deposits near Bughar and Nagarparkar kaolin), Thar desert sand, 0–5 mm crushed stone, a lime-cement binder (hydrated lime plus cement, ~8% total binder), and salt-tested water (~11% of dry weight).',
      category: 'Materials',
      sortOrder: 3,
      isPublished: true,
    },
    {
      question: 'How are the blocks manufactured?',
      answer:
        'Materials are screened for salt and gypsum, dry-mixed, moistened to ~11% dry weight, hydraulically pressed using an ST-H201 semi-automatic machine powered mainly by a 5–8 kW solar array, ejected, and damp-cured under cover.',
      category: 'Process',
      sortOrder: 4,
      isPublished: true,
    },
    {
      question: 'What are the benefits of interlocking blocks?',
      answer:
        'Interlocking geometry aligns blocks quickly with minimal mortar, reduces skilled labor demands, eliminates plaster where desired, and delivers strong thermal mass that helps keep interiors cooler in Tharparkar heat.',
      category: 'Benefits',
      sortOrder: 5,
      isPublished: true,
    },
    {
      question: 'What is the curing process?',
      answer:
        'Freshly pressed blocks undergo damp curing under protective cover for the first 7 days, followed by continued moisture protection until at least 14 to 28 days to ensure full binder hydration.',
      category: 'Process',
      sortOrder: 6,
      isPublished: true,
    },
    {
      question: 'What quality tests are conducted?',
      answer:
        'Raw clay, sand, and water are checked for salt and gypsum. Production batches undergo weight and dimension checks, and a planned laboratory trial at TIEST (Tharparkar) will measure 14-day and 28-day dry/soaked compressive strength and water absorption against local red bricks.',
      category: 'Quality',
      sortOrder: 7,
      isPublished: true,
    },
    {
      question: 'Where can the products be used?',
      answer:
        'Subject to final TIEST test validation and engineering approval, the blocks are intended for residential houses, schools, health units, community shelters, floors, pathways, driveways, parking zones, and low-traffic paving.',
      category: 'Applications',
      sortOrder: 8,
      isPublished: true,
    },
    {
      question: 'How can customers request product information or samples?',
      answer:
        'Homeowners, contractors, engineers, and NGOs can submit a project inquiry through the Contact & Inquiry form on this website to request updates, technical trial results, or future supply discussions.',
      category: 'Inquiries',
      sortOrder: 9,
      isPublished: true,
    },
  ]);

  await db.insert(newsArticles).values([
    {
      title: 'PAIDAR Micro Grant Proposal Submitted for Mithi Solar CEB Plant',
      slug: 'paidar-micro-grant-proposal-mithi-plant',
      category: 'Business Update',
      summary:
        'Project Lead Ganpat Meghwar submitted the Lime Stone (Eco-Earth Block) proposal under the PAIDAR Micro Grant (4th cycle) to TRDP for Mithi’s first solar-powered CSEB facility.',
      content:
        'The proposed Mithi facility targets a planned capacity of 30,000 interlocking blocks per month using an ST-H201 semi-automatic hydraulic press powered by a 5–8 kW solar array, creating local jobs for approximately five workers.',
      publishedAt: '2026-11-18',
      isPublished: true,
    },
    {
      title: 'Pre-Production Laboratory Trial Planned at TIEST, Tharparkar',
      slug: 'tiest-laboratory-trial-planned',
      category: 'Laboratory Testing',
      summary:
        'Comparative 14-day and 28-day strength and water absorption tests are scheduled at Thar Institute of Engineering Science and Technology before production begins.',
      content:
        'TIEST trials will evaluate cement-only and ~8% lime-cement blends against local red brick benchmarks on dry compressive strength, soaked wet strength, water absorption, and block unit cost. Published specifications will be updated once verified lab reports are received.',
      publishedAt: '2026-11-18',
      isPublished: true,
    },
  ]);
}

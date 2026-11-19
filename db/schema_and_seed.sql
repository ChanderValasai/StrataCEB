-- ============================================================================
-- Lime Stone (Eco-Earth Block) — PostgreSQL Schema & Initial Seed Data
-- Compatible with Neon, Supabase, and standard PostgreSQL 15+
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  uid TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'editor',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL REFERENCES product_categories(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  summary TEXT NOT NULL,
  description TEXT NOT NULL,
  dimensions TEXT NOT NULL,
  dimension_status TEXT NOT NULL DEFAULT 'pending_confirmation',
  binder_spec TEXT NOT NULL,
  applications TEXT NOT NULL,
  features TEXT NOT NULL,
  image_url TEXT NOT NULL,
  technical_doc_url TEXT,
  availability_status TEXT NOT NULL DEFAULT 'planned_production',
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS raw_materials (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  source_location TEXT NOT NULL,
  purpose TEXT NOT NULL,
  technical_notes TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS process_steps (
  id SERIAL PRIMARY KEY,
  step_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  quality_control_note TEXT NOT NULL,
  key_parameter TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS quality_tests (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  methodology TEXT NOT NULL,
  target_standard TEXT NOT NULL,
  verification_status TEXT NOT NULL DEFAULT 'planned',
  institution TEXT NOT NULL,
  notes TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS lab_reports (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  report_code TEXT NOT NULL,
  institution TEXT NOT NULL,
  test_age_days TEXT NOT NULL,
  verification_status TEXT NOT NULL DEFAULT 'planned',
  summary TEXT NOT NULL,
  document_url TEXT,
  published_date TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  project_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'planned_demo',
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gallery_items (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  caption TEXT NOT NULL,
  image_url TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS faqs (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS news_articles (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  published_at TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inquiries (
  id SERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  organization_name TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  inquiry_type TEXT NOT NULL,
  product_interest TEXT NOT NULL,
  estimated_quantity TEXT,
  project_location TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  admin_notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_settings (
  id SERIAL PRIMARY KEY,
  company_name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  plant_location TEXT NOT NULL,
  project_lead TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  solar_capacity TEXT NOT NULL,
  planned_monthly_capacity TEXT NOT NULL,
  team_size TEXT NOT NULL,
  grant_note TEXT NOT NULL,
  disclaimer_text TEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Seed Admin Users (adopted automatically on first Firebase Google Sign-In)
-- ============================================================================

INSERT INTO users (uid, email, display_name, role)
VALUES
  ('seed-admin-ganpat', 'raiganpat401@gmail.com', 'Ganpat Meghwar', 'admin'),
  ('seed-admin-owner', 'valasaict582@gmail.com', 'Site Owner', 'admin')
ON CONFLICT (uid) DO NOTHING;

-- ============================================================================
-- Seed Site Settings
-- ============================================================================

INSERT INTO site_settings (
  company_name,
  tagline,
  plant_location,
  project_lead,
  contact_email,
  contact_phone,
  solar_capacity,
  planned_monthly_capacity,
  team_size,
  grant_note,
  disclaimer_text
)
SELECT
  'Lime Stone (Eco-Earth Block)',
  'Solar-powered interlocking Compressed Stabilized Earth Blocks crafted from local Tharparkar minerals.',
  'Mithi, Tharparkar, Sindh, Pakistan',
  'Ganpat Meghwar',
  'raiganpat401@gmail.com',
  '+923212472380',
  '5–8 kW Solar Array (Planned)',
  '30,000 blocks / month (Planned)',
  '~5 local workers (operators, mixing, curing & yard)',
  'PAIDAR Micro Grant (4th Cycle) Proposal · Submitted to TRDP',
  'Important Notice: Lime Stone is the commercial brand name of our lime-cement stabilized compressed earth block (CSEB), not natural limestone. Laboratory trials at TIEST are planned prior to commercial production.'
WHERE NOT EXISTS (SELECT 1 FROM site_settings);

-- ============================================================================
-- Seed Product Categories & Products
-- ============================================================================

INSERT INTO product_categories (name, slug, description, sort_order)
VALUES
  (
    'Interlocking Wall Blocks',
    'interlocking-wall-blocks',
    'Load-bearing and partition interlocking Compressed Stabilized Earth Blocks engineered for mortar-reduced, unplastered masonry.',
    1
  ),
  (
    'Interlocking Floor & Road Paving Blocks',
    'interlocking-paving-blocks',
    'High-density interlocking earth paving blocks designed for floors, pathways, driveways, parking zones, and low-traffic roads.',
    2
  )
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (
  category_id,
  name,
  slug,
  summary,
  description,
  dimensions,
  dimension_status,
  binder_spec,
  applications,
  features,
  image_url,
  technical_doc_url,
  availability_status,
  is_published
)
VALUES
  (
    (SELECT id FROM product_categories WHERE slug = 'interlocking-wall-blocks' LIMIT 1),
    'Lime Stone Interlocking Wall Block',
    'lime-stone-interlocking-wall-block',
    'Precision-pressed interlocking wall masonry unit using local Thar clay, desert sand, crushed stone, and lime-cement binder.',
    'Manufactured on the ST-H201 semi-automatic hydraulic press using local Tharparkar raw materials. The interlocking geometry aligns courses cleanly without plaster or mortar-heavy joints while providing natural earthen thermal mass against Thar heat.',
    '230 × 220 × 115 mm',
    'confirmed',
    '~8% total binder (hydrated lime + cement blend); ~11% dry-weight moisture',
    'Load-bearing residential houses, schools, health units, community shelters, and demonstration walls (subject to TIEST structural verification).',
    'Zero kiln firing; interlocking mortar-saving profile; ambient damp curing (14–28 days); natural thermal mass.',
    '/assets/aistudio/compressed-stabilised-earth-blocks_ccb5ffe6.jpg',
    '/assets/aistudio/Lime_Stone_Concept_Note_1fb85817.pdf',
    'trial_phase',
    TRUE
  ),
  (
    (SELECT id FROM product_categories WHERE slug = 'interlocking-paving-blocks' LIMIT 1),
    'Lime Stone Interlocking Floor & Road Paving Block',
    'lime-stone-interlocking-paving-block',
    'Dense hydraulically compressed interlocking paving unit for walkways, floors, driveways, and low-traffic surfaces.',
    'Formulated with graded 0–5 mm crushed stone, Thar desert sand, white clay, and lime-cement stabilization for abrasion-resistant surface paving. Final mold dimensions and mix ratios will be confirmed following TIEST soaked-strength and water-absorption trials.',
    'Pending final paving mold confirmation',
    'pending_confirmation',
    'Cement-only vs. lime-cement trial blends (~8% target binder under evaluation)',
    'Courtyard floors, pedestrian pathways, driveways, parking zones, and low-traffic stabilization layers.',
    'Interlocking lateral restraint; locally sourced mineral aggregate; solar-powered hydraulic pressing; replaceable modular units.',
    '/assets/aistudio/images__20__df0911e6.jfif',
    '/assets/aistudio/Lime_Stone_Concept_Note_1fb85817.pdf',
    'planned_production',
    TRUE
  )
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- Seed Raw Materials (only if empty)
-- ============================================================================

INSERT INTO raw_materials (name, source_location, purpose, technical_notes, sort_order, is_published)
SELECT * FROM (
  VALUES
    (
      'Thar White Clay',
      'Candidate sources near Bughar (east of Mithi) & Nagarparkar kaolin',
      'Natural plastic binder providing green compaction strength and cohesion.',
      'Every candidate deposit undergoes salt and gypsum screening before batching; sources with excessive salts are rejected.',
      1,
      TRUE
    ),
    (
      'Thar Desert Sand',
      'Tharparkar local sand deposits, Sindh',
      'Fine mineral filler balancing clay plasticity and reducing drying shrinkage.',
      'Screened for organic impurities and tested for soluble salt/gypsum content alongside clay.',
      2,
      TRUE
    ),
    (
      'Crushed Stone (0–5 mm)',
      'Regional stone crusher suppliers',
      'Coarse mineral skeleton enhancing compressive density and surface wear resistance.',
      'Graded 0–5 mm fraction; supplier pricing confirmation is part of pre-production validation.',
      3,
      TRUE
    ),
    (
      'Hydrated Lime',
      'Regional lime suppliers',
      'Pozzolanic stabilizer reacting with clay minerals for long-term durability.',
      'Used in lime-cement blend (~8% total binder); improves long-term cohesion and reduces reliance on pure cement.',
      4,
      TRUE
    ),
    (
      'Cement',
      'Standard Portland cement suppliers',
      'Provides early-stage handling and structural strength during initial curing.',
      'Blended with hydrated lime to mitigate slow early lime strength; compared against cement-only trials at TIEST.',
      5,
      TRUE
    ),
    (
      'Water',
      'Mithi local water sources (salt-screened)',
      'Activates binder hydration and achieves optimum compaction moisture.',
      'Added at approximately 11% of dry mix weight; checked for salinity and gypsum prior to mixing and curing.',
      6,
      TRUE
    )
) AS v(name, source_location, purpose, technical_notes, sort_order, is_published)
WHERE NOT EXISTS (SELECT 1 FROM raw_materials);

-- ============================================================================
-- Seed Manufacturing Process Steps (only if empty)
-- ============================================================================

INSERT INTO process_steps (step_number, title, description, quality_control_note, key_parameter)
SELECT * FROM (
  VALUES
    (1, 'Raw Material Sourcing', 'Procure Thar white clay (Bughar / Nagarparkar candidate deposits), Thar desert sand, 0–5 mm crushed stone, hydrated lime, and cement locally.', 'Verify source consistency and transport proximity to Mithi plant.', 'Local Tharparkar mineral sourcing'),
    (2, 'Salt & Gypsum Screening', 'Inspect raw clay, sand, and water sources for soluble salts and gypsum to prevent efflorescence or long-term durability loss.', 'Switch material sources immediately if excessive salts or gypsum are detected.', 'Pre-batch salinity & gypsum check'),
    (3, 'Material Preparation', 'Dry, pulverize, and sieve clay and sand aggregates to remove lumps and ensure uniform particle-size distribution.', 'Consistent gradation prevents voids and uneven block surfaces.', '0–5 mm aggregate sizing'),
    (4, 'Dry Mixing', 'Proportion clay, sand, crushed stone, hydrated lime, and cement inside the locally fabricated mixer and hopper until homogeneous.', 'Uniform binder dispersion ensures consistent block strength.', '~8% total lime-cement binder'),
    (5, 'Controlled Water Addition', 'Introduce clean, tested water gradually into the dry blend to reach optimal compaction moisture without over-wetting.', 'Perform hand-ball drop check alongside measured batching.', '~11% moisture by dry weight'),
    (6, 'Hydraulic Compression', 'Feed conditioned mix into the ST-H201 semi-automatic hydraulic press powered by a 5–8 kW solar array to compact interlocking blocks.', 'Monitor hydraulic pressure and mold fill uniformity.', 'ST-H201 press · 230 × 220 × 115 mm mold'),
    (7, 'Block Ejection & Handling', 'Eject freshly pressed green blocks cleanly onto level pallets and transfer carefully to shaded curing beds.', 'Check fresh block weight, edge crispness, and interlock geometry.', 'Batch weight & dimension check'),
    (8, 'Damp Curing', 'Keep blocks damp under protective cover for the first 7 days, followed by continued protection until at least 14–28 days.', 'Prevents rapid desert evaporation so lime-cement hydration completes.', '7 days covered · 14–28 days total cure'),
    (9, 'Quality Inspection & Lab Testing', 'Conduct weight and dimensional verification on every batch, plus dry compressive, soaked strength, and water absorption tests on samples.', 'Benchmark performance against local fired red bricks at TIEST.', '14-day & 28-day sample validation'),
    (10, 'Yard Storage & Distribution', 'Stack cured, inspected blocks in yard bays for dispatch to homeowners, contractors, NGOs, and regional paving projects.', 'Trace batch cure completion date before site delivery.', 'Target 30,000 blocks / month capacity')
) AS v(step_number, title, description, quality_control_note, key_parameter)
WHERE NOT EXISTS (SELECT 1 FROM process_steps);

-- ============================================================================
-- Seed Quality Tests & Planned TIEST Lab Report (only if empty)
-- ============================================================================

INSERT INTO quality_tests (title, category, methodology, target_standard, verification_status, institution, notes, sort_order)
SELECT * FROM (
  VALUES
    ('Raw Material Salt & Gypsum Screening', 'Raw Material Control', 'Source testing on Thar white clay, desert sand, and mixing water', 'Low-salinity, gypsum-free source qualification prior to production', 'planned', 'Plant QA / TIEST Pre-Production Check', 'Critical mitigation for Tharparkar saline soil and water risk.', 1),
    ('Dry Compressive Strength (14 & 28 Days)', 'Mechanical Performance', 'Comparison of cement-only vs. ~8% lime-cement trial mixes against local red brick benchmark', 'Pending TIEST laboratory verification', 'planned', 'Thar Institute of Engineering Science and Technology (TIEST)', 'Formulation has not yet been tested; results will be published upon trial completion.', 2),
    ('Soaked (Wet) Compressive Strength', 'Durability & Moisture', 'Wet immersion compressive testing at 14 and 28 days', 'Pending TIEST laboratory verification', 'planned', 'Thar Institute of Engineering Science and Technology (TIEST)', 'Evaluates structural retention under monsoon or ground-moisture exposure.', 3),
    ('Water Absorption Test', 'Durability & Moisture', 'Percentage moisture uptake measurement across trial mixes and local red brick', 'Pending TIEST laboratory verification', 'planned', 'Thar Institute of Engineering Science and Technology (TIEST)', 'Determines suitability for exterior unplastered walls and paving.', 4),
    ('Batch Weight & Dimensional Verification', 'Production Control', 'Per-batch physical inspection of mass and interlocking mold tolerances', '230 × 220 × 115 mm (wall block mold reference)', 'planned', 'Mithi Plant Production Team', 'Enforced on every production batch once plant operations commence.', 5)
) AS v(title, category, methodology, target_standard, verification_status, institution, notes, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM quality_tests);

INSERT INTO lab_reports (title, report_code, institution, test_age_days, verification_status, summary, document_url, published_date)
SELECT
  'Pre-Production Comparative Mix Trial Protocol (TIEST)',
  'TIEST-TRIAL-PLAN-01',
  'Thar Institute of Engineering Science and Technology (TIEST), Tharparkar',
  '14 & 28 days (Planned)',
  'planned',
  'Scheduled laboratory trial comparing cement-only and lime-cement (~8% binder) mixes on dry compressive strength, soaked strength, water absorption, and unit cost alongside local red bricks.',
  '/assets/aistudio/Lime_Stone_Concept_Note_1fb85817.pdf',
  'Pending Completion'
WHERE NOT EXISTS (SELECT 1 FROM lab_reports);

-- ============================================================================
-- Seed Projects & Gallery (only if empty)
-- ============================================================================

INSERT INTO projects (title, location, project_type, status, description, image_url, is_published)
SELECT * FROM (
  VALUES
    (
      'Mithi Demonstration Wall & Paving Section',
      'Mithi, Tharparkar, Sindh',
      'Demonstration Build',
      'planned_demo',
      'Planned on-site demonstration wall and interlocking paving section to showcase mortar-reduced assembly, finish quality, and real-world durability to local builders, homeowners, and NGOs.',
      '/assets/aistudio/SMB-1024x536_225f679f.webp',
      TRUE
    ),
    (
      'Regional Sindh CSEB & Tuff-Tile Precedent Context',
      'Sindh Province, Pakistan',
      'Regional Precedent',
      'completed',
      'Similar interlocking pavers and compressed stabilized earth/soil blocks are already proven across Sindh for pathways, driveways, parking zones, and community structures—establishing regional market readiness.',
      '/assets/aistudio/interlocking-stabilized-soil-blocks_5532fc6f.jpg',
      TRUE
    )
) AS v(title, location, project_type, status, description, image_url, is_published)
WHERE NOT EXISTS (SELECT 1 FROM projects);

INSERT INTO gallery_items (title, category, caption, image_url, is_published)
SELECT * FROM (
  VALUES
    ('Interlocking Stabilized Earth Block (Close-Up)', 'product', 'Compressed stabilized earth block showing dual alignment cores and mortar-reduced interlocking profile.', '/assets/aistudio/compressed-stabilised-earth-blocks_ccb5ffe6.jpg', TRUE),
    ('Freshly Pressed Interlocking Soil Blocks', 'manufacturing', 'Interlocking compressed blocks stacked beside the hydraulic press during production.', '/assets/aistudio/interlocking-stabilized-soil-blocks_5532fc6f.jpg', TRUE),
    ('Interlocking Block Profile & Wall Bond Variations', 'product', 'Modular interlocking wall block configurations and corner bonding layouts.', '/assets/aistudio/compressed-earth-block_405e7519.jpg', TRUE),
    ('Stacked Interlocking Masonry Course Sample', 'product', 'Dry-stacked interlocking earth block sample showing stepped masonry courses.', '/assets/aistudio/Hr4-10-Automatic-Clay-Brick-Making-Machine-in-Pakistan-Mud-Block-Machine-Earth-Block-Machine-Cabro-Block-Machine_3b872809.jpg', TRUE),
    ('Interlocking Road & Pathway Paving Installation', 'product', 'Interlocking paving blocks being laid over compacted sand bed for driveways and low-traffic roads.', '/assets/aistudio/images__20__df0911e6.jfif', TRUE),
    ('Paving Pattern & Walkway Assemblies', 'demonstration', 'Modular interlocking floor and pathway paving patterns across pedestrian and courtyard surfaces.', '/assets/aistudio/Paver-Block-Image_96fc06de.jpg', TRUE),
    ('Interlocking Paver Block Shapes Reference', 'product', 'Reference geometry profiles including Dumble, Unipaver, Trihex, Hexagon, and Brick paving forms.', '/assets/aistudio/images__21__700ce1da.jfif', TRUE),
    ('Interlocking Floor & Road Paver Units', 'product', 'Interlocking dumbbell-profile paving units aligned for lateral load transfer.', '/assets/aistudio/Paving-Blocks_a9253d6d.jpg', TRUE),
    ('Tharparkar Raw Material Stockpile', 'manufacturing', 'Thar white clay, desert sand, 0–5 mm crushed stone, hydrated lime, and cement staged for batching.', '/assets/aistudio/Gemini_Generated_Image_orhk1yorhk1yorhk_5d952a5d.jfif', TRUE),
    ('Gypsum & Salt Screening Reference Chart', 'testing', 'Quality screening thresholds for calcium sulfate purity, particle fineness, moisture, and soluble salts.', '/assets/aistudio/Gyp_qual_e9524d29.jpeg', TRUE),
    ('Thar White Clay Deposit', 'manufacturing', 'Candidate Thar white clay deposit for natural block plasticity and cohesion.', '/assets/aistudio/Thar_White_Clay_6cccc474.jfif', TRUE),
    ('Thar Desert Sand', 'manufacturing', 'Local Tharparkar desert sand used to balance clay plasticity and shrinkage.', '/assets/aistudio/Thar_Desert_Sand_f476688f.jfif', TRUE),
    ('Crushed Stone (0–5 mm)', 'manufacturing', 'Graded 0–5 mm crushed stone aggregate providing structural skeleton.', '/assets/aistudio/Crushed_Stone__0_5_mm__b7b2193c.jfif', TRUE),
    ('Hydrated Lime Stabilizer', 'manufacturing', 'Hydrated lime component used in ~8% lime-cement stabilization trials.', '/assets/aistudio/Hydrated_Lime_3d4d229f.jfif', TRUE),
    ('Portland Cement Co-Stabilizer', 'manufacturing', 'Cement component supporting early green strength in lime-cement blends.', '/assets/aistudio/Cement_2524b46a.jfif', TRUE),
    ('Interlocking Earth Block Wall Construction', 'demonstration', 'Stabilized interlocking earth block pallet staged alongside load-bearing wall assembly.', '/assets/aistudio/SMB-1024x536_225f679f.webp', TRUE),
    ('Exposed Compressed Earth Block Residence', 'demonstration', 'Completed two-story residence featuring unplastered interlocking earth block walls.', '/assets/aistudio/images__25__aa06fb5c.jfif', TRUE),
    ('Earth Masonry Balcony & Timber Canopy', 'demonstration', 'Upper terrace and sunshade framing integrated with exposed earth block masonry.', '/assets/aistudio/images__23__f237e0cc.jfif', TRUE),
    ('Ventilated Earth Masonry Screen & Columns', 'demonstration', 'Earth block structural columns, stepped entrance, and perforated ventilation wall.', '/assets/aistudio/images__24__91e88d57.jfif', TRUE)
) AS v(title, category, caption, image_url, is_published)
WHERE NOT EXISTS (SELECT 1 FROM gallery_items);

-- ============================================================================
-- Seed FAQs & News Articles
-- ============================================================================

INSERT INTO faqs (question, answer, category, sort_order, is_published)
SELECT * FROM (
  VALUES
    ('What is Lime Stone?', 'Lime Stone is the commercial brand name for our lime-cement stabilized Compressed Stabilized Earth Blocks (CSEBs) planned for production in Mithi, Tharparkar. It is an engineered eco-earth block, not natural quarried limestone.', 'General', 1, TRUE),
    ('What are Compressed Stabilized Earth Blocks (CSEBs)?', 'CSEBs are dense masonry blocks made by compressing a damp mixture of local clay, sand, aggregate, and a small percentage of lime-cement stabilizer inside a hydraulic press, then damp-curing them without kiln firing.', 'Technology', 2, TRUE),
    ('What raw materials are used in Lime Stone blocks?', 'Our formulation combines locally available Thar white clay (candidate deposits near Bughar and Nagarparkar kaolin), Thar desert sand, 0–5 mm crushed stone, a lime-cement binder (hydrated lime plus cement, ~8% total binder), and salt-tested water (~11% of dry weight).', 'Materials', 3, TRUE),
    ('How are the blocks manufactured?', 'Materials are screened for salt and gypsum, dry-mixed, moistened to ~11% dry weight, hydraulically pressed using an ST-H201 semi-automatic machine powered mainly by a 5–8 kW solar array, ejected, and damp-cured under cover.', 'Process', 4, TRUE),
    ('What are the benefits of interlocking blocks?', 'Interlocking geometry aligns blocks quickly with minimal mortar, reduces skilled labor demands, eliminates plaster where desired, and delivers strong thermal mass that helps keep interiors cooler in Tharparkar heat.', 'Benefits', 5, TRUE),
    ('What is the curing process?', 'Freshly pressed blocks undergo damp curing under protective cover for the first 7 days, followed by continued moisture protection until at least 14 to 28 days to ensure full binder hydration.', 'Process', 6, TRUE),
    ('What quality tests are conducted?', 'Raw clay, sand, and water are checked for salt and gypsum. Production batches undergo weight and dimension checks, and a planned laboratory trial at TIEST (Tharparkar) will measure 14-day and 28-day dry/soaked compressive strength and water absorption against local red bricks.', 'Quality', 7, TRUE),
    ('Where can the products be used?', 'Subject to final TIEST test validation and engineering approval, the blocks are intended for residential houses, schools, health units, community shelters, floors, pathways, driveways, parking zones, and low-traffic paving.', 'Applications', 8, TRUE),
    ('How can customers request product information or samples?', 'Homeowners, contractors, engineers, and NGOs can submit a project inquiry through the Contact & Inquiry form on this website to request updates, technical trial results, or future supply discussions.', 'Inquiries', 9, TRUE)
) AS v(question, answer, category, sort_order, is_published)
WHERE NOT EXISTS (SELECT 1 FROM faqs);

INSERT INTO news_articles (title, slug, category, summary, content, published_at, is_published)
VALUES
  (
    'PAIDAR Micro Grant Proposal Submitted for Mithi Solar CEB Plant',
    'paidar-micro-grant-proposal-mithi-plant',
    'Business Update',
    'Project Lead Ganpat Meghwar submitted the Lime Stone (Eco-Earth Block) proposal under the PAIDAR Micro Grant (4th cycle) to TRDP for Mithi’s first solar-powered CSEB facility.',
    'The proposed Mithi facility targets a planned capacity of 30,000 interlocking blocks per month using an ST-H201 semi-automatic hydraulic press powered by a 5–8 kW solar array, creating local jobs for approximately five workers.',
    '2026-11-18',
    TRUE
  ),
  (
    'Pre-Production Laboratory Trial Planned at TIEST, Tharparkar',
    'tiest-laboratory-trial-planned',
    'Laboratory Testing',
    'Comparative 14-day and 28-day strength and water absorption tests are scheduled at Thar Institute of Engineering Science and Technology before production begins.',
    'TIEST trials will evaluate cement-only and ~8% lime-cement blends against local red brick benchmarks on dry compressive strength, soaked wet strength, water absorption, and block unit cost. Published specifications will be updated once verified lab reports are received.',
    '2026-11-18',
    TRUE
  )
ON CONFLICT (slug) DO NOTHING;

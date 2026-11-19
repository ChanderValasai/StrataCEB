import type { PublicSiteBundle } from '../types/limestone';

export const SEO_DEFAULTS = {
  siteName: 'Lime Stone (Eco-Earth Block)',
  title: 'Lime Stone — Eco-Earth Block (Mithi, Tharparkar)',
  storyTitle: 'Building a Greener Future in the Desert | Eco-Earth Story',
  adminTitle: 'Admin Console | Lime Stone (Eco-Earth Block)',
  description:
    'Solar-powered interlocking Compressed Stabilized Earth Blocks (CSEB) in Mithi, Tharparkar, Sindh. Request wall & paving eco-block specs and project inquiries.',
  storyDescription:
    'How Ganpat Meghwar founded Eco-Earth in Tharparkar to engineer solar-powered, salt-resistant interlocking earth blocks from local desert sand and clay.',
  keywords:
    'Lime Stone, Eco-Earth Block, CSEB Mithi, Compressed Stabilized Earth Blocks Pakistan, Interlocking Earth Blocks Tharparkar, Interlocking Paving Blocks Sindh, Solar CSEB Plant, Low Carbon Masonry Pakistan, ST-H201 Hydraulic Press, TIEST Tharparkar',
  heroImagePath: '/assets/aistudio/SMB-1024x536_225f679f.webp',
  heroImageAlt:
    'Lime Stone interlocking Compressed Stabilized Earth Block wall assembly in Mithi, Tharparkar',
  founderImagePath: '/assets/aistudio/ganpatProfile_a980c522.jpg',
  conceptNotePath: '/assets/aistudio/Lime_Stone_Concept_Note_1fb85817.pdf',
};

export function toAbsoluteUrl(baseUrl: string, pathOrUrl: string): string {
  const trimmedBase = baseUrl.replace(/\/+$/, '');
  if (!pathOrUrl) {
    return trimmedBase;
  }
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }
  const normalizedPath = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${trimmedBase}${normalizedPath}`;
}

export function buildSeoMetadata(baseUrl: string, pathname: string, bundle?: PublicSiteBundle | null) {
  const isAdmin = pathname.startsWith('/admin');
  const isStory = pathname.startsWith('/story');
  const cleanOrigin = baseUrl.replace(/\/+$/, '');
  const canonicalUrl = `${cleanOrigin}${pathname === '/' ? '/' : pathname.replace(/\/+$/, '')}`;
  const settings = bundle?.settings ?? null;

  const companyName = settings?.companyName || SEO_DEFAULTS.siteName;
  const rawDescription = isAdmin
    ? 'Authorized management console for Lime Stone (Eco-Earth Block) inquiries, products, TIEST laboratory reports, and content.'
    : isStory
      ? SEO_DEFAULTS.storyDescription
      : settings?.tagline
        ? `${settings.tagline.replace(/\.+$/, '')}. Made in Mithi, Tharparkar, Sindh — wall & paving CSEBs.`
        : SEO_DEFAULTS.description;

  let trimmedDescription = rawDescription;
  if (trimmedDescription.length > 160) {
    const sliced = trimmedDescription.slice(0, 157);
    const lastSpace = sliced.lastIndexOf(' ');
    trimmedDescription = `${(lastSpace > 100 ? sliced.slice(0, lastSpace) : sliced).trimEnd()}...`;
  }

  return {
    isAdmin,
    isStory,
    ogType: isStory ? 'article' : 'website',
    title: isAdmin
      ? SEO_DEFAULTS.adminTitle
      : isStory
        ? SEO_DEFAULTS.storyTitle
        : SEO_DEFAULTS.title,
    description: trimmedDescription,
    siteName: companyName,
    canonicalUrl,
    robots: isAdmin
      ? 'noindex, nofollow'
      : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    ogImage: toAbsoluteUrl(
      cleanOrigin,
      isStory ? SEO_DEFAULTS.founderImagePath : SEO_DEFAULTS.heroImagePath
    ),
    ogImageAlt: isStory
      ? 'Ganpat Meghwar — Founder of Eco-Earth & Lime Stone in Mithi, Tharparkar'
      : SEO_DEFAULTS.heroImageAlt,
    keywords: SEO_DEFAULTS.keywords,
  };
}

export function buildJsonLdGraph(baseUrl: string, bundle?: PublicSiteBundle | null) {
  const cleanOrigin = baseUrl.replace(/\/+$/, '');
  const settings = bundle?.settings ?? null;
  const companyName = settings?.companyName || SEO_DEFAULTS.siteName;
  const projectLead = settings?.projectLead || 'Ganpat Meghwar';
  const heroImageUrl = toAbsoluteUrl(cleanOrigin, SEO_DEFAULTS.heroImagePath);

  const orgId = `${cleanOrigin}/#organization`;
  const websiteId = `${cleanOrigin}/#website`;
  const webpageId = `${cleanOrigin}/#webpage`;

  const contactEmail =
    settings?.contactEmail && !settings.contactEmail.includes('.example')
      ? settings.contactEmail
      : 'raiganpat401@gmail.com';
  const contactPhone =
    settings?.contactPhone && !settings.contactPhone.toLowerCase().includes('pending')
      ? settings.contactPhone
      : '+923212472380';

  const organizationNode: Record<string, unknown> = {
    '@type': ['Organization', 'LocalBusiness'],
    '@id': orgId,
    name: companyName,
    alternateName: ['Lime Stone', 'Eco-Earth Block', 'Lime Stone CSEB Mithi'],
    url: `${cleanOrigin}/`,
    image: heroImageUrl,
    logo: toAbsoluteUrl(cleanOrigin, '/favicon.svg'),
    description:
      'Solar-powered manufacturer of interlocking Compressed Stabilized Earth Blocks (CSEBs) in Mithi, Tharparkar, Sindh using local white clay, desert sand, crushed stone, and lime-cement stabilization.',
    founder: {
      '@type': 'Person',
      name: projectLead,
      image: toAbsoluteUrl(cleanOrigin, SEO_DEFAULTS.founderImagePath),
      email: contactEmail,
      telephone: contactPhone,
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Mithi',
      addressRegion: 'Tharparkar, Sindh',
      addressCountry: 'PK',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 24.737,
      longitude: 69.7967,
    },
    areaServed: [
      { '@type': 'City', name: 'Mithi' },
      { '@type': 'AdministrativeArea', name: 'Tharparkar' },
      { '@type': 'AdministrativeArea', name: 'Sindh' },
      { '@type': 'Country', name: 'Pakistan' },
    ],
    knowsAbout: [
      'Compressed Stabilized Earth Blocks (CSEB)',
      'Interlocking Earth Wall Blocks',
      'Interlocking Floor and Road Paving Blocks',
      'Solar-Powered Hydraulic Block Pressing',
      'Low-Carbon Construction Materials',
      'Lime-Cement Soil Stabilization',
    ],
  };

  if (contactEmail) {
    organizationNode.email = contactEmail;
  }
  if (contactPhone) {
    organizationNode.telephone = contactPhone;
  }

  const productNodes = (bundle?.products ?? []).map((product) => ({
    '@type': 'Product',
    '@id': `${cleanOrigin}/#product-${product.slug}`,
    name: product.name,
    description: `${product.summary} ${product.description}`.trim(),
    image: toAbsoluteUrl(cleanOrigin, product.imageUrl),
    category: 'Construction Masonry & Paving Blocks',
    material:
      'Thar white clay, Thar desert sand, 0-5 mm crushed stone, hydrated lime, cement, and salt-screened water',
    brand: {
      '@type': 'Brand',
      name: companyName,
    },
    manufacturer: {
      '@id': orgId,
    },
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Dimensions',
        value: product.dimensions,
      },
      {
        '@type': 'PropertyValue',
        name: 'Stabilizer Specification',
        value: product.binderSpec,
      },
      {
        '@type': 'PropertyValue',
        name: 'Verification Status',
        value: 'Planned TIEST laboratory testing (14 & 28 days)',
      },
    ],
  }));

  const faqEntities = (bundle?.faqs ?? []).map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  }));

  const graph: Record<string, unknown>[] = [
    organizationNode,
    {
      '@type': 'WebSite',
      '@id': websiteId,
      name: companyName,
      url: `${cleanOrigin}/`,
      inLanguage: 'en-PK',
      publisher: { '@id': orgId },
    },
    {
      '@type': 'WebPage',
      '@id': webpageId,
      url: `${cleanOrigin}/`,
      name: SEO_DEFAULTS.title,
      description: SEO_DEFAULTS.description,
      isPartOf: { '@id': websiteId },
      about: { '@id': orgId },
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: heroImageUrl,
        caption: SEO_DEFAULTS.heroImageAlt,
      },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${cleanOrigin}/`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Products',
          item: `${cleanOrigin}/#products`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Manufacturing Process',
          item: `${cleanOrigin}/#process`,
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Quality & TIEST Testing',
          item: `${cleanOrigin}/#quality`,
        },
        {
          '@type': 'ListItem',
          position: 5,
          name: 'Contact & Inquiry',
          item: `${cleanOrigin}/#contact`,
        },
      ],
    },
    ...productNodes,
  ];

  if (faqEntities.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${cleanOrigin}/#faq`,
      mainEntity: faqEntities,
    });
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}

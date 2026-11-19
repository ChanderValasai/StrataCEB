import { useEffect } from 'react';
import { buildJsonLdGraph, buildSeoMetadata } from '../lib/seo';
import type { PublicSiteBundle } from '../types/limestone';

interface SeoHeadProps {
  viewMode: 'public' | 'story' | 'admin';
  siteData: PublicSiteBundle;
}

function upsertMetaTag(
  selectorAttr: 'name' | 'property',
  attrValue: string,
  content: string
) {
  let tag = document.head.querySelector<HTMLMetaElement>(
    `meta[${selectorAttr}="${attrValue}"]`
  );
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(selectorAttr, attrValue);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function upsertCanonicalLink(href: string) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

export function SeoHead({ viewMode, siteData }: SeoHeadProps) {
  useEffect(() => {
    const origin = window.location.origin;
    const pathname =
      viewMode === 'admin'
        ? '/admin'
        : viewMode === 'story'
          ? '/story'
          : window.location.pathname || '/';
    const meta = buildSeoMetadata(origin, pathname, siteData);

    document.title = meta.title;
    upsertMetaTag('name', 'description', meta.description);
    upsertMetaTag('name', 'robots', meta.robots);
    upsertMetaTag('name', 'googlebot', meta.robots);
    upsertMetaTag('name', 'keywords', meta.keywords);
    upsertCanonicalLink(meta.canonicalUrl);

    upsertMetaTag('property', 'og:type', meta.ogType);
    upsertMetaTag('property', 'og:site_name', meta.siteName);
    upsertMetaTag('property', 'og:title', meta.title);
    upsertMetaTag('property', 'og:description', meta.description);
    upsertMetaTag('property', 'og:url', meta.canonicalUrl);
    upsertMetaTag('property', 'og:image', meta.ogImage);
    upsertMetaTag('property', 'og:image:alt', meta.ogImageAlt);

    upsertMetaTag('name', 'twitter:card', 'summary_large_image');
    upsertMetaTag('name', 'twitter:title', meta.title);
    upsertMetaTag('name', 'twitter:description', meta.description);
    upsertMetaTag('name', 'twitter:image', meta.ogImage);
    upsertMetaTag('name', 'twitter:image:alt', meta.ogImageAlt);

    let ldScript = document.getElementById(
      'limestone-jsonld'
    ) as HTMLScriptElement | null;
    if (viewMode === 'admin') {
      if (ldScript) {
        ldScript.remove();
      }
      return;
    }

    if (!ldScript) {
      ldScript = document.createElement('script');
      ldScript.id = 'limestone-jsonld';
      ldScript.type = 'application/ld+json';
      document.head.appendChild(ldScript);
    }
    ldScript.textContent = JSON.stringify(buildJsonLdGraph(origin, siteData));
  }, [viewMode, siteData]);

  return null;
}

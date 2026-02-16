import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, Optional, PLATFORM_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { SeoTags } from './seo-tags';
import { BASE_URL } from './seo.tokens';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private readonly isBrowser: boolean;

  constructor(
    private readonly title: Title,
    private readonly meta: Meta,
    @Inject(DOCUMENT) private readonly document: Document,
    @Inject(PLATFORM_ID) platformId: object,
    @Optional() @Inject(BASE_URL) private readonly baseUrl?: string
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  applyTags(tags: SeoTags): void {
    this.title.setTitle(tags.title);
    this.setMetaTag('name', 'description', tags.description);
    this.setMetaTag('property', 'og:title', tags.ogTitle ?? tags.title);
    this.setMetaTag('property', 'og:description', tags.ogDescription ?? tags.description);
    this.setMetaTag('property', 'og:image', tags.ogImage, true);

    const canonicalUrl = tags.canonicalUrl ?? this.resolveCanonical(tags.canonicalPath);
    this.setCanonical(canonicalUrl);
    if (canonicalUrl) {
      this.setMetaTag('property', 'og:url', canonicalUrl);
    }

    this.setTwitterTags(tags);
    this.logTags(tags, canonicalUrl);
  }

  private setMetaTag(
    attr: 'name' | 'property',
    key: string,
    content?: string,
    removeIfEmpty = false
  ): void {
    if (!content) {
      if (removeIfEmpty) {
        this.meta.removeTag(`${attr}="${key}"`);
      }
      return;
    }
    this.meta.updateTag({ [attr]: key, content });
  }

  setJsonLd(id: string, data: unknown): void {
    const scriptId = `jsonld-${id}`;
    let script = this.document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = this.document.createElement('script');
      script.type = 'application/ld+json';
      script.id = scriptId;
      this.document.head.appendChild(script);
    }
    script.text = JSON.stringify(data);
    this.logJsonLd(id, data);
  }

  clearJsonLd(id: string): void {
    const scriptId = `jsonld-${id}`;
    const script = this.document.getElementById(scriptId);
    if (script?.parentNode) {
      script.parentNode.removeChild(script);
    }
  }

  resolveUrl(path: string): string {
    const base = this.getBaseUrl();
    if (!base) {
      return path;
    }
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${normalizedPath}`;
  }

  private resolveCanonical(path?: string): string | undefined {
    if (!path) {
      return undefined;
    }
    return this.resolveUrl(path);
  }

  private getBaseUrl(): string | undefined {
    if (this.baseUrl) {
      return this.baseUrl;
    }
    if (this.isBrowser) {
      return this.document.location?.origin;
    }
    return undefined;
  }

  private setCanonical(url?: string): void {
    if (!url) {
      return;
    }
    let link = this.document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private setTwitterTags(tags: SeoTags): void {
    const twitterTitle = tags.twitterTitle ?? tags.ogTitle ?? tags.title;
    const twitterDescription = tags.twitterDescription ?? tags.ogDescription ?? tags.description;
    const twitterImage = tags.twitterImage ?? tags.ogImage;
    const twitterCard =
      tags.twitterCard ?? (twitterImage ? 'summary_large_image' : 'summary');

    this.setMetaTag('name', 'twitter:card', twitterCard);
    this.setMetaTag('name', 'twitter:title', twitterTitle);
    this.setMetaTag('name', 'twitter:description', twitterDescription);
    this.setMetaTag('name', 'twitter:image', twitterImage, true);
  }

  private logTags(tags: SeoTags, canonicalUrl?: string): void {
    if (!this.isBrowser || !this.isDebugEnabled()) {
      return;
    }
    const twitterCard =
      tags.twitterCard ?? ((tags.twitterImage ?? tags.ogImage) ? 'summary_large_image' : 'summary');

    const payload = {
      title: tags.title,
      description: tags.description,
      canonical: canonicalUrl,
      ogTitle: tags.ogTitle ?? tags.title,
      ogDescription: tags.ogDescription ?? tags.description,
      ogImage: tags.ogImage,
      ogUrl: canonicalUrl,
      twitterCard,
      twitterTitle: tags.twitterTitle ?? tags.ogTitle ?? tags.title,
      twitterDescription: tags.twitterDescription ?? tags.ogDescription ?? tags.description,
      twitterImage: tags.twitterImage ?? tags.ogImage
    };

    // eslint-disable-next-line no-console
    console.groupCollapsed('[SEO]');
    // eslint-disable-next-line no-console
    console.table(payload);
    // eslint-disable-next-line no-console
    console.groupEnd();
  }

  private logJsonLd(id: string, data: unknown): void {
    if (!this.isBrowser || !this.isDebugEnabled()) {
      return;
    }
    // eslint-disable-next-line no-console
    console.groupCollapsed(`[SEO][JSON-LD] ${id}`);
    // eslint-disable-next-line no-console
    console.log(data);
    // eslint-disable-next-line no-console
    console.groupEnd();
  }

  isDebugEnabled(): boolean {
    if (!this.isBrowser) {
      return false;
    }
    return this.document.defaultView?.localStorage.getItem('seo_debug') === '1';
  }

  setDebugEnabled(enabled: boolean): void {
    if (!this.isBrowser) {
      return;
    }
    const storage = this.document.defaultView?.localStorage;
    if (!storage) {
      return;
    }
    if (enabled) {
      storage.setItem('seo_debug', '1');
    } else {
      storage.removeItem('seo_debug');
    }
  }
}

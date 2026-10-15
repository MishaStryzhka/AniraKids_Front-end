import { useEffect } from 'react';
import { resolveProductSeo, type ProductSeoSource } from './productSeo';

/** Own metadata only while this product route is mounted; restore it on navigation. */
export function useProductSeo(product: ProductSeoSource | null) {
  const seo = product ? resolveProductSeo(product) : null;
  const title = seo?.title ?? 'Produkt | AniraKids';
  const description = seo?.description ?? '';
  const robots = !seo || seo.noIndex ? 'noindex, follow' : 'index, follow';
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;
    const restores = [
      ['name', 'description', description],
      ['name', 'robots', robots],
      ['property', 'og:title', title],
      ['property', 'og:description', description],
      ['name', 'twitter:title', title],
      ['name', 'twitter:description', description],
    ].map(([attribute, key, content]) => {
      const existing = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
      const element = existing ?? document.createElement('meta');
      const previous = element.getAttribute('content');
      element.setAttribute(attribute, key);
      element.setAttribute('content', content);
      if (!existing) document.head.appendChild(element);
      return () => {
        if (!existing) element.remove();
        else if (previous === null) element.removeAttribute('content');
        else element.setAttribute('content', previous);
      };
    });
    return () => { document.title = previousTitle; restores.forEach(restore => restore()); };
  }, [title, description, robots]);
}

import { useLayoutEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useStorefrontOutletContext } from '../../layouts/StorefrontLayout';

export function CanonicalRoutePlaceholder() {
  return null;
}

export function ProductRoutePlaceholder() {
  const { slug } = useParams<{ slug: string }>();
  const { setProductPrimaryCategory } = useStorefrontOutletContext();

  useLayoutEffect(() => {
    // The transitional bridge clears the previous canonical parent before a new product load.
    // No history/location/referrer/legacy-category fallback is allowed.
    setProductPrimaryCategory(null);
    return () => setProductPrimaryCategory(null);
  }, [setProductPrimaryCategory, slug]);

  return null;
}

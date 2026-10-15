import { render } from '@testing-library/react';
import { useProductSeo } from './useProductSeo';
import type { ProductSeoSource } from './productSeo';
function Subject({product}:{product:ProductSeoSource|null}){useProductSeo(product);return null;}
test('updates metadata across products and restores the prior page on leaving',()=>{
  document.title='Původní stránka';
  const meta=document.createElement('meta');meta.name='description';meta.content='Původní popis';document.head.appendChild(meta);
  const {rerender,unmount}=render(<Subject product={{name:'DET31',category:'dress',gender:'girls',description:'Bílé šaty.'}}/>);
  expect(document.title).toBe('Dívčí šaty DET31 | AniraKids');expect(meta.content).toBe('Bílé šaty.');
  expect(document.querySelector('meta[name="robots"]')).toHaveAttribute('content','index, follow');
  rerender(<Subject product={{name:'DAM21',seo:{title:'Vlastní titulek',description:'Vlastní popis',noIndex:true}}}/>);
  expect(document.title).toBe('Vlastní titulek');expect(meta.content).toBe('Vlastní popis');
  expect(document.querySelector('meta[name="robots"]')).toHaveAttribute('content','noindex, follow');
  rerender(<Subject product={null}/>);expect(document.title).toBe('Produkt | AniraKids');expect(meta.content).toBe('');
  unmount();expect(document.title).toBe('Původní stránka');expect(meta.content).toBe('Původní popis');expect(document.querySelector('meta[name="robots"]')).toBeNull();meta.remove();
});

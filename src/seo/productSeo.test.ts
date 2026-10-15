import { resolveProductSeo } from './productSeo';
test('uses classification and code with Czech diacritics and approved description', () => {
  expect(resolveProductSeo({name:'DET31',category:'dress',gender:'girls',description:'  Bílé   šaty.\nNa oslavu. '})).toEqual({title:'Dívčí šaty DET31 | AniraKids',description:'Bílé šaty. Na oslavu.',noIndex:false});
});
test('manual overrides win independently; clearing an override restores current automatic text', () => {
  const product={name:'DAM21',category:'dress',gender:'women',description:'Aktuální popis.'};
  expect(resolveProductSeo({...product,seo:{title:'Vlastní titulek'}})).toMatchObject({title:'Vlastní titulek',description:'Aktuální popis.'});
  expect(resolveProductSeo({...product,seo:{title:' ',description:'Vlastní popis',noIndex:true}})).toEqual({title:'Dámské šaty DAM21 | AniraKids',description:'Vlastní popis',noIndex:true});
});
test('keeps legacy names, limits generated text, removes markup and needs no code before saving', () => {
  const result=resolveProductSeo({name:'Sofie '.repeat(20),description:'<b>Šaty</b> '.repeat(80)});
  expect(result.title.length).toBeLessThanOrEqual(70);expect(result.description.length).toBeLessThanOrEqual(180);expect(result.description).not.toContain('<b>');
  expect(resolveProductSeo({name:'Sofie',category:'dress'}).title).toBe('Sofie | AniraKids');
  expect(resolveProductSeo({category:'suit',gender:'boys'}).title).toBe('Chlapecké obleky | AniraKids');
});

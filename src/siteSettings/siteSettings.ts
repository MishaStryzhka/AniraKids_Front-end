export const sectionLabels={girlsDresses:'Dívčí šaty',womenDresses:'Dámské šaty',suits:'Chlapecké obleky',familyLooks:'Family looky'};
export type SectionKey=keyof typeof sectionLabels;
export type SiteSections=Record<SectionKey,boolean>;
export const filterLabels={category:'Kategorie',gender:'Pro koho',price:'Cena',rentalMode:'Způsob pronájmu',color:'Barva',size:'Velikost'};
export type FilterKey=keyof typeof filterLabels;
export type CatalogueFilters=Record<SectionKey,FilterKey[]>;
export interface SiteSettings {sections:SiteSections;filters:CatalogueFilters;}
export const defaultSiteSections:SiteSections={girlsDresses:true,womenDresses:true,suits:true,familyLooks:false};
export const defaultCatalogueFilters:CatalogueFilters={girlsDresses:['price','rentalMode','color','size'],womenDresses:['price','rentalMode','color','size'],suits:['gender','price','rentalMode','color','size'],familyLooks:['category','gender','price','rentalMode','color','size']};
export function parseSiteSettings(value:unknown):SiteSettings{
 const data=value as Partial<SiteSettings>|null,sections=data?.sections;
 if(!sections||typeof sections.suits!=='boolean'||typeof sections.familyLooks!=='boolean')throw new Error('Invalid site settings response');
 const result:SiteSettings={sections:{...defaultSiteSections},filters:{...defaultCatalogueFilters}};
 for(const key of Object.keys(sectionLabels) as SectionKey[]){
  if(sections[key]!==undefined){if(typeof sections[key]!=='boolean')throw new Error('Invalid section');result.sections[key]=sections[key];}
  const filters=data?.filters?.[key];
  if(filters!==undefined){if(!Array.isArray(filters)||filters.some(f=>!defaultCatalogueFilters[key].includes(f)))throw new Error('Invalid filters');result.filters[key]=filters;}
 }
 return result;
}
export const parseSiteSections=(value:unknown)=>parseSiteSettings(value).sections;
export async function readPublicSiteSettings(signal:AbortSignal):Promise<SiteSettings>{
 const base=process.env.REACT_APP_V2_API_BASE_URL?.trim().replace(/\/+$/,'');if(!base)throw new Error('Site settings unavailable');
 const response=await fetch(base+'/site-settings',{signal,credentials:'omit',cache:'no-store'});if(!response.ok)throw new Error('Site settings unavailable');return parseSiteSettings(await response.json());
}

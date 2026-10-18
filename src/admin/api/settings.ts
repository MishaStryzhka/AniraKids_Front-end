import {adminApiClient, buildAdminRequestConfig} from './client';
import {normalizeAdminApiError} from './errors';
import {parseSiteSettings, type SiteSections, type CatalogueFilters} from '../../siteSettings/siteSettings';
export async function getAdminSettings(token: string, signal?: AbortSignal) {
  try {return parseSiteSettings((await adminApiClient.get('/admin/settings', buildAdminRequestConfig(token, signal))).data);}
  catch(error) {throw normalizeAdminApiError(error);}
}
export async function saveAdminSettings(token: string, patch: {sections?:Partial<SiteSections>;filters?:Partial<CatalogueFilters>}, signal?: AbortSignal) {
  try {return parseSiteSettings((await adminApiClient.patch('/admin/settings', patch, buildAdminRequestConfig(token, signal))).data);}
  catch(error) {throw normalizeAdminApiError(error);}
}

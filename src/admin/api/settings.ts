import {adminApiClient, buildAdminRequestConfig} from './client';
import {normalizeAdminApiError} from './errors';
import {parseSiteSections, type SiteSections} from '../../siteSettings/siteSettings';
export async function getAdminSettings(token: string, signal?: AbortSignal) {
  try {return parseSiteSections((await adminApiClient.get('/admin/settings', buildAdminRequestConfig(token, signal))).data);}
  catch(error) {throw normalizeAdminApiError(error);}
}
export async function saveAdminSettings(token: string, sections: Partial<SiteSections>, signal?: AbortSignal) {
  try {return parseSiteSections((await adminApiClient.patch('/admin/settings', {sections}, buildAdminRequestConfig(token, signal))).data);}
  catch(error) {throw normalizeAdminApiError(error);}
}

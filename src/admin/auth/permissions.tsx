import {createContext,useContext} from 'react';
export const permissionLabels={products:'Produkty a sklad',reservations:'Rezervace a platby',fittings:'Zkoušky a jejich platby',settings:'Nastavení webu a zkoušek',partners:'Správa partnerů'};
export type Permission=keyof typeof permissionLabels;
export interface Access {owner:boolean;permissions:Permission[];}
export const AdminPermissions=createContext<Access>({owner:false,permissions:[]});
export const useAdminPermissions=()=>useContext(AdminPermissions);
export function permissionForPath(path:string):Permission|null{
 if(path.startsWith('/admin/produkty'))return 'products';
 if(path.startsWith('/admin/rezervace')||path==='/admin/kalendar'||path==='/admin')return 'reservations';
 if(path==='/admin/zkousky')return 'fittings';
 if(path==='/admin/nastaveni')return 'settings';
 return null;
}

export function canAccessAdminPath(access:Access,path:string):boolean {
 return access.owner || access.permissions.includes(permissionForPath(path)!) || (path==='/admin/nastaveni' && access.permissions.includes('partners'));
}

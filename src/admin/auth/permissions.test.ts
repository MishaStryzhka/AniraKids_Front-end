import {canAccessAdminPath} from './permissions';
test('partner-only administrator can reach settings without other admin sections',()=>{
 const access={owner:false,permissions:['partners'] as const};
 const value={...access,permissions:[...access.permissions]};
 expect(canAccessAdminPath(value,'/admin/nastaveni')).toBe(true);
 expect(canAccessAdminPath(value,'/admin/produkty')).toBe(false);
 expect(canAccessAdminPath(value,'/admin')).toBe(false);
 expect(canAccessAdminPath({owner:false,permissions:[]},'/admin/nastaveni')).toBe(false);
});

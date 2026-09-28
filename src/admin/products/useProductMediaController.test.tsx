import {act,renderHook,waitFor} from '@testing-library/react';
import {completeProductPhoto,signProductPhoto} from '../api/productMedia';
import {getAdminProductDetail} from '../api/products';
import {uploadProductMedia} from '../media/productMediaProviderTransport';
import {useProductMediaController} from './useProductMediaController';

jest.mock('../api/productMedia',()=>({
  completeProductPhoto:jest.fn(),deleteProductPhoto:jest.fn(),reorderProductPhotos:jest.fn(),
  signProductPhoto:jest.fn(),updateProductPhotoAlt:jest.fn(),
  productMediaCandidate:(u:any)=>u.params.folder+'/'+u.params.public_id,
}));
jest.mock('../api/products',()=>({getAdminProductDetail:jest.fn()}));
jest.mock('../media/productMediaProviderTransport',()=>({
  uploadProductMedia:jest.fn(),
  ProviderUploadError:class ProviderUploadError extends Error{constructor(public outcome:string,message:string){super(message)}},
}));
const sign=signProductPhoto as jest.MockedFunction<typeof signProductPhoto>;
const complete=completeProductPhoto as jest.MockedFunction<typeof completeProductPhoto>;
const provider=uploadProductMedia as jest.MockedFunction<typeof uploadProductMedia>;
const detail=getAdminProductDetail as jest.MockedFunction<typeof getAdminProductDetail>;
const photo=(id:string)=>({publicId:id,url:'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==',alt:id});
const product=(id='p1',photos:any[]=[]):any=>({id,name:'Sofia',slug:'sofia',occasion:[],ageTags:[],rentalEnabled:false,saleEnabled:false,defaultDeposit:0,seo:{noIndex:false},photos,status:'draft',createdAt:'',updatedAt:''});
const descriptor:any={cloudName:'c',apiKey:'k',signature:'s',resourceType:'image',params:{timestamp:1,folder:'products/p1',public_id:'x',overwrite:false,allowed_formats:'jpg'}};
beforeEach(()=>{jest.clearAllMocks();(URL as any).createObjectURL=jest.fn(()=> 'blob:test');(URL as any).revokeObjectURL=jest.fn()});
const setup=(initial:any[]=[])=>renderHook(()=>useProductMediaController({productId:'p1',productName:'Sofia',status:'draft',token:'t',initialPhotos:initial,onAccessError:()=>false}));

test('same-ID COMPLETE retry never signs or uploads twice',async()=>{
 sign.mockResolvedValue({upload:descriptor});provider.mockResolvedValue({publicId:'products/p1/x'});
 complete.mockRejectedValueOnce(new Error('lost response')).mockResolvedValueOnce({product:product('p1',[photo('products/p1/x')])});
 const h=setup();act(()=>h.result.current.selectFile(new File(['x'],'x.jpg',{type:'image/jpeg'})));
 await act(async()=>{await h.result.current.upload()});
 expect(h.result.current.uploadPhase).toBe('provider-confirmed-unattached');
 expect(h.result.current.attempt?.providerPublicId).toBe('products/p1/x');
 await act(async()=>{await h.result.current.recover()});
 expect(sign).toHaveBeenCalledTimes(1);expect(provider).toHaveBeenCalledTimes(1);expect(complete).toHaveBeenCalledTimes(2);
 expect(complete.mock.calls[1][0].publicId).toBe('products/p1/x');
 expect(h.result.current.photos.map(p=>p.publicId)).toEqual(['products/p1/x']);
});

test('failed same-ID recovery remains actionable without automatic re-upload',async()=>{
 sign.mockResolvedValue({upload:descriptor});provider.mockResolvedValue({publicId:'products/p1/x'});complete.mockRejectedValue(new Error('network'));
 const h=setup();act(()=>h.result.current.selectFile(new File(['x'],'x.jpg',{type:'image/jpeg'})));
 await act(async()=>{await h.result.current.upload()});await act(async()=>{await h.result.current.recover()});
 expect(h.result.current.uploadPhase).toBe('provider-confirmed-unattached');expect(h.result.current.attempt?.providerPublicId).toBe('products/p1/x');
 expect(sign).toHaveBeenCalledTimes(1);expect(provider).toHaveBeenCalledTimes(1);
});

test('stale media refresh after unmount cannot apply photos or feedback',async()=>{
 let resolve!:(v:any)=>void;detail.mockReturnValue(new Promise(r=>{resolve=r}));
 const h=setup([photo('a')]);let pending:Promise<void>;act(()=>{pending=h.result.current.refresh()});h.unmount();
 await act(async()=>{resolve({product:product('p1',[photo('b')]),variants:[]});await pending!});
 expect(detail).toHaveBeenCalledTimes(1);
});

test('media-only refresh does not mutate caller-owned core state',async()=>{
 detail.mockResolvedValue({product:product('p1',[photo('b')]),variants:[]});
 const h=setup([photo('a')]);await act(async()=>{await h.result.current.refresh()});
 expect(h.result.current.photos.map(p=>p.publicId)).toEqual(['b']);expect(h.result.current.feedback).toBe('Aktuální fotografie byly načteny.');
});

import {buildProviderUploadUrl,ProviderUploadError,uploadProductMedia} from './productMediaProviderTransport';

const upload={cloudName:'demo cloud',apiKey:'key',signature:'sig',resourceType:'image' as const,params:{timestamp:1,folder:'f',public_id:'p',overwrite:false as const,allowed_formats:'jpg,jpeg,png,webp'}};
const file=new File(['x'],'photo.jpg',{type:'image/jpeg'});
class FakeXHR{
 static last:FakeXHR;upload:any={};withCredentials=true;status=0;responseText='';onload:any;onerror:any;onabort:any;method='';url='';body:any;
 constructor(){FakeXHR.last=this}
 open(method:string,url:string){this.method=method;this.url=url}
 send(body:any){this.body=body}
 abort(){this.onabort?.()}
}
beforeEach(()=>{(global as any).XMLHttpRequest=FakeXHR as any});
test('provider URL derives only from cloudName/resourceType',()=>expect(buildProviderUploadUrl(upload)).toBe('https://api.cloudinary.com/v1_1/demo%20cloud/image/upload'));
test('transport isolates credentials, forwards signed fields and reports real progress',async()=>{
 const progress:(number|null)[]=[];const promise=uploadProductMedia({upload,file,onProgress:v=>progress.push(v)});const xhr=FakeXHR.last;
 expect(xhr.withCredentials).toBe(false);expect(xhr.url).toContain('/image/upload');expect(xhr.body).toBeInstanceOf(FormData);
 expect(xhr.body.get('api_key')).toBe('key');expect(xhr.body.get('signature')).toBe('sig');expect(xhr.body.get('folder')).toBe('f');expect(xhr.body.get('allowed_formats')).toBe('jpg,jpeg,png,webp');
 xhr.upload.onprogress({lengthComputable:true,loaded:5,total:10});xhr.upload.onprogress({lengthComputable:false,loaded:6,total:0});expect(progress).toEqual([50,null]);
 xhr.status=200;xhr.responseText=JSON.stringify({public_id:'f/p'});xhr.onload();await expect(promise).resolves.toEqual({publicId:'f/p'});
});
test.each(['','{}','not-json'])('2xx missing/malformed public_id is unknown: %s',async response=>{
 const promise=uploadProductMedia({upload,file});const xhr=FakeXHR.last;xhr.status=200;xhr.responseText=response;xhr.onload();await expect(promise).rejects.toMatchObject({name:'ProviderUploadError',outcome:'unknown'});
});
test('4xx is known failure while 5xx is unknown',async()=>{
 let promise=uploadProductMedia({upload,file});let xhr=FakeXHR.last;xhr.status=400;xhr.responseText='{}';xhr.onload();await expect(promise).rejects.toMatchObject({outcome:'known-failure'});
 promise=uploadProductMedia({upload,file});xhr=FakeXHR.last;xhr.status=502;xhr.responseText='{}';xhr.onload();await expect(promise).rejects.toMatchObject({outcome:'unknown'});
});

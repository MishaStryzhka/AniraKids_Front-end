import {cropProductPhoto} from './cropProductPhoto';

let draw:jest.Mock;
let dimensions:{width:number;height:number};
beforeEach(() => {
  dimensions = {width:800,height:600};
  const image:any = {get naturalWidth(){return dimensions.width;},get naturalHeight(){return dimensions.height;}};
  Object.defineProperty(image,'src',{set(){Promise.resolve().then(() => image.onload());}});
  jest.spyOn(window,'Image').mockImplementation(() => image);
  draw = jest.fn();
  jest.spyOn(HTMLCanvasElement.prototype,'getContext').mockReturnValue({drawImage:draw} as any);
  jest.spyOn(HTMLCanvasElement.prototype,'toBlob').mockImplementation(function(callback,type){callback(new Blob(['encoded'],{type}));});
});
afterEach(() => jest.restoreAllMocks());

test.each([['image/jpeg','jpg'],['image/png','png'],['image/webp','webp']])('crops the selected source rectangle and preserves %s encoding',async(type,extension) => {
  const result = await cropProductPhoto('blob:source',new File(['original'],`šaty.${extension}`,{type}),{x:40,y:60,width:300,height:400});
  expect(result.name).toBe(`šaty-orez.${extension}`);
  expect(result.type).toBe(type);
  expect(draw).toHaveBeenCalledWith(expect.anything(),40,60,300,400,0,0,300,400);
  expect(HTMLCanvasElement.prototype.toBlob).toHaveBeenCalledWith(expect.any(Function),type,0.95);
});
test('caps the longest side without upscaling or allocating a source-sized canvas',async() => {
  dimensions = {width:6000,height:8000};
  const create = jest.spyOn(document,'createElement');
  await cropProductPhoto('blob:source',new File(['x'],'dress.jpg',{type:'image/jpeg'}),{x:0,y:0,width:6000,height:8000});
  expect(draw).toHaveBeenLastCalledWith(expect.anything(),0,0,6000,8000,0,0,3072,4096);
  expect(create.mock.calls.filter(([tag]) => tag === 'canvas')).toHaveLength(1);
});
test('rejects invalid bounds and a failed encoder without returning a replacement',async() => {
  const file = new File(['x'],'dress.png',{type:'image/png'});
  await expect(cropProductPhoto('blob:x',file,{x:900,y:0,width:10,height:10})).rejects.toThrow('není platný');
  (HTMLCanvasElement.prototype.toBlob as jest.Mock).mockImplementation(callback => callback(null));
  await expect(cropProductPhoto('blob:x',file,{x:0,y:0,width:10,height:10})).rejects.toThrow('nepodařilo zpracovat');
});
test('rejects an encoded result above the existing upload limit',async() => {
  (HTMLCanvasElement.prototype.toBlob as jest.Mock).mockImplementation(callback => callback(new Blob([new Uint8Array(15*1024*1024+1)],{type:'image/png'})));
  await expect(cropProductPhoto('blob:x',new File(['x'],'dress.png',{type:'image/png'}),{x:0,y:0,width:10,height:10})).rejects.toThrow('15 MB');
});

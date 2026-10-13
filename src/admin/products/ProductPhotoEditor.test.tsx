import {act,fireEvent,render,screen,waitFor} from '@testing-library/react';
import {ProductPhotoEditor} from './ProductPhotoEditor';
import {cropProductPhoto} from './cropProductPhoto';

jest.mock('./cropProductPhoto',() => ({...jest.requireActual('./cropProductPhoto'),cropProductPhoto:jest.fn()}));
jest.mock('react-easy-crop',() => function Cropper(props:any) {
  return <img alt={props.mediaProps.alt} onError={props.mediaProps.onError} onLoad={() => {
    props.onMediaLoaded({naturalWidth:600,naturalHeight:400});
    props.onCropAreaChange({}, {x:10,y:20,width:300,height:300});
  }}/>;
});
const encode = cropProductPhoto as jest.MockedFunction<typeof cropProductPhoto>;
const source = new File(['original'],'dress.png',{type:'image/png'});
const result = new File(['cropped'],'dress-orez.png',{type:'image/png'});
let apply:jest.Mock,cancel:jest.Mock;
beforeEach(() => {jest.clearAllMocks();apply=jest.fn();cancel=jest.fn();});
const mount = (open=true) => render(<ProductPhotoEditor open={open} source={source} sourceUrl="blob:source" onApply={apply} onCancel={cancel}/>);
const ready = () => fireEvent.load(screen.getByRole('img'));

test('local save waits for encoding, prevents duplicate application and blocks cancel',async() => {
  let resolve!:(file:File)=>void;
  encode.mockReturnValueOnce(new Promise(done => {resolve=done;}));
  mount();ready();
  fireEvent.click(screen.getByRole('button',{name:'Uložit',exact:true}));
  expect(screen.getByRole('button',{name:'Zrušit'})).toBeDisabled();
  fireEvent.keyDown(document,{key:'Escape'});
  fireEvent.click(screen.getByRole('button',{name:'Ukládání…'}));
  expect(cancel).not.toHaveBeenCalled();expect(apply).not.toHaveBeenCalled();
  expect(encode).toHaveBeenCalledTimes(1);
  await act(async() => resolve(result));
  expect(apply).toHaveBeenCalledWith(result);
});
test('cancel and Escape leave the source untouched',() => {
  mount();ready();
  fireEvent.keyDown(document,{key:'Escape'});
  expect(cancel).toHaveBeenCalledTimes(1);
  expect(encode).not.toHaveBeenCalled();expect(apply).not.toHaveBeenCalled();
});
test('encoding failure stays editable with Czech feedback and can retry',async() => {
  encode.mockRejectedValueOnce(new Error('Native encoder failure')).mockResolvedValueOnce(result);
  mount();ready();fireEvent.click(screen.getByRole('button',{name:'Uložit',exact:true}));
  expect(await screen.findByRole('alert')).toHaveTextContent('Fotografii se nepodařilo zpracovat.');
  expect(apply).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button',{name:'Uložit',exact:true}));
  await waitFor(() => expect(apply).toHaveBeenCalledWith(result));
});
test('late encoding after unmount cannot replace another product photo',async() => {
  let resolve!:(file:File)=>void;
  encode.mockReturnValueOnce(new Promise(done => {resolve=done;}));
  const view=mount();ready();fireEvent.click(screen.getByRole('button',{name:'Uložit',exact:true}));
  view.unmount();await act(async() => resolve(result));
  expect(apply).not.toHaveBeenCalled();
});
test('unreadable images cannot be saved',() => {
  mount();fireEvent.error(screen.getByRole('img'));
  expect(screen.getByRole('alert')).toHaveTextContent('Fotografii nelze načíst.');
  expect(screen.getByRole('button',{name:'Uložit',exact:true})).toBeDisabled();
});

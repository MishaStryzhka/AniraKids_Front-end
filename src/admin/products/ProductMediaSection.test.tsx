import {render,screen,waitFor,within} from '@testing-library/react';
import {ProductMediaSection} from './ProductMediaSection';
import {useProductMediaController} from './useProductMediaController';
jest.mock('./useProductMediaController',()=>({useProductMediaController:jest.fn()}));
const hook=useProductMediaController as jest.Mock;
const base:any={getActivationGuardSnapshot:()=>({pendingMutation:false}),clearFeedback:jest.fn(),photos:[{publicId:'a',url:'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==',alt:'A'}],guard:'available',drafts:{altById:{},orderIds:['a']},setDrafts:jest.fn(),operation:null,feedback:null,refreshReason:null,lostAltNotice:null,uploadPhase:'idle',progress:null,attempt:null,editingAlt:null,orderDirty:false,risk:false,selectFile:jest.fn(),discardUpload:jest.fn(),upload:jest.fn(),recover:jest.fn(),startAlt:jest.fn(),cancelAlt:jest.fn(),saveAlt:jest.fn(),move:jest.fn(),cancelOrder:jest.fn(),saveOrder:jest.fn(),remove:jest.fn().mockResolvedValue(true),refresh:jest.fn()};
const props:any={productId:'p1',productName:'Sofia',status:'draft',token:'t',initialPhotos:base.photos};
const renderPhase=(phase:string,feedback:string|null=null)=>{hook.mockReturnValue({...base,uploadPhase:phase,feedback,attempt:{attemptId:1,productId:'p1',file:new File(['x'],'x.jpg'),filename:'x.jpg',previewUrl:'blob:x',candidate:'products/p1/x',providerPublicId:'products/p1/x'}});return render(<ProductMediaSection {...props}/>)};
beforeEach(()=>jest.clearAllMocks());

test.each([
 ['selected','Fotografie je připravena k nahrání.'],
 ['signing','Připravujeme bezpečné nahrání fotografie…'],
 ['uploading','Fotografie se nahrává…'],
 ['completing','Ověřujeme připojení fotografie k produktu…'],
 ['provider-confirmed-unattached','Připojení fotografie není potvrzené'],
 ['identity-mismatch','Nahraná fotografie neodpovídá podepsanému identifikátoru. Připojení je zablokované.'],
])('phase %s renders truthful copy',(phase,copy)=>{renderPhase(phase);expect(screen.getAllByText(copy).length).toBeGreaterThan(0)});

test('confirmed attachment uncertainty exposes only same-ID retry',()=>{renderPhase('provider-confirmed-unattached','Fotografie byla nahrána, ale její připojení k produktu se nepodařilo potvrdit.');expect(screen.getByRole('button',{name:'Zkusit připojit znovu'})).toBeEnabled();expect(screen.queryByRole('button',{name:'Ověřit a připojit'})).not.toBeInTheDocument()});
test('unknown state exposes one recovery action',()=>{renderPhase('unknown');expect(screen.getByRole('button',{name:'Ověřit a připojit'})).toBeEnabled();expect(screen.queryByRole('button',{name:'Zkusit ověřit znovu'})).not.toBeInTheDocument()});
test('main photo has highlighted position and refresh is state-driven',()=>{hook.mockReturnValue({...base,refreshReason:'photo-missing',feedback:'Fotografie už u produktu není.'});render(<ProductMediaSection {...props}/>);expect(screen.getByRole('listitem',{name:'Hlavní fotografie'})).toHaveAttribute('data-main', 'true');expect(screen.getByRole('button',{name:'Načíst aktuální fotografie'})).toBeEnabled()});


test('photo tile exposes exactly three controls, keeps ALT metadata and never opens ALT editor', () => {
  hook.mockReturnValue({...base});
  render(<ProductMediaSection {...props}/>);
  const item=screen.getByRole('listitem',{name:'Hlavní fotografie'});
  expect(within(item).getAllByRole('button')).toHaveLength(3);
  expect(within(item).getByRole('img',{name:'A'})).toHaveAttribute('alt','A');
  expect(within(item).getByRole('button',{name:'Odebrat fotografii'})).toBeEnabled();
  expect(within(item).getByRole('button',{name:'Posunout dříve'})).toBeDisabled();
  expect(within(item).getByRole('button',{name:'Posunout později'})).toBeDisabled();
  expect(screen.queryByRole('button',{name:'Upravit ALT'})).not.toBeInTheDocument();
  expect(screen.queryByLabelText('Alternativní text')).not.toBeInTheDocument();
  expect(base.startAlt).not.toHaveBeenCalled();
});

test('reports pending media risk only for active/unresolved phases',async()=>{
  const pending=jest.fn();
  hook.mockReturnValue({...base,operation:null,uploadPhase:'selected'});
  const view=render(<ProductMediaSection {...props} onPendingRiskChange={pending}/>);
  await waitFor(()=>expect(pending).toHaveBeenLastCalledWith(false));
  hook.mockReturnValue({...base,operation:'alt',uploadPhase:'idle'});
  view.rerender(<ProductMediaSection {...props} onPendingRiskChange={pending}/>);
  await waitFor(()=>expect(pending).toHaveBeenLastCalledWith(true));
  hook.mockReturnValue({...base,operation:null,uploadPhase:'unknown'});
  view.rerender(<ProductMediaSection {...props} onPendingRiskChange={pending}/>);
  await waitFor(()=>expect(pending).toHaveBeenLastCalledWith(true));
});

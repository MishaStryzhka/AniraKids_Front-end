jest.mock('axios',()=>({create:()=>({interceptors:{request:{use:jest.fn()},response:{use:jest.fn()}}}),isAxiosError:()=>false}));
jest.mock('../admin/api/client',()=>({adminApiClient:{},buildAdminRequestConfig:jest.fn()}));
import {render,screen,fireEvent} from '@testing-library/react';
import {CompleteFitting,FittingCredit} from './PartnerPage';
const fitting={id:'fit1',revision:4,source:'anirak',rewardPolicyVersion:2};
it('records the actual provider and defaults ANIRAK clients to ANIRAK',()=>{
 const act=jest.fn();render(<CompleteFitting fitting={fitting} busy={false} act={act}/>);
 expect(screen.getByLabelText('Kdo provedl zkoušku')).toHaveValue('anirak');
 fireEvent.change(screen.getByLabelText('Kdo provedl zkoušku'),{target:{value:'partner'}});
 fireEvent.click(screen.getByRole('button',{name:'Označit jako proběhlou'}));
 expect(act).toHaveBeenCalledWith('fittings/fit1',{action:'complete',revision:4,performedBy:'partner'});
});
it('financial association sends a distinct action, never a customer discount',()=>{
 const act=jest.fn();render(<FittingCredit fitting={fitting} busy={false} act={act}/>);
 fireEvent.change(screen.getByLabelText('Číslo rezervace'),{target:{value:' ak-2030-test '}});
 fireEvent.change(screen.getByLabelText('Způsob propojení'),{target:{value:'link-reward'}});
 fireEvent.click(screen.getByRole('button',{name:'Propojit zkoušku'}));
 expect(act).toHaveBeenCalledWith('fittings/fit1',{action:'link-reward',revision:4,reservationNumber:'AK-2030-TEST'});
});

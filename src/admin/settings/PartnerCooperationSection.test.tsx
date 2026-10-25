import {render,screen,fireEvent,waitFor} from '@testing-library/react';
import {PartnerCooperationSection} from './PartnerCooperationSection';
import {partnerApi} from '../../partner/api';
jest.mock('../../hooks/useAuth',()=>({useAuth:()=>({token:'test'})}));
jest.mock('../../siteSettings/SiteSettingsProvider',()=>({useSiteSettings:()=>({reload:jest.fn()})}));
jest.mock('../../partner/api',()=>({partnerApi:jest.fn()}));
const api=partnerApi as jest.Mock;
afterEach(()=>jest.resetAllMocks());
test('activation is explicit and refreshes the server state and fitting address',async()=>{
 api.mockResolvedValueOnce({cooperationActive:false}).mockResolvedValueOnce({ok:true}).mockResolvedValueOnce({cooperationActive:true});
 render(<PartnerCooperationSection/>);
 const button=await screen.findByRole('button',{name:'Aktivovat spolupráci'});
 await waitFor(()=>expect(button).toBeEnabled());
 expect(api).toHaveBeenCalledTimes(1);
 expect(screen.getByText(/Kytlická/)).toBeInTheDocument();
 fireEvent.click(button);
 await screen.findByRole('button',{name:'Deaktivovat spolupráci'});
 expect(api).toHaveBeenNthCalledWith(2,'cooperation','test',{active:true});
 expect(screen.getByText(/Plzeňská/)).toBeInTheDocument();
});
test('failed state read cannot activate cooperation',async()=>{
 api.mockRejectedValue(new Error('offline'));
 render(<PartnerCooperationSection/>);
 await screen.findByRole('alert');
 expect(screen.getByRole('button')).toBeDisabled();
 expect(api).toHaveBeenCalledTimes(1);
});

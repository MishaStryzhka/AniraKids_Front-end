import {fireEvent,render,screen,waitFor} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import {FittingLinkRecovery,parseFittingLink} from './FittingLinkRecovery';
import {fittingApi} from './fittingApi';
jest.mock('./fittingApi',()=>({fittingApi:jest.fn()}));
const api=fittingApi as jest.Mock;
const link='https://anirakids.cz/zkouska/ZK-123456ABCDEF#'+'a'.repeat(64);
beforeEach(()=>api.mockReset());
test('only full fitting links on this site are accepted',()=>{
 expect(parseFittingLink(link)).toEqual({number:'ZK-123456ABCDEF',token:'a'.repeat(64)});
 for(const invalid of [link.replace('anirakids.cz','evil.test'),link.split('#')[0],link.replace('/zkouska/','/rezervace/'),'javascript:alert(1)'])expect(parseFittingLink(invalid)).toBeNull();
});
test('private link is sent only as claim body and cleared on success',async()=>{
 const connected=jest.fn();api.mockResolvedValue({});
 render(<MemoryRouter><FittingLinkRecovery token="session" guestEmailAccess={false} onConnected={connected}/></MemoryRouter>);
 fireEvent.click(screen.getByText('Chybí zkouška vytvořená bez přihlášení?'));
 fireEvent.change(screen.getByLabelText('Soukromý odkaz na zkoušku'),{target:{value:link}});
 fireEvent.click(screen.getByRole('button',{name:'Připojit zkoušku'}));
 expect(await screen.findByRole('status')).toHaveTextContent('Zkouška je připojena');
 expect(api).toHaveBeenCalledWith('/account/fittings/ZK-123456ABCDEF/claim',{method:'POST',token:'session',body:{token:'a'.repeat(64)}});
 expect(connected).toHaveBeenCalledTimes(1);expect(screen.getByLabelText('Soukromý odkaz na zkoušku')).toHaveValue('');
});
test('failed claim is explained without revealing the private token and can be retried',async()=>{
 const connected=jest.fn();api.mockRejectedValue(new Error('private data'));
 render(<MemoryRouter><FittingLinkRecovery token="session" onConnected={connected}/></MemoryRouter>);
 fireEvent.click(screen.getByText('Chybí zkouška vytvořená bez přihlášení?'));
 fireEvent.change(screen.getByLabelText('Soukromý odkaz na zkoušku'),{target:{value:link}});
 fireEvent.click(screen.getByRole('button',{name:'Připojit zkoušku'}));
 expect(await screen.findByRole('alert')).toHaveTextContent('Zkoušku se nepodařilo připojit');
 expect(screen.getByRole('alert')).not.toHaveTextContent('private data');
 await waitFor(()=>expect(screen.getByRole('button',{name:'Připojit zkoušku'})).toBeEnabled());
 expect(connected).not.toHaveBeenCalled();
});

jest.mock('axios',()=>({__esModule:true,default:{isCancel:()=>false},AxiosError:class extends Error{}}));
import {MemoryRouter} from 'react-router-dom';
import {render,screen,fireEvent,within} from '@testing-library/react';
import {AdminHomePage} from './AdminPlaceholders';
import {getAdminOverview} from '../api/overview';
jest.mock('../../hooks/useAuth',()=>({useAuth:()=>({token:'fixture'})}));
const mockAccess=jest.fn(()=>false);
jest.mock('../auth/AdminAccessBoundary',()=>({useAdminAccess:()=>({handleRequestError:mockAccess})}));
jest.mock('../api/client',()=>({}));
jest.mock('../api/overview',()=>({getAdminOverview:jest.fn()}));
const get=getAdminOverview as jest.Mock;
const empty={total:0,items:[]};
const fixture={fittings:{review:empty,pending:empty,today:empty},today:'2026-10-10',loadedAt:'2026-10-10T10:00:00Z',pickups:{total:1,items:[{id:'r1',number:'AK-FIXTURE',name:'Jana',product:'Šaty',startDate:'2026-10-10',endDate:'2026-10-11',status:'confirmed'}]},returns:empty,pending:empty,deposits:empty,unpaid:1,overdue:0,maintenance:0,drafts:0};
beforeEach(()=>jest.clearAllMocks());
test('renders real queues, detail links and reloads without retaining stale counts on failure',async()=>{
 get.mockResolvedValueOnce(fixture);render(<MemoryRouter><AdminHomePage/></MemoryRouter>);
 expect(await screen.findByRole('link',{name:'Otevřít rezervaci AK-FIXTURE'})).toHaveAttribute('href','/admin/rezervace/r1');
 expect(screen.getByText('10. října 2026 – 11. října 2026')).toBeInTheDocument();
 expect(screen.getByText('Žádné evidované kauce k vypořádání.')).toBeInTheDocument();
 get.mockRejectedValueOnce(new Error('private failure'));fireEvent.click(screen.getByRole('button',{name:'Obnovit'}));
 expect(await screen.findByRole('alert')).toHaveTextContent('Přehled se nepodařilo načíst');
 expect(screen.queryByText('AK-FIXTURE')).not.toBeInTheDocument();expect(screen.queryByText('private failure')).not.toBeInTheDocument();
 get.mockResolvedValueOnce(fixture);fireEvent.click(screen.getByRole('button',{name:'Zkusit znovu'}));expect(await screen.findByText('AK-FIXTURE')).toBeInTheDocument();
});

test('switches today queues and reveals deposits without losing real detail links',async()=>{
 const returned={...fixture.pickups.items[0],id:'r2',number:'AK-RETURN',endDate:'2026-10-10'};
 const deposit={...returned,id:'r3',number:'AK-DEPOSIT'};
 get.mockResolvedValue({...fixture,returns:{total:1,items:[returned]},deposits:{total:1,items:[deposit]}});
 render(<MemoryRouter><AdminHomePage/></MemoryRouter>);
 await screen.findByText('AK-FIXTURE');
 fireEvent.click(screen.getByRole('button',{name:'K vrácení 1'}));
 expect(screen.getByRole('button',{name:'K vrácení 1'})).toHaveAttribute('aria-pressed','true');
 expect(screen.getByRole('link',{name:'Otevřít rezervaci AK-RETURN'})).toHaveAttribute('href','/admin/rezervace/r2');
 expect(within(screen.getByText('AK-RETURN').closest('article')!).getByText('10. října 2026')).toBeInTheDocument();
 expect(screen.queryByText('AK-FIXTURE')).not.toBeInTheDocument();
 expect(screen.queryByRole('link',{name:'Otevřít rezervaci AK-DEPOSIT'})).not.toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:'Nevypořádané kauce 1'}));
 expect(screen.getByRole('link',{name:'Otevřít rezervaci AK-DEPOSIT'})).toHaveAttribute('href','/admin/rezervace/r3');
});
test('overdue alert precedes pending reservations and opens returns; empty counts stay compact',async()=>{
 HTMLElement.prototype.scrollIntoView=jest.fn();
 const late={...fixture.pickups.items[0],id:'late',number:'AK-LATE',startDate:'2026-10-08',endDate:'2026-10-09'};
 get.mockResolvedValue({...fixture,overdue:1,returns:{total:1,items:[late]},pending:fixture.pickups});
 render(<MemoryRouter><AdminHomePage/></MemoryRouter>);
 await screen.findByText('Po termínu vrácení: 1');
 fireEvent.click(screen.getByRole('button',{name:'Zobrazit nevyřízená vrácení'}));
 expect(screen.getByRole('button',{name:'K vrácení 1'})).toHaveAttribute('aria-pressed','true');
 expect(screen.getByRole('link',{name:'Otevřít rezervaci AK-LATE'})).toBeInTheDocument();
 expect(screen.queryByText('K vyřízení')).not.toBeInTheDocument();
 expect(screen.getByRole('link',{name:'Rozpracované 0'})).toHaveAttribute('href','/admin/produkty?status=draft');
});

test('future fitting payment review prevents all-clear and links to the exact fitting',async()=>{
 const fitting={id:'aaaaaaaaaaaaaaaaaaaaaaaa',number:'ZK-FITTING',name:'Guest customer',product:'Dětské šaty',date:'2026-10-11',time:'09:00',status:'review'};
 get.mockResolvedValueOnce({...fixture,pickups:empty,unpaid:0,fittings:{review:{total:1,items:[fitting]},pending:empty,today:empty}});
 render(<MemoryRouter><AdminHomePage/></MemoryRouter>);
 expect(await screen.findByText('Platby za zkoušky k ověření: 1')).toBeInTheDocument();
 expect(screen.queryByText('Vše je vyřízeno')).not.toBeInTheDocument();
 expect(screen.getByRole('link',{name:'Otevřít zkoušku ZK-FITTING'})).toHaveAttribute('href','/admin/zkousky/aaaaaaaaaaaaaaaaaaaaaaaa');
 expect(screen.getByText('11. října 2026 · 09:00')).toBeInTheDocument();
 get.mockResolvedValueOnce({...fixture,pickups:empty,unpaid:0});fireEvent.click(screen.getByRole('button',{name:'Obnovit'}));
 expect(await screen.findByText('Vše je vyřízeno')).toBeInTheDocument();
 expect(screen.queryByText('ZK-FITTING')).not.toBeInTheDocument();
});
test('pending fittings and today schedule are visible without claiming payment is received',async()=>{
 const fitting={id:'bbbbbbbbbbbbbbbbbbbbbbbb',number:'ZK-PENDING',name:'Pending guest',product:'Šaty',date:fixture.today,time:'14:00',status:'pending'};
 get.mockResolvedValue({...fixture,unpaid:0,fittings:{review:empty,pending:{total:1,items:[fitting]},today:{total:1,items:[fitting]}}});
 render(<MemoryRouter><AdminHomePage/></MemoryRouter>);
 expect(await screen.findByRole('heading',{name:'Dnešní zkoušky (1)'})).toBeInTheDocument();
 expect(screen.getByText('Zkoušky čekající na platbu: 1')).toBeInTheDocument();
 expect(screen.queryByText('Vše je vyřízeno')).not.toBeInTheDocument();
 expect(within(screen.getByRole('region',{name:'Dnešní zkoušky (1)'})).getByText('Čeká na platbu')).toBeInTheDocument();
});

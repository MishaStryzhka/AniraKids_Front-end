import {MemoryRouter} from 'react-router-dom';
import {render,screen,fireEvent} from '@testing-library/react';
import {HomeContent} from './HomeContent';
import {getCatalogue} from './api/publicApi';
jest.mock('./api/publicApi',()=>({getCatalogue:jest.fn()}));
jest.mock('./CataloguePage',()=>({Grid:({children}:any)=><ul>{children}</ul>,ProductImage:({product}:any)=><img alt={product.name}/>}));
jest.mock('./favorites/FavoriteButton',()=>({FavoriteButton:({name}:any)=><button>{name} oblíbené</button>,FavoritesFeedback:()=>null}));
const get=getCatalogue as jest.Mock;
beforeEach(()=>jest.clearAllMocks());
test('shows real catalogue products and canonical links without marketplace promises',async()=>{
 get.mockResolvedValue({items:[{id:'p1',slug:'fixture-dress',name:'Fixture dress',photos:[]}]});render(<MemoryRouter><HomeContent/></MemoryRouter>);
 expect(await screen.findByRole('link',{name:'Fixture dress Fixture dress'})).toHaveAttribute('href','/produkt/fixture-dress');
 expect(get).toHaveBeenCalledWith({sort:'newest',page:1,limit:3},expect.any(AbortSignal));
 expect(screen.getByRole('link',{name:'Podrobnosti o pronájmu a platbách'})).toHaveAttribute('href','/pronajem#jak-funguje-pronajem');
 expect(screen.queryByText(/Pasivní příjem/)).not.toBeInTheDocument();
});
test('failed catalogue has retry and genuine empty state',async()=>{
 get.mockRejectedValueOnce(new Error('private'));render(<MemoryRouter><HomeContent/></MemoryRouter>);expect(await screen.findByRole('alert')).toHaveTextContent('Nabídku se nepodařilo načíst');
 get.mockResolvedValueOnce({items:[]});fireEvent.click(screen.getByRole('button',{name:'Zkusit znovu'}));expect(await screen.findByText(/Nabídku právě připravujeme/)).toBeInTheDocument();
});

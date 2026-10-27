import {fireEvent,render,screen} from '@testing-library/react';
import {useState} from 'react';
import {FulfillmentChoice} from './FulfillmentChoice';
import {parseFulfillment,pointFromMessage,type Fulfillment} from './fulfillment';
import {initialDraft,reservationBody,newAttempt,parseStored,persistDraft,loadDraft} from './bookingModel';
import {parseReceipt,postReservation} from '../api/publicApi';
import {product,body,receipt} from './bookingFixtures';
const point={id:'B10103',name:'Praha 10',address:'Černokostelecká 2020/20, Praha',zip:'10030'};
const delivery={fulfillmentMethod:'balikovna' as const,balikovnaPoint:point};
beforeAll(()=>{HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};});
function Form(){const [value,setValue]=useState<Fulfillment>({});return <FulfillmentChoice value={value} onChange={setValue}/>;}
test('map loads only after request, ignores untrusted messages, retains selection and clears it for pickup',()=>{
 render(<Form/>);
 expect(screen.queryByTitle('Výběr výdejního místa Balíkovny')).not.toBeInTheDocument();
 fireEvent.click(screen.getByLabelText('Balíkovna'));
 expect(screen.queryByTitle('Výběr výdejního místa Balíkovny')).not.toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:'Vybrat výdejní místo'}));
 const frame=screen.getByTitle('Výběr výdejního místa Balíkovny') as HTMLIFrameElement;
 const data={message:'pickerResult',point:{...point,id:'B10103',type:'BALIKOVNY'}};
 fireEvent(window,new MessageEvent('message',{data,source:frame.contentWindow,origin:'https://evil.test'}));
 expect(screen.queryByText(point.name)).not.toBeInTheDocument();
 fireEvent(window,new MessageEvent('message',{data,source:window,origin:'https://b2c.cpost.cz'}));
 expect(screen.queryByText(point.name)).not.toBeInTheDocument();
 fireEvent(window,new MessageEvent('message',{data,source:frame.contentWindow,origin:'https://b2c.cpost.cz'}));
 expect(screen.getByText(point.name)).toBeInTheDocument();
 expect(screen.queryByTitle('Výběr výdejního místa Balíkovny')).not.toBeInTheDocument();
 fireEvent.click(screen.getByLabelText('Osobní vyzvednutí'));
 expect(screen.queryByText(point.name)).not.toBeInTheDocument();
});
test('delivery persists across retry and draft reload, but is excluded for studio',()=>{
 sessionStorage.clear();
 const draft={...initialDraft(product),...delivery,selection:{...body,rentalMode:'external' as const},contact:{...body.customer,notes:''}};
 const payload=reservationBody(draft);
 expect(payload).toMatchObject(delivery);
 Object.defineProperty(globalThis,'crypto',{value:require('crypto').webcrypto,configurable:true});
 expect(parseStored(JSON.stringify(newAttempt(payload)))).toMatchObject({body:{...delivery,deliveryTariff:'2026-10'}});
 persistDraft(draft);expect(loadDraft()).toMatchObject(delivery);
 expect(reservationBody({...draft,selection:{...draft.selection,rentalMode:'studio'}})).not.toHaveProperty('balikovnaPoint');
 expect(()=>parseFulfillment({...delivery,rentalMode:'studio'})).toThrow();
 expect(()=>parseFulfillment({rentalMode:'external',fulfillmentMethod:'balikovna'})).toThrow();
 expect(pointFromMessage(new MessageEvent('message'),null)).toBeNull();
 expect(parseReceipt({reservation:{...receipt,rentalMode:'external',...delivery}})).toMatchObject(delivery);
 expect(()=>parseReceipt({reservation:{...receipt,rentalMode:'external',...delivery,balikovnaPoint:{...point,id:'456'}}},{...body,rentalMode:'external',...delivery})).toThrow();
});
test('multi-item POST retains delivery and response point',async()=>{
 process.env.REACT_APP_V2_API_BASE_URL='https://public.test/api/v2/';
 const fetchMock=jest.fn().mockResolvedValue({ok:true,status:201,json:async()=>({reservation:{...receipt,rentalMode:'external',...delivery}})});
 global.fetch=fetchMock;
 await postReservation({...body,rentalMode:'external',...delivery,items:[{productId:body.productId,variantId:body.variantId}]},'key');
 expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject(delivery);
});

test('home delivery requires an address and retains it through draft and request',()=>{
 const address={street:'Testovací 12',city:'Praha',zip:'19000',country:'CZ' as const};
 const draft={...initialDraft(product),fulfillmentMethod:'balikovna_address' as const,deliveryAddress:address,selection:{...body,rentalMode:'external' as const}};
 persistDraft(draft);expect(loadDraft()?.deliveryAddress).toEqual(address);
 expect(reservationBody(draft).deliveryAddress).toEqual(address);
 expect(()=>parseFulfillment({...draft,deliveryAddress:{...address,zip:'abc'},rentalMode:'external'})).toThrow();
 const result=parseReceipt({reservation:{...receipt,rentalMode:'external',fulfillmentMethod:'balikovna_address',deliveryAddress:address,shippingPrice:119,subtotal:receipt.subtotal+119,totalDue:receipt.totalDue+119}});
 expect(result.shippingPrice).toBe(119);expect(result.deliveryAddress).toEqual(address);
});

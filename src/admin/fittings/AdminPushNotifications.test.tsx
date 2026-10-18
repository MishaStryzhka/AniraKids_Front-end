import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {AdminPushNotifications} from './AdminPushNotifications';
import {fittingAdmin} from '../../fittings/fittingApi';

jest.mock('../../fittings/fittingApi',()=>({fittingAdmin:jest.fn()}));
const api=fittingAdmin as jest.Mock;
const permission=jest.fn();
const register=jest.fn();
const getRegistration=jest.fn();
const endpoint='https://fcm.googleapis.com/fcm/send/validpushendpoint1234567890';
const pushSubscription={endpoint,unsubscribe:jest.fn().mockResolvedValue(true)};
const subscribe=jest.fn().mockResolvedValue(pushSubscription);
const getSubscription=jest.fn().mockResolvedValue(null);
const publicKey=Buffer.concat([Buffer.from([4]),Buffer.alloc(64,1)]).toString('base64url');

beforeEach(()=>{
  jest.clearAllMocks();
  Object.defineProperty(window,'isSecureContext',{configurable:true,value:true});
  Object.defineProperty(window,'PushManager',{configurable:true,value:function(){}});
  Object.defineProperty(window,'atob',{configurable:true,value:(value:string)=>Buffer.from(value,'base64').toString('binary')});

  Object.defineProperty(window,'Notification',{configurable:true,value:{permission:'default',requestPermission:permission}});
  Object.defineProperty(navigator,'serviceWorker',{configurable:true,value:{getRegistration,register}});
  permission.mockResolvedValue('granted');
  getRegistration.mockResolvedValue(undefined);
  getSubscription.mockResolvedValue(null);
  subscribe.mockResolvedValue(pushSubscription);
  pushSubscription.unsubscribe.mockResolvedValue(true);
  register.mockResolvedValue({pushManager:{getSubscription,subscribe}});
  api.mockImplementation((_token:string,path:string)=>{
    if(path==='/admin/push/config')return Promise.resolve({enabled:true,publicKey});
    return Promise.resolve({ok:true});
  });
});

test('never asks notification permission on mount and subscribes only after user action', async()=>{
  render(<AdminPushNotifications token="t"/>);
  const button=await screen.findByRole('button',{name:'Zapnout upozornění'});
  expect(permission).not.toHaveBeenCalled();
  fireEvent.click(button);
  await waitFor(()=>expect(permission).toHaveBeenCalledTimes(1));
  await waitFor(()=>expect(register).toHaveBeenCalledWith('/admin-push-sw.js'));
  await waitFor(()=>expect(getSubscription).toHaveBeenCalledTimes(1));
  await waitFor(()=>expect(subscribe).toHaveBeenCalledTimes(1));
  await waitFor(()=>expect(api).toHaveBeenCalledWith('t','/admin/push/subscribe',{endpoint}));
  expect(subscribe).toHaveBeenCalledTimes(1);
  expect(await screen.findByRole('button',{name:'Vypnout upozornění'})).toBeEnabled();
});

test('shows configuration pending and never prompts for permission when VAPID is not configured', async()=>{
  api.mockResolvedValueOnce({enabled:false,publicKey:''});
  render(<AdminPushNotifications token="t"/>);
  await screen.findByText(/čekají na aktivaci serveru/);
  expect(screen.queryByRole('button',{name:'Zapnout upozornění'})).not.toBeInTheDocument();
  expect(permission).not.toHaveBeenCalled();
});

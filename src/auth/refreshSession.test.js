import {configureStore} from '@reduxjs/toolkit';
import axios from 'axios';
import {authReducer} from '../redux/auth/slice';
import {logIn, logOut, refreshUser} from '../redux/auth/operations';
jest.mock('axios',()=>({defaults:{headers:{common:{}}},get:jest.fn(),post:jest.fn()}));
const makeStore=(loggedIn=true)=>configureStore({reducer:{auth:authReducer},preloadedState:{auth:{token:'old-token',user:loggedIn?{email:'old@example.test'}:null,isLoggedIn:loggedIn,isRefreshing:false}}});
beforeEach(()=>jest.clearAllMocks());
test.each([0,403,429,500,503])('preserves session on temporary refresh failure %s and supports retry',async status=>{
 const store=makeStore(false);
 axios.get.mockRejectedValueOnce({response:status?{status}:undefined});
 await store.dispatch(refreshUser());
 expect(store.getState().auth).toMatchObject({token:'old-token',isLoggedIn:false,isRefreshing:false,refreshError:{status}});
 axios.get.mockResolvedValueOnce({data:{user:{email:'old@example.test'}}});
 await store.dispatch(refreshUser());
 expect(store.getState().auth).toMatchObject({token:'old-token',isLoggedIn:true,refreshError:null});
});
test('a confirmed 401 clears the session and HTTP header',async()=>{
 const store=makeStore();axios.get.mockRejectedValueOnce({response:{status:401}});
 await store.dispatch(refreshUser());
 expect(store.getState().auth).toMatchObject({token:null,user:null,isLoggedIn:false,isRefreshing:false});
 expect(axios.defaults.headers.common.Authorization).toBe('');
});
test.each(['success','401'])('an old refresh %s cannot overwrite a new login',async result=>{
 const store=makeStore();let resolve,reject;
 axios.get.mockImplementationOnce(()=>new Promise((yes,no)=>{resolve=yes;reject=no;}));
 const request=store.dispatch(refreshUser());
 axios.post.mockResolvedValueOnce({data:{token:'new-token',user:{email:'new@example.test'}}});
 await store.dispatch(logIn({}));
 if(result==='success')resolve({data:{user:{email:'old@example.test'}}});else reject({response:{status:401}});
 await request;
 expect(store.getState().auth).toMatchObject({token:'new-token',user:{email:'new@example.test'},isLoggedIn:true,isRefreshing:false});
 expect(axios.defaults.headers.common.Authorization).toBe('Bearer new-token');
});
test('deduplicates refreshes and never restores a logged out session',async()=>{
 const store=makeStore();let resolve;
 axios.get.mockImplementationOnce(()=>new Promise(yes=>{resolve=yes;}));
 const request=store.dispatch(refreshUser());await store.dispatch(refreshUser());expect(axios.get).toHaveBeenCalledTimes(1);
 axios.post.mockResolvedValueOnce({});await store.dispatch(logOut());
 resolve({data:{user:{email:'old@example.test'}}});await request;
 expect(store.getState().auth).toMatchObject({token:null,isLoggedIn:false,user:null});
});

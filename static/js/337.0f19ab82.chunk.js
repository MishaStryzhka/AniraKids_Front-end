"use strict";(self.webpackChunkanira_kids=self.webpackChunkanira_kids||[]).push([[337],{3908:(n,e,t)=>{t.d(e,{Z:()=>s});var r=t(7689),o=t(184);const{BorderBottom:i}=t(4251),s=()=>{const{pathname:n}=(0,r.TH)();return(0,o.jsx)(i,{$mainPage:"/"===n})}},4251:(n,e,t)=>{t.r(e),t.d(e,{BorderBottom:()=>i});var r,o=t(168);const i=t(5867).ZP.div(r||(r=(0,o.Z)(["\n  border-bottom: 1px solid;\n  border-color: ",";\n  /* margin-bottom: 40px; */\n  margin: ",";\n  @media screen and (min-width: 768px) {\n    margin: 0 0 40px 0;\n  }\n  @media screen and (min-width: 1280px) {\n    margin-bottom: 64px;\n  }\n"])),(n=>{let{theme:e}=n;return e.color.mainColor2}),(n=>{let{$mainPage:e}=n;return e?"0 20px 40px 20px":"0 0 40px 0"}))},9157:(n,e,t)=>{t.d(e,{Z:()=>q});var r,o,i,s,a=t(7689),l=t(168),d=t(1087),h=t(5867);h.ZP.div(r||(r=(0,l.Z)(["\n  position: relative;\n"])));const c=h.ZP.div(o||(o=(0,l.Z)(["\n  padding-top: 24px;\n  display: flex;\n  gap: 4px;\n  align-items: center;\n"]))),x=(0,h.ZP)(d.OL)(i||(i=(0,l.Z)(["\n  color: ",";\n  text-align: center;\n\n  font-family: 'Open Sans', sans-serif;\n  font-style: normal;\n  font-weight: 400;\n  font-size: 14px;\n  line-height: 20px; /* 142.857% */\n  text-decoration-line: none;\n  padding: 8px 4px;\n  @media screen and (min-width: 1280px) {\n    padding: 8px 16px;\n  }\n\n  &.active {\n    ","\n  }\n"])),(n=>{let{theme:e}=n;return e.color.mainColor5}),(n=>{let{$notActive:e}=n;return!e&&"font-weight: 700;"})),p=h.ZP.button(s||(s=(0,l.Z)(["\n  display: flex;\n  align-items: center;\n  cursor: pointer;\n  border: none;\n  background: transparent;\n\n  padding: 0 6px;\n  @media screen and (min-width: 1280px) {\n    display: none;\n  }\n"])));var j,m,u,f,g,Z=t(1380),v=t(9230),w=t(1654),k=t(2791),y=t(9521);const P=h.ZP.div(j||(j=(0,l.Z)(["\n  width: 340px;\n  height: 552px;\n  display: flex;\n  padding: 24px;\n  gap: 24px;\n  border-radius: 8px;\n  flex-direction: column;\n  position: absolute;\n  top: 0;\n  left: 0;\n  z-index: 3;\n\n  box-shadow: 0px 6px 8px 2px rgba(17, 17, 17, 0.2);\n  background-color: ",";\n"])),(n=>{let{theme:e}=n;return e.color.mainColor1})),b=h.ZP.div(m||(m=(0,l.Z)(["\n  display: flex;\n  gap: 16px;\n  align-items: center;\n"]))),M=h.ZP.button(u||(u=(0,l.Z)(["\n  width: 40px;\n  height: 40px;\n  border: none;\n  padding: 8px;\n  cursor: pointer;\n  background-color: transparent;\n"]))),C=h.ZP.div(f||(f=(0,l.Z)(["\n  display: block;\n  width: 305px;\n  position: absolute;\n  top: 100px;\n  left: 24px;\n"]))),L=h.ZP.div(g||(g=(0,l.Z)(["\n  margin: 0 auto;\n"])));var A=t(8343),H=t(3794),z=t(3800),F=t(9950),O=t(7097),W=t(1575),$=t(6589),X=t(800),S=t(6853),V=t(7720),T=t(7267),R=t(6874),U=t(4420),B=t(9273),I=t(7560),G=t(184);const _=n=>{let{onClick:e}=n;const{t:t}=(0,v.$G)("translation",{keyPrefix:"pages.userPage"}),r=(0,U.I0)(),{user:o}=(0,V.useAuth)();return(0,G.jsx)(P,{children:(0,G.jsxs)(b,{children:[(0,G.jsx)(L,{children:(0,G.jsx)(y.Z,{})}),(0,G.jsxs)(M,{children:[(0,G.jsx)(A.Z,{onClick:()=>e()}),(0,G.jsxs)(C,{children:[(0,G.jsxs)(H.hX,{to:"./profile",onClick:()=>e(),children:[(0,G.jsx)(z.Z,{}),t("profile")]}),(0,G.jsxs)(H.hX,{to:"./chat",onClick:()=>e(),children:[(0,G.jsx)(F.Z,{})," ",t("chat")]}),(0,G.jsxs)(H.hX,{to:"./favorite",onClick:()=>e(),children:[(0,G.jsx)(O.Z,{}),t("favorite")]}),"owner"===o.typeUser&&(0,G.jsxs)(H.hX,{to:"./rent-out",onClick:()=>e(),children:[(0,G.jsx)(W.Z,{})," ",t("rentOut")]}),(0,G.jsxs)(H.hX,{to:"./rent-in",onClick:()=>e(),children:[(0,G.jsx)($.Z,{}),t("rentIn")]}),(0,G.jsxs)(H.hX,{to:"./my-orders",onClick:()=>e(),children:[(0,G.jsx)(X.Z,{}),t("myPurchases")]}),"owner"===o.typeUser&&(0,G.jsxs)(H.hX,{to:"./my-purchases",onClick:()=>e(),children:[(0,G.jsx)(S.Z,{})," ",t("mySales")]}),(0,G.jsxs)(H.hX,{to:"./wallet",onClick:()=>e(),children:[(0,G.jsx)(T.Z,{})," ",t("wallet")]}),(0,G.jsxs)(H.hX,{to:"./order1",onClick:()=>e(),children:[(0,G.jsx)(R.Z,{})," ",t("basket")]}),(0,G.jsxs)(H.Sn,{type:"button",title:t("logOut"),onClick:()=>r((0,B.logOut)()),children:[(0,G.jsx)(I.Z,{}),t("logOut")]})]})]})]})})},q=()=>{const n=(0,a.TH)(),{t:e}=(0,v.$G)(),{id:t}=(0,a.UO)(),[r,o]=(0,k.useState)(!1);return(0,G.jsxs)(c,{children:[n.pathname.includes("/forWomen")&&(0,G.jsxs)(G.Fragment,{children:[(0,G.jsx)(x,{to:"/",children:e("home")}),(0,G.jsx)(Z.Z,{}),(0,G.jsx)(x,{$notActive:"/forWomen"!==n.pathname,to:"/forWomen",children:e("womenClothing")}),t&&(0,G.jsxs)(G.Fragment,{children:[(0,G.jsx)(Z.Z,{}),(0,G.jsx)(x,{to:"/forWomen/".concat(t),children:e("cardProduct")})]})]}),n.pathname.includes("/forMen")&&(0,G.jsxs)(G.Fragment,{children:[(0,G.jsx)(x,{to:"/",children:e("home")}),(0,G.jsx)(Z.Z,{}),(0,G.jsx)(x,{$notActive:"/forMen"!==n.pathname,to:"/forMen",children:e("menSuits")}),t&&(0,G.jsxs)(G.Fragment,{children:[(0,G.jsx)(Z.Z,{}),(0,G.jsx)(x,{to:"/forMen/".concat(t),children:e("cardProduct")})]})]}),n.pathname.includes("/forChildren")&&(0,G.jsxs)(G.Fragment,{children:[(0,G.jsx)(x,{to:"/",children:e("home")}),(0,G.jsx)(Z.Z,{}),(0,G.jsx)(x,{$notActive:"/forChildren"!==n.pathname,to:"/forChildren",children:e("childrenClothing")}),t&&(0,G.jsxs)(G.Fragment,{children:[(0,G.jsx)(Z.Z,{}),(0,G.jsx)(x,{to:"/forChildren/".concat(t),children:e("cardProduct")})]})]}),n.pathname.includes("/decorAndToys")&&(0,G.jsxs)(G.Fragment,{children:[(0,G.jsx)(x,{to:"/",children:e("home")}),(0,G.jsx)(Z.Z,{}),(0,G.jsx)(x,{$notActive:"/decorAndToys"!==n.pathname,to:"/decorAndToys",children:e("decorAndToys")}),t&&(0,G.jsxs)(G.Fragment,{children:[(0,G.jsx)(Z.Z,{}),(0,G.jsx)(x,{to:"/decorAndToys/".concat(t),children:e("cardProduct")})]})]}),"/aboutUs"===n.pathname&&(0,G.jsxs)(G.Fragment,{children:[(0,G.jsx)(x,{to:"/",children:e("home")}),(0,G.jsx)(Z.Z,{}),(0,G.jsx)(x,{to:"/aboutUs",children:e("aboutUs")})]}),n.pathname.includes("my-account")&&(0,G.jsxs)(G.Fragment,{children:[(0,G.jsx)(p,{type:"button",onClick:()=>{o(!0)},children:(0,G.jsx)(w.Z,{})}),r&&(0,G.jsx)(_,{onClick:()=>{o(!1)}}),(0,G.jsx)(x,{$notActive:!0,to:"/my-account/profile",children:e("account")}),(0,G.jsx)(Z.Z,{}),n.pathname.includes("profile")&&(0,G.jsx)(x,{to:"./profile",children:e("profile")}),n.pathname.includes("chat")&&(0,G.jsx)(x,{to:"./chat",children:e("chat")}),n.pathname.includes("favorite")&&(0,G.jsxs)(G.Fragment,{children:[(0,G.jsx)(x,{$notActive:"/my-account/favorite"!==n.pathname,to:"./favorite",children:e("favorite")}),t&&(0,G.jsxs)(G.Fragment,{children:[(0,G.jsx)(Z.Z,{}),(0,G.jsx)(x,{to:"/my-account/favorite/".concat(t),children:e("cardProduct")})]})]}),n.pathname.includes("rent-out")&&(0,G.jsxs)(G.Fragment,{children:[(0,G.jsx)(x,{$notActive:"/my-account/rent-out"!==n.pathname,to:"./rent-out",children:e("offer")}),"/my-account/rent-out"!==n.pathname&&(0,G.jsx)(Z.Z,{}),n.pathname.includes("add-product")&&(0,G.jsx)(x,{to:"/my-account/rent-out/add-product",children:e("addProduct")}),n.pathname.includes("update-product")&&(0,G.jsx)(x,{to:"/my-account/rent-out/update-product/".concat(t),children:e("edit")})]}),n.pathname.includes("rent-in")&&(0,G.jsx)(x,{to:"./rent-in",children:e("rentIn")}),n.pathname.includes("my-orders")&&(0,G.jsx)(x,{to:"./my-orders",children:e("myOrders")})]})]})}},9316:(n,e,t)=>{t.d(e,{Z:()=>a});var r,o=t(168);const i=t(5867).ZP.h2(r||(r=(0,o.Z)(["\n  text-transform: uppercase;\n\n  margin-top: 24px;\n  font-family: 'Cormorant SC';\n  font-size: 32px;\n  font-weight: 500;\n  line-height: 1.25;\n  text-align: center;\n  margin-bottom: 16px;\n\n  color: ",";\n\n  @media screen and (min-width: 1280px) {\n    font-size: 48px;\n    line-height: 1.17;\n  }\n"])),(n=>{let{theme:e}=n;return e.color.mainColor5}));var s=t(184);const a=n=>{let{children:e}=n;return(0,s.jsx)(s.Fragment,{children:(0,s.jsx)(i,{children:e})})}},800:(n,e,t)=>{t.d(e,{Z:()=>o});t(2791);var r=t(184);const o=n=>(0,r.jsxs)("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",width:24,height:24,...n,children:[(0,r.jsxs)("g",{stroke:"#000",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:1.5,clipPath:"url(#a)",children:[(0,r.jsx)("path",{d:"M6.33 8h11.34a2 2 0 0 1 1.976 2.304l-1.255 8.152A3 3 0 0 1 15.425 21H8.573a3 3 0 0 1-2.965-2.544l-1.255-8.152A2 2 0 0 1 6.33 8Z"}),(0,r.jsx)("path",{d:"M9 11V6a3 3 0 1 1 6 0v5"})]}),(0,r.jsx)("defs",{children:(0,r.jsx)("clipPath",{id:"a",children:(0,r.jsx)("path",{fill:"#fff",d:"M0 0h24v24H0z"})})})]})},7267:(n,e,t)=>{t.d(e,{Z:()=>o});t(2791);var r=t(184);const o=n=>(0,r.jsxs)("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",width:24,height:24,...n,children:[(0,r.jsx)("g",{stroke:"#000",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:1.5,clipPath:"url(#a)",children:(0,r.jsx)("path",{d:"M3 8a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V8ZM3 10h18M7 15h.01M11 15h2"})}),(0,r.jsx)("defs",{children:(0,r.jsx)("clipPath",{id:"a",children:(0,r.jsx)("path",{fill:"#fff",d:"M0 0h24v24H0z"})})})]})},9950:(n,e,t)=>{t.d(e,{Z:()=>o});t(2791);var r=t(184);const o=n=>(0,r.jsxs)("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",width:24,height:24,...n,children:[(0,r.jsx)("g",{stroke:"#000",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:1.5,clipPath:"url(#a)",children:(0,r.jsx)("path",{d:"M8 9h8M8 13h6M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3h-5l-5 3v-3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h12Z"})}),(0,r.jsx)("defs",{children:(0,r.jsx)("clipPath",{id:"a",children:(0,r.jsx)("path",{fill:"#fff",d:"M0 0h24v24H0z"})})})]})},1575:(n,e,t)=>{t.d(e,{Z:()=>o});t(2791);var r=t(184);const o=n=>(0,r.jsxs)("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",width:24,height:24,...n,children:[(0,r.jsx)("path",{fill:"#000",fillRule:"evenodd",d:"M5.765 9a.75.75 0 0 1 .75.75V20H17V9.75a.75.75 0 0 1 1.5 0v11a.75.75 0 0 1-.75.75h-12a.75.75 0 0 1-.735-.898V9.75a.75.75 0 0 1 .75-.75Z",clipRule:"evenodd"}),(0,r.jsx)("path",{stroke:"#000",strokeWidth:1.5,d:"M17.75 18.5h-12"}),(0,r.jsx)("path",{fill:"#000",fillRule:"evenodd",d:"M6.475 4.5a1 1 0 0 0-.707.293L1.28 9.28A.75.75 0 0 1 .22 8.22l5-5A.748.748 0 0 1 5.75 3h2a.75.75 0 0 1 0 1.5H6.475ZM17.75 3h-2a.75.75 0 0 0 0 1.5h1.275a1 1 0 0 1 .707.293L22.22 9.28a.75.75 0 1 0 1.06-1.06l-5-5a.748.748 0 0 0-.53-.22Z",clipRule:"evenodd"}),(0,r.jsx)("path",{fill:"#000",fillRule:"evenodd",d:"M8.2 3.15a.75.75 0 0 0-.9 1.2l3.987 2.99a.745.745 0 0 0 .782.09.745.745 0 0 0 .144-.09L16.2 4.35a.75.75 0 1 0-.9-1.2l-2.95 2.213a1 1 0 0 1-1.2 0L8.2 3.15Z",clipRule:"evenodd"}),(0,r.jsx)("path",{stroke:"#000",strokeLinecap:"round",strokeWidth:1.5,d:"m.75 8.75 3 3M22.75 8.75l-3 3M5.75 9.75l-2 2M17.75 9.75l2 2"})]})},7560:(n,e,t)=>{t.d(e,{Z:()=>o});t(2791);var r=t(184);const o=n=>(0,r.jsxs)("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",width:24,height:24,...n,children:[(0,r.jsxs)("g",{stroke:"#000",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:1.5,clipPath:"url(#a)",children:[(0,r.jsx)("path",{d:"M14 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-2"}),(0,r.jsx)("path",{d:"M9 12h12l-3-3M18 15l3-3"})]}),(0,r.jsx)("defs",{children:(0,r.jsx)("clipPath",{id:"a",children:(0,r.jsx)("path",{fill:"#fff",d:"M0 0h24v24H0z"})})})]})},6589:(n,e,t)=>{t.d(e,{Z:()=>o});t(2791);var r=t(184);const o=n=>(0,r.jsxs)("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",width:24,height:24,...n,children:[(0,r.jsx)("g",{clipPath:"url(#a)",children:(0,r.jsx)("path",{stroke:"#000",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:1.5,d:"M14 6a2 2 0 1 0-4 0c0 1.667.67 3 2 4h-.008m0 0 7.971 4.428a2 2 0 0 1 1.03 1.749V17a2 2 0 0 1-2 2h-14a2 2 0 0 1-2-2v-.823a2 2 0 0 1 1.028-1.749L11.992 10Z"})}),(0,r.jsx)("defs",{children:(0,r.jsx)("clipPath",{id:"a",children:(0,r.jsx)("path",{fill:"#fff",d:"M0 0h24v24H0z"})})})]})},6853:(n,e,t)=>{t.d(e,{Z:()=>o});t(2791);var r=t(184);const o=n=>(0,r.jsxs)("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",width:24,height:24,...n,children:[(0,r.jsxs)("g",{stroke:"#000",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:1.5,clipPath:"url(#a)",children:[(0,r.jsx)("path",{d:"M4 19a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z"}),(0,r.jsx)("path",{d:"M12.5 17H6V3H4"}),(0,r.jsx)("path",{d:"m6 5 14 1-.854 5.977M16.5 13H6M19 22v-6M22 19l-3-3-3 3"})]}),(0,r.jsx)("defs",{children:(0,r.jsx)("clipPath",{id:"a",children:(0,r.jsx)("path",{fill:"#fff",d:"M0 0h24v24H0z"})})})]})},3794:(n,e,t)=>{t.d(e,{Am:()=>x,Sn:()=>m,XM:()=>u,bb:()=>p,hX:()=>j});var r,o,i,s,a,l=t(168),d=t(6874),h=t(1087),c=t(5867);const x=c.ZP.div(r||(r=(0,l.Z)([""]))),p=(0,c.ZP)(h.OL)(o||(o=(0,l.Z)(["\n  box-sizing: border-box;\n  width: 305px;\n  padding: 14px 40px;\n\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  gap: 8px;\n\n  border-radius: 2px;\n  border: 1px solid ",";\n\n  color: ",";\n  text-align: center;\n\n  font-family: Open Sans, sans-serif;\n  font-size: 14px;\n  font-style: normal;\n  font-weight: 700;\n  line-height: 20px; /* 142.857% */\n\n  text-decoration: none;\n"])),(n=>{let{theme:e}=n;return e.color.mainColor3}),(n=>{let{theme:e}=n;return e.color.mainColor3})),j=(0,c.ZP)(h.OL)(i||(i=(0,l.Z)(["\n  padding: 12px 16px;\n  display: flex;\n  align-items: center;\n  gap: 8px;\n\n  text-decoration: none;\n\n  font-family: Open Sans, sans-serif;\n  font-size: 20px;\n  font-style: normal;\n  font-weight: 400;\n  line-height: 28px; /* 140% */\n  letter-spacing: 0.02px;\n\n  color: ",";\n\n  &.active {\n    background-color: ",";\n  }\n"])),(n=>{let{theme:e}=n;return e.color.mainColor5}),(n=>{let{theme:e}=n;return e.color.additionalColorBrown})),m=c.ZP.button(s||(s=(0,l.Z)(["\n  border: none;\n  background-color: transparent;\n\n  width: 100%;\n  padding: 12px 16px;\n\n  display: flex;\n  align-items: center;\n  gap: 8px;\n\n  text-decoration: none;\n\n  font-family: Open Sans, sans-serif;\n  font-size: 20px;\n  font-style: normal;\n  font-weight: 400;\n  line-height: 28px; /* 140% */\n  letter-spacing: 0.02px;\n\n  color: ",";\n\n  cursor: pointer;\n"])),(n=>{let{theme:e}=n;return e.color.mainColor5})),u=(0,c.ZP)(d.Z)(a||(a=(0,l.Z)(["\n  width: 24px;\n  height: 24px;\n  stroke: ",";\n"])),(n=>{let{theme:e}=n;return e.color.mainColor5}))}}]);
//# sourceMappingURL=337.0f19ab82.chunk.js.map
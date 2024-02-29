"use strict";(self.webpackChunkanira_kids=self.webpackChunkanira_kids||[]).push([[110],{6110:(n,e,t)=>{t.r(e),t.d(e,{default:()=>z});var r,o=t(1744),i=t(1617),a=t(2791),l=t(7689),s=t(168),c=t(5867);const d=c.ZP.ul(r||(r=(0,s.Z)(["\n  display: flex;\n  flex-direction: column;\n  gap: 64px;\n  align-items: center;\n  margin-top: 24px;\n\n  @media screen and (min-width: 768px) {\n    width: 630px;\n    margin: 24px auto 0;\n    flex-direction: row;\n    flex-wrap: wrap;\n    gap: 64px 20px;\n  }\n  @media screen and (min-width: 1280px) {\n    width: inherit;\n    margin: 0;\n  }\n"])));var p,x,u,h,m,g,f=t(3934),w=t(9230),b=t(8343);const j=c.ZP.div(p||(p=(0,s.Z)(["\n  width: 388px;\n  display: flex;\n  padding: 16px;\n  gap: 16px;\n  flex-direction: column;\n  align-items: center;\n  position: relative;\n  @media screen and (min-width: 768px) {\n    padding: 24px;\n    gap: 24px;\n    width: 372px;\n  }\n  background-color: ",";\n"])),(n=>{let{theme:e}=n;return e.color.mainColor1})),Z=((0,c.ZP)(b.Z)(x||(x=(0,s.Z)(["\n  position: absolute;\n  top: 16px;\n  right: 16px;\n  cursor: pointer;\n  @media screen and (min-width: 768px) {\n    top: 24px;\n    right: 24px;\n  }\n"]))),c.ZP.h2(u||(u=(0,s.Z)(["\n  text-align: center;\n  font-family: 'Open Sans Hebrew', sans-serif;\n  font-size: 20px;\n  font-weight: 700;\n  line-height: 1.4;\n  letter-spacing: 0.02px;\n\n  color: ",";\n"])),(n=>{let{theme:e}=n;return e.color.mainColor5}))),y=c.ZP.button(h||(h=(0,s.Z)(["\n  padding: 14px 40px;\n  width: 304px;\n  border: none;\n  border-radius: 2px;\n  cursor: pointer;\n\n  text-align: center;\n\n  font-family: 'Open Sans Hebrew', sans-serif;\n  font-size: 14px;\n  font-style: normal;\n  font-weight: 700;\n  line-height: 1.43;\n  text-transform: uppercase;\n\n  color: ",";\n  background-color: ",";\n"])),(n=>{let{theme:e}=n;return e.color.mainColor5}),(n=>{let{theme:e}=n;return e.color.additionalColorGray})),k=c.ZP.button(m||(m=(0,s.Z)(["\n  padding: 14px 40px;\n  width: 304px;\n  border: none;\n  border-radius: 2px;\n  cursor: pointer;\n  margin-top: 16px;\n  text-align: center;\n\n  font-family: 'Open Sans Hebrew', sans-serif;\n  font-size: 14px;\n  font-style: normal;\n  font-weight: 700;\n  line-height: 1.43;\n  text-transform: uppercase;\n\n  color: ",";\n  background-color: ",";\n"])),(n=>{let{theme:e}=n;return e.color.mainColor1}),(n=>{let{theme:e}=n;return e.color.mainColor3})),C=c.ZP.div(g||(g=(0,s.Z)(["\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n"])));var P=t(184);const S=n=>{let{onClick:e,on:t}=n;const{t:r}=(0,w.$G)("translation",{keyPrefix:"components.modalRemoveProduct"});return(0,P.jsxs)(j,{children:[(0,P.jsx)(Z,{onClick:()=>{e()},children:r("titleRemoveProduct")}),(0,P.jsxs)(C,{children:[(0,P.jsx)(y,{children:r("yes")}),(0,P.jsx)(k,{onClick:()=>{e()},children:r("no")})]})]})},v=t(9396),z=()=>{const{id:n}=(0,l.UO)(),[e,t]=(0,a.useState)(1),[r,s]=(0,a.useState)(9),[c,p]=(0,a.useState)(!0),[x,u]=(0,a.useState)(null),[h,m]=(0,a.useState)([]),[g,w]=(0,a.useState)(0),[b,j]=(0,a.useState)(!1);x&&console.log("error",x);const Z=(0,l.s0)();(0,a.useEffect)((()=>{v.getCurrentUserProducts({page:e,pageSize:r}).then((n=>{m(n.products),w(n.totalProducts),p(!1)})).catch((n=>{u(n),p(!1)}))}),[e,r]);const y=async n=>{j(n)},k=n=>{console.log("productId",n),Z("/my-account/rent-out/update-product/".concat(n))};return n?(0,P.jsx)(l.j3,{}):(0,P.jsxs)(P.Fragment,{children:[c?(0,P.jsx)("p",{children:"loading..."}):h.length?(0,P.jsxs)(P.Fragment,{children:[(0,P.jsx)(d,{children:h.map((n=>(0,P.jsx)("li",{children:(0,P.jsx)(i.Z,{product:n,handleRemove:y,handleUpdate:k})},n._id)))}),r*e<g&&(0,P.jsx)("button",{type:"button",title:"next page",onClick:()=>t(e+1),children:"next page"}),r<g&&r*e<g&&(0,P.jsx)("button",{type:"button",title:"next load 9 card",onClick:()=>s(r+9),children:"next 9"})]}):(0,P.jsx)(o.Z,{children:"\u0422\u0443\u0442 \u043f\u043e\u043a\u0438 \u043f\u0443\u0441\u0442\u043e"}),b&&(0,P.jsx)(f.Z,{children:(0,P.jsx)(S,{onClick:()=>j(!1),onTrue:async()=>{await v.removeProductById(b),m(h.filter((n=>n._id!==b)))}})})]})}}}]);
//# sourceMappingURL=110.4dc9492b.chunk.js.map
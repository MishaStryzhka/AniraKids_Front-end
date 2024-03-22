"use strict";(self.webpackChunkanira_kids=self.webpackChunkanira_kids||[]).push([[57],{64623:(n,e,t)=>{t.d(e,{Z:()=>g});t(72791);var r=t(59513),i=t.n(r),o=(t(68639),t(83648)),l=t(30007),a=t(3874),s=t(80271),d=t(60398),c=t(55037),p=t(87059),h=t(39230),x=t(51380),m=t(80184);const u=["January","February","March","April","May","June","July","August","September","October","November","December"],g=n=>{let{rentalPeriods:e,setRentalPeriods:t}=n;const{t:r,i18n:g}=(0,h.$G)("translation",{keyPrefix:"components.calendar"});let f=null,w=null;const y=n=>{const e=n.split(".");return[e[1],e[0],e[2]].join(".")};if(e&&e.includes("-")){const[n,t]=e.split("-");n&&(f=new Date(y(n))),"null"!==t&&(w=new Date(y(t)))}else e&&(f=new Date(y(e)));return(0,m.jsx)(i(),{locale:"en"===g.language?d.Z:"cs"===g.language?c.Z:p.Z,selected:f,onChange:n=>{const[e,r]=n;if(r){const n="".concat((0,l.WU)(new Date(e),"dd.MM.yyyy"),"-").concat(r?(0,l.WU)(new Date(r),"dd.MM.yyyy"):null);t(n)}else{const n="".concat((0,l.WU)(new Date(e),"dd.MM.yyyy"));t(n)}},minDate:new Date,maxDate:(0,o.Z)(new Date,6),startDate:f,endDate:w,selectsRange:!0,inline:!0,dayClassName:n=>{if(f&&w){if(n>=(0,a.E)(f,-2)&&n<=(0,a.E)(f,-1))return"highlight-start-date";if(n>=(0,a.E)(w,1)&&n<=(0,a.E)(w,1))return"highlight-end-date"}if(!w){if(n>=(0,a.E)(f,-2)&&n<=(0,a.E)(f,-1))return"highlight-start-date";if(n>=(0,a.E)(f,1)&&n<=(0,a.E)(f,1))return"highlight-end-date"}return""},renderCustomHeader:n=>{let{date:e,changeYear:t,changeMonth:i,decreaseMonth:o,increaseMonth:l,prevMonthButtonDisabled:a,nextMonthButtonDisabled:d}=n;return(0,m.jsxs)("div",{className:"nav-bar",children:[(0,m.jsx)("button",{className:"togle-month",onClick:o,disabled:a,children:(0,m.jsx)(x.Z,{style:{transform:"rotate(180deg)"},fill:a?"#ccc":"#000"})}),(0,m.jsx)("select",{className:"select",value:u[(0,s.j)(e)],onChange:n=>{let{target:{value:e}}=n;return i(u.indexOf(e))},children:u.map((n=>(0,m.jsx)("option",{className:"option",value:n,children:r(n)},n)))}),(0,m.jsx)("button",{className:"togle-month",onClick:l,disabled:d,children:(0,m.jsx)(x.Z,{fill:d?"#ccc":"#000"})})]})}})}},56501:(n,e,t)=>{t.d(e,{F4:()=>j,Jh:()=>g,S4:()=>y,S8:()=>f,bb:()=>m,mR:()=>w,tq:()=>v,yU:()=>u});var r,i,o,l,a,s,d,c,p,h=t(30168),x=t(65867);const m=x.ZP.div(r||(r=(0,h.Z)(["\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n"]))),u=x.ZP.h2(i||(i=(0,h.Z)(["\n  font-weight: 700;\n  font-size: 20px;\n  line-height: 140%;\n  letter-spacing: 0em;\n  text-align: center;\n  color: ",";\n"])),(n=>{let{theme:e}=n;return e.color.mainColor5})),g=(x.ZP.button(o||(o=(0,h.Z)(["\n  width: 40px;\n  height: 40px;\n\n  border: none;\n  background-color: transparent;\n\n  position: absolute;\n  top: 6px;\n  right: 0;\n\n  display: flex;\n  align-items: center;\n  justify-content: center;\n"]))),x.ZP.ul(l||(l=(0,h.Z)(["\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n"])))),f=x.ZP.li(a||(a=(0,h.Z)(["\n  display: flex;\n  gap: 6px;\n"]))),w=x.ZP.div(s||(s=(0,h.Z)(["\n  width: 20px;\n  height: 20px;\n  background-color: rgb(170, 230, 123);\n  border-radius: 20px;\n"]))),y=x.ZP.div(d||(d=(0,h.Z)(["\n  width: 20px;\n  height: 20px;\n  background-color: #ebdad1;\n  border-radius: 20px;\n"]))),j=x.ZP.div(c||(c=(0,h.Z)(["\n  width: 20px;\n  height: 20px;\n  background-color: red;\n  border-radius: 20px;\n"]))),v=x.ZP.p(p||(p=(0,h.Z)(["\n  text-align: center;\n"])))},17760:(n,e,t)=>{t.d(e,{Z:()=>b});var r,i,o,l,a,s,d,c=t(39230),p=t(30168),h=t(18343),x=t(65867);x.ZP.div(r||(r=(0,p.Z)(["\n  @media screen and (max-width: 427.5px) {\n    width: 90.7vw;\n    padding: 3.7vw;\n  }\n  width: 388px;\n  display: flex;\n  padding: 16px;\n  gap: 16px;\n  flex-direction: column;\n  align-items: center;\n  position: relative;\n  @media screen and (min-width: 768px) {\n    padding: 24px;\n    gap: 24px;\n    width: 372px;\n  }\n  background-color: ",";\n"])),(n=>{let{theme:e}=n;return e.color.mainColor1})),(0,x.ZP)(h.Z)(i||(i=(0,p.Z)(["\n  position: absolute;\n  top: 16px;\n  right: 16px;\n  cursor: pointer;\n  @media screen and (min-width: 768px) {\n    top: 24px;\n    right: 24px;\n  }\n"])));const m=x.ZP.h2(o||(o=(0,p.Z)(["\n  @media screen and (max-width: 427.5px) {\n    font-size: 4.7vw;\n  }\n  text-align: center;\n  font-family: 'Open Sans Hebrew', sans-serif;\n  font-size: 20px;\n  font-weight: 700;\n  line-height: 1.4;\n  letter-spacing: 0.02px;\n\n  color: ",";\n"])),(n=>{let{theme:e}=n;return e.color.mainColor5})),u=x.ZP.p(l||(l=(0,p.Z)(["\n  @media screen and (max-width: 427.5px) {\n    max-width: 46.7vw;\n  }\n  font-family: 'Open Sans Hebrew', sans-serif;\n  font-size: 14px;\n  margin: 12px auto;\n  text-align: center;\n  font-weight: 700;\n  line-height: 1.43;\n  max-width: 200px;\n\n  color: ",";\n"])),(n=>{let{theme:e}=n;return e.color.mainColor5})),g=x.ZP.button(a||(a=(0,p.Z)(["\n  @media screen and (max-width: 427.5px) {\n    width: 71vw;\n    padding: 3.3vw 9.3vw;\n  }\n  padding: 14px 40px;\n  width: 304px;\n  border: none;\n  border-radius: 2px;\n  cursor: pointer;\n\n  text-align: center;\n\n  font-family: 'Open Sans Hebrew', sans-serif;\n  font-size: 14px;\n  font-style: normal;\n  font-weight: 700;\n  line-height: 1.43;\n  text-transform: uppercase;\n\n  color: ",";\n  background-color: ",";\n"])),(n=>{let{theme:e}=n;return e.color.mainColor5}),(n=>{let{theme:e}=n;return e.color.additionalColorGray})),f=x.ZP.button(s||(s=(0,p.Z)(["\n  @media screen and (max-width: 427.5px) {\n    width: 71vw;\n    padding: 3.3vw 9.3vw;\n  }\n  padding: 14px 40px;\n  width: 304px;\n  border: none;\n  border-radius: 2px;\n  cursor: pointer;\n  text-align: center;\n\n  font-family: 'Open Sans Hebrew', sans-serif;\n  font-size: 14px;\n  font-style: normal;\n  font-weight: 700;\n  line-height: 1.43;\n  text-transform: uppercase;\n\n  color: ",";\n  background-color: ",";\n"])),(n=>{let{theme:e}=n;return e.color.mainColor1}),(n=>{let{theme:e}=n;return e.color.mainColor3})),w=x.ZP.div(d||(d=(0,p.Z)(["\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 16px;\n  margin-top: 24px;\n"])));var y=t(83934),j=t(11963),v=t(80184);const b=n=>{let{onCloseModal:e,confirm:t,title:r,onClickDisagree:i,titleButtonDisagree:o,description:l}=n;const{t:a}=(0,c.$G)("translation",{keyPrefix:"components.modalConfirm"});return(0,v.jsx)(y.Z,{onCloseModal:()=>{e()},children:(0,v.jsxs)(j.GeneralModalWindow,{children:[(0,v.jsxs)(m,{children:[r||a("continue"),"?"]}),l&&(0,v.jsx)(u,{children:l}),(0,v.jsxs)(w,{children:[(0,v.jsx)(g,{onClick:()=>{t(),e(),document.body.style.overflow="auto"},children:a("yes")}),(0,v.jsx)(f,{onClick:i?()=>{i(),document.body.style.overflow="auto"}:()=>{e(),document.body.style.overflow="auto"},children:o||a("no")})]})]})})}},66996:(n,e,t)=>{t.r(e),t.d(e,{default:()=>Ln});var r,i,o,l,a,s=t(39230),d=t(30168),c=t(56874),p=t(65867);const h=p.zo.div(r||(r=(0,d.Z)(["\n  display: flex;\n  flex-direction: column;\n  gap: 32px;\n  align-items: center;\n  margin-top: 40px;\n  @media screen and (min-width: 768px) {\n    margin-top: 24px;\n  }\n  @media screen and (min-width: 1280px) {\n    margin-top: 0px;\n  }\n"]))),x=(0,p.zo)(c.Z)(i||(i=(0,d.Z)(["\n  stroke: ",";\n  width: 70px;\n  height: 70px;\n"])),(n=>{let{theme:e}=n;return e.color.mainColor3})),m=p.zo.div(o||(o=(0,d.Z)(["\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  align-items: center;\n"]))),u=p.zo.h3(l||(l=(0,d.Z)(["\n  font-family: 'Open Sans Hebrew', sans-serif;\n\n  font-size: 20px;\n  font-weight: 700;\n  line-height: 1.4;\n\n  color: ",";\n"])),(n=>{let{theme:e}=n;return e.color.btnColorBG})),g=p.zo.p(a||(a=(0,d.Z)(["\n  font-family: 'Open Sans Hebrew', sans-serif;\n  color: #303130;\n  font-size: 14px;\n  font-weight: 400;\n  line-height: 1.43;\n\n  color: ",";\n"])),(n=>{let{theme:e}=n;return e.color.mainColor4}));var f=t(56382),w=t(80184);const y=()=>{const{t:n}=(0,s.$G)("translation",{keyPrefix:"components.emptyCart"});return(0,w.jsxs)(h,{children:[(0,w.jsx)(x,{}),(0,w.jsxs)(m,{children:[(0,w.jsx)(u,{children:n("Your cart is currently empty")}),(0,w.jsx)(g,{children:n("Check out the news")})]}),(0,w.jsx)(f.Z,{children:n("Rent")})]})};var j,v,b,Z,C,P=t(55705);const k=(0,p.ZP)(P.Form)(j||(j=(0,d.Z)(["\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n"]))),S=p.ZP.label(v||(v=(0,d.Z)(["\n  font-family: 'Open Sans Hebrew', sans-serif;\n  font-size: 14px;\n  font-weight: 700;\n  line-height: 1.43;\n\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n\n  color: ",";\n"])),(n=>{let{theme:e}=n;return e.color.mainColor5})),O=(0,p.ZP)(P.Field)(b||(b=(0,d.Z)(["\n  @media screen and (max-width: 427.5px) {\n    width: 86vw;\n  }\n  width: 370px;\n  padding: 8px;\n  border-radius: 2px;\n  outline: none;\n  @media screen and (min-width: 768px) {\n    width: 397px;\n  }\n\n  font-family: 'Open Sans Hebrew', sans-serif;\n  font-size: 14px;\n  font-weight: 400;\n  line-height: 1.43;\n  border: 1px solid;\n\n  color: ",";\n  border-color: ",";\n"])),(n=>{let{theme:e}=n;return e.color.additionalColorBrown}),(n=>{let{theme:e}=n;return e.color.mainColor2})),B=(0,p.ZP)(O)(Z||(Z=(0,d.Z)(["\n  @media screen and (max-width: 427.5px) {\n    min-width: 90.5vw;\n  }\n  min-width: 388px;\n  color: ",";\n  @media screen and (min-width: 768px) {\n    width: 415px;\n  }\n  select {\n    padding: 8px;\n  }\n  option {\n    width: inherit;\n    border-color: ",";\n    color: ",";\n    margin: 8px;\n  }\n  /* option:focus {\n    background-color: ",";\n  } */\n  option:checked {\n    background-color: ",";\n  }\n  option:hover {\n    background-color: ",";\n  }\n"])),(n=>{let{theme:e}=n;return e.color.mainColor5}),(n=>{let{theme:e}=n;return e.color.mainColor4}),(n=>{let{theme:e}=n;return e.color.mainColor4}),(n=>{let{theme:e}=n;return e.color.additionalColorBrown}),(n=>{let{theme:e}=n;return e.color.mainColor1}),(n=>{let{theme:e}=n;return e.color.additionalColorBrown})),N=p.ZP.p(C||(C=(0,d.Z)(["\n  font-family: 'Open Sans Hebrew', sans-serif;\n  line-height: 1.43;\n  font-size: 14px;\n\n  color: ",";\n"])),(n=>{let{theme:e}=n;return e.color.mainColor}));var z=t(15996),D=t(60836),M=t(77720),F=t(83934),H=t(72791),_=t(11963);const E=()=>{const{t:n}=(0,s.$G)("translation",{keyPrefix:"components.formOrder"}),[e,t]=(0,H.useState)(!1);function r(n){"pickerResult"===n.data.message&&(console.log("event.data",n.data),t(!1))}(0,H.useEffect)((()=>(e&&window.addEventListener("message",r),()=>{window.addEventListener("message",r)})),[e]);const{user:i}=(0,M.useAuth)();return(0,w.jsxs)(w.Fragment,{children:[(0,w.jsx)(P.Formik,{initialValues:{fullName:"".concat(i.firstName," ").concat(i.lastName),phoneNumber:i.primaryPhoneNumber,email:i.email,deliveryService:"",deliveryType:"",city:"",address:""},validationSchema:z.validationFormOrderScheme,onSubmit:(n,e)=>{let{resetForm:t}=e;console.log(n),t()},children:e=>{let{values:r,errors:i,touched:o,handleChange:l,handleBlur:a,handleSubmit:s,setFieldValue:d}=e;return(0,w.jsxs)(k,{id:"orderForm",onSubmit:s,children:[(0,w.jsxs)(S,{children:[n("urerFullName"),"*",(0,w.jsx)(O,{name:"fullName",value:r.fullName,type:"text",onChange:l,onBlur:a,placeholder:"\u0411\u043e\u043d\u0434\u0430\u0440\u0435\u043d\u043a\u043e \u0410.\u0410."}),i.fullName&&o.fullName&&(0,w.jsx)(D.B,{children:n(i.fullName)})]}),(0,w.jsxs)(S,{children:[n("userPhoneNumber"),"*",(0,w.jsx)(O,{name:"phoneNumber",value:r.phoneNumber,type:"text",onChange:l,onBlur:a,placeholder:"+380"}),i.phoneNumber&&o.phoneNumber&&(0,w.jsx)(D.B,{children:n(i.phoneNumber)})]}),(0,w.jsxs)(S,{children:[n("email"),"*",(0,w.jsx)(O,{name:"email",value:r.email,type:"text",onChange:l,onBlur:a,placeholder:"example@gmail.com"}),i.email&&o.email&&(0,w.jsx)(D.B,{children:n(i.email)})]}),(0,w.jsxs)(S,{children:[n("Delivery type"),"*",(0,w.jsxs)(B,{as:"select",name:"deliveryType",onChange:n=>d("deliveryType",n.target.value),value:r.deliveryType,children:[(0,w.jsxs)("option",{value:"",children:["--- ",n("Select branch type")," ---"]}),(0,w.jsx)("option",{value:"postOffice",children:n("postOffice")}),(0,w.jsx)("option",{value:"section",children:n("section")})]}),i.deliveryType&&o.deliveryType&&(0,w.jsx)(D.B,{children:n(i.deliveryType)})]}),(0,w.jsxs)(S,{children:[n("Delivery service"),"*",(0,w.jsxs)(B,{as:"select",name:"deliveryService",onChange:n=>{t(!0),l(n)},value:r.deliveryService,children:[(0,w.jsxs)("option",{value:"",children:["--- ",n("Select delivery services")," ---"]}),(0,w.jsx)("option",{value:"Bal\xedkovna",children:"Bal\xedkovna"}),(0,w.jsx)("option",{value:"Zasilkovna",children:"Zasilkovna"}),(0,w.jsx)("option",{value:"PPL",children:"PPL"}),(0,w.jsx)("option",{value:"DHL",children:"DHL"})]}),i.deliveryService&&o.deliveryService&&(0,w.jsx)(D.B,{children:n(i.deliveryService)})]}),(0,w.jsxs)(S,{children:[n("city"),"*",(0,w.jsx)(O,{name:"city",value:r.city,type:"text",onChange:l,onBlur:a,placeholder:""}),i.city&&o.city&&(0,w.jsx)(D.B,{children:n(i.city)})]}),(0,w.jsxs)(S,{children:[n("address"),"*",(0,w.jsx)(O,{name:"address",value:r.address,type:"text",onChange:l,onBlur:a,placeholder:"Sanocka 10/48"}),i.address&&o.address&&(0,w.jsx)(D.B,{children:n(i.address)})]}),(0,w.jsxs)(N,{children:["*",n("Text required")]})]})}}),e&&(0,w.jsx)(F.Z,{onClick:()=>t(!1),children:(0,w.jsx)(_.GeneralModalWindow,{children:(0,w.jsx)("iframe",{width:850,height:700,title:"V\xfdb\u011br m\xedsta pro vyzvednut\xed z\xe1silky",src:"https://b2c.cpost.cz/locations/?type=BALIKOVNY",allow:"geolocation"})})})]})};var q,G,T,R,L,$,I,W,A,J,U,V,Y,Q,K,X,nn,en,tn,rn,on,ln,an,sn,dn=t(70868);const cn=p.ZP.div(q||(q=(0,d.Z)(["\n  position: relative;\n  padding: 12px;\n  border: 1px solid;\n  border-radius: 2px;\n  border-color: ",";\n\n  @media screen and (min-width: 768px) {\n    margin-bottom: 80px;\n  }\n  @media screen and (min-width: 1280px) {\n    margin-bottom: 90px;\n  }\n"])),(n=>{let{theme:e}=n;return e.color.mainColor2})),pn=p.ZP.button(G||(G=(0,d.Z)(["\n  position: absolute;\n  top: 12px;\n  right: 12px;\n\n  cursor: pointer;\n\n  padding: 0;\n  background-color: transparent;\n  border: none;\n  outline: none;\n"]))),hn=p.ZP.h2(T||(T=(0,d.Z)(["\n  display: none;\n  @media screen and (min-width: 768px) {\n    display: block;\n    font-family: 'Open Sans Hebrew', sans-serif;\n    font-size: 20px;\n    font-weight: 700;\n    line-height: 1.4;\n\n    margin-bottom: 32px;\n\n    color: ",";\n  }\n"])),(n=>{let{theme:e}=n;return e.color.mainColor5})),xn=p.ZP.div(R||(R=(0,d.Z)(["\n  display: flex;\n  flex-direction: column;\n  margin-top: 64px;\n  gap: 64px;\n  @media screen and (min-width: 768px) {\n    align-items: center;\n  }\n  @media screen and (min-width: 1280px) {\n    flex-direction: row;\n    align-items: stretch;\n    justify-content: space-between;\n  }\n"]))),mn=p.ZP.div(L||(L=(0,d.Z)(["\n  padding: 8px;\n  display: flex;\n  flex-direction: column;\n  gap: 24px;\n  border: 1px solid;\n  border-radius: 2px;\n  border-color: ",";\n  @media screen and (min-width: 768px) {\n    flex-direction: row;\n    align-items: center;\n  }\n"])),(n=>{let{theme:e}=n;return e.color.mainColor2})),un=p.ZP.div($||($=(0,d.Z)(["\n  width: 150px;\n  height: 150px;\n  border-radius: 2px;\n  overflow: hidden;\n  margin: 0 auto;\n  @media screen and (min-width: 768px) {\n    margin: 0;\n  }\n"]))),gn=p.ZP.img(I||(I=(0,d.Z)(["\n  display: block;\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n"]))),fn=p.ZP.div(W||(W=(0,d.Z)(["\n  position: relative;\n  display: flex;\n  flex-direction: column;\n  gap: 24px;\n  @media screen and (min-width: 768px) {\n    width: 498px;\n    gap: 16px;\n  }\n  @media screen and (min-width: 1280px) {\n    width: 765px;\n    flex-direction: row;\n    justify-content: space-between;\n  }\n"]))),wn=(p.ZP.button(A||(A=(0,d.Z)(["\n  cursor: pointer;\n  background-color: transparent;\n  width: 24px;\n  height: 24px;\n  padding: 0;\n  border: none;\n\n  position: absolute;\n  top: 8px;\n  right: 8px;\n  @media screen and (min-width: 768px) {\n    right: 0;\n  }\n  @media screen and (min-width: 1280px) {\n    top: 0px;\n    right: 350px;\n  }\n"]))),p.ZP.div(J||(J=(0,d.Z)(["\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n  @media screen and (min-width: 768px) {\n    gap: 16px;\n  }\n"])))),yn=p.ZP.p(U||(U=(0,d.Z)(["\n  font-family: 'Open Sans Hebrew', sans-serif;\n  font-size: 14px;\n  font-weight: 700;\n  line-height: 1.43;\n\n  color: ",";\n"])),(n=>{let{theme:e}=n;return e.color.btnColorBG})),jn=(0,p.ZP)(yn)(V||(V=(0,d.Z)(["\n  text-transform: uppercase;\n  color: ",";\n"])),(n=>{let{theme:e}=n;return e.color.mainColor5})),vn=(0,p.ZP)(yn)(Y||(Y=(0,d.Z)(["\n  color: ",";\n"])),(n=>{let{theme:e}=n;return e.color.mainColor2})),bn=(0,p.ZP)(jn)(Q||(Q=(0,d.Z)(["\n  text-transform: none;\n"]))),Zn=p.ZP.div(K||(K=(0,d.Z)(["\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  @media screen and (min-width: 1280px) {\n    width: 308px;\n  }\n"]))),Cn=p.ZP.div(X||(X=(0,d.Z)(["\n  min-width: 60px;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 16px;\n"]))),Pn=p.ZP.div(nn||(nn=(0,d.Z)(["\n  gap: 8px;\n  display: flex;\n  /* justify-content: space-evenly; */\n  align-items: center;\n"]))),kn=p.ZP.button(en||(en=(0,d.Z)(["\n  width: 24px;\n  height: 24px;\n  cursor: pointer;\n  background-color: transparent;\n  border: none;\n  padding: 0;\n"]))),Sn=p.ZP.div(tn||(tn=(0,d.Z)(["\n  width: 16px;\n  border: 1px solid;\n  border-radius: 2px;\n  border-color: ",";\n  margin: 0 auto;\n"])),(n=>{let{theme:e,$disabled:t}=n;return t?e.color.mainColor2:e.color.mainColor5})),On=p.ZP.button(rn||(rn=(0,d.Z)(["\n  cursor: pointer;\n  padding: 8px;\n  width: 40px;\n  height: 40px;\n  border: none;\n  background-color: transparent;\n  @media screen and (min-width: 768px) {\n    width: 24px;\n    height: 24px;\n    padding: 0;\n  }\n"]))),Bn=(0,p.ZP)(dn.Z)(on||(on=(0,d.Z)(["\n  width: 24px;\n  height: 24px;\n  stroke: ",";\n"])),(n=>{let{theme:e}=n;return e.color.mainColor5})),Nn=p.ZP.div(ln||(ln=(0,d.Z)(["\n  @media screen and (max-width: 427.5px) {\n    width: 71vw;\n  }\n  width: 304px;\n  margin: 0 auto;\n  @media screen and (min-width: 1280px) {\n    margin: 0;\n  }\n"]))),zn=p.ZP.p(an||(an=(0,d.Z)(["\n  @media screen and (max-width: 427.5px) {\n    font-size: 5.5vw;\n  }\n  display: flex;\n  justify-content: space-between;\n\n  font-family: 'Open Sans Hebrew', sans-serif;\n  font-size: 20px;\n  font-weight: 400;\n  line-height: 1.4;\n\n  color: ",";\n"])),(n=>{let{theme:e}=n;return e.color.mainColor5})),Dn=p.ZP.div(sn||(sn=(0,d.Z)(["\n  width: 100%;\n  height: 1px;\n  margin: 20px 0 20px;\n  background-color: ",";\n"])),(n=>{let{theme:e}=n;return e.color.mainColor2}));var Mn=t(73721),Fn=t(64623),Hn=t(56501),_n=t(17760);const En=t(29396),qn=n=>{let{order:{_id:e,items:t,owner:r,serviceType:i,rentalPeriods:o},handleRemoveOrder:l}=n;const{t:a}=(0,s.$G)("translation",{keyPrefix:"components.order"}),[d,c]=(0,H.useState)(t),[p,h]=(0,H.useState)(!1),[x,m]=(0,H.useState)(!1);let u;return(0,w.jsxs)(w.Fragment,{children:[(0,w.jsxs)(cn,{children:[(0,w.jsx)(pn,{onClick:()=>{h(!0)},children:(0,w.jsx)(Bn,{})}),(0,w.jsxs)(hn,{children:[a("order processing")," ","( ".concat("rent"===i?"\u043e\u0440\u0435\u043d\u0434\u0438 \u043d\u0430 ".concat(o):"\u043f\u043e\u043a\u0443\u043f\u043a\u0430"," )")]}),(0,w.jsx)("div",{style:{display:"flex",flexDirection:"column",gap:16},children:d.map((n=>(console.log("item",n),(0,w.jsxs)(mn,{children:[(0,w.jsx)(un,{children:(0,w.jsx)(gn,{src:n.product.photos[0].path,alt:"product"})}),(0,w.jsxs)(fn,{children:[(0,w.jsxs)(wn,{children:[(0,w.jsxs)(yn,{children:[a("seller"),": ",null===r||void 0===r?void 0:r.nickname]}),(0,w.jsx)(jn,{children:n.product.name})]}),(0,w.jsxs)(Zn,{children:[(0,w.jsxs)(Cn,{children:[(0,w.jsxs)(vn,{children:[a("price"),":"]}),(0,w.jsxs)(bn,{children:[n.price," k\u010d"]})]}),(0,w.jsxs)(Cn,{style:{alignItems:"center"},children:[(0,w.jsxs)(vn,{children:[a("quantity"),":"]}),(0,w.jsxs)(Pn,{children:[!o&&(0,w.jsx)(kn,{disabled:1===n.quantity,onClick:()=>(n=>{let{_id:e,quantity:t}=n;t>1&&En.setQuantity({productId:e,quantity:t-1}).then((n=>{let{updatedItem:e}=n;c((n=>n.map((n=>n._id===e._id?e:n))))}))})(n),children:(0,w.jsx)(Sn,{$disabled:1===n.quantity})}),(0,w.jsxs)(bn,{children:[n.quantity,o&&" \u0434\u043d\u0456"]}),!o&&(0,w.jsx)(kn,{onClick:()=>(n=>{let{_id:e,quantity:t}=n;En.setQuantity({productId:e,quantity:t+1}).then((n=>{let{updatedItem:e}=n;c((n=>n.map((n=>n._id===e._id?e:n))))}))})(n),children:(0,w.jsx)(Mn.Z,{})})]})]}),(0,w.jsxs)(Cn,{children:[(0,w.jsxs)(vn,{children:[a("amount"),":"]}),(0,w.jsxs)(bn,{children:[u=n.price*n.quantity," k\u010d"]})]}),(0,w.jsx)(On,{onClick:()=>m(n),children:(0,w.jsx)(Bn,{})})]})]})]},n._id))))}),(0,w.jsxs)(xn,{children:[(0,w.jsx)(E,{}),(0,w.jsxs)(Nn,{children:["rent"===i&&(0,w.jsxs)(Hn.bb,{children:[(0,w.jsxs)(Hn.Jh,{children:[(0,w.jsxs)(Hn.S8,{children:[(0,w.jsx)(Hn.mR,{})," ",(0,w.jsx)("p",{children:"\u0434\u043d\u0456 \u0434\u043e\u0441\u0442\u0430\u0432\u043a\u0438"})," ",(0,w.jsx)("br",{})]}),(0,w.jsxs)(Hn.S8,{children:[(0,w.jsx)(Hn.S4,{})," ",(0,w.jsx)("p",{children:"\u043e\u0440\u0435\u043d\u0434\u0430"})," ",(0,w.jsx)("br",{})]}),(0,w.jsxs)(Hn.S8,{children:[(0,w.jsx)(Hn.F4,{}),(0,w.jsx)("p",{children:"\u0434\u0435\u043d\u044c \u043f\u043e\u0432\u0435\u0440\u043d\u0435\u043d\u043d\u044f"})," ",(0,w.jsx)("br",{})]})]}),(0,w.jsx)(Fn.Z,{rentalPeriods:o,setRentalPeriods:n=>{}})]}),(0,w.jsxs)(zn,{children:[a("orderTotal")," ",(0,w.jsxs)("span",{children:[u," k\u010d"]})]}),(0,w.jsx)(Dn,{}),(0,w.jsxs)(zn,{style:{fontWeight:700,marginBottom:"40px"},children:[a("totalAmount"),(0,w.jsxs)("span",{children:[u," k\u010d"]})]}),(0,w.jsx)(f.Z,{form:"orderForm",type:"submit",children:a("Continue")})]})]})]}),p&&(0,w.jsx)(_n.Z,{onCloseModal:()=>h(!1),title:"\u0412\u0438\u0434\u0430\u043b\u0438\u0442\u0438 \u0437\u0430\u043c\u043e\u0432\u043b\u0435\u043d\u043d\u044f".concat(o?" \u043d\u0430 ".concat(o):"","?"),confirm:()=>l()}),x&&(0,w.jsx)(_n.Z,{onCloseModal:()=>m(!1),title:"\u0412\u0438\u0434\u0430\u043b\u0438\u0442\u0438 \u0442\u043e\u0432\u0430\u0440: '".concat(x.product.name,"'"),confirm:()=>{return n=x._id,void(1===d.length?l():En.removeProductFromOrder(e,n).then((e=>c((e=>e.filter((e=>e._id!==n)))))));var n}})]})};var Gn;const Tn=p.ZP.ul(Gn||(Gn=(0,d.Z)([""]))),Rn=t(29396),Ln=()=>{const[n,e]=(0,H.useState)([]),[t,r]=(0,H.useState)([]),[i,o]=(0,H.useState)([]),[l,a]=(0,H.useState)([]);(0,H.useEffect)((()=>{Rn.getOrders().then((n=>{e(n.orders),r(n.totalOrders),o(!1)})).catch((n=>{a(n),o(!1)}))}),[]);return n.length?(0,w.jsx)(Tn,{children:n.map((n=>(0,w.jsx)("li",{children:(0,w.jsx)(qn,{handleRemoveOrder:()=>{return t=n._id,void Rn.removeOrder(t).then((n=>{let{message:r}=n;"Order successfully removed"===r&&e((n=>n.filter((n=>n._id!==t))))}));var t},order:n})},n._id)))}):(0,w.jsx)(y,{})}}}]);
//# sourceMappingURL=57.4591413b.chunk.js.map
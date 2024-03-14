import{y as n,u as C,q as e,as as v,G as I,aM as B,bY as O,I as R,aD as A,at as T,A as E,w as P,t as U,bW as _,eN as S,eO as W,ar as F,ap as H,al as q}from"./main-1e616d6f.js";import{r as p}from"./tiptap-313d156f.js";const D=({bgWhite:r})=>{const{t:i}=C();return e.jsxs(M,{bgWhite:r,children:[e.jsx($,{children:e.jsx(v,{label:i("labels.label")})}),e.jsx($,{children:e.jsx(v,{label:i("labels.link")})}),e.jsx("div",{className:"w-12"})]})},M=n.div.attrs(({bgWhite:r})=>({className:`hidden md:flex p-4 space-x-4 ${r?"bg-neutral-50 border border-neutral-100 rounded-t-xl":"bg-neutral-0"}`}))``,$=n.div.attrs({className:"flex-1"})``,L=new RegExp(_),w=new RegExp(S),z=new RegExp(W),G=({index:r,onDelete:i,arrayName:l="links",bgWhite:h=!1})=>{const{t:a}=C(),{control:u,clearErrors:x,getValues:o,trigger:g,setValue:b}=I(),{errors:j}=B(),c=p.useCallback((s,t)=>{const k=o(t);return k?s===""&&k===""?(x(t),!0):(k===""&&j[t]===void 0&&g(t),!1):!0},[x,j,o,g]),f=p.useCallback((s,t)=>{if(!c(s,`${l}.${t}.url`))return O(s)?a("errors.required.label"):!0},[l,c,a]),m=p.useCallback(s=>{const t=o(s);return L.test(t)||w.test(t)?(L.test(t)&&!z.test(t)&&b(s,`http://${t}`),!0):a("errors.invalidURL")},[o,b,a]),d=p.useCallback((s,t)=>{if(!c(s,`${l}.${t}.label`))return s===""?a("errors.required.link"):L.test(s)||w.test(s)?!0:a("errors.invalidURL")},[l,c,a]);return e.jsxs(Y,{"data-testid":"link-row",bgWhite:h,children:[e.jsx(y,{children:e.jsx(R,{control:u,name:`${l}.${r}.name`,rules:{validate:s=>f(s,r)},render:({field:s,fieldState:{error:t}})=>e.jsxs(e.Fragment,{children:[e.jsx(N,{children:e.jsx(v,{label:a("labels.label")})}),e.jsx(A,{name:s.name,value:s.value,onBlur:s.onBlur,onChange:s.onChange,placeholder:a("placeHolders.addResource"),mode:t?.message?"critical":"default"}),t?.message&&e.jsx(V,{children:e.jsx(T,{message:t.message,variant:"critical"})})]})})}),e.jsx(Q,{children:e.jsx(R,{name:`${l}.${r}.url`,control:u,rules:{validate:s=>d(s,r)},render:({field:s,fieldState:{error:t}})=>e.jsxs(e.Fragment,{children:[e.jsx(N,{children:e.jsx(v,{label:a("labels.link")})}),e.jsx(A,{name:s.name,value:s.value,onBlur:()=>{m(s.name),s.onBlur()},onChange:s.onChange,placeholder:"https://",mode:t?.message?"critical":"default"}),t?.message&&e.jsx(V,{children:e.jsx(T,{message:t.message,variant:"critical"})})]})})}),e.jsx(K,{}),e.jsx(J,{children:e.jsx(E.Container,{align:"end",customTrigger:e.jsx(P,{variant:"tertiary",size:"lg",iconLeft:U.DOTS_VERTICAL,"data-testid":"trigger"}),children:e.jsx(E.Item,{onClick:()=>i?.(r),children:a("labels.removeLink")})})})]})},Y=n.div.attrs(({bgWhite:r})=>({className:`flex flex-wrap gap-x-4 gap-y-3 p-4 ${r?"bg-neutral-50 border border-t-0 border-neutral-100 last:rounded-b-xl":"bg-neutral-0"}`}))``,y=n.div.attrs({className:"flex-1 order-1 h-full"})``,N=n.div.attrs({className:"md:hidden mb-1"})``,J=n.div.attrs({className:"pt-7 order-2 md:order-3 md:pt-0"})``,V=n.div.attrs({className:"mt-1"})``,K=n.hr.attrs({className:"md:hidden w-full border-0 order-3"})``,Q=n.div.attrs({className:"flex-1 order-4 md:order-2 h-full"})``,te=({buttonPlusIcon:r,buttonLabel:i,arrayName:l="links",bgWhite:h=!1})=>{const{t:a}=C(),{control:u}=I(),x=F({name:l,control:u}),{fields:o,append:g,remove:b}=H({name:l,control:u}),{alert:j}=q(),c=o.map((m,d)=>({...m,...x&&{...x[d]}})),f=()=>{g({name:"",url:""})};return e.jsxs(X,{"data-testid":"add-links",children:[o.length>0&&e.jsxs(Z,{children:[e.jsx(D,{bgWhite:h}),c.map((m,d)=>e.jsx(G,{index:d,onDelete:()=>{b(d),j(a("alert.chip.removedLink"))},arrayName:l,bgWhite:h},m.id))]}),e.jsx(P,{variant:"tertiary",size:"lg",onClick:f,...r?{iconLeft:U.PLUS}:{},children:i||a("labels.addLink")})]})},X=n.div.attrs({className:"space-y-3"})``,Z=n.div.attrs({className:"flex flex-col overflow-auto rounded-xl"})``;export{te as A};
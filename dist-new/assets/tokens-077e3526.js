import{u as c,h as p,fk as m,cg as u,q as e,S as T,t as f,v as h}from"./main-1e616d6f.js";import{r as k}from"./tiptap-313d156f.js";import{T as x}from"./index-05d13db1.js";import{P as d}from"./sectionWrappers-aaf62731.js";import{u as g}from"./useDaoVault-83014ea0.js";import"./osx-ethers-780b73f3.js";import"./useTokenMetadata-6398f62d.js";import"./usePollTransfersPrices-f8333826.js";const M=()=>{const{t}=c(),{open:a}=p(),[r,n]=k.useState(""),{tokens:s}=g(),o=m(s,r);u(o,"treasurySharePercentage",!0);const l=i=>{n(i.target.value)};return e.jsx(d,{title:t("allTokens.title"),description:s.length===1?t("allTokens.subtitleSingular"):t("allTokens.subtitle",{count:s.length}),primaryBtnProps:{label:t("TransferModal.newTransfer"),iconLeft:e.jsx(T,{icon:f.PLUS}),onClick:()=>a("transfer")},children:e.jsxs("div",{className:"mt-6 space-y-6 xl:mt-16 xl:space-y-10",children:[e.jsx(h,{placeholder:"Type to filter",value:r,onChange:l}),e.jsx(x,{tokens:o})]})})};export{M as Tokens};
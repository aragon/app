import{a3 as rt,bH as ot,bI as lt,am as dt,u as be,q as t,ao as ct,y as b,f as Ve,e as We,g as Me,G as Ne,ap as Re,aM as Fe,bw as ut,bJ as Be,ar as He,bK as Ee,bL as _e,a1 as ue,bM as mt,ae as Ae,A as T,L as ge,w as pe,t as qe,R as Ge,b9 as Ue,bN as ze,at as Le,as as Oe,I as gt,aJ as Te,k as pt,j as bt}from"./main-1e616d6f.js";import{r as p}from"./tiptap-313d156f.js";import{a as B,a8 as ft,a9 as vt,aa as yt,ab as ht,ac as xt,ad as jt,c as F}from"./osx-ethers-780b73f3.js";import{A as Je,a as $}from"./accordionSummary-a06aa21e.js";import{E as Ct,D as Ke,S as kt,C as Qe}from"./index-482f0b49.js";import{P as Ze}from"./sectionWrappers-aaf62731.js";import{u as At}from"./useTokenSupply-9a8f8b12.js";import{Layout as De}from"./settings-d85fe177.js";import{A as St}from"./index-4cbd21fe.js";import{R as Mt,U as Nt}from"./index-93139e2c.js";import"./index-b80a0dc5.js";import"./index-ed07b3e9.js";var Se={};const Lt=B(ft),Pt=B(vt),wt=B(yt),Et=B(ht),$e=B(xt),_t=B(jt);var fe={};Object.defineProperty(fe,"__esModule",{value:!0});fe.version=void 0;fe.version="ethers/5.7.2";(function(e){var n=F&&F.__createBinding||(Object.create?function(a,d,f,o){o===void 0&&(o=f),Object.defineProperty(a,o,{enumerable:!0,get:function(){return d[f]}})}:function(a,d,f,o){o===void 0&&(o=f),a[o]=d[f]}),c=F&&F.__setModuleDefault||(Object.create?function(a,d){Object.defineProperty(a,"default",{enumerable:!0,value:d})}:function(a,d){a.default=d}),u=F&&F.__importStar||function(a){if(a&&a.__esModule)return a;var d={};if(a!=null)for(var f in a)f!=="default"&&Object.prototype.hasOwnProperty.call(a,f)&&n(d,a,f);return c(d,a),d};Object.defineProperty(e,"__esModule",{value:!0}),e.Wordlist=e.version=e.wordlists=e.utils=e.logger=e.errors=e.constants=e.FixedNumber=e.BigNumber=e.ContractFactory=e.Contract=e.BaseContract=e.providers=e.getDefaultProvider=e.VoidSigner=e.Wallet=e.Signer=void 0;var v=Lt;Object.defineProperty(e,"BaseContract",{enumerable:!0,get:function(){return v.BaseContract}}),Object.defineProperty(e,"Contract",{enumerable:!0,get:function(){return v.Contract}}),Object.defineProperty(e,"ContractFactory",{enumerable:!0,get:function(){return v.ContractFactory}});var s=Pt;Object.defineProperty(e,"BigNumber",{enumerable:!0,get:function(){return s.BigNumber}}),Object.defineProperty(e,"FixedNumber",{enumerable:!0,get:function(){return s.FixedNumber}});var j=wt;Object.defineProperty(e,"Signer",{enumerable:!0,get:function(){return j.Signer}}),Object.defineProperty(e,"VoidSigner",{enumerable:!0,get:function(){return j.VoidSigner}});var P=ot;Object.defineProperty(e,"Wallet",{enumerable:!0,get:function(){return P.Wallet}});var A=u(Et);e.constants=A;var r=u($e);e.providers=r;var C=$e;Object.defineProperty(e,"getDefaultProvider",{enumerable:!0,get:function(){return C.getDefaultProvider}});var y=_t;Object.defineProperty(e,"Wordlist",{enumerable:!0,get:function(){return y.Wordlist}}),Object.defineProperty(e,"wordlists",{enumerable:!0,get:function(){return y.wordlists}});var S=u(rt);e.utils=S;var w=lt;Object.defineProperty(e,"errors",{enumerable:!0,get:function(){return w.ErrorCode}});var l=fe;Object.defineProperty(e,"version",{enumerable:!0,get:function(){return l.version}});var k=new w.Logger(l.version);e.logger=k})(Se);const Ot=({members:e,minTallyApprovals:n})=>{const{api:c}=dt(),{t:u}=be();if(!e)return null;const v=async({address:s,ensName:j},P,A)=>{const r=new ct(c,s,j);let C=!0;return P.length>1&&!r.address&&!r.ensName&&(C=u("errors.required.walletAddress")),r.ensName&&!r.address&&(C=await r.isValidEnsName()?!0:u("inputWallet.ensAlertCirtical")),r.address&&!r.ensName&&(C=r.isAddressValid()?!0:u("inputWallet.addressAlertCritical")),e?.some(y=>y.address.toLowerCase()===r.address?.toLowerCase())&&(C=u("errors.duplicateAddressOnCurrentMembersList")),P?.some(({address:y},S)=>y===r.address&&S!==A)&&(C=u("errors.duplicateAddress")),C};return t.jsxs(t.Fragment,{children:[t.jsx(St,{actionIndex:0,useCustomHeader:!0,currentDaoMembers:e,customRowValidator:v,borderless:!0}),t.jsx(Mt,{actionIndex:1,useCustomHeader:!0,currentDaoMembers:e,borderless:!0}),t.jsx(Nt,{actionIndex:2,useCustomHeader:!0,currentDaoMembers:e,currentMinimumApproval:n,isGasless:!0}),t.jsx(Ct,{borderless:!0})]})},Tt=({daoDetails:e})=>{const{t:n}=be(),c=Ve(),{network:u}=We(),{isMobile:v}=Me(),{setValue:s,control:j}=Ne(),{fields:P,replace:A}=Re({name:"daoLinks",control:j}),{errors:r,isValid:C,isDirty:y}=Fe({control:j}),S=e?.plugins?.[0]?.instanceAddress,w=e?.plugins?.[0]?.id,l=w===Ae,{data:k,isLoading:a}=ut(S),{data:d,isLoading:f}=At(k?.address??""),{data:o,isLoading:D}=Be({pluginAddress:S,pluginType:w}),i=o,X=D||a||f,Y=i?.minDuration,h=!!(!X&&k&&d&&Y),[ee,te,H,ve,E,M,_,O,I,V,x,W,ne,se,ie,ae,N,m]=He({name:["daoName","daoSummary","daoLogo","minimumApproval","minimumParticipation","eligibilityType","eligibilityTokenAmount","durationDays","durationHours","durationMinutes","daoLinks","earlyExecution","voteReplacement","executionExpirationMinutes","executionExpirationHours","executionExpirationDays","committeeMinimumApproval","actions"],control:j}),{days:ye,hours:he,minutes:xe}=Ee(Y??0);let q,G,U,re;if(l&&i){const{days:L,hours:g,minutes:it}=Ee(i.minTallyDuration??0);q=L,G=g,U=it,re=i.executionMultisigMembers?.map(at=>({address:at}))}const je=P.map((L,g)=>({...L,...x&&{...x[g]}})),Xe=p.useMemo(()=>{if(!e?.metadata.links||!x)return!0;const L=x.length-e.metadata.links.length;if(L>0){for(let g=e.metadata.links.length;g<x.length;g++)if(x[g].name&&x[g].url&&!r.daoLinks?.[g])return!1}if(L<0)return!1;for(let g=0;g<e.metadata.links.length;g++)if(je[g].name!==e.metadata.links[g].name||je[g].url!==e.metadata.links[g].url)return!1;return!0},[je,e?.metadata.links,r.daoLinks,x]),z=e?.metadata.name&&(ee!==e.metadata.name||te!==e.metadata.description||H!==e.metadata.avatar||!Xe),Pe=_e(l?ue.STANDARD:i?.votingMode??ue.STANDARD);let R=!1;i&&(R=Number(E)!==Math.round(i.minParticipation*100)||Number(ve)!==Math.round(i.supportThreshold*100)||Number(O)!==ye||Number(I)!==he||Number(V)!==xe||W!==Pe.earlyExecution||ne!==Pe.voteReplacement);const J=p.useMemo(()=>l&&i?Number(se)!==U||Number(ie)!==G||Number(ae)!==q||Number(N)!==i.minTallyApprovals:!1,[q,G,U,N,ae,ie,se,l,i])||$t(m);let K=M;i&&(i.minProposerVotingPower?K=Se.BigNumber.from(i.minProposerVotingPower).isZero()?"anyone":"token":K="anyone");let Q="0";k?.decimals&&i?.minProposerVotingPower&&(Q=Math.ceil(Number(mt(i.minProposerVotingPower,k.decimals))).toString());const Z=K!==M||!Se.BigNumber.from(Q).eq(_!==""?_:0),oe=p.useCallback(()=>{s("daoName",e?.metadata.name),s("daoSummary",e?.metadata.description),s("daoLogo",e?.metadata?.avatar),e?.metadata.links&&(s("daoLinks",[...e.metadata.links.map(()=>({}))]),A([...e.metadata.links]))},[e.metadata?.avatar,e.metadata.description,e.metadata.links,e.metadata.name,A,s]),le=p.useCallback(()=>{s("eligibilityType",K),s("eligibilityTokenAmount",Q),s("minimumTokenAmount",Q)},[K,Q,s]),de=p.useCallback(()=>{if(!i)return;s("tokenTotalSupply",d?.formatted),s("minimumApproval",Math.round(i.supportThreshold*100)),s("minimumParticipation",Math.round(i.minParticipation*100)),s("tokenDecimals",k?.decimals||18);const L=_e(l?ue.STANDARD:i?.votingMode??ue.STANDARD);s("earlyExecution",L.earlyExecution),s("voteReplacement",L.voteReplacement),s("durationDays",ye?.toString()),s("durationHours",he?.toString()),s("durationMinutes",xe?.toString()),s("membership",e?.plugins[0].id==="token-voting.plugin.dao.eth"||e?.plugins[0].id===Ae?"token":"wallet")},[e?.plugins,k?.decimals,ye,he,l,xe,s,d?.formatted,i]),ce=p.useCallback(()=>{l&&(s("votingType","gasless"),s("executionExpirationMinutes",U?.toString()),s("executionExpirationHours",G?.toString()),s("executionExpirationDays",q?.toString()),s("committee",re),s("committeeMinimumApproval",i.minTallyApprovals))},[q,G,U,re,l,s,i]),Ye=p.useCallback(()=>{s("actions",[{inputs:{memberWallets:[{address:"",ensName:""}]},name:"add_address"},{inputs:{memberWallets:[]},name:"remove_address"}])},[s]),Ce=!R&&!z&&!Z&&!J,we=()=>{oe(),le(),de(),l&&(ce(),Ye())};p.useEffect(()=>{s("isMetadataChanged",z),s("areSettingsChanged",Z||R||J)},[Z,J,R,z,s]),p.useEffect(()=>{h&&!y&&(oe(),le(),de(),l&&ce())},[h,y,l,le,ce,de,oe]);const et=[t.jsx(T.Item,{disabled:!z,onClick:oe,children:n("settings.resetChanges")},0)],tt=[t.jsx(T.Item,{disabled:!Z,onClick:le,children:n("settings.resetChanges")},0)],nt=[t.jsx(T.Item,{disabled:!R,onClick:de,children:n("settings.resetChanges")},0)],st=[t.jsx(T.Item,{disabled:!J,onClick:ce,children:n("settings.resetChanges")},0)];if(X&&!h)return t.jsx(ge,{});if(h)return t.jsx(Ze,{title:n("settings.editDaoSettings"),description:n("settings.editSubtitle"),secondaryBtnProps:v?{disabled:Ce,label:n("settings.resetChanges"),onClick:()=>we()}:void 0,customBody:t.jsxs(De,{children:[t.jsx(It,{children:t.jsxs(Je,{defaultValue:"metadata",className:"space-y-6",children:[t.jsx($,{type:"action-builder",name:"metadata",methodName:n("labels.review.daoMetadata"),alertLabel:z?n("settings.newSettings"):void 0,dropdownItems:et,children:t.jsx(me,{children:t.jsx(Ke,{bgWhite:!0,arrayName:"daoLinks",isSettingPage:!0})})}),t.jsx($,{type:"action-builder",name:"community",methodName:n("navLinks.members"),alertLabel:Z?n("settings.newSettings"):void 0,dropdownItems:tt,children:t.jsx(me,{children:t.jsx(Rt,{children:t.jsx(kt,{})})})}),t.jsx($,{type:"action-builder",name:"governance",methodName:n("labels.review.governance"),alertLabel:R?n("settings.newSettings"):void 0,dropdownItems:nt,children:t.jsx(me,{children:t.jsx(Qe,{isSettingPage:!0})})}),l&&t.jsx($,{type:"action-builder",name:"executionMultisigSettings",methodName:n("label.executionMultisig"),alertLabel:J?n("settings.newSettings"):void 0,dropdownItems:st,children:t.jsx(me,{children:t.jsx(Ot,{members:re,minTallyApprovals:i.minTallyApprovals})})})]})}),t.jsxs(Wt,{children:[t.jsxs(Vt,{children:[t.jsx(pe,{className:"w-full md:w-max",iconLeft:qe.APP_PROPOSALS,variant:"primary",size:"lg",disabled:Ce||!C,onClick:()=>c(Ge(ze,{network:u,dao:Ue(e.ensDomain)||e.address})),children:n("settings.reviewProposal")}),t.jsx(pe,{className:"w-full md:w-max",variant:"tertiary",size:"lg",disabled:Ce,onClick:we,children:n("settings.resetChanges")})]}),t.jsx(Le,{message:n("settings.proposeSettingsInfo"),variant:"info"})]})]})})};function $t(e){for(let n=0;n<e.length;n++)if(e[n].name==="add_address"||e[n].name==="remove_address"){const c=e[n].inputs.memberWallets;if(c.length>0&&c[0].address!=="")return!0}return!1}const It=b.div.attrs({})``,me=b.div.attrs({className:"p-6 pb-12 space-y-6 bg-neutral-0 border border-neutral-100 rounded-b-xl border-t-0"})``,Vt=b.div.attrs({className:"md:flex space-y-4 md:space-y-0 md:space-x-6"})``,Wt=b.div.attrs({className:"mt-10 xl:mt-16 space-y-4"})``,Rt=b.div.attrs({})``,Ft=()=>{const{control:e}=Ne(),{t:n}=be(),{isMobile:c}=Me();return t.jsxs(Ht,{children:[t.jsx(Bt,{children:t.jsx(Oe,{label:n("createDAO.step3.multisigEligibilityTitle"),helpText:n("createDAO.step3.multisigEligibilitySubtitle")})}),t.jsx(gt,{name:"eligibilityType",control:e,defaultValue:"multisig",render:({field:{onChange:u,value:v}})=>t.jsxs(Gt,{children:[t.jsxs(qt,{children:[c&&t.jsx(Oe,{label:n("createDAO.step3.multisigEligibilityMobileTitle")}),t.jsx(Ie,{children:t.jsx(Te,{label:n("createDAO.step3.eligibility.multisigMembers.title"),helptext:n("createDAO.step3.eligibility.multisigMembers.description"),multiSelect:!1,onClick:()=>{u("multisig")},...v==="multisig"?{type:"active"}:{}})}),t.jsx(Ie,{children:t.jsx(Te,{label:n("createDAO.step3.eligibility.anyWallet.title"),helptext:n("createDAO.step3.eligibility.anyWallet.description"),onClick:()=>{u("anyone")},multiSelect:!1,...v==="anyone"?{type:"active"}:{}})})]}),v==="anyone"&&t.jsx(Le,{message:n("createDAO.step3.multisigEligibilityAlert"),variant:"critical"})]})})]})},Bt=b.div.attrs({className:"flex-col space-y-1"})``,Ht=b.div.attrs({className:"space-y-3"})``,qt=b.div.attrs({className:"flex xl:flex-row flex-col xl:gap-4 xl:bg-[transparent] bg-neutral-0 gap-2 p-4 xl:p-0 rounded-xl"})``,Gt=b.div.attrs({className:"flex space-y-3 flex-col"})``,Ie=b.div.attrs({className:"flex-1"})``,Ut=({daoDetails:e})=>{const{t:n}=be(),c=Ve(),{network:u}=We(),{isMobile:v}=Me(),{setValue:s,control:j}=Ne(),{fields:P,replace:A}=Re({name:"daoLinks",control:j}),{errors:r,isValid:C,isDirty:y}=Fe({control:j}),S=e?.plugins?.[0]?.instanceAddress,w="multisig.plugin.dao.eth",{data:l,isLoading:k}=Be({pluginAddress:S,pluginType:w}),{data:a,isLoading:d}=pt(S,w),f=d||k,o=l,D=!!(!f&&a&&o?.minApprovals),[i,X,Y,h,ee,te]=He({name:["daoName","daoSummary","daoLogo","daoLinks","eligibilityType","multisigMinimumApprovals"],control:j}),H=P.map((N,m)=>({...N,...h&&{...h[m]}})),ve=p.useMemo(()=>{if(!e?.metadata.links||!h)return!0;const N=h.length-e.metadata.links.length;if(N>0){for(let m=e.metadata.links.length;m<h.length;m++)if(h[m].name&&h[m].url&&!r.daoLinks?.[m])return!1}if(N<0)return!1;for(let m=0;m<e.metadata.links.length;m++)if(H[m].name!==e.metadata.links[m].name||H[m].url!==e.metadata.links[m].url)return!1;return!0},[H,e?.metadata.links,r.daoLinks,h]),E=e?.metadata.name&&(i!==e.metadata.name||X!==e.metadata.description||Y!==e.metadata.avatar||!ve);let M=!1;te&&o?.minApprovals&&(M=te!==o.minApprovals);let _=ee;o&&(_=o.onlyListed?"multisig":"anyone");const O=_!==ee,I=p.useCallback(()=>{s("daoName",e?.metadata.name),s("daoSummary",e?.metadata.description),s("daoLogo",e?.metadata?.avatar),e?.metadata.links&&(s("daoLinks",[...e.metadata.links.map(()=>({}))]),A([...e.metadata.links]))},[s,e.metadata.name,e.metadata.description,e.metadata?.avatar,e.metadata.links,A]),V=p.useCallback(()=>{s("eligibilityType",_)},[_,s]),x=p.useCallback(()=>{if(o){const N=a.members;s("multisigMinimumApprovals",o.minApprovals),s("multisigWallets",N),s("membership",e?.plugins[0].id==="token-voting.plugin.dao.eth"?"token":"multisig")}},[o,a.members,s,e?.plugins]),W=!M&&!E&&!O,ne=()=>{I(),V(),x()};p.useEffect(()=>{s("isMetadataChanged",E),s("areSettingsChanged",O||M)},[O,M,E,s]),p.useEffect(()=>{D&&!y&&(I(),x(),V())},[D,y,V,x,I,W]);const se=[t.jsx(T.Item,{disabled:!E,onClick:I,children:n("settings.resetChanges")},0)],ie=[t.jsx(T.Item,{disabled:!O,onClick:V,children:n("settings.resetChanges")},0)],ae=[t.jsx(T.Item,{disabled:!M,onClick:x,children:n("settings.resetChanges")},0)];return f?t.jsx(ge,{}):y?t.jsx(Ze,{title:n("settings.editDaoSettings"),description:n("settings.editSubtitle"),secondaryBtnProps:v?{disabled:W,label:n("settings.resetChanges"),onClick:()=>ne()}:void 0,customBody:t.jsxs(De,{children:[t.jsx(zt,{children:t.jsxs(Je,{defaultValue:"metadata",className:"space-y-6",children:[t.jsx($,{type:"action-builder",name:"metadata",methodName:n("labels.review.daoMetadata"),alertLabel:E?n("settings.newSettings"):void 0,dropdownItems:se,children:t.jsx(ke,{children:t.jsx(Ke,{bgWhite:!0,arrayName:"daoLinks",isSettingPage:!0})})}),t.jsx($,{type:"action-builder",name:"community",methodName:n("navLinks.members"),alertLabel:O?n("settings.newSettings"):void 0,dropdownItems:ie,children:t.jsx(ke,{children:t.jsx(Qt,{children:t.jsx(Ft,{})})})}),t.jsx($,{type:"action-builder",name:"governance",methodName:n("labels.review.governance"),alertLabel:M?n("settings.newSettings"):void 0,dropdownItems:ae,children:t.jsx(ke,{children:t.jsx(Qe,{isSettingPage:!0})})})]})}),t.jsxs(Kt,{children:[t.jsxs(Jt,{children:[t.jsx(pe,{className:"w-full md:w-max",iconLeft:qe.APP_PROPOSALS,size:"lg",variant:"primary",disabled:W||!C,onClick:()=>c(Ge(ze,{network:u,dao:Ue(e.ensDomain)||e.address})),children:n("settings.reviewProposal")}),t.jsx(pe,{className:"w-full md:w-max",variant:"tertiary",size:"lg",disabled:W,onClick:ne,children:n("settings.resetChanges")})]}),t.jsx(Le,{message:n("settings.proposeSettingsInfo"),variant:"info"})]})]})}):t.jsx(ge,{})},zt=b.div.attrs({})``,ke=b.div.attrs({className:"p-6 pb-12 space-y-6 bg-neutral-0 border border-neutral-100 rounded-b-xl border-t-0"})``,Jt=b.div.attrs({className:"md:flex space-y-4 md:space-y-0 md:space-x-6"})``,Kt=b.div.attrs({className:"mt-10 xl:mt-16 space-y-4"})``,Qt=b.div.attrs({})``,cn=()=>{const{data:e,isLoading:n}=bt(),c=e?.plugins[0].id;return n?t.jsx(ge,{}):e?c==="multisig.plugin.dao.eth"?t.jsx(Ut,{daoDetails:e}):c==="token-voting.plugin.dao.eth"||c===Ae?t.jsx(Tt,{daoDetails:e}):t.jsx(t.Fragment,{}):null};export{cn as EditSettings};
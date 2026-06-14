(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))s(r);new MutationObserver(r=>{for(const i of r)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&s(o)}).observe(document,{childList:!0,subtree:!0});function n(r){const i={};return r.integrity&&(i.integrity=r.integrity),r.referrerPolicy&&(i.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?i.credentials="include":r.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function s(r){if(r.ep)return;r.ep=!0;const i=n(r);fetch(r.href,i)}})();/**
* @vue/shared v3.5.29
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/function di(t){const e=Object.create(null);for(const n of t.split(","))e[n]=1;return n=>n in e}const de={},En=[],dt=()=>{},Ia=()=>!1,tr=t=>t.charCodeAt(0)===111&&t.charCodeAt(1)===110&&(t.charCodeAt(2)>122||t.charCodeAt(2)<97),fi=t=>t.startsWith("onUpdate:"),we=Object.assign,hi=(t,e)=>{const n=t.indexOf(e);n>-1&&t.splice(n,1)},Lc=Object.prototype.hasOwnProperty,re=(t,e)=>Lc.call(t,e),z=Array.isArray,In=t=>_s(t)==="[object Map]",Fn=t=>_s(t)==="[object Set]",zi=t=>_s(t)==="[object Date]",J=t=>typeof t=="function",ve=t=>typeof t=="string",pt=t=>typeof t=="symbol",ae=t=>t!==null&&typeof t=="object",wa=t=>(ae(t)||J(t))&&J(t.then)&&J(t.catch),Sa=Object.prototype.toString,_s=t=>Sa.call(t),Mc=t=>_s(t).slice(8,-1),Ca=t=>_s(t)==="[object Object]",pi=t=>ve(t)&&t!=="NaN"&&t[0]!=="-"&&""+parseInt(t,10)===t,Yn=di(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"),nr=t=>{const e=Object.create(null);return(n=>e[n]||(e[n]=t(n)))},Uc=/-\w/g,qe=nr(t=>t.replace(Uc,e=>e.slice(1).toUpperCase())),Fc=/\B([A-Z])/g,dn=nr(t=>t.replace(Fc,"-$1").toLowerCase()),sr=nr(t=>t.charAt(0).toUpperCase()+t.slice(1)),br=nr(t=>t?`on${sr(t)}`:""),Kt=(t,e)=>!Object.is(t,e),Os=(t,...e)=>{for(let n=0;n<t.length;n++)t[n](...e)},Ta=(t,e,n,s=!1)=>{Object.defineProperty(t,e,{configurable:!0,enumerable:!1,writable:s,value:n})},rr=t=>{const e=parseFloat(t);return isNaN(e)?t:e};let qi;const ir=()=>qi||(qi=typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof window<"u"?window:typeof global<"u"?global:{});function mi(t){if(z(t)){const e={};for(let n=0;n<t.length;n++){const s=t[n],r=ve(s)?Hc(s):mi(s);if(r)for(const i in r)e[i]=r[i]}return e}else if(ve(t)||ae(t))return t}const Vc=/;(?![^(]*\))/g,$c=/:([^]+)/,Bc=/\/\*[^]*?\*\//g;function Hc(t){const e={};return t.replace(Bc,"").split(Vc).forEach(n=>{if(n){const s=n.split($c);s.length>1&&(e[s[0].trim()]=s[1].trim())}}),e}function $e(t){let e="";if(ve(t))e=t;else if(z(t))for(let n=0;n<t.length;n++){const s=$e(t[n]);s&&(e+=s+" ")}else if(ae(t))for(const n in t)t[n]&&(e+=n+" ");return e.trim()}const jc="itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly",Wc=di(jc);function Aa(t){return!!t||t===""}function Kc(t,e){if(t.length!==e.length)return!1;let n=!0;for(let s=0;n&&s<t.length;s++)n=Vn(t[s],e[s]);return n}function Vn(t,e){if(t===e)return!0;let n=zi(t),s=zi(e);if(n||s)return n&&s?t.getTime()===e.getTime():!1;if(n=pt(t),s=pt(e),n||s)return t===e;if(n=z(t),s=z(e),n||s)return n&&s?Kc(t,e):!1;if(n=ae(t),s=ae(e),n||s){if(!n||!s)return!1;const r=Object.keys(t).length,i=Object.keys(e).length;if(r!==i)return!1;for(const o in t){const a=t.hasOwnProperty(o),l=e.hasOwnProperty(o);if(a&&!l||!a&&l||!Vn(t[o],e[o]))return!1}}return String(t)===String(e)}function gi(t,e){return t.findIndex(n=>Vn(n,e))}const Ra=t=>!!(t&&t.__v_isRef===!0),A=t=>ve(t)?t:t==null?"":z(t)||ae(t)&&(t.toString===Sa||!J(t.toString))?Ra(t)?A(t.value):JSON.stringify(t,Pa,2):String(t),Pa=(t,e)=>Ra(e)?Pa(t,e.value):In(e)?{[`Map(${e.size})`]:[...e.entries()].reduce((n,[s,r],i)=>(n[Er(s,i)+" =>"]=r,n),{})}:Fn(e)?{[`Set(${e.size})`]:[...e.values()].map(n=>Er(n))}:pt(e)?Er(e):ae(e)&&!z(e)&&!Ca(e)?String(e):e,Er=(t,e="")=>{var n;return pt(t)?`Symbol(${(n=t.description)!=null?n:e})`:t};/**
* @vue/reactivity v3.5.29
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/let Ue;class Gc{constructor(e=!1){this.detached=e,this._active=!0,this._on=0,this.effects=[],this.cleanups=[],this._isPaused=!1,this.__v_skip=!0,this.parent=Ue,!e&&Ue&&(this.index=(Ue.scopes||(Ue.scopes=[])).push(this)-1)}get active(){return this._active}pause(){if(this._active){this._isPaused=!0;let e,n;if(this.scopes)for(e=0,n=this.scopes.length;e<n;e++)this.scopes[e].pause();for(e=0,n=this.effects.length;e<n;e++)this.effects[e].pause()}}resume(){if(this._active&&this._isPaused){this._isPaused=!1;let e,n;if(this.scopes)for(e=0,n=this.scopes.length;e<n;e++)this.scopes[e].resume();for(e=0,n=this.effects.length;e<n;e++)this.effects[e].resume()}}run(e){if(this._active){const n=Ue;try{return Ue=this,e()}finally{Ue=n}}}on(){++this._on===1&&(this.prevScope=Ue,Ue=this)}off(){this._on>0&&--this._on===0&&(Ue=this.prevScope,this.prevScope=void 0)}stop(e){if(this._active){this._active=!1;let n,s;for(n=0,s=this.effects.length;n<s;n++)this.effects[n].stop();for(this.effects.length=0,n=0,s=this.cleanups.length;n<s;n++)this.cleanups[n]();if(this.cleanups.length=0,this.scopes){for(n=0,s=this.scopes.length;n<s;n++)this.scopes[n].stop(!0);this.scopes.length=0}if(!this.detached&&this.parent&&!e){const r=this.parent.scopes.pop();r&&r!==this&&(this.parent.scopes[this.index]=r,r.index=this.index)}this.parent=void 0}}}function zc(){return Ue}let he;const Ir=new WeakSet;class ka{constructor(e){this.fn=e,this.deps=void 0,this.depsTail=void 0,this.flags=5,this.next=void 0,this.cleanup=void 0,this.scheduler=void 0,Ue&&Ue.active&&Ue.effects.push(this)}pause(){this.flags|=64}resume(){this.flags&64&&(this.flags&=-65,Ir.has(this)&&(Ir.delete(this),this.trigger()))}notify(){this.flags&2&&!(this.flags&32)||this.flags&8||Na(this)}run(){if(!(this.flags&1))return this.fn();this.flags|=2,Ji(this),Da(this);const e=he,n=Ye;he=this,Ye=!0;try{return this.fn()}finally{xa(this),he=e,Ye=n,this.flags&=-3}}stop(){if(this.flags&1){for(let e=this.deps;e;e=e.nextDep)vi(e);this.deps=this.depsTail=void 0,Ji(this),this.onStop&&this.onStop(),this.flags&=-2}}trigger(){this.flags&64?Ir.add(this):this.scheduler?this.scheduler():this.runIfDirty()}runIfDirty(){$r(this)&&this.run()}get dirty(){return $r(this)}}let Oa=0,Xn,Qn;function Na(t,e=!1){if(t.flags|=8,e){t.next=Qn,Qn=t;return}t.next=Xn,Xn=t}function _i(){Oa++}function yi(){if(--Oa>0)return;if(Qn){let e=Qn;for(Qn=void 0;e;){const n=e.next;e.next=void 0,e.flags&=-9,e=n}}let t;for(;Xn;){let e=Xn;for(Xn=void 0;e;){const n=e.next;if(e.next=void 0,e.flags&=-9,e.flags&1)try{e.trigger()}catch(s){t||(t=s)}e=n}}if(t)throw t}function Da(t){for(let e=t.deps;e;e=e.nextDep)e.version=-1,e.prevActiveLink=e.dep.activeLink,e.dep.activeLink=e}function xa(t){let e,n=t.depsTail,s=n;for(;s;){const r=s.prevDep;s.version===-1?(s===n&&(n=r),vi(s),qc(s)):e=s,s.dep.activeLink=s.prevActiveLink,s.prevActiveLink=void 0,s=r}t.deps=e,t.depsTail=n}function $r(t){for(let e=t.deps;e;e=e.nextDep)if(e.dep.version!==e.version||e.dep.computed&&(La(e.dep.computed)||e.dep.version!==e.version))return!0;return!!t._dirty}function La(t){if(t.flags&4&&!(t.flags&16)||(t.flags&=-17,t.globalVersion===os)||(t.globalVersion=os,!t.isSSR&&t.flags&128&&(!t.deps&&!t._dirty||!$r(t))))return;t.flags|=2;const e=t.dep,n=he,s=Ye;he=t,Ye=!0;try{Da(t);const r=t.fn(t._value);(e.version===0||Kt(r,t._value))&&(t.flags|=128,t._value=r,e.version++)}catch(r){throw e.version++,r}finally{he=n,Ye=s,xa(t),t.flags&=-3}}function vi(t,e=!1){const{dep:n,prevSub:s,nextSub:r}=t;if(s&&(s.nextSub=r,t.prevSub=void 0),r&&(r.prevSub=s,t.nextSub=void 0),n.subs===t&&(n.subs=s,!s&&n.computed)){n.computed.flags&=-5;for(let i=n.computed.deps;i;i=i.nextDep)vi(i,!0)}!e&&!--n.sc&&n.map&&n.map.delete(n.key)}function qc(t){const{prevDep:e,nextDep:n}=t;e&&(e.nextDep=n,t.prevDep=void 0),n&&(n.prevDep=e,t.nextDep=void 0)}let Ye=!0;const Ma=[];function At(){Ma.push(Ye),Ye=!1}function Rt(){const t=Ma.pop();Ye=t===void 0?!0:t}function Ji(t){const{cleanup:e}=t;if(t.cleanup=void 0,e){const n=he;he=void 0;try{e()}finally{he=n}}}let os=0;class Jc{constructor(e,n){this.sub=e,this.dep=n,this.version=n.version,this.nextDep=this.prevDep=this.nextSub=this.prevSub=this.prevActiveLink=void 0}}class bi{constructor(e){this.computed=e,this.version=0,this.activeLink=void 0,this.subs=void 0,this.map=void 0,this.key=void 0,this.sc=0,this.__v_skip=!0}track(e){if(!he||!Ye||he===this.computed)return;let n=this.activeLink;if(n===void 0||n.sub!==he)n=this.activeLink=new Jc(he,this),he.deps?(n.prevDep=he.depsTail,he.depsTail.nextDep=n,he.depsTail=n):he.deps=he.depsTail=n,Ua(n);else if(n.version===-1&&(n.version=this.version,n.nextDep)){const s=n.nextDep;s.prevDep=n.prevDep,n.prevDep&&(n.prevDep.nextDep=s),n.prevDep=he.depsTail,n.nextDep=void 0,he.depsTail.nextDep=n,he.depsTail=n,he.deps===n&&(he.deps=s)}return n}trigger(e){this.version++,os++,this.notify(e)}notify(e){_i();try{for(let n=this.subs;n;n=n.prevSub)n.sub.notify()&&n.sub.dep.notify()}finally{yi()}}}function Ua(t){if(t.dep.sc++,t.sub.flags&4){const e=t.dep.computed;if(e&&!t.dep.subs){e.flags|=20;for(let s=e.deps;s;s=s.nextDep)Ua(s)}const n=t.dep.subs;n!==t&&(t.prevSub=n,n&&(n.nextSub=t)),t.dep.subs=t}}const Br=new WeakMap,an=Symbol(""),Hr=Symbol(""),as=Symbol("");function Se(t,e,n){if(Ye&&he){let s=Br.get(t);s||Br.set(t,s=new Map);let r=s.get(n);r||(s.set(n,r=new bi),r.map=s,r.key=n),r.track()}}function Et(t,e,n,s,r,i){const o=Br.get(t);if(!o){os++;return}const a=l=>{l&&l.trigger()};if(_i(),e==="clear")o.forEach(a);else{const l=z(t),u=l&&pi(n);if(l&&n==="length"){const f=Number(s);o.forEach((d,h)=>{(h==="length"||h===as||!pt(h)&&h>=f)&&a(d)})}else switch((n!==void 0||o.has(void 0))&&a(o.get(n)),u&&a(o.get(as)),e){case"add":l?u&&a(o.get("length")):(a(o.get(an)),In(t)&&a(o.get(Hr)));break;case"delete":l||(a(o.get(an)),In(t)&&a(o.get(Hr)));break;case"set":In(t)&&a(o.get(an));break}}yi()}function _n(t){const e=se(t);return e===t?e:(Se(e,"iterate",as),ze(t)?e:e.map(Qe))}function or(t){return Se(t=se(t),"iterate",as),t}function Ut(t,e){return Pt(t)?kn(ln(t)?Qe(e):e):Qe(e)}const Yc={__proto__:null,[Symbol.iterator](){return wr(this,Symbol.iterator,t=>Ut(this,t))},concat(...t){return _n(this).concat(...t.map(e=>z(e)?_n(e):e))},entries(){return wr(this,"entries",t=>(t[1]=Ut(this,t[1]),t))},every(t,e){return _t(this,"every",t,e,void 0,arguments)},filter(t,e){return _t(this,"filter",t,e,n=>n.map(s=>Ut(this,s)),arguments)},find(t,e){return _t(this,"find",t,e,n=>Ut(this,n),arguments)},findIndex(t,e){return _t(this,"findIndex",t,e,void 0,arguments)},findLast(t,e){return _t(this,"findLast",t,e,n=>Ut(this,n),arguments)},findLastIndex(t,e){return _t(this,"findLastIndex",t,e,void 0,arguments)},forEach(t,e){return _t(this,"forEach",t,e,void 0,arguments)},includes(...t){return Sr(this,"includes",t)},indexOf(...t){return Sr(this,"indexOf",t)},join(t){return _n(this).join(t)},lastIndexOf(...t){return Sr(this,"lastIndexOf",t)},map(t,e){return _t(this,"map",t,e,void 0,arguments)},pop(){return Wn(this,"pop")},push(...t){return Wn(this,"push",t)},reduce(t,...e){return Yi(this,"reduce",t,e)},reduceRight(t,...e){return Yi(this,"reduceRight",t,e)},shift(){return Wn(this,"shift")},some(t,e){return _t(this,"some",t,e,void 0,arguments)},splice(...t){return Wn(this,"splice",t)},toReversed(){return _n(this).toReversed()},toSorted(t){return _n(this).toSorted(t)},toSpliced(...t){return _n(this).toSpliced(...t)},unshift(...t){return Wn(this,"unshift",t)},values(){return wr(this,"values",t=>Ut(this,t))}};function wr(t,e,n){const s=or(t),r=s[e]();return s!==t&&!ze(t)&&(r._next=r.next,r.next=()=>{const i=r._next();return i.done||(i.value=n(i.value)),i}),r}const Xc=Array.prototype;function _t(t,e,n,s,r,i){const o=or(t),a=o!==t&&!ze(t),l=o[e];if(l!==Xc[e]){const d=l.apply(t,i);return a?Qe(d):d}let u=n;o!==t&&(a?u=function(d,h){return n.call(this,Ut(t,d),h,t)}:n.length>2&&(u=function(d,h){return n.call(this,d,h,t)}));const f=l.call(o,u,s);return a&&r?r(f):f}function Yi(t,e,n,s){const r=or(t);let i=n;return r!==t&&(ze(t)?n.length>3&&(i=function(o,a,l){return n.call(this,o,a,l,t)}):i=function(o,a,l){return n.call(this,o,Ut(t,a),l,t)}),r[e](i,...s)}function Sr(t,e,n){const s=se(t);Se(s,"iterate",as);const r=s[e](...n);return(r===-1||r===!1)&&wi(n[0])?(n[0]=se(n[0]),s[e](...n)):r}function Wn(t,e,n=[]){At(),_i();const s=se(t)[e].apply(t,n);return yi(),Rt(),s}const Qc=di("__proto__,__v_isRef,__isVue"),Fa=new Set(Object.getOwnPropertyNames(Symbol).filter(t=>t!=="arguments"&&t!=="caller").map(t=>Symbol[t]).filter(pt));function Zc(t){pt(t)||(t=String(t));const e=se(this);return Se(e,"has",t),e.hasOwnProperty(t)}class Va{constructor(e=!1,n=!1){this._isReadonly=e,this._isShallow=n}get(e,n,s){if(n==="__v_skip")return e.__v_skip;const r=this._isReadonly,i=this._isShallow;if(n==="__v_isReactive")return!r;if(n==="__v_isReadonly")return r;if(n==="__v_isShallow")return i;if(n==="__v_raw")return s===(r?i?cu:ja:i?Ha:Ba).get(e)||Object.getPrototypeOf(e)===Object.getPrototypeOf(s)?e:void 0;const o=z(e);if(!r){let l;if(o&&(l=Yc[n]))return l;if(n==="hasOwnProperty")return Zc}const a=Reflect.get(e,n,Te(e)?e:s);if((pt(n)?Fa.has(n):Qc(n))||(r||Se(e,"get",n),i))return a;if(Te(a)){const l=o&&pi(n)?a:a.value;return r&&ae(l)?Wr(l):l}return ae(a)?r?Wr(a):Oe(a):a}}class $a extends Va{constructor(e=!1){super(!1,e)}set(e,n,s,r){let i=e[n];const o=z(e)&&pi(n);if(!this._isShallow){const u=Pt(i);if(!ze(s)&&!Pt(s)&&(i=se(i),s=se(s)),!o&&Te(i)&&!Te(s))return u||(i.value=s),!0}const a=o?Number(n)<e.length:re(e,n),l=Reflect.set(e,n,s,Te(e)?e:r);return e===se(r)&&(a?Kt(s,i)&&Et(e,"set",n,s):Et(e,"add",n,s)),l}deleteProperty(e,n){const s=re(e,n);e[n];const r=Reflect.deleteProperty(e,n);return r&&s&&Et(e,"delete",n,void 0),r}has(e,n){const s=Reflect.has(e,n);return(!pt(n)||!Fa.has(n))&&Se(e,"has",n),s}ownKeys(e){return Se(e,"iterate",z(e)?"length":an),Reflect.ownKeys(e)}}class eu extends Va{constructor(e=!1){super(!0,e)}set(e,n){return!0}deleteProperty(e,n){return!0}}const tu=new $a,nu=new eu,su=new $a(!0);const jr=t=>t,Ts=t=>Reflect.getPrototypeOf(t);function ru(t,e,n){return function(...s){const r=this.__v_raw,i=se(r),o=In(i),a=t==="entries"||t===Symbol.iterator&&o,l=t==="keys"&&o,u=r[t](...s),f=n?jr:e?kn:Qe;return!e&&Se(i,"iterate",l?Hr:an),we(Object.create(u),{next(){const{value:d,done:h}=u.next();return h?{value:d,done:h}:{value:a?[f(d[0]),f(d[1])]:f(d),done:h}}})}}function As(t){return function(...e){return t==="delete"?!1:t==="clear"?void 0:this}}function iu(t,e){const n={get(r){const i=this.__v_raw,o=se(i),a=se(r);t||(Kt(r,a)&&Se(o,"get",r),Se(o,"get",a));const{has:l}=Ts(o),u=e?jr:t?kn:Qe;if(l.call(o,r))return u(i.get(r));if(l.call(o,a))return u(i.get(a));i!==o&&i.get(r)},get size(){const r=this.__v_raw;return!t&&Se(se(r),"iterate",an),r.size},has(r){const i=this.__v_raw,o=se(i),a=se(r);return t||(Kt(r,a)&&Se(o,"has",r),Se(o,"has",a)),r===a?i.has(r):i.has(r)||i.has(a)},forEach(r,i){const o=this,a=o.__v_raw,l=se(a),u=e?jr:t?kn:Qe;return!t&&Se(l,"iterate",an),a.forEach((f,d)=>r.call(i,u(f),u(d),o))}};return we(n,t?{add:As("add"),set:As("set"),delete:As("delete"),clear:As("clear")}:{add(r){!e&&!ze(r)&&!Pt(r)&&(r=se(r));const i=se(this);return Ts(i).has.call(i,r)||(i.add(r),Et(i,"add",r,r)),this},set(r,i){!e&&!ze(i)&&!Pt(i)&&(i=se(i));const o=se(this),{has:a,get:l}=Ts(o);let u=a.call(o,r);u||(r=se(r),u=a.call(o,r));const f=l.call(o,r);return o.set(r,i),u?Kt(i,f)&&Et(o,"set",r,i):Et(o,"add",r,i),this},delete(r){const i=se(this),{has:o,get:a}=Ts(i);let l=o.call(i,r);l||(r=se(r),l=o.call(i,r)),a&&a.call(i,r);const u=i.delete(r);return l&&Et(i,"delete",r,void 0),u},clear(){const r=se(this),i=r.size!==0,o=r.clear();return i&&Et(r,"clear",void 0,void 0),o}}),["keys","values","entries",Symbol.iterator].forEach(r=>{n[r]=ru(r,t,e)}),n}function Ei(t,e){const n=iu(t,e);return(s,r,i)=>r==="__v_isReactive"?!t:r==="__v_isReadonly"?t:r==="__v_raw"?s:Reflect.get(re(n,r)&&r in s?n:s,r,i)}const ou={get:Ei(!1,!1)},au={get:Ei(!1,!0)},lu={get:Ei(!0,!1)};const Ba=new WeakMap,Ha=new WeakMap,ja=new WeakMap,cu=new WeakMap;function uu(t){switch(t){case"Object":case"Array":return 1;case"Map":case"Set":case"WeakMap":case"WeakSet":return 2;default:return 0}}function du(t){return t.__v_skip||!Object.isExtensible(t)?0:uu(Mc(t))}function Oe(t){return Pt(t)?t:Ii(t,!1,tu,ou,Ba)}function Wa(t){return Ii(t,!1,su,au,Ha)}function Wr(t){return Ii(t,!0,nu,lu,ja)}function Ii(t,e,n,s,r){if(!ae(t)||t.__v_raw&&!(e&&t.__v_isReactive))return t;const i=du(t);if(i===0)return t;const o=r.get(t);if(o)return o;const a=new Proxy(t,i===2?s:n);return r.set(t,a),a}function ln(t){return Pt(t)?ln(t.__v_raw):!!(t&&t.__v_isReactive)}function Pt(t){return!!(t&&t.__v_isReadonly)}function ze(t){return!!(t&&t.__v_isShallow)}function wi(t){return t?!!t.__v_raw:!1}function se(t){const e=t&&t.__v_raw;return e?se(e):t}function fu(t){return!re(t,"__v_skip")&&Object.isExtensible(t)&&Ta(t,"__v_skip",!0),t}const Qe=t=>ae(t)?Oe(t):t,kn=t=>ae(t)?Wr(t):t;function Te(t){return t?t.__v_isRef===!0:!1}function ie(t){return Ka(t,!1)}function hu(t){return Ka(t,!0)}function Ka(t,e){return Te(t)?t:new pu(t,e)}class pu{constructor(e,n){this.dep=new bi,this.__v_isRef=!0,this.__v_isShallow=!1,this._rawValue=n?e:se(e),this._value=n?e:Qe(e),this.__v_isShallow=n}get value(){return this.dep.track(),this._value}set value(e){const n=this._rawValue,s=this.__v_isShallow||ze(e)||Pt(e);e=s?e:se(e),Kt(e,n)&&(this._rawValue=e,this._value=s?e:Qe(e),this.dep.trigger())}}function wn(t){return Te(t)?t.value:t}const mu={get:(t,e,n)=>e==="__v_raw"?t:wn(Reflect.get(t,e,n)),set:(t,e,n,s)=>{const r=t[e];return Te(r)&&!Te(n)?(r.value=n,!0):Reflect.set(t,e,n,s)}};function Ga(t){return ln(t)?t:new Proxy(t,mu)}class gu{constructor(e,n,s){this.fn=e,this.setter=n,this._value=void 0,this.dep=new bi(this),this.__v_isRef=!0,this.deps=void 0,this.depsTail=void 0,this.flags=16,this.globalVersion=os-1,this.next=void 0,this.effect=this,this.__v_isReadonly=!n,this.isSSR=s}notify(){if(this.flags|=16,!(this.flags&8)&&he!==this)return Na(this,!0),!0}get value(){const e=this.dep.track();return La(this),e&&(e.version=this.dep.version),this._value}set value(e){this.setter&&this.setter(e)}}function _u(t,e,n=!1){let s,r;return J(t)?s=t:(s=t.get,r=t.set),new gu(s,r,n)}const Rs={},$s=new WeakMap;let nn;function yu(t,e=!1,n=nn){if(n){let s=$s.get(n);s||$s.set(n,s=[]),s.push(t)}}function vu(t,e,n=de){const{immediate:s,deep:r,once:i,scheduler:o,augmentJob:a,call:l}=n,u=B=>r?B:ze(B)||r===!1||r===0?It(B,1):It(B);let f,d,h,g,v=!1,E=!1;if(Te(t)?(d=()=>t.value,v=ze(t)):ln(t)?(d=()=>u(t),v=!0):z(t)?(E=!0,v=t.some(B=>ln(B)||ze(B)),d=()=>t.map(B=>{if(Te(B))return B.value;if(ln(B))return u(B);if(J(B))return l?l(B,2):B()})):J(t)?e?d=l?()=>l(t,2):t:d=()=>{if(h){At();try{h()}finally{Rt()}}const B=nn;nn=f;try{return l?l(t,3,[g]):t(g)}finally{nn=B}}:d=dt,e&&r){const B=d,ee=r===!0?1/0:r;d=()=>It(B(),ee)}const O=zc(),I=()=>{f.stop(),O&&O.active&&hi(O.effects,f)};if(i&&e){const B=e;e=(...ee)=>{B(...ee),I()}}let C=E?new Array(t.length).fill(Rs):Rs;const U=B=>{if(!(!(f.flags&1)||!f.dirty&&!B))if(e){const ee=f.run();if(r||v||(E?ee.some((K,b)=>Kt(K,C[b])):Kt(ee,C))){h&&h();const K=nn;nn=f;try{const b=[ee,C===Rs?void 0:E&&C[0]===Rs?[]:C,g];C=ee,l?l(e,3,b):e(...b)}finally{nn=K}}}else f.run()};return a&&a(U),f=new ka(d),f.scheduler=o?()=>o(U,!1):U,g=B=>yu(B,!1,f),h=f.onStop=()=>{const B=$s.get(f);if(B){if(l)l(B,4);else for(const ee of B)ee();$s.delete(f)}},e?s?U(!0):C=f.run():o?o(U.bind(null,!0),!0):f.run(),I.pause=f.pause.bind(f),I.resume=f.resume.bind(f),I.stop=I,I}function It(t,e=1/0,n){if(e<=0||!ae(t)||t.__v_skip||(n=n||new Map,(n.get(t)||0)>=e))return t;if(n.set(t,e),e--,Te(t))It(t.value,e,n);else if(z(t))for(let s=0;s<t.length;s++)It(t[s],e,n);else if(Fn(t)||In(t))t.forEach(s=>{It(s,e,n)});else if(Ca(t)){for(const s in t)It(t[s],e,n);for(const s of Object.getOwnPropertySymbols(t))Object.prototype.propertyIsEnumerable.call(t,s)&&It(t[s],e,n)}return t}/**
* @vue/runtime-core v3.5.29
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/function ys(t,e,n,s){try{return s?t(...s):t()}catch(r){ar(r,e,n)}}function mt(t,e,n,s){if(J(t)){const r=ys(t,e,n,s);return r&&wa(r)&&r.catch(i=>{ar(i,e,n)}),r}if(z(t)){const r=[];for(let i=0;i<t.length;i++)r.push(mt(t[i],e,n,s));return r}}function ar(t,e,n,s=!0){const r=e?e.vnode:null,{errorHandler:i,throwUnhandledErrorInProduction:o}=e&&e.appContext.config||de;if(e){let a=e.parent;const l=e.proxy,u=`https://vuejs.org/error-reference/#runtime-${n}`;for(;a;){const f=a.ec;if(f){for(let d=0;d<f.length;d++)if(f[d](t,l,u)===!1)return}a=a.parent}if(i){At(),ys(i,null,10,[t,l,u]),Rt();return}}bu(t,n,r,s,o)}function bu(t,e,n,s=!0,r=!1){if(r)throw t;console.error(t)}const Pe=[];let lt=-1;const Sn=[];let Ft=null,yn=0;const za=Promise.resolve();let Bs=null;function Si(t){const e=Bs||za;return t?e.then(this?t.bind(this):t):e}function Eu(t){let e=lt+1,n=Pe.length;for(;e<n;){const s=e+n>>>1,r=Pe[s],i=ls(r);i<t||i===t&&r.flags&2?e=s+1:n=s}return e}function Ci(t){if(!(t.flags&1)){const e=ls(t),n=Pe[Pe.length-1];!n||!(t.flags&2)&&e>=ls(n)?Pe.push(t):Pe.splice(Eu(e),0,t),t.flags|=1,qa()}}function qa(){Bs||(Bs=za.then(Ya))}function Iu(t){z(t)?Sn.push(...t):Ft&&t.id===-1?Ft.splice(yn+1,0,t):t.flags&1||(Sn.push(t),t.flags|=1),qa()}function Xi(t,e,n=lt+1){for(;n<Pe.length;n++){const s=Pe[n];if(s&&s.flags&2){if(t&&s.id!==t.uid)continue;Pe.splice(n,1),n--,s.flags&4&&(s.flags&=-2),s(),s.flags&4||(s.flags&=-2)}}}function Ja(t){if(Sn.length){const e=[...new Set(Sn)].sort((n,s)=>ls(n)-ls(s));if(Sn.length=0,Ft){Ft.push(...e);return}for(Ft=e,yn=0;yn<Ft.length;yn++){const n=Ft[yn];n.flags&4&&(n.flags&=-2),n.flags&8||n(),n.flags&=-2}Ft=null,yn=0}}const ls=t=>t.id==null?t.flags&2?-1:1/0:t.id;function Ya(t){try{for(lt=0;lt<Pe.length;lt++){const e=Pe[lt];e&&!(e.flags&8)&&(e.flags&4&&(e.flags&=-2),ys(e,e.i,e.i?15:14),e.flags&4||(e.flags&=-2))}}finally{for(;lt<Pe.length;lt++){const e=Pe[lt];e&&(e.flags&=-2)}lt=-1,Pe.length=0,Ja(),Bs=null,(Pe.length||Sn.length)&&Ya()}}let Be=null,Xa=null;function Hs(t){const e=Be;return Be=t,Xa=t&&t.type.__scopeId||null,e}function sn(t,e=Be,n){if(!e||t._n)return t;const s=(...r)=>{s._d&&Ks(-1);const i=Hs(e);let o;try{o=t(...r)}finally{Hs(i),s._d&&Ks(1)}return o};return s._n=!0,s._c=!0,s._d=!0,s}function X(t,e){if(Be===null)return t;const n=dr(Be),s=t.dirs||(t.dirs=[]);for(let r=0;r<e.length;r++){let[i,o,a,l=de]=e[r];i&&(J(i)&&(i={mounted:i,updated:i}),i.deep&&It(o),s.push({dir:i,instance:n,value:o,oldValue:void 0,arg:a,modifiers:l}))}return t}function en(t,e,n,s){const r=t.dirs,i=e&&e.dirs;for(let o=0;o<r.length;o++){const a=r[o];i&&(a.oldValue=i[o].value);let l=a.dir[s];l&&(At(),mt(l,n,8,[t.el,a,t,e]),Rt())}}function Ns(t,e){if(Ce){let n=Ce.provides;const s=Ce.parent&&Ce.parent.provides;s===n&&(n=Ce.provides=Object.create(s)),n[t]=e}}function Xe(t,e,n=!1){const s=wd();if(s||Cn){let r=Cn?Cn._context.provides:s?s.parent==null||s.ce?s.vnode.appContext&&s.vnode.appContext.provides:s.parent.provides:void 0;if(r&&t in r)return r[t];if(arguments.length>1)return n&&J(e)?e.call(s&&s.proxy):e}}const wu=Symbol.for("v-scx"),Su=()=>Xe(wu);function Ct(t,e,n){return Qa(t,e,n)}function Qa(t,e,n=de){const{immediate:s,deep:r,flush:i,once:o}=n,a=we({},n),l=e&&s||!e&&i!=="post";let u;if(us){if(i==="sync"){const g=Su();u=g.__watcherHandles||(g.__watcherHandles=[])}else if(!l){const g=()=>{};return g.stop=dt,g.resume=dt,g.pause=dt,g}}const f=Ce;a.call=(g,v,E)=>mt(g,f,v,E);let d=!1;i==="post"?a.scheduler=g=>{Me(g,f&&f.suspense)}:i!=="sync"&&(d=!0,a.scheduler=(g,v)=>{v?g():Ci(g)}),a.augmentJob=g=>{e&&(g.flags|=4),d&&(g.flags|=2,f&&(g.id=f.uid,g.i=f))};const h=vu(t,e,a);return us&&(u?u.push(h):l&&h()),h}function Cu(t,e,n){const s=this.proxy,r=ve(t)?t.includes(".")?Za(s,t):()=>s[t]:t.bind(s,s);let i;J(e)?i=e:(i=e.handler,n=e);const o=vs(this),a=Qa(r,i.bind(s),n);return o(),a}function Za(t,e){const n=e.split(".");return()=>{let s=t;for(let r=0;r<n.length&&s;r++)s=s[n[r]];return s}}const Tu=Symbol("_vte"),Au=t=>t.__isTeleport,Ru=Symbol("_leaveCb");function Ti(t,e){t.shapeFlag&6&&t.component?(t.transition=e,Ti(t.component.subTree,e)):t.shapeFlag&128?(t.ssContent.transition=e.clone(t.ssContent),t.ssFallback.transition=e.clone(t.ssFallback)):t.transition=e}function el(t,e){return J(t)?we({name:t.name},e,{setup:t}):t}function tl(t){t.ids=[t.ids[0]+t.ids[2]+++"-",0,0]}function Qi(t,e){let n;return!!((n=Object.getOwnPropertyDescriptor(t,e))&&!n.configurable)}const js=new WeakMap;function Zn(t,e,n,s,r=!1){if(z(t)){t.forEach((E,O)=>Zn(E,e&&(z(e)?e[O]:e),n,s,r));return}if(es(s)&&!r){s.shapeFlag&512&&s.type.__asyncResolved&&s.component.subTree.component&&Zn(t,e,n,s.component.subTree);return}const i=s.shapeFlag&4?dr(s.component):s.el,o=r?null:i,{i:a,r:l}=t,u=e&&e.r,f=a.refs===de?a.refs={}:a.refs,d=a.setupState,h=se(d),g=d===de?Ia:E=>Qi(f,E)?!1:re(h,E),v=(E,O)=>!(O&&Qi(f,O));if(u!=null&&u!==l){if(Zi(e),ve(u))f[u]=null,g(u)&&(d[u]=null);else if(Te(u)){const E=e;v(u,E.k)&&(u.value=null),E.k&&(f[E.k]=null)}}if(J(l))ys(l,a,12,[o,f]);else{const E=ve(l),O=Te(l);if(E||O){const I=()=>{if(t.f){const C=E?g(l)?d[l]:f[l]:v()||!t.k?l.value:f[t.k];if(r)z(C)&&hi(C,i);else if(z(C))C.includes(i)||C.push(i);else if(E)f[l]=[i],g(l)&&(d[l]=f[l]);else{const U=[i];v(l,t.k)&&(l.value=U),t.k&&(f[t.k]=U)}}else E?(f[l]=o,g(l)&&(d[l]=o)):O&&(v(l,t.k)&&(l.value=o),t.k&&(f[t.k]=o))};if(o){const C=()=>{I(),js.delete(t)};C.id=-1,js.set(t,C),Me(C,n)}else Zi(t),I()}}}function Zi(t){const e=js.get(t);e&&(e.flags|=8,js.delete(t))}ir().requestIdleCallback;ir().cancelIdleCallback;const es=t=>!!t.type.__asyncLoader,nl=t=>t.type.__isKeepAlive;function Pu(t,e){sl(t,"a",e)}function ku(t,e){sl(t,"da",e)}function sl(t,e,n=Ce){const s=t.__wdc||(t.__wdc=()=>{let r=n;for(;r;){if(r.isDeactivated)return;r=r.parent}return t()});if(lr(e,s,n),n){let r=n.parent;for(;r&&r.parent;)nl(r.parent.vnode)&&Ou(s,e,n,r),r=r.parent}}function Ou(t,e,n,s){const r=lr(e,t,s,!0);rl(()=>{hi(s[e],r)},n)}function lr(t,e,n=Ce,s=!1){if(n){const r=n[t]||(n[t]=[]),i=e.__weh||(e.__weh=(...o)=>{At();const a=vs(n),l=mt(e,n,t,o);return a(),Rt(),l});return s?r.unshift(i):r.push(i),i}}const Nt=t=>(e,n=Ce)=>{(!us||t==="sp")&&lr(t,(...s)=>e(...s),n)},Nu=Nt("bm"),fn=Nt("m"),Du=Nt("bu"),xu=Nt("u"),Lu=Nt("bum"),rl=Nt("um"),Mu=Nt("sp"),Uu=Nt("rtg"),Fu=Nt("rtc");function Vu(t,e=Ce){lr("ec",t,e)}const $u="components";function Kr(t,e){return Hu($u,t,!0,e)||t}const Bu=Symbol.for("v-ndc");function Hu(t,e,n=!0,s=!1){const r=Be||Ce;if(r){const i=r.type;{const a=Rd(i,!1);if(a&&(a===e||a===qe(e)||a===sr(qe(e))))return i}const o=eo(r[t]||i[t],e)||eo(r.appContext[t],e);return!o&&s?i:o}}function eo(t,e){return t&&(t[e]||t[qe(e)]||t[sr(qe(e))])}function ue(t,e,n,s){let r;const i=n,o=z(t);if(o||ve(t)){const a=o&&ln(t);let l=!1,u=!1;a&&(l=!ze(t),u=Pt(t),t=or(t)),r=new Array(t.length);for(let f=0,d=t.length;f<d;f++)r[f]=e(l?u?kn(Qe(t[f])):Qe(t[f]):t[f],f,void 0,i)}else if(typeof t=="number"){r=new Array(t);for(let a=0;a<t;a++)r[a]=e(a+1,a,void 0,i)}else if(ae(t))if(t[Symbol.iterator])r=Array.from(t,(a,l)=>e(a,l,void 0,i));else{const a=Object.keys(t);r=new Array(a.length);for(let l=0,u=a.length;l<u;l++){const f=a[l];r[l]=e(t[f],f,l,i)}}else r=[];return r}const Gr=t=>t?Cl(t)?dr(t):Gr(t.parent):null,ts=we(Object.create(null),{$:t=>t,$el:t=>t.vnode.el,$data:t=>t.data,$props:t=>t.props,$attrs:t=>t.attrs,$slots:t=>t.slots,$refs:t=>t.refs,$parent:t=>Gr(t.parent),$root:t=>Gr(t.root),$host:t=>t.ce,$emit:t=>t.emit,$options:t=>ol(t),$forceUpdate:t=>t.f||(t.f=()=>{Ci(t.update)}),$nextTick:t=>t.n||(t.n=Si.bind(t.proxy)),$watch:t=>Cu.bind(t)}),Cr=(t,e)=>t!==de&&!t.__isScriptSetup&&re(t,e),ju={get({_:t},e){if(e==="__v_skip")return!0;const{ctx:n,setupState:s,data:r,props:i,accessCache:o,type:a,appContext:l}=t;if(e[0]!=="$"){const h=o[e];if(h!==void 0)switch(h){case 1:return s[e];case 2:return r[e];case 4:return n[e];case 3:return i[e]}else{if(Cr(s,e))return o[e]=1,s[e];if(r!==de&&re(r,e))return o[e]=2,r[e];if(re(i,e))return o[e]=3,i[e];if(n!==de&&re(n,e))return o[e]=4,n[e];zr&&(o[e]=0)}}const u=ts[e];let f,d;if(u)return e==="$attrs"&&Se(t.attrs,"get",""),u(t);if((f=a.__cssModules)&&(f=f[e]))return f;if(n!==de&&re(n,e))return o[e]=4,n[e];if(d=l.config.globalProperties,re(d,e))return d[e]},set({_:t},e,n){const{data:s,setupState:r,ctx:i}=t;return Cr(r,e)?(r[e]=n,!0):s!==de&&re(s,e)?(s[e]=n,!0):re(t.props,e)||e[0]==="$"&&e.slice(1)in t?!1:(i[e]=n,!0)},has({_:{data:t,setupState:e,accessCache:n,ctx:s,appContext:r,props:i,type:o}},a){let l;return!!(n[a]||t!==de&&a[0]!=="$"&&re(t,a)||Cr(e,a)||re(i,a)||re(s,a)||re(ts,a)||re(r.config.globalProperties,a)||(l=o.__cssModules)&&l[a])},defineProperty(t,e,n){return n.get!=null?t._.accessCache[e]=0:re(n,"value")&&this.set(t,e,n.value,null),Reflect.defineProperty(t,e,n)}};function to(t){return z(t)?t.reduce((e,n)=>(e[n]=null,e),{}):t}let zr=!0;function Wu(t){const e=ol(t),n=t.proxy,s=t.ctx;zr=!1,e.beforeCreate&&no(e.beforeCreate,t,"bc");const{data:r,computed:i,methods:o,watch:a,provide:l,inject:u,created:f,beforeMount:d,mounted:h,beforeUpdate:g,updated:v,activated:E,deactivated:O,beforeDestroy:I,beforeUnmount:C,destroyed:U,unmounted:B,render:ee,renderTracked:K,renderTriggered:b,errorCaptured:y,serverPrefetch:k,expose:Fe,inheritAttrs:tt,components:Qt,directives:nt,filters:Hn}=e;if(u&&Ku(u,s,null),o)for(const le in o){const te=o[le];J(te)&&(s[le]=te.bind(n))}if(r){const le=r.call(n,n);ae(le)&&(t.data=Oe(le))}if(zr=!0,i)for(const le in i){const te=i[le],gt=J(te)?te.bind(n,n):J(te.get)?te.get.bind(n,n):dt,xt=!J(te)&&J(te.set)?te.set.bind(n):dt,st=ke({get:gt,set:xt});Object.defineProperty(s,le,{enumerable:!0,configurable:!0,get:()=>st.value,set:De=>st.value=De})}if(a)for(const le in a)il(a[le],s,n,le);if(l){const le=J(l)?l.call(n):l;Reflect.ownKeys(le).forEach(te=>{Ns(te,le[te])})}f&&no(f,t,"c");function Ie(le,te){z(te)?te.forEach(gt=>le(gt.bind(n))):te&&le(te.bind(n))}if(Ie(Nu,d),Ie(fn,h),Ie(Du,g),Ie(xu,v),Ie(Pu,E),Ie(ku,O),Ie(Vu,y),Ie(Fu,K),Ie(Uu,b),Ie(Lu,C),Ie(rl,B),Ie(Mu,k),z(Fe))if(Fe.length){const le=t.exposed||(t.exposed={});Fe.forEach(te=>{Object.defineProperty(le,te,{get:()=>n[te],set:gt=>n[te]=gt,enumerable:!0})})}else t.exposed||(t.exposed={});ee&&t.render===dt&&(t.render=ee),tt!=null&&(t.inheritAttrs=tt),Qt&&(t.components=Qt),nt&&(t.directives=nt),k&&tl(t)}function Ku(t,e,n=dt){z(t)&&(t=qr(t));for(const s in t){const r=t[s];let i;ae(r)?"default"in r?i=Xe(r.from||s,r.default,!0):i=Xe(r.from||s):i=Xe(r),Te(i)?Object.defineProperty(e,s,{enumerable:!0,configurable:!0,get:()=>i.value,set:o=>i.value=o}):e[s]=i}}function no(t,e,n){mt(z(t)?t.map(s=>s.bind(e.proxy)):t.bind(e.proxy),e,n)}function il(t,e,n,s){let r=s.includes(".")?Za(n,s):()=>n[s];if(ve(t)){const i=e[t];J(i)&&Ct(r,i)}else if(J(t))Ct(r,t.bind(n));else if(ae(t))if(z(t))t.forEach(i=>il(i,e,n,s));else{const i=J(t.handler)?t.handler.bind(n):e[t.handler];J(i)&&Ct(r,i,t)}}function ol(t){const e=t.type,{mixins:n,extends:s}=e,{mixins:r,optionsCache:i,config:{optionMergeStrategies:o}}=t.appContext,a=i.get(e);let l;return a?l=a:!r.length&&!n&&!s?l=e:(l={},r.length&&r.forEach(u=>Ws(l,u,o,!0)),Ws(l,e,o)),ae(e)&&i.set(e,l),l}function Ws(t,e,n,s=!1){const{mixins:r,extends:i}=e;i&&Ws(t,i,n,!0),r&&r.forEach(o=>Ws(t,o,n,!0));for(const o in e)if(!(s&&o==="expose")){const a=Gu[o]||n&&n[o];t[o]=a?a(t[o],e[o]):e[o]}return t}const Gu={data:so,props:ro,emits:ro,methods:zn,computed:zn,beforeCreate:Ae,created:Ae,beforeMount:Ae,mounted:Ae,beforeUpdate:Ae,updated:Ae,beforeDestroy:Ae,beforeUnmount:Ae,destroyed:Ae,unmounted:Ae,activated:Ae,deactivated:Ae,errorCaptured:Ae,serverPrefetch:Ae,components:zn,directives:zn,watch:qu,provide:so,inject:zu};function so(t,e){return e?t?function(){return we(J(t)?t.call(this,this):t,J(e)?e.call(this,this):e)}:e:t}function zu(t,e){return zn(qr(t),qr(e))}function qr(t){if(z(t)){const e={};for(let n=0;n<t.length;n++)e[t[n]]=t[n];return e}return t}function Ae(t,e){return t?[...new Set([].concat(t,e))]:e}function zn(t,e){return t?we(Object.create(null),t,e):e}function ro(t,e){return t?z(t)&&z(e)?[...new Set([...t,...e])]:we(Object.create(null),to(t),to(e??{})):e}function qu(t,e){if(!t)return e;if(!e)return t;const n=we(Object.create(null),t);for(const s in e)n[s]=Ae(t[s],e[s]);return n}function al(){return{app:null,config:{isNativeTag:Ia,performance:!1,globalProperties:{},optionMergeStrategies:{},errorHandler:void 0,warnHandler:void 0,compilerOptions:{}},mixins:[],components:{},directives:{},provides:Object.create(null),optionsCache:new WeakMap,propsCache:new WeakMap,emitsCache:new WeakMap}}let Ju=0;function Yu(t,e){return function(s,r=null){J(s)||(s=we({},s)),r!=null&&!ae(r)&&(r=null);const i=al(),o=new WeakSet,a=[];let l=!1;const u=i.app={_uid:Ju++,_component:s,_props:r,_container:null,_context:i,_instance:null,version:kd,get config(){return i.config},set config(f){},use(f,...d){return o.has(f)||(f&&J(f.install)?(o.add(f),f.install(u,...d)):J(f)&&(o.add(f),f(u,...d))),u},mixin(f){return i.mixins.includes(f)||i.mixins.push(f),u},component(f,d){return d?(i.components[f]=d,u):i.components[f]},directive(f,d){return d?(i.directives[f]=d,u):i.directives[f]},mount(f,d,h){if(!l){const g=u._ceVNode||pe(s,r);return g.appContext=i,h===!0?h="svg":h===!1&&(h=void 0),t(g,f,h),l=!0,u._container=f,f.__vue_app__=u,dr(g.component)}},onUnmount(f){a.push(f)},unmount(){l&&(mt(a,u._instance,16),t(null,u._container),delete u._container.__vue_app__)},provide(f,d){return i.provides[f]=d,u},runWithContext(f){const d=Cn;Cn=u;try{return f()}finally{Cn=d}}};return u}}let Cn=null;const Xu=(t,e)=>e==="modelValue"||e==="model-value"?t.modelModifiers:t[`${e}Modifiers`]||t[`${qe(e)}Modifiers`]||t[`${dn(e)}Modifiers`];function Qu(t,e,...n){if(t.isUnmounted)return;const s=t.vnode.props||de;let r=n;const i=e.startsWith("update:"),o=i&&Xu(s,e.slice(7));o&&(o.trim&&(r=n.map(f=>ve(f)?f.trim():f)),o.number&&(r=n.map(rr)));let a,l=s[a=br(e)]||s[a=br(qe(e))];!l&&i&&(l=s[a=br(dn(e))]),l&&mt(l,t,6,r);const u=s[a+"Once"];if(u){if(!t.emitted)t.emitted={};else if(t.emitted[a])return;t.emitted[a]=!0,mt(u,t,6,r)}}const Zu=new WeakMap;function ll(t,e,n=!1){const s=n?Zu:e.emitsCache,r=s.get(t);if(r!==void 0)return r;const i=t.emits;let o={},a=!1;if(!J(t)){const l=u=>{const f=ll(u,e,!0);f&&(a=!0,we(o,f))};!n&&e.mixins.length&&e.mixins.forEach(l),t.extends&&l(t.extends),t.mixins&&t.mixins.forEach(l)}return!i&&!a?(ae(t)&&s.set(t,null),null):(z(i)?i.forEach(l=>o[l]=null):we(o,i),ae(t)&&s.set(t,o),o)}function cr(t,e){return!t||!tr(e)?!1:(e=e.slice(2).replace(/Once$/,""),re(t,e[0].toLowerCase()+e.slice(1))||re(t,dn(e))||re(t,e))}function io(t){const{type:e,vnode:n,proxy:s,withProxy:r,propsOptions:[i],slots:o,attrs:a,emit:l,render:u,renderCache:f,props:d,data:h,setupState:g,ctx:v,inheritAttrs:E}=t,O=Hs(t);let I,C;try{if(n.shapeFlag&4){const B=r||s,ee=B;I=ct(u.call(ee,B,f,d,g,h,v)),C=a}else{const B=e;I=ct(B.length>1?B(d,{attrs:a,slots:o,emit:l}):B(d,null)),C=e.props?a:ed(a)}}catch(B){ns.length=0,ar(B,t,1),I=pe(Jt)}let U=I;if(C&&E!==!1){const B=Object.keys(C),{shapeFlag:ee}=U;B.length&&ee&7&&(i&&B.some(fi)&&(C=td(C,i)),U=On(U,C,!1,!0))}return n.dirs&&(U=On(U,null,!1,!0),U.dirs=U.dirs?U.dirs.concat(n.dirs):n.dirs),n.transition&&Ti(U,n.transition),I=U,Hs(O),I}const ed=t=>{let e;for(const n in t)(n==="class"||n==="style"||tr(n))&&((e||(e={}))[n]=t[n]);return e},td=(t,e)=>{const n={};for(const s in t)(!fi(s)||!(s.slice(9)in e))&&(n[s]=t[s]);return n};function nd(t,e,n){const{props:s,children:r,component:i}=t,{props:o,children:a,patchFlag:l}=e,u=i.emitsOptions;if(e.dirs||e.transition)return!0;if(n&&l>=0){if(l&1024)return!0;if(l&16)return s?oo(s,o,u):!!o;if(l&8){const f=e.dynamicProps;for(let d=0;d<f.length;d++){const h=f[d];if(cl(o,s,h)&&!cr(u,h))return!0}}}else return(r||a)&&(!a||!a.$stable)?!0:s===o?!1:s?o?oo(s,o,u):!0:!!o;return!1}function oo(t,e,n){const s=Object.keys(e);if(s.length!==Object.keys(t).length)return!0;for(let r=0;r<s.length;r++){const i=s[r];if(cl(e,t,i)&&!cr(n,i))return!0}return!1}function cl(t,e,n){const s=t[n],r=e[n];return n==="style"&&ae(s)&&ae(r)?!Vn(s,r):s!==r}function sd({vnode:t,parent:e},n){for(;e;){const s=e.subTree;if(s.suspense&&s.suspense.activeBranch===t&&(s.el=t.el),s===t)(t=e.vnode).el=n,e=e.parent;else break}}const ul={},dl=()=>Object.create(ul),fl=t=>Object.getPrototypeOf(t)===ul;function rd(t,e,n,s=!1){const r={},i=dl();t.propsDefaults=Object.create(null),hl(t,e,r,i);for(const o in t.propsOptions[0])o in r||(r[o]=void 0);n?t.props=s?r:Wa(r):t.type.props?t.props=r:t.props=i,t.attrs=i}function id(t,e,n,s){const{props:r,attrs:i,vnode:{patchFlag:o}}=t,a=se(r),[l]=t.propsOptions;let u=!1;if((s||o>0)&&!(o&16)){if(o&8){const f=t.vnode.dynamicProps;for(let d=0;d<f.length;d++){let h=f[d];if(cr(t.emitsOptions,h))continue;const g=e[h];if(l)if(re(i,h))g!==i[h]&&(i[h]=g,u=!0);else{const v=qe(h);r[v]=Jr(l,a,v,g,t,!1)}else g!==i[h]&&(i[h]=g,u=!0)}}}else{hl(t,e,r,i)&&(u=!0);let f;for(const d in a)(!e||!re(e,d)&&((f=dn(d))===d||!re(e,f)))&&(l?n&&(n[d]!==void 0||n[f]!==void 0)&&(r[d]=Jr(l,a,d,void 0,t,!0)):delete r[d]);if(i!==a)for(const d in i)(!e||!re(e,d))&&(delete i[d],u=!0)}u&&Et(t.attrs,"set","")}function hl(t,e,n,s){const[r,i]=t.propsOptions;let o=!1,a;if(e)for(let l in e){if(Yn(l))continue;const u=e[l];let f;r&&re(r,f=qe(l))?!i||!i.includes(f)?n[f]=u:(a||(a={}))[f]=u:cr(t.emitsOptions,l)||(!(l in s)||u!==s[l])&&(s[l]=u,o=!0)}if(i){const l=se(n),u=a||de;for(let f=0;f<i.length;f++){const d=i[f];n[d]=Jr(r,l,d,u[d],t,!re(u,d))}}return o}function Jr(t,e,n,s,r,i){const o=t[n];if(o!=null){const a=re(o,"default");if(a&&s===void 0){const l=o.default;if(o.type!==Function&&!o.skipFactory&&J(l)){const{propsDefaults:u}=r;if(n in u)s=u[n];else{const f=vs(r);s=u[n]=l.call(null,e),f()}}else s=l;r.ce&&r.ce._setProp(n,s)}o[0]&&(i&&!a?s=!1:o[1]&&(s===""||s===dn(n))&&(s=!0))}return s}const od=new WeakMap;function pl(t,e,n=!1){const s=n?od:e.propsCache,r=s.get(t);if(r)return r;const i=t.props,o={},a=[];let l=!1;if(!J(t)){const f=d=>{l=!0;const[h,g]=pl(d,e,!0);we(o,h),g&&a.push(...g)};!n&&e.mixins.length&&e.mixins.forEach(f),t.extends&&f(t.extends),t.mixins&&t.mixins.forEach(f)}if(!i&&!l)return ae(t)&&s.set(t,En),En;if(z(i))for(let f=0;f<i.length;f++){const d=qe(i[f]);ao(d)&&(o[d]=de)}else if(i)for(const f in i){const d=qe(f);if(ao(d)){const h=i[f],g=o[d]=z(h)||J(h)?{type:h}:we({},h),v=g.type;let E=!1,O=!0;if(z(v))for(let I=0;I<v.length;++I){const C=v[I],U=J(C)&&C.name;if(U==="Boolean"){E=!0;break}else U==="String"&&(O=!1)}else E=J(v)&&v.name==="Boolean";g[0]=E,g[1]=O,(E||re(g,"default"))&&a.push(d)}}const u=[o,a];return ae(t)&&s.set(t,u),u}function ao(t){return t[0]!=="$"&&!Yn(t)}const Ai=t=>t==="_"||t==="_ctx"||t==="$stable",Ri=t=>z(t)?t.map(ct):[ct(t)],ad=(t,e,n)=>{if(e._n)return e;const s=sn((...r)=>Ri(e(...r)),n);return s._c=!1,s},ml=(t,e,n)=>{const s=t._ctx;for(const r in t){if(Ai(r))continue;const i=t[r];if(J(i))e[r]=ad(r,i,s);else if(i!=null){const o=Ri(i);e[r]=()=>o}}},gl=(t,e)=>{const n=Ri(e);t.slots.default=()=>n},_l=(t,e,n)=>{for(const s in e)(n||!Ai(s))&&(t[s]=e[s])},ld=(t,e,n)=>{const s=t.slots=dl();if(t.vnode.shapeFlag&32){const r=e._;r?(_l(s,e,n),n&&Ta(s,"_",r,!0)):ml(e,s)}else e&&gl(t,e)},cd=(t,e,n)=>{const{vnode:s,slots:r}=t;let i=!0,o=de;if(s.shapeFlag&32){const a=e._;a?n&&a===1?i=!1:_l(r,e,n):(i=!e.$stable,ml(e,r)),o=e}else e&&(gl(t,e),o={default:1});if(i)for(const a in r)!Ai(a)&&o[a]==null&&delete r[a]},Me=pd;function ud(t){return dd(t)}function dd(t,e){const n=ir();n.__VUE__=!0;const{insert:s,remove:r,patchProp:i,createElement:o,createText:a,createComment:l,setText:u,setElementText:f,parentNode:d,nextSibling:h,setScopeId:g=dt,insertStaticContent:v}=t,E=(p,m,_,w=null,R=null,S=null,x=void 0,D=null,N=!!m.dynamicChildren)=>{if(p===m)return;p&&!Kn(p,m)&&(w=T(p),De(p,R,S,!0),p=null),m.patchFlag===-2&&(N=!1,m.dynamicChildren=null);const{type:P,ref:W,shapeFlag:F}=m;switch(P){case ur:O(p,m,_,w);break;case Jt:I(p,m,_,w);break;case Ds:p==null&&C(m,_,w,x);break;case Y:Qt(p,m,_,w,R,S,x,D,N);break;default:F&1?ee(p,m,_,w,R,S,x,D,N):F&6?nt(p,m,_,w,R,S,x,D,N):(F&64||F&128)&&P.process(p,m,_,w,R,S,x,D,N,H)}W!=null&&R?Zn(W,p&&p.ref,S,m||p,!m):W==null&&p&&p.ref!=null&&Zn(p.ref,null,S,p,!0)},O=(p,m,_,w)=>{if(p==null)s(m.el=a(m.children),_,w);else{const R=m.el=p.el;m.children!==p.children&&u(R,m.children)}},I=(p,m,_,w)=>{p==null?s(m.el=l(m.children||""),_,w):m.el=p.el},C=(p,m,_,w)=>{[p.el,p.anchor]=v(p.children,m,_,w,p.el,p.anchor)},U=({el:p,anchor:m},_,w)=>{let R;for(;p&&p!==m;)R=h(p),s(p,_,w),p=R;s(m,_,w)},B=({el:p,anchor:m})=>{let _;for(;p&&p!==m;)_=h(p),r(p),p=_;r(m)},ee=(p,m,_,w,R,S,x,D,N)=>{if(m.type==="svg"?x="svg":m.type==="math"&&(x="mathml"),p==null)K(m,_,w,R,S,x,D,N);else{const P=p.el&&p.el._isVueCE?p.el:null;try{P&&P._beginPatch(),k(p,m,R,S,x,D,N)}finally{P&&P._endPatch()}}},K=(p,m,_,w,R,S,x,D)=>{let N,P;const{props:W,shapeFlag:F,transition:j,dirs:q}=p;if(N=p.el=o(p.type,S,W&&W.is,W),F&8?f(N,p.children):F&16&&y(p.children,N,null,w,R,Tr(p,S),x,D),q&&en(p,null,w,"created"),b(N,p,p.scopeId,x,w),W){for(const fe in W)fe!=="value"&&!Yn(fe)&&i(N,fe,null,W[fe],S,w);"value"in W&&i(N,"value",null,W.value,S),(P=W.onVnodeBeforeMount)&&at(P,w,p)}q&&en(p,null,w,"beforeMount");const Z=fd(R,j);Z&&j.beforeEnter(N),s(N,m,_),((P=W&&W.onVnodeMounted)||Z||q)&&Me(()=>{P&&at(P,w,p),Z&&j.enter(N),q&&en(p,null,w,"mounted")},R)},b=(p,m,_,w,R)=>{if(_&&g(p,_),w)for(let S=0;S<w.length;S++)g(p,w[S]);if(R){let S=R.subTree;if(m===S||El(S.type)&&(S.ssContent===m||S.ssFallback===m)){const x=R.vnode;b(p,x,x.scopeId,x.slotScopeIds,R.parent)}}},y=(p,m,_,w,R,S,x,D,N=0)=>{for(let P=N;P<p.length;P++){const W=p[P]=D?bt(p[P]):ct(p[P]);E(null,W,m,_,w,R,S,x,D)}},k=(p,m,_,w,R,S,x)=>{const D=m.el=p.el;let{patchFlag:N,dynamicChildren:P,dirs:W}=m;N|=p.patchFlag&16;const F=p.props||de,j=m.props||de;let q;if(_&&tn(_,!1),(q=j.onVnodeBeforeUpdate)&&at(q,_,m,p),W&&en(m,p,_,"beforeUpdate"),_&&tn(_,!0),(F.innerHTML&&j.innerHTML==null||F.textContent&&j.textContent==null)&&f(D,""),P?Fe(p.dynamicChildren,P,D,_,w,Tr(m,R),S):x||te(p,m,D,null,_,w,Tr(m,R),S,!1),N>0){if(N&16)tt(D,F,j,_,R);else if(N&2&&F.class!==j.class&&i(D,"class",null,j.class,R),N&4&&i(D,"style",F.style,j.style,R),N&8){const Z=m.dynamicProps;for(let fe=0;fe<Z.length;fe++){const oe=Z[fe],xe=F[oe],Le=j[oe];(Le!==xe||oe==="value")&&i(D,oe,xe,Le,R,_)}}N&1&&p.children!==m.children&&f(D,m.children)}else!x&&P==null&&tt(D,F,j,_,R);((q=j.onVnodeUpdated)||W)&&Me(()=>{q&&at(q,_,m,p),W&&en(m,p,_,"updated")},w)},Fe=(p,m,_,w,R,S,x)=>{for(let D=0;D<m.length;D++){const N=p[D],P=m[D],W=N.el&&(N.type===Y||!Kn(N,P)||N.shapeFlag&198)?d(N.el):_;E(N,P,W,null,w,R,S,x,!0)}},tt=(p,m,_,w,R)=>{if(m!==_){if(m!==de)for(const S in m)!Yn(S)&&!(S in _)&&i(p,S,m[S],null,R,w);for(const S in _){if(Yn(S))continue;const x=_[S],D=m[S];x!==D&&S!=="value"&&i(p,S,D,x,R,w)}"value"in _&&i(p,"value",m.value,_.value,R)}},Qt=(p,m,_,w,R,S,x,D,N)=>{const P=m.el=p?p.el:a(""),W=m.anchor=p?p.anchor:a("");let{patchFlag:F,dynamicChildren:j,slotScopeIds:q}=m;q&&(D=D?D.concat(q):q),p==null?(s(P,_,w),s(W,_,w),y(m.children||[],_,W,R,S,x,D,N)):F>0&&F&64&&j&&p.dynamicChildren&&p.dynamicChildren.length===j.length?(Fe(p.dynamicChildren,j,_,R,S,x,D),(m.key!=null||R&&m===R.subTree)&&yl(p,m,!0)):te(p,m,_,W,R,S,x,D,N)},nt=(p,m,_,w,R,S,x,D,N)=>{m.slotScopeIds=D,p==null?m.shapeFlag&512?R.ctx.activate(m,_,w,x,N):Hn(m,_,w,R,S,x,N):pn(p,m,N)},Hn=(p,m,_,w,R,S,x)=>{const D=p.component=Id(p,w,R);if(nl(p)&&(D.ctx.renderer=H),Sd(D,!1,x),D.asyncDep){if(R&&R.registerDep(D,Ie,x),!p.el){const N=D.subTree=pe(Jt);I(null,N,m,_),p.placeholder=N.el}}else Ie(D,p,m,_,R,S,x)},pn=(p,m,_)=>{const w=m.component=p.component;if(nd(p,m,_))if(w.asyncDep&&!w.asyncResolved){le(w,m,_);return}else w.next=m,w.update();else m.el=p.el,w.vnode=m},Ie=(p,m,_,w,R,S,x)=>{const D=()=>{if(p.isMounted){let{next:F,bu:j,u:q,parent:Z,vnode:fe}=p;{const it=vl(p);if(it){F&&(F.el=fe.el,le(p,F,x)),it.asyncDep.then(()=>{Me(()=>{p.isUnmounted||P()},R)});return}}let oe=F,xe;tn(p,!1),F?(F.el=fe.el,le(p,F,x)):F=fe,j&&Os(j),(xe=F.props&&F.props.onVnodeBeforeUpdate)&&at(xe,Z,F,fe),tn(p,!0);const Le=io(p),rt=p.subTree;p.subTree=Le,E(rt,Le,d(rt.el),T(rt),p,R,S),F.el=Le.el,oe===null&&sd(p,Le.el),q&&Me(q,R),(xe=F.props&&F.props.onVnodeUpdated)&&Me(()=>at(xe,Z,F,fe),R)}else{let F;const{el:j,props:q}=m,{bm:Z,m:fe,parent:oe,root:xe,type:Le}=p,rt=es(m);tn(p,!1),Z&&Os(Z),!rt&&(F=q&&q.onVnodeBeforeMount)&&at(F,oe,m),tn(p,!0);{xe.ce&&xe.ce._hasShadowRoot()&&xe.ce._injectChildStyle(Le);const it=p.subTree=io(p);E(null,it,_,w,p,R,S),m.el=it.el}if(fe&&Me(fe,R),!rt&&(F=q&&q.onVnodeMounted)){const it=m;Me(()=>at(F,oe,it),R)}(m.shapeFlag&256||oe&&es(oe.vnode)&&oe.vnode.shapeFlag&256)&&p.a&&Me(p.a,R),p.isMounted=!0,m=_=w=null}};p.scope.on();const N=p.effect=new ka(D);p.scope.off();const P=p.update=N.run.bind(N),W=p.job=N.runIfDirty.bind(N);W.i=p,W.id=p.uid,N.scheduler=()=>Ci(W),tn(p,!0),P()},le=(p,m,_)=>{m.component=p;const w=p.vnode.props;p.vnode=m,p.next=null,id(p,m.props,w,_),cd(p,m.children,_),At(),Xi(p),Rt()},te=(p,m,_,w,R,S,x,D,N=!1)=>{const P=p&&p.children,W=p?p.shapeFlag:0,F=m.children,{patchFlag:j,shapeFlag:q}=m;if(j>0){if(j&128){xt(P,F,_,w,R,S,x,D,N);return}else if(j&256){gt(P,F,_,w,R,S,x,D,N);return}}q&8?(W&16&&je(P,R,S),F!==P&&f(_,F)):W&16?q&16?xt(P,F,_,w,R,S,x,D,N):je(P,R,S,!0):(W&8&&f(_,""),q&16&&y(F,_,w,R,S,x,D,N))},gt=(p,m,_,w,R,S,x,D,N)=>{p=p||En,m=m||En;const P=p.length,W=m.length,F=Math.min(P,W);let j;for(j=0;j<F;j++){const q=m[j]=N?bt(m[j]):ct(m[j]);E(p[j],q,_,null,R,S,x,D,N)}P>W?je(p,R,S,!0,!1,F):y(m,_,w,R,S,x,D,N,F)},xt=(p,m,_,w,R,S,x,D,N)=>{let P=0;const W=m.length;let F=p.length-1,j=W-1;for(;P<=F&&P<=j;){const q=p[P],Z=m[P]=N?bt(m[P]):ct(m[P]);if(Kn(q,Z))E(q,Z,_,null,R,S,x,D,N);else break;P++}for(;P<=F&&P<=j;){const q=p[F],Z=m[j]=N?bt(m[j]):ct(m[j]);if(Kn(q,Z))E(q,Z,_,null,R,S,x,D,N);else break;F--,j--}if(P>F){if(P<=j){const q=j+1,Z=q<W?m[q].el:w;for(;P<=j;)E(null,m[P]=N?bt(m[P]):ct(m[P]),_,Z,R,S,x,D,N),P++}}else if(P>j)for(;P<=F;)De(p[P],R,S,!0),P++;else{const q=P,Z=P,fe=new Map;for(P=Z;P<=j;P++){const Ve=m[P]=N?bt(m[P]):ct(m[P]);Ve.key!=null&&fe.set(Ve.key,P)}let oe,xe=0;const Le=j-Z+1;let rt=!1,it=0;const jn=new Array(Le);for(P=0;P<Le;P++)jn[P]=0;for(P=q;P<=F;P++){const Ve=p[P];if(xe>=Le){De(Ve,R,S,!0);continue}let ot;if(Ve.key!=null)ot=fe.get(Ve.key);else for(oe=Z;oe<=j;oe++)if(jn[oe-Z]===0&&Kn(Ve,m[oe])){ot=oe;break}ot===void 0?De(Ve,R,S,!0):(jn[ot-Z]=P+1,ot>=it?it=ot:rt=!0,E(Ve,m[ot],_,null,R,S,x,D,N),xe++)}const Wi=rt?hd(jn):En;for(oe=Wi.length-1,P=Le-1;P>=0;P--){const Ve=Z+P,ot=m[Ve],Ki=m[Ve+1],Gi=Ve+1<W?Ki.el||bl(Ki):w;jn[P]===0?E(null,ot,_,Gi,R,S,x,D,N):rt&&(oe<0||P!==Wi[oe]?st(ot,_,Gi,2):oe--)}}},st=(p,m,_,w,R=null)=>{const{el:S,type:x,transition:D,children:N,shapeFlag:P}=p;if(P&6){st(p.component.subTree,m,_,w);return}if(P&128){p.suspense.move(m,_,w);return}if(P&64){x.move(p,m,_,H);return}if(x===Y){s(S,m,_);for(let F=0;F<N.length;F++)st(N[F],m,_,w);s(p.anchor,m,_);return}if(x===Ds){U(p,m,_);return}if(w!==2&&P&1&&D)if(w===0)D.beforeEnter(S),s(S,m,_),Me(()=>D.enter(S),R);else{const{leave:F,delayLeave:j,afterLeave:q}=D,Z=()=>{p.ctx.isUnmounted?r(S):s(S,m,_)},fe=()=>{S._isLeaving&&S[Ru](!0),F(S,()=>{Z(),q&&q()})};j?j(S,Z,fe):fe()}else s(S,m,_)},De=(p,m,_,w=!1,R=!1)=>{const{type:S,props:x,ref:D,children:N,dynamicChildren:P,shapeFlag:W,patchFlag:F,dirs:j,cacheIndex:q}=p;if(F===-2&&(R=!1),D!=null&&(At(),Zn(D,null,_,p,!0),Rt()),q!=null&&(m.renderCache[q]=void 0),W&256){m.ctx.deactivate(p);return}const Z=W&1&&j,fe=!es(p);let oe;if(fe&&(oe=x&&x.onVnodeBeforeUnmount)&&at(oe,m,p),W&6)Zt(p.component,_,w);else{if(W&128){p.suspense.unmount(_,w);return}Z&&en(p,null,m,"beforeUnmount"),W&64?p.type.remove(p,m,_,H,w):P&&!P.hasOnce&&(S!==Y||F>0&&F&64)?je(P,m,_,!1,!0):(S===Y&&F&384||!R&&W&16)&&je(N,m,_),w&&mn(p)}(fe&&(oe=x&&x.onVnodeUnmounted)||Z)&&Me(()=>{oe&&at(oe,m,p),Z&&en(p,null,m,"unmounted")},_)},mn=p=>{const{type:m,el:_,anchor:w,transition:R}=p;if(m===Y){gn(_,w);return}if(m===Ds){B(p);return}const S=()=>{r(_),R&&!R.persisted&&R.afterLeave&&R.afterLeave()};if(p.shapeFlag&1&&R&&!R.persisted){const{leave:x,delayLeave:D}=R,N=()=>x(_,S);D?D(p.el,S,N):N()}else S()},gn=(p,m)=>{let _;for(;p!==m;)_=h(p),r(p),p=_;r(m)},Zt=(p,m,_)=>{const{bum:w,scope:R,job:S,subTree:x,um:D,m:N,a:P}=p;lo(N),lo(P),w&&Os(w),R.stop(),S&&(S.flags|=8,De(x,p,m,_)),D&&Me(D,m),Me(()=>{p.isUnmounted=!0},m)},je=(p,m,_,w=!1,R=!1,S=0)=>{for(let x=S;x<p.length;x++)De(p[x],m,_,w,R)},T=p=>{if(p.shapeFlag&6)return T(p.component.subTree);if(p.shapeFlag&128)return p.suspense.next();const m=h(p.anchor||p.el),_=m&&m[Tu];return _?h(_):m};let $=!1;const L=(p,m,_)=>{let w;p==null?m._vnode&&(De(m._vnode,null,null,!0),w=m._vnode.component):E(m._vnode||null,p,m,null,null,null,_),m._vnode=p,$||($=!0,Xi(w),Ja(),$=!1)},H={p:E,um:De,m:st,r:mn,mt:Hn,mc:y,pc:te,pbc:Fe,n:T,o:t};return{render:L,hydrate:void 0,createApp:Yu(L)}}function Tr({type:t,props:e},n){return n==="svg"&&t==="foreignObject"||n==="mathml"&&t==="annotation-xml"&&e&&e.encoding&&e.encoding.includes("html")?void 0:n}function tn({effect:t,job:e},n){n?(t.flags|=32,e.flags|=4):(t.flags&=-33,e.flags&=-5)}function fd(t,e){return(!t||t&&!t.pendingBranch)&&e&&!e.persisted}function yl(t,e,n=!1){const s=t.children,r=e.children;if(z(s)&&z(r))for(let i=0;i<s.length;i++){const o=s[i];let a=r[i];a.shapeFlag&1&&!a.dynamicChildren&&((a.patchFlag<=0||a.patchFlag===32)&&(a=r[i]=bt(r[i]),a.el=o.el),!n&&a.patchFlag!==-2&&yl(o,a)),a.type===ur&&(a.patchFlag===-1&&(a=r[i]=bt(a)),a.el=o.el),a.type===Jt&&!a.el&&(a.el=o.el)}}function hd(t){const e=t.slice(),n=[0];let s,r,i,o,a;const l=t.length;for(s=0;s<l;s++){const u=t[s];if(u!==0){if(r=n[n.length-1],t[r]<u){e[s]=r,n.push(s);continue}for(i=0,o=n.length-1;i<o;)a=i+o>>1,t[n[a]]<u?i=a+1:o=a;u<t[n[i]]&&(i>0&&(e[s]=n[i-1]),n[i]=s)}}for(i=n.length,o=n[i-1];i-- >0;)n[i]=o,o=e[o];return n}function vl(t){const e=t.subTree.component;if(e)return e.asyncDep&&!e.asyncResolved?e:vl(e)}function lo(t){if(t)for(let e=0;e<t.length;e++)t[e].flags|=8}function bl(t){if(t.placeholder)return t.placeholder;const e=t.component;return e?bl(e.subTree):null}const El=t=>t.__isSuspense;function pd(t,e){e&&e.pendingBranch?z(t)?e.effects.push(...t):e.effects.push(t):Iu(t)}const Y=Symbol.for("v-fgt"),ur=Symbol.for("v-txt"),Jt=Symbol.for("v-cmt"),Ds=Symbol.for("v-stc"),ns=[];let He=null;function M(t=!1){ns.push(He=t?null:[])}function md(){ns.pop(),He=ns[ns.length-1]||null}let cs=1;function Ks(t,e=!1){cs+=t,t<0&&He&&e&&(He.hasOnce=!0)}function Il(t){return t.dynamicChildren=cs>0?He||En:null,md(),cs>0&&He&&He.push(t),t}function V(t,e,n,s,r,i){return Il(c(t,e,n,s,r,i,!0))}function wl(t,e,n,s,r){return Il(pe(t,e,n,s,r,!0))}function Gs(t){return t?t.__v_isVNode===!0:!1}function Kn(t,e){return t.type===e.type&&t.key===e.key}const Sl=({key:t})=>t??null,xs=({ref:t,ref_key:e,ref_for:n})=>(typeof t=="number"&&(t=""+t),t!=null?ve(t)||Te(t)||J(t)?{i:Be,r:t,k:e,f:!!n}:t:null);function c(t,e=null,n=null,s=0,r=null,i=t===Y?0:1,o=!1,a=!1){const l={__v_isVNode:!0,__v_skip:!0,type:t,props:e,key:e&&Sl(e),ref:e&&xs(e),scopeId:Xa,slotScopeIds:null,children:n,component:null,suspense:null,ssContent:null,ssFallback:null,dirs:null,transition:null,el:null,anchor:null,target:null,targetStart:null,targetAnchor:null,staticCount:0,shapeFlag:i,patchFlag:s,dynamicProps:r,dynamicChildren:null,appContext:null,ctx:Be};return a?(Pi(l,n),i&128&&t.normalize(l)):n&&(l.shapeFlag|=ve(n)?8:16),cs>0&&!o&&He&&(l.patchFlag>0||i&6)&&l.patchFlag!==32&&He.push(l),l}const pe=gd;function gd(t,e=null,n=null,s=0,r=null,i=!1){if((!t||t===Bu)&&(t=Jt),Gs(t)){const a=On(t,e,!0);return n&&Pi(a,n),cs>0&&!i&&He&&(a.shapeFlag&6?He[He.indexOf(t)]=a:He.push(a)),a.patchFlag=-2,a}if(Pd(t)&&(t=t.__vccOpts),e){e=_d(e);let{class:a,style:l}=e;a&&!ve(a)&&(e.class=$e(a)),ae(l)&&(wi(l)&&!z(l)&&(l=we({},l)),e.style=mi(l))}const o=ve(t)?1:El(t)?128:Au(t)?64:ae(t)?4:J(t)?2:0;return c(t,e,n,s,r,o,i,!0)}function _d(t){return t?wi(t)||fl(t)?we({},t):t:null}function On(t,e,n=!1,s=!1){const{props:r,ref:i,patchFlag:o,children:a,transition:l}=t,u=e?vd(r||{},e):r,f={__v_isVNode:!0,__v_skip:!0,type:t.type,props:u,key:u&&Sl(u),ref:e&&e.ref?n&&i?z(i)?i.concat(xs(e)):[i,xs(e)]:xs(e):i,scopeId:t.scopeId,slotScopeIds:t.slotScopeIds,children:a,target:t.target,targetStart:t.targetStart,targetAnchor:t.targetAnchor,staticCount:t.staticCount,shapeFlag:t.shapeFlag,patchFlag:e&&t.type!==Y?o===-1?16:o|16:o,dynamicProps:t.dynamicProps,dynamicChildren:t.dynamicChildren,appContext:t.appContext,dirs:t.dirs,transition:l,component:t.component,suspense:t.suspense,ssContent:t.ssContent&&On(t.ssContent),ssFallback:t.ssFallback&&On(t.ssFallback),placeholder:t.placeholder,el:t.el,anchor:t.anchor,ctx:t.ctx,ce:t.ce};return l&&s&&Ti(f,l.clone(f)),f}function Ee(t=" ",e=0){return pe(ur,null,t,e)}function yd(t,e){const n=pe(Ds,null,t);return n.staticCount=e,n}function Ge(t="",e=!1){return e?(M(),wl(Jt,null,t)):pe(Jt,null,t)}function ct(t){return t==null||typeof t=="boolean"?pe(Jt):z(t)?pe(Y,null,t.slice()):Gs(t)?bt(t):pe(ur,null,String(t))}function bt(t){return t.el===null&&t.patchFlag!==-1||t.memo?t:On(t)}function Pi(t,e){let n=0;const{shapeFlag:s}=t;if(e==null)e=null;else if(z(e))n=16;else if(typeof e=="object")if(s&65){const r=e.default;r&&(r._c&&(r._d=!1),Pi(t,r()),r._c&&(r._d=!0));return}else{n=32;const r=e._;!r&&!fl(e)?e._ctx=Be:r===3&&Be&&(Be.slots._===1?e._=1:(e._=2,t.patchFlag|=1024))}else J(e)?(e={default:e,_ctx:Be},n=32):(e=String(e),s&64?(n=16,e=[Ee(e)]):n=8);t.children=e,t.shapeFlag|=n}function vd(...t){const e={};for(let n=0;n<t.length;n++){const s=t[n];for(const r in s)if(r==="class")e.class!==s.class&&(e.class=$e([e.class,s.class]));else if(r==="style")e.style=mi([e.style,s.style]);else if(tr(r)){const i=e[r],o=s[r];o&&i!==o&&!(z(i)&&i.includes(o))&&(e[r]=i?[].concat(i,o):o)}else r!==""&&(e[r]=s[r])}return e}function at(t,e,n,s=null){mt(t,e,7,[n,s])}const bd=al();let Ed=0;function Id(t,e,n){const s=t.type,r=(e?e.appContext:t.appContext)||bd,i={uid:Ed++,vnode:t,type:s,parent:e,appContext:r,root:null,next:null,subTree:null,effect:null,update:null,job:null,scope:new Gc(!0),render:null,proxy:null,exposed:null,exposeProxy:null,withProxy:null,provides:e?e.provides:Object.create(r.provides),ids:e?e.ids:["",0,0],accessCache:null,renderCache:[],components:null,directives:null,propsOptions:pl(s,r),emitsOptions:ll(s,r),emit:null,emitted:null,propsDefaults:de,inheritAttrs:s.inheritAttrs,ctx:de,data:de,props:de,attrs:de,slots:de,refs:de,setupState:de,setupContext:null,suspense:n,suspenseId:n?n.pendingId:0,asyncDep:null,asyncResolved:!1,isMounted:!1,isUnmounted:!1,isDeactivated:!1,bc:null,c:null,bm:null,m:null,bu:null,u:null,um:null,bum:null,da:null,a:null,rtg:null,rtc:null,ec:null,sp:null};return i.ctx={_:i},i.root=e?e.root:i,i.emit=Qu.bind(null,i),t.ce&&t.ce(i),i}let Ce=null;const wd=()=>Ce||Be;let zs,Yr;{const t=ir(),e=(n,s)=>{let r;return(r=t[n])||(r=t[n]=[]),r.push(s),i=>{r.length>1?r.forEach(o=>o(i)):r[0](i)}};zs=e("__VUE_INSTANCE_SETTERS__",n=>Ce=n),Yr=e("__VUE_SSR_SETTERS__",n=>us=n)}const vs=t=>{const e=Ce;return zs(t),t.scope.on(),()=>{t.scope.off(),zs(e)}},co=()=>{Ce&&Ce.scope.off(),zs(null)};function Cl(t){return t.vnode.shapeFlag&4}let us=!1;function Sd(t,e=!1,n=!1){e&&Yr(e);const{props:s,children:r}=t.vnode,i=Cl(t);rd(t,s,i,e),ld(t,r,n||e);const o=i?Cd(t,e):void 0;return e&&Yr(!1),o}function Cd(t,e){const n=t.type;t.accessCache=Object.create(null),t.proxy=new Proxy(t.ctx,ju);const{setup:s}=n;if(s){At();const r=t.setupContext=s.length>1?Ad(t):null,i=vs(t),o=ys(s,t,0,[t.props,r]),a=wa(o);if(Rt(),i(),(a||t.sp)&&!es(t)&&tl(t),a){if(o.then(co,co),e)return o.then(l=>{uo(t,l)}).catch(l=>{ar(l,t,0)});t.asyncDep=o}else uo(t,o)}else Tl(t)}function uo(t,e,n){J(e)?t.type.__ssrInlineRender?t.ssrRender=e:t.render=e:ae(e)&&(t.setupState=Ga(e)),Tl(t)}function Tl(t,e,n){const s=t.type;t.render||(t.render=s.render||dt);{const r=vs(t);At();try{Wu(t)}finally{Rt(),r()}}}const Td={get(t,e){return Se(t,"get",""),t[e]}};function Ad(t){const e=n=>{t.exposed=n||{}};return{attrs:new Proxy(t.attrs,Td),slots:t.slots,emit:t.emit,expose:e}}function dr(t){return t.exposed?t.exposeProxy||(t.exposeProxy=new Proxy(Ga(fu(t.exposed)),{get(e,n){if(n in e)return e[n];if(n in ts)return ts[n](t)},has(e,n){return n in e||n in ts}})):t.proxy}function Rd(t,e=!0){return J(t)?t.displayName||t.name:t.name||e&&t.__name}function Pd(t){return J(t)&&"__vccOpts"in t}const ke=(t,e)=>_u(t,e,us);function Al(t,e,n){try{Ks(-1);const s=arguments.length;return s===2?ae(e)&&!z(e)?Gs(e)?pe(t,null,[e]):pe(t,e):pe(t,null,e):(s>3?n=Array.prototype.slice.call(arguments,2):s===3&&Gs(n)&&(n=[n]),pe(t,e,n))}finally{Ks(1)}}const kd="3.5.29";/**
* @vue/runtime-dom v3.5.29
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/let Xr;const fo=typeof window<"u"&&window.trustedTypes;if(fo)try{Xr=fo.createPolicy("vue",{createHTML:t=>t})}catch{}const Rl=Xr?t=>Xr.createHTML(t):t=>t,Od="http://www.w3.org/2000/svg",Nd="http://www.w3.org/1998/Math/MathML",vt=typeof document<"u"?document:null,ho=vt&&vt.createElement("template"),Dd={insert:(t,e,n)=>{e.insertBefore(t,n||null)},remove:t=>{const e=t.parentNode;e&&e.removeChild(t)},createElement:(t,e,n,s)=>{const r=e==="svg"?vt.createElementNS(Od,t):e==="mathml"?vt.createElementNS(Nd,t):n?vt.createElement(t,{is:n}):vt.createElement(t);return t==="select"&&s&&s.multiple!=null&&r.setAttribute("multiple",s.multiple),r},createText:t=>vt.createTextNode(t),createComment:t=>vt.createComment(t),setText:(t,e)=>{t.nodeValue=e},setElementText:(t,e)=>{t.textContent=e},parentNode:t=>t.parentNode,nextSibling:t=>t.nextSibling,querySelector:t=>vt.querySelector(t),setScopeId(t,e){t.setAttribute(e,"")},insertStaticContent(t,e,n,s,r,i){const o=n?n.previousSibling:e.lastChild;if(r&&(r===i||r.nextSibling))for(;e.insertBefore(r.cloneNode(!0),n),!(r===i||!(r=r.nextSibling)););else{ho.innerHTML=Rl(s==="svg"?`<svg>${t}</svg>`:s==="mathml"?`<math>${t}</math>`:t);const a=ho.content;if(s==="svg"||s==="mathml"){const l=a.firstChild;for(;l.firstChild;)a.appendChild(l.firstChild);a.removeChild(l)}e.insertBefore(a,n)}return[o?o.nextSibling:e.firstChild,n?n.previousSibling:e.lastChild]}},xd=Symbol("_vtc");function Ld(t,e,n){const s=t[xd];s&&(e=(e?[e,...s]:[...s]).join(" ")),e==null?t.removeAttribute("class"):n?t.setAttribute("class",e):t.className=e}const po=Symbol("_vod"),Md=Symbol("_vsh"),Ud=Symbol(""),Fd=/(?:^|;)\s*display\s*:/;function Vd(t,e,n){const s=t.style,r=ve(n);let i=!1;if(n&&!r){if(e)if(ve(e))for(const o of e.split(";")){const a=o.slice(0,o.indexOf(":")).trim();n[a]==null&&Ls(s,a,"")}else for(const o in e)n[o]==null&&Ls(s,o,"");for(const o in n)o==="display"&&(i=!0),Ls(s,o,n[o])}else if(r){if(e!==n){const o=s[Ud];o&&(n+=";"+o),s.cssText=n,i=Fd.test(n)}}else e&&t.removeAttribute("style");po in t&&(t[po]=i?s.display:"",t[Md]&&(s.display="none"))}const mo=/\s*!important$/;function Ls(t,e,n){if(z(n))n.forEach(s=>Ls(t,e,s));else if(n==null&&(n=""),e.startsWith("--"))t.setProperty(e,n);else{const s=$d(t,e);mo.test(n)?t.setProperty(dn(s),n.replace(mo,""),"important"):t[s]=n}}const go=["Webkit","Moz","ms"],Ar={};function $d(t,e){const n=Ar[e];if(n)return n;let s=qe(e);if(s!=="filter"&&s in t)return Ar[e]=s;s=sr(s);for(let r=0;r<go.length;r++){const i=go[r]+s;if(i in t)return Ar[e]=i}return e}const _o="http://www.w3.org/1999/xlink";function yo(t,e,n,s,r,i=Wc(e)){s&&e.startsWith("xlink:")?n==null?t.removeAttributeNS(_o,e.slice(6,e.length)):t.setAttributeNS(_o,e,n):n==null||i&&!Aa(n)?t.removeAttribute(e):t.setAttribute(e,i?"":pt(n)?String(n):n)}function vo(t,e,n,s,r){if(e==="innerHTML"||e==="textContent"){n!=null&&(t[e]=e==="innerHTML"?Rl(n):n);return}const i=t.tagName;if(e==="value"&&i!=="PROGRESS"&&!i.includes("-")){const a=i==="OPTION"?t.getAttribute("value")||"":t.value,l=n==null?t.type==="checkbox"?"on":"":String(n);(a!==l||!("_value"in t))&&(t.value=l),n==null&&t.removeAttribute(e),t._value=n;return}let o=!1;if(n===""||n==null){const a=typeof t[e];a==="boolean"?n=Aa(n):n==null&&a==="string"?(n="",o=!0):a==="number"&&(n=0,o=!0)}try{t[e]=n}catch{}o&&t.removeAttribute(r||e)}function $t(t,e,n,s){t.addEventListener(e,n,s)}function Bd(t,e,n,s){t.removeEventListener(e,n,s)}const bo=Symbol("_vei");function Hd(t,e,n,s,r=null){const i=t[bo]||(t[bo]={}),o=i[e];if(s&&o)o.value=s;else{const[a,l]=jd(e);if(s){const u=i[e]=Gd(s,r);$t(t,a,u,l)}else o&&(Bd(t,a,o,l),i[e]=void 0)}}const Eo=/(?:Once|Passive|Capture)$/;function jd(t){let e;if(Eo.test(t)){e={};let s;for(;s=t.match(Eo);)t=t.slice(0,t.length-s[0].length),e[s[0].toLowerCase()]=!0}return[t[2]===":"?t.slice(3):dn(t.slice(2)),e]}let Rr=0;const Wd=Promise.resolve(),Kd=()=>Rr||(Wd.then(()=>Rr=0),Rr=Date.now());function Gd(t,e){const n=s=>{if(!s._vts)s._vts=Date.now();else if(s._vts<=n.attached)return;mt(zd(s,n.value),e,5,[s])};return n.value=t,n.attached=Kd(),n}function zd(t,e){if(z(e)){const n=t.stopImmediatePropagation;return t.stopImmediatePropagation=()=>{n.call(t),t._stopped=!0},e.map(s=>r=>!r._stopped&&s&&s(r))}else return e}const Io=t=>t.charCodeAt(0)===111&&t.charCodeAt(1)===110&&t.charCodeAt(2)>96&&t.charCodeAt(2)<123,qd=(t,e,n,s,r,i)=>{const o=r==="svg";e==="class"?Ld(t,s,o):e==="style"?Vd(t,n,s):tr(e)?fi(e)||Hd(t,e,n,s,i):(e[0]==="."?(e=e.slice(1),!0):e[0]==="^"?(e=e.slice(1),!1):Jd(t,e,s,o))?(vo(t,e,s),!t.tagName.includes("-")&&(e==="value"||e==="checked"||e==="selected")&&yo(t,e,s,o,i,e!=="value")):t._isVueCE&&(/[A-Z]/.test(e)||!ve(s))?vo(t,qe(e),s,i,e):(e==="true-value"?t._trueValue=s:e==="false-value"&&(t._falseValue=s),yo(t,e,s,o))};function Jd(t,e,n,s){if(s)return!!(e==="innerHTML"||e==="textContent"||e in t&&Io(e)&&J(n));if(e==="spellcheck"||e==="draggable"||e==="translate"||e==="autocorrect"||e==="sandbox"&&t.tagName==="IFRAME"||e==="form"||e==="list"&&t.tagName==="INPUT"||e==="type"&&t.tagName==="TEXTAREA")return!1;if(e==="width"||e==="height"){const r=t.tagName;if(r==="IMG"||r==="VIDEO"||r==="CANVAS"||r==="SOURCE")return!1}return Io(e)&&ve(n)?!1:e in t}const Nn=t=>{const e=t.props["onUpdate:modelValue"]||!1;return z(e)?n=>Os(e,n):e};function Yd(t){t.target.composing=!0}function wo(t){const e=t.target;e.composing&&(e.composing=!1,e.dispatchEvent(new Event("input")))}const Tt=Symbol("_assign");function So(t,e,n){return e&&(t=t.trim()),n&&(t=rr(t)),t}const ye={created(t,{modifiers:{lazy:e,trim:n,number:s}},r){t[Tt]=Nn(r);const i=s||r.props&&r.props.type==="number";$t(t,e?"change":"input",o=>{o.target.composing||t[Tt](So(t.value,n,i))}),(n||i)&&$t(t,"change",()=>{t.value=So(t.value,n,i)}),e||($t(t,"compositionstart",Yd),$t(t,"compositionend",wo),$t(t,"change",wo))},mounted(t,{value:e}){t.value=e??""},beforeUpdate(t,{value:e,oldValue:n,modifiers:{lazy:s,trim:r,number:i}},o){if(t[Tt]=Nn(o),t.composing)return;const a=(i||t.type==="number")&&!/^0\d/.test(t.value)?rr(t.value):t.value,l=e??"";a!==l&&(document.activeElement===t&&t.type!=="range"&&(s&&e===n||r&&t.value.trim()===l)||(t.value=l))}},Ps={deep:!0,created(t,e,n){t[Tt]=Nn(n),$t(t,"change",()=>{const s=t._modelValue,r=ds(t),i=t.checked,o=t[Tt];if(z(s)){const a=gi(s,r),l=a!==-1;if(i&&!l)o(s.concat(r));else if(!i&&l){const u=[...s];u.splice(a,1),o(u)}}else if(Fn(s)){const a=new Set(s);i?a.add(r):a.delete(r),o(a)}else o(Pl(t,i))})},mounted:Co,beforeUpdate(t,e,n){t[Tt]=Nn(n),Co(t,e,n)}};function Co(t,{value:e,oldValue:n},s){t._modelValue=e;let r;if(z(e))r=gi(e,s.props.value)>-1;else if(Fn(e))r=e.has(s.props.value);else{if(e===n)return;r=Vn(e,Pl(t,!0))}t.checked!==r&&(t.checked=r)}const Ke={deep:!0,created(t,{value:e,modifiers:{number:n}},s){const r=Fn(e);$t(t,"change",()=>{const i=Array.prototype.filter.call(t.options,o=>o.selected).map(o=>n?rr(ds(o)):ds(o));t[Tt](t.multiple?r?new Set(i):i:i[0]),t._assigning=!0,Si(()=>{t._assigning=!1})}),t[Tt]=Nn(s)},mounted(t,{value:e}){To(t,e)},beforeUpdate(t,e,n){t[Tt]=Nn(n)},updated(t,{value:e}){t._assigning||To(t,e)}};function To(t,e){const n=t.multiple,s=z(e);if(!(n&&!s&&!Fn(e))){for(let r=0,i=t.options.length;r<i;r++){const o=t.options[r],a=ds(o);if(n)if(s){const l=typeof a;l==="string"||l==="number"?o.selected=e.some(u=>String(u)===String(a)):o.selected=gi(e,a)>-1}else o.selected=e.has(a);else if(Vn(ds(o),e)){t.selectedIndex!==r&&(t.selectedIndex=r);return}}!n&&t.selectedIndex!==-1&&(t.selectedIndex=-1)}}function ds(t){return"_value"in t?t._value:t.value}function Pl(t,e){const n=e?"_trueValue":"_falseValue";return n in t?t[n]:e}const Xd=["ctrl","shift","alt","meta"],Qd={stop:t=>t.stopPropagation(),prevent:t=>t.preventDefault(),self:t=>t.target!==t.currentTarget,ctrl:t=>!t.ctrlKey,shift:t=>!t.shiftKey,alt:t=>!t.altKey,meta:t=>!t.metaKey,left:t=>"button"in t&&t.button!==0,middle:t=>"button"in t&&t.button!==1,right:t=>"button"in t&&t.button!==2,exact:(t,e)=>Xd.some(n=>t[`${n}Key`]&&!e.includes(n))},ki=(t,e)=>{if(!t)return t;const n=t._withMods||(t._withMods={}),s=e.join(".");return n[s]||(n[s]=((r,...i)=>{for(let o=0;o<e.length;o++){const a=Qd[e[o]];if(a&&a(r,e))return}return t(r,...i)}))},Zd=we({patchProp:qd},Dd);let Ao;function ef(){return Ao||(Ao=ud(Zd))}const tf=((...t)=>{const e=ef().createApp(...t),{mount:n}=e;return e.mount=s=>{const r=sf(s);if(!r)return;const i=e._component;!J(i)&&!i.render&&!i.template&&(i.template=r.innerHTML),r.nodeType===1&&(r.textContent="");const o=n(r,!1,nf(r));return r instanceof Element&&(r.removeAttribute("v-cloak"),r.setAttribute("data-v-app","")),o},e});function nf(t){if(t instanceof SVGElement)return"svg";if(typeof MathMLElement=="function"&&t instanceof MathMLElement)return"mathml"}function sf(t){return ve(t)?document.querySelector(t):t}const rf=(t,e)=>{const n=t.__vccOpts||t;for(const[s,r]of e)n[s]=r;return n},of={};function af(t,e){const n=Kr("router-view");return M(),wl(n)}const lf=rf(of,[["render",af]]);/*!
 * vue-router v4.6.4
 * (c) 2025 Eduardo San Martin Morote
 * @license MIT
 */const vn=typeof document<"u";function kl(t){return typeof t=="object"||"displayName"in t||"props"in t||"__vccOpts"in t}function cf(t){return t.__esModule||t[Symbol.toStringTag]==="Module"||t.default&&kl(t.default)}const ne=Object.assign;function Pr(t,e){const n={};for(const s in e){const r=e[s];n[s]=Ze(r)?r.map(t):t(r)}return n}const ss=()=>{},Ze=Array.isArray;function Ro(t,e){const n={};for(const s in t)n[s]=s in e?e[s]:t[s];return n}const Ol=/#/g,uf=/&/g,df=/\//g,ff=/=/g,hf=/\?/g,Nl=/\+/g,pf=/%5B/g,mf=/%5D/g,Dl=/%5E/g,gf=/%60/g,xl=/%7B/g,_f=/%7C/g,Ll=/%7D/g,yf=/%20/g;function Oi(t){return t==null?"":encodeURI(""+t).replace(_f,"|").replace(pf,"[").replace(mf,"]")}function vf(t){return Oi(t).replace(xl,"{").replace(Ll,"}").replace(Dl,"^")}function Qr(t){return Oi(t).replace(Nl,"%2B").replace(yf,"+").replace(Ol,"%23").replace(uf,"%26").replace(gf,"`").replace(xl,"{").replace(Ll,"}").replace(Dl,"^")}function bf(t){return Qr(t).replace(ff,"%3D")}function Ef(t){return Oi(t).replace(Ol,"%23").replace(hf,"%3F")}function If(t){return Ef(t).replace(df,"%2F")}function fs(t){if(t==null)return null;try{return decodeURIComponent(""+t)}catch{}return""+t}const wf=/\/$/,Sf=t=>t.replace(wf,"");function kr(t,e,n="/"){let s,r={},i="",o="";const a=e.indexOf("#");let l=e.indexOf("?");return l=a>=0&&l>a?-1:l,l>=0&&(s=e.slice(0,l),i=e.slice(l,a>0?a:e.length),r=t(i.slice(1))),a>=0&&(s=s||e.slice(0,a),o=e.slice(a,e.length)),s=Rf(s??e,n),{fullPath:s+i+o,path:s,query:r,hash:fs(o)}}function Cf(t,e){const n=e.query?t(e.query):"";return e.path+(n&&"?")+n+(e.hash||"")}function Po(t,e){return!e||!t.toLowerCase().startsWith(e.toLowerCase())?t:t.slice(e.length)||"/"}function Tf(t,e,n){const s=e.matched.length-1,r=n.matched.length-1;return s>-1&&s===r&&Dn(e.matched[s],n.matched[r])&&Ml(e.params,n.params)&&t(e.query)===t(n.query)&&e.hash===n.hash}function Dn(t,e){return(t.aliasOf||t)===(e.aliasOf||e)}function Ml(t,e){if(Object.keys(t).length!==Object.keys(e).length)return!1;for(var n in t)if(!Af(t[n],e[n]))return!1;return!0}function Af(t,e){return Ze(t)?ko(t,e):Ze(e)?ko(e,t):(t==null?void 0:t.valueOf())===(e==null?void 0:e.valueOf())}function ko(t,e){return Ze(e)?t.length===e.length&&t.every((n,s)=>n===e[s]):t.length===1&&t[0]===e}function Rf(t,e){if(t.startsWith("/"))return t;if(!t)return e;const n=e.split("/"),s=t.split("/"),r=s[s.length-1];(r===".."||r===".")&&s.push("");let i=n.length-1,o,a;for(o=0;o<s.length;o++)if(a=s[o],a!==".")if(a==="..")i>1&&i--;else break;return n.slice(0,i).join("/")+"/"+s.slice(o).join("/")}const Lt={path:"/",name:void 0,params:{},query:{},hash:"",fullPath:"/",matched:[],meta:{},redirectedFrom:void 0};let Zr=(function(t){return t.pop="pop",t.push="push",t})({}),Or=(function(t){return t.back="back",t.forward="forward",t.unknown="",t})({});function Pf(t){if(!t)if(vn){const e=document.querySelector("base");t=e&&e.getAttribute("href")||"/",t=t.replace(/^\w+:\/\/[^\/]+/,"")}else t="/";return t[0]!=="/"&&t[0]!=="#"&&(t="/"+t),Sf(t)}const kf=/^[^#]+#/;function Of(t,e){return t.replace(kf,"#")+e}function Nf(t,e){const n=document.documentElement.getBoundingClientRect(),s=t.getBoundingClientRect();return{behavior:e.behavior,left:s.left-n.left-(e.left||0),top:s.top-n.top-(e.top||0)}}const fr=()=>({left:window.scrollX,top:window.scrollY});function Df(t){let e;if("el"in t){const n=t.el,s=typeof n=="string"&&n.startsWith("#"),r=typeof n=="string"?s?document.getElementById(n.slice(1)):document.querySelector(n):n;if(!r)return;e=Nf(r,t)}else e=t;"scrollBehavior"in document.documentElement.style?window.scrollTo(e):window.scrollTo(e.left!=null?e.left:window.scrollX,e.top!=null?e.top:window.scrollY)}function Oo(t,e){return(history.state?history.state.position-e:-1)+t}const ei=new Map;function xf(t,e){ei.set(t,e)}function Lf(t){const e=ei.get(t);return ei.delete(t),e}function Mf(t){return typeof t=="string"||t&&typeof t=="object"}function Ul(t){return typeof t=="string"||typeof t=="symbol"}let _e=(function(t){return t[t.MATCHER_NOT_FOUND=1]="MATCHER_NOT_FOUND",t[t.NAVIGATION_GUARD_REDIRECT=2]="NAVIGATION_GUARD_REDIRECT",t[t.NAVIGATION_ABORTED=4]="NAVIGATION_ABORTED",t[t.NAVIGATION_CANCELLED=8]="NAVIGATION_CANCELLED",t[t.NAVIGATION_DUPLICATED=16]="NAVIGATION_DUPLICATED",t})({});const Fl=Symbol("");_e.MATCHER_NOT_FOUND+"",_e.NAVIGATION_GUARD_REDIRECT+"",_e.NAVIGATION_ABORTED+"",_e.NAVIGATION_CANCELLED+"",_e.NAVIGATION_DUPLICATED+"";function xn(t,e){return ne(new Error,{type:t,[Fl]:!0},e)}function yt(t,e){return t instanceof Error&&Fl in t&&(e==null||!!(t.type&e))}const Uf=["params","query","hash"];function Ff(t){if(typeof t=="string")return t;if(t.path!=null)return t.path;const e={};for(const n of Uf)n in t&&(e[n]=t[n]);return JSON.stringify(e,null,2)}function Vf(t){const e={};if(t===""||t==="?")return e;const n=(t[0]==="?"?t.slice(1):t).split("&");for(let s=0;s<n.length;++s){const r=n[s].replace(Nl," "),i=r.indexOf("="),o=fs(i<0?r:r.slice(0,i)),a=i<0?null:fs(r.slice(i+1));if(o in e){let l=e[o];Ze(l)||(l=e[o]=[l]),l.push(a)}else e[o]=a}return e}function No(t){let e="";for(let n in t){const s=t[n];if(n=bf(n),s==null){s!==void 0&&(e+=(e.length?"&":"")+n);continue}(Ze(s)?s.map(r=>r&&Qr(r)):[s&&Qr(s)]).forEach(r=>{r!==void 0&&(e+=(e.length?"&":"")+n,r!=null&&(e+="="+r))})}return e}function $f(t){const e={};for(const n in t){const s=t[n];s!==void 0&&(e[n]=Ze(s)?s.map(r=>r==null?null:""+r):s==null?s:""+s)}return e}const Bf=Symbol(""),Do=Symbol(""),hr=Symbol(""),Ni=Symbol(""),ti=Symbol("");function Gn(){let t=[];function e(s){return t.push(s),()=>{const r=t.indexOf(s);r>-1&&t.splice(r,1)}}function n(){t=[]}return{add:e,list:()=>t.slice(),reset:n}}function Vt(t,e,n,s,r,i=o=>o()){const o=s&&(s.enterCallbacks[r]=s.enterCallbacks[r]||[]);return()=>new Promise((a,l)=>{const u=h=>{h===!1?l(xn(_e.NAVIGATION_ABORTED,{from:n,to:e})):h instanceof Error?l(h):Mf(h)?l(xn(_e.NAVIGATION_GUARD_REDIRECT,{from:e,to:h})):(o&&s.enterCallbacks[r]===o&&typeof h=="function"&&o.push(h),a())},f=i(()=>t.call(s&&s.instances[r],e,n,u));let d=Promise.resolve(f);t.length<3&&(d=d.then(u)),d.catch(h=>l(h))})}function Nr(t,e,n,s,r=i=>i()){const i=[];for(const o of t)for(const a in o.components){let l=o.components[a];if(!(e!=="beforeRouteEnter"&&!o.instances[a]))if(kl(l)){const u=(l.__vccOpts||l)[e];u&&i.push(Vt(u,n,s,o,a,r))}else{let u=l();i.push(()=>u.then(f=>{if(!f)throw new Error(`Couldn't resolve component "${a}" at "${o.path}"`);const d=cf(f)?f.default:f;o.mods[a]=f,o.components[a]=d;const h=(d.__vccOpts||d)[e];return h&&Vt(h,n,s,o,a,r)()}))}}return i}function Hf(t,e){const n=[],s=[],r=[],i=Math.max(e.matched.length,t.matched.length);for(let o=0;o<i;o++){const a=e.matched[o];a&&(t.matched.find(u=>Dn(u,a))?s.push(a):n.push(a));const l=t.matched[o];l&&(e.matched.find(u=>Dn(u,l))||r.push(l))}return[n,s,r]}/*!
 * vue-router v4.6.4
 * (c) 2025 Eduardo San Martin Morote
 * @license MIT
 */let jf=()=>location.protocol+"//"+location.host;function Vl(t,e){const{pathname:n,search:s,hash:r}=e,i=t.indexOf("#");if(i>-1){let o=r.includes(t.slice(i))?t.slice(i).length:1,a=r.slice(o);return a[0]!=="/"&&(a="/"+a),Po(a,"")}return Po(n,t)+s+r}function Wf(t,e,n,s){let r=[],i=[],o=null;const a=({state:h})=>{const g=Vl(t,location),v=n.value,E=e.value;let O=0;if(h){if(n.value=g,e.value=h,o&&o===v){o=null;return}O=E?h.position-E.position:0}else s(g);r.forEach(I=>{I(n.value,v,{delta:O,type:Zr.pop,direction:O?O>0?Or.forward:Or.back:Or.unknown})})};function l(){o=n.value}function u(h){r.push(h);const g=()=>{const v=r.indexOf(h);v>-1&&r.splice(v,1)};return i.push(g),g}function f(){if(document.visibilityState==="hidden"){const{history:h}=window;if(!h.state)return;h.replaceState(ne({},h.state,{scroll:fr()}),"")}}function d(){for(const h of i)h();i=[],window.removeEventListener("popstate",a),window.removeEventListener("pagehide",f),document.removeEventListener("visibilitychange",f)}return window.addEventListener("popstate",a),window.addEventListener("pagehide",f),document.addEventListener("visibilitychange",f),{pauseListeners:l,listen:u,destroy:d}}function xo(t,e,n,s=!1,r=!1){return{back:t,current:e,forward:n,replaced:s,position:window.history.length,scroll:r?fr():null}}function Kf(t){const{history:e,location:n}=window,s={value:Vl(t,n)},r={value:e.state};r.value||i(s.value,{back:null,current:s.value,forward:null,position:e.length-1,replaced:!0,scroll:null},!0);function i(l,u,f){const d=t.indexOf("#"),h=d>-1?(n.host&&document.querySelector("base")?t:t.slice(d))+l:jf()+t+l;try{e[f?"replaceState":"pushState"](u,"",h),r.value=u}catch(g){console.error(g),n[f?"replace":"assign"](h)}}function o(l,u){i(l,ne({},e.state,xo(r.value.back,l,r.value.forward,!0),u,{position:r.value.position}),!0),s.value=l}function a(l,u){const f=ne({},r.value,e.state,{forward:l,scroll:fr()});i(f.current,f,!0),i(l,ne({},xo(s.value,l,null),{position:f.position+1},u),!1),s.value=l}return{location:s,state:r,push:a,replace:o}}function Gf(t){t=Pf(t);const e=Kf(t),n=Wf(t,e.state,e.location,e.replace);function s(i,o=!0){o||n.pauseListeners(),history.go(i)}const r=ne({location:"",base:t,go:s,createHref:Of.bind(null,t)},e,n);return Object.defineProperty(r,"location",{enumerable:!0,get:()=>e.location.value}),Object.defineProperty(r,"state",{enumerable:!0,get:()=>e.state.value}),r}let on=(function(t){return t[t.Static=0]="Static",t[t.Param=1]="Param",t[t.Group=2]="Group",t})({});var be=(function(t){return t[t.Static=0]="Static",t[t.Param=1]="Param",t[t.ParamRegExp=2]="ParamRegExp",t[t.ParamRegExpEnd=3]="ParamRegExpEnd",t[t.EscapeNext=4]="EscapeNext",t})(be||{});const zf={type:on.Static,value:""},qf=/[a-zA-Z0-9_]/;function Jf(t){if(!t)return[[]];if(t==="/")return[[zf]];if(!t.startsWith("/"))throw new Error(`Invalid path "${t}"`);function e(g){throw new Error(`ERR (${n})/"${u}": ${g}`)}let n=be.Static,s=n;const r=[];let i;function o(){i&&r.push(i),i=[]}let a=0,l,u="",f="";function d(){u&&(n===be.Static?i.push({type:on.Static,value:u}):n===be.Param||n===be.ParamRegExp||n===be.ParamRegExpEnd?(i.length>1&&(l==="*"||l==="+")&&e(`A repeatable param (${u}) must be alone in its segment. eg: '/:ids+.`),i.push({type:on.Param,value:u,regexp:f,repeatable:l==="*"||l==="+",optional:l==="*"||l==="?"})):e("Invalid state to consume buffer"),u="")}function h(){u+=l}for(;a<t.length;){if(l=t[a++],l==="\\"&&n!==be.ParamRegExp){s=n,n=be.EscapeNext;continue}switch(n){case be.Static:l==="/"?(u&&d(),o()):l===":"?(d(),n=be.Param):h();break;case be.EscapeNext:h(),n=s;break;case be.Param:l==="("?n=be.ParamRegExp:qf.test(l)?h():(d(),n=be.Static,l!=="*"&&l!=="?"&&l!=="+"&&a--);break;case be.ParamRegExp:l===")"?f[f.length-1]=="\\"?f=f.slice(0,-1)+l:n=be.ParamRegExpEnd:f+=l;break;case be.ParamRegExpEnd:d(),n=be.Static,l!=="*"&&l!=="?"&&l!=="+"&&a--,f="";break;default:e("Unknown state");break}}return n===be.ParamRegExp&&e(`Unfinished custom RegExp for param "${u}"`),d(),o(),r}const Lo="[^/]+?",Yf={sensitive:!1,strict:!1,start:!0,end:!0};var Re=(function(t){return t[t._multiplier=10]="_multiplier",t[t.Root=90]="Root",t[t.Segment=40]="Segment",t[t.SubSegment=30]="SubSegment",t[t.Static=40]="Static",t[t.Dynamic=20]="Dynamic",t[t.BonusCustomRegExp=10]="BonusCustomRegExp",t[t.BonusWildcard=-50]="BonusWildcard",t[t.BonusRepeatable=-20]="BonusRepeatable",t[t.BonusOptional=-8]="BonusOptional",t[t.BonusStrict=.7000000000000001]="BonusStrict",t[t.BonusCaseSensitive=.25]="BonusCaseSensitive",t})(Re||{});const Xf=/[.+*?^${}()[\]/\\]/g;function Qf(t,e){const n=ne({},Yf,e),s=[];let r=n.start?"^":"";const i=[];for(const u of t){const f=u.length?[]:[Re.Root];n.strict&&!u.length&&(r+="/");for(let d=0;d<u.length;d++){const h=u[d];let g=Re.Segment+(n.sensitive?Re.BonusCaseSensitive:0);if(h.type===on.Static)d||(r+="/"),r+=h.value.replace(Xf,"\\$&"),g+=Re.Static;else if(h.type===on.Param){const{value:v,repeatable:E,optional:O,regexp:I}=h;i.push({name:v,repeatable:E,optional:O});const C=I||Lo;if(C!==Lo){g+=Re.BonusCustomRegExp;try{`${C}`}catch(B){throw new Error(`Invalid custom RegExp for param "${v}" (${C}): `+B.message)}}let U=E?`((?:${C})(?:/(?:${C}))*)`:`(${C})`;d||(U=O&&u.length<2?`(?:/${U})`:"/"+U),O&&(U+="?"),r+=U,g+=Re.Dynamic,O&&(g+=Re.BonusOptional),E&&(g+=Re.BonusRepeatable),C===".*"&&(g+=Re.BonusWildcard)}f.push(g)}s.push(f)}if(n.strict&&n.end){const u=s.length-1;s[u][s[u].length-1]+=Re.BonusStrict}n.strict||(r+="/?"),n.end?r+="$":n.strict&&!r.endsWith("/")&&(r+="(?:/|$)");const o=new RegExp(r,n.sensitive?"":"i");function a(u){const f=u.match(o),d={};if(!f)return null;for(let h=1;h<f.length;h++){const g=f[h]||"",v=i[h-1];d[v.name]=g&&v.repeatable?g.split("/"):g}return d}function l(u){let f="",d=!1;for(const h of t){(!d||!f.endsWith("/"))&&(f+="/"),d=!1;for(const g of h)if(g.type===on.Static)f+=g.value;else if(g.type===on.Param){const{value:v,repeatable:E,optional:O}=g,I=v in u?u[v]:"";if(Ze(I)&&!E)throw new Error(`Provided param "${v}" is an array but it is not repeatable (* or + modifiers)`);const C=Ze(I)?I.join("/"):I;if(!C)if(O)h.length<2&&(f.endsWith("/")?f=f.slice(0,-1):d=!0);else throw new Error(`Missing required param "${v}"`);f+=C}}return f||"/"}return{re:o,score:s,keys:i,parse:a,stringify:l}}function Zf(t,e){let n=0;for(;n<t.length&&n<e.length;){const s=e[n]-t[n];if(s)return s;n++}return t.length<e.length?t.length===1&&t[0]===Re.Static+Re.Segment?-1:1:t.length>e.length?e.length===1&&e[0]===Re.Static+Re.Segment?1:-1:0}function $l(t,e){let n=0;const s=t.score,r=e.score;for(;n<s.length&&n<r.length;){const i=Zf(s[n],r[n]);if(i)return i;n++}if(Math.abs(r.length-s.length)===1){if(Mo(s))return 1;if(Mo(r))return-1}return r.length-s.length}function Mo(t){const e=t[t.length-1];return t.length>0&&e[e.length-1]<0}const eh={strict:!1,end:!0,sensitive:!1};function th(t,e,n){const s=Qf(Jf(t.path),n),r=ne(s,{record:t,parent:e,children:[],alias:[]});return e&&!r.record.aliasOf==!e.record.aliasOf&&e.children.push(r),r}function nh(t,e){const n=[],s=new Map;e=Ro(eh,e);function r(d){return s.get(d)}function i(d,h,g){const v=!g,E=Fo(d);E.aliasOf=g&&g.record;const O=Ro(e,d),I=[E];if("alias"in d){const B=typeof d.alias=="string"?[d.alias]:d.alias;for(const ee of B)I.push(Fo(ne({},E,{components:g?g.record.components:E.components,path:ee,aliasOf:g?g.record:E})))}let C,U;for(const B of I){const{path:ee}=B;if(h&&ee[0]!=="/"){const K=h.record.path,b=K[K.length-1]==="/"?"":"/";B.path=h.record.path+(ee&&b+ee)}if(C=th(B,h,O),g?g.alias.push(C):(U=U||C,U!==C&&U.alias.push(C),v&&d.name&&!Vo(C)&&o(d.name)),Bl(C)&&l(C),E.children){const K=E.children;for(let b=0;b<K.length;b++)i(K[b],C,g&&g.children[b])}g=g||C}return U?()=>{o(U)}:ss}function o(d){if(Ul(d)){const h=s.get(d);h&&(s.delete(d),n.splice(n.indexOf(h),1),h.children.forEach(o),h.alias.forEach(o))}else{const h=n.indexOf(d);h>-1&&(n.splice(h,1),d.record.name&&s.delete(d.record.name),d.children.forEach(o),d.alias.forEach(o))}}function a(){return n}function l(d){const h=ih(d,n);n.splice(h,0,d),d.record.name&&!Vo(d)&&s.set(d.record.name,d)}function u(d,h){let g,v={},E,O;if("name"in d&&d.name){if(g=s.get(d.name),!g)throw xn(_e.MATCHER_NOT_FOUND,{location:d});O=g.record.name,v=ne(Uo(h.params,g.keys.filter(U=>!U.optional).concat(g.parent?g.parent.keys.filter(U=>U.optional):[]).map(U=>U.name)),d.params&&Uo(d.params,g.keys.map(U=>U.name))),E=g.stringify(v)}else if(d.path!=null)E=d.path,g=n.find(U=>U.re.test(E)),g&&(v=g.parse(E),O=g.record.name);else{if(g=h.name?s.get(h.name):n.find(U=>U.re.test(h.path)),!g)throw xn(_e.MATCHER_NOT_FOUND,{location:d,currentLocation:h});O=g.record.name,v=ne({},h.params,d.params),E=g.stringify(v)}const I=[];let C=g;for(;C;)I.unshift(C.record),C=C.parent;return{name:O,path:E,params:v,matched:I,meta:rh(I)}}t.forEach(d=>i(d));function f(){n.length=0,s.clear()}return{addRoute:i,resolve:u,removeRoute:o,clearRoutes:f,getRoutes:a,getRecordMatcher:r}}function Uo(t,e){const n={};for(const s of e)s in t&&(n[s]=t[s]);return n}function Fo(t){const e={path:t.path,redirect:t.redirect,name:t.name,meta:t.meta||{},aliasOf:t.aliasOf,beforeEnter:t.beforeEnter,props:sh(t),children:t.children||[],instances:{},leaveGuards:new Set,updateGuards:new Set,enterCallbacks:{},components:"components"in t?t.components||null:t.component&&{default:t.component}};return Object.defineProperty(e,"mods",{value:{}}),e}function sh(t){const e={},n=t.props||!1;if("component"in t)e.default=n;else for(const s in t.components)e[s]=typeof n=="object"?n[s]:n;return e}function Vo(t){for(;t;){if(t.record.aliasOf)return!0;t=t.parent}return!1}function rh(t){return t.reduce((e,n)=>ne(e,n.meta),{})}function ih(t,e){let n=0,s=e.length;for(;n!==s;){const i=n+s>>1;$l(t,e[i])<0?s=i:n=i+1}const r=oh(t);return r&&(s=e.lastIndexOf(r,s-1)),s}function oh(t){let e=t;for(;e=e.parent;)if(Bl(e)&&$l(t,e)===0)return e}function Bl({record:t}){return!!(t.name||t.components&&Object.keys(t.components).length||t.redirect)}function $o(t){const e=Xe(hr),n=Xe(Ni),s=ke(()=>{const l=wn(t.to);return e.resolve(l)}),r=ke(()=>{const{matched:l}=s.value,{length:u}=l,f=l[u-1],d=n.matched;if(!f||!d.length)return-1;const h=d.findIndex(Dn.bind(null,f));if(h>-1)return h;const g=Bo(l[u-2]);return u>1&&Bo(f)===g&&d[d.length-1].path!==g?d.findIndex(Dn.bind(null,l[u-2])):h}),i=ke(()=>r.value>-1&&dh(n.params,s.value.params)),o=ke(()=>r.value>-1&&r.value===n.matched.length-1&&Ml(n.params,s.value.params));function a(l={}){if(uh(l)){const u=e[wn(t.replace)?"replace":"push"](wn(t.to)).catch(ss);return t.viewTransition&&typeof document<"u"&&"startViewTransition"in document&&document.startViewTransition(()=>u),u}return Promise.resolve()}return{route:s,href:ke(()=>s.value.href),isActive:i,isExactActive:o,navigate:a}}function ah(t){return t.length===1?t[0]:t}const lh=el({name:"RouterLink",compatConfig:{MODE:3},props:{to:{type:[String,Object],required:!0},replace:Boolean,activeClass:String,exactActiveClass:String,custom:Boolean,ariaCurrentValue:{type:String,default:"page"},viewTransition:Boolean},useLink:$o,setup(t,{slots:e}){const n=Oe($o(t)),{options:s}=Xe(hr),r=ke(()=>({[Ho(t.activeClass,s.linkActiveClass,"router-link-active")]:n.isActive,[Ho(t.exactActiveClass,s.linkExactActiveClass,"router-link-exact-active")]:n.isExactActive}));return()=>{const i=e.default&&ah(e.default(n));return t.custom?i:Al("a",{"aria-current":n.isExactActive?t.ariaCurrentValue:null,href:n.href,onClick:n.navigate,class:r.value},i)}}}),ch=lh;function uh(t){if(!(t.metaKey||t.altKey||t.ctrlKey||t.shiftKey)&&!t.defaultPrevented&&!(t.button!==void 0&&t.button!==0)){if(t.currentTarget&&t.currentTarget.getAttribute){const e=t.currentTarget.getAttribute("target");if(/\b_blank\b/i.test(e))return}return t.preventDefault&&t.preventDefault(),!0}}function dh(t,e){for(const n in e){const s=e[n],r=t[n];if(typeof s=="string"){if(s!==r)return!1}else if(!Ze(r)||r.length!==s.length||s.some((i,o)=>i.valueOf()!==r[o].valueOf()))return!1}return!0}function Bo(t){return t?t.aliasOf?t.aliasOf.path:t.path:""}const Ho=(t,e,n)=>t??e??n,fh=el({name:"RouterView",inheritAttrs:!1,props:{name:{type:String,default:"default"},route:Object},compatConfig:{MODE:3},setup(t,{attrs:e,slots:n}){const s=Xe(ti),r=ke(()=>t.route||s.value),i=Xe(Do,0),o=ke(()=>{let u=wn(i);const{matched:f}=r.value;let d;for(;(d=f[u])&&!d.components;)u++;return u}),a=ke(()=>r.value.matched[o.value]);Ns(Do,ke(()=>o.value+1)),Ns(Bf,a),Ns(ti,r);const l=ie();return Ct(()=>[l.value,a.value,t.name],([u,f,d],[h,g,v])=>{f&&(f.instances[d]=u,g&&g!==f&&u&&u===h&&(f.leaveGuards.size||(f.leaveGuards=g.leaveGuards),f.updateGuards.size||(f.updateGuards=g.updateGuards))),u&&f&&(!g||!Dn(f,g)||!h)&&(f.enterCallbacks[d]||[]).forEach(E=>E(u))},{flush:"post"}),()=>{const u=r.value,f=t.name,d=a.value,h=d&&d.components[f];if(!h)return jo(n.default,{Component:h,route:u});const g=d.props[f],v=g?g===!0?u.params:typeof g=="function"?g(u):g:null,O=Al(h,ne({},v,e,{onVnodeUnmounted:I=>{I.component.isUnmounted&&(d.instances[f]=null)},ref:l}));return jo(n.default,{Component:O,route:u})||O}}});function jo(t,e){if(!t)return null;const n=t(e);return n.length===1?n[0]:n}const hh=fh;function ph(t){const e=nh(t.routes,t),n=t.parseQuery||Vf,s=t.stringifyQuery||No,r=t.history,i=Gn(),o=Gn(),a=Gn(),l=hu(Lt);let u=Lt;vn&&t.scrollBehavior&&"scrollRestoration"in history&&(history.scrollRestoration="manual");const f=Pr.bind(null,T=>""+T),d=Pr.bind(null,If),h=Pr.bind(null,fs);function g(T,$){let L,H;return Ul(T)?(L=e.getRecordMatcher(T),H=$):H=T,e.addRoute(H,L)}function v(T){const $=e.getRecordMatcher(T);$&&e.removeRoute($)}function E(){return e.getRoutes().map(T=>T.record)}function O(T){return!!e.getRecordMatcher(T)}function I(T,$){if($=ne({},$||l.value),typeof T=="string"){const _=kr(n,T,$.path),w=e.resolve({path:_.path},$),R=r.createHref(_.fullPath);return ne(_,w,{params:h(w.params),hash:fs(_.hash),redirectedFrom:void 0,href:R})}let L;if(T.path!=null)L=ne({},T,{path:kr(n,T.path,$.path).path});else{const _=ne({},T.params);for(const w in _)_[w]==null&&delete _[w];L=ne({},T,{params:d(_)}),$.params=d($.params)}const H=e.resolve(L,$),Q=T.hash||"";H.params=f(h(H.params));const p=Cf(s,ne({},T,{hash:vf(Q),path:H.path})),m=r.createHref(p);return ne({fullPath:p,hash:Q,query:s===No?$f(T.query):T.query||{}},H,{redirectedFrom:void 0,href:m})}function C(T){return typeof T=="string"?kr(n,T,l.value.path):ne({},T)}function U(T,$){if(u!==T)return xn(_e.NAVIGATION_CANCELLED,{from:$,to:T})}function B(T){return b(T)}function ee(T){return B(ne(C(T),{replace:!0}))}function K(T,$){const L=T.matched[T.matched.length-1];if(L&&L.redirect){const{redirect:H}=L;let Q=typeof H=="function"?H(T,$):H;return typeof Q=="string"&&(Q=Q.includes("?")||Q.includes("#")?Q=C(Q):{path:Q},Q.params={}),ne({query:T.query,hash:T.hash,params:Q.path!=null?{}:T.params},Q)}}function b(T,$){const L=u=I(T),H=l.value,Q=T.state,p=T.force,m=T.replace===!0,_=K(L,H);if(_)return b(ne(C(_),{state:typeof _=="object"?ne({},Q,_.state):Q,force:p,replace:m}),$||L);const w=L;w.redirectedFrom=$;let R;return!p&&Tf(s,H,L)&&(R=xn(_e.NAVIGATION_DUPLICATED,{to:w,from:H}),st(H,H,!0,!1)),(R?Promise.resolve(R):Fe(w,H)).catch(S=>yt(S)?yt(S,_e.NAVIGATION_GUARD_REDIRECT)?S:xt(S):te(S,w,H)).then(S=>{if(S){if(yt(S,_e.NAVIGATION_GUARD_REDIRECT))return b(ne({replace:m},C(S.to),{state:typeof S.to=="object"?ne({},Q,S.to.state):Q,force:p}),$||w)}else S=Qt(w,H,!0,m,Q);return tt(w,H,S),S})}function y(T,$){const L=U(T,$);return L?Promise.reject(L):Promise.resolve()}function k(T){const $=gn.values().next().value;return $&&typeof $.runWithContext=="function"?$.runWithContext(T):T()}function Fe(T,$){let L;const[H,Q,p]=Hf(T,$);L=Nr(H.reverse(),"beforeRouteLeave",T,$);for(const _ of H)_.leaveGuards.forEach(w=>{L.push(Vt(w,T,$))});const m=y.bind(null,T,$);return L.push(m),je(L).then(()=>{L=[];for(const _ of i.list())L.push(Vt(_,T,$));return L.push(m),je(L)}).then(()=>{L=Nr(Q,"beforeRouteUpdate",T,$);for(const _ of Q)_.updateGuards.forEach(w=>{L.push(Vt(w,T,$))});return L.push(m),je(L)}).then(()=>{L=[];for(const _ of p)if(_.beforeEnter)if(Ze(_.beforeEnter))for(const w of _.beforeEnter)L.push(Vt(w,T,$));else L.push(Vt(_.beforeEnter,T,$));return L.push(m),je(L)}).then(()=>(T.matched.forEach(_=>_.enterCallbacks={}),L=Nr(p,"beforeRouteEnter",T,$,k),L.push(m),je(L))).then(()=>{L=[];for(const _ of o.list())L.push(Vt(_,T,$));return L.push(m),je(L)}).catch(_=>yt(_,_e.NAVIGATION_CANCELLED)?_:Promise.reject(_))}function tt(T,$,L){a.list().forEach(H=>k(()=>H(T,$,L)))}function Qt(T,$,L,H,Q){const p=U(T,$);if(p)return p;const m=$===Lt,_=vn?history.state:{};L&&(H||m?r.replace(T.fullPath,ne({scroll:m&&_&&_.scroll},Q)):r.push(T.fullPath,Q)),l.value=T,st(T,$,L,m),xt()}let nt;function Hn(){nt||(nt=r.listen((T,$,L)=>{if(!Zt.listening)return;const H=I(T),Q=K(H,Zt.currentRoute.value);if(Q){b(ne(Q,{replace:!0,force:!0}),H).catch(ss);return}u=H;const p=l.value;vn&&xf(Oo(p.fullPath,L.delta),fr()),Fe(H,p).catch(m=>yt(m,_e.NAVIGATION_ABORTED|_e.NAVIGATION_CANCELLED)?m:yt(m,_e.NAVIGATION_GUARD_REDIRECT)?(b(ne(C(m.to),{force:!0}),H).then(_=>{yt(_,_e.NAVIGATION_ABORTED|_e.NAVIGATION_DUPLICATED)&&!L.delta&&L.type===Zr.pop&&r.go(-1,!1)}).catch(ss),Promise.reject()):(L.delta&&r.go(-L.delta,!1),te(m,H,p))).then(m=>{m=m||Qt(H,p,!1),m&&(L.delta&&!yt(m,_e.NAVIGATION_CANCELLED)?r.go(-L.delta,!1):L.type===Zr.pop&&yt(m,_e.NAVIGATION_ABORTED|_e.NAVIGATION_DUPLICATED)&&r.go(-1,!1)),tt(H,p,m)}).catch(ss)}))}let pn=Gn(),Ie=Gn(),le;function te(T,$,L){xt(T);const H=Ie.list();return H.length?H.forEach(Q=>Q(T,$,L)):console.error(T),Promise.reject(T)}function gt(){return le&&l.value!==Lt?Promise.resolve():new Promise((T,$)=>{pn.add([T,$])})}function xt(T){return le||(le=!T,Hn(),pn.list().forEach(([$,L])=>T?L(T):$()),pn.reset()),T}function st(T,$,L,H){const{scrollBehavior:Q}=t;if(!vn||!Q)return Promise.resolve();const p=!L&&Lf(Oo(T.fullPath,0))||(H||!L)&&history.state&&history.state.scroll||null;return Si().then(()=>Q(T,$,p)).then(m=>m&&Df(m)).catch(m=>te(m,T,$))}const De=T=>r.go(T);let mn;const gn=new Set,Zt={currentRoute:l,listening:!0,addRoute:g,removeRoute:v,clearRoutes:e.clearRoutes,hasRoute:O,getRoutes:E,resolve:I,options:t,push:B,replace:ee,go:De,back:()=>De(-1),forward:()=>De(1),beforeEach:i.add,beforeResolve:o.add,afterEach:a.add,onError:Ie.add,isReady:gt,install(T){T.component("RouterLink",ch),T.component("RouterView",hh),T.config.globalProperties.$router=Zt,Object.defineProperty(T.config.globalProperties,"$route",{enumerable:!0,get:()=>wn(l)}),vn&&!mn&&l.value===Lt&&(mn=!0,B(r.location).catch(H=>{}));const $={};for(const H in Lt)Object.defineProperty($,H,{get:()=>l.value[H],enumerable:!0});T.provide(hr,Zt),T.provide(Ni,Wa($)),T.provide(ti,l);const L=T.unmount;gn.add(T),T.unmount=function(){gn.delete(T),gn.size<1&&(u=Lt,nt&&nt(),nt=null,l.value=Lt,mn=!1,le=!1),L()}}};function je(T){return T.reduce(($,L)=>$.then(()=>k(L)),Promise.resolve())}return Zt}function Di(){return Xe(hr)}function mh(t){return Xe(Ni)}const gh=()=>{};var Wo={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Hl=function(t){const e=[];let n=0;for(let s=0;s<t.length;s++){let r=t.charCodeAt(s);r<128?e[n++]=r:r<2048?(e[n++]=r>>6|192,e[n++]=r&63|128):(r&64512)===55296&&s+1<t.length&&(t.charCodeAt(s+1)&64512)===56320?(r=65536+((r&1023)<<10)+(t.charCodeAt(++s)&1023),e[n++]=r>>18|240,e[n++]=r>>12&63|128,e[n++]=r>>6&63|128,e[n++]=r&63|128):(e[n++]=r>>12|224,e[n++]=r>>6&63|128,e[n++]=r&63|128)}return e},_h=function(t){const e=[];let n=0,s=0;for(;n<t.length;){const r=t[n++];if(r<128)e[s++]=String.fromCharCode(r);else if(r>191&&r<224){const i=t[n++];e[s++]=String.fromCharCode((r&31)<<6|i&63)}else if(r>239&&r<365){const i=t[n++],o=t[n++],a=t[n++],l=((r&7)<<18|(i&63)<<12|(o&63)<<6|a&63)-65536;e[s++]=String.fromCharCode(55296+(l>>10)),e[s++]=String.fromCharCode(56320+(l&1023))}else{const i=t[n++],o=t[n++];e[s++]=String.fromCharCode((r&15)<<12|(i&63)<<6|o&63)}}return e.join("")},jl={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(t,e){if(!Array.isArray(t))throw Error("encodeByteArray takes an array as a parameter");this.init_();const n=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,s=[];for(let r=0;r<t.length;r+=3){const i=t[r],o=r+1<t.length,a=o?t[r+1]:0,l=r+2<t.length,u=l?t[r+2]:0,f=i>>2,d=(i&3)<<4|a>>4;let h=(a&15)<<2|u>>6,g=u&63;l||(g=64,o||(h=64)),s.push(n[f],n[d],n[h],n[g])}return s.join("")},encodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(t):this.encodeByteArray(Hl(t),e)},decodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(t):_h(this.decodeStringToByteArray(t,e))},decodeStringToByteArray(t,e){this.init_();const n=e?this.charToByteMapWebSafe_:this.charToByteMap_,s=[];for(let r=0;r<t.length;){const i=n[t.charAt(r++)],a=r<t.length?n[t.charAt(r)]:0;++r;const u=r<t.length?n[t.charAt(r)]:64;++r;const d=r<t.length?n[t.charAt(r)]:64;if(++r,i==null||a==null||u==null||d==null)throw new yh;const h=i<<2|a>>4;if(s.push(h),u!==64){const g=a<<4&240|u>>2;if(s.push(g),d!==64){const v=u<<6&192|d;s.push(v)}}}return s},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let t=0;t<this.ENCODED_VALS.length;t++)this.byteToCharMap_[t]=this.ENCODED_VALS.charAt(t),this.charToByteMap_[this.byteToCharMap_[t]]=t,this.byteToCharMapWebSafe_[t]=this.ENCODED_VALS_WEBSAFE.charAt(t),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[t]]=t,t>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(t)]=t,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(t)]=t)}}};class yh extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const vh=function(t){const e=Hl(t);return jl.encodeByteArray(e,!0)},Wl=function(t){return vh(t).replace(/\./g,"")},Kl=function(t){try{return jl.decodeString(t,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function bh(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Eh=()=>bh().__FIREBASE_DEFAULTS__,Ih=()=>{if(typeof process>"u"||typeof Wo>"u")return;const t=Wo.__FIREBASE_DEFAULTS__;if(t)return JSON.parse(t)},wh=()=>{if(typeof document>"u")return;let t;try{t=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=t&&Kl(t[1]);return e&&JSON.parse(e)},xi=()=>{try{return gh()||Eh()||Ih()||wh()}catch(t){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${t}`);return}},Sh=t=>{var e,n;return(n=(e=xi())==null?void 0:e.emulatorHosts)==null?void 0:n[t]},Gl=()=>{var t;return(t=xi())==null?void 0:t.config},zl=t=>{var e;return(e=xi())==null?void 0:e[`_${t}`]};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ch{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}wrapCallback(e){return(n,s)=>{n?this.reject(n):this.resolve(s),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(n):e(n,s))}}}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function pr(t){try{return(t.startsWith("http://")||t.startsWith("https://")?new URL(t).hostname:t).endsWith(".cloudworkstations.dev")}catch{return!1}}async function Th(t){return(await fetch(t,{credentials:"include"})).ok}const rs={};function Ah(){const t={prod:[],emulator:[]};for(const e of Object.keys(rs))rs[e]?t.emulator.push(e):t.prod.push(e);return t}function Rh(t){let e=document.getElementById(t),n=!1;return e||(e=document.createElement("div"),e.setAttribute("id",t),n=!0),{created:n,element:e}}let Ko=!1;function Ph(t,e){if(typeof window>"u"||typeof document>"u"||!pr(window.location.host)||rs[t]===e||rs[t]||Ko)return;rs[t]=e;function n(h){return`__firebase__banner__${h}`}const s="__firebase__banner",i=Ah().prod.length>0;function o(){const h=document.getElementById(s);h&&h.remove()}function a(h){h.style.display="flex",h.style.background="#7faaf0",h.style.position="fixed",h.style.bottom="5px",h.style.left="5px",h.style.padding=".5em",h.style.borderRadius="5px",h.style.alignItems="center"}function l(h,g){h.setAttribute("width","24"),h.setAttribute("id",g),h.setAttribute("height","24"),h.setAttribute("viewBox","0 0 24 24"),h.setAttribute("fill","none"),h.style.marginLeft="-6px"}function u(){const h=document.createElement("span");return h.style.cursor="pointer",h.style.marginLeft="16px",h.style.fontSize="24px",h.innerHTML=" &times;",h.onclick=()=>{Ko=!0,o()},h}function f(h,g){h.setAttribute("id",g),h.innerText="Learn more",h.href="https://firebase.google.com/docs/studio/preview-apps#preview-backend",h.setAttribute("target","__blank"),h.style.paddingLeft="5px",h.style.textDecoration="underline"}function d(){const h=Rh(s),g=n("text"),v=document.getElementById(g)||document.createElement("span"),E=n("learnmore"),O=document.getElementById(E)||document.createElement("a"),I=n("preprendIcon"),C=document.getElementById(I)||document.createElementNS("http://www.w3.org/2000/svg","svg");if(h.created){const U=h.element;a(U),f(O,E);const B=u();l(C,I),U.append(C,v,O,B),document.body.appendChild(U)}i?(v.innerText="Preview backend disconnected.",C.innerHTML=`<g clip-path="url(#clip0_6013_33858)">
<path d="M4.8 17.6L12 5.6L19.2 17.6H4.8ZM6.91667 16.4H17.0833L12 7.93333L6.91667 16.4ZM12 15.6C12.1667 15.6 12.3056 15.5444 12.4167 15.4333C12.5389 15.3111 12.6 15.1667 12.6 15C12.6 14.8333 12.5389 14.6944 12.4167 14.5833C12.3056 14.4611 12.1667 14.4 12 14.4C11.8333 14.4 11.6889 14.4611 11.5667 14.5833C11.4556 14.6944 11.4 14.8333 11.4 15C11.4 15.1667 11.4556 15.3111 11.5667 15.4333C11.6889 15.5444 11.8333 15.6 12 15.6ZM11.4 13.6H12.6V10.4H11.4V13.6Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6013_33858">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`):(C.innerHTML=`<g clip-path="url(#clip0_6083_34804)">
<path d="M11.4 15.2H12.6V11.2H11.4V15.2ZM12 10C12.1667 10 12.3056 9.94444 12.4167 9.83333C12.5389 9.71111 12.6 9.56667 12.6 9.4C12.6 9.23333 12.5389 9.09444 12.4167 8.98333C12.3056 8.86111 12.1667 8.8 12 8.8C11.8333 8.8 11.6889 8.86111 11.5667 8.98333C11.4556 9.09444 11.4 9.23333 11.4 9.4C11.4 9.56667 11.4556 9.71111 11.5667 9.83333C11.6889 9.94444 11.8333 10 12 10ZM12 18.4C11.1222 18.4 10.2944 18.2333 9.51667 17.9C8.73889 17.5667 8.05556 17.1111 7.46667 16.5333C6.88889 15.9444 6.43333 15.2611 6.1 14.4833C5.76667 13.7056 5.6 12.8778 5.6 12C5.6 11.1111 5.76667 10.2833 6.1 9.51667C6.43333 8.73889 6.88889 8.06111 7.46667 7.48333C8.05556 6.89444 8.73889 6.43333 9.51667 6.1C10.2944 5.76667 11.1222 5.6 12 5.6C12.8889 5.6 13.7167 5.76667 14.4833 6.1C15.2611 6.43333 15.9389 6.89444 16.5167 7.48333C17.1056 8.06111 17.5667 8.73889 17.9 9.51667C18.2333 10.2833 18.4 11.1111 18.4 12C18.4 12.8778 18.2333 13.7056 17.9 14.4833C17.5667 15.2611 17.1056 15.9444 16.5167 16.5333C15.9389 17.1111 15.2611 17.5667 14.4833 17.9C13.7167 18.2333 12.8889 18.4 12 18.4ZM12 17.2C13.4444 17.2 14.6722 16.6944 15.6833 15.6833C16.6944 14.6722 17.2 13.4444 17.2 12C17.2 10.5556 16.6944 9.32778 15.6833 8.31667C14.6722 7.30555 13.4444 6.8 12 6.8C10.5556 6.8 9.32778 7.30555 8.31667 8.31667C7.30556 9.32778 6.8 10.5556 6.8 12C6.8 13.4444 7.30556 14.6722 8.31667 15.6833C9.32778 16.6944 10.5556 17.2 12 17.2Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6083_34804">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`,v.innerText="Preview backend running in this workspace."),v.setAttribute("id",g)}document.readyState==="loading"?window.addEventListener("DOMContentLoaded",d):d()}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ne(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function kh(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(Ne())}function Oh(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function Nh(){const t=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof t=="object"&&t.id!==void 0}function Dh(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function xh(){const t=Ne();return t.indexOf("MSIE ")>=0||t.indexOf("Trident/")>=0}function Lh(){try{return typeof indexedDB=="object"}catch{return!1}}function Mh(){return new Promise((t,e)=>{try{let n=!0;const s="validate-browser-context-for-indexeddb-analytics-module",r=self.indexedDB.open(s);r.onsuccess=()=>{r.result.close(),n||self.indexedDB.deleteDatabase(s),t(!0)},r.onupgradeneeded=()=>{n=!1},r.onerror=()=>{var i;e(((i=r.error)==null?void 0:i.message)||"")}}catch(n){e(n)}})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Uh="FirebaseError";class Yt extends Error{constructor(e,n,s){super(n),this.code=e,this.customData=s,this.name=Uh,Object.setPrototypeOf(this,Yt.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,bs.prototype.create)}}class bs{constructor(e,n,s){this.service=e,this.serviceName=n,this.errors=s}create(e,...n){const s=n[0]||{},r=`${this.service}/${e}`,i=this.errors[e],o=i?Fh(i,s):"Error",a=`${this.serviceName}: ${o} (${r}).`;return new Yt(r,a,s)}}function Fh(t,e){return t.replace(Vh,(n,s)=>{const r=e[s];return r!=null?String(r):`<${s}?>`})}const Vh=/\{\$([^}]+)}/g;function $h(t){for(const e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}function Ln(t,e){if(t===e)return!0;const n=Object.keys(t),s=Object.keys(e);for(const r of n){if(!s.includes(r))return!1;const i=t[r],o=e[r];if(Go(i)&&Go(o)){if(!Ln(i,o))return!1}else if(i!==o)return!1}for(const r of s)if(!n.includes(r))return!1;return!0}function Go(t){return t!==null&&typeof t=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Es(t){const e=[];for(const[n,s]of Object.entries(t))Array.isArray(s)?s.forEach(r=>{e.push(encodeURIComponent(n)+"="+encodeURIComponent(r))}):e.push(encodeURIComponent(n)+"="+encodeURIComponent(s));return e.length?"&"+e.join("&"):""}function qn(t){const e={};return t.replace(/^\?/,"").split("&").forEach(s=>{if(s){const[r,i]=s.split("=");e[decodeURIComponent(r)]=decodeURIComponent(i)}}),e}function Jn(t){const e=t.indexOf("?");if(!e)return"";const n=t.indexOf("#",e);return t.substring(e,n>0?n:void 0)}function Bh(t,e){const n=new Hh(t,e);return n.subscribe.bind(n)}class Hh{constructor(e,n){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=n,this.task.then(()=>{e(this)}).catch(s=>{this.error(s)})}next(e){this.forEachObserver(n=>{n.next(e)})}error(e){this.forEachObserver(n=>{n.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,n,s){let r;if(e===void 0&&n===void 0&&s===void 0)throw new Error("Missing Observer.");jh(e,["next","error","complete"])?r=e:r={next:e,error:n,complete:s},r.next===void 0&&(r.next=Dr),r.error===void 0&&(r.error=Dr),r.complete===void 0&&(r.complete=Dr);const i=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?r.error(this.finalError):r.complete()}catch{}}),this.observers.push(r),i}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let n=0;n<this.observers.length;n++)this.sendOne(n,e)}sendOne(e,n){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{n(this.observers[e])}catch(s){typeof console<"u"&&console.error&&console.error(s)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function jh(t,e){if(typeof t!="object"||t===null)return!1;for(const n of e)if(n in t&&typeof t[n]=="function")return!0;return!1}function Dr(){}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Dt(t){return t&&t._delegate?t._delegate:t}class Mn{constructor(e,n,s){this.name=e,this.instanceFactory=n,this.type=s,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const rn="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wh{constructor(e,n){this.name=e,this.container=n,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const n=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(n)){const s=new Ch;if(this.instancesDeferred.set(n,s),this.isInitialized(n)||this.shouldAutoInitialize())try{const r=this.getOrInitializeService({instanceIdentifier:n});r&&s.resolve(r)}catch{}}return this.instancesDeferred.get(n).promise}getImmediate(e){const n=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),s=(e==null?void 0:e.optional)??!1;if(this.isInitialized(n)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:n})}catch(r){if(s)return null;throw r}else{if(s)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(Gh(e))try{this.getOrInitializeService({instanceIdentifier:rn})}catch{}for(const[n,s]of this.instancesDeferred.entries()){const r=this.normalizeInstanceIdentifier(n);try{const i=this.getOrInitializeService({instanceIdentifier:r});s.resolve(i)}catch{}}}}clearInstance(e=rn){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(n=>"INTERNAL"in n).map(n=>n.INTERNAL.delete()),...e.filter(n=>"_delete"in n).map(n=>n._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=rn){return this.instances.has(e)}getOptions(e=rn){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:n={}}=e,s=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(s))throw Error(`${this.name}(${s}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const r=this.getOrInitializeService({instanceIdentifier:s,options:n});for(const[i,o]of this.instancesDeferred.entries()){const a=this.normalizeInstanceIdentifier(i);s===a&&o.resolve(r)}return r}onInit(e,n){const s=this.normalizeInstanceIdentifier(n),r=this.onInitCallbacks.get(s)??new Set;r.add(e),this.onInitCallbacks.set(s,r);const i=this.instances.get(s);return i&&e(i,s),()=>{r.delete(e)}}invokeOnInitCallbacks(e,n){const s=this.onInitCallbacks.get(n);if(s)for(const r of s)try{r(e,n)}catch{}}getOrInitializeService({instanceIdentifier:e,options:n={}}){let s=this.instances.get(e);if(!s&&this.component&&(s=this.component.instanceFactory(this.container,{instanceIdentifier:Kh(e),options:n}),this.instances.set(e,s),this.instancesOptions.set(e,n),this.invokeOnInitCallbacks(s,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,s)}catch{}return s||null}normalizeInstanceIdentifier(e=rn){return this.component?this.component.multipleInstances?e:rn:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function Kh(t){return t===rn?void 0:t}function Gh(t){return t.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zh{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const n=this.getProvider(e.name);if(n.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);n.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const n=new Wh(e,this);return this.providers.set(e,n),n}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var ce;(function(t){t[t.DEBUG=0]="DEBUG",t[t.VERBOSE=1]="VERBOSE",t[t.INFO=2]="INFO",t[t.WARN=3]="WARN",t[t.ERROR=4]="ERROR",t[t.SILENT=5]="SILENT"})(ce||(ce={}));const qh={debug:ce.DEBUG,verbose:ce.VERBOSE,info:ce.INFO,warn:ce.WARN,error:ce.ERROR,silent:ce.SILENT},Jh=ce.INFO,Yh={[ce.DEBUG]:"log",[ce.VERBOSE]:"log",[ce.INFO]:"info",[ce.WARN]:"warn",[ce.ERROR]:"error"},Xh=(t,e,...n)=>{if(e<t.logLevel)return;const s=new Date().toISOString(),r=Yh[e];if(r)console[r](`[${s}]  ${t.name}:`,...n);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class ql{constructor(e){this.name=e,this._logLevel=Jh,this._logHandler=Xh,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in ce))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?qh[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,ce.DEBUG,...e),this._logHandler(this,ce.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,ce.VERBOSE,...e),this._logHandler(this,ce.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,ce.INFO,...e),this._logHandler(this,ce.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,ce.WARN,...e),this._logHandler(this,ce.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,ce.ERROR,...e),this._logHandler(this,ce.ERROR,...e)}}const Qh=(t,e)=>e.some(n=>t instanceof n);let zo,qo;function Zh(){return zo||(zo=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function ep(){return qo||(qo=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const Jl=new WeakMap,ni=new WeakMap,Yl=new WeakMap,xr=new WeakMap,Li=new WeakMap;function tp(t){const e=new Promise((n,s)=>{const r=()=>{t.removeEventListener("success",i),t.removeEventListener("error",o)},i=()=>{n(Gt(t.result)),r()},o=()=>{s(t.error),r()};t.addEventListener("success",i),t.addEventListener("error",o)});return e.then(n=>{n instanceof IDBCursor&&Jl.set(n,t)}).catch(()=>{}),Li.set(e,t),e}function np(t){if(ni.has(t))return;const e=new Promise((n,s)=>{const r=()=>{t.removeEventListener("complete",i),t.removeEventListener("error",o),t.removeEventListener("abort",o)},i=()=>{n(),r()},o=()=>{s(t.error||new DOMException("AbortError","AbortError")),r()};t.addEventListener("complete",i),t.addEventListener("error",o),t.addEventListener("abort",o)});ni.set(t,e)}let si={get(t,e,n){if(t instanceof IDBTransaction){if(e==="done")return ni.get(t);if(e==="objectStoreNames")return t.objectStoreNames||Yl.get(t);if(e==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return Gt(t[e])},set(t,e,n){return t[e]=n,!0},has(t,e){return t instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in t}};function sp(t){si=t(si)}function rp(t){return t===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...n){const s=t.call(Lr(this),e,...n);return Yl.set(s,e.sort?e.sort():[e]),Gt(s)}:ep().includes(t)?function(...e){return t.apply(Lr(this),e),Gt(Jl.get(this))}:function(...e){return Gt(t.apply(Lr(this),e))}}function ip(t){return typeof t=="function"?rp(t):(t instanceof IDBTransaction&&np(t),Qh(t,Zh())?new Proxy(t,si):t)}function Gt(t){if(t instanceof IDBRequest)return tp(t);if(xr.has(t))return xr.get(t);const e=ip(t);return e!==t&&(xr.set(t,e),Li.set(e,t)),e}const Lr=t=>Li.get(t);function op(t,e,{blocked:n,upgrade:s,blocking:r,terminated:i}={}){const o=indexedDB.open(t,e),a=Gt(o);return s&&o.addEventListener("upgradeneeded",l=>{s(Gt(o.result),l.oldVersion,l.newVersion,Gt(o.transaction),l)}),n&&o.addEventListener("blocked",l=>n(l.oldVersion,l.newVersion,l)),a.then(l=>{i&&l.addEventListener("close",()=>i()),r&&l.addEventListener("versionchange",u=>r(u.oldVersion,u.newVersion,u))}).catch(()=>{}),a}const ap=["get","getKey","getAll","getAllKeys","count"],lp=["put","add","delete","clear"],Mr=new Map;function Jo(t,e){if(!(t instanceof IDBDatabase&&!(e in t)&&typeof e=="string"))return;if(Mr.get(e))return Mr.get(e);const n=e.replace(/FromIndex$/,""),s=e!==n,r=lp.includes(n);if(!(n in(s?IDBIndex:IDBObjectStore).prototype)||!(r||ap.includes(n)))return;const i=async function(o,...a){const l=this.transaction(o,r?"readwrite":"readonly");let u=l.store;return s&&(u=u.index(a.shift())),(await Promise.all([u[n](...a),r&&l.done]))[0]};return Mr.set(e,i),i}sp(t=>({...t,get:(e,n,s)=>Jo(e,n)||t.get(e,n,s),has:(e,n)=>!!Jo(e,n)||t.has(e,n)}));/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cp{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(n=>{if(up(n)){const s=n.getImmediate();return`${s.library}/${s.version}`}else return null}).filter(n=>n).join(" ")}}function up(t){const e=t.getComponent();return(e==null?void 0:e.type)==="VERSION"}const ri="@firebase/app",Yo="0.14.9";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const kt=new ql("@firebase/app"),dp="@firebase/app-compat",fp="@firebase/analytics-compat",hp="@firebase/analytics",pp="@firebase/app-check-compat",mp="@firebase/app-check",gp="@firebase/auth",_p="@firebase/auth-compat",yp="@firebase/database",vp="@firebase/data-connect",bp="@firebase/database-compat",Ep="@firebase/functions",Ip="@firebase/functions-compat",wp="@firebase/installations",Sp="@firebase/installations-compat",Cp="@firebase/messaging",Tp="@firebase/messaging-compat",Ap="@firebase/performance",Rp="@firebase/performance-compat",Pp="@firebase/remote-config",kp="@firebase/remote-config-compat",Op="@firebase/storage",Np="@firebase/storage-compat",Dp="@firebase/firestore",xp="@firebase/ai",Lp="@firebase/firestore-compat",Mp="firebase",Up="12.10.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ii="[DEFAULT]",Fp={[ri]:"fire-core",[dp]:"fire-core-compat",[hp]:"fire-analytics",[fp]:"fire-analytics-compat",[mp]:"fire-app-check",[pp]:"fire-app-check-compat",[gp]:"fire-auth",[_p]:"fire-auth-compat",[yp]:"fire-rtdb",[vp]:"fire-data-connect",[bp]:"fire-rtdb-compat",[Ep]:"fire-fn",[Ip]:"fire-fn-compat",[wp]:"fire-iid",[Sp]:"fire-iid-compat",[Cp]:"fire-fcm",[Tp]:"fire-fcm-compat",[Ap]:"fire-perf",[Rp]:"fire-perf-compat",[Pp]:"fire-rc",[kp]:"fire-rc-compat",[Op]:"fire-gcs",[Np]:"fire-gcs-compat",[Dp]:"fire-fst",[Lp]:"fire-fst-compat",[xp]:"fire-vertex","fire-js":"fire-js",[Mp]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qs=new Map,Vp=new Map,oi=new Map;function Xo(t,e){try{t.container.addComponent(e)}catch(n){kt.debug(`Component ${e.name} failed to register with FirebaseApp ${t.name}`,n)}}function hs(t){const e=t.name;if(oi.has(e))return kt.debug(`There were multiple attempts to register component ${e}.`),!1;oi.set(e,t);for(const n of qs.values())Xo(n,t);for(const n of Vp.values())Xo(n,t);return!0}function Xl(t,e){const n=t.container.getProvider("heartbeat").getImmediate({optional:!0});return n&&n.triggerHeartbeat(),t.container.getProvider(e)}function ut(t){return t==null?!1:t.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $p={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},zt=new bs("app","Firebase",$p);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bp{constructor(e,n,s){this._isDeleted=!1,this._options={...e},this._config={...n},this._name=n.name,this._automaticDataCollectionEnabled=n.automaticDataCollectionEnabled,this._container=s,this.container.addComponent(new Mn("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw zt.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Is=Up;function Ql(t,e={}){let n=t;typeof e!="object"&&(e={name:e});const s={name:ii,automaticDataCollectionEnabled:!0,...e},r=s.name;if(typeof r!="string"||!r)throw zt.create("bad-app-name",{appName:String(r)});if(n||(n=Gl()),!n)throw zt.create("no-options");const i=qs.get(r);if(i){if(Ln(n,i.options)&&Ln(s,i.config))return i;throw zt.create("duplicate-app",{appName:r})}const o=new zh(r);for(const l of oi.values())o.addComponent(l);const a=new Bp(n,s,o);return qs.set(r,a),a}function Hp(t=ii){const e=qs.get(t);if(!e&&t===ii&&Gl())return Ql();if(!e)throw zt.create("no-app",{appName:t});return e}function Tn(t,e,n){let s=Fp[t]??t;n&&(s+=`-${n}`);const r=s.match(/\s|\//),i=e.match(/\s|\//);if(r||i){const o=[`Unable to register library "${s}" with version "${e}":`];r&&o.push(`library name "${s}" contains illegal characters (whitespace or "/")`),r&&i&&o.push("and"),i&&o.push(`version name "${e}" contains illegal characters (whitespace or "/")`),kt.warn(o.join(" "));return}hs(new Mn(`${s}-version`,()=>({library:s,version:e}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const jp="firebase-heartbeat-database",Wp=1,ps="firebase-heartbeat-store";let Ur=null;function Zl(){return Ur||(Ur=op(jp,Wp,{upgrade:(t,e)=>{switch(e){case 0:try{t.createObjectStore(ps)}catch(n){console.warn(n)}}}}).catch(t=>{throw zt.create("idb-open",{originalErrorMessage:t.message})})),Ur}async function Kp(t){try{const n=(await Zl()).transaction(ps),s=await n.objectStore(ps).get(ec(t));return await n.done,s}catch(e){if(e instanceof Yt)kt.warn(e.message);else{const n=zt.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});kt.warn(n.message)}}}async function Qo(t,e){try{const s=(await Zl()).transaction(ps,"readwrite");await s.objectStore(ps).put(e,ec(t)),await s.done}catch(n){if(n instanceof Yt)kt.warn(n.message);else{const s=zt.create("idb-set",{originalErrorMessage:n==null?void 0:n.message});kt.warn(s.message)}}}function ec(t){return`${t.name}!${t.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Gp=1024,zp=30;class qp{constructor(e){this.container=e,this._heartbeatsCache=null;const n=this.container.getProvider("app").getImmediate();this._storage=new Yp(n),this._heartbeatsCachePromise=this._storage.read().then(s=>(this._heartbeatsCache=s,s))}async triggerHeartbeat(){var e,n;try{const r=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),i=Zo();if(((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((n=this._heartbeatsCache)==null?void 0:n.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===i||this._heartbeatsCache.heartbeats.some(o=>o.date===i))return;if(this._heartbeatsCache.heartbeats.push({date:i,agent:r}),this._heartbeatsCache.heartbeats.length>zp){const o=Xp(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(o,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(s){kt.warn(s)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const n=Zo(),{heartbeatsToSend:s,unsentEntries:r}=Jp(this._heartbeatsCache.heartbeats),i=Wl(JSON.stringify({version:2,heartbeats:s}));return this._heartbeatsCache.lastSentHeartbeatDate=n,r.length>0?(this._heartbeatsCache.heartbeats=r,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),i}catch(n){return kt.warn(n),""}}}function Zo(){return new Date().toISOString().substring(0,10)}function Jp(t,e=Gp){const n=[];let s=t.slice();for(const r of t){const i=n.find(o=>o.agent===r.agent);if(i){if(i.dates.push(r.date),ea(n)>e){i.dates.pop();break}}else if(n.push({agent:r.agent,dates:[r.date]}),ea(n)>e){n.pop();break}s=s.slice(1)}return{heartbeatsToSend:n,unsentEntries:s}}class Yp{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return Lh()?Mh().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const n=await Kp(this.app);return n!=null&&n.heartbeats?n:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){if(await this._canUseIndexedDBPromise){const s=await this.read();return Qo(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??s.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){if(await this._canUseIndexedDBPromise){const s=await this.read();return Qo(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??s.lastSentHeartbeatDate,heartbeats:[...s.heartbeats,...e.heartbeats]})}else return}}function ea(t){return Wl(JSON.stringify({version:2,heartbeats:t})).length}function Xp(t){if(t.length===0)return-1;let e=0,n=t[0].date;for(let s=1;s<t.length;s++)t[s].date<n&&(n=t[s].date,e=s);return e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Qp(t){hs(new Mn("platform-logger",e=>new cp(e),"PRIVATE")),hs(new Mn("heartbeat",e=>new qp(e),"PRIVATE")),Tn(ri,Yo,t),Tn(ri,Yo,"esm2020"),Tn("fire-js","")}Qp("");function tc(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const Zp=tc,nc=new bs("auth","Firebase",tc());/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Js=new ql("@firebase/auth");function em(t,...e){Js.logLevel<=ce.WARN&&Js.warn(`Auth (${Is}): ${t}`,...e)}function Ms(t,...e){Js.logLevel<=ce.ERROR&&Js.error(`Auth (${Is}): ${t}`,...e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function et(t,...e){throw Mi(t,...e)}function ft(t,...e){return Mi(t,...e)}function sc(t,e,n){const s={...Zp(),[e]:n};return new bs("auth","Firebase",s).create(e,{appName:t.name})}function qt(t){return sc(t,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function Mi(t,...e){if(typeof t!="string"){const n=e[0],s=[...e.slice(1)];return s[0]&&(s[0].appName=t.name),t._errorFactory.create(n,...s)}return nc.create(t,...e)}function G(t,e,...n){if(!t)throw Mi(e,...n)}function wt(t){const e="INTERNAL ASSERTION FAILED: "+t;throw Ms(e),new Error(e)}function Ot(t,e){t||wt(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ai(){var t;return typeof self<"u"&&((t=self.location)==null?void 0:t.href)||""}function tm(){return ta()==="http:"||ta()==="https:"}function ta(){var t;return typeof self<"u"&&((t=self.location)==null?void 0:t.protocol)||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function nm(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(tm()||Nh()||"connection"in navigator)?navigator.onLine:!0}function sm(){if(typeof navigator>"u")return null;const t=navigator;return t.languages&&t.languages[0]||t.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ws{constructor(e,n){this.shortDelay=e,this.longDelay=n,Ot(n>e,"Short delay should be less than long delay!"),this.isMobile=kh()||Dh()}get(){return nm()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ui(t,e){Ot(t.emulator,"Emulator should always be set here");const{url:n}=t.emulator;return e?`${n}${e.startsWith("/")?e.slice(1):e}`:n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rc{static initialize(e,n,s){this.fetchImpl=e,n&&(this.headersImpl=n),s&&(this.responseImpl=s)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;wt("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;wt("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;wt("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const rm={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const im=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],om=new ws(3e4,6e4);function hn(t,e){return t.tenantId&&!e.tenantId?{...e,tenantId:t.tenantId}:e}async function Xt(t,e,n,s,r={}){return ic(t,r,async()=>{let i={},o={};s&&(e==="GET"?o=s:i={body:JSON.stringify(s)});const a=Es({key:t.config.apiKey,...o}).slice(1),l=await t._getAdditionalHeaders();l["Content-Type"]="application/json",t.languageCode&&(l["X-Firebase-Locale"]=t.languageCode);const u={method:e,headers:l,...i};return Oh()||(u.referrerPolicy="no-referrer"),t.emulatorConfig&&pr(t.emulatorConfig.host)&&(u.credentials="include"),rc.fetch()(await oc(t,t.config.apiHost,n,a),u)})}async function ic(t,e,n){t._canInitEmulator=!1;const s={...rm,...e};try{const r=new lm(t),i=await Promise.race([n(),r.promise]);r.clearNetworkTimeout();const o=await i.json();if("needConfirmation"in o)throw ks(t,"account-exists-with-different-credential",o);if(i.ok&&!("errorMessage"in o))return o;{const a=i.ok?o.errorMessage:o.error.message,[l,u]=a.split(" : ");if(l==="FEDERATED_USER_ID_ALREADY_LINKED")throw ks(t,"credential-already-in-use",o);if(l==="EMAIL_EXISTS")throw ks(t,"email-already-in-use",o);if(l==="USER_DISABLED")throw ks(t,"user-disabled",o);const f=s[l]||l.toLowerCase().replace(/[_\s]+/g,"-");if(u)throw sc(t,f,u);et(t,f)}}catch(r){if(r instanceof Yt)throw r;et(t,"network-request-failed",{message:String(r)})}}async function mr(t,e,n,s,r={}){const i=await Xt(t,e,n,s,r);return"mfaPendingCredential"in i&&et(t,"multi-factor-auth-required",{_serverResponse:i}),i}async function oc(t,e,n,s){const r=`${e}${n}?${s}`,i=t,o=i.config.emulator?Ui(t.config,r):`${t.config.apiScheme}://${r}`;return im.includes(n)&&(await i._persistenceManagerAvailable,i._getPersistenceType()==="COOKIE")?i._getPersistence()._getFinalTarget(o).toString():o}function am(t){switch(t){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}class lm{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((n,s)=>{this.timer=setTimeout(()=>s(ft(this.auth,"network-request-failed")),om.get())})}}function ks(t,e,n){const s={appName:t.name};n.email&&(s.email=n.email),n.phoneNumber&&(s.phoneNumber=n.phoneNumber);const r=ft(t,e,s);return r.customData._tokenResponse=n,r}function na(t){return t!==void 0&&t.enterprise!==void 0}class cm{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||this.recaptchaEnforcementState.length===0)return null;for(const n of this.recaptchaEnforcementState)if(n.provider&&n.provider===e)return am(n.enforcementState);return null}isProviderEnabled(e){return this.getProviderEnforcementState(e)==="ENFORCE"||this.getProviderEnforcementState(e)==="AUDIT"}isAnyProviderEnabled(){return this.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")||this.isProviderEnabled("PHONE_PROVIDER")}}async function um(t,e){return Xt(t,"GET","/v2/recaptchaConfig",hn(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function dm(t,e){return Xt(t,"POST","/v1/accounts:delete",e)}async function Ys(t,e){return Xt(t,"POST","/v1/accounts:lookup",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function is(t){if(t)try{const e=new Date(Number(t));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function fm(t,e=!1){const n=Dt(t),s=await n.getIdToken(e),r=Fi(s);G(r&&r.exp&&r.auth_time&&r.iat,n.auth,"internal-error");const i=typeof r.firebase=="object"?r.firebase:void 0,o=i==null?void 0:i.sign_in_provider;return{claims:r,token:s,authTime:is(Fr(r.auth_time)),issuedAtTime:is(Fr(r.iat)),expirationTime:is(Fr(r.exp)),signInProvider:o||null,signInSecondFactor:(i==null?void 0:i.sign_in_second_factor)||null}}function Fr(t){return Number(t)*1e3}function Fi(t){const[e,n,s]=t.split(".");if(e===void 0||n===void 0||s===void 0)return Ms("JWT malformed, contained fewer than 3 sections"),null;try{const r=Kl(n);return r?JSON.parse(r):(Ms("Failed to decode base64 JWT payload"),null)}catch(r){return Ms("Caught error parsing JWT payload as JSON",r==null?void 0:r.toString()),null}}function sa(t){const e=Fi(t);return G(e,"internal-error"),G(typeof e.exp<"u","internal-error"),G(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ms(t,e,n=!1){if(n)return e;try{return await e}catch(s){throw s instanceof Yt&&hm(s)&&t.auth.currentUser===t&&await t.auth.signOut(),s}}function hm({code:t}){return t==="auth/user-disabled"||t==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pm{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){if(e){const n=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),n}else{this.errorBackoff=3e4;const s=(this.user.stsTokenManager.expirationTime??0)-Date.now()-3e5;return Math.max(0,s)}}schedule(e=!1){if(!this.isRunning)return;const n=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},n)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class li{constructor(e,n){this.createdAt=e,this.lastLoginAt=n,this._initializeTime()}_initializeTime(){this.lastSignInTime=is(this.lastLoginAt),this.creationTime=is(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Xs(t){var d;const e=t.auth,n=await t.getIdToken(),s=await ms(t,Ys(e,{idToken:n}));G(s==null?void 0:s.users.length,e,"internal-error");const r=s.users[0];t._notifyReloadListener(r);const i=(d=r.providerUserInfo)!=null&&d.length?ac(r.providerUserInfo):[],o=gm(t.providerData,i),a=t.isAnonymous,l=!(t.email&&r.passwordHash)&&!(o!=null&&o.length),u=a?l:!1,f={uid:r.localId,displayName:r.displayName||null,photoURL:r.photoUrl||null,email:r.email||null,emailVerified:r.emailVerified||!1,phoneNumber:r.phoneNumber||null,tenantId:r.tenantId||null,providerData:o,metadata:new li(r.createdAt,r.lastLoginAt),isAnonymous:u};Object.assign(t,f)}async function mm(t){const e=Dt(t);await Xs(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function gm(t,e){return[...t.filter(s=>!e.some(r=>r.providerId===s.providerId)),...e]}function ac(t){return t.map(({providerId:e,...n})=>({providerId:e,uid:n.rawId||"",displayName:n.displayName||null,email:n.email||null,phoneNumber:n.phoneNumber||null,photoURL:n.photoUrl||null}))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function _m(t,e){const n=await ic(t,{},async()=>{const s=Es({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:r,apiKey:i}=t.config,o=await oc(t,r,"/v1/token",`key=${i}`),a=await t._getAdditionalHeaders();a["Content-Type"]="application/x-www-form-urlencoded";const l={method:"POST",headers:a,body:s};return t.emulatorConfig&&pr(t.emulatorConfig.host)&&(l.credentials="include"),rc.fetch()(o,l)});return{accessToken:n.access_token,expiresIn:n.expires_in,refreshToken:n.refresh_token}}async function ym(t,e){return Xt(t,"POST","/v2/accounts:revokeToken",hn(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class An{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){G(e.idToken,"internal-error"),G(typeof e.idToken<"u","internal-error"),G(typeof e.refreshToken<"u","internal-error");const n="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):sa(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,n)}updateFromIdToken(e){G(e.length!==0,"internal-error");const n=sa(e);this.updateTokensAndExpiration(e,null,n)}async getToken(e,n=!1){return!n&&this.accessToken&&!this.isExpired?this.accessToken:(G(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,n){const{accessToken:s,refreshToken:r,expiresIn:i}=await _m(e,n);this.updateTokensAndExpiration(s,r,Number(i))}updateTokensAndExpiration(e,n,s){this.refreshToken=n||null,this.accessToken=e||null,this.expirationTime=Date.now()+s*1e3}static fromJSON(e,n){const{refreshToken:s,accessToken:r,expirationTime:i}=n,o=new An;return s&&(G(typeof s=="string","internal-error",{appName:e}),o.refreshToken=s),r&&(G(typeof r=="string","internal-error",{appName:e}),o.accessToken=r),i&&(G(typeof i=="number","internal-error",{appName:e}),o.expirationTime=i),o}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new An,this.toJSON())}_performRefresh(){return wt("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Mt(t,e){G(typeof t=="string"||typeof t>"u","internal-error",{appName:e})}class Je{constructor({uid:e,auth:n,stsTokenManager:s,...r}){this.providerId="firebase",this.proactiveRefresh=new pm(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=n,this.stsTokenManager=s,this.accessToken=s.accessToken,this.displayName=r.displayName||null,this.email=r.email||null,this.emailVerified=r.emailVerified||!1,this.phoneNumber=r.phoneNumber||null,this.photoURL=r.photoURL||null,this.isAnonymous=r.isAnonymous||!1,this.tenantId=r.tenantId||null,this.providerData=r.providerData?[...r.providerData]:[],this.metadata=new li(r.createdAt||void 0,r.lastLoginAt||void 0)}async getIdToken(e){const n=await ms(this,this.stsTokenManager.getToken(this.auth,e));return G(n,this.auth,"internal-error"),this.accessToken!==n&&(this.accessToken=n,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),n}getIdTokenResult(e){return fm(this,e)}reload(){return mm(this)}_assign(e){this!==e&&(G(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(n=>({...n})),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const n=new Je({...this,auth:e,stsTokenManager:this.stsTokenManager._clone()});return n.metadata._copy(this.metadata),n}_onReload(e){G(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,n=!1){let s=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),s=!0),n&&await Xs(this),await this.auth._persistUserIfCurrent(this),s&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(ut(this.auth.app))return Promise.reject(qt(this.auth));const e=await this.getIdToken();return await ms(this,dm(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return{uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>({...e})),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId,...this.metadata.toJSON(),apiKey:this.auth.config.apiKey,appName:this.auth.name}}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,n){const s=n.displayName??void 0,r=n.email??void 0,i=n.phoneNumber??void 0,o=n.photoURL??void 0,a=n.tenantId??void 0,l=n._redirectEventId??void 0,u=n.createdAt??void 0,f=n.lastLoginAt??void 0,{uid:d,emailVerified:h,isAnonymous:g,providerData:v,stsTokenManager:E}=n;G(d&&E,e,"internal-error");const O=An.fromJSON(this.name,E);G(typeof d=="string",e,"internal-error"),Mt(s,e.name),Mt(r,e.name),G(typeof h=="boolean",e,"internal-error"),G(typeof g=="boolean",e,"internal-error"),Mt(i,e.name),Mt(o,e.name),Mt(a,e.name),Mt(l,e.name),Mt(u,e.name),Mt(f,e.name);const I=new Je({uid:d,auth:e,email:r,emailVerified:h,displayName:s,isAnonymous:g,photoURL:o,phoneNumber:i,tenantId:a,stsTokenManager:O,createdAt:u,lastLoginAt:f});return v&&Array.isArray(v)&&(I.providerData=v.map(C=>({...C}))),l&&(I._redirectEventId=l),I}static async _fromIdTokenResponse(e,n,s=!1){const r=new An;r.updateFromServerResponse(n);const i=new Je({uid:n.localId,auth:e,stsTokenManager:r,isAnonymous:s});return await Xs(i),i}static async _fromGetAccountInfoResponse(e,n,s){const r=n.users[0];G(r.localId!==void 0,"internal-error");const i=r.providerUserInfo!==void 0?ac(r.providerUserInfo):[],o=!(r.email&&r.passwordHash)&&!(i!=null&&i.length),a=new An;a.updateFromIdToken(s);const l=new Je({uid:r.localId,auth:e,stsTokenManager:a,isAnonymous:o}),u={uid:r.localId,displayName:r.displayName||null,photoURL:r.photoUrl||null,email:r.email||null,emailVerified:r.emailVerified||!1,phoneNumber:r.phoneNumber||null,tenantId:r.tenantId||null,providerData:i,metadata:new li(r.createdAt,r.lastLoginAt),isAnonymous:!(r.email&&r.passwordHash)&&!(i!=null&&i.length)};return Object.assign(l,u),l}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ra=new Map;function St(t){Ot(t instanceof Function,"Expected a class definition");let e=ra.get(t);return e?(Ot(e instanceof t,"Instance stored in cache mismatched with class"),e):(e=new t,ra.set(t,e),e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lc{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,n){this.storage[e]=n}async _get(e){const n=this.storage[e];return n===void 0?null:n}async _remove(e){delete this.storage[e]}_addListener(e,n){}_removeListener(e,n){}}lc.type="NONE";const ia=lc;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Us(t,e,n){return`firebase:${t}:${e}:${n}`}class Rn{constructor(e,n,s){this.persistence=e,this.auth=n,this.userKey=s;const{config:r,name:i}=this.auth;this.fullUserKey=Us(this.userKey,r.apiKey,i),this.fullPersistenceKey=Us("persistence",r.apiKey,i),this.boundEventHandler=n._onStorageEvent.bind(n),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const n=await Ys(this.auth,{idToken:e}).catch(()=>{});return n?Je._fromGetAccountInfoResponse(this.auth,n,e):null}return Je._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const n=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,n)return this.setCurrentUser(n)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,n,s="authUser"){if(!n.length)return new Rn(St(ia),e,s);const r=(await Promise.all(n.map(async u=>{if(await u._isAvailable())return u}))).filter(u=>u);let i=r[0]||St(ia);const o=Us(s,e.config.apiKey,e.name);let a=null;for(const u of n)try{const f=await u._get(o);if(f){let d;if(typeof f=="string"){const h=await Ys(e,{idToken:f}).catch(()=>{});if(!h)break;d=await Je._fromGetAccountInfoResponse(e,h,f)}else d=Je._fromJSON(e,f);u!==i&&(a=d),i=u;break}}catch{}const l=r.filter(u=>u._shouldAllowMigration);return!i._shouldAllowMigration||!l.length?new Rn(i,e,s):(i=l[0],a&&await i._set(o,a.toJSON()),await Promise.all(n.map(async u=>{if(u!==i)try{await u._remove(o)}catch{}})),new Rn(i,e,s))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function oa(t){const e=t.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(fc(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(cc(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(pc(e))return"Blackberry";if(mc(e))return"Webos";if(uc(e))return"Safari";if((e.includes("chrome/")||dc(e))&&!e.includes("edge/"))return"Chrome";if(hc(e))return"Android";{const n=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,s=t.match(n);if((s==null?void 0:s.length)===2)return s[1]}return"Other"}function cc(t=Ne()){return/firefox\//i.test(t)}function uc(t=Ne()){const e=t.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function dc(t=Ne()){return/crios\//i.test(t)}function fc(t=Ne()){return/iemobile/i.test(t)}function hc(t=Ne()){return/android/i.test(t)}function pc(t=Ne()){return/blackberry/i.test(t)}function mc(t=Ne()){return/webos/i.test(t)}function Vi(t=Ne()){return/iphone|ipad|ipod/i.test(t)||/macintosh/i.test(t)&&/mobile/i.test(t)}function vm(t=Ne()){var e;return Vi(t)&&!!((e=window.navigator)!=null&&e.standalone)}function bm(){return xh()&&document.documentMode===10}function gc(t=Ne()){return Vi(t)||hc(t)||mc(t)||pc(t)||/windows phone/i.test(t)||fc(t)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _c(t,e=[]){let n;switch(t){case"Browser":n=oa(Ne());break;case"Worker":n=`${oa(Ne())}-${t}`;break;default:n=t}const s=e.length?e.join(","):"FirebaseCore-web";return`${n}/JsCore/${Is}/${s}`}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Em{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,n){const s=i=>new Promise((o,a)=>{try{const l=e(i);o(l)}catch(l){a(l)}});s.onAbort=n,this.queue.push(s);const r=this.queue.length-1;return()=>{this.queue[r]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const n=[];try{for(const s of this.queue)await s(e),s.onAbort&&n.push(s.onAbort)}catch(s){n.reverse();for(const r of n)try{r()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:s==null?void 0:s.message})}}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Im(t,e={}){return Xt(t,"GET","/v2/passwordPolicy",hn(t,e))}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const wm=6;class Sm{constructor(e){var s;const n=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=n.minPasswordLength??wm,n.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=n.maxPasswordLength),n.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=n.containsLowercaseCharacter),n.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=n.containsUppercaseCharacter),n.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=n.containsNumericCharacter),n.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=n.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=((s=e.allowedNonAlphanumericCharacters)==null?void 0:s.join(""))??"",this.forceUpgradeOnSignin=e.forceUpgradeOnSignin??!1,this.schemaVersion=e.schemaVersion}validatePassword(e){const n={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,n),this.validatePasswordCharacterOptions(e,n),n.isValid&&(n.isValid=n.meetsMinPasswordLength??!0),n.isValid&&(n.isValid=n.meetsMaxPasswordLength??!0),n.isValid&&(n.isValid=n.containsLowercaseLetter??!0),n.isValid&&(n.isValid=n.containsUppercaseLetter??!0),n.isValid&&(n.isValid=n.containsNumericCharacter??!0),n.isValid&&(n.isValid=n.containsNonAlphanumericCharacter??!0),n}validatePasswordLengthOptions(e,n){const s=this.customStrengthOptions.minPasswordLength,r=this.customStrengthOptions.maxPasswordLength;s&&(n.meetsMinPasswordLength=e.length>=s),r&&(n.meetsMaxPasswordLength=e.length<=r)}validatePasswordCharacterOptions(e,n){this.updatePasswordCharacterOptionsStatuses(n,!1,!1,!1,!1);let s;for(let r=0;r<e.length;r++)s=e.charAt(r),this.updatePasswordCharacterOptionsStatuses(n,s>="a"&&s<="z",s>="A"&&s<="Z",s>="0"&&s<="9",this.allowedNonAlphanumericCharacters.includes(s))}updatePasswordCharacterOptionsStatuses(e,n,s,r,i){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=n)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=s)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=r)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=i))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Cm{constructor(e,n,s,r){this.app=e,this.heartbeatServiceProvider=n,this.appCheckServiceProvider=s,this.config=r,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new aa(this),this.idTokenSubscription=new aa(this),this.beforeStateQueue=new Em(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=nc,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=r.sdkClientVersion,this._persistenceManagerAvailable=new Promise(i=>this._resolvePersistenceManagerAvailable=i)}_initializeWithPersistence(e,n){return n&&(this._popupRedirectResolver=St(n)),this._initializationPromise=this.queue(async()=>{var s,r,i;if(!this._deleted&&(this.persistenceManager=await Rn.create(this,e),(s=this._resolvePersistenceManagerAvailable)==null||s.call(this),!this._deleted)){if((r=this._popupRedirectResolver)!=null&&r._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(n),this.lastNotifiedUid=((i=this.currentUser)==null?void 0:i.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const n=await Ys(this,{idToken:e}),s=await Je._fromGetAccountInfoResponse(this,n,e);await this.directlySetCurrentUser(s)}catch(n){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",n),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var i;if(ut(this.app)){const o=this.app.settings.authIdToken;return o?new Promise(a=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(o).then(a,a))}):this.directlySetCurrentUser(null)}const n=await this.assertedPersistence.getCurrentUser();let s=n,r=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const o=(i=this.redirectUser)==null?void 0:i._redirectEventId,a=s==null?void 0:s._redirectEventId,l=await this.tryRedirectSignIn(e);(!o||o===a)&&(l!=null&&l.user)&&(s=l.user,r=!0)}if(!s)return this.directlySetCurrentUser(null);if(!s._redirectEventId){if(r)try{await this.beforeStateQueue.runMiddleware(s)}catch(o){s=n,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(o))}return s?this.reloadAndSetCurrentUserOrClear(s):this.directlySetCurrentUser(null)}return G(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===s._redirectEventId?this.directlySetCurrentUser(s):this.reloadAndSetCurrentUserOrClear(s)}async tryRedirectSignIn(e){let n=null;try{n=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return n}async reloadAndSetCurrentUserOrClear(e){try{await Xs(e)}catch(n){if((n==null?void 0:n.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=sm()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(ut(this.app))return Promise.reject(qt(this));const n=e?Dt(e):null;return n&&G(n.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(n&&n._clone(this))}async _updateCurrentUser(e,n=!1){if(!this._deleted)return e&&G(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),n||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return ut(this.app)?Promise.reject(qt(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return ut(this.app)?Promise.reject(qt(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(St(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const n=this._getPasswordPolicyInternal();return n.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):n.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await Im(this),n=new Sm(e);this.tenantId===null?this._projectPasswordPolicy=n:this._tenantPasswordPolicies[this.tenantId]=n}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new bs("auth","Firebase",e())}onAuthStateChanged(e,n,s){return this.registerStateListener(this.authStateSubscription,e,n,s)}beforeAuthStateChanged(e,n){return this.beforeStateQueue.pushCallback(e,n)}onIdTokenChanged(e,n,s){return this.registerStateListener(this.idTokenSubscription,e,n,s)}authStateReady(){return new Promise((e,n)=>{if(this.currentUser)e();else{const s=this.onAuthStateChanged(()=>{s(),e()},n)}})}async revokeAccessToken(e){if(this.currentUser){const n=await this.currentUser.getIdToken(),s={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:n};this.tenantId!=null&&(s.tenantId=this.tenantId),await ym(this,s)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)==null?void 0:e.toJSON()}}async _setRedirectUser(e,n){const s=await this.getOrInitRedirectPersistenceManager(n);return e===null?s.removeCurrentUser():s.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const n=e&&St(e)||this._popupRedirectResolver;G(n,this,"argument-error"),this.redirectPersistenceManager=await Rn.create(this,[St(n._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var n,s;return this._isInitialized&&await this.queue(async()=>{}),((n=this._currentUser)==null?void 0:n._redirectEventId)===e?this._currentUser:((s=this.redirectUser)==null?void 0:s._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var n;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const e=((n=this.currentUser)==null?void 0:n.uid)??null;this.lastNotifiedUid!==e&&(this.lastNotifiedUid=e,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,n,s,r){if(this._deleted)return()=>{};const i=typeof n=="function"?n:n.next.bind(n);let o=!1;const a=this._isInitialized?Promise.resolve():this._initializationPromise;if(G(a,this,"internal-error"),a.then(()=>{o||i(this.currentUser)}),typeof n=="function"){const l=e.addObserver(n,s,r);return()=>{o=!0,l()}}else{const l=e.addObserver(n);return()=>{o=!0,l()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return G(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=_c(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var r;const e={"X-Client-Version":this.clientVersion};this.app.options.appId&&(e["X-Firebase-gmpid"]=this.app.options.appId);const n=await((r=this.heartbeatServiceProvider.getImmediate({optional:!0}))==null?void 0:r.getHeartbeatsHeader());n&&(e["X-Firebase-Client"]=n);const s=await this._getAppCheckToken();return s&&(e["X-Firebase-AppCheck"]=s),e}async _getAppCheckToken(){var n;if(ut(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=await((n=this.appCheckServiceProvider.getImmediate({optional:!0}))==null?void 0:n.getToken());return e!=null&&e.error&&em(`Error while retrieving App Check token: ${e.error}`),e==null?void 0:e.token}}function $n(t){return Dt(t)}class aa{constructor(e){this.auth=e,this.observer=null,this.addObserver=Bh(n=>this.observer=n)}get next(){return G(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let gr={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function Tm(t){gr=t}function yc(t){return gr.loadJS(t)}function Am(){return gr.recaptchaEnterpriseScript}function Rm(){return gr.gapiScript}function Pm(t){return`__${t}${Math.floor(Math.random()*1e6)}`}class km{constructor(){this.enterprise=new Om}ready(e){e()}execute(e,n){return Promise.resolve("token")}render(e,n){return""}}class Om{ready(e){e()}execute(e,n){return Promise.resolve("token")}render(e,n){return""}}const Nm="recaptcha-enterprise",vc="NO_RECAPTCHA";class Dm{constructor(e){this.type=Nm,this.auth=$n(e)}async verify(e="verify",n=!1){async function s(i){if(!n){if(i.tenantId==null&&i._agentRecaptchaConfig!=null)return i._agentRecaptchaConfig.siteKey;if(i.tenantId!=null&&i._tenantRecaptchaConfigs[i.tenantId]!==void 0)return i._tenantRecaptchaConfigs[i.tenantId].siteKey}return new Promise(async(o,a)=>{um(i,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(l=>{if(l.recaptchaKey===void 0)a(new Error("recaptcha Enterprise site key undefined"));else{const u=new cm(l);return i.tenantId==null?i._agentRecaptchaConfig=u:i._tenantRecaptchaConfigs[i.tenantId]=u,o(u.siteKey)}}).catch(l=>{a(l)})})}function r(i,o,a){const l=window.grecaptcha;na(l)?l.enterprise.ready(()=>{l.enterprise.execute(i,{action:e}).then(u=>{o(u)}).catch(()=>{o(vc)})}):a(Error("No reCAPTCHA enterprise script loaded."))}return this.auth.settings.appVerificationDisabledForTesting?new km().execute("siteKey",{action:"verify"}):new Promise((i,o)=>{s(this.auth).then(a=>{if(!n&&na(window.grecaptcha))r(a,i,o);else{if(typeof window>"u"){o(new Error("RecaptchaVerifier is only supported in browser"));return}let l=Am();l.length!==0&&(l+=a),yc(l).then(()=>{r(a,i,o)}).catch(u=>{o(u)})}}).catch(a=>{o(a)})})}}async function la(t,e,n,s=!1,r=!1){const i=new Dm(t);let o;if(r)o=vc;else try{o=await i.verify(n)}catch{o=await i.verify(n,!0)}const a={...e};if(n==="mfaSmsEnrollment"||n==="mfaSmsSignIn"){if("phoneEnrollmentInfo"in a){const l=a.phoneEnrollmentInfo.phoneNumber,u=a.phoneEnrollmentInfo.recaptchaToken;Object.assign(a,{phoneEnrollmentInfo:{phoneNumber:l,recaptchaToken:u,captchaResponse:o,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}else if("phoneSignInInfo"in a){const l=a.phoneSignInInfo.recaptchaToken;Object.assign(a,{phoneSignInInfo:{recaptchaToken:l,captchaResponse:o,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}return a}return s?Object.assign(a,{captchaResp:o}):Object.assign(a,{captchaResponse:o}),Object.assign(a,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(a,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),a}async function ca(t,e,n,s,r){var i;if((i=t._getRecaptchaConfig())!=null&&i.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){const o=await la(t,e,n,n==="getOobCode");return s(t,o)}else return s(t,e).catch(async o=>{if(o.code==="auth/missing-recaptcha-token"){console.log(`${n} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);const a=await la(t,e,n,n==="getOobCode");return s(t,a)}else return Promise.reject(o)})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function xm(t,e){const n=Xl(t,"auth");if(n.isInitialized()){const r=n.getImmediate(),i=n.getOptions();if(Ln(i,e??{}))return r;et(r,"already-initialized")}return n.initialize({options:e})}function Lm(t,e){const n=(e==null?void 0:e.persistence)||[],s=(Array.isArray(n)?n:[n]).map(St);e!=null&&e.errorMap&&t._updateErrorMap(e.errorMap),t._initializeWithPersistence(s,e==null?void 0:e.popupRedirectResolver)}function Mm(t,e,n){const s=$n(t);G(/^https?:\/\//.test(e),s,"invalid-emulator-scheme");const r=!1,i=bc(e),{host:o,port:a}=Um(e),l=a===null?"":`:${a}`,u={url:`${i}//${o}${l}/`},f=Object.freeze({host:o,port:a,protocol:i.replace(":",""),options:Object.freeze({disableWarnings:r})});if(!s._canInitEmulator){G(s.config.emulator&&s.emulatorConfig,s,"emulator-config-failed"),G(Ln(u,s.config.emulator)&&Ln(f,s.emulatorConfig),s,"emulator-config-failed");return}s.config.emulator=u,s.emulatorConfig=f,s.settings.appVerificationDisabledForTesting=!0,pr(o)?(Th(`${i}//${o}${l}`),Ph("Auth",!0)):Fm()}function bc(t){const e=t.indexOf(":");return e<0?"":t.substr(0,e+1)}function Um(t){const e=bc(t),n=/(\/\/)?([^?#/]+)/.exec(t.substr(e.length));if(!n)return{host:"",port:null};const s=n[2].split("@").pop()||"",r=/^(\[[^\]]+\])(:|$)/.exec(s);if(r){const i=r[1];return{host:i,port:ua(s.substr(i.length+1))}}else{const[i,o]=s.split(":");return{host:i,port:ua(o)}}}function ua(t){if(!t)return null;const e=Number(t);return isNaN(e)?null:e}function Fm(){function t(){const e=document.createElement("p"),n=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",n.position="fixed",n.width="100%",n.backgroundColor="#ffffff",n.border=".1em solid #000000",n.color="#b50000",n.bottom="0px",n.left="0px",n.margin="0px",n.zIndex="10000",n.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",t):t())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $i{constructor(e,n){this.providerId=e,this.signInMethod=n}toJSON(){return wt("not implemented")}_getIdTokenResponse(e){return wt("not implemented")}_linkToIdToken(e,n){return wt("not implemented")}_getReauthenticationResolver(e){return wt("not implemented")}}async function Vm(t,e){return Xt(t,"POST","/v1/accounts:signUp",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function $m(t,e){return mr(t,"POST","/v1/accounts:signInWithPassword",hn(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Bm(t,e){return mr(t,"POST","/v1/accounts:signInWithEmailLink",hn(t,e))}async function Hm(t,e){return mr(t,"POST","/v1/accounts:signInWithEmailLink",hn(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gs extends $i{constructor(e,n,s,r=null){super("password",s),this._email=e,this._password=n,this._tenantId=r}static _fromEmailAndPassword(e,n){return new gs(e,n,"password")}static _fromEmailAndCode(e,n,s=null){return new gs(e,n,"emailLink",s)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){const n=typeof e=="string"?JSON.parse(e):e;if(n!=null&&n.email&&(n!=null&&n.password)){if(n.signInMethod==="password")return this._fromEmailAndPassword(n.email,n.password);if(n.signInMethod==="emailLink")return this._fromEmailAndCode(n.email,n.password,n.tenantId)}return null}async _getIdTokenResponse(e){switch(this.signInMethod){case"password":const n={returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return ca(e,n,"signInWithPassword",$m);case"emailLink":return Bm(e,{email:this._email,oobCode:this._password});default:et(e,"internal-error")}}async _linkToIdToken(e,n){switch(this.signInMethod){case"password":const s={idToken:n,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return ca(e,s,"signUpPassword",Vm);case"emailLink":return Hm(e,{idToken:n,email:this._email,oobCode:this._password});default:et(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Pn(t,e){return mr(t,"POST","/v1/accounts:signInWithIdp",hn(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const jm="http://localhost";class cn extends $i{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const n=new cn(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(n.idToken=e.idToken),e.accessToken&&(n.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(n.nonce=e.nonce),e.pendingToken&&(n.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(n.accessToken=e.oauthToken,n.secret=e.oauthTokenSecret):et("argument-error"),n}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const n=typeof e=="string"?JSON.parse(e):e,{providerId:s,signInMethod:r,...i}=n;if(!s||!r)return null;const o=new cn(s,r);return o.idToken=i.idToken||void 0,o.accessToken=i.accessToken||void 0,o.secret=i.secret,o.nonce=i.nonce,o.pendingToken=i.pendingToken||null,o}_getIdTokenResponse(e){const n=this.buildRequest();return Pn(e,n)}_linkToIdToken(e,n){const s=this.buildRequest();return s.idToken=n,Pn(e,s)}_getReauthenticationResolver(e){const n=this.buildRequest();return n.autoCreate=!1,Pn(e,n)}buildRequest(){const e={requestUri:jm,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const n={};this.idToken&&(n.id_token=this.idToken),this.accessToken&&(n.access_token=this.accessToken),this.secret&&(n.oauth_token_secret=this.secret),n.providerId=this.providerId,this.nonce&&!this.pendingToken&&(n.nonce=this.nonce),e.postBody=Es(n)}return e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Wm(t){switch(t){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}function Km(t){const e=qn(Jn(t)).link,n=e?qn(Jn(e)).deep_link_id:null,s=qn(Jn(t)).deep_link_id;return(s?qn(Jn(s)).link:null)||s||n||e||t}class Bi{constructor(e){const n=qn(Jn(e)),s=n.apiKey??null,r=n.oobCode??null,i=Wm(n.mode??null);G(s&&r&&i,"argument-error"),this.apiKey=s,this.operation=i,this.code=r,this.continueUrl=n.continueUrl??null,this.languageCode=n.lang??null,this.tenantId=n.tenantId??null}static parseLink(e){const n=Km(e);try{return new Bi(n)}catch{return null}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bn{constructor(){this.providerId=Bn.PROVIDER_ID}static credential(e,n){return gs._fromEmailAndPassword(e,n)}static credentialWithLink(e,n){const s=Bi.parseLink(n);return G(s,"argument-error"),gs._fromEmailAndCode(e,s.code,s.tenantId)}}Bn.PROVIDER_ID="password";Bn.EMAIL_PASSWORD_SIGN_IN_METHOD="password";Bn.EMAIL_LINK_SIGN_IN_METHOD="emailLink";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ec{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ss extends Ec{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bt extends Ss{constructor(){super("facebook.com")}static credential(e){return cn._fromParams({providerId:Bt.PROVIDER_ID,signInMethod:Bt.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Bt.credentialFromTaggedObject(e)}static credentialFromError(e){return Bt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Bt.credential(e.oauthAccessToken)}catch{return null}}}Bt.FACEBOOK_SIGN_IN_METHOD="facebook.com";Bt.PROVIDER_ID="facebook.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ht extends Ss{constructor(){super("google.com"),this.addScope("profile")}static credential(e,n){return cn._fromParams({providerId:Ht.PROVIDER_ID,signInMethod:Ht.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:n})}static credentialFromResult(e){return Ht.credentialFromTaggedObject(e)}static credentialFromError(e){return Ht.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:n,oauthAccessToken:s}=e;if(!n&&!s)return null;try{return Ht.credential(n,s)}catch{return null}}}Ht.GOOGLE_SIGN_IN_METHOD="google.com";Ht.PROVIDER_ID="google.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jt extends Ss{constructor(){super("github.com")}static credential(e){return cn._fromParams({providerId:jt.PROVIDER_ID,signInMethod:jt.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return jt.credentialFromTaggedObject(e)}static credentialFromError(e){return jt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return jt.credential(e.oauthAccessToken)}catch{return null}}}jt.GITHUB_SIGN_IN_METHOD="github.com";jt.PROVIDER_ID="github.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wt extends Ss{constructor(){super("twitter.com")}static credential(e,n){return cn._fromParams({providerId:Wt.PROVIDER_ID,signInMethod:Wt.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:n})}static credentialFromResult(e){return Wt.credentialFromTaggedObject(e)}static credentialFromError(e){return Wt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:n,oauthTokenSecret:s}=e;if(!n||!s)return null;try{return Wt.credential(n,s)}catch{return null}}}Wt.TWITTER_SIGN_IN_METHOD="twitter.com";Wt.PROVIDER_ID="twitter.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Un{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,n,s,r=!1){const i=await Je._fromIdTokenResponse(e,s,r),o=da(s);return new Un({user:i,providerId:o,_tokenResponse:s,operationType:n})}static async _forOperation(e,n,s){await e._updateTokensIfNecessary(s,!0);const r=da(s);return new Un({user:e,providerId:r,_tokenResponse:s,operationType:n})}}function da(t){return t.providerId?t.providerId:"phoneNumber"in t?"phone":null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qs extends Yt{constructor(e,n,s,r){super(n.code,n.message),this.operationType=s,this.user=r,Object.setPrototypeOf(this,Qs.prototype),this.customData={appName:e.name,tenantId:e.tenantId??void 0,_serverResponse:n.customData._serverResponse,operationType:s}}static _fromErrorAndOperation(e,n,s,r){return new Qs(e,n,s,r)}}function Ic(t,e,n,s){return(e==="reauthenticate"?n._getReauthenticationResolver(t):n._getIdTokenResponse(t)).catch(i=>{throw i.code==="auth/multi-factor-auth-required"?Qs._fromErrorAndOperation(t,i,e,s):i})}async function Gm(t,e,n=!1){const s=await ms(t,e._linkToIdToken(t.auth,await t.getIdToken()),n);return Un._forOperation(t,"link",s)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function zm(t,e,n=!1){const{auth:s}=t;if(ut(s.app))return Promise.reject(qt(s));const r="reauthenticate";try{const i=await ms(t,Ic(s,r,e,t),n);G(i.idToken,s,"internal-error");const o=Fi(i.idToken);G(o,s,"internal-error");const{sub:a}=o;return G(t.uid===a,s,"user-mismatch"),Un._forOperation(t,r,i)}catch(i){throw(i==null?void 0:i.code)==="auth/user-not-found"&&et(s,"user-mismatch"),i}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function wc(t,e,n=!1){if(ut(t.app))return Promise.reject(qt(t));const s="signIn",r=await Ic(t,s,e),i=await Un._fromIdTokenResponse(t,s,r);return n||await t._updateCurrentUser(i.user),i}async function qm(t,e){return wc($n(t),e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Jm(t){const e=$n(t);e._getPasswordPolicyInternal()&&await e._updatePasswordPolicy()}function Ym(t,e,n){return ut(t.app)?Promise.reject(qt(t)):qm(Dt(t),Bn.credential(e,n)).catch(async s=>{throw s.code==="auth/password-does-not-meet-requirements"&&Jm(t),s})}function Xm(t,e,n,s){return Dt(t).onIdTokenChanged(e,n,s)}function Qm(t,e,n){return Dt(t).beforeAuthStateChanged(e,n)}function Zm(t,e,n,s){return Dt(t).onAuthStateChanged(e,n,s)}function eg(t){return Dt(t).signOut()}const Zs="__sak";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Sc{constructor(e,n){this.storageRetriever=e,this.type=n}_isAvailable(){try{return this.storage?(this.storage.setItem(Zs,"1"),this.storage.removeItem(Zs),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,n){return this.storage.setItem(e,JSON.stringify(n)),Promise.resolve()}_get(e){const n=this.storage.getItem(e);return Promise.resolve(n?JSON.parse(n):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const tg=1e3,ng=10;class Cc extends Sc{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,n)=>this.onStorageEvent(e,n),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=gc(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const n of Object.keys(this.listeners)){const s=this.storage.getItem(n),r=this.localCache[n];s!==r&&e(n,r,s)}}onStorageEvent(e,n=!1){if(!e.key){this.forAllChangedKeys((o,a,l)=>{this.notifyListeners(o,l)});return}const s=e.key;n?this.detachListener():this.stopPolling();const r=()=>{const o=this.storage.getItem(s);!n&&this.localCache[s]===o||this.notifyListeners(s,o)},i=this.storage.getItem(s);bm()&&i!==e.newValue&&e.newValue!==e.oldValue?setTimeout(r,ng):r()}notifyListeners(e,n){this.localCache[e]=n;const s=this.listeners[e];if(s)for(const r of Array.from(s))r(n&&JSON.parse(n))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,n,s)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:n,newValue:s}),!0)})},tg)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,n){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,n){await super._set(e,n),this.localCache[e]=JSON.stringify(n)}async _get(e){const n=await super._get(e);return this.localCache[e]=JSON.stringify(n),n}async _remove(e){await super._remove(e),delete this.localCache[e]}}Cc.type="LOCAL";const sg=Cc;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Tc extends Sc{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,n){}_removeListener(e,n){}}Tc.type="SESSION";const Ac=Tc;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function rg(t){return Promise.all(t.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(n){return{fulfilled:!1,reason:n}}}))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _r{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const n=this.receivers.find(r=>r.isListeningto(e));if(n)return n;const s=new _r(e);return this.receivers.push(s),s}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const n=e,{eventId:s,eventType:r,data:i}=n.data,o=this.handlersMap[r];if(!(o!=null&&o.size))return;n.ports[0].postMessage({status:"ack",eventId:s,eventType:r});const a=Array.from(o).map(async u=>u(n.origin,i)),l=await rg(a);n.ports[0].postMessage({status:"done",eventId:s,eventType:r,response:l})}_subscribe(e,n){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(n)}_unsubscribe(e,n){this.handlersMap[e]&&n&&this.handlersMap[e].delete(n),(!n||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}_r.receivers=[];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Hi(t="",e=10){let n="";for(let s=0;s<e;s++)n+=Math.floor(Math.random()*10);return t+n}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ig{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,n,s=50){const r=typeof MessageChannel<"u"?new MessageChannel:null;if(!r)throw new Error("connection_unavailable");let i,o;return new Promise((a,l)=>{const u=Hi("",20);r.port1.start();const f=setTimeout(()=>{l(new Error("unsupported_event"))},s);o={messageChannel:r,onMessage(d){const h=d;if(h.data.eventId===u)switch(h.data.status){case"ack":clearTimeout(f),i=setTimeout(()=>{l(new Error("timeout"))},3e3);break;case"done":clearTimeout(i),a(h.data.response);break;default:clearTimeout(f),clearTimeout(i),l(new Error("invalid_response"));break}}},this.handlers.add(o),r.port1.addEventListener("message",o.onMessage),this.target.postMessage({eventType:e,eventId:u,data:n},[r.port2])}).finally(()=>{o&&this.removeMessageHandler(o)})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ht(){return window}function og(t){ht().location.href=t}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Rc(){return typeof ht().WorkerGlobalScope<"u"&&typeof ht().importScripts=="function"}async function ag(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function lg(){var t;return((t=navigator==null?void 0:navigator.serviceWorker)==null?void 0:t.controller)||null}function cg(){return Rc()?self:null}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Pc="firebaseLocalStorageDb",ug=1,er="firebaseLocalStorage",kc="fbase_key";class Cs{constructor(e){this.request=e}toPromise(){return new Promise((e,n)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{n(this.request.error)})})}}function yr(t,e){return t.transaction([er],e?"readwrite":"readonly").objectStore(er)}function dg(){const t=indexedDB.deleteDatabase(Pc);return new Cs(t).toPromise()}function ci(){const t=indexedDB.open(Pc,ug);return new Promise((e,n)=>{t.addEventListener("error",()=>{n(t.error)}),t.addEventListener("upgradeneeded",()=>{const s=t.result;try{s.createObjectStore(er,{keyPath:kc})}catch(r){n(r)}}),t.addEventListener("success",async()=>{const s=t.result;s.objectStoreNames.contains(er)?e(s):(s.close(),await dg(),e(await ci()))})})}async function fa(t,e,n){const s=yr(t,!0).put({[kc]:e,value:n});return new Cs(s).toPromise()}async function fg(t,e){const n=yr(t,!1).get(e),s=await new Cs(n).toPromise();return s===void 0?null:s.value}function ha(t,e){const n=yr(t,!0).delete(e);return new Cs(n).toPromise()}const hg=800,pg=3;class Oc{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await ci(),this.db)}async _withRetries(e){let n=0;for(;;)try{const s=await this._openDb();return await e(s)}catch(s){if(n++>pg)throw s;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return Rc()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=_r._getInstance(cg()),this.receiver._subscribe("keyChanged",async(e,n)=>({keyProcessed:(await this._poll()).includes(n.key)})),this.receiver._subscribe("ping",async(e,n)=>["keyChanged"])}async initializeSender(){var n,s;if(this.activeServiceWorker=await ag(),!this.activeServiceWorker)return;this.sender=new ig(this.activeServiceWorker);const e=await this.sender._send("ping",{},800);e&&(n=e[0])!=null&&n.fulfilled&&(s=e[0])!=null&&s.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||lg()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;const e=await ci();return await fa(e,Zs,"1"),await ha(e,Zs),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,n){return this._withPendingWrite(async()=>(await this._withRetries(s=>fa(s,e,n)),this.localCache[e]=n,this.notifyServiceWorker(e)))}async _get(e){const n=await this._withRetries(s=>fg(s,e));return this.localCache[e]=n,n}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(n=>ha(n,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(r=>{const i=yr(r,!1).getAll();return new Cs(i).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const n=[],s=new Set;if(e.length!==0)for(const{fbase_key:r,value:i}of e)s.add(r),JSON.stringify(this.localCache[r])!==JSON.stringify(i)&&(this.notifyListeners(r,i),n.push(r));for(const r of Object.keys(this.localCache))this.localCache[r]&&!s.has(r)&&(this.notifyListeners(r,null),n.push(r));return n}notifyListeners(e,n){this.localCache[e]=n;const s=this.listeners[e];if(s)for(const r of Array.from(s))r(n)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),hg)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,n){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}Oc.type="LOCAL";const mg=Oc;new ws(3e4,6e4);/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function gg(t,e){return e?St(e):(G(t._popupRedirectResolver,t,"argument-error"),t._popupRedirectResolver)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ji extends $i{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return Pn(e,this._buildIdpRequest())}_linkToIdToken(e,n){return Pn(e,this._buildIdpRequest(n))}_getReauthenticationResolver(e){return Pn(e,this._buildIdpRequest())}_buildIdpRequest(e){const n={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(n.idToken=e),n}}function _g(t){return wc(t.auth,new ji(t),t.bypassAuthState)}function yg(t){const{auth:e,user:n}=t;return G(n,e,"internal-error"),zm(n,new ji(t),t.bypassAuthState)}async function vg(t){const{auth:e,user:n}=t;return G(n,e,"internal-error"),Gm(n,new ji(t),t.bypassAuthState)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Nc{constructor(e,n,s,r,i=!1){this.auth=e,this.resolver=s,this.user=r,this.bypassAuthState=i,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(n)?n:[n]}execute(){return new Promise(async(e,n)=>{this.pendingPromise={resolve:e,reject:n};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(s){this.reject(s)}})}async onAuthEvent(e){const{urlResponse:n,sessionId:s,postBody:r,tenantId:i,error:o,type:a}=e;if(o){this.reject(o);return}const l={auth:this.auth,requestUri:n,sessionId:s,tenantId:i||void 0,postBody:r||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(a)(l))}catch(u){this.reject(u)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return _g;case"linkViaPopup":case"linkViaRedirect":return vg;case"reauthViaPopup":case"reauthViaRedirect":return yg;default:et(this.auth,"internal-error")}}resolve(e){Ot(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){Ot(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bg=new ws(2e3,1e4);class bn extends Nc{constructor(e,n,s,r,i){super(e,n,r,i),this.provider=s,this.authWindow=null,this.pollId=null,bn.currentPopupAction&&bn.currentPopupAction.cancel(),bn.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return G(e,this.auth,"internal-error"),e}async onExecution(){Ot(this.filter.length===1,"Popup operations only handle one event");const e=Hi();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(n=>{this.reject(n)}),this.resolver._isIframeWebStorageSupported(this.auth,n=>{n||this.reject(ft(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)==null?void 0:e.associatedEvent)||null}cancel(){this.reject(ft(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,bn.currentPopupAction=null}pollUserCancellation(){const e=()=>{var n,s;if((s=(n=this.authWindow)==null?void 0:n.window)!=null&&s.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(ft(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,bg.get())};e()}}bn.currentPopupAction=null;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Eg="pendingRedirect",Fs=new Map;class Ig extends Nc{constructor(e,n,s=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],n,void 0,s),this.eventId=null}async execute(){let e=Fs.get(this.auth._key());if(!e){try{const s=await wg(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(s)}catch(n){e=()=>Promise.reject(n)}Fs.set(this.auth._key(),e)}return this.bypassAuthState||Fs.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const n=await this.auth._redirectUserForId(e.eventId);if(n)return this.user=n,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function wg(t,e){const n=Tg(e),s=Cg(t);if(!await s._isAvailable())return!1;const r=await s._get(n)==="true";return await s._remove(n),r}function Sg(t,e){Fs.set(t._key(),e)}function Cg(t){return St(t._redirectPersistence)}function Tg(t){return Us(Eg,t.config.apiKey,t.name)}async function Ag(t,e,n=!1){if(ut(t.app))return Promise.reject(qt(t));const s=$n(t),r=gg(s,e),o=await new Ig(s,r,n).execute();return o&&!n&&(delete o.user._redirectEventId,await s._persistUserIfCurrent(o.user),await s._setRedirectUser(null,e)),o}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Rg=600*1e3;class Pg{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let n=!1;return this.consumers.forEach(s=>{this.isEventForConsumer(e,s)&&(n=!0,this.sendToConsumer(e,s),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!kg(e)||(this.hasHandledPotentialRedirect=!0,n||(this.queuedRedirectEvent=e,n=!0)),n}sendToConsumer(e,n){var s;if(e.error&&!Dc(e)){const r=((s=e.error.code)==null?void 0:s.split("auth/")[1])||"internal-error";n.onError(ft(this.auth,r))}else n.onAuthEvent(e)}isEventForConsumer(e,n){const s=n.eventId===null||!!e.eventId&&e.eventId===n.eventId;return n.filter.includes(e.type)&&s}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=Rg&&this.cachedEventUids.clear(),this.cachedEventUids.has(pa(e))}saveEventToCache(e){this.cachedEventUids.add(pa(e)),this.lastProcessedEventTime=Date.now()}}function pa(t){return[t.type,t.eventId,t.sessionId,t.tenantId].filter(e=>e).join("-")}function Dc({type:t,error:e}){return t==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function kg(t){switch(t.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return Dc(t);default:return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Og(t,e={}){return Xt(t,"GET","/v1/projects",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ng=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,Dg=/^https?/;async function xg(t){if(t.config.emulator)return;const{authorizedDomains:e}=await Og(t);for(const n of e)try{if(Lg(n))return}catch{}et(t,"unauthorized-domain")}function Lg(t){const e=ai(),{protocol:n,hostname:s}=new URL(e);if(t.startsWith("chrome-extension://")){const o=new URL(t);return o.hostname===""&&s===""?n==="chrome-extension:"&&t.replace("chrome-extension://","")===e.replace("chrome-extension://",""):n==="chrome-extension:"&&o.hostname===s}if(!Dg.test(n))return!1;if(Ng.test(t))return s===t;const r=t.replace(/\./g,"\\.");return new RegExp("^(.+\\."+r+"|"+r+")$","i").test(s)}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Mg=new ws(3e4,6e4);function ma(){const t=ht().___jsl;if(t!=null&&t.H){for(const e of Object.keys(t.H))if(t.H[e].r=t.H[e].r||[],t.H[e].L=t.H[e].L||[],t.H[e].r=[...t.H[e].L],t.CP)for(let n=0;n<t.CP.length;n++)t.CP[n]=null}}function Ug(t){return new Promise((e,n)=>{var r,i,o;function s(){ma(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{ma(),n(ft(t,"network-request-failed"))},timeout:Mg.get()})}if((i=(r=ht().gapi)==null?void 0:r.iframes)!=null&&i.Iframe)e(gapi.iframes.getContext());else if((o=ht().gapi)!=null&&o.load)s();else{const a=Pm("iframefcb");return ht()[a]=()=>{gapi.load?s():n(ft(t,"network-request-failed"))},yc(`${Rm()}?onload=${a}`).catch(l=>n(l))}}).catch(e=>{throw Vs=null,e})}let Vs=null;function Fg(t){return Vs=Vs||Ug(t),Vs}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Vg=new ws(5e3,15e3),$g="__/auth/iframe",Bg="emulator/auth/iframe",Hg={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},jg=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function Wg(t){const e=t.config;G(e.authDomain,t,"auth-domain-config-required");const n=e.emulator?Ui(e,Bg):`https://${t.config.authDomain}/${$g}`,s={apiKey:e.apiKey,appName:t.name,v:Is},r=jg.get(t.config.apiHost);r&&(s.eid=r);const i=t._getFrameworks();return i.length&&(s.fw=i.join(",")),`${n}?${Es(s).slice(1)}`}async function Kg(t){const e=await Fg(t),n=ht().gapi;return G(n,t,"internal-error"),e.open({where:document.body,url:Wg(t),messageHandlersFilter:n.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:Hg,dontclear:!0},s=>new Promise(async(r,i)=>{await s.restyle({setHideOnLeave:!1});const o=ft(t,"network-request-failed"),a=ht().setTimeout(()=>{i(o)},Vg.get());function l(){ht().clearTimeout(a),r(s)}s.ping(l).then(l,()=>{i(o)})}))}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Gg={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},zg=500,qg=600,Jg="_blank",Yg="http://localhost";class ga{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function Xg(t,e,n,s=zg,r=qg){const i=Math.max((window.screen.availHeight-r)/2,0).toString(),o=Math.max((window.screen.availWidth-s)/2,0).toString();let a="";const l={...Gg,width:s.toString(),height:r.toString(),top:i,left:o},u=Ne().toLowerCase();n&&(a=dc(u)?Jg:n),cc(u)&&(e=e||Yg,l.scrollbars="yes");const f=Object.entries(l).reduce((h,[g,v])=>`${h}${g}=${v},`,"");if(vm(u)&&a!=="_self")return Qg(e||"",a),new ga(null);const d=window.open(e||"",a,f);G(d,t,"popup-blocked");try{d.focus()}catch{}return new ga(d)}function Qg(t,e){const n=document.createElement("a");n.href=t,n.target=e;const s=document.createEvent("MouseEvent");s.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),n.dispatchEvent(s)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Zg="__/auth/handler",e_="emulator/auth/handler",t_=encodeURIComponent("fac");async function _a(t,e,n,s,r,i){G(t.config.authDomain,t,"auth-domain-config-required"),G(t.config.apiKey,t,"invalid-api-key");const o={apiKey:t.config.apiKey,appName:t.name,authType:n,redirectUrl:s,v:Is,eventId:r};if(e instanceof Ec){e.setDefaultLanguage(t.languageCode),o.providerId=e.providerId||"",$h(e.getCustomParameters())||(o.customParameters=JSON.stringify(e.getCustomParameters()));for(const[f,d]of Object.entries({}))o[f]=d}if(e instanceof Ss){const f=e.getScopes().filter(d=>d!=="");f.length>0&&(o.scopes=f.join(","))}t.tenantId&&(o.tid=t.tenantId);const a=o;for(const f of Object.keys(a))a[f]===void 0&&delete a[f];const l=await t._getAppCheckToken(),u=l?`#${t_}=${encodeURIComponent(l)}`:"";return`${n_(t)}?${Es(a).slice(1)}${u}`}function n_({config:t}){return t.emulator?Ui(t,e_):`https://${t.authDomain}/${Zg}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Vr="webStorageSupport";class s_{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=Ac,this._completeRedirectFn=Ag,this._overrideRedirectResult=Sg}async _openPopup(e,n,s,r){var o;Ot((o=this.eventManagers[e._key()])==null?void 0:o.manager,"_initialize() not called before _openPopup()");const i=await _a(e,n,s,ai(),r);return Xg(e,i,Hi())}async _openRedirect(e,n,s,r){await this._originValidation(e);const i=await _a(e,n,s,ai(),r);return og(i),new Promise(()=>{})}_initialize(e){const n=e._key();if(this.eventManagers[n]){const{manager:r,promise:i}=this.eventManagers[n];return r?Promise.resolve(r):(Ot(i,"If manager is not set, promise should be"),i)}const s=this.initAndGetManager(e);return this.eventManagers[n]={promise:s},s.catch(()=>{delete this.eventManagers[n]}),s}async initAndGetManager(e){const n=await Kg(e),s=new Pg(e);return n.register("authEvent",r=>(G(r==null?void 0:r.authEvent,e,"invalid-auth-event"),{status:s.onEvent(r.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:s},this.iframes[e._key()]=n,s}_isIframeWebStorageSupported(e,n){this.iframes[e._key()].send(Vr,{type:Vr},r=>{var o;const i=(o=r==null?void 0:r[0])==null?void 0:o[Vr];i!==void 0&&n(!!i),et(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const n=e._key();return this.originValidationPromises[n]||(this.originValidationPromises[n]=xg(e)),this.originValidationPromises[n]}get _shouldInitProactively(){return gc()||uc()||Vi()}}const r_=s_;var ya="@firebase/auth",va="1.12.1";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class i_{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)==null?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const n=this.auth.onIdTokenChanged(s=>{e((s==null?void 0:s.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,n),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const n=this.internalListeners.get(e);n&&(this.internalListeners.delete(e),n(),this.updateProactiveRefresh())}assertAuthConfigured(){G(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function o_(t){switch(t){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function a_(t){hs(new Mn("auth",(e,{options:n})=>{const s=e.getProvider("app").getImmediate(),r=e.getProvider("heartbeat"),i=e.getProvider("app-check-internal"),{apiKey:o,authDomain:a}=s.options;G(o&&!o.includes(":"),"invalid-api-key",{appName:s.name});const l={apiKey:o,authDomain:a,clientPlatform:t,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:_c(t)},u=new Cm(s,r,i,l);return Lm(u,n),u},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,n,s)=>{e.getProvider("auth-internal").initialize()})),hs(new Mn("auth-internal",e=>{const n=$n(e.getProvider("auth").getImmediate());return(s=>new i_(s))(n)},"PRIVATE").setInstantiationMode("EXPLICIT")),Tn(ya,va,o_(t)),Tn(ya,va,"esm2020")}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const l_=300,c_=zl("authIdTokenMaxAge")||l_;let ba=null;const u_=t=>async e=>{const n=e&&await e.getIdTokenResult(),s=n&&(new Date().getTime()-Date.parse(n.issuedAtTime))/1e3;if(s&&s>c_)return;const r=n==null?void 0:n.token;ba!==r&&(ba=r,await fetch(t,{method:r?"POST":"DELETE",headers:r?{Authorization:`Bearer ${r}`}:{}}))};function d_(t=Hp()){const e=Xl(t,"auth");if(e.isInitialized())return e.getImmediate();const n=xm(t,{popupRedirectResolver:r_,persistence:[mg,sg,Ac]}),s=zl("authTokenSyncURL");if(s&&typeof isSecureContext=="boolean"&&isSecureContext){const i=new URL(s,location.origin);if(location.origin===i.origin){const o=u_(i.toString());Qm(n,o,()=>o(n.currentUser)),Xm(n,a=>o(a))}}const r=Sh("auth");return r&&Mm(n,`http://${r}`),n}function f_(){var t;return((t=document.getElementsByTagName("head"))==null?void 0:t[0])??document}Tm({loadJS(t){return new Promise((e,n)=>{const s=document.createElement("script");s.setAttribute("src",t),s.onload=e,s.onerror=r=>{const i=ft("internal-error");i.customData=r,n(i)},s.type="text/javascript",s.charset="UTF-8",f_().appendChild(s)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});a_("Browser");var h_="firebase",p_="12.10.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Tn(h_,p_,"app");const m_={apiKey:"AIzaSyBO9XFUh2gp-0_lN7qOkmAIeg9YBg5zE28",authDomain:"tobbythebutler.firebaseapp.com",projectId:"tobbythebutler",appId:"1:1017368311430:web:64ad0ff74b38b63f494307"},g_=Ql(m_),un=d_(g_),__="/api".replace(/\/$/,""),We=(t={})=>{const e=new URLSearchParams;Object.entries(t).forEach(([s,r])=>{r==null||r===""||e.set(s,String(r))});const n=e.toString();return n?`?${n}`:""},y_=async()=>{const t=un.currentUser;if(!t)throw new Error("Not authenticated");return t.getIdToken(!0)},me=async(t,e={})=>{const n=await y_(),s=await fetch(`${__}${t}`,{method:e.method||"GET",headers:{"Content-Type":"application/json",Authorization:`Bearer ${n}`,...e.headers||{}},body:e.body?JSON.stringify(e.body):void 0}),r=await s.json().catch(()=>({}));if(!s.ok)throw new Error((r==null?void 0:r.message)||`Request failed (${s.status})`);return r},v_=async(t,e)=>(await Ym(un,t,e),ui()),b_=async()=>{await eg(un)},ui=async()=>{var s,r;const t=un.currentUser;if(!t)return!1;const e=await t.getIdTokenResult(!0);if(((s=e==null?void 0:e.claims)==null?void 0:s.admin)!==!0)return!1;const n=await me("/auth/me");return String(((r=n==null?void 0:n.user)==null?void 0:r.role)||"").toLowerCase()==="admin"},ge={getOverview:t=>me(`/admin/overview${We(t)}`),getAdSlotStats:t=>me(`/admin/ad-slot/stats${We(t)}`),listUsers:t=>me(`/admin/users${We(t)}`),getUser:t=>me(`/admin/users/${encodeURIComponent(String(t))}`),freezeUser:(t,e)=>me(`/admin/users/${encodeURIComponent(String(t))}/freeze`,{method:"POST",body:e}),unfreezeUser:(t,e)=>me(`/admin/users/${encodeURIComponent(String(t))}/unfreeze`,{method:"POST",body:e}),getBillingSummary:t=>me(`/admin/billing/summary${We(t)}`),listCreditAccounts:t=>me(`/admin/credits/accounts${We(t)}`),listCreditOrders:t=>me(`/admin/credits/orders${We(t)}`),listCreditLedger:t=>me(`/admin/credits/ledger${We(t)}`),adjustCredits:t=>me("/admin/credits/adjust",{method:"POST",body:t}),listEvents:t=>me(`/admin/logs/events${We(t)}`),listErrors:t=>me(`/admin/logs/errors${We(t)}`),listSupportTickets:t=>me(`/admin/support/tickets${We(t)}`),getSupportTicket:t=>me(`/admin/support/tickets/${encodeURIComponent(String(t))}`),updateSupportTicket:(t,e)=>me(`/admin/support/tickets/${encodeURIComponent(String(t))}/update`,{method:"POST",body:e}),addSupportComment:(t,e)=>me(`/admin/support/tickets/${encodeURIComponent(String(t))}/comment`,{method:"POST",body:e}),listDataCollections:()=>me("/admin/data/collections"),listDataRecords:t=>me(`/admin/data/records${We(t)}`),listDataChanges:t=>me(`/admin/data/changes${We(t)}`),updateDataRecord:t=>me("/admin/data/update",{method:"POST",body:t}),deleteDataRecord:t=>me("/admin/data/delete",{method:"POST",body:t}),rollbackDataChange:t=>me("/admin/data/rollback",{method:"POST",body:t})},E_={class:"login-page"},I_={style:{display:"grid",gap:"10px"}},w_={key:0,style:{color:"#b91c1c"}},S_={__name:"LoginPage",setup(t){const e=Di(),n=ie(""),s=Oe({email:"",password:""}),r=async()=>{n.value="";try{if(!await v_(s.email,s.password)){n.value="Login succeeded, but this account is not admin (missing admin claim).";return}e.push("/overview")}catch(i){n.value=(i==null?void 0:i.message)||"Firebase login failed."}};return(i,o)=>(M(),V("div",E_,[c("form",{class:"login-card",onSubmit:ki(r,["prevent"])},[o[3]||(o[3]=c("h2",{style:{"margin-top":"0"}},"Admin Console Login",-1)),o[4]||(o[4]=c("p",{style:{color:"var(--muted)"}},"Use Firebase email/password account with admin claim.",-1)),c("div",I_,[X(c("input",{"onUpdate:modelValue":o[0]||(o[0]=a=>s.email=a),type:"email",placeholder:"Admin Email",required:""},null,512),[[ye,s.email]]),X(c("input",{"onUpdate:modelValue":o[1]||(o[1]=a=>s.password=a),type:"password",placeholder:"Password",required:""},null,512),[[ye,s.password]]),o[2]||(o[2]=c("button",{class:"primary",type:"submit"},"Enter",-1))]),n.value?(M(),V("p",w_,A(n.value),1)):Ge("",!0)],32)]))}},C_={class:"admin-app"},T_={class:"admin-sidebar"},A_={class:"main-wrap"},R_={class:"content"},P_={__name:"AdminShell",setup(t){const e=Di(),n=async()=>{await b_(),e.push("/login")};return(s,r)=>{const i=Kr("router-link"),o=Kr("router-view");return M(),V("div",C_,[c("aside",T_,[r[6]||(r[6]=c("div",{class:"brand"},"Handout Admin",-1)),pe(i,{class:"nav-link",to:"/overview","active-class":"active"},{default:sn(()=>[...r[0]||(r[0]=[Ee("Overview",-1)])]),_:1}),pe(i,{class:"nav-link",to:"/users","active-class":"active"},{default:sn(()=>[...r[1]||(r[1]=[Ee("Users & Roles",-1)])]),_:1}),pe(i,{class:"nav-link",to:"/support","active-class":"active"},{default:sn(()=>[...r[2]||(r[2]=[Ee("Support Inbox",-1)])]),_:1}),pe(i,{class:"nav-link",to:"/billing","active-class":"active"},{default:sn(()=>[...r[3]||(r[3]=[Ee("Billing & Credits",-1)])]),_:1}),pe(i,{class:"nav-link",to:"/logs","active-class":"active"},{default:sn(()=>[...r[4]||(r[4]=[Ee("Ops Logs",-1)])]),_:1}),pe(i,{class:"nav-link",to:"/data-management","active-class":"active"},{default:sn(()=>[...r[5]||(r[5]=[Ee("Data Management",-1)])]),_:1})]),c("div",A_,[c("header",{class:"topbar"},[r[7]||(r[7]=c("strong",null,"Admin Supervision MVP",-1)),c("button",{onClick:n},"Logout")]),c("main",R_,[pe(o)])])])}}},k_={class:"range-bar panel"},O_=["value"],N_=["value"],vr={__name:"DateRangeBar",props:{modelValue:String,from:String,to:String},emits:["update:modelValue","update:from","update:to"],setup(t){return(e,n)=>(M(),V("div",k_,[c("button",{class:$e({primary:t.modelValue==="today"}),onClick:n[0]||(n[0]=s=>e.$emit("update:modelValue","today"))},"Today",2),c("button",{class:$e({primary:t.modelValue==="7d"}),onClick:n[1]||(n[1]=s=>e.$emit("update:modelValue","7d"))},"7d",2),c("button",{class:$e({primary:t.modelValue==="30d"}),onClick:n[2]||(n[2]=s=>e.$emit("update:modelValue","30d"))},"30d",2),c("button",{class:$e({primary:t.modelValue==="custom"}),onClick:n[3]||(n[3]=s=>e.$emit("update:modelValue","custom"))},"Custom",2),t.modelValue==="custom"?(M(),V(Y,{key:0},[c("input",{type:"date",value:t.from,onInput:n[4]||(n[4]=s=>e.$emit("update:from",s.target.value))},null,40,O_),c("input",{type:"date",value:t.to,onInput:n[5]||(n[5]=s=>e.$emit("update:to",s.target.value))},null,40,N_)],64)):Ge("",!0)]))}},D_={class:"kpi-grid"},x_={class:"kpi-title"},L_={class:"kpi-value"},M_={class:"row"},U_={class:"col panel"},F_={class:"col panel"},V_={class:"kpi-grid"},$_={class:"kpi-title"},B_={class:"kpi-value"},H_={class:"row"},j_={class:"col panel"},W_={key:0},K_={class:"col panel"},G_={key:0},z_={__name:"OverviewPage",setup(t){const e=ie("7d"),n=ie(""),s=ie(""),r=ie({}),i=ie({}),o=d=>d.toISOString().slice(0,10),a=()=>{const d=new Date;if(e.value==="today")return{from:o(d),to:o(d)};if(e.value==="7d"){const h=new Date(d);return h.setDate(h.getDate()-6),{from:o(h),to:o(d)}}if(e.value==="30d"){const h=new Date(d);return h.setDate(h.getDate()-29),{from:o(h),to:o(d)}}return{from:n.value,to:s.value}},l=async()=>{const d=a(),[h,g]=await Promise.all([ge.getOverview(d),ge.getAdSlotStats(d)]);r.value=h||{},i.value=g||{}},u=ke(()=>{var d,h,g,v;return[{label:"DAU",value:((d=r.value.kpis)==null?void 0:d.dau)||0},{label:"WAU",value:((h=r.value.kpis)==null?void 0:h.wau)||0},{label:"7d retention",value:`${((g=r.value.kpis)==null?void 0:g.retention_7d)||0}%`},{label:"Cost estimate",value:`$${((v=r.value.cost_overview)==null?void 0:v.cost_estimate_usd)||0}`}]}),f=ke(()=>{var d,h,g,v;return[{label:"Ad Served",value:((d=i.value.summary)==null?void 0:d.served)||0},{label:"Ad Impressions",value:((h=i.value.summary)==null?void 0:h.impressions)||0},{label:"Ad Clicks",value:((g=i.value.summary)==null?void 0:g.clicks)||0},{label:"Ad CTR",value:`${((v=i.value.summary)==null?void 0:v.ctr)||0}%`}]});return Ct([e,n,s],l),fn(l),(d,h)=>{var g,v,E,O;return M(),V("section",null,[pe(vr,{modelValue:e.value,"onUpdate:modelValue":h[0]||(h[0]=I=>e.value=I),from:n.value,"onUpdate:from":h[1]||(h[1]=I=>n.value=I),to:s.value,"onUpdate:to":h[2]||(h[2]=I=>s.value=I)},null,8,["modelValue","from","to"]),c("div",D_,[(M(!0),V(Y,null,ue(u.value,I=>(M(),V("div",{class:"panel",key:I.label},[c("div",x_,A(I.label),1),c("div",L_,A(I.value),1)]))),128))]),c("div",M_,[c("div",U_,[h[3]||(h[3]=c("h3",null,"Behavior Funnel",-1)),c("ul",null,[(M(!0),V(Y,null,ue(r.value.funnel||{},(I,C)=>(M(),V("li",{key:C},A(C)+": "+A(I),1))),128))])]),c("div",F_,[h[4]||(h[4]=c("h3",null,"System Health",-1)),c("ul",null,[c("li",null,"API success: "+A(((g=r.value.system_health)==null?void 0:g.api_success_rate)||0)+"%",1),c("li",null,"P95 latency: "+A(((v=r.value.system_health)==null?void 0:v.p95_ms)||0)+"ms",1),c("li",null,"Frontend errors: "+A(((E=r.value.system_health)==null?void 0:E.frontend_errors)||0),1),c("li",null,"Function failures: "+A(((O=r.value.system_health)==null?void 0:O.function_failures)||0),1)])])]),c("div",V_,[(M(!0),V(Y,null,ue(f.value,I=>(M(),V("div",{class:"panel",key:I.label},[c("div",$_,A(I.label),1),c("div",B_,A(I.value),1)]))),128))]),c("div",H_,[c("div",j_,[h[5]||(h[5]=c("h3",null,"Ad Slot By Slot",-1)),c("ul",null,[(M(!0),V(Y,null,ue(i.value.by_slot||[],I=>(M(),V("li",{key:I.slot_id},A(I.slot_id)+": served "+A(I.served)+", impressions "+A(I.impressions)+", clicks "+A(I.clicks)+", ctr "+A(I.ctr)+"% ",1))),128)),(i.value.by_slot||[]).length?Ge("",!0):(M(),V("li",W_,"No slot data in selected range."))])]),c("div",K_,[h[6]||(h[6]=c("h3",null,"Ad Slot By Service Type",-1)),c("ul",null,[(M(!0),V(Y,null,ue(i.value.by_service_type||[],I=>(M(),V("li",{key:I.service_type},A(I.service_type)+": served "+A(I.served)+", impressions "+A(I.impressions)+", clicks "+A(I.clicks)+", ctr "+A(I.ctr)+"% ",1))),128)),(i.value.by_service_type||[]).length?Ge("",!0):(M(),V("li",G_,"No service type data in selected range."))])])])])}}},q_={class:"filter-row panel"},J_={class:"panel table-wrap"},Y_=["onClick"],X_=["onClick"],Q_=["onClick"],Z_={key:0,class:"drawer"},ey={__name:"UsersPage",setup(t){const e=ie("7d"),n=ie(""),s=ie(""),r=ie([]),i=ie(null),o=Oe({role:"",status:"",paid:""}),a=g=>g.toISOString().slice(0,10),l=()=>{const g=new Date;if(e.value==="today")return{from:a(g),to:a(g)};if(e.value==="7d"){const v=new Date(g);return v.setDate(v.getDate()-6),{from:a(v),to:a(g)}}if(e.value==="30d"){const v=new Date(g);return v.setDate(v.getDate()-29),{from:a(v),to:a(g)}}return{from:n.value,to:s.value}},u=async()=>{const g=await ge.listUsers({...l(),...o,page:1,page_size:100});r.value=g.items||[]},f=async g=>{i.value=await ge.getUser(g)},d=async g=>{await ge.freezeUser(g,{reason:"manual_freeze"}),await u()},h=async g=>{await ge.unfreezeUser(g,{reason:"manual_unfreeze"}),await u()};return Ct([e,n,s],u),fn(u),(g,v)=>(M(),V("section",null,[pe(vr,{modelValue:e.value,"onUpdate:modelValue":v[0]||(v[0]=E=>e.value=E),from:n.value,"onUpdate:from":v[1]||(v[1]=E=>n.value=E),to:s.value,"onUpdate:to":v[2]||(v[2]=E=>s.value=E)},null,8,["modelValue","from","to"]),c("div",q_,[X(c("select",{"onUpdate:modelValue":v[3]||(v[3]=E=>o.role=E)},[...v[7]||(v[7]=[yd('<option value="">All roles</option><option value="admin">admin</option><option value="pm_po">pm_po</option><option value="tt">tt</option><option value="sp">sp</option>',5)])],512),[[Ke,o.role]]),X(c("select",{"onUpdate:modelValue":v[4]||(v[4]=E=>o.status=E)},[...v[8]||(v[8]=[c("option",{value:""},"All status",-1),c("option",{value:"active"},"active",-1),c("option",{value:"frozen"},"frozen",-1)])],512),[[Ke,o.status]]),X(c("select",{"onUpdate:modelValue":v[5]||(v[5]=E=>o.paid=E)},[...v[9]||(v[9]=[c("option",{value:""},"All paid",-1),c("option",{value:"true"},"paid",-1),c("option",{value:"false"},"free",-1)])],512),[[Ke,o.paid]]),c("button",{class:"primary",onClick:u},"Refresh")]),c("div",J_,[c("table",null,[v[10]||(v[10]=c("thead",null,[c("tr",null,[c("th",null,"user_id"),c("th",null,"email"),c("th",null,"account_type"),c("th",null,"status"),c("th",null,"last_active_at"),c("th",null,"created_at"),c("th",null,"actions")])],-1)),c("tbody",null,[(M(!0),V(Y,null,ue(r.value,E=>(M(),V("tr",{key:E.user_id},[c("td",null,[c("a",{href:"#",onClick:ki(O=>f(E.user_id),["prevent"])},A(E.user_id),9,Y_)]),c("td",null,A(E.email),1),c("td",null,A(E.account_type),1),c("td",null,A(E.status),1),c("td",null,A(E.last_active_at),1),c("td",null,A(E.created_at),1),c("td",null,[E.status!=="frozen"?(M(),V("button",{key:0,class:"danger",onClick:O=>d(E.user_id)},"Freeze",8,X_)):(M(),V("button",{key:1,class:"success",onClick:O=>h(E.user_id)},"Unfreeze",8,Q_))])]))),128))])])]),i.value?(M(),V("aside",Z_,[v[15]||(v[15]=c("h3",null,"User Detail",-1)),c("p",null,[v[11]||(v[11]=c("strong",null,"ID:",-1)),Ee(" "+A(i.value.user_id),1)]),c("p",null,[v[12]||(v[12]=c("strong",null,"Email:",-1)),Ee(" "+A(i.value.email_masked),1)]),c("p",null,[v[13]||(v[13]=c("strong",null,"Status:",-1)),Ee(" "+A(i.value.status),1)]),c("p",null,[v[14]||(v[14]=c("strong",null,"Linked assets:",-1)),Ee(" "+A(i.value.linked_assets),1)]),v[16]||(v[16]=c("h4",null,"Recent Timeline",-1)),c("ul",null,[(M(!0),V(Y,null,ue(i.value.recent_timeline||[],E=>(M(),V("li",{key:E.id},A(E.created_at)+" - "+A(E.event_type),1))),128))]),c("button",{onClick:v[6]||(v[6]=E=>i.value=null)},"Close")])):Ge("",!0)]))}},ty={class:"kpi-grid"},ny={class:"kpi-title"},sy={class:"kpi-value"},ry={key:0,class:"metric-caption"},iy={class:"panel",style:{"margin-top":"12px"}},oy={class:"filter-row"},ay={class:"panel",style:{"margin-top":"12px"}},ly={class:"filter-row"},cy=["value"],uy=["value"],dy={class:"panel table-wrap",style:{"margin-top":"12px"}},fy={key:0},hy={class:"row"},py={class:"col panel table-wrap"},my={key:0},gy={class:"col panel table-wrap"},_y={key:0},yy={__name:"BillingPage",setup(t){const e=ie("30d"),n=ie(""),s=ie(""),r=ie({}),i=ie([]),o=ie([]),a=ie([]),l=Oe({sp_id:"",delta:0,reason:""}),u=Oe({sp_id:"",order_status:"",entry_type:""}),f=["pending","created","checkout_created","paid","credited","failed","canceled","cancelled","refunded"],d=["purchase","consume","refund","adjustment","void","bid_use","usage"],h=K=>K.toISOString().slice(0,10),g=()=>{const K=new Date;if(e.value==="today")return{from:h(K),to:h(K)};if(e.value==="7d"){const b=new Date(K);return b.setDate(b.getDate()-6),{from:h(b),to:h(K)}}if(e.value==="30d"){const b=new Date(K);return b.setDate(b.getDate()-29),{from:h(b),to:h(K)}}return{from:n.value,to:s.value}},v=K=>{if(!K)return"-";const b=new Date(K);return Number.isNaN(b.getTime())?String(K):b.toLocaleString()},E=K=>{const b=Number(K||0);return Number.isFinite(b)?b>0?`+${b}`:String(b):"-"},O=K=>Number(K.credits||0)===10?"sp_bid_starter_10":Number(K.credits||0)===1?"sp_bid_single":"-",I=(K,b="USD",y=null)=>{const k=Number(K||0),Fe=Number(y||0),tt=Number.isFinite(k)&&k>0?k/100:Fe;return new Intl.NumberFormat(void 0,{style:"currency",currency:b||"USD",minimumFractionDigits:2}).format(tt)},C=K=>{const b=String(K||"").toLowerCase();return["pending","created","checkout_created"].includes(b)?"badge warning":["paid","credited"].includes(b)?"badge ok":["failed","refunded","canceled","cancelled"].includes(b)?"badge critical":"badge warning"},U=async()=>{const K=g(),b={page:1,page_size:200,sp_id:u.sp_id},y={...K,sp_id:u.sp_id,status:u.order_status},k={...K,sp_id:u.sp_id,entry_type:u.entry_type};r.value=await ge.getBillingSummary(K),i.value=(await ge.listCreditAccounts(b)).items||[],o.value=(await ge.listCreditOrders(y)).items||[],a.value=(await ge.listCreditLedger(k)).items||[]},B=async()=>{await ge.adjustCredits({sp_id:l.sp_id,delta:Number(l.delta||0),reason:l.reason,confirm_token:"CONFIRM"}),await U()},ee=ke(()=>{var K,b,y,k;return[{label:"MRR (estimate)",value:`$${((K=r.value.plan_overview)==null?void 0:K.mrr_estimate_usd)||0}`},{label:"Conversion rate",value:`${((b=r.value.plan_overview)==null?void 0:b.conversion_rate)||0}%`},{label:"Total purchased",value:((y=r.value.sp_credit_overview)==null?void 0:y.total_purchased)||0,caption:"Confirmed credit purchases"},{label:"Total balance",value:((k=r.value.sp_credit_overview)==null?void 0:k.total_balance)||0,caption:"Current outstanding credits"}]});return Ct([e,n,s],U),fn(U),(K,b)=>(M(),V("section",null,[pe(vr,{modelValue:e.value,"onUpdate:modelValue":b[0]||(b[0]=y=>e.value=y),from:n.value,"onUpdate:from":b[1]||(b[1]=y=>n.value=y),to:s.value,"onUpdate:to":b[2]||(b[2]=y=>s.value=y)},null,8,["modelValue","from","to"]),c("div",ty,[(M(!0),V(Y,null,ue(ee.value,y=>(M(),V("div",{class:"panel",key:y.label},[c("div",ny,A(y.label),1),c("div",sy,A(y.value),1),y.caption?(M(),V("div",ry,A(y.caption),1)):Ge("",!0)]))),128))]),b[23]||(b[23]=c("div",{class:"panel billing-note",style:{"margin-top":"12px"}},[c("strong",null,"Phase 1 scope:"),Ee(" SP billing covers bid credits only. Launch SKUs are `sp_bid_single` ($4.99 / 1 credit) and `sp_bid_starter_10` ($29.99 / 10 credits). Payment confirmation and crediting remain separate events. ")],-1)),c("div",iy,[b[9]||(b[9]=c("h3",null,"Manual Credit Adjustment",-1)),c("div",oy,[X(c("input",{"onUpdate:modelValue":b[3]||(b[3]=y=>l.sp_id=y),placeholder:"sp_id"},null,512),[[ye,l.sp_id,void 0,{trim:!0}]]),X(c("input",{"onUpdate:modelValue":b[4]||(b[4]=y=>l.delta=y),type:"number",placeholder:"delta"},null,512),[[ye,l.delta,void 0,{number:!0}]]),X(c("input",{"onUpdate:modelValue":b[5]||(b[5]=y=>l.reason=y),placeholder:"reason (required)"},null,512),[[ye,l.reason,void 0,{trim:!0}]]),c("button",{class:"danger",onClick:B},"Adjust (CONFIRM)")]),b[10]||(b[10]=c("div",{class:"inline-note"},"Every adjustment requires a reason and is expected to create an auditable ledger entry.",-1))]),c("div",ay,[b[13]||(b[13]=c("h3",null,"Filters",-1)),c("div",ly,[X(c("input",{"onUpdate:modelValue":b[6]||(b[6]=y=>u.sp_id=y),placeholder:"Filter by sp_id"},null,512),[[ye,u.sp_id,void 0,{trim:!0}]]),X(c("select",{"onUpdate:modelValue":b[7]||(b[7]=y=>u.order_status=y)},[b[11]||(b[11]=c("option",{value:""},"All order statuses",-1)),(M(),V(Y,null,ue(f,y=>c("option",{key:y,value:y},A(y),9,cy)),64))],512),[[Ke,u.order_status]]),X(c("select",{"onUpdate:modelValue":b[8]||(b[8]=y=>u.entry_type=y)},[b[12]||(b[12]=c("option",{value:""},"All ledger types",-1)),(M(),V(Y,null,ue(d,y=>c("option",{key:y,value:y},A(y),9,uy)),64))],512),[[Ke,u.entry_type]]),c("button",{class:"primary",onClick:U},"Apply Filters")])]),c("div",dy,[b[16]||(b[16]=c("div",{class:"section-header"},[c("h3",null,"Credit Accounts"),c("span",{class:"inline-note"},"Current balance snapshot by SP.")],-1)),c("table",null,[b[15]||(b[15]=c("thead",null,[c("tr",null,[c("th",null,"sp_id"),c("th",null,"balance"),c("th",null,"lifetime_purchased"),c("th",null,"lifetime_used"),c("th",null,"updated_at")])],-1)),c("tbody",null,[(M(!0),V(Y,null,ue(i.value,y=>(M(),V("tr",{key:y.sp_id},[c("td",null,A(y.sp_id),1),c("td",null,A(y.balance),1),c("td",null,A(y.lifetime_purchased),1),c("td",null,A(y.lifetime_used),1),c("td",null,A(v(y.updated_at)),1)]))),128)),i.value.length?Ge("",!0):(M(),V("tr",fy,[...b[14]||(b[14]=[c("td",{colspan:"5",class:"empty-state"},"No matching accounts.",-1)])]))])])]),c("div",hy,[c("div",py,[b[19]||(b[19]=c("div",{class:"section-header"},[c("h3",null,"Orders"),c("span",{class:"inline-note"},"Inspect created, paid, failed, and refunded purchases.")],-1)),c("table",null,[b[18]||(b[18]=c("thead",null,[c("tr",null,[c("th",null,"order_id"),c("th",null,"sp_id"),c("th",null,"sku"),c("th",null,"credits"),c("th",null,"amount"),c("th",null,"status"),c("th",null,"provider"),c("th",null,"created_at")])],-1)),c("tbody",null,[(M(!0),V(Y,null,ue(o.value,y=>(M(),V("tr",{key:y.id},[c("td",null,A(y.id),1),c("td",null,A(y.sp_id),1),c("td",null,A(y.sku_name||y.sku_code||O(y)),1),c("td",null,A(y.credits),1),c("td",null,A(I(y.amount_cents,y.currency,y.amount)),1),c("td",null,[c("span",{class:$e(C(y.status))},A(y.status||"created"),3)]),c("td",null,A(y.provider||"-"),1),c("td",null,A(v(y.created_at)),1)]))),128)),o.value.length?Ge("",!0):(M(),V("tr",my,[...b[17]||(b[17]=[c("td",{colspan:"8",class:"empty-state"},"No matching orders.",-1)])]))])])]),c("div",gy,[b[22]||(b[22]=c("div",{class:"section-header"},[c("h3",null,"Ledger"),c("span",{class:"inline-note"},"Append-only audit trail for purchases, consume, refunds, and adjustments.")],-1)),c("table",null,[b[21]||(b[21]=c("thead",null,[c("tr",null,[c("th",null,"entry_id"),c("th",null,"sp_id"),c("th",null,"entry_type"),c("th",null,"delta"),c("th",null,"balance_after"),c("th",null,"source_type"),c("th",null,"source_id"),c("th",null,"created_at")])],-1)),c("tbody",null,[(M(!0),V(Y,null,ue(a.value,y=>(M(),V("tr",{key:y.id},[c("td",null,A(y.id),1),c("td",null,A(y.sp_id),1),c("td",null,A(y.entry_type),1),c("td",{class:$e(Number(y.delta||0)>=0?"delta-positive":"delta-negative")},A(E(y.delta)),3),c("td",null,A(y.balance_after),1),c("td",null,A(y.source_type||"-"),1),c("td",null,A(y.source_id||y.note||"-"),1),c("td",null,A(v(y.created_at)),1)]))),128)),a.value.length?Ge("",!0):(M(),V("tr",_y,[...b[20]||(b[20]=[c("td",{colspan:"8",class:"empty-state"},"No matching ledger entries.",-1)])]))])])])])]))}},vy={class:"filter-row panel"},by={class:"row"},Ey={class:"col panel"},Iy={class:"col panel"},wy={class:"col panel"},Sy={class:"panel table-wrap",style:{"margin-top":"12px"}},Cy={class:"panel table-wrap",style:{"margin-top":"12px"}},Ty={__name:"LogsPage",setup(t){const e=ie("7d"),n=ie(""),s=ie(""),r=ie([]),i=ie([]),o=Oe({request_id:"",user_id:"",task_id:""}),a=d=>d.toISOString().slice(0,10),l=()=>{const d=new Date;if(e.value==="today")return{from:a(d),to:a(d)};if(e.value==="7d"){const h=new Date(d);return h.setDate(h.getDate()-6),{from:a(h),to:a(d)}}if(e.value==="30d"){const h=new Date(d);return h.setDate(h.getDate()-29),{from:a(h),to:a(d)}}return{from:n.value,to:s.value}},u=async()=>{const d=l();r.value=(await ge.listEvents({...d,request_id:o.request_id,user_id:o.user_id,task_id:o.task_id,lead_id:o.task_id,order_id:o.task_id})).items||[],i.value=(await ge.listErrors({...d,request_id:o.request_id})).items||[]},f=ke(()=>{const d=i.value.length>20?"warning":"ok",h=i.value.filter(v=>String(v.route||"").includes("callback")).length>3?"warning":"ok",g=r.value.some(v=>{var E;return Number(((E=v.metadata)==null?void 0:E.balance_after)||0)<0})?"critical":"ok";return{errorSpike:d,callbackFailure:h,negativeCredit:g}});return Ct([e,n,s],u),fn(u),(d,h)=>(M(),V("section",null,[pe(vr,{modelValue:e.value,"onUpdate:modelValue":h[0]||(h[0]=g=>e.value=g),from:n.value,"onUpdate:from":h[1]||(h[1]=g=>n.value=g),to:s.value,"onUpdate:to":h[2]||(h[2]=g=>s.value=g)},null,8,["modelValue","from","to"]),c("div",vy,[X(c("input",{"onUpdate:modelValue":h[3]||(h[3]=g=>o.request_id=g),placeholder:"request_id"},null,512),[[ye,o.request_id]]),X(c("input",{"onUpdate:modelValue":h[4]||(h[4]=g=>o.user_id=g),placeholder:"user_id"},null,512),[[ye,o.user_id]]),X(c("input",{"onUpdate:modelValue":h[5]||(h[5]=g=>o.task_id=g),placeholder:"task_id / lead_id / order_id"},null,512),[[ye,o.task_id]]),c("button",{class:"primary",onClick:u},"Search")]),c("div",by,[c("div",Ey,[h[6]||(h[6]=c("strong",null,"24h error spike:",-1)),c("span",{class:$e(`badge ${f.value.errorSpike}`)},A(f.value.errorSpike),3)]),c("div",Iy,[h[7]||(h[7]=c("strong",null,"callback failure rate:",-1)),c("span",{class:$e(`badge ${f.value.callbackFailure}`)},A(f.value.callbackFailure),3)]),c("div",wy,[h[8]||(h[8]=c("strong",null,"negative credit balance:",-1)),c("span",{class:$e(`badge ${f.value.negativeCredit}`)},A(f.value.negativeCredit),3)])]),c("div",Sy,[h[10]||(h[10]=c("h3",null,"Event Logs",-1)),c("table",null,[h[9]||(h[9]=c("thead",null,[c("tr",null,[c("th",null,"created_at"),c("th",null,"event_type"),c("th",null,"user_id"),c("th",null,"entity_type"),c("th",null,"entity_id"),c("th",null,"request_id")])],-1)),c("tbody",null,[(M(!0),V(Y,null,ue(r.value,g=>(M(),V("tr",{key:g.id},[c("td",null,A(g.created_at),1),c("td",null,A(g.event_type),1),c("td",null,A(g.user_id),1),c("td",null,A(g.entity_type),1),c("td",null,A(g.entity_id),1),c("td",null,A(g.request_id),1)]))),128))])])]),c("div",Cy,[h[12]||(h[12]=c("h3",null,"Error Logs",-1)),c("table",null,[h[11]||(h[11]=c("thead",null,[c("tr",null,[c("th",null,"created_at"),c("th",null,"request_id"),c("th",null,"route"),c("th",null,"error_code"),c("th",null,"retryable")])],-1)),c("tbody",null,[(M(!0),V(Y,null,ue(i.value,g=>(M(),V("tr",{key:g.id},[c("td",null,A(g.created_at),1),c("td",null,A(g.request_id),1),c("td",null,A(g.route),1),c("td",null,A(g.error_code),1),c("td",null,A(g.retryable),1)]))),128))])])])]))}},Ay={class:"panel filter-row"},Ry=["value"],Py={class:"row"},ky={class:"col panel table-wrap"},Oy={style:{"white-space":"pre-wrap"}},Ny=["onClick"],Dy=["onClick"],xy={class:"col panel"},Ly={style:{display:"grid",gap:"8px"}},My={class:"panel table-wrap",style:{"margin-top":"12px"}},Uy=["onClick"],Fy={key:0,style:{"margin-top":"8px"}},Vy={__name:"DataManagementPage",setup(t){const e=ie([]),n=ie([]),s=ie([]),r=Oe({collection:"",docId:"",limit:50,message:""}),i=Oe({docId:"",patchText:`{

}`,reason:""}),o=O=>JSON.stringify(O,null,2),a=async()=>{const O=await ge.listDataCollections();e.value=O.items||[]},l=()=>{if(!r.collection)throw new Error("Please select a collection")},u=async()=>{try{l();const O=await ge.listDataRecords({collection:r.collection,doc_id:r.docId,limit:r.limit});n.value=O.items||[],r.message=`Loaded ${n.value.length} records.`}catch(O){r.message=O.message||"Failed to load records."}},f=async()=>{try{l();const O=await ge.listDataChanges({collection:r.collection,doc_id:r.docId,limit:200});s.value=O.items||[],r.message=`Loaded ${s.value.length} change logs.`}catch(O){r.message=O.message||"Failed to load changes."}},d=O=>{i.docId=O.id||"";const I={...O};delete I.id,i.patchText=JSON.stringify(I,null,2)},h=O=>{i.docId=O.id||""},g=async()=>{try{l();const O=JSON.parse(i.patchText||"{}");await ge.updateDataRecord({collection:r.collection,doc_id:i.docId,patch:O,reason:i.reason}),r.message="Record updated. Audit log saved.",await u(),await f()}catch(O){r.message=O.message||"Update failed."}},v=async()=>{try{l(),await ge.deleteDataRecord({collection:r.collection,doc_id:i.docId,reason:i.reason}),r.message="Record deleted. Audit log saved.",await u(),await f()}catch(O){r.message=O.message||"Delete failed."}},E=async O=>{try{await ge.rollbackDataChange({change_id:O.id,reason:`rollback-from-ui:${O.id}`}),r.message=`Rollback completed for ${O.id}`,await u(),await f()}catch(I){r.message=I.message||"Rollback failed."}};return fn(async()=>{await a()}),(O,I)=>(M(),V("section",null,[c("div",Ay,[X(c("select",{"onUpdate:modelValue":I[0]||(I[0]=C=>r.collection=C)},[I[6]||(I[6]=c("option",{value:""},"Select collection",-1)),(M(!0),V(Y,null,ue(e.value,C=>(M(),V("option",{key:C,value:C},A(C),9,Ry))),128))],512),[[Ke,r.collection]]),X(c("input",{"onUpdate:modelValue":I[1]||(I[1]=C=>r.docId=C),placeholder:"doc_id (optional)"},null,512),[[ye,r.docId]]),X(c("input",{"onUpdate:modelValue":I[2]||(I[2]=C=>r.limit=C),type:"number",min:"1",max:"200",placeholder:"limit"},null,512),[[ye,r.limit,void 0,{number:!0}]]),c("button",{class:"primary",onClick:u},"Load Records"),c("button",{onClick:f},"Load Changes")]),c("div",Py,[c("div",ky,[I[8]||(I[8]=c("h3",null,"Records",-1)),c("table",null,[I[7]||(I[7]=c("thead",null,[c("tr",null,[c("th",null,"id"),c("th",null,"data"),c("th",null,"action")])],-1)),c("tbody",null,[(M(!0),V(Y,null,ue(n.value,C=>(M(),V("tr",{key:C.id},[c("td",null,A(C.id),1),c("td",null,[c("pre",Oy,A(o(C)),1)]),c("td",null,[c("button",{onClick:U=>d(C)},"Edit",8,Ny),c("button",{class:"danger",onClick:U=>h(C)},"Delete",8,Dy)])]))),128))])])]),c("div",xy,[I[9]||(I[9]=c("h3",null,"Edit / Delete",-1)),c("div",Ly,[X(c("input",{"onUpdate:modelValue":I[3]||(I[3]=C=>i.docId=C),placeholder:"doc_id"},null,512),[[ye,i.docId]]),X(c("textarea",{"onUpdate:modelValue":I[4]||(I[4]=C=>i.patchText=C),rows:"10",placeholder:'{"field":"value"}'},null,512),[[ye,i.patchText]]),X(c("input",{"onUpdate:modelValue":I[5]||(I[5]=C=>i.reason=C),placeholder:"reason (required)"},null,512),[[ye,i.reason]]),c("div",{class:"filter-row"},[c("button",{class:"primary",onClick:g},"Update"),c("button",{class:"danger",onClick:v},"Delete")])])])]),c("div",My,[I[11]||(I[11]=c("h3",null,"Change Logs (Rollback)",-1)),c("table",null,[I[10]||(I[10]=c("thead",null,[c("tr",null,[c("th",null,"change_id"),c("th",null,"collection"),c("th",null,"doc_id"),c("th",null,"action"),c("th",null,"reason"),c("th",null,"actor"),c("th",null,"created_at"),c("th",null,"rollback")])],-1)),c("tbody",null,[(M(!0),V(Y,null,ue(s.value,C=>(M(),V("tr",{key:C.id},[c("td",null,A(C.id),1),c("td",null,A(C.collection),1),c("td",null,A(C.doc_id),1),c("td",null,A(C.action),1),c("td",null,A(C.reason),1),c("td",null,A(C.actor_id),1),c("td",null,A(C.created_at),1),c("td",null,[c("button",{onClick:U=>E(C)},"Rollback",8,Uy)])]))),128))])])]),r.message?(M(),V("p",Fy,A(r.message),1)):Ge("",!0)]))}},$y={class:"filter-row panel"},By=["value"],Hy=["value"],jy=["value"],Wy={class:"row"},Ky={class:"col panel table-wrap"},Gy={class:"support-counters"},zy=["onClick"],qy={key:0,class:"col panel"},Jy={class:"ticket-header"},Yy={class:"filter-row"},Xy=["value"],Qy=["value"],Zy=["value"],ev={class:"flag-row"},tv={class:"filter-row"},nv={class:"thread"},sv={class:"filter-row"},rv={key:0,style:{"margin-top":"8px"}},Ea={__name:"SupportInboxPage",setup(t){const e=mh(),n=Di(),s=["open","triaged","in_progress","waiting_on_user","resolved","closed"],r=["account","task_lead","payment_credit","bug"],i=["low","normal","high","urgent"],o=ie([]),a=ie({}),l=ie(""),u=Oe({ticket:null,comments:[]}),f=Oe({status:"",category:"",priority:"",assigned_to:"",q:""}),d=Oe({status:"open",category:"bug",priority:"normal",assigned_to:"",related_entity_type:"",related_entity_id:"",needs_billing_review:!1,needs_backend_fix:!1,needs_frontend_fix:!1,needs_ios_fix:!1}),h=Oe({body:""}),g=b=>{d.status=b.status||"open",d.category=b.category||"bug",d.priority=b.priority||"normal",d.assigned_to=b.assigned_to||"",d.related_entity_type=b.related_entity_type||"",d.related_entity_id=b.related_entity_id||"",d.needs_billing_review=!!b.needs_billing_review,d.needs_backend_fix=!!b.needs_backend_fix,d.needs_frontend_fix=!!b.needs_frontend_fix,d.needs_ios_fix=!!b.needs_ios_fix},v=async()=>{const b=await ge.listSupportTickets({...f,limit:150});o.value=b.items||[],a.value=b.counters||{}},E=async b=>{const y=await ge.getSupportTicket(b);u.ticket=y.ticket,u.comments=y.comments||[],g(y.ticket),n.replace(`/support/${b}`)},O=()=>{u.ticket=null,u.comments=[],n.replace("/support")},I=async()=>{if(!u.ticket)return;const b=await ge.updateSupportTicket(u.ticket.id,{...d});u.ticket=b.ticket,g(b.ticket),l.value="Ticket updated.",await v()},C=async b=>{d.status=b,await I()},U=async b=>{u.ticket&&(await ge.addSupportComment(u.ticket.id,b),h.body="",await E(u.ticket.id),await v())},B=()=>U({body:h.body,internal:!1}),ee=()=>U({body:h.body,internal:!1,request_more_info:!0}),K=()=>U({body:h.body,internal:!0});return Ct(()=>e.params.ticketId,b=>{b&&E(String(b))}),fn(async()=>{await v(),e.params.ticketId&&await E(String(e.params.ticketId))}),(b,y)=>(M(),V("section",null,[c("div",$y,[X(c("select",{"onUpdate:modelValue":y[0]||(y[0]=k=>f.status=k)},[y[18]||(y[18]=c("option",{value:""},"All status",-1)),(M(),V(Y,null,ue(s,k=>c("option",{key:k,value:k},A(k),9,By)),64))],512),[[Ke,f.status]]),X(c("select",{"onUpdate:modelValue":y[1]||(y[1]=k=>f.category=k)},[y[19]||(y[19]=c("option",{value:""},"All categories",-1)),(M(),V(Y,null,ue(r,k=>c("option",{key:k,value:k},A(k),9,Hy)),64))],512),[[Ke,f.category]]),X(c("select",{"onUpdate:modelValue":y[2]||(y[2]=k=>f.priority=k)},[y[20]||(y[20]=c("option",{value:""},"All priorities",-1)),(M(),V(Y,null,ue(i,k=>c("option",{key:k,value:k},A(k),9,jy)),64))],512),[[Ke,f.priority]]),X(c("input",{"onUpdate:modelValue":y[3]||(y[3]=k=>f.assigned_to=k),placeholder:"assigned_to"},null,512),[[ye,f.assigned_to]]),X(c("input",{"onUpdate:modelValue":y[4]||(y[4]=k=>f.q=k),placeholder:"Search subject, user, ticket"},null,512),[[ye,f.q]]),c("button",{class:"primary",onClick:v},"Search")]),c("div",Wy,[c("div",Ky,[c("div",Gy,[(M(),V(Y,null,ue(s,k=>c("span",{key:k,class:"badge ok"},A(k)+": "+A(a.value[k]||0),1)),64))]),c("table",null,[y[21]||(y[21]=c("thead",null,[c("tr",null,[c("th",null,"ticket"),c("th",null,"subject"),c("th",null,"category"),c("th",null,"status"),c("th",null,"priority"),c("th",null,"assigned"),c("th",null,"updated")])],-1)),c("tbody",null,[(M(!0),V(Y,null,ue(o.value,k=>(M(),V("tr",{key:k.id},[c("td",null,[c("a",{href:"#",onClick:ki(Fe=>E(k.id),["prevent"])},A(k.id),9,zy)]),c("td",null,A(k.subject),1),c("td",null,A(k.category),1),c("td",null,A(k.status),1),c("td",null,A(k.priority),1),c("td",null,A(k.assigned_to||"unassigned"),1),c("td",null,A(k.updated_at),1)]))),128))])])]),u.ticket?(M(),V("div",qy,[c("div",Jy,[c("h3",null,A(u.ticket.subject),1),c("button",{onClick:O},"Close")]),c("p",null,[y[22]||(y[22]=c("strong",null,"ID:",-1)),Ee(" "+A(u.ticket.id),1)]),c("p",null,[y[23]||(y[23]=c("strong",null,"User:",-1)),Ee(" "+A(u.ticket.user_id)+" / "+A(u.ticket.user_role),1)]),c("p",null,[y[24]||(y[24]=c("strong",null,"Related:",-1)),Ee(" "+A(u.ticket.related_entity_type||"-")+" "+A(u.ticket.related_entity_id||""),1)]),c("div",Yy,[X(c("select",{"onUpdate:modelValue":y[5]||(y[5]=k=>d.status=k)},[(M(),V(Y,null,ue(s,k=>c("option",{key:k,value:k},A(k),9,Xy)),64))],512),[[Ke,d.status]]),X(c("select",{"onUpdate:modelValue":y[6]||(y[6]=k=>d.category=k)},[(M(),V(Y,null,ue(r,k=>c("option",{key:k,value:k},A(k),9,Qy)),64))],512),[[Ke,d.category]]),X(c("select",{"onUpdate:modelValue":y[7]||(y[7]=k=>d.priority=k)},[(M(),V(Y,null,ue(i,k=>c("option",{key:k,value:k},A(k),9,Zy)),64))],512),[[Ke,d.priority]]),X(c("input",{"onUpdate:modelValue":y[8]||(y[8]=k=>d.assigned_to=k),placeholder:"assigned_to"},null,512),[[ye,d.assigned_to]])]),c("div",ev,[c("label",null,[X(c("input",{"onUpdate:modelValue":y[9]||(y[9]=k=>d.needs_billing_review=k),type:"checkbox"},null,512),[[Ps,d.needs_billing_review]]),y[25]||(y[25]=Ee(" billing",-1))]),c("label",null,[X(c("input",{"onUpdate:modelValue":y[10]||(y[10]=k=>d.needs_backend_fix=k),type:"checkbox"},null,512),[[Ps,d.needs_backend_fix]]),y[26]||(y[26]=Ee(" backend",-1))]),c("label",null,[X(c("input",{"onUpdate:modelValue":y[11]||(y[11]=k=>d.needs_frontend_fix=k),type:"checkbox"},null,512),[[Ps,d.needs_frontend_fix]]),y[27]||(y[27]=Ee(" frontend",-1))]),c("label",null,[X(c("input",{"onUpdate:modelValue":y[12]||(y[12]=k=>d.needs_ios_fix=k),type:"checkbox"},null,512),[[Ps,d.needs_ios_fix]]),y[28]||(y[28]=Ee(" iOS",-1))])]),c("div",tv,[X(c("input",{"onUpdate:modelValue":y[13]||(y[13]=k=>d.related_entity_type=k),placeholder:"related_entity_type"},null,512),[[ye,d.related_entity_type]]),X(c("input",{"onUpdate:modelValue":y[14]||(y[14]=k=>d.related_entity_id=k),placeholder:"related_entity_id"},null,512),[[ye,d.related_entity_id]]),c("button",{class:"primary",onClick:I},"Save")]),y[29]||(y[29]=c("h4",null,"Thread",-1)),c("div",nv,[(M(!0),V(Y,null,ue(u.comments,k=>(M(),V("div",{key:k.id,class:$e(["comment",{internal:k.internal}])},[c("strong",null,A(k.author_type),1),c("span",null,A(k.created_at),1),c("p",null,A(k.body),1)],2))),128))]),X(c("textarea",{"onUpdate:modelValue":y[15]||(y[15]=k=>h.body=k),rows:"5",placeholder:"Reply or internal note"},null,512),[[ye,h.body]]),c("div",sv,[c("button",{class:"primary",onClick:B},"Send Reply"),c("button",{onClick:ee},"Request Info"),c("button",{onClick:K},"Internal Note"),c("button",{class:"success",onClick:y[16]||(y[16]=k=>C("resolved"))},"Resolve"),c("button",{onClick:y[17]||(y[17]=k=>C("closed"))},"Close")])])):Ge("",!0)]),l.value?(M(),V("p",rv,A(l.value),1)):Ge("",!0)]))}},xc=ph({history:Gf(),routes:[{path:"/login",component:S_,meta:{public:!0}},{path:"/",component:P_,children:[{path:"",redirect:"/overview"},{path:"overview",component:z_},{path:"users",component:ey},{path:"billing",component:yy},{path:"logs",component:Ty},{path:"data-management",component:Vy},{path:"support",component:Ea},{path:"support/:ticketId",component:Ea}]}]}),iv=()=>new Promise(t=>{const e=Zm(un,()=>{e(),t()})});xc.beforeEach(async t=>(await iv(),t.meta.public?un.currentUser&&await ui().catch(()=>!1)?"/overview":!0:un.currentUser&&await ui().catch(()=>!1)?!0:"/login"));tf(lf).use(xc).mount("#app");

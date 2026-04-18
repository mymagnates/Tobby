(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))r(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&r(o)}).observe(document,{childList:!0,subtree:!0});function n(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function r(s){if(s.ep)return;s.ep=!0;const i=n(s);fetch(s.href,i)}})();/**
* @vue/shared v3.5.29
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/function ci(t){const e=Object.create(null);for(const n of t.split(","))e[n]=1;return n=>n in e}const re={},mn=[],nt=()=>{},ga=()=>!1,Xr=t=>t.charCodeAt(0)===111&&t.charCodeAt(1)===110&&(t.charCodeAt(2)>122||t.charCodeAt(2)<97),ui=t=>t.startsWith("onUpdate:"),ge=Object.assign,fi=(t,e)=>{const n=t.indexOf(e);n>-1&&t.splice(n,1)},Oc=Object.prototype.hasOwnProperty,X=(t,e)=>Oc.call(t,e),H=Array.isArray,_n=t=>ur(t)==="[object Map]",Qr=t=>ur(t)==="[object Set]",$i=t=>ur(t)==="[object Date]",j=t=>typeof t=="function",fe=t=>typeof t=="string",ot=t=>typeof t=="symbol",Z=t=>t!==null&&typeof t=="object",ma=t=>(Z(t)||j(t))&&j(t.then)&&j(t.catch),_a=Object.prototype.toString,ur=t=>_a.call(t),kc=t=>ur(t).slice(8,-1),ya=t=>ur(t)==="[object Object]",di=t=>fe(t)&&t!=="NaN"&&t[0]!=="-"&&""+parseInt(t,10)===t,Wn=ci(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"),Zr=t=>{const e=Object.create(null);return(n=>e[n]||(e[n]=t(n)))},Nc=/-\w/g,Le=Zr(t=>t.replace(Nc,e=>e.slice(1).toUpperCase())),Dc=/\B([A-Z])/g,an=Zr(t=>t.replace(Dc,"-$1").toLowerCase()),es=Zr(t=>t.charAt(0).toUpperCase()+t.slice(1)),_s=Zr(t=>t?`on${es(t)}`:""),Ft=(t,e)=>!Object.is(t,e),Tr=(t,...e)=>{for(let n=0;n<t.length;n++)t[n](...e)},va=(t,e,n,r=!1)=>{Object.defineProperty(t,e,{configurable:!0,enumerable:!1,writable:r,value:n})},ts=t=>{const e=parseFloat(t);return isNaN(e)?t:e};let ji;const ns=()=>ji||(ji=typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof window<"u"?window:typeof global<"u"?global:{});function hi(t){if(H(t)){const e={};for(let n=0;n<t.length;n++){const r=t[n],s=fe(r)?Uc(r):hi(r);if(s)for(const i in s)e[i]=s[i]}return e}else if(fe(t)||Z(t))return t}const xc=/;(?![^(]*\))/g,Mc=/:([^]+)/,Lc=/\/\*[^]*?\*\//g;function Uc(t){const e={};return t.replace(Lc,"").split(xc).forEach(n=>{if(n){const r=n.split(Mc);r.length>1&&(e[r[0].trim()]=r[1].trim())}}),e}function et(t){let e="";if(fe(t))e=t;else if(H(t))for(let n=0;n<t.length;n++){const r=et(t[n]);r&&(e+=r+" ")}else if(Z(t))for(const n in t)t[n]&&(e+=n+" ");return e.trim()}const Fc="itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly",Vc=ci(Fc);function ba(t){return!!t||t===""}function Bc(t,e){if(t.length!==e.length)return!1;let n=!0;for(let r=0;n&&r<t.length;r++)n=fr(t[r],e[r]);return n}function fr(t,e){if(t===e)return!0;let n=$i(t),r=$i(e);if(n||r)return n&&r?t.getTime()===e.getTime():!1;if(n=ot(t),r=ot(e),n||r)return t===e;if(n=H(t),r=H(e),n||r)return n&&r?Bc(t,e):!1;if(n=Z(t),r=Z(e),n||r){if(!n||!r)return!1;const s=Object.keys(t).length,i=Object.keys(e).length;if(s!==i)return!1;for(const o in t){const a=t.hasOwnProperty(o),l=e.hasOwnProperty(o);if(a&&!l||!a&&l||!fr(t[o],e[o]))return!1}}return String(t)===String(e)}function Hc(t,e){return t.findIndex(n=>fr(n,e))}const Ea=t=>!!(t&&t.__v_isRef===!0),L=t=>fe(t)?t:t==null?"":H(t)||Z(t)&&(t.toString===_a||!j(t.toString))?Ea(t)?L(t.value):JSON.stringify(t,Ia,2):String(t),Ia=(t,e)=>Ea(e)?Ia(t,e.value):_n(e)?{[`Map(${e.size})`]:[...e.entries()].reduce((n,[r,s],i)=>(n[ys(r,i)+" =>"]=s,n),{})}:Qr(e)?{[`Set(${e.size})`]:[...e.values()].map(n=>ys(n))}:ot(e)?ys(e):Z(e)&&!H(e)&&!ya(e)?String(e):e,ys=(t,e="")=>{var n;return ot(t)?`Symbol(${(n=t.description)!=null?n:e})`:t};/**
* @vue/reactivity v3.5.29
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/let Ae;class $c{constructor(e=!1){this.detached=e,this._active=!0,this._on=0,this.effects=[],this.cleanups=[],this._isPaused=!1,this.__v_skip=!0,this.parent=Ae,!e&&Ae&&(this.index=(Ae.scopes||(Ae.scopes=[])).push(this)-1)}get active(){return this._active}pause(){if(this._active){this._isPaused=!0;let e,n;if(this.scopes)for(e=0,n=this.scopes.length;e<n;e++)this.scopes[e].pause();for(e=0,n=this.effects.length;e<n;e++)this.effects[e].pause()}}resume(){if(this._active&&this._isPaused){this._isPaused=!1;let e,n;if(this.scopes)for(e=0,n=this.scopes.length;e<n;e++)this.scopes[e].resume();for(e=0,n=this.effects.length;e<n;e++)this.effects[e].resume()}}run(e){if(this._active){const n=Ae;try{return Ae=this,e()}finally{Ae=n}}}on(){++this._on===1&&(this.prevScope=Ae,Ae=this)}off(){this._on>0&&--this._on===0&&(Ae=this.prevScope,this.prevScope=void 0)}stop(e){if(this._active){this._active=!1;let n,r;for(n=0,r=this.effects.length;n<r;n++)this.effects[n].stop();for(this.effects.length=0,n=0,r=this.cleanups.length;n<r;n++)this.cleanups[n]();if(this.cleanups.length=0,this.scopes){for(n=0,r=this.scopes.length;n<r;n++)this.scopes[n].stop(!0);this.scopes.length=0}if(!this.detached&&this.parent&&!e){const s=this.parent.scopes.pop();s&&s!==this&&(this.parent.scopes[this.index]=s,s.index=this.index)}this.parent=void 0}}}function jc(){return Ae}let ie;const vs=new WeakSet;class wa{constructor(e){this.fn=e,this.deps=void 0,this.depsTail=void 0,this.flags=5,this.next=void 0,this.cleanup=void 0,this.scheduler=void 0,Ae&&Ae.active&&Ae.effects.push(this)}pause(){this.flags|=64}resume(){this.flags&64&&(this.flags&=-65,vs.has(this)&&(vs.delete(this),this.trigger()))}notify(){this.flags&2&&!(this.flags&32)||this.flags&8||Ta(this)}run(){if(!(this.flags&1))return this.fn();this.flags|=2,Wi(this),Ca(this);const e=ie,n=Fe;ie=this,Fe=!0;try{return this.fn()}finally{Aa(this),ie=e,Fe=n,this.flags&=-3}}stop(){if(this.flags&1){for(let e=this.deps;e;e=e.nextDep)mi(e);this.deps=this.depsTail=void 0,Wi(this),this.onStop&&this.onStop(),this.flags&=-2}}trigger(){this.flags&64?vs.add(this):this.scheduler?this.scheduler():this.runIfDirty()}runIfDirty(){Fs(this)&&this.run()}get dirty(){return Fs(this)}}let Sa=0,Kn,Gn;function Ta(t,e=!1){if(t.flags|=8,e){t.next=Gn,Gn=t;return}t.next=Kn,Kn=t}function pi(){Sa++}function gi(){if(--Sa>0)return;if(Gn){let e=Gn;for(Gn=void 0;e;){const n=e.next;e.next=void 0,e.flags&=-9,e=n}}let t;for(;Kn;){let e=Kn;for(Kn=void 0;e;){const n=e.next;if(e.next=void 0,e.flags&=-9,e.flags&1)try{e.trigger()}catch(r){t||(t=r)}e=n}}if(t)throw t}function Ca(t){for(let e=t.deps;e;e=e.nextDep)e.version=-1,e.prevActiveLink=e.dep.activeLink,e.dep.activeLink=e}function Aa(t){let e,n=t.depsTail,r=n;for(;r;){const s=r.prevDep;r.version===-1?(r===n&&(n=s),mi(r),Wc(r)):e=r,r.dep.activeLink=r.prevActiveLink,r.prevActiveLink=void 0,r=s}t.deps=e,t.depsTail=n}function Fs(t){for(let e=t.deps;e;e=e.nextDep)if(e.dep.version!==e.version||e.dep.computed&&(Ra(e.dep.computed)||e.dep.version!==e.version))return!0;return!!t._dirty}function Ra(t){if(t.flags&4&&!(t.flags&16)||(t.flags&=-17,t.globalVersion===er)||(t.globalVersion=er,!t.isSSR&&t.flags&128&&(!t.deps&&!t._dirty||!Fs(t))))return;t.flags|=2;const e=t.dep,n=ie,r=Fe;ie=t,Fe=!0;try{Ca(t);const s=t.fn(t._value);(e.version===0||Ft(s,t._value))&&(t.flags|=128,t._value=s,e.version++)}catch(s){throw e.version++,s}finally{ie=n,Fe=r,Aa(t),t.flags&=-3}}function mi(t,e=!1){const{dep:n,prevSub:r,nextSub:s}=t;if(r&&(r.nextSub=s,t.prevSub=void 0),s&&(s.prevSub=r,t.nextSub=void 0),n.subs===t&&(n.subs=r,!r&&n.computed)){n.computed.flags&=-5;for(let i=n.computed.deps;i;i=i.nextDep)mi(i,!0)}!e&&!--n.sc&&n.map&&n.map.delete(n.key)}function Wc(t){const{prevDep:e,nextDep:n}=t;e&&(e.nextDep=n,t.prevDep=void 0),n&&(n.prevDep=e,t.nextDep=void 0)}let Fe=!0;const Pa=[];function yt(){Pa.push(Fe),Fe=!1}function vt(){const t=Pa.pop();Fe=t===void 0?!0:t}function Wi(t){const{cleanup:e}=t;if(t.cleanup=void 0,e){const n=ie;ie=void 0;try{e()}finally{ie=n}}}let er=0;class Kc{constructor(e,n){this.sub=e,this.dep=n,this.version=n.version,this.nextDep=this.prevDep=this.nextSub=this.prevSub=this.prevActiveLink=void 0}}class _i{constructor(e){this.computed=e,this.version=0,this.activeLink=void 0,this.subs=void 0,this.map=void 0,this.key=void 0,this.sc=0,this.__v_skip=!0}track(e){if(!ie||!Fe||ie===this.computed)return;let n=this.activeLink;if(n===void 0||n.sub!==ie)n=this.activeLink=new Kc(ie,this),ie.deps?(n.prevDep=ie.depsTail,ie.depsTail.nextDep=n,ie.depsTail=n):ie.deps=ie.depsTail=n,Oa(n);else if(n.version===-1&&(n.version=this.version,n.nextDep)){const r=n.nextDep;r.prevDep=n.prevDep,n.prevDep&&(n.prevDep.nextDep=r),n.prevDep=ie.depsTail,n.nextDep=void 0,ie.depsTail.nextDep=n,ie.depsTail=n,ie.deps===n&&(ie.deps=r)}return n}trigger(e){this.version++,er++,this.notify(e)}notify(e){pi();try{for(let n=this.subs;n;n=n.prevSub)n.sub.notify()&&n.sub.dep.notify()}finally{gi()}}}function Oa(t){if(t.dep.sc++,t.sub.flags&4){const e=t.dep.computed;if(e&&!t.dep.subs){e.flags|=20;for(let r=e.deps;r;r=r.nextDep)Oa(r)}const n=t.dep.subs;n!==t&&(t.prevSub=n,n&&(n.nextSub=t)),t.dep.subs=t}}const Vs=new WeakMap,nn=Symbol(""),Bs=Symbol(""),tr=Symbol("");function me(t,e,n){if(Fe&&ie){let r=Vs.get(t);r||Vs.set(t,r=new Map);let s=r.get(n);s||(r.set(n,s=new _i),s.map=r,s.key=n),s.track()}}function ht(t,e,n,r,s,i){const o=Vs.get(t);if(!o){er++;return}const a=l=>{l&&l.trigger()};if(pi(),e==="clear")o.forEach(a);else{const l=H(t),c=l&&di(n);if(l&&n==="length"){const u=Number(r);o.forEach((f,d)=>{(d==="length"||d===tr||!ot(d)&&d>=u)&&a(f)})}else switch((n!==void 0||o.has(void 0))&&a(o.get(n)),c&&a(o.get(tr)),e){case"add":l?c&&a(o.get("length")):(a(o.get(nn)),_n(t)&&a(o.get(Bs)));break;case"delete":l||(a(o.get(nn)),_n(t)&&a(o.get(Bs)));break;case"set":_n(t)&&a(o.get(nn));break}}gi()}function dn(t){const e=Y(t);return e===t?e:(me(e,"iterate",tr),Me(t)?e:e.map(Be))}function rs(t){return me(t=Y(t),"iterate",tr),t}function kt(t,e){return bt(t)?Cn(rn(t)?Be(e):e):Be(e)}const Gc={__proto__:null,[Symbol.iterator](){return bs(this,Symbol.iterator,t=>kt(this,t))},concat(...t){return dn(this).concat(...t.map(e=>H(e)?dn(e):e))},entries(){return bs(this,"entries",t=>(t[1]=kt(this,t[1]),t))},every(t,e){return ct(this,"every",t,e,void 0,arguments)},filter(t,e){return ct(this,"filter",t,e,n=>n.map(r=>kt(this,r)),arguments)},find(t,e){return ct(this,"find",t,e,n=>kt(this,n),arguments)},findIndex(t,e){return ct(this,"findIndex",t,e,void 0,arguments)},findLast(t,e){return ct(this,"findLast",t,e,n=>kt(this,n),arguments)},findLastIndex(t,e){return ct(this,"findLastIndex",t,e,void 0,arguments)},forEach(t,e){return ct(this,"forEach",t,e,void 0,arguments)},includes(...t){return Es(this,"includes",t)},indexOf(...t){return Es(this,"indexOf",t)},join(t){return dn(this).join(t)},lastIndexOf(...t){return Es(this,"lastIndexOf",t)},map(t,e){return ct(this,"map",t,e,void 0,arguments)},pop(){return Un(this,"pop")},push(...t){return Un(this,"push",t)},reduce(t,...e){return Ki(this,"reduce",t,e)},reduceRight(t,...e){return Ki(this,"reduceRight",t,e)},shift(){return Un(this,"shift")},some(t,e){return ct(this,"some",t,e,void 0,arguments)},splice(...t){return Un(this,"splice",t)},toReversed(){return dn(this).toReversed()},toSorted(t){return dn(this).toSorted(t)},toSpliced(...t){return dn(this).toSpliced(...t)},unshift(...t){return Un(this,"unshift",t)},values(){return bs(this,"values",t=>kt(this,t))}};function bs(t,e,n){const r=rs(t),s=r[e]();return r!==t&&!Me(t)&&(s._next=s.next,s.next=()=>{const i=s._next();return i.done||(i.value=n(i.value)),i}),s}const zc=Array.prototype;function ct(t,e,n,r,s,i){const o=rs(t),a=o!==t&&!Me(t),l=o[e];if(l!==zc[e]){const f=l.apply(t,i);return a?Be(f):f}let c=n;o!==t&&(a?c=function(f,d){return n.call(this,kt(t,f),d,t)}:n.length>2&&(c=function(f,d){return n.call(this,f,d,t)}));const u=l.call(o,c,r);return a&&s?s(u):u}function Ki(t,e,n,r){const s=rs(t);let i=n;return s!==t&&(Me(t)?n.length>3&&(i=function(o,a,l){return n.call(this,o,a,l,t)}):i=function(o,a,l){return n.call(this,o,kt(t,a),l,t)}),s[e](i,...r)}function Es(t,e,n){const r=Y(t);me(r,"iterate",tr);const s=r[e](...n);return(s===-1||s===!1)&&bi(n[0])?(n[0]=Y(n[0]),r[e](...n)):s}function Un(t,e,n=[]){yt(),pi();const r=Y(t)[e].apply(t,n);return gi(),vt(),r}const qc=ci("__proto__,__v_isRef,__isVue"),ka=new Set(Object.getOwnPropertyNames(Symbol).filter(t=>t!=="arguments"&&t!=="caller").map(t=>Symbol[t]).filter(ot));function Jc(t){ot(t)||(t=String(t));const e=Y(this);return me(e,"has",t),e.hasOwnProperty(t)}class Na{constructor(e=!1,n=!1){this._isReadonly=e,this._isShallow=n}get(e,n,r){if(n==="__v_skip")return e.__v_skip;const s=this._isReadonly,i=this._isShallow;if(n==="__v_isReactive")return!s;if(n==="__v_isReadonly")return s;if(n==="__v_isShallow")return i;if(n==="__v_raw")return r===(s?i?iu:La:i?Ma:xa).get(e)||Object.getPrototypeOf(e)===Object.getPrototypeOf(r)?e:void 0;const o=H(e);if(!s){let l;if(o&&(l=Gc[n]))return l;if(n==="hasOwnProperty")return Jc}const a=Reflect.get(e,n,ye(e)?e:r);if((ot(n)?ka.has(n):qc(n))||(s||me(e,"get",n),i))return a;if(ye(a)){const l=o&&di(n)?a:a.value;return s&&Z(l)?$s(l):l}return Z(a)?s?$s(a):Kt(a):a}}class Da extends Na{constructor(e=!1){super(!1,e)}set(e,n,r,s){let i=e[n];const o=H(e)&&di(n);if(!this._isShallow){const c=bt(i);if(!Me(r)&&!bt(r)&&(i=Y(i),r=Y(r)),!o&&ye(i)&&!ye(r))return c||(i.value=r),!0}const a=o?Number(n)<e.length:X(e,n),l=Reflect.set(e,n,r,ye(e)?e:s);return e===Y(s)&&(a?Ft(r,i)&&ht(e,"set",n,r):ht(e,"add",n,r)),l}deleteProperty(e,n){const r=X(e,n);e[n];const s=Reflect.deleteProperty(e,n);return s&&r&&ht(e,"delete",n,void 0),s}has(e,n){const r=Reflect.has(e,n);return(!ot(n)||!ka.has(n))&&me(e,"has",n),r}ownKeys(e){return me(e,"iterate",H(e)?"length":nn),Reflect.ownKeys(e)}}class Yc extends Na{constructor(e=!1){super(!0,e)}set(e,n){return!0}deleteProperty(e,n){return!0}}const Xc=new Da,Qc=new Yc,Zc=new Da(!0);const Hs=t=>t,Er=t=>Reflect.getPrototypeOf(t);function eu(t,e,n){return function(...r){const s=this.__v_raw,i=Y(s),o=_n(i),a=t==="entries"||t===Symbol.iterator&&o,l=t==="keys"&&o,c=s[t](...r),u=n?Hs:e?Cn:Be;return!e&&me(i,"iterate",l?Bs:nn),ge(Object.create(c),{next(){const{value:f,done:d}=c.next();return d?{value:f,done:d}:{value:a?[u(f[0]),u(f[1])]:u(f),done:d}}})}}function Ir(t){return function(...e){return t==="delete"?!1:t==="clear"?void 0:this}}function tu(t,e){const n={get(s){const i=this.__v_raw,o=Y(i),a=Y(s);t||(Ft(s,a)&&me(o,"get",s),me(o,"get",a));const{has:l}=Er(o),c=e?Hs:t?Cn:Be;if(l.call(o,s))return c(i.get(s));if(l.call(o,a))return c(i.get(a));i!==o&&i.get(s)},get size(){const s=this.__v_raw;return!t&&me(Y(s),"iterate",nn),s.size},has(s){const i=this.__v_raw,o=Y(i),a=Y(s);return t||(Ft(s,a)&&me(o,"has",s),me(o,"has",a)),s===a?i.has(s):i.has(s)||i.has(a)},forEach(s,i){const o=this,a=o.__v_raw,l=Y(a),c=e?Hs:t?Cn:Be;return!t&&me(l,"iterate",nn),a.forEach((u,f)=>s.call(i,c(u),c(f),o))}};return ge(n,t?{add:Ir("add"),set:Ir("set"),delete:Ir("delete"),clear:Ir("clear")}:{add(s){!e&&!Me(s)&&!bt(s)&&(s=Y(s));const i=Y(this);return Er(i).has.call(i,s)||(i.add(s),ht(i,"add",s,s)),this},set(s,i){!e&&!Me(i)&&!bt(i)&&(i=Y(i));const o=Y(this),{has:a,get:l}=Er(o);let c=a.call(o,s);c||(s=Y(s),c=a.call(o,s));const u=l.call(o,s);return o.set(s,i),c?Ft(i,u)&&ht(o,"set",s,i):ht(o,"add",s,i),this},delete(s){const i=Y(this),{has:o,get:a}=Er(i);let l=o.call(i,s);l||(s=Y(s),l=o.call(i,s)),a&&a.call(i,s);const c=i.delete(s);return l&&ht(i,"delete",s,void 0),c},clear(){const s=Y(this),i=s.size!==0,o=s.clear();return i&&ht(s,"clear",void 0,void 0),o}}),["keys","values","entries",Symbol.iterator].forEach(s=>{n[s]=eu(s,t,e)}),n}function yi(t,e){const n=tu(t,e);return(r,s,i)=>s==="__v_isReactive"?!t:s==="__v_isReadonly"?t:s==="__v_raw"?r:Reflect.get(X(n,s)&&s in r?n:r,s,i)}const nu={get:yi(!1,!1)},ru={get:yi(!1,!0)},su={get:yi(!0,!1)};const xa=new WeakMap,Ma=new WeakMap,La=new WeakMap,iu=new WeakMap;function ou(t){switch(t){case"Object":case"Array":return 1;case"Map":case"Set":case"WeakMap":case"WeakSet":return 2;default:return 0}}function au(t){return t.__v_skip||!Object.isExtensible(t)?0:ou(kc(t))}function Kt(t){return bt(t)?t:vi(t,!1,Xc,nu,xa)}function Ua(t){return vi(t,!1,Zc,ru,Ma)}function $s(t){return vi(t,!0,Qc,su,La)}function vi(t,e,n,r,s){if(!Z(t)||t.__v_raw&&!(e&&t.__v_isReactive))return t;const i=au(t);if(i===0)return t;const o=s.get(t);if(o)return o;const a=new Proxy(t,i===2?r:n);return s.set(t,a),a}function rn(t){return bt(t)?rn(t.__v_raw):!!(t&&t.__v_isReactive)}function bt(t){return!!(t&&t.__v_isReadonly)}function Me(t){return!!(t&&t.__v_isShallow)}function bi(t){return t?!!t.__v_raw:!1}function Y(t){const e=t&&t.__v_raw;return e?Y(e):t}function lu(t){return!X(t,"__v_skip")&&Object.isExtensible(t)&&va(t,"__v_skip",!0),t}const Be=t=>Z(t)?Kt(t):t,Cn=t=>Z(t)?$s(t):t;function ye(t){return t?t.__v_isRef===!0:!1}function ae(t){return Fa(t,!1)}function cu(t){return Fa(t,!0)}function Fa(t,e){return ye(t)?t:new uu(t,e)}class uu{constructor(e,n){this.dep=new _i,this.__v_isRef=!0,this.__v_isShallow=!1,this._rawValue=n?e:Y(e),this._value=n?e:Be(e),this.__v_isShallow=n}get value(){return this.dep.track(),this._value}set value(e){const n=this._rawValue,r=this.__v_isShallow||Me(e)||bt(e);e=r?e:Y(e),Ft(e,n)&&(this._rawValue=e,this._value=r?e:Be(e),this.dep.trigger())}}function yn(t){return ye(t)?t.value:t}const fu={get:(t,e,n)=>e==="__v_raw"?t:yn(Reflect.get(t,e,n)),set:(t,e,n,r)=>{const s=t[e];return ye(s)&&!ye(n)?(s.value=n,!0):Reflect.set(t,e,n,r)}};function Va(t){return rn(t)?t:new Proxy(t,fu)}class du{constructor(e,n,r){this.fn=e,this.setter=n,this._value=void 0,this.dep=new _i(this),this.__v_isRef=!0,this.deps=void 0,this.depsTail=void 0,this.flags=16,this.globalVersion=er-1,this.next=void 0,this.effect=this,this.__v_isReadonly=!n,this.isSSR=r}notify(){if(this.flags|=16,!(this.flags&8)&&ie!==this)return Ta(this,!0),!0}get value(){const e=this.dep.track();return Ra(this),e&&(e.version=this.dep.version),this._value}set value(e){this.setter&&this.setter(e)}}function hu(t,e,n=!1){let r,s;return j(t)?r=t:(r=t.get,s=t.set),new du(r,s,n)}const wr={},xr=new WeakMap;let Qt;function pu(t,e=!1,n=Qt){if(n){let r=xr.get(n);r||xr.set(n,r=[]),r.push(t)}}function gu(t,e,n=re){const{immediate:r,deep:s,once:i,scheduler:o,augmentJob:a,call:l}=n,c=D=>s?D:Me(D)||s===!1||s===0?pt(D,1):pt(D);let u,f,d,g,v=!1,y=!1;if(ye(t)?(f=()=>t.value,v=Me(t)):rn(t)?(f=()=>c(t),v=!0):H(t)?(y=!0,v=t.some(D=>rn(D)||Me(D)),f=()=>t.map(D=>{if(ye(D))return D.value;if(rn(D))return c(D);if(j(D))return l?l(D,2):D()})):j(t)?e?f=l?()=>l(t,2):t:f=()=>{if(d){yt();try{d()}finally{vt()}}const D=Qt;Qt=u;try{return l?l(t,3,[g]):t(g)}finally{Qt=D}}:f=nt,e&&s){const D=f,te=s===!0?1/0:s;f=()=>pt(D(),te)}const S=jc(),x=()=>{u.stop(),S&&S.active&&fi(S.effects,u)};if(i&&e){const D=e;e=(...te)=>{D(...te),x()}}let P=y?new Array(t.length).fill(wr):wr;const M=D=>{if(!(!(u.flags&1)||!u.dirty&&!D))if(e){const te=u.run();if(s||v||(y?te.some((pe,oe)=>Ft(pe,P[oe])):Ft(te,P))){d&&d();const pe=Qt;Qt=u;try{const oe=[te,P===wr?void 0:y&&P[0]===wr?[]:P,g];P=te,l?l(e,3,oe):e(...oe)}finally{Qt=pe}}}else u.run()};return a&&a(M),u=new wa(f),u.scheduler=o?()=>o(M,!1):M,g=D=>pu(D,!1,u),d=u.onStop=()=>{const D=xr.get(u);if(D){if(l)l(D,4);else for(const te of D)te();xr.delete(u)}},e?r?M(!0):P=u.run():o?o(M.bind(null,!0),!0):u.run(),x.pause=u.pause.bind(u),x.resume=u.resume.bind(u),x.stop=x,x}function pt(t,e=1/0,n){if(e<=0||!Z(t)||t.__v_skip||(n=n||new Map,(n.get(t)||0)>=e))return t;if(n.set(t,e),e--,ye(t))pt(t.value,e,n);else if(H(t))for(let r=0;r<t.length;r++)pt(t[r],e,n);else if(Qr(t)||_n(t))t.forEach(r=>{pt(r,e,n)});else if(ya(t)){for(const r in t)pt(t[r],e,n);for(const r of Object.getOwnPropertySymbols(t))Object.prototype.propertyIsEnumerable.call(t,r)&&pt(t[r],e,n)}return t}/**
* @vue/runtime-core v3.5.29
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/function dr(t,e,n,r){try{return r?t(...r):t()}catch(s){ss(s,e,n)}}function at(t,e,n,r){if(j(t)){const s=dr(t,e,n,r);return s&&ma(s)&&s.catch(i=>{ss(i,e,n)}),s}if(H(t)){const s=[];for(let i=0;i<t.length;i++)s.push(at(t[i],e,n,r));return s}}function ss(t,e,n,r=!0){const s=e?e.vnode:null,{errorHandler:i,throwUnhandledErrorInProduction:o}=e&&e.appContext.config||re;if(e){let a=e.parent;const l=e.proxy,c=`https://vuejs.org/error-reference/#runtime-${n}`;for(;a;){const u=a.ec;if(u){for(let f=0;f<u.length;f++)if(u[f](t,l,c)===!1)return}a=a.parent}if(i){yt(),dr(i,null,10,[t,l,c]),vt();return}}mu(t,n,s,r,o)}function mu(t,e,n,r=!0,s=!1){if(s)throw t;console.error(t)}const Ee=[];let Xe=-1;const vn=[];let Nt=null,hn=0;const Ba=Promise.resolve();let Mr=null;function Ei(t){const e=Mr||Ba;return t?e.then(this?t.bind(this):t):e}function _u(t){let e=Xe+1,n=Ee.length;for(;e<n;){const r=e+n>>>1,s=Ee[r],i=nr(s);i<t||i===t&&s.flags&2?e=r+1:n=r}return e}function Ii(t){if(!(t.flags&1)){const e=nr(t),n=Ee[Ee.length-1];!n||!(t.flags&2)&&e>=nr(n)?Ee.push(t):Ee.splice(_u(e),0,t),t.flags|=1,Ha()}}function Ha(){Mr||(Mr=Ba.then(ja))}function yu(t){H(t)?vn.push(...t):Nt&&t.id===-1?Nt.splice(hn+1,0,t):t.flags&1||(vn.push(t),t.flags|=1),Ha()}function Gi(t,e,n=Xe+1){for(;n<Ee.length;n++){const r=Ee[n];if(r&&r.flags&2){if(t&&r.id!==t.uid)continue;Ee.splice(n,1),n--,r.flags&4&&(r.flags&=-2),r(),r.flags&4||(r.flags&=-2)}}}function $a(t){if(vn.length){const e=[...new Set(vn)].sort((n,r)=>nr(n)-nr(r));if(vn.length=0,Nt){Nt.push(...e);return}for(Nt=e,hn=0;hn<Nt.length;hn++){const n=Nt[hn];n.flags&4&&(n.flags&=-2),n.flags&8||n(),n.flags&=-2}Nt=null,hn=0}}const nr=t=>t.id==null?t.flags&2?-1:1/0:t.id;function ja(t){try{for(Xe=0;Xe<Ee.length;Xe++){const e=Ee[Xe];e&&!(e.flags&8)&&(e.flags&4&&(e.flags&=-2),dr(e,e.i,e.i?15:14),e.flags&4||(e.flags&=-2))}}finally{for(;Xe<Ee.length;Xe++){const e=Ee[Xe];e&&(e.flags&=-2)}Xe=-1,Ee.length=0,$a(),Mr=null,(Ee.length||vn.length)&&ja()}}let ke=null,Wa=null;function Lr(t){const e=ke;return ke=t,Wa=t&&t.type.__scopeId||null,e}function Bn(t,e=ke,n){if(!e||t._n)return t;const r=(...s)=>{r._d&&Vr(-1);const i=Lr(e);let o;try{o=t(...s)}finally{Lr(i),r._d&&Vr(1)}return o};return r._n=!0,r._c=!0,r._d=!0,r}function Ve(t,e){if(ke===null)return t;const n=ls(ke),r=t.dirs||(t.dirs=[]);for(let s=0;s<e.length;s++){let[i,o,a,l=re]=e[s];i&&(j(i)&&(i={mounted:i,updated:i}),i.deep&&pt(o),r.push({dir:i,instance:n,value:o,oldValue:void 0,arg:a,modifiers:l}))}return t}function Yt(t,e,n,r){const s=t.dirs,i=e&&e.dirs;for(let o=0;o<s.length;o++){const a=s[o];i&&(a.oldValue=i[o].value);let l=a.dir[r];l&&(yt(),at(l,n,8,[t.el,a,t,e]),vt())}}function Cr(t,e){if(_e){let n=_e.provides;const r=_e.parent&&_e.parent.provides;r===n&&(n=_e.provides=Object.create(r)),n[t]=e}}function rt(t,e,n=!1){const r=bf();if(r||bn){let s=bn?bn._context.provides:r?r.parent==null||r.ce?r.vnode.appContext&&r.vnode.appContext.provides:r.parent.provides:void 0;if(s&&t in s)return s[t];if(arguments.length>1)return n&&j(e)?e.call(r&&r.proxy):e}}const vu=Symbol.for("v-scx"),bu=()=>rt(vu);function Vt(t,e,n){return Ka(t,e,n)}function Ka(t,e,n=re){const{immediate:r,deep:s,flush:i,once:o}=n,a=ge({},n),l=e&&r||!e&&i!=="post";let c;if(sr){if(i==="sync"){const g=bu();c=g.__watcherHandles||(g.__watcherHandles=[])}else if(!l){const g=()=>{};return g.stop=nt,g.resume=nt,g.pause=nt,g}}const u=_e;a.call=(g,v,y)=>at(g,u,v,y);let f=!1;i==="post"?a.scheduler=g=>{Ce(g,u&&u.suspense)}:i!=="sync"&&(f=!0,a.scheduler=(g,v)=>{v?g():Ii(g)}),a.augmentJob=g=>{e&&(g.flags|=4),f&&(g.flags|=2,u&&(g.id=u.uid,g.i=u))};const d=gu(t,e,a);return sr&&(c?c.push(d):l&&d()),d}function Eu(t,e,n){const r=this.proxy,s=fe(t)?t.includes(".")?Ga(r,t):()=>r[t]:t.bind(r,r);let i;j(e)?i=e:(i=e.handler,n=e);const o=pr(this),a=Ka(s,i.bind(r),n);return o(),a}function Ga(t,e){const n=e.split(".");return()=>{let r=t;for(let s=0;s<n.length&&r;s++)r=r[n[s]];return r}}const Iu=Symbol("_vte"),wu=t=>t.__isTeleport,Su=Symbol("_leaveCb");function wi(t,e){t.shapeFlag&6&&t.component?(t.transition=e,wi(t.component.subTree,e)):t.shapeFlag&128?(t.ssContent.transition=e.clone(t.ssContent),t.ssFallback.transition=e.clone(t.ssFallback)):t.transition=e}function za(t,e){return j(t)?ge({name:t.name},e,{setup:t}):t}function qa(t){t.ids=[t.ids[0]+t.ids[2]+++"-",0,0]}function zi(t,e){let n;return!!((n=Object.getOwnPropertyDescriptor(t,e))&&!n.configurable)}const Ur=new WeakMap;function zn(t,e,n,r,s=!1){if(H(t)){t.forEach((y,S)=>zn(y,e&&(H(e)?e[S]:e),n,r,s));return}if(qn(r)&&!s){r.shapeFlag&512&&r.type.__asyncResolved&&r.component.subTree.component&&zn(t,e,n,r.component.subTree);return}const i=r.shapeFlag&4?ls(r.component):r.el,o=s?null:i,{i:a,r:l}=t,c=e&&e.r,u=a.refs===re?a.refs={}:a.refs,f=a.setupState,d=Y(f),g=f===re?ga:y=>zi(u,y)?!1:X(d,y),v=(y,S)=>!(S&&zi(u,S));if(c!=null&&c!==l){if(qi(e),fe(c))u[c]=null,g(c)&&(f[c]=null);else if(ye(c)){const y=e;v(c,y.k)&&(c.value=null),y.k&&(u[y.k]=null)}}if(j(l))dr(l,a,12,[o,u]);else{const y=fe(l),S=ye(l);if(y||S){const x=()=>{if(t.f){const P=y?g(l)?f[l]:u[l]:v()||!t.k?l.value:u[t.k];if(s)H(P)&&fi(P,i);else if(H(P))P.includes(i)||P.push(i);else if(y)u[l]=[i],g(l)&&(f[l]=u[l]);else{const M=[i];v(l,t.k)&&(l.value=M),t.k&&(u[t.k]=M)}}else y?(u[l]=o,g(l)&&(f[l]=o)):S&&(v(l,t.k)&&(l.value=o),t.k&&(u[t.k]=o))};if(o){const P=()=>{x(),Ur.delete(t)};P.id=-1,Ur.set(t,P),Ce(P,n)}else qi(t),x()}}}function qi(t){const e=Ur.get(t);e&&(e.flags|=8,Ur.delete(t))}ns().requestIdleCallback;ns().cancelIdleCallback;const qn=t=>!!t.type.__asyncLoader,Ja=t=>t.type.__isKeepAlive;function Tu(t,e){Ya(t,"a",e)}function Cu(t,e){Ya(t,"da",e)}function Ya(t,e,n=_e){const r=t.__wdc||(t.__wdc=()=>{let s=n;for(;s;){if(s.isDeactivated)return;s=s.parent}return t()});if(is(e,r,n),n){let s=n.parent;for(;s&&s.parent;)Ja(s.parent.vnode)&&Au(r,e,n,s),s=s.parent}}function Au(t,e,n,r){const s=is(e,t,r,!0);Xa(()=>{fi(r[e],s)},n)}function is(t,e,n=_e,r=!1){if(n){const s=n[t]||(n[t]=[]),i=e.__weh||(e.__weh=(...o)=>{yt();const a=pr(n),l=at(e,n,t,o);return a(),vt(),l});return r?s.unshift(i):s.push(i),i}}const wt=t=>(e,n=_e)=>{(!sr||t==="sp")&&is(t,(...r)=>e(...r),n)},Ru=wt("bm"),hr=wt("m"),Pu=wt("bu"),Ou=wt("u"),ku=wt("bum"),Xa=wt("um"),Nu=wt("sp"),Du=wt("rtg"),xu=wt("rtc");function Mu(t,e=_e){is("ec",t,e)}const Lu="components";function js(t,e){return Fu(Lu,t,!0,e)||t}const Uu=Symbol.for("v-ndc");function Fu(t,e,n=!0,r=!1){const s=ke||_e;if(s){const i=s.type;{const a=Tf(i,!1);if(a&&(a===e||a===Le(e)||a===es(Le(e))))return i}const o=Ji(s[t]||i[t],e)||Ji(s.appContext[t],e);return!o&&r?i:o}}function Ji(t,e){return t&&(t[e]||t[Le(e)]||t[es(Le(e))])}function tt(t,e,n,r){let s;const i=n,o=H(t);if(o||fe(t)){const a=o&&rn(t);let l=!1,c=!1;a&&(l=!Me(t),c=bt(t),t=rs(t)),s=new Array(t.length);for(let u=0,f=t.length;u<f;u++)s[u]=e(l?c?Cn(Be(t[u])):Be(t[u]):t[u],u,void 0,i)}else if(typeof t=="number"){s=new Array(t);for(let a=0;a<t;a++)s[a]=e(a+1,a,void 0,i)}else if(Z(t))if(t[Symbol.iterator])s=Array.from(t,(a,l)=>e(a,l,void 0,i));else{const a=Object.keys(t);s=new Array(a.length);for(let l=0,c=a.length;l<c;l++){const u=a[l];s[l]=e(t[u],u,l,i)}}else s=[];return s}const Ws=t=>t?yl(t)?ls(t):Ws(t.parent):null,Jn=ge(Object.create(null),{$:t=>t,$el:t=>t.vnode.el,$data:t=>t.data,$props:t=>t.props,$attrs:t=>t.attrs,$slots:t=>t.slots,$refs:t=>t.refs,$parent:t=>Ws(t.parent),$root:t=>Ws(t.root),$host:t=>t.ce,$emit:t=>t.emit,$options:t=>Za(t),$forceUpdate:t=>t.f||(t.f=()=>{Ii(t.update)}),$nextTick:t=>t.n||(t.n=Ei.bind(t.proxy)),$watch:t=>Eu.bind(t)}),Is=(t,e)=>t!==re&&!t.__isScriptSetup&&X(t,e),Vu={get({_:t},e){if(e==="__v_skip")return!0;const{ctx:n,setupState:r,data:s,props:i,accessCache:o,type:a,appContext:l}=t;if(e[0]!=="$"){const d=o[e];if(d!==void 0)switch(d){case 1:return r[e];case 2:return s[e];case 4:return n[e];case 3:return i[e]}else{if(Is(r,e))return o[e]=1,r[e];if(s!==re&&X(s,e))return o[e]=2,s[e];if(X(i,e))return o[e]=3,i[e];if(n!==re&&X(n,e))return o[e]=4,n[e];Ks&&(o[e]=0)}}const c=Jn[e];let u,f;if(c)return e==="$attrs"&&me(t.attrs,"get",""),c(t);if((u=a.__cssModules)&&(u=u[e]))return u;if(n!==re&&X(n,e))return o[e]=4,n[e];if(f=l.config.globalProperties,X(f,e))return f[e]},set({_:t},e,n){const{data:r,setupState:s,ctx:i}=t;return Is(s,e)?(s[e]=n,!0):r!==re&&X(r,e)?(r[e]=n,!0):X(t.props,e)||e[0]==="$"&&e.slice(1)in t?!1:(i[e]=n,!0)},has({_:{data:t,setupState:e,accessCache:n,ctx:r,appContext:s,props:i,type:o}},a){let l;return!!(n[a]||t!==re&&a[0]!=="$"&&X(t,a)||Is(e,a)||X(i,a)||X(r,a)||X(Jn,a)||X(s.config.globalProperties,a)||(l=o.__cssModules)&&l[a])},defineProperty(t,e,n){return n.get!=null?t._.accessCache[e]=0:X(n,"value")&&this.set(t,e,n.value,null),Reflect.defineProperty(t,e,n)}};function Yi(t){return H(t)?t.reduce((e,n)=>(e[n]=null,e),{}):t}let Ks=!0;function Bu(t){const e=Za(t),n=t.proxy,r=t.ctx;Ks=!1,e.beforeCreate&&Xi(e.beforeCreate,t,"bc");const{data:s,computed:i,methods:o,watch:a,provide:l,inject:c,created:u,beforeMount:f,mounted:d,beforeUpdate:g,updated:v,activated:y,deactivated:S,beforeDestroy:x,beforeUnmount:P,destroyed:M,unmounted:D,render:te,renderTracked:pe,renderTriggered:oe,errorCaptured:je,serverPrefetch:Tt,expose:We,inheritAttrs:Ct,components:qt,directives:Ke,filters:Mn}=e;if(c&&Hu(c,r,null),o)for(const ee in o){const q=o[ee];j(q)&&(r[ee]=q.bind(n))}if(s){const ee=s.call(n,n);Z(ee)&&(t.data=Kt(ee))}if(Ks=!0,i)for(const ee in i){const q=i[ee],lt=j(q)?q.bind(n,n):j(q.get)?q.get.bind(n,n):nt,At=!j(q)&&j(q.set)?q.set.bind(n):nt,Ge=Re({get:lt,set:At});Object.defineProperty(r,ee,{enumerable:!0,configurable:!0,get:()=>Ge.value,set:we=>Ge.value=we})}if(a)for(const ee in a)Qa(a[ee],r,n,ee);if(l){const ee=j(l)?l.call(n):l;Reflect.ownKeys(ee).forEach(q=>{Cr(q,ee[q])})}u&&Xi(u,t,"c");function he(ee,q){H(q)?q.forEach(lt=>ee(lt.bind(n))):q&&ee(q.bind(n))}if(he(Ru,f),he(hr,d),he(Pu,g),he(Ou,v),he(Tu,y),he(Cu,S),he(Mu,je),he(xu,pe),he(Du,oe),he(ku,P),he(Xa,D),he(Nu,Tt),H(We))if(We.length){const ee=t.exposed||(t.exposed={});We.forEach(q=>{Object.defineProperty(ee,q,{get:()=>n[q],set:lt=>n[q]=lt,enumerable:!0})})}else t.exposed||(t.exposed={});te&&t.render===nt&&(t.render=te),Ct!=null&&(t.inheritAttrs=Ct),qt&&(t.components=qt),Ke&&(t.directives=Ke),Tt&&qa(t)}function Hu(t,e,n=nt){H(t)&&(t=Gs(t));for(const r in t){const s=t[r];let i;Z(s)?"default"in s?i=rt(s.from||r,s.default,!0):i=rt(s.from||r):i=rt(s),ye(i)?Object.defineProperty(e,r,{enumerable:!0,configurable:!0,get:()=>i.value,set:o=>i.value=o}):e[r]=i}}function Xi(t,e,n){at(H(t)?t.map(r=>r.bind(e.proxy)):t.bind(e.proxy),e,n)}function Qa(t,e,n,r){let s=r.includes(".")?Ga(n,r):()=>n[r];if(fe(t)){const i=e[t];j(i)&&Vt(s,i)}else if(j(t))Vt(s,t.bind(n));else if(Z(t))if(H(t))t.forEach(i=>Qa(i,e,n,r));else{const i=j(t.handler)?t.handler.bind(n):e[t.handler];j(i)&&Vt(s,i,t)}}function Za(t){const e=t.type,{mixins:n,extends:r}=e,{mixins:s,optionsCache:i,config:{optionMergeStrategies:o}}=t.appContext,a=i.get(e);let l;return a?l=a:!s.length&&!n&&!r?l=e:(l={},s.length&&s.forEach(c=>Fr(l,c,o,!0)),Fr(l,e,o)),Z(e)&&i.set(e,l),l}function Fr(t,e,n,r=!1){const{mixins:s,extends:i}=e;i&&Fr(t,i,n,!0),s&&s.forEach(o=>Fr(t,o,n,!0));for(const o in e)if(!(r&&o==="expose")){const a=$u[o]||n&&n[o];t[o]=a?a(t[o],e[o]):e[o]}return t}const $u={data:Qi,props:Zi,emits:Zi,methods:Hn,computed:Hn,beforeCreate:ve,created:ve,beforeMount:ve,mounted:ve,beforeUpdate:ve,updated:ve,beforeDestroy:ve,beforeUnmount:ve,destroyed:ve,unmounted:ve,activated:ve,deactivated:ve,errorCaptured:ve,serverPrefetch:ve,components:Hn,directives:Hn,watch:Wu,provide:Qi,inject:ju};function Qi(t,e){return e?t?function(){return ge(j(t)?t.call(this,this):t,j(e)?e.call(this,this):e)}:e:t}function ju(t,e){return Hn(Gs(t),Gs(e))}function Gs(t){if(H(t)){const e={};for(let n=0;n<t.length;n++)e[t[n]]=t[n];return e}return t}function ve(t,e){return t?[...new Set([].concat(t,e))]:e}function Hn(t,e){return t?ge(Object.create(null),t,e):e}function Zi(t,e){return t?H(t)&&H(e)?[...new Set([...t,...e])]:ge(Object.create(null),Yi(t),Yi(e??{})):e}function Wu(t,e){if(!t)return e;if(!e)return t;const n=ge(Object.create(null),t);for(const r in e)n[r]=ve(t[r],e[r]);return n}function el(){return{app:null,config:{isNativeTag:ga,performance:!1,globalProperties:{},optionMergeStrategies:{},errorHandler:void 0,warnHandler:void 0,compilerOptions:{}},mixins:[],components:{},directives:{},provides:Object.create(null),optionsCache:new WeakMap,propsCache:new WeakMap,emitsCache:new WeakMap}}let Ku=0;function Gu(t,e){return function(r,s=null){j(r)||(r=ge({},r)),s!=null&&!Z(s)&&(s=null);const i=el(),o=new WeakSet,a=[];let l=!1;const c=i.app={_uid:Ku++,_component:r,_props:s,_container:null,_context:i,_instance:null,version:Af,get config(){return i.config},set config(u){},use(u,...f){return o.has(u)||(u&&j(u.install)?(o.add(u),u.install(c,...f)):j(u)&&(o.add(u),u(c,...f))),c},mixin(u){return i.mixins.includes(u)||i.mixins.push(u),c},component(u,f){return f?(i.components[u]=f,c):i.components[u]},directive(u,f){return f?(i.directives[u]=f,c):i.directives[u]},mount(u,f,d){if(!l){const g=c._ceVNode||le(r,s);return g.appContext=i,d===!0?d="svg":d===!1&&(d=void 0),t(g,u,d),l=!0,c._container=u,u.__vue_app__=c,ls(g.component)}},onUnmount(u){a.push(u)},unmount(){l&&(at(a,c._instance,16),t(null,c._container),delete c._container.__vue_app__)},provide(u,f){return i.provides[u]=f,c},runWithContext(u){const f=bn;bn=c;try{return u()}finally{bn=f}}};return c}}let bn=null;const zu=(t,e)=>e==="modelValue"||e==="model-value"?t.modelModifiers:t[`${e}Modifiers`]||t[`${Le(e)}Modifiers`]||t[`${an(e)}Modifiers`];function qu(t,e,...n){if(t.isUnmounted)return;const r=t.vnode.props||re;let s=n;const i=e.startsWith("update:"),o=i&&zu(r,e.slice(7));o&&(o.trim&&(s=n.map(u=>fe(u)?u.trim():u)),o.number&&(s=n.map(ts)));let a,l=r[a=_s(e)]||r[a=_s(Le(e))];!l&&i&&(l=r[a=_s(an(e))]),l&&at(l,t,6,s);const c=r[a+"Once"];if(c){if(!t.emitted)t.emitted={};else if(t.emitted[a])return;t.emitted[a]=!0,at(c,t,6,s)}}const Ju=new WeakMap;function tl(t,e,n=!1){const r=n?Ju:e.emitsCache,s=r.get(t);if(s!==void 0)return s;const i=t.emits;let o={},a=!1;if(!j(t)){const l=c=>{const u=tl(c,e,!0);u&&(a=!0,ge(o,u))};!n&&e.mixins.length&&e.mixins.forEach(l),t.extends&&l(t.extends),t.mixins&&t.mixins.forEach(l)}return!i&&!a?(Z(t)&&r.set(t,null),null):(H(i)?i.forEach(l=>o[l]=null):ge(o,i),Z(t)&&r.set(t,o),o)}function os(t,e){return!t||!Xr(e)?!1:(e=e.slice(2).replace(/Once$/,""),X(t,e[0].toLowerCase()+e.slice(1))||X(t,an(e))||X(t,e))}function eo(t){const{type:e,vnode:n,proxy:r,withProxy:s,propsOptions:[i],slots:o,attrs:a,emit:l,render:c,renderCache:u,props:f,data:d,setupState:g,ctx:v,inheritAttrs:y}=t,S=Lr(t);let x,P;try{if(n.shapeFlag&4){const D=s||r,te=D;x=Qe(c.call(te,D,u,f,g,d,v)),P=a}else{const D=e;x=Qe(D.length>1?D(f,{attrs:a,slots:o,emit:l}):D(f,null)),P=e.props?a:Yu(a)}}catch(D){Yn.length=0,ss(D,t,1),x=le(Wt)}let M=x;if(P&&y!==!1){const D=Object.keys(P),{shapeFlag:te}=M;D.length&&te&7&&(i&&D.some(ui)&&(P=Xu(P,i)),M=An(M,P,!1,!0))}return n.dirs&&(M=An(M,null,!1,!0),M.dirs=M.dirs?M.dirs.concat(n.dirs):n.dirs),n.transition&&wi(M,n.transition),x=M,Lr(S),x}const Yu=t=>{let e;for(const n in t)(n==="class"||n==="style"||Xr(n))&&((e||(e={}))[n]=t[n]);return e},Xu=(t,e)=>{const n={};for(const r in t)(!ui(r)||!(r.slice(9)in e))&&(n[r]=t[r]);return n};function Qu(t,e,n){const{props:r,children:s,component:i}=t,{props:o,children:a,patchFlag:l}=e,c=i.emitsOptions;if(e.dirs||e.transition)return!0;if(n&&l>=0){if(l&1024)return!0;if(l&16)return r?to(r,o,c):!!o;if(l&8){const u=e.dynamicProps;for(let f=0;f<u.length;f++){const d=u[f];if(nl(o,r,d)&&!os(c,d))return!0}}}else return(s||a)&&(!a||!a.$stable)?!0:r===o?!1:r?o?to(r,o,c):!0:!!o;return!1}function to(t,e,n){const r=Object.keys(e);if(r.length!==Object.keys(t).length)return!0;for(let s=0;s<r.length;s++){const i=r[s];if(nl(e,t,i)&&!os(n,i))return!0}return!1}function nl(t,e,n){const r=t[n],s=e[n];return n==="style"&&Z(r)&&Z(s)?!fr(r,s):r!==s}function Zu({vnode:t,parent:e},n){for(;e;){const r=e.subTree;if(r.suspense&&r.suspense.activeBranch===t&&(r.el=t.el),r===t)(t=e.vnode).el=n,e=e.parent;else break}}const rl={},sl=()=>Object.create(rl),il=t=>Object.getPrototypeOf(t)===rl;function ef(t,e,n,r=!1){const s={},i=sl();t.propsDefaults=Object.create(null),ol(t,e,s,i);for(const o in t.propsOptions[0])o in s||(s[o]=void 0);n?t.props=r?s:Ua(s):t.type.props?t.props=s:t.props=i,t.attrs=i}function tf(t,e,n,r){const{props:s,attrs:i,vnode:{patchFlag:o}}=t,a=Y(s),[l]=t.propsOptions;let c=!1;if((r||o>0)&&!(o&16)){if(o&8){const u=t.vnode.dynamicProps;for(let f=0;f<u.length;f++){let d=u[f];if(os(t.emitsOptions,d))continue;const g=e[d];if(l)if(X(i,d))g!==i[d]&&(i[d]=g,c=!0);else{const v=Le(d);s[v]=zs(l,a,v,g,t,!1)}else g!==i[d]&&(i[d]=g,c=!0)}}}else{ol(t,e,s,i)&&(c=!0);let u;for(const f in a)(!e||!X(e,f)&&((u=an(f))===f||!X(e,u)))&&(l?n&&(n[f]!==void 0||n[u]!==void 0)&&(s[f]=zs(l,a,f,void 0,t,!0)):delete s[f]);if(i!==a)for(const f in i)(!e||!X(e,f))&&(delete i[f],c=!0)}c&&ht(t.attrs,"set","")}function ol(t,e,n,r){const[s,i]=t.propsOptions;let o=!1,a;if(e)for(let l in e){if(Wn(l))continue;const c=e[l];let u;s&&X(s,u=Le(l))?!i||!i.includes(u)?n[u]=c:(a||(a={}))[u]=c:os(t.emitsOptions,l)||(!(l in r)||c!==r[l])&&(r[l]=c,o=!0)}if(i){const l=Y(n),c=a||re;for(let u=0;u<i.length;u++){const f=i[u];n[f]=zs(s,l,f,c[f],t,!X(c,f))}}return o}function zs(t,e,n,r,s,i){const o=t[n];if(o!=null){const a=X(o,"default");if(a&&r===void 0){const l=o.default;if(o.type!==Function&&!o.skipFactory&&j(l)){const{propsDefaults:c}=s;if(n in c)r=c[n];else{const u=pr(s);r=c[n]=l.call(null,e),u()}}else r=l;s.ce&&s.ce._setProp(n,r)}o[0]&&(i&&!a?r=!1:o[1]&&(r===""||r===an(n))&&(r=!0))}return r}const nf=new WeakMap;function al(t,e,n=!1){const r=n?nf:e.propsCache,s=r.get(t);if(s)return s;const i=t.props,o={},a=[];let l=!1;if(!j(t)){const u=f=>{l=!0;const[d,g]=al(f,e,!0);ge(o,d),g&&a.push(...g)};!n&&e.mixins.length&&e.mixins.forEach(u),t.extends&&u(t.extends),t.mixins&&t.mixins.forEach(u)}if(!i&&!l)return Z(t)&&r.set(t,mn),mn;if(H(i))for(let u=0;u<i.length;u++){const f=Le(i[u]);no(f)&&(o[f]=re)}else if(i)for(const u in i){const f=Le(u);if(no(f)){const d=i[u],g=o[f]=H(d)||j(d)?{type:d}:ge({},d),v=g.type;let y=!1,S=!0;if(H(v))for(let x=0;x<v.length;++x){const P=v[x],M=j(P)&&P.name;if(M==="Boolean"){y=!0;break}else M==="String"&&(S=!1)}else y=j(v)&&v.name==="Boolean";g[0]=y,g[1]=S,(y||X(g,"default"))&&a.push(f)}}const c=[o,a];return Z(t)&&r.set(t,c),c}function no(t){return t[0]!=="$"&&!Wn(t)}const Si=t=>t==="_"||t==="_ctx"||t==="$stable",Ti=t=>H(t)?t.map(Qe):[Qe(t)],rf=(t,e,n)=>{if(e._n)return e;const r=Bn((...s)=>Ti(e(...s)),n);return r._c=!1,r},ll=(t,e,n)=>{const r=t._ctx;for(const s in t){if(Si(s))continue;const i=t[s];if(j(i))e[s]=rf(s,i,r);else if(i!=null){const o=Ti(i);e[s]=()=>o}}},cl=(t,e)=>{const n=Ti(e);t.slots.default=()=>n},ul=(t,e,n)=>{for(const r in e)(n||!Si(r))&&(t[r]=e[r])},sf=(t,e,n)=>{const r=t.slots=sl();if(t.vnode.shapeFlag&32){const s=e._;s?(ul(r,e,n),n&&va(r,"_",s,!0)):ll(e,r)}else e&&cl(t,e)},of=(t,e,n)=>{const{vnode:r,slots:s}=t;let i=!0,o=re;if(r.shapeFlag&32){const a=e._;a?n&&a===1?i=!1:ul(s,e,n):(i=!e.$stable,ll(e,s)),o=e}else e&&(cl(t,e),o={default:1});if(i)for(const a in s)!Si(a)&&o[a]==null&&delete s[a]},Ce=ff;function af(t){return lf(t)}function lf(t,e){const n=ns();n.__VUE__=!0;const{insert:r,remove:s,patchProp:i,createElement:o,createText:a,createComment:l,setText:c,setElementText:u,parentNode:f,nextSibling:d,setScopeId:g=nt,insertStaticContent:v}=t,y=(h,p,_,b=null,w=null,E=null,R=void 0,A=null,C=!!p.dynamicChildren)=>{if(h===p)return;h&&!Fn(h,p)&&(b=I(h),we(h,w,E,!0),h=null),p.patchFlag===-2&&(C=!1,p.dynamicChildren=null);const{type:T,ref:V,shapeFlag:k}=p;switch(T){case as:S(h,p,_,b);break;case Wt:x(h,p,_,b);break;case Ar:h==null&&P(p,_,b,R);break;case ue:qt(h,p,_,b,w,E,R,A,C);break;default:k&1?te(h,p,_,b,w,E,R,A,C):k&6?Ke(h,p,_,b,w,E,R,A,C):(k&64||k&128)&&T.process(h,p,_,b,w,E,R,A,C,U)}V!=null&&w?zn(V,h&&h.ref,E,p||h,!p):V==null&&h&&h.ref!=null&&zn(h.ref,null,E,h,!0)},S=(h,p,_,b)=>{if(h==null)r(p.el=a(p.children),_,b);else{const w=p.el=h.el;p.children!==h.children&&c(w,p.children)}},x=(h,p,_,b)=>{h==null?r(p.el=l(p.children||""),_,b):p.el=h.el},P=(h,p,_,b)=>{[h.el,h.anchor]=v(h.children,p,_,b,h.el,h.anchor)},M=({el:h,anchor:p},_,b)=>{let w;for(;h&&h!==p;)w=d(h),r(h,_,b),h=w;r(p,_,b)},D=({el:h,anchor:p})=>{let _;for(;h&&h!==p;)_=d(h),s(h),h=_;s(p)},te=(h,p,_,b,w,E,R,A,C)=>{if(p.type==="svg"?R="svg":p.type==="math"&&(R="mathml"),h==null)pe(p,_,b,w,E,R,A,C);else{const T=h.el&&h.el._isVueCE?h.el:null;try{T&&T._beginPatch(),Tt(h,p,w,E,R,A,C)}finally{T&&T._endPatch()}}},pe=(h,p,_,b,w,E,R,A)=>{let C,T;const{props:V,shapeFlag:k,transition:F,dirs:$}=h;if(C=h.el=o(h.type,E,V&&V.is,V),k&8?u(C,h.children):k&16&&je(h.children,C,null,b,w,ws(h,E),R,A),$&&Yt(h,null,b,"created"),oe(C,h,h.scopeId,R,b),V){for(const se in V)se!=="value"&&!Wn(se)&&i(C,se,null,V[se],E,b);"value"in V&&i(C,"value",null,V.value,E),(T=V.onVnodeBeforeMount)&&Ye(T,b,h)}$&&Yt(h,null,b,"beforeMount");const K=cf(w,F);K&&F.beforeEnter(C),r(C,p,_),((T=V&&V.onVnodeMounted)||K||$)&&Ce(()=>{T&&Ye(T,b,h),K&&F.enter(C),$&&Yt(h,null,b,"mounted")},w)},oe=(h,p,_,b,w)=>{if(_&&g(h,_),b)for(let E=0;E<b.length;E++)g(h,b[E]);if(w){let E=w.subTree;if(p===E||pl(E.type)&&(E.ssContent===p||E.ssFallback===p)){const R=w.vnode;oe(h,R,R.scopeId,R.slotScopeIds,w.parent)}}},je=(h,p,_,b,w,E,R,A,C=0)=>{for(let T=C;T<h.length;T++){const V=h[T]=A?dt(h[T]):Qe(h[T]);y(null,V,p,_,b,w,E,R,A)}},Tt=(h,p,_,b,w,E,R)=>{const A=p.el=h.el;let{patchFlag:C,dynamicChildren:T,dirs:V}=p;C|=h.patchFlag&16;const k=h.props||re,F=p.props||re;let $;if(_&&Xt(_,!1),($=F.onVnodeBeforeUpdate)&&Ye($,_,p,h),V&&Yt(p,h,_,"beforeUpdate"),_&&Xt(_,!0),(k.innerHTML&&F.innerHTML==null||k.textContent&&F.textContent==null)&&u(A,""),T?We(h.dynamicChildren,T,A,_,b,ws(p,w),E):R||q(h,p,A,null,_,b,ws(p,w),E,!1),C>0){if(C&16)Ct(A,k,F,_,w);else if(C&2&&k.class!==F.class&&i(A,"class",null,F.class,w),C&4&&i(A,"style",k.style,F.style,w),C&8){const K=p.dynamicProps;for(let se=0;se<K.length;se++){const Q=K[se],Se=k[Q],Te=F[Q];(Te!==Se||Q==="value")&&i(A,Q,Se,Te,w,_)}}C&1&&h.children!==p.children&&u(A,p.children)}else!R&&T==null&&Ct(A,k,F,_,w);(($=F.onVnodeUpdated)||V)&&Ce(()=>{$&&Ye($,_,p,h),V&&Yt(p,h,_,"updated")},b)},We=(h,p,_,b,w,E,R)=>{for(let A=0;A<p.length;A++){const C=h[A],T=p[A],V=C.el&&(C.type===ue||!Fn(C,T)||C.shapeFlag&198)?f(C.el):_;y(C,T,V,null,b,w,E,R,!0)}},Ct=(h,p,_,b,w)=>{if(p!==_){if(p!==re)for(const E in p)!Wn(E)&&!(E in _)&&i(h,E,p[E],null,w,b);for(const E in _){if(Wn(E))continue;const R=_[E],A=p[E];R!==A&&E!=="value"&&i(h,E,A,R,w,b)}"value"in _&&i(h,"value",p.value,_.value,w)}},qt=(h,p,_,b,w,E,R,A,C)=>{const T=p.el=h?h.el:a(""),V=p.anchor=h?h.anchor:a("");let{patchFlag:k,dynamicChildren:F,slotScopeIds:$}=p;$&&(A=A?A.concat($):$),h==null?(r(T,_,b),r(V,_,b),je(p.children||[],_,V,w,E,R,A,C)):k>0&&k&64&&F&&h.dynamicChildren&&h.dynamicChildren.length===F.length?(We(h.dynamicChildren,F,_,w,E,R,A),(p.key!=null||w&&p===w.subTree)&&fl(h,p,!0)):q(h,p,_,V,w,E,R,A,C)},Ke=(h,p,_,b,w,E,R,A,C)=>{p.slotScopeIds=A,h==null?p.shapeFlag&512?w.ctx.activate(p,_,b,R,C):Mn(p,_,b,w,E,R,C):cn(h,p,C)},Mn=(h,p,_,b,w,E,R)=>{const A=h.component=vf(h,b,w);if(Ja(h)&&(A.ctx.renderer=U),Ef(A,!1,R),A.asyncDep){if(w&&w.registerDep(A,he,R),!h.el){const C=A.subTree=le(Wt);x(null,C,p,_),h.placeholder=C.el}}else he(A,h,p,_,w,E,R)},cn=(h,p,_)=>{const b=p.component=h.component;if(Qu(h,p,_))if(b.asyncDep&&!b.asyncResolved){ee(b,p,_);return}else b.next=p,b.update();else p.el=h.el,b.vnode=p},he=(h,p,_,b,w,E,R)=>{const A=()=>{if(h.isMounted){let{next:k,bu:F,u:$,parent:K,vnode:se}=h;{const qe=dl(h);if(qe){k&&(k.el=se.el,ee(h,k,R)),qe.asyncDep.then(()=>{Ce(()=>{h.isUnmounted||T()},w)});return}}let Q=k,Se;Xt(h,!1),k?(k.el=se.el,ee(h,k,R)):k=se,F&&Tr(F),(Se=k.props&&k.props.onVnodeBeforeUpdate)&&Ye(Se,K,k,se),Xt(h,!0);const Te=eo(h),ze=h.subTree;h.subTree=Te,y(ze,Te,f(ze.el),I(ze),h,w,E),k.el=Te.el,Q===null&&Zu(h,Te.el),$&&Ce($,w),(Se=k.props&&k.props.onVnodeUpdated)&&Ce(()=>Ye(Se,K,k,se),w)}else{let k;const{el:F,props:$}=p,{bm:K,m:se,parent:Q,root:Se,type:Te}=h,ze=qn(p);Xt(h,!1),K&&Tr(K),!ze&&(k=$&&$.onVnodeBeforeMount)&&Ye(k,Q,p),Xt(h,!0);{Se.ce&&Se.ce._hasShadowRoot()&&Se.ce._injectChildStyle(Te);const qe=h.subTree=eo(h);y(null,qe,_,b,h,w,E),p.el=qe.el}if(se&&Ce(se,w),!ze&&(k=$&&$.onVnodeMounted)){const qe=p;Ce(()=>Ye(k,Q,qe),w)}(p.shapeFlag&256||Q&&qn(Q.vnode)&&Q.vnode.shapeFlag&256)&&h.a&&Ce(h.a,w),h.isMounted=!0,p=_=b=null}};h.scope.on();const C=h.effect=new wa(A);h.scope.off();const T=h.update=C.run.bind(C),V=h.job=C.runIfDirty.bind(C);V.i=h,V.id=h.uid,C.scheduler=()=>Ii(V),Xt(h,!0),T()},ee=(h,p,_)=>{p.component=h;const b=h.vnode.props;h.vnode=p,h.next=null,tf(h,p.props,b,_),of(h,p.children,_),yt(),Gi(h),vt()},q=(h,p,_,b,w,E,R,A,C=!1)=>{const T=h&&h.children,V=h?h.shapeFlag:0,k=p.children,{patchFlag:F,shapeFlag:$}=p;if(F>0){if(F&128){At(T,k,_,b,w,E,R,A,C);return}else if(F&256){lt(T,k,_,b,w,E,R,A,C);return}}$&8?(V&16&&De(T,w,E),k!==T&&u(_,k)):V&16?$&16?At(T,k,_,b,w,E,R,A,C):De(T,w,E,!0):(V&8&&u(_,""),$&16&&je(k,_,b,w,E,R,A,C))},lt=(h,p,_,b,w,E,R,A,C)=>{h=h||mn,p=p||mn;const T=h.length,V=p.length,k=Math.min(T,V);let F;for(F=0;F<k;F++){const $=p[F]=C?dt(p[F]):Qe(p[F]);y(h[F],$,_,null,w,E,R,A,C)}T>V?De(h,w,E,!0,!1,k):je(p,_,b,w,E,R,A,C,k)},At=(h,p,_,b,w,E,R,A,C)=>{let T=0;const V=p.length;let k=h.length-1,F=V-1;for(;T<=k&&T<=F;){const $=h[T],K=p[T]=C?dt(p[T]):Qe(p[T]);if(Fn($,K))y($,K,_,null,w,E,R,A,C);else break;T++}for(;T<=k&&T<=F;){const $=h[k],K=p[F]=C?dt(p[F]):Qe(p[F]);if(Fn($,K))y($,K,_,null,w,E,R,A,C);else break;k--,F--}if(T>k){if(T<=F){const $=F+1,K=$<V?p[$].el:b;for(;T<=F;)y(null,p[T]=C?dt(p[T]):Qe(p[T]),_,K,w,E,R,A,C),T++}}else if(T>F)for(;T<=k;)we(h[T],w,E,!0),T++;else{const $=T,K=T,se=new Map;for(T=K;T<=F;T++){const Pe=p[T]=C?dt(p[T]):Qe(p[T]);Pe.key!=null&&se.set(Pe.key,T)}let Q,Se=0;const Te=F-K+1;let ze=!1,qe=0;const Ln=new Array(Te);for(T=0;T<Te;T++)Ln[T]=0;for(T=$;T<=k;T++){const Pe=h[T];if(Se>=Te){we(Pe,w,E,!0);continue}let Je;if(Pe.key!=null)Je=se.get(Pe.key);else for(Q=K;Q<=F;Q++)if(Ln[Q-K]===0&&Fn(Pe,p[Q])){Je=Q;break}Je===void 0?we(Pe,w,E,!0):(Ln[Je-K]=T+1,Je>=qe?qe=Je:ze=!0,y(Pe,p[Je],_,null,w,E,R,A,C),Se++)}const Vi=ze?uf(Ln):mn;for(Q=Vi.length-1,T=Te-1;T>=0;T--){const Pe=K+T,Je=p[Pe],Bi=p[Pe+1],Hi=Pe+1<V?Bi.el||hl(Bi):b;Ln[T]===0?y(null,Je,_,Hi,w,E,R,A,C):ze&&(Q<0||T!==Vi[Q]?Ge(Je,_,Hi,2):Q--)}}},Ge=(h,p,_,b,w=null)=>{const{el:E,type:R,transition:A,children:C,shapeFlag:T}=h;if(T&6){Ge(h.component.subTree,p,_,b);return}if(T&128){h.suspense.move(p,_,b);return}if(T&64){R.move(h,p,_,U);return}if(R===ue){r(E,p,_);for(let k=0;k<C.length;k++)Ge(C[k],p,_,b);r(h.anchor,p,_);return}if(R===Ar){M(h,p,_);return}if(b!==2&&T&1&&A)if(b===0)A.beforeEnter(E),r(E,p,_),Ce(()=>A.enter(E),w);else{const{leave:k,delayLeave:F,afterLeave:$}=A,K=()=>{h.ctx.isUnmounted?s(E):r(E,p,_)},se=()=>{E._isLeaving&&E[Su](!0),k(E,()=>{K(),$&&$()})};F?F(E,K,se):se()}else r(E,p,_)},we=(h,p,_,b=!1,w=!1)=>{const{type:E,props:R,ref:A,children:C,dynamicChildren:T,shapeFlag:V,patchFlag:k,dirs:F,cacheIndex:$}=h;if(k===-2&&(w=!1),A!=null&&(yt(),zn(A,null,_,h,!0),vt()),$!=null&&(p.renderCache[$]=void 0),V&256){p.ctx.deactivate(h);return}const K=V&1&&F,se=!qn(h);let Q;if(se&&(Q=R&&R.onVnodeBeforeUnmount)&&Ye(Q,p,h),V&6)Jt(h.component,_,b);else{if(V&128){h.suspense.unmount(_,b);return}K&&Yt(h,null,p,"beforeUnmount"),V&64?h.type.remove(h,p,_,U,b):T&&!T.hasOnce&&(E!==ue||k>0&&k&64)?De(T,p,_,!1,!0):(E===ue&&k&384||!w&&V&16)&&De(C,p,_),b&&un(h)}(se&&(Q=R&&R.onVnodeUnmounted)||K)&&Ce(()=>{Q&&Ye(Q,p,h),K&&Yt(h,null,p,"unmounted")},_)},un=h=>{const{type:p,el:_,anchor:b,transition:w}=h;if(p===ue){fn(_,b);return}if(p===Ar){D(h);return}const E=()=>{s(_),w&&!w.persisted&&w.afterLeave&&w.afterLeave()};if(h.shapeFlag&1&&w&&!w.persisted){const{leave:R,delayLeave:A}=w,C=()=>R(_,E);A?A(h.el,E,C):C()}else E()},fn=(h,p)=>{let _;for(;h!==p;)_=d(h),s(h),h=_;s(p)},Jt=(h,p,_)=>{const{bum:b,scope:w,job:E,subTree:R,um:A,m:C,a:T}=h;ro(C),ro(T),b&&Tr(b),w.stop(),E&&(E.flags|=8,we(R,h,p,_)),A&&Ce(A,p),Ce(()=>{h.isUnmounted=!0},p)},De=(h,p,_,b=!1,w=!1,E=0)=>{for(let R=E;R<h.length;R++)we(h[R],p,_,b,w)},I=h=>{if(h.shapeFlag&6)return I(h.component.subTree);if(h.shapeFlag&128)return h.suspense.next();const p=d(h.anchor||h.el),_=p&&p[Iu];return _?d(_):p};let N=!1;const O=(h,p,_)=>{let b;h==null?p._vnode&&(we(p._vnode,null,null,!0),b=p._vnode.component):y(p._vnode||null,h,p,null,null,null,_),p._vnode=h,N||(N=!0,Gi(b),$a(),N=!1)},U={p:y,um:we,m:Ge,r:un,mt:Mn,mc:je,pc:q,pbc:We,n:I,o:t};return{render:O,hydrate:void 0,createApp:Gu(O)}}function ws({type:t,props:e},n){return n==="svg"&&t==="foreignObject"||n==="mathml"&&t==="annotation-xml"&&e&&e.encoding&&e.encoding.includes("html")?void 0:n}function Xt({effect:t,job:e},n){n?(t.flags|=32,e.flags|=4):(t.flags&=-33,e.flags&=-5)}function cf(t,e){return(!t||t&&!t.pendingBranch)&&e&&!e.persisted}function fl(t,e,n=!1){const r=t.children,s=e.children;if(H(r)&&H(s))for(let i=0;i<r.length;i++){const o=r[i];let a=s[i];a.shapeFlag&1&&!a.dynamicChildren&&((a.patchFlag<=0||a.patchFlag===32)&&(a=s[i]=dt(s[i]),a.el=o.el),!n&&a.patchFlag!==-2&&fl(o,a)),a.type===as&&(a.patchFlag===-1&&(a=s[i]=dt(a)),a.el=o.el),a.type===Wt&&!a.el&&(a.el=o.el)}}function uf(t){const e=t.slice(),n=[0];let r,s,i,o,a;const l=t.length;for(r=0;r<l;r++){const c=t[r];if(c!==0){if(s=n[n.length-1],t[s]<c){e[r]=s,n.push(r);continue}for(i=0,o=n.length-1;i<o;)a=i+o>>1,t[n[a]]<c?i=a+1:o=a;c<t[n[i]]&&(i>0&&(e[r]=n[i-1]),n[i]=r)}}for(i=n.length,o=n[i-1];i-- >0;)n[i]=o,o=e[o];return n}function dl(t){const e=t.subTree.component;if(e)return e.asyncDep&&!e.asyncResolved?e:dl(e)}function ro(t){if(t)for(let e=0;e<t.length;e++)t[e].flags|=8}function hl(t){if(t.placeholder)return t.placeholder;const e=t.component;return e?hl(e.subTree):null}const pl=t=>t.__isSuspense;function ff(t,e){e&&e.pendingBranch?H(t)?e.effects.push(...t):e.effects.push(t):yu(t)}const ue=Symbol.for("v-fgt"),as=Symbol.for("v-txt"),Wt=Symbol.for("v-cmt"),Ar=Symbol.for("v-stc"),Yn=[];let Ne=null;function G(t=!1){Yn.push(Ne=t?null:[])}function df(){Yn.pop(),Ne=Yn[Yn.length-1]||null}let rr=1;function Vr(t,e=!1){rr+=t,t<0&&Ne&&e&&(Ne.hasOnce=!0)}function gl(t){return t.dynamicChildren=rr>0?Ne||mn:null,df(),rr>0&&Ne&&Ne.push(t),t}function z(t,e,n,r,s,i){return gl(m(t,e,n,r,s,i,!0))}function ml(t,e,n,r,s){return gl(le(t,e,n,r,s,!0))}function Br(t){return t?t.__v_isVNode===!0:!1}function Fn(t,e){return t.type===e.type&&t.key===e.key}const _l=({key:t})=>t??null,Rr=({ref:t,ref_key:e,ref_for:n})=>(typeof t=="number"&&(t=""+t),t!=null?fe(t)||ye(t)||j(t)?{i:ke,r:t,k:e,f:!!n}:t:null);function m(t,e=null,n=null,r=0,s=null,i=t===ue?0:1,o=!1,a=!1){const l={__v_isVNode:!0,__v_skip:!0,type:t,props:e,key:e&&_l(e),ref:e&&Rr(e),scopeId:Wa,slotScopeIds:null,children:n,component:null,suspense:null,ssContent:null,ssFallback:null,dirs:null,transition:null,el:null,anchor:null,target:null,targetStart:null,targetAnchor:null,staticCount:0,shapeFlag:i,patchFlag:r,dynamicProps:s,dynamicChildren:null,appContext:null,ctx:ke};return a?(Ai(l,n),i&128&&t.normalize(l)):n&&(l.shapeFlag|=fe(n)?8:16),rr>0&&!o&&Ne&&(l.patchFlag>0||i&6)&&l.patchFlag!==32&&Ne.push(l),l}const le=hf;function hf(t,e=null,n=null,r=0,s=null,i=!1){if((!t||t===Uu)&&(t=Wt),Br(t)){const a=An(t,e,!0);return n&&Ai(a,n),rr>0&&!i&&Ne&&(a.shapeFlag&6?Ne[Ne.indexOf(t)]=a:Ne.push(a)),a.patchFlag=-2,a}if(Cf(t)&&(t=t.__vccOpts),e){e=pf(e);let{class:a,style:l}=e;a&&!fe(a)&&(e.class=et(a)),Z(l)&&(bi(l)&&!H(l)&&(l=ge({},l)),e.style=hi(l))}const o=fe(t)?1:pl(t)?128:wu(t)?64:Z(t)?4:j(t)?2:0;return m(t,e,n,r,s,o,i,!0)}function pf(t){return t?bi(t)||il(t)?ge({},t):t:null}function An(t,e,n=!1,r=!1){const{props:s,ref:i,patchFlag:o,children:a,transition:l}=t,c=e?mf(s||{},e):s,u={__v_isVNode:!0,__v_skip:!0,type:t.type,props:c,key:c&&_l(c),ref:e&&e.ref?n&&i?H(i)?i.concat(Rr(e)):[i,Rr(e)]:Rr(e):i,scopeId:t.scopeId,slotScopeIds:t.slotScopeIds,children:a,target:t.target,targetStart:t.targetStart,targetAnchor:t.targetAnchor,staticCount:t.staticCount,shapeFlag:t.shapeFlag,patchFlag:e&&t.type!==ue?o===-1?16:o|16:o,dynamicProps:t.dynamicProps,dynamicChildren:t.dynamicChildren,appContext:t.appContext,dirs:t.dirs,transition:l,component:t.component,suspense:t.suspense,ssContent:t.ssContent&&An(t.ssContent),ssFallback:t.ssFallback&&An(t.ssFallback),placeholder:t.placeholder,el:t.el,anchor:t.anchor,ctx:t.ctx,ce:t.ce};return l&&r&&wi(u,l.clone(u)),u}function gt(t=" ",e=0){return le(as,null,t,e)}function gf(t,e){const n=le(Ar,null,t);return n.staticCount=e,n}function Ci(t="",e=!1){return e?(G(),ml(Wt,null,t)):le(Wt,null,t)}function Qe(t){return t==null||typeof t=="boolean"?le(Wt):H(t)?le(ue,null,t.slice()):Br(t)?dt(t):le(as,null,String(t))}function dt(t){return t.el===null&&t.patchFlag!==-1||t.memo?t:An(t)}function Ai(t,e){let n=0;const{shapeFlag:r}=t;if(e==null)e=null;else if(H(e))n=16;else if(typeof e=="object")if(r&65){const s=e.default;s&&(s._c&&(s._d=!1),Ai(t,s()),s._c&&(s._d=!0));return}else{n=32;const s=e._;!s&&!il(e)?e._ctx=ke:s===3&&ke&&(ke.slots._===1?e._=1:(e._=2,t.patchFlag|=1024))}else j(e)?(e={default:e,_ctx:ke},n=32):(e=String(e),r&64?(n=16,e=[gt(e)]):n=8);t.children=e,t.shapeFlag|=n}function mf(...t){const e={};for(let n=0;n<t.length;n++){const r=t[n];for(const s in r)if(s==="class")e.class!==r.class&&(e.class=et([e.class,r.class]));else if(s==="style")e.style=hi([e.style,r.style]);else if(Xr(s)){const i=e[s],o=r[s];o&&i!==o&&!(H(i)&&i.includes(o))&&(e[s]=i?[].concat(i,o):o)}else s!==""&&(e[s]=r[s])}return e}function Ye(t,e,n,r=null){at(t,e,7,[n,r])}const _f=el();let yf=0;function vf(t,e,n){const r=t.type,s=(e?e.appContext:t.appContext)||_f,i={uid:yf++,vnode:t,type:r,parent:e,appContext:s,root:null,next:null,subTree:null,effect:null,update:null,job:null,scope:new $c(!0),render:null,proxy:null,exposed:null,exposeProxy:null,withProxy:null,provides:e?e.provides:Object.create(s.provides),ids:e?e.ids:["",0,0],accessCache:null,renderCache:[],components:null,directives:null,propsOptions:al(r,s),emitsOptions:tl(r,s),emit:null,emitted:null,propsDefaults:re,inheritAttrs:r.inheritAttrs,ctx:re,data:re,props:re,attrs:re,slots:re,refs:re,setupState:re,setupContext:null,suspense:n,suspenseId:n?n.pendingId:0,asyncDep:null,asyncResolved:!1,isMounted:!1,isUnmounted:!1,isDeactivated:!1,bc:null,c:null,bm:null,m:null,bu:null,u:null,um:null,bum:null,da:null,a:null,rtg:null,rtc:null,ec:null,sp:null};return i.ctx={_:i},i.root=e?e.root:i,i.emit=qu.bind(null,i),t.ce&&t.ce(i),i}let _e=null;const bf=()=>_e||ke;let Hr,qs;{const t=ns(),e=(n,r)=>{let s;return(s=t[n])||(s=t[n]=[]),s.push(r),i=>{s.length>1?s.forEach(o=>o(i)):s[0](i)}};Hr=e("__VUE_INSTANCE_SETTERS__",n=>_e=n),qs=e("__VUE_SSR_SETTERS__",n=>sr=n)}const pr=t=>{const e=_e;return Hr(t),t.scope.on(),()=>{t.scope.off(),Hr(e)}},so=()=>{_e&&_e.scope.off(),Hr(null)};function yl(t){return t.vnode.shapeFlag&4}let sr=!1;function Ef(t,e=!1,n=!1){e&&qs(e);const{props:r,children:s}=t.vnode,i=yl(t);ef(t,r,i,e),sf(t,s,n||e);const o=i?If(t,e):void 0;return e&&qs(!1),o}function If(t,e){const n=t.type;t.accessCache=Object.create(null),t.proxy=new Proxy(t.ctx,Vu);const{setup:r}=n;if(r){yt();const s=t.setupContext=r.length>1?Sf(t):null,i=pr(t),o=dr(r,t,0,[t.props,s]),a=ma(o);if(vt(),i(),(a||t.sp)&&!qn(t)&&qa(t),a){if(o.then(so,so),e)return o.then(l=>{io(t,l)}).catch(l=>{ss(l,t,0)});t.asyncDep=o}else io(t,o)}else vl(t)}function io(t,e,n){j(e)?t.type.__ssrInlineRender?t.ssrRender=e:t.render=e:Z(e)&&(t.setupState=Va(e)),vl(t)}function vl(t,e,n){const r=t.type;t.render||(t.render=r.render||nt);{const s=pr(t);yt();try{Bu(t)}finally{vt(),s()}}}const wf={get(t,e){return me(t,"get",""),t[e]}};function Sf(t){const e=n=>{t.exposed=n||{}};return{attrs:new Proxy(t.attrs,wf),slots:t.slots,emit:t.emit,expose:e}}function ls(t){return t.exposed?t.exposeProxy||(t.exposeProxy=new Proxy(Va(lu(t.exposed)),{get(e,n){if(n in e)return e[n];if(n in Jn)return Jn[n](t)},has(e,n){return n in e||n in Jn}})):t.proxy}function Tf(t,e=!0){return j(t)?t.displayName||t.name:t.name||e&&t.__name}function Cf(t){return j(t)&&"__vccOpts"in t}const Re=(t,e)=>hu(t,e,sr);function bl(t,e,n){try{Vr(-1);const r=arguments.length;return r===2?Z(e)&&!H(e)?Br(e)?le(t,null,[e]):le(t,e):le(t,null,e):(r>3?n=Array.prototype.slice.call(arguments,2):r===3&&Br(n)&&(n=[n]),le(t,e,n))}finally{Vr(1)}}const Af="3.5.29";/**
* @vue/runtime-dom v3.5.29
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/let Js;const oo=typeof window<"u"&&window.trustedTypes;if(oo)try{Js=oo.createPolicy("vue",{createHTML:t=>t})}catch{}const El=Js?t=>Js.createHTML(t):t=>t,Rf="http://www.w3.org/2000/svg",Pf="http://www.w3.org/1998/Math/MathML",ft=typeof document<"u"?document:null,ao=ft&&ft.createElement("template"),Of={insert:(t,e,n)=>{e.insertBefore(t,n||null)},remove:t=>{const e=t.parentNode;e&&e.removeChild(t)},createElement:(t,e,n,r)=>{const s=e==="svg"?ft.createElementNS(Rf,t):e==="mathml"?ft.createElementNS(Pf,t):n?ft.createElement(t,{is:n}):ft.createElement(t);return t==="select"&&r&&r.multiple!=null&&s.setAttribute("multiple",r.multiple),s},createText:t=>ft.createTextNode(t),createComment:t=>ft.createComment(t),setText:(t,e)=>{t.nodeValue=e},setElementText:(t,e)=>{t.textContent=e},parentNode:t=>t.parentNode,nextSibling:t=>t.nextSibling,querySelector:t=>ft.querySelector(t),setScopeId(t,e){t.setAttribute(e,"")},insertStaticContent(t,e,n,r,s,i){const o=n?n.previousSibling:e.lastChild;if(s&&(s===i||s.nextSibling))for(;e.insertBefore(s.cloneNode(!0),n),!(s===i||!(s=s.nextSibling)););else{ao.innerHTML=El(r==="svg"?`<svg>${t}</svg>`:r==="mathml"?`<math>${t}</math>`:t);const a=ao.content;if(r==="svg"||r==="mathml"){const l=a.firstChild;for(;l.firstChild;)a.appendChild(l.firstChild);a.removeChild(l)}e.insertBefore(a,n)}return[o?o.nextSibling:e.firstChild,n?n.previousSibling:e.lastChild]}},kf=Symbol("_vtc");function Nf(t,e,n){const r=t[kf];r&&(e=(e?[e,...r]:[...r]).join(" ")),e==null?t.removeAttribute("class"):n?t.setAttribute("class",e):t.className=e}const lo=Symbol("_vod"),Df=Symbol("_vsh"),xf=Symbol(""),Mf=/(?:^|;)\s*display\s*:/;function Lf(t,e,n){const r=t.style,s=fe(n);let i=!1;if(n&&!s){if(e)if(fe(e))for(const o of e.split(";")){const a=o.slice(0,o.indexOf(":")).trim();n[a]==null&&Pr(r,a,"")}else for(const o in e)n[o]==null&&Pr(r,o,"");for(const o in n)o==="display"&&(i=!0),Pr(r,o,n[o])}else if(s){if(e!==n){const o=r[xf];o&&(n+=";"+o),r.cssText=n,i=Mf.test(n)}}else e&&t.removeAttribute("style");lo in t&&(t[lo]=i?r.display:"",t[Df]&&(r.display="none"))}const co=/\s*!important$/;function Pr(t,e,n){if(H(n))n.forEach(r=>Pr(t,e,r));else if(n==null&&(n=""),e.startsWith("--"))t.setProperty(e,n);else{const r=Uf(t,e);co.test(n)?t.setProperty(an(r),n.replace(co,""),"important"):t[r]=n}}const uo=["Webkit","Moz","ms"],Ss={};function Uf(t,e){const n=Ss[e];if(n)return n;let r=Le(e);if(r!=="filter"&&r in t)return Ss[e]=r;r=es(r);for(let s=0;s<uo.length;s++){const i=uo[s]+r;if(i in t)return Ss[e]=i}return e}const fo="http://www.w3.org/1999/xlink";function ho(t,e,n,r,s,i=Vc(e)){r&&e.startsWith("xlink:")?n==null?t.removeAttributeNS(fo,e.slice(6,e.length)):t.setAttributeNS(fo,e,n):n==null||i&&!ba(n)?t.removeAttribute(e):t.setAttribute(e,i?"":ot(n)?String(n):n)}function po(t,e,n,r,s){if(e==="innerHTML"||e==="textContent"){n!=null&&(t[e]=e==="innerHTML"?El(n):n);return}const i=t.tagName;if(e==="value"&&i!=="PROGRESS"&&!i.includes("-")){const a=i==="OPTION"?t.getAttribute("value")||"":t.value,l=n==null?t.type==="checkbox"?"on":"":String(n);(a!==l||!("_value"in t))&&(t.value=l),n==null&&t.removeAttribute(e),t._value=n;return}let o=!1;if(n===""||n==null){const a=typeof t[e];a==="boolean"?n=ba(n):n==null&&a==="string"?(n="",o=!0):a==="number"&&(n=0,o=!0)}try{t[e]=n}catch{}o&&t.removeAttribute(s||e)}function en(t,e,n,r){t.addEventListener(e,n,r)}function Ff(t,e,n,r){t.removeEventListener(e,n,r)}const go=Symbol("_vei");function Vf(t,e,n,r,s=null){const i=t[go]||(t[go]={}),o=i[e];if(r&&o)o.value=r;else{const[a,l]=Bf(e);if(r){const c=i[e]=jf(r,s);en(t,a,c,l)}else o&&(Ff(t,a,o,l),i[e]=void 0)}}const mo=/(?:Once|Passive|Capture)$/;function Bf(t){let e;if(mo.test(t)){e={};let r;for(;r=t.match(mo);)t=t.slice(0,t.length-r[0].length),e[r[0].toLowerCase()]=!0}return[t[2]===":"?t.slice(3):an(t.slice(2)),e]}let Ts=0;const Hf=Promise.resolve(),$f=()=>Ts||(Hf.then(()=>Ts=0),Ts=Date.now());function jf(t,e){const n=r=>{if(!r._vts)r._vts=Date.now();else if(r._vts<=n.attached)return;at(Wf(r,n.value),e,5,[r])};return n.value=t,n.attached=$f(),n}function Wf(t,e){if(H(e)){const n=t.stopImmediatePropagation;return t.stopImmediatePropagation=()=>{n.call(t),t._stopped=!0},e.map(r=>s=>!s._stopped&&r&&r(s))}else return e}const _o=t=>t.charCodeAt(0)===111&&t.charCodeAt(1)===110&&t.charCodeAt(2)>96&&t.charCodeAt(2)<123,Kf=(t,e,n,r,s,i)=>{const o=s==="svg";e==="class"?Nf(t,r,o):e==="style"?Lf(t,n,r):Xr(e)?ui(e)||Vf(t,e,n,r,i):(e[0]==="."?(e=e.slice(1),!0):e[0]==="^"?(e=e.slice(1),!1):Gf(t,e,r,o))?(po(t,e,r),!t.tagName.includes("-")&&(e==="value"||e==="checked"||e==="selected")&&ho(t,e,r,o,i,e!=="value")):t._isVueCE&&(/[A-Z]/.test(e)||!fe(r))?po(t,Le(e),r,i,e):(e==="true-value"?t._trueValue=r:e==="false-value"&&(t._falseValue=r),ho(t,e,r,o))};function Gf(t,e,n,r){if(r)return!!(e==="innerHTML"||e==="textContent"||e in t&&_o(e)&&j(n));if(e==="spellcheck"||e==="draggable"||e==="translate"||e==="autocorrect"||e==="sandbox"&&t.tagName==="IFRAME"||e==="form"||e==="list"&&t.tagName==="INPUT"||e==="type"&&t.tagName==="TEXTAREA")return!1;if(e==="width"||e==="height"){const s=t.tagName;if(s==="IMG"||s==="VIDEO"||s==="CANVAS"||s==="SOURCE")return!1}return _o(e)&&fe(n)?!1:e in t}const $r=t=>{const e=t.props["onUpdate:modelValue"]||!1;return H(e)?n=>Tr(e,n):e};function zf(t){t.target.composing=!0}function yo(t){const e=t.target;e.composing&&(e.composing=!1,e.dispatchEvent(new Event("input")))}const En=Symbol("_assign");function vo(t,e,n){return e&&(t=t.trim()),n&&(t=ts(t)),t}const Bt={created(t,{modifiers:{lazy:e,trim:n,number:r}},s){t[En]=$r(s);const i=r||s.props&&s.props.type==="number";en(t,e?"change":"input",o=>{o.target.composing||t[En](vo(t.value,n,i))}),(n||i)&&en(t,"change",()=>{t.value=vo(t.value,n,i)}),e||(en(t,"compositionstart",zf),en(t,"compositionend",yo),en(t,"change",yo))},mounted(t,{value:e}){t.value=e??""},beforeUpdate(t,{value:e,oldValue:n,modifiers:{lazy:r,trim:s,number:i}},o){if(t[En]=$r(o),t.composing)return;const a=(i||t.type==="number")&&!/^0\d/.test(t.value)?ts(t.value):t.value,l=e??"";a!==l&&(document.activeElement===t&&t.type!=="range"&&(r&&e===n||s&&t.value.trim()===l)||(t.value=l))}},Cs={deep:!0,created(t,{value:e,modifiers:{number:n}},r){const s=Qr(e);en(t,"change",()=>{const i=Array.prototype.filter.call(t.options,o=>o.selected).map(o=>n?ts(jr(o)):jr(o));t[En](t.multiple?s?new Set(i):i:i[0]),t._assigning=!0,Ei(()=>{t._assigning=!1})}),t[En]=$r(r)},mounted(t,{value:e}){bo(t,e)},beforeUpdate(t,e,n){t[En]=$r(n)},updated(t,{value:e}){t._assigning||bo(t,e)}};function bo(t,e){const n=t.multiple,r=H(e);if(!(n&&!r&&!Qr(e))){for(let s=0,i=t.options.length;s<i;s++){const o=t.options[s],a=jr(o);if(n)if(r){const l=typeof a;l==="string"||l==="number"?o.selected=e.some(c=>String(c)===String(a)):o.selected=Hc(e,a)>-1}else o.selected=e.has(a);else if(fr(jr(o),e)){t.selectedIndex!==s&&(t.selectedIndex=s);return}}!n&&t.selectedIndex!==-1&&(t.selectedIndex=-1)}}function jr(t){return"_value"in t?t._value:t.value}const qf=["ctrl","shift","alt","meta"],Jf={stop:t=>t.stopPropagation(),prevent:t=>t.preventDefault(),self:t=>t.target!==t.currentTarget,ctrl:t=>!t.ctrlKey,shift:t=>!t.shiftKey,alt:t=>!t.altKey,meta:t=>!t.metaKey,left:t=>"button"in t&&t.button!==0,middle:t=>"button"in t&&t.button!==1,right:t=>"button"in t&&t.button!==2,exact:(t,e)=>qf.some(n=>t[`${n}Key`]&&!e.includes(n))},Il=(t,e)=>{if(!t)return t;const n=t._withMods||(t._withMods={}),r=e.join(".");return n[r]||(n[r]=((s,...i)=>{for(let o=0;o<e.length;o++){const a=Jf[e[o]];if(a&&a(s,e))return}return t(s,...i)}))},Yf=ge({patchProp:Kf},Of);let Eo;function Xf(){return Eo||(Eo=af(Yf))}const Qf=((...t)=>{const e=Xf().createApp(...t),{mount:n}=e;return e.mount=r=>{const s=ed(r);if(!s)return;const i=e._component;!j(i)&&!i.render&&!i.template&&(i.template=s.innerHTML),s.nodeType===1&&(s.textContent="");const o=n(s,!1,Zf(s));return s instanceof Element&&(s.removeAttribute("v-cloak"),s.setAttribute("data-v-app","")),o},e});function Zf(t){if(t instanceof SVGElement)return"svg";if(typeof MathMLElement=="function"&&t instanceof MathMLElement)return"mathml"}function ed(t){return fe(t)?document.querySelector(t):t}const td=(t,e)=>{const n=t.__vccOpts||t;for(const[r,s]of e)n[r]=s;return n},nd={};function rd(t,e){const n=js("router-view");return G(),ml(n)}const sd=td(nd,[["render",rd]]);/*!
 * vue-router v4.6.4
 * (c) 2025 Eduardo San Martin Morote
 * @license MIT
 */const pn=typeof document<"u";function wl(t){return typeof t=="object"||"displayName"in t||"props"in t||"__vccOpts"in t}function id(t){return t.__esModule||t[Symbol.toStringTag]==="Module"||t.default&&wl(t.default)}const J=Object.assign;function As(t,e){const n={};for(const r in e){const s=e[r];n[r]=He(s)?s.map(t):t(s)}return n}const Xn=()=>{},He=Array.isArray;function Io(t,e){const n={};for(const r in t)n[r]=r in e?e[r]:t[r];return n}const Sl=/#/g,od=/&/g,ad=/\//g,ld=/=/g,cd=/\?/g,Tl=/\+/g,ud=/%5B/g,fd=/%5D/g,Cl=/%5E/g,dd=/%60/g,Al=/%7B/g,hd=/%7C/g,Rl=/%7D/g,pd=/%20/g;function Ri(t){return t==null?"":encodeURI(""+t).replace(hd,"|").replace(ud,"[").replace(fd,"]")}function gd(t){return Ri(t).replace(Al,"{").replace(Rl,"}").replace(Cl,"^")}function Ys(t){return Ri(t).replace(Tl,"%2B").replace(pd,"+").replace(Sl,"%23").replace(od,"%26").replace(dd,"`").replace(Al,"{").replace(Rl,"}").replace(Cl,"^")}function md(t){return Ys(t).replace(ld,"%3D")}function _d(t){return Ri(t).replace(Sl,"%23").replace(cd,"%3F")}function yd(t){return _d(t).replace(ad,"%2F")}function ir(t){if(t==null)return null;try{return decodeURIComponent(""+t)}catch{}return""+t}const vd=/\/$/,bd=t=>t.replace(vd,"");function Rs(t,e,n="/"){let r,s={},i="",o="";const a=e.indexOf("#");let l=e.indexOf("?");return l=a>=0&&l>a?-1:l,l>=0&&(r=e.slice(0,l),i=e.slice(l,a>0?a:e.length),s=t(i.slice(1))),a>=0&&(r=r||e.slice(0,a),o=e.slice(a,e.length)),r=Sd(r??e,n),{fullPath:r+i+o,path:r,query:s,hash:ir(o)}}function Ed(t,e){const n=e.query?t(e.query):"";return e.path+(n&&"?")+n+(e.hash||"")}function wo(t,e){return!e||!t.toLowerCase().startsWith(e.toLowerCase())?t:t.slice(e.length)||"/"}function Id(t,e,n){const r=e.matched.length-1,s=n.matched.length-1;return r>-1&&r===s&&Rn(e.matched[r],n.matched[s])&&Pl(e.params,n.params)&&t(e.query)===t(n.query)&&e.hash===n.hash}function Rn(t,e){return(t.aliasOf||t)===(e.aliasOf||e)}function Pl(t,e){if(Object.keys(t).length!==Object.keys(e).length)return!1;for(var n in t)if(!wd(t[n],e[n]))return!1;return!0}function wd(t,e){return He(t)?So(t,e):He(e)?So(e,t):(t==null?void 0:t.valueOf())===(e==null?void 0:e.valueOf())}function So(t,e){return He(e)?t.length===e.length&&t.every((n,r)=>n===e[r]):t.length===1&&t[0]===e}function Sd(t,e){if(t.startsWith("/"))return t;if(!t)return e;const n=e.split("/"),r=t.split("/"),s=r[r.length-1];(s===".."||s===".")&&r.push("");let i=n.length-1,o,a;for(o=0;o<r.length;o++)if(a=r[o],a!==".")if(a==="..")i>1&&i--;else break;return n.slice(0,i).join("/")+"/"+r.slice(o).join("/")}const Rt={path:"/",name:void 0,params:{},query:{},hash:"",fullPath:"/",matched:[],meta:{},redirectedFrom:void 0};let Xs=(function(t){return t.pop="pop",t.push="push",t})({}),Ps=(function(t){return t.back="back",t.forward="forward",t.unknown="",t})({});function Td(t){if(!t)if(pn){const e=document.querySelector("base");t=e&&e.getAttribute("href")||"/",t=t.replace(/^\w+:\/\/[^\/]+/,"")}else t="/";return t[0]!=="/"&&t[0]!=="#"&&(t="/"+t),bd(t)}const Cd=/^[^#]+#/;function Ad(t,e){return t.replace(Cd,"#")+e}function Rd(t,e){const n=document.documentElement.getBoundingClientRect(),r=t.getBoundingClientRect();return{behavior:e.behavior,left:r.left-n.left-(e.left||0),top:r.top-n.top-(e.top||0)}}const cs=()=>({left:window.scrollX,top:window.scrollY});function Pd(t){let e;if("el"in t){const n=t.el,r=typeof n=="string"&&n.startsWith("#"),s=typeof n=="string"?r?document.getElementById(n.slice(1)):document.querySelector(n):n;if(!s)return;e=Rd(s,t)}else e=t;"scrollBehavior"in document.documentElement.style?window.scrollTo(e):window.scrollTo(e.left!=null?e.left:window.scrollX,e.top!=null?e.top:window.scrollY)}function To(t,e){return(history.state?history.state.position-e:-1)+t}const Qs=new Map;function Od(t,e){Qs.set(t,e)}function kd(t){const e=Qs.get(t);return Qs.delete(t),e}function Nd(t){return typeof t=="string"||t&&typeof t=="object"}function Ol(t){return typeof t=="string"||typeof t=="symbol"}let ce=(function(t){return t[t.MATCHER_NOT_FOUND=1]="MATCHER_NOT_FOUND",t[t.NAVIGATION_GUARD_REDIRECT=2]="NAVIGATION_GUARD_REDIRECT",t[t.NAVIGATION_ABORTED=4]="NAVIGATION_ABORTED",t[t.NAVIGATION_CANCELLED=8]="NAVIGATION_CANCELLED",t[t.NAVIGATION_DUPLICATED=16]="NAVIGATION_DUPLICATED",t})({});const kl=Symbol("");ce.MATCHER_NOT_FOUND+"",ce.NAVIGATION_GUARD_REDIRECT+"",ce.NAVIGATION_ABORTED+"",ce.NAVIGATION_CANCELLED+"",ce.NAVIGATION_DUPLICATED+"";function Pn(t,e){return J(new Error,{type:t,[kl]:!0},e)}function ut(t,e){return t instanceof Error&&kl in t&&(e==null||!!(t.type&e))}const Dd=["params","query","hash"];function xd(t){if(typeof t=="string")return t;if(t.path!=null)return t.path;const e={};for(const n of Dd)n in t&&(e[n]=t[n]);return JSON.stringify(e,null,2)}function Md(t){const e={};if(t===""||t==="?")return e;const n=(t[0]==="?"?t.slice(1):t).split("&");for(let r=0;r<n.length;++r){const s=n[r].replace(Tl," "),i=s.indexOf("="),o=ir(i<0?s:s.slice(0,i)),a=i<0?null:ir(s.slice(i+1));if(o in e){let l=e[o];He(l)||(l=e[o]=[l]),l.push(a)}else e[o]=a}return e}function Co(t){let e="";for(let n in t){const r=t[n];if(n=md(n),r==null){r!==void 0&&(e+=(e.length?"&":"")+n);continue}(He(r)?r.map(s=>s&&Ys(s)):[r&&Ys(r)]).forEach(s=>{s!==void 0&&(e+=(e.length?"&":"")+n,s!=null&&(e+="="+s))})}return e}function Ld(t){const e={};for(const n in t){const r=t[n];r!==void 0&&(e[n]=He(r)?r.map(s=>s==null?null:""+s):r==null?r:""+r)}return e}const Ud=Symbol(""),Ao=Symbol(""),us=Symbol(""),Nl=Symbol(""),Zs=Symbol("");function Vn(){let t=[];function e(r){return t.push(r),()=>{const s=t.indexOf(r);s>-1&&t.splice(s,1)}}function n(){t=[]}return{add:e,list:()=>t.slice(),reset:n}}function Dt(t,e,n,r,s,i=o=>o()){const o=r&&(r.enterCallbacks[s]=r.enterCallbacks[s]||[]);return()=>new Promise((a,l)=>{const c=d=>{d===!1?l(Pn(ce.NAVIGATION_ABORTED,{from:n,to:e})):d instanceof Error?l(d):Nd(d)?l(Pn(ce.NAVIGATION_GUARD_REDIRECT,{from:e,to:d})):(o&&r.enterCallbacks[s]===o&&typeof d=="function"&&o.push(d),a())},u=i(()=>t.call(r&&r.instances[s],e,n,c));let f=Promise.resolve(u);t.length<3&&(f=f.then(c)),f.catch(d=>l(d))})}function Os(t,e,n,r,s=i=>i()){const i=[];for(const o of t)for(const a in o.components){let l=o.components[a];if(!(e!=="beforeRouteEnter"&&!o.instances[a]))if(wl(l)){const c=(l.__vccOpts||l)[e];c&&i.push(Dt(c,n,r,o,a,s))}else{let c=l();i.push(()=>c.then(u=>{if(!u)throw new Error(`Couldn't resolve component "${a}" at "${o.path}"`);const f=id(u)?u.default:u;o.mods[a]=u,o.components[a]=f;const d=(f.__vccOpts||f)[e];return d&&Dt(d,n,r,o,a,s)()}))}}return i}function Fd(t,e){const n=[],r=[],s=[],i=Math.max(e.matched.length,t.matched.length);for(let o=0;o<i;o++){const a=e.matched[o];a&&(t.matched.find(c=>Rn(c,a))?r.push(a):n.push(a));const l=t.matched[o];l&&(e.matched.find(c=>Rn(c,l))||s.push(l))}return[n,r,s]}/*!
 * vue-router v4.6.4
 * (c) 2025 Eduardo San Martin Morote
 * @license MIT
 */let Vd=()=>location.protocol+"//"+location.host;function Dl(t,e){const{pathname:n,search:r,hash:s}=e,i=t.indexOf("#");if(i>-1){let o=s.includes(t.slice(i))?t.slice(i).length:1,a=s.slice(o);return a[0]!=="/"&&(a="/"+a),wo(a,"")}return wo(n,t)+r+s}function Bd(t,e,n,r){let s=[],i=[],o=null;const a=({state:d})=>{const g=Dl(t,location),v=n.value,y=e.value;let S=0;if(d){if(n.value=g,e.value=d,o&&o===v){o=null;return}S=y?d.position-y.position:0}else r(g);s.forEach(x=>{x(n.value,v,{delta:S,type:Xs.pop,direction:S?S>0?Ps.forward:Ps.back:Ps.unknown})})};function l(){o=n.value}function c(d){s.push(d);const g=()=>{const v=s.indexOf(d);v>-1&&s.splice(v,1)};return i.push(g),g}function u(){if(document.visibilityState==="hidden"){const{history:d}=window;if(!d.state)return;d.replaceState(J({},d.state,{scroll:cs()}),"")}}function f(){for(const d of i)d();i=[],window.removeEventListener("popstate",a),window.removeEventListener("pagehide",u),document.removeEventListener("visibilitychange",u)}return window.addEventListener("popstate",a),window.addEventListener("pagehide",u),document.addEventListener("visibilitychange",u),{pauseListeners:l,listen:c,destroy:f}}function Ro(t,e,n,r=!1,s=!1){return{back:t,current:e,forward:n,replaced:r,position:window.history.length,scroll:s?cs():null}}function Hd(t){const{history:e,location:n}=window,r={value:Dl(t,n)},s={value:e.state};s.value||i(r.value,{back:null,current:r.value,forward:null,position:e.length-1,replaced:!0,scroll:null},!0);function i(l,c,u){const f=t.indexOf("#"),d=f>-1?(n.host&&document.querySelector("base")?t:t.slice(f))+l:Vd()+t+l;try{e[u?"replaceState":"pushState"](c,"",d),s.value=c}catch(g){console.error(g),n[u?"replace":"assign"](d)}}function o(l,c){i(l,J({},e.state,Ro(s.value.back,l,s.value.forward,!0),c,{position:s.value.position}),!0),r.value=l}function a(l,c){const u=J({},s.value,e.state,{forward:l,scroll:cs()});i(u.current,u,!0),i(l,J({},Ro(r.value,l,null),{position:u.position+1},c),!1),r.value=l}return{location:r,state:s,push:a,replace:o}}function $d(t){t=Td(t);const e=Hd(t),n=Bd(t,e.state,e.location,e.replace);function r(i,o=!0){o||n.pauseListeners(),history.go(i)}const s=J({location:"",base:t,go:r,createHref:Ad.bind(null,t)},e,n);return Object.defineProperty(s,"location",{enumerable:!0,get:()=>e.location.value}),Object.defineProperty(s,"state",{enumerable:!0,get:()=>e.state.value}),s}let tn=(function(t){return t[t.Static=0]="Static",t[t.Param=1]="Param",t[t.Group=2]="Group",t})({});var de=(function(t){return t[t.Static=0]="Static",t[t.Param=1]="Param",t[t.ParamRegExp=2]="ParamRegExp",t[t.ParamRegExpEnd=3]="ParamRegExpEnd",t[t.EscapeNext=4]="EscapeNext",t})(de||{});const jd={type:tn.Static,value:""},Wd=/[a-zA-Z0-9_]/;function Kd(t){if(!t)return[[]];if(t==="/")return[[jd]];if(!t.startsWith("/"))throw new Error(`Invalid path "${t}"`);function e(g){throw new Error(`ERR (${n})/"${c}": ${g}`)}let n=de.Static,r=n;const s=[];let i;function o(){i&&s.push(i),i=[]}let a=0,l,c="",u="";function f(){c&&(n===de.Static?i.push({type:tn.Static,value:c}):n===de.Param||n===de.ParamRegExp||n===de.ParamRegExpEnd?(i.length>1&&(l==="*"||l==="+")&&e(`A repeatable param (${c}) must be alone in its segment. eg: '/:ids+.`),i.push({type:tn.Param,value:c,regexp:u,repeatable:l==="*"||l==="+",optional:l==="*"||l==="?"})):e("Invalid state to consume buffer"),c="")}function d(){c+=l}for(;a<t.length;){if(l=t[a++],l==="\\"&&n!==de.ParamRegExp){r=n,n=de.EscapeNext;continue}switch(n){case de.Static:l==="/"?(c&&f(),o()):l===":"?(f(),n=de.Param):d();break;case de.EscapeNext:d(),n=r;break;case de.Param:l==="("?n=de.ParamRegExp:Wd.test(l)?d():(f(),n=de.Static,l!=="*"&&l!=="?"&&l!=="+"&&a--);break;case de.ParamRegExp:l===")"?u[u.length-1]=="\\"?u=u.slice(0,-1)+l:n=de.ParamRegExpEnd:u+=l;break;case de.ParamRegExpEnd:f(),n=de.Static,l!=="*"&&l!=="?"&&l!=="+"&&a--,u="";break;default:e("Unknown state");break}}return n===de.ParamRegExp&&e(`Unfinished custom RegExp for param "${c}"`),f(),o(),s}const Po="[^/]+?",Gd={sensitive:!1,strict:!1,start:!0,end:!0};var be=(function(t){return t[t._multiplier=10]="_multiplier",t[t.Root=90]="Root",t[t.Segment=40]="Segment",t[t.SubSegment=30]="SubSegment",t[t.Static=40]="Static",t[t.Dynamic=20]="Dynamic",t[t.BonusCustomRegExp=10]="BonusCustomRegExp",t[t.BonusWildcard=-50]="BonusWildcard",t[t.BonusRepeatable=-20]="BonusRepeatable",t[t.BonusOptional=-8]="BonusOptional",t[t.BonusStrict=.7000000000000001]="BonusStrict",t[t.BonusCaseSensitive=.25]="BonusCaseSensitive",t})(be||{});const zd=/[.+*?^${}()[\]/\\]/g;function qd(t,e){const n=J({},Gd,e),r=[];let s=n.start?"^":"";const i=[];for(const c of t){const u=c.length?[]:[be.Root];n.strict&&!c.length&&(s+="/");for(let f=0;f<c.length;f++){const d=c[f];let g=be.Segment+(n.sensitive?be.BonusCaseSensitive:0);if(d.type===tn.Static)f||(s+="/"),s+=d.value.replace(zd,"\\$&"),g+=be.Static;else if(d.type===tn.Param){const{value:v,repeatable:y,optional:S,regexp:x}=d;i.push({name:v,repeatable:y,optional:S});const P=x||Po;if(P!==Po){g+=be.BonusCustomRegExp;try{`${P}`}catch(D){throw new Error(`Invalid custom RegExp for param "${v}" (${P}): `+D.message)}}let M=y?`((?:${P})(?:/(?:${P}))*)`:`(${P})`;f||(M=S&&c.length<2?`(?:/${M})`:"/"+M),S&&(M+="?"),s+=M,g+=be.Dynamic,S&&(g+=be.BonusOptional),y&&(g+=be.BonusRepeatable),P===".*"&&(g+=be.BonusWildcard)}u.push(g)}r.push(u)}if(n.strict&&n.end){const c=r.length-1;r[c][r[c].length-1]+=be.BonusStrict}n.strict||(s+="/?"),n.end?s+="$":n.strict&&!s.endsWith("/")&&(s+="(?:/|$)");const o=new RegExp(s,n.sensitive?"":"i");function a(c){const u=c.match(o),f={};if(!u)return null;for(let d=1;d<u.length;d++){const g=u[d]||"",v=i[d-1];f[v.name]=g&&v.repeatable?g.split("/"):g}return f}function l(c){let u="",f=!1;for(const d of t){(!f||!u.endsWith("/"))&&(u+="/"),f=!1;for(const g of d)if(g.type===tn.Static)u+=g.value;else if(g.type===tn.Param){const{value:v,repeatable:y,optional:S}=g,x=v in c?c[v]:"";if(He(x)&&!y)throw new Error(`Provided param "${v}" is an array but it is not repeatable (* or + modifiers)`);const P=He(x)?x.join("/"):x;if(!P)if(S)d.length<2&&(u.endsWith("/")?u=u.slice(0,-1):f=!0);else throw new Error(`Missing required param "${v}"`);u+=P}}return u||"/"}return{re:o,score:r,keys:i,parse:a,stringify:l}}function Jd(t,e){let n=0;for(;n<t.length&&n<e.length;){const r=e[n]-t[n];if(r)return r;n++}return t.length<e.length?t.length===1&&t[0]===be.Static+be.Segment?-1:1:t.length>e.length?e.length===1&&e[0]===be.Static+be.Segment?1:-1:0}function xl(t,e){let n=0;const r=t.score,s=e.score;for(;n<r.length&&n<s.length;){const i=Jd(r[n],s[n]);if(i)return i;n++}if(Math.abs(s.length-r.length)===1){if(Oo(r))return 1;if(Oo(s))return-1}return s.length-r.length}function Oo(t){const e=t[t.length-1];return t.length>0&&e[e.length-1]<0}const Yd={strict:!1,end:!0,sensitive:!1};function Xd(t,e,n){const r=qd(Kd(t.path),n),s=J(r,{record:t,parent:e,children:[],alias:[]});return e&&!s.record.aliasOf==!e.record.aliasOf&&e.children.push(s),s}function Qd(t,e){const n=[],r=new Map;e=Io(Yd,e);function s(f){return r.get(f)}function i(f,d,g){const v=!g,y=No(f);y.aliasOf=g&&g.record;const S=Io(e,f),x=[y];if("alias"in f){const D=typeof f.alias=="string"?[f.alias]:f.alias;for(const te of D)x.push(No(J({},y,{components:g?g.record.components:y.components,path:te,aliasOf:g?g.record:y})))}let P,M;for(const D of x){const{path:te}=D;if(d&&te[0]!=="/"){const pe=d.record.path,oe=pe[pe.length-1]==="/"?"":"/";D.path=d.record.path+(te&&oe+te)}if(P=Xd(D,d,S),g?g.alias.push(P):(M=M||P,M!==P&&M.alias.push(P),v&&f.name&&!Do(P)&&o(f.name)),Ml(P)&&l(P),y.children){const pe=y.children;for(let oe=0;oe<pe.length;oe++)i(pe[oe],P,g&&g.children[oe])}g=g||P}return M?()=>{o(M)}:Xn}function o(f){if(Ol(f)){const d=r.get(f);d&&(r.delete(f),n.splice(n.indexOf(d),1),d.children.forEach(o),d.alias.forEach(o))}else{const d=n.indexOf(f);d>-1&&(n.splice(d,1),f.record.name&&r.delete(f.record.name),f.children.forEach(o),f.alias.forEach(o))}}function a(){return n}function l(f){const d=th(f,n);n.splice(d,0,f),f.record.name&&!Do(f)&&r.set(f.record.name,f)}function c(f,d){let g,v={},y,S;if("name"in f&&f.name){if(g=r.get(f.name),!g)throw Pn(ce.MATCHER_NOT_FOUND,{location:f});S=g.record.name,v=J(ko(d.params,g.keys.filter(M=>!M.optional).concat(g.parent?g.parent.keys.filter(M=>M.optional):[]).map(M=>M.name)),f.params&&ko(f.params,g.keys.map(M=>M.name))),y=g.stringify(v)}else if(f.path!=null)y=f.path,g=n.find(M=>M.re.test(y)),g&&(v=g.parse(y),S=g.record.name);else{if(g=d.name?r.get(d.name):n.find(M=>M.re.test(d.path)),!g)throw Pn(ce.MATCHER_NOT_FOUND,{location:f,currentLocation:d});S=g.record.name,v=J({},d.params,f.params),y=g.stringify(v)}const x=[];let P=g;for(;P;)x.unshift(P.record),P=P.parent;return{name:S,path:y,params:v,matched:x,meta:eh(x)}}t.forEach(f=>i(f));function u(){n.length=0,r.clear()}return{addRoute:i,resolve:c,removeRoute:o,clearRoutes:u,getRoutes:a,getRecordMatcher:s}}function ko(t,e){const n={};for(const r of e)r in t&&(n[r]=t[r]);return n}function No(t){const e={path:t.path,redirect:t.redirect,name:t.name,meta:t.meta||{},aliasOf:t.aliasOf,beforeEnter:t.beforeEnter,props:Zd(t),children:t.children||[],instances:{},leaveGuards:new Set,updateGuards:new Set,enterCallbacks:{},components:"components"in t?t.components||null:t.component&&{default:t.component}};return Object.defineProperty(e,"mods",{value:{}}),e}function Zd(t){const e={},n=t.props||!1;if("component"in t)e.default=n;else for(const r in t.components)e[r]=typeof n=="object"?n[r]:n;return e}function Do(t){for(;t;){if(t.record.aliasOf)return!0;t=t.parent}return!1}function eh(t){return t.reduce((e,n)=>J(e,n.meta),{})}function th(t,e){let n=0,r=e.length;for(;n!==r;){const i=n+r>>1;xl(t,e[i])<0?r=i:n=i+1}const s=nh(t);return s&&(r=e.lastIndexOf(s,r-1)),r}function nh(t){let e=t;for(;e=e.parent;)if(Ml(e)&&xl(t,e)===0)return e}function Ml({record:t}){return!!(t.name||t.components&&Object.keys(t.components).length||t.redirect)}function xo(t){const e=rt(us),n=rt(Nl),r=Re(()=>{const l=yn(t.to);return e.resolve(l)}),s=Re(()=>{const{matched:l}=r.value,{length:c}=l,u=l[c-1],f=n.matched;if(!u||!f.length)return-1;const d=f.findIndex(Rn.bind(null,u));if(d>-1)return d;const g=Mo(l[c-2]);return c>1&&Mo(u)===g&&f[f.length-1].path!==g?f.findIndex(Rn.bind(null,l[c-2])):d}),i=Re(()=>s.value>-1&&ah(n.params,r.value.params)),o=Re(()=>s.value>-1&&s.value===n.matched.length-1&&Pl(n.params,r.value.params));function a(l={}){if(oh(l)){const c=e[yn(t.replace)?"replace":"push"](yn(t.to)).catch(Xn);return t.viewTransition&&typeof document<"u"&&"startViewTransition"in document&&document.startViewTransition(()=>c),c}return Promise.resolve()}return{route:r,href:Re(()=>r.value.href),isActive:i,isExactActive:o,navigate:a}}function rh(t){return t.length===1?t[0]:t}const sh=za({name:"RouterLink",compatConfig:{MODE:3},props:{to:{type:[String,Object],required:!0},replace:Boolean,activeClass:String,exactActiveClass:String,custom:Boolean,ariaCurrentValue:{type:String,default:"page"},viewTransition:Boolean},useLink:xo,setup(t,{slots:e}){const n=Kt(xo(t)),{options:r}=rt(us),s=Re(()=>({[Lo(t.activeClass,r.linkActiveClass,"router-link-active")]:n.isActive,[Lo(t.exactActiveClass,r.linkExactActiveClass,"router-link-exact-active")]:n.isExactActive}));return()=>{const i=e.default&&rh(e.default(n));return t.custom?i:bl("a",{"aria-current":n.isExactActive?t.ariaCurrentValue:null,href:n.href,onClick:n.navigate,class:s.value},i)}}}),ih=sh;function oh(t){if(!(t.metaKey||t.altKey||t.ctrlKey||t.shiftKey)&&!t.defaultPrevented&&!(t.button!==void 0&&t.button!==0)){if(t.currentTarget&&t.currentTarget.getAttribute){const e=t.currentTarget.getAttribute("target");if(/\b_blank\b/i.test(e))return}return t.preventDefault&&t.preventDefault(),!0}}function ah(t,e){for(const n in e){const r=e[n],s=t[n];if(typeof r=="string"){if(r!==s)return!1}else if(!He(s)||s.length!==r.length||r.some((i,o)=>i.valueOf()!==s[o].valueOf()))return!1}return!0}function Mo(t){return t?t.aliasOf?t.aliasOf.path:t.path:""}const Lo=(t,e,n)=>t??e??n,lh=za({name:"RouterView",inheritAttrs:!1,props:{name:{type:String,default:"default"},route:Object},compatConfig:{MODE:3},setup(t,{attrs:e,slots:n}){const r=rt(Zs),s=Re(()=>t.route||r.value),i=rt(Ao,0),o=Re(()=>{let c=yn(i);const{matched:u}=s.value;let f;for(;(f=u[c])&&!f.components;)c++;return c}),a=Re(()=>s.value.matched[o.value]);Cr(Ao,Re(()=>o.value+1)),Cr(Ud,a),Cr(Zs,s);const l=ae();return Vt(()=>[l.value,a.value,t.name],([c,u,f],[d,g,v])=>{u&&(u.instances[f]=c,g&&g!==u&&c&&c===d&&(u.leaveGuards.size||(u.leaveGuards=g.leaveGuards),u.updateGuards.size||(u.updateGuards=g.updateGuards))),c&&u&&(!g||!Rn(u,g)||!d)&&(u.enterCallbacks[f]||[]).forEach(y=>y(c))},{flush:"post"}),()=>{const c=s.value,u=t.name,f=a.value,d=f&&f.components[u];if(!d)return Uo(n.default,{Component:d,route:c});const g=f.props[u],v=g?g===!0?c.params:typeof g=="function"?g(c):g:null,S=bl(d,J({},v,e,{onVnodeUnmounted:x=>{x.component.isUnmounted&&(f.instances[u]=null)},ref:l}));return Uo(n.default,{Component:S,route:c})||S}}});function Uo(t,e){if(!t)return null;const n=t(e);return n.length===1?n[0]:n}const ch=lh;function uh(t){const e=Qd(t.routes,t),n=t.parseQuery||Md,r=t.stringifyQuery||Co,s=t.history,i=Vn(),o=Vn(),a=Vn(),l=cu(Rt);let c=Rt;pn&&t.scrollBehavior&&"scrollRestoration"in history&&(history.scrollRestoration="manual");const u=As.bind(null,I=>""+I),f=As.bind(null,yd),d=As.bind(null,ir);function g(I,N){let O,U;return Ol(I)?(O=e.getRecordMatcher(I),U=N):U=I,e.addRoute(U,O)}function v(I){const N=e.getRecordMatcher(I);N&&e.removeRoute(N)}function y(){return e.getRoutes().map(I=>I.record)}function S(I){return!!e.getRecordMatcher(I)}function x(I,N){if(N=J({},N||l.value),typeof I=="string"){const _=Rs(n,I,N.path),b=e.resolve({path:_.path},N),w=s.createHref(_.fullPath);return J(_,b,{params:d(b.params),hash:ir(_.hash),redirectedFrom:void 0,href:w})}let O;if(I.path!=null)O=J({},I,{path:Rs(n,I.path,N.path).path});else{const _=J({},I.params);for(const b in _)_[b]==null&&delete _[b];O=J({},I,{params:f(_)}),N.params=f(N.params)}const U=e.resolve(O,N),W=I.hash||"";U.params=u(d(U.params));const h=Ed(r,J({},I,{hash:gd(W),path:U.path})),p=s.createHref(h);return J({fullPath:h,hash:W,query:r===Co?Ld(I.query):I.query||{}},U,{redirectedFrom:void 0,href:p})}function P(I){return typeof I=="string"?Rs(n,I,l.value.path):J({},I)}function M(I,N){if(c!==I)return Pn(ce.NAVIGATION_CANCELLED,{from:N,to:I})}function D(I){return oe(I)}function te(I){return D(J(P(I),{replace:!0}))}function pe(I,N){const O=I.matched[I.matched.length-1];if(O&&O.redirect){const{redirect:U}=O;let W=typeof U=="function"?U(I,N):U;return typeof W=="string"&&(W=W.includes("?")||W.includes("#")?W=P(W):{path:W},W.params={}),J({query:I.query,hash:I.hash,params:W.path!=null?{}:I.params},W)}}function oe(I,N){const O=c=x(I),U=l.value,W=I.state,h=I.force,p=I.replace===!0,_=pe(O,U);if(_)return oe(J(P(_),{state:typeof _=="object"?J({},W,_.state):W,force:h,replace:p}),N||O);const b=O;b.redirectedFrom=N;let w;return!h&&Id(r,U,O)&&(w=Pn(ce.NAVIGATION_DUPLICATED,{to:b,from:U}),Ge(U,U,!0,!1)),(w?Promise.resolve(w):We(b,U)).catch(E=>ut(E)?ut(E,ce.NAVIGATION_GUARD_REDIRECT)?E:At(E):q(E,b,U)).then(E=>{if(E){if(ut(E,ce.NAVIGATION_GUARD_REDIRECT))return oe(J({replace:p},P(E.to),{state:typeof E.to=="object"?J({},W,E.to.state):W,force:h}),N||b)}else E=qt(b,U,!0,p,W);return Ct(b,U,E),E})}function je(I,N){const O=M(I,N);return O?Promise.reject(O):Promise.resolve()}function Tt(I){const N=fn.values().next().value;return N&&typeof N.runWithContext=="function"?N.runWithContext(I):I()}function We(I,N){let O;const[U,W,h]=Fd(I,N);O=Os(U.reverse(),"beforeRouteLeave",I,N);for(const _ of U)_.leaveGuards.forEach(b=>{O.push(Dt(b,I,N))});const p=je.bind(null,I,N);return O.push(p),De(O).then(()=>{O=[];for(const _ of i.list())O.push(Dt(_,I,N));return O.push(p),De(O)}).then(()=>{O=Os(W,"beforeRouteUpdate",I,N);for(const _ of W)_.updateGuards.forEach(b=>{O.push(Dt(b,I,N))});return O.push(p),De(O)}).then(()=>{O=[];for(const _ of h)if(_.beforeEnter)if(He(_.beforeEnter))for(const b of _.beforeEnter)O.push(Dt(b,I,N));else O.push(Dt(_.beforeEnter,I,N));return O.push(p),De(O)}).then(()=>(I.matched.forEach(_=>_.enterCallbacks={}),O=Os(h,"beforeRouteEnter",I,N,Tt),O.push(p),De(O))).then(()=>{O=[];for(const _ of o.list())O.push(Dt(_,I,N));return O.push(p),De(O)}).catch(_=>ut(_,ce.NAVIGATION_CANCELLED)?_:Promise.reject(_))}function Ct(I,N,O){a.list().forEach(U=>Tt(()=>U(I,N,O)))}function qt(I,N,O,U,W){const h=M(I,N);if(h)return h;const p=N===Rt,_=pn?history.state:{};O&&(U||p?s.replace(I.fullPath,J({scroll:p&&_&&_.scroll},W)):s.push(I.fullPath,W)),l.value=I,Ge(I,N,O,p),At()}let Ke;function Mn(){Ke||(Ke=s.listen((I,N,O)=>{if(!Jt.listening)return;const U=x(I),W=pe(U,Jt.currentRoute.value);if(W){oe(J(W,{replace:!0,force:!0}),U).catch(Xn);return}c=U;const h=l.value;pn&&Od(To(h.fullPath,O.delta),cs()),We(U,h).catch(p=>ut(p,ce.NAVIGATION_ABORTED|ce.NAVIGATION_CANCELLED)?p:ut(p,ce.NAVIGATION_GUARD_REDIRECT)?(oe(J(P(p.to),{force:!0}),U).then(_=>{ut(_,ce.NAVIGATION_ABORTED|ce.NAVIGATION_DUPLICATED)&&!O.delta&&O.type===Xs.pop&&s.go(-1,!1)}).catch(Xn),Promise.reject()):(O.delta&&s.go(-O.delta,!1),q(p,U,h))).then(p=>{p=p||qt(U,h,!1),p&&(O.delta&&!ut(p,ce.NAVIGATION_CANCELLED)?s.go(-O.delta,!1):O.type===Xs.pop&&ut(p,ce.NAVIGATION_ABORTED|ce.NAVIGATION_DUPLICATED)&&s.go(-1,!1)),Ct(U,h,p)}).catch(Xn)}))}let cn=Vn(),he=Vn(),ee;function q(I,N,O){At(I);const U=he.list();return U.length?U.forEach(W=>W(I,N,O)):console.error(I),Promise.reject(I)}function lt(){return ee&&l.value!==Rt?Promise.resolve():new Promise((I,N)=>{cn.add([I,N])})}function At(I){return ee||(ee=!I,Mn(),cn.list().forEach(([N,O])=>I?O(I):N()),cn.reset()),I}function Ge(I,N,O,U){const{scrollBehavior:W}=t;if(!pn||!W)return Promise.resolve();const h=!O&&kd(To(I.fullPath,0))||(U||!O)&&history.state&&history.state.scroll||null;return Ei().then(()=>W(I,N,h)).then(p=>p&&Pd(p)).catch(p=>q(p,I,N))}const we=I=>s.go(I);let un;const fn=new Set,Jt={currentRoute:l,listening:!0,addRoute:g,removeRoute:v,clearRoutes:e.clearRoutes,hasRoute:S,getRoutes:y,resolve:x,options:t,push:D,replace:te,go:we,back:()=>we(-1),forward:()=>we(1),beforeEach:i.add,beforeResolve:o.add,afterEach:a.add,onError:he.add,isReady:lt,install(I){I.component("RouterLink",ih),I.component("RouterView",ch),I.config.globalProperties.$router=Jt,Object.defineProperty(I.config.globalProperties,"$route",{enumerable:!0,get:()=>yn(l)}),pn&&!un&&l.value===Rt&&(un=!0,D(s.location).catch(U=>{}));const N={};for(const U in Rt)Object.defineProperty(N,U,{get:()=>l.value[U],enumerable:!0});I.provide(us,Jt),I.provide(Nl,Ua(N)),I.provide(Zs,l);const O=I.unmount;fn.add(I),I.unmount=function(){fn.delete(I),fn.size<1&&(c=Rt,Ke&&Ke(),Ke=null,l.value=Rt,un=!1,ee=!1),O()}}};function De(I){return I.reduce((N,O)=>N.then(()=>Tt(O)),Promise.resolve())}return Jt}function Ll(){return rt(us)}const fh=()=>{};var Fo={};/**
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
 */const Ul=function(t){const e=[];let n=0;for(let r=0;r<t.length;r++){let s=t.charCodeAt(r);s<128?e[n++]=s:s<2048?(e[n++]=s>>6|192,e[n++]=s&63|128):(s&64512)===55296&&r+1<t.length&&(t.charCodeAt(r+1)&64512)===56320?(s=65536+((s&1023)<<10)+(t.charCodeAt(++r)&1023),e[n++]=s>>18|240,e[n++]=s>>12&63|128,e[n++]=s>>6&63|128,e[n++]=s&63|128):(e[n++]=s>>12|224,e[n++]=s>>6&63|128,e[n++]=s&63|128)}return e},dh=function(t){const e=[];let n=0,r=0;for(;n<t.length;){const s=t[n++];if(s<128)e[r++]=String.fromCharCode(s);else if(s>191&&s<224){const i=t[n++];e[r++]=String.fromCharCode((s&31)<<6|i&63)}else if(s>239&&s<365){const i=t[n++],o=t[n++],a=t[n++],l=((s&7)<<18|(i&63)<<12|(o&63)<<6|a&63)-65536;e[r++]=String.fromCharCode(55296+(l>>10)),e[r++]=String.fromCharCode(56320+(l&1023))}else{const i=t[n++],o=t[n++];e[r++]=String.fromCharCode((s&15)<<12|(i&63)<<6|o&63)}}return e.join("")},Fl={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(t,e){if(!Array.isArray(t))throw Error("encodeByteArray takes an array as a parameter");this.init_();const n=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let s=0;s<t.length;s+=3){const i=t[s],o=s+1<t.length,a=o?t[s+1]:0,l=s+2<t.length,c=l?t[s+2]:0,u=i>>2,f=(i&3)<<4|a>>4;let d=(a&15)<<2|c>>6,g=c&63;l||(g=64,o||(d=64)),r.push(n[u],n[f],n[d],n[g])}return r.join("")},encodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(t):this.encodeByteArray(Ul(t),e)},decodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(t):dh(this.decodeStringToByteArray(t,e))},decodeStringToByteArray(t,e){this.init_();const n=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let s=0;s<t.length;){const i=n[t.charAt(s++)],a=s<t.length?n[t.charAt(s)]:0;++s;const c=s<t.length?n[t.charAt(s)]:64;++s;const f=s<t.length?n[t.charAt(s)]:64;if(++s,i==null||a==null||c==null||f==null)throw new hh;const d=i<<2|a>>4;if(r.push(d),c!==64){const g=a<<4&240|c>>2;if(r.push(g),f!==64){const v=c<<6&192|f;r.push(v)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let t=0;t<this.ENCODED_VALS.length;t++)this.byteToCharMap_[t]=this.ENCODED_VALS.charAt(t),this.charToByteMap_[this.byteToCharMap_[t]]=t,this.byteToCharMapWebSafe_[t]=this.ENCODED_VALS_WEBSAFE.charAt(t),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[t]]=t,t>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(t)]=t,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(t)]=t)}}};class hh extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const ph=function(t){const e=Ul(t);return Fl.encodeByteArray(e,!0)},Vl=function(t){return ph(t).replace(/\./g,"")},Bl=function(t){try{return Fl.decodeString(t,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
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
 */function gh(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
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
 */const mh=()=>gh().__FIREBASE_DEFAULTS__,_h=()=>{if(typeof process>"u"||typeof Fo>"u")return;const t=Fo.__FIREBASE_DEFAULTS__;if(t)return JSON.parse(t)},yh=()=>{if(typeof document>"u")return;let t;try{t=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=t&&Bl(t[1]);return e&&JSON.parse(e)},Pi=()=>{try{return fh()||mh()||_h()||yh()}catch(t){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${t}`);return}},vh=t=>{var e,n;return(n=(e=Pi())==null?void 0:e.emulatorHosts)==null?void 0:n[t]},Hl=()=>{var t;return(t=Pi())==null?void 0:t.config},$l=t=>{var e;return(e=Pi())==null?void 0:e[`_${t}`]};/**
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
 */class bh{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}wrapCallback(e){return(n,r)=>{n?this.reject(n):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(n):e(n,r))}}}/**
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
 */function fs(t){try{return(t.startsWith("http://")||t.startsWith("https://")?new URL(t).hostname:t).endsWith(".cloudworkstations.dev")}catch{return!1}}async function Eh(t){return(await fetch(t,{credentials:"include"})).ok}const Qn={};function Ih(){const t={prod:[],emulator:[]};for(const e of Object.keys(Qn))Qn[e]?t.emulator.push(e):t.prod.push(e);return t}function wh(t){let e=document.getElementById(t),n=!1;return e||(e=document.createElement("div"),e.setAttribute("id",t),n=!0),{created:n,element:e}}let Vo=!1;function Sh(t,e){if(typeof window>"u"||typeof document>"u"||!fs(window.location.host)||Qn[t]===e||Qn[t]||Vo)return;Qn[t]=e;function n(d){return`__firebase__banner__${d}`}const r="__firebase__banner",i=Ih().prod.length>0;function o(){const d=document.getElementById(r);d&&d.remove()}function a(d){d.style.display="flex",d.style.background="#7faaf0",d.style.position="fixed",d.style.bottom="5px",d.style.left="5px",d.style.padding=".5em",d.style.borderRadius="5px",d.style.alignItems="center"}function l(d,g){d.setAttribute("width","24"),d.setAttribute("id",g),d.setAttribute("height","24"),d.setAttribute("viewBox","0 0 24 24"),d.setAttribute("fill","none"),d.style.marginLeft="-6px"}function c(){const d=document.createElement("span");return d.style.cursor="pointer",d.style.marginLeft="16px",d.style.fontSize="24px",d.innerHTML=" &times;",d.onclick=()=>{Vo=!0,o()},d}function u(d,g){d.setAttribute("id",g),d.innerText="Learn more",d.href="https://firebase.google.com/docs/studio/preview-apps#preview-backend",d.setAttribute("target","__blank"),d.style.paddingLeft="5px",d.style.textDecoration="underline"}function f(){const d=wh(r),g=n("text"),v=document.getElementById(g)||document.createElement("span"),y=n("learnmore"),S=document.getElementById(y)||document.createElement("a"),x=n("preprendIcon"),P=document.getElementById(x)||document.createElementNS("http://www.w3.org/2000/svg","svg");if(d.created){const M=d.element;a(M),u(S,y);const D=c();l(P,x),M.append(P,v,S,D),document.body.appendChild(M)}i?(v.innerText="Preview backend disconnected.",P.innerHTML=`<g clip-path="url(#clip0_6013_33858)">
<path d="M4.8 17.6L12 5.6L19.2 17.6H4.8ZM6.91667 16.4H17.0833L12 7.93333L6.91667 16.4ZM12 15.6C12.1667 15.6 12.3056 15.5444 12.4167 15.4333C12.5389 15.3111 12.6 15.1667 12.6 15C12.6 14.8333 12.5389 14.6944 12.4167 14.5833C12.3056 14.4611 12.1667 14.4 12 14.4C11.8333 14.4 11.6889 14.4611 11.5667 14.5833C11.4556 14.6944 11.4 14.8333 11.4 15C11.4 15.1667 11.4556 15.3111 11.5667 15.4333C11.6889 15.5444 11.8333 15.6 12 15.6ZM11.4 13.6H12.6V10.4H11.4V13.6Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6013_33858">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`):(P.innerHTML=`<g clip-path="url(#clip0_6083_34804)">
<path d="M11.4 15.2H12.6V11.2H11.4V15.2ZM12 10C12.1667 10 12.3056 9.94444 12.4167 9.83333C12.5389 9.71111 12.6 9.56667 12.6 9.4C12.6 9.23333 12.5389 9.09444 12.4167 8.98333C12.3056 8.86111 12.1667 8.8 12 8.8C11.8333 8.8 11.6889 8.86111 11.5667 8.98333C11.4556 9.09444 11.4 9.23333 11.4 9.4C11.4 9.56667 11.4556 9.71111 11.5667 9.83333C11.6889 9.94444 11.8333 10 12 10ZM12 18.4C11.1222 18.4 10.2944 18.2333 9.51667 17.9C8.73889 17.5667 8.05556 17.1111 7.46667 16.5333C6.88889 15.9444 6.43333 15.2611 6.1 14.4833C5.76667 13.7056 5.6 12.8778 5.6 12C5.6 11.1111 5.76667 10.2833 6.1 9.51667C6.43333 8.73889 6.88889 8.06111 7.46667 7.48333C8.05556 6.89444 8.73889 6.43333 9.51667 6.1C10.2944 5.76667 11.1222 5.6 12 5.6C12.8889 5.6 13.7167 5.76667 14.4833 6.1C15.2611 6.43333 15.9389 6.89444 16.5167 7.48333C17.1056 8.06111 17.5667 8.73889 17.9 9.51667C18.2333 10.2833 18.4 11.1111 18.4 12C18.4 12.8778 18.2333 13.7056 17.9 14.4833C17.5667 15.2611 17.1056 15.9444 16.5167 16.5333C15.9389 17.1111 15.2611 17.5667 14.4833 17.9C13.7167 18.2333 12.8889 18.4 12 18.4ZM12 17.2C13.4444 17.2 14.6722 16.6944 15.6833 15.6833C16.6944 14.6722 17.2 13.4444 17.2 12C17.2 10.5556 16.6944 9.32778 15.6833 8.31667C14.6722 7.30555 13.4444 6.8 12 6.8C10.5556 6.8 9.32778 7.30555 8.31667 8.31667C7.30556 9.32778 6.8 10.5556 6.8 12C6.8 13.4444 7.30556 14.6722 8.31667 15.6833C9.32778 16.6944 10.5556 17.2 12 17.2Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6083_34804">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`,v.innerText="Preview backend running in this workspace."),v.setAttribute("id",g)}document.readyState==="loading"?window.addEventListener("DOMContentLoaded",f):f()}/**
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
 */function Ie(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function Th(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(Ie())}function Ch(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function Ah(){const t=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof t=="object"&&t.id!==void 0}function Rh(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function Ph(){const t=Ie();return t.indexOf("MSIE ")>=0||t.indexOf("Trident/")>=0}function Oh(){try{return typeof indexedDB=="object"}catch{return!1}}function kh(){return new Promise((t,e)=>{try{let n=!0;const r="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(r);s.onsuccess=()=>{s.result.close(),n||self.indexedDB.deleteDatabase(r),t(!0)},s.onupgradeneeded=()=>{n=!1},s.onerror=()=>{var i;e(((i=s.error)==null?void 0:i.message)||"")}}catch(n){e(n)}})}/**
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
 */const Nh="FirebaseError";class Gt extends Error{constructor(e,n,r){super(n),this.code=e,this.customData=r,this.name=Nh,Object.setPrototypeOf(this,Gt.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,gr.prototype.create)}}class gr{constructor(e,n,r){this.service=e,this.serviceName=n,this.errors=r}create(e,...n){const r=n[0]||{},s=`${this.service}/${e}`,i=this.errors[e],o=i?Dh(i,r):"Error",a=`${this.serviceName}: ${o} (${s}).`;return new Gt(s,a,r)}}function Dh(t,e){return t.replace(xh,(n,r)=>{const s=e[r];return s!=null?String(s):`<${r}?>`})}const xh=/\{\$([^}]+)}/g;function Mh(t){for(const e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}function On(t,e){if(t===e)return!0;const n=Object.keys(t),r=Object.keys(e);for(const s of n){if(!r.includes(s))return!1;const i=t[s],o=e[s];if(Bo(i)&&Bo(o)){if(!On(i,o))return!1}else if(i!==o)return!1}for(const s of r)if(!n.includes(s))return!1;return!0}function Bo(t){return t!==null&&typeof t=="object"}/**
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
 */function mr(t){const e=[];for(const[n,r]of Object.entries(t))Array.isArray(r)?r.forEach(s=>{e.push(encodeURIComponent(n)+"="+encodeURIComponent(s))}):e.push(encodeURIComponent(n)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}function $n(t){const e={};return t.replace(/^\?/,"").split("&").forEach(r=>{if(r){const[s,i]=r.split("=");e[decodeURIComponent(s)]=decodeURIComponent(i)}}),e}function jn(t){const e=t.indexOf("?");if(!e)return"";const n=t.indexOf("#",e);return t.substring(e,n>0?n:void 0)}function Lh(t,e){const n=new Uh(t,e);return n.subscribe.bind(n)}class Uh{constructor(e,n){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=n,this.task.then(()=>{e(this)}).catch(r=>{this.error(r)})}next(e){this.forEachObserver(n=>{n.next(e)})}error(e){this.forEachObserver(n=>{n.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,n,r){let s;if(e===void 0&&n===void 0&&r===void 0)throw new Error("Missing Observer.");Fh(e,["next","error","complete"])?s=e:s={next:e,error:n,complete:r},s.next===void 0&&(s.next=ks),s.error===void 0&&(s.error=ks),s.complete===void 0&&(s.complete=ks);const i=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?s.error(this.finalError):s.complete()}catch{}}),this.observers.push(s),i}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let n=0;n<this.observers.length;n++)this.sendOne(n,e)}sendOne(e,n){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{n(this.observers[e])}catch(r){typeof console<"u"&&console.error&&console.error(r)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function Fh(t,e){if(typeof t!="object"||t===null)return!1;for(const n of e)if(n in t&&typeof t[n]=="function")return!0;return!1}function ks(){}/**
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
 */function St(t){return t&&t._delegate?t._delegate:t}class kn{constructor(e,n,r){this.name=e,this.instanceFactory=n,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
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
 */const Zt="[DEFAULT]";/**
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
 */class Vh{constructor(e,n){this.name=e,this.container=n,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const n=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(n)){const r=new bh;if(this.instancesDeferred.set(n,r),this.isInitialized(n)||this.shouldAutoInitialize())try{const s=this.getOrInitializeService({instanceIdentifier:n});s&&r.resolve(s)}catch{}}return this.instancesDeferred.get(n).promise}getImmediate(e){const n=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),r=(e==null?void 0:e.optional)??!1;if(this.isInitialized(n)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:n})}catch(s){if(r)return null;throw s}else{if(r)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(Hh(e))try{this.getOrInitializeService({instanceIdentifier:Zt})}catch{}for(const[n,r]of this.instancesDeferred.entries()){const s=this.normalizeInstanceIdentifier(n);try{const i=this.getOrInitializeService({instanceIdentifier:s});r.resolve(i)}catch{}}}}clearInstance(e=Zt){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(n=>"INTERNAL"in n).map(n=>n.INTERNAL.delete()),...e.filter(n=>"_delete"in n).map(n=>n._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=Zt){return this.instances.has(e)}getOptions(e=Zt){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:n={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const s=this.getOrInitializeService({instanceIdentifier:r,options:n});for(const[i,o]of this.instancesDeferred.entries()){const a=this.normalizeInstanceIdentifier(i);r===a&&o.resolve(s)}return s}onInit(e,n){const r=this.normalizeInstanceIdentifier(n),s=this.onInitCallbacks.get(r)??new Set;s.add(e),this.onInitCallbacks.set(r,s);const i=this.instances.get(r);return i&&e(i,r),()=>{s.delete(e)}}invokeOnInitCallbacks(e,n){const r=this.onInitCallbacks.get(n);if(r)for(const s of r)try{s(e,n)}catch{}}getOrInitializeService({instanceIdentifier:e,options:n={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:Bh(e),options:n}),this.instances.set(e,r),this.instancesOptions.set(e,n),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch{}return r||null}normalizeInstanceIdentifier(e=Zt){return this.component?this.component.multipleInstances?e:Zt:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function Bh(t){return t===Zt?void 0:t}function Hh(t){return t.instantiationMode==="EAGER"}/**
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
 */class $h{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const n=this.getProvider(e.name);if(n.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);n.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const n=new Vh(e,this);return this.providers.set(e,n),n}getProviders(){return Array.from(this.providers.values())}}/**
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
 */var ne;(function(t){t[t.DEBUG=0]="DEBUG",t[t.VERBOSE=1]="VERBOSE",t[t.INFO=2]="INFO",t[t.WARN=3]="WARN",t[t.ERROR=4]="ERROR",t[t.SILENT=5]="SILENT"})(ne||(ne={}));const jh={debug:ne.DEBUG,verbose:ne.VERBOSE,info:ne.INFO,warn:ne.WARN,error:ne.ERROR,silent:ne.SILENT},Wh=ne.INFO,Kh={[ne.DEBUG]:"log",[ne.VERBOSE]:"log",[ne.INFO]:"info",[ne.WARN]:"warn",[ne.ERROR]:"error"},Gh=(t,e,...n)=>{if(e<t.logLevel)return;const r=new Date().toISOString(),s=Kh[e];if(s)console[s](`[${r}]  ${t.name}:`,...n);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class jl{constructor(e){this.name=e,this._logLevel=Wh,this._logHandler=Gh,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in ne))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?jh[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,ne.DEBUG,...e),this._logHandler(this,ne.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,ne.VERBOSE,...e),this._logHandler(this,ne.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,ne.INFO,...e),this._logHandler(this,ne.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,ne.WARN,...e),this._logHandler(this,ne.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,ne.ERROR,...e),this._logHandler(this,ne.ERROR,...e)}}const zh=(t,e)=>e.some(n=>t instanceof n);let Ho,$o;function qh(){return Ho||(Ho=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function Jh(){return $o||($o=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const Wl=new WeakMap,ei=new WeakMap,Kl=new WeakMap,Ns=new WeakMap,Oi=new WeakMap;function Yh(t){const e=new Promise((n,r)=>{const s=()=>{t.removeEventListener("success",i),t.removeEventListener("error",o)},i=()=>{n(Ht(t.result)),s()},o=()=>{r(t.error),s()};t.addEventListener("success",i),t.addEventListener("error",o)});return e.then(n=>{n instanceof IDBCursor&&Wl.set(n,t)}).catch(()=>{}),Oi.set(e,t),e}function Xh(t){if(ei.has(t))return;const e=new Promise((n,r)=>{const s=()=>{t.removeEventListener("complete",i),t.removeEventListener("error",o),t.removeEventListener("abort",o)},i=()=>{n(),s()},o=()=>{r(t.error||new DOMException("AbortError","AbortError")),s()};t.addEventListener("complete",i),t.addEventListener("error",o),t.addEventListener("abort",o)});ei.set(t,e)}let ti={get(t,e,n){if(t instanceof IDBTransaction){if(e==="done")return ei.get(t);if(e==="objectStoreNames")return t.objectStoreNames||Kl.get(t);if(e==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return Ht(t[e])},set(t,e,n){return t[e]=n,!0},has(t,e){return t instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in t}};function Qh(t){ti=t(ti)}function Zh(t){return t===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...n){const r=t.call(Ds(this),e,...n);return Kl.set(r,e.sort?e.sort():[e]),Ht(r)}:Jh().includes(t)?function(...e){return t.apply(Ds(this),e),Ht(Wl.get(this))}:function(...e){return Ht(t.apply(Ds(this),e))}}function ep(t){return typeof t=="function"?Zh(t):(t instanceof IDBTransaction&&Xh(t),zh(t,qh())?new Proxy(t,ti):t)}function Ht(t){if(t instanceof IDBRequest)return Yh(t);if(Ns.has(t))return Ns.get(t);const e=ep(t);return e!==t&&(Ns.set(t,e),Oi.set(e,t)),e}const Ds=t=>Oi.get(t);function tp(t,e,{blocked:n,upgrade:r,blocking:s,terminated:i}={}){const o=indexedDB.open(t,e),a=Ht(o);return r&&o.addEventListener("upgradeneeded",l=>{r(Ht(o.result),l.oldVersion,l.newVersion,Ht(o.transaction),l)}),n&&o.addEventListener("blocked",l=>n(l.oldVersion,l.newVersion,l)),a.then(l=>{i&&l.addEventListener("close",()=>i()),s&&l.addEventListener("versionchange",c=>s(c.oldVersion,c.newVersion,c))}).catch(()=>{}),a}const np=["get","getKey","getAll","getAllKeys","count"],rp=["put","add","delete","clear"],xs=new Map;function jo(t,e){if(!(t instanceof IDBDatabase&&!(e in t)&&typeof e=="string"))return;if(xs.get(e))return xs.get(e);const n=e.replace(/FromIndex$/,""),r=e!==n,s=rp.includes(n);if(!(n in(r?IDBIndex:IDBObjectStore).prototype)||!(s||np.includes(n)))return;const i=async function(o,...a){const l=this.transaction(o,s?"readwrite":"readonly");let c=l.store;return r&&(c=c.index(a.shift())),(await Promise.all([c[n](...a),s&&l.done]))[0]};return xs.set(e,i),i}Qh(t=>({...t,get:(e,n,r)=>jo(e,n)||t.get(e,n,r),has:(e,n)=>!!jo(e,n)||t.has(e,n)}));/**
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
 */class sp{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(n=>{if(ip(n)){const r=n.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(n=>n).join(" ")}}function ip(t){const e=t.getComponent();return(e==null?void 0:e.type)==="VERSION"}const ni="@firebase/app",Wo="0.14.9";/**
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
 */const Et=new jl("@firebase/app"),op="@firebase/app-compat",ap="@firebase/analytics-compat",lp="@firebase/analytics",cp="@firebase/app-check-compat",up="@firebase/app-check",fp="@firebase/auth",dp="@firebase/auth-compat",hp="@firebase/database",pp="@firebase/data-connect",gp="@firebase/database-compat",mp="@firebase/functions",_p="@firebase/functions-compat",yp="@firebase/installations",vp="@firebase/installations-compat",bp="@firebase/messaging",Ep="@firebase/messaging-compat",Ip="@firebase/performance",wp="@firebase/performance-compat",Sp="@firebase/remote-config",Tp="@firebase/remote-config-compat",Cp="@firebase/storage",Ap="@firebase/storage-compat",Rp="@firebase/firestore",Pp="@firebase/ai",Op="@firebase/firestore-compat",kp="firebase",Np="12.10.0";/**
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
 */const ri="[DEFAULT]",Dp={[ni]:"fire-core",[op]:"fire-core-compat",[lp]:"fire-analytics",[ap]:"fire-analytics-compat",[up]:"fire-app-check",[cp]:"fire-app-check-compat",[fp]:"fire-auth",[dp]:"fire-auth-compat",[hp]:"fire-rtdb",[pp]:"fire-data-connect",[gp]:"fire-rtdb-compat",[mp]:"fire-fn",[_p]:"fire-fn-compat",[yp]:"fire-iid",[vp]:"fire-iid-compat",[bp]:"fire-fcm",[Ep]:"fire-fcm-compat",[Ip]:"fire-perf",[wp]:"fire-perf-compat",[Sp]:"fire-rc",[Tp]:"fire-rc-compat",[Cp]:"fire-gcs",[Ap]:"fire-gcs-compat",[Rp]:"fire-fst",[Op]:"fire-fst-compat",[Pp]:"fire-vertex","fire-js":"fire-js",[kp]:"fire-js-all"};/**
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
 */const Wr=new Map,xp=new Map,si=new Map;function Ko(t,e){try{t.container.addComponent(e)}catch(n){Et.debug(`Component ${e.name} failed to register with FirebaseApp ${t.name}`,n)}}function or(t){const e=t.name;if(si.has(e))return Et.debug(`There were multiple attempts to register component ${e}.`),!1;si.set(e,t);for(const n of Wr.values())Ko(n,t);for(const n of xp.values())Ko(n,t);return!0}function Gl(t,e){const n=t.container.getProvider("heartbeat").getImmediate({optional:!0});return n&&n.triggerHeartbeat(),t.container.getProvider(e)}function Ze(t){return t==null?!1:t.settings!==void 0}/**
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
 */const Mp={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},$t=new gr("app","Firebase",Mp);/**
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
 */class Lp{constructor(e,n,r){this._isDeleted=!1,this._options={...e},this._config={...n},this._name=n.name,this._automaticDataCollectionEnabled=n.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new kn("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw $t.create("app-deleted",{appName:this._name})}}/**
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
 */const _r=Np;function zl(t,e={}){let n=t;typeof e!="object"&&(e={name:e});const r={name:ri,automaticDataCollectionEnabled:!0,...e},s=r.name;if(typeof s!="string"||!s)throw $t.create("bad-app-name",{appName:String(s)});if(n||(n=Hl()),!n)throw $t.create("no-options");const i=Wr.get(s);if(i){if(On(n,i.options)&&On(r,i.config))return i;throw $t.create("duplicate-app",{appName:s})}const o=new $h(s);for(const l of si.values())o.addComponent(l);const a=new Lp(n,r,o);return Wr.set(s,a),a}function Up(t=ri){const e=Wr.get(t);if(!e&&t===ri&&Hl())return zl();if(!e)throw $t.create("no-app",{appName:t});return e}function In(t,e,n){let r=Dp[t]??t;n&&(r+=`-${n}`);const s=r.match(/\s|\//),i=e.match(/\s|\//);if(s||i){const o=[`Unable to register library "${r}" with version "${e}":`];s&&o.push(`library name "${r}" contains illegal characters (whitespace or "/")`),s&&i&&o.push("and"),i&&o.push(`version name "${e}" contains illegal characters (whitespace or "/")`),Et.warn(o.join(" "));return}or(new kn(`${r}-version`,()=>({library:r,version:e}),"VERSION"))}/**
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
 */const Fp="firebase-heartbeat-database",Vp=1,ar="firebase-heartbeat-store";let Ms=null;function ql(){return Ms||(Ms=tp(Fp,Vp,{upgrade:(t,e)=>{switch(e){case 0:try{t.createObjectStore(ar)}catch(n){console.warn(n)}}}}).catch(t=>{throw $t.create("idb-open",{originalErrorMessage:t.message})})),Ms}async function Bp(t){try{const n=(await ql()).transaction(ar),r=await n.objectStore(ar).get(Jl(t));return await n.done,r}catch(e){if(e instanceof Gt)Et.warn(e.message);else{const n=$t.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});Et.warn(n.message)}}}async function Go(t,e){try{const r=(await ql()).transaction(ar,"readwrite");await r.objectStore(ar).put(e,Jl(t)),await r.done}catch(n){if(n instanceof Gt)Et.warn(n.message);else{const r=$t.create("idb-set",{originalErrorMessage:n==null?void 0:n.message});Et.warn(r.message)}}}function Jl(t){return`${t.name}!${t.options.appId}`}/**
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
 */const Hp=1024,$p=30;class jp{constructor(e){this.container=e,this._heartbeatsCache=null;const n=this.container.getProvider("app").getImmediate();this._storage=new Kp(n),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){var e,n;try{const s=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),i=zo();if(((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((n=this._heartbeatsCache)==null?void 0:n.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===i||this._heartbeatsCache.heartbeats.some(o=>o.date===i))return;if(this._heartbeatsCache.heartbeats.push({date:i,agent:s}),this._heartbeatsCache.heartbeats.length>$p){const o=Gp(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(o,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(r){Et.warn(r)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const n=zo(),{heartbeatsToSend:r,unsentEntries:s}=Wp(this._heartbeatsCache.heartbeats),i=Vl(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=n,s.length>0?(this._heartbeatsCache.heartbeats=s,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),i}catch(n){return Et.warn(n),""}}}function zo(){return new Date().toISOString().substring(0,10)}function Wp(t,e=Hp){const n=[];let r=t.slice();for(const s of t){const i=n.find(o=>o.agent===s.agent);if(i){if(i.dates.push(s.date),qo(n)>e){i.dates.pop();break}}else if(n.push({agent:s.agent,dates:[s.date]}),qo(n)>e){n.pop();break}r=r.slice(1)}return{heartbeatsToSend:n,unsentEntries:r}}class Kp{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return Oh()?kh().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const n=await Bp(this.app);return n!=null&&n.heartbeats?n:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){if(await this._canUseIndexedDBPromise){const r=await this.read();return Go(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??r.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){if(await this._canUseIndexedDBPromise){const r=await this.read();return Go(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??r.lastSentHeartbeatDate,heartbeats:[...r.heartbeats,...e.heartbeats]})}else return}}function qo(t){return Vl(JSON.stringify({version:2,heartbeats:t})).length}function Gp(t){if(t.length===0)return-1;let e=0,n=t[0].date;for(let r=1;r<t.length;r++)t[r].date<n&&(n=t[r].date,e=r);return e}/**
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
 */function zp(t){or(new kn("platform-logger",e=>new sp(e),"PRIVATE")),or(new kn("heartbeat",e=>new jp(e),"PRIVATE")),In(ni,Wo,t),In(ni,Wo,"esm2020"),In("fire-js","")}zp("");function Yl(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const qp=Yl,Xl=new gr("auth","Firebase",Yl());/**
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
 */const Kr=new jl("@firebase/auth");function Jp(t,...e){Kr.logLevel<=ne.WARN&&Kr.warn(`Auth (${_r}): ${t}`,...e)}function Or(t,...e){Kr.logLevel<=ne.ERROR&&Kr.error(`Auth (${_r}): ${t}`,...e)}/**
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
 */function $e(t,...e){throw ki(t,...e)}function st(t,...e){return ki(t,...e)}function Ql(t,e,n){const r={...qp(),[e]:n};return new gr("auth","Firebase",r).create(e,{appName:t.name})}function jt(t){return Ql(t,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function ki(t,...e){if(typeof t!="string"){const n=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=t.name),t._errorFactory.create(n,...r)}return Xl.create(t,...e)}function B(t,e,...n){if(!t)throw ki(e,...n)}function mt(t){const e="INTERNAL ASSERTION FAILED: "+t;throw Or(e),new Error(e)}function It(t,e){t||mt(e)}/**
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
 */function ii(){var t;return typeof self<"u"&&((t=self.location)==null?void 0:t.href)||""}function Yp(){return Jo()==="http:"||Jo()==="https:"}function Jo(){var t;return typeof self<"u"&&((t=self.location)==null?void 0:t.protocol)||null}/**
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
 */function Xp(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(Yp()||Ah()||"connection"in navigator)?navigator.onLine:!0}function Qp(){if(typeof navigator>"u")return null;const t=navigator;return t.languages&&t.languages[0]||t.language||null}/**
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
 */class yr{constructor(e,n){this.shortDelay=e,this.longDelay=n,It(n>e,"Short delay should be less than long delay!"),this.isMobile=Th()||Rh()}get(){return Xp()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
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
 */function Ni(t,e){It(t.emulator,"Emulator should always be set here");const{url:n}=t.emulator;return e?`${n}${e.startsWith("/")?e.slice(1):e}`:n}/**
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
 */class Zl{static initialize(e,n,r){this.fetchImpl=e,n&&(this.headersImpl=n),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;mt("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;mt("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;mt("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
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
 */const Zp={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
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
 */const eg=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],tg=new yr(3e4,6e4);function ln(t,e){return t.tenantId&&!e.tenantId?{...e,tenantId:t.tenantId}:e}async function zt(t,e,n,r,s={}){return ec(t,s,async()=>{let i={},o={};r&&(e==="GET"?o=r:i={body:JSON.stringify(r)});const a=mr({key:t.config.apiKey,...o}).slice(1),l=await t._getAdditionalHeaders();l["Content-Type"]="application/json",t.languageCode&&(l["X-Firebase-Locale"]=t.languageCode);const c={method:e,headers:l,...i};return Ch()||(c.referrerPolicy="no-referrer"),t.emulatorConfig&&fs(t.emulatorConfig.host)&&(c.credentials="include"),Zl.fetch()(await tc(t,t.config.apiHost,n,a),c)})}async function ec(t,e,n){t._canInitEmulator=!1;const r={...Zp,...e};try{const s=new rg(t),i=await Promise.race([n(),s.promise]);s.clearNetworkTimeout();const o=await i.json();if("needConfirmation"in o)throw Sr(t,"account-exists-with-different-credential",o);if(i.ok&&!("errorMessage"in o))return o;{const a=i.ok?o.errorMessage:o.error.message,[l,c]=a.split(" : ");if(l==="FEDERATED_USER_ID_ALREADY_LINKED")throw Sr(t,"credential-already-in-use",o);if(l==="EMAIL_EXISTS")throw Sr(t,"email-already-in-use",o);if(l==="USER_DISABLED")throw Sr(t,"user-disabled",o);const u=r[l]||l.toLowerCase().replace(/[_\s]+/g,"-");if(c)throw Ql(t,u,c);$e(t,u)}}catch(s){if(s instanceof Gt)throw s;$e(t,"network-request-failed",{message:String(s)})}}async function ds(t,e,n,r,s={}){const i=await zt(t,e,n,r,s);return"mfaPendingCredential"in i&&$e(t,"multi-factor-auth-required",{_serverResponse:i}),i}async function tc(t,e,n,r){const s=`${e}${n}?${r}`,i=t,o=i.config.emulator?Ni(t.config,s):`${t.config.apiScheme}://${s}`;return eg.includes(n)&&(await i._persistenceManagerAvailable,i._getPersistenceType()==="COOKIE")?i._getPersistence()._getFinalTarget(o).toString():o}function ng(t){switch(t){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}class rg{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((n,r)=>{this.timer=setTimeout(()=>r(st(this.auth,"network-request-failed")),tg.get())})}}function Sr(t,e,n){const r={appName:t.name};n.email&&(r.email=n.email),n.phoneNumber&&(r.phoneNumber=n.phoneNumber);const s=st(t,e,r);return s.customData._tokenResponse=n,s}function Yo(t){return t!==void 0&&t.enterprise!==void 0}class sg{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||this.recaptchaEnforcementState.length===0)return null;for(const n of this.recaptchaEnforcementState)if(n.provider&&n.provider===e)return ng(n.enforcementState);return null}isProviderEnabled(e){return this.getProviderEnforcementState(e)==="ENFORCE"||this.getProviderEnforcementState(e)==="AUDIT"}isAnyProviderEnabled(){return this.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")||this.isProviderEnabled("PHONE_PROVIDER")}}async function ig(t,e){return zt(t,"GET","/v2/recaptchaConfig",ln(t,e))}/**
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
 */async function og(t,e){return zt(t,"POST","/v1/accounts:delete",e)}async function Gr(t,e){return zt(t,"POST","/v1/accounts:lookup",e)}/**
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
 */function Zn(t){if(t)try{const e=new Date(Number(t));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function ag(t,e=!1){const n=St(t),r=await n.getIdToken(e),s=Di(r);B(s&&s.exp&&s.auth_time&&s.iat,n.auth,"internal-error");const i=typeof s.firebase=="object"?s.firebase:void 0,o=i==null?void 0:i.sign_in_provider;return{claims:s,token:r,authTime:Zn(Ls(s.auth_time)),issuedAtTime:Zn(Ls(s.iat)),expirationTime:Zn(Ls(s.exp)),signInProvider:o||null,signInSecondFactor:(i==null?void 0:i.sign_in_second_factor)||null}}function Ls(t){return Number(t)*1e3}function Di(t){const[e,n,r]=t.split(".");if(e===void 0||n===void 0||r===void 0)return Or("JWT malformed, contained fewer than 3 sections"),null;try{const s=Bl(n);return s?JSON.parse(s):(Or("Failed to decode base64 JWT payload"),null)}catch(s){return Or("Caught error parsing JWT payload as JSON",s==null?void 0:s.toString()),null}}function Xo(t){const e=Di(t);return B(e,"internal-error"),B(typeof e.exp<"u","internal-error"),B(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
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
 */async function lr(t,e,n=!1){if(n)return e;try{return await e}catch(r){throw r instanceof Gt&&lg(r)&&t.auth.currentUser===t&&await t.auth.signOut(),r}}function lg({code:t}){return t==="auth/user-disabled"||t==="auth/user-token-expired"}/**
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
 */class cg{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){if(e){const n=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),n}else{this.errorBackoff=3e4;const r=(this.user.stsTokenManager.expirationTime??0)-Date.now()-3e5;return Math.max(0,r)}}schedule(e=!1){if(!this.isRunning)return;const n=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},n)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
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
 */class oi{constructor(e,n){this.createdAt=e,this.lastLoginAt=n,this._initializeTime()}_initializeTime(){this.lastSignInTime=Zn(this.lastLoginAt),this.creationTime=Zn(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
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
 */async function zr(t){var f;const e=t.auth,n=await t.getIdToken(),r=await lr(t,Gr(e,{idToken:n}));B(r==null?void 0:r.users.length,e,"internal-error");const s=r.users[0];t._notifyReloadListener(s);const i=(f=s.providerUserInfo)!=null&&f.length?nc(s.providerUserInfo):[],o=fg(t.providerData,i),a=t.isAnonymous,l=!(t.email&&s.passwordHash)&&!(o!=null&&o.length),c=a?l:!1,u={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:o,metadata:new oi(s.createdAt,s.lastLoginAt),isAnonymous:c};Object.assign(t,u)}async function ug(t){const e=St(t);await zr(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function fg(t,e){return[...t.filter(r=>!e.some(s=>s.providerId===r.providerId)),...e]}function nc(t){return t.map(({providerId:e,...n})=>({providerId:e,uid:n.rawId||"",displayName:n.displayName||null,email:n.email||null,phoneNumber:n.phoneNumber||null,photoURL:n.photoUrl||null}))}/**
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
 */async function dg(t,e){const n=await ec(t,{},async()=>{const r=mr({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:s,apiKey:i}=t.config,o=await tc(t,s,"/v1/token",`key=${i}`),a=await t._getAdditionalHeaders();a["Content-Type"]="application/x-www-form-urlencoded";const l={method:"POST",headers:a,body:r};return t.emulatorConfig&&fs(t.emulatorConfig.host)&&(l.credentials="include"),Zl.fetch()(o,l)});return{accessToken:n.access_token,expiresIn:n.expires_in,refreshToken:n.refresh_token}}async function hg(t,e){return zt(t,"POST","/v2/accounts:revokeToken",ln(t,e))}/**
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
 */class wn{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){B(e.idToken,"internal-error"),B(typeof e.idToken<"u","internal-error"),B(typeof e.refreshToken<"u","internal-error");const n="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):Xo(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,n)}updateFromIdToken(e){B(e.length!==0,"internal-error");const n=Xo(e);this.updateTokensAndExpiration(e,null,n)}async getToken(e,n=!1){return!n&&this.accessToken&&!this.isExpired?this.accessToken:(B(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,n){const{accessToken:r,refreshToken:s,expiresIn:i}=await dg(e,n);this.updateTokensAndExpiration(r,s,Number(i))}updateTokensAndExpiration(e,n,r){this.refreshToken=n||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,n){const{refreshToken:r,accessToken:s,expirationTime:i}=n,o=new wn;return r&&(B(typeof r=="string","internal-error",{appName:e}),o.refreshToken=r),s&&(B(typeof s=="string","internal-error",{appName:e}),o.accessToken=s),i&&(B(typeof i=="number","internal-error",{appName:e}),o.expirationTime=i),o}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new wn,this.toJSON())}_performRefresh(){return mt("not implemented")}}/**
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
 */function Pt(t,e){B(typeof t=="string"||typeof t>"u","internal-error",{appName:e})}class Ue{constructor({uid:e,auth:n,stsTokenManager:r,...s}){this.providerId="firebase",this.proactiveRefresh=new cg(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=n,this.stsTokenManager=r,this.accessToken=r.accessToken,this.displayName=s.displayName||null,this.email=s.email||null,this.emailVerified=s.emailVerified||!1,this.phoneNumber=s.phoneNumber||null,this.photoURL=s.photoURL||null,this.isAnonymous=s.isAnonymous||!1,this.tenantId=s.tenantId||null,this.providerData=s.providerData?[...s.providerData]:[],this.metadata=new oi(s.createdAt||void 0,s.lastLoginAt||void 0)}async getIdToken(e){const n=await lr(this,this.stsTokenManager.getToken(this.auth,e));return B(n,this.auth,"internal-error"),this.accessToken!==n&&(this.accessToken=n,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),n}getIdTokenResult(e){return ag(this,e)}reload(){return ug(this)}_assign(e){this!==e&&(B(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(n=>({...n})),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const n=new Ue({...this,auth:e,stsTokenManager:this.stsTokenManager._clone()});return n.metadata._copy(this.metadata),n}_onReload(e){B(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,n=!1){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),n&&await zr(this),await this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(Ze(this.auth.app))return Promise.reject(jt(this.auth));const e=await this.getIdToken();return await lr(this,og(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return{uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>({...e})),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId,...this.metadata.toJSON(),apiKey:this.auth.config.apiKey,appName:this.auth.name}}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,n){const r=n.displayName??void 0,s=n.email??void 0,i=n.phoneNumber??void 0,o=n.photoURL??void 0,a=n.tenantId??void 0,l=n._redirectEventId??void 0,c=n.createdAt??void 0,u=n.lastLoginAt??void 0,{uid:f,emailVerified:d,isAnonymous:g,providerData:v,stsTokenManager:y}=n;B(f&&y,e,"internal-error");const S=wn.fromJSON(this.name,y);B(typeof f=="string",e,"internal-error"),Pt(r,e.name),Pt(s,e.name),B(typeof d=="boolean",e,"internal-error"),B(typeof g=="boolean",e,"internal-error"),Pt(i,e.name),Pt(o,e.name),Pt(a,e.name),Pt(l,e.name),Pt(c,e.name),Pt(u,e.name);const x=new Ue({uid:f,auth:e,email:s,emailVerified:d,displayName:r,isAnonymous:g,photoURL:o,phoneNumber:i,tenantId:a,stsTokenManager:S,createdAt:c,lastLoginAt:u});return v&&Array.isArray(v)&&(x.providerData=v.map(P=>({...P}))),l&&(x._redirectEventId=l),x}static async _fromIdTokenResponse(e,n,r=!1){const s=new wn;s.updateFromServerResponse(n);const i=new Ue({uid:n.localId,auth:e,stsTokenManager:s,isAnonymous:r});return await zr(i),i}static async _fromGetAccountInfoResponse(e,n,r){const s=n.users[0];B(s.localId!==void 0,"internal-error");const i=s.providerUserInfo!==void 0?nc(s.providerUserInfo):[],o=!(s.email&&s.passwordHash)&&!(i!=null&&i.length),a=new wn;a.updateFromIdToken(r);const l=new Ue({uid:s.localId,auth:e,stsTokenManager:a,isAnonymous:o}),c={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:i,metadata:new oi(s.createdAt,s.lastLoginAt),isAnonymous:!(s.email&&s.passwordHash)&&!(i!=null&&i.length)};return Object.assign(l,c),l}}/**
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
 */const Qo=new Map;function _t(t){It(t instanceof Function,"Expected a class definition");let e=Qo.get(t);return e?(It(e instanceof t,"Instance stored in cache mismatched with class"),e):(e=new t,Qo.set(t,e),e)}/**
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
 */class rc{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,n){this.storage[e]=n}async _get(e){const n=this.storage[e];return n===void 0?null:n}async _remove(e){delete this.storage[e]}_addListener(e,n){}_removeListener(e,n){}}rc.type="NONE";const Zo=rc;/**
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
 */function kr(t,e,n){return`firebase:${t}:${e}:${n}`}class Sn{constructor(e,n,r){this.persistence=e,this.auth=n,this.userKey=r;const{config:s,name:i}=this.auth;this.fullUserKey=kr(this.userKey,s.apiKey,i),this.fullPersistenceKey=kr("persistence",s.apiKey,i),this.boundEventHandler=n._onStorageEvent.bind(n),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const n=await Gr(this.auth,{idToken:e}).catch(()=>{});return n?Ue._fromGetAccountInfoResponse(this.auth,n,e):null}return Ue._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const n=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,n)return this.setCurrentUser(n)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,n,r="authUser"){if(!n.length)return new Sn(_t(Zo),e,r);const s=(await Promise.all(n.map(async c=>{if(await c._isAvailable())return c}))).filter(c=>c);let i=s[0]||_t(Zo);const o=kr(r,e.config.apiKey,e.name);let a=null;for(const c of n)try{const u=await c._get(o);if(u){let f;if(typeof u=="string"){const d=await Gr(e,{idToken:u}).catch(()=>{});if(!d)break;f=await Ue._fromGetAccountInfoResponse(e,d,u)}else f=Ue._fromJSON(e,u);c!==i&&(a=f),i=c;break}}catch{}const l=s.filter(c=>c._shouldAllowMigration);return!i._shouldAllowMigration||!l.length?new Sn(i,e,r):(i=l[0],a&&await i._set(o,a.toJSON()),await Promise.all(n.map(async c=>{if(c!==i)try{await c._remove(o)}catch{}})),new Sn(i,e,r))}}/**
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
 */function ea(t){const e=t.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(ac(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(sc(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(cc(e))return"Blackberry";if(uc(e))return"Webos";if(ic(e))return"Safari";if((e.includes("chrome/")||oc(e))&&!e.includes("edge/"))return"Chrome";if(lc(e))return"Android";{const n=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,r=t.match(n);if((r==null?void 0:r.length)===2)return r[1]}return"Other"}function sc(t=Ie()){return/firefox\//i.test(t)}function ic(t=Ie()){const e=t.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function oc(t=Ie()){return/crios\//i.test(t)}function ac(t=Ie()){return/iemobile/i.test(t)}function lc(t=Ie()){return/android/i.test(t)}function cc(t=Ie()){return/blackberry/i.test(t)}function uc(t=Ie()){return/webos/i.test(t)}function xi(t=Ie()){return/iphone|ipad|ipod/i.test(t)||/macintosh/i.test(t)&&/mobile/i.test(t)}function pg(t=Ie()){var e;return xi(t)&&!!((e=window.navigator)!=null&&e.standalone)}function gg(){return Ph()&&document.documentMode===10}function fc(t=Ie()){return xi(t)||lc(t)||uc(t)||cc(t)||/windows phone/i.test(t)||ac(t)}/**
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
 */function dc(t,e=[]){let n;switch(t){case"Browser":n=ea(Ie());break;case"Worker":n=`${ea(Ie())}-${t}`;break;default:n=t}const r=e.length?e.join(","):"FirebaseCore-web";return`${n}/JsCore/${_r}/${r}`}/**
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
 */class mg{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,n){const r=i=>new Promise((o,a)=>{try{const l=e(i);o(l)}catch(l){a(l)}});r.onAbort=n,this.queue.push(r);const s=this.queue.length-1;return()=>{this.queue[s]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const n=[];try{for(const r of this.queue)await r(e),r.onAbort&&n.push(r.onAbort)}catch(r){n.reverse();for(const s of n)try{s()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:r==null?void 0:r.message})}}}/**
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
 */async function _g(t,e={}){return zt(t,"GET","/v2/passwordPolicy",ln(t,e))}/**
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
 */const yg=6;class vg{constructor(e){var r;const n=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=n.minPasswordLength??yg,n.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=n.maxPasswordLength),n.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=n.containsLowercaseCharacter),n.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=n.containsUppercaseCharacter),n.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=n.containsNumericCharacter),n.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=n.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=((r=e.allowedNonAlphanumericCharacters)==null?void 0:r.join(""))??"",this.forceUpgradeOnSignin=e.forceUpgradeOnSignin??!1,this.schemaVersion=e.schemaVersion}validatePassword(e){const n={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,n),this.validatePasswordCharacterOptions(e,n),n.isValid&&(n.isValid=n.meetsMinPasswordLength??!0),n.isValid&&(n.isValid=n.meetsMaxPasswordLength??!0),n.isValid&&(n.isValid=n.containsLowercaseLetter??!0),n.isValid&&(n.isValid=n.containsUppercaseLetter??!0),n.isValid&&(n.isValid=n.containsNumericCharacter??!0),n.isValid&&(n.isValid=n.containsNonAlphanumericCharacter??!0),n}validatePasswordLengthOptions(e,n){const r=this.customStrengthOptions.minPasswordLength,s=this.customStrengthOptions.maxPasswordLength;r&&(n.meetsMinPasswordLength=e.length>=r),s&&(n.meetsMaxPasswordLength=e.length<=s)}validatePasswordCharacterOptions(e,n){this.updatePasswordCharacterOptionsStatuses(n,!1,!1,!1,!1);let r;for(let s=0;s<e.length;s++)r=e.charAt(s),this.updatePasswordCharacterOptionsStatuses(n,r>="a"&&r<="z",r>="A"&&r<="Z",r>="0"&&r<="9",this.allowedNonAlphanumericCharacters.includes(r))}updatePasswordCharacterOptionsStatuses(e,n,r,s,i){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=n)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=r)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=s)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=i))}}/**
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
 */class bg{constructor(e,n,r,s){this.app=e,this.heartbeatServiceProvider=n,this.appCheckServiceProvider=r,this.config=s,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new ta(this),this.idTokenSubscription=new ta(this),this.beforeStateQueue=new mg(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=Xl,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=s.sdkClientVersion,this._persistenceManagerAvailable=new Promise(i=>this._resolvePersistenceManagerAvailable=i)}_initializeWithPersistence(e,n){return n&&(this._popupRedirectResolver=_t(n)),this._initializationPromise=this.queue(async()=>{var r,s,i;if(!this._deleted&&(this.persistenceManager=await Sn.create(this,e),(r=this._resolvePersistenceManagerAvailable)==null||r.call(this),!this._deleted)){if((s=this._popupRedirectResolver)!=null&&s._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(n),this.lastNotifiedUid=((i=this.currentUser)==null?void 0:i.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const n=await Gr(this,{idToken:e}),r=await Ue._fromGetAccountInfoResponse(this,n,e);await this.directlySetCurrentUser(r)}catch(n){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",n),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var i;if(Ze(this.app)){const o=this.app.settings.authIdToken;return o?new Promise(a=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(o).then(a,a))}):this.directlySetCurrentUser(null)}const n=await this.assertedPersistence.getCurrentUser();let r=n,s=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const o=(i=this.redirectUser)==null?void 0:i._redirectEventId,a=r==null?void 0:r._redirectEventId,l=await this.tryRedirectSignIn(e);(!o||o===a)&&(l!=null&&l.user)&&(r=l.user,s=!0)}if(!r)return this.directlySetCurrentUser(null);if(!r._redirectEventId){if(s)try{await this.beforeStateQueue.runMiddleware(r)}catch(o){r=n,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(o))}return r?this.reloadAndSetCurrentUserOrClear(r):this.directlySetCurrentUser(null)}return B(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===r._redirectEventId?this.directlySetCurrentUser(r):this.reloadAndSetCurrentUserOrClear(r)}async tryRedirectSignIn(e){let n=null;try{n=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return n}async reloadAndSetCurrentUserOrClear(e){try{await zr(e)}catch(n){if((n==null?void 0:n.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=Qp()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(Ze(this.app))return Promise.reject(jt(this));const n=e?St(e):null;return n&&B(n.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(n&&n._clone(this))}async _updateCurrentUser(e,n=!1){if(!this._deleted)return e&&B(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),n||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return Ze(this.app)?Promise.reject(jt(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return Ze(this.app)?Promise.reject(jt(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(_t(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const n=this._getPasswordPolicyInternal();return n.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):n.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await _g(this),n=new vg(e);this.tenantId===null?this._projectPasswordPolicy=n:this._tenantPasswordPolicies[this.tenantId]=n}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new gr("auth","Firebase",e())}onAuthStateChanged(e,n,r){return this.registerStateListener(this.authStateSubscription,e,n,r)}beforeAuthStateChanged(e,n){return this.beforeStateQueue.pushCallback(e,n)}onIdTokenChanged(e,n,r){return this.registerStateListener(this.idTokenSubscription,e,n,r)}authStateReady(){return new Promise((e,n)=>{if(this.currentUser)e();else{const r=this.onAuthStateChanged(()=>{r(),e()},n)}})}async revokeAccessToken(e){if(this.currentUser){const n=await this.currentUser.getIdToken(),r={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:n};this.tenantId!=null&&(r.tenantId=this.tenantId),await hg(this,r)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)==null?void 0:e.toJSON()}}async _setRedirectUser(e,n){const r=await this.getOrInitRedirectPersistenceManager(n);return e===null?r.removeCurrentUser():r.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const n=e&&_t(e)||this._popupRedirectResolver;B(n,this,"argument-error"),this.redirectPersistenceManager=await Sn.create(this,[_t(n._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var n,r;return this._isInitialized&&await this.queue(async()=>{}),((n=this._currentUser)==null?void 0:n._redirectEventId)===e?this._currentUser:((r=this.redirectUser)==null?void 0:r._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var n;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const e=((n=this.currentUser)==null?void 0:n.uid)??null;this.lastNotifiedUid!==e&&(this.lastNotifiedUid=e,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,n,r,s){if(this._deleted)return()=>{};const i=typeof n=="function"?n:n.next.bind(n);let o=!1;const a=this._isInitialized?Promise.resolve():this._initializationPromise;if(B(a,this,"internal-error"),a.then(()=>{o||i(this.currentUser)}),typeof n=="function"){const l=e.addObserver(n,r,s);return()=>{o=!0,l()}}else{const l=e.addObserver(n);return()=>{o=!0,l()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return B(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=dc(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var s;const e={"X-Client-Version":this.clientVersion};this.app.options.appId&&(e["X-Firebase-gmpid"]=this.app.options.appId);const n=await((s=this.heartbeatServiceProvider.getImmediate({optional:!0}))==null?void 0:s.getHeartbeatsHeader());n&&(e["X-Firebase-Client"]=n);const r=await this._getAppCheckToken();return r&&(e["X-Firebase-AppCheck"]=r),e}async _getAppCheckToken(){var n;if(Ze(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=await((n=this.appCheckServiceProvider.getImmediate({optional:!0}))==null?void 0:n.getToken());return e!=null&&e.error&&Jp(`Error while retrieving App Check token: ${e.error}`),e==null?void 0:e.token}}function Dn(t){return St(t)}class ta{constructor(e){this.auth=e,this.observer=null,this.addObserver=Lh(n=>this.observer=n)}get next(){return B(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
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
 */let hs={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function Eg(t){hs=t}function hc(t){return hs.loadJS(t)}function Ig(){return hs.recaptchaEnterpriseScript}function wg(){return hs.gapiScript}function Sg(t){return`__${t}${Math.floor(Math.random()*1e6)}`}class Tg{constructor(){this.enterprise=new Cg}ready(e){e()}execute(e,n){return Promise.resolve("token")}render(e,n){return""}}class Cg{ready(e){e()}execute(e,n){return Promise.resolve("token")}render(e,n){return""}}const Ag="recaptcha-enterprise",pc="NO_RECAPTCHA";class Rg{constructor(e){this.type=Ag,this.auth=Dn(e)}async verify(e="verify",n=!1){async function r(i){if(!n){if(i.tenantId==null&&i._agentRecaptchaConfig!=null)return i._agentRecaptchaConfig.siteKey;if(i.tenantId!=null&&i._tenantRecaptchaConfigs[i.tenantId]!==void 0)return i._tenantRecaptchaConfigs[i.tenantId].siteKey}return new Promise(async(o,a)=>{ig(i,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(l=>{if(l.recaptchaKey===void 0)a(new Error("recaptcha Enterprise site key undefined"));else{const c=new sg(l);return i.tenantId==null?i._agentRecaptchaConfig=c:i._tenantRecaptchaConfigs[i.tenantId]=c,o(c.siteKey)}}).catch(l=>{a(l)})})}function s(i,o,a){const l=window.grecaptcha;Yo(l)?l.enterprise.ready(()=>{l.enterprise.execute(i,{action:e}).then(c=>{o(c)}).catch(()=>{o(pc)})}):a(Error("No reCAPTCHA enterprise script loaded."))}return this.auth.settings.appVerificationDisabledForTesting?new Tg().execute("siteKey",{action:"verify"}):new Promise((i,o)=>{r(this.auth).then(a=>{if(!n&&Yo(window.grecaptcha))s(a,i,o);else{if(typeof window>"u"){o(new Error("RecaptchaVerifier is only supported in browser"));return}let l=Ig();l.length!==0&&(l+=a),hc(l).then(()=>{s(a,i,o)}).catch(c=>{o(c)})}}).catch(a=>{o(a)})})}}async function na(t,e,n,r=!1,s=!1){const i=new Rg(t);let o;if(s)o=pc;else try{o=await i.verify(n)}catch{o=await i.verify(n,!0)}const a={...e};if(n==="mfaSmsEnrollment"||n==="mfaSmsSignIn"){if("phoneEnrollmentInfo"in a){const l=a.phoneEnrollmentInfo.phoneNumber,c=a.phoneEnrollmentInfo.recaptchaToken;Object.assign(a,{phoneEnrollmentInfo:{phoneNumber:l,recaptchaToken:c,captchaResponse:o,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}else if("phoneSignInInfo"in a){const l=a.phoneSignInInfo.recaptchaToken;Object.assign(a,{phoneSignInInfo:{recaptchaToken:l,captchaResponse:o,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}return a}return r?Object.assign(a,{captchaResp:o}):Object.assign(a,{captchaResponse:o}),Object.assign(a,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(a,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),a}async function ra(t,e,n,r,s){var i;if((i=t._getRecaptchaConfig())!=null&&i.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){const o=await na(t,e,n,n==="getOobCode");return r(t,o)}else return r(t,e).catch(async o=>{if(o.code==="auth/missing-recaptcha-token"){console.log(`${n} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);const a=await na(t,e,n,n==="getOobCode");return r(t,a)}else return Promise.reject(o)})}/**
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
 */function Pg(t,e){const n=Gl(t,"auth");if(n.isInitialized()){const s=n.getImmediate(),i=n.getOptions();if(On(i,e??{}))return s;$e(s,"already-initialized")}return n.initialize({options:e})}function Og(t,e){const n=(e==null?void 0:e.persistence)||[],r=(Array.isArray(n)?n:[n]).map(_t);e!=null&&e.errorMap&&t._updateErrorMap(e.errorMap),t._initializeWithPersistence(r,e==null?void 0:e.popupRedirectResolver)}function kg(t,e,n){const r=Dn(t);B(/^https?:\/\//.test(e),r,"invalid-emulator-scheme");const s=!1,i=gc(e),{host:o,port:a}=Ng(e),l=a===null?"":`:${a}`,c={url:`${i}//${o}${l}/`},u=Object.freeze({host:o,port:a,protocol:i.replace(":",""),options:Object.freeze({disableWarnings:s})});if(!r._canInitEmulator){B(r.config.emulator&&r.emulatorConfig,r,"emulator-config-failed"),B(On(c,r.config.emulator)&&On(u,r.emulatorConfig),r,"emulator-config-failed");return}r.config.emulator=c,r.emulatorConfig=u,r.settings.appVerificationDisabledForTesting=!0,fs(o)?(Eh(`${i}//${o}${l}`),Sh("Auth",!0)):Dg()}function gc(t){const e=t.indexOf(":");return e<0?"":t.substr(0,e+1)}function Ng(t){const e=gc(t),n=/(\/\/)?([^?#/]+)/.exec(t.substr(e.length));if(!n)return{host:"",port:null};const r=n[2].split("@").pop()||"",s=/^(\[[^\]]+\])(:|$)/.exec(r);if(s){const i=s[1];return{host:i,port:sa(r.substr(i.length+1))}}else{const[i,o]=r.split(":");return{host:i,port:sa(o)}}}function sa(t){if(!t)return null;const e=Number(t);return isNaN(e)?null:e}function Dg(){function t(){const e=document.createElement("p"),n=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",n.position="fixed",n.width="100%",n.backgroundColor="#ffffff",n.border=".1em solid #000000",n.color="#b50000",n.bottom="0px",n.left="0px",n.margin="0px",n.zIndex="10000",n.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",t):t())}/**
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
 */class Mi{constructor(e,n){this.providerId=e,this.signInMethod=n}toJSON(){return mt("not implemented")}_getIdTokenResponse(e){return mt("not implemented")}_linkToIdToken(e,n){return mt("not implemented")}_getReauthenticationResolver(e){return mt("not implemented")}}async function xg(t,e){return zt(t,"POST","/v1/accounts:signUp",e)}/**
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
 */async function Mg(t,e){return ds(t,"POST","/v1/accounts:signInWithPassword",ln(t,e))}/**
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
 */async function Lg(t,e){return ds(t,"POST","/v1/accounts:signInWithEmailLink",ln(t,e))}async function Ug(t,e){return ds(t,"POST","/v1/accounts:signInWithEmailLink",ln(t,e))}/**
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
 */class cr extends Mi{constructor(e,n,r,s=null){super("password",r),this._email=e,this._password=n,this._tenantId=s}static _fromEmailAndPassword(e,n){return new cr(e,n,"password")}static _fromEmailAndCode(e,n,r=null){return new cr(e,n,"emailLink",r)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){const n=typeof e=="string"?JSON.parse(e):e;if(n!=null&&n.email&&(n!=null&&n.password)){if(n.signInMethod==="password")return this._fromEmailAndPassword(n.email,n.password);if(n.signInMethod==="emailLink")return this._fromEmailAndCode(n.email,n.password,n.tenantId)}return null}async _getIdTokenResponse(e){switch(this.signInMethod){case"password":const n={returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return ra(e,n,"signInWithPassword",Mg);case"emailLink":return Lg(e,{email:this._email,oobCode:this._password});default:$e(e,"internal-error")}}async _linkToIdToken(e,n){switch(this.signInMethod){case"password":const r={idToken:n,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return ra(e,r,"signUpPassword",xg);case"emailLink":return Ug(e,{idToken:n,email:this._email,oobCode:this._password});default:$e(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}}/**
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
 */async function Tn(t,e){return ds(t,"POST","/v1/accounts:signInWithIdp",ln(t,e))}/**
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
 */const Fg="http://localhost";class sn extends Mi{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const n=new sn(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(n.idToken=e.idToken),e.accessToken&&(n.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(n.nonce=e.nonce),e.pendingToken&&(n.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(n.accessToken=e.oauthToken,n.secret=e.oauthTokenSecret):$e("argument-error"),n}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const n=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:s,...i}=n;if(!r||!s)return null;const o=new sn(r,s);return o.idToken=i.idToken||void 0,o.accessToken=i.accessToken||void 0,o.secret=i.secret,o.nonce=i.nonce,o.pendingToken=i.pendingToken||null,o}_getIdTokenResponse(e){const n=this.buildRequest();return Tn(e,n)}_linkToIdToken(e,n){const r=this.buildRequest();return r.idToken=n,Tn(e,r)}_getReauthenticationResolver(e){const n=this.buildRequest();return n.autoCreate=!1,Tn(e,n)}buildRequest(){const e={requestUri:Fg,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const n={};this.idToken&&(n.id_token=this.idToken),this.accessToken&&(n.access_token=this.accessToken),this.secret&&(n.oauth_token_secret=this.secret),n.providerId=this.providerId,this.nonce&&!this.pendingToken&&(n.nonce=this.nonce),e.postBody=mr(n)}return e}}/**
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
 */function Vg(t){switch(t){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}function Bg(t){const e=$n(jn(t)).link,n=e?$n(jn(e)).deep_link_id:null,r=$n(jn(t)).deep_link_id;return(r?$n(jn(r)).link:null)||r||n||e||t}class Li{constructor(e){const n=$n(jn(e)),r=n.apiKey??null,s=n.oobCode??null,i=Vg(n.mode??null);B(r&&s&&i,"argument-error"),this.apiKey=r,this.operation=i,this.code=s,this.continueUrl=n.continueUrl??null,this.languageCode=n.lang??null,this.tenantId=n.tenantId??null}static parseLink(e){const n=Bg(e);try{return new Li(n)}catch{return null}}}/**
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
 */class xn{constructor(){this.providerId=xn.PROVIDER_ID}static credential(e,n){return cr._fromEmailAndPassword(e,n)}static credentialWithLink(e,n){const r=Li.parseLink(n);return B(r,"argument-error"),cr._fromEmailAndCode(e,r.code,r.tenantId)}}xn.PROVIDER_ID="password";xn.EMAIL_PASSWORD_SIGN_IN_METHOD="password";xn.EMAIL_LINK_SIGN_IN_METHOD="emailLink";/**
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
 */class mc{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
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
 */class vr extends mc{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
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
 */class xt extends vr{constructor(){super("facebook.com")}static credential(e){return sn._fromParams({providerId:xt.PROVIDER_ID,signInMethod:xt.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return xt.credentialFromTaggedObject(e)}static credentialFromError(e){return xt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return xt.credential(e.oauthAccessToken)}catch{return null}}}xt.FACEBOOK_SIGN_IN_METHOD="facebook.com";xt.PROVIDER_ID="facebook.com";/**
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
 */class Mt extends vr{constructor(){super("google.com"),this.addScope("profile")}static credential(e,n){return sn._fromParams({providerId:Mt.PROVIDER_ID,signInMethod:Mt.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:n})}static credentialFromResult(e){return Mt.credentialFromTaggedObject(e)}static credentialFromError(e){return Mt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:n,oauthAccessToken:r}=e;if(!n&&!r)return null;try{return Mt.credential(n,r)}catch{return null}}}Mt.GOOGLE_SIGN_IN_METHOD="google.com";Mt.PROVIDER_ID="google.com";/**
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
 */class Lt extends vr{constructor(){super("github.com")}static credential(e){return sn._fromParams({providerId:Lt.PROVIDER_ID,signInMethod:Lt.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Lt.credentialFromTaggedObject(e)}static credentialFromError(e){return Lt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Lt.credential(e.oauthAccessToken)}catch{return null}}}Lt.GITHUB_SIGN_IN_METHOD="github.com";Lt.PROVIDER_ID="github.com";/**
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
 */class Ut extends vr{constructor(){super("twitter.com")}static credential(e,n){return sn._fromParams({providerId:Ut.PROVIDER_ID,signInMethod:Ut.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:n})}static credentialFromResult(e){return Ut.credentialFromTaggedObject(e)}static credentialFromError(e){return Ut.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:n,oauthTokenSecret:r}=e;if(!n||!r)return null;try{return Ut.credential(n,r)}catch{return null}}}Ut.TWITTER_SIGN_IN_METHOD="twitter.com";Ut.PROVIDER_ID="twitter.com";/**
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
 */class Nn{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,n,r,s=!1){const i=await Ue._fromIdTokenResponse(e,r,s),o=ia(r);return new Nn({user:i,providerId:o,_tokenResponse:r,operationType:n})}static async _forOperation(e,n,r){await e._updateTokensIfNecessary(r,!0);const s=ia(r);return new Nn({user:e,providerId:s,_tokenResponse:r,operationType:n})}}function ia(t){return t.providerId?t.providerId:"phoneNumber"in t?"phone":null}/**
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
 */class qr extends Gt{constructor(e,n,r,s){super(n.code,n.message),this.operationType=r,this.user=s,Object.setPrototypeOf(this,qr.prototype),this.customData={appName:e.name,tenantId:e.tenantId??void 0,_serverResponse:n.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,n,r,s){return new qr(e,n,r,s)}}function _c(t,e,n,r){return(e==="reauthenticate"?n._getReauthenticationResolver(t):n._getIdTokenResponse(t)).catch(i=>{throw i.code==="auth/multi-factor-auth-required"?qr._fromErrorAndOperation(t,i,e,r):i})}async function Hg(t,e,n=!1){const r=await lr(t,e._linkToIdToken(t.auth,await t.getIdToken()),n);return Nn._forOperation(t,"link",r)}/**
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
 */async function $g(t,e,n=!1){const{auth:r}=t;if(Ze(r.app))return Promise.reject(jt(r));const s="reauthenticate";try{const i=await lr(t,_c(r,s,e,t),n);B(i.idToken,r,"internal-error");const o=Di(i.idToken);B(o,r,"internal-error");const{sub:a}=o;return B(t.uid===a,r,"user-mismatch"),Nn._forOperation(t,s,i)}catch(i){throw(i==null?void 0:i.code)==="auth/user-not-found"&&$e(r,"user-mismatch"),i}}/**
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
 */async function yc(t,e,n=!1){if(Ze(t.app))return Promise.reject(jt(t));const r="signIn",s=await _c(t,r,e),i=await Nn._fromIdTokenResponse(t,r,s);return n||await t._updateCurrentUser(i.user),i}async function jg(t,e){return yc(Dn(t),e)}/**
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
 */async function Wg(t){const e=Dn(t);e._getPasswordPolicyInternal()&&await e._updatePasswordPolicy()}function Kg(t,e,n){return Ze(t.app)?Promise.reject(jt(t)):jg(St(t),xn.credential(e,n)).catch(async r=>{throw r.code==="auth/password-does-not-meet-requirements"&&Wg(t),r})}function Gg(t,e,n,r){return St(t).onIdTokenChanged(e,n,r)}function zg(t,e,n){return St(t).beforeAuthStateChanged(e,n)}function qg(t,e,n,r){return St(t).onAuthStateChanged(e,n,r)}function Jg(t){return St(t).signOut()}const Jr="__sak";/**
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
 */class vc{constructor(e,n){this.storageRetriever=e,this.type=n}_isAvailable(){try{return this.storage?(this.storage.setItem(Jr,"1"),this.storage.removeItem(Jr),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,n){return this.storage.setItem(e,JSON.stringify(n)),Promise.resolve()}_get(e){const n=this.storage.getItem(e);return Promise.resolve(n?JSON.parse(n):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
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
 */const Yg=1e3,Xg=10;class bc extends vc{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,n)=>this.onStorageEvent(e,n),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=fc(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const n of Object.keys(this.listeners)){const r=this.storage.getItem(n),s=this.localCache[n];r!==s&&e(n,s,r)}}onStorageEvent(e,n=!1){if(!e.key){this.forAllChangedKeys((o,a,l)=>{this.notifyListeners(o,l)});return}const r=e.key;n?this.detachListener():this.stopPolling();const s=()=>{const o=this.storage.getItem(r);!n&&this.localCache[r]===o||this.notifyListeners(r,o)},i=this.storage.getItem(r);gg()&&i!==e.newValue&&e.newValue!==e.oldValue?setTimeout(s,Xg):s()}notifyListeners(e,n){this.localCache[e]=n;const r=this.listeners[e];if(r)for(const s of Array.from(r))s(n&&JSON.parse(n))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,n,r)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:n,newValue:r}),!0)})},Yg)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,n){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,n){await super._set(e,n),this.localCache[e]=JSON.stringify(n)}async _get(e){const n=await super._get(e);return this.localCache[e]=JSON.stringify(n),n}async _remove(e){await super._remove(e),delete this.localCache[e]}}bc.type="LOCAL";const Qg=bc;/**
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
 */class Ec extends vc{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,n){}_removeListener(e,n){}}Ec.type="SESSION";const Ic=Ec;/**
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
 */function Zg(t){return Promise.all(t.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(n){return{fulfilled:!1,reason:n}}}))}/**
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
 */class ps{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const n=this.receivers.find(s=>s.isListeningto(e));if(n)return n;const r=new ps(e);return this.receivers.push(r),r}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const n=e,{eventId:r,eventType:s,data:i}=n.data,o=this.handlersMap[s];if(!(o!=null&&o.size))return;n.ports[0].postMessage({status:"ack",eventId:r,eventType:s});const a=Array.from(o).map(async c=>c(n.origin,i)),l=await Zg(a);n.ports[0].postMessage({status:"done",eventId:r,eventType:s,response:l})}_subscribe(e,n){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(n)}_unsubscribe(e,n){this.handlersMap[e]&&n&&this.handlersMap[e].delete(n),(!n||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}ps.receivers=[];/**
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
 */function Ui(t="",e=10){let n="";for(let r=0;r<e;r++)n+=Math.floor(Math.random()*10);return t+n}/**
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
 */class em{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,n,r=50){const s=typeof MessageChannel<"u"?new MessageChannel:null;if(!s)throw new Error("connection_unavailable");let i,o;return new Promise((a,l)=>{const c=Ui("",20);s.port1.start();const u=setTimeout(()=>{l(new Error("unsupported_event"))},r);o={messageChannel:s,onMessage(f){const d=f;if(d.data.eventId===c)switch(d.data.status){case"ack":clearTimeout(u),i=setTimeout(()=>{l(new Error("timeout"))},3e3);break;case"done":clearTimeout(i),a(d.data.response);break;default:clearTimeout(u),clearTimeout(i),l(new Error("invalid_response"));break}}},this.handlers.add(o),s.port1.addEventListener("message",o.onMessage),this.target.postMessage({eventType:e,eventId:c,data:n},[s.port2])}).finally(()=>{o&&this.removeMessageHandler(o)})}}/**
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
 */function it(){return window}function tm(t){it().location.href=t}/**
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
 */function wc(){return typeof it().WorkerGlobalScope<"u"&&typeof it().importScripts=="function"}async function nm(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function rm(){var t;return((t=navigator==null?void 0:navigator.serviceWorker)==null?void 0:t.controller)||null}function sm(){return wc()?self:null}/**
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
 */const Sc="firebaseLocalStorageDb",im=1,Yr="firebaseLocalStorage",Tc="fbase_key";class br{constructor(e){this.request=e}toPromise(){return new Promise((e,n)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{n(this.request.error)})})}}function gs(t,e){return t.transaction([Yr],e?"readwrite":"readonly").objectStore(Yr)}function om(){const t=indexedDB.deleteDatabase(Sc);return new br(t).toPromise()}function ai(){const t=indexedDB.open(Sc,im);return new Promise((e,n)=>{t.addEventListener("error",()=>{n(t.error)}),t.addEventListener("upgradeneeded",()=>{const r=t.result;try{r.createObjectStore(Yr,{keyPath:Tc})}catch(s){n(s)}}),t.addEventListener("success",async()=>{const r=t.result;r.objectStoreNames.contains(Yr)?e(r):(r.close(),await om(),e(await ai()))})})}async function oa(t,e,n){const r=gs(t,!0).put({[Tc]:e,value:n});return new br(r).toPromise()}async function am(t,e){const n=gs(t,!1).get(e),r=await new br(n).toPromise();return r===void 0?null:r.value}function aa(t,e){const n=gs(t,!0).delete(e);return new br(n).toPromise()}const lm=800,cm=3;class Cc{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await ai(),this.db)}async _withRetries(e){let n=0;for(;;)try{const r=await this._openDb();return await e(r)}catch(r){if(n++>cm)throw r;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return wc()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=ps._getInstance(sm()),this.receiver._subscribe("keyChanged",async(e,n)=>({keyProcessed:(await this._poll()).includes(n.key)})),this.receiver._subscribe("ping",async(e,n)=>["keyChanged"])}async initializeSender(){var n,r;if(this.activeServiceWorker=await nm(),!this.activeServiceWorker)return;this.sender=new em(this.activeServiceWorker);const e=await this.sender._send("ping",{},800);e&&(n=e[0])!=null&&n.fulfilled&&(r=e[0])!=null&&r.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||rm()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;const e=await ai();return await oa(e,Jr,"1"),await aa(e,Jr),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,n){return this._withPendingWrite(async()=>(await this._withRetries(r=>oa(r,e,n)),this.localCache[e]=n,this.notifyServiceWorker(e)))}async _get(e){const n=await this._withRetries(r=>am(r,e));return this.localCache[e]=n,n}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(n=>aa(n,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(s=>{const i=gs(s,!1).getAll();return new br(i).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const n=[],r=new Set;if(e.length!==0)for(const{fbase_key:s,value:i}of e)r.add(s),JSON.stringify(this.localCache[s])!==JSON.stringify(i)&&(this.notifyListeners(s,i),n.push(s));for(const s of Object.keys(this.localCache))this.localCache[s]&&!r.has(s)&&(this.notifyListeners(s,null),n.push(s));return n}notifyListeners(e,n){this.localCache[e]=n;const r=this.listeners[e];if(r)for(const s of Array.from(r))s(n)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),lm)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,n){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}Cc.type="LOCAL";const um=Cc;new yr(3e4,6e4);/**
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
 */function fm(t,e){return e?_t(e):(B(t._popupRedirectResolver,t,"argument-error"),t._popupRedirectResolver)}/**
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
 */class Fi extends Mi{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return Tn(e,this._buildIdpRequest())}_linkToIdToken(e,n){return Tn(e,this._buildIdpRequest(n))}_getReauthenticationResolver(e){return Tn(e,this._buildIdpRequest())}_buildIdpRequest(e){const n={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(n.idToken=e),n}}function dm(t){return yc(t.auth,new Fi(t),t.bypassAuthState)}function hm(t){const{auth:e,user:n}=t;return B(n,e,"internal-error"),$g(n,new Fi(t),t.bypassAuthState)}async function pm(t){const{auth:e,user:n}=t;return B(n,e,"internal-error"),Hg(n,new Fi(t),t.bypassAuthState)}/**
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
 */class Ac{constructor(e,n,r,s,i=!1){this.auth=e,this.resolver=r,this.user=s,this.bypassAuthState=i,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(n)?n:[n]}execute(){return new Promise(async(e,n)=>{this.pendingPromise={resolve:e,reject:n};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(r){this.reject(r)}})}async onAuthEvent(e){const{urlResponse:n,sessionId:r,postBody:s,tenantId:i,error:o,type:a}=e;if(o){this.reject(o);return}const l={auth:this.auth,requestUri:n,sessionId:r,tenantId:i||void 0,postBody:s||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(a)(l))}catch(c){this.reject(c)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return dm;case"linkViaPopup":case"linkViaRedirect":return pm;case"reauthViaPopup":case"reauthViaRedirect":return hm;default:$e(this.auth,"internal-error")}}resolve(e){It(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){It(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
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
 */const gm=new yr(2e3,1e4);class gn extends Ac{constructor(e,n,r,s,i){super(e,n,s,i),this.provider=r,this.authWindow=null,this.pollId=null,gn.currentPopupAction&&gn.currentPopupAction.cancel(),gn.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return B(e,this.auth,"internal-error"),e}async onExecution(){It(this.filter.length===1,"Popup operations only handle one event");const e=Ui();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(n=>{this.reject(n)}),this.resolver._isIframeWebStorageSupported(this.auth,n=>{n||this.reject(st(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)==null?void 0:e.associatedEvent)||null}cancel(){this.reject(st(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,gn.currentPopupAction=null}pollUserCancellation(){const e=()=>{var n,r;if((r=(n=this.authWindow)==null?void 0:n.window)!=null&&r.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(st(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,gm.get())};e()}}gn.currentPopupAction=null;/**
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
 */const mm="pendingRedirect",Nr=new Map;class _m extends Ac{constructor(e,n,r=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],n,void 0,r),this.eventId=null}async execute(){let e=Nr.get(this.auth._key());if(!e){try{const r=await ym(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(r)}catch(n){e=()=>Promise.reject(n)}Nr.set(this.auth._key(),e)}return this.bypassAuthState||Nr.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const n=await this.auth._redirectUserForId(e.eventId);if(n)return this.user=n,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function ym(t,e){const n=Em(e),r=bm(t);if(!await r._isAvailable())return!1;const s=await r._get(n)==="true";return await r._remove(n),s}function vm(t,e){Nr.set(t._key(),e)}function bm(t){return _t(t._redirectPersistence)}function Em(t){return kr(mm,t.config.apiKey,t.name)}async function Im(t,e,n=!1){if(Ze(t.app))return Promise.reject(jt(t));const r=Dn(t),s=fm(r,e),o=await new _m(r,s,n).execute();return o&&!n&&(delete o.user._redirectEventId,await r._persistUserIfCurrent(o.user),await r._setRedirectUser(null,e)),o}/**
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
 */const wm=600*1e3;class Sm{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let n=!1;return this.consumers.forEach(r=>{this.isEventForConsumer(e,r)&&(n=!0,this.sendToConsumer(e,r),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!Tm(e)||(this.hasHandledPotentialRedirect=!0,n||(this.queuedRedirectEvent=e,n=!0)),n}sendToConsumer(e,n){var r;if(e.error&&!Rc(e)){const s=((r=e.error.code)==null?void 0:r.split("auth/")[1])||"internal-error";n.onError(st(this.auth,s))}else n.onAuthEvent(e)}isEventForConsumer(e,n){const r=n.eventId===null||!!e.eventId&&e.eventId===n.eventId;return n.filter.includes(e.type)&&r}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=wm&&this.cachedEventUids.clear(),this.cachedEventUids.has(la(e))}saveEventToCache(e){this.cachedEventUids.add(la(e)),this.lastProcessedEventTime=Date.now()}}function la(t){return[t.type,t.eventId,t.sessionId,t.tenantId].filter(e=>e).join("-")}function Rc({type:t,error:e}){return t==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function Tm(t){switch(t.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return Rc(t);default:return!1}}/**
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
 */async function Cm(t,e={}){return zt(t,"GET","/v1/projects",e)}/**
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
 */const Am=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,Rm=/^https?/;async function Pm(t){if(t.config.emulator)return;const{authorizedDomains:e}=await Cm(t);for(const n of e)try{if(Om(n))return}catch{}$e(t,"unauthorized-domain")}function Om(t){const e=ii(),{protocol:n,hostname:r}=new URL(e);if(t.startsWith("chrome-extension://")){const o=new URL(t);return o.hostname===""&&r===""?n==="chrome-extension:"&&t.replace("chrome-extension://","")===e.replace("chrome-extension://",""):n==="chrome-extension:"&&o.hostname===r}if(!Rm.test(n))return!1;if(Am.test(t))return r===t;const s=t.replace(/\./g,"\\.");return new RegExp("^(.+\\."+s+"|"+s+")$","i").test(r)}/**
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
 */const km=new yr(3e4,6e4);function ca(){const t=it().___jsl;if(t!=null&&t.H){for(const e of Object.keys(t.H))if(t.H[e].r=t.H[e].r||[],t.H[e].L=t.H[e].L||[],t.H[e].r=[...t.H[e].L],t.CP)for(let n=0;n<t.CP.length;n++)t.CP[n]=null}}function Nm(t){return new Promise((e,n)=>{var s,i,o;function r(){ca(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{ca(),n(st(t,"network-request-failed"))},timeout:km.get()})}if((i=(s=it().gapi)==null?void 0:s.iframes)!=null&&i.Iframe)e(gapi.iframes.getContext());else if((o=it().gapi)!=null&&o.load)r();else{const a=Sg("iframefcb");return it()[a]=()=>{gapi.load?r():n(st(t,"network-request-failed"))},hc(`${wg()}?onload=${a}`).catch(l=>n(l))}}).catch(e=>{throw Dr=null,e})}let Dr=null;function Dm(t){return Dr=Dr||Nm(t),Dr}/**
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
 */const xm=new yr(5e3,15e3),Mm="__/auth/iframe",Lm="emulator/auth/iframe",Um={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},Fm=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function Vm(t){const e=t.config;B(e.authDomain,t,"auth-domain-config-required");const n=e.emulator?Ni(e,Lm):`https://${t.config.authDomain}/${Mm}`,r={apiKey:e.apiKey,appName:t.name,v:_r},s=Fm.get(t.config.apiHost);s&&(r.eid=s);const i=t._getFrameworks();return i.length&&(r.fw=i.join(",")),`${n}?${mr(r).slice(1)}`}async function Bm(t){const e=await Dm(t),n=it().gapi;return B(n,t,"internal-error"),e.open({where:document.body,url:Vm(t),messageHandlersFilter:n.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:Um,dontclear:!0},r=>new Promise(async(s,i)=>{await r.restyle({setHideOnLeave:!1});const o=st(t,"network-request-failed"),a=it().setTimeout(()=>{i(o)},xm.get());function l(){it().clearTimeout(a),s(r)}r.ping(l).then(l,()=>{i(o)})}))}/**
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
 */const Hm={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},$m=500,jm=600,Wm="_blank",Km="http://localhost";class ua{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function Gm(t,e,n,r=$m,s=jm){const i=Math.max((window.screen.availHeight-s)/2,0).toString(),o=Math.max((window.screen.availWidth-r)/2,0).toString();let a="";const l={...Hm,width:r.toString(),height:s.toString(),top:i,left:o},c=Ie().toLowerCase();n&&(a=oc(c)?Wm:n),sc(c)&&(e=e||Km,l.scrollbars="yes");const u=Object.entries(l).reduce((d,[g,v])=>`${d}${g}=${v},`,"");if(pg(c)&&a!=="_self")return zm(e||"",a),new ua(null);const f=window.open(e||"",a,u);B(f,t,"popup-blocked");try{f.focus()}catch{}return new ua(f)}function zm(t,e){const n=document.createElement("a");n.href=t,n.target=e;const r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),n.dispatchEvent(r)}/**
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
 */const qm="__/auth/handler",Jm="emulator/auth/handler",Ym=encodeURIComponent("fac");async function fa(t,e,n,r,s,i){B(t.config.authDomain,t,"auth-domain-config-required"),B(t.config.apiKey,t,"invalid-api-key");const o={apiKey:t.config.apiKey,appName:t.name,authType:n,redirectUrl:r,v:_r,eventId:s};if(e instanceof mc){e.setDefaultLanguage(t.languageCode),o.providerId=e.providerId||"",Mh(e.getCustomParameters())||(o.customParameters=JSON.stringify(e.getCustomParameters()));for(const[u,f]of Object.entries({}))o[u]=f}if(e instanceof vr){const u=e.getScopes().filter(f=>f!=="");u.length>0&&(o.scopes=u.join(","))}t.tenantId&&(o.tid=t.tenantId);const a=o;for(const u of Object.keys(a))a[u]===void 0&&delete a[u];const l=await t._getAppCheckToken(),c=l?`#${Ym}=${encodeURIComponent(l)}`:"";return`${Xm(t)}?${mr(a).slice(1)}${c}`}function Xm({config:t}){return t.emulator?Ni(t,Jm):`https://${t.authDomain}/${qm}`}/**
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
 */const Us="webStorageSupport";class Qm{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=Ic,this._completeRedirectFn=Im,this._overrideRedirectResult=vm}async _openPopup(e,n,r,s){var o;It((o=this.eventManagers[e._key()])==null?void 0:o.manager,"_initialize() not called before _openPopup()");const i=await fa(e,n,r,ii(),s);return Gm(e,i,Ui())}async _openRedirect(e,n,r,s){await this._originValidation(e);const i=await fa(e,n,r,ii(),s);return tm(i),new Promise(()=>{})}_initialize(e){const n=e._key();if(this.eventManagers[n]){const{manager:s,promise:i}=this.eventManagers[n];return s?Promise.resolve(s):(It(i,"If manager is not set, promise should be"),i)}const r=this.initAndGetManager(e);return this.eventManagers[n]={promise:r},r.catch(()=>{delete this.eventManagers[n]}),r}async initAndGetManager(e){const n=await Bm(e),r=new Sm(e);return n.register("authEvent",s=>(B(s==null?void 0:s.authEvent,e,"invalid-auth-event"),{status:r.onEvent(s.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:r},this.iframes[e._key()]=n,r}_isIframeWebStorageSupported(e,n){this.iframes[e._key()].send(Us,{type:Us},s=>{var o;const i=(o=s==null?void 0:s[0])==null?void 0:o[Us];i!==void 0&&n(!!i),$e(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const n=e._key();return this.originValidationPromises[n]||(this.originValidationPromises[n]=Pm(e)),this.originValidationPromises[n]}get _shouldInitProactively(){return fc()||ic()||xi()}}const Zm=Qm;var da="@firebase/auth",ha="1.12.1";/**
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
 */class e_{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)==null?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const n=this.auth.onIdTokenChanged(r=>{e((r==null?void 0:r.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,n),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const n=this.internalListeners.get(e);n&&(this.internalListeners.delete(e),n(),this.updateProactiveRefresh())}assertAuthConfigured(){B(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
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
 */function t_(t){switch(t){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function n_(t){or(new kn("auth",(e,{options:n})=>{const r=e.getProvider("app").getImmediate(),s=e.getProvider("heartbeat"),i=e.getProvider("app-check-internal"),{apiKey:o,authDomain:a}=r.options;B(o&&!o.includes(":"),"invalid-api-key",{appName:r.name});const l={apiKey:o,authDomain:a,clientPlatform:t,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:dc(t)},c=new bg(r,s,i,l);return Og(c,n),c},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,n,r)=>{e.getProvider("auth-internal").initialize()})),or(new kn("auth-internal",e=>{const n=Dn(e.getProvider("auth").getImmediate());return(r=>new e_(r))(n)},"PRIVATE").setInstantiationMode("EXPLICIT")),In(da,ha,t_(t)),In(da,ha,"esm2020")}/**
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
 */const r_=300,s_=$l("authIdTokenMaxAge")||r_;let pa=null;const i_=t=>async e=>{const n=e&&await e.getIdTokenResult(),r=n&&(new Date().getTime()-Date.parse(n.issuedAtTime))/1e3;if(r&&r>s_)return;const s=n==null?void 0:n.token;pa!==s&&(pa=s,await fetch(t,{method:s?"POST":"DELETE",headers:s?{Authorization:`Bearer ${s}`}:{}}))};function o_(t=Up()){const e=Gl(t,"auth");if(e.isInitialized())return e.getImmediate();const n=Pg(t,{popupRedirectResolver:Zm,persistence:[um,Qg,Ic]}),r=$l("authTokenSyncURL");if(r&&typeof isSecureContext=="boolean"&&isSecureContext){const i=new URL(r,location.origin);if(location.origin===i.origin){const o=i_(i.toString());zg(n,o,()=>o(n.currentUser)),Gg(n,a=>o(a))}}const s=vh("auth");return s&&kg(n,`http://${s}`),n}function a_(){var t;return((t=document.getElementsByTagName("head"))==null?void 0:t[0])??document}Eg({loadJS(t){return new Promise((e,n)=>{const r=document.createElement("script");r.setAttribute("src",t),r.onload=e,r.onerror=s=>{const i=st("internal-error");i.customData=s,n(i)},r.type="text/javascript",r.charset="UTF-8",a_().appendChild(r)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});n_("Browser");var l_="firebase",c_="12.10.0";/**
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
 */In(l_,c_,"app");const u_={apiKey:"AIzaSyBO9XFUh2gp-0_lN7qOkmAIeg9YBg5zE28",authDomain:"tobbythebutler.firebaseapp.com",projectId:"tobbythebutler",appId:"1:1017368311430:web:64ad0ff74b38b63f494307"},f_=zl(u_),on=o_(f_),d_="/api".replace(/\/$/,""),Ot=(t={})=>{const e=new URLSearchParams;Object.entries(t).forEach(([r,s])=>{s==null||s===""||e.set(r,String(s))});const n=e.toString();return n?`?${n}`:""},h_=async()=>{const t=on.currentUser;if(!t)throw new Error("Not authenticated");return t.getIdToken(!0)},Oe=async(t,e={})=>{const n=await h_(),r=await fetch(`${d_}${t}`,{method:e.method||"GET",headers:{"Content-Type":"application/json",Authorization:`Bearer ${n}`,...e.headers||{}},body:e.body?JSON.stringify(e.body):void 0}),s=await r.json().catch(()=>({}));if(!r.ok)throw new Error((s==null?void 0:s.message)||`Request failed (${r.status})`);return s},p_=async(t,e)=>(await Kg(on,t,e),li()),g_=async()=>{await Jg(on)},li=async()=>{var r,s;const t=on.currentUser;if(!t)return!1;const e=await t.getIdTokenResult(!0);if(((r=e==null?void 0:e.claims)==null?void 0:r.admin)!==!0)return!1;const n=await Oe("/auth/me");return String(((s=n==null?void 0:n.user)==null?void 0:s.role)||"").toLowerCase()==="admin"},xe={getOverview:t=>Oe(`/admin/overview${Ot(t)}`),listUsers:t=>Oe(`/admin/users${Ot(t)}`),getUser:t=>Oe(`/admin/users/${encodeURIComponent(String(t))}`),freezeUser:(t,e)=>Oe(`/admin/users/${encodeURIComponent(String(t))}/freeze`,{method:"POST",body:e}),unfreezeUser:(t,e)=>Oe(`/admin/users/${encodeURIComponent(String(t))}/unfreeze`,{method:"POST",body:e}),getBillingSummary:t=>Oe(`/admin/billing/summary${Ot(t)}`),listCreditAccounts:t=>Oe(`/admin/credits/accounts${Ot(t)}`),listCreditOrders:t=>Oe(`/admin/credits/orders${Ot(t)}`),listCreditLedger:t=>Oe(`/admin/credits/ledger${Ot(t)}`),adjustCredits:t=>Oe("/admin/credits/adjust",{method:"POST",body:t}),listEvents:t=>Oe(`/admin/logs/events${Ot(t)}`),listErrors:t=>Oe(`/admin/logs/errors${Ot(t)}`)},m_={class:"login-page"},__={style:{display:"grid",gap:"10px"}},y_={key:0,style:{color:"#b91c1c"}},v_={__name:"LoginPage",setup(t){const e=Ll(),n=ae(""),r=Kt({email:"",password:""}),s=async()=>{n.value="";try{if(!await p_(r.email,r.password)){n.value="Login succeeded, but this account is not admin (missing admin claim).";return}e.push("/overview")}catch(i){n.value=(i==null?void 0:i.message)||"Firebase login failed."}};return(i,o)=>(G(),z("div",m_,[m("form",{class:"login-card",onSubmit:Il(s,["prevent"])},[o[3]||(o[3]=m("h2",{style:{"margin-top":"0"}},"Admin Console Login",-1)),o[4]||(o[4]=m("p",{style:{color:"var(--muted)"}},"Use Firebase email/password account with admin claim.",-1)),m("div",__,[Ve(m("input",{"onUpdate:modelValue":o[0]||(o[0]=a=>r.email=a),type:"email",placeholder:"Admin Email",required:""},null,512),[[Bt,r.email]]),Ve(m("input",{"onUpdate:modelValue":o[1]||(o[1]=a=>r.password=a),type:"password",placeholder:"Password",required:""},null,512),[[Bt,r.password]]),o[2]||(o[2]=m("button",{class:"primary",type:"submit"},"Enter",-1))]),n.value?(G(),z("p",y_,L(n.value),1)):Ci("",!0)],32)]))}},b_={class:"admin-app"},E_={class:"admin-sidebar"},I_={class:"main-wrap"},w_={class:"content"},S_={__name:"AdminShell",setup(t){const e=Ll(),n=async()=>{await g_(),e.push("/login")};return(r,s)=>{const i=js("router-link"),o=js("router-view");return G(),z("div",b_,[m("aside",E_,[s[4]||(s[4]=m("div",{class:"brand"},"Handout Admin",-1)),le(i,{class:"nav-link",to:"/overview","active-class":"active"},{default:Bn(()=>[...s[0]||(s[0]=[gt("Overview",-1)])]),_:1}),le(i,{class:"nav-link",to:"/users","active-class":"active"},{default:Bn(()=>[...s[1]||(s[1]=[gt("Users & Roles",-1)])]),_:1}),le(i,{class:"nav-link",to:"/billing","active-class":"active"},{default:Bn(()=>[...s[2]||(s[2]=[gt("Billing & Credits",-1)])]),_:1}),le(i,{class:"nav-link",to:"/logs","active-class":"active"},{default:Bn(()=>[...s[3]||(s[3]=[gt("Ops Logs",-1)])]),_:1})]),m("div",I_,[m("header",{class:"topbar"},[s[5]||(s[5]=m("strong",null,"Admin Supervision MVP",-1)),m("button",{onClick:n},"Logout")]),m("main",w_,[le(o)])])])}}},T_={class:"range-bar panel"},C_=["value"],A_=["value"],ms={__name:"DateRangeBar",props:{modelValue:String,from:String,to:String},emits:["update:modelValue","update:from","update:to"],setup(t){return(e,n)=>(G(),z("div",T_,[m("button",{class:et({primary:t.modelValue==="today"}),onClick:n[0]||(n[0]=r=>e.$emit("update:modelValue","today"))},"Today",2),m("button",{class:et({primary:t.modelValue==="7d"}),onClick:n[1]||(n[1]=r=>e.$emit("update:modelValue","7d"))},"7d",2),m("button",{class:et({primary:t.modelValue==="30d"}),onClick:n[2]||(n[2]=r=>e.$emit("update:modelValue","30d"))},"30d",2),m("button",{class:et({primary:t.modelValue==="custom"}),onClick:n[3]||(n[3]=r=>e.$emit("update:modelValue","custom"))},"Custom",2),t.modelValue==="custom"?(G(),z(ue,{key:0},[m("input",{type:"date",value:t.from,onInput:n[4]||(n[4]=r=>e.$emit("update:from",r.target.value))},null,40,C_),m("input",{type:"date",value:t.to,onInput:n[5]||(n[5]=r=>e.$emit("update:to",r.target.value))},null,40,A_)],64)):Ci("",!0)]))}},R_={class:"kpi-grid"},P_={class:"kpi-title"},O_={class:"kpi-value"},k_={class:"row"},N_={class:"col panel"},D_={class:"col panel"},x_={__name:"OverviewPage",setup(t){const e=ae("7d"),n=ae(""),r=ae(""),s=ae({}),i=c=>c.toISOString().slice(0,10),o=()=>{const c=new Date;if(e.value==="today")return{from:i(c),to:i(c)};if(e.value==="7d"){const u=new Date(c);return u.setDate(u.getDate()-6),{from:i(u),to:i(c)}}if(e.value==="30d"){const u=new Date(c);return u.setDate(u.getDate()-29),{from:i(u),to:i(c)}}return{from:n.value,to:r.value}},a=async()=>{s.value=await xe.getOverview(o())},l=Re(()=>{var c,u,f,d;return[{label:"DAU",value:((c=s.value.kpis)==null?void 0:c.dau)||0},{label:"WAU",value:((u=s.value.kpis)==null?void 0:u.wau)||0},{label:"7d retention",value:`${((f=s.value.kpis)==null?void 0:f.retention_7d)||0}%`},{label:"Cost estimate",value:`$${((d=s.value.cost_overview)==null?void 0:d.cost_estimate_usd)||0}`}]});return Vt([e,n,r],a),hr(a),(c,u)=>{var f,d,g,v;return G(),z("section",null,[le(ms,{modelValue:e.value,"onUpdate:modelValue":u[0]||(u[0]=y=>e.value=y),from:n.value,"onUpdate:from":u[1]||(u[1]=y=>n.value=y),to:r.value,"onUpdate:to":u[2]||(u[2]=y=>r.value=y)},null,8,["modelValue","from","to"]),m("div",R_,[(G(!0),z(ue,null,tt(l.value,y=>(G(),z("div",{class:"panel",key:y.label},[m("div",P_,L(y.label),1),m("div",O_,L(y.value),1)]))),128))]),m("div",k_,[m("div",N_,[u[3]||(u[3]=m("h3",null,"Behavior Funnel",-1)),m("ul",null,[(G(!0),z(ue,null,tt(s.value.funnel||{},(y,S)=>(G(),z("li",{key:S},L(S)+": "+L(y),1))),128))])]),m("div",D_,[u[4]||(u[4]=m("h3",null,"System Health",-1)),m("ul",null,[m("li",null,"API success: "+L(((f=s.value.system_health)==null?void 0:f.api_success_rate)||0)+"%",1),m("li",null,"P95 latency: "+L(((d=s.value.system_health)==null?void 0:d.p95_ms)||0)+"ms",1),m("li",null,"Frontend errors: "+L(((g=s.value.system_health)==null?void 0:g.frontend_errors)||0),1),m("li",null,"Function failures: "+L(((v=s.value.system_health)==null?void 0:v.function_failures)||0),1)])])])])}}},M_={class:"filter-row panel"},L_={class:"panel table-wrap"},U_=["onClick"],F_=["onClick"],V_=["onClick"],B_={key:0,class:"drawer"},H_={__name:"UsersPage",setup(t){const e=ae("7d"),n=ae(""),r=ae(""),s=ae([]),i=ae(null),o=Kt({role:"",status:"",paid:""}),a=g=>g.toISOString().slice(0,10),l=()=>{const g=new Date;if(e.value==="today")return{from:a(g),to:a(g)};if(e.value==="7d"){const v=new Date(g);return v.setDate(v.getDate()-6),{from:a(v),to:a(g)}}if(e.value==="30d"){const v=new Date(g);return v.setDate(v.getDate()-29),{from:a(v),to:a(g)}}return{from:n.value,to:r.value}},c=async()=>{const g=await xe.listUsers({...l(),...o,page:1,page_size:100});s.value=g.items||[]},u=async g=>{i.value=await xe.getUser(g)},f=async g=>{await xe.freezeUser(g,{reason:"manual_freeze"}),await c()},d=async g=>{await xe.unfreezeUser(g,{reason:"manual_unfreeze"}),await c()};return Vt([e,n,r],c),hr(c),(g,v)=>(G(),z("section",null,[le(ms,{modelValue:e.value,"onUpdate:modelValue":v[0]||(v[0]=y=>e.value=y),from:n.value,"onUpdate:from":v[1]||(v[1]=y=>n.value=y),to:r.value,"onUpdate:to":v[2]||(v[2]=y=>r.value=y)},null,8,["modelValue","from","to"]),m("div",M_,[Ve(m("select",{"onUpdate:modelValue":v[3]||(v[3]=y=>o.role=y)},[...v[7]||(v[7]=[gf('<option value="">All roles</option><option value="admin">admin</option><option value="pm_po">pm_po</option><option value="tt">tt</option><option value="sp">sp</option>',5)])],512),[[Cs,o.role]]),Ve(m("select",{"onUpdate:modelValue":v[4]||(v[4]=y=>o.status=y)},[...v[8]||(v[8]=[m("option",{value:""},"All status",-1),m("option",{value:"active"},"active",-1),m("option",{value:"frozen"},"frozen",-1)])],512),[[Cs,o.status]]),Ve(m("select",{"onUpdate:modelValue":v[5]||(v[5]=y=>o.paid=y)},[...v[9]||(v[9]=[m("option",{value:""},"All paid",-1),m("option",{value:"true"},"paid",-1),m("option",{value:"false"},"free",-1)])],512),[[Cs,o.paid]]),m("button",{class:"primary",onClick:c},"Refresh")]),m("div",L_,[m("table",null,[v[10]||(v[10]=m("thead",null,[m("tr",null,[m("th",null,"user_id"),m("th",null,"email"),m("th",null,"account_type"),m("th",null,"status"),m("th",null,"last_active_at"),m("th",null,"created_at"),m("th",null,"actions")])],-1)),m("tbody",null,[(G(!0),z(ue,null,tt(s.value,y=>(G(),z("tr",{key:y.user_id},[m("td",null,[m("a",{href:"#",onClick:Il(S=>u(y.user_id),["prevent"])},L(y.user_id),9,U_)]),m("td",null,L(y.email),1),m("td",null,L(y.account_type),1),m("td",null,L(y.status),1),m("td",null,L(y.last_active_at),1),m("td",null,L(y.created_at),1),m("td",null,[y.status!=="frozen"?(G(),z("button",{key:0,class:"danger",onClick:S=>f(y.user_id)},"Freeze",8,F_)):(G(),z("button",{key:1,class:"success",onClick:S=>d(y.user_id)},"Unfreeze",8,V_))])]))),128))])])]),i.value?(G(),z("aside",B_,[v[15]||(v[15]=m("h3",null,"User Detail",-1)),m("p",null,[v[11]||(v[11]=m("strong",null,"ID:",-1)),gt(" "+L(i.value.user_id),1)]),m("p",null,[v[12]||(v[12]=m("strong",null,"Email:",-1)),gt(" "+L(i.value.email_masked),1)]),m("p",null,[v[13]||(v[13]=m("strong",null,"Status:",-1)),gt(" "+L(i.value.status),1)]),m("p",null,[v[14]||(v[14]=m("strong",null,"Linked assets:",-1)),gt(" "+L(i.value.linked_assets),1)]),v[16]||(v[16]=m("h4",null,"Recent Timeline",-1)),m("ul",null,[(G(!0),z(ue,null,tt(i.value.recent_timeline||[],y=>(G(),z("li",{key:y.id},L(y.created_at)+" - "+L(y.event_type),1))),128))]),m("button",{onClick:v[6]||(v[6]=y=>i.value=null)},"Close")])):Ci("",!0)]))}},$_={class:"kpi-grid"},j_={class:"kpi-title"},W_={class:"kpi-value"},K_={class:"panel",style:{"margin-top":"12px"}},G_={class:"filter-row"},z_={class:"panel table-wrap",style:{"margin-top":"12px"}},q_={class:"row"},J_={class:"col panel table-wrap"},Y_={class:"col panel table-wrap"},X_={__name:"BillingPage",setup(t){const e=ae("30d"),n=ae(""),r=ae(""),s=ae({}),i=ae([]),o=ae([]),a=ae([]),l=Kt({sp_id:"",delta:0,reason:""}),c=v=>v.toISOString().slice(0,10),u=()=>{const v=new Date;if(e.value==="today")return{from:c(v),to:c(v)};if(e.value==="7d"){const y=new Date(v);return y.setDate(y.getDate()-6),{from:c(y),to:c(v)}}if(e.value==="30d"){const y=new Date(v);return y.setDate(y.getDate()-29),{from:c(y),to:c(v)}}return{from:n.value,to:r.value}},f=async()=>{const v=u();s.value=await xe.getBillingSummary(v),i.value=(await xe.listCreditAccounts({page:1,page_size:200})).items||[],o.value=(await xe.listCreditOrders(v)).items||[],a.value=(await xe.listCreditLedger(v)).items||[]},d=async()=>{await xe.adjustCredits({sp_id:l.sp_id,delta:Number(l.delta||0),reason:l.reason,confirm_token:"CONFIRM"}),await f()},g=Re(()=>{var v,y,S,x;return[{label:"MRR (estimate)",value:`$${((v=s.value.plan_overview)==null?void 0:v.mrr_estimate_usd)||0}`},{label:"Conversion rate",value:`${((y=s.value.plan_overview)==null?void 0:y.conversion_rate)||0}%`},{label:"Total purchased",value:((S=s.value.sp_credit_overview)==null?void 0:S.total_purchased)||0},{label:"Total balance",value:((x=s.value.sp_credit_overview)==null?void 0:x.total_balance)||0}]});return Vt([e,n,r],f),hr(f),(v,y)=>(G(),z("section",null,[le(ms,{modelValue:e.value,"onUpdate:modelValue":y[0]||(y[0]=S=>e.value=S),from:n.value,"onUpdate:from":y[1]||(y[1]=S=>n.value=S),to:r.value,"onUpdate:to":y[2]||(y[2]=S=>r.value=S)},null,8,["modelValue","from","to"]),m("div",$_,[(G(!0),z(ue,null,tt(g.value,S=>(G(),z("div",{class:"panel",key:S.label},[m("div",j_,L(S.label),1),m("div",W_,L(S.value),1)]))),128))]),m("div",K_,[y[6]||(y[6]=m("h3",null,"Credit Reconciliation Tool",-1)),m("div",G_,[Ve(m("input",{"onUpdate:modelValue":y[3]||(y[3]=S=>l.sp_id=S),placeholder:"sp_id"},null,512),[[Bt,l.sp_id]]),Ve(m("input",{"onUpdate:modelValue":y[4]||(y[4]=S=>l.delta=S),type:"number",placeholder:"delta"},null,512),[[Bt,l.delta,void 0,{number:!0}]]),Ve(m("input",{"onUpdate:modelValue":y[5]||(y[5]=S=>l.reason=S),placeholder:"reason"},null,512),[[Bt,l.reason]]),m("button",{class:"danger",onClick:d},"Adjust (CONFIRM)")])]),m("div",z_,[y[8]||(y[8]=m("h3",null,"Credit Accounts",-1)),m("table",null,[y[7]||(y[7]=m("thead",null,[m("tr",null,[m("th",null,"sp_id"),m("th",null,"balance"),m("th",null,"lifetime_purchased"),m("th",null,"lifetime_used"),m("th",null,"updated_at")])],-1)),m("tbody",null,[(G(!0),z(ue,null,tt(i.value,S=>(G(),z("tr",{key:S.sp_id},[m("td",null,L(S.sp_id),1),m("td",null,L(S.balance),1),m("td",null,L(S.lifetime_purchased),1),m("td",null,L(S.lifetime_used),1),m("td",null,L(S.updated_at),1)]))),128))])])]),m("div",q_,[m("div",J_,[y[10]||(y[10]=m("h3",null,"Orders",-1)),m("table",null,[y[9]||(y[9]=m("thead",null,[m("tr",null,[m("th",null,"order_id"),m("th",null,"sp_id"),m("th",null,"credits"),m("th",null,"amount"),m("th",null,"status"),m("th",null,"provider"),m("th",null,"created_at")])],-1)),m("tbody",null,[(G(!0),z(ue,null,tt(o.value,S=>(G(),z("tr",{key:S.id},[m("td",null,L(S.id),1),m("td",null,L(S.sp_id),1),m("td",null,L(S.credits),1),m("td",null,L(S.amount),1),m("td",null,L(S.status),1),m("td",null,L(S.provider),1),m("td",null,L(S.created_at),1)]))),128))])])]),m("div",Y_,[y[12]||(y[12]=m("h3",null,"Ledger",-1)),m("table",null,[y[11]||(y[11]=m("thead",null,[m("tr",null,[m("th",null,"entry_id"),m("th",null,"sp_id"),m("th",null,"entry_type"),m("th",null,"delta"),m("th",null,"balance_after"),m("th",null,"source_type"),m("th",null,"source_id")])],-1)),m("tbody",null,[(G(!0),z(ue,null,tt(a.value,S=>(G(),z("tr",{key:S.id},[m("td",null,L(S.id),1),m("td",null,L(S.sp_id),1),m("td",null,L(S.entry_type),1),m("td",null,L(S.delta),1),m("td",null,L(S.balance_after),1),m("td",null,L(S.source_type),1),m("td",null,L(S.source_id),1)]))),128))])])])])]))}},Q_={class:"filter-row panel"},Z_={class:"row"},ey={class:"col panel"},ty={class:"col panel"},ny={class:"col panel"},ry={class:"panel table-wrap",style:{"margin-top":"12px"}},sy={class:"panel table-wrap",style:{"margin-top":"12px"}},iy={__name:"LogsPage",setup(t){const e=ae("7d"),n=ae(""),r=ae(""),s=ae([]),i=ae([]),o=Kt({request_id:"",user_id:"",task_id:""}),a=f=>f.toISOString().slice(0,10),l=()=>{const f=new Date;if(e.value==="today")return{from:a(f),to:a(f)};if(e.value==="7d"){const d=new Date(f);return d.setDate(d.getDate()-6),{from:a(d),to:a(f)}}if(e.value==="30d"){const d=new Date(f);return d.setDate(d.getDate()-29),{from:a(d),to:a(f)}}return{from:n.value,to:r.value}},c=async()=>{const f=l();s.value=(await xe.listEvents({...f,request_id:o.request_id,user_id:o.user_id,task_id:o.task_id,lead_id:o.task_id,order_id:o.task_id})).items||[],i.value=(await xe.listErrors({...f,request_id:o.request_id})).items||[]},u=Re(()=>{const f=i.value.length>20?"warning":"ok",d=i.value.filter(v=>String(v.route||"").includes("callback")).length>3?"warning":"ok",g=s.value.some(v=>{var y;return Number(((y=v.metadata)==null?void 0:y.balance_after)||0)<0})?"critical":"ok";return{errorSpike:f,callbackFailure:d,negativeCredit:g}});return Vt([e,n,r],c),hr(c),(f,d)=>(G(),z("section",null,[le(ms,{modelValue:e.value,"onUpdate:modelValue":d[0]||(d[0]=g=>e.value=g),from:n.value,"onUpdate:from":d[1]||(d[1]=g=>n.value=g),to:r.value,"onUpdate:to":d[2]||(d[2]=g=>r.value=g)},null,8,["modelValue","from","to"]),m("div",Q_,[Ve(m("input",{"onUpdate:modelValue":d[3]||(d[3]=g=>o.request_id=g),placeholder:"request_id"},null,512),[[Bt,o.request_id]]),Ve(m("input",{"onUpdate:modelValue":d[4]||(d[4]=g=>o.user_id=g),placeholder:"user_id"},null,512),[[Bt,o.user_id]]),Ve(m("input",{"onUpdate:modelValue":d[5]||(d[5]=g=>o.task_id=g),placeholder:"task_id / lead_id / order_id"},null,512),[[Bt,o.task_id]]),m("button",{class:"primary",onClick:c},"Search")]),m("div",Z_,[m("div",ey,[d[6]||(d[6]=m("strong",null,"24h error spike:",-1)),m("span",{class:et(`badge ${u.value.errorSpike}`)},L(u.value.errorSpike),3)]),m("div",ty,[d[7]||(d[7]=m("strong",null,"callback failure rate:",-1)),m("span",{class:et(`badge ${u.value.callbackFailure}`)},L(u.value.callbackFailure),3)]),m("div",ny,[d[8]||(d[8]=m("strong",null,"negative credit balance:",-1)),m("span",{class:et(`badge ${u.value.negativeCredit}`)},L(u.value.negativeCredit),3)])]),m("div",ry,[d[10]||(d[10]=m("h3",null,"Event Logs",-1)),m("table",null,[d[9]||(d[9]=m("thead",null,[m("tr",null,[m("th",null,"created_at"),m("th",null,"event_type"),m("th",null,"user_id"),m("th",null,"entity_type"),m("th",null,"entity_id"),m("th",null,"request_id")])],-1)),m("tbody",null,[(G(!0),z(ue,null,tt(s.value,g=>(G(),z("tr",{key:g.id},[m("td",null,L(g.created_at),1),m("td",null,L(g.event_type),1),m("td",null,L(g.user_id),1),m("td",null,L(g.entity_type),1),m("td",null,L(g.entity_id),1),m("td",null,L(g.request_id),1)]))),128))])])]),m("div",sy,[d[12]||(d[12]=m("h3",null,"Error Logs",-1)),m("table",null,[d[11]||(d[11]=m("thead",null,[m("tr",null,[m("th",null,"created_at"),m("th",null,"request_id"),m("th",null,"route"),m("th",null,"error_code"),m("th",null,"retryable")])],-1)),m("tbody",null,[(G(!0),z(ue,null,tt(i.value,g=>(G(),z("tr",{key:g.id},[m("td",null,L(g.created_at),1),m("td",null,L(g.request_id),1),m("td",null,L(g.route),1),m("td",null,L(g.error_code),1),m("td",null,L(g.retryable),1)]))),128))])])])]))}},Pc=uh({history:$d(),routes:[{path:"/login",component:v_,meta:{public:!0}},{path:"/",component:S_,children:[{path:"",redirect:"/overview"},{path:"overview",component:x_},{path:"users",component:H_},{path:"billing",component:X_},{path:"logs",component:iy}]}]}),oy=()=>new Promise(t=>{const e=qg(on,()=>{e(),t()})});Pc.beforeEach(async t=>(await oy(),t.meta.public?on.currentUser&&await li().catch(()=>!1)?"/overview":!0:on.currentUser&&await li().catch(()=>!1)?!0:"/login"));Qf(sd).use(Pc).mount("#app");

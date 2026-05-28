(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))s(r);new MutationObserver(r=>{for(const i of r)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&s(o)}).observe(document,{childList:!0,subtree:!0});function n(r){const i={};return r.integrity&&(i.integrity=r.integrity),r.referrerPolicy&&(i.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?i.credentials="include":r.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function s(r){if(r.ep)return;r.ep=!0;const i=n(r);fetch(r.href,i)}})();/**
* @vue/shared v3.5.29
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/function ui(t){const e=Object.create(null);for(const n of t.split(","))e[n]=1;return n=>n in e}const se={},_n=[],it=()=>{},ga=()=>!1,Zs=t=>t.charCodeAt(0)===111&&t.charCodeAt(1)===110&&(t.charCodeAt(2)>122||t.charCodeAt(2)<97),di=t=>t.startsWith("onUpdate:"),ye=Object.assign,fi=(t,e)=>{const n=t.indexOf(e);n>-1&&t.splice(n,1)},Oc=Object.prototype.hasOwnProperty,X=(t,e)=>Oc.call(t,e),j=Array.isArray,yn=t=>fs(t)==="[object Map]",er=t=>fs(t)==="[object Set]",Hi=t=>fs(t)==="[object Date]",K=t=>typeof t=="function",fe=t=>typeof t=="string",ct=t=>typeof t=="symbol",Z=t=>t!==null&&typeof t=="object",ma=t=>(Z(t)||K(t))&&K(t.then)&&K(t.catch),_a=Object.prototype.toString,fs=t=>_a.call(t),kc=t=>fs(t).slice(8,-1),ya=t=>fs(t)==="[object Object]",hi=t=>fe(t)&&t!=="NaN"&&t[0]!=="-"&&""+parseInt(t,10)===t,Gn=ui(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"),tr=t=>{const e=Object.create(null);return(n=>e[n]||(e[n]=t(n)))},Nc=/-\w/g,Ve=tr(t=>t.replace(Nc,e=>e.slice(1).toUpperCase())),Dc=/\B([A-Z])/g,an=tr(t=>t.replace(Dc,"-$1").toLowerCase()),nr=tr(t=>t.charAt(0).toUpperCase()+t.slice(1)),vr=tr(t=>t?`on${nr(t)}`:""),$t=(t,e)=>!Object.is(t,e),Ts=(t,...e)=>{for(let n=0;n<t.length;n++)t[n](...e)},va=(t,e,n,s=!1)=>{Object.defineProperty(t,e,{configurable:!0,enumerable:!1,writable:s,value:n})},sr=t=>{const e=parseFloat(t);return isNaN(e)?t:e};let ji;const rr=()=>ji||(ji=typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof window<"u"?window:typeof global<"u"?global:{});function pi(t){if(j(t)){const e={};for(let n=0;n<t.length;n++){const s=t[n],r=fe(s)?Uc(s):pi(s);if(r)for(const i in r)e[i]=r[i]}return e}else if(fe(t)||Z(t))return t}const xc=/;(?![^(]*\))/g,Lc=/:([^]+)/,Mc=/\/\*[^]*?\*\//g;function Uc(t){const e={};return t.replace(Mc,"").split(xc).forEach(n=>{if(n){const s=n.split(Lc);s.length>1&&(e[s[0].trim()]=s[1].trim())}}),e}function rt(t){let e="";if(fe(t))e=t;else if(j(t))for(let n=0;n<t.length;n++){const s=rt(t[n]);s&&(e+=s+" ")}else if(Z(t))for(const n in t)t[n]&&(e+=n+" ");return e.trim()}const Fc="itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly",Vc=ui(Fc);function ba(t){return!!t||t===""}function $c(t,e){if(t.length!==e.length)return!1;let n=!0;for(let s=0;n&&s<t.length;s++)n=hs(t[s],e[s]);return n}function hs(t,e){if(t===e)return!0;let n=Hi(t),s=Hi(e);if(n||s)return n&&s?t.getTime()===e.getTime():!1;if(n=ct(t),s=ct(e),n||s)return t===e;if(n=j(t),s=j(e),n||s)return n&&s?$c(t,e):!1;if(n=Z(t),s=Z(e),n||s){if(!n||!s)return!1;const r=Object.keys(t).length,i=Object.keys(e).length;if(r!==i)return!1;for(const o in t){const a=t.hasOwnProperty(o),l=e.hasOwnProperty(o);if(a&&!l||!a&&l||!hs(t[o],e[o]))return!1}}return String(t)===String(e)}function Bc(t,e){return t.findIndex(n=>hs(n,e))}const Ea=t=>!!(t&&t.__v_isRef===!0),P=t=>fe(t)?t:t==null?"":j(t)||Z(t)&&(t.toString===_a||!K(t.toString))?Ea(t)?P(t.value):JSON.stringify(t,Ia,2):String(t),Ia=(t,e)=>Ea(e)?Ia(t,e.value):yn(e)?{[`Map(${e.size})`]:[...e.entries()].reduce((n,[s,r],i)=>(n[br(s,i)+" =>"]=r,n),{})}:er(e)?{[`Set(${e.size})`]:[...e.values()].map(n=>br(n))}:ct(e)?br(e):Z(e)&&!j(e)&&!ya(e)?String(e):e,br=(t,e="")=>{var n;return ct(t)?`Symbol(${(n=t.description)!=null?n:e})`:t};/**
* @vue/reactivity v3.5.29
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/let Ne;class Hc{constructor(e=!1){this.detached=e,this._active=!0,this._on=0,this.effects=[],this.cleanups=[],this._isPaused=!1,this.__v_skip=!0,this.parent=Ne,!e&&Ne&&(this.index=(Ne.scopes||(Ne.scopes=[])).push(this)-1)}get active(){return this._active}pause(){if(this._active){this._isPaused=!0;let e,n;if(this.scopes)for(e=0,n=this.scopes.length;e<n;e++)this.scopes[e].pause();for(e=0,n=this.effects.length;e<n;e++)this.effects[e].pause()}}resume(){if(this._active&&this._isPaused){this._isPaused=!1;let e,n;if(this.scopes)for(e=0,n=this.scopes.length;e<n;e++)this.scopes[e].resume();for(e=0,n=this.effects.length;e<n;e++)this.effects[e].resume()}}run(e){if(this._active){const n=Ne;try{return Ne=this,e()}finally{Ne=n}}}on(){++this._on===1&&(this.prevScope=Ne,Ne=this)}off(){this._on>0&&--this._on===0&&(Ne=this.prevScope,this.prevScope=void 0)}stop(e){if(this._active){this._active=!1;let n,s;for(n=0,s=this.effects.length;n<s;n++)this.effects[n].stop();for(this.effects.length=0,n=0,s=this.cleanups.length;n<s;n++)this.cleanups[n]();if(this.cleanups.length=0,this.scopes){for(n=0,s=this.scopes.length;n<s;n++)this.scopes[n].stop(!0);this.scopes.length=0}if(!this.detached&&this.parent&&!e){const r=this.parent.scopes.pop();r&&r!==this&&(this.parent.scopes[this.index]=r,r.index=this.index)}this.parent=void 0}}}function jc(){return Ne}let oe;const Er=new WeakSet;class wa{constructor(e){this.fn=e,this.deps=void 0,this.depsTail=void 0,this.flags=5,this.next=void 0,this.cleanup=void 0,this.scheduler=void 0,Ne&&Ne.active&&Ne.effects.push(this)}pause(){this.flags|=64}resume(){this.flags&64&&(this.flags&=-65,Er.has(this)&&(Er.delete(this),this.trigger()))}notify(){this.flags&2&&!(this.flags&32)||this.flags&8||Ca(this)}run(){if(!(this.flags&1))return this.fn();this.flags|=2,Wi(this),Ta(this);const e=oe,n=He;oe=this,He=!0;try{return this.fn()}finally{Aa(this),oe=e,He=n,this.flags&=-3}}stop(){if(this.flags&1){for(let e=this.deps;e;e=e.nextDep)_i(e);this.deps=this.depsTail=void 0,Wi(this),this.onStop&&this.onStop(),this.flags&=-2}}trigger(){this.flags&64?Er.add(this):this.scheduler?this.scheduler():this.runIfDirty()}runIfDirty(){Vr(this)&&this.run()}get dirty(){return Vr(this)}}let Sa=0,zn,qn;function Ca(t,e=!1){if(t.flags|=8,e){t.next=qn,qn=t;return}t.next=zn,zn=t}function gi(){Sa++}function mi(){if(--Sa>0)return;if(qn){let e=qn;for(qn=void 0;e;){const n=e.next;e.next=void 0,e.flags&=-9,e=n}}let t;for(;zn;){let e=zn;for(zn=void 0;e;){const n=e.next;if(e.next=void 0,e.flags&=-9,e.flags&1)try{e.trigger()}catch(s){t||(t=s)}e=n}}if(t)throw t}function Ta(t){for(let e=t.deps;e;e=e.nextDep)e.version=-1,e.prevActiveLink=e.dep.activeLink,e.dep.activeLink=e}function Aa(t){let e,n=t.depsTail,s=n;for(;s;){const r=s.prevDep;s.version===-1?(s===n&&(n=r),_i(s),Wc(s)):e=s,s.dep.activeLink=s.prevActiveLink,s.prevActiveLink=void 0,s=r}t.deps=e,t.depsTail=n}function Vr(t){for(let e=t.deps;e;e=e.nextDep)if(e.dep.version!==e.version||e.dep.computed&&(Ra(e.dep.computed)||e.dep.version!==e.version))return!0;return!!t._dirty}function Ra(t){if(t.flags&4&&!(t.flags&16)||(t.flags&=-17,t.globalVersion===ns)||(t.globalVersion=ns,!t.isSSR&&t.flags&128&&(!t.deps&&!t._dirty||!Vr(t))))return;t.flags|=2;const e=t.dep,n=oe,s=He;oe=t,He=!0;try{Ta(t);const r=t.fn(t._value);(e.version===0||$t(r,t._value))&&(t.flags|=128,t._value=r,e.version++)}catch(r){throw e.version++,r}finally{oe=n,He=s,Aa(t),t.flags&=-3}}function _i(t,e=!1){const{dep:n,prevSub:s,nextSub:r}=t;if(s&&(s.nextSub=r,t.prevSub=void 0),r&&(r.prevSub=s,t.nextSub=void 0),n.subs===t&&(n.subs=s,!s&&n.computed)){n.computed.flags&=-5;for(let i=n.computed.deps;i;i=i.nextDep)_i(i,!0)}!e&&!--n.sc&&n.map&&n.map.delete(n.key)}function Wc(t){const{prevDep:e,nextDep:n}=t;e&&(e.nextDep=n,t.prevDep=void 0),n&&(n.prevDep=e,t.nextDep=void 0)}let He=!0;const Pa=[];function Et(){Pa.push(He),He=!1}function It(){const t=Pa.pop();He=t===void 0?!0:t}function Wi(t){const{cleanup:e}=t;if(t.cleanup=void 0,e){const n=oe;oe=void 0;try{e()}finally{oe=n}}}let ns=0;class Kc{constructor(e,n){this.sub=e,this.dep=n,this.version=n.version,this.nextDep=this.prevDep=this.nextSub=this.prevSub=this.prevActiveLink=void 0}}class yi{constructor(e){this.computed=e,this.version=0,this.activeLink=void 0,this.subs=void 0,this.map=void 0,this.key=void 0,this.sc=0,this.__v_skip=!0}track(e){if(!oe||!He||oe===this.computed)return;let n=this.activeLink;if(n===void 0||n.sub!==oe)n=this.activeLink=new Kc(oe,this),oe.deps?(n.prevDep=oe.depsTail,oe.depsTail.nextDep=n,oe.depsTail=n):oe.deps=oe.depsTail=n,Oa(n);else if(n.version===-1&&(n.version=this.version,n.nextDep)){const s=n.nextDep;s.prevDep=n.prevDep,n.prevDep&&(n.prevDep.nextDep=s),n.prevDep=oe.depsTail,n.nextDep=void 0,oe.depsTail.nextDep=n,oe.depsTail=n,oe.deps===n&&(oe.deps=s)}return n}trigger(e){this.version++,ns++,this.notify(e)}notify(e){gi();try{for(let n=this.subs;n;n=n.prevSub)n.sub.notify()&&n.sub.dep.notify()}finally{mi()}}}function Oa(t){if(t.dep.sc++,t.sub.flags&4){const e=t.dep.computed;if(e&&!t.dep.subs){e.flags|=20;for(let s=e.deps;s;s=s.nextDep)Oa(s)}const n=t.dep.subs;n!==t&&(t.prevSub=n,n&&(n.nextSub=t)),t.dep.subs=t}}const $r=new WeakMap,nn=Symbol(""),Br=Symbol(""),ss=Symbol("");function ve(t,e,n){if(He&&oe){let s=$r.get(t);s||$r.set(t,s=new Map);let r=s.get(n);r||(s.set(n,r=new yi),r.map=s,r.key=n),r.track()}}function _t(t,e,n,s,r,i){const o=$r.get(t);if(!o){ns++;return}const a=l=>{l&&l.trigger()};if(gi(),e==="clear")o.forEach(a);else{const l=j(t),c=l&&hi(n);if(l&&n==="length"){const u=Number(s);o.forEach((f,d)=>{(d==="length"||d===ss||!ct(d)&&d>=u)&&a(f)})}else switch((n!==void 0||o.has(void 0))&&a(o.get(n)),c&&a(o.get(ss)),e){case"add":l?c&&a(o.get("length")):(a(o.get(nn)),yn(t)&&a(o.get(Br)));break;case"delete":l||(a(o.get(nn)),yn(t)&&a(o.get(Br)));break;case"set":yn(t)&&a(o.get(nn));break}}mi()}function fn(t){const e=Y(t);return e===t?e:(ve(e,"iterate",ss),Fe(t)?e:e.map(je))}function ir(t){return ve(t=Y(t),"iterate",ss),t}function Dt(t,e){return wt(t)?An(sn(t)?je(e):e):je(e)}const Gc={__proto__:null,[Symbol.iterator](){return Ir(this,Symbol.iterator,t=>Dt(this,t))},concat(...t){return fn(this).concat(...t.map(e=>j(e)?fn(e):e))},entries(){return Ir(this,"entries",t=>(t[1]=Dt(this,t[1]),t))},every(t,e){return ht(this,"every",t,e,void 0,arguments)},filter(t,e){return ht(this,"filter",t,e,n=>n.map(s=>Dt(this,s)),arguments)},find(t,e){return ht(this,"find",t,e,n=>Dt(this,n),arguments)},findIndex(t,e){return ht(this,"findIndex",t,e,void 0,arguments)},findLast(t,e){return ht(this,"findLast",t,e,n=>Dt(this,n),arguments)},findLastIndex(t,e){return ht(this,"findLastIndex",t,e,void 0,arguments)},forEach(t,e){return ht(this,"forEach",t,e,void 0,arguments)},includes(...t){return wr(this,"includes",t)},indexOf(...t){return wr(this,"indexOf",t)},join(t){return fn(this).join(t)},lastIndexOf(...t){return wr(this,"lastIndexOf",t)},map(t,e){return ht(this,"map",t,e,void 0,arguments)},pop(){return $n(this,"pop")},push(...t){return $n(this,"push",t)},reduce(t,...e){return Ki(this,"reduce",t,e)},reduceRight(t,...e){return Ki(this,"reduceRight",t,e)},shift(){return $n(this,"shift")},some(t,e){return ht(this,"some",t,e,void 0,arguments)},splice(...t){return $n(this,"splice",t)},toReversed(){return fn(this).toReversed()},toSorted(t){return fn(this).toSorted(t)},toSpliced(...t){return fn(this).toSpliced(...t)},unshift(...t){return $n(this,"unshift",t)},values(){return Ir(this,"values",t=>Dt(this,t))}};function Ir(t,e,n){const s=ir(t),r=s[e]();return s!==t&&!Fe(t)&&(r._next=r.next,r.next=()=>{const i=r._next();return i.done||(i.value=n(i.value)),i}),r}const zc=Array.prototype;function ht(t,e,n,s,r,i){const o=ir(t),a=o!==t&&!Fe(t),l=o[e];if(l!==zc[e]){const f=l.apply(t,i);return a?je(f):f}let c=n;o!==t&&(a?c=function(f,d){return n.call(this,Dt(t,f),d,t)}:n.length>2&&(c=function(f,d){return n.call(this,f,d,t)}));const u=l.call(o,c,s);return a&&r?r(u):u}function Ki(t,e,n,s){const r=ir(t);let i=n;return r!==t&&(Fe(t)?n.length>3&&(i=function(o,a,l){return n.call(this,o,a,l,t)}):i=function(o,a,l){return n.call(this,o,Dt(t,a),l,t)}),r[e](i,...s)}function wr(t,e,n){const s=Y(t);ve(s,"iterate",ss);const r=s[e](...n);return(r===-1||r===!1)&&Ei(n[0])?(n[0]=Y(n[0]),s[e](...n)):r}function $n(t,e,n=[]){Et(),gi();const s=Y(t)[e].apply(t,n);return mi(),It(),s}const qc=ui("__proto__,__v_isRef,__isVue"),ka=new Set(Object.getOwnPropertyNames(Symbol).filter(t=>t!=="arguments"&&t!=="caller").map(t=>Symbol[t]).filter(ct));function Jc(t){ct(t)||(t=String(t));const e=Y(this);return ve(e,"has",t),e.hasOwnProperty(t)}class Na{constructor(e=!1,n=!1){this._isReadonly=e,this._isShallow=n}get(e,n,s){if(n==="__v_skip")return e.__v_skip;const r=this._isReadonly,i=this._isShallow;if(n==="__v_isReactive")return!r;if(n==="__v_isReadonly")return r;if(n==="__v_isShallow")return i;if(n==="__v_raw")return s===(r?i?iu:Ma:i?La:xa).get(e)||Object.getPrototypeOf(e)===Object.getPrototypeOf(s)?e:void 0;const o=j(e);if(!r){let l;if(o&&(l=Gc[n]))return l;if(n==="hasOwnProperty")return Jc}const a=Reflect.get(e,n,Ie(e)?e:s);if((ct(n)?ka.has(n):qc(n))||(r||ve(e,"get",n),i))return a;if(Ie(a)){const l=o&&hi(n)?a:a.value;return r&&Z(l)?jr(l):l}return Z(a)?r?jr(a):ut(a):a}}class Da extends Na{constructor(e=!1){super(!1,e)}set(e,n,s,r){let i=e[n];const o=j(e)&&hi(n);if(!this._isShallow){const c=wt(i);if(!Fe(s)&&!wt(s)&&(i=Y(i),s=Y(s)),!o&&Ie(i)&&!Ie(s))return c||(i.value=s),!0}const a=o?Number(n)<e.length:X(e,n),l=Reflect.set(e,n,s,Ie(e)?e:r);return e===Y(r)&&(a?$t(s,i)&&_t(e,"set",n,s):_t(e,"add",n,s)),l}deleteProperty(e,n){const s=X(e,n);e[n];const r=Reflect.deleteProperty(e,n);return r&&s&&_t(e,"delete",n,void 0),r}has(e,n){const s=Reflect.has(e,n);return(!ct(n)||!ka.has(n))&&ve(e,"has",n),s}ownKeys(e){return ve(e,"iterate",j(e)?"length":nn),Reflect.ownKeys(e)}}class Yc extends Na{constructor(e=!1){super(!0,e)}set(e,n){return!0}deleteProperty(e,n){return!0}}const Xc=new Da,Qc=new Yc,Zc=new Da(!0);const Hr=t=>t,Is=t=>Reflect.getPrototypeOf(t);function eu(t,e,n){return function(...s){const r=this.__v_raw,i=Y(r),o=yn(i),a=t==="entries"||t===Symbol.iterator&&o,l=t==="keys"&&o,c=r[t](...s),u=n?Hr:e?An:je;return!e&&ve(i,"iterate",l?Br:nn),ye(Object.create(c),{next(){const{value:f,done:d}=c.next();return d?{value:f,done:d}:{value:a?[u(f[0]),u(f[1])]:u(f),done:d}}})}}function ws(t){return function(...e){return t==="delete"?!1:t==="clear"?void 0:this}}function tu(t,e){const n={get(r){const i=this.__v_raw,o=Y(i),a=Y(r);t||($t(r,a)&&ve(o,"get",r),ve(o,"get",a));const{has:l}=Is(o),c=e?Hr:t?An:je;if(l.call(o,r))return c(i.get(r));if(l.call(o,a))return c(i.get(a));i!==o&&i.get(r)},get size(){const r=this.__v_raw;return!t&&ve(Y(r),"iterate",nn),r.size},has(r){const i=this.__v_raw,o=Y(i),a=Y(r);return t||($t(r,a)&&ve(o,"has",r),ve(o,"has",a)),r===a?i.has(r):i.has(r)||i.has(a)},forEach(r,i){const o=this,a=o.__v_raw,l=Y(a),c=e?Hr:t?An:je;return!t&&ve(l,"iterate",nn),a.forEach((u,f)=>r.call(i,c(u),c(f),o))}};return ye(n,t?{add:ws("add"),set:ws("set"),delete:ws("delete"),clear:ws("clear")}:{add(r){!e&&!Fe(r)&&!wt(r)&&(r=Y(r));const i=Y(this);return Is(i).has.call(i,r)||(i.add(r),_t(i,"add",r,r)),this},set(r,i){!e&&!Fe(i)&&!wt(i)&&(i=Y(i));const o=Y(this),{has:a,get:l}=Is(o);let c=a.call(o,r);c||(r=Y(r),c=a.call(o,r));const u=l.call(o,r);return o.set(r,i),c?$t(i,u)&&_t(o,"set",r,i):_t(o,"add",r,i),this},delete(r){const i=Y(this),{has:o,get:a}=Is(i);let l=o.call(i,r);l||(r=Y(r),l=o.call(i,r)),a&&a.call(i,r);const c=i.delete(r);return l&&_t(i,"delete",r,void 0),c},clear(){const r=Y(this),i=r.size!==0,o=r.clear();return i&&_t(r,"clear",void 0,void 0),o}}),["keys","values","entries",Symbol.iterator].forEach(r=>{n[r]=eu(r,t,e)}),n}function vi(t,e){const n=tu(t,e);return(s,r,i)=>r==="__v_isReactive"?!t:r==="__v_isReadonly"?t:r==="__v_raw"?s:Reflect.get(X(n,r)&&r in s?n:s,r,i)}const nu={get:vi(!1,!1)},su={get:vi(!1,!0)},ru={get:vi(!0,!1)};const xa=new WeakMap,La=new WeakMap,Ma=new WeakMap,iu=new WeakMap;function ou(t){switch(t){case"Object":case"Array":return 1;case"Map":case"Set":case"WeakMap":case"WeakSet":return 2;default:return 0}}function au(t){return t.__v_skip||!Object.isExtensible(t)?0:ou(kc(t))}function ut(t){return wt(t)?t:bi(t,!1,Xc,nu,xa)}function Ua(t){return bi(t,!1,Zc,su,La)}function jr(t){return bi(t,!0,Qc,ru,Ma)}function bi(t,e,n,s,r){if(!Z(t)||t.__v_raw&&!(e&&t.__v_isReactive))return t;const i=au(t);if(i===0)return t;const o=r.get(t);if(o)return o;const a=new Proxy(t,i===2?s:n);return r.set(t,a),a}function sn(t){return wt(t)?sn(t.__v_raw):!!(t&&t.__v_isReactive)}function wt(t){return!!(t&&t.__v_isReadonly)}function Fe(t){return!!(t&&t.__v_isShallow)}function Ei(t){return t?!!t.__v_raw:!1}function Y(t){const e=t&&t.__v_raw;return e?Y(e):t}function lu(t){return!X(t,"__v_skip")&&Object.isExtensible(t)&&va(t,"__v_skip",!0),t}const je=t=>Z(t)?ut(t):t,An=t=>Z(t)?jr(t):t;function Ie(t){return t?t.__v_isRef===!0:!1}function re(t){return Fa(t,!1)}function cu(t){return Fa(t,!0)}function Fa(t,e){return Ie(t)?t:new uu(t,e)}class uu{constructor(e,n){this.dep=new yi,this.__v_isRef=!0,this.__v_isShallow=!1,this._rawValue=n?e:Y(e),this._value=n?e:je(e),this.__v_isShallow=n}get value(){return this.dep.track(),this._value}set value(e){const n=this._rawValue,s=this.__v_isShallow||Fe(e)||wt(e);e=s?e:Y(e),$t(e,n)&&(this._rawValue=e,this._value=s?e:je(e),this.dep.trigger())}}function vn(t){return Ie(t)?t.value:t}const du={get:(t,e,n)=>e==="__v_raw"?t:vn(Reflect.get(t,e,n)),set:(t,e,n,s)=>{const r=t[e];return Ie(r)&&!Ie(n)?(r.value=n,!0):Reflect.set(t,e,n,s)}};function Va(t){return sn(t)?t:new Proxy(t,du)}class fu{constructor(e,n,s){this.fn=e,this.setter=n,this._value=void 0,this.dep=new yi(this),this.__v_isRef=!0,this.deps=void 0,this.depsTail=void 0,this.flags=16,this.globalVersion=ns-1,this.next=void 0,this.effect=this,this.__v_isReadonly=!n,this.isSSR=s}notify(){if(this.flags|=16,!(this.flags&8)&&oe!==this)return Ca(this,!0),!0}get value(){const e=this.dep.track();return Ra(this),e&&(e.version=this.dep.version),this._value}set value(e){this.setter&&this.setter(e)}}function hu(t,e,n=!1){let s,r;return K(t)?s=t:(s=t.get,r=t.set),new fu(s,r,n)}const Ss={},Ms=new WeakMap;let Qt;function pu(t,e=!1,n=Qt){if(n){let s=Ms.get(n);s||Ms.set(n,s=[]),s.push(t)}}function gu(t,e,n=se){const{immediate:s,deep:r,once:i,scheduler:o,augmentJob:a,call:l}=n,c=M=>r?M:Fe(M)||r===!1||r===0?yt(M,1):yt(M);let u,f,d,m,v=!1,y=!1;if(Ie(t)?(f=()=>t.value,v=Fe(t)):sn(t)?(f=()=>c(t),v=!0):j(t)?(y=!0,v=t.some(M=>sn(M)||Fe(M)),f=()=>t.map(M=>{if(Ie(M))return M.value;if(sn(M))return c(M);if(K(M))return l?l(M,2):M()})):K(t)?e?f=l?()=>l(t,2):t:f=()=>{if(d){Et();try{d()}finally{It()}}const M=Qt;Qt=u;try{return l?l(t,3,[m]):t(m)}finally{Qt=M}}:f=it,e&&r){const M=f,te=r===!0?1/0:r;f=()=>yt(M(),te)}const b=jc(),E=()=>{u.stop(),b&&b.active&&fi(b.effects,u)};if(i&&e){const M=e;e=(...te)=>{M(...te),E()}}let C=y?new Array(t.length).fill(Ss):Ss;const L=M=>{if(!(!(u.flags&1)||!u.dirty&&!M))if(e){const te=u.run();if(r||v||(y?te.some((me,ce)=>$t(me,C[ce])):$t(te,C))){d&&d();const me=Qt;Qt=u;try{const ce=[te,C===Ss?void 0:y&&C[0]===Ss?[]:C,m];C=te,l?l(e,3,ce):e(...ce)}finally{Qt=me}}}else u.run()};return a&&a(L),u=new wa(f),u.scheduler=o?()=>o(L,!1):L,m=M=>pu(M,!1,u),d=u.onStop=()=>{const M=Ms.get(u);if(M){if(l)l(M,4);else for(const te of M)te();Ms.delete(u)}},e?s?L(!0):C=u.run():o?o(L.bind(null,!0),!0):u.run(),E.pause=u.pause.bind(u),E.resume=u.resume.bind(u),E.stop=E,E}function yt(t,e=1/0,n){if(e<=0||!Z(t)||t.__v_skip||(n=n||new Map,(n.get(t)||0)>=e))return t;if(n.set(t,e),e--,Ie(t))yt(t.value,e,n);else if(j(t))for(let s=0;s<t.length;s++)yt(t[s],e,n);else if(er(t)||yn(t))t.forEach(s=>{yt(s,e,n)});else if(ya(t)){for(const s in t)yt(t[s],e,n);for(const s of Object.getOwnPropertySymbols(t))Object.prototype.propertyIsEnumerable.call(t,s)&&yt(t[s],e,n)}return t}/**
* @vue/runtime-core v3.5.29
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/function ps(t,e,n,s){try{return s?t(...s):t()}catch(r){or(r,e,n)}}function dt(t,e,n,s){if(K(t)){const r=ps(t,e,n,s);return r&&ma(r)&&r.catch(i=>{or(i,e,n)}),r}if(j(t)){const r=[];for(let i=0;i<t.length;i++)r.push(dt(t[i],e,n,s));return r}}function or(t,e,n,s=!0){const r=e?e.vnode:null,{errorHandler:i,throwUnhandledErrorInProduction:o}=e&&e.appContext.config||se;if(e){let a=e.parent;const l=e.proxy,c=`https://vuejs.org/error-reference/#runtime-${n}`;for(;a;){const u=a.ec;if(u){for(let f=0;f<u.length;f++)if(u[f](t,l,c)===!1)return}a=a.parent}if(i){Et(),ps(i,null,10,[t,l,c]),It();return}}mu(t,n,r,s,o)}function mu(t,e,n,s=!0,r=!1){if(r)throw t;console.error(t)}const Ce=[];let et=-1;const bn=[];let xt=null,hn=0;const $a=Promise.resolve();let Us=null;function Ii(t){const e=Us||$a;return t?e.then(this?t.bind(this):t):e}function _u(t){let e=et+1,n=Ce.length;for(;e<n;){const s=e+n>>>1,r=Ce[s],i=rs(r);i<t||i===t&&r.flags&2?e=s+1:n=s}return e}function wi(t){if(!(t.flags&1)){const e=rs(t),n=Ce[Ce.length-1];!n||!(t.flags&2)&&e>=rs(n)?Ce.push(t):Ce.splice(_u(e),0,t),t.flags|=1,Ba()}}function Ba(){Us||(Us=$a.then(ja))}function yu(t){j(t)?bn.push(...t):xt&&t.id===-1?xt.splice(hn+1,0,t):t.flags&1||(bn.push(t),t.flags|=1),Ba()}function Gi(t,e,n=et+1){for(;n<Ce.length;n++){const s=Ce[n];if(s&&s.flags&2){if(t&&s.id!==t.uid)continue;Ce.splice(n,1),n--,s.flags&4&&(s.flags&=-2),s(),s.flags&4||(s.flags&=-2)}}}function Ha(t){if(bn.length){const e=[...new Set(bn)].sort((n,s)=>rs(n)-rs(s));if(bn.length=0,xt){xt.push(...e);return}for(xt=e,hn=0;hn<xt.length;hn++){const n=xt[hn];n.flags&4&&(n.flags&=-2),n.flags&8||n(),n.flags&=-2}xt=null,hn=0}}const rs=t=>t.id==null?t.flags&2?-1:1/0:t.id;function ja(t){try{for(et=0;et<Ce.length;et++){const e=Ce[et];e&&!(e.flags&8)&&(e.flags&4&&(e.flags&=-2),ps(e,e.i,e.i?15:14),e.flags&4||(e.flags&=-2))}}finally{for(;et<Ce.length;et++){const e=Ce[et];e&&(e.flags&=-2)}et=-1,Ce.length=0,Ha(),Us=null,(Ce.length||bn.length)&&ja()}}let Le=null,Wa=null;function Fs(t){const e=Le;return Le=t,Wa=t&&t.type.__scopeId||null,e}function pn(t,e=Le,n){if(!e||t._n)return t;const s=(...r)=>{s._d&&Bs(-1);const i=Fs(e);let o;try{o=t(...r)}finally{Fs(i),s._d&&Bs(1)}return o};return s._n=!0,s._c=!0,s._d=!0,s}function _e(t,e){if(Le===null)return t;const n=ur(Le),s=t.dirs||(t.dirs=[]);for(let r=0;r<e.length;r++){let[i,o,a,l=se]=e[r];i&&(K(i)&&(i={mounted:i,updated:i}),i.deep&&yt(o),s.push({dir:i,instance:n,value:o,oldValue:void 0,arg:a,modifiers:l}))}return t}function Yt(t,e,n,s){const r=t.dirs,i=e&&e.dirs;for(let o=0;o<r.length;o++){const a=r[o];i&&(a.oldValue=i[o].value);let l=a.dir[s];l&&(Et(),dt(l,n,8,[t.el,a,t,e]),It())}}function As(t,e){if(Ee){let n=Ee.provides;const s=Ee.parent&&Ee.parent.provides;s===n&&(n=Ee.provides=Object.create(s)),n[t]=e}}function ot(t,e,n=!1){const s=vd();if(s||En){let r=En?En._context.provides:s?s.parent==null||s.ce?s.vnode.appContext&&s.vnode.appContext.provides:s.parent.provides:void 0;if(r&&t in r)return r[t];if(arguments.length>1)return n&&K(e)?e.call(s&&s.proxy):e}}const vu=Symbol.for("v-scx"),bu=()=>ot(vu);function Bt(t,e,n){return Ka(t,e,n)}function Ka(t,e,n=se){const{immediate:s,deep:r,flush:i,once:o}=n,a=ye({},n),l=e&&s||!e&&i!=="post";let c;if(os){if(i==="sync"){const m=bu();c=m.__watcherHandles||(m.__watcherHandles=[])}else if(!l){const m=()=>{};return m.stop=it,m.resume=it,m.pause=it,m}}const u=Ee;a.call=(m,v,y)=>dt(m,u,v,y);let f=!1;i==="post"?a.scheduler=m=>{ke(m,u&&u.suspense)}:i!=="sync"&&(f=!0,a.scheduler=(m,v)=>{v?m():wi(m)}),a.augmentJob=m=>{e&&(m.flags|=4),f&&(m.flags|=2,u&&(m.id=u.uid,m.i=u))};const d=gu(t,e,a);return os&&(c?c.push(d):l&&d()),d}function Eu(t,e,n){const s=this.proxy,r=fe(t)?t.includes(".")?Ga(s,t):()=>s[t]:t.bind(s,s);let i;K(e)?i=e:(i=e.handler,n=e);const o=gs(this),a=Ka(r,i.bind(s),n);return o(),a}function Ga(t,e){const n=e.split(".");return()=>{let s=t;for(let r=0;r<n.length&&s;r++)s=s[n[r]];return s}}const Iu=Symbol("_vte"),wu=t=>t.__isTeleport,Su=Symbol("_leaveCb");function Si(t,e){t.shapeFlag&6&&t.component?(t.transition=e,Si(t.component.subTree,e)):t.shapeFlag&128?(t.ssContent.transition=e.clone(t.ssContent),t.ssFallback.transition=e.clone(t.ssFallback)):t.transition=e}function za(t,e){return K(t)?ye({name:t.name},e,{setup:t}):t}function qa(t){t.ids=[t.ids[0]+t.ids[2]+++"-",0,0]}function zi(t,e){let n;return!!((n=Object.getOwnPropertyDescriptor(t,e))&&!n.configurable)}const Vs=new WeakMap;function Jn(t,e,n,s,r=!1){if(j(t)){t.forEach((y,b)=>Jn(y,e&&(j(e)?e[b]:e),n,s,r));return}if(Yn(s)&&!r){s.shapeFlag&512&&s.type.__asyncResolved&&s.component.subTree.component&&Jn(t,e,n,s.component.subTree);return}const i=s.shapeFlag&4?ur(s.component):s.el,o=r?null:i,{i:a,r:l}=t,c=e&&e.r,u=a.refs===se?a.refs={}:a.refs,f=a.setupState,d=Y(f),m=f===se?ga:y=>zi(u,y)?!1:X(d,y),v=(y,b)=>!(b&&zi(u,b));if(c!=null&&c!==l){if(qi(e),fe(c))u[c]=null,m(c)&&(f[c]=null);else if(Ie(c)){const y=e;v(c,y.k)&&(c.value=null),y.k&&(u[y.k]=null)}}if(K(l))ps(l,a,12,[o,u]);else{const y=fe(l),b=Ie(l);if(y||b){const E=()=>{if(t.f){const C=y?m(l)?f[l]:u[l]:v()||!t.k?l.value:u[t.k];if(r)j(C)&&fi(C,i);else if(j(C))C.includes(i)||C.push(i);else if(y)u[l]=[i],m(l)&&(f[l]=u[l]);else{const L=[i];v(l,t.k)&&(l.value=L),t.k&&(u[t.k]=L)}}else y?(u[l]=o,m(l)&&(f[l]=o)):b&&(v(l,t.k)&&(l.value=o),t.k&&(u[t.k]=o))};if(o){const C=()=>{E(),Vs.delete(t)};C.id=-1,Vs.set(t,C),ke(C,n)}else qi(t),E()}}}function qi(t){const e=Vs.get(t);e&&(e.flags|=8,Vs.delete(t))}rr().requestIdleCallback;rr().cancelIdleCallback;const Yn=t=>!!t.type.__asyncLoader,Ja=t=>t.type.__isKeepAlive;function Cu(t,e){Ya(t,"a",e)}function Tu(t,e){Ya(t,"da",e)}function Ya(t,e,n=Ee){const s=t.__wdc||(t.__wdc=()=>{let r=n;for(;r;){if(r.isDeactivated)return;r=r.parent}return t()});if(ar(e,s,n),n){let r=n.parent;for(;r&&r.parent;)Ja(r.parent.vnode)&&Au(s,e,n,r),r=r.parent}}function Au(t,e,n,s){const r=ar(e,t,s,!0);Xa(()=>{fi(s[e],r)},n)}function ar(t,e,n=Ee,s=!1){if(n){const r=n[t]||(n[t]=[]),i=e.__weh||(e.__weh=(...o)=>{Et();const a=gs(n),l=dt(e,n,t,o);return a(),It(),l});return s?r.unshift(i):r.push(i),i}}const Tt=t=>(e,n=Ee)=>{(!os||t==="sp")&&ar(t,(...s)=>e(...s),n)},Ru=Tt("bm"),Ln=Tt("m"),Pu=Tt("bu"),Ou=Tt("u"),ku=Tt("bum"),Xa=Tt("um"),Nu=Tt("sp"),Du=Tt("rtg"),xu=Tt("rtc");function Lu(t,e=Ee){ar("ec",t,e)}const Mu="components";function Wr(t,e){return Fu(Mu,t,!0,e)||t}const Uu=Symbol.for("v-ndc");function Fu(t,e,n=!0,s=!1){const r=Le||Ee;if(r){const i=r.type;{const a=Sd(i,!1);if(a&&(a===e||a===Ve(e)||a===nr(Ve(e))))return i}const o=Ji(r[t]||i[t],e)||Ji(r.appContext[t],e);return!o&&s?i:o}}function Ji(t,e){return t&&(t[e]||t[Ve(e)]||t[nr(Ve(e))])}function be(t,e,n,s){let r;const i=n,o=j(t);if(o||fe(t)){const a=o&&sn(t);let l=!1,c=!1;a&&(l=!Fe(t),c=wt(t),t=ir(t)),r=new Array(t.length);for(let u=0,f=t.length;u<f;u++)r[u]=e(l?c?An(je(t[u])):je(t[u]):t[u],u,void 0,i)}else if(typeof t=="number"){r=new Array(t);for(let a=0;a<t;a++)r[a]=e(a+1,a,void 0,i)}else if(Z(t))if(t[Symbol.iterator])r=Array.from(t,(a,l)=>e(a,l,void 0,i));else{const a=Object.keys(t);r=new Array(a.length);for(let l=0,c=a.length;l<c;l++){const u=a[l];r[l]=e(t[u],u,l,i)}}else r=[];return r}const Kr=t=>t?yl(t)?ur(t):Kr(t.parent):null,Xn=ye(Object.create(null),{$:t=>t,$el:t=>t.vnode.el,$data:t=>t.data,$props:t=>t.props,$attrs:t=>t.attrs,$slots:t=>t.slots,$refs:t=>t.refs,$parent:t=>Kr(t.parent),$root:t=>Kr(t.root),$host:t=>t.ce,$emit:t=>t.emit,$options:t=>Za(t),$forceUpdate:t=>t.f||(t.f=()=>{wi(t.update)}),$nextTick:t=>t.n||(t.n=Ii.bind(t.proxy)),$watch:t=>Eu.bind(t)}),Sr=(t,e)=>t!==se&&!t.__isScriptSetup&&X(t,e),Vu={get({_:t},e){if(e==="__v_skip")return!0;const{ctx:n,setupState:s,data:r,props:i,accessCache:o,type:a,appContext:l}=t;if(e[0]!=="$"){const d=o[e];if(d!==void 0)switch(d){case 1:return s[e];case 2:return r[e];case 4:return n[e];case 3:return i[e]}else{if(Sr(s,e))return o[e]=1,s[e];if(r!==se&&X(r,e))return o[e]=2,r[e];if(X(i,e))return o[e]=3,i[e];if(n!==se&&X(n,e))return o[e]=4,n[e];Gr&&(o[e]=0)}}const c=Xn[e];let u,f;if(c)return e==="$attrs"&&ve(t.attrs,"get",""),c(t);if((u=a.__cssModules)&&(u=u[e]))return u;if(n!==se&&X(n,e))return o[e]=4,n[e];if(f=l.config.globalProperties,X(f,e))return f[e]},set({_:t},e,n){const{data:s,setupState:r,ctx:i}=t;return Sr(r,e)?(r[e]=n,!0):s!==se&&X(s,e)?(s[e]=n,!0):X(t.props,e)||e[0]==="$"&&e.slice(1)in t?!1:(i[e]=n,!0)},has({_:{data:t,setupState:e,accessCache:n,ctx:s,appContext:r,props:i,type:o}},a){let l;return!!(n[a]||t!==se&&a[0]!=="$"&&X(t,a)||Sr(e,a)||X(i,a)||X(s,a)||X(Xn,a)||X(r.config.globalProperties,a)||(l=o.__cssModules)&&l[a])},defineProperty(t,e,n){return n.get!=null?t._.accessCache[e]=0:X(n,"value")&&this.set(t,e,n.value,null),Reflect.defineProperty(t,e,n)}};function Yi(t){return j(t)?t.reduce((e,n)=>(e[n]=null,e),{}):t}let Gr=!0;function $u(t){const e=Za(t),n=t.proxy,s=t.ctx;Gr=!1,e.beforeCreate&&Xi(e.beforeCreate,t,"bc");const{data:r,computed:i,methods:o,watch:a,provide:l,inject:c,created:u,beforeMount:f,mounted:d,beforeUpdate:m,updated:v,activated:y,deactivated:b,beforeDestroy:E,beforeUnmount:C,destroyed:L,unmounted:M,render:te,renderTracked:me,renderTriggered:ce,errorCaptured:Ge,serverPrefetch:Rt,expose:ze,inheritAttrs:Pt,components:qt,directives:qe,filters:Fn}=e;if(c&&Bu(c,s,null),o)for(const ee in o){const q=o[ee];K(q)&&(s[ee]=q.bind(n))}if(r){const ee=r.call(n,n);Z(ee)&&(t.data=ut(ee))}if(Gr=!0,i)for(const ee in i){const q=i[ee],ft=K(q)?q.bind(n,n):K(q.get)?q.get.bind(n,n):it,Ot=!K(q)&&K(q.set)?q.set.bind(n):it,Je=Te({get:ft,set:Ot});Object.defineProperty(s,ee,{enumerable:!0,configurable:!0,get:()=>Je.value,set:Re=>Je.value=Re})}if(a)for(const ee in a)Qa(a[ee],s,n,ee);if(l){const ee=K(l)?l.call(n):l;Reflect.ownKeys(ee).forEach(q=>{As(q,ee[q])})}u&&Xi(u,t,"c");function ge(ee,q){j(q)?q.forEach(ft=>ee(ft.bind(n))):q&&ee(q.bind(n))}if(ge(Ru,f),ge(Ln,d),ge(Pu,m),ge(Ou,v),ge(Cu,y),ge(Tu,b),ge(Lu,Ge),ge(xu,me),ge(Du,ce),ge(ku,C),ge(Xa,M),ge(Nu,Rt),j(ze))if(ze.length){const ee=t.exposed||(t.exposed={});ze.forEach(q=>{Object.defineProperty(ee,q,{get:()=>n[q],set:ft=>n[q]=ft,enumerable:!0})})}else t.exposed||(t.exposed={});te&&t.render===it&&(t.render=te),Pt!=null&&(t.inheritAttrs=Pt),qt&&(t.components=qt),qe&&(t.directives=qe),Rt&&qa(t)}function Bu(t,e,n=it){j(t)&&(t=zr(t));for(const s in t){const r=t[s];let i;Z(r)?"default"in r?i=ot(r.from||s,r.default,!0):i=ot(r.from||s):i=ot(r),Ie(i)?Object.defineProperty(e,s,{enumerable:!0,configurable:!0,get:()=>i.value,set:o=>i.value=o}):e[s]=i}}function Xi(t,e,n){dt(j(t)?t.map(s=>s.bind(e.proxy)):t.bind(e.proxy),e,n)}function Qa(t,e,n,s){let r=s.includes(".")?Ga(n,s):()=>n[s];if(fe(t)){const i=e[t];K(i)&&Bt(r,i)}else if(K(t))Bt(r,t.bind(n));else if(Z(t))if(j(t))t.forEach(i=>Qa(i,e,n,s));else{const i=K(t.handler)?t.handler.bind(n):e[t.handler];K(i)&&Bt(r,i,t)}}function Za(t){const e=t.type,{mixins:n,extends:s}=e,{mixins:r,optionsCache:i,config:{optionMergeStrategies:o}}=t.appContext,a=i.get(e);let l;return a?l=a:!r.length&&!n&&!s?l=e:(l={},r.length&&r.forEach(c=>$s(l,c,o,!0)),$s(l,e,o)),Z(e)&&i.set(e,l),l}function $s(t,e,n,s=!1){const{mixins:r,extends:i}=e;i&&$s(t,i,n,!0),r&&r.forEach(o=>$s(t,o,n,!0));for(const o in e)if(!(s&&o==="expose")){const a=Hu[o]||n&&n[o];t[o]=a?a(t[o],e[o]):e[o]}return t}const Hu={data:Qi,props:Zi,emits:Zi,methods:jn,computed:jn,beforeCreate:we,created:we,beforeMount:we,mounted:we,beforeUpdate:we,updated:we,beforeDestroy:we,beforeUnmount:we,destroyed:we,unmounted:we,activated:we,deactivated:we,errorCaptured:we,serverPrefetch:we,components:jn,directives:jn,watch:Wu,provide:Qi,inject:ju};function Qi(t,e){return e?t?function(){return ye(K(t)?t.call(this,this):t,K(e)?e.call(this,this):e)}:e:t}function ju(t,e){return jn(zr(t),zr(e))}function zr(t){if(j(t)){const e={};for(let n=0;n<t.length;n++)e[t[n]]=t[n];return e}return t}function we(t,e){return t?[...new Set([].concat(t,e))]:e}function jn(t,e){return t?ye(Object.create(null),t,e):e}function Zi(t,e){return t?j(t)&&j(e)?[...new Set([...t,...e])]:ye(Object.create(null),Yi(t),Yi(e??{})):e}function Wu(t,e){if(!t)return e;if(!e)return t;const n=ye(Object.create(null),t);for(const s in e)n[s]=we(t[s],e[s]);return n}function el(){return{app:null,config:{isNativeTag:ga,performance:!1,globalProperties:{},optionMergeStrategies:{},errorHandler:void 0,warnHandler:void 0,compilerOptions:{}},mixins:[],components:{},directives:{},provides:Object.create(null),optionsCache:new WeakMap,propsCache:new WeakMap,emitsCache:new WeakMap}}let Ku=0;function Gu(t,e){return function(s,r=null){K(s)||(s=ye({},s)),r!=null&&!Z(r)&&(r=null);const i=el(),o=new WeakSet,a=[];let l=!1;const c=i.app={_uid:Ku++,_component:s,_props:r,_container:null,_context:i,_instance:null,version:Td,get config(){return i.config},set config(u){},use(u,...f){return o.has(u)||(u&&K(u.install)?(o.add(u),u.install(c,...f)):K(u)&&(o.add(u),u(c,...f))),c},mixin(u){return i.mixins.includes(u)||i.mixins.push(u),c},component(u,f){return f?(i.components[u]=f,c):i.components[u]},directive(u,f){return f?(i.directives[u]=f,c):i.directives[u]},mount(u,f,d){if(!l){const m=c._ceVNode||le(s,r);return m.appContext=i,d===!0?d="svg":d===!1&&(d=void 0),t(m,u,d),l=!0,c._container=u,u.__vue_app__=c,ur(m.component)}},onUnmount(u){a.push(u)},unmount(){l&&(dt(a,c._instance,16),t(null,c._container),delete c._container.__vue_app__)},provide(u,f){return i.provides[u]=f,c},runWithContext(u){const f=En;En=c;try{return u()}finally{En=f}}};return c}}let En=null;const zu=(t,e)=>e==="modelValue"||e==="model-value"?t.modelModifiers:t[`${e}Modifiers`]||t[`${Ve(e)}Modifiers`]||t[`${an(e)}Modifiers`];function qu(t,e,...n){if(t.isUnmounted)return;const s=t.vnode.props||se;let r=n;const i=e.startsWith("update:"),o=i&&zu(s,e.slice(7));o&&(o.trim&&(r=n.map(u=>fe(u)?u.trim():u)),o.number&&(r=n.map(sr)));let a,l=s[a=vr(e)]||s[a=vr(Ve(e))];!l&&i&&(l=s[a=vr(an(e))]),l&&dt(l,t,6,r);const c=s[a+"Once"];if(c){if(!t.emitted)t.emitted={};else if(t.emitted[a])return;t.emitted[a]=!0,dt(c,t,6,r)}}const Ju=new WeakMap;function tl(t,e,n=!1){const s=n?Ju:e.emitsCache,r=s.get(t);if(r!==void 0)return r;const i=t.emits;let o={},a=!1;if(!K(t)){const l=c=>{const u=tl(c,e,!0);u&&(a=!0,ye(o,u))};!n&&e.mixins.length&&e.mixins.forEach(l),t.extends&&l(t.extends),t.mixins&&t.mixins.forEach(l)}return!i&&!a?(Z(t)&&s.set(t,null),null):(j(i)?i.forEach(l=>o[l]=null):ye(o,i),Z(t)&&s.set(t,o),o)}function lr(t,e){return!t||!Zs(e)?!1:(e=e.slice(2).replace(/Once$/,""),X(t,e[0].toLowerCase()+e.slice(1))||X(t,an(e))||X(t,e))}function eo(t){const{type:e,vnode:n,proxy:s,withProxy:r,propsOptions:[i],slots:o,attrs:a,emit:l,render:c,renderCache:u,props:f,data:d,setupState:m,ctx:v,inheritAttrs:y}=t,b=Fs(t);let E,C;try{if(n.shapeFlag&4){const M=r||s,te=M;E=tt(c.call(te,M,u,f,m,d,v)),C=a}else{const M=e;E=tt(M.length>1?M(f,{attrs:a,slots:o,emit:l}):M(f,null)),C=e.props?a:Yu(a)}}catch(M){Qn.length=0,or(M,t,1),E=le(Kt)}let L=E;if(C&&y!==!1){const M=Object.keys(C),{shapeFlag:te}=L;M.length&&te&7&&(i&&M.some(di)&&(C=Xu(C,i)),L=Rn(L,C,!1,!0))}return n.dirs&&(L=Rn(L,null,!1,!0),L.dirs=L.dirs?L.dirs.concat(n.dirs):n.dirs),n.transition&&Si(L,n.transition),E=L,Fs(b),E}const Yu=t=>{let e;for(const n in t)(n==="class"||n==="style"||Zs(n))&&((e||(e={}))[n]=t[n]);return e},Xu=(t,e)=>{const n={};for(const s in t)(!di(s)||!(s.slice(9)in e))&&(n[s]=t[s]);return n};function Qu(t,e,n){const{props:s,children:r,component:i}=t,{props:o,children:a,patchFlag:l}=e,c=i.emitsOptions;if(e.dirs||e.transition)return!0;if(n&&l>=0){if(l&1024)return!0;if(l&16)return s?to(s,o,c):!!o;if(l&8){const u=e.dynamicProps;for(let f=0;f<u.length;f++){const d=u[f];if(nl(o,s,d)&&!lr(c,d))return!0}}}else return(r||a)&&(!a||!a.$stable)?!0:s===o?!1:s?o?to(s,o,c):!0:!!o;return!1}function to(t,e,n){const s=Object.keys(e);if(s.length!==Object.keys(t).length)return!0;for(let r=0;r<s.length;r++){const i=s[r];if(nl(e,t,i)&&!lr(n,i))return!0}return!1}function nl(t,e,n){const s=t[n],r=e[n];return n==="style"&&Z(s)&&Z(r)?!hs(s,r):s!==r}function Zu({vnode:t,parent:e},n){for(;e;){const s=e.subTree;if(s.suspense&&s.suspense.activeBranch===t&&(s.el=t.el),s===t)(t=e.vnode).el=n,e=e.parent;else break}}const sl={},rl=()=>Object.create(sl),il=t=>Object.getPrototypeOf(t)===sl;function ed(t,e,n,s=!1){const r={},i=rl();t.propsDefaults=Object.create(null),ol(t,e,r,i);for(const o in t.propsOptions[0])o in r||(r[o]=void 0);n?t.props=s?r:Ua(r):t.type.props?t.props=r:t.props=i,t.attrs=i}function td(t,e,n,s){const{props:r,attrs:i,vnode:{patchFlag:o}}=t,a=Y(r),[l]=t.propsOptions;let c=!1;if((s||o>0)&&!(o&16)){if(o&8){const u=t.vnode.dynamicProps;for(let f=0;f<u.length;f++){let d=u[f];if(lr(t.emitsOptions,d))continue;const m=e[d];if(l)if(X(i,d))m!==i[d]&&(i[d]=m,c=!0);else{const v=Ve(d);r[v]=qr(l,a,v,m,t,!1)}else m!==i[d]&&(i[d]=m,c=!0)}}}else{ol(t,e,r,i)&&(c=!0);let u;for(const f in a)(!e||!X(e,f)&&((u=an(f))===f||!X(e,u)))&&(l?n&&(n[f]!==void 0||n[u]!==void 0)&&(r[f]=qr(l,a,f,void 0,t,!0)):delete r[f]);if(i!==a)for(const f in i)(!e||!X(e,f))&&(delete i[f],c=!0)}c&&_t(t.attrs,"set","")}function ol(t,e,n,s){const[r,i]=t.propsOptions;let o=!1,a;if(e)for(let l in e){if(Gn(l))continue;const c=e[l];let u;r&&X(r,u=Ve(l))?!i||!i.includes(u)?n[u]=c:(a||(a={}))[u]=c:lr(t.emitsOptions,l)||(!(l in s)||c!==s[l])&&(s[l]=c,o=!0)}if(i){const l=Y(n),c=a||se;for(let u=0;u<i.length;u++){const f=i[u];n[f]=qr(r,l,f,c[f],t,!X(c,f))}}return o}function qr(t,e,n,s,r,i){const o=t[n];if(o!=null){const a=X(o,"default");if(a&&s===void 0){const l=o.default;if(o.type!==Function&&!o.skipFactory&&K(l)){const{propsDefaults:c}=r;if(n in c)s=c[n];else{const u=gs(r);s=c[n]=l.call(null,e),u()}}else s=l;r.ce&&r.ce._setProp(n,s)}o[0]&&(i&&!a?s=!1:o[1]&&(s===""||s===an(n))&&(s=!0))}return s}const nd=new WeakMap;function al(t,e,n=!1){const s=n?nd:e.propsCache,r=s.get(t);if(r)return r;const i=t.props,o={},a=[];let l=!1;if(!K(t)){const u=f=>{l=!0;const[d,m]=al(f,e,!0);ye(o,d),m&&a.push(...m)};!n&&e.mixins.length&&e.mixins.forEach(u),t.extends&&u(t.extends),t.mixins&&t.mixins.forEach(u)}if(!i&&!l)return Z(t)&&s.set(t,_n),_n;if(j(i))for(let u=0;u<i.length;u++){const f=Ve(i[u]);no(f)&&(o[f]=se)}else if(i)for(const u in i){const f=Ve(u);if(no(f)){const d=i[u],m=o[f]=j(d)||K(d)?{type:d}:ye({},d),v=m.type;let y=!1,b=!0;if(j(v))for(let E=0;E<v.length;++E){const C=v[E],L=K(C)&&C.name;if(L==="Boolean"){y=!0;break}else L==="String"&&(b=!1)}else y=K(v)&&v.name==="Boolean";m[0]=y,m[1]=b,(y||X(m,"default"))&&a.push(f)}}const c=[o,a];return Z(t)&&s.set(t,c),c}function no(t){return t[0]!=="$"&&!Gn(t)}const Ci=t=>t==="_"||t==="_ctx"||t==="$stable",Ti=t=>j(t)?t.map(tt):[tt(t)],sd=(t,e,n)=>{if(e._n)return e;const s=pn((...r)=>Ti(e(...r)),n);return s._c=!1,s},ll=(t,e,n)=>{const s=t._ctx;for(const r in t){if(Ci(r))continue;const i=t[r];if(K(i))e[r]=sd(r,i,s);else if(i!=null){const o=Ti(i);e[r]=()=>o}}},cl=(t,e)=>{const n=Ti(e);t.slots.default=()=>n},ul=(t,e,n)=>{for(const s in e)(n||!Ci(s))&&(t[s]=e[s])},rd=(t,e,n)=>{const s=t.slots=rl();if(t.vnode.shapeFlag&32){const r=e._;r?(ul(s,e,n),n&&va(s,"_",r,!0)):ll(e,s)}else e&&cl(t,e)},id=(t,e,n)=>{const{vnode:s,slots:r}=t;let i=!0,o=se;if(s.shapeFlag&32){const a=e._;a?n&&a===1?i=!1:ul(r,e,n):(i=!e.$stable,ll(e,r)),o=e}else e&&(cl(t,e),o={default:1});if(i)for(const a in r)!Ci(a)&&o[a]==null&&delete r[a]},ke=ud;function od(t){return ad(t)}function ad(t,e){const n=rr();n.__VUE__=!0;const{insert:s,remove:r,patchProp:i,createElement:o,createText:a,createComment:l,setText:c,setElementText:u,parentNode:f,nextSibling:d,setScopeId:m=it,insertStaticContent:v}=t,y=(p,g,_,I=null,T=null,w=null,k=void 0,O=null,R=!!g.dynamicChildren)=>{if(p===g)return;p&&!Bn(p,g)&&(I=S(p),Re(p,T,w,!0),p=null),g.patchFlag===-2&&(R=!1,g.dynamicChildren=null);const{type:A,ref:V,shapeFlag:D}=g;switch(A){case cr:b(p,g,_,I);break;case Kt:E(p,g,_,I);break;case Rs:p==null&&C(g,_,I,k);break;case ae:qt(p,g,_,I,T,w,k,O,R);break;default:D&1?te(p,g,_,I,T,w,k,O,R):D&6?qe(p,g,_,I,T,w,k,O,R):(D&64||D&128)&&A.process(p,g,_,I,T,w,k,O,R,U)}V!=null&&T?Jn(V,p&&p.ref,w,g||p,!g):V==null&&p&&p.ref!=null&&Jn(p.ref,null,w,p,!0)},b=(p,g,_,I)=>{if(p==null)s(g.el=a(g.children),_,I);else{const T=g.el=p.el;g.children!==p.children&&c(T,g.children)}},E=(p,g,_,I)=>{p==null?s(g.el=l(g.children||""),_,I):g.el=p.el},C=(p,g,_,I)=>{[p.el,p.anchor]=v(p.children,g,_,I,p.el,p.anchor)},L=({el:p,anchor:g},_,I)=>{let T;for(;p&&p!==g;)T=d(p),s(p,_,I),p=T;s(g,_,I)},M=({el:p,anchor:g})=>{let _;for(;p&&p!==g;)_=d(p),r(p),p=_;r(g)},te=(p,g,_,I,T,w,k,O,R)=>{if(g.type==="svg"?k="svg":g.type==="math"&&(k="mathml"),p==null)me(g,_,I,T,w,k,O,R);else{const A=p.el&&p.el._isVueCE?p.el:null;try{A&&A._beginPatch(),Rt(p,g,T,w,k,O,R)}finally{A&&A._endPatch()}}},me=(p,g,_,I,T,w,k,O)=>{let R,A;const{props:V,shapeFlag:D,transition:F,dirs:W}=p;if(R=p.el=o(p.type,w,V&&V.is,V),D&8?u(R,p.children):D&16&&Ge(p.children,R,null,I,T,Cr(p,w),k,O),W&&Yt(p,null,I,"created"),ce(R,p,p.scopeId,k,I),V){for(const ie in V)ie!=="value"&&!Gn(ie)&&i(R,ie,null,V[ie],w,I);"value"in V&&i(R,"value",null,V.value,w),(A=V.onVnodeBeforeMount)&&Ze(A,I,p)}W&&Yt(p,null,I,"beforeMount");const z=ld(T,F);z&&F.beforeEnter(R),s(R,g,_),((A=V&&V.onVnodeMounted)||z||W)&&ke(()=>{A&&Ze(A,I,p),z&&F.enter(R),W&&Yt(p,null,I,"mounted")},T)},ce=(p,g,_,I,T)=>{if(_&&m(p,_),I)for(let w=0;w<I.length;w++)m(p,I[w]);if(T){let w=T.subTree;if(g===w||pl(w.type)&&(w.ssContent===g||w.ssFallback===g)){const k=T.vnode;ce(p,k,k.scopeId,k.slotScopeIds,T.parent)}}},Ge=(p,g,_,I,T,w,k,O,R=0)=>{for(let A=R;A<p.length;A++){const V=p[A]=O?mt(p[A]):tt(p[A]);y(null,V,g,_,I,T,w,k,O)}},Rt=(p,g,_,I,T,w,k)=>{const O=g.el=p.el;let{patchFlag:R,dynamicChildren:A,dirs:V}=g;R|=p.patchFlag&16;const D=p.props||se,F=g.props||se;let W;if(_&&Xt(_,!1),(W=F.onVnodeBeforeUpdate)&&Ze(W,_,g,p),V&&Yt(g,p,_,"beforeUpdate"),_&&Xt(_,!0),(D.innerHTML&&F.innerHTML==null||D.textContent&&F.textContent==null)&&u(O,""),A?ze(p.dynamicChildren,A,O,_,I,Cr(g,T),w):k||q(p,g,O,null,_,I,Cr(g,T),w,!1),R>0){if(R&16)Pt(O,D,F,_,T);else if(R&2&&D.class!==F.class&&i(O,"class",null,F.class,T),R&4&&i(O,"style",D.style,F.style,T),R&8){const z=g.dynamicProps;for(let ie=0;ie<z.length;ie++){const Q=z[ie],Pe=D[Q],Oe=F[Q];(Oe!==Pe||Q==="value")&&i(O,Q,Pe,Oe,T,_)}}R&1&&p.children!==g.children&&u(O,g.children)}else!k&&A==null&&Pt(O,D,F,_,T);((W=F.onVnodeUpdated)||V)&&ke(()=>{W&&Ze(W,_,g,p),V&&Yt(g,p,_,"updated")},I)},ze=(p,g,_,I,T,w,k)=>{for(let O=0;O<g.length;O++){const R=p[O],A=g[O],V=R.el&&(R.type===ae||!Bn(R,A)||R.shapeFlag&198)?f(R.el):_;y(R,A,V,null,I,T,w,k,!0)}},Pt=(p,g,_,I,T)=>{if(g!==_){if(g!==se)for(const w in g)!Gn(w)&&!(w in _)&&i(p,w,g[w],null,T,I);for(const w in _){if(Gn(w))continue;const k=_[w],O=g[w];k!==O&&w!=="value"&&i(p,w,O,k,T,I)}"value"in _&&i(p,"value",g.value,_.value,T)}},qt=(p,g,_,I,T,w,k,O,R)=>{const A=g.el=p?p.el:a(""),V=g.anchor=p?p.anchor:a("");let{patchFlag:D,dynamicChildren:F,slotScopeIds:W}=g;W&&(O=O?O.concat(W):W),p==null?(s(A,_,I),s(V,_,I),Ge(g.children||[],_,V,T,w,k,O,R)):D>0&&D&64&&F&&p.dynamicChildren&&p.dynamicChildren.length===F.length?(ze(p.dynamicChildren,F,_,T,w,k,O),(g.key!=null||T&&g===T.subTree)&&dl(p,g,!0)):q(p,g,_,V,T,w,k,O,R)},qe=(p,g,_,I,T,w,k,O,R)=>{g.slotScopeIds=O,p==null?g.shapeFlag&512?T.ctx.activate(g,_,I,k,R):Fn(g,_,I,T,w,k,R):cn(p,g,R)},Fn=(p,g,_,I,T,w,k)=>{const O=p.component=yd(p,I,T);if(Ja(p)&&(O.ctx.renderer=U),bd(O,!1,k),O.asyncDep){if(T&&T.registerDep(O,ge,k),!p.el){const R=O.subTree=le(Kt);E(null,R,g,_),p.placeholder=R.el}}else ge(O,p,g,_,T,w,k)},cn=(p,g,_)=>{const I=g.component=p.component;if(Qu(p,g,_))if(I.asyncDep&&!I.asyncResolved){ee(I,g,_);return}else I.next=g,I.update();else g.el=p.el,I.vnode=g},ge=(p,g,_,I,T,w,k)=>{const O=()=>{if(p.isMounted){let{next:D,bu:F,u:W,parent:z,vnode:ie}=p;{const Xe=fl(p);if(Xe){D&&(D.el=ie.el,ee(p,D,k)),Xe.asyncDep.then(()=>{ke(()=>{p.isUnmounted||A()},T)});return}}let Q=D,Pe;Xt(p,!1),D?(D.el=ie.el,ee(p,D,k)):D=ie,F&&Ts(F),(Pe=D.props&&D.props.onVnodeBeforeUpdate)&&Ze(Pe,z,D,ie),Xt(p,!0);const Oe=eo(p),Ye=p.subTree;p.subTree=Oe,y(Ye,Oe,f(Ye.el),S(Ye),p,T,w),D.el=Oe.el,Q===null&&Zu(p,Oe.el),W&&ke(W,T),(Pe=D.props&&D.props.onVnodeUpdated)&&ke(()=>Ze(Pe,z,D,ie),T)}else{let D;const{el:F,props:W}=g,{bm:z,m:ie,parent:Q,root:Pe,type:Oe}=p,Ye=Yn(g);Xt(p,!1),z&&Ts(z),!Ye&&(D=W&&W.onVnodeBeforeMount)&&Ze(D,Q,g),Xt(p,!0);{Pe.ce&&Pe.ce._hasShadowRoot()&&Pe.ce._injectChildStyle(Oe);const Xe=p.subTree=eo(p);y(null,Xe,_,I,p,T,w),g.el=Xe.el}if(ie&&ke(ie,T),!Ye&&(D=W&&W.onVnodeMounted)){const Xe=g;ke(()=>Ze(D,Q,Xe),T)}(g.shapeFlag&256||Q&&Yn(Q.vnode)&&Q.vnode.shapeFlag&256)&&p.a&&ke(p.a,T),p.isMounted=!0,g=_=I=null}};p.scope.on();const R=p.effect=new wa(O);p.scope.off();const A=p.update=R.run.bind(R),V=p.job=R.runIfDirty.bind(R);V.i=p,V.id=p.uid,R.scheduler=()=>wi(V),Xt(p,!0),A()},ee=(p,g,_)=>{g.component=p;const I=p.vnode.props;p.vnode=g,p.next=null,td(p,g.props,I,_),id(p,g.children,_),Et(),Gi(p),It()},q=(p,g,_,I,T,w,k,O,R=!1)=>{const A=p&&p.children,V=p?p.shapeFlag:0,D=g.children,{patchFlag:F,shapeFlag:W}=g;if(F>0){if(F&128){Ot(A,D,_,I,T,w,k,O,R);return}else if(F&256){ft(A,D,_,I,T,w,k,O,R);return}}W&8?(V&16&&Ue(A,T,w),D!==A&&u(_,D)):V&16?W&16?Ot(A,D,_,I,T,w,k,O,R):Ue(A,T,w,!0):(V&8&&u(_,""),W&16&&Ge(D,_,I,T,w,k,O,R))},ft=(p,g,_,I,T,w,k,O,R)=>{p=p||_n,g=g||_n;const A=p.length,V=g.length,D=Math.min(A,V);let F;for(F=0;F<D;F++){const W=g[F]=R?mt(g[F]):tt(g[F]);y(p[F],W,_,null,T,w,k,O,R)}A>V?Ue(p,T,w,!0,!1,D):Ge(g,_,I,T,w,k,O,R,D)},Ot=(p,g,_,I,T,w,k,O,R)=>{let A=0;const V=g.length;let D=p.length-1,F=V-1;for(;A<=D&&A<=F;){const W=p[A],z=g[A]=R?mt(g[A]):tt(g[A]);if(Bn(W,z))y(W,z,_,null,T,w,k,O,R);else break;A++}for(;A<=D&&A<=F;){const W=p[D],z=g[F]=R?mt(g[F]):tt(g[F]);if(Bn(W,z))y(W,z,_,null,T,w,k,O,R);else break;D--,F--}if(A>D){if(A<=F){const W=F+1,z=W<V?g[W].el:I;for(;A<=F;)y(null,g[A]=R?mt(g[A]):tt(g[A]),_,z,T,w,k,O,R),A++}}else if(A>F)for(;A<=D;)Re(p[A],T,w,!0),A++;else{const W=A,z=A,ie=new Map;for(A=z;A<=F;A++){const De=g[A]=R?mt(g[A]):tt(g[A]);De.key!=null&&ie.set(De.key,A)}let Q,Pe=0;const Oe=F-z+1;let Ye=!1,Xe=0;const Vn=new Array(Oe);for(A=0;A<Oe;A++)Vn[A]=0;for(A=W;A<=D;A++){const De=p[A];if(Pe>=Oe){Re(De,T,w,!0);continue}let Qe;if(De.key!=null)Qe=ie.get(De.key);else for(Q=z;Q<=F;Q++)if(Vn[Q-z]===0&&Bn(De,g[Q])){Qe=Q;break}Qe===void 0?Re(De,T,w,!0):(Vn[Qe-z]=A+1,Qe>=Xe?Xe=Qe:Ye=!0,y(De,g[Qe],_,null,T,w,k,O,R),Pe++)}const Vi=Ye?cd(Vn):_n;for(Q=Vi.length-1,A=Oe-1;A>=0;A--){const De=z+A,Qe=g[De],$i=g[De+1],Bi=De+1<V?$i.el||hl($i):I;Vn[A]===0?y(null,Qe,_,Bi,T,w,k,O,R):Ye&&(Q<0||A!==Vi[Q]?Je(Qe,_,Bi,2):Q--)}}},Je=(p,g,_,I,T=null)=>{const{el:w,type:k,transition:O,children:R,shapeFlag:A}=p;if(A&6){Je(p.component.subTree,g,_,I);return}if(A&128){p.suspense.move(g,_,I);return}if(A&64){k.move(p,g,_,U);return}if(k===ae){s(w,g,_);for(let D=0;D<R.length;D++)Je(R[D],g,_,I);s(p.anchor,g,_);return}if(k===Rs){L(p,g,_);return}if(I!==2&&A&1&&O)if(I===0)O.beforeEnter(w),s(w,g,_),ke(()=>O.enter(w),T);else{const{leave:D,delayLeave:F,afterLeave:W}=O,z=()=>{p.ctx.isUnmounted?r(w):s(w,g,_)},ie=()=>{w._isLeaving&&w[Su](!0),D(w,()=>{z(),W&&W()})};F?F(w,z,ie):ie()}else s(w,g,_)},Re=(p,g,_,I=!1,T=!1)=>{const{type:w,props:k,ref:O,children:R,dynamicChildren:A,shapeFlag:V,patchFlag:D,dirs:F,cacheIndex:W}=p;if(D===-2&&(T=!1),O!=null&&(Et(),Jn(O,null,_,p,!0),It()),W!=null&&(g.renderCache[W]=void 0),V&256){g.ctx.deactivate(p);return}const z=V&1&&F,ie=!Yn(p);let Q;if(ie&&(Q=k&&k.onVnodeBeforeUnmount)&&Ze(Q,g,p),V&6)Jt(p.component,_,I);else{if(V&128){p.suspense.unmount(_,I);return}z&&Yt(p,null,g,"beforeUnmount"),V&64?p.type.remove(p,g,_,U,I):A&&!A.hasOnce&&(w!==ae||D>0&&D&64)?Ue(A,g,_,!1,!0):(w===ae&&D&384||!T&&V&16)&&Ue(R,g,_),I&&un(p)}(ie&&(Q=k&&k.onVnodeUnmounted)||z)&&ke(()=>{Q&&Ze(Q,g,p),z&&Yt(p,null,g,"unmounted")},_)},un=p=>{const{type:g,el:_,anchor:I,transition:T}=p;if(g===ae){dn(_,I);return}if(g===Rs){M(p);return}const w=()=>{r(_),T&&!T.persisted&&T.afterLeave&&T.afterLeave()};if(p.shapeFlag&1&&T&&!T.persisted){const{leave:k,delayLeave:O}=T,R=()=>k(_,w);O?O(p.el,w,R):R()}else w()},dn=(p,g)=>{let _;for(;p!==g;)_=d(p),r(p),p=_;r(g)},Jt=(p,g,_)=>{const{bum:I,scope:T,job:w,subTree:k,um:O,m:R,a:A}=p;so(R),so(A),I&&Ts(I),T.stop(),w&&(w.flags|=8,Re(k,p,g,_)),O&&ke(O,g),ke(()=>{p.isUnmounted=!0},g)},Ue=(p,g,_,I=!1,T=!1,w=0)=>{for(let k=w;k<p.length;k++)Re(p[k],g,_,I,T)},S=p=>{if(p.shapeFlag&6)return S(p.component.subTree);if(p.shapeFlag&128)return p.suspense.next();const g=d(p.anchor||p.el),_=g&&g[Iu];return _?d(_):g};let x=!1;const N=(p,g,_)=>{let I;p==null?g._vnode&&(Re(g._vnode,null,null,!0),I=g._vnode.component):y(g._vnode||null,p,g,null,null,null,_),g._vnode=p,x||(x=!0,Gi(I),Ha(),x=!1)},U={p:y,um:Re,m:Je,r:un,mt:Fn,mc:Ge,pc:q,pbc:ze,n:S,o:t};return{render:N,hydrate:void 0,createApp:Gu(N)}}function Cr({type:t,props:e},n){return n==="svg"&&t==="foreignObject"||n==="mathml"&&t==="annotation-xml"&&e&&e.encoding&&e.encoding.includes("html")?void 0:n}function Xt({effect:t,job:e},n){n?(t.flags|=32,e.flags|=4):(t.flags&=-33,e.flags&=-5)}function ld(t,e){return(!t||t&&!t.pendingBranch)&&e&&!e.persisted}function dl(t,e,n=!1){const s=t.children,r=e.children;if(j(s)&&j(r))for(let i=0;i<s.length;i++){const o=s[i];let a=r[i];a.shapeFlag&1&&!a.dynamicChildren&&((a.patchFlag<=0||a.patchFlag===32)&&(a=r[i]=mt(r[i]),a.el=o.el),!n&&a.patchFlag!==-2&&dl(o,a)),a.type===cr&&(a.patchFlag===-1&&(a=r[i]=mt(a)),a.el=o.el),a.type===Kt&&!a.el&&(a.el=o.el)}}function cd(t){const e=t.slice(),n=[0];let s,r,i,o,a;const l=t.length;for(s=0;s<l;s++){const c=t[s];if(c!==0){if(r=n[n.length-1],t[r]<c){e[s]=r,n.push(s);continue}for(i=0,o=n.length-1;i<o;)a=i+o>>1,t[n[a]]<c?i=a+1:o=a;c<t[n[i]]&&(i>0&&(e[s]=n[i-1]),n[i]=s)}}for(i=n.length,o=n[i-1];i-- >0;)n[i]=o,o=e[o];return n}function fl(t){const e=t.subTree.component;if(e)return e.asyncDep&&!e.asyncResolved?e:fl(e)}function so(t){if(t)for(let e=0;e<t.length;e++)t[e].flags|=8}function hl(t){if(t.placeholder)return t.placeholder;const e=t.component;return e?hl(e.subTree):null}const pl=t=>t.__isSuspense;function ud(t,e){e&&e.pendingBranch?j(t)?e.effects.push(...t):e.effects.push(t):yu(t)}const ae=Symbol.for("v-fgt"),cr=Symbol.for("v-txt"),Kt=Symbol.for("v-cmt"),Rs=Symbol.for("v-stc"),Qn=[];let Me=null;function $(t=!1){Qn.push(Me=t?null:[])}function dd(){Qn.pop(),Me=Qn[Qn.length-1]||null}let is=1;function Bs(t,e=!1){is+=t,t<0&&Me&&e&&(Me.hasOnce=!0)}function gl(t){return t.dynamicChildren=is>0?Me||_n:null,dd(),is>0&&Me&&Me.push(t),t}function H(t,e,n,s,r,i){return gl(h(t,e,n,s,r,i,!0))}function ml(t,e,n,s,r){return gl(le(t,e,n,s,r,!0))}function Hs(t){return t?t.__v_isVNode===!0:!1}function Bn(t,e){return t.type===e.type&&t.key===e.key}const _l=({key:t})=>t??null,Ps=({ref:t,ref_key:e,ref_for:n})=>(typeof t=="number"&&(t=""+t),t!=null?fe(t)||Ie(t)||K(t)?{i:Le,r:t,k:e,f:!!n}:t:null);function h(t,e=null,n=null,s=0,r=null,i=t===ae?0:1,o=!1,a=!1){const l={__v_isVNode:!0,__v_skip:!0,type:t,props:e,key:e&&_l(e),ref:e&&Ps(e),scopeId:Wa,slotScopeIds:null,children:n,component:null,suspense:null,ssContent:null,ssFallback:null,dirs:null,transition:null,el:null,anchor:null,target:null,targetStart:null,targetAnchor:null,staticCount:0,shapeFlag:i,patchFlag:s,dynamicProps:r,dynamicChildren:null,appContext:null,ctx:Le};return a?(Ai(l,n),i&128&&t.normalize(l)):n&&(l.shapeFlag|=fe(n)?8:16),is>0&&!o&&Me&&(l.patchFlag>0||i&6)&&l.patchFlag!==32&&Me.push(l),l}const le=fd;function fd(t,e=null,n=null,s=0,r=null,i=!1){if((!t||t===Uu)&&(t=Kt),Hs(t)){const a=Rn(t,e,!0);return n&&Ai(a,n),is>0&&!i&&Me&&(a.shapeFlag&6?Me[Me.indexOf(t)]=a:Me.push(a)),a.patchFlag=-2,a}if(Cd(t)&&(t=t.__vccOpts),e){e=hd(e);let{class:a,style:l}=e;a&&!fe(a)&&(e.class=rt(a)),Z(l)&&(Ei(l)&&!j(l)&&(l=ye({},l)),e.style=pi(l))}const o=fe(t)?1:pl(t)?128:wu(t)?64:Z(t)?4:K(t)?2:0;return h(t,e,n,s,r,o,i,!0)}function hd(t){return t?Ei(t)||il(t)?ye({},t):t:null}function Rn(t,e,n=!1,s=!1){const{props:r,ref:i,patchFlag:o,children:a,transition:l}=t,c=e?gd(r||{},e):r,u={__v_isVNode:!0,__v_skip:!0,type:t.type,props:c,key:c&&_l(c),ref:e&&e.ref?n&&i?j(i)?i.concat(Ps(e)):[i,Ps(e)]:Ps(e):i,scopeId:t.scopeId,slotScopeIds:t.slotScopeIds,children:a,target:t.target,targetStart:t.targetStart,targetAnchor:t.targetAnchor,staticCount:t.staticCount,shapeFlag:t.shapeFlag,patchFlag:e&&t.type!==ae?o===-1?16:o|16:o,dynamicProps:t.dynamicProps,dynamicChildren:t.dynamicChildren,appContext:t.appContext,dirs:t.dirs,transition:l,component:t.component,suspense:t.suspense,ssContent:t.ssContent&&Rn(t.ssContent),ssFallback:t.ssFallback&&Rn(t.ssFallback),placeholder:t.placeholder,el:t.el,anchor:t.anchor,ctx:t.ctx,ce:t.ce};return l&&s&&Si(u,l.clone(u)),u}function nt(t=" ",e=0){return le(cr,null,t,e)}function pd(t,e){const n=le(Rs,null,t);return n.staticCount=e,n}function Pn(t="",e=!1){return e?($(),ml(Kt,null,t)):le(Kt,null,t)}function tt(t){return t==null||typeof t=="boolean"?le(Kt):j(t)?le(ae,null,t.slice()):Hs(t)?mt(t):le(cr,null,String(t))}function mt(t){return t.el===null&&t.patchFlag!==-1||t.memo?t:Rn(t)}function Ai(t,e){let n=0;const{shapeFlag:s}=t;if(e==null)e=null;else if(j(e))n=16;else if(typeof e=="object")if(s&65){const r=e.default;r&&(r._c&&(r._d=!1),Ai(t,r()),r._c&&(r._d=!0));return}else{n=32;const r=e._;!r&&!il(e)?e._ctx=Le:r===3&&Le&&(Le.slots._===1?e._=1:(e._=2,t.patchFlag|=1024))}else K(e)?(e={default:e,_ctx:Le},n=32):(e=String(e),s&64?(n=16,e=[nt(e)]):n=8);t.children=e,t.shapeFlag|=n}function gd(...t){const e={};for(let n=0;n<t.length;n++){const s=t[n];for(const r in s)if(r==="class")e.class!==s.class&&(e.class=rt([e.class,s.class]));else if(r==="style")e.style=pi([e.style,s.style]);else if(Zs(r)){const i=e[r],o=s[r];o&&i!==o&&!(j(i)&&i.includes(o))&&(e[r]=i?[].concat(i,o):o)}else r!==""&&(e[r]=s[r])}return e}function Ze(t,e,n,s=null){dt(t,e,7,[n,s])}const md=el();let _d=0;function yd(t,e,n){const s=t.type,r=(e?e.appContext:t.appContext)||md,i={uid:_d++,vnode:t,type:s,parent:e,appContext:r,root:null,next:null,subTree:null,effect:null,update:null,job:null,scope:new Hc(!0),render:null,proxy:null,exposed:null,exposeProxy:null,withProxy:null,provides:e?e.provides:Object.create(r.provides),ids:e?e.ids:["",0,0],accessCache:null,renderCache:[],components:null,directives:null,propsOptions:al(s,r),emitsOptions:tl(s,r),emit:null,emitted:null,propsDefaults:se,inheritAttrs:s.inheritAttrs,ctx:se,data:se,props:se,attrs:se,slots:se,refs:se,setupState:se,setupContext:null,suspense:n,suspenseId:n?n.pendingId:0,asyncDep:null,asyncResolved:!1,isMounted:!1,isUnmounted:!1,isDeactivated:!1,bc:null,c:null,bm:null,m:null,bu:null,u:null,um:null,bum:null,da:null,a:null,rtg:null,rtc:null,ec:null,sp:null};return i.ctx={_:i},i.root=e?e.root:i,i.emit=qu.bind(null,i),t.ce&&t.ce(i),i}let Ee=null;const vd=()=>Ee||Le;let js,Jr;{const t=rr(),e=(n,s)=>{let r;return(r=t[n])||(r=t[n]=[]),r.push(s),i=>{r.length>1?r.forEach(o=>o(i)):r[0](i)}};js=e("__VUE_INSTANCE_SETTERS__",n=>Ee=n),Jr=e("__VUE_SSR_SETTERS__",n=>os=n)}const gs=t=>{const e=Ee;return js(t),t.scope.on(),()=>{t.scope.off(),js(e)}},ro=()=>{Ee&&Ee.scope.off(),js(null)};function yl(t){return t.vnode.shapeFlag&4}let os=!1;function bd(t,e=!1,n=!1){e&&Jr(e);const{props:s,children:r}=t.vnode,i=yl(t);ed(t,s,i,e),rd(t,r,n||e);const o=i?Ed(t,e):void 0;return e&&Jr(!1),o}function Ed(t,e){const n=t.type;t.accessCache=Object.create(null),t.proxy=new Proxy(t.ctx,Vu);const{setup:s}=n;if(s){Et();const r=t.setupContext=s.length>1?wd(t):null,i=gs(t),o=ps(s,t,0,[t.props,r]),a=ma(o);if(It(),i(),(a||t.sp)&&!Yn(t)&&qa(t),a){if(o.then(ro,ro),e)return o.then(l=>{io(t,l)}).catch(l=>{or(l,t,0)});t.asyncDep=o}else io(t,o)}else vl(t)}function io(t,e,n){K(e)?t.type.__ssrInlineRender?t.ssrRender=e:t.render=e:Z(e)&&(t.setupState=Va(e)),vl(t)}function vl(t,e,n){const s=t.type;t.render||(t.render=s.render||it);{const r=gs(t);Et();try{$u(t)}finally{It(),r()}}}const Id={get(t,e){return ve(t,"get",""),t[e]}};function wd(t){const e=n=>{t.exposed=n||{}};return{attrs:new Proxy(t.attrs,Id),slots:t.slots,emit:t.emit,expose:e}}function ur(t){return t.exposed?t.exposeProxy||(t.exposeProxy=new Proxy(Va(lu(t.exposed)),{get(e,n){if(n in e)return e[n];if(n in Xn)return Xn[n](t)},has(e,n){return n in e||n in Xn}})):t.proxy}function Sd(t,e=!0){return K(t)?t.displayName||t.name:t.name||e&&t.__name}function Cd(t){return K(t)&&"__vccOpts"in t}const Te=(t,e)=>hu(t,e,os);function bl(t,e,n){try{Bs(-1);const s=arguments.length;return s===2?Z(e)&&!j(e)?Hs(e)?le(t,null,[e]):le(t,e):le(t,null,e):(s>3?n=Array.prototype.slice.call(arguments,2):s===3&&Hs(n)&&(n=[n]),le(t,e,n))}finally{Bs(1)}}const Td="3.5.29";/**
* @vue/runtime-dom v3.5.29
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/let Yr;const oo=typeof window<"u"&&window.trustedTypes;if(oo)try{Yr=oo.createPolicy("vue",{createHTML:t=>t})}catch{}const El=Yr?t=>Yr.createHTML(t):t=>t,Ad="http://www.w3.org/2000/svg",Rd="http://www.w3.org/1998/Math/MathML",gt=typeof document<"u"?document:null,ao=gt&&gt.createElement("template"),Pd={insert:(t,e,n)=>{e.insertBefore(t,n||null)},remove:t=>{const e=t.parentNode;e&&e.removeChild(t)},createElement:(t,e,n,s)=>{const r=e==="svg"?gt.createElementNS(Ad,t):e==="mathml"?gt.createElementNS(Rd,t):n?gt.createElement(t,{is:n}):gt.createElement(t);return t==="select"&&s&&s.multiple!=null&&r.setAttribute("multiple",s.multiple),r},createText:t=>gt.createTextNode(t),createComment:t=>gt.createComment(t),setText:(t,e)=>{t.nodeValue=e},setElementText:(t,e)=>{t.textContent=e},parentNode:t=>t.parentNode,nextSibling:t=>t.nextSibling,querySelector:t=>gt.querySelector(t),setScopeId(t,e){t.setAttribute(e,"")},insertStaticContent(t,e,n,s,r,i){const o=n?n.previousSibling:e.lastChild;if(r&&(r===i||r.nextSibling))for(;e.insertBefore(r.cloneNode(!0),n),!(r===i||!(r=r.nextSibling)););else{ao.innerHTML=El(s==="svg"?`<svg>${t}</svg>`:s==="mathml"?`<math>${t}</math>`:t);const a=ao.content;if(s==="svg"||s==="mathml"){const l=a.firstChild;for(;l.firstChild;)a.appendChild(l.firstChild);a.removeChild(l)}e.insertBefore(a,n)}return[o?o.nextSibling:e.firstChild,n?n.previousSibling:e.lastChild]}},Od=Symbol("_vtc");function kd(t,e,n){const s=t[Od];s&&(e=(e?[e,...s]:[...s]).join(" ")),e==null?t.removeAttribute("class"):n?t.setAttribute("class",e):t.className=e}const lo=Symbol("_vod"),Nd=Symbol("_vsh"),Dd=Symbol(""),xd=/(?:^|;)\s*display\s*:/;function Ld(t,e,n){const s=t.style,r=fe(n);let i=!1;if(n&&!r){if(e)if(fe(e))for(const o of e.split(";")){const a=o.slice(0,o.indexOf(":")).trim();n[a]==null&&Os(s,a,"")}else for(const o in e)n[o]==null&&Os(s,o,"");for(const o in n)o==="display"&&(i=!0),Os(s,o,n[o])}else if(r){if(e!==n){const o=s[Dd];o&&(n+=";"+o),s.cssText=n,i=xd.test(n)}}else e&&t.removeAttribute("style");lo in t&&(t[lo]=i?s.display:"",t[Nd]&&(s.display="none"))}const co=/\s*!important$/;function Os(t,e,n){if(j(n))n.forEach(s=>Os(t,e,s));else if(n==null&&(n=""),e.startsWith("--"))t.setProperty(e,n);else{const s=Md(t,e);co.test(n)?t.setProperty(an(s),n.replace(co,""),"important"):t[s]=n}}const uo=["Webkit","Moz","ms"],Tr={};function Md(t,e){const n=Tr[e];if(n)return n;let s=Ve(e);if(s!=="filter"&&s in t)return Tr[e]=s;s=nr(s);for(let r=0;r<uo.length;r++){const i=uo[r]+s;if(i in t)return Tr[e]=i}return e}const fo="http://www.w3.org/1999/xlink";function ho(t,e,n,s,r,i=Vc(e)){s&&e.startsWith("xlink:")?n==null?t.removeAttributeNS(fo,e.slice(6,e.length)):t.setAttributeNS(fo,e,n):n==null||i&&!ba(n)?t.removeAttribute(e):t.setAttribute(e,i?"":ct(n)?String(n):n)}function po(t,e,n,s,r){if(e==="innerHTML"||e==="textContent"){n!=null&&(t[e]=e==="innerHTML"?El(n):n);return}const i=t.tagName;if(e==="value"&&i!=="PROGRESS"&&!i.includes("-")){const a=i==="OPTION"?t.getAttribute("value")||"":t.value,l=n==null?t.type==="checkbox"?"on":"":String(n);(a!==l||!("_value"in t))&&(t.value=l),n==null&&t.removeAttribute(e),t._value=n;return}let o=!1;if(n===""||n==null){const a=typeof t[e];a==="boolean"?n=ba(n):n==null&&a==="string"?(n="",o=!0):a==="number"&&(n=0,o=!0)}try{t[e]=n}catch{}o&&t.removeAttribute(r||e)}function en(t,e,n,s){t.addEventListener(e,n,s)}function Ud(t,e,n,s){t.removeEventListener(e,n,s)}const go=Symbol("_vei");function Fd(t,e,n,s,r=null){const i=t[go]||(t[go]={}),o=i[e];if(s&&o)o.value=s;else{const[a,l]=Vd(e);if(s){const c=i[e]=Hd(s,r);en(t,a,c,l)}else o&&(Ud(t,a,o,l),i[e]=void 0)}}const mo=/(?:Once|Passive|Capture)$/;function Vd(t){let e;if(mo.test(t)){e={};let s;for(;s=t.match(mo);)t=t.slice(0,t.length-s[0].length),e[s[0].toLowerCase()]=!0}return[t[2]===":"?t.slice(3):an(t.slice(2)),e]}let Ar=0;const $d=Promise.resolve(),Bd=()=>Ar||($d.then(()=>Ar=0),Ar=Date.now());function Hd(t,e){const n=s=>{if(!s._vts)s._vts=Date.now();else if(s._vts<=n.attached)return;dt(jd(s,n.value),e,5,[s])};return n.value=t,n.attached=Bd(),n}function jd(t,e){if(j(e)){const n=t.stopImmediatePropagation;return t.stopImmediatePropagation=()=>{n.call(t),t._stopped=!0},e.map(s=>r=>!r._stopped&&s&&s(r))}else return e}const _o=t=>t.charCodeAt(0)===111&&t.charCodeAt(1)===110&&t.charCodeAt(2)>96&&t.charCodeAt(2)<123,Wd=(t,e,n,s,r,i)=>{const o=r==="svg";e==="class"?kd(t,s,o):e==="style"?Ld(t,n,s):Zs(e)?di(e)||Fd(t,e,n,s,i):(e[0]==="."?(e=e.slice(1),!0):e[0]==="^"?(e=e.slice(1),!1):Kd(t,e,s,o))?(po(t,e,s),!t.tagName.includes("-")&&(e==="value"||e==="checked"||e==="selected")&&ho(t,e,s,o,i,e!=="value")):t._isVueCE&&(/[A-Z]/.test(e)||!fe(s))?po(t,Ve(e),s,i,e):(e==="true-value"?t._trueValue=s:e==="false-value"&&(t._falseValue=s),ho(t,e,s,o))};function Kd(t,e,n,s){if(s)return!!(e==="innerHTML"||e==="textContent"||e in t&&_o(e)&&K(n));if(e==="spellcheck"||e==="draggable"||e==="translate"||e==="autocorrect"||e==="sandbox"&&t.tagName==="IFRAME"||e==="form"||e==="list"&&t.tagName==="INPUT"||e==="type"&&t.tagName==="TEXTAREA")return!1;if(e==="width"||e==="height"){const r=t.tagName;if(r==="IMG"||r==="VIDEO"||r==="CANVAS"||r==="SOURCE")return!1}return _o(e)&&fe(n)?!1:e in t}const Ws=t=>{const e=t.props["onUpdate:modelValue"]||!1;return j(e)?n=>Ts(e,n):e};function Gd(t){t.target.composing=!0}function yo(t){const e=t.target;e.composing&&(e.composing=!1,e.dispatchEvent(new Event("input")))}const In=Symbol("_assign");function vo(t,e,n){return e&&(t=t.trim()),n&&(t=sr(t)),t}const xe={created(t,{modifiers:{lazy:e,trim:n,number:s}},r){t[In]=Ws(r);const i=s||r.props&&r.props.type==="number";en(t,e?"change":"input",o=>{o.target.composing||t[In](vo(t.value,n,i))}),(n||i)&&en(t,"change",()=>{t.value=vo(t.value,n,i)}),e||(en(t,"compositionstart",Gd),en(t,"compositionend",yo),en(t,"change",yo))},mounted(t,{value:e}){t.value=e??""},beforeUpdate(t,{value:e,oldValue:n,modifiers:{lazy:s,trim:r,number:i}},o){if(t[In]=Ws(o),t.composing)return;const a=(i||t.type==="number")&&!/^0\d/.test(t.value)?sr(t.value):t.value,l=e??"";a!==l&&(document.activeElement===t&&t.type!=="range"&&(s&&e===n||r&&t.value.trim()===l)||(t.value=l))}},ks={deep:!0,created(t,{value:e,modifiers:{number:n}},s){const r=er(e);en(t,"change",()=>{const i=Array.prototype.filter.call(t.options,o=>o.selected).map(o=>n?sr(Ks(o)):Ks(o));t[In](t.multiple?r?new Set(i):i:i[0]),t._assigning=!0,Ii(()=>{t._assigning=!1})}),t[In]=Ws(s)},mounted(t,{value:e}){bo(t,e)},beforeUpdate(t,e,n){t[In]=Ws(n)},updated(t,{value:e}){t._assigning||bo(t,e)}};function bo(t,e){const n=t.multiple,s=j(e);if(!(n&&!s&&!er(e))){for(let r=0,i=t.options.length;r<i;r++){const o=t.options[r],a=Ks(o);if(n)if(s){const l=typeof a;l==="string"||l==="number"?o.selected=e.some(c=>String(c)===String(a)):o.selected=Bc(e,a)>-1}else o.selected=e.has(a);else if(hs(Ks(o),e)){t.selectedIndex!==r&&(t.selectedIndex=r);return}}!n&&t.selectedIndex!==-1&&(t.selectedIndex=-1)}}function Ks(t){return"_value"in t?t._value:t.value}const zd=["ctrl","shift","alt","meta"],qd={stop:t=>t.stopPropagation(),prevent:t=>t.preventDefault(),self:t=>t.target!==t.currentTarget,ctrl:t=>!t.ctrlKey,shift:t=>!t.shiftKey,alt:t=>!t.altKey,meta:t=>!t.metaKey,left:t=>"button"in t&&t.button!==0,middle:t=>"button"in t&&t.button!==1,right:t=>"button"in t&&t.button!==2,exact:(t,e)=>zd.some(n=>t[`${n}Key`]&&!e.includes(n))},Il=(t,e)=>{if(!t)return t;const n=t._withMods||(t._withMods={}),s=e.join(".");return n[s]||(n[s]=((r,...i)=>{for(let o=0;o<e.length;o++){const a=qd[e[o]];if(a&&a(r,e))return}return t(r,...i)}))},Jd=ye({patchProp:Wd},Pd);let Eo;function Yd(){return Eo||(Eo=od(Jd))}const Xd=((...t)=>{const e=Yd().createApp(...t),{mount:n}=e;return e.mount=s=>{const r=Zd(s);if(!r)return;const i=e._component;!K(i)&&!i.render&&!i.template&&(i.template=r.innerHTML),r.nodeType===1&&(r.textContent="");const o=n(r,!1,Qd(r));return r instanceof Element&&(r.removeAttribute("v-cloak"),r.setAttribute("data-v-app","")),o},e});function Qd(t){if(t instanceof SVGElement)return"svg";if(typeof MathMLElement=="function"&&t instanceof MathMLElement)return"mathml"}function Zd(t){return fe(t)?document.querySelector(t):t}const ef=(t,e)=>{const n=t.__vccOpts||t;for(const[s,r]of e)n[s]=r;return n},tf={};function nf(t,e){const n=Wr("router-view");return $(),ml(n)}const sf=ef(tf,[["render",nf]]);/*!
 * vue-router v4.6.4
 * (c) 2025 Eduardo San Martin Morote
 * @license MIT
 */const gn=typeof document<"u";function wl(t){return typeof t=="object"||"displayName"in t||"props"in t||"__vccOpts"in t}function rf(t){return t.__esModule||t[Symbol.toStringTag]==="Module"||t.default&&wl(t.default)}const J=Object.assign;function Rr(t,e){const n={};for(const s in e){const r=e[s];n[s]=We(r)?r.map(t):t(r)}return n}const Zn=()=>{},We=Array.isArray;function Io(t,e){const n={};for(const s in t)n[s]=s in e?e[s]:t[s];return n}const Sl=/#/g,of=/&/g,af=/\//g,lf=/=/g,cf=/\?/g,Cl=/\+/g,uf=/%5B/g,df=/%5D/g,Tl=/%5E/g,ff=/%60/g,Al=/%7B/g,hf=/%7C/g,Rl=/%7D/g,pf=/%20/g;function Ri(t){return t==null?"":encodeURI(""+t).replace(hf,"|").replace(uf,"[").replace(df,"]")}function gf(t){return Ri(t).replace(Al,"{").replace(Rl,"}").replace(Tl,"^")}function Xr(t){return Ri(t).replace(Cl,"%2B").replace(pf,"+").replace(Sl,"%23").replace(of,"%26").replace(ff,"`").replace(Al,"{").replace(Rl,"}").replace(Tl,"^")}function mf(t){return Xr(t).replace(lf,"%3D")}function _f(t){return Ri(t).replace(Sl,"%23").replace(cf,"%3F")}function yf(t){return _f(t).replace(af,"%2F")}function as(t){if(t==null)return null;try{return decodeURIComponent(""+t)}catch{}return""+t}const vf=/\/$/,bf=t=>t.replace(vf,"");function Pr(t,e,n="/"){let s,r={},i="",o="";const a=e.indexOf("#");let l=e.indexOf("?");return l=a>=0&&l>a?-1:l,l>=0&&(s=e.slice(0,l),i=e.slice(l,a>0?a:e.length),r=t(i.slice(1))),a>=0&&(s=s||e.slice(0,a),o=e.slice(a,e.length)),s=Sf(s??e,n),{fullPath:s+i+o,path:s,query:r,hash:as(o)}}function Ef(t,e){const n=e.query?t(e.query):"";return e.path+(n&&"?")+n+(e.hash||"")}function wo(t,e){return!e||!t.toLowerCase().startsWith(e.toLowerCase())?t:t.slice(e.length)||"/"}function If(t,e,n){const s=e.matched.length-1,r=n.matched.length-1;return s>-1&&s===r&&On(e.matched[s],n.matched[r])&&Pl(e.params,n.params)&&t(e.query)===t(n.query)&&e.hash===n.hash}function On(t,e){return(t.aliasOf||t)===(e.aliasOf||e)}function Pl(t,e){if(Object.keys(t).length!==Object.keys(e).length)return!1;for(var n in t)if(!wf(t[n],e[n]))return!1;return!0}function wf(t,e){return We(t)?So(t,e):We(e)?So(e,t):(t==null?void 0:t.valueOf())===(e==null?void 0:e.valueOf())}function So(t,e){return We(e)?t.length===e.length&&t.every((n,s)=>n===e[s]):t.length===1&&t[0]===e}function Sf(t,e){if(t.startsWith("/"))return t;if(!t)return e;const n=e.split("/"),s=t.split("/"),r=s[s.length-1];(r===".."||r===".")&&s.push("");let i=n.length-1,o,a;for(o=0;o<s.length;o++)if(a=s[o],a!==".")if(a==="..")i>1&&i--;else break;return n.slice(0,i).join("/")+"/"+s.slice(o).join("/")}const kt={path:"/",name:void 0,params:{},query:{},hash:"",fullPath:"/",matched:[],meta:{},redirectedFrom:void 0};let Qr=(function(t){return t.pop="pop",t.push="push",t})({}),Or=(function(t){return t.back="back",t.forward="forward",t.unknown="",t})({});function Cf(t){if(!t)if(gn){const e=document.querySelector("base");t=e&&e.getAttribute("href")||"/",t=t.replace(/^\w+:\/\/[^\/]+/,"")}else t="/";return t[0]!=="/"&&t[0]!=="#"&&(t="/"+t),bf(t)}const Tf=/^[^#]+#/;function Af(t,e){return t.replace(Tf,"#")+e}function Rf(t,e){const n=document.documentElement.getBoundingClientRect(),s=t.getBoundingClientRect();return{behavior:e.behavior,left:s.left-n.left-(e.left||0),top:s.top-n.top-(e.top||0)}}const dr=()=>({left:window.scrollX,top:window.scrollY});function Pf(t){let e;if("el"in t){const n=t.el,s=typeof n=="string"&&n.startsWith("#"),r=typeof n=="string"?s?document.getElementById(n.slice(1)):document.querySelector(n):n;if(!r)return;e=Rf(r,t)}else e=t;"scrollBehavior"in document.documentElement.style?window.scrollTo(e):window.scrollTo(e.left!=null?e.left:window.scrollX,e.top!=null?e.top:window.scrollY)}function Co(t,e){return(history.state?history.state.position-e:-1)+t}const Zr=new Map;function Of(t,e){Zr.set(t,e)}function kf(t){const e=Zr.get(t);return Zr.delete(t),e}function Nf(t){return typeof t=="string"||t&&typeof t=="object"}function Ol(t){return typeof t=="string"||typeof t=="symbol"}let ue=(function(t){return t[t.MATCHER_NOT_FOUND=1]="MATCHER_NOT_FOUND",t[t.NAVIGATION_GUARD_REDIRECT=2]="NAVIGATION_GUARD_REDIRECT",t[t.NAVIGATION_ABORTED=4]="NAVIGATION_ABORTED",t[t.NAVIGATION_CANCELLED=8]="NAVIGATION_CANCELLED",t[t.NAVIGATION_DUPLICATED=16]="NAVIGATION_DUPLICATED",t})({});const kl=Symbol("");ue.MATCHER_NOT_FOUND+"",ue.NAVIGATION_GUARD_REDIRECT+"",ue.NAVIGATION_ABORTED+"",ue.NAVIGATION_CANCELLED+"",ue.NAVIGATION_DUPLICATED+"";function kn(t,e){return J(new Error,{type:t,[kl]:!0},e)}function pt(t,e){return t instanceof Error&&kl in t&&(e==null||!!(t.type&e))}const Df=["params","query","hash"];function xf(t){if(typeof t=="string")return t;if(t.path!=null)return t.path;const e={};for(const n of Df)n in t&&(e[n]=t[n]);return JSON.stringify(e,null,2)}function Lf(t){const e={};if(t===""||t==="?")return e;const n=(t[0]==="?"?t.slice(1):t).split("&");for(let s=0;s<n.length;++s){const r=n[s].replace(Cl," "),i=r.indexOf("="),o=as(i<0?r:r.slice(0,i)),a=i<0?null:as(r.slice(i+1));if(o in e){let l=e[o];We(l)||(l=e[o]=[l]),l.push(a)}else e[o]=a}return e}function To(t){let e="";for(let n in t){const s=t[n];if(n=mf(n),s==null){s!==void 0&&(e+=(e.length?"&":"")+n);continue}(We(s)?s.map(r=>r&&Xr(r)):[s&&Xr(s)]).forEach(r=>{r!==void 0&&(e+=(e.length?"&":"")+n,r!=null&&(e+="="+r))})}return e}function Mf(t){const e={};for(const n in t){const s=t[n];s!==void 0&&(e[n]=We(s)?s.map(r=>r==null?null:""+r):s==null?s:""+s)}return e}const Uf=Symbol(""),Ao=Symbol(""),fr=Symbol(""),Nl=Symbol(""),ei=Symbol("");function Hn(){let t=[];function e(s){return t.push(s),()=>{const r=t.indexOf(s);r>-1&&t.splice(r,1)}}function n(){t=[]}return{add:e,list:()=>t.slice(),reset:n}}function Lt(t,e,n,s,r,i=o=>o()){const o=s&&(s.enterCallbacks[r]=s.enterCallbacks[r]||[]);return()=>new Promise((a,l)=>{const c=d=>{d===!1?l(kn(ue.NAVIGATION_ABORTED,{from:n,to:e})):d instanceof Error?l(d):Nf(d)?l(kn(ue.NAVIGATION_GUARD_REDIRECT,{from:e,to:d})):(o&&s.enterCallbacks[r]===o&&typeof d=="function"&&o.push(d),a())},u=i(()=>t.call(s&&s.instances[r],e,n,c));let f=Promise.resolve(u);t.length<3&&(f=f.then(c)),f.catch(d=>l(d))})}function kr(t,e,n,s,r=i=>i()){const i=[];for(const o of t)for(const a in o.components){let l=o.components[a];if(!(e!=="beforeRouteEnter"&&!o.instances[a]))if(wl(l)){const c=(l.__vccOpts||l)[e];c&&i.push(Lt(c,n,s,o,a,r))}else{let c=l();i.push(()=>c.then(u=>{if(!u)throw new Error(`Couldn't resolve component "${a}" at "${o.path}"`);const f=rf(u)?u.default:u;o.mods[a]=u,o.components[a]=f;const d=(f.__vccOpts||f)[e];return d&&Lt(d,n,s,o,a,r)()}))}}return i}function Ff(t,e){const n=[],s=[],r=[],i=Math.max(e.matched.length,t.matched.length);for(let o=0;o<i;o++){const a=e.matched[o];a&&(t.matched.find(c=>On(c,a))?s.push(a):n.push(a));const l=t.matched[o];l&&(e.matched.find(c=>On(c,l))||r.push(l))}return[n,s,r]}/*!
 * vue-router v4.6.4
 * (c) 2025 Eduardo San Martin Morote
 * @license MIT
 */let Vf=()=>location.protocol+"//"+location.host;function Dl(t,e){const{pathname:n,search:s,hash:r}=e,i=t.indexOf("#");if(i>-1){let o=r.includes(t.slice(i))?t.slice(i).length:1,a=r.slice(o);return a[0]!=="/"&&(a="/"+a),wo(a,"")}return wo(n,t)+s+r}function $f(t,e,n,s){let r=[],i=[],o=null;const a=({state:d})=>{const m=Dl(t,location),v=n.value,y=e.value;let b=0;if(d){if(n.value=m,e.value=d,o&&o===v){o=null;return}b=y?d.position-y.position:0}else s(m);r.forEach(E=>{E(n.value,v,{delta:b,type:Qr.pop,direction:b?b>0?Or.forward:Or.back:Or.unknown})})};function l(){o=n.value}function c(d){r.push(d);const m=()=>{const v=r.indexOf(d);v>-1&&r.splice(v,1)};return i.push(m),m}function u(){if(document.visibilityState==="hidden"){const{history:d}=window;if(!d.state)return;d.replaceState(J({},d.state,{scroll:dr()}),"")}}function f(){for(const d of i)d();i=[],window.removeEventListener("popstate",a),window.removeEventListener("pagehide",u),document.removeEventListener("visibilitychange",u)}return window.addEventListener("popstate",a),window.addEventListener("pagehide",u),document.addEventListener("visibilitychange",u),{pauseListeners:l,listen:c,destroy:f}}function Ro(t,e,n,s=!1,r=!1){return{back:t,current:e,forward:n,replaced:s,position:window.history.length,scroll:r?dr():null}}function Bf(t){const{history:e,location:n}=window,s={value:Dl(t,n)},r={value:e.state};r.value||i(s.value,{back:null,current:s.value,forward:null,position:e.length-1,replaced:!0,scroll:null},!0);function i(l,c,u){const f=t.indexOf("#"),d=f>-1?(n.host&&document.querySelector("base")?t:t.slice(f))+l:Vf()+t+l;try{e[u?"replaceState":"pushState"](c,"",d),r.value=c}catch(m){console.error(m),n[u?"replace":"assign"](d)}}function o(l,c){i(l,J({},e.state,Ro(r.value.back,l,r.value.forward,!0),c,{position:r.value.position}),!0),s.value=l}function a(l,c){const u=J({},r.value,e.state,{forward:l,scroll:dr()});i(u.current,u,!0),i(l,J({},Ro(s.value,l,null),{position:u.position+1},c),!1),s.value=l}return{location:s,state:r,push:a,replace:o}}function Hf(t){t=Cf(t);const e=Bf(t),n=$f(t,e.state,e.location,e.replace);function s(i,o=!0){o||n.pauseListeners(),history.go(i)}const r=J({location:"",base:t,go:s,createHref:Af.bind(null,t)},e,n);return Object.defineProperty(r,"location",{enumerable:!0,get:()=>e.location.value}),Object.defineProperty(r,"state",{enumerable:!0,get:()=>e.state.value}),r}let tn=(function(t){return t[t.Static=0]="Static",t[t.Param=1]="Param",t[t.Group=2]="Group",t})({});var he=(function(t){return t[t.Static=0]="Static",t[t.Param=1]="Param",t[t.ParamRegExp=2]="ParamRegExp",t[t.ParamRegExpEnd=3]="ParamRegExpEnd",t[t.EscapeNext=4]="EscapeNext",t})(he||{});const jf={type:tn.Static,value:""},Wf=/[a-zA-Z0-9_]/;function Kf(t){if(!t)return[[]];if(t==="/")return[[jf]];if(!t.startsWith("/"))throw new Error(`Invalid path "${t}"`);function e(m){throw new Error(`ERR (${n})/"${c}": ${m}`)}let n=he.Static,s=n;const r=[];let i;function o(){i&&r.push(i),i=[]}let a=0,l,c="",u="";function f(){c&&(n===he.Static?i.push({type:tn.Static,value:c}):n===he.Param||n===he.ParamRegExp||n===he.ParamRegExpEnd?(i.length>1&&(l==="*"||l==="+")&&e(`A repeatable param (${c}) must be alone in its segment. eg: '/:ids+.`),i.push({type:tn.Param,value:c,regexp:u,repeatable:l==="*"||l==="+",optional:l==="*"||l==="?"})):e("Invalid state to consume buffer"),c="")}function d(){c+=l}for(;a<t.length;){if(l=t[a++],l==="\\"&&n!==he.ParamRegExp){s=n,n=he.EscapeNext;continue}switch(n){case he.Static:l==="/"?(c&&f(),o()):l===":"?(f(),n=he.Param):d();break;case he.EscapeNext:d(),n=s;break;case he.Param:l==="("?n=he.ParamRegExp:Wf.test(l)?d():(f(),n=he.Static,l!=="*"&&l!=="?"&&l!=="+"&&a--);break;case he.ParamRegExp:l===")"?u[u.length-1]=="\\"?u=u.slice(0,-1)+l:n=he.ParamRegExpEnd:u+=l;break;case he.ParamRegExpEnd:f(),n=he.Static,l!=="*"&&l!=="?"&&l!=="+"&&a--,u="";break;default:e("Unknown state");break}}return n===he.ParamRegExp&&e(`Unfinished custom RegExp for param "${c}"`),f(),o(),r}const Po="[^/]+?",Gf={sensitive:!1,strict:!1,start:!0,end:!0};var Se=(function(t){return t[t._multiplier=10]="_multiplier",t[t.Root=90]="Root",t[t.Segment=40]="Segment",t[t.SubSegment=30]="SubSegment",t[t.Static=40]="Static",t[t.Dynamic=20]="Dynamic",t[t.BonusCustomRegExp=10]="BonusCustomRegExp",t[t.BonusWildcard=-50]="BonusWildcard",t[t.BonusRepeatable=-20]="BonusRepeatable",t[t.BonusOptional=-8]="BonusOptional",t[t.BonusStrict=.7000000000000001]="BonusStrict",t[t.BonusCaseSensitive=.25]="BonusCaseSensitive",t})(Se||{});const zf=/[.+*?^${}()[\]/\\]/g;function qf(t,e){const n=J({},Gf,e),s=[];let r=n.start?"^":"";const i=[];for(const c of t){const u=c.length?[]:[Se.Root];n.strict&&!c.length&&(r+="/");for(let f=0;f<c.length;f++){const d=c[f];let m=Se.Segment+(n.sensitive?Se.BonusCaseSensitive:0);if(d.type===tn.Static)f||(r+="/"),r+=d.value.replace(zf,"\\$&"),m+=Se.Static;else if(d.type===tn.Param){const{value:v,repeatable:y,optional:b,regexp:E}=d;i.push({name:v,repeatable:y,optional:b});const C=E||Po;if(C!==Po){m+=Se.BonusCustomRegExp;try{`${C}`}catch(M){throw new Error(`Invalid custom RegExp for param "${v}" (${C}): `+M.message)}}let L=y?`((?:${C})(?:/(?:${C}))*)`:`(${C})`;f||(L=b&&c.length<2?`(?:/${L})`:"/"+L),b&&(L+="?"),r+=L,m+=Se.Dynamic,b&&(m+=Se.BonusOptional),y&&(m+=Se.BonusRepeatable),C===".*"&&(m+=Se.BonusWildcard)}u.push(m)}s.push(u)}if(n.strict&&n.end){const c=s.length-1;s[c][s[c].length-1]+=Se.BonusStrict}n.strict||(r+="/?"),n.end?r+="$":n.strict&&!r.endsWith("/")&&(r+="(?:/|$)");const o=new RegExp(r,n.sensitive?"":"i");function a(c){const u=c.match(o),f={};if(!u)return null;for(let d=1;d<u.length;d++){const m=u[d]||"",v=i[d-1];f[v.name]=m&&v.repeatable?m.split("/"):m}return f}function l(c){let u="",f=!1;for(const d of t){(!f||!u.endsWith("/"))&&(u+="/"),f=!1;for(const m of d)if(m.type===tn.Static)u+=m.value;else if(m.type===tn.Param){const{value:v,repeatable:y,optional:b}=m,E=v in c?c[v]:"";if(We(E)&&!y)throw new Error(`Provided param "${v}" is an array but it is not repeatable (* or + modifiers)`);const C=We(E)?E.join("/"):E;if(!C)if(b)d.length<2&&(u.endsWith("/")?u=u.slice(0,-1):f=!0);else throw new Error(`Missing required param "${v}"`);u+=C}}return u||"/"}return{re:o,score:s,keys:i,parse:a,stringify:l}}function Jf(t,e){let n=0;for(;n<t.length&&n<e.length;){const s=e[n]-t[n];if(s)return s;n++}return t.length<e.length?t.length===1&&t[0]===Se.Static+Se.Segment?-1:1:t.length>e.length?e.length===1&&e[0]===Se.Static+Se.Segment?1:-1:0}function xl(t,e){let n=0;const s=t.score,r=e.score;for(;n<s.length&&n<r.length;){const i=Jf(s[n],r[n]);if(i)return i;n++}if(Math.abs(r.length-s.length)===1){if(Oo(s))return 1;if(Oo(r))return-1}return r.length-s.length}function Oo(t){const e=t[t.length-1];return t.length>0&&e[e.length-1]<0}const Yf={strict:!1,end:!0,sensitive:!1};function Xf(t,e,n){const s=qf(Kf(t.path),n),r=J(s,{record:t,parent:e,children:[],alias:[]});return e&&!r.record.aliasOf==!e.record.aliasOf&&e.children.push(r),r}function Qf(t,e){const n=[],s=new Map;e=Io(Yf,e);function r(f){return s.get(f)}function i(f,d,m){const v=!m,y=No(f);y.aliasOf=m&&m.record;const b=Io(e,f),E=[y];if("alias"in f){const M=typeof f.alias=="string"?[f.alias]:f.alias;for(const te of M)E.push(No(J({},y,{components:m?m.record.components:y.components,path:te,aliasOf:m?m.record:y})))}let C,L;for(const M of E){const{path:te}=M;if(d&&te[0]!=="/"){const me=d.record.path,ce=me[me.length-1]==="/"?"":"/";M.path=d.record.path+(te&&ce+te)}if(C=Xf(M,d,b),m?m.alias.push(C):(L=L||C,L!==C&&L.alias.push(C),v&&f.name&&!Do(C)&&o(f.name)),Ll(C)&&l(C),y.children){const me=y.children;for(let ce=0;ce<me.length;ce++)i(me[ce],C,m&&m.children[ce])}m=m||C}return L?()=>{o(L)}:Zn}function o(f){if(Ol(f)){const d=s.get(f);d&&(s.delete(f),n.splice(n.indexOf(d),1),d.children.forEach(o),d.alias.forEach(o))}else{const d=n.indexOf(f);d>-1&&(n.splice(d,1),f.record.name&&s.delete(f.record.name),f.children.forEach(o),f.alias.forEach(o))}}function a(){return n}function l(f){const d=th(f,n);n.splice(d,0,f),f.record.name&&!Do(f)&&s.set(f.record.name,f)}function c(f,d){let m,v={},y,b;if("name"in f&&f.name){if(m=s.get(f.name),!m)throw kn(ue.MATCHER_NOT_FOUND,{location:f});b=m.record.name,v=J(ko(d.params,m.keys.filter(L=>!L.optional).concat(m.parent?m.parent.keys.filter(L=>L.optional):[]).map(L=>L.name)),f.params&&ko(f.params,m.keys.map(L=>L.name))),y=m.stringify(v)}else if(f.path!=null)y=f.path,m=n.find(L=>L.re.test(y)),m&&(v=m.parse(y),b=m.record.name);else{if(m=d.name?s.get(d.name):n.find(L=>L.re.test(d.path)),!m)throw kn(ue.MATCHER_NOT_FOUND,{location:f,currentLocation:d});b=m.record.name,v=J({},d.params,f.params),y=m.stringify(v)}const E=[];let C=m;for(;C;)E.unshift(C.record),C=C.parent;return{name:b,path:y,params:v,matched:E,meta:eh(E)}}t.forEach(f=>i(f));function u(){n.length=0,s.clear()}return{addRoute:i,resolve:c,removeRoute:o,clearRoutes:u,getRoutes:a,getRecordMatcher:r}}function ko(t,e){const n={};for(const s of e)s in t&&(n[s]=t[s]);return n}function No(t){const e={path:t.path,redirect:t.redirect,name:t.name,meta:t.meta||{},aliasOf:t.aliasOf,beforeEnter:t.beforeEnter,props:Zf(t),children:t.children||[],instances:{},leaveGuards:new Set,updateGuards:new Set,enterCallbacks:{},components:"components"in t?t.components||null:t.component&&{default:t.component}};return Object.defineProperty(e,"mods",{value:{}}),e}function Zf(t){const e={},n=t.props||!1;if("component"in t)e.default=n;else for(const s in t.components)e[s]=typeof n=="object"?n[s]:n;return e}function Do(t){for(;t;){if(t.record.aliasOf)return!0;t=t.parent}return!1}function eh(t){return t.reduce((e,n)=>J(e,n.meta),{})}function th(t,e){let n=0,s=e.length;for(;n!==s;){const i=n+s>>1;xl(t,e[i])<0?s=i:n=i+1}const r=nh(t);return r&&(s=e.lastIndexOf(r,s-1)),s}function nh(t){let e=t;for(;e=e.parent;)if(Ll(e)&&xl(t,e)===0)return e}function Ll({record:t}){return!!(t.name||t.components&&Object.keys(t.components).length||t.redirect)}function xo(t){const e=ot(fr),n=ot(Nl),s=Te(()=>{const l=vn(t.to);return e.resolve(l)}),r=Te(()=>{const{matched:l}=s.value,{length:c}=l,u=l[c-1],f=n.matched;if(!u||!f.length)return-1;const d=f.findIndex(On.bind(null,u));if(d>-1)return d;const m=Lo(l[c-2]);return c>1&&Lo(u)===m&&f[f.length-1].path!==m?f.findIndex(On.bind(null,l[c-2])):d}),i=Te(()=>r.value>-1&&ah(n.params,s.value.params)),o=Te(()=>r.value>-1&&r.value===n.matched.length-1&&Pl(n.params,s.value.params));function a(l={}){if(oh(l)){const c=e[vn(t.replace)?"replace":"push"](vn(t.to)).catch(Zn);return t.viewTransition&&typeof document<"u"&&"startViewTransition"in document&&document.startViewTransition(()=>c),c}return Promise.resolve()}return{route:s,href:Te(()=>s.value.href),isActive:i,isExactActive:o,navigate:a}}function sh(t){return t.length===1?t[0]:t}const rh=za({name:"RouterLink",compatConfig:{MODE:3},props:{to:{type:[String,Object],required:!0},replace:Boolean,activeClass:String,exactActiveClass:String,custom:Boolean,ariaCurrentValue:{type:String,default:"page"},viewTransition:Boolean},useLink:xo,setup(t,{slots:e}){const n=ut(xo(t)),{options:s}=ot(fr),r=Te(()=>({[Mo(t.activeClass,s.linkActiveClass,"router-link-active")]:n.isActive,[Mo(t.exactActiveClass,s.linkExactActiveClass,"router-link-exact-active")]:n.isExactActive}));return()=>{const i=e.default&&sh(e.default(n));return t.custom?i:bl("a",{"aria-current":n.isExactActive?t.ariaCurrentValue:null,href:n.href,onClick:n.navigate,class:r.value},i)}}}),ih=rh;function oh(t){if(!(t.metaKey||t.altKey||t.ctrlKey||t.shiftKey)&&!t.defaultPrevented&&!(t.button!==void 0&&t.button!==0)){if(t.currentTarget&&t.currentTarget.getAttribute){const e=t.currentTarget.getAttribute("target");if(/\b_blank\b/i.test(e))return}return t.preventDefault&&t.preventDefault(),!0}}function ah(t,e){for(const n in e){const s=e[n],r=t[n];if(typeof s=="string"){if(s!==r)return!1}else if(!We(r)||r.length!==s.length||s.some((i,o)=>i.valueOf()!==r[o].valueOf()))return!1}return!0}function Lo(t){return t?t.aliasOf?t.aliasOf.path:t.path:""}const Mo=(t,e,n)=>t??e??n,lh=za({name:"RouterView",inheritAttrs:!1,props:{name:{type:String,default:"default"},route:Object},compatConfig:{MODE:3},setup(t,{attrs:e,slots:n}){const s=ot(ei),r=Te(()=>t.route||s.value),i=ot(Ao,0),o=Te(()=>{let c=vn(i);const{matched:u}=r.value;let f;for(;(f=u[c])&&!f.components;)c++;return c}),a=Te(()=>r.value.matched[o.value]);As(Ao,Te(()=>o.value+1)),As(Uf,a),As(ei,r);const l=re();return Bt(()=>[l.value,a.value,t.name],([c,u,f],[d,m,v])=>{u&&(u.instances[f]=c,m&&m!==u&&c&&c===d&&(u.leaveGuards.size||(u.leaveGuards=m.leaveGuards),u.updateGuards.size||(u.updateGuards=m.updateGuards))),c&&u&&(!m||!On(u,m)||!d)&&(u.enterCallbacks[f]||[]).forEach(y=>y(c))},{flush:"post"}),()=>{const c=r.value,u=t.name,f=a.value,d=f&&f.components[u];if(!d)return Uo(n.default,{Component:d,route:c});const m=f.props[u],v=m?m===!0?c.params:typeof m=="function"?m(c):m:null,b=bl(d,J({},v,e,{onVnodeUnmounted:E=>{E.component.isUnmounted&&(f.instances[u]=null)},ref:l}));return Uo(n.default,{Component:b,route:c})||b}}});function Uo(t,e){if(!t)return null;const n=t(e);return n.length===1?n[0]:n}const ch=lh;function uh(t){const e=Qf(t.routes,t),n=t.parseQuery||Lf,s=t.stringifyQuery||To,r=t.history,i=Hn(),o=Hn(),a=Hn(),l=cu(kt);let c=kt;gn&&t.scrollBehavior&&"scrollRestoration"in history&&(history.scrollRestoration="manual");const u=Rr.bind(null,S=>""+S),f=Rr.bind(null,yf),d=Rr.bind(null,as);function m(S,x){let N,U;return Ol(S)?(N=e.getRecordMatcher(S),U=x):U=S,e.addRoute(U,N)}function v(S){const x=e.getRecordMatcher(S);x&&e.removeRoute(x)}function y(){return e.getRoutes().map(S=>S.record)}function b(S){return!!e.getRecordMatcher(S)}function E(S,x){if(x=J({},x||l.value),typeof S=="string"){const _=Pr(n,S,x.path),I=e.resolve({path:_.path},x),T=r.createHref(_.fullPath);return J(_,I,{params:d(I.params),hash:as(_.hash),redirectedFrom:void 0,href:T})}let N;if(S.path!=null)N=J({},S,{path:Pr(n,S.path,x.path).path});else{const _=J({},S.params);for(const I in _)_[I]==null&&delete _[I];N=J({},S,{params:f(_)}),x.params=f(x.params)}const U=e.resolve(N,x),G=S.hash||"";U.params=u(d(U.params));const p=Ef(s,J({},S,{hash:gf(G),path:U.path})),g=r.createHref(p);return J({fullPath:p,hash:G,query:s===To?Mf(S.query):S.query||{}},U,{redirectedFrom:void 0,href:g})}function C(S){return typeof S=="string"?Pr(n,S,l.value.path):J({},S)}function L(S,x){if(c!==S)return kn(ue.NAVIGATION_CANCELLED,{from:x,to:S})}function M(S){return ce(S)}function te(S){return M(J(C(S),{replace:!0}))}function me(S,x){const N=S.matched[S.matched.length-1];if(N&&N.redirect){const{redirect:U}=N;let G=typeof U=="function"?U(S,x):U;return typeof G=="string"&&(G=G.includes("?")||G.includes("#")?G=C(G):{path:G},G.params={}),J({query:S.query,hash:S.hash,params:G.path!=null?{}:S.params},G)}}function ce(S,x){const N=c=E(S),U=l.value,G=S.state,p=S.force,g=S.replace===!0,_=me(N,U);if(_)return ce(J(C(_),{state:typeof _=="object"?J({},G,_.state):G,force:p,replace:g}),x||N);const I=N;I.redirectedFrom=x;let T;return!p&&If(s,U,N)&&(T=kn(ue.NAVIGATION_DUPLICATED,{to:I,from:U}),Je(U,U,!0,!1)),(T?Promise.resolve(T):ze(I,U)).catch(w=>pt(w)?pt(w,ue.NAVIGATION_GUARD_REDIRECT)?w:Ot(w):q(w,I,U)).then(w=>{if(w){if(pt(w,ue.NAVIGATION_GUARD_REDIRECT))return ce(J({replace:g},C(w.to),{state:typeof w.to=="object"?J({},G,w.to.state):G,force:p}),x||I)}else w=qt(I,U,!0,g,G);return Pt(I,U,w),w})}function Ge(S,x){const N=L(S,x);return N?Promise.reject(N):Promise.resolve()}function Rt(S){const x=dn.values().next().value;return x&&typeof x.runWithContext=="function"?x.runWithContext(S):S()}function ze(S,x){let N;const[U,G,p]=Ff(S,x);N=kr(U.reverse(),"beforeRouteLeave",S,x);for(const _ of U)_.leaveGuards.forEach(I=>{N.push(Lt(I,S,x))});const g=Ge.bind(null,S,x);return N.push(g),Ue(N).then(()=>{N=[];for(const _ of i.list())N.push(Lt(_,S,x));return N.push(g),Ue(N)}).then(()=>{N=kr(G,"beforeRouteUpdate",S,x);for(const _ of G)_.updateGuards.forEach(I=>{N.push(Lt(I,S,x))});return N.push(g),Ue(N)}).then(()=>{N=[];for(const _ of p)if(_.beforeEnter)if(We(_.beforeEnter))for(const I of _.beforeEnter)N.push(Lt(I,S,x));else N.push(Lt(_.beforeEnter,S,x));return N.push(g),Ue(N)}).then(()=>(S.matched.forEach(_=>_.enterCallbacks={}),N=kr(p,"beforeRouteEnter",S,x,Rt),N.push(g),Ue(N))).then(()=>{N=[];for(const _ of o.list())N.push(Lt(_,S,x));return N.push(g),Ue(N)}).catch(_=>pt(_,ue.NAVIGATION_CANCELLED)?_:Promise.reject(_))}function Pt(S,x,N){a.list().forEach(U=>Rt(()=>U(S,x,N)))}function qt(S,x,N,U,G){const p=L(S,x);if(p)return p;const g=x===kt,_=gn?history.state:{};N&&(U||g?r.replace(S.fullPath,J({scroll:g&&_&&_.scroll},G)):r.push(S.fullPath,G)),l.value=S,Je(S,x,N,g),Ot()}let qe;function Fn(){qe||(qe=r.listen((S,x,N)=>{if(!Jt.listening)return;const U=E(S),G=me(U,Jt.currentRoute.value);if(G){ce(J(G,{replace:!0,force:!0}),U).catch(Zn);return}c=U;const p=l.value;gn&&Of(Co(p.fullPath,N.delta),dr()),ze(U,p).catch(g=>pt(g,ue.NAVIGATION_ABORTED|ue.NAVIGATION_CANCELLED)?g:pt(g,ue.NAVIGATION_GUARD_REDIRECT)?(ce(J(C(g.to),{force:!0}),U).then(_=>{pt(_,ue.NAVIGATION_ABORTED|ue.NAVIGATION_DUPLICATED)&&!N.delta&&N.type===Qr.pop&&r.go(-1,!1)}).catch(Zn),Promise.reject()):(N.delta&&r.go(-N.delta,!1),q(g,U,p))).then(g=>{g=g||qt(U,p,!1),g&&(N.delta&&!pt(g,ue.NAVIGATION_CANCELLED)?r.go(-N.delta,!1):N.type===Qr.pop&&pt(g,ue.NAVIGATION_ABORTED|ue.NAVIGATION_DUPLICATED)&&r.go(-1,!1)),Pt(U,p,g)}).catch(Zn)}))}let cn=Hn(),ge=Hn(),ee;function q(S,x,N){Ot(S);const U=ge.list();return U.length?U.forEach(G=>G(S,x,N)):console.error(S),Promise.reject(S)}function ft(){return ee&&l.value!==kt?Promise.resolve():new Promise((S,x)=>{cn.add([S,x])})}function Ot(S){return ee||(ee=!S,Fn(),cn.list().forEach(([x,N])=>S?N(S):x()),cn.reset()),S}function Je(S,x,N,U){const{scrollBehavior:G}=t;if(!gn||!G)return Promise.resolve();const p=!N&&kf(Co(S.fullPath,0))||(U||!N)&&history.state&&history.state.scroll||null;return Ii().then(()=>G(S,x,p)).then(g=>g&&Pf(g)).catch(g=>q(g,S,x))}const Re=S=>r.go(S);let un;const dn=new Set,Jt={currentRoute:l,listening:!0,addRoute:m,removeRoute:v,clearRoutes:e.clearRoutes,hasRoute:b,getRoutes:y,resolve:E,options:t,push:M,replace:te,go:Re,back:()=>Re(-1),forward:()=>Re(1),beforeEach:i.add,beforeResolve:o.add,afterEach:a.add,onError:ge.add,isReady:ft,install(S){S.component("RouterLink",ih),S.component("RouterView",ch),S.config.globalProperties.$router=Jt,Object.defineProperty(S.config.globalProperties,"$route",{enumerable:!0,get:()=>vn(l)}),gn&&!un&&l.value===kt&&(un=!0,M(r.location).catch(U=>{}));const x={};for(const U in kt)Object.defineProperty(x,U,{get:()=>l.value[U],enumerable:!0});S.provide(fr,Jt),S.provide(Nl,Ua(x)),S.provide(ei,l);const N=S.unmount;dn.add(S),S.unmount=function(){dn.delete(S),dn.size<1&&(c=kt,qe&&qe(),qe=null,l.value=kt,un=!1,ee=!1),N()}}};function Ue(S){return S.reduce((x,N)=>x.then(()=>Rt(N)),Promise.resolve())}return Jt}function Ml(){return ot(fr)}const dh=()=>{};var Fo={};/**
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
 */const Ul=function(t){const e=[];let n=0;for(let s=0;s<t.length;s++){let r=t.charCodeAt(s);r<128?e[n++]=r:r<2048?(e[n++]=r>>6|192,e[n++]=r&63|128):(r&64512)===55296&&s+1<t.length&&(t.charCodeAt(s+1)&64512)===56320?(r=65536+((r&1023)<<10)+(t.charCodeAt(++s)&1023),e[n++]=r>>18|240,e[n++]=r>>12&63|128,e[n++]=r>>6&63|128,e[n++]=r&63|128):(e[n++]=r>>12|224,e[n++]=r>>6&63|128,e[n++]=r&63|128)}return e},fh=function(t){const e=[];let n=0,s=0;for(;n<t.length;){const r=t[n++];if(r<128)e[s++]=String.fromCharCode(r);else if(r>191&&r<224){const i=t[n++];e[s++]=String.fromCharCode((r&31)<<6|i&63)}else if(r>239&&r<365){const i=t[n++],o=t[n++],a=t[n++],l=((r&7)<<18|(i&63)<<12|(o&63)<<6|a&63)-65536;e[s++]=String.fromCharCode(55296+(l>>10)),e[s++]=String.fromCharCode(56320+(l&1023))}else{const i=t[n++],o=t[n++];e[s++]=String.fromCharCode((r&15)<<12|(i&63)<<6|o&63)}}return e.join("")},Fl={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(t,e){if(!Array.isArray(t))throw Error("encodeByteArray takes an array as a parameter");this.init_();const n=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,s=[];for(let r=0;r<t.length;r+=3){const i=t[r],o=r+1<t.length,a=o?t[r+1]:0,l=r+2<t.length,c=l?t[r+2]:0,u=i>>2,f=(i&3)<<4|a>>4;let d=(a&15)<<2|c>>6,m=c&63;l||(m=64,o||(d=64)),s.push(n[u],n[f],n[d],n[m])}return s.join("")},encodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(t):this.encodeByteArray(Ul(t),e)},decodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(t):fh(this.decodeStringToByteArray(t,e))},decodeStringToByteArray(t,e){this.init_();const n=e?this.charToByteMapWebSafe_:this.charToByteMap_,s=[];for(let r=0;r<t.length;){const i=n[t.charAt(r++)],a=r<t.length?n[t.charAt(r)]:0;++r;const c=r<t.length?n[t.charAt(r)]:64;++r;const f=r<t.length?n[t.charAt(r)]:64;if(++r,i==null||a==null||c==null||f==null)throw new hh;const d=i<<2|a>>4;if(s.push(d),c!==64){const m=a<<4&240|c>>2;if(s.push(m),f!==64){const v=c<<6&192|f;s.push(v)}}}return s},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let t=0;t<this.ENCODED_VALS.length;t++)this.byteToCharMap_[t]=this.ENCODED_VALS.charAt(t),this.charToByteMap_[this.byteToCharMap_[t]]=t,this.byteToCharMapWebSafe_[t]=this.ENCODED_VALS_WEBSAFE.charAt(t),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[t]]=t,t>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(t)]=t,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(t)]=t)}}};class hh extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const ph=function(t){const e=Ul(t);return Fl.encodeByteArray(e,!0)},Vl=function(t){return ph(t).replace(/\./g,"")},$l=function(t){try{return Fl.decodeString(t,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
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
 */const mh=()=>gh().__FIREBASE_DEFAULTS__,_h=()=>{if(typeof process>"u"||typeof Fo>"u")return;const t=Fo.__FIREBASE_DEFAULTS__;if(t)return JSON.parse(t)},yh=()=>{if(typeof document>"u")return;let t;try{t=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=t&&$l(t[1]);return e&&JSON.parse(e)},Pi=()=>{try{return dh()||mh()||_h()||yh()}catch(t){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${t}`);return}},vh=t=>{var e,n;return(n=(e=Pi())==null?void 0:e.emulatorHosts)==null?void 0:n[t]},Bl=()=>{var t;return(t=Pi())==null?void 0:t.config},Hl=t=>{var e;return(e=Pi())==null?void 0:e[`_${t}`]};/**
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
 */class bh{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}wrapCallback(e){return(n,s)=>{n?this.reject(n):this.resolve(s),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(n):e(n,s))}}}/**
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
 */function hr(t){try{return(t.startsWith("http://")||t.startsWith("https://")?new URL(t).hostname:t).endsWith(".cloudworkstations.dev")}catch{return!1}}async function Eh(t){return(await fetch(t,{credentials:"include"})).ok}const es={};function Ih(){const t={prod:[],emulator:[]};for(const e of Object.keys(es))es[e]?t.emulator.push(e):t.prod.push(e);return t}function wh(t){let e=document.getElementById(t),n=!1;return e||(e=document.createElement("div"),e.setAttribute("id",t),n=!0),{created:n,element:e}}let Vo=!1;function Sh(t,e){if(typeof window>"u"||typeof document>"u"||!hr(window.location.host)||es[t]===e||es[t]||Vo)return;es[t]=e;function n(d){return`__firebase__banner__${d}`}const s="__firebase__banner",i=Ih().prod.length>0;function o(){const d=document.getElementById(s);d&&d.remove()}function a(d){d.style.display="flex",d.style.background="#7faaf0",d.style.position="fixed",d.style.bottom="5px",d.style.left="5px",d.style.padding=".5em",d.style.borderRadius="5px",d.style.alignItems="center"}function l(d,m){d.setAttribute("width","24"),d.setAttribute("id",m),d.setAttribute("height","24"),d.setAttribute("viewBox","0 0 24 24"),d.setAttribute("fill","none"),d.style.marginLeft="-6px"}function c(){const d=document.createElement("span");return d.style.cursor="pointer",d.style.marginLeft="16px",d.style.fontSize="24px",d.innerHTML=" &times;",d.onclick=()=>{Vo=!0,o()},d}function u(d,m){d.setAttribute("id",m),d.innerText="Learn more",d.href="https://firebase.google.com/docs/studio/preview-apps#preview-backend",d.setAttribute("target","__blank"),d.style.paddingLeft="5px",d.style.textDecoration="underline"}function f(){const d=wh(s),m=n("text"),v=document.getElementById(m)||document.createElement("span"),y=n("learnmore"),b=document.getElementById(y)||document.createElement("a"),E=n("preprendIcon"),C=document.getElementById(E)||document.createElementNS("http://www.w3.org/2000/svg","svg");if(d.created){const L=d.element;a(L),u(b,y);const M=c();l(C,E),L.append(C,v,b,M),document.body.appendChild(L)}i?(v.innerText="Preview backend disconnected.",C.innerHTML=`<g clip-path="url(#clip0_6013_33858)">
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
</defs>`,v.innerText="Preview backend running in this workspace."),v.setAttribute("id",m)}document.readyState==="loading"?window.addEventListener("DOMContentLoaded",f):f()}/**
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
 */function Ae(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function Ch(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(Ae())}function Th(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function Ah(){const t=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof t=="object"&&t.id!==void 0}function Rh(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function Ph(){const t=Ae();return t.indexOf("MSIE ")>=0||t.indexOf("Trident/")>=0}function Oh(){try{return typeof indexedDB=="object"}catch{return!1}}function kh(){return new Promise((t,e)=>{try{let n=!0;const s="validate-browser-context-for-indexeddb-analytics-module",r=self.indexedDB.open(s);r.onsuccess=()=>{r.result.close(),n||self.indexedDB.deleteDatabase(s),t(!0)},r.onupgradeneeded=()=>{n=!1},r.onerror=()=>{var i;e(((i=r.error)==null?void 0:i.message)||"")}}catch(n){e(n)}})}/**
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
 */const Nh="FirebaseError";class Gt extends Error{constructor(e,n,s){super(n),this.code=e,this.customData=s,this.name=Nh,Object.setPrototypeOf(this,Gt.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,ms.prototype.create)}}class ms{constructor(e,n,s){this.service=e,this.serviceName=n,this.errors=s}create(e,...n){const s=n[0]||{},r=`${this.service}/${e}`,i=this.errors[e],o=i?Dh(i,s):"Error",a=`${this.serviceName}: ${o} (${r}).`;return new Gt(r,a,s)}}function Dh(t,e){return t.replace(xh,(n,s)=>{const r=e[s];return r!=null?String(r):`<${s}?>`})}const xh=/\{\$([^}]+)}/g;function Lh(t){for(const e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}function Nn(t,e){if(t===e)return!0;const n=Object.keys(t),s=Object.keys(e);for(const r of n){if(!s.includes(r))return!1;const i=t[r],o=e[r];if($o(i)&&$o(o)){if(!Nn(i,o))return!1}else if(i!==o)return!1}for(const r of s)if(!n.includes(r))return!1;return!0}function $o(t){return t!==null&&typeof t=="object"}/**
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
 */function _s(t){const e=[];for(const[n,s]of Object.entries(t))Array.isArray(s)?s.forEach(r=>{e.push(encodeURIComponent(n)+"="+encodeURIComponent(r))}):e.push(encodeURIComponent(n)+"="+encodeURIComponent(s));return e.length?"&"+e.join("&"):""}function Wn(t){const e={};return t.replace(/^\?/,"").split("&").forEach(s=>{if(s){const[r,i]=s.split("=");e[decodeURIComponent(r)]=decodeURIComponent(i)}}),e}function Kn(t){const e=t.indexOf("?");if(!e)return"";const n=t.indexOf("#",e);return t.substring(e,n>0?n:void 0)}function Mh(t,e){const n=new Uh(t,e);return n.subscribe.bind(n)}class Uh{constructor(e,n){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=n,this.task.then(()=>{e(this)}).catch(s=>{this.error(s)})}next(e){this.forEachObserver(n=>{n.next(e)})}error(e){this.forEachObserver(n=>{n.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,n,s){let r;if(e===void 0&&n===void 0&&s===void 0)throw new Error("Missing Observer.");Fh(e,["next","error","complete"])?r=e:r={next:e,error:n,complete:s},r.next===void 0&&(r.next=Nr),r.error===void 0&&(r.error=Nr),r.complete===void 0&&(r.complete=Nr);const i=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?r.error(this.finalError):r.complete()}catch{}}),this.observers.push(r),i}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let n=0;n<this.observers.length;n++)this.sendOne(n,e)}sendOne(e,n){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{n(this.observers[e])}catch(s){typeof console<"u"&&console.error&&console.error(s)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function Fh(t,e){if(typeof t!="object"||t===null)return!1;for(const n of e)if(n in t&&typeof t[n]=="function")return!0;return!1}function Nr(){}/**
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
 */function At(t){return t&&t._delegate?t._delegate:t}class Dn{constructor(e,n,s){this.name=e,this.instanceFactory=n,this.type=s,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
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
 */class Vh{constructor(e,n){this.name=e,this.container=n,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const n=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(n)){const s=new bh;if(this.instancesDeferred.set(n,s),this.isInitialized(n)||this.shouldAutoInitialize())try{const r=this.getOrInitializeService({instanceIdentifier:n});r&&s.resolve(r)}catch{}}return this.instancesDeferred.get(n).promise}getImmediate(e){const n=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),s=(e==null?void 0:e.optional)??!1;if(this.isInitialized(n)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:n})}catch(r){if(s)return null;throw r}else{if(s)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(Bh(e))try{this.getOrInitializeService({instanceIdentifier:Zt})}catch{}for(const[n,s]of this.instancesDeferred.entries()){const r=this.normalizeInstanceIdentifier(n);try{const i=this.getOrInitializeService({instanceIdentifier:r});s.resolve(i)}catch{}}}}clearInstance(e=Zt){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(n=>"INTERNAL"in n).map(n=>n.INTERNAL.delete()),...e.filter(n=>"_delete"in n).map(n=>n._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=Zt){return this.instances.has(e)}getOptions(e=Zt){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:n={}}=e,s=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(s))throw Error(`${this.name}(${s}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const r=this.getOrInitializeService({instanceIdentifier:s,options:n});for(const[i,o]of this.instancesDeferred.entries()){const a=this.normalizeInstanceIdentifier(i);s===a&&o.resolve(r)}return r}onInit(e,n){const s=this.normalizeInstanceIdentifier(n),r=this.onInitCallbacks.get(s)??new Set;r.add(e),this.onInitCallbacks.set(s,r);const i=this.instances.get(s);return i&&e(i,s),()=>{r.delete(e)}}invokeOnInitCallbacks(e,n){const s=this.onInitCallbacks.get(n);if(s)for(const r of s)try{r(e,n)}catch{}}getOrInitializeService({instanceIdentifier:e,options:n={}}){let s=this.instances.get(e);if(!s&&this.component&&(s=this.component.instanceFactory(this.container,{instanceIdentifier:$h(e),options:n}),this.instances.set(e,s),this.instancesOptions.set(e,n),this.invokeOnInitCallbacks(s,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,s)}catch{}return s||null}normalizeInstanceIdentifier(e=Zt){return this.component?this.component.multipleInstances?e:Zt:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function $h(t){return t===Zt?void 0:t}function Bh(t){return t.instantiationMode==="EAGER"}/**
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
 */class Hh{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const n=this.getProvider(e.name);if(n.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);n.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const n=new Vh(e,this);return this.providers.set(e,n),n}getProviders(){return Array.from(this.providers.values())}}/**
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
 */var ne;(function(t){t[t.DEBUG=0]="DEBUG",t[t.VERBOSE=1]="VERBOSE",t[t.INFO=2]="INFO",t[t.WARN=3]="WARN",t[t.ERROR=4]="ERROR",t[t.SILENT=5]="SILENT"})(ne||(ne={}));const jh={debug:ne.DEBUG,verbose:ne.VERBOSE,info:ne.INFO,warn:ne.WARN,error:ne.ERROR,silent:ne.SILENT},Wh=ne.INFO,Kh={[ne.DEBUG]:"log",[ne.VERBOSE]:"log",[ne.INFO]:"info",[ne.WARN]:"warn",[ne.ERROR]:"error"},Gh=(t,e,...n)=>{if(e<t.logLevel)return;const s=new Date().toISOString(),r=Kh[e];if(r)console[r](`[${s}]  ${t.name}:`,...n);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class jl{constructor(e){this.name=e,this._logLevel=Wh,this._logHandler=Gh,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in ne))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?jh[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,ne.DEBUG,...e),this._logHandler(this,ne.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,ne.VERBOSE,...e),this._logHandler(this,ne.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,ne.INFO,...e),this._logHandler(this,ne.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,ne.WARN,...e),this._logHandler(this,ne.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,ne.ERROR,...e),this._logHandler(this,ne.ERROR,...e)}}const zh=(t,e)=>e.some(n=>t instanceof n);let Bo,Ho;function qh(){return Bo||(Bo=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function Jh(){return Ho||(Ho=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const Wl=new WeakMap,ti=new WeakMap,Kl=new WeakMap,Dr=new WeakMap,Oi=new WeakMap;function Yh(t){const e=new Promise((n,s)=>{const r=()=>{t.removeEventListener("success",i),t.removeEventListener("error",o)},i=()=>{n(Ht(t.result)),r()},o=()=>{s(t.error),r()};t.addEventListener("success",i),t.addEventListener("error",o)});return e.then(n=>{n instanceof IDBCursor&&Wl.set(n,t)}).catch(()=>{}),Oi.set(e,t),e}function Xh(t){if(ti.has(t))return;const e=new Promise((n,s)=>{const r=()=>{t.removeEventListener("complete",i),t.removeEventListener("error",o),t.removeEventListener("abort",o)},i=()=>{n(),r()},o=()=>{s(t.error||new DOMException("AbortError","AbortError")),r()};t.addEventListener("complete",i),t.addEventListener("error",o),t.addEventListener("abort",o)});ti.set(t,e)}let ni={get(t,e,n){if(t instanceof IDBTransaction){if(e==="done")return ti.get(t);if(e==="objectStoreNames")return t.objectStoreNames||Kl.get(t);if(e==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return Ht(t[e])},set(t,e,n){return t[e]=n,!0},has(t,e){return t instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in t}};function Qh(t){ni=t(ni)}function Zh(t){return t===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...n){const s=t.call(xr(this),e,...n);return Kl.set(s,e.sort?e.sort():[e]),Ht(s)}:Jh().includes(t)?function(...e){return t.apply(xr(this),e),Ht(Wl.get(this))}:function(...e){return Ht(t.apply(xr(this),e))}}function ep(t){return typeof t=="function"?Zh(t):(t instanceof IDBTransaction&&Xh(t),zh(t,qh())?new Proxy(t,ni):t)}function Ht(t){if(t instanceof IDBRequest)return Yh(t);if(Dr.has(t))return Dr.get(t);const e=ep(t);return e!==t&&(Dr.set(t,e),Oi.set(e,t)),e}const xr=t=>Oi.get(t);function tp(t,e,{blocked:n,upgrade:s,blocking:r,terminated:i}={}){const o=indexedDB.open(t,e),a=Ht(o);return s&&o.addEventListener("upgradeneeded",l=>{s(Ht(o.result),l.oldVersion,l.newVersion,Ht(o.transaction),l)}),n&&o.addEventListener("blocked",l=>n(l.oldVersion,l.newVersion,l)),a.then(l=>{i&&l.addEventListener("close",()=>i()),r&&l.addEventListener("versionchange",c=>r(c.oldVersion,c.newVersion,c))}).catch(()=>{}),a}const np=["get","getKey","getAll","getAllKeys","count"],sp=["put","add","delete","clear"],Lr=new Map;function jo(t,e){if(!(t instanceof IDBDatabase&&!(e in t)&&typeof e=="string"))return;if(Lr.get(e))return Lr.get(e);const n=e.replace(/FromIndex$/,""),s=e!==n,r=sp.includes(n);if(!(n in(s?IDBIndex:IDBObjectStore).prototype)||!(r||np.includes(n)))return;const i=async function(o,...a){const l=this.transaction(o,r?"readwrite":"readonly");let c=l.store;return s&&(c=c.index(a.shift())),(await Promise.all([c[n](...a),r&&l.done]))[0]};return Lr.set(e,i),i}Qh(t=>({...t,get:(e,n,s)=>jo(e,n)||t.get(e,n,s),has:(e,n)=>!!jo(e,n)||t.has(e,n)}));/**
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
 */class rp{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(n=>{if(ip(n)){const s=n.getImmediate();return`${s.library}/${s.version}`}else return null}).filter(n=>n).join(" ")}}function ip(t){const e=t.getComponent();return(e==null?void 0:e.type)==="VERSION"}const si="@firebase/app",Wo="0.14.9";/**
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
 */const St=new jl("@firebase/app"),op="@firebase/app-compat",ap="@firebase/analytics-compat",lp="@firebase/analytics",cp="@firebase/app-check-compat",up="@firebase/app-check",dp="@firebase/auth",fp="@firebase/auth-compat",hp="@firebase/database",pp="@firebase/data-connect",gp="@firebase/database-compat",mp="@firebase/functions",_p="@firebase/functions-compat",yp="@firebase/installations",vp="@firebase/installations-compat",bp="@firebase/messaging",Ep="@firebase/messaging-compat",Ip="@firebase/performance",wp="@firebase/performance-compat",Sp="@firebase/remote-config",Cp="@firebase/remote-config-compat",Tp="@firebase/storage",Ap="@firebase/storage-compat",Rp="@firebase/firestore",Pp="@firebase/ai",Op="@firebase/firestore-compat",kp="firebase",Np="12.10.0";/**
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
 */const ri="[DEFAULT]",Dp={[si]:"fire-core",[op]:"fire-core-compat",[lp]:"fire-analytics",[ap]:"fire-analytics-compat",[up]:"fire-app-check",[cp]:"fire-app-check-compat",[dp]:"fire-auth",[fp]:"fire-auth-compat",[hp]:"fire-rtdb",[pp]:"fire-data-connect",[gp]:"fire-rtdb-compat",[mp]:"fire-fn",[_p]:"fire-fn-compat",[yp]:"fire-iid",[vp]:"fire-iid-compat",[bp]:"fire-fcm",[Ep]:"fire-fcm-compat",[Ip]:"fire-perf",[wp]:"fire-perf-compat",[Sp]:"fire-rc",[Cp]:"fire-rc-compat",[Tp]:"fire-gcs",[Ap]:"fire-gcs-compat",[Rp]:"fire-fst",[Op]:"fire-fst-compat",[Pp]:"fire-vertex","fire-js":"fire-js",[kp]:"fire-js-all"};/**
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
 */const Gs=new Map,xp=new Map,ii=new Map;function Ko(t,e){try{t.container.addComponent(e)}catch(n){St.debug(`Component ${e.name} failed to register with FirebaseApp ${t.name}`,n)}}function ls(t){const e=t.name;if(ii.has(e))return St.debug(`There were multiple attempts to register component ${e}.`),!1;ii.set(e,t);for(const n of Gs.values())Ko(n,t);for(const n of xp.values())Ko(n,t);return!0}function Gl(t,e){const n=t.container.getProvider("heartbeat").getImmediate({optional:!0});return n&&n.triggerHeartbeat(),t.container.getProvider(e)}function st(t){return t==null?!1:t.settings!==void 0}/**
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
 */const Lp={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},jt=new ms("app","Firebase",Lp);/**
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
 */class Mp{constructor(e,n,s){this._isDeleted=!1,this._options={...e},this._config={...n},this._name=n.name,this._automaticDataCollectionEnabled=n.automaticDataCollectionEnabled,this._container=s,this.container.addComponent(new Dn("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw jt.create("app-deleted",{appName:this._name})}}/**
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
 */const ys=Np;function zl(t,e={}){let n=t;typeof e!="object"&&(e={name:e});const s={name:ri,automaticDataCollectionEnabled:!0,...e},r=s.name;if(typeof r!="string"||!r)throw jt.create("bad-app-name",{appName:String(r)});if(n||(n=Bl()),!n)throw jt.create("no-options");const i=Gs.get(r);if(i){if(Nn(n,i.options)&&Nn(s,i.config))return i;throw jt.create("duplicate-app",{appName:r})}const o=new Hh(r);for(const l of ii.values())o.addComponent(l);const a=new Mp(n,s,o);return Gs.set(r,a),a}function Up(t=ri){const e=Gs.get(t);if(!e&&t===ri&&Bl())return zl();if(!e)throw jt.create("no-app",{appName:t});return e}function wn(t,e,n){let s=Dp[t]??t;n&&(s+=`-${n}`);const r=s.match(/\s|\//),i=e.match(/\s|\//);if(r||i){const o=[`Unable to register library "${s}" with version "${e}":`];r&&o.push(`library name "${s}" contains illegal characters (whitespace or "/")`),r&&i&&o.push("and"),i&&o.push(`version name "${e}" contains illegal characters (whitespace or "/")`),St.warn(o.join(" "));return}ls(new Dn(`${s}-version`,()=>({library:s,version:e}),"VERSION"))}/**
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
 */const Fp="firebase-heartbeat-database",Vp=1,cs="firebase-heartbeat-store";let Mr=null;function ql(){return Mr||(Mr=tp(Fp,Vp,{upgrade:(t,e)=>{switch(e){case 0:try{t.createObjectStore(cs)}catch(n){console.warn(n)}}}}).catch(t=>{throw jt.create("idb-open",{originalErrorMessage:t.message})})),Mr}async function $p(t){try{const n=(await ql()).transaction(cs),s=await n.objectStore(cs).get(Jl(t));return await n.done,s}catch(e){if(e instanceof Gt)St.warn(e.message);else{const n=jt.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});St.warn(n.message)}}}async function Go(t,e){try{const s=(await ql()).transaction(cs,"readwrite");await s.objectStore(cs).put(e,Jl(t)),await s.done}catch(n){if(n instanceof Gt)St.warn(n.message);else{const s=jt.create("idb-set",{originalErrorMessage:n==null?void 0:n.message});St.warn(s.message)}}}function Jl(t){return`${t.name}!${t.options.appId}`}/**
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
 */const Bp=1024,Hp=30;class jp{constructor(e){this.container=e,this._heartbeatsCache=null;const n=this.container.getProvider("app").getImmediate();this._storage=new Kp(n),this._heartbeatsCachePromise=this._storage.read().then(s=>(this._heartbeatsCache=s,s))}async triggerHeartbeat(){var e,n;try{const r=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),i=zo();if(((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((n=this._heartbeatsCache)==null?void 0:n.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===i||this._heartbeatsCache.heartbeats.some(o=>o.date===i))return;if(this._heartbeatsCache.heartbeats.push({date:i,agent:r}),this._heartbeatsCache.heartbeats.length>Hp){const o=Gp(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(o,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(s){St.warn(s)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const n=zo(),{heartbeatsToSend:s,unsentEntries:r}=Wp(this._heartbeatsCache.heartbeats),i=Vl(JSON.stringify({version:2,heartbeats:s}));return this._heartbeatsCache.lastSentHeartbeatDate=n,r.length>0?(this._heartbeatsCache.heartbeats=r,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),i}catch(n){return St.warn(n),""}}}function zo(){return new Date().toISOString().substring(0,10)}function Wp(t,e=Bp){const n=[];let s=t.slice();for(const r of t){const i=n.find(o=>o.agent===r.agent);if(i){if(i.dates.push(r.date),qo(n)>e){i.dates.pop();break}}else if(n.push({agent:r.agent,dates:[r.date]}),qo(n)>e){n.pop();break}s=s.slice(1)}return{heartbeatsToSend:n,unsentEntries:s}}class Kp{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return Oh()?kh().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const n=await $p(this.app);return n!=null&&n.heartbeats?n:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){if(await this._canUseIndexedDBPromise){const s=await this.read();return Go(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??s.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){if(await this._canUseIndexedDBPromise){const s=await this.read();return Go(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??s.lastSentHeartbeatDate,heartbeats:[...s.heartbeats,...e.heartbeats]})}else return}}function qo(t){return Vl(JSON.stringify({version:2,heartbeats:t})).length}function Gp(t){if(t.length===0)return-1;let e=0,n=t[0].date;for(let s=1;s<t.length;s++)t[s].date<n&&(n=t[s].date,e=s);return e}/**
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
 */function zp(t){ls(new Dn("platform-logger",e=>new rp(e),"PRIVATE")),ls(new Dn("heartbeat",e=>new jp(e),"PRIVATE")),wn(si,Wo,t),wn(si,Wo,"esm2020"),wn("fire-js","")}zp("");function Yl(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const qp=Yl,Xl=new ms("auth","Firebase",Yl());/**
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
 */const zs=new jl("@firebase/auth");function Jp(t,...e){zs.logLevel<=ne.WARN&&zs.warn(`Auth (${ys}): ${t}`,...e)}function Ns(t,...e){zs.logLevel<=ne.ERROR&&zs.error(`Auth (${ys}): ${t}`,...e)}/**
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
 */function Ke(t,...e){throw ki(t,...e)}function at(t,...e){return ki(t,...e)}function Ql(t,e,n){const s={...qp(),[e]:n};return new ms("auth","Firebase",s).create(e,{appName:t.name})}function Wt(t){return Ql(t,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function ki(t,...e){if(typeof t!="string"){const n=e[0],s=[...e.slice(1)];return s[0]&&(s[0].appName=t.name),t._errorFactory.create(n,...s)}return Xl.create(t,...e)}function B(t,e,...n){if(!t)throw ki(e,...n)}function vt(t){const e="INTERNAL ASSERTION FAILED: "+t;throw Ns(e),new Error(e)}function Ct(t,e){t||vt(e)}/**
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
 */function oi(){var t;return typeof self<"u"&&((t=self.location)==null?void 0:t.href)||""}function Yp(){return Jo()==="http:"||Jo()==="https:"}function Jo(){var t;return typeof self<"u"&&((t=self.location)==null?void 0:t.protocol)||null}/**
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
 */class vs{constructor(e,n){this.shortDelay=e,this.longDelay=n,Ct(n>e,"Short delay should be less than long delay!"),this.isMobile=Ch()||Rh()}get(){return Xp()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
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
 */function Ni(t,e){Ct(t.emulator,"Emulator should always be set here");const{url:n}=t.emulator;return e?`${n}${e.startsWith("/")?e.slice(1):e}`:n}/**
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
 */class Zl{static initialize(e,n,s){this.fetchImpl=e,n&&(this.headersImpl=n),s&&(this.responseImpl=s)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;vt("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;vt("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;vt("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
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
 */const eg=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],tg=new vs(3e4,6e4);function ln(t,e){return t.tenantId&&!e.tenantId?{...e,tenantId:t.tenantId}:e}async function zt(t,e,n,s,r={}){return ec(t,r,async()=>{let i={},o={};s&&(e==="GET"?o=s:i={body:JSON.stringify(s)});const a=_s({key:t.config.apiKey,...o}).slice(1),l=await t._getAdditionalHeaders();l["Content-Type"]="application/json",t.languageCode&&(l["X-Firebase-Locale"]=t.languageCode);const c={method:e,headers:l,...i};return Th()||(c.referrerPolicy="no-referrer"),t.emulatorConfig&&hr(t.emulatorConfig.host)&&(c.credentials="include"),Zl.fetch()(await tc(t,t.config.apiHost,n,a),c)})}async function ec(t,e,n){t._canInitEmulator=!1;const s={...Zp,...e};try{const r=new sg(t),i=await Promise.race([n(),r.promise]);r.clearNetworkTimeout();const o=await i.json();if("needConfirmation"in o)throw Cs(t,"account-exists-with-different-credential",o);if(i.ok&&!("errorMessage"in o))return o;{const a=i.ok?o.errorMessage:o.error.message,[l,c]=a.split(" : ");if(l==="FEDERATED_USER_ID_ALREADY_LINKED")throw Cs(t,"credential-already-in-use",o);if(l==="EMAIL_EXISTS")throw Cs(t,"email-already-in-use",o);if(l==="USER_DISABLED")throw Cs(t,"user-disabled",o);const u=s[l]||l.toLowerCase().replace(/[_\s]+/g,"-");if(c)throw Ql(t,u,c);Ke(t,u)}}catch(r){if(r instanceof Gt)throw r;Ke(t,"network-request-failed",{message:String(r)})}}async function pr(t,e,n,s,r={}){const i=await zt(t,e,n,s,r);return"mfaPendingCredential"in i&&Ke(t,"multi-factor-auth-required",{_serverResponse:i}),i}async function tc(t,e,n,s){const r=`${e}${n}?${s}`,i=t,o=i.config.emulator?Ni(t.config,r):`${t.config.apiScheme}://${r}`;return eg.includes(n)&&(await i._persistenceManagerAvailable,i._getPersistenceType()==="COOKIE")?i._getPersistence()._getFinalTarget(o).toString():o}function ng(t){switch(t){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}class sg{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((n,s)=>{this.timer=setTimeout(()=>s(at(this.auth,"network-request-failed")),tg.get())})}}function Cs(t,e,n){const s={appName:t.name};n.email&&(s.email=n.email),n.phoneNumber&&(s.phoneNumber=n.phoneNumber);const r=at(t,e,s);return r.customData._tokenResponse=n,r}function Yo(t){return t!==void 0&&t.enterprise!==void 0}class rg{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||this.recaptchaEnforcementState.length===0)return null;for(const n of this.recaptchaEnforcementState)if(n.provider&&n.provider===e)return ng(n.enforcementState);return null}isProviderEnabled(e){return this.getProviderEnforcementState(e)==="ENFORCE"||this.getProviderEnforcementState(e)==="AUDIT"}isAnyProviderEnabled(){return this.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")||this.isProviderEnabled("PHONE_PROVIDER")}}async function ig(t,e){return zt(t,"GET","/v2/recaptchaConfig",ln(t,e))}/**
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
 */async function og(t,e){return zt(t,"POST","/v1/accounts:delete",e)}async function qs(t,e){return zt(t,"POST","/v1/accounts:lookup",e)}/**
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
 */function ts(t){if(t)try{const e=new Date(Number(t));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function ag(t,e=!1){const n=At(t),s=await n.getIdToken(e),r=Di(s);B(r&&r.exp&&r.auth_time&&r.iat,n.auth,"internal-error");const i=typeof r.firebase=="object"?r.firebase:void 0,o=i==null?void 0:i.sign_in_provider;return{claims:r,token:s,authTime:ts(Ur(r.auth_time)),issuedAtTime:ts(Ur(r.iat)),expirationTime:ts(Ur(r.exp)),signInProvider:o||null,signInSecondFactor:(i==null?void 0:i.sign_in_second_factor)||null}}function Ur(t){return Number(t)*1e3}function Di(t){const[e,n,s]=t.split(".");if(e===void 0||n===void 0||s===void 0)return Ns("JWT malformed, contained fewer than 3 sections"),null;try{const r=$l(n);return r?JSON.parse(r):(Ns("Failed to decode base64 JWT payload"),null)}catch(r){return Ns("Caught error parsing JWT payload as JSON",r==null?void 0:r.toString()),null}}function Xo(t){const e=Di(t);return B(e,"internal-error"),B(typeof e.exp<"u","internal-error"),B(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
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
 */async function us(t,e,n=!1){if(n)return e;try{return await e}catch(s){throw s instanceof Gt&&lg(s)&&t.auth.currentUser===t&&await t.auth.signOut(),s}}function lg({code:t}){return t==="auth/user-disabled"||t==="auth/user-token-expired"}/**
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
 */class cg{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){if(e){const n=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),n}else{this.errorBackoff=3e4;const s=(this.user.stsTokenManager.expirationTime??0)-Date.now()-3e5;return Math.max(0,s)}}schedule(e=!1){if(!this.isRunning)return;const n=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},n)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
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
 */class ai{constructor(e,n){this.createdAt=e,this.lastLoginAt=n,this._initializeTime()}_initializeTime(){this.lastSignInTime=ts(this.lastLoginAt),this.creationTime=ts(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
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
 */async function Js(t){var f;const e=t.auth,n=await t.getIdToken(),s=await us(t,qs(e,{idToken:n}));B(s==null?void 0:s.users.length,e,"internal-error");const r=s.users[0];t._notifyReloadListener(r);const i=(f=r.providerUserInfo)!=null&&f.length?nc(r.providerUserInfo):[],o=dg(t.providerData,i),a=t.isAnonymous,l=!(t.email&&r.passwordHash)&&!(o!=null&&o.length),c=a?l:!1,u={uid:r.localId,displayName:r.displayName||null,photoURL:r.photoUrl||null,email:r.email||null,emailVerified:r.emailVerified||!1,phoneNumber:r.phoneNumber||null,tenantId:r.tenantId||null,providerData:o,metadata:new ai(r.createdAt,r.lastLoginAt),isAnonymous:c};Object.assign(t,u)}async function ug(t){const e=At(t);await Js(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function dg(t,e){return[...t.filter(s=>!e.some(r=>r.providerId===s.providerId)),...e]}function nc(t){return t.map(({providerId:e,...n})=>({providerId:e,uid:n.rawId||"",displayName:n.displayName||null,email:n.email||null,phoneNumber:n.phoneNumber||null,photoURL:n.photoUrl||null}))}/**
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
 */async function fg(t,e){const n=await ec(t,{},async()=>{const s=_s({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:r,apiKey:i}=t.config,o=await tc(t,r,"/v1/token",`key=${i}`),a=await t._getAdditionalHeaders();a["Content-Type"]="application/x-www-form-urlencoded";const l={method:"POST",headers:a,body:s};return t.emulatorConfig&&hr(t.emulatorConfig.host)&&(l.credentials="include"),Zl.fetch()(o,l)});return{accessToken:n.access_token,expiresIn:n.expires_in,refreshToken:n.refresh_token}}async function hg(t,e){return zt(t,"POST","/v2/accounts:revokeToken",ln(t,e))}/**
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
 */class Sn{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){B(e.idToken,"internal-error"),B(typeof e.idToken<"u","internal-error"),B(typeof e.refreshToken<"u","internal-error");const n="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):Xo(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,n)}updateFromIdToken(e){B(e.length!==0,"internal-error");const n=Xo(e);this.updateTokensAndExpiration(e,null,n)}async getToken(e,n=!1){return!n&&this.accessToken&&!this.isExpired?this.accessToken:(B(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,n){const{accessToken:s,refreshToken:r,expiresIn:i}=await fg(e,n);this.updateTokensAndExpiration(s,r,Number(i))}updateTokensAndExpiration(e,n,s){this.refreshToken=n||null,this.accessToken=e||null,this.expirationTime=Date.now()+s*1e3}static fromJSON(e,n){const{refreshToken:s,accessToken:r,expirationTime:i}=n,o=new Sn;return s&&(B(typeof s=="string","internal-error",{appName:e}),o.refreshToken=s),r&&(B(typeof r=="string","internal-error",{appName:e}),o.accessToken=r),i&&(B(typeof i=="number","internal-error",{appName:e}),o.expirationTime=i),o}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new Sn,this.toJSON())}_performRefresh(){return vt("not implemented")}}/**
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
 */function Nt(t,e){B(typeof t=="string"||typeof t>"u","internal-error",{appName:e})}class Be{constructor({uid:e,auth:n,stsTokenManager:s,...r}){this.providerId="firebase",this.proactiveRefresh=new cg(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=n,this.stsTokenManager=s,this.accessToken=s.accessToken,this.displayName=r.displayName||null,this.email=r.email||null,this.emailVerified=r.emailVerified||!1,this.phoneNumber=r.phoneNumber||null,this.photoURL=r.photoURL||null,this.isAnonymous=r.isAnonymous||!1,this.tenantId=r.tenantId||null,this.providerData=r.providerData?[...r.providerData]:[],this.metadata=new ai(r.createdAt||void 0,r.lastLoginAt||void 0)}async getIdToken(e){const n=await us(this,this.stsTokenManager.getToken(this.auth,e));return B(n,this.auth,"internal-error"),this.accessToken!==n&&(this.accessToken=n,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),n}getIdTokenResult(e){return ag(this,e)}reload(){return ug(this)}_assign(e){this!==e&&(B(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(n=>({...n})),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const n=new Be({...this,auth:e,stsTokenManager:this.stsTokenManager._clone()});return n.metadata._copy(this.metadata),n}_onReload(e){B(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,n=!1){let s=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),s=!0),n&&await Js(this),await this.auth._persistUserIfCurrent(this),s&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(st(this.auth.app))return Promise.reject(Wt(this.auth));const e=await this.getIdToken();return await us(this,og(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return{uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>({...e})),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId,...this.metadata.toJSON(),apiKey:this.auth.config.apiKey,appName:this.auth.name}}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,n){const s=n.displayName??void 0,r=n.email??void 0,i=n.phoneNumber??void 0,o=n.photoURL??void 0,a=n.tenantId??void 0,l=n._redirectEventId??void 0,c=n.createdAt??void 0,u=n.lastLoginAt??void 0,{uid:f,emailVerified:d,isAnonymous:m,providerData:v,stsTokenManager:y}=n;B(f&&y,e,"internal-error");const b=Sn.fromJSON(this.name,y);B(typeof f=="string",e,"internal-error"),Nt(s,e.name),Nt(r,e.name),B(typeof d=="boolean",e,"internal-error"),B(typeof m=="boolean",e,"internal-error"),Nt(i,e.name),Nt(o,e.name),Nt(a,e.name),Nt(l,e.name),Nt(c,e.name),Nt(u,e.name);const E=new Be({uid:f,auth:e,email:r,emailVerified:d,displayName:s,isAnonymous:m,photoURL:o,phoneNumber:i,tenantId:a,stsTokenManager:b,createdAt:c,lastLoginAt:u});return v&&Array.isArray(v)&&(E.providerData=v.map(C=>({...C}))),l&&(E._redirectEventId=l),E}static async _fromIdTokenResponse(e,n,s=!1){const r=new Sn;r.updateFromServerResponse(n);const i=new Be({uid:n.localId,auth:e,stsTokenManager:r,isAnonymous:s});return await Js(i),i}static async _fromGetAccountInfoResponse(e,n,s){const r=n.users[0];B(r.localId!==void 0,"internal-error");const i=r.providerUserInfo!==void 0?nc(r.providerUserInfo):[],o=!(r.email&&r.passwordHash)&&!(i!=null&&i.length),a=new Sn;a.updateFromIdToken(s);const l=new Be({uid:r.localId,auth:e,stsTokenManager:a,isAnonymous:o}),c={uid:r.localId,displayName:r.displayName||null,photoURL:r.photoUrl||null,email:r.email||null,emailVerified:r.emailVerified||!1,phoneNumber:r.phoneNumber||null,tenantId:r.tenantId||null,providerData:i,metadata:new ai(r.createdAt,r.lastLoginAt),isAnonymous:!(r.email&&r.passwordHash)&&!(i!=null&&i.length)};return Object.assign(l,c),l}}/**
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
 */const Qo=new Map;function bt(t){Ct(t instanceof Function,"Expected a class definition");let e=Qo.get(t);return e?(Ct(e instanceof t,"Instance stored in cache mismatched with class"),e):(e=new t,Qo.set(t,e),e)}/**
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
 */class sc{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,n){this.storage[e]=n}async _get(e){const n=this.storage[e];return n===void 0?null:n}async _remove(e){delete this.storage[e]}_addListener(e,n){}_removeListener(e,n){}}sc.type="NONE";const Zo=sc;/**
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
 */function Ds(t,e,n){return`firebase:${t}:${e}:${n}`}class Cn{constructor(e,n,s){this.persistence=e,this.auth=n,this.userKey=s;const{config:r,name:i}=this.auth;this.fullUserKey=Ds(this.userKey,r.apiKey,i),this.fullPersistenceKey=Ds("persistence",r.apiKey,i),this.boundEventHandler=n._onStorageEvent.bind(n),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const n=await qs(this.auth,{idToken:e}).catch(()=>{});return n?Be._fromGetAccountInfoResponse(this.auth,n,e):null}return Be._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const n=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,n)return this.setCurrentUser(n)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,n,s="authUser"){if(!n.length)return new Cn(bt(Zo),e,s);const r=(await Promise.all(n.map(async c=>{if(await c._isAvailable())return c}))).filter(c=>c);let i=r[0]||bt(Zo);const o=Ds(s,e.config.apiKey,e.name);let a=null;for(const c of n)try{const u=await c._get(o);if(u){let f;if(typeof u=="string"){const d=await qs(e,{idToken:u}).catch(()=>{});if(!d)break;f=await Be._fromGetAccountInfoResponse(e,d,u)}else f=Be._fromJSON(e,u);c!==i&&(a=f),i=c;break}}catch{}const l=r.filter(c=>c._shouldAllowMigration);return!i._shouldAllowMigration||!l.length?new Cn(i,e,s):(i=l[0],a&&await i._set(o,a.toJSON()),await Promise.all(n.map(async c=>{if(c!==i)try{await c._remove(o)}catch{}})),new Cn(i,e,s))}}/**
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
 */function ea(t){const e=t.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(ac(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(rc(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(cc(e))return"Blackberry";if(uc(e))return"Webos";if(ic(e))return"Safari";if((e.includes("chrome/")||oc(e))&&!e.includes("edge/"))return"Chrome";if(lc(e))return"Android";{const n=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,s=t.match(n);if((s==null?void 0:s.length)===2)return s[1]}return"Other"}function rc(t=Ae()){return/firefox\//i.test(t)}function ic(t=Ae()){const e=t.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function oc(t=Ae()){return/crios\//i.test(t)}function ac(t=Ae()){return/iemobile/i.test(t)}function lc(t=Ae()){return/android/i.test(t)}function cc(t=Ae()){return/blackberry/i.test(t)}function uc(t=Ae()){return/webos/i.test(t)}function xi(t=Ae()){return/iphone|ipad|ipod/i.test(t)||/macintosh/i.test(t)&&/mobile/i.test(t)}function pg(t=Ae()){var e;return xi(t)&&!!((e=window.navigator)!=null&&e.standalone)}function gg(){return Ph()&&document.documentMode===10}function dc(t=Ae()){return xi(t)||lc(t)||uc(t)||cc(t)||/windows phone/i.test(t)||ac(t)}/**
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
 */function fc(t,e=[]){let n;switch(t){case"Browser":n=ea(Ae());break;case"Worker":n=`${ea(Ae())}-${t}`;break;default:n=t}const s=e.length?e.join(","):"FirebaseCore-web";return`${n}/JsCore/${ys}/${s}`}/**
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
 */class mg{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,n){const s=i=>new Promise((o,a)=>{try{const l=e(i);o(l)}catch(l){a(l)}});s.onAbort=n,this.queue.push(s);const r=this.queue.length-1;return()=>{this.queue[r]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const n=[];try{for(const s of this.queue)await s(e),s.onAbort&&n.push(s.onAbort)}catch(s){n.reverse();for(const r of n)try{r()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:s==null?void 0:s.message})}}}/**
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
 */const yg=6;class vg{constructor(e){var s;const n=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=n.minPasswordLength??yg,n.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=n.maxPasswordLength),n.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=n.containsLowercaseCharacter),n.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=n.containsUppercaseCharacter),n.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=n.containsNumericCharacter),n.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=n.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=((s=e.allowedNonAlphanumericCharacters)==null?void 0:s.join(""))??"",this.forceUpgradeOnSignin=e.forceUpgradeOnSignin??!1,this.schemaVersion=e.schemaVersion}validatePassword(e){const n={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,n),this.validatePasswordCharacterOptions(e,n),n.isValid&&(n.isValid=n.meetsMinPasswordLength??!0),n.isValid&&(n.isValid=n.meetsMaxPasswordLength??!0),n.isValid&&(n.isValid=n.containsLowercaseLetter??!0),n.isValid&&(n.isValid=n.containsUppercaseLetter??!0),n.isValid&&(n.isValid=n.containsNumericCharacter??!0),n.isValid&&(n.isValid=n.containsNonAlphanumericCharacter??!0),n}validatePasswordLengthOptions(e,n){const s=this.customStrengthOptions.minPasswordLength,r=this.customStrengthOptions.maxPasswordLength;s&&(n.meetsMinPasswordLength=e.length>=s),r&&(n.meetsMaxPasswordLength=e.length<=r)}validatePasswordCharacterOptions(e,n){this.updatePasswordCharacterOptionsStatuses(n,!1,!1,!1,!1);let s;for(let r=0;r<e.length;r++)s=e.charAt(r),this.updatePasswordCharacterOptionsStatuses(n,s>="a"&&s<="z",s>="A"&&s<="Z",s>="0"&&s<="9",this.allowedNonAlphanumericCharacters.includes(s))}updatePasswordCharacterOptionsStatuses(e,n,s,r,i){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=n)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=s)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=r)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=i))}}/**
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
 */class bg{constructor(e,n,s,r){this.app=e,this.heartbeatServiceProvider=n,this.appCheckServiceProvider=s,this.config=r,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new ta(this),this.idTokenSubscription=new ta(this),this.beforeStateQueue=new mg(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=Xl,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=r.sdkClientVersion,this._persistenceManagerAvailable=new Promise(i=>this._resolvePersistenceManagerAvailable=i)}_initializeWithPersistence(e,n){return n&&(this._popupRedirectResolver=bt(n)),this._initializationPromise=this.queue(async()=>{var s,r,i;if(!this._deleted&&(this.persistenceManager=await Cn.create(this,e),(s=this._resolvePersistenceManagerAvailable)==null||s.call(this),!this._deleted)){if((r=this._popupRedirectResolver)!=null&&r._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(n),this.lastNotifiedUid=((i=this.currentUser)==null?void 0:i.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const n=await qs(this,{idToken:e}),s=await Be._fromGetAccountInfoResponse(this,n,e);await this.directlySetCurrentUser(s)}catch(n){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",n),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var i;if(st(this.app)){const o=this.app.settings.authIdToken;return o?new Promise(a=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(o).then(a,a))}):this.directlySetCurrentUser(null)}const n=await this.assertedPersistence.getCurrentUser();let s=n,r=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const o=(i=this.redirectUser)==null?void 0:i._redirectEventId,a=s==null?void 0:s._redirectEventId,l=await this.tryRedirectSignIn(e);(!o||o===a)&&(l!=null&&l.user)&&(s=l.user,r=!0)}if(!s)return this.directlySetCurrentUser(null);if(!s._redirectEventId){if(r)try{await this.beforeStateQueue.runMiddleware(s)}catch(o){s=n,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(o))}return s?this.reloadAndSetCurrentUserOrClear(s):this.directlySetCurrentUser(null)}return B(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===s._redirectEventId?this.directlySetCurrentUser(s):this.reloadAndSetCurrentUserOrClear(s)}async tryRedirectSignIn(e){let n=null;try{n=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return n}async reloadAndSetCurrentUserOrClear(e){try{await Js(e)}catch(n){if((n==null?void 0:n.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=Qp()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(st(this.app))return Promise.reject(Wt(this));const n=e?At(e):null;return n&&B(n.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(n&&n._clone(this))}async _updateCurrentUser(e,n=!1){if(!this._deleted)return e&&B(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),n||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return st(this.app)?Promise.reject(Wt(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return st(this.app)?Promise.reject(Wt(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(bt(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const n=this._getPasswordPolicyInternal();return n.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):n.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await _g(this),n=new vg(e);this.tenantId===null?this._projectPasswordPolicy=n:this._tenantPasswordPolicies[this.tenantId]=n}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new ms("auth","Firebase",e())}onAuthStateChanged(e,n,s){return this.registerStateListener(this.authStateSubscription,e,n,s)}beforeAuthStateChanged(e,n){return this.beforeStateQueue.pushCallback(e,n)}onIdTokenChanged(e,n,s){return this.registerStateListener(this.idTokenSubscription,e,n,s)}authStateReady(){return new Promise((e,n)=>{if(this.currentUser)e();else{const s=this.onAuthStateChanged(()=>{s(),e()},n)}})}async revokeAccessToken(e){if(this.currentUser){const n=await this.currentUser.getIdToken(),s={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:n};this.tenantId!=null&&(s.tenantId=this.tenantId),await hg(this,s)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)==null?void 0:e.toJSON()}}async _setRedirectUser(e,n){const s=await this.getOrInitRedirectPersistenceManager(n);return e===null?s.removeCurrentUser():s.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const n=e&&bt(e)||this._popupRedirectResolver;B(n,this,"argument-error"),this.redirectPersistenceManager=await Cn.create(this,[bt(n._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var n,s;return this._isInitialized&&await this.queue(async()=>{}),((n=this._currentUser)==null?void 0:n._redirectEventId)===e?this._currentUser:((s=this.redirectUser)==null?void 0:s._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var n;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const e=((n=this.currentUser)==null?void 0:n.uid)??null;this.lastNotifiedUid!==e&&(this.lastNotifiedUid=e,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,n,s,r){if(this._deleted)return()=>{};const i=typeof n=="function"?n:n.next.bind(n);let o=!1;const a=this._isInitialized?Promise.resolve():this._initializationPromise;if(B(a,this,"internal-error"),a.then(()=>{o||i(this.currentUser)}),typeof n=="function"){const l=e.addObserver(n,s,r);return()=>{o=!0,l()}}else{const l=e.addObserver(n);return()=>{o=!0,l()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return B(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=fc(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var r;const e={"X-Client-Version":this.clientVersion};this.app.options.appId&&(e["X-Firebase-gmpid"]=this.app.options.appId);const n=await((r=this.heartbeatServiceProvider.getImmediate({optional:!0}))==null?void 0:r.getHeartbeatsHeader());n&&(e["X-Firebase-Client"]=n);const s=await this._getAppCheckToken();return s&&(e["X-Firebase-AppCheck"]=s),e}async _getAppCheckToken(){var n;if(st(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=await((n=this.appCheckServiceProvider.getImmediate({optional:!0}))==null?void 0:n.getToken());return e!=null&&e.error&&Jp(`Error while retrieving App Check token: ${e.error}`),e==null?void 0:e.token}}function Mn(t){return At(t)}class ta{constructor(e){this.auth=e,this.observer=null,this.addObserver=Mh(n=>this.observer=n)}get next(){return B(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
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
 */let gr={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function Eg(t){gr=t}function hc(t){return gr.loadJS(t)}function Ig(){return gr.recaptchaEnterpriseScript}function wg(){return gr.gapiScript}function Sg(t){return`__${t}${Math.floor(Math.random()*1e6)}`}class Cg{constructor(){this.enterprise=new Tg}ready(e){e()}execute(e,n){return Promise.resolve("token")}render(e,n){return""}}class Tg{ready(e){e()}execute(e,n){return Promise.resolve("token")}render(e,n){return""}}const Ag="recaptcha-enterprise",pc="NO_RECAPTCHA";class Rg{constructor(e){this.type=Ag,this.auth=Mn(e)}async verify(e="verify",n=!1){async function s(i){if(!n){if(i.tenantId==null&&i._agentRecaptchaConfig!=null)return i._agentRecaptchaConfig.siteKey;if(i.tenantId!=null&&i._tenantRecaptchaConfigs[i.tenantId]!==void 0)return i._tenantRecaptchaConfigs[i.tenantId].siteKey}return new Promise(async(o,a)=>{ig(i,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(l=>{if(l.recaptchaKey===void 0)a(new Error("recaptcha Enterprise site key undefined"));else{const c=new rg(l);return i.tenantId==null?i._agentRecaptchaConfig=c:i._tenantRecaptchaConfigs[i.tenantId]=c,o(c.siteKey)}}).catch(l=>{a(l)})})}function r(i,o,a){const l=window.grecaptcha;Yo(l)?l.enterprise.ready(()=>{l.enterprise.execute(i,{action:e}).then(c=>{o(c)}).catch(()=>{o(pc)})}):a(Error("No reCAPTCHA enterprise script loaded."))}return this.auth.settings.appVerificationDisabledForTesting?new Cg().execute("siteKey",{action:"verify"}):new Promise((i,o)=>{s(this.auth).then(a=>{if(!n&&Yo(window.grecaptcha))r(a,i,o);else{if(typeof window>"u"){o(new Error("RecaptchaVerifier is only supported in browser"));return}let l=Ig();l.length!==0&&(l+=a),hc(l).then(()=>{r(a,i,o)}).catch(c=>{o(c)})}}).catch(a=>{o(a)})})}}async function na(t,e,n,s=!1,r=!1){const i=new Rg(t);let o;if(r)o=pc;else try{o=await i.verify(n)}catch{o=await i.verify(n,!0)}const a={...e};if(n==="mfaSmsEnrollment"||n==="mfaSmsSignIn"){if("phoneEnrollmentInfo"in a){const l=a.phoneEnrollmentInfo.phoneNumber,c=a.phoneEnrollmentInfo.recaptchaToken;Object.assign(a,{phoneEnrollmentInfo:{phoneNumber:l,recaptchaToken:c,captchaResponse:o,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}else if("phoneSignInInfo"in a){const l=a.phoneSignInInfo.recaptchaToken;Object.assign(a,{phoneSignInInfo:{recaptchaToken:l,captchaResponse:o,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}return a}return s?Object.assign(a,{captchaResp:o}):Object.assign(a,{captchaResponse:o}),Object.assign(a,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(a,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),a}async function sa(t,e,n,s,r){var i;if((i=t._getRecaptchaConfig())!=null&&i.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){const o=await na(t,e,n,n==="getOobCode");return s(t,o)}else return s(t,e).catch(async o=>{if(o.code==="auth/missing-recaptcha-token"){console.log(`${n} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);const a=await na(t,e,n,n==="getOobCode");return s(t,a)}else return Promise.reject(o)})}/**
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
 */function Pg(t,e){const n=Gl(t,"auth");if(n.isInitialized()){const r=n.getImmediate(),i=n.getOptions();if(Nn(i,e??{}))return r;Ke(r,"already-initialized")}return n.initialize({options:e})}function Og(t,e){const n=(e==null?void 0:e.persistence)||[],s=(Array.isArray(n)?n:[n]).map(bt);e!=null&&e.errorMap&&t._updateErrorMap(e.errorMap),t._initializeWithPersistence(s,e==null?void 0:e.popupRedirectResolver)}function kg(t,e,n){const s=Mn(t);B(/^https?:\/\//.test(e),s,"invalid-emulator-scheme");const r=!1,i=gc(e),{host:o,port:a}=Ng(e),l=a===null?"":`:${a}`,c={url:`${i}//${o}${l}/`},u=Object.freeze({host:o,port:a,protocol:i.replace(":",""),options:Object.freeze({disableWarnings:r})});if(!s._canInitEmulator){B(s.config.emulator&&s.emulatorConfig,s,"emulator-config-failed"),B(Nn(c,s.config.emulator)&&Nn(u,s.emulatorConfig),s,"emulator-config-failed");return}s.config.emulator=c,s.emulatorConfig=u,s.settings.appVerificationDisabledForTesting=!0,hr(o)?(Eh(`${i}//${o}${l}`),Sh("Auth",!0)):Dg()}function gc(t){const e=t.indexOf(":");return e<0?"":t.substr(0,e+1)}function Ng(t){const e=gc(t),n=/(\/\/)?([^?#/]+)/.exec(t.substr(e.length));if(!n)return{host:"",port:null};const s=n[2].split("@").pop()||"",r=/^(\[[^\]]+\])(:|$)/.exec(s);if(r){const i=r[1];return{host:i,port:ra(s.substr(i.length+1))}}else{const[i,o]=s.split(":");return{host:i,port:ra(o)}}}function ra(t){if(!t)return null;const e=Number(t);return isNaN(e)?null:e}function Dg(){function t(){const e=document.createElement("p"),n=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",n.position="fixed",n.width="100%",n.backgroundColor="#ffffff",n.border=".1em solid #000000",n.color="#b50000",n.bottom="0px",n.left="0px",n.margin="0px",n.zIndex="10000",n.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",t):t())}/**
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
 */class Li{constructor(e,n){this.providerId=e,this.signInMethod=n}toJSON(){return vt("not implemented")}_getIdTokenResponse(e){return vt("not implemented")}_linkToIdToken(e,n){return vt("not implemented")}_getReauthenticationResolver(e){return vt("not implemented")}}async function xg(t,e){return zt(t,"POST","/v1/accounts:signUp",e)}/**
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
 */async function Lg(t,e){return pr(t,"POST","/v1/accounts:signInWithPassword",ln(t,e))}/**
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
 */async function Mg(t,e){return pr(t,"POST","/v1/accounts:signInWithEmailLink",ln(t,e))}async function Ug(t,e){return pr(t,"POST","/v1/accounts:signInWithEmailLink",ln(t,e))}/**
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
 */class ds extends Li{constructor(e,n,s,r=null){super("password",s),this._email=e,this._password=n,this._tenantId=r}static _fromEmailAndPassword(e,n){return new ds(e,n,"password")}static _fromEmailAndCode(e,n,s=null){return new ds(e,n,"emailLink",s)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){const n=typeof e=="string"?JSON.parse(e):e;if(n!=null&&n.email&&(n!=null&&n.password)){if(n.signInMethod==="password")return this._fromEmailAndPassword(n.email,n.password);if(n.signInMethod==="emailLink")return this._fromEmailAndCode(n.email,n.password,n.tenantId)}return null}async _getIdTokenResponse(e){switch(this.signInMethod){case"password":const n={returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return sa(e,n,"signInWithPassword",Lg);case"emailLink":return Mg(e,{email:this._email,oobCode:this._password});default:Ke(e,"internal-error")}}async _linkToIdToken(e,n){switch(this.signInMethod){case"password":const s={idToken:n,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return sa(e,s,"signUpPassword",xg);case"emailLink":return Ug(e,{idToken:n,email:this._email,oobCode:this._password});default:Ke(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}}/**
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
 */async function Tn(t,e){return pr(t,"POST","/v1/accounts:signInWithIdp",ln(t,e))}/**
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
 */const Fg="http://localhost";class rn extends Li{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const n=new rn(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(n.idToken=e.idToken),e.accessToken&&(n.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(n.nonce=e.nonce),e.pendingToken&&(n.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(n.accessToken=e.oauthToken,n.secret=e.oauthTokenSecret):Ke("argument-error"),n}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const n=typeof e=="string"?JSON.parse(e):e,{providerId:s,signInMethod:r,...i}=n;if(!s||!r)return null;const o=new rn(s,r);return o.idToken=i.idToken||void 0,o.accessToken=i.accessToken||void 0,o.secret=i.secret,o.nonce=i.nonce,o.pendingToken=i.pendingToken||null,o}_getIdTokenResponse(e){const n=this.buildRequest();return Tn(e,n)}_linkToIdToken(e,n){const s=this.buildRequest();return s.idToken=n,Tn(e,s)}_getReauthenticationResolver(e){const n=this.buildRequest();return n.autoCreate=!1,Tn(e,n)}buildRequest(){const e={requestUri:Fg,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const n={};this.idToken&&(n.id_token=this.idToken),this.accessToken&&(n.access_token=this.accessToken),this.secret&&(n.oauth_token_secret=this.secret),n.providerId=this.providerId,this.nonce&&!this.pendingToken&&(n.nonce=this.nonce),e.postBody=_s(n)}return e}}/**
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
 */function Vg(t){switch(t){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}function $g(t){const e=Wn(Kn(t)).link,n=e?Wn(Kn(e)).deep_link_id:null,s=Wn(Kn(t)).deep_link_id;return(s?Wn(Kn(s)).link:null)||s||n||e||t}class Mi{constructor(e){const n=Wn(Kn(e)),s=n.apiKey??null,r=n.oobCode??null,i=Vg(n.mode??null);B(s&&r&&i,"argument-error"),this.apiKey=s,this.operation=i,this.code=r,this.continueUrl=n.continueUrl??null,this.languageCode=n.lang??null,this.tenantId=n.tenantId??null}static parseLink(e){const n=$g(e);try{return new Mi(n)}catch{return null}}}/**
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
 */class Un{constructor(){this.providerId=Un.PROVIDER_ID}static credential(e,n){return ds._fromEmailAndPassword(e,n)}static credentialWithLink(e,n){const s=Mi.parseLink(n);return B(s,"argument-error"),ds._fromEmailAndCode(e,s.code,s.tenantId)}}Un.PROVIDER_ID="password";Un.EMAIL_PASSWORD_SIGN_IN_METHOD="password";Un.EMAIL_LINK_SIGN_IN_METHOD="emailLink";/**
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
 */class bs extends mc{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
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
 */class Mt extends bs{constructor(){super("facebook.com")}static credential(e){return rn._fromParams({providerId:Mt.PROVIDER_ID,signInMethod:Mt.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Mt.credentialFromTaggedObject(e)}static credentialFromError(e){return Mt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Mt.credential(e.oauthAccessToken)}catch{return null}}}Mt.FACEBOOK_SIGN_IN_METHOD="facebook.com";Mt.PROVIDER_ID="facebook.com";/**
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
 */class Ut extends bs{constructor(){super("google.com"),this.addScope("profile")}static credential(e,n){return rn._fromParams({providerId:Ut.PROVIDER_ID,signInMethod:Ut.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:n})}static credentialFromResult(e){return Ut.credentialFromTaggedObject(e)}static credentialFromError(e){return Ut.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:n,oauthAccessToken:s}=e;if(!n&&!s)return null;try{return Ut.credential(n,s)}catch{return null}}}Ut.GOOGLE_SIGN_IN_METHOD="google.com";Ut.PROVIDER_ID="google.com";/**
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
 */class Ft extends bs{constructor(){super("github.com")}static credential(e){return rn._fromParams({providerId:Ft.PROVIDER_ID,signInMethod:Ft.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Ft.credentialFromTaggedObject(e)}static credentialFromError(e){return Ft.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Ft.credential(e.oauthAccessToken)}catch{return null}}}Ft.GITHUB_SIGN_IN_METHOD="github.com";Ft.PROVIDER_ID="github.com";/**
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
 */class Vt extends bs{constructor(){super("twitter.com")}static credential(e,n){return rn._fromParams({providerId:Vt.PROVIDER_ID,signInMethod:Vt.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:n})}static credentialFromResult(e){return Vt.credentialFromTaggedObject(e)}static credentialFromError(e){return Vt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:n,oauthTokenSecret:s}=e;if(!n||!s)return null;try{return Vt.credential(n,s)}catch{return null}}}Vt.TWITTER_SIGN_IN_METHOD="twitter.com";Vt.PROVIDER_ID="twitter.com";/**
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
 */class xn{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,n,s,r=!1){const i=await Be._fromIdTokenResponse(e,s,r),o=ia(s);return new xn({user:i,providerId:o,_tokenResponse:s,operationType:n})}static async _forOperation(e,n,s){await e._updateTokensIfNecessary(s,!0);const r=ia(s);return new xn({user:e,providerId:r,_tokenResponse:s,operationType:n})}}function ia(t){return t.providerId?t.providerId:"phoneNumber"in t?"phone":null}/**
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
 */class Ys extends Gt{constructor(e,n,s,r){super(n.code,n.message),this.operationType=s,this.user=r,Object.setPrototypeOf(this,Ys.prototype),this.customData={appName:e.name,tenantId:e.tenantId??void 0,_serverResponse:n.customData._serverResponse,operationType:s}}static _fromErrorAndOperation(e,n,s,r){return new Ys(e,n,s,r)}}function _c(t,e,n,s){return(e==="reauthenticate"?n._getReauthenticationResolver(t):n._getIdTokenResponse(t)).catch(i=>{throw i.code==="auth/multi-factor-auth-required"?Ys._fromErrorAndOperation(t,i,e,s):i})}async function Bg(t,e,n=!1){const s=await us(t,e._linkToIdToken(t.auth,await t.getIdToken()),n);return xn._forOperation(t,"link",s)}/**
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
 */async function Hg(t,e,n=!1){const{auth:s}=t;if(st(s.app))return Promise.reject(Wt(s));const r="reauthenticate";try{const i=await us(t,_c(s,r,e,t),n);B(i.idToken,s,"internal-error");const o=Di(i.idToken);B(o,s,"internal-error");const{sub:a}=o;return B(t.uid===a,s,"user-mismatch"),xn._forOperation(t,r,i)}catch(i){throw(i==null?void 0:i.code)==="auth/user-not-found"&&Ke(s,"user-mismatch"),i}}/**
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
 */async function yc(t,e,n=!1){if(st(t.app))return Promise.reject(Wt(t));const s="signIn",r=await _c(t,s,e),i=await xn._fromIdTokenResponse(t,s,r);return n||await t._updateCurrentUser(i.user),i}async function jg(t,e){return yc(Mn(t),e)}/**
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
 */async function Wg(t){const e=Mn(t);e._getPasswordPolicyInternal()&&await e._updatePasswordPolicy()}function Kg(t,e,n){return st(t.app)?Promise.reject(Wt(t)):jg(At(t),Un.credential(e,n)).catch(async s=>{throw s.code==="auth/password-does-not-meet-requirements"&&Wg(t),s})}function Gg(t,e,n,s){return At(t).onIdTokenChanged(e,n,s)}function zg(t,e,n){return At(t).beforeAuthStateChanged(e,n)}function qg(t,e,n,s){return At(t).onAuthStateChanged(e,n,s)}function Jg(t){return At(t).signOut()}const Xs="__sak";/**
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
 */class vc{constructor(e,n){this.storageRetriever=e,this.type=n}_isAvailable(){try{return this.storage?(this.storage.setItem(Xs,"1"),this.storage.removeItem(Xs),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,n){return this.storage.setItem(e,JSON.stringify(n)),Promise.resolve()}_get(e){const n=this.storage.getItem(e);return Promise.resolve(n?JSON.parse(n):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
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
 */const Yg=1e3,Xg=10;class bc extends vc{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,n)=>this.onStorageEvent(e,n),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=dc(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const n of Object.keys(this.listeners)){const s=this.storage.getItem(n),r=this.localCache[n];s!==r&&e(n,r,s)}}onStorageEvent(e,n=!1){if(!e.key){this.forAllChangedKeys((o,a,l)=>{this.notifyListeners(o,l)});return}const s=e.key;n?this.detachListener():this.stopPolling();const r=()=>{const o=this.storage.getItem(s);!n&&this.localCache[s]===o||this.notifyListeners(s,o)},i=this.storage.getItem(s);gg()&&i!==e.newValue&&e.newValue!==e.oldValue?setTimeout(r,Xg):r()}notifyListeners(e,n){this.localCache[e]=n;const s=this.listeners[e];if(s)for(const r of Array.from(s))r(n&&JSON.parse(n))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,n,s)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:n,newValue:s}),!0)})},Yg)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,n){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,n){await super._set(e,n),this.localCache[e]=JSON.stringify(n)}async _get(e){const n=await super._get(e);return this.localCache[e]=JSON.stringify(n),n}async _remove(e){await super._remove(e),delete this.localCache[e]}}bc.type="LOCAL";const Qg=bc;/**
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
 */class mr{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const n=this.receivers.find(r=>r.isListeningto(e));if(n)return n;const s=new mr(e);return this.receivers.push(s),s}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const n=e,{eventId:s,eventType:r,data:i}=n.data,o=this.handlersMap[r];if(!(o!=null&&o.size))return;n.ports[0].postMessage({status:"ack",eventId:s,eventType:r});const a=Array.from(o).map(async c=>c(n.origin,i)),l=await Zg(a);n.ports[0].postMessage({status:"done",eventId:s,eventType:r,response:l})}_subscribe(e,n){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(n)}_unsubscribe(e,n){this.handlersMap[e]&&n&&this.handlersMap[e].delete(n),(!n||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}mr.receivers=[];/**
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
 */function Ui(t="",e=10){let n="";for(let s=0;s<e;s++)n+=Math.floor(Math.random()*10);return t+n}/**
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
 */class em{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,n,s=50){const r=typeof MessageChannel<"u"?new MessageChannel:null;if(!r)throw new Error("connection_unavailable");let i,o;return new Promise((a,l)=>{const c=Ui("",20);r.port1.start();const u=setTimeout(()=>{l(new Error("unsupported_event"))},s);o={messageChannel:r,onMessage(f){const d=f;if(d.data.eventId===c)switch(d.data.status){case"ack":clearTimeout(u),i=setTimeout(()=>{l(new Error("timeout"))},3e3);break;case"done":clearTimeout(i),a(d.data.response);break;default:clearTimeout(u),clearTimeout(i),l(new Error("invalid_response"));break}}},this.handlers.add(o),r.port1.addEventListener("message",o.onMessage),this.target.postMessage({eventType:e,eventId:c,data:n},[r.port2])}).finally(()=>{o&&this.removeMessageHandler(o)})}}/**
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
 */function lt(){return window}function tm(t){lt().location.href=t}/**
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
 */function wc(){return typeof lt().WorkerGlobalScope<"u"&&typeof lt().importScripts=="function"}async function nm(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function sm(){var t;return((t=navigator==null?void 0:navigator.serviceWorker)==null?void 0:t.controller)||null}function rm(){return wc()?self:null}/**
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
 */const Sc="firebaseLocalStorageDb",im=1,Qs="firebaseLocalStorage",Cc="fbase_key";class Es{constructor(e){this.request=e}toPromise(){return new Promise((e,n)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{n(this.request.error)})})}}function _r(t,e){return t.transaction([Qs],e?"readwrite":"readonly").objectStore(Qs)}function om(){const t=indexedDB.deleteDatabase(Sc);return new Es(t).toPromise()}function li(){const t=indexedDB.open(Sc,im);return new Promise((e,n)=>{t.addEventListener("error",()=>{n(t.error)}),t.addEventListener("upgradeneeded",()=>{const s=t.result;try{s.createObjectStore(Qs,{keyPath:Cc})}catch(r){n(r)}}),t.addEventListener("success",async()=>{const s=t.result;s.objectStoreNames.contains(Qs)?e(s):(s.close(),await om(),e(await li()))})})}async function oa(t,e,n){const s=_r(t,!0).put({[Cc]:e,value:n});return new Es(s).toPromise()}async function am(t,e){const n=_r(t,!1).get(e),s=await new Es(n).toPromise();return s===void 0?null:s.value}function aa(t,e){const n=_r(t,!0).delete(e);return new Es(n).toPromise()}const lm=800,cm=3;class Tc{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await li(),this.db)}async _withRetries(e){let n=0;for(;;)try{const s=await this._openDb();return await e(s)}catch(s){if(n++>cm)throw s;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return wc()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=mr._getInstance(rm()),this.receiver._subscribe("keyChanged",async(e,n)=>({keyProcessed:(await this._poll()).includes(n.key)})),this.receiver._subscribe("ping",async(e,n)=>["keyChanged"])}async initializeSender(){var n,s;if(this.activeServiceWorker=await nm(),!this.activeServiceWorker)return;this.sender=new em(this.activeServiceWorker);const e=await this.sender._send("ping",{},800);e&&(n=e[0])!=null&&n.fulfilled&&(s=e[0])!=null&&s.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||sm()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;const e=await li();return await oa(e,Xs,"1"),await aa(e,Xs),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,n){return this._withPendingWrite(async()=>(await this._withRetries(s=>oa(s,e,n)),this.localCache[e]=n,this.notifyServiceWorker(e)))}async _get(e){const n=await this._withRetries(s=>am(s,e));return this.localCache[e]=n,n}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(n=>aa(n,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(r=>{const i=_r(r,!1).getAll();return new Es(i).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const n=[],s=new Set;if(e.length!==0)for(const{fbase_key:r,value:i}of e)s.add(r),JSON.stringify(this.localCache[r])!==JSON.stringify(i)&&(this.notifyListeners(r,i),n.push(r));for(const r of Object.keys(this.localCache))this.localCache[r]&&!s.has(r)&&(this.notifyListeners(r,null),n.push(r));return n}notifyListeners(e,n){this.localCache[e]=n;const s=this.listeners[e];if(s)for(const r of Array.from(s))r(n)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),lm)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,n){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}Tc.type="LOCAL";const um=Tc;new vs(3e4,6e4);/**
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
 */function dm(t,e){return e?bt(e):(B(t._popupRedirectResolver,t,"argument-error"),t._popupRedirectResolver)}/**
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
 */class Fi extends Li{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return Tn(e,this._buildIdpRequest())}_linkToIdToken(e,n){return Tn(e,this._buildIdpRequest(n))}_getReauthenticationResolver(e){return Tn(e,this._buildIdpRequest())}_buildIdpRequest(e){const n={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(n.idToken=e),n}}function fm(t){return yc(t.auth,new Fi(t),t.bypassAuthState)}function hm(t){const{auth:e,user:n}=t;return B(n,e,"internal-error"),Hg(n,new Fi(t),t.bypassAuthState)}async function pm(t){const{auth:e,user:n}=t;return B(n,e,"internal-error"),Bg(n,new Fi(t),t.bypassAuthState)}/**
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
 */class Ac{constructor(e,n,s,r,i=!1){this.auth=e,this.resolver=s,this.user=r,this.bypassAuthState=i,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(n)?n:[n]}execute(){return new Promise(async(e,n)=>{this.pendingPromise={resolve:e,reject:n};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(s){this.reject(s)}})}async onAuthEvent(e){const{urlResponse:n,sessionId:s,postBody:r,tenantId:i,error:o,type:a}=e;if(o){this.reject(o);return}const l={auth:this.auth,requestUri:n,sessionId:s,tenantId:i||void 0,postBody:r||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(a)(l))}catch(c){this.reject(c)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return fm;case"linkViaPopup":case"linkViaRedirect":return pm;case"reauthViaPopup":case"reauthViaRedirect":return hm;default:Ke(this.auth,"internal-error")}}resolve(e){Ct(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){Ct(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
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
 */const gm=new vs(2e3,1e4);class mn extends Ac{constructor(e,n,s,r,i){super(e,n,r,i),this.provider=s,this.authWindow=null,this.pollId=null,mn.currentPopupAction&&mn.currentPopupAction.cancel(),mn.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return B(e,this.auth,"internal-error"),e}async onExecution(){Ct(this.filter.length===1,"Popup operations only handle one event");const e=Ui();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(n=>{this.reject(n)}),this.resolver._isIframeWebStorageSupported(this.auth,n=>{n||this.reject(at(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)==null?void 0:e.associatedEvent)||null}cancel(){this.reject(at(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,mn.currentPopupAction=null}pollUserCancellation(){const e=()=>{var n,s;if((s=(n=this.authWindow)==null?void 0:n.window)!=null&&s.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(at(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,gm.get())};e()}}mn.currentPopupAction=null;/**
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
 */const mm="pendingRedirect",xs=new Map;class _m extends Ac{constructor(e,n,s=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],n,void 0,s),this.eventId=null}async execute(){let e=xs.get(this.auth._key());if(!e){try{const s=await ym(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(s)}catch(n){e=()=>Promise.reject(n)}xs.set(this.auth._key(),e)}return this.bypassAuthState||xs.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const n=await this.auth._redirectUserForId(e.eventId);if(n)return this.user=n,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function ym(t,e){const n=Em(e),s=bm(t);if(!await s._isAvailable())return!1;const r=await s._get(n)==="true";return await s._remove(n),r}function vm(t,e){xs.set(t._key(),e)}function bm(t){return bt(t._redirectPersistence)}function Em(t){return Ds(mm,t.config.apiKey,t.name)}async function Im(t,e,n=!1){if(st(t.app))return Promise.reject(Wt(t));const s=Mn(t),r=dm(s,e),o=await new _m(s,r,n).execute();return o&&!n&&(delete o.user._redirectEventId,await s._persistUserIfCurrent(o.user),await s._setRedirectUser(null,e)),o}/**
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
 */const wm=600*1e3;class Sm{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let n=!1;return this.consumers.forEach(s=>{this.isEventForConsumer(e,s)&&(n=!0,this.sendToConsumer(e,s),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!Cm(e)||(this.hasHandledPotentialRedirect=!0,n||(this.queuedRedirectEvent=e,n=!0)),n}sendToConsumer(e,n){var s;if(e.error&&!Rc(e)){const r=((s=e.error.code)==null?void 0:s.split("auth/")[1])||"internal-error";n.onError(at(this.auth,r))}else n.onAuthEvent(e)}isEventForConsumer(e,n){const s=n.eventId===null||!!e.eventId&&e.eventId===n.eventId;return n.filter.includes(e.type)&&s}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=wm&&this.cachedEventUids.clear(),this.cachedEventUids.has(la(e))}saveEventToCache(e){this.cachedEventUids.add(la(e)),this.lastProcessedEventTime=Date.now()}}function la(t){return[t.type,t.eventId,t.sessionId,t.tenantId].filter(e=>e).join("-")}function Rc({type:t,error:e}){return t==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function Cm(t){switch(t.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return Rc(t);default:return!1}}/**
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
 */async function Tm(t,e={}){return zt(t,"GET","/v1/projects",e)}/**
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
 */const Am=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,Rm=/^https?/;async function Pm(t){if(t.config.emulator)return;const{authorizedDomains:e}=await Tm(t);for(const n of e)try{if(Om(n))return}catch{}Ke(t,"unauthorized-domain")}function Om(t){const e=oi(),{protocol:n,hostname:s}=new URL(e);if(t.startsWith("chrome-extension://")){const o=new URL(t);return o.hostname===""&&s===""?n==="chrome-extension:"&&t.replace("chrome-extension://","")===e.replace("chrome-extension://",""):n==="chrome-extension:"&&o.hostname===s}if(!Rm.test(n))return!1;if(Am.test(t))return s===t;const r=t.replace(/\./g,"\\.");return new RegExp("^(.+\\."+r+"|"+r+")$","i").test(s)}/**
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
 */const km=new vs(3e4,6e4);function ca(){const t=lt().___jsl;if(t!=null&&t.H){for(const e of Object.keys(t.H))if(t.H[e].r=t.H[e].r||[],t.H[e].L=t.H[e].L||[],t.H[e].r=[...t.H[e].L],t.CP)for(let n=0;n<t.CP.length;n++)t.CP[n]=null}}function Nm(t){return new Promise((e,n)=>{var r,i,o;function s(){ca(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{ca(),n(at(t,"network-request-failed"))},timeout:km.get()})}if((i=(r=lt().gapi)==null?void 0:r.iframes)!=null&&i.Iframe)e(gapi.iframes.getContext());else if((o=lt().gapi)!=null&&o.load)s();else{const a=Sg("iframefcb");return lt()[a]=()=>{gapi.load?s():n(at(t,"network-request-failed"))},hc(`${wg()}?onload=${a}`).catch(l=>n(l))}}).catch(e=>{throw Ls=null,e})}let Ls=null;function Dm(t){return Ls=Ls||Nm(t),Ls}/**
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
 */const xm=new vs(5e3,15e3),Lm="__/auth/iframe",Mm="emulator/auth/iframe",Um={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},Fm=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function Vm(t){const e=t.config;B(e.authDomain,t,"auth-domain-config-required");const n=e.emulator?Ni(e,Mm):`https://${t.config.authDomain}/${Lm}`,s={apiKey:e.apiKey,appName:t.name,v:ys},r=Fm.get(t.config.apiHost);r&&(s.eid=r);const i=t._getFrameworks();return i.length&&(s.fw=i.join(",")),`${n}?${_s(s).slice(1)}`}async function $m(t){const e=await Dm(t),n=lt().gapi;return B(n,t,"internal-error"),e.open({where:document.body,url:Vm(t),messageHandlersFilter:n.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:Um,dontclear:!0},s=>new Promise(async(r,i)=>{await s.restyle({setHideOnLeave:!1});const o=at(t,"network-request-failed"),a=lt().setTimeout(()=>{i(o)},xm.get());function l(){lt().clearTimeout(a),r(s)}s.ping(l).then(l,()=>{i(o)})}))}/**
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
 */const Bm={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},Hm=500,jm=600,Wm="_blank",Km="http://localhost";class ua{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function Gm(t,e,n,s=Hm,r=jm){const i=Math.max((window.screen.availHeight-r)/2,0).toString(),o=Math.max((window.screen.availWidth-s)/2,0).toString();let a="";const l={...Bm,width:s.toString(),height:r.toString(),top:i,left:o},c=Ae().toLowerCase();n&&(a=oc(c)?Wm:n),rc(c)&&(e=e||Km,l.scrollbars="yes");const u=Object.entries(l).reduce((d,[m,v])=>`${d}${m}=${v},`,"");if(pg(c)&&a!=="_self")return zm(e||"",a),new ua(null);const f=window.open(e||"",a,u);B(f,t,"popup-blocked");try{f.focus()}catch{}return new ua(f)}function zm(t,e){const n=document.createElement("a");n.href=t,n.target=e;const s=document.createEvent("MouseEvent");s.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),n.dispatchEvent(s)}/**
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
 */const qm="__/auth/handler",Jm="emulator/auth/handler",Ym=encodeURIComponent("fac");async function da(t,e,n,s,r,i){B(t.config.authDomain,t,"auth-domain-config-required"),B(t.config.apiKey,t,"invalid-api-key");const o={apiKey:t.config.apiKey,appName:t.name,authType:n,redirectUrl:s,v:ys,eventId:r};if(e instanceof mc){e.setDefaultLanguage(t.languageCode),o.providerId=e.providerId||"",Lh(e.getCustomParameters())||(o.customParameters=JSON.stringify(e.getCustomParameters()));for(const[u,f]of Object.entries({}))o[u]=f}if(e instanceof bs){const u=e.getScopes().filter(f=>f!=="");u.length>0&&(o.scopes=u.join(","))}t.tenantId&&(o.tid=t.tenantId);const a=o;for(const u of Object.keys(a))a[u]===void 0&&delete a[u];const l=await t._getAppCheckToken(),c=l?`#${Ym}=${encodeURIComponent(l)}`:"";return`${Xm(t)}?${_s(a).slice(1)}${c}`}function Xm({config:t}){return t.emulator?Ni(t,Jm):`https://${t.authDomain}/${qm}`}/**
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
 */const Fr="webStorageSupport";class Qm{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=Ic,this._completeRedirectFn=Im,this._overrideRedirectResult=vm}async _openPopup(e,n,s,r){var o;Ct((o=this.eventManagers[e._key()])==null?void 0:o.manager,"_initialize() not called before _openPopup()");const i=await da(e,n,s,oi(),r);return Gm(e,i,Ui())}async _openRedirect(e,n,s,r){await this._originValidation(e);const i=await da(e,n,s,oi(),r);return tm(i),new Promise(()=>{})}_initialize(e){const n=e._key();if(this.eventManagers[n]){const{manager:r,promise:i}=this.eventManagers[n];return r?Promise.resolve(r):(Ct(i,"If manager is not set, promise should be"),i)}const s=this.initAndGetManager(e);return this.eventManagers[n]={promise:s},s.catch(()=>{delete this.eventManagers[n]}),s}async initAndGetManager(e){const n=await $m(e),s=new Sm(e);return n.register("authEvent",r=>(B(r==null?void 0:r.authEvent,e,"invalid-auth-event"),{status:s.onEvent(r.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:s},this.iframes[e._key()]=n,s}_isIframeWebStorageSupported(e,n){this.iframes[e._key()].send(Fr,{type:Fr},r=>{var o;const i=(o=r==null?void 0:r[0])==null?void 0:o[Fr];i!==void 0&&n(!!i),Ke(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const n=e._key();return this.originValidationPromises[n]||(this.originValidationPromises[n]=Pm(e)),this.originValidationPromises[n]}get _shouldInitProactively(){return dc()||ic()||xi()}}const Zm=Qm;var fa="@firebase/auth",ha="1.12.1";/**
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
 */class e_{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)==null?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const n=this.auth.onIdTokenChanged(s=>{e((s==null?void 0:s.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,n),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const n=this.internalListeners.get(e);n&&(this.internalListeners.delete(e),n(),this.updateProactiveRefresh())}assertAuthConfigured(){B(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
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
 */function t_(t){switch(t){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function n_(t){ls(new Dn("auth",(e,{options:n})=>{const s=e.getProvider("app").getImmediate(),r=e.getProvider("heartbeat"),i=e.getProvider("app-check-internal"),{apiKey:o,authDomain:a}=s.options;B(o&&!o.includes(":"),"invalid-api-key",{appName:s.name});const l={apiKey:o,authDomain:a,clientPlatform:t,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:fc(t)},c=new bg(s,r,i,l);return Og(c,n),c},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,n,s)=>{e.getProvider("auth-internal").initialize()})),ls(new Dn("auth-internal",e=>{const n=Mn(e.getProvider("auth").getImmediate());return(s=>new e_(s))(n)},"PRIVATE").setInstantiationMode("EXPLICIT")),wn(fa,ha,t_(t)),wn(fa,ha,"esm2020")}/**
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
 */const s_=300,r_=Hl("authIdTokenMaxAge")||s_;let pa=null;const i_=t=>async e=>{const n=e&&await e.getIdTokenResult(),s=n&&(new Date().getTime()-Date.parse(n.issuedAtTime))/1e3;if(s&&s>r_)return;const r=n==null?void 0:n.token;pa!==r&&(pa=r,await fetch(t,{method:r?"POST":"DELETE",headers:r?{Authorization:`Bearer ${r}`}:{}}))};function o_(t=Up()){const e=Gl(t,"auth");if(e.isInitialized())return e.getImmediate();const n=Pg(t,{popupRedirectResolver:Zm,persistence:[um,Qg,Ic]}),s=Hl("authTokenSyncURL");if(s&&typeof isSecureContext=="boolean"&&isSecureContext){const i=new URL(s,location.origin);if(location.origin===i.origin){const o=i_(i.toString());zg(n,o,()=>o(n.currentUser)),Gg(n,a=>o(a))}}const r=vh("auth");return r&&kg(n,`http://${r}`),n}function a_(){var t;return((t=document.getElementsByTagName("head"))==null?void 0:t[0])??document}Eg({loadJS(t){return new Promise((e,n)=>{const s=document.createElement("script");s.setAttribute("src",t),s.onload=e,s.onerror=r=>{const i=at("internal-error");i.customData=r,n(i)},s.type="text/javascript",s.charset="UTF-8",a_().appendChild(s)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});n_("Browser");var l_="firebase",c_="12.10.0";/**
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
 */wn(l_,c_,"app");const u_={apiKey:"AIzaSyBO9XFUh2gp-0_lN7qOkmAIeg9YBg5zE28",authDomain:"tobbythebutler.firebaseapp.com",projectId:"tobbythebutler",appId:"1:1017368311430:web:64ad0ff74b38b63f494307"},d_=zl(u_),on=o_(d_),f_="/api".replace(/\/$/,""),$e=(t={})=>{const e=new URLSearchParams;Object.entries(t).forEach(([s,r])=>{r==null||r===""||e.set(s,String(r))});const n=e.toString();return n?`?${n}`:""},h_=async()=>{const t=on.currentUser;if(!t)throw new Error("Not authenticated");return t.getIdToken(!0)},de=async(t,e={})=>{const n=await h_(),s=await fetch(`${f_}${t}`,{method:e.method||"GET",headers:{"Content-Type":"application/json",Authorization:`Bearer ${n}`,...e.headers||{}},body:e.body?JSON.stringify(e.body):void 0}),r=await s.json().catch(()=>({}));if(!s.ok)throw new Error((r==null?void 0:r.message)||`Request failed (${s.status})`);return r},p_=async(t,e)=>(await Kg(on,t,e),ci()),g_=async()=>{await Jg(on)},ci=async()=>{var s,r;const t=on.currentUser;if(!t)return!1;const e=await t.getIdTokenResult(!0);if(((s=e==null?void 0:e.claims)==null?void 0:s.admin)!==!0)return!1;const n=await de("/auth/me");return String(((r=n==null?void 0:n.user)==null?void 0:r.role)||"").toLowerCase()==="admin"},pe={getOverview:t=>de(`/admin/overview${$e(t)}`),getAdSlotStats:t=>de(`/admin/ad-slot/stats${$e(t)}`),listUsers:t=>de(`/admin/users${$e(t)}`),getUser:t=>de(`/admin/users/${encodeURIComponent(String(t))}`),freezeUser:(t,e)=>de(`/admin/users/${encodeURIComponent(String(t))}/freeze`,{method:"POST",body:e}),unfreezeUser:(t,e)=>de(`/admin/users/${encodeURIComponent(String(t))}/unfreeze`,{method:"POST",body:e}),getBillingSummary:t=>de(`/admin/billing/summary${$e(t)}`),listCreditAccounts:t=>de(`/admin/credits/accounts${$e(t)}`),listCreditOrders:t=>de(`/admin/credits/orders${$e(t)}`),listCreditLedger:t=>de(`/admin/credits/ledger${$e(t)}`),adjustCredits:t=>de("/admin/credits/adjust",{method:"POST",body:t}),listEvents:t=>de(`/admin/logs/events${$e(t)}`),listErrors:t=>de(`/admin/logs/errors${$e(t)}`),listDataCollections:()=>de("/admin/data/collections"),listDataRecords:t=>de(`/admin/data/records${$e(t)}`),listDataChanges:t=>de(`/admin/data/changes${$e(t)}`),updateDataRecord:t=>de("/admin/data/update",{method:"POST",body:t}),deleteDataRecord:t=>de("/admin/data/delete",{method:"POST",body:t}),rollbackDataChange:t=>de("/admin/data/rollback",{method:"POST",body:t})},m_={class:"login-page"},__={style:{display:"grid",gap:"10px"}},y_={key:0,style:{color:"#b91c1c"}},v_={__name:"LoginPage",setup(t){const e=Ml(),n=re(""),s=ut({email:"",password:""}),r=async()=>{n.value="";try{if(!await p_(s.email,s.password)){n.value="Login succeeded, but this account is not admin (missing admin claim).";return}e.push("/overview")}catch(i){n.value=(i==null?void 0:i.message)||"Firebase login failed."}};return(i,o)=>($(),H("div",m_,[h("form",{class:"login-card",onSubmit:Il(r,["prevent"])},[o[3]||(o[3]=h("h2",{style:{"margin-top":"0"}},"Admin Console Login",-1)),o[4]||(o[4]=h("p",{style:{color:"var(--muted)"}},"Use Firebase email/password account with admin claim.",-1)),h("div",__,[_e(h("input",{"onUpdate:modelValue":o[0]||(o[0]=a=>s.email=a),type:"email",placeholder:"Admin Email",required:""},null,512),[[xe,s.email]]),_e(h("input",{"onUpdate:modelValue":o[1]||(o[1]=a=>s.password=a),type:"password",placeholder:"Password",required:""},null,512),[[xe,s.password]]),o[2]||(o[2]=h("button",{class:"primary",type:"submit"},"Enter",-1))]),n.value?($(),H("p",y_,P(n.value),1)):Pn("",!0)],32)]))}},b_={class:"admin-app"},E_={class:"admin-sidebar"},I_={class:"main-wrap"},w_={class:"content"},S_={__name:"AdminShell",setup(t){const e=Ml(),n=async()=>{await g_(),e.push("/login")};return(s,r)=>{const i=Wr("router-link"),o=Wr("router-view");return $(),H("div",b_,[h("aside",E_,[r[5]||(r[5]=h("div",{class:"brand"},"Handout Admin",-1)),le(i,{class:"nav-link",to:"/overview","active-class":"active"},{default:pn(()=>[...r[0]||(r[0]=[nt("Overview",-1)])]),_:1}),le(i,{class:"nav-link",to:"/users","active-class":"active"},{default:pn(()=>[...r[1]||(r[1]=[nt("Users & Roles",-1)])]),_:1}),le(i,{class:"nav-link",to:"/billing","active-class":"active"},{default:pn(()=>[...r[2]||(r[2]=[nt("Billing & Credits",-1)])]),_:1}),le(i,{class:"nav-link",to:"/logs","active-class":"active"},{default:pn(()=>[...r[3]||(r[3]=[nt("Ops Logs",-1)])]),_:1}),le(i,{class:"nav-link",to:"/data-management","active-class":"active"},{default:pn(()=>[...r[4]||(r[4]=[nt("Data Management",-1)])]),_:1})]),h("div",I_,[h("header",{class:"topbar"},[r[6]||(r[6]=h("strong",null,"Admin Supervision MVP",-1)),h("button",{onClick:n},"Logout")]),h("main",w_,[le(o)])])])}}},C_={class:"range-bar panel"},T_=["value"],A_=["value"],yr={__name:"DateRangeBar",props:{modelValue:String,from:String,to:String},emits:["update:modelValue","update:from","update:to"],setup(t){return(e,n)=>($(),H("div",C_,[h("button",{class:rt({primary:t.modelValue==="today"}),onClick:n[0]||(n[0]=s=>e.$emit("update:modelValue","today"))},"Today",2),h("button",{class:rt({primary:t.modelValue==="7d"}),onClick:n[1]||(n[1]=s=>e.$emit("update:modelValue","7d"))},"7d",2),h("button",{class:rt({primary:t.modelValue==="30d"}),onClick:n[2]||(n[2]=s=>e.$emit("update:modelValue","30d"))},"30d",2),h("button",{class:rt({primary:t.modelValue==="custom"}),onClick:n[3]||(n[3]=s=>e.$emit("update:modelValue","custom"))},"Custom",2),t.modelValue==="custom"?($(),H(ae,{key:0},[h("input",{type:"date",value:t.from,onInput:n[4]||(n[4]=s=>e.$emit("update:from",s.target.value))},null,40,T_),h("input",{type:"date",value:t.to,onInput:n[5]||(n[5]=s=>e.$emit("update:to",s.target.value))},null,40,A_)],64)):Pn("",!0)]))}},R_={class:"kpi-grid"},P_={class:"kpi-title"},O_={class:"kpi-value"},k_={class:"row"},N_={class:"col panel"},D_={class:"col panel"},x_={class:"kpi-grid"},L_={class:"kpi-title"},M_={class:"kpi-value"},U_={class:"row"},F_={class:"col panel"},V_={key:0},$_={class:"col panel"},B_={key:0},H_={__name:"OverviewPage",setup(t){const e=re("7d"),n=re(""),s=re(""),r=re({}),i=re({}),o=f=>f.toISOString().slice(0,10),a=()=>{const f=new Date;if(e.value==="today")return{from:o(f),to:o(f)};if(e.value==="7d"){const d=new Date(f);return d.setDate(d.getDate()-6),{from:o(d),to:o(f)}}if(e.value==="30d"){const d=new Date(f);return d.setDate(d.getDate()-29),{from:o(d),to:o(f)}}return{from:n.value,to:s.value}},l=async()=>{const f=a(),[d,m]=await Promise.all([pe.getOverview(f),pe.getAdSlotStats(f)]);r.value=d||{},i.value=m||{}},c=Te(()=>{var f,d,m,v;return[{label:"DAU",value:((f=r.value.kpis)==null?void 0:f.dau)||0},{label:"WAU",value:((d=r.value.kpis)==null?void 0:d.wau)||0},{label:"7d retention",value:`${((m=r.value.kpis)==null?void 0:m.retention_7d)||0}%`},{label:"Cost estimate",value:`$${((v=r.value.cost_overview)==null?void 0:v.cost_estimate_usd)||0}`}]}),u=Te(()=>{var f,d,m,v;return[{label:"Ad Served",value:((f=i.value.summary)==null?void 0:f.served)||0},{label:"Ad Impressions",value:((d=i.value.summary)==null?void 0:d.impressions)||0},{label:"Ad Clicks",value:((m=i.value.summary)==null?void 0:m.clicks)||0},{label:"Ad CTR",value:`${((v=i.value.summary)==null?void 0:v.ctr)||0}%`}]});return Bt([e,n,s],l),Ln(l),(f,d)=>{var m,v,y,b;return $(),H("section",null,[le(yr,{modelValue:e.value,"onUpdate:modelValue":d[0]||(d[0]=E=>e.value=E),from:n.value,"onUpdate:from":d[1]||(d[1]=E=>n.value=E),to:s.value,"onUpdate:to":d[2]||(d[2]=E=>s.value=E)},null,8,["modelValue","from","to"]),h("div",R_,[($(!0),H(ae,null,be(c.value,E=>($(),H("div",{class:"panel",key:E.label},[h("div",P_,P(E.label),1),h("div",O_,P(E.value),1)]))),128))]),h("div",k_,[h("div",N_,[d[3]||(d[3]=h("h3",null,"Behavior Funnel",-1)),h("ul",null,[($(!0),H(ae,null,be(r.value.funnel||{},(E,C)=>($(),H("li",{key:C},P(C)+": "+P(E),1))),128))])]),h("div",D_,[d[4]||(d[4]=h("h3",null,"System Health",-1)),h("ul",null,[h("li",null,"API success: "+P(((m=r.value.system_health)==null?void 0:m.api_success_rate)||0)+"%",1),h("li",null,"P95 latency: "+P(((v=r.value.system_health)==null?void 0:v.p95_ms)||0)+"ms",1),h("li",null,"Frontend errors: "+P(((y=r.value.system_health)==null?void 0:y.frontend_errors)||0),1),h("li",null,"Function failures: "+P(((b=r.value.system_health)==null?void 0:b.function_failures)||0),1)])])]),h("div",x_,[($(!0),H(ae,null,be(u.value,E=>($(),H("div",{class:"panel",key:E.label},[h("div",L_,P(E.label),1),h("div",M_,P(E.value),1)]))),128))]),h("div",U_,[h("div",F_,[d[5]||(d[5]=h("h3",null,"Ad Slot By Slot",-1)),h("ul",null,[($(!0),H(ae,null,be(i.value.by_slot||[],E=>($(),H("li",{key:E.slot_id},P(E.slot_id)+": served "+P(E.served)+", impressions "+P(E.impressions)+", clicks "+P(E.clicks)+", ctr "+P(E.ctr)+"% ",1))),128)),(i.value.by_slot||[]).length?Pn("",!0):($(),H("li",V_,"No slot data in selected range."))])]),h("div",$_,[d[6]||(d[6]=h("h3",null,"Ad Slot By Service Type",-1)),h("ul",null,[($(!0),H(ae,null,be(i.value.by_service_type||[],E=>($(),H("li",{key:E.service_type},P(E.service_type)+": served "+P(E.served)+", impressions "+P(E.impressions)+", clicks "+P(E.clicks)+", ctr "+P(E.ctr)+"% ",1))),128)),(i.value.by_service_type||[]).length?Pn("",!0):($(),H("li",B_,"No service type data in selected range."))])])])])}}},j_={class:"filter-row panel"},W_={class:"panel table-wrap"},K_=["onClick"],G_=["onClick"],z_=["onClick"],q_={key:0,class:"drawer"},J_={__name:"UsersPage",setup(t){const e=re("7d"),n=re(""),s=re(""),r=re([]),i=re(null),o=ut({role:"",status:"",paid:""}),a=m=>m.toISOString().slice(0,10),l=()=>{const m=new Date;if(e.value==="today")return{from:a(m),to:a(m)};if(e.value==="7d"){const v=new Date(m);return v.setDate(v.getDate()-6),{from:a(v),to:a(m)}}if(e.value==="30d"){const v=new Date(m);return v.setDate(v.getDate()-29),{from:a(v),to:a(m)}}return{from:n.value,to:s.value}},c=async()=>{const m=await pe.listUsers({...l(),...o,page:1,page_size:100});r.value=m.items||[]},u=async m=>{i.value=await pe.getUser(m)},f=async m=>{await pe.freezeUser(m,{reason:"manual_freeze"}),await c()},d=async m=>{await pe.unfreezeUser(m,{reason:"manual_unfreeze"}),await c()};return Bt([e,n,s],c),Ln(c),(m,v)=>($(),H("section",null,[le(yr,{modelValue:e.value,"onUpdate:modelValue":v[0]||(v[0]=y=>e.value=y),from:n.value,"onUpdate:from":v[1]||(v[1]=y=>n.value=y),to:s.value,"onUpdate:to":v[2]||(v[2]=y=>s.value=y)},null,8,["modelValue","from","to"]),h("div",j_,[_e(h("select",{"onUpdate:modelValue":v[3]||(v[3]=y=>o.role=y)},[...v[7]||(v[7]=[pd('<option value="">All roles</option><option value="admin">admin</option><option value="pm_po">pm_po</option><option value="tt">tt</option><option value="sp">sp</option>',5)])],512),[[ks,o.role]]),_e(h("select",{"onUpdate:modelValue":v[4]||(v[4]=y=>o.status=y)},[...v[8]||(v[8]=[h("option",{value:""},"All status",-1),h("option",{value:"active"},"active",-1),h("option",{value:"frozen"},"frozen",-1)])],512),[[ks,o.status]]),_e(h("select",{"onUpdate:modelValue":v[5]||(v[5]=y=>o.paid=y)},[...v[9]||(v[9]=[h("option",{value:""},"All paid",-1),h("option",{value:"true"},"paid",-1),h("option",{value:"false"},"free",-1)])],512),[[ks,o.paid]]),h("button",{class:"primary",onClick:c},"Refresh")]),h("div",W_,[h("table",null,[v[10]||(v[10]=h("thead",null,[h("tr",null,[h("th",null,"user_id"),h("th",null,"email"),h("th",null,"account_type"),h("th",null,"status"),h("th",null,"last_active_at"),h("th",null,"created_at"),h("th",null,"actions")])],-1)),h("tbody",null,[($(!0),H(ae,null,be(r.value,y=>($(),H("tr",{key:y.user_id},[h("td",null,[h("a",{href:"#",onClick:Il(b=>u(y.user_id),["prevent"])},P(y.user_id),9,K_)]),h("td",null,P(y.email),1),h("td",null,P(y.account_type),1),h("td",null,P(y.status),1),h("td",null,P(y.last_active_at),1),h("td",null,P(y.created_at),1),h("td",null,[y.status!=="frozen"?($(),H("button",{key:0,class:"danger",onClick:b=>f(y.user_id)},"Freeze",8,G_)):($(),H("button",{key:1,class:"success",onClick:b=>d(y.user_id)},"Unfreeze",8,z_))])]))),128))])])]),i.value?($(),H("aside",q_,[v[15]||(v[15]=h("h3",null,"User Detail",-1)),h("p",null,[v[11]||(v[11]=h("strong",null,"ID:",-1)),nt(" "+P(i.value.user_id),1)]),h("p",null,[v[12]||(v[12]=h("strong",null,"Email:",-1)),nt(" "+P(i.value.email_masked),1)]),h("p",null,[v[13]||(v[13]=h("strong",null,"Status:",-1)),nt(" "+P(i.value.status),1)]),h("p",null,[v[14]||(v[14]=h("strong",null,"Linked assets:",-1)),nt(" "+P(i.value.linked_assets),1)]),v[16]||(v[16]=h("h4",null,"Recent Timeline",-1)),h("ul",null,[($(!0),H(ae,null,be(i.value.recent_timeline||[],y=>($(),H("li",{key:y.id},P(y.created_at)+" - "+P(y.event_type),1))),128))]),h("button",{onClick:v[6]||(v[6]=y=>i.value=null)},"Close")])):Pn("",!0)]))}},Y_={class:"kpi-grid"},X_={class:"kpi-title"},Q_={class:"kpi-value"},Z_={class:"panel",style:{"margin-top":"12px"}},ey={class:"filter-row"},ty={class:"panel table-wrap",style:{"margin-top":"12px"}},ny={class:"row"},sy={class:"col panel table-wrap"},ry={class:"col panel table-wrap"},iy={__name:"BillingPage",setup(t){const e=re("30d"),n=re(""),s=re(""),r=re({}),i=re([]),o=re([]),a=re([]),l=ut({sp_id:"",delta:0,reason:""}),c=v=>v.toISOString().slice(0,10),u=()=>{const v=new Date;if(e.value==="today")return{from:c(v),to:c(v)};if(e.value==="7d"){const y=new Date(v);return y.setDate(y.getDate()-6),{from:c(y),to:c(v)}}if(e.value==="30d"){const y=new Date(v);return y.setDate(y.getDate()-29),{from:c(y),to:c(v)}}return{from:n.value,to:s.value}},f=async()=>{const v=u();r.value=await pe.getBillingSummary(v),i.value=(await pe.listCreditAccounts({page:1,page_size:200})).items||[],o.value=(await pe.listCreditOrders(v)).items||[],a.value=(await pe.listCreditLedger(v)).items||[]},d=async()=>{await pe.adjustCredits({sp_id:l.sp_id,delta:Number(l.delta||0),reason:l.reason,confirm_token:"CONFIRM"}),await f()},m=Te(()=>{var v,y,b,E;return[{label:"MRR (estimate)",value:`$${((v=r.value.plan_overview)==null?void 0:v.mrr_estimate_usd)||0}`},{label:"Conversion rate",value:`${((y=r.value.plan_overview)==null?void 0:y.conversion_rate)||0}%`},{label:"Total purchased",value:((b=r.value.sp_credit_overview)==null?void 0:b.total_purchased)||0},{label:"Total balance",value:((E=r.value.sp_credit_overview)==null?void 0:E.total_balance)||0}]});return Bt([e,n,s],f),Ln(f),(v,y)=>($(),H("section",null,[le(yr,{modelValue:e.value,"onUpdate:modelValue":y[0]||(y[0]=b=>e.value=b),from:n.value,"onUpdate:from":y[1]||(y[1]=b=>n.value=b),to:s.value,"onUpdate:to":y[2]||(y[2]=b=>s.value=b)},null,8,["modelValue","from","to"]),h("div",Y_,[($(!0),H(ae,null,be(m.value,b=>($(),H("div",{class:"panel",key:b.label},[h("div",X_,P(b.label),1),h("div",Q_,P(b.value),1)]))),128))]),h("div",Z_,[y[6]||(y[6]=h("h3",null,"Credit Reconciliation Tool",-1)),h("div",ey,[_e(h("input",{"onUpdate:modelValue":y[3]||(y[3]=b=>l.sp_id=b),placeholder:"sp_id"},null,512),[[xe,l.sp_id]]),_e(h("input",{"onUpdate:modelValue":y[4]||(y[4]=b=>l.delta=b),type:"number",placeholder:"delta"},null,512),[[xe,l.delta,void 0,{number:!0}]]),_e(h("input",{"onUpdate:modelValue":y[5]||(y[5]=b=>l.reason=b),placeholder:"reason"},null,512),[[xe,l.reason]]),h("button",{class:"danger",onClick:d},"Adjust (CONFIRM)")])]),h("div",ty,[y[8]||(y[8]=h("h3",null,"Credit Accounts",-1)),h("table",null,[y[7]||(y[7]=h("thead",null,[h("tr",null,[h("th",null,"sp_id"),h("th",null,"balance"),h("th",null,"lifetime_purchased"),h("th",null,"lifetime_used"),h("th",null,"updated_at")])],-1)),h("tbody",null,[($(!0),H(ae,null,be(i.value,b=>($(),H("tr",{key:b.sp_id},[h("td",null,P(b.sp_id),1),h("td",null,P(b.balance),1),h("td",null,P(b.lifetime_purchased),1),h("td",null,P(b.lifetime_used),1),h("td",null,P(b.updated_at),1)]))),128))])])]),h("div",ny,[h("div",sy,[y[10]||(y[10]=h("h3",null,"Orders",-1)),h("table",null,[y[9]||(y[9]=h("thead",null,[h("tr",null,[h("th",null,"order_id"),h("th",null,"sp_id"),h("th",null,"credits"),h("th",null,"amount"),h("th",null,"status"),h("th",null,"provider"),h("th",null,"created_at")])],-1)),h("tbody",null,[($(!0),H(ae,null,be(o.value,b=>($(),H("tr",{key:b.id},[h("td",null,P(b.id),1),h("td",null,P(b.sp_id),1),h("td",null,P(b.credits),1),h("td",null,P(b.amount),1),h("td",null,P(b.status),1),h("td",null,P(b.provider),1),h("td",null,P(b.created_at),1)]))),128))])])]),h("div",ry,[y[12]||(y[12]=h("h3",null,"Ledger",-1)),h("table",null,[y[11]||(y[11]=h("thead",null,[h("tr",null,[h("th",null,"entry_id"),h("th",null,"sp_id"),h("th",null,"entry_type"),h("th",null,"delta"),h("th",null,"balance_after"),h("th",null,"source_type"),h("th",null,"source_id")])],-1)),h("tbody",null,[($(!0),H(ae,null,be(a.value,b=>($(),H("tr",{key:b.id},[h("td",null,P(b.id),1),h("td",null,P(b.sp_id),1),h("td",null,P(b.entry_type),1),h("td",null,P(b.delta),1),h("td",null,P(b.balance_after),1),h("td",null,P(b.source_type),1),h("td",null,P(b.source_id),1)]))),128))])])])])]))}},oy={class:"filter-row panel"},ay={class:"row"},ly={class:"col panel"},cy={class:"col panel"},uy={class:"col panel"},dy={class:"panel table-wrap",style:{"margin-top":"12px"}},fy={class:"panel table-wrap",style:{"margin-top":"12px"}},hy={__name:"LogsPage",setup(t){const e=re("7d"),n=re(""),s=re(""),r=re([]),i=re([]),o=ut({request_id:"",user_id:"",task_id:""}),a=f=>f.toISOString().slice(0,10),l=()=>{const f=new Date;if(e.value==="today")return{from:a(f),to:a(f)};if(e.value==="7d"){const d=new Date(f);return d.setDate(d.getDate()-6),{from:a(d),to:a(f)}}if(e.value==="30d"){const d=new Date(f);return d.setDate(d.getDate()-29),{from:a(d),to:a(f)}}return{from:n.value,to:s.value}},c=async()=>{const f=l();r.value=(await pe.listEvents({...f,request_id:o.request_id,user_id:o.user_id,task_id:o.task_id,lead_id:o.task_id,order_id:o.task_id})).items||[],i.value=(await pe.listErrors({...f,request_id:o.request_id})).items||[]},u=Te(()=>{const f=i.value.length>20?"warning":"ok",d=i.value.filter(v=>String(v.route||"").includes("callback")).length>3?"warning":"ok",m=r.value.some(v=>{var y;return Number(((y=v.metadata)==null?void 0:y.balance_after)||0)<0})?"critical":"ok";return{errorSpike:f,callbackFailure:d,negativeCredit:m}});return Bt([e,n,s],c),Ln(c),(f,d)=>($(),H("section",null,[le(yr,{modelValue:e.value,"onUpdate:modelValue":d[0]||(d[0]=m=>e.value=m),from:n.value,"onUpdate:from":d[1]||(d[1]=m=>n.value=m),to:s.value,"onUpdate:to":d[2]||(d[2]=m=>s.value=m)},null,8,["modelValue","from","to"]),h("div",oy,[_e(h("input",{"onUpdate:modelValue":d[3]||(d[3]=m=>o.request_id=m),placeholder:"request_id"},null,512),[[xe,o.request_id]]),_e(h("input",{"onUpdate:modelValue":d[4]||(d[4]=m=>o.user_id=m),placeholder:"user_id"},null,512),[[xe,o.user_id]]),_e(h("input",{"onUpdate:modelValue":d[5]||(d[5]=m=>o.task_id=m),placeholder:"task_id / lead_id / order_id"},null,512),[[xe,o.task_id]]),h("button",{class:"primary",onClick:c},"Search")]),h("div",ay,[h("div",ly,[d[6]||(d[6]=h("strong",null,"24h error spike:",-1)),h("span",{class:rt(`badge ${u.value.errorSpike}`)},P(u.value.errorSpike),3)]),h("div",cy,[d[7]||(d[7]=h("strong",null,"callback failure rate:",-1)),h("span",{class:rt(`badge ${u.value.callbackFailure}`)},P(u.value.callbackFailure),3)]),h("div",uy,[d[8]||(d[8]=h("strong",null,"negative credit balance:",-1)),h("span",{class:rt(`badge ${u.value.negativeCredit}`)},P(u.value.negativeCredit),3)])]),h("div",dy,[d[10]||(d[10]=h("h3",null,"Event Logs",-1)),h("table",null,[d[9]||(d[9]=h("thead",null,[h("tr",null,[h("th",null,"created_at"),h("th",null,"event_type"),h("th",null,"user_id"),h("th",null,"entity_type"),h("th",null,"entity_id"),h("th",null,"request_id")])],-1)),h("tbody",null,[($(!0),H(ae,null,be(r.value,m=>($(),H("tr",{key:m.id},[h("td",null,P(m.created_at),1),h("td",null,P(m.event_type),1),h("td",null,P(m.user_id),1),h("td",null,P(m.entity_type),1),h("td",null,P(m.entity_id),1),h("td",null,P(m.request_id),1)]))),128))])])]),h("div",fy,[d[12]||(d[12]=h("h3",null,"Error Logs",-1)),h("table",null,[d[11]||(d[11]=h("thead",null,[h("tr",null,[h("th",null,"created_at"),h("th",null,"request_id"),h("th",null,"route"),h("th",null,"error_code"),h("th",null,"retryable")])],-1)),h("tbody",null,[($(!0),H(ae,null,be(i.value,m=>($(),H("tr",{key:m.id},[h("td",null,P(m.created_at),1),h("td",null,P(m.request_id),1),h("td",null,P(m.route),1),h("td",null,P(m.error_code),1),h("td",null,P(m.retryable),1)]))),128))])])])]))}},py={class:"panel filter-row"},gy=["value"],my={class:"row"},_y={class:"col panel table-wrap"},yy={style:{"white-space":"pre-wrap"}},vy=["onClick"],by=["onClick"],Ey={class:"col panel"},Iy={style:{display:"grid",gap:"8px"}},wy={class:"panel table-wrap",style:{"margin-top":"12px"}},Sy=["onClick"],Cy={key:0,style:{"margin-top":"8px"}},Ty={__name:"DataManagementPage",setup(t){const e=re([]),n=re([]),s=re([]),r=ut({collection:"",docId:"",limit:50,message:""}),i=ut({docId:"",patchText:`{

}`,reason:""}),o=b=>JSON.stringify(b,null,2),a=async()=>{const b=await pe.listDataCollections();e.value=b.items||[]},l=()=>{if(!r.collection)throw new Error("Please select a collection")},c=async()=>{try{l();const b=await pe.listDataRecords({collection:r.collection,doc_id:r.docId,limit:r.limit});n.value=b.items||[],r.message=`Loaded ${n.value.length} records.`}catch(b){r.message=b.message||"Failed to load records."}},u=async()=>{try{l();const b=await pe.listDataChanges({collection:r.collection,doc_id:r.docId,limit:200});s.value=b.items||[],r.message=`Loaded ${s.value.length} change logs.`}catch(b){r.message=b.message||"Failed to load changes."}},f=b=>{i.docId=b.id||"";const E={...b};delete E.id,i.patchText=JSON.stringify(E,null,2)},d=b=>{i.docId=b.id||""},m=async()=>{try{l();const b=JSON.parse(i.patchText||"{}");await pe.updateDataRecord({collection:r.collection,doc_id:i.docId,patch:b,reason:i.reason}),r.message="Record updated. Audit log saved.",await c(),await u()}catch(b){r.message=b.message||"Update failed."}},v=async()=>{try{l(),await pe.deleteDataRecord({collection:r.collection,doc_id:i.docId,reason:i.reason}),r.message="Record deleted. Audit log saved.",await c(),await u()}catch(b){r.message=b.message||"Delete failed."}},y=async b=>{try{await pe.rollbackDataChange({change_id:b.id,reason:`rollback-from-ui:${b.id}`}),r.message=`Rollback completed for ${b.id}`,await c(),await u()}catch(E){r.message=E.message||"Rollback failed."}};return Ln(async()=>{await a()}),(b,E)=>($(),H("section",null,[h("div",py,[_e(h("select",{"onUpdate:modelValue":E[0]||(E[0]=C=>r.collection=C)},[E[6]||(E[6]=h("option",{value:""},"Select collection",-1)),($(!0),H(ae,null,be(e.value,C=>($(),H("option",{key:C,value:C},P(C),9,gy))),128))],512),[[ks,r.collection]]),_e(h("input",{"onUpdate:modelValue":E[1]||(E[1]=C=>r.docId=C),placeholder:"doc_id (optional)"},null,512),[[xe,r.docId]]),_e(h("input",{"onUpdate:modelValue":E[2]||(E[2]=C=>r.limit=C),type:"number",min:"1",max:"200",placeholder:"limit"},null,512),[[xe,r.limit,void 0,{number:!0}]]),h("button",{class:"primary",onClick:c},"Load Records"),h("button",{onClick:u},"Load Changes")]),h("div",my,[h("div",_y,[E[8]||(E[8]=h("h3",null,"Records",-1)),h("table",null,[E[7]||(E[7]=h("thead",null,[h("tr",null,[h("th",null,"id"),h("th",null,"data"),h("th",null,"action")])],-1)),h("tbody",null,[($(!0),H(ae,null,be(n.value,C=>($(),H("tr",{key:C.id},[h("td",null,P(C.id),1),h("td",null,[h("pre",yy,P(o(C)),1)]),h("td",null,[h("button",{onClick:L=>f(C)},"Edit",8,vy),h("button",{class:"danger",onClick:L=>d(C)},"Delete",8,by)])]))),128))])])]),h("div",Ey,[E[9]||(E[9]=h("h3",null,"Edit / Delete",-1)),h("div",Iy,[_e(h("input",{"onUpdate:modelValue":E[3]||(E[3]=C=>i.docId=C),placeholder:"doc_id"},null,512),[[xe,i.docId]]),_e(h("textarea",{"onUpdate:modelValue":E[4]||(E[4]=C=>i.patchText=C),rows:"10",placeholder:'{"field":"value"}'},null,512),[[xe,i.patchText]]),_e(h("input",{"onUpdate:modelValue":E[5]||(E[5]=C=>i.reason=C),placeholder:"reason (required)"},null,512),[[xe,i.reason]]),h("div",{class:"filter-row"},[h("button",{class:"primary",onClick:m},"Update"),h("button",{class:"danger",onClick:v},"Delete")])])])]),h("div",wy,[E[11]||(E[11]=h("h3",null,"Change Logs (Rollback)",-1)),h("table",null,[E[10]||(E[10]=h("thead",null,[h("tr",null,[h("th",null,"change_id"),h("th",null,"collection"),h("th",null,"doc_id"),h("th",null,"action"),h("th",null,"reason"),h("th",null,"actor"),h("th",null,"created_at"),h("th",null,"rollback")])],-1)),h("tbody",null,[($(!0),H(ae,null,be(s.value,C=>($(),H("tr",{key:C.id},[h("td",null,P(C.id),1),h("td",null,P(C.collection),1),h("td",null,P(C.doc_id),1),h("td",null,P(C.action),1),h("td",null,P(C.reason),1),h("td",null,P(C.actor_id),1),h("td",null,P(C.created_at),1),h("td",null,[h("button",{onClick:L=>y(C)},"Rollback",8,Sy)])]))),128))])])]),r.message?($(),H("p",Cy,P(r.message),1)):Pn("",!0)]))}},Pc=uh({history:Hf(),routes:[{path:"/login",component:v_,meta:{public:!0}},{path:"/",component:S_,children:[{path:"",redirect:"/overview"},{path:"overview",component:H_},{path:"users",component:J_},{path:"billing",component:iy},{path:"logs",component:hy},{path:"data-management",component:Ty}]}]}),Ay=()=>new Promise(t=>{const e=qg(on,()=>{e(),t()})});Pc.beforeEach(async t=>(await Ay(),t.meta.public?on.currentUser&&await ci().catch(()=>!1)?"/overview":!0:on.currentUser&&await ci().catch(()=>!1)?!0:"/login"));Xd(sf).use(Pc).mount("#app");

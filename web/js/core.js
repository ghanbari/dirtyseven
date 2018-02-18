/*
 AutobahnJS - http://autobahn.ws

 Copyright (C) 2011-2014 Tavendo GmbH.
 Licensed under the MIT License.
 See license text at http://www.opensource.org/licenses/mit-license.php

 AutobahnJS includes code from:

 when - http://cujojs.com

 (c) copyright B Cavalier & J Hann
 Licensed under the MIT License at:
 http://www.opensource.org/licenses/mit-license.php

 Crypto-JS - http://code.google.com/p/crypto-js/

 (c) 2009-2012 by Jeff Mott. All rights reserved.
 Licensed under the New BSD License at:
 http://code.google.com/p/crypto-js/wiki/License

 console-normalizer - https://github.com/Zenovations/console-normalizer

 (c) 2012 by Zenovations.
 Licensed under the MIT License at:
 http://www.opensource.org/licenses/mit-license.php

 */
window.define||(window.define=function(c){try{delete window.define}catch(g){window.define=void 0}window.when=c()},window.define.amd={});(function(c){c||(c=window.console={log:function(c,a,b,d,h){},info:function(c,a,b,d,h){},warn:function(c,a,b,d,h){},error:function(c,a,b,d,h){}});Function.prototype.bind||(Function.prototype.bind=function(c){var a=this,b=Array.prototype.slice.call(arguments,1);return function(){return a.apply(c,Array.prototype.concat.apply(b,arguments))}});"object"===typeof c.log&&(c.log=Function.prototype.call.bind(c.log,c),c.info=Function.prototype.call.bind(c.info,c),c.warn=Function.prototype.call.bind(c.warn,c),
    c.error=Function.prototype.call.bind(c.error,c));"group"in c||(c.group=function(g){c.info("\n--- "+g+" ---\n")});"groupEnd"in c||(c.groupEnd=function(){c.log("\n")});"time"in c||function(){var g={};c.time=function(a){g[a]=(new Date).getTime()};c.timeEnd=function(a){var b=(new Date).getTime();c.info(a+": "+(a in g?b-g[a]:0)+"ms")}}()})(window.console);/*
 MIT License (c) copyright 2011-2013 original author or authors */
(function(c){c(function(c){function a(a,b,e,c){return(a instanceof d?a:h(a)).then(b,e,c)}function b(a){return new d(a,B.PromiseStatus&&B.PromiseStatus())}function d(a,b){function d(a){if(m){var c=m;m=w;p(function(){q=e(l,a);b&&A(q,b);f(c,q)})}}function c(a){d(new k(a))}function h(a){if(m){var b=m;p(function(){f(b,new z(a))})}}var l,q,m=[];l=this;this._status=b;this.inspect=function(){return q?q.inspect():{state:"pending"}};this._when=function(a,b,e,d,c){function f(h){h._when(a,b,e,d,c)}m?m.push(f):
    p(function(){f(q)})};try{a(d,c,h)}catch(n){c(n)}}function h(a){return b(function(b){b(a)})}function f(a,b){for(var e=0;e<a.length;e++)a[e](b)}function e(a,b){if(b===a)return new k(new TypeError);if(b instanceof d)return b;try{var e=b===Object(b)&&b.then;return"function"===typeof e?l(e,b):new t(b)}catch(c){return new k(c)}}function l(a,e){return b(function(b,d){G(a,e,b,d)})}function t(a){this.value=a}function k(a){this.value=a}function z(a){this.value=a}function A(a,b){a.then(function(){b.fulfilled()},
    function(a){b.rejected(a)})}function q(a){return a&&"function"===typeof a.then}function m(e,d,c,f,h){return a(e,function(e){return b(function(b,c,f){function h(a){n(a)}function A(a){k(a)}var l,q,D,m,k,n,t,g;t=e.length>>>0;l=Math.max(0,Math.min(d,t));D=[];q=t-l+1;m=[];if(l){n=function(a){m.push(a);--q||(k=n=s,c(m))};k=function(a){D.push(a);--l||(k=n=s,b(D))};for(g=0;g<t;++g)g in e&&a(e[g],A,h,f)}else b(D)}).then(c,f,h)})}function n(a,b,e,d){return u(a,s).then(b,e,d)}function u(b,e,c){return a(b,function(b){return new d(function(d,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         f,h){function A(b,q){a(b,e,c).then(function(a){l[q]=a;--k||d(l)},f,h)}var l,q,k,m;k=q=b.length>>>0;l=[];if(k)for(m=0;m<q;m++)m in b?A(b[m],m):--k;else d(l)})})}function y(a){return{state:"fulfilled",value:a}}function x(a){return{state:"rejected",reason:a}}function p(a){1===E.push(a)&&C(v)}function v(){f(E);E=[]}function s(a){return a}function K(a){"function"===typeof B.reportUnhandled?B.reportUnhandled():p(function(){throw a;});throw a;}a.promise=b;a.resolve=h;a.reject=function(b){return a(b,function(a){return new k(a)})};
    a.defer=function(){var a,e,d;a={promise:w,resolve:w,reject:w,notify:w,resolver:{resolve:w,reject:w,notify:w}};a.promise=e=b(function(b,c,f){a.resolve=a.resolver.resolve=function(a){if(d)return h(a);d=!0;b(a);return e};a.reject=a.resolver.reject=function(a){if(d)return h(new k(a));d=!0;c(a);return e};a.notify=a.resolver.notify=function(a){f(a);return a}});return a};a.join=function(){return u(arguments,s)};a.all=n;a.map=function(a,b){return u(a,b)};a.reduce=function(b,e){var d=G(H,arguments,1);return a(b,
        function(b){var c;c=b.length;d[0]=function(b,d,f){return a(b,function(b){return a(d,function(a){return e(b,a,f,c)})})};return I.apply(b,d)})};a.settle=function(a){return u(a,y,x)};a.any=function(a,b,e,d){return m(a,1,function(a){return b?b(a[0]):a[0]},e,d)};a.some=m;a.isPromise=q;a.isPromiseLike=q;r=d.prototype;r.then=function(a,b,e){var c=this;return new d(function(d,f,h){c._when(d,h,a,b,e)},this._status&&this._status.observed())};r["catch"]=r.otherwise=function(a){return this.then(w,a)};r["finally"]=
        r.ensure=function(a){function b(){return h(a())}return"function"===typeof a?this.then(b,b).yield(this):this};r.done=function(a,b){this.then(a,b)["catch"](K)};r.yield=function(a){return this.then(function(){return a})};r.tap=function(a){return this.then(a).yield(this)};r.spread=function(a){return this.then(function(b){return n(b,function(b){return a.apply(w,b)})})};r.always=function(a,b){return this.then(a,a,b)};F=Object.create||function(a){function b(){}b.prototype=a;return new b};t.prototype=F(r);
    t.prototype.inspect=function(){return y(this.value)};t.prototype._when=function(a,b,e){try{a("function"===typeof e?e(this.value):this.value)}catch(d){a(new k(d))}};k.prototype=F(r);k.prototype.inspect=function(){return x(this.value)};k.prototype._when=function(a,b,e,d){try{a("function"===typeof d?d(this.value):this)}catch(c){a(new k(c))}};z.prototype=F(r);z.prototype._when=function(a,b,e,d,c){try{b("function"===typeof c?c(this.value):this.value)}catch(f){b(f)}};var r,F,I,H,G,C,E,B,J,w;E=[];B="undefined"!==
    typeof console?console:a;if("object"===typeof process&&process.nextTick)C=process.nextTick;else if(r="function"===typeof MutationObserver&&MutationObserver||"function"===typeof WebKitMutationObserver&&WebKitMutationObserver)C=function(a,b,e){var d=a.createElement("div");(new b(e)).observe(d,{attributes:!0});return function(){d.setAttribute("x","x")}}(document,r,v);else try{C=c("vertx").runOnLoop||c("vertx").runOnContext}catch(L){J=setTimeout,C=function(a){J(a,0)}}c=Function.prototype;r=c.call;G=c.bind?
        r.bind(r):function(a,b){return a.apply(b,H.call(arguments,2))};c=[];H=c.slice;I=c.reduce||function(a){var b,e,d,c,f;f=0;b=Object(this);c=b.length>>>0;e=arguments;if(1>=e.length)for(;;){if(f in b){d=b[f++];break}if(++f>=c)throw new TypeError;}else d=e[1];for(;f<c;++f)f in b&&(d=a(d,b[f],f,b));return d};return a})})("function"===typeof define&&define.amd?define:function(c){module.exports=c(require)});var CryptoJS=CryptoJS||function(c,g){var a={},b=a.lib={},d=b.Base=function(){function a(){}return{extend:function(b){a.prototype=this;var e=new a;b&&e.mixIn(b);e.hasOwnProperty("init")||(e.init=function(){e.$super.init.apply(this,arguments)});e.init.prototype=e;e.$super=this;return e},create:function(){var a=this.extend();a.init.apply(a,arguments);return a},init:function(){},mixIn:function(a){for(var b in a)a.hasOwnProperty(b)&&(this[b]=a[b]);a.hasOwnProperty("toString")&&(this.toString=a.toString)},
        clone:function(){return this.init.prototype.extend(this)}}}(),h=b.WordArray=d.extend({init:function(a,b){a=this.words=a||[];this.sigBytes=b!=g?b:4*a.length},toString:function(a){return(a||e).stringify(this)},concat:function(a){var b=this.words,e=a.words,d=this.sigBytes;a=a.sigBytes;this.clamp();if(d%4)for(var c=0;c<a;c++)b[d+c>>>2]|=(e[c>>>2]>>>24-8*(c%4)&255)<<24-8*((d+c)%4);else if(65535<e.length)for(c=0;c<a;c+=4)b[d+c>>>2]=e[c>>>2];else b.push.apply(b,e);this.sigBytes+=a;return this},clamp:function(){var a=
        this.words,b=this.sigBytes;a[b>>>2]&=4294967295<<32-8*(b%4);a.length=c.ceil(b/4)},clone:function(){var a=d.clone.call(this);a.words=this.words.slice(0);return a},random:function(a){for(var b=[],e=0;e<a;e+=4)b.push(4294967296*c.random()|0);return new h.init(b,a)}}),f=a.enc={},e=f.Hex={stringify:function(a){var b=a.words;a=a.sigBytes;for(var e=[],d=0;d<a;d++){var c=b[d>>>2]>>>24-8*(d%4)&255;e.push((c>>>4).toString(16));e.push((c&15).toString(16))}return e.join("")},parse:function(a){for(var b=a.length,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      e=[],d=0;d<b;d+=2)e[d>>>3]|=parseInt(a.substr(d,2),16)<<24-4*(d%8);return new h.init(e,b/2)}},l=f.Latin1={stringify:function(a){var b=a.words;a=a.sigBytes;for(var e=[],d=0;d<a;d++)e.push(String.fromCharCode(b[d>>>2]>>>24-8*(d%4)&255));return e.join("")},parse:function(a){for(var b=a.length,e=[],d=0;d<b;d++)e[d>>>2]|=(a.charCodeAt(d)&255)<<24-8*(d%4);return new h.init(e,b)}},t=f.Utf8={stringify:function(a){try{return decodeURIComponent(escape(l.stringify(a)))}catch(b){throw Error("Malformed UTF-8 data");
    }},parse:function(a){return l.parse(unescape(encodeURIComponent(a)))}},k=b.BufferedBlockAlgorithm=d.extend({reset:function(){this._data=new h.init;this._nDataBytes=0},_append:function(a){"string"==typeof a&&(a=t.parse(a));this._data.concat(a);this._nDataBytes+=a.sigBytes},_process:function(a){var b=this._data,e=b.words,d=b.sigBytes,f=this.blockSize,l=d/(4*f),l=a?c.ceil(l):c.max((l|0)-this._minBufferSize,0);a=l*f;d=c.min(4*a,d);if(a){for(var k=0;k<a;k+=f)this._doProcessBlock(e,k);k=e.splice(0,a);b.sigBytes-=
        d}return new h.init(k,d)},clone:function(){var a=d.clone.call(this);a._data=this._data.clone();return a},_minBufferSize:0});b.Hasher=k.extend({cfg:d.extend(),init:function(a){this.cfg=this.cfg.extend(a);this.reset()},reset:function(){k.reset.call(this);this._doReset()},update:function(a){this._append(a);this._process();return this},finalize:function(a){a&&this._append(a);return this._doFinalize()},blockSize:16,_createHelper:function(a){return function(b,e){return(new a.init(e)).finalize(b)}},_createHmacHelper:function(a){return function(b,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       e){return(new z.HMAC.init(a,e)).finalize(b)}}});var z=a.algo={};return a}(Math);(function(){var c=CryptoJS,g=c.lib.WordArray;c.enc.Base64={stringify:function(a){var b=a.words,d=a.sigBytes,c=this._map;a.clamp();a=[];for(var f=0;f<d;f+=3)for(var e=(b[f>>>2]>>>24-8*(f%4)&255)<<16|(b[f+1>>>2]>>>24-8*((f+1)%4)&255)<<8|b[f+2>>>2]>>>24-8*((f+2)%4)&255,l=0;4>l&&f+0.75*l<d;l++)a.push(c.charAt(e>>>6*(3-l)&63));if(b=c.charAt(64))for(;a.length%4;)a.push(b);return a.join("")},parse:function(a){var b=a.length,d=this._map,c=d.charAt(64);c&&(c=a.indexOf(c),-1!=c&&(b=c));for(var c=[],f=0,e=0;e<
b;e++)if(e%4){var l=d.indexOf(a.charAt(e-1))<<2*(e%4),t=d.indexOf(a.charAt(e))>>>6-2*(e%4);c[f>>>2]|=(l|t)<<24-8*(f%4);f++}return g.create(c,f)},_map:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="}})();(function(){var c=CryptoJS,g=c.enc.Utf8;c.algo.HMAC=c.lib.Base.extend({init:function(a,b){a=this._hasher=new a.init;"string"==typeof b&&(b=g.parse(b));var d=a.blockSize,c=4*d;b.sigBytes>c&&(b=a.finalize(b));b.clamp();for(var f=this._oKey=b.clone(),e=this._iKey=b.clone(),l=f.words,t=e.words,k=0;k<d;k++)l[k]^=1549556828,t[k]^=909522486;f.sigBytes=e.sigBytes=c;this.reset()},reset:function(){var a=this._hasher;a.reset();a.update(this._iKey)},update:function(a){this._hasher.update(a);return this},finalize:function(a){var b=
    this._hasher;a=b.finalize(a);b.reset();return b.finalize(this._oKey.clone().concat(a))}})})();(function(c){var g=CryptoJS,a=g.lib,b=a.WordArray,d=a.Hasher,a=g.algo,h=[],f=[];(function(){function a(b){for(var e=c.sqrt(b),d=2;d<=e;d++)if(!(b%d))return!1;return!0}function b(a){return 4294967296*(a-(a|0))|0}for(var e=2,d=0;64>d;)a(e)&&(8>d&&(h[d]=b(c.pow(e,0.5))),f[d]=b(c.pow(e,1/3)),d++),e++})();var e=[],a=a.SHA256=d.extend({_doReset:function(){this._hash=new b.init(h.slice(0))},_doProcessBlock:function(a,b){for(var d=this._hash.words,c=d[0],h=d[1],g=d[2],m=d[3],n=d[4],u=d[5],y=d[6],x=d[7],p=
    0;64>p;p++){if(16>p)e[p]=a[b+p]|0;else{var v=e[p-15],s=e[p-2];e[p]=((v<<25|v>>>7)^(v<<14|v>>>18)^v>>>3)+e[p-7]+((s<<15|s>>>17)^(s<<13|s>>>19)^s>>>10)+e[p-16]}v=x+((n<<26|n>>>6)^(n<<21|n>>>11)^(n<<7|n>>>25))+(n&u^~n&y)+f[p]+e[p];s=((c<<30|c>>>2)^(c<<19|c>>>13)^(c<<10|c>>>22))+(c&h^c&g^h&g);x=y;y=u;u=n;n=m+v|0;m=g;g=h;h=c;c=v+s|0}d[0]=d[0]+c|0;d[1]=d[1]+h|0;d[2]=d[2]+g|0;d[3]=d[3]+m|0;d[4]=d[4]+n|0;d[5]=d[5]+u|0;d[6]=d[6]+y|0;d[7]=d[7]+x|0},_doFinalize:function(){var a=this._data,b=a.words,d=8*this._nDataBytes,
    e=8*a.sigBytes;b[e>>>5]|=128<<24-e%32;b[(e+64>>>9<<4)+14]=c.floor(d/4294967296);b[(e+64>>>9<<4)+15]=d;a.sigBytes=4*b.length;this._process();return this._hash},clone:function(){var a=d.clone.call(this);a._hash=this._hash.clone();return a}});g.SHA256=d._createHelper(a);g.HmacSHA256=d._createHmacHelper(a)})(Math);(function(){var c=CryptoJS,g=c.lib,a=g.Base,b=g.WordArray,g=c.algo,d=g.HMAC,h=g.PBKDF2=a.extend({cfg:a.extend({keySize:4,hasher:g.SHA1,iterations:1}),init:function(a){this.cfg=this.cfg.extend(a)},compute:function(a,e){for(var c=this.cfg,h=d.create(c.hasher,a),g=b.create(),z=b.create([1]),A=g.words,q=z.words,m=c.keySize,c=c.iterations;A.length<m;){var n=h.update(e).finalize(z);h.reset();for(var u=n.words,y=u.length,x=n,p=1;p<c;p++){x=h.finalize(x);h.reset();for(var v=x.words,s=0;s<y;s++)u[s]^=v[s]}g.concat(n);
    q[0]++}g.sigBytes=4*m;return g}});c.PBKDF2=function(a,b,d){return h.create(d).compute(a,b)}})();/*
 MIT License (c) 2011-2013 Copyright Tavendo GmbH. */
var AUTOBAHNJS_VERSION="0.8.2",global=this;
(function(c,g){"function"===typeof define&&define.amd?define(["when"],function(a){return c.ab=g(c,a)}):"undefined"!==typeof exports?"undefined"!=typeof module&&module.exports&&(exports=module.exports=g(c,c.when)):c.ab=g(c,c.when)})(global,function(c,g){var a={_version:AUTOBAHNJS_VERSION};(function(){Array.prototype.indexOf||(Array.prototype.indexOf=function(a){if(null===this)throw new TypeError;var d=Object(this),c=d.length>>>0;if(0===c)return-1;var f=0;0<arguments.length&&(f=Number(arguments[1]),
    f!==f?f=0:0!==f&&(Infinity!==f&&-Infinity!==f)&&(f=(0<f||-1)*Math.floor(Math.abs(f))));if(f>=c)return-1;for(f=0<=f?f:Math.max(c-Math.abs(f),0);f<c;f++)if(f in d&&d[f]===a)return f;return-1});Array.prototype.forEach||(Array.prototype.forEach=function(a,d){var c,f;if(null===this)throw new TypeError(" this is null or not defined");var e=Object(this),l=e.length>>>0;if("[object Function]"!=={}.toString.call(a))throw new TypeError(a+" is not a function");d&&(c=d);for(f=0;f<l;){var g;f in e&&(g=e[f],a.call(c,
    g,f,e));f++}})})();a._sliceUserAgent=function(a,d,c){var f=[],e=navigator.userAgent;a=e.indexOf(a);d=e.indexOf(d,a);0>d&&(d=e.length);c=e.slice(a,d).split(c);e=c[1].split(".");for(d=0;d<e.length;++d)f.push(parseInt(e[d],10));return{name:c[0],version:f}};a.getBrowser=function(){var b=navigator.userAgent;return-1<b.indexOf("Chrome")?a._sliceUserAgent("Chrome"," ","/"):-1<b.indexOf("Safari")?a._sliceUserAgent("Safari"," ","/"):-1<b.indexOf("Firefox")?a._sliceUserAgent("Firefox"," ","/"):-1<b.indexOf("MSIE")?
    a._sliceUserAgent("MSIE",";"," "):null};a.getServerUrl=function(a,d){return"file:"===c.location.protocol?d?d:"ws://127.0.0.1/ws":("https:"===c.location.protocol?"wss://":"ws://")+c.location.hostname+(""!==c.location.port?":"+c.location.port:"")+"/"+(a?a:"ws")};a.browserNotSupportedMessage="Browser does not support WebSockets (RFC6455)";a.deriveKey=function(a,d){return d&&d.salt?CryptoJS.PBKDF2(a,d.salt,{keySize:(d.keylen||32)/4,iterations:d.iterations||1E4,hasher:CryptoJS.algo.SHA256}).toString(CryptoJS.enc.Base64):
    a};a._idchars="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";a._idlen=16;a._subprotocol="wamp";a._newid=function(){for(var b="",d=0;d<a._idlen;d+=1)b+=a._idchars.charAt(Math.floor(Math.random()*a._idchars.length));return b};a._newidFast=function(){return Math.random().toString(36)};a.log=function(){if(1<arguments.length){console.group("Log Item");for(var a=0;a<arguments.length;a+=1)console.log(arguments[a]);console.groupEnd()}else console.log(arguments[0])};a._debugrpc=!1;a._debugpubsub=
    !1;a._debugws=!1;a._debugconnect=!1;a.debug=function(b,d,h){if("console"in c)a._debugrpc=b,a._debugpubsub=b,a._debugws=d,a._debugconnect=h;else throw"browser does not support console object";};a.version=function(){return a._version};a.PrefixMap=function(){this._index={};this._rindex={}};a.PrefixMap.prototype.get=function(a){return this._index[a]};a.PrefixMap.prototype.set=function(a,d){this._index[a]=d;this._rindex[d]=a};a.PrefixMap.prototype.setDefault=function(a){this._index[""]=a;this._rindex[a]=
    ""};a.PrefixMap.prototype.remove=function(a){var d=this._index[a];d&&(delete this._index[a],delete this._rindex[d])};a.PrefixMap.prototype.resolve=function(a,d){var c=a.indexOf(":");if(0<=c){var f=a.substring(0,c);if(this._index[f])return this._index[f]+a.substring(c+1)}return!0===d?a:null};a.PrefixMap.prototype.shrink=function(a,d){for(var c=a.length;0<c;c-=1){var f=a.substring(0,c);if(f=this._rindex[f])return f+":"+a.substring(c)}return!0===d?a:null};a._MESSAGE_TYPEID_WELCOME=0;a._MESSAGE_TYPEID_PREFIX=
    1;a._MESSAGE_TYPEID_CALL=2;a._MESSAGE_TYPEID_CALL_RESULT=3;a._MESSAGE_TYPEID_CALL_ERROR=4;a._MESSAGE_TYPEID_SUBSCRIBE=5;a._MESSAGE_TYPEID_UNSUBSCRIBE=6;a._MESSAGE_TYPEID_PUBLISH=7;a._MESSAGE_TYPEID_EVENT=8;a.CONNECTION_CLOSED=0;a.CONNECTION_LOST=1;a.CONNECTION_RETRIES_EXCEEDED=2;a.CONNECTION_UNREACHABLE=3;a.CONNECTION_UNSUPPORTED=4;a.CONNECTION_UNREACHABLE_SCHEDULED_RECONNECT=5;a.CONNECTION_LOST_SCHEDULED_RECONNECT=6;a.Deferred=g.defer;a._construct=function(a,d){return"WebSocket"in c?d?new WebSocket(a,
    d):new WebSocket(a):"MozWebSocket"in c?d?new MozWebSocket(a,d):new MozWebSocket(a):null};a.Session=function(b,d,c,f){var e=this;e._wsuri=b;e._options=f;e._websocket_onopen=d;e._websocket_onclose=c;e._websocket=null;e._websocket_connected=!1;e._session_id=null;e._wamp_version=null;e._server=null;e._calls={};e._subscriptions={};e._prefixes=new a.PrefixMap;e._txcnt=0;e._rxcnt=0;e._websocket=e._options&&e._options.skipSubprotocolAnnounce?a._construct(e._wsuri):a._construct(e._wsuri,[a._subprotocol]);
    if(!e._websocket){if(void 0!==c){c(a.CONNECTION_UNSUPPORTED);return}throw a.browserNotSupportedMessage;}e._websocket.onmessage=function(b){a._debugws&&(e._rxcnt+=1,console.group("WS Receive"),console.info(e._wsuri+"  ["+e._session_id+"]"),console.log(e._rxcnt),console.log(b.data),console.groupEnd());b=JSON.parse(b.data);if(b[1]in e._calls){if(b[0]===a._MESSAGE_TYPEID_CALL_RESULT){var d=e._calls[b[1]],c=b[2];if(a._debugrpc&&void 0!==d._ab_callobj){console.group("WAMP Call",d._ab_callobj[2]);console.timeEnd(d._ab_tid);
        console.group("Arguments");for(var f=3;f<d._ab_callobj.length;f+=1){var h=d._ab_callobj[f];if(void 0!==h)console.log(h);else break}console.groupEnd();console.group("Result");console.log(c);console.groupEnd();console.groupEnd()}d.resolve(c)}else if(b[0]===a._MESSAGE_TYPEID_CALL_ERROR){d=e._calls[b[1]];c=b[2];f=b[3];h=b[4];if(a._debugrpc&&void 0!==d._ab_callobj){console.group("WAMP Call",d._ab_callobj[2]);console.timeEnd(d._ab_tid);console.group("Arguments");for(var g=3;g<d._ab_callobj.length;g+=1){var m=
        d._ab_callobj[g];if(void 0!==m)console.log(m);else break}console.groupEnd();console.group("Error");console.log(c);console.log(f);void 0!==h&&console.log(h);console.groupEnd();console.groupEnd()}void 0!==h?d.reject({uri:c,desc:f,detail:h}):d.reject({uri:c,desc:f})}delete e._calls[b[1]]}else if(b[0]===a._MESSAGE_TYPEID_EVENT){if(d=e._prefixes.resolve(b[1],!0),d in e._subscriptions){var n=b[1],u=b[2];a._debugpubsub&&(console.group("WAMP Event"),console.info(e._wsuri+"  ["+e._session_id+"]"),console.log(n),
        console.log(u),console.groupEnd());e._subscriptions[d].forEach(function(a){a(n,u)})}}else if(b[0]===a._MESSAGE_TYPEID_WELCOME)if(null===e._session_id){e._session_id=b[1];e._wamp_version=b[2];e._server=b[3];if(a._debugrpc||a._debugpubsub)console.group("WAMP Welcome"),console.info(e._wsuri+"  ["+e._session_id+"]"),console.log(e._wamp_version),console.log(e._server),console.groupEnd();null!==e._websocket_onopen&&e._websocket_onopen()}else throw"protocol error (welcome message received more than once)";
    };e._websocket.onopen=function(b){if(e._websocket.protocol!==a._subprotocol)if("undefined"===typeof e._websocket.protocol)a._debugws&&(console.group("WS Warning"),console.info(e._wsuri),console.log("WebSocket object has no protocol attribute: WAMP subprotocol check skipped!"),console.groupEnd());else if(e._options&&e._options.skipSubprotocolCheck)a._debugws&&(console.group("WS Warning"),console.info(e._wsuri),console.log("Server does not speak WAMP, but subprotocol check disabled by option!"),console.log(e._websocket.protocol),
        console.groupEnd());else throw e._websocket.close(1E3,"server does not speak WAMP"),"server does not speak WAMP (but '"+e._websocket.protocol+"' !)";a._debugws&&(console.group("WAMP Connect"),console.info(e._wsuri),console.log(e._websocket.protocol),console.groupEnd());e._websocket_connected=!0};e._websocket.onerror=function(a){};e._websocket.onclose=function(b){a._debugws&&(e._websocket_connected?console.log("Autobahn connection to "+e._wsuri+" lost (code "+b.code+", reason '"+b.reason+"', wasClean "+
    b.wasClean+")."):console.log("Autobahn could not connect to "+e._wsuri+" (code "+b.code+", reason '"+b.reason+"', wasClean "+b.wasClean+")."));void 0!==e._websocket_onclose&&(e._websocket_connected?b.wasClean?e._websocket_onclose(a.CONNECTION_CLOSED,"WS-"+b.code+": "+b.reason):e._websocket_onclose(a.CONNECTION_LOST):e._websocket_onclose(a.CONNECTION_UNREACHABLE));e._websocket_connected=!1;e._wsuri=null;e._websocket_onopen=null;e._websocket_onclose=null;e._websocket=null};e.log=function(){e._options&&
    "sessionIdent"in e._options?console.group("WAMP Session '"+e._options.sessionIdent+"' ["+e._session_id+"]"):console.group("WAMP Session ["+e._session_id+"]");for(var a=0;a<arguments.length;++a)console.log(arguments[a]);console.groupEnd()}};a.Session.prototype._send=function(b){if(!this._websocket_connected)throw"Autobahn not connected";switch(!0){case c.Prototype&&"undefined"===typeof top.root.__prototype_deleted:case "function"===typeof b.toJSON:b=b.toJSON();break;default:b=JSON.stringify(b)}this._websocket.send(b);
    this._txcnt+=1;a._debugws&&(console.group("WS Send"),console.info(this._wsuri+"  ["+this._session_id+"]"),console.log(this._txcnt),console.log(b),console.groupEnd())};a.Session.prototype.close=function(){this._websocket_connected&&this._websocket.close()};a.Session.prototype.sessionid=function(){return this._session_id};a.Session.prototype.wsuri=function(){return this._wsuri};a.Session.prototype.shrink=function(a,d){void 0===d&&(d=!0);return this._prefixes.shrink(a,d)};a.Session.prototype.resolve=
    function(a,d){void 0===d&&(d=!0);return this._prefixes.resolve(a,d)};a.Session.prototype.prefix=function(b,d){this._prefixes.set(b,d);if(a._debugrpc||a._debugpubsub)console.group("WAMP Prefix"),console.info(this._wsuri+"  ["+this._session_id+"]"),console.log(b),console.log(d),console.groupEnd();this._send([a._MESSAGE_TYPEID_PREFIX,b,d])};a.Session.prototype.call=function(){for(var b=new a.Deferred,d;!(d=a._newidFast(),!(d in this._calls)););this._calls[d]=b;for(var c=this._prefixes.shrink(arguments[0],
    !0),c=[a._MESSAGE_TYPEID_CALL,d,c],f=1;f<arguments.length;f+=1)c.push(arguments[f]);this._send(c);a._debugrpc&&(b._ab_callobj=c,b._ab_tid=this._wsuri+"  ["+this._session_id+"]["+d+"]",console.time(b._ab_tid),console.info());return b.promise.then?b.promise:b};a.Session.prototype.subscribe=function(b,d){var c=this._prefixes.resolve(b,!0);c in this._subscriptions||(a._debugpubsub&&(console.group("WAMP Subscribe"),console.info(this._wsuri+"  ["+this._session_id+"]"),console.log(b),console.log(d),console.groupEnd()),
    this._send([a._MESSAGE_TYPEID_SUBSCRIBE,b]),this._subscriptions[c]=[]);if(-1===this._subscriptions[c].indexOf(d))this._subscriptions[c].push(d);else throw"callback "+d+" already subscribed for topic "+c;};a.Session.prototype.unsubscribe=function(b,d){var c=this._prefixes.resolve(b,!0);if(c in this._subscriptions){var f;if(void 0!==d){var e=this._subscriptions[c].indexOf(d);if(-1!==e)f=d,this._subscriptions[c].splice(e,1);else throw"no callback "+d+" subscribed on topic "+c;}else f=this._subscriptions[c].slice(),
    this._subscriptions[c]=[];0===this._subscriptions[c].length&&(delete this._subscriptions[c],a._debugpubsub&&(console.group("WAMP Unsubscribe"),console.info(this._wsuri+"  ["+this._session_id+"]"),console.log(b),console.log(f),console.groupEnd()),this._send([a._MESSAGE_TYPEID_UNSUBSCRIBE,b]))}else throw"not subscribed to topic "+c;};a.Session.prototype.publish=function(){var b=arguments[0],d=arguments[1],c=null,f=null,e=null,g=null;if(3<arguments.length){if(!(arguments[2]instanceof Array))throw"invalid argument type(s)";
    if(!(arguments[3]instanceof Array))throw"invalid argument type(s)";f=arguments[2];e=arguments[3];g=[a._MESSAGE_TYPEID_PUBLISH,b,d,f,e]}else if(2<arguments.length)if("boolean"===typeof arguments[2])c=arguments[2],g=[a._MESSAGE_TYPEID_PUBLISH,b,d,c];else if(arguments[2]instanceof Array)f=arguments[2],g=[a._MESSAGE_TYPEID_PUBLISH,b,d,f];else throw"invalid argument type(s)";else g=[a._MESSAGE_TYPEID_PUBLISH,b,d];a._debugpubsub&&(console.group("WAMP Publish"),console.info(this._wsuri+"  ["+this._session_id+
"]"),console.log(b),console.log(d),null!==c?console.log(c):null!==f&&(console.log(f),null!==e&&console.log(e)),console.groupEnd());this._send(g)};a.Session.prototype.authreq=function(a,d){return this.call("http://api.wamp.ws/procedure#authreq",a,d)};a.Session.prototype.authsign=function(a,d){d||(d="");return CryptoJS.HmacSHA256(a,d).toString(CryptoJS.enc.Base64)};a.Session.prototype.auth=function(a){return this.call("http://api.wamp.ws/procedure#auth",a)};a._connect=function(b){var d=new a.Session(b.wsuri,
    function(){b.connects+=1;b.retryCount=0;b.onConnect(d)},function(d,f){var e=null;switch(d){case a.CONNECTION_CLOSED:b.onHangup(d,"Connection was closed properly ["+f+"]");break;case a.CONNECTION_UNSUPPORTED:b.onHangup(d,"Browser does not support WebSocket.");break;case a.CONNECTION_UNREACHABLE:b.retryCount+=1;if(0===b.connects)b.onHangup(d,"Connection could not be established.");else if(b.retryCount<=b.options.maxRetries)(e=b.onHangup(a.CONNECTION_UNREACHABLE_SCHEDULED_RECONNECT,"Connection unreachable - scheduled reconnect to occur in "+
    b.options.retryDelay/1E3+" second(s) - attempt "+b.retryCount+" of "+b.options.maxRetries+".",{delay:b.options.retryDelay,retries:b.retryCount,maxretries:b.options.maxRetries}))?(a._debugconnect&&console.log("Connection unreachable - retrying stopped by app"),b.onHangup(a.CONNECTION_RETRIES_EXCEEDED,"Number of connection retries exceeded.")):(a._debugconnect&&console.log("Connection unreachable - retrying ("+b.retryCount+") .."),c.setTimeout(function(){a._connect(b)},b.options.retryDelay));else b.onHangup(a.CONNECTION_RETRIES_EXCEEDED,
        "Number of connection retries exceeded.");break;case a.CONNECTION_LOST:b.retryCount+=1;if(b.retryCount<=b.options.maxRetries)(e=b.onHangup(a.CONNECTION_LOST_SCHEDULED_RECONNECT,"Connection lost - scheduled "+b.retryCount+"th reconnect to occur in "+b.options.retryDelay/1E3+" second(s).",{delay:b.options.retryDelay,retries:b.retryCount,maxretries:b.options.maxRetries}))?(a._debugconnect&&console.log("Connection lost - retrying stopped by app"),b.onHangup(a.CONNECTION_RETRIES_EXCEEDED,"Connection lost.")):
        (a._debugconnect&&console.log("Connection lost - retrying ("+b.retryCount+") .."),c.setTimeout(function(){a._connect(b)},b.options.retryDelay));else b.onHangup(a.CONNECTION_RETRIES_EXCEEDED,"Connection lost.");break;default:throw"unhandled close code in ab._connect";}},b.options)};a.connect=function(b,d,c,f){var e={};e.wsuri=b;e.options=f?f:{};void 0===e.options.retryDelay&&(e.options.retryDelay=5E3);void 0===e.options.maxRetries&&(e.options.maxRetries=10);void 0===e.options.skipSubprotocolCheck&&
(e.options.skipSubprotocolCheck=!1);void 0===e.options.skipSubprotocolAnnounce&&(e.options.skipSubprotocolAnnounce=!1);if(d)e.onConnect=d;else throw"onConnect handler required!";e.onHangup=c?c:function(b,d,c){a._debugconnect&&console.log(b,d,c)};e.connects=0;e.retryCount=0;a._connect(e)};a.launch=function(b,d,c){a.connect(b.wsuri,function(c){!b.appkey||""===b.appkey?c.authreq().then(function(){c.auth().then(function(b){d?d(c):a._debugconnect&&c.log("Session opened.")},c.log)},c.log):c.authreq(b.appkey,
    b.appextra).then(function(e){var g=null;"function"===typeof b.appsecret?g=b.appsecret(e):(g=a.deriveKey(b.appsecret,JSON.parse(e).authextra),g=c.authsign(e,g));c.auth(g).then(function(b){d?d(c):a._debugconnect&&c.log("Session opened.")},c.log)},c.log)},function(b,d,g){c?c(b,d,g):a._debugconnect&&a.log("Session closed.",b,d,g)},b.sessionConfig)};return a});ab._UA_FIREFOX=/.*Firefox\/([0-9+]*).*/;ab._UA_CHROME=/.*Chrome\/([0-9+]*).*/;ab._UA_CHROMEFRAME=/.*chromeframe\/([0-9]*).*/;ab._UA_WEBKIT=/.*AppleWebKit\/([0-9+.]*)w*.*/;ab._UA_WEBOS=/.*webOS\/([0-9+.]*)w*.*/;ab._matchRegex=function(c,g){var a=g.exec(c);return a?a[1]:a};
ab.lookupWsSupport=function(){var c=navigator.userAgent;if(-1<c.indexOf("MSIE")){if(-1<c.indexOf("MSIE 10"))return[!0,!0,!0];if(-1<c.indexOf("chromeframe")){var g=parseInt(ab._matchRegex(c,ab._UA_CHROMEFRAME));return 14<=g?[!0,!1,!0]:[!1,!1,!1]}if(-1<c.indexOf("MSIE 8")||-1<c.indexOf("MSIE 9"))return[!0,!0,!0]}else{if(-1<c.indexOf("Firefox")){if(g=parseInt(ab._matchRegex(c,ab._UA_FIREFOX))){if(7<=g)return[!0,!1,!0];if(3<=g)return[!0,!0,!0]}return[!1,!1,!0]}if(-1<c.indexOf("Safari")&&-1==c.indexOf("Chrome")){if(g=
        ab._matchRegex(c,ab._UA_WEBKIT))return-1<c.indexOf("Windows")&&"534+"==g||-1<c.indexOf("Macintosh")&&(g=g.replace("+","").split("."),535==parseInt(g[0])&&24<=parseInt(g[1])||535<parseInt(g[0]))?[!0,!1,!0]:-1<c.indexOf("webOS")?(g=ab._matchRegex(c,ab._UA_WEBOS).split("."),2==parseInt(g[0])?[!1,!0,!0]:[!1,!1,!1]):[!0,!0,!0]}else if(-1<c.indexOf("Chrome")){if(g=parseInt(ab._matchRegex(c,ab._UA_CHROME)))return 14<=g?[!0,!1,!0]:4<=g?[!0,!0,!0]:[!1,!1,!0]}else if(-1<c.indexOf("Android")){if(-1<c.indexOf("Firefox")||
    -1<c.indexOf("CrMo"))return[!0,!1,!0];if(-1<c.indexOf("Opera"))return[!1,!1,!0];if(-1<c.indexOf("CrMo"))return[!0,!0,!0]}else if(-1<c.indexOf("iPhone")||-1<c.indexOf("iPad")||-1<c.indexOf("iPod"))return[!1,!1,!0]}return[!1,!1,!1]};
var WS = (function()
{
    var GosSocket = function(uri, config){

        /**
         * Holds the uri to connect to
         * @type {String}
         * @private
         */
        this._uri = uri;

        /**
         * Hold autobahn session reference
         * @type {Mixed}
         * @private
         */
        this._session = false;

        /**
         * Hold event callbacks
         * @type {Object}
         * @private
         */
        this._listeners = {};

        //calls the Gos Socket connect function.
        this.connect();
    };

    GosSocket.prototype.connect = function () {
        var that = this;

        ab.connect(this._uri,

            //Function on connect
            function(session){
                that.fire({type: "socket/connect", data: session });
            },

            //Function on disconnect / error
            function(code, reason){
                that._session = false;

                that.fire({type: "socket/disconnect", data: {code: code, reason: reason}});
            }
        );
    };

    /**
     * Adds a listener for an event type
     *
     * @param {String} type
     * @param {function} listener
     */
    GosSocket.prototype.on = function(type, listener){
        if (typeof this._listeners[type] == "undefined"){
            this._listeners[type] = [];
        }

        this._listeners[type].push(listener);
    };

    /**
     * Fires an event for all listeners.
     * @param {String} event
     */
    GosSocket.prototype.fire = function(event){
        if (typeof event == "string"){
            event = { type: event };
        }
        if (!event.target){
            event.target = this;
        }

        if (!event.type){  //falsy
            throw new Error("Event object missing 'type' property.");
        }

        if (this._listeners[event.type] instanceof Array){
            var listeners = this._listeners[event.type];
            for (var i=0, len=listeners.length; i < len; i++){
                listeners[i].call(this, event.data);
            }
        }
    };

    /**
     * Removes a listener from an event
     *
     * @param {String} type
     * @param {function} listener
     */
    GosSocket.prototype.off = function(type, listener){
        if (this._listeners[type] instanceof Array){
            var listeners = this._listeners[type];
            for (var i=0, len=listeners.length; i < len; i++){
                if (listeners[i] === listener){
                    listeners.splice(i, 1);
                    break;
                }
            }
        }
    };

    return {
        connect: function(uri)
        {
            return new GosSocket(uri);
        }
    }

})();
document.addEventListener('DOMContentLoaded', function () {
    if (!Notification) {
        if (Notification.permission !== "granted")
            Notification.requestPermission();
    }
});

$(document).ready(function () {
    $('#messages-archive').niceScroll();
});

var messenger = {
    notification: function (payload, playSound) {
        that = this;
        $('#messeges > :not(.messenger-notification)').remove();
        $("#messeges").loadTemplate(
            $("#messenger-notification"),
            {
                author: payload.from,
                message: emojione.shortnameToImage(payload.message)
            },
            {
                prepend: true,
                success: function () {
                    $('#messeges > .messenger-notification:nth-of-type(3)').remove();
                    if (playSound === undefined || playSound === true) {
                        that.playSound();
                    }
                }
            }
        );

        $("#messages-archive").loadTemplate(
            $("#messenger-notification"),
            {
                author: payload.from,
                message: emojione.shortnameToImage(payload.message)
            },
            { prepend: true }
        );
    },
    playSound: function () {
        var audio = new Audio('/sounds/telegram.mp3');
        audio.play();
    }
};

$('button.show-messages-archive').click(function (event) {
    $('div#messages-archive').slideToggle();
    $('.messenger .plus').toggleClass('opened');
    $('.messenger .plus').text() == '+' ? $('.messenger .plus').text('x') : $('.messenger .plus').text('+');
});
function deleteAllCookies() {
    var cookies = document.cookie.split(";");

    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
}

var socket = WS.connect('ws://' + soho + ':' + sopo);
var session;

socket.on('socket/connect', function(sess) {
    session = sess;
    //TODO: move this line to check game rpc
    $('a.game').removeClass('disabled');
    messenger.notification({'message': 'Successfully Connected', 'from': 'Bot'});

    session.subscribe('chat/public', function(uri, payload) {
        if (payload.constructor.toString().indexOf("Array") > -1) {
            $.each(payload, function (index, value) {
                messenger.notification(value);
            });
        }

        switch (payload.type) {
            case 'notification':
                messenger.notification(payload);
                break;
            case 'game_invitation':
                $(document).triggerHandler('game_invitation', payload);
                break;
            case 'answer_to_game_invitation':
                $(document).triggerHandler('answer_to_game_invitation', payload);
                break;
            case 'game_status':
                $('#current-game').trigger('game_status', payload);
                break;
            case 'friend_invitation':
                $(document).triggerHandler('friend_invitation', payload);
                break;
            case 'remove_friend':
                $(document).triggerHandler('remove_friend', payload);
                break;
            case 'answer_to_friend_invitation':
                $(document).triggerHandler('answer_to_friend_invitation', payload);
                break;
            case 'session':
                deleteAllCookies();
                document.location.reload();
                break;
            case 'friend_status':
                $('.friends-list').trigger('friend_status', payload);
                break;
        }
    });
});

socket.on('socket/disconnect', function (error) {
    messenger.notification({'message': error.reason, 'from': 'Bot'});
    $('a.game').addClass('disabled');
});
var avatars = (function () {
    var updateSrc = function () {
        var images = $.jStorage.get('avatars');
        var not_loaded = $('img.avatar:not([src]), img.avatar[src$="default.png"]');
        $.each(not_loaded, function (index, image) {
            var username = $(image).data('username');
            var size = $(image).data('size');

            if (images[username] != undefined) {
                $(image).attr('src', avatars.getUrl(images[username], size));
            }
        });
    };

    var avatar = function () {
        if ($.jStorage.index().indexOf('avatars') === -1) {
            $.jStorage.set('avatars', {});
            $.jStorage.setTTL('avatars', 86400000);
        }

        this._new_avatars = [];
        this._baseUrl = "https://www.gravatar.com/avatar/";
    };

    avatar.prototype.getUrl = function (url, size) {
        return this._baseUrl + url + '?d=identicon' + "&s=" + size;
    };

    avatar.prototype.loadNewImage = function () {
        var avatars = $.jStorage.get('avatars');
        var that = this;
        $.post('/user/avatars', {usernames: this._new_avatars}, function(data, status, xhr) {
            if (status === 'success') {
                $.each(data, function (username, url) {
                    avatars[username] = url;
                });

                that._new_avatars = [];
                var ttl = $.jStorage.getTTL('avatars');
                $.jStorage.set('avatars', avatars);
                $.jStorage.setTTL('avatars', ttl);

                updateSrc();
            }
        });
    };

    avatar.prototype.load = function () {
        var images = $('img.avatar');
        var that = this;
        $.each(images, function (key, image) {
            var username = $(image).data('username');
            var size = $(image).data('size');
            if (username == undefined || size == undefined) {
                console.log('can not load avatar, size or username is not defined', image);
                return true;
            }

            if (!$.jStorage.get('avatars').hasOwnProperty(username)) {
                that._new_avatars.push(username);
            }
        });

        if (that._new_avatars.length > 0) {
            this.loadNewImage();
        } else {
            updateSrc();
        }
    };

    return new avatar();
})();

$(document).on('DOMNodeInserted', function(e) {
    if ($(e.target).has('.avatar').length || $(e.target).hasClass('avatar')) {
        avatars.load();
    }
});
var friends = (function () {
    var friends = [];

    var obj = function () {
        var that = this;
        socket.on('socket/connect', function (session) {
            session.call('friend/friends_and_invitations').then(
                function (result) {
                    //load friends list
                    $.each(result.data.friends, function (friend, status) {
                        that.addToFriendList(friend);
                    });

                    //load suggests list
                    $.each(result.data.suggests, function (index, suggest) {
                        addToSuggestList(suggest);
                    });

                    //load requests list
                    $.each(result.data.requests, function (index, request) {
                        addToRequestList(request);
                    });
                },
                function(error, desc) {
                    messenger.notification({from: 'Bot', message: 'Sorry, a error occur, if it occur again, please report to us.'});
                    messenger.notification({from: 'Bot', message: error + ', ' + desc});
                }
            );
        });

        socket.on('socket/disconnect', function(error) {
            that.clearFriendList();
            clearRequestList();
            clearSuggestList();
        });
    };


    obj.prototype.addToFriendList = function (username) {
        friends.push(username);
        $(document).triggerHandler('friends.update', {friends: friends});
        $('.friends-list').loadTemplate(
            $('#friend-list-item'),
            {username: username},
            {prepend: true}
        );
    };

    obj.prototype.removeFromFriendList = function (username) {
        var index = friends.indexOf(username);
        if (index > -1) {
            friends.slice(index, 1);
        }
        $(document).triggerHandler('friends.update', {friends: friends});
        $('.friend-list-item[data-username="' + username + '"]').remove();
    };

    obj.prototype.clearFriendList = function () {
        friends = [];
        $('.friend-list-item').remove();
    };

    obj.prototype.getFriends = function () {
        return friends;
    };

    return new obj();
})();

//accept or reject freind request
function sendAnswerToFriendInvitation(username, answer) {
    session.call('friend/answer_to_friend_request', {answer: answer, username: username}).then(
        function(result) {
            if (result.status.code == 10 && answer) {
                friends.addToFriendList(username);
                userStatus.checkStatus(username);
            }

            removeFromSuggestList(username);
            messenger.notification({from: 'Bot', message: result.status.message});
        }, function(error, desc) {
            messenger.notification({from: 'Bot', message: 'Sorry, a error occur, if it occur again, please report to us.'});
            messenger.notification({from: 'Bot', message: error + ', ' + desc});
        }
    );
}

function addToSuggestList(username) {
    $('.friend-suggests').loadTemplate(
        $("#friend-suggest"),
        {username: username},
        {prepend: true}
    );
}

function removeFromSuggestList(username) {
    $('.friend-suggest[data-username="' + username + '"]').remove();
}

function clearSuggestList() {
    $('.friend-suggest').remove();
}

//show friend request in modal
function addToRequestList(username) {
    $('.friend-requests').loadTemplate(
        $("#friend-request"),
        {username: username},
        {prepend: true}
    );

    $('#count-of-friend-request').text($('#count-of-friend-request').text() + 1);
}

function removeFromRequestList(username) {
    $('.friend-request[data-username="' + username + '"]').remove();
    $('#count-of-friend-request').text($('#count-of-friend-request').text() - 1);
}

function clearRequestList() {
    $('.friend-request').remove();
    $('#count-of-friend-request').text(0);
}

// send a friend invitation
$('form#send-friend-request').submit(function(event) {
    event.preventDefault();
    var username = $('input#friend-username').val();
    $('input#friend-username').val('');

    session.call('friend/send_friend_request_to_username', {'username': username}).then(
        function(result) {
            if (result.status.code == 1) {
                addToRequestList(username);
            } else if (result.status.code == 10) {//users is friends
                removeFromRequestList(username);
                friends.addToFriendList(username);
            }

            messenger.notification({'from': 'Bot', 'message': result.status.message});

            $('#count-of-friend-request').text(result.data.count);

            if (result.status.code == -6) {
                messenger.notification({from: 'Bot', message: 'You must remove a user from list.'});
            }
        },
        function(error, desc) {
            messenger.notification({from: 'Bot', message: 'Sorry, a error occur, if it occur again, please report to us.'});
            messenger.notification({from: 'Bot', message: error + ', ' + desc});
        }
    );
});

//cancel friend invitation
$('.friend-requests').on('click', '.cancel-friend-request', function (event) {
    var root = $(this).closest('.friend-request');
    var username = $(root).data('username');
    session.call('friend/cancel_friend_request', {'username': username}).then(
        function (result) {
            removeFromRequestList(username);
            messenger.notification({'from': 'Bot', 'message': result.status.message});
        },
        function (error, desc) {
            messenger.notification({from: 'Bot', message: 'Sorry, a error occur, if it occur again, please report to us.'});
            messenger.notification({from: 'Bot', message: error + ', ' + desc});
        }
    );
});

//when a friend invitation is received
$(document).on('friend_invitation', function (event, payload) {
    if (payload.status == 'new') {
        //show browser notification
        new Notification(payload.from, {
            icon: '/web/images/icon.png',
            body: payload.message
        });

        //show in messenger
        $('#messeges *').remove();
        $("#messeges").loadTemplate(
            $("#messenger-friend-invitation"),
            {from: payload.from, message: payload.message}
        );
        messenger.playSound();

        //show in suggests
        addToSuggestList(payload.from);
    } else {
        removeFromSuggestList(payload.from);
        messenger.notification(payload);
    }
});

$(document).on('answer_to_friend_invitation', function (event, payload) {
    if (payload.answer == true) {
        friends.addToFriendList(payload.from);
        userStatus.checkStatus(payload.from);
    }

    removeFromRequestList(payload.from);
    messenger.notification({from: payload.from, message: payload.message});
});

$(document).on('remove_friend', function (event, payload) {
    friends.removeFromFriendList(payload.from);
    messenger.notification({from: payload.from, message: payload.message});
});

//answer to friend invitation
$('.friend-suggests, #messeges').on('click', '.answer-friend-suggest', function (event) {
    var username = $(this).parent().data('username');
    var answer = $(this).hasClass('btn-success') ? true : false;
    sendAnswerToFriendInvitation(username, answer);
});

//remove friend
$('#friends-list').on('click', '.remove-friend', function (event) {
    var root = $(this).closest('.friend-list-item');
    var username = $(root).data('username');
    session.call('friend/removeFriend', {'username': username}).then(
        function (result) {
            if (result.status.code == 1) {
                friends.removeFromFriendList(username);
            }
            messenger.notification({'from': 'Bot', 'message': result.status.message});
        },
        function (error, desc) {
            messenger.notification({from: 'Bot', message: 'Sorry, a error occur, if it occur again, please report to us.'});
            messenger.notification({from: 'Bot', message: error + ', ' + desc});
        }
    );
});
function getOpenedChatRoom(username) {
    if ($('.chat-rooms > .chat-room[data-username=' + username + ']').length) {
        return $('.chat-rooms > .chat-room[data-username=' + username + ']');
    }
}

function openChatRoom(username) {
    if (getOpenedChatRoom(username)) {
        return;
    }

    var data = {
        username: username,
        chat_room_id: 'chat-room-' + username,
        link_to_chat_room: '#chat-room-' + username,
        link_to_chat_content: '#chat-content-' + username,
        chat_content_id: 'chat-content-' + username
    };

    $('.chat-rooms').loadTemplate($('#chat-room'), data, {append: true});
    $('#chat-content-' + username + ' .card-block').niceScroll();
    $('#chat-content-' + username).collapse('toggle');

    loadLastMessage(username, 1);
}

function loadLastMessage(friend, page) {
    var w;
    if (typeof(Worker) !== "undefined") {
        if (typeof(w) == "undefined") {
            w = new Worker("/bundles/funprohome/js/deck/worker/load_chat_archive.js");
            w.postMessage({
                uri: 'ws://' + soho + ':' + sopo,
                myUsername: $.jStorage.get('myUsername'),
                myFriend: friend,
                template_send: $('#message-send-worker').html(),
                template_receive: $('#message-receive-worker').html(),
                page: page
            });
        }
        w.onmessage = function (e) {
            $('#chat-content-' + friend + ' .card-block').html(e.data);
            $('#chat-content-' + friend + ' .card-block').animate({scrollTop: $('#chat-content-' + friend + ' .message').last().position().top});
        };
    } else {
        session.call('user/get_chat_message', {username: friend, page: page}).then(
            function (result) {
                $.each(result.data.messages, function (index, message) {
                    showMessage(friend, PHPUnserialize.unserialize(message), 'prepend');
                });
                $('#chat-content-' + friend + ' .card-block').animate({scrollTop: $('#chat-content-' + friend + ' .message').last().position().top});
            },
            function (error, desc) {
                messenger.notification({from: 'Bot', message: 'Sorry, a error occur, if it occur again, please report to us.'});
                messenger.notification({from: 'Bot', message: error.toString() + ', ' + desc.toString()});
            }
        );
    }

    $('#chat-content-' + friend + ' .card-block').scrollTop($('#chat-content-' + friend + ' .card-block')[0].scrollHeight);
}

function sendMessage(event) {
    event.preventDefault();
    var root_node = $(this).closest('.chat-room');
    var username = $(root_node).data('username');
    var textbox = $(this).closest('.chat-room-messenger').find('.chat-room-message');
    var message = $(textbox).val();
    var now = new Date();
    $(textbox).val('');

    session.publish('chatroom/' + username, message);
    showMessage(username, {from: $.jStorage.get('myUsername'), message: message, time: now.getTime()/1000});
}

function showMessage(friend, payload, attachType) {
    attachType = attachType === undefined ? 'append' : attachType;
    var options = attachType === 'append' ? {append: true} : {prepend: true};
    var template = payload.from === $.jStorage.get('myUsername') ? $('#message-send') : $('#message-receive');
    var message = '<p>' + emojione.shortnameToImage(payload.message) + '</p>';
    var time = new Date(payload.time*1000);

    if ((($('#chat-content-' + friend + ' .message:last-child').is('.message-send') && payload.from == $.jStorage.get('myUsername'))
        || ($('#chat-content-' + friend + ' .message:last-child').is('.message-receive') && payload.from == friend)
        ) && (new Date($('#chat-content-' + friend + ' .message:last-child').data('time'))).getMinutes() == (new Date()).getMinutes()
    ) {
        $('#chat-content-' + friend + ' .message:last-child').find('.message-text p:last-child')
            [attachType]('<br>' + emojione.shortnameToImage(payload.message));
    } else {
        $('#chat-content-' + friend + ' .card-block').loadTemplate(
            template,
            {
                username: payload.from,
                message: emojione.shortnameToImage(message),
                timestamp: time,
                time: time.getHours() + ':' + time.getMinutes()
            },
            options
        );
    }

    $('#chat-content-' + friend + ' .card-block').scrollTop($('#chat-content-' + friend + ' .card-block')[0].scrollHeight);
}

socket.on('socket/connect', function (session)  {
    session.subscribe('chatroom/' + $.jStorage.get('myUsername'), function (uri, payload) {
        openChatRoom(payload.from);
        showMessage(payload.from, payload);
    });
});

//when user click on message button in friend list
$('.friends-list').on('click', '.open-chat-room', function (event) {
    event.preventDefault();
    var root_node = $(this).closest('.friend-list-item');
    var username = $(root_node).data('username');

    if ($(getOpenedChatRoom(username)).length) {
        $(getOpenedChatRoom(username)).collapse('toggle');
        return;
    } else {
        $('#friends-list').modal('toggle');
        openChatRoom(username);
    }
});

$('.chat-rooms').on('click', '.min-max', function (event) {
    $(this)
        .toggleClass('fa-minus')
        .toggleClass('fa-plus');
});

$('.chat-rooms').on('click', '.send-message', sendMessage);
$('.chat-rooms').on('submit', '.chat-room-messenger', sendMessage);
userStatus = (function (){
    var users = {};

    var updateStatus = function () {
        session.call('friend/friends').then(
            function (result) {
                $.each(result.data.friends, function (friend, status) {
                    if (users.hasOwnProperty(friend) && users[friend] == status) {
                        return true;
                    }

                    users[friend] = status;
                    userStatus.updateUI([friend]);
                });
            },
            function(error, desc) {
                messenger.notification({from: 'Bot', message: 'Sorry, a error occur, if it occur again, please report to us.'});
                messenger.notification({from: 'Bot', message: error + ', ' + desc});
            }
        );
    };

    var Status = function () {
        socket.on('socket/connect', updateStatus);
        setInterval(updateStatus, 180000);
    };

    Status.prototype.getStatus = function (username) {
        return users.hasOwnProperty(username) ? users[username] : 'offline';
    };

    Status.prototype.checkStatus = function(username) {
        if (!users.hasOwnProperty(username)) {
            updateStatus();
        }
    };

    Status.prototype.update = function (username, status) {
        users[username] = status;
        this.updateUI([username]);
    };

    Status.prototype.updateUI = function (usernames) {
        usernames = usernames !== undefined ? usernames : Object.keys(users);
        $.each(usernames, function (index, username) {
            var nodes = $('span.user-status[data-username="' + username + '"');
            $.each(nodes, function (index, node) {
                var oldStatus = $(node).data('status') ? $(node).data('status') : 'offline';
                $(node)
                    .removeClass(oldStatus)
                    .addClass(users[username])
                    .data('status', users[username]);
            });
        });
    };

    return new Status();
})();

$(document).on('DOMNodeInserted', function(e) {
    if ($(e.target).has('.user-status').length) {
        $.each($(e.target).find('span.user-status'), function (index, node) {
            var username = $(node).data('username');
            if (username === undefined) {
                return true;
            }
            var status = userStatus.getStatus(username);
            $(node)
                .data('status', status)
                .addClass(status);
        });
    }
});

$('.friends-list').on('friend_status', function (event, payload) {
    userStatus.update(payload.username, payload.status);
});


socket.on('socket/connect', function(sess) {
    userStatus.update($.jStorage.get('myUsername'), 'online');
});

socket.on('socket/disconnect', function (error) {
    userStatus.update($.jStorage.get('myUsername'), 'offline');
});
//TODO: create a class that capsulise gameInvitations and current active game

var currentGameTimer;

function showActiveGame() {
    session.call('games/get_active_game').then(
        function (result) {
            var data = result.data;
            if (result.status.code != 1) {
                return;
            }

            if (data.game.status == 'waiting') {
                if (data.game.owner === $.jStorage.get('myUsername')) {
                    $('#game-invitations').data('game-name', data.game.name);
                    $.each(data.invitations, function (username, answer) {
                        appendInvitation(username, answer);
                    });
                    $('#game-invitations').modal('toggle');
                    $('.cancel-invitations').css('display', 'inline');
                    $('input[name="turnTime"]').attr('disabled', 'disabled');
                    $('input[name="point"]').attr('disabled', 'disabled');
                } else {
                    $('#current-game-link').removeClass('hidden-xs-up');
                    $('#current-game').data('game-id', data.id);

                    var usernames = [data.game.owner];

                    $.each(data.invitations, function (key, value) {
                        if (value == 'accept') {
                            usernames.push(key);
                        }
                    });

                    $.each(usernames, function (index, username) {
                        $('.current-game').loadTemplate(
                            $('#current-game-members'),
                            {username: username},
                            {append: true}
                        );
                    });
                    $('#current-game').modal('toggle');
                }
            } else {
                removeInvitationsAndGame();
                var game = Seven.create(session, data.id);
            }
        },
        function (error, desc) {
            messenger.notification({from: 'Bot', message: 'Sorry, a error occur, if it occur again, please report to us.'});
            messenger.notification({from: 'Bot', message: error.toString() + ', ' + desc.toString()});
        }
    );
}

function appendInvitation(username, answer) {
    $(".game_invited_users").loadTemplate(
        $("#game_invited_user"),
        {username: username},
        {
            append: true,
            success: function () {
                if (answer == 'accept') {
                    $('.game_invited_user[data-username="'+username+'"] .user-answer')
                        .addClass('fa-check text-success');
                } else if (answer == 'reject') {
                    $('.game_invited_user[data-username="'+username+'"] .user-answer')
                        .addClass('fa-close text-danger');
                } else {
                    $('.game_invited_user[data-username="'+username+'"] .user-answer')
                        .addClass('fa-question text-info');
                }
            }
        }
    );
}

function removeInvitation(username) {
    $('.game_invited_user[data-username="' + username + '"]').remove();
}

function removeInvitationsAndGame() {
    $('.game_invited_users').children().remove();
    $('#game-invitations').removeData('game-name');
    //$('#game_invitation_expire').text(moment.duration(0, "seconds").format("mm:ss"));
    $('input[name="turnTime"]').removeAttr('disabled');
    $('input[name="point"]').removeAttr('disabled');
}

function appendGameSuggest(gameId, owner, name, turnTime, point) {
    $('.game-suggests').loadTemplate(
        $('#game-suggest'),
        {
            invitedBy: owner,
            gameName: name,
            gameId: gameId,
            turnTime: turnTime,
            point: point
        },
        {append: true}
    );
}

function removeGameSuggest(gameId) {
    $('.game-suggest[data-game-id="' + gameId + '"]').remove();
}

// add all sent & receive invitations & resume active games
socket.on('socket/connect', function (session) {
    showActiveGame();

    session.call('games/get_my_invitations').then(
        function (result) {
            if (result.status.code == 1) {
                $.each(result.data.invitations, function (gameId, game) {
                    appendGameSuggest(gameId, game.owner, game.name, game.turnTime, game.point);
                });
            }
        },
        function (error, desc) {
            messenger.notification({from: 'Bot', message: 'Sorry, a error occur, if it occur again, please report to us.'});
            messenger.notification({from: 'Bot', message: error.toString() + ', ' + desc.toString()});
        }
    );
});

// clear all sent & receive invitations
socket.on('socket/disconnect', function (error) {
    $('.game_invited_users').children().remove();
    $('.game-suggests').children().remove();
    //clear active game
    $('.current-game').children().remove();
    $('#current-game .close').click();
});

$('#current-game').on('game_status', function (event, payload) {
    if (payload.status == 'update_players') {
        if ($('#current-game').data('game-id') != payload.gameId) {
            console.log('current game expired?');
            return;
        }

        $('.current-game').children().remove();
        $.each(payload.players, function (index, username) {
            $('.current-game').loadTemplate(
                $('#current-game-members'),
                {username: username},
                {append: true}
            );
        });
    } else if (payload.status == 'prepare') {
        clearInterval(currentGameTimer);
        $('.current-game').children().remove();
        $('#current-game .close').click();
        removeInvitationsAndGame();
        var game = Seven.create(session, payload.game.id);
    }
});

// open game invitations modal
$('a.game.create').click(function (event) {
    event.preventDefault();
    var current_game_type = $('#game-invitations').data('game-name');
    var game_type = $(this).data('game-name');

    if (current_game_type === undefined || game_type === current_game_type) {
        $('#game-invitations').data('game-name', game_type);
        $('#game-invitations').modal('toggle');
    } else {
        // show other modal and question from user, he will cancel current game?
        // if he cancel game, send request to server by call
    }
});

// update auto complete list of friends
$(document).on('friends.update', function (event, data) {
    $('#invite-player input[name="player_name"]').autocomplete({source: data.friends});
    $('#invite-player input[name="player_name"]').autocomplete("option", "appendTo", "#invite-player");
});

// invite a player to game by form
$('#invite-player').submit(function (event) {
    event.preventDefault();
    var username = $(this).find('input[name="player_name"]').val();
    var gameName = $('#game-invitations').data('game-name');
    var turnTime = $('input[name="turnTime"]').val();
    var point    = $('input[name="point"]').val();
    $(this).find('input[name="player_name"]').val('');

    session.call('games/invite_to_game', {'username': username, gameName: gameName, turnTime: turnTime, point: point}).then(
        function(result) {
            if (result['status']['code'] == 1) {
                $('input[name="turnTime"]').attr('disabled', 'disabled');
                $('input[name="point"]').attr('disabled', 'disabled');
                appendInvitation(username, 'waiting');
                $('.cancel-invitations').css('display', 'inline');
            }
            messenger.notification({from: 'Bot', message: result.status.message});
        },
        function(error, desc) {
            messenger.notification({from: 'Bot', message: 'Sorry, a error occur, if it occur again, please report to us.'});
            messenger.notification({from: 'Bot', message: error.toString() + ', ' + desc.toString()});
        }
    );
});

// when owner cancel a invitation
$('.game_invited_users').on('click', 'button.cancel-invitation', function (event) {
    var root = $(this).closest('.game_invited_user');
    var username = $(root).data('username');
    session.call('games/remove_invitation', {username: username}).then(
        function (result) {
            if (result.status.code == 1) {
                removeInvitationsAndGame();
            } else if (result.status.code == 2) {
                removeInvitation(username);
            }
            messenger.notification({from: 'Bot', message: result.status.message});
        },
        function (error, desc) {
            messenger.notification({from: 'Bot', message: 'Sorry, a error occur, if it occur again, please report to us.'});
            messenger.notification({from: 'Bot', message: error.toString() + ', ' + desc.toString()});
        }
    );
});

$('#cancel-invitations').click(function (event) {
    session.call('games/remove_invitations').then(
        function (result) {
            removeInvitationsAndGame();
            messenger.notification({from: 'Bot', message: result.status.message});
        },
        function (error, desc) {
            messenger.notification({from: 'Bot', message: 'Sorry, a error occur, if it occur again, please report to us.'});
            messenger.notification({from: 'Bot', message: error.toString() + ', ' + desc.toString()});
        }
    );
});

// when a game invitation is received
$(document).on('game_invitation', function (event, payload) {
    if (payload.status == 'new') {
        new Notification(payload.from, {
            icon: '/web/images/icon.png',
            body: payload.from + ' invite from you to play ' + payload.gameName
        });

        $('#messeges *').remove();
        $("#messeges").loadTemplate(
            $("#messenger-game-invitation"),
            {
                gameId: payload.gameId,
                from: payload.from,
                gameName: payload.gameName,
                turnTime: payload.turnTime,
                point: payload.point
            }
        );
        messenger.playSound();

        appendGameSuggest(payload.gameId, payload.from, payload.gameName, payload.turnTime, payload.point);
    } else {
        removeGameSuggest(payload.gameId);
        messenger.notification({from: payload.from, message: 'Sorry, i can not play with you now, perhaps we can play later.'});

        if ($('#current-game').data('game-id') == payload.gameId) {
            $('#current-game-link').addClass('hidden-xs-up');
            $('#game-invitations').removeData('game-name');
            $('.current-game').children().remove();

            $('#current-game .close').click();
            $('#current-game').removeData('game-id');
        }
    }
});

$('.game-suggests, #messeges').on('click', '.answer-game-suggest', function () {
    var gameId = $(this).parent().data('game-id');
    var answer = $(this).hasClass('btn-success') ? 'accept' : 'reject';
    session.call('games/answer_to_game_invitation', {gameId: gameId, answer: answer}).then(
        function (result) {
            messenger.notification({from: 'Bot', message: result.status.message});

            if (result.status.code === 1) {
                $('.game-suggest[data-game-id="' + gameId + '"]').remove();
                showActiveGame();
                //TODO: how can user expire invitation?
            }
        },
        function (error, desc) {
            messenger.notification({from: 'Bot', message: 'Sorry, a error occur, if it occur again, please report to us.'});
            messenger.notification({from: 'Bot', message: error.toString() + ', ' + desc.toString()});
        }
    );
});

$(document).on('answer_to_game_invitation', function (event, payload) {
    var icon = payload.answer === 'accept' ? 'fa-check text-success' : 'fa-close text-danger';
    $('.game_invited_user[data-username="' + payload.from + '"] span.user-answer')
        .removeClass('fa-question text-info')
        .addClass(icon);
});

$('#cancel_current_game').click(function (event) {
    var gameId = $('#current-game').data('game-id');
    var answer = 'reject';
    session.call('games/answer_to_game_invitation', {gameId: gameId, answer: answer}).then(
        function (result) {
            messenger.notification({from: 'Bot', message: result.status.message});
            removeGameSuggest(gameId);
            $('#current-game-link').addClass('hidden-xs-up');
            $('#game-invitations').removeData('game-name');
            $('.current-game').children().remove();

            $('#current-game .close').click();
            $('#current-game').removeData('game-id');
        },
        function (error, desc) {
            messenger.notification({from: 'Bot', message: 'Sorry, a error occur, if it occur again, please report to us.'});
            messenger.notification({from: 'Bot', message: error.toString() + ', ' + desc.toString()});
        }
    );
});

$('#startGame').click(function() {
    session.call('games/start').then(
        function (result) {
            $('.game-invitations').children().remove();
            $('#game-invitations').modal('toggle');
            $('#current-game .close').click();
            messenger.notification({from: 'Bot', message: result.status.message});
        },
        function (error, desc) {
            messenger.notification({from: 'Bot', message: 'Sorry, a error occur, if it occur again, please report to us.'});
            messenger.notification({from: 'Bot', message: error.toString() + ', ' + desc.toString()});
        }
    );
});
var Seven = (function () {
    var _gameId;
    var _session;
    var _this;
    var cardHeight;
    var cardWidth;
    var myCards = [];
    var seats = {};
    var countOfPlayersCards = {};
    var topCard;
    var turnTime;
    var currentTurn;

    var discardCard = function (player, topCard) {
        var seat = seats[player];
        var card = $('.varagh.seat' + seat).last();
        $(card).animate(
            {
                top: '48%',
                left: '50%',
                marginLeft: '10px',
                transform: 'rotateY(90deg)'
            },
            'slow',
            function () {
                $('.varagh.mid.reverse').remove();
                $(card).remove();
                drawTopCard(topCard);
            }
        );
    };

    var discardWrongCard = function (player, wrongCard) {
        var seat = seats[player];
        var oldCard = $('.varagh.seat' + seat).last();
        var card = $(Poker.getCardImage(cardHeight, wrongCard.charAt(0), wrongCard.substr(1)));
        card.attr('style', oldCard.attr('style'));
        card.addClass('varagh seat' + seat);

        oldCard.css('display', 'none');
        $('.deck-container').append(card);

        $(card).animate(
            {
                top: '48%',
                left: '50%',
                marginLeft: '10px'
            },
            1000,
            function () {
                $(card).animate(
                    {
                        top: oldCard.css('top'),
                        left: oldCard.css('left'),
                        marginLeft: oldCard.css('margin-left')
                    },
                    1000,
                    function () {
                        card.remove();
                        oldCard.css('display', 'inline');
                    }
                );
            }
        );
    };

    var connect = function () {
        _session.subscribe('game/seven/chat/' + _gameId, function (uri, payload) {
            switch (payload.type) {
                case 'notification':
                    if (typeof payload.message === 'string') {
                        messenger.notification({from: 'Bot', message: payload.message}, false);
                    } else {
                        payload.message.forEach(function (message) {
                            messenger.notification({from: 'Bot', message: message}, false);
                        });
                    }
                    break;
                case 'penalty':
                    payload.cards.forEach(function (cardName, index) {
                        if (!cardName) {
                            return;
                        }
                        var message = 'You get ' + getEmojiNameOfCard(cardName) + ' as penalty';
                        messenger.notification({from: 'Bot', message: message}, false);
                        drawMyPickedCard(cardName, index == (payload.cards.length - 1));
                    });
                    break;
                case 'playing':
                    //end previous turn
                    if (payload.player !== undefined) {
                        endTurn(seats[payload.player]);
                    }

                    if (payload.hasOwnProperty('cards') && payload.cards.length !== 0) {
                        $.each(payload.cards, function (username, count) {
                            //FIXME: when user can pick multiplie card, we need timeout?
                            if (username !== myUsername) {
                                if (countOfPlayersCards[username] < count) {
                                    var newCount = count - countOfPlayersCards[username];
                                    for (var i = 0; i < newCount; i++) {
                                        countOfPlayersCards[username] += 1;
                                        drawPickedCard(username);
                                    }
                                    var message = username + ' get ' + newCount + ' card as penalty';
                                    messenger.notification({from: 'Bot', message: message}, false);
                                } else if (countOfPlayersCards[username] > count) {
                                    countOfPlayersCards[username] = count;
                                }
                            }
                        });
                    }

                    if (payload.player !== undefined && payload.player !== myUsername) {
                        if (payload.topCard !== undefined) {
                            var message = payload.player + ' played ' + getEmojiNameOfCard(payload.topCard);
                            messenger.notification({from: 'Bot', message: message}, false);
                            discardCard(payload.player, payload.topCard);
                        } else if (payload.wrongCard !== undefined) {
                            discardWrongCard(payload.player, payload.wrongCard);
                        }
                    }

                    if (payload.nextTurn !== undefined) {
                        var till = (new Date()).getTime() + (turnTime * 1000);
                        currentTurn = payload.nextTurn;
                        startTurn(till);
                    }
                    break;
                case 'finish_round':
                    $.each(seats, function (username, seat) {
                        $('div.seat' + seat + ' img.avatar').parent().remove();
                        endTurn(seat);
                    });

                    clearGameScore();
                    updateGameScore(payload.roundScore, payload.previousScore, payload.finalScore);
                    $('#game-score').modal('toggle');

                    clearTurn();
                    $('.get-card').remove();
                    $('.varagh').remove();
                    removeInvitationsAndGame();

                    if (payload.finished) {
                        messenger.notification({from: 'Bot', message: 'Finish game'});

                        _session.unsubscribe('game/seven/chat/' + _gameId);
                    }

                    $('#chat-room-container').show();
                    break;
                case 'start_round':
                    $('#game-score .close').click();
                    readCards();
                    break;
            }
        });
    };

    var clearGameScore = function () {
        $('table.game-score thead').children().remove();
        $('table.game-score tbody').children().remove();
    };

    var updateGameScore = function (roundScores, previousScores, finalScores) {
        var finalScoresSorted = [];
        for (var username in finalScores) {
            finalScoresSorted.push([username, finalScores[username]])
        }

        finalScoresSorted.sort(function (a, b) {
            return a[1] - b[1]
        });

        var header_row = document.createElement('tr');
        var header_column = document.createElement('th');
        header_column.innerHTML = '#';
        header_row.appendChild(header_column);

        var current_score_row = document.createElement('tr');
        var current_score_title = document.createElement('td');
        current_score_title.innerHTML = 'Current Score';
        current_score_row.appendChild(current_score_title);

        var previous_score_row = document.createElement('tr');
        var previous_score_title = document.createElement('td');
        previous_score_title.innerHTML = 'Previous Score';
        previous_score_row.appendChild(previous_score_title);

        var final_score_row = document.createElement('tr');
        var final_score_title = document.createElement('td');
        final_score_title.innerHTML = 'Final Score';
        final_score_row.appendChild(final_score_title);

        finalScoresSorted.forEach(function (finalScore) {
            var username = finalScore[0];
            var score = finalScore[1];

            var th = document.createElement('th');
            th.innerHTML = username;
            header_row.appendChild(th);

            var current_score_td = document.createElement('td');
            current_score_td.innerHTML = roundScores[username];
            current_score_row.appendChild(current_score_td);

            var previous_score_td = document.createElement('td');
            var previous_score = previousScores.hasOwnProperty(username) ? previousScores[username] : 0;
            previous_score_td.innerHTML = previous_score;
            previous_score_row.appendChild(previous_score_td);

            var final_score_td = document.createElement('td');
            final_score_td.innerHTML = score;
            final_score_row.appendChild(final_score_td);

            messenger.notification({
                from: 'Bot',
                message: username + ': ' + previous_score.toString() + ' + ' + roundScores[username] + ' = ' + score.toString()
            });
        });

        $('table.game-score thead').append(header_row);
        $('table.game-score tbody').append(previous_score_row);
        $('table.game-score tbody').append(current_score_row);
        $('table.game-score tbody').append(final_score_row);
    };

    var getEmojiNameOfCard = function (cardName) {
        switch (cardName.charAt(0)) {
            case 'c':
                return ':clubs:' + cardName.substr(1).toUpperCase();
            case 'd':
                return ':diamonds:' + cardName.substr(1).toUpperCase();
            case 'h':
                return ':hearts:' + cardName.substr(1).toUpperCase();
            case 's':
                return ':spades:' + cardName.substr(1).toUpperCase();
        }
    };

    var adjust = function () {
        cardHeight = $(document).height() / 6;
        cardWidth = cardHeight / 1.333333;

        $('#mid-dropable-aria').height(cardHeight * 2);
        $('#mid-dropable-aria').width(cardWidth * 5);
    };

    var clearPlayerCards = function (username) {
        var seat = seats[username];
        $('img.varagh.seat' + seat).remove();
    };

    var drawAvatar = function (username) {
        var seat = seats[username];
        $('div.seat' + seat + ' img.avatar').parent().remove();

        var div = document.createElement('div');
        var img = document.createElement('img');
        var span = document.createElement('span');

        $(img).attr('alt', username);
        $(img).attr('title', username);
        $(img).data('username', username);
        $(img).data('size', cardHeight/2.2);
        $(img).addClass('img img-fluid rounded-circle img-thumbnail avatar');


        $(span).addClass('fa fa-circle user-status');
        $(span).attr('data-username', username);
        $(span).css('position', 'absolute');

        $(div).data('username', username);
        $(div).addClass('seat' + seat);
        $(div).append(span);
        $(div).append(img);

        if (seat == 0) {
            return;
        } else if (seat == 2) {
            $(div).css('margin-top', cardHeight * 1.1);
            $(div).css('margin-left', -25);
        } else if (seat == 3) {
            $(div).css('margin-left', cardWidth * 1.1);
            //55 menu height, 25 half of image size
            $(div).css('margin-top', -55 - cardHeight/2);
        } else if (seat == 1) {
            $(div).css('margin-right', cardWidth * 1.1);
            //55 menu height, 25 half of image size
            $(div).css('margin-top', -55 - cardHeight/2);
        }
        $('.deck-container').append(div);
    };

    var drawMyCard = function (name) {
        if (myCards.length > 15) {
            cardHeight = $(document).height() / 7;
        } else if (myCards.length > 20) {
            cardHeight = $(document).height() / 8;
        } else if (myCards.length > 25) {
            cardHeight = $(document).height() / 9;
        }

        var card = $(Poker.getCardImage(cardHeight, name.charAt(0), name.substr(1)));
        card.data('name', name);
        card.addClass('varagh seat0');
        var marginLeft = ($('.varagh.seat0').length - myCards.length / 2) * 40 / 100 * cardWidth;
        $(card).css('margin-left', marginLeft);
        card.draggable({
            containment: '.deck-container',
            revert: 'invalid',
            cursor: "move",
            opacity: 0.65,
            disabled: true,
            drag: function (event, ui) {
                if ($(this).data('position') === undefined) {
                    $(this).data('position', ui.position);
                }
            }
        });
        $('.deck-container').append(card);
    };

    var drawMyCards = function () {
        clearPlayerCards(myUsername);
        myCards.forEach(function (name) {
            drawMyCard(name);
        });

        if (currentTurn == myUsername) {
            $('.varagh.seat0').draggable('enable');
        } else {
            $('.varagh.seat0').draggable('disable');
        }
    };

    var drawPlayersCards = function () {
        $.each(countOfPlayersCards, function (username) {
            if (username === myUsername) {
                return true;
            }

            drawPlayerCards(username);
        });
    };

    var drawPlayerCards = function (username, force) {
        var seat = seats[username];
        if (!force && (countOfPlayersCards[username] == $('img.varagh.seat' + seat).length && $('img.varagh.seat' + seat).first().height() == cardHeight)) {
            return;
        }

        clearPlayerCards(username);
        for (var index = 0; index < countOfPlayersCards[username]; index++) {
            drawPlayerCard(username);
        }

        drawAvatar(username);
    };

    var drawPlayerCard = function (username) {
        var seat = seats[username];
        var index = $('.varagh.seat' + seat).length;
        var card = $(Poker.getBackImage(cardHeight));
        card.addClass('varagh seat' + seat);

        if (seat == 2) {
            //-2 = last card show in fullwidth
            var marginLeft = (index - 2 - countOfPlayersCards[username] / 2) * 20 / 100 * cardWidth;
            $(card).css('margin-left', marginLeft);
        } else {
            var height = cardHeight;
            if (countOfPlayersCards[username] > 10) {
                height = $(document).height() / 7;
            } else if (countOfPlayersCards[username] > 15) {
                height = $(document).height() / 8;
            } else if (countOfPlayersCards[username] > 20) {
                height = $(document).height() / 9;
            }
            //-2 = last card show in fullHeight, 55 is size of menu
            var marginTop = (index - 2 - countOfPlayersCards[username] / 2) * 20 / 100 * height - 55;
            $(card).css('margin-top', marginTop);
        }

        $('.deck-container').append(card);
    };

    var drawPickCardButton = function () {
        $('.get-card').remove();

        var getCard = document.createElement('button');
        var icon = document.createElement('span');
        $(icon).addClass('fa fa-arrow-down');
        $(getCard)
            .addClass('clear-button mid get-card')
            .css({'margin-left': cardWidth * -2, 'font-size': cardWidth/2})
            .click(pickCard)
            .append(icon);
        $('.deck-container').append(getCard);
    };

    var drawCardsStack = function () {
        $('img.varagh.mid').remove();
        for (var i = 0; i < 3; i++) {
            var midCard = $(Poker.getBackImage(cardHeight));
            midCard.addClass('varagh mid');
            $(midCard).css('margin-left', -(cardWidth + (i * 4)));
            $('.deck-container').append(midCard);
        }
    };

    var drawTopCard = function (topCard) {
        drawCardsStack();

        var reverseCard = $(Poker.getCardImage(cardHeight, topCard.charAt(0), topCard.substr(1)));
        reverseCard.addClass('varagh mid reverse');
        $(reverseCard).css('margin-left', '10px');
        $('.deck-container').append(reverseCard);
    };

    var drawMid = function () {
        drawPickCardButton();
        drawTopCard(topCard);
    };

    var endTurn = function (seat) {
        $('.seat' + seat + '-loading').finish();
    };

    var clearTurn = function () {
        $('.pick-color').children().remove();
    };

    var startTurn = function (till) {
        var seat = seats[currentTurn];
        var animation = {};
        var option;

        clearTurn();

        if (seat == 0 || seat == 2) {
            option = 'width';
        } else {
            option = 'height';
        }

        animation[option] = '100%';

        if (seat == 0) {
            $('.varagh.seat0').draggable('enable');
            myTurn();
        } else {
            $('.varagh.seat0').draggable('disable');
        }

        $('.seat' + seat + '-loading').animate(
            animation,
            till - (new Date()).getTime(),
            'linear',
            function () {
                $(this).css(option, '0');
            }
        );
    };

    var drawPickedCard = function (username) {
        var seat = seats[username];
        var card = $(Poker.getBackImage(cardHeight));
        $(card).addClass('varagh mid');
        $('.deck-container').append(card);
        $(card).switchClass('mid', 'seat' + seat);
        setTimeout(function () {
            drawPlayerCards(username, true);
        }, 500);
    };

    var drawMyPickedCard = function (cardName, redrawCards) {
        myCards.push(cardName);
        myCards.sort();

        var card = $(Poker.getCardImage(cardHeight, cardName.charAt(0), cardName.substr(1)));
        $(card).addClass('varagh mid');

        var marginLeft = ($('.varagh.seat0').length - myCards.length / 2) * 40 / 100 * cardWidth;
        $(card).css('margin-left', marginLeft);

        $('.deck-container').append(card);
        $(card).animate(
            {
                bottom: '8px',
                marginLeft: (myCards.indexOf(cardName) - myCards.length / 2) * 40 / 100 * cardWidth,
                transform: 'rotateY(90)'
            },
            'slow',
            function () {
                $(card).remove();
                if (redrawCards) {
                    drawMyCards();
                }
            }
        );
    };

    var pickCard = function () {
        _session.call('game/seven/get_card').then(
            function (result) {
                if (result.status.code == 1) {
                    if (result.data.cards.length == 0) {
                        return;
                    }

                    result.data.cards.forEach(function (cardName, index) {
                        drawMyPickedCard(cardName, index == (result.data.cards.length - 1));
                    });
                } else {
                    messenger.notification({from: 'Bot', message: result.status.message});
                }
            },
            function (error, desc) {
                messenger.notification({from: 'Bot', message: 'Sorry, a error occur, if it occur again, please report to us.'});
                messenger.notification({from: 'Bot', message: error.toString() + ', ' + desc.toString()});
            }
        );
    };

    var readCards = function () {
        _session.call('game/seven/get_game').then(
            function (result) {
                var unAlignedSeats = PHPUnserialize.unserialize(result.data.seats);
                if (Object.keys(unAlignedSeats).length == 2) {
                    $.each(unAlignedSeats, function (username, seat) {
                        seats[username] = username == myUsername ? 0 : 2;
                    });
                } else {
                    var offset = -1 * unAlignedSeats[myUsername];
                    $.each(unAlignedSeats, function (username, seat) {
                        seats[username] = (offset + seat) < 0 ?
                            (offset + seat + Object.keys(unAlignedSeats).length) : (offset + seat);
                    });
                }

                myCards = result.data.cards.owner;
                myCards.sort();
                countOfPlayersCards = result.data.cards.users;
                topCard = result.data.topCard;
                turnTime = result.data.turnTime;

                adjust();
                drawMyCards();
                drawPlayersCards();
                drawMid();

                if (result.data.status == 'playing') {
                    currentTurn = result.data.nextTurn;
                    startTurn(result.data.nextTurnAt * 1000);
                }
            },
            function (error, desc) {
                messenger.notification({from: 'Bot', message: 'Sorry, a error occur, if it occur again, please report to us.'});
                messenger.notification({from: 'Bot', message: error.toString() + ', ' + desc.toString()});
            }
        );
    };

    var myTurn = function () {
        $('#mid-dropable-aria').droppable({
            addClasses: false,
            drop: function(event, ui) {
                var oldCard = $('.varagh.mid.reverse');

                var playRequest = function (extra) {
                    _session.call('game/seven/play', {'card': ui.draggable.data('name'), 'extra': extra}).then(
                        function (result) {
                            if (result.status.code == 1) {
                                myCards.splice(myCards.indexOf(ui.draggable.data('name')), 1);
                                $(oldCard).css('z-index', 999);
                                $(ui.draggable).css('z-index', 1000);

                                $(ui.draggable).animate(
                                    {left: oldCard.css('left'), top: oldCard.css('top'), marginLeft: '10px'},
                                    'slow',
                                    function () {
                                        var cardName = ui.draggable.data('name');
                                        $('.varagh.mid.reverse[data-name!="' + cardName + '"]').remove();
                                        $(ui.draggable).remove();
                                        if (cardName.charAt(1) == 'j' && extra.hasOwnProperty('color')) {
                                            cardName = extra['color'] + 1;
                                        }
                                        drawTopCard(cardName);
                                    }
                                );
                            } else if (result.status.code == -2) {
                                //drawMyPickedCard(result.data.penalties);
                                //ui.draggable.animate($(ui.draggable).data('position'), 500);
                                //setTimeout(drawMyCards, 500);
                            } else if (result.status.code == -3) {
                                ui.draggable.animate($(ui.draggable).data('position'), 500);
                                setTimeout(drawMyCards, 500);
                                result.data.penalties.forEach(function (cardName, index) {
                                    if (!cardName) {
                                        return;
                                    }

                                    drawMyPickedCard(cardName, index == (result.data.penalties.length - 1));
                                });
                            }
                        },
                        function (error, desc) {
                            messenger.notification({from: 'Bot', message: 'Sorry, a error occur, if it occur again, please report to us.'});
                            messenger.notification({from: 'Bot', message: error.toString() + ', ' + desc.toString()});
                        }
                    );
                };

                var cardName = ui.draggable.data('name');
                var cardNumber = cardName.substr(1);
                if (cardNumber === 'j') {
                    var colors = ['h', 's', 'd', 'c'];
                    colors.forEach(function (color) {
                        var card = $(Poker.getCardImage(cardHeight, color, '1'));
                        $(card)
                            .data('name', color)
                            .addClass('varagh')
                            .css('padding-right', '5px')
                            .click(function () {
                                var color = $(this).data('name');
                                $('#pick-color').modal('toggle');
                                $('.pick-color').children().remove();
                                playRequest({color: color});
                            });
                        $('.pick-color').append(card);
                    });
                    $('#pick-color').modal('toggle');
                } else if (cardNumber === '2') {
                    if (Object.keys(seats).length== 2) {
                        $.each(seats, function (username) {
                            if (username == myUsername) {
                                return;
                            }

                            playRequest({target: username});
                            return;
                        });
                        return;
                    }

                    $.each(seats, function (username) {
                        if (username == myUsername) {
                            return;
                        }
                        var btn = document.createElement('button');
                        $(btn)
                            .text(username)
                            .addClass('btn btn-info')
                            .css('padding-right', '5px')
                            .click(function () {
                                var target = $(this).text();
                                $('#pick-color').modal('toggle');
                                $('.pick-color').children().remove();
                                playRequest({target: target});
                            });
                        $('.pick-color').append(btn);
                    });
                    $('#pick-color').modal('toggle');
                } else {
                    playRequest();
                }
            }
        });
    };

    var Game = function (session, gameId) {
        _gameId = gameId;
        _session = session;
        _this = this;
        readCards();
        connect();
        $('#chat-room-container').hide();
        $(window).resize(function(){
            adjust();
            drawMyCards();
            drawPlayersCards();
            drawMid();
        });
    };

    return {
        create: function (session, gameId) {
            return new Game(session, gameId);
        }
    };
})();
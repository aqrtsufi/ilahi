if(!self.define){let e,i={};const r=(r,d)=>(r=new URL(r+".js",d).href,i[r]||new Promise((i=>{if("document"in self){const e=document.createElement("script");e.src=r,e.onload=i,document.head.appendChild(e)}else e=r,importScripts(r),i()})).then((()=>{let e=i[r];if(!e)throw new Error(`Module ${r} didn’t register its module`);return e})));self.define=(d,n)=>{const a=e||("document"in self?document.currentScript.src:"")||location.href;if(i[a])return;let c={};const s=e=>r(e,a),f={module:{uri:a},exports:c,require:s};i[a]=Promise.all(d.map((e=>f[e]||s(e)))).then((e=>(n(...e),c)))}}define(["./workbox-28fe7b12"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"404.html",revision:"a8ae0acdf5a9128017e7673c8c075d1a"},{url:"assets/main--xp89H9k.js",revision:null},{url:"assets/main-Bd4fS7JO.css",revision:null},{url:"assets/QadiriWird-BHgNuqRk.css",revision:null},{url:"assets/QadiriWird-ct1XarA7.js",revision:null},{url:"index.html",revision:"e4fc73a00fbc38d6038b0f9f286ef318"},{url:"registerSW.js",revision:"b7a1fdec341b877815bcd6e43fc350c4"},{url:"100.png",revision:"0260c5436c8dffa1833fe23d9dc6f904"},{url:"1024.png",revision:"d63853390bc5627e1a590c639dbe64e6"},{url:"114.png",revision:"68ebfa9cdbdd04d2bdf0bce320c00a99"},{url:"120.png",revision:"4d6955a91a9dd5eb30609d9e54a0897b"},{url:"128.png",revision:"3d773fed89ba85f30e46ba9a9988b14e"},{url:"144.png",revision:"820799c468a571fa052d8ec45a6d29d3"},{url:"152.png",revision:"8487c16d0ed31ee558b6aca149c36317"},{url:"16.png",revision:"ef7cc1a8f44778ba93026a545a15e0f2"},{url:"167.png",revision:"a367497a7c8c9e5010037962e964a1fb"},{url:"180.png",revision:"f114a0d5469ca101edf204afe1e185ca"},{url:"192.png",revision:"7222579341d7ccb92d6b1653f6fa569e"},{url:"20.png",revision:"a8f7407cda70a435a69cb13d94cbe6c1"},{url:"256.png",revision:"a4e29e75e77efe4ae2258fa5ec8d93dd"},{url:"29.png",revision:"1a5d1839dda487222afa16d23777d21c"},{url:"32.png",revision:"61cd93f66f9dc6a992aaf731864d5938"},{url:"40.png",revision:"0382451de4234b8ab046ab21d85df745"},{url:"48.png",revision:"3decf9dd83505888c7672f836fb7770a"},{url:"50.png",revision:"cc8e60553eb600d68d9ab5dffe33bbd1"},{url:"512.png",revision:"02a76e9181cdc522b639b48261311599"},{url:"57.png",revision:"9df5e733e30c33a1b6e36a0f924b3c1d"},{url:"58.png",revision:"0895114bdbab6909d0dd5e0c951d1ada"},{url:"60.png",revision:"305ddfff4598738725d9d6d406b3f2bf"},{url:"64.png",revision:"d30af1e5a174ebafe1ede444e1b1e115"},{url:"72.png",revision:"5a239072d36c1c1f4d350840b0add7dd"},{url:"76.png",revision:"68e447963b1c6998c6528e820f165910"},{url:"80.png",revision:"d02174e4186a9cb9ec0a9f4844527058"},{url:"87.png",revision:"0f457107149ecdef0a50c3be8ebe120f"},{url:"96.png",revision:"3b4a3a7198dd06c76cc3c4afef0eb42d"},{url:"manifest.webmanifest",revision:"6d6e556a90e8539b0c7c8b5b786716ce"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));

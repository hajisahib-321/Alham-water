// نسخه کش: هر بار index.html را تغییر دادید، این عدد را بالا ببرید (مثلاً elham-v2)
const V='elham-v1';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET')return;
  if(r.mode==='navigate'){
    e.respondWith((async()=>{
      const c=await caches.open(V);
      const hit=await c.match('./index.html');
      const upd=fetch('./index.html',{cache:'no-cache'}).then(res=>{if(res&&res.ok)c.put('./index.html',res.clone());return res;}).catch(()=>null);
      e.waitUntil(upd);
      return hit||(await upd)||new Response('آفلاین هستید و برنامه هنوز ذخیره نشده است.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
    })());
    return;
  }
  e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{
    if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp));}
    return res;
  }).catch(()=>hit)));
});

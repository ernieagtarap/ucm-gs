// God’s Story — offline support. The page itself is always fetched fresh when online;
// audio, icons and PDFs are served from the cache and refreshed in the background.
const CACHE='gods-story-v2';
const CORE=['./','manifest.webmanifest','icons/apple-touch-icon.png','icons/icon-192.png','icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);if(u.origin!==location.origin||u.searchParams.has('fresh'))return;
  const page=r.mode==='navigate'||u.pathname.endsWith('/')||u.pathname.endsWith('/index.html');
  if(page){
    e.respondWith(fetch(r,{cache:'no-store'}).then(res=>{if(res&&res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put('./',copy))}return res})
      .catch(()=>caches.match('./').then(hit=>hit||caches.match(r))));
    return;
  }
  e.respondWith(caches.match(r).then(hit=>{
    const net=fetch(r).then(res=>{if(res&&res.ok&&res.type==='basic'){const copy=res.clone();caches.open(CACHE).then(c=>c.put(r,copy))}return res}).catch(()=>hit);
    return hit||net;
  }));
});

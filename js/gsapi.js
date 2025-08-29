// ====== KONFIG ======
const API_BASE = 'https://script.google.com/macros/s/AKfycbw7YiMy8fLh_q5qk_1OpMv4SjO9XVJsTzSO1w7km2XMCv4RYjxdKHMJYNRU9EclY_fH/exec'; // contoh: https://script.google.com/macros/s/.../exec
const fmtIDR = v => new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR'}).format(v||0);

// ====== API HELPERS ======
async function apiGet(action, params={}){
  const url = new URL(API_BASE);
  url.searchParams.set('action', action);
  Object.entries(params).forEach(([k,v])=> url.searchParams.set(k,v));
  const r = await fetch(url.toString(), {method:'GET'});
  const j = await r.json(); if(!j.ok) throw new Error(j.error||'API error'); return j.data;
}
async function apiPost(action, body={}){
  const r = await fetch(API_BASE, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({action, ...body})});
  const j = await r.json(); if(!j.ok) throw new Error(j.error||'API error'); return j.data;
}

// ====== COOKIE CART (tanpa localStorage) ======
function setCookie(k,v,days=7){ const d=new Date(); d.setTime(d.getTime()+days*864e5); document.cookie=`${k}=${encodeURIComponent(v)}; expires=${d.toUTCString()}; path=/; SameSite=Lax`; }
function getCookie(k){ return document.cookie.split('; ').reduce((o,p)=>{const [a,...b]=p.split('=');o[a]=decodeURIComponent(b.join('='));return o;},{})[k]; }
function getCart(){ try{ return JSON.parse(getCookie('cart')||'[]'); }catch{ return []; } }
function saveCart(items){ setCookie('cart', JSON.stringify(items)); }

// ====== FILE → BASE64 (kompres) ======
async function fileToBase64Compressed(file, maxW=1200, quality=0.8){
  const img = new Image(); const fr=new FileReader();
  await new Promise(res=>{ fr.onload=()=>{ img.src=fr.result; res(); }; fr.readAsDataURL(file); });
  await new Promise(res=>{ img.onload=res; });
  const ratio = Math.min(1, maxW/img.width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.width*ratio); canvas.height = Math.round(img.height*ratio);
  const ctx = canvas.getContext('2d'); ctx.drawImage(img,0,0,canvas.width,canvas.height);
  return canvas.toDataURL('image/jpeg', quality);
}

// ====== GSAP Reveal (opsional, otomatis aktif jika gsap tersedia) ======
window.addEventListener('DOMContentLoaded', ()=>{
  if(window.gsap && window.ScrollTrigger){
    gsap.registerPlugin(ScrollTrigger);
    document.querySelectorAll('[data-reveal]').forEach(el=>{
      gsap.fromTo(el,{y:16,opacity:0},{y:0,opacity:1,duration:.6,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 90%'}});
    });
  }
});

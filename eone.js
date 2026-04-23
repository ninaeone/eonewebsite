/* ═══════════════════════════════════════════
   EONE — Master JS
   Nav · Carousel · Live Listings from API
   ═══════════════════════════════════════════ */

const API = 'https://script.google.com/macros/s/AKfycbyHrwwVKhXNwAV54j051pdQcXRfp7UxcwhB_5L4diCAwmQr8syMR6XD73_ov5lYQUP9/exec';


// ── WORLD CARD PHOTOS — load reliably ────────
(function() {
  const worlds = [
    { sel: '.world-re', url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80', fallback: 'https://images.unsplash.com/photo-1582407947304-fd86f28f3e75?auto=format&fit=crop&w=1200&q=80' },
    { sel: '.world-wa', url: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=1200&q=80', fallback: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1200&q=80' },
  ];
  worlds.forEach(({sel, url, fallback}) => {
    const el = document.querySelector(sel);
    if (!el) return;
    const img = new Image();
    img.onload = () => { el.style.backgroundImage = `url('${url}')`; };
    img.onerror = () => {
      const img2 = new Image();
      img2.onload = () => { el.style.backgroundImage = `url('${fallback}')`; };
      img2.src = fallback;
    };
    img.src = url;
  });
})();

// ── NAV ──────────────────────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => nav?.classList.toggle('solid', window.scrollY > 60), {passive:true});
document.getElementById('burger')?.addEventListener('click', () => document.getElementById('drawer')?.classList.toggle('open'));
document.querySelectorAll('.drawer a').forEach(a => a.addEventListener('click', () => document.getElementById('drawer')?.classList.remove('open')));

// ── HELPERS ──────────────────────────────────
function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function fmt(v) {
  if (!v) return '';
  const n = Number(String(v).replace(/[^0-9.]/g,''));
  return n ? 'AED ' + n.toLocaleString('en-US') : String(v);
}

// ── BUILD CARD ────────────────────────────────
function buildCard(r) {
  const rent  = r._type === 'RENT';
  const excl  = String(r['Exclusivity']||'').toLowerCase().includes('exclusive');
  const pf    = r['PF Link'] || '';
  const href  = pf && pf.startsWith('http') ? pf : 'https://www.propertyfinder.ae/en/broker/eone-prime-properties-l-l-c-s-o-c-v2-179995';
  const price = fmt(r['Price']);
  const bldg  = esc(r['Building'] || r['Location'] || 'Dubai Property');
  const loc   = esc(r['Location'] || '');
  const type  = esc(r['Property Type'] || r['Unit Type'] || '');
  const ref   = esc(r['Reference'] || '');
  const beds  = r['# Bed']  || '';
  const baths = r['# Bath'] || '';
  const size  = r['Size']   || r['Size sqft'] || '';
  const furn  = r['Furnishing'] || r['Furnishing Type'] || '';
  const photo = r['Photo URL'] || '';

  const imgHtml = photo
    ? `<img src="${esc(photo)}" alt="${bldg}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="card-img-ph" style="display:none">🏙️</div>`
    : `<div class="card-img-ph">🏙️</div>`;

  return `<a class="card" href="${esc(href)}" target="_blank" rel="noopener">
    <div class="card-img">
      ${imgHtml}
      <div class="badge badge-type${rent?' rent':''}">${rent?'RENT':'SALE'}</div>
      ${excl?`<div class="badge badge-excl">Exclusive</div>`:''}
      ${pf?`<div class="badge badge-pf">PF ✓</div>`:''}
    </div>
    <div class="card-body">
      ${ref?`<div class="card-ref">${ref}</div>`:''}
      <div class="card-title">${bldg}</div>
      <div class="card-sub">${loc}${loc&&type?' · ':''}${type}</div>
      <div class="card-specs">
        ${beds ?`<div class="spec"><span class="spec-val">${esc(String(beds))}</span><span class="spec-key">Beds</span></div>`:''}
        ${baths?`<div class="spec"><span class="spec-val">${esc(String(baths))}</span><span class="spec-key">Baths</span></div>`:''}
        ${size ?`<div class="spec"><span class="spec-val">${esc(String(size))}</span><span class="spec-key">Sq Ft</span></div>`:''}
        ${furn ?`<div class="spec"><span class="spec-val" style="font-size:10px">${esc(furn)}</span><span class="spec-key">Furnish</span></div>`:''}
      </div>
      <div class="card-foot">
        <div>
          <div class="card-price">${price||'Price on Request'}${rent&&price?'<span style="font-size:.65em;color:#bbb"> /yr</span>':''}</div>
          <div class="card-price-lbl">${rent?'Per Year':'Asking Price'}</div>
        </div>
        <span class="card-arr">↗</span>
      </div>
    </div>
  </a>`;
}

// ── CAROUSEL ─────────────────────────────────
let carData = [], carIdx = 0;

function vis() {
  const w = window.innerWidth;
  if (w < 600) return 1;
  if (w < 900) return 2;
  if (w < 1100) return 3;
  return 4;
}

function cardW() {
  const c = document.querySelector('#carTrack .card');
  return c ? c.getBoundingClientRect().width + 1 : 300;
}

function renderCar(data) {
  const track = document.getElementById('carTrack');
  if (!track) return;
  carData = data; carIdx = 0;
  track.innerHTML = data.map(buildCard).join('');
  updateCar();
}

function updateCar() {
  const track = document.getElementById('carTrack');
  const prev  = document.getElementById('carPrev');
  const next  = document.getElementById('carNext');
  if (!track) return;
  const max = Math.max(0, carData.length - vis());
  carIdx = Math.max(0, Math.min(carIdx, max));
  track.style.transform = `translateX(-${carIdx * cardW()}px)`;
  if (prev) prev.disabled = carIdx === 0;
  if (next) next.disabled = carIdx >= max;
}

document.getElementById('carPrev')?.addEventListener('click', () => { carIdx = Math.max(0, carIdx-1); updateCar(); });
document.getElementById('carNext')?.addEventListener('click', () => { carIdx = Math.min(Math.max(0, carData.length - vis()), carIdx+1); updateCar(); });
window.addEventListener('resize', updateCar);

// Touch
let tx = 0;
document.getElementById('carOuter')?.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, {passive:true});
document.getElementById('carOuter')?.addEventListener('touchend', e => {
  const dx = tx - e.changedTouches[0].clientX;
  if (Math.abs(dx) > 50) { dx > 0 ? document.getElementById('carNext')?.click() : document.getElementById('carPrev')?.click(); }
});

// ── LOAD LISTINGS (carousel on home) ─────────
async function loadCarousel() {
  try {
    const res  = await fetch(API + '?action=getListings');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    if (!data.ok || !data.listings?.length) throw new Error('No listings');
    renderCar(data.listings);
    console.log(`✓ ${data.listings.length} listings loaded`);
  } catch(e) {
    console.warn('API failed, using demo:', e.message);
    renderCar(getDemos());
  }
}

// ── LOAD LISTINGS (properties page grid) ─────
let allProps = [], activeTab = 'all';

async function loadPropsPage() {
  const grid = document.getElementById('propsGrid');
  if (!grid) return;
  try {
    const res  = await fetch(API + '?action=getListings');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    if (!data.ok) throw new Error(data.error);
    allProps = data.listings || [];
    document.getElementById('fcount').textContent = allProps.length + ' listing' + (allProps.length !== 1 ? 's' : '');
    renderGrid(allProps);
  } catch(e) {
    console.warn('Props page API failed:', e.message);
    allProps = getDemos();
    renderGrid(allProps);
  }
}

function renderGrid(items) {
  const grid  = document.getElementById('propsGrid');
  const empty = document.getElementById('emptyState');
  if (!grid) return;
  if (!items.length) {
    grid.style.display = 'none';
    if (empty) empty.style.display = 'block';
    return;
  }
  grid.style.display = 'grid';
  if (empty) empty.style.display = 'none';
  grid.innerHTML = items.map(buildCard).join('');
}

function filterProps() {
  const q  = (document.getElementById('fsearch')?.value||'').toLowerCase().trim();
  const bd = document.getElementById('fbeds')?.value || '';
  const fn = document.getElementById('ffurn')?.value || '';
  const out = allProps.filter(r => {
    const t = r._type || 'SALE';
    const e = String(r['Exclusivity']||'').toLowerCase();
    if (activeTab==='sale' && t!=='SALE') return false;
    if (activeTab==='rent' && t!=='RENT') return false;
    if (activeTab==='exclusive' && !e.includes('exclusive')) return false;
    if (q) {
      const hay = [r['Building'],r['Location'],r['Reference'],r['Property Type'],r['Unit Type']].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (bd) { const b = String(r['# Bed']||'').trim(); if (bd==='5'?parseInt(b)<5:b!==bd) return false; }
    if (fn && (r['Furnishing']||r['Furnishing Type']||'') !== fn) return false;
    return true;
  });
  const cnt = document.getElementById('fcount');
  if (cnt) cnt.textContent = out.length + ' listing' + (out.length!==1?'s':'');
  renderGrid(out);
}

window.resetFilters = function() {
  ['fsearch','fbeds','ffurn'].forEach(id => { const el=document.getElementById(id); if(el) el.value=''; });
  activeTab = 'all';
  document.querySelectorAll('.ftab').forEach(t => t.classList.toggle('on', t.dataset.tab==='all'));
  filterProps();
};

document.querySelectorAll('.ftab').forEach(t => t.addEventListener('click', () => {
  document.querySelectorAll('.ftab').forEach(x => x.classList.remove('on'));
  t.classList.add('on'); activeTab = t.dataset.tab; filterProps();
}));
['fsearch','fbeds','ffurn'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', filterProps);
  document.getElementById(id)?.addEventListener('change', filterProps);
});

// ── DEMO DATA ─────────────────────────────────
function getDemos() {
  return [
    {_type:'SALE','Reference':'EXC-001','Building':'Signature Frond Villa','Location':'Palm Jumeirah','Property Type':'Villa','# Bed':'6','# Bath':'7','Size':'12,000','Furnishing':'Furnished','Price':'68000000','Exclusivity':'Exclusive','PF Link':'https://www.propertyfinder.ae/en/broker/eone-prime-properties-l-l-c-s-o-c-v2-179995'},
    {_type:'SALE','Reference':'EXC-002','Building':'Burj Khalifa Boulevard','Location':'Downtown Dubai','Property Type':'Penthouse','# Bed':'4','# Bath':'5','Size':'6,800','Furnishing':'Furnished','Price':'42500000','PF Link':'https://www.propertyfinder.ae/en/broker/eone-prime-properties-l-l-c-s-o-c-v2-179995'},
    {_type:'RENT','Reference':'EXC-003','Building':'Golf Estate Mansion','Location':'Emirates Hills','Property Type':'Mansion','# Bed':'8','# Bath':'9','Size':'18,000','Furnishing':'Unfurnished','Price':'2500000','Exclusivity':'Exclusive','PF Link':'https://www.propertyfinder.ae/en/broker/eone-prime-properties-l-l-c-s-o-c-v2-179995'},
    {_type:'SALE','Reference':'EXC-004','Building':'The Index Tower','Location':'DIFC','Property Type':'Apartment','# Bed':'3','# Bath':'4','Size':'3,400','Furnishing':'Furnished','Price':'18000000','PF Link':'https://www.propertyfinder.ae/en/broker/eone-prime-properties-l-l-c-s-o-c-v2-179995'},
    {_type:'RENT','Reference':'EXC-005','Building':'Waterfront Reserve','Location':'Jumeirah Bay','Property Type':'Villa','# Bed':'7','# Bath':'8','Size':'14,500','Furnishing':'Furnished','Price':'800000','Exclusivity':'Exclusive','PF Link':'https://www.propertyfinder.ae/en/broker/eone-prime-properties-l-l-c-s-o-c-v2-179995'},
    {_type:'SALE','Reference':'EXC-006','Building':'Cavalli Casa Tower','Location':'Dubai Marina','Property Type':'Apartment','# Bed':'3','# Bath':'4','Size':'2,800','Furnishing':'Furnished','Price':'9800000','Exclusivity':'Exclusive','PF Link':'https://www.propertyfinder.ae/en/broker/eone-prime-properties-l-l-c-s-o-c-v2-179995'},
  ];
}

// ── INIT ──────────────────────────────────────
if (document.getElementById('carTrack')) loadCarousel();
if (document.getElementById('propsGrid')) loadPropsPage();

// Fade in on scroll
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting){e.target.style.opacity='1';e.target.style.transform='translateY(0)';obs.unobserve(e.target);} });
}, {threshold:.1});
document.querySelectorAll('.why-card,.phil-inner,.test-inner,.cta-inner,.world').forEach(el => {
  el.style.cssText += 'opacity:0;transform:translateY(20px);transition:opacity .65s ease,transform .65s ease;';
  obs.observe(el);
});

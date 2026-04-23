// ═══════════════════════════════════════════════
// EONE — HOME PAGE JS
// Loads live listings from Apps Script Web App
// ═══════════════════════════════════════════════

// ── Apps Script URL (set in main.js, shared) ───
// We read it from window.EONE_API_URL which main.js sets,
// or fall back to the direct constant below.
function getApiUrl() {
    return (typeof APPS_SCRIPT_URL !== 'undefined' && APPS_SCRIPT_URL && !APPS_SCRIPT_URL.includes('YOUR_'))
        ? APPS_SCRIPT_URL
        : null;
}

// ── Nav scroll ──────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar?.classList.toggle('scrolled', window.scrollY > 40);
});

// ── Mobile drawer ───────────────────────────────
const burger = document.getElementById('burger');
const drawer = document.getElementById('drawer');
burger?.addEventListener('click', () => drawer?.classList.toggle('open'));
drawer?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => drawer.classList.remove('open')));

// ── Helpers ─────────────────────────────────────
function esc(s) {
    return String(s || '')
        .replace(/&/g,'&amp;').replace(/</g,'&lt;')
        .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function fmtPrice(val) {
    if (!val) return '';
    const n = Number(String(val).replace(/[^0-9.]/g, ''));
    if (!n) return String(val);
    return 'AED ' + n.toLocaleString('en-US');
}

// ── Build listing card ──────────────────────────
function buildCard(r) {
    const isRent   = (r._type || '').toUpperCase() === 'RENT';
    const isExcl   = String(r['Exclusivity'] || '').toLowerCase().includes('exclusive');
    const pfLink   = r['PF Link'] || '';
    const href     = pfLink && pfLink.startsWith('http') ? pfLink : 'https://www.propertyfinder.ae';
    const price    = fmtPrice(r['Price']);
    const building = esc(r['Building'] || r['Location'] || 'Dubai Property');
    const location = esc(r['Location'] || '');
    const propType = esc(r['Property Type'] || r['Unit Type'] || '');
    const ref      = esc(r['Reference'] || '');
    const beds     = r['# Bed']        || '';
    const baths    = r['# Bath']       || '';
    const size     = r['Size']         || r['Size sqft'] || '';
    const furnish  = r['Furnishing']   || r['Furnishing Type'] || '';
    const photo    = r['Photo URL']    || '';

    const photoHtml = photo
        ? `<img src="${esc(photo)}" alt="${building}" loading="lazy"
               onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
           <div class="lc-img-placeholder" style="display:none;">🏙️</div>`
        : `<div class="lc-img-placeholder">🏙️</div>`;

    return `
    <a class="listing-card" href="${esc(href)}" target="_blank" rel="noopener noreferrer"
       title="${building} — View on Property Finder">
        <div class="lc-img">
            ${photoHtml}
            <div class="lc-badge lc-badge-type ${isRent ? 'rent' : ''}">${isRent ? 'RENT' : 'SALE'}</div>
            ${isExcl ? `<div class="lc-badge lc-badge-exclusive">Exclusive</div>` : ''}
            ${pfLink ? `<div class="lc-badge lc-badge-pf">PF ✓</div>` : ''}
        </div>
        <div class="lc-body">
            ${ref ? `<div class="lc-ref">${ref}</div>` : ''}
            <div class="lc-title">${building}</div>
            <div class="lc-location">${location}${location && propType ? ' · ' : ''}${propType}</div>
            <div class="lc-specs">
                ${beds    ? `<div class="lc-spec"><span class="lc-spec-val">${esc(String(beds))}</span><span class="lc-spec-key">Beds</span></div>` : ''}
                ${baths   ? `<div class="lc-spec"><span class="lc-spec-val">${esc(String(baths))}</span><span class="lc-spec-key">Baths</span></div>` : ''}
                ${size    ? `<div class="lc-spec"><span class="lc-spec-val">${esc(String(size))}</span><span class="lc-spec-key">Sq Ft</span></div>` : ''}
                ${furnish ? `<div class="lc-spec"><span class="lc-spec-val" style="font-size:10px;">${esc(furnish)}</span><span class="lc-spec-key">Furnish</span></div>` : ''}
            </div>
            <div class="lc-footer">
                <div>
                    <div class="lc-price">${price || 'Price on Request'}${isRent && price ? '<span style="font-size:.65em;color:#bbb;"> /yr</span>' : ''}</div>
                    <div class="lc-price-label">${isRent ? 'Per Year' : 'Asking Price'}</div>
                </div>
                <span class="lc-arrow">›</span>
            </div>
        </div>
    </a>`;
}

// ── Carousel ─────────────────────────────────────
let carIndex = 0;
let carData  = [];

function getVisible() {
    const w = window.innerWidth;
    if (w < 600)  return 1;
    if (w < 900)  return 2;
    if (w < 1100) return 3;
    return 4;
}

function getCardW() {
    const card = document.querySelector('#carouselTrack .listing-card');
    if (!card) return 300;
    return card.getBoundingClientRect().width + 1;
}

function renderCarousel(listings) {
    const track = document.getElementById('carouselTrack');
    if (!track) return;
    carData  = listings;
    carIndex = 0;
    track.innerHTML = listings.map(buildCard).join('');
    updateCarousel();
}

function updateCarousel() {
    const track = document.getElementById('carouselTrack');
    const prev  = document.getElementById('carPrev');
    const next  = document.getElementById('carNext');
    if (!track) return;

    const vis    = getVisible();
    const maxIdx = Math.max(0, carData.length - vis);
    carIndex     = Math.max(0, Math.min(carIndex, maxIdx));

    track.style.transform = `translateX(-${carIndex * getCardW()}px)`;
    if (prev) prev.disabled = carIndex === 0;
    if (next) next.disabled = carIndex >= maxIdx;
}

document.getElementById('carPrev')?.addEventListener('click', () => {
    carIndex = Math.max(0, carIndex - 1);
    updateCarousel();
});
document.getElementById('carNext')?.addEventListener('click', () => {
    carIndex = Math.min(Math.max(0, carData.length - getVisible()), carIndex + 1);
    updateCarousel();
});

// Touch swipe
let touchX = 0;
document.getElementById('carouselOuter')?.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
document.getElementById('carouselOuter')?.addEventListener('touchend', e => {
    const dx = touchX - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 50) {
        if (dx > 0) document.getElementById('carNext')?.click();
        else        document.getElementById('carPrev')?.click();
    }
});

window.addEventListener('resize', updateCarousel);

// ── Load listings from Apps Script ───────────────
async function loadHomeListings() {
    const apiUrl = getApiUrl();

    if (!apiUrl) {
        console.warn('Apps Script URL not configured — using demo listings.');
        renderCarousel(getDemoListings());
        return;
    }

    try {
        const res  = await fetch(`${apiUrl}?action=getListings`);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        const listings = data.listings || [];
        if (!listings.length) throw new Error('No listings returned');

        console.log(`✓ Loaded ${listings.length} live listings from sheet`);
        renderCarousel(listings);

    } catch (err) {
        console.error('Listings fetch failed:', err.message);
        renderCarousel(getDemoListings());
    }
}

// ── Demo listings (real references from your CRM) ─
function getDemoListings() {
    return [
        { _type:'SALE', 'Reference':'EP-SG-LFS-001', 'Building':'Address Residences Tower B', 'Location':'Dubai Hills Estate', 'Property Type':'Apartment', '# Bed':'2','# Bath':'2','Size':'1,250','Furnishing':'Unfurnished','Price':'3499000','PF Link':'https://www.propertyfinder.ae' },
        { _type:'RENT', 'Reference':'EP-SG-LFR-001', 'Building':'Ellington House',            'Location':'Dubai Hills Estate', 'Property Type':'Apartment', '# Bed':'2','# Bath':'3','Size':'1,273','Furnishing':'Unfurnished','Price':'269000', 'Exclusivity':'Exclusive','PF Link':'https://www.propertyfinder.ae' },
        { _type:'RENT', 'Reference':'EP-SG-LFR-003', 'Building':'Garden Homes Frond N',       'Location':'Palm Jumeirah',      'Property Type':'Villa',     '# Bed':'5','# Bath':'6','Size':'6,788','Furnishing':'Furnished',  'Price':'3500000','Exclusivity':'Exclusive','PF Link':'https://www.propertyfinder.ae' },
        { _type:'RENT', 'Reference':'EP-SG-LFR-005', 'Building':'Residences 3',               'Location':'District One',       'Property Type':'Apartment', '# Bed':'1','# Bath':'1','Size':'766',  'Furnishing':'Furnished',  'Price':'120000', 'Exclusivity':'Exclusive','PF Link':'https://www.propertyfinder.ae' },
        { _type:'SALE', 'Reference':'EP-XX-LFS-002', 'Building':'Bulgari Residences',         'Location':'Jumeirah Bay Island','Property Type':'Villa',     '# Bed':'5','# Bath':'6','Size':'10,500','Furnishing':'Furnished', 'Price':'95000000','Exclusivity':'Exclusive','PF Link':'https://www.propertyfinder.ae' },
    ];
}

// ── Scroll fade-in ────────────────────────────────
const fadeObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.style.opacity = '1';
            e.target.style.transform = 'translateY(0)';
            fadeObs.unobserve(e.target);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.why-card, .phil-inner, .test-inner, .cta-inner, .world-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity .65s ease, transform .65s ease';
    fadeObs.observe(el);
});

// ── Init ─────────────────────────────────────────
loadHomeListings();

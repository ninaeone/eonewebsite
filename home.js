// ═══════════════════════════════════════════
// EONE — HOME PAGE JS
// Carousel + listing card renderer
// ═══════════════════════════════════════════

// ── Nav scroll ──────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar?.classList.toggle('scrolled', window.scrollY > 40);
});

// ── Mobile drawer ────────────────────────────
const burger = document.getElementById('burger');
const drawer = document.getElementById('drawer');
burger?.addEventListener('click', () => drawer?.classList.toggle('open'));
drawer?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => drawer.classList.remove('open')));

// ── Helpers ──────────────────────────────────
function esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function fmtPrice(val) {
    if (!val) return '';
    const n = Number(String(val).replace(/[^0-9.]/g, ''));
    if (!n) return String(val);
    return 'AED ' + n.toLocaleString('en-US');
}

// ── Build a listing card (matches CRM style) ──
function buildCard(r) {
    const isRent     = (r._type || r.type || '').toUpperCase() === 'RENT';
    const isExcl     = String(r['Exclusivity'] || r.exclusivity || '').toLowerCase().includes('exclusive');
    const pfLink     = r['PF Link'] || r.pf_link || r.property_url || 'https://www.propertyfinder.ae';
    const price      = fmtPrice(r['Price'] || r.price);
    const building   = esc(r['Building'] || r.building || r.title || 'Dubai Property');
    const location   = esc(r['Location'] || r.location || r.area || '');
    const propType   = esc(r['Property Type'] || r.property_type || '');
    const ref        = esc(r['Reference'] || r.reference || r.ref || '');
    const beds       = r['# Bed']  || r.beds  || r.bedrooms  || '';
    const baths      = r['# Bath'] || r.baths || r.bathrooms || '';
    const size       = r['Size']   || r.size  || r.area_size || '';
    const furnish    = r['Furnishing'] || r.furnishing || '';
    const photoUrl   = r['Photo URL'] || r.photo_url || r.thumbnail || r.cover_photo || '';

    const photoHtml = photoUrl
        ? `<img src="${esc(photoUrl)}" alt="${building}" loading="lazy"
               onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
           <div class="lc-img-placeholder" style="display:none;">🏙️</div>`
        : `<div class="lc-img-placeholder">🏙️</div>`;

    return `
    <a class="listing-card" href="${esc(pfLink)}" target="_blank" rel="noopener noreferrer">
        <div class="lc-img">
            ${photoHtml}
            <div class="lc-badge lc-badge-type ${isRent ? 'rent' : ''}">${isRent ? 'RENT' : 'SALE'}</div>
            ${isExcl  ? `<div class="lc-badge lc-badge-exclusive">Exclusive</div>` : ''}
            ${pfLink && pfLink !== 'https://www.propertyfinder.ae'
                ? `<div class="lc-badge lc-badge-pf">PF ✓</div>` : ''}
        </div>
        <div class="lc-body">
            <div class="lc-ref">${ref || propType}</div>
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
                    <div class="lc-price">${price}${isRent ? '<span style="font-size:.65em;color:#bbb;">/yr</span>' : ''}</div>
                    <div class="lc-price-label">${isRent ? 'Per Year' : 'Asking Price'}</div>
                </div>
                <span class="lc-arrow">›</span>
            </div>
        </div>
    </a>`;
}

// ── CAROUSEL LOGIC ────────────────────────────
let carIndex   = 0;
let carData    = [];
let carVisible = 4; // cards visible at once

function getCarVisible() {
    const w = window.innerWidth;
    if (w < 600)  return 1;
    if (w < 900)  return 2;
    if (w < 1100) return 3;
    return 4;
}

function getCardWidth() {
    const track = document.getElementById('carouselTrack');
    if (!track) return 300;
    const card = track.querySelector('.listing-card');
    if (!card) return 300;
    return card.getBoundingClientRect().width + 1; // +1 for gap
}

function renderCarousel(listings) {
    const track = document.getElementById('carouselTrack');
    if (!track) return;
    track.innerHTML = listings.map(buildCard).join('');
    carData    = listings;
    carIndex   = 0;
    carVisible = getCarVisible();
    updateCarousel();
}

function updateCarousel() {
    const track  = document.getElementById('carouselTrack');
    const prev   = document.getElementById('carPrev');
    const next   = document.getElementById('carNext');
    if (!track) return;

    const cardW   = getCardWidth();
    const maxIdx  = Math.max(0, carData.length - carVisible);
    carIndex      = Math.max(0, Math.min(carIndex, maxIdx));

    track.style.transform = `translateX(-${carIndex * cardW}px)`;

    if (prev) prev.disabled = carIndex === 0;
    if (next) next.disabled = carIndex >= maxIdx;
}

document.getElementById('carPrev')?.addEventListener('click', () => {
    carIndex = Math.max(0, carIndex - 1);
    updateCarousel();
});

document.getElementById('carNext')?.addEventListener('click', () => {
    const maxIdx = Math.max(0, carData.length - getCarVisible());
    carIndex = Math.min(maxIdx, carIndex + 1);
    updateCarousel();
});

// Touch/swipe support
let touchStartX = 0;
document.getElementById('carouselOuter')?.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
}, { passive: true });

document.getElementById('carouselOuter')?.addEventListener('touchend', e => {
    const dx = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 50) {
        if (dx > 0) document.getElementById('carNext')?.click();
        else        document.getElementById('carPrev')?.click();
    }
});

window.addEventListener('resize', () => {
    carVisible = getCarVisible();
    updateCarousel();
});

// ── LOAD LISTINGS ─────────────────────────────
// Priority order:
// 1. window.__pfAllListings (if CRM context)
// 2. listings.json in repo root
// 3. Demo data

async function loadHomeListings() {
    // CRM context
    if (window.__pfAllListings?.length) {
        renderCarousel(window.__pfAllListings);
        return;
    }

    // listings.json
    try {
        const res = await fetch('listings.json');
        if (res.ok) {
            const data = await res.json();
            const listings = data.map(r => ({
                ...r,
                _type: String(r.Type || r.type || r._type || 'SALE').toUpperCase()
            }));
            renderCarousel(listings);
            return;
        }
    } catch (_) {}

    // Demo data (real-looking, matches your CRM structure)
    renderCarousel(getDemoListings());
}

function getDemoListings() {
    return [
        {
            _type: 'SALE',
            'Reference': 'EP-SG-LFS-001',
            'Building': 'Address Residences Tower B',
            'Location': 'Dubai Hills Estate',
            'Property Type': 'Residential',
            '# Bed': '2', '# Bath': '2', 'Size': '1,250',
            'Furnishing': 'Unfurnished',
            'Price': '3499000',
            'PF Link': 'https://www.propertyfinder.ae',
        },
        {
            _type: 'RENT',
            'Reference': 'EP-SG-LFR-001',
            'Building': 'Ellington House',
            'Location': 'Dubai Hills Estate',
            'Property Type': 'Residential',
            '# Bed': '2', '# Bath': '3', 'Size': '1,273.8',
            'Furnishing': 'Unfurnished',
            'Price': '269000',
            'Exclusivity': 'Exclusive',
            'PF Link': 'https://www.propertyfinder.ae',
        },
        {
            _type: 'RENT',
            'Reference': 'EP-SG-LFR-002',
            'Building': 'Ellington House',
            'Location': 'Dubai Hills Estate',
            'Property Type': 'Residential',
            '# Bed': '2', '# Bath': '3', 'Size': '1,273.8',
            'Furnishing': 'Unfurnished',
            'Price': '269000',
            'Exclusivity': 'Exclusive',
            'PF Link': 'https://www.propertyfinder.ae',
        },
        {
            _type: 'RENT',
            'Reference': 'EP-SG-LFR-003',
            'Building': 'Garden Homes Frond N',
            'Location': 'Palm Jumeirah',
            'Property Type': 'Residential',
            '# Bed': '5', '# Bath': '6', 'Size': '6,788.91',
            'Furnishing': 'Furnished',
            'Price': '3500000',
            'Exclusivity': 'Exclusive',
            'PF Link': 'https://www.propertyfinder.ae',
        },
        {
            _type: 'RENT',
            'Reference': 'EP-SG-LFR-005',
            'Building': 'Residences 3',
            'Location': 'District One',
            'Property Type': 'Residential',
            '# Bed': '1', '# Bath': '1', 'Size': '766.93',
            'Furnishing': 'Furnished',
            'Price': '120000',
            'Exclusivity': 'Exclusive',
            'PF Link': 'https://www.propertyfinder.ae',
        },
    ];
}

// ── Scroll fade-in ────────────────────────────
const fadeObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.style.opacity = '1';
            e.target.style.transform = 'translateY(0)';
            fadeObs.unobserve(e.target);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.why-card, .phil-inner, .test-inner, .cta-inner').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity .7s ease, transform .7s ease';
    fadeObs.observe(el);
});

// ── Init ──────────────────────────────────────
loadHomeListings();

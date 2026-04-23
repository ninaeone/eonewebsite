// ===================================================
// EONE EXCLUSIVE PROPERTIES — main.js
// Fetches live listings from Google Apps Script API
// ===================================================

// ── IMPORTANT: Replace with your deployed Web App URL ─────────
// After deploying WebsiteAPI.gs, paste the URL here.
// It looks like: https://script.google.com/macros/s/AKfy.../exec
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyHrwwVKhXNwAV54j051pdQcXRfp7UxcwhB_5L4diCAwmQr8syMR6XD73_ov5lYQUP9/exec';

// ── Nav scroll ─────────────────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar?.classList.toggle('scrolled', window.scrollY > 50);
});

// ── Mobile menu ────────────────────────────────────────────────
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger?.addEventListener('click', () => mobileMenu?.classList.toggle('open'));
mobileMenu?.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => mobileMenu.classList.remove('open'))
);

// ── Contact form ───────────────────────────────────────────────
document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        btn.closest('.interest-toggle')
           ?.querySelectorAll('.toggle-btn')
           .forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const inp = document.getElementById('interest');
        if (inp) inp.value = btn.dataset.val;
    });
});

document.getElementById('enquiryForm')?.addEventListener('submit', e => {
    e.preventDefault();
    document.getElementById('enquiryForm').style.display = 'none';
    document.getElementById('formSuccess').style.display = 'block';
});

// ── Scroll animations ──────────────────────────────────────────
const fadeObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            fadeObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.08 });

function observeFadeElements() {
    document.querySelectorAll('.why-item, .value-item, .about-kpi, .pf-card:not(.fade-observed)').forEach(el => {
        el.classList.add('fade-up', 'fade-observed');
        fadeObserver.observe(el);
    });
}

// ── FORMAT HELPERS ─────────────────────────────────────────────
function formatPrice(val) {
    if (!val || val === '' || val === '0') return '';
    const num = Number(String(val).replace(/[^0-9.]/g, ''));
    if (isNaN(num) || num === 0) return String(val);
    return 'AED ' + num.toLocaleString('en-US');
}

function escHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// ── RENDER CARD ────────────────────────────────────────────────
// Each card is an <a> tag — clicking opens PF link directly
function renderCard(listing) {
    const isRent      = listing._type === 'RENT';
    const isExclusive = String(listing['Exclusivity'] || '').toLowerCase().includes('exclusive');
    const pfLink      = listing['PF Link'] || '';
    const price       = formatPrice(listing['Price']);
    const building    = escHtml(listing['Building'] || listing['Location'] || 'Dubai Property');
    const location    = escHtml(listing['Location'] || '');
    const ref         = escHtml(listing['Reference'] || '');
    const beds        = listing['# Bed']        || '';
    const baths       = listing['# Bath']       || '';
    const size        = listing['Size']         || listing['Size sqft'] || '';
    const furnish     = listing['Furnishing']   || listing['Furnishing Type'] || '';
    const propType    = escHtml(listing['Property Type'] || listing['Unit Type'] || '');
    const photoUrl    = listing['Photo URL']    || '';

    const href   = pfLink && pfLink.startsWith('http') ? pfLink : '#';
    const target = pfLink ? 'target="_blank" rel="noopener noreferrer"' : '';

    const photoHtml = photoUrl
        ? `<img src="${escHtml(photoUrl)}" alt="${building}" loading="lazy"
               onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
           <div class="pf-card-thumb-placeholder" style="display:none;">🏙️</div>`
        : `<div class="pf-card-thumb-placeholder">🏙️</div>`;

    return `
    <a class="pf-card" href="${escHtml(href)}" ${target} title="${building} — View on Property Finder">
        <div class="pf-card-thumb">
            ${photoHtml}
            <div class="pf-badge pf-badge-type ${isRent ? 'rent' : ''}">${isRent ? 'FOR RENT' : 'FOR SALE'}</div>
            ${isExclusive ? `<div class="pf-badge pf-badge-exclusive">Exclusive</div>` : ''}
            ${pfLink      ? `<div class="pf-badge pf-badge-pf">PF ✓</div>` : ''}
        </div>
        <div class="pf-card-body">
            ${ref ? `<div class="pf-card-ref">${ref}</div>` : ''}
            <div class="pf-card-title">${building}</div>
            <div class="pf-card-sub">${location}${location && propType ? ' · ' : ''}${propType}</div>
            <div class="pf-card-specs">
                ${beds    ? `<div class="pf-card-spec"><span class="pf-card-spec-val">${escHtml(String(beds))}</span><span class="pf-card-spec-key">Beds</span></div>` : ''}
                ${baths   ? `<div class="pf-card-spec"><span class="pf-card-spec-val">${escHtml(String(baths))}</span><span class="pf-card-spec-key">Baths</span></div>` : ''}
                ${size    ? `<div class="pf-card-spec"><span class="pf-card-spec-val">${escHtml(String(size))}</span><span class="pf-card-spec-key">Sq Ft</span></div>` : ''}
                ${furnish ? `<div class="pf-card-spec"><span class="pf-card-spec-val" style="font-size:10px;">${escHtml(furnish)}</span><span class="pf-card-spec-key">Furnish</span></div>` : ''}
            </div>
            <div class="pf-card-footer">
                <div>
                    <div class="pf-card-price">${price || '—'}</div>
                    <div class="pf-card-price-label">${isRent ? 'Per Year' : 'Asking Price'}</div>
                </div>
                <span class="pf-card-arrow" style="color:${pfLink ? 'var(--gold)' : '#e8e8e8'};">↗</span>
            </div>
        </div>
    </a>`;
}

// ── RENDER GRID ────────────────────────────────────────────────
function renderGrid(gridId, listings, limit) {
    const grid = document.getElementById(gridId);
    if (!grid) return;

    const items = limit ? listings.slice(0, limit) : listings;

    if (!items.length) {
        grid.innerHTML = `
            <div style="grid-column:1/-1;padding:80px 40px;text-align:center;background:#fff;border:1px solid #eee;">
                <div style="font-size:2rem;margin-bottom:16px;">🔍</div>
                <div style="font-size:9px;letter-spacing:3px;color:#bbb;text-transform:uppercase;">No listings match your search</div>
            </div>`;
        return;
    }

    grid.innerHTML = items.map(renderCard).join('');
    observeFadeElements();
}

// ── STATE ──────────────────────────────────────────────────────
let allListings      = [];
let filteredListings = [];
let activeTab        = 'all';

// ── FILTERS (Properties page) ──────────────────────────────────
function applyFilters() {
    const q       = (document.getElementById('propSearch')?.value  || '').toLowerCase().trim();
    const beds    =  document.getElementById('propBeds')?.value    || '';
    const furnish =  document.getElementById('propFurnish')?.value || '';
    const countEl =  document.getElementById('propCount');
    const emptyEl =  document.getElementById('propEmpty');
    const gridEl  =  document.getElementById('allPFGrid');

    filteredListings = allListings.filter(r => {
        const type = r._type || 'SALE';
        const excl = String(r['Exclusivity'] || '').toLowerCase();

        if (activeTab === 'sale'      && type !== 'SALE') return false;
        if (activeTab === 'rent'      && type !== 'RENT') return false;
        if (activeTab === 'exclusive' && !excl.includes('exclusive')) return false;

        if (q) {
            const hay = [
                r['Building'], r['Location'], r['Reference'],
                r['Property Type'], r['Unit Type'], r['View'], r['Furnishing']
            ].join(' ').toLowerCase();
            if (!hay.includes(q)) return false;
        }

        if (beds) {
            const b = String(r['# Bed'] || '').trim();
            if (beds === '5+') { if (parseInt(b) < 5) return false; }
            else if (b !== beds) return false;
        }

        if (furnish && r['Furnishing'] !== furnish) return false;

        return true;
    });

    const count   = filteredListings.length;
    const isEmpty = count === 0;

    if (countEl) countEl.textContent = count + ' listing' + (count !== 1 ? 's' : '');
    if (emptyEl) emptyEl.style.display = isEmpty ? 'block' : 'none';
    if (gridEl)  gridEl.style.display  = isEmpty ? 'none'  : 'grid';
    if (!isEmpty) renderGrid('allPFGrid', filteredListings);
}

window.resetFilters = function () {
    ['propSearch', 'propBeds', 'propFurnish'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    activeTab = 'all';
    document.querySelectorAll('.filter-tab').forEach(t =>
        t.classList.toggle('active', t.dataset.tab === 'all')
    );
    applyFilters();
};

document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeTab = tab.dataset.tab;
        applyFilters();
    });
});

['propSearch', 'propBeds', 'propFurnish'].forEach(id => {
    document.getElementById(id)?.addEventListener('input',  applyFilters);
    document.getElementById(id)?.addEventListener('change', applyFilters);
});

// ── FETCH FROM APPS SCRIPT ─────────────────────────────────────
async function fetchListings() {
    if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL === 'YOUR_DEPLOYED_APPS_SCRIPT_URL') {
        console.warn('⚠ APPS_SCRIPT_URL not set — showing demo listings.');
        allListings = getDemoListings();
        initGrids();
        return;
    }

    try {
        const res  = await fetch(`${APPS_SCRIPT_URL}?action=getListings`);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        allListings = data.listings || [];
        console.log(`✓ ${allListings.length} listings loaded (${data.saleCount} sale · ${data.rentCount} rent)`);
    } catch (err) {
        console.error('Apps Script fetch failed:', err.message, '— using demo listings.');
        allListings = getDemoListings();
    }

    initGrids();
}

// ── INIT GRIDS ─────────────────────────────────────────────────
function initGrids() {
    filteredListings = [...allListings];

    // Home page — 3 featured cards
    if (document.getElementById('homePFGrid')) {
        renderGrid('homePFGrid', allListings, 3);
    }

    // Properties page — all listings + filters
    if (document.getElementById('allPFGrid')) {
        const countEl = document.getElementById('propCount');
        if (countEl) countEl.textContent = allListings.length + ' listing' + (allListings.length !== 1 ? 's' : '');
        renderGrid('allPFGrid', allListings);
    }

    observeFadeElements();
}

// ── DEMO LISTINGS (until APPS_SCRIPT_URL is set) ───────────────
function getDemoListings() {
    return [
        { _type:'SALE', 'Building':'Signature Frond Villa',   'Location':'Palm Jumeirah',    'Reference':'EXC-001', 'Property Type':'Villa',     '# Bed':'6', '# Bath':'7', 'Size':'12,000', 'Furnishing':'Furnished',   'Price':'68000000', 'Exclusivity':'Exclusive', 'PF Link':'https://www.propertyfinder.ae' },
        { _type:'SALE', 'Building':'Burj Khalifa Boulevard',  'Location':'Downtown Dubai',   'Reference':'EXC-002', 'Property Type':'Penthouse', '# Bed':'4', '# Bath':'5', 'Size':'6,800',  'Furnishing':'Furnished',   'Price':'42500000', 'Exclusivity':'',          'PF Link':'https://www.propertyfinder.ae' },
        { _type:'RENT', 'Building':'Golf Estate Mansion',     'Location':'Emirates Hills',   'Reference':'EXC-003', 'Property Type':'Mansion',   '# Bed':'8', '# Bath':'9', 'Size':'18,000', 'Furnishing':'Unfurnished', 'Price':'2500000',  'Exclusivity':'Exclusive', 'PF Link':'https://www.propertyfinder.ae' },
        { _type:'SALE', 'Building':'The Index Tower',         'Location':'DIFC',             'Reference':'EXC-004', 'Property Type':'Apartment', '# Bed':'3', '# Bath':'4', 'Size':'3,400',  'Furnishing':'Furnished',   'Price':'18000000', 'Exclusivity':'',          'PF Link':'https://www.propertyfinder.ae' },
        { _type:'RENT', 'Building':'Waterfront Reserve',      'Location':'Jumeirah Bay',     'Reference':'EXC-005', 'Property Type':'Villa',     '# Bed':'7', '# Bath':'8', 'Size':'14,500', 'Furnishing':'Furnished',   'Price':'800000',   'Exclusivity':'Exclusive', 'PF Link':'https://www.propertyfinder.ae' },
        { _type:'SALE', 'Building':'Cavalli Casa Tower',      'Location':'Dubai Marina',     'Reference':'EXC-006', 'Property Type':'Apartment', '# Bed':'3', '# Bath':'4', 'Size':'2,800',  'Furnishing':'Furnished',   'Price':'9800000',  'Exclusivity':'Exclusive', 'PF Link':'https://www.propertyfinder.ae' },
    ];
}

// ── START ──────────────────────────────────────────────────────
fetchListings();

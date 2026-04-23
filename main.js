// ===== MAISON — MAIN JS =====

// Scroll-based nav styling
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile menu
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger?.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
});

// Close mobile menu on link click
mobileMenu?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
    });
});

// Fade-up scroll animations
const fadeElements = document.querySelectorAll('.listing-card, .watch-card, .watch-card-full, .service-feature, .value-item, .team-card, .timeline-item, .about-kpi, .concierge-item, .hub-card');

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
            entry.target.style.transitionDelay = `${(i % 4) * 80}ms`;
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

fadeElements.forEach(el => {
    el.classList.add('fade-up');
    observer.observe(el);
});

// Interest toggle buttons (contact page)
const toggleBtns = document.querySelectorAll('.toggle-btn');
const interestInput = document.getElementById('interest');

toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        toggleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (interestInput) interestInput.value = btn.dataset.val;
    });
});

// Contact form submission (demo)
const form = document.getElementById('enquiryForm');
const success = document.getElementById('formSuccess');

form?.addEventListener('submit', (e) => {
    e.preventDefault();
    form.style.display = 'none';
    if (success) success.style.display = 'block';
});

// Smooth anchor scrolling for hash links
document.querySelectorAll('a[href*="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href.includes('#') && !href.startsWith('#')) return; // external page with hash
        const hash = href.split('#')[1];
        const target = document.getElementById(hash);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

let currentHeroSlide = 0;
let heroInterval;
let currentCategory = 'All';

document.addEventListener('DOMContentLoaded', () => {
    // Mobile Navigation Toggle
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Start Hero Auto-rotate Timer
    startHeroAutoSlide();

    // Load Backend Inventory
    fetchProducts('All');
});

// --- Hero Banner Slider Logic ---
function showHeroSlide(index) {
    const slides = document.querySelectorAll('.hero-slide');
    if (slides.length === 0) return;

    slides.forEach(slide => slide.classList.remove('active'));

    if (index >= slides.length) currentHeroSlide = 0;
    else if (index < 0) currentHeroSlide = slides.length - 1;
    else currentHeroSlide = index;

    slides[currentHeroSlide].classList.add('active');
}

function changeHeroSlide(direction) {
    clearInterval(heroInterval);
    showHeroSlide(currentHeroSlide + direction);
    startHeroAutoSlide();
}

function startHeroAutoSlide() {
    heroInterval = setInterval(() => {
        showHeroSlide(currentHeroSlide + 1);
    }, 5000);
}

// --- Fetch Products from Node/SQLite Backend ---
async function fetchProducts(category) {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Loading collection from database...</p>';

    try {
        const url = category === 'All'
            ? '/api/products'
            : `/api/products?category=${encodeURIComponent(category)}`;

        const res = await fetch(url);
        const products = await res.json();

        if (products.length === 0) {
            grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center;">No items found under "${category}". Add items in admin.html!</p>`;
            return;
        }

        grid.innerHTML = products.map(item => `
            <div class="product-card">
                <div class="product-image-holder">
                    ${item.badge ? `<span class="badge">${item.badge}</span>` : ''}
                    <div class="slider-track">
                        ${item.images.map(imgSrc => `<img src="${imgSrc}" alt="${item.title}">`).join('')}
                    </div>
                    ${item.images.length > 1 ? `
                        <button class="slider-btn prev-btn" onclick="moveSlide(this, -1)">❮</button>
                        <button class="slider-btn next-btn" onclick="moveSlide(this, 1)">❯</button>
                    ` : ''}
                </div>
                <div class="product-info">
                    <span class="product-brand">${item.brand || 'Tak Curation'}</span>
                    <div class="product-tags">
                        <span class="tag-badge">${item.category}</span>
                        ${item.fabric_type ? `<span class="tag-badge">${item.fabric_type}</span>` : ''}
                        ${item.print_type ? `<span class="tag-badge">${item.print_type}</span>` : ''}
                    </div>
                    <h3 class="product-title">${item.title}</h3>
                    <p class="product-price">₹${item.price}</p>
                </div>
            </div>
        `).join('');

    } catch (err) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: red;">Backend offline. Please run <code>node server.js</code> in your terminal.</p>';
    }
}

// Category Filter Button Handler
function filterCategory(cat, button) {
    currentCategory = cat;
    
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    fetchProducts(cat);
}

// --- Product Card Multi-Image Carousel Logic ---
function moveSlide(button, direction) {
    const holder = button.closest('.product-image-holder');
    const track = holder.querySelector('.slider-track');
    const totalImages = track.querySelectorAll('img').length;

    let currentIndex = parseInt(track.dataset.currentIndex || '0');
    currentIndex += direction;

    if (currentIndex < 0) {
        currentIndex = totalImages - 1;
    } else if (currentIndex >= totalImages) {
        currentIndex = 0;
    }

    track.dataset.currentIndex = currentIndex;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
}
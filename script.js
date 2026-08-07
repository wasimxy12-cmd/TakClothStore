let currentHeroSlide = 0;
let heroInterval;
let currentCategory = 'All';

const fallbackProducts = [
    {
        id: '1',
        title: 'Pure Cotton Printed Odhani',
        price: 1250,
        category: 'Odhani',
        brand: 'Tak Curation',
        fabric_type: 'Cotton',
        print_type: 'Bandhani',
        badge: 'New Arrival',
        images: ['/images/hero1.jpg']
    },
    {
        id: '2',
        title: 'Traditional Salwar Suit Set',
        price: 2450,
        category: 'Salwar Suit',
        brand: 'Tak Signature',
        fabric_type: 'Silk Blend',
        print_type: 'Floral',
        badge: 'Best Seller',
        images: ['/images/hero2.jpg']
    },
    {
        id: '3',
        title: 'Handwoven Astar Fabric',
        price: 1800,
        category: 'Astar',
        brand: 'Tak Weaves',
        fabric_type: 'Handloom',
        print_type: 'Classic',
        badge: 'Limited',
        images: ['/images/hero3.jpg']
    },
    {
        id: '4',
        title: 'Thān Fabric Premium Roll',
        price: 3200,
        category: 'Raw Fabric (Thān)',
        brand: 'Tak Loom',
        fabric_type: 'Khadi',
        print_type: 'Plain',
        badge: 'Premium',
        images: ['/images/hero1.jpg']
    }
];

let staticProducts = fallbackProducts;

document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    startHeroAutoSlide();
    loadProducts();
});

async function loadProducts() {
    const grid = document.getElementById('productGrid');
    if (grid) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center;">Loading collection from backend...</p>`;
    }

    try {
        const response = await fetch('/api/products');
        if (!response.ok) {
            throw new Error('Failed to fetch product inventory');
        }

        const data = await response.json();
        if (data && Array.isArray(data.inventory)) {
            staticProducts = data.inventory;
        } else {
            throw new Error('Invalid inventory response');
        }
    } catch (error) {
        console.warn('Unable to load backend inventory, falling back to static products:', error);
        staticProducts = fallbackProducts;
    }

    renderProducts(currentCategory);
}

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

function getProducts(category) {
    if (category === 'All') {
        return staticProducts;
    }

    return staticProducts.filter(item => item.category === category);
}

function renderProducts(category) {
    const grid = document.getElementById('productGrid');
    const products = getProducts(category);

    if (products.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center;">No items found under "${category}".</p>`;
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
}

function filterCategory(cat, button) {
    currentCategory = cat;

    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    renderProducts(cat);
}

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
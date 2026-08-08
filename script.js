document.addEventListener('DOMContentLoaded', () => {
    // 1. ADD THIS LINE HERE AT THE VERY TOP
    const storeWhatsAppNumber = "917023788508"; // Replace with your WhatsApp number// 1. Combine products safely from category JS files
    const allProducts = [
        ...(typeof suitsProducts !== 'undefined' ? suitsProducts : []),
        ...(typeof odhaniProducts !== 'undefined' ? odhaniProducts : []),
        ...(typeof thanProducts !== 'undefined' ? thanProducts : []),
        ...(typeof astarProducts !== 'undefined' ? astarProducts : [])
    ];

    const productGrid = document.getElementById('productGrid');

   // 2. Render Products Dynamically with WhatsApp Button
    function renderProducts(productsToRender) {
        if (!productGrid) return;

        if (productsToRender.length === 0) {
            productGrid.innerHTML = `<p style="grid-column: 1/-1; color: var(--text-muted);">No products found in this category.</p>`;
            return;
        }

        productGrid.innerHTML = productsToRender.map(product => {
            const hasMultipleImages = product.images && product.images.length > 1;
            const isOutOfStock = product.inStock === false;

            // Generate WhatsApp order message URL
            const whatsappMessage = encodeURIComponent(
                `Hello TAK Cloth Store! 👋\nI want to buy:\n\n📌 *Product:* ${product.title}\n🏷️ *Brand:* ${product.brand}\n💰 *Price:* ${product.price}\n🆔 *Product ID:* ${product.id}\n\nPlease let me know if it is available.`
            );
            const whatsappLink = `https://wa.me/${storeWhatsAppNumber}?text=${whatsappMessage}`;

            return `
                <div class="product-card ${isOutOfStock ? 'out-of-stock' : ''}" data-category="${product.category}">
                    <div class="product-image-holder">
                        ${product.badge ? `<span class="badge">${product.badge}</span>` : ''}
                        ${isOutOfStock ? `<span class="badge out-badge">Out of Stock</span>` : ''}
                        <div class="slider-track">
                            ${product.images.map(img => `<img src="${img}" alt="${product.title}">`).join('')}
                        </div>
                        ${hasMultipleImages ? `
                            <button class="slider-btn prev-btn">&#10094;</button>
                            <button class="slider-btn next-btn">&#10095;</button>
                        ` : ''}
                    </div>
                    <div class="product-info">
                        <div class="product-tags">
                            ${product.tags.map(tag => `<span class="tag-badge">${tag}</span>`).join('')}
                        </div>
                        <div class="product-brand">${product.brand}</div>
                        <h3 class="product-title">${product.title}</h3>
                        <div class="product-price-wrapper">
                            ${product.originalPrice ? `<span class="original-price">${product.originalPrice}</span>` : ''}
                            <span class="product-price">${product.price}</span>
                        </div>
                        
                        <!-- WhatsApp Direct Buy Button -->
                        <a href="${isOutOfStock ? 'javascript:void(0)' : whatsappLink}" 
                           target="${isOutOfStock ? '_self' : '_blank'}" 
                           class="card-wa-btn ${isOutOfStock ? 'disabled-btn' : ''}">
                           ${isOutOfStock ? 'Unavailable' : '💬 Buy on WhatsApp'}
                        </a>
                    </div>
                </div>
            `;
        }).join('');

        initMiniImageSliders();
    }

    // Initial render of all products
    renderProducts(allProducts);

    // 3. Category Filter Buttons Logic
    const filterBtns = document.querySelectorAll('.filter-btn');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            if (filterValue === 'all') {
                renderProducts(allProducts);
            } else {
                const filtered = allProducts.filter(p => p.category === filterValue);
                renderProducts(filtered);
            }
        });
    });

    // 4. Product Card Mini Slider Controls
    function initMiniImageSliders() {
        document.querySelectorAll('.product-card').forEach(card => {
            const track = card.querySelector('.slider-track');
            const images = track ? track.querySelectorAll('img') : [];
            const prevSlideBtn = card.querySelector('.prev-btn');
            const nextSlideBtn = card.querySelector('.next-btn');

            if (images.length > 1 && track) {
                let imgIndex = 0;

                const updateProductImage = () => {
                    track.style.transform = `translateX(-${imgIndex * 100}%)`;
                };

                if (nextSlideBtn) {
                    nextSlideBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        imgIndex = (imgIndex + 1) % images.length;
                        updateProductImage();
                    });
                }

                if (prevSlideBtn) {
                    prevSlideBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        imgIndex = (imgIndex - 1 + images.length) % images.length;
                        updateProductImage();
                    });
                }
            }
        });
    }

    // 5. Mobile Navigation Menu Toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });
    }

    // 6. Hero Slider Logic
    const slides = document.querySelectorAll('.hero-slide');
    const prevBtn = document.getElementById('heroPrevBtn');
    const nextBtn = document.getElementById('heroNextBtn');

    if (slides.length > 0) {
        let currentSlide = 0;
        let autoSlideInterval;

        function showSlide(index) {
            slides.forEach(slide => slide.classList.remove('active'));
            currentSlide = (index + slides.length) % slides.length;
            slides[currentSlide].classList.add('active');
        }

        function startAutoSlide() {
            stopAutoSlide();
            autoSlideInterval = setInterval(() => {
                showSlide(currentSlide + 1);
            }, 5000);
        }

        function stopAutoSlide() {
            if (autoSlideInterval) clearInterval(autoSlideInterval);
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                showSlide(currentSlide + 1);
                startAutoSlide();
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                showSlide(currentSlide - 1);
                startAutoSlide();
            });
        }

        startAutoSlide();
    }
});
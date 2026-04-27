(() => {
    'use strict';

    // Package Data - Three Signature Experiences
    const packages = [
        {
            id: 1,
            name: "Artisanal Sunday Brunch",
            type: "BRUNCH",
            price: 388,
            desc: "A lavish celebration of morning flavors. Freshly baked pastries, live omelet & waffle stations, premium cold cuts, tropical fruits, and our signature seafood tower. The perfect way to start your weekend with loved ones.",
            image: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&q=80&w=2070",
            highlight: "Live stations • 50+ dishes • Family-friendly"
        },
        {
            id: 2,
            name: "Premium Seafood Night",
            type: "DINNER",
            price: 588,
            desc: "An oceanic journey featuring the freshest catches: Boston lobster, Hokkaido scallops, Canadian oysters, sashimi platters, grilled king prawns, and our famous seafood bouillabaisse. Paired with chilled wines and ocean views.",
            image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=2070",
            highlight: "Unlimited seafood • Wine pairings • Live jazz"
        },
        {
            id: 3,
            name: "Global Gourmet Feast",
            type: "DINNER",
            price: 468,
            desc: "A world tour on a plate. Explore eight international stations: Japanese sushi & robata, Italian pasta & pizza, Indian curries, Mexican tacos, Chinese dim sum, Thai street food, French desserts, and a decadent chocolate fountain.",
            image: "https://images.unsplash.com/photo-1514933651103-005eec06c8a6?auto=format&fit=crop&q=80&w=2070",
            highlight: "8 global stations • Vegetarian options • Chef's table"
        }
    ];

    let currentSlide = 0;
    let autoPlayInterval = null;
    let isPaused = false;

    function createSlides() {
        const container = document.getElementById('slides-container');
        if (!container) return;
        container.innerHTML = '';

        packages.forEach((pkg, index) => {
            const slide = document.createElement('div');
            slide.className = `carousel-slide ${index === 0 ? 'active' : ''}`;

            // Use <img> tag instead of background-image (much more reliable)
            slide.innerHTML = `
            <img src="${pkg.image}" 
                 alt="${pkg.name}" 
                 class="w-full h-full object-cover">
            <div class="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/50"></div>
        `;

            slide.dataset.index = index;

            // Click anywhere on slide to go next
            slide.addEventListener('click', () => {
                if (!isPaused) nextSlide();
            });

            container.appendChild(slide);
        });
    }

    function updateSlideContent(index) {
        const pkg = packages[index];

        // Update badge
        const badge = document.getElementById('slide-badge');
        if (badge) {
            badge.innerHTML = `<span class="px-4 py-1 bg-white/90 text-brand-olive text-xs font-bold tracking-[1.5px] rounded-full">${pkg.type}</span>`;
        }

        // Update text
        const nameEl = document.getElementById('slide-name');
        const descEl = document.getElementById('slide-desc');
        if (nameEl) nameEl.textContent = pkg.name;
        if (descEl) descEl.textContent = pkg.desc;

        // Update active dot
        document.querySelectorAll('.nav-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });

        // Update slides active class
        document.querySelectorAll('.carousel-slide').forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
    }

    function createDots() {
        const container = document.getElementById('dots-container');
        if (!container) return;
        container.innerHTML = '';

        packages.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.className = `nav-dot ${index === 0 ? 'active' : ''}`;
            dot.addEventListener('click', () => {
                goToSlide(index);
            });
            container.appendChild(dot);
        });
    }

    function goToSlide(index) {
        currentSlide = index;
        updateSlideContent(currentSlide);
        resetAutoPlay();
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % packages.length;
        updateSlideContent(currentSlide);
        resetAutoPlay();
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + packages.length) % packages.length;
        updateSlideContent(currentSlide);
        resetAutoPlay();
    }

    function startAutoPlay() {
        if (autoPlayInterval) clearInterval(autoPlayInterval);

        autoPlayInterval = setInterval(() => {
            if (!isPaused) {
                nextSlide();
            }
        }, 4500);
    }

    function resetAutoPlay() {
        if (autoPlayInterval) clearInterval(autoPlayInterval);
        startAutoPlay();
    }

    function pauseAutoPlay() {
        isPaused = true;
        const status = document.getElementById('autoplay-status');
        if (status) status.innerHTML = 'Paused • Hover to resume';
    }

    function resumeAutoPlay() {
        isPaused = false;
        const status = document.getElementById('autoplay-status');
        if (status) status.innerHTML = 'Auto • 4.5s';
        startAutoPlay();
    }

    function initializeCarousel() {
        createSlides();
        createDots();
        updateSlideContent(0);
        startAutoPlay();

        // Pause on hover for better UX
        const carousel = document.getElementById('carousel');
        if (carousel) {
            carousel.addEventListener('mouseenter', pauseAutoPlay);
            carousel.addEventListener('mouseleave', resumeAutoPlay);
        }

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') nextSlide();
            if (e.key === 'ArrowLeft') prevSlide();
        });

        // Touch swipe support (simple)
        let touchStartX = 0;
        if (carousel) {
            carousel.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            });
            carousel.addEventListener('touchend', (e) => {
                const touchEndX = e.changedTouches[0].screenX;
                if (touchEndX < touchStartX - 50) nextSlide();
                if (touchEndX > touchStartX + 50) prevSlide();
            });
        }
    }

    function renderPackageCards() {
        const container = document.getElementById('packages-grid');
        if (!container) return;

        container.innerHTML = packages.map(pkg => `
      <div class="package-card bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm h-full flex flex-col">
        <div class="h-56 relative">
          <img src="${pkg.image}" alt="${pkg.name}" class="w-full h-full object-cover">
          <div class="absolute top-4 right-4">
            <span class="px-3 py-1 text-xs font-bold bg-white/95 text-brand-olive rounded-full shadow">${pkg.type}</span>
          </div>
        </div>
        
        <div class="p-8 flex-1 flex flex-col">
          <h3 class="text-3xl serif mb-2">${pkg.name}</h3>
          <div class="flex items-baseline mb-4">
            <span class="text-4xl font-bold text-brand-olive">$${pkg.price}</span>
            <span class="text-gray-500 ml-1">/ person</span>
          </div>
          
          <p class="text-gray-600 text-[15px] leading-relaxed flex-1">${pkg.desc}</p>
          
          <div class="mt-6 pt-6 border-t flex items-center justify-between">
            <div class="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <i class="fa-solid fa-check"></i> 
              <span>${pkg.highlight}</span>
            </div>
            
            <button onclick="window.location.href='packages.html'" 
                    class="text-sm font-semibold text-brand-olive hover:text-green-800 flex items-center gap-2 group">
              BOOK NOW 
              <i class="fa-solid fa-arrow-right group-active:translate-x-0.5 transition"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('');
    }

    // Initialize everything
    function initMenuPage() {
        initializeTailwind();
        initializeCarousel();
        renderPackageCards();

        // Easter egg: click logo to cycle slides faster (fun UX)
        const logo = document.querySelector('nav a');
        if (logo) {
            logo.addEventListener('click', (e) => {
                if (e.metaKey || e.ctrlKey) {
                    e.preventDefault();
                    nextSlide();
                    const status = document.getElementById('autoplay-status');
                    if (status) status.textContent = 'Fast mode!';
                    setTimeout(() => {
                        if (status) status.innerHTML = 'Auto • 4.5s';
                    }, 1200);
                }
            });
        }

        // Accessibility: announce slide changes
        console.log('%c[BuffetEase Menu] Interactive carousel initialized with auto-play, manual controls, touch & keyboard support.', 'color:#4a7043');
    }

    window.onload = initMenuPage;
})();
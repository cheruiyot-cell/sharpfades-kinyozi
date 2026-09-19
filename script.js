// Signal that JS is alive so the inline <head> safety-net does not strip
// the `.js` class after its 1500 ms timeout.
window.sfReady = true;

document.addEventListener('DOMContentLoaded', () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';

    let isTouchDevice = window.matchMedia('(hover: none)').matches;
    let isMobile = window.matchMedia('(max-width: 768px)').matches;

    const header = document.getElementById('site-header');
    const mobileStickyBar = document.getElementById('mobile-sticky-bar');
    const backToTop = document.getElementById('back-to-top');
    const progressBar = document.getElementById('scroll-progress');
    const heroImage = document.querySelector('.hero-image img');

    const scrollOffset = 50;
    const stickyBarThreshold = 600;
    const backToTopThreshold = 400;

    // ===== Analytics Helper =====
    function trackEvent(eventName, params = {}) {
        if (typeof window.gtag === 'function') {
            window.gtag('event', eventName, params);
        }
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:') {
            console.log('[Analytics]', eventName, params);
        }
    }
    window.sfTrackEvent = trackEvent;

    // ===== WhatsApp & Call Click Tracking =====
    document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp"]').forEach(link => {
        link.addEventListener('click', () => {
            const location = link.dataset.trackLocation || (link.closest('section') && link.closest('section').id) || 'unknown';
            const service = link.dataset.service || 'General';
            trackEvent('whatsapp_click', {
                event_category: 'engagement',
                event_label: `${location} — ${service}`,
                location,
                service
            });
        });
    });

    document.querySelectorAll('a[href^="tel:"]').forEach(link => {
        link.addEventListener('click', () => {
            const location = link.dataset.trackLocation || (link.closest('section') && link.closest('section').id) || 'unknown';
            trackEvent('call_click', {
                event_category: 'engagement',
                event_label: location,
                location
            });
        });
    });

    // ===== Scroll Handling =====
    let ticking = false;
    function handleScroll() {
        const scrolled = window.scrollY;
        if (header) header.classList.toggle('scrolled', scrolled > scrollOffset);
        if (mobileStickyBar) mobileStickyBar.classList.toggle('visible', scrolled > stickyBarThreshold);
        if (backToTop) backToTop.classList.toggle('visible', scrolled > backToTopThreshold);
        if (progressBar) {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = scrollHeight > 0 ? (scrolled / scrollHeight) * 100 : 0;
            progressBar.style.width = scrollPercent + '%';
        }
        if (heroImage && !prefersReducedMotion) {
            const factor = isMobile ? 0.05 : 0.15;
            heroImage.style.transform = `translateY(${scrolled * factor}px)`;
        }
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(handleScroll);
            ticking = true;
        }
    }, { passive: true });
    handleScroll();

    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: scrollBehavior });
        });
    }

    // ===== Mobile Menu =====
    const navToggle = document.querySelector('.nav-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    if (navToggle && mobileMenu) {
        const closeMenu = (refocus) => {
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.setAttribute('aria-label', 'Open navigation');
            mobileMenu.classList.remove('open');
            document.body.style.overflow = '';
            if (refocus) navToggle.focus();
        };

        navToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const expanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', String(!expanded));
            navToggle.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
            mobileMenu.classList.toggle('open', !expanded);
            document.body.style.overflow = expanded ? '' : 'hidden';
            if (!expanded) {
                const firstLink = mobileMenu.querySelector('a, button');
                if (firstLink) setTimeout(() => firstLink.focus(), 100);
            }
        });

        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => closeMenu(false));
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
                closeMenu(true);
            }
        });

        document.addEventListener('click', (event) => {
            if (
                mobileMenu.classList.contains('open') &&
                !header.contains(event.target) &&
                !mobileMenu.contains(event.target)
            ) {
                closeMenu(false);
            }
        });
    }

    // ===== Mobile Submenu =====
    const mobileToggle = document.querySelector('.mobile-toggle');
    const mobileSubmenu = document.getElementById('mobile-submenu-menu');
    if (mobileToggle && mobileSubmenu) {
        mobileToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const expanded = mobileToggle.getAttribute('aria-expanded') === 'true';
            mobileToggle.setAttribute('aria-expanded', String(!expanded));
            mobileSubmenu.classList.toggle('open', !expanded);
        });

        document.addEventListener('click', (event) => {
            if (
                mobileSubmenu.classList.contains('open') &&
                !mobileSubmenu.contains(event.target) &&
                !mobileToggle.contains(event.target)
            ) {
                mobileToggle.setAttribute('aria-expanded', 'false');
                mobileSubmenu.classList.remove('open');
            }
        });
    }

    // ===== Desktop Dropdowns =====
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        if (!toggle) return;

        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            const expanded = toggle.getAttribute('aria-expanded') === 'true';
            dropdowns.forEach(d => {
                if (d !== dropdown) {
                    const t = d.querySelector('.dropdown-toggle');
                    if (t) t.setAttribute('aria-expanded', 'false');
                    d.classList.remove('open');
                }
            });
            toggle.setAttribute('aria-expanded', String(!expanded));
            dropdown.classList.toggle('open', !expanded);
        });

        toggle.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                toggle.setAttribute('aria-expanded', 'false');
                dropdown.classList.remove('open');
                toggle.focus();
            }
        });
    });

    document.addEventListener('click', (e) => {
        dropdowns.forEach(dropdown => {
            if (!dropdown.contains(e.target)) {
                const toggle = dropdown.querySelector('.dropdown-toggle');
                if (toggle) toggle.setAttribute('aria-expanded', 'false');
                dropdown.classList.remove('open');
            }
        });
    });

    // ===== Smooth Scroll =====
    const anchorLinks = document.querySelectorAll('a[href^="#"]:not(.dropdown-toggle)');
    anchorLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (!targetId || targetId === '#') return;
            const target = document.querySelector(targetId);
            if (!target) return;

            e.preventDefault();
            const headerHeight = header ? header.offsetHeight : 0;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 8;
            window.scrollTo({ top: targetPosition, behavior: scrollBehavior });

            target.setAttribute('tabindex', '-1');
            target.focus({ preventScroll: true });
        });
    });

    // ===== Scroll-triggered Animations =====
    const animatedElements = document.querySelectorAll(
        '.animate-on-scroll, .prop-card, .package-card, .testimonial-card, .process-steps li, .gallery-grid figure, .gallery-item, .blog-card, .credential-card, .philosophy-card, .sidebar-card'
    );
    animatedElements.forEach(el => {
        if (!el.classList.contains('animate-on-scroll')) {
            el.classList.add('animate-on-scroll');
        }
    });

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
        animatedElements.forEach(el => observer.observe(el));
    } else {
        animatedElements.forEach(el => el.classList.add('visible'));
    }

    // ===== Section Titles =====
    const sectionTitles = document.querySelectorAll('.section-title');
    if (sectionTitles.length && 'IntersectionObserver' in window) {
        const titleObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    titleObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        sectionTitles.forEach(title => titleObserver.observe(title));
    } else {
        sectionTitles.forEach(title => title.classList.add('visible'));
    }

    // ===== FAQ =====
    const faqDetails = document.querySelectorAll('.faq details');
    if (faqDetails.length) {
        faqDetails.forEach(detail => {
            detail.addEventListener('toggle', () => {
                if (detail.open) {
                    faqDetails.forEach(other => {
                        if (other !== detail) other.open = false;
                    });
                }
            });
        });
    }

    // ===== Hero Reveal =====
    const heroWords = document.querySelectorAll('.hero-title-main, .hero-title-sub');
    if (heroWords.length) {
        if (prefersReducedMotion) {
            heroWords.forEach(w => w.classList.add('visible'));
        } else {
            heroWords.forEach((word, index) => {
                setTimeout(() => word.classList.add('visible'), 100 + index * 80);
            });
        }
    }

    // ===== Live Indicator =====
    const liveIndicator = document.querySelector('.whatsapp-live-indicator');
    if (liveIndicator) {
        const now = new Date();
        const day = now.getDay();
        const hour = now.getHours();
        const isOpen = day !== 0 && hour >= 8 && hour < 19;
        if (!isOpen) liveIndicator.hidden = true;
    }

    // ===== 3D Tilt =====
    if (!isTouchDevice && !prefersReducedMotion) {
        const tiltElements = document.querySelectorAll('.service-card, .package-card');
        tiltElements.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -6;
                const rotateY = ((x - centerX) / centerX) * 6;
                card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    // ===== Magnetic Buttons (large CTAs only) =====
    if (!isTouchDevice && !prefersReducedMotion) {
        const magneticButtons = document.querySelectorAll('.btn-lg');
        magneticButtons.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${x * 0.08}px, ${y * 0.08}px)`;
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
            });
        });
    }

    // ===== Gallery Filters =====
    const filterChips = document.querySelectorAll('.filter-chip');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const galleryEmpty = document.querySelector('.gallery-empty');

    if (filterChips.length && galleryItems.length) {
        filterChips.forEach(chip => {
            chip.addEventListener('click', () => {
                const filter = chip.dataset.filter;

                filterChips.forEach(c => {
                    c.classList.remove('active');
                    c.setAttribute('aria-selected', 'false');
                });
                chip.classList.add('active');
                chip.setAttribute('aria-selected', 'true');

                let visibleCount = 0;
                galleryItems.forEach(item => {
                    const matches = filter === 'all' || item.dataset.category === filter;
                    if (matches) {
                        item.hidden = false;
                        item.classList.remove('hidden');
                        visibleCount++;
                    } else {
                        item.hidden = true;
                        item.classList.add('hidden');
                    }
                });

                if (galleryEmpty) galleryEmpty.hidden = visibleCount > 0;

                trackEvent('gallery_filter', {
                    event_category: 'engagement',
                    event_label: filter
                });
            });
        });
    }

    // ===== Lightbox =====
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        const lightboxImg = lightbox.querySelector('.lightbox-img');
        const closeBtn = lightbox.querySelector('.lightbox-close');
        const prevBtn = lightbox.querySelector('.lightbox-prev');
        const nextBtn = lightbox.querySelector('.lightbox-next');

        let currentIndex = 0;
        let galleryList = [];

        const refreshGalleryList = () => {
            galleryList = Array.from(document.querySelectorAll('.gallery-item'))
                .filter(item => !item.hidden)
                .map(item => {
                    const btn = item.querySelector('[data-lightbox-src]');
                    const img = item.querySelector('img');
                    return {
                        src: btn ? btn.dataset.lightboxSrc : (img ? img.src : ''),
                        alt: img ? img.alt : ''
                    };
                });
        };

        const openLightbox = (index) => {
            if (!galleryList.length) return;
            currentIndex = (index + galleryList.length) % galleryList.length;
            const item = galleryList[currentIndex];
            lightboxImg.src = item.src;
            lightboxImg.alt = item.alt;
            lightbox.hidden = false;
            lightbox.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            closeBtn.focus();
        };

        const closeLightbox = () => {
            lightbox.hidden = true;
            lightbox.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        };

        document.querySelectorAll('[data-lightbox-src]').forEach(btn => {
            btn.addEventListener('click', () => {
                refreshGalleryList();
                const item = btn.closest('.gallery-item');
                const index = galleryList.findIndex(g => g.src === btn.dataset.lightboxSrc);
                const fallbackIndex = Array.from(document.querySelectorAll('.gallery-item')).indexOf(item);
                openLightbox(index >= 0 ? index : fallbackIndex);

                trackEvent('gallery_lightbox_open', {
                    event_category: 'engagement',
                    event_label: btn.dataset.lightboxSrc
                });
            });
        });

        closeBtn.addEventListener('click', closeLightbox);
        prevBtn.addEventListener('click', () => openLightbox(currentIndex - 1));
        nextBtn.addEventListener('click', () => openLightbox(currentIndex + 1));

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });

        document.addEventListener('keydown', (e) => {
            if (lightbox.hidden) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') openLightbox(currentIndex - 1);
            if (e.key === 'ArrowRight') openLightbox(currentIndex + 1);
        });
    }

    // ===== Booking Form → WhatsApp Handoff =====
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        const dateInput = document.getElementById('bf-date');
        if (dateInput) {
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            dateInput.min = `${yyyy}-${mm}-${dd}`;
        }

        const showError = (field, message) => {
            const err = document.querySelector(`[data-error-for="${field.id}"]`);
            if (err) err.textContent = message;
            field.classList.add('has-error');
            field.setAttribute('aria-invalid', 'true');
        };

        const clearError = (field) => {
            const err = document.querySelector(`[data-error-for="${field.id}"]`);
            if (err) err.textContent = '';
            field.classList.remove('has-error');
            field.removeAttribute('aria-invalid');
        };

        bookingForm.querySelectorAll('input, select, textarea').forEach(field => {
            field.addEventListener('input', () => clearError(field));
            field.addEventListener('change', () => clearError(field));
        });

        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = bookingForm.querySelector('#bf-name');
            const phone = bookingForm.querySelector('#bf-phone');
            const service = bookingForm.querySelector('#bf-service');
            const date = bookingForm.querySelector('#bf-date');
            const time = bookingForm.querySelector('#bf-time');
            const notes = bookingForm.querySelector('#bf-notes');

            let hasError = false;
            [name, phone, service, date, time].forEach(field => clearError(field));

            if (!name.value.trim()) { showError(name, 'Please enter your name.'); hasError = true; }
            if (!phone.value.trim()) { showError(phone, 'Please enter your phone number.'); hasError = true; }
            else if (phone.value.replace(/\D/g, '').length < 9) { showError(phone, 'Please enter a valid phone number.'); hasError = true; }
            if (!service.value) { showError(service, 'Please choose a service.'); hasError = true; }
            if (!date.value) { showError(date, 'Please choose a date.'); hasError = true; }
            if (!time.value) { showError(time, 'Please choose a time.'); hasError = true; }

            if (hasError) {
                const firstError = bookingForm.querySelector('.has-error');
                if (firstError) firstError.focus();
                return;
            }

            const message = [
                `Hi SharpFades! I'd like to book an appointment.`,
                ``,
                `Name: ${name.value.trim()}`,
                `Phone: ${phone.value.trim()}`,
                `Service: ${service.value}`,
                `Preferred date: ${date.value}`,
                `Preferred time: ${time.value}`,
                notes.value.trim() ? `Notes: ${notes.value.trim()}` : null,
                ``,
                `Please confirm availability. Thank you!`
            ].filter(Boolean).join('\n');

            const waUrl = `https://wa.me/254702555093?text=${encodeURIComponent(message)}`;

            trackEvent('booking_form_submit', {
                event_category: 'conversion',
                event_label: service.value,
                service: service.value
            });

            window.open(waUrl, '_blank', 'noopener');
        });
    }

    // ===== Mobile Sticky Bar Height (for floating element offsets) =====
    if (mobileStickyBar) {
        const updateStickyHeight = () => {
            const h = mobileStickyBar.offsetHeight;
            if (h > 0) {
                document.documentElement.style.setProperty('--mobile-sticky-h', `${h}px`);
            }
        };
        updateStickyHeight();
        window.addEventListener('resize', updateStickyHeight, { passive: true });
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(updateStickyHeight);
        }
    }

    // ===== Resize Flags =====
    window.addEventListener('resize', () => {
        isTouchDevice = window.matchMedia('(hover: none)').matches;
        isMobile = window.matchMedia('(max-width: 768px)').matches;
    }, { passive: true });
});
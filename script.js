document.addEventListener('DOMContentLoaded', () => {
    // Detect touch/hover capability for disabling tilt/magnetic effects on mobile
    const isTouchDevice = window.matchMedia('(hover: none)').matches;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    // ===== Unified Scroll Handler (Header, Progress Bar, Mobile Sticky Bar, Back-to-Top) =====
    const header = document.getElementById('site-header');
    const mobileStickyBar = document.getElementById('mobile-sticky-bar');
    const backToTop = document.getElementById('back-to-top');
    const progressBar = document.getElementById('scroll-progress');
    const scrollOffset = 50;
    const stickyBarThreshold = 600;
    const backToTopThreshold = 400;

    function handleScroll() {
        const scrolled = window.scrollY;
        if (header) {
            header.classList.toggle('scrolled', scrolled > scrollOffset);
        }
        if (mobileStickyBar) {
            mobileStickyBar.classList.toggle('visible', scrolled > stickyBarThreshold);
        }
        if (backToTop) {
            backToTop.classList.toggle('visible', scrolled > backToTopThreshold);
        }
        // Update scroll progress bar
        if (progressBar) {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrolled / scrollHeight) * 100;
            progressBar.style.width = scrollPercent + '%';
        }
        // Parallax on hero image (reduced intensity on mobile)
        const heroImage = document.querySelector('.hero-image img');
        if (heroImage) {
            const factor = isMobile ? 0.05 : 0.15;
            heroImage.style.transform = `translateY(${scrolled * factor}px)`;
        }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ===== Mobile Menu Toggle =====
    const navToggle = document.querySelector('.nav-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    if (navToggle && mobileMenu) {
        const closeMenu = () => {
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.setAttribute('aria-label', 'Open navigation');
            mobileMenu.classList.remove('open');
            document.body.style.overflow = '';
            navToggle.focus();
        };

        navToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const expanded = navToggle.getAttribute('aria-expanded') === 'true' || false;
            navToggle.setAttribute('aria-expanded', !expanded);
            navToggle.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
            mobileMenu.classList.toggle('open');
            document.body.style.overflow = expanded ? '' : 'hidden';
            if (!expanded) {
                setTimeout(() => {
                    const firstLink = mobileMenu.querySelector('a');
                    if (firstLink) firstLink.focus();
                }, 100);
            } else {
                navToggle.focus();
            }
        });

        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
                closeMenu();
            }
        });

        document.addEventListener('click', (event) => {
            if (
                mobileMenu.classList.contains('open') &&
                !header.contains(event.target) &&
                !mobileMenu.contains(event.target)
            ) {
                closeMenu();
            }
        });
    }

    // ===== Smooth Scroll with focus management =====
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const headerHeight = header.offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                target.setAttribute('tabindex', '-1');
                target.focus({ preventScroll: true });
            }
        });
    });

    // ===== Scroll-triggered Animations =====
    const animatedElements = document.querySelectorAll('.animate-on-scroll, .prop-card, .package-card, .testimonial-card, .process-steps li, .gallery-grid figure');
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
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        animatedElements.forEach(el => observer.observe(el));
    } else {
        animatedElements.forEach(el => el.classList.add('visible'));
    }

    // ===== Section Title Animation =====
    const sectionTitles = document.querySelectorAll('.section-title');
    if (sectionTitles.length) {
        const titleObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    titleObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        sectionTitles.forEach(title => titleObserver.observe(title));
    }

    // ===== FAQ Accordion: One open at a time, close on outside click =====
    const faqDetails = document.querySelectorAll('.faq details');
    if (faqDetails.length) {
        faqDetails.forEach(detail => {
            detail.addEventListener('toggle', () => {
                if (detail.open) {
                    faqDetails.forEach(other => {
                        if (other !== detail) {
                            other.open = false;
                        }
                    });
                }
            });
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.faq')) {
                faqDetails.forEach(detail => {
                    detail.open = false;
                });
            }
        });
    }

    // ===== Quick Book Form =====
    const quickBookForm = document.getElementById('quick-book-form');
    if (quickBookForm) {
        quickBookForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('qb-name').value.trim();
            const service = document.getElementById('qb-service').value;
            const time = document.getElementById('qb-time').value;

            let message = `Hi SharpFades! I'd like to book a ${service || 'cut'} appointment.`;
            if (name) message += ` My name is ${name}.`;
            if (time) {
                const formattedTime = new Date(time).toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' });
                message += ` My preferred time is: ${formattedTime}.`;
            }
            message += ` What times do you have available?`;

            const whatsappUrl = `https://wa.me/254702555093?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank', 'noopener');
        });
    }

    // ===== Staggered Hero Title Reveal =====
    const heroWords = document.querySelectorAll('.hero-title-word');
    if (heroWords.length) {
        heroWords.forEach((word, index) => {
            setTimeout(() => {
                word.classList.add('visible');
            }, 100 + index * 80);
        });
    }

    // ===== 3D Tilt on Cards (only on devices that support hover) =====
    if (!isTouchDevice) {
        const tiltElements = document.querySelectorAll('.service-card, .package-card, .gallery-grid figure');

        tiltElements.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -8;
                const rotateY = ((x - centerX) / centerX) * 8;

                card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(600px) rotateX(0) rotateY(0)';
            });
        });
    }

    // ===== Magnetic Buttons (only on devices that support hover) =====
    if (!isTouchDevice) {
        const magneticButtons = document.querySelectorAll('.btn-whatsapp, .btn-outline');
        magneticButtons.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate(0, 0)';
            });
        });
    }
});

// Toggle dropdown on click (existing)
const dropdown = document.querySelector('.dropdown');
const dropdownToggle = document.querySelector('.dropdown-toggle');

if (dropdownToggle) {
    dropdownToggle.addEventListener('click', (e) => {
        e.preventDefault();
        dropdown.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) {
            dropdown.classList.remove('open');
        }
    });
}
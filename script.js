document.addEventListener('DOMContentLoaded', () => {
    // ===== Unified Scroll Handler (Header, Mobile Sticky Bar, Back-to-Top) =====
    const header = document.getElementById('site-header');
    const mobileStickyBar = document.getElementById('mobile-sticky-bar');
    const backToTop = document.getElementById('back-to-top');
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
        // Helper to manage focus
        const focusMenu = () => {
            const firstLink = mobileMenu.querySelector('a');
            if (firstLink) firstLink.focus();
        };
        const closeMenu = () => {
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.setAttribute('aria-label', 'Open navigation');
            mobileMenu.classList.remove('open');
            document.body.style.overflow = '';
            // Return focus to toggle
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
                // just opened
                setTimeout(focusMenu, 100); // allow animation
            } else {
                // just closed
                navToggle.focus();
            }
        });

        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                closeMenu();
            });
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

            let message = `Hi SharpFades, I'd like to book a ${service || 'cut'}.`;
            if (name) message += ` My name is ${name}.`;
            if (time) {
                const formattedTime = new Date(time).toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' });
                message += ` Preferred time: ${formattedTime}.`;
            }

            const whatsappUrl = `https://wa.me/254702555093?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank', 'noopener');
        });
    }
});
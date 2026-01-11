/**
 * Single Page Smooth Scrolling & Navigation
 * Handles smooth scroll, active nav highlighting, and section animations
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        scrollOffset: 80,
        throttleDelay: 100,
        animationThreshold: 0.15
    };

    // DOM Elements
    let navItems = [];
    let sections = [];
    let scrollProgressBar = null;

    /**
     * Initialize the single page functionality
     */
    function init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setup);
        } else {
            setup();
        }
    }

    /**
     * Setup all functionality
     */
    function setup() {
        cacheElements();
        createScrollProgress();
        setupSmoothScroll();
        setupScrollSpy();
        setupSectionAnimations();
        setupScrollIndicator();
        handleInitialHash();
    }

    /**
     * Cache DOM elements
     */
    function cacheElements() {
        navItems = document.querySelectorAll('.nav-item[data-section]');
        sections = document.querySelectorAll('.page-section');
    }

    /**
     * Create scroll progress indicator
     */
    function createScrollProgress() {
        scrollProgressBar = document.createElement('div');
        scrollProgressBar.className = 'scroll-progress';
        document.body.appendChild(scrollProgressBar);
    }

    /**
     * Setup smooth scrolling for navigation links
     */
    function setupSmoothScroll() {
        navItems.forEach(item => {
            item.addEventListener('click', handleNavClick);
        });
    }

    /**
     * Handle navigation click
     */
    function handleNavClick(e) {
        const sectionId = this.getAttribute('data-section');
        const targetSection = document.getElementById(sectionId);

        if (targetSection) {
            e.preventDefault();
            
            // Calculate scroll position with offset
            const targetPosition = targetSection.offsetTop - CONFIG.scrollOffset;
            
            // Smooth scroll
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            // Update URL hash without jumping
            history.pushState(null, null, `#${sectionId}`);

            // Update active state
            updateActiveNav(sectionId);
        }
    }

    /**
     * Setup scroll spy to highlight active section
     */
    function setupScrollSpy() {
        let ticking = false;

        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(function() {
                    updateOnScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    /**
     * Update active nav and progress on scroll
     */
    function updateOnScroll() {
        updateScrollProgress();
        updateActiveSectionOnScroll();
    }

    /**
     * Update scroll progress bar
     */
    function updateScrollProgress() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        
        if (scrollProgressBar) {
            scrollProgressBar.style.width = `${scrollPercent}%`;
        }
    }

    /**
     * Update active navigation based on scroll position
     */
    function updateActiveSectionOnScroll() {
        const scrollPosition = window.pageYOffset + CONFIG.scrollOffset + 100;
        let currentSection = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });

        // Handle edge case: at bottom of page, highlight last section
        if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight - 50) {
            const lastSection = sections[sections.length - 1];
            if (lastSection) {
                currentSection = lastSection.getAttribute('id');
            }
        }

        if (currentSection) {
            updateActiveNav(currentSection);
        }
    }

    /**
     * Update active navigation item
     */
    function updateActiveNav(sectionId) {
        navItems.forEach(item => {
            const itemSection = item.getAttribute('data-section');
            
            if (itemSection === sectionId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    /**
     * Setup Intersection Observer for section animations
     */
    function setupSectionAnimations() {
        if (!('IntersectionObserver' in window)) {
            // Fallback: just show all sections
            sections.forEach(section => section.classList.add('visible'));
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: CONFIG.animationThreshold,
            rootMargin: '0px 0px -50px 0px'
        });

        sections.forEach(section => {
            observer.observe(section);
        });
    }

    /**
     * Setup scroll indicator click
     */
    function setupScrollIndicator() {
        const scrollIndicator = document.querySelector('.scroll-indicator');
        
        if (scrollIndicator) {
            scrollIndicator.addEventListener('click', function() {
                const aboutSection = document.getElementById('about');
                if (aboutSection) {
                    const targetPosition = aboutSection.offsetTop - CONFIG.scrollOffset;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        }
    }

    /**
     * Handle initial URL hash
     */
    function handleInitialHash() {
        const hash = window.location.hash;
        
        if (hash) {
            const sectionId = hash.substring(1);
            const targetSection = document.getElementById(sectionId);

            if (targetSection) {
                // Small delay to ensure proper positioning after page load
                setTimeout(() => {
                    const targetPosition = targetSection.offsetTop - CONFIG.scrollOffset;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    updateActiveNav(sectionId);
                }, 100);
            }
        } else {
            // No hash, highlight home
            updateActiveNav('home');
        }
    }

    // Initialize
    init();

})();


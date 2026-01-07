/**
 * PaperMod-inspired functionality for blog posts
 */

document.addEventListener('DOMContentLoaded', function () {
    // Add header anchors to h2, h3, h4 elements (PaperMod signature)
    const content = document.getElementById('post-content');
    if (content) {
        const headers = content.querySelectorAll('h2, h3, h4');
        headers.forEach(function (header) {
            // Create slug from header text if ID doesn't exist
            if (!header.id) {
                const text = header.textContent.trim();
                const slug = text.toLowerCase()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/\s+/g, '-');
                header.id = slug;
            }

            // Create anchor link
            const anchor = document.createElement('a');
            anchor.href = '#' + header.id;
            anchor.className = 'header-anchor';
            anchor.textContent = '#';
            anchor.setAttribute('aria-hidden', 'true');

            header.appendChild(anchor);
        });
    }

    // Back to top button visibility
    const backToTop = document.getElementById('back-to-top');
    if (backToTop) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });
    }
});

// Reading progress bar
window.addEventListener('scroll', function () {
    const article = document.querySelector('.papermod-post');
    const progressBar = document.getElementById('reading-progress');

    if (article && progressBar) {
        const articleTop = article.offsetTop;
        const articleHeight = article.offsetHeight;
        const windowHeight = window.innerHeight;
        const scrollTop = window.scrollY;

        const progress = Math.min(100, Math.max(0,
            ((scrollTop - articleTop + windowHeight * 0.5) / articleHeight) * 100
        ));

        progressBar.style.width = progress + '%';
    }
});

// Smooth scroll to top
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

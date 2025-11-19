document.addEventListener('DOMContentLoaded', () => {
    // Game State
    let gameState = JSON.parse(localStorage.getItem('blogGameState')) || {
        xp: 0,
        level: 1,
        nextLevelXp: 100
    };

    const xpBar = document.getElementById('xp-bar');
    const levelDisplay = document.getElementById('level-display');
    const xpDisplay = document.getElementById('xp-display');
    
    // Update UI
    function updateUI() {
        if(levelDisplay) levelDisplay.innerText = gameState.level;
        if(xpDisplay) xpDisplay.innerText = `${Math.floor(gameState.xp)} / ${gameState.nextLevelXp}`;
        
        // Update XP bar
        if(xpBar) {
            const percentage = Math.min((gameState.xp / gameState.nextLevelXp) * 100, 100);
            xpBar.style.width = `${percentage}%`;
        }
    }

    // Add XP
    function addXP(amount) {
        gameState.xp += amount;
        
        // Check Level Up
        if (gameState.xp >= gameState.nextLevelXp) {
            levelUp();
        }
        
        saveGame();
        updateUI();
    }

    function levelUp() {
        gameState.level++;
        const oldXp = gameState.xp;
        gameState.xp = 0;
        gameState.nextLevelXp = Math.floor(gameState.nextLevelXp * 1.5);
        
        // Show Toast
        const toast = document.getElementById('levelup-toast');
        if(toast) {
            toast.classList.add('active');
            setTimeout(() => toast.classList.remove('active'), 3000);
        }
        
        // Play level up sound (optional - you can add audio file)
        // const audio = new Audio('/assets/sounds/levelup.mp3');
        // audio.play().catch(e => console.log('Audio play failed:', e));
    }

    function saveGame() {
        localStorage.setItem('blogGameState', JSON.stringify(gameState));
    }

    // Scroll Listener for Reading XP
    let maxScroll = 0;
    let scrollTimeout;
    
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;

            // Only award XP for new ground covered
            if (scrolled > maxScroll && height > 0) {
                const diff = scrolled - maxScroll;
                if (diff > 1) { // Optimization: only update every 1%
                    addXP(diff * 0.5); // 0.5 XP per 1% scrolled
                    maxScroll = scrolled;
                }
            }
        }, 100); // Throttle scroll events
    });

    // Award XP for time spent on page
    let timeSpent = 0;
    setInterval(() => {
        timeSpent += 1;
        if (timeSpent % 10 === 0) { // Every 10 seconds
            addXP(1); // 1 XP per 10 seconds
        }
    }, 1000);

    // Initial UI Set
    updateUI();
});


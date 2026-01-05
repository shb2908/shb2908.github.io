/**
 * Default Layout JavaScript
 * MathJax configuration
 */

// MathJax Configuration
window.MathJax = {
    tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']],
        displayMath: [['$$', '$$'], ['\\[', '\\]']],
        processEscapes: true
    },
    options: {
        enableSpeech: false,
        enableBraille: false
    }
};

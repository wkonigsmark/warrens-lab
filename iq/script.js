/**
 * IQ Hub — script.js
 * Minimal. Just a subtle cursor glow that follows the mouse
 * to give the white canvas a sense of life without being showy.
 */

document.addEventListener('mousemove', (e) => {
    // Subtle warm glow that follows cursor — barely perceptible, like light through mist
    const glow = document.getElementById('cursor-glow');
    if (glow) {
        glow.style.left = `${e.clientX}px`;
        glow.style.top  = `${e.clientY}px`;
    }
});

// Inject the glow element once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const glow = document.createElement('div');
    glow.id = 'cursor-glow';
    glow.style.cssText = `
        position: fixed;
        pointer-events: none;
        width: 320px;
        height: 320px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(200,210,230,0.18) 0%, transparent 70%);
        transform: translate(-50%, -50%);
        transition: left 0.6s ease, top 0.6s ease;
        z-index: 0;
    `;
    document.body.appendChild(glow);
});

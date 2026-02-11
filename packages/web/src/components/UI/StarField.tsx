import React, { useRef, useEffect } from 'react';
import './StarField.css';

interface Star {
    x: number;
    y: number;
    size: number;
    speed: number;
    opacity: number;
}

export const StarField: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let stars: Star[] = [];

        // Check for theme to set particle color
        const getParticleColor = () => {
            const isLight = document.documentElement.getAttribute('data-theme') === 'light';
            return isLight ? 'rgba(139, 69, 19, 0.6)' : 'rgba(255, 255, 255, 0.8)';
        };

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initStars();
        };

        const initStars = () => {
            stars = [];
            const numStars = Math.floor((canvas.width * canvas.height) / 4000); // 1 star per 4000px
            for (let i = 0; i < numStars; i++) {
                stars.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 1.5 + 0.5,
                    speed: Math.random() * 0.2 + 0.05,
                    opacity: Math.random() * 0.8 + 0.2
                });
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = getParticleColor();

            stars.forEach(star => {
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.globalAlpha = star.opacity;
                ctx.fill();

                // Move star
                star.y -= star.speed;
                // Wrap around
                if (star.y < 0) {
                    star.y = canvas.height;
                    star.x = Math.random() * canvas.width;
                }
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        // Observe theme changes
        const observer = new MutationObserver(() => {
            // Theme changed, re-render frame immediately with new color
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            observer.disconnect();
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="starfield-canvas" />;
};

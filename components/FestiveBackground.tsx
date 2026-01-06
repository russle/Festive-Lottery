// 節慶背景元件 - Canvas 粒子動畫
import React, { useRef, useEffect } from 'react';

interface Particle {
    x: number;
    y: number;
    size: number;
    speedY: number;
    speedX: number;
    color: string;
}

const PARTICLE_COUNT = 60;
const COLORS = ['#FCD34D', '#FBBF24', '#F87171', '#FFFFFF'];

export const FestiveBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;
        let particles: Particle[] = [];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const initParticles = () => {
            particles = Array.from({ length: PARTICLE_COUNT }, () => ({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 4 + 1,
                speedY: Math.random() * 0.5 + 0.2,
                speedX: Math.random() * 0.4 - 0.2,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
            }));
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 繪製背景漸層
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#4a0404');
            gradient.addColorStop(0.5, '#581c87');
            gradient.addColorStop(1, '#2e1065');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 繪製粒子
            particles.forEach(p => {
                p.y -= p.speedY;
                p.x += p.speedX;
                if (p.y < 0) p.y = canvas.height;
                if (p.x > canvas.width) p.x = 0;
                if (p.x < 0) p.x = canvas.width;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = 0.6;
                ctx.fill();
                ctx.globalAlpha = 1;
            });

            animationId = requestAnimationFrame(animate);
        };

        window.addEventListener('resize', resize);
        resize();
        initParticles();
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 z-0 pointer-events-none"
        />
    );
};

export default FestiveBackground;

import React, { useEffect, useRef } from 'react';

export const CosmicBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Keep most streaks near the edges so the playing field stays readable.
    const starCount = 140;
    const stars: { x: number; y: number; r: number; alpha: number; color: string }[] = [];
    const colors = ['#ffffff', '#bae6fd', '#fef08a', '#e9d5ff', '#c7d2fe'];

    for (let i = 0; i < starCount; i++) {
      const side = Math.random() < 0.5 ? 0 : 1;
      stars.push({
        x: side === 0 ? Math.random() * window.innerWidth * 0.24 : window.innerWidth * (0.76 + Math.random() * 0.24),
        y: Math.random() * window.innerHeight,
        r: Math.random() < 0.2 ? 1.8 : Math.random() < 0.6 ? 1.2 : 0.8,
        alpha: Math.random() * 0.8 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    type Visitor = { kind: 'ufo' | 'satellite' | 'planet'; x: number; y: number; size: number; speed: number; phase: number };
    const visitors: Visitor[] = [];
    let nextVisitorIn = 3 + Math.random() * 5;

    let time = 0;
    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Deep space gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGrad.addColorStop(0, '#030712'); // Deep obsidian void
      bgGrad.addColorStop(0.5, '#0b0f1e');
      bgGrad.addColorStop(1, '#08051a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Cosmic Nebulae (soft glowing orbs)
      const g1 = ctx.createRadialGradient(
        canvas.width * 0.2,
        canvas.height * 0.25,
        10,
        canvas.width * 0.2,
        canvas.height * 0.25,
        canvas.width * 0.4
      );
      g1.addColorStop(0, 'rgba(99, 102, 241, 0.18)'); // Indigo nebula
      g1.addColorStop(0.6, 'rgba(139, 92, 246, 0.08)');
      g1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const g2 = ctx.createRadialGradient(
        canvas.width * 0.8,
        canvas.height * 0.7,
        10,
        canvas.width * 0.8,
        canvas.height * 0.7,
        canvas.width * 0.45
      );
      g2.addColorStop(0, 'rgba(236, 72, 153, 0.14)'); // Magenta stardust
      g2.addColorStop(0.7, 'rgba(6, 182, 212, 0.06)');
      g2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Keep stars still so the board stays visually calm.
      for (const s of stars) {
        ctx.save();
        ctx.globalAlpha = s.alpha;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      nextVisitorIn -= 0.02;
      if (nextVisitorIn <= 0 && visitors.length < 2) {
        visitors.push({
          kind: (['ufo', 'satellite', 'planet'] as const)[Math.floor(Math.random() * 3)],
          x: -70,
          y: canvas.height * (0.12 + Math.random() * 0.68),
          size: 12 + Math.random() * 13,
          speed: 0.35 + Math.random() * 0.45,
          phase: Math.random() * Math.PI * 2,
        });
        nextVisitorIn = 8 + Math.random() * 9;
      }

      for (let i = visitors.length - 1; i >= 0; i--) {
        const visitor = visitors[i];
        visitor.x += visitor.speed;
        const y = visitor.y + Math.sin(time + visitor.phase) * 9;
        ctx.save();
        ctx.translate(visitor.x, y);
        ctx.globalAlpha = 0.68;
        ctx.shadowBlur = 12;

        if (visitor.kind === 'ufo') {
          ctx.shadowColor = '#67e8f9';
          ctx.fillStyle = 'rgba(103, 232, 249, 0.16)';
          ctx.beginPath();
          ctx.moveTo(-visitor.size * 0.7, 3);
          ctx.lineTo(visitor.size * 0.7, 3);
          ctx.lineTo(visitor.size * 0.35, visitor.size * 1.1);
          ctx.lineTo(-visitor.size * 0.35, visitor.size * 1.1);
          ctx.fill();
          ctx.fillStyle = '#a5f3fc';
          ctx.beginPath();
          ctx.ellipse(0, 0, visitor.size, visitor.size * 0.3, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#22d3ee';
          ctx.beginPath();
          ctx.ellipse(0, -visitor.size * 0.18, visitor.size * 0.45, visitor.size * 0.42, 0, Math.PI, Math.PI * 2);
          ctx.fill();
          for (let light = -1; light <= 1; light++) {
            ctx.fillStyle = light === 0 ? '#fef08a' : '#c4b5fd';
            ctx.beginPath();
            ctx.arc(light * visitor.size * 0.5, 1, 1.3, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (visitor.kind === 'satellite') {
          ctx.shadowColor = '#c4b5fd';
          ctx.rotate(Math.sin(time * 0.4 + visitor.phase) * 0.18);
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(-visitor.size * 0.2, -visitor.size * 0.2, visitor.size * 0.4, visitor.size * 0.4);
          ctx.fillStyle = '#818cf8';
          ctx.fillRect(-visitor.size, -visitor.size * 0.15, visitor.size * 0.65, visitor.size * 0.3);
          ctx.fillRect(visitor.size * 0.35, -visitor.size * 0.15, visitor.size * 0.65, visitor.size * 0.3);
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, -visitor.size * 0.2);
          ctx.lineTo(visitor.size * 0.25, -visitor.size * 0.55);
          ctx.stroke();
        } else {
          ctx.shadowColor = '#f9a8d4';
          const planet = ctx.createRadialGradient(-visitor.size * 0.3, -visitor.size * 0.35, 1, 0, 0, visitor.size);
          planet.addColorStop(0, '#fbcfe8');
          planet.addColorStop(1, '#7c3aed');
          ctx.fillStyle = planet;
          ctx.beginPath();
          ctx.arc(0, 0, visitor.size * 0.62, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = 'rgba(196, 181, 253, 0.8)';
          ctx.lineWidth = Math.max(1.5, visitor.size * 0.1);
          ctx.beginPath();
          ctx.ellipse(0, 0, visitor.size, visitor.size * 0.28, -0.22, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.restore();
        if (visitor.x > canvas.width + 80) visitors.splice(i, 1);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0 w-full h-full" />;
};

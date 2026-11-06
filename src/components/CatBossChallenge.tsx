import React, { useEffect, useRef, useState } from 'react';
import { Language } from '../types/game';
import { puzzleSounds } from '../audio/puzzleSounds';

interface Point {
  x: number;
  y: number;
}

interface Projectile extends Point {
  vx: number;
  vy: number;
}

interface BossGameState {
  drag: Point | null;
  projectile: Projectile | null;
  remaining: number;
  hits: number;
  splats: Point[];
  ready: boolean;
}

interface CatBossChallengeProps {
  lang: Language;
  onHit: () => void;
  onComplete: (hits: number) => void;
}

const MAX_SHOTS = 3;

function constrainPull(point: Point, anchor: Point): Point {
  const dx = point.x - anchor.x;
  const dy = point.y - anchor.y;
  const distance = Math.hypot(dx, dy);
  const limit = 175;
  return distance > limit
    ? { x: anchor.x + (dx / distance) * limit, y: anchor.y + (dy / distance) * limit }
    : point;
}

function drawBoss(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, splats: Point[]) {
  const width = 142 * scale;
  const height = 152 * scale;
  const left = x - width / 2;
  const top = y - height / 2;
  ctx.save();
  ctx.shadowColor = '#f472b6';
  ctx.shadowBlur = 28 * scale;
  ctx.fillStyle = '#030303';
  ctx.strokeStyle = '#f9a8d4';
  ctx.lineWidth = 3 * scale;
  ctx.beginPath();
  ctx.roundRect(left, top, width, height, 5 * scale);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;

  const headX = x;
  const headY = y + 4 * scale;
  ctx.fillStyle = '#ffcb9c';
  ctx.strokeStyle = '#fff7ed';
  ctx.lineWidth = 2 * scale;
  ctx.beginPath();
  ctx.moveTo(headX - 48 * scale, headY - 5 * scale);
  ctx.lineTo(headX - 40 * scale, headY - 57 * scale);
  ctx.lineTo(headX - 7 * scale, headY - 35 * scale);
  ctx.lineTo(headX + 8 * scale, headY - 35 * scale);
  ctx.lineTo(headX + 41 * scale, headY - 58 * scale);
  ctx.lineTo(headX + 48 * scale, headY - 5 * scale);
  ctx.quadraticCurveTo(headX + 57 * scale, headY + 45 * scale, headX, headY + 49 * scale);
  ctx.quadraticCurveTo(headX - 57 * scale, headY + 45 * scale, headX - 48 * scale, headY - 5 * scale);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#f9a8d4';
  ctx.beginPath();
  ctx.moveTo(headX - 35 * scale, headY - 45 * scale);
  ctx.lineTo(headX - 15 * scale, headY - 33 * scale);
  ctx.lineTo(headX - 31 * scale, headY - 18 * scale);
  ctx.moveTo(headX + 35 * scale, headY - 45 * scale);
  ctx.lineTo(headX + 15 * scale, headY - 33 * scale);
  ctx.lineTo(headX + 31 * scale, headY - 18 * scale);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(headX - 19 * scale, headY - 3 * scale, 12 * scale, 16 * scale, -0.15, 0, Math.PI * 2);
  ctx.ellipse(headX + 19 * scale, headY - 3 * scale, 12 * scale, 16 * scale, 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#111827';
  ctx.beginPath();
  ctx.arc(headX - 14 * scale, headY + 1 * scale, 5.5 * scale, 0, Math.PI * 2);
  ctx.arc(headX + 14 * scale, headY - 1 * scale, 5.5 * scale, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#7c2d12';
  ctx.lineWidth = 3 * scale;
  ctx.beginPath();
  ctx.moveTo(headX - 31 * scale, headY - 25 * scale);
  ctx.quadraticCurveTo(headX - 21 * scale, headY - 31 * scale, headX - 11 * scale, headY - 22 * scale);
  ctx.moveTo(headX + 11 * scale, headY - 22 * scale);
  ctx.quadraticCurveTo(headX + 22 * scale, headY - 31 * scale, headX + 31 * scale, headY - 25 * scale);
  ctx.stroke();

  ctx.fillStyle = '#fb7185';
  ctx.beginPath();
  ctx.moveTo(headX - 6 * scale, headY + 18 * scale);
  ctx.lineTo(headX + 6 * scale, headY + 18 * scale);
  ctx.lineTo(headX, headY + 26 * scale);
  ctx.fill();
  ctx.fillStyle = '#7f1d1d';
  ctx.beginPath();
  ctx.ellipse(headX, headY + 34 * scale, 14 * scale, 13 * scale, 0, 0, Math.PI);
  ctx.fill();
  ctx.fillStyle = '#fda4af';
  ctx.beginPath();
  ctx.ellipse(headX, headY + 43 * scale, 7 * scale, 7 * scale, 0, 0, Math.PI);
  ctx.fill();

  ctx.strokeStyle = '#fff7ed';
  ctx.lineWidth = 1.5 * scale;
  for (const direction of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(headX + direction * 13 * scale, headY + 20 * scale);
    ctx.lineTo(headX + direction * 51 * scale, headY + 13 * scale);
    ctx.moveTo(headX + direction * 13 * scale, headY + 25 * scale);
    ctx.lineTo(headX + direction * 51 * scale, headY + 30 * scale);
    ctx.stroke();
  }
  for (const splat of splats) {
    ctx.fillStyle = splat.x < 0 ? '#38bdf8' : '#facc15';
    ctx.beginPath();
    ctx.arc(x + splat.x * scale, y + splat.y * scale, 9 * scale, 0, Math.PI * 2);
    ctx.arc(x + (splat.x + 7) * scale, y + (splat.y - 5) * scale, 4 * scale, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export const CatBossChallenge: React.FC<CatBossChallengeProps> = ({ lang, onHit, onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onHitRef = useRef(onHit);
  onHitRef.current = onHit;
  const gameRef = useRef<BossGameState>({
    drag: null,
    projectile: null,
    remaining: MAX_SHOTS,
    hits: 0,
    splats: [],
    ready: false,
  });
  const [remainingShots, setRemainingShots] = useState(MAX_SHOTS);
  const [hits, setHits] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let frameId = 0;
    let lastFrame = 0;
    const startTime = performance.now();
    const render = (now: number) => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const delta = lastFrame ? Math.min((now - lastFrame) / 1000, 0.035) : 0;
      lastFrame = now;
      const time = (now - startTime) / 1000;
      const game = gameRef.current;
      const anchor = { x: width / 2, y: height - Math.max(130, height * 0.18) };
      const bossX = width / 2 + Math.sin(time * 0.28) * width * 0.18;
      const bossY = height * 0.28 + Math.sin(time * 0.7) * 7;
      const bossScale = Math.min(1, width / 420);

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(2, 6, 23, 0.93)';
      ctx.fillRect(0, 0, width, height);
      for (let i = 0; i < 54; i++) {
        const x = (i * 197) % width;
        const y = (i * 83) % height;
        ctx.fillStyle = `rgba(186, 230, 253, ${0.22 + (i % 5) * 0.1})`;
        ctx.beginPath();
        ctx.arc(x, y, i % 9 === 0 ? 1.6 : 1, 0, Math.PI * 2);
        ctx.fill();
      }
      drawBoss(ctx, bossX, bossY, bossScale, game.splats);

      ctx.strokeStyle = '#a16207';
      ctx.lineWidth = 9;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(anchor.x, anchor.y + 55);
      ctx.lineTo(anchor.x - 31, anchor.y - 28);
      ctx.moveTo(anchor.x, anchor.y + 55);
      ctx.lineTo(anchor.x + 31, anchor.y - 28);
      ctx.stroke();
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(anchor.x - 31, anchor.y - 28);
      ctx.lineTo(game.drag?.x ?? anchor.x, game.drag?.y ?? anchor.y);
      ctx.lineTo(anchor.x + 31, anchor.y - 28);
      ctx.stroke();
      if (!game.drag && !game.projectile && game.remaining > 0) {
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 16;
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(anchor.x, anchor.y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      if (game.drag && game.remaining > 0) {
        const dx = anchor.x - game.drag.x;
        const dy = anchor.y - game.drag.y;
        const vx = dx * 7;
        const vy = dy * 7;
        for (let t = 0.08; t < 2.4; t += 0.12) {
          const x = anchor.x + vx * t;
          const y = anchor.y + vy * t + 0.5 * 520 * t * t;
          if (y > height || x < 0 || x > width) break;
          ctx.globalAlpha = 1 - t / 2;
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(x, y, Math.max(1.5, 4 - t), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      if (game.projectile) {
        const ball = game.projectile;
        ball.x += ball.vx * delta;
        ball.y += ball.vy * delta;
        ball.vy += 520 * delta;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 18;
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        if (Math.hypot(ball.x - bossX, ball.y - bossY) < 120 * bossScale) {
          game.projectile = null;
          game.hits++;
          game.splats.push({ x: (Math.random() - 0.5) * 50, y: (Math.random() - 0.5) * 42 });
          setHits(game.hits);
          puzzleSounds.playPaintHit();
          onHitRef.current();
          if (game.remaining === 0) {
            game.ready = true;
            setReady(true);
          }
        } else if (ball.x < -25 || ball.x > width + 25 || ball.y > height + 25 || ball.y < -25) {
          game.projectile = null;
          puzzleSounds.playPaintMiss();
          if (game.remaining === 0) {
            game.ready = true;
            setReady(true);
          }
        }
      }

      for (let i = 0; i < game.remaining; i++) {
        ctx.fillStyle = i === 0 ? '#38bdf8' : i === 1 ? '#facc15' : '#f472b6';
        ctx.beginPath();
        ctx.arc(width / 2 - 30 + i * 30, height - 31, 8, 0, Math.PI * 2);
        ctx.fill();
      }

      frameId = requestAnimationFrame(render);
    };

    frameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frameId);
  }, []);

  const getCanvasPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const game = gameRef.current;
    if (game.remaining <= 0 || game.projectile || game.ready) return;
    const point = getCanvasPoint(event);
    const anchor = {
      x: event.currentTarget.clientWidth / 2,
      y: event.currentTarget.clientHeight - Math.max(130, event.currentTarget.clientHeight * 0.18),
    };
    if (Math.hypot(point.x - anchor.x, point.y - anchor.y) > 42) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    game.drag = point;
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!gameRef.current.drag) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const anchor = { x: rect.width / 2, y: rect.height - Math.max(130, rect.height * 0.18) };
    gameRef.current.drag = constrainPull(getCanvasPoint(event), anchor);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const game = gameRef.current;
    if (!game.drag) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const anchor = { x: rect.width / 2, y: rect.height - Math.max(130, rect.height * 0.18) };
    const point = constrainPull(getCanvasPoint(event), anchor);
    game.drag = null;
    const dx = anchor.x - point.x;
    const dy = anchor.y - point.y;
    if (Math.hypot(dx, dy) < 18) return;
    game.projectile = { x: anchor.x, y: anchor.y, vx: dx * 7, vy: dy * 7 };
    game.remaining--;
    setRemainingShots(game.remaining);
    puzzleSounds.playPaintShot();
  };

  const handlePointerCancel = () => {
    gameRef.current.drag = null;
  };

  const isRu = lang === 'ru';

  return (
    <div className="fixed inset-0 z-[60]">
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        className="absolute inset-0 h-full w-full touch-none"
        aria-label={isRu ? 'Мини-игра: рогатка с краской' : 'Paint slingshot mini-game'}
      />
      <div className="pointer-events-none absolute inset-x-0 top-3 text-center">
        <h2 className="text-xl font-black text-fuchsia-200 drop-shadow-lg sm:text-2xl">
          {isRu ? 'КОТ-БОСС!' : 'CAT BOSS!'}
        </h2>
        <p className="mt-1 text-xs font-bold text-slate-200 sm:text-sm">
          {isRu ? 'Натяни рогатку и испачкай его! Попаданий' : 'Pull back and splat the cat! Hits'}: {hits}/3
        </p>
        <p className="mt-1 text-[10px] text-slate-400 sm:text-xs">
          {isRu ? 'Потяни синий шарик на рогатке назад, чтобы прицелиться' : 'Drag the blue paintball on the slingshot back to aim'}
        </p>
      </div>
      <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-black text-yellow-200">
        {isRu ? `Шарики: ${remainingShots}/3` : `Paintballs: ${remainingShots}/3`}
      </div>
      {ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="w-full max-w-sm border-2 border-fuchsia-300/70 bg-black p-6 text-center text-white shadow-2xl">
            <div className="mb-2 text-4xl">{hits === 3 ? '😹' : hits > 0 ? '😼' : '😾'}</div>
            <h3 className="text-xl font-black text-fuchsia-200">
              {hits === 3 ? (isRu ? 'БОСС ОБЛЯПАН!' : 'BOSS SPLATTED!') : isRu ? 'Раунд завершён!' : 'Round complete!'}
            </h3>
            <p className="my-2 text-sm text-slate-300">
              {isRu ? `Попаданий: ${hits} из 3` : `Hits: ${hits} of 3`}
            </p>
            <button
              onClick={() => onComplete(hits)}
              className="mt-2 border border-emerald-300 bg-emerald-500 px-5 py-3 font-black text-slate-950 hover:bg-emerald-400"
            >
              {isRu ? 'ЗАБРАТЬ БОНУС И ДАЛЬШЕ' : 'CLAIM BONUS & CONTINUE'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

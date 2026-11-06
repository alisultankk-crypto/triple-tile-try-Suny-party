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
  color: string;
}

interface PaintSplat extends Point {
  radius: number;
  color: string;
  rotation: number;
}

interface BossGameState {
  drag: Point | null;
  projectile: Projectile | null;
  remaining: number;
  hits: number;
  splats: PaintSplat[];
  ready: boolean;
}

interface CatBossChallengeProps {
  lang: Language;
  level: number;
  onHit: () => void;
  onComplete: (hits: number) => void;
}

const MAX_SHOTS = 3;
const PAINT_COLORS = ['#38bdf8', '#facc15', '#f472b6'];

function constrainPull(point: Point, anchor: Point): Point {
  const dx = point.x - anchor.x;
  const dy = point.y - anchor.y;
  const distance = Math.hypot(dx, dy);
  const limit = 175;
  return distance > limit
    ? { x: anchor.x + (dx / distance) * limit, y: anchor.y + (dy / distance) * limit }
    : point;
}

function drawBoss(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, splats: PaintSplat[], level: number) {
  const hue = (level * 47 + level * level * 0.137) % 360;
  const coat = `hsl(${hue} 72% 78%)`;
  const coatShadow = `hsl(${hue} 48% 48%)`;
  const accent = `hsl(${(hue + 145) % 360} 90% 70%)`;
  const width = 142 * scale;
  const height = 152 * scale;
  const left = x - width / 2;
  const top = y - height / 2;
  ctx.save();
  ctx.shadowColor = accent;
  ctx.shadowBlur = 28 * scale;
  ctx.fillStyle = '#030303';
  ctx.strokeStyle = accent;
  ctx.lineWidth = 3 * scale;
  ctx.beginPath();
  ctx.roundRect(left, top, width, height, 5 * scale);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = accent;
  ctx.font = `900 ${10 * scale}px sans-serif`;
  ctx.textAlign = 'right';
  ctx.fillText(`#${level}`, left + width - 8 * scale, top + 14 * scale);

  const headX = x;
  const headY = y + 4 * scale;
  const faceScaleX = 0.9 + (level % 5) * 0.05;
  const faceScaleY = 0.94 + (level % 4) * 0.05;
  ctx.save();
  ctx.translate(headX, headY);
  ctx.scale(faceScaleX, faceScaleY);
  ctx.translate(-headX, -headY);
  ctx.fillStyle = coat;
  ctx.strokeStyle = '#fff7ed';
  ctx.lineWidth = 2 * scale;
  ctx.beginPath();
  ctx.moveTo(headX - 48 * scale, headY - 5 * scale);
  if (level % 4 === 1) {
    ctx.quadraticCurveTo(headX - 48 * scale, headY - 71 * scale, headX - 25 * scale, headY - 53 * scale);
  } else {
    ctx.lineTo(headX - (level % 4 === 2 ? 31 : 40) * scale, headY - (level % 4 === 3 ? 68 : 57) * scale);
  }
  ctx.lineTo(headX - 7 * scale, headY - 35 * scale);
  ctx.lineTo(headX + 8 * scale, headY - 35 * scale);
  if (level % 4 === 2) {
    ctx.quadraticCurveTo(headX + 55 * scale, headY - 71 * scale, headX + 41 * scale, headY - 12 * scale);
  } else {
    ctx.lineTo(headX + 41 * scale, headY - (level % 4 === 3 ? 68 : 58) * scale);
  }
  ctx.lineTo(headX + 48 * scale, headY - 5 * scale);
  ctx.quadraticCurveTo(headX + 57 * scale, headY + 45 * scale, headX, headY + 49 * scale);
  ctx.quadraticCurveTo(headX - 57 * scale, headY + 45 * scale, headX - 48 * scale, headY - 5 * scale);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.moveTo(headX - 35 * scale, headY - 45 * scale);
  ctx.lineTo(headX - 15 * scale, headY - 33 * scale);
  ctx.lineTo(headX - 31 * scale, headY - 18 * scale);
  ctx.moveTo(headX + 35 * scale, headY - 45 * scale);
  ctx.lineTo(headX + 15 * scale, headY - 33 * scale);
  ctx.lineTo(headX + 31 * scale, headY - 18 * scale);
  ctx.fill();

  if (level % 6 === 0) {
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.moveTo(headX - 30 * scale, headY - 43 * scale);
    ctx.lineTo(headX - 25 * scale, headY - 65 * scale);
    ctx.lineTo(headX - 10 * scale, headY - 54 * scale);
    ctx.lineTo(headX, headY - 70 * scale);
    ctx.lineTo(headX + 10 * scale, headY - 54 * scale);
    ctx.lineTo(headX + 25 * scale, headY - 65 * scale);
    ctx.lineTo(headX + 30 * scale, headY - 43 * scale);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#fff2a8';
    ctx.lineWidth = 2 * scale;
    ctx.stroke();
  } else if (level % 6 === 1) {
    ctx.fillStyle = '#7c3aed';
    ctx.beginPath();
    ctx.moveTo(headX - 34 * scale, headY - 47 * scale);
    ctx.lineTo(headX, headY - 73 * scale);
    ctx.lineTo(headX + 34 * scale, headY - 47 * scale);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(headX, headY - 70 * scale, 4 * scale, 0, Math.PI * 2);
    ctx.fill();
  } else if (level % 6 === 2) {
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 4 * scale;
    ctx.beginPath();
    ctx.moveTo(headX - 46 * scale, headY - 36 * scale);
    ctx.quadraticCurveTo(headX, headY - 51 * scale, headX + 46 * scale, headY - 36 * scale);
    ctx.stroke();
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(headX, headY - 45 * scale, 4 * scale, 0, Math.PI * 2);
    ctx.fill();
  } else if (level % 6 === 3) {
    ctx.fillStyle = coatShadow;
    ctx.beginPath();
    ctx.ellipse(headX - 40 * scale, headY - 36 * scale, 9 * scale, 15 * scale, -0.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (level % 6 === 4) {
    ctx.strokeStyle = '#67e8f9';
    ctx.lineWidth = 4 * scale;
    ctx.beginPath();
    ctx.moveTo(headX, headY - 53 * scale);
    ctx.lineTo(headX, headY - 68 * scale);
    ctx.stroke();
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.arc(headX, headY - 71 * scale, 6 * scale, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.moveTo(headX + 23 * scale, headY - 44 * scale);
    ctx.lineTo(headX + 38 * scale, headY - 60 * scale);
    ctx.lineTo(headX + 46 * scale, headY - 42 * scale);
    ctx.lineTo(headX + 34 * scale, headY - 47 * scale);
    ctx.fill();
  }

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  const eyeHeight = level % 4 === 0 ? 9 : 16;
  ctx.ellipse(headX - 19 * scale, headY - 3 * scale, 12 * scale, eyeHeight * scale, -0.15, 0, Math.PI * 2);
  ctx.ellipse(headX + 19 * scale, headY - 3 * scale, 12 * scale, eyeHeight * scale, 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `hsl(${(hue + 205) % 360} 75% 38%)`;
  ctx.beginPath();
  ctx.arc(headX - 14 * scale, headY + 1 * scale, 5.5 * scale, 0, Math.PI * 2);
  ctx.arc(headX + 14 * scale, headY - 1 * scale, 5.5 * scale, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#7c2d12';
  ctx.lineWidth = (level % 2 === 0 ? 3 : 4) * scale;
  ctx.beginPath();
  ctx.moveTo(headX - 31 * scale, headY - 25 * scale);
  ctx.quadraticCurveTo(headX - 21 * scale, headY - 31 * scale, headX - 11 * scale, headY - 22 * scale);
  ctx.moveTo(headX + 11 * scale, headY - 22 * scale);
  ctx.quadraticCurveTo(headX + 22 * scale, headY - 31 * scale, headX + 31 * scale, headY - 25 * scale);
  ctx.stroke();

  ctx.fillStyle = coatShadow;
  for (const direction of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(headX + direction * 34 * scale, headY + 13 * scale, 10 * scale, 6 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
  }
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
    ctx.save();
    ctx.translate(x + splat.x * scale, y + splat.y * scale);
    ctx.rotate(splat.rotation);
    ctx.fillStyle = splat.color;
    ctx.beginPath();
    ctx.arc(0, 0, splat.radius * scale, 0, Math.PI * 2);
    for (let drop = 0; drop < 8; drop++) {
      const angle = drop * Math.PI / 4;
      const distance = splat.radius * (0.78 + (drop % 2) * 0.36);
      ctx.arc(Math.cos(angle) * distance, Math.sin(angle) * distance, splat.radius * (drop % 2 ? 0.38 : 0.54), 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
  ctx.restore();
}

function drawSlingshot(ctx: CanvasRenderingContext2D, anchor: Point, pull: Point | null, ballColor: string, showBall: boolean) {
  const leftFork = { x: anchor.x - 31, y: anchor.y - 29 };
  const rightFork = { x: anchor.x + 31, y: anchor.y - 29 };
  const handleBottom = { x: anchor.x, y: anchor.y + 70 };

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#24160e';
  ctx.lineWidth = 24;
  ctx.beginPath();
  ctx.moveTo(handleBottom.x, handleBottom.y);
  ctx.quadraticCurveTo(anchor.x - 3, anchor.y + 22, anchor.x, anchor.y + 4);
  ctx.bezierCurveTo(anchor.x - 15, anchor.y - 12, anchor.x - 18, anchor.y - 34, leftFork.x, leftFork.y);
  ctx.moveTo(anchor.x, anchor.y + 4);
  ctx.bezierCurveTo(anchor.x + 15, anchor.y - 12, anchor.x + 18, anchor.y - 34, rightFork.x, rightFork.y);
  ctx.stroke();

  const wood = ctx.createLinearGradient(anchor.x - 30, anchor.y, anchor.x + 30, anchor.y + 55);
  wood.addColorStop(0, '#f3bd64');
  wood.addColorStop(0.45, '#a95826');
  wood.addColorStop(1, '#6d341b');
  ctx.strokeStyle = wood;
  ctx.lineWidth = 15;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255, 226, 160, 0.8)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(handleBottom.x - 5, handleBottom.y - 8);
  ctx.quadraticCurveTo(anchor.x - 7, anchor.y + 22, anchor.x - 3, anchor.y + 5);
  ctx.stroke();

  ctx.strokeStyle = '#4b1f1b';
  ctx.lineWidth = 4;
  for (let band = 0; band < 4; band++) {
    const bandY = anchor.y + 39 + band * 7;
    ctx.beginPath();
    ctx.moveTo(anchor.x - 7, bandY);
    ctx.lineTo(anchor.x + 7, bandY - 4);
    ctx.stroke();
  }
  ctx.fillStyle = '#f5d48a';
  for (const fork of [leftFork, rightFork]) {
    ctx.beginPath();
    ctx.arc(fork.x, fork.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  const pouch = pull ?? { x: anchor.x, y: anchor.y };
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(leftFork.x, leftFork.y);
  ctx.quadraticCurveTo((leftFork.x + pouch.x) / 2 - 7, (leftFork.y + pouch.y) / 2, pouch.x, pouch.y);
  ctx.moveTo(pouch.x, pouch.y);
  ctx.quadraticCurveTo((rightFork.x + pouch.x) / 2 + 7, (rightFork.y + pouch.y) / 2, rightFork.x, rightFork.y);
  ctx.stroke();

  if (showBall) {
    const ball = pull ?? anchor;
    ctx.shadowColor = ballColor;
    ctx.shadowBlur = 12;
    ctx.fillStyle = ballColor;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#dff7ff';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.restore();
}

export const CatBossChallenge: React.FC<CatBossChallengeProps> = ({ lang, level, onHit, onComplete }) => {
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
      drawBoss(ctx, bossX, bossY, bossScale, game.splats, level);
      const currentPaint = PAINT_COLORS[Math.min(MAX_SHOTS - 1, MAX_SHOTS - game.remaining)];
      drawSlingshot(ctx, anchor, game.drag, currentPaint, !game.projectile && game.remaining > 0);

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
        ctx.shadowColor = ball.color;
        ctx.shadowBlur = 18;
        ctx.fillStyle = ball.color;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        if (Math.hypot(ball.x - bossX, ball.y - bossY) < 120 * bossScale) {
          game.projectile = null;
          game.hits++;
          const color = ball.color;
          for (let splat = 0; splat < 7; splat++) {
            game.splats.push({
              x: (Math.random() - 0.5) * 76,
              y: (Math.random() - 0.5) * 72,
              radius: 8 + Math.random() * 9,
              color,
              rotation: Math.random() * Math.PI * 2,
            });
          }
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
        ctx.fillStyle = PAINT_COLORS[Math.min(MAX_SHOTS - 1, MAX_SHOTS - game.remaining + i)];
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
    const color = PAINT_COLORS[Math.min(MAX_SHOTS - 1, MAX_SHOTS - game.remaining)];
    game.projectile = { x: anchor.x, y: anchor.y, vx: dx * 7, vy: dy * 7, color };
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

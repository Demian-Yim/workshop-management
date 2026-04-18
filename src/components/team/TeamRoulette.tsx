'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Matter from 'matter-js';

const { Engine, Bodies, Body, Composite, Events } = Matter;

const CW = 480;
const CH = 560;
const MR = 13;
const PR = 6;
const PEG_SX = 44;
const PEG_SY = 52;
const PEG_ROWS = 9;
const PEG_Y0 = 80;
const FINISH_Y = 520;

const MARBLE_COLORS = [
  '#e94560','#ff922b','#ffd43b','#51cf66','#4dabf7',
  '#da77f2','#74c0fc','#f06595','#63e6be','#a9e34b',
  '#ff8787','#9775fa','#66d9e8','#ffa94d','#38d9a9',
  '#fd7e14','#cc5de8','#20c997','#339af0','#94d82d',
];

export interface RouletteParticipant {
  id: string;
  name: string;
}

export interface RouletteResult {
  rank: 1 | 2 | 3;
  participant: RouletteParticipant;
}

interface TeamRouletteProps {
  participants: RouletteParticipant[];
  onResult?: (results: RouletteResult[]) => void;
  dark?: boolean;
}

function shadeHex(hex: string, amt: number): string {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (n >> 16) + amt));
  const g = Math.min(255, Math.max(0, ((n >> 8) & 0xff) + amt));
  const b = Math.min(255, Math.max(0, (n & 0xff) + amt));
  return `rgb(${r},${g},${b})`;
}

type GameState = 'idle' | 'running' | 'finished';

export default function TeamRoulette({ participants, onResult, dark = true }: TeamRouletteProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const pegBodiesRef = useRef<Matter.Body[]>([]);
  const marbleListRef = useRef<Matter.Body[]>([]);
  const activeSetRef = useRef<Set<Matter.Body>>(new Set());
  const marbleDataRef = useRef<Map<number, { participant: RouletteParticipant; color: string; won: boolean }>>(new Map());
  const winnersRef = useRef<RouletteResult[]>([]);
  const rafRef = useRef<number>(0);
  const launchTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const [gameState, setGameState] = useState<GameState>('idle');
  const [winners, setWinners] = useState<RouletteResult[]>([]);
  const [excluded, setExcluded] = useState<Set<string>>(new Set());

  const activeParticipants = participants.filter((p) => !excluded.has(p.id));

  const initPhysics = useCallback(() => {
    const engine = Engine.create({ gravity: { y: 0.85 } });
    engineRef.current = engine;

    const pegs: Matter.Body[] = [];
    for (let row = 0; row < PEG_ROWS; row++) {
      const isEven = row % 2 === 0;
      const cols = isEven ? 9 : 8;
      const startX = isEven ? 48 : 70;
      const y = PEG_Y0 + row * PEG_SY;
      for (let col = 0; col < cols; col++) {
        const peg = Bodies.circle(startX + col * PEG_SX, y, PR, {
          isStatic: true, friction: 0.02, restitution: 0.7, label: 'peg',
        });
        pegs.push(peg);
      }
    }
    pegBodiesRef.current = pegs;

    const wallOpts = { isStatic: true, friction: 0, restitution: 0.3, label: 'wall' };
    const walls = [
      Bodies.rectangle(-8, CH / 2, 16, CH * 2, wallOpts),
      Bodies.rectangle(CW + 8, CH / 2, 16, CH * 2, wallOpts),
    ];

    Composite.add(engine.world, [...pegs, ...walls]);
  }, []);

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bg = ctx.createLinearGradient(0, 0, 0, CH);
    bg.addColorStop(0, '#0d0d2e');
    bg.addColorStop(1, '#0d0d1a');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, CW, CH);

    ctx.strokeStyle = 'rgba(123,45,139,0.18)';
    ctx.lineWidth = 1;
    ctx.strokeRect(30, PEG_Y0 - 18, CW - 60, PEG_ROWS * PEG_SY + 14);

    ctx.save();
    ctx.strokeStyle = 'rgba(233,69,96,0.55)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 6]);
    ctx.beginPath();
    ctx.moveTo(0, FINISH_Y);
    ctx.lineTo(CW, FINISH_Y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    ctx.fillStyle = 'rgba(233,69,96,0.7)';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText('FINISH', 8, FINISH_Y - 3);

    for (const peg of pegBodiesRef.current) {
      const px = peg.position.x, py = peg.position.y;
      const grad = ctx.createRadialGradient(px - 1, py - 1, 0.5, px, py, PR);
      grad.addColorStop(0, 'rgba(220,220,255,0.9)');
      grad.addColorStop(1, 'rgba(140,140,200,0.45)');
      ctx.beginPath();
      ctx.arc(px, py, PR, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }

    for (const m of marbleListRef.current) {
      if (!activeSetRef.current.has(m)) continue;
      const d = marbleDataRef.current.get(m.id);
      if (!d) continue;
      const { x, y } = m.position;

      ctx.shadowBlur = 14;
      ctx.shadowColor = d.color;
      const mgrad = ctx.createRadialGradient(x - MR * 0.3, y - MR * 0.35, MR * 0.08, x, y, MR);
      mgrad.addColorStop(0, 'rgba(255,255,255,0.55)');
      mgrad.addColorStop(0.35, d.color);
      mgrad.addColorStop(1, shadeHex(d.color, -40));
      ctx.beginPath();
      ctx.arc(x, y, MR, 0, Math.PI * 2);
      ctx.fillStyle = mgrad;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(d.participant.name.substring(0, 2), x, y);
    }
  }, []);

  const checkWinners = useCallback(() => {
    if (winnersRef.current.length >= 3) return;

    for (const m of [...activeSetRef.current]) {
      if (m.position.y > FINISH_Y) {
        const d = marbleDataRef.current.get(m.id);
        if (!d || d.won) continue;
        d.won = true;

        const rank = (winnersRef.current.length + 1) as 1 | 2 | 3;
        const result: RouletteResult = { rank, participant: d.participant };
        winnersRef.current = [...winnersRef.current, result];
        setWinners([...winnersRef.current]);

        activeSetRef.current.delete(m);
        Composite.remove(engineRef.current!.world, m);

        if (winnersRef.current.length === 3) {
          setGameState('finished');
          launchTimersRef.current.forEach(clearTimeout);
          onResult?.(winnersRef.current);
        }
      }
    }

    if (activeSetRef.current.size === 0 && marbleListRef.current.length > 0) {
      setGameState('finished');
      if (winnersRef.current.length > 0) {
        onResult?.(winnersRef.current);
      }
    }
  }, [onResult]);

  useEffect(() => {
    initPhysics();
    return () => {
      launchTimersRef.current.forEach(clearTimeout);
      if (engineRef.current) {
        Matter.World.clear(engineRef.current.world, false);
        Matter.Engine.clear(engineRef.current);
        engineRef.current = null;
      }
    };
  }, [initPhysics]);

  useEffect(() => {
    let running = gameState === 'running';
    const loop = () => {
      if (running) {
        Engine.update(engineRef.current!, 1000 / 60);
        checkWinners();
      }
      drawFrame();
      rafRef.current = requestAnimationFrame(loop);
    };

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      running = false;
    };
  }, [gameState, checkWinners, drawFrame]);

  const startGame = useCallback(() => {
    if (activeParticipants.length < 3) return;

    for (const m of marbleListRef.current) {
      try { Composite.remove(engineRef.current!.world, m); } catch (_) {}
    }
    marbleListRef.current = [];
    activeSetRef.current = new Set();
    marbleDataRef.current = new Map();
    winnersRef.current = [];
    setWinners([]);
    launchTimersRef.current.forEach(clearTimeout);
    launchTimersRef.current = [];

    setGameState('running');

    activeParticipants.forEach((p, i) => {
      const t = setTimeout(() => {
        const x = 60 + Math.random() * (CW - 120);
        const marble = Bodies.circle(x, -MR - 5, MR, {
          restitution: 0.68, friction: 0.02, frictionAir: 0.007, label: 'marble', density: 0.002,
        });
        const color = MARBLE_COLORS[i % MARBLE_COLORS.length];
        marbleDataRef.current.set(marble.id, { participant: p, color, won: false });
        Body.setVelocity(marble, { x: (Math.random() - 0.5) * 2.5, y: 1.5 + Math.random() });
        Composite.add(engineRef.current!.world, marble);
        marbleListRef.current.push(marble);
        activeSetRef.current.add(marble);
      }, i * 350);
      launchTimersRef.current.push(t);
    });
  }, [activeParticipants]);

  const resetGame = useCallback(() => {
    for (const m of marbleListRef.current) {
      try { Composite.remove(engineRef.current!.world, m); } catch (_) {}
    }
    marbleListRef.current = [];
    activeSetRef.current = new Set();
    marbleDataRef.current = new Map();
    winnersRef.current = [];
    launchTimersRef.current.forEach(clearTimeout);
    launchTimersRef.current = [];
    setWinners([]);
    setGameState('idle');
  }, []);

  const toggleExclude = (id: string) => {
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const MEDAL = ['🥇', '🥈', '🥉'];

  return (
    <div className={`rounded-2xl overflow-hidden ${dark ? 'bg-slate-900' : 'bg-white border border-slate-200'}`}>
      <div className="flex flex-col lg:flex-row gap-0">
        {/* Left: Participant list */}
        <div className={`lg:w-48 p-4 border-b lg:border-b-0 lg:border-r ${dark ? 'border-slate-700' : 'border-slate-200'}`}>
          <p className={`text-xs font-bold mb-2 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
            참가자 ({activeParticipants.length}/{participants.length})
          </p>
          <div className="space-y-1 max-h-48 lg:max-h-[480px] overflow-y-auto">
            {participants.map((p, i) => {
              const winnerIdx = winners.findIndex((w) => w.participant.id === p.id);
              const isExcluded = excluded.has(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => gameState === 'idle' && toggleExclude(p.id)}
                  className={`w-full text-left flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-all
                    ${isExcluded ? 'opacity-30 line-through' : ''}
                    ${winnerIdx >= 0 ? '' : dark ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}
                    ${gameState === 'idle' ? 'cursor-pointer' : 'cursor-default'}`}
                  style={winnerIdx >= 0 ? {
                    border: `1px solid ${['#ffd700','#c0c0c0','#cd7f32'][winnerIdx]}`,
                    borderRadius: '8px',
                    background: ['rgba(255,215,0,0.1)','rgba(192,192,192,0.1)','rgba(205,127,50,0.1)'][winnerIdx],
                  } : undefined}
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: MARBLE_COLORS[i % MARBLE_COLORS.length] }}
                  />
                  <span className={`flex-1 truncate font-medium ${dark ? 'text-slate-200' : 'text-slate-700'}`}>
                    {p.name}
                  </span>
                  {winnerIdx >= 0 && <span className="text-sm">{MEDAL[winnerIdx]}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Center: Canvas */}
        <div className="flex-1 flex flex-col items-center gap-3 p-4">
          <canvas
            ref={canvasRef}
            width={CW}
            height={CH}
            className="rounded-xl w-full max-w-[480px]"
            style={{ imageRendering: 'pixelated' }}
          />
          <div className="flex gap-2">
            {gameState === 'idle' && (
              <button
                type="button"
                disabled={activeParticipants.length < 3}
                onClick={startGame}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 text-white text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              >
                🚀 게임 시작
              </button>
            )}
            {gameState === 'running' && (
              <span className={`px-4 py-2 rounded-xl text-sm font-semibold ${dark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                ⏳ 진행 중…
              </span>
            )}
            {gameState === 'finished' && (
              <button
                type="button"
                onClick={resetGame}
                className={`px-5 py-2 rounded-xl text-sm font-bold transition-colors ${dark ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                ↺ 다시 시작
              </button>
            )}
          </div>
        </div>

        {/* Right: Podium */}
        <div className={`lg:w-44 p-4 border-t lg:border-t-0 lg:border-l ${dark ? 'border-slate-700' : 'border-slate-200'}`}>
          <p className={`text-xs font-bold mb-3 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>🏆 순위</p>
          <div className="space-y-2">
            {([1, 2, 3] as const).map((rank) => {
              const result = winners.find((w) => w.rank === rank);
              const colors = {
                1: { border: '#ffd700', bg: 'rgba(255,215,0,0.08)' },
                2: { border: '#c0c0c0', bg: 'rgba(192,192,192,0.06)' },
                3: { border: '#cd7f32', bg: 'rgba(205,127,50,0.08)' },
              }[rank];

              return (
                <div
                  key={rank}
                  className="rounded-xl p-2.5 transition-all"
                  style={result ? { border: `1px solid ${colors.border}`, background: colors.bg } : {
                    border: `1px solid ${dark ? '#2d3748' : '#e2e8f0'}`,
                    background: dark ? '#1e293b' : '#f8fafc',
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{MEDAL[rank - 1]}</span>
                    <span className={`text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{rank}등</span>
                  </div>
                  {result ? (
                    <p className={`mt-1 text-sm font-bold truncate ${dark ? 'text-white' : 'text-slate-900'}`}>
                      {result.participant.name}
                    </p>
                  ) : (
                    <p className={`mt-1 text-xs italic ${dark ? 'text-slate-600' : 'text-slate-400'}`}>
                      대기 중…
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

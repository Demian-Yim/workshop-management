'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

type ThemeId = 'break' | 'discussion' | 'presentation' | 'focus';
type TimerState = 'idle' | 'running' | 'finished';

interface Stage {
  threshold: number;
  emoji: string;
  main: string;
  hint: string;
  accent: string;
  glow: string;
  bg: string;
}

interface ThemeDef {
  id: ThemeId;
  icon: string;
  label: string;
  stages: Stage[];
  doneEmoji: string;
  doneMain: string;
  alertMsg60: string;
  alertMsg30: string;
  accentColor: string;
  bgFrom: string;
  bgTo: string;
  textClass: string;
}

const THEMES: Record<ThemeId, ThemeDef> = {
  break: {
    id: 'break', icon: '☕', label: '쉬는 시간',
    accentColor: '#c8561a', bgFrom: '#f5ede0', bgTo: '#d4bf9e',
    textClass: 'text-stone-800',
    alertMsg60: '자리에 앉아주세요', alertMsg30: '곧 다시 시작해요',
    doneEmoji: '🎉', doneMain: '다시 시작할 시간이에요',
    stages: [
      { threshold: 0.66, emoji: '☕', main: '편안하게 쉬는 시간을 보내세요', hint: '커피 한 잔, 스트레칭…', accent: '#c8561a', glow: '#e5793a', bg: '#f5ede0' },
      { threshold: 0.33, emoji: '📖', main: '천천히 마음을 다잡는 시간', hint: '화장실 다녀오거나, 정리해 보세요', accent: '#a34476', glow: '#ba5d93', bg: '#f3e9ef' },
      { threshold: 0.10, emoji: '🚶', main: '슬슬 자리로 돌아올 준비', hint: '마음 편히 걸어오세요', accent: '#ba3f14', glow: '#d9582a', bg: '#f3e1d3' },
      { threshold: 0.0,  emoji: '👋', main: '곧 다시 시작해요', hint: '오셔서 편히 앉아주세요', accent: '#b86a14', glow: '#d58020', bg: '#f3ebcb' },
    ],
  },
  discussion: {
    id: 'discussion', icon: '💬', label: '토의 시간',
    accentColor: '#176a41', bgFrom: '#e6f0e8', bgTo: '#a2c6ae',
    textClass: 'text-emerald-950',
    alertMsg60: '토의를 마무리해 주세요', alertMsg30: '결론 한 문장을 정해주세요',
    doneEmoji: '✅', doneMain: '토의를 마쳤어요',
    stages: [
      { threshold: 0.66, emoji: '💬', main: '자유롭게 의견을 나눠주세요', hint: '서로의 관점을 듣고 질문해 보세요', accent: '#176a41', glow: '#2f8f5b', bg: '#e6f0e8' },
      { threshold: 0.33, emoji: '🧠', main: '핵심을 정리해 볼 시간', hint: '중요한 포인트 2~3개를 추려보세요', accent: '#1a528f', glow: '#2e6db5', bg: '#e6edf5' },
      { threshold: 0.10, emoji: '📝', main: '결론을 향해 가는 시간', hint: '누가 · 무엇을 · 언제까지', accent: '#0a5834', glow: '#14724c', bg: '#dcebe3' },
      { threshold: 0.0,  emoji: '🎯', main: '마무리 짓는 시간', hint: '핵심 합의를 한 문장으로', accent: '#0c4628', glow: '#165a3c', bg: '#d4e5db' },
    ],
  },
  presentation: {
    id: 'presentation', icon: '🎤', label: '발표 시간',
    accentColor: '#dca72a', bgFrom: '#0c111e', bgTo: '#1c2544',
    textClass: 'text-yellow-100',
    alertMsg60: '발표를 마무리해 주세요', alertMsg30: 'Q&A 준비해 주세요',
    doneEmoji: '👏', doneMain: '발표를 마쳤어요',
    stages: [
      { threshold: 0.66, emoji: '🎤', main: '편안하게 발표를 이어가세요', hint: '청중과 눈을 맞춰보세요', accent: '#dca72a', glow: '#e8b949', bg: '#0c111e' },
      { threshold: 0.33, emoji: '📊', main: '핵심 내용을 전달할 시간', hint: '중요한 포인트에 집중하세요', accent: '#d4891a', glow: '#e09830', bg: '#0e1522' },
      { threshold: 0.10, emoji: '⏰', main: '마무리할 시간이 다가왔어요', hint: '결론을 준비해 주세요', accent: '#c8561a', glow: '#d9582a', bg: '#101624' },
      { threshold: 0.0,  emoji: '🏁', main: '마지막 정리를 해주세요', hint: '인상적인 마무리를', accent: '#b84d14', glow: '#d04020', bg: '#0c111e' },
    ],
  },
  focus: {
    id: 'focus', icon: '🧘', label: '집중 시간',
    accentColor: '#2a2620', bgFrom: '#f2f0ea', bgTo: '#c8c2ae',
    textClass: 'text-stone-900',
    alertMsg60: '잠시 후 마무리해 주세요', alertMsg30: '정리 시간을 가져보세요',
    doneEmoji: '🌿', doneMain: '집중 시간이 끝났어요',
    stages: [
      { threshold: 0.66, emoji: '🧘', main: '깊은 집중의 시간', hint: '방해 요소를 내려놓으세요', accent: '#2a2620', glow: '#5a5342', bg: '#f2f0ea' },
      { threshold: 0.33, emoji: '✍️', main: '흐름을 이어가세요', hint: '지금 하는 것에만 집중', accent: '#322c22', glow: '#4a4034', bg: '#edeae0' },
      { threshold: 0.10, emoji: '🌅', main: '거의 다 됐어요', hint: '마지막 스퍼트', accent: '#2c261c', glow: '#40382a', bg: '#e8e4d8' },
      { threshold: 0.0,  emoji: '🌙', main: '마무리해 주세요', hint: '잘 하셨습니다', accent: '#1a1610', glow: '#302a20', bg: '#e2dece' },
    ],
  },
};

const PRESETS = [5, 10, 15, 20, 30];

function fmt(seconds: number): string {
  const m = Math.floor(Math.abs(seconds) / 60);
  const s = Math.abs(seconds) % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function pickStage(ratio: number, theme: ThemeDef): Stage {
  for (const st of theme.stages) {
    if (ratio > st.threshold) return st;
  }
  return theme.stages[theme.stages.length - 1];
}

const RING_R = 110;
const RING_CENTER = 140;
const RING_STROKE = 18;

function arcPath(ratio: number): string {
  const r = Math.max(0, Math.min(1, ratio));
  if (r <= 0.0001) return '';
  if (r >= 0.9999) {
    return `M ${RING_CENTER} ${RING_CENTER - RING_R} A ${RING_R} ${RING_R} 0 0 0 ${RING_CENTER} ${RING_CENTER + RING_R} A ${RING_R} ${RING_R} 0 0 0 ${RING_CENTER} ${RING_CENTER - RING_R}`;
  }
  const angle = r * 2 * Math.PI;
  const endX = RING_CENTER - RING_R * Math.sin(angle);
  const endY = RING_CENTER - RING_R * Math.cos(angle);
  const largeArc = angle > Math.PI ? 1 : 0;
  return `M ${RING_CENTER} ${RING_CENTER - RING_R} A ${RING_R} ${RING_R} 0 ${largeArc} 0 ${endX} ${endY}`;
}

function playChime(freq: number, duration: number) {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.onended = () => { ctx.close(); };
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (_) {}
}

interface BreakTimerProps {
  compact?: boolean;
}

export default function BreakTimer({ compact = false }: BreakTimerProps) {
  const [themeId, setThemeId] = useState<ThemeId>('break');
  const [totalSecs, setTotalSecs] = useState(600);
  const [remaining, setRemaining] = useState(600);
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [selectedPreset, setSelectedPreset] = useState(10);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [alertSub, setAlertSub] = useState('');

  const rafRef = useRef<number>(0);
  const lastTickRef = useRef<number | null>(null);
  const playedCuesRef = useRef<Set<string>>(new Set());
  const themeIdRef = useRef<ThemeId>(themeId);
  useEffect(() => { themeIdRef.current = themeId; }, [themeId]);

  const theme = THEMES[themeId];
  const ratio = totalSecs > 0 ? remaining / totalSecs : 0;
  const stage = timerState === 'finished'
    ? { emoji: theme.doneEmoji, main: theme.doneMain, hint: '수고하셨습니다', accent: theme.accentColor, glow: theme.accentColor, bg: theme.bgFrom }
    : pickStage(Math.max(ratio, 0), theme);

  const tick = useCallback(() => {
    const now = performance.now();
    setRemaining((prev) => {
      if (lastTickRef.current === null) {
        lastTickRef.current = now;
        return prev;
      }
      const delta = Math.round((now - lastTickRef.current) / 1000);
      if (delta < 1) return prev;
      lastTickRef.current = now;
      const next = prev - delta;
      if (next <= 0) {
        setTimerState('finished');
        playChime(523, 1.2);
        return 0;
      }
      if (next <= 60 && !playedCuesRef.current.has('60')) {
        playedCuesRef.current.add('60');
        setAlertMsg(THEMES[themeIdRef.current].alertMsg60);
        setAlertSub('1 MIN LEFT');
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3500);
      }
      if (next <= 30 && !playedCuesRef.current.has('30')) {
        playedCuesRef.current.add('30');
        setAlertMsg(THEMES[themeIdRef.current].alertMsg30);
        setAlertSub('30 SEC LEFT');
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3500);
        playChime(880, 0.6);
      }
      return next;
    });
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (timerState === 'running') {
      lastTickRef.current = null;
      rafRef.current = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(rafRef.current);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [timerState, tick]);

  const start = () => {
    if (timerState === 'idle') {
      playedCuesRef.current = new Set();
      setTimerState('running');
    } else if (timerState === 'running') {
      setTimerState('idle');
    }
  };

  const reset = () => {
    cancelAnimationFrame(rafRef.current);
    setTimerState('idle');
    setRemaining(totalSecs);
    playedCuesRef.current = new Set();
    setShowAlert(false);
  };

  const applyPreset = (min: number) => {
    setSelectedPreset(min);
    const secs = min * 60;
    setTotalSecs(secs);
    setRemaining(secs);
    setTimerState('idle');
    playedCuesRef.current = new Set();
  };

  const isDark = themeId === 'presentation';

  return (
    <div
      className="rounded-2xl overflow-hidden relative"
      style={{ background: `linear-gradient(135deg, ${theme.bgFrom}, ${theme.bgTo})` }}
    >
      {/* Alert overlay */}
      {showAlert && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div
            className="rounded-2xl px-8 py-5 text-center shadow-2xl border-2"
            style={{
              background: isDark ? 'rgba(10,14,28,0.92)' : 'rgba(255,253,247,0.95)',
              borderColor: theme.accentColor,
              backdropFilter: 'blur(12px)',
            }}
          >
            <p className="text-3xl mb-1">{stage.emoji}</p>
            <p className={`text-xl font-bold ${theme.textClass}`}>{alertMsg}</p>
            <p className="text-xs font-bold tracking-widest mt-1" style={{ color: theme.accentColor }}>{alertSub}</p>
          </div>
        </div>
      )}

      <div className={`p-5 flex flex-col gap-4 ${compact ? '' : ''}`}>
        {/* Theme tabs */}
        <div className="flex gap-1.5 overflow-x-auto">
          {(Object.keys(THEMES) as ThemeId[]).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => { setThemeId(id); reset(); }}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={themeId === id ? {
                background: theme.accentColor,
                color: '#fff',
                boxShadow: `0 4px 12px ${theme.accentColor}55`,
              } : {
                background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
                color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
              }}
            >
              <span>{THEMES[id].icon}</span>
              <span className="hidden sm:inline">{THEMES[id].label}</span>
            </button>
          ))}
        </div>

        {/* Main area */}
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* SVG Ring */}
          <div className="relative flex-shrink-0">
            <svg width={RING_CENTER * 2} height={RING_CENTER * 2} viewBox={`0 0 ${RING_CENTER * 2} ${RING_CENTER * 2}`}>
              <circle
                cx={RING_CENTER} cy={RING_CENTER} r={RING_R}
                fill="none"
                stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
                strokeWidth={RING_STROKE}
                strokeLinecap="round"
              />
              {timerState !== 'idle' && (
                <path
                  d={arcPath(ratio)}
                  fill="none"
                  stroke={stage.glow}
                  strokeWidth={RING_STROKE}
                  strokeLinecap="round"
                  style={{ filter: `drop-shadow(0 0 8px ${stage.glow}aa)`, transition: 'stroke 0.8s ease' }}
                />
              )}
              {timerState === 'idle' && (
                <circle
                  cx={RING_CENTER} cy={RING_CENTER} r={RING_R}
                  fill="none"
                  stroke={stage.glow}
                  strokeWidth={RING_STROKE}
                  strokeOpacity={0.3}
                  strokeLinecap="round"
                />
              )}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
              <span className="text-4xl">{stage.emoji}</span>
              <span
                className="text-3xl font-bold tabular-nums font-mono"
                style={{ color: isDark ? '#fdf3d4' : '#1c140a' }}
              >
                {fmt(remaining)}
              </span>
              <span className="text-xs font-semibold opacity-60" style={{ color: isDark ? '#fdf3d4' : '#1c140a' }}>
                {timerState === 'idle' ? '대기 중' : timerState === 'running' ? '진행 중' : '완료'}
              </span>
            </div>
          </div>

          {/* Right panel */}
          <div className="flex-1 flex flex-col gap-3 w-full">
            {/* Stage message */}
            <div>
              <p className={`text-base font-bold ${theme.textClass}`}>{stage.main}</p>
              <p className="text-sm opacity-60 mt-0.5" style={{ color: isDark ? '#fdf3d4' : '#1c140a' }}>{stage.hint}</p>
            </div>

            {/* Presets */}
            <div className="flex gap-1.5 flex-wrap">
              {PRESETS.map((min) => (
                <button
                  key={min}
                  type="button"
                  onClick={() => applyPreset(min)}
                  disabled={timerState === 'running'}
                  className="px-3 py-1.5 rounded-lg text-sm font-bold transition-all disabled:opacity-30"
                  style={selectedPreset === min ? {
                    background: theme.accentColor,
                    color: '#fff',
                    boxShadow: `0 4px 10px ${theme.accentColor}44`,
                  } : {
                    background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                    color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                  }}
                >
                  {min}분
                </button>
              ))}
            </div>

            {/* Controls */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={start}
                disabled={timerState === 'finished'}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-40"
                style={{ background: `linear-gradient(135deg, ${theme.accentColor}, ${stage.glow})` }}
              >
                {timerState === 'running' ? '⏸ 일시정지' : timerState === 'finished' ? '✓ 완료' : '▶ 시작'}
              </button>
              <button
                type="button"
                onClick={reset}
                className="px-4 py-2.5 rounded-xl font-bold text-sm transition-all"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                  color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                }}
              >
                ↺
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Users, BarChart2, MessageCircle, Cloud, Clock, ClipboardList,
  Star, Layout, Bell, Calendar, ChevronRight, Play,
} from 'lucide-react';

interface FeatureDemo {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  role: '퍼실리테이터' | '학습자' | '관리자' | 'Display';
  color: string;
  preview: React.ReactNode;
}

const SAMPLE_POLL_OPTIONS = [
  { label: '팀 프로젝트 방식', votes: 12 },
  { label: '강의 중심 학습', votes: 8 },
  { label: '케이스 스터디', votes: 15 },
  { label: '역할극 & 실습', votes: 6 },
];

const SAMPLE_QA = [
  { q: '팀 배정은 어떻게 이루어지나요?', votes: 7, answered: true },
  { q: '오늘 실습 결과물은 어디에 제출하나요?', votes: 5, answered: false },
  { q: '쉬는 시간은 얼마나 되나요?', votes: 3, answered: false },
];

const SAMPLE_WORDS = ['혁신', '협업', '성장', '리더십', '창의성', '소통', '신뢰', '도전', '변화', '학습'];

const SAMPLE_POSTS = [
  { team: 'A팀', author: '김민준', content: '우리 팀의 아이디어: AI 기반 고객 서비스 자동화', likes: 5 },
  { team: 'B팀', author: '이서연', content: '디지털 트랜스포메이션의 핵심은 사람입니다', likes: 8 },
  { team: 'C팀', author: '박지호', content: '데이터 드리븐 의사결정 프로세스 수립', likes: 3 },
];

function PollPreview() {
  const total = SAMPLE_POLL_OPTIONS.reduce((s, o) => s + o.votes, 0);
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-700 mb-3">가장 효과적인 학습 방법은?</p>
      {SAMPLE_POLL_OPTIONS.map((opt, i) => {
        const pct = Math.round((opt.votes / total) * 100);
        return (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`w-full text-left rounded-lg border transition overflow-hidden ${selected === i ? 'border-blue-400' : 'border-slate-200'}`}
          >
            <div className="relative px-3 py-2">
              <div
                className="absolute inset-0 bg-blue-50 transition-all"
                style={{ width: `${pct}%` }}
              />
              <div className="relative flex justify-between items-center text-sm">
                <span className="font-medium text-slate-800">{opt.label}</span>
                <span className="text-slate-500 text-xs">{pct}%</span>
              </div>
            </div>
          </button>
        );
      })}
      <p className="text-xs text-slate-400 text-right mt-1">총 {total}명 참여</p>
    </div>
  );
}

function QAPreview() {
  const [upvoted, setUpvoted] = useState<Set<number>>(new Set());
  return (
    <div className="space-y-2">
      {SAMPLE_QA.map((item, i) => (
        <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <button
            onClick={() => setUpvoted((s) => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; })}
            className={`flex flex-col items-center text-xs font-bold transition ${upvoted.has(i) ? 'text-red-500' : 'text-slate-400 hover:text-red-400'}`}
          >
            ♥<span>{item.votes + (upvoted.has(i) ? 1 : 0)}</span>
          </button>
          <div className="flex-1">
            <p className="text-sm text-slate-800">{item.q}</p>
            {item.answered && <span className="text-xs text-emerald-600 font-medium">✓ 답변 완료</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

function WordCloudPreview() {
  const sizes = [32, 24, 20, 28, 18, 22, 26, 16, 30, 20];
  const colors = ['text-blue-600', 'text-emerald-600', 'text-violet-600', 'text-orange-500', 'text-pink-500', 'text-teal-600', 'text-indigo-600', 'text-red-500', 'text-yellow-600', 'text-cyan-600'];
  return (
    <div className="flex flex-wrap gap-2 justify-center items-center min-h-24 p-2">
      {SAMPLE_WORDS.map((w, i) => (
        <span
          key={i}
          className={`${colors[i]} font-bold animate-pulse`}
          style={{ fontSize: `${sizes[i]}px`, animationDelay: `${i * 0.15}s` }}
        >
          {w}
        </span>
      ))}
    </div>
  );
}

function BoardPreview() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {SAMPLE_POSTS.map((post, i) => (
        <div key={i} className="bg-white rounded-lg border border-slate-200 p-2 shadow-sm">
          <span className="text-xs font-semibold text-blue-600">{post.team}</span>
          <p className="text-xs text-slate-700 mt-1 leading-snug">{post.content}</p>
          <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
            <span>♥ {post.likes}</span>
            <span className="ml-auto">{post.author}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function TimerPreview() {
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(600);
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return (
    <div className="text-center">
      <div className="text-4xl font-mono font-bold text-slate-900 tabular-nums">{mm}:{ss}</div>
      <p className="text-xs text-slate-400 mt-1 mb-3">쉬는 시간</p>
      <button
        onClick={() => setRunning((r) => !r)}
        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${running ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
      >
        {running ? '일시정지' : '시작'}
      </button>
    </div>
  );
}

function AttendancePreview() {
  const participants = ['김민준', '이서연', '박지호', '최은지', '정현우', '장수아'];
  const [checked, setChecked] = useState<Set<number>>(new Set([0, 1, 3]));
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {participants.map((name, i) => (
        <button
          key={i}
          onClick={() => setChecked((s) => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; })}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition ${checked.has(i) ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${checked.has(i) ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'}`}>
            {checked.has(i) && <span className="text-white text-[10px]">✓</span>}
          </span>
          {name}
        </button>
      ))}
    </div>
  );
}

const features: FeatureDemo[] = [
  {
    id: 'poll', icon: <BarChart2 className="w-5 h-5" />, title: '실시간 투표 (Poll)',
    description: '선택지를 제시하고 즉시 결과를 막대 차트로 확인합니다. 의사결정과 의견 수렴에 활용하세요.',
    role: '학습자', color: 'blue', preview: <PollPreview />,
  },
  {
    id: 'qa', icon: <MessageCircle className="w-5 h-5" />, title: 'Q&A 질문 보드',
    description: '참가자가 익명으로 질문을 제출하고 추천합니다. 중요 질문이 자동으로 상위에 올라옵니다.',
    role: '학습자', color: 'violet', preview: <QAPreview />,
  },
  {
    id: 'wordcloud', icon: <Cloud className="w-5 h-5" />, title: '워드 클라우드',
    description: '참가자가 단어를 제출하면 실시간으로 클라우드가 생성됩니다. 아이디어 수집과 분위기 파악에 효과적입니다.',
    role: '학습자', color: 'emerald', preview: <WordCloudPreview />,
  },
  {
    id: 'board', icon: <Layout className="w-5 h-5" />, title: '팀 칼럼 보드 (Padlet)',
    description: '팀별로 포스트를 작성하고 공유합니다. 이미지 업로드, 좋아요, 댓글을 지원합니다.',
    role: '학습자', color: 'orange', preview: <BoardPreview />,
  },
  {
    id: 'attendance', icon: <ClipboardList className="w-5 h-5" />, title: '출석 관리',
    description: '참가자 카드를 클릭해 출석을 체크합니다. 실시간으로 출석 현황을 확인할 수 있습니다.',
    role: '퍼실리테이터', color: 'teal', preview: <AttendancePreview />,
  },
  {
    id: 'timer', icon: <Clock className="w-5 h-5" />, title: '쉬는 시간 타이머',
    description: '분 단위로 카운트다운 타이머를 설정합니다. Display 화면에도 자동으로 표시됩니다.',
    role: '퍼실리테이터', color: 'slate', preview: <TimerPreview />,
  },
];

const colorMap: Record<string, string> = {
  blue: 'bg-blue-50 border-blue-200 text-blue-600',
  violet: 'bg-violet-50 border-violet-200 text-violet-600',
  emerald: 'bg-emerald-50 border-emerald-200 text-emerald-600',
  orange: 'bg-orange-50 border-orange-200 text-orange-600',
  teal: 'bg-teal-50 border-teal-200 text-teal-600',
  slate: 'bg-slate-50 border-slate-200 text-slate-600',
};

const roleColor: Record<string, string> = {
  '학습자': 'bg-blue-100 text-blue-700',
  '퍼실리테이터': 'bg-violet-100 text-violet-700',
  '관리자': 'bg-emerald-100 text-emerald-700',
  'Display': 'bg-orange-100 text-orange-700',
};

export default function DemoPage() {
  const [activeFeature, setActiveFeature] = useState<string>('poll');
  const active = features.find((f) => f.id === activeFeature)!;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Play className="w-4 h-4 text-white fill-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-lg leading-none">FLOW~ 데모</h1>
              <p className="text-xs text-slate-400">워크샵 관리 플랫폼 기능 둘러보기</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/join"
              className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
            >
              학습자로 참여
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              관리자 로그인
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full mb-3">
            Padlet + Slido + AhaSlides 통합
          </span>
          <h2 className="text-3xl font-bold text-slate-900 mb-3">
            하나의 플랫폼으로 워크샵 전체를 운영하세요
          </h2>
          <p className="text-slate-500 max-w-lg mx-auto text-sm">
            참가자 관리, 실시간 투표, 팀 게시판, Q&A, 워드 클라우드까지 —
            모든 기능이 하나로 통합되어 있습니다.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { icon: <Users className="w-5 h-5 text-blue-500" />, label: '참가자 관리', value: '무제한' },
            { icon: <BarChart2 className="w-5 h-5 text-violet-500" />, label: '실시간 활동', value: '3종' },
            { icon: <Layout className="w-5 h-5 text-orange-500" />, label: '팀 보드', value: '팀별 칼럼' },
            { icon: <Star className="w-5 h-5 text-yellow-500" />, label: '학습자 리뷰', value: '5점 척도' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm text-center">
              <div className="flex justify-center mb-2">{stat.icon}</div>
              <p className="font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Feature Demo */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3">
            {/* Feature List */}
            <div className="border-r border-slate-200 p-4 space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide px-2 mb-3">기능 목록</p>
              {features.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFeature(f.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition text-left ${
                    activeFeature === f.id ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className={`${activeFeature === f.id ? 'text-blue-600' : 'text-slate-400'}`}>{f.icon}</span>
                  {f.title}
                </button>
              ))}
            </div>

            {/* Preview Panel */}
            <div className="col-span-2 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`p-1.5 rounded-lg border ${colorMap[active.color]}`}>{active.icon}</span>
                    <h3 className="text-lg font-bold text-slate-900">{active.title}</h3>
                  </div>
                  <p className="text-sm text-slate-500">{active.description}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ml-3 ${roleColor[active.role]}`}>
                  {active.role}
                </span>
              </div>
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 min-h-40">
                {active.preview}
              </div>
              <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block"></span>
                실제 앱에서는 Firestore 실시간 동기화로 모든 참가자에게 즉시 반영됩니다
              </p>
            </div>
          </div>
        </div>

        {/* Role-based Access */}
        <div className="mb-12">
          <h3 className="text-xl font-bold text-slate-900 mb-4 text-center">역할별 화면</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                role: '관리자', path: '/login', icon: <Users className="w-5 h-5" />, color: 'blue',
                features: ['교육과정 생성/관리', '참가자 명단 CSV 업로드', '강사 계정 관리', '결과 보고서 다운로드', '사용자 승인 관리'],
              },
              {
                role: '퍼실리테이터', path: '/present', icon: <Bell className="w-5 h-5" />, color: 'violet',
                features: ['세션 실시간 운영', '공지 발송', '출석 체크', '팀 룰렛 배정', '라이브 활동 제어'],
              },
              {
                role: '학습자', path: '/join', icon: <Star className="w-5 h-5" />, color: 'emerald',
                features: ['세션 코드로 참여', '자기소개 카드', '팀 게시판 작성', '투표/Q&A/워드클라우드', '점심 메뉴 투표'],
              },
              {
                role: 'Display', path: '/display', icon: <Calendar className="w-5 h-5" />, color: 'orange',
                features: ['프로젝터 전용 화면', '자동 콘텐츠 전환', '실시간 결과 표시', '카운트다운 타이머', 'QR 코드 표시'],
              },
            ].map((item) => (
              <div key={item.role} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className={`px-5 py-4 border-b border-slate-100 flex items-center gap-2 ${item.color === 'blue' ? 'bg-blue-50' : item.color === 'violet' ? 'bg-violet-50' : item.color === 'emerald' ? 'bg-emerald-50' : 'bg-orange-50'}`}>
                  <span className={item.color === 'blue' ? 'text-blue-600' : item.color === 'violet' ? 'text-violet-600' : item.color === 'emerald' ? 'text-emerald-600' : 'text-orange-600'}>
                    {item.icon}
                  </span>
                  <span className="font-semibold text-slate-900">{item.role}</span>
                </div>
                <div className="p-4">
                  <ul className="space-y-1.5">
                    {item.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={item.path}
                    className={`mt-4 flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-sm font-medium transition ${
                      item.color === 'blue' ? 'bg-blue-600 text-white hover:bg-blue-700' :
                      item.color === 'violet' ? 'bg-violet-600 text-white hover:bg-violet-700' :
                      item.color === 'emerald' ? 'bg-emerald-600 text-white hover:bg-emerald-700' :
                      'bg-orange-500 text-white hover:bg-orange-600'
                    }`}
                  >
                    {item.role} 화면 보기
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Workflow */}
        <div className="bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-2">지금 바로 시작하세요</h3>
          <p className="text-blue-100 text-sm mb-6 max-w-md mx-auto">
            Google 계정으로 로그인하고, 교육과정을 만들고, 세션 코드를 공유하면 바로 시작할 수 있습니다.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/login"
              className="px-6 py-2.5 bg-white text-blue-700 rounded-lg font-semibold text-sm hover:bg-blue-50 transition"
            >
              관리자 로그인
            </Link>
            <Link
              href="/join"
              className="px-6 py-2.5 bg-blue-500 text-white rounded-lg font-semibold text-sm hover:bg-blue-400 transition border border-blue-400"
            >
              세션 참여하기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

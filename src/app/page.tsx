'use client';
import Link from 'next/link';

const roles = [
  {
    title: '학습자',
    subtitle: '교육에 참여하기',
    description: '세션 코드를 입력하고 워크샵에 참여하세요',
    href: '/join',
    icon: '🎓',
    gradient: 'from-indigo-500 via-violet-500 to-purple-500',
    delay: '0.1s',
  },
  {
    title: '강사',
    subtitle: '교육 진행하기',
    description: '세션을 생성하고 워크샵을 퍼실리테이션하세요',
    href: '/create',
    icon: '🎤',
    gradient: 'from-emerald-400 via-teal-500 to-cyan-500',
    delay: '0.2s',
  },
  {
    title: '관리자',
    subtitle: '교육 관리하기',
    description: '교육과정, 강사, 리포트를 관리하세요',
    href: '/login',
    icon: '⚙️',
    gradient: 'from-blue-500 via-indigo-500 to-violet-600',
    delay: '0.3s',
  },
];

export default function HomePage() {
  return (
    <div className="bg-ambient bg-noise min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">

      {/* Decorative blobs */}
      <div
        className="pointer-events-none z-0 absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)', filter: 'blur(60px)' }}
      />
      <div
        className="pointer-events-none z-0 absolute top-1/2 -right-40 w-80 h-80 rounded-full opacity-15"
        style={{ background: 'radial-gradient(circle, #a855f7, transparent 70%)', filter: 'blur(80px)' }}
      />
      <div
        className="pointer-events-none z-0 absolute -bottom-24 left-1/3 w-72 h-72 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #ec4899, transparent 70%)', filter: 'blur(60px)' }}
      />

      {/* Hero */}
      <div className="relative z-10 text-center mb-14 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-white/50 text-xs font-medium mb-6 tracking-widest uppercase">
          실시간 워크샵 플랫폼
        </div>
        <h1 className="text-gradient text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
          워크샵 운영앱
        </h1>
        <p className="text-white/50 text-lg">
          Padlet · Slido · AhaSlides를 하나로
        </p>
      </div>

      {/* Role cards */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        {roles.map((role) => (
          <Link
            key={role.title}
            href={role.href}
            className="group animate-slide-up rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-brand hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            style={{ animationDelay: role.delay, animationFillMode: 'both' }}
          >
            {/* Top gradient strip */}
            <div className={`h-1 bg-gradient-to-r ${role.gradient}`} />

            <div className="p-8 text-center">
              <div
                className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${role.gradient} mb-5 text-3xl shadow-lg`}
              >
                {role.icon}
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">{role.title}</h2>
              <p className={`text-sm font-semibold mb-3 bg-gradient-to-r ${role.gradient} bg-clip-text text-transparent`}>
                {role.subtitle}
              </p>
              <p className="text-sm text-white/45 leading-relaxed">{role.description}</p>
            </div>

            {/* Hover glow overlay */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 bg-gradient-to-br ${role.gradient} pointer-events-none`} />
          </Link>
        ))}
      </div>

      {/* Footer */}
      <p className="relative z-10 mt-14 text-white/25 text-xs tracking-wide animate-fade-in" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
        powered by FLOW~ : AX Design Lab
      </p>
    </div>
  );
}

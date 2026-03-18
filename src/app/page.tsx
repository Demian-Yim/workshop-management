'use client';
import Link from 'next/link';

const roles = [
  {
    title: '학습자',
    subtitle: '교육에 참여하기',
    description: '세션 코드를 입력하고 워크샵에 참여하세요',
    href: '/join',
    icon: '🎓',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    title: '강사',
    subtitle: '교육 진행하기',
    description: '세션을 생성하고 워크샵을 퍼실리테이션하세요',
    href: '/create',
    icon: '🎤',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    title: '관리자',
    subtitle: '교육 관리하기',
    description: '교육과정, 강사, 리포트를 관리하세요',
    href: '/login',
    icon: '⚙️',
    color: 'from-purple-500 to-violet-600',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-3">워크샵 운영앱</h1>
        <p className="text-lg text-slate-500">실시간 교육 워크샵 운영 플랫폼</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        {roles.map((role) => (
          <Link
            key={role.title}
            href={role.href}
            className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className={`h-2 bg-gradient-to-r ${role.color}`} />
            <div className="p-8 text-center">
              <div className="text-5xl mb-4">{role.icon}</div>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">{role.title}</h2>
              <p className="text-sm font-medium text-indigo-600 mb-3">{role.subtitle}</p>
              <p className="text-sm text-slate-500">{role.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

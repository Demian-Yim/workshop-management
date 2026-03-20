'use client';
import Link from 'next/link';
import { Card, CardBody } from '@/components/ui/card';

const roles = [
  {
    id: 'learner',
    title: '학습자',
    description: '세션 코드를 입력하고 워크샵에 참여하세요',
    icon: '🎓',
    href: '/join',
    color: 'hover:border-blue-300 hover:bg-blue-50',
  },
  {
    id: 'facilitator',
    title: '강사',
    description: '워크샵 세션을 생성하고 진행하세요',
    icon: '🎤',
    href: '/create',
    color: 'hover:border-blue-300 hover:bg-blue-50',
  },
  {
    id: 'admin',
    title: '관리자',
    description: '교육과정을 관리하고 리포트를 확인하세요',
    icon: '⚙️',
    href: '/login',
    color: 'hover:border-slate-300 hover:bg-slate-50',
  },
];

export default function RoleSelector() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
      {roles.map((role) => (
        <Link key={role.id} href={role.href}>
          <Card className={`cursor-pointer transition-all border-2 border-transparent ${role.color}`}>
            <CardBody className="text-center py-10">
              <div className="text-5xl mb-4">{role.icon}</div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">{role.title}</h2>
              <p className="text-sm text-slate-500">{role.description}</p>
            </CardBody>
          </Card>
        </Link>
      ))}
    </div>
  );
}

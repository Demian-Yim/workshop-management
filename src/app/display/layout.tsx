import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FLOW~ : AX Design Lab Display',
};

export default function DisplayLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {children}
    </div>
  );
}

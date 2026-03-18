'use client';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  className?: string;
}

export default function Tabs({ tabs, activeTab: controlledTab, onTabChange, className }: TabsProps) {
  const [internalTab, setInternalTab] = useState(tabs[0]?.id);
  const activeTab = controlledTab ?? internalTab;

  const handleChange = (tabId: string) => {
    setInternalTab(tabId);
    onTabChange?.(tabId);
  };

  return (
    <div className={cn('flex gap-1 bg-slate-100 rounded-lg p-0.5', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleChange(tab.id)}
          className={cn(
            'px-4 py-2 text-sm rounded-md transition-all',
            activeTab === tab.id ? 'bg-white shadow text-slate-900 font-semibold' : 'text-slate-500 hover:text-slate-700'
          )}
        >
          {tab.icon && <span className="mr-1">{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  );
}

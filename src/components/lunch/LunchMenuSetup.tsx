'use client';
import { useState } from 'react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';

interface LunchMenuSetupProps {
  onSubmit: (options: { name: string; description?: string }[]) => Promise<void>;
}

export default function LunchMenuSetup({ onSubmit }: LunchMenuSetupProps) {
  const [options, setOptions] = useState([
    { name: '', description: '' },
    { name: '', description: '' },
  ]);
  const [loading, setLoading] = useState(false);

  const updateOption = (index: number, field: 'name' | 'description', value: string) => {
    const updated = [...options];
    updated[index] = { ...updated[index], [field]: value };
    setOptions(updated);
  };

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, { name: '', description: '' }]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valid = options.filter((o) => o.name.trim());
    if (valid.length < 2) return;
    setLoading(true);
    try {
      await onSubmit(valid);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {options.map((opt, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className="flex-1 space-y-2">
            <Input
              value={opt.name}
              onChange={(e) => updateOption(i, 'name', e.target.value)}
              placeholder={`메뉴 ${i + 1}`}
            />
            <Input
              value={opt.description}
              onChange={(e) => updateOption(i, 'description', e.target.value)}
              placeholder="설명 (선택)"
            />
          </div>
          {options.length > 2 && (
            <button type="button" onClick={() => removeOption(i)} className="text-red-400 hover:text-red-600 mt-2">
              &times;
            </button>
          )}
        </div>
      ))}
      <div className="flex gap-2">
        {options.length < 6 && (
          <Button type="button" variant="secondary" onClick={addOption}>+ 메뉴 추가</Button>
        )}
        <Button type="submit" loading={loading} className="flex-1">투표 시작</Button>
      </div>
    </form>
  );
}

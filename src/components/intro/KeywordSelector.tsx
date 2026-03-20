'use client';

import { cn } from '@/lib/utils';
import { KEYWORD_CATEGORIES, type KeywordCategory } from '@/types/character';

interface KeywordSelectorProps {
  selectedKeywords: string[];
  onChange: (keywords: string[]) => void;
  maxKeywords?: number;
  className?: string;
}

export default function KeywordSelector({
  selectedKeywords,
  onChange,
  maxKeywords = 5,
  className,
}: KeywordSelectorProps) {
  const toggleKeyword = (keyword: string) => {
    if (selectedKeywords.includes(keyword)) {
      onChange(selectedKeywords.filter((k) => k !== keyword));
    } else if (selectedKeywords.length < maxKeywords) {
      onChange([...selectedKeywords, keyword]);
    }
  };

  const categories = Object.entries(KEYWORD_CATEGORIES) as [KeywordCategory, typeof KEYWORD_CATEGORIES[KeywordCategory]][];

  return (
    <div className={cn('space-y-4', className)}>
      <div className="text-center">
        <h3 className="text-lg font-bold text-slate-900">나를 표현하는 키워드</h3>
        <p className="text-sm text-slate-500 mt-1">
          최대 {maxKeywords}개까지 선택할 수 있습니다
          <span className="ml-2 text-blue-600 font-medium">
            {selectedKeywords.length}/{maxKeywords}
          </span>
        </p>
      </div>

      {categories.map(([categoryId, category]) => (
        <div key={categoryId}>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            {category.label}
          </p>
          <div className="flex flex-wrap gap-2">
            {category.keywords.map((keyword) => {
              const isSelected = selectedKeywords.includes(keyword);
              const isDisabled = !isSelected && selectedKeywords.length >= maxKeywords;

              return (
                <button
                  key={keyword}
                  onClick={() => toggleKeyword(keyword)}
                  disabled={isDisabled}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                    isSelected
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                    isDisabled && 'opacity-40 cursor-not-allowed'
                  )}
                >
                  {keyword}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

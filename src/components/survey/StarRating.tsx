'use client';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readOnly?: boolean;
}

const SIZES = { sm: 28, md: 40, lg: 48 } as const;

function StarIcon({ filled, size }: { filled: boolean; size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.5}
      className={`transition-colors ${filled ? 'text-amber-400' : 'text-slate-300'}`}
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export default function StarRating({ value, onChange, size = 'md', readOnly }: StarRatingProps) {
  const px = SIZES[size];

  return (
    <div className="flex gap-1" role="group" aria-label="별점">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readOnly && onChange?.(star)}
          disabled={readOnly}
          aria-label={`${star}점`}
          className={`transition-transform ${
            readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
          }`}
          style={{ width: px, height: px }}
        >
          <StarIcon filled={star <= value} size={px} />
        </button>
      ))}
    </div>
  );
}

import { useState } from 'react';
import { Layers } from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  fallbackTitle: string;
  className?: string;
  containerClassName?: string;
}

export function ResilientImage({
  src,
  alt,
  fallbackTitle,
  className = '',
  containerClassName = '',
}: ResilientImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#ECEEEB] via-[#E3E6E2] to-[#D8DDD7] p-8 text-center ${containerClassName}`}
      >
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg border border-[#CBD0CA] bg-white/80 text-[#1B4D3E]">
          <Layers className="h-5 w-5" aria-hidden="true" />
        </div>
        <p className="font-display text-sm font-semibold text-[#141716]">
          {fallbackTitle}
        </p>
        <p className="mt-1 max-w-xs text-xs text-[#555D58]">
          Architectural Compressed Earth Block visualization
        </p>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden bg-[#E7EAE6] ${containerClassName}`}>
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
        className={className}
      />
    </div>
  );
}

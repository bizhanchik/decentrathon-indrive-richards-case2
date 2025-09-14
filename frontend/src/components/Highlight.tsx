import type { ReactNode } from 'react';

interface HighlightProps {
  children: ReactNode;
}

export function Highlight({ children }: HighlightProps) {
  return (
    <span className="relative inline-block">
      <span className="relative z-10">{children}</span>
      <span 
        className="absolute inset-0 bg-current opacity-20 rounded transform -rotate-1 transition-transform duration-300 hover:rotate-1" 
        style={{ backgroundColor: '#C1F21D' }}
      ></span>
    </span>
  );
}

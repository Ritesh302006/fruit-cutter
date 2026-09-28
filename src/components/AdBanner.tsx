import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

interface AdBannerProps {
  slotId?: string;
  format?: 'auto' | 'horizontal' | 'rectangle';
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  slotId = '1234567890',
  format = 'auto',
  className = '',
}) => {
  const adRef = useRef<HTMLDivElement>(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        setAdLoaded(true);
      }
    } catch (e) {
      console.warn('AdSense script error or adblock detected:', e);
      setHasError(true);
    }
  }, []);

  return (
    <div
      ref={adRef}
      className={`relative w-full overflow-hidden rounded-2xl bg-slate-900/60 border border-slate-800/80 p-2 text-center transition-all ${className}`}
    >
      <div className="flex items-center justify-between px-1 mb-1 text-[9px] font-game uppercase tracking-wider text-slate-500">
        <span>Advertisement</span>
        <span className="text-[8px] bg-slate-800 px-1.5 py-0.2 rounded text-slate-400">Ad</span>
      </div>

      <div className="min-h-[50px] flex items-center justify-center overflow-hidden">
        {/* Official Google AdSense Ins Element */}
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', minHeight: '50px' }}
          data-ad-client="ca-pub-6182995643181216"
          data-ad-slot={slotId}
          data-ad-format={format}
          data-full-width-responsive="true"
        />

        {/* Fallback / Visual Placeholder while Google reviews or serves ads */}
        {!adLoaded && (
          <div className="flex items-center justify-center gap-2 py-2 text-slate-500 text-xs font-game">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Google Ad Loading...</span>
          </div>
        )}
      </div>
    </div>
  );
};

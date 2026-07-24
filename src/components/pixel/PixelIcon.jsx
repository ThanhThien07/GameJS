import React from 'react';

export function PixelIcon({ icon, size = 'md', className = '' }) {
  const sizeStyles = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-xl'
  };

  return (
    <div className={`bg-[#0f172a] border-2 border-[#334155] shadow-[2px_2px_0px_#000000] flex items-center justify-center font-bold select-none ${sizeStyles[size] || sizeStyles.md} ${className}`}>
      {icon}
    </div>
  );
}

export function PixelStat({ label, value, icon, variant = 'gold' }) {
  return (
    <div className="flex items-center gap-2 bg-[#0f172a] border-2 border-[#334155] px-2.5 py-1 font-['Silkscreen',monospace]">
      {icon && <span className="text-xs">{icon}</span>}
      <div className="flex flex-col text-left">
        <span className="text-[8px] text-slate-400 font-bold uppercase leading-none">{label}</span>
        <span className="text-xs text-amber-400 font-bold leading-none mt-0.5">{value}</span>
      </div>
    </div>
  );
}

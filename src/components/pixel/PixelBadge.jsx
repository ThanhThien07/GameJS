import React from 'react';

function PixelBadge({ 
  children, 
  rarity = 'common', 
  size = 'sm', 
  className = '' 
}) {
  const rarityColors = {
    common: 'bg-[#1e293b] text-slate-300 border-[#475569]',
    rare: 'bg-[#1e3a8a] text-blue-300 border-[#3b82f6]',
    epic: 'bg-[#3b0764] text-purple-300 border-[#9333ea]',
    legendary: 'bg-[#78350f] text-amber-300 border-[#f59e0b]'
  };

  const sizeStyles = {
    sm: 'text-[9px] px-2 py-0.5 border-2',
    md: 'text-[10px] px-2.5 py-1 border-2',
    lg: 'text-xs px-3 py-1.5 border-4'
  };

  return (
    <span className={`font-['Silkscreen',monospace] font-bold uppercase tracking-wider inline-flex items-center gap-1 shadow-[2px_2px_0px_#000000] select-none ${rarityColors[rarity] || rarityColors.common} ${sizeStyles[size] || sizeStyles.sm} ${className}`}>
      {children}
    </span>
  );
}

export default PixelBadge;

import React from 'react';

function PixelButton({ 
  children, 
  onClick, 
  variant = 'gold', 
  size = 'md', 
  disabled = false, 
  className = '', 
  type = 'button',
  title = ''
}) {
  // Variants mapping to retro RPG pixel color themes
  const variantStyles = {
    gold: 'bg-[#f59e0b] hover:bg-[#fbbf24] text-[#0f172a] border-[#78350f] shadow-[inset_-3px_-3px_0px_rgba(180,83,9,0.8),inset_3px_3px_0px_rgba(254,240,138,0.9)]',
    wood: 'bg-[#78350f] hover:bg-[#92400e] text-[#fef3c7] border-[#29180c] shadow-[inset_-3px_-3px_0px_rgba(40,20,10,0.8),inset_3px_3px_0px_rgba(217,119,6,0.6)]',
    blue: 'bg-[#2563eb] hover:bg-[#3b82f6] text-white border-[#1e3a8a] shadow-[inset_-3px_-3px_0px_rgba(30,58,138,0.8),inset_3px_3px_0px_rgba(147,197,253,0.9)]',
    green: 'bg-[#15803d] hover:bg-[#16a34a] text-white border-[#052e16] shadow-[inset_-3px_-3px_0px_rgba(5,46,22,0.8),inset_3px_3px_0px_rgba(134,239,172,0.9)]',
    red: 'bg-[#b91c1c] hover:bg-[#dc2626] text-white border-[#450a0a] shadow-[inset_-3px_-3px_0px_rgba(69,10,10,0.8),inset_3px_3px_0px_rgba(252,165,165,0.9)]',
    purple: 'bg-[#7e22ce] hover:bg-[#9333ea] text-white border-[#3b0764] shadow-[inset_-3px_-3px_0px_rgba(59,7,100,0.8),inset_3px_3px_0px_rgba(216,180,254,0.9)]',
    dark: 'bg-[#1e293b] hover:bg-[#334155] text-slate-200 border-[#0f172a] shadow-[inset_-3px_-3px_0px_rgba(15,23,42,0.8),inset_3px_3px_0px_rgba(148,163,184,0.4)]'
  };

  const sizeStyles = {
    sm: 'px-2.5 py-1.5 text-[10px]',
    md: 'px-4 py-2.5 text-xs',
    lg: 'px-6 py-3.5 text-sm',
    xl: 'px-8 py-4 text-base'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`font-['Silkscreen','Press_Start_2P',monospace] font-bold uppercase tracking-wider relative inline-flex items-center justify-center gap-2 select-none border-4 transition-all duration-75 active:translate-y-1 active:translate-x-0.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${variantStyles[variant] || variantStyles.gold} ${sizeStyles[size] || sizeStyles.md} ${className}`}
    >
      {children}
    </button>
  );
}

export default PixelButton;

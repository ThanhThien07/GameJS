import React from 'react';

function PixelCurrency({ 
  icon = '🪙', 
  amount = 0, 
  rate = '', 
  variant = 'gold', 
  onClick 
}) {
  const borderColors = {
    gold: 'border-[#78350f] text-[#fef08a]',
    purple: 'border-[#581c87] text-[#e9d5ff]',
    green: 'border-[#14532d] text-[#bbf7d0]'
  };

  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-2 bg-[#0f172a] border-2 px-3 py-1.5 shadow-[2px_2px_0px_#000000] font-['Silkscreen',monospace] ${borderColors[variant] || borderColors.gold} ${onClick ? 'cursor-pointer hover:bg-[#1e293b]' : ''}`}
    >
      <span className="text-sm select-none animate-pulse">{icon}</span>
      <div className="flex flex-col text-left">
        <span className="font-bold text-xs leading-none">
          {typeof amount === 'number' ? amount.toLocaleString() : amount}
        </span>
        {rate && (
          <span className="text-[8px] text-emerald-400 font-bold leading-none mt-0.5">
            {rate}
          </span>
        )}
      </div>
    </div>
  );
}

export default PixelCurrency;

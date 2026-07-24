import React from 'react';
import PixelButton from './PixelButton';

function PixelShopCard({ 
  icon = '🧪', 
  title = '', 
  desc = '', 
  price = '', 
  onBuy, 
  canAfford = true 
}) {
  return (
    <div className="bg-[#0f172a] border-4 border-[#334155] p-3 flex flex-col justify-between items-center text-center shadow-[4px_4px_0px_#000000] font-['Silkscreen',monospace]">
      <div className="w-12 h-12 bg-[#1e293b] border-2 border-amber-500 flex items-center justify-center text-2xl mb-2">
        {icon}
      </div>
      <h4 className="font-bold text-xs text-white mb-1 uppercase">{title}</h4>
      <p className="text-[9px] text-slate-400 mb-3">{desc}</p>
      <PixelButton
        onClick={onBuy}
        disabled={!canAfford}
        variant={canAfford ? 'green' : 'dark'}
        size="sm"
        className="w-full"
      >
        MUA ({price})
      </PixelButton>
    </div>
  );
}

export default PixelShopCard;

import React from 'react';

function PixelInventory({ items = [] }) {
  const rarityBorders = {
    common: 'border-[#475569] bg-[#0f172a]',
    rare: 'border-[#3b82f6] bg-[#1e3a8a]/40',
    epic: 'border-[#9333ea] bg-[#3b0764]/40',
    legendary: 'border-[#f59e0b] bg-[#78350f]/40'
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full font-['Silkscreen',monospace]">
      {items.map((item, idx) => (
        <div 
          key={idx}
          className={`border-4 p-3 flex flex-col items-center text-center justify-between shadow-[4px_4px_0px_#000000] relative group ${rarityBorders[item.rarity] || rarityBorders.common}`}
        >
          <div className="w-10 h-10 bg-[#0f172a] border-2 border-[#334155] flex items-center justify-center text-xl mb-2 group-hover:scale-110 transition-transform">
            {item.icon}
          </div>
          <span className="text-[10px] font-bold text-white mb-1 uppercase">{item.name}</span>
          <span className="text-[9px] text-amber-400 font-bold">{item.stat}</span>
          {item.count && (
            <span className="absolute top-1 right-1 text-[8px] bg-[#78350f] text-white px-1 font-bold border border-[#f59e0b]">
              x{item.count}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

export default PixelInventory;

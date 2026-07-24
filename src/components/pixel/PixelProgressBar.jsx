import React from 'react';

function PixelProgressBar({ 
  value = 0, 
  max = 100, 
  label = '', 
  variant = 'gold', 
  height = 'h-5', 
  className = '' 
}) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  const barGradients = {
    gold: 'bg-[#f59e0b] shadow-[inset_0_2px_0_#fef08a,inset_0_-2px_0_#b45309]',
    red: 'bg-[#dc2626] shadow-[inset_0_2px_0_#fca5a5,inset_0_-2px_0_#7f1d1d]',
    green: 'bg-[#16a34a] shadow-[inset_0_2px_0_#86efac,inset_0_-2px_0_#14532d]',
    blue: 'bg-[#2563eb] shadow-[inset_0_2px_0_#93c5fd,inset_0_-2px_0_#1e3a8a]',
    purple: 'bg-[#9333ea] shadow-[inset_0_2px_0_#d8b4fe,inset_0_-2px_0_#581c87]'
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between items-center mb-1 text-[10px] font-['Silkscreen',monospace] font-bold">
          <span className="text-slate-300 uppercase">{label}</span>
          <span className="text-amber-400">{Math.round(percent)}%</span>
        </div>
      )}
      <div className={`w-full bg-[#0f172a] border-2 border-[#334155] p-0.5 shadow-[inset_2px_2px_0px_#000000] relative overflow-hidden ${height}`}>
        <div
          className={`h-full transition-all duration-200 ${barGradients[variant] || barGradients.gold}`}
          style={{ width: `${percent}%` }}
        ></div>
      </div>
    </div>
  );
}

export default PixelProgressBar;

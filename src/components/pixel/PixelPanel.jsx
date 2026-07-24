import React from 'react';

function PixelPanel({ 
  children, 
  title, 
  variant = 'dark', 
  className = '', 
  headerRight 
}) {
  const variantBg = {
    dark: 'bg-[#1e293b] border-[#0f172a]',
    wood: 'bg-[#451a03] border-[#29180c]',
    slate: 'bg-[#0f172a] border-[#020617]',
    gold: 'bg-[#78350f] border-[#451a03]'
  };

  return (
    <div className={`relative border-4 rounded-none shadow-[6px_6px_0px_#000000] ${variantBg[variant] || variantBg.dark} ${className}`}>
      {/* Top Header Ribbon if title provided */}
      {title && (
        <div className="bg-[#0f172a] border-b-4 border-[#334155] px-4 py-2.5 flex items-center justify-between">
          <h3 className="font-['Silkscreen','Press_Start_2P',monospace] text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <span>⚔️</span> {title}
          </h3>
          {headerRight && <div>{headerRight}</div>}
        </div>
      )}
      
      {/* Content Container */}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}

export default PixelPanel;

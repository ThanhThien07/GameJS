import React, { useState } from 'react';

function PixelTooltip({ text, children }) {
  const [show, setShow] = useState(false);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && text && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-[#0f172a] text-amber-300 font-['Silkscreen',monospace] font-bold text-[9px] uppercase border-2 border-[#f59e0b] shadow-[3px_3px_0px_#000000] whitespace-nowrap z-50 pointer-events-none">
          {text}
        </div>
      )}
    </div>
  );
}

export default PixelTooltip;

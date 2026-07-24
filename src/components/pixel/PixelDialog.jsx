import React from 'react';
import PixelButton from './PixelButton';

function PixelDialog({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  maxWidth = 'max-w-md' 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 font-['Silkscreen','Press_Start_2P',monospace]">
      <div className={`w-full ${maxWidth} bg-[#1e293b] border-4 border-[#0f172a] shadow-[8px_8px_0px_#000000] p-5 text-white animate-in zoom-in-95 duration-100 relative`}>
        {/* Header Bar */}
        <div className="flex justify-between items-center border-b-4 border-[#334155] pb-3 mb-4">
          <h3 className="font-bold text-sm text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <span>⚔️</span> {title}
          </h3>
          <PixelButton onClick={onClose} variant="red" size="sm">
            ✕
          </PixelButton>
        </div>

        {/* Dialog Content */}
        <div className="space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
}

export default PixelDialog;

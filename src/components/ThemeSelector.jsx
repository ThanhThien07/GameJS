import React, { useState } from 'react';
import PixelButton from './pixel/PixelButton';
import PixelPanel from './pixel/PixelPanel';

function ThemeSelector({ selectedTheme, onSelectTheme, onBack }) {
  const [activeThemeId, setActiveThemeId] = useState(selectedTheme || 'monster');

  const themes = [
    {
      id: 'monster',
      name: 'ĐÁNH QUÁI VẬT',
      desc: 'Chiến đấu chống lại quái thú cổ xưa. Nhấp chuột để gây sát thương và đoạt vàng!',
      image: `${import.meta.env.BASE_URL}assets/pixel_monster.png`,
      badge: '⚔️ SĂN QUÁI',
      btnVariant: 'red'
    },
    {
      id: 'wood',
      name: 'TIỀU PHU CHẶT GỖ',
      desc: 'Đốn hạ thân cây cổ thụ khổng lồ. Nhấp đốn gỗ kiếm tiền bán lâm sản!',
      image: `${import.meta.env.BASE_URL}assets/pixel_wood.png`,
      badge: '🪵 CHẶT GỖ',
      btnVariant: 'green'
    },
    {
      id: 'stone',
      name: 'THỢ MỎ ĐÀO ĐÁ',
      desc: 'Khai thác khối quặng thạch anh ẩn giấu sâu dưới hang mỏ bí ẩn!',
      image: `${import.meta.env.BASE_URL}assets/pixel_stone.png`,
      badge: '🪨 ĐÀO ĐÁ',
      btnVariant: 'gold'
    }
  ];

  const handleConfirmSelection = (themeId) => {
    onSelectTheme(themeId);
  };

  return (
    <div className="w-full max-w-4xl flex flex-col gap-6 items-center py-4 px-2 font-['Silkscreen',monospace]">
      {/* Header Bar */}
      <div className="flex w-full items-center justify-between mb-1">
        <PixelButton onClick={onBack} variant="dark" size="sm">
          ⬅️ QUAY LẠI
        </PixelButton>
        <h2 className="text-lg md:text-xl font-black text-amber-400 uppercase tracking-wider drop-shadow-[2px_2px_0px_#000000]">
          CHỌN 1 TRONG 3 MÀN CHƠI
        </h2>
        <div className="w-24"></div>
      </div>

      {/* 3 Theme Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
        {themes.map((theme) => {
          const isSelected = activeThemeId === theme.id;
          return (
            <PixelPanel
              key={theme.id}
              onClick={() => setActiveThemeId(theme.id)}
              className={`p-4 flex flex-col justify-between items-center text-center cursor-pointer transition-transform duration-100 ${
                isSelected ? 'border-4 border-amber-400 bg-[#29180c]' : 'bg-[#1e293b]'
              }`}
            >
              {/* Top Badge & Selected Status Indicator */}
              <div className="w-full flex justify-between items-center mb-1">
                {isSelected ? (
                  <span className="text-[9px] px-2 py-0.5 bg-amber-400 text-slate-950 font-bold border-2 border-amber-600 uppercase">
                    ✓ ĐÃ CHỌN
                  </span>
                ) : (
                  <div></div>
                )}
                <span className="text-[9px] px-2 py-0.5 bg-[#0f172a] text-slate-300 font-bold border-2 border-[#334155] uppercase">
                  {theme.badge}
                </span>
              </div>

              {/* Mascot Image & Title */}
              <div className="my-2 flex flex-col items-center">
                <div className="w-24 h-24 max-w-[96px] max-h-[96px] flex items-center justify-center my-3 shrink-0 relative">
                  <img 
                    src={theme.image} 
                    alt={theme.name} 
                    className="w-full h-full max-w-[96px] max-h-[96px] object-contain pixel-art filter drop-shadow-[4px_4px_0px_#000000] hover:scale-110 transition-transform"
                  />
                </div>
                <h3 className="text-sm font-bold text-white mt-2 mb-1">
                  {theme.name}
                </h3>
                <p className="text-slate-400 text-[10px] leading-snug">
                  {theme.desc}
                </p>
              </div>

              {/* Action Button inside Card */}
              <PixelButton
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveThemeId(theme.id);
                  handleConfirmSelection(theme.id);
                }}
                variant={theme.btnVariant}
                size="sm"
                className="w-full mt-3"
              >
                ▶️ {isSelected ? 'VÀO TRẬN' : 'CHỌN MÀN'}
              </PixelButton>
            </PixelPanel>
          );
        })}
      </div>

      {/* Main Bottom CTA Confirmation Button */}
      <PixelButton
        onClick={() => handleConfirmSelection(activeThemeId)}
        variant="gold"
        size="lg"
        className="w-full max-w-md mt-2"
      >
        🎮 VÀO TRẬN CHƠI MÀN ĐÃ CHỌN
      </PixelButton>
    </div>
  );
}

export default ThemeSelector;

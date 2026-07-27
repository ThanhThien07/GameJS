import React, { useState } from 'react';

function ThemeSelector({ selectedTheme, onSelectTheme, onBack }) {
  const [activeThemeId, setActiveThemeId] = useState(selectedTheme || 'monster');

  const themes = [
    {
      id: 'monster',
      name: 'ĐÁNH QUÁI VẬT',
      desc: 'Chiến đấu chống lại quái thú cổ xưa. Nhấp chuột để gây sát thương và đoạt vàng!',
      image: `${import.meta.env.BASE_URL}assets/pixel_monster.png`,
      badge: '⚔️ SĂN QUÁI',
      borderColor: 'border-red-500',
      activeBg: 'bg-red-900/30',
      btnBg: 'bg-red-600 border-red-400 hover:bg-red-500',
    },
    {
      id: 'wood',
      name: 'TIỀU PHU CHẶT GỖ',
      desc: 'Đốn hạ thân cây cổ thụ khổng lồ. Nhấp đốn gỗ kiếm tiền bán lâm sản!',
      image: `${import.meta.env.BASE_URL}assets/pixel_wood.png`,
      badge: '🪵 CHẶT GỖ',
      borderColor: 'border-green-500',
      activeBg: 'bg-green-900/30',
      btnBg: 'bg-green-600 border-green-400 hover:bg-green-500',
    },
    {
      id: 'stone',
      name: 'THỢ MỎ ĐÀO ĐÁ',
      desc: 'Khai thác khối quặng thạch anh ẩn giấu sâu dưới hang mỏ bí ẩn!',
      image: `${import.meta.env.BASE_URL}assets/pixel_stone.png`,
      badge: '🪨 ĐÀO ĐÁ',
      borderColor: 'border-amber-500',
      activeBg: 'bg-amber-900/30',
      btnBg: 'bg-amber-500 border-amber-300 hover:bg-amber-400 text-black',
    },
  ];

  return (
    <div
      className="min-h-screen w-full bg-[#0f172a] flex flex-col"
      style={{ fontFamily: "'Press Start 2P', 'Silkscreen', monospace" }}
    >
      {/* Header */}
      <header className="w-full bg-[#1e293b] border-b-4 border-black px-6 py-3 flex items-center justify-between sticky top-0 z-10 shadow-[0_4px_0_#000]">
        <button
          onClick={onBack}
          className="flex items-center gap-2 bg-[#0f172a] border-2 border-[#334155] text-slate-300 px-3 py-2 text-[9px] font-black uppercase shadow-[2px_2px_0_#000] hover:border-amber-400 active:translate-y-0.5"
        >
          ← QUAY LẠI
        </button>
        <h1 className="text-xs font-black text-amber-400 uppercase">CHỌN 1 TRONG 3 MÀN CHƠI</h1>
        <div className="w-28" />
      </header>

      {/* Body */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">

        {/* 3 Theme Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
          {themes.map((theme) => {
            const isSelected = activeThemeId === theme.id;
            return (
              <div
                key={theme.id}
                onClick={() => setActiveThemeId(theme.id)}
                className={`bg-[#1e293b] border-4 p-5 flex flex-col items-center text-center cursor-pointer shadow-[4px_4px_0_#000] transition-transform active:translate-y-1
                  ${isSelected ? `${theme.borderColor} ${theme.activeBg}` : 'border-[#334155] hover:border-slate-500'}`}
              >
                {/* Top Badge Row */}
                <div className="w-full flex justify-between items-center mb-3">
                  {isSelected ? (
                    <span className="text-[8px] px-2 py-0.5 bg-amber-400 text-black font-black border border-amber-600 uppercase shadow-[1px_1px_0_#000]">
                      ✓ ĐÃ CHỌN
                    </span>
                  ) : <div />}
                  <span className="text-[8px] px-2 py-0.5 bg-[#0f172a] text-slate-300 font-black border border-[#334155] uppercase">
                    {theme.badge}
                  </span>
                </div>

                {/* Sprite / Image */}
                <div className="w-28 h-28 flex items-center justify-center my-4">
                  <img
                    src={theme.image}
                    alt={theme.name}
                    className="w-full h-full object-contain pixel-art"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>

                {/* Name & Desc */}
                <h3 className="text-[10px] font-black text-white uppercase mb-2">{theme.name}</h3>
                <p className="text-slate-400 text-[8px] leading-relaxed mb-4">{theme.desc}</p>

                {/* Select Button */}
                <button
                  onClick={(e) => { e.stopPropagation(); setActiveThemeId(theme.id); onSelectTheme(theme.id); }}
                  className={`w-full py-2.5 text-[9px] font-black uppercase border-2 shadow-[2px_2px_0_#000] active:translate-y-0.5 transition-transform text-white
                    ${theme.btnBg}`}
                >
                  {isSelected ? '▶ VÀO TRẬN' : 'CHỌN MÀN'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <button
          onClick={() => onSelectTheme(activeThemeId)}
          className="mt-8 w-full max-w-md bg-amber-400 border-b-4 border-amber-700 border-2 border-amber-300 text-black text-xs font-black py-4 uppercase shadow-[4px_4px_0_#000] hover:bg-amber-300 active:translate-y-1 transition-all"
        >
          🎮 VÀO TRẬN CHƠI MÀN ĐÃ CHỌN
        </button>
      </div>
    </div>
  );
}

export default ThemeSelector;

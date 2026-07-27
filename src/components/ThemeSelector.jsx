import React, { useState } from 'react';

const THEMES = [
  {
    id: 'monster',
    name: 'Đánh Quái Vật',
    icon: '⚔️',
    desc: 'Chiến đấu với quái thú, nhấp chuột gây sát thương',
    glow: 'from-red-900/40 to-rose-900/40 border-red-500/30',
    badge: 'bg-red-500',
  },
  {
    id: 'wood',
    name: 'Tiều Phu Chặt Gỗ',
    icon: '🪓',
    desc: 'Đốn hạ cây cổ thụ, thu hoạch gỗ kiếm tiền',
    glow: 'from-green-900/40 to-emerald-900/40 border-green-500/30',
    badge: 'bg-green-500',
  },
  {
    id: 'stone',
    name: 'Thợ Mỏ Đào Đá',
    icon: '⛏️',
    desc: 'Khai thác quặng khoáng từ hang mỏ bí ẩn',
    glow: 'from-amber-900/40 to-yellow-900/40 border-amber-500/30',
    badge: 'bg-amber-500',
  },
];

export default function ThemeSelector({ selectedTheme, onSelectTheme, onBack }) {
  const [active, setActive] = useState(selectedTheme || 'monster');

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>

      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3 bg-[#161b22] border-b border-white/5">
        <button onClick={onBack} className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white bg-[#1c2333] border border-white/8 rounded-xl px-3 py-2 transition-colors">
          ← Quay lại
        </button>
        <div>
          <h1 className="text-sm font-black text-white text-center">CHỌN CHỦ ĐỀ</h1>
          <p className="text-[9px] text-slate-500 text-center">Chọn màn chơi bạn muốn</p>
        </div>
        <div className="w-20" />
      </header>

      {/* Theme cards */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-3 gap-4">
          {THEMES.map(t => {
            const isSelected = active === t.id;
            return (
              <div
                key={t.id}
                onClick={() => setActive(t.id)}
                className={`bg-gradient-to-b ${t.glow} border-2 rounded-2xl p-5 flex flex-col items-center text-center cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${isSelected ? 'ring-2 ring-amber-500/60 ring-offset-2 ring-offset-[#0d1117]' : ''}`}
              >
                {isSelected && (
                  <div className="self-stretch flex justify-between mb-3">
                    <span className="text-[8px] font-black text-amber-400 bg-amber-400/15 border border-amber-400/30 rounded-full px-2 py-0.5">✓ ĐÃ CHỌN</span>
                    <span className={`text-[8px] text-white font-bold ${t.badge} rounded-full px-2 py-0.5`}>{t.icon}</span>
                  </div>
                )}

                <div className="text-5xl mb-3">{t.icon}</div>
                <h3 className="text-sm font-black text-white mb-1.5">{t.name}</h3>
                <p className="text-[10px] text-slate-400 leading-relaxed mb-4">{t.desc}</p>

                <button
                  onClick={e => { e.stopPropagation(); setActive(t.id); onSelectTheme(t.id); }}
                  className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${
                    isSelected
                      ? 'bg-amber-400 text-gray-900 hover:bg-amber-300 shadow-lg shadow-amber-500/20'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/8'}`}
                >
                  {isSelected ? '▶ VÀO TRẬN' : 'Chọn màn này'}
                </button>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => onSelectTheme(active)}
          className="mt-6 w-full max-w-sm bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-gray-900 font-black py-4 rounded-2xl text-sm shadow-xl shadow-amber-500/20 active:scale-[0.98] transition-all"
        >
          🎮 VÀO TRẬN NGAY
        </button>
      </div>
    </div>
  );
}

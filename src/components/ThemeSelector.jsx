import React, { useState } from 'react';
import { ArrowLeft, Swords, Trees, Gem, CheckCircle2, Play } from 'lucide-react';

function ThemeSelector({ selectedTheme, onSelectTheme, onBack }) {
  const [activeThemeId, setActiveThemeId] = useState(selectedTheme || 'monster');

  const themes = [
    {
      id: 'monster',
      name: 'Đánh Quái Vật (Monster Fight)',
      desc: 'Chiến đấu chống lại quái thú cổ xưa. Nhấp chuột để gây sát thương và hạ gục boss để đoạt vàng!',
      image: `${import.meta.env.BASE_URL}assets/cartoon_monster.png`,
      color: 'bg-rose-950/50 border-rose-800/80 hover:border-rose-500',
      activeBorder: 'ring-4 ring-rose-500 border-rose-400 shadow-rose-500/30 scale-102',
      accentColor: 'from-rose-600 to-red-600',
      badge: 'Hành động kịch tính'
    },
    {
      id: 'wood',
      name: 'Tiều Phu Chặt Gỗ (Woodcutter)',
      desc: 'Đốn hạ các thân cây cổ thụ khổng lồ. Nhấp để đốn gỗ, tạo mảnh vụn và kiếm tiền bán lâm sản!',
      image: `${import.meta.env.BASE_URL}assets/cartoon_wood.png`,
      color: 'bg-emerald-950/50 border-emerald-800/80 hover:border-emerald-500',
      activeBorder: 'ring-4 ring-emerald-500 border-emerald-400 shadow-emerald-500/30 scale-102',
      accentColor: 'from-emerald-600 to-green-600',
      badge: 'Thư giãn giải trí'
    },
    {
      id: 'stone',
      name: 'Thợ Mỏ Đào Đá (Stone Mining)',
      desc: 'Khai thác khối quặng lấp lánh ẩn giấu sâu dưới hang mỏ. Đập đá với hiệu ứng tia lửa thạch anh!',
      image: `${import.meta.env.BASE_URL}assets/cartoon_stone.png`,
      color: 'bg-amber-950/50 border-amber-800/80 hover:border-amber-500',
      activeBorder: 'ring-4 ring-amber-500 border-amber-400 shadow-amber-500/30 scale-102',
      accentColor: 'from-amber-500 to-yellow-600',
      badge: 'Khai quật tài nguyên'
    }
  ];

  const handleConfirmSelection = (themeId) => {
    onSelectTheme(themeId);
  };

  return (
    <div className="w-full max-w-4xl flex flex-col gap-6 items-center animate-in fade-in duration-200 py-4 px-2">
      {/* Header Bar */}
      <div className="flex w-full items-center justify-between mb-1">
        <button 
          onClick={onBack} 
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 py-2.5 px-4 rounded-2xl flex items-center gap-1.5 text-xs font-black cursor-pointer transition-all active:scale-95"
        >
          <ArrowLeft size={16} /> Quay Lại
        </button>
        <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">
          CHỌN 1 TRONG 3 CHỦ ĐỀ CHƠI
        </h2>
        <div className="w-24"></div> {/* Spacer */}
      </div>

      {/* 3 Theme Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
        {themes.map((theme) => {
          const isSelected = activeThemeId === theme.id;
          return (
            <div
              key={theme.id}
              onClick={() => setActiveThemeId(theme.id)}
              className={`p-5 flex flex-col justify-between items-center text-center cursor-pointer border transition-all duration-200 ${
                isSelected ? theme.activeBorder : theme.color
              } rounded-3xl shadow-xl backdrop-blur-md relative overflow-hidden group`}
            >
              {/* Top Badge & Selected Status Indicator */}
              <div className="w-full flex justify-between items-center mb-1">
                {isSelected ? (
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-black uppercase flex items-center gap-1">
                    <CheckCircle2 size={12} /> ĐÃ CHỌN
                  </span>
                ) : (
                  <div></div>
                )}
                <span className="text-[9px] px-2.5 py-0.5 rounded-full bg-[#0f172a] border border-slate-700 font-black uppercase text-slate-300">
                  {theme.badge}
                </span>
              </div>

              {/* Mascot Image & Title */}
              <div className="my-2 flex flex-col items-center">
                <div className="w-24 h-24 max-w-[96px] max-h-[96px] flex items-center justify-center my-3 shrink-0 relative">
                  <img 
                    src={theme.image} 
                    alt={theme.name} 
                    className="w-full h-full max-w-[96px] max-h-[96px] object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-200 z-10"
                  />
                </div>
                <h3 className="text-base font-black text-white transition-colors mt-2 mb-1">
                  {theme.name}
                </h3>
                <p className="text-slate-400 text-xs leading-snug line-clamp-3">
                  {theme.desc}
                </p>
              </div>

              {/* Action Button inside Card */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveThemeId(theme.id);
                  handleConfirmSelection(theme.id);
                }}
                className={`w-full mt-4 text-xs py-3 cursor-pointer font-black text-white rounded-2xl bg-gradient-to-r ${theme.accentColor} shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-1.5`}
              >
                <Play size={14} /> {isSelected ? 'VÀO TRẬN NGAY' : 'CHỌN MÀN NÀY'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Main Bottom CTA Confirmation Button */}
      <button
        onClick={() => handleConfirmSelection(activeThemeId)}
        className="w-full max-w-md cta-gold-button py-4 text-base font-black flex items-center justify-center gap-2 shadow-2xl active:scale-95 cursor-pointer mt-2"
      >
        <Play size={20} /> VÀO TRẬN CHƠI CHỦ ĐỀ ĐÃ CHỌN
      </button>
    </div>
  );
}

export default ThemeSelector;

import React from 'react';
import { ArrowLeft, Swords, Trees, Gem } from 'lucide-react';

function ThemeSelector({ onSelectTheme, onBack }) {
  const themes = [
    {
      id: 'monster',
      name: 'Đánh Quái Vật (Monster Fight)',
      desc: 'Chiến đấu chống lại quái thú cổ xưa. Nhấp chuột để gây sát thương và hạ gục boss để đoạt lấy phần thưởng vàng rương lớn!',
      image: `${import.meta.env.BASE_URL}assets/cartoon_monster.png`,
      color: 'bg-rose-50/70 border-rose-200 hover:bg-rose-100/60',
      accentColor: '#dc2626',
      badge: 'Hành động kịch tính'
    },
    {
      id: 'wood',
      name: 'Tiều Phu Chặt Gỗ (Woodcutter)',
      desc: 'Đốn hạ các thân cây cổ thụ khổng lồ. Nhấp để đốn gỗ, tạo mảnh vụn bay ra và kiếm tiền bán lâm sản dồi dào!',
      image: `${import.meta.env.BASE_URL}assets/cartoon_wood.png`,
      color: 'bg-emerald-50/70 border-emerald-200 hover:bg-emerald-100/60',
      accentColor: '#059669',
      badge: 'Thư giãn giải trí'
    },
    {
      id: 'stone',
      name: 'Thợ Mỏ Đào Đá (Stone Mining)',
      desc: 'Khai thác khối quặng lấp lánh ẩn giấu sâu dưới hang mỏ. Nhấp đập đá với hiệu ứng tia lửa quặng lấp lánh thích mắt!',
      image: `${import.meta.env.BASE_URL}assets/cartoon_stone.png`,
      color: 'bg-amber-50/70 border-amber-200 hover:bg-amber-100/60',
      accentColor: '#d97706',
      badge: 'Khai quật tài nguyên'
    }
  ];

  return (
    <div className="w-full max-w-4xl flex flex-col gap-6 items-center">
      <div className="flex w-full items-center justify-between mb-2">
        <button onClick={onBack} className="btn-secondary py-2 px-4 flex items-center gap-1 text-sm font-bold">
          <ArrowLeft size={16} /> Quay Lại
        </button>
        <h2 className="text-xl md:text-2xl font-black text-slate-800 uppercase">
          CHỌN MÔ HÌNH CLICK CHUỘT
        </h2>
        <div className="w-20"></div> {/* Spacer */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {themes.map((theme) => {
          return (
            <div
              key={theme.id}
              onClick={() => onSelectTheme(theme.id)}
              className={`glass-panel p-6 flex flex-col justify-between items-center text-center cursor-pointer border hover:scale-105 active:scale-98 transition-all ${theme.color} group`}
            >
              <div className="w-full text-right mb-1">
                <span className="text-[9px] px-2.5 py-0.5 rounded-full bg-white border border-slate-200 font-extrabold uppercase text-slate-500">
                  {theme.badge}
                </span>
              </div>

              <div className="my-3 flex flex-col items-center">
                <img 
                  src={theme.image} 
                  alt={theme.name} 
                  className="w-32 h-32 object-contain my-3 filter drop-shadow-md group-hover:scale-110 transition-transform duration-200"
                />
                <h3 className="text-lg font-black mb-2 text-slate-800 transition-colors">
                  {theme.name}
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  {theme.desc}
                </p>
              </div>

              <button
                className="btn-primary w-full mt-4 text-sm py-2.5"
                style={{
                  background: `linear-gradient(135deg, ${theme.accentColor} 0%, ${theme.accentColor}dd 100%)`
                }}
              >
                Bắt đầu chơi
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ThemeSelector;

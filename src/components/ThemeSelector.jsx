import React from 'react';
import { ArrowLeft, Swords, Trees, Gem } from 'lucide-react';

function ThemeSelector({ onSelectTheme, onBack }) {
  const themes = [
    {
      id: 'monster',
      name: 'Đánh Quái Vật (Monster Fight)',
      desc: 'Chiến đấu chống lại những quái thú cổ xưa. Nhấp chuột để gây sát thương và hạ gục boss để đoạt lấy phần thưởng vàng rương lớn!',
      icon: Swords,
      color: 'from-rose-50 to-rose-100/30 border-rose-200 hover:bg-rose-50/50 text-rose-700',
      accentColor: '#dc2626',
      badge: 'Hành động kịch tính'
    },
    {
      id: 'wood',
      name: 'Tiều Phu Chặt Gỗ (Woodcutter)',
      desc: 'Đốn hạ các thân cây cổ thụ khổng lồ. Nhấp để đốn gỗ, tạo mảnh vụn bay ra và kiếm tiền bán lâm sản dồi dào!',
      icon: Trees,
      color: 'from-emerald-50 to-emerald-100/30 border-emerald-200 hover:bg-emerald-50/50 text-emerald-700',
      accentColor: '#059669',
      badge: 'Thư giãn giải trí'
    },
    {
      id: 'stone',
      name: 'Thợ Mỏ Đào Đá (Stone Mining)',
      desc: 'Khai thác khối quặng lấp lánh ẩn giấu sâu dưới hang mỏ. Nhấp đập đá với hiệu ứng tia lửa quặng lấp lánh thích mắt!',
      icon: Gem,
      color: 'from-amber-50 to-amber-100/30 border-amber-200 hover:bg-amber-50/50 text-amber-700',
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
          const IconComponent = theme.icon;
          return (
            <div
              key={theme.id}
              onClick={() => onSelectTheme(theme.id)}
              className={`glass-panel p-6 flex flex-col justify-between items-center text-center cursor-pointer border hover:scale-105 active:scale-98 transition-all bg-gradient-to-br ${theme.color} group`}
            >
              <div className="w-full text-right mb-1">
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-white border border-slate-200 font-extrabold uppercase text-slate-500">
                  {theme.badge}
                </span>
              </div>

              <div className="my-3">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center border mx-auto mb-4 transition-all group-hover:scale-110 shadow-sm"
                  style={{
                    borderColor: `${theme.accentColor}30`,
                    background: `${theme.accentColor}0a`
                  }}
                >
                  <IconComponent size={32} style={{ color: theme.accentColor }} />
                </div>
                <h3 className="text-lg font-black mb-2 text-slate-800 transition-colors">
                  {theme.name}
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  {theme.desc}
                </p>
              </div>

              <button
                className="w-full py-2.5 rounded-xl font-bold transition-all text-white mt-4 text-sm"
                style={{
                  background: `linear-gradient(135deg, ${theme.accentColor}ee 0%, ${theme.accentColor}aa 100%)`
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

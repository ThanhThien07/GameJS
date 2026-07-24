import React from 'react';
import { ArrowLeft } from 'lucide-react';

function ThemeSelector({ onSelectTheme, onBack }) {
  const themes = [
    {
      id: 'capybara',
      name: 'Linh Vật Capybara (Sunburst Mode)',
      desc: 'Chú chuột Capybara 3D đáng yêu đứng giữa vầng hào quang rực rỡ chuẩn phong cách Capybara Clicker!',
      image: `${import.meta.env.BASE_URL}assets/cartoon_capybara.png`,
      color: 'bg-amber-100/90 border-yellow-400 hover:bg-yellow-200/70',
      accentColor: '#f59e0b',
      badge: '👑 CAPYBARA YÊU THÍCH'
    },
    {
      id: 'button',
      name: 'Nút Đỏ 3D Cartoon (Red Button)',
      desc: 'Nút bấm 3D bóng bẩy phong cách comic cực chất! Nhấp nảy đàn hồi siêu đã tay đúng như ảnh minh họa!',
      image: `${import.meta.env.BASE_URL}assets/cartoon_red_button.png`,
      color: 'bg-red-50/70 border-red-300 hover:bg-red-100/60',
      accentColor: '#ff2d55',
      badge: '🔥 BẠN BÈ YÊU THÍCH'
    },
    {
      id: 'monster',
      name: 'Đánh Quái Vật (Monster Fight)',
      desc: 'Chiến đấu chống lại quái thú 3D mập mạp đáng yêu. Nhấp chuột để gây sát thương đoạt rương vàng!',
      image: `${import.meta.env.BASE_URL}assets/cartoon_monster.png`,
      color: 'bg-rose-50/70 border-rose-300 hover:bg-rose-100/60',
      accentColor: '#dc2626',
      badge: 'Hành động kịch tính'
    },
    {
      id: 'wood',
      name: 'Chặt Gỗ & Đào Đá (Classic Mining)',
      desc: 'Đốn hạ gốc cây 3D và đào quặng mỏ tinh thể 3D lấp lánh với hiệu ứng thích mắt!',
      image: `${import.meta.env.BASE_URL}assets/cartoon_wood.png`,
      color: 'bg-emerald-50/70 border-emerald-300 hover:bg-emerald-100/60',
      accentColor: '#059669',
      badge: 'Thư giãn giải trí'
    }
  ];

  return (
    <div className="w-full max-w-5xl flex flex-col gap-6 items-center">
      <div className="flex w-full items-center justify-between mb-2">
        <button onClick={onBack} className="btn-secondary py-2 px-4 flex items-center gap-1 text-sm font-bold">
          <ArrowLeft size={16} /> Quay Lại
        </button>
        <h2 className="cartoon-title-sub text-2xl md:text-3xl text-slate-900 uppercase">
          CHỌN CHỦ ĐỀ CLICK CHUỘT 3D
        </h2>
        <div className="w-20"></div> {/* Spacer */}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        {themes.map((theme) => {
          return (
            <div
              key={theme.id}
              onClick={() => onSelectTheme(theme.id)}
              className={`glass-panel p-5 flex flex-col justify-between items-center text-center cursor-pointer border-3 hover:scale-105 active:scale-95 transition-all ${theme.color} group`}
            >
              <div className="w-full text-right mb-1">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-yellow-300 text-black border-2 border-black font-black uppercase shadow-[2px_2px_0px_#000]">
                  {theme.badge}
                </span>
              </div>

              <div className="my-2 flex flex-col items-center">
                <img 
                  src={theme.image} 
                  alt={theme.name} 
                  className="w-28 h-28 object-contain my-2 filter drop-shadow-[0_6px_0_#000] group-hover:scale-110 transition-transform duration-200"
                />
                <h3 className="text-lg font-black mb-2 text-slate-900 leading-tight">
                  {theme.name}
                </h3>
                <p className="text-slate-600 text-xs font-bold leading-relaxed">
                  {theme.desc}
                </p>
              </div>

              <button
                className="btn-primary w-full mt-3 text-sm py-2"
                style={{
                  backgroundColor: theme.accentColor
                }}
              >
                CHỌN CHỦ ĐỀ
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ThemeSelector;

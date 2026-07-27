import React, { useState } from 'react';

const base = import.meta.env.BASE_URL;

const THEMES = [
  {
    id: 'monster',
    name: 'Đánh Quái Vật',
    image: `${base}assets/pixel_monster.png`,
    badgeIcon: '⚔️',
    desc: 'Chiến đấu với quái thú cổ xưa, nhấp chuột gây sát thương và kiếm vàng!',
    glow: 'from-red-900/40 to-rose-900/40 border-red-500/40',
    badge: 'bg-red-600',
    btnColor: 'btn-danger',
  },
  {
    id: 'wood',
    name: 'Tiều Phu Chặt Gỗ',
    image: `${base}assets/pixel_wood.png`,
    badgeIcon: '🪓',
    desc: 'Đốn hạ thân cây đại thụ, thu hoạch lâm sản đổi tiền vàng!',
    glow: 'from-green-900/40 to-emerald-900/40 border-green-500/40',
    badge: 'bg-green-600',
    btnColor: 'btn-success',
  },
  {
    id: 'stone',
    name: 'Thợ Mỏ Đào Đá',
    image: `${base}assets/pixel_stone.png`,
    badgeIcon: '⛏️',
    desc: 'Khai thác quặng thạch anh ẩn giấu sâu dưới lòng mỏ bí ẩn!',
    glow: 'from-amber-900/40 to-yellow-900/40 border-amber-500/40',
    badge: 'bg-amber-600',
    btnColor: 'btn-warning text-dark',
  },
];

export default function ThemeSelector({ selectedTheme, onSelectTheme, onBack }) {
  const [active, setActive] = useState(selectedTheme || 'monster');

  return (
    <div className="min-vh-100 bg-dark text-light d-flex flex-column" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>

      {/* Header */}
      <header className="d-flex align-items-center justify-content-between px-4 py-3 bg-surface-dark border-bottom border-secondary">
        <button onClick={onBack} className="btn btn-outline-secondary btn-sm rounded-3 fw-bold px-3">
          ← Quay lại
        </button>
        <div className="text-center">
          <h1 className="h6 fw-black text-light m-0 text-uppercase tracking-wider">CHỌN CHỦ ĐỀ TRẬN ĐẤU</h1>
          <p className="text-secondary m-0" style={{ fontSize: '10px' }}>Chọn 1 trong 3 loại để vào trận</p>
        </div>
        <div style={{ width: '80px' }} />
      </header>

      {/* Theme cards */}
      <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center p-4">
        <div className="container" style={{ maxWidth: '840px' }}>
          <div className="row g-4 justify-content-center">
            {THEMES.map(t => {
              const isSelected = active === t.id;
              return (
                <div key={t.id} className="col-12 col-md-4">
                  <div
                    onClick={() => setActive(t.id)}
                    className={`card h-100 bg-dark text-light border-2 rounded-4 p-4 text-center cursor-pointer transition-all ${
                      isSelected ? 'border-warning shadow-lg' : 'border-secondary'
                    }`}
                    style={{
                      background: isSelected ? 'rgba(255,255,255,0.03)' : 'transparent',
                      transform: isSelected ? 'scale(1.03)' : 'scale(1)'
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      {isSelected ? (
                        <span className="badge bg-warning text-dark fw-black uppercase" style={{ fontSize: '9px' }}>✓ ĐÃ CHỌN</span>
                      ) : <div />}
                      <span className={`badge ${t.badge} text-light font-bold`} style={{ fontSize: '11px' }}>{t.badgeIcon}</span>
                    </div>

                    {/* Image representation of stage target */}
                    <div className="d-flex align-items-center justify-content-center my-3" style={{ height: '120px' }}>
                      <img
                        src={t.image}
                        alt={t.name}
                        className="pixel-art img-fluid"
                        style={{ maxHeight: '110px', objectFit: 'contain', filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.4))' }}
                      />
                    </div>

                    <h3 className="h6 fw-black text-light mb-1 uppercase">{t.name}</h3>
                    <p className="text-secondary mb-3" style={{ fontSize: '11px', lineHeight: '1.4' }}>{t.desc}</p>

                    <button
                      onClick={e => { e.stopPropagation(); setActive(t.id); onSelectTheme(t.id); }}
                      className={`btn ${isSelected ? 'btn-warning text-dark' : 'btn-outline-secondary'} w-100 fw-black uppercase rounded-3 mt-auto`}
                      style={{ fontSize: '11px', padding: '8px 0' }}
                    >
                      {isSelected ? '▶ VÀO TRẬN' : 'Chọn màn này'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => onSelectTheme(active)}
          className="btn btn-warning btn-lg fw-black text-dark px-5 py-3 rounded-4 shadow-lg mt-4 uppercase"
          style={{ fontSize: '14px', minWidth: '320px' }}
        >
          🎮 VÀO TRẬN MÀN ĐÃ CHỌN
        </button>
      </div>
    </div>
  );
}

import React, { useState } from 'react';

const base = import.meta.env.BASE_URL;

export default function MainMenu({ isOnline, playerName, onSaveName, onSelectOffline, onSelectOnlineComp, onSelectOnlineCoop, onJoinRoom }) {
  const [name, setName]           = useState(playerName || '');
  const [code, setCode]           = useState('');
  const [showJoin, setShowJoin]   = useState(false);

  const save = () => name.trim() && onSaveName(name.trim());
  const go   = (fn) => { const n = name.trim() || 'Người chơi 1'; onSaveName(n); fn(); };

  return (
    <div
      className="min-vh-100 d-flex flex-column align-items-center justify-content-center p-3 position-relative overflow-hidden"
      style={{
        background: 'radial-gradient(circle at 50% 30%, rgba(99, 102, 241, 0.28) 0%, rgba(139, 92, 246, 0.15) 45%, #050811 100%)',
        fontFamily: "'Be Vietnam Pro', sans-serif"
      }}
    >
      {/* Background glowing aura circles */}
      <div
        className="position-absolute rounded-circle pointer-events-none"
        style={{
          top: '10%', left: '50%', transform: 'translateX(-50%)',
          width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, transparent 70%)',
          filter: 'blur(40px)'
        }}
      />

      {/* 3 Pixel Stage Sprite Showcase */}
      <div className="d-flex align-items-center justify-content-center gap-4 mb-3 position-relative z-1">
        <img
          src={`${base}assets/pixel_monster.png`}
          alt="Monster"
          className="pixel-art img-fluid"
          style={{ width: '56px', height: '56px', objectFit: 'contain', filter: 'drop-shadow(0 6px 12px rgba(139,92,246,0.5))' }}
        />
        <img
          src={`${base}assets/pixel_wood.png`}
          alt="Wood"
          className="pixel-art img-fluid"
          style={{ width: '64px', height: '64px', objectFit: 'contain', filter: 'drop-shadow(0 8px 16px rgba(245,158,11,0.6))', transform: 'scale(1.1)' }}
        />
        <img
          src={`${base}assets/pixel_stone.png`}
          alt="Stone"
          className="pixel-art img-fluid"
          style={{ width: '56px', height: '56px', objectFit: 'contain', filter: 'drop-shadow(0 6px 12px rgba(34,197,94,0.5))' }}
        />
      </div>

      {/* Main Login & Game Menu Card */}
      <div
        className="card glass-panel-main text-light border-0 shadow-2xl p-4 w-100 position-relative z-2"
        style={{ maxWidth: '420px', borderRadius: '24px', border: '1px solid rgba(245, 158, 11, 0.25)' }}
      >
        {/* Title Header */}
        <div className="d-flex flex-column align-items-center gap-2 pb-2 text-center">
          <div className="logo-badge" style={{ width: '52px', height: '52px', fontSize: '26px', borderRadius: '16px' }}>🎮</div>
          <div>
            <h1
              className="fw-black m-0 lh-1 text-uppercase tracking-wider"
              style={{
                fontSize: '24px',
                background: 'linear-gradient(135deg, #fde047 0%, #f59e0b 50%, #ea580c 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                dropShadow: '0 4px 15px rgba(245, 158, 11, 0.3)'
              }}
            >
              TAP TAP CLICKER
            </h1>
            <div className="badge bg-warning bg-opacity-20 text-warning border border-warning border-opacity-30 rounded-pill px-3 py-1 mt-1 font-semibold" style={{ fontSize: '9px', letterSpacing: '0.08em' }}>
              🎮 RETRO PIXEL RPG MULTIPLAYER
            </div>
          </div>
        </div>

        <hr className="border-secondary border-opacity-30 my-3" />

        {/* Hero Name Input */}
        <div className="d-flex flex-column gap-1 mb-3">
          <label className="text-warning fw-bold text-uppercase m-0 mb-1" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>
            👾 TÊN ANH HÙNG
          </label>
          <div className="input-group">
            <span className="input-group-text bg-dark bg-opacity-60 text-warning border-secondary border-opacity-50">👤</span>
            <input
              type="text"
              value={name}
              maxLength={16}
              placeholder="Nhập biệt danh của bạn..."
              onChange={e => setName(e.target.value)}
              onBlur={save}
              className="form-control bg-dark bg-opacity-60 text-light border-secondary border-opacity-50 shadow-none font-bold"
              style={{ fontSize: '13px' }}
            />
          </div>
        </div>

        {/* Primary Action Button: PLAY OFFLINE */}
        <button
          onClick={() => go(onSelectOffline)}
          disabled={!name.trim()}
          className="btn-cta-gold w-100 fw-black shadow-lg mb-3 d-flex align-items-center justify-content-center gap-2"
          style={{ fontSize: '14px', padding: '13px 0' }}
        >
          <span>▶</span> BẮT ĐẦU CHƠI OFFLINE
        </button>

        {/* Secondary Online Buttons */}
        {isOnline ? (
          <div className="row g-2 mb-3">
            <div className="col-6">
              <button
                onClick={() => go(onSelectOnlineComp)}
                disabled={!name.trim()}
                className="btn w-100 font-bold py-2.5 rounded-3 text-white border-0 shadow-sm d-flex align-items-center justify-content-center gap-1.5"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                  fontSize: '11px',
                  boxShadow: '0 4px 15px rgba(124, 58, 237, 0.3)'
                }}
              >
                <span>⚔️</span> Đấu Trường 1v1
              </button>
            </div>
            <div className="col-6">
              <button
                onClick={() => go(onSelectOnlineCoop)}
                disabled={!name.trim()}
                className="btn w-100 font-bold py-2.5 rounded-3 text-white border-0 shadow-sm d-flex align-items-center justify-content-center gap-1.5"
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  fontSize: '11px',
                  boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)'
                }}
              >
                <span>✨</span> Hợp Tác 3 Người
              </button>
            </div>
          </div>
        ) : (
          <div className="alert alert-danger bg-danger bg-opacity-20 border-danger border-opacity-40 text-danger py-2 px-3 text-center mb-3 font-semibold" style={{ fontSize: '10px' }}>
            ⚠️ Cần kết nối mạng để mở chế độ Online
          </div>
        )}

        {/* Join Room Code Section */}
        {isOnline && (
          <div className="pt-2 border-top border-secondary border-opacity-30">
            {!showJoin ? (
              <button
                onClick={() => setShowJoin(true)}
                className="btn btn-link text-warning text-decoration-none w-100 p-0 font-semibold"
                style={{ fontSize: '11px' }}
              >
                🔑 Có mã phòng? Nhập mã để gia nhập
              </button>
            ) : (
              <form onSubmit={e => { e.preventDefault(); go(() => {}); if(code.trim().length === 6) onJoinRoom(code.trim().toUpperCase()); else alert('Mã phòng phải gồm 6 ký tự!'); }} className="input-group">
                <input
                  type="text"
                  value={code}
                  maxLength={6}
                  placeholder="MÃ PHÒNG (6 KÝ TỰ)"
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  className="form-control bg-dark text-warning text-center font-black border-secondary border-opacity-50 shadow-none"
                  style={{ fontSize: '13px', letterSpacing: '0.15em' }}
                />
                <button type="submit" disabled={code.trim().length !== 6} className="btn btn-success font-black px-3">
                  VÀO
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Author Footer Badge */}
      <div className="mt-4 text-center position-relative z-2">
        <span className="badge bg-dark bg-opacity-60 border border-secondary border-opacity-40 text-secondary px-3 py-1.5 font-semibold" style={{ fontSize: '10px' }}>
          ✨ Coder: Nguyễn Hoàng Hùng (501250384) • Tap Tap Clicker RPG
        </span>
      </div>
    </div>
  );
}

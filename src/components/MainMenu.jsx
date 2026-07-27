import React, { useState } from 'react';

export default function MainMenu({ isOnline, playerName, onSaveName, onSelectOffline, onSelectOnlineComp, onSelectOnlineCoop, onJoinRoom }) {
  const [name, setName]           = useState(playerName || '');
  const [code, setCode]           = useState('');
  const [showJoin, setShowJoin]   = useState(false);

  const save = () => name.trim() && onSaveName(name.trim());
  const go   = (fn) => { const n = name.trim() || 'Người chơi 1'; onSaveName(n); fn(); };

  return (
    <div className="min-vh-100 bg-dark d-flex flex-column align-items-center justify-content-center p-3"
         style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>

      {/* Card */}
      <div className="card bg-dark text-light border border-secondary shadow-lg p-4 w-100" style={{ maxWidth: '380px', borderRadius: '20px' }}>

        {/* Logo */}
        <div className="d-flex flex-column align-items-center gap-2 pb-2">
          <div className="logo-badge" style={{ width: '56px', height: '56px', fontSize: '28px', borderRadius: '16px' }}>🎮</div>
          <div className="text-center">
            <h1 className="fw-black text-light m-0 lh-1" style={{ fontSize: '20px' }}>TAP TAP CLICKER</h1>
            <p className="text-secondary mt-1 font-semibold uppercase tracking-wider m-0" style={{ fontSize: '10px' }}>Pixel RPG • Offline & Online</p>
          </div>
        </div>

        <hr className="border-secondary my-3" />

        {/* Name input */}
        <div className="d-flex flex-col gap-1 mb-3">
          <label className="text-secondary fw-bold text-uppercase m-0 mb-1" style={{ fontSize: '10px' }}>👾 Tên anh hùng</label>
          <div className="input-group">
            <span className="input-group-text bg-dark text-warning border-secondary">👤</span>
            <input
              type="text" value={name} maxLength={16} placeholder="Nhập tên..."
              onChange={e => setName(e.target.value)} onBlur={save}
              className="form-control bg-dark text-light border-secondary shadow-none"
              style={{ fontSize: '13px' }}
            />
          </div>
        </div>

        {/* OFFLINE button */}
        <button
          onClick={() => go(onSelectOffline)} disabled={!name.trim()}
          className="btn btn-warning btn-lg w-100 fw-black shadow-sm mb-2"
          style={{ borderRadius: '14px', fontSize: '14px' }}
        >
          ▶ BẮT ĐẦU CHƠI OFFLINE
        </button>

        {/* Online buttons */}
        {isOnline ? (
          <div className="row g-2 mb-2">
            <div className="col-6">
              <button
                onClick={() => go(onSelectOnlineComp)} disabled={!name.trim()}
                className="btn btn-outline-purple border-purple text-purple-300 w-100 fw-bold py-2"
                style={{ borderRadius: '12px', fontSize: '11px' }}
              >
                ⚔️ Đấu trường 1v1
              </button>
            </div>
            <div className="col-6">
              <button
                onClick={() => go(onSelectOnlineCoop)} disabled={!name.trim()}
                className="btn btn-outline-primary w-100 fw-bold py-2"
                style={{ borderRadius: '12px', fontSize: '11px' }}
              >
                ✨ Hợp tác 3 người
              </button>
            </div>
          </div>
        ) : (
          <div className="alert alert-danger py-2 px-3 text-center mb-2" style={{ fontSize: '10px' }}>
            ⚠️ Cần kết nối mạng để chơi Online
          </div>
        )}

        {/* Join by code */}
        {isOnline && (
          <div className="pt-2 border-top border-secondary">
            {!showJoin ? (
              <button onClick={() => setShowJoin(true)} className="btn btn-link text-warning text-decoration-none w-100 p-0" style={{ fontSize: '11px' }}>
                🔑 Có mã phòng? Nhập để vào
              </button>
            ) : (
              <form onSubmit={e => { e.preventDefault(); go(() => {}); if(code.trim().length === 6) onJoinRoom(code.trim().toUpperCase()); else alert('Mã phòng 6 ký tự!'); }} className="input-group">
                <input
                  type="text" value={code} maxLength={6} placeholder="MÃ PHÒNG"
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  className="form-control bg-dark text-warning text-center fw-bold border-secondary shadow-none"
                  style={{ fontSize: '13px', letterSpacing: '0.15em' }}
                />
                <button type="submit" disabled={code.trim().length !== 6} className="btn btn-success fw-bold">
                  VÀO
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      <p className="mt-3 text-secondary font-semibold" style={{ fontSize: '10px' }}>Nguyễn Hoàng Hùng — 501250384</p>
    </div>
  );
}

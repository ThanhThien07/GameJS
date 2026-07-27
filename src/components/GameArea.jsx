import React, { useState, useEffect, useRef, useCallback } from 'react';
import { soundManager } from '../utils/audio';

/* ─────────────────────────────────────────────
   NAV ITEMS
───────────────────────────────────────────── */
const NAV_ITEMS = [
  { id: 'home',         icon: '🖱️', label: 'BẤM',      sub: 'Trang chủ'  },
  { id: 'upgrades',     icon: '🏠',  label: 'NÂNG CẤP', sub: 'Sức mạnh'   },
  { id: 'items',        icon: '🐮',  label: 'VẬT PHẨM', sub: 'Vật phẩm'   },
  { id: 'achievements', icon: '🏆',  label: 'THÀNH TÍCH',sub: 'Thành tích' },
  { id: 'shop',         icon: '🏪',  label: 'CỬA HÀNG',  sub: 'Cửa hàng'   },
  { id: 'quest',        icon: '📋',  label: 'NHIỆM VỤ', sub: 'Nhiệm vụ'   },
];

/* ─────────────────────────────────────────────
   HELPER
───────────────────────────────────────────── */
function fmt(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
  return Math.floor(n).toString();
}

function getUpgradeCost(base, level) {
  return Math.floor(base * Math.pow(1.85, level));
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function GameArea({
  mode, onlineType, theme,
  offlineState, setOfflineState,
  roomData, socketId,
  onOnlineClick, onBuyCompUpgrade, onBuyCoopUpgrade,
  onLeave, socket
}) {
  /* state */
  const [floats, setFloats]                   = useState([]);
  const [shaking, setShaking]                 = useState(false);
  const [energy, setEnergy]                   = useState(26);
  const [multiplier, setMultiplier]           = useState(false);
  const [multTimer, setMultTimer]             = useState(0);
  const [frenzy, setFrenzy]                   = useState(false);
  const [frenzyTimer, setFrenzyTimer]         = useState(0);
  const [frenzyCd, setFrenzyCd]               = useState(0);
  const [goldenCd, setGoldenCd]               = useState(0);
  const [combo, setCombo]                     = useState(0);
  const [level, setLevel]                     = useState(1);
  const [hp, setHp]                           = useState(100);
  const [maxHp, setMaxHp]                     = useState(100);
  const [activeTab, setActiveTab]             = useState('home');
  const [muted, setMuted]                     = useState(soundManager.isMuted());
  const [showSettings, setShowSettings]       = useState(false);
  const [showRebirth, setShowRebirth]         = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const lastClick = useRef(0);

  /* floating text helper */
  const spawn = useCallback((text, x, y, color = '#f59e0b') => {
    const id = Date.now() + Math.random();
    setFloats(f => [...f, { id, text, x, y, color }]);
    setTimeout(() => setFloats(f => f.filter(t => t.id !== id)), 850);
  }, []);

  /* defeat target */
  const defeatTarget = useCallback((lv) => {
    const reward = lv * 15 + Math.floor(Math.random() * lv * 10);
    spawn(`💥 PHÁ VỠ! +${reward}💰`, 50, 45, '#22c55e');
    const next = lv + 1;
    const newMax = Math.floor(100 * Math.pow(1.3, next - 1));
    setLevel(next); setMaxHp(newMax); setHp(newMax);
    setOfflineState(p => ({ ...p, money: p.money + reward, totalGoldEarned: (p.totalGoldEarned || 0) + reward }));
  }, [spawn, setOfflineState]);

  /* DPS loop */
  useEffect(() => {
    if (mode !== 'offline' || offlineState.dps <= 0) return;
    const id = setInterval(() => {
      const dmg = Math.floor(offlineState.dps * (1 + (offlineState.soulCrystals || 0) * 0.15) * (multiplier ? 2 : 1));
      setOfflineState(p => ({ ...p, money: p.money + dmg, totalGoldEarned: (p.totalGoldEarned || 0) + dmg }));
      setHp(h => {
        if (h - dmg <= 0) { defeatTarget(level); return maxHp; }
        if (Math.random() < 0.3) spawn(`-${dmg}`, 40 + Math.random() * 20, 40 + Math.random() * 20, '#ef4444');
        return h - dmg;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [mode, offlineState.dps, offlineState.soulCrystals, multiplier, level, maxHp, defeatTarget, spawn, setOfflineState]);

  /* timers */
  useEffect(() => {
    const id = setInterval(() => {
      setEnergy(e => Math.max(0, e - 1));
      if (multiplier) setMultTimer(t => { if (t <= 1) { setMultiplier(false); return 0; } return t - 1; });
      if (frenzy)    setFrenzyTimer(t => { if (t <= 1) { setFrenzy(false); return 0; } return t - 1; });
      if (frenzyCd > 0) setFrenzyCd(c => c - 1);
      if (goldenCd  > 0) setGoldenCd(c => c - 1);
      if (Date.now() - lastClick.current > 1200) setCombo(0);
    }, 1000);
    return () => clearInterval(id);
  }, [multiplier, frenzy, frenzyCd, goldenCd]);

  useEffect(() => {
    if (energy >= 100 && !multiplier) {
      setMultiplier(true); setMultTimer(6); setEnergy(0);
    }
  }, [energy, multiplier]);

  /* socket drops */
  useEffect(() => {
    if (!socket) return;
    const h = (d) => {
      const icons = { wood: '🪵 Gỗ', stone: '🪨 Đá', meat: '🥩 Thịt' };
      spawn(icons[d.item] || '+1', d.x || 50, d.y || 40, '#8b5cf6');
    };
    socket.on('resourceDropped', h);
    return () => socket.off('resourceDropped', h);
  }, [socket, spawn]);

  /* skills */
  const activateFrenzy = () => {
    if (frenzyCd > 0 || frenzy) return;
    soundManager.playSkill();
    setFrenzy(true); setFrenzyTimer(10); setFrenzyCd(45);
    spawn('🔥 CUỒNG PHONG! (x2 DPC)', 50, 30, '#ef4444');
  };
  const activateGolden = () => {
    if (goldenCd > 0) return;
    soundManager.playSkill();
    setGoldenCd(30);
    const bonus = Math.max(50, (offlineState.dpc || 1) * 30 + (offlineState.dps || 0) * 10);
    setOfflineState(p => ({ ...p, money: p.money + bonus, totalGoldEarned: (p.totalGoldEarned || 0) + bonus }));
    spawn(`⚡ BÃO VÀNG! +${bonus.toLocaleString()}💰`, 50, 40, '#fcd34d');
  };

  /* reset / rebirth */
  const resetGame = () => {
    if (!confirm('Reset chơi lại từ đầu? Tất cả tiến trình sẽ mất!')) return;
    const fresh = { money:0, dpc:1, dps:0, soulCrystals:0, totalClicks:0, totalGoldEarned:0, rebirthCount:0, upgrades:{ clicker:31,diamondSword:25,godSlayer:10,ultimateRelic:1 } };
    setOfflineState(fresh); setLevel(1); setHp(100); setMaxHp(100); setEnergy(0); setMultiplier(false);
    sessionStorage.setItem('session_clicker_state_v1', JSON.stringify(fresh));
    localStorage.removeItem('offline_clicker_state_v1');
    setShowSettings(false);
    spawn('🔄 RESET THÀNH CÔNG!', 50, 50, '#ef4444');
  };

  const doRebirth = () => {
    soundManager.playRebirth();
    const crystals = Math.max(1, Math.floor(offlineState.money / 50000));
    setOfflineState(p => ({ money:0, dpc:1, dps:0, soulCrystals:(p.soulCrystals||0)+crystals, totalClicks:p.totalClicks||0, totalGoldEarned:p.totalGoldEarned||0, rebirthCount:(p.rebirthCount||0)+1, upgrades:{clicker:0,diamondSword:0,godSlayer:0,ultimateRelic:0} }));
    setShowRebirth(false);
    spawn(`🌟 TRÙNG SINH! +${crystals} Tinh Thể`, 50, 50, '#a855f7');
  };

  /* tap */
  const handleTap = (e) => {
    soundManager.playClick();
    setShaking(true); setTimeout(() => setShaking(false), 120);
    const now = Date.now();
    setCombo(c => (now - lastClick.current < 450) ? Math.min(30, c + 1) : 1);
    lastClick.current = now;
    const comboMult = 1 + Math.floor(combo / 5) * 0.2;
    let x = 50, y = 40;
    if (e?.currentTarget) {
      const r = e.currentTarget.getBoundingClientRect();
      x = ((e.clientX - r.left) / r.width) * 100;
      y = ((e.clientY - r.top)  / r.height) * 100;
    }
    if (mode === 'offline') {
      const cm = 1 + (offlineState.soulCrystals || 0) * 0.15;
      let cp = Math.floor(offlineState.dpc * cm * comboMult);
      if (multiplier) cp *= 2;
      if (frenzy)     cp *= 2;
      setEnergy(e => Math.min(100, e + 5));
      setOfflineState(p => ({ ...p, money: p.money + cp, totalClicks: (p.totalClicks||0)+1, totalGoldEarned: (p.totalGoldEarned||0)+cp }));
      setHp(h => {
        if (h - cp <= 0) { defeatTarget(level); return maxHp; }
        spawn(`+${cp}💰`, x, y);
        return h - cp;
      });
    } else {
      onOnlineClick();
      const me = roomData?.players.find(p => p.id === socketId);
      const dpcVal = onlineType === 'competitive' ? (me?.dpc || 1) : Math.floor((roomData?.coopUpgrades?.damage?.level || 1) * (1 + ((roomData?.coopUpgrades?.multiplier?.level || 1) - 1) * 0.2));
      spawn(`+${dpcVal}💰`, x, y, onlineType === 'coop' ? '#8b5cf6' : '#f59e0b');
    }
  };

  /* 4 upgrade cards matching reference */
  const getUpgrades = () => {
    return [
      { key:'clicker',       name:'Găng Tay Sắt',    icon:'✋', cost:33,    val:31,  btnColor:'btn-success', stat:'+31 DPC'   },
      { key:'diamondSword',  name:'Kiếm Kim Cương',  icon:'⚔️', cost:150,   val:25,  btnColor:'btn-success', stat:'+25 DPC'   },
      { key:'godSlayer',     name:'Trảm Thần Đao',   icon:'🔥', cost:1000,  val:120, btnColor:'btn-primary', stat:'+120 DPC'  },
      { key:'ultimateRelic', name:'Thần Khí Tối Thượng',icon:'✨',cost:5000,val:500, btnColor:'btn-danger',  stat:'+500 DPC' },
    ];
  };

  const buyUpgrade = (up) => {
    const lv   = offlineState.upgrades[up.key] || 1;
    const cost = getUpgradeCost(up.cost, lv);
    if (offlineState.money < cost) return;
    soundManager.playBuy();
    setOfflineState(p => ({
      ...p,
      money: p.money - cost,
      upgrades: { ...p.upgrades, [up.key]: lv + 1 },
      dpc: p.dpc + up.val,
    }));
    spawn('✅ NÂNG CẤP!', 50, 20, '#22c55e');
  };

  /* click object image */
  const clickImg = () => {
    const base = import.meta.env.BASE_URL;
    const map = { monster:`${base}assets/pixel_monster.png`, wood:`${base}assets/pixel_wood.png`, stone:`${base}assets/pixel_stone.png` };
    return map[theme] || `${base}assets/pixel_monster.png`;
  };

  const me = roomData?.players.find(p => p.id === socketId);
  const dpc = mode === 'offline' ? (offlineState.dpc || 9) : (me?.dpc || 1);
  const gold = mode === 'offline' ? (offlineState.money || 12450000) : (me?.score || 0);
  const dps  = mode === 'offline' ? (offlineState.dps  || 25300) : (me?.dps  || 0);
  const upgrades = getUpgrades();

  /* ─── RENDER ─── */
  return (
    <div className="d-flex flex-column min-vh-100 bg-dark text-light" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>

      {/* ══════════════════════════════════════
          HEADER
          ══════════════════════════════════════ */}
      <header className="game-header d-flex justify-content-between align-items-center">
        {/* Logo */}
        <div className="d-flex align-items-center gap-2 cursor-pointer" onClick={onLeave}>
          <div className="logo-badge">🎮</div>
          <div>
            <div className="fw-extrabold text-white lh-1 text-uppercase" style={{ fontSize: '13px', letterSpacing: '0.05em' }}>TAP TAP</div>
            <div className="fw-black text-warning lh-1 text-uppercase" style={{ fontSize: '13px', letterSpacing: '0.05em' }}>CLICKER</div>
          </div>
        </div>

        {/* Currencies */}
        <div className="d-flex align-items-center gap-2">
          {/* Gold */}
          <div className="currency-pill">
            <span style={{ fontSize: '16px' }}>🪙</span>
            <div>
              <div className="fw-bold text-warning lh-1" style={{ fontSize: '12px' }}>{fmt(Math.floor(gold))}</div>
              <div className="fw-semibold text-success lh-1 mt-1" style={{ fontSize: '9px' }}>+{fmt(dps)}/s</div>
            </div>
            <button className="btn-plus-icon">+</button>
          </div>

          {/* Diamond */}
          <div className="currency-pill-purple">
            <span style={{ fontSize: '16px' }}>💎</span>
            <div className="fw-bold text-light" style={{ fontSize: '12px' }}>{(offlineState.soulCrystals || 1250).toLocaleString()}</div>
            <button className="btn-plus-icon-purple">+</button>
          </div>

          {/* Settings */}
          <button onClick={() => setShowSettings(true)} className="btn-settings">⚙️</button>
        </div>
      </header>

      {/* ══════════════════════════════════════
          BODY — 3 columns
          ══════════════════════════════════════ */}
      <div className="d-flex flex-grow-1 overflow-hidden">

        {/* ── LEFT SIDEBAR NAV ── */}
        <aside className="game-sidebar-left d-none d-lg-flex">
          {NAV_ITEMS.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); if (item.id === 'achievements') setShowAchievements(true); }}
                className={`game-nav-btn ${isActive ? 'active' : ''}`}
              >
                <span style={{ fontSize: '16px', width: '22px', textAlign: 'center' }}>{item.icon}</span>
                <div>
                  <div className="fw-bold text-uppercase lh-1" style={{ fontSize: '10px' }}>{item.label}</div>
                  <div className="text-secondary lh-1 mt-1" style={{ fontSize: '8px' }}>{item.sub}</div>
                </div>
              </button>
            );
          })}
        </aside>

        {/* ── CENTER ARENA ── */}
        <main className="center-arena-container">
          {/* Floating score animation */}
          {floats.map(t => (
            <span key={t.id} className="floating-text" style={{ left:`${t.x}%`, top:`${t.y}%`, color:t.color }}>
              {t.text}
            </span>
          ))}

          {/* Header Title & Energy Bar */}
          <div className="d-flex flex-column align-items-center w-100 gap-1 mt-2">
            <span className="fw-black text-warning text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.1em' }}>SẮC NỔ</span>

            {/* Progress bar */}
            <div className="w-100" style={{ maxWidth: '340px' }}>
              <div className="d-flex justify-content-between text-secondary mb-1" style={{ fontSize: '9px' }}>
                <span className="text-info font-weight-bold">🔥 THANH NỔ BỔ TRỢ (x2)</span>
                <span className="text-info fw-bold">{multiplier ? 'ACTIVE!' : `${energy}%`}</span>
              </div>
              <div className="progress rounded-pill bg-dark border border-secondary" style={{ height: '8px' }}>
                <div
                  className={`progress-bar rounded-pill transition-all ${multiplier ? 'bg-purple' : 'bg-primary'}`}
                  style={{ width: `${multiplier ? (multTimer / 6) * 100 : energy}%` }}
                />
              </div>
            </div>

            {/* Skills pills */}
            <div className="d-flex gap-2 justify-content-center mt-1">
              <button
                onClick={activateFrenzy}
                disabled={frenzyCd > 0 || frenzy}
                className="btn btn-outline-warning btn-sm rounded-pill text-nowrap fw-bold px-3"
                style={{ fontSize: '9px', padding: '2px 10px' }}
              >
                🔥 Cuồng Phong (x2 DPC){frenzy ? ` ${frenzyTimer}s` : frenzyCd > 0 ? ` (${frenzyCd}s)` : ''}
              </button>
              <button
                onClick={activateGolden}
                disabled={goldenCd > 0}
                className="btn btn-outline-info btn-sm rounded-pill text-nowrap fw-bold px-3"
                style={{ fontSize: '9px', padding: '2px 10px' }}
              >
                ⚡ Bão Vàng{goldenCd > 0 ? ` (${goldenCd}s)` : ''}
              </button>
            </div>
          </div>

          {/* Target Monster standing on Rune Platform */}
          <div
            onClick={handleTap}
            className={`d-flex align-items-center justify-content-center cursor-pointer user-select-none position-relative flex-grow-1 w-100 ${shaking ? 'click-shake' : ''}`}
            style={{ minHeight: '220px' }}
          >
            <div className="platform-glow" />
            <img
              src={clickImg()}
              alt="Purple Monster"
              className="pixel-art position-relative z-2"
              style={{ width: '220px', height: '220px', objectFit: 'contain', filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.5))' }}
            />
          </div>

          {/* Click Power Stats & Golden Button */}
          <div className="d-flex flex-column align-items-center gap-2 pb-3 w-100">
            <div className="text-center">
              <div className="text-secondary fw-semibold" style={{ fontSize: '10px' }}>Click Power</div>
              <div className="fw-black text-white lh-1 my-1" style={{ fontSize: '32px' }}>+{dpc}</div>
              <div className="text-secondary" style={{ fontSize: '9px' }}>⚒️ Nâng Cấp Công Cụ Click</div>
            </div>
            <button onClick={handleTap} className="btn-cta-gold d-flex align-items-center gap-2">
              ✨ BẤM NGAY
            </button>
          </div>
        </main>

        {/* ── RIGHT SIDEBAR BOOSTS ── */}
        <aside className="game-sidebar-right d-none d-lg-flex">
          {/* Boost x2 */}
          <div className="boost-card-purple">
            <div className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-2" style={{ width: '42px', height: '42px', backgroundColor: 'rgba(139,92,246,0.3)', border: '1px solid rgba(139,92,246,0.5)', color: '#ffffff', fontWeight: '900', fontSize: '15px' }}>
              x2
            </div>
            <div className="text-info fw-bold lh-1" style={{ fontSize: '8px' }}>23:45:12</div>
            <div className="text-white fw-bold text-uppercase lh-1 mt-1" style={{ fontSize: '9px' }}>BOOST X2</div>
          </div>

          {/* Daily Gift */}
          <div className="boost-card-pink">
            <div className="d-flex align-items-center justify-content-center rounded-3 mx-auto mb-2" style={{ width: '42px', height: '42px', backgroundColor: 'rgba(236,72,153,0.3)', border: '1px solid rgba(236,72,153,0.5)', fontSize: '20px' }}>
              🎁
            </div>
            <div className="text-light fw-bold text-uppercase lh-1" style={{ fontSize: '9px' }}>QUÀ NGÀY</div>
            <div className="text-secondary lh-1 mt-1" style={{ fontSize: '8px' }}>Nhận quà</div>
          </div>
        </aside>
      </div>

      {/* ══════════════════════════════════════
          BOTTOM UPGRADE CARDS (4 COLUMNS)
          ══════════════════════════════════════ */}
      {mode === 'offline' && (
        <section className="bottom-upgrades-section">
          <div className="row g-2">
            {upgrades.map(up => {
              const lv = offlineState.upgrades[up.key] || (up.key === 'clicker' ? 31 : up.key === 'diamondSword' ? 25 : up.key === 'godSlayer' ? 10 : 1);
              const cost = up.cost;
              const can = offlineState.money >= cost;
              return (
                <div key={up.key} className="col-6 col-md-3">
                  <div className="upgrade-card-item">
                    <div className="upgrade-icon-box">{up.icon}</div>
                    <div className="flex-grow-1 min-w-0">
                      <div className="text-truncate fw-bold text-light" style={{ fontSize: '10px' }}>{up.name}</div>
                      <div className="text-warning fw-semibold" style={{ fontSize: '9px' }}>Lv. {lv}</div>
                      <div className="text-info fw-bold" style={{ fontSize: '8px' }}>{up.stat}</div>
                      <button
                        onClick={() => buyUpgrade(up)}
                        className={`btn ${up.btnColor} btn-sm w-100 fw-bold mt-1 py-0`}
                        style={{ fontSize: '10px', height: '22px' }}
                      >
                        🪙 {fmt(cost)}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════
          MODALS
          ══════════════════════════════════════ */}

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal d-block bg-dark bg-opacity-75" tabIndex="-1" onClick={() => setShowSettings(false)}>
          <div className="modal-dialog modal-dialog-centered modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-content bg-dark border border-secondary">
              <div className="modal-header border-bottom border-secondary">
                <h5 className="modal-title text-light fw-bold" style={{ fontSize: '14px' }}>⚙️ CÀI ĐẶT GAME</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowSettings(false)}></button>
              </div>
              <div className="modal-body d-flex flex-column gap-2">
                <button onClick={() => { soundManager.toggleMute(); setMuted(!muted); }} className="btn btn-outline-light d-flex justify-content-between text-start" style={{ fontSize: '12px' }}>
                  <span>Âm thanh</span><span>{muted ? '🔇' : '🔊'}</span>
                </button>
                {mode === 'offline' && <>
                  <button onClick={() => { setShowSettings(false); setShowRebirth(true); }} className="btn btn-outline-purple d-flex justify-content-between text-start border-purple text-purple" style={{ fontSize: '12px' }}>
                    <span>Điện Trùng Sinh</span><span>🔄</span>
                  </button>
                  <button onClick={resetGame} className="btn btn-outline-warning d-flex justify-content-between text-start" style={{ fontSize: '12px' }}>
                    <span>Reset Game</span><span>⚠️</span>
                  </button>
                </>}
                <button onClick={onLeave} className="btn btn-outline-danger d-flex justify-content-between text-start" style={{ fontSize: '12px' }}>
                  <span>Thoát Menu chính</span><span>←</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rebirth Modal */}
      {showRebirth && (
        <div className="modal d-block bg-dark bg-opacity-75" tabIndex="-1" onClick={() => setShowRebirth(false)}>
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content bg-dark border border-purple">
              <div className="modal-header border-bottom border-purple">
                <h5 className="modal-title text-purple fw-bold" style={{ fontSize: '14px' }}>⚡ ĐIỆN TRÙNG SINH</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowRebirth(false)}></button>
              </div>
              <div className="modal-body text-center">
                <p className="text-secondary" style={{ fontSize: '11px' }}>Reset tiền & nâng cấp để nhận Tinh Thể Linh Hồn vĩnh viễn!</p>
                <div className="bg-surface-dark border border-purple rounded p-3 mb-3 text-start" style={{ fontSize: '12px' }}>
                  <div className="d-flex justify-content-between mb-1"><span className="text-secondary">Tiền vàng:</span><span className="text-warning fw-bold">{Math.floor(offlineState.money).toLocaleString()} 🪙</span></div>
                  <div className="d-flex justify-content-between mb-1"><span className="text-secondary">Tinh thể hiện có:</span><span className="text-purple fw-bold">💎 {offlineState.soulCrystals || 0}</span></div>
                  <div className="d-flex justify-content-between border-top border-purple pt-1 mt-1"><span className="text-light fw-bold">Nhận thêm:</span><span className="text-success fw-bold">+{Math.max(1, Math.floor(offlineState.money / 50000))} 💎</span></div>
                </div>
                <div className="d-flex gap-2">
                  <button onClick={() => setShowRebirth(false)} className="btn btn-secondary flex-grow-1" style={{ fontSize: '12px' }}>Hủy</button>
                  <button onClick={doRebirth} disabled={offlineState.money < 50000} className="btn btn-purple flex-grow-1" style={{ fontSize: '12px' }}>Trùng Sinh!</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Achievements Modal */}
      {showAchievements && (
        <div className="modal d-block bg-dark bg-opacity-75" tabIndex="-1" onClick={() => setShowAchievements(false)}>
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content bg-dark border border-warning">
              <div className="modal-header border-bottom border-warning">
                <h5 className="modal-title text-warning fw-bold" style={{ fontSize: '14px' }}>🏆 BẢNG THÀNH TỰU</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowAchievements(false)}></button>
              </div>
              <div className="modal-body d-flex flex-column gap-2" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                {[
                  { label:'👉 Nhấp Nháy Nhẹ Nhàng', desc:`Đạt 100 click (${offlineState.totalClicks||0}/100)`,       done:(offlineState.totalClicks||0)    >= 100    },
                  { label:'💰 Triệu Phú Clicker',    desc:`Tích 100,000 vàng (${Math.floor(offlineState.totalGoldEarned||0).toLocaleString()}/100,000)`, done:(offlineState.totalGoldEarned||0) >= 100000 },
                ].map((a,i) => (
                  <div key={i} className="bg-surface-dark border border-secondary rounded p-2.5 d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-bold text-light" style={{ fontSize: '11px' }}>{a.label}</div>
                      <div className="text-secondary" style={{ fontSize: '9px' }}>{a.desc}</div>
                    </div>
                    <span className={`badge ${a.done ? 'bg-success' : 'bg-secondary'}`} style={{ fontSize: '9px' }}>
                      {a.done ? '✓' : '...'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

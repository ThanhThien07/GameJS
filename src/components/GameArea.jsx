import React, { useState, useEffect, useRef, useCallback } from 'react';
import { soundManager } from '../utils/audio';

/* ─────────────────────────────────────────────
   NAV ITEMS
───────────────────────────────────────────── */
const NAV_ITEMS = [
  { id: 'home',         icon: '🖱',  label: 'BẤM',      sub: 'Trang chủ'  },
  { id: 'upgrades',     icon: '⚔',   label: 'NÂNG CẤP', sub: 'Sức mạnh'   },
  { id: 'items',        icon: '🎒',  label: 'ĐỒ VẬT',   sub: 'Vật phẩm'   },
  { id: 'achievements', icon: '🏆',  label: 'THÀNH TÍCH',sub: 'Thành tích' },
  { id: 'shop',         icon: '🛒',  label: 'CỬA HÀNG',  sub: 'Mua bán'    },
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
  const [energy, setEnergy]                   = useState(30);
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
      setEnergy(e => Math.max(0, e - 2));
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
    const fresh = { money:0, dpc:1, dps:0, soulCrystals:0, totalClicks:0, totalGoldEarned:0, rebirthCount:0, upgrades:{ clicker:0,battleAxe:0,diamondSword:0,pickaxe:0,minecart:0,drill:0,excavator:0,miningRig:0 } };
    setOfflineState(fresh); setLevel(1); setHp(100); setMaxHp(100); setEnergy(0); setMultiplier(false);
    sessionStorage.setItem('session_clicker_state_v1', JSON.stringify(fresh));
    localStorage.removeItem('offline_clicker_state_v1');
    setShowSettings(false);
    spawn('🔄 RESET THÀNH CÔNG!', 50, 50, '#ef4444');
  };
  const doRebirth = () => {
    soundManager.playRebirth();
    const crystals = Math.max(1, Math.floor(offlineState.money / 50000));
    setOfflineState(p => ({ money:0, dpc:1, dps:0, soulCrystals:(p.soulCrystals||0)+crystals, totalClicks:p.totalClicks||0, totalGoldEarned:p.totalGoldEarned||0, rebirthCount:(p.rebirthCount||0)+1, upgrades:{clicker:0,battleAxe:0,diamondSword:0,pickaxe:0,minecart:0,drill:0,excavator:0,miningRig:0} }));
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
      setEnergy(e => Math.min(100, e + 6));
      setOfflineState(p => ({ ...p, money: p.money + cp, totalClicks: (p.totalClicks||0)+1, totalGoldEarned: (p.totalGoldEarned||0)+cp }));
      setHp(h => {
        if (h - cp <= 0) { defeatTarget(level); return maxHp; }
        spawn(`+${cp}💰`, x, y);
        return h - cp;
      });
    } else {
      onOnlineClick();
      const me = roomData?.players.find(p => p.id === socketId);
      const dpc = onlineType === 'competitive' ? (me?.dpc || 1) : Math.floor((roomData?.coopUpgrades?.damage?.level || 1) * (1 + ((roomData?.coopUpgrades?.multiplier?.level || 1) - 1) * 0.2));
      spawn(`+${dpc}💰`, x, y, onlineType === 'coop' ? '#8b5cf6' : '#f59e0b');
    }
  };

  /* upgrades */
  const getUpgrades = () => {
    const tools = {
      monster: [
        { key:'clicker',       name:'Găng Tay Sắt',    icon:'🥊', cost:20,    val:1,   isDpc:true,  stat:'+1 DPC'   },
        { key:'diamondSword',  name:'Kiếm Kim Cương',  icon:'⚔',  cost:450,   val:6,   isDpc:true,  stat:'+6 DPC'   },
        { key:'godSlayer',     name:'Trảm Thần Đao',   icon:'🔥', cost:4500,  val:35,  isDpc:true,  stat:'+35 DPC'  },
        { key:'ultimateRelic', name:'Thần Khí Tối Thượng',icon:'✨',cost:45000,val:200,isDpc:true,  stat:'+200 DPC' },
        { key:'apprenticeHero',name:'Dũng Sĩ Tập Sự',  icon:'🗡', cost:75,    val:1,   isDpc:false, stat:'+1/s'     },
        { key:'paladinWorker', name:'Hiệp Sĩ Thánh Điện',icon:'🛡',cost:1200, val:12,  isDpc:false, stat:'+12/s'    },
        { key:'mageWorker',    name:'Phù Thủy Ma Pháp',icon:'🧙', cost:15000, val:90,  isDpc:false, stat:'+90/s'    },
        { key:'ancientDragon', name:'Rồng Thần Cổ Đại',icon:'🐉', cost:150000,val:600, isDpc:false, stat:'+600/s'   },
      ],
      wood: [
        { key:'battleAxe',     name:'Rìu Chặt Củi',    icon:'🪓', cost:20,    val:1,   isDpc:true,  stat:'+1 DPC'   },
        { key:'crystalAxe',    name:'Rìu Thạch Anh',   icon:'💎', cost:450,   val:6,   isDpc:true,  stat:'+6 DPC'   },
        { key:'mythicSaw',     name:'Cưa Cổ Thụ',      icon:'🌲', cost:4500,  val:35,  isDpc:true,  stat:'+35 DPC'  },
        { key:'godChainsaw',   name:'Máy Cưa Thần',    icon:'⚡', cost:45000, val:200, isDpc:true,  stat:'+200 DPC' },
        { key:'lumberjack',    name:'Tiều Phu Tập Sự',  icon:'👷', cost:75,    val:1,   isDpc:false, stat:'+1/s'     },
        { key:'logCart',       name:'Xe Kéo Gỗ',       icon:'🚂', cost:1200,  val:12,  isDpc:false, stat:'+12/s'    },
        { key:'autoChainsaw',  name:'Máy Cưa Tự Động', icon:'🔩', cost:15000, val:90,  isDpc:false, stat:'+90/s'    },
        { key:'lumberYard',    name:'Lâm Trường Siêu Cấp',icon:'🏭',cost:150000,val:600,isDpc:false,stat:'+600/s'  },
      ],
      stone: [
        { key:'stonePickaxe',  name:'Cuốc Đá Cổ',      icon:'⛏', cost:20,    val:1,   isDpc:true,  stat:'+1 DPC'   },
        { key:'diamondPickaxe',name:'Cuốc Kim Cương',   icon:'💎', cost:450,   val:6,   isDpc:true,  stat:'+6 DPC'   },
        { key:'laserHammer',   name:'Búa Laze',         icon:'🔫', cost:4500,  val:35,  isDpc:true,  stat:'+35 DPC'  },
        { key:'atomicSmasher', name:'Đập Hạt Nhân',    icon:'💥', cost:45000, val:200, isDpc:true,  stat:'+200 DPC' },
        { key:'pickaxe',       name:'Steve Thợ Mỏ',     icon:'👷', cost:75,    val:1,   isDpc:false, stat:'+1/s'     },
        { key:'minecart',      name:'Xe Goòng Mỏ',     icon:'🚂', cost:1200,  val:12,  isDpc:false, stat:'+12/s'    },
        { key:'drill',         name:'Máy Khoan Laze',   icon:'🔧', cost:15000, val:90,  isDpc:false, stat:'+90/s'    },
        { key:'excavator',     name:'Giàn Khoan Siêu Cấp',icon:'🏗',cost:150000,val:600,isDpc:false,stat:'+600/s'  },
      ],
    };
    return tools[theme] || tools.monster;
  };

  const buyUpgrade = (up) => {
    const lv   = offlineState.upgrades[up.key] || 0;
    const cost = getUpgradeCost(up.cost, lv);
    if (offlineState.money < cost) return;
    soundManager.playBuy();
    setOfflineState(p => ({
      ...p,
      money: p.money - cost,
      upgrades: { ...p.upgrades, [up.key]: lv + 1 },
      dpc: up.isDpc  ? p.dpc + up.val : p.dpc,
      dps: !up.isDpc ? p.dps + up.val : p.dps,
    }));
    spawn('✅ NÂNG CẤP!', 50, 20, '#22c55e');
  };

  /* click object image */
  const clickImg = () => {
    const base = import.meta.env.BASE_URL;
    const map = { monster:`${base}assets/pixel_monster.png`, wood:`${base}assets/pixel_wood.png`, stone:`${base}assets/pixel_stone.png` };
    return map[theme] || `${base}assets/cartoon_capybara.png`;
  };

  const me = roomData?.players.find(p => p.id === socketId);
  const dpc = mode === 'offline' ? offlineState.dpc : (me?.dpc || 1);
  const gold = mode === 'offline' ? offlineState.money : (me?.score || 0);
  const dps  = mode === 'offline' ? offlineState.dps  : (me?.dps  || 0);
  const upgrades = getUpgrades();

  /* ─── RENDER ─── */
  return (
    <div className="flex flex-col min-h-screen bg-[#0d1117]" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>

      {/* ══════════════════════════════════════
          HEADER
          ══════════════════════════════════════ */}
      <header className="flex items-center justify-between px-4 py-2.5 bg-[#161b22] border-b border-white/5 sticky top-0 z-30">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={onLeave}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-sm shadow">🎮</div>
          <div>
            <div className="text-xs font-black text-white leading-none">TAP TAP</div>
            <div className="text-xs font-black text-amber-400 leading-none">CLICKER</div>
          </div>
        </div>

        {/* Currencies */}
        <div className="flex items-center gap-2">
          {/* Gold */}
          <div className="flex items-center gap-1.5 bg-[#1c2333] rounded-xl px-3 py-1.5 border border-amber-500/30">
            <span className="text-amber-400 text-sm">🪙</span>
            <div>
              <div className="text-xs font-bold text-amber-300 leading-none">{fmt(Math.floor(gold))}</div>
              <div className="text-[9px] text-amber-600 leading-none">+{fmt(dps)}/s</div>
            </div>
            <button className="ml-1 w-4 h-4 rounded-full bg-amber-500 text-black text-[9px] font-black flex items-center justify-center">+</button>
          </div>

          {/* Diamond */}
          <div className="flex items-center gap-1.5 bg-[#1c2333] rounded-xl px-3 py-1.5 border border-purple-500/30">
            <span className="text-purple-400 text-sm">💎</span>
            <div className="text-xs font-bold text-purple-300">{(offlineState.soulCrystals || 1250).toLocaleString()}</div>
            <button className="ml-1 w-4 h-4 rounded-full bg-purple-500 text-white text-[9px] font-black flex items-center justify-center">+</button>
          </div>

          {/* Settings */}
          <button onClick={() => setShowSettings(true)} className="w-8 h-8 rounded-lg bg-[#1c2333] border border-white/10 text-slate-400 hover:text-white flex items-center justify-center text-sm transition-colors">⚙️</button>
        </div>
      </header>

      {/* ══════════════════════════════════════
          BODY — 3 columns
          ══════════════════════════════════════ */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT NAV ── */}
        <aside className="hidden lg:flex flex-col w-[140px] shrink-0 bg-[#161b22] border-r border-white/5 py-2 gap-0.5 px-2">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); if (item.id === 'achievements') setShowAchievements(true); }}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition-all ${
                activeTab === item.id
                  ? 'bg-blue-600/20 border border-blue-500/30 text-white'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
              }`}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              <div>
                <div className="text-[9px] font-bold uppercase leading-none">{item.label}</div>
                <div className="text-[8px] text-slate-500 leading-none mt-0.5">{item.sub}</div>
              </div>
            </button>
          ))}
        </aside>

        {/* ── CENTER ARENA ── */}
        <main
          className="flex-1 flex flex-col min-w-0 relative overflow-hidden"
          style={{ background: 'radial-gradient(ellipse at 50% 70%, rgba(99,102,241,0.08) 0%, transparent 65%)' }}
        >
          {/* Floating texts */}
          {floats.map(t => (
            <span key={t.id} className="floating-text" style={{ left:`${t.x}%`, top:`${t.y}%`, color:t.color }}>
              {t.text}
            </span>
          ))}

          {/* SẮC NỔ badge + energy bar */}
          <div className="flex flex-col items-center pt-3 px-6 gap-1.5">
            <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest">⚡ SẮC NỔ</span>

            {/* Energy bar */}
            <div className="w-full max-w-sm">
              <div className="flex justify-between text-[9px] mb-1">
                <span className="text-blue-400 font-semibold">🔥 THANH NỔ BỔ TRỢ (x2)</span>
                <span className="text-blue-300 font-bold">{multiplier ? 'ACTIVE!' : `${energy}%`}</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-[#1c2333] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${multiplier ? 'bg-purple-500 animate-pulse' : 'bg-gradient-to-r from-blue-500 to-blue-400'}`}
                  style={{ width: `${multiplier ? (multTimer / 6) * 100 : energy}%` }}
                />
              </div>
            </div>

            {/* Skill buttons */}
            <div className="flex gap-2 flex-wrap justify-center">
              <button
                onClick={activateFrenzy}
                disabled={frenzyCd > 0 || frenzy}
                className={`text-[9px] font-bold px-3 py-1 rounded-full border transition-all ${
                  frenzy      ? 'bg-red-600/30 border-red-500 text-red-300 animate-pulse'
                  : frenzyCd  ? 'bg-[#1c2333] border-white/10 text-slate-500 cursor-not-allowed'
                              : 'bg-[#1c2333] border-orange-500/40 text-orange-400 hover:border-orange-400'}`}
              >
                🔥 Cuồng Phong (x2 DPC){frenzy ? ` ${frenzyTimer}s` : frenzyCd > 0 ? ` (${frenzyCd}s)` : ''}
              </button>
              <button
                onClick={activateGolden}
                disabled={goldenCd > 0}
                className={`text-[9px] font-bold px-3 py-1 rounded-full border transition-all ${
                  goldenCd ? 'bg-[#1c2333] border-white/10 text-slate-500 cursor-not-allowed'
                           : 'bg-[#1c2333] border-amber-500/40 text-amber-400 hover:border-amber-400'}`}
              >
                ⚡ Bão Vàng{goldenCd > 0 ? ` (${goldenCd}s)` : ''}
              </button>
            </div>
          </div>

          {/* HP bar of target */}
          <div className="px-6 mt-1.5">
            <div className="w-full max-w-sm mx-auto">
              <div className="flex justify-between text-[8px] text-slate-400 mb-0.5">
                <span>Level {level}</span>
                <span>{Math.floor(hp)} / {maxHp}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#1c2333] overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-200" style={{ width:`${(hp / maxHp) * 100}%` }} />
              </div>
            </div>
          </div>

          {/* Monster — clickable */}
          <div
            onClick={handleTap}
            className={`flex-1 flex items-center justify-center cursor-pointer select-none relative ${shaking ? 'click-shake' : ''}`}
            style={{ minHeight: 200 }}
          >
            <div className="platform-glow" />
            <img
              src={clickImg()}
              alt="click target"
              className="w-44 h-44 md:w-56 md:h-56 object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-100 relative z-10 pixel-art"
            />
          </div>

          {/* Click power + BẤM NGAY */}
          <div className="flex flex-col items-center gap-3 pb-5 px-4">
            <div className="text-center">
              <div className="text-[10px] text-slate-400 font-semibold">Click Power</div>
              <div className="text-3xl font-black text-white leading-none">+{dpc}</div>
              <div className="text-[10px] text-slate-500">⚒ Nâng Cấp Công Cụ Click</div>
            </div>
            <button
              onClick={handleTap}
              className="bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-gray-900 font-black text-sm px-12 py-3.5 rounded-2xl shadow-lg shadow-amber-500/25 active:scale-95 transition-all flex items-center gap-2"
            >
              🖱 BẤM NGAY
            </button>
          </div>
        </main>

        {/* ── RIGHT SIDEBAR ── */}
        <aside className="hidden lg:flex flex-col w-[100px] shrink-0 bg-[#161b22] border-l border-white/5 py-3 px-2 gap-3">
          {/* Boost x2 */}
          <div className="bg-gradient-to-b from-purple-900/50 to-indigo-900/50 border border-purple-500/30 rounded-2xl p-2 flex flex-col items-center text-center">
            <div className="w-11 h-11 rounded-xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center font-black text-white text-base mb-1.5">x2</div>
            <div className="text-[8px] text-purple-300 font-semibold leading-none">23:45:12</div>
            <div className="text-[9px] text-white font-bold uppercase leading-none mt-0.5">BOOST X2</div>
          </div>

          {/* Daily gift */}
          <div className="bg-gradient-to-b from-pink-900/50 to-rose-900/50 border border-pink-500/30 rounded-2xl p-2 flex flex-col items-center text-center cursor-pointer hover:border-pink-400/50 transition-colors">
            <div className="w-11 h-11 rounded-xl bg-pink-600/30 border border-pink-400/40 flex items-center justify-center text-xl mb-1.5">🎁</div>
            <div className="text-[9px] text-pink-300 font-bold uppercase leading-none">QUÀ NGÀY</div>
            <div className="text-[8px] text-slate-400 leading-none mt-0.5">Nhận quà</div>
          </div>
        </aside>
      </div>

      {/* ══════════════════════════════════════
          BOTTOM UPGRADE CARDS
          ══════════════════════════════════════ */}
      {mode === 'offline' && (
        <section className="bg-[#161b22] border-t border-white/5 px-3 py-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {upgrades.map(up => {
              const lv = offlineState.upgrades[up.key] || 0;
              const cost = getUpgradeCost(up.cost, lv);
              const can = offlineState.money >= cost;
              return (
                <button
                  key={up.key}
                  onClick={() => buyUpgrade(up)}
                  disabled={!can}
                  className={`flex items-center gap-2.5 bg-[#1c2333] rounded-xl p-2.5 text-left border transition-all ${
                    can ? 'border-white/8 hover:border-amber-500/40 hover:bg-[#222d3d]' : 'border-white/5 opacity-60 cursor-not-allowed'}`}
                >
                  <div className="w-10 h-10 rounded-lg bg-[#0d1117] flex items-center justify-center text-xl shrink-0">{up.icon}</div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[9px] text-slate-400 font-semibold truncate">{up.name}</div>
                    <div className="text-[8px] text-slate-500">Lv. {lv}</div>
                    <div className="text-[9px] font-bold text-blue-400">{up.stat}</div>
                    <div className={`text-[9px] font-bold mt-0.5 flex items-center gap-0.5 ${can ? 'text-amber-400' : 'text-slate-500'}`}>
                      🪙 {fmt(cost)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════
          MODALS
          ══════════════════════════════════════ */}

      {/* Settings */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowSettings(false)}>
          <div className="bg-[#1c2333] border border-white/10 rounded-2xl w-full max-w-xs p-5 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-black text-white mb-4 text-center">⚙️ CÀI ĐẶT GAME</h3>
            <div className="flex flex-col gap-2 mb-4">
              <button onClick={() => { soundManager.toggleMute(); setMuted(!muted); }} className="flex justify-between items-center bg-[#161b22] hover:bg-[#1a2132] border border-white/8 rounded-xl p-3 text-xs font-semibold text-white">
                <span>Âm thanh</span><span>{muted ? '🔇' : '🔊'}</span>
              </button>
              {mode === 'offline' && <>
                <button onClick={() => { setShowSettings(false); setShowRebirth(true); }} className="flex justify-between items-center bg-purple-900/30 hover:bg-purple-900/50 border border-purple-500/30 rounded-xl p-3 text-xs font-semibold text-purple-300">
                  <span>Điện Trùng Sinh</span><span>🔄</span>
                </button>
                <button onClick={resetGame} className="flex justify-between items-center bg-amber-900/30 hover:bg-amber-900/50 border border-amber-500/30 rounded-xl p-3 text-xs font-semibold text-amber-300">
                  <span>Reset Game</span><span>⚠️</span>
                </button>
              </>}
              <button onClick={onLeave} className="flex justify-between items-center bg-red-900/30 hover:bg-red-900/50 border border-red-500/30 rounded-xl p-3 text-xs font-semibold text-red-300">
                <span>Thoát Menu chính</span><span>←</span>
              </button>
            </div>
            <button onClick={() => setShowSettings(false)} className="w-full bg-[#161b22] border border-white/8 rounded-xl py-2 text-xs font-semibold text-slate-400">Đóng</button>
          </div>
        </div>
      )}

      {/* Rebirth */}
      {showRebirth && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowRebirth(false)}>
          <div className="bg-[#1c2333] border border-purple-500/30 rounded-2xl w-full max-w-sm p-5 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-black text-purple-300 mb-2 text-center">⚡ ĐIỆN TRÙNG SINH</h3>
            <p className="text-[10px] text-slate-400 text-center mb-4">Reset tiền & nâng cấp để nhận Tinh Thể Linh Hồn vĩnh viễn!</p>
            <div className="bg-[#161b22] border border-purple-500/20 rounded-xl p-3 mb-4 flex flex-col gap-1.5 text-xs">
              <div className="flex justify-between"><span className="text-slate-400">Tiền vàng:</span><span className="text-amber-400 font-bold">{Math.floor(offlineState.money).toLocaleString()} 🪙</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Tinh thể hiện có:</span><span className="text-purple-400 font-bold">💎 {offlineState.soulCrystals || 0}</span></div>
              <div className="flex justify-between border-t border-purple-800/50 pt-1.5"><span className="text-purple-200 font-bold">Nhận thêm:</span><span className="text-green-400 font-bold">+{Math.max(1, Math.floor(offlineState.money / 50000))} 💎</span></div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowRebirth(false)} className="flex-1 bg-[#161b22] border border-white/8 rounded-xl py-2.5 text-xs font-bold text-slate-400">Hủy</button>
              <button onClick={doRebirth} disabled={offlineState.money < 50000} className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 border border-purple-400 rounded-xl py-2.5 text-xs font-bold text-white">Trùng Sinh!</button>
            </div>
          </div>
        </div>
      )}

      {/* Achievements */}
      {showAchievements && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowAchievements(false)}>
          <div className="bg-[#1c2333] border border-amber-500/30 rounded-2xl w-full max-w-md p-5 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 border-b border-white/8 pb-3">
              <h3 className="text-sm font-black text-amber-300">🏆 BẢNG THÀNH TỰU</h3>
              <button onClick={() => setShowAchievements(false)} className="text-slate-400 hover:text-white text-xs">✕</button>
            </div>
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
              {[
                { label:'👉 Nhấp Nháy Nhẹ Nhàng', desc:`Đạt 100 click (${offlineState.totalClicks||0}/100)`,       done:(offlineState.totalClicks||0)    >= 100    },
                { label:'💰 Triệu Phú Clicker',    desc:`Tích 100,000 vàng (${Math.floor(offlineState.totalGoldEarned||0).toLocaleString()}/100,000)`, done:(offlineState.totalGoldEarned||0) >= 100000 },
              ].map((a,i) => (
                <div key={i} className="bg-[#161b22] border border-white/5 rounded-xl p-3 flex justify-between items-center">
                  <div>
                    <div className="text-xs font-bold text-slate-200">{a.label}</div>
                    <div className="text-[9px] text-slate-400">{a.desc}</div>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${a.done ? 'bg-green-900/60 border border-green-700 text-green-300' : 'text-slate-500'}`}>
                    {a.done ? '✓' : '...'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

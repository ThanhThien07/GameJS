import React, { useState, useEffect, useRef, useCallback } from 'react';
import { soundManager } from '../utils/audio';

/* ─────────────────────────────────────────────
   NAV ITEMS
───────────────────────────────────────────── */
const NAV_ITEMS = [
  { id: 'home',         icon: '🖱️', label: 'BẤM',      sub: 'Trang chủ'  },
  { id: 'upgrades',     icon: '🏠',  label: 'NÂNG CẤP', sub: 'Sức mạnh'   },
  { id: 'items',        icon: '🎒',  label: 'VẬT PHẨM', sub: 'Vật phẩm'   },
  { id: 'achievements', icon: '🏆',  label: 'THÀNH TÍCH',sub: 'Thành tích' },
  { id: 'shop',         icon: '🏪',  label: 'CỬA HÀNG',  sub: 'Cửa hàng'   },
  { id: 'quest',        icon: '📋',  label: 'NHIỆM VỤ', sub: 'Nhiệm vụ'   },
];

/* ─────────────────────────────────────────────
   DAILY GIFT CONFIG & STREAK HELPERS
───────────────────────────────────────────── */
const DAILY_REWARDS = [
  { day: 1, gold: 500,    crystals: 0 },
  { day: 2, gold: 1500,   crystals: 0 },
  { day: 3, gold: 3500,   crystals: 0 },
  { day: 4, gold: 8000,   crystals: 0 },
  { day: 5, gold: 20000,  crystals: 0 },
  { day: 6, gold: 50000,  crystals: 0 },
  { day: 7, gold: 100000, crystals: 5 }
];

function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

function getYesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

function fmt(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
  return Math.floor(n).toString();
}

function getUpgradeCost(base, level) {
  return Math.floor(base * Math.pow(2.0, level));
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
  
  /* Modal states for all 6 sidebar tabs */
  const [showSettings, setShowSettings]       = useState(false);
  const [showRebirth, setShowRebirth]         = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showDailyGift, setShowDailyGift]     = useState(false);
  const [showUpgradesModal, setShowUpgradesModal] = useState(false);
  const [showItemsModal, setShowItemsModal]   = useState(false);
  const [showShopModal, setShowShopModal]     = useState(false);
  const [showQuestModal, setShowQuestModal]   = useState(false);

  /* Quest & Achievement Claimed tracking */
  const [claimedQuests, setClaimedQuests] = useState(() => {
    try { return JSON.parse(localStorage.getItem('claimed_quests_v1')) || {}; } catch(e) { return {}; }
  });
  const [claimedAchieves, setClaimedAchieves] = useState(() => {
    try { return JSON.parse(localStorage.getItem('claimed_achieves_v1')) || {}; } catch(e) { return {}; }
  });

  const lastClick = useRef(0);

  /* Daily streak tracking state in localStorage */
  const [streakInfo, setStreakInfo] = useState(() => {
    const saved = localStorage.getItem('daily_streak_data_v1');
    const today = getTodayStr();
    const yesterday = getYesterdayStr();
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const last = parsed.lastClaimDate;
        if (last === today) {
          return { streakDay: parsed.streakDay || 1, claimedToday: true, lastClaimDate: last };
        } else if (last === yesterday) {
          return { streakDay: parsed.streakDay || 1, claimedToday: false, lastClaimDate: last };
        } else {
          return { streakDay: 1, claimedToday: false, lastClaimDate: last };
        }
      } catch (e) {}
    }
    return { streakDay: 1, claimedToday: false, lastClaimDate: '' };
  });

  /* floating text helper */
  const spawn = useCallback((text, x, y, color = '#f59e0b') => {
    const id = Date.now() + Math.random();
    setFloats(f => [...f, { id, text, x, y, color }]);
    setTimeout(() => setFloats(f => f.filter(t => t.id !== id)), 850);
  }, []);

  /* defeat target */
  const defeatTarget = useCallback((lv) => {
    const reward = lv * 20 + Math.floor(Math.random() * lv * 15);
    spawn(`💥 PHÁ VỠ! +${reward}💰`, 50, 45, '#22c55e');
    const next = lv + 1;
    const newMax = Math.floor(100 * Math.pow(1.45, next - 1));
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

  /* socket drops and team upgrade events */
  useEffect(() => {
    if (!socket) return;
    const handleDrop = (d) => {
      const icons = { wood: '🪵 Gỗ', stone: '🪨 Đá', meat: '🥩 Thịt' };
      spawn(icons[d.item] || '+1', d.x || 50, d.y || 40, '#8b5cf6');
    };
    const handleCoopUpgrade = (data) => {
      spawn(`✨ ${data.buyer} nâng cấp Cả Đội Lv.${data.newLevel}!`, 50, 25, '#38bdf8');
    };
    socket.on('resourceDropped', handleDrop);
    socket.on('coopUpgradeBought', handleCoopUpgrade);
    return () => {
      socket.off('resourceDropped', handleDrop);
      socket.off('coopUpgradeBought', handleCoopUpgrade);
    };
  }, [socket, spawn]);

  /* Claim Daily Gift */
  const claimDailyGift = () => {
    if (streakInfo.claimedToday) return;
    soundManager.playBuy();
    const reward = DAILY_REWARDS.find(r => r.day === streakInfo.streakDay) || DAILY_REWARDS[0];
    
    setOfflineState(p => ({
      ...p,
      money: p.money + reward.gold,
      soulCrystals: (p.soulCrystals || 0) + (reward.crystals || 0),
      totalGoldEarned: (p.totalGoldEarned || 0) + reward.gold
    }));

    const today = getTodayStr();
    const nextStreak = (streakInfo.streakDay % 7) + 1;
    const updated = { streakDay: nextStreak, lastClaimDate: today };
    setStreakInfo({ streakDay: nextStreak, claimedToday: true, lastClaimDate: today });
    localStorage.setItem('daily_streak_data_v1', JSON.stringify(updated));

    spawn(`🎁 NHẬN QUÀ NGÀY ${streakInfo.streakDay}! +${reward.gold.toLocaleString()}🪙`, 50, 40, '#ec4899');
  };

  /* Nav Tab Click Handler */
  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'home') {
      setShowUpgradesModal(false); setShowItemsModal(false);
      setShowAchievements(false); setShowShopModal(false); setShowQuestModal(false);
    } else if (tabId === 'upgrades') {
      setShowUpgradesModal(true);
    } else if (tabId === 'items') {
      setShowItemsModal(true);
    } else if (tabId === 'achievements') {
      setShowAchievements(true);
    } else if (tabId === 'shop') {
      setShowShopModal(true);
    } else if (tabId === 'quest') {
      setShowQuestModal(true);
    }
  };

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
    const fresh = { money:0, dpc:1, dps:0, soulCrystals:0, totalClicks:0, totalGoldEarned:0, rebirthCount:0, upgrades:{ clicker:0,diamondSword:0,godSlayer:0,ultimateRelic:0 } };
    setOfflineState(fresh); setLevel(1); setHp(100); setMaxHp(100); setEnergy(0); setMultiplier(false);
    sessionStorage.setItem('session_clicker_state_v1', JSON.stringify(fresh));
    localStorage.removeItem('offline_clicker_state_v1');
    localStorage.removeItem('clicker_backup_save_v1');
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

  /* tap action */
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

  /* Theme-specific 4 upgrade items */
  const getUpgrades = () => {
    const list = {
      monster: [
        { key:'clicker',       name:'Găng Tay Sắt',    icon:'✋', baseCost:30,   baseVal:1,  isDpc:true,  btnColor:'btn-success' },
        { key:'diamondSword',  name:'Kiếm Kim Cương',  icon:'⚔️', baseCost:150,  baseVal:5,  isDpc:true,  btnColor:'btn-success' },
        { key:'godSlayer',     name:'Trảm Thần Đao',   icon:'🔥', baseCost:800,  baseVal:25, isDpc:true,  btnColor:'btn-primary' },
        { key:'ultimateRelic', name:'Thần Khí Tối Thượng',icon:'✨',baseCost:4000,baseVal:100,isDpc:true, btnColor:'btn-danger'  },
      ],
      wood: [
        { key:'battleAxe',     name:'Rìu Chặt Củi',    icon:'🪓', baseCost:30,   baseVal:1,  isDpc:true,  btnColor:'btn-success' },
        { key:'crystalAxe',    name:'Rìu Thạch Anh',   icon:'💎', baseCost:150,  baseVal:5,  isDpc:true,  btnColor:'btn-success' },
        { key:'mythicSaw',     name:'Cưa Cổ Thụ',      icon:'🌲', baseCost:800,  baseVal:25, isDpc:true,  btnColor:'btn-primary' },
        { key:'godChainsaw',   name:'Máy Cưa Thần',    icon:'⚡', baseCost:4000,baseVal:100,isDpc:true,  btnColor:'btn-danger'  },
      ],
      stone: [
        { key:'stonePickaxe',  name:'Cuốc Đá Cổ',      icon:'⛏️', baseCost:30,   baseVal:1,  isDpc:true,  btnColor:'btn-success' },
        { key:'diamondPickaxe',name:'Cuốc Kim Cương',   icon:'💎', baseCost:150,  baseVal:5,  isDpc:true,  btnColor:'btn-success' },
        { key:'laserHammer',   name:'Búa Laze',         icon:'🔫', baseCost:800,  baseVal:25, isDpc:true,  btnColor:'btn-primary' },
        { key:'atomicSmasher', name:'Đập Hạt Nhân',    icon:'💥', baseCost:4000,baseVal:100,isDpc:true,  btnColor:'btn-danger'  },
      ],
    };
    return list[theme] || list.monster;
  };

  const buyUpgrade = (up) => {
    const lv   = offlineState.upgrades[up.key] || 0;
    const cost = getUpgradeCost(up.baseCost, lv);
    if (offlineState.money < cost) return;
    soundManager.playBuy();
    setOfflineState(p => ({
      ...p,
      money: p.money - cost,
      upgrades: { ...p.upgrades, [up.key]: lv + 1 },
      dpc: up.isDpc  ? p.dpc + up.baseVal : p.dpc,
      dps: !up.isDpc ? p.dps + up.baseVal : p.dps,
    }));
    spawn(`✅ +${up.baseVal} DPC!`, 50, 20, '#22c55e');
  };

  /* Claim Quest */
  const claimQuest = (questId, goldReward, crystalReward = 0) => {
    if (claimedQuests[questId]) return;
    soundManager.playBuy();
    setOfflineState(p => ({
      ...p,
      money: p.money + goldReward,
      soulCrystals: (p.soulCrystals || 0) + crystalReward,
      totalGoldEarned: (p.totalGoldEarned || 0) + goldReward
    }));
    const updated = { ...claimedQuests, [questId]: true };
    setClaimedQuests(updated);
    localStorage.setItem('claimed_quests_v1', JSON.stringify(updated));
    spawn(`📋 NHẬN THƯỞNG! +${goldReward.toLocaleString()}🪙`, 50, 40, '#22c55e');
  };

  /* Claim Achievement */
  const claimAchieve = (achieveId, goldReward, crystalReward = 0) => {
    if (claimedAchieves[achieveId]) return;
    soundManager.playBuy();
    setOfflineState(p => ({
      ...p,
      money: p.money + goldReward,
      soulCrystals: (p.soulCrystals || 0) + crystalReward,
      totalGoldEarned: (p.totalGoldEarned || 0) + goldReward
    }));
    const updated = { ...claimedAchieves, [achieveId]: true };
    setClaimedAchieves(updated);
    localStorage.setItem('claimed_achieves_v1', JSON.stringify(updated));
    spawn(`🏆 THÀNH TỰU! +${goldReward.toLocaleString()}🪙`, 50, 40, '#f59e0b');
  };

  /* Shop Purchase */
  const buyShopItem = (itemType, cost, goldVal = 0, dpcVal = 0, crystalVal = 0) => {
    if (offlineState.money < cost) {
      alert('Không đủ tiền vàng!');
      return;
    }
    soundManager.playBuy();
    setOfflineState(p => ({
      ...p,
      money: p.money - cost + goldVal,
      dpc: p.dpc + dpcVal,
      soulCrystals: (p.soulCrystals || 0) + crystalVal
    }));
    spawn(`🛒 MUA THÀNH CÔNG!`, 50, 40, '#38bdf8');
  };

  const clickImg = () => {
    const base = import.meta.env.BASE_URL;
    const map = { monster:`${base}assets/pixel_monster.png`, wood:`${base}assets/pixel_wood.png`, stone:`${base}assets/pixel_stone.png` };
    return map[theme] || `${base}assets/pixel_monster.png`;
  };

  const me = roomData?.players.find(p => p.id === socketId);
  const dpc = mode === 'offline' ? (offlineState.dpc || 1) : (me?.dpc || 1);
  const gold = mode === 'offline' ? offlineState.money : (me?.score || 0);
  const dps  = mode === 'offline' ? offlineState.dps  : (me?.dps  || 0);
  const upgrades = getUpgrades();
  const stageBgClass = `bg-stage-${theme || 'monster'}`;

  /* Quests List */
  const QUESTS = [
    { id: 'q1', title: '🎯 Người Nhấp Nháy', desc: 'Thực hiện 50 clicks', current: offlineState.totalClicks || 0, target: 50, gold: 1000, crystal: 0 },
    { id: 'q2', title: '⚔️ Thợ Săn Mục Tiêu', desc: `Đánh bại 3 mục tiêu (Màn ${level})`, current: level - 1, target: 3, gold: 2500, crystal: 0 },
    { id: 'q3', title: '💰 Tích Lũy Phú Gia', desc: 'Tích tổng 20,000 Vàng', current: offlineState.totalGoldEarned || 0, target: 20000, gold: 5000, crystal: 1 }
  ];

  /* Achievements List */
  const ACHIEVEMENTS = [
    { id: 'a1', title: '👉 Nhấp Nháy Nhẹ Nhàng', desc: 'Đạt 100 click tổng cộng', current: offlineState.totalClicks || 0, target: 100, gold: 2000, crystal: 1 },
    { id: 'a2', title: '💥 Siêu Clicker', desc: 'Đạt 1,000 click tổng cộng', current: offlineState.totalClicks || 0, target: 1000, gold: 15000, crystal: 3 },
    { id: 'a3', title: '💰 Triệu Phú Clicker', desc: 'Tích lũy 100,000 Vàng', current: offlineState.totalGoldEarned || 0, target: 100000, gold: 30000, crystal: 5 },
    { id: 'a4', title: '🌟 Bậc Thầy Trùng Sinh', desc: 'Thực hiện Trùng Sinh 1 lần', current: offlineState.rebirthCount || 0, target: 1, gold: 50000, crystal: 10 }
  ];

  /* ─── RENDER ─── */
  return (
    <div className={`d-flex flex-column min-vh-100 text-light ${stageBgClass}`} style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>

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
            <div className="fw-bold text-light" style={{ fontSize: '12px' }}>{(offlineState.soulCrystals || 0).toLocaleString()}</div>
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

        {/* ── LEFT SIDEBAR NAV (6 TABS) ── */}
        <aside className="game-sidebar-left d-none d-lg-flex">
          {NAV_ITEMS.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
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

          {/* Target Sprite Image standing on Rune Platform */}
          <div
            onClick={handleTap}
            className={`d-flex align-items-center justify-content-center cursor-pointer user-select-none position-relative flex-grow-1 w-100 ${shaking ? 'click-shake' : ''}`}
            style={{ minHeight: '220px' }}
          >
            <div className="platform-glow" />
            <img
              src={clickImg()}
              alt="Game Target"
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

          {/* Daily Gift (QUÀ NGÀY 🎁) */}
          <div
            onClick={() => setShowDailyGift(true)}
            className="boost-card-pink position-relative"
          >
            {!streakInfo.claimedToday && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-light" style={{ fontSize: '8px' }}>
                NEW
              </span>
            )}
            <div className="d-flex align-items-center justify-content-center rounded-3 mx-auto mb-2" style={{ width: '42px', height: '42px', backgroundColor: 'rgba(236,72,153,0.3)', border: '1px solid rgba(236,72,153,0.5)', fontSize: '20px' }}>
              🎁
            </div>
            <div className="text-light fw-bold text-uppercase lh-1" style={{ fontSize: '9px' }}>QUÀ NGÀY</div>
            <div className="text-pink fw-semibold lh-1 mt-1" style={{ fontSize: '8px', color: '#f472b6' }}>
              {streakInfo.claimedToday ? '✓ Đã nhận' : 'Nhận ngay!'}
            </div>
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
              const lv = offlineState.upgrades[up.key] || 0;
              const currentCost = getUpgradeCost(up.baseCost, lv);
              const can = offlineState.money >= currentCost;
              return (
                <div key={up.key} className="col-6 col-md-3">
                  <div className="upgrade-card-item">
                    <div className="upgrade-icon-box">{up.icon}</div>
                    <div className="flex-grow-1 min-w-0">
                      <div className="text-truncate fw-bold text-light" style={{ fontSize: '10px' }}>{up.name}</div>
                      <div className="text-warning fw-semibold" style={{ fontSize: '9px' }}>Lv. {lv}</div>
                      <div className="text-info fw-bold" style={{ fontSize: '8px' }}>+{up.baseVal} DPC</div>
                      <button
                        onClick={() => buyUpgrade(up)}
                        disabled={!can}
                        className={`btn ${can ? up.btnColor : 'btn-secondary opacity-50'} btn-sm w-100 fw-bold mt-1 py-0`}
                        style={{ fontSize: '10px', height: '22px' }}
                      >
                        🪙 {fmt(currentCost)}
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
          MODALS FOR ALL 6 SIDEBAR TABS
          ══════════════════════════════════════ */}

      {/* TAB 2: Upgrades Modal (NÂNG CẤP SỨC MẠNH) */}
      {showUpgradesModal && (
        <div className="modal d-block bg-dark bg-opacity-75 z-50" tabIndex="-1" onClick={() => setShowUpgradesModal(false)}>
          <div className="modal-dialog modal-dialog-centered modal-md" onClick={e => e.stopPropagation()}>
            <div className="modal-content glass-panel-main text-light p-4 rounded-4 border border-info">
              <div className="d-flex justify-content-between align-items-center border-bottom border-secondary border-opacity-30 pb-2 mb-3">
                <h5 className="h6 fw-black text-info text-uppercase m-0">🏠 NÂNG CẤP SỨC MẠNH (DPC & DPS)</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowUpgradesModal(false)}></button>
              </div>
              <div className="d-flex flex-column gap-2" style={{ maxHeight: '320px', overflowY: 'auto' }}>
                {upgrades.map(up => {
                  const lv = offlineState.upgrades[up.key] || 0;
                  const currentCost = getUpgradeCost(up.baseCost, lv);
                  const can = offlineState.money >= currentCost;
                  return (
                    <div key={up.key} className="glass-card-item rounded-3 p-3 d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center gap-3">
                        <div className="upgrade-icon-box">{up.icon}</div>
                        <div>
                          <div className="fw-bold text-light" style={{ fontSize: '12px' }}>{up.name}</div>
                          <div className="text-warning" style={{ fontSize: '10px' }}>Level {lv}</div>
                          <div className="text-info fw-bold" style={{ fontSize: '10px' }}>Tăng +{up.baseVal} DPC mỗi cấp</div>
                        </div>
                      </div>
                      <button
                        onClick={() => buyUpgrade(up)}
                        disabled={!can}
                        className={`btn ${can ? 'btn-warning text-dark' : 'btn-secondary opacity-50'} btn-sm fw-black px-3 py-1.5 rounded-3`}
                        style={{ fontSize: '11px' }}
                      >
                        🪙 {fmt(currentCost)}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Items & Materials Modal (🎒 VẬT PHẨM & NGUYÊN LIỆU) */}
      {showItemsModal && (
        <div className="modal d-block bg-dark bg-opacity-75 z-50" tabIndex="-1" onClick={() => setShowItemsModal(false)}>
          <div className="modal-dialog modal-dialog-centered modal-md" onClick={e => e.stopPropagation()}>
            <div className="modal-content glass-panel-main text-light p-4 rounded-4 border border-success">
              <div className="d-flex justify-content-between align-items-center border-bottom border-secondary border-opacity-30 pb-2 mb-3">
                <h5 className="h6 fw-black text-success text-uppercase m-0">🎒 KHO VẬT PHẨM & NGUYÊN LIỆU</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowItemsModal(false)}></button>
              </div>
              <div className="row g-2 mb-3">
                {[
                  { icon: '🪵', name: 'Gỗ Đại Thụ', count: roomData?.coopResources?.wood || 12 },
                  { icon: '🪨', name: 'Đá Quặng Thạch', count: roomData?.coopResources?.stone || 8 },
                  { icon: '🥩', name: 'Thịt Quái Thú', count: roomData?.coopResources?.meat || 5 },
                  { icon: '💎', name: 'Tinh Thể Linh Hồn', count: offlineState.soulCrystals || 0 }
                ].map((item, idx) => (
                  <div key={idx} className="col-6">
                    <div className="glass-card-item rounded-3 p-3 text-center">
                      <div style={{ fontSize: '28px' }}>{item.icon}</div>
                      <div className="fw-bold text-light mt-1" style={{ fontSize: '11px' }}>{item.name}</div>
                      <div className="fw-black text-warning" style={{ fontSize: '13px' }}>x{item.count}</div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-secondary text-center m-0" style={{ fontSize: '10px' }}>
                💡 Thu thập nguyên liệu hiếm khi đánh quái/chặt gỗ/đào đá để nâng cấp sức mạnh cả đội!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Achievements Modal (🏆 THÀNH TỰU) */}
      {showAchievements && (
        <div className="modal d-block bg-dark bg-opacity-75 z-50" tabIndex="-1" onClick={() => setShowAchievements(false)}>
          <div className="modal-dialog modal-dialog-centered modal-md" onClick={e => e.stopPropagation()}>
            <div className="modal-content glass-panel-main text-light p-4 rounded-4 border border-warning">
              <div className="d-flex justify-content-between align-items-center border-bottom border-secondary border-opacity-30 pb-2 mb-3">
                <h5 className="h6 fw-black text-warning text-uppercase m-0">🏆 BẢNG THÀNH TỰU</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowAchievements(false)}></button>
              </div>
              <div className="d-flex flex-column gap-2" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {ACHIEVEMENTS.map(a => {
                  const isDone = a.current >= a.target;
                  const isClaimed = claimedAchieves[a.id];
                  return (
                    <div key={a.id} className="glass-card-item rounded-3 p-3 d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-bold text-light" style={{ fontSize: '12px' }}>{a.title}</div>
                        <div className="text-secondary" style={{ fontSize: '10px' }}>{a.desc} ({fmt(a.current)}/{fmt(a.target)})</div>
                        <div className="text-warning fw-bold mt-1" style={{ fontSize: '9px' }}>
                          Thưởng: +{fmt(a.gold)} 🪙 {a.crystal > 0 ? `+${a.crystal} 💎` : ''}
                        </div>
                      </div>
                      <button
                        onClick={() => claimAchieve(a.id, a.gold, a.crystal)}
                        disabled={!isDone || isClaimed}
                        className={`btn ${isClaimed ? 'btn-secondary opacity-50' : isDone ? 'btn-warning text-dark' : 'btn-outline-secondary'} btn-sm fw-black px-3 py-1.5 rounded-3`}
                        style={{ fontSize: '11px' }}
                      >
                        {isClaimed ? '✓ Đã nhận' : isDone ? 'NHẬN QUÀ' : 'Chưa đạt'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Magic Shop Modal (🏪 CỬA HÀNG THẦN BÍ) */}
      {showShopModal && (
        <div className="modal d-block bg-dark bg-opacity-75 z-50" tabIndex="-1" onClick={() => setShowShopModal(false)}>
          <div className="modal-dialog modal-dialog-centered modal-md" onClick={e => e.stopPropagation()}>
            <div className="modal-content glass-panel-main text-light p-4 rounded-4 border border-purple">
              <div className="d-flex justify-content-between align-items-center border-bottom border-secondary border-opacity-30 pb-2 mb-3">
                <h5 className="h6 fw-black text-purple text-uppercase m-0" style={{ color: '#c084fc' }}>🏪 CỬA HÀNG THẦN BÍ</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowShopModal(false)}></button>
              </div>
              <div className="row g-2">
                {[
                  { id: 's1', icon: '⚡', title: 'Tăng Cấp DPC +10', desc: 'Tăng lực click vĩnh viễn', cost: 5000, gold: 0, dpc: 10, crystal: 0 },
                  { id: 's2', icon: '🤖', title: 'Auto Bot Helper', desc: 'Thêm +50 DPS tự động', cost: 15000, gold: 0, dpc: 0, crystal: 0 },
                  { id: 's3', icon: '💎', title: 'Túi 5 Tinh Thể', desc: 'Quy đổi 5 Tinh Thể Linh Hồn', cost: 50000, gold: 0, dpc: 0, crystal: 5 }
                ].map(s => (
                  <div key={s.id} className="col-12">
                    <div className="glass-card-item rounded-3 p-3 d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center gap-3">
                        <div style={{ fontSize: '26px' }}>{s.icon}</div>
                        <div>
                          <div className="fw-bold text-light" style={{ fontSize: '12px' }}>{s.title}</div>
                          <div className="text-secondary" style={{ fontSize: '10px' }}>{s.desc}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => buyShopItem(s.id, s.cost, s.gold, s.dpc, s.crystal)}
                        disabled={offlineState.money < s.cost}
                        className={`btn ${offlineState.money >= s.cost ? 'btn-purple text-white' : 'btn-secondary opacity-50'} btn-sm fw-black px-3 py-1.5 rounded-3`}
                        style={{ fontSize: '11px', background: offlineState.money >= s.cost ? '#8b5cf6' : undefined }}
                      >
                        🪙 {fmt(s.cost)}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: Quests & Missions Modal (📋 NHIỆM VỤ HẰNG NGÀY) */}
      {showQuestModal && (
        <div className="modal d-block bg-dark bg-opacity-75 z-50" tabIndex="-1" onClick={() => setShowQuestModal(false)}>
          <div className="modal-dialog modal-dialog-centered modal-md" onClick={e => e.stopPropagation()}>
            <div className="modal-content glass-panel-main text-light p-4 rounded-4 border border-primary">
              <div className="d-flex justify-content-between align-items-center border-bottom border-secondary border-opacity-30 pb-2 mb-3">
                <h5 className="h6 fw-black text-primary text-uppercase m-0">📋 NHIỆM VỤ HẰNG NGÀY</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowQuestModal(false)}></button>
              </div>
              <div className="d-flex flex-column gap-2" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {QUESTS.map(q => {
                  const isDone = q.current >= q.target;
                  const isClaimed = claimedQuests[q.id];
                  return (
                    <div key={q.id} className="glass-card-item rounded-3 p-3 d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-bold text-light" style={{ fontSize: '12px' }}>{q.title}</div>
                        <div className="text-secondary" style={{ fontSize: '10px' }}>{q.desc} ({fmt(q.current)}/{fmt(q.target)})</div>
                        <div className="text-warning fw-bold mt-1" style={{ fontSize: '9px' }}>
                          Thưởng: +{fmt(q.gold)} 🪙 {q.crystal > 0 ? `+${q.crystal} 💎` : ''}
                        </div>
                      </div>
                      <button
                        onClick={() => claimQuest(q.id, q.gold, q.crystal)}
                        disabled={!isDone || isClaimed}
                        className={`btn ${isClaimed ? 'btn-secondary opacity-50' : isDone ? 'btn-success text-white' : 'btn-outline-secondary'} btn-sm fw-black px-3 py-1.5 rounded-3`}
                        style={{ fontSize: '11px' }}
                      >
                        {isClaimed ? '✓ Đã nhận' : isDone ? 'NHẬN THƯỞNG' : 'Chưa xong'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Daily Gift Modal (QUÀ NGÀY 🎁) */}
      {showDailyGift && (
        <div className="modal d-block bg-dark bg-opacity-75 z-50" tabIndex="-1" onClick={() => setShowDailyGift(false)}>
          <div className="modal-dialog modal-dialog-centered modal-md" onClick={e => e.stopPropagation()}>
            <div className="modal-content glass-panel-main border border-pink text-light p-4 rounded-4">
              <div className="d-flex justify-content-between align-items-center border-bottom border-secondary border-opacity-30 pb-3 mb-3">
                <div className="d-flex align-items-center gap-2">
                  <span style={{ fontSize: '24px' }}>🎁</span>
                  <div>
                    <h5 className="h6 fw-black text-pink uppercase m-0" style={{ color: '#f472b6' }}>ĐIỂM DANH QUÀ NGÀY</h5>
                    <p className="text-secondary m-0" style={{ fontSize: '10px' }}>Đăng nhập liên tục để nhận thưởng lớn nhất!</p>
                  </div>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDailyGift(false)}></button>
              </div>

              {/* 7-Day Rewards Grid */}
              <div className="row g-2 mb-3">
                {DAILY_REWARDS.map(r => {
                  const isCurrent = streakInfo.streakDay === r.day;
                  const isPast = r.day < streakInfo.streakDay || (streakInfo.claimedToday && isCurrent);
                  return (
                    <div key={r.day} className="col-4 col-md-3">
                      <div
                        className={`p-2.5 rounded-3 border text-center transition-all ${
                          isCurrent && !streakInfo.claimedToday
                            ? 'bg-pink bg-opacity-20 border-pink text-light shadow-lg scale-105 ring-2 ring-pink'
                            : isPast
                            ? 'bg-dark bg-opacity-60 border-secondary border-opacity-30 text-secondary'
                            : 'bg-dark bg-opacity-40 border-secondary border-opacity-20 text-light'
                        }`}
                      >
                        <div className="fw-bold uppercase mb-1" style={{ fontSize: '9px' }}>Ngày {r.day}</div>
                        <div style={{ fontSize: '20px' }}>{r.crystals > 0 ? '💎' : '🪙'}</div>
                        <div className="fw-black text-warning mt-1" style={{ fontSize: '10px' }}>+{fmt(r.gold)}</div>
                        {r.crystals > 0 && <div className="fw-black text-purple" style={{ fontSize: '9px' }}>+{r.crystals} 💎</div>}
                        <div className="mt-1" style={{ fontSize: '8px' }}>
                          {isPast ? <span className="text-success fw-bold">✓ Đã nhận</span> : isCurrent ? <span className="text-warning fw-bold">Hôm nay</span> : <span className="text-secondary">Chờ...</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Claim Button */}
              <button
                onClick={claimDailyGift}
                disabled={streakInfo.claimedToday}
                className={`btn w-100 fw-black py-2.5 rounded-3 uppercase shadow-lg ${
                  streakInfo.claimedToday
                    ? 'btn-secondary opacity-50'
                    : 'btn-danger text-light'
                }`}
                style={{
                  fontSize: '13px',
                  background: streakInfo.claimedToday ? undefined : 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)'
                }}
              >
                {streakInfo.claimedToday ? '✓ ĐÃ NHẬN QUÀ HÔM NAY' : `🎁 NHẬN QUÀ NGÀY ${streakInfo.streakDay}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal d-block bg-dark bg-opacity-75 z-50" tabIndex="-1" onClick={() => setShowSettings(false)}>
          <div className="modal-dialog modal-dialog-centered modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-content bg-dark border border-secondary p-3 rounded-4">
              <div className="modal-header border-bottom border-secondary pb-2 mb-2">
                <h5 className="modal-title text-light fw-bold" style={{ fontSize: '14px' }}>⚙️ CÀI ĐẶT GAME</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowSettings(false)}></button>
              </div>
              <div className="modal-body d-flex flex-column gap-2 p-0">
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
        <div className="modal d-block bg-dark bg-opacity-75 z-50" tabIndex="-1" onClick={() => setShowRebirth(false)}>
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content bg-dark border border-purple p-3 rounded-4">
              <div className="modal-header border-bottom border-purple pb-2 mb-2">
                <h5 className="modal-title text-purple fw-bold" style={{ fontSize: '14px' }}>⚡ ĐIỆN TRÙNG SINH</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowRebirth(false)}></button>
              </div>
              <div className="modal-body text-center p-0">
                <p className="text-secondary mb-2" style={{ fontSize: '11px' }}>Reset tiền & nâng cấp để nhận Tinh Thể Linh Hồn vĩnh viễn!</p>
                <div className="bg-surface-dark border border-purple rounded p-3 mb-3 text-start" style={{ fontSize: '12px' }}>
                  <div className="d-flex justify-content-between mb-1"><span className="text-secondary">Tiền vàng:</span><span className="text-warning fw-bold">{Math.floor(offlineState.money).toLocaleString()} 🪙</span></div>
                  <div className="d-flex justify-content-between mb-1"><span className="text-secondary">Tinh thể hiện có:</span><span className="text-purple fw-bold">💎 {offlineState.soulCrystals || 0}</span></div>
                  <div className="d-flex justify-content-between border-top border-purple pt-1 mt-1"><span className="text-light fw-bold">Nhận thêm:</span><span className="text-success fw-bold">+{Math.max(1, Math.floor(offlineState.money / 50000))} 💎</span></div>
                </div>
                <div className="d-flex gap-2">
                  <button onClick={() => setShowRebirth(false)} className="btn btn-secondary flex-grow-1" style={{ fontSize: '12px' }}>Hủy</button>
                  <button onClick={doRebirth} disabled={offlineState.money < 50000} className="btn btn-purple flex-grow-1 text-white" style={{ fontSize: '12px', background: '#8b5cf6' }}>Trùng Sinh!</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

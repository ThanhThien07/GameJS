import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Trophy, 
  Flame, 
  Swords, 
  Trees, 
  Gem, 
  MousePointerClick, 
  Pickaxe, 
  ShoppingCart, 
  Wrench, 
  Truck, 
  Factory, 
  Settings, 
  ClipboardList, 
  Zap,
  Users,
  Volume2,
  VolumeX,
  Sparkles,
  RotateCcw,
  Award,
  Coins
} from 'lucide-react';
import { soundManager } from '../utils/audio';

function GameArea({
  mode,
  onlineType,
  theme,
  offlineState,
  setOfflineState,
  roomData,
  socketId,
  onOnlineClick,
  onBuyCompUpgrade,
  onBuyCoopUpgrade,
  onLeave,
  socket
}) {
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [clickShake, setClickShake] = useState(false);
  const [coopLogs, setCoopLogs] = useState([]);
  const [muted, setMuted] = useState(soundManager.isMuted());
  
  // Energy Multiplier states
  const [energy, setEnergy] = useState(30);
  const [isMultiplierActive, setIsMultiplierActive] = useState(false);
  const [multiplierTimer, setMultiplierTimer] = useState(0);

  // Target Health system
  const [targetHp, setTargetHp] = useState(100);
  const [targetMaxHp, setTargetMaxHp] = useState(100);
  const [level, setLevel] = useState(1);

  // Active Skills states
  const [frenzyActive, setFrenzyActive] = useState(false);
  const [frenzyTimer, setFrenzyTimer] = useState(0);
  const [frenzyCd, setFrenzyCd] = useState(0);

  const [goldenRushCd, setGoldenRushCd] = useState(0);

  // Combo Streak system
  const [comboCount, setComboCount] = useState(0);
  const lastClickTimeRef = useRef(0);

  // Modals
  const [showRebirthModal, setShowRebirthModal] = useState(false);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);

  // ----------------------------------------
  // HELPER TO HANDLE BOSS DEFEAT
  // ----------------------------------------
  const handleDefeatTarget = (currentLvl) => {
    const goldReward = currentLvl * 15 + Math.floor(Math.random() * currentLvl * 10);
    spawnFloatingText(`💥 PHÁ VỠ! +${goldReward}💰`, 50, 45, '#16a34a');
    
    const nextLvl = currentLvl + 1;
    const newMax = Math.floor(100 * Math.pow(1.3, nextLvl - 1));
    
    setLevel(nextLvl);
    setTargetMaxHp(newMax);
    setTargetHp(newMax);
    
    setOfflineState(prev => ({
      ...prev,
      money: prev.money + goldReward,
      totalGoldEarned: (prev.totalGoldEarned || 0) + goldReward
    }));
  };

  // ----------------------------------------
  // SOUND MUTE TOGGLE
  // ----------------------------------------
  const handleToggleSound = () => {
    const isMutedNow = soundManager.toggleMute();
    setMuted(isMutedNow);
  };

  // ----------------------------------------
  // OFFLINE AUTOMATIC INCOME (DPS) & HEALTH DECAY LOOP
  // ----------------------------------------
  useEffect(() => {
    if (mode === 'offline' && offlineState.dps > 0) {
      const interval = setInterval(() => {
        const dps = offlineState.dps;
        const crystalMult = 1 + (offlineState.soulCrystals || 0) * 0.15;
        const baseDamage = isMultiplierActive ? dps * 2 : dps;
        const damage = Math.floor(baseDamage * crystalMult);
        
        // 1. Accumulate gold/money
        setOfflineState(prev => ({
          ...prev,
          money: prev.money + damage,
          totalGoldEarned: (prev.totalGoldEarned || 0) + damage
        }));

        // 2. Reduce target HP automatically
        setTargetHp(prevHp => {
          const nextHp = prevHp - damage;
          if (nextHp <= 0) {
            handleDefeatTarget(level);
            return 100;
          }
          // Visual floating damage text indicator
          if (Math.random() < 0.25) {
            spawnFloatingText(`-${damage}`, Math.random() * 20 + 40, Math.random() * 20 + 40, '#ef4444');
          }
          return nextHp;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [mode, offlineState.dps, isMultiplierActive, level, offlineState.soulCrystals]);

  // ----------------------------------------
  // ENERGY DECAY & SKILL TIMERS
  // ----------------------------------------
  useEffect(() => {
    const timer = setInterval(() => {
      // Energy slowly decays if not clicking
      setEnergy(e => Math.max(0, e - 2));

      // Multiplier timer countdown
      if (isMultiplierActive) {
        setMultiplierTimer(t => {
          if (t <= 1) {
            setIsMultiplierActive(false);
            return 0;
          }
          return t - 1;
        });
      }

      // Frenzy Skill timers
      if (frenzyActive) {
        setFrenzyTimer(t => {
          if (t <= 1) {
            setFrenzyActive(false);
            return 0;
          }
          return t - 1;
        });
      }
      if (frenzyCd > 0) setFrenzyCd(cd => cd - 1);
      if (goldenRushCd > 0) setGoldenRushCd(cd => cd - 1);

      // Combo decay if inactive > 1.2s
      if (Date.now() - lastClickTimeRef.current > 1200) {
        setComboCount(0);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isMultiplierActive, frenzyActive, frenzyCd, goldenRushCd]);

  // Check if energy reaches 100
  useEffect(() => {
    if (energy >= 100 && !isMultiplierActive) {
      setIsMultiplierActive(true);
      setMultiplierTimer(6); // 6 seconds of 2x mult
      setEnergy(0);
    }
  }, [energy, isMultiplierActive]);

  // ----------------------------------------
  // REAL-TIME LOCAL ANIMATION TRIGGERS ON ONLINE SOCKET DROPS
  // ----------------------------------------
  useEffect(() => {
    if (socket) {
      const handleDrop = (data) => {
        const itemIcons = { wood: '🪵 Gỗ', stone: '🪨 Đá', meat: '🥩 Thịt' };
        spawnFloatingText(itemIcons[data.item] || '+1', data.x || 50, data.y || 40, '#6d28d9');
        
        // Add log entry
        setCoopLogs(prev => [
          { id: Math.random(), text: `${data.player} nhặt được 1 ${itemIcons[data.item] || 'tài nguyên'}` },
          ...prev.slice(0, 9)
        ]);
      };
      socket.on('resourceDropped', handleDrop);
      return () => {
        socket.off('resourceDropped', handleDrop);
      };
    }
  }, [socket]);

  // Helper to spawn flying numbers
  const spawnFloatingText = (text, x, y, color = '#ea580c') => {
    const id = Date.now() + Math.random();
    setFloatingTexts(prev => [...prev, { id, text, x, y, color }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== id));
    }, 850);
  };

  // ----------------------------------------
  // SKILL ACTIVATION HANDLERS
  // ----------------------------------------
  const handleActivateFrenzy = () => {
    if (frenzyCd > 0 || frenzyActive) return;
    soundManager.playSkill();
    setFrenzyActive(true);
    setFrenzyTimer(10); // 10 seconds of frenzy
    setFrenzyCd(45); // 45s CD
    spawnFloatingText('🔥 CƠN CUỒNG PHONG! (x2 DPC)', 50, 30, '#ef4444');
  };

  const handleActivateGoldenRush = () => {
    if (goldenRushCd > 0) return;
    soundManager.playSkill();
    setGoldenRushCd(30);
    
    // Grant instant gold bonus based on current DPC & DPS
    const bonus = Math.max(50, (offlineState.dpc || 1) * 30 + (offlineState.dps || 0) * 10);
    setOfflineState(prev => ({
      ...prev,
      money: prev.money + bonus,
      totalGoldEarned: (prev.totalGoldEarned || 0) + bonus
    }));
    spawnFloatingText(`✨ BÃO VÀNG! +${bonus.toLocaleString()}💰`, 50, 40, '#eab308');
  };

  // ----------------------------------------
  // PRESTIGE / REBIRTH HANDLER
  // ----------------------------------------
  const handlePerformRebirth = () => {
    soundManager.playRebirth();
    const newCrystals = Math.max(1, Math.floor(offlineState.money / 50000));
    
    setOfflineState(prev => ({
      money: 0,
      dpc: 1,
      dps: 0,
      soulCrystals: (prev.soulCrystals || 0) + newCrystals,
      totalClicks: prev.totalClicks || 0,
      totalGoldEarned: prev.totalGoldEarned || 0,
      rebirthCount: (prev.rebirthCount || 0) + 1,
      upgrades: {
        clicker: 0,
        battleAxe: 0,
        diamondSword: 0,
        pickaxe: 0,
        minecart: 0,
        drill: 0,
        excavator: 0,
        miningRig: 0
      }
    }));
    setShowRebirthModal(false);
    spawnFloatingText(`🌟 TRÙNG SINH THÀNH CÔNG! +${newCrystals} Tinh Thể`, 50, 50, '#a855f7');
  };

  // ----------------------------------------
  // HANDLE TAPPING ACTION
  // ----------------------------------------
  const handleTap = (e) => {
    soundManager.playClick();
    setClickShake(true);
    setTimeout(() => setClickShake(false), 120);

    // Combo multiplier calculation (up to 3x)
    const now = Date.now();
    if (now - lastClickTimeRef.current < 450) {
      setComboCount(c => Math.min(30, c + 1));
    } else {
      setComboCount(1);
    }
    lastClickTimeRef.current = now;

    const comboMult = 1 + Math.floor(comboCount / 5) * 0.2; // Max combo multiplier

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (mode === 'offline') {
      const crystalMult = 1 + (offlineState.soulCrystals || 0) * 0.15;
      let clickPower = Math.floor(offlineState.dpc * crystalMult * comboMult);
      if (isMultiplierActive) clickPower *= 2;
      if (frenzyActive) clickPower *= 2;

      // Charge energy meter
      setEnergy(e => Math.min(100, e + 6));

      // Credit gold/money & total clicks
      setOfflineState(prev => ({
        ...prev,
        money: prev.money + clickPower,
        totalClicks: (prev.totalClicks || 0) + 1,
        totalGoldEarned: (prev.totalGoldEarned || 0) + clickPower
      }));

      // Apply click damage to target HP
      setTargetHp(hp => {
        const remaining = hp - clickPower;
        if (remaining <= 0) {
          handleDefeatTarget(level);
          return 100;
        }
        spawnFloatingText(`+${clickPower}💰`, x, y);
        return remaining;
      });
    } else {
      // ONLINE MODE click
      onOnlineClick();
      
      if (onlineType === 'competitive') {
        const me = roomData?.players.find(p => p.id === socketId);
        const dpc = me?.dpc || 1;
        spawnFloatingText(`+${dpc}💰`, x, y);
      } else {
        const damageLvl = roomData?.coopUpgrades.damage.level || 1;
        const multLvl = roomData?.coopUpgrades.multiplier.level || 1;
        const mult = 1 + (multLvl - 1) * 0.2;
        const dpc = Math.floor(damageLvl * mult);
        spawnFloatingText(`+${dpc}💰`, x, y, '#6d28d9');
      }
    }
  };

  // ----------------------------------------
  // BUY UPGRADES (OFFLINE HANDLERS)
  // ----------------------------------------
  const getOfflineUpgradeCost = (baseCost, currentLevel) => {
    return Math.floor(baseCost * Math.pow(1.5, currentLevel));
  };

  const buyOfflineUpgrade = (upKey, isDpc, valueAdded, baseCost) => {
    const curLevel = offlineState.upgrades[upKey] || 0;
    const cost = getOfflineUpgradeCost(baseCost, curLevel);

    if (offlineState.money >= cost) {
      soundManager.playBuy();
      setOfflineState(prev => {
        const newUpgrades = { ...prev.upgrades, [upKey]: curLevel + 1 };
        return {
          ...prev,
          money: prev.money - cost,
          upgrades: newUpgrades,
          dpc: isDpc ? prev.dpc + valueAdded : prev.dpc,
          dps: !isDpc ? prev.dps + valueAdded : prev.dps
        };
      });
      spawnFloatingText(`ĐÃ NÂNG CẤP!`, 50, 20, '#6d28d9');
    }
  };

  // Clicker Tool Upgrades (Left column)
  const OFFLINE_CLICK_TOOLS = [
    { key: 'clicker', name: 'Găng Tay Sắt', desc: 'Click +1 vàng', cost: 10, val: 1, isDpc: true, icon: MousePointerClick, statLabel: 'Earn 2x per click' },
    { key: 'battleAxe', name: 'Rìu Chặt Củi', desc: 'Click +5 vàng', cost: 100, val: 5, isDpc: true, icon: Wrench, statLabel: '+5 DPC' },
    { key: 'diamondSword', name: 'Kiếm Kim Cương', desc: 'Click +25 vàng', cost: 800, val: 25, isDpc: true, icon: Swords, statLabel: '+25 DPC' }
  ];

  // Auto Workers/Helpers (Right column)
  const OFFLINE_AUTO_WORKERS = [
    { key: 'pickaxe', name: 'Steve Thợ Mỏ', desc: 'Đục tự động +1/s', cost: 50, val: 1, isDpc: false, icon: Pickaxe, statLabel: '+1/s auto' },
    { key: 'minecart', name: 'Xe Goòng Mỏ', desc: 'Khai thác tự động +10/s', cost: 300, val: 10, isDpc: false, icon: ShoppingCart, statLabel: '+10/s auto' },
    { key: 'drill', name: 'Máy Khoan Laze', desc: 'Khai quật tự động +120/s', cost: 1500, val: 120, isDpc: false, icon: Wrench, statLabel: '+120/s auto' },
    { key: 'excavator', name: 'Xe Máy Xúc', desc: 'Đào tự động +1000/s', cost: 8000, val: 1000, isDpc: false, icon: Truck, statLabel: '+1k/s auto' },
    { key: 'miningRig', name: 'Giàn Khoan Siêu Cấp', desc: 'Khai thác cực đỉnh +5000/s', cost: 50000, val: 5000, isDpc: false, icon: Factory, statLabel: '+5k/s auto' }
  ];

  const getMyCompPlayer = () => {
    return roomData?.players.find(p => p.id === socketId);
  };

  const getThemeClass = () => {
    if (theme === 'monster') return 'theme-bg-monster';
    if (theme === 'wood') return 'theme-bg-wood';
    return 'theme-bg-stone';
  };

  const renderClickObject = () => {
    if (theme === 'monster') {
      return (
        <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto drop-shadow-md">
          <path d="M50 40 Q40 20 20 30 Q40 50 60 60 Z" fill="#b91c1c" />
          <path d="M150 40 Q160 20 180 30 Q160 50 140 60 Z" fill="#b91c1c" />
          <ellipse cx="100" cy="110" rx="80" ry="70" fill="#ef4444" />
          <ellipse cx="100" cy="115" rx="70" ry="60" fill="#dc2626" />
          <circle cx="68" cy="95" r="18" fill="white" />
          <circle cx="68" cy="95" r="8" fill="#0f172a" />
          <circle cx="64" cy="91" r="4" fill="white" />
          <circle cx="132" cy="95" r="18" fill="white" />
          <circle cx="132" cy="95" r="8" fill="#0f172a" />
          <circle cx="128" cy="91" r="4" fill="white" />
          <ellipse cx="53" cy="115" rx="12" ry="6" fill="#fca5a5" opacity="0.8" />
          <ellipse cx="147" cy="115" rx="12" ry="6" fill="#fca5a5" opacity="0.8" />
          <path d="M48 72 L85 85" stroke="#b91c1c" strokeWidth="5" strokeLinecap="round" />
          <path d="M152 72 L115 85" stroke="#b91c1c" strokeWidth="5" strokeLinecap="round" />
          <path d="M80 135 Q100 155 120 135" stroke="#0f172a" strokeWidth="4.5" fill="none" strokeLinecap="round" />
          <polygon points="85,135 92,145 99,135" fill="white" />
          <polygon points="101,135 108,145 115,135" fill="white" />
        </svg>
      );
    } else if (theme === 'wood') {
      return (
        <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto drop-shadow-sm">
          <circle cx="100" cy="65" r="50" fill="#047857" />
          <circle cx="65" cy="88" r="40" fill="#10b981" />
          <circle cx="135" cy="88" r="40" fill="#10b981" />
          <rect x="82" y="95" width="36" height="80" rx="6" fill="#78350f" />
          <path d="M65 175 C75 168 85 162 90 175 M135 175 C125 168 115 162 110 175" stroke="#78350f" strokeWidth="12" strokeLinecap="round" />
          <path d="M82 135 L102 128 L82 120 Z" fill="#d97706" />
          <path d="M118 148 L98 140 L118 132 Z" fill="#d97706" />
          <line x1="100" y1="100" x2="100" y2="170" stroke="#451a03" strokeWidth="2.5" strokeDasharray="6,6" />
        </svg>
      );
    } else {
      return (
        <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto drop-shadow-sm">
          <polygon points="35,160 25,95 55,45 100,25 145,45 175,95 165,160" fill="#475569" />
          <polygon points="45,150 37,100 65,55 100,38 135,55 163,100 155,150" fill="#64748b" />
          <polygon points="70,75 82,62 88,77 76,88" fill="#eab308" />
          <polygon points="125,65 135,77 122,88 112,77" fill="#eab308" />
          <polygon points="88,115 105,102 115,115 98,132" fill="#facc15" />
          <polyline points="100,38 105,72 88,95" stroke="#334155" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <polyline points="128,95 142,118 132,138" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M45 45 L50 40 L45 35 L40 40 Z" fill="#fef08a" />
          <path d="M155 35 L160 30 L155 25 L150 30 Z" fill="#fef08a" />
        </svg>
      );
    }
  };

  return (
    <div className="w-full max-w-6xl flex flex-col gap-5 text-slate-800">
      
      {/* HEADER BANNER */}
      <div className="w-full">
        <div className="screenshot-banner">
          <div className="flex items-center gap-2">
            <ClipboardList size={18} className="text-purple-100" />
            <span className="font-semibold text-xs md:text-sm">Đang ở chế độ đồng bộ đám mây - Tiến trình đã được lưu</span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Sound Mute Toggle */}
            <button 
              onClick={handleToggleSound}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
              title={muted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            >
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>

            {/* Achievements Modal Trigger */}
            <button 
              onClick={() => setShowAchievementsModal(true)}
              className="flex items-center gap-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/30 font-bold text-xs py-1 px-2.5 rounded-lg"
            >
              <Award size={15} /> Thành Tựu
            </button>

            {/* Rebirth Modal Trigger (Offline mode) */}
            {mode === 'offline' && (
              <button 
                onClick={() => setShowRebirthModal(true)}
                className="flex items-center gap-1 bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-400/40 font-extrabold text-xs py-1 px-2.5 rounded-lg"
              >
                <RotateCcw size={14} /> Trùng Sinh (💎{offlineState.soulCrystals || 0})
              </button>
            )}

            <button onClick={onLeave} className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-1 px-3 rounded-lg border border-white/10">
              Quay về Menu
            </button>
          </div>
        </div>
      </div>

      {/* ACTIVE SKILLS TOOLBAR (OFFLINE MODE) */}
      {mode === 'offline' && (
        <div className="w-full bg-slate-900/80 backdrop-blur border border-purple-500/30 rounded-xl p-3 flex flex-wrap justify-between items-center gap-3 text-white">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-yellow-400 animate-pulse" />
            <span className="font-extrabold text-xs text-purple-200 uppercase tracking-wider">Kỹ Năng Nguồn Lực</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Skill 1: Frenzy */}
            <button
              onClick={handleActivateFrenzy}
              disabled={frenzyCd > 0 || frenzyActive}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                frenzyActive 
                  ? 'bg-rose-600 text-white border-rose-400 animate-pulse' 
                  : frenzyCd > 0 
                  ? 'bg-slate-800 text-slate-400 border-slate-700 cursor-not-allowed' 
                  : 'bg-rose-900/50 hover:bg-rose-600 text-rose-200 border-rose-500/50'
              }`}
            >
              <Flame size={14} />
              <span>Cơn Cuồng Phong (x2 DPC)</span>
              {frenzyActive && <span className="bg-white/20 px-1.5 rounded text-[10px]">{frenzyTimer}s</span>}
              {!frenzyActive && frenzyCd > 0 && <span className="text-[10px]">({frenzyCd}s)</span>}
            </button>

            {/* Skill 2: Golden Rush */}
            <button
              onClick={handleActivateGoldenRush}
              disabled={goldenRushCd > 0}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                goldenRushCd > 0 
                  ? 'bg-slate-800 text-slate-400 border-slate-700 cursor-not-allowed' 
                  : 'bg-amber-900/50 hover:bg-amber-600 text-amber-200 border-amber-500/50'
              }`}
            >
              <Coins size={14} />
              <span>Bão Vàng (Thưởng Vàng)</span>
              {goldenRushCd > 0 && <span className="text-[10px]">({goldenRushCd}s)</span>}
            </button>
          </div>
        </div>
      )}

      {/* MINE CLICKER 3-COLUMN LAYOUT STRUCTURE */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* COLUMN 1: LEFT PANEL - CLICK TOOLS UPGRADES */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="block-panel">
            <div className="block-panel-header">⚒️ Nâng Cấp Công Cụ (Click DPC)</div>
            
            {mode === 'offline' && (
              <div className="upgrade-list-scroll">
                {OFFLINE_CLICK_TOOLS.map((up) => {
                  const IconComp = up.icon;
                  const curLvl = offlineState.upgrades[up.key] || 0;
                  const cost = getOfflineUpgradeCost(up.cost, curLvl);
                  const canAfford = offlineState.money >= cost;

                  return (
                    <button
                      key={up.key}
                      onClick={() => buyOfflineUpgrade(up.key, up.isDpc, up.val, up.cost)}
                      disabled={!canAfford}
                      className="upgrade-row-modern"
                    >
                      {curLvl > 0 && <span className="upgrade-row-level">v{curLvl}</span>}
                      <div className="upgrade-row-icon-box">
                        <IconComp size={18} className="text-slate-700" />
                      </div>
                      <div className="upgrade-row-details">
                        <span className="upgrade-row-name">{up.name}</span>
                        <span className="upgrade-row-stat">{up.statLabel}</span>
                      </div>
                      <span className="upgrade-row-price-btn">
                        💰{cost.toLocaleString()}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {mode === 'online' && onlineType === 'competitive' && roomData && (
              <div className="upgrade-list-scroll">
                {(() => {
                  const up = { key: 'clicker', name: 'Găng Tay Sắt', val: 1, isDpc: true, icon: MousePointerClick, statLabel: 'Earn 2x per click' };
                  const me = getMyCompPlayer();
                  const curLvl = me?.upgrades[up.key] || 0;
                  const cost = Math.floor(10 * Math.pow(1.5, curLvl));
                  const myScore = me?.score || 0;
                  const canAfford = myScore >= cost;

                  return (
                    <button
                      onClick={() => onBuyCompUpgrade(up.key)}
                      disabled={!canAfford}
                      className="upgrade-row-modern"
                    >
                      {curLvl > 0 && <span className="upgrade-row-level">v{curLvl}</span>}
                      <div className="upgrade-row-icon-box">
                        <MousePointerClick size={18} className="text-slate-700" />
                      </div>
                      <div className="upgrade-row-details">
                        <span className="upgrade-row-name">{up.name}</span>
                        <span className="upgrade-row-stat">{up.statLabel}</span>
                      </div>
                      <span className="upgrade-row-price-btn">
                        💰{cost.toLocaleString()}
                      </span>
                    </button>
                  );
                })()}
              </div>
            )}

            {mode === 'online' && onlineType === 'coop' && roomData && (
              <div className="flex flex-col gap-3">
                {(() => {
                  const lvl = roomData.coopUpgrades.damage.level;
                  const factor = Math.pow(1.5, lvl - 1);
                  const meatCost = Math.floor(roomData.coopUpgrades.damage.baseCost.meat * factor);
                  const woodCost = Math.floor(roomData.coopUpgrades.damage.baseCost.wood * factor);
                  const canAfford = roomData.coopResources.meat >= meatCost && roomData.coopResources.wood >= woodCost;

                  return (
                    <button
                      onClick={() => onBuyCoopUpgrade('damage')}
                      disabled={!canAfford}
                      className="w-full flex flex-col bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 p-3.5 rounded-xl transition-all disabled:opacity-50 text-left relative shadow-sm hover:border-purple-300"
                    >
                      <span className="absolute top-2 right-2 text-[9px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">v{lvl}</span>
                      <span className="font-extrabold text-xs mb-1">⚔️ Sát Thương Chung</span>
                      <span className="text-[10px] text-purple-600 font-extrabold mb-2 block">+1 Click Damage</span>
                      <div className="flex gap-2 text-[10px] font-black">
                        <span className={roomData.coopResources.meat >= meatCost ? 'text-rose-600' : 'text-slate-300'}>🥩 {meatCost}</span>
                        <span className={roomData.coopResources.wood >= woodCost ? 'text-emerald-600' : 'text-slate-300'}>🪵 {woodCost}</span>
                      </div>
                    </button>
                  );
                })()}

                {(() => {
                  const lvl = roomData.coopUpgrades.multiplier.level;
                  const factor = Math.pow(1.5, lvl - 1);
                  const stoneCost = Math.floor(roomData.coopUpgrades.multiplier.baseCost.stone * factor);
                  const woodCost = Math.floor(roomData.coopUpgrades.multiplier.baseCost.wood * factor);
                  const canAfford = roomData.coopResources.stone >= stoneCost && roomData.coopResources.wood >= woodCost;

                  return (
                    <button
                      onClick={() => onBuyCoopUpgrade('multiplier')}
                      disabled={!canAfford}
                      className="w-full flex flex-col bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 p-3.5 rounded-xl transition-all disabled:opacity-50 text-left relative shadow-sm hover:border-purple-300"
                    >
                      <span className="absolute top-2 right-2 text-[9px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">v{lvl}</span>
                      <span className="font-extrabold text-xs mb-1">📊 Hệ Số Nhân Chung</span>
                      <span className="text-[10px] text-purple-600 font-extrabold mb-2 block">+20% Click Damage</span>
                      <div className="flex gap-2 text-[10px] font-black">
                        <span className={roomData.coopResources.stone >= stoneCost ? 'text-amber-600' : 'text-slate-300'}>🪨 {stoneCost}</span>
                        <span className={roomData.coopResources.wood >= woodCost ? 'text-emerald-600' : 'text-slate-300'}>🪵 {woodCost}</span>
                      </div>
                    </button>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 2: CENTER PANEL - MAIN INTERACTION CLICK AREA */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          
          <div className={`w-full game-theme-container ${getThemeClass()} p-5 flex flex-col items-center justify-center min-h-[440px] relative`}>
            
            {/* Real-time Flying Numbers */}
            {floatingTexts.map(t => (
              <span
                key={t.id}
                className="floating-text"
                style={{
                  left: `${t.x}%`,
                  top: `${t.y}%`,
                  color: t.color
                }}
              >
                {t.text}
              </span>
            ))}

            {/* Total Mining Rate display */}
            <div className="absolute top-4 left-4 z-10 flex flex-col items-start bg-white/90 py-1 px-3 rounded-lg border border-slate-200 shadow-sm">
              <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest">Tốc độ tự động</span>
              <span className="text-base font-black text-green-700 flex items-center gap-0.5">
                <Zap size={13} className="fill-green-600 text-green-600" />
                {mode === 'offline' ? `${offlineState.dps}/s` : `${roomData?.players.find(p => p.id === socketId)?.dps || 0}/s`}
              </span>
            </div>

            {/* Combo Streak Indicator */}
            {comboCount > 2 && (
              <div className="absolute top-16 left-4 z-10 bg-amber-500 text-slate-900 font-black px-3 py-1 rounded-full shadow-lg border border-amber-300 animate-bounce">
                🔥 COMBO x{(1 + Math.floor(comboCount / 5) * 0.2).toFixed(1)} ({comboCount})
              </div>
            )}

            {/* Offline target health statistics */}
            {mode === 'offline' && (
              <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-1">
                <span className="text-[9px] text-slate-500 font-black tracking-widest uppercase">CẤP ĐỘ {level}</span>
                <div className="w-32 bg-slate-200 border border-slate-300 h-4.5 rounded-full overflow-hidden flex items-center justify-between px-2 relative shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-rose-500 to-red-500 h-full absolute left-0 top-0 transition-all duration-100"
                    style={{ width: `${(targetHp / targetMaxHp) * 100}%` }}
                  ></div>
                  <span className="text-[8px] font-black text-white relative z-20">HP</span>
                  <span className="text-[9px] font-black text-white relative z-20">
                    {Math.max(0, targetHp).toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Online Timer */}
            {mode === 'online' && roomData && (
              <div className="absolute top-4 right-4 z-10 text-right bg-white/90 py-1.5 px-3 rounded-lg border border-slate-200 shadow-sm">
                {onlineType === 'competitive' ? (
                  <div>
                    <span className="text-[9px] text-pink-600 font-extrabold block uppercase tracking-wider">THỜI GIAN</span>
                    <span className="text-xl font-black text-rose-600 animate-pulse">{roomData.timer}s</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                    <span className="text-[9px] text-emerald-700 font-black uppercase">CO-OP ONLINE</span>
                  </div>
                )}
              </div>
            )}

            {/* Core Clicking Block/Monster target */}
            <div 
              onClick={handleTap} 
              className={`clicker-object my-6 select-none active:scale-90 ${clickShake ? 'click-shake' : ''}`}
            >
              {renderClickObject()}
            </div>

            {/* Float x2 circle multiplier indicator */}
            <div className="absolute right-5 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5">
              <div className={`multiplier-circle-ad ${isMultiplierActive ? 'animate-bounce ring-4 ring-green-300' : 'opacity-85'}`}>
                x2
              </div>
              <span className="text-[8px] bg-white border border-slate-200 px-2 py-0.5 rounded-full font-extrabold text-slate-500 tracking-wider shadow-sm">
                {isMultiplierActive ? `${multiplierTimer}s` : 'SẠC NỘ'}
              </span>
            </div>

            {/* Energy progress meter */}
            {(mode === 'offline' || (mode === 'online' && onlineType === 'competitive')) && (
              <div className="w-full max-w-xs flex flex-col items-center mt-2 z-10 bg-white/90 p-2.5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between w-full text-[9px] text-slate-500 font-extrabold mb-1">
                  <span className="flex items-center gap-1 text-purple-600 uppercase">
                    <Flame size={12} className="animate-pulse" /> THANH NỘ BỔ TRỢ CLICK (x2)
                  </span>
                  <span className="text-purple-700">
                    {isMultiplierActive ? 'X2 ĐANG CHẠY' : `${energy}%`}
                  </span>
                </div>
                <div className="w-full bg-slate-100 border border-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-150 ${
                      isMultiplierActive 
                        ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-rose-400 animate-pulse' 
                        : 'bg-purple-600'
                    }`}
                    style={{ width: `${isMultiplierActive ? (multiplierTimer / 6) * 100 : energy}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Central Money Board display */}
          <div className="w-full block-panel p-4 flex justify-between items-center bg-white border-slate-200">
            {mode === 'offline' ? (
              <>
                <div className="text-left">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">TIỀN VÀNG HIỆN CÓ</span>
                  <span className="text-2xl font-black text-slate-800">{Math.floor(offlineState.money).toLocaleString()} 💰</span>
                  {offlineState.soulCrystals > 0 && (
                    <span className="text-xs text-purple-600 font-bold block mt-0.5">
                      💎 Tinh thể linh hồn: +{(offlineState.soulCrystals * 15)}% Sức mạnh
                    </span>
                  )}
                </div>
                <div className="text-right border-l border-slate-200 pl-4 text-xs font-bold text-slate-500">
                  <div>CLICK: <span className="text-purple-600 font-extrabold">+{offlineState.dpc} DPC</span></div>
                  <div>AUTO: <span className="text-green-600 font-extrabold">+{offlineState.dps}/s DPS</span></div>
                </div>
              </>
            ) : onlineType === 'competitive' ? (
              <>
                <div className="text-left">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">TIỀN VÀNG TÍCH LŨY</span>
                  <span className="text-2xl font-black text-slate-800">
                    {(getMyCompPlayer()?.score || 0).toLocaleString()} 💰
                  </span>
                </div>
                <div className="text-right border-l border-slate-200 pl-4 text-xs font-bold text-slate-500">
                  <div>CLICK: <span className="text-purple-600 font-extrabold">+{getMyCompPlayer()?.dpc || 1} DPC</span></div>
                  <div>AUTO: <span className="text-green-600 font-extrabold">+{getMyCompPlayer()?.dps || 0}/s DPS</span></div>
                </div>
              </>
            ) : (
              <div className="text-center w-full">
                <span className="text-[10px] text-purple-600 font-extrabold uppercase tracking-wider block mb-1">CHẾ ĐỘ HỢP TÁC 3 NGƯỜI CHƠI</span>
                <p className="text-xs text-slate-500 font-medium">
                  Đánh Boss/Đốn cây/Khai mỏ để nhận được các mảnh nguyên liệu. Bạn đã sạc thành công <span className="font-bold text-green-600">{roomData?.coopUpgrades.autoClick.level * 2} DPS</span> cho phòng.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 3: RIGHT PANEL - HIRE AUTO HELPERS */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="block-panel">
            
            {mode === 'offline' && (
              <>
                <div className="block-panel-header">🤖 Thuê Nhân Công (Tự Động DPS)</div>
                <div className="upgrade-list-scroll">
                  {OFFLINE_AUTO_WORKERS.map((up) => {
                    const IconComp = up.icon;
                    const curLvl = offlineState.upgrades[up.key] || 0;
                    const cost = getOfflineUpgradeCost(up.cost, curLvl);
                    const canAfford = offlineState.money >= cost;

                    return (
                      <button
                        key={up.key}
                        onClick={() => buyOfflineUpgrade(up.key, up.isDpc, up.val, up.cost)}
                        disabled={!canAfford}
                        className="upgrade-row-modern"
                      >
                        {curLvl > 0 && <span className="upgrade-row-level">v{curLvl}</span>}
                        <div className="upgrade-row-icon-box">
                          <IconComp size={18} className="text-slate-700" />
                        </div>
                        <div className="upgrade-row-details">
                          <span className="upgrade-row-name">{up.name}</span>
                          <span className="upgrade-row-stat">{up.statLabel}</span>
                        </div>
                        <span className="upgrade-row-price-btn">
                          💰{cost.toLocaleString()}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {mode === 'online' && onlineType === 'competitive' && roomData && (
              <>
                <div className="block-panel-header">🤖 Thuê Nhân Công (Auto)</div>
                <div className="upgrade-list-scroll">
                  {OFFLINE_AUTO_WORKERS.slice(0, 3).map((up) => {
                    const IconComp = up.icon;
                    const me = getMyCompPlayer();
                    const curLvl = me?.upgrades[up.key] || 0;
                    const cost = Math.floor(up.cost * Math.pow(1.5, curLvl));
                    const myScore = me?.score || 0;
                    const canAfford = myScore >= cost;

                    return (
                      <button
                        key={up.key}
                        onClick={() => onBuyCompUpgrade(up.key)}
                        disabled={!canAfford}
                        className="upgrade-row-modern"
                      >
                        {curLvl > 0 && <span className="upgrade-row-level">v{curLvl}</span>}
                        <div className="upgrade-row-icon-box">
                          <IconComp size={18} className="text-slate-700" />
                        </div>
                        <div className="upgrade-row-details">
                          <span className="upgrade-row-name">{up.name}</span>
                          <span className="upgrade-row-stat">+{up.val}/s DPS</span>
                        </div>
                        <span className="upgrade-row-price-btn">
                          💰{cost.toLocaleString()}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {mode === 'online' && onlineType === 'coop' && roomData && (
              <div className="flex flex-col gap-4 h-full">
                <div className="text-left">
                  <h5 className="font-extrabold text-[11px] text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <Users size={12} /> Thành viên phòng
                  </h5>
                  <div className="flex flex-col gap-1.5">
                    {roomData.players.map((p) => (
                      <div key={p.id} className="flex justify-between items-center text-xs bg-slate-50 p-2 rounded-lg border border-slate-200">
                        <span className="font-bold text-slate-700 truncate max-w-[120px]">{p.name} {p.id === socketId ? '(Bạn)' : ''}</span>
                        {p.isBot && <span className="text-[8px] bg-purple-100 border border-purple-200 px-1 rounded text-purple-700 font-extrabold">AI</span>}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-left mt-1 border-t border-slate-200 pt-3">
                  {(() => {
                    const lvl = roomData.coopUpgrades.autoClick.level;
                    const factor = Math.pow(1.5, lvl);
                    const meatCost = Math.floor(roomData.coopUpgrades.autoClick.baseCost.meat * factor);
                    const stoneCost = Math.floor(roomData.coopUpgrades.autoClick.baseCost.stone * factor);
                    const canAfford = roomData.coopResources.meat >= meatCost && roomData.coopResources.stone >= stoneCost;

                    return (
                      <button
                        onClick={() => onBuyCoopUpgrade('autoClick')}
                        disabled={!canAfford}
                        className="w-full flex flex-col bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 p-3 rounded-xl transition-all disabled:opacity-50 text-left relative shadow-sm hover:border-purple-300"
                      >
                        <span className="absolute top-2 right-2 text-[9px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">v{lvl}</span>
                        <span className="font-extrabold text-xs mb-1">🤖 Robot Auto-Click</span>
                        <span className="text-[10px] text-purple-600 font-extrabold mb-2 block">+2 Vàng/s chung</span>
                        <div className="flex gap-2 text-[10px] font-black">
                          <span className={roomData.coopResources.meat >= meatCost ? 'text-rose-600' : 'text-slate-300'}>🥩 {meatCost}</span>
                          <span className={roomData.coopResources.stone >= stoneCost ? 'text-amber-600' : 'text-slate-300'}>🪨 {stoneCost}</span>
                        </div>
                      </button>
                    );
                  })()}
                </div>

                <div className="flex-grow text-left border-t border-slate-200 pt-3 flex flex-col justify-end">
                  <h5 className="font-extrabold text-[10px] text-slate-400 uppercase tracking-widest mb-1.5">Nhật ký nhặt tài nguyên:</h5>
                  <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200 max-h-[140px] overflow-y-auto text-[10px] font-semibold text-slate-500 space-y-1">
                    {coopLogs.length === 0 ? (
                      <div className="text-slate-400 italic">Chưa có tài nguyên nào rơi ra...</div>
                    ) : (
                      coopLogs.map(l => (
                        <div key={l.id} className="truncate border-b border-slate-200/40 pb-0.5">{l.text}</div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* REBIRTH MODAL */}
      {showRebirthModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-500/40 rounded-2xl max-w-md w-full p-6 text-white text-center shadow-2xl animate-in zoom-in-95">
            <RotateCcw size={44} className="mx-auto text-purple-400 mb-3 animate-spin-slow" />
            <h3 className="text-2xl font-black text-purple-300 mb-2">ĐIỆN TRÙNG SINH</h3>
            <p className="text-xs text-slate-300 mb-4">
              Trùng Sinh sẽ **reset lại tiền vàng và toàn bộ nâng cấp thường**, nhưng bạn sẽ đổi lấy **Tinh Thể Linh Hồn** vĩnh viễn!
            </p>
            
            <div className="bg-purple-950/60 border border-purple-500/30 p-4 rounded-xl mb-5 space-y-2 text-left text-xs font-semibold">
              <div className="flex justify-between">
                <span className="text-slate-400">Tiền vàng tích lũy:</span>
                <span className="font-extrabold text-amber-400">{Math.floor(offlineState.money).toLocaleString()} 💰</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tinh thể hiện có:</span>
                <span className="font-extrabold text-purple-400">💎 {offlineState.soulCrystals || 0}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-purple-800/50">
                <span className="text-purple-200 font-extrabold">Nhận thêm sau Trùng Sinh:</span>
                <span className="font-black text-emerald-400">+${Math.max(1, Math.floor(offlineState.money / 50000))} Tinh thể 💎</span>
              </div>
              <span className="text-[10px] text-purple-300 block text-center pt-1 italic">
                (Mỗi Tinh Thể Linh Hồn tăng +15% sức mạnh Click & Auto vĩnh viễn)
              </span>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowRebirthModal(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 font-bold py-2.5 rounded-xl text-xs"
              >
                Hủy Bỏ
              </button>
              <button 
                onClick={handlePerformRebirth}
                disabled={offlineState.money < 50000}
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 font-black py-2.5 rounded-xl text-xs shadow-lg"
              >
                Xác Nhận Trùng Sinh!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACHIEVEMENTS MODAL */}
      {showAchievementsModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-lg w-full p-6 text-white text-left shadow-2xl">
            <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Award size={24} className="text-amber-400" />
                <h3 className="text-xl font-black text-amber-300">BẢNG THÀNH TỰU</h3>
              </div>
              <button 
                onClick={() => setShowAchievementsModal(false)}
                className="text-slate-400 hover:text-white font-bold text-sm"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {/* Achievement 1 */}
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex justify-between items-center">
                <div>
                  <div className="font-extrabold text-sm text-slate-200">👉 Nhấp Nháy Nhẹ Nhàng</div>
                  <div className="text-xs text-slate-400">Đạt 100 lần click tay ({offlineState.totalClicks || 0}/100)</div>
                </div>
                <span className={(offlineState.totalClicks || 0) >= 100 ? 'text-xs font-bold bg-green-900/60 text-green-300 border border-green-700 px-2 py-1 rounded' : 'text-xs text-slate-500'}>
                  {(offlineState.totalClicks || 0) >= 100 ? '✓ Đã hoàn thành' : 'Đang làm...'}
                </span>
              </div>

              {/* Achievement 2 */}
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex justify-between items-center">
                <div>
                  <div className="font-extrabold text-sm text-slate-200">💰 Triệu Phú Clicker</div>
                  <div className="text-xs text-slate-400">Tích lũy 100,000 tổng vàng ({Math.floor(offlineState.totalGoldEarned || 0).toLocaleString()}/100,000)</div>
                </div>
                <span className={(offlineState.totalGoldEarned || 0) >= 100000 ? 'text-xs font-bold bg-green-900/60 text-green-300 border border-green-700 px-2 py-1 rounded' : 'text-xs text-slate-500'}>
                  {(offlineState.totalGoldEarned || 0) >= 100000 ? '✓ Đã hoàn thành' : 'Đang làm...'}
                </span>
              </div>

              {/* Achievement 3 */}
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex justify-between items-center">
                <div>
                  <div className="font-extrabold text-sm text-slate-200">🌀 Bậc Thầy Trùng Sinh</div>
                  <div className="text-xs text-slate-400">Thực hiện Trùng Sinh ít nhất 1 lần ({offlineState.rebirthCount || 0}/1)</div>
                </div>
                <span className={(offlineState.rebirthCount || 0) >= 1 ? 'text-xs font-bold bg-green-900/60 text-green-300 border border-green-700 px-2 py-1 rounded' : 'text-xs text-slate-500'}>
                  {(offlineState.rebirthCount || 0) >= 1 ? '✓ Đã hoàn thành' : 'Đang làm...'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default GameArea;

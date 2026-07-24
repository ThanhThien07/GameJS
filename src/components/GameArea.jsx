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

  // Dynamic Theme-Filtered Upgrades System
  const getFilteredUpgrades = () => {
    let clickTools = [];
    let autoWorkers = [];

    if (theme === 'wood') {
      clickTools = [
        { key: 'battleAxe', name: 'Rìu Chặt Củi', desc: 'Click +5 DPC', cost: 10, val: 5, isDpc: true, icon: Wrench, statLabel: '+5 DPC' },
        { key: 'crystalAxe', name: 'Rìu Thạch Anh', desc: 'Click +25 DPC', cost: 150, val: 25, isDpc: true, icon: Wrench, statLabel: '+25 DPC' },
        { key: 'mythicSaw', name: 'Cưa Cổ Thụ', desc: 'Click +120 DPC', cost: 1000, val: 120, isDpc: true, icon: Zap, statLabel: '+120 DPC' }
      ];
      autoWorkers = [
        { key: 'apprenticeLumberjack', name: 'Tiều Phu Tập Sự', desc: 'Chặt gỗ +1/s auto', cost: 50, val: 1, isDpc: false, icon: Trees, statLabel: '+1/s auto' },
        { key: 'logCart', name: 'Xe Kéo Gỗ Rừng', desc: 'Vận chuyển gỗ +10/s auto', cost: 300, val: 10, isDpc: false, icon: Truck, statLabel: '+10/s auto' },
        { key: 'autoChainsaw', name: 'Máy Cưa Tự Động', desc: 'Chặt đốn gỗ +120/s auto', cost: 1500, val: 120, isDpc: false, icon: Factory, statLabel: '+120/s auto' }
      ];
    } else if (theme === 'monster') {
      clickTools = [
        { key: 'clicker', name: 'Găng Tay Sắt', desc: 'Click +1 DPC', cost: 10, val: 1, isDpc: true, icon: MousePointerClick, statLabel: '+1 DPC' },
        { key: 'diamondSword', name: 'Kiếm Kim Cương', desc: 'Click +25 DPC', cost: 150, val: 25, isDpc: true, icon: Swords, statLabel: '+25 DPC' },
        { key: 'godSlayer', name: 'Trảm Thần Đao', desc: 'Click +120 DPC', cost: 1000, val: 120, isDpc: true, icon: Flame, statLabel: '+120 DPC' }
      ];
      autoWorkers = [
        { key: 'apprenticeHero', name: 'Dũng Sĩ Tập Sự', desc: 'Săn quái +1/s auto', cost: 50, val: 1, isDpc: false, icon: Swords, statLabel: '+1/s auto' },
        { key: 'paladinWorker', name: 'Hiệp Sĩ Thánh Điện', desc: 'Đánh quái +10/s auto', cost: 300, val: 10, isDpc: false, icon: Swords, statLabel: '+10/s auto' },
        { key: 'mageWorker', name: 'Phù Thủy Ma Pháp', desc: 'Chưởng phép +120/s auto', cost: 1500, val: 120, isDpc: false, icon: Sparkles, statLabel: '+120/s auto' }
      ];
    } else {
      // Default: Stone Mining Theme & Capybara / Button
      clickTools = [
        { key: 'stonePickaxe', name: 'Cuốc Đá Cổ', desc: 'Click +1 DPC', cost: 10, val: 1, isDpc: true, icon: Pickaxe, statLabel: '+1 DPC' },
        { key: 'diamondPickaxe', name: 'Cuốc Kim Cương', desc: 'Click +25 DPC', cost: 150, val: 25, isDpc: true, icon: Gem, statLabel: '+25 DPC' },
        { key: 'laserHammer', name: 'Búa Laze Tinh Thể', desc: 'Click +120 DPC', cost: 1000, val: 120, isDpc: true, icon: Zap, statLabel: '+120 DPC' }
      ];
      autoWorkers = [
        { key: 'pickaxe', name: 'Steve Thợ Mỏ', desc: 'Đục đá +1/s auto', cost: 50, val: 1, isDpc: false, icon: Pickaxe, statLabel: '+1/s auto' },
        { key: 'minecart', name: 'Xe Goòng Mỏ', desc: 'Khai thác +10/s auto', cost: 300, val: 10, isDpc: false, icon: ShoppingCart, statLabel: '+10/s auto' },
        { key: 'drill', name: 'Máy Khoan Laze', desc: 'Khai quật +120/s auto', cost: 1500, val: 120, isDpc: false, icon: Wrench, statLabel: '+120/s auto' },
        { key: 'excavator', name: 'Xe Máy Xúc', desc: 'Đào quặng +1000/s auto', cost: 8000, val: 1000, isDpc: false, icon: Truck, statLabel: '+1k/s auto' },
        { key: 'miningRig', name: 'Giàn Khoan Siêu Cấp', desc: 'Khai thác +5000/s auto', cost: 50000, val: 5000, isDpc: false, icon: Factory, statLabel: '+5k/s auto' }
      ];
    }

    return { clickTools, autoWorkers };
  };

  const getMyCompPlayer = () => {
    return roomData?.players.find(p => p.id === socketId);
  };

  const getThemeClass = () => {
    if (theme === 'monster') return 'theme-bg-monster';
    if (theme === 'wood') return 'theme-bg-wood';
    return 'theme-bg-stone';
  };

  const renderClickObject = () => {
    let imgSrc = `${import.meta.env.BASE_URL}assets/cartoon_capybara.png`;
    let imgAlt = 'Capybara Mascot';

    if (theme === 'button') {
      imgSrc = `${import.meta.env.BASE_URL}assets/cartoon_red_button.png`;
      imgAlt = 'Red Push Button';
    } else if (theme === 'monster') {
      imgSrc = `${import.meta.env.BASE_URL}assets/cartoon_monster.png`;
      imgAlt = 'Monster Boss';
    } else if (theme === 'wood') {
      imgSrc = `${import.meta.env.BASE_URL}assets/cartoon_wood.png`;
      imgAlt = 'Tree Stump';
    } else if (theme === 'stone') {
      imgSrc = `${import.meta.env.BASE_URL}assets/cartoon_stone.png`;
      imgAlt = 'Crystal Gem Ore';
    }

    return (
      <div className="relative group cursor-pointer select-none">
        <img
          src={imgSrc}
          alt={imgAlt}
          className="w-36 h-36 md:w-44 md:h-44 max-w-[180px] max-h-[180px] object-contain mx-auto cartoon-clicker-object transition-transform duration-100 z-10 relative"
        />
        {/* Pointer Cursor Arrow Overlay like reference image */}
        <div className="absolute -bottom-1 -right-1 pointer-events-none group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform z-20">
          <svg width="36" height="36" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="filter drop-shadow-[0_2px_0_#000]">
            <path d="M20 10 L80 50 L50 60 L35 90 L20 10 Z" fill="white" stroke="black" strokeWidth="6" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col gap-4 animate-in fade-in duration-300">
      
      {/* SCREENSHOT BANNER / HEADER */}
      <div className="screenshot-banner">
        <div className="flex items-center gap-3">
          <button 
            onClick={onLeave} 
            className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg border border-white/20 transition-all"
            title="Quay về danh mục"
          >
            <ArrowLeft size={16} /> Menu
          </button>

          <div className="text-left">
            <h2 className="font-extrabold text-sm md:text-base leading-tight tracking-wide flex items-center gap-2 text-white">
              <span>⚡ TAP TAP CLICKER MULTIPLAYER</span>
              <span className="text-[10px] bg-yellow-400 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase">
                {mode === 'offline' ? 'CHẾ ĐỘ OFFLINE' : onlineType === 'competitive' ? 'ĐẤU TRƯỜNG ONLINE' : 'HỢP TÁC CO-OP'}
              </span>
            </h2>
            <span className="text-[11px] text-purple-200 font-semibold block">
              {theme === 'wood' ? '🪵 Tiều Phu Chặt Gỗ Rừng' : theme === 'monster' ? '⚔️ Chiến Đấu Quái Vật' : '🪨 Thợ Mỏ Khai Thác Thạch Anh'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-black/30 border border-white/10 px-3 py-1.5 rounded-xl">
            {/* Mode status pill */}
            <div className="flex flex-col text-left">
              <span className="text-[9px] text-purple-200 font-bold uppercase tracking-wider">CHẾ ĐỘ HIỆN TẠI</span>
              <span className="text-xs font-black text-yellow-300">
                {mode === 'offline' ? 'CHƠI ĐƠN OFFLINE' : roomData ? `PHÒNG #${roomData.id}` : 'ĐANG KẾT NỐI'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Settings Trigger */}
            <button 
              onClick={() => soundManager.playClick()} 
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all"
              title="Cài đặt"
            >
              <Settings size={18} />
            </button>

            {/* Achievements Modal Trigger */}
            <button 
              onClick={() => setShowAchievementsModal(true)}
              className="flex items-center gap-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/30 font-bold text-xs py-1 px-2.5 rounded-lg"
            >
              <Award size={15} /> Thành Tựu
            </button>
          </div>
        </div>

        {/* GUARANTEED SIDE-BY-SIDE FLEX CONTAINER (50% LEFT / 50% RIGHT) */}
        <div className="w-full flex flex-col lg:flex-row gap-5 items-start justify-between">
          
          {/* LEFT SIDE (50% WIDTH): COMPACT CLICK SUNBURST ARENA */}
          <div className="w-full lg:w-1/2 flex flex-col gap-3">
            
            <div className="w-full sunburst-container p-4 flex flex-col items-center justify-center min-h-[300px] md:min-h-[340px] relative rounded-2xl">
              
              {/* Animated Radiant Yellow Rays Halo */}
              <div className="sunburst-rays"></div>

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

              {/* Core Click Target */}
              <div 
                onClick={handleTap} 
                className={`clicker-object my-2 select-none active:scale-90 ${clickShake ? 'click-shake' : ''}`}
              >
                {renderClickObject()}
              </div>

              {/* Online Timer */}
              {mode === 'online' && roomData && (
                <div className="absolute top-3 right-3 z-10 text-right bg-white/90 py-1 px-2.5 rounded-lg border border-slate-200 shadow-sm">
                  {onlineType === 'competitive' ? (
                    <div>
                      <span className="text-[8px] text-pink-600 font-extrabold block uppercase tracking-wider">THỜI GIAN</span>
                      <span className="text-base font-black text-rose-600 animate-pulse">{roomData.timer}s</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                      <span className="text-[9px] text-emerald-700 font-black uppercase">CO-OP ONLINE</span>
                    </div>
                  )}
                </div>
              )}

              {/* Float x2 circle multiplier */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
                <div className={`multiplier-circle-ad ${isMultiplierActive ? 'animate-bounce ring-4 ring-green-300' : 'opacity-85'}`}>
                  x2
                </div>
                <span className="text-[8px] bg-white border border-slate-200 px-1.5 py-0.5 rounded-full font-extrabold text-slate-500 tracking-wider shadow-sm">
                  {isMultiplierActive ? `${multiplierTimer}s` : 'SẠC NỘ'}
                </span>
              </div>
            </div>

            {/* Theme Badge */}
            <div className="text-xs text-slate-600 font-bold bg-slate-100 border border-slate-200 p-2 rounded-xl text-center shadow-sm">
              {theme === 'wood' && '🪵 Chế độ: Tiều Phu Chặt Gỗ Rừng'}
              {theme === 'monster' && '⚔️ Chế độ: Săn Quái Vật Cổ Đại'}
              {theme === 'stone' && '🪨 Chế độ: Thợ Mỏ Khai Thác Thạch Anh'}
              {theme === 'button' && '🔴 Chế độ: Nút Ấn Đẩy Kinh Điển'}
            </div>
          </div>

          {/* RIGHT SIDE (50% WIDTH): SHOP UPGRADES PANEL FILTERED BY THEME */}
          <div className="w-full lg:w-1/2 flex flex-col gap-3">
            <div className="block-panel h-full">
              <div className="block-panel-header flex justify-between items-center">
                <span>🛍️ CỬA HÀNG NÂNG CẤP ({theme === 'wood' ? 'TIỀU PHU' : theme === 'monster' ? 'QUÁI VẬT' : 'THỢ MỎ'})</span>
              </div>

              <div className="upgrade-list-scroll max-h-[460px]">
                {mode === 'offline' && (() => {
                  const { clickTools, autoWorkers } = getFilteredUpgrades();
                  return (
                    <>
                      {/* Group 1: Click Tools */}
                      <div className="text-left font-black text-[10px] text-purple-600 uppercase tracking-wider my-1 bg-purple-50 p-1.5 rounded-lg border border-purple-100">
                        ⚒️ Công Cụ Click (Tăng DPC)
                      </div>
                      {clickTools.map((up) => {
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

                      {/* Group 2: Auto Workers */}
                      <div className="text-left font-black text-[10px] text-green-600 uppercase tracking-wider mt-3 mb-1 bg-green-50 p-1.5 rounded-lg border border-green-100">
                        🤖 Nhân Công Auto (Tự Động/s)
                      </div>
                      {autoWorkers.map((up) => {
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
                    </>
                  );
                })()}

                {mode === 'online' && onlineType === 'competitive' && roomData && (
                  <>
                    <div className="text-left font-black text-[10px] text-purple-600 uppercase tracking-wider my-1 bg-purple-50 p-1.5 rounded-lg">
                      ⚒️ Công Cụ Click (Competitive)
                    </div>
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
                          className="upgrade-row-modern mb-2"
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

                    <div className="text-left font-black text-[10px] text-green-600 uppercase tracking-wider mt-3 mb-1 bg-green-50 p-1.5 rounded-lg">
                      🤖 Thuê Nhân Công Auto
                    </div>
                    {getFilteredUpgrades().autoWorkers.slice(0, 3).map((up) => {
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
                  </>
                )}

                {mode === 'online' && onlineType === 'coop' && roomData && roomData.coopUpgrades && (
                  <div className="flex flex-col gap-3">
                    <div className="text-left font-black text-[10px] text-purple-600 uppercase tracking-wider my-1 bg-purple-50 p-1.5 rounded-lg">
                      🤝 Nâng Cấp Chung Cho Cả Team
                    </div>
                    {(() => {
                      const dmgUp = roomData.coopUpgrades?.damage || { level: 1, baseCost: { meat: 10, wood: 10 } };
                      const lvl = dmgUp.level || 1;
                      const factor = Math.pow(1.5, lvl - 1);
                      const meatCost = Math.floor((dmgUp.baseCost?.meat || 10) * factor);
                      const woodCost = Math.floor((dmgUp.baseCost?.wood || 10) * factor);
                      const res = roomData.coopResources || { meat: 0, wood: 0, stone: 0 };
                      const canAfford = (res.meat || 0) >= meatCost && (res.wood || 0) >= woodCost;

                      return (
                        <button
                          onClick={() => onBuyCoopUpgrade('damage')}
                          disabled={!canAfford}
                          className="w-full flex flex-col bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 p-3 rounded-xl transition-all disabled:opacity-50 text-left relative shadow-sm hover:border-purple-300"
                        >
                          <span className="absolute top-2 right-2 text-[9px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">v{lvl}</span>
                          <span className="font-extrabold text-xs mb-1">⚔️ Sát Thương Chung</span>
                          <span className="text-[10px] text-purple-600 font-extrabold mb-2 block">+1 Click Damage</span>
                          <div className="flex gap-2 text-[10px] font-black">
                            <span className={(res.meat || 0) >= meatCost ? 'text-rose-600' : 'text-slate-300'}>🥩 {meatCost}</span>
                            <span className={(res.wood || 0) >= woodCost ? 'text-emerald-600' : 'text-slate-300'}>🪵 {woodCost}</span>
                          </div>
                        </button>
                      );
                    })()}

                    {(() => {
                      const multUp = roomData.coopUpgrades?.multiplier || { level: 1, baseCost: { stone: 15, wood: 15 } };
                      const lvl = multUp.level || 1;
                      const factor = Math.pow(1.5, lvl - 1);
                      const stoneCost = Math.floor((multUp.baseCost?.stone || 15) * factor);
                      const woodCost = Math.floor((multUp.baseCost?.wood || 15) * factor);
                      const res = roomData.coopResources || { meat: 0, wood: 0, stone: 0 };
                      const canAfford = (res.stone || 0) >= stoneCost && (res.wood || 0) >= woodCost;

                      return (
                        <button
                          onClick={() => onBuyCoopUpgrade('multiplier')}
                          disabled={!canAfford}
                          className="w-full flex flex-col bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 p-3 rounded-xl transition-all disabled:opacity-50 text-left relative shadow-sm hover:border-purple-300"
                        >
                          <span className="absolute top-2 right-2 text-[9px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">v{lvl}</span>
                          <span className="font-extrabold text-xs mb-1">📊 Hệ Số Nhân Chung</span>
                          <span className="text-[10px] text-purple-600 font-extrabold mb-2 block">+20% Click Damage</span>
                          <div className="flex gap-2 text-[10px] font-black">
                            <span className={(res.stone || 0) >= stoneCost ? 'text-amber-600' : 'text-slate-300'}>🪨 {stoneCost}</span>
                            <span className={(res.wood || 0) >= woodCost ? 'text-emerald-600' : 'text-slate-300'}>🪵 {woodCost}</span>
                          </div>
                        </button>
                      );
                    })()}

                    {(() => {
                      const autoUp = roomData.coopUpgrades?.autoClick || { level: 0, baseCost: { meat: 20, stone: 20 } };
                      const lvl = autoUp.level || 0;
                      const factor = Math.pow(1.5, lvl);
                      const meatCost = Math.floor((autoUp.baseCost?.meat || 20) * factor);
                      const stoneCost = Math.floor((autoUp.baseCost?.stone || 20) * factor);
                      const res = roomData.coopResources || { meat: 0, stone: 0 };
                      const canAfford = (res.meat || 0) >= meatCost && (res.stone || 0) >= stoneCost;

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
                            <span className={(res.meat || 0) >= meatCost ? 'text-rose-600' : 'text-slate-300'}>🥩 {meatCost}</span>
                            <span className={(res.stone || 0) >= stoneCost ? 'text-amber-600' : 'text-slate-300'}>🪨 {stoneCost}</span>
                          </div>
                        </button>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
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

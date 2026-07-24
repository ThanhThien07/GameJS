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
  Coins,
  Home,
  Gift,
  ShieldAlert,
  Plus,
  Package,
  Store,
  CheckCircle2
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
  const [activeTab, setActiveTab] = useState('home');
  
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

  // Modals & Settings
  const [showRebirthModal, setShowRebirthModal] = useState(false);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

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
      setEnergy(e => Math.max(0, e - 2));

      if (isMultiplierActive) {
        setMultiplierTimer(t => {
          if (t <= 1) {
            setIsMultiplierActive(false);
            return 0;
          }
          return t - 1;
        });
      }

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

      if (Date.now() - lastClickTimeRef.current > 1200) {
        setComboCount(0);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isMultiplierActive, frenzyActive, frenzyCd, goldenRushCd]);

  useEffect(() => {
    if (energy >= 100 && !isMultiplierActive) {
      setIsMultiplierActive(true);
      setMultiplierTimer(6);
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
  const spawnFloatingText = (text, x, y, color = '#f59e0b') => {
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
    setFrenzyTimer(10);
    setFrenzyCd(45);
    spawnFloatingText('🔥 CUỒNG PHONG! (x2 DPC)', 50, 30, '#ef4444');
  };

  const handleActivateGoldenRush = () => {
    if (goldenRushCd > 0) return;
    soundManager.playSkill();
    setGoldenRushCd(30);
    
    const bonus = Math.max(50, (offlineState.dpc || 1) * 30 + (offlineState.dps || 0) * 10);
    setOfflineState(prev => ({
      ...prev,
      money: prev.money + bonus,
      totalGoldEarned: (prev.totalGoldEarned || 0) + bonus
    }));
    spawnFloatingText(`✨ BÃO VÀNG! +${bonus.toLocaleString()}💰`, 50, 40, '#eab308');
  };

  // ----------------------------------------
  // IN-MEMORY LIVE GAME DATA RESET (NO F5 REFRESH NEEDED)
  // ----------------------------------------
  const handleResetGameData = () => {
    if (window.confirm('Bạn có chắc chắn muốn RESET chơi lại từ đầu? Tất cả tiền và nâng cấp sẽ trở về 0!')) {
      const freshState = {
        money: 0,
        dpc: 1,
        dps: 0,
        soulCrystals: 0,
        totalClicks: 0,
        totalGoldEarned: 0,
        rebirthCount: 0,
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
      };
      setOfflineState(freshState);
      setLevel(1);
      setTargetHp(100);
      setTargetMaxHp(100);
      setEnergy(0);
      setIsMultiplierActive(false);
      localStorage.setItem('offline_clicker_state_v1', JSON.stringify(freshState));
      setShowSettingsModal(false);
      spawnFloatingText('🔄 ĐÃ RESET GAME THÀNH CÔNG!', 50, 50, '#ef4444');
    }
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

    const now = Date.now();
    if (now - lastClickTimeRef.current < 450) {
      setComboCount(c => Math.min(30, c + 1));
    } else {
      setComboCount(1);
    }
    lastClickTimeRef.current = now;

    const comboMult = 1 + Math.floor(comboCount / 5) * 0.2;

    let x = 50;
    let y = 40;
    if (e && e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      x = ((e.clientX - rect.left) / rect.width) * 100;
      y = ((e.clientY - rect.top) / rect.height) * 100;
    }

    if (mode === 'offline') {
      const crystalMult = 1 + (offlineState.soulCrystals || 0) * 0.15;
      let clickPower = Math.floor(offlineState.dpc * crystalMult * comboMult);
      if (isMultiplierActive) clickPower *= 2;
      if (frenzyActive) clickPower *= 2;

      setEnergy(e => Math.min(100, e + 6));

      setOfflineState(prev => ({
        ...prev,
        money: prev.money + clickPower,
        totalClicks: (prev.totalClicks || 0) + 1,
        totalGoldEarned: (prev.totalGoldEarned || 0) + clickPower
      }));

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
      onOnlineClick();
      
      if (onlineType === 'competitive') {
        const me = roomData?.players.find(p => p.id === socketId);
        const dpc = me?.dpc || 1;
        spawnFloatingText(`+${dpc}💰`, x, y);
      } else {
        const damageLvl = roomData?.coopUpgrades?.damage?.level || 1;
        const multLvl = roomData?.coopUpgrades?.multiplier?.level || 1;
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
      spawnFloatingText(`ĐÃ NÂNG CẤP!`, 50, 20, '#10b981');
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
        { key: 'godSlayer', name: 'Trảm Thần Đạo', desc: 'Click +120 DPC', cost: 1000, val: 120, isDpc: true, icon: Flame, statLabel: '+120 DPC' },
        { key: 'ultimateRelic', name: 'Thần Khí Tối Thượng', desc: 'Click +500 DPC', cost: 5000, val: 500, isDpc: true, icon: Sparkles, statLabel: '+500 DPC' }
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
        { key: 'excavator', name: 'Xe Máy Xúc', desc: 'Đào quặng +1000/s auto', cost: 8000, val: 1000, isDpc: false, icon: Truck, statLabel: '+1k/s auto' }
      ];
    }

    return { clickTools, autoWorkers };
  };

  const getMyCompPlayer = () => {
    return roomData?.players.find(p => p.id === socketId);
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
      <div className="relative group cursor-pointer select-none flex items-center justify-center">
        {/* 3D Glowing Magical Rune Ring Platform */}
        <div className="rune-platform-glow"></div>

        <img
          src={imgSrc}
          alt={imgAlt}
          className="w-48 h-48 md:w-64 md:h-64 max-w-[280px] max-h-[380px] object-contain mx-auto cartoon-clicker-object transition-transform duration-100 z-10 relative drop-shadow-[0_15px_30px_rgba(0,0,0,0.5)] group-hover:scale-105"
        />
      </div>
    );
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto min-h-screen bg-[#0f172a] text-slate-100 flex flex-col font-['Outfit',sans-serif] relative pb-12 overflow-x-hidden">
      
      {/* 1. HEADER RESOURCE BAR (TOP - MATCHING MOCKUP BLUEPRINT) */}
      <header className="w-full bg-[#1e293b]/90 backdrop-blur-md border-b border-slate-800 px-4 md:px-8 py-3 flex items-center justify-between z-30 sticky top-0 shadow-lg">
        {/* Left: Branding Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={onLeave}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-md">
            <Gamepad2 size={22} />
          </div>
          <div>
            <h1 className="text-base md:text-lg font-black tracking-wider text-white uppercase leading-none">
              TAP TAP
            </h1>
            <span className="text-[10px] text-blue-400 font-extrabold tracking-widest block uppercase mt-0.5">
              CLICKER MULTIPLAYER
            </span>
          </div>
        </div>

        {/* Center / Right: Resource Badges & Settings */}
        <div className="flex items-center gap-3 md:gap-6">
          {/* Gold Badge */}
          <div className="flex items-center gap-2 bg-[#0f172a] border border-slate-700/80 px-3.5 py-1.5 rounded-full shadow-inner">
            <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs shadow-md">
              🪙
            </div>
            <div className="flex flex-col text-left">
              <span className="font-black text-sm text-amber-400 leading-none">
                {mode === 'offline' ? formatNumber(Math.floor(offlineState.money)) : formatNumber(getMyCompPlayer()?.score || 0)}
              </span>
              <span className="text-[9px] text-emerald-400 font-bold leading-none mt-0.5">
                +{mode === 'offline' ? formatNumber(offlineState.dps) : formatNumber(roomData?.players.find(p => p.id === socketId)?.dps || 0)}/s
              </span>
            </div>
            <button className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs hover:bg-blue-500">
              <Plus size={12} />
            </button>
          </div>

          {/* Diamond Badge */}
          <div className="flex items-center gap-2 bg-[#0f172a] border border-slate-700/80 px-3.5 py-1.5 rounded-full shadow-inner">
            <div className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center font-black text-xs shadow-md">
              💎
            </div>
            <span className="font-black text-sm text-purple-300">
              {offlineState.soulCrystals ? offlineState.soulCrystals.toLocaleString() : '1,250'}
            </span>
            <button className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs hover:bg-blue-500">
              <Plus size={12} />
            </button>
          </div>

          {/* Settings Gear Button */}
          <button
            onClick={() => setShowSettingsModal(true)}
            className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors shadow-md"
            title="Cài đặt"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* 2. MAIN LAYOUT CONTAINER (SIDEBAR + GAME ARENA + BOOST CARDS) */}
      <div className="w-full flex flex-col md:flex-row flex-1 p-3 md:p-6 gap-6 items-start">
        
        {/* LEFT SIDEBAR NAVIGATION MENU (WIDTH ~190px - MATCHING MOCKUP) */}
        <aside className="w-full md:w-[200px] shrink-0 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 z-20">
          <button
            onClick={() => setActiveTab('home')}
            className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all text-left border ${
              activeTab === 'home'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-400 text-white font-black shadow-lg shadow-blue-500/25 scale-102'
                : 'bg-[#1e293b]/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-[#1e293b]'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <Home size={18} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-xs tracking-wider uppercase">BẤM</span>
              <span className="text-[10px] opacity-75 font-semibold">Trang chủ</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('upgrades')}
            className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all text-left border ${
              activeTab === 'upgrades'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-400 text-white font-black shadow-lg shadow-blue-500/25'
                : 'bg-[#1e293b]/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-[#1e293b]'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
              <Zap size={18} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-xs tracking-wider uppercase">NÂNG CẤP</span>
              <span className="text-[10px] opacity-75 font-semibold">Sức mạnh</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('items')}
            className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all text-left border ${
              activeTab === 'items'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-400 text-white font-black shadow-lg shadow-blue-500/25'
                : 'bg-[#1e293b]/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-[#1e293b]'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
              <Package size={18} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-xs tracking-wider uppercase">ANG VẬT</span>
              <span className="text-[10px] opacity-75 font-semibold">Vật phẩm</span>
            </div>
          </button>

          <button
            onClick={() => setShowAchievementsModal(true)}
            className="w-full p-3 rounded-2xl flex items-center gap-3 transition-all text-left border bg-[#1e293b]/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-[#1e293b]"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Trophy size={18} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-xs tracking-wider uppercase">THÀNH TÍCH</span>
              <span className="text-[10px] opacity-75 font-semibold">Thành tích</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('shop')}
            className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all text-left border ${
              activeTab === 'shop'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-400 text-white font-black shadow-lg shadow-blue-500/25'
                : 'bg-[#1e293b]/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-[#1e293b]'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Store size={18} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-xs tracking-wider uppercase">CỬA HÀNG</span>
              <span className="text-[10px] opacity-75 font-semibold">Cửa hàng</span>
            </div>
          </button>
        </aside>

        {/* CENTER MAIN GAMEPLAY ARENA (MATCHING MOCKUP CENTER AREA) */}
        <main className="flex-1 w-full bg-[#1e293b]/60 border border-slate-800 rounded-3xl p-4 md:p-6 flex flex-col items-center justify-between relative overflow-hidden min-h-[520px]">
          
          {/* Flying Damage/Gold Numbers */}
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

          {/* TOP CHARACTER STATS & ENERGY BAR */}
          <div className="w-full max-w-md flex flex-col items-center z-10 gap-2">
            <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-0.5 rounded-full tracking-wider uppercase">
              ⚡ SẮC NỔ ACTIVE ⚡
            </span>

            {/* Energy / Frenzy Bar */}
            <div className="w-full bg-[#0f172a] border border-slate-700/80 p-2.5 rounded-2xl shadow-md">
              <div className="flex justify-between text-[11px] font-black mb-1.5">
                <span className="text-blue-400 flex items-center gap-1">
                  <Flame size={14} className="text-amber-400 animate-pulse" /> THANH NỘ BỔ TRỢ (x2)
                </span>
                <span className="text-amber-400">{isMultiplierActive ? 'X2 FRENZY RUNNING' : `${energy}%`}</span>
              </div>
              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-700">
                <div
                  className={`h-full transition-all duration-200 ${
                    isMultiplierActive
                      ? 'bg-gradient-to-r from-amber-400 via-purple-500 to-blue-500 animate-pulse'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-500'
                  }`}
                  style={{ width: `${isMultiplierActive ? (multiplierTimer / 6) * 100 : energy}%` }}
                ></div>
              </div>
            </div>

            {/* Buff Tags */}
            <div className="flex gap-2 text-xs font-black">
              <button
                onClick={handleActivateFrenzy}
                disabled={frenzyCd > 0 || frenzyActive}
                className={`px-3 py-1 rounded-xl border transition-all flex items-center gap-1.5 ${
                  frenzyActive
                    ? 'bg-rose-600 border-rose-400 text-white animate-pulse'
                    : frenzyCd > 0
                    ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
                    : 'bg-rose-500/20 border-rose-500/40 text-rose-300 hover:bg-rose-500/30'
                }`}
              >
                🔥 Cuồng Phong (x2 DPC) {frenzyActive ? `${frenzyTimer}s` : frenzyCd > 0 ? `(${frenzyCd}s)` : ''}
              </button>

              <button
                onClick={handleActivateGoldenRush}
                disabled={goldenRushCd > 0}
                className={`px-3 py-1 rounded-xl border transition-all flex items-center gap-1.5 ${
                  goldenRushCd > 0
                    ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
                    : 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
                }`}
              >
                ⚡ Bão Vàng {goldenRushCd > 0 ? `(${goldenRushCd}s)` : ''}
              </button>
            </div>
          </div>

          {/* CENTER CHARACTER MASCOT CENTERPIECE */}
          <div
            onClick={handleTap}
            className={`my-4 cursor-pointer select-none transition-transform active:scale-95 z-10 ${clickShake ? 'click-shake' : ''}`}
          >
            {renderClickObject()}
          </div>

          {/* BOTTOM CLICK POWER & MAIN GOLD CTA BUTTON */}
          <div className="w-full flex flex-col items-center gap-3 z-10 mt-2">
            <div className="text-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Click Power</span>
              <span className="text-3xl md:text-4xl font-black text-white tracking-wide block drop-shadow-md">
                +{mode === 'offline' ? offlineState.dpc : (getMyCompPlayer()?.dpc || 1)}
              </span>
              <span className="text-[11px] text-purple-300 font-extrabold flex items-center justify-center gap-1 mt-0.5">
                ⚒️ Nâng Cấp Công Cụ Click
              </span>
            </div>

            {/* GIANT GOLD PRIMARY CLICK BUTTON (MATCHING MOCKUP "BẤM NGAY") */}
            <button
              onClick={handleTap}
              className="cta-gold-button text-xl py-4 px-12 rounded-full shadow-2xl flex items-center justify-center gap-3 cursor-pointer active:scale-95 transition-transform"
            >
              <MousePointerClick size={24} className="text-slate-950 animate-bounce" /> BẤM NGAY
            </button>
          </div>
        </main>

        {/* RIGHT SIDE UTILITY BOOST CARDS (MATCHING MOCKUP RIGHT CARDS) */}
        <aside className="w-full md:w-[150px] shrink-0 flex flex-row md:flex-col gap-4 justify-center">
          {/* Boost x2 Card */}
          <div className="flex-1 bg-[#1e293b] border border-slate-800 rounded-3xl p-4 flex flex-col items-center justify-center text-center shadow-lg group hover:border-purple-500/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center font-black text-xl mb-2 group-hover:scale-110 transition-transform">
              x2
            </div>
            <span className="text-[10px] font-mono text-purple-300 font-bold">23:45:12</span>
            <span className="text-[11px] font-black text-slate-200 mt-0.5 uppercase tracking-wider">BOOST X2</span>
          </div>

          {/* Daily Gift Card */}
          <div className="flex-1 bg-[#1e293b] border border-slate-800 rounded-3xl p-4 flex flex-col items-center justify-center text-center shadow-lg group hover:border-amber-500/50 transition-all cursor-pointer">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Gift size={24} />
            </div>
            <span className="text-xs font-black text-amber-400 uppercase">QUÀ NGÀY</span>
            <span className="text-[9px] text-slate-400 font-bold mt-0.5">Nhận quà</span>
          </div>
        </aside>

      </div>

      {/* 3. BOTTOM UPGRADE CARDS GRID (4 COLUMNS ON DESKTOP - MATCHING MOCKUP) */}
      <section className="w-full px-4 md:px-8 mt-4">
        <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-amber-400" />
            <h3 className="text-base md:text-lg font-black text-white uppercase tracking-wider">
              DANH SÁCH NÂNG CẤP THẦN KHÍ
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-bold">Tự động tối ưu theo theme</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {mode === 'offline' && (() => {
            const { clickTools, autoWorkers } = getFilteredUpgrades();
            const allUpgrades = [...clickTools, ...autoWorkers];

            return allUpgrades.map((up) => {
              const IconComp = up.icon;
              const curLvl = offlineState.upgrades[up.key] || 0;
              const cost = getOfflineUpgradeCost(up.cost, curLvl);
              const canAfford = offlineState.money >= cost;

              return (
                <div
                  key={up.key}
                  className={`upgrade-card-grid group ${!canAfford ? 'opacity-70' : ''}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-11 h-11 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                      <IconComp size={22} />
                    </div>
                    <span className="text-[10px] font-black bg-purple-900/60 text-purple-300 border border-purple-700/50 px-2 py-0.5 rounded-full">
                      Lv. {curLvl}
                    </span>
                  </div>

                  <div className="mb-3">
                    <h4 className="font-extrabold text-sm text-slate-100 mb-0.5 group-hover:text-amber-400 transition-colors">
                      {up.name}
                    </h4>
                    <span className="text-xs font-bold text-purple-400 block">{up.statLabel}</span>
                  </div>

                  {/* Progress Bar inside Card */}
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-3">
                    <div
                      className="bg-amber-400 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, (offlineState.money / cost) * 100)}%` }}
                    ></div>
                  </div>

                  {/* Price Button Badge */}
                  <button
                    onClick={() => buyOfflineUpgrade(up.key, up.isDpc, up.val, up.cost)}
                    disabled={!canAfford}
                    className={`w-full py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md ${
                      canAfford
                        ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white cursor-pointer active:scale-95'
                        : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    }`}
                  >
                    <span>🪙 {cost.toLocaleString()}</span>
                  </button>
                </div>
              );
            });
          })()}
        </div>
      </section>

      {/* SETTINGS MODAL */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e293b] border border-slate-700 rounded-3xl max-w-sm w-full p-6 text-white text-center shadow-2xl animate-in zoom-in-95">
            <h3 className="text-xl font-black text-white mb-4 uppercase tracking-wider">⚙️ CÀI ĐẶT GAME</h3>
            
            <div className="space-y-3 mb-6">
              <button
                onClick={handleToggleSound}
                className="w-full bg-slate-800 hover:bg-slate-700 p-3 rounded-2xl flex items-center justify-between font-bold text-sm border border-slate-700"
              >
                <span>Âm thanh hiệu ứng</span>
                {muted ? <VolumeX size={18} className="text-red-400" /> : <Volume2 size={18} className="text-emerald-400" />}
              </button>

              {mode === 'offline' && (
                <>
                  <button
                    onClick={() => {
                      setShowSettingsModal(false);
                      setShowRebirthModal(true);
                    }}
                    className="w-full bg-purple-900/40 hover:bg-purple-900/60 p-3 rounded-2xl flex items-center justify-between font-bold text-sm border border-purple-700/50 text-purple-300"
                  >
                    <span>Điện Trùng Sinh</span>
                    <RotateCcw size={18} />
                  </button>

                  <button
                    onClick={handleResetGameData}
                    className="w-full bg-amber-950/40 hover:bg-amber-950/60 p-3 rounded-2xl flex items-center justify-between font-bold text-sm border border-amber-700/50 text-amber-300"
                  >
                    <span>🔄 Reset Chơi Lại Từ Đầu</span>
                    <RotateCcw size={18} className="text-amber-400" />
                  </button>
                </>
              )}

              <button
                onClick={onLeave}
                className="w-full bg-rose-950/40 hover:bg-rose-950/60 p-3 rounded-2xl flex items-center justify-between font-bold text-sm border border-rose-700/50 text-rose-300"
              >
                <span>Thoát ra Menu chính</span>
                <ArrowLeft size={18} />
              </button>
            </div>

            <button
              onClick={() => setShowSettingsModal(false)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-extrabold py-2.5 rounded-xl text-xs"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* REBIRTH MODAL */}
      {showRebirthModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e293b] border border-purple-500/40 rounded-3xl max-w-md w-full p-6 text-white text-center shadow-2xl animate-in zoom-in-95">
            <RotateCcw size={44} className="mx-auto text-purple-400 mb-3 animate-spin-slow" />
            <h3 className="text-2xl font-black text-purple-300 mb-2">ĐIỆN TRÙNG SINH</h3>
            <p className="text-xs text-slate-300 mb-4">
              Trùng Sinh sẽ reset tiền vàng và nâng cấp thường, đổi lấy **Tinh Thể Linh Hồn** vĩnh viễn!
            </p>
            
            <div className="bg-[#0f172a] border border-purple-500/30 p-4 rounded-2xl mb-5 space-y-2 text-left text-xs font-semibold">
              <div className="flex justify-between">
                <span className="text-slate-400">Tiền vàng tích lũy:</span>
                <span className="font-extrabold text-amber-400">{Math.floor(offlineState.money).toLocaleString()} 🪙</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tinh thể hiện có:</span>
                <span className="font-extrabold text-purple-400">💎 {offlineState.soulCrystals || 0}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-purple-800/50">
                <span className="text-purple-200 font-extrabold">Nhận thêm sau Trùng Sinh:</span>
                <span className="font-black text-emerald-400">+${Math.max(1, Math.floor(offlineState.money / 50000))} Tinh thể 💎</span>
              </div>
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
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e293b] border border-amber-500/40 rounded-3xl max-w-lg w-full p-6 text-white text-left shadow-2xl">
            <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Trophy size={24} className="text-amber-400" />
                <h3 className="text-xl font-black text-amber-300">BẢNG THÀNH TỰU</h3>
              </div>
              <button 
                onClick={() => setShowAchievementsModal(false)}
                className="text-slate-400 hover:text-white font-bold text-sm"
              >
                ✕ Đóng
              </button>
            </div>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              <div className="bg-[#0f172a] p-3 rounded-2xl border border-slate-800 flex justify-between items-center">
                <div>
                  <div className="font-extrabold text-sm text-slate-200">👉 Nhấp Nháy Nhẹ Nhàng</div>
                  <div className="text-xs text-slate-400">Đạt 100 lần click tay ({offlineState.totalClicks || 0}/100)</div>
                </div>
                <span className={(offlineState.totalClicks || 0) >= 100 ? 'text-xs font-bold bg-green-900/60 text-green-300 border border-green-700 px-2 py-1 rounded-full' : 'text-xs text-slate-500'}>
                  {(offlineState.totalClicks || 0) >= 100 ? '✓ Đã xong' : 'Đang làm...'}
                </span>
              </div>

              <div className="bg-[#0f172a] p-3 rounded-2xl border border-slate-800 flex justify-between items-center">
                <div>
                  <div className="font-extrabold text-sm text-slate-200">💰 Triệu Phú Clicker</div>
                  <div className="text-xs text-slate-400">Tích lũy 100,000 tổng vàng ({Math.floor(offlineState.totalGoldEarned || 0).toLocaleString()}/100,000)</div>
                </div>
                <span className={(offlineState.totalGoldEarned || 0) >= 100000 ? 'text-xs font-bold bg-green-900/60 text-green-300 border border-green-700 px-2 py-1 rounded-full' : 'text-xs text-slate-500'}>
                  {(offlineState.totalGoldEarned || 0) >= 100000 ? '✓ Đã xong' : 'Đang làm...'}
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

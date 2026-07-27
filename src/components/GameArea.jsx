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
  CheckCircle2,
  Gamepad2
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import PixelButton from './pixel/PixelButton';
import PixelPanel from './pixel/PixelPanel';
import PixelProgressBar from './pixel/PixelProgressBar';
import PixelCurrency from './pixel/PixelCurrency';

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
      sessionStorage.setItem('session_clicker_state_v1', JSON.stringify(freshState));
      localStorage.removeItem('offline_clicker_state_v1');
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
  // BUY UPGRADES (BALANCED COMMERCIAL CLICKER ECONOMY)
  // ----------------------------------------
  const getOfflineUpgradeCost = (baseCost, currentLevel) => {
    // Balanced exponential scaling 1.85x per level to ensure progressive challenge
    return Math.floor(baseCost * Math.pow(1.85, currentLevel));
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

  // Dynamic Theme-Filtered Upgrades System (Rebalanced progressive stats & base costs)
  const getFilteredUpgrades = () => {
    let clickTools = [];
    let autoWorkers = [];

    if (theme === 'wood') {
      clickTools = [
        { key: 'battleAxe', name: 'Rìu Chặt Củi', desc: 'Click +1 DPC', cost: 20, val: 1, isDpc: true, icon: Wrench, statLabel: '+1 DPC' },
        { key: 'crystalAxe', name: 'Rìu Thạch Anh', desc: 'Click +6 DPC', cost: 450, val: 6, isDpc: true, icon: Wrench, statLabel: '+6 DPC' },
        { key: 'mythicSaw', name: 'Cưa Cổ Thụ', desc: 'Click +35 DPC', cost: 4500, val: 35, isDpc: true, icon: Zap, statLabel: '+35 DPC' },
        { key: 'godChainsaw', name: 'Máy Cưa Thần Thoại', desc: 'Click +200 DPC', cost: 45000, val: 200, isDpc: true, icon: Sparkles, statLabel: '+200 DPC' }
      ];
      autoWorkers = [
        { key: 'apprenticeLumberjack', name: 'Tiều Phu Tập Sự', desc: 'Chặt gỗ +1/s auto', cost: 75, val: 1, isDpc: false, icon: Trees, statLabel: '+1/s auto' },
        { key: 'logCart', name: 'Xe Kéo Gỗ Rừng', desc: 'Vận chuyển +12/s auto', cost: 1200, val: 12, isDpc: false, icon: Truck, statLabel: '+12/s auto' },
        { key: 'autoChainsaw', name: 'Máy Cưa Tự Động', desc: 'Chặt đốn +90/s auto', cost: 15000, val: 90, isDpc: false, icon: Factory, statLabel: '+90/s auto' },
        { key: 'lumberYard', name: 'Lâm Trường Siêu Cấp', desc: 'Khai thác +600/s auto', cost: 150000, val: 600, isDpc: false, icon: Factory, statLabel: '+600/s auto' }
      ];
    } else if (theme === 'monster') {
      clickTools = [
        { key: 'clicker', name: 'Găng Tay Sắt', desc: 'Click +1 DPC', cost: 20, val: 1, isDpc: true, icon: MousePointerClick, statLabel: '+1 DPC' },
        { key: 'diamondSword', name: 'Kiếm Kim Cương', desc: 'Click +6 DPC', cost: 450, val: 6, isDpc: true, icon: Swords, statLabel: '+6 DPC' },
        { key: 'godSlayer', name: 'Trảm Thần Đạo', desc: 'Click +35 DPC', cost: 4500, val: 35, isDpc: true, icon: Flame, statLabel: '+35 DPC' },
        { key: 'ultimateRelic', name: 'Thần Khí Tối Thượng', desc: 'Click +200 DPC', cost: 45000, val: 200, isDpc: true, icon: Sparkles, statLabel: '+200 DPC' }
      ];
      autoWorkers = [
        { key: 'apprenticeHero', name: 'Dũng Sĩ Tập Sự', desc: 'Săn quái +1/s auto', cost: 75, val: 1, isDpc: false, icon: Swords, statLabel: '+1/s auto' },
        { key: 'paladinWorker', name: 'Hiệp Sĩ Thánh Điện', desc: 'Đánh quái +12/s auto', cost: 1200, val: 12, isDpc: false, icon: Swords, statLabel: '+12/s auto' },
        { key: 'mageWorker', name: 'Phù Thủy Ma Pháp', desc: 'Chưởng phép +90/s auto', cost: 15000, val: 90, isDpc: false, icon: Sparkles, statLabel: '+90/s auto' },
        { key: 'ancientDragon', name: 'Rồng Thần Cổ Đại', desc: 'Phun lửa +600/s auto', cost: 150000, val: 600, isDpc: false, icon: Flame, statLabel: '+600/s auto' }
      ];
    } else {
      // Default: Stone Mining Theme & Capybara / Button
      clickTools = [
        { key: 'stonePickaxe', name: 'Cuốc Đá Cổ', desc: 'Click +1 DPC', cost: 20, val: 1, isDpc: true, icon: Pickaxe, statLabel: '+1 DPC' },
        { key: 'diamondPickaxe', name: 'Cuốc Kim Cương', desc: 'Click +6 DPC', cost: 450, val: 6, isDpc: true, icon: Gem, statLabel: '+6 DPC' },
        { key: 'laserHammer', name: 'Búa Laze Tinh Thể', desc: 'Click +35 DPC', cost: 4500, val: 35, isDpc: true, icon: Zap, statLabel: '+35 DPC' },
        { key: 'atomicSmasher', name: 'Đập Quặng Hạt Nhân', desc: 'Click +200 DPC', cost: 45000, val: 200, isDpc: true, icon: Sparkles, statLabel: '+200 DPC' }
      ];
      autoWorkers = [
        { key: 'pickaxe', name: 'Steve Thợ Mỏ', desc: 'Đục đá +1/s auto', cost: 75, val: 1, isDpc: false, icon: Pickaxe, statLabel: '+1/s auto' },
        { key: 'minecart', name: 'Xe Goòng Mỏ', desc: 'Khai thác +12/s auto', cost: 1200, val: 12, isDpc: false, icon: ShoppingCart, statLabel: '+12/s auto' },
        { key: 'drill', name: 'Máy Khoan Laze', desc: 'Khai quật +90/s auto', cost: 15000, val: 90, isDpc: false, icon: Wrench, statLabel: '+90/s auto' },
        { key: 'excavator', name: 'Giàn Khoan Siêu Cấp', desc: 'Đào quặng +600/s auto', cost: 150000, val: 600, isDpc: false, icon: Truck, statLabel: '+600/s auto' }
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
      imgSrc = `${import.meta.env.BASE_URL}assets/pixel_red_button.png`;
      imgAlt = 'Red Push Button';
    } else if (theme === 'monster') {
      imgSrc = `${import.meta.env.BASE_URL}assets/pixel_monster.png`;
      imgAlt = 'Monster Boss';
    } else if (theme === 'wood') {
      imgSrc = `${import.meta.env.BASE_URL}assets/pixel_wood.png`;
      imgAlt = 'Tree Stump';
    } else if (theme === 'stone') {
      imgSrc = `${import.meta.env.BASE_URL}assets/pixel_stone.png`;
      imgAlt = 'Crystal Gem Ore';
    }

    return (
      <div className="relative group cursor-pointer select-none flex items-center justify-center">
        {/* 3D Glowing Magical Rune Ring Platform */}
        <div className="rune-platform-glow"></div>

        <img
          src={imgSrc}
          alt={imgAlt}
          className="w-48 h-48 md:w-64 md:h-64 max-w-[280px] max-h-[380px] object-contain mx-auto cartoon-clicker-object pixel-art transition-transform duration-100 z-10 relative drop-shadow-[0_15px_30px_rgba(0,0,0,0.5)] group-hover:scale-105"
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
    <div
      className="w-full max-w-[1440px] mx-auto min-h-screen bg-[#0f172a] text-slate-100 flex flex-col"
      style={{ fontFamily: "'Press Start 2P', 'Silkscreen', monospace" }}
    >

      {/* ═══════════════════════════════════════════════════
          HEADER — Logo | Gold | Diamond | Settings
          ═══════════════════════════════════════════════════ */}
      <header className="w-full bg-[#1e293b] border-b-4 border-black px-4 py-2 flex items-center justify-between sticky top-0 z-30 shadow-[0_4px_0_#000]">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={onLeave}>
          <div className="w-9 h-9 bg-[#78350f] border-2 border-black text-yellow-300 flex items-center justify-center text-base shadow-[2px_2px_0_#000]">
            🎮
          </div>
          <div>
            <div className="text-xs font-black text-amber-400 uppercase leading-none">TAP TAP</div>
            <div className="text-xs font-black text-amber-400 uppercase leading-none">CLICKER</div>
          </div>
        </div>

        {/* Currency HUD */}
        <div className="flex items-center gap-2">
          {/* Gold */}
          <div className="flex items-center gap-1.5 bg-[#0f172a] border-2 border-amber-500 px-2 py-1 shadow-[2px_2px_0_#000]">
            <span className="text-base leading-none">🪙</span>
            <div className="text-left">
              <div className="text-[9px] font-black text-amber-300 leading-none">
                {mode === 'offline'
                  ? formatNumber(Math.floor(offlineState.money))
                  : formatNumber(getMyCompPlayer()?.score || 0)}
              </div>
              <div className="text-[8px] text-amber-500 leading-none">
                +{mode === 'offline'
                  ? formatNumber(offlineState.dps)
                  : formatNumber(roomData?.players.find(p => p.id === socketId)?.dps || 0)}/s
              </div>
            </div>
            <button className="ml-1 w-5 h-5 bg-amber-500 border border-black text-black text-[10px] font-black flex items-center justify-center">+</button>
          </div>

          {/* Diamond */}
          <div className="flex items-center gap-1.5 bg-[#0f172a] border-2 border-purple-500 px-2 py-1 shadow-[2px_2px_0_#000]">
            <span className="text-base leading-none">💎</span>
            <div className="text-[9px] font-black text-purple-300 leading-none">
              {(offlineState.soulCrystals || 0).toLocaleString()}
            </div>
            <button className="ml-1 w-5 h-5 bg-purple-500 border border-black text-white text-[10px] font-black flex items-center justify-center">+</button>
          </div>

          {/* Settings */}
          <button
            onClick={() => setShowSettingsModal(true)}
            className="w-8 h-8 bg-[#1e293b] border-2 border-[#334155] text-slate-300 flex items-center justify-center text-sm shadow-[2px_2px_0_#000] hover:border-amber-400"
          >
            ⚙
          </button>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════
          BODY — 3-column layout: Left(3) | Center(7) | Right(2)
          ═══════════════════════════════════════════════════ */}
      <div className="flex flex-1 gap-3 p-3 items-start overflow-hidden">

        {/* ─── LEFT SIDEBAR (nav items) ─── */}
        <aside className="hidden lg:flex flex-col gap-1.5 w-[160px] shrink-0">
          {[
            { id: 'home',         icon: '🏠', label: 'BẤM',     sub: 'Trang chủ',  variant: 'gold' },
            { id: 'upgrades',     icon: '⚔️', label: 'NÂNG CẤP', sub: 'Sức mạnh',  variant: 'purple' },
            { id: 'items',        icon: '🎒', label: 'ĐỒ VẬT',  sub: 'Vật phẩm',  variant: 'blue' },
            { id: 'achievements', icon: '🏆', label: 'THÀNH TÍCH', sub: 'Thành tích', variant: 'gold' },
            { id: 'shop',         icon: '🛒', label: 'CỬA HÀNG', sub: 'Mua bán',    variant: 'green' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (item.id === 'achievements') setShowAchievementsModal(true);
              }}
              className={`w-full flex items-center gap-2 px-2 py-2 border-2 text-left shadow-[2px_2px_0_#000] active:translate-y-0.5 transition-transform
                ${activeTab === item.id
                  ? 'bg-amber-500 border-amber-300 text-black'
                  : 'bg-[#1e293b] border-[#334155] text-slate-300 hover:border-amber-400'
                }`}
            >
              <span className="text-base w-5 text-center leading-none">{item.icon}</span>
              <div>
                <div className="text-[9px] font-black uppercase leading-none">{item.label}</div>
                <div className="text-[8px] text-current opacity-70 leading-none mt-0.5">{item.sub}</div>
              </div>
            </button>
          ))}
        </aside>

        {/* ─── CENTER GAMEPLAY ARENA ─── */}
        <main className="flex-1 min-w-0 flex flex-col bg-[#0f172a] border-2 border-[#1e293b] relative overflow-hidden" style={{ minHeight: 560 }}>

          {/* Floating damage texts */}
          {floatingTexts.map(t => (
            <span
              key={t.id}
              className="floating-text pointer-events-none"
              style={{ left: `${t.x}%`, top: `${t.y}%`, color: t.color }}
            >
              {t.text}
            </span>
          ))}

          {/* ── Top: SẮC NỔ label + energy bar ── */}
          <div className="flex flex-col items-center gap-1.5 pt-3 px-4">
            <span className="text-[9px] font-black text-amber-300 bg-[#1e293b] border-2 border-amber-500 px-3 py-0.5 uppercase shadow-[2px_2px_0_#000]">
              ⚡ SẮC NỔ
            </span>

            {/* Energy bar row */}
            <div className="w-full max-w-md">
              <div className="flex justify-between text-[8px] font-black mb-1">
                <span className="text-blue-400">🔥 THANH NỘ BỔ TRỢ (x2)</span>
                <span className="text-amber-400">{isMultiplierActive ? 'X2!' : `${energy}%`}</span>
              </div>
              <div className="w-full h-3 bg-[#1e293b] border-2 border-[#334155] overflow-hidden">
                <div
                  className={`h-full transition-all duration-200 ${isMultiplierActive ? 'bg-purple-500 animate-pulse' : 'bg-blue-500'}`}
                  style={{ width: `${isMultiplierActive ? (multiplierTimer / 6) * 100 : energy}%` }}
                />
              </div>
            </div>

            {/* Skill buttons */}
            <div className="flex gap-2 flex-wrap justify-center">
              <button
                onClick={handleActivateFrenzy}
                disabled={frenzyCd > 0 || frenzyActive}
                className={`px-2 py-1 border-2 text-[8px] font-black uppercase shadow-[2px_2px_0_#000] active:translate-y-0.5 transition-transform
                  ${frenzyActive ? 'bg-red-600 border-red-400 text-white animate-pulse'
                    : frenzyCd > 0 ? 'bg-[#1e293b] border-[#334155] text-slate-500 cursor-not-allowed'
                    : 'bg-rose-900 border-rose-500 text-rose-300 hover:border-rose-300'}`}
              >
                🔥 Cuồng Phong (x2 DPC){frenzyActive ? ` ${frenzyTimer}s` : frenzyCd > 0 ? ` (${frenzyCd}s)` : ''}
              </button>
              <button
                onClick={handleActivateGoldenRush}
                disabled={goldenRushCd > 0}
                className={`px-2 py-1 border-2 text-[8px] font-black uppercase shadow-[2px_2px_0_#000] active:translate-y-0.5 transition-transform
                  ${goldenRushCd > 0 ? 'bg-[#1e293b] border-[#334155] text-slate-500 cursor-not-allowed'
                    : 'bg-amber-900 border-amber-500 text-amber-300 hover:border-amber-300'}`}
              >
                ⚡ Bão Vàng{goldenRushCd > 0 ? ` (${goldenRushCd}s)` : ''}
              </button>
            </div>
          </div>

          {/* ── Center: Monster sprite ── */}
          <div
            onClick={handleTap}
            className={`flex-1 flex items-center justify-center cursor-pointer select-none relative ${clickShake ? 'click-shake' : ''}`}
            style={{ minHeight: 220 }}
          >
            {/* Rune platform glow */}
            <div className="rune-platform-glow absolute bottom-6 left-1/2 -translate-x-1/2" />
            {renderClickObject()}
          </div>

          {/* ── Bottom: Click Power + BẤM NGAY ── */}
          <div className="flex flex-col items-center gap-2 pb-4 px-4">
            <div className="text-center">
              <div className="text-[8px] text-slate-400 uppercase">Click Power</div>
              <div className="text-2xl font-black text-white drop-shadow-[2px_2px_0_#000]">
                +{mode === 'offline' ? offlineState.dpc : (getMyCompPlayer()?.dpc || 1)}
              </div>
              <div className="text-[8px] text-purple-400">⚒ Nâng Cấp Công Cụ Click</div>
            </div>

            {/* BẤM NGAY */}
            <button
              onClick={handleTap}
              className="bg-amber-400 border-b-4 border-amber-700 border-2 border-amber-300 text-black text-sm font-black px-10 py-3 uppercase shadow-[4px_4px_0_#000] hover:bg-amber-300 active:translate-y-1 active:border-b-2 transition-all"
            >
              👆 BẤM NGAY
            </button>
          </div>
        </main>

        {/* ─── RIGHT SIDEBAR (boost cards) ─── */}
        <aside className="hidden lg:flex flex-col gap-3 w-[110px] shrink-0">
          {/* Boost x2 */}
          <div className="bg-[#1e293b] border-2 border-purple-500 p-2 flex flex-col items-center text-center shadow-[3px_3px_0_#000]">
            <div className="w-10 h-10 bg-[#3b0764] border-2 border-purple-400 text-purple-200 flex items-center justify-center font-black text-base mb-1 shadow-[2px_2px_0_#000]">
              x2
            </div>
            <div className="text-[8px] text-purple-300 font-black">23:45:12</div>
            <div className="text-[8px] text-white font-black uppercase mt-0.5">BOOST X2</div>
          </div>

          {/* Daily Gift */}
          <div className="bg-[#1e293b] border-2 border-amber-500 p-2 flex flex-col items-center text-center shadow-[3px_3px_0_#000] cursor-pointer hover:border-amber-300">
            <div className="w-10 h-10 bg-[#78350f] border-2 border-amber-400 text-amber-300 flex items-center justify-center text-lg mb-1 shadow-[2px_2px_0_#000]">
              🎁
            </div>
            <div className="text-[9px] text-amber-400 font-black uppercase">QUÀ NGÀY</div>
            <div className="text-[8px] text-slate-400 font-black mt-0.5">Nhận quà</div>
          </div>
        </aside>
      </div>

      {/* ═══════════════════════════════════════════════════
          BOTTOM UPGRADE CARDS GRID (4 columns)
          ═══════════════════════════════════════════════════ */}
      <section className="w-full px-3 pb-6 mt-2">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b-2 border-[#1e293b]">
          <span className="text-amber-400 text-sm">⚡</span>
          <h3 className="text-[9px] font-black text-white uppercase">DANH SÁCH NÂNG CẤP THẦN KHÍ</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {mode === 'offline' && (() => {
            const { clickTools, autoWorkers } = getFilteredUpgrades();
            return [...clickTools, ...autoWorkers].map(up => {
              const IconComp = up.icon;
              const curLvl = offlineState.upgrades[up.key] || 0;
              const cost = getOfflineUpgradeCost(up.cost, curLvl);
              const canAfford = offlineState.money >= cost;
              return (
                <div
                  key={up.key}
                  className={`bg-[#1e293b] border-2 border-[#334155] p-3 flex flex-col gap-2 shadow-[3px_3px_0_#000] ${!canAfford ? 'opacity-70' : 'hover:border-amber-400'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="w-9 h-9 bg-[#0f172a] border-2 border-[#334155] flex items-center justify-center text-amber-400">
                      <IconComp size={18} />
                    </div>
                    <span className="text-[8px] font-black bg-[#3b0764] text-purple-300 border border-purple-500 px-1.5 py-0.5 uppercase">
                      Lv. {curLvl}
                    </span>
                  </div>

                  <div>
                    <div className="text-[9px] font-black text-white uppercase truncate">{up.name}</div>
                    <div className="text-[9px] text-purple-400 font-black">{up.statLabel}</div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 bg-[#0f172a] border border-[#334155]">
                    <div
                      className="h-full bg-amber-400 transition-all"
                      style={{ width: `${Math.min(100, (offlineState.money / cost) * 100)}%` }}
                    />
                  </div>

                  {/* Buy button */}
                  <button
                    onClick={() => buyOfflineUpgrade(up.key, up.isDpc, up.val, up.cost)}
                    disabled={!canAfford}
                    className={`w-full py-1.5 text-[9px] font-black uppercase border-2 shadow-[2px_2px_0_#000] active:translate-y-0.5 transition-transform flex items-center justify-center gap-1
                      ${canAfford
                        ? 'bg-green-600 border-green-400 text-white hover:bg-green-500'
                        : 'bg-[#0f172a] border-[#334155] text-slate-500 cursor-not-allowed'}`}
                  >
                    🪙 {cost.toLocaleString()}
                  </button>
                </div>
              );
            });
          })()}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          MODALS
          ═══════════════════════════════════════════════════ */}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e293b] border-4 border-[#334155] w-full max-w-sm p-5 shadow-[6px_6px_0_#000]" style={{ fontFamily: "'Silkscreen', monospace" }}>
            <h3 className="text-sm font-black text-white mb-4 uppercase text-center">⚙ CÀI ĐẶT GAME</h3>
            <div className="flex flex-col gap-2 mb-4">
              <button onClick={handleToggleSound} className="w-full bg-[#0f172a] border-2 border-[#334155] p-2.5 flex justify-between text-xs font-black text-white hover:border-amber-400">
                <span>Âm thanh hiệu ứng</span>
                <span>{muted ? '🔇' : '🔊'}</span>
              </button>
              {mode === 'offline' && <>
                <button onClick={() => { setShowSettingsModal(false); setShowRebirthModal(true); }} className="w-full bg-[#0f172a] border-2 border-purple-700 p-2.5 flex justify-between text-xs font-black text-purple-300 hover:border-purple-400">
                  <span>Điện Trùng Sinh</span>
                  <span>🔄</span>
                </button>
                <button onClick={handleResetGameData} className="w-full bg-[#0f172a] border-2 border-amber-700 p-2.5 flex justify-between text-xs font-black text-amber-300 hover:border-amber-400">
                  <span>🔄 Reset Chơi Lại Từ Đầu</span>
                  <span>⚠</span>
                </button>
              </>}
              <button onClick={onLeave} className="w-full bg-[#0f172a] border-2 border-rose-700 p-2.5 flex justify-between text-xs font-black text-rose-300 hover:border-rose-400">
                <span>Thoát ra Menu chính</span>
                <span>←</span>
              </button>
            </div>
            <button onClick={() => setShowSettingsModal(false)} className="w-full bg-[#334155] border-2 border-slate-600 text-white text-xs font-black py-2 hover:bg-slate-600">Đóng</button>
          </div>
        </div>
      )}

      {/* Rebirth Modal */}
      {showRebirthModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e293b] border-4 border-purple-500 w-full max-w-md p-5 shadow-[6px_6px_0_#000]" style={{ fontFamily: "'Silkscreen', monospace" }}>
            <h3 className="text-sm font-black text-purple-300 mb-2 uppercase text-center">⚡ ĐIỆN TRÙNG SINH</h3>
            <p className="text-[9px] text-slate-300 mb-4 text-center">Reset tiền vàng & nâng cấp để đổi lấy Tinh Thể Linh Hồn vĩnh viễn!</p>
            <div className="bg-[#0f172a] border-2 border-purple-700 p-3 mb-4 flex flex-col gap-1.5 text-[9px] font-black">
              <div className="flex justify-between"><span className="text-slate-400">Tiền vàng:</span><span className="text-amber-400">{Math.floor(offlineState.money).toLocaleString()} 🪙</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Tinh thể hiện có:</span><span className="text-purple-400">💎 {offlineState.soulCrystals || 0}</span></div>
              <div className="flex justify-between pt-1 border-t border-purple-800"><span className="text-purple-200">Nhận thêm:</span><span className="text-green-400">+{Math.max(1, Math.floor(offlineState.money / 50000))} 💎</span></div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowRebirthModal(false)} className="flex-1 bg-[#334155] border-2 border-slate-600 text-white text-xs font-black py-2 hover:bg-slate-600">Hủy</button>
              <button onClick={handlePerformRebirth} disabled={offlineState.money < 50000} className="flex-1 bg-purple-600 border-2 border-purple-400 text-white text-xs font-black py-2 disabled:opacity-50 hover:bg-purple-500">Trùng Sinh!</button>
            </div>
          </div>
        </div>
      )}

      {/* Achievements Modal */}
      {showAchievementsModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e293b] border-4 border-amber-500 w-full max-w-lg p-5 shadow-[6px_6px_0_#000]" style={{ fontFamily: "'Silkscreen', monospace" }}>
            <div className="flex justify-between items-center mb-4 pb-2 border-b-2 border-[#334155]">
              <h3 className="text-xs font-black text-amber-300 uppercase">🏆 BẢNG THÀNH TỰU</h3>
              <button onClick={() => setShowAchievementsModal(false)} className="text-slate-400 hover:text-white text-xs font-black">✕</button>
            </div>
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
              {[
                { label: '👉 Nhấp Nháy Nhẹ Nhàng', desc: `Đạt 100 lần click (${offlineState.totalClicks || 0}/100)`, done: (offlineState.totalClicks || 0) >= 100 },
                { label: '💰 Triệu Phú Clicker', desc: `Tích lũy 100,000 vàng (${Math.floor(offlineState.totalGoldEarned || 0).toLocaleString()}/100,000)`, done: (offlineState.totalGoldEarned || 0) >= 100000 },
              ].map((a, i) => (
                <div key={i} className="bg-[#0f172a] border-2 border-[#334155] p-3 flex justify-between items-center">
                  <div>
                    <div className="text-[9px] font-black text-slate-200">{a.label}</div>
                    <div className="text-[8px] text-slate-400">{a.desc}</div>
                  </div>
                  <span className={`text-[8px] font-black px-2 py-0.5 border ${a.done ? 'bg-green-900 border-green-600 text-green-300' : 'text-slate-500 border-transparent'}`}>
                    {a.done ? '✓ Xong' : '...'}
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

export default GameArea;

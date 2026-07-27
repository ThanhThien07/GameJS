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
    <div className="w-full max-w-[1440px] mx-auto min-h-screen bg-[#0f172a] text-slate-100 flex flex-col font-['Silkscreen',monospace] relative pb-12 overflow-x-hidden">
      {/* 1. HEADER RESOURCE BAR (TOP - RETRO PIXEL ART HUD) */}
      <header className="w-full bg-[#1e293b] border-b-4 border-[#0f172a] px-4 md:px-8 py-3 flex items-center justify-between z-30 sticky top-0 shadow-[0_4px_0px_#000000] font-['Silkscreen',monospace]">
        {/* Left: Branding Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={onLeave}>
          <div className="w-9 h-9 border-2 border-[#0f172a] bg-[#78350f] text-[#fef08a] flex items-center justify-center font-bold text-lg shadow-[2px_2px_0px_#000000]">
            🎮
          </div>
          <div>
            <h1 className="text-sm md:text-base font-black tracking-wider text-amber-400 uppercase leading-none drop-shadow-[1px_1px_0px_#000000]">
              TAP TAP CLICKER
            </h1>
            <span className="text-[9px] text-purple-400 font-extrabold tracking-widest block uppercase mt-0.5">
              PIXEL MULTIPLAYER
            </span>
          </div>
        </div>

        {/* Center / Right: Resource Badges & Settings */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Gold Badge */}
          <PixelCurrency
            icon="🪙"
            amount={mode === 'offline' ? formatNumber(Math.floor(offlineState.money)) : formatNumber(getMyCompPlayer()?.score || 0)}
            rate={`+${mode === 'offline' ? formatNumber(offlineState.dps) : formatNumber(roomData?.players.find(p => p.id === socketId)?.dps || 0)}/s`}
            variant="gold"
          />

          {/* Diamond Badge */}
          <PixelCurrency
            icon="💎"
            amount={offlineState.soulCrystals ? offlineState.soulCrystals.toLocaleString() : '1,250'}
            variant="purple"
          />

          {/* Settings Gear Button */}
          <PixelButton
            onClick={() => setShowSettingsModal(true)}
            variant="dark"
            size="sm"
            title="Cài đặt"
          >
            ⚙️
          </PixelButton>
        </div>
      </header>

      {/* 2. MAIN LAYOUT CONTAINER (SIDEBAR + GAME ARENA + BOOST CARDS) */}
      <div className="w-full flex flex-col md:flex-row flex-1 p-3 md:p-6 gap-6 items-start">
        
        {/* LEFT SIDEBAR NAVIGATION MENU (PIXEL ICON TOOLTIP BAR) */}
        <aside className="w-full md:w-[180px] shrink-0 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 z-20 font-['Silkscreen',monospace]">
          <PixelButton
            onClick={() => setActiveTab('home')}
            variant={activeTab === 'home' ? 'gold' : 'dark'}
            size="md"
            className="w-full justify-start"
            title="Trang chủ"
          >
            🏠 TRANG CHỦ
          </PixelButton>

          <PixelButton
            onClick={() => setActiveTab('upgrades')}
            variant={activeTab === 'upgrades' ? 'purple' : 'dark'}
            size="md"
            className="w-full justify-start"
            title="Nâng cấp sức mạnh"
          >
            ⚔️ NÂNG CẤP
          </PixelButton>

          <PixelButton
            onClick={() => setActiveTab('items')}
            variant={activeTab === 'items' ? 'blue' : 'dark'}
            size="md"
            className="w-full justify-start"
            title="Túi đồ & vật phẩm"
          >
            🎒 VẬT PHẨM
          </PixelButton>

          <PixelButton
            onClick={() => {
              setActiveTab('achievements');
              setShowAchievementsModal(true);
            }}
            variant={activeTab === 'achievements' ? 'gold' : 'dark'}
            size="md"
            className="w-full justify-start"
            title="Thành tựu"
          >
            🏆 THÀNH TÍCH
          </PixelButton>

          <PixelButton
            onClick={() => setActiveTab('shop')}
            variant={activeTab === 'shop' ? 'green' : 'dark'}
            size="md"
            className="w-full justify-start"
            title="Cửa hàng"
          >
            🛒 CỬA HÀNG
          </PixelButton>
        </aside>

        {/* CENTER MAIN GAMEPLAY ARENA & DYNAMIC TAB VIEWS */}
        {activeTab === 'items' ? (
          <main className="flex-1 w-full bg-[#1e293b]/60 border border-slate-800 rounded-3xl p-4 md:p-6 flex flex-col justify-between relative min-h-[520px]">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Package size={22} className="text-pink-400" />
                <h3 className="text-xl font-black text-white uppercase tracking-wider">TÚI ĐỒ & VẬT PHẨM</h3>
              </div>
              <span className="text-xs text-slate-400 font-bold">Vật phẩm sở hữu</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
              <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-900/40 border border-purple-500/40 text-purple-300 flex items-center justify-center font-black text-xl">
                    🔮
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">Tinh Thể Linh Hồn</h4>
                    <span className="text-xs text-purple-400 font-bold">Sở hữu: {offlineState.soulCrystals || 0} 💎</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowRebirthModal(true)}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-black text-xs px-3 py-2 rounded-xl"
                >
                  Trùng Sinh
                </button>
              </div>

              <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-rose-900/40 border border-rose-500/40 text-rose-300 flex items-center justify-center font-black text-xl">
                    🧪
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">Bình Thuốc Nộ (x2 DPC)</h4>
                    <span className="text-xs text-rose-400 font-bold">{frenzyActive ? 'Đang kích hoạt!' : 'Sẵn sàng dùng'}</span>
                  </div>
                </div>
                <button
                  onClick={handleActivateFrenzy}
                  disabled={frenzyCd > 0 || frenzyActive}
                  className="bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-black text-xs px-3 py-2 rounded-xl"
                >
                  Sử Dụng
                </button>
              </div>

              <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-900/40 border border-amber-500/40 text-amber-300 flex items-center justify-center font-black text-xl">
                    ⚡
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">Bùa Bão Vàng</h4>
                    <span className="text-xs text-amber-400 font-bold">Thưởng vàng bão tức thì</span>
                  </div>
                </div>
                <button
                  onClick={handleActivateGoldenRush}
                  disabled={goldenRushCd > 0}
                  className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-black text-xs px-3 py-2 rounded-xl"
                >
                  Sử Dụng
                </button>
              </div>

              <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-900/40 border border-emerald-500/40 text-emerald-300 flex items-center justify-center font-black text-xl">
                    🎁
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">Rương Thần Khí</h4>
                    <span className="text-xs text-emerald-400 font-bold">Quà thưởng hàng ngày</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setOfflineState(prev => ({ ...prev, money: prev.money + 500 }));
                    spawnFloatingText('+500💰 HÀNG NGÀY!', 50, 40, '#10b981');
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-3 py-2 rounded-xl"
                >
                  Mở Rương
                </button>
              </div>
            </div>
          </main>
        ) : activeTab === 'shop' ? (
          <main className="flex-1 w-full bg-[#1e293b]/60 border border-slate-800 rounded-3xl p-4 md:p-6 flex flex-col justify-between relative min-h-[520px]">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Store size={22} className="text-emerald-400" />
                <h3 className="text-xl font-black text-white uppercase tracking-wider">CỬA HÀNG THẦN KHÍ</h3>
              </div>
              <span className="text-xs text-amber-400 font-bold">Vàng: {Math.floor(offlineState.money).toLocaleString()} 🪙</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
              <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-rose-900/40 border border-rose-500/40 text-rose-300 flex items-center justify-center font-black text-2xl mb-2">
                  🧪
                </div>
                <h4 className="font-extrabold text-sm text-white mb-1">Bình Nộ Cuồng Phong</h4>
                <p className="text-xs text-slate-400 mb-3">x2 DPC trong 30s</p>
                <button
                  onClick={() => {
                    if (offlineState.money >= 500) {
                      setOfflineState(prev => ({ ...prev, money: prev.money - 500 }));
                      handleActivateFrenzy();
                    } else {
                      alert('Không đủ tiền!');
                    }
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs py-2 rounded-xl"
                >
                  Mua (500 🪙)
                </button>
              </div>

              <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-amber-900/40 border border-amber-500/40 text-amber-300 flex items-center justify-center font-black text-2xl mb-2">
                  ⚡
                </div>
                <h4 className="font-extrabold text-sm text-white mb-1">Cơn Mưa Vàng</h4>
                <p className="text-xs text-slate-400 mb-3">+5,000 Vàng tức thì</p>
                <button
                  onClick={() => {
                    if ((offlineState.soulCrystals || 0) >= 2) {
                      setOfflineState(prev => ({ 
                        ...prev, 
                        soulCrystals: prev.soulCrystals - 2,
                        money: prev.money + 5000 
                      }));
                      spawnFloatingText('+5,000💰!', 50, 40, '#eab308');
                    } else {
                      alert('Không đủ Tinh thể!');
                    }
                  }}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs py-2 rounded-xl"
                >
                  Mua (2 💎)
                </button>
              </div>

              <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-purple-900/40 border border-purple-500/40 text-purple-300 flex items-center justify-center font-black text-2xl mb-2">
                  📜
                </div>
                <h4 className="font-extrabold text-sm text-white mb-1">Bùa Sát Thương Vĩnh Viễn</h4>
                <p className="text-xs text-slate-400 mb-3">Tăng vĩnh viễn +20 DPC</p>
                <button
                  onClick={() => {
                    if ((offlineState.soulCrystals || 0) >= 5) {
                      setOfflineState(prev => ({ 
                        ...prev, 
                        soulCrystals: prev.soulCrystals - 5,
                        dpc: prev.dpc + 20 
                      }));
                      spawnFloatingText('+20 DPC VĨNH VIỄN!', 50, 40, '#8b5cf6');
                    } else {
                      alert('Không đủ Tinh thể!');
                    }
                  }}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black text-xs py-2 rounded-xl"
                >
                  Mua (5 💎)
                </button>
              </div>
            </div>
          </main>
        ) : (
          <PixelPanel className="flex-1 w-full flex flex-col items-center justify-between relative overflow-hidden min-h-[520px] font-['Silkscreen',monospace]">
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
              <span className="text-[9px] font-bold text-amber-400 bg-[#78350f] border-2 border-amber-500 px-3 py-0.5 uppercase tracking-wider">
                ⚡ SẮC NỔ ACTIVE ⚡
              </span>

              {/* Pixel Energy / Frenzy Bar */}
              <PixelProgressBar
                value={isMultiplierActive ? multiplierTimer : energy}
                max={isMultiplierActive ? 6 : 100}
                label="🔥 THANH NỘ BỔ TRỢ (x2)"
                variant={isMultiplierActive ? 'purple' : 'gold'}
                height="h-3.5"
                className="w-full"
              />

              {/* Buff Tags */}
              <div className="flex gap-2 text-xs font-bold mt-1">
                <PixelButton
                  onClick={handleActivateFrenzy}
                  disabled={frenzyCd > 0 || frenzyActive}
                  variant={frenzyActive ? 'red' : 'dark'}
                  size="sm"
                >
                  🔥 Cuồng Phong (x2 DPC) {frenzyActive ? `${frenzyTimer}s` : frenzyCd > 0 ? `(${frenzyCd}s)` : ''}
                </PixelButton>

                <PixelButton
                  onClick={handleActivateGoldenRush}
                  disabled={goldenRushCd > 0}
                  variant="gold"
                  size="sm"
                >
                  ⚡ Bão Vàng {goldenRushCd > 0 ? `(${goldenRushCd}s)` : ''}
                </PixelButton>
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
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Click Power</span>
                <span className="text-2xl md:text-3xl font-black text-white tracking-wide block drop-shadow-[2px_2px_0px_#000000]">
                  +{mode === 'offline' ? offlineState.dpc : (getMyCompPlayer()?.dpc || 1)}
                </span>
                <span className="text-[10px] text-purple-300 font-bold flex items-center justify-center gap-1 mt-0.5">
                  ⚒️ Nâng Cấp Công Cụ Click
                </span>
              </div>

              {/* GIANT GOLD PRIMARY CLICK BUTTON (MATCHING MOCKUP "BẤM NGAY") */}
              <PixelButton
                onClick={handleTap}
                variant="gold"
                size="xl"
                className="cta-gold-button text-lg py-3.5 px-10 shadow-2xl flex items-center justify-center gap-2 cursor-pointer active:translate-y-1"
              >
                👆 BẤM NGAY
              </PixelButton>
            </div>
          </PixelPanel>
        )}

        {/* RIGHT SIDE UTILITY BOOST CARDS (MATCHING MOCKUP RIGHT CARDS) */}
        <aside className="w-full md:w-[150px] shrink-0 flex flex-row md:flex-col gap-4 justify-center font-['Silkscreen',monospace]">
          {/* Boost x2 Card */}
          <PixelPanel className="flex-1 p-3 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 bg-[#3b0764] border-2 border-purple-500 text-purple-300 flex items-center justify-center font-bold text-base mb-2">
              x2
            </div>
            <span className="text-[9px] text-purple-300 font-bold">23:45:12</span>
            <span className="text-[10px] text-white font-bold mt-0.5 uppercase">BOOST X2</span>
          </PixelPanel>

          {/* Daily Gift Card */}
          <PixelPanel className="flex-1 p-3 flex flex-col items-center justify-center text-center cursor-pointer hover:border-amber-400">
            <div className="w-10 h-10 bg-[#78350f] border-2 border-amber-500 text-amber-400 flex items-center justify-center text-lg mb-2">
              🎁
            </div>
            <span className="text-[10px] text-amber-400 font-bold uppercase">QUÀ NGÀY</span>
            <span className="text-[8px] text-slate-400 font-bold mt-0.5">Nhận quà</span>
          </PixelPanel>
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
                <PixelPanel
                  key={up.key}
                  className={`flex flex-col justify-between text-left font-['Silkscreen',monospace] ${!canAfford ? 'opacity-75' : ''}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-10 h-10 bg-[#0f172a] border-2 border-[#334155] flex items-center justify-center text-amber-400 font-bold">
                      <IconComp size={20} />
                    </div>
                    <span className="text-[9px] font-bold bg-[#3b0764] text-purple-300 border-2 border-purple-500 px-2 py-0.5 uppercase">
                      Lv. {curLvl}
                    </span>
                  </div>

                  <div className="mb-2">
                    <h4 className="font-bold text-xs text-white mb-0.5 truncate uppercase">
                      {up.name}
                    </h4>
                    <span className="text-[10px] font-bold text-purple-400 block">{up.statLabel}</span>
                  </div>

                  {/* Pixel Progress Bar inside Card */}
                  <PixelProgressBar
                    value={offlineState.money}
                    max={cost}
                    height="h-2"
                    variant="gold"
                    className="mb-3"
                  />

                  {/* Price Button Badge */}
                  <PixelButton
                    onClick={() => buyOfflineUpgrade(up.key, up.isDpc, up.val, up.cost)}
                    disabled={!canAfford}
                    variant={canAfford ? 'green' : 'dark'}
                    size="sm"
                    className="w-full"
                  >
                    🪙 {cost.toLocaleString()}
                  </PixelButton>
                </PixelPanel>
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

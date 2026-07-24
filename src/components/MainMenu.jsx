import React, { useState } from 'react';
import PixelButton from './pixel/PixelButton';
import PixelPanel from './pixel/PixelPanel';

function MainMenu({
  isOnline,
  playerName,
  onSaveName,
  onSelectOffline,
  onSelectOnlineComp,
  onSelectOnlineCoop,
  onJoinRoom
}) {
  const [nameInput, setNameInput] = useState(playerName || '');
  const [codeInput, setCodeInput] = useState('');
  const [isEditingName, setIsEditingName] = useState(!playerName);
  const [showJoinInput, setShowJoinInput] = useState(false);

  const handleSave = (e) => {
    if (e) e.preventDefault();
    if (nameInput.trim()) {
      onSaveName(nameInput.trim());
      setIsEditingName(false);
    }
  };

  const ensureNameSaved = () => {
    if (isEditingName || nameInput.trim() !== playerName) {
      const finalName = nameInput.trim() || 'Người chơi 1';
      onSaveName(finalName);
      setNameInput(finalName);
      setIsEditingName(false);
    }
  };

  const handleSelectOffline = () => {
    ensureNameSaved();
    onSelectOffline();
  };

  const handleSelectOnlineComp = () => {
    ensureNameSaved();
    onSelectOnlineComp();
  };

  const handleSelectOnlineCoop = () => {
    ensureNameSaved();
    onSelectOnlineCoop();
  };

  const triggerJoin = (e) => {
    e.preventDefault();
    ensureNameSaved();
    if (codeInput.trim().length === 6) {
      onJoinRoom(codeInput.trim().toUpperCase());
    } else {
      alert('Mã phòng phải gồm 6 ký tự!');
    }
  };

  return (
    <div className="w-full min-h-[85vh] flex flex-col items-center justify-center py-6 px-4">
      {/* RETRO PIXEL RPG START WINDOW PANEL */}
      <PixelPanel className="w-full max-w-md p-6 text-center">
        
        {/* 1. TOP HEADER LOGO & TITLE SECTION */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 border-4 border-[#0f172a] bg-[#78350f] text-[#fef08a] flex items-center justify-center shadow-[4px_4px_0px_#000000] mb-3 animate-bounce-slow text-2xl font-bold">
            🎮
          </div>
          <h1 className="font-['Silkscreen',monospace] text-2xl md:text-3xl font-black text-amber-400 uppercase mb-1 drop-shadow-[2px_2px_0px_#000000]">
            TAP TAP CLICKER
          </h1>
          <p className="font-['Silkscreen',monospace] text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            RETRO PIXEL RPG • QUÁI ⚔️ • GỖ 🪵 • ĐÁ 🪨
          </p>
        </div>

        {/* 2. FORM & MAIN ACTION BUTTONS */}
        <div className="w-full space-y-4 mb-5 text-left font-['Silkscreen',monospace]">
          {/* Nickname Input Field */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 pl-1">
              👾 BIỆT DANH ANH HÙNG
            </label>
            <div className="flex items-center gap-2 bg-[#0f172a] border-4 border-[#334155] px-3 py-2 shadow-[inset_2px_2px_0px_#000000]">
              <span className="text-amber-400 text-sm">👤</span>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onBlur={handleSave}
                placeholder="Nhập tên..."
                className="bg-transparent border-none outline-none text-white w-full font-bold text-xs placeholder-slate-500 font-['Silkscreen',monospace]"
                maxLength={16}
              />
            </div>
          </div>

          {/* Primary CTA Button: PLAY OFFLINE */}
          <PixelButton
            onClick={handleSelectOffline}
            disabled={!nameInput.trim()}
            variant="gold"
            size="lg"
            className="w-full"
          >
            ▶️ BẮT ĐẦU CHƠI (OFFLINE)
          </PixelButton>

          {/* Secondary Action Buttons: Competitive & Co-op */}
          {isOnline ? (
            <div className="grid grid-cols-2 gap-2">
              <PixelButton
                onClick={handleSelectOnlineComp}
                disabled={!nameInput.trim()}
                variant="purple"
                size="sm"
                className="w-full"
              >
                ⚔️ ĐẤU TRƯỜNG 1v1
              </PixelButton>

              <PixelButton
                onClick={handleSelectOnlineCoop}
                disabled={!nameInput.trim()}
                variant="blue"
                size="sm"
                className="w-full"
              >
                ✨ HỢP TÁC
              </PixelButton>
            </div>
          ) : (
            <div className="text-[10px] text-rose-400 bg-rose-950/60 border-2 border-rose-800 py-2 px-3 font-bold flex items-center justify-center gap-1.5">
              ⚠️ Mở kết nối mạng để chơi Online
            </div>
          )}
        </div>

        {/* 3. BOTTOM JOIN ROOM CODE BADGE */}
        {isOnline && (
          <div className="w-full border-t-2 border-[#334155] pt-3.5 text-center font-['Silkscreen',monospace]">
            {!showJoinInput ? (
              <button
                onClick={() => setShowJoinInput(true)}
                className="text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center justify-center gap-1 mx-auto hover:underline cursor-pointer"
              >
                🔑 Có mã phòng? Nhập ngay
              </button>
            ) : (
              <form onSubmit={triggerJoin} className="flex gap-2 items-center justify-center">
                <input
                  type="text"
                  placeholder="Mã 6 số..."
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="bg-[#0f172a] border-2 border-[#334155] px-3 py-1.5 text-center font-bold tracking-widest text-amber-400 text-xs outline-none focus:border-amber-500 flex-1 font-['Silkscreen',monospace]"
                />
                <PixelButton
                  type="submit"
                  disabled={codeInput.trim().length !== 6}
                  variant="green"
                  size="sm"
                >
                  VÀO
                </PixelButton>
              </form>
            )}
          </div>
        )}

      </PixelPanel>

      {/* FOOTER CREDIT TAG */}
      <footer className="mt-4 text-[10px] text-slate-500 font-['Silkscreen',monospace] font-bold text-center">
        Nguyễn Hoàng Hùng (501250384) — Pixel Art RPG Clicker Multiplayer
      </footer>
    </div>
  );
}

export default MainMenu;

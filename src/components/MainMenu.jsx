import React, { useState } from 'react';
import { User, Play, ShieldAlert, Gamepad2, Sparkles, Swords, Key, Trophy } from 'lucide-react';

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
      {/* AAA CLEAN START SCREEN CARD (MONSTER REMOVED AS REQUESTED) */}
      <div className="w-full max-w-md bg-[#1e293b]/95 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-700/80 text-slate-100 flex flex-col items-center text-center animate-in zoom-in-95 duration-200 relative overflow-hidden">
        
        {/* Glow Halo behind Logo */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-64 bg-purple-600/30 rounded-full blur-3xl pointer-events-none"></div>

        {/* 1. TOP HEADER LOGO & TITLE SECTION */}
        <div className="flex flex-col items-center mb-6 z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 mb-3 animate-bounce-slow">
            <Gamepad2 size={36} />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight uppercase mb-1 drop-shadow-md">
            TAP TAP <span className="gradient-text">CLICKER</span>
          </h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            Siêu Clicker Tam Hợp • Đánh Quái ⚔️ • Chặt Gỗ 🪵 • Đào Đá 🪨
          </p>
        </div>

        {/* 2. FORM & MAIN ACTION BUTTONS */}
        <div className="w-full space-y-4 mb-5 z-10 text-left">
          {/* Nickname Input Field */}
          <div>
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider block mb-1.5 pl-1">
              Biệt danh người chơi
            </label>
            <div className="flex items-center gap-2.5 bg-[#0f172a] border border-slate-700 rounded-2xl px-3.5 py-2.5 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all">
              <User size={18} className="text-purple-400 shrink-0" />
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onBlur={handleSave}
                placeholder="Nhập biệt danh..."
                className="bg-transparent border-none outline-none text-white w-full font-bold text-sm placeholder-slate-500"
                maxLength={16}
              />
            </div>
          </div>

          {/* Primary CTA Button: PLAY OFFLINE */}
          <button
            onClick={handleSelectOffline}
            disabled={!nameInput.trim()}
            className="w-full cta-gold-button py-3.5 text-base flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-black"
          >
            <Play size={20} /> BẮT ĐẦU CHƠI (OFFLINE)
          </button>

          {/* Secondary Action Buttons: Competitive & Co-op */}
          {isOnline ? (
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={handleSelectOnlineComp}
                disabled={!nameInput.trim()}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-extrabold py-2.5 px-3 rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Swords size={15} className="text-amber-400" /> Đấu Trường 1v1
              </button>

              <button
                onClick={handleSelectOnlineCoop}
                disabled={!nameInput.trim()}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-50 font-extrabold py-2.5 px-3 rounded-2xl text-xs border border-slate-700 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Sparkles size={15} className="text-purple-400" /> Phòng Hợp Tác
              </button>
            </div>
          ) : (
            <div className="text-xs text-rose-400 bg-rose-950/40 border border-rose-800/50 py-2 px-3 rounded-2xl font-bold flex items-center justify-center gap-1.5">
              <ShieldAlert size={14} /> Mở kết nối mạng để mở khóa Online
            </div>
          )}
        </div>

        {/* 3. BOTTOM JOIN ROOM CODE BADGE */}
        {isOnline && (
          <div className="w-full border-t border-slate-800/80 pt-3.5 text-center z-10">
            {!showJoinInput ? (
              <button
                onClick={() => setShowJoinInput(true)}
                className="text-xs font-extrabold text-purple-400 hover:text-purple-300 flex items-center justify-center gap-1 mx-auto hover:underline cursor-pointer"
              >
                <Key size={14} /> Có mã phòng? Gia nhập ngay
              </button>
            ) : (
              <form onSubmit={triggerJoin} className="flex gap-2 items-center justify-center max-w-sm mx-auto">
                <input
                  type="text"
                  placeholder="Mã 6 chữ số..."
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="bg-[#0f172a] border border-slate-700 rounded-xl px-3 py-2 text-center font-black tracking-widest text-white text-sm outline-none focus:border-purple-500 flex-1"
                />
                <button
                  type="submit"
                  disabled={codeInput.trim().length !== 6}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs px-4 py-2 rounded-xl disabled:opacity-50 cursor-pointer transition-colors"
                >
                  Vào
                </button>
              </form>
            )}
          </div>
        )}

      </div>

      {/* FOOTER CREDIT TAG */}
      <footer className="mt-4 text-[11px] text-slate-500 font-extrabold text-center">
        Nguyễn Hoàng Hùng (501250384) — Dự Án GameJS Clicker Multiplayer
      </footer>
    </div>
  );
}

export default MainMenu;

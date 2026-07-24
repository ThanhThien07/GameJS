import React, { useState } from 'react';
import { User, Play, ShieldAlert, Cpu, Gamepad2, Sparkles, Swords, Key } from 'lucide-react';

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
    <div className="w-full min-h-[75vh] flex items-center justify-center py-4 px-2">
      {/* SINGLE CLEAN ELEGANT WHITE CARD (IDENTICAL IN STRUCTURE TO IMAGE 1 REFERENCE) */}
      <div className="w-full max-w-md bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-100 text-slate-800 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
        
        {/* Top Icon Badge (Like Image 1 Round Icon) */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-sky-500/30 mb-4">
          <Gamepad2 size={34} />
        </div>

        {/* Title & Subtitle (Like Image 1 Title) */}
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight uppercase mb-1">
          TAP TAP CLICKER
        </h1>
        <p className="text-xs text-slate-500 font-bold mb-6">
          Siêu Clicker Tam Hợp • Đánh Quái • Chặt Gỗ • Đào Đá
        </p>

        {/* Player Name Input Field (Like Image 1 Form Input) */}
        <div className="w-full mb-5 text-left">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider block mb-1.5 pl-1">
            Biệt danh người chơi
          </label>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100 transition-all">
            <User size={18} className="text-sky-600 shrink-0" />
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={handleSave}
              placeholder="Nhập biệt danh..."
              className="bg-transparent border-none outline-none text-slate-800 w-full font-bold text-sm placeholder-slate-400"
              maxLength={16}
            />
          </div>
        </div>

        {/* Main Action Buttons Stack (Like Image 1 Main Action Button) */}
        <div className="w-full space-y-3 mb-5">
          {/* Main Action 1: Play Offline */}
          <button
            onClick={handleSelectOffline}
            className="w-full bg-sky-500 hover:bg-sky-600 text-white font-black py-3.5 rounded-xl text-sm shadow-lg shadow-sky-500/30 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
          >
            <Play size={18} /> BẮT ĐẦU CHƠI (OFFLINE)
          </button>

          {/* Main Action 2: Online Modes */}
          {isOnline ? (
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={handleSelectOnlineComp}
                className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <Swords size={15} className="text-amber-400" /> Đấu Trường
              </button>

              <button
                onClick={handleSelectOnlineCoop}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold py-2.5 px-3 rounded-xl text-xs border border-slate-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Sparkles size={15} className="text-purple-600" /> Hợp Tác
              </button>
            </div>
          ) : (
            <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5">
              <ShieldAlert size={15} /> Mở mạng để mở khóa Online
            </div>
          )}
        </div>

        {/* Join Code Section */}
        {isOnline && (
          <div className="w-full border-t border-slate-100 pt-3 text-center">
            {!showJoinInput ? (
              <button
                onClick={() => setShowJoinInput(true)}
                className="text-xs font-extrabold text-sky-600 hover:text-sky-700 flex items-center justify-center gap-1 mx-auto hover:underline cursor-pointer"
              >
                <Key size={14} /> Có mã phòng? Gia nhập ngay
              </button>
            ) : (
              <form onSubmit={triggerJoin} className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Mã 6 chữ số..."
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-center font-black tracking-widest text-slate-800 text-sm outline-none focus:border-sky-500 flex-1"
                />
                <button
                  type="submit"
                  disabled={codeInput.trim().length !== 6}
                  className="bg-sky-500 text-white font-extrabold text-xs px-4 py-2 rounded-xl disabled:opacity-50 hover:bg-sky-600 cursor-pointer"
                >
                  Vào
                </button>
              </form>
            )}
          </div>
        )}

        {/* Footer Credit */}
        <span className="text-[10px] text-slate-400 font-bold mt-4 block">
          Nguyễn Hoàng Hùng (501250384) — Dự Án Học Tập GameJS
        </span>

      </div>
    </div>
  );
}

export default MainMenu;

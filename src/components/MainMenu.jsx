import React, { useState } from 'react';
import { User, Play, ShieldAlert, Cpu, Gamepad2, Sparkles, Swords, Trees, Gem } from 'lucide-react';

function MainMenu({
  isOnline,
  playerName,
  onSaveName,
  onSelectOffline,
  onSelectOnlineComp,
  onSelectOnlineCoop,
  onJoinRoom
}) {
  const [nameInput, setNameInput] = useState(playerName);
  const [codeInput, setCodeInput] = useState('');
  const [isEditingName, setIsEditingName] = useState(!playerName);

  const handleSave = (e) => {
    e.preventDefault();
    if (nameInput.trim()) {
      onSaveName(nameInput.trim());
      setIsEditingName(false);
    }
  };

  const ensureNameSaved = () => {
    if (isEditingName) {
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
    <div className="w-full max-w-2xl flex flex-col gap-4 items-center my-1 animate-in fade-in duration-300">
      {/* Title Branding */}
      <div className="text-center mb-1">
        <h1 className="text-3xl md:text-4xl font-black tracking-wider uppercase mb-1">
          ⚡️ TAP TAP <span className="gradient-text">CLICKER</span> ⚡️
        </h1>
        <p className="text-slate-500 font-bold text-xs md:text-sm">
          Siêu Clicker Tam Hợp - Đánh Quái Vật ⚔️ • Chặt Gỗ 🪵 • Đào Đá Quặng 🪨
        </p>
      </div>

      {/* Name Input Form */}
      <div className="w-full glass-panel p-3 rounded-2xl shadow-sm">
        {isEditingName ? (
          <form onSubmit={handleSave} className="flex flex-col md:flex-row gap-2.5 items-center justify-between">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 w-full md:w-auto flex-grow">
              <User size={16} className="text-purple-600" />
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Nhập biệt danh của bạn..."
                className="bg-transparent border-none outline-none text-slate-800 w-full placeholder-slate-400 font-bold text-sm"
                maxLength={16}
              />
            </div>
            <button type="submit" className="btn-primary w-full md:w-auto px-6 text-xs py-2 whitespace-nowrap font-extrabold">
              Lưu biệt danh
            </button>
          </form>
        ) : (
          <div className="flex justify-between items-center w-full px-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center border border-purple-200">
                <span className="text-purple-700 font-black text-xs uppercase">{playerName ? playerName.charAt(0) : 'P'}</span>
              </div>
              <div className="text-left">
                <span className="text-[9px] text-slate-400 block font-extrabold uppercase">BIỆT DANH CỦA BẠN</span>
                <span className="font-extrabold text-sm tracking-wide text-slate-800">{playerName || 'Người chơi 1'}</span>
              </div>
            </div>
            <button
              onClick={() => setIsEditingName(true)}
              className="text-xs text-purple-600 hover:text-purple-800 font-bold hover:underline"
            >
              Thay đổi ✏️
            </button>
          </div>
        )}
      </div>

      {/* Mode Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {/* Offline Card */}
        <div className="glass-panel p-4 flex flex-col justify-between items-center text-center relative overflow-hidden group rounded-2xl shadow-sm">
          <div className="absolute top-0 right-0 bg-pink-50 text-pink-700 text-[9px] font-black px-2.5 py-0.5 rounded-bl-xl border-l border-b border-pink-100">
            CHƠI ĐƠN OFFLINE
          </div>
          
          <div className="my-2">
            <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center border border-pink-100 mx-auto mb-2 group-hover:scale-105 transition-transform">
              <Cpu size={20} className="text-pink-600" />
            </div>
            <h3 className="text-base font-black text-slate-800 mb-1">Chế độ Ngoại tuyến</h3>
            <p className="text-slate-500 text-xs leading-snug">
              Luyện ngón tay click chuột, tích luỹ tiền vàng và mua cỗ máy tự động!
            </p>
          </div>

          <button
            onClick={handleSelectOffline}
            className="btn-primary w-full mt-3 text-xs py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 font-extrabold"
          >
            <Play size={14} /> CHƠI OFFLINE
          </button>
        </div>

        {/* Online Card */}
        <div className={`glass-panel p-4 flex flex-col justify-between items-center text-center relative overflow-hidden group rounded-2xl shadow-sm ${!isOnline ? 'bg-slate-50/70 border-slate-100' : ''}`}>
          <div className="absolute top-0 right-0 bg-purple-50 text-purple-700 text-[9px] font-black px-2.5 py-0.5 rounded-bl-xl border-l border-b border-purple-100">
            ONLINE MULTIPLAYER
          </div>

          <div className="my-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-100 mx-auto mb-2 group-hover:scale-105 transition-transform">
              <Gamepad2 size={20} className="text-purple-600" />
            </div>
            <h3 className="text-base font-black text-slate-800 mb-1">Chế độ Trực tuyến</h3>
            <p className="text-slate-500 text-xs leading-snug">
              Thi đấu Đấu Trường 3 người thời gian thực hoặc Hợp Tác nâng cấp!
            </p>
          </div>

          {!isOnline ? (
            <div className="flex items-center gap-2 justify-center text-xs text-rose-600 bg-rose-50 py-2 px-3 rounded-xl border border-rose-100 mt-3 w-full font-bold">
              <ShieldAlert size={14} /> Vui lòng mở mạng để mớ khóa Online
            </div>
          ) : (
            <div className="flex flex-col gap-2 w-full mt-3">
              <button
                onClick={handleSelectOnlineComp}
                className="btn-primary w-full text-xs py-2 font-extrabold"
              >
                <Play size={14} /> Đấu Trường (1v1v1)
              </button>
              
              <button
                onClick={handleSelectOnlineCoop}
                className="btn-secondary w-full text-xs py-1.5 text-purple-600 hover:text-purple-700 font-extrabold border-purple-200 rounded-xl"
              >
                Phòng Hợp Tác (Chế độ 3)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Online Join Room Section */}
      {isOnline && (
        <div className="w-full glass-panel p-3.5 text-center rounded-2xl shadow-sm">
          <h4 className="font-extrabold text-slate-700 text-xs mb-2 uppercase tracking-wider">🔑 Gia nhập phòng đã có</h4>
          <form onSubmit={triggerJoin} className="flex flex-col md:flex-row gap-2 justify-center items-center">
            <input
              type="text"
              placeholder="Mã 6 chữ số..."
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
              maxLength={6}
              className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 font-black tracking-widest text-center text-slate-800 placeholder-slate-400 outline-none focus:border-purple-500 w-full md:w-44 text-sm"
            />
            <button
              type="submit"
              disabled={codeInput.trim().length !== 6}
              className="btn-primary px-6 text-xs py-2 w-full md:w-auto font-extrabold"
            >
              Gia Nhập Phòng
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default MainMenu;

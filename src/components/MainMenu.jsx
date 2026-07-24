import React, { useState } from 'react';
import { User, Play, ShieldAlert, Cpu, Gamepad2, Sparkles } from 'lucide-react';

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

  const triggerJoin = (e) => {
    e.preventDefault();
    if (codeInput.trim().length === 6) {
      onJoinRoom(codeInput.trim().toUpperCase());
    } else {
      alert('Mã phòng phải gồm 6 ký tự!');
    }
  };

  return (
    <div className="w-full max-w-2xl flex flex-col gap-6 items-center my-2">
      
      {/* 3D CARTOON LOGO BANNER MATCHING USER REFERENCE IMAGE */}
      <div className="flex flex-col items-center text-center relative py-2">
        {/* Main Title Badge */}
        <div className="cartoon-title text-4xl md:text-6xl uppercase tracking-wider mb-1 select-none">
          CLICK CLICK
        </div>
        <div className="cartoon-title text-5xl md:text-7xl uppercase tracking-wider text-yellow-400 select-none -mt-2">
          CLICKER
        </div>

        {/* 3D Red Button Banner Graphic with Pointer Cursor */}
        <div className="relative my-3 cursor-pointer group hover:scale-105 transition-transform duration-200">
          <img 
            src={`${import.meta.env.BASE_URL}assets/cartoon_red_button.png`} 
            alt="Cartoon Red Button" 
            className="w-44 h-44 object-contain filter drop-shadow-[0_8px_0_#000]"
          />
          {/* Cartoon Cursor Arrow Overlay */}
          <div className="absolute bottom-2 right-2 animate-bounce">
            <svg width="54" height="54" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 10 L80 50 L50 60 L35 90 L20 10 Z" fill="white" stroke="black" strokeWidth="6" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <p className="text-slate-700 font-bold text-sm md:text-base bg-white/90 px-4 py-1 rounded-full border-2 border-black shadow-[3px_3px_0px_#000]">
          🎮 Game Nhấp Chuột 3D Cartoon - Thi Đấu & Hợp Tác Thời Gian Thực!
        </p>
      </div>

      {/* Name Input Form */}
      <div className="w-full glass-panel p-5">
        {isEditingName ? (
          <form onSubmit={handleSave} className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-xl border-2 border-black w-full md:w-auto flex-grow shadow-[3px_3px_0px_#000]">
              <User size={20} className="text-red-500" />
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Nhập biệt danh của bạn..."
                className="bg-transparent border-none outline-none text-slate-900 w-full placeholder-slate-400 font-black text-base"
                maxLength={16}
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full md:w-auto px-8 whitespace-nowrap">
              Lưu biệt danh
            </button>
          </form>
        ) : (
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-yellow-400 flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_#000]">
                <span className="text-black font-black text-lg uppercase">{playerName.charAt(0)}</span>
              </div>
              <div className="text-left">
                <span className="text-[10px] text-slate-500 block font-black uppercase">BIỆT DANH NGƯỜI CHƠI</span>
                <span className="font-black text-lg tracking-wide text-slate-900">{playerName}</span>
              </div>
            </div>
            <button
              onClick={() => setIsEditingName(true)}
              className="text-xs text-red-600 hover:text-red-800 font-black hover:underline underline-offset-4"
            >
              Thay đổi ✏️
            </button>
          </div>
        )}
      </div>

      {/* Mode Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        
        {/* Offline Card */}
        <div className="glass-panel p-6 flex flex-col justify-between items-center text-center relative overflow-hidden bg-rose-50/50">
          <div className="absolute top-0 right-0 bg-yellow-400 text-black text-[11px] font-black px-3 py-1 rounded-bl-xl border-l-2 border-b-2 border-black">
            Ngoại tuyến 📴
          </div>
          
          <div className="my-2">
            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center border-3 border-black mx-auto mb-3 shadow-[4px_4px_0px_#000]">
              <Cpu size={32} className="text-red-500" />
            </div>
            <h3 className="text-2xl font-black mb-2 text-slate-900">Chế độ Offline</h3>
            <p className="text-slate-600 text-sm font-bold leading-relaxed">
              Luyện ngón tay click chuột 3D, tích luỹ tiền vàng và mua cỗ máy tự động mọi lúc mọi nơi!
            </p>
          </div>

          <button
            onClick={onSelectOffline}
            disabled={isEditingName}
            className="btn-primary w-full mt-4 bg-gradient-to-r from-red-500 to-rose-600"
          >
            <Play size={18} /> CHƠI OFFLINE
          </button>
        </div>

        {/* Online Card */}
        <div className={`glass-panel p-6 flex flex-col justify-between items-center text-center relative overflow-hidden bg-purple-50/50 ${!isOnline ? 'opacity-80' : ''}`}>
          <div className="absolute top-0 right-0 bg-emerald-400 text-black text-[11px] font-black px-3 py-1 rounded-bl-xl border-l-2 border-b-2 border-black">
            Trực tuyến 🌐
          </div>

          <div className="my-2">
            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center border-3 border-black mx-auto mb-3 shadow-[4px_4px_0px_#000]">
              <Gamepad2 size={32} className="text-purple-600" />
            </div>
            <h3 className="text-2xl font-black mb-2 text-slate-900">Chế độ Online</h3>
            <p className="text-slate-600 text-sm font-bold leading-relaxed">
              Thi đấu 3 người thời gian thực hoặc tạo phòng Hợp Tác cùng bạn bè và AI Bot!
            </p>
          </div>

          {!isOnline ? (
            <div className="flex items-center gap-2 justify-center text-xs text-red-600 bg-red-100 py-2.5 px-4 rounded-xl border-2 border-black mt-4 w-full font-black shadow-[2px_2px_0px_#000]">
              <ShieldAlert size={16} /> Bật mạng để mở khóa Online
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 w-full mt-4">
              <button
                onClick={onSelectOnlineComp}
                disabled={isEditingName}
                className="btn-primary w-full bg-purple-600 hover:bg-purple-700"
              >
                <Play size={18} /> Phòng Đấu Trường (1v1v1)
              </button>
              
              <button
                onClick={onSelectOnlineCoop}
                disabled={isEditingName}
                className="btn-secondary w-full text-purple-700 font-black"
              >
                Phòng Hợp Tác (Chế độ 3)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Online Join Room Section */}
      {isOnline && (
        <div className="w-full glass-panel p-5 text-center bg-yellow-50/60">
          <h4 className="font-black text-slate-900 text-base mb-3 uppercase tracking-wider">🔑 Gia nhập phòng bằng mã</h4>
          <form onSubmit={triggerJoin} className="flex flex-col md:flex-row gap-3 justify-center items-center">
            <input
              type="text"
              placeholder="MÃ PHÒNG (6 CHỮ...)"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
              maxLength={6}
              className="bg-white px-4 py-2.5 rounded-xl border-2 border-black font-black tracking-widest text-center text-slate-900 placeholder-slate-400 outline-none focus:border-red-500 w-full md:w-56 text-base shadow-[3px_3px_0px_#000]"
              disabled={isEditingName}
            />
            <button
              type="submit"
              disabled={isEditingName || codeInput.trim().length !== 6}
              className="btn-primary px-8 w-full md:w-auto"
            >
              VÀO PHÒNG
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default MainMenu;

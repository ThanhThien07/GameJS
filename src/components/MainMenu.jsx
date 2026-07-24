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
    <div className="w-full max-w-3xl flex flex-col gap-6 items-center my-2">
      {/* Title Branding */}
      <div className="text-center mb-1">
        <h1 className="text-4xl md:text-5xl font-black tracking-wider uppercase mb-2">
          ⚡️ TAP TAP <span className="gradient-text">CLICKER</span> ⚡️
        </h1>
        <p className="text-slate-500 font-bold text-sm md:text-base">
          Siêu Clicker Tam Hợp - Đánh Quái Vật ⚔️ • Chặt Gỗ 🪵 • Đào Đá Quặng 🪨
        </p>
      </div>

      {/* Name Input Form */}
      <div className="w-full glass-panel p-5">
        {isEditingName ? (
          <form onSubmit={handleSave} className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 w-full md:w-auto flex-grow">
              <User size={18} className="text-purple-600" />
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Nhập biệt danh của bạn..."
                className="bg-transparent border-none outline-none text-slate-800 w-full placeholder-slate-400 font-bold text-base"
                maxLength={16}
              />
            </div>
            <button type="submit" className="btn-primary w-full md:w-auto px-8 whitespace-nowrap">
              Lưu biệt danh
            </button>
          </form>
        ) : (
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center border border-purple-200">
                <span className="text-purple-700 font-bold uppercase">{playerName ? playerName.charAt(0) : 'P'}</span>
              </div>
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block font-bold">BIỆT DANH CỦA BẠN</span>
                <span className="font-extrabold text-base tracking-wide text-slate-700">{playerName || 'Người chơi 1'}</span>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* Offline Card */}
        <div className="glass-panel p-6 flex flex-col justify-between items-center text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 bg-pink-50 text-pink-700 text-[10px] font-bold px-3 py-1 rounded-bl-xl border-l border-b border-pink-100">
            Không cần mạng
          </div>
          
          <div className="my-3">
            <div className="w-14 h-14 rounded-2xl bg-pink-50 flex items-center justify-center border border-pink-100 mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Cpu size={28} className="text-pink-600" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-slate-800">Chế độ Ngoại tuyến</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Luyện ngón tay click chuột, tích luỹ tiền vàng và mua cỗ máy tự động mọi lúc mọi nơi!
            </p>
          </div>

          <button
            onClick={handleSelectOffline}
            className="btn-primary w-full mt-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
          >
            <Play size={16} /> CHƠI OFFLINE
          </button>
        </div>

        {/* Online Card */}
        <div className={`glass-panel p-6 flex flex-col justify-between items-center text-center relative overflow-hidden group ${!isOnline ? 'bg-slate-50/70 border-slate-100' : ''}`}>
          <div className="absolute top-0 right-0 bg-purple-50 text-purple-700 text-[10px] font-bold px-3 py-1 rounded-bl-xl border-l border-b border-purple-100">
            Cần kết nối mạng
          </div>

          <div className="my-3">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center border border-purple-100 mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Gamepad2 size={28} className="text-purple-600" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-slate-800">Chế độ Trực tuyến</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Tạo phòng đấu trường so tài click 3 người thời gian thực hoặc phòng hợp tác nâng cấp chung!
            </p>
          </div>

          {!isOnline ? (
            <div className="flex items-center gap-2 justify-center text-xs text-rose-600 bg-rose-50 py-2.5 px-4 rounded-xl border border-rose-100 mt-4 w-full font-bold">
              <ShieldAlert size={14} /> Vui lòng mở mạng để mớ khóa Online
            </div>
          ) : (
            <div className="flex flex-col gap-2 w-full mt-4">
              <button
                onClick={handleSelectOnlineComp}
                className="btn-primary w-full"
              >
                <Play size={16} /> Tạo phòng Đấu Trường (1v1v1)
              </button>
              
              <button
                onClick={handleSelectOnlineCoop}
                className="btn-secondary w-full text-purple-600 hover:text-purple-700 font-bold border-purple-200"
              >
                Tạo phòng Hợp Tác (Chế độ 3)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Online Join Room Section */}
      {isOnline && (
        <div className="w-full glass-panel p-5 text-center">
          <h4 className="font-bold text-slate-800 text-sm mb-3 uppercase tracking-wider">🔑 Gia nhập phòng đã có</h4>
          <form onSubmit={triggerJoin} className="flex flex-col md:flex-row gap-3 justify-center items-center">
            <input
              type="text"
              placeholder="Nhập mã 6 chữ số..."
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
              maxLength={6}
              className="bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 font-black tracking-widest text-center text-slate-800 placeholder-slate-400 outline-none focus:border-purple-500 w-full md:w-52 text-base"
            />
            <button
              type="submit"
              disabled={codeInput.trim().length !== 6}
              className="btn-primary px-8 w-full md:w-auto"
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

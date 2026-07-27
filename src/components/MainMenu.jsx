import React, { useState } from 'react';

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
  const [showJoinInput, setShowJoinInput] = useState(false);

  const handleSave = (e) => {
    if (e) e.preventDefault();
    if (nameInput.trim()) onSaveName(nameInput.trim());
  };

  const ensureNameSaved = () => {
    const finalName = nameInput.trim() || 'Người chơi 1';
    onSaveName(finalName);
    setNameInput(finalName);
  };

  const handleSelectOffline = () => { ensureNameSaved(); onSelectOffline(); };
  const handleSelectOnlineComp = () => { ensureNameSaved(); onSelectOnlineComp(); };
  const handleSelectOnlineCoop = () => { ensureNameSaved(); onSelectOnlineCoop(); };

  const triggerJoin = (e) => {
    e.preventDefault();
    ensureNameSaved();
    if (codeInput.trim().length === 6) onJoinRoom(codeInput.trim().toUpperCase());
    else alert('Mã phòng phải gồm 6 ký tự!');
  };

  return (
    <div
      className="min-h-screen w-full bg-[#0f172a] flex flex-col items-center justify-center py-8 px-4"
      style={{ fontFamily: "'Press Start 2P', 'Silkscreen', monospace" }}
    >
      {/* MAIN MENU PANEL */}
      <div className="w-full max-w-sm bg-[#1e293b] border-4 border-[#334155] shadow-[6px_6px_0_#000] p-6 flex flex-col gap-5">

        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 bg-[#78350f] border-4 border-black text-yellow-300 flex items-center justify-center text-2xl shadow-[3px_3px_0_#000] animate-bounce-slow">
            🎮
          </div>
          <h1 className="text-sm font-black text-amber-400 uppercase text-center leading-tight">
            TAP TAP<br />CLICKER
          </h1>
          <p className="text-[8px] text-slate-400 uppercase tracking-widest text-center">
            RETRO PIXEL RPG
          </p>
        </div>

        {/* Divider */}
        <div className="border-t-2 border-[#334155]" />

        {/* Nickname input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[8px] text-slate-400 uppercase">👾 Biệt danh anh hùng</label>
          <div className="flex items-center gap-2 bg-[#0f172a] border-2 border-[#334155] px-3 py-2 focus-within:border-amber-500">
            <span className="text-amber-400 text-xs">👤</span>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={handleSave}
              placeholder="Nhập tên..."
              className="bg-transparent border-none outline-none text-white w-full text-[9px] font-black placeholder-slate-600"
              style={{ fontFamily: "'Silkscreen', monospace" }}
              maxLength={16}
            />
          </div>
        </div>

        {/* PLAY OFFLINE */}
        <button
          onClick={handleSelectOffline}
          disabled={!nameInput.trim()}
          className="w-full bg-amber-400 border-2 border-amber-300 border-b-4 border-b-amber-700 text-black text-[9px] font-black py-3 uppercase shadow-[3px_3px_0_#000] hover:bg-amber-300 active:translate-y-0.5 active:border-b-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ▶ BẮT ĐẦU CHƠI (OFFLINE)
        </button>

        {/* Online buttons or warning */}
        {isOnline ? (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleSelectOnlineComp}
              disabled={!nameInput.trim()}
              className="bg-purple-700 border-2 border-purple-500 border-b-4 border-b-purple-900 text-white text-[8px] font-black py-2.5 uppercase shadow-[2px_2px_0_#000] hover:bg-purple-600 active:translate-y-0.5 active:border-b-2 transition-all disabled:opacity-50"
            >
              ⚔ ĐẤU<br />1v1
            </button>
            <button
              onClick={handleSelectOnlineCoop}
              disabled={!nameInput.trim()}
              className="bg-blue-700 border-2 border-blue-500 border-b-4 border-b-blue-900 text-white text-[8px] font-black py-2.5 uppercase shadow-[2px_2px_0_#000] hover:bg-blue-600 active:translate-y-0.5 active:border-b-2 transition-all disabled:opacity-50"
            >
              ✨ HỢP<br />TÁC
            </button>
          </div>
        ) : (
          <div className="text-[8px] text-red-400 bg-red-950 border-2 border-red-700 py-2 px-3 font-black flex items-center justify-center gap-1.5 text-center">
            ⚠ Cần kết nối mạng để chơi Online
          </div>
        )}

        {/* Join room */}
        {isOnline && (
          <div className="border-t-2 border-[#334155] pt-4">
            {!showJoinInput ? (
              <button
                onClick={() => setShowJoinInput(true)}
                className="text-[8px] font-black text-amber-400 hover:text-amber-300 flex items-center justify-center gap-1 w-full"
              >
                🔑 Có mã phòng? Nhập ngay
              </button>
            ) : (
              <form onSubmit={triggerJoin} className="flex gap-2">
                <input
                  type="text"
                  placeholder="MÃ 6 KÝ TỰ"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="bg-[#0f172a] border-2 border-[#334155] px-2 py-1.5 text-center font-black tracking-widest text-amber-400 text-[9px] outline-none focus:border-amber-500 flex-1"
                  style={{ fontFamily: "'Silkscreen', monospace" }}
                />
                <button
                  type="submit"
                  disabled={codeInput.trim().length !== 6}
                  className="bg-green-600 border-2 border-green-400 border-b-4 border-b-green-900 text-white text-[9px] font-black px-3 py-1.5 uppercase shadow-[2px_2px_0_#000] hover:bg-green-500 disabled:opacity-50"
                >
                  VÀO
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-4 text-[8px] text-slate-600 font-black text-center">
        Nguyễn Hoàng Hùng (501250384)
      </footer>
    </div>
  );
}

export default MainMenu;

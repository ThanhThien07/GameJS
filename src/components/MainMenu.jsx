import React, { useState } from 'react';

export default function MainMenu({ isOnline, playerName, onSaveName, onSelectOffline, onSelectOnlineComp, onSelectOnlineCoop, onJoinRoom }) {
  const [name, setName]           = useState(playerName || '');
  const [code, setCode]           = useState('');
  const [showJoin, setShowJoin]   = useState(false);

  const save = () => name.trim() && onSaveName(name.trim());
  const go   = (fn) => { const n = name.trim() || 'Người chơi 1'; onSaveName(n); fn(); };

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center p-4"
         style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>

      {/* Card */}
      <div className="w-full max-w-[380px] bg-[#161b22] border border-white/8 rounded-2xl p-6 shadow-2xl flex flex-col gap-5">

        {/* Logo */}
        <div className="flex flex-col items-center gap-2 pb-1">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/30">🎮</div>
          <div className="text-center">
            <h1 className="text-xl font-black text-white leading-none">TAP TAP CLICKER</h1>
            <p className="text-[10px] text-slate-500 mt-1 font-semibold uppercase tracking-widest">Pixel RPG • Offline & Online</p>
          </div>
        </div>

        {/* Name input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase">👾 Tên anh hùng</label>
          <div className="flex items-center gap-2 bg-[#0d1117] border border-white/8 rounded-xl px-3 py-2.5 focus-within:border-amber-500/50 transition-colors">
            <span className="text-amber-400">👤</span>
            <input
              type="text" value={name} maxLength={16} placeholder="Nhập tên..."
              onChange={e => setName(e.target.value)} onBlur={save}
              className="flex-1 bg-transparent border-none outline-none text-white text-xs font-semibold placeholder-slate-600"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/5" />

        {/* OFFLINE button */}
        <button
          onClick={() => go(onSelectOffline)} disabled={!name.trim()}
          className="w-full bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-gray-900 font-black text-sm py-3.5 rounded-xl shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          ▶ BẮT ĐẦU CHƠI OFFLINE
        </button>

        {/* Online buttons */}
        {isOnline ? (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => go(onSelectOnlineComp)} disabled={!name.trim()}
              className="bg-gradient-to-b from-purple-600/80 to-purple-700/80 hover:from-purple-500/80 hover:to-purple-600/80 disabled:opacity-40 border border-purple-500/30 text-white text-[10px] font-bold py-3 rounded-xl active:scale-[0.98] transition-all flex flex-col items-center gap-0.5"
            >
              <span className="text-base">⚔️</span> Đấu trường 1v1
            </button>
            <button
              onClick={() => go(onSelectOnlineCoop)} disabled={!name.trim()}
              className="bg-gradient-to-b from-blue-600/80 to-blue-700/80 hover:from-blue-500/80 hover:to-blue-600/80 disabled:opacity-40 border border-blue-500/30 text-white text-[10px] font-bold py-3 rounded-xl active:scale-[0.98] transition-all flex flex-col items-center gap-0.5"
            >
              <span className="text-base">✨</span> Hợp tác 3 người
            </button>
          </div>
        ) : (
          <div className="bg-red-900/20 border border-red-500/20 rounded-xl p-2.5 text-center text-[10px] text-red-400 font-semibold">
            ⚠️ Cần kết nối mạng để chơi Online
          </div>
        )}

        {/* Join by code */}
        {isOnline && (
          <div className="border-t border-white/5 pt-1">
            {!showJoin ? (
              <button onClick={() => setShowJoin(true)} className="w-full text-[10px] text-amber-400 hover:text-amber-300 font-semibold text-center py-1 transition-colors">
                🔑 Có mã phòng? Nhập để vào
              </button>
            ) : (
              <form onSubmit={e => { e.preventDefault(); go(() => {}); if(code.trim().length === 6) onJoinRoom(code.trim().toUpperCase()); else alert('Mã phòng 6 ký tự!'); }} className="flex gap-2">
                <input
                  type="text" value={code} maxLength={6} placeholder="MÃ PHÒNG"
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  className="flex-1 bg-[#0d1117] border border-white/10 rounded-xl px-3 py-2 text-center text-amber-400 font-black tracking-widest text-sm outline-none focus:border-amber-500/50"
                />
                <button type="submit" disabled={code.trim().length !== 6}
                  className="bg-green-600 hover:bg-green-500 disabled:opacity-40 border border-green-500/50 text-white text-[10px] font-black px-3 py-2 rounded-xl">
                  VÀO
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      <p className="mt-4 text-[9px] text-slate-600 font-semibold">Nguyễn Hoàng Hùng — 501250384</p>
    </div>
  );
}

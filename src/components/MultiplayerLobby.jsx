import React from 'react';

export default function MultiplayerLobby({ roomData, socketId, onToggleReady, onAddBot, onLeave, onThemeSelect, selectedTheme }) {
  if (!roomData) return null;
  const { code, mode, players } = roomData;
  const myPlayer = players.find(p => p.id === socketId);

  const themes = [
    { id: 'monster', icon: '⚔️', label: 'Đánh Quái' },
    { id: 'wood',    icon: '🪓', label: 'Chặt Gỗ'   },
    { id: 'stone',   icon: '⛏️', label: 'Đào Đá'    },
  ];

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>

      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3 bg-[#161b22] border-b border-white/5 sticky top-0 z-10">
        <button onClick={onLeave} className="text-xs font-semibold text-slate-400 hover:text-white bg-[#1c2333] border border-white/8 rounded-xl px-3 py-2 transition-colors">
          ← Thoát phòng
        </button>
        <h1 className="text-sm font-black text-white">
          {mode === 'coop' ? '✨ Phòng Hợp Tác' : '⚔️ Đấu Trường 1v1'}
        </h1>
        <div className="w-24" />
      </header>

      {/* Body */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4">

        {/* Room code + theme */}
        <div className="lg:w-64 shrink-0 flex flex-col gap-3">

          <div className="bg-[#161b22] border border-white/8 rounded-2xl p-4">
            <div className="text-[9px] text-slate-500 font-bold uppercase mb-2">Mã phòng</div>
            <div
              onClick={() => navigator.clipboard.writeText(code).then(() => alert(`Copied: ${code}`))}
              className="bg-[#0d1117] border border-amber-500/30 rounded-xl p-3 text-center cursor-pointer hover:border-amber-400/50 transition-colors mb-2"
            >
              <div className="text-2xl font-black tracking-[0.2em] text-amber-300">{code}</div>
              <div className="text-[9px] text-slate-500 mt-0.5">📋 Nhấn để sao chép</div>
            </div>
            <p className="text-[9px] text-slate-500 text-center">Gửi mã này cho bạn bè!</p>
          </div>

          <div className="bg-[#161b22] border border-white/8 rounded-2xl p-4">
            <div className="text-[9px] text-slate-500 font-bold uppercase mb-2">Chủ đề trận</div>
            <div className="flex flex-col gap-1.5">
              {themes.map(t => (
                <button
                  key={t.id}
                  onClick={() => onThemeSelect(t.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors text-left ${
                    selectedTheme === t.id
                      ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                      : 'bg-[#0d1117] border border-white/5 text-slate-400 hover:border-white/15'}`}
                >
                  {t.icon} {t.label} {selectedTheme === t.id && '✓'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Players */}
        <div className="flex-1 bg-[#161b22] border border-white/8 rounded-2xl p-4 flex flex-col">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/5">
            <h2 className="text-sm font-black text-white">Người chơi ({players.length}/3)</h2>
            {players.length < 3 && (
              <button
                onClick={onAddBot}
                className="bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/30 text-purple-300 text-[10px] font-bold px-3 py-1.5 rounded-xl transition-colors"
              >
                🤖 Thêm Bot
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2 flex-1">
            {[0, 1, 2].map(i => {
              const p = players[i];
              const isMe = p?.id === socketId;
              if (p) return (
                <div key={p.id} className={`flex justify-between items-center p-3 rounded-xl border transition-colors ${isMe ? 'bg-purple-900/20 border-purple-500/25' : 'bg-[#0d1117] border-white/5'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-900/40 border border-amber-500/30 flex items-center justify-center text-lg">
                      {p.isBot ? '🤖' : '👾'}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{p.name} {isMe && <span className="text-purple-400">(Bạn)</span>}</div>
                      {p.isBot && <div className="text-[8px] text-slate-500">AI Bot</div>}
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${p.isReady ? 'text-green-300 bg-green-900/30 border-green-700/50' : 'text-amber-300 bg-amber-900/20 border-amber-700/30'}`}>
                    {p.isReady ? '✓ Sẵn sàng' : '⏳ Chờ'}
                  </span>
                </div>
              );
              return (
                <div key={`e${i}`} className="flex items-center justify-center p-3 rounded-xl border border-dashed border-white/8 text-slate-600 text-[10px] font-semibold">
                  👾 Vị trí trống...
                </div>
              );
            })}
          </div>

          {/* Action row */}
          <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-3 gap-3">
            <p className="text-[9px] text-slate-500 flex-1">
              💡 Bắt đầu khi ≥ 2 người bấm Sẵn Sàng.
            </p>
            <button
              onClick={onToggleReady}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all active:scale-[0.97] ${
                myPlayer?.isReady
                  ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
                  : 'bg-green-600 hover:bg-green-500 border border-green-500/50 text-white shadow-lg shadow-green-500/20'}`}
            >
              {myPlayer?.isReady ? '✕ Hủy' : '⚔️ Sẵn Sàng'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

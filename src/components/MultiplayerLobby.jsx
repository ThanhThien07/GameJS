import React from 'react';

function MultiplayerLobby({
  roomData,
  socketId,
  onToggleReady,
  onAddBot,
  onLeave,
  onThemeSelect,
  selectedTheme
}) {
  if (!roomData) return null;

  const { code, mode, players } = roomData;
  const myPlayer = players.find(p => p.id === socketId);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(code);
    alert(`Đã sao chép mã phòng: ${code}`);
  };

  const themes = [
    { id: 'monster', name: '⚔ ĐÁNH QUÁI', color: 'border-red-500 bg-red-900/30' },
    { id: 'wood',    name: '🪵 CHẶT GỖ',  color: 'border-green-500 bg-green-900/30' },
    { id: 'stone',   name: '🪨 ĐÀO ĐÁ',   color: 'border-amber-500 bg-amber-900/30' },
  ];

  return (
    <div
      className="min-h-screen w-full bg-[#0f172a] flex flex-col"
      style={{ fontFamily: "'Press Start 2P', 'Silkscreen', monospace" }}
    >
      {/* Header */}
      <header className="w-full bg-[#1e293b] border-b-4 border-black px-6 py-3 flex items-center justify-between sticky top-0 z-10 shadow-[0_4px_0_#000]">
        <button
          onClick={onLeave}
          className="bg-[#0f172a] border-2 border-[#334155] text-slate-300 px-3 py-2 text-[9px] font-black uppercase shadow-[2px_2px_0_#000] hover:border-amber-400 active:translate-y-0.5"
        >
          ← THOÁT PHÒNG
        </button>
        <h1 className="text-xs font-black text-amber-400 uppercase">
          {mode === 'coop' ? '✨ PHÒNG HỢP TÁC' : '⚔ ĐẤU TRƯỜNG COMPETITIVE'}
        </h1>
        <div className="w-28" />
      </header>

      {/* Body */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4">

        {/* Left: Room code + theme */}
        <div className="lg:w-64 shrink-0 flex flex-col gap-4">

          {/* Room code card */}
          <div className="bg-[#1e293b] border-3 border-[#334155] shadow-[4px_4px_0_#000] p-4 flex flex-col gap-3">
            <div className="text-[8px] text-amber-400 font-black uppercase">Mã phòng game</div>
            <div
              onClick={copyRoomCode}
              className="bg-[#0f172a] border-2 border-amber-500 py-3 px-4 text-center cursor-pointer hover:border-amber-300 shadow-[2px_2px_0_#000] active:translate-y-0.5"
            >
              <div className="text-xl font-black tracking-widest text-amber-300">{code}</div>
              <div className="text-[8px] text-slate-400 mt-1">📋 Nhấn để sao chép</div>
            </div>
            <p className="text-[8px] text-slate-400">Gửi mã này cho bạn bè gia nhập!</p>
          </div>

          {/* Theme selector */}
          <div className="bg-[#1e293b] border-3 border-[#334155] shadow-[4px_4px_0_#000] p-4 flex flex-col gap-2">
            <div className="text-[8px] text-slate-300 font-black uppercase mb-1">Chủ đề trận đấu</div>
            {themes.map((t) => {
              const isSelected = selectedTheme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => onThemeSelect(t.id)}
                  className={`w-full py-2 px-3 border-2 text-[8px] font-black uppercase shadow-[2px_2px_0_#000] active:translate-y-0.5 text-left transition-colors
                    ${isSelected ? `${t.color} border-current text-white` : 'bg-[#0f172a] border-[#334155] text-slate-400 hover:border-slate-500'}`}
                >
                  {isSelected ? '✓ ' : ''}{t.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Player slots */}
        <div className="flex-1 bg-[#1e293b] border-3 border-[#334155] shadow-[4px_4px_0_#000] p-4 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b-2 border-[#334155] pb-3">
            <h3 className="text-[9px] font-black text-white uppercase">
              Thành viên ({players.length}/3)
            </h3>
            {players.length < 3 && (
              <button
                onClick={onAddBot}
                className="bg-purple-700 border-2 border-purple-500 text-white text-[8px] font-black px-3 py-1.5 uppercase shadow-[2px_2px_0_#000] hover:bg-purple-600 active:translate-y-0.5"
              >
                🤖 Thêm Bot AI
              </button>
            )}
          </div>

          {/* Slots */}
          <div className="flex flex-col gap-3">
            {[0, 1, 2].map((slotIdx) => {
              const player = players[slotIdx];
              if (player) {
                const isMe = player.id === socketId;
                return (
                  <div
                    key={player.id}
                    className={`flex justify-between items-center px-4 py-3 border-2 shadow-[2px_2px_0_#000]
                      ${isMe ? 'bg-purple-900/40 border-purple-500' : 'bg-[#0f172a] border-[#334155]'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#78350f] text-amber-300 border-2 border-amber-500 flex items-center justify-center font-black text-sm shadow-[1px_1px_0_#000]">
                        {player.isBot ? '🤖' : '👾'}
                      </div>
                      <div className="text-[9px] font-black text-white">
                        {player.name} {isMe ? <span className="text-purple-400">(BẠN)</span> : ''}
                      </div>
                    </div>
                    <div>
                      {player.isReady ? (
                        <span className="text-[8px] bg-green-900 text-green-300 border-2 border-green-600 py-0.5 px-2 font-black uppercase shadow-[1px_1px_0_#000]">
                          ✓ Sẵn sàng
                        </span>
                      ) : (
                        <span className="text-[8px] bg-[#78350f] text-amber-300 border-2 border-amber-500 py-0.5 px-2 font-black uppercase shadow-[1px_1px_0_#000]">
                          Chờ...
                        </span>
                      )}
                    </div>
                  </div>
                );
              } else {
                return (
                  <div
                    key={`empty-${slotIdx}`}
                    className="border-2 border-dashed border-[#334155] px-4 py-3 text-center text-slate-500 text-[8px] font-black"
                  >
                    👾 Vị trí trống...
                  </div>
                );
              }
            })}
          </div>

          {/* Ready button */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between border-t-2 border-[#334155] pt-4 mt-auto">
            <p className="text-[8px] text-slate-400 leading-relaxed max-w-xs">
              💡 Bắt đầu khi có ≥ 2 người bấm SẴN SÀNG.
            </p>
            <button
              onClick={onToggleReady}
              className={`px-6 py-3 border-2 border-b-4 text-[9px] font-black uppercase shadow-[3px_3px_0_#000] active:translate-y-0.5 active:border-b-2 transition-all
                ${myPlayer?.isReady
                  ? 'bg-amber-500 border-amber-300 border-b-amber-700 text-black hover:bg-amber-400'
                  : 'bg-green-600 border-green-400 border-b-green-900 text-white hover:bg-green-500'}`}
            >
              {myPlayer?.isReady ? '✕ Hủy Sẵn Sàng' : '⚔ Sẵn Sàng Ngay'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MultiplayerLobby;

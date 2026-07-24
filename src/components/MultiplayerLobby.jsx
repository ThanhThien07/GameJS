import React from 'react';
import PixelButton from './pixel/PixelButton';
import PixelPanel from './pixel/PixelPanel';

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
  const isCreator = players[0]?.id === socketId;
  const myPlayer = players.find(p => p.id === socketId);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(code);
    alert(`Đã sao chép mã phòng: ${code}`);
  };

  const themes = [
    { id: 'monster', name: '⚔️ ĐÁNH QUÁI' },
    { id: 'wood', name: '🪵 CHẶT GỖ' },
    { id: 'stone', name: '🪨 ĐÀO ĐÁ' }
  ];

  return (
    <div className="w-full max-w-3xl flex flex-col gap-6 items-center py-4 px-2 font-['Silkscreen',monospace]">
      {/* Header Area */}
      <div className="flex w-full items-center justify-between">
        <PixelButton onClick={onLeave} variant="dark" size="sm">
          ⬅️ THOÁT PHÒNG
        </PixelButton>
        <h2 className="text-sm md:text-base font-black text-amber-400 uppercase tracking-wider">
          PHÒNG {mode === 'coop' ? 'HỢP TÁC (3 NGƯỜI)' : 'ĐẤU TRƯỜNG COMPETITIVE'}
        </h2>
        <div className="w-20"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {/* Left Side: Room details & Code */}
        <PixelPanel className="p-4 flex flex-col justify-between items-center md:col-span-1">
          <div className="text-center w-full">
            <span className="text-[10px] text-amber-400 font-bold uppercase block mb-2">MÃ PHÒNG GAME</span>
            <div 
              onClick={copyRoomCode}
              className="flex items-center justify-center gap-2 bg-[#0f172a] py-3 px-4 border-4 border-amber-500/60 cursor-pointer hover:bg-amber-950/40 active:translate-y-0.5 transition-all mb-3 shadow-[2px_2px_0px_#000000]"
            >
              <span className="text-xl font-black tracking-widest text-amber-300">{code}</span>
              <span className="text-xs">📋</span>
            </div>
            <p className="text-slate-400 text-[10px] leading-relaxed">
              Gửi mã này cho bạn bè gia nhập!
            </p>
          </div>

          <div className="w-full mt-6 border-t-2 border-[#334155] pt-4 text-left">
            <h4 className="font-bold text-[10px] text-slate-300 uppercase mb-3">CHỦ ĐỀ TRẬN ĐẤU:</h4>
            <div className="flex flex-col gap-2">
              {themes.map((t) => {
                const isSelected = selectedTheme === t.id;
                return (
                  <PixelButton
                    key={t.id}
                    onClick={() => onThemeSelect(t.id)}
                    variant={isSelected ? 'purple' : 'dark'}
                    size="sm"
                    className="w-full text-left justify-start"
                  >
                    {t.name}
                  </PixelButton>
                );
              })}
            </div>
          </div>
        </PixelPanel>

        {/* Right Side: Players Slots & Status */}
        <PixelPanel className="p-4 md:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4 border-b-2 border-[#334155] pb-3">
              <h3 className="font-bold text-xs text-white uppercase">THÀNH VIÊN ({players.length}/3)</h3>
              {players.length < 3 && (
                <PixelButton onClick={onAddBot} variant="purple" size="sm">
                  🤖 THÊM BOT AI
                </PixelButton>
              )}
            </div>

            <div className="space-y-3 mb-6">
              {[0, 1, 2].map((slotIdx) => {
                const player = players[slotIdx];
                if (player) {
                  const isMe = player.id === socketId;
                  return (
                    <div
                      key={player.id}
                      className={`flex justify-between items-center px-4 py-3 border-2 ${
                        isMe 
                          ? 'bg-[#3b0764] border-purple-400' 
                          : 'bg-[#0f172a] border-[#334155]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 bg-[#78350f] text-amber-300 border-2 border-amber-500 flex items-center justify-center font-bold text-xs">
                          {player.isBot ? '🤖' : '👾'}
                        </div>
                        <div className="font-bold text-white text-xs">
                          {player.name} {isMe ? '(BẠN)' : ''}
                        </div>
                      </div>
                      <div>
                        {player.isReady ? (
                          <span className="text-[9px] bg-[#14532d] text-emerald-300 border-2 border-emerald-500 py-0.5 px-2 font-bold uppercase">
                            ✓ SẴN SÀNG
                          </span>
                        ) : (
                          <span className="text-[9px] bg-[#78350f] text-amber-300 border-2 border-amber-500 py-0.5 px-2 font-bold uppercase">
                            CHỜ SẴN SÀNG
                          </span>
                        )}
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div
                      key={`empty-${slotIdx}`}
                      className="border-2 border-dashed border-[#334155] px-4 py-3 text-center text-slate-500 text-[10px] font-bold"
                    >
                      👾 VỊ TRÍ TRỐNG...
                    </div>
                  );
                }
              })}
            </div>
          </div>

          {/* Lobby Footer Action */}
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between border-t-2 border-[#334155] pt-4 mt-2">
            <p className="text-[9px] text-slate-400 text-left leading-relaxed max-w-xs">
              💡 Bắt đầu khi đủ 3 người bấm SẴN SÀNG.
            </p>
            <PixelButton
              onClick={onToggleReady}
              variant={myPlayer?.isReady ? 'gold' : 'green'}
              size="md"
              className="w-full md:w-auto"
            >
              {myPlayer?.isReady ? '❎ HỦY SẴN SÀNG' : '⚔️ SẴN SÀNG NGAY'}
            </PixelButton>
          </div>
        </PixelPanel>
      </div>
    </div>
  );
}

export default MultiplayerLobby;

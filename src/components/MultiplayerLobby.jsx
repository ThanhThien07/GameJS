import React from 'react';
import { User, Copy, Users, ArrowLeft, Check, Sparkles, Swords, Trees, Gem } from 'lucide-react';

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
    { id: 'monster', name: 'Đánh Quái', icon: Swords, color: '#dc2626' },
    { id: 'wood', name: 'Chặt Gỗ', icon: Trees, color: '#059669' },
    { id: 'stone', name: 'Đào Đá', icon: Gem, color: '#d97706' }
  ];

  return (
    <div className="w-full max-w-3xl flex flex-col gap-6 items-center">
      {/* Header Area */}
      <div className="flex w-full items-center justify-between">
        <button onClick={onLeave} className="btn-secondary py-2 px-4 flex items-center gap-1 text-sm font-bold">
          <ArrowLeft size={16} /> Thoát Phòng
        </button>
        <div className="flex items-center gap-2">
          <Users size={20} className="text-purple-600" />
          <span className="text-lg font-extrabold text-slate-800 uppercase">
            Phòng {mode === 'coop' ? 'Hợp Tác (Chế độ 3)' : 'Đấu Trường Competitive'}
          </span>
        </div>
        <div className="w-20"></div> {/* Spacer */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {/* Left Side: Room details & Code */}
        <div className="glass-panel p-6 flex flex-col justify-between items-center md:col-span-1 border border-purple-100 bg-purple-50/40">
          <div className="text-center w-full">
            <span className="text-[10px] text-purple-600 font-extrabold uppercase tracking-widest block mb-2">MÃ PHÒNG</span>
            <div 
              onClick={copyRoomCode}
              className="flex items-center justify-center gap-2 bg-white py-3 px-4 rounded-xl border border-purple-200 cursor-pointer hover:bg-purple-100/30 active:scale-95 transition-all mb-3 shadow-sm"
            >
              <span className="text-2xl font-black tracking-widest text-purple-700">{code}</span>
              <Copy size={15} className="text-purple-600" />
            </div>
            <p className="text-slate-500 text-xs font-semibold leading-relaxed">
              Gửi mã phòng này cho 2 đồng đội của bạn để bắt đầu trận đấu!
            </p>
          </div>

          <div className="w-full mt-6 border-t border-slate-200/80 pt-4 text-left">
            <h4 className="font-bold text-xs text-slate-700 uppercase mb-3 tracking-wider">Chọn mô hình click:</h4>
            <div className="flex flex-col gap-2">
              {themes.map((t) => {
                const IconComp = t.icon;
                const isSelected = selectedTheme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => onThemeSelect(t.id)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      isSelected 
                        ? 'bg-purple-100 border-purple-300 text-purple-800 shadow-sm' 
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <IconComp size={15} style={{ color: isSelected ? t.color : '#94a3b8' }} />
                    <span>{t.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Players Slots & Status */}
        <div className="glass-panel p-6 md:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-base text-slate-800 uppercase tracking-wider">Thành viên phòng ({players.length}/3)</h3>
              {players.length < 3 && (
                <button
                  onClick={onAddBot}
                  className="text-xs bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 py-1.5 px-3 rounded-lg flex items-center gap-1 font-bold transition-all"
                >
                  <Sparkles size={12} /> Thêm người chơi AI (Bot)
                </button>
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
                      className={`flex justify-between items-center px-4 py-3.5 rounded-xl border ${
                        isMe 
                          ? 'bg-purple-50/50 border-purple-300 shadow-sm' 
                          : 'bg-slate-50/60 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          player.isBot ? 'bg-purple-100 text-purple-700' : 'bg-pink-100 text-pink-700'
                        }`}>
                          {player.name.charAt(0)}
                        </div>
                        <div className="font-bold text-slate-700 text-sm">
                          {player.name} {isMe ? '(Bạn)' : ''}
                          {player.isBot && <span className="ml-1.5 text-[9px] bg-purple-100 border border-purple-200 px-1.5 py-0.2 rounded text-purple-700 font-bold">AI</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {player.isReady ? (
                          <span className="text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-700 py-1 px-2.5 rounded-full font-bold flex items-center gap-1">
                            <Check size={11} /> Sẵn sàng
                          </span>
                        ) : (
                          <span className="text-[10px] bg-amber-50 border border-amber-200 text-amber-700 py-1 px-2.5 rounded-full font-bold">
                            Chờ sẵn sàng
                          </span>
                        )}
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div
                      key={`empty-${slotIdx}`}
                      className="border border-dashed border-slate-200 rounded-xl px-4 py-3 text-center text-slate-400 text-xs font-semibold flex items-center justify-center gap-2"
                    >
                      <span>Trống - Đang đợi đồng đội gia nhập...</span>
                    </div>
                  );
                }
              })}
            </div>
          </div>

          {/* Lobby Footer Action */}
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between border-t border-slate-200 pt-4 mt-2">
            <p className="text-xs text-slate-500 text-left leading-relaxed max-w-sm">
              💡 Game đấu sẽ tự động bắt đầu ngay khi có đủ <span className="font-bold text-purple-600">3 thành viên</span> và tất cả đều kích hoạt nút chuyển trạng thái <span className="font-bold text-emerald-600">Sẵn sàng</span>.
            </p>
            <button
              onClick={onToggleReady}
              className={`w-full md:w-auto font-extrabold text-base py-3 px-8 rounded-xl transition-all shadow-md active:scale-95 ${
                myPlayer?.isReady
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/10'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/10'
              }`}
            >
              {myPlayer?.isReady ? 'HỦY SẴN SÀNG' : 'SẴN SÀNG NGAY'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MultiplayerLobby;

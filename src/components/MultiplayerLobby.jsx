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
    { id: 'monster', name: 'Đánh Quái', icon: Swords, color: '#f43f5e' },
    { id: 'wood', name: 'Chặt Gỗ', icon: Trees, color: '#10b981' },
    { id: 'stone', name: 'Đào Đá', icon: Gem, color: '#f59e0b' }
  ];

  return (
    <div className="w-full max-w-3xl flex flex-col gap-6 items-center animate-in fade-in duration-200 py-4 px-2">
      {/* Header Area */}
      <div className="flex w-full items-center justify-between">
        <button onClick={onLeave} className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 py-2 px-4 rounded-xl flex items-center gap-1 text-xs font-black cursor-pointer transition-colors">
          <ArrowLeft size={16} /> Thoát Phòng
        </button>
        <div className="flex items-center gap-2">
          <Users size={20} className="text-purple-400" />
          <span className="text-lg font-black text-white uppercase tracking-wider">
            Phòng {mode === 'coop' ? 'Hợp Tác (Chế độ 3)' : 'Đấu Trường Competitive'}
          </span>
        </div>
        <div className="w-20"></div> {/* Spacer */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {/* Left Side: Room details & Code */}
        <div className="p-6 flex flex-col justify-between items-center md:col-span-1 border border-purple-800/60 bg-purple-950/40 rounded-3xl shadow-xl backdrop-blur-md">
          <div className="text-center w-full">
            <span className="text-[10px] text-purple-400 font-black uppercase tracking-widest block mb-2">MÃ PHÒNG</span>
            <div 
              onClick={copyRoomCode}
              className="flex items-center justify-center gap-2 bg-[#0f172a] py-3 px-4 rounded-2xl border border-purple-500/40 cursor-pointer hover:bg-purple-900/40 active:scale-95 transition-all mb-3 shadow-md group"
            >
              <span className="text-2xl font-black tracking-widest text-purple-300">{code}</span>
              <Copy size={16} className="text-purple-400 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-slate-400 text-xs font-semibold leading-relaxed">
              Gửi mã phòng này cho đồng đội của bạn để bắt đầu trận đấu!
            </p>
          </div>

          <div className="w-full mt-6 border-t border-slate-800 pt-4 text-left">
            <h4 className="font-black text-xs text-slate-300 uppercase mb-3 tracking-wider">Chọn chủ đề click:</h4>
            <div className="flex flex-col gap-2">
              {themes.map((t) => {
                const IconComp = t.icon;
                const isSelected = selectedTheme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => onThemeSelect(t.id)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl border text-xs font-bold transition-all ${
                      isSelected 
                        ? 'bg-purple-900/60 border-purple-500 text-white shadow-md' 
                        : 'bg-[#0f172a] border-slate-800 text-slate-400 hover:text-slate-200'
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
        <div className="p-6 md:col-span-2 flex flex-col justify-between border border-slate-800 bg-[#1e293b]/90 rounded-3xl shadow-xl backdrop-blur-md">
          <div>
            <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
              <h3 className="font-black text-base text-white uppercase tracking-wider">Thành viên phòng ({players.length}/3)</h3>
              {players.length < 3 && (
                <button
                  onClick={onAddBot}
                  className="text-xs bg-purple-900/40 hover:bg-purple-900/70 border border-purple-500/40 text-purple-300 py-1.5 px-3 rounded-xl flex items-center gap-1 font-bold transition-all cursor-pointer"
                >
                  <Sparkles size={13} /> Thêm Bot AI
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
                      className={`flex justify-between items-center px-4 py-3.5 rounded-2xl border ${
                        isMe 
                          ? 'bg-purple-900/30 border-purple-500/60 shadow-md' 
                          : 'bg-[#0f172a] border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                          player.isBot ? 'bg-purple-900 text-purple-300' : 'bg-pink-900 text-pink-300'
                        }`}>
                          {player.name.charAt(0)}
                        </div>
                        <div className="font-extrabold text-white text-sm">
                          {player.name} {isMe ? '(Bạn)' : ''}
                          {player.isBot && <span className="ml-1.5 text-[9px] bg-purple-900/60 border border-purple-500/50 px-1.5 py-0.2 rounded text-purple-300 font-bold">AI</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {player.isReady ? (
                          <span className="text-[10px] bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 py-1 px-2.5 rounded-full font-black flex items-center gap-1">
                            <Check size={11} /> SẴN SÀNG
                          </span>
                        ) : (
                          <span className="text-[10px] bg-amber-950/60 border border-amber-500/50 text-amber-300 py-1 px-2.5 rounded-full font-black">
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
                      className="border border-dashed border-slate-700 rounded-2xl px-4 py-3.5 text-center text-slate-500 text-xs font-semibold flex items-center justify-center gap-2"
                    >
                      <span>Trống - Đang đợi đồng đội gia nhập...</span>
                    </div>
                  );
                }
              })}
            </div>
          </div>

          {/* Lobby Footer Action */}
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between border-t border-slate-800 pt-4 mt-2">
            <p className="text-xs text-slate-400 text-left leading-relaxed max-w-sm">
              💡 Trận đấu tự động bắt đầu ngay khi đủ <span className="font-bold text-purple-400">3 người chơi</span> và tất cả đều bấm <span className="font-bold text-emerald-400">SẴN SÀNG</span>.
            </p>
            <button
              onClick={onToggleReady}
              className={`w-full md:w-auto font-black text-sm py-3 px-8 rounded-2xl transition-all shadow-lg active:scale-95 cursor-pointer ${
                myPlayer?.isReady
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/20'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
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

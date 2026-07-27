import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import MainMenu from './components/MainMenu';
import ThemeSelector from './components/ThemeSelector';
import GameArea from './components/GameArea';
import MultiplayerLobby from './components/MultiplayerLobby';

function App() {
  // Connection states
  const [networkOnLine, setNetworkOnLine] = useState(navigator.onLine);
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef(null);

  // Global Navigation states
  // 'menu' | 'theme-select' | 'lobby' | 'playing' | 'gameover'
  const [gameScreen, setGameScreen] = useState('menu');
  const [playMode, setPlayMode] = useState(null); // 'online' | 'offline'
  const [onlineModeType, setOnlineModeType] = useState(null); // 'competitive' | 'coop'

  // Player & Room states
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('clicker_player_name') || 'Người chơi 1');
  const [roomCode, setRoomCode] = useState('');
  const [roomData, setRoomData] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState('monster');

  // Session-scoped game state
  const [offlineState, setOfflineState] = useState(() => {
    localStorage.removeItem('offline_clicker_state_v1');
    const saved = sessionStorage.getItem('session_clicker_state_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          money: parsed.money || 0,
          dpc: parsed.dpc || 1,
          dps: parsed.dps || 0,
          soulCrystals: parsed.soulCrystals || 0,
          totalClicks: parsed.totalClicks || 0,
          totalGoldEarned: parsed.totalGoldEarned || 0,
          rebirthCount: parsed.rebirthCount || 0,
          upgrades: {
            clicker: 0,
            battleAxe: 0,
            diamondSword: 0,
            pickaxe: 0,
            minecart: 0,
            drill: 0,
            excavator: 0,
            miningRig: 0,
            ...(parsed.upgrades || {})
          }
        };
      } catch (e) { /* use default */ }
    }
    return {
      money: 0,
      dpc: 1,
      dps: 0,
      soulCrystals: 0,
      totalClicks: 0,
      totalGoldEarned: 0,
      rebirthCount: 0,
      upgrades: {
        clicker: 0, battleAxe: 0, diamondSword: 0,
        pickaxe: 0, minecart: 0, drill: 0,
        excavator: 0, miningRig: 0
      }
    };
  });

  useEffect(() => {
    sessionStorage.setItem('session_clicker_state_v1', JSON.stringify(offlineState));
  }, [offlineState]);

  useEffect(() => {
    localStorage.setItem('offline_clicker_state_v1', JSON.stringify(offlineState));
  }, [offlineState]);

  // Track network connectivity
  useEffect(() => {
    const handleOnline = () => setNetworkOnLine(true);
    const handleOffline = () => { setNetworkOnLine(false); setSocketConnected(false); };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, []);

  // Socket.io connection — created ONCE on mount
  useEffect(() => {
    const isGitHubPages = window.location.hostname.includes('github.io');
    if (isGitHubPages) { setSocketConnected(false); return; }

    let socket;
    try {
      socket = io(window.location.origin, {
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
        autoConnect: true
      });
      socketRef.current = socket;
      socket.on('connect', () => setSocketConnected(true));
      socket.on('disconnect', () => setSocketConnected(false));
      socket.on('connect_error', () => setSocketConnected(false));
      socket.on('roomUpdated', (data) => { setRoomData(data); if (data.code) setRoomCode(data.code); });
      socket.on('gameStarted', (data) => { setRoomData(data); setGameScreen('playing'); });
      socket.on('gameFinished', (data) => { setRoomData(data); setGameScreen('gameover'); });
    } catch (err) { setSocketConnected(false); }

    return () => { if (socket) socket.disconnect(); };
  }, []);

  const isOnlineAvailable = networkOnLine && socketConnected;

  const handleSaveName = (name) => {
    setPlayerName(name);
    localStorage.setItem('clicker_player_name', name);
  };

  const handleCreateRoom = (modeType) => {
    if (!isOnlineAvailable) return;
    setOnlineModeType(modeType);
    socketRef.current.emit('createRoom', { mode: modeType, playerName: playerName || 'Người chơi 1' }, (response) => {
      if (response && response.success) { setRoomData(response.room); setRoomCode(response.room.code); setGameScreen('lobby'); }
      else alert('Không thể tạo phòng. Vui lòng thử lại!');
    });
  };

  const handleJoinRoom = (code) => {
    if (!isOnlineAvailable) return;
    socketRef.current.emit('joinRoom', { code, playerName: playerName || 'Người chơi 2' }, (response) => {
      if (response && response.success) { setRoomData(response.room); setRoomCode(response.room.code); setOnlineModeType(response.room.mode); setGameScreen('lobby'); }
      else alert(response.message || 'Mã phòng không hợp lệ!');
    });
  };

  const handleAddBot = () => {
    if (!isOnlineAvailable || !roomCode) return;
    socketRef.current.emit('addBot', { code: roomCode }, (res) => { if (!res.success) alert(res.message); });
  };

  const handleToggleReady = () => {
    if (!isOnlineAvailable || !roomCode) return;
    socketRef.current.emit('toggleReady', { code: roomCode });
  };

  const handleOnlineClick = () => {
    if (!isOnlineAvailable || !roomCode) return;
    socketRef.current.emit('clickItem', { code: roomCode });
  };

  const handleBuyCompUpgrade = (upgradeId) => {
    if (!isOnlineAvailable || !roomCode) return;
    socketRef.current.emit('buyCompUpgrade', { code: roomCode, upgradeId }, (res) => { if (!res.success) alert(res.message); });
  };

  const handleBuyCoopUpgrade = (upgradeId) => {
    if (!isOnlineAvailable || !roomCode) return;
    socketRef.current.emit('buyCoopUpgrade', { code: roomCode, upgradeId }, (res) => { if (!res.success) alert(res.message); });
  };

  const handleBackToMenu = () => {
    setGameScreen('menu');
    setPlayMode(null);
    setOnlineModeType(null);
    setRoomCode('');
    setRoomData(null);
  };

  return (
    <div
      className="min-h-screen w-full bg-[#0f172a]"
      style={{ fontFamily: "'Press Start 2P', 'Silkscreen', monospace" }}
    >
      {/* ── Screen Router: each screen is full-width, no centering wrapper ── */}

      {gameScreen === 'menu' && (
        <MainMenu
          isOnline={isOnlineAvailable}
          playerName={playerName}
          onSaveName={handleSaveName}
          onSelectOffline={() => { setPlayMode('offline'); setGameScreen('theme-select'); }}
          onSelectOnlineComp={() => { setPlayMode('online'); handleCreateRoom('competitive'); }}
          onSelectOnlineCoop={() => { setPlayMode('online'); handleCreateRoom('coop'); }}
          onJoinRoom={handleJoinRoom}
        />
      )}

      {gameScreen === 'theme-select' && (
        <ThemeSelector
          selectedTheme={selectedTheme}
          onSelectTheme={(themeName) => { setSelectedTheme(themeName); setGameScreen('playing'); }}
          onBack={handleBackToMenu}
        />
      )}

      {gameScreen === 'lobby' && (
        <MultiplayerLobby
          roomData={roomData}
          socketId={socketRef.current?.id}
          onToggleReady={handleToggleReady}
          onAddBot={handleAddBot}
          onLeave={handleBackToMenu}
          onThemeSelect={(t) => setSelectedTheme(t)}
          selectedTheme={selectedTheme}
        />
      )}

      {gameScreen === 'playing' && (
        <GameArea
          mode={playMode}
          onlineType={onlineModeType}
          theme={selectedTheme}
          offlineState={offlineState}
          setOfflineState={setOfflineState}
          roomData={roomData}
          socketId={socketRef.current?.id}
          onOnlineClick={handleOnlineClick}
          onBuyCompUpgrade={handleBuyCompUpgrade}
          onBuyCoopUpgrade={handleBuyCoopUpgrade}
          onLeave={handleBackToMenu}
          socket={socketRef.current}
        />
      )}

      {gameScreen === 'gameover' && roomData && (
        <div
          className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#0f172a]"
          style={{ fontFamily: "'Silkscreen', monospace" }}
        >
          <div className="bg-[#1e293b] border-4 border-amber-500 max-w-2xl w-full p-8 shadow-[6px_6px_0_#000] text-center">
            <h2 className="text-lg font-black text-amber-400 mb-4 uppercase">🏆 KẾT QUẢ TRẬN ĐẤU 🏆</h2>
            <p className="text-slate-300 mb-6 text-xs">Trận đấu competitive đã kết thúc! Thứ hạng:</p>

            <div className="flex flex-col gap-3 mb-8">
              {[...roomData.players].sort((a, b) => b.score - a.score).map((player, idx) => {
                const isMe = player.id === socketRef.current?.id;
                const rankBg = ['bg-amber-900/40 border-amber-500', 'bg-slate-700/40 border-slate-500', 'bg-orange-900/40 border-orange-700'];
                return (
                  <div key={player.id} className={`flex justify-between items-center px-4 py-3 border-2 ${idx < 3 ? rankBg[idx] : 'bg-[#0f172a] border-[#334155]'} ${isMe ? 'ring-2 ring-purple-500' : ''}`}>
                    <div className="flex items-center gap-3 text-xs font-black">
                      <span>#{idx + 1}</span>
                      <span>{player.name} {isMe ? '(Bạn)' : ''}</span>
                      {player.isBot && <span className="text-[8px] bg-purple-900 border border-purple-500 px-1 text-purple-300">AI</span>}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-amber-400">{player.score.toLocaleString()}🪙</div>
                      <div className="text-[9px] text-slate-400">{player.clicks} Click</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleBackToMenu}
              className="bg-amber-400 border-b-4 border-amber-700 border-2 border-amber-300 text-black text-xs font-black px-8 py-3 uppercase shadow-[4px_4px_0_#000] hover:bg-amber-300 active:translate-y-1 transition-all"
            >
              Trở về Menu Chính
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

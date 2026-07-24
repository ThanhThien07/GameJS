import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Wifi, WifiOff, Globe, HardDrive } from 'lucide-react';
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
  const [playerName, setPlayerName] = useState(localStorage.getItem('clicker_player_name') || '');
  const [roomCode, setRoomCode] = useState('');
  const [roomData, setRoomData] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState('monster'); // 'monster' | 'wood' | 'stone'

  // Offline game state (stored in localStorage)
  const [offlineState, setOfflineState] = useState(() => {
    const saved = localStorage.getItem('offline_clicker_state_v1');
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
        clicker: 0,
        battleAxe: 0,
        diamondSword: 0,
        pickaxe: 0,
        minecart: 0,
        drill: 0,
        excavator: 0,
        miningRig: 0
      }
    };
  });

  // Track network connectivity
  useEffect(() => {
    const handleOnline = () => setNetworkOnLine(true);
    const handleOffline = () => {
      setNetworkOnLine(false);
      setSocketConnected(false);
      // Force offline screen transition if we were online playing
      if (playMode === 'online') {
        alert('Mất kết nối mạng! Trò chơi đã được chuyển về chế độ Ngoại tuyến.');
        setPlayMode('offline');
        setGameScreen('menu');
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Socket.io connection setup (only connect if not static GitHub Pages without backend)
    const isGitHubPages = window.location.hostname.includes('github.io');
    let createdSocket = null;
    
    if (!isGitHubPages) {
      try {
        createdSocket = io(window.location.origin, {
          reconnectionAttempts: 3,
          timeout: 5000,
          autoConnect: true
        });
        
        socketRef.current = createdSocket;

        createdSocket.on('connect', () => {
          console.log('Connected to server over Socket.io');
          setSocketConnected(true);
        });

        createdSocket.on('disconnect', () => {
          console.log('Disconnected from server');
          setSocketConnected(false);
          if (playMode === 'online') {
            alert('Mất kết nối tới máy chủ! Trở về menu chính.');
            setPlayMode(null);
            setGameScreen('menu');
          }
        });

        createdSocket.on('connect_error', () => {
          setSocketConnected(false);
        });

        // Real-time room listeners
        createdSocket.on('roomUpdated', (data) => {
          setRoomData(data);
          if (data.code) setRoomCode(data.code);
        });

        createdSocket.on('gameStarted', (data) => {
          setRoomData(data);
          setGameScreen('playing');
        });

        createdSocket.on('gameFinished', (data) => {
          setRoomData(data);
          setGameScreen('gameover');
        });
      } catch (err) {
        console.warn('Socket connection skipped or failed:', err);
        setSocketConnected(false);
      }
    } else {
      setSocketConnected(false);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      // Only disconnect if a socket was actually created
      if (createdSocket) {
        createdSocket.disconnect();
      }
    };
  }, [playMode]);

  // Persist offline state to localStorage on changes
  useEffect(() => {
    localStorage.setItem('offline_clicker_state_v1', JSON.stringify(offlineState));
  }, [offlineState]);

  // Combined Online Status (system is online AND backend socket is connected)
  const isOnlineAvailable = networkOnLine && socketConnected;

  // Persist player name
  const handleSaveName = (name) => {
    setPlayerName(name);
    localStorage.setItem('clicker_player_name', name);
  };

  // Create Socket Room
  const handleCreateRoom = (modeType) => {
    if (!isOnlineAvailable) return;
    setOnlineModeType(modeType);
    
    socketRef.current.emit('createRoom', { 
      mode: modeType, 
      playerName: playerName || 'Người chơi 1' 
    }, (response) => {
      if (response && response.success) {
        setRoomData(response.room);
        setRoomCode(response.room.code);
        setGameScreen('lobby');
      } else {
        alert('Không thể tạo phòng. Vui lòng thử lại!');
      }
    });
  };

  // Join Socket Room
  const handleJoinRoom = (code) => {
    if (!isOnlineAvailable) return;
    
    socketRef.current.emit('joinRoom', { 
      code, 
      playerName: playerName || 'Người chơi 2' 
    }, (response) => {
      if (response && response.success) {
        setRoomData(response.room);
        setRoomCode(response.room.code);
        setOnlineModeType(response.room.mode);
        setGameScreen('lobby');
      } else {
        alert(response.message || 'Mã phòng không hợp lệ!');
      }
    });
  };

  // Add Bot to current room
  const handleAddBot = () => {
    if (!isOnlineAvailable || !roomCode) return;
    socketRef.current.emit('addBot', { code: roomCode }, (res) => {
      if (!res.success) alert(res.message);
    });
  };

  // Toggle Ready in current room
  const handleToggleReady = () => {
    if (!isOnlineAvailable || !roomCode) return;
    socketRef.current.emit('toggleReady', { code: roomCode });
  };

  // Online Click Action
  const handleOnlineClick = () => {
    if (!isOnlineAvailable || !roomCode) return;
    socketRef.current.emit('clickItem', { code: roomCode });
  };

  // Buy upgrade in competitive mode
  const handleBuyCompUpgrade = (upgradeId) => {
    if (!isOnlineAvailable || !roomCode) return;
    socketRef.current.emit('buyCompUpgrade', { code: roomCode, upgradeId }, (res) => {
      if (!res.success) alert(res.message);
    });
  };

  // Buy shared upgrade in co-op mode
  const handleBuyCoopUpgrade = (upgradeId) => {
    if (!isOnlineAvailable || !roomCode) return;
    socketRef.current.emit('buyCoopUpgrade', { code: roomCode, upgradeId }, (res) => {
      if (!res.success) alert(res.message);
    });
  };

  // Return to menu
  const handleBackToMenu = () => {
    setGameScreen('menu');
    setPlayMode(null);
    setOnlineModeType(null);
    setRoomCode('');
    setRoomData(null);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between items-center py-4 relative">
      {/* Network & Mode status header */}
      <header className="w-full max-w-4xl flex flex-wrap justify-between items-center px-4 py-3 glass-panel z-10 gap-3 mb-6">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-lg tracking-wider gradient-text">
            🌟 SIÊU CLICKER TAM HỢP 🌟
          </span>
          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">v1.1.0</span>
        </div>

        {/* Real-time Connectivity Status Badge */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {isOnlineAvailable ? (
              <span className="status-badge status-online">
                <Wifi size={14} className="animate-pulse" /> Trực Tuyến
              </span>
            ) : (
              <span className="status-badge status-offline">
                <WifiOff size={14} /> Ngoại Tuyến
              </span>
            )}
          </div>
          
          {playMode && (
            <div className="flex items-center gap-1.5 text-sm bg-purple-100 px-3 py-1 rounded-full border border-purple-300">
              {playMode === 'online' ? <Globe size={14} className="text-purple-600" /> : <HardDrive size={14} className="text-pink-600" />}
              <span className="capitalize font-semibold text-purple-700">
                {playMode === 'online' ? `Online (${onlineModeType === 'coop' ? 'Hợp Tác' : 'Thi Đấu'})` : 'Offline'}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Screen Router */}
      <main className="w-full flex-grow flex justify-center items-center px-2">
        {gameScreen === 'menu' && (
          <MainMenu
            isOnline={isOnlineAvailable}
            playerName={playerName}
            onSaveName={handleSaveName}
            onSelectOffline={() => {
              setPlayMode('offline');
              setGameScreen('theme-select');
            }}
            onSelectOnlineComp={() => {
              setPlayMode('online');
              handleCreateRoom('competitive');
            }}
            onSelectOnlineCoop={() => {
              setPlayMode('online');
              handleCreateRoom('coop');
            }}
            onJoinRoom={handleJoinRoom}
          />
        )}

        {gameScreen === 'theme-select' && (
          <ThemeSelector
            onSelectTheme={(themeName) => {
              setSelectedTheme(themeName);
              setGameScreen('playing');
            }}
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
          <div className="w-full max-w-2xl glass-panel p-8 text-center animate-bounce-slow">
            <h2 className="text-3xl font-extrabold text-neon-glow text-yellow-400 mb-6 tracking-wide">🏆 KẾT QUẢ TRẬN ĐẤU 🏆</h2>
            <p className="text-gray-300 mb-6 font-medium text-lg">Trận đấu competitive đã kết thúc! Thứ hạng các người chơi:</p>
            
            <div className="space-y-4 mb-8">
              {[...roomData.players]
                .sort((a, b) => b.score - a.score)
                .map((player, idx) => {
                  const isMe = player.id === socketRef.current?.id;
                  const rankColors = ['bg-yellow-500/25 border-yellow-500 text-yellow-300', 'bg-slate-400/25 border-slate-400 text-slate-300', 'bg-amber-700/25 border-amber-700 text-amber-500'];
                  return (
                    <div 
                      key={player.id} 
                      className={`flex justify-between items-center px-6 py-4 rounded-xl border ${idx < 3 ? rankColors[idx] : 'bg-gray-800/40 border-gray-700'} ${isMe ? 'ring-2 ring-purple-500' : ''}`}
                    >
                      <div className="flex items-center gap-3 font-semibold">
                        <span className="text-xl font-black">#{idx + 1}</span>
                        <span>{player.name} {isMe ? '(Bạn)' : ''}</span>
                        {player.isBot && <span className="text-xs bg-purple-900/60 px-1.5 py-0.5 rounded text-purple-300 border border-purple-700">AI</span>}
                      </div>
                      <div className="text-right">
                        <div className="font-extrabold text-xl">{player.score.toLocaleString()}💰</div>
                        <div className="text-xs opacity-75">{player.clicks} Click</div>
                      </div>
                    </div>
                  );
                })}
            </div>

            <button onClick={handleBackToMenu} className="btn-primary">
              Trở về Menu Chính
            </button>
          </div>
        )}
      </main>

      <footer className="mt-8 text-xs text-slate-400 font-medium">
        Nguyễn Hoàng Hùng (501250384) — Dự Án Game Clicker Học Tập
      </footer>
    </div>
  );
}

export default App;

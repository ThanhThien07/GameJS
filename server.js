import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import mysql from 'mysql2/promise';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// MySQL Connection Pool Setup for Railway & Cloud DB
let dbPool = null;
const dbHost = process.env.MYSQLHOST || process.env.DB_HOST;
const dbUser = process.env.MYSQLUSER || process.env.DB_USER;

if (dbHost && dbUser) {
  try {
    dbPool = mysql.createPool({
      host: dbHost,
      port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
      user: dbUser,
      password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
      database: process.env.MYSQL_DATABASE || process.env.MYSQLDATABASE || process.env.DB_NAME || 'railway',
      waitForConnections: true,
      connectionLimit: 10
    });
    console.log(`🐬 MySQL Pool initialized for host: ${dbHost}`);
  } catch (err) {
    console.warn('MySQL pool initialization skipped:', err.message);
  }
}

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, 'dist')));

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Port configuration
const PORT = process.env.PORT || 3000;

// Game State Management
const rooms = new Map();

// Helper to generate a room code
function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Bot upgrade options
const COMP_UPGRADES = [
  { id: 'clicker', name: 'Clicker', cost: 10, mult: 1.5, type: 'dpc', val: 1 },
  { id: 'pickaxe', name: 'Pickaxe', cost: 50, mult: 1.6, type: 'dps', val: 1 },
  { id: 'minecart', name: 'Mine Cart', cost: 250, mult: 1.7, type: 'dps', val: 8 },
  { id: 'drill', name: 'Drill', cost: 1000, mult: 1.8, type: 'dps', val: 50 }
];

// Server ticks for active games
setInterval(() => {
  if (rooms.size === 0) return; // Skip when no active rooms
  rooms.forEach((room, roomCode) => {
    if (room.status === 'playing') {
      // 1. Handle time ticking down for competitive mode
      if (room.mode === 'competitive') {
        room.timer -= 1;
        
        // Auto-clicker income (DPS) for competitive mode players (including bots)
        room.players.forEach(player => {
          if (player.dps > 0) {
            player.score += player.dps;
          }
        });

        // Simple Bot AI clicks & upgrades in competitive mode
        room.players.forEach(player => {
          if (player.isBot) {
            // Bot clicks: simulate click rate
            const botClickPower = player.dpc;
            const clickCount = Math.floor(Math.random() * 4) + 1; // 1-4 clicks/sec
            player.score += botClickPower * clickCount;
            player.clicks += clickCount;

            // Bot buys upgrade if it has enough score
            // Choose a random upgrade that the bot can afford
            const affordable = COMP_UPGRADES.filter(up => player.score >= getUpgradeCost(up.cost, player.upgrades[up.id] || 0));
            if (affordable.length > 0 && Math.random() < 0.4) {
              const upgrade = affordable[Math.floor(Math.random() * affordable.length)];
              const currentLevel = player.upgrades[upgrade.id] || 0;
              const cost = getUpgradeCost(upgrade.cost, currentLevel);
              player.score -= cost;
              player.upgrades[upgrade.id] = currentLevel + 1;
              if (upgrade.type === 'dpc') {
                player.dpc += upgrade.val;
              } else {
                player.dps += upgrade.val;
              }
            }
          }
        });

        if (room.timer <= 0) {
          room.status = 'gameover';
          io.to(roomCode).emit('gameFinished', room);
        } else {
          io.to(roomCode).emit('roomUpdated', room);
        }
      }

      // 2. Co-op Mode (Chế độ 3)
      if (room.mode === 'coop') {
        // Ticking auto clicker resources for co-op mode (shared pool)
        const autoClickerDps = room.coopUpgrades.autoClick.level * 2;
        if (autoClickerDps > 0) {
          room.coopResources.money += autoClickerDps;
          
          // Auto clicks also have a small chance to drop materials (1% per auto-dps)
          for (let i = 0; i < autoClickerDps; i++) {
            if (Math.random() < 0.05) {
              const items = ['wood', 'stone', 'meat'];
              const item = items[Math.floor(Math.random() * items.length)];
              room.coopResources[item] += 1;
            }
          }
        }

        // Simulate Bot clicks in co-op mode
        room.players.forEach(player => {
          if (player.isBot) {
            // Bots click and contribute to shared money
            const damageUpgradeLevel = room.coopUpgrades.damage.level;
            const multiplier = 1 + (room.coopUpgrades.multiplier.level - 1) * 0.2;
            const clickVal = Math.floor(damageUpgradeLevel * multiplier);

            const clickCount = Math.floor(Math.random() * 3) + 1;
            room.coopResources.money += clickVal * clickCount;

            // Materials drop rate for bot clicks (10% chance)
            for (let i = 0; i < clickCount; i++) {
              if (Math.random() < 0.10) {
                const items = ['wood', 'stone', 'meat'];
                const item = items[Math.floor(Math.random() * items.length)];
                room.coopResources[item] += 1;
              }
            }
          }
        });

        io.to(roomCode).emit('roomUpdated', room);
      }
    }
  });
}, 1000);

// Helper function to calculate upgrade cost dynamically
function getUpgradeCost(base, level) {
  return Math.floor(base * Math.pow(1.5, level));
}

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Ping endpoint for online status check
  socket.on('ping_status', (callback) => {
    if (typeof callback === 'function') callback({ status: 'ok' });
  });

  // 1. Create Game Room
  socket.on('createRoom', ({ mode, playerName }, callback) => {
    const code = generateRoomCode();
    
    const newRoom = {
      code,
      mode, // 'competitive' or 'coop'
      status: 'lobby', // 'lobby', 'playing', 'gameover'
      timer: 60, // competitive timer (seconds)
      players: [
        {
          id: socket.id,
          name: playerName || 'Player 1',
          score: 0,
          clicks: 0,
          dpc: 1, // damage per click
          dps: 0, // damage per second (auto clicker)
          upgrades: { clicker: 0, pickaxe: 0, minecart: 0, drill: 0 },
          isBot: false,
          isReady: false
        }
      ],
      coopResources: {
        money: 0,
        wood: 0,
        stone: 0,
        meat: 0
      },
      coopUpgrades: {
        damage: { level: 1, baseCost: { meat: 10, wood: 10 } },
        multiplier: { level: 1, baseCost: { stone: 15, wood: 15 } },
        autoClick: { level: 0, baseCost: { meat: 20, stone: 20 } }
      }
    };

    rooms.set(code, newRoom);
    socket.join(code);
    
    console.log(`Room created: ${code} in mode ${mode} by ${playerName}`);
    if (typeof callback === 'function') callback({ success: true, room: newRoom });
  });

  // 2. Join Game Room
  socket.on('joinRoom', ({ code, playerName }, callback) => {
    const roomCode = code.toUpperCase();
    const room = rooms.get(roomCode);

    if (!room) {
      return callback({ success: false, message: 'Mã phòng không tồn tại!' });
    }

    if (room.status !== 'lobby') {
      return callback({ success: false, message: 'Trận đấu đang diễn ra hoặc đã kết thúc!' });
    }

    if (room.players.length >= 3) {
      return callback({ success: false, message: 'Phòng đã đầy (tối đa 3 người)!' });
    }

    const newPlayer = {
      id: socket.id,
      name: playerName || `Player ${room.players.length + 1}`,
      score: 0,
      clicks: 0,
      dpc: 1,
      dps: 0,
      upgrades: { clicker: 0, pickaxe: 0, minecart: 0, drill: 0 },
      isBot: false,
      isReady: false
    };

    room.players.push(newPlayer);
    socket.join(roomCode);

    console.log(`${playerName} joined room ${roomCode}`);
    io.to(roomCode).emit('roomUpdated', room);
    if (typeof callback === 'function') callback({ success: true, room });
  });

  // 3. Add AI Bot to Room (to help solo players test multiplayer)
  socket.on('addBot', ({ code }, callback) => {
    const room = rooms.get(code);
    if (!room) return callback({ success: false, message: 'Không tìm thấy phòng!' });
    if (room.players.length >= 3) return callback({ success: false, message: 'Phòng đã đầy!' });

    const botNames = ['SuperClicker_AI', 'IronFinger_Bot', 'TappingMaster_AI', 'SwiftClick_AI', 'ChopBot_9000'];
    const randomName = botNames[Math.floor(Math.random() * botNames.length)];
    
    const botPlayer = {
      id: `bot_${Math.random()}`,
      name: `${randomName} (AI)`,
      score: 0,
      clicks: 0,
      dpc: 1,
      dps: 0,
      upgrades: { clicker: 0, pickaxe: 0, minecart: 0, drill: 0 },
      isBot: true,
      isReady: true // Bots are always ready
    };

    room.players.push(botPlayer);
    console.log(`Bot added to room ${code}: ${botPlayer.name}`);
    io.to(code).emit('roomUpdated', room);
    if (typeof callback === 'function') callback({ success: true, room });
  });

  // 4. Toggle Player Ready State
  socket.on('toggleReady', ({ code }) => {
    const room = rooms.get(code);
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (player) {
      player.isReady = !player.isReady;
      console.log(`Player ${player.name} ready state: ${player.isReady}`);
      io.to(code).emit('roomUpdated', room);

      // Auto start game if >= 2 players/bots are in the room and all are ready
      const allReady = room.players.every(p => p.isReady);
      if (room.players.length >= 2 && allReady) {
        room.status = 'playing';
        io.to(code).emit('gameStarted', room);
        console.log(`Game started in room ${code}`);
      }
    }
  });

  // 5. Click Action
  socket.on('clickItem', ({ code }) => {
    const room = rooms.get(code);
    if (!room || room.status !== 'playing') return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;

    player.clicks += 1;

    if (room.mode === 'competitive') {
      // In competitive, click adds to individual score
      player.score += player.dpc;
      io.to(code).emit('roomUpdated', room);
    } else if (room.mode === 'coop') {
      // In co-op, click damage depends on shared damage level and multiplier
      const damageUpgradeLevel = room.coopUpgrades.damage.level;
      // multiplier increases DPC by +20% per level (level 1 is 1x, level 2 is 1.2x...)
      const multiplier = 1 + (room.coopUpgrades.multiplier.level - 1) * 0.2;
      const clickVal = Math.floor(damageUpgradeLevel * multiplier);

      room.coopResources.money += clickVal;

      // Random drop chance (10% chance to drop Wood, Stone, or Meat)
      if (Math.random() < 0.10) {
        const dropTypes = ['wood', 'stone', 'meat'];
        const droppedItem = dropTypes[Math.floor(Math.random() * dropTypes.length)];
        room.coopResources[droppedItem] += 1;
        
        // Broadcast specific drop event for flying resource animation
        io.to(code).emit('resourceDropped', { 
          player: player.name, 
          item: droppedItem, 
          x: Math.random() * 40 + 30, // center areas
          y: Math.random() * 40 + 30 
        });
      }

      io.to(code).emit('roomUpdated', room);
    }
  });

  // 6. Buy Upgrade in Competitive Mode
  socket.on('buyCompUpgrade', ({ code, upgradeId }, callback) => {
    const room = rooms.get(code);
    if (!room || room.status !== 'playing') return callback?.({ success: false, message: 'Trận chưa bắt đầu hoặc phòng không tồn tại!' });

    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;

    const upgrade = COMP_UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade) return callback({ success: false, message: 'Nâng cấp không tồn tại!' });

    const currentLevel = player.upgrades[upgradeId] || 0;
    const cost = getUpgradeCost(upgrade.cost, currentLevel);

    if (player.score < cost) {
      return callback({ success: false, message: 'Không đủ tiền!' });
    }

    player.score -= cost;
    player.upgrades[upgradeId] = currentLevel + 1;

    if (upgrade.type === 'dpc') {
      player.dpc += upgrade.val;
    } else {
      player.dps += upgrade.val;
    }

    console.log(`${player.name} bought upgrade ${upgradeId} to level ${player.upgrades[upgradeId]}`);
    io.to(code).emit('roomUpdated', room);
    callback({ success: true });
  });

  // 7. Buy Shared Upgrade in Co-op Mode
  socket.on('buyCoopUpgrade', ({ code, upgradeId }, callback) => {
    const room = rooms.get(code);
    if (!room || room.status !== 'playing') return callback?.({ success: false, message: 'Trận chưa bắt đầu hoặc phòng không tồn tại!' });

    const upgrade = room.coopUpgrades[upgradeId];
    if (!upgrade) return callback({ success: false, message: 'Nâng cấp không hợp lệ!' });

    const lvl = upgrade.level;
    // Costs scale up by level: cost = base * 1.5 ^ (level - 1)
    const costFactor = Math.pow(1.5, lvl - 1);
    
    let requiredMeat = 0;
    let requiredWood = 0;
    let requiredStone = 0;

    if (upgradeId === 'damage') {
      requiredMeat = Math.floor(upgrade.baseCost.meat * costFactor);
      requiredWood = Math.floor(upgrade.baseCost.wood * costFactor);
    } else if (upgradeId === 'multiplier') {
      requiredStone = Math.floor(upgrade.baseCost.stone * costFactor);
      requiredWood = Math.floor(upgrade.baseCost.wood * costFactor);
    } else if (upgradeId === 'autoClick') {
      requiredMeat = Math.floor(upgrade.baseCost.meat * costFactor);
      requiredStone = Math.floor(upgrade.baseCost.stone * costFactor);
    }

    if (
      room.coopResources.meat < requiredMeat ||
      room.coopResources.wood < requiredWood ||
      room.coopResources.stone < requiredStone
    ) {
      return callback({ success: false, message: 'Không đủ nguyên liệu nâng cấp!' });
    }

    // Deduct resources
    room.coopResources.meat -= requiredMeat;
    room.coopResources.wood -= requiredWood;
    room.coopResources.stone -= requiredStone;
    
    // Increment upgrade level
    upgrade.level += 1;

    console.log(`Coop Upgrade bought in room ${code}: ${upgradeId} to level ${upgrade.level}`);
    io.to(code).emit('roomUpdated', room);
    callback({ success: true });
  });

  // 8. Player Disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    
    rooms.forEach((room, roomCode) => {
      const index = room.players.findIndex(p => p.id === socket.id);
      if (index !== -1) {
        const removedPlayer = room.players.splice(index, 1)[0];
        console.log(`Removed player ${removedPlayer.name} from room ${roomCode}`);
        
        // If no human players left, clean up the room
        const hasHumans = room.players.some(p => !p.isBot);
        if (!hasHumans) {
          rooms.delete(roomCode);
          console.log(`Room ${roomCode} deleted due to empty human players`);
        } else {
          io.to(roomCode).emit('roomUpdated', room);
        }
      }
    });
  });
});

// Wildcard client routing - serve React UI in production
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on 0.0.0.0:${PORT}`);
});

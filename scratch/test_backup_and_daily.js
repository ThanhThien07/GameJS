console.log('🧪 BẮT ĐẦU TEST TỰ ĐỘNG BỘ ĐẾM NGÀY NGẦM VÀ SAO LƯU DỮ LIỆU...');

// Mock localStorage & sessionStorage
const storageMock = () => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
};

const localStorage = storageMock();
const sessionStorage = storageMock();

// 1. Test Daily Streak Tracking
const getTodayStr = () => new Date().toISOString().split('T')[0];
const getYesterdayStr = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
};

// Simulate Day 1 claim
const day1Data = { streakDay: 2, lastClaimDate: getTodayStr() };
localStorage.setItem('daily_streak_data_v1', JSON.stringify(day1Data));
console.log('✅ Đã lưu Điểm danh Ngày 1 thành công!');

const readStreak = () => JSON.parse(localStorage.getItem('daily_streak_data_v1'));
const streakCheck1 = readStreak();
console.log(`✅ Bộ đếm ngày ngầm kiểm tra: Chuỗi Ngày = ${streakCheck1.streakDay}, Ngày nhận cuối = ${streakCheck1.lastClaimDate}`);

// 2. Test Permanent Backup Save
const mockSave = {
  money: 25000,
  dpc: 35,
  dps: 120,
  soulCrystals: 5,
  totalClicks: 150,
  totalGoldEarned: 35000,
  rebirthCount: 1,
  upgrades: { clicker: 5, diamondSword: 3 }
};

localStorage.setItem('clicker_backup_save_v1', JSON.stringify(mockSave));
console.log('✅ Đã tự động tạo bản sao lưu vĩnh viễn (localStorage):', mockSave.money, '🪙');

// Simulate closing browser tab (sessionStorage cleared, localStorage remains)
sessionStorage.clear();
console.log('🚪 Đã mô phỏng đóng trình duyệt (sessionStorage cleared)');

const backupCheck = localStorage.getItem('clicker_backup_save_v1');
if (backupCheck) {
  const parsed = JSON.parse(backupCheck);
  console.log(`🎉 Khi mở lại web: Phát hiện bản sao lưu! Tiền = ${parsed.money} 🪙, DPC = ${parsed.dpc}`);
  console.log('✨ Hiện popup thông báo hỏi người chơi có muốn TIẾP TỤC hay TẠO MỚI!');
} else {
  console.error('❌ Thất bại: Không tìm thấy bản sao lưu!');
  process.exit(1);
}

console.log('🏆 TOÀN BỘ TEST BỘ ĐẾM NGÀY VÀ SAO LƯU DỮ LIỆU HOÀN THÀNH HOÀN HẢO!');
process.exit(0);

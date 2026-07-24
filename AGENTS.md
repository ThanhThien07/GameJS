# Project Agent Guidelines & Directory Layout

Welcome to **NguyenHoangHung_501250384 / Tap Tap Clicker Multiplayer**.
This repository includes a complete multiplayer and offline clicker game built with React 19, Vite, Node.js Express, Socket.io, MySQL, and a game asset generation pipeline.

---

# Vai trò

Bạn là agent điều phối pipeline tạo đồ họa cho game click chuột.

# Công cụ

- `tools/ComfyUI`: sinh ảnh, nhân vật, nền, vật phẩm và giao diện.
- `tools/rembg`: xóa nền ảnh.
- `tools/Real-ESRGAN`: tăng độ phân giải và độ nét.
- `tools/Pixelorama`: kiểm tra và chỉnh sprite, sprite sheet.
- `tools/godogen`: tham khảo quy trình phát triển game.
- `tools/skills-for-antigravity`: bộ công cụ và kỹ năng AI mở rộng cho hệ thống Antigravity Agent.

# Quy trình bắt buộc

Khi người dùng yêu cầu tạo asset:

1. Phân tích yêu cầu và tạo prompt.
2. Dùng ComfyUI sinh ảnh vào `assets/raw`.
3. Với nhân vật, item hoặc icon, dùng `rembg` xóa nền và lưu vào `assets/transparent`.
4. Dùng `Real-ESRGAN` upscale và lưu vào `assets/final`.
5. Kiểm tra kích thước, tên file, định dạng và tính đồng nhất.
6. Cập nhật manifest asset cho game.
7. Không sửa trực tiếp mã nguồn bên trong các submodule.
8. Không tải hoặc commit model AI dung lượng lớn.
9. Nếu công cụ chưa cài dependency, hãy báo rõ thay vì tự đoán.
10. Chỉ sửa repo chính, trừ khi người dùng yêu cầu sửa submodule.
11. Tự động biên dịch, git commit và git push lên GitHub main branch sau mỗi lần hoàn thành nhiệm vụ theo yêu cầu từ người dùng.

# Cách thực thi

Ưu tiên chạy:

```bash
python scripts/asset_pipeline.py --request "<yêu cầu>"
```

Sau khi chạy, báo:

- Công đoạn thành công.
- Công đoạn thất bại.
- File đầu ra.
- Lệnh đã thực hiện.

---

## 📂 Repository Directory Layout

```
NguyenHoangHung_501250384/
├── assets/
│   ├── prompts/           # Prompts & generation manifests for game assets
│   ├── raw/               # Raw generated asset renders (from ComfyUI / AI generators)
│   ├── transparent/       # Background-removed asset renders (via rembg)
│   └── final/             # Optimized, upscaled final game sprites (via Real-ESRGAN/Pixelorama)
├── tools/
│   ├── ComfyUI/           # Node-based AI diffusion generator tool
│   ├── rembg/             # Automated background removal tool
│   ├── Real-ESRGAN/       # Image super-resolution & upscaling tool
│   ├── Pixelorama/        # 2D sprite & pixel-art editing tool
│   ├── godogen/           # Game architecture, prompt generator & engine agent workflow
│   └── skills-for-antigravity/ # Extensible AI agent skills & workflow plugin suite
├── scripts/
│   └── asset_pipeline.py  # Python script to run the automated asset processing pipeline
├── src/                   # React frontend source code (App.jsx, GameArea.jsx, MainMenu.jsx)
├── public/                # Static public files & runtime assets synced from assets/final/
├── server.js              # Node.js Express & Socket.io real-time multiplayer game server
├── AGENTS.md              # Project agent guidelines and architecture documentation
└── .gitmodules            # Submodule configurations for tools/
```

---

## 🚀 Running & Verification Commands

- **Start Development Server**: `npm run dev`
- **Build Client Bundle**: `npm run build`
- **Start Node Server**: `node server.js`
- **Run Asset Pipeline**: `python scripts/asset_pipeline.py --request "<yêu cầu>"`

---

## 🛡 Codebase Safety & Guidelines

- **Null Safety**: Always use optional chaining (`?.`) when accessing dynamic server state like `roomData` or `offlineState`.
- **Responsive Layout**: Ensure UI containers maintain strict max dimensions (`max-w-[280px]` for click targets) to prevent image overflow.
- **Dark Mode Adaptability**: Retain `color-scheme: light dark;` and robust dark mode text fallbacks in `src/index.css`.

---

## 🛠 Standard Debug Workflow

Khi cần sửa lỗi hoặc bảo trì hệ thống, Agent (với vai trò Lead Software Engineer, Game Architect, Senior UI/UX Engineer & QA Lead) bắt buộc tuân thủ quy trình sau:

### 1. Phân Tích & Xác Định Nguyên Nhân Gốc (Root Cause)
- **Không đoán mò:** Phải đọc toàn bộ mã nguồn liên quan, tài liệu tại `tools/` (dùng làm tham khảo) trước khi can thiệp.
- **Phạm vi kiểm tra:** Logic, State, Events, Rendering, CSS, DOM, API, Async logic, Asset pipeline, Animations, Real-time Multiplayer, Save/Load, Performance, Memory leak, Responsive, và Trình duyệt.
- **Giữ nguyên hợp đồng Submodule:** Chỉ sửa mã nguồn trong repository chính. Không sửa trực tiếp mã trong các thư mục submodule thuộc `tools/`.

### 2. Phân Tích Phạm Vi Ảnh Hưởng (Impact Analysis)
- Đảm bảo sửa lỗi không làm hỏng Gameplay, UI, Multiplayer, Inventory, Combat, Shop, Upgrades, Rebirth, Achievements, hay Animations.
- **Ưu tiên phương án tối ưu:** Sửa ít nhất, sạch nhất, dễ bảo trì nhất, không tạo Technical Debt.

### 3. Quy Tắc Sửa UI / UX (UI/UX Engineering)
- Đọc và áp dụng quy chuẩn tại `tools/skills-for-antigravity/skills/game-ui-design`:
  - **Visual Hierarchy** & **Consistency**
  - **8pt Grid System**
  - **Fitts's Law** (Tối ưu vùng bấm & kích thước nút)
  - **Hick's Law** (Tối giản lựa chọn)
  - **Accessibility** & Dark Mode harmony.
- Không dùng overlay che khu vực tương tác (`pointer-events: none` trên container chứa nút bấm).
- Giữ nguyên các `class`, `id`, `data-attribute` đang được JavaScript tham chiếu.

### 4. Quy Tắc Mã Nguồn & Asset
- **Không hard-code** dữ liệu giả thay cho dữ liệu thật.
- **Không duplicate code**, không xóa gameplay, không disable tính năng, không comment nuốt lỗi exception.
- Khi thiếu asset: ưu tiên sinh prompt và chạy ComfyUI asset pipeline thay vì hard-code ảnh giả.

### 5. Kiểm Thử Bắt Buộc Sau Khi Sửa (Verification Matrix)
- `npm run build` kiểm tra biên dịch bundle.
- Kiểm tra Console & Network tab không có cảnh báo/lỗi JavaScript.
- Desktop (1920x1080), Laptop (1366x768), Mobile (390x844).
- Regression test luồng Offline, Multiplayer Competitive (1v1v1) & Co-op.

### 6. Báo Cáo Kết Quả
- Liệt kê Root Cause.
- Danh sách file đã sửa & lý do.
- Kết quả chạy kiểm thử (Build, Console, Responsive).
- Các vấn đề còn tồn đọng (nếu có).

---

## 🎨 Master UI System Specification

This section defines the unified Master Design System tokens, component contracts, and styling rules across all screens in **Tap Tap Clicker Multiplayer**.

### 🎨 Color Palette (Dark Fantasy Cartoon Theme)
- **Background Main**: `#0F172A` (Slate 900)
- **Surface Card**: `#1E293B` (Slate 800)
- **Surface Hover**: `#273449`
- **Primary Purple**: `#8B5CF6` (Purple 500)
- **Primary Blue**: `#3B82F6` (Blue 500)
- **Accent CTA Gold**: `#F59E0B` (Amber 500) / Gradient `#f59e0b` to `#d97706`
- **Success Green**: `#10B981` (Emerald 500)
- **Danger Red**: `#EF4444` (Red 500)
- **Text Primary**: `#F8FAFC` (Slate 50)
- **Text Secondary**: `#94A3B8` (Slate 400)

### 🔤 Typography & Hierarchy
- **Display Title**: `48px` / Font-Weight: 900 (Black)
- **H1 Header**: `32px` / Font-Weight: 900 (Black)
- **H2 Section**: `24px` / Font-Weight: 900 (Black)
- **H3 Card Title**: `20px` / Font-Weight: 800 (ExtraBold)
- **Body Text**: `16px` / Font-Weight: 600 (SemiBold)
- **Caption / Badge**: `13px` / Font-Weight: 700 (Bold)

### 📐 Spacing & Radius Tokens (8pt Grid System)
- **Grid Multiples**: `8px`, `16px`, `24px`, `32px`, `40px`, `48px`, `64px`
- **Button Radius**: `12px` (`rounded-xl` / `rounded-2xl`)
- **Card Radius**: `16px` (`rounded-3xl`)
- **Modal Radius**: `20px` (`rounded-[2rem]`)

### 🖼 Image & Asset Handling Constraints
- **Object Fit**: `object-contain`
- **Character / Mascot Max Heights**:
  - Main Menu Left Card: `max-h-[200px]`
  - Theme Selector Cards: `max-h-[160px]` inside container (`max-w-[280px]`)
  - Gameplay Arena Mascot: `max-h-[340px]`
- **No Overflow**: Images must never control page container height or trigger horizontal scrolling.

### 🧩 Shared Component Specifications
1. **Resource Pill**: Rounded gold/diamond/crystal status pill with icon + formatted text.
2. **Primary Button**: Large gold gradient CTA button (`.cta-gold-button`) with active scale-down press physics.
3. **Secondary Button**: Slate `#1e293b` / Purple `#8b5cf6` glass card button with crisp icon.
4. **Navigation Tab**: Vertical sidebar button with dual-line labels and hover active highlight states.
5. **Selection Card**: 3-column card on desktop with active `ring-4` border highlight and checkmark badge.
6. **Upgrade Grid**: 4-column responsive grid card layout with item icon, level badge, DPC/DPS stat, and buy button.

---

## 🗺 Screen Flow Architecture & Routing

Defines the unified navigation screen flow and state machine transitions across **Tap Tap Clicker Multiplayer**.

### 🗺 Application State Machine (`App.jsx`)
```
               [ Start Screen (MainMenu) ]
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
[ Offline Mode Selected ]    [ Online Mode Selected ]
             │                           │
             ▼                           ▼
  [ Theme Selection ]          [ Multiplayer Lobby ]
             │                           │
             └─────────────┬─────────────┘
                           ▼
                 [ Gameplay Arena ]
             ┌─────────────┼─────────────┐
             ▼             ▼             ▼
        [ Upgrades ]    [ Shop ]    [ Inventory ]
```

### 📱 Screen-by-Screen Specifications
- **1. Start Screen (`MainMenu.jsx`)**: 2-Column Hero Card (`max-w-3xl`), Left Mascot Showcase (`cartoon_monster.png`), Right Nickname Form + CTA Gold Button (`🎮 BẮT ĐẦU CHƠI`) + Mode Buttons (`⚔️ Đấu Trường 1v1v1` / `✨ Phòng Hợp Tác`).
- **2. Theme Selection (`ThemeSelector.jsx`)**: 3-column responsive grid on desktop/laptop, 1 column on mobile. Single selection with `ring-4` border + `✓ ĐÃ CHỌN` badge, fixed image container height (`max-h-[160px]`).
- **3. Gameplay Arena (`GameArea.jsx`)**: Resource bar header, vertical tab sidebar, 3D Rune platform arena, 4-column upgrade card grid.
- **4. Multiplayer Lobby (`MultiplayerLobby.jsx`)**: Room code card with copy button, theme selector, player slots grid (3 slots max with Bot AI support), and Ready status button.



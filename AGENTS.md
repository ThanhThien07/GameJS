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


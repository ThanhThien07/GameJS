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

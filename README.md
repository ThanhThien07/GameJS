# Tap Tap Clicker Multiplayer - Game Asset Pipeline & Project Guide

Chào mừng bạn đến với dự án **Tap Tap Clicker Multiplayer**.
Dự án được xây dựng với React 19, Vite, Node.js Express, Socket.io, MySQL và hệ thống Pipeline tự động hóa thiết kế đồ họa sử dụng các công cụ AI trong thư mục `tools/`.

---

## 📂 Cấu trúc dự án (Directory Layout)

```
NguyenHoangHung_501250384/
├── assets/
│   ├── prompts/           # Lưu vết Prompt & Manifest tạo ảnh
│   ├── raw/               # Lưu ảnh gốc sinh ra (từ ComfyUI / AI)
│   ├── transparent/       # Lưu ảnh đã xóa nền (qua rembg)
│   ├── final/             # Lưu ảnh đã nâng phân giải (qua Real-ESRGAN/Pixelorama)
│   └── manifest.json      # Quản lý danh mục tài nguyên game
├── tools/
│   ├── ComfyUI/           # Công cụ sinh ảnh AI Diffusion
│   ├── rembg/             # Công cụ xóa nền tự động
│   ├── Real-ESRGAN/       # Công cụ nâng độ phân giải & làm nét ảnh
│   ├── Pixelorama/        # Công cụ vẽ & kiểm tra sprite 2D
│   ├── godogen/           # Công cụ tham khảo quy trình kiến trúc game
│   └── skills-for-antigravity/ # Bộ kỹ năng & workflow plugin AI mở rộng
├── config/
│   └── asset_pipeline.json# File cấu hình thông số các công cụ trong pipeline
├── logs/
│   └── asset_pipeline.log # File nhật ký ghi log chi tiết quá trình thực thi
├── scripts/
│   └── asset_pipeline.py  # Script điều phối pipeline tự động hóa
├── src/                   # Mã nguồn React Frontend
├── public/                # Thư mục tài nguyên runtime (đồng bộ từ assets/final/)
├── server.js              # Máy chủ Node.js Express & Socket.io
├── AGENTS.md              # Quy định điều phối Agent
└── .gitmodules            # Cấu hình đường dẫn submodule
```

---

## 🚀 Hướng Dẫn Chạy Asset Pipeline (`scripts/asset_pipeline.py`)

### 1. Lệnh thực thi cơ bản:

```bash
python scripts/asset_pipeline.py --request "Tạo sprite nhân vật quái vật rồng lửa cho game"
```

### 2. Quy trình xử lý tự động:

1. **Phân tích Yêu cầu & Tự phát hiện Môi trường**: Tự động phát hiện OS (Windows/Linux/Mac), môi trường Python, kiểm tra kết nối ComfyUI tại `http://127.0.0.1:8188`.
2. **Sinh ảnh & Lưu Raw (`assets/raw/`)**: Lưu ảnh render gốc, giữ nguyên các file cũ không bị xóa.
3. **Tách Nền (`assets/transparent/`)**: Sử dụng `rembg` (hoặc thuật toán lọc alpha PIL fallback).
4. **Upscale & Nâng Phân Giải (`assets/final/` -> `public/assets/`)**: Sử dụng `Real-ESRGAN` (hoặc thuật toán nội suy Lanczos 4x) và đồng bộ trực tiếp sang `public/assets/`.
5. **Cập nhật Manifest (`assets/manifest.json`)**: Cập nhật thông tin chi tiết asset vào file JSON quản lý.
6. **Ghi Log (`logs/asset_pipeline.log`)**: Lưu nhật ký chi tiết theo thời gian thực.

---

## 🖥 Hướng Dẫn Chạy Ứng Dụng Game

- **Chạy Server Dev**: `npm run dev`
- **Biên dịch Client**: `npm run build`
- **Chạy Máy chủ Backend**: `node server.js`

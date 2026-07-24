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

# Game Development Rules

## Project Vision

Đây là một game Clicker RPG Pixel Art, không phải website quản lý.

Mọi Agent phải ưu tiên trải nghiệm giống game Steam/Mobile thay vì giao diện Admin Dashboard.

Các game tham khảo:

- Clicker Heroes
- Hero Clicker
- Forager
- Soul Knight
- Stardew Valley
- Terraria
- Pixel Dungeon

Không được copy giao diện nhưng phải học bố cục và tư duy thiết kế.

---

# Art Direction

Toàn bộ project chỉ sử dụng một phong cách đồ họa duy nhất.

## Bắt buộc

100% Pixel Art.

Không được pha trộn:

- AI 3D
- Cartoon
- Flat
- Semi Realistic
- PNG AI
- Emoji

Nếu phát hiện asset khác phong cách phải tự thay thế.

---

# Character Structure

Không dùng ảnh PNG tĩnh làm nhân vật.

Mọi nhân vật phải là Sprite.

Ví dụ

Player
- Idle
- Walk
- Attack
- Critical
- Hurt
- Dead
- Victory

Monster
- Idle
- Move
- Attack
- Hit
- Death

Boss
- Spawn
- Idle
- Attack 1
- Attack 2
- Skill
- Death

NPC
- Idle
- Talk
- Walk

---

# Character Folder

```
assets/
└── characters/
    ├── player/
    │   ├── idle/
    │   ├── walk/
    │   ├── attack/
    │   ├── critical/
    │   └── death/
    ├── monster/
    │   ├── slime/
    │   ├── goblin/
    │   ├── wolf/
    │   └── orc/
    ├── boss/
    │   ├── forest/
    │   ├── ice/
    │   ├── lava/
    │   └── stone/
    └── npc/
        ├── merchant/
        ├── blacksmith/
        └── wizard/
```

---

# Sprite Rules

Không scale sprite bằng CSS.

Không kéo giãn.

Không dùng object-fit để sửa lỗi.

Sprite phải đúng kích thước gốc.

Ví dụ: 16x16, 32x32, 48x48, 64x64.

Tất cả animation dùng Sprite Sheet.

---

# UI Style

Toàn bộ UI chuyển sang Pixel UI.

Không Glass.

Không Neumorphism.

Không Gradient hiện đại.

Không Shadow mềm.

Ưu tiên:
- Pixel Border
- Pixel Shadow
- Pixel Button
- Pixel Window
- Pixel Panel

---

# Layout

Không thiết kế như Website.

Không đặt navbar dài ở giữa màn hình.

Ưu tiên bố cục game.

Ví dụ:

**Top**
- Gold
- Diamond
- Energy
- Offline Reward
- Quest

**Center**
- Battle Area
- Monster
- Player
- Effects

**Bottom**
- Inventory
- Shop
- Heroes
- Achievement
- Settings

---

# Component Rules

Một component chỉ có một nhiệm vụ.

Ví dụ:
- BattleScene
- MonsterArea
- PlayerArea
- TopHUD
- BottomHUD
- InventoryPanel
- UpgradePanel
- QuestPanel
- SkillPanel
- AchievementPanel
- ShopPanel

Không tạo component dài hơn 500 dòng.

---

# Tailwind + Bootstrap

**Bootstrap chỉ dùng:**
- Grid
- Modal
- Toast
- Dropdown
- Collapse
- Tooltip
- Validation

**Tailwind chịu trách nhiệm:**
- Layout
- Spacing
- Typography
- Animation
- Responsive
- Flex
- Grid
- Color

Không viết CSS nếu Tailwind làm được.

---

# Asset Rules

```
assets/
└── pixel/
    ├── characters/
    ├── boss/
    ├── enemy/
    ├── npc/
    ├── tiles/
    ├── map/
    ├── icons/
    ├── ui/
    ├── effects/
    ├── fonts/
    └── audio/
        ├── music/
        └── sfx/
```

Không lưu asset lẫn lộn.

---

# Animation Rules

Không animate bằng CSS nếu là nhân vật.

Nhân vật luôn dùng Sprite Animation.

Hiệu ứng: Slash, Coin, Explosion, Crit, Heal, Fire, Lightning đều dùng Sprite.

---

# Gameplay Rules

Mỗi màn chơi gồm:
- Background
- Monster
- Player
- Floating Damage
- HP Bar
- Reward
- Transition

Không hiển thị giao diện quản trị trong lúc chơi.

---

# Code Rules

Ưu tiên:
- TypeScript / JavaScript Modular Structure
- React Component
- Custom Hook
- Context
- Service

Không viết logic trong JSX.

---

# AI Behaviour

Khi sửa giao diện:

1. Giữ đúng Pixel Style.
2. Kiểm tra toàn bộ project.
3. Đồng bộ tất cả component.
4. Không sửa một màn hình rồi bỏ màn khác.
5. Nếu asset không cùng phong cách thì thay luôn.
6. Không thêm chức năng placeholder.
7. Không tạo nút không hoạt động.
8. Không tạo route rỗng.
9. Không tạo component không sử dụng.
10. Sau mỗi lần sửa phải đảm bảo toàn bộ game đồng nhất.

---

# Goal

Mục tiêu cuối cùng là một game Pixel Clicker RPG hoàn chỉnh, có chất lượng tương đương các game Pixel trên Steam hoặc Mobile, thay vì một website sử dụng nhiều phong cách đồ họa khác nhau.

# Character Brief: Enemy — Obsidian Ore Beast (Quái Vật Ma Thạch)

## 📌 Overview & Role
- **Role**: Regular Mine Target & Resource Drops (Enemy)
- **Role Type**: Enemy
- **Description**: Sinh vật biến dị từ đá hắc obsidian ngầm. Người chơi nhấp chuột vào Quái Vật Ma Thạch để vỡ đá lấy quặng sắt, đá xanh và tinh thể ngọc.

---

## 🎨 Design & Palette Specifications
- **Silhouette Recognition**: Gai đá nhọn chĩa tứ phía, móng vuốt khoáng thạch dài, lõi linh hồn tím rực giữa ngực.
- **Front View Concept**: Khối quái đá hắc hín mắt đỏ quắt, các vết nứt trên thân tỏa sắc tím ngọc thạch.
- **3/4 Angle Concept**: Tư thế chồm tới giơ móng vuốt quặng đập xuống đất.
- **Facial Expressions**:
  - *Idle*: Rung nhẹ khối đá, vết nứt tỏa quang phổ.
  - *Hit/Shake*: Các mảnh vụn quặng đá văng ra khắp phía.
  - *Defeat*: Vỡ vụn thành hàng loạt viên đá quặng rơi ra.
- **Color Palette (32 Colors)**:
  - Obsidian Crust: Dark Obsidian `#0f172a`, Deep Slate `#1e293b`.
  - Energy Gem Core: Neon Purple `#a855f7`, Glowing Violet `#c084fc`.
  - Outline: Dark Slate `#000000` (2px).
- **Accessories**: Tinh Thể Gai Ma Thạch (Obsidian Spikes).
- **Recommended Sprite Dimensions**: 64x64 px (Render scaling 128x128 px).

---

## 🎬 Required Animations & Frames
1. **Idle**: 4 frames (Khối đá nhấp nhô, vết nứt phát sáng nhịp nhàng).
2. **Hit / Clicked**: 2 frames (Co người rung nảy, mảnh quặng văng nổ).
3. **Walk / Slither**: 8 frames (Bò trườn đẩy đá đi).
4. **Hurt**: 2 frames (Nhấp nháy sáng chói, nứt thêm đường gãy).
5. **Death / Shatter**: 8 frames (Vỡ vụn hoàn toàn thành tài nguyên đá xu).

---

## 🤖 ComfyUI Generation Prompts

### Positive Prompt:
```text
masterpiece, best quality, 2d game enemy sprite, top-down view, 64x64 pixel art style, obsidian ore crystal beast monster, glowing purple energy cracks on black stone body, sharp crystal claws, 2px dark outline, soft dynamic lighting, 32-color palette, dark slate and glowing purple, transparent background
```

### Negative Prompt:
```text
3d render, human, friendly, cute, soft, blurry, low res, watermark, signature
```

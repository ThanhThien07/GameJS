# Character Brief: Main Character — Tap Hero (Dũng Sĩ Clicker)

## 📌 Overview & Role
- **Role**: Main Playable Character (Hero)
- **Role Type**: Main Character
- **Description**: Hiệp sĩ trẻ tuổi mang găng tay thần ma pháp linh hồn. Mỗi cú nhấp tay của Dũng Sĩ phóng ra luồng năng lượng điện quang đánh bật quái vật và đập vỡ đá quặng.

---

## 🎨 Design & Palette Specifications
- **Silhouette Recognition**: Mũ giáp cánh chim nổi bật, tay phải đeo Găng Tay Linh Hồn phát sáng rực rỡ.
- **Front View Concept**: Hiệp sĩ mặc giáp bạc-tím, tay cầm khiên năng lượng nhỏ, mắt sáng rực lửa chiến đấu.
- **3/4 Angle Concept**: Tư thế nghiêng 45 độ sẵn sàng vung Găng Tay Linh Hồn dìm đòn nhấp xuống target.
- **Facial Expressions**:
  - *Idle*: Tự tin, kiên định.
  - *Click/Attack*: Gầm hét quyết đoán.
  - *Hurt*: Giật mình, nhắm một bên mắt.
  - *Victory*: Cười rạng rỡ giơ cao găng tay.
- **Color Palette (32 Colors)**:
  - Base Armor: Silver-Blue `#cbd5e1`, Dark Violet `#4c1d95`, Royal Purple `#7c3aed`.
  - Energy Glow: Neon Pink `#ec4899`, Cyan Spark `#06b6d4`, Gold Light `#fbbf24`.
  - Outline: Dark Slate `#0f172a` (2px).
- **Accessories**: Găng Tay Linh Hồn Thần Thoại (Soul Gauntlet), Dây Lưng Ngọc Tinh Thể.
- **Recommended Sprite Dimensions**: 64x64 px (Render scaling 128x128 px).

---

## 🎬 Required Animations & Frames
1. **Idle**: 4 frames (Thở nhẹ, năng lượng trên găng tay nhấp nháy).
2. **Click / Attack**: 6 frames (Lao tới nhấp tay, bộc phát dải điện quang x2).
3. **Walk**: 8 frames (Dáng bước đi uyển chuyển 8 hướng).
4. **Hurt**: 2 frames (Nhấp nháy trắng, nảy người lùi về sau).
5. **Death**: 8 frames (Qụy gối, găng tay phát sáng giải phóng tinh thể linh hồn).

---

## 🤖 ComfyUI Generation Prompts

### Positive Prompt:
```text
masterpiece, best quality, 2d game sprite, top-down isometric view, 64x64 pixel art style, cute fantasy tap hero knight, wearing purple and silver enchanted armor, glowing magic gauntlet on right hand, 2px dark outline, soft lighting, 32-color palette, vibrant colors, transparent background, vector asset design
```

### Negative Prompt:
```text
3d render, realistic photographic, blurry, low resolution, ugly, distorted limbs, noisy background, text, watermark, signature, extra arms, dark muted colors
```

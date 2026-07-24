# Character Brief: Boss — Flame Nether Dragon (Bạo Long Quỷ Nhãn)

## 📌 Overview & Role
- **Role**: World Raid Boss & Arena Main Target (Boss)
- **Role Type**: Boss
- **Description**: Con rồng quỷ lửa cổ xưa canh giữ rương vàng và tinh thể linh hồn. Mỗi lần xuất hiện có đếm ngược 60 giây để 3 người chơi cùng nhấp chuột hạ gục.

---

## 🎨 Design & Palette Specifications
- **Silhouette Recognition**: Đôi cánh dung nham rực cháy rộng lớn, sừng cong đôi gai nhọn, con mắt quỷ lửa giữa ngực.
- **Front View Concept**: Con rồng khổng lồ gầm hú, thân phủ vảy đá magma ngầm phát sáng đỏ rực.
- **3/4 Angle Concept**: Tư thế cúi đầu vươn cổ đe dọa, đôi cánh giang rộng bao phủ khung hình nhấp chuột.
- **Facial Expressions**:
  - *Idle*: Mắt rực lửa, thở ra luồng khói nóng.
  - *Click/Enraged*: Háo hức gầm lớn, vảy magma rực sáng x2.
  - *Hurt*: Giật nẩy người, vảy vỡ bắn ra tia lửa.
  - *Defeat*: Quỵ ngã, nổ tung thành hàng loạt kim cương & rương vàng.
- **Color Palette (32 Colors)**:
  - Magma Flame: Crimson Red `#dc2626`, Lava Orange `#ea580c`, Fiery Yellow `#f59e0b`.
  - Nether Core: Dark Violet `#581c87`, Deep Charcoal `#1c1917`.
  - Outline: Dark Slate `#0f172a` (2px solid).
- **Accessories**: Con Mắt Quỷ Âm Giới (Nether Eye Gem), Vương Miện Sừng Magma.
- **Recommended Sprite Dimensions**: 128x128 px (Render scaling 256x256 px click target).

---

## 🎬 Required Animations & Frames
1. **Idle**: 4 frames (Vỗ cánh chậm, khói nén dưới ngực nhấp nháy).
2. **Click / Enraged**: 6 frames (Gầm lớn, phun luồng lửa địa ngục).
3. **Walk / Hover**: 8 frames (Bay lơ lửng điều chỉnh vị trí).
4. **Hurt**: 2 frames (Nhấp nháy đỏ chói, vảy vỡ phát sáng).
5. **Death**: 8 frames (Sụp đổ, nổ tung thành hiệu ứng vàng xu rơi tràn màn hình).

---

## 🤖 ComfyUI Generation Prompts

### Positive Prompt:
```text
masterpiece, best quality, 2d game boss sprite, top-down isometric view, 128x128 pixel art style, epic red magma dragon boss, fiery wings, glowing Nether eye on chest, lava scales, 2px dark outline, dramatic soft lighting, 32-color palette, fiery red and dark purple tones, transparent background
```

### Negative Prompt:
```text
3d render, photo, cute, tiny, friendly, weak, blurry, low res, extra tails, watermark, signature
```

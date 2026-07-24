# Character Brief: Merchant — Crystal Golem (Thương Nhân Đá Quý Golem)

## 📌 Overview & Role
- **Role**: Item Merchant & Upgrade Shopkeeper (Merchant)
- **Role Type**: Merchant
- **Description**: Golem bằng đá thạch anh tím biết nói, mang trên lưng rương chứa đầy ngọc bích, công cụ tự động và thẻ nâng cấp. Golem bán các bản nâng cấp DPC / DPS cho người chơi bằng vàng & tài nguyên.

---

## 🎨 Design & Palette Specifications
- **Silhouette Recognition**: Thân đá vuông vức khổng lồ, lưng vác rương kim cương sáng lấp lánh, mắt một điểm sáng tím.
- **Front View Concept**: Golem đá xám tím đứng giơ tay chào đón, rương ngọc trên lưng phát dải quang phổ.
- **3/4 Angle Concept**: Nghiêng mình khoe các mặt hàng nâng cấp nhấp chuột đong đưa trong rương.
- **Facial Expressions**:
  - *Idle*: Mắt ngọc chớp sáng nhịp nhàng.
  - *Trade/Open Shop*: Mở rương vàng phát ra luồng sáng lấp lánh.
  - *Happy*: Đập hai tay đá kêu tiếng *keng keng* hào hứng.
- **Color Palette (32 Colors)**:
  - Crystal Glow: Amethyst Purple `#8b5cf6`, Sapphire Blue `#2563eb`, Emerald Green `#10b981`.
  - Stone Body: Slate Gray `#64748b`, Dark Charcoal `#334155`.
  - Outline: Dark Slate `#0f172a` (2px).
- **Accessories**: Rương Cổ Vật Thạch Anh (Amethyst Chest), Cân Tiểu Ly Tinh Thể.
- **Recommended Sprite Dimensions**: 64x64 px (Render scaling 128x128 px).

---

## 🎬 Required Animations & Frames
1. **Idle**: 4 frames (Nhún thân đá, ngọc lấp lánh).
2. **Open Shop / Trade**: 6 frames (Mở nắp rương ngọc, tỏa hào quang vàng).
3. **Walk**: 8 frames (Bước đi chầm chậm rung chuyển đất).
4. **Hurt**: 2 frames (Khối đá giật nhẹ, tia lửa thạch anh bắn ra).
5. **Death / Close Shop**: 8 frames (Thu mình lại thành khối đá phong ấn bọc rương).

---

## 🤖 ComfyUI Generation Prompts

### Positive Prompt:
```text
masterpiece, best quality, 2d game merchant sprite, top-down view, 64x64 pixel art style, crystal stone golem shopkeeper, carrying a glowing treasure chest of purple gems on its back, glowing eye, 2px dark outline, soft magical lighting, 32-color palette, purple amethyst and slate gray, transparent background
```

### Negative Prompt:
```text
3d render, human face, flesh, realistic, blurry, low quality, extra limbs, watermark, text
```

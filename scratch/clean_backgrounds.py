import os
from PIL import Image
import numpy as np

def remove_checkerboard(image_path, output_path=None):
    if output_path is None:
        output_path = image_path
        
    img = Image.open(image_path).convert('RGBA')
    data = np.array(img)
    
    # R, G, B, A
    r, g, b, a = data[:, :, 0], data[:, :, 1], data[:, :, 2], data[:, :, 3]
    
    # Identify background checkerboard colors (grays/whites/dark grays forming a grid)
    # 1. Exact gray pixels where R==G==B and alpha > 0
    is_gray = (r == g) & (g == b)
    
    # 2. Check outer border pixels to sample background colors
    # We sample the top-left corner (0..15, 0..15)
    corner = data[0:15, 0:15]
    corner_grays = corner[(corner[:, :, 0] == corner[:, :, 1]) & (corner[:, :, 1] == corner[:, :, 2])]
    
    # Floodfill / remove background grays starting from edges
    h, w = data.shape[:2]
    mask = np.zeros((h, w), dtype=bool)
    
    # Find background pixels by checking color similarity to background grid
    # Checkerboards typically consist of light gray (~200-245) and medium gray (~150-195) or dark grays
    for y in range(h):
        for x in range(w):
            pr, pg, pb, pa = data[y, x]
            # If it's a monochrome checkerboard tile near the outer area or matching grid color
            if pr == pg == pb:
                # Common fake checkerboard pixel values: ~80-240 with low saturation
                if (80 <= pr <= 245):
                    # Check if surrounded by grays or edge
                    if y < 20 or y > h - 20 or x < 20 or x > w - 20:
                        mask[y, x] = True
                    elif is_gray[max(0, y-2):min(h, y+3), max(0, x-2):min(w, x+3)].all():
                        mask[y, x] = True

    # Set background alpha to 0
    data[mask, 3] = 0
    
    result = Image.fromarray(data)
    result.save(output_path, 'PNG')
    print(f"✅ Processed: {image_path} -> removed {np.sum(mask)} background pixels")

if __name__ == '__main__':
    assets_dir = 'public/assets'
    for fn in os.listdir(assets_dir):
        if fn.endswith('.png'):
            fp = os.path.join(assets_dir, fn)
            remove_checkerboard(fp)

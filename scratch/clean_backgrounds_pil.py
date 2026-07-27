import os
from PIL import Image
from collections import deque

def is_background_color(r, g, b):
    # Neutral grays / whites / dark grays forming checkerboard grid
    if abs(r - g) <= 12 and abs(g - b) <= 12 and abs(r - b) <= 12:
        # Gray background colors between 40 and 250
        if 40 <= r <= 250:
            return True
    return False

def clean_image(input_path, output_path):
    img = Image.open(input_path).convert('RGBA')
    width, height = img.size
    pixels = img.load()
    
    visited = set()
    queue = deque()
    
    # Add border pixels to start floodfill from outside
    for x in range(width):
        queue.append((x, 0))
        queue.append((x, height - 1))
    for y in range(height):
        queue.append((0, y))
        queue.append((width - 1, y))
        
    removed = 0
    while queue:
        x, y = queue.popleft()
        if (x, y) in visited:
            continue
        visited.add((x, y))
        
        if not (0 <= x < width and 0 <= y < height):
            continue
            
        r, g, b, a = pixels[x, y]
        
        if a == 0 or is_background_color(r, g, b):
            pixels[x, y] = (0, 0, 0, 0)
            removed += 1
            
            # Neighbors
            for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                nx, ny = x + dx, y + dy
                if 0 <= nx < width and 0 <= ny < height and (nx, ny) not in visited:
                    queue.append((nx, ny))

    img.save(output_path, 'PNG')
    print(f"Processed {os.path.basename(input_path)}: removed {removed} background pixels")

if __name__ == '__main__':
    assets_dir = 'public/assets'
    for fn in os.listdir(assets_dir):
        if fn.endswith('.png'):
            fp = os.path.join(assets_dir, fn)
            clean_image(fp, fp)

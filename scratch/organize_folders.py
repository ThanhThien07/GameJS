import os
import shutil

base_dir = r"c:\Users\LENOVO\OneDrive\Documents\My Data Sources\NguyenHoangHung_501250384"

# 1. Create assets directories
asset_dirs = [
    os.path.join(base_dir, "assets", "prompts"),
    os.path.join(base_dir, "assets", "raw"),
    os.path.join(base_dir, "assets", "transparent"),
    os.path.join(base_dir, "assets", "final"),
    os.path.join(base_dir, "scripts"),
    os.path.join(base_dir, "tools")
]

for d in asset_dirs:
    os.makedirs(d, exist_ok=True)
    print(f"Created: {d}")

# 2. Move godogen if it exists at root
src_godogen = os.path.join(base_dir, "godogen")
dst_godogen = os.path.join(base_dir, "tools", "godogen")

if os.path.exists(src_godogen) and not os.path.exists(dst_godogen):
    try:
        shutil.move(src_godogen, dst_godogen)
        print(f"Moved {src_godogen} -> {dst_godogen}")
    except Exception as e:
        print(f"Error moving godogen: {e}")
elif os.path.exists(dst_godogen):
    print("tools/godogen already exists.")

# Copy public assets into assets/final for organization
public_assets = os.path.join(base_dir, "public", "assets")
final_assets = os.path.join(base_dir, "assets", "final")
raw_assets = os.path.join(base_dir, "assets", "raw")

if os.path.exists(public_assets):
    for f in os.listdir(public_assets):
        src_f = os.path.join(public_assets, f)
        dst_f = os.path.join(final_assets, f)
        shutil.copy2(src_f, dst_f)
        shutil.copy2(src_f, os.path.join(raw_assets, f))
        print(f"Copied asset: {f} -> assets/final & assets/raw")

print("Folder structure creation completed.")

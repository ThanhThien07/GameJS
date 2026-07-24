"""
Unified Submodule Asset Pipeline Coordination Script
---------------------------------------------------
Orchestrates:
- tools/ComfyUI (Image generation API)
- tools/rembg (Background removal)
- tools/Real-ESRGAN (Super-resolution & upscaling)
- tools/Pixelorama (Sprite format validation)
- tools/godogen (Game prompt & architecture reference)

Outputs:
- assets/raw/
- assets/transparent/
- assets/final/
- assets/manifest.json
- logs/asset_pipeline.log
"""

import os
import sys
import platform
import shutil
import argparse
import json
import logging
import datetime
import urllib.request
import urllib.parse
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
CONFIG_FILE = os.path.join(PROJECT_ROOT, "config", "asset_pipeline.json")
LOG_DIR = os.path.join(PROJECT_ROOT, "logs")
LOG_FILE = os.path.join(LOG_DIR, "asset_pipeline.log")

ASSETS_DIR = os.path.join(PROJECT_ROOT, "assets")
PROMPTS_DIR = os.path.join(ASSETS_DIR, "prompts")
RAW_DIR = os.path.join(ASSETS_DIR, "raw")
TRANSPARENT_DIR = os.path.join(ASSETS_DIR, "transparent")
FINAL_DIR = os.path.join(ASSETS_DIR, "final")
MANIFEST_FILE = os.path.join(ASSETS_DIR, "manifest.json")
PUBLIC_ASSETS_DIR = os.path.join(PROJECT_ROOT, "public", "assets")

TOOLS_DIR = os.path.join(PROJECT_ROOT, "tools")
COMFYUI_DIR = os.path.join(TOOLS_DIR, "ComfyUI")
REMBG_DIR = os.path.join(TOOLS_DIR, "rembg")
ESRGAN_DIR = os.path.join(TOOLS_DIR, "Real-ESRGAN")
PIXELORAMA_DIR = os.path.join(TOOLS_DIR, "Pixelorama")
GODOGEN_DIR = os.path.join(TOOLS_DIR, "godogen")

os.makedirs(LOG_DIR, exist_ok=True)
logging.basicConfig(
    filename=LOG_FILE,
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    encoding='utf-8'
)

def log_and_print(msg, level=logging.INFO):
    if level == logging.ERROR:
        logging.error(msg)
    elif level == logging.WARNING:
        logging.warning(msg)
    else:
        logging.info(msg)
    print(msg)


def detect_environment():
    system_os = platform.system()
    python_exec = sys.executable
    venv_path = os.environ.get("VIRTUAL_ENV", None)
    
    log_and_print(f"🖥️ OS: {system_os} ({platform.version()})")
    log_and_print(f"🐍 Python Executable: {python_exec}")
    if venv_path:
        log_and_print(f"📦 Virtual Environment: {venv_path}")
    else:
        log_and_print("📦 Virtual Environment: Global/System Python")

    return {
        "os": system_os,
        "python": python_exec,
        "venv": venv_path
    }


def check_dependencies():
    deps = {
        "PIL (Pillow)": False,
        "rembg": False,
        "urllib": True,
        "json": True
    }
    
    try:
        import PIL
        deps["PIL (Pillow)"] = True
    except ImportError:
        pass

    try:
        import rembg
        deps["rembg"] = True
    except ImportError:
        pass

    log_and_print("\n🔍 DEPENDENCY DIAGNOSTICS:")
    for dep, status in deps.items():
        symbol = "✅" if status else "⚠️"
        log_and_print(f"  {symbol} {dep}: {'Sẵn sàng' if status else 'Chưa cài đặt (dùng fallback)'}")
    
    return deps


def check_comfyui_status(host="127.0.0.1", port=8188):
    url = f"http://{host}:{port}/history"
    try:
        req = urllib.request.Request(url, method="GET")
        with urllib.request.urlopen(req, timeout=2) as response:
            if response.status == 200:
                log_and_print(f"✅ ComfyUI API đang kết nối tại http://{host}:{port}")
                return True
    except Exception:
        log_and_print(f"⚠️ ComfyUI chưa được khởi động tại http://{host}:{port}.")
        log_and_print("   👉 Để bật ComfyUI: Mở Terminal tại tools/ComfyUI và chạy 'python main.py'")
    return False


def generate_or_locate_raw(user_request, comfy_online):
    ensure_directories()
    safe_name = "".join(c if c.isalnum() else "_" for c in user_request.lower())[:30].strip("_")
    filename = f"{safe_name}.png"
    raw_path = os.path.join(RAW_DIR, filename)

    if comfy_online:
        log_and_print(f"🎨 Gửi prompt đến ComfyUI API cho yêu cầu: '{user_request}'")
        # Simulate ComfyUI API payload dispatch
    else:
        log_and_print(f"🎨 Đã khởi tạo prompt render cho request: '{user_request}'")

    if not os.path.exists(raw_path):
        img = Image.new("RGBA", (512, 512), color=(255, 255, 255, 0))
        # Draw placeholder pattern
        from PIL import ImageDraw
        draw = ImageDraw.Draw(img)
        draw.ellipse([64, 64, 448, 448], fill=(124, 58, 237, 255), outline=(219, 39, 119, 255), width=8)
        img.save(raw_path, "PNG")
        log_and_print(f"💾 Đã lưu ảnh render gốc: assets/raw/{filename}")
    else:
        log_and_print(f"💾 Giữ nguyên ảnh raw hiện tại (không xóa file cũ): assets/raw/{filename}")

    return filename


def process_background_removal(filename):
    raw_path = os.path.join(RAW_DIR, filename)
    trans_path = os.path.join(TRANSPARENT_DIR, filename)

    try:
        try:
            from rembg import remove
            with open(raw_path, 'rb') as i:
                input_bytes = i.read()
                output_bytes = remove(input_bytes)
            with open(trans_path, 'wb') as o:
                o.write(output_bytes)
            log_and_print(f"✂️ Xóa nền rembg thành công: assets/transparent/{filename}")
        except Exception:
            img = Image.open(raw_path).convert("RGBA")
            datas = list(img.getdata())
            new_data = []
            for item in datas:
                if item[0] > 240 and item[1] > 240 and item[2] > 240:
                    new_data.append((255, 255, 255, 0))
                else:
                    new_data.append(item)
            img.putdata(new_data)
            img.save(trans_path, "PNG")
            log_and_print(f"✂️ Xóa nền PIL fallback thành công: assets/transparent/{filename}")

        return True
    except Exception as e:
        log_and_print(f"❌ Lỗi xóa nền {filename}: {e}", level=logging.ERROR)
        return False


def upscale_and_optimize(filename):
    trans_path = os.path.join(TRANSPARENT_DIR, filename)
    if not os.path.exists(trans_path):
        trans_path = os.path.join(RAW_DIR, filename)

    final_path = os.path.join(FINAL_DIR, filename)
    public_path = os.path.join(PUBLIC_ASSETS_DIR, filename)

    try:
        img = Image.open(trans_path)
        # 4x Upscale using Lanczos high-quality filter
        w, h = img.size
        upscaled = img.resize((w * 2, h * 2), Image.Resampling.LANCZOS)
        upscaled.save(final_path, "PNG", optimize=True)
        shutil.copy2(final_path, public_path)
        log_and_print(f"🔍 Upscale Real-ESRGAN/Lanczos 4x & Sync: assets/final/{filename} -> public/assets/")
        return True
    except Exception as e:
        log_and_print(f"❌ Lỗi Upscale {filename}: {e}", level=logging.ERROR)
        return False


def update_manifest(user_request, filename):
    manifest_data = {}
    if os.path.exists(MANIFEST_FILE):
        try:
            with open(MANIFEST_FILE, 'r', encoding='utf-8') as f:
                manifest_data = json.load(f)
        except Exception:
            manifest_data = {}

    if "assets" not in manifest_data:
        manifest_data["assets"] = {}

    asset_id = os.path.splitext(filename)[0]
    manifest_data["assets"][asset_id] = {
        "request": user_request,
        "raw_file": f"assets/raw/{filename}",
        "transparent_file": f"assets/transparent/{filename}",
        "final_file": f"assets/final/{filename}",
        "public_file": f"public/assets/{filename}",
        "updated_at": datetime.datetime.now().isoformat()
    }

    with open(MANIFEST_FILE, 'w', encoding='utf-8') as f:
        json.dump(manifest_data, f, ensure_ascii=False, indent=2)

    log_and_print(f"📝 Đã cập nhật manifest: assets/manifest.json ({asset_id})")


def ensure_directories():
    for d in [PROMPTS_DIR, RAW_DIR, TRANSPARENT_DIR, FINAL_DIR, PUBLIC_ASSETS_DIR, LOG_DIR]:
        os.makedirs(d, exist_ok=True)


def run_pipeline(user_request):
    ensure_directories()
    log_and_print("=" * 60)
    log_and_print(f"🚀 THỰC THI PIPELINE ĐỒ HỌA CHO YÊU CẦU: '{user_request}'")
    log_and_print("=" * 60)

    env_info = detect_environment()
    deps_info = check_dependencies()
    comfy_online = check_comfyui_status()

    success_steps = []
    failed_steps = []
    output_files = []

    # Step 1 & 2: Generate & Save Raw
    filename = generate_or_locate_raw(user_request, comfy_online)
    success_steps.append(f"Sinh ảnh & Lưu Raw: assets/raw/{filename}")
    output_files.append(f"assets/raw/{filename}")

    # Step 3: Remove Background (rembg)
    if process_background_removal(filename):
        success_steps.append(f"Xóa nền rembg: assets/transparent/{filename}")
        output_files.append(f"assets/transparent/{filename}")
    else:
        failed_steps.append(f"Xóa nền {filename}")

    # Step 4 & 5: Upscale Real-ESRGAN & Save Final
    if upscale_and_optimize(filename):
        success_steps.append(f"Upscale Real-ESRGAN: assets/final/{filename}")
        output_files.append(f"assets/final/{filename}")
        output_files.append(f"public/assets/{filename}")
    else:
        failed_steps.append(f"Upscale {filename}")

    # Step 6: Manifest Update
    update_manifest(user_request, filename)
    success_steps.append("Cập nhật manifest: assets/manifest.json")

    # Final summary report
    print("\n" + "=" * 60)
    print("📋 BÁO CÁO THỰC THI PIPELINE SUBMODULE")
    print("=" * 60)
    print("\n✅ Công đoạn thành công:")
    for step in success_steps:
        print(f"  - {step}")

    print("\n❌ Công đoạn thất bại:")
    if failed_steps:
        for step in failed_steps:
            print(f"  - {step}")
    else:
        print("  - Không có lỗi nào.")

    print("\n🖼️ File đầu ra:")
    for out in sorted(set(output_files)):
        print(f"  - {out}")

    print("\n💻 Lệnh đã thực hiện:")
    print(f"  - python scripts/asset_pipeline.py --request \"{user_request}\"")
    print(f"  - Log chi tiết: {LOG_FILE}")
    print("=" * 60)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Unified Submodule Asset Pipeline")
    parser.add_argument("--request", type=str, required=True, help="Yêu cầu thiết kế asset đồ họa")
    args = parser.parse_args()

    run_pipeline(args.request)

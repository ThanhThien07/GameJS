import os
import re
import sys
sys.stdout.reconfigure(encoding='utf-8')

src_dir = r"c:\Users\LENOVO\OneDrive\Documents\My Data Sources\NguyenHoangHung_501250384\src"
server_file = r"c:\Users\LENOVO\OneDrive\Documents\My Data Sources\NguyenHoangHung_501250384\server.js"

print("="*60)
print("AUDITING ALL SOURCE FILES & SERVER API CONTRACTS")
print("="*60)

# 1. Check socket.emit and socket.on events on client vs server
with open(server_file, 'r', encoding='utf-8') as f:
    server_code = f.read()

server_on_events = set(re.findall(r"socket\.on\(\s*['\"]([^'\"]+)['\"]", server_code))
server_emit_events = set(re.findall(r"io\.to\([^)]+\)\.emit\(\s*['\"]([^'\"]+)['\"]", server_code))

print("\n--- SERVER SOCKET EVENTS ---")
print("Server Listeners (socket.on):", server_on_events)
print("Server Emitters (io.emit):", server_emit_events)

client_emits = set()
client_ons = set()

for root, _, files in os.walk(src_dir):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                emits = re.findall(r"\.emit\(\s*['\"]([^'\"]+)['\"]", content)
                ons = re.findall(r"\.on\(\s*['\"]([^'\"]+)['\"]", content)
                client_emits.update(emits)
                client_ons.update(ons)

print("\n--- CLIENT SOCKET EVENTS ---")
print("Client Emitters (socket.emit):", client_emits)
print("Client Listeners (socket.on):", client_ons)

unmatched_client_emits = client_emits - server_on_events
unmatched_client_ons = client_ons - server_emit_events

print("\n--- SOCKET CONTRACT DISCREPANCIES ---")
if unmatched_client_emits:
    print("WARNING: Client emits events NOT handled by server:", unmatched_client_emits)
else:
    print("OK: All client emits match server listeners.")

if unmatched_client_ons:
    print("WARNING: Client listens to events NOT emitted by server:", unmatched_client_ons)
else:
    print("OK: All client listeners match server emitters.")

# 2. Check CSS Classes used in JSX vs defined in index.css
css_file = os.path.join(src_dir, "index.css")
with open(css_file, 'r', encoding='utf-8') as f:
    css_content = f.read()

css_classes = set(re.findall(r"\.([a-zA-Z0-9_-]+)", css_content))

print("\n--- CSS CLASS AUDIT ---")
jsx_custom_classes = set()
for root, _, files in os.walk(src_dir):
    for file in files:
        if file.endswith('.jsx'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                class_matches = re.findall(r'className=["`{]([^"`}]+)["`}]', content)
                for match in class_matches:
                    for cls in match.split():
                        cls = cls.strip()
                        if cls and not cls.startswith('text-') and not cls.startswith('bg-') and not cls.startswith('flex') and not cls.startswith('p-') and not cls.startswith('m-') and not cls.startswith('w-') and not cls.startswith('h-') and not cls.startswith('rounded') and not cls.startswith('border') and not cls.startswith('shadow') and not cls.startswith('font-') and not cls.startswith('items-') and not cls.startswith('justify-') and not cls.startswith('gap-') and not cls.startswith('grid') and not cls.startswith('col-') and not cls.startswith('row-') and not cls.startswith('absolute') and not cls.startswith('relative') and not cls.startswith('top-') and not cls.startswith('bottom-') and not cls.startswith('left-') and not cls.startswith('right-') and not cls.startswith('z-') and not cls.startswith('cursor-') and not cls.startswith('transition') and not cls.startswith('transform') and not cls.startswith('hover:') and not cls.startswith('active:') and not cls.startswith('focus:') and not cls.startswith('animate-') and not cls.startswith('tracking-') and not cls.startswith('uppercase') and not cls.startswith('capitalize') and not cls.startswith('truncate') and not cls.startswith('max-') and not cls.startswith('min-') and not cls.startswith('overflow-') and not cls.startswith('ring-') and not cls.startswith('filter') and not cls.startswith('drop-') and not cls.startswith('opacity-') and not cls.startswith('duration-') and not cls.startswith('space-'):
                            jsx_custom_classes.add(cls)

missing_classes = []
for cls in jsx_custom_classes:
    if cls not in css_classes and '${' not in cls and ':' not in cls:
        missing_classes.append(cls)

if missing_classes:
    print("WARNING: Custom CSS classes used in JSX but missing from index.css:", missing_classes)
else:
    print("OK: All custom CSS classes are defined in index.css.")

# 3. Check for potential JS syntax or reference errors across all files
print("\n--- JAVASCRIPT SYNTAX & REFERENCE CHECK ---")
import subprocess
try:
    result = subprocess.run(["npx", "eslint", "src", "--no-eslintrc"], capture_output=True, text=True)
    print("ESLint check result:")
    print(result.stdout or "No ESLint errors.")
except Exception as e:
    print("ESLint check skipped:", e)

print("\n="*60)

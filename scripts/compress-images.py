"""Compress images in public/ with TinyPNG, replacing them in place.

Usage (from the project root):
    python scripts/compress-images.py            # every image not yet compressed
    python scripts/compress-images.py path.png   # just these files

Needs `pip install tinify` and TINIFY_KEY in .env.local (never committed).
Already-compressed images are listed in scripts/compressed-images.txt and
skipped, so re-running never wastes the 500/month free quota.
"""

import hashlib
import os
import sys

import tinify

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC = os.path.join(ROOT, "public")
MANIFEST = os.path.join(ROOT, "scripts", "compressed-images.txt")
EXTS = {".png", ".jpg", ".jpeg", ".webp"}


def load_key():
    key = os.environ.get("TINIFY_KEY")
    if key:
        return key
    env_path = os.path.join(ROOT, ".env.local")
    if os.path.exists(env_path):
        with open(env_path, encoding="utf-8") as f:
            for line in f:
                name, _, value = line.strip().partition("=")
                if name == "TINIFY_KEY" and value:
                    return value.strip().strip('"')
    sys.exit("TINIFY_KEY not found. Add TINIFY_KEY=your_key to .env.local")


def file_hash(path):
    with open(path, "rb") as f:
        return hashlib.sha256(f.read()).hexdigest()


def load_manifest():
    if not os.path.exists(MANIFEST):
        return set()
    with open(MANIFEST, encoding="utf-8") as f:
        return {line.split()[0] for line in f if line.strip()}


def find_images():
    for dirpath, _, files in os.walk(PUBLIC):
        for name in files:
            if os.path.splitext(name)[1].lower() in EXTS:
                yield os.path.join(dirpath, name)


def main():
    tinify.key = load_key()
    done = load_manifest()
    paths = [os.path.abspath(p) for p in sys.argv[1:]] or list(find_images())

    before_total = after_total = 0
    with open(MANIFEST, "a", encoding="utf-8") as manifest:
        for path in paths:
            rel = os.path.relpath(path, ROOT)
            if file_hash(path) in done:
                continue
            before = os.path.getsize(path)
            try:
                tinify.from_file(path).to_file(path)
            except tinify.Error as e:
                print(f"FAILED {rel}: {e}")
                continue
            after = os.path.getsize(path)
            before_total += before
            after_total += after
            manifest.write(f"{file_hash(path)}  {rel}\n")
            print(f"{rel}: {before / 1024:.0f}KB -> {after / 1024:.0f}KB")

    if before_total:
        print(f"\nTotal: {before_total / 1024 / 1024:.1f}MB -> {after_total / 1024 / 1024:.1f}MB")
        print(f"Compressions used this month: {tinify.compression_count}")
    else:
        print("Nothing new to compress.")


if __name__ == "__main__":
    main()

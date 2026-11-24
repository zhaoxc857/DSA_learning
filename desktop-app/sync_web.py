#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
将 ../学习网站/ 中的纯静态前端资源同步到 desktop-app/dist/，
并将 ../labs/common/test_kit.h 复制到 desktop-app/src-tauri/resources/test_kit.h
供 Rust 通过 include_str! 内嵌进原生可执行文件。
"""

import os
import shutil
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

APP_DIR = Path(__file__).resolve().parent
REPO_ROOT = APP_DIR.parent
WEB_SRC_DIR = REPO_ROOT / "学习网站"
DIST_DIR = APP_DIR / "dist"
TEST_KIT_SRC = REPO_ROOT / "labs" / "common" / "test_kit.h"
TEST_KIT_DST = APP_DIR / "src-tauri" / "resources" / "test_kit.h"

INCLUDE_FILES = ["index.html"]
INCLUDE_DIRS = ["css", "js", "data"]
EXCLUDE_SUFFIXES = (".py", ".bat", ".vbs", ".pyc", ".log", ".pid", ".tmp", ".bak")
EXCLUDE_NAMES = {"__pycache__", ".DS_Store", "Thumbs.db"}


def should_skip(path: Path) -> bool:
    name = path.name
    if name in EXCLUDE_NAMES or name.startswith(".server."):
        return True
    if path.is_file() and name.lower().endswith(EXCLUDE_SUFFIXES):
        return True
    return False


def copy_tree_filtered(src_dir: Path, dst_dir: Path) -> int:
    count = 0
    for root, dirs, files in os.walk(src_dir):
        root_path = Path(root)
        dirs[:] = [d for d in dirs if not should_skip(root_path / d)]
        rel = root_path.relative_to(src_dir)
        target_root = dst_dir / rel
        target_root.mkdir(parents=True, exist_ok=True)
        for fname in files:
            src_file = root_path / fname
            if should_skip(src_file):
                continue
            dst_file = target_root / fname
            shutil.copy2(src_file, dst_file)
            count += 1
    return count


def main() -> int:
    if not WEB_SRC_DIR.is_dir():
        print(f"[sync_web] ERROR: 未找到学习网站目录: {WEB_SRC_DIR}", file=sys.stderr)
        return 1

    if DIST_DIR.exists():
        shutil.rmtree(DIST_DIR)
    DIST_DIR.mkdir(parents=True, exist_ok=True)

    copied = 0
    for fname in INCLUDE_FILES:
        src = WEB_SRC_DIR / fname
        if not src.is_file():
            print(f"[sync_web] ERROR: 缺少关键文件: {src}", file=sys.stderr)
            return 1
        shutil.copy2(src, DIST_DIR / fname)
        copied += 1

    for dname in INCLUDE_DIRS:
        src = WEB_SRC_DIR / dname
        if not src.is_dir():
            print(f"[sync_web] WARNING: 跳过不存在的目录: {src}")
            continue
        copied += copy_tree_filtered(src, DIST_DIR / dname)

    if not TEST_KIT_SRC.is_file():
        print(f"[sync_web] ERROR: 缺少评测头文件: {TEST_KIT_SRC}", file=sys.stderr)
        return 1

    TEST_KIT_DST.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(TEST_KIT_SRC, TEST_KIT_DST)

    print(f"[sync_web] 已同步 {copied} 个前端静态文件 -> {DIST_DIR}")
    print(f"[sync_web] 已同步 test_kit.h -> {TEST_KIT_DST}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

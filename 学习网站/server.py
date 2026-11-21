#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
《数据结构与算法》互动学习网站 —— 轻量本地静态服务与 C++ 真编译评测后端

特性：
  - 纯 Python 标准库实现（零第三方依赖）
  - 默认监听 127.0.0.1:8765，支持 --port 与 --no-browser，默认自动打开浏览器
  - 静态托管 学习网站/ 目录（全 UTF-8 MIME 支持）
  - API 端点：
      GET  /api/health    环境与 g++ 健康检查
      GET  /api/progress  读取 ../labs/.progress.json 进度
      POST /api/judge     真 g++ 编译运行 15 关评测 + 更新进度 + 可选安全写回 todo.cpp
      POST /api/run-demo  真 g++ 编译运行任意 C++11 演示代码（超时 8 秒）
"""

import argparse
import json
import mimetypes
import os
import posixpath
import re
import shutil
import subprocess
import sys
import tempfile
import threading
import webbrowser
from datetime import datetime
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Any, Dict, List, Optional, Tuple
from urllib.parse import unquote, urlparse

SITE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(SITE_DIR)
LABS_DIR = os.path.join(ROOT_DIR, "labs")
COMMON_DIR = os.path.join(LABS_DIR, "common")
PROGRESS_FILE = os.path.join(LABS_DIR, ".progress.json")

RUN_TIMEOUT_SEC = 8
COMPILE_TIMEOUT_SEC = 25
MAX_REQUEST_BYTES = 2 * 1024 * 1024  # 2 MB

# 与 labs/judge.py 严格一致的 15 关映射表
LAB_FOLDERS: Dict[str, str] = {
    "00": "00_指针与结构体热身",
    "01": "01_复杂度与字符统计",
    "02": "02_顺序表手写",
    "03": "03_单链表手写",
    "04": "04_双链表与约瑟夫环",
    "05": "05_栈与循环队列",
    "06": "06_KMP与递归回溯",
    "07": "07_二叉树手写",
    "08": "08_哈夫曼编码",
    "09": "09_图遍历与最短路",
    "10": "10_查找与哈希表",
    "11": "11_手写核心排序",
    "12": "12_静态链表与稀疏矩阵",
    "13": "13_图的进阶算法",
    "14": "14_全书终极盲写大考",
}

UTF8_MIME_MAP: Dict[str, str] = {
    ".html": "text/html; charset=utf-8",
    ".htm": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".mjs": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml; charset=utf-8",
    ".txt": "text/plain; charset=utf-8",
    ".md": "text/markdown; charset=utf-8",
    ".cpp": "text/plain; charset=utf-8",
    ".h": "text/plain; charset=utf-8",
    ".xml": "application/xml; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
}

_PROGRESS_LOCK = threading.Lock()
_ENV_CACHE: Optional[Dict[str, Any]] = None
_ENV_LOCK = threading.Lock()


def detect_gpp(force: bool = False) -> Dict[str, Any]:
    global _ENV_CACHE
    with _ENV_LOCK:
        if _ENV_CACHE is not None and not force:
            return dict(_ENV_CACHE)
        gpp_ok = False
        gpp_version = ""
        try:
            r = subprocess.run(
                ["g++", "--version"],
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="replace",
                timeout=5,
            )
            if r.returncode == 0:
                gpp_ok = True
                lines = [ln.strip() for ln in (r.stdout or "").splitlines() if ln.strip()]
                gpp_version = lines[0] if lines else "g++"
        except Exception:
            gpp_ok = False
            gpp_version = ""

        _ENV_CACHE = {
            "ok": True,
            "gpp": gpp_ok,
            "gppVersion": gpp_version,
            "pythonVersion": sys.version.split()[0],
            "labsCount": len(LAB_FOLDERS),
        }
        return dict(_ENV_CACHE)


def load_progress() -> Dict[str, Any]:
    with _PROGRESS_LOCK:
        if os.path.exists(PROGRESS_FILE):
            try:
                with open(PROGRESS_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if isinstance(data, dict):
                        return data
            except Exception:
                return {}
        return {}


def update_progress(lab_id: str, status: str, passed: int, total: int) -> None:
    with _PROGRESS_LOCK:
        prog: Dict[str, Any] = {}
        if os.path.exists(PROGRESS_FILE):
            try:
                with open(PROGRESS_FILE, "r", encoding="utf-8") as f:
                    loaded = json.load(f)
                    if isinstance(loaded, dict):
                        prog = loaded
            except Exception:
                prog = {}
        prog[lab_id] = {
            "status": status,
            "passed": passed,
            "total": total,
            "updated": datetime.now().isoformat(timespec="seconds"),
        }
        os.makedirs(os.path.dirname(PROGRESS_FILE), exist_ok=True)
        tmp_path = PROGRESS_FILE + ".tmp"
        try:
            with open(tmp_path, "w", encoding="utf-8", newline="\n") as f:
                json.dump(prog, f, ensure_ascii=False, indent=2)
            os.replace(tmp_path, PROGRESS_FILE)
        except Exception:
            try:
                if os.path.exists(tmp_path):
                    os.remove(tmp_path)
            except Exception:
                pass


def normalize_lab_id(raw: Any) -> Optional[str]:
    if raw is None:
        return None
    s = str(raw).strip()
    if s.isdigit():
        s = s.zfill(2)
    return s if s in LAB_FOLDERS else None


def save_lab_code_to_disk(lab_id: str, code: str) -> Tuple[bool, str]:
    """安全备份并原子写回 ../labs/<folder>/lab<id>_todo.cpp。"""
    folder = LAB_FOLDERS[lab_id]
    target_dir = os.path.join(LABS_DIR, folder)
    target_file = os.path.join(target_dir, f"lab{lab_id}_todo.cpp")
    if not os.path.isdir(target_dir):
        return False, f"找不到实验目录: {target_dir}"

    try:
        if os.path.exists(target_file):
            orig_bak = target_file + ".orig"
            if not os.path.exists(orig_bak):
                shutil.copy2(target_file, orig_bak)
            shutil.copy2(target_file, target_file + ".bak")

        tmp_file = target_file + ".tmp"
        with open(tmp_file, "w", encoding="utf-8", newline="\n") as f:
            f.write(code)
        os.replace(tmp_file, target_file)
        return True, target_file
    except Exception as exc:
        return False, str(exc)


def clean_compiler_paths(text: str, temp_src: str, display_name: str) -> str:
    if not text:
        return ""
    out = text.replace(temp_src, display_name)
    out = out.replace(temp_src.replace("\\", "/"), display_name)
    return out.strip()


def parse_judge_output(stdout_text: str) -> Tuple[int, int, List[Dict[str, str]]]:
    """解析 test_kit.h 输出的 [PASS]/[FAIL] 与 期望/实际/排查提示 及总计行。"""
    cases: List[Dict[str, str]] = []
    current_fail: Optional[Dict[str, str]] = None

    for raw_line in (stdout_text or "").splitlines():
        line = raw_line.rstrip("\r")
        stripped = line.strip()

        if line.startswith("[PASS] "):
            current_fail = None
            cases.append({
                "status": "pass",
                "name": line[7:].strip(),
                "expected": "",
                "actual": "",
                "hint": "",
            })
        elif line.startswith("[FAIL] "):
            current_fail = {
                "status": "fail",
                "name": line[7:].strip(),
                "expected": "",
                "actual": "",
                "hint": "",
            }
            cases.append(current_fail)
        elif current_fail is not None:
            if stripped.startswith("期望:"):
                current_fail["expected"] = stripped[len("期望:"):].strip()
            elif stripped.startswith("实际:"):
                current_fail["actual"] = stripped[len("实际:"):].strip()
            elif stripped.startswith("排查提示:"):
                current_fail["hint"] = stripped[len("排查提示:"):].strip()
            elif stripped.startswith("----") or stripped.startswith("总计:"):
                current_fail = None

    m = re.search(r"总计:\s*(\d+)\s*/\s*(\d+)\s*通过", stdout_text or "")
    if m:
        passed = int(m.group(1))
        total = int(m.group(2))
    else:
        passed = sum(1 for c in cases if c["status"] == "pass")
        total = len(cases)

    return passed, total, cases


def judge_lab(lab_id: str, code: str, save_to_disk: bool = False) -> Dict[str, Any]:
    saved_ok = False
    save_error = ""
    if save_to_disk:
        saved_ok, info = save_lab_code_to_disk(lab_id, code)
        if not saved_ok:
            save_error = info

    display_name = f"lab{lab_id}_todo.cpp"

    with tempfile.TemporaryDirectory(prefix=f"ds_lab{lab_id}_") as tmpdir:
        # 复刻 ../common/test_kit.h 目录层级，保证 #include "../common/test_kit.h" 100% 可解析
        tmp_common = os.path.join(tmpdir, "common")
        tmp_work = os.path.join(tmpdir, "work")
        os.makedirs(tmp_common, exist_ok=True)
        os.makedirs(tmp_work, exist_ok=True)

        src_test_kit = os.path.join(COMMON_DIR, "test_kit.h")
        if os.path.exists(src_test_kit):
            shutil.copy2(src_test_kit, os.path.join(tmp_common, "test_kit.h"))

        src_path = os.path.join(tmp_work, f"lab{lab_id}.cpp")
        exe_name = f"lab{lab_id}.exe" if os.name == "nt" else f"lab{lab_id}"
        exe_path = os.path.join(tmp_work, exe_name)

        with open(src_path, "w", encoding="utf-8", newline="\n") as f:
            f.write(code)

        cmd = [
            "g++",
            "-std=c++11",
            "-Wall",
            "-Wextra",
            f"-I{tmp_common}",
            f"-I{COMMON_DIR}",
            src_path,
            "-o",
            exe_path,
        ]

        try:
            comp = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="replace",
                timeout=COMPILE_TIMEOUT_SEC,
            )
        except FileNotFoundError:
            update_progress(lab_id, "compile_error", 0, 0)
            return {
                "ok": False,
                "compileOk": False,
                "compileError": "未找到 g++ 编译器！请先安装 Dev-C++ 或 MSYS2/MinGW 并将 g++ 加入系统 PATH。",
                "warnings": "",
                "timedOut": False,
                "crashed": False,
                "passed": 0,
                "total": 0,
                "cases": [],
                "rawOutput": "",
                "savedToDisk": saved_ok,
                "saveError": save_error,
            }
        except subprocess.TimeoutExpired:
            update_progress(lab_id, "compile_error", 0, 0)
            return {
                "ok": False,
                "compileOk": False,
                "compileError": f"编译超时（>{COMPILE_TIMEOUT_SEC}s）。",
                "warnings": "",
                "timedOut": False,
                "crashed": False,
                "passed": 0,
                "total": 0,
                "cases": [],
                "rawOutput": "",
                "savedToDisk": saved_ok,
                "saveError": save_error,
            }

        comp_err_clean = clean_compiler_paths(comp.stderr or "", src_path, display_name)
        if comp.returncode != 0:
            update_progress(lab_id, "compile_error", 0, 0)
            return {
                "ok": False,
                "compileOk": False,
                "compileError": comp_err_clean or "编译失败（未知错误）",
                "warnings": "",
                "timedOut": False,
                "crashed": False,
                "passed": 0,
                "total": 0,
                "cases": [],
                "rawOutput": "",
                "savedToDisk": saved_ok,
                "saveError": save_error,
            }

        warnings = comp_err_clean

        try:
            proc = subprocess.run(
                [exe_path],
                stdin=subprocess.DEVNULL,
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="replace",
                timeout=RUN_TIMEOUT_SEC,
            )
        except subprocess.TimeoutExpired as te:
            partial_out = ""
            if te.stdout:
                partial_out = te.stdout.decode("utf-8", errors="replace") if isinstance(te.stdout, bytes) else str(te.stdout)
            update_progress(lab_id, "timeout", 0, 0)
            return {
                "ok": False,
                "compileOk": True,
                "compileError": "",
                "warnings": warnings,
                "timedOut": True,
                "crashed": False,
                "passed": 0,
                "total": 0,
                "cases": [],
                "rawOutput": partial_out,
                "savedToDisk": saved_ok,
                "saveError": save_error,
            }

        stdout_text = proc.stdout or ""
        stderr_text = proc.stderr or ""
        raw_output = stdout_text
        if stderr_text.strip():
            raw_output = (stdout_text.rstrip() + "\n[stderr]\n" + stderr_text.strip()).strip()

        passed, total, cases = parse_judge_output(stdout_text)
        crashed = proc.returncode < 0 or proc.returncode > 1
        all_passed = (proc.returncode == 0) and (not crashed) and (total > 0) and (passed == total)

        if all_passed:
            update_progress(lab_id, "passed", passed, total)
        else:
            update_progress(lab_id, "in_progress", passed, total)

        return {
            "ok": all_passed,
            "compileOk": True,
            "compileError": "",
            "warnings": warnings,
            "timedOut": False,
            "crashed": crashed,
            "exitCode": proc.returncode,
            "passed": passed,
            "total": total,
            "cases": cases,
            "rawOutput": raw_output,
            "savedToDisk": saved_ok,
            "saveError": save_error,
        }


def run_demo_code(code: str) -> Dict[str, Any]:
    with tempfile.TemporaryDirectory(prefix="ds_demo_") as tmpdir:
        src_path = os.path.join(tmpdir, "demo.cpp")
        exe_name = "demo.exe" if os.name == "nt" else "demo"
        exe_path = os.path.join(tmpdir, exe_name)

        with open(src_path, "w", encoding="utf-8", newline="\n") as f:
            f.write(code)

        cmd = ["g++", "-std=c++11", src_path, "-o", exe_path]
        try:
            comp = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="replace",
                timeout=COMPILE_TIMEOUT_SEC,
            )
        except FileNotFoundError:
            return {
                "compileOk": False,
                "compileError": "未找到 g++ 编译器！请先安装 Dev-C++ 或 MSYS2/MinGW 并将 g++ 加入系统 PATH。",
                "timedOut": False,
                "exitCode": -1,
                "stdout": "",
                "stderr": "",
            }
        except subprocess.TimeoutExpired:
            return {
                "compileOk": False,
                "compileError": f"编译超时（>{COMPILE_TIMEOUT_SEC}s）。",
                "timedOut": False,
                "exitCode": -1,
                "stdout": "",
                "stderr": "",
            }

        if comp.returncode != 0:
            err = clean_compiler_paths(comp.stderr or "", src_path, "demo.cpp")
            return {
                "compileOk": False,
                "compileError": err or "编译失败",
                "timedOut": False,
                "exitCode": comp.returncode,
                "stdout": "",
                "stderr": "",
            }

        try:
            proc = subprocess.run(
                [exe_path],
                stdin=subprocess.DEVNULL,
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="replace",
                timeout=RUN_TIMEOUT_SEC,
            )
        except subprocess.TimeoutExpired as te:
            p_out = ""
            p_err = ""
            if te.stdout:
                p_out = te.stdout.decode("utf-8", errors="replace") if isinstance(te.stdout, bytes) else str(te.stdout)
            if te.stderr:
                p_err = te.stderr.decode("utf-8", errors="replace") if isinstance(te.stderr, bytes) else str(te.stderr)
            return {
                "compileOk": True,
                "compileError": "",
                "timedOut": True,
                "exitCode": -1,
                "stdout": p_out,
                "stderr": p_err,
            }

        return {
            "compileOk": True,
            "compileError": "",
            "timedOut": False,
            "exitCode": proc.returncode,
            "stdout": proc.stdout or "",
            "stderr": proc.stderr or "",
        }


class StudySiteHandler(BaseHTTPRequestHandler):
    server_version = "DSStudySite/1.0"

    def log_message(self, format: str, *args: Any) -> None:
        # 简洁 UTF-8 日志
        msg = format % args
        try:
            sys.stdout.write(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}\n")
            sys.stdout.flush()
        except Exception:
            pass

    def _send_cors_headers(self) -> None:
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def _send_json(self, status: int, payload: Any) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self._send_cors_headers()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _read_json_body(self) -> Tuple[Optional[Dict[str, Any]], Optional[str]]:
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            return None, "无效的 Content-Length"
        if length < 0 or length > MAX_REQUEST_BYTES:
            return None, "请求体过大或无效"
        raw = self.rfile.read(length) if length > 0 else b"{}"
        try:
            data = json.loads(raw.decode("utf-8"))
        except Exception as exc:
            return None, f"JSON 解析失败: {exc}"
        if not isinstance(data, dict):
            return None, "请求体必须是 JSON 对象"
        return data, None

    def do_OPTIONS(self) -> None:
        self.send_response(HTTPStatus.NO_CONTENT)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        req_path = parsed.path

        if req_path == "/api/health":
            self._send_json(HTTPStatus.OK, detect_gpp())
            return

        if req_path == "/api/progress":
            self._send_json(HTTPStatus.OK, load_progress())
            return

        self._serve_static(req_path)

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        req_path = parsed.path

        if req_path == "/api/judge":
            data, err = self._read_json_body()
            if err or data is None:
                self._send_json(HTTPStatus.BAD_REQUEST, {"ok": False, "error": err or "请求无效"})
                return
            lab_id = normalize_lab_id(data.get("labId"))
            if not lab_id:
                self._send_json(HTTPStatus.BAD_REQUEST, {"ok": False, "error": f"无效的关卡编号: {data.get('labId')}"})
                return
            code = data.get("code")
            if not isinstance(code, str):
                self._send_json(HTTPStatus.BAD_REQUEST, {"ok": False, "error": "缺少字符串字段 code"})
                return
            save_to_disk = bool(data.get("saveToDisk", False))
            result = judge_lab(lab_id, code, save_to_disk=save_to_disk)
            self._send_json(HTTPStatus.OK, result)
            return

        if req_path == "/api/run-demo":
            data, err = self._read_json_body()
            if err or data is None:
                self._send_json(HTTPStatus.BAD_REQUEST, {"compileOk": False, "compileError": err or "请求无效"})
                return
            code = data.get("code")
            if not isinstance(code, str):
                self._send_json(HTTPStatus.BAD_REQUEST, {"compileOk": False, "compileError": "缺少字符串字段 code"})
                return
            result = run_demo_code(code)
            self._send_json(HTTPStatus.OK, result)
            return

        self._send_json(HTTPStatus.NOT_FOUND, {"ok": False, "error": f"未知接口: {req_path}"})

    def _serve_static(self, req_path: str) -> None:
        rel = unquote(req_path)
        if rel == "/" or rel == "":
            rel = "/index.html"
        norm = posixpath.normpath(rel).lstrip("/")
        if norm.startswith("..") or "/../" in norm:
            self.send_error(HTTPStatus.FORBIDDEN, "Forbidden")
            return

        abs_path = os.path.abspath(os.path.join(SITE_DIR, norm.replace("/", os.sep)))
        site_root = os.path.abspath(SITE_DIR)
        if os.path.commonpath([site_root, abs_path]) != site_root:
            self.send_error(HTTPStatus.FORBIDDEN, "Forbidden")
            return

        if os.path.isdir(abs_path):
            abs_path = os.path.join(abs_path, "index.html")

        if not os.path.isfile(abs_path):
            self.send_error(HTTPStatus.NOT_FOUND, "File Not Found")
            return

        ext = os.path.splitext(abs_path)[1].lower()
        ctype = UTF8_MIME_MAP.get(ext)
        if not ctype:
            guessed, _ = mimetypes.guess_type(abs_path)
            ctype = guessed or "application/octet-stream"
            if ctype.startswith("text/") and "charset=" not in ctype:
                ctype += "; charset=utf-8"

        try:
            with open(abs_path, "rb") as f:
                content = f.read()
        except OSError:
            self.send_error(HTTPStatus.INTERNAL_SERVER_ERROR, "Read Error")
            return

        self.send_response(HTTPStatus.OK)
        self._send_cors_headers()
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(content)))
        self.send_header("Cache-Control", "no-cache")
        self.end_headers()
        self.wfile.write(content)


class ReusableThreadingHTTPServer(ThreadingHTTPServer):
    allow_reuse_address = True
    daemon_threads = True


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        try:
            sys.stdout.reconfigure(encoding="utf-8")
        except Exception:
            pass

    parser = argparse.ArgumentParser(description="《数据结构与算法》互动学习网站本地服务器")
    parser.add_argument("--host", default="127.0.0.1", help="监听地址（默认 127.0.0.1）")
    parser.add_argument("--port", type=int, default=8765, help="监听端口（默认 8765）")
    parser.add_argument("--no-browser", action="store_true", help="启动后不自动打开浏览器")
    args = parser.parse_args()

    env = detect_gpp(force=True)
    url = f"http://{args.host}:{args.port}/"

    try:
        server = ReusableThreadingHTTPServer((args.host, args.port), StudySiteHandler)
    except OSError as exc:
        print("============================================================")
        print(f"  [错误] 无法绑定端口 {args.port}：{exc}")
        print(f"  请检查端口 {args.port} 是否已被占用，或使用其他端口启动：")
        print(f"    启动学习网站.bat --port {args.port + 1}")
        print("============================================================")
        return 1

    print("============================================================")
    print("  《数据结构与算法》互动学习网站 —— 本地评测服务已启动")
    print(f"  访问地址: {url}")
    print(f"  Python  : {env['pythonVersion']}")
    print(f"  g++     : {env['gppVersion'] if env['gpp'] else '未检测到（仅浏览模式）'}")
    if not args.no_browser:
        print("  浏览器  : 正在自动打开学习网站...")
    print("  提示    : 保持此窗口运行即可使用网页内真 g++ 评测，关闭窗口即停止服务")
    print("  按 Ctrl+C 也可安全停止服务")
    print("============================================================")
    sys.stdout.flush()

    if not args.no_browser:
        threading.Timer(0.6, lambda: webbrowser.open(url)).start()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n正在关闭服务...")
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    sys.exit(main())

#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
《数据结构与算法》手写代码实战训练场 —— 智能一键自动评测脚本

用法示例（在 labs 目录下运行）：
  python judge.py all               # 评测全部 15 关的 todo 文件（并自动记录进度）
  python judge.py 03                # 只评测第 03 关（单链表手写）
  python judge.py 02 03 04          # 评测指定的多个关卡
  python judge.py --progress        # 查看全书 15 关学习进度看板（可视化进度条）
  python judge.py --hint 03         # 查看第 03 关的「不剧透」思路推导与边界提醒
  python judge.py --check-env       # 一键检测 g++ / C++11 / Python 编译环境
  python judge.py --solution all    # 校验全部 15 关参考答案
  python judge.py --list            # 列出所有关卡编号与名称
"""

import json
import os
import re
import subprocess
import sys
import tempfile
from datetime import datetime

LABS_DIR = os.path.dirname(os.path.abspath(__file__))
PROGRESS_FILE = os.path.join(LABS_DIR, ".progress.json")

LABS = [
    ("00", "00_指针与结构体热身", "第0章：指针、引用、动态数组、手动串联3节点链表"),
    ("01", "01_复杂度与字符统计", "第1章：例1.8 字符频次统计(O(mn) vs O(m)) + 有序数组双指针"),
    ("02", "02_顺序表手写",       "第2章：动态顺序表的初始化、按位/按值查、插入、删除、扩容"),
    ("03", "03_单链表手写",       "第2章：带头结点单链表的头插、尾插、按位增删、反转、销毁"),
    ("04", "04_双链表与约瑟夫环", "第2章：双链表四指针增删 + 循环链表解约瑟夫环"),
    ("05", "05_栈与循环队列",     "第3章：顺序栈与括号匹配 + 循环队列（判空/判满/队头队尾）"),
    ("06", "06_KMP与递归回溯",    "第3章：BF匹配/KMP next数组 + 迷宫回溯 + 0-1背包DP"),
    ("07", "07_二叉树手写",       "第4章：建树、前/中/后/层序遍历、求高度、叶子数、镜像与销毁"),
    ("08", "08_哈夫曼编码",       "第4章：哈夫曼树构造、WPL计算、前缀编码与解码"),
    ("09", "09_图遍历与最短路",   "第5章：邻接表DFS/BFS（含非连通图）+ Prim + Dijkstra"),
    ("10", "10_查找与哈希表",     "第6章：折半查找 + BST增查删（含双子节点）+ 拉链法哈希表"),
    ("11", "11_手写核心排序",     "第7章：插入/简单选择/冒泡优化/希尔/快排/堆排/归并排序"),
    ("12", "12_静态链表与稀疏矩阵", "进阶1（第2~3章）：静态链表游标管理 + 稀疏矩阵快速转置"),
    ("13", "13_图的进阶算法",     "进阶2（第5章）：Kruskal并查集 + Floyd多源最短路 + 拓扑排序判环"),
    ("14", "14_全书终极盲写大考", "终极验收：全书6大必背手写算法一次通关挑战"),
]


def safe_print(text: str) -> None:
    try:
        print(text)
    except UnicodeEncodeError:
        sys.stdout.buffer.write((text + "\n").encode("utf-8", errors="replace"))


def load_progress() -> dict:
    if os.path.exists(PROGRESS_FILE):
        try:
            with open(PROGRESS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}


def save_progress(data: dict) -> None:
    try:
        with open(PROGRESS_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    except Exception:
        pass


def check_environment() -> int:
    safe_print("================================================")
    safe_print("  编译与评测环境自检")
    safe_print("================================================")
    ok_all = True

    safe_print(f"[OK] Python 版本: {sys.version.split()[0]}")
    try:
        r = subprocess.run(["g++", "--version"], capture_output=True, text=True, encoding="utf-8", errors="replace")
        if r.returncode == 0:
            first_line = r.stdout.splitlines()[0] if r.stdout else "unknown"
            safe_print(f"[OK] g++ 编译器: {first_line}")
        else:
            safe_print("[FAIL] g++ 命令执行失败，请检查 MinGW / MSYS2 环境变量 PATH")
            ok_all = False
    except FileNotFoundError:
        safe_print("[FAIL] 未找到 g++！请先安装 Dev-C++ 或 MSYS2/MinGW 并把 g++ 加入 PATH")
        ok_all = False

    if ok_all:
        with tempfile.TemporaryDirectory() as td:
            src = os.path.join(td, "hello.cpp")
            exe = os.path.join(td, "hello.exe" if os.name == "nt" else "hello")
            with open(src, "w", encoding="utf-8") as f:
                f.write('#include <iostream>\n#include <vector>\nint main(){std::vector<int> v={1,2};std::cout<<v.size();return 0;}\n')
            c = subprocess.run(["g++", "-std=c++11", src, "-o", exe], capture_output=True, text=True)
            if c.returncode == 0:
                run = subprocess.run([exe], capture_output=True, text=True)
                if run.returncode == 0 and run.stdout.strip() == "2":
                    safe_print("[OK] C++11 编译与运行测试通过！")
                else:
                    safe_print("[FAIL] 编译成功但运行异常")
                    ok_all = False
            else:
                safe_print("[FAIL] C++11 测试编译失败：" + c.stderr)
                ok_all = False

    tk = os.path.join(LABS_DIR, "common", "test_kit.h")
    if os.path.exists(tk):
        safe_print("[OK] 测试框架 common/test_kit.h 完好")
    else:
        safe_print("[FAIL] 缺失 common/test_kit.h")
        ok_all = False

    safe_print("------------------------------------------------")
    if ok_all:
        safe_print("环境完全正常！可以运行 python judge.py 00 开始第 00 关。")
        return 0
    return 1


def show_hint(target: str) -> int:
    t_norm = target.zfill(2) if target.isdigit() else target.lower()
    matched = [item for item in LABS if item[0] == t_norm or t_norm in item[1].lower()]
    if not matched:
        safe_print(f"[错误] 未找到关卡 '{target}'，请运行 python judge.py --list 查看编号。")
        return 2
    lab_id, folder, desc = matched[0]
    src = os.path.join(LABS_DIR, folder, f"lab{lab_id}_todo.cpp")
    if not os.path.exists(src):
        safe_print(f"[错误] 找不到文件: {src}")
        return 1

    with open(src, "r", encoding="utf-8") as f:
        lines = f.readlines()

    safe_print("================================================")
    safe_print(f"  💡 关卡 {lab_id} 不剧透思路卡片：{desc}")
    safe_print("================================================")

    # 提取 main() 之前所有带“函数目标/思路推导/边界提醒”的注释块及其对应函数签名
    n = len(lines)
    i = 0
    printed_any = False
    while i < n:
        stripped = lines[i].strip()
        if re.match(r"^int\s+main\s*\(", stripped):
            break
        # 收集连续的注释块（// 或 /* ... */）
        if stripped.startswith("//") or stripped.startswith("/*"):
            block = []
            if stripped.startswith("/*"):
                while i < n:
                    block.append(lines[i].rstrip())
                    if "*/" in lines[i]:
                        i += 1
                        break
                    i += 1
            else:
                while i < n and lines[i].strip().startswith("//"):
                    block.append(lines[i].rstrip())
                    i += 1
            block_text = "\n".join(block)
            if any(k in block_text for k in ("【函数目标】", "【画图与思路推导】", "【思路推导】", "【边界提醒】", "【题目", "【任务")):
                printed_any = True
                # 找紧随其后的函数签名
                sig = ""
                j = i
                while j < n and (not lines[j].strip()):
                    j += 1
                if j < n:
                    sig = lines[j].strip().rstrip("{").strip()
                if sig:
                    safe_print(f"\n📌 函数：{sig}")
                for b in block:
                    clean = re.sub(r"^\s*(//|/\*|\*/|\*)\s?", "", b).strip()
                    if clean and not set(clean) <= set("=-* "):
                        safe_print(f"   {clean}")
            continue
        i += 1

    if not printed_any:
        safe_print("  请直接打开对应 todo.cpp 阅读函数上方的中文引导注释。")
    safe_print("\n------------------------------------------------")
    safe_print(f"  编辑文件: {src}")
    safe_print(f"  评测命令: python judge.py {lab_id}")
    return 0


def show_progress() -> int:
    prog = load_progress()
    safe_print("================================================================")
    safe_print("  📊 《数据结构与算法》全书 15 关手写代码进度看板")
    safe_print("================================================================")
    done_labs = 0
    total_passed_cases = 0
    total_known_cases = 0
    next_rec = None

    for lab_id, folder, desc in LABS:
        rec = prog.get(lab_id)
        if rec:
            p = rec.get("passed", 0)
            t = rec.get("total", 0)
            status = rec.get("status", "in_progress")
            total_passed_cases += p
            total_known_cases += t
            if status == "passed":
                done_labs += 1
                badge = f"✅ 已通关 ({p}/{t})"
            elif status == "compile_error":
                badge = "❌ 编译报错"
                if next_rec is None:
                    next_rec = (lab_id, desc)
            else:
                badge = f"🔧 进行中 ({p}/{t})"
                if next_rec is None:
                    next_rec = (lab_id, desc)
        else:
            badge = "⬜ 未开始"
            if next_rec is None:
                next_rec = (lab_id, desc)
        safe_print(f"  [{lab_id}] {badge:<18} | {desc}")

    pct = int(done_labs * 100 / len(LABS))
    filled = int(done_labs * 20 / len(LABS))
    bar = "█" * filled + "░" * (20 - filled)
    safe_print("----------------------------------------------------------------")
    safe_print(f"  总进度: [{bar}] {done_labs}/{len(LABS)} 关 ({pct}%)")
    if total_known_cases > 0:
        safe_print(f"  已测断言累计通过: {total_passed_cases} / {total_known_cases}")
    if next_rec:
        safe_print(f"  👉 建议下一关: python judge.py {next_rec[0]}   ({next_rec[1]})")
    else:
        safe_print("  🏆 全书 15 关已 100% 通关！你已经真正掌握了手写数据结构与算法！")
    safe_print("================================================================")
    return 0


def parse_counts(stdout_text: str):
    m = re.search(r"总计:\s*(\d+)\s*/\s*(\d+)\s*通过", stdout_text)
    if m:
        return int(m.group(1)), int(m.group(2))
    return 0, 0


def run_one(lab_id: str, folder: str, desc: str, use_solution: bool, prog: dict) -> bool:
    lab_path = os.path.join(LABS_DIR, folder)
    suffix = "solution.cpp" if use_solution else "todo.cpp"
    src = os.path.join(lab_path, f"lab{lab_id}_{suffix}")
    if not os.path.exists(src):
        safe_print(f"[SKIP] 找不到文件: {src}")
        return False

    mode_tag = "参考答案" if use_solution else "你的代码"
    safe_print(f"\n>>> 正在编译关卡 {lab_id} ({desc}) [{mode_tag}] ...")

    with tempfile.TemporaryDirectory() as tmpdir:
        exe_name = f"lab{lab_id}.exe" if os.name == "nt" else f"lab{lab_id}"
        exe_path = os.path.join(tmpdir, exe_name)
        cmd = [
            "g++", "-std=c++11", "-Wall", "-Wextra",
            f"-I{os.path.join(LABS_DIR, 'common')}",
            src, "-o", exe_path,
        ]
        comp = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
        if comp.returncode != 0:
            safe_print(f"[编译失败] lab{lab_id}_{suffix}")
            safe_print(comp.stderr.strip())
            if not use_solution:
                prog[lab_id] = {"status": "compile_error", "passed": 0, "total": 0, "updated": datetime.now().isoformat(timespec="seconds")}
            return False
        if comp.stderr.strip() and use_solution:
            safe_print(f"[编译警告] lab{lab_id}_{suffix}:\n{comp.stderr.strip()}")

        try:
            proc = subprocess.run(
                [exe_path],
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="replace",
                timeout=8,
            )
        except subprocess.TimeoutExpired:
            safe_print(f"[运行超时 >8s] 极可能出现了死循环！请检查 while / for 终止条件或链表指针是否成环。")
            if not use_solution:
                prog[lab_id] = {"status": "timeout", "passed": 0, "total": 0, "updated": datetime.now().isoformat(timespec="seconds")}
            return False

        if proc.stdout:
            safe_print(proc.stdout.rstrip())
        if proc.stderr:
            safe_print("[stderr] " + proc.stderr.rstrip())

        passed_n, total_n = parse_counts(proc.stdout or "")
        if proc.returncode != 0:
            if proc.returncode < 0 or proc.returncode > 1:
                safe_print(f"[异常崩溃] 程序异常退出 (返回码 {proc.returncode})：常见原因有空指针解引用、数组越界、无限递归栈溢出。")
            if not use_solution:
                prog[lab_id] = {"status": "in_progress", "passed": passed_n, "total": total_n, "updated": datetime.now().isoformat(timespec="seconds")}
            return False

        if not use_solution:
            prog[lab_id] = {"status": "passed", "passed": passed_n, "total": total_n, "updated": datetime.now().isoformat(timespec="seconds")}
        return True


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        try:
            sys.stdout.reconfigure(encoding="utf-8")
        except Exception:
            pass

    args = sys.argv[1:]
    if not args or "-h" in args or "--help" in args:
        safe_print(__doc__.strip())
        return 0

    if "--check-env" in args:
        return check_environment()

    if "--progress" in args or "-p" in args:
        return show_progress()

    if "--hint" in args:
        idx = args.index("--hint")
        if idx + 1 >= len(args):
            safe_print("请指定关卡编号，例如：python judge.py --hint 03")
            return 2
        return show_hint(args[idx + 1])

    if "--list" in args:
        safe_print("关卡清单（共 15 关）：")
        for lab_id, folder, desc in LABS:
            safe_print(f"  {lab_id}  {folder:<22}  {desc}")
        return 0

    use_solution = False
    targets = []
    for a in args:
        if a in ("--solution", "-s"):
            use_solution = True
        else:
            targets.append(a.lower())

    if not targets or "all" in targets:
        selected = LABS
    else:
        selected = []
        for t in targets:
            t_norm = t.zfill(2) if t.isdigit() else t
            matched = [item for item in LABS if item[0] == t_norm or t in item[1].lower()]
            if not matched:
                safe_print(f"[错误] 未找到关卡 '{t}'，请运行 python judge.py --list 查看编号。")
                return 2
            for m in matched:
                if m not in selected:
                    selected.append(m)

    prog = load_progress()
    passed_labs = 0
    failed_labs = []
    for lab_id, folder, desc in selected:
        ok = run_one(lab_id, folder, desc, use_solution, prog)
        if ok:
            passed_labs += 1
        else:
            failed_labs.append(f"{lab_id}({folder})")

    if not use_solution:
        save_progress(prog)

    safe_print("\n================================================")
    safe_print(f"汇总：{passed_labs} / {len(selected)} 个关卡全部通过")
    if failed_labs:
        safe_print("未通过关卡：" + ", ".join(failed_labs))
        if not use_solution:
            safe_print("小提示：卡住时可运行 python judge.py --hint <关卡号> 查看不剧透推导卡片")
    else:
        safe_print("全部通关！干得漂亮！")
    safe_print("================================================")
    return 0 if not failed_labs else 1


if __name__ == "__main__":
    sys.exit(main())

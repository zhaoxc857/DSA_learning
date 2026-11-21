#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
《数据结构与算法》互动学习网站 —— 离线数据打包管线

功能：
  读取上级目录（C:\\数据结构\\数据结构与算法_自学笔记\\）中的：
  - 全部 17 份权威 Markdown 文档（14 份主导航文档 + 3 份 README 辅助文档）
  - 全部 15 关手写实战实验室 labs/（todo.cpp、solution.cpp、推导提示、用例数）
  - 全部 30 份完整可运行示例 code/*.cpp

  打包输出为 6 个纯离线 UTF-8 JS 数据文件（支持 file:// 直接加载、零 CORS、安全转义 </script>）：
  1. data/manifest.js        -> window.DS_MANIFEST
  2. data/chapters_0_3.js    -> window.DS_CHAPTERS["00".."03"]
  3. data/chapters_4_7.js    -> window.DS_CHAPTERS["04".."07"]
  4. data/extras.js          -> window.DS_CHAPTERS["appA","appB","guide","exercises","practice","cheatsheet","readme","labsReadme","codeReadme"]
  5. data/labs_data.js       -> window.DS_LABS
  6. data/demos_data.js      -> window.DS_DEMOS
"""

import json
import os
import re
import sys
from typing import Any, Dict, List, Tuple

SITE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(SITE_DIR)
DATA_DIR = os.path.join(SITE_DIR, "data")
LABS_DIR = os.path.join(ROOT_DIR, "labs")
CODE_DIR = os.path.join(ROOT_DIR, "code")

# 严格按照约定顺序与 ID 定义 14 份主导航文档
CHAPTER_SPECS: List[Dict[str, Any]] = [
    {
        "id": "00",
        "file": "00-C与C++基础回顾.md",
        "shortTitle": "第0章 C/C++基础",
        "group": "core",
        "bundle": "chapters_0_3",
        "labIds": ["00"],
        "vizTabs": [],
        "difficulty": 2,
        "estDays": "1～2 天",
        "summary": "指针、引用、结构体、类、动态内存 new/delete 与指针手写工坊",
    },
    {
        "id": "01",
        "file": "01-绪论.md",
        "shortTitle": "第1章 绪论",
        "group": "core",
        "bundle": "chapters_0_3",
        "labIds": ["01"],
        "vizTabs": [],
        "difficulty": 2,
        "estDays": "1 天",
        "summary": "逻辑/存储结构、大 O 时间空间复杂度、STL 入门与工程实践",
    },
    {
        "id": "02",
        "file": "02-线性表.md",
        "shortTitle": "第2章 线性表",
        "group": "core",
        "bundle": "chapters_0_3",
        "labIds": ["02", "03", "04", "12"],
        "vizTabs": ["linkedlist"],
        "difficulty": 3,
        "estDays": "3～4 天",
        "summary": "顺序表、单链表、循环链表、双链表、静态链表与指针操作实战",
    },
    {
        "id": "03",
        "file": "03-线性表的扩展.md",
        "shortTitle": "第3章 线性表扩展",
        "group": "core",
        "bundle": "chapters_0_3",
        "labIds": ["05", "06", "12"],
        "vizTabs": ["queue", "kmp"],
        "difficulty": 4,
        "estDays": "4～5 天",
        "summary": "栈、循环队列、串与 KMP、多维数组、稀疏矩阵与四大经典算法",
    },
    {
        "id": "04",
        "file": "04-树.md",
        "shortTitle": "第4章 树与二叉树",
        "group": "core",
        "bundle": "chapters_4_7",
        "labIds": ["07", "08"],
        "vizTabs": ["tree", "huffman"],
        "difficulty": 4,
        "estDays": "3～4 天",
        "summary": "树与二叉树性质、四种遍历、树转二叉树、存储结构与哈夫曼编码",
    },
    {
        "id": "05",
        "file": "05-图.md",
        "shortTitle": "第5章 图",
        "group": "core",
        "bundle": "chapters_4_7",
        "labIds": ["09", "13"],
        "vizTabs": ["graph"],
        "difficulty": 5,
        "estDays": "4～5 天",
        "summary": "邻接矩阵/邻接表、DFS/BFS、Prim/Kruskal 最小生成树、Dijkstra/Floyd 与拓扑排序",
    },
    {
        "id": "06",
        "file": "06-查找.md",
        "shortTitle": "第6章 查找",
        "group": "core",
        "bundle": "chapters_4_7",
        "labIds": ["10"],
        "vizTabs": ["bst"],
        "difficulty": 4,
        "estDays": "3～4 天",
        "summary": "顺序/折半查找、BST/AVL/B-树、散列表、中文分词与数据库索引",
    },
    {
        "id": "07",
        "file": "07-排序.md",
        "shortTitle": "第7章 排序",
        "group": "core",
        "bundle": "chapters_4_7",
        "labIds": ["11", "14"],
        "vizTabs": ["sort"],
        "difficulty": 4,
        "estDays": "3～4 天",
        "summary": "插入/选择/冒泡/希尔/快排/堆排/归并及非比较排序全面对比",
    },
    {
        "id": "appA",
        "file": "附录A-异常处理.md",
        "shortTitle": "附录A 异常处理",
        "group": "appendix",
        "bundle": "extras",
        "labIds": [],
        "vizTabs": [],
        "difficulty": 2,
        "estDays": "半天",
        "summary": "C++ throw / try / catch 异常机制与安全编程规范（教材附录 1）",
    },
    {
        "id": "appB",
        "file": "附录B-模板.md",
        "shortTitle": "附录B 模板",
        "group": "appendix",
        "bundle": "extras",
        "labIds": [],
        "vizTabs": [],
        "difficulty": 2,
        "estDays": "半天",
        "summary": "函数模板、类模板、非类型模板参数与教材勘误（教材附录 2）",
    },
    {
        "id": "guide",
        "file": "写代码通关指南.md",
        "shortTitle": "写代码通关指南",
        "group": "resource",
        "bundle": "extras",
        "labIds": ["00"],
        "vizTabs": [],
        "difficulty": 1,
        "estDays": "15 分钟",
        "summary": "四步代码推导法 + 指针 5 条铁律，打破“看懂却写不出”的瓶颈",
    },
    {
        "id": "exercises",
        "file": "课本习题精解.md",
        "shortTitle": "课本习题精解",
        "group": "resource",
        "bundle": "extras",
        "labIds": [],
        "vizTabs": [],
        "difficulty": 3,
        "estDays": "随章配套",
        "summary": "教材《习题 1》～《习题 7》原题逐题精解、复杂度推导与算法设计",
    },
    {
        "id": "practice",
        "file": "编程练习.md",
        "shortTitle": "编程练习 40 题",
        "group": "resource",
        "bundle": "extras",
        "labIds": ["14"],
        "vizTabs": [],
        "difficulty": 3,
        "estDays": "随章配套",
        "summary": "40 道进阶手写编程题，含思路提示、参考答案与自动化测试用例",
    },
    {
        "id": "cheatsheet",
        "file": "速查表.md",
        "shortTitle": "全书速查表",
        "group": "resource",
        "bundle": "extras",
        "labIds": [],
        "vizTabs": [],
        "difficulty": 1,
        "estDays": "随时查阅",
        "summary": "全书核心结论与复杂度压缩成 9 张速查表 + 面试高频 20 问",
    },
]

# 其余 3 份 README 文档（凑齐全部 17 份权威 Markdown，并支持站内链接跳转）
EXTRA_README_SPECS: List[Dict[str, str]] = [
    {"id": "readme", "file": "README.md", "shortTitle": "全书导读", "bundle": "extras"},
    {"id": "labsReadme", "file": "labs/README.md", "shortTitle": "训练场说明", "bundle": "extras"},
    {"id": "codeReadme", "file": "code/README.md", "shortTitle": "代码库说明", "bundle": "extras"},
]

# 15 关元数据（与 labs/judge.py 严格同步）
LAB_META: List[Tuple[str, str, str, str, int]] = [
    ("00", "00_指针与结构体热身",   "00", "第0章：指针、引用、动态数组、手动串联3节点链表", 25),
    ("01", "01_复杂度与字符统计",   "01", "第1章：例1.8 字符频次统计(O(mn) vs O(m)) + 有序数组双指针", 27),
    ("02", "02_顺序表手写",         "02", "第2章：动态顺序表的初始化、按位/按值查、插入、删除、扩容", 52),
    ("03", "03_单链表手写",         "02", "第2章：带头结点单链表的头插、尾插、按位增删、反转、销毁", 35),
    ("04", "04_双链表与约瑟夫环",   "02", "第2章：双链表四指针增删 + 循环链表解约瑟夫环", 36),
    ("05", "05_栈与循环队列",       "03", "第3章：顺序栈与括号匹配 + 循环队列（判空/判满/队头队尾）", 37),
    ("06", "06_KMP与递归回溯",      "03", "第3章：BF匹配/KMP next数组 + 迷宫回溯 + 0-1背包DP", 33),
    ("07", "07_二叉树手写",         "04", "第4章：建树、前/中/后/层序遍历、求高度、叶子数、镜像与销毁", 36),
    ("08", "08_哈夫曼编码",         "04", "第4章：哈夫曼树构造、WPL计算、前缀编码与解码", 22),
    ("09", "09_图遍历与最短路",     "05", "第5章：邻接表DFS/BFS（含非连通图）+ Prim + Dijkstra", 17),
    ("10", "10_查找与哈希表",       "06", "第6章：折半查找 + BST增查删（含双子节点）+ 拉链法哈希表", 36),
    ("11", "11_手写核心排序",       "07", "第7章：插入/简单选择/冒泡优化/希尔/快排/堆排/归并排序", 49),
    ("12", "12_静态链表与稀疏矩阵", "03", "进阶1（第2~3章）：静态链表游标管理 + 稀疏矩阵快速转置", 30),
    ("13", "13_图的进阶算法",       "05", "进阶2（第5章）：Kruskal并查集 + Floyd多源最短路 + 拓扑排序判环", 19),
    ("14", "14_全书终极盲写大考",   "07", "终极验收：全书6大必背手写算法一次通关挑战", 23),
]

HINT_KEYWORDS = (
    "【函数目标】",
    "【画图与思路推导】",
    "【思路推导】",
    "【边界提醒】",
    "【题目",
    "【任务",
)


def read_utf8(path: str) -> str:
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def to_safe_js_json(obj: Any, indent: int = None) -> str:
    """将对象序列化为可安全嵌入 <script> 标签与离线 .js 文件的 JSON 字面量。"""
    if indent is None:
        raw = json.dumps(obj, ensure_ascii=False, separators=(",", ":"))
    else:
        raw = json.dumps(obj, ensure_ascii=False, indent=indent)
    raw = re.sub(r"</(script)", r"<\/\1", raw, flags=re.IGNORECASE)
    raw = raw.replace("<!--", "<\\!--")
    raw = raw.replace("\u2028", "\\u2028").replace("\u2029", "\\u2029")
    return raw


def write_js_file(filename: str, content: str) -> int:
    os.makedirs(DATA_DIR, exist_ok=True)
    out_path = os.path.join(DATA_DIR, filename)
    with open(out_path, "w", encoding="utf-8", newline="\n") as f:
        f.write(content)
    return os.path.getsize(out_path)


def strip_md_inline(text: str) -> str:
    """去除标题中的常见行内 Markdown 语法以便生成干净文本或 slug。"""
    t = re.sub(r"!\[([^\]]*)\]\([^)]*\)", r"\1", text)
    t = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", t)
    t = re.sub(r"`([^`]*)`", r"\1", t)
    t = re.sub(r"(\*\*|__|\*|_)", "", t)
    t = re.sub(r"<[^>]+>", "", t)
    return t.strip()


def make_slug(text: str, used: Dict[str, int], fallback_idx: int) -> str:
    """生成与 GitHub/Typora 兼容且在单章内唯一的锚点 slug。"""
    clean = strip_md_inline(text).lower()
    # 保留英文字母、数字、汉字、空白与连字符
    clean = re.sub(r"[^a-z0-9\u4e00-\u9fff\s-]", "", clean)
    clean = re.sub(r"[\s]+", "-", clean.strip())
    clean = re.sub(r"-{2,}", "-", clean).strip("-")
    if not clean:
        clean = f"sec-{fallback_idx}"
    count = used.get(clean, 0)
    used[clean] = count + 1
    if count == 0:
        return clean
    return f"{clean}-{count + 1}"


def extract_title_and_headings(markdown: str, fallback_title: str) -> Tuple[str, List[Dict[str, Any]], List[str]]:
    """提取 H1 标题以及跳过围栏代码块后的全部 H2/H3 标题与唯一 slug。"""
    title = fallback_title
    headings: List[Dict[str, Any]] = []
    used_slugs: Dict[str, int] = {}
    in_fence = False
    fence_char = ""
    fence_len = 0

    for line in markdown.splitlines():
        stripped = line.strip()
        m_fence = re.match(r"^(`{3,}|~{3,})", stripped)
        if m_fence:
            marker = m_fence.group(1)
            if not in_fence:
                in_fence = True
                fence_char = marker[0]
                fence_len = len(marker)
            elif marker[0] == fence_char and len(marker) >= fence_len and stripped == marker[0] * len(stripped):
                in_fence = False
            continue
        if in_fence:
            continue

        m_h1 = re.match(r"^#\s+(.+?)\s*#*$", line)
        if m_h1 and title == fallback_title:
            title = strip_md_inline(m_h1.group(1))
            continue

        m_h = re.match(r"^(#{2,3})\s+(.+?)\s*#*$", line)
        if m_h:
            level = len(m_h.group(1))
            raw_text = m_h.group(2).strip()
            display_text = strip_md_inline(raw_text) or raw_text
            slug = make_slug(raw_text, used_slugs, len(headings) + 1)
            headings.append({"level": level, "text": display_text, "slug": slug})

    section_slugs = [h["slug"] for h in headings if h["level"] == 2]
    if not section_slugs:
        section_slugs = [h["slug"] for h in headings]
    return title, headings, section_slugs


def extract_lab_hints(todo_code: str) -> List[Dict[str, Any]]:
    """复用 labs/judge.py 的注释推导提示提取逻辑，返回 [{sig, lines}]。"""
    lines = todo_code.splitlines()
    n = len(lines)
    i = 0
    hints: List[Dict[str, Any]] = []
    while i < n:
        stripped = lines[i].strip()
        if re.match(r"^int\s+main\s*\(", stripped):
            break
        if stripped.startswith("//") or stripped.startswith("/*"):
            block: List[str] = []
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
            if any(k in block_text for k in HINT_KEYWORDS):
                sig = ""
                j = i
                while j < n and not lines[j].strip():
                    j += 1
                if j < n:
                    sig = lines[j].strip().rstrip("{").strip()
                cleaned_lines: List[str] = []
                for b in block:
                    clean = re.sub(r"^\s*(//|/\*|\*/|\*)\s?", "", b).strip()
                    if clean and not set(clean) <= set("=-* "):
                        cleaned_lines.append(clean)
                if cleaned_lines:
                    hints.append({"sig": sig, "lines": cleaned_lines})
            continue
        i += 1
    return hints


def infer_demo_meta(filename: str, code: str) -> Tuple[str, str]:
    """根据 code/*.cpp 文件名和头部注释推断所属章节 ID 与展示标题。"""
    stem = os.path.splitext(filename)[0]
    m_num = re.match(r"^(\d{2})_(.+)$", stem)
    if m_num:
        chap_id = m_num.group(1)
        raw_name = m_num.group(2)
    elif stem.startswith("附录_"):
        chap_id = "appA"
        raw_name = stem[len("附录_"):]
    elif "练习册" in stem:
        chap_id = "practice"
        raw_name = stem
    else:
        chap_id = "00"
        raw_name = stem

    title = raw_name.replace("_", " · ")
    # 若头部注释中有更清晰的中文描述（如 “// 配套笔记：...” 之后的说明行），保留简洁文件名标题即可
    return chap_id, title


def build_chapters_and_manifest() -> Tuple[Dict[str, Any], Dict[str, List[Dict[str, Any]]]]:
    bundles: Dict[str, List[Dict[str, Any]]] = {
        "chapters_0_3": [],
        "chapters_4_7": [],
        "extras": [],
    }
    manifest_chapters: List[Dict[str, Any]] = []
    extra_docs_meta: List[Dict[str, Any]] = []
    total_lines = 0

    for spec in CHAPTER_SPECS:
        rel_file = spec["file"]
        abs_path = os.path.join(ROOT_DIR, rel_file)
        if not os.path.exists(abs_path):
            raise FileNotFoundError(f"找不到 Markdown 文件: {abs_path}")
        md = read_utf8(abs_path)
        line_count = len(md.splitlines())
        total_lines += line_count
        title, headings, section_slugs = extract_title_and_headings(md, spec["shortTitle"])

        manifest_chapters.append({
            "id": spec["id"],
            "file": rel_file.replace("\\", "/"),
            "title": title,
            "shortTitle": spec["shortTitle"],
            "group": spec["group"],
            "bundle": spec["bundle"],
            "labIds": list(spec["labIds"]),
            "vizTabs": list(spec["vizTabs"]),
            "difficulty": spec["difficulty"],
            "estDays": spec["estDays"],
            "lineCount": line_count,
            "summary": spec["summary"],
        })

        bundles[spec["bundle"]].append({
            "id": spec["id"],
            "title": title,
            "markdown": md,
            "headings": headings,
            "sectionSlugs": section_slugs,
        })

    # 打包其余 3 份 README（共 17 份权威 Markdown 全覆盖）
    for extra in EXTRA_README_SPECS:
        rel_file = extra["file"]
        abs_path = os.path.join(ROOT_DIR, rel_file.replace("/", os.sep))
        if not os.path.exists(abs_path):
            raise FileNotFoundError(f"找不到 Markdown 文件: {abs_path}")
        md = read_utf8(abs_path)
        line_count = len(md.splitlines())
        total_lines += line_count
        title, headings, section_slugs = extract_title_and_headings(md, extra["shortTitle"])

        extra_docs_meta.append({
            "id": extra["id"],
            "file": rel_file.replace("\\", "/"),
            "title": title,
            "shortTitle": extra["shortTitle"],
            "bundle": extra["bundle"],
            "lineCount": line_count,
        })

        bundles[extra["bundle"]].append({
            "id": extra["id"],
            "title": title,
            "markdown": md,
            "headings": headings,
            "sectionSlugs": section_slugs,
        })

    manifest = {
        "bookTitle": "《数据结构与算法》互动自学站",
        "subtitle": "配套徐雅静等《数据结构与算法》· 全书精读 · 8大动画 · 15关真编译评测 · 刷题诊所",
        "chapters": manifest_chapters,
        "extraDocs": extra_docs_meta,
        "stats": {
            "totalLines": total_lines,
            "totalChapters": len(manifest_chapters),
            "totalDocs": len(manifest_chapters) + len(extra_docs_meta),
            "totalLabs": len(LAB_META),
            "totalDemos": 0,  # 稍后填入实际扫描数量
        },
    }
    return manifest, bundles


def build_labs() -> List[Dict[str, Any]]:
    labs_list: List[Dict[str, Any]] = []
    for lab_id, folder, chapter_id, desc, expected_tests in LAB_META:
        lab_dir = os.path.join(LABS_DIR, folder)
        todo_path = os.path.join(lab_dir, f"lab{lab_id}_todo.cpp")
        sol_path = os.path.join(lab_dir, f"lab{lab_id}_solution.cpp")
        if not os.path.exists(todo_path):
            raise FileNotFoundError(f"缺失实验 todo 文件: {todo_path}")
        if not os.path.exists(sol_path):
            raise FileNotFoundError(f"缺失实验 solution 文件: {sol_path}")

        todo_code = read_utf8(todo_path)
        sol_code = read_utf8(sol_path)
        hints = extract_lab_hints(todo_code)

        # 标题取文件夹去掉编号前缀的名称
        short_name = folder.split("_", 1)[1] if "_" in folder else folder
        labs_list.append({
            "id": lab_id,
            "folder": folder,
            "title": short_name,
            "chapterId": chapter_id,
            "desc": desc,
            "todoCode": todo_code,
            "solutionCode": sol_code,
            "hints": hints,
            "testCount": expected_tests,
        })
    return labs_list


def build_demos() -> List[Dict[str, Any]]:
    if not os.path.isdir(CODE_DIR):
        raise FileNotFoundError(f"找不到代码目录: {CODE_DIR}")
    cpp_files = sorted(f for f in os.listdir(CODE_DIR) if f.endswith(".cpp"))
    demos: List[Dict[str, Any]] = []
    for fname in cpp_files:
        fpath = os.path.join(CODE_DIR, fname)
        code = read_utf8(fpath)
        chapter_id, title = infer_demo_meta(fname, code)
        demos.append({
            "filename": fname,
            "chapterId": chapter_id,
            "title": title,
            "code": code,
        })
    return demos


def render_chapter_bundle_js(bundle_name: str, items: List[Dict[str, Any]]) -> str:
    parts = [
        f"// 自动生成于 build_content.py ({bundle_name})，请勿手动修改",
        "window.DS_CHAPTERS = window.DS_CHAPTERS || {};",
    ]
    for item in items:
        key_js = to_safe_js_json(item["id"])
        val_js = to_safe_js_json(item)
        parts.append(f"window.DS_CHAPTERS[{key_js}] = {val_js};")
    return "\n".join(parts) + "\n"


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        try:
            sys.stdout.reconfigure(encoding="utf-8")
        except Exception:
            pass

    print("============================================================")
    print("  正在打包《数据结构与算法》学习网站离线数据...")
    print("============================================================")

    manifest, bundles = build_chapters_and_manifest()
    labs = build_labs()
    demos = build_demos()

    manifest["stats"]["totalLabs"] = len(labs)
    manifest["stats"]["totalDemos"] = len(demos)
    manifest["stats"]["totalTestCases"] = sum(item["testCount"] for item in labs)

    outputs: List[Tuple[str, int]] = []

    manifest_js = (
        "// 自动生成于 build_content.py，请勿手动修改\n"
        f"window.DS_MANIFEST = {to_safe_js_json(manifest, indent=2)};\n"
    )
    outputs.append(("manifest.js", write_js_file("manifest.js", manifest_js)))

    for bname in ("chapters_0_3", "chapters_4_7", "extras"):
        js_text = render_chapter_bundle_js(bname, bundles[bname])
        outputs.append((f"{bname}.js", write_js_file(f"{bname}.js", js_text)))

    labs_js = (
        "// 自动生成于 build_content.py，请勿手动修改\n"
        f"window.DS_LABS = {to_safe_js_json(labs)};\n"
    )
    outputs.append(("labs_data.js", write_js_file("labs_data.js", labs_js)))

    demos_js = (
        "// 自动生成于 build_content.py，请勿手动修改\n"
        f"window.DS_DEMOS = {to_safe_js_json(demos)};\n"
    )
    outputs.append(("demos_data.js", write_js_file("demos_data.js", demos_js)))

    for fname, size in outputs:
        print(f"  [OK] data/{fname:<18s} ({size / 1024:7.1f} KB)")

    print("------------------------------------------------------------")
    print(
        f"  打包汇总：{manifest['stats']['totalChapters']} 主文档 + "
        f"{len(manifest['extraDocs'])} README = {manifest['stats']['totalDocs']} 份 Markdown "
        f"({manifest['stats']['totalLines']} 行) | "
        f"{len(labs)} 关实验 ({manifest['stats']['totalTestCases']} 断言) | "
        f"{len(demos)} 份演示代码"
    )
    print("============================================================")
    return 0


if __name__ == "__main__":
    sys.exit(main())

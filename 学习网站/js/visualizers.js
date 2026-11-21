/* ============================================================================
 * 《数据结构与算法》8 大交互式动画引擎 & 大 O 复杂度探索器
 * 文件：学习网站/js/visualizers.js
 * 导出：window.DSVisualizers = { TABS, mount, mountComplexityChart, _generators }
 * 特性：零外部依赖 · 纯离线运行 · 录制帧回放架构 · 亮色/暗黑双主题自适应
 * ============================================================================ */
(function (global) {
  "use strict";

  /* ==========================================================================
   * 1. 模块元数据 TABS (8 大核心动画)
   * ========================================================================== */
  const TABS = [
    {
      id: "linkedlist",
      icon: "🔗",
      title: "单链表指针实验室",
      chapterId: "02",
      desc: "正确插入 / 断链死循环反例 / 删除三步防泄漏 / 三指针原地反转"
    },
    {
      id: "queue",
      icon: "🔄",
      title: "循环队列环形槽",
      chapterId: "03",
      desc: "6 格环形圆盘手动入队出队、一键取模绕圈与判空判满公式仪表盘"
    },
    {
      id: "kmp",
      icon: "⚡",
      title: "KMP next 与匹配对比",
      chapterId: "03",
      desc: "真前后缀重叠高亮构建 next[] + BF 暴力回退 vs KMP 永不回退对比"
    },
    {
      id: "tree",
      icon: "🌳",
      title: "二叉树遍历与调用栈",
      chapterId: "04",
      desc: "前/中/后序递归调用栈压栈回弹模拟 + 层序遍历 FIFO 队列"
    },
    {
      id: "huffman",
      icon: "🌲",
      title: "哈夫曼树与 0/1 编码",
      chapterId: "04",
      desc: "森林贪心选两棵最小树合并、动态累加 WPL 与左 0 右 1 前缀编码表"
    },
    {
      id: "graph",
      icon: "🕸️",
      title: "图遍历与 Dijkstra 最短路",
      chapterId: "05",
      desc: "BFS 入队标蓝防重 / DFS 递归回溯 / Dijkstra dist[] 松弛与最短路树"
    },
    {
      id: "bst",
      icon: "🔍",
      title: "二叉排序树 BST 实验室",
      chapterId: "06",
      desc: "自定义查找/插入/删除 + 一键演示删双孩子根节点 50 + 中序升序校验"
    },
    {
      id: "sort",
      icon: "📊",
      title: "6 大核心排序竞技场",
      chapterId: "07",
      desc: "冒泡优化/插入/选择/快排/堆排(树+柱双视图)/归并(辅助数组)对比"
    }
  ];

  /* ==========================================================================
   * 2. 自包含双主题样式注入（支持外部 CSS 变量，提供安全默认值）
   * ========================================================================== */
  const STYLE_ID = "ds-visualizers-scoped-styles";

  function injectStyles() {
    if (typeof document === "undefined" || !document.head) return;
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
.dsv-root, .dsv-cx-root {
  --dsv-bg: var(--bg-page, var(--bg-main, #f3f6fb));
  --dsv-card: var(--bg-card, var(--surface, #ffffff));
  --dsv-soft: var(--bg-soft, var(--bg-secondary, #f8fafc));
  --dsv-border: var(--border, #e2e8f0);
  --dsv-border-strong: var(--border-strong, #cbd5e1);
  --dsv-text: var(--text-main, var(--text, #0f172a));
  --dsv-text-sub: var(--text-sub, var(--text-secondary, #475569));
  --dsv-text-muted: var(--text-muted, #64748b);
  --dsv-accent: var(--accent, #2563eb);
  --dsv-accent-hover: #1d4ed8;

  --dsv-blue: #2563eb;
  --dsv-blue-bg: #eff6ff;
  --dsv-blue-border: #93c5fd;

  --dsv-amber: #d97706;
  --dsv-amber-bg: #fffbeb;
  --dsv-amber-border: #fcd34d;

  --dsv-green: #059669;
  --dsv-green-bg: #ecfdf5;
  --dsv-green-border: #6ee7b7;

  --dsv-red: #dc2626;
  --dsv-red-bg: #fef2f2;
  --dsv-red-border: #fca5a5;

  --dsv-purple: #7c3aed;
  --dsv-purple-bg: #f5f3ff;
  --dsv-purple-border: #c4b5fd;

  --dsv-stage-bg: linear-gradient(180deg, #fafcff 0%, #f1f5f9 100%);
  --dsv-node-fill: #ffffff;
  --dsv-node-head-fill: #f1f5f9;
  --dsv-node-stroke: #475569;
  --dsv-node-text: #0f172a;
  --dsv-edge: #cbd5e1;
  --dsv-svg-label: #475569;
  --dsv-svg-muted: #94a3b8;
  --dsv-slot-empty: #f8fafc;
  --dsv-pill-slate-bg: #f1f5f9;
  --dsv-pill-slate-text: #475569;

  --dsv-code-bg: #0f172a;
  --dsv-code-text: #e2e8f0;
  --dsv-code-ln: #64748b;
  --dsv-code-active: rgba(37, 99, 235, 0.34);
  --dsv-code-active-border: #38bdf8;

  --dsv-font-sans: var(--font-sans, "PingFang SC", "Microsoft YaHei", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
  --dsv-font-mono: var(--font-mono, "JetBrains Mono", "Cascadia Code", "Fira Code", Consolas, monospace);
  --dsv-radius: 12px;
  --dsv-radius-sm: 8px;
  --dsv-shadow: 0 2px 10px rgba(15, 23, 42, 0.05), 0 1px 2px rgba(15, 23, 42, 0.04);

  font-family: var(--dsv-font-sans);
  color: var(--dsv-text);
  line-height: 1.5;
  box-sizing: border-box;
}
.dsv-root *, .dsv-cx-root * { box-sizing: border-box; }

[data-theme="dark"] .dsv-root,
[data-theme="dark"] .dsv-cx-root,
.dark .dsv-root,
.dark .dsv-cx-root {
  --dsv-bg: var(--bg-page, var(--bg-main, #0b1120));
  --dsv-card: var(--bg-card, #111827);
  --dsv-soft: var(--bg-soft, #1e293b);
  --dsv-border: var(--border, #2d3b4f);
  --dsv-border-strong: #475569;
  --dsv-text: var(--text-main, #f1f5f9);
  --dsv-text-sub: var(--text-sub, #cbd5e1);
  --dsv-text-muted: var(--text-muted, #94a3b8);
  --dsv-accent: var(--accent, #60a5fa);
  --dsv-accent-hover: #3b82f6;

  --dsv-blue: #60a5fa;
  --dsv-blue-bg: rgba(37, 99, 235, 0.18);
  --dsv-blue-border: rgba(96, 165, 250, 0.45);

  --dsv-amber: #fbbf24;
  --dsv-amber-bg: rgba(217, 119, 6, 0.18);
  --dsv-amber-border: rgba(251, 191, 36, 0.45);

  --dsv-green: #34d399;
  --dsv-green-bg: rgba(5, 150, 105, 0.18);
  --dsv-green-border: rgba(52, 211, 153, 0.45);

  --dsv-red: #f87171;
  --dsv-red-bg: rgba(220, 38, 38, 0.18);
  --dsv-red-border: rgba(248, 113, 113, 0.45);

  --dsv-purple: #a78bfa;
  --dsv-purple-bg: rgba(124, 58, 237, 0.2);
  --dsv-purple-border: rgba(167, 139, 250, 0.45);

  --dsv-stage-bg: linear-gradient(180deg, #0f172a 0%, #162033 100%);
  --dsv-node-fill: #1e293b;
  --dsv-node-head-fill: #334155;
  --dsv-node-stroke: #94a3b8;
  --dsv-node-text: #f1f5f9;
  --dsv-edge: #475569;
  --dsv-svg-label: #cbd5e1;
  --dsv-svg-muted: #64748b;
  --dsv-slot-empty: #1e293b;
  --dsv-pill-slate-bg: #1e293b;
  --dsv-pill-slate-text: #cbd5e1;
  --dsv-code-bg: #090e1a;
  --dsv-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
}

/* 顶部 8 模块切换导航 */
.dsv-nav-wrap {
  background: var(--dsv-card);
  border: 1px solid var(--dsv-border);
  border-radius: var(--dsv-radius);
  box-shadow: var(--dsv-shadow);
  padding: 10px 12px;
  margin-bottom: 14px;
}
.dsv-nav-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}
.dsv-nav-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--dsv-text);
  display: flex;
  align-items: center;
  gap: 8px;
}
.dsv-kbd-hints {
  font-size: 12px;
  color: var(--dsv-text-muted);
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
}
.dsv-kbd {
  display: inline-block;
  padding: 1px 6px;
  font-family: var(--dsv-font-mono);
  font-size: 11px;
  background: var(--dsv-soft);
  border: 1px solid var(--dsv-border-strong);
  border-radius: 5px;
  color: var(--dsv-text-sub);
}
.dsv-tab-bar {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: thin;
}
.dsv-tab-btn {
  appearance: none;
  border: 1px solid var(--dsv-border);
  background: var(--dsv-soft);
  color: var(--dsv-text-sub);
  font-family: var(--dsv-font-sans);
  font-size: 13px;
  font-weight: 600;
  padding: 7px 12px;
  border-radius: 9px;
  cursor: pointer;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s ease;
}
.dsv-tab-btn:hover {
  border-color: var(--dsv-blue);
  color: var(--dsv-blue);
  background: var(--dsv-blue-bg);
}
.dsv-tab-btn.active {
  background: #2563eb;
  border-color: #2563eb;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.28);
}
.dsv-tab-ch {
  font-size: 10.5px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 99px;
  background: rgba(148, 163, 184, 0.22);
  color: inherit;
}
.dsv-tab-btn.active .dsv-tab-ch {
  background: rgba(255, 255, 255, 0.22);
  color: #ffffff;
}
.dsv-tab-desc {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed var(--dsv-border);
  font-size: 12.5px;
  color: var(--dsv-text-sub);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

/* 控制工具栏 & 统一帧回放条 */
.dsv-toolbar {
  background: var(--dsv-card);
  border: 1px solid var(--dsv-border);
  border-radius: var(--dsv-radius);
  box-shadow: var(--dsv-shadow);
  padding: 12px 14px;
  margin-bottom: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.dsv-toolbar-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}
.dsv-pill-group {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.dsv-lbl {
  font-size: 12px;
  font-weight: 700;
  color: var(--dsv-text-muted);
}

.dsv-btn {
  appearance: none;
  border: 1px solid var(--dsv-border-strong);
  background: var(--dsv-card);
  color: var(--dsv-text);
  font-family: var(--dsv-font-sans);
  font-size: 12.8px;
  font-weight: 600;
  padding: 6px 11px;
  border-radius: var(--dsv-radius-sm);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  user-select: none;
  transition: all 0.14s ease;
}
.dsv-btn:hover:not(:disabled) {
  border-color: var(--dsv-blue);
  color: var(--dsv-blue);
  background: var(--dsv-blue-bg);
}
.dsv-btn:disabled { opacity: 0.42; cursor: not-allowed; }
.dsv-btn.active { background: #2563eb; border-color: #2563eb; color: #fff; }
.dsv-btn.active:hover { background: #1d4ed8; color: #fff; }
.dsv-btn-danger-pill.active { background: #dc2626; border-color: #dc2626; color: #fff; }
.dsv-btn-danger-pill:hover:not(.active) { border-color: var(--dsv-red); color: var(--dsv-red); background: var(--dsv-red-bg); }
.dsv-btn-primary { background: #2563eb; border-color: #2563eb; color: #fff; }
.dsv-btn-primary:hover:not(:disabled) { background: #1d4ed8; color: #fff; }
.dsv-btn-success { background: #059669; border-color: #059669; color: #fff; }
.dsv-btn-success:hover:not(:disabled) { background: #047857; color: #fff; }
.dsv-btn-amber { background: #d97706; border-color: #d97706; color: #fff; }
.dsv-btn-amber:hover:not(:disabled) { background: #b45309; color: #fff; }
.dsv-btn-danger { background: #dc2626; border-color: #dc2626; color: #fff; }
.dsv-btn-danger:hover:not(:disabled) { background: #b91c1c; color: #fff; }
.dsv-btn-sm { padding: 4px 9px; font-size: 12px; }

.dsv-input {
  padding: 5px 9px;
  border: 1px solid var(--dsv-border-strong);
  border-radius: var(--dsv-radius-sm);
  font-family: var(--dsv-font-mono);
  font-size: 12.8px;
  font-weight: 600;
  color: var(--dsv-text);
  background: var(--dsv-soft);
}
.dsv-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.16);
}
.dsv-input-num { width: 76px; }
.dsv-input-str { width: 156px; }
.dsv-input-weights { width: 185px; }
.dsv-select {
  padding: 5px 9px;
  border: 1px solid var(--dsv-border-strong);
  border-radius: var(--dsv-radius-sm);
  font-family: var(--dsv-font-sans);
  font-size: 12.8px;
  font-weight: 600;
  color: var(--dsv-text);
  background: var(--dsv-soft);
}

.dsv-player-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding-top: 9px;
  border-top: 1px dashed var(--dsv-border);
}
.dsv-player-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}
.dsv-speed-wrap {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--dsv-text-sub);
  background: var(--dsv-soft);
  border: 1px solid var(--dsv-border);
  border-radius: var(--dsv-radius-sm);
  padding: 4px 10px;
}
.dsv-speed-wrap input[type="range"] {
  width: 82px;
  accent-color: #2563eb;
  cursor: pointer;
}
.dsv-step-counter {
  font-family: var(--dsv-font-mono);
  font-size: 12px;
  font-weight: 700;
  color: var(--dsv-blue);
  background: var(--dsv-blue-bg);
  border: 1px solid var(--dsv-blue-border);
  padding: 4px 10px;
  border-radius: 99px;
  min-width: 102px;
  text-align: center;
}
.dsv-progress-track {
  flex: 1;
  min-width: 130px;
  height: 8px;
  background: var(--dsv-border);
  border-radius: 99px;
  overflow: hidden;
  cursor: pointer;
}
.dsv-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #2563eb);
  border-radius: 99px;
  transition: width 0.14s ease;
}

/* 2列工作区布局 */
.dsv-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.48fr) minmax(330px, 1fr);
  gap: 14px;
  align-items: start;
}
@media (max-width: 1060px) {
  .dsv-grid { grid-template-columns: 1fr; }
}
.dsv-col {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
}

.dsv-card {
  background: var(--dsv-card);
  border: 1px solid var(--dsv-border);
  border-radius: var(--dsv-radius);
  box-shadow: var(--dsv-shadow);
  overflow: hidden;
}
.dsv-card-head {
  padding: 9px 14px;
  border-bottom: 1px solid var(--dsv-border);
  background: var(--dsv-soft);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}
.dsv-card-title {
  font-size: 13.2px;
  font-weight: 700;
  color: var(--dsv-text);
  display: flex;
  align-items: center;
  gap: 6px;
}
.dsv-card-body { padding: 14px; }

.dsv-legend {
  display: flex;
  align-items: center;
  gap: 9px;
  flex-wrap: wrap;
  font-size: 11.8px;
  color: var(--dsv-text-sub);
}
.dsv-legend-item { display: inline-flex; align-items: center; gap: 4px; }
.dsv-dot { width: 10px; height: 10px; border-radius: 3px; display: inline-block; }

.dsv-svg-stage {
  width: 100%;
  background: var(--dsv-stage-bg);
  border: 1px solid var(--dsv-border);
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dsv-svg-stage svg { width: 100%; height: auto; display: block; }

/* 变量芯片与解说框 */
.dsv-vars { display: flex; flex-wrap: wrap; gap: 7px; }
.dsv-var {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 9px;
  border-radius: 7px;
  border: 1px solid var(--dsv-border);
  background: var(--dsv-soft);
  font-size: 12.2px;
}
.dsv-var-k { font-family: var(--dsv-font-mono); font-weight: 700; color: var(--dsv-text-sub); }
.dsv-var-v { font-family: var(--dsv-font-mono); font-weight: 700; color: var(--dsv-text); }
.dsv-var.tone-blue { background: var(--dsv-blue-bg); border-color: var(--dsv-blue-border); }
.dsv-var.tone-blue .dsv-var-v { color: var(--dsv-blue); }
.dsv-var.tone-amber { background: var(--dsv-amber-bg); border-color: var(--dsv-amber-border); }
.dsv-var.tone-amber .dsv-var-v { color: var(--dsv-amber); }
.dsv-var.tone-green { background: var(--dsv-green-bg); border-color: var(--dsv-green-border); }
.dsv-var.tone-green .dsv-var-v { color: var(--dsv-green); }
.dsv-var.tone-red { background: var(--dsv-red-bg); border-color: var(--dsv-red-border); }
.dsv-var.tone-red .dsv-var-v { color: var(--dsv-red); }
.dsv-var.tone-purple { background: var(--dsv-purple-bg); border-color: var(--dsv-purple-border); }
.dsv-var.tone-purple .dsv-var-v { color: var(--dsv-purple); }

.dsv-explain {
  border-radius: 10px;
  padding: 12px 14px;
  border-left: 4px solid var(--dsv-blue);
  background: var(--dsv-blue-bg);
  color: var(--dsv-text);
  transition: background 0.15s, border-color 0.15s;
}
.dsv-explain.tone-warn { border-left-color: var(--dsv-amber); background: var(--dsv-amber-bg); }
.dsv-explain.tone-good { border-left-color: var(--dsv-green); background: var(--dsv-green-bg); }
.dsv-explain.tone-danger { border-left-color: var(--dsv-red); background: var(--dsv-red-bg); }
.dsv-explain-main { font-size: 13.8px; font-weight: 600; line-height: 1.6; }
.dsv-explain-tip {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed var(--dsv-border-strong);
  font-size: 12.5px;
  color: var(--dsv-text-sub);
  line-height: 1.55;
}
.dsv-explain-tip code {
  font-family: var(--dsv-font-mono);
  background: rgba(148, 163, 184, 0.2);
  padding: 1px 5px;
  border-radius: 4px;
  font-size: 12px;
}

/* C++ 代码视图 */
.dsv-code {
  background: var(--dsv-code-bg);
  color: var(--dsv-code-text);
  font-family: var(--dsv-font-mono);
  font-size: 12.3px;
  line-height: 1.65;
  padding: 10px 0;
  overflow-x: auto;
  max-height: 400px;
  overflow-y: auto;
}
.dsv-code-line {
  display: flex;
  padding: 1px 14px 1px 0;
  border-left: 3px solid transparent;
  white-space: pre;
}
.dsv-code-line.active {
  background: var(--dsv-code-active);
  border-left-color: var(--dsv-code-active-border);
  color: #ffffff;
  font-weight: 600;
}
.dsv-code-line.active-danger {
  background: rgba(220, 38, 38, 0.34);
  border-left-color: #f87171;
  color: #ffffff;
  font-weight: 600;
}
.dsv-code-ln {
  width: 34px;
  flex-shrink: 0;
  text-align: right;
  padding-right: 11px;
  color: var(--dsv-code-ln);
  user-select: none;
}
.dsv-code-line.active .dsv-code-ln,
.dsv-code-line.active-danger .dsv-code-ln { color: #93c5fd; }
.dsv-ck-kw { color: #93c5fd; }
.dsv-ck-cm { color: #64748b; font-style: italic; }
.dsv-ck-ty { color: #5eead4; }
.dsv-ck-str { color: #fca5a5; }

/* 标签/徽章/表格/辅助面板 */
.dsv-tag {
  display: inline-block;
  padding: 1px 8px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 700;
}
.dsv-tag-blue { background: var(--dsv-blue-bg); color: var(--dsv-blue); border: 1px solid var(--dsv-blue-border); }
.dsv-tag-green { background: var(--dsv-green-bg); color: var(--dsv-green); border: 1px solid var(--dsv-green-border); }
.dsv-tag-amber { background: var(--dsv-amber-bg); color: var(--dsv-amber); border: 1px solid var(--dsv-amber-border); }
.dsv-tag-red { background: var(--dsv-red-bg); color: var(--dsv-red); border: 1px solid var(--dsv-red-border); }
.dsv-tag-purple { background: var(--dsv-purple-bg); color: var(--dsv-purple); border: 1px solid var(--dsv-purple-border); }
.dsv-tag-slate { background: var(--dsv-pill-slate-bg); color: var(--dsv-pill-slate-text); border: 1px solid var(--dsv-border); }

.dsv-empty { font-size: 12.5px; color: var(--dsv-text-muted); font-style: italic; }

.dsv-cq-dash { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.dsv-cq-stat {
  border: 1px solid var(--dsv-border);
  border-radius: 9px;
  padding: 8px 10px;
  background: var(--dsv-soft);
}
.dsv-cq-stat.full { grid-column: 1 / -1; }
.dsv-cq-lbl { font-size: 11.2px; color: var(--dsv-text-muted); font-family: var(--dsv-font-mono); }
.dsv-cq-val { font-size: 18px; font-weight: 800; font-family: var(--dsv-font-mono); margin-top: 2px; }
.dsv-cq-stat.st-danger { background: var(--dsv-red-bg); border-color: var(--dsv-red-border); color: var(--dsv-red); }
.dsv-cq-stat.st-amber { background: var(--dsv-amber-bg); border-color: var(--dsv-amber-border); color: var(--dsv-amber); }
.dsv-cq-stat.st-green { background: var(--dsv-green-bg); border-color: var(--dsv-green-border); color: var(--dsv-green); }

.dsv-stack {
  display: flex;
  flex-direction: column-reverse;
  gap: 6px;
  min-height: 116px;
  padding: 10px;
  border: 2px dashed var(--dsv-border-strong);
  border-top: none;
  border-radius: 0 0 10px 10px;
  background: var(--dsv-soft);
}
.dsv-stack-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  border-radius: 7px;
  border: 1px solid var(--dsv-border-strong);
  background: var(--dsv-card);
  font-family: var(--dsv-font-mono);
  font-size: 12.2px;
  font-weight: 600;
}
.dsv-stack-item.top {
  border-color: var(--dsv-blue);
  background: var(--dsv-blue-bg);
  color: var(--dsv-blue);
}
.dsv-stack-badge {
  font-family: var(--dsv-font-sans);
  font-size: 11px;
  padding: 1px 7px;
  border-radius: 99px;
  background: var(--dsv-pill-slate-bg);
  color: var(--dsv-pill-slate-text);
}
.dsv-stack-item.top .dsv-stack-badge { background: #2563eb; color: #fff; }

.dsv-queue {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  min-height: 44px;
  padding: 8px 10px;
  border: 1px solid var(--dsv-border);
  border-radius: 8px;
  background: var(--dsv-soft);
}
.dsv-q-item {
  min-width: 32px;
  height: 30px;
  padding: 0 8px;
  border-radius: 7px;
  background: var(--dsv-blue-bg);
  border: 1.5px solid var(--dsv-blue);
  color: var(--dsv-blue);
  font-family: var(--dsv-font-mono);
  font-weight: 800;
  font-size: 12.5px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.dsv-q-item.head { background: #2563eb; color: #fff; border-color: #2563eb; }

.dsv-seq { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; min-height: 34px; }
.dsv-seq-node {
  min-width: 30px;
  height: 28px;
  padding: 0 8px;
  border-radius: 7px;
  background: var(--dsv-green-bg);
  border: 1.5px solid var(--dsv-green-border);
  color: var(--dsv-green);
  font-family: var(--dsv-font-mono);
  font-weight: 800;
  font-size: 12.5px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.dsv-seq-node.latest { background: #059669; border-color: #059669; color: #fff; }

.dsv-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12.2px;
  font-family: var(--dsv-font-mono);
}
.dsv-table th, .dsv-table td {
  padding: 6px 8px;
  border-bottom: 1px solid var(--dsv-border);
  text-align: center;
}
.dsv-table th {
  background: var(--dsv-soft);
  color: var(--dsv-text-sub);
  font-family: var(--dsv-font-sans);
  font-weight: 700;
}
.dsv-table tr.row-cur { background: var(--dsv-blue-bg); font-weight: 700; }
.dsv-table tr.row-rel { background: var(--dsv-amber-bg); font-weight: 700; }
.dsv-table tr.row-done td:first-child { color: var(--dsv-green); font-weight: 800; }

/* 排序柱状图 */
.dsv-bars {
  height: 230px;
  padding: 26px 12px 26px 12px;
  background: var(--dsv-stage-bg);
  border: 1px solid var(--dsv-border);
  border-radius: 10px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 9px;
}
.dsv-bar-col {
  flex: 1;
  max-width: 56px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  position: relative;
}
.dsv-bar-ptr {
  position: absolute;
  top: -22px;
  font-family: var(--dsv-font-mono);
  font-size: 10.5px;
  font-weight: 800;
  padding: 1px 5px;
  border-radius: 4px;
  white-space: nowrap;
  color: #fff;
}
.dsv-bar-ptr.p-blue { background: #2563eb; }
.dsv-bar-ptr.p-purple { background: #7c3aed; }
.dsv-bar-ptr.p-amber { background: #d97706; }
.dsv-bar-ptr.p-red { background: #dc2626; }
.dsv-bar-rect {
  width: 100%;
  min-height: 22px;
  border-radius: 7px 7px 3px 3px;
  color: #fff;
  font-family: var(--dsv-font-mono);
  font-size: 12.5px;
  font-weight: 800;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 4px;
  transition: height 0.14s ease, transform 0.14s ease;
}
.dsv-bar-rect.st-default { background: linear-gradient(180deg, #60a5fa, #2563eb); }
.dsv-bar-rect.st-compare { background: linear-gradient(180deg, #fbbf24, #d97706); transform: translateY(-3px); }
.dsv-bar-rect.st-swap { background: linear-gradient(180deg, #f87171, #dc2626); transform: translateY(-5px); }
.dsv-bar-rect.st-pivot { background: linear-gradient(180deg, #a78bfa, #7c3aed); transform: translateY(-4px); }
.dsv-bar-rect.st-sorted { background: linear-gradient(180deg, #34d399, #059669); }
.dsv-bar-rect.st-dim { background: #94a3b8; opacity: 0.45; }
.dsv-bar-idx { margin-top: 5px; font-family: var(--dsv-font-mono); font-size: 11px; color: var(--dsv-text-muted); font-weight: 700; }

.dsv-merge-aux {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 11px;
  background: var(--dsv-purple-bg);
  border: 1px dashed var(--dsv-purple-border);
  border-radius: 8px;
  flex-wrap: wrap;
}
.dsv-merge-cell {
  min-width: 32px;
  height: 28px;
  border-radius: 6px;
  background: var(--dsv-card);
  border: 1.5px solid var(--dsv-purple);
  color: var(--dsv-purple);
  font-family: var(--dsv-font-mono);
  font-weight: 800;
  font-size: 12.5px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.dsv-metrics { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.dsv-metric {
  background: var(--dsv-soft);
  border: 1px solid var(--dsv-border);
  border-radius: 9px;
  padding: 8px 10px;
  text-align: center;
}
.dsv-metric-lbl { font-size: 11.2px; color: var(--dsv-text-muted); }
.dsv-metric-val { font-family: var(--dsv-font-mono); font-size: 18px; font-weight: 800; margin-top: 2px; }

/* KMP 对比计分板 */
.dsv-kmp-scores { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.dsv-kmp-score-card {
  border: 1px solid var(--dsv-border);
  border-radius: 9px;
  padding: 9px 11px;
  background: var(--dsv-soft);
}
.dsv-kmp-score-card.bf { border-color: var(--dsv-red-border); background: var(--dsv-red-bg); }
.dsv-kmp-score-card.kmp { border-color: var(--dsv-green-border); background: var(--dsv-green-bg); }

/* 复杂度探索器专属样式 */
.dsv-cx-card {
  background: var(--dsv-card);
  border: 1px solid var(--dsv-border);
  border-radius: var(--dsv-radius);
  box-shadow: var(--dsv-shadow);
  overflow: hidden;
}
.dsv-cx-head {
  padding: 12px 16px;
  border-bottom: 1px solid var(--dsv-border);
  background: var(--dsv-soft);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}
.dsv-cx-body { padding: 16px; }
.dsv-cx-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}
.dsv-cx-slider-box {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 240px;
  background: var(--dsv-soft);
  border: 1px solid var(--dsv-border);
  border-radius: 10px;
  padding: 8px 14px;
}
.dsv-cx-slider-box input[type="range"] {
  flex: 1;
  accent-color: #2563eb;
  cursor: pointer;
}
.dsv-cx-n-badge {
  font-family: var(--dsv-font-mono);
  font-size: 16px;
  font-weight: 800;
  color: var(--dsv-blue);
  min-width: 64px;
  text-align: right;
}
.dsv-cx-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 9px;
  margin-top: 14px;
}
.dsv-cx-stat {
  border: 1px solid var(--dsv-border);
  border-radius: 10px;
  padding: 10px 12px;
  background: var(--dsv-soft);
  border-top: 3px solid var(--cx-c, #2563eb);
}
.dsv-cx-stat-fn { font-family: var(--dsv-font-mono); font-size: 13px; font-weight: 800; color: var(--cx-c, #2563eb); }
.dsv-cx-stat-ops { font-family: var(--dsv-font-mono); font-size: 17px; font-weight: 800; color: var(--dsv-text); margin: 4px 0 2px 0; word-break: break-all; }
.dsv-cx-stat-meta { font-size: 11.5px; color: var(--dsv-text-sub); }
.dsv-cx-bar-track {
  height: 10px;
  background: var(--dsv-border);
  border-radius: 99px;
  overflow: hidden;
  min-width: 90px;
}
.dsv-cx-bar-fill { height: 100%; border-radius: 99px; }
`;
    document.head.appendChild(style);
  }

  /* ==========================================================================
   * 3. 通用渲染工具 & 帧播放器 (FramePlayer)
   * ========================================================================== */
  let instanceCounter = 0;

  function escHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function notifyVisited(tabId) {
    try {
      if (global.DSGamify && typeof global.DSGamify.markVizVisited === "function") {
        global.DSGamify.markVizVisited(tabId);
      }
    } catch (_) {
      /* ignore gamify errors */
    }
  }

  function highlightCpp(line) {
    const s = escHtml(line);
    const cmIdx = s.indexOf("//");
    let codePart = cmIdx >= 0 ? s.slice(0, cmIdx) : s;
    const cmPart = cmIdx >= 0 ? `<span class="dsv-ck-cm">${s.slice(cmIdx)}</span>` : "";

    codePart = codePart.replace(
      /\b(if|else|while|for|return|break|continue|new|delete|nullptr|true|false|and|or|auto)\b/g,
      '<span class="dsv-ck-kw">$1</span>'
    );
    codePart = codePart.replace(
      /\b(int|void|bool|char|string|Node|TreeNode|BSTNode|HuffNode|queue|priority_queue|vector|swap|const)\b/g,
      '<span class="dsv-ck-ty">$1</span>'
    );
    return codePart + cmPart;
  }

  function renderCode(container, lines, activeLines, dangerMode) {
    if (!container) return;
    const activeSet = new Set(activeLines || []);
    const cls = dangerMode ? "active-danger" : "active";
    let html = "";
    for (let i = 0; i < lines.length; i++) {
      const ln = i + 1;
      const isAct = activeSet.has(ln);
      html += `<div class="dsv-code-line${isAct ? " " + cls : ""}" data-ln="${ln}"><span class="dsv-code-ln">${ln}</span><span class="dsv-code-txt">${highlightCpp(lines[i])}</span></div>`;
    }
    container.innerHTML = html;
    if (activeLines && activeLines.length > 0) {
      const firstEl = container.querySelector(`.dsv-code-line[data-ln="${activeLines[0]}"]`);
      if (firstEl) {
        const top = firstEl.offsetTop;
        const ch = container.clientHeight;
        if (ch > 0 && (top < container.scrollTop + 20 || top > container.scrollTop + ch - 44)) {
          container.scrollTop = Math.max(0, top - ch / 3);
        }
      }
    }
  }

  function renderVars(container, vars) {
    if (!container) return;
    if (!vars || vars.length === 0) {
      container.innerHTML = '<span class="dsv-empty">当前步骤无局部变量</span>';
      return;
    }
    container.innerHTML = vars
      .map(
        (v) =>
          `<div class="dsv-var${v.tone ? " tone-" + v.tone : ""}"><span class="dsv-var-k">${escHtml(v.name)} =</span><span class="dsv-var-v">${escHtml(v.val)}</span></div>`
      )
      .join("");
  }

  function renderExplain(container, frame) {
    if (!container) return;
    const tone = frame.tone || "info";
    container.className = "dsv-explain" + (tone !== "info" ? " tone-" + tone : "");
    let html = `<div class="dsv-explain-main">${frame.explain}</div>`;
    if (frame.tip) {
      html += `<div class="dsv-explain-tip">${frame.tip}</div>`;
    }
    container.innerHTML = html;
  }

  class FramePlayer {
    constructor(mountEl, onRender, defaultSpeedMs = 900, onInteract = null) {
      this.mount = mountEl;
      this.onRender = onRender;
      this.onInteract = onInteract;
      this.frames = [];
      this.idx = 0;
      this.timer = null;
      this.speedMs = defaultSpeedMs;
      this.destroyed = false;
      this.buildUI();
    }

    buildUI() {
      this.mount.innerHTML = `
        <div class="dsv-player-controls">
          <button type="button" class="dsv-btn dsv-btn-sm" data-act="reset" title="回到第 1 步">⏮ 重置</button>
          <button type="button" class="dsv-btn dsv-btn-sm" data-act="prev" title="上一步 (←)">◀ 上一步</button>
          <button type="button" class="dsv-btn dsv-btn-sm dsv-btn-primary" data-act="play" title="播放/暂停 (Space)">▶ 播放</button>
          <button type="button" class="dsv-btn dsv-btn-sm" data-act="next" title="下一步 (→)">下一步 ▶</button>
        </div>
        <div class="dsv-speed-wrap">
          <span>速度</span>
          <input type="range" min="180" max="1800" step="60" value="${1980 - this.speedMs}" data-act="speed" />
          <span data-role="speedLbl">${this.getSpeedLabel()}</span>
        </div>
        <div class="dsv-step-counter" data-role="counter">Step 1 / 1</div>
        <div class="dsv-progress-track" data-role="track" title="点击跳转到任意步骤">
          <div class="dsv-progress-fill" data-role="fill" style="width:0%"></div>
        </div>
      `;
      this.btnReset = this.mount.querySelector('[data-act="reset"]');
      this.btnPrev = this.mount.querySelector('[data-act="prev"]');
      this.btnPlay = this.mount.querySelector('[data-act="play"]');
      this.btnNext = this.mount.querySelector('[data-act="next"]');
      this.slider = this.mount.querySelector('[data-act="speed"]');
      this.speedLbl = this.mount.querySelector('[data-role="speedLbl"]');
      this.counter = this.mount.querySelector('[data-role="counter"]');
      this.track = this.mount.querySelector('[data-role="track"]');
      this.fill = this.mount.querySelector('[data-role="fill"]');

      this.btnReset.addEventListener("click", () => {
        this.fireInteract();
        this.reset();
      });
      this.btnPrev.addEventListener("click", () => {
        this.fireInteract();
        this.prev();
      });
      this.btnNext.addEventListener("click", () => {
        this.fireInteract();
        this.next();
      });
      this.btnPlay.addEventListener("click", () => {
        this.fireInteract();
        this.togglePlay();
      });
      this.slider.addEventListener("input", () => {
        this.speedMs = 1980 - Number(this.slider.value);
        this.speedLbl.textContent = this.getSpeedLabel();
        if (this.timer) {
          this.pause();
          this.play();
        }
      });
      this.track.addEventListener("click", (e) => {
        if (this.frames.length <= 1) return;
        this.fireInteract();
        const rect = this.track.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        this.pause();
        this.goTo(Math.round(ratio * (this.frames.length - 1)));
      });
    }

    fireInteract() {
      if (typeof this.onInteract === "function") this.onInteract();
    }

    getSpeedLabel() {
      return `${(960 / this.speedMs).toFixed(1)}x`;
    }

    setFrames(frames, autoPlay = false, startIndex = 0) {
      this.pause();
      this.frames = frames || [];
      this.idx = Math.max(0, Math.min(startIndex, Math.max(0, this.frames.length - 1)));
      this.renderCurrent();
      if (autoPlay && this.frames.length > 1) {
        this.play();
      }
    }

    renderCurrent() {
      if (this.destroyed) return;
      const n = this.frames.length;
      if (n === 0) return;
      this.counter.textContent = `Step ${this.idx + 1} / ${n}`;
      const pct = n <= 1 ? 100 : (this.idx / (n - 1)) * 100;
      this.fill.style.width = `${pct}%`;
      this.btnPrev.disabled = this.idx <= 0;
      this.btnNext.disabled = this.idx >= n - 1;
      this.btnPlay.textContent = this.timer ? "⏸ 暂停" : "▶ 播放";
      this.onRender(this.frames[this.idx], this.idx, n);
    }

    goTo(i) {
      if (this.frames.length === 0) return;
      this.idx = Math.max(0, Math.min(i, this.frames.length - 1));
      this.renderCurrent();
    }

    reset() {
      this.pause();
      this.goTo(0);
    }

    prev() {
      this.pause();
      if (this.idx > 0) this.goTo(this.idx - 1);
    }

    next() {
      this.pause();
      if (this.idx < this.frames.length - 1) this.goTo(this.idx + 1);
    }

    play() {
      if (this.destroyed || this.timer || this.frames.length <= 1) return;
      if (this.idx >= this.frames.length - 1) this.idx = 0;
      this.timer = setInterval(() => {
        if (this.destroyed || !this.mount || !this.mount.isConnected) {
          this.pause();
          return;
        }
        if (this.idx < this.frames.length - 1) {
          this.idx++;
          this.renderCurrent();
        } else {
          this.pause();
        }
      }, this.speedMs);
      this.renderCurrent();
    }

    pause() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      if (this.btnPlay && !this.destroyed) {
        this.btnPlay.textContent = "▶ 播放";
      }
    }

    togglePlay() {
      if (this.timer) this.pause();
      else this.play();
    }

    destroy() {
      this.destroyed = true;
      this.pause();
    }
  }

  /* ==========================================================================
   * 4. 模块 1：单链表指针实验室 (linkedlist · 第 2 章)
   * ========================================================================== */
  const LinkedListMod = (function () {
    const CODES = {
      insert_ok: [
        "// 在第 i=3 个位置插入 x=25（带头结点）",
        "Node* p = head; int j = 0;",
        "while (p != nullptr && j < i - 1) {",
        "    p = p->next; j++;",
        "}",
        "Node* s = new Node(25);  // 1. 申请新节点",
        "s->next = p->next;       // 2. ✅ 先接后！抓住 30",
        "p->next = s;             // 3. ✅ 再断前！20 指向 25"
      ],
      insert_bad: [
        "// ❌ 反例演示：把关键两行写反的灾难！",
        "Node* p = head; int j = 0;",
        "while (p != nullptr && j < i - 1) { p = p->next; j++; }",
        "Node* s = new Node(25);",
        "p->next = s;             // ❌ 灾难第1步：先断前！30、40 彻底失联！",
        "s->next = p->next;       // 💥 灾难第2步：p->next 已是 s，导致 s->next = s 死循环！"
      ],
      delete: [
        "// 删除第 i=3 个节点（值 30），三步法防内存泄漏",
        "Node* p = head; int j = 0;",
        "while (p->next != nullptr && j < i - 1) {",
        "    p = p->next; j++;",
        "}",
        "Node* q = p->next;       // 1. 先用 q 记住要删的节点 30",
        "p->next = q->next;       // 2. 摘链：让 20 直接绕过 30 指向 40",
        "delete q;                // 3. 释放内存，杜绝内存泄漏！"
      ],
      reverse: [
        "// 三指针原地反转（保留头结点 head）",
        "Node* prev = nullptr;",
        "Node* cur = head->next;",
        "while (cur != nullptr) {",
        "    Node* nxt = cur->next; // 1. 保命：先记住下一站",
        "    cur->next = prev;      // 2. 核心：当前节点指针掉头！",
        "    prev = cur;            // 3. prev 右移一步",
        "    cur = nxt;             // 4. cur 右移一步",
        "}",
        "head->next = prev;         // 5. 头结点重新接上新链表头"
      ]
    };

    function baseNodes() {
      return [
        { id: "H", data: "HEAD", x: 28, y: 120, isHead: true },
        { id: "N1", data: "10", x: 158, y: 120 },
        { id: "N2", data: "20", x: 288, y: 120 },
        { id: "N3", data: "30", x: 418, y: 120 },
        { id: "N4", data: "40", x: 548, y: 120 }
      ];
    }

    function buildInsertOk() {
      const frames = [];
      frames.push({
        nodes: baseNodes(),
        links: [
          { from: "H", to: "N1" }, { from: "N1", to: "N2" },
          { from: "N2", to: "N3" }, { from: "N3", to: "N4" }, { from: "N4", to: "NULL" }
        ],
        ptrs: [{ node: "H", name: "p", color: "#2563eb", pos: "top" }],
        vars: [{ name: "i", val: "3" }, { name: "j", val: "0", tone: "blue" }, { name: "p", val: "head", tone: "blue" }],
        codeLines: [2],
        explain: "目标：在第 3 个位置（20 和 30 之间）插入新节点 25。指针 p 从头结点 head 出发，j = 0。",
        tip: "💡 <strong>为什么要找第 i-1 个节点？</strong>单链表只能向后走，要在第 3 位插入，必须停在它的前驱（第 2 位节点 20）上修改它的 next 指针。"
      });
      frames.push({
        nodes: baseNodes().map((n) => (n.id === "N1" ? { ...n, state: "active" } : n)),
        links: [
          { from: "H", to: "N1" }, { from: "N1", to: "N2" },
          { from: "N2", to: "N3" }, { from: "N3", to: "N4" }, { from: "N4", to: "NULL" }
        ],
        ptrs: [{ node: "N1", name: "p", color: "#2563eb", pos: "top" }],
        vars: [{ name: "i - 1", val: "2" }, { name: "j", val: "1", tone: "blue" }, { name: "p->data", val: "10", tone: "blue" }],
        codeLines: [3, 4],
        explain: "j = 0 < 2，执行 p = p->next，p 移动到第 1 个数据节点 10，j 变为 1。"
      });
      frames.push({
        nodes: baseNodes().map((n) => (n.id === "N2" ? { ...n, state: "active" } : n)),
        links: [
          { from: "H", to: "N1" }, { from: "N1", to: "N2" },
          { from: "N2", to: "N3" }, { from: "N3", to: "N4" }, { from: "N4", to: "NULL" }
        ],
        ptrs: [{ node: "N2", name: "p", color: "#2563eb", pos: "top" }],
        vars: [{ name: "i - 1", val: "2" }, { name: "j", val: "2 (停!)", tone: "green" }, { name: "p->data", val: "20", tone: "blue" }],
        codeLines: [3, 4],
        explain: "p 继续后移到达节点 20，此时 j = 2 == i - 1，循环结束！成功找到前驱节点 p(20)。"
      });
      const withS = [
        ...baseNodes().map((n) => (n.id === "N2" ? { ...n, state: "active" } : n)),
        { id: "S", data: "25", x: 353, y: 222, state: "new" }
      ];
      frames.push({
        nodes: withS,
        links: [
          { from: "H", to: "N1" }, { from: "N1", to: "N2" },
          { from: "N2", to: "N3" }, { from: "N3", to: "N4" }, { from: "N4", to: "NULL" }
        ],
        ptrs: [
          { node: "N2", name: "p", color: "#2563eb", pos: "top" },
          { node: "S", name: "s", color: "#059669", pos: "bottom" }
        ],
        vars: [{ name: "p->data", val: "20", tone: "blue" }, { name: "s->data", val: "25", tone: "green" }, { name: "s->next", val: "nullptr" }],
        codeLines: [6],
        explain: "在堆内存中 new 出新节点 s(25)，此时它还是个孤立节点，准备接入链表。"
      });
      frames.push({
        nodes: withS.map((n) => (n.id === "N3" ? { ...n, state: "warn" } : n)),
        links: [
          { from: "H", to: "N1" }, { from: "N1", to: "N2" },
          { from: "N2", to: "N3" }, { from: "N3", to: "N4" }, { from: "N4", to: "NULL" },
          { from: "S", to: "N3", color: "#059669", style: "curveUp" }
        ],
        ptrs: [
          { node: "N2", name: "p", color: "#2563eb", pos: "top" },
          { node: "S", name: "s", color: "#059669", pos: "bottom" }
        ],
        vars: [{ name: "p->next", val: "节点30" }, { name: "s->next", val: "节点30 ✅", tone: "green" }],
        codeLines: [7],
        tone: "good",
        explain: "✅ 关键第 1 步（先接后）：执行 s->next = p->next！让新节点 25 先稳稳抓住 30 的地址。",
        tip: "💡 <strong>为什么这步必须先做？</strong>现在节点 20 和节点 25 同时指着 30，后半条链绝对安全，接下来放心修改 p->next 也不会丢节点！"
      });
      frames.push({
        nodes: withS,
        links: [
          { from: "H", to: "N1" }, { from: "N1", to: "N2" },
          { from: "N2", to: "S", color: "#2563eb", style: "curveDown" },
          { from: "S", to: "N3", color: "#059669", style: "curveUp" },
          { from: "N3", to: "N4" }, { from: "N4", to: "NULL" }
        ],
        ptrs: [
          { node: "N2", name: "p", color: "#2563eb", pos: "top" },
          { node: "S", name: "s", color: "#059669", pos: "bottom" }
        ],
        vars: [{ name: "p->next", val: "节点25 ✅", tone: "blue" }, { name: "s->next", val: "节点30 ✅", tone: "green" }],
        codeLines: [8],
        tone: "good",
        explain: "✅ 关键第 2 步（再断前）：执行 p->next = s！节点 20 断开与 30 的旧连线，改指向新节点 25。"
      });
      frames.push({
        nodes: [
          { id: "H", data: "HEAD", x: 18, y: 120, isHead: true },
          { id: "N1", data: "10", x: 132, y: 120 },
          { id: "N2", data: "20", x: 246, y: 120 },
          { id: "S", data: "25", x: 360, y: 120, state: "new" },
          { id: "N3", data: "30", x: 474, y: 120 },
          { id: "N4", data: "40", x: 588, y: 120 }
        ],
        links: [
          { from: "H", to: "N1" }, { from: "N1", to: "N2" }, { from: "N2", to: "S", color: "#059669" },
          { from: "S", to: "N3", color: "#059669" }, { from: "N3", to: "N4" }, { from: "N4", to: "NULL" }
        ],
        ptrs: [],
        vars: [{ name: "结果链表", val: "10 → 20 → 25 → 30 → 40 → NULL", tone: "green" }],
        codeLines: [7, 8],
        tone: "good",
        explain: "🎉 拉直整理后，链表完美变为 10 → 20 → 25 → 30 → 40！查找前驱 O(n)，修改指针 O(1)。",
        tip: "📌 <strong>口诀牢记：</strong>插入节点「先接后，再断前」，先写 <code>s->next = p->next</code>，再写 <code>p->next = s</code>！"
      });
      return frames;
    }

    function buildInsertBad() {
      const frames = [];
      frames.push({
        nodes: baseNodes().map((n) => (n.id === "N2" ? { ...n, state: "active" } : n)),
        links: [
          { from: "H", to: "N1" }, { from: "N1", to: "N2" },
          { from: "N2", to: "N3" }, { from: "N3", to: "N4" }, { from: "N4", to: "NULL" }
        ],
        ptrs: [{ node: "N2", name: "p", color: "#2563eb", pos: "top" }],
        vars: [{ name: "p->data", val: "20", tone: "blue" }, { name: "p->next", val: "节点30" }],
        codeLines: [2, 3],
        explain: "已找到前驱节点 p(20)，准备在 20 和 30 之间插入 25。下面演示把两行赋值写反的灾难现场！"
      });
      const withS = [
        ...baseNodes().map((n) => (n.id === "N2" ? { ...n, state: "active" } : n)),
        { id: "S", data: "25", x: 353, y: 222, state: "warn" }
      ];
      frames.push({
        nodes: withS,
        links: [
          { from: "H", to: "N1" }, { from: "N1", to: "N2" },
          { from: "N2", to: "N3" }, { from: "N3", to: "N4" }, { from: "N4", to: "NULL" }
        ],
        ptrs: [
          { node: "N2", name: "p", color: "#2563eb", pos: "top" },
          { node: "S", name: "s", color: "#d97706", pos: "bottom" }
        ],
        vars: [{ name: "p->next", val: "节点30" }, { name: "s->data", val: "25", tone: "amber" }],
        codeLines: [4],
        explain: "创建好新节点 s(25)。注意此刻只有 p->next 唯一知道节点 30 的内存地址！"
      });
      frames.push({
        nodes: [
          { id: "H", data: "HEAD", x: 28, y: 120, isHead: true },
          { id: "N1", data: "10", x: 158, y: 120 },
          { id: "N2", data: "20", x: 288, y: 120, state: "danger" },
          { id: "S", data: "25", x: 345, y: 222, state: "danger" },
          { id: "N3", data: "30", x: 438, y: 58, state: "lost", badge: "失联! 内存泄漏" },
          { id: "N4", data: "40", x: 568, y: 58, state: "lost", badge: "失联!" }
        ],
        links: [
          { from: "H", to: "N1" }, { from: "N1", to: "N2" },
          { from: "N2", to: "S", color: "#dc2626", style: "curveDown" },
          { from: "N2", to: "N3", color: "#dc2626", style: "broken" },
          { from: "N3", to: "N4", color: "#f87171", dashed: true },
          { from: "N4", to: "NULL", color: "#f87171", dashed: true }
        ],
        ptrs: [
          { node: "N2", name: "p", color: "#2563eb", pos: "top" },
          { node: "S", name: "s", color: "#dc2626", pos: "bottom" }
        ],
        vars: [
          { name: "p->next", val: "已被改写为 s(25)!", tone: "red" },
          { name: "节点30、40", val: "彻底失联 (内存泄漏)", tone: "red" }
        ],
        codeLines: [5],
        dangerCode: true,
        tone: "danger",
        explain: "❌ 灾难第 1 步：先执行了 p->next = s！节点 20 直接把原本指向 30 的链接覆盖掉了！",
        tip: "💥 <strong>为什么失联了？</strong>内存中没有任何指针再保存 30 的地址，30 → 40 整条子链永远找不回来了（断链 + 内存泄漏）！"
      });
      frames.push({
        nodes: [
          { id: "H", data: "HEAD", x: 28, y: 120, isHead: true },
          { id: "N1", data: "10", x: 158, y: 120 },
          { id: "N2", data: "20", x: 288, y: 120, state: "danger" },
          { id: "S", data: "25", x: 345, y: 214, state: "danger", badge: "自环死循环!" },
          { id: "N3", data: "30", x: 446, y: 56, state: "lost", badge: "永远失联!" },
          { id: "N4", data: "40", x: 574, y: 56, state: "lost" }
        ],
        links: [
          { from: "H", to: "N1" }, { from: "N1", to: "N2" },
          { from: "N2", to: "S", color: "#dc2626", style: "curveDown" },
          { from: "S", to: "S", color: "#dc2626", style: "selfLoop" },
          { from: "N3", to: "N4", color: "#f87171", dashed: true },
          { from: "N4", to: "NULL", color: "#f87171", dashed: true }
        ],
        ptrs: [
          { node: "N2", name: "p", color: "#2563eb", pos: "top" },
          { node: "S", name: "s", color: "#dc2626", pos: "bottom" }
        ],
        vars: [
          { name: "p->next", val: "s (25)", tone: "red" },
          { name: "s->next = p->next", val: "等价于 s->next = s 💥", tone: "red" }
        ],
        codeLines: [6],
        dangerCode: true,
        tone: "danger",
        explain: "💥 灾难第 2 步：执行 s->next = p->next。因为 p->next 早就变成 s 了，这行代码竟让 25 指向了自己！",
        tip: "🚨 <strong>惨痛教训：</strong>遍历链表会打印 10, 20, 25, 25, 25... 无限死循环，且 30、40 永久泄漏！插入必须先写 <code>s->next = p->next</code>！"
      });
      return frames;
    }

    function buildDelete() {
      const frames = [];
      frames.push({
        nodes: baseNodes(),
        links: [
          { from: "H", to: "N1" }, { from: "N1", to: "N2" },
          { from: "N2", to: "N3" }, { from: "N3", to: "N4" }, { from: "N4", to: "NULL" }
        ],
        ptrs: [{ node: "H", name: "p", color: "#2563eb", pos: "top" }],
        vars: [{ name: "删除位置 i", val: "3 (节点30)" }, { name: "j", val: "0" }, { name: "p", val: "head", tone: "blue" }],
        codeLines: [2],
        explain: "目标：删除第 3 个节点（值为 30）。先让 p 走到它的前驱（第 2 个节点 20）。"
      });
      frames.push({
        nodes: baseNodes().map((n) => (n.id === "N2" ? { ...n, state: "active" } : n)),
        links: [
          { from: "H", to: "N1" }, { from: "N1", to: "N2" },
          { from: "N2", to: "N3" }, { from: "N3", to: "N4" }, { from: "N4", to: "NULL" }
        ],
        ptrs: [{ node: "N2", name: "p", color: "#2563eb", pos: "top" }],
        vars: [{ name: "j", val: "2 (到达前驱)", tone: "green" }, { name: "p->data", val: "20", tone: "blue" }],
        codeLines: [3, 4],
        explain: "循环走两步后，p 停在节点 20 上（j = 2 == i - 1）。它的下一个节点 p->next 就是待删节点 30。"
      });
      frames.push({
        nodes: baseNodes().map((n) => (n.id === "N2" ? { ...n, state: "active" } : n.id === "N3" ? { ...n, state: "warn" } : n)),
        links: [
          { from: "H", to: "N1" }, { from: "N1", to: "N2" },
          { from: "N2", to: "N3" }, { from: "N3", to: "N4" }, { from: "N4", to: "NULL" }
        ],
        ptrs: [
          { node: "N2", name: "p", color: "#2563eb", pos: "top" },
          { node: "N3", name: "q", color: "#d97706", pos: "top" }
        ],
        vars: [{ name: "p->data", val: "20", tone: "blue" }, { name: "q", val: "节点30 (已锁定)", tone: "amber" }],
        codeLines: [6],
        tone: "warn",
        explain: "三步法第 1 步：Node* q = p->next; 先派临时指针 q 把节点 30 牢牢抓住！",
        tip: "💡 <strong>为什么不能直接写 p->next = p->next->next？</strong>跳过后没人记得 30 的地址，无法 delete 导致内存泄漏！"
      });
      frames.push({
        nodes: [
          { id: "H", data: "HEAD", x: 28, y: 120, isHead: true },
          { id: "N1", data: "10", x: 158, y: 120 },
          { id: "N2", data: "20", x: 288, y: 120, state: "active" },
          { id: "N3", data: "30", x: 418, y: 215, state: "warn", badge: "已摘链，待释放" },
          { id: "N4", data: "40", x: 548, y: 120 }
        ],
        links: [
          { from: "H", to: "N1" }, { from: "N1", to: "N2" },
          { from: "N2", to: "N4", color: "#059669", style: "bypass" },
          { from: "N3", to: "N4", color: "#94a3b8", dashed: true },
          { from: "N4", to: "NULL" }
        ],
        ptrs: [
          { node: "N2", name: "p", color: "#2563eb", pos: "top" },
          { node: "N3", name: "q", color: "#d97706", pos: "bottom" }
        ],
        vars: [{ name: "p->next", val: "节点40 ✅", tone: "green" }, { name: "q", val: "节点30 (待 delete)", tone: "amber" }],
        codeLines: [7],
        tone: "good",
        explain: "三步法第 2 步（摘链）：p->next = q->next; 让 20 直接绕过 30 指向 40，链表依然连续完整！"
      });
      frames.push({
        nodes: [
          { id: "H", data: "HEAD", x: 28, y: 120, isHead: true },
          { id: "N1", data: "10", x: 158, y: 120 },
          { id: "N2", data: "20", x: 288, y: 120 },
          { id: "N3", data: "30", x: 418, y: 215, state: "lost", badge: "delete q 已释放!" },
          { id: "N4", data: "40", x: 548, y: 120 }
        ],
        links: [
          { from: "H", to: "N1" }, { from: "N1", to: "N2" },
          { from: "N2", to: "N4", color: "#059669", style: "bypass" },
          { from: "N4", to: "NULL" }
        ],
        ptrs: [{ node: "N2", name: "p", color: "#2563eb", pos: "top" }],
        vars: [{ name: "delete q", val: "释放节点30内存 ✅", tone: "red" }],
        codeLines: [8],
        tone: "danger",
        explain: "三步法第 3 步：执行 delete q; 将节点 30 占用的堆内存归还操作系统，干干净净零泄漏！"
      });
      frames.push({
        nodes: [
          { id: "H", data: "HEAD", x: 58, y: 120, isHead: true },
          { id: "N1", data: "10", x: 198, y: 120 },
          { id: "N2", data: "20", x: 338, y: 120 },
          { id: "N4", data: "40", x: 478, y: 120 }
        ],
        links: [
          { from: "H", to: "N1" }, { from: "N1", to: "N2" },
          { from: "N2", to: "N4", color: "#059669" }, { from: "N4", to: "NULL" }
        ],
        ptrs: [],
        vars: [{ name: "结果链表", val: "10 → 20 → 40 → NULL", tone: "green" }],
        codeLines: [6, 7, 8],
        tone: "good",
        explain: "🎉 删除完成！牢记删除三步法：① q = p->next 记住它 → ② p->next = q->next 摘下来 → ③ delete q 释放它。"
      });
      return frames;
    }

    function buildReverse() {
      const frames = [];
      const vals = ["10", "20", "30", "40"];
      const ids = ["N1", "N2", "N3", "N4"];
      const basePos = [
        { id: "H", data: "HEAD", x: 24, y: 128, isHead: true },
        { id: "N1", data: "10", x: 158, y: 128 },
        { id: "N2", data: "20", x: 288, y: 128 },
        { id: "N3", data: "30", x: 418, y: 128 },
        { id: "N4", data: "40", x: 548, y: 128 }
      ];

      function makeLinks(reversedCount, headTarget) {
        const ls = [];
        if (headTarget === "N1") {
          ls.push({ from: "H", to: "N1", dashed: reversedCount > 0, color: reversedCount > 0 ? "#94a3b8" : "#64748b" });
        } else if (headTarget === "N4") {
          ls.push({ from: "H", to: "N4", color: "#059669", style: "headToTail" });
        }
        for (let idx = 0; idx < 4; idx++) {
          const id = ids[idx];
          if (idx < reversedCount) {
            if (idx === 0) ls.push({ from: "N1", to: "NULL_LEFT", color: "#7c3aed", style: "revNull" });
            else ls.push({ from: id, to: ids[idx - 1], color: "#7c3aed", style: "reverse" });
          } else {
            if (idx < 3) ls.push({ from: id, to: ids[idx + 1] });
            else ls.push({ from: "N4", to: "NULL" });
          }
        }
        return ls;
      }

      const labelOf = (i) => (i < 0 || i >= 4 ? "nullptr" : `节点${vals[i]}`);

      frames.push({
        nodes: basePos.map((n) => (n.id === "N1" ? { ...n, state: "active" } : n)),
        links: makeLinks(0, "N1"),
        ptrs: [{ node: "N1", name: "cur", color: "#2563eb", pos: "top" }],
        vars: [
          { name: "prev", val: "nullptr", tone: "purple" },
          { name: "cur", val: "节点10", tone: "blue" },
          { name: "nxt", val: "未定义" }
        ],
        codeLines: [2, 3],
        explain: "初始化：prev = nullptr（反转后的新尾巴要指向空），cur = head->next（从第 1 个数据节点 10 开始）。",
        tip: "💡 <strong>为什么要三个指针？</strong>cur 要把 next 往回指，一旦掉头就丢了后面的链，所以必须用第 3 个指针 <code>nxt</code> 提前存下 cur->next！"
      });

      for (let k = 0; k < 4; k++) {
        const curId = ids[k];
        const prevId = k > 0 ? ids[k - 1] : null;
        const nxtId = k < 3 ? ids[k + 1] : null;
        const ptrsA = [];
        if (prevId) ptrsA.push({ node: prevId, name: "prev", color: "#7c3aed", pos: "top" });
        ptrsA.push({ node: curId, name: "cur", color: "#2563eb", pos: "top" });
        if (nxtId) ptrsA.push({ node: nxtId, name: "nxt", color: "#d97706", pos: "bottom" });

        frames.push({
          nodes: basePos.map((n) => (n.id === curId ? { ...n, state: "active" } : n.id === nxtId ? { ...n, state: "warn" } : n)),
          links: makeLinks(k, "N1"),
          ptrs: ptrsA,
          vars: [
            { name: "prev", val: labelOf(k - 1), tone: "purple" },
            { name: "cur", val: labelOf(k), tone: "blue" },
            { name: "nxt", val: labelOf(k + 1) + " (已备份)", tone: "amber" }
          ],
          codeLines: [4, 5],
          explain: `第 ${k + 1} 轮 ① 保命备份：nxt = cur->next，先用 nxt 记住下一站（${labelOf(k + 1)}），防止 cur 掉头后失联！`
        });

        frames.push({
          nodes: basePos.map((n) => (n.id === curId ? { ...n, state: "new" } : n)),
          links: makeLinks(k + 1, "N1"),
          ptrs: ptrsA,
          vars: [
            { name: "cur->next", val: labelOf(k - 1) + " (已掉头!)", tone: "purple" },
            { name: "nxt", val: labelOf(k + 1), tone: "amber" }
          ],
          codeLines: [6],
          tone: "good",
          explain: `第 ${k + 1} 轮 ② 指针掉头：cur->next = prev！节点 ${vals[k]} 的箭头正式翻转，指向 ${labelOf(k - 1)}。`
        });

        const ptrsC = [{ node: curId, name: "prev", color: "#7c3aed", pos: "top" }];
        if (nxtId) ptrsC.push({ node: nxtId, name: "cur", color: "#2563eb", pos: "top" });
        frames.push({
          nodes: basePos.map((n) => (n.id === nxtId ? { ...n, state: "active" } : n)),
          links: makeLinks(k + 1, "N1"),
          ptrs: ptrsC,
          vars: [
            { name: "prev", val: labelOf(k), tone: "purple" },
            { name: "cur", val: labelOf(k + 1), tone: k === 3 ? "green" : "blue" }
          ],
          codeLines: [7, 8],
          explain:
            k < 3
              ? `第 ${k + 1} 轮 ③ 齐步右移：prev 移到 ${vals[k]}，cur 借助 nxt 移到 ${vals[k + 1]}。`
              : "第 4 轮 ③ 齐步右移：prev 停在 40，cur 变为 nullptr，while 循环结束！"
        });
      }

      frames.push({
        nodes: basePos.map((n) => (n.id === "N4" ? { ...n, state: "new" } : n)),
        links: makeLinks(4, "N4"),
        ptrs: [{ node: "N4", name: "prev(新头)", color: "#059669", pos: "bottom" }],
        vars: [
          { name: "head->next", val: "节点40 ✅", tone: "green" },
          { name: "反转结果", val: "HEAD → 40 → 30 → 20 → 10 → NULL", tone: "green" }
        ],
        codeLines: [10],
        tone: "good",
        explain: "🎉 最后一步：head->next = prev！头结点重新接上新链表头 40，原地反转大功告成！空间复杂度 O(1)！",
        tip: "📌 <strong>四行黄金循环：</strong><code>nxt = cur->next; cur->next = prev; prev = cur; cur = nxt;</code> 顺序一步都不能错！"
      });
      return frames;
    }

    function renderSvg(frame, uid) {
      const W = 710, H = 290;
      const boxW = 92, boxH = 44, dataW = 54;
      const map = {};
      frame.nodes.forEach((n) => { map[n.id] = n; });

      const defs = `
        <defs>
          <marker id="${uid}-gray" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse"><path d="M0,1 L9,5 L0,9 z" fill="#64748b"/></marker>
          <marker id="${uid}-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse"><path d="M0,1 L9,5 L0,9 z" fill="#2563eb"/></marker>
          <marker id="${uid}-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse"><path d="M0,1 L9,5 L0,9 z" fill="#059669"/></marker>
          <marker id="${uid}-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse"><path d="M0,1 L9,5 L0,9 z" fill="#dc2626"/></marker>
          <marker id="${uid}-purple" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse"><path d="M0,1 L9,5 L0,9 z" fill="#7c3aed"/></marker>
          <marker id="${uid}-amber" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse"><path d="M0,1 L9,5 L0,9 z" fill="#d97706"/></marker>
          <marker id="${uid}-light" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse"><path d="M0,1 L9,5 L0,9 z" fill="#94a3b8"/></marker>
        </defs>`;

      function markerFor(color) {
        if (color === "#2563eb") return `url(#${uid}-blue)`;
        if (color === "#059669") return `url(#${uid}-green)`;
        if (color === "#dc2626" || color === "#f87171") return `url(#${uid}-red)`;
        if (color === "#7c3aed") return `url(#${uid}-purple)`;
        if (color === "#d97706") return `url(#${uid}-amber)`;
        if (color === "#94a3b8" || color === "#cbd5e1") return `url(#${uid}-light)`;
        return `url(#${uid}-gray)`;
      }

      let linksSvg = "";
      (frame.links || []).forEach((lk) => {
        const a = map[lk.from];
        if (!a) return;
        const col = lk.color || "#64748b";
        const mk = markerFor(col);
        const dash = lk.dashed ? 'stroke-dasharray="5,4"' : "";
        const ax = a.x + dataW + (boxW - dataW) / 2;
        const ay = a.y + boxH / 2;

        if (lk.to === "NULL") {
          const ex = a.x + boxW + 26;
          linksSvg += `<line x1="${ax}" y1="${ay}" x2="${ex}" y2="${ay}" stroke="${col}" stroke-width="2.2" ${dash} marker-end="${mk}"/>`;
          linksSvg += `<text x="${ex + 6}" y="${ay + 4}" font-family="monospace" font-size="12" font-weight="700" fill="${col}">NULL</text>`;
          return;
        }
        if (lk.style === "revNull") {
          const ex = a.x - 24;
          linksSvg += `<path d="M ${ax} ${a.y + boxH} C ${ax} ${a.y + boxH + 26}, ${a.x - 10} ${a.y + boxH + 26}, ${ex} ${ay + 6}" fill="none" stroke="${col}" stroke-width="2.3" marker-end="${mk}"/>`;
          linksSvg += `<text x="${ex - 34}" y="${ay + 10}" font-family="monospace" font-size="11.5" font-weight="800" fill="${col}">NULL</text>`;
          return;
        }
        const b = map[lk.to];
        if (!b) return;

        if (lk.style === "selfLoop") {
          linksSvg += `<path d="M ${ax} ${a.y + boxH} C ${ax + 48} ${a.y + boxH + 46}, ${a.x - 42} ${a.y + boxH + 46}, ${a.x - 2} ${ay}" fill="none" stroke="${col}" stroke-width="2.8" marker-end="${mk}"/>`;
          linksSvg += `<text x="${a.x + 12}" y="${a.y + boxH + 34}" font-size="11.5" font-weight="800" fill="#dc2626">s->next = s (自环!)</text>`;
          return;
        }
        if (lk.style === "broken") {
          const mx = (ax + b.x) / 2, my = (ay + b.y + boxH / 2) / 2;
          linksSvg += `<line x1="${ax}" y1="${ay}" x2="${b.x - 4}" y2="${b.y + boxH / 2}" stroke="#fca5a5" stroke-width="2" stroke-dasharray="5,5"/>`;
          linksSvg += `<text x="${mx - 8}" y="${my + 4}" font-size="18" font-weight="900" fill="#dc2626">✖</text>`;
          return;
        }
        if (lk.style === "curveUp") {
          linksSvg += `<path d="M ${ax} ${ay} Q ${b.x - 18} ${ay}, ${b.x} ${b.y + boxH - 8}" fill="none" stroke="${col}" stroke-width="2.6" marker-end="${mk}"/>`;
          return;
        }
        if (lk.style === "curveDown") {
          linksSvg += `<path d="M ${ax} ${ay} Q ${ax + 6} ${b.y + 18}, ${b.x} ${b.y + 20}" fill="none" stroke="${col}" stroke-width="2.6" marker-end="${mk}"/>`;
          return;
        }
        if (lk.style === "bypass") {
          const mx = (ax + b.x) / 2;
          linksSvg += `<path d="M ${ax} ${a.y} Q ${mx} ${a.y - 54}, ${b.x + 12} ${b.y - 2}" fill="none" stroke="${col}" stroke-width="2.6" marker-end="${mk}"/>`;
          return;
        }
        if (lk.style === "reverse") {
          const tx = b.x + boxW;
          linksSvg += `<path d="M ${ax} ${a.y + boxH} C ${ax} ${a.y + boxH + 24}, ${tx + 10} ${b.y + boxH + 24}, ${tx + 2} ${b.y + boxH - 10}" fill="none" stroke="${col}" stroke-width="2.5" marker-end="${mk}"/>`;
          return;
        }
        if (lk.style === "headToTail") {
          linksSvg += `<path d="M ${ax} ${a.y} C ${ax + 40} 26, ${b.x + 10} 26, ${b.x + 28} ${b.y - 2}" fill="none" stroke="${col}" stroke-width="2.7" marker-end="${mk}"/>`;
          return;
        }
        linksSvg += `<line x1="${ax}" y1="${ay}" x2="${b.x - 2}" y2="${b.y + boxH / 2}" stroke="${col}" stroke-width="2.3" ${dash} marker-end="${mk}"/>`;
      });

      let nodesSvg = "";
      frame.nodes.forEach((n) => {
        let fill = "var(--dsv-node-fill)", stroke = "var(--dsv-node-stroke)", txt = "var(--dsv-node-text)", dash = "";
        if (n.isHead) { fill = "var(--dsv-node-head-fill)"; stroke = "#64748b"; txt = "var(--dsv-text-sub)"; }
        if (n.state === "active") { fill = "#eff6ff"; stroke = "#2563eb"; txt = "#1d4ed8"; }
        if (n.state === "new") { fill = "#ecfdf5"; stroke = "#059669"; txt = "#047857"; }
        if (n.state === "warn") { fill = "#fffbeb"; stroke = "#d97706"; txt = "#b45309"; }
        if (n.state === "danger") { fill = "#fef2f2"; stroke = "#dc2626"; txt = "#b91c1c"; }
        if (n.state === "lost") { fill = "#fef2f2"; stroke = "#ef4444"; txt = "#dc2626"; dash = 'stroke-dasharray="5,3"'; }

        nodesSvg += `
          <g>
            <rect x="${n.x}" y="${n.y}" width="${boxW}" height="${boxH}" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="2.2" ${dash}/>
            <line x1="${n.x + dataW}" y1="${n.y}" x2="${n.x + dataW}" y2="${n.y + boxH}" stroke="${stroke}" stroke-width="1.6" ${dash}/>
            <text x="${n.x + dataW / 2}" y="${n.y + 27}" text-anchor="middle" font-family="monospace" font-size="${n.isHead ? 12 : 15}" font-weight="800" fill="${txt}">${escHtml(n.data)}</text>
            <circle cx="${n.x + dataW + (boxW - dataW) / 2}" cy="${n.y + boxH / 2}" r="3.5" fill="${stroke}"/>
            <text x="${n.x + dataW / 2}" y="${n.y + boxH + 13}" text-anchor="middle" font-size="10" fill="var(--dsv-svg-muted)">${n.isHead ? "头结点" : "data"}</text>
            <text x="${n.x + dataW + (boxW - dataW) / 2}" y="${n.y + boxH + 13}" text-anchor="middle" font-size="10" fill="var(--dsv-svg-muted)">next</text>
          </g>`;

        if (n.badge) {
          nodesSvg += `
            <rect x="${n.x - 4}" y="${n.y - 24}" width="${boxW + 8}" height="19" rx="9" fill="#fee2e2" stroke="#f87171"/>
            <text x="${n.x + boxW / 2}" y="${n.y - 11}" text-anchor="middle" font-size="10.5" font-weight="800" fill="#b91c1c">${escHtml(n.badge)}</text>`;
        }
      });

      let ptrsSvg = "";
      (frame.ptrs || []).forEach((p) => {
        const n = map[p.node];
        if (!n) return;
        const cx = n.x + boxW / 2;
        if (p.pos === "top") {
          const y0 = n.y - 44;
          ptrsSvg += `
            <rect x="${cx - 26}" y="${y0}" width="52" height="22" rx="6" fill="${p.color}"/>
            <text x="${cx}" y="${y0 + 15}" text-anchor="middle" font-family="monospace" font-size="12" font-weight="800" fill="#fff">${escHtml(p.name)}</text>
            <line x1="${cx}" y1="${y0 + 22}" x2="${cx}" y2="${n.y - 3}" stroke="${p.color}" stroke-width="2.2" marker-end="${markerFor(p.color)}"/>`;
        } else {
          const y0 = n.y + boxH + 34;
          const bw = p.name.length > 4 ? 76 : 52;
          ptrsSvg += `
            <rect x="${cx - bw / 2}" y="${y0}" width="${bw}" height="22" rx="6" fill="${p.color}"/>
            <text x="${cx}" y="${y0 + 15}" text-anchor="middle" font-family="monospace" font-size="11.5" font-weight="800" fill="#fff">${escHtml(p.name)}</text>
            <line x1="${cx}" y1="${y0}" x2="${cx}" y2="${n.y + boxH + 16}" stroke="${p.color}" stroke-width="2.2" marker-end="${markerFor(p.color)}"/>`;
        }
      });

      return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${defs}${linksSvg}${nodesSvg}${ptrsSvg}</svg>`;
    }

    function mount(paneEl, uid, onInteract) {
      paneEl.innerHTML = `
        <div class="dsv-toolbar">
          <div class="dsv-toolbar-row">
            <div class="dsv-pill-group" data-role="modes">
              <span class="dsv-lbl">演示模式：</span>
              <button type="button" class="dsv-btn active" data-mode="insert_ok">✅ 正确插入（先接后、再断前）</button>
              <button type="button" class="dsv-btn dsv-btn-danger-pill" data-mode="insert_bad">❌ 反例插入（断链+死循环！）</button>
              <button type="button" class="dsv-btn" data-mode="delete">✂️ 删除三步法</button>
              <button type="button" class="dsv-btn" data-mode="reverse">🔁 三指针原地反转</button>
            </div>
          </div>
          <div class="dsv-player-bar" data-role="player"></div>
        </div>
        <div class="dsv-grid">
          <div class="dsv-col">
            <div class="dsv-card">
              <div class="dsv-card-head">
                <span class="dsv-card-title">内存指针现场（带头结点 head）</span>
                <div class="dsv-legend">
                  <span class="dsv-legend-item"><span class="dsv-dot" style="background:#2563eb"></span>当前指针</span>
                  <span class="dsv-legend-item"><span class="dsv-dot" style="background:#059669"></span>新建/完成</span>
                  <span class="dsv-legend-item"><span class="dsv-dot" style="background:#d97706"></span>待操作</span>
                  <span class="dsv-legend-item"><span class="dsv-dot" style="background:#dc2626"></span>断链/释放</span>
                </div>
              </div>
              <div class="dsv-card-body"><div class="dsv-svg-stage" data-role="svg"></div></div>
            </div>
            <div class="dsv-card">
              <div class="dsv-card-head"><span class="dsv-card-title">📌 实时指针与变量状态</span></div>
              <div class="dsv-card-body"><div class="dsv-vars" data-role="vars"></div></div>
            </div>
            <div class="dsv-explain" data-role="explain"></div>
          </div>
          <div class="dsv-col">
            <div class="dsv-card">
              <div class="dsv-card-head">
                <span class="dsv-card-title">💻 同步 C++ 核心代码</span>
                <span class="dsv-tag dsv-tag-blue" data-role="codeTag">Insert_Correct.cpp</span>
              </div>
              <div class="dsv-code" data-role="code"></div>
            </div>
          </div>
        </div>
      `;

      let currentMode = "insert_ok";
      const svgEl = paneEl.querySelector('[data-role="svg"]');
      const varsEl = paneEl.querySelector('[data-role="vars"]');
      const expEl = paneEl.querySelector('[data-role="explain"]');
      const codeEl = paneEl.querySelector('[data-role="code"]');
      const codeTagEl = paneEl.querySelector('[data-role="codeTag"]');
      const modeBtns = paneEl.querySelectorAll('[data-role="modes"] .dsv-btn');

      const player = new FramePlayer(
        paneEl.querySelector('[data-role="player"]'),
        (frame) => {
          svgEl.innerHTML = renderSvg(frame, uid + "-ll");
          renderVars(varsEl, frame.vars);
          renderExplain(expEl, frame);
          renderCode(codeEl, CODES[currentMode], frame.codeLines, !!frame.dangerCode);
        },
        1020,
        onInteract
      );

      function loadMode(mode) {
        currentMode = mode;
        const tags = {
          insert_ok: "Insert_Correct.cpp",
          insert_bad: "Insert_BugDemo.cpp",
          delete: "Delete_3Steps.cpp",
          reverse: "Reverse_3Ptrs.cpp"
        };
        codeTagEl.textContent = tags[mode] || "LinkList.cpp";
        modeBtns.forEach((b) => b.classList.toggle("active", b.dataset.mode === mode));
        const frames =
          mode === "insert_ok" ? buildInsertOk() :
          mode === "insert_bad" ? buildInsertBad() :
          mode === "delete" ? buildDelete() :
          buildReverse();
        player.setFrames(frames, false, 0);
      }

      modeBtns.forEach((b) => b.addEventListener("click", () => { onInteract(); loadMode(b.dataset.mode); }));
      loadMode("insert_ok");
      return { player, destroy: () => player.destroy() };
    }

    return { mount, buildInsertOk, buildInsertBad, buildDelete, buildReverse };
  })();

  /* ==========================================================================
   * 5. 模块 2：循环队列环形槽 (queue · 第 3 章)
   * ========================================================================== */
  const QueueMod = (function () {
    const N = 6;
    const CODE = [
      "const int N = 6; // 故意留 1 格空位，最多存 5 个元素",
      "int data[N], front = 0, rear = 0;",
      "bool isEmpty() { return front == rear; }",
      "bool isFull()  { return (rear + 1) % N == front; }",
      "int size()     { return (rear - front + N) % N; }",
      "bool enqueue(int x) {",
      "    if ((rear + 1) % N == front) return false; // 队满拒绝",
      "    data[rear] = x;            // 写入队尾槽位",
      "    rear = (rear + 1) % N;     // 指针取模绕圈前进",
      "    return true;",
      "}",
      "bool dequeue(int& out) {",
      "    if (front == rear) return false; // 队空拒绝",
      "    out = data[front];         // 取出队头元素",
      "    front = (front + 1) % N;   // 队头取模绕圈前进",
      "    return true;",
      "}"
    ];

    const cloneState = (s) => ({ arr: s.arr.slice(), front: s.front, rear: s.rear });

    function makeFrame(state, opts) {
      const { front, rear } = state;
      const isFull = (rear + 1) % N === front;
      const len = (rear - front + N) % N;
      return {
        state: cloneState(state),
        highlightSlot: opts.highlightSlot ?? -1,
        highlightType: opts.highlightType || "",
        codeLines: opts.codeLines || [],
        dangerCode: !!opts.dangerCode,
        tone: opts.tone || "info",
        explain: opts.explain,
        tip: opts.tip || "",
        vars: [
          { name: "front", val: String(front), tone: "blue" },
          { name: "rear", val: String(rear), tone: "purple" },
          { name: "(rear+1)%6", val: `${(rear + 1) % N}`, tone: isFull ? "red" : "" },
          { name: "len", val: `${len} / 5`, tone: isFull ? "amber" : "green" },
          ...(opts.extraVars || [])
        ]
      };
    }

    function recordEnqueue(state, x, frames) {
      const s = cloneState(state);
      const nextRear = (s.rear + 1) % N;
      if (nextRear === s.front) {
        frames.push(makeFrame(s, {
          highlightSlot: s.rear, highlightType: "full", codeLines: [4, 7], dangerCode: true, tone: "danger",
          extraVars: [{ name: "待入队 x", val: String(x), tone: "red" }],
          explain: `❌ 尝试入队 ${x} 失败！(rear + 1) % 6 = (${s.rear} + 1) % 6 = ${nextRear} == front(${s.front})，队列已满！`,
          tip: `💡 <strong>为什么下标 [${s.rear}] 看起来空着却不让放？</strong>若塞进 ${x}，rear 变为 ${nextRear} 导致 <code>front == rear</code>，程序会分不清“队满”还是“队空”！`
        }));
        return s;
      }
      frames.push(makeFrame(s, {
        highlightSlot: s.rear, highlightType: "check", codeLines: [6, 7],
        extraVars: [{ name: "待入队 x", val: String(x), tone: "blue" }],
        explain: `准备入队 ${x}：检查 (rear + 1) % 6 = ${nextRear} ≠ front(${s.front})，队未满，允许写入。`
      }));
      s.arr[s.rear] = x;
      frames.push(makeFrame(s, {
        highlightSlot: s.rear, highlightType: "enq", codeLines: [8], tone: "good",
        extraVars: [{ name: `data[${s.rear}]`, val: String(x), tone: "green" }],
        explain: `执行 data[${s.rear}] = ${x}：将元素 ${x} 写入 rear 指向的槽位 [${s.rear}]。`
      }));
      const oldRear = s.rear;
      s.rear = nextRear;
      const wrapped = oldRear === N - 1 && s.rear === 0;
      frames.push(makeFrame(s, {
        highlightSlot: s.rear, highlightType: wrapped ? "wrap" : "move", codeLines: [9],
        tone: wrapped ? "good" : "info",
        extraVars: [{ name: "rear 更新", val: `${oldRear} → ${s.rear}` + (wrapped ? " (绕回0!)" : ""), tone: wrapped ? "green" : "purple" }],
        explain: wrapped
          ? "🎉 绕圈成功！rear = (5 + 1) % 6 = 0！队尾顺滑绕回数组开头下标 0，复用已出队的空槽！"
          : `执行 rear = (${oldRear} + 1) % 6 = ${s.rear}，队尾指针顺时针前进一格。`,
        tip: wrapped ? "💡 <strong>循环队列精髓：</strong>取模 <code>% N</code> 把直线数组首尾相连，彻底消灭「假溢出」！" : ""
      }));
      return s;
    }

    function recordDequeue(state, frames) {
      const s = cloneState(state);
      if (s.front === s.rear) {
        frames.push(makeFrame(s, {
          highlightSlot: s.front, highlightType: "full", codeLines: [3, 13], dangerCode: true, tone: "danger",
          explain: `❌ 出队失败！front(${s.front}) == rear(${s.rear})，当前队列为空。`
        }));
        return s;
      }
      const val = s.arr[s.front];
      frames.push(makeFrame(s, {
        highlightSlot: s.front, highlightType: "deq", codeLines: [13, 14], tone: "warn",
        extraVars: [{ name: "出队 out", val: String(val), tone: "amber" }],
        explain: `front(${s.front}) ≠ rear(${s.rear}) 队非空，取出队头元素 out = data[${s.front}] = ${val}。`
      }));
      const oldFront = s.front;
      s.arr[oldFront] = null;
      s.front = (s.front + 1) % N;
      const wrapped = oldFront === N - 1 && s.front === 0;
      frames.push(makeFrame(s, {
        highlightSlot: s.front, highlightType: wrapped ? "wrap" : "move", codeLines: [15],
        extraVars: [{ name: "front 更新", val: `${oldFront} → ${s.front}`, tone: "blue" }],
        explain: `执行 front = (${oldFront} + 1) % 6 = ${s.front}。槽位 [${oldFront}] 逻辑释放，后续可被绕圈复用！`
      }));
      return s;
    }

    function buildWrapDemo() {
      let s = { arr: [null, null, null, null, null, null], front: 0, rear: 0 };
      const frames = [makeFrame(s, {
        codeLines: [1, 2],
        explain: "🎬 绕圈演示开始！将依次：入队 4 个(10,20,30,40) → 出队 3 个 → 再入队 4 个(50,60,70,80) + 尝试第 9 个触发队满！"
      })];
      for (const v of [10, 20, 30, 40]) s = recordEnqueue(s, v, frames);
      for (let i = 0; i < 3; i++) s = recordDequeue(s, frames);
      for (const v of [50, 60, 70, 80]) s = recordEnqueue(s, v, frames);
      s = recordEnqueue(s, 90, frames);
      return frames;
    }

    function renderRingSvg(frame) {
      const { arr, front, rear } = frame.state;
      const isFull = (rear + 1) % N === front;
      const cx = 250, cy = 165, R_OUT = 114, R_IN = 56;
      const W = 500, H = 330;

      let sectors = "", labels = "";
      const occupied = new Set();
      let idx = front;
      while (idx !== rear) { occupied.add(idx); idx = (idx + 1) % N; }

      for (let i = 0; i < N; i++) {
        const a0 = (-90 + i * 60) * Math.PI / 180;
        const a1 = (-90 + (i + 1) * 60) * Math.PI / 180;
        const am = (a0 + a1) / 2;
        const x1 = cx + R_OUT * Math.cos(a0), y1 = cy + R_OUT * Math.sin(a0);
        const x2 = cx + R_OUT * Math.cos(a1), y2 = cy + R_OUT * Math.sin(a1);
        const x3 = cx + R_IN * Math.cos(a1), y3 = cy + R_IN * Math.sin(a1);
        const x4 = cx + R_IN * Math.cos(a0), y4 = cy + R_IN * Math.sin(a0);
        const d = `M ${x1} ${y1} A ${R_OUT} ${R_OUT} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${R_IN} ${R_IN} 0 0 0 ${x4} ${y4} Z`;

        let fill = "var(--dsv-slot-empty)", stroke = "#94a3b8", sw = 2;
        if (occupied.has(i)) { fill = "#dbeafe"; stroke = "#3b82f6"; }
        if (isFull && i === rear) { fill = "#fef3c7"; stroke = "#d97706"; }
        if (frame.highlightSlot === i) {
          sw = 3.2;
          if (frame.highlightType === "enq" || frame.highlightType === "wrap") { fill = "#bbf7d0"; stroke = "#059669"; }
          else if (frame.highlightType === "deq") { fill = "#fde68a"; stroke = "#d97706"; }
          else if (frame.highlightType === "full") { fill = "#fecaca"; stroke = "#dc2626"; }
          else if (frame.highlightType === "check") { fill = "#e0e7ff"; stroke = "#2563eb"; }
        }
        sectors += `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;

        const vr = (R_OUT + R_IN) / 2;
        const vx = cx + vr * Math.cos(am), vy = cy + vr * Math.sin(am);
        if (occupied.has(i) && arr[i] !== null) {
          labels += `<text x="${vx}" y="${vy + 6}" text-anchor="middle" font-family="monospace" font-size="18" font-weight="800" fill="#1e3a8a">${escHtml(arr[i])}</text>`;
        } else if (isFull && i === rear) {
          labels += `<text x="${vx}" y="${vy + 2}" text-anchor="middle" font-size="11" font-weight="800" fill="#b45309">预留空位</text>`;
          labels += `<text x="${vx}" y="${vy + 15}" text-anchor="middle" font-size="9.5" fill="#92400e">不可写入</text>`;
        } else {
          labels += `<text x="${vx}" y="${vy + 5}" text-anchor="middle" font-size="12" fill="var(--dsv-svg-muted)">空</text>`;
        }

        const ir = R_OUT + 17;
        labels += `<text x="${cx + ir * Math.cos(am)}" y="${cy + ir * Math.sin(am) + 4}" text-anchor="middle" font-family="monospace" font-size="12.5" font-weight="800" fill="var(--dsv-svg-label)">[${i}]</text>`;
      }

      function drawPtr(slotIdx, text, color, offsetDeg) {
        const am = (-90 + slotIdx * 60 + 30 + offsetDeg) * Math.PI / 180;
        const px = cx + (R_OUT + 45) * Math.cos(am), py = cy + (R_OUT + 45) * Math.sin(am);
        const tx = cx + (R_OUT + 2) * Math.cos(am), ty = cy + (R_OUT + 2) * Math.sin(am);
        return `
          <line x1="${px}" y1="${py}" x2="${tx}" y2="${ty}" stroke="${color}" stroke-width="2.2"/>
          <circle cx="${tx}" cy="${ty}" r="4" fill="${color}"/>
          <rect x="${px - 24}" y="${py - 11}" width="48" height="22" rx="6" fill="${color}"/>
          <text x="${px}" y="${py + 4}" text-anchor="middle" font-family="monospace" font-size="11.5" font-weight="800" fill="#fff">${text}</text>`;
      }

      let ptrs = "";
      if (front === rear) {
        ptrs += drawPtr(front, "front", "#2563eb", -12);
        ptrs += drawPtr(rear, "rear", "#7c3aed", 12);
      } else {
        ptrs += drawPtr(front, "front", "#2563eb", 0);
        ptrs += drawPtr(rear, "rear", "#7c3aed", 0);
      }

      const len = (rear - front + N) % N;
      const centerText = `
        <circle cx="${cx}" cy="${cy}" r="${R_IN - 2}" fill="var(--dsv-node-fill)" stroke="var(--dsv-border)" stroke-width="2"/>
        <text x="${cx}" y="${cy - 8}" text-anchor="middle" font-size="11.5" font-weight="700" fill="var(--dsv-svg-muted)">当前元素数</text>
        <text x="${cx}" y="${cy + 16}" text-anchor="middle" font-family="monospace" font-size="22" font-weight="800" fill="${isFull ? '#dc2626' : '#2563eb'}">${len} / 5</text>
        <text x="${cx}" y="${cy + 34}" text-anchor="middle" font-size="10.5" font-weight="700" fill="${len === 0 ? '#d97706' : isFull ? '#dc2626' : '#059669'}">${len === 0 ? '队空 EMPTY' : isFull ? '队满 FULL!' : '可入可出'}</text>
      `;
      return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${sectors}${labels}${ptrs}${centerText}</svg>`;
    }

    function mount(paneEl, uid, onInteract) {
      paneEl.innerHTML = `
        <div class="dsv-toolbar">
          <div class="dsv-toolbar-row">
            <div class="dsv-pill-group">
              <span class="dsv-lbl">交互操作：</span>
              <input type="number" class="dsv-input dsv-input-num" data-role="input" value="10" min="-99" max="999" />
              <button type="button" class="dsv-btn dsv-btn-primary" data-act="enq">➕ 入队 Enqueue</button>
              <button type="button" class="dsv-btn dsv-btn-amber" data-act="deq">➖ 出队 Dequeue</button>
              <button type="button" class="dsv-btn dsv-btn-success" data-act="wrap">🔁 一键绕圈演示（入4→出3→再入4）</button>
              <button type="button" class="dsv-btn" data-act="clear">🧹 清空</button>
            </div>
          </div>
          <div class="dsv-player-bar" data-role="player"></div>
        </div>
        <div class="dsv-grid">
          <div class="dsv-col">
            <div class="dsv-card">
              <div class="dsv-card-head">
                <span class="dsv-card-title">6 格环形数组（N = 6，空出 1 格哨兵位，最多存 5 元素）</span>
                <div class="dsv-legend">
                  <span class="dsv-legend-item"><span class="dsv-dot" style="background:#2563eb"></span>front 队头</span>
                  <span class="dsv-legend-item"><span class="dsv-dot" style="background:#7c3aed"></span>rear 队尾</span>
                  <span class="dsv-legend-item"><span class="dsv-dot" style="background:#059669"></span>刚入队</span>
                  <span class="dsv-legend-item"><span class="dsv-dot" style="background:#f59e0b"></span>预留哨兵格</span>
                </div>
              </div>
              <div class="dsv-card-body"><div class="dsv-svg-stage" data-role="svg"></div></div>
            </div>
            <div class="dsv-card">
              <div class="dsv-card-head"><span class="dsv-card-title">📌 实时下标与取模公式</span></div>
              <div class="dsv-card-body"><div class="dsv-vars" data-role="vars"></div></div>
            </div>
            <div class="dsv-explain" data-role="explain"></div>
          </div>
          <div class="dsv-col">
            <div class="dsv-card">
              <div class="dsv-card-head"><span class="dsv-card-title">🧮 判空 / 判满 / 长度公式实时仪表盘</span></div>
              <div class="dsv-card-body"><div class="dsv-cq-dash" data-role="dash"></div></div>
            </div>
            <div class="dsv-card">
              <div class="dsv-card-head">
                <span class="dsv-card-title">💻 同步 C++ 循环队列代码</span>
                <span class="dsv-tag dsv-tag-blue">CircularQueue.cpp</span>
              </div>
              <div class="dsv-code" data-role="code"></div>
            </div>
          </div>
        </div>
      `;

      let autoVal = 10;
      let currentState = { arr: [null, null, null, null, null, null], front: 0, rear: 0 };
      const svgEl = paneEl.querySelector('[data-role="svg"]');
      const varsEl = paneEl.querySelector('[data-role="vars"]');
      const expEl = paneEl.querySelector('[data-role="explain"]');
      const dashEl = paneEl.querySelector('[data-role="dash"]');
      const codeEl = paneEl.querySelector('[data-role="code"]');
      const inputEl = paneEl.querySelector('[data-role="input"]');

      const player = new FramePlayer(
        paneEl.querySelector('[data-role="player"]'),
        (frame) => {
          currentState = cloneState(frame.state);
          svgEl.innerHTML = renderRingSvg(frame);
          renderVars(varsEl, frame.vars);
          renderExplain(expEl, frame);
          const { front, rear } = frame.state;
          const isEmpty = front === rear;
          const isFull = (rear + 1) % N === front;
          const len = (rear - front + N) % N;
          dashEl.innerHTML = `
            <div class="dsv-cq-stat"><div class="dsv-cq-lbl">front (队头下标)</div><div class="dsv-cq-val" style="color:var(--dsv-blue)">${front}</div></div>
            <div class="dsv-cq-stat"><div class="dsv-cq-lbl">rear (下一入队位)</div><div class="dsv-cq-val" style="color:var(--dsv-purple)">${rear}</div></div>
            <div class="dsv-cq-stat ${isEmpty ? "st-amber" : ""}"><div class="dsv-cq-lbl">队空: front == rear</div><div class="dsv-cq-val">${isEmpty ? "true (空)" : "false"}</div></div>
            <div class="dsv-cq-stat ${isFull ? "st-danger" : ""}"><div class="dsv-cq-lbl">队满: (rear+1)%6 == front</div><div class="dsv-cq-val">${isFull ? "true (满!)" : "false"}</div></div>
            <div class="dsv-cq-stat full st-green"><div class="dsv-cq-lbl">队列长度公式: (rear - front + 6) % 6</div><div class="dsv-cq-val">(${rear} - ${front} + 6) % 6 = ${len}</div></div>
          `;
          renderCode(codeEl, CODE, frame.codeLines, !!frame.dangerCode);
        },
        780,
        onInteract
      );

      function initEmpty() {
        const s = { arr: [null, null, null, null, null, null], front: 0, rear: 0 };
        autoVal = 10;
        inputEl.value = autoVal;
        player.setFrames([makeFrame(s, {
          codeLines: [1, 2],
          explain: "循环队列已初始化：front = 0, rear = 0。点击「入队」「出队」或「一键绕圈演示」亲自观察取模绕回！",
          tip: "💡 <strong>核心设计：</strong>6 格数组最多存 5 个元素——故意留 1 格哨兵位，用于区分 <code>front == rear</code>（空）与 <code>(rear+1)%6 == front</code>（满）。"
        })], false, 0);
      }

      paneEl.querySelector('[data-act="enq"]').addEventListener("click", () => {
        onInteract();
        const val = parseInt(inputEl.value, 10);
        const x = isNaN(val) ? autoVal : Math.max(-99, Math.min(999, val));
        const frames = [makeFrame(currentState, { codeLines: [6], explain: `当前状态，准备执行 enqueue(${x})。` })];
        recordEnqueue(currentState, x, frames);
        autoVal = x + 10 > 99 ? 10 : x + 10;
        inputEl.value = autoVal;
        player.setFrames(frames, true, 0);
      });
      paneEl.querySelector('[data-act="deq"]').addEventListener("click", () => {
        onInteract();
        const frames = [makeFrame(currentState, { codeLines: [12], explain: "当前状态，准备执行 dequeue()。" })];
        recordDequeue(currentState, frames);
        player.setFrames(frames, true, 0);
      });
      paneEl.querySelector('[data-act="wrap"]').addEventListener("click", () => {
        onInteract();
        player.setFrames(buildWrapDemo(), true, 0);
      });
      paneEl.querySelector('[data-act="clear"]').addEventListener("click", () => {
        onInteract();
        initEmpty();
      });

      initEmpty();
      return { player, destroy: () => player.destroy() };
    }

    return { mount, recordEnqueue, recordDequeue, buildWrapDemo };
  })();

  /* ==========================================================================
   * 6. 模块 3（全新重磅！）：KMP next 数组与模式匹配对比 (kmp · 第 3 章)
   * ========================================================================== */
  const KmpMod = (function () {
    const PRESETS = {
      ababaca: { label: '预设1: "ababaca"', text: "abababacababaca", pattern: "ababaca" },
      ababcabcacbab: { label: '预设2: "ababcabcacbab"', text: "ababcababcabcacbab", pattern: "ababcabcacbab" },
      abcac: { label: '预设3: 教材 "abcac"', text: "ababcabcacbab", pattern: "abcac" },
      worst: { label: '预设4: BF噩梦 "aaab"', text: "aaaaaaaaab", pattern: "aaab" }
    };

    const CODES = {
      next: [
        "// 0-based 前缀函数：next[i] = P[0..i] 最长相等真前后缀长度",
        "vector<int> buildNext(const string& P) {",
        "    int m = P.size();",
        "    vector<int> next(m, 0);",
        "    int j = 0; // j 既是当前已匹配真前缀长度，也是下一个待比位置",
        "    for (int i = 1; i < m; i++) {",
        "        while (j > 0 && P[i] != P[j]) {",
        "            j = next[j - 1]; // ★ 失配用 while 连续跳跃回退！",
        "        }",
        "        if (P[i] == P[j]) j++; // 匹配成功，真前后缀长度 +1",
        "        next[i] = j;           // 写入 next[i]",
        "    }",
        "    return next;",
        "}"
      ],
      compare: [
        "// 【上方 BF 暴力】：失配时主串 i 必须回退到 i - j + 1 → O(n*m)",
        "// 【下方 KMP 匹配】：主串 i 永不回退，只跳模式串 j → O(n+m)",
        "int kmpSearch(const string& S, const string& P, vector<int>& next) {",
        "    int n = S.size(), m = P.size(), j = 0;",
        "    for (int i = 0; i < n; i++) { // ★ 主串 i 一路向右永不回头！",
        "        while (j > 0 && S[i] != P[j]) {",
        "            j = next[j - 1];      // ★ 复用已匹配的真前缀，跳跃！",
        "        }",
        "        if (S[i] == P[j]) j++;    // 当前字符匹配，j 前进一步",
        "        if (j == m) return i - m + 1; // 🎉 完整命中！返回起点下标",
        "    }",
        "    return -1;",
        "}"
      ]
    };

    function computeNextArray(pattern) {
      const m = pattern.length;
      const next = new Array(m).fill(0);
      let j = 0;
      for (let i = 1; i < m; i++) {
        while (j > 0 && pattern[i] !== pattern[j]) {
          j = next[j - 1];
        }
        if (pattern[i] === pattern[j]) j++;
        next[i] = j;
      }
      return next;
    }

    function buildNextFrames(pattern) {
      const P = String(pattern || "ababaca");
      const m = P.length;
      const next = new Array(m).fill(null);
      next[0] = 0;
      const frames = [];

      frames.push({
        mode: "next",
        P,
        i: 0,
        j: 0,
        next: next.slice(),
        status: "init",
        prefixLen: 0,
        jumpFrom: null,
        jumpTo: null,
        readNextIdx: null,
        writeNextIdx: 0,
        codeLines: [3, 4, 5],
        tone: "info",
        vars: [
          { name: "模式串 P", val: `"${P}" (m=${m})`, tone: "blue" },
          { name: "next[0]", val: "0 (单字符无真前后缀)", tone: "green" },
          { name: "j", val: "0" }
        ],
        explain: `初始化：单字符 "${P[0]}" 没有真前后缀，所以 next[0] = 0。下面 i 从 1 扫到 ${m - 1}，用双指针 (i, j) 在 O(m) 内算出整张 next 表！`,
        tip: "💡 <strong>什么是「真前后缀」？</strong>不包含字符串本身的前缀与后缀。例如 <code>\"aba\"</code> 的最长相等真前后缀是 <code>\"a\"</code>（长度 1），所以对应 next 值为 1。"
      });

      let j = 0;
      for (let i = 1; i < m; i++) {
        frames.push({
          mode: "next",
          P, i, j, next: next.slice(),
          status: "compare",
          prefixLen: j,
          jumpFrom: null, jumpTo: null, readNextIdx: null, writeNextIdx: null,
          codeLines: [6, 7],
          tone: "info",
          vars: [
            { name: "当前 i", val: `${i} ('${P[i]}')`, tone: "blue" },
            { name: "前缀尾 j", val: `${j} ('${P[j]}')`, tone: "purple" },
            { name: "当前已匹配真前后缀", val: j > 0 ? `"${P.slice(0, j)}" (长 ${j})` : "空 (0)", tone: "green" }
          ],
          explain: `考察 i = ${i}（字符 '${P[i]}'）：当前真前缀 P[0..${j - 1}]${j > 0 ? `="${P.slice(0, j)}"` : "(空)"} 已与后缀对齐，现在比较 P[${i}]='${P[i]}' 与 P[${j}]='${P[j]}'。`
        });

        while (j > 0 && P[i] !== P[j]) {
          const oldJ = j;
          const targetJ = next[j - 1];
          frames.push({
            mode: "next",
            P, i, j: oldJ, next: next.slice(),
            status: "fallback",
            prefixLen: oldJ,
            jumpFrom: oldJ,
            jumpTo: targetJ,
            readNextIdx: oldJ - 1,
            writeNextIdx: null,
            codeLines: [7, 8],
            tone: "warn",
            vars: [
              { name: "失配比较", val: `P[${i}]='${P[i]}' ≠ P[${oldJ}]='${P[oldJ]}'`, tone: "red" },
              { name: "查表回退", val: `j = next[${oldJ - 1}] = ${targetJ}`, tone: "amber" }
            ],
            explain: `⚠️ 失配！P[${i}]='${P[i]}' ≠ P[${oldJ}]='${P[oldJ]}'，不能继续延长！查看 next[${oldJ - 1}] = ${targetJ}，让 j 从 ${oldJ} 跳跃回退到 ${targetJ}（缩短为次长公共前后缀）！`,
            tip: "🚨 <strong>经典易错点：</strong>这里必须用 <code>while</code> 而不能用 <code>if</code>！因为回退一次后 P[i] 和新的 P[j] 可能依然不等，需要继续往前回跳直到相等或 j == 0。"
          });
          j = targetJ;
        }

        if (P[i] === P[j]) {
          j++;
          next[i] = j;
          frames.push({
            mode: "next",
            P, i, j, next: next.slice(),
            status: "match",
            prefixLen: j,
            jumpFrom: null, jumpTo: null, readNextIdx: null, writeNextIdx: i,
            codeLines: [10, 11],
            tone: "good",
            vars: [
              { name: "匹配成功", val: `P[${i}] == P[${j - 1}] == '${P[i]}'`, tone: "green" },
              { name: `next[${i}]`, val: `${j} (公共真前后缀 "${P.slice(0, j)}")`, tone: "green" }
            ],
            explain: `✅ 匹配成功！P[${i}] == P[${j - 1}] == '${P[i]}'，真前后缀延长至长度 ${j}（"${P.slice(0, j)}"），记录 next[${i}] = ${j}！`
          });
        } else {
          next[i] = 0;
          frames.push({
            mode: "next",
            P, i, j: 0, next: next.slice(),
            status: "zero",
            prefixLen: 0,
            jumpFrom: null, jumpTo: null, readNextIdx: null, writeNextIdx: i,
            codeLines: [11],
            tone: "info",
            vars: [
              { name: "比较结果", val: `j=0 且 P[${i}]='${P[i]}' ≠ P[0]='${P[0]}'`, tone: "amber" },
              { name: `next[${i}]`, val: "0", tone: "blue" }
            ],
            explain: `退到 j = 0 后 P[${i}]='${P[i]}' 仍不等于 P[0]='${P[0]}'，说明 P[0..${i}] 没有公共真前后缀，记录 next[${i}] = 0。`
          });
        }
      }

      frames.push({
        mode: "next",
        P, i: m - 1, j, next: next.slice(),
        status: "done",
        prefixLen: next[m - 1],
        jumpFrom: null, jumpTo: null, readNextIdx: null, writeNextIdx: null,
        codeLines: [13],
        tone: "good",
        vars: [
          { name: "最终 next[]", val: `[${next.join(", ")}]`, tone: "green" },
          { name: "时间复杂度", val: `O(m) = O(${m})`, tone: "blue" }
        ],
        explain: `🎉 next 数组构造完成！P = "${P}" 对应的 next = [${next.join(", ")}]。切换到「BF vs KMP 对比」模式看看它如何让主串永不回退！`,
        tip: `💡 <strong>与教材/笔记 <code>next[0]=-1</code> 版本的关系：</strong>把这里的数组整体右移 1 位并在最左补 <code>-1</code>，即得 <code>[-1, ${next.slice(0, -1).join(", ")}]</code>，核心思想 100% 等价！`
      });

      return { frames, next };
    }

    function buildCompareFrames(text, pattern) {
      const S = String(text || "abababacababaca");
      const P = String(pattern || "ababaca");
      const n = S.length, m = P.length;
      const next = computeNextArray(P);

      // 1. Record BF steps
      const bfSteps = [];
      let bi = 0, bj = 0, bfCmp = 0, bfBacktracks = 0, bfMatchPos = -1;
      bfSteps.push({
        i: 0, j: 0, start: 0, cmp: 0, backtracks: 0, state: "init", backtrackFrom: null, matchPos: -1,
        note: "BF 暴力算法就绪：从起点 0 开始逐字符比对。"
      });
      while (bi < n && bj < m) {
        bfCmp++;
        if (S[bi] === P[bj]) {
          const curI = bi, curJ = bj;
          bi++; bj++;
          if (bj === m) {
            bfMatchPos = bi - m;
            bfSteps.push({
              i: curI, j: curJ, start: bfMatchPos, cmp: bfCmp, backtracks: bfBacktracks,
              state: "found", backtrackFrom: null, matchPos: bfMatchPos,
              note: `BF 历经 ${bfCmp} 次比较（主串回退 ${bfBacktracks} 次）后在下标 ${bfMatchPos} 匹配成功！`
            });
            break;
          } else {
            bfSteps.push({
              i: curI, j: curJ, start: curI - curJ, cmp: bfCmp, backtracks: bfBacktracks,
              state: "eq", backtrackFrom: null, matchPos: -1,
              note: `BF：S[${curI}]=='${S[curI]}' 匹配，继续向右比。`
            });
          }
        } else {
          const oldI = bi, oldJ = bj;
          const newStart = bi - bj + 1;
          const didBacktrack = oldJ > 0;
          if (didBacktrack) bfBacktracks++;
          bfSteps.push({
            i: oldI, j: oldJ, start: oldI - oldJ, cmp: bfCmp, backtracks: bfBacktracks,
            state: "mismatch", backtrackFrom: didBacktrack ? oldI : null, backtrackTo: didBacktrack ? newStart : null,
            matchPos: -1,
            note: didBacktrack
              ? `❌ BF 失配！S[${oldI}]='${S[oldI]}' ≠ P[${oldJ}]='${P[oldJ]}'，主串 i 浪费地从 ${oldI} 倒退回 ${newStart}，j 归零！`
              : `BF 首字符失配，窗口右移 1 格到 ${newStart}。`
          });
          bi = newStart;
          bj = 0;
        }
      }
      if (bfMatchPos === -1) {
        bfSteps.push({
          i: n - 1, j: 0, start: Math.max(0, n - m + 1), cmp: bfCmp, backtracks: bfBacktracks,
          state: "notfound", backtrackFrom: null, matchPos: -1,
          note: `BF 扫描结束，未找到匹配（共比较 ${bfCmp} 次，回退 ${bfBacktracks} 次）。`
        });
      }

      // 2. Record KMP steps
      const kmpSteps = [];
      let ki = 0, kj = 0, kmpCmp = 0, kmpJumps = 0, kmpMatchPos = -1;
      kmpSteps.push({
        i: 0, j: 0, start: 0, cmp: 0, jumps: 0, state: "init", jumpFrom: null, jumpTo: null, reusedLen: 0, matchPos: -1,
        codeLines: [3, 4],
        explain: `双赛道同时起跑！主串 S = "${S}"（长 ${n}），模式串 P = "${P}"（长 ${m}）。观察上方 BF 如何反复回退主串 i，而下方 KMP 的主串 i 始终稳如磐石只向右走！`,
        tip: `💡 已预先算出 <code>next = [${next.join(", ")}]</code>，KMP 遇到失配时直接查表跳 <code>j = next[j-1]</code>！`
      });

      while (ki < n && kj < m) {
        kmpCmp++;
        if (S[ki] === P[kj]) {
          const curI = ki, curJ = kj;
          ki++; kj++;
          if (kj === m) {
            kmpMatchPos = ki - m;
            kmpSteps.push({
              i: curI, j: curJ, start: kmpMatchPos, cmp: kmpCmp, jumps: kmpJumps,
              state: "found", jumpFrom: null, jumpTo: null, reusedLen: m, matchPos: kmpMatchPos,
              codeLines: [9, 10],
              tone: "good",
              explain: `🎉 KMP 率先在下标 ${kmpMatchPos} 完整命中！仅用 ${kmpCmp} 次比较，主串 i 回退 0 次（j 跳跃 ${kmpJumps} 次）！`,
              tip: bfSteps.length > kmpSteps.length
                ? "🔥 继续点「下一步」看可怜的 BF 暴力算法还要苦苦回退多少步才能追上 KMP！"
                : ""
            });
            break;
          } else {
            kmpSteps.push({
              i: curI, j: curJ, start: curI - curJ, cmp: kmpCmp, jumps: kmpJumps,
              state: "eq", jumpFrom: null, jumpTo: null, reusedLen: curJ + 1, matchPos: -1,
              codeLines: [5, 9],
              explain: `KMP 匹配：S[${curI}] == P[${curJ}] == '${S[curI]}'，双指针前进 (i→${ki}, j→${kj})。`
            });
          }
        } else if (kj > 0) {
          const oldJ = kj;
          const targetJ = next[kj - 1];
          kmpJumps++;
          kmpSteps.push({
            i: ki, j: oldJ, start: ki - oldJ, nextStart: ki - targetJ, cmp: kmpCmp, jumps: kmpJumps,
            state: "jump", jumpFrom: oldJ, jumpTo: targetJ, reusedLen: targetJ, matchPos: -1,
            codeLines: [6, 7],
            tone: "warn",
            explain: `⚡ KMP 失配神跳跃！S[${ki}]='${S[ki]}' ≠ P[${oldJ}]='${P[oldJ]}' → 主串 i=${ki} 纹丝不动！仅查表 j = next[${oldJ - 1}] = ${targetJ}${targetJ > 0 ? `，直接复用已匹配的 "${P.slice(0, targetJ)}"！` : "，模式串对齐到当前 i！"}`,
            tip: targetJ > 0
              ? `💡 <strong>为什么可以直接跳过前面？</strong>刚才已经验证过主串以 i-1 结尾的 ${targetJ} 个字符就是 "${P.slice(0, targetJ)}"，它正好等于模式串开头 P[0..${targetJ - 1}]，完全不必回头重比！`
              : "💡 公共真前后缀长度为 0，模式串直接滑到当前 i 位置，主串 i 依然不用后退！"
          });
          kj = targetJ;
        } else {
          const curI = ki;
          ki++;
          kmpSteps.push({
            i: curI, j: 0, start: curI, cmp: kmpCmp, jumps: kmpJumps,
            state: "mismatch0", jumpFrom: null, jumpTo: null, reusedLen: 0, matchPos: -1,
            codeLines: [5, 9],
            explain: `KMP 首字符失配：S[${curI}]='${S[curI]}' ≠ P[0]='${P[0]}' 且 j=0，主串 i 直接右移到 ${ki}。`
          });
        }
      }
      if (kmpMatchPos === -1) {
        kmpSteps.push({
          i: n - 1, j: kj, start: Math.max(0, n - m), cmp: kmpCmp, jumps: kmpJumps,
          state: "notfound", jumpFrom: null, jumpTo: null, reusedLen: 0, matchPos: -1,
          codeLines: [12],
          tone: "danger",
          explain: `KMP 扫描完毕，未找到模式串 "${P}"（共比较 ${kmpCmp} 次，主串回退 0 次）。`
        });
      }

      // 3. Zip BF & KMP steps into synchronized frames
      const total = Math.max(bfSteps.length, kmpSteps.length);
      const frames = [];
      for (let t = 0; t < total; t++) {
        const bf = bfSteps[Math.min(t, bfSteps.length - 1)];
        const kmp = kmpSteps[Math.min(t, kmpSteps.length - 1)];
        const kmpFinishedEarlier = t >= kmpSteps.length && kmp.state === "found";
        const isFinal = t === total - 1;
        let explain = kmpFinishedEarlier
          ? `🏆 KMP 早已在第 ${kmpSteps.length} 步锁定胜局（仅 ${kmp.cmp} 次比较），而上方 BF 仍在继续挣扎：${bf.note}`
          : kmp.explain;
        let tone = kmpFinishedEarlier ? "good" : (kmp.tone || "info");
        if (isFinal) {
          const ratio = kmp.cmp > 0 ? (bf.cmp / kmp.cmp).toFixed(2) : "1.00";
          explain =
            kmpMatchPos >= 0
              ? `🏁 对比结束（匹配位置 = ${kmpMatchPos}）：BF 比较 ${bf.cmp} 次 + 主串回退 ${bf.backtracks} 次；KMP 仅比较 ${kmp.cmp} 次 + 主串回退 0 次！（效率提升 ${ratio}×）`
              : `🏁 对比结束（无匹配）：BF 比较 ${bf.cmp} 次 + 主串回退 ${bf.backtracks} 次；KMP 仅比较 ${kmp.cmp} 次 + 主串回退 0 次！`;
          tone = kmpMatchPos >= 0 ? "good" : "warn";
        }
        frames.push({
          mode: "compare",
          S, P, next,
          bf, kmp,
          kmpFinishedEarlier,
          codeLines: kmpFinishedEarlier ? [10] : kmp.codeLines,
          tone,
          explain,
          tip: isFinal
            ? "📌 <strong>核心结论：</strong>BF 在最坏情况（如 \"aaaaaaaab\" 找 \"aaab\"）时间复杂度 O(n×m)，而 KMP 靠 next[] 保证主串指针 i 永不回退，时间恒为线性 O(n+m)！"
            : (kmpFinishedEarlier ? "" : (kmp.tip || "")),
          vars: [
            { name: "BF 比较 / 回退", val: `${bf.cmp} 次 / 回退 ${bf.backtracks} 次`, tone: bf.backtracks > 0 ? "red" : "amber" },
            { name: "KMP 比较 / 跳跃", val: `${kmp.cmp} 次 / j跳 ${kmp.jumps} 次`, tone: "green" },
            { name: "KMP 主串回退", val: "永远 0 次 ✅", tone: "blue" }
          ]
        });
      }

      return { frames, next, bfMatchPos, kmpMatchPos, bfCmp, kmpCmp, bfBacktracks, kmpJumps };
    }

    function renderNextSvg(frame, uid) {
      const P = frame.P;
      const m = P.length;
      const cellW = Math.min(46, Math.max(30, Math.floor(620 / Math.max(m, 6))));
      const cellH = 38;
      const padL = 72;
      const W = Math.max(660, padL + m * cellW + 40);
      const H = 266;
      const yIdx = 44;
      const yChar = 62;
      const yNext = 148;

      const defs = `
        <defs>
          <marker id="${uid}-ka" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,1 L9,5 L0,9 z" fill="#d97706"/></marker>
          <marker id="${uid}-kb" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,1 L9,5 L0,9 z" fill="#2563eb"/></marker>
        </defs>`;

      let svg = "";
      // Row labels
      svg += `<text x="12" y="${yIdx + 4}" font-size="11" font-weight="700" fill="var(--dsv-svg-muted)">下标</text>`;
      svg += `<text x="12" y="${yChar + 24}" font-size="12" font-weight="800" fill="var(--dsv-svg-label)">模式串 P</text>`;
      svg += `<text x="12" y="${yNext + 24}" font-size="12" font-weight="800" fill="var(--dsv-svg-label)">next[]</text>`;

      // Prefix / Suffix overlap highlight bars above P
      const pLen = frame.prefixLen || 0;
      if (pLen > 0 && frame.i > 0) {
        const px1 = padL + 2;
        const px2 = padL + pLen * cellW - 2;
        const sufStart = frame.status === "match" || frame.status === "done" ? frame.i - pLen + 1 : frame.i - pLen;
        const sx1 = padL + Math.max(0, sufStart) * cellW + 2;
        const sx2 = padL + (Math.max(0, sufStart) + pLen) * cellW - 2;

        svg += `<rect x="${px1}" y="12" width="${Math.max(10, px2 - px1)}" height="16" rx="5" fill="#dbeafe" stroke="#2563eb" stroke-width="1.3"/>`;
        svg += `<text x="${(px1 + px2) / 2}" y="23.5" text-anchor="middle" font-size="10" font-weight="800" fill="#1d4ed8">真前缀 "${escHtml(P.slice(0, pLen))}"</text>`;

        svg += `<rect x="${sx1}" y="106" width="${Math.max(10, sx2 - sx1)}" height="16" rx="5" fill="#d1fae5" stroke="#059669" stroke-width="1.3"/>`;
        svg += `<text x="${(sx1 + sx2) / 2}" y="117.5" text-anchor="middle" font-size="10" font-weight="800" fill="#047857">匹配真后缀 "${escHtml(P.slice(Math.max(0, sufStart), Math.max(0, sufStart) + pLen))}"</text>`;
      }

      // Draw P cells and next cells
      for (let k = 0; k < m; k++) {
        const x = padL + k * cellW;
        svg += `<text x="${x + cellW / 2}" y="${yIdx + 4}" text-anchor="middle" font-family="monospace" font-size="11.5" font-weight="700" fill="var(--dsv-svg-muted)">${k}</text>`;

        let fill = "var(--dsv-node-fill)", stroke = "var(--dsv-border-strong)", txt = "var(--dsv-node-text)", sw = 1.6;
        if (k < pLen && frame.i > 0) { fill = "#eff6ff"; stroke = "#60a5fa"; txt = "#1d4ed8"; }
        if (frame.status === "compare" && (k === frame.i || k === frame.j)) { fill = "#fef3c7"; stroke = "#d97706"; txt = "#92400e"; sw = 2.6; }
        if (frame.status === "fallback" && (k === frame.i || k === frame.j)) { fill = "#fee2e2"; stroke = "#dc2626"; txt = "#b91c1c"; sw = 2.6; }
        if (frame.status === "match" && (k === frame.i || k === frame.j - 1)) { fill = "#d1fae5"; stroke = "#059669"; txt = "#065f46"; sw = 2.6; }
        if (frame.status === "zero" && k === frame.i) { fill = "#f1f5f9"; stroke = "#64748b"; txt = "#334155"; sw = 2.4; }

        svg += `<rect x="${x + 2}" y="${yChar}" width="${cellW - 4}" height="${cellH}" rx="7" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
        svg += `<text x="${x + cellW / 2}" y="${yChar + 25}" text-anchor="middle" font-family="monospace" font-size="16" font-weight="800" fill="${txt}">${escHtml(P[k])}</text>`;

        // next[k] cell
        const nv = frame.next[k];
        let nFill = "var(--dsv-slot-empty)", nStroke = "var(--dsv-border-strong)", nTxt = "var(--dsv-node-text)", nSw = 1.5;
        if (nv !== null) { nFill = "var(--dsv-node-fill)"; }
        if (frame.readNextIdx === k) { nFill = "#fef3c7"; nStroke = "#d97706"; nTxt = "#b45309"; nSw = 2.8; }
        if (frame.writeNextIdx === k) { nFill = "#d1fae5"; nStroke = "#059669"; nTxt = "#065f46"; nSw = 2.8; }
        svg += `<rect x="${x + 2}" y="${yNext}" width="${cellW - 4}" height="${cellH}" rx="7" fill="${nFill}" stroke="${nStroke}" stroke-width="${nSw}"/>`;
        svg += `<text x="${x + cellW / 2}" y="${yNext + 25}" text-anchor="middle" font-family="monospace" font-size="15" font-weight="800" fill="${nv === null ? 'var(--dsv-svg-muted)' : nTxt}">${nv === null ? "·" : nv}</text>`;
      }

      // Pointer badges for i and j
      if (frame.status !== "done") {
        const ix = padL + frame.i * cellW + cellW / 2;
        svg += `<rect x="${ix - 15}" y="${yNext + cellH + 14}" width="30" height="20" rx="5" fill="#2563eb"/>`;
        svg += `<text x="${ix}" y="${yNext + cellH + 28}" text-anchor="middle" font-family="monospace" font-size="11.5" font-weight="800" fill="#fff">i=${frame.i}</text>`;

        const jShow = frame.status === "match" ? Math.max(0, frame.j - 1) : frame.j;
        const jx = padL + jShow * cellW + cellW / 2;
        const jOffset = jShow === frame.i ? 24 : 0;
        svg += `<rect x="${jx - 16}" y="${yNext + cellH + 14 + jOffset}" width="32" height="20" rx="5" fill="#7c3aed"/>`;
        svg += `<text x="${jx}" y="${yNext + cellH + 28 + jOffset}" text-anchor="middle" font-family="monospace" font-size="11.5" font-weight="800" fill="#fff">j=${frame.j}</text>`;
      }

      // Curved jump arrow j -> next[j-1]
      if (frame.jumpFrom !== null && frame.jumpTo !== null) {
        const xFrom = padL + frame.jumpFrom * cellW + cellW / 2;
        const xTo = padL + frame.jumpTo * cellW + cellW / 2;
        const midX = (xFrom + xTo) / 2;
        const arcY = yNext + cellH + 54;
        svg += `<path d="M ${xFrom} ${yNext + cellH + 2} Q ${midX} ${arcY}, ${xTo} ${yNext + cellH + 4}" fill="none" stroke="#d97706" stroke-width="2.6" stroke-dasharray="5,3" marker-end="url(#${uid}-ka)"/>`;
        svg += `<rect x="${midX - 58}" y="${arcY - 17}" width="116" height="19" rx="9" fill="#fef3c7" stroke="#d97706"/>`;
        svg += `<text x="${midX}" y="${arcY - 4}" text-anchor="middle" font-family="monospace" font-size="10.5" font-weight="800" fill="#b45309">j = next[${frame.jumpFrom - 1}] = ${frame.jumpTo}</text>`;
      }

      return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${defs}${svg}</svg>`;
    }

    function renderCompareSvg(frame, uid) {
      const { S, P, next, bf, kmp } = frame;
      const n = S.length, m = P.length;
      const cellW = Math.min(34, Math.max(24, Math.floor(620 / Math.max(n, 10))));
      const cellH = 30;
      const padL = 62;
      const W = Math.max(690, padL + n * cellW + 30);
      const H = 376;

      const defs = `
        <defs>
          <marker id="${uid}-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,1 L9,5 L0,9 z" fill="#dc2626"/></marker>
          <marker id="${uid}-purp" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,1 L9,5 L0,9 z" fill="#7c3aed"/></marker>
        </defs>`;

      function drawTrack(topY, title, badgeText, badgeColor, stObj, isKmp) {
        let g = "";
        g += `<text x="14" y="${topY + 15}" font-size="12.5" font-weight="800" fill="${isKmp ? '#059669' : '#dc2626'}">${title}</text>`;
        g += `<rect x="${W - 216}" y="${topY}" width="202" height="22" rx="11" fill="${badgeColor}"/>`;
        g += `<text x="${W - 115}" y="${topY + 14.5}" text-anchor="middle" font-family="monospace" font-size="11" font-weight="800" fill="#fff">${escHtml(badgeText)}</text>`;

        const yS = topY + 34;
        const yP = yS + cellH + 14;
        g += `<text x="14" y="${yS + 20}" font-size="11.5" font-weight="700" fill="var(--dsv-svg-label)">主串 S</text>`;
        g += `<text x="14" y="${yP + 20}" font-size="11.5" font-weight="700" fill="var(--dsv-svg-label)">模式 P</text>`;

        for (let idx = 0; idx < n; idx++) {
          const x = padL + idx * cellW;
          g += `<text x="${x + cellW / 2}" y="${yS - 4}" text-anchor="middle" font-family="monospace" font-size="9.5" fill="var(--dsv-svg-muted)">${idx}</text>`;
          let fill = "var(--dsv-node-fill)", stroke = "var(--dsv-border-strong)", txt = "var(--dsv-node-text)", sw = 1.3;

          if (stObj.state === "found" && idx >= stObj.matchPos && idx < stObj.matchPos + m) {
            fill = "#d1fae5"; stroke = "#059669"; txt = "#065f46"; sw = 2;
          } else if (idx === stObj.i && stObj.state !== "notfound") {
            if (stObj.state === "eq") { fill = "#d1fae5"; stroke = "#059669"; txt = "#065f46"; sw = 2.4; }
            else if (stObj.state === "mismatch" || stObj.state === "jump" || stObj.state === "mismatch0") { fill = "#fee2e2"; stroke = "#dc2626"; txt = "#b91c1c"; sw = 2.4; }
            else { fill = "#eff6ff"; stroke = "#2563eb"; txt = "#1d4ed8"; sw = 2.2; }
          } else if (isKmp && stObj.state === "jump" && stObj.reusedLen > 0 && idx >= stObj.i - stObj.reusedLen && idx < stObj.i) {
            fill = "#d1fae5"; stroke = "#10b981"; txt = "#065f46"; sw = 2;
          }

          g += `<rect x="${x + 1.5}" y="${yS}" width="${cellW - 3}" height="${cellH}" rx="5" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
          g += `<text x="${x + cellW / 2}" y="${yS + 20}" text-anchor="middle" font-family="monospace" font-size="13.5" font-weight="800" fill="${txt}">${escHtml(S[idx])}</text>`;
        }

        // Draw aligned Pattern P
        const startShift = stObj.start;
        for (let k = 0; k < m; k++) {
          const col = startShift + k;
          if (col < 0 || col >= n + 2) continue;
          const x = padL + col * cellW;
          let fill = "var(--dsv-soft)", stroke = "var(--dsv-border-strong)", txt = "var(--dsv-node-text)", sw = 1.3;
          if (stObj.state === "found") {
            fill = "#059669"; stroke = "#047857"; txt = "#ffffff"; sw = 2;
          } else if (k < stObj.j && stObj.state !== "init") {
            fill = "#dbeafe"; stroke = "#3b82f6"; txt = "#1e40af";
          }
          if (k === stObj.j && stObj.state !== "found" && stObj.state !== "notfound") {
            if (stObj.state === "eq") { fill = "#059669"; stroke = "#047857"; txt = "#fff"; sw = 2.2; }
            else if (stObj.state === "mismatch" || stObj.state === "jump" || stObj.state === "mismatch0") { fill = "#dc2626"; stroke = "#991b1b"; txt = "#fff"; sw = 2.2; }
            else { fill = "#2563eb"; stroke = "#1d4ed8"; txt = "#fff"; sw = 2.2; }
          }
          if (isKmp && stObj.state === "jump" && k < stObj.reusedLen) {
            fill = "#d1fae5"; stroke = "#059669"; txt = "#065f46"; sw = 2;
          }
          g += `<rect x="${x + 1.5}" y="${yP}" width="${cellW - 3}" height="${cellH}" rx="5" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
          g += `<text x="${x + cellW / 2}" y="${yP + 20}" text-anchor="middle" font-family="monospace" font-size="13.5" font-weight="800" fill="${txt}">${escHtml(P[k])}</text>`;
        }

        // BF Backtrack red arrow
        if (!isKmp && stObj.backtrackFrom !== null && stObj.backtrackTo !== null) {
          const x1 = padL + stObj.backtrackFrom * cellW + cellW / 2;
          const x2 = padL + stObj.backtrackTo * cellW + cellW / 2;
          const ym = yP + cellH + 22;
          g += `<path d="M ${x1} ${yP + cellH + 2} Q ${(x1 + x2) / 2} ${ym + 14}, ${x2} ${yP + cellH + 3}" fill="none" stroke="#dc2626" stroke-width="2.4" marker-end="url(#${uid}-red)"/>`;
          g += `<text x="${(x1 + x2) / 2}" y="${ym + 12}" text-anchor="middle" font-size="10.5" font-weight="800" fill="#dc2626">⬅ 主串 i 倒退回 ${stObj.backtrackTo}!</text>`;
        }

        // KMP Jump purple arrow (i stays still!)
        if (isKmp && stObj.state === "jump" && stObj.jumpFrom !== null) {
          const xFrom = padL + (stObj.start + stObj.jumpFrom) * cellW + cellW / 2;
          const xTo = padL + (stObj.start + stObj.jumpTo) * cellW + cellW / 2;
          const ym = yP + cellH + 22;
          g += `<path d="M ${xFrom} ${yP + cellH + 2} Q ${(xFrom + xTo) / 2} ${ym + 14}, ${xTo} ${yP + cellH + 3}" fill="none" stroke="#7c3aed" stroke-width="2.4" marker-end="url(#${uid}-purp)"/>`;
          g += `<text x="${(xFrom + xTo) / 2}" y="${ym + 13}" text-anchor="middle" font-size="10.5" font-weight="800" fill="#7c3aed">⚡ i=${stObj.i} 不动！j = next[${stObj.jumpFrom - 1}] = ${stObj.jumpTo}</text>`;
        }
        return g;
      }

      let out = "";
      out += drawTrack(
        10,
        "🐢 赛道 A：BF 暴力匹配（失配主串回退）",
        `比较 ${bf.cmp} 次 | 回退 ${bf.backtracks} 次`,
        bf.state === "found" ? "#059669" : "#dc2626",
        bf,
        false
      );
      out += `<line x1="14" y1="158" x2="${W - 14}" y2="158" stroke="var(--dsv-border)" stroke-width="1.5" stroke-dasharray="6,4"/>`;
      out += drawTrack(
        172,
        "⚡ 赛道 B：KMP 算法（主串 i 永不回退）",
        kmp.state === "found" ? `✅ 已命中! 仅 ${kmp.cmp} 次比较` : `比较 ${kmp.cmp} 次 | j跳 ${kmp.jumps} 次`,
        kmp.state === "found" ? "#059669" : "#2563eb",
        kmp,
        true
      );

      // Compact next[] reference bar at bottom
      const ny = 334;
      out += `<text x="14" y="${ny + 18}" font-size="11" font-weight="700" fill="var(--dsv-svg-muted)">next[]：</text>`;
      for (let k = 0; k < m; k++) {
        const x = padL + k * cellW;
        const isLookup = kmp.state === "jump" && k === kmp.jumpFrom - 1;
        out += `<rect x="${x + 1.5}" y="${ny}" width="${cellW - 3}" height="26" rx="5" fill="${isLookup ? '#fef3c7' : 'var(--dsv-node-fill)'}" stroke="${isLookup ? '#d97706' : 'var(--dsv-border-strong)'}" stroke-width="${isLookup ? 2.4 : 1.2}"/>`;
        out += `<text x="${x + cellW / 2}" y="${ny + 17}" text-anchor="middle" font-family="monospace" font-size="12" font-weight="800" fill="${isLookup ? '#b45309' : 'var(--dsv-node-text)'}">${next[k]}</text>`;
      }

      return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${defs}${out}</svg>`;
    }

    function mount(paneEl, uid, onInteract) {
      paneEl.innerHTML = `
        <div class="dsv-toolbar">
          <div class="dsv-toolbar-row">
            <div class="dsv-pill-group" data-role="modes">
              <span class="dsv-lbl">视图模式：</span>
              <button type="button" class="dsv-btn active" data-mode="next">🧩 构建 next[] 数组动画</button>
              <button type="button" class="dsv-btn" data-mode="compare">⚔️ BF 暴力回退 vs KMP 对比演示</button>
            </div>
            <div class="dsv-pill-group" data-role="presets">
              <span class="dsv-lbl">经典预设：</span>
              <button type="button" class="dsv-btn dsv-btn-sm active" data-preset="ababaca">"ababaca"</button>
              <button type="button" class="dsv-btn dsv-btn-sm" data-preset="ababcabcacbab">"ababcabcacbab"</button>
              <button type="button" class="dsv-btn dsv-btn-sm" data-preset="abcac">教材 "abcac"</button>
              <button type="button" class="dsv-btn dsv-btn-sm" data-preset="worst">BF噩梦 "aaab"</button>
            </div>
          </div>
          <div class="dsv-toolbar-row">
            <div class="dsv-pill-group">
              <span class="dsv-lbl">主串 S：</span>
              <input type="text" class="dsv-input dsv-input-str" data-role="inText" value="abababacababaca" maxlength="20" />
              <span class="dsv-lbl">模式串 P：</span>
              <input type="text" class="dsv-input" style="width:128px" data-role="inPat" value="ababaca" maxlength="14" />
              <button type="button" class="dsv-btn dsv-btn-primary dsv-btn-sm" data-act="apply">✨ 应用自定义</button>
            </div>
          </div>
          <div class="dsv-player-bar" data-role="player"></div>
        </div>
        <div class="dsv-grid">
          <div class="dsv-col">
            <div class="dsv-card">
              <div class="dsv-card-head">
                <span class="dsv-card-title" data-role="stageTitle">KMP next[] 构建与真前后缀重叠视图</span>
                <div class="dsv-legend">
                  <span class="dsv-legend-item"><span class="dsv-dot" style="background:#2563eb"></span>真前缀 / i指针</span>
                  <span class="dsv-legend-item"><span class="dsv-dot" style="background:#059669"></span>匹配/复用前缀</span>
                  <span class="dsv-legend-item"><span class="dsv-dot" style="background:#d97706"></span>next 查表跳跃</span>
                  <span class="dsv-legend-item"><span class="dsv-dot" style="background:#dc2626"></span>失配 / BF回退</span>
                </div>
              </div>
              <div class="dsv-card-body"><div class="dsv-svg-stage" data-role="svg"></div></div>
            </div>
            <div class="dsv-card">
              <div class="dsv-card-head"><span class="dsv-card-title">📌 实时指针与跳跃信息</span></div>
              <div class="dsv-card-body"><div class="dsv-vars" data-role="vars"></div></div>
            </div>
            <div class="dsv-explain" data-role="explain"></div>
          </div>
          <div class="dsv-col">
            <div class="dsv-card">
              <div class="dsv-card-head"><span class="dsv-card-title" data-role="auxTitle">📊 真前后缀解析表</span></div>
              <div class="dsv-card-body" data-role="auxBody"></div>
            </div>
            <div class="dsv-card">
              <div class="dsv-card-head">
                <span class="dsv-card-title">💻 同步 C++ KMP 代码</span>
                <span class="dsv-tag dsv-tag-blue" data-role="codeTag">KMP_BuildNext.cpp</span>
              </div>
              <div class="dsv-code" data-role="code"></div>
            </div>
          </div>
        </div>
      `;

      let currentMode = "next";
      let curText = PRESETS.ababaca.text;
      let curPat = PRESETS.ababaca.pattern;

      const svgEl = paneEl.querySelector('[data-role="svg"]');
      const varsEl = paneEl.querySelector('[data-role="vars"]');
      const expEl = paneEl.querySelector('[data-role="explain"]');
      const auxTitleEl = paneEl.querySelector('[data-role="auxTitle"]');
      const auxBodyEl = paneEl.querySelector('[data-role="auxBody"]');
      const codeEl = paneEl.querySelector('[data-role="code"]');
      const codeTagEl = paneEl.querySelector('[data-role="codeTag"]');
      const stageTitleEl = paneEl.querySelector('[data-role="stageTitle"]');
      const inText = paneEl.querySelector('[data-role="inText"]');
      const inPat = paneEl.querySelector('[data-role="inPat"]');
      const modeBtns = paneEl.querySelectorAll('[data-role="modes"] .dsv-btn');
      const presetBtns = paneEl.querySelectorAll('[data-role="presets"] .dsv-btn');

      const player = new FramePlayer(
        paneEl.querySelector('[data-role="player"]'),
        (frame) => {
          if (frame.mode === "next") {
            svgEl.innerHTML = renderNextSvg(frame, uid + "-kmpn");
            auxTitleEl.textContent = "📊 当前子串真前后缀解析";
            const sub = frame.P.slice(0, frame.i + 1);
            const lenVal = frame.next[frame.i];
            const overlap = lenVal && lenVal > 0 ? frame.P.slice(0, lenVal) : "无";
            const shifted = [-1, ...frame.next.slice(0, -1).map((v) => (v === null ? "·" : v))];
            auxBodyEl.innerHTML = `
              <table class="dsv-table">
                <thead><tr><th>当前子串 P[0..${frame.i}]</th><th>最长相等真前后缀</th><th>next[${frame.i}]</th></tr></thead>
                <tbody>
                  <tr class="row-cur">
                    <td>"${escHtml(sub)}"</td>
                    <td>${overlap === "无" ? '<span class="dsv-tag dsv-tag-slate">无</span>' : `<span class="dsv-tag dsv-tag-green">"${escHtml(overlap)}"</span>`}</td>
                    <td><strong>${lenVal === null ? "计算中…" : lenVal}</strong></td>
                  </tr>
                </tbody>
              </table>
              <div style="margin-top:8px;font-size:12px;color:var(--dsv-text-sub)">
                对应 <code>next[0]=-1</code> 右移版：<code>[${shifted.join(", ")}]</code>
              </div>
            `;
          } else {
            svgEl.innerHTML = renderCompareSvg(frame, uid + "-kmpc");
            auxTitleEl.textContent = "⚔️ BF vs KMP 实时战绩对比";
            const saved = frame.bf.cmp - frame.kmp.cmp;
            auxBodyEl.innerHTML = `
              <div class="dsv-kmp-scores">
                <div class="dsv-kmp-score-card bf">
                  <div style="font-size:12px;font-weight:700;color:var(--dsv-red)">🐢 BF 暴力匹配</div>
                  <div style="font-family:var(--dsv-font-mono);font-size:19px;font-weight:800;margin:3px 0">${frame.bf.cmp} 次比较</div>
                  <div style="font-size:11.5px;color:var(--dsv-text-sub)">主串回退 <strong>${frame.bf.backtracks}</strong> 次</div>
                </div>
                <div class="dsv-kmp-score-card kmp">
                  <div style="font-size:12px;font-weight:700;color:var(--dsv-green)">⚡ KMP 算法</div>
                  <div style="font-family:var(--dsv-font-mono);font-size:19px;font-weight:800;margin:3px 0">${frame.kmp.cmp} 次比较</div>
                  <div style="font-size:11.5px;color:var(--dsv-text-sub)">主串回退 <strong>0</strong> 次 · j跳 ${frame.kmp.jumps} 次</div>
                </div>
              </div>
              <div style="margin-top:8px;font-size:12px;color:var(--dsv-text-sub)">
                ${saved > 0 ? `🚀 当前 KMP 已比 BF 少做 <strong>${saved}</strong> 次无效字符比较！` : "观察失配瞬间：BF 必须回退主串，KMP 直接查 next[] 跳转！"}
              </div>
            `;
          }
          renderVars(varsEl, frame.vars);
          renderExplain(expEl, frame);
          renderCode(codeEl, CODES[frame.mode], frame.codeLines, false);
        },
        860,
        onInteract
      );

      function rebuild(autoPlay = false) {
        modeBtns.forEach((b) => b.classList.toggle("active", b.dataset.mode === currentMode));
        if (currentMode === "next") {
          stageTitleEl.textContent = `构建 next[] 数组 · P = "${curPat}"`;
          codeTagEl.textContent = "KMP_BuildNext.cpp";
          const res = buildNextFrames(curPat);
          player.setFrames(res.frames, autoPlay, 0);
        } else {
          stageTitleEl.textContent = `BF 暴力回退 vs KMP 永不回退 · S="${curText}" 找 P="${curPat}"`;
          codeTagEl.textContent = "KMP_vs_BF.cpp";
          const res = buildCompareFrames(curText, curPat);
          player.setFrames(res.frames, autoPlay, 0);
        }
      }

      modeBtns.forEach((b) =>
        b.addEventListener("click", () => {
          onInteract();
          currentMode = b.dataset.mode;
          rebuild(false);
        })
      );
      presetBtns.forEach((b) =>
        b.addEventListener("click", () => {
          onInteract();
          const p = PRESETS[b.dataset.preset];
          if (!p) return;
          presetBtns.forEach((x) => x.classList.toggle("active", x === b));
          curText = p.text;
          curPat = p.pattern;
          inText.value = curText;
          inPat.value = curPat;
          rebuild(false);
        })
      );
      paneEl.querySelector('[data-act="apply"]').addEventListener("click", () => {
        onInteract();
        const t = (inText.value || "").trim().slice(0, 20);
        const p = (inPat.value || "").trim().slice(0, 14);
        if (!p) return;
        curPat = p;
        curText = t.length >= p.length ? t : p + t;
        inText.value = curText;
        inPat.value = curPat;
        presetBtns.forEach((x) => x.classList.remove("active"));
        rebuild(false);
      });

      rebuild(false);
      return { player, destroy: () => player.destroy() };
    }

    return { mount, computeNextArray, buildNextFrames, buildCompareFrames, PRESETS };
  })();

  /* ==========================================================================
   * 7. 模块 4：二叉树遍历与调用栈 (tree · 第 4 章)
   * ========================================================================== */
  const TreeMod = (function () {
    const TREE = {
      1: { val: 1, left: 2, right: 3, x: 260, y: 48 },
      2: { val: 2, left: 4, right: 5, x: 145, y: 124 },
      3: { val: 3, left: null, right: 6, x: 375, y: 124 },
      4: { val: 4, left: null, right: null, x: 85, y: 204 },
      5: { val: 5, left: null, right: null, x: 205, y: 204 },
      6: { val: 6, left: 7, right: null, x: 435, y: 204 },
      7: { val: 7, left: null, right: null, x: 375, y: 278 }
    };

    const CODES = {
      pre: [
        "void preorder(TreeNode* root) {",
        "    if (root == nullptr) return; // 空节点直接返回",
        "    cout << root->val << ' ';    // ① 先访问根节点",
        "    preorder(root->left);        // ② 递归遍历左子树",
        "    preorder(root->right);       // ③ 递归遍历右子树",
        "}"
      ],
      in: [
        "void inorder(TreeNode* root) {",
        "    if (root == nullptr) return; // 空节点直接返回",
        "    inorder(root->left);         // ① 先递归左子树",
        "    cout << root->val << ' ';    // ② 再访问根节点",
        "    inorder(root->right);        // ③ 最后递归右子树",
        "}"
      ],
      post: [
        "void postorder(TreeNode* root) {",
        "    if (root == nullptr) return; // 空节点直接返回",
        "    postorder(root->left);       // ① 先递归左子树",
        "    postorder(root->right);      // ② 再递归右子树",
        "    cout << root->val << ' ';    // ③ 左右都完才访问根",
        "}"
      ],
      level: [
        "void levelOrder(TreeNode* root) {",
        "    queue<TreeNode*> q; q.push(root);",
        "    while (!q.empty()) {",
        "        TreeNode* cur = q.front(); q.pop(); // 队头出队",
        "        cout << cur->val << ' ';            // 访问当前节点",
        "        if (cur->left)  q.push(cur->left);  // 左孩子入队",
        "        if (cur->right) q.push(cur->right); // 右孩子入队",
        "    }",
        "}"
      ]
    };

    function buildRecursive(mode) {
      const fnName = mode === "pre" ? "preorder" : mode === "in" ? "inorder" : "postorder";
      const frames = [], stack = [], out = [], done = new Set();

      function snap(activeNode, codeLines, explain, tip, tone) {
        const states = {};
        Object.keys(TREE).forEach((k) => { states[k] = "unvisited"; });
        stack.forEach((sf) => { if (sf.node !== null) states[sf.node] = "stacked"; });
        done.forEach((id) => { states[id] = "done"; });
        if (activeNode !== null) states[activeNode] = "active";
        frames.push({
          mode, states, activeNode,
          stack: stack.map((x) => ({ ...x })),
          output: out.slice(),
          orderMap: Object.fromEntries(out.map((v, i) => [v, i + 1])),
          codeLines, explain, tip: tip || "", tone: tone || "info"
        });
      }

      snap(null, [1], `准备从根节点 1 开始执行 ${fnName}(1)。观察右侧系统调用栈如何「压栈深入，遇空回弹」！`,
        "💡 <strong>递归不是魔法：</strong>每次递归调用都会把当前函数挂起压栈，等子树算完再弹回来继续执行。");

      function dfs(id) {
        if (id === null) {
          stack.push({ node: null, label: `${fnName}(NULL)`, stage: "触底返回" });
          snap(null, [2], `进入 ${fnName}(nullptr)：命中递归出口，立即 return 退回上一层！`, "", "warn");
          stack.pop();
          return;
        }
        const n = TREE[id];
        stack.push({ node: id, label: `${fnName}(${id})`, stage: "刚入栈" });
        snap(id, [1, 2], `压栈进入 ${fnName}(${id})，节点非空。`);

        if (mode === "pre") {
          stack[stack.length - 1].stage = "① 输出根";
          out.push(id); done.add(id);
          snap(id, [3], `✅ 前序 ① 访问并输出根节点 ${id}！（当前输出：[${out.join(", ")}]）`, "", "good");
          stack[stack.length - 1].stage = "② 等左子树";
          snap(id, [4], `节点 ${id} 暂停在栈中，向下递归左孩子 ${n.left ?? "NULL"}。`);
          dfs(n.left);
          stack[stack.length - 1].stage = "③ 等右子树";
          snap(id, [5], `回到 ${fnName}(${id})！左子树完成，递归右孩子 ${n.right ?? "NULL"}。`);
          dfs(n.right);
        } else if (mode === "in") {
          stack[stack.length - 1].stage = "① 等左子树";
          snap(id, [3], `中序必须先走左边！节点 ${id} 挂在栈里，先递归左孩子 ${n.left ?? "NULL"}。`);
          dfs(n.left);
          stack[stack.length - 1].stage = "② 输出根";
          out.push(id); done.add(id);
          snap(id, [4], `✅ 回到 ${fnName}(${id})，左子树已完成！中序 ② 输出根节点 ${id}。`,
            id === 3 ? "💡 节点 3 无左孩子，遇 NULL 立刻返回，所以先输出 3 再去右子树 6！" : "", "good");
          stack[stack.length - 1].stage = "③ 等右子树";
          snap(id, [5], `继续递归节点 ${id} 的右孩子 ${n.right ?? "NULL"}。`);
          dfs(n.right);
        } else {
          stack[stack.length - 1].stage = "① 等左子树";
          snap(id, [3], `后序要等左右子树都完成！节点 ${id} 挂在栈中，先递归左孩子 ${n.left ?? "NULL"}。`);
          dfs(n.left);
          stack[stack.length - 1].stage = "② 等右子树";
          snap(id, [4], `回到 ${fnName}(${id})，继续递归右孩子 ${n.right ?? "NULL"}。`);
          dfs(n.right);
          stack[stack.length - 1].stage = "③ 输出根";
          out.push(id); done.add(id);
          snap(id, [5], `✅ 再次回到 ${fnName}(${id})，左右子树完毕！后序 ③ 输出根节点 ${id}。`,
            id === 1 ? "💡 根 1 最先压栈、最后输出——所以销毁整棵树和求子树高度必须用后序！" : "", "good");
        }

        stack[stack.length - 1].stage = "结束出栈";
        snap(id, [6], `${fnName}(${id}) 执行完毕，从调用栈弹出！`);
        stack.pop();
      }

      dfs(1);
      snap(null, [6], `🎉 遍历全部完成！最终序列：[${out.join(" → ")}]，调用栈已清空。`, "", "good");
      return frames;
    }

    function buildLevel() {
      const frames = [], q = [], out = [], done = new Set();
      function snap(activeNode, codeLines, explain, tip, tone) {
        const states = {};
        Object.keys(TREE).forEach((k) => { states[k] = "unvisited"; });
        q.forEach((id) => { states[id] = "stacked"; });
        done.forEach((id) => { states[id] = "done"; });
        if (activeNode !== null) states[activeNode] = "active";
        frames.push({
          mode: "level", states, activeNode, queue: q.slice(), output: out.slice(),
          orderMap: Object.fromEntries(out.map((v, i) => [v, i + 1])),
          codeLines, explain, tip: tip || "", tone: tone || "info"
        });
      }
      q.push(1);
      snap(1, [2], "层序遍历借助 FIFO 队列！先把根节点 1 入队。",
        "💡 <strong>为什么队列能按层遍历？</strong>先进先出保证上层先出队并把下层孩子排在队尾，天然实现逐层扫描！");
      while (q.length > 0) {
        const cur = q.shift();
        out.push(cur); done.add(cur);
        snap(cur, [4, 5], `队头 ${cur} 出队并输出！当前结果：[${out.join(", ")}]`, "", "good");
        const n = TREE[cur];
        if (n.left) { q.push(n.left); snap(cur, [6], `节点 ${cur} 的左孩子 ${n.left} 入队。`); }
        if (n.right) { q.push(n.right); snap(cur, [7], `节点 ${cur} 的右孩子 ${n.right} 入队。`); }
      }
      snap(null, [8], `🎉 队列为空，层序遍历完成！最终序列：[${out.join(" → ")}]。`, "", "good");
      return frames;
    }

    function renderTreeSvg(frame) {
      const W = 520, H = 320;
      let edges = "";
      Object.values(TREE).forEach((n) => {
        [n.left, n.right].forEach((chId) => {
          if (!chId) return;
          const ch = TREE[chId];
          const activeEdge = frame.activeNode === chId || frame.activeNode === n.val;
          edges += `<line x1="${n.x}" y1="${n.y}" x2="${ch.x}" y2="${ch.y}" stroke="${activeEdge ? '#60a5fa' : 'var(--dsv-edge)'}" stroke-width="${activeEdge ? 3 : 2.2}"/>`;
        });
      });

      let nodes = "";
      Object.values(TREE).forEach((n) => {
        const st = frame.states[n.val];
        let fill = "var(--dsv-node-fill)", stroke = "#94a3b8", txt = "var(--dsv-node-text)", sw = 2.4;
        if (st === "stacked") { fill = "#fffbeb"; stroke = "#d97706"; txt = "#b45309"; sw = 2.8; }
        if (st === "done") { fill = "#ecfdf5"; stroke = "#059669"; txt = "#047857"; sw = 2.8; }
        if (st === "active") { fill = "#2563eb"; stroke = "#1d4ed8"; txt = "#ffffff"; sw = 3.2; }
        nodes += `
          <g>
            ${st === "active" ? `<circle cx="${n.x}" cy="${n.y}" r="27" fill="rgba(37,99,235,0.18)"/>` : ""}
            <circle cx="${n.x}" cy="${n.y}" r="21" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>
            <text x="${n.x}" y="${n.y + 6}" text-anchor="middle" font-family="monospace" font-size="16" font-weight="800" fill="${txt}">${n.val}</text>
          </g>`;
        const ord = frame.orderMap[n.val];
        if (ord) {
          nodes += `
            <circle cx="${n.x + 19}" cy="${n.y - 17}" r="10" fill="#059669"/>
            <text x="${n.x + 19}" y="${n.y - 13.5}" text-anchor="middle" font-family="monospace" font-size="10" font-weight="800" fill="#fff">#${ord}</text>`;
        }
      });
      return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${edges}${nodes}</svg>`;
    }

    function mount(paneEl, uid, onInteract) {
      paneEl.innerHTML = `
        <div class="dsv-toolbar">
          <div class="dsv-toolbar-row">
            <div class="dsv-pill-group" data-role="modes">
              <span class="dsv-lbl">遍历方式：</span>
              <button type="button" class="dsv-btn active" data-mode="pre">前序遍历（根-左-右）</button>
              <button type="button" class="dsv-btn" data-mode="in">中序遍历（左-根-右）</button>
              <button type="button" class="dsv-btn" data-mode="post">后序遍历（左-右-根）</button>
              <button type="button" class="dsv-btn" data-mode="level">层序遍历（BFS 队列）</button>
            </div>
          </div>
          <div class="dsv-player-bar" data-role="player"></div>
        </div>
        <div class="dsv-grid">
          <div class="dsv-col">
            <div class="dsv-card">
              <div class="dsv-card-head">
                <span class="dsv-card-title">不对称 7 节点二叉树：1(2(4,5), 3(_,6(7,_)))</span>
                <div class="dsv-legend">
                  <span class="dsv-legend-item"><span class="dsv-dot" style="background:#cbd5e1"></span>未访问</span>
                  <span class="dsv-legend-item"><span class="dsv-dot" style="background:#d97706"></span>栈/队中</span>
                  <span class="dsv-legend-item"><span class="dsv-dot" style="background:#2563eb"></span>正在处理</span>
                  <span class="dsv-legend-item"><span class="dsv-dot" style="background:#059669"></span>已输出</span>
                </div>
              </div>
              <div class="dsv-card-body"><div class="dsv-svg-stage" data-role="svg"></div></div>
            </div>
            <div class="dsv-card">
              <div class="dsv-card-head"><span class="dsv-card-title">📤 遍历输出序列</span></div>
              <div class="dsv-card-body"><div class="dsv-seq" data-role="out"></div></div>
            </div>
            <div class="dsv-explain" data-role="explain"></div>
          </div>
          <div class="dsv-col">
            <div class="dsv-card">
              <div class="dsv-card-head">
                <span class="dsv-card-title" data-role="auxTitle">📚 模拟递归调用栈</span>
                <span class="dsv-tag dsv-tag-blue" data-role="auxCount">深度 0</span>
              </div>
              <div class="dsv-card-body" data-role="auxBody"></div>
            </div>
            <div class="dsv-card">
              <div class="dsv-card-head">
                <span class="dsv-card-title">💻 同步 C++ 遍历代码</span>
                <span class="dsv-tag dsv-tag-blue" data-role="codeTag">Preorder.cpp</span>
              </div>
              <div class="dsv-code" data-role="code"></div>
            </div>
          </div>
        </div>
      `;

      const svgEl = paneEl.querySelector('[data-role="svg"]');
      const outEl = paneEl.querySelector('[data-role="out"]');
      const expEl = paneEl.querySelector('[data-role="explain"]');
      const auxTitleEl = paneEl.querySelector('[data-role="auxTitle"]');
      const auxCountEl = paneEl.querySelector('[data-role="auxCount"]');
      const auxBodyEl = paneEl.querySelector('[data-role="auxBody"]');
      const codeEl = paneEl.querySelector('[data-role="code"]');
      const codeTagEl = paneEl.querySelector('[data-role="codeTag"]');
      const modeBtns = paneEl.querySelectorAll('[data-role="modes"] .dsv-btn');

      const player = new FramePlayer(
        paneEl.querySelector('[data-role="player"]'),
        (frame) => {
          svgEl.innerHTML = renderTreeSvg(frame);
          outEl.innerHTML = frame.output.length === 0
            ? '<span class="dsv-empty">尚未输出任何节点…</span>'
            : frame.output.map((v, i) => `<div class="dsv-seq-node${i === frame.output.length - 1 ? " latest" : ""}">${v}</div>`).join("");

          if (frame.mode === "level") {
            auxTitleEl.textContent = "📥 层序遍历队列（左头出 → 右尾入）";
            auxCountEl.textContent = `队内 ${frame.queue.length} 个`;
            auxBodyEl.innerHTML = frame.queue.length === 0
              ? '<div class="dsv-queue"><span class="dsv-empty">队列为空</span></div>'
              : `<div class="dsv-queue">${frame.queue.map((v, i) => `<div class="dsv-q-item${i === 0 ? " head" : ""}">${v}</div>`).join("")}</div>`;
          } else {
            auxTitleEl.textContent = "📚 模拟系统递归调用栈（栈顶在上）";
            auxCountEl.textContent = `栈深 ${frame.stack.length}`;
            auxBodyEl.innerHTML = frame.stack.length === 0
              ? '<div class="dsv-stack"><span class="dsv-empty" style="text-align:center">调用栈为空</span></div>'
              : `<div class="dsv-stack">${frame.stack.map((sf, i) => `<div class="dsv-stack-item${i === frame.stack.length - 1 ? " top" : ""}"><span>${escHtml(sf.label)}</span><span class="dsv-stack-badge">${escHtml(sf.stage)}</span></div>`).join("")}</div>`;
          }
          renderExplain(expEl, frame);
          renderCode(codeEl, CODES[frame.mode], frame.codeLines, false);
        },
        800,
        onInteract
      );

      function loadMode(mode) {
        modeBtns.forEach((b) => b.classList.toggle("active", b.dataset.mode === mode));
        const tags = { pre: "Preorder.cpp", in: "Inorder.cpp", post: "Postorder.cpp", level: "LevelOrder_BFS.cpp" };
        codeTagEl.textContent = tags[mode];
        player.setFrames(mode === "level" ? buildLevel() : buildRecursive(mode), false, 0);
      }
      modeBtns.forEach((b) => b.addEventListener("click", () => { onInteract(); loadMode(b.dataset.mode); }));
      loadMode("pre");
      return { player, destroy: () => player.destroy() };
    }

    return { mount, buildRecursive, buildLevel };
  })();

  /* ==========================================================================
   * 8. 模块 5（全新重磅！）：哈夫曼树构造与 0/1 编码 (huffman · 第 4 章)
   * ========================================================================== */
  const HuffmanMod = (function () {
    const PRESETS = {
      p4: {
        label: "{2, 3, 4, 7}",
        raw: "2, 3, 4, 7",
        items: [
          { ch: "A", w: 2 },
          { ch: "B", w: 3 },
          { ch: "C", w: 4 },
          { ch: "D", w: 7 }
        ]
      },
      p8: {
        label: "{5, 29, 7, 8, 14, 23, 3, 11}",
        raw: "5, 29, 7, 8, 14, 23, 3, 11",
        items: [
          { ch: "A", w: 5 },
          { ch: "B", w: 29 },
          { ch: "C", w: 7 },
          { ch: "D", w: 8 },
          { ch: "E", w: 14 },
          { ch: "F", w: 23 },
          { ch: "G", w: 3 },
          { ch: "H", w: 11 }
        ]
      },
      pNote: {
        label: "笔记例题 {2, 4, 5, 7}",
        raw: "2, 4, 5, 7",
        items: [
          { ch: "A", w: 2 },
          { ch: "B", w: 4 },
          { ch: "C", w: 5 },
          { ch: "D", w: 7 }
        ]
      }
    };

    const CODE = [
      "// 哈夫曼树构造：小顶堆贪心合并 + 左 0 右 1 生成前缀编码",
      "priority_queue<HuffNode*, vector<HuffNode*>, Cmp> pq;",
      "for (auto& [ch, w] : items) pq.push(new HuffNode(ch, w));",
      "int WPL = 0;",
      "while (pq.size() > 1) {",
      "    HuffNode* left  = pq.top(); pq.pop(); // ① 选权值最小树",
      "    HuffNode* right = pq.top(); pq.pop(); // ② 选权值次小树",
      "    HuffNode* parent = new HuffNode(left->w + right->w, left, right);",
      "    WPL += parent->w;   // ★ 重要定理：WPL == 所有内部节点权值之和！",
      "    pq.push(parent);    // 新树放回森林参与下一轮",
      "}",
      "// 从根出发：向左走记 '0'，向右走记 '1'，到达叶子即得哈夫曼编码",
      "genCodes(pq.top(), \"\");"
    ];

    function parseWeightsInput(str) {
      const tokens = String(str || "")
        .split(/[\s,，;；]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      const res = [];
      for (let idx = 0; idx < tokens.length && res.length < 9; idx++) {
        const tok = tokens[idx];
        const m = tok.match(/^([A-Za-z])[:=](\d+)$/);
        if (m) {
          const w = parseInt(m[2], 10);
          if (w > 0 && w <= 999) res.push({ ch: m[1].toUpperCase(), w });
        } else {
          const w = parseInt(tok, 10);
          if (!isNaN(w) && w > 0 && w <= 999) {
            res.push({ ch: String.fromCharCode(65 + res.length), w });
          }
        }
      }
      if (res.length < 2) return PRESETS.p4.items.map((x) => ({ ...x }));
      return res;
    }

    function cloneNode(node) {
      if (!node) return null;
      return {
        id: node.id,
        ch: node.ch,
        w: node.w,
        isLeaf: node.isLeaf,
        left: cloneNode(node.left),
        right: cloneNode(node.right)
      };
    }

    function buildHuffmanFrames(inputItems) {
      const items = (inputItems && inputItems.length >= 2 ? inputItems : PRESETS.p4.items).map((it, idx) => ({
        id: idx + 1,
        ch: it.ch || String.fromCharCode(65 + idx),
        w: Number(it.w),
        isLeaf: true,
        left: null,
        right: null
      }));
      const n = items.length;
      let forest = items.map(cloneNode);
      let nextId = n + 1;
      let wpl = 0;
      const wplTerms = [];
      const frames = [];

      const sortForest = (arr) => arr.slice().sort((a, b) => (a.w !== b.w ? a.w - b.w : a.id - b.id));

      frames.push({
        forest: sortForest(forest).map(cloneNode),
        pickIds: [],
        newParentId: null,
        showBits: false,
        wpl: 0,
        wplTerms: [],
        codes: [],
        round: 0,
        totalRounds: n - 1,
        codeLines: [2, 3, 4],
        tone: "info",
        vars: [
          { name: "叶子数 n", val: String(n), tone: "blue" },
          { name: "森林棵数", val: `${n} 棵单节点树`, tone: "purple" },
          { name: "当前 WPL", val: "0", tone: "green" }
        ],
        explain: `初始化森林：把 ${n} 个带权字符 [${items.map((x) => `${x.ch}:${x.w}`).join(", ")}] 各自看作一棵单节点树，共需执行 n - 1 = ${n - 1} 次贪心合并！`,
        tip: "💡 <strong>为什么每次都选最小的两棵合并？</strong>越早被合并的节点，最终在树里的深度越深。让<strong>权值最小</strong>的叶子沉到最深处、<strong>权值最大</strong>的叶子靠近树根，就能让总带权路径长度 WPL = Σ(wᵢ × lᵢ) 最小！"
      });

      for (let round = 1; round <= n - 1; round++) {
        forest = sortForest(forest);
        const min1 = forest[0];
        const min2 = forest[1];

        frames.push({
          forest: forest.map(cloneNode),
          pickIds: [min1.id, min2.id],
          newParentId: null,
          showBits: false,
          wpl,
          wplTerms: wplTerms.slice(),
          codes: [],
          round,
          totalRounds: n - 1,
          codeLines: [5, 6, 7],
          tone: "warn",
          vars: [
            { name: `第 ${round}/${n - 1} 轮`, val: "挑两棵最小树", tone: "amber" },
            { name: "最小① (左)", val: `${min1.isLeaf ? min1.ch + ":" : "子树"}${min1.w}`, tone: "amber" },
            { name: "次小② (右)", val: `${min2.isLeaf ? min2.ch + ":" : "子树"}${min2.w}`, tone: "purple" },
            { name: "累计 WPL", val: String(wpl), tone: "green" }
          ],
          explain: `第 ${round} 轮 ① 贪心挑选：从当前 ${forest.length} 棵树中选出权值最小的两棵——【${min1.isLeaf ? min1.ch + ":" : ""}${min1.w}】和【${min2.isLeaf ? min2.ch + ":" : ""}${min2.w}】！`
        });

        const mergedW = min1.w + min2.w;
        const parent = {
          id: nextId++,
          ch: null,
          w: mergedW,
          isLeaf: false,
          left: cloneNode(min1),
          right: cloneNode(min2)
        };
        forest = sortForest([parent, ...forest.slice(2)]);
        wpl += mergedW;
        wplTerms.push(mergedW);

        frames.push({
          forest: forest.map(cloneNode),
          pickIds: [],
          newParentId: parent.id,
          showBits: false,
          wpl,
          wplTerms: wplTerms.slice(),
          codes: [],
          round,
          totalRounds: n - 1,
          codeLines: [8, 9, 10],
          tone: "good",
          vars: [
            { name: "新父节点权值", val: `${min1.w} + ${min2.w} = ${mergedW}`, tone: "green" },
            { name: "剩余树数", val: `${forest.length} 棵`, tone: "blue" },
            { name: "动态累加 WPL", val: `${wplTerms.join(" + ")} = ${wpl}`, tone: "green" }
          ],
          explain: `第 ${round} 轮 ② 合并入林：生成新父节点（权值 ${min1.w} + ${min2.w} = ${mergedW}），放回森林！WPL 动态累加为 ${wpl}。`,
          tip: "📌 <strong>超实用考研定理：</strong>每次合并让下方所有叶子的深度都 +1，所以 <code>WPL = 所有非叶子(内部)节点权值之和</code>！这里就是 " + wplTerms.join(" + ") + " = " + wpl + "！"
        });
      }

      // Compute final Huffman prefix codes (left=0, right=1)
      const root = forest[0];
      const codes = [];
      function dfsCode(node, path) {
        if (!node) return;
        if (node.isLeaf) {
          codes.push({
            ch: node.ch,
            w: node.w,
            code: path || "0",
            len: (path || "0").length,
            contrib: node.w * (path || "0").length
          });
          return;
        }
        dfsCode(node.left, path + "0");
        dfsCode(node.right, path + "1");
      }
      dfsCode(root, "");
      codes.sort((a, b) => a.ch.localeCompare(b.ch));

      const totalWeight = items.reduce((acc, x) => acc + x.w, 0);
      const fixedLen = Math.max(1, Math.ceil(Math.log2(n)));
      const fixedBits = totalWeight * fixedLen;
      const savedPct = fixedBits > 0 ? Math.max(0, ((fixedBits - wpl) / fixedBits) * 100).toFixed(1) : "0.0";
      const totalNodes = 2 * n - 1;

      frames.push({
        forest: [cloneNode(root)],
        pickIds: [],
        newParentId: null,
        showBits: true,
        wpl,
        wplTerms: wplTerms.slice(),
        codes,
        fixedLen,
        fixedBits,
        savedPct,
        totalNodes,
        round: n - 1,
        totalRounds: n - 1,
        codeLines: [12, 13],
        tone: "good",
        vars: [
          { name: "最优 WPL", val: `${wpl} bits`, tone: "green" },
          { name: "等长编码需", val: `${fixedBits} bits (${fixedLen}位/字符)`, tone: "amber" },
          { name: "压缩节省", val: `${savedPct}%`, tone: "blue" },
          { name: "总节点数", val: `2n-1 = ${totalNodes}`, tone: "purple" }
        ],
        explain: `🎉 哈夫曼树构造完毕！左枝标 0、右枝标 1，最终最优 WPL = ${wpl}（比 ${fixedLen} 位等长编码节省 ${savedPct}% 空间）！`,
        tip: "💡 <strong>为什么哈夫曼编码绝无二义性（前缀码）？</strong>所有字符全部位于<strong>叶子节点</strong>上，从根到任意叶子的路径绝不可能是另一条路径的前缀，解码时一路顺着 0/1 走到叶子即可唯一译出！"
      });

      return { frames, wpl, codes, fixedBits, savedPct, totalNodes };
    }

    function renderForestSvg(frame) {
      const forest = frame.forest || [];
      function countLeaves(node) {
        if (!node) return 0;
        if (node.isLeaf) return 1;
        return countLeaves(node.left) + countLeaves(node.right);
      }
      function treeDepth(node) {
        if (!node) return 0;
        if (node.isLeaf) return 1;
        return 1 + Math.max(treeDepth(node.left), treeDepth(node.right));
      }

      const maxD = Math.max(1, ...forest.map(treeDepth));
      const totalLeafSlots = forest.reduce((s, t) => s + countLeaves(t), 0) + Math.max(0, forest.length - 1) * 0.55;
      const W = Math.max(580, Math.round(totalLeafSlots * 64 + 70));
      const levelH = maxD <= 4 ? 66 : maxD === 5 ? 58 : 50;
      const H = Math.max(250, 56 + (maxD - 1) * levelH + 54);
      const padX = 36;
      const unitW = totalLeafSlots > 1 ? (W - padX * 2) / totalLeafSlots : W - padX * 2;

      const positioned = [];
      const edges = [];

      let cursor = 0;
      forest.forEach((root, treeIdx) => {
        if (treeIdx > 0) cursor += 0.55;
        function assign(node, depth) {
          const y = 42 + depth * levelH;
          if (node.isLeaf) {
            const x = padX + (cursor + 0.5) * unitW;
            cursor += 1;
            const info = { node, x, y, depth, isRoot: depth === 0 };
            positioned.push(info);
            return info;
          }
          const L = assign(node.left, depth + 1);
          const R = assign(node.right, depth + 1);
          const x = (L.x + R.x) / 2;
          const info = { node, x, y, depth, isRoot: depth === 0 };
          positioned.push(info);
          edges.push({ p: info, c: L, bit: "0" });
          edges.push({ p: info, c: R, bit: "1" });
          return info;
        }
        assign(root, 0);
      });

      const pick1 = frame.pickIds && frame.pickIds[0];
      const pick2 = frame.pickIds && frame.pickIds[1];

      let edgesSvg = "";
      edges.forEach((e) => {
        const isNew = frame.newParentId === e.p.node.id;
        const col = isNew ? "#10b981" : frame.showBits ? (e.bit === "0" ? "#3b82f6" : "#8b5cf6") : "var(--dsv-edge)";
        edgesSvg += `<line x1="${e.p.x}" y1="${e.p.y}" x2="${e.c.x}" y2="${e.c.y}" stroke="${col}" stroke-width="${isNew || frame.showBits ? 2.6 : 2.1}"/>`;
        if (frame.showBits) {
          const mx = (e.p.x + e.c.x) / 2 + (e.bit === "0" ? -10 : 10);
          const my = (e.p.y + e.c.y) / 2;
          const bFill = e.bit === "0" ? "#2563eb" : "#7c3aed";
          edgesSvg += `
            <circle cx="${mx}" cy="${my}" r="9.5" fill="${bFill}"/>
            <text x="${mx}" y="${my + 3.8}" text-anchor="middle" font-family="monospace" font-size="11" font-weight="800" fill="#fff">${e.bit}</text>`;
        }
      });

      const r = totalLeafSlots > 7 ? 18 : 21;
      let nodesSvg = "";
      positioned.forEach((it) => {
        const n = it.node;
        const isP1 = n.id === pick1;
        const isP2 = n.id === pick2;
        const isNew = n.id === frame.newParentId;

        let fill = n.isLeaf ? "#eff6ff" : "var(--dsv-node-fill)";
        let stroke = n.isLeaf ? "#2563eb" : "#64748b";
        let txt = n.isLeaf ? "#1d4ed8" : "var(--dsv-node-text)";
        let sw = 2.3;

        if (isP1) { fill = "#fef3c7"; stroke = "#d97706"; txt = "#b45309"; sw = 3.2; }
        else if (isP2) { fill = "#f5f3ff"; stroke = "#7c3aed"; txt = "#6d28d9"; sw = 3.2; }
        else if (isNew) { fill = "#ecfdf5"; stroke = "#059669"; txt = "#047857"; sw = 3.4; }

        if (n.isLeaf) {
          nodesSvg += `
            <g>
              <rect x="${it.x - r}" y="${it.y - r}" width="${r * 2}" height="${r * 2}" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>
              <text x="${it.x}" y="${it.y - 2}" text-anchor="middle" font-family="monospace" font-size="10.5" font-weight="800" fill="${stroke}">${escHtml(n.ch)}</text>
              <text x="${it.x}" y="${it.y + 12}" text-anchor="middle" font-family="monospace" font-size="13.5" font-weight="800" fill="${txt}">${n.w}</text>
            </g>`;
        } else {
          nodesSvg += `
            <g>
              ${isNew ? `<circle cx="${it.x}" cy="${it.y}" r="${r + 6}" fill="rgba(5,150,105,0.16)"/>` : ""}
              <circle cx="${it.x}" cy="${it.y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>
              <text x="${it.x}" y="${it.y + 5}" text-anchor="middle" font-family="monospace" font-size="14" font-weight="800" fill="${txt}">${n.w}</text>
            </g>`;
        }

        if (isP1 || isP2) {
          const badge = isP1 ? "最小①" : "次小②";
          const bc = isP1 ? "#d97706" : "#7c3aed";
          nodesSvg += `
            <rect x="${it.x - 24}" y="${it.y - r - 23}" width="48" height="18" rx="9" fill="${bc}"/>
            <text x="${it.x}" y="${it.y - r - 11}" text-anchor="middle" font-size="10" font-weight="800" fill="#fff">${badge}</text>`;
        } else if (isNew) {
          nodesSvg += `
            <rect x="${it.x - 28}" y="${it.y - r - 23}" width="56" height="18" rx="9" fill="#059669"/>
            <text x="${it.x}" y="${it.y - r - 11}" text-anchor="middle" font-size="10" font-weight="800" fill="#fff">合并新根</text>`;
        }
      });

      return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${edgesSvg}${nodesSvg}</svg>`;
    }

    function mount(paneEl, uid, onInteract) {
      paneEl.innerHTML = `
        <div class="dsv-toolbar">
          <div class="dsv-toolbar-row">
            <div class="dsv-pill-group" data-role="presets">
              <span class="dsv-lbl">经典权值预设：</span>
              <button type="button" class="dsv-btn active" data-preset="p4">{2, 3, 4, 7}（入门）</button>
              <button type="button" class="dsv-btn" data-preset="p8">{5, 29, 7, 8, 14, 23, 3, 11}（教材 8 节点）</button>
              <button type="button" class="dsv-btn" data-preset="pNote">{2, 4, 5, 7}（笔记例题）</button>
            </div>
            <div class="dsv-pill-group">
              <span class="dsv-lbl">自定义权值：</span>
              <input type="text" class="dsv-input dsv-input-weights" data-role="inWeights" value="2, 3, 4, 7" placeholder="如 2,3,4,7 或 A:5,B:2" />
              <button type="button" class="dsv-btn dsv-btn-primary dsv-btn-sm" data-act="build">🌲 构造哈夫曼树</button>
            </div>
          </div>
          <div class="dsv-player-bar" data-role="player"></div>
        </div>
        <div class="dsv-grid">
          <div class="dsv-col">
            <div class="dsv-card">
              <div class="dsv-card-head">
                <span class="dsv-card-title" data-role="stageTitle">哈夫曼森林合并现场（方框=字符叶子，圆圈=合并内部节点）</span>
                <div class="dsv-legend">
                  <span class="dsv-legend-item"><span class="dsv-dot" style="background:#d97706"></span>最小①</span>
                  <span class="dsv-legend-item"><span class="dsv-dot" style="background:#7c3aed"></span>次小② / 右1</span>
                  <span class="dsv-legend-item"><span class="dsv-dot" style="background:#059669"></span>新合并父节点</span>
                  <span class="dsv-legend-item"><span class="dsv-dot" style="background:#2563eb"></span>叶子 / 左0</span>
                </div>
              </div>
              <div class="dsv-card-body"><div class="dsv-svg-stage" data-role="svg"></div></div>
            </div>
            <div class="dsv-card">
              <div class="dsv-card-head"><span class="dsv-card-title">📌 动态 WPL 与合并统计</span></div>
              <div class="dsv-card-body"><div class="dsv-vars" data-role="vars"></div></div>
            </div>
            <div class="dsv-explain" data-role="explain"></div>
          </div>
          <div class="dsv-col">
            <div class="dsv-card">
              <div class="dsv-card-head">
                <span class="dsv-card-title" data-role="auxTitle">🔐 哈夫曼 0/1 前缀编码表</span>
                <span class="dsv-tag dsv-tag-green" data-role="wplBadge">WPL = 0</span>
              </div>
              <div class="dsv-card-body" data-role="auxBody"></div>
            </div>
            <div class="dsv-card">
              <div class="dsv-card-head">
                <span class="dsv-card-title">💻 同步 C++ 哈夫曼构造代码</span>
                <span class="dsv-tag dsv-tag-blue">HuffmanTree.cpp</span>
              </div>
              <div class="dsv-code" data-role="code"></div>
            </div>
          </div>
        </div>
      `;

      const svgEl = paneEl.querySelector('[data-role="svg"]');
      const varsEl = paneEl.querySelector('[data-role="vars"]');
      const expEl = paneEl.querySelector('[data-role="explain"]');
      const auxBodyEl = paneEl.querySelector('[data-role="auxBody"]');
      const wplBadgeEl = paneEl.querySelector('[data-role="wplBadge"]');
      const codeEl = paneEl.querySelector('[data-role="code"]');
      const inWeights = paneEl.querySelector('[data-role="inWeights"]');
      const presetBtns = paneEl.querySelectorAll('[data-role="presets"] .dsv-btn');

      const player = new FramePlayer(
        paneEl.querySelector('[data-role="player"]'),
        (frame) => {
          svgEl.innerHTML = renderForestSvg(frame);
          renderVars(varsEl, frame.vars);
          renderExplain(expEl, frame);
          wplBadgeEl.textContent = `WPL = ${frame.wpl}`;

          if (frame.codes && frame.codes.length > 0) {
            const rows = frame.codes
              .map(
                (c) =>
                  `<tr><td><strong>${escHtml(c.ch)}</strong></td><td>${c.w}</td><td><span class="dsv-tag dsv-tag-purple">${escHtml(c.code)}</span></td><td>${c.len}</td><td>${c.w}×${c.len}=${c.contrib}</td></tr>`
              )
              .join("");
            auxBodyEl.innerHTML = `
              <table class="dsv-table">
                <thead><tr><th>字符</th><th>权值 w</th><th>哈夫曼编码</th><th>码长 l</th><th>w × l</th></tr></thead>
                <tbody>${rows}</tbody>
              </table>
              <div style="margin-top:8px;font-size:12px;color:var(--dsv-text-sub)">
                ✅ 验证：Σ(wᵢ × lᵢ) = <strong>${frame.wpl}</strong>，对比 ${frame.fixedLen} 位等长编码 (${frame.fixedBits} bits) 节省 <strong>${frame.savedPct}%</strong>！
              </div>`;
          } else {
            const termStr = frame.wplTerms.length ? frame.wplTerms.join(" + ") + " = " + frame.wpl : "0（等待合并）";
            auxBodyEl.innerHTML = `
              <div style="font-size:12.5px;color:var(--dsv-text-sub);margin-bottom:8px;">
                合并进度：第 <strong>${frame.round}</strong> / ${frame.totalRounds} 轮 · 当前森林剩余 <strong>${frame.forest.length}</strong> 棵树
              </div>
              <div style="padding:9px 11px;border-radius:8px;background:var(--dsv-green-bg);border:1px solid var(--dsv-green-border);font-family:var(--dsv-font-mono);font-size:12.5px;font-weight:700;color:var(--dsv-green)">
                动态 WPL = ${termStr}
              </div>
              <div class="dsv-empty" style="margin-top:8px;">待合并为 1 棵完整哈夫曼树后，将自动标出左 0 右 1 并生成完整前缀编码表。</div>
            `;
          }
          renderCode(codeEl, CODE, frame.codeLines, false);
        },
        940,
        onInteract
      );

      function loadItems(items, autoPlay = false) {
        const res = buildHuffmanFrames(items);
        player.setFrames(res.frames, autoPlay, 0);
      }

      presetBtns.forEach((b) =>
        b.addEventListener("click", () => {
          onInteract();
          const p = PRESETS[b.dataset.preset];
          if (!p) return;
          presetBtns.forEach((x) => x.classList.toggle("active", x === b));
          inWeights.value = p.raw;
          loadItems(p.items, false);
        })
      );
      paneEl.querySelector('[data-act="build"]').addEventListener("click", () => {
        onInteract();
        presetBtns.forEach((x) => x.classList.remove("active"));
        loadItems(parseWeightsInput(inWeights.value), false);
      });

      loadItems(PRESETS.p4.items, false);
      return { player, destroy: () => player.destroy() };
    }

    return { mount, buildHuffmanFrames, parseWeightsInput, PRESETS };
  })();

  /* ==========================================================================
   * 9. 模块 6：图遍历与 Dijkstra 最短路 (graph · 第 5 章)
   * ========================================================================== */
  const GraphMod = (function () {
    const NODES = [
      { id: 0, x: 74, y: 155 },
      { id: 1, x: 205, y: 58 },
      { id: 2, x: 205, y: 252 },
      { id: 3, x: 350, y: 58 },
      { id: 4, x: 350, y: 252 },
      { id: 5, x: 478, y: 155 }
    ];
    const EDGES = [
      { u: 0, v: 1, w: 4 }, { u: 0, v: 2, w: 2 }, { u: 1, v: 2, w: 1 },
      { u: 1, v: 3, w: 5 }, { u: 2, v: 3, w: 7 }, { u: 2, v: 4, w: 10 },
      { u: 3, v: 4, w: 2 }, { u: 3, v: 5, w: 6 }, { u: 4, v: 5, w: 2 }
    ];

    const ADJ = (() => {
      const adj = Array.from({ length: 6 }, () => []);
      EDGES.forEach((e) => {
        adj[e.u].push({ to: e.v, w: e.w });
        adj[e.v].push({ to: e.u, w: e.w });
      });
      adj.forEach((list) => list.sort((a, b) => a.to - b.to));
      return adj;
    })();

    const CODES = {
      bfs: [
        "void BFS(int start) {",
        "    queue<int> q;",
        "    visited[start] = true; // ✅ 入队前立刻标记！",
        "    q.push(start);",
        "    while (!q.empty()) {",
        "        int u = q.front(); q.pop();",
        "        for (int v : adj[u]) {",
        "            if (!visited[v]) {",
        "                visited[v] = true; // ✅ 立刻标蓝防重复入队！",
        "                q.push(v);",
        "            }",
        "        }",
        "    }",
        "}"
      ],
      dfs: [
        "void DFS(int u) {",
        "    visited[u] = true;  // 标记已访问，防在环里无限绕圈",
        "    order.push_back(u);",
        "    for (int v : adj[u]) {",
        "        if (!visited[v]) {",
        "            DFS(v);     // 一条路扎到底！",
        "        }",
        "    }",
        "} // 邻居全探完，回溯到上一层"
      ],
      dijkstra: [
        "dist[start] = 0; // 其余顶点初始化为 ∞",
        "for (int k = 0; k < n; k++) {",
        "    int u = 未确定顶点中 dist 最小者;",
        "    visited[u] = true; // ✅ 顶点 u 最短路永久锁定！",
        "    for (auto [v, w] : adj[u]) {",
        "        if (!visited[v] && dist[u] + w < dist[v]) {",
        "            dist[v] = dist[u] + w; // ✨ 松弛成功！找到更近的路",
        "            prev[v] = u;",
        "        }",
        "    }",
        "}"
      ]
    };

    const edgeKey = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);

    function buildBFS(start) {
      const frames = [], visited = Array(6).fill(false), finished = Array(6).fill(false);
      const q = [], order = [], treeEdges = new Set();
      function snap(opts) {
        const nodeStates = {};
        for (let i = 0; i < 6; i++) {
          nodeStates[i] = opts.cur === i ? "active" : finished[i] ? "done" : visited[i] ? "queued" : "unvisited";
        }
        frames.push({
          mode: "bfs", nodeStates,
          checkEdge: opts.checkEdge || null, checkEdgeType: opts.checkEdgeType || "",
          treeEdges: new Set(treeEdges), queue: q.slice(), visited: visited.slice(), order: order.slice(),
          codeLines: opts.codeLines, explain: opts.explain, tip: opts.tip || "", tone: opts.tone || "info",
          vars: [
            { name: "当前 u", val: opts.cur !== undefined && opts.cur !== null ? String(opts.cur) : "-", tone: "blue" },
            { name: "已访问数", val: `${visited.filter(Boolean).length} / 6`, tone: "green" },
            { name: "BFS 序列", val: order.length ? order.join(" → ") : "空" }
          ]
        });
      }
      visited[start] = true; q.push(start);
      snap({
        cur: start, codeLines: [3, 4], tone: "good",
        explain: `起点 ${start} 入队，并立刻将 visited[${start}] 标为 true（蓝色）！`,
        tip: "💡 <strong>BFS 铁律：</strong>必须在「入队时」标 visited，绝不能等到出队再标，否则同一顶点会被多次入队！"
      });
      while (q.length > 0) {
        const u = q.shift();
        order.push(u);
        snap({ cur: u, codeLines: [5, 6], explain: `队头顶点 ${u} 出队，准备检查邻接顶点 [${ADJ[u].map((e) => e.to).join(", ")}]。` });
        for (const { to: v } of ADJ[u]) {
          if (!visited[v]) {
            visited[v] = true; q.push(v); treeEdges.add(edgeKey(u, v));
            snap({
              cur: u, checkEdge: edgeKey(u, v), checkEdgeType: "ok", codeLines: [8, 9, 10], tone: "good",
              explain: `发现未访问邻居 ${v}！立即标记 visited[${v}] = true（变蓝）并压入队尾。`
            });
          } else {
            snap({
              cur: u, checkEdge: edgeKey(u, v), checkEdgeType: "skip", codeLines: [8], tone: "warn",
              explain: `邻居 ${v} 的 visited[${v}] == true，直接跳过！`,
              tip: !finished[v] ? `🚨 <strong>关键避坑点：</strong>顶点 ${v} 还在队列中等待出队，全靠入队时提前标蓝避免了重复入队！` : ""
            });
          }
        }
        finished[u] = true;
      }
      snap({ cur: null, codeLines: [14], tone: "good", explain: `🎉 BFS 遍历完成！按层扩散序列：[${order.join(" → ")}]。` });
      return frames;
    }

    function buildDFS(start) {
      const frames = [], visited = Array(6).fill(false), finished = Array(6).fill(false);
      const stack = [], order = [], treeEdges = new Set();
      function snap(opts) {
        const nodeStates = {};
        for (let i = 0; i < 6; i++) {
          nodeStates[i] = opts.cur === i ? "active" : finished[i] ? "done" : visited[i] ? "queued" : "unvisited";
        }
        frames.push({
          mode: "dfs", nodeStates,
          checkEdge: opts.checkEdge || null, checkEdgeType: opts.checkEdgeType || "",
          treeEdges: new Set(treeEdges), stack: stack.map((x) => ({ ...x })),
          visited: visited.slice(), order: order.slice(),
          codeLines: opts.codeLines, explain: opts.explain, tip: opts.tip || "", tone: opts.tone || "info",
          vars: [
            { name: "当前 u", val: opts.cur !== undefined && opts.cur !== null ? String(opts.cur) : "-", tone: "blue" },
            { name: "栈深", val: String(stack.length), tone: "purple" },
            { name: "DFS 序列", val: order.length ? order.join(" → ") : "空" }
          ]
        });
      }
      function dfs(u) {
        visited[u] = true; order.push(u);
        stack.push({ label: `DFS(${u})`, stage: "探索中" });
        snap({ cur: u, codeLines: [1, 2, 3], tone: "good", explain: `压栈进入 DFS(${u})，标记 visited[${u}] = true。` });
        for (const { to: v } of ADJ[u]) {
          if (!visited[v]) {
            stack[stack.length - 1].stage = `深入 → ${v}`;
            treeEdges.add(edgeKey(u, v));
            snap({ cur: u, checkEdge: edgeKey(u, v), checkEdgeType: "ok", codeLines: [5, 6], explain: `沿边 (${u}-${v}) 一条路扎下去调用 DFS(${v})！` });
            dfs(v);
            stack[stack.length - 1].stage = `回溯自 ${v}`;
            snap({ cur: u, codeLines: [4], explain: `从 DFS(${v}) 回溯回到顶点 ${u}，继续检查其余邻居。` });
          } else {
            snap({ cur: u, checkEdge: edgeKey(u, v), checkEdgeType: "skip", codeLines: [5], tone: "warn", explain: `边 (${u}-${v}) 的邻居 ${v} 已访问，跳过防止在环中死循环！` });
          }
        }
        finished[u] = true;
        stack[stack.length - 1].stage = "完毕出栈";
        snap({ cur: u, codeLines: [9], explain: `顶点 ${u} 探索完毕，DFS(${u}) 出栈回溯。` });
        stack.pop();
      }
      dfs(start);
      snap({ cur: null, codeLines: [9], tone: "good", explain: `🎉 DFS 深度优先遍历完成！序列：[${order.join(" → ")}]。` });
      return frames;
    }

    function buildDijkstra(start) {
      const frames = [], INF = 9999;
      const dist = Array(6).fill(INF), visited = Array(6).fill(false), prev = Array(6).fill(-1);
      dist[start] = 0;

      const getSptEdges = () => {
        const s = new Set();
        for (let i = 0; i < 6; i++) if (prev[i] !== -1) s.add(edgeKey(i, prev[i]));
        return s;
      };

      function snap(opts) {
        const nodeStates = {};
        for (let i = 0; i < 6; i++) {
          nodeStates[i] = opts.cur === i ? "active" : visited[i] ? "done" : dist[i] < INF ? "queued" : "unvisited";
        }
        frames.push({
          mode: "dijkstra", nodeStates, dist: dist.slice(), visited: visited.slice(), prev: prev.slice(),
          cur: opts.cur ?? null, relaxedNode: opts.relaxedNode ?? null, relaxedDelta: opts.relaxedDelta || "",
          checkEdge: opts.checkEdge || null, checkEdgeType: opts.checkEdgeType || "",
          treeEdges: getSptEdges(), codeLines: opts.codeLines, explain: opts.explain, tip: opts.tip || "", tone: opts.tone || "info",
          vars: [
            { name: "起点", val: String(start), tone: "blue" },
            { name: "当前锁定 u", val: opts.cur !== undefined && opts.cur !== null ? `${opts.cur} (dist=${dist[opts.cur]})` : "-", tone: "green" },
            { name: "已锁定数", val: `${visited.filter(Boolean).length} / 6` }
          ]
        });
      }

      snap({
        cur: null, codeLines: [1],
        explain: `初始化 Dijkstra：dist[${start}] = 0，其余为 ∞。每轮选未锁定且 dist 最小的顶点锁定并松弛其邻居！`,
        tip: "💡 <strong>松弛 (Relax)：</strong>判断 <code>dist[u] + w < dist[v]</code>，如果借道 u 能走得更近，就立刻刷新 dist[v] 和前驱 prev[v]！"
      });

      for (let k = 0; k < 6; k++) {
        let u = -1;
        for (let i = 0; i < 6; i++) if (!visited[i] && (u === -1 || dist[i] < dist[u])) u = i;
        if (u === -1 || dist[u] === INF) break;
        visited[u] = true;
        snap({ cur: u, codeLines: [3, 4], tone: "good", explain: `第 ${k + 1} 轮：未锁定顶点中 dist[${u}] = ${dist[u]} 最小！锁定顶点 ${u} 最短路。` });

        for (const { to: v, w } of ADJ[u]) {
          if (visited[v]) continue;
          const cand = dist[u] + w;
          const old = dist[v];
          if (cand < old) {
            dist[v] = cand; prev[v] = u;
            const oldStr = old === INF ? "∞" : String(old);
            snap({
              cur: u, relaxedNode: v, relaxedDelta: `${oldStr} → ${cand}`,
              checkEdge: edgeKey(u, v), checkEdgeType: "relax", codeLines: [6, 7, 8], tone: "warn",
              explain: `✨ 松弛成功！经由 ${u} 到 ${v} = ${dist[u]} + ${w} = ${cand} < 原值 ${oldStr}，更新 dist[${v}] = ${cand}！`,
              tip: old !== INF ? `🔥 <strong>多路径绕远反而更近！</strong>原距离 ${old} 被缩短为 ${cand}，最短路径树绿色边同步更新！` : ""
            });
          } else {
            snap({
              cur: u, checkEdge: edgeKey(u, v), checkEdgeType: "skip", codeLines: [6],
              explain: `检查边 (${u}→${v}, 权 ${w})：${dist[u]} + ${w} = ${cand} ≥ dist[${v}] = ${old}，不更新。`
            });
          }
        }
      }

      snap({
        cur: null, codeLines: [11], tone: "good",
        explain: `🎉 Dijkstra 完成！起点 ${start} 到各顶点最短距离：[${dist.map((d, i) => `${i}:${d}`).join(", ")}]。`,
        tip: "⚠️ <strong>适用前提：</strong>Dijkstra 要求所有边权非负（不能有负权边）！"
      });
      return frames;
    }

    function renderGraphSvg(frame) {
      const W = 552, H = 312;
      let edgesSvg = "";
      EDGES.forEach((e) => {
        const a = NODES[e.u], b = NODES[e.v], key = edgeKey(e.u, e.v);
        let stroke = "var(--dsv-edge)", sw = 2.4, dash = "";
        if (frame.treeEdges && frame.treeEdges.has(key)) { stroke = "#10b981"; sw = 3.8; }
        if (frame.checkEdge === key) {
          sw = 4.5;
          if (frame.checkEdgeType === "relax") stroke = "#f59e0b";
          else if (frame.checkEdgeType === "ok") stroke = "#2563eb";
          else if (frame.checkEdgeType === "skip") { stroke = "#ef4444"; dash = 'stroke-dasharray="6,4"'; }
        }
        edgesSvg += `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${stroke}" stroke-width="${sw}" ${dash}/>`;
        const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        if (frame.mode === "dijkstra") {
          edgesSvg += `
            <rect x="${mx - 12}" y="${my - 10}" width="24" height="20" rx="6" fill="var(--dsv-node-fill)" stroke="${stroke === 'var(--dsv-edge)' ? '#94a3b8' : stroke}" stroke-width="1.5"/>
            <text x="${mx}" y="${my + 4.5}" text-anchor="middle" font-family="monospace" font-size="12" font-weight="800" fill="var(--dsv-node-text)">${e.w}</text>`;
        } else {
          edgesSvg += `<text x="${mx}" y="${my - 5}" text-anchor="middle" font-family="monospace" font-size="10.5" fill="var(--dsv-svg-muted)">${e.w}</text>`;
        }
      });

      let nodesSvg = "";
      NODES.forEach((n) => {
        const st = frame.nodeStates[n.id];
        let fill = "var(--dsv-node-fill)", stroke = "#64748b", txt = "var(--dsv-node-text)", sw = 2.4;
        if (st === "queued") { fill = "#dbeafe"; stroke = "#2563eb"; txt = "#1d4ed8"; sw = 2.8; }
        if (st === "done") { fill = "#ecfdf5"; stroke = "#059669"; txt = "#047857"; sw = 2.8; }
        if (st === "active") { fill = "#2563eb"; stroke = "#1d4ed8"; txt = "#ffffff"; sw = 3.4; }
        if (frame.relaxedNode === n.id) { fill = "#fef3c7"; stroke = "#d97706"; txt = "#b45309"; sw = 3.4; }
        nodesSvg += `
          <g>
            ${st === "active" ? `<circle cx="${n.x}" cy="${n.y}" r="28" fill="rgba(37,99,235,0.18)"/>` : ""}
            <circle cx="${n.x}" cy="${n.y}" r="21" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>
            <text x="${n.x}" y="${n.y + 6}" text-anchor="middle" font-family="monospace" font-size="16" font-weight="800" fill="${txt}">${n.id}</text>
          </g>`;
        if (frame.mode === "dijkstra") {
          const d = frame.dist[n.id];
          const dStr = d >= 9999 ? "∞" : String(d);
          const dy = n.y < 140 ? n.y - 31 : n.y + 34;
          const isRel = frame.relaxedNode === n.id;
          nodesSvg += `
            <rect x="${n.x - 24}" y="${dy - 11}" width="48" height="20" rx="6" fill="${isRel ? '#f59e0b' : 'var(--dsv-soft)'}" stroke="${isRel ? '#b45309' : 'var(--dsv-border-strong)'}"/>
            <text x="${n.x}" y="${dy + 3}" text-anchor="middle" font-family="monospace" font-size="11.5" font-weight="800" fill="${isRel ? '#fff' : 'var(--dsv-text)'}">d=${dStr}</text>`;
        }
      });
      return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${edgesSvg}${nodesSvg}</svg>`;
    }

    function mount(paneEl, uid, onInteract) {
      paneEl.innerHTML = `
        <div class="dsv-toolbar">
          <div class="dsv-toolbar-row">
            <div class="dsv-pill-group" data-role="modes">
              <span class="dsv-lbl">图算法：</span>
              <button type="button" class="dsv-btn active" data-mode="bfs">🌊 BFS 广度优先（入队标蓝）</button>
              <button type="button" class="dsv-btn" data-mode="dfs">🌲 DFS 深度优先（递归栈）</button>
              <button type="button" class="dsv-btn" data-mode="dijkstra">🧭 Dijkstra 最短路（松弛表）</button>
            </div>
            <div class="dsv-pill-group">
              <span class="dsv-lbl">起点：</span>
              <select class="dsv-select" data-role="start">
                <option value="0" selected>顶点 0（推荐）</option>
                <option value="1">顶点 1</option><option value="2">顶点 2</option>
                <option value="3">顶点 3</option><option value="4">顶点 4</option><option value="5">顶点 5</option>
              </select>
            </div>
          </div>
          <div class="dsv-player-bar" data-role="player"></div>
        </div>
        <div class="dsv-grid">
          <div class="dsv-col">
            <div class="dsv-card">
              <div class="dsv-card-head">
                <span class="dsv-card-title">6 顶点带权含环无向图</span>
                <div class="dsv-legend">
                  <span class="dsv-legend-item"><span class="dsv-dot" style="background:#2563eb"></span>入队/探索中</span>
                  <span class="dsv-legend-item"><span class="dsv-dot" style="background:#d97706"></span>松弛更新</span>
                  <span class="dsv-legend-item"><span class="dsv-dot" style="background:#059669"></span>已确定/最短路树</span>
                  <span class="dsv-legend-item"><span class="dsv-dot" style="background:#dc2626"></span>已访问跳过</span>
                </div>
              </div>
              <div class="dsv-card-body"><div class="dsv-svg-stage" data-role="svg"></div></div>
            </div>
            <div class="dsv-card">
              <div class="dsv-card-head"><span class="dsv-card-title">📌 实时状态与遍历序</span></div>
              <div class="dsv-card-body"><div class="dsv-vars" data-role="vars"></div></div>
            </div>
            <div class="dsv-explain" data-role="explain"></div>
          </div>
          <div class="dsv-col">
            <div class="dsv-card">
              <div class="dsv-card-head"><span class="dsv-card-title" data-role="auxTitle">📊 队列与状态表</span></div>
              <div class="dsv-card-body" data-role="auxBody"></div>
            </div>
            <div class="dsv-card">
              <div class="dsv-card-head">
                <span class="dsv-card-title">💻 同步 C++ 图算法代码</span>
                <span class="dsv-tag dsv-tag-blue" data-role="codeTag">Graph_BFS.cpp</span>
              </div>
              <div class="dsv-code" data-role="code"></div>
            </div>
          </div>
        </div>
      `;

      let currentMode = "bfs", startNode = 0;
      const svgEl = paneEl.querySelector('[data-role="svg"]');
      const varsEl = paneEl.querySelector('[data-role="vars"]');
      const expEl = paneEl.querySelector('[data-role="explain"]');
      const auxTitleEl = paneEl.querySelector('[data-role="auxTitle"]');
      const auxBodyEl = paneEl.querySelector('[data-role="auxBody"]');
      const codeEl = paneEl.querySelector('[data-role="code"]');
      const codeTagEl = paneEl.querySelector('[data-role="codeTag"]');
      const modeBtns = paneEl.querySelectorAll('[data-role="modes"] .dsv-btn');
      const startSel = paneEl.querySelector('[data-role="start"]');

      const player = new FramePlayer(
        paneEl.querySelector('[data-role="player"]'),
        (frame) => {
          svgEl.innerHTML = renderGraphSvg(frame);
          renderVars(varsEl, frame.vars);
          renderExplain(expEl, frame);
          renderCode(codeEl, CODES[frame.mode], frame.codeLines, false);

          if (frame.mode === "bfs") {
            auxTitleEl.textContent = "📥 BFS 队列与 visited[] 数组";
            const qHtml = frame.queue.length
              ? frame.queue.map((v, i) => `<div class="dsv-q-item${i === 0 ? " head" : ""}">${v}</div>`).join("")
              : '<span class="dsv-empty">队列为空</span>';
            const vHtml = frame.visited
              .map((b, i) => `<span class="dsv-tag ${b ? "dsv-tag-blue" : "dsv-tag-slate"}">${i}: ${b ? "true" : "false"}</span>`)
              .join(" ");
            auxBodyEl.innerHTML = `
              <div style="font-size:12px;font-weight:700;color:var(--dsv-text-sub);margin-bottom:5px;">当前队列 (队头在左)：</div>
              <div class="dsv-queue" style="margin-bottom:10px;">${qHtml}</div>
              <div style="font-size:12px;font-weight:700;color:var(--dsv-text-sub);margin-bottom:5px;">visited[] 标记数组：</div>
              <div style="display:flex;gap:6px;flex-wrap:wrap;">${vHtml}</div>`;
          } else if (frame.mode === "dfs") {
            auxTitleEl.textContent = "📚 DFS 递归调用栈（栈顶在上）";
            const stHtml = frame.stack.length
              ? frame.stack.map((sf, i) => `<div class="dsv-stack-item${i === frame.stack.length - 1 ? " top" : ""}"><span>${escHtml(sf.label)}</span><span class="dsv-stack-badge">${escHtml(sf.stage)}</span></div>`).join("")
              : '<span class="dsv-empty" style="text-align:center">递归栈已清空</span>';
            auxBodyEl.innerHTML = `<div class="dsv-stack">${stHtml}</div>`;
          } else {
            auxTitleEl.textContent = "🧭 Dijkstra 最短路表 dist[] / visited[]";
            let rows = "";
            for (let i = 0; i < 6; i++) {
              const trCls = frame.relaxedNode === i ? "row-rel" : frame.cur === i ? "row-cur" : frame.visited[i] ? "row-done" : "";
              const distStr = frame.relaxedNode === i
                ? `<span style="color:var(--dsv-amber)">${escHtml(frame.relaxedDelta)}</span>`
                : (frame.dist[i] >= 9999 ? "∞" : frame.dist[i]);
              const visTag = frame.visited[i]
                ? '<span class="dsv-tag dsv-tag-green">已锁定 ✓</span>'
                : '<span class="dsv-tag dsv-tag-slate">待定</span>';
              rows += `<tr class="${trCls}"><td>顶点 ${i}</td><td>${visTag}</td><td>${distStr}</td><td>${frame.prev[i] === -1 ? "-" : frame.prev[i]}</td></tr>`;
            }
            auxBodyEl.innerHTML = `<table class="dsv-table"><thead><tr><th>顶点</th><th>visited</th><th>dist[]</th><th>prev 前驱</th></tr></thead><tbody>${rows}</tbody></table>`;
          }
        },
        880,
        onInteract
      );

      function rebuild() {
        modeBtns.forEach((b) => b.classList.toggle("active", b.dataset.mode === currentMode));
        const tags = { bfs: "Graph_BFS.cpp", dfs: "Graph_DFS.cpp", dijkstra: "Dijkstra.cpp" };
        codeTagEl.textContent = tags[currentMode];
        const frames = currentMode === "bfs" ? buildBFS(startNode) : currentMode === "dfs" ? buildDFS(startNode) : buildDijkstra(startNode);
        player.setFrames(frames, false, 0);
      }

      modeBtns.forEach((b) => b.addEventListener("click", () => { onInteract(); currentMode = b.dataset.mode; rebuild(); }));
      startSel.addEventListener("change", (e) => { onInteract(); startNode = Number(e.target.value); rebuild(); });
      rebuild();
      return { player, destroy: () => player.destroy() };
    }

    return { mount, buildBFS, buildDFS, buildDijkstra };
  })();

  /* ==========================================================================
   * 10. 模块 7：二叉排序树 BST 实验室 (bst · 第 6 章)
   * ========================================================================== */
  const BstMod = (function () {
    const PRESET = [50, 30, 70, 20, 40, 60, 80, 65];
    const CODES = {
      search: [
        "BSTNode* search(BSTNode* root, int key) {",
        "    if (root == nullptr) return nullptr; // 查找失败",
        "    if (key == root->val) return root;   // ✅ 命中！",
        "    if (key < root->val) return search(root->left, key);",
        "    else                 return search(root->right, key);",
        "}"
      ],
      insert: [
        "BSTNode* insert(BSTNode* root, int key) {",
        "    if (root == nullptr) return new BSTNode(key); // 空位落地！",
        "    if (key < root->val)      root->left  = insert(root->left, key);",
        "    else if (key > root->val) root->right = insert(root->right, key);",
        "    return root; // 若相等则不重复插入",
        "}"
      ],
      delete: [
        "BSTNode* remove(BSTNode* root, int key) {",
        "    if (!root) return nullptr;",
        "    if (key < root->val)      root->left  = remove(root->left, key);",
        "    else if (key > root->val) root->right = remove(root->right, key);",
        "    else { // 🎯 找到待删节点！分三种情况：",
        "        if (!root->left)  return root->right; // 情况1/2: 无左子",
        "        if (!root->right) return root->left;  // 情况2: 仅左子",
        "        // 情况3(双孩子): 找右子树最小节点(中序后继)",
        "        BSTNode* s = root->right;",
        "        while (s->left) s = s->left;",
        "        root->val = s->val;                   // 后继值覆盖当前节点",
        "        root->right = remove(root->right, s->val); // 递归删原后继",
        "    }",
        "    return root;",
        "}"
      ]
    };

    const cloneTree = (node) => (node ? { val: node.val, left: cloneTree(node.left), right: cloneTree(node.right) } : null);
    function insertRaw(root, val) {
      if (!root) return { val, left: null, right: null };
      if (val < root.val) root.left = insertRaw(root.left, val);
      else if (val > root.val) root.right = insertRaw(root.right, val);
      return root;
    }
    const countNodes = (root) => (root ? 1 + countNodes(root.left) + countNodes(root.right) : 0);
    function getInorder(root, arr = []) {
      if (!root) return arr;
      getInorder(root.left, arr);
      arr.push(root.val);
      getInorder(root.right, arr);
      return arr;
    }
    function makePresetTree() {
      let r = null;
      PRESET.forEach((v) => { r = insertRaw(r, v); });
      return r;
    }

    function makeFrame(tree, mode, opts) {
      return {
        tree: cloneTree(tree), mode,
        activeVal: opts.activeVal ?? null, foundVal: opts.foundVal ?? null,
        delVal: opts.delVal ?? null, succVal: opts.succVal ?? null,
        pathVals: new Set(opts.pathVals || []),
        codeLines: opts.codeLines || [], explain: opts.explain,
        tip: opts.tip || "", tone: opts.tone || "info", vars: opts.vars || []
      };
    }

    function recordSearch(root, key) {
      const frames = [], path = [];
      let cur = root;
      frames.push(makeFrame(root, "search", {
        codeLines: [1], vars: [{ name: "目标 key", val: String(key), tone: "blue" }],
        explain: `准备在 BST 中查找 ${key}，从根节点出发比大小决定走左还是走右！`
      }));
      while (cur) {
        path.push(cur.val);
        if (key === cur.val) {
          frames.push(makeFrame(root, "search", {
            foundVal: cur.val, pathVals: path, codeLines: [3], tone: "good",
            vars: [{ name: "key", val: String(key) }, { name: "cur->val", val: String(cur.val), tone: "green" }],
            explain: `✅ 命中！当前节点值正好等于 ${key}，仅比较 ${path.length} 次就找到了！`
          }));
          return frames;
        } else if (key < cur.val) {
          frames.push(makeFrame(root, "search", {
            activeVal: cur.val, pathVals: path, codeLines: [4],
            vars: [{ name: "比较", val: `${key} < ${cur.val} → 走左子树`, tone: "blue" }],
            explain: `${key} < ${cur.val}，目标在左子树，向右整棵子树直接排除！`
          }));
          cur = cur.left;
        } else {
          frames.push(makeFrame(root, "search", {
            activeVal: cur.val, pathVals: path, codeLines: [5],
            vars: [{ name: "比较", val: `${key} > ${cur.val} → 走右子树`, tone: "blue" }],
            explain: `${key} > ${cur.val}，往右子树继续寻找！`
          }));
          cur = cur.right;
        }
      }
      frames.push(makeFrame(root, "search", {
        pathVals: path, codeLines: [2], tone: "danger",
        vars: [{ name: "结果", val: "nullptr (未找到)", tone: "red" }],
        explain: `❌ 走到 nullptr，BST 中不存在值为 ${key} 的节点。`
      }));
      return frames;
    }

    function recordInsert(root, key) {
      const work = cloneTree(root);
      const frames = [];
      if (countNodes(work) >= 15) {
        frames.push(makeFrame(work, "insert", { codeLines: [1], tone: "warn", explain: "当前树已有 15 个节点，请先删除部分节点或恢复预置树。" }));
        return { frames, nextRoot: work };
      }
      const path = [];
      let cur = work, parent = null, isLeft = false;
      frames.push(makeFrame(work, "insert", {
        codeLines: [1], vars: [{ name: "待插入 key", val: String(key), tone: "green" }],
        explain: `准备插入 ${key}：新节点永远挂在某个空指针位置上！`
      }));
      while (cur) {
        path.push(cur.val);
        if (key === cur.val) {
          frames.push(makeFrame(work, "insert", {
            foundVal: cur.val, pathVals: path, codeLines: [5], tone: "warn",
            vars: [{ name: "状态", val: `已存在 ${key}`, tone: "amber" }],
            explain: `⚠️ 节点 ${key} 已存在，标准 BST 不重复插入。`
          }));
          return { frames, nextRoot: work };
        }
        parent = cur;
        if (key < cur.val) {
          isLeft = true;
          frames.push(makeFrame(work, "insert", {
            activeVal: cur.val, pathVals: path, codeLines: [3],
            vars: [{ name: "路径", val: `${key} < ${cur.val} → 向左`, tone: "blue" }],
            explain: `${key} < ${cur.val}，向左子树寻找空位。`
          }));
          cur = cur.left;
        } else {
          isLeft = false;
          frames.push(makeFrame(work, "insert", {
            activeVal: cur.val, pathVals: path, codeLines: [4],
            vars: [{ name: "路径", val: `${key} > ${cur.val} → 向右`, tone: "blue" }],
            explain: `${key} > ${cur.val}，向右子树寻找空位。`
          }));
          cur = cur.right;
        }
      }
      const newNode = { val: key, left: null, right: null };
      let nextRoot = work;
      if (!parent) nextRoot = newNode;
      else if (isLeft) parent.left = newNode;
      else parent.right = newNode;
      frames.push(makeFrame(nextRoot, "insert", {
        foundVal: key, pathVals: path, codeLines: [2], tone: "good",
        vars: [{ name: "新节点", val: `${key} 挂载完成 ✅`, tone: "green" }],
        explain: `🎉 找到空位！new BSTNode(${key}) 作为 ${parent ? parent.val + (isLeft ? " 的左孩子" : " 的右孩子") : "根节点"} 落地，中序依然严格升序！`
      }));
      return { frames, nextRoot };
    }

    function recordDelete(root, key) {
      const frames = [];
      const workTree = cloneTree(root);
      const path = [];
      frames.push(makeFrame(workTree, "delete", {
        codeLines: [1], vars: [{ name: "待删除 key", val: String(key), tone: "red" }],
        explain: `准备删除节点 ${key}：先查找它，再按 0 / 1 / 2 个孩子分情况处理。`
      }));

      function delRec(node, target, isSub) {
        if (!node) {
          frames.push(makeFrame(workTree, "delete", {
            pathVals: path, codeLines: [2], tone: "danger",
            vars: [{ name: "结果", val: `未找到 ${target}`, tone: "red" }],
            explain: `❌ 走到空指针，不存在节点 ${target}。`
          }));
          return null;
        }
        path.push(node.val);
        if (target < node.val) {
          frames.push(makeFrame(workTree, "delete", {
            activeVal: node.val, pathVals: path, codeLines: [3],
            vars: [{ name: "查找", val: `${target} < ${node.val} → 走左`, tone: "blue" }],
            explain: `${target} < ${node.val}，往左子树寻找 ${target}。`
          }));
          node.left = delRec(node.left, target, isSub);
          return node;
        }
        if (target > node.val) {
          frames.push(makeFrame(workTree, "delete", {
            activeVal: node.val, pathVals: path, codeLines: [4],
            vars: [{ name: "查找", val: `${target} > ${node.val} → 走右`, tone: "blue" }],
            explain: `${target} > ${node.val}，往右子树寻找 ${target}。`
          }));
          node.right = delRec(node.right, target, isSub);
          return node;
        }
        if (!node.left && !node.right) {
          frames.push(makeFrame(workTree, "delete", {
            delVal: node.val, pathVals: path, codeLines: [5, 6], tone: "warn",
            vars: [{ name: "情况", val: "叶子节点（0孩子）", tone: "amber" }],
            explain: `🎯 找到 ${node.val}！它是叶子节点，直接删除返回 nullptr。`
          }));
          return null;
        }
        if (!node.left || !node.right) {
          const child = node.left || node.right;
          frames.push(makeFrame(workTree, "delete", {
            delVal: node.val, foundVal: child.val, pathVals: path, codeLines: [5, !node.left ? 6 : 7], tone: "warn",
            vars: [{ name: "情况", val: `单孩子 → 由 ${child.val} 顶替`, tone: "amber" }],
            explain: `🎯 找到 ${node.val}！它只有 1 个孩子（${child.val}），${isSub ? "原后继节点退化为简单删除：" : ""}父节点直接接管 ${child.val}！`
          }));
          return child;
        }

        frames.push(makeFrame(workTree, "delete", {
          delVal: node.val, pathVals: path, codeLines: [5, 8], tone: "danger",
          vars: [{ name: "情况", val: "⚠️ 双孩子节点！", tone: "red" }],
          explain: `🎯 找到双孩子节点 ${node.val}（左 ${node.left.val}、右 ${node.right.val}）！需要找「右子树最小节点（中序后继）」作完美替身。`,
          tip: "💡 <strong>为什么选右子树最小值？</strong>它比整个左子树大、比右子树其余节点小，顶上来后 BST 严格升序铁律纹丝不动！"
        }));
        let s = node.right;
        frames.push(makeFrame(workTree, "delete", {
          delVal: node.val, succVal: s.val, codeLines: [9],
          vars: [{ name: "找后继 s", val: `先入右孩子 ${s.val}`, tone: "purple" }],
          explain: `第 1 步找替身：s 先进入右子树根 ${s.val}，再一路向左走到头！`
        }));
        while (s.left) {
          s = s.left;
          frames.push(makeFrame(workTree, "delete", {
            delVal: node.val, succVal: s.val, codeLines: [10],
            vars: [{ name: "一路向左 s", val: String(s.val), tone: "purple" }],
            explain: `继续向左到达 ${s.val}（${s.left ? "还有左孩子" : "已无左孩子，就是右子树最小值！"}）。`
          }));
        }
        const succVal = s.val, oldVal = node.val;
        node.val = succVal;
        frames.push(makeFrame(workTree, "delete", {
          foundVal: succVal, codeLines: [11], tone: "good",
          vars: [{ name: "值覆盖", val: `原 ${oldVal} 改写为 ${succVal}`, tone: "green" }],
          explain: `第 2 步值覆盖：把中序后继 ${succVal} 复制过来覆盖原 ${oldVal}！`
        }));
        frames.push(makeFrame(workTree, "delete", {
          foundVal: succVal, codeLines: [12], tone: "warn",
          vars: [{ name: "清理替身", val: `在右子树递归删原 ${succVal}`, tone: "amber" }],
          explain: `第 3 步清理原后继：remove(root->right, ${succVal})。因为原 ${succVal} 必无左孩子，退化为简单 0/1 孩子删除！`
        }));
        node.right = delRec(node.right, succVal, true);
        return node;
      }

      const nextRoot = delRec(workTree, key, false);
      frames.push(makeFrame(nextRoot, "delete", {
        codeLines: [14], tone: "good",
        vars: [{ name: "删除完成", val: `节点数=${countNodes(nextRoot)}`, tone: "green" }],
        explain: "🎉 删除操作结束！观察下方中序遍历序列：依然严格升序，BST 性质完美保持！"
      }));
      return { frames, nextRoot };
    }

    function renderBstSvg(frame) {
      const W = 540, H = 310;
      if (!frame.tree) {
        return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"><text x="270" y="155" text-anchor="middle" font-size="15" fill="var(--dsv-svg-muted)">当前 BST 为空树，请点击插入添加节点</text></svg>`;
      }
      const nodesList = [];
      let orderIdx = 0, maxDepth = 0;
      function layout(node, depth, parent) {
        if (!node) return;
        maxDepth = Math.max(maxDepth, depth);
        layout(node.left, depth + 1, node);
        const item = { node, depth, parent, col: orderIdx++ };
        node._pos = item;
        nodesList.push(item);
        layout(node.right, depth + 1, node);
      }
      layout(frame.tree, 0, null);

      const n = nodesList.length;
      const padX = 42, padY = 38;
      const stepX = n > 1 ? (W - padX * 2) / (n - 1) : 0;
      const stepY = maxDepth > 0 ? Math.min(68, (H - padY * 2) / maxDepth) : 0;
      nodesList.forEach((it) => {
        it.x = n === 1 ? W / 2 : padX + it.col * stepX;
        it.y = padY + it.depth * stepY;
      });

      let edges = "";
      nodesList.forEach((it) => {
        if (it.parent && it.parent._pos) {
          const p = it.parent._pos;
          const onPath = frame.pathVals.has(it.node.val) && frame.pathVals.has(it.parent.val);
          edges += `<line x1="${p.x}" y1="${p.y}" x2="${it.x}" y2="${it.y}" stroke="${onPath ? '#60a5fa' : 'var(--dsv-edge)'}" stroke-width="${onPath ? 3.2 : 2.2}"/>`;
        }
      });

      const r = n > 11 ? 17 : 20;
      let nodesSvg = "";
      nodesList.forEach((it) => {
        const v = it.node.val;
        let fill = "var(--dsv-node-fill)", stroke = "#64748b", txt = "var(--dsv-node-text)", sw = 2.3;
        if (frame.pathVals.has(v)) { fill = "#eff6ff"; stroke = "#60a5fa"; txt = "#1e3a8a"; }
        if (frame.activeVal === v) { fill = "#2563eb"; stroke = "#1d4ed8"; txt = "#ffffff"; sw = 3.2; }
        if (frame.foundVal === v) { fill = "#059669"; stroke = "#047857"; txt = "#ffffff"; sw = 3.2; }
        if (frame.delVal === v) { fill = "#dc2626"; stroke = "#991b1b"; txt = "#ffffff"; sw = 3.2; }
        if (frame.succVal === v) { fill = "#7c3aed"; stroke = "#5b21b6"; txt = "#ffffff"; sw = 3.2; }
        nodesSvg += `
          <g>
            <circle cx="${it.x}" cy="${it.y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>
            <text x="${it.x}" y="${it.y + 5.5}" text-anchor="middle" font-family="monospace" font-size="${n > 11 ? 12.5 : 14}" font-weight="800" fill="${txt}">${v}</text>
          </g>`;
      });
      return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${edges}${nodesSvg}</svg>`;
    }

    function mount(paneEl, uid, onInteract) {
      paneEl.innerHTML = `
        <div class="dsv-toolbar">
          <div class="dsv-toolbar-row">
            <div class="dsv-pill-group">
              <span class="dsv-lbl">数值操作：</span>
              <input type="number" class="dsv-input dsv-input-num" data-role="input" value="65" min="-99" max="999" />
              <button type="button" class="dsv-btn dsv-btn-primary" data-act="search">🔍 查找 Search</button>
              <button type="button" class="dsv-btn dsv-btn-success" data-act="insert">➕ 插入 Insert</button>
              <button type="button" class="dsv-btn dsv-btn-danger" data-act="delete">🗑️ 删除 Delete</button>
              <button type="button" class="dsv-btn dsv-btn-amber" data-act="demo50">⭐ 一键演示：删双孩子根 50</button>
              <button type="button" class="dsv-btn" data-act="reset">↺ 恢复预置树</button>
            </div>
          </div>
          <div class="dsv-player-bar" data-role="player"></div>
        </div>
        <div class="dsv-grid">
          <div class="dsv-col">
            <div class="dsv-card">
              <div class="dsv-card-head">
                <span class="dsv-card-title">二叉排序树（左子树 &lt; 根 &lt; 右子树）</span>
                <div class="dsv-legend">
                  <span class="dsv-legend-item"><span class="dsv-dot" style="background:#2563eb"></span>比较中</span>
                  <span class="dsv-legend-item"><span class="dsv-dot" style="background:#7c3aed"></span>右子树最小后继</span>
                  <span class="dsv-legend-item"><span class="dsv-dot" style="background:#059669"></span>命中/新插入</span>
                  <span class="dsv-legend-item"><span class="dsv-dot" style="background:#dc2626"></span>待删除</span>
                </div>
              </div>
              <div class="dsv-card-body"><div class="dsv-svg-stage" data-role="svg"></div></div>
            </div>
            <div class="dsv-card">
              <div class="dsv-card-head">
                <span class="dsv-card-title">📐 实时中序遍历序列（BST 铁律校验）</span>
                <span class="dsv-tag dsv-tag-green" data-role="sortedTag">✅ 严格升序</span>
              </div>
              <div class="dsv-card-body"><div class="dsv-seq" data-role="inorder"></div></div>
            </div>
            <div class="dsv-explain" data-role="explain"></div>
          </div>
          <div class="dsv-col">
            <div class="dsv-card">
              <div class="dsv-card-head"><span class="dsv-card-title">📌 当前步骤状态</span></div>
              <div class="dsv-card-body"><div class="dsv-vars" data-role="vars"></div></div>
            </div>
            <div class="dsv-card">
              <div class="dsv-card-head">
                <span class="dsv-card-title">💻 同步 C++ BST 代码</span>
                <span class="dsv-tag dsv-tag-blue" data-role="codeTag">BST.cpp</span>
              </div>
              <div class="dsv-code" data-role="code"></div>
            </div>
          </div>
        </div>
      `;

      let liveRoot = makePresetTree();
      const svgEl = paneEl.querySelector('[data-role="svg"]');
      const inorderEl = paneEl.querySelector('[data-role="inorder"]');
      const sortedTagEl = paneEl.querySelector('[data-role="sortedTag"]');
      const varsEl = paneEl.querySelector('[data-role="vars"]');
      const expEl = paneEl.querySelector('[data-role="explain"]');
      const codeEl = paneEl.querySelector('[data-role="code"]');
      const codeTagEl = paneEl.querySelector('[data-role="codeTag"]');
      const inputEl = paneEl.querySelector('[data-role="input"]');

      const player = new FramePlayer(
        paneEl.querySelector('[data-role="player"]'),
        (frame) => {
          svgEl.innerHTML = renderBstSvg(frame);
          const seq = getInorder(frame.tree);
          inorderEl.innerHTML = seq.length === 0
            ? '<span class="dsv-empty">空树</span>'
            : seq.map((v) => `<div class="dsv-seq-node${v === frame.foundVal ? " latest" : ""}">${v}</div>`).join("");
          let asc = true;
          for (let i = 1; i < seq.length; i++) if (seq[i] < seq[i - 1]) asc = false;
          sortedTagEl.textContent = asc ? "✅ 严格升序（BST 有效）" : "⏳ 替换过渡帧（待删原后继）";
          sortedTagEl.className = "dsv-tag " + (asc ? "dsv-tag-green" : "dsv-tag-amber");
          renderVars(varsEl, frame.vars);
          renderExplain(expEl, frame);
          const tags = { search: "BST_Search.cpp", insert: "BST_Insert.cpp", delete: "BST_Delete.cpp" };
          codeTagEl.textContent = tags[frame.mode];
          renderCode(codeEl, CODES[frame.mode], frame.codeLines, false);
        },
        920,
        onInteract
      );

      const getKey = () => {
        const v = parseInt(inputEl.value, 10);
        return isNaN(v) ? 65 : Math.max(-99, Math.min(999, v));
      };
      function resetPreset() {
        liveRoot = makePresetTree();
        player.setFrames([makeFrame(liveRoot, "search", {
          codeLines: [1], vars: [{ name: "节点数", val: String(countNodes(liveRoot)), tone: "blue" }],
          explain: "已加载经典预置 BST：[50, 30, 70, 20, 40, 60, 80, 65]。可自定义查找/插入/删除，或一键演示「删双孩子根节点 50」！"
        })], false, 0);
      }

      paneEl.querySelector('[data-act="search"]').addEventListener("click", () => { onInteract(); player.setFrames(recordSearch(liveRoot, getKey()), true, 0); });
      paneEl.querySelector('[data-act="insert"]').addEventListener("click", () => {
        onInteract();
        const r = recordInsert(liveRoot, getKey());
        liveRoot = r.nextRoot;
        player.setFrames(r.frames, true, 0);
      });
      paneEl.querySelector('[data-act="delete"]').addEventListener("click", () => {
        onInteract();
        const r = recordDelete(liveRoot, getKey());
        liveRoot = r.nextRoot;
        player.setFrames(r.frames, true, 0);
      });
      paneEl.querySelector('[data-act="demo50"]').addEventListener("click", () => {
        onInteract();
        liveRoot = makePresetTree();
        inputEl.value = 50;
        const r = recordDelete(liveRoot, 50);
        liveRoot = r.nextRoot;
        player.setFrames(r.frames, true, 0);
      });
      paneEl.querySelector('[data-act="reset"]').addEventListener("click", () => { onInteract(); resetPreset(); });

      resetPreset();
      return { player, destroy: () => player.destroy() };
    }

    return { mount, makePresetTree, getInorder, recordSearch, recordInsert, recordDelete };
  })();

  /* ==========================================================================
   * 11. 模块 8：6 大核心排序对比竞技场 (sort · 第 7 章)
   * ========================================================================== */
  const SortMod = (function () {
    const PROFILES = {
      bubble: { name: "起泡排序（优化版 swapped）", time: "平均 O(n²) / 最好 O(n)", space: "O(1)", stable: "稳定", tag: "BubbleSort.cpp" },
      insert: { name: "直接插入排序", time: "平均 O(n²) / 最好 O(n)", space: "O(1)", stable: "稳定", tag: "InsertionSort.cpp" },
      select: { name: "简单选择排序", time: "恒为 O(n²)", space: "O(1)", stable: "不稳定", tag: "SelectionSort.cpp" },
      quick:  { name: "快速排序（双指针挖坑）", time: "平均 O(n log n) / 最坏 O(n²)", space: "O(log n)", stable: "不稳定", tag: "QuickSort.cpp" },
      heap:   { name: "堆排序（大顶堆 + 树图双视图）", time: "恒为 O(n log n)", space: "O(1)", stable: "不稳定", tag: "HeapSort.cpp" },
      merge:  { name: "二路归并排序（含辅助数组）", time: "恒为 O(n log n)", space: "O(n)", stable: "稳定", tag: "MergeSort.cpp" }
    };

    const CODES = {
      bubble: [
        "for (int i = 0; i < n - 1; i++) {",
        "    bool swapped = false;",
        "    for (int j = 0; j < n - 1 - i; j++) {",
        "        if (a[j] > a[j + 1]) {",
        "            swap(a[j], a[j + 1]);",
        "            swapped = true;",
        "        }",
        "    }",
        "    if (!swapped) break; // 本趟无交换，提前结束！",
        "}"
      ],
      insert: [
        "for (int i = 1; i < n; i++) {",
        "    int key = a[i]; // 摸起一张新牌",
        "    int j = i - 1;",
        "    while (j >= 0 && a[j] > key) {",
        "        a[j + 1] = a[j]; // 比 key 大的右移腾位",
        "        j--;",
        "    }",
        "    a[j + 1] = key;      // 插入正确位置",
        "}"
      ],
      select: [
        "for (int i = 0; i < n - 1; i++) {",
        "    int minIdx = i;",
        "    for (int j = i + 1; j < n; j++) {",
        "        if (a[j] < a[minIdx]) minIdx = j; // 打擂台找最小",
        "    }",
        "    if (minIdx != i) swap(a[i], a[minIdx]); // 每轮仅换 1 次",
        "}"
      ],
      quick: [
        "void quickSort(int a[], int l, int r) {",
        "    if (l >= r) return;",
        "    int pivot = a[l], i = l, j = r; // 选最左作基准",
        "    while (i < j) {",
        "        while (i < j && a[j] >= pivot) j--; // 右指针找小",
        "        if (i < j) a[i++] = a[j];",
        "        while (i < j && a[i] <= pivot) i++; // 左指针找大",
        "        if (i < j) a[j--] = a[i];",
        "    }",
        "    a[i] = pivot; // ✅ 基准永久归位！",
        "    quickSort(a, l, i - 1); quickSort(a, i + 1, r);",
        "}"
      ],
      heap: [
        "// 1. 自底向上建大顶堆",
        "for (int i = n/2 - 1; i >= 0; i--) siftDown(a, n, i);",
        "// 2. 反复将堆顶最大值换到末尾并下滤修复",
        "for (int end = n - 1; end > 0; end--) {",
        "    swap(a[0], a[end]);   // 堆顶最大元素归位",
        "    siftDown(a, end, 0);  // 剩余 [0..end-1] 重新调成大顶堆",
        "}",
        "// siftDown: 在父、左子、右子中找最大者交换并下沉"
      ],
      merge: [
        "void mergeSort(int a[], int l, int r) {",
        "    if (l >= r) return;",
        "    int mid = l + (r - l) / 2;",
        "    mergeSort(a, l, mid); mergeSort(a, mid + 1, r);",
        "    int i = l, j = mid + 1, k = 0;",
        "    while (i <= mid && j <= r)",
        "        tmp[k++] = (a[i] <= a[j]) ? a[i++] : a[j++];",
        "    while (i <= mid) tmp[k++] = a[i++];",
        "    while (j <= r)   tmp[k++] = a[j++];",
        "    for (int t = 0; t < k; t++) a[l + t] = tmp[t];",
        "}"
      ]
    };

    function genPreset(preset) {
      if (preset === "reverse") return [86, 77, 68, 59, 50, 41, 32, 23, 14];
      if (preset === "nearly") return [16, 25, 34, 49, 42, 58, 67, 81, 74];
      if (preset === "equal") return [50, 50, 50, 50, 50, 50, 50, 50, 50];
      const base = [15, 24, 33, 42, 51, 60, 69, 78, 88];
      for (let i = base.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [base[i], base[j]] = [base[j], base[i]];
      }
      return base;
    }

    function recordBubble(initArr) {
      const a = initArr.slice(), n = a.length, frames = [], sorted = new Set();
      let cmp = 0, mov = 0;
      const push = (st, ptrs, lines, explain, tip, tone) => frames.push({
        arr: a.slice(), states: st, ptrs: ptrs || {}, cmp, mov, codeLines: lines, explain, tip: tip || "", tone: tone || "info",
        vars: [{ name: "比较次数", val: String(cmp) }, { name: "移动写入", val: String(mov) }]
      });
      push({}, {}, [1], "起泡排序开始：相邻两两比较，较大值不断向右冒泡！");
      for (let i = 0; i < n - 1; i++) {
        let swapped = false;
        for (let j = 0; j < n - 1 - i; j++) {
          cmp++;
          const st = {}; sorted.forEach((k) => { st[k] = "sorted"; });
          st[j] = "compare"; st[j + 1] = "compare";
          push(st, { [j]: { t: "j", c: "p-amber" }, [j + 1]: { t: "j+1", c: "p-amber" } }, [3, 4], `第 ${i + 1} 趟：比较 a[${j}]=${a[j]} 与 a[${j + 1}]=${a[j + 1]}。`);
          if (a[j] > a[j + 1]) {
            [a[j], a[j + 1]] = [a[j + 1], a[j]]; mov += 3; swapped = true;
            const st2 = {}; sorted.forEach((k) => { st2[k] = "sorted"; });
            st2[j] = "swap"; st2[j + 1] = "swap";
            push(st2, { [j]: { t: "换", c: "p-red" }, [j + 1]: { t: "换", c: "p-red" } }, [5, 6], "前者更大，交换位置！", "", "warn");
          }
        }
        sorted.add(n - 1 - i);
        const stDone = {}; sorted.forEach((k) => { stDone[k] = "sorted"; });
        if (!swapped) {
          for (let k = 0; k < n; k++) stDone[k] = "sorted";
          push(stDone, {}, [9], "🚀 优化生效！本趟 0 次交换，已有序，立刻 break 提前收工！", "💡 在全相等或已有序数据上，时间复杂度从 O(n²) 降至 O(n)！", "good");
          return frames;
        }
        push(stDone, {}, [1], `第 ${i + 1} 趟结束，${a[n - 1 - i]} 冒泡到下标 ${n - 1 - i} 归位！`, "", "good");
      }
      const allS = {}; for (let k = 0; k < n; k++) allS[k] = "sorted";
      push(allS, {}, [10], `🎉 起泡排序完成！共比较 ${cmp} 次，移动 ${mov} 次。`, "", "good");
      return frames;
    }

    function recordInsert(initArr) {
      const a = initArr.slice(), n = a.length, frames = [];
      let cmp = 0, mov = 0;
      const push = (st, ptrs, lines, explain, vars, tip, tone) => frames.push({
        arr: a.slice(), states: st, ptrs: ptrs || {}, cmp, mov, codeLines: lines, explain, vars: vars || [], tip: tip || "", tone: tone || "info"
      });
      push({ 0: "sorted" }, {}, [1], "直接插入排序：a[0] 作为有序手牌，从 i=1 开始逐张插入！");
      for (let i = 1; i < n; i++) {
        const key = a[i]; mov++;
        const st0 = {}; for (let k = 0; k < i; k++) st0[k] = "sorted"; st0[i] = "pivot";
        push(st0, { [i]: { t: `key=${key}`, c: "p-purple" } }, [2, 3], `摸起新牌 key = ${key}，向左寻找插入点。`, [{ name: "i", val: String(i) }, { name: "key", val: String(key), tone: "purple" }]);
        let j = i - 1;
        while (j >= 0) {
          cmp++;
          const stC = {}; for (let k = 0; k < i; k++) stC[k] = "sorted"; stC[j] = "compare";
          push(stC, { [j]: { t: "j", c: "p-amber" } }, [4], `比较 a[${j}]=${a[j]} 与 key=${key}：${a[j] > key ? "更大，右移腾位！" : "找到落脚点！"}`, [{ name: "key", val: String(key), tone: "purple" }, { name: "j", val: String(j), tone: "amber" }]);
          if (a[j] > key) {
            a[j + 1] = a[j]; mov++;
            const stM = {}; for (let k = 0; k <= i; k++) stM[k] = "sorted"; stM[j + 1] = "swap";
            push(stM, { [j + 1]: { t: "右移", c: "p-red" } }, [5, 6], `a[${j}]=${a[j]} 右移到下标 ${j + 1}。`, [], "", "warn");
            j--;
          } else break;
        }
        a[j + 1] = key; mov++;
        const stIns = {}; for (let k = 0; k <= i; k++) stIns[k] = "sorted"; stIns[j + 1] = "pivot";
        push(stIns, { [j + 1]: { t: "落位", c: "p-purple" } }, [8], `✅ key=${key} 落位于下标 ${j + 1}！`, [{ name: "有序区间", val: `[0..${i}]`, tone: "green" }], "", "good");
      }
      const allS = {}; for (let k = 0; k < n; k++) allS[k] = "sorted";
      push(allS, {}, [9], `🎉 直接插入排序完成！共比较 ${cmp} 次，移动 ${mov} 次。`, [], "", "good");
      return frames;
    }

    function recordSelect(initArr) {
      const a = initArr.slice(), n = a.length, frames = [];
      let cmp = 0, mov = 0;
      const push = (st, ptrs, lines, explain, vars, tone) => frames.push({
        arr: a.slice(), states: st, ptrs: ptrs || {}, cmp, mov, codeLines: lines, explain, vars: vars || [], tone: tone || "info"
      });
      push({}, {}, [1], "简单选择排序：每轮打擂台找最小元素，每轮最多交换 1 次！");
      for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        for (let j = i + 1; j < n; j++) {
          cmp++;
          const st = {}; for (let k = 0; k < i; k++) st[k] = "sorted";
          st[minIdx] = "pivot"; st[j] = "compare";
          const better = a[j] < a[minIdx];
          if (better) minIdx = j;
          push(st, { [minIdx]: { t: "min", c: "p-purple" }, [j]: { t: "j", c: "p-amber" } }, [3, 4],
            `第 ${i + 1} 轮 j=${j}：${better ? `新擂主 minIdx=${j}(值${a[j]})！` : `a[${j}]=${a[j]} 不小于当前最小 ${a[minIdx]}。`}`,
            [{ name: "minIdx", val: `${minIdx} (${a[minIdx]})`, tone: "purple" }]);
        }
        if (minIdx !== i) {
          [a[i], a[minIdx]] = [a[minIdx], a[i]]; mov += 3;
          const st = {}; for (let k = 0; k < i; k++) st[k] = "sorted";
          st[i] = "swap"; st[minIdx] = "swap";
          push(st, { [i]: { t: "换入", c: "p-red" }, [minIdx]: { t: "换出", c: "p-red" } }, [6], `最小元素 ${a[i]} 换到下标 ${i} 归位！`, [], "warn");
        } else {
          const st = {}; for (let k = 0; k <= i; k++) st[k] = "sorted";
          push(st, {}, [6], `a[${i}]=${a[i]} 已是剩余最小，直接归位！`, [], "good");
        }
      }
      const allS = {}; for (let k = 0; k < n; k++) allS[k] = "sorted";
      push(allS, {}, [7], `🎉 简单选择排序完成！比较恒为 ${cmp} 次，移动仅 ${mov} 次。`, [], "good");
      return frames;
    }

    function recordQuick(initArr) {
      const a = initArr.slice(), n = a.length, frames = [], fixed = new Set();
      let cmp = 0, mov = 0;
      const push = (st, ptrs, lines, explain, vars, tip, tone) => frames.push({
        arr: a.slice(), states: st, ptrs: ptrs || {}, cmp, mov, codeLines: lines, explain, vars: vars || [], tip: tip || "", tone: tone || "info"
      });
      push({}, {}, [1], "快速排序：选基准 pivot，双指针挖坑划分左右区间，递归分治！");
      function qs(l, r) {
        if (l > r) return;
        if (l === r) {
          fixed.add(l);
          const st = {}; fixed.forEach((k) => { st[k] = "sorted"; });
          push(st, {}, [2], `单元素区间 [${l}] = ${a[l]} 自然归位！`, [], "", "good");
          return;
        }
        const pivot = a[l]; mov++;
        let i = l, j = r;
        const baseSt = () => {
          const st = {};
          for (let k = 0; k < n; k++) {
            if (fixed.has(k)) st[k] = "sorted";
            else if (k < l || k > r) st[k] = "dim";
          }
          return st;
        };
        const st0 = baseSt(); st0[l] = "pivot";
        push(st0, { [i]: { t: `piv=${pivot}`, c: "p-purple" }, [j]: { t: "j", c: "p-blue" } }, [3], `分区 [${l}..${r}]：选 pivot=${pivot} 挖坑，i=${i}, j=${j}。`, [{ name: "pivot", val: String(pivot), tone: "purple" }]);
        while (i < j) {
          while (i < j) {
            cmp++;
            const st = baseSt(); st[j] = "compare"; st[i] = "pivot";
            const kg = a[j] >= pivot;
            push(st, { [i]: { t: "i(坑)", c: "p-purple" }, [j]: { t: "j", c: "p-amber" } }, [5], `右指针 j=${j}：a[${j}]=${a[j]} ${kg ? `≥ ${pivot} 左移` : `< ${pivot} 填左坑！`}`, [{ name: "pivot", val: String(pivot), tone: "purple" }]);
            if (kg) j--; else break;
          }
          if (i < j) {
            a[i] = a[j]; mov++;
            const st = baseSt(); st[i] = "swap"; st[j] = "pivot";
            push(st, { [i]: { t: "填入", c: "p-red" }, [j]: { t: "j(坑)", c: "p-purple" } }, [6], `a[${i}] = ${a[j]}，坑移到 j=${j}，i→${i + 1}。`, [], "", "warn");
            i++;
          }
          while (i < j) {
            cmp++;
            const st = baseSt(); st[i] = "compare"; st[j] = "pivot";
            const kg = a[i] <= pivot;
            push(st, { [i]: { t: "i", c: "p-amber" }, [j]: { t: "j(坑)", c: "p-purple" } }, [7], `左指针 i=${i}：a[${i}]=${a[i]} ${kg ? `≤ ${pivot} 右移` : `> ${pivot} 填右坑！`}`, [{ name: "pivot", val: String(pivot), tone: "purple" }]);
            if (kg) i++; else break;
          }
          if (i < j) {
            a[j] = a[i]; mov++;
            const st = baseSt(); st[j] = "swap"; st[i] = "pivot";
            push(st, { [i]: { t: "i(坑)", c: "p-purple" }, [j]: { t: "填入", c: "p-red" } }, [8], `a[${j}] = ${a[i]}，坑移到 i=${i}，j→${j - 1}。`, [], "", "warn");
            j--;
          }
        }
        a[i] = pivot; mov++; fixed.add(i);
        const stFin = baseSt(); stFin[i] = "sorted";
        push(stFin, { [i]: { t: `piv=${pivot}归位`, c: "p-purple" } }, [10], `✅ i==j==${i}，pivot=${pivot} 永久归位！`, [{ name: "归位", val: String(i), tone: "green" }], "💡 在逆序/全相等数据上选最左作基准会退化为 O(n²)，工程常用三数取中/随机基准！", "good");
        qs(l, i - 1); qs(i + 1, r);
      }
      qs(0, n - 1);
      const allS = {}; for (let k = 0; k < n; k++) allS[k] = "sorted";
      push(allS, {}, [12], `🎉 快速排序完成！共比较 ${cmp} 次，移动 ${mov} 次。`, [], "", "good");
      return frames;
    }

    function recordHeap(initArr) {
      const a = initArr.slice(), n = a.length, frames = [];
      let cmp = 0, mov = 0, heapSize = n;
      const push = (st, ptrs, lines, explain, vars, tip, tone) => frames.push({
        arr: a.slice(), states: st, ptrs: ptrs || {}, cmp, mov, heapSize, isHeap: true,
        codeLines: lines, explain, vars: vars || [], tip: tip || "", tone: tone || "info"
      });
      const mkBase = () => { const st = {}; for (let k = heapSize; k < n; k++) st[k] = "sorted"; return st; };
      push({}, {}, [1], "堆排序（柱状图 + 完全二叉树双视图）：父 i 的左右孩子为 2i+1 与 2i+2！先建大顶堆。", [{ name: "heapSize", val: String(heapSize), tone: "blue" }]);
      function siftDown(size, i, phase) {
        while (true) {
          let largest = i;
          const l = 2 * i + 1, r = 2 * i + 2;
          const stC = mkBase(); stC[i] = "pivot";
          if (l < size) { cmp++; stC[l] = "compare"; if (a[l] > a[largest]) largest = l; }
          if (r < size) { cmp++; stC[r] = "compare"; if (a[r] > a[largest]) largest = r; }
          const ptrs = { [i]: { t: "父", c: "p-purple" } };
          if (l < size) ptrs[l] = { t: "左", c: "p-amber" };
          if (r < size) ptrs[r] = { t: "右", c: "p-amber" };
          push(stC, ptrs, [phase === "build" ? 2 : 6, 8], `${phase === "build" ? "【建堆下滤】" : "【修复下滤】"}节点 [${i}]=${a[i]} 与孩子比较，最大在 [${largest}]=${a[largest]}。`, [{ name: "heapSize", val: String(size), tone: "blue" }]);
          if (largest !== i) {
            [a[i], a[largest]] = [a[largest], a[i]]; mov += 3;
            const stS = mkBase(); stS[i] = "swap"; stS[largest] = "swap";
            push(stS, { [i]: { t: "上浮", c: "p-red" }, [largest]: { t: "下沉", c: "p-red" } }, [8], `交换 a[${i}] 与 a[${largest}]，继续下滤！`, [], "", "warn");
            i = largest;
          } else break;
        }
      }
      for (let i = Math.floor(n / 2) - 1; i >= 0; i--) siftDown(n, i, "build");
      const stB = mkBase(); stB[0] = "pivot";
      push(stB, { 0: { t: "堆顶最大!", c: "p-purple" } }, [3], `✅ 大顶堆建好！堆顶 a[0]=${a[0]} 为全数组最大值。`, [], "", "good");
      for (let end = n - 1; end > 0; end--) {
        [a[0], a[end]] = [a[end], a[0]]; mov += 3;
        const stSw = mkBase(); stSw[0] = "swap"; stSw[end] = "swap";
        push(stSw, { 0: { t: "新顶", c: "p-red" }, [end]: { t: "最大归位", c: "p-red" } }, [5], `堆顶换到末尾 a[${end}]=${a[end]} 归位，heapSize 缩为 ${end}！`, [{ name: "heapSize", val: String(end), tone: "green" }], "", "good");
        heapSize = end;
        siftDown(heapSize, 0, "extract");
      }
      heapSize = 0;
      const allS = {}; for (let k = 0; k < n; k++) allS[k] = "sorted";
      push(allS, {}, [7], `🎉 堆排序完成！恒定 O(n log n)，原地 O(1) 空间！`, [], "", "good");
      return frames;
    }

    function recordMerge(initArr) {
      const a = initArr.slice(), n = a.length, frames = [];
      let cmp = 0, mov = 0;
      const push = (st, ptrs, lines, explain, aux, vars, tone) => frames.push({
        arr: a.slice(), states: st, ptrs: ptrs || {}, cmp, mov, mergeAux: aux || null,
        codeLines: lines, explain, vars: vars || [], tone: tone || "info"
      });
      push({}, {}, [1], "二路归并排序：对半拆分后，双指针有序合并到辅助数组 tmp[] 再拷回！");
      function ms(l, r) {
        if (l >= r) return;
        const mid = l + Math.floor((r - l) / 2);
        ms(l, mid); ms(mid + 1, r);
        const tmp = [];
        let i = l, j = mid + 1;
        const baseSt = () => { const st = {}; for (let k = 0; k < n; k++) if (k < l || k > r) st[k] = "dim"; return st; };
        push(baseSt(), { [l]: { t: "l", c: "p-blue" }, [mid]: { t: "mid", c: "p-purple" }, [r]: { t: "r", c: "p-blue" } }, [5], `合并有序区间 [${l}..${mid}] 与 [${mid + 1}..${r}]！`, { range: `[${l}..${r}]`, items: [] });
        while (i <= mid && j <= r) {
          cmp++;
          const takeL = a[i] <= a[j];
          const st = baseSt(); st[i] = "compare"; st[j] = "compare";
          tmp.push(takeL ? a[i] : a[j]); mov++;
          push(st, { [i]: { t: "i", c: "p-amber" }, [j]: { t: "j", c: "p-amber" } }, [6, 7], `比较 a[${i}]=${a[i]} 与 a[${j}]=${a[j]}，取 ${takeL ? a[i] : a[j]} 入 tmp[]（相等优先取左保稳定）。`, { range: `[${l}..${r}]`, items: tmp.slice() });
          if (takeL) i++; else j++;
        }
        while (i <= mid) { tmp.push(a[i]); mov++; const st = baseSt(); st[i] = "pivot"; push(st, { [i]: { t: "剩i", c: "p-purple" } }, [8], `左半区剩余 ${a[i]} 写入 tmp[]。`, { range: `[${l}..${r}]`, items: tmp.slice() }); i++; }
        while (j <= r) { tmp.push(a[j]); mov++; const st = baseSt(); st[j] = "pivot"; push(st, { [j]: { t: "剩j", c: "p-purple" } }, [9], `右半区剩余 ${a[j]} 写入 tmp[]。`, { range: `[${l}..${r}]`, items: tmp.slice() }); j++; }
        for (let t = 0; t < tmp.length; t++) { a[l + t] = tmp[t]; mov++; }
        const stD = baseSt(); for (let k = l; k <= r; k++) stD[k] = "sorted";
        push(stD, {}, [10], `✅ tmp[] 拷回原数组 a[${l}..${r}]！`, { range: `[${l}..${r}]`, items: tmp.slice() }, [], "good");
      }
      ms(0, n - 1);
      const allS = {}; for (let k = 0; k < n; k++) allS[k] = "sorted";
      push(allS, {}, [11], `🎉 归并排序完成！稳定 O(n log n)，共比较 ${cmp} 次，写入 ${mov} 次。`, null, [], "good");
      return frames;
    }

    function renderHeapTreeSvg(frame) {
      const a = frame.arr, n = a.length, W = 540, H = 205;
      const coords = [
        { x: 270, y: 30 }, { x: 140, y: 84 }, { x: 400, y: 84 },
        { x: 75, y: 138 }, { x: 205, y: 138 }, { x: 335, y: 138 }, { x: 465, y: 138 },
        { x: 42, y: 184 }, { x: 108, y: 184 }
      ];
      let edges = "", nodes = "";
      for (let i = 1; i < n && i < coords.length; i++) {
        const p = Math.floor((i - 1) / 2), inHeap = i < frame.heapSize;
        edges += `<line x1="${coords[p].x}" y1="${coords[p].y}" x2="${coords[i].x}" y2="${coords[i].y}" stroke="${inHeap ? '#94a3b8' : 'var(--dsv-edge)'}" stroke-width="${inHeap ? 2.2 : 1.5}" ${inHeap ? "" : 'stroke-dasharray="4,3"'}/>`;
      }
      for (let i = 0; i < n && i < coords.length; i++) {
        const { x, y } = coords[i], st = frame.states[i] || "default", inHeap = i < frame.heapSize;
        let fill = "#eff6ff", stroke = "#3b82f6", txt = "#1e3a8a";
        if (!inHeap || st === "sorted") { fill = "#ecfdf5"; stroke = "#10b981"; txt = "#065f46"; }
        if (st === "compare") { fill = "#fef3c7"; stroke = "#d97706"; txt = "#92400e"; }
        if (st === "swap") { fill = "#fee2e2"; stroke = "#dc2626"; txt = "#991b1b"; }
        if (st === "pivot") { fill = "#f5f3ff"; stroke = "#7c3aed"; txt = "#5b21b6"; }
        nodes += `
          <g opacity="${inHeap || st === "swap" ? 1 : 0.72}">
            <circle cx="${x}" cy="${y}" r="18" fill="${fill}" stroke="${stroke}" stroke-width="2.4"/>
            <text x="${x}" y="${y + 5}" text-anchor="middle" font-family="monospace" font-size="13" font-weight="800" fill="${txt}">${a[i]}</text>
            <text x="${x + 22}" y="${y - 10}" font-family="monospace" font-size="10" font-weight="700" fill="var(--dsv-svg-muted)">[${i}]</text>
          </g>`;
      }
      return `
        <div style="font-size:12px;font-weight:700;color:var(--dsv-text-sub);margin:10px 0 6px 0;">🌳 同步完全二叉树大顶堆（有效 heapSize = ${frame.heapSize}，虚线已归位）</div>
        <div class="dsv-svg-stage"><svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${edges}${nodes}</svg></div>`;
    }

    function mount(paneEl, uid, onInteract) {
      paneEl.innerHTML = `
        <div class="dsv-toolbar">
          <div class="dsv-toolbar-row">
            <div class="dsv-pill-group" data-role="algos">
              <span class="dsv-lbl">排序算法：</span>
              <button type="button" class="dsv-btn active" data-algo="bubble">冒泡(优化)</button>
              <button type="button" class="dsv-btn" data-algo="insert">直接插入</button>
              <button type="button" class="dsv-btn" data-algo="select">简单选择</button>
              <button type="button" class="dsv-btn" data-algo="quick">快速排序</button>
              <button type="button" class="dsv-btn" data-algo="heap">堆排序(双视图)</button>
              <button type="button" class="dsv-btn" data-algo="merge">归并排序</button>
            </div>
            <div class="dsv-pill-group" data-role="presets">
              <span class="dsv-lbl">数据分布：</span>
              <button type="button" class="dsv-btn dsv-btn-sm active" data-preset="random">🎲 随机</button>
              <button type="button" class="dsv-btn dsv-btn-sm" data-preset="reverse">📉 逆序</button>
              <button type="button" class="dsv-btn dsv-btn-sm" data-preset="nearly">📈 近乎有序</button>
              <button type="button" class="dsv-btn dsv-btn-sm" data-preset="equal">🟰 全相等</button>
            </div>
          </div>
          <div class="dsv-player-bar" data-role="player"></div>
        </div>
        <div class="dsv-grid">
          <div class="dsv-col">
            <div class="dsv-card">
              <div class="dsv-card-head">
                <span class="dsv-card-title" data-role="stageTitle">排序动画柱状图</span>
                <div class="dsv-legend">
                  <span class="dsv-legend-item"><span class="dsv-dot" style="background:#3b82f6"></span>未排</span>
                  <span class="dsv-legend-item"><span class="dsv-dot" style="background:#d97706"></span>比较</span>
                  <span class="dsv-legend-item"><span class="dsv-dot" style="background:#dc2626"></span>交换/写</span>
                  <span class="dsv-legend-item"><span class="dsv-dot" style="background:#7c3aed"></span>基准</span>
                  <span class="dsv-legend-item"><span class="dsv-dot" style="background:#059669"></span>归位</span>
                </div>
              </div>
              <div class="dsv-card-body">
                <div class="dsv-bars" data-role="bars"></div>
                <div data-role="extra"></div>
              </div>
            </div>
            <div class="dsv-explain" data-role="explain"></div>
          </div>
          <div class="dsv-col">
            <div class="dsv-card">
              <div class="dsv-card-head"><span class="dsv-card-title">📈 性能计数器与算法画像</span></div>
              <div class="dsv-card-body">
                <div class="dsv-metrics" data-role="metrics"></div>
                <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px;" data-role="profile"></div>
                <div class="dsv-vars" style="margin-top:10px;" data-role="vars"></div>
              </div>
            </div>
            <div class="dsv-card">
              <div class="dsv-card-head">
                <span class="dsv-card-title">💻 同步 C++ 核心排序代码</span>
                <span class="dsv-tag dsv-tag-blue" data-role="codeTag">BubbleSort.cpp</span>
              </div>
              <div class="dsv-code" data-role="code"></div>
            </div>
          </div>
        </div>
      `;

      let currentAlgo = "bubble", currentPreset = "random", currentData = genPreset("random");
      const barsEl = paneEl.querySelector('[data-role="bars"]');
      const extraEl = paneEl.querySelector('[data-role="extra"]');
      const stageTitleEl = paneEl.querySelector('[data-role="stageTitle"]');
      const metricsEl = paneEl.querySelector('[data-role="metrics"]');
      const profileEl = paneEl.querySelector('[data-role="profile"]');
      const varsEl = paneEl.querySelector('[data-role="vars"]');
      const expEl = paneEl.querySelector('[data-role="explain"]');
      const codeEl = paneEl.querySelector('[data-role="code"]');
      const codeTagEl = paneEl.querySelector('[data-role="codeTag"]');
      const algoBtns = paneEl.querySelectorAll('[data-role="algos"] .dsv-btn');
      const presetBtns = paneEl.querySelectorAll('[data-role="presets"] .dsv-btn');

      const player = new FramePlayer(
        paneEl.querySelector('[data-role="player"]'),
        (frame) => {
          const a = frame.arr, maxVal = Math.max(100, ...a);
          barsEl.innerHTML = a.map((val, i) => {
            const st = frame.states[i] || "default";
            const hPct = Math.max(16, Math.round((val / maxVal) * 100));
            const ptr = frame.ptrs && frame.ptrs[i];
            return `<div class="dsv-bar-col">${ptr ? `<div class="dsv-bar-ptr ${ptr.c}">${escHtml(ptr.t)}</div>` : ""}<div class="dsv-bar-rect st-${st}" style="height:${hPct}%">${val}</div><div class="dsv-bar-idx">[${i}]</div></div>`;
          }).join("");

          if (frame.isHeap) extraEl.innerHTML = renderHeapTreeSvg(frame);
          else if (frame.mergeAux) {
            const cells = frame.mergeAux.items.length
              ? frame.mergeAux.items.map((v) => `<div class="dsv-merge-cell">${v}</div>`).join("")
              : '<span class="dsv-empty">等待写入…</span>';
            extraEl.innerHTML = `<div class="dsv-merge-aux"><span style="font-size:12px;font-weight:700;color:var(--dsv-purple);">辅助数组 tmp[] (${escHtml(frame.mergeAux.range)})：</span>${cells}</div>`;
          } else extraEl.innerHTML = "";

          metricsEl.innerHTML = `
            <div class="dsv-metric"><div class="dsv-metric-lbl">比较次数</div><div class="dsv-metric-val" style="color:var(--dsv-amber)">${frame.cmp}</div></div>
            <div class="dsv-metric"><div class="dsv-metric-lbl">移动 / 写入</div><div class="dsv-metric-val" style="color:var(--dsv-red)">${frame.mov}</div></div>
            <div class="dsv-metric"><div class="dsv-metric-lbl">数组长度 n</div><div class="dsv-metric-val" style="color:var(--dsv-blue)">${a.length}</div></div>`;
          const prof = PROFILES[currentAlgo];
          profileEl.innerHTML = `
            <span class="dsv-tag dsv-tag-blue">时间: ${prof.time}</span>
            <span class="dsv-tag dsv-tag-slate">空间: ${prof.space}</span>
            <span class="dsv-tag ${prof.stable === "稳定" ? "dsv-tag-green" : "dsv-tag-amber"}">${prof.stable}排序</span>`;
          renderVars(varsEl, frame.vars);
          renderExplain(expEl, frame);
          renderCode(codeEl, CODES[currentAlgo], frame.codeLines, false);
        },
        600,
        onInteract
      );

      function rebuild(regenData = false) {
        if (regenData) currentData = genPreset(currentPreset);
        algoBtns.forEach((b) => b.classList.toggle("active", b.dataset.algo === currentAlgo));
        presetBtns.forEach((b) => b.classList.toggle("active", b.dataset.preset === currentPreset));
        const prof = PROFILES[currentAlgo];
        stageTitleEl.textContent = `${prof.name} · 动态柱状图`;
        codeTagEl.textContent = prof.tag;
        const frames =
          currentAlgo === "bubble" ? recordBubble(currentData) :
          currentAlgo === "insert" ? recordInsert(currentData) :
          currentAlgo === "select" ? recordSelect(currentData) :
          currentAlgo === "quick" ? recordQuick(currentData) :
          currentAlgo === "heap" ? recordHeap(currentData) :
          recordMerge(currentData);
        player.setFrames(frames, false, 0);
      }

      algoBtns.forEach((b) => b.addEventListener("click", () => { onInteract(); currentAlgo = b.dataset.algo; rebuild(false); }));
      presetBtns.forEach((b) => b.addEventListener("click", () => { onInteract(); currentPreset = b.dataset.preset; rebuild(true); }));
      rebuild(false);
      return { player, destroy: () => player.destroy() };
    }

    return { mount, genPreset, recordBubble, recordInsert, recordSelect, recordQuick, recordHeap, recordMerge };
  })();

  /* ==========================================================================
   * 12. 主挂载器：DSVisualizers.mount(containerEl, initialTab)
   * ========================================================================== */
  const MOD_MAP = {
    linkedlist: LinkedListMod,
    queue: QueueMod,
    kmp: KmpMod,
    tree: TreeMod,
    huffman: HuffmanMod,
    graph: GraphMod,
    bst: BstMod,
    sort: SortMod
  };

  function mount(containerEl, initialTab) {
    if (!containerEl) return null;
    injectStyles();

    // Clean up any previous mount on this container
    if (containerEl._dsvController && typeof containerEl._dsvController.destroy === "function") {
      containerEl._dsvController.destroy();
    }

    const uid = "dsv" + (++instanceCounter);
    const validInitial = MOD_MAP[initialTab] ? initialTab : TABS[0].id;
    let activeTab = validInitial;
    let currentSub = null;
    let destroyed = false;

    const root = document.createElement("div");
    root.className = "dsv-root";
    root.innerHTML = `
      <div class="dsv-nav-wrap">
        <div class="dsv-nav-head">
          <div class="dsv-nav-title">🎬 8 大数据结构交互式动画实验室</div>
          <div class="dsv-kbd-hints">
            快捷键：<span class="dsv-kbd">←</span> 上一步 <span class="dsv-kbd">→</span> 下一步 <span class="dsv-kbd">Space</span> 播放/暂停
          </div>
        </div>
        <div class="dsv-tab-bar" data-role="tabBar">
          ${TABS.map(
            (t) =>
              `<button type="button" class="dsv-tab-btn${t.id === validInitial ? " active" : ""}" data-tab="${t.id}">${t.icon} ${escHtml(t.title)} <span class="dsv-tab-ch">第${Number(t.chapterId)}章</span></button>`
          ).join("")}
        </div>
        <div class="dsv-tab-desc" data-role="tabDesc"></div>
      </div>
      <div data-role="stageHost"></div>
    `;

    containerEl.innerHTML = "";
    containerEl.appendChild(root);

    const tabBar = root.querySelector('[data-role="tabBar"]');
    const tabDesc = root.querySelector('[data-role="tabDesc"]');
    const stageHost = root.querySelector('[data-role="stageHost"]');
    const tabBtns = tabBar.querySelectorAll(".dsv-tab-btn");

    function switchTab(tabId) {
      if (destroyed || !MOD_MAP[tabId]) return;
      if (currentSub && typeof currentSub.destroy === "function") {
        currentSub.destroy();
        currentSub = null;
      }
      activeTab = tabId;
      tabBtns.forEach((b) => b.classList.toggle("active", b.dataset.tab === tabId));
      const meta = TABS.find((t) => t.id === tabId);
      if (meta) {
        tabDesc.innerHTML = `<span>${meta.icon} <strong>${escHtml(meta.title)}</strong>：${escHtml(meta.desc)}</span><span class="dsv-tag dsv-tag-blue">第 ${Number(meta.chapterId)} 章核心动画</span>`;
      }
      stageHost.innerHTML = "";
      const pane = document.createElement("div");
      stageHost.appendChild(pane);
      notifyVisited(tabId);
      currentSub = MOD_MAP[tabId].mount(pane, uid + "-" + tabId, () => notifyVisited(tabId));
    }

    tabBtns.forEach((b) => b.addEventListener("click", () => switchTab(b.dataset.tab)));

    function onKeyDown(e) {
      if (destroyed || !containerEl.isConnected) {
        destroy();
        return;
      }
      if (root.offsetParent === null) return; // hidden tab/view in SPA
      const tag = ((e.target && e.target.tagName) || "").toUpperCase();
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (!currentSub || !currentSub.player) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        notifyVisited(activeTab);
        currentSub.player.prev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        notifyVisited(activeTab);
        currentSub.player.next();
      } else if (e.key === " ") {
        e.preventDefault();
        notifyVisited(activeTab);
        currentSub.player.togglePlay();
      }
    }

    if (typeof document !== "undefined") {
      document.addEventListener("keydown", onKeyDown);
    }

    function destroy() {
      if (destroyed) return;
      destroyed = true;
      if (currentSub && typeof currentSub.destroy === "function") {
        currentSub.destroy();
        currentSub = null;
      }
      if (typeof document !== "undefined") {
        document.removeEventListener("keydown", onKeyDown);
      }
      if (containerEl._dsvController === controller) {
        delete containerEl._dsvController;
      }
    }

    const controller = { switchTab, destroy, getActiveTab: () => activeTab };
    containerEl._dsvController = controller;
    switchTab(validInitial);
    return controller;
  }

  /* ==========================================================================
   * 13. 大 O 复杂度增长对比实验室：DSVisualizers.mountComplexityChart(containerEl)
   * ========================================================================== */
  const COMPLEXITY_CLASSES = [
    { id: "o1",     label: "O(1)",       name: "常数阶",   color: "#059669", rating: "极速",  fn: () => 1,                   example: "数组下标访问 / 哈希查找" },
    { id: "ologn",  label: "O(log n)",   name: "对数阶",   color: "#0ea5e9", rating: "飞快",  fn: (n) => Math.log2(Math.max(1, n)), example: "折半查找 / BST 平衡查询" },
    { id: "on",     label: "O(n)",       name: "线性阶",   color: "#2563eb", rating: "优秀",  fn: (n) => n,                   example: "单层遍历 / KMP 匹配" },
    { id: "onlogn", label: "O(n log n)", name: "线性对数", color: "#7c3aed", rating: "良好",  fn: (n) => n * Math.log2(Math.max(1, n)), example: "快排 / 堆排 / 归并排序" },
    { id: "on2",    label: "O(n²)",      name: "平方阶",   color: "#d97706", rating: "较慢",  fn: (n) => n * n,               example: "冒泡/插入/选择排序" },
    { id: "o2n",    label: "O(2ⁿ)",      name: "指数阶",   color: "#dc2626", rating: "爆炸💥", fn: (n) => (n > 1000 ? Infinity : Math.pow(2, n)), example: "暴力子集枚举 / 朴素斐波那契" }
  ];

  function formatOpsAndTime(id, n) {
    // CPU benchmark: 10^8 ops / sec
    const OPS_PER_SEC = 1e8;
    let ops = 0;
    let opsStr = "";
    let log10Ops = 0;

    if (id === "o2n" && n > 60) {
      log10Ops = n * Math.LOG10E * Math.LN2;
      opsStr = `≈ 10^${Math.round(log10Ops).toLocaleString()}`;
      return {
        ops: Infinity,
        opsStr,
        log10Ops,
        timeStr: `> 10^${Math.max(1, Math.round(log10Ops - 15)).toLocaleString()} 年`,
        metaphor: "🌌 宇宙热寂都算不完！",
        verdict: "💥 彻底爆炸",
        verdictTone: "red"
      };
    }

    const cls = COMPLEXITY_CLASSES.find((c) => c.id === id);
    ops = cls ? cls.fn(n) : 1;
    log10Ops = ops > 0 ? Math.log10(ops) : 0;

    if (ops < 1000) opsStr = ops % 1 === 0 ? String(ops) : ops.toFixed(1);
    else if (ops < 1e9) opsStr = Math.round(ops).toLocaleString();
    else opsStr = ops.toExponential(2);

    const sec = ops / OPS_PER_SEC;
    let timeStr = "", metaphor = "", verdict = "✅ 毫秒稳过", verdictTone = "green";

    if (sec < 1e-6) { timeStr = `${(sec * 1e9).toFixed(0)} ns`; metaphor = "⚡ 瞬间完成（纳秒级）"; }
    else if (sec < 1e-3) { timeStr = `${(sec * 1e6).toFixed(1)} μs`; metaphor = "⚡ 瞬间完成（微秒级）"; }
    else if (sec < 0.05) { timeStr = `${(sec * 1e3).toFixed(2)} ms`; metaphor = "👁️ 眨眼间（比眨眼快 10 倍）"; }
    else if (sec < 1) { timeStr = `${(sec * 1e3).toFixed(0)} ms`; metaphor = "👁️ 刚一眨眼（< 1 秒）"; }
    else if (sec < 60) { timeStr = `${sec.toFixed(1)} 秒`; metaphor = "☕ 喝一口水的功夫"; verdict = "⚠️ 接近 1s 时限"; verdictTone = "amber"; }
    else if (sec < 3600) { timeStr = `${(sec / 60).toFixed(1)} 分钟`; metaphor = "🍜 泡一碗泡面的时间"; verdict = "❌ 必然 TLE 超时"; verdictTone = "red"; }
    else if (sec < 86400) { timeStr = `${(sec / 3600).toFixed(1)} 小时`; metaphor = "😴 睡一大觉还算不完"; verdict = "❌ 必然 TLE 超时"; verdictTone = "red"; }
    else if (sec < 3.15e7) { timeStr = `${(sec / 86400).toFixed(1)} 天`; metaphor = "📅 要连着算好几天"; verdict = "💥 严重超时"; verdictTone = "red"; }
    else if (sec < 3.15e16) { timeStr = `${(sec / 3.15e7).toExponential(1)} 年`; metaphor = "🦖 从恐龙灭绝算到现在"; verdict = "💥 彻底不可行"; verdictTone = "red"; }
    else { timeStr = `${(sec / 3.15e7).toExponential(1)} 年`; metaphor = "🌌 超过宇宙年龄 / 热寂！"; verdict = "💥 彻底爆炸"; verdictTone = "red"; }

    return { ops, opsStr, log10Ops, timeStr, metaphor, verdict, verdictTone };
  }

  function mountComplexityChart(containerEl) {
    if (!containerEl) return null;
    injectStyles();

    const root = document.createElement("div");
    root.className = "dsv-cx-root";
    root.innerHTML = `
      <div class="dsv-cx-card">
        <div class="dsv-cx-head">
          <div class="dsv-card-title">📈 大 O 时间复杂度增长对比实验室（第 1 章）</div>
          <div class="dsv-pill-group" data-role="cxMode">
            <button type="button" class="dsv-btn dsv-btn-sm active" data-mode="curve">📊 曲线探索（n = 1 ~ 100）</button>
            <button type="button" class="dsv-btn dsv-btn-sm" data-mode="big">🚀 大数推演（n = 10³ ~ 10⁶ 耗时估算）</button>
          </div>
        </div>
        <div class="dsv-cx-body" data-role="cxBody"></div>
      </div>
    `;
    containerEl.innerHTML = "";
    containerEl.appendChild(root);

    let mode = "curve";
    let curN = 20;
    let yScale = "auto"; // "auto" | "log"
    let bigN = 100000;
    const enabled = new Set(COMPLEXITY_CLASSES.map((c) => c.id));

    const bodyEl = root.querySelector('[data-role="cxBody"]');
    const modeBtns = root.querySelectorAll('[data-role="cxMode"] .dsv-btn');

    function renderCurveView() {
      const W = 680, H = 290;
      const pad = { l: 54, r: 22, t: 22, b: 38 };
      const cw = W - pad.l - pad.r;
      const ch = H - pad.t - pad.b;

      const maxLinearY = Math.max(100, curN * curN * 1.15);
      const maxLogY = Math.max(3, Math.min(31, Math.log10(Math.max(10, Math.pow(2, curN)))));

      const xOf = (x) => pad.l + ((x - 1) / 99) * cw;
      const yOf = (val) => {
        if (yScale === "log") {
          const lv = Math.log10(Math.max(1, val));
          const ratio = Math.min(1, lv / maxLogY);
          return pad.t + ch * (1 - ratio);
        }
        const ratio = Math.min(1.04, val / maxLinearY);
        return pad.t + ch * (1 - Math.min(1, ratio));
      };

      // Grid lines
      let grid = "";
      for (let i = 0; i <= 4; i++) {
        const y = pad.t + (ch * i) / 4;
        const frac = 1 - i / 4;
        const lbl = yScale === "log"
          ? `10^${(frac * maxLogY).toFixed(0)}`
          : Math.round(frac * maxLinearY).toLocaleString();
        grid += `<line x1="${pad.l}" y1="${y}" x2="${W - pad.r}" y2="${y}" stroke="var(--dsv-border)" stroke-width="1" stroke-dasharray="4,3"/>`;
        grid += `<text x="${pad.l - 7}" y="${y + 4}" text-anchor="end" font-family="monospace" font-size="10.5" fill="var(--dsv-svg-muted)">${lbl}</text>`;
      }
      for (const tick of [1, 20, 40, 60, 80, 100]) {
        const tx = xOf(tick);
        grid += `<line x1="${tx}" y1="${pad.t}" x2="${tx}" y2="${H - pad.b}" stroke="var(--dsv-border)" stroke-width="1" opacity="0.5"/>`;
        grid += `<text x="${tx}" y="${H - pad.b + 16}" text-anchor="middle" font-family="monospace" font-size="10.5" fill="var(--dsv-svg-muted)">${tick}</text>`;
      }
      grid += `<text x="${W / 2}" y="${H - 4}" text-anchor="middle" font-size="11.5" font-weight="700" fill="var(--dsv-svg-label)">数据规模 n（当前 n = ${curN}）</text>`;

      // Curves
      let paths = "";
      let dots = "";
      const cxN = xOf(curN);
      paths += `<line x1="${cxN}" y1="${pad.t}" x2="${cxN}" y2="${H - pad.b}" stroke="#2563eb" stroke-width="1.6" stroke-dasharray="4,3" opacity="0.75"/>`;

      COMPLEXITY_CLASSES.forEach((cls) => {
        if (!enabled.has(cls.id)) return;
        const pts = [];
        for (let x = 1; x <= 100; x++) {
          const val = cls.fn(x);
          if (yScale === "auto" && val > maxLinearY * 1.08) {
            // Clip smoothly at top boundary
            pts.push(`${xOf(x).toFixed(1)},${pad.t.toFixed(1)}`);
            break;
          }
          pts.push(`${xOf(x).toFixed(1)},${yOf(val).toFixed(1)}`);
        }
        if (pts.length > 1) {
          paths += `<polyline fill="none" stroke="${cls.color}" stroke-width="2.6" stroke-linejoin="round" points="${pts.join(" ")}"/>`;
        }
        const curVal = cls.fn(curN);
        const clipped = yScale === "auto" && curVal > maxLinearY;
        const cy = clipped ? pad.t : yOf(curVal);
        dots += `<circle cx="${cxN}" cy="${cy}" r="4.8" fill="${cls.color}" stroke="#ffffff" stroke-width="1.8"/>`;
      });

      const svgHtml = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${grid}${paths}${dots}</svg>`;

      const cardsHtml = COMPLEXITY_CLASSES.map((cls) => {
        const info = formatOpsAndTime(cls.id, curN);
        const isOn = enabled.has(cls.id);
        return `
          <div class="dsv-cx-stat" style="--cx-c:${cls.color};opacity:${isOn ? 1 : 0.4}">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span class="dsv-cx-stat-fn">${cls.label}</span>
              <span style="font-size:11px;color:var(--dsv-text-muted)">${cls.name}</span>
            </div>
            <div class="dsv-cx-stat-ops">${escHtml(info.opsStr)} 次</div>
            <div class="dsv-cx-stat-meta">${escHtml(info.metaphor)}</div>
            <div style="font-size:11px;color:var(--dsv-text-muted);margin-top:3px;">例：${escHtml(cls.example)}</div>
          </div>`;
      }).join("");

      bodyEl.innerHTML = `
        <div class="dsv-cx-controls">
          <div class="dsv-cx-slider-box">
            <span class="dsv-lbl">拖动规模 n：</span>
            <input type="range" min="1" max="100" step="1" value="${curN}" data-role="nSlider" />
            <span class="dsv-cx-n-badge">n = ${curN}</span>
          </div>
          <div class="dsv-pill-group" data-role="yModes">
            <button type="button" class="dsv-btn dsv-btn-sm${yScale === "auto" ? " active" : ""}" data-y="auto">线性坐标（看 2ⁿ 冲顶）</button>
            <button type="button" class="dsv-btn dsv-btn-sm${yScale === "log" ? " active" : ""}" data-y="log">对数坐标 log₁₀（全览）</button>
          </div>
        </div>
        <div class="dsv-pill-group" style="margin-bottom:10px;" data-role="toggles">
          <span class="dsv-lbl">曲线开关：</span>
          ${COMPLEXITY_CLASSES.map(
            (c) => `<button type="button" class="dsv-btn dsv-btn-sm${enabled.has(c.id) ? " active" : ""}" data-cid="${c.id}" style="${enabled.has(c.id) ? `background:${c.color};border-color:${c.color};color:#fff` : ""}">${c.label}</button>`
          ).join("")}
        </div>
        <div class="dsv-svg-stage">${svgHtml}</div>
        <div class="dsv-cx-cards">${cardsHtml}</div>
      `;

      bodyEl.querySelector('[data-role="nSlider"]').addEventListener("input", (e) => {
        curN = Number(e.target.value);
        renderCurveView();
      });
      bodyEl.querySelectorAll('[data-role="yModes"] .dsv-btn').forEach((b) =>
        b.addEventListener("click", () => {
          yScale = b.dataset.y;
          renderCurveView();
        })
      );
      bodyEl.querySelectorAll('[data-role="toggles"] .dsv-btn').forEach((b) =>
        b.addEventListener("click", () => {
          const cid = b.dataset.cid;
          if (enabled.has(cid) && enabled.size > 1) enabled.delete(cid);
          else enabled.add(cid);
          renderCurveView();
        })
      );
    }

    function renderBigView() {
      const presets = [
        { n: 100, label: "n = 100" },
        { n: 1000, label: "n = 10³ (千)" },
        { n: 10000, label: "n = 10⁴ (万)" },
        { n: 100000, label: "n = 10⁵ (十万)" },
        { n: 1000000, label: "n = 10⁶ (百万)" }
      ];

      const rows = COMPLEXITY_CLASSES.map((cls) => {
        const info = formatOpsAndTime(cls.id, bigN);
        const barPct = Math.min(100, Math.max(4, (Math.min(18, info.log10Ops) / 18) * 100));
        return `
          <tr>
            <td style="text-align:left"><strong style="color:${cls.color}">${cls.label}</strong> <span style="font-size:11px;color:var(--dsv-text-muted)">(${cls.name})</span></td>
            <td><strong>${escHtml(info.opsStr)}</strong></td>
            <td><div class="dsv-cx-bar-track"><div class="dsv-cx-bar-fill" style="width:${barPct}%;background:${cls.color}"></div></div></td>
            <td>${escHtml(info.timeStr)}</td>
            <td style="text-align:left;font-family:var(--dsv-font-sans)">${escHtml(info.metaphor)}</td>
            <td><span class="dsv-tag dsv-tag-${info.verdictTone}">${escHtml(info.verdict)}</span></td>
          </tr>`;
      }).join("");

      bodyEl.innerHTML = `
        <div class="dsv-cx-controls">
          <div class="dsv-pill-group" data-role="bigPresets">
            <span class="dsv-lbl">选择大数规模：</span>
            ${presets.map((p) => `<button type="button" class="dsv-btn dsv-btn-sm${bigN === p.n ? " active" : ""}" data-n="${p.n}">${p.label}</button>`).join("")}
          </div>
          <span class="dsv-tag dsv-tag-slate">基准：现代 CPU ≈ 10⁸ 次基本运算 / 秒</span>
        </div>
        <div style="overflow-x:auto">
          <table class="dsv-table">
            <thead>
              <tr>
                <th style="text-align:left">复杂度</th>
                <th>预计运算次数</th>
                <th>对数量级</th>
                <th>估算耗时</th>
                <th style="text-align:left">直观比喻</th>
                <th>1秒 OJ 判定</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        <div class="dsv-explain tone-good" style="margin-top:12px;">
          <div class="dsv-explain-main">💡 实战黄金经验法则：若题目数据规模 n = 10⁵，O(n²) 需要 10¹⁰ 次运算（约 100 秒，必超时），而 O(n log n) 仅需约 1.66 × 10⁶ 次运算（17 毫秒，眨眼稳过）！</div>
          <div class="dsv-explain-tip">这就是为什么第 7 章我们要从 O(n²) 的冒泡/插入排序，一路升级到 O(n log n) 的快速排序、堆排序与归并排序！</div>
        </div>
      `;

      bodyEl.querySelectorAll('[data-role="bigPresets"] .dsv-btn').forEach((b) =>
        b.addEventListener("click", () => {
          bigN = Number(b.dataset.n);
          renderBigView();
        })
      );
    }

    function render() {
      modeBtns.forEach((b) => b.classList.toggle("active", b.dataset.mode === mode));
      if (mode === "curve") renderCurveView();
      else renderBigView();
    }

    modeBtns.forEach((b) =>
      b.addEventListener("click", () => {
        mode = b.dataset.mode;
        render();
      })
    );

    render();
    return { setMode: (m) => { mode = m; render(); } };
  }

  /* ==========================================================================
   * 14. 全局导出 window.DSVisualizers
   * ========================================================================== */
  global.DSVisualizers = {
    TABS,
    mount,
    mountComplexityChart,
    _generators: {
      linkedlist: {
        buildInsertOk: LinkedListMod.buildInsertOk,
        buildInsertBad: LinkedListMod.buildInsertBad,
        buildDelete: LinkedListMod.buildDelete,
        buildReverse: LinkedListMod.buildReverse
      },
      queue: {
        buildWrapDemo: QueueMod.buildWrapDemo,
        recordEnqueue: QueueMod.recordEnqueue,
        recordDequeue: QueueMod.recordDequeue
      },
      kmp: {
        computeNextArray: KmpMod.computeNextArray,
        buildNextFrames: KmpMod.buildNextFrames,
        buildCompareFrames: KmpMod.buildCompareFrames
      },
      tree: {
        buildRecursive: TreeMod.buildRecursive,
        buildLevel: TreeMod.buildLevel
      },
      huffman: {
        buildHuffmanFrames: HuffmanMod.buildHuffmanFrames,
        parseWeightsInput: HuffmanMod.parseWeightsInput,
        PRESETS: HuffmanMod.PRESETS
      },
      graph: {
        buildBFS: GraphMod.buildBFS,
        buildDFS: GraphMod.buildDFS,
        buildDijkstra: GraphMod.buildDijkstra
      },
      bst: {
        makePresetTree: BstMod.makePresetTree,
        getInorder: BstMod.getInorder,
        recordSearch: BstMod.recordSearch,
        recordInsert: BstMod.recordInsert,
        recordDelete: BstMod.recordDelete
      },
      sort: {
        genPreset: SortMod.genPreset,
        recordBubble: SortMod.recordBubble,
        recordInsert: SortMod.recordInsert,
        recordSelect: SortMod.recordSelect,
        recordQuick: SortMod.recordQuick,
        recordHeap: SortMod.recordHeap,
        recordMerge: SortMod.recordMerge
      },
      complexity: {
        CLASSES: COMPLEXITY_CLASSES,
        formatOpsAndTime
      }
    }
  };
})(typeof window !== "undefined" ? window : globalThis);

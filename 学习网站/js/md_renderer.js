/* ==========================================================================
   js/md_renderer.js — 零依赖离线 Markdown + C++高亮 + 数学公式 + Mermaid SVG 渲染器
   暴露全局接口：window.DSRenderer
   ========================================================================== */
(function (global) {
  'use strict';

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function unescapeHtmlBasic(str) {
    return String(str == null ? '' : str)
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#10;/g, '\n')
      .replace(/&amp;/g, '&');
  }

  function slugify(text) {
    return String(text || '')
      .replace(/<[^>]+>/g, '')
      .replace(/[`*_~]/g, '')
      .trim()
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5\-]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'sec';
  }

  /* ------------------------------------------------------------------------
     1. 离线 C/C++ / Python / Bash 语法高亮器（单遍词法扫描，绝不破坏标签）
     ------------------------------------------------------------------------ */
  var CPP_KEYWORDS = new Set([
    'alignas', 'alignof', 'and', 'asm', 'auto', 'break', 'case', 'catch', 'class',
    'const', 'constexpr', 'continue', 'default', 'delete', 'do', 'else', 'enum',
    'explicit', 'extern', 'false', 'for', 'friend', 'goto', 'if', 'inline',
    'mutable', 'namespace', 'new', 'noexcept', 'nullptr', 'NULL', 'operator',
    'private', 'protected', 'public', 'register', 'return', 'sizeof', 'static',
    'static_cast', 'struct', 'switch', 'template', 'this', 'throw', 'true', 'try',
    'typedef', 'typename', 'union', 'using', 'virtual', 'volatile', 'while'
  ]);

  var CPP_TYPES = new Set([
    'bool', 'char', 'double', 'float', 'int', 'long', 'short', 'signed', 'unsigned',
    'void', 'size_t', 'ptrdiff_t', 'int64_t', 'uint32_t', 'string', 'vector', 'list',
    'stack', 'queue', 'deque', 'map', 'unordered_map', 'set', 'unordered_set',
    'pair', 'priority_queue', 'std', 'cin', 'cout', 'endl', 'cerr', 'ostream', 'istream',
    'exception', 'runtime_error', 'out_of_range', 'invalid_argument', 'Node', 'ListNode', 'TreeNode'
  ]);

  var PY_KEYWORDS = new Set([
    'and', 'as', 'assert', 'break', 'class', 'continue', 'def', 'del', 'elif', 'else',
    'except', 'False', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is',
    'lambda', 'None', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'True', 'try', 'while', 'with', 'yield'
  ]);

  function highlightCode(rawCode, lang) {
    var code = String(rawCode == null ? '' : rawCode);
    var l = (lang || '').toLowerCase().trim();

    if (l === 'python' || l === 'py') {
      return highlightPython(code);
    }
    if (l === 'bash' || l === 'sh' || l === 'shell' || l === 'cmd' || l === 'powershell' || l === 'bat') {
      return highlightShell(code);
    }
    if (l === 'text' || l === 'txt' || l === 'plain' || l === 'ascii') {
      return escapeHtml(code);
    }
    // 默认按 C++ 风格高亮（对伪代码与 C/C++ 都美观）
    return highlightCpp(code);
  }

  function highlightCpp(code) {
    var tokenRe = /\/\/[^\n]*|\/\*[\s\S]*?\*\/|^[ \t]*#[ \t]*[a-zA-Z_]\w*(?:[^\n]*)|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b0[xX][0-9a-fA-F]+\b|\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?[uUlLfF]*\b|\b[A-Za-z_]\w*\b/gm;
    var out = '';
    var lastIdx = 0;
    var m;
    while ((m = tokenRe.exec(code)) !== null) {
      if (m.index > lastIdx) {
        out += escapeHtml(code.slice(lastIdx, m.index));
      }
      var tok = m[0];
      var esc = escapeHtml(tok);
      if (tok.startsWith('//') || tok.startsWith('/*')) {
        out += '<span class="hl-cmt">' + esc + '</span>';
      } else if (/^[ \t]*#/.test(tok)) {
        out += '<span class="hl-pre">' + esc + '</span>';
      } else if (tok[0] === '"' || tok[0] === "'") {
        out += '<span class="hl-str">' + esc + '</span>';
      } else if (/^\d/.test(tok)) {
        out += '<span class="hl-num">' + esc + '</span>';
      } else if (CPP_KEYWORDS.has(tok)) {
        out += '<span class="hl-kw">' + esc + '</span>';
      } else if (CPP_TYPES.has(tok)) {
        out += '<span class="hl-type">' + esc + '</span>';
      } else {
        // 判断是否为函数调用 identifier(
        var nextCh = code[tokenRe.lastIndex];
        if (nextCh === '(') {
          out += '<span class="hl-fn">' + esc + '</span>';
        } else {
          out += esc;
        }
      }
      lastIdx = tokenRe.lastIndex;
    }
    if (lastIdx < code.length) {
      out += escapeHtml(code.slice(lastIdx));
    }
    return out;
  }

  function highlightPython(code) {
    var tokenRe = /#[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b\d+(?:\.\d+)?\b|\b[A-Za-z_]\w*\b/gm;
    var out = '';
    var lastIdx = 0;
    var m;
    while ((m = tokenRe.exec(code)) !== null) {
      if (m.index > lastIdx) out += escapeHtml(code.slice(lastIdx, m.index));
      var tok = m[0];
      var esc = escapeHtml(tok);
      if (tok[0] === '#') out += '<span class="hl-cmt">' + esc + '</span>';
      else if (tok[0] === '"' || tok[0] === "'") out += '<span class="hl-str">' + esc + '</span>';
      else if (/^\d/.test(tok)) out += '<span class="hl-num">' + esc + '</span>';
      else if (PY_KEYWORDS.has(tok)) out += '<span class="hl-kw">' + esc + '</span>';
      else out += esc;
      lastIdx = tokenRe.lastIndex;
    }
    if (lastIdx < code.length) out += escapeHtml(code.slice(lastIdx));
    return out;
  }

  function highlightShell(code) {
    return code.split('\n').map(function (line) {
      var trimmed = line.trim();
      if (trimmed.startsWith('#')) {
        return '<span class="hl-cmt">' + escapeHtml(line) + '</span>';
      }
      return escapeHtml(line).replace(/^(\s*(?:\$ |&gt; )?)(g\+\+|python3?|cd|ls|mkdir|git|clang\+\+|dir)\b/, '$1<span class="hl-kw">$2</span>');
    }).join('\n');
  }

  function renderCodeBlockHtml(code, lang) {
    var cleanLang = (lang || 'cpp').trim() || 'text';
    var displayLang = cleanLang.toLowerCase() === 'c++' ? 'cpp' : cleanLang;
    var hl = highlightCode(code, displayLang);
    var encoded = encodeURIComponent(code);
    return (
      '<div class="md-code-block">' +
        '<div class="md-code-header">' +
          '<span class="md-code-lang">' + escapeHtml(displayLang) + '</span>' +
          '<button type="button" class="md-copy-btn" data-copy-code="' + encoded + '">📋 复制</button>' +
        '</div>' +
        '<pre><code class="lang-' + escapeHtml(displayLang) + '">' + hl + '</code></pre>' +
      '</div>'
    );
  }

  /* ------------------------------------------------------------------------
     2. 数学公式友好美化器（支持常见 LaTeX 行内/块级公式）
     ------------------------------------------------------------------------ */
  function renderMath(rawExpr, isBlock) {
    var s = unescapeHtmlBasic(String(rawExpr || '').trim());

    // 先处理 \frac{a}{b} 和 \sqrt{a}（使用占位避免被转义）
    var tokens = [];
    function stash(html) {
      var idx = tokens.length;
      tokens.push(html);
      return '\x00M' + idx + '\x00';
    }

    // 反复替换内层 \frac{...}{...}
    var guard = 0;
    while (/\\frac\{([^{}]+)\}\{([^{}]+)\}/.test(s) && guard++ < 8) {
      s = s.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, function (_, num, den) {
        return stash(
          '<span class="math-frac"><span class="math-frac-num">' + formatMathSimple(num) +
          '</span><span class="math-frac-den">' + formatMathSimple(den) + '</span></span>'
        );
      });
    }

    s = s.replace(/\\sqrt\{([^{}]+)\}/g, function (_, inner) {
      return stash('<span class="math-op">√</span>(' + formatMathSimple(inner) + ')');
    });

    var formatted = formatMathSimple(s).replace(/\x00M(\d+)\x00/g, function (_, idx) {
      return tokens[Number(idx)] || '';
    });

    if (isBlock) {
      return '<span class="ds-math ds-math-block">' + formatted + '</span>';
    }
    return '<span class="ds-math">' + formatted + '</span>';
  }

  function formatMathSimple(str) {
    var s = escapeHtml(str);
    var map = [
      [/\\lfloor\b/g, '⌊'],
      [/\\rfloor\b/g, '⌋'],
      [/\\lceil\b/g, '⌈'],
      [/\\rceil\b/g, '⌉'],
      [/\\leqslant\b|\\le\b|\\leq\b/g, ' ≤ '],
      [/\\geqslant\b|\\ge\b|\\geq\b/g, ' ≥ '],
      [/\\ne\b|\\neq\b/g, ' ≠ '],
      [/\\approx\b/g, ' ≈ '],
      [/\\equiv\b/g, ' ≡ '],
      [/\\times\b/g, ' × '],
      [/\\cdot\b/g, ' · '],
      [/\\cdots\b/g, ' ⋯ '],
      [/\\ldots\b|\\dots\b/g, '…'],
      [/\\pm\b/g, ' ± '],
      [/\\infty\b/g, '∞'],
      [/\\rightarrow\b|\\to\b/g, ' → '],
      [/\\leftarrow\b/g, ' ← '],
      [/\\Rightarrow\b/g, ' ⇒ '],
      [/\\in\b/g, ' ∈ '],
      [/\\notin\b/g, ' ∉ '],
      [/\\subset\b/g, ' ⊂ '],
      [/\\subseteq\b/g, ' ⊆ '],
      [/\\cup\b/g, ' ∪ '],
      [/\\cap\b/g, ' ∩ '],
      [/\\forall\b/g, '∀'],
      [/\\exists\b/g, '∃'],
      [/\\sum\b/g, '∑'],
      [/\\prod\b/g, '∏'],
      [/\\alpha\b/g, 'α'],
      [/\\beta\b/g, 'β'],
      [/\\gamma\b/g, 'γ'],
      [/\\delta\b/g, 'δ'],
      [/\\lambda\b/g, 'λ'],
      [/\\theta\b/g, 'θ'],
      [/\\Theta\b/g, 'Θ'],
      [/\\Omega\b/g, 'Ω'],
      [/\\omega\b/g, 'ω'],
      [/\\pi\b/g, 'π'],
      [/\\log\b/g, '<span class="math-fn">log</span>'],
      [/\\ln\b/g, '<span class="math-fn">ln</span>'],
      [/\\min\b/g, '<span class="math-fn">min</span>'],
      [/\\max\b/g, '<span class="math-fn">max</span>'],
      [/\\bmod\b|\\mod\b/g, ' <span class="math-fn">mod</span> '],
      [/\\text\{([^{}]+)\}/g, '<span class="math-fn">$1</span>'],
      [/\\left|\\right/g, ''],
      [/\\,|\\;|\\quad/g, ' ']
    ];
    for (var i = 0; i < map.length; i++) {
      s = s.replace(map[i][0], map[i][1]);
    }
    // 上标与下标
    s = s.replace(/\^\{([^{}]+)\}/g, '<sup>$1</sup>');
    s = s.replace(/_\{([^{}]+)\}/g, '<sub>$1</sub>');
    s = s.replace(/\^([A-Za-z0-9\+\-])/g, '<sup>$1</sup>');
    s = s.replace(/_([A-Za-z0-9])/g, '<sub>$1</sub>');
    return s;
  }

  /* ------------------------------------------------------------------------
     3. 内置轻量 Mermaid → 矢量 SVG 图形转换器
        完美覆盖 graph TD / graph LR / flowchart / subgraph / 链式边 / 菱形判定
     ------------------------------------------------------------------------ */
  function parseMermaidNodeSpec(raw) {
    var s = raw.trim();
    if (!s) return null;
    // ID["label"] | ID[label] | ID{"label"} | ID{label} | ID("label") | ID(label) | ID
    var m = s.match(/^([A-Za-z0-9_]+)\s*(\[|\{|\()([\s\S]*?)(\]|\}|\))$/);
    if (m) {
      var id = m[1];
      var open = m[2];
      var lbl = m[3].trim();
      if ((lbl.startsWith('"') && lbl.endsWith('"')) || (lbl.startsWith("'") && lbl.endsWith("'"))) {
        lbl = lbl.slice(1, -1);
      }
      var shape = open === '{' ? 'diamond' : (open === '(' ? 'round' : 'rect');
      return { id: id, label: lbl, shape: shape };
    }
    if (/^[A-Za-z0-9_]+$/.test(s)) {
      return { id: s, label: null, shape: null };
    }
    return null;
  }

  function splitMermaidLines(label) {
    return String(label || '')
      .replace(/<br\s*\/?>/gi, '\n')
      .split('\n')
      .map(function (t) { return t.trim(); })
      .filter(Boolean);
  }

  function estimateTextWidth(text) {
    var w = 0;
    for (var i = 0; i < text.length; i++) {
      var ch = text.charCodeAt(i);
      w += ch > 127 ? 13.5 : 7.8;
    }
    return w;
  }

  function parseMermaidGraph(source) {
    var lines = String(source || '').split(/\r?\n/);
    var dir = 'TD';
    var nodesMap = {};
    var nodeOrder = [];
    var edges = [];
    var subgraphs = [];
    var currentSub = null;

    function ensureNode(spec) {
      if (!spec) return null;
      if (!nodesMap[spec.id]) {
        nodesMap[spec.id] = {
          id: spec.id,
          label: spec.label || spec.id,
          shape: spec.shape || 'rect',
          subgraph: currentSub ? currentSub.id : null
        };
        nodeOrder.push(spec.id);
      } else {
        if (spec.label) nodesMap[spec.id].label = spec.label;
        if (spec.shape) nodesMap[spec.id].shape = spec.shape;
        if (currentSub && !nodesMap[spec.id].subgraph) {
          nodesMap[spec.id].subgraph = currentSub.id;
        }
      }
      if (currentSub && currentSub.nodes.indexOf(spec.id) === -1) {
        currentSub.nodes.push(spec.id);
      }
      return nodesMap[spec.id];
    }

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line || line.startsWith('%%')) continue;

      var hdr = line.match(/^(?:graph|flowchart)\s+(TD|TB|LR|RL|BT)/i);
      if (hdr) {
        dir = hdr[1].toUpperCase();
        if (dir === 'TB') dir = 'TD';
        continue;
      }

      if (/^subgraph\b/i.test(line)) {
        var rest = line.replace(/^subgraph\s+/i, '').trim();
        var subId = 'sub_' + subgraphs.length;
        var subTitle = rest;
        var sm = rest.match(/^([A-Za-z0-9_]+)\s*\["?([^"\]]+)"?\]$/);
        if (sm) {
          subId = sm[1];
          subTitle = sm[2];
        } else {
          subTitle = rest.replace(/^["']|["']$/g, '');
        }
        currentSub = { id: subId, title: subTitle, nodes: [] };
        subgraphs.push(currentSub);
        continue;
      }

      if (line === 'end') {
        currentSub = null;
        continue;
      }

      // 解析一条或多条链式边：A --> B, A -->|lbl| B, P --- D --- N
      var edgeTokenRe = /(-->\|[^|]*\||---\|[^|]*\||-->|---|-\.->|==>)/g;
      if (edgeTokenRe.test(line)) {
        edgeTokenRe.lastIndex = 0;
        var parts = [];
        var ops = [];
        var last = 0;
        var em;
        while ((em = edgeTokenRe.exec(line)) !== null) {
          parts.push(line.slice(last, em.index).trim());
          ops.push(em[0]);
          last = edgeTokenRe.lastIndex;
        }
        parts.push(line.slice(last).trim());

        for (var p = 0; p < ops.length; p++) {
          var leftNode = ensureNode(parseMermaidNodeSpec(parts[p]));
          var rightNode = ensureNode(parseMermaidNodeSpec(parts[p + 1]));
          if (leftNode && rightNode) {
            var op = ops[p];
            var directed = op.indexOf('>') !== -1;
            var lblMatch = op.match(/\|([^|]*)\|/);
            var edgeLabel = lblMatch ? lblMatch[1].trim().replace(/^["']|["']$/g, '') : '';
            edges.push({
              from: leftNode.id,
              to: rightNode.id,
              directed: directed,
              label: edgeLabel
            });
          }
        }
      } else {
        // 独立节点声明
        ensureNode(parseMermaidNodeSpec(line));
      }
    }

    return {
      dir: dir,
      nodes: nodeOrder.map(function (id) { return nodesMap[id]; }),
      nodesMap: nodesMap,
      edges: edges,
      subgraphs: subgraphs
    };
  }

  function renderMermaidSVG(source) {
    try {
      var g = parseMermaidGraph(source);
      if (!g.nodes.length) {
        return renderMermaidFallback(source);
      }

      // 计算每个节点文字尺寸
      g.nodes.forEach(function (n) {
        n.lines = splitMermaidLines(n.label);
        if (!n.lines.length) n.lines = [n.id];
        var maxW = 0;
        n.lines.forEach(function (ln) {
          var w = estimateTextWidth(ln);
          if (w > maxW) maxW = w;
        });
        var padX = n.shape === 'diamond' ? 34 : 26;
        n.w = Math.max(84, Math.min(260, Math.ceil(maxW + padX)));
        n.h = Math.max(38, n.lines.length * 19 + 18);
      });

      // 构建入度/出度邻接表
      var outAdj = {};
      var inDeg = {};
      g.nodes.forEach(function (n) { outAdj[n.id] = []; inDeg[n.id] = 0; });
      g.edges.forEach(function (e) {
        outAdj[e.from].push(e.to);
        inDeg[e.to] = (inDeg[e.to] || 0) + 1;
      });

      // 检测是否为无向网状图（全部边 undirected 且无子图且节点 >= 5，如运动会图着色）
      var allUndirected = g.edges.length > 0 && g.edges.every(function (e) { return !e.directed; });
      if (allUndirected && g.subgraphs.length === 0 && g.nodes.length >= 5) {
        return renderCircularGraphSVG(g);
      }

      // 分层拓扑深度（BFS，处理环与多源）
      var level = {};
      var roots = g.nodes.filter(function (n) { return inDeg[n.id] === 0; });
      if (!roots.length) roots = [g.nodes[0]];
      var queue = [];
      roots.forEach(function (r) { level[r.id] = 0; queue.push(r.id); });
      var visited = new Set(queue);
      while (queue.length) {
        var u = queue.shift();
        var nexts = outAdj[u] || [];
        for (var k = 0; k < nexts.length; k++) {
          var v = nexts[k];
          if (!visited.has(v)) {
            visited.add(v);
            level[v] = (level[u] || 0) + 1;
            queue.push(v);
          } else if (level[v] < level[u] + 1 && level[u] + 1 <= g.nodes.length) {
            // 仅在 DAG 情况下向后推一层
            if (outAdj[v].indexOf(u) === -1) {
              level[v] = level[u] + 1;
            }
          }
        }
      }
      g.nodes.forEach(function (n) {
        if (level[n.id] === undefined) level[n.id] = 0;
      });

      // 判断是否为“宽知识树”（1个根节点、所有边有向、节点多、树形层次）→ 采用精致左向右思维导图布局
      var isWideTree = (
        g.dir === 'TD' &&
        g.subgraphs.length === 0 &&
        roots.length === 1 &&
        g.nodes.length >= 9 &&
        g.edges.every(function (e) { return e.directed && !e.label; }) &&
        g.nodes.every(function (n) { return inDeg[n.id] <= 1; })
      );

      if (isWideTree) {
        return renderMindmapTreeSVG(g, roots[0].id, outAdj);
      }

      return renderLayeredGraphSVG(g, level);
    } catch (err) {
      return renderMermaidFallback(source);
    }
  }

  function renderMindmapTreeSVG(g, rootId, outAdj) {
    var padX = 26;
    var padY = 24;
    var colGap = 54;
    var leafGapY = 10;
    var branchGapY = 18;

    // 递归计算每个子树高度
    function calcSubtreeHeight(id) {
      var node = g.nodesMap[id];
      var kids = outAdj[id] || [];
      if (!kids.length) {
        node._subH = node.h;
        return node._subH;
      }
      var sum = 0;
      kids.forEach(function (cid, idx) {
        sum += calcSubtreeHeight(cid);
        if (idx > 0) sum += (outAdj[cid] && outAdj[cid].length ? branchGapY : leafGapY);
      });
      node._subH = Math.max(node.h, sum);
      return node._subH;
    }

    // 计算每层最大宽度
    var depthMaxW = {};
    function calcDepthW(id, d) {
      var node = g.nodesMap[id];
      node._depth = d;
      depthMaxW[d] = Math.max(depthMaxW[d] || 0, node.w);
      (outAdj[id] || []).forEach(function (cid) { calcDepthW(cid, d + 1); });
    }

    calcSubtreeHeight(rootId);
    calcDepthW(rootId, 0);

    var depthX = {};
    var curX = padX;
    var dKeys = Object.keys(depthMaxW).map(Number).sort(function (a, b) { return a - b; });
    dKeys.forEach(function (d) {
      depthX[d] = curX;
      curX += depthMaxW[d] + colGap;
    });

    // 布局坐标
    function place(id, topY) {
      var node = g.nodesMap[id];
      node.x = depthX[node._depth];
      node.y = topY + (node._subH - node.h) / 2;
      var kids = outAdj[id] || [];
      if (!kids.length) return;
      var totalKidsH = 0;
      kids.forEach(function (cid, idx) {
        totalKidsH += g.nodesMap[cid]._subH;
        if (idx > 0) totalKidsH += (outAdj[cid] && outAdj[cid].length ? branchGapY : leafGapY);
      });
      var yCursor = topY + (node._subH - totalKidsH) / 2;
      kids.forEach(function (cid, idx) {
        if (idx > 0) yCursor += (outAdj[cid] && outAdj[cid].length ? branchGapY : leafGapY);
        place(cid, yCursor);
        yCursor += g.nodesMap[cid]._subH;
      });
    }

    place(rootId, padY);

    var totalW = curX - colGap + padX;
    var totalH = g.nodesMap[rootId]._subH + padY * 2;
    var uid = 'mm_' + Math.random().toString(36).slice(2, 8);
    var palette = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#0891b2', '#db2777', '#4f46e5'];
    var branchColor = {};
    (outAdj[rootId] || []).forEach(function (bid, idx) {
      var c = palette[idx % palette.length];
      function paint(id) {
        branchColor[id] = c;
        (outAdj[id] || []).forEach(paint);
      }
      paint(bid);
    });

    var svg = [];
    svg.push('<div class="ds-mermaid-card">');
    svg.push('<svg class="ds-mermaid-svg" viewBox="0 0 ' + Math.ceil(totalW) + ' ' + Math.ceil(totalH) + '" width="' + Math.ceil(totalW) + '" xmlns="http://www.w3.org/2000/svg">');
    svg.push('<defs><marker id="' + uid + '" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 1 L 10 5 L 0 9 z" fill="var(--text-muted, #64748b)"/></marker></defs>');

    // 贝塞尔连线
    g.edges.forEach(function (e) {
      var a = g.nodesMap[e.from];
      var b = g.nodesMap[e.to];
      var x1 = a.x + a.w;
      var y1 = a.y + a.h / 2;
      var x2 = b.x;
      var y2 = b.y + b.h / 2;
      var mx = (x1 + x2) / 2;
      var stroke = branchColor[e.to] || 'var(--accent, #2563eb)';
      svg.push('<path d="M ' + x1 + ' ' + y1 + ' C ' + mx + ' ' + y1 + ', ' + mx + ' ' + y2 + ', ' + x2 + ' ' + y2 + '" fill="none" stroke="' + stroke + '" stroke-opacity="0.55" stroke-width="2" marker-end="url(#' + uid + ')"/>');
    });

    // 节点
    g.nodes.forEach(function (n) {
      var isRoot = n.id === rootId;
      var isBranch = n._depth === 1;
      var c = branchColor[n.id] || '#2563eb';
      var fill = isRoot ? '#2563eb' : (isBranch ? 'var(--bg-card, #ffffff)' : 'var(--bg-card, #ffffff)');
      var stroke = isRoot ? '#1d4ed8' : c;
      var strokeW = isRoot ? 0 : (isBranch ? 2 : 1.4);
      var textFill = isRoot ? '#ffffff' : 'var(--text-main, #0f172a)';
      svg.push('<rect x="' + n.x + '" y="' + n.y + '" width="' + n.w + '" height="' + n.h + '" rx="9" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + strokeW + '"/>');
      if (isBranch) {
        svg.push('<rect x="' + n.x + '" y="' + n.y + '" width="5" height="' + n.h + '" rx="2" fill="' + c + '"/>');
      }
      svg.push(renderSvgNodeText(n, textFill, isRoot || isBranch));
    });

    svg.push('</svg></div>');
    return svg.join('');
  }

  function renderCircularGraphSVG(g) {
    var count = g.nodes.length;
    var r = Math.max(125, count * 22);
    var cx = r + 100;
    var cy = r + 62;
    var totalW = cx * 2;
    var totalH = cy * 2;

    g.nodes.forEach(function (n, idx) {
      var angle = -Math.PI / 2 + (2 * Math.PI * idx) / count;
      n.cx = cx + r * Math.cos(angle);
      n.cy = cy + r * Math.sin(angle);
      n.x = n.cx - n.w / 2;
      n.y = n.cy - n.h / 2;
    });

    var svg = [];
    svg.push('<div class="ds-mermaid-card">');
    svg.push('<svg class="ds-mermaid-svg" viewBox="0 0 ' + Math.ceil(totalW) + ' ' + Math.ceil(totalH) + '" width="' + Math.ceil(totalW) + '" xmlns="http://www.w3.org/2000/svg">');

    g.edges.forEach(function (e) {
      var a = g.nodesMap[e.from];
      var b = g.nodesMap[e.to];
      svg.push('<line x1="' + a.cx + '" y1="' + a.cy + '" x2="' + b.cx + '" y2="' + b.cy + '" stroke="var(--border-strong, #94a3b8)" stroke-width="2"/>');
    });

    var colorHints = { '颜色1': '#2563eb', '颜色2': '#059669', '颜色3': '#d97706' };
    g.nodes.forEach(function (n) {
      var stroke = 'var(--accent, #2563eb)';
      Object.keys(colorHints).forEach(function (k) {
        if (n.label.indexOf(k) !== -1) stroke = colorHints[k];
      });
      svg.push('<rect x="' + n.x + '" y="' + n.y + '" width="' + n.w + '" height="' + n.h + '" rx="18" fill="var(--bg-card, #ffffff)" stroke="' + stroke + '" stroke-width="2.2"/>');
      svg.push(renderSvgNodeText(n, 'var(--text-main, #0f172a)', true));
    });

    svg.push('</svg></div>');
    return svg.join('');
  }

  function renderLayeredGraphSVG(g, levelMap) {
    var layers = {};
    var maxLevel = 0;
    g.nodes.forEach(function (n) {
      var lv = levelMap[n.id] || 0;
      if (lv > maxLevel) maxLevel = lv;
      if (!layers[lv]) layers[lv] = [];
      layers[lv].push(n);
    });

    var isLR = g.dir === 'LR' || g.dir === 'RL';
    var padX = 32;
    var padY = 34;
    var gapMajor = isLR ? 64 : 52;
    var gapMinor = isLR ? 22 : 24;

    // 计算每层主轴跨度和副轴总长度
    var layerMajor = [];
    var layerMinor = [];
    var maxMinor = 0;
    for (var lv = 0; lv <= maxLevel; lv++) {
      var arr = layers[lv] || [];
      var maj = 0;
      var minSum = 0;
      arr.forEach(function (n, idx) {
        if (isLR) {
          maj = Math.max(maj, n.w);
          minSum += n.h + (idx > 0 ? gapMinor : 0);
        } else {
          maj = Math.max(maj, n.h);
          minSum += n.w + (idx > 0 ? gapMinor : 0);
        }
      });
      layerMajor[lv] = maj;
      layerMinor[lv] = minSum;
      if (minSum > maxMinor) maxMinor = minSum;
    }

    var cursorMajor = isLR ? padX : padY;
    for (var l = 0; l <= maxLevel; l++) {
      var nodes = layers[l] || [];
      var startMinor = (isLR ? padY : padX) + (maxMinor - layerMinor[l]) / 2;
      var cursorMinor = startMinor;
      nodes.forEach(function (n) {
        if (isLR) {
          n.x = cursorMajor + (layerMajor[l] - n.w) / 2;
          n.y = cursorMinor;
          cursorMinor += n.h + gapMinor;
        } else {
          n.x = cursorMinor;
          n.y = cursorMajor + (layerMajor[l] - n.h) / 2;
          cursorMinor += n.w + gapMinor;
        }
      });
      cursorMajor += layerMajor[l] + gapMajor;
    }

    var totalW = isLR ? (cursorMajor - gapMajor + padX) : (maxMinor + padX * 2);
    var totalH = isLR ? (maxMinor + padY * 2) : (cursorMajor - gapMajor + padY);
    if (g.subgraphs.length) totalH += 16;

    var uid = 'mg_' + Math.random().toString(36).slice(2, 8);
    var svg = [];
    svg.push('<div class="ds-mermaid-card">');
    svg.push('<svg class="ds-mermaid-svg" viewBox="0 0 ' + Math.ceil(totalW) + ' ' + Math.ceil(totalH) + '" width="' + Math.ceil(totalW) + '" xmlns="http://www.w3.org/2000/svg">');
    svg.push('<defs><marker id="' + uid + '" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse"><path d="M 0 1 L 10 5 L 0 9 z" fill="var(--accent, #2563eb)"/></marker></defs>');

    // 绘制 subgraph 背景框
    g.subgraphs.forEach(function (sg) {
      var sgNodes = sg.nodes.map(function (id) { return g.nodesMap[id]; }).filter(Boolean);
      if (!sgNodes.length) return;
      var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      sgNodes.forEach(function (n) {
        minX = Math.min(minX, n.x);
        minY = Math.min(minY, n.y);
        maxX = Math.max(maxX, n.x + n.w);
        maxY = Math.max(maxY, n.y + n.h);
      });
      var bx = minX - 14;
      var by = minY - 26;
      var bw = (maxX - minX) + 28;
      var bh = (maxY - minY) + 38;
      svg.push('<rect x="' + bx + '" y="' + by + '" width="' + bw + '" height="' + bh + '" rx="12" fill="var(--accent-soft, #eff6ff)" fill-opacity="0.55" stroke="var(--accent-border, #93c5fd)" stroke-dasharray="5,4" stroke-width="1.5"/>');
      svg.push('<text x="' + (bx + 12) + '" y="' + (by + 17) + '" font-size="12" font-weight="700" fill="var(--accent, #2563eb)">' + escapeHtml(sg.title) + '</text>');
    });

    // 绘制连线
    g.edges.forEach(function (e) {
      var a = g.nodesMap[e.from];
      var b = g.nodesMap[e.to];
      var x1, y1, x2, y2, pathD, lx, ly;
      if (isLR) {
        x1 = a.x + a.w;
        y1 = a.y + a.h / 2;
        x2 = b.x;
        y2 = b.y + b.h / 2;
        if (Math.abs(a.x - b.x) < 10) {
          x1 = a.x + a.w / 2; y1 = a.y + a.h;
          x2 = b.x + b.w / 2; y2 = b.y;
          pathD = 'M ' + x1 + ' ' + y1 + ' L ' + x2 + ' ' + y2;
        } else {
          var mx = (x1 + x2) / 2;
          pathD = 'M ' + x1 + ' ' + y1 + ' C ' + mx + ' ' + y1 + ', ' + mx + ' ' + y2 + ', ' + x2 + ' ' + y2;
        }
        lx = (x1 + x2) / 2;
        ly = (y1 + y2) / 2 - 7;
      } else {
        x1 = a.x + a.w / 2;
        y1 = a.y + a.h;
        x2 = b.x + b.w / 2;
        y2 = b.y;
        var my = (y1 + y2) / 2;
        pathD = 'M ' + x1 + ' ' + y1 + ' C ' + x1 + ' ' + my + ', ' + x2 + ' ' + my + ', ' + x2 + ' ' + y2;
        lx = (x1 + x2) / 2;
        ly = (y1 + y2) / 2;
      }
      var marker = e.directed ? ' marker-end="url(#' + uid + ')"' : '';
      svg.push('<path d="' + pathD + '" fill="none" stroke="var(--accent, #2563eb)" stroke-opacity="0.72" stroke-width="2"' + marker + '/>');
      if (e.label) {
        var lw = Math.max(36, estimateTextWidth(e.label) + 14);
        svg.push('<rect x="' + (lx - lw / 2) + '" y="' + (ly - 11) + '" width="' + lw + '" height="20" rx="6" fill="var(--bg-card, #ffffff)" stroke="var(--border, #cbd5e1)" stroke-width="1"/>');
        svg.push('<text x="' + lx + '" y="' + (ly + 3) + '" text-anchor="middle" font-size="11.5" font-weight="600" fill="var(--text-sub, #475569)">' + escapeHtml(e.label) + '</text>');
      }
    });

    // 绘制节点
    g.nodes.forEach(function (n, idx) {
      var isDiamond = n.shape === 'diamond';
      var fill = isDiamond ? 'var(--amber-bg, #fffbeb)' : (idx === 0 && !g.subgraphs.length ? 'var(--accent-soft, #eff6ff)' : 'var(--bg-card, #ffffff)');
      var stroke = isDiamond ? 'var(--amber, #d97706)' : 'var(--accent, #2563eb)';
      if (isDiamond) {
        // 精致六边形判定框（比尖菱形更能容纳中文不溢出）
        var cut = 14;
        var pts = [
          (n.x + cut) + ',' + n.y,
          (n.x + n.w - cut) + ',' + n.y,
          (n.x + n.w) + ',' + (n.y + n.h / 2),
          (n.x + n.w - cut) + ',' + (n.y + n.h),
          (n.x + cut) + ',' + (n.y + n.h),
          n.x + ',' + (n.y + n.h / 2)
        ].join(' ');
        svg.push('<polygon points="' + pts + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="2"/>');
      } else {
        svg.push('<rect x="' + n.x + '" y="' + n.y + '" width="' + n.w + '" height="' + n.h + '" rx="' + (n.shape === 'round' ? 20 : 10) + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="1.8"/>');
      }
      svg.push(renderSvgNodeText(n, 'var(--text-main, #0f172a)', idx === 0 || isDiamond));
    });

    svg.push('</svg></div>');
    return svg.join('');
  }

  function renderSvgNodeText(n, fill, bold) {
    var cx = n.x + n.w / 2;
    var lineH = 18;
    var startY = n.y + (n.h - (n.lines.length - 1) * lineH) / 2 + 4.5;
    var out = '';
    for (var i = 0; i < n.lines.length; i++) {
      var fw = (bold && i === 0) ? '700' : '500';
      var fs = i === 0 ? '13' : '11.5';
      out += '<text x="' + cx + '" y="' + (startY + i * lineH) + '" text-anchor="middle" font-size="' + fs + '" font-weight="' + fw + '" fill="' + fill + '">' + escapeHtml(n.lines[i]) + '</text>';
    }
    return out;
  }

  function renderMermaidFallback(source) {
    var steps = String(source || '').split(/\r?\n/).map(function (s) { return s.trim(); }).filter(Boolean).slice(1);
    return (
      '<div class="ds-mermaid-card">' +
        '<div style="text-align:left;font-size:13px;color:var(--text-sub);">' +
          '<strong>📊 结构关系图</strong><ul style="margin:8px 0 0;padding-left:18px;">' +
          steps.map(function (s) { return '<li>' + escapeHtml(s) + '</li>'; }).join('') +
          '</ul>' +
        '</div>' +
      '</div>'
    );
  }

  /* ------------------------------------------------------------------------
     4. 行内 Markdown 解析（行内代码、数学公式、链接、加粗、斜体、删除线）
     ------------------------------------------------------------------------ */
  function isInternalDocLink(href) {
    if (!href) return false;
    var h = href.trim();
    if (/^https?:\/\//i.test(h) || /^mailto:/i.test(h)) return false;
    return /\.md($|#)/i.test(h) || /^(?:\.\.\/|\.\/)?labs\//i.test(h) || /^(?:\.\.\/|\.\/)?code\//i.test(h);
  }

  function renderInline(text) {
    var stash = [];
    function put(html) {
      var id = stash.length;
      stash.push(html);
      return '\x01I' + id + '\x01';
    }

    var s = String(text == null ? '' : text);

    // 1. 行内代码 `...`
    s = s.replace(/`([^`\n]+)`/g, function (_, code) {
      return put('<code>' + escapeHtml(code) + '</code>');
    });

    // 2. 块级/行内数学公式 $$...$$ 与 $...$
    s = s.replace(/\$\$([^$]+)\$\$/g, function (_, expr) {
      return put(renderMath(expr, true));
    });
    s = s.replace(/\$([^$\n]+?)\$/g, function (_, expr) {
      return put(renderMath(expr, false));
    });

    // 3. 图片 ![alt](src)
    s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, function (_, alt, src) {
      return put('<img src="' + escapeHtml(src) + '" alt="' + escapeHtml(alt) + '" style="max-width:100%;border-radius:8px;" />');
    });

    // 4. 链接 [label](url)
    s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function (_, label, url) {
      var cleanUrl = url.trim();
      var innerLabel = renderInlineSimple(label);
      if (isInternalDocLink(cleanUrl)) {
        return put('<a href="javascript:void(0)" class="md-internal-link" data-md-link="' + escapeHtml(cleanUrl) + '">' + innerLabel + '</a>');
      }
      if (cleanUrl.startsWith('#')) {
        return put('<a href="javascript:void(0)" class="md-anchor-link" data-md-anchor="' + escapeHtml(cleanUrl.slice(1)) + '">' + innerLabel + '</a>');
      }
      return put('<a href="' + escapeHtml(cleanUrl) + '" target="_blank" rel="noopener noreferrer">' + innerLabel + '</a>');
    });

    // 转义剩余普通文本并做加粗/斜体/删除线
    s = renderInlineSimple(s);

    // 还原占位符（支持嵌套占位，如链接文本内含行内代码/数学公式）
    var restoreGuard = 0;
    while (/\x01I(\d+)\x01/.test(s) && restoreGuard++ < 6) {
      s = s.replace(/\x01I(\d+)\x01/g, function (_, idx) {
        return stash[Number(idx)] || '';
      });
    }
    return s;
  }

  function renderInlineSimple(str) {
    var s = escapeHtml(str);
    // 支持还原 <br> / <br/> 标签
    s = s.replace(/&lt;br\s*\/?&gt;/gi, '<br/>');
    // 粗斜体 ***...***
    s = s.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
    // 加粗 **...**
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    // 删除线 ~~...~~
    s = s.replace(/~~([^~]+)~~/g, '<del>$1</del>');
    // 斜体 *...*（避免误伤数学乘号）
    s = s.replace(/(^|[^\w*])\*([^*\n]+)\*(?=[^\w*]|$)/g, '$1<em>$2</em>');
    return s;
  }

  /* ------------------------------------------------------------------------
     5. <details> 内部增强（兼容现有 HTML 内容 + 纯 Markdown 内容）
     ------------------------------------------------------------------------ */
  function enhanceDetailsBlock(rawBlock, detailIdx, chapterId) {
    var sumMatch = rawBlock.match(/<summary[^>]*>([\s\S]*?)<\/summary>/i);
    var summaryHtml = sumMatch ? sumMatch[1].trim() : '点我看解析';
    var bodyRaw = rawBlock
      .replace(/^<details[^>]*>/i, '')
      .replace(/<\/details>$/i, '');
    if (sumMatch) {
      bodyRaw = bodyRaw.replace(sumMatch[0], '');
    }
    bodyRaw = bodyRaw.trim();

    var bodyHtml = '';
    var hasHtmlTags = /<(?:p|ul|ol|table|pre|div|h[1-6]|blockquote)\b/i.test(bodyRaw);

    if (hasHtmlTags) {
      // 保留原有 HTML，同时美化其中的 <pre><code>、数学公式与内部 .md 链接
      var codeStash = [];
      bodyHtml = bodyRaw.replace(/<pre[^>]*><code(?:\s+class="language-([^"]*)")?[^>]*>([\s\S]*?)<\/code><\/pre>/gi, function (_, lang, innerCode) {
        var decoded = unescapeHtmlBasic(innerCode);
        var idx = codeStash.length;
        codeStash.push(renderCodeBlockHtml(decoded, lang || 'cpp'));
        return '\x02C' + idx + '\x02';
      });
      // 保护行内 <code>...</code>
      bodyHtml = bodyHtml.replace(/<code[^>]*>[\s\S]*?<\/code>/gi, function (m) {
        var idx = codeStash.length;
        codeStash.push(m);
        return '\x02C' + idx + '\x02';
      });
      // 处理数学公式
      bodyHtml = bodyHtml.replace(/\$\$([^$]+)\$\$/g, function (_, expr) {
        return renderMath(expr, true);
      });
      bodyHtml = bodyHtml.replace(/\$([^$\n<]+?)\$/g, function (_, expr) {
        return renderMath(expr, false);
      });
      // 包裹表格以支持横向滚动
      bodyHtml = bodyHtml.replace(/<table\b[\s\S]*?<\/table>/gi, function (tbl) {
        return '<div class="md-table-wrap">' + tbl + '</div>';
      });
      // 拦截内部 .md 链接
      bodyHtml = bodyHtml.replace(/<a\s+href="([^"]+)"([^>]*)>/gi, function (full, href, rest) {
        if (isInternalDocLink(href)) {
          return '<a href="javascript:void(0)" class="md-internal-link" data-md-link="' + escapeHtml(href) + '"' + rest + '>';
        }
        return full;
      });
      // 还原代码块
      bodyHtml = bodyHtml.replace(/\x02C(\d+)\x02/g, function (_, idx) {
        return codeStash[Number(idx)] || '';
      });
    } else {
      bodyHtml = renderMarkdownBlocks(bodyRaw, { chapterId: null, enableSectionCheck: false });
    }

    var detailId = (chapterId || 'doc') + ':detail:' + detailIdx;
    var summaryPlain = summaryHtml.replace(/<[^>]+>/g, '').trim();
    return (
      '<details class="ds-details" data-detail-id="' + escapeHtml(detailId) + '">' +
        '<summary>' + summaryHtml + '</summary>' +
        '<div class="ds-details-body">' + bodyHtml + '</div>' +
        '<div class="ds-details-actions">' +
          '<button type="button" class="btn btn-sm btn-soft ds-detail-gotit" data-detail-id="' + escapeHtml(detailId) + '">✅ 我会了 (+5 XP)</button>' +
          '<button type="button" class="btn btn-sm ds-detail-bm" data-bm-id="' + escapeHtml(detailId) + '" data-bm-title="' + escapeHtml(summaryPlain) + '">⭐ 收藏</button>' +
        '</div>' +
      '</details>'
    );
  }

  /* ------------------------------------------------------------------------
     6. 主块级 Markdown 渲染器
     ------------------------------------------------------------------------ */
  function renderMarkdownBlocks(md, options) {
    options = options || {};
    var chapterId = options.chapterId || null;
    var enableCheck = options.enableSectionCheck !== false && !!chapterId;
    var knownHeadings = Array.isArray(options.headings) ? options.headings : [];
    var knownCursor = 0;
    var usedSlugs = {};

    function nextSlug(level, rawText) {
      // 优先与 data/chapters_*.js 预提取的 headings slug 严格对齐
      if ((level === 2 || level === 3) && knownCursor < knownHeadings.length) {
        var clean = rawText.replace(/<[^>]+>/g, '').replace(/[`*_~]/g, '').trim();
        for (var j = knownCursor; j < Math.min(knownCursor + 4, knownHeadings.length); j++) {
          if (knownHeadings[j].level === level && knownHeadings[j].text.trim() === clean) {
            knownCursor = j + 1;
            return knownHeadings[j].slug;
          }
        }
      }
      var base = slugify(rawText);
      var slug = base;
      var k = 2;
      while (usedSlugs[slug]) {
        slug = base + '-' + (k++);
      }
      usedSlugs[slug] = true;
      return slug;
    }

    // 统一换行
    var src = String(md || '').replace(/\r\n/g, '\n');

    // Step 1: 保护 <details>...</details> 块
    var blocks = [];
    function stashBlock(html) {
      var id = blocks.length;
      blocks.push(html);
      return '\n\n@@DSBLOCK_' + id + '@@\n\n';
    }

    var detailCount = 0;
    src = src.replace(/<details\b[^>]*>[\s\S]*?<\/details>/gi, function (match) {
      return stashBlock(enhanceDetailsBlock(match, detailCount++, chapterId));
    });

    // Step 2: 保护围栏代码块 ```lang ... ```
    src = src.replace(/```([a-zA-Z0-9_+-]*)[ \t]*\n([\s\S]*?)```/g, function (_, lang, code) {
      var l = (lang || '').trim().toLowerCase();
      if (l === 'mermaid') {
        return stashBlock(renderMermaidSVG(code));
      }
      return stashBlock(renderCodeBlockHtml(code.replace(/\n$/, ''), l || 'cpp'));
    });

    // Step 3: 逐行解析块级结构
    var lines = src.split('\n');
    var out = [];
    var i = 0;

    function isTableSep(line) {
      return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
    }

    function splitTableRow(line) {
      var t = line.trim();
      if (t.startsWith('|')) t = t.slice(1);
      if (t.endsWith('|')) t = t.slice(0, -1);
      return t.split('|').map(function (c) { return c.trim(); });
    }

    while (i < lines.length) {
      var line = lines[i];
      var trimmed = line.trim();

      if (!trimmed) {
        i++;
        continue;
      }

      // 占位块
      var blkMatch = trimmed.match(/^@@DSBLOCK_(\d+)@@$/);
      if (blkMatch) {
        out.push(blocks[Number(blkMatch[1])] || '');
        i++;
        continue;
      }

      // 独立块级数学公式 $$...$$
      if (trimmed.startsWith('$$')) {
        if (trimmed.length > 4 && trimmed.endsWith('$$')) {
          out.push(renderMath(trimmed.slice(2, -2), true));
          i++;
          continue;
        }
        var mathLines = [trimmed.slice(2)];
        i++;
        while (i < lines.length && !lines[i].trim().endsWith('$$')) {
          mathLines.push(lines[i]);
          i++;
        }
        if (i < lines.length) {
          mathLines.push(lines[i].trim().slice(0, -2));
          i++;
        }
        out.push(renderMath(mathLines.join('\n'), true));
        continue;
      }

      // 标题 # .. ######
      var hMatch = line.match(/^(#{1,6})\s+(.+?)\s*#*$/);
      if (hMatch) {
        var lvl = hMatch[1].length;
        var hText = hMatch[2];
        var slug = nextSlug(lvl, hText);
        var btnHtml = '';
        if (enableCheck && (lvl === 2 || lvl === 3)) {
          var isDone = global.DSGamify && typeof global.DSGamify.isSectionDone === 'function'
            ? global.DSGamify.isSectionDone(chapterId, slug)
            : false;
          btnHtml =
            '<button type="button" class="sec-done-btn' + (isDone ? ' is-done' : '') + '" ' +
            'data-sec-chapter="' + escapeHtml(chapterId) + '" data-sec-slug="' + escapeHtml(slug) + '">' +
            (isDone ? '✅ 已掌握' : '⬜ 标记已掌握') + '</button>';
        }
        out.push('<h' + lvl + ' id="' + escapeHtml(slug) + '"><span>' + renderInline(hText) + '</span>' + btnHtml + '</h' + lvl + '>');
        i++;
        continue;
      }

      // 分割线
      if (/^(?:---+|\*\*\*+|___+)$/.test(trimmed)) {
        out.push('<hr/>');
        i++;
        continue;
      }

      // 引用块 >
      if (trimmed.startsWith('>')) {
        var qLines = [];
        while (i < lines.length && lines[i].trim().startsWith('>')) {
          qLines.push(lines[i].replace(/^\s*>\s?/, ''));
          i++;
        }
        var qRaw = qLines.join('\n');
        var qCls = '';
        if (/⚠️|注意|陷阱|易错|警惕/.test(qRaw)) qCls = ' class="callout-warn"';
        else if (/❌|严禁|致命|危险|踩坑/.test(qRaw)) qCls = ' class="callout-danger"';
        else if (/💡|口诀|小贴士|技巧|核心|总结/.test(qRaw)) qCls = ' class="callout-tip"';
        var qInner = renderMarkdownBlocks(qRaw, { chapterId: null, enableSectionCheck: false });
        out.push('<blockquote' + qCls + '>' + qInner + '</blockquote>');
        continue;
      }

      // GFM 表格
      if (line.indexOf('|') !== -1 && i + 1 < lines.length && isTableSep(lines[i + 1])) {
        var headers = splitTableRow(line);
        i += 2;
        var rows = [];
        while (i < lines.length && lines[i].trim() && lines[i].indexOf('|') !== -1) {
          rows.push(splitTableRow(lines[i]));
          i++;
        }
        var ths = headers.map(function (h) { return '<th>' + renderInline(h) + '</th>'; }).join('');
        var trs = rows.map(function (r) {
          var tds = headers.map(function (_, idx) {
            return '<td>' + renderInline(r[idx] || '') + '</td>';
          }).join('');
          return '<tr>' + tds + '</tr>';
        }).join('');
        out.push('<div class="md-table-wrap"><table><thead><tr>' + ths + '</tr></thead><tbody>' + trs + '</tbody></table></div>');
        continue;
      }

      // 无序 / 有序列表（支持缩进子列表）
      var ulMatch = line.match(/^(\s*)[-*+]\s+(.*)$/);
      var olMatch = line.match(/^(\s*)\d+\.\s+(.*)$/);
      if (ulMatch || olMatch) {
        var isOl = !!olMatch;
        var tag = isOl ? 'ol' : 'ul';
        var listHtml = '<' + tag + '>';
        while (i < lines.length) {
          var lCur = lines[i];
          var mCur = isOl ? lCur.match(/^(\s*)\d+\.\s+(.*)$/) : lCur.match(/^(\s*)[-*+]\s+(.*)$/);
          if (!mCur) {
            // 嵌套不同类型子列表或续行
            var subList = lCur.match(/^(\s{2,})([-*+]|\d+\.)\s+(.*)$/);
            if (subList) {
              listHtml = listHtml.replace(/<\/li>$/, '') + '<div style="margin-left:1.2em;">• ' + renderInline(subList[3]) + '</div></li>';
              i++;
              continue;
            }
            break;
          }
          var itemContent = renderInline(mCur[2]);
          i++;
          // 合并紧随其后的缩进普通续行
          while (i < lines.length && /^\s{2,}\S/.test(lines[i]) && !/^\s*([-*+]|\d+\.)\s+/.test(lines[i]) && !/^@@DSBLOCK_/.test(lines[i].trim())) {
            itemContent += '<br/>' + renderInline(lines[i].trim());
            i++;
          }
          listHtml += '<li>' + itemContent + '</li>';
        }
        listHtml += '</' + tag + '>';
        out.push(listHtml);
        continue;
      }

      // 原始 HTML 块（如 <div ...>）直接透传
      if (/^<(?:div|table|p|hr|br|center|figure)\b/i.test(trimmed)) {
        out.push(line);
        i++;
        continue;
      }

      // 普通段落
      var pLines = [];
      while (i < lines.length) {
        var cur = lines[i];
        var t = cur.trim();
        if (!t) break;
        if (/^@@DSBLOCK_\d+@@$/.test(t)) break;
        if (/^#{1,6}\s+/.test(cur)) break;
        if (/^(?:---+|\*\*\*+|___+)$/.test(t)) break;
        if (t.startsWith('>') || t.startsWith('$$')) break;
        if (/^\s*([-*+]|\d+\.)\s+/.test(cur)) break;
        if (cur.indexOf('|') !== -1 && i + 1 < lines.length && isTableSep(lines[i + 1])) break;
        pLines.push(cur);
        i++;
      }
      out.push('<p>' + pLines.map(renderInline).join('<br/>') + '</p>');
    }

    return out.join('\n');
  }

  function extractHeadings(markdown) {
    var list = [];
    var used = {};
    var inCode = false;
    var lines = String(markdown || '').replace(/\r\n/g, '\n').split('\n');
    for (var i = 0; i < lines.length; i++) {
      var t = lines[i].trim();
      if (t.startsWith('```')) {
        inCode = !inCode;
        continue;
      }
      if (inCode) continue;
      var m = lines[i].match(/^(#{2,3})\s+(.+?)\s*#*$/);
      if (m) {
        var text = m[2].replace(/[`*_~]/g, '').trim();
        var base = slugify(text);
        var slug = base;
        var k = 2;
        while (used[slug]) slug = base + '-' + (k++);
        used[slug] = true;
        list.push({ level: m[1].length, text: text, slug: slug });
      }
    }
    return list;
  }

  global.DSRenderer = {
    render: renderMarkdownBlocks,
    highlightCode: highlightCode,
    highlightCpp: highlightCpp,
    renderCodeBlockHtml: renderCodeBlockHtml,
    renderMath: renderMath,
    renderMermaidSVG: renderMermaidSVG,
    extractHeadings: extractHeadings,
    slugify: slugify,
    escapeHtml: escapeHtml
  };
})(window);

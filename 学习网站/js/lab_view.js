/* ==========================================================================
   js/lab_view.js — 代码实战场：15 关骨架挖空(含纯手搓重置) + 16 题全手搓 OJ + 30 示例运行库
   暴露全局接口：window.DSLabView = { mount, unmount }
   ========================================================================== */
(function (global) {
  'use strict';

  var DRAFT_PREFIX = 'ds_lab_draft_';
  var OJ_DRAFT_PREFIX = 'ds_oj_draft_';
  var DEMO_DRAFT_PREFIX = 'ds_demo_draft_';
  var activeMountToken = 0;
  var activeContainer = null;

  var state = {
    mode: 'labs', // 'labs' | 'oj' | 'demos'
    labId: '00',
    ojId: 'oj01',
    demoFilename: '',
    filterText: '',
    ojChapterFilter: 'all',
    ojDiffFilter: 'all',
    ojFocusCoding: false,
    ojPanelTab: 'judge', // 'judge' | 'custom'
    ojCustomStdin: '',
    ojSolutionUnlocked: false,
    demoCustomStdin: '',
    saveToDisk: false,
    showHints: false,
    showSolution: false,
    running: false,
    lastJudgeResult: null,
    lastOJResult: null,
    lastOJCustomResult: null,
    lastDemoResult: null,
    serverProgress: null
  };

  function isStillMounted(token, containerEl) {
    return (
      token === activeMountToken &&
      containerEl === activeContainer &&
      !!containerEl &&
      containerEl.isConnected
    );
  }

  function unmount() {
    activeMountToken++;
    activeContainer = null;
    state.running = false;
  }

  function escapeHtml(s) {
    return global.DSRenderer ? global.DSRenderer.escapeHtml(s) : String(s || '');
  }

  function renderMiniMd(text) {
    if (!text) return '';
    return global.DSRenderer
      ? global.DSRenderer.render(String(text), { chapterId: null, enableSectionCheck: false })
      : escapeHtml(text);
  }

  function notify(msg, type) {
    if (global.DSGamify && typeof global.DSGamify.toast === 'function') {
      global.DSGamify.toast(msg, type);
    } else if (global.DSApp && typeof global.DSApp.toast === 'function') {
      global.DSApp.toast(msg, type);
    }
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(function () { fallbackCopy(text); });
    }
    fallbackCopy(text);
    return Promise.resolve();
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
  }

  function downloadFile(filename, content) {
    var blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function getServerStatus() {
    if (global.DSApp && typeof global.DSApp.getServerStatus === 'function') {
      return global.DSApp.getServerStatus();
    }
    return { online: false, mode: 'offline', gpp: false, gppVersion: '' };
  }

  function isLabPassed(labId) {
    var g = global.DSGamify;
    if (g && typeof g.getState === 'function') {
      var st = g.getState();
      if (st && Array.isArray(st.passedLabs) && st.passedLabs.indexOf(labId) !== -1) {
        return true;
      }
      if (st && st.passedLabs && !Array.isArray(st.passedLabs) && st.passedLabs[labId]) {
        return true;
      }
    }
    if (state.serverProgress && state.serverProgress[labId]) {
      var rec = state.serverProgress[labId];
      if (rec === true || rec.passed === true || rec.status === 'pass') return true;
    }
    return false;
  }

  function isOJPassed(ojId) {
    var g = global.DSGamify;
    if (g && typeof g.getState === 'function') {
      var st = g.getState();
      if (st && Array.isArray(st.passedOJ) && st.passedOJ.indexOf(ojId) !== -1) {
        return true;
      }
    }
    if (state.serverProgress && Array.isArray(state.serverProgress._ojPassed)) {
      if (state.serverProgress._ojPassed.indexOf(ojId) !== -1) return true;
    }
    return false;
  }

  function getDraft(lab) {
    var saved = localStorage.getItem(DRAFT_PREFIX + lab.id);
    return saved !== null ? saved : (lab.todoCode || '');
  }

  function hasCustomDraft(lab) {
    var saved = localStorage.getItem(DRAFT_PREFIX + lab.id);
    return saved !== null && saved !== (lab.todoCode || '');
  }

  function getOJDraft(prob) {
    var saved = localStorage.getItem(OJ_DRAFT_PREFIX + prob.id);
    return saved !== null ? saved : (prob.starterCode || '');
  }

  function hasCustomOJDraft(prob) {
    var saved = localStorage.getItem(OJ_DRAFT_PREFIX + prob.id);
    return saved !== null && saved !== (prob.starterCode || '');
  }

  function getDemoDraft(demo) {
    var saved = localStorage.getItem(DEMO_DRAFT_PREFIX + demo.filename);
    return saved !== null ? saved : (demo.code || '');
  }

  /**
   * 15 关「🔥 纯手搓练习模式」：剥离 int main() 之前的引导注释与 TODO 函数体，
   * 保留 #include、struct/class 定义、函数签名与下方完整 main() 测试套！
   */
  function toPureScratchCode(todoCode) {
    var src = String(todoCode || '').replace(/\r\n/g, '\n');
    var mainIdx = src.search(/\n\s*int\s+main\s*\(/);
    var headPart = mainIdx !== -1 ? src.slice(0, mainIdx) : src;
    var tailPart = mainIdx !== -1 ? src.slice(mainIdx) : '';

    // 1. 移除头部大段 /** ... */ 注释和 // 引导注释块（保留紧贴 #include 之外的结构体和函数）
    headPart = headPart.replace(/\/\*[\s\S]*?\*\//g, '');

    // 2. 扫描每个顶级函数块：如果函数体内包含 TODO 或 (void)，清空其实现体
    var out = '';
    var i = 0;
    var len = headPart.length;
    while (i < len) {
      // 跳过纯注释行（// 开头）
      if (headPart[i] === '/' && headPart[i + 1] === '/') {
        var nl = headPart.indexOf('\n', i);
        i = nl === -1 ? len : nl + 1;
        continue;
      }
      // 检测代码块 { ... }
      if (headPart[i] === '{') {
        // 判断之前是否是 struct / class / enum / namespace / union 定义
        var before = out.slice(Math.max(0, out.length - 140));
        var isTypeDecl = /\b(?:struct|class|enum|namespace|union)\b[^{;]*$/.test(before);
        var depth = 1;
        var j = i + 1;
        var inStr = false;
        var strCh = '';
        while (j < len && depth > 0) {
          var ch = headPart[j];
          if (inStr) {
            if (ch === '\\') { j += 2; continue; }
            if (ch === strCh) inStr = false;
          } else {
            if (ch === '"' || ch === "'") { inStr = true; strCh = ch; }
            else if (ch === '/' && headPart[j + 1] === '/') {
              var eol = headPart.indexOf('\n', j);
              j = eol === -1 ? len : eol;
            } else if (ch === '{') depth++;
            else if (ch === '}') depth--;
          }
          j++;
        }
        var blockContent = headPart.slice(i + 1, j - 1);
        if (!isTypeDecl && (/TODO/i.test(blockContent) || /\(void\)\s*\w+/.test(blockContent))) {
          // 保留非 void 函数的占位 return 提示（若有）以防编译警告，否则彻底留空
          var retMatch = blockContent.match(/^\s*(return\s+[^;]+;)/m);
          out += '{\n    // 🔥 纯手搓：独立实现完整逻辑\n' + (retMatch ? '    ' + retMatch[1] + '\n' : '') + '}';
        } else {
          out += headPart.slice(i, j);
        }
        i = j;
        continue;
      }
      out += headPart[i];
      i++;
    }

    // 压缩连续空行
    out = out.replace(/\n{3,}/g, '\n\n').trim();
    var banner =
      '// ============================================================================\n' +
      '// 🔥 纯手搓练习模式：已清空全部引导注释与 TODO 框架，仅保留数据结构定义与下方测试套\n' +
      '// 提示：写完直接点击「▶ 编译并评测本关」；随时可点「↺ 重置」恢复原挖空引导版\n' +
      '// ============================================================================\n\n';
    return banner + out + '\n' + tailPart;
  }

  function syncServerProgress() {
    var srv = getServerStatus();
    var isTauri = srv.mode === 'tauri' || (global.DSBackend && global.DSBackend.isTauri());
    if (!srv.online && !isTauri) return Promise.resolve();
    var req = (global.DSBackend && typeof global.DSBackend.getProgress === 'function')
      ? global.DSBackend.getProgress()
      : Promise.resolve(null);
    return req
      .then(function (data) {
        if (!data || typeof data !== 'object') return;
        state.serverProgress = data;
        var g = global.DSGamify;
        var passedIds = [];
        Object.keys(data).forEach(function (lid) {
          if (lid === '_ojPassed') return;
          var rec = data[lid];
          if (rec === true || (rec && (rec.passed === true || rec.status === 'pass'))) {
            passedIds.push(String(lid));
          }
        });
        if (passedIds.length && g) {
          if (typeof g.syncPassedLabs === 'function') {
            g.syncPassedLabs(passedIds);
          } else if (typeof g.markLabPassed === 'function') {
            passedIds.forEach(function (lid) {
              if (!isLabPassed(lid)) g.markLabPassed(lid);
            });
          }
        }
        if (Array.isArray(data._ojPassed) && data._ojPassed.length && g) {
          if (typeof g.syncPassedOJ === 'function') {
            g.syncPassedOJ(data._ojPassed);
          }
        }
      })
      .catch(function () {});
  }

  function renderLineNumbers(gutterEl, text) {
    if (!gutterEl) return;
    var count = String(text || '').split('\n').length;
    var arr = [];
    for (var i = 1; i <= count; i++) arr.push(i);
    gutterEl.textContent = arr.join('\n');
  }

  function bindEditorBehavior(textarea, gutterEl, statusEl, onSave, onRunShortcut) {
    renderLineNumbers(gutterEl, textarea.value);

    textarea.addEventListener('scroll', function () {
      gutterEl.scrollTop = textarea.scrollTop;
    });

    var saveTimer = null;
    textarea.addEventListener('input', function () {
      renderLineNumbers(gutterEl, textarea.value);
      onSave(textarea.value);
      if (statusEl) statusEl.textContent = '编辑中…';
      clearTimeout(saveTimer);
      saveTimer = setTimeout(function () {
        if (statusEl) statusEl.textContent = '✓ 草稿已自动保存';
      }, 260);
    });

    textarea.addEventListener('keydown', function (ev) {
      if ((ev.ctrlKey || ev.metaKey) && ev.key === 'Enter') {
        ev.preventDefault();
        if (typeof onRunShortcut === 'function') onRunShortcut();
        return;
      }
      if (ev.key === 'Tab') {
        ev.preventDefault();
        var start = textarea.selectionStart;
        var end = textarea.selectionEnd;
        var val = textarea.value;
        if (ev.shiftKey) {
          var lineStart = val.lastIndexOf('\n', start - 1) + 1;
          if (val.slice(lineStart, lineStart + 4) === '    ') {
            textarea.value = val.slice(0, lineStart) + val.slice(lineStart + 4);
            textarea.selectionStart = Math.max(lineStart, start - 4);
            textarea.selectionEnd = Math.max(lineStart, end - 4);
          }
        } else {
          textarea.value = val.slice(0, start) + '    ' + val.slice(end);
          textarea.selectionStart = textarea.selectionEnd = start + 4;
        }
        textarea.dispatchEvent(new Event('input'));
      }
    });
  }

  function renderOfflineGuide(item, kind, srv) {
    srv = srv || getServerStatus();
    if (srv.mode === 'tauri' && !srv.gpp) {
      return (
        '<div class="offline-banner">' +
          '<h4>🖥️ 桌面版未检测到本机 g++ 编译器</h4>' +
          '<p style="margin:0 0 8px;">当前为 <strong>Tauri 2 原生桌面端</strong>，Rust 后端直接调用本机 <code>g++</code> 编译评测，无需 Python。检测到您的电脑尚未安装 <code>g++</code>（或未加入 <code>PATH</code>）：</p>' +
          '<ol style="margin:0 0 10px;padding-left:18px;font-size:12.5px;color:var(--text-sub);">' +
            '<li>推荐安装 <strong>MSYS2 (UCRT64)</strong>：在终端运行 <code>winget install MSYS2.MSYS2</code>，再打开 MSYS2 执行 <code>pacman -S mingw-w64-ucrt-x86_64-gcc</code>；</li>' +
            '<li>或安装 <strong>MinGW-w64 / Dev-C++</strong> 并将 <code>g++.exe</code> 所在 <code>bin</code> 目录加入系统 <code>PATH</code>；</li>' +
            '<li>安装完成后点击下方按钮即可立即启用本地真编译评测！</li>' +
          '</ol>' +
          '<div style="display:flex;flex-wrap:wrap;gap:8px;">' +
            '<button type="button" class="btn btn-sm btn-primary" id="btn-recheck-srv">🔄 重新检测本机 g++</button>' +
            '<button type="button" class="btn btn-sm" id="btn-offline-download">⬇ 下载当前代码 (.cpp)</button>' +
          '</div>' +
        '</div>'
      );
    }
    if (srv.online && !srv.gpp) {
      return (
        '<div class="offline-banner">' +
          '<h4>⚠️ 本地评测服务已在线，但未检测到 g++ 编译器</h4>' +
          '<p style="margin:0 0 10px;">请先安装 <strong>MSYS2 / MinGW-w64</strong> 并将 <code>g++</code> 加入系统 <code>PATH</code>，随后点击下方按钮重新检测。</p>' +
          '<div style="display:flex;flex-wrap:wrap;gap:8px;">' +
            '<button type="button" class="btn btn-sm btn-primary" id="btn-recheck-srv">🔄 重新检测 g++</button>' +
            '<button type="button" class="btn btn-sm" id="btn-offline-download">⬇ 下载当前代码 (.cpp)</button>' +
          '</div>' +
        '</div>'
      );
    }
    var cmd = kind === 'demo'
      ? ('g++ -std=c++11 -O2 "code/' + (item ? item.filename : 'demo.cpp') + '" -o demo && ./demo')
      : (kind === 'oj'
        ? ('g++ -std=c++11 -O2 ' + (item ? item.id : 'oj01') + '.cpp -o sol && ./sol')
        : ('python judge.py ' + (item ? item.id : '00')));
    return (
      '<div class="offline-banner">' +
        '<h4>📦 当前为纯离线预览模式（未连接本地编译评测引擎）</h4>' +
        '<p style="margin:0 0 8px;">运行 <strong>桌面端 App</strong>，或双击 <code>学习网站/启动学习网站.vbs</code>（无黑框） / <code>启动学习网站.bat</code>，即可开启网页内 <strong>真 g++ 一键编译评测</strong>！</p>' +
        '<p style="margin:0 0 10px;color:var(--text-sub);">离线模式下依然可以自由编写代码（自动保存草稿）、复制样例、查看提示与参考答案，或一键下载本地编译：</p>' +
        '<div style="display:flex;flex-wrap:wrap;gap:8px;">' +
          '<button type="button" class="btn btn-sm btn-primary" id="btn-offline-download">⬇ 下载当前代码 (.cpp)</button>' +
          '<button type="button" class="btn btn-sm" id="btn-offline-copy-cmd" data-cmd="' + escapeHtml(cmd) + '">📋 复制命令：' + escapeHtml(cmd) + '</button>' +
          '<button type="button" class="btn btn-sm" id="btn-recheck-srv">🔄 重新检测服务</button>' +
        '</div>' +
      '</div>'
    );
  }

  function renderJudgeResult(res, lab) {
    if (!res) {
      return (
        '<div style="text-align:center;padding:38px 16px;color:var(--text-muted);">' +
          '<div style="font-size:34px;margin-bottom:8px;">🧪</div>' +
          '<div style="font-weight:700;color:var(--text-main);margin-bottom:6px;">准备好挑战 Lab ' + escapeHtml(lab.id) + ' 了吗？</div>' +
          '<div style="font-size:13px;">写完 TODO 函数后，点击左上角 <strong>▶ 编译并评测本关</strong>（或按 <kbd class="kbd">Ctrl+Enter</kbd>）实时运行全部 ' + (lab.testCount || '?') + ' 项断言测试！</div>' +
        '</div>'
      );
    }

    if (res.loading) {
      return (
        '<div style="display:flex;flex-direction:column;align-items:center;padding:48px 16px;gap:12px;color:var(--text-muted);">' +
          '<div class="spinner"></div>' +
          '<div>正在调用本地 <code>g++ -std=c++11 -Wall -Wextra</code> 编译并执行全部测试…</div>' +
        '</div>'
      );
    }

    if (res.error) {
      return '<div class="judge-summary fail"><strong>❌ 请求失败</strong><span>' + escapeHtml(res.error) + '</span></div>';
    }

    var html = [];

    if (!res.compileOk) {
      html.push(
        '<div class="judge-summary fail">' +
          '<div><strong>❌ 编译未通过 (g++ Compile Error)</strong><div style="font-size:12px;margin-top:2px;">请根据下方报错行号检查语法、分号、类型或头文件。</div></div>' +
          '<span class="badge badge-red">Compile Error</span>' +
        '</div>'
      );
      html.push('<pre class="terminal-pre">' + escapeHtml(res.compileError || res.rawOutput || '未知编译错误') + '</pre>');
      return html.join('');
    }

    if (res.timedOut) {
      html.push(
        '<div class="judge-summary fail">' +
          '<div><strong>⏱ 运行超时（超过 8 秒）</strong><div style="font-size:12px;margin-top:2px;">常见原因：循环条件未收敛（死循环）、链表成环、或递归缺少终止条件！</div></div>' +
          '<span class="badge badge-red">TLE</span>' +
        '</div>'
      );
    } else if (res.crashed) {
      html.push(
        '<div class="judge-summary fail">' +
          '<div><strong>💥 运行时崩溃（段错误 / 异常退出）</strong><div style="font-size:12px;margin-top:2px;">常见原因：解引用空指针 <code>nullptr</code>、数组越界或重复 <code>delete</code>！</div></div>' +
          '<span class="badge badge-red">Runtime Error</span>' +
        '</div>'
      );
    } else if (res.ok || (res.total > 0 && res.passed === res.total)) {
      html.push(
        '<div class="judge-summary pass">' +
          '<div><strong>🎉 恭喜通关！全部 ' + res.passed + ' / ' + res.total + ' 项断言通过！</strong><div style="font-size:12px;margin-top:2px;">代码编译零错误、逻辑严谨，已同步记录通关进度！</div></div>' +
          '<span class="badge badge-green">ALL PASS</span>' +
        '</div>'
      );
    } else {
      html.push(
        '<div class="judge-summary warn">' +
          '<div><strong>🔧 已通过 ' + (res.passed || 0) + ' / ' + (res.total || 0) + ' 项测试</strong><div style="font-size:12px;margin-top:2px;">查看下方红色 [FAIL] 卡片中的期望值、实际值与中文排查提示继续修正！</div></div>' +
          '<span class="badge badge-amber">' + (res.passed || 0) + '/' + (res.total || 0) + '</span>' +
        '</div>'
      );
    }

    if (res.warnings && String(res.warnings).trim()) {
      html.push(
        '<details class="ds-details" style="margin:0;">' +
          '<summary>⚠️ 编译器提示警告（-Wall -Wextra）</summary>' +
          '<div class="ds-details-body"><pre class="terminal-pre">' + escapeHtml(res.warnings) + '</pre></div>' +
        '</details>'
      );
    }

    var cases = Array.isArray(res.cases) ? res.cases.slice() : [];
    if (cases.length) {
      cases.sort(function (a, b) {
        var af = String(a.status).toUpperCase() === 'FAIL' ? 0 : 1;
        var bf = String(b.status).toUpperCase() === 'FAIL' ? 0 : 1;
        return af - bf;
      });
      html.push('<div class="case-list">');
      cases.forEach(function (c) {
        var isPass = String(c.status).toUpperCase() === 'PASS';
        html.push(
          '<div class="case-item ' + (isPass ? 'pass' : 'fail') + '">' +
            '<div class="case-head"><span>' + (isPass ? '✅ [PASS] ' : '❌ [FAIL] ') + escapeHtml(c.name || '测试用例') + '</span></div>' +
            ((!isPass && (c.expected || c.actual))
              ? '<div class="case-detail">期望: ' + escapeHtml(c.expected || '') + '<br/>实际: ' + escapeHtml(c.actual || '') + '</div>'
              : '') +
            ((!isPass && c.hint)
              ? '<div class="case-hint">💡 排查提示：' + escapeHtml(c.hint) + '</div>'
              : '') +
          '</div>'
        );
      });
      html.push('</div>');
    } else if (res.rawOutput) {
      html.push('<pre class="terminal-pre">' + escapeHtml(res.rawOutput) + '</pre>');
    }

    return html.join('');
  }

  function renderOJJudgeResult(res, prob) {
    if (!res) {
      var tcCount = Array.isArray(prob.testCases) ? prob.testCases.length : 5;
      return (
        '<div style="text-align:center;padding:28px 14px;color:var(--text-muted);">' +
          '<div style="font-size:30px;margin-bottom:6px;">🚀</div>' +
          '<div style="font-weight:700;color:var(--text-main);margin-bottom:4px;">从空白 <code>main()</code> 手写完整 C++ 程序</div>' +
          '<div style="font-size:12.5px;">点击 <strong>🚀 提交评测</strong>（或按 <kbd class="kbd">Ctrl+Enter</kbd>）一次性验证全部 ' + tcCount + ' 组标准输入输出测试点！</div>' +
        '</div>'
      );
    }

    if (res.loading) {
      return (
        '<div style="display:flex;flex-direction:column;align-items:center;padding:34px 16px;gap:10px;color:var(--text-muted);">' +
          '<div class="spinner"></div>' +
          '<div style="font-size:13px;">正在用 <code>g++ -std=c++11 -O2 -Wall -Wextra</code> 编译并依次运行多组隐藏测试点…</div>' +
        '</div>'
      );
    }

    if (res.error) {
      return '<div class="judge-summary fail"><strong>❌ 评测请求失败</strong><span>' + escapeHtml(res.error) + '</span></div>';
    }

    var html = [];
    var verdict = String(res.verdict || (res.ok ? 'AC' : (!res.compileOk ? 'CE' : 'WA'))).toUpperCase();

    if (!res.compileOk || verdict === 'CE') {
      html.push(
        '<div class="judge-summary fail">' +
          '<div><strong>编译错误 (Compile Error)</strong><div style="font-size:12px;margin-top:2px;">请检查头文件（如 <code>&lt;vector&gt;</code>、<code>&lt;algorithm&gt;</code>）、分号或变量类型。</div></div>' +
          '<span class="verdict-pill verdict-CE">CE</span>' +
        '</div>'
      );
      html.push('<pre class="terminal-pre">' + escapeHtml(res.compileError || '未知编译错误') + '</pre>');
      return html.join('');
    }

    var sumCls = verdict === 'AC' ? 'pass' : (verdict === 'TLE' ? 'warn' : 'fail');
    var sumTitle = verdict === 'AC'
      ? ('🎉 Accepted! 全部 ' + res.passed + ' / ' + res.total + ' 组测试点通过！')
      : (verdict === 'TLE'
        ? ('⏱ Time Limit Exceeded · 通过 ' + (res.passed || 0) + ' / ' + (res.total || 0))
        : (verdict === 'RE'
          ? ('💥 Runtime Error · 通过 ' + (res.passed || 0) + ' / ' + (res.total || 0))
          : ('❌ Wrong Answer · 通过 ' + (res.passed || 0) + ' / ' + (res.total || 0))));

    html.push(
      '<div class="judge-summary ' + sumCls + '">' +
        '<div><strong>' + sumTitle + '</strong>' +
        '<div style="font-size:12px;margin-top:2px;">' + (verdict === 'AC' ? '恭喜从零手搓通关，已记录 AC 进度！' : '点击下方失败测试点可展开「输入 / 期望输出 / 实际输出」三栏对比！') + '</div></div>' +
        '<span class="verdict-pill verdict-' + escapeHtml(verdict) + '">' + escapeHtml(verdict) + '</span>' +
      '</div>'
    );

    if (res.warnings && String(res.warnings).trim()) {
      html.push(
        '<details class="ds-details" style="margin:0;">' +
          '<summary>⚠️ 编译器警告（-Wall -Wextra）</summary>' +
          '<div class="ds-details-body"><pre class="terminal-pre">' + escapeHtml(res.warnings) + '</pre></div>' +
        '</details>'
      );
    }

    var cases = Array.isArray(res.cases) ? res.cases : [];
    var firstFailOpened = false;
    cases.forEach(function (c, idx) {
      var st = String(c.status || 'WA').toUpperCase();
      var isAC = st === 'AC';
      var shouldOpen = !isAC && !firstFailOpened;
      if (shouldOpen) firstFailOpened = true;
      var icon = isAC ? '✅' : (st === 'TLE' ? '⏱' : (st === 'RE' ? '💥' : '❌'));
      var timeStr = typeof c.timeMs === 'number' ? (c.timeMs + ' ms') : '';
      html.push(
        '<details class="oj-case-card status-' + escapeHtml(st) + '"' + (shouldOpen ? ' open' : '') + '>' +
          '<summary>' +
            '<span>' + icon + ' #' + (c.index != null ? c.index : (idx + 1)) + ' ' + escapeHtml(c.label || ('测试点 ' + (idx + 1))) + '</span>' +
            '<span style="display:inline-flex;align-items:center;gap:8px;">' +
              (timeStr ? '<span style="font-family:var(--font-mono);font-size:11px;color:var(--text-muted);">' + escapeHtml(timeStr) + '</span>' : '') +
              '<span class="verdict-pill verdict-' + escapeHtml(st) + '">' + escapeHtml(st) + '</span>' +
            '</span>' +
          '</summary>' +
          '<div class="oj-diff-grid">' +
            '<div class="oj-diff-col"><div class="oj-diff-lbl">输入 (stdin)</div><pre class="oj-diff-pre">' + escapeHtml(c.input || '(空)') + '</pre></div>' +
            '<div class="oj-diff-col"><div class="oj-diff-lbl">期望输出</div><pre class="oj-diff-pre">' + escapeHtml(c.expected || '') + '</pre></div>' +
            '<div class="oj-diff-col"><div class="oj-diff-lbl">实际输出' + (c.error ? ' / 异常' : '') + '</div><pre class="oj-diff-pre">' + escapeHtml(c.error ? ((c.actual ? c.actual + '\n' : '') + '[错误] ' + c.error) : (c.actual || '(无输出)')) + '</pre></div>' +
          '</div>' +
        '</details>'
      );
    });

    return html.join('');
  }

  function renderDemoResult(res, titleText) {
    if (!res) {
      return (
        '<div style="text-align:center;padding:28px 16px;color:var(--text-muted);">' +
          '<div style="font-size:28px;margin-bottom:6px;">▶️</div>' +
          '<div style="font-weight:700;color:var(--text-main);margin-bottom:4px;">' + escapeHtml(titleText || '准备运行') + '</div>' +
          '<div style="font-size:12.5px;">点击运行按钮即可编译执行并实时查看标准输出 (stdout) 与错误信息 (stderr)。</div>' +
        '</div>'
      );
    }
    if (res.loading) {
      return '<div style="display:flex;flex-direction:column;align-items:center;padding:34px 16px;gap:10px;color:var(--text-muted);"><div class="spinner"></div><div>正在用本地 g++ 编译并运行程序…</div></div>';
    }
    if (res.error) {
      return '<div class="judge-summary fail"><strong>❌ 运行失败</strong><span>' + escapeHtml(res.error) + '</span></div>';
    }
    if (!res.compileOk) {
      return (
        '<div class="judge-summary fail"><strong>❌ 编译错误</strong><span class="verdict-pill verdict-CE">CE</span></div>' +
        '<pre class="terminal-pre">' + escapeHtml(res.compileError || '未知错误') + '</pre>'
      );
    }
    if (res.timedOut) {
      return '<div class="judge-summary warn"><strong>⏱ 运行超时（请检查是否缺少标准输入或存在死循环）</strong><span class="verdict-pill verdict-TLE">TLE</span></div>';
    }
    var ok = res.exitCode === 0;
    return (
      '<div class="judge-summary ' + (ok ? 'pass' : 'warn') + '">' +
        '<strong>' + (ok ? '✅ 编译并运行成功' : '⚠️ 程序退出码：' + res.exitCode) + '</strong>' +
        '<span class="badge ' + (ok ? 'badge-green' : 'badge-amber') + '">exit ' + res.exitCode + '</span>' +
      '</div>' +
      '<div><div style="font-size:12px;font-weight:700;color:var(--text-muted);margin-bottom:5px;">标准输出 (stdout)</div>' +
      '<pre class="terminal-pre">' + escapeHtml(res.stdout || '(无输出)') + '</pre></div>' +
      (res.stderr ? '<div><div style="font-size:12px;font-weight:700;color:var(--red);margin-bottom:5px;">标准错误 (stderr)</div><pre class="terminal-pre">' + escapeHtml(res.stderr) + '</pre></div>' : '')
    );
  }

  function renderDifficultyStars(diff) {
    var d = Math.max(1, Math.min(3, Number(diff) || 1));
    return '<span class="diff-stars" title="难度 ' + d + ' 星">' + '★'.repeat(d) + '☆'.repeat(3 - d) + '</span>';
  }

  function render(containerEl, token) {
    if (token !== undefined && !isStillMounted(token, containerEl)) return;
    var mountToken = token !== undefined ? token : activeMountToken;
    var labs = global.DS_LABS || [];
    var ojs = global.DS_OJ_PROBLEMS || [];
    var demos = global.DS_DEMOS || [];
    var srv = getServerStatus();

    if (!state.labId && labs.length) state.labId = labs[0].id;
    if (!state.ojId && ojs.length) state.ojId = ojs[0].id;
    if (!state.demoFilename && demos.length) state.demoFilename = demos[0].filename;

    var passedLabsCount = labs.filter(function (l) { return isLabPassed(l.id); }).length;
    var passedOJCount = ojs.filter(function (p) { return isOJPassed(p.id); }).length;

    var statusBadgeHtml = '';
    if (srv.mode === 'tauri' && srv.gpp) {
      statusBadgeHtml = '<span class="badge badge-green">🖥️ 桌面版 · g++ 直连就绪 · ' + escapeHtml(srv.gppVersion || 'g++') + '</span>';
    } else if (srv.mode === 'tauri' && !srv.gpp) {
      statusBadgeHtml = '<span class="badge badge-amber">🖥️ 桌面版 · 需安装 MinGW/MSYS2 g++</span>';
    } else if (srv.online && srv.gpp) {
      statusBadgeHtml = '<span class="badge badge-green">🟢 g++ 在线评测就绪 · ' + escapeHtml(srv.gppVersion || 'g++') + '</span>';
    } else if (srv.online && !srv.gpp) {
      statusBadgeHtml = '<span class="badge badge-amber">⚠️ 本地服务在线但未检出 g++</span>';
    } else {
      statusBadgeHtml = '<span class="badge badge-amber">📦 纯离线预览模式（启动桌面版或双击 启动学习网站.vbs 开启真编译）</span>';
    }

    var topBarHtml =
      '<div class="lab-top-bar">' +
        '<div class="mode-tabs">' +
          '<button type="button" class="mode-tab' + (state.mode === 'labs' ? ' active' : '') + '" data-lab-mode="labs">🧩 15 关骨架挖空 (' + passedLabsCount + '/' + labs.length + ')</button>' +
          '<button type="button" class="mode-tab' + (state.mode === 'oj' ? ' active' : '') + '" data-lab-mode="oj">🔥 16 题全手搓 OJ (' + passedOJCount + '/' + ojs.length + ')</button>' +
          '<button type="button" class="mode-tab' + (state.mode === 'demos' ? ' active' : '') + '" data-lab-mode="demos">📦 30 个示例运行库 (' + demos.length + ')</button>' +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">' +
          statusBadgeHtml +
        '</div>' +
      '</div>';

    if (state.mode === 'oj') {
      renderOJMode(containerEl, topBarHtml, ojs, srv, mountToken);
    } else if (state.mode === 'demos') {
      renderDemosMode(containerEl, topBarHtml, demos, srv, mountToken);
    } else {
      renderLabsMode(containerEl, topBarHtml, labs, srv, mountToken);
    }
  }

  /* ========================================================================
     模式 1：🧩 15 关骨架挖空（新增「🔥 纯手搓练习模式」切换）
     ======================================================================== */
  function renderLabsMode(containerEl, topBarHtml, labs, srv, token) {
    var curLab = labs.find(function (l) { return l.id === state.labId; }) || labs[0];
    if (!curLab) {
      containerEl.innerHTML = topBarHtml + '<div class="card" style="padding:32px;text-align:center;">未加载到实验数据 (DS_LABS)</div>';
      return;
    }
    state.labId = curLab.id;
    localStorage.setItem('ds_last_lab', curLab.id);

    var q = state.filterText.trim().toLowerCase();
    var filteredLabs = labs.filter(function (l) {
      if (!q) return true;
      return (l.id + ' ' + l.title + ' ' + (l.desc || '') + ' ' + (l.chapterId || '')).toLowerCase().indexOf(q) !== -1;
    });

    var listHtml = filteredLabs.map(function (l) {
      var passed = isLabPassed(l.id);
      var draft = hasCustomDraft(l);
      var icon = passed ? '✅' : (draft ? '🔧' : '⬜');
      return (
        '<button type="button" class="lab-list-item' + (l.id === curLab.id ? ' active' : '') + '" data-select-lab="' + escapeHtml(l.id) + '">' +
          '<span class="lab-item-icon">' + icon + '</span>' +
          '<div class="lab-item-info">' +
            '<div class="lab-item-title">Lab ' + escapeHtml(l.id) + ' · ' + escapeHtml(l.title) + '</div>' +
            '<div class="lab-item-sub">第 ' + escapeHtml(l.chapterId || '?') + ' 章 · ' + (l.testCount || '?') + ' 项测试</div>' +
          '</div>' +
        '</button>'
      );
    }).join('');

    var codeVal = getDraft(curLab);
    var isPassed = isLabPassed(curLab.id);

    var hintsHtml = '';
    if (state.showHints) {
      var hints = Array.isArray(curLab.hints) ? curLab.hints : [];
      hintsHtml =
        '<div class="card drawer-card">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
            '<strong>💡 不剧透分步推导提示（共 ' + hints.length + ' 组）</strong>' +
            '<button type="button" class="btn btn-sm" id="btn-close-hints">收起</button>' +
          '</div>' +
          (hints.length
            ? hints.map(function (h, idx) {
                return (
                  '<details class="ds-details" style="margin:6px 0;"' + (idx === 0 ? ' open' : '') + '>' +
                    '<summary>步骤 ' + (idx + 1) + '：' + escapeHtml(h.sig || '思路引导') + '</summary>' +
                    '<div class="ds-details-body"><ul style="margin:0;padding-left:18px;font-size:13px;">' +
                      (h.lines || []).map(function (ln) { return '<li>' + escapeHtml(ln) + '</li>'; }).join('') +
                    '</ul></div>' +
                  '</details>'
                );
              }).join('')
            : '<p style="margin:0;font-size:13px;color:var(--text-muted);">请直接阅读代码中的 TODO 注释推导每一步逻辑。</p>') +
        '</div>';
    }

    var solHtml = '';
    if (state.showSolution) {
      var solBlock = global.DSRenderer
        ? global.DSRenderer.renderCodeBlockHtml(curLab.solutionCode || '// 暂无参考答案', 'cpp')
        : '<pre class="terminal-pre">' + escapeHtml(curLab.solutionCode || '') + '</pre>';
      solHtml =
        '<div class="card drawer-card" style="border-left-color:var(--purple);">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:8px;">' +
            '<strong>🔑 参考答案对比（建议先独立手写 15 分钟再参考！）</strong>' +
            '<div style="display:flex;gap:6px;">' +
              '<button type="button" class="btn btn-sm btn-soft" id="btn-apply-solution">📥 填入编辑器试跑</button>' +
              '<button type="button" class="btn btn-sm" id="btn-close-solution">收起</button>' +
            '</div>' +
          '</div>' +
          '<div class="md-body">' + solBlock + '</div>' +
        '</div>';
    }

    containerEl.innerHTML =
      topBarHtml +
      '<div class="lab-layout">' +
        '<aside class="card lab-list-card">' +
          '<div class="lab-list-head">' +
            '<input id="lab-filter-input" class="lab-filter-input" type="text" placeholder="🔍 筛选 15 关实验…" value="' + escapeHtml(state.filterText) + '" />' +
          '</div>' +
          '<div class="lab-list-scroll">' + (listHtml || '<div style="padding:16px;font-size:12.5px;color:var(--text-muted);">无匹配关卡</div>') + '</div>' +
        '</aside>' +
        '<section class="lab-workspace">' +
          '<div class="card lab-header-card">' +
            '<div class="lab-header-top">' +
              '<div>' +
                '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">' +
                  '<span class="badge badge-blue">Lab ' + escapeHtml(curLab.id) + '</span>' +
                  '<span class="badge ' + (isPassed ? 'badge-green' : 'badge-amber') + '">' + (isPassed ? '✅ 已通关' : '🔧 待通关') + '</span>' +
                  '<span class="badge">断言数 ' + (curLab.testCount || '?') + '</span>' +
                  '<h2 class="lab-title">' + escapeHtml(curLab.title) + '</h2>' +
                '</div>' +
                '<p class="lab-desc">' + escapeHtml(curLab.desc || '') + '</p>' +
              '</div>' +
              '<div style="display:flex;gap:6px;flex-wrap:wrap;">' +
                (curLab.chapterId ? '<button type="button" class="btn btn-sm btn-soft" id="btn-lab-to-chapter">📖 复习第 ' + escapeHtml(curLab.chapterId) + ' 章笔记</button>' : '') +
              '</div>' +
            '</div>' +
          '</div>' +
          hintsHtml +
          solHtml +
          '<div class="lab-split">' +
            '<div class="card editor-card">' +
              '<div class="editor-toolbar">' +
                '<div class="editor-toolbar-left">' +
                  '<button type="button" class="btn btn-primary" id="btn-run-judge"' + (state.running ? ' disabled' : '') + '>' +
                    (state.running ? '⏳ 编译评测中…' : '▶ 编译并评测本关') +
                  '</button>' +
                  (srv.online
                    ? '<label class="checkbox-label" title="勾选后评测时会同步写回硬盘上的 labs 目录对应 todo.cpp"><input type="checkbox" id="chk-save-disk"' + (state.saveToDisk ? ' checked' : '') + ' /> 💾 同步保存到 labs</label>'
                    : '') +
                '</div>' +
                '<div class="editor-toolbar-right">' +
                  '<button type="button" class="btn btn-sm btn-soft" id="btn-pure-scratch" title="清空函数体引导注释与占位框架，仅保留结构体与 main() 测试套进行盲写练习">🔥 纯手搓练习</button>' +
                  '<button type="button" class="btn btn-sm' + (state.showHints ? ' btn-soft' : '') + '" id="btn-toggle-hints">💡 思路提示</button>' +
                  '<button type="button" class="btn btn-sm' + (state.showSolution ? ' btn-soft' : '') + '" id="btn-toggle-solution">🔑 参考答案</button>' +
                  '<button type="button" class="btn btn-sm" id="btn-reset-lab" title="重置为初始 todo.cpp 挖空引导版">↺ 重置</button>' +
                  '<button type="button" class="btn btn-sm" id="btn-dl-lab" title="下载为 lab' + escapeHtml(curLab.id) + '_todo.cpp">⬇ 下载</button>' +
                '</div>' +
              '</div>' +
              '<div class="code-editor-wrap">' +
                '<pre class="code-gutter" id="lab-gutter" aria-hidden="true"></pre>' +
                '<textarea class="code-textarea" id="lab-editor" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off"></textarea>' +
              '</div>' +
              '<div class="editor-statusbar">' +
                '<span>labs/' + escapeHtml(curLab.folder || '') + '/lab' + escapeHtml(curLab.id) + '_todo.cpp · Tab=4空格 · Ctrl+Enter 评测</span>' +
                '<span id="lab-save-status">✓ 已载入</span>' +
              '</div>' +
            '</div>' +
            '<div class="card output-card" id="lab-output-panel">' +
              ((!srv.online || !srv.gpp) ? renderOfflineGuide(curLab, 'lab', srv) : '') +
              renderJudgeResult(state.lastJudgeResult, curLab) +
            '</div>' +
          '</div>' +
        '</section>' +
      '</div>';

    var editorEl = containerEl.querySelector('#lab-editor');
    var gutterEl = containerEl.querySelector('#lab-gutter');
    var statusEl = containerEl.querySelector('#lab-save-status');
    editorEl.value = codeVal;

    function runJudge() {
      var curSrv = getServerStatus();
      var code = editorEl.value;
      localStorage.setItem(DRAFT_PREFIX + curLab.id, code);
      if (!curSrv.online || !curSrv.gpp) {
        if (curSrv.mode === 'tauri' || curSrv.online) {
          notify('未检测到本机 g++，请先安装 MSYS2 / MinGW-w64 后点击「重新检测本机 g++」！', 'warn');
        } else {
          notify('当前为离线模式，请运行桌面端或双击「启动学习网站.vbs」开启本地 g++ 评测！', 'warn');
        }
        return;
      }
      if (state.running) return;
      state.running = true;
      state.lastJudgeResult = { loading: true };
      render(containerEl, token);

      var judgePromise = (global.DSBackend && typeof global.DSBackend.judgeLab === 'function')
        ? global.DSBackend.judgeLab({ labId: curLab.id, code: code, saveToDisk: !!state.saveToDisk })
        : Promise.reject(new Error('后端桥接未就绪'));

      judgePromise
        .then(function (data) {
          state.running = false;
          state.lastJudgeResult = data;
          if (data && (data.ok || (data.compileOk && data.total > 0 && data.passed === data.total))) {
            var passRes = (global.DSGamify && typeof global.DSGamify.markLabPassed === 'function')
              ? global.DSGamify.markLabPassed(curLab.id)
              : null;
            if (!passRes || !passRes.newlyPassed) {
              if (global.DSGamify && typeof global.DSGamify.celebrate === 'function') {
                global.DSGamify.celebrate('🎉 Lab ' + curLab.id + ' 再次全绿通关！');
              } else if (global.DSApp && typeof global.DSApp.celebrate === 'function') {
                global.DSApp.celebrate();
              }
            }
          }
          if (isStillMounted(token, containerEl)) render(containerEl, token);
        })
        .catch(function (err) {
          state.running = false;
          state.lastJudgeResult = { error: String(err && err.message ? err.message : err) };
          if (isStillMounted(token, containerEl)) render(containerEl, token);
        });
    }

    function flushLabDraft() {
      if (editorEl) localStorage.setItem(DRAFT_PREFIX + curLab.id, editorEl.value);
    }

    bindEditorBehavior(editorEl, gutterEl, statusEl, function (val) {
      localStorage.setItem(DRAFT_PREFIX + curLab.id, val);
    }, runJudge);

    bindCommonEvents(containerEl, curLab, editorEl, 'lab', token, flushLabDraft);

    var btnRun = containerEl.querySelector('#btn-run-judge');
    if (btnRun) btnRun.addEventListener('click', runJudge);

    var chkSave = containerEl.querySelector('#chk-save-disk');
    if (chkSave) chkSave.addEventListener('change', function () { state.saveToDisk = chkSave.checked; });

    var btnPure = containerEl.querySelector('#btn-pure-scratch');
    if (btnPure) {
      btnPure.addEventListener('click', function () {
        var stripped = toPureScratchCode(curLab.todoCode || '');
        localStorage.setItem(DRAFT_PREFIX + curLab.id, stripped);
        state.lastJudgeResult = null;
        notify('🔥 已切换为纯手搓练习模式（移除引导注释与函数体，点「重置」可随时恢复挖空版）', 'info');
        render(containerEl, token);
      });
    }

    var btnHints = containerEl.querySelector('#btn-toggle-hints');
    if (btnHints) btnHints.addEventListener('click', function () { flushLabDraft(); state.showHints = !state.showHints; render(containerEl, token); });
    var btnCloseHints = containerEl.querySelector('#btn-close-hints');
    if (btnCloseHints) btnCloseHints.addEventListener('click', function () { flushLabDraft(); state.showHints = false; render(containerEl, token); });

    var btnSol = containerEl.querySelector('#btn-toggle-solution');
    if (btnSol) btnSol.addEventListener('click', function () { flushLabDraft(); state.showSolution = !state.showSolution; render(containerEl, token); });
    var btnCloseSol = containerEl.querySelector('#btn-close-solution');
    if (btnCloseSol) btnCloseSol.addEventListener('click', function () { flushLabDraft(); state.showSolution = false; render(containerEl, token); });

    var btnApplySol = containerEl.querySelector('#btn-apply-solution');
    if (btnApplySol) {
      btnApplySol.addEventListener('click', function () {
        if (confirm('确定将参考答案填入当前编辑器？（会覆盖你当前的草稿）')) {
          localStorage.setItem(DRAFT_PREFIX + curLab.id, curLab.solutionCode || '');
          state.lastJudgeResult = null;
          notify('已填入参考答案，现在可以点击「编译并评测」验证！', 'info');
          render(containerEl, token);
        }
      });
    }

    var btnReset = containerEl.querySelector('#btn-reset-lab');
    if (btnReset) {
      btnReset.addEventListener('click', function () {
        if (confirm('确定重置为初始 lab' + curLab.id + '_todo.cpp 挖空引导模板？')) {
          localStorage.removeItem(DRAFT_PREFIX + curLab.id);
          state.lastJudgeResult = null;
          notify('已恢复原挖空引导模板', 'info');
          render(containerEl, token);
        }
      });
    }

    var btnDl = containerEl.querySelector('#btn-dl-lab');
    if (btnDl) {
      btnDl.addEventListener('click', function () {
        downloadFile('lab' + curLab.id + '_todo.cpp', editorEl.value);
        notify('已下载 lab' + curLab.id + '_todo.cpp', 'success');
      });
    }

    var btnToChap = containerEl.querySelector('#btn-lab-to-chapter');
    if (btnToChap) {
      btnToChap.addEventListener('click', function () {
        global.DSApp.navigate('reader', { chapterId: curLab.chapterId });
      });
    }

    containerEl.querySelectorAll('.md-copy-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        var c = decodeURIComponent(b.getAttribute('data-copy-code') || '');
        copyText(c).then(function () { notify('代码已复制', 'success'); });
      });
    });
  }

  /* ========================================================================
     模式 2：🔥 16 题全手搓 OJ 编程工作台（LeetCode/洛谷级双栏 IDE）
     ======================================================================== */
  function renderOJMode(containerEl, topBarHtml, ojs, srv, token) {
    if (!ojs.length) {
      containerEl.innerHTML = topBarHtml + '<div class="card" style="padding:36px;text-align:center;">正在加载 16 题全手搓 OJ 题库 (DS_OJ_PROBLEMS)…</div>';
      return;
    }

    var curProb = ojs.find(function (p) { return p.id === state.ojId; }) || ojs[0];
    state.ojId = curProb.id;
    localStorage.setItem('ds_last_oj', curProb.id);

    // 若当前自定义输入为空，默认预填样例 1 输入方便学生一键自测
    var samples = Array.isArray(curProb.samples) ? curProb.samples : [];
    if (state.ojCustomStdin === '' && samples.length && samples[0].input) {
      state.ojCustomStdin = samples[0].input;
    }

    var q = state.filterText.trim().toLowerCase();
    var filtered = ojs.filter(function (p) {
      if (state.ojChapterFilter !== 'all' && p.chapterId !== state.ojChapterFilter) return false;
      if (state.ojDiffFilter !== 'all' && String(p.difficulty) !== state.ojDiffFilter) return false;
      if (!q) return true;
      return (p.id + ' ' + p.num + ' ' + p.title + ' ' + (p.summary || '') + ' ' + (p.tags || []).join(' ')).toLowerCase().indexOf(q) !== -1;
    });

    var listHtml = filtered.map(function (p) {
      var ac = isOJPassed(p.id);
      var draft = hasCustomOJDraft(p);
      var ico = ac ? '✅' : (draft ? '🔧' : '⬜');
      var numStr = '#' + String(p.num).padStart(2, '0');
      return (
        '<button type="button" class="lab-list-item' + (p.id === curProb.id ? ' active' : '') + '" data-select-oj="' + escapeHtml(p.id) + '">' +
          '<span class="lab-item-icon">' + ico + '</span>' +
          '<div class="lab-item-info">' +
            '<div class="lab-item-title">' + numStr + ' ' + escapeHtml(p.title) + '</div>' +
            '<div class="lab-item-sub">第 ' + escapeHtml(p.chapterId) + ' 章 · ' + '★'.repeat(p.difficulty || 1) + ' · ' + ((p.testCases && p.testCases.length) || 5) + ' 组用例</div>' +
          '</div>' +
        '</button>'
      );
    }).join('');

    var isAC = isOJPassed(curProb.id);
    var descHtml = global.DSRenderer
      ? global.DSRenderer.render(curProb.description || curProb.summary || '', { chapterId: null, enableSectionCheck: false })
      : '<p>' + escapeHtml(curProb.description || '') + '</p>';

    var samplesHtml = samples.map(function (sp, idx) {
      return (
        '<div class="oj-sample-card">' +
          '<div class="oj-sample-head">' +
            '<span>样例 ' + (idx + 1) + '</span>' +
            '<div style="display:flex;gap:5px;">' +
              '<button type="button" class="btn btn-sm" data-oj-copy-sample="' + idx + '">📋 复制输入</button>' +
              '<button type="button" class="btn btn-sm btn-soft" data-oj-fill-sample="' + idx + '">🧪 填入自测框</button>' +
            '</div>' +
          '</div>' +
          '<div class="oj-sample-grid">' +
            '<div class="oj-sample-col"><div class="oj-sample-col-lbl">标准输入</div><pre class="oj-sample-pre">' + escapeHtml(sp.input || '') + '</pre></div>' +
            '<div class="oj-sample-col"><div class="oj-diff-lbl" style="margin-bottom:4px;">期望输出</div><pre class="oj-sample-pre">' + escapeHtml(sp.output || '') + '</pre></div>' +
          '</div>' +
          (sp.explain ? '<div class="oj-sample-explain">💡 说明：' + renderMiniMd(sp.explain) + '</div>' : '') +
        '</div>'
      );
    }).join('');

    var hints = Array.isArray(curProb.hints) ? curProb.hints : [];
    var hintsBlockHtml = hints.map(function (hText, idx) {
      var title = idx === 0 ? '💡 思路提示（点开查看）' : (idx === 1 ? '🧱 数据结构与边界提示（点开查看）' : ('💡 进阶提示 ' + (idx + 1)));
      return (
        '<details class="ds-details" style="margin:8px 0;">' +
          '<summary>' + title + '</summary>' +
          '<div class="ds-details-body md-body" style="font-size:13px;">' + renderMiniMd(hText) + '</div>' +
        '</details>'
      );
    }).join('');

    var solRevealHtml = state.ojSolutionUnlocked
      ? ('<div style="margin-top:10px;">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">' +
            '<strong style="font-size:13px;">🔑 完整 C++11 参考实现</strong>' +
            '<div style="display:flex;gap:6px;">' +
              '<button type="button" class="btn btn-sm btn-soft" id="btn-oj-apply-sol">📥 填入编辑器</button>' +
              '<button type="button" class="btn btn-sm" id="btn-oj-hide-sol">收起</button>' +
            '</div>' +
          '</div>' +
          '<div class="md-body">' +
            (global.DSRenderer
              ? global.DSRenderer.renderCodeBlockHtml(curProb.solutionCode || '', 'cpp')
              : '<pre class="terminal-pre">' + escapeHtml(curProb.solutionCode || '') + '</pre>') +
          '</div>' +
        '</div>')
      : '<div style="margin-top:10px;"><button type="button" class="btn btn-sm" id="btn-oj-unlock-sol">🔑 查看完整参考代码（需确认）</button></div>';

    var tcTotal = Array.isArray(curProb.testCases) ? curProb.testCases.length : 5;
    var codeVal = getOJDraft(curProb);

    var panelBodyHtml = '';
    if (state.ojPanelTab === 'judge') {
      panelBodyHtml =
        ((!srv.online || !srv.gpp) ? renderOfflineGuide(curProb, 'oj', srv) : '') +
        renderOJJudgeResult(state.lastOJResult, curProb);
    } else {
      panelBodyHtml =
        ((!srv.online || !srv.gpp) ? renderOfflineGuide(curProb, 'oj', srv) : '') +
        '<div>' +
          '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px;flex-wrap:wrap;">' +
            '<span style="font-size:12px;font-weight:700;color:var(--text-sub);">自定义标准输入 (stdin)</span>' +
            '<div style="display:flex;gap:5px;flex-wrap:wrap;">' +
              samples.map(function (_, idx) {
                return '<button type="button" class="btn btn-sm" data-oj-fill-sample="' + idx + '">填入样例 ' + (idx + 1) + '</button>';
              }).join('') +
              '<button type="button" class="btn btn-sm btn-primary" id="btn-oj-run-custom"' + (state.running ? ' disabled' : '') + '>' +
                (state.running ? '⏳ 运行中…' : '▶ 自测运行') +
              '</button>' +
            '</div>' +
          '</div>' +
          '<textarea id="oj-stdin-input" class="stdin-textarea" placeholder="在此输入自定义测试数据，或点击上方「填入样例」…">' + escapeHtml(state.ojCustomStdin) + '</textarea>' +
        '</div>' +
        renderDemoResult(state.lastOJCustomResult, '自测运行输出区');
    }

    containerEl.innerHTML =
      topBarHtml +
      '<div class="oj-layout' + (state.ojFocusCoding ? ' focus-coding' : '') + '">' +
        '<aside class="card lab-list-card">' +
          '<div class="lab-list-head">' +
            '<input id="lab-filter-input" class="lab-filter-input" type="text" placeholder="🔍 搜索 16 题全手搓 OJ…" value="' + escapeHtml(state.filterText) + '" />' +
            '<div class="oj-filter-row">' +
              '<select id="oj-chap-filter" class="oj-filter-select">' +
                '<option value="all">全部章节</option>' +
                ['00', '01', '02', '03', '04', '05', '06', '07'].map(function (c) {
                  return '<option value="' + c + '"' + (state.ojChapterFilter === c ? ' selected' : '') + '>第 ' + c + ' 章</option>';
                }).join('') +
              '</select>' +
              '<select id="oj-diff-filter" class="oj-filter-select">' +
                '<option value="all">全部难度</option>' +
                '<option value="1"' + (state.ojDiffFilter === '1' ? ' selected' : '') + '>★ 入门</option>' +
                '<option value="2"' + (state.ojDiffFilter === '2' ? ' selected' : '') + '>★★ 进阶</option>' +
                '<option value="3"' + (state.ojDiffFilter === '3' ? ' selected' : '') + '>★★★ 挑战</option>' +
              '</select>' +
            '</div>' +
          '</div>' +
          '<div class="lab-list-scroll">' + (listHtml || '<div style="padding:16px;font-size:12.5px;color:var(--text-muted);">无匹配题目</div>') + '</div>' +
        '</aside>' +
        '<div class="oj-workspace">' +
          '<article class="card oj-statement-card">' +
            '<div class="oj-stmt-head">' +
              '<div>' +
                '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">' +
                  '<span class="badge badge-blue">#' + String(curProb.num).padStart(2, '0') + '</span>' +
                  '<span class="badge">第 ' + escapeHtml(curProb.chapterId) + ' 章</span>' +
                  renderDifficultyStars(curProb.difficulty) +
                  '<span class="badge ' + (isAC ? 'badge-green' : 'badge-amber') + '">' + (isAC ? '✅ 已 AC' : '🔥 待挑战') + '</span>' +
                '</div>' +
                '<h2 class="oj-stmt-title">' + escapeHtml(curProb.title) + '</h2>' +
                '<div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:6px;">' +
                  (curProb.tags || []).map(function (t) { return '<span class="badge badge-purple">' + escapeHtml(t) + '</span>'; }).join('') +
                '</div>' +
              '</div>' +
              '<div style="display:flex;flex-direction:column;gap:5px;flex-shrink:0;">' +
                '<button type="button" class="btn btn-sm' + (state.ojFocusCoding ? ' btn-soft' : '') + '" id="btn-oj-focus" title="折叠左侧题目列表，最大化编程空间">' + (state.ojFocusCoding ? '📐 显示题单' : '⤢ 专注编码') + '</button>' +
                '<button type="button" class="btn btn-sm" id="btn-oj-to-chapter">📖 第 ' + escapeHtml(curProb.chapterId) + ' 章</button>' +
              '</div>' +
            '</div>' +
            '<div class="md-body" style="font-size:14px;">' + descHtml + '</div>' +
            '<div class="oj-section-label">📥 输入格式</div>' +
            '<div class="oj-io-box md-body">' + renderMiniMd(curProb.inputFormat || '') + '</div>' +
            '<div class="oj-section-label">📤 输出格式</div>' +
            '<div class="oj-io-box md-body">' + renderMiniMd(curProb.outputFormat || '') + '</div>' +
            (curProb.constraints ? '<div class="oj-section-label">📏 数据范围与约定</div><div class="oj-io-box md-body">' + renderMiniMd(curProb.constraints) + '</div>' : '') +
            '<div class="oj-section-label">🧪 示例输入与输出</div>' +
            samplesHtml +
            '<div class="oj-section-label">💡 提示与参考</div>' +
            hintsBlockHtml +
            solRevealHtml +
          '</article>' +
          '<div class="oj-ide-col">' +
            '<div class="card editor-card">' +
              '<div class="editor-toolbar">' +
                '<div class="editor-toolbar-left">' +
                  '<button type="button" class="btn btn-primary" id="btn-oj-submit"' + (state.running ? ' disabled' : '') + '>' +
                    (state.running ? '⏳ 评测中…' : '🚀 提交评测 (' + tcTotal + '组)') +
                  '</button>' +
                  '<button type="button" class="btn btn-sm btn-soft" id="btn-oj-quick-test"' + (state.running ? ' disabled' : '') + '>▶ 样例自测</button>' +
                '</div>' +
                '<div class="editor-toolbar-right">' +
                  '<button type="button" class="btn btn-sm" id="btn-oj-reset" title="重置为空白 main() 起步模板">↺ 重置空白</button>' +
                  '<button type="button" class="btn btn-sm" id="btn-oj-dl">⬇ 下载 .cpp</button>' +
                '</div>' +
              '</div>' +
              '<div class="code-editor-wrap oj-editor-wrap">' +
                '<pre class="code-gutter" id="lab-gutter" aria-hidden="true"></pre>' +
                '<textarea class="code-textarea" id="lab-editor" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off"></textarea>' +
              '</div>' +
              '<div class="editor-statusbar">' +
                '<span>' + escapeHtml(curProb.id) + '.cpp (C++11 ACM 标准 I/O) · Tab=4空格 · Ctrl+Enter 提交</span>' +
                '<span id="lab-save-status">✓ 已载入</span>' +
              '</div>' +
            '</div>' +
            '<div class="card oj-panel-card">' +
              '<div class="oj-panel-tabs">' +
                '<div class="oj-panel-tab-group">' +
                  '<button type="button" class="oj-panel-tab' + (state.ojPanelTab === 'judge' ? ' active' : '') + '" data-oj-tab="judge">🚀 提交评测（' + tcTotal + ' 组用例）</button>' +
                  '<button type="button" class="oj-panel-tab' + (state.ojPanelTab === 'custom' ? ' active' : '') + '" data-oj-tab="custom">🧪 自定义输入自测</button>' +
                '</div>' +
                (state.lastOJResult && state.lastOJResult.verdict
                  ? '<span class="verdict-pill verdict-' + escapeHtml(state.lastOJResult.verdict) + '">' + escapeHtml(state.lastOJResult.verdict) + ' ' + (state.lastOJResult.passed || 0) + '/' + (state.lastOJResult.total || tcTotal) + '</span>'
                  : '') +
              '</div>' +
              '<div class="oj-panel-body" id="oj-panel-body">' + panelBodyHtml + '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    var editorEl = containerEl.querySelector('#lab-editor');
    var gutterEl = containerEl.querySelector('#lab-gutter');
    var statusEl = containerEl.querySelector('#lab-save-status');
    editorEl.value = codeVal;

    function submitOJ() {
      var curSrv = getServerStatus();
      var code = editorEl.value;
      localStorage.setItem(OJ_DRAFT_PREFIX + curProb.id, code);
      state.ojPanelTab = 'judge';
      if (!curSrv.online || !curSrv.gpp) {
        if (curSrv.mode === 'tauri' || curSrv.online) {
          notify('未检测到本机 g++，请先安装 MSYS2 / MinGW-w64 后重新检测！', 'warn');
        } else {
          notify('当前为离线模式，请运行桌面端或双击「启动学习网站.vbs」解锁全手搓真编译评测！', 'warn');
        }
        render(containerEl, token);
        return;
      }
      if (state.running) return;
      state.running = true;
      state.lastOJResult = { loading: true };
      render(containerEl, token);

      var p = (global.DSBackend && typeof global.DSBackend.judgeOJ === 'function')
        ? global.DSBackend.judgeOJ({
            problemId: curProb.id,
            code: code,
            testCases: curProb.testCases || []
          })
        : Promise.reject(new Error('DSBackend.judgeOJ 未就绪'));

      p.then(function (data) {
        state.running = false;
        state.lastOJResult = data;
        if (data && (data.ok || data.verdict === 'AC')) {
          var acRes = (global.DSGamify && typeof global.DSGamify.markOJPassed === 'function')
            ? global.DSGamify.markOJPassed(curProb.id)
            : null;
          if (!acRes || !acRes.newlyPassed) {
            if (global.DSGamify && typeof global.DSGamify.celebrate === 'function') {
              global.DSGamify.celebrate('🔥 ' + curProb.title + ' 再次 AC！');
            } else if (global.DSApp && typeof global.DSApp.celebrate === 'function') {
              global.DSApp.celebrate();
            }
          }
        }
        if (isStillMounted(token, containerEl)) render(containerEl, token);
      }).catch(function (err) {
        state.running = false;
        state.lastOJResult = { error: String(err && err.message ? err.message : err) };
        if (isStillMounted(token, containerEl)) render(containerEl, token);
      });
    }

    function runCustomTest() {
      var curSrv = getServerStatus();
      var code = editorEl.value;
      localStorage.setItem(OJ_DRAFT_PREFIX + curProb.id, code);
      var stdinEl = containerEl.querySelector('#oj-stdin-input');
      if (stdinEl) state.ojCustomStdin = stdinEl.value;
      state.ojPanelTab = 'custom';
      if (!curSrv.online || !curSrv.gpp) {
        notify('当前未连接本地 g++ 引擎，无法在线自测运行，可下载 .cpp 本地编译！', 'warn');
        render(containerEl, token);
        return;
      }
      if (state.running) return;
      state.running = true;
      state.lastOJCustomResult = { loading: true };
      render(containerEl, token);

      var p = (global.DSBackend && typeof global.DSBackend.runDemo === 'function')
        ? global.DSBackend.runDemo(code, state.ojCustomStdin)
        : Promise.reject(new Error('DSBackend.runDemo 未就绪'));

      p.then(function (data) {
        state.running = false;
        state.lastOJCustomResult = data;
        if (isStillMounted(token, containerEl)) render(containerEl, token);
      }).catch(function (err) {
        state.running = false;
        state.lastOJCustomResult = { error: String(err && err.message ? err.message : err) };
        if (isStillMounted(token, containerEl)) render(containerEl, token);
      });
    }

    function flushOJDraft() {
      if (editorEl) localStorage.setItem(OJ_DRAFT_PREFIX + curProb.id, editorEl.value);
      var stEl = containerEl.querySelector('#oj-stdin-input');
      if (stEl) state.ojCustomStdin = stEl.value;
    }

    bindEditorBehavior(editorEl, gutterEl, statusEl, function (val) {
      localStorage.setItem(OJ_DRAFT_PREFIX + curProb.id, val);
    }, submitOJ);

    bindCommonEvents(containerEl, curProb, editorEl, 'oj', token, flushOJDraft);

    // OJ 题目切换
    containerEl.querySelectorAll('[data-select-oj]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        flushOJDraft();
        var nextId = btn.getAttribute('data-select-oj');
        state.ojId = nextId;
        state.lastOJResult = null;
        state.lastOJCustomResult = null;
        state.ojSolutionUnlocked = false;
        var nextProb = ojs.find(function (p) { return p.id === nextId; });
        state.ojCustomStdin = (nextProb && nextProb.samples && nextProb.samples[0]) ? (nextProb.samples[0].input || '') : '';
        render(containerEl, token);
      });
    });

    // 章节/难度筛选
    var chapSel = containerEl.querySelector('#oj-chap-filter');
    if (chapSel) chapSel.addEventListener('change', function () { flushOJDraft(); state.ojChapterFilter = chapSel.value; render(containerEl, token); });
    var diffSel = containerEl.querySelector('#oj-diff-filter');
    if (diffSel) diffSel.addEventListener('change', function () { flushOJDraft(); state.ojDiffFilter = diffSel.value; render(containerEl, token); });

    // 专注编码切换
    var btnFocus = containerEl.querySelector('#btn-oj-focus');
    if (btnFocus) btnFocus.addEventListener('click', function () { flushOJDraft(); state.ojFocusCoding = !state.ojFocusCoding; render(containerEl, token); });

    var btnChap = containerEl.querySelector('#btn-oj-to-chapter');
    if (btnChap) btnChap.addEventListener('click', function () { flushOJDraft(); global.DSApp.navigate('reader', { chapterId: curProb.chapterId }); });

    // 样例复制 & 填入自测框
    containerEl.querySelectorAll('[data-oj-copy-sample]').forEach(function (b) {
      b.addEventListener('click', function () {
        var sp = samples[Number(b.getAttribute('data-oj-copy-sample'))];
        if (sp) copyText(sp.input || '').then(function () { notify('已复制样例输入', 'success'); });
      });
    });
    containerEl.querySelectorAll('[data-oj-fill-sample]').forEach(function (b) {
      b.addEventListener('click', function () {
        flushOJDraft();
        var sp = samples[Number(b.getAttribute('data-oj-fill-sample'))];
        if (sp) {
          state.ojCustomStdin = sp.input || '';
          state.ojPanelTab = 'custom';
          notify('已填入样例输入到自测框，点击「▶ 自测运行」即可验证！', 'info');
          render(containerEl, token);
        }
      });
    });

    // 参考代码解锁/填入/收起
    var btnUnlock = containerEl.querySelector('#btn-oj-unlock-sol');
    if (btnUnlock) {
      btnUnlock.addEventListener('click', function () {
        if (confirm('建议先独立思考或查看上方两条提示，确定展开完整参考代码吗？')) {
          flushOJDraft();
          state.ojSolutionUnlocked = true;
          render(containerEl, token);
        }
      });
    }
    var btnHideSol = containerEl.querySelector('#btn-oj-hide-sol');
    if (btnHideSol) btnHideSol.addEventListener('click', function () { flushOJDraft(); state.ojSolutionUnlocked = false; render(containerEl, token); });
    var btnApplySol = containerEl.querySelector('#btn-oj-apply-sol');
    if (btnApplySol) {
      btnApplySol.addEventListener('click', function () {
        if (confirm('确定将参考代码填入编辑器？（会覆盖当前草稿）')) {
          localStorage.setItem(OJ_DRAFT_PREFIX + curProb.id, curProb.solutionCode || '');
          state.lastOJResult = null;
          notify('已填入参考代码，点击「🚀 提交评测」可验证 AC！', 'info');
          render(containerEl, token);
        }
      });
    }

    // 编辑器按钮 & 底部双标签
    var btnSubmit = containerEl.querySelector('#btn-oj-submit');
    if (btnSubmit) btnSubmit.addEventListener('click', submitOJ);
    var btnQuickTest = containerEl.querySelector('#btn-oj-quick-test');
    if (btnQuickTest) btnQuickTest.addEventListener('click', runCustomTest);
    var btnRunCustom = containerEl.querySelector('#btn-oj-run-custom');
    if (btnRunCustom) btnRunCustom.addEventListener('click', runCustomTest);

    var stdinInput = containerEl.querySelector('#oj-stdin-input');
    if (stdinInput) {
      stdinInput.addEventListener('input', function () { state.ojCustomStdin = stdinInput.value; });
    }

    containerEl.querySelectorAll('[data-oj-tab]').forEach(function (t) {
      t.addEventListener('click', function () {
        flushOJDraft();
        state.ojPanelTab = t.getAttribute('data-oj-tab');
        render(containerEl, token);
      });
    });

    var btnReset = containerEl.querySelector('#btn-oj-reset');
    if (btnReset) {
      btnReset.addEventListener('click', function () {
        if (confirm('确定重置为空白 main() 起步模板？')) {
          localStorage.removeItem(OJ_DRAFT_PREFIX + curProb.id);
          state.lastOJResult = null;
          notify('已重置为空白模板', 'info');
          render(containerEl, token);
        }
      });
    }
    var btnDl = containerEl.querySelector('#btn-oj-dl');
    if (btnDl) {
      btnDl.addEventListener('click', function () {
        downloadFile(curProb.id + '_solution.cpp', editorEl.value);
        notify('已下载 ' + curProb.id + '_solution.cpp', 'success');
      });
    }

    containerEl.querySelectorAll('.md-copy-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        var c = decodeURIComponent(b.getAttribute('data-copy-code') || '');
        copyText(c).then(function () { notify('代码已复制', 'success'); });
      });
    });
  }

  /* ========================================================================
     模式 3：📦 30 个完整示例运行库（新增可选自定义 stdin 输入栏）
     ======================================================================== */
  function renderDemosMode(containerEl, topBarHtml, demos, srv, token) {
    var curDemo = demos.find(function (d) { return d.filename === state.demoFilename; }) || demos[0];
    if (!curDemo) {
      containerEl.innerHTML = topBarHtml + '<div class="card" style="padding:32px;text-align:center;">未加载到演示代码数据 (DS_DEMOS)</div>';
      return;
    }
    state.demoFilename = curDemo.filename;

    var q = state.filterText.trim().toLowerCase();
    var filteredDemos = demos.filter(function (d) {
      if (!q) return true;
      return (d.filename + ' ' + (d.title || '') + ' ' + (d.chapterId || '')).toLowerCase().indexOf(q) !== -1;
    });

    var listHtml = filteredDemos.map(function (d) {
      return (
        '<button type="button" class="lab-list-item' + (d.filename === curDemo.filename ? ' active' : '') + '" data-select-demo="' + escapeHtml(d.filename) + '">' +
          '<span class="lab-item-icon">📄</span>' +
          '<div class="lab-item-info">' +
            '<div class="lab-item-title">' + escapeHtml(d.title || d.filename) + '</div>' +
            '<div class="lab-item-sub">' + escapeHtml(d.filename) + '</div>' +
          '</div>' +
        '</button>'
      );
    }).join('');

    var codeVal = getDemoDraft(curDemo);

    containerEl.innerHTML =
      topBarHtml +
      '<div class="lab-layout">' +
        '<aside class="card lab-list-card">' +
          '<div class="lab-list-head">' +
            '<input id="lab-filter-input" class="lab-filter-input" type="text" placeholder="🔍 搜索 30 个演示程序…" value="' + escapeHtml(state.filterText) + '" />' +
          '</div>' +
          '<div class="lab-list-scroll">' + (listHtml || '<div style="padding:16px;font-size:12.5px;color:var(--text-muted);">无匹配演示</div>') + '</div>' +
        '</aside>' +
        '<section class="lab-workspace">' +
          '<div class="card lab-header-card">' +
            '<div class="lab-header-top">' +
              '<div>' +
                '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">' +
                  '<span class="badge badge-purple">完整示例</span>' +
                  '<span class="badge">' + escapeHtml(curDemo.filename) + '</span>' +
                  '<h2 class="lab-title">' + escapeHtml(curDemo.title || curDemo.filename) + '</h2>' +
                '</div>' +
                '<p class="lab-desc">配套全书的可运行 C++11 完整演示程序，支持自由修改参数、填写可选标准输入并一键编译运行。</p>' +
              '</div>' +
              (curDemo.chapterId && global.DS_CHAPTERS && global.DS_CHAPTERS[curDemo.chapterId]
                ? '<button type="button" class="btn btn-sm btn-soft" id="btn-demo-to-chapter">📖 查看对应章节</button>'
                : '') +
            '</div>' +
          '</div>' +
          '<div class="lab-split">' +
            '<div class="card editor-card">' +
              '<div class="editor-toolbar">' +
                '<div class="editor-toolbar-left">' +
                  '<button type="button" class="btn btn-primary" id="btn-run-demo"' + (state.running ? ' disabled' : '') + '>' +
                    (state.running ? '⏳ 编译运行中…' : '▶ 直接运行 (g++)') +
                  '</button>' +
                '</div>' +
                '<div class="editor-toolbar-right">' +
                  '<button type="button" class="btn btn-sm" id="btn-copy-demo">📋 复制源码</button>' +
                  '<button type="button" class="btn btn-sm" id="btn-reset-demo">↺ 恢复原版</button>' +
                  '<button type="button" class="btn btn-sm" id="btn-dl-demo">⬇ 下载 .cpp</button>' +
                '</div>' +
              '</div>' +
              '<div class="code-editor-wrap">' +
                '<pre class="code-gutter" id="lab-gutter" aria-hidden="true"></pre>' +
                '<textarea class="code-textarea" id="lab-editor" spellcheck="false" autocomplete="off"></textarea>' +
              '</div>' +
              '<div class="editor-statusbar">' +
                '<span>code/' + escapeHtml(curDemo.filename) + ' · Ctrl+Enter 直接运行</span>' +
                '<span id="lab-save-status">✓ 已载入</span>' +
              '</div>' +
            '</div>' +
            '<div class="card output-card">' +
              ((!srv.online || !srv.gpp) ? renderOfflineGuide(curDemo, 'demo', srv) : '') +
              '<div>' +
                '<div style="font-size:12px;font-weight:700;color:var(--text-muted);margin-bottom:5px;">⌨️ 自定义标准输入 (stdin，可选)</div>' +
                '<textarea id="demo-stdin-input" class="stdin-textarea" style="min-height:60px;" placeholder="若演示程序需要 cin 输入，可在此填入测试数据…">' + escapeHtml(state.demoCustomStdin) + '</textarea>' +
              '</div>' +
              renderDemoResult(state.lastDemoResult, curDemo.title || curDemo.filename) +
            '</div>' +
          '</div>' +
        '</section>' +
      '</div>';

    var editorEl = containerEl.querySelector('#lab-editor');
    var gutterEl = containerEl.querySelector('#lab-gutter');
    var statusEl = containerEl.querySelector('#lab-save-status');
    editorEl.value = codeVal;

    var demoStdinEl = containerEl.querySelector('#demo-stdin-input');
    if (demoStdinEl) {
      demoStdinEl.addEventListener('input', function () { state.demoCustomStdin = demoStdinEl.value; });
    }

    function runDemo() {
      var curSrv = getServerStatus();
      var code = editorEl.value;
      localStorage.setItem(DEMO_DRAFT_PREFIX + curDemo.filename, code);
      if (demoStdinEl) state.demoCustomStdin = demoStdinEl.value;
      if (!curSrv.online || !curSrv.gpp) {
        if (curSrv.mode === 'tauri' || curSrv.online) {
          notify('未检测到本机 g++，请先安装 MSYS2 / MinGW-w64 后重新检测！', 'warn');
        } else {
          notify('当前为离线模式，请运行桌面端或双击「启动学习网站.vbs」后一键运行 C++ 演示代码！', 'warn');
        }
        return;
      }
      if (state.running) return;
      state.running = true;
      state.lastDemoResult = { loading: true };
      render(containerEl, token);

      var demoPromise = (global.DSBackend && typeof global.DSBackend.runDemo === 'function')
        ? global.DSBackend.runDemo(code, state.demoCustomStdin)
        : Promise.reject(new Error('后端桥接未就绪'));

      demoPromise
        .then(function (data) {
          state.running = false;
          state.lastDemoResult = data;
          if (isStillMounted(token, containerEl)) render(containerEl, token);
        })
        .catch(function (err) {
          state.running = false;
          state.lastDemoResult = { error: String(err && err.message ? err.message : err) };
          if (isStillMounted(token, containerEl)) render(containerEl, token);
        });
    }

    function flushDemoDraft() {
      if (editorEl) localStorage.setItem(DEMO_DRAFT_PREFIX + curDemo.filename, editorEl.value);
      if (demoStdinEl) state.demoCustomStdin = demoStdinEl.value;
    }

    bindEditorBehavior(editorEl, gutterEl, statusEl, function (val) {
      localStorage.setItem(DEMO_DRAFT_PREFIX + curDemo.filename, val);
    }, runDemo);

    bindCommonEvents(containerEl, curDemo, editorEl, 'demo', token, flushDemoDraft);

    var btnRun = containerEl.querySelector('#btn-run-demo');
    if (btnRun) btnRun.addEventListener('click', runDemo);
    var btnCopy = containerEl.querySelector('#btn-copy-demo');
    if (btnCopy) btnCopy.addEventListener('click', function () {
      copyText(editorEl.value).then(function () { notify('源码已复制', 'success'); });
    });
    var btnReset = containerEl.querySelector('#btn-reset-demo');
    if (btnReset) btnReset.addEventListener('click', function () {
      localStorage.removeItem(DEMO_DRAFT_PREFIX + curDemo.filename);
      state.lastDemoResult = null;
      notify('已恢复示例源码', 'info');
      render(containerEl, token);
    });
    var btnDl = containerEl.querySelector('#btn-dl-demo');
    if (btnDl) btnDl.addEventListener('click', function () {
      downloadFile(curDemo.filename, editorEl.value);
      notify('已下载 ' + curDemo.filename, 'success');
    });
    var btnToChap = containerEl.querySelector('#btn-demo-to-chapter');
    if (btnToChap) btnToChap.addEventListener('click', function () {
      global.DSApp.navigate('reader', { chapterId: curDemo.chapterId });
    });
  }

  function bindCommonEvents(containerEl, item, editorEl, kind, token, flushFn) {
    function flush() { if (typeof flushFn === 'function') flushFn(); }

    containerEl.querySelectorAll('[data-lab-mode]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        flush();
        state.mode = btn.getAttribute('data-lab-mode');
        state.filterText = '';
        render(containerEl, token);
      });
    });

    var filterInput = containerEl.querySelector('#lab-filter-input');
    if (filterInput) {
      filterInput.addEventListener('input', function () {
        flush();
        state.filterText = filterInput.value;
        var pos = filterInput.selectionStart;
        render(containerEl, token);
        var nextInput = containerEl.querySelector('#lab-filter-input');
        if (nextInput) {
          nextInput.focus();
          nextInput.setSelectionRange(pos, pos);
        }
      });
    }

    containerEl.querySelectorAll('[data-select-lab]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        flush();
        state.labId = btn.getAttribute('data-select-lab');
        state.lastJudgeResult = null;
        state.showHints = false;
        state.showSolution = false;
        render(containerEl, token);
      });
    });

    containerEl.querySelectorAll('[data-select-demo]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        flush();
        state.demoFilename = btn.getAttribute('data-select-demo');
        state.lastDemoResult = null;
        state.demoCustomStdin = '';
        render(containerEl, token);
      });
    });

    var btnOffDl = containerEl.querySelector('#btn-offline-download');
    if (btnOffDl) {
      btnOffDl.addEventListener('click', function () {
        flush();
        var fname = kind === 'demo' ? item.filename : (kind === 'oj' ? (item.id + '_solution.cpp') : ('lab' + item.id + '_todo.cpp'));
        downloadFile(fname, editorEl.value);
        notify('已下载 ' + fname, 'success');
      });
    }
    var btnOffCmd = containerEl.querySelector('#btn-offline-copy-cmd');
    if (btnOffCmd) {
      btnOffCmd.addEventListener('click', function () {
        var cmd = btnOffCmd.getAttribute('data-cmd');
        copyText(cmd).then(function () { notify('命令已复制：' + cmd, 'success'); });
      });
    }
    var btnRecheck = containerEl.querySelector('#btn-recheck-srv');
    if (btnRecheck) {
      btnRecheck.addEventListener('click', function () {
        flush();
        if (global.DSApp && typeof global.DSApp.checkServer === 'function') {
          global.DSApp.checkServer(true).then(function () {
            if (isStillMounted(token, containerEl)) render(containerEl, token);
          });
        }
      });
    }
  }

  function mount(containerEl, opts) {
    activeMountToken++;
    var token = activeMountToken;
    activeContainer = containerEl;

    opts = opts || {};
    if (opts.mode === 'demos' || opts.mode === 'labs' || opts.mode === 'oj') {
      state.mode = opts.mode;
    } else if (opts.ojId) {
      state.mode = 'oj';
    } else if (opts.labId) {
      state.mode = 'labs';
    } else if (opts.demoFilename) {
      state.mode = 'demos';
    }
    if (opts.labId) {
      state.labId = opts.labId;
      state.lastJudgeResult = null;
      state.showHints = false;
      state.showSolution = false;
    }
    if (opts.ojId) {
      state.ojId = opts.ojId;
      state.lastOJResult = null;
      state.lastOJCustomResult = null;
      state.ojSolutionUnlocked = false;
      var matchedProb = (global.DS_OJ_PROBLEMS || []).find(function (p) { return p.id === opts.ojId; });
      state.ojCustomStdin = (matchedProb && matchedProb.samples && matchedProb.samples[0]) ? (matchedProb.samples[0].input || '') : '';
    }
    if (opts.demoFilename) {
      state.demoFilename = opts.demoFilename;
      state.lastDemoResult = null;
    }

    syncServerProgress().then(function () {
      if (isStillMounted(token, containerEl)) render(containerEl, token);
    });
    render(containerEl, token);
  }

  global.DSLabView = {
    mount: mount,
    unmount: unmount,
    _toPureScratchCode: toPureScratchCode
  };
})(window);

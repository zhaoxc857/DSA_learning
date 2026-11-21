/* ==========================================================================
   js/lab_view.js — 15 关 C++ 真编译评测工坊 & 30 个完整示例运行库
   暴露全局接口：window.DSLabView
   ========================================================================== */
(function (global) {
  'use strict';

  var DRAFT_PREFIX = 'ds_lab_draft_';
  var DEMO_DRAFT_PREFIX = 'ds_demo_draft_';
  var activeMountToken = 0;
  var activeContainer = null;

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

  var state = {
    mode: 'labs', // 'labs' | 'demos'
    labId: '00',
    demoFilename: '',
    filterText: '',
    saveToDisk: false,
    showHints: false,
    showSolution: false,
    running: false,
    lastJudgeResult: null,
    lastDemoResult: null,
    serverProgress: null
  };

  function escapeHtml(s) {
    return global.DSRenderer ? global.DSRenderer.escapeHtml(s) : String(s || '');
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
    return { online: false, gpp: false, gppVersion: '' };
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

  function getDraft(lab) {
    var saved = localStorage.getItem(DRAFT_PREFIX + lab.id);
    return saved !== null ? saved : (lab.todoCode || '');
  }

  function hasCustomDraft(lab) {
    var saved = localStorage.getItem(DRAFT_PREFIX + lab.id);
    return saved !== null && saved !== (lab.todoCode || '');
  }

  function getDemoDraft(demo) {
    var saved = localStorage.getItem(DEMO_DRAFT_PREFIX + demo.filename);
    return saved !== null ? saved : (demo.code || '');
  }

  function syncServerProgress() {
    var srv = getServerStatus();
    if (!srv.online) return Promise.resolve();
    return fetch('/api/progress')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data || typeof data !== 'object') return;
        state.serverProgress = data;
        var g = global.DSGamify;
        var passedIds = [];
        Object.keys(data).forEach(function (lid) {
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
      if (statusEl) statusEl.textContent = '编辑中…';
      clearTimeout(saveTimer);
      saveTimer = setTimeout(function () {
        onSave(textarea.value);
        if (statusEl) statusEl.textContent = '✓ 草稿已自动保存';
      }, 300);
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
          // 减少缩进
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

  function renderOfflineGuide(lab, isDemo) {
    var cmd = isDemo
      ? ('g++ -std=c++11 -O2 "code/' + (lab ? lab.filename : 'demo.cpp') + '" -o demo && ./demo')
      : ('python judge.py ' + (lab ? lab.id : '00'));
    return (
      '<div class="offline-banner">' +
        '<h4>📦 当前为纯离线预览模式（未连接本地 server.py）</h4>' +
        '<p style="margin:0 0 8px;">双击 <code>学习网站/启动学习网站.bat</code>（或在终端运行 <code>python server.py</code>）后访问 <code>http://127.0.0.1:8765</code>，即可在网页内开启 <strong>真 g++ 一键编译评测</strong>！</p>' +
        '<p style="margin:0 0 10px;color:var(--text-sub);">离线模式下你依然可以畅写代码（自动保存草稿）、看分步思路提示、对照参考答案，或一键导出到本地评测：</p>' +
        '<div style="display:flex;flex-wrap:wrap;gap:8px;">' +
          '<button type="button" class="btn btn-sm btn-primary" id="btn-offline-download">⬇ 下载当前代码 (.cpp)</button>' +
          '<button type="button" class="btn btn-sm" id="btn-offline-copy-cmd" data-cmd="' + escapeHtml(cmd) + '">📋 复制本地命令：' + escapeHtml(cmd) + '</button>' +
          '<button type="button" class="btn btn-sm" id="btn-recheck-srv">🔄 重新检测本地服务</button>' +
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
      return (
        '<div class="judge-summary fail"><strong>❌ 请求失败</strong><span>' + escapeHtml(res.error) + '</span></div>'
      );
    }

    var html = [];

    // 编译失败
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

    // 超时或崩溃
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

    // 编译警告
    if (res.warnings && String(res.warnings).trim()) {
      html.push(
        '<details class="ds-details" style="margin:0;">' +
          '<summary>⚠️ 编译器提示警告（-Wall -Wextra）</summary>' +
          '<div class="ds-details-body"><pre class="terminal-pre">' + escapeHtml(res.warnings) + '</pre></div>' +
        '</details>'
      );
    }

    // 断言卡片列表（失败置顶便于第一时间排错）
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
            '<div class="case-head">' +
              '<span>' + (isPass ? '✅ [PASS] ' : '❌ [FAIL] ') + escapeHtml(c.name || '测试用例') + '</span>' +
            '</div>' +
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

  function renderDemoResult(res, demo) {
    if (!res) {
      return (
        '<div style="text-align:center;padding:40px 16px;color:var(--text-muted);">' +
          '<div style="font-size:34px;margin-bottom:8px;">📦</div>' +
          '<div style="font-weight:700;color:var(--text-main);margin-bottom:6px;">' + escapeHtml(demo.title || demo.filename) + '</div>' +
          '<div style="font-size:13px;">你可以直接修改左侧 C++ 演示代码，点击 <strong>▶ 直接运行 (g++)</strong> 实时查看控制台输出！</div>' +
        '</div>'
      );
    }
    if (res.loading) {
      return '<div style="display:flex;flex-direction:column;align-items:center;padding:48px 16px;gap:12px;color:var(--text-muted);"><div class="spinner"></div><div>正在用本地 g++ 编译并运行演示程序…</div></div>';
    }
    if (res.error) {
      return '<div class="judge-summary fail"><strong>❌ 运行失败</strong><span>' + escapeHtml(res.error) + '</span></div>';
    }
    if (!res.compileOk) {
      return (
        '<div class="judge-summary fail"><strong>❌ 编译错误</strong><span class="badge badge-red">Compile Error</span></div>' +
        '<pre class="terminal-pre">' + escapeHtml(res.compileError || '未知错误') + '</pre>'
      );
    }
    if (res.timedOut) {
      return '<div class="judge-summary fail"><strong>⏱ 运行超时（超过 8 秒）</strong><span class="badge badge-red">TLE</span></div>';
    }
    var ok = res.exitCode === 0;
    return (
      '<div class="judge-summary ' + (ok ? 'pass' : 'warn') + '">' +
        '<strong>' + (ok ? '✅ 编译并运行成功' : '⚠️ 程序退出码：' + res.exitCode) + '</strong>' +
        '<span class="badge ' + (ok ? 'badge-green' : 'badge-amber') + '">exit ' + res.exitCode + '</span>' +
      '</div>' +
      '<div><div style="font-size:12px;font-weight:700;color:var(--text-muted);margin-bottom:6px;">标准输出 (stdout)</div>' +
      '<pre class="terminal-pre">' + escapeHtml(res.stdout || '(无输出)') + '</pre></div>' +
      (res.stderr ? '<div><div style="font-size:12px;font-weight:700;color:var(--red);margin-bottom:6px;">标准错误 (stderr)</div><pre class="terminal-pre">' + escapeHtml(res.stderr) + '</pre></div>' : '')
    );
  }

  function render(containerEl, token) {
    if (token !== undefined && !isStillMounted(token, containerEl)) return;
    var mountToken = token !== undefined ? token : activeMountToken;
    var labs = global.DS_LABS || [];
    var demos = global.DS_DEMOS || [];
    var srv = getServerStatus();

    if (!state.labId && labs.length) state.labId = labs[0].id;
    if (!state.demoFilename && demos.length) state.demoFilename = demos[0].filename;

    var passedCount = labs.filter(function (l) { return isLabPassed(l.id); }).length;

    // 顶部模式切换栏
    var topBarHtml =
      '<div class="lab-top-bar">' +
        '<div class="mode-tabs">' +
          '<button type="button" class="mode-tab' + (state.mode === 'labs' ? ' active' : '') + '" data-lab-mode="labs">🧪 15 关手写闯关 (' + passedCount + '/' + labs.length + ')</button>' +
          '<button type="button" class="mode-tab' + (state.mode === 'demos' ? ' active' : '') + '" data-lab-mode="demos">📦 30 个完整示例运行库 (' + demos.length + ')</button>' +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">' +
          (srv.online && srv.gpp
            ? '<span class="badge badge-green">🟢 g++ 在线评测就绪 · ' + escapeHtml(srv.gppVersion || 'g++') + '</span>'
            : '<span class="badge badge-amber">📦 纯离线预览模式（双击 启动学习网站.bat 开启真编译）</span>') +
        '</div>' +
      '</div>';

    if (state.mode === 'labs') {
      renderLabsMode(containerEl, topBarHtml, labs, srv, mountToken);
    } else {
      renderDemosMode(containerEl, topBarHtml, demos, srv, mountToken);
    }
  }

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

    // 思路提示抽屉
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

    // 参考答案对比抽屉
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
                    ? '<label class="checkbox-label" title="勾选后评测时会同步写回硬盘上的 labs 目录对应 todo.cpp"><input type="checkbox" id="chk-save-disk"' + (state.saveToDisk ? ' checked' : '') + ' /> 💾 同步保存到 labs 目录</label>'
                    : '') +
                '</div>' +
                '<div class="editor-toolbar-right">' +
                  '<button type="button" class="btn btn-sm' + (state.showHints ? ' btn-soft' : '') + '" id="btn-toggle-hints">💡 思路提示</button>' +
                  '<button type="button" class="btn btn-sm' + (state.showSolution ? ' btn-soft' : '') + '" id="btn-toggle-solution">🔑 参考答案</button>' +
                  '<button type="button" class="btn btn-sm" id="btn-reset-lab" title="重置为初始 todo.cpp">↺ 重置</button>' +
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
              (!srv.online ? renderOfflineGuide(curLab, false) : '') +
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
        notify('当前为离线模式，请双击「启动学习网站.bat」开启本地 g++ 评测，或点击右侧下载代码！', 'warn');
        return;
      }
      if (state.running) return;
      state.running = true;
      state.lastJudgeResult = { loading: true };
      render(containerEl, token);

      fetch('/api/judge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          labId: curLab.id,
          code: code,
          saveToDisk: !!state.saveToDisk
        })
      })
        .then(function (r) { return r.json(); })
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
          if (isStillMounted(token, containerEl)) {
            render(containerEl, token);
          }
        })
        .catch(function (err) {
          state.running = false;
          state.lastJudgeResult = { error: String(err && err.message ? err.message : err) };
          if (isStillMounted(token, containerEl)) {
            render(containerEl, token);
          }
        });
    }

    bindEditorBehavior(editorEl, gutterEl, statusEl, function (val) {
      localStorage.setItem(DRAFT_PREFIX + curLab.id, val);
    }, runJudge);

    bindCommonEvents(containerEl, curLab, editorEl, false, token);

    var btnRun = containerEl.querySelector('#btn-run-judge');
    if (btnRun) btnRun.addEventListener('click', runJudge);

    var chkSave = containerEl.querySelector('#chk-save-disk');
    if (chkSave) {
      chkSave.addEventListener('change', function () { state.saveToDisk = chkSave.checked; });
    }

    var btnHints = containerEl.querySelector('#btn-toggle-hints');
    if (btnHints) btnHints.addEventListener('click', function () { state.showHints = !state.showHints; render(containerEl, token); });
    var btnCloseHints = containerEl.querySelector('#btn-close-hints');
    if (btnCloseHints) btnCloseHints.addEventListener('click', function () { state.showHints = false; render(containerEl, token); });

    var btnSol = containerEl.querySelector('#btn-toggle-solution');
    if (btnSol) btnSol.addEventListener('click', function () { state.showSolution = !state.showSolution; render(containerEl, token); });
    var btnCloseSol = containerEl.querySelector('#btn-close-solution');
    if (btnCloseSol) btnCloseSol.addEventListener('click', function () { state.showSolution = false; render(containerEl, token); });

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
        if (confirm('确定重置为初始 lab' + curLab.id + '_todo.cpp 模板？')) {
          localStorage.removeItem(DRAFT_PREFIX + curLab.id);
          state.lastJudgeResult = null;
          notify('已重置为初始模板', 'info');
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

    // 绑定参考答案里的复制按钮
    containerEl.querySelectorAll('.md-copy-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        var c = decodeURIComponent(b.getAttribute('data-copy-code') || '');
        copyText(c).then(function () { notify('参考答案已复制', 'success'); });
      });
    });
  }

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
                '<p class="lab-desc">配套全书的可运行 C++11 完整演示程序，支持自由修改参数并一键编译运行查看结果。</p>' +
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
              (!srv.online ? renderOfflineGuide(curDemo, true) : '') +
              renderDemoResult(state.lastDemoResult, curDemo) +
            '</div>' +
          '</div>' +
        '</section>' +
      '</div>';

    var editorEl = containerEl.querySelector('#lab-editor');
    var gutterEl = containerEl.querySelector('#lab-gutter');
    var statusEl = containerEl.querySelector('#lab-save-status');
    editorEl.value = codeVal;

    function runDemo() {
      var curSrv = getServerStatus();
      var code = editorEl.value;
      localStorage.setItem(DEMO_DRAFT_PREFIX + curDemo.filename, code);
      if (!curSrv.online || !curSrv.gpp) {
        notify('当前为离线模式，请双击「启动学习网站.bat」后即可一键运行 C++ 演示代码！', 'warn');
        return;
      }
      if (state.running) return;
      state.running = true;
      state.lastDemoResult = { loading: true };
      render(containerEl, token);

      fetch('/api/run-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code })
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          state.running = false;
          state.lastDemoResult = data;
          if (isStillMounted(token, containerEl)) {
            render(containerEl, token);
          }
        })
        .catch(function (err) {
          state.running = false;
          state.lastDemoResult = { error: String(err && err.message ? err.message : err) };
          if (isStillMounted(token, containerEl)) {
            render(containerEl, token);
          }
        });
    }

    bindEditorBehavior(editorEl, gutterEl, statusEl, function (val) {
      localStorage.setItem(DEMO_DRAFT_PREFIX + curDemo.filename, val);
    }, runDemo);

    bindCommonEvents(containerEl, curDemo, editorEl, true, token);

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

  function bindCommonEvents(containerEl, item, editorEl, isDemo, token) {
    // 切换 labs / demos 模式
    containerEl.querySelectorAll('[data-lab-mode]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.mode = btn.getAttribute('data-lab-mode');
        state.filterText = '';
        render(containerEl, token);
      });
    });

    // 筛选框
    var filterInput = containerEl.querySelector('#lab-filter-input');
    if (filterInput) {
      filterInput.addEventListener('input', function () {
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

    // 切换 Lab
    containerEl.querySelectorAll('[data-select-lab]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.labId = btn.getAttribute('data-select-lab');
        state.lastJudgeResult = null;
        state.showHints = false;
        state.showSolution = false;
        render(containerEl, token);
      });
    });

    // 切换 Demo
    containerEl.querySelectorAll('[data-select-demo]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.demoFilename = btn.getAttribute('data-select-demo');
        state.lastDemoResult = null;
        render(containerEl, token);
      });
    });

    // 离线降级按钮
    var btnOffDl = containerEl.querySelector('#btn-offline-download');
    if (btnOffDl) {
      btnOffDl.addEventListener('click', function () {
        var fname = isDemo ? item.filename : ('lab' + item.id + '_todo.cpp');
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
        if (global.DSApp && typeof global.DSApp.checkServer === 'function') {
          global.DSApp.checkServer(true).then(function () {
            if (isStillMounted(token, containerEl)) {
              render(containerEl, token);
            }
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
    if (opts.mode === 'demos' || opts.mode === 'labs') {
      state.mode = opts.mode;
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
    if (opts.demoFilename) {
      state.demoFilename = opts.demoFilename;
      state.lastDemoResult = null;
    }

    syncServerProgress().then(function () {
      if (isStillMounted(token, containerEl)) {
        render(containerEl, token);
      }
    });
    render(containerEl, token);
  }

  global.DSLabView = {
    mount: mount,
    unmount: unmount
  };
})(window);

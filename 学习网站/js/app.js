/* ==========================================================================
   js/app.js — 主应用路由器、学习星图主页、速查习题区、Ctrl+K 全局搜索与主题/服务管理
   暴露全局接口：window.DSApp
   ========================================================================== */
(function (global) {
  'use strict';

  var currentRoute = 'dashboard';
  var currentParams = {};
  var activeVizController = null;
  var serverStatus = {
    online: false,
    mode: 'offline',
    gpp: false,
    gppVersion: '',
    pythonVersion: '',
    labsCount: 15,
    canShutdown: false,
    pid: null,
    isFileProtocol: location.protocol === 'file:'
  };

  var searchIndex = null;
  var searchScope = 'all';
  var searchActiveIdx = 0;
  var searchHits = [];

  function escapeHtml(s) {
    return global.DSRenderer ? global.DSRenderer.escapeHtml(s) : String(s || '');
  }

  /* ------------------------------------------------------------------------
     Toast 与 烟花兜底（优先使用 DSGamify，否则走内置轻量实现）
     ------------------------------------------------------------------------ */
  function toast(msg, type) {
    if (global.DSGamify && typeof global.DSGamify.toast === 'function') {
      global.DSGamify.toast(msg, type);
      return;
    }
    var box = document.getElementById('ds-toast-container');
    if (!box) return;
    var el = document.createElement('div');
    el.className = 'app-toast ' + (type || 'info');
    el.textContent = msg;
    box.appendChild(el);
    setTimeout(function () {
      el.style.opacity = '0';
      el.style.transition = 'opacity 0.25s ease';
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 260);
    }, 2600);
  }

  function celebrate() {
    var canvas = document.getElementById('ds-confetti-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var colors = ['#2563eb', '#7c3aed', '#10b981', '#f59e0b', '#ec4899', '#38bdf8'];
    var parts = [];
    for (var i = 0; i < 95; i++) {
      parts.push({
        x: canvas.width * (0.2 + Math.random() * 0.6),
        y: canvas.height * 0.35,
        vx: (Math.random() - 0.5) * 14,
        vy: -Math.random() * 12 - 3,
        size: 5 + Math.random() * 6,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.25,
        color: colors[i % colors.length],
        life: 90 + Math.random() * 45
      });
    }
    var frame = 0;
    function tick() {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var alive = 0;
      for (var j = 0; j < parts.length; j++) {
        var p = parts[j];
        if (p.life <= 0) continue;
        alive++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.32;
        p.rot += p.vr;
        p.life--;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 40));
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.65);
        ctx.restore();
      }
      if (alive > 0 && frame < 160) {
        requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    requestAnimationFrame(tick);
  }

  /* ------------------------------------------------------------------------
     主题切换（亮色护眼 / 暗黑夜间）
     ------------------------------------------------------------------------ */
  function applyTheme(theme) {
    var t = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('ds_theme', t);
    var icon = document.getElementById('theme-icon');
    if (icon) icon.textContent = t === 'dark' ? '☀️' : '🌙';
  }

  function initTheme() {
    var saved = localStorage.getItem('ds_theme');
    if (!saved) {
      saved = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
    }
    applyTheme(saved);
    var btn = document.getElementById('btn-theme');
    if (btn) {
      btn.addEventListener('click', function () {
        var cur = document.documentElement.getAttribute('data-theme');
        applyTheme(cur === 'dark' ? 'light' : 'dark');
      });
    }
  }

  /* ------------------------------------------------------------------------
     本地后端（Tauri 2 桌面端 / server.py / 纯离线）状态检测
     ------------------------------------------------------------------------ */
  function updateServerPill() {
    var pill = document.getElementById('server-pill');
    var label = document.getElementById('server-label');
    var btnShutdown = document.getElementById('btn-shutdown-server');
    if (!pill || !label) return;
    pill.classList.remove('online', 'warn', 'offline');

    var isDesktop = serverStatus.mode === 'tauri';
    if (isDesktop && serverStatus.gpp) {
      pill.classList.add('online');
      label.textContent = '🖥️ 桌面版 · g++ 就绪';
      pill.title = 'Tauri 2 原生桌面端 · Rust 直连本机 g++ (' + (serverStatus.gppVersion || 'g++') + ')';
    } else if (isDesktop && !serverStatus.gpp) {
      pill.classList.add('warn');
      label.textContent = '🖥️ 桌面版 · 需安装 g++';
      pill.title = '当前为 Tauri 2 原生桌面端，未检测到本机 g++，点击查看安装引导';
    } else if (serverStatus.online && serverStatus.gpp) {
      pill.classList.add('online');
      label.textContent = 'g++ 在线';
      pill.title = '本地评测服务在线 (' + (serverStatus.gppVersion || 'g++') + ')';
    } else if (serverStatus.online && !serverStatus.gpp) {
      pill.classList.add('warn');
      label.textContent = '未检出 g++';
      pill.title = '本地服务已运行，但未在 PATH 中检测到 g++';
    } else {
      pill.classList.add('offline');
      label.textContent = '离线模式';
      pill.title = '当前为纯离线模式，双击 启动学习网站.vbs（无黑框）或 启动学习网站.bat 开启网页内真 g++ 评测';
    }

    if (btnShutdown) {
      var showShut = !isDesktop && serverStatus.online && serverStatus.canShutdown !== false;
      btnShutdown.classList.toggle('hidden', !showShut);
    }
  }

  function shutdownServer() {
    if (!serverStatus.online || serverStatus.mode === 'tauri') return Promise.resolve(false);
    var ok = confirm('确定关闭后台本地 g++ 评测服务吗？\n关闭后仍可离线阅读与看动画，随时双击「启动学习网站.vbs」即可重新开启。');
    if (!ok) return Promise.resolve(false);

    var btnShutdown = document.getElementById('btn-shutdown-server');
    if (btnShutdown) btnShutdown.disabled = true;

    var req = (global.DSBackend && typeof global.DSBackend.shutdown === 'function')
      ? global.DSBackend.shutdown()
      : Promise.reject(new Error('后端桥接未就绪'));

    return req
      .then(function (res) {
        if (res && res.ok === false && res.reason === 'desktop') {
          if (btnShutdown) btnShutdown.disabled = false;
          return false;
        }
        serverStatus = {
          online: false,
          mode: 'offline',
          gpp: false,
          gppVersion: '',
          pythonVersion: '',
          labsCount: serverStatus.labsCount || 15,
          canShutdown: false,
          pid: null,
          isFileProtocol: false
        };
        if (btnShutdown) btnShutdown.disabled = false;
        updateServerPill();
        var srvModal = document.getElementById('server-modal');
        if (srvModal) srvModal.classList.add('hidden');
        if (currentRoute === 'lab') {
          renderCurrentView();
        }
        toast('后台评测服务已安全关闭，可随时双击「启动学习网站.vbs」重启', 'info');
        return true;
      })
      .catch(function (err) {
        if (btnShutdown) btnShutdown.disabled = false;
        toast('关闭后台服务失败：' + (err && err.message ? err.message : '请求异常'), 'error');
        return false;
      });
  }

  function checkServer(showToast) {
    var checkPromise = (global.DSBackend && typeof global.DSBackend.checkHealth === 'function')
      ? global.DSBackend.checkHealth()
      : Promise.resolve({ ok: false, offline: true, mode: 'offline', gpp: false, canShutdown: false });

    return checkPromise.then(function (data) {
      data = data || {};
      var mode = data.mode || (global.DSBackend && global.DSBackend.isTauri() ? 'tauri' : (data.ok ? 'http' : 'offline'));
      serverStatus = {
        online: Boolean(data.ok),
        mode: mode,
        gpp: Boolean(data.gpp),
        gppVersion: data.gppVersion || '',
        pythonVersion: data.pythonVersion || '',
        labsCount: data.labsCount || 15,
        canShutdown: mode === 'tauri' ? false : (data.canShutdown !== undefined ? Boolean(data.canShutdown) : Boolean(data.ok)),
        pid: data.pid || null,
        isFileProtocol: location.protocol === 'file:' && mode !== 'tauri'
      };
      updateServerPill();
      if (showToast) {
        if (mode === 'tauri') {
          toast(
            serverStatus.gpp ? '🖥️ 桌面版已直连本机 g++，编译评测就绪！' : '⚠️ 桌面版未检测到本机 g++，请先安装 MinGW/MSYS2',
            serverStatus.gpp ? 'success' : 'warn'
          );
        } else if (serverStatus.online) {
          toast(serverStatus.gpp ? '🟢 本地 g++ 评测服务连接正常！' : '⚠️ 服务在线但未检测到 g++', serverStatus.gpp ? 'success' : 'warn');
        } else if (serverStatus.isFileProtocol) {
          toast('当前通过 file:// 离线打开，双击 启动学习网站.vbs（无黑框）或 启动学习网站.bat 即可开启在线评测', 'info');
        } else {
          toast('未检测到本地 server.py，当前处于离线模式', 'warn');
        }
      }
      return serverStatus;
    });
  }

  function openServerModal() {
    var modal = document.getElementById('server-modal');
    var body = document.getElementById('server-modal-body');
    if (!modal || !body) return;

    if (serverStatus.mode === 'tauri') {
      if (serverStatus.gpp) {
        body.innerHTML =
          '<div class="judge-summary pass" style="margin-bottom:14px;">' +
            '<strong>🖥️ 当前为 Tauri 2 原生桌面端 · g++ 就绪</strong><span class="badge badge-green">DESKTOP</span>' +
          '</div>' +
          '<p>当前为 <strong>Tauri 2 原生桌面端</strong>，Rust 后端直连本机 <code>g++</code>，<strong>无需 Python 与本地端口</strong>，关闭窗口即自动退出应用！</p>' +
          '<p><strong>本机编译器：</strong><code>' + escapeHtml(serverStatus.gppVersion || 'g++') + '</code></p>' +
          '<p><strong>可用实验关卡：</strong>' + serverStatus.labsCount + ' 关（支持内嵌 <code>test_kit.h</code> 真编译评测与 30 个示例一键运行）</p>' +
          '<div style="display:flex;justify-content:flex-end;flex-wrap:wrap;gap:8px;margin-top:16px;">' +
            '<button type="button" class="btn btn-sm" id="btn-modal-recheck">🔄 重新检测 g++</button>' +
            '<button type="button" class="btn btn-sm btn-primary" id="btn-modal-go-lab">💻 去写代码闯关</button>' +
          '</div>';
      } else {
        body.innerHTML =
          '<div class="offline-banner" style="margin-bottom:12px;">' +
            '<h4>🖥️ 当前为 Tauri 2 原生桌面端（未检测到本机 g++）</h4>' +
            '<p style="margin:0;">当前为 <strong>Tauri 2 原生桌面端</strong>，Rust 直连本机 <code>g++</code>，无需 Python 与本地端口。阅读、8 大动画、刷题与闪卡均可离线畅学；如需运行 15 关真编译评测，请先安装 C++ 编译器：</p>' +
          '</div>' +
          '<ol style="padding-left:20px;margin:6px 0 14px;">' +
            '<li>推荐安装 <strong>MSYS2 (UCRT64)</strong> 或 <strong>MinGW-w64</strong>（如 <code>winget install MSYS2.MSYS2</code> 后执行 <code>pacman -S mingw-w64-ucrt-x86_64-gcc</code>）；</li>' +
            '<li>或安装 <strong>Dev-C++ / WinLibs MinGW64</strong> 并将 <code>bin</code> 目录加入系统 <code>PATH</code>；</li>' +
            '<li>安装完成后点击下方「重新检测 g++」即可立即启用编译评测！</li>' +
          '</ol>' +
          '<div style="display:flex;justify-content:flex-end;gap:8px;">' +
            '<button type="button" class="btn btn-sm btn-primary" id="btn-modal-recheck">🔄 重新检测 g++</button>' +
          '</div>';
      }
    } else if (serverStatus.online && serverStatus.gpp) {
      body.innerHTML =
        '<div class="judge-summary pass" style="margin-bottom:14px;">' +
          '<strong>🟢 本地真编译评测服务运行中</strong><span class="badge badge-green">ONLINE</span>' +
        '</div>' +
        '<p><strong>编译器：</strong><code>' + escapeHtml(serverStatus.gppVersion || 'g++') + '</code></p>' +
        '<p><strong>Python 环境：</strong><code>' + escapeHtml(serverStatus.pythonVersion || 'Python 3') + '</code></p>' +
        (serverStatus.pid ? '<p><strong>后台进程 PID：</strong><code>' + escapeHtml(serverStatus.pid) + '</code></p>' : '') +
        '<p><strong>可用实验关卡：</strong>' + serverStatus.labsCount + ' 关（支持 <code>POST /api/judge</code> 与 <code>POST /api/run-demo</code>）</p>' +
        '<div style="display:flex;justify-content:flex-end;flex-wrap:wrap;gap:8px;margin-top:16px;">' +
          '<button type="button" class="btn btn-sm btn-danger" id="btn-modal-shutdown">⏻ 关闭后台服务</button>' +
          '<button type="button" class="btn btn-sm" id="btn-modal-recheck">🔄 重新检测</button>' +
          '<button type="button" class="btn btn-sm btn-primary" id="btn-modal-go-lab">💻 去写代码闯关</button>' +
        '</div>';
    } else {
      body.innerHTML =
        '<div class="offline-banner" style="margin-bottom:12px;">' +
          '<h4>📦 当前处于纯离线模式</h4>' +
          '<p style="margin:0;">你可以流畅使用<strong>全书精读、8 大动画实验室、96+ 刷题、24 例找 Bug、60 张闪卡、代码草稿与下载</strong>，完全不需要联网！</p>' +
        '</div>' +
        '<p><strong>如何开启网页内真 g++ 一键编译评测？</strong></p>' +
        '<ol style="padding-left:20px;margin:6px 0 14px;">' +
          '<li>在资源管理器中双击 <code>学习网站/启动学习网站.vbs</code>（无黑框静默启动）或 <code>学习网站/启动学习网站.bat</code>；</li>' +
          '<li>或在终端进入 <code>学习网站</code> 目录执行：<code>python server.py</code>；</li>' +
          '<li>浏览器自动打开 <code>http://127.0.0.1:8765</code> 后即可在线编译评测！</li>' +
        '</ol>' +
        '<div style="display:flex;justify-content:flex-end;gap:8px;">' +
          '<button type="button" class="btn btn-sm" id="btn-modal-recheck">🔄 重新检测</button>' +
        '</div>';
    }
    modal.classList.remove('hidden');
    var btnRe = document.getElementById('btn-modal-recheck');
    if (btnRe) btnRe.addEventListener('click', function () {
      checkServer(true).then(openServerModal);
    });
    var btnShut = document.getElementById('btn-modal-shutdown');
    if (btnShut) btnShut.addEventListener('click', function () {
      shutdownServer();
    });
    var btnGo = document.getElementById('btn-modal-go-lab');
    if (btnGo) btnGo.addEventListener('click', function () {
      modal.classList.add('hidden');
      navigate('lab');
    });
  }

  /* ------------------------------------------------------------------------
     顶部 XP & 段位胶囊同步（兼容 DSGamify 各种返回结构）
     ------------------------------------------------------------------------ */
  function readGamifySummary() {
    var g = global.DSGamify;
    var st = (g && typeof g.getState === 'function') ? (g.getState() || {}) : {};
    var lv = (g && typeof g.getLevelInfo === 'function') ? (g.getLevelInfo() || {}) : {};
    var xp = typeof st.xp === 'number' ? st.xp : (typeof lv.xp === 'number' ? lv.xp : 0);
    var levelNum = lv.level || lv.lv || 1;
    var title = lv.title || lv.name || '指针萌新';
    var pct = typeof lv.progress === 'number' ? lv.progress
      : (typeof lv.percent === 'number' ? lv.percent
        : (lv.nextXP ? Math.min(100, Math.round(((xp - (lv.minXP || 0)) / Math.max(1, lv.nextXP - (lv.minXP || 0))) * 100)) : 0));
    var nextXP = lv.nextXP || lv.nextLevelXP || lv.nextMinXP || 150;
    var streak = st.streak || st.streakDays || 1;
    var passedLabs = Array.isArray(st.passedLabs) ? st.passedLabs.length : Object.keys(st.passedLabs || {}).length;
    var passedOJ = Array.isArray(st.passedOJ) ? st.passedOJ.length : Object.keys(st.passedOJ || {}).length;
    var answeredCount = Array.isArray(st.answeredIds) ? st.answeredIds.length : Object.keys(st.answeredIds || {}).length;
    var solvedBugs = Array.isArray(st.solvedBugs) ? st.solvedBugs.length : Object.keys(st.solvedBugs || {}).length;
    var masteredCards = Array.isArray(st.masteredCards) ? st.masteredCards.length : Object.keys(st.masteredCards || {}).length;

    return {
      xp: xp,
      levelNum: levelNum,
      title: title,
      pct: Math.max(0, Math.min(100, Math.round(pct))),
      nextXP: nextXP,
      streak: streak,
      passedLabs: passedLabs,
      passedOJ: passedOJ,
      answeredCount: answeredCount,
      solvedBugs: solvedBugs,
      masteredCards: masteredCards,
      state: st
    };
  }

  function updateHeaderXP() {
    var info = readGamifySummary();
    var lvEl = document.getElementById('hdr-level');
    var xpEl = document.getElementById('hdr-xp');
    var fillEl = document.getElementById('hdr-xp-fill');
    if (lvEl) lvEl.textContent = 'Lv.' + info.levelNum + ' ' + info.title;
    if (xpEl) xpEl.textContent = info.xp + ' XP';
    if (fillEl) fillEl.style.width = info.pct + '%';
  }

  function getChapterPct(chId) {
    var g = global.DSGamify;
    var chData = global.DS_CHAPTERS && global.DS_CHAPTERS[chId];
    var total = chData && Array.isArray(chData.sectionSlugs) ? chData.sectionSlugs.length
      : (chData && Array.isArray(chData.headings) ? chData.headings.length : 0);
    if (g && typeof g.getChapterProgress === 'function') {
      var res = g.getChapterProgress(chId, total);
      if (typeof res === 'number') return Math.round(res);
      if (res && typeof res.percent === 'number') return Math.round(res.percent);
      if (res && typeof res.pct === 'number') return Math.round(res.pct);
    }
    return 0;
  }

  /* ------------------------------------------------------------------------
     🏠 视图 1：学习星图主页 (Dashboard)
     ------------------------------------------------------------------------ */
  function renderDashboard(mainEl) {
    var manifest = global.DS_MANIFEST || { chapters: [], stats: {} };
    var chapters = manifest.chapters || [];
    var starChapters = chapters.filter(function (c) { return c.group === 'core' || c.group === 'appendix'; });
    var info = readGamifySummary();

    var totalPctSum = 0;
    starChapters.forEach(function (c) { totalPctSum += getChapterPct(c.id); });
    var overallPct = starChapters.length ? Math.round(totalPctSum / starChapters.length) : 0;

    var lastChapId = localStorage.getItem('ds_last_chapter') || '00';
    var lastChapMeta = chapters.find(function (c) { return c.id === lastChapId; }) || chapters[0];
    var lastChapLabel = lastChapMeta ? (lastChapMeta.shortTitle || lastChapMeta.title) : '第 0 章';

    // 成就徽章
    var achievements = (global.DSGamify && typeof global.DSGamify.getAchievements === 'function')
      ? (global.DSGamify.getAchievements() || [])
      : [];
    var unlockedCount = achievements.filter(function (a) { return a.unlocked; }).length;

    // 章节星图卡片 HTML
    var ojAll = global.DS_OJ_PROBLEMS || [];
    var passedOJList = (info.state && Array.isArray(info.state.passedOJ)) ? info.state.passedOJ : [];

    var starCardsHtml = starChapters.map(function (c) {
      var pct = getChapterPct(c.id);
      var vizList = c.vizTabs || [];
      var labList = c.labIds || [];
      var chapOJs = ojAll.filter(function (p) { return p.chapterId === c.id; });
      var passedHere = 0;
      if (labList.length && info.state && info.state.passedLabs) {
        var pl = info.state.passedLabs;
        labList.forEach(function (lid) {
          if (Array.isArray(pl) ? pl.indexOf(lid) !== -1 : !!pl[lid]) passedHere++;
        });
      }
      var ojPassedHere = chapOJs.filter(function (p) { return passedOJList.indexOf(p.id) !== -1; }).length;
      var numText = c.group === 'appendix' ? (c.id === 'appA' ? '附录 A' : '附录 B') : ('第 ' + c.id + ' 章');
      return (
        '<div class="chapter-card' + (c.group === 'appendix' ? ' appendix' : '') + (pct >= 100 ? ' done' : '') + '">' +
          '<div class="chapter-card-top">' +
            '<div>' +
              '<span class="chapter-num-badge">' + escapeHtml(numText) + '</span>' +
              '<h3 class="chapter-card-title">' + escapeHtml(c.shortTitle || c.title) + '</h3>' +
            '</div>' +
            (c.difficulty ? '<span class="badge badge-amber">' + escapeHtml(c.difficulty) + '</span>' : '') +
          '</div>' +
          '<p class="chapter-card-summary">' + escapeHtml(c.summary || '系统掌握本章核心原理、内存模型与高频面试考点。') + '</p>' +
          '<div class="chapter-meta-row">' +
            (c.estDays ? '<span class="badge">⏱ ' + escapeHtml(c.estDays) + '</span>' : '') +
            (labList.length ? '<span class="badge ' + (passedHere === labList.length ? 'badge-green' : 'badge-blue') + '">🧩 挖空 ' + passedHere + '/' + labList.length + '</span>' : '') +
            (chapOJs.length ? '<span class="badge ' + (ojPassedHere === chapOJs.length ? 'badge-green' : 'badge-amber') + '">🔥 手搓 ' + ojPassedHere + '/' + chapOJs.length + '</span>' : '') +
            (vizList.length ? '<span class="badge badge-purple">🎬 ' + vizList.length + ' 动画</span>' : '') +
          '</div>' +
          '<div class="chapter-progress-row">' +
            '<div class="progress-track"><div class="progress-fill" style="width:' + pct + '%"></div></div>' +
            '<span style="font-family:var(--font-mono);font-weight:700;">' + pct + '%</span>' +
          '</div>' +
          '<div class="chapter-actions">' +
            '<button type="button" class="chapter-act-btn primary" data-go-reader="' + escapeHtml(c.id) + '">📖 学笔记</button>' +
            (vizList.length ? '<button type="button" class="chapter-act-btn" data-go-viz="' + escapeHtml(vizList[0]) + '">🎬 看动画</button>' : '') +
            (labList.length ? '<button type="button" class="chapter-act-btn" data-go-lab="' + escapeHtml(labList[0]) + '">🧩 挖空关</button>' : '') +
            (chapOJs.length ? '<button type="button" class="chapter-act-btn" data-go-oj="' + escapeHtml(chapOJs[0].id) + '">🔥 全手搓</button>' : '') +
            '<button type="button" class="chapter-act-btn" data-go-quiz="' + escapeHtml(c.id) + '">🎮 测验</button>' +
          '</div>' +
        '</div>'
      );
    }).join('');

    var achGridHtml = achievements.length
      ? achievements.map(function (a) {
          return (
            '<div class="ach-card ' + (a.unlocked ? 'unlocked' : 'locked') + '">' +
              '<span class="ach-ico">' + escapeHtml(a.icon || '🏆') + '</span>' +
              '<div>' +
                '<div class="ach-name">' + escapeHtml(a.name || a.title || '成就') + (a.unlocked ? ' ✓' : '') + '</div>' +
                '<div class="ach-desc">' + escapeHtml(a.desc || '') + '</div>' +
              '</div>' +
            '</div>'
          );
        }).join('')
      : '<p style="color:var(--text-muted);font-size:13px;">完成首次阅读、动画演练或刷题即可解锁成就徽章！</p>';

    var stats = manifest.stats || {};
    var totalLabs = stats.totalLabs || (global.DS_LABS ? global.DS_LABS.length : 15);
    var totalOJ = stats.totalOJ || (ojAll.length || 16);
    var totalQ = (global.DS_QUIZZES && global.DS_QUIZZES.questions) ? global.DS_QUIZZES.questions.length : 108;
    var totalBugs = (global.DS_QUIZZES && global.DS_QUIZZES.bugCases) ? global.DS_QUIZZES.bugCases.length : 24;

    mainEl.innerHTML =
      '<section class="dash-hero">' +
        '<div class="dash-hero-grid">' +
          '<div>' +
            '<div class="hero-eyebrow">🔥 今日学习连胜 ' + info.streak + ' 天 · 零基础直通全手搓算法</div>' +
            '<h1 class="hero-title">' + escapeHtml(manifest.bookTitle || '《数据结构与算法》全书交互式自学学院') + '</h1>' +
            '<p class="hero-subtitle">' + escapeHtml(manifest.subtitle || '配套徐雅静《数据结构与算法》：17 份精讲笔记 · 8 大交互动画 · 15 关骨架挖空 + 16 题全手搓 OJ 真编译评测 · 108 题库与找 Bug 诊所！') + '</p>' +
            '<div class="hero-xp-box">' +
              '<div class="hero-xp-top">' +
                '<span>🏅 当前段位：Lv.' + info.levelNum + ' ' + escapeHtml(info.title) + '</span>' +
                '<span>' + info.xp + ' XP / ' + (info.nextXP ? info.nextXP + ' XP' : 'MAX') + ' (' + info.pct + '%)</span>' +
              '</div>' +
              '<div class="hero-xp-track"><div class="hero-xp-fill" style="width:' + info.pct + '%"></div></div>' +
            '</div>' +
            '<div class="hero-actions">' +
              '<button type="button" class="hero-btn-main" id="btn-hero-continue">🚀 继续学习：' + escapeHtml(lastChapLabel) + '</button>' +
              '<button type="button" class="hero-btn-accent" id="btn-hero-oj">🔥 全手搓 OJ 挑战 (' + totalOJ + '题)</button>' +
              '<button type="button" class="hero-btn-ghost" id="btn-hero-viz">🎬 8 大动画实验室</button>' +
              '<button type="button" class="hero-btn-ghost" id="btn-hero-bug">🩺 找 Bug 大侦探</button>' +
            '</div>' +
          '</div>' +
          '<div class="hero-stats-grid">' +
            '<div class="hero-stat span-3"><div class="hero-stat-val">' + overallPct + '%</div><div class="hero-stat-lbl">📖 全书章节掌握度</div></div>' +
            '<div class="hero-stat span-3 highlight"><div class="hero-stat-val">' + info.passedOJ + ' / ' + totalOJ + '</div><div class="hero-stat-lbl">🔥 全手搓 OJ 已 AC</div></div>' +
            '<div class="hero-stat"><div class="hero-stat-val">' + info.passedLabs + ' / ' + totalLabs + '</div><div class="hero-stat-lbl">🧩 挖空实验通关</div></div>' +
            '<div class="hero-stat"><div class="hero-stat-val">' + info.answeredCount + ' / ' + totalQ + '</div><div class="hero-stat-lbl">🎯 交互刷题完成</div></div>' +
            '<div class="hero-stat"><div class="hero-stat-val">' + info.solvedBugs + ' / ' + totalBugs + '</div><div class="hero-stat-lbl">🩺 Bug 病例治愈</div></div>' +
          '</div>' +
        '</div>' +
      '</section>' +

      '<div class="section-header">' +
        '<h2 class="section-title">🗺️ 全书 8 章 + 2 附录闯关星图</h2>' +
        '<span class="section-sub">共 ' + (stats.totalLines || 27000) + '+ 行精讲笔记 · 15 关骨架挖空 + ' + totalOJ + ' 题全手搓 OJ · 点击任意卡片直达学习</span>' +
      '</div>' +
      '<div class="starmap-grid">' + starCardsHtml + '</div>' +

      '<div class="section-header">' +
        '<h2 class="section-title">📈 交互式大 O 复杂度增长探索器</h2>' +
        '<span class="section-sub">拖动规模 n 直观感受 O(1) 到 O(2ⁿ) 的震撼差距</span>' +
      '</div>' +
      '<div class="card dash-complexity-card" id="dash-complexity-mount"></div>' +

      '<div class="section-header">' +
        '<h2 class="section-title">🏆 成就徽章墙 <span class="badge badge-amber">' + unlockedCount + ' / ' + achievements.length + '</span></h2>' +
        '<span class="section-sub">持续阅读、跑通动画、AC 挖空与全手搓 OJ、治愈 Bug 即可点亮全部 ' + (achievements.length || 14) + ' 枚徽章</span>' +
      '</div>' +
      '<div class="achievements-grid">' + achGridHtml + '</div>' +

      '<div class="card dash-backup-bar">' +
        '<div>' +
          '<strong>💾 学习进度本地备份与迁移</strong>' +
          '<div style="font-size:12.5px;color:var(--text-muted);">所有笔记、XP、错题本与掌握记录均保存在浏览器本地，支持随时导出 JSON 备份防丢失。</div>' +
        '</div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
          '<button type="button" class="btn btn-sm btn-soft" id="btn-export-json">⬇ 导出进度 JSON</button>' +
          '<button type="button" class="btn btn-sm" id="btn-import-json">⬆ 导入进度备份</button>' +
          '<input type="file" id="input-import-json" accept=".json,application/json" class="hidden" />' +
          '<button type="button" class="btn btn-sm btn-danger" id="btn-reset-progress">🗑 重置进度</button>' +
        '</div>' +
      '</div>';

    // 挂载复杂度曲线探索器
    var cxMount = document.getElementById('dash-complexity-mount');
    if (cxMount && global.DSVisualizers && typeof global.DSVisualizers.mountComplexityChart === 'function') {
      global.DSVisualizers.mountComplexityChart(cxMount);
    } else if (cxMount) {
      cxMount.innerHTML = '<p style="color:var(--text-muted);margin:0;">复杂度曲线引擎装载中…</p>';
    }

    // 绑定 Hero 快捷按钮
    var btnCont = document.getElementById('btn-hero-continue');
    if (btnCont) btnCont.addEventListener('click', function () { navigate('reader', { chapterId: lastChapId }); });
    var btnHeroOJ = document.getElementById('btn-hero-oj');
    if (btnHeroOJ) btnHeroOJ.addEventListener('click', function () { navigate('lab', { mode: 'oj', ojId: localStorage.getItem('ds_last_oj') || 'oj01' }); });
    var btnViz = document.getElementById('btn-hero-viz');
    if (btnViz) btnViz.addEventListener('click', function () { navigate('viz', { tab: 'linkedlist' }); });
    var btnBug = document.getElementById('btn-hero-bug');
    if (btnBug) btnBug.addEventListener('click', function () { navigate('quiz', { mode: 'bug' }); });

    // 星图卡片按钮
    mainEl.querySelectorAll('[data-go-reader]').forEach(function (b) {
      b.addEventListener('click', function () { navigate('reader', { chapterId: b.getAttribute('data-go-reader') }); });
    });
    mainEl.querySelectorAll('[data-go-viz]').forEach(function (b) {
      b.addEventListener('click', function () { navigate('viz', { tab: b.getAttribute('data-go-viz') }); });
    });
    mainEl.querySelectorAll('[data-go-lab]').forEach(function (b) {
      b.addEventListener('click', function () { navigate('lab', { mode: 'labs', labId: b.getAttribute('data-go-lab') }); });
    });
    mainEl.querySelectorAll('[data-go-oj]').forEach(function (b) {
      b.addEventListener('click', function () { navigate('lab', { mode: 'oj', ojId: b.getAttribute('data-go-oj') }); });
    });
    mainEl.querySelectorAll('[data-go-quiz]').forEach(function (b) {
      b.addEventListener('click', function () { navigate('quiz', { mode: 'quiz', chapterId: b.getAttribute('data-go-quiz') }); });
    });

    // 导出 / 导入 / 重置进度
    var btnExport = document.getElementById('btn-export-json');
    if (btnExport) {
      btnExport.addEventListener('click', function () {
        var jsonStr = (global.DSGamify && typeof global.DSGamify.exportJSON === 'function')
          ? global.DSGamify.exportJSON()
          : JSON.stringify(info.state || {}, null, 2);
        var blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'ds_academy_progress_' + new Date().toISOString().slice(0, 10) + '.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
        toast('已导出学习进度备份文件！', 'success');
      });
    }

    var btnImport = document.getElementById('btn-import-json');
    var inputImport = document.getElementById('input-import-json');
    if (btnImport && inputImport) {
      btnImport.addEventListener('click', function () { inputImport.click(); });
      inputImport.addEventListener('change', function () {
        var f = inputImport.files && inputImport.files[0];
        if (!f) return;
        var reader = new FileReader();
        reader.onload = function () {
          try {
            if (global.DSGamify && typeof global.DSGamify.importJSON === 'function') {
              var ok = global.DSGamify.importJSON(String(reader.result || ''));
              if (ok === false) throw new Error('格式无效');
              toast('进度备份导入成功！', 'success');
              updateHeaderXP();
              renderDashboard(mainEl);
            }
          } catch (e) {
            toast('导入失败：JSON 文件格式不正确', 'error');
          }
        };
        reader.readAsText(f, 'utf-8');
      });
    }

    var btnReset = document.getElementById('btn-reset-progress');
    if (btnReset) {
      btnReset.addEventListener('click', function () {
        if (confirm('确定清空全部 XP、章节掌握度、错题本与笔记吗？（建议先导出 JSON 备份）')) {
          if (global.DSGamify && typeof global.DSGamify.resetProgress === 'function') {
            global.DSGamify.resetProgress();
          }
          toast('学习进度已重置', 'info');
          updateHeaderXP();
          renderDashboard(mainEl);
        }
      });
    }
  }

  /* ------------------------------------------------------------------------
     📚 视图 6：速查与习题专区 (Reference & Exercises)
     ------------------------------------------------------------------------ */
  function renderReference(mainEl, params) {
    params = params || {};
    var tab = params.tab || 'cheatsheet';
    var tabs = [
      { id: 'cheatsheet', label: '⚡ 交互速查表 + 复杂度曲线' },
      { id: 'exercises', label: '📝 课本习题精解 (习题1~7)' },
      { id: 'practice', label: '🧩 编程练习 40 题' },
      { id: 'guide', label: '🗺️ 写代码通关指南' }
    ];

    var chData = (global.DS_CHAPTERS && global.DS_CHAPTERS[tab]) || {
      id: tab, title: tab, markdown: '> 内容加载中…', headings: []
    };
    var headings = Array.isArray(chData.headings) && chData.headings.length
      ? chData.headings
      : (global.DSRenderer ? global.DSRenderer.extractHeadings(chData.markdown) : []);

    // 为速查表 / 习题精解 / 编程练习生成一键定位 Chips（只取 h2 主块）
    var h2List = headings.filter(function (h) { return h.level === 2; });
    var jumpChipsHtml = h2List.length
      ? '<div class="ref-jump-bar">' +
          '<span style="font-size:12px;font-weight:700;color:var(--text-muted);align-self:center;margin-right:4px;">快速定位：</span>' +
          h2List.map(function (h) {
            return '<button type="button" class="chip" data-ref-scroll="' + escapeHtml(h.slug) + '">' + escapeHtml(h.text) + '</button>';
          }).join('') +
        '</div>'
      : '';

    var rendered = global.DSRenderer
      ? global.DSRenderer.render(chData.markdown, { chapterId: tab, headings: headings, enableSectionCheck: false })
      : '<pre>' + escapeHtml(chData.markdown) + '</pre>';

    mainEl.innerHTML =
      '<div class="ref-header">' +
        '<div class="mode-tabs">' +
          tabs.map(function (t) {
            return '<button type="button" class="mode-tab' + (t.id === tab ? ' active' : '') + '" data-ref-tab="' + t.id + '">' + t.label + '</button>';
          }).join('') +
        '</div>' +
        '<button type="button" class="btn btn-sm btn-soft" id="btn-ref-open-reader">📖 在全书精读三栏模式中打开</button>' +
      '</div>' +
      (tab === 'cheatsheet' ? '<div class="card dash-complexity-card" style="margin-bottom:16px;" id="ref-complexity-mount"></div>' : '') +
      jumpChipsHtml +
      '<div class="card ref-content-card"><div class="md-body" id="ref-md-body">' + rendered + '</div></div>';

    if (tab === 'cheatsheet') {
      var cxEl = document.getElementById('ref-complexity-mount');
      if (cxEl && global.DSVisualizers && typeof global.DSVisualizers.mountComplexityChart === 'function') {
        global.DSVisualizers.mountComplexityChart(cxEl);
      }
    }

    var bodyEl = document.getElementById('ref-md-body');
    if (bodyEl && global.DSReaderView && typeof global.DSReaderView.bindMarkdownInteractions === 'function') {
      global.DSReaderView.bindMarkdownInteractions(bodyEl);
    }

    mainEl.querySelectorAll('[data-ref-tab]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        navigate('ref', { tab: btn.getAttribute('data-ref-tab') });
      });
    });

    mainEl.querySelectorAll('[data-ref-scroll]').forEach(function (chip) {
      chip.addEventListener('click', function () {
        if (global.DSReaderView) {
          global.DSReaderView.scrollToAnchor(bodyEl, chip.getAttribute('data-ref-scroll'));
        }
      });
    });

    var btnOpenReader = document.getElementById('btn-ref-open-reader');
    if (btnOpenReader) {
      btnOpenReader.addEventListener('click', function () {
        navigate('reader', { chapterId: tab });
      });
    }

    if (params.anchor && global.DSReaderView) {
      setTimeout(function () { global.DSReaderView.scrollToAnchor(bodyEl, params.anchor); }, 60);
    }
  }

  /* ------------------------------------------------------------------------
     SPA 路由器
     ------------------------------------------------------------------------ */
  function updateActiveNav(route) {
    document.querySelectorAll('#main-nav .nav-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-route') === route);
    });
  }

  function unmountCurrentView() {
    if (global.DSReaderView && typeof global.DSReaderView.unmount === 'function') {
      global.DSReaderView.unmount();
    }
    if (global.DSLabView && typeof global.DSLabView.unmount === 'function') {
      global.DSLabView.unmount();
    }
    if (activeVizController && typeof activeVizController.destroy === 'function') {
      activeVizController.destroy();
      activeVizController = null;
    }
    if (global.DSVisualizers && typeof global.DSVisualizers.unmount === 'function') {
      global.DSVisualizers.unmount();
    }
  }

  function buildHash(route, params) {
    params = params || {};
    if (route === 'dashboard') return '#dashboard';
    if (route === 'reader') {
      var h = '#reader/' + encodeURIComponent(params.chapterId || localStorage.getItem('ds_last_chapter') || '00');
      if (params.anchor) h += '/' + encodeURIComponent(params.anchor);
      return h;
    }
    if (route === 'viz') return '#viz/' + encodeURIComponent(params.tab || 'linkedlist');
    if (route === 'lab') {
      if (params.mode === 'demos') return '#lab/demos' + (params.demoFilename ? '/' + encodeURIComponent(params.demoFilename) : '');
      if (params.mode === 'oj') return '#lab/oj' + (params.ojId ? '/' + encodeURIComponent(params.ojId) : '');
      return '#lab/' + encodeURIComponent(params.labId || localStorage.getItem('ds_last_lab') || '00');
    }
    if (route === 'quiz') {
      return '#quiz/' + encodeURIComponent(params.mode || 'quiz') + (params.chapterId ? '/' + encodeURIComponent(params.chapterId) : '');
    }
    if (route === 'ref') {
      return '#ref/' + encodeURIComponent(params.tab || 'cheatsheet') + (params.anchor ? '/' + encodeURIComponent(params.anchor) : '');
    }
    return '#dashboard';
  }

  function parseHash(hashStr) {
    var raw = String(hashStr || '').replace(/^#/, '');
    if (!raw) return { route: 'dashboard', params: {} };
    var parts = raw.split('/').map(function (p) {
      try { return decodeURIComponent(p); } catch (e) { return p; }
    });
    var r = parts[0];
    if (r === 'reader') return { route: 'reader', params: { chapterId: parts[1] || '00', anchor: parts[2] || '' } };
    if (r === 'viz') return { route: 'viz', params: { tab: parts[1] || 'linkedlist' } };
    if (r === 'lab') {
      if (parts[1] === 'demos') return { route: 'lab', params: { mode: 'demos', demoFilename: parts[2] || '' } };
      if (parts[1] === 'oj') return { route: 'lab', params: { mode: 'oj', ojId: parts[2] || '' } };
      return { route: 'lab', params: { mode: 'labs', labId: parts[1] || '00' } };
    }
    if (r === 'quiz') return { route: 'quiz', params: { mode: parts[1] || 'quiz', chapterId: parts[2] || '' } };
    if (r === 'ref') return { route: 'ref', params: { tab: parts[1] || 'cheatsheet', anchor: parts[2] || '' } };
    return { route: 'dashboard', params: {} };
  }

  function renderCurrentView() {
    var mainEl = document.getElementById('app-main');
    if (!mainEl) return;
    unmountCurrentView();
    updateActiveNav(currentRoute);

    if (currentRoute === 'dashboard') {
      renderDashboard(mainEl);
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }

    if (currentRoute === 'reader') {
      if (global.DSReaderView && typeof global.DSReaderView.mount === 'function') {
        global.DSReaderView.mount(mainEl, currentParams);
      }
      return;
    }

    if (currentRoute === 'viz') {
      mainEl.innerHTML = '<div id="viz-mount-root"></div>';
      var vizRoot = document.getElementById('viz-mount-root');
      if (global.DSVisualizers && typeof global.DSVisualizers.mount === 'function') {
        activeVizController = global.DSVisualizers.mount(vizRoot, currentParams.tab || 'linkedlist');
      } else {
        vizRoot.innerHTML = '<div class="card" style="padding:36px;text-align:center;">动画引擎模块加载中…</div>';
      }
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }

    if (currentRoute === 'lab') {
      if (global.DSLabView && typeof global.DSLabView.mount === 'function') {
        global.DSLabView.mount(mainEl, currentParams);
      }
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }

    if (currentRoute === 'quiz') {
      mainEl.innerHTML = '<div id="quiz-mount-root"></div>';
      var quizRoot = document.getElementById('quiz-mount-root');
      if (global.DSQuizView && typeof global.DSQuizView.mount === 'function') {
        global.DSQuizView.mount(quizRoot, currentParams.mode || 'quiz', currentParams.chapterId || 'all');
      } else {
        quizRoot.innerHTML = '<div class="card" style="padding:36px;text-align:center;">刷题与诊所模块加载中…</div>';
      }
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }

    if (currentRoute === 'ref') {
      renderReference(mainEl, currentParams);
      if (!currentParams.anchor) window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }

  function navigate(route, params, skipHashUpdate) {
    currentRoute = route || 'dashboard';
    currentParams = params || {};
    if (!skipHashUpdate) {
      var nextHash = buildHash(currentRoute, currentParams);
      if (location.hash !== nextHash) {
        history.pushState(null, '', nextHash);
      }
    }
    renderCurrentView();
  }

  /* ------------------------------------------------------------------------
     全局 Ctrl+K 闪电搜索引擎（全书 17 文档标题+正文 + 15 Labs + 30 Demos + 60 闪卡）
     ------------------------------------------------------------------------ */
  function buildSearchIndex() {
    if (searchIndex) return searchIndex;
    var items = [];
    var manifest = global.DS_MANIFEST || { chapters: [] };
    var chapMap = {};
    (manifest.chapters || []).forEach(function (c) { chapMap[c.id] = c; });

    // 1. 全书章节标题与正文索引
    var allCh = global.DS_CHAPTERS || {};
    Object.keys(allCh).forEach(function (cid) {
      var ch = allCh[cid];
      if (!ch) return;
      var meta = chapMap[cid];
      var chTitle = (meta && meta.shortTitle) || ch.title || cid;
      items.push({
        type: 'chapter',
        badge: '📖 章节',
        title: ch.title || chTitle,
        subtitle: (meta && meta.summary) || chTitle,
        body: (ch.markdown || '').slice(0, 60000),
        chapterId: cid,
        anchor: ''
      });
      (ch.headings || []).forEach(function (h) {
        items.push({
          type: 'chapter',
          badge: '📑 ' + chTitle,
          title: h.text,
          subtitle: ch.title || chTitle,
          body: h.text,
          chapterId: cid,
          anchor: h.slug
        });
      });
    });

    // 2. 15 关实验 + 16 题全手搓 OJ
    (global.DS_LABS || []).forEach(function (l) {
      var hintText = (l.hints || []).map(function (h) { return (h.sig || '') + ' ' + (h.lines || []).join(' '); }).join(' ');
      items.push({
        type: 'lab',
        badge: '🧩 Lab ' + l.id,
        title: 'Lab ' + l.id + ' · ' + l.title,
        subtitle: l.desc || '',
        body: (l.desc || '') + ' ' + hintText,
        labId: l.id
      });
    });
    (global.DS_OJ_PROBLEMS || []).forEach(function (p) {
      items.push({
        type: 'lab',
        isOJ: true,
        badge: '🔥 全手搓 #' + p.num,
        title: '#' + String(p.num).padStart(2, '0') + ' · ' + p.title,
        subtitle: p.summary || '',
        body: (p.summary || '') + ' ' + (p.tags || []).join(' ') + ' ' + (p.description || '').slice(0, 600),
        ojId: p.id
      });
    });

    // 3. 30 个演示代码
    (global.DS_DEMOS || []).forEach(function (d) {
      items.push({
        type: 'demo',
        badge: '📦 演示代码',
        title: d.title || d.filename,
        subtitle: 'code/' + d.filename,
        body: d.filename + ' ' + (d.title || ''),
        demoFilename: d.filename
      });
    });

    // 4. 60 张核心闪卡
    ((global.DS_QUIZZES && global.DS_QUIZZES.flashcards) || []).forEach(function (c) {
      var plainFront = String(c.front || '').replace(/<[^>]+>/g, '');
      var plainBack = String(c.back || '').replace(/<[^>]+>/g, '');
      items.push({
        type: 'card',
        badge: '🃏 闪卡 · ' + (c.category || ('第' + c.chapterId + '章')),
        title: plainFront,
        subtitle: plainBack.slice(0, 120),
        body: plainFront + ' ' + plainBack,
        chapterId: c.chapterId
      });
    });

    searchIndex = items;
    return items;
  }

  function runSearch(rawQuery) {
    var idx = buildSearchIndex();
    var q = String(rawQuery || '').trim().toLowerCase();
    var pool = searchScope === 'all' ? idx : idx.filter(function (it) { return it.type === searchScope; });

    if (!q) {
      // 空查询展示推荐热搜入口
      return pool.filter(function (it) { return !it.anchor; }).slice(0, 12).map(function (it) {
        return { item: it, snippet: it.subtitle || '' };
      });
    }

    var terms = q.split(/\s+/).filter(Boolean);
    var scored = [];
    for (var i = 0; i < pool.length; i++) {
      var it = pool[i];
      var titleL = (it.title || '').toLowerCase();
      var subL = (it.subtitle || '').toLowerCase();
      var bodyL = (it.body || '').toLowerCase();
      var score = 0;
      var matchedAll = true;
      var matchPos = -1;

      for (var t = 0; t < terms.length; t++) {
        var term = terms[t];
        var inT = titleL.indexOf(term);
        var inS = subL.indexOf(term);
        var inB = bodyL.indexOf(term);
        if (inT === -1 && inS === -1 && inB === -1) {
          matchedAll = false;
          break;
        }
        if (inT !== -1) score += (inT === 0 ? 40 : 25);
        if (inS !== -1) score += 10;
        if (inB !== -1) {
          score += 4;
          if (matchPos === -1) matchPos = inB;
        }
      }
      if (!matchedAll) continue;
      // 标题/实验略优先于整篇正文
      if (it.anchor) score += 8;
      if (it.type === 'lab') score += 6;

      var snippet = it.subtitle || '';
      if (matchPos !== -1 && it.body && it.body.length > 140) {
        var sStart = Math.max(0, matchPos - 35);
        var sEnd = Math.min(it.body.length, matchPos + 95);
        snippet = (sStart > 0 ? '…' : '') + it.body.slice(sStart, sEnd).replace(/\s+/g, ' ') + (sEnd < it.body.length ? '…' : '');
      }
      scored.push({ item: it, score: score, snippet: snippet });
    }

    scored.sort(function (a, b) { return b.score - a.score; });
    return scored.slice(0, 24);
  }

  function highlightTerm(text, query) {
    var esc = escapeHtml(text || '');
    var q = String(query || '').trim();
    if (!q) return esc;
    var terms = q.split(/\s+/).filter(Boolean).slice(0, 3);
    terms.forEach(function (term) {
      var safe = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      esc = esc.replace(new RegExp('(' + safe + ')', 'gi'), '<mark class="md-search-hl">$1</mark>');
    });
    return esc;
  }

  function renderSearchResults(query) {
    var listEl = document.getElementById('search-results');
    if (!listEl) return;
    searchHits = runSearch(query);
    searchActiveIdx = 0;

    if (!searchHits.length) {
      listEl.innerHTML = '<div class="search-empty">没有找到与 “' + escapeHtml(query) + '” 相关的内容，换个关键词试试（如：链表、KMP、哈夫曼、排序、复杂度）</div>';
      return;
    }

    listEl.innerHTML = searchHits.map(function (hit, idx) {
      var it = hit.item;
      return (
        '<button type="button" class="search-hit' + (idx === 0 ? ' active' : '') + '" data-hit-idx="' + idx + '">' +
          '<div class="search-hit-top">' +
            '<span class="search-hit-title">' + highlightTerm(it.title, query) + '</span>' +
            '<span class="badge">' + escapeHtml(it.badge) + '</span>' +
          '</div>' +
          (hit.snippet ? '<div class="search-hit-snippet">' + highlightTerm(hit.snippet, query) + '</div>' : '') +
        '</button>'
      );
    }).join('');

    listEl.querySelectorAll('.search-hit').forEach(function (btn) {
      btn.addEventListener('click', function () {
        activateSearchHit(Number(btn.getAttribute('data-hit-idx')), query);
      });
    });
  }

  function activateSearchHit(idx, query) {
    var hit = searchHits[idx];
    if (!hit) return;
    var it = hit.item;
    closeSearchModal();
    if (it.type === 'chapter') {
      navigate('reader', { chapterId: it.chapterId, anchor: it.anchor, searchQuery: it.anchor ? '' : query });
    } else if (it.type === 'lab') {
      if (it.isOJ) {
        navigate('lab', { mode: 'oj', ojId: it.ojId });
      } else {
        navigate('lab', { mode: 'labs', labId: it.labId });
      }
    } else if (it.type === 'demo') {
      navigate('lab', { mode: 'demos', demoFilename: it.demoFilename });
    } else if (it.type === 'card') {
      navigate('quiz', { mode: 'flashcard', chapterId: it.chapterId || 'all' });
    }
  }

  function openSearchModal() {
    var modal = document.getElementById('search-modal');
    var input = document.getElementById('search-input');
    if (!modal || !input) return;
    modal.classList.remove('hidden');
    input.value = '';
    renderSearchResults('');
    setTimeout(function () { input.focus(); }, 20);
  }

  function closeSearchModal() {
    var modal = document.getElementById('search-modal');
    if (modal) modal.classList.add('hidden');
  }

  function initSearchModal() {
    var btnOpen = document.getElementById('btn-open-search');
    var btnClose = document.getElementById('btn-close-search');
    var modal = document.getElementById('search-modal');
    var input = document.getElementById('search-input');

    if (btnOpen) btnOpen.addEventListener('click', openSearchModal);
    if (btnClose) btnClose.addEventListener('click', closeSearchModal);
    if (modal) {
      modal.addEventListener('click', function (ev) {
        if (ev.target === modal) closeSearchModal();
      });
    }

    if (input) {
      input.addEventListener('input', function () {
        renderSearchResults(input.value);
      });
      input.addEventListener('keydown', function (ev) {
        if (ev.key === 'Escape') {
          closeSearchModal();
        } else if (ev.key === 'ArrowDown') {
          ev.preventDefault();
          if (!searchHits.length) return;
          searchActiveIdx = (searchActiveIdx + 1) % searchHits.length;
          updateSearchActiveClass();
        } else if (ev.key === 'ArrowUp') {
          ev.preventDefault();
          if (!searchHits.length) return;
          searchActiveIdx = (searchActiveIdx - 1 + searchHits.length) % searchHits.length;
          updateSearchActiveClass();
        } else if (ev.key === 'Enter') {
          ev.preventDefault();
          activateSearchHit(searchActiveIdx, input.value);
        }
      });
    }

    document.querySelectorAll('#search-filter-bar .chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        searchScope = chip.getAttribute('data-scope') || 'all';
        document.querySelectorAll('#search-filter-bar .chip').forEach(function (c) {
          c.classList.toggle('active', c === chip);
        });
        renderSearchResults(input ? input.value : '');
      });
    });

    // 全局 Ctrl+K / Cmd+K 快捷键
    document.addEventListener('keydown', function (ev) {
      if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 'k') {
        ev.preventDefault();
        if (modal && modal.classList.contains('hidden')) openSearchModal();
        else closeSearchModal();
      } else if (ev.key === 'Escape') {
        closeSearchModal();
        var srvModal = document.getElementById('server-modal');
        if (srvModal) srvModal.classList.add('hidden');
      }
    });
  }

  function updateSearchActiveClass() {
    var hits = document.querySelectorAll('#search-results .search-hit');
    hits.forEach(function (el, idx) {
      el.classList.toggle('active', idx === searchActiveIdx);
      if (idx === searchActiveIdx) el.scrollIntoView({ block: 'nearest' });
    });
  }

  /* ------------------------------------------------------------------------
     启动入口
     ------------------------------------------------------------------------ */
  function boot() {
    initTheme();
    initSearchModal();

    // 绑定顶部 6 大导航
    document.querySelectorAll('#main-nav .nav-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var route = btn.getAttribute('data-route');
        navigate(route);
      });
    });

    var brandLink = document.getElementById('brand-link');
    if (brandLink) {
      brandLink.addEventListener('click', function (ev) {
        ev.preventDefault();
        navigate('dashboard');
      });
    }

    var xpPill = document.getElementById('xp-pill');
    if (xpPill) xpPill.addEventListener('click', function () { navigate('dashboard'); });

    var srvPill = document.getElementById('server-pill');
    if (srvPill) srvPill.addEventListener('click', openServerModal);

    var btnShutdown = document.getElementById('btn-shutdown-server');
    if (btnShutdown) btnShutdown.addEventListener('click', shutdownServer);

    var srvModal = document.getElementById('server-modal');
    var btnCloseSrv = document.getElementById('btn-close-server-modal');
    if (btnCloseSrv && srvModal) btnCloseSrv.addEventListener('click', function () { srvModal.classList.add('hidden'); });
    if (srvModal) srvModal.addEventListener('click', function (ev) { if (ev.target === srvModal) srvModal.classList.add('hidden'); });

    // 订阅游戏化状态变化
    if (global.DSGamify && typeof global.DSGamify.subscribe === 'function') {
      global.DSGamify.subscribe(updateHeaderXP);
    }
    updateHeaderXP();

    // 监听浏览器前进/后退
    window.addEventListener('popstate', function () {
      var parsed = parseHash(location.hash);
      navigate(parsed.route, parsed.params, true);
    });

    // 检测本地 server.py & g++
    checkServer(false).then(function () {
      // 如果当前停留在 lab 页面，检测完成后自动刷新离线/在线横幅
      if (currentRoute === 'lab') {
        renderCurrentView();
      }
    });

    // 解析初始路由
    var initial = parseHash(location.hash);
    navigate(initial.route, initial.params, true);
  }

  global.DSApp = {
    navigate: navigate,
    getServerStatus: function () { return serverStatus; },
    checkServer: checkServer,
    shutdownServer: shutdownServer,
    toast: toast,
    celebrate: celebrate,
    openSearch: openSearchModal
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window);

/* ==========================================================================
   js/reader_view.js — 全书精读三栏阅读器（章节树 + 精读区 + TOC/联动/个人笔记）
   暴露全局接口：window.DSReaderView
   ========================================================================== */
(function (global) {
  'use strict';

  var activeCleanup = null;
  var currentFontSize = Number(localStorage.getItem('ds_reader_font') || 15.5);
  var focusMode = false;

  function escapeHtml(s) {
    return global.DSRenderer ? global.DSRenderer.escapeHtml(s) : String(s || '');
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(function () {
        fallbackCopy(text);
      });
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

  function notify(msg, type) {
    if (global.DSGamify && typeof global.DSGamify.toast === 'function') {
      global.DSGamify.toast(msg, type);
    } else if (global.DSApp && typeof global.DSApp.toast === 'function') {
      global.DSApp.toast(msg, type);
    }
  }

  /**
   * 解析内部 .md / labs/ / code/ 相对链接并跳转到站内 SPA 路由
   */
  function resolveInternalLink(rawHref) {
    if (!rawHref) return null;
    var parts = String(rawHref).trim().split('#');
    var filePart = decodeURIComponent(parts[0] || '').replace(/^(?:\.\.\/|\.\/)+/, '');
    var anchor = parts[1] ? decodeURIComponent(parts[1]) : '';

    if (/^labs\//i.test(filePart)) {
      var labIdMatch = filePart.match(/(\d{2})/);
      return { route: 'lab', mode: 'labs', labId: labIdMatch ? labIdMatch[1] : '00' };
    }
    if (/^code\//i.test(filePart)) {
      var demoName = filePart.replace(/^code\//i, '');
      if (/\.cpp$/i.test(demoName)) {
        return { route: 'lab', mode: 'demos', demoFilename: demoName };
      }
      return { route: 'lab', mode: 'demos' };
    }
    if (/^README\.md$/i.test(filePart)) {
      return { route: 'dashboard' };
    }

    var manifest = global.DS_MANIFEST;
    if (manifest && Array.isArray(manifest.chapters)) {
      for (var i = 0; i < manifest.chapters.length; i++) {
        var ch = manifest.chapters[i];
        if (ch.file === filePart || ch.file.toLowerCase() === filePart.toLowerCase()) {
          return { route: 'reader', chapterId: ch.id, anchor: anchor };
        }
      }
    }

    // 按前缀兜底匹配（如 02-线性表.md）
    var prefixMatch = filePart.match(/^(0[0-7])-/);
    if (prefixMatch) {
      return { route: 'reader', chapterId: prefixMatch[1], anchor: anchor };
    }
    if (/附录A/i.test(filePart)) return { route: 'reader', chapterId: 'appA', anchor: anchor };
    if (/附录B/i.test(filePart)) return { route: 'reader', chapterId: 'appB', anchor: anchor };
    if (/速查表/i.test(filePart)) return { route: 'ref', tab: 'cheatsheet', anchor: anchor };
    if (/课本习题/i.test(filePart)) return { route: 'ref', tab: 'exercises', anchor: anchor };
    if (/编程练习/i.test(filePart)) return { route: 'ref', tab: 'practice', anchor: anchor };
    if (/写代码通关指南/i.test(filePart)) return { route: 'ref', tab: 'guide', anchor: anchor };
    return null;
  }

  function scrollToAnchor(containerEl, anchor) {
    if (!anchor) return false;
    var target = document.getElementById(anchor);
    if (!target) {
      var slugged = global.DSRenderer ? global.DSRenderer.slugify(anchor) : anchor;
      target = document.getElementById(slugged);
    }
    if (!target && containerEl) {
      // 模糊匹配标题文本
      var headings = containerEl.querySelectorAll('h1,h2,h3,h4');
      var needle = anchor.replace(/-/g, '').toLowerCase();
      for (var i = 0; i < headings.length; i++) {
        var txt = (headings[i].textContent || '').replace(/\s+/g, '').toLowerCase();
        if (txt.indexOf(needle) !== -1) {
          target = headings[i];
          break;
        }
      }
    }
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return true;
    }
    return false;
  }

  /**
   * 为任意渲染后的 Markdown 容器绑定交互（复制代码、章节掌握、<details> XP/收藏、站内链接）
   */
  function bindMarkdownInteractions(articleEl, opts) {
    opts = opts || {};
    var gamify = global.DSGamify;

    function getGotItMap() {
      try { return JSON.parse(localStorage.getItem('ds_details_gotit') || '{}') || {}; } catch (e) { return {}; }
    }
    function setGotIt(did) {
      var m = getGotItMap();
      m[did] = 1;
      try { localStorage.setItem('ds_details_gotit', JSON.stringify(m)); } catch (e) {}
    }

    // 初始化 <details> 按钮状态
    var gotMap = getGotItMap();
    articleEl.querySelectorAll('.ds-detail-gotit').forEach(function (btn) {
      var did = btn.getAttribute('data-detail-id');
      if (gotMap[did]) {
        btn.textContent = '✅ 已掌握';
        btn.classList.add('btn-success');
        btn.classList.remove('btn-soft');
      }
    });
    if (gamify) {
      articleEl.querySelectorAll('.ds-detail-bm').forEach(function (btn) {
        var bid = btn.getAttribute('data-bm-id');
        if (typeof gamify.isBookmarked === 'function' && gamify.isBookmarked(bid)) {
          btn.textContent = '⭐ 已收藏';
          btn.classList.add('btn-soft');
        }
      });
    }

    articleEl.addEventListener('click', function (ev) {
      // 1. 复制代码
      var copyBtn = ev.target.closest('.md-copy-btn');
      if (copyBtn) {
        var code = decodeURIComponent(copyBtn.getAttribute('data-copy-code') || '');
        copyToClipboard(code).then(function () {
          var prev = copyBtn.textContent;
          copyBtn.textContent = '✅ 已复制';
          setTimeout(function () { copyBtn.textContent = prev; }, 1400);
          notify('代码已复制到剪贴板', 'success');
        });
        return;
      }

      // 2. 小节「标记已掌握」
      var secBtn = ev.target.closest('.sec-done-btn');
      if (secBtn) {
        var chId = secBtn.getAttribute('data-sec-chapter');
        var slug = secBtn.getAttribute('data-sec-slug');
        if (gamify && typeof gamify.toggleSectionDone === 'function') {
          var nowDone = gamify.toggleSectionDone(chId, slug);
          secBtn.classList.toggle('is-done', !!nowDone);
          secBtn.textContent = nowDone ? '✅ 已掌握' : '⬜ 标记已掌握';
          if (typeof opts.onProgressChange === 'function') {
            opts.onProgressChange(chId, slug, !!nowDone);
          }
        }
        return;
      }

      // 3. <details> 「我会了 (+5 XP)」
      var gotBtn = ev.target.closest('.ds-detail-gotit');
      if (gotBtn) {
        var detailId = gotBtn.getAttribute('data-detail-id');
        var curMap = getGotItMap();
        if (!curMap[detailId]) {
          setGotIt(detailId);
          if (gamify && typeof gamify.addXP === 'function') {
            gamify.addXP(5, '掌握折叠思考题');
          } else {
            notify('太棒了！掌握一道思考题 +5 XP', 'success');
          }
          gotBtn.textContent = '✅ 已掌握';
          gotBtn.classList.add('btn-success');
          gotBtn.classList.remove('btn-soft');
        } else {
          notify('这题你已经掌握过啦！', 'info');
        }
        return;
      }

      // 4. <details> 「收藏」
      var bmBtn = ev.target.closest('.ds-detail-bm');
      if (bmBtn) {
        var bmId = bmBtn.getAttribute('data-bm-id');
        var bmTitle = bmBtn.getAttribute('data-bm-title') || '精选解析';
        if (gamify && typeof gamify.toggleBookmark === 'function') {
          var isBm = gamify.toggleBookmark(bmId, bmTitle);
          bmBtn.textContent = isBm ? '⭐ 已收藏' : '⭐ 收藏';
          bmBtn.classList.toggle('btn-soft', !!isBm);
        }
        return;
      }

      // 5. 内部 .md 链接拦截
      var intLink = ev.target.closest('.md-internal-link');
      if (intLink) {
        ev.preventDefault();
        var href = intLink.getAttribute('data-md-link');
        var target = resolveInternalLink(href);
        if (target && global.DSApp && typeof global.DSApp.navigate === 'function') {
          if (target.route === 'reader') {
            global.DSApp.navigate('reader', { chapterId: target.chapterId, anchor: target.anchor });
          } else if (target.route === 'ref') {
            global.DSApp.navigate('ref', { tab: target.tab, anchor: target.anchor });
          } else if (target.route === 'lab') {
            global.DSApp.navigate('lab', {
              mode: target.mode || 'labs',
              labId: target.labId,
              demoFilename: target.demoFilename
            });
          } else {
            global.DSApp.navigate(target.route);
          }
        }
        return;
      }

      // 6. 页内锚点
      var anchorLink = ev.target.closest('.md-anchor-link');
      if (anchorLink) {
        ev.preventDefault();
        scrollToAnchor(articleEl, anchorLink.getAttribute('data-md-anchor'));
      }
    });
  }

  function getChapterPct(chapterId) {
    var gamify = global.DSGamify;
    var chData = global.DS_CHAPTERS && global.DS_CHAPTERS[chapterId];
    var total = chData && Array.isArray(chData.sectionSlugs) ? chData.sectionSlugs.length
      : (chData && Array.isArray(chData.headings) ? chData.headings.length : 0);
    if (gamify && typeof gamify.getChapterProgress === 'function') {
      var res = gamify.getChapterProgress(chapterId, total);
      if (typeof res === 'number') return Math.round(res);
      if (res && typeof res.percent === 'number') return Math.round(res.percent);
      if (res && typeof res.pct === 'number') return Math.round(res.pct);
    }
    return 0;
  }

  function getVizName(vizId) {
    if (global.DSVisualizers && Array.isArray(global.DSVisualizers.TABS)) {
      for (var i = 0; i < global.DSVisualizers.TABS.length; i++) {
        if (global.DSVisualizers.TABS[i].id === vizId) {
          return global.DSVisualizers.TABS[i].icon + ' ' + global.DSVisualizers.TABS[i].title;
        }
      }
    }
    var fallback = {
      linkedlist: '🔗 单链表指针动画',
      queue: '🔄 循环队列环形槽',
      kmp: '⚡ KMP 匹配动画',
      tree: '🌳 二叉树遍历动画',
      huffman: '🌲 哈夫曼编码动画',
      graph: '🕸️ 图遍历与最短路',
      bst: '🔍 BST 动态增查删',
      sort: '📊 6大排序竞技场'
    };
    return fallback[vizId] || ('🎬 ' + vizId);
  }

  function unmount() {
    if (typeof activeCleanup === 'function') {
      activeCleanup();
      activeCleanup = null;
    }
  }

  function mount(containerEl, opts) {
    unmount();
    opts = opts || {};

    var manifest = global.DS_MANIFEST || { chapters: [] };
    var chapters = manifest.chapters || [];
    var allChapterData = global.DS_CHAPTERS || {};

    var chapterId = opts.chapterId || localStorage.getItem('ds_last_chapter') || (chapters[0] ? chapters[0].id : '00');
    if (!allChapterData[chapterId] && chapters.length) {
      chapterId = chapters[0].id;
    }
    localStorage.setItem('ds_last_chapter', chapterId);

    var chMeta = chapters.find(function (c) { return c.id === chapterId; }) || {
      id: chapterId, title: chapterId, shortTitle: chapterId, group: 'core', labIds: [], vizTabs: []
    };
    var chData = allChapterData[chapterId] || { id: chapterId, title: chMeta.title, markdown: '> 正在等待数据加载…', headings: [] };
    var headings = (Array.isArray(chData.headings) && chData.headings.length)
      ? chData.headings
      : (global.DSRenderer ? global.DSRenderer.extractHeadings(chData.markdown) : []);

    // 分组左侧章节树
    var groups = [
      { key: 'core', label: '📘 全书核心精讲 (00~07)' },
      { key: 'appendix', label: '📎 附录与 C++ 进阶' },
      { key: 'resource', label: '📚 宝典、习题与速查' }
    ];

    var sidebarTreeHtml = groups.map(function (grp) {
      var list = chapters.filter(function (c) { return c.group === grp.key; });
      if (!list.length) return '';
      return (
        '<div class="reader-group-title">' + grp.label + '</div>' +
        list.map(function (c) {
          var pct = getChapterPct(c.id);
          var isAct = c.id === chapterId;
          return (
            '<button type="button" class="reader-chap-item' + (isAct ? ' active' : '') + (pct >= 100 ? ' done' : '') + '" data-chap-id="' + escapeHtml(c.id) + '">' +
              '<span>' + escapeHtml(c.shortTitle || c.title) + '</span>' +
              '<span class="reader-chap-pct" data-tree-pct="' + escapeHtml(c.id) + '">' + (pct >= 100 ? '✅' : pct + '%') + '</span>' +
            '</button>'
          );
        }).join('')
      );
    }).join('');

    // TOC 列表
    var gamify = global.DSGamify;
    var tocHtml = headings.length
      ? headings.map(function (h) {
          var done = gamify && typeof gamify.isSectionDone === 'function' && gamify.isSectionDone(chapterId, h.slug);
          return (
            '<li class="toc-item level-' + h.level + (done ? ' done' : '') + '" data-toc-slug="' + escapeHtml(h.slug) + '">' +
              '<a href="javascript:void(0)" data-scroll-to="' + escapeHtml(h.slug) + '">' + escapeHtml(h.text) + '</a>' +
            '</li>'
          );
        }).join('')
      : '<li style="font-size:12px;color:var(--text-muted);padding:4px 8px;">本章暂无子目录</li>';

    // 本章联动快捷卡
    var linkedBtns = [];
    (chMeta.vizTabs || []).forEach(function (vId) {
      linkedBtns.push('<button type="button" class="btn btn-sm btn-soft" data-jump-viz="' + escapeHtml(vId) + '">' + escapeHtml(getVizName(vId)) + '</button>');
    });
    (chMeta.labIds || []).forEach(function (lId) {
      var labObj = (global.DS_LABS || []).find(function (l) { return l.id === lId; });
      var lTitle = labObj ? ('Lab ' + lId + ' ' + labObj.title) : ('闯关 Lab ' + lId);
      linkedBtns.push('<button type="button" class="btn btn-sm" data-jump-lab="' + escapeHtml(lId) + '">💻 ' + escapeHtml(lTitle) + '</button>');
    });
    if (chMeta.group === 'core' || chMeta.group === 'appendix') {
      linkedBtns.push('<button type="button" class="btn btn-sm" data-jump-quiz="' + escapeHtml(chapterId) + '">🎮 本章专项刷题</button>');
      if (chMeta.group === 'core') {
        linkedBtns.push('<button type="button" class="btn btn-sm" data-jump-bug="' + escapeHtml(chapterId) + '">🩺 本章找 Bug 病例</button>');
      }
    }

    // 上一章 / 下一章
    var curIdx = chapters.findIndex(function (c) { return c.id === chapterId; });
    var prevCh = curIdx > 0 ? chapters[curIdx - 1] : null;
    var nextCh = curIdx >= 0 && curIdx < chapters.length - 1 ? chapters[curIdx + 1] : null;

    var prevNextHtml = '<div class="reader-prev-next">' +
      (prevCh
        ? '<button type="button" class="prev-next-btn" data-chap-id="' + escapeHtml(prevCh.id) + '"><span class="prev-next-dir">← 上一篇</span><span class="prev-next-title">' + escapeHtml(prevCh.title) + '</span></button>'
        : '<div></div>') +
      (nextCh
        ? '<button type="button" class="prev-next-btn next" data-chap-id="' + escapeHtml(nextCh.id) + '"><span class="prev-next-dir">下一篇 →</span><span class="prev-next-title">' + escapeHtml(nextCh.title) + '</span></button>'
        : '<div></div>') +
      '</div>';

    var savedNote = (gamify && typeof gamify.getNote === 'function') ? (gamify.getNote(chapterId) || '') : '';
    var isChapBm = gamify && typeof gamify.isBookmarked === 'function' && gamify.isBookmarked('chapter:' + chapterId);
    var chapPct = getChapterPct(chapterId);

    // 渲染正文
    var articleHtml = global.DSRenderer
      ? global.DSRenderer.render(chData.markdown, { chapterId: chapterId, headings: headings, enableSectionCheck: true })
      : '<pre>' + escapeHtml(chData.markdown) + '</pre>';

    containerEl.innerHTML =
      '<div class="reader-layout' + (focusMode ? ' focus-mode' : '') + '" id="reader-layout">' +
        '<aside class="reader-sidebar-left">' +
          '<div class="card reader-nav-card">' + sidebarTreeHtml + '</div>' +
        '</aside>' +
        '<article class="card reader-article-card">' +
          '<div class="reader-toolbar">' +
            '<div class="reader-toolbar-meta">' +
              '<span class="badge badge-blue">' + escapeHtml(chMeta.shortTitle || chMeta.id) + '</span>' +
              (chMeta.difficulty ? '<span class="badge badge-amber">难度 ' + escapeHtml(chMeta.difficulty) + '</span>' : '') +
              (chMeta.estDays ? '<span class="badge">⏱ ' + escapeHtml(chMeta.estDays) + '</span>' : '') +
              '<span class="badge badge-green" id="reader-chap-pct-badge">掌握度 ' + chapPct + '%</span>' +
            '</div>' +
            '<div class="reader-toolbar-controls">' +
              '<button type="button" class="btn btn-sm" id="btn-font-dec" title="缩小字号">A-</button>' +
              '<button type="button" class="btn btn-sm" id="btn-font-inc" title="放大字号">A+</button>' +
              '<button type="button" class="btn btn-sm' + (focusMode ? ' btn-soft' : '') + '" id="btn-focus-mode">' + (focusMode ? '📐 退出专注' : '🧘 专注阅读') + '</button>' +
              '<button type="button" class="btn btn-sm' + (isChapBm ? ' btn-soft' : '') + '" id="btn-bm-chapter">' + (isChapBm ? '⭐ 已收藏' : '⭐ 收藏') + '</button>' +
            '</div>' +
          '</div>' +
          '<div class="md-body" id="reader-md-body" style="--reader-font-size:' + currentFontSize + 'px">' +
            articleHtml +
          '</div>' +
          prevNextHtml +
        '</article>' +
        '<aside class="reader-sidebar-right">' +
          '<div class="card reader-toc-card">' +
            '<h4 class="sidebar-card-title">📑 本节大纲 <span style="font-size:11px;color:var(--text-muted);font-weight:500;">' + headings.length + ' 节</span></h4>' +
            '<ul class="toc-list" id="reader-toc-list">' + tocHtml + '</ul>' +
          '</div>' +
          (linkedBtns.length
            ? '<div class="card reader-link-card"><h4 class="sidebar-card-title">🚀 本章联动实战</h4><div class="reader-quick-links">' + linkedBtns.join('') + '</div></div>'
            : '') +
          '<div class="card reader-note-card">' +
            '<h4 class="sidebar-card-title">📝 本章个人笔记 <span class="note-status" id="reader-note-status"></span></h4>' +
            '<textarea id="reader-note-input" class="reader-note-textarea" placeholder="随手记下你的理解、易错点或面试口诀，自动保存到本地…">' + escapeHtml(savedNote) + '</textarea>' +
          '</div>' +
        '</aside>' +
      '</div>';

    var mdBodyEl = containerEl.querySelector('#reader-md-body');
    var layoutEl = containerEl.querySelector('#reader-layout');

    // 绑定正文交互
    bindMarkdownInteractions(mdBodyEl, {
      onProgressChange: function (cid, slug, isDone) {
        var newPct = getChapterPct(cid);
        var pctBadge = containerEl.querySelector('#reader-chap-pct-badge');
        if (pctBadge) pctBadge.textContent = '掌握度 ' + newPct + '%';
        var treePct = containerEl.querySelector('[data-tree-pct="' + cid + '"]');
        if (treePct) treePct.textContent = newPct >= 100 ? '✅' : (newPct + '%');
        var tocItem = containerEl.querySelector('[data-toc-slug="' + slug + '"]');
        if (tocItem) tocItem.classList.toggle('done', isDone);
      }
    });

    // 左侧章节切换 & 上下章切换
    containerEl.querySelectorAll('[data-chap-id]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var targetId = btn.getAttribute('data-chap-id');
        if (global.DSApp && typeof global.DSApp.navigate === 'function') {
          global.DSApp.navigate('reader', { chapterId: targetId });
        } else {
          mount(containerEl, { chapterId: targetId });
        }
      });
    });

    // 字号调节 & 专注模式 & 收藏本章
    var btnDec = containerEl.querySelector('#btn-font-dec');
    var btnInc = containerEl.querySelector('#btn-font-inc');
    var btnFocus = containerEl.querySelector('#btn-focus-mode');
    var btnBmChap = containerEl.querySelector('#btn-bm-chapter');

    function applyFont(sz) {
      currentFontSize = Math.max(13, Math.min(21, sz));
      localStorage.setItem('ds_reader_font', String(currentFontSize));
      if (mdBodyEl) mdBodyEl.style.setProperty('--reader-font-size', currentFontSize + 'px');
    }
    if (btnDec) btnDec.addEventListener('click', function () { applyFont(currentFontSize - 1); });
    if (btnInc) btnInc.addEventListener('click', function () { applyFont(currentFontSize + 1); });
    if (btnFocus) {
      btnFocus.addEventListener('click', function () {
        focusMode = !focusMode;
        layoutEl.classList.toggle('focus-mode', focusMode);
        btnFocus.classList.toggle('btn-soft', focusMode);
        btnFocus.textContent = focusMode ? '📐 退出专注' : '🧘 专注阅读';
      });
    }
    if (btnBmChap) {
      btnBmChap.addEventListener('click', function () {
        if (gamify && typeof gamify.toggleBookmark === 'function') {
          var now = gamify.toggleBookmark('chapter:' + chapterId, chMeta.title || chapterId);
          btnBmChap.classList.toggle('btn-soft', !!now);
          btnBmChap.textContent = now ? '⭐ 已收藏' : '⭐ 收藏';
        }
      });
    }

    // 右侧 TOC 点击滚动
    containerEl.querySelectorAll('[data-scroll-to]').forEach(function (a) {
      a.addEventListener('click', function (ev) {
        ev.preventDefault();
        scrollToAnchor(mdBodyEl, a.getAttribute('data-scroll-to'));
      });
    });

    // 右侧联动按钮
    containerEl.querySelectorAll('[data-jump-viz]').forEach(function (b) {
      b.addEventListener('click', function () {
        global.DSApp.navigate('viz', { tab: b.getAttribute('data-jump-viz') });
      });
    });
    containerEl.querySelectorAll('[data-jump-lab]').forEach(function (b) {
      b.addEventListener('click', function () {
        global.DSApp.navigate('lab', { mode: 'labs', labId: b.getAttribute('data-jump-lab') });
      });
    });
    containerEl.querySelectorAll('[data-jump-quiz]').forEach(function (b) {
      b.addEventListener('click', function () {
        global.DSApp.navigate('quiz', { mode: 'quiz', chapterId: b.getAttribute('data-jump-quiz') });
      });
    });
    containerEl.querySelectorAll('[data-jump-bug]').forEach(function (b) {
      b.addEventListener('click', function () {
        global.DSApp.navigate('quiz', { mode: 'bug', chapterId: b.getAttribute('data-jump-bug') });
      });
    });

    // 个人笔记自动防抖保存
    var noteInput = containerEl.querySelector('#reader-note-input');
    var noteStatus = containerEl.querySelector('#reader-note-status');
    var noteTimer = null;
    if (noteInput) {
      noteInput.addEventListener('input', function () {
        if (noteStatus) noteStatus.textContent = '保存中…';
        clearTimeout(noteTimer);
        noteTimer = setTimeout(function () {
          if (gamify && typeof gamify.saveNote === 'function') {
            gamify.saveNote(chapterId, noteInput.value);
          }
          if (noteStatus) noteStatus.textContent = '✓ 已自动保存';
        }, 380);
      });
    }

    // 右侧 TOC 滚动高亮 (Scroll-spy)
    var tocLinks = Array.prototype.slice.call(containerEl.querySelectorAll('#reader-toc-list a'));
    var headingEls = headings.map(function (h) { return document.getElementById(h.slug); }).filter(Boolean);

    function onScrollSpy() {
      if (!headingEls.length) return;
      var scrollTop = window.scrollY + 110;
      var activeSlug = headingEls[0].id;
      for (var i = 0; i < headingEls.length; i++) {
        if (headingEls[i].offsetTop <= scrollTop) {
          activeSlug = headingEls[i].id;
        } else {
          break;
        }
      }
      tocLinks.forEach(function (a) {
        a.classList.toggle('active', a.getAttribute('data-scroll-to') === activeSlug);
      });
    }
    window.addEventListener('scroll', onScrollSpy, { passive: true });
    onScrollSpy();

    // 若携带锚点或搜索词，定位并短暂高亮
    if (opts.anchor) {
      setTimeout(function () { scrollToAnchor(mdBodyEl, opts.anchor); }, 60);
    } else if (opts.searchQuery) {
      setTimeout(function () { highlightFirstMatch(mdBodyEl, opts.searchQuery); }, 60);
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    activeCleanup = function () {
      window.removeEventListener('scroll', onScrollSpy);
      clearTimeout(noteTimer);
    };
  }

  function highlightFirstMatch(rootEl, query) {
    if (!rootEl || !query) return;
    var needle = query.trim().toLowerCase();
    if (!needle) return;
    var els = rootEl.querySelectorAll('h2, h3, p, li, td');
    for (var i = 0; i < els.length; i++) {
      if ((els[i].textContent || '').toLowerCase().indexOf(needle) !== -1) {
        els[i].scrollIntoView({ behavior: 'smooth', block: 'center' });
        els[i].style.outline = '2px solid var(--amber)';
        els[i].style.borderRadius = '6px';
        (function (el) {
          setTimeout(function () { el.style.outline = ''; }, 2400);
        })(els[i]);
        break;
      }
    }
  }

  global.DSReaderView = {
    mount: mount,
    unmount: unmount,
    bindMarkdownInteractions: bindMarkdownInteractions,
    resolveInternalLink: resolveInternalLink,
    scrollToAnchor: scrollToAnchor
  };
})(window);

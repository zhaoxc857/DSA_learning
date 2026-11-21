// 《数据结构与算法》互动刷题、找 Bug 大侦探、3D 翻转闪卡与错题本视图
// 暴露全局对象 window.DSQuizView = { mount(containerEl, initialMode, filterChapterId) }
(function (global) {
  "use strict";

  var CHAPTER_LABELS = {
    "all": "全部章节",
    "00": "第0章 C/C++基础",
    "01": "第1章 绪论",
    "02": "第2章 线性表",
    "03": "第3章 栈队串",
    "04": "第4章 树",
    "05": "第5章 图",
    "06": "第6章 查找",
    "07": "第7章 排序",
    "appA": "附录A 异常",
    "appB": "附录B 模板"
  };

  var CHAPTER_ORDER = ["00", "01", "02", "03", "04", "05", "06", "07", "appA", "appB"];
  var BUG_CHAPTERS = ["00", "01", "02", "03", "04", "05", "06", "07"];

  var stylesInjected = false;
  function ensureStyles() {
    if (stylesInjected || typeof document === "undefined") return;
    stylesInjected = true;
    var style = document.createElement("style");
    style.id = "ds-quiz-view-styles";
    style.textContent = [
      ".dq-wrap{max-width:1120px;margin:0 auto;padding:8px 4px 36px;color:var(--text-main,#1e293b);}",
      ".dq-tabs{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:18px;padding:6px;background:var(--bg-card,#ffffff);border:1px solid var(--border,#e2e8f0);border-radius:14px;box-shadow:0 2px 10px rgba(15,23,42,.04);}",
      ".dq-tab{flex:1;min-width:150px;display:flex;align-items:center;justify-content:center;gap:8px;padding:11px 14px;border:none;border-radius:10px;background:transparent;color:var(--text-muted,#64748b);font-size:14px;font-weight:600;cursor:pointer;transition:all .18s ease;}",
      ".dq-tab:hover{color:var(--text-main,#1e293b);background:var(--bg-subtle,rgba(37,99,235,.06));}",
      ".dq-tab.active{background:var(--accent,#2563eb);color:#ffffff;box-shadow:0 4px 14px rgba(37,99,235,.28);}",
      ".dq-badge{display:inline-flex;align-items:center;justify-content:center;min-width:20px;height:20px;padding:0 6px;border-radius:999px;font-size:12px;font-weight:700;background:rgba(255,255,255,.22);color:inherit;}",
      ".dq-tab:not(.active) .dq-badge{background:rgba(239,68,68,.12);color:#ef4444;}",
      ".dq-toolbar{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin-bottom:16px;padding:12px 14px;background:var(--bg-card,#ffffff);border:1px solid var(--border,#e2e8f0);border-radius:12px;}",
      ".dq-select,.dq-btn{padding:8px 14px;border-radius:9px;font-size:13px;font-weight:600;border:1px solid var(--border,#cbd5e1);background:var(--bg-card,#ffffff);color:var(--text-main,#1e293b);cursor:pointer;transition:all .16s ease;}",
      ".dq-btn:hover{border-color:var(--accent,#2563eb);color:var(--accent,#2563eb);}",
      ".dq-btn-primary{background:var(--accent,#2563eb);color:#ffffff;border-color:var(--accent,#2563eb);}",
      ".dq-btn-primary:hover{filter:brightness(1.08);color:#ffffff;}",
      ".dq-btn-success{background:#10b981;color:#ffffff;border-color:#10b981;}",
      ".dq-btn-success:hover{filter:brightness(1.06);color:#ffffff;}",
      ".dq-btn-warn{background:linear-gradient(135deg,#f59e0b,#ef4444);color:#ffffff;border:none;}",
      ".dq-btn-warn:hover{filter:brightness(1.06);color:#ffffff;}",
      ".dq-pill-row{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px;}",
      ".dq-pill{padding:6px 12px;border-radius:999px;font-size:12px;font-weight:600;border:1px solid var(--border,#cbd5e1);background:var(--bg-card,#ffffff);color:var(--text-muted,#64748b);cursor:pointer;transition:all .15s;}",
      ".dq-pill.active{background:var(--accent,#2563eb);color:#ffffff;border-color:var(--accent,#2563eb);}",
      ".dq-hud{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px;padding:10px 16px;border-radius:12px;background:var(--bg-card,#ffffff);border:1px solid var(--border,#e2e8f0);}",
      ".dq-hud-group{display:flex;align-items:center;gap:14px;flex-wrap:wrap;font-size:13px;font-weight:600;}",
      ".dq-combo{display:inline-flex;align-items:center;gap:4px;padding:4px 11px;border-radius:999px;background:linear-gradient(135deg,#f97316,#ef4444);color:#fff;font-size:13px;font-weight:700;animation:dqPulse 1.1s ease-in-out infinite;}",
      "@keyframes dqPulse{0%,100%{transform:scale(1);}50%{transform:scale(1.06);}}",
      "@keyframes dqShake{0%,100%{transform:translateX(0);}25%{transform:translateX(-6px);}75%{transform:translateX(6px);}}",
      ".dq-shake{animation:dqShake .32s ease;}",
      ".dq-timer{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:8px;background:rgba(239,68,68,.12);color:#ef4444;font-variant-numeric:tabular-nums;font-weight:700;}",
      ".dq-card{background:var(--bg-card,#ffffff);border:1px solid var(--border,#e2e8f0);border-radius:16px;padding:22px 24px;box-shadow:0 4px 18px rgba(15,23,42,.05);margin-bottom:16px;}",
      ".dq-q-meta{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:12px;font-size:12px;}",
      ".dq-tag{padding:3px 9px;border-radius:999px;background:rgba(37,99,235,.12);color:var(--accent,#2563eb);font-weight:600;}",
      ".dq-diff{color:#f59e0b;font-weight:700;letter-spacing:1px;}",
      ".dq-prompt{font-size:16px;line-height:1.68;font-weight:600;margin:0 0 14px;color:var(--text-main,#1e293b);}",
      ".dq-code{background:#0f172a;color:#e2e8f0;padding:14px 16px;border-radius:10px;font-family:Consolas,'Fira Code',monospace;font-size:13.5px;line-height:1.6;overflow-x:auto;margin:0 0 16px;white-space:pre;}",
      ".dq-kw{color:#c084fc;font-weight:600;}.dq-ty{color:#38bdf8;}.dq-cm{color:#64748b;font-style:italic;}.dq-st{color:#86efac;}.dq-nm{color:#fbbf24;}",
      ".dq-options{display:flex;flex-direction:column;gap:10px;}",
      ".dq-opt{text-align:left;padding:13px 16px;border-radius:11px;border:1.5px solid var(--border,#cbd5e1);background:var(--bg-card,#ffffff);color:var(--text-main,#1e293b);font-size:14.5px;line-height:1.5;cursor:pointer;transition:all .16s ease;display:flex;align-items:flex-start;gap:10px;}",
      ".dq-opt:hover:not(:disabled){border-color:var(--accent,#2563eb);background:rgba(37,99,235,.05);transform:translateX(2px);}",
      ".dq-opt:disabled{cursor:default;}",
      ".dq-opt.correct{border-color:#10b981;background:rgba(16,185,129,.12);color:var(--text-main,#065f46);font-weight:600;}",
      ".dq-opt.wrong{border-color:#ef4444;background:rgba(239,68,68,.11);color:var(--text-main,#991b1b);}",
      ".dq-explain{margin-top:16px;padding:14px 16px;border-radius:12px;border-left:4px solid #10b981;background:rgba(16,185,129,.08);font-size:14px;line-height:1.68;color:var(--text-main,#1e293b);}",
      ".dq-explain.is-wrong{border-left-color:#ef4444;background:rgba(239,68,68,.07);}",
      ".dq-actions{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-top:16px;}",
      ".dq-prog-bar{height:8px;border-radius:999px;background:var(--border,#e2e8f0);overflow:hidden;margin:10px 0 16px;}",
      ".dq-prog-fill{height:100%;border-radius:999px;background:linear-gradient(90deg,#2563eb,#10b981);transition:width .3s ease;}",
      /* Bug Detective */
      ".dq-bug-grid{display:grid;grid-template-columns:1.12fr 1fr;gap:18px;align-items:start;}",
      "@media (max-width:860px){.dq-bug-grid{grid-template-columns:1fr;}}",
      ".dq-bug-codebox{background:#0f172a;border-radius:14px;padding:12px 0;overflow:hidden;border:1px solid rgba(148,163,184,.2);box-shadow:0 8px 24px rgba(15,23,42,.18);}",
      ".dq-bug-banner{padding:8px 16px 10px;font-size:13px;font-weight:600;color:#93c5fd;border-bottom:1px solid rgba(148,163,184,.16);display:flex;justify-content:space-between;align-items:center;}",
      ".dq-code-line{display:flex;align-items:flex-start;padding:6px 14px;font-family:Consolas,'Fira Code',monospace;font-size:13.5px;line-height:1.58;color:#e2e8f0;cursor:pointer;border-left:3px solid transparent;transition:background .14s,border-color .14s;}",
      ".dq-code-line:hover{background:rgba(59,130,246,.16);border-left-color:#60a5fa;}",
      ".dq-code-line.hit{background:rgba(16,185,129,.22);border-left-color:#10b981;}",
      ".dq-code-line.miss{background:rgba(239,68,68,.20);border-left-color:#ef4444;}",
      ".dq-lineno{width:30px;flex-shrink:0;color:#64748b;user-select:none;text-align:right;margin-right:14px;}",
      ".dq-linetxt{white-space:pre-wrap;word-break:break-word;flex:1;}",
      ".dq-step-badge{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:8px;font-size:12px;font-weight:700;margin-bottom:10px;background:rgba(37,99,235,.12);color:var(--accent,#2563eb);}",
      ".dq-step-badge.done{background:rgba(16,185,129,.15);color:#10b981;}",
      ".dq-fix-box{margin-top:12px;background:#0f172a;color:#86efac;padding:12px 14px;border-radius:10px;font-family:Consolas,'Fira Code',monospace;font-size:13px;line-height:1.58;white-space:pre-wrap;border:1px solid rgba(16,185,129,.35);}",
      /* 3D Flashcards */
      ".dq-fc-stage{perspective:1200px;max-width:740px;margin:14px auto 18px;}",
      ".dq-fc-card{position:relative;width:100%;min-height:290px;transform-style:preserve-3d;transition:transform .58s cubic-bezier(.22,1,.36,1);cursor:pointer;}",
      ".dq-fc-card.flipped{transform:rotateY(180deg);}",
      ".dq-fc-face{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;border-radius:20px;padding:28px 30px;display:flex;flex-direction:column;justify-content:space-between;border:1.5px solid var(--border,#e2e8f0);box-shadow:0 12px 32px rgba(15,23,42,.09);background:var(--bg-card,#ffffff);color:var(--text-main,#1e293b);}",
      ".dq-fc-back{transform:rotateY(180deg);background:linear-gradient(155deg,var(--bg-card,#ffffff),rgba(16,185,129,.07));border-color:rgba(16,185,129,.45);}",
      ".dq-fc-body{font-size:18px;line-height:1.72;font-weight:600;margin:18px 0;text-align:center;}",
      ".dq-fc-back .dq-fc-body{font-size:15.5px;font-weight:500;text-align:left;}",
      ".dq-fc-body code{padding:2px 6px;border-radius:5px;background:rgba(37,99,235,.12);color:var(--accent,#2563eb);font-family:Consolas,monospace;font-size:.92em;}",
      ".dq-fc-hint{text-align:center;font-size:12px;color:var(--text-muted,#64748b);}",
      ".dq-fc-controls{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;max-width:740px;margin:0 auto;}",
      /* Empty & Summary */
      ".dq-empty{text-align:center;padding:48px 24px;background:var(--bg-card,#ffffff);border:1px dashed var(--border,#cbd5e1);border-radius:16px;}",
      ".dq-empty-icon{font-size:48px;margin-bottom:10px;}"
    ].join("");
    (document.head || document.documentElement).appendChild(style);
  }

  function escHtml(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function highlightCpp(raw) {
    var s = escHtml(raw);
    // 保护注释和字符串
    var placeholders = [];
    s = s.replace(/(\/\/[^\n]*|&quot;(?:\\.|[^&]|&(?!quot;))*&quot;|'(?:\\.|[^'\\])*')/g, function (m) {
      var cls = m.indexOf("//") === 0 ? "dq-cm" : "dq-st";
      var idx = placeholders.length;
      placeholders.push('<span class="' + cls + '">' + m + "</span>");
      return "\u0001" + idx + "\u0002";
    });
    s = s.replace(/\b(void|int|char|bool|double|float|long|unsigned|const|struct|class|template|typename|return|if|else|for|while|do|break|continue|new|delete|nullptr|true|false|try|catch|throw|public|protected|private|using|namespace|sizeof)\b/g, '<span class="dq-kw">$1</span>');
    s = s.replace(/\b(string|vector|stack|queue|Node|LNode|DNode|BiNode|BSTNode|CirQueue|Box|SeqList|cout|endl)\b/g, '<span class="dq-ty">$1</span>');
    s = s.replace(/\b(\d+)\b/g, '<span class="dq-nm">$1</span>');
    s = s.replace(/\u0001(\d+)\u0002/g, function (_, idx) {
      return placeholders[Number(idx)] || "";
    });
    return s;
  }

  function shuffle(arr) {
    var copy = arr.slice();
    for (var i = copy.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  function diffStars(d) {
    var n = Math.max(1, Math.min(3, Number(d) || 1));
    return "★".repeat(n) + "☆".repeat(3 - n);
  }

  function normalizeMode(m) {
    if (!m) return "quiz";
    var k = String(m).toLowerCase();
    if (k === "bug" || k === "bugs" || k === "clinic") return "bug";
    if (k === "card" || k === "cards" || k === "flashcard" || k === "flashcards") return "cards";
    if (k === "wrong" || k === "wrongbook" || k === "mistakes") return "wrong";
    if (k === "challenge") return "challenge";
    return "quiz";
  }

  function formatTime(sec) {
    var s = Math.max(0, sec);
    var m = Math.floor(s / 60);
    var r = s % 60;
    return String(m).padStart(2, "0") + ":" + String(r).padStart(2, "0");
  }

  // 安全调用 DSGamify（防未加载时报错）
  function G() {
    return global.DSGamify || {
      getState: function () { return { combo: 0, wrongIds: [], solvedBugs: [], masteredCards: [], correctIds: [] }; },
      recordQuizResult: function (_, ok) { return { isCorrect: ok, combo: 0, xpGained: 0 }; },
      getWrongIds: function () { return []; },
      markWrongResolved: function () { return true; },
      recordBugSolved: function () { return { newlySolved: false, xpGained: 0 }; },
      toggleCardMastered: function () { return false; },
      toast: function () {},
      celebrate: function () {}
    };
  }

  // 记录上一次清理句柄，避免重复挂载导致定时器或键盘事件泄漏
  var activeCleanup = null;

  function mount(containerEl, initialMode, filterChapterId) {
    if (!containerEl) return;
    ensureStyles();

    if (typeof activeCleanup === "function") {
      activeCleanup();
      activeCleanup = null;
    }

    var db = global.DS_QUIZZES || { questions: [], bugCases: [], flashcards: [] };
    var allQuestions = db.questions || [];
    var allBugs = db.bugCases || [];
    var allCards = db.flashcards || [];

    var reqMode = normalizeMode(initialMode);
    var initChapter = filterChapterId && CHAPTER_LABELS[filterChapterId] ? filterChapterId : "all";

    var ui = {
      mode: reqMode === "challenge" ? "quiz" : reqMode,
      chapter: initChapter,
      difficulty: 0, // 0 = 全部
      // Quiz state
      quizList: [],
      quizIdx: 0,
      selectedOpt: null,
      lastResult: null,
      challengeActive: false,
      challengeSeconds: 300,
      challengeCorrect: 0,
      challengeXP: 0,
      challengeFinished: false,
      timerId: null,
      // Bug Detective state
      bugChapter: BUG_CHAPTERS.indexOf(initChapter) !== -1 ? initChapter : "all",
      bugIdx: 0,
      bugLineHit: false,
      bugMissedLines: [],
      bugMissCount: 0,
      bugSelectedChoice: null,
      bugShowHint: false,
      // Flashcards state
      cardChapter: initChapter,
      cardCategory: "all",
      cardOnlyUnmastered: false,
      cardList: [],
      cardIdx: 0,
      cardFlipped: false,
      // Wrong book state
      wrongChapter: "all",
      wrongAnswers: {} // qid -> { selected, isCorrect }
    };

    function stopTimer() {
      if (ui.timerId) {
        clearInterval(ui.timerId);
        ui.timerId = null;
      }
    }

    function rebuildQuizList(keepShuffle) {
      var list = allQuestions.filter(function (q) {
        var chOk = ui.chapter === "all" || q.chapterId === ui.chapter;
        var dfOk = ui.difficulty === 0 || q.difficulty === ui.difficulty;
        return chOk && dfOk;
      });
      ui.quizList = keepShuffle ? shuffle(list) : list;
      ui.quizIdx = 0;
      ui.selectedOpt = null;
      ui.lastResult = null;
    }

    function startChallenge() {
      stopTimer();
      var pool = allQuestions.filter(function (q) {
        return ui.chapter === "all" || q.chapterId === ui.chapter;
      });
      if (pool.length === 0) pool = allQuestions.slice();
      ui.quizList = shuffle(pool).slice(0, Math.min(10, pool.length));
      ui.quizIdx = 0;
      ui.selectedOpt = null;
      ui.lastResult = null;
      ui.challengeActive = true;
      ui.challengeFinished = false;
      ui.challengeSeconds = 300;
      ui.challengeCorrect = 0;
      ui.challengeXP = 0;
      ui.timerId = setInterval(function () {
        if (!document.body.contains(containerEl)) {
          stopTimer();
          return;
        }
        ui.challengeSeconds -= 1;
        var timerEl = containerEl.querySelector("[data-dq-timer]");
        if (timerEl) timerEl.textContent = "⏱️ " + formatTime(ui.challengeSeconds);
        if (ui.challengeSeconds <= 0) {
          stopTimer();
          ui.challengeFinished = true;
          render();
        }
      }, 1000);
      render();
    }

    function getFilteredBugs() {
      return allBugs.filter(function (b) {
        return ui.bugChapter === "all" || b.chapterId === ui.bugChapter;
      });
    }

    function resetBugProgress() {
      ui.bugLineHit = false;
      ui.bugMissedLines = [];
      ui.bugMissCount = 0;
      ui.bugSelectedChoice = null;
      ui.bugShowHint = false;
    }

    function rebuildCardList(doShuffle) {
      var mastered = G().getState().masteredCards || [];
      var list = allCards.filter(function (c) {
        var chOk = ui.cardChapter === "all" || c.chapterId === ui.cardChapter;
        var catOk = ui.cardCategory === "all" || c.category === ui.cardCategory;
        var mOk = !ui.cardOnlyUnmastered || mastered.indexOf(c.id) === -1;
        return chOk && catOk && mOk;
      });
      ui.cardList = doShuffle ? shuffle(list) : list;
      ui.cardIdx = 0;
      ui.cardFlipped = false;
    }

    // 键盘快捷键（闪卡模式：空格翻转、左右切换）
    function onKeyDown(e) {
      if (!document.body.contains(containerEl)) {
        cleanup();
        return;
      }
      var tag = (e.target && e.target.tagName) ? e.target.tagName.toUpperCase() : "";
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (ui.mode === "cards" && ui.cardList.length > 0) {
        if (e.code === "Space") {
          e.preventDefault();
          ui.cardFlipped = !ui.cardFlipped;
          var cardEl = containerEl.querySelector(".dq-fc-card");
          if (cardEl) cardEl.classList.toggle("flipped", ui.cardFlipped);
        } else if (e.code === "ArrowRight") {
          ui.cardIdx = (ui.cardIdx + 1) % ui.cardList.length;
          ui.cardFlipped = false;
          render();
        } else if (e.code === "ArrowLeft") {
          ui.cardIdx = (ui.cardIdx - 1 + ui.cardList.length) % ui.cardList.length;
          ui.cardFlipped = false;
          render();
        }
      }
    }

    function cleanup() {
      stopTimer();
      if (typeof window !== "undefined") {
        window.removeEventListener("keydown", onKeyDown);
      }
    }
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", onKeyDown);
    }
    activeCleanup = cleanup;

    // 初始化列表
    if (reqMode === "challenge") {
      startChallenge();
    } else {
      rebuildQuizList(false);
    }
    rebuildCardList(false);

    // ==================== 渲染函数 ====================
    function renderTabs() {
      var st = G().getState();
      var wrongCnt = (st.wrongIds || []).length;
      var solvedBugCnt = (st.solvedBugs || []).length;
      var tabs = [
        { id: "quiz",  label: "🎯 章节刷题 / 10题挑战", badge: allQuestions.length + "题" },
        { id: "bug",   label: "🩺 找 Bug 大侦探",       badge: solvedBugCnt + "/" + allBugs.length },
        { id: "cards", label: "🃏 3D 翻转闪卡",         badge: (st.masteredCards || []).length + "/" + allCards.length },
        { id: "wrong", label: "📕 我的错题本",           badge: wrongCnt > 0 ? String(wrongCnt) : "0" }
      ];
      return '<div class="dq-tabs">' + tabs.map(function (t) {
        return '<button class="dq-tab ' + (ui.mode === t.id ? "active" : "") + '" data-tab="' + t.id + '">' +
          '<span>' + t.label + '</span>' +
          '<span class="dq-badge">' + t.badge + '</span>' +
        '</button>';
      }).join("") + '</div>';
    }

    function renderQuizMode() {
      var st = G().getState();
      var chapterOpts = '<option value="all">全部章节（' + allQuestions.length + ' 题）</option>' +
        CHAPTER_ORDER.map(function (cid) {
          var cnt = allQuestions.filter(function (q) { return q.chapterId === cid; }).length;
          return '<option value="' + cid + '"' + (ui.chapter === cid ? " selected" : "") + '>' +
            CHAPTER_LABELS[cid] + '（' + cnt + ' 题）</option>';
        }).join("");

      var html = '<div class="dq-toolbar">' +
        '<label style="font-size:13px;font-weight:600;">章节筛选：</label>' +
        '<select class="dq-select" data-q-chapter>' + chapterOpts + '</select>' +
        '<select class="dq-select" data-q-diff>' +
          '<option value="0"' + (ui.difficulty === 0 ? " selected" : "") + '>全部难度</option>' +
          '<option value="1"' + (ui.difficulty === 1 ? " selected" : "") + '>★☆☆ 基础巩固</option>' +
          '<option value="2"' + (ui.difficulty === 2 ? " selected" : "") + '>★★☆ 期末高频</option>' +
          '<option value="3"' + (ui.difficulty === 3 ? " selected" : "") + '>★★★ 硬核进阶</option>' +
        '</select>' +
        '<button class="dq-btn" data-q-shuffle>🔀 随机打乱</button>' +
        (ui.challengeActive
          ? '<button class="dq-btn" data-q-exit-challenge>退出挑战模式</button>'
          : '<button class="dq-btn dq-btn-warn" data-q-challenge>⚡ 限时 10 题挑战</button>') +
      '</div>';

      // 挑战模式结束结算卡
      if (ui.challengeActive && ui.challengeFinished) {
        var total = ui.quizList.length || 1;
        var acc = Math.round((ui.challengeCorrect / total) * 100);
        var comment = acc >= 90 ? "太强了！堪称教材活字典 🏆" : (acc >= 70 ? "表现很棒，再刷一轮冲击满分！🔥" : "错题已自动收进错题本，去复盘一下马上起飞 💪");
        html += '<div class="dq-card" style="text-align:center;padding:34px 24px;">' +
          '<div style="font-size:52px;margin-bottom:8px;">' + (acc >= 80 ? "🏆" : "🎯") + '</div>' +
          '<h2 style="margin:0 0 8px;">10 题挑战成绩单</h2>' +
          '<p style="color:var(--text-muted,#64748b);margin:0 0 18px;">' + comment + '</p>' +
          '<div style="display:flex;justify-content:center;gap:26px;flex-wrap:wrap;margin-bottom:22px;">' +
            '<div><div style="font-size:28px;font-weight:800;color:#10b981;">' + ui.challengeCorrect + ' / ' + total + '</div><div style="font-size:12px;color:var(--text-muted,#64748b);">答对题数</div></div>' +
            '<div><div style="font-size:28px;font-weight:800;color:#2563eb;">' + acc + '%</div><div style="font-size:12px;color:var(--text-muted,#64748b);">正确率</div></div>' +
            '<div><div style="font-size:28px;font-weight:800;color:#f59e0b;">+' + ui.challengeXP + ' XP</div><div style="font-size:12px;color:var(--text-muted,#64748b);">本轮经验</div></div>' +
          '</div>' +
          '<div style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap;">' +
            '<button class="dq-btn dq-btn-warn" data-q-challenge>⚡ 再战一轮 10 题</button>' +
            '<button class="dq-btn dq-btn-primary" data-tab="wrong">📕 查看错题本</button>' +
            '<button class="dq-btn" data-q-exit-challenge>返回自由刷题</button>' +
          '</div>' +
        '</div>';
        return html;
      }

      if (ui.quizList.length === 0) {
        return html + '<div class="dq-empty"><div class="dq-empty-icon">🔎</div><h3>当前筛选条件下暂无题目</h3><p>试试切换其他章节或难度～</p></div>';
      }

      var q = ui.quizList[ui.quizIdx];
      var pct = Math.round(((ui.quizIdx + 1) / ui.quizList.length) * 100);
      var comboHtml = st.combo >= 2
        ? '<span class="dq-combo">🔥 ' + st.combo + ' 连击！</span>'
        : '<span style="color:var(--text-muted,#64748b);">当前连击：' + st.combo + '</span>';

      html += '<div class="dq-hud">' +
        '<div class="dq-hud-group">' +
          '<span>' + (ui.challengeActive ? "⚡ 限时挑战" : "📝 自由刷题") + '：第 <strong>' + (ui.quizIdx + 1) + '</strong> / ' + ui.quizList.length + ' 题</span>' +
          '<span>已攻克全库：<strong>' + (st.correctIds || []).length + '</strong> / ' + allQuestions.length + '</span>' +
        '</div>' +
        '<div class="dq-hud-group">' +
          comboHtml +
          (ui.challengeActive ? '<span class="dq-timer" data-dq-timer>⏱️ ' + formatTime(ui.challengeSeconds) + '</span>' : '') +
        '</div>' +
      '</div>';

      html += '<div class="dq-prog-bar"><div class="dq-prog-fill" style="width:' + pct + '%;"></div></div>';

      var answered = ui.selectedOpt !== null;
      html += '<div class="dq-card">' +
        '<div class="dq-q-meta">' +
          '<span class="dq-tag">' + (CHAPTER_LABELS[q.chapterId] || q.chapterId) + '</span>' +
          '<span class="dq-tag">' + escHtml(q.tag) + '</span>' +
          '<span class="dq-tag">' + (q.type === "judge" ? "判断题" : "单选题") + '</span>' +
          '<span class="dq-diff">' + diffStars(q.difficulty) + '</span>' +
          ((st.correctIds || []).indexOf(q.id) !== -1 ? '<span style="color:#10b981;font-weight:700;">✅ 曾答对</span>' : '') +
        '</div>' +
        '<p class="dq-prompt">' + escHtml(q.prompt) + '</p>' +
        (q.code ? '<pre class="dq-code">' + highlightCpp(q.code) + '</pre>' : '') +
        '<div class="dq-options">' +
          q.options.map(function (opt, idx) {
            var cls = "dq-opt";
            var mark = "";
            if (answered) {
              if (idx === q.answer) { cls += " correct"; mark = "✅ "; }
              else if (idx === ui.selectedOpt) { cls += " wrong"; mark = "❌ "; }
            }
            return '<button class="' + cls + '" data-q-opt="' + idx + '"' + (answered ? " disabled" : "") + '>' +
              '<span>' + mark + escHtml(opt) + '</span>' +
            '</button>';
          }).join("") +
        '</div>';

      if (answered) {
        var ok = ui.selectedOpt === q.answer;
        var xpMsg = ui.lastResult && ui.lastResult.xpGained > 0 ? "（+" + ui.lastResult.xpGained + " XP）" : "";
        html += '<div class="dq-explain ' + (ok ? "" : "is-wrong") + '">' +
          '<div style="font-weight:700;margin-bottom:6px;">' +
            (ok ? "🎉 回答正确！" + xpMsg : "❌ 回答有误（已自动收入 📕 错题本）") +
          '</div>' +
          '<div>' + escHtml(q.explanation) + '</div>' +
        '</div>';
      }

      html += '<div class="dq-actions">' +
        '<div>' +
          (!ui.challengeActive && ui.quizIdx > 0 ? '<button class="dq-btn" data-q-prev>← 上一题</button>' : '') +
        '</div>' +
        '<div style="display:flex;gap:10px;">' +
          (ui.challengeActive
            ? (answered
                ? '<button class="dq-btn dq-btn-primary" data-q-next>' + (ui.quizIdx + 1 >= ui.quizList.length ? "查看成绩单 🏆" : "下一题 →") + '</button>'
                : '<span style="font-size:13px;color:var(--text-muted,#64748b);">请选择一个选项作答</span>')
            : '<button class="dq-btn dq-btn-primary" data-q-next>' + (ui.quizIdx + 1 >= ui.quizList.length ? "回到第 1 题 ↻" : "下一题 →") + '</button>') +
        '</div>' +
      '</div></div>';

      return html;
    }

    function renderBugMode() {
      var st = G().getState();
      var solved = st.solvedBugs || [];
      var list = getFilteredBugs();
      if (ui.bugIdx >= list.length) ui.bugIdx = 0;

      var html = '<div class="dq-pill-row">' +
        '<button class="dq-pill ' + (ui.bugChapter === "all" ? "active" : "") + '" data-bug-ch="all">全部病例 (' + solved.length + '/' + allBugs.length + ')</button>' +
        BUG_CHAPTERS.map(function (cid) {
          var chBugs = allBugs.filter(function (b) { return b.chapterId === cid; });
          var chSolved = chBugs.filter(function (b) { return solved.indexOf(b.id) !== -1; }).length;
          return '<button class="dq-pill ' + (ui.bugChapter === cid ? "active" : "") + '" data-bug-ch="' + cid + '">' +
            '第' + Number(cid) + '章 (' + chSolved + '/' + chBugs.length + ')</button>';
        }).join("") +
      '</div>';

      // 当前列表病例快速切换条
      html += '<div class="dq-pill-row">' + list.map(function (b, idx) {
        var isSolved = solved.indexOf(b.id) !== -1;
        return '<button class="dq-pill ' + (idx === ui.bugIdx ? "active" : "") + '" data-bug-idx="' + idx + '">' +
          (isSolved ? "✅ " : "🩺 ") + '病例 ' + (idx + 1) +
        '</button>';
      }).join("") + '</div>';

      var c = list[ui.bugIdx];
      if (!c) return html + '<div class="dq-empty">暂无病例</div>';

      var alreadySolved = solved.indexOf(c.id) !== -1;
      var step2Done = ui.bugSelectedChoice === c.answerIdx;

      html += '<div class="dq-bug-grid">';

      // 左侧交互式代码面板
      html += '<div class="dq-bug-codebox">' +
        '<div class="dq-bug-banner">' +
          '<span>' + (ui.bugLineHit ? "🎯 已命中病灶：第 " + c.bugLine + " 行！" : "🔍 第 1 步：请点击下方有 Bug 的那一行") + '</span>' +
          '<span style="font-size:12px;color:#94a3b8;">' + c.codeLines.length + ' 行 C++</span>' +
        '</div>' +
        c.codeLines.map(function (line, i) {
          var ln = i + 1;
          var cls = "dq-code-line";
          if (ui.bugLineHit && ln === c.bugLine) cls += " hit";
          else if (ui.bugMissedLines.indexOf(ln) !== -1) cls += " miss";
          return '<div class="' + cls + '" data-bug-line="' + ln + '">' +
            '<span class="dq-lineno">' + ln + '</span>' +
            '<span class="dq-linetxt">' + highlightCpp(line) + '</span>' +
          '</div>';
        }).join("") +
      '</div>';

      // 右侧诊断面板
      html += '<div class="dq-card" style="margin-bottom:0;">' +
        '<div class="dq-q-meta">' +
          '<span class="dq-tag">' + (CHAPTER_LABELS[c.chapterId] || c.chapterId) + '</span>' +
          (alreadySolved ? '<span style="color:#10b981;font-weight:700;">✅ 已治愈</span>' : '<span style="color:#f59e0b;font-weight:700;">🩺 待诊断</span>') +
        '</div>' +
        '<h3 style="margin:0 0 8px;font-size:18px;">' + escHtml(c.title) + '</h3>' +
        '<p style="margin:0 0 16px;font-size:14px;line-height:1.65;color:var(--text-muted,#64748b);">' + escHtml(c.desc) + '</p>';

      if (!ui.bugLineHit) {
        html += '<div class="dq-step-badge">🔍 第 1 步：点击左侧代码中的病灶行</div>';
        if (ui.bugMissCount > 0) {
          var lastMiss = ui.bugMissedLines[ui.bugMissedLines.length - 1];
          html += '<div class="dq-explain is-wrong" style="margin-top:6px;margin-bottom:12px;">' +
            '第 <strong>' + lastMiss + '</strong> 行不是核心 Bug 哦～ 再重点检查指针修改、边界判断、循环推进或释放顺序！（已尝试 ' + ui.bugMissCount + ' 次）' +
          '</div>';
        }
        if (ui.bugShowHint) {
          var lo = Math.max(1, c.bugLine - 1);
          var hi = Math.min(c.codeLines.length, c.bugLine + 1);
          html += '<div class="dq-explain" style="margin-top:6px;margin-bottom:12px;">💡 <strong>排雷提示</strong>：病灶就藏在 <strong>第 ' + lo + ' ～ ' + hi + ' 行</strong> 之间！</div>';
        }
        html += '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px;">' +
          '<button class="dq-btn" data-bug-hint>💡 给我缩小范围提示</button>' +
          '<button class="dq-btn" data-bug-reveal>👀 直接定位病灶行</button>' +
        '</div>';
      } else {
        html += '<div class="dq-step-badge done">✅ 第 1 步完成：精准命中第 ' + c.bugLine + ' 行</div>' +
          '<div style="font-size:14px;font-weight:700;margin-bottom:10px;">🩺 第 2 步：选出根本病因</div>' +
          '<div class="dq-options">' +
            c.choices.map(function (ch, idx) {
              var cls = "dq-opt";
              var mark = "";
              if (ui.bugSelectedChoice !== null) {
                if (step2Done && idx === c.answerIdx) { cls += " correct"; mark = "✅ "; }
                else if (idx === ui.bugSelectedChoice && idx !== c.answerIdx) { cls += " wrong"; mark = "❌ "; }
              }
              return '<button class="' + cls + '" data-bug-choice="' + idx + '"' + (step2Done ? " disabled" : "") + '>' +
                '<span>' + mark + escHtml(ch) + '</span>' +
              '</button>';
            }).join("") +
          '</div>';

        if (ui.bugSelectedChoice !== null && !step2Done) {
          html += '<div class="dq-explain is-wrong" style="margin-top:12px;">病因不太对哦，再结合第 ' + c.bugLine + ' 行代码重选一次！</div>';
        }

        if (step2Done) {
          html += '<div class="dq-explain" style="margin-top:14px;">' +
            '<div style="font-weight:700;margin-bottom:6px;">💊 诊断报告（内存 / 逻辑深度解析）</div>' +
            '<div>' + escHtml(c.explanation) + '</div>' +
            '<div style="font-weight:700;margin-top:10px;">✅ 修复后的关键代码：</div>' +
            '<pre class="dq-fix-box">' + highlightCpp(c.fixCode) + '</pre>' +
          '</div>';
        }
      }

      html += '<div class="dq-actions" style="margin-top:18px;">' +
        '<button class="dq-btn" data-bug-prev>← 上一例</button>' +
        '<button class="dq-btn dq-btn-primary" data-bug-next>下一例病例 →</button>' +
      '</div></div></div>';

      return html;
    }

    function renderCardsMode() {
      var st = G().getState();
      var mastered = st.masteredCards || [];
      var pct = allCards.length > 0 ? Math.round((mastered.length / allCards.length) * 100) : 0;

      var categories = ["all", "面试高频20问", "核心概念", "必背公式", "复杂度与对比"];
      var chapterOpts = '<option value="all">全部章节</option>' +
        CHAPTER_ORDER.map(function (cid) {
          return '<option value="' + cid + '"' + (ui.cardChapter === cid ? " selected" : "") + '>' + CHAPTER_LABELS[cid] + '</option>';
        }).join("");

      var html = '<div class="dq-toolbar">' +
        '<select class="dq-select" data-fc-chapter>' + chapterOpts + '</select>' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap;">' +
          categories.map(function (cat) {
            return '<button class="dq-pill ' + (ui.cardCategory === cat ? "active" : "") + '" data-fc-cat="' + cat + '">' +
              (cat === "all" ? "全部分类" : cat) + '</button>';
          }).join("") +
        '</div>' +
        '<label style="display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:600;cursor:pointer;margin-left:auto;">' +
          '<input type="checkbox" data-fc-unmastered' + (ui.cardOnlyUnmastered ? " checked" : "") + '/> 仅看未掌握' +
        '</label>' +
      '</div>';

      html += '<div class="dq-hud">' +
        '<div class="dq-hud-group"><span>🃏 全库掌握进度：<strong>' + mastered.length + '</strong> / ' + allCards.length + ' 张（' + pct + '%）</span></div>' +
        '<div class="dq-hud-group"><span style="color:var(--text-muted,#64748b);">快捷键：空格翻转 · ←/→ 切卡</span></div>' +
      '</div>' +
      '<div class="dq-prog-bar"><div class="dq-prog-fill" style="width:' + pct + '%;"></div></div>';

      if (ui.cardList.length === 0) {
        return html + '<div class="dq-empty"><div class="dq-empty-icon">🎉</div><h3>当前筛选下的闪卡已全部掌握！</h3><button class="dq-btn dq-btn-primary" data-fc-reset-filter style="margin-top:12px;">查看全部闪卡</button></div>';
      }

      if (ui.cardIdx >= ui.cardList.length) ui.cardIdx = 0;
      var card = ui.cardList[ui.cardIdx];
      var isMastered = mastered.indexOf(card.id) !== -1;

      html += '<div class="dq-fc-stage">' +
        '<div class="dq-fc-card ' + (ui.cardFlipped ? "flipped" : "") + '" data-fc-flip>' +
          '<div class="dq-fc-face dq-fc-front">' +
            '<div class="dq-q-meta" style="justify-content:space-between;width:100%;margin-bottom:0;">' +
              '<div><span class="dq-tag">' + (CHAPTER_LABELS[card.chapterId] || card.chapterId) + '</span> ' +
              '<span class="dq-tag">' + escHtml(card.category) + '</span></div>' +
              '<span style="font-size:13px;font-weight:700;color:' + (isMastered ? "#10b981" : "var(--text-muted,#64748b)") + ';">' +
                (isMastered ? "✅ 已掌握" : "第 " + (ui.cardIdx + 1) + " / " + ui.cardList.length + " 张") +
              '</span>' +
            '</div>' +
            '<div class="dq-fc-body">' + card.front + '</div>' +
            '<div class="dq-fc-hint">👆 点击卡片或按 Space 键翻转查看答案</div>' +
          '</div>' +
          '<div class="dq-fc-face dq-fc-back">' +
            '<div class="dq-q-meta" style="justify-content:space-between;width:100%;margin-bottom:0;">' +
              '<span class="dq-tag" style="background:rgba(16,185,129,.16);color:#10b981;">💡 核心解析与速记</span>' +
              '<span style="font-size:12px;color:var(--text-muted,#64748b);">' + (ui.cardIdx + 1) + ' / ' + ui.cardList.length + '</span>' +
            '</div>' +
            '<div class="dq-fc-body">' + card.back + '</div>' +
            '<div class="dq-fc-hint">👆 点击再次翻回正面</div>' +
          '</div>' +
        '</div>' +
      '</div>';

      html += '<div class="dq-fc-controls">' +
        '<button class="dq-btn" data-fc-prev>◀ 上一张</button>' +
        '<button class="dq-btn ' + (isMastered ? "" : "dq-btn-success") + '" data-fc-master="' + card.id + '">' +
          (isMastered ? "✅ 已掌握（点击取消）" : "✅ 记住了 (+8 XP)") +
        '</button>' +
        '<button class="dq-btn" data-fc-later>🔁 稍后再看</button>' +
        '<button class="dq-btn" data-fc-shuffle>🔀 随机洗牌</button>' +
        '<button class="dq-btn dq-btn-primary" data-fc-next>下一张 ▶</button>' +
      '</div>';

      return html;
    }

    function renderWrongMode() {
      var wrongIds = G().getWrongIds();
      var wrongQuestions = allQuestions.filter(function (q) {
        if (wrongIds.indexOf(q.id) === -1) return false;
        return ui.wrongChapter === "all" || q.chapterId === ui.wrongChapter;
      });

      var html = '<div class="dq-toolbar">' +
        '<span style="font-size:14px;font-weight:700;">📕 待消灭错题：' + wrongIds.length + ' 道</span>' +
        '<select class="dq-select" data-w-chapter style="margin-left:auto;">' +
          '<option value="all">全部章节</option>' +
          CHAPTER_ORDER.map(function (cid) {
            return '<option value="' + cid + '"' + (ui.wrongChapter === cid ? " selected" : "") + '>' + CHAPTER_LABELS[cid] + '</option>';
          }).join("") +
        '</select>' +
      '</div>';

      if (wrongIds.length === 0) {
        return html + '<div class="dq-empty">' +
          '<div class="dq-empty-icon">🎉</div>' +
          '<h3 style="margin:0 0 8px;">太棒了！你的错题本目前空空如也</h3>' +
          '<p style="color:var(--text-muted,#64748b);margin:0 0 18px;">在刷题时答错的题目会自动收集到这里，方便针对性攻克。</p>' +
          '<button class="dq-btn dq-btn-warn" data-go-challenge>⚡ 去开启 10 题挑战</button>' +
        '</div>';
      }

      if (wrongQuestions.length === 0) {
        return html + '<div class="dq-empty"><div class="dq-empty-icon">✅</div><h3>该章节暂无错题！</h3><p>切换到“全部章节”查看其他错题。</p></div>';
      }

      html += wrongQuestions.map(function (q) {
        var attempt = ui.wrongAnswers[q.id];
        return '<div class="dq-card">' +
          '<div class="dq-q-meta" style="justify-content:space-between;">' +
            '<div><span class="dq-tag">' + (CHAPTER_LABELS[q.chapterId] || q.chapterId) + '</span> ' +
            '<span class="dq-tag">' + escHtml(q.tag) + '</span></div>' +
            '<button class="dq-btn" style="padding:4px 10px;font-size:12px;" data-w-resolve="' + q.id + '">✅ 我已掌握，移出错题本</button>' +
          '</div>' +
          '<p class="dq-prompt">' + escHtml(q.prompt) + '</p>' +
          (q.code ? '<pre class="dq-code">' + highlightCpp(q.code) + '</pre>' : '') +
          '<div class="dq-options">' +
            q.options.map(function (opt, idx) {
              var cls = "dq-opt";
              if (attempt) {
                if (idx === q.answer && attempt.isCorrect) cls += " correct";
                else if (idx === attempt.selected && !attempt.isCorrect) cls += " wrong";
              }
              return '<button class="' + cls + '" data-w-opt="' + q.id + ':' + idx + '">' + escHtml(opt) + '</button>';
            }).join("") +
          '</div>' +
          (attempt && !attempt.isCorrect
            ? '<div class="dq-explain is-wrong" style="margin-top:12px;">还是不太对哦，再仔细看看！提示：' + escHtml(q.explanation) + '</div>'
            : '') +
        '</div>';
      }).join("");

      return html;
    }

    function render() {
      var body = "";
      if (ui.mode === "quiz") body = renderQuizMode();
      else if (ui.mode === "bug") body = renderBugMode();
      else if (ui.mode === "cards") body = renderCardsMode();
      else if (ui.mode === "wrong") body = renderWrongMode();

      containerEl.innerHTML = '<div class="dq-wrap">' + renderTabs() + body + '</div>';
      bindEvents();
    }

    function bindEvents() {
      // 主子模式切换
      var tabBtns = containerEl.querySelectorAll("[data-tab]");
      for (var i = 0; i < tabBtns.length; i++) {
        tabBtns[i].addEventListener("click", function () {
          var nextMode = this.getAttribute("data-tab");
          if (nextMode !== "quiz") {
            stopTimer();
            ui.challengeActive = false;
          }
          ui.mode = nextMode;
          if (nextMode === "cards") rebuildCardList(false);
          render();
        });
      }

      // 刷题模式事件
      var qCh = containerEl.querySelector("[data-q-chapter]");
      if (qCh) {
        qCh.addEventListener("change", function () {
          stopTimer();
          ui.challengeActive = false;
          ui.chapter = this.value;
          rebuildQuizList(false);
          render();
        });
      }
      var qDiff = containerEl.querySelector("[data-q-diff]");
      if (qDiff) {
        qDiff.addEventListener("change", function () {
          stopTimer();
          ui.challengeActive = false;
          ui.difficulty = Number(this.value) || 0;
          rebuildQuizList(false);
          render();
        });
      }
      var qShuf = containerEl.querySelector("[data-q-shuffle]");
      if (qShuf) {
        qShuf.addEventListener("click", function () {
          stopTimer();
          ui.challengeActive = false;
          rebuildQuizList(true);
          G().toast("🔀 题目顺序已打乱", "info", 1600);
          render();
        });
      }
      var qChals = containerEl.querySelectorAll("[data-q-challenge]");
      for (var cIdx = 0; cIdx < qChals.length; cIdx++) {
        qChals[cIdx].addEventListener("click", startChallenge);
      }
      var qExits = containerEl.querySelectorAll("[data-q-exit-challenge]");
      for (var eIdx = 0; eIdx < qExits.length; eIdx++) {
        qExits[eIdx].addEventListener("click", function () {
          stopTimer();
          ui.challengeActive = false;
          ui.challengeFinished = false;
          rebuildQuizList(false);
          render();
        });
      }

      var optBtns = containerEl.querySelectorAll("[data-q-opt]");
      for (var o = 0; o < optBtns.length; o++) {
        optBtns[o].addEventListener("click", function () {
          if (ui.selectedOpt !== null) return;
          var idx = Number(this.getAttribute("data-q-opt"));
          var q = ui.quizList[ui.quizIdx];
          if (!q) return;
          ui.selectedOpt = idx;
          var isCorrect = idx === q.answer;
          ui.lastResult = G().recordQuizResult(q.id, isCorrect);
          if (ui.challengeActive) {
            if (isCorrect) ui.challengeCorrect += 1;
            ui.challengeXP += (ui.lastResult.xpGained || 0);
          }
          render();
        });
      }

      var qPrev = containerEl.querySelector("[data-q-prev]");
      if (qPrev) {
        qPrev.addEventListener("click", function () {
          if (ui.quizIdx > 0) {
            ui.quizIdx -= 1;
            ui.selectedOpt = null;
            ui.lastResult = null;
            render();
          }
        });
      }
      var qNext = containerEl.querySelector("[data-q-next]");
      if (qNext) {
        qNext.addEventListener("click", function () {
          if (ui.challengeActive) {
            if (ui.quizIdx + 1 >= ui.quizList.length) {
              stopTimer();
              ui.challengeFinished = true;
              var acc = Math.round((ui.challengeCorrect / (ui.quizList.length || 1)) * 100);
              if (acc >= 80) G().celebrate("🏆 10 题挑战高分通关！", "正确率 " + acc + "%");
            } else {
              ui.quizIdx += 1;
              ui.selectedOpt = null;
              ui.lastResult = null;
            }
          } else {
            ui.quizIdx = (ui.quizIdx + 1) % ui.quizList.length;
            ui.selectedOpt = null;
            ui.lastResult = null;
          }
          render();
        });
      }

      // 找 Bug 大侦探事件
      var bugChBtns = containerEl.querySelectorAll("[data-bug-ch]");
      for (var bc = 0; bc < bugChBtns.length; bc++) {
        bugChBtns[bc].addEventListener("click", function () {
          ui.bugChapter = this.getAttribute("data-bug-ch");
          ui.bugIdx = 0;
          resetBugProgress();
          render();
        });
      }
      var bugIdxBtns = containerEl.querySelectorAll("[data-bug-idx]");
      for (var bi = 0; bi < bugIdxBtns.length; bi++) {
        bugIdxBtns[bi].addEventListener("click", function () {
          ui.bugIdx = Number(this.getAttribute("data-bug-idx")) || 0;
          resetBugProgress();
          render();
        });
      }
      var bugLines = containerEl.querySelectorAll("[data-bug-line]");
      for (var bl = 0; bl < bugLines.length; bl++) {
        bugLines[bl].addEventListener("click", function () {
          if (ui.bugLineHit) return;
          var list = getFilteredBugs();
          var c = list[ui.bugIdx];
          if (!c) return;
          var ln = Number(this.getAttribute("data-bug-line"));
          if (ln === c.bugLine) {
            ui.bugLineHit = true;
            G().toast("🎯 火眼金睛！精准命中第 " + ln + " 行，请诊断病因！", "success", 2400);
            render();
          } else {
            ui.bugMissCount += 1;
            if (ui.bugMissedLines.indexOf(ln) === -1) ui.bugMissedLines.push(ln);
            this.classList.add("miss", "dq-shake");
            setTimeout(render, 260);
          }
        });
      }
      var bugHint = containerEl.querySelector("[data-bug-hint]");
      if (bugHint) {
        bugHint.addEventListener("click", function () {
          ui.bugShowHint = true;
          render();
        });
      }
      var bugReveal = containerEl.querySelector("[data-bug-reveal]");
      if (bugReveal) {
        bugReveal.addEventListener("click", function () {
          ui.bugLineHit = true;
          render();
        });
      }
      var bugChoiceBtns = containerEl.querySelectorAll("[data-bug-choice]");
      for (var bch = 0; bch < bugChoiceBtns.length; bch++) {
        bugChoiceBtns[bch].addEventListener("click", function () {
          var list = getFilteredBugs();
          var c = list[ui.bugIdx];
          if (!c) return;
          var idx = Number(this.getAttribute("data-bug-choice"));
          ui.bugSelectedChoice = idx;
          if (idx === c.answerIdx) {
            G().recordBugSolved(c.id);
          }
          render();
        });
      }
      var bugPrev = containerEl.querySelector("[data-bug-prev]");
      if (bugPrev) {
        bugPrev.addEventListener("click", function () {
          var list = getFilteredBugs();
          if (list.length === 0) return;
          ui.bugIdx = (ui.bugIdx - 1 + list.length) % list.length;
          resetBugProgress();
          render();
        });
      }
      var bugNext = containerEl.querySelector("[data-bug-next]");
      if (bugNext) {
        bugNext.addEventListener("click", function () {
          var list = getFilteredBugs();
          if (list.length === 0) return;
          ui.bugIdx = (ui.bugIdx + 1) % list.length;
          resetBugProgress();
          render();
        });
      }

      // 3D 翻转闪卡事件
      var fcCh = containerEl.querySelector("[data-fc-chapter]");
      if (fcCh) {
        fcCh.addEventListener("change", function () {
          ui.cardChapter = this.value;
          rebuildCardList(false);
          render();
        });
      }
      var fcCats = containerEl.querySelectorAll("[data-fc-cat]");
      for (var fc = 0; fc < fcCats.length; fc++) {
        fcCats[fc].addEventListener("click", function () {
          ui.cardCategory = this.getAttribute("data-fc-cat");
          rebuildCardList(false);
          render();
        });
      }
      var fcUnm = containerEl.querySelector("[data-fc-unmastered]");
      if (fcUnm) {
        fcUnm.addEventListener("change", function () {
          ui.cardOnlyUnmastered = this.checked;
          rebuildCardList(false);
          render();
        });
      }
      var fcReset = containerEl.querySelector("[data-fc-reset-filter]");
      if (fcReset) {
        fcReset.addEventListener("click", function () {
          ui.cardChapter = "all";
          ui.cardCategory = "all";
          ui.cardOnlyUnmastered = false;
          rebuildCardList(false);
          render();
        });
      }
      var fcCard = containerEl.querySelector("[data-fc-flip]");
      if (fcCard) {
        fcCard.addEventListener("click", function () {
          ui.cardFlipped = !ui.cardFlipped;
          this.classList.toggle("flipped", ui.cardFlipped);
        });
      }
      var fcPrev = containerEl.querySelector("[data-fc-prev]");
      if (fcPrev) {
        fcPrev.addEventListener("click", function () {
          if (ui.cardList.length === 0) return;
          ui.cardIdx = (ui.cardIdx - 1 + ui.cardList.length) % ui.cardList.length;
          ui.cardFlipped = false;
          render();
        });
      }
      var fcNext = containerEl.querySelector("[data-fc-next]");
      if (fcNext) {
        fcNext.addEventListener("click", function () {
          if (ui.cardList.length === 0) return;
          ui.cardIdx = (ui.cardIdx + 1) % ui.cardList.length;
          ui.cardFlipped = false;
          render();
        });
      }
      var fcLater = containerEl.querySelector("[data-fc-later]");
      if (fcLater) {
        fcLater.addEventListener("click", function () {
          if (ui.cardList.length <= 1) return;
          var cur = ui.cardList.splice(ui.cardIdx, 1)[0];
          ui.cardList.push(cur);
          if (ui.cardIdx >= ui.cardList.length) ui.cardIdx = 0;
          ui.cardFlipped = false;
          G().toast("🔁 已移到本轮队尾，稍后再复习", "info", 1500);
          render();
        });
      }
      var fcShuf = containerEl.querySelector("[data-fc-shuffle]");
      if (fcShuf) {
        fcShuf.addEventListener("click", function () {
          ui.cardList = shuffle(ui.cardList);
          ui.cardIdx = 0;
          ui.cardFlipped = false;
          G().toast("🔀 闪卡已随机洗牌", "info", 1500);
          render();
        });
      }
      var fcMaster = containerEl.querySelector("[data-fc-master]");
      if (fcMaster) {
        fcMaster.addEventListener("click", function () {
          var cid = this.getAttribute("data-fc-master");
          var nowMastered = G().toggleCardMastered(cid);
          if (ui.cardOnlyUnmastered && nowMastered) {
            rebuildCardList(false);
          } else if (nowMastered && ui.cardList.length > 1) {
            ui.cardIdx = (ui.cardIdx + 1) % ui.cardList.length;
            ui.cardFlipped = false;
          }
          render();
        });
      }

      // 错题本事件
      var wCh = containerEl.querySelector("[data-w-chapter]");
      if (wCh) {
        wCh.addEventListener("change", function () {
          ui.wrongChapter = this.value;
          render();
        });
      }
      var goChal = containerEl.querySelector("[data-go-challenge]");
      if (goChal) {
        goChal.addEventListener("click", function () {
          ui.mode = "quiz";
          startChallenge();
        });
      }
      var wResBtns = containerEl.querySelectorAll("[data-w-resolve]");
      for (var wr = 0; wr < wResBtns.length; wr++) {
        wResBtns[wr].addEventListener("click", function () {
          var qid = this.getAttribute("data-w-resolve");
          delete ui.wrongAnswers[qid];
          G().markWrongResolved(qid);
          render();
        });
      }
      var wOptBtns = containerEl.querySelectorAll("[data-w-opt]");
      for (var wo = 0; wo < wOptBtns.length; wo++) {
        wOptBtns[wo].addEventListener("click", function () {
          var parts = this.getAttribute("data-w-opt").split(":");
          var qid = parts[0];
          var idx = Number(parts[1]);
          var q = allQuestions.find(function (item) { return item.id === qid; });
          if (!q) return;
          var ok = idx === q.answer;
          ui.wrongAnswers[qid] = { selected: idx, isCorrect: ok };
          if (ok) {
            delete ui.wrongAnswers[qid];
            G().markWrongResolved(qid);
          }
          render();
        });
      }
    }

    render();
  }

  global.DSQuizView = {
    mount: mount
  };
})(typeof window !== "undefined" ? window : globalThis);

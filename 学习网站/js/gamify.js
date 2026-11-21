// 《数据结构与算法》游戏化学习引擎：XP / 8级段位 / 12成就 / 连胜 / 错题本 / 笔记 / 书签 / Toast & Canvas彩纸
// 暴露全局对象 window.DSGamify，使用 localStorage key "ds_academy_v1" 持久化
(function (global) {
  "use strict";

  var STORAGE_KEY = "ds_academy_v1";

  var LEVELS = [
    { level: 1, title: "指针萌新",     icon: "🌱", minXP: 0 },
    { level: 2, title: "链表织梦者",   icon: "🔗", minXP: 150 },
    { level: 3, title: "栈队调度师",   icon: "📚", minXP: 350 },
    { level: 4, title: "树海探险家",   icon: "🌳", minXP: 650 },
    { level: 5, title: "图论领航员",   icon: "🕸️", minXP: 1050 },
    { level: 6, title: "哈希猎手",     icon: "🔍", minXP: 1550 },
    { level: 7, title: "排序宗师",     icon: "⚡", minXP: 2150 },
    { level: 8, title: "全书通关大师", icon: "👑", minXP: 3000 }
  ];

  var ACHIEVEMENT_DEFS = [
    {
      id: "first_step",
      icon: "🌱",
      name: "初入指针江湖",
      desc: "迈出第一步：获得首次学习经验值",
      check: function (s) { return s.xp > 0; }
    },
    {
      id: "reader_15",
      icon: "📖",
      name: "精读卷王",
      desc: "在全书精读中累计标记掌握 15 个小节",
      check: function (s) { return s.doneSections.length >= 15; }
    },
    {
      id: "viz_4",
      icon: "🎬",
      name: "动画极客",
      desc: "体验至少 4 个交互式数据结构动画模块",
      check: function (s) { return s.visitedViz.length >= 4; }
    },
    {
      id: "viz_8",
      icon: "🌟",
      name: "全栈可视化",
      desc: "体验全部 8 个交互式数据结构动画模块",
      check: function (s) { return s.visitedViz.length >= 8; }
    },
    {
      id: "lab_1",
      icon: "💻",
      name: "破冰首杀",
      desc: "成功通过第 1 个手写 C++ 代码评测关",
      check: function (s) { return s.passedLabs.length >= 1; }
    },
    {
      id: "lab_5",
      icon: "🛠️",
      name: "指针工匠",
      desc: "累计通过 5 个手写 C++ 代码评测关",
      check: function (s) { return s.passedLabs.length >= 5; }
    },
    {
      id: "lab_15",
      icon: "👑",
      name: "十五关满星",
      desc: "通关全部 15 个手写 C++ 代码评测关",
      check: function (s) { return s.passedLabs.length >= 15; }
    },
    {
      id: "quiz_15",
      icon: "🎯",
      name: "刷题新星",
      desc: "在交互测验中累计答对 15 道不同题目",
      check: function (s) { return s.correctIds.length >= 15; }
    },
    {
      id: "combo_5",
      icon: "🔥",
      name: "五连暴击",
      desc: "刷题中连续答对 5 题，触发火焰连击",
      check: function (s) { return s.maxCombo >= 5 || s.combo >= 5; }
    },
    {
      id: "bug_6",
      icon: "🩺",
      name: "排错名医",
      desc: "在找 Bug 大侦探中成功治愈 6 例代码病例",
      check: function (s) { return s.solvedBugs.length >= 6; }
    },
    {
      id: "card_20",
      icon: "🃏",
      name: "闪卡记忆大师",
      desc: "在 3D 翻转闪卡中掌握至少 20 张核心卡片",
      check: function (s) { return s.masteredCards.length >= 20; }
    },
    {
      id: "xp_1500",
      icon: "💎",
      name: "数据结构达人",
      desc: "累计经验值突破 1500 XP",
      check: function (s) { return s.xp >= 1500; }
    }
  ];

  function getTodayStr() {
    var d = new Date();
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + day;
  }

  function daysBetween(dateStrA, dateStrB) {
    if (!dateStrA || !dateStrB) return 999;
    var a = new Date(dateStrA + "T00:00:00");
    var b = new Date(dateStrB + "T00:00:00");
    return Math.round((b - a) / 86400000);
  }

  function createDefaultState() {
    return {
      version: 1,
      xp: 0,
      streak: 1,
      lastActiveDate: getTodayStr(),
      doneSections: [],     // ["00::slug", ...]
      passedLabs: [],       // ["00", "01", ...]
      visitedViz: [],       // ["linkedlist", "kmp", ...]
      wrongIds: [],         // ["q-01-03", ...]
      answeredIds: [],      // ["q-01-01", ...]
      correctIds: [],       // ["q-01-01", ...]
      solvedBugs: [],       // ["bug-00-1", ...]
      masteredCards: [],    // ["fc-00-01", ...]
      bookmarks: [],        // [{ id, chapterId, title, addedAt }, ...]
      notes: {},            // { "00": "我的笔记...", ... }
      combo: 0,
      maxCombo: 0,
      achievements: [],     // ["first_step", ...]
      lastVisited: null     // { view: "reader", target: "02", title: "..." }
    };
  }

  function uniqArray(arr) {
    if (!Array.isArray(arr)) return [];
    var out = [];
    var seen = Object.create(null);
    for (var i = 0; i < arr.length; i++) {
      var v = arr[i];
      if (v !== undefined && v !== null && !seen[String(v)]) {
        seen[String(v)] = true;
        out.push(v);
      }
    }
    return out;
  }

  function sanitizeState(raw) {
    var base = createDefaultState();
    if (!raw || typeof raw !== "object") return base;
    base.xp = typeof raw.xp === "number" && isFinite(raw.xp) && raw.xp >= 0 ? Math.floor(raw.xp) : 0;
    base.streak = typeof raw.streak === "number" && raw.streak >= 1 ? Math.floor(raw.streak) : 1;
    base.lastActiveDate = typeof raw.lastActiveDate === "string" ? raw.lastActiveDate : getTodayStr();
    base.doneSections = uniqArray(raw.doneSections);
    base.passedLabs = uniqArray(raw.passedLabs).map(String);
    base.visitedViz = uniqArray(raw.visitedViz).map(String);
    base.wrongIds = uniqArray(raw.wrongIds).map(String);
    base.answeredIds = uniqArray(raw.answeredIds).map(String);
    base.correctIds = uniqArray(raw.correctIds).map(String);
    base.solvedBugs = uniqArray(raw.solvedBugs).map(String);
    base.masteredCards = uniqArray(raw.masteredCards).map(String);
    base.bookmarks = Array.isArray(raw.bookmarks) ? raw.bookmarks.slice() : [];
    base.notes = raw.notes && typeof raw.notes === "object" && !Array.isArray(raw.notes) ? Object.assign({}, raw.notes) : {};
    base.combo = typeof raw.combo === "number" && raw.combo >= 0 ? Math.floor(raw.combo) : 0;
    base.maxCombo = typeof raw.maxCombo === "number" && raw.maxCombo >= 0 ? Math.floor(raw.maxCombo) : base.combo;
    base.achievements = uniqArray(raw.achievements).map(String);
    base.lastVisited = raw.lastVisited && typeof raw.lastVisited === "object" ? raw.lastVisited : null;
    return base;
  }

  function loadState() {
    try {
      if (typeof localStorage !== "undefined") {
        var raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          var parsed = JSON.parse(raw);
          var st = sanitizeState(parsed);
          updateStreak(st);
          return st;
        }
      }
    } catch (e) {
      // 忽略隐私模式或损坏的存储
    }
    var fresh = createDefaultState();
    saveStateRaw(fresh);
    return fresh;
  }

  function updateStreak(st) {
    var today = getTodayStr();
    if (!st.lastActiveDate) {
      st.lastActiveDate = today;
      st.streak = 1;
      return;
    }
    var diff = daysBetween(st.lastActiveDate, today);
    if (diff === 1) {
      st.streak += 1;
      st.lastActiveDate = today;
    } else if (diff > 1) {
      st.streak = 1;
      st.lastActiveDate = today;
    }
  }

  function saveStateRaw(st) {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(st));
      }
    } catch (e) {
      // 忽略存储配额异常
    }
  }

  var state = loadState();
  var subscribers = [];

  function notify() {
    saveStateRaw(state);
    for (var i = 0; i < subscribers.length; i++) {
      try {
        subscribers[i](getState());
      } catch (e) {
        if (typeof console !== "undefined" && console.error) {
          console.error("[DSGamify subscriber error]", e);
        }
      }
    }
  }

  // ==================== 注入轻量 Toast 与动效样式 ====================
  var stylesInjected = false;
  function ensureStyles() {
    if (stylesInjected || typeof document === "undefined") return;
    stylesInjected = true;
    var style = document.createElement("style");
    style.id = "ds-gamify-styles";
    style.textContent = [
      ".ds-toast-stack{position:fixed;right:20px;bottom:22px;z-index:99999;display:flex;flex-direction:column;gap:10px;max-width:360px;pointer-events:none;}",
      ".ds-toast{pointer-events:auto;display:flex;align-items:center;gap:10px;padding:12px 16px;border-radius:12px;font-size:14px;line-height:1.45;font-weight:500;box-shadow:0 10px 28px rgba(15,23,42,.18);background:var(--bg-card,#ffffff);color:var(--text-main,#1e293b);border:1px solid var(--border,#e2e8f0);border-left:4px solid var(--accent,#2563eb);opacity:0;transform:translateY(14px) scale(.96);transition:opacity .24s ease,transform .24s ease;}",
      ".ds-toast.show{opacity:1;transform:translateY(0) scale(1);}",
      ".ds-toast.ds-toast-success{border-left-color:#10b981;}",
      ".ds-toast.ds-toast-warn{border-left-color:#f59e0b;}",
      ".ds-toast.ds-toast-error{border-left-color:#ef4444;}",
      ".ds-toast.ds-toast-achievement{border-left-color:#8b5cf6;background:linear-gradient(135deg,var(--bg-card,#ffffff),rgba(139,92,246,.08));}",
      ".ds-toast-icon{font-size:18px;flex-shrink:0;}",
      ".ds-confetti-canvas{position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:99998;}"
    ].join("");
    (document.head || document.documentElement).appendChild(style);
  }

  function toast(message, type, duration) {
    if (typeof document === "undefined") return;
    ensureStyles();
    var kind = type || "info";
    var ms = typeof duration === "number" ? duration : 3200;
    var stack = document.getElementById("ds-toast-stack");
    if (!stack) {
      stack = document.createElement("div");
      stack.id = "ds-toast-stack";
      stack.className = "ds-toast-stack";
      document.body.appendChild(stack);
    }
    var iconMap = {
      info: "💡",
      success: "✨",
      warn: "⚠️",
      error: "❌",
      achievement: "🏅"
    };
    var item = document.createElement("div");
    item.className = "ds-toast ds-toast-" + kind;
    var iconSpan = document.createElement("span");
    iconSpan.className = "ds-toast-icon";
    iconSpan.textContent = iconMap[kind] || "✨";
    var textSpan = document.createElement("span");
    textSpan.textContent = String(message);
    item.appendChild(iconSpan);
    item.appendChild(textSpan);
    stack.appendChild(item);

    // 最多保留 4 条，防止刷屏
    while (stack.children.length > 4) {
      stack.removeChild(stack.firstChild);
    }

    requestAnimationFrame(function () {
      item.classList.add("show");
    });

    setTimeout(function () {
      item.classList.remove("show");
      setTimeout(function () {
        if (item.parentNode) item.parentNode.removeChild(item);
      }, 280);
    }, ms);
  }

  function celebrate(title, subtitle) {
    if (title) {
      toast(subtitle ? title + " — " + subtitle : title, "achievement", 4200);
    }
    if (typeof document === "undefined" || typeof window === "undefined") return;
    ensureStyles();
    try {
      var canvas = document.createElement("canvas");
      canvas.className = "ds-confetti-canvas";
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = window.innerWidth;
      var h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      document.body.appendChild(canvas);
      var ctx = canvas.getContext("2d");
      if (!ctx) {
        document.body.removeChild(canvas);
        return;
      }
      ctx.scale(dpr, dpr);

      var colors = ["#2563eb", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4", "#ef4444"];
      var particles = [];
      var count = 72;
      for (var i = 0; i < count; i++) {
        var angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.4;
        var speed = 6 + Math.random() * 10;
        particles.push({
          x: w * (0.25 + Math.random() * 0.5),
          y: h * 0.48 + (Math.random() - 0.5) * 60,
          vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 4,
          vy: Math.sin(angle) * speed - Math.random() * 3,
          size: 5 + Math.random() * 6,
          color: colors[i % colors.length],
          rot: Math.random() * Math.PI * 2,
          vrot: (Math.random() - 0.5) * 0.28,
          life: 1
        });
      }

      var startTime = Date.now();
      var duration = 2100;
      function frame() {
        var elapsed = Date.now() - startTime;
        if (elapsed >= duration) {
          if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
          return;
        }
        ctx.clearRect(0, 0, w, h);
        var fade = elapsed > 1400 ? Math.max(0, 1 - (elapsed - 1400) / 700) : 1;
        for (var j = 0; j < particles.length; j++) {
          var p = particles[j];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.28;
          p.vx *= 0.99;
          p.rot += p.vrot;
          ctx.save();
          ctx.globalAlpha = fade;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.65);
          ctx.restore();
        }
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    } catch (e) {
      // 无头环境或不支持 canvas 时静默降级
    }
  }

  // ==================== 段位与成就检测 ====================
  function getLevelInfo(xpOverride) {
    var xp = typeof xpOverride === "number" ? xpOverride : state.xp;
    var cur = LEVELS[0];
    var next = LEVELS[1];
    for (var i = 0; i < LEVELS.length; i++) {
      if (xp >= LEVELS[i].minXP) {
        cur = LEVELS[i];
        next = LEVELS[i + 1] || null;
      }
    }
    var isMax = !next;
    var progress = 100;
    var toNext = 0;
    if (next) {
      var span = next.minXP - cur.minXP;
      progress = Math.max(0, Math.min(100, Math.round(((xp - cur.minXP) / span) * 100)));
      toNext = Math.max(0, next.minXP - xp);
    }
    return {
      level: cur.level,
      title: cur.title,
      icon: cur.icon,
      xp: xp,
      minXP: cur.minXP,
      nextXP: next ? next.minXP : cur.minXP,
      nextTitle: next ? next.title : "已满级",
      progress: progress,
      toNext: toNext,
      isMax: isMax
    };
  }

  function checkAchievements() {
    var newlyUnlocked = [];
    for (var i = 0; i < ACHIEVEMENT_DEFS.length; i++) {
      var def = ACHIEVEMENT_DEFS[i];
      if (state.achievements.indexOf(def.id) === -1 && def.check(state)) {
        state.achievements.push(def.id);
        newlyUnlocked.push(def);
      }
    }
    if (newlyUnlocked.length > 0) {
      for (var j = 0; j < newlyUnlocked.length; j++) {
        var a = newlyUnlocked[j];
        celebrate("解锁成就：" + a.icon + " " + a.name, a.desc);
      }
    }
    return newlyUnlocked;
  }

  function getAchievements() {
    return ACHIEVEMENT_DEFS.map(function (def) {
      return {
        id: def.id,
        icon: def.icon,
        name: def.name,
        desc: def.desc,
        unlocked: state.achievements.indexOf(def.id) !== -1
      };
    });
  }

  // ==================== 核心 API ====================
  function getState() {
    return {
      version: state.version,
      xp: state.xp,
      streak: state.streak,
      lastActiveDate: state.lastActiveDate,
      doneSections: state.doneSections.slice(),
      passedLabs: state.passedLabs.slice(),
      visitedViz: state.visitedViz.slice(),
      wrongIds: state.wrongIds.slice(),
      answeredIds: state.answeredIds.slice(),
      correctIds: state.correctIds.slice(),
      solvedBugs: state.solvedBugs.slice(),
      masteredCards: state.masteredCards.slice(),
      bookmarks: state.bookmarks.slice(),
      notes: Object.assign({}, state.notes),
      combo: state.combo,
      maxCombo: state.maxCombo,
      achievements: state.achievements.slice(),
      lastVisited: state.lastVisited ? Object.assign({}, state.lastVisited) : null
    };
  }

  function addXP(amount, reason) {
    var delta = Math.floor(Number(amount) || 0);
    if (delta <= 0) return state.xp;
    var beforeLv = getLevelInfo(state.xp).level;
    state.xp += delta;
    updateStreak(state);
    var afterInfo = getLevelInfo(state.xp);
    if (reason) {
      toast("+" + delta + " XP · " + reason, "success", 2400);
    }
    if (afterInfo.level > beforeLv) {
      celebrate("🎉 段位晋升 Lv." + afterInfo.level + " " + afterInfo.icon + " " + afterInfo.title, "继续保持学习势头！");
    }
    checkAchievements();
    notify();
    return state.xp;
  }

  function makeSectionKey(chapterId, slug) {
    if (slug === undefined || slug === null) return String(chapterId);
    return String(chapterId) + "::" + String(slug);
  }

  function toggleSectionDone(chapterId, slug) {
    var key = makeSectionKey(chapterId, slug);
    var idx = state.doneSections.indexOf(key);
    var isDone;
    if (idx === -1) {
      state.doneSections.push(key);
      isDone = true;
      addXP(10, "掌握新知识点");
    } else {
      state.doneSections.splice(idx, 1);
      isDone = false;
      notify();
    }
    return isDone;
  }

  function isSectionDone(chapterId, slug) {
    var key = makeSectionKey(chapterId, slug);
    return state.doneSections.indexOf(key) !== -1;
  }

  function getChapterProgress(chapterId, totalSectionsHint) {
    var cid = String(chapterId);
    var prefix = cid + "::";
    var sectionsDone = 0;
    for (var i = 0; i < state.doneSections.length; i++) {
      if (state.doneSections[i].indexOf(prefix) === 0) sectionsDone++;
    }

    var sectionsTotal = typeof totalSectionsHint === "number" && totalSectionsHint > 0 ? totalSectionsHint : 0;
    if (!sectionsTotal && global.DS_CHAPTERS && global.DS_CHAPTERS[cid]) {
      var ch = global.DS_CHAPTERS[cid];
      if (Array.isArray(ch.sectionSlugs) && ch.sectionSlugs.length > 0) {
        sectionsTotal = ch.sectionSlugs.length;
      } else if (Array.isArray(ch.headings) && ch.headings.length > 0) {
        sectionsTotal = ch.headings.length;
      }
    }

    // 同时统计该章的测验题、找 Bug 与实验进度
    var quizTotal = 0, quizCorrect = 0;
    var bugsTotal = 0, bugsSolved = 0;
    if (global.DS_QUIZZES) {
      var qs = global.DS_QUIZZES.questions || [];
      for (var q = 0; q < qs.length; q++) {
        if (qs[q].chapterId === cid) {
          quizTotal++;
          if (state.correctIds.indexOf(qs[q].id) !== -1) quizCorrect++;
        }
      }
      var bs = global.DS_QUIZZES.bugCases || [];
      for (var b = 0; b < bs.length; b++) {
        if (bs[b].chapterId === cid) {
          bugsTotal++;
          if (state.solvedBugs.indexOf(bs[b].id) !== -1) bugsSolved++;
        }
      }
    }

    var labsTotal = 0, labsPassed = 0;
    if (global.DS_MANIFEST && Array.isArray(global.DS_MANIFEST.chapters)) {
      for (var m = 0; m < global.DS_MANIFEST.chapters.length; m++) {
        var meta = global.DS_MANIFEST.chapters[m];
        if (meta.id === cid && Array.isArray(meta.labIds)) {
          labsTotal = meta.labIds.length;
          for (var l = 0; l < meta.labIds.length; l++) {
            if (state.passedLabs.indexOf(String(meta.labIds[l])) !== -1) labsPassed++;
          }
          break;
        }
      }
    }

    var totalUnits = sectionsTotal + quizTotal + bugsTotal + labsTotal;
    var doneUnits = Math.min(sectionsDone, sectionsTotal || sectionsDone) + quizCorrect + bugsSolved + labsPassed;
    var percent = totalUnits > 0 ? Math.min(100, Math.round((doneUnits / totalUnits) * 100)) : 0;

    return {
      chapterId: cid,
      done: doneUnits,
      total: totalUnits,
      percent: percent,
      sectionsDone: sectionsDone,
      sectionsTotal: sectionsTotal,
      quizCorrect: quizCorrect,
      quizTotal: quizTotal,
      bugsSolved: bugsSolved,
      bugsTotal: bugsTotal,
      labsPassed: labsPassed,
      labsTotal: labsTotal
    };
  }

  function recordQuizResult(questionId, isCorrect) {
    var qid = String(questionId);
    if (state.answeredIds.indexOf(qid) === -1) {
      state.answeredIds.push(qid);
    }
    var xpGained = 0;
    if (isCorrect) {
      state.combo += 1;
      if (state.combo > state.maxCombo) state.maxCombo = state.combo;

      var wrongIdx = state.wrongIds.indexOf(qid);
      if (wrongIdx !== -1) state.wrongIds.splice(wrongIdx, 1);

      var isFirstCorrect = state.correctIds.indexOf(qid) === -1;
      if (isFirstCorrect) {
        state.correctIds.push(qid);
        var comboBonus = Math.min(10, Math.max(0, (state.combo - 1) * 2));
        xpGained = 15 + comboBonus;
        var beforeLv = getLevelInfo(state.xp).level;
        state.xp += xpGained;
        var afterInfo = getLevelInfo(state.xp);
        if (afterInfo.level > beforeLv) {
          celebrate("🎉 段位晋升 Lv." + afterInfo.level + " " + afterInfo.icon + " " + afterInfo.title, "刷题升级啦！");
        }
      }
    } else {
      state.combo = 0;
      if (state.wrongIds.indexOf(qid) === -1) {
        state.wrongIds.push(qid);
      }
    }
    updateStreak(state);
    checkAchievements();
    notify();
    return {
      questionId: qid,
      isCorrect: !!isCorrect,
      combo: state.combo,
      xpGained: xpGained
    };
  }

  function getWrongIds() {
    return state.wrongIds.slice();
  }

  function markWrongResolved(questionId) {
    var qid = String(questionId);
    var idx = state.wrongIds.indexOf(qid);
    if (idx !== -1) {
      state.wrongIds.splice(idx, 1);
    }
    if (state.correctIds.indexOf(qid) === -1) {
      state.correctIds.push(qid);
    }
    addXP(12, "攻克一道错题，已移出错题本！");
    return true;
  }

  function recordBugSolved(bugId) {
    var bid = String(bugId);
    var newlySolved = state.solvedBugs.indexOf(bid) === -1;
    var xpGained = 0;
    if (newlySolved) {
      state.solvedBugs.push(bid);
      xpGained = 25;
      addXP(xpGained, "成功排雷并治愈病例！");
      celebrate();
    } else {
      notify();
    }
    return { bugId: bid, newlySolved: newlySolved, xpGained: xpGained };
  }

  function toggleCardMastered(cardId) {
    var cid = String(cardId);
    var idx = state.masteredCards.indexOf(cid);
    if (idx === -1) {
      state.masteredCards.push(cid);
      addXP(8, "掌握核心闪卡");
      return true;
    } else {
      state.masteredCards.splice(idx, 1);
      notify();
      return false;
    }
  }

  function markLabPassed(labId) {
    var lid = String(labId);
    var newlyPassed = state.passedLabs.indexOf(lid) === -1;
    var xpGained = 0;
    if (newlyPassed) {
      state.passedLabs.push(lid);
      xpGained = 50;
      addXP(xpGained, "代码评测 Lab " + lid + " 全绿通关！");
      celebrate("💻 Lab " + lid + " 通关成功！", "+50 XP 已入账");
    } else {
      notify();
    }
    return { labId: lid, newlyPassed: newlyPassed, xpGained: xpGained };
  }

  function syncPassedLabs(labIds) {
    if (!Array.isArray(labIds)) return;
    var changed = false;
    for (var i = 0; i < labIds.length; i++) {
      var lid = String(labIds[i]);
      if (state.passedLabs.indexOf(lid) === -1) {
        state.passedLabs.push(lid);
        changed = true;
      }
    }
    if (changed) {
      checkAchievements();
      notify();
    }
  }

  function markVizVisited(vizId) {
    var vid = String(vizId);
    var newlyVisited = state.visitedViz.indexOf(vid) === -1;
    if (newlyVisited) {
      state.visitedViz.push(vid);
      addXP(15, "解锁交互式算法动画");
    }
    return { vizId: vid, newlyVisited: newlyVisited };
  }

  function toggleBookmark(id, meta) {
    var key = String(id);
    var foundIdx = -1;
    for (var i = 0; i < state.bookmarks.length; i++) {
      var item = state.bookmarks[i];
      if ((typeof item === "string" && item === key) || (item && item.id === key)) {
        foundIdx = i;
        break;
      }
    }
    var bookmarked;
    if (foundIdx === -1) {
      var entry = {
        id: key,
        chapterId: meta && meta.chapterId ? String(meta.chapterId) : "",
        title: typeof meta === "string" ? meta : (meta && meta.title ? String(meta.title) : key),
        addedAt: Date.now()
      };
      state.bookmarks.push(entry);
      bookmarked = true;
      toast("⭐ 已加入收藏夹", "info", 1800);
    } else {
      state.bookmarks.splice(foundIdx, 1);
      bookmarked = false;
      toast("已取消收藏", "info", 1600);
    }
    notify();
    return bookmarked;
  }

  function isBookmarked(id) {
    var key = String(id);
    for (var i = 0; i < state.bookmarks.length; i++) {
      var item = state.bookmarks[i];
      if ((typeof item === "string" && item === key) || (item && item.id === key)) {
        return true;
      }
    }
    return false;
  }

  function saveNote(chapterId, text) {
    var cid = String(chapterId);
    var wasEmpty = Object.keys(state.notes).length === 0;
    var val = String(text == null ? "" : text);
    if (val.trim() === "") {
      delete state.notes[cid];
    } else {
      state.notes[cid] = val;
      if (wasEmpty) {
        addXP(10, "写下第一条学习笔记");
        return;
      }
    }
    notify();
  }

  function getNote(chapterId) {
    return state.notes[String(chapterId)] || "";
  }

  function setLastVisited(view, target, title) {
    state.lastVisited = {
      view: String(view || "dashboard"),
      target: target != null ? String(target) : "",
      title: title ? String(title) : "",
      ts: Date.now()
    };
    saveStateRaw(state);
  }

  function getLastVisited() {
    return state.lastVisited ? Object.assign({}, state.lastVisited) : null;
  }

  function exportJSON() {
    return JSON.stringify({
      app: "ds_academy",
      exportedAt: new Date().toISOString(),
      data: getState()
    }, null, 2);
  }

  function importJSON(jsonStr) {
    try {
      var parsed = typeof jsonStr === "string" ? JSON.parse(jsonStr) : jsonStr;
      var payload = parsed && parsed.data && typeof parsed.data === "object" ? parsed.data : parsed;
      if (!payload || typeof payload !== "object") {
        return { ok: false, error: "JSON 格式无效" };
      }
      state = sanitizeState(payload);
      updateStreak(state);
      notify();
      toast("📥 学习进度导入成功！", "success");
      return { ok: true };
    } catch (e) {
      toast("导入失败：JSON 解析出错", "error");
      return { ok: false, error: e.message || "解析失败" };
    }
  }

  function resetProgress() {
    state = createDefaultState();
    notify();
    toast("学习进度已重置", "warn");
  }

  function subscribe(listener) {
    if (typeof listener !== "function") return function () {};
    subscribers.push(listener);
    return function unsubscribe() {
      var idx = subscribers.indexOf(listener);
      if (idx !== -1) subscribers.splice(idx, 1);
    };
  }

  global.DSGamify = {
    STORAGE_KEY: STORAGE_KEY,
    LEVELS: LEVELS,
    ACHIEVEMENTS: ACHIEVEMENT_DEFS,
    getState: getState,
    addXP: addXP,
    toggleSectionDone: toggleSectionDone,
    isSectionDone: isSectionDone,
    getChapterProgress: getChapterProgress,
    recordQuizResult: recordQuizResult,
    getWrongIds: getWrongIds,
    markWrongResolved: markWrongResolved,
    recordBugSolved: recordBugSolved,
    toggleCardMastered: toggleCardMastered,
    markLabPassed: markLabPassed,
    syncPassedLabs: syncPassedLabs,
    markVizVisited: markVizVisited,
    toggleBookmark: toggleBookmark,
    isBookmarked: isBookmarked,
    saveNote: saveNote,
    getNote: getNote,
    setLastVisited: setLastVisited,
    getLastVisited: getLastVisited,
    getLevelInfo: getLevelInfo,
    getAchievements: getAchievements,
    exportJSON: exportJSON,
    importJSON: importJSON,
    resetProgress: resetProgress,
    subscribe: subscribe,
    toast: toast,
    celebrate: celebrate
  };
})(typeof window !== "undefined" ? window : globalThis);

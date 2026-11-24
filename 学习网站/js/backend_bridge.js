/* ==========================================================================
   js/backend_bridge.js — 统一后端通信桥接层（Tauri 2 桌面端 / server.py / 纯离线三端兼容）
   暴露全局接口：window.DSBackend
   ========================================================================== */
(function (global) {
  'use strict';

  function isTauri() {
    return Boolean(
      global.__TAURI__ &&
      global.__TAURI__.core &&
      typeof global.__TAURI__.core.invoke === 'function'
    );
  }

  function isFileProtocol() {
    return typeof location !== 'undefined' && location.protocol === 'file:';
  }

  function invokeTauri(cmd, args) {
    return global.__TAURI__.core.invoke(cmd, args || {});
  }

  function checkHealth() {
    if (isTauri()) {
      return invokeTauri('check_health')
        .then(function (data) {
          data = data || {};
          return {
            ok: data.ok !== false,
            offline: false,
            mode: data.mode || 'tauri',
            gpp: Boolean(data.gpp),
            gppVersion: data.gppVersion || '',
            pythonVersion: data.pythonVersion || '',
            labsCount: data.labsCount || 15,
            canShutdown: false,
            pid: data.pid || null
          };
        })
        .catch(function (err) {
          return {
            ok: false,
            offline: false,
            mode: 'tauri',
            gpp: false,
            gppVersion: '',
            pythonVersion: '',
            labsCount: 15,
            canShutdown: false,
            pid: null,
            error: String(err && err.message ? err.message : err)
          };
        });
    }

    if (isFileProtocol()) {
      return Promise.resolve({
        ok: false,
        offline: true,
        mode: 'offline',
        gpp: false,
        gppVersion: '',
        pythonVersion: '',
        labsCount: 15,
        canShutdown: false,
        pid: null
      });
    }

    var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = controller ? setTimeout(function () { controller.abort(); }, 2200) : null;

    return fetch('/api/health', controller ? { signal: controller.signal } : {})
      .then(function (r) {
        if (timer) clearTimeout(timer);
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        data = data || {};
        return {
          ok: Boolean(data.ok),
          offline: !data.ok,
          mode: data.mode || 'http',
          gpp: Boolean(data.gpp),
          gppVersion: data.gppVersion || '',
          pythonVersion: data.pythonVersion || '',
          labsCount: data.labsCount || 15,
          canShutdown: data.canShutdown !== undefined ? Boolean(data.canShutdown) : Boolean(data.ok),
          pid: data.pid || null
        };
      })
      .catch(function () {
        if (timer) clearTimeout(timer);
        return {
          ok: false,
          offline: true,
          mode: 'offline',
          gpp: false,
          gppVersion: '',
          pythonVersion: '',
          labsCount: 15,
          canShutdown: false,
          pid: null
        };
      });
  }

  function getProgress() {
    if (isTauri()) {
      return invokeTauri('get_progress').catch(function () { return null; });
    }
    if (isFileProtocol()) {
      return Promise.resolve(null);
    }
    return fetch('/api/progress')
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; });
  }

  function judgeLab(opts) {
    opts = opts || {};
    var payload = {
      labId: String(opts.labId || '00'),
      code: String(opts.code || ''),
      saveToDisk: Boolean(opts.saveToDisk)
    };
    if (isTauri()) {
      return invokeTauri('judge_lab', payload);
    }
    return fetch('/api/judge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }

  function runDemo(code) {
    var payload = { code: String(code || '') };
    if (isTauri()) {
      return invokeTauri('run_demo', payload);
    }
    return fetch('/api/run-demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }

  function shutdown() {
    if (isTauri()) {
      return Promise.resolve({ ok: false, reason: 'desktop' });
    }
    if (isFileProtocol()) {
      return Promise.resolve({ ok: false, reason: 'offline' });
    }
    return fetch('/api/shutdown', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}'
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json().catch(function () { return { ok: true }; });
    });
  }

  global.DSBackend = {
    isTauri: isTauri,
    checkHealth: checkHealth,
    getProgress: getProgress,
    judgeLab: judgeLab,
    runDemo: runDemo,
    shutdown: shutdown
  };
})(window);

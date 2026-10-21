/* 无限气泡纸 —— 逻辑 */
(function () {
  'use strict';

  var sheet = document.getElementById('sheet');
  var numEl = document.getElementById('num');
  var statEl = document.getElementById('stat');
  var toastEl = document.getElementById('toast');
  var tipEl = document.getElementById('tip');
  var soundBtn = document.getElementById('sound');

  var CELL = 46;            // 目标单个气泡占位（px），用来算行列数
  var GAP = 5;              // 与 bubble.css 的 gap 保持一致
  var PAD_X = 12;           // 左右内边距合计
  var PAD_Y = 20;           // 上下内边距合计
  var TOTAL_KEY = 'moyu.bubble.total';
  var MUTE_KEY = 'moyu.bubble.muted';

  var total = 0;            // 累计（本次会话 + 历史）
  var cells = [];
  var pressed = false;
  var lastVibrate = 0;
  var toastTimer = 0;
  var rebuildTimer = 0;
  var tipDone = false;

  var MILESTONES = [
    { at: 30, text: '手感来了。' },
    { at: 80, text: '第一张气泡纸已阵亡。' },
    { at: 150, text: '你比 62% 的同事更会摸鱼。' },
    { at: 300, text: '建议抬头看一眼周围。' },
    { at: 600, text: '这不是摸鱼，这是康复训练。' },
    { at: 1200, text: '老板刚才路过的时候，你在捏泡泡。' },
    { at: 2500, text: '好了，可以回去干活了。' }
  ];
  var milestoneIdx = 0;

  /* ---------- 存档（只存在本机，不上传任何东西） ---------- */

  function loadTotal() {
    try {
      var v = parseInt(window.localStorage.getItem(TOTAL_KEY) || '0', 10);
      return isNaN(v) || v < 0 ? 0 : v;
    } catch (e) {
      return 0;
    }
  }

  function saveTotal() {
    try {
      window.localStorage.setItem(TOTAL_KEY, String(total));
    } catch (e) { /* 隐私模式下写不进去，忽略即可 */ }
  }

  /* ---------- 建气泡纸 ---------- */

  function build() {
    var w = sheet.clientWidth - PAD_X;
    var h = sheet.clientHeight - PAD_Y;
    if (w < 60 || h < 60) return;

    var cols = Math.max(5, Math.min(20, Math.round(w / CELL)));
    var rows = Math.max(5, Math.min(40, Math.round(h / CELL)));

    // 用同一套算法反推直径，保证每颗都是正圆且不出界
    var cw = (w - (cols - 1) * GAP) / cols;
    var ch = (h - (rows - 1) * GAP) / rows;
    var d = Math.max(12, Math.floor(Math.min(cw, ch)));

    sheet.style.setProperty('--cols', cols);
    sheet.style.setProperty('--d', d + 'px');
    sheet.innerHTML = '';
    cells = [];

    var frag = document.createDocumentFragment();
    var n = cols * rows;
    for (var i = 0; i < n; i++) {
      var b = document.createElement('div');
      b.className = 'b';
      b.setAttribute('data-popped', '0');
      // 每颗气泡的色相/饱和度略有差异，看起来才不像一张网格
      b.style.setProperty('--h', String(190 + Math.round(Math.random() * 24)));
      b.style.setProperty('--s', String(14 + Math.round(Math.random() * 10)) + '%');
      frag.appendChild(b);
      cells.push(b);
    }
    sheet.appendChild(frag);
  }

  /* ---------- 捏 ---------- */

  function popBubble(el) {
    if (!el || el.getAttribute('data-popped') === '1') return;
    el.setAttribute('data-popped', '1');
    el.classList.add('pop');

    total += 1;
    saveTotal();

    if (window.Sfx) window.Sfx.pop();

    var now = Date.now();
    if (navigator.vibrate && now - lastVibrate > 55) {
      lastVibrate = now;
      navigator.vibrate(6);
    }

    render();

    // 破掉 0.6~0.8 秒后自动补一颗新的（"无限"就靠这个）
    window.setTimeout(function () {
      el.classList.remove('pop');
      el.setAttribute('data-popped', '0');
      el.classList.add('refill');
      window.setTimeout(function () {
        el.classList.remove('refill');
      }, 300);
    }, 620 + Math.random() * 180);
  }

  function handlePoint(x, y) {
    var el = document.elementFromPoint(x, y);
    if (!el || !el.closest) return;
    var b = el.closest('.b');
    if (b) popBubble(b);
  }

  /* ---------- 界面 ---------- */

  function conversion(n) {
    if (n === 0) return '准备好了就开始捏。';
    var lines = [
      '≈ ' + (n / 60).toFixed(1) + ' 张周报的怨气',
      '≈ ' + (n / 120).toFixed(1) + ' 场没人听的会',
      '≈ ' + (n / 300).toFixed(1) + ' 杯咖啡换来的冷静',
      '≈ ' + Math.round(n / 6) + ' 秒的短暂自由'
    ];
    return lines[Math.floor(n / 12) % lines.length];
  }

  function render() {
    numEl.firstChild.nodeValue = total.toLocaleString('zh-CN');
    statEl.textContent = conversion(total);

    while (milestoneIdx < MILESTONES.length && total >= MILESTONES[milestoneIdx].at) {
      toast(MILESTONES[milestoneIdx].text);
      milestoneIdx += 1;
    }
  }

  function toast(text) {
    toastEl.textContent = text;
    toastEl.classList.add('on');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove('on');
    }, 2200);
  }

  function hideTip() {
    if (tipDone) return;
    tipDone = true;
    tipEl.classList.add('off');
    window.setTimeout(function () {
      tipEl.parentNode && tipEl.parentNode.removeChild(tipEl);
    }, 500);
  }

  /* ---------- 音效开关 ---------- */

  function paintSoundBtn() {
    var muted = window.Sfx ? window.Sfx.isMuted() : false;
    soundBtn.textContent = muted ? '声音 关' : '声音 开';
    soundBtn.setAttribute('aria-pressed', muted ? 'false' : 'true');
  }

  function initSound() {
    var muted = false;
    try {
      muted = window.localStorage.getItem(MUTE_KEY) === '1';
    } catch (e) { /* 忽略 */ }
    if (window.Sfx) window.Sfx.setMuted(muted);
    paintSoundBtn();
  }

  soundBtn.addEventListener('click', function () {
    var next = !(window.Sfx && window.Sfx.isMuted());
    if (window.Sfx) window.Sfx.setMuted(next);
    try {
      window.localStorage.setItem(MUTE_KEY, next ? '1' : '0');
    } catch (e) { /* 忽略 */ }
    paintSoundBtn();
    if (!next) window.Sfx && window.Sfx.pop();
  });

  /* ---------- 交互绑定 ---------- */

  sheet.addEventListener('pointerdown', function (e) {
    pressed = true;
    hideTip();
    if (window.Sfx) window.Sfx.unlock();
    handlePoint(e.clientX, e.clientY);
    e.preventDefault();
  });

  window.addEventListener('pointermove', function (e) {
    if (!pressed) return;
    handlePoint(e.clientX, e.clientY);
  });

  function release() {
    pressed = false;
  }
  window.addEventListener('pointerup', release);
  window.addEventListener('pointercancel', release);
  window.addEventListener('blur', release);

  // 键盘也能玩（空格/回车随便捏一颗）
  window.addEventListener('keydown', function (e) {
    if (e.key !== ' ' && e.key !== 'Enter') return;
    e.preventDefault();
    hideTip();
    if (window.Sfx) window.Sfx.unlock();
    var alive = [];
    for (var i = 0; i < cells.length; i++) {
      if (cells[i].getAttribute('data-popped') === '0') alive.push(cells[i]);
    }
    if (alive.length) popBubble(alive[Math.floor(Math.random() * alive.length)]);
  });

  window.addEventListener('resize', function () {
    window.clearTimeout(rebuildTimer);
    rebuildTimer = window.setTimeout(build, 220);
  });

  /* ---------- 启动 ---------- */

  function boot() {
    initSound();
    total = loadTotal();
    // 历史已达成的里程碑不再重复弹
    while (milestoneIdx < MILESTONES.length && total >= MILESTONES[milestoneIdx].at) {
      milestoneIdx += 1;
    }
    build();
    render();
    window.setTimeout(hideTip, 4200);
  }

  if (document.readyState === 'complete') {
    boot();
  } else {
    window.addEventListener('load', boot);
  }
})();

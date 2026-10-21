/* ===========================================================
   音效：全部用 Web Audio 现场合成
   为什么不用 mp3 —— 免素材、免版权、免加载、离线可用
   =========================================================== */

(function () {
  'use strict';

  var ctx = null;
  var noiseBuf = null;
  var muted = false;

  function ensure() {
    if (ctx) return ctx;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try {
      ctx = new AC();
    } catch (e) {
      return null;
    }
    // 一段 50ms 的衰减白噪声，用来做"啪"的瞬态
    var len = Math.floor(ctx.sampleRate * 0.05);
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    var d = noiseBuf.getChannelData(0);
    for (var i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    }
    return ctx;
  }

  function pop() {
    if (muted) return;
    var ac = ensure();
    if (!ac) return;
    if (ac.state === 'suspended' && ac.resume) ac.resume();

    var t = ac.currentTime;

    // 1) 音高快速下坠的"啵"
    var osc = ac.createOscillator();
    var og = ac.createGain();
    var f0 = 470 + Math.random() * 280;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(f0, t);
    osc.frequency.exponentialRampToValueAtTime(f0 * 0.2, t + 0.07);
    og.gain.setValueAtTime(0.0001, t);
    og.gain.exponentialRampToValueAtTime(0.2, t + 0.004);
    og.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
    osc.connect(og);
    og.connect(ac.destination);
    osc.start(t);
    osc.stop(t + 0.12);

    // 2) 一点噪声，让它更像塑料膜破掉
    if (noiseBuf) {
      var n = ac.createBufferSource();
      n.buffer = noiseBuf;
      var bp = ac.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 1700 + Math.random() * 700;
      bp.Q.value = 0.9;
      var ng = ac.createGain();
      ng.gain.setValueAtTime(0.13, t);
      ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
      n.connect(bp);
      bp.connect(ng);
      ng.connect(ac.destination);
      n.start(t);
      n.stop(t + 0.06);
    }
  }

  function setMuted(v) {
    muted = !!v;
    if (!muted) ensure();
  }

  function isMuted() {
    return muted;
  }

  window.Sfx = { pop: pop, setMuted: setMuted, isMuted: isMuted, unlock: ensure };
})();

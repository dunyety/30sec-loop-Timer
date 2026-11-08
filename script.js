  const DURATION = 30;
  const CIRC = 2 * Math.PI * 100;
  const bar = document.getElementById('bar');
  const timeEl = document.getElementById('time');
  const roundEl = document.getElementById('round');
  const toggle = document.getElementById('toggle');
  const video = document.getElementById('video');

  let remaining = DURATION, round = 1, running = false, lastTick = 0, id = null;

  // Sound: three short beeps when the 30 seconds end
  let audioCtx = null;
  function getCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }
  function beep() {
    try {
      const ctx = getCtx();
      [0, 0.25, 0.5].forEach((delay, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = ctx.currentTime + delay;
        osc.type = 'sine';
        osc.frequency.value = i === 2 ? 1046 : 784;
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.4, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.22);
      });
    } catch (e) {}
  }

  function render() {
    timeEl.textContent = Math.ceil(remaining);
    bar.style.strokeDashoffset = CIRC * (1 - remaining / DURATION);
    roundEl.textContent = round;
  }

  function tick() {
    const now = performance.now();
    remaining -= (now - lastTick) / 1000;
    lastTick = now;
    if (remaining <= 0) { remaining += DURATION; round++; beep(); }
    render();
  }

  function start() {
    running = true; lastTick = performance.now();
    getCtx(); // unlock audio on the Start click
    id = setInterval(tick, 100);
    toggle.textContent = 'Pause';
    if (video.src) video.play().catch(() => {});
  }
  function pause() {
    running = false; clearInterval(id);
    toggle.textContent = 'Start';
    video.pause();
  }

  toggle.onclick = () => running ? pause() : start();
  document.getElementById('reset').onclick = () => {
    pause(); remaining = DURATION; round = 1; render(); video.currentTime = 0;
  };
  document.getElementById('file').onchange = e => {
    const f = e.target.files[0];
    if (!f) return;
    video.src = URL.createObjectURL(f);
    if (running) video.play().catch(() => {});
  };
  render();

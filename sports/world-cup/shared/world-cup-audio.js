(function () {
  const STORAGE_PREFIX = "wcAudio:";
  const timeKey = `${STORAGE_PREFIX}time`;
  const pausedKey = `${STORAGE_PREFIX}paused`;
  const scriptUrl = document.currentScript?.src || new URL("world-cup-audio.js", window.location.href).href;
  const audioUrl = new URL("../assets/america-the-beautiful.mp3", scriptUrl).href;
  const idleLimitMs = 30000;

  let blocked = false;
  let userPaused = sessionStorage.getItem(pausedKey) === "true";
  let idlePaused = false;
  let idleTimer;

  const audio = document.createElement("audio");
  audio.id = "wc-theme-audio";
  audio.src = audioUrl;
  audio.loop = true;
  audio.preload = "auto";
  audio.volume = 0.34;
  audio.muted = false;
  audio.playsInline = true;

  const button = document.createElement("button");
  button.className = "wc-audio-fab";
  button.type = "button";

  function saveTime() {
    if (Number.isFinite(audio.currentTime) && audio.currentTime > 0) {
      localStorage.setItem(timeKey, String(audio.currentTime));
    }
  }

  function restoreTime() {
    const savedTime = Number(localStorage.getItem(timeKey));
    if (!Number.isFinite(savedTime) || savedTime <= 0) return;
    const target = Number.isFinite(audio.duration) && audio.duration > 0
      ? savedTime % audio.duration
      : savedTime;
    try {
      audio.currentTime = target;
    } catch (error) {
      audio.addEventListener("canplay", () => {
        audio.currentTime = target;
      }, { once: true });
    }
  }

  function renderButton() {
    const isPlaying = !audio.paused && !audio.muted;
    const isPaused = userPaused || idlePaused || audio.muted;
    const needsPlay = !isPaused && !isPlaying;
    const label = blocked && !isPaused
      ? "Play theme music"
      : isPaused
        ? "Play theme music"
        : needsPlay
          ? "Play theme music"
          : "Pause theme music";

    button.setAttribute("aria-label", label);
    button.setAttribute("title", label);
    button.classList.toggle("is-muted", isPaused);
    button.classList.toggle("is-blocked", needsPlay);
    button.innerHTML = `
      <span class="wc-audio-icon" aria-hidden="true">${isPaused ? "♪" : isPlaying ? "♫" : "♪"}</span>
      <span class="wc-audio-text">${needsPlay || isPaused ? "Play" : "Music"}</span>
    `;
  }

  async function playTheme() {
    if (userPaused || idlePaused) return;
    try {
      blocked = false;
      audio.muted = false;
      await audio.play();
    } catch (error) {
      blocked = true;
    } finally {
      renderButton();
    }
  }

  function pauseTheme() {
    userPaused = true;
    idlePaused = false;
    sessionStorage.setItem(pausedKey, "true");
    audio.pause();
    saveTime();
    renderButton();
  }

  function resumeTheme() {
    userPaused = false;
    idlePaused = false;
    sessionStorage.setItem(pausedKey, "false");
    audio.muted = false;
    playTheme();
    renderButton();
  }

  button.addEventListener("click", () => {
    if (userPaused || idlePaused || audio.muted || blocked || audio.paused) {
      resumeTheme();
    } else {
      pauseTheme();
    }
  });

  function pauseForIdle() {
    if (userPaused || audio.paused) return;
    idlePaused = true;
    audio.pause();
    saveTime();
    renderButton();
  }

  function resetIdleTimer() {
    window.clearTimeout(idleTimer);
    idleTimer = window.setTimeout(pauseForIdle, idleLimitMs);
  }

  ["pointerdown", "pointermove", "keydown", "scroll", "touchstart"].forEach((eventName) => {
    document.addEventListener(eventName, (event) => {
      if (event.target?.closest?.(".wc-audio-fab")) {
        resetIdleTimer();
        return;
      }
      resetIdleTimer();
    }, { passive: true });
  });
  window.addEventListener("pageshow", () => {
    resetIdleTimer();
  });

  audio.addEventListener("loadedmetadata", restoreTime, { once: true });
  audio.addEventListener("play", renderButton);
  audio.addEventListener("pause", renderButton);
  audio.addEventListener("volumechange", renderButton);
  window.addEventListener("pagehide", saveTime);
  window.addEventListener("beforeunload", saveTime);
  setInterval(saveTime, 750);

  document.body.append(audio, button);
  restoreTime();
  renderButton();
  resetIdleTimer();
})();

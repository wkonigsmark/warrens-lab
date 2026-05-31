(function () {
  const STORAGE_PREFIX = "wcAudio:";
  const mutedKey = `${STORAGE_PREFIX}muted`;
  const timeKey = `${STORAGE_PREFIX}time`;
  const enabledKey = `${STORAGE_PREFIX}enabled`;
  const scriptUrl = document.currentScript?.src || new URL("world-cup-audio.js", window.location.href).href;
  const audioUrl = new URL("../assets/america-the-beautiful.mp3", scriptUrl).href;
  const savedMuted = localStorage.getItem(mutedKey) === "true";
  const savedEnabled = localStorage.getItem(enabledKey);

  let blocked = false;
  let hasTriedGestureStart = false;

  const audio = document.createElement("audio");
  audio.id = "wc-theme-audio";
  audio.src = audioUrl;
  audio.loop = true;
  audio.preload = "auto";
  audio.volume = 0.34;
  audio.muted = savedMuted;
  audio.playsInline = true;

  const button = document.createElement("button");
  button.className = "wc-audio-fab";
  button.type = "button";

  function wantsMusic() {
    return localStorage.getItem(enabledKey) !== "false";
  }

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
    const isMuted = audio.muted || localStorage.getItem(enabledKey) === "false";
    const label = blocked && !isMuted
      ? "Play theme music"
      : isMuted
        ? "Unmute theme music"
        : "Mute theme music";

    button.setAttribute("aria-label", label);
    button.setAttribute("title", label);
    button.classList.toggle("is-muted", isMuted);
    button.classList.toggle("is-blocked", blocked && !isMuted);
    button.innerHTML = `
      <span class="wc-audio-icon" aria-hidden="true">${isMuted ? "♪" : isPlaying ? "♫" : "♪"}</span>
      <span class="wc-audio-text">${blocked && !isMuted ? "Play" : isMuted ? "Muted" : "Music"}</span>
    `;
  }

  async function playTheme() {
    if (!wantsMusic()) return;
    try {
      blocked = false;
      await audio.play();
    } catch (error) {
      blocked = true;
    } finally {
      renderButton();
    }
  }

  function muteTheme() {
    audio.muted = true;
    localStorage.setItem(mutedKey, "true");
    localStorage.setItem(enabledKey, "false");
    saveTime();
    renderButton();
  }

  function unmuteTheme() {
    audio.muted = false;
    localStorage.setItem(mutedKey, "false");
    localStorage.setItem(enabledKey, "true");
    playTheme();
    renderButton();
  }

  button.addEventListener("click", () => {
    if (audio.muted || localStorage.getItem(enabledKey) === "false" || blocked) {
      unmuteTheme();
    } else {
      muteTheme();
    }
  });

  document.addEventListener("pointerdown", () => {
    if (hasTriedGestureStart || audio.muted || localStorage.getItem(enabledKey) === "false") return;
    hasTriedGestureStart = true;
    playTheme();
  }, { once: true, passive: true });

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
  playTheme();
})();

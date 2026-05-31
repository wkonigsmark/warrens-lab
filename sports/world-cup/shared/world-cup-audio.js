(function () {
  const STORAGE_PREFIX = "wcAudio:";
  const mutedKey = `${STORAGE_PREFIX}muted`;
  const timeKey = `${STORAGE_PREFIX}time`;
  const enabledKey = `${STORAGE_PREFIX}enabled`;
  const scriptUrl = document.currentScript?.src || new URL("world-cup-audio.js", window.location.href).href;
  const audioUrl = new URL("../assets/america-the-beautiful.mp3", scriptUrl).href;
  const savedMuted = localStorage.getItem(mutedKey) === "true";

  let blocked = false;

  const audio = document.createElement("audio");
  audio.id = "wc-theme-audio";
  audio.src = audioUrl;
  audio.autoplay = true;
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
    const needsPlay = !isMuted && !isPlaying;
    const label = blocked && !isMuted
      ? "Play theme music"
      : isMuted
        ? "Unmute theme music"
        : needsPlay
          ? "Play theme music"
          : "Mute theme music";

    button.setAttribute("aria-label", label);
    button.setAttribute("title", label);
    button.classList.toggle("is-muted", isMuted);
    button.classList.toggle("is-blocked", needsPlay);
    button.innerHTML = `
      <span class="wc-audio-icon" aria-hidden="true">${isMuted ? "♪" : isPlaying ? "♫" : "♪"}</span>
      <span class="wc-audio-text">${needsPlay ? "Play" : isMuted ? "Muted" : "Music"}</span>
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
    if (audio.muted || localStorage.getItem(enabledKey) === "false" || blocked || audio.paused) {
      unmuteTheme();
    } else {
      muteTheme();
    }
  });

  function startFromGesture() {
    if (audio.muted || localStorage.getItem(enabledKey) === "false" || !audio.paused) return;
    playTheme();
  }

  document.addEventListener("pointerdown", startFromGesture, { passive: true });
  document.addEventListener("keydown", startFromGesture);
  window.addEventListener("pageshow", () => {
    if (!audio.muted && wantsMusic() && audio.paused) playTheme();
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
  playTheme();
})();

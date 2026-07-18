const readerState = {
  data: null,
  details: { sceneDetails: {} },
  assets: [],
  scenes: [],
  currentIndex: 0
};

const readerElements = {
  shell: document.querySelector("#reader-shell"),
  count: document.querySelector("#reader-count"),
  prev: document.querySelector("#prev-scene"),
  next: document.querySelector("#next-scene"),
  tocButton: document.querySelector("#toc-button"),
  tocPanel: document.querySelector("#toc-panel"),
  tocClose: document.querySelector("#toc-close"),
  tocList: document.querySelector("#toc-list")
};

async function fetchJson(path, fallback) {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      return fallback;
    }
    return response.json();
  } catch (error) {
    return fallback;
  }
}

function buildSceneOrder(data) {
  const scenesById = new Map(data.scenes.map((scene) => [scene.id, scene]));
  return data.storyOutlineOrder
    .map((entry) => {
      const scene = scenesById.get(entry.sceneId);
      if (!scene) {
        return null;
      }
      return {
        ...scene,
        outlinePosition: entry.position,
        timelineNote: entry.timelineNote
      };
    })
    .filter(Boolean);
}

function getPrimaryArt(sceneId) {
  return readerState.assets.find((asset) => asset.variant === "color" && asset.sceneIds.includes(sceneId))
    ?? readerState.assets.find((asset) => asset.sceneIds.includes(sceneId));
}

function renderReader() {
  const scene = readerState.scenes[readerState.currentIndex];
  if (!scene) {
    readerElements.shell.innerHTML = `
      <section class="loading-card">
        <p>No scenes are available yet.</p>
      </section>
    `;
    return;
  }

  const art = getPrimaryArt(scene.id);
  const readSummary = readerState.details.sceneDetails[scene.id] ?? scene.summary;
  const total = readerState.scenes.length;
  const fleetState = getFleetState(scene.fleetStateId);
  const briefing = getSceneBriefing(scene.id);
  const timeAway = getTimeAwayEstimate(scene.id);
  const storybookDraft = getStorybookDraft(scene.id);

  document.title = `${scene.outlinePosition}. ${scene.title} - Odyssey Reader`;
  readerElements.count.textContent = `${scene.outlinePosition} of ${total}`;
  readerElements.prev.disabled = readerState.currentIndex === 0;
  readerElements.next.disabled = readerState.currentIndex === total - 1;

  readerElements.shell.innerHTML = `
    <article class="reader-card">
      ${renderArt(art)}
      <div class="scene-body">
        <p class="eyebrow">Scene ${scene.outlinePosition} of ${total}</p>
        <h1>${escapeHtml(scene.title)}</h1>
        <p class="short-summary">${escapeHtml(scene.summary)}</p>
        ${renderTimeAway(timeAway)}
        ${renderSceneBriefing(briefing)}
        ${renderStorybookDraft(scene.id)}
        ${storybookDraft ? "" : `<p class="read-summary">${escapeHtml(readSummary)}</p>`}
        ${renderFleetState(fleetState)}
        <div class="scene-meta">
          <span class="tag scary">Scariness ${scene.scarinessLevel}/5</span>
          <span class="tag">${escapeHtml(scene.locationBucket)}</span>
          <span class="tag">${escapeHtml(scene.timelineNote)}</span>
        </div>
      </div>
    </article>
  `;

  renderToc();
  window.location.hash = `scene-${scene.outlinePosition}`;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function getSceneBriefing(sceneId) {
  return readerState.details.sceneBriefings?.[sceneId] ?? null;
}

function getTimeAwayEstimate(sceneId) {
  return readerState.details.timeAwayEstimates?.[sceneId] ?? null;
}

function getStorybookDraft(sceneId) {
  return readerState.details.storybookDrafts?.[sceneId] ?? null;
}

function renderStorybookDraft(sceneId) {
  const draft = getStorybookDraft(sceneId);
  if (!draft) {
    return "";
  }

  const paragraphs = draft.readAloud?.length
    ? draft.readAloud.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")
    : "";

  const dialogue = draft.dialogueBeats?.length
    ? draft.dialogueBeats
        .map(
          (beat) => `
            <li>
              <strong>${escapeHtml(beat.speaker)}</strong>
              <span>${escapeHtml(beat.line)}</span>
            </li>
          `
        )
        .join("")
    : "";

  const themes = draft.themesForKids?.length
    ? draft.themesForKids.map((item) => `<li>${escapeHtml(item)}</li>`).join("")
    : "";

  return `
    <section class="storybook-draft" aria-label="Storybook draft">
      <p class="fleet-label">Storybook Draft</p>
      <h2>${escapeHtml(draft.readAloudTitle ?? "Chapter Draft")}</h2>
      <div class="draft-prose">${paragraphs}</div>
      ${dialogue ? `<div class="draft-notes"><h3>Dialogue</h3><ul class="dialogue-list">${dialogue}</ul></div>` : ""}
      ${themes ? `<div class="draft-notes"><h3>Themes</h3><ul>${themes}</ul></div>` : ""}
      ${draft.parentNote ? `<div class="draft-notes parent-note"><h3>Parent Note</h3><p>${escapeHtml(draft.parentNote)}</p></div>` : ""}
    </section>
  `;
}

function renderTimeAway(timeAway) {
  if (!timeAway) {
    return "";
  }

  return `
    <section class="time-away-card" aria-label="Time away from family">
      <p class="fleet-label">Time Away From Family</p>
      <div class="time-away-values">
        <span><strong>Start</strong>${escapeHtml(timeAway.start)}</span>
        <span><strong>End</strong>${escapeHtml(timeAway.end)}</span>
      </div>
      <p>${escapeHtml(timeAway.note)}</p>
    </section>
  `;
}

function renderSceneBriefing(briefing) {
  if (!briefing) {
    return "";
  }

  const livingCrew = briefing.livingCrew?.length
    ? briefing.livingCrew.map((name) => `<li class="tag">${escapeHtml(name)}</li>`).join("")
    : `<li class="tag quiet">No crew present</li>`;

  const featured = briefing.featuredCharacters?.length
    ? briefing.featuredCharacters.map((name) => `<li class="tag">${escapeHtml(name)}</li>`).join("")
    : "";

  return `
    <section class="chapter-briefing" aria-label="Chapter briefing">
      <h2>Chapter Briefing</h2>
      <div class="briefing-group">
        <h3>Named Crew Alive</h3>
        <ul>${livingCrew}</ul>
      </div>
      <div class="briefing-group">
        <h3>Characters This Scene</h3>
        <ul>${featured}</ul>
      </div>
      <p><strong>Risk:</strong> ${escapeHtml(briefing.namedCrewAtRisk)}</p>
      <p><strong>Scene losses:</strong> ${escapeHtml(briefing.sceneLosses)}</p>
      <p><strong>End state:</strong> ${escapeHtml(briefing.endState)}</p>
    </section>
  `;
}

function getFleetState(fleetStateId) {
  if (!fleetStateId) {
    return null;
  }
  return readerState.data.fleetStates?.find((entry) => entry.id === fleetStateId) ?? null;
}

function renderFleetState(fleetState) {
  if (!fleetState) {
    return "";
  }

  const shipUnits = Math.max(0, Math.min(12, fleetState.ships));
  const shipIcons = Array.from({ length: 12 }, (_, index) => {
    const activeClass = index < shipUnits ? "active" : "";
    return `<span class="fleet-ship ${activeClass}" aria-hidden="true"></span>`;
  }).join("");

  return `
    <section class="fleet-card" aria-label="Fleet counter">
      <p class="fleet-label">Fleet Counter</p>
      <strong>${escapeHtml(fleetState.display)}</strong>
      <span>${escapeHtml(fleetState.note)}</span>
      <div class="fleet-visual" title="${escapeAttribute(fleetState.certainty)}">
        ${shipIcons}
      </div>
    </section>
  `;
}

function renderArt(art) {
  if (!art) {
    return `<div class="scene-art empty">Art needed</div>`;
  }

  return `
    <figure class="scene-art">
      <img src="${escapeAttribute(art.file)}" alt="${escapeAttribute(art.alt)}">
    </figure>
  `;
}

function renderToc() {
  readerElements.tocList.innerHTML = readerState.scenes
    .map(
      (scene, index) => `
        <li>
          <button type="button" data-index="${index}" aria-current="${index === readerState.currentIndex ? "true" : "false"}">
            <b>${scene.outlinePosition}</b>
            <span>
              <b>${escapeHtml(scene.title)}</b>
              <span>${escapeHtml(scene.locationBucket)}</span>
            </span>
          </button>
        </li>
      `
    )
    .join("");

  readerElements.tocList.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      readerState.currentIndex = Number(button.dataset.index);
      closeToc();
      renderReader();
    });
  });
}

function goToOffset(offset) {
  const nextIndex = readerState.currentIndex + offset;
  if (nextIndex < 0 || nextIndex >= readerState.scenes.length) {
    return;
  }
  readerState.currentIndex = nextIndex;
  renderReader();
}

function openToc() {
  readerElements.tocPanel.hidden = false;
  readerElements.tocButton.setAttribute("aria-expanded", "true");
}

function closeToc() {
  readerElements.tocPanel.hidden = true;
  readerElements.tocButton.setAttribute("aria-expanded", "false");
}

function hydrateIndexFromHash() {
  const match = window.location.hash.match(/scene-(\d+)/);
  if (!match) {
    return;
  }

  const position = Number(match[1]);
  const foundIndex = readerState.scenes.findIndex((scene) => scene.outlinePosition === position);
  if (foundIndex >= 0) {
    readerState.currentIndex = foundIndex;
  }
}

function bindEvents() {
  readerElements.prev.addEventListener("click", () => goToOffset(-1));
  readerElements.next.addEventListener("click", () => goToOffset(1));
  readerElements.tocButton.addEventListener("click", () => {
    if (readerElements.tocPanel.hidden) {
      openToc();
    } else {
      closeToc();
    }
  });
  readerElements.tocClose.addEventListener("click", closeToc);

  document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      goToOffset(-1);
    }
    if (event.key === "ArrowRight") {
      goToOffset(1);
    }
    if (event.key === "Escape") {
      closeToc();
    }
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}

Promise.all([
  fetchJson("story-data.json", { scenes: [], storyOutlineOrder: [] }),
  fetchJson("story-details.json", { sceneDetails: {} }),
  fetchJson("assets-index.json", { assets: [] })
]).then(([data, details, assetIndex]) => {
  readerState.data = data;
  readerState.details = details;
  readerState.assets = assetIndex.assets ?? [];
  readerState.scenes = buildSceneOrder(data);
  hydrateIndexFromHash();
  bindEvents();
  renderReader();
});

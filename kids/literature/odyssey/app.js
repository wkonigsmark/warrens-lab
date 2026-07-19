const state = {
  data: null,
  assets: [],
  details: {
    sceneDetails: {},
    journeyDetails: {}
  },
  selectedSceneId: null,
  search: "",
  maxScariness: 5,
  bucket: "all",
  coloringSearch: "",
  selectedColoringAssetId: null
};

const fallbackGlossary = [
  {
    title: "Odysseus",
    text: "King of Ithaca: brilliant, brave, proud, tricky, loving, and complicated."
  },
  {
    title: "Penelope",
    text: "Odysseus' wife, who protects the household with patience and intelligence."
  },
  {
    title: "Telemachus",
    text: "The son of Odysseus and Penelope, learning how to act with courage."
  },
  {
    title: "Athena",
    text: "Goddess of wisdom and strategy, often helping while disguised."
  },
  {
    title: "Poseidon",
    text: "God of the sea, whose anger makes Odysseus' journey much harder."
  },
  {
    title: "Hospitality",
    text: "The ancient rule that guests and strangers should be treated with respect."
  }
];

const elements = {
  sceneCount: document.querySelector("#scene-count"),
  assetCount: document.querySelector("#asset-count"),
  sceneList: document.querySelector("#scene-list"),
  sceneDetail: document.querySelector("#scene-detail"),
  search: document.querySelector("#scene-search"),
  scariness: document.querySelector("#scariness-filter"),
  scarinessOutput: document.querySelector("#scariness-output"),
  bucket: document.querySelector("#bucket-filter"),
  reset: document.querySelector("#reset-filters"),
  resultCount: document.querySelector("#result-count"),
  journey: document.querySelector("#journey-strip"),
  glossary: document.querySelector("#glossary-grid"),
  openColoring: document.querySelector("#open-coloring-modal"),
  coloringModal: document.querySelector("#coloring-modal"),
  closeColoring: document.querySelector("#close-coloring-modal"),
  printColoring: document.querySelector("#print-coloring-template"),
  coloringSearch: document.querySelector("#coloring-search"),
  coloringResultCount: document.querySelector("#coloring-result-count"),
  coloringResults: document.querySelector("#coloring-results"),
  coloringPreview: document.querySelector("#coloring-preview")
};

async function loadStoryData() {
  try {
    const response = await fetch("story-data.json");
    if (!response.ok) {
      throw new Error(`Unable to load story data: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    elements.sceneDetail.innerHTML = `
      <div class="empty-state">
        <strong>Story data could not load.</strong>
        <p>Open this page through a local web server so it can read story-data.json.</p>
      </div>
    `;
    throw error;
  }
}

async function loadAssetsIndex() {
  try {
    const response = await fetch("assets-index.json");
    if (!response.ok) {
      return { assets: [] };
    }
    return response.json();
  } catch (error) {
    return { assets: [] };
  }
}

async function loadStoryDetails() {
  try {
    const response = await fetch("story-details.json");
    if (!response.ok) {
      return { sceneDetails: {}, journeyDetails: {} };
    }
    return response.json();
  } catch (error) {
    return { sceneDetails: {}, journeyDetails: {} };
  }
}

function initControls() {
  const buckets = [...new Set(state.data.scenes.map((scene) => scene.locationBucket))];
  buckets.forEach((bucket) => {
    const option = document.createElement("option");
    option.value = bucket;
    option.textContent = bucket;
    elements.bucket.append(option);
  });

  elements.search.addEventListener("input", (event) => {
    state.search = event.target.value.trim().toLowerCase();
    render();
  });

  elements.scariness.addEventListener("input", (event) => {
    state.maxScariness = Number(event.target.value);
    elements.scarinessOutput.textContent = state.maxScariness;
    render();
  });

  elements.bucket.addEventListener("change", (event) => {
    state.bucket = event.target.value;
    render();
  });

  elements.reset.addEventListener("click", () => {
    state.search = "";
    state.maxScariness = 5;
    state.bucket = "all";
    elements.search.value = "";
    elements.scariness.value = "5";
    elements.scarinessOutput.textContent = "5";
    elements.bucket.value = "all";
    render();
  });

  elements.openColoring.addEventListener("click", openColoringModal);
  elements.closeColoring.addEventListener("click", closeColoringModal);
  elements.coloringModal.addEventListener("click", (event) => {
    if (event.target === elements.coloringModal) {
      closeColoringModal();
    }
  });
  elements.coloringSearch.addEventListener("input", (event) => {
    state.coloringSearch = event.target.value.trim().toLowerCase();
    renderColoringLibrary();
  });
  elements.printColoring.addEventListener("click", printSelectedColoringTemplate);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !elements.coloringModal.hidden) {
      closeColoringModal();
    }
  });
}

function getFilteredScenes() {
  return getStoryOutlineScenes().filter((scene) => {
    const searchTarget = [
      scene.title,
      scene.summary,
      state.details.sceneDetails[scene.id] ?? "",
      scene.locationNode,
      scene.locationBucket,
      ...scene.characters,
      ...scene.themes
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch = !state.search || searchTarget.includes(state.search);
    const matchesScariness = scene.scarinessLevel <= state.maxScariness;
    const matchesBucket = state.bucket === "all" || scene.locationBucket === state.bucket;

    return matchesSearch && matchesScariness && matchesBucket;
  });
}

function getStoryOutlineScenes() {
  if (!state.data.storyOutlineOrder) {
    return [...state.data.scenes].sort((a, b) => a.order - b.order);
  }

  const scenesById = new Map(state.data.scenes.map((scene) => [scene.id, scene]));
  return state.data.storyOutlineOrder
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

function selectScene(sceneId) {
  state.selectedSceneId = sceneId;
  render();
}

function render() {
  const scenes = getFilteredScenes();
  if (!scenes.some((scene) => scene.id === state.selectedSceneId)) {
    state.selectedSceneId = scenes[0]?.id ?? getStoryOutlineScenes()[0].id;
  }

  renderSceneList(scenes);
  renderSceneDetail(state.data.scenes.find((scene) => scene.id === state.selectedSceneId));
  renderJourney();
  elements.resultCount.textContent = `${scenes.length} of ${state.data.scenes.length} scenes shown in chronology`;
}

function renderSceneList(scenes) {
  elements.sceneList.innerHTML = "";

  if (!scenes.length) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = "No scenes match those filters yet.";
    elements.sceneList.append(empty);
    return;
  }

  scenes.forEach((scene) => {
    const art = getPrimarySceneArt(scene.id);
    const item = document.createElement("li");
    const button = document.createElement("button");
    button.className = "scene-button";
    button.type = "button";
    button.setAttribute("aria-current", scene.id === state.selectedSceneId ? "true" : "false");
    button.addEventListener("click", () => selectScene(scene.id));
    button.innerHTML = `
      <span class="scene-number">${scene.outlinePosition ?? scene.order}</span>
      <span>
        <h3>${escapeHtml(scene.title)}</h3>
        <p>${escapeHtml(scene.summary)}</p>
      </span>
      ${renderSceneThumb(art)}
    `;
    item.append(button);
    elements.sceneList.append(item);
  });
}

function renderSceneDetail(scene) {
  if (!scene) {
    elements.sceneDetail.innerHTML = `<div class="empty-state">Choose a scene from the outline.</div>`;
    return;
  }

  const orderedScene = getStoryOutlineScenes().find((entry) => entry.id === scene.id) ?? scene;
  const location = state.data.locationNodes.find((node) => node.id === scene.locationNode);
  const art = getPrimarySceneArt(scene.id);
  const video = getPrimarySceneVideo(scene.id);
  const fleetState = getFleetState(scene.fleetStateId);
  const briefing = getSceneBriefing(scene.id);
  const timeAway = getTimeAwayEstimate(scene.id);

  elements.sceneDetail.innerHTML = `
    <p class="eyebrow">Chronology ${orderedScene.outlinePosition ?? scene.order}</p>
    <h3>${escapeHtml(scene.title)}</h3>
    <p class="scene-summary">${escapeHtml(scene.summary)}</p>
    ${renderTimeAway(timeAway)}
    ${renderSceneBriefing(briefing)}
    ${renderSceneVideo(video)}
    ${renderStorybookDraft(scene.id)}
    ${renderExpandedSummary(scene)}
    ${renderSceneArt(art)}
    ${renderFleetState(fleetState)}
    <div class="scene-meta">
      <span class="tag scary">Scariness ${scene.scarinessLevel}/5</span>
      <span class="tag map">${escapeHtml(scene.locationBucket)}</span>
      <span class="tag">${escapeHtml(location?.label ?? scene.locationNode)}</span>
    </div>
    <div class="detail-grid">
      <div class="detail-block">
        <h4>Timeline Note</h4>
        <p class="location-note">${escapeHtml(orderedScene.timelineNote ?? "Timeline note needed.")}</p>
      </div>
      <div class="detail-block">
        <h4>Characters</h4>
        <ul>${scene.characters.map((character) => `<li class="tag">${escapeHtml(character)}</li>`).join("")}</ul>
      </div>
      <div class="detail-block">
        <h4>Themes</h4>
        <ul>${scene.themes.map((theme) => `<li class="tag">${escapeHtml(theme)}</li>`).join("")}</ul>
      </div>
      <div class="detail-block">
        <h4>Location Node</h4>
        <p class="location-note">${escapeHtml(scene.locationNode)}</p>
      </div>
      <div class="detail-block">
        <h4>Parent Map Note</h4>
        <p class="location-note">${escapeHtml(location?.parentGeographyNote ?? "Map note needed.")}</p>
      </div>
    </div>
  `;
}

function getSceneBriefing(sceneId) {
  return state.details.sceneBriefings?.[sceneId] ?? null;
}

function getTimeAwayEstimate(sceneId) {
  return state.details.timeAwayEstimates?.[sceneId] ?? null;
}

function getStorybookDraft(sceneId) {
  return state.details.storybookDrafts?.[sceneId] ?? null;
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
              <strong>${escapeHtml(beat.speaker)}:</strong>
              <span>${escapeHtml(beat.line)}</span>
              <em>${escapeHtml(beat.purpose)}</em>
            </li>
          `
        )
        .join("")
    : "";

  const sensoryColor = draft.sensoryColor?.length
    ? draft.sensoryColor.map((item) => `<li>${escapeHtml(item)}</li>`).join("")
    : "";

  const themes = draft.themesForKids?.length
    ? draft.themesForKids.map((item) => `<li>${escapeHtml(item)}</li>`).join("")
    : "";

  return `
    <section class="storybook-draft" aria-label="Storybook draft">
      <div class="draft-head">
        <div>
          <p class="eyebrow">Storybook Draft</p>
          <h4>${escapeHtml(draft.readAloudTitle ?? "Chapter Draft")}</h4>
        </div>
        <span class="tag">${escapeHtml(draft.status ?? "draft")}</span>
      </div>
      <div class="draft-prose">${paragraphs}</div>
      <div class="draft-grid">
        ${dialogue ? `<div><h5>Dialogue Beats</h5><ul class="dialogue-list">${dialogue}</ul></div>` : ""}
        ${sensoryColor ? `<div><h5>Sensory Color</h5><ul>${sensoryColor}</ul></div>` : ""}
        ${themes ? `<div><h5>Themes For Kids</h5><ul>${themes}</ul></div>` : ""}
        ${draft.parentNote ? `<div><h5>Parent Note</h5><p>${escapeHtml(draft.parentNote)}</p></div>` : ""}
      </div>
    </section>
  `;
}

function renderTimeAway(timeAway) {
  if (!timeAway) {
    return "";
  }

  return `
    <section class="time-away-card" aria-label="Time away from family">
      <p class="eyebrow">Time Away From Family</p>
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
      <div class="briefing-row">
        <div>
          <h4>Named Crew Alive</h4>
          <ul>${livingCrew}</ul>
        </div>
        <div>
          <h4>Characters This Scene</h4>
          <ul>${featured}</ul>
        </div>
      </div>
      <div class="briefing-notes">
        <p><strong>Risk:</strong> ${escapeHtml(briefing.namedCrewAtRisk)}</p>
        <p><strong>Scene losses:</strong> ${escapeHtml(briefing.sceneLosses)}</p>
        <p><strong>End state:</strong> ${escapeHtml(briefing.endState)}</p>
      </div>
    </section>
  `;
}

function getFleetState(fleetStateId) {
  if (!fleetStateId) {
    return null;
  }
  return state.data.fleetStates?.find((entry) => entry.id === fleetStateId) ?? null;
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
      <div>
        <p class="eyebrow">Fleet Counter</p>
        <h4>${escapeHtml(fleetState.display)}</h4>
        <p>${escapeHtml(fleetState.note)}</p>
      </div>
      <div class="fleet-visual" title="${escapeAttribute(fleetState.certainty)}">
        ${shipIcons}
      </div>
    </section>
  `;
}

function renderExpandedSummary(scene) {
  const detail = state.details.sceneDetails[scene.id];
  if (!detail) {
    return "";
  }

  return `
    <div class="story-detail">
      <h4>Read-Through Summary</h4>
      <p>${escapeHtml(detail)}</p>
    </div>
  `;
}

function getPrimarySceneArt(sceneId) {
  return state.assets.find((asset) => asset.type !== "video" && asset.variant === "color" && asset.sceneIds.includes(sceneId))
    ?? state.assets.find((asset) => asset.type !== "video" && asset.sceneIds.includes(sceneId));
}

function getPrimarySceneVideo(sceneId) {
  return state.assets.find((asset) => asset.type === "video" && asset.sceneIds.includes(sceneId)) ?? null;
}

function renderSceneThumb(art) {
  if (!art) {
    return `<span class="scene-thumb placeholder" aria-hidden="true">art</span>`;
  }

  return `<img class="scene-thumb" src="${escapeAttribute(art.file)}" alt="">`;
}

function renderSceneArt(art) {
  if (!art) {
    return "";
  }

  return `
    <figure class="scene-art">
      <img src="${escapeAttribute(art.file)}" alt="${escapeAttribute(art.alt)}">
      <figcaption>${escapeHtml(art.notes)} <strong>${escapeHtml(art.variant)}</strong> reference.</figcaption>
    </figure>
  `;
}

function renderSceneVideo(video) {
  if (!video) {
    return "";
  }

  return `
    <figure class="scene-art scene-motion">
      <video src="${escapeAttribute(video.file)}" aria-label="${escapeAttribute(video.alt)}" autoplay muted loop playsinline controls preload="metadata"></video>
      <figcaption>${escapeHtml(video.notes)} <strong>motion</strong> reference.</figcaption>
    </figure>
  `;
}

function renderJourney() {
  const route = state.data.journeySequence ?? buildJourneyFromSceneOrder();

  elements.journey.innerHTML = route
    .map(
      (stop) => `
        <button
          class="journey-node"
          type="button"
          data-location="${escapeAttribute(stop.locationNode)}"
          data-scene="${escapeAttribute(stop.relatedSceneIds?.[0] ?? "")}"
        >
          <span>${stop.chronologyOrder}. ${escapeHtml(stop.bucket)}</span>
          <strong>${escapeHtml(stop.label)}</strong>
          <span>${escapeHtml(stop.event)}</span>
          <em>${escapeHtml(getJourneyDetail(stop) ?? stop.sequenceNote)}</em>
        </button>
      `
    )
    .join("");

  elements.journey.querySelectorAll(".journey-node").forEach((button) => {
    button.addEventListener("click", () => {
      state.bucket = "all";
      elements.bucket.value = "all";
      if (button.dataset.scene) {
        state.search = "";
        elements.search.value = "";
        state.selectedSceneId = button.dataset.scene;
      } else {
        state.search = button.dataset.location;
        elements.search.value = button.dataset.location;
      }
      render();
      document.querySelector("#outline").scrollIntoView({ behavior: "smooth" });
    });
  });
}

function getJourneyDetail(stop) {
  return state.details.journeyDetails[`${stop.chronologyOrder}:${stop.locationNode}`]
    ?? state.details.journeyDetails[stop.locationNode];
}

function buildJourneyFromSceneOrder() {
  const seen = new Set();
  return state.data.scenes
    .map((scene) => state.data.locationNodes.find((node) => node.id === scene.locationNode))
    .filter(Boolean)
    .filter((node) => {
      if (seen.has(node.id)) {
        return false;
      }
      seen.add(node.id);
      return true;
    })
    .map((node, index) => ({
      chronologyOrder: index + 1,
      locationNode: node.id,
      label: node.label,
      event: node.parentGeographyNote,
      bucket: node.bucket,
      relatedSceneIds: [],
      sequenceNote: "Generated from current reading order."
    }));
}

function renderGlossaryPreview() {
  const entries = state.data.glossaryEntries?.length ? state.data.glossaryEntries : fallbackGlossary;

  elements.glossary.innerHTML = entries
    .map(
      (entry) => `
        <article class="glossary-card">
          ${renderGlossaryImage(entry)}
          <h3>${escapeHtml(entry.title)}</h3>
          ${renderGlossaryTags(entry)}
          <p>${escapeHtml(entry.text)}</p>
        </article>
      `
    )
    .join("");
}

function renderGlossaryImage(entry) {
  const art = getPrimaryGlossaryArt(entry);
  if (!art) {
    return "";
  }

  return `
    <figure class="glossary-art">
      <img src="${escapeAttribute(art.file)}" alt="${escapeAttribute(art.alt)}">
    </figure>
  `;
}

function getPrimaryGlossaryArt(entry) {
  return state.assets.find((asset) => asset.variant === "color" && asset.glossaryIds?.includes(entry.id))
    ?? state.assets.find((asset) => asset.glossaryIds?.includes(entry.id))
    ?? null;
}

function renderGlossaryTags(entry) {
  if (!entry.tags?.length) {
    return "";
  }

  return `
    <div class="glossary-tags">
      ${entry.tags.map((tag) => `<span class="tag tiny">${escapeHtml(tag)}</span>`).join("")}
    </div>
  `;
}

function openColoringModal() {
  const templates = getColoringTemplates();
  if (!state.selectedColoringAssetId && templates.length) {
    state.selectedColoringAssetId = templates[0].id;
  }
  elements.coloringModal.hidden = false;
  document.body.classList.add("modal-open");
  renderColoringLibrary();
  elements.coloringSearch.focus();
}

function closeColoringModal() {
  elements.coloringModal.hidden = true;
  document.body.classList.remove("modal-open");
  document.body.classList.remove("printing-coloring");
  elements.openColoring.focus();
}

function getColoringTemplates() {
  return state.assets.filter((asset) => asset.type !== "video" && asset.variant === "black-and-white");
}

function getFilteredColoringTemplates() {
  const templates = getColoringTemplates();
  if (!state.coloringSearch) {
    return templates;
  }

  return templates.filter((asset) => getColoringSearchText(asset).includes(state.coloringSearch));
}

function getColoringSearchText(asset) {
  const scenes = getAssetScenes(asset);
  const locations = getAssetLocations(asset);
  const glossaryEntries = getAssetGlossaryEntries(asset);
  return [
    asset.id,
    asset.file,
    asset.alt,
    asset.notes,
    ...(asset.subjects ?? []),
    ...scenes.map((scene) => scene.title),
    ...scenes.flatMap((scene) => [...scene.characters, ...scene.themes, scene.locationBucket]),
    ...locations.map((location) => location.label),
    ...locations.map((location) => location.parentGeographyNote),
    ...glossaryEntries.map((entry) => entry.title),
    ...glossaryEntries.flatMap((entry) => entry.tags ?? [])
  ]
    .join(" ")
    .toLowerCase();
}

function renderColoringLibrary() {
  const templates = getFilteredColoringTemplates();
  const allTemplates = getColoringTemplates();

  elements.coloringResultCount.textContent = `${templates.length} of ${allTemplates.length} templates`;

  if (!templates.length) {
    elements.coloringResults.innerHTML = `<div class="empty-state">No coloring templates match that search yet.</div>`;
    elements.coloringPreview.innerHTML = `<div class="empty-state">Try another character, scene, location, or theme.</div>`;
    return;
  }

  if (!templates.some((asset) => asset.id === state.selectedColoringAssetId)) {
    state.selectedColoringAssetId = templates[0].id;
  }

  elements.coloringResults.innerHTML = templates
    .map((asset) => renderColoringResult(asset))
    .join("");

  elements.coloringResults.querySelectorAll(".coloring-card").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedColoringAssetId = button.dataset.assetId;
      renderColoringLibrary();
    });
  });

  renderColoringPreview(templates.find((asset) => asset.id === state.selectedColoringAssetId));
}

function renderColoringResult(asset) {
  const title = getColoringTitle(asset);
  const tags = getColoringTags(asset).slice(0, 5);

  return `
    <button class="coloring-card" type="button" data-asset-id="${escapeAttribute(asset.id)}" aria-current="${asset.id === state.selectedColoringAssetId ? "true" : "false"}">
      <img src="${escapeAttribute(asset.file)}" alt="">
      <span class="coloring-card-copy">
        <strong>${escapeHtml(title)}</strong>
        <em>${escapeHtml(getAssetScenes(asset)[0]?.title ?? "Glossary art")}</em>
        <span class="coloring-tags">${tags.map((tag) => `<small>${escapeHtml(tag)}</small>`).join("")}</span>
      </span>
    </button>
  `;
}

function renderColoringPreview(asset) {
  if (!asset) {
    elements.coloringPreview.innerHTML = `<div class="empty-state">Choose a template to preview.</div>`;
    return;
  }

  const title = getColoringTitle(asset);
  const tags = getColoringTags(asset).filter((tag) => tag !== title).slice(0, 8);

  elements.coloringPreview.innerHTML = `
    <div class="coloring-print-sheet">
      <figure>
        <img src="${escapeAttribute(asset.file)}" alt="${escapeAttribute(asset.alt)}">
      </figure>
      <footer class="coloring-scroll-footer" aria-label="Template story labels">
        <div class="scroll-title">${escapeHtml(title)}</div>
        ${tags.length ? `<div class="scroll-meta">${tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>` : ""}
      </footer>
    </div>
  `;
}

function getColoringTitle(asset) {
  const scene = getAssetScenes(asset)[0];
  if (scene) {
    return scene.title;
  }

  const glossaryEntry = getAssetGlossaryEntries(asset)[0];
  if (glossaryEntry) {
    return glossaryEntry.title;
  }

  return (asset.subjects?.[0] ?? asset.id).replaceAll("-", " ");
}

function getColoringTags(asset) {
  const subjects = asset.subjects ?? [];
  const scenes = getAssetScenes(asset);
  const locations = getAssetLocations(asset);
  const glossaryEntries = getAssetGlossaryEntries(asset);
  const values = [
    ...subjects,
    ...scenes.map((scene) => scene.title),
    ...locations.map((location) => location.label),
    ...scenes.map((scene) => scene.locationBucket),
    ...glossaryEntries.map((entry) => entry.title),
    ...glossaryEntries.flatMap((entry) => entry.tags ?? [])
  ].filter(Boolean);

  return [...new Set(values)].slice(0, 12);
}

function getAssetScenes(asset) {
  const sceneIds = asset.sceneIds ?? [];
  return sceneIds
    .map((sceneId) => state.data.scenes.find((scene) => scene.id === sceneId))
    .filter(Boolean);
}

function getAssetLocations(asset) {
  const locationIds = new Set(getAssetScenes(asset).map((scene) => scene.locationNode));
  return [...locationIds]
    .map((locationId) => state.data.locationNodes.find((location) => location.id === locationId))
    .filter(Boolean);
}

function getAssetGlossaryEntries(asset) {
  const glossaryIds = asset.glossaryIds ?? [];
  const directEntries = glossaryIds
    .map((entryId) => state.data.glossaryEntries?.find((entry) => entry.id === entryId))
    .filter(Boolean);

  const subjectEntries = (asset.subjects ?? [])
    .map((subject) => state.data.glossaryEntries?.find((entry) => entry.title.toLowerCase() === subject.toLowerCase()))
    .filter(Boolean);

  return [...new Map([...directEntries, ...subjectEntries].map((entry) => [entry.id, entry])).values()];
}

function printSelectedColoringTemplate() {
  if (!state.selectedColoringAssetId) {
    return;
  }
  document.body.classList.add("printing-coloring");
  window.print();
  window.setTimeout(() => document.body.classList.remove("printing-coloring"), 500);
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

Promise.all([loadStoryData(), loadAssetsIndex(), loadStoryDetails()]).then(([data, assetIndex, details]) => {
  state.data = data;
  state.assets = assetIndex.assets ?? [];
  state.details = details;
  state.selectedSceneId = data.scenes[0]?.id;
  elements.sceneCount.textContent = data.scenes.length;
  elements.assetCount.textContent = state.assets.length;
  initControls();
  renderGlossaryPreview();
  renderColoringLibrary();
  render();
});

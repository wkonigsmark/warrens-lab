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
  bucket: "all"
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
  glossary: document.querySelector("#glossary-grid")
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

  elements.sceneDetail.innerHTML = `
    <p class="eyebrow">Chronology ${orderedScene.outlinePosition ?? scene.order}</p>
    <h3>${escapeHtml(scene.title)}</h3>
    <p class="scene-summary">${escapeHtml(scene.summary)}</p>
    ${renderExpandedSummary(scene)}
    ${renderSceneArt(art)}
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
  return state.assets.find((asset) => asset.variant === "color" && asset.sceneIds.includes(sceneId))
    ?? state.assets.find((asset) => asset.sceneIds.includes(sceneId));
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
  elements.glossary.innerHTML = fallbackGlossary
    .map(
      (entry) => `
        <article class="glossary-card">
          <h3>${escapeHtml(entry.title)}</h3>
          <p>${escapeHtml(entry.text)}</p>
        </article>
      `
    )
    .join("");
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
  render();
});

# Lexicon Engine 🧠
**A Robust Vocabulary & Semantic Search Framework**

## 📌 Project Overview
The Lexicon Engine is designed to be a "vocabulary graph" rather than a simple dictionary. It aims to create deep semantic connections between words, allowing for advanced categorization and discovery (e.g., searching for "Soccer" and finding "kick," "goal," and "referee").

The engine currently supports two primary modes:
1. **Quiz Mode:** A high-fidelity interactive quiz featuring curated vocabulary levels.
2. **Learning Mode:** A focused study mode for deep etymological exploration.

---

## 🏗 Folder Architecture & Core Files

The Lexicon application is divided into two main layers: the **UI/Engine Layer** and the **Data Storage Layer**.

### 1. UI & Engine Layer (`/lexicon/`)
This layer handles the user experience, rendering, and real-time word filtering.

- **`index.html`**: The primary user interface. Contains the filter controls (Grade, Difficulty, Part of Speech, Root Language) and the word display cards.
- **`script.js`**: **The Engine Room.** Handles fetching the database, managing scores/streaks, and the comprehensive word filtering logic (`getFilteredPool`).
- **`style.css`**: The design system. Recently updated to fix descender clipping (e.g., 'g', 'p', 'y') for high-register word layouts.

### 2. Data Storage & Schema Layer (`/lexicon/lexicon_seed_project/`)
This layer contains the raw data and technical definitions.

- **`lexicon_seed.json`**: <span style="color: #2ea44f;">**[ACTIVE] The Source of Truth.**</span> This is the primary JSON database file used by `script.js`. All word integrations (including the 100+ "Adult" tier words) are stored here.
- **`schema.md`**: Technical documentation describing the JSON object structure, tags, and relevance scoring.

---

## 🗑 Redundancy & Maintenance

To keep the project clean, the following files should be considered **Redundant** or for development use only:

| File | Status | Rationale |
| :--- | :--- | :--- |
| **`lexicon_seed.csv`** | <span style="color: #d73a49;">**[REDUNDANT]**</span> | This was used for initial data entry. The engine now relies exclusively on the JSON format for its complex nested structures (senses, history, associations). |
| **`index.js` (in subfolder)** | <span style="color: #6a737d;">**[DEV ONLY]**</span> | A Node-style search module for testing the database logic outside of a browser. Not used by the web application. |
| **`script.js` (Root entries)** | <span style="color: #2ea44f;">**[ACTIVE]**</span> | While large, this contains the core application state and should not be split until it exceeds ~1,500 lines. |

---

## 🚀 The Path to a Robust Engine (Brainstorming)

The current "Seed" is a flat list. To achieve the "Soccer" search functionality described, the engine utilizes a **Weighted Word Associations** model within the JSON schema (`tags` + `relevance` scoring).

### Current Schema v2.0 Features:
1. **Semantic Tags**: Words are grouped by conceptual tags (e.g., `communication`, `ethics`, `judgment`).
2. **Weighted Relevance**: A word's "core" score determines its priority in search results (e.g., "Goal" score is higher than "Grass" for a "Soccer" search).
3. **Word Roots**: Standardized `root_language` and `root_word` fields allow for etymological exploration.

---

> [!TIP]
> **Dev Server Command:**
> When testing locally, serve from the root of the repository to ensure all paths resolve:
> ```bash
> python3 -m http.server 8001
> ```
> Access at: `http://localhost:8001/lexicon/index.html`

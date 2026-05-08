# Ants & Apples: Development Roadmap

## 🌟 Philosophy
**"Handing off the Heavy Lifting, Bit by Bit."**  
Ants & Apples is designed to bridge the gap between concrete visual counting and abstract mental math. By providing a "Helper Calculator" that visualizes equations with ants and apples, we ground mathematical operations in reality. The goal is to gradually fade these aids until the student is solving complex grids purely in their mind.

---

## ✅ Phase 1: UX & Polish (Current Milestone)
*   COMPLETE!

---

## 🚀 Phase 2: Operations & Challenge
*   [ ] **New Modes**: Implement Subtraction (-) and Division (÷) logic.
 **DIVISION COMPLETE!!**
*   [ ] **Grid Navigation**: Implement fluid keyboard movement (`Tab`, `Shift+Tab`, `Arrow Keys`) across the grid.
*   [ ] **Negative Numbers**: Intro to basic negative result logic (Intermediate mode).

---

## 🔮 Phase 3: The Profile & Leaderboard Update
The next major engineering leap will allow multiple students to share the same device and track their growth.

### Local Leaderboard System
*   **Storage Strategy**: Utilize `localStorage` to persist a `LEADERBOARD` array of score objects.
*   **Data Structure**:
    ```javascript
    {
      name: "John",
      time: 145, // seconds
      level: 5,
      grid: "4x4",
      operation: "multiply",
      helperUsed: false,
      date: "2026-02-14"
    }
    ```
*   **UX Sequence**:
    1.  Upon winning the final level, if the time is a Top 10 result, trigger a "New Record!" dialog.
    2.  User enters their name into a simple text input.
    3.  The result is logged and displayed in a new "Local Legends" view accessible from the Settings menu.

### Profile Switching
*   Allow a "Who is playing?" selector at the start to pre-fill names for the leaderboard.

---

## 🏗️ Technical Specifications (Future)
*   **State Persistence**: Move current `let` variables into a local-storage-backed `GAME_SETTINGS` object.
*   **Asset Management**: Optimization of audio assets and possible synthesized sound (Web Audio API) to match the Stencil project.

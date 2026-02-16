# 🗺️ Project Roadmap: Kitchen Sync

This document summarizes the current "state of the union" for the meal planning application and outlines the prioritized future features.

## ✅ Accomplishments (Phase 1)
We have successfully transitioned the app from a simple list to a functional, automated meal planning tool.

### 🍱 Recipe Database Expansion
- **The "Rome" Collection**: Full set of the 4 Roman classics (Carbonara, Cacio e Pepe, Amatriciana, Gricia) with searchable metadata.
- **WWF Series**: "Warren's World Famous" Quinoa and a specialized Kid-Friendly Lunch Rotation template.
- **Technique-Driven Cooking**: Added restaurant-quality recipes for Crispy Cast Iron Cod and "Smashed" Brussels Sprouts.

### 🛠️ UX & Planning Logic
- **Automated Scheduling**: Recipes now intelligently find the next available Breakfast/Lunch/Dinner slot.
- **Sticky Navigation**: Plan button and global Back button are always accessible.
- **Shopping Intelligence**: Ingredients are automatically aggregated, categorized, and include a "Share Needed" filter.

### 🖨️ Professional Output
- **PDF Export**: A complete, print-ready document containing the meal schedule, a filtered shopping list (needed items only), and full cooking instructions.

---

## 🚀 Future Roadmap (Phase 2)

### 🧺 1. "What's in my Kitchen?" (Ingredient Matcher)
**The Goal:** Reduce food waste and decision fatigue by starting with what you have. 
- **Functionality**: A search mode where users enter "Chicken, Spinach, Lemon" and the app returns the best-fitting recipes.
- **Logic**: Rank results by how many ingredients match, even if it's not a 100% hit.

### 📲 2. Interactive Plan Sync (Cloud/Sharing)
**The Goal**: Move beyond static PDFs and allow real-time collaboration between the kitchen and the grocery store.
- **Functionality**: A "Share Code" or account-link system where a Plan created by one person (e.g., Wife) automatically populates the "Plan" view on another's device (e.g., Husband's phone).
- **Benefit**: The navigator can pull up the actual interactive instructions on their phone while cooking.

### 🎲 3. The "Random Suggester" (Discovery Mode)
**The Goal**: Break the routine with a high-visibility, "un-opinionated" view of the database.
- **Visuals**: A "Mosaic View" with smaller recipe cards and stripped-down text to show 20+ recipes at once.
- **Logic**: A "Shuffle" button that lets you filter by meal type (e.g., "Show me random Lunches") to spark inspiration.

---

## 🏗️ Technical Debt & Polish
- **Persistance**: Move state management to `localStorage` so the Plan isn't lost on page refresh.
- **Image Assets**: Generate and host unique thumbnail images for the new Roman and Quinoa recipes.
- **Unit Conversions**: Hardening the logic for more complex unit combinations (e.g., "2 sticks" + "4 tbsp").

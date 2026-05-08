# 👨‍🍳 Chef: Meal Planner Game Roadmap

This document outlines the strategic development path for the Chef sub-tool, designed to help children plan healthy meals through an interactive, visual interface.

## 🏁 Phase 1: Foundation (COMPLETED)
- [x] **Image Pipeline**: Built `img-tool/process_images.py` with AI background removal (rembg).
- [x] **Database Schema**: Established `foods.json` structure to track nutrients and metadata.
- [x] **Sync & Enrich Engine**: Built scripts to automatically pull data from USDA FoodData Central.
- [x] **Asset Seeding**: Initial 15 foods (fruits, vegetables, proteins) processed and documented in the DB.

## 🏗️ Phase 2: Core UX/UI (CURRENT)
- [ ] **Interface Shell**: Create a tablet-optimized layout with a central "Empty Plate" and a right-hand "Pantry Sidebar."
- [ ] **Category Navigation**: Implement buttons for Fruits, Vegetables, Grains, Dairy, and Proteins.
- [ ] **Visual Inventory**: Render legible, high-res food icons from the `finished-img` folder.
- [ ] **Drag & Drop Mechanics**: Allow users to drag items onto the plate with smooth animations.
- [ ] **Parental Detail View**: Implement the nutritional pop-up (ESC/Click-out to close) for adults to see granular data.

## 📊 Phase 3: Nutritional Intelligence
- [ ] **Real-time Tally**: Calculate cumulative nutrients as items are added to the plate.
- [ ] **Goal Meters**: Visual "progress bars" for a single meal's targets (Protein, Fiber, Vitamins).
- [ ] **Supplement Engine**: Logic to suggest specific offsets (e.g., "Add Vitamin C supplement") if meal goals aren't met.
- [ ] **Removal Logic**: Allow dragging items off the plate or clicking a red (–) to delete.

## 📑 Phase 4: Persistence & Output
- [ ] **Meal Saving**: Store planned meals in a local history.
- [ ] **Kitchen Sync Integration**: Export the meal to a PDF with a generated Shopping List.
- [ ] **2x Toggle**: Add the "Allow 2x Servings" global switch for growing appetites.

## 🚀 Phase 5: Personalization (Future)
- [ ] **User Profiles**: Tailor goal meters to specific ages/genders/activity levels.
- [ ] **Full-Day Planning**: Expand from single meals to include snacks and overall daily tracking.
- [ ] **Environment Skins**: Add "Kitchen Cabinet," "Pantry," and "Fridge" visual themes.

---

### Current Task
> **Building the Core UX/UI (Phase 2)**: Creating the `index.html` shell with the Drag & Drop plate logic.

# Meal Planning & Shopping Checklist Enhancements

We've significantly upgraded the recipe application's user experience and added powerful sharing and organization tools.

## Key Features

### 🛒 Interactive Shopping Checklist
The shopping list is now a fully functional checklist. 
- **Check off** items you already have.
- Checked items appear **dimmed and crossed out**.
- Logic is "scroll-stable" (no jumping when checking boxes).

### 📤 "Share Needed" Filtered Sharing
A new sharing button allows you to send a refined list to anyone.
- Summarizes **Upcoming Meals** at the top.
- Filters the list to include **ONLY unchecked items**.
- Groups items by category for a clean layout.

### 🧠 Intelligent Ingredient Aggregation
- **Consolidation**: Merges "melted butter," "unsalted butter," etc., into "butter."
- **Unit Normalization**: Correctly sums units like "cups" or "tsp."

### 📍 Sticky Navigation & UX Polish
- **Persistent Back & Plan Buttons**: Bold pill buttons in the sticky top bar ensure you always have your tools handy.
- **Subtle Home Link**: Renamed "Exit to Studio" and moved to be less distracting.

### 🖨️ Professional PDF Export
The export layout is now a complete kitchen companion:
1.  **⏳ Meal Schedule**: Dates and times clearly listed.
2.  **🛒 Shopping List**: Filtered to show only needed items, grouped by category.
3.  **👨‍🍳 Cooking Guide**: Comprehensive instructions and ingredients for all selected recipes.

## Verification
- [x] Verified scroll-to-top only fires on navigation.
- [x] Confirmed PDF export shows schedule, needed items, and full instructions.
- [x] Verified sticky navigation and prominent global Back button.

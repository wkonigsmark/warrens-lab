# Ants & Artistry — Coloring Page Creator

A creative, drag-and-drop tool for designing custom coloring pages.

## Features

✨ **Drag & Drop Canvas**
- Browse categories of outlined images (landscapes, constructs, animals, objects, misc)
- Drag images directly onto the canvas
- Arrange multiple elements to create unique coloring pages

🎨 **Element Controls**
- **Resize:** Use the slider or grab the corner handle
- **Rotate:** Spin elements 0-360°
- **Lock:** Prevent accidental movement
- **Delete:** Remove unwanted elements

📐 **Canvas Orientation**
- Portrait (8.5" × 11") — standard letter
- Landscape (11" × 8.5") — wider format

💾 **Save & Print**
- Print directly to PDF
- Save as PNG (coming soon)

## File Structure

```
ants-artistry/
├── index.html          # Main UI & layout
├── styles.css          # Styling & responsive design
├── script.js           # Drag-drop, resize, rotate logic
├── images-data.js      # Image database & placeholders
├── assets/
│   └── images/         # (future) Organized image folders
│       ├── landscapes/
│       ├── constructs/
│       ├── animals/
│       ├── objects/
│       └── misc/
└── README.md           # This file
```

## How to Use

1. **Select a Category** — Click one of the category buttons on the left
2. **Choose an Image** — Click any image in the gallery to preview
3. **Drag to Canvas** — Drag the image onto the white canvas area
4. **Arrange** — Move, resize, and rotate to your liking
5. **Lock** — Lock elements you've placed to avoid moving them
6. **Save/Print** — When done, print or save your creation

## Next Steps: Image Database

Currently using simple SVG placeholders. To build the full image library:

### Suggested Workflow
1. Create/commission outlined PNG images for each category
2. Save as `assets/images/{category}/{name}.png`
3. Update `images-data.js` to reference the PNG files instead of SVG placeholders

### Example Structure
```javascript
landscapes: [
    {
        name: 'Mountain',
        type: 'png',
        src: '/games/ants-artistry/assets/images/landscapes/mountain.png'
    },
    ...
]
```

## Technical Notes

- **Canvas Size:** 8.5" × 11" or 11" × 8.5" (based on DPI, ~816px × 1056px or inverse)
- **Responsive:** Works on tablet (iPad) for touch interaction
- **Browser Support:** Modern browsers (Chrome, Safari, Firefox, Edge)
- **Print Quality:** Optimized for 300 DPI printing

## Future Enhancements

- [ ] PNG save (using html2canvas or similar)
- [ ] Undo/Redo stack
- [ ] Color fill (paint bucket for coloring)
- [ ] Text labels
- [ ] Save templates (localStorage or server)
- [ ] Library of user-created templates
- [ ] Touch support improvements for tablets

## License

Part of Burnmark Productions.

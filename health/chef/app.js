let foodData = {};
let currentCategory = 'fruit';
let plateItems = []; // Array of objects: { foodId: 'apple', x: 50, y: 50, serving: 1 }
let isSmoothieMode = false;

const MEAL_GOALS = {
    protein: 15, // grams for a single meal
    fiber: 8,    // grams
    vitamins: 30 // combined daily_pct average for A/C
};

// --- INITIALIZATION ---
async function init() {
    try {
        const response = await fetch('foods.json');
        foodData = await response.json();
        renderInventory();
        setupPlateDragDrop();
    } catch (err) {
        console.error("Failed to load foods.json", err);
    }
}

// --- RENDERING ---
function renderInventory() {
    const grid = document.getElementById('inventoryGrid');
    grid.innerHTML = '';
    const searchVal = document.getElementById('searchInput')?.value.toLowerCase() || '';

    Object.values(foodData).forEach(food => {
        if (currentCategory !== 'all' && food.category !== currentCategory) return;
        if (searchVal && !food.display_name.toLowerCase().includes(searchVal)) return;

        const card = document.createElement('div');
        card.className = 'food-card';
        card.draggable = true;
        card.dataset.id = food.id;
        
        card.innerHTML = `
            <div class="info-btn" onclick="showNutrition('${food.id}', event)">
                <i class="fas fa-info"></i>
            </div>
            <img src="img-tool/finished-img/${food.image}" alt="${food.display_name}">
            <h3>${food.display_name}</h3>
        `;

        // DRAG START
        card.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', food.id);
            e.dataTransfer.effectAllowed = 'copy';
        });

        card.addEventListener('dragend', () => {
            // End drag
        });

        // TAP TO ADD (Tablet friendly)
        card.addEventListener('click', (e) => {
            // Only add if we didn't click the info button
            if (!e.target.closest('.info-btn')) {
                const pos = getSmartDropPosition();
                addItemToPlate(food.id, pos.x, pos.y);
            }
        });

        grid.appendChild(card);
    });
}

function setCategory(cat, btn) {
    currentCategory = cat;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderInventory();
}

// --- DRAG & DROP ---
function setupPlateDragDrop() {
    const plate = document.getElementById('mainPlate');

    plate.addEventListener('dragover', (e) => {
        e.preventDefault();
        plate.classList.add('drag-over');
    });

    plate.addEventListener('dragleave', () => {
        plate.classList.remove('drag-over');
    });

    plate.addEventListener('drop', (e) => {
        e.preventDefault();
        plate.classList.remove('drag-over');
        
        const data = e.dataTransfer.getData('text/plain');
        if (!data) return;

        // Get drop position relative to plate (account for 160px image center = 80px)
        const rect = plate.getBoundingClientRect();
        let x = e.clientX - rect.left - 80; 
        let y = e.clientY - rect.top - 80;

        // Clamp coordinates to stay within visible area
        if (isSmoothieMode) {
            x = Math.max(-20, Math.min(x, plate.offsetWidth - 140));
            y = Math.max(-20, Math.min(y, plate.offsetHeight - 140));
        } else {
            x = Math.max(0, Math.min(x, plate.offsetWidth - 160));
            y = Math.max(0, Math.min(y, plate.offsetHeight - 160));
        }

        if (data.startsWith('plate_')) {
            // Reposition existing item
            const itemId = parseInt(data.replace('plate_', ''));
            const item = plateItems.find(i => i.id === itemId);
            if (item) {
                item.x = x;
                item.y = y;
                renderPlate();
            }
        } else {
            // Add new item from pantry
            addItemToPlate(data, x, y);
        }
    });
}

function getSmartDropPosition() {
    const itemSize = 160;
    let safeMinX, safeMaxX, safeMinY, safeMaxY;
    
    if (isSmoothieMode) {
        safeMinX = 10; safeMaxX = 160;
        safeMinY = 10; safeMaxY = 280;
    } else {
        safeMinX = 40; safeMaxX = 320;
        safeMinY = 40; safeMaxY = 320;
    }
    const minDistance = 130; // Minimum distance between centers to avoid bad overlap

    for (let attempts = 0; attempts < 50; attempts++) {
        const x = safeMinX + Math.random() * (safeMaxX - safeMinX);
        const y = safeMinY + Math.random() * (safeMaxY - safeMinY);

        // Calculate centers
        const cx = x + itemSize / 2;
        const cy = y + itemSize / 2;

        let hasOverlap = false;
        for (let item of plateItems) {
            const ix = item.x + itemSize / 2;
            const iy = item.y + itemSize / 2;
            const dist = Math.sqrt(Math.pow(cx - ix, 2) + Math.pow(cy - iy, 2));
            if (dist < minDistance) {
                hasOverlap = true;
                break;
            }
        }

        if (!hasOverlap) {
            return { x, y };
        }
    }

    // Fallback if incredibly crowded
    return { 
        x: safeMinX + Math.random() * (safeMaxX - safeMinX), 
        y: safeMinY + Math.random() * (safeMaxY - safeMinY) 
    };
}

function addItemToPlate(foodId, x, y) {
    const isDouble = document.getElementById('doubleServingToggle').checked;
    
    // Rule 1: Prevent duplicates if not allowing 2x
    if (!isDouble && plateItems.some(item => item.foodId === foodId)) {
        alert("You already have this on your plate! Turn on 'Allow 2x' to add more.");
        return;
    }

    // Rule 2: Limit to 2 max if 2x is enabled
    const existingCount = plateItems.filter(item => item.foodId === foodId).length;
    if (existingCount >= 2) {
        alert("Two servings is plenty! Try adding something else.");
        return;
    }

    const item = { id: Date.now(), foodId, x, y };
    plateItems.push(item);
    renderPlate();
    updateTally();
}

function renderPlate() {
    const plate = document.getElementById('mainPlate');
    
    // Preserve liquid if it exists
    const liquid = document.getElementById('smoothieLiquid');
    plate.innerHTML = '';
    if (liquid) plate.appendChild(liquid);

    plateItems.forEach(item => {
        const food = foodData[item.foodId];
        const el = document.createElement('div');
        el.className = 'food-on-plate';
        el.style.left = `${item.x}px`;
        el.style.top = `${item.y}px`;
        el.draggable = true;
        
        // DRAG REPOSITION
        el.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', `plate_${item.id}`);
            e.dataTransfer.effectAllowed = 'move';
            
            // Visual feedback that it's being moved
            setTimeout(() => {
                el.style.opacity = '0.4';
            }, 0);
        });

        el.addEventListener('dragend', () => {
            el.style.opacity = '1';
        });
        
        el.innerHTML = `
            <img src="img-tool/finished-img/${food.image}" alt="${food.display_name}">
            <button class="remove-btn" onclick="removeItem(${item.id})">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        plate.appendChild(el);
    });
}

function removeItem(id) {
    plateItems = plateItems.filter(item => item.id !== id);
    renderPlate();
    updateTally();
}

function resetMeal() {
    if (confirm("Clear your plate and start over?")) {
        plateItems = [];
        const plate = document.getElementById('mainPlate');
        plate.classList.remove('blending-active');
        const liquid = document.getElementById('smoothieLiquid');
        if (liquid) liquid.remove();
        renderPlate();
        updateTally();
    }
}

// --- NUTRITION LOGIC ---
function updateTally() {
    let totals = { calories: 0, protein: 0, fiber: 0, vitamins: 0 };

    plateItems.forEach(item => {
        const food = foodData[item.foodId];
        if (!food || !food.nutrients) return;

        totals.calories += (food.calories || 0);
        totals.protein += (food.nutrients.protein?.amount || 0);
        totals.fiber += (food.nutrients.fiber?.amount || 0);
        
        const vA = food.nutrients.vitamin_a?.daily_pct || 0;
        const vC = food.nutrients.vitamin_c?.daily_pct || 0;
        totals.vitamins += (vA + vC) / 2;
    });

    // Update UI
    document.getElementById('val-calories').textContent = `${Math.round(totals.calories)} kcal`;
    
    // Protein HUD
    const protPct = Math.min((totals.protein / MEAL_GOALS.protein) * 100, 100);
    document.getElementById('val-protein').textContent = `${totals.protein.toFixed(1)} / ${MEAL_GOALS.protein}g`;
    document.getElementById('bar-protein').style.width = `${protPct}%`;

    // Fiber HUD
    const fiberPct = Math.min((totals.fiber / MEAL_GOALS.fiber) * 100, 100);
    document.getElementById('val-fiber').textContent = `${totals.fiber.toFixed(1)} / ${MEAL_GOALS.fiber}g`;
    document.getElementById('bar-fiber').style.width = `${fiberPct}%`;

    updateSupplements(totals);
}

function updateSupplements(totals) {
    const box = document.getElementById('supplementBox');
    const text = document.getElementById('supplementText');
    
    if (plateItems.length === 0) {
        box.style.display = 'none';
        return;
    }

    box.style.display = 'block';
    let suggestions = [];

    if (totals.protein < MEAL_GOALS.protein) suggestions.push("Add a scoop of Protein Powder or a hard-boiled egg.");
    if (totals.fiber < MEAL_GOALS.fiber) suggestions.push("Consider a fiber gummy or adding chia seeds to the meal.");
    if (totals.vitamins < MEAL_GOALS.vitamins) suggestions.push("Today is a good day for a Multi-Vitamin gummy!");

    if (suggestions.length === 0) {
        text.innerHTML = "🌟 **Perfect Plate!** Your nutrition goals for this meal are fully met.";
    } else {
        text.innerHTML = "To reach your goals, consider: " + suggestions.join(" ");
    }
}

// --- POPUPS ---
function showNutrition(foodId, event) {
    if (event) event.stopPropagation();
    const food = foodData[foodId];
    const modal = document.getElementById('nutritionModal');
    const content = document.getElementById('modalData');

    content.innerHTML = `
        <div class="modal-header">
            <img src="img-tool/finished-img/${food.image}" alt="${food.display_name}">
            <div>
                <h2>${food.display_name}</h2>
                <p style="color:var(--text-muted); margin:0;">Serving: ${food.serving_size}</p>
            </div>
        </div>
        <div class="nutrient-grid">
            <div class="nutrient-item"><span>Calories</span><strong>${food.calories}</strong></div>
            <div class="nutrient-item"><span>Protein</span><strong>${food.nutrients.protein?.amount || 0}g</strong></div>
            <div class="nutrient-item"><span>Carbs</span><strong>${food.nutrients.carbohydrates?.amount || 0}g</strong></div>
            <div class="nutrient-item"><span>Fat</span><strong>${food.nutrients.fat?.amount || 0}g</strong></div>
            <div class="nutrient-item"><span>Fiber</span><strong>${food.nutrients.fiber?.amount || 0}g</strong></div>
            <div class="nutrient-item"><span>Vitamin C</span><strong>${food.nutrients.vitamin_c?.daily_pct || 0}%</strong></div>
        </div>
        <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 20px; font-style: italic;">
            *Daily percentages based on 2,000 calorie diet reference.
        </p>
    `;

    modal.style.display = 'flex';
}

function closeModal(e) {
    document.getElementById('nutritionModal').style.display = 'none';
}

// Global keyboard listener for ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

// --- SMOOTHIE MODE ---
function toggleMode() {
    const toggle = document.getElementById('modeToggle');
    isSmoothieMode = toggle.checked;
    
    const plate = document.getElementById('mainPlate');
    const blendBtn = document.getElementById('blendBtn');
    const lid = document.getElementById('blenderLid');
    const base = document.getElementById('blenderBase');
    const handle = document.getElementById('blenderHandle');
    const wrapper = document.getElementById('blenderWrapper');
    
    if (isSmoothieMode) {
        plate.classList.add('blender-mode');
        if(wrapper) wrapper.classList.add('blender-mode');
        blendBtn.style.display = 'inline-block';
        if(lid) lid.style.display = 'block';
        if(base) base.style.display = 'flex';
        if(handle) handle.style.display = 'block';
    } else {
        plate.classList.remove('blender-mode');
        if(wrapper) wrapper.classList.remove('blender-mode');
        blendBtn.style.display = 'none';
        if(lid) lid.style.display = 'none';
        if(base) base.style.display = 'none';
        if(handle) handle.style.display = 'none';
        // Reset smoothie states if switching back
        plate.classList.remove('blending-active');
        const liquid = document.getElementById('smoothieLiquid');
        if (liquid) liquid.remove();
    }
}

async function blendSmoothie() {
    if (plateItems.length === 0) return;
    
    const plate = document.getElementById('mainPlate');
    plate.classList.add('blending-active');
    
    const color = await calculateAverageColor(plateItems);
    
    let liquid = document.getElementById('smoothieLiquid');
    if (!liquid) {
        liquid = document.createElement('div');
        liquid.id = 'smoothieLiquid';
        liquid.className = 'smoothie-liquid';
        plate.appendChild(liquid);
    }
    
    // Reset height before animating
    liquid.style.height = '0';
    
    // Textured background using noise and average color
    liquid.style.background = `
        linear-gradient(rgba(255,255,255,0.1), rgba(0,0,0,0.2)),
        url('data:image/svg+xml;utf8,<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><filter id="noiseFilter"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(%23noiseFilter)" opacity="0.15"/></svg>'),
        ${color}`;
    
    // Let animation finish then rise liquid
    setTimeout(() => {
        liquid.style.height = '85%';
    }, 500);
}

async function calculateAverageColor(items) {
    let r = 0, g = 0, b = 0, count = 0;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 160;
    canvas.height = 160;

    for (let item of items) {
        const food = foodData[item.foodId];
        const imgUrl = `img-tool/finished-img/${food.image}`;
        
        await new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => {
                ctx.clearRect(0, 0, 160, 160);
                ctx.drawImage(img, 0, 0, 160, 160);
                const data = ctx.getImageData(0, 0, 160, 160).data;
                
                let itemR = 0, itemG = 0, itemB = 0, itemP = 0;
                // Sample every 4th pixel to speed it up
                for (let i = 0; i < data.length; i += 16) {
                    if (data[i + 3] > 50) { // Check alpha
                        itemR += data[i];
                        itemG += data[i + 1];
                        itemB += data[i + 2];
                        itemP++;
                    }
                }
                if (itemP > 0) {
                    r += itemR / itemP;
                    g += itemG / itemP;
                    b += itemB / itemP;
                    count++;
                }
                resolve();
            };
            img.onerror = () => resolve();
            img.src = imgUrl;
        });
    }

    if (count === 0) return 'rgb(200, 200, 200)';
    return `rgb(${Math.round(r/count)}, ${Math.round(g/count)}, ${Math.round(b/count)})`;
}

function exportMeal() {
    if (plateItems.length === 0) {
        alert("Your plate is empty! Add some ingredients before exporting.");
        return;
    }

    let totals = { calories: 0, protein: 0, fiber: 0 };
    let rowsHtml = "";

    plateItems.forEach(item => {
        const food = foodData[item.foodId];
        if (!food) return;

        const p = food.nutrients?.protein?.amount || 0;
        const f = food.nutrients?.fiber?.amount || 0;
        const c = food.calories || 0;
        const cat = food.category ? food.category.charAt(0).toUpperCase() + food.category.slice(1) : 'Misc';

        totals.calories += c;
        totals.protein += p;
        totals.fiber += f;

        rowsHtml += `
            <tr style="border-bottom: 1px solid #f1f1f1;">
                <td style="padding: 12px; display: flex; align-items: center; gap: 10px;">
                    <img src="img-tool/finished-img/${food.image}" style="width: 40px; height: 40px; object-fit: contain; background: #f9f9f9; border-radius: 8px; padding: 4px;">
                    <div style="display:flex; flex-direction:column;">
                        <strong style="font-size: 1rem;">${food.display_name}</strong>
                        <span style="font-size: 0.7rem; color: #888;">${food.usda_name || ''}</span>
                    </div>
                </td>
                <td style="padding: 12px; color: #636e72;">${cat}</td>
                <td style="padding: 12px;">${c} kcal</td>
                <td style="padding: 12px;">${p.toFixed(1)}g</td>
                <td style="padding: 12px;">${f.toFixed(1)}g</td>
            </tr>
        `;
    });

    const element = document.createElement('div');
    element.innerHTML = `
        <div style="padding: 40px; font-family: 'Outfit', sans-serif; background: #fff; color: #2d3436;">
            <div style="text-align: center; border-bottom: 3px solid #5d4037; padding-bottom: 20px; margin-bottom: 30px;">
                <p style="text-transform: uppercase; letter-spacing: 3px; font-weight: 800; color: #b2bec3; margin: 0; font-size: 0.8rem;">Warren's Lab</p>
                <h1 style="font-size: 3.5rem; margin: 5px 0; color: #5d4037; font-weight: 900;">👨‍🍳👩‍🍳 Chef's Selection</h1>
                <p style="font-style: italic; color: #636e72;">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
                <thead>
                    <tr style="background: #f8f9fa; text-align: left;">
                        <th style="padding: 15px; border-radius: 10px 0 0 10px;">Ingredient</th>
                        <th style="padding: 15px;">Category</th>
                        <th style="padding: 15px;">Calories</th>
                        <th style="padding: 15px;">Protein</th>
                        <th style="padding: 15px; border-radius: 0 10px 10px 0;">Fiber</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHtml}
                </tbody>
            </table>
            
            <div style="background: #5d4037; color: white; padding: 30px; border-radius: 20px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 10px 20px rgba(93,64,55,0.2);">
                <div>
                    <h3 style="margin: 0; font-size: 1.5rem; font-weight: 800;">Meal Nutrition Totals</h3>
                    <p style="margin: 5px 0 0; opacity: 0.8; font-size: 0.9rem;">Mode: ${isSmoothieMode ? '🥤 Smoothie Blend' : '🍽 Standard Plate'}</p>
                </div>
                <div style="display: flex; gap: 40px;">
                    <div style="text-align: center;">
                        <p style="margin: 0; font-size: 0.7rem; font-weight: 800; opacity: 0.7; text-transform: uppercase;">Calories</p>
                        <strong style="font-size: 2rem;">${Math.round(totals.calories)}</strong>
                    </div>
                    <div style="text-align: center;">
                        <p style="margin: 0; font-size: 0.7rem; font-weight: 800; opacity: 0.7; text-transform: uppercase;">Protein</p>
                        <strong style="font-size: 2rem;">${totals.protein.toFixed(1)}g</strong>
                    </div>
                    <div style="text-align: center;">
                        <p style="margin: 0; font-size: 0.7rem; font-weight: 800; opacity: 0.7; text-transform: uppercase;">Fiber</p>
                        <strong style="font-size: 2rem;">${totals.fiber.toFixed(1)}g</strong>
                    </div>
                </div>
            </div>
            
            <div style="margin-top: 60px; text-align: center; color: #b2bec3; font-size: 0.8rem; border-top: 1px solid #eee; padding-top: 20px;">
                © ${new Date().getFullYear()} Warren's Lab Chef Tool • All Rights Reserved
            </div>
        </div>
    `;

    const opt = {
        margin:       0.3,
        filename:     `chef-meal-${new Date().getTime()}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    if (typeof html2pdf !== 'undefined') {
        html2pdf().set(opt).from(element).save();
    } else {
        console.error('html2pdf library not loaded');
        alert('PDF library is still loading, please try again in a moment.');
    }
}

init();

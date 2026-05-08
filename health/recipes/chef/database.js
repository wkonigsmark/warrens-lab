let foodData = {};

async function initDB() {
    try {
        const response = await fetch('foods.json');
        foodData = await response.json();
        renderTable();
    } catch (error) {
        console.error("Error loading foods.json:", error);
    }
}

function renderTable() {
    const tbody = document.getElementById('dbTableBody');
    const searchVal = document.getElementById('dbSearch').value.toLowerCase();
    tbody.innerHTML = '';

    Object.values(foodData).forEach(food => {
        if (searchVal && !food.display_name.toLowerCase().includes(searchVal)) return;

        const tr = document.createElement('tr');
        
        // Status badge
        const isVerified = food.status === 'complete';
        const statusBadge = isVerified 
            ? `<span class="badge verified"><i class="fas fa-check-circle"></i> Verified</span>`
            : `<span class="badge unverified"><i class="fas fa-exclamation-circle"></i> Unverified</span>`;

        // Safely extract nutrients
        const nutrients = food.nutrients || {};
        const p = nutrients.protein?.amount !== null && nutrients.protein?.amount !== undefined ? `${nutrients.protein.amount}g` : '-';
        const c = nutrients.carbohydrates?.amount !== null && nutrients.carbohydrates?.amount !== undefined ? `${nutrients.carbohydrates.amount}g` : '-';
        const f = nutrients.fat?.amount !== null && nutrients.fat?.amount !== undefined ? `${nutrients.fat.amount}g` : '-';
        const cals = food.calories !== null && food.calories !== undefined ? `${food.calories} kcal` : '-';
        const cat = food.category ? food.category.charAt(0).toUpperCase() + food.category.slice(1) : 'Misc';

        tr.innerHTML = `
            <td><img src="img-tool/finished-img/${food.image}" alt="${food.display_name}" class="db-img" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'40\\' height=\\'40\\'><rect width=\\'40\\' height=\\'40\\' fill=\\'%23eee\\'/></svg>'"></td>
            <td>
                <strong>${food.display_name}</strong>
                <div style="font-size: 0.75rem; color: #888; margin-top: 2px;">${food.usda_name || 'No USDA match'}</div>
            </td>
            <td>${cat}</td>
            <td><strong>${cals}</strong></td>
            <td>${p}</td>
            <td>${c}</td>
            <td>${f}</td>
            <td>${statusBadge}</td>
        `;
        tbody.appendChild(tr);
    });
}

document.addEventListener('DOMContentLoaded', initDB);

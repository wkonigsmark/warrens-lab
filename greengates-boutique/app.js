const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT8E5_1hM-ujhknGpkSX2zPno8Oikg_c3aMTo5TaUpCUeFWkx5Dp0IYAPYkAvt1_TjEd0dOzzHXnWMT/pub?gid=1256593101&single=true&output=csv";
const BALANCE_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT8E5_1hM-ujhknGpkSX2zPno8Oikg_c3aMTo5TaUpCUeFWkx5Dp0IYAPYkAvt1_TjEd0dOzzHXnWMT/pub?gid=398321353&single=true&output=csv";
// Category Override Logic Maps
const ART_COGS_KEYWORDS = [
    "Sagebrook",
    "Art & Frame Source",
    "Art Point Corporation",
    "Artisan Designs",
    "Celadon Art Burlington",
    "Crestviewcollect",
    "Leftbank Art",
    "Art Trends-prestige",
    "The Import Collectiopanorama City CA",
    "Paypal *level57llc x3939 GA",
    "Streamline Art and Fmississauga 1xx316-greg x-x-9596",
    "Paragon Decors Inc Albertville AL",
    "Kammy",
    "Lyon"
].map(k => k.toLowerCase());

// App State
let allTransactions = [];
let allBalances = [];
let filteredTransactions = [];
let activeView = 'dashboard';
let currentAccountFilter = 'business';
let startDateFilter = '';
let endDateFilter = '';
let pnlMode = 'boutique';       // 'boutique' | 'overall'  (business)
let familyPnlMode = 'family';   // 'family' | 'bmi'         (family)

// P&L Schema — defines the ordered rows for each mode
const PNL_SCHEMA = {
    boutique: [
        { type: 'section', label: 'Revenue' },
        { type: 'line', category: 'burnmark Boutique Income', label: 'Sales Income', sign: 1, isIncome: true },
        { type: 'line', category: 'burnmark Sales Tax', label: 'Sales Tax', sign: -1 },
        { type: 'line', category: 'burnmark COGS', label: 'Cost of Goods Sold', sign: -1 },
        { type: 'subtotal', label: 'Gross Profit' },

        { type: 'section', label: 'Operating Expenses' },
        { type: 'line', category: 'burnmark CC Processing Subscription', label: 'CC Processing', sign: -1 },
        { type: 'line', category: 'burnmark Advertising', label: 'Advertising', sign: -1 },
        { type: 'line', category: 'burnmark General Expenses', label: 'General Expenses', sign: -1 },
        { type: 'line', category: 'burnmark Rent', label: 'Rent', sign: -1 },
        { type: 'line', category: 'burnmark Utilities', label: 'Utilities', sign: -1 },
        { type: 'line', category: 'burnmark Renovations & Upkeep', label: 'Renovations & Upkeep', sign: -1 },
        { type: 'line', category: 'burnmark Legal Expenses', label: 'Legal Expenses', sign: -1 },
        { type: 'line', category: 'burnmark IT', label: 'IT', sign: -1 },
        { type: 'line', category: 'burnmark Meals & Entertainment', label: 'Meals & Entertainment', sign: -1 },
        { type: 'line', category: 'burnmark Tax', label: 'Tax', sign: -1 },
        { type: 'subtotal', label: 'Operating Margin' },

        { type: 'section', label: 'Payroll' },
        { type: 'line', category: 'burnmark Payroll - Bonuses', label: 'Payroll – Bonuses', sign: -1 },
        { type: 'line', category: 'burnmark Payroll', label: 'Payroll', sign: -1 },
        { type: 'total', label: 'Net Operating Income' },
    ],
    overall: [
        { type: 'section', label: 'Revenue' },
        { type: 'line', category: 'burnmark Boutique Income', label: 'Sales Income', sign: 1, isIncome: true },
        { type: 'line', category: 'burnmark Art Income', label: 'Art Income', sign: 1, isIncome: true },
        { type: 'line', category: 'burnmark Sales Tax', label: 'Sales Tax', sign: -1 },
        { type: 'line', category: 'burnmark COGS', label: 'Cost of Goods Sold', sign: -1 },
        { type: 'line', category: 'burnmark Art COGS', label: 'Art Cost of Goods Sold', sign: -1 },
        { type: 'subtotal', label: 'Gross Profit' },

        { type: 'section', label: 'Operating Expenses' },
        { type: 'line', category: 'burnmark CC Processing Subscription', label: 'CC Processing', sign: -1 },
        { type: 'line', category: 'burnmark Advertising', label: 'Advertising', sign: -1 },
        { type: 'line', category: 'burnmark General Expenses', label: 'General Expenses', sign: -1 },
        { type: 'line', category: 'burnmark Rent', label: 'Rent', sign: -1 },
        { type: 'line', category: 'burnmark Utilities', label: 'Utilities', sign: -1 },
        { type: 'line', category: 'burnmark Renovations & Upkeep', label: 'Renovations & Upkeep', sign: -1 },
        { type: 'line', category: 'burnmark Legal Expenses', label: 'Legal Expenses', sign: -1 },
        { type: 'line', category: 'burnmark IT', label: 'IT', sign: -1 },
        { type: 'line', category: 'burnmark Meals & Entertainment', label: 'Meals & Entertainment', sign: -1 },
        { type: 'line', category: 'burnmark Tax', label: 'Tax', sign: -1 },
        { type: 'line', category: 'burnmark Travel', label: 'Travel', sign: -1 },
        { type: 'line', category: 'burnmark Uniforms', label: 'Uniforms', sign: -1 },
        { type: 'subtotal', label: 'Operating Margin' },

        { type: 'section', label: 'Payroll' },
        { type: 'line', category: 'burnmark Payroll - Bonuses', label: 'Payroll – Bonuses', sign: -1 },
        { type: 'line', category: 'burnmark Payroll', label: 'Payroll', sign: -1 },
        { type: 'total', label: 'Net Operating Income' },
    ]
};

// Balance sheet categories — excluded from ALL P&L views
const BALANCE_SHEET_CATEGORIES = new Set([
    'Comcast Retirement',
    'Personal Credit Card Payment',
    'SEP IRA Dividend',
    'SEP IRA Contribution',
    'Transfer',
    'Loan',
]);

// Family & BMI P&L Schema
const FAMILY_PNL_SCHEMA = {
    family: [
        { type: 'section', label: 'Income' },
        { type: 'line', category: 'Paycheck', label: 'Paycheck', sign: 1, isIncome: true },
        { type: 'line', category: 'Interest Accrued', label: 'Interest Accrued', sign: 1, isIncome: true },
        { type: 'line', category: 'Wageworks Reimbursement', label: 'Wageworks Reimbursement', sign: 1, isIncome: true },
        { type: 'subtotal', label: 'Total Income' },

        { type: 'section', label: 'Essential Expenses' },
        { type: 'line', category: 'Rent', label: 'Rent', sign: -1 },
        { type: 'line', category: 'Groceries', label: 'Groceries', sign: -1 },
        { type: 'line', category: 'Household Essentials', label: 'Household Essentials', sign: -1 },
        { type: 'line', category: 'Household Supplies', label: 'Household Supplies', sign: -1 },
        { type: 'line', category: 'Utilities', label: 'Utilities', sign: -1 },
        { type: 'line', category: 'Caretaker', label: 'Caretaker / Childcare', sign: -1 },
        { type: 'line', category: 'Phone', label: 'Phone', sign: -1 },
        { type: 'line', category: 'Laundry', label: 'Laundry', sign: -1 },
        { type: 'line', category: 'Education', label: 'Education', sign: -1 },
        { type: 'line', category: 'Pharmacy', label: 'Pharmacy', sign: -1 },
        { type: 'line', category: 'Local Transportation', label: 'Local Transportation', sign: -1 },
        { type: 'line', category: 'Medical Services', label: 'Medical Services', sign: -1 },
        { type: 'line', category: '401k Loan Repayment', label: '401k Loan Repayment', sign: -1 },
        { type: 'line', category: 'City Tax', label: 'City Tax', sign: -1 },
        { type: 'line', category: 'Federal Tax', label: 'Federal Tax', sign: -1 },
        { type: 'line', category: 'State Tax', label: 'State Tax', sign: -1 },
        { type: 'line', category: 'Reimbursable', label: 'Reimbursable', sign: -1 },
        { type: 'line', category: 'Expense Reimbursements', label: 'Expense Reimbursements', sign: -1 },
        // Insurance Reimbursement: positive cash-in that offsets essential costs (not income)
        { type: 'line', category: 'Insurance Reimbursement', label: 'Insurance Reimbursement ↩', sign: 1 },
        { type: 'subtotal', label: 'Gross Profit' },

        { type: 'section', label: 'Quasi-Essential Expenses' },
        { type: 'line', category: 'Dining Out', label: 'Dining Out', sign: -1 },
        { type: 'line', category: 'Exercise', label: 'Exercise', sign: -1 },
        { type: 'line', category: 'Professional Services', label: 'Professional Services', sign: -1 },
        { type: 'line', category: 'Extracurricular', label: 'Extracurricular', sign: -1 },
        { type: 'line', category: 'Clothing', label: 'Clothing', sign: -1 },
        { type: 'line', category: 'Ozempic', label: 'Ozempic', sign: -1 },
        { type: 'subtotal', label: 'Operating Profit' },

        { type: 'section', label: 'Discretionary Expenses' },
        { type: 'line', category: 'Entertainment', label: 'Entertainment', sign: -1 },
        { type: 'line', category: 'Travel', label: 'Travel', sign: -1 },
        { type: 'line', category: 'Gifts', label: 'Gifts', sign: -1 },
        { type: 'line', category: 'Personal Care', label: 'Personal Care', sign: -1 },
        { type: 'line', category: 'Alcohol', label: 'Alcohol', sign: -1 },
        { type: 'line', category: 'Tournament Pool', label: 'Tournament Pool', sign: -1 },
        { type: 'line', category: 'Social', label: 'Social', sign: -1 },
        { type: 'line', category: 'Charity', label: 'Charity', sign: -1 },
        { type: 'line', category: 'Trade Investment', label: 'Trade Investment', sign: -1 },
        { type: 'line', category: 'Music Production', label: 'Music Production', sign: -1 },
        { type: 'total', label: 'Net Family Cash' },
    ],
    bmi: [
        { type: 'section', label: 'Income' },
        { type: 'line', category: 'BMI Rental Income', label: 'Rental Income', sign: 1, isIncome: true },
        { type: 'subtotal', label: 'Total BMI Income' },

        { type: 'section', label: 'Essential Expenses' },
        { type: 'line', category: 'BMI Mortgage', label: 'Mortgage', sign: -1 },
        { type: 'line', category: 'BMI Utilities', label: 'Utilities', sign: -1 },
        { type: 'line', category: 'BMI Renovations', label: 'Renovations', sign: -1 },
        { type: 'line', category: 'BMI Closing Costs', label: 'Closing Costs', sign: -1 },
        { type: 'total', label: 'BMI Net Operating Income' },
    ]
};

// DOM Elements
const loader = document.getElementById('loader');
const viewDashboard = document.getElementById('view-dashboard');
const viewUncategorized = document.getElementById('view-uncategorized');
const viewTransactions = document.getElementById('view-transactions');
const viewBalances = document.getElementById('view-balances');
const navLinks = document.querySelectorAll('.nav-links li[data-view]');
const entityRadios = document.querySelectorAll('input[name="entity"]');
const startDateInput = document.getElementById('start-date');
const endDateInput = document.getElementById('end-date');
const presetSelect = document.getElementById('date-preset');
const sidebarLogo = document.getElementById('sidebar-logo');

function formatDate(date) {
    if (!date) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

// Chart instance (Chart.js)
let chartInstance = null;

// formatters
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

const formatCurrencyAbbreviated = (amount, decimalsForMillions = 1) => {
    let isNeg = amount < 0;
    let abs = Math.abs(amount);
    let str = "";
    if (abs >= 1000000) {
        let val = (abs / 1000000).toFixed(decimalsForMillions);
        if (decimalsForMillions === 1) val = val.replace(/\.0$/, '');
        str = '$' + val + 'm';
    } else if (abs >= 1000) {
        str = '$' + (abs / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    } else {
        str = '$' + abs.toFixed(0);
    }
    return isNeg ? '-' + str : str;
};

// Parse raw amount string like " ($394.86)" or "$1,031.76 " into float
const parseAmount = (val) => {
    if (!val) return 0;
    val = String(val).trim();
    let isNegative = false;

    // Check for parentheses indicating negative
    if (val.startsWith('(') && val.endsWith(')')) {
        isNegative = true;
        val = val.substring(1, val.length - 1);
    } else if (val.startsWith('-')) {
        isNegative = true;
        val = val.substring(1);
    }

    // Remove formatting characters
    val = val.replace(/[\$,]/g, '').trim();
    let num = parseFloat(val);

    if (isNaN(num)) return 0;
    return isNegative ? -num : num;
};

// Initialize the app
function init() {
    setInitialDates();
    loadData();
    setupEventListeners();
}

function setInitialDates() {
    const today = new Date();
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // 13 months ago, 1st day of the month
    const start = new Date(today.getFullYear(), today.getMonth() - 13, 1);

    startDateInput.value = formatDate(start);
    endDateInput.value = formatDate(end);

    startDateFilter = startDateInput.value;
    endDateFilter = endDateInput.value;

    if (presetSelect) {
        presetSelect.value = 'custom';
    }
}

function applyDatePreset(preset) {
    if (preset === 'custom') return;

    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth();
    const d = today.getDate();

    let start, end;

    switch (preset) {
        case 'mtd':
            start = new Date(y, m, 1);
            end = today;
            break;
        case 'ytd':
            start = new Date(y, 0, 1);
            end = today;
            break;
        case 'last-year':
            start = new Date(y - 1, 0, 1);
            end = new Date(y - 1, 11, 31);
            break;
        case 'lytd':
            start = new Date(y - 1, 0, 1);
            end = today;
            break;
        case '2-years-ago':
            start = new Date(y - 2, 0, 1);
            end = new Date(y - 2, 11, 31);
            break;
        case '2-years-ago-td':
            start = new Date(y - 2, 0, 1);
            end = today;
            break;
        case 'all-time':
            start = null;
            end = today;
            break;
    }

    startDateInput.value = start ? formatDate(start) : '';
    endDateInput.value = formatDate(end);

    startDateFilter = startDateInput.value;
    endDateFilter = endDateInput.value;

    applyFilters();
}

function setupEventListeners() {
    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const view = e.currentTarget.getAttribute('data-view');
            switchView(view);
        });
    });

    // Entity Toggle
    entityRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            currentAccountFilter = e.target.value; // 'business' or 'family'

            const businessToggle = document.getElementById('business-pnl-toggle');
            const familyToggle = document.getElementById('family-pnl-toggle');

            // update title and logo, show correct P&L sub-toggle
            const titleEl = document.getElementById('page-title');
            if (activeView === 'dashboard') {
                if (currentAccountFilter === 'business') {
                    titleEl.textContent = 'Greengates Business';
                    sidebarLogo.src = 'assets/gg-boutique.png';
                    sidebarLogo.alt = 'Green Gates';
                    businessToggle.classList.remove('hidden');
                    familyToggle.classList.add('hidden');
                } else {
                    titleEl.textContent = 'Family Finances';
                    sidebarLogo.src = 'assets/house-konigsmark.png';
                    sidebarLogo.alt = 'Family';
                    businessToggle.classList.add('hidden');
                    familyToggle.classList.remove('hidden');
                }
            }

            applyFilters();
        });
    });

    // Date Filters
    startDateInput.addEventListener('change', (e) => {
        if (presetSelect) presetSelect.value = 'custom';
        startDateFilter = e.target.value;
        applyFilters();
    });

    endDateInput.addEventListener('change', (e) => {
        if (presetSelect) presetSelect.value = 'custom';
        endDateFilter = e.target.value;
        applyFilters();
    });

    if (presetSelect) {
        presetSelect.addEventListener('change', (e) => {
            applyDatePreset(e.target.value);
        });
    }

    // Search filter for transactions
    document.getElementById('search-transactions').addEventListener('input', (e) => {
        renderAllTransactions(e.target.value.toLowerCase());
    });

    // Business P&L mode toggle (Boutique / Overall)
    document.querySelectorAll('input[name="pnl-mode"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            pnlMode = e.target.value;
            updateDashboard();
        });
    });

    // Family P&L mode toggle (Family / BMI)
    document.querySelectorAll('input[name="pnl-family-mode"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            familyPnlMode = e.target.value;
            updateDashboard();
        });
    });

    // Copy Needs Review table to clipboard
    const copyBtn = document.getElementById('copy-uncategorized-btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', copyUncategorizedToClipboard);
    }
}

function switchView(viewName) {
    activeView = viewName;

    // Update nav classes
    navLinks.forEach(link => {
        if (link.getAttribute('data-view') === viewName) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Update visibility
    viewDashboard.classList.toggle('hidden', viewName !== 'dashboard');
    viewUncategorized.classList.toggle('hidden', viewName !== 'uncategorized');
    viewTransactions.classList.toggle('hidden', viewName !== 'transactions');
    viewBalances.classList.toggle('hidden', viewName !== 'balances');

    // Update title
    const titles = {
        'dashboard': 'Dashboard',
        'uncategorized': 'Needs Review',
        'transactions': 'All Transactions',
        'balances': 'Balance Sheet'
    };
    document.getElementById('page-title').textContent = titles[viewName];
}

// Load Data via PapaParse
function loadData() {
    loader.style.display = 'flex';
    viewDashboard.classList.add('hidden');

    Promise.all([
        new Promise((resolve, reject) => {
            Papa.parse(SHEET_URL, {
                download: true,
                header: true,
                skipEmptyLines: true,
                complete: resolve,
                error: reject
            });
        }),
        new Promise((resolve, reject) => {
            Papa.parse(BALANCE_SHEET_URL, {
                download: true,
                header: true,
                skipEmptyLines: true,
                complete: resolve,
                error: reject
            });
        })
    ]).then(([txResults, bsResults]) => {
        processData(txResults.data, bsResults.data);
        loader.style.display = 'none';
        viewDashboard.classList.remove('hidden');
    }).catch(err => {
        console.error("Error fetching CSV:", err);
        loader.innerHTML = `<p style="color:var(--danger)">Failed to load data. Please check the spreadsheet link.</p>`;
    });
}
const normalizeAccountName = (acc) => (acc || '').replace(/\s*\(xxxx[a-z0-9]+\)\s*$/i, '').trim().toLowerCase();

function processData(txData, bsData) {
    // Cleaning and formatting the raw data
    allTransactions = txData.map(item => {
        // Parse date for proper filtering
        let pDate = null;
        if (item['Date']) {
            pDate = new Date(item['Date']);
        }

        const rawDesc = item['Description'] ? item['Description'].trim() : '';
        const lowercaseDesc = rawDesc.toLowerCase();
        let cat = item['Category'] ? item['Category'].trim() : '';

        // Apply Income Split Mapping
        if (cat === 'burnmark Income') {
            if (lowercaseDesc.includes('lightspeed')) {
                cat = 'burnmark Boutique Income';
            } else {
                cat = 'burnmark Art Income';
            }
        }

        // Apply Art COGS mapping overrides
        const isArtCOGS = ART_COGS_KEYWORDS.some(keyword => lowercaseDesc.includes(keyword));
        if (isArtCOGS) {
            cat = 'burnmark Art COGS';
        }

        return {
            date: item['Date'] || '',
            parsedDate: pDate,
            description: rawDesc,
            category: cat,
            amount: parseAmount(item['Amount']),
            account: item['Account'] ? item['Account'].trim() : 'Unknown'
        };
    }).filter(item => item.date && item.description); // filter out empty rows

    // Parse Balance Sheet
    allBalances = (bsData || []).map(item => {
        return {
            account: item['Account'] || '',
            name: normalizeAccountName(item['Account']),
            updated: item['Updated'] || '',
            amount: parseAmount(item['Amount']),
            type: item['Balance Sheet'] || ''
        };
    }).filter(item => item.account !== '');

    // Initialize filter state from DOM
    const checkedRadio = document.querySelector('input[name="entity"]:checked');
    currentAccountFilter = checkedRadio ? checkedRadio.value : 'business';

    startDateFilter = startDateInput.value;
    endDateFilter = endDateInput.value;

    applyFilters();
}

function applyFilters() {
    let baseTransactions = [];
    if (currentAccountFilter === 'business') {
        // Business: include 'burnmark' categories AND blanks (so they show in Needs Review)
        baseTransactions = allTransactions.filter(t =>
            t.category.toLowerCase().startsWith('burnmark') || t.category === ''
        );
    } else { // family
        // Family: include everything that isn't 'burnmark' AND blanks
        baseTransactions = allTransactions.filter(t =>
            (!t.category.toLowerCase().startsWith('burnmark') && t.category !== '') || t.category === ''
        );
    }

    // Apply Date Range
    let sDate = startDateFilter ? new Date(startDateFilter + "T00:00:00") : null;
    let eDate = endDateFilter ? new Date(endDateFilter + "T23:59:59") : null;

    filteredTransactions = baseTransactions.filter(t => {
        if (!t.parsedDate) return false;

        if (sDate && t.parsedDate < sDate) return false;
        if (eDate && t.parsedDate > eDate) return false;

        return true;
    });

    // After filtering, update all views
    updateDashboard();
    updateUncategorized();
    renderAllTransactions();
}

// Update KPI cards and P&L statement
function updateDashboard() {
    // ── Pick the right schema and category filter based on active entity ──
    let rawSchema, categoryTotals;

    if (currentAccountFilter === 'business') {
        rawSchema = PNL_SCHEMA[pnlMode];
        categoryTotals = buildCategoryTotals(t =>
            t.category && t.category.toLowerCase().startsWith('burnmark')
        );
    } else {
        // Family view
        rawSchema = FAMILY_PNL_SCHEMA[familyPnlMode];
        if (familyPnlMode === 'bmi') {
            // BMI: only BMI-prefixed categories
            categoryTotals = buildCategoryTotals(t =>
                t.category && t.category.toLowerCase().startsWith('bmi')
            );
        } else {
            // Family: non-burnmark, non-BMI, non-balance-sheet categories
            categoryTotals = buildCategoryTotals(t =>
                t.category &&
                !t.category.toLowerCase().startsWith('burnmark') &&
                !t.category.toLowerCase().startsWith('bmi') &&
                !BALANCE_SHEET_CATEGORIES.has(t.category)
            );
        }
    }

    // Sort lines within each section
    const schema = [];
    let currentSectionLines = [];

    const flushLines = () => {
        if (currentSectionLines.length > 0) {
            currentSectionLines.sort((a, b) => {
                const valA = categoryTotals[a.category] || 0;
                const valB = categoryTotals[b.category] || 0;

                // Keep zeros at the bottom
                if (valA === 0 && valB !== 0) return 1;
                if (valB === 0 && valA !== 0) return -1;
                if (valA === 0 && valB === 0) return 0;

                // Positive values: high to low (descending)
                if (valA > 0 && valB > 0) return valB - valA;
                // Negative values: lowest to highest (e.g., -1000 before -10)
                if (valA < 0 && valB < 0) return valA - valB;
                // Positive before Negative
                if (valA > 0 && valB < 0) return -1;
                return 1;
            });
            schema.push(...currentSectionLines);
            currentSectionLines = [];
        }
    };

    rawSchema.forEach(row => {
        if (row.type === 'line') {
            currentSectionLines.push(row);
        } else {
            flushLines();
            schema.push(row);
        }
    });
    flushLines();

    // Walk the schema to compute KPI benchmarks
    let runningTotal = 0;
    let revenue = 0;
    let grossProfit = 0;
    let subtotalCount = 0;

    schema.forEach(row => {
        if (row.type === 'line') {
            const raw = categoryTotals[row.category] || 0;
            runningTotal += raw;
            if (row.isIncome) revenue += raw;
        } else if (row.type === 'subtotal' || row.type === 'total') {
            subtotalCount++;
            if (subtotalCount === 1) grossProfit = runningTotal;
        }
    });
    const netOperatingIncome = runningTotal;

    // Update KPI cards
    const kpiRevEl = document.getElementById('kpi-revenue');
    if (kpiRevEl) {
        kpiRevEl.textContent = formatCurrency(revenue);
        kpiRevEl.className = 'value ' + (revenue >= 0 ? 'positive' : 'negative');
    }
    const kpiGrossEl = document.getElementById('kpi-gross');
    if (kpiGrossEl) {
        kpiGrossEl.textContent = formatCurrency(grossProfit);
        kpiGrossEl.className = 'value ' + (grossProfit >= 0 ? 'positive' : 'negative');
    }
    const kpiNetEl = document.getElementById('kpi-net');
    kpiNetEl.textContent = formatCurrency(netOperatingIncome);
    kpiNetEl.className = 'value ' + (netOperatingIncome >= 0 ? 'positive' : 'negative');

    // Render structured P&L
    renderPnL(schema, categoryTotals);

    // Render income chart
    renderIncomeChart(schema);

    // Render recent transactions filtered to the active entity/mode
    const dashboardTransactions = filteredTransactions.filter(t => {
        if (!t.category) return false;
        if (currentAccountFilter === 'business') return t.category.toLowerCase().startsWith('burnmark');
        if (familyPnlMode === 'bmi') return t.category.toLowerCase().startsWith('bmi');
        return !t.category.toLowerCase().startsWith('burnmark') &&
            !t.category.toLowerCase().startsWith('bmi') &&
            !BALANCE_SHEET_CATEGORIES.has(t.category);
    });
    renderRecentTransactions(dashboardTransactions);

    // Render Balance Sheet and Liquid Cash Chart (Family View Only or Always)
    // To keep it clean, we'll render it if currentAccountFilter is 'family' or just show it all the time.
    // The user asked for "a clear section of the dashboard" so we can just render it.
    renderBalanceSheet();
    renderCashChart();
    renderRetirementChart();
}

// Helper: build a category totals object from filteredTransactions using a predicate
function buildCategoryTotals(predicate) {
    const totals = {};
    filteredTransactions.forEach(t => {
        if (!predicate(t)) return;
        if (!totals[t.category]) totals[t.category] = 0;
        totals[t.category] += t.amount;
    });
    return totals;
}

// ── Chart Rendering ────────────────────────────────────────────────────────────

// Chart title/subtitle map per entity+mode
const CHART_META = {
    business: {
        boutique: { title: 'Monthly Boutique Revenue', subtitle: 'Lightspeed POS sales' },
        overall: { title: 'Monthly Total Revenue', subtitle: 'All business income sources' }
    },
    family: {
        family: { title: 'Monthly Household Income', subtitle: 'Paychecks & other income' },
        bmi: { title: 'Monthly Rental Income', subtitle: 'BMI rental collections' }
    }
};

function buildMonthlyMetrics(schema) {
    // Collect all income category names from the active schema
    const incomeCategories = new Set(
        schema.filter(row => row.isIncome).map(row => row.category)
    );
    const allLineCategories = new Set(
        schema.filter(row => row.type === 'line').map(row => row.category)
    );

    const monthlyIncome = {};
    const monthlyNet = {};
    let minDate = null;
    let maxDate = null;

    filteredTransactions.forEach(t => {
        if (!t.parsedDate) return;

        // We only care about transactions that match the current schema's categories
        if (!allLineCategories.has(t.category)) return;

        const timestamp = t.parsedDate.getTime();
        if (!minDate || timestamp < minDate.getTime()) minDate = new Date(timestamp);
        if (!maxDate || timestamp > maxDate.getTime()) maxDate = new Date(timestamp);

        const key = `${t.parsedDate.getFullYear()}-${String(t.parsedDate.getMonth() + 1).padStart(2, '0')}`;

        // Track Net Profit
        if (!monthlyNet[key]) monthlyNet[key] = 0;
        monthlyNet[key] += t.amount;

        // Track Income ONLY
        if (incomeCategories.has(t.category)) {
            if (!monthlyIncome[key]) monthlyIncome[key] = 0;
            monthlyIncome[key] += t.amount;
        }
    });

    const sortedKeys = [];
    if (minDate && maxDate) {
        let curr = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
        const end = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
        while (curr <= end) {
            sortedKeys.push(`${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}`);
            curr.setMonth(curr.getMonth() + 1);
        }
    }

    const movingAvgs = [];
    const incomes = [];

    sortedKeys.forEach((key, index) => {
        incomes.push(monthlyIncome[key] || 0);
        let sum = 0;
        let count = 0;
        // Average over last 6 months (up to 6)
        for (let i = Math.max(0, index - 5); i <= index; i++) {
            sum += monthlyIncome[sortedKeys[i]] || 0;
            count++;
        }
        movingAvgs.push(sum / count);
    });

    return {
        labels: sortedKeys.map(k => {
            const [yr, mo] = k.split('-');
            return new Date(yr, mo - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        }),
        incomes,
        movingAvgs,
        latestMA: movingAvgs.length > 0 ? movingAvgs[movingAvgs.length - 1] : 0
    };
}

function renderIncomeChart(schema) {
    const canvas = document.getElementById('income-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const { labels, incomes, movingAvgs, latestMA } = buildMonthlyMetrics(schema);

    // Dynamic chart title/subtitle
    const mode = currentAccountFilter === 'business' ? pnlMode : familyPnlMode;
    const meta = CHART_META[currentAccountFilter][mode];
    document.getElementById('chart-title').textContent = meta.title;
    document.getElementById('chart-subtitle').textContent = meta.subtitle;

    // Dynamic KPI Update
    const kpiDisplay = document.getElementById('chart-kpi-value');
    if (kpiDisplay) {
        kpiDisplay.textContent = formatCurrency(latestMA);
        kpiDisplay.className = 'value ' + (latestMA >= 0 ? 'positive' : 'negative');
    }

    // Gradient fill
    const makeGradient = (chartCtx, chartArea) => {
        const grad = chartCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        grad.addColorStop(0, 'rgba(63,185,80,0.25)');
        grad.addColorStop(1, 'rgba(63,185,80,0)');
        return grad;
    };

    const datasetConfig = {
        label: 'Income',
        data: incomes,
        borderColor: '#3fb950',
        backgroundColor: (context) => {
            const chart = context.chart;
            const { ctx: c, chartArea } = chart;
            if (!chartArea) return 'transparent';
            return makeGradient(c, chartArea);
        },
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: '#3fb950',
        pointBorderColor: 'transparent',
        tension: 0.4,
        fill: true,
        order: 2
    };

    const maDatasetConfig = {
        label: '6mo MA Revenue',
        data: movingAvgs,
        borderColor: '#e2b340',
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointBackgroundColor: '#e2b340',
        pointBorderColor: 'transparent',
        tension: 0.4,
        borderDash: [5, 5],
        fill: false,
        order: 1
    };

    if (chartInstance) {
        // Smooth update
        chartInstance.data.labels = labels;
        chartInstance.data.datasets = [datasetConfig, maDatasetConfig];
        chartInstance.update('active');
        return;
    }

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets: [datasetConfig, maDatasetConfig] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { intersect: false, mode: 'index' },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(22,27,34,0.95)',
                    borderColor: '#30363d',
                    borderWidth: 1,
                    titleColor: '#8b949e',
                    bodyColor: '#e6edf3',
                    padding: 10,
                    callbacks: {
                        label: (ctx) => ' ' + ctx.dataset.label + ': ' + formatCurrency(ctx.raw)
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    border: { display: false },
                    ticks: { color: '#6e7681', font: { size: 11 }, maxRotation: 0 }
                },
                y: {
                    grid: { color: 'rgba(48,54,61,0.5)', drawBorder: false },
                    border: { display: false },
                    ticks: {
                        color: '#6e7681',
                        font: { size: 11 },
                        callback: v => {
                            if (Math.abs(v) >= 1000) return '$' + (v / 1000).toFixed(0) + 'k';
                            return '$' + v;
                        }
                    }
                }
            }
        }
    });
}

function renderPnL(schema, categoryTotals) {
    const container = document.getElementById('pnl-container');
    if (!container) return;

    const table = document.createElement('table');
    table.className = 'pnl-table';
    const tbody = document.createElement('tbody');

    let runningTotal = 0;
    let subtotalCount = 0;

    schema.forEach(row => {
        const tr = document.createElement('tr');

        if (row.type === 'section') {
            tr.className = 'pnl-row-section';
            tr.innerHTML = `<td colspan="2">${row.label}</td>`;

        } else if (row.type === 'line') {
            const raw = categoryTotals[row.category] || 0;
            runningTotal += raw;

            // If nothing posted yet, show a dim zero line
            const amtClass = raw === 0 ? 'pnl-neutral' : (raw > 0 ? 'pnl-positive' : 'pnl-negative');
            const displayAmt = raw === 0 ? '—' : formatCurrency(raw);
            tr.className = 'pnl-row-line' + (raw === 0 ? ' pnl-empty' : '');
            tr.innerHTML = `<td>${row.label}</td><td class="${amtClass}">${displayAmt}</td>`;

        } else if (row.type === 'subtotal') {
            subtotalCount++;
            const stClass = runningTotal >= 0 ? 'pnl-positive' : 'pnl-negative';
            tr.className = 'pnl-row-subtotal';
            tr.innerHTML = `<td>${row.label}</td><td class="${stClass}">${formatCurrency(runningTotal)}</td>`;

        } else if (row.type === 'total') {
            const totClass = runningTotal >= 0 ? 'pnl-positive' : 'pnl-negative';
            tr.className = 'pnl-row-total';
            tr.innerHTML = `<td>${row.label}</td><td class="${totClass}">${formatCurrency(runningTotal)}</td>`;
        }

        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    container.innerHTML = '';
    container.appendChild(table);
}

function renderRecentTransactions(dashboardTransactions) {
    const tbody = document.getElementById('recent-tbody');
    tbody.innerHTML = '';

    // Take top 5 recent from the strictly filtered dashboard data
    const recent = dashboardTransactions.slice(0, 5);

    recent.forEach(t => {
        const tr = document.createElement('tr');
        const colorClass = t.amount < 0 ? 'negative' : 'positive';
        tr.innerHTML = `
            <td>${t.date}</td>
            <td class="desc-cell" title="${t.description}">${t.description}</td>
            <td class="align-right ${colorClass} font-mono">${formatCurrency(t.amount)}</td>
        `;
        tbody.appendChild(tr);
    });
}

function updateUncategorized() {
    const uncategorized = filteredTransactions.filter(t => !t.category || t.category.trim() === '');
    const badge = document.getElementById('uncategorized-badge');
    const tbody = document.getElementById('uncategorized-tbody');

    tbody.innerHTML = '';

    if (uncategorized.length > 0) {
        badge.textContent = uncategorized.length;
        badge.classList.remove('hidden');

        uncategorized.forEach(t => {
            const tr = document.createElement('tr');
            const colorClass = t.amount < 0 ? 'negative' : 'positive';
            tr.innerHTML = `
                <td>${t.date}</td>
                <td class="desc-cell" title="${t.description}">${t.description}</td>
                <td></td>
                <td class="align-right ${colorClass} font-mono">${formatCurrency(t.amount)}</td>
                <td><span class="cat-badge">${t.account}</span></td>
            `;
            tbody.appendChild(tr);
        });
    } else {
        badge.classList.add('hidden');
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 32px; color: var(--text-muted)">All transactions are categorized! 🎉</td></tr>`;
    }
}

function copyUncategorizedToClipboard() {
    const uncategorized = filteredTransactions.filter(t => !t.category || t.category.trim() === '');
    let tsv = "Date\tDescription\tCategory\tAmount\tAccount\n";

    uncategorized.forEach(t => {
        let amtStr = t.amount < 0
            ? ` ($${Math.abs(t.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`
            : ` $${t.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        tsv += `${t.date}\t${t.description}\t\t${amtStr}\t${t.account}\n`;
    });

    // Copy to clipboard
    navigator.clipboard.writeText(tsv).then(() => {
        const btn = document.getElementById('copy-uncategorized-btn');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="ph ph-check"></i> Copied!';
        setTimeout(() => {
            btn.innerHTML = originalHTML;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy to clipboard', err);
    });
}

function renderAllTransactions(searchTerm = '') {
    const tbody = document.getElementById('all-transactions-tbody');
    tbody.innerHTML = '';

    let displayList = filteredTransactions;
    if (searchTerm) {
        displayList = displayList.filter(t =>
            t.description.toLowerCase().includes(searchTerm) ||
            (t.category && t.category.toLowerCase().includes(searchTerm))
        );
    }

    displayList.forEach(t => {
        const tr = document.createElement('tr');
        const colorClass = t.amount < 0 ? 'negative' : 'positive';

        const catMarkup = t.category
            ? `<span class="cat-badge">${t.category}</span>`
            : `<span class="cat-badge cat-unassigned"><i class="ph ph-warning"></i> Needs Category</span>`;

        tr.innerHTML = `
            <td>${t.date}</td>
            <td class="desc-cell" title="${t.description}">${t.description}</td>
            <td>${catMarkup}</td>
            <td><span class="cat-badge" style="background:var(--bg-main)">${t.account}</span></td>
            <td class="align-right ${colorClass} font-mono">${formatCurrency(t.amount)}</td>
        `;
        tbody.appendChild(tr);
    });
}
window.toggleBsSection = function (sectionClass, toggleElement) {
    toggleElement.classList.toggle('expanded');
    const rows = document.querySelectorAll('.' + sectionClass);
    rows.forEach(row => {
        row.classList.toggle('bs-hidden');
    });
};

function renderBalanceSheet() {
    const container = document.getElementById('balance-sheet-container');
    const bsDateEl = document.getElementById('bs-date');
    if (!container || !bsDateEl) return;

    let totalLiquid = 0;

    // Sort balances by amount descending 
    let sortedBalances = [...allBalances].sort((a, b) => b.amount - a.amount);

    // Group into Assets and Liabilities
    let assets = sortedBalances.filter(a => a.type === 'Asset' && !a.name.includes('retirement') && !a.name.includes('ira') && !a.name.includes('401k') && !a.name.includes('accumulation plan') && !a.name.includes('rsu'));
    let retirement = sortedBalances.filter(a => a.type === 'Asset' && (a.name.includes('retirement') || a.name.includes('ira') || a.name.includes('401k') || a.name.includes('accumulation plan') || a.name.includes('rsu')));
    let liabilities = sortedBalances.filter(a => a.type === 'Liability');

    let totalAssets = assets.reduce((sum, a) => sum + a.amount, 0);
    let totalRetirement = retirement.reduce((sum, a) => sum + a.amount, 0);
    let totalLiabilities = liabilities.reduce((sum, a) => sum + a.amount, 0);

    // Family Equity
    let familyEquity = (totalAssets + totalRetirement) - totalLiabilities;

    // Grab the latest 'Updated' datestring
    let latestUpdate = allBalances.length > 0 ? allBalances[0].updated : 'N/A';
    bsDateEl.textContent = `As of ${latestUpdate}`;

    let html = `
        <table class="pnl-table" style="border-collapse: collapse; width: 100%;">
            <tbody>
    `;

    // 1. Total Liquid Assets
    html += `
        <tr class="pnl-row-subtotal bs-toggle" onclick="toggleBsSection('bs-liquid', this)">
            <td><i class="ph-fill ph-caret-right bs-icon"></i> Total Liquid Assets</td>
            <td class="pnl-positive align-right">${formatCurrency(totalAssets)}</td>
        </tr>
    `;

    assets.forEach(a => {
        let isLiquid = a.name.includes('checking') || a.name.includes('savings');
        if (isLiquid) totalLiquid += a.amount;

        let label = a.account;
        if (isLiquid) label += ' <span style="font-size:10px; color:var(--text-muted);">(Liquid)</span>';

        html += `
            <tr class="pnl-row-line bs-detail-row bs-hidden bs-liquid">
                <td>${label}</td>
                <td class="align-right ${a.amount >= 0 ? 'pnl-positive' : 'pnl-negative'}">${formatCurrency(a.amount)}</td>
            </tr>
        `;
    });

    // 2. Total Liabilities
    html += `
        <tr class="pnl-row-subtotal bs-toggle" onclick="toggleBsSection('bs-liab', this)">
            <td><i class="ph-fill ph-caret-right bs-icon"></i> Total Liabilities</td>
            <td class="pnl-negative align-right">${formatCurrency(totalLiabilities)}</td>
        </tr>
    `;

    liabilities.forEach(a => {
        html += `
            <tr class="pnl-row-line bs-detail-row bs-hidden bs-liab">
                <td>${a.account}</td>
                <td class="align-right pnl-negative">${formatCurrency(a.amount)}</td>
            </tr>
        `;
    });

    // 3. Cash Available
    let cashAvailable = totalAssets - totalLiabilities;
    html += `
        <tr class="pnl-row-total" style="background:var(--bg-surface-hover);">
            <td>Cash Available</td>
            <td class="align-right ${cashAvailable >= 0 ? 'pnl-positive' : 'pnl-negative'}">${formatCurrency(cashAvailable)}</td>
        </tr>
    `;

    // 4. Total Retirement Assets
    html += `
        <tr class="pnl-row-subtotal bs-toggle" onclick="toggleBsSection('bs-ret', this)">
            <td><i class="ph-fill ph-caret-right bs-icon"></i> Total Retirement</td>
            <td class="pnl-positive align-right">${formatCurrency(totalRetirement)}</td>
        </tr>
    `;

    retirement.forEach(a => {
        html += `
            <tr class="pnl-row-line bs-detail-row bs-hidden bs-ret">
                <td>${a.account}</td>
                <td class="align-right pnl-positive">${formatCurrency(a.amount)}</td>
            </tr>
        `;
    });

    // 5. Family Equity
    html += `
        <tr class="pnl-row-total" style="background:var(--bg-main); border-top:2px solid var(--border-color);">
            <td>Family Equity</td>
            <td class="align-right ${familyEquity >= 0 ? 'pnl-positive' : 'pnl-neutral'}">${formatCurrency(familyEquity)}</td>
        </tr>
    `;

    html += `</tbody></table>`;
    container.innerHTML = html;
}

let cashChartInstance = null;

function renderCashChart() {
    const canvas = document.getElementById('cash-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // 1. Compute History
    const liquidBalances = allBalances.filter(b =>
        b.type === 'Asset' && (b.name.includes('checking') || b.name.includes('savings'))
    );
    let currentCash = liquidBalances.reduce((sum, b) => sum + b.amount, 0);

    const validNames = new Set(liquidBalances.map(b => b.name));

    const dailyNet = {};
    allTransactions.forEach(t => {
        if (!t.parsedDate || !t.account) return;
        const txAcc = normalizeAccountName(t.account);
        if (validNames.has(txAcc)) {
            const dStr = formatDate(t.parsedDate);
            if (!dailyNet[dStr]) dailyNet[dStr] = 0;
            // Transactions are exactly the net change on the account.
            // Pos = income/deposit, Neg = expense/withdrawal.
            dailyNet[dStr] += t.amount;
        }
    });

    let historyLabels = [];
    let historyData = [];

    // Go back 365 days (1 year) for better historical perspective
    let d = new Date();
    let runningBalance = currentCash;
    let endTs = d.getTime();
    let startTs = d.getTime() - (365 * 24 * 60 * 60 * 1000);

    let backwardData = [];
    let backwardLabels = [];

    let currentDate = new Date(endTs);
    while (currentDate.getTime() >= startTs) {
        let dStr = formatDate(currentDate);

        backwardLabels.push(currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        backwardData.push(runningBalance);

        // Before yesterday, balance was currentBalance - yesterday_transactions
        if (dailyNet[dStr]) {
            runningBalance -= dailyNet[dStr];
        }

        currentDate.setDate(currentDate.getDate() - 1);
    }

    // Reverse for ascending time order
    historyLabels = backwardLabels.reverse();
    historyData = backwardData.reverse();

    // Update KPI
    const cashKpi = document.getElementById('liquid-cash-kpi');
    if (cashKpi) {
        cashKpi.textContent = formatCurrencyAbbreviated(currentCash);
        cashKpi.className = 'value ' + (currentCash >= 0 ? 'positive' : 'negative');
    }

    // Chart Configuration
    const makeGradient = (chartCtx, chartArea) => {
        const grad = chartCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        grad.addColorStop(0, 'rgba(63,185,80,0.4)');
        grad.addColorStop(1, 'rgba(63,185,80,0)');
        return grad;
    };

    const dsConfig = {
        label: 'Total Liquid Cash',
        data: historyData,
        borderColor: '#3fb950',
        backgroundColor: (context) => {
            const chart = context.chart;
            const { ctx: c, chartArea } = chart;
            if (!chartArea) return 'transparent';
            return makeGradient(c, chartArea);
        },
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointBackgroundColor: '#3fb950',
        pointBorderColor: 'transparent',
        tension: 0.1,
        fill: true,
    };

    if (cashChartInstance) {
        cashChartInstance.data.labels = historyLabels;
        cashChartInstance.data.datasets = [dsConfig];
        cashChartInstance.update('active');
        return;
    }

    cashChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: historyLabels,
            datasets: [dsConfig]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(13, 17, 23, 0.9)',
                    titleColor: '#e6edf3',
                    bodyColor: '#e6edf3',
                    borderColor: '#30363d',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function (context) {
                            return ' Cash: ' + formatCurrency(context.raw);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: { color: '#30363d', drawBorder: false },
                    ticks: {
                        color: '#6e7681',
                        callback: (value) => {
                            return formatCurrencyAbbreviated(value);
                        }
                    }
                },
                x: {
                    grid: { display: false, drawBorder: false },
                    ticks: { color: '#6e7681', maxTicksLimit: 6 }
                }
            }
        }
    });
}

let retirementChartInstance = null;

function renderRetirementChart() {
    const canvas = document.getElementById('retirement-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // 1. Compute History
    const retirementBalances = allBalances.filter(b =>
        b.type === 'Asset' && (b.name.includes('retirement') || b.name.includes('ira') || b.name.includes('401k') || b.name.includes('accumulation plan') || b.name.includes('rsu'))
    );
    let currentRetirement = retirementBalances.reduce((sum, b) => sum + b.amount, 0);

    const validNames = new Set(retirementBalances.map(b => b.name));

    const dailyNet = {};
    allTransactions.forEach(t => {
        if (!t.parsedDate || !t.account) return;
        const txAcc = normalizeAccountName(t.account);
        if (validNames.has(txAcc)) {
            const dStr = formatDate(t.parsedDate);
            if (!dailyNet[dStr]) dailyNet[dStr] = 0;
            // Transactions are exactly the net change on the account.
            // Pos = income/deposit, Neg = expense/withdrawal.
            dailyNet[dStr] += t.amount;
        }
    });

    let historyLabels = [];
    let historyData = [];

    // Go back 365 days (1 year) for better historical perspective
    let d = new Date();
    let runningBalance = currentRetirement;
    let endTs = d.getTime();
    let startTs = d.getTime() - (365 * 24 * 60 * 60 * 1000);

    let backwardData = [];
    let backwardLabels = [];

    let currentDate = new Date(endTs);
    while (currentDate.getTime() >= startTs) {
        let dStr = formatDate(currentDate);

        backwardLabels.push(currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        backwardData.push(runningBalance);

        // Before yesterday, balance was currentBalance - yesterday_transactions
        if (dailyNet[dStr]) {
            runningBalance -= dailyNet[dStr];
        }

        currentDate.setDate(currentDate.getDate() - 1);
    }

    // Reverse for ascending time order
    historyLabels = backwardLabels.reverse();
    historyData = backwardData.reverse();

    // Update KPI
    const retKpi = document.getElementById('retirement-kpi');
    if (retKpi) {
        retKpi.textContent = formatCurrencyAbbreviated(currentRetirement, 2);
        retKpi.className = 'value ' + (currentRetirement >= 0 ? 'positive' : 'negative');
    }

    // Chart Configuration
    const makeGradient = (chartCtx, chartArea) => {
        const grad = chartCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        grad.addColorStop(0, 'rgba(139,92,246,0.4)'); // purple
        grad.addColorStop(1, 'rgba(139,92,246,0)');
        return grad;
    };

    const dsConfig = {
        label: 'Total Retirement Assets',
        data: historyData,
        borderColor: '#8b5cf6',
        backgroundColor: (context) => {
            const chart = context.chart;
            const { ctx: c, chartArea } = chart;
            if (!chartArea) return 'transparent';
            return makeGradient(c, chartArea);
        },
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointBackgroundColor: '#8b5cf6',
        pointBorderColor: 'transparent',
        tension: 0.1,
        fill: true,
    };

    if (retirementChartInstance) {
        retirementChartInstance.data.labels = historyLabels;
        retirementChartInstance.data.datasets = [dsConfig];
        retirementChartInstance.update('active');
        return;
    }

    retirementChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: historyLabels,
            datasets: [dsConfig]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(13, 17, 23, 0.9)',
                    titleColor: '#e6edf3',
                    bodyColor: '#e6edf3',
                    borderColor: '#30363d',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function (context) {
                            return ' Balance: ' + formatCurrency(context.raw);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: { color: '#30363d', drawBorder: false },
                    ticks: {
                        color: '#6e7681',
                        callback: (value) => {
                            return formatCurrencyAbbreviated(value, 2);
                        }
                    }
                },
                x: {
                    grid: { display: false, drawBorder: false },
                    ticks: { color: '#6e7681', maxTicksLimit: 6 }
                }
            }
        }
    });
}

// Auth gate — runs before app init
document.addEventListener('DOMContentLoaded', () => {
    const loginScreen = document.getElementById('login-screen');
    const appContainer = document.getElementById('app-container');
    const loginBtn = document.getElementById('login-btn');
    const loginBtnText = document.getElementById('login-btn-text');
    const loginPassword = document.getElementById('login-password');
    const loginError = document.getElementById('login-error');

    function revealApp() {
        loginScreen.style.opacity = '0';
        loginScreen.style.transition = 'opacity 0.4s ease';
        setTimeout(() => {
            loginScreen.style.display = 'none';
            appContainer.style.display = '';
            init();
        }, 400);
    }

    // If already authenticated this session, skip login
    if (isAuthenticated()) {
        loginScreen.style.display = 'none';
        appContainer.style.display = '';
        init();
        return;
    }

    // Login button click handler
    async function attemptLogin() {
        const password = loginPassword.value;
        if (!password) return;

        loginBtnText.textContent = 'VERIFYING...';
        loginBtn.disabled = true;
        loginError.textContent = '';

        try {
            const valid = await verifyPassword(password);
            if (valid) {
                setAuthenticated();
                revealApp();
            } else {
                loginError.textContent = 'Incorrect passphrase. Access denied.';
                loginPassword.value = '';
                loginPassword.focus();
                // Shake animation
                loginPassword.closest('.login-input-group').classList.add('shake');
                setTimeout(() => loginPassword.closest('.login-input-group').classList.remove('shake'), 500);
            }
        } catch (e) {
            loginError.textContent = 'Authentication error. Please try again.';
        }

        loginBtnText.textContent = 'ACCESS DASHBOARD';
        loginBtn.disabled = false;
    }

    loginBtn.addEventListener('click', attemptLogin);
    loginPassword.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') attemptLogin();
    });
    loginPassword.focus();
});

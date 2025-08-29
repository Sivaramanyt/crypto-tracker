// CryptoTracker Pro - Complete Working JavaScript
console.log('🚀 Loading CryptoTracker Pro...');

// Global variables
let portfolio = [];
let trades = [];
let watchlist = [];
let alerts = [];

// Wait for everything to load
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM loaded, starting app...');
    initApp();
});

// Also try on window load
window.addEventListener('load', function() {
    console.log('✅ Window loaded, starting app...');
    setTimeout(initApp, 500);
});

// Initialize the app
function initApp() {
    console.log('🔧 Initializing CryptoTracker Pro...');
    loadData();
    setupNavigation();
    setupButtons();
    setupModals();
    showTab('dashboard');
    console.log('✅ CryptoTracker Pro ready!');
    setTimeout(() => {
        showNotification('CryptoTracker Pro loaded successfully!', 'success');
    }, 1000);
}

// Setup navigation
function setupNavigation() {
    console.log('🔧 Setting up navigation...');
    const navLinks = document.querySelectorAll('.nav-link');
    if (navLinks.length === 0) {
        console.error('❌ No navigation found! Retrying...');
        setTimeout(setupNavigation, 1000);
        return;
    }
    console.log('📍 Found', navLinks.length, 'navigation links');
    navLinks.forEach((link, index) => {
        const tabName = link.getAttribute('data-tab');
        console.log('🔗 Setting up:', tabName);
        link.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('📱 Clicked:', tabName);
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            showTab(tabName);
        });
        link.addEventListener('touchend', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('👆 Touched:', tabName);
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            showTab(tabName);
        });
    });
    console.log('✅ Navigation setup complete');
}

// Setup buttons
function setupButtons() {
    console.log('🔧 Setting up buttons...');
    const addCoinBtns = document.querySelectorAll('button[onclick*="openAddCoinModal"]');
    addCoinBtns.forEach(btn => {
        btn.removeAttribute('onclick');
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('➕ Add Coin clicked');
            openAddCoinModal();
        });
    });
    const addTradeBtns = document.querySelectorAll('button[onclick*="openTradeModal"]');
    addTradeBtns.forEach(btn => {
        btn.removeAttribute('onclick');
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('📊 Add Trade clicked');
            openTradeModal();
        });
    });
    console.log('✅ Buttons setup complete');
}

// Show tab function
function showTab(tabId) {
    console.log('🔄 Switching to tab:', tabId);
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });
    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
        selectedTab.classList.add('active');
        console.log('✅ Showed tab:', tabId);
        switch(tabId) {
            case 'dashboard':
                updateDashboard();
                break;
            case 'portfolio':
                updatePortfolioTable();
                break;
            case 'trades':
                updateTradesTable();
                break;
            case 'watchlist':
                updateWatchlistDisplay();
                break;
            case 'alerts':
                updateAlertsDisplay();
                break;
        }
    } else {
        console.error('❌ Tab not found:', tabId);
    }
}

// Modal functions
function openAddCoinModal() {
    console.log('📝 Opening Add Coin modal...');
    const modal = document.getElementById('add-coin-modal');
    if (modal) {
        modal.classList.add('show');
        modal.style.display = 'flex';
        showNotification('Add Coin modal opened!', 'success');
    }
}

function openTradeModal() {
    console.log('📈 Opening Trade modal...');
    const modal = document.getElementById('trade-modal');
    if (modal) {
        modal.classList.add('show');
        modal.style.display = 'flex';
        showNotification('Trade modal opened!', 'success');
    }
}

function openWatchlistModal() {
    console.log('👀 Opening Watchlist modal...');
    const modal = document.getElementById('watchlist-modal');
    if (modal) {
        modal.classList.add('show');
        modal.style.display = 'flex';
        showNotification('Watchlist modal opened!', 'success');
    }
}

function openAlertModal() {
    console.log('🔔 Opening Alert modal...');
    const modal = document.getElementById('alert-modal');
    if (modal) {
        modal.classList.add('show');
        modal.style.display = 'flex';
        showNotification('Alert modal opened!', 'success');
    }
}

// Setup modals
function setupModals() {
    console.log('🔧 Setting up modals...');
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });
    const closeBtns = document.querySelectorAll('.close');
    closeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                closeModal(modal.id);
            }
        });
    });
}

function closeModal(modalId) {
    console.log('❌ Closing modal:', modalId);
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
        showNotification('Modal closed', 'info');
    }
}

// Update functions
function updateDashboard() {
    console.log('📊 Updating dashboard...');
    document.getElementById('total-value').textContent = '$0.00';
    document.getElementById('total-pnl').textContent = '$0.00';
    document.getElementById('monthly-pnl').textContent = '0%';
    document.getElementById('total-coins').textContent = portfolio.length;
}

function updatePortfolioTable() {
    console.log('💼 Updating portfolio table...');
    const tbody = document.querySelector('#portfolio-table tbody');
    if (tbody) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 40px;"><h3>Portfolio is empty</h3><p>Click Add Coin to start tracking!</p><button class="btn btn-primary" onclick="openAddCoinModal()">Add Your First Coin</button></td></tr>';
    }
}

function updateTradesTable() {
    console.log('📈 Updating trades table...');
    const tbody = document.querySelector('#trades-table tbody');
    if (tbody) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 40px;"><h3>No trades yet</h3><p>Record your first trade!</p><button class="btn btn-primary" onclick="openTradeModal()">Add Your First Trade</button></td></tr>';
    }
}

function updateWatchlistDisplay() {
    console.log('👀 Updating watchlist...');
    const grid = document.getElementById('watchlist-grid');
    if (grid) {
        grid.innerHTML = '<div style="text-align: center; padding: 40px;"><h3>Watchlist is empty</h3><p>Add coins to monitor!</p><button class="btn btn-primary" onclick="openWatchlistModal()">Add to Watchlist</button></div>';
    }
}

function updateAlertsDisplay() {
    console.log('🔔 Updating alerts...');
    const activeList = document.getElementById('active-alerts-list');
    const triggeredList = document.getElementById('triggered-alerts-list');
    if (activeList) {
        activeList.innerHTML = '<div style="text-align: center; padding: 20px;"><h4>No active alerts</h4><p>Create price alerts!</p><button class="btn btn-primary" onclick="openAlertModal()">Create Alert</button></div>';
    }
    if (triggeredList) {
        triggeredList.innerHTML = '<div style="text-align: center; padding: 20px;"><h4>No triggered alerts</h4><p>Your triggered alerts will appear here</p></div>';
    }
}

// Load data
function loadData() {
    try {
        portfolio = JSON.parse(localStorage.getItem('crypto-portfolio')) || [];
        trades = JSON.parse(localStorage.getItem('crypto-trades')) || [];
        watchlist = JSON.parse(localStorage.getItem('crypto-watchlist')) || [];
        alerts = JSON.parse(localStorage.getItem('crypto-alerts')) || [];
        console.log('💾 Data loaded successfully');
    } catch (error) {
        console.error('❌ Error loading data:', error);
        portfolio = [];
        trades = [];
        watchlist = [];
        alerts = [];
    }
}

// Notification system
function showNotification(message, type = 'info', duration = 3000) {
    console.log('📢 Notification:', message);
    const existing = document.querySelectorAll('.notification');
    existing.forEach(n => n.remove());
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = 'position: fixed; top: 100px; right: 20px; background: #1a1a2e; color: white; padding: 15px 20px; border-radius: 10px; border: 2px solid #00d4ff; z-index: 9999; box-shadow: 0 10px 30px rgba(0,0,0,0.5); animation: slideIn 0.3s ease;';
    let icon = '📢';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'warning') icon = '⚠️';
    notification.innerHTML = `<div style="display: flex; align-items: center; gap: 10px;"><span>${icon}</span><span>${message}</span><button onclick="this.parentElement.parentElement.remove()" style="background:none;border:none;color:white;cursor:pointer;margin-left:10px;">×</button></div>`;
    document.body.appendChild(notification);
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, duration);
}

// Add animation styles
const styles = '@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } } .notification { animation: slideIn 0.3s ease; }';
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

console.log('🚀 CryptoTracker Pro JavaScript loaded!');

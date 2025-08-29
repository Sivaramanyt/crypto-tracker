// CryptoTracker Pro - GitHub Pages Compatible Version
console.log('🚀 Loading CryptoTracker Pro...');

// Global variables
let portfolio = JSON.parse(localStorage.getItem('crypto-portfolio')) || [];
let trades = JSON.parse(localStorage.getItem('crypto-trades')) || [];
let watchlist = JSON.parse(localStorage.getItem('crypto-watchlist')) || [];
let alerts = JSON.parse(localStorage.getItem('crypto-alerts')) || [];

// Multiple initialization attempts
document.addEventListener('DOMContentLoaded', initializeApp);
window.addEventListener('load', initializeApp);
setTimeout(initializeApp, 1000);
setTimeout(initializeApp, 3000);

// Initialize Application
function initializeApp() {
    if (document.querySelector('.nav-link')) {
        console.log('✅ Initializing CryptoTracker Pro...');
        setupNavigation();
        setupButtons();
        setupModals();
        setupForms();
        showTab('dashboard');
        updateDisplay();
        showNotification('CryptoTracker Pro loaded successfully!', 'success');
    } else {
        console.log('⏳ Waiting for DOM elements...');
        setTimeout(initializeApp, 500);
    }
}

// Navigation Setup
function setupNavigation() {
    console.log('🔧 Setting up navigation...');
    
    document.querySelectorAll('.nav-link').forEach(link => {
        const tabName = link.getAttribute('data-tab');
        
        // Remove old listeners
        link.replaceWith(link.cloneNode(true));
        const newLink = document.querySelector(`[data-tab="${tabName}"]`);
        
        newLink.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('📱 Clicked:', tabName);
            
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            showTab(tabName);
        });
        
        newLink.addEventListener('touchend', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('👆 Touched:', tabName);
            
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            showTab(tabName);
        });
    });
    
    console.log('✅ Navigation setup complete');
}

// Button Setup
function setupButtons() {
    console.log('🔧 Setting up buttons...');
    
    // Add Coin buttons
    document.querySelectorAll('button').forEach(btn => {
        if (btn.textContent.includes('Add Coin') || btn.onclick && btn.onclick.toString().includes('openAddCoinModal')) {
            btn.onclick = null;
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('➕ Add Coin clicked');
                openAddCoinModal();
            });
        }
        
        if (btn.textContent.includes('Add Trade') || btn.onclick && btn.onclick.toString().includes('openTradeModal')) {
            btn.onclick = null;
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('📊 Add Trade clicked');
                openTradeModal();
            });
        }
    });
    
    console.log('✅ Buttons setup complete');
}

// Tab Display
function showTab(tabId) {
    console.log('🔄 Switching to tab:', tabId);
    
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
        selectedTab.classList.add('active');
        console.log('✅ Showed tab:', tabId);
        updateDisplay();
    } else {
        console.error('❌ Tab not found:', tabId);
    }
}

// Modal Functions
function openAddCoinModal() {
    const modal = document.getElementById('add-coin-modal');
    if (modal) {
        modal.classList.add('show');
        modal.style.display = 'flex';
        showNotification('Add Coin modal opened!', 'success');
    }
}

function openTradeModal() {
    const modal = document.getElementById('trade-modal');
    if (modal) {
        modal.classList.add('show');
        modal.style.display = 'flex');
        showNotification('Trade modal opened!', 'success');
    }
}

function openWatchlistModal() {
    const modal = document.getElementById('watchlist-modal');
    if (modal) {
        modal.classList.add('show');
        modal.style.display = 'flex';
        showNotification('Watchlist modal opened!', 'success');
    }
}

function openAlertModal() {
    const modal = document.getElementById('alert-modal');
    if (modal) {
        modal.classList.add('show');
        modal.style.display = 'flex';
        showNotification('Alert modal opened!', 'success');
    }
}

// Modal Setup
function setupModals() {
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });
    
    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) closeModal(modal.id);
        });
    });
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
        showNotification('Modal closed', 'info');
    }
}

// Form Setup
function setupForms() {
    // Add Coin Form
    const addCoinForm = document.getElementById('add-coin-form');
    if (addCoinForm) {
        addCoinForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addCoin();
        });
    }
}

// Add Coin Function
function addCoin() {
    const symbol = document.getElementById('coin-symbol')?.value?.trim().toUpperCase();
    const holdings = parseFloat(document.getElementById('coin-holdings')?.value);
    const buyPrice = parseFloat(document.getElementById('coin-buy-price')?.value);
    
    if (!symbol || !holdings || !buyPrice || holdings <= 0 || buyPrice <= 0) {
        showNotification('Please fill all fields with valid values!', 'error');
        return;
    }
    
    const newCoin = {
        id: Date.now().toString(),
        symbol: symbol,
        name: symbol,
        holdings: holdings,
        avgBuyPrice: buyPrice,
        currentPrice: buyPrice,
        marketValue: holdings * buyPrice,
        pnl: 0,
        pnlPercentage: 0,
        change24h: 0,
        dateAdded: new Date().toISOString()
    };
    
    portfolio.push(newCoin);
    localStorage.setItem('crypto-portfolio', JSON.stringify(portfolio));
    
    showNotification(`Added ${symbol} to portfolio successfully!`, 'success');
    updateDisplay();
    closeModal('add-coin-modal');
    document.getElementById('add-coin-form').reset();
}

// Update Display
function updateDisplay() {
    // Update dashboard
    if (document.getElementById('total-value')) {
        const totalValue = portfolio.reduce((sum, coin) => sum + coin.marketValue, 0);
        document.getElementById('total-value').textContent = `$${totalValue.toFixed(2)}`;
        document.getElementById('total-coins').textContent = portfolio.length;
    }
    
    // Update portfolio table
    const portfolioTbody = document.querySelector('#portfolio-table tbody');
    if (portfolioTbody) {
        if (portfolio.length === 0) {
            portfolioTbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 40px;"><h3>Portfolio is empty</h3><p>Click Add Coin to start!</p><button class="btn btn-primary" onclick="openAddCoinModal()">Add Your First Coin</button></td></tr>';
        } else {
            portfolioTbody.innerHTML = '';
            portfolio.forEach(coin => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><strong>${coin.symbol}</strong></td>
                    <td>${coin.holdings.toFixed(6)}</td>
                    <td>$${coin.currentPrice.toFixed(4)}</td>
                    <td>$${coin.marketValue.toFixed(2)}</td>
                    <td>$${coin.avgBuyPrice.toFixed(4)}</td>
                    <td>$${coin.pnl.toFixed(2)}</td>
                    <td>${coin.pnlPercentage.toFixed(2)}%</td>
                    <td>${coin.change24h.toFixed(2)}%</td>
                    <td><button class="btn btn-danger btn-sm" onclick="removeCoin('${coin.id}')">Remove</button></td>
                `;
                portfolioTbody.appendChild(row);
            });
        }
    }
}

// Notification System
function showNotification(message, type = 'info', duration = 3000) {
    console.log('📢', message);
    
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = 'position: fixed; top: 100px; right: 20px; background: #1a1a2e; color: white; padding: 15px 20px; border-radius: 10px; border: 2px solid #00d4ff; z-index: 9999; box-shadow: 0 10px 30px rgba(0,0,0,0.5);';
    
    let icon = '📢';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'warning') icon = '⚠️';
    
    notification.innerHTML = `<div style="display: flex; align-items: center; gap: 10px;"><span>${icon}</span><span>${message}</span><button onclick="this.parentElement.parentElement.remove()" style="background:none;border:none;color:white;cursor:pointer;margin-left:10px;">×</button></div>`;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) notification.remove();
    }, duration);
}

// Remove coin function
function removeCoin(coinId) {
    if (!confirm('Remove this coin from portfolio?')) return;
    
    portfolio = portfolio.filter(coin => coin.id !== coinId);
    localStorage.setItem('crypto-portfolio', JSON.stringify(portfolio));
    
    showNotification('Coin removed successfully!', 'success');
    updateDisplay();
}

console.log('🚀 CryptoTracker Pro - GitHub Pages Compatible Version Loaded!');

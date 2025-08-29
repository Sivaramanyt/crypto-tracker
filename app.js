// CryptoTracker Pro - Complete Working JavaScript with Form Functionality
console.log('🚀 Loading CryptoTracker Pro...');

// Global variables
let portfolio = JSON.parse(localStorage.getItem('crypto-portfolio')) || [];
let trades = JSON.parse(localStorage.getItem('crypto-trades')) || [];
let watchlist = JSON.parse(localStorage.getItem('crypto-watchlist')) || [];
let alerts = JSON.parse(localStorage.getItem('crypto-alerts')) || [];

// Wait for everything to load
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM loaded, starting app...');
    initApp();
});

// Initialize the app
function initApp() {
    console.log('🔧 Initializing CryptoTracker Pro...');
    loadData();
    setupNavigation();
    setupButtons();
    setupModals();
    setupFormSubmissions(); // NEW: Setup form handlers
    showTab('dashboard');
    console.log('✅ CryptoTracker Pro ready!');
    setTimeout(() => {
        showNotification('CryptoTracker Pro loaded successfully!', 'success');
    }, 1000);
}

// NEW: Setup form submission handlers
function setupFormSubmissions() {
    console.log('📝 Setting up form submissions...');
    
    // Add Coin Form
    const addCoinForm = document.getElementById('add-coin-form');
    if (addCoinForm) {
        addCoinForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addCoin();
        });
    }
    
    // Add Trade Form  
    const tradeForm = document.getElementById('trade-form');
    if (tradeForm) {
        tradeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addTrade();
        });
    }
    
    // Add Watchlist Form
    const watchlistForm = document.getElementById('watchlist-form');
    if (watchlistForm) {
        watchlistForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addToWatchlist();
        });
    }
    
    // Add Alert Form
    const alertForm = document.getElementById('alert-form');
    if (alertForm) {
        alertForm.addEventListener('submit', function(e) {
            e.preventDefault();
            createAlert();
        });
    }
}

// ADD COIN FUNCTION - COMPLETE
function addCoin() {
    console.log('💰 Adding coin to portfolio...');
    
    const symbol = document.getElementById('coin-symbol')?.value?.trim().toUpperCase();
    const holdings = parseFloat(document.getElementById('coin-holdings')?.value);
    const buyPrice = parseFloat(document.getElementById('coin-buy-price')?.value);
    
    if (!symbol || !holdings || !buyPrice || holdings <= 0 || buyPrice <= 0) {
        showNotification('Please fill all fields with valid values!', 'error');
        return;
    }
    
    // Check if coin already exists
    const existingCoin = portfolio.find(coin => coin.symbol === symbol);
    
    if (existingCoin) {
        // Update existing coin
        const totalValue = (existingCoin.holdings * existingCoin.avgBuyPrice) + (holdings * buyPrice);
        const totalHoldings = existingCoin.holdings + holdings;
        
        existingCoin.holdings = totalHoldings;
        existingCoin.avgBuyPrice = totalValue / totalHoldings;
        existingCoin.lastUpdated = new Date().toISOString();
        
        showNotification(`Updated ${symbol} holdings successfully!`, 'success');
    } else {
        // Add new coin
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
            dateAdded: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        };
        
        portfolio.push(newCoin);
        showNotification(`Added ${symbol} to portfolio successfully!`, 'success');
    }
    
    // Save to localStorage
    localStorage.setItem('crypto-portfolio', JSON.stringify(portfolio));
    
    // Update display
    updateDashboard();
    updatePortfolioTable();
    
    // Close modal and reset form
    closeModal('add-coin-modal');
    document.getElementById('add-coin-form').reset();
}

// ADD TRADE FUNCTION - COMPLETE
function addTrade() {
    console.log('📊 Adding trade...');
    
    const coin = document.getElementById('trade-coin')?.value?.trim().toUpperCase();
    const type = document.getElementById('trade-type')?.value;
    const amount = parseFloat(document.getElementById('trade-amount')?.value);
    const price = parseFloat(document.getElementById('trade-price')?.value);
    const date = document.getElementById('trade-date')?.value;
    
    if (!coin || !type || !amount || !price || !date || amount <= 0 || price <= 0) {
        showNotification('Please fill all fields with valid values!', 'error');
        return;
    }
    
    const newTrade = {
        id: Date.now().toString(),
        coin: coin,
        type: type,
        amount: amount,
        price: price,
        totalValue: amount * price,
        date: date,
        dateAdded: new Date().toISOString()
    };
    
    trades.push(newTrade);
    localStorage.setItem('crypto-trades', JSON.stringify(trades));
    
    showNotification(`${type.toUpperCase()} trade for ${coin} added successfully!`, 'success');
    
    updateTradesTable();
    closeModal('trade-modal');
    document.getElementById('trade-form').reset();
}

// ADD TO WATCHLIST FUNCTION - COMPLETE
function addToWatchlist() {
    console.log('👀 Adding to watchlist...');
    
    const symbol = document.getElementById('watchlist-coin')?.value?.trim().toUpperCase();
    
    if (!symbol) {
        showNotification('Please enter a coin symbol!', 'error');
        return;
    }
    
    if (watchlist.find(coin => coin.symbol === symbol)) {
        showNotification('Coin already in watchlist!', 'warning');
        return;
    }
    
    const newWatchlistItem = {
        id: Date.now().toString(),
        symbol: symbol,
        name: symbol,
        currentPrice: 0,
        change24h: 0,
        dateAdded: new Date().toISOString()
    };
    
    watchlist.push(newWatchlistItem);
    localStorage.setItem('crypto-watchlist', JSON.stringify(watchlist));
    
    showNotification(`Added ${symbol} to watchlist successfully!`, 'success');
    
    updateWatchlistDisplay();
    closeModal('watchlist-modal');
    document.getElementById('watchlist-form').reset();
}

// CREATE ALERT FUNCTION - COMPLETE
function createAlert() {
    console.log('🔔 Creating price alert...');
    
    const coin = document.getElementById('alert-coin')?.value?.trim().toUpperCase();
    const type = document.getElementById('alert-type')?.value;
    const targetPrice = parseFloat(document.getElementById('alert-price')?.value);
    
    if (!coin || !type || !targetPrice || targetPrice <= 0) {
        showNotification('Please fill all fields with valid values!', 'error');
        return;
    }
    
    const newAlert = {
        id: Date.now().toString(),
        coin: coin,
        type: type,
        targetPrice: targetPrice,
        isActive: true,
        dateCreated: new Date().toISOString()
    };
    
    alerts.push(newAlert);
    localStorage.setItem('crypto-alerts', JSON.stringify(alerts));
    
    showNotification(`Price alert for ${coin} created successfully!`, 'success');
    
    updateAlertsDisplay();
    closeModal('alert-modal');
    document.getElementById('alert-form').reset();
}

// UPDATED TABLE FUNCTIONS
function updatePortfolioTable() {
    console.log('💼 Updating portfolio table...');
    const tbody = document.querySelector('#portfolio-table tbody');
    if (!tbody) return;
    
    if (portfolio.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 40px;"><h3>Portfolio is empty</h3><p>Click Add Coin to start tracking!</p><button class="btn btn-primary" onclick="openAddCoinModal()">Add Your First Coin</button></td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    portfolio.forEach(coin => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${coin.symbol}</strong><br><small>${coin.name}</small></td>
            <td>${coin.holdings.toFixed(6)}</td>
            <td>$${coin.currentPrice.toFixed(4)}</td>
            <td>$${coin.marketValue.toFixed(2)}</td>
            <td>$${coin.avgBuyPrice.toFixed(4)}</td>
            <td class="${coin.pnl >= 0 ? 'price-positive' : 'price-negative'}">$${coin.pnl.toFixed(2)}</td>
            <td class="${coin.pnlPercentage >= 0 ? 'percentage-positive' : 'percentage-negative'}">${coin.pnlPercentage.toFixed(2)}%</td>
            <td class="${coin.change24h >= 0 ? 'price-positive' : 'price-negative'}">${coin.change24h.toFixed(2)}%</td>
            <td><button class="btn btn-danger btn-sm" onclick="removeCoin('${coin.id}')">Remove</button></td>
        `;
        tbody.appendChild(row);
    });
}

function updateTradesTable() {
    console.log('📈 Updating trades table...');
    const tbody = document.querySelector('#trades-table tbody');
    if (!tbody) return;
    
    if (trades.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 40px;"><h3>No trades yet</h3><p>Record your first trade!</p><button class="btn btn-primary" onclick="openTradeModal()">Add Your First Trade</button></td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    trades.slice().reverse().forEach(trade => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(trade.date).toLocaleDateString()}</td>
            <td><strong>${trade.coin}</strong></td>
            <td><span class="badge ${trade.type === 'buy' ? 'bg-green' : 'bg-red'}">${trade.type.toUpperCase()}</span></td>
            <td>${trade.amount.toFixed(6)}</td>
            <td>$${trade.price.toFixed(4)}</td>
            <td>$${trade.price.toFixed(4)}</td>
            <td>$${trade.totalValue.toFixed(2)}</td>
            <td>$0.00</td>
            <td><button class="btn btn-danger btn-sm" onclick="deleteTrade('${trade.id}')">Delete</button></td>
        `;
        tbody.appendChild(row);
    });
}

// Remove functions
function removeCoin(coinId) {
    if (!confirm('Are you sure you want to remove this coin?')) return;
    
    portfolio = portfolio.filter(coin => coin.id !== coinId);
    localStorage.setItem('crypto-portfolio', JSON.stringify(portfolio));
    
    showNotification('Coin removed from portfolio!', 'success');
    updatePortfolioTable();
    updateDashboard();
}

function deleteTrade(tradeId) {
    if (!confirm('Are you sure you want to delete this trade?')) return;
    
    trades = trades.filter(trade => trade.id !== tradeId);
    localStorage.setItem('crypto-trades', JSON.stringify(trades));
    
    showNotification('Trade deleted successfully!', 'success');
    updateTradesTable();
}

// Keep all existing functions (setupNavigation, setupButtons, etc.)
// [Previous code remains the same for navigation, modals, notifications, etc.]

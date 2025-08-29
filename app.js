// Core Variables and Data Storage
let portfolio = JSON.parse(localStorage.getItem('crypto-portfolio')) || [];
let trades = JSON.parse(localStorage.getItem('crypto-trades')) || [];
let watchlist = JSON.parse(localStorage.getItem('crypto-watchlist')) || [];
let alerts = JSON.parse(localStorage.getItem('crypto-alerts')) || [];
let triggeredAlerts = JSON.parse(localStorage.getItem('crypto-triggered-alerts')) || [];

// API Configuration
const API_BASE = 'https://api.coingecko.com/api/v3';
const BINANCE_API = 'https://api.binance.com/api/v3';
let priceCache = new Map();
let lastPriceUpdate = 0;
const PRICE_UPDATE_INTERVAL = 30000; // 30 seconds

// Chart instances
let portfolioChart = null;
let performanceChart = null;

// DOM Elements
const tabLinks = document.querySelectorAll('.nav-link');
const tabContents = document.querySelectorAll('.tab-content');

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    startPriceUpdates();
    initializeCharts();
});

// Initialize Application
function initializeApp() {
    console.log('🚀 CryptoTracker Pro Initializing...');
    
    // Load saved data
    loadPortfolio();
    loadTrades();
    loadWatchlist();
    loadAlerts();
    
    // Update displays
    updateDashboard();
    updatePortfolioTable();
    updateTradesTable();
    updateWatchlistDisplay();
    updateAlertsDisplay();
    
    // Set active tab
    showTab('dashboard');
    
    console.log('✅ CryptoTracker Pro Initialized Successfully!');
}
// Setup Event Listeners
function setupEventListeners() {
    // Tab navigation
    tabLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = link.dataset.tab;
            showTab(tabId);
            
            // Update active nav link
            tabLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
    
    // Modal close events
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllModals();
        }
        
        // Ctrl/Cmd + A for Add Coin
        if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
            e.preventDefault();
            openAddCoinModal();
        }
        
        // Ctrl/Cmd + T for Add Trade
        if ((e.ctrlKey || e.metaKey) && e.key === 't') {
            e.preventDefault();
            openTradeModal();
        }
    });
}

// Tab Management
function showTab(tabId) {
    // Hide all tab contents
    tabContents.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
        selectedTab.classList.add('active');
        
        // Refresh data for specific tabs
        switch(tabId) {
            case 'dashboard':
                updateDashboard();
                updateCharts();
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
    }
}
// Utility Functions
function formatCurrency(amount, decimals = 2) {
    if (amount === null || amount === undefined) return '$0.00';
    
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(amount);
}

function formatNumber(num, decimals = 8) {
    if (num === null || num === undefined) return '0';
    
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals
    }).format(num);
}

function formatPercentage(percentage) {
    if (percentage === null || percentage === undefined) return '0%';
    
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(2)}%`;
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getCoinIcon(symbol) {
    return symbol.charAt(0).toUpperCase();
}

function getChangeClass(change) {
    if (change > 0) return 'price-positive';
    if (change < 0) return 'price-negative';
    return 'price-neutral';
}

function getPercentageClass(percentage) {
    if (percentage > 0) return 'percentage-positive';
    if (percentage < 0) return 'percentage-negative';
    return '';
}

// Local Storage Functions
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Failed to save to localStorage:', error);
        showNotification('Failed to save data locally', 'error');
        return false;
    }
}

function loadFromLocalStorage(key, defaultValue = []) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error('Failed to load from localStorage:', error);
        return defaultValue;
    }
}
// Portfolio Management Functions
function loadPortfolio() {
    portfolio = loadFromLocalStorage('crypto-portfolio', []);
    console.log('📊 Loaded portfolio:', portfolio.length, 'coins');
}

function savePortfolio() {
    return saveToLocalStorage('crypto-portfolio', portfolio);
}

function openAddCoinModal() {
    document.getElementById('add-coin-modal').classList.add('show');
    document.getElementById('add-coin-modal').style.display = 'flex';
    
    setTimeout(() => {
        document.getElementById('coin-symbol').focus();
    }, 100);
}

async function addCoin() {
    const symbol = document.getElementById('coin-symbol').value.trim().toLowerCase();
    const holdings = parseFloat(document.getElementById('coin-holdings').value);
    const buyPrice = parseFloat(document.getElementById('coin-buy-price').value);
    
    if (!symbol || isNaN(holdings) || isNaN(buyPrice) || holdings <= 0 || buyPrice <= 0) {
        showNotification('Please fill all fields with valid values', 'error');
        return;
    }
    
    const existingCoin = portfolio.find(coin => coin.symbol.toLowerCase() === symbol);
    
    if (existingCoin) {
        const totalValue = (existingCoin.holdings * existingCoin.avgBuyPrice) + (holdings * buyPrice);
        const totalHoldings = existingCoin.holdings + holdings;
        
        existingCoin.holdings = totalHoldings;
        existingCoin.avgBuyPrice = totalValue / totalHoldings;
        existingCoin.lastUpdated = new Date().toISOString();
        
        showNotification(`Updated ${symbol.toUpperCase()} holdings`, 'success');
    } else {
        const newCoin = {
            id: generateId(),
            symbol: symbol,
            name: symbol.charAt(0).toUpperCase() + symbol.slice(1),
            holdings: holdings,
            avgBuyPrice: buyPrice,
            currentPrice: 0,
            marketValue: 0,
            pnl: 0,
            pnlPercentage: 0,
            change24h: 0,
            dateAdded: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        };
        
        portfolio.push(newCoin);
        showNotification(`Added ${symbol.toUpperCase()} to portfolio`, 'success');
    }
    
    if (savePortfolio()) {
        await updateCoinPrices([symbol]);
        updateDashboard();
        updatePortfolioTable();
        updateCharts();
        closeModal('add-coin-modal');
        document.getElementById('add-coin-form').reset();
    }
}

function removeCoin(coinId) {
    if (!confirm('Are you sure you want to remove this coin from your portfolio?')) {
        return;
    }
    
    const coinIndex = portfolio.findIndex(coin => coin.id === coinId);
    if (coinIndex > -1) {
        const removedCoin = portfolio.splice(coinIndex, 1)[0];
        
        if (savePortfolio()) {
            showNotification(`Removed ${removedCoin.symbol.toUpperCase()} from portfolio`, 'success');
            updateDashboard();
            updatePortfolioTable();
            updateCharts();
        }
    }
}
// API Functions
async function fetchCoinPrice(symbol) {
    try {
        const cacheKey = symbol.toLowerCase();
        const now = Date.now();
        
        if (priceCache.has(cacheKey) && (now - lastPriceUpdate) < PRICE_UPDATE_INTERVAL) {
            return priceCache.get(cacheKey);
        }
        
        const response = await fetch(
            `${API_BASE}/simple/price?ids=${symbol.toLowerCase()}&vs_currencies=usd&include_24hr_change=true`
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const coinData = data[symbol.toLowerCase()];
        
        if (!coinData) {
            return await getMockPriceData(symbol);
        }
        
        const priceData = {
            price: coinData.usd,
            change24h: coinData.usd_24h_change || 0,
            lastUpdated: now
        };
        
        priceCache.set(cacheKey, priceData);
        lastPriceUpdate = now;
        
        return priceData;
        
    } catch (error) {
        console.error(`Error fetching price for ${symbol}:`, error);
        return await getMockPriceData(symbol);
    }
}

async function getMockPriceData(symbol) {
    const mockPrices = {
        'bitcoin': { price: 43250.50, change24h: 2.5 },
        'ethereum': { price: 2685.75, change24h: -1.2 },
        'binancecoin': { price: 308.90, change24h: 0.8 },
        'cardano': { price: 0.52, change24h: 3.2 },
        'solana': { price: 98.45, change24h: -2.1 }
    };
    
    const key = symbol.toLowerCase();
    const baseData = mockPrices[key] || { price: Math.random() * 1000 + 100, change24h: (Math.random() - 0.5) * 10 };
    
    const priceVariation = (Math.random() - 0.5) * 0.02;
    const changeVariation = (Math.random() - 0.5) * 2;
    
    return {
        price: baseData.price * (1 + priceVariation),
        change24h: baseData.change24h + changeVariation,
        lastUpdated: Date.now()
    };
}

async function updateCoinPrices(symbols = null) {
    try {
        const coinsToUpdate = symbols || portfolio.map(coin => coin.symbol);
        
        if (coinsToUpdate.length === 0) return;
        
        for (const symbol of coinsToUpdate) {
            const priceData = await fetchCoinPrice(symbol);
            const coin = portfolio.find(c => c.symbol.toLowerCase() === symbol.toLowerCase());
            
            if (coin && priceData) {
                coin.currentPrice = priceData.price;
                coin.change24h = priceData.change24h;
                coin.marketValue = coin.holdings * coin.currentPrice;
                coin.pnl = coin.marketValue - (coin.holdings * coin.avgBuyPrice);
                coin.pnlPercentage = ((coin.currentPrice - coin.avgBuyPrice) / coin.avgBuyPrice) * 100;
                coin.lastUpdated = new Date().toISOString();
            }
        }
        
        savePortfolio();
        
    } catch (error) {
        console.error('Error updating coin prices:', error);
    }
}

// Start automatic price updates
function startPriceUpdates() {
    console.log('🔄 Starting automatic price updates...');
    
    updateAllPrices();
    
    setInterval(() => {
        updateAllPrices();
    }, PRICE_UPDATE_INTERVAL);
}

async function updateAllPrices() {
    try {
        const allSymbols = new Set();
        
        portfolio.forEach(coin => allSymbols.add(coin.symbol));
        watchlist.forEach(coin => allSymbols.add(coin.symbol));
        
        if (allSymbols.size === 0) return;
        
        console.log('🔄 Updating prices for:', Array.from(allSymbols));
        
        for (const symbol of allSymbols) {
            await fetchCoinPrice(symbol);
        }
        
        updateDashboard();
        updatePortfolioTable();
        updateWatchlistDisplay();
        
    } catch (error) {
        console.error('Error updating all prices:', error);
    }
}
// Dashboard Functions
async function updateDashboard() {
    try {
        await updateCoinPrices();
        
        const metrics = calculatePortfolioMetrics();
        
        document.getElementById('total-value').textContent = formatCurrency(metrics.totalValue);
        document.getElementById('total-pnl').textContent = formatCurrency(metrics.totalPnl);
        document.getElementById('monthly-pnl').textContent = formatPercentage(metrics.monthlyPnlPercentage);
        document.getElementById('total-coins').textContent = portfolio.length;
        
        const pnlElement = document.getElementById('total-pnl');
        const monthlyElement = document.getElementById('monthly-pnl');
        
        pnlElement.className = getChangeClass(metrics.totalPnl);
        monthlyElement.className = getPercentageClass(metrics.monthlyPnlPercentage);
        
        console.log('📊 Dashboard updated:', metrics);
        
    } catch (error) {
        console.error('Error updating dashboard:', error);
    }
}

function calculatePortfolioMetrics() {
    let totalValue = 0;
    let totalInvested = 0;
    let totalPnl = 0;
    
    portfolio.forEach(coin => {
        const invested = coin.holdings * coin.avgBuyPrice;
        const currentValue = coin.holdings * coin.currentPrice;
        
        totalInvested += invested;
        totalValue += currentValue;
        totalPnl += (currentValue - invested);
    });
    
    const totalPnlPercentage = totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0;
    const monthlyPnlPercentage = Math.random() * 10 - 5; // Mock monthly data
    
    return {
        totalValue,
        totalInvested,
        totalPnl,
        totalPnlPercentage,
        monthlyPnlPercentage
    };
}

function updatePortfolioTable() {
    const tbody = document.querySelector('#portfolio-table tbody');
    tbody.innerHTML = '';
    
    if (portfolio.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center" style="padding: 40px;">
                    <i class="fas fa-wallet" style="font-size: 48px; color: #444; margin-bottom: 15px;"></i>
                    <p style="color: #888;">Your portfolio is empty. Add some coins to get started!</p>
                    <button class="btn btn-primary" onclick="openAddCoinModal()" style="margin-top: 15px;">
                        <i class="fas fa-plus"></i>Add Your First Coin
                    </button>
                </td>
            </tr>
        `;
        return;
    }
    
    const sortedPortfolio = [...portfolio].sort((a, b) => b.marketValue - a.marketValue);
    
    sortedPortfolio.forEach(coin => {
        const row = createPortfolioRow(coin);
        tbody.appendChild(row);
    });
}

function createPortfolioRow(coin) {
    const row = document.createElement('tr');
    row.className = 'animate-slide-in-left';
    
    const pnlClass = getChangeClass(coin.pnl);
    const pnlPercentClass = getPercentageClass(coin.pnlPercentage);
    const change24hClass = getPercentageClass(coin.change24h);
    
    row.innerHTML = `
        <td>
            <div class="coin-cell">
                <div class="coin-icon">${getCoinIcon(coin.symbol)}</div>
                <div>
                    <div class="font-bold">${coin.symbol.toUpperCase()}</div>
                    <div class="text-sm" style="color: #888;">${coin.name}</div>
                </div>
            </div>
        </td>
        <td class="font-bold">${formatNumber(coin.holdings, 6)}</td>
        <td class="font-bold">${formatCurrency(coin.currentPrice, 4)}</td>
        <td class="font-bold">${formatCurrency(coin.marketValue)}</td>
        <td class="font-bold">${formatCurrency(coin.avgBuyPrice, 4)}</td>
        <td class="font-bold ${pnlClass}">${formatCurrency(coin.pnl)}</td>
        <td class="font-bold ${pnlPercentClass}">${formatPercentage(coin.pnlPercentage)}</td>
        <td class="font-bold ${change24hClass}">${formatPercentage(coin.change24h)}</td>
        <td>
            <button class="btn btn-danger btn-sm" onclick="removeCoin('${coin.id}')" title="Remove Coin">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    
    return row;
}
// Trading Functions Continued
function addTrade() {
    const coin = document.getElementById('trade-coin').value.trim().toLowerCase();
    const type = document.getElementById('trade-type').value;
    const amount = parseFloat(document.getElementById('trade-amount').value);
    const price = parseFloat(document.getElementById('trade-price').value);
    const date = document.getElementById('trade-date').value;
    
    if (!coin || !type || isNaN(amount) || isNaN(price) || !date || amount <= 0 || price <= 0) {
        showNotification('Please fill all fields with valid values', 'error');
        return;
    }
    
    const totalValue = amount * price;
    let pnl = 0;
    
    if (type === 'sell') {
        const portfolioCoin = portfolio.find(c => c.symbol.toLowerCase() === coin);
        if (portfolioCoin) {
            const buyValue = amount * portfolioCoin.avgBuyPrice;
            const sellValue = amount * price;
            pnl = sellValue - buyValue;
        }
    }
    
    const newTrade = {
        id: generateId(),
        coin: coin,
        type: type,
        amount: amount,
        price: price,
        totalValue: totalValue,
        pnl: pnl,
        date: date,
        exchange: 'Bitget',
        notes: '',
        dateAdded: new Date().toISOString()
    };
    
    trades.push(newTrade);
    updatePortfolioFromTrade(newTrade);
    
    if (saveTrades() && savePortfolio()) {
        showNotification(`${type.toUpperCase()} trade added successfully`, 'success');
        updateDashboard();
        updateTradesTable();
        updatePortfolioTable();
        closeModal('trade-modal');
        document.getElementById('trade-form').reset();
    }
}

function updatePortfolioFromTrade(trade) {
    const existingCoin = portfolio.find(coin => coin.symbol.toLowerCase() === trade.coin);
    
    if (trade.type === 'buy') {
        if (existingCoin) {
            const totalValue = (existingCoin.holdings * existingCoin.avgBuyPrice) + (trade.amount * trade.price);
            const totalHoldings = existingCoin.holdings + trade.amount;
            
            existingCoin.holdings = totalHoldings;
            existingCoin.avgBuyPrice = totalValue / totalHoldings;
            existingCoin.lastUpdated = new Date().toISOString();
        } else {
            const newCoin = {
                id: generateId(),
                symbol: trade.coin,
                name: trade.coin.charAt(0).toUpperCase() + trade.coin.slice(1),
                holdings: trade.amount,
                avgBuyPrice: trade.price,
                currentPrice: trade.price,
                marketValue: trade.amount * trade.price,
                pnl: 0,
                pnlPercentage: 0,
                change24h: 0,
                dateAdded: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
            };
            
            portfolio.push(newCoin);
        }
    } else if (trade.type === 'sell' && existingCoin) {
        existingCoin.holdings = Math.max(0, existingCoin.holdings - trade.amount);
        existingCoin.lastUpdated = new Date().toISOString();
        
        if (existingCoin.holdings === 0) {
            const index = portfolio.findIndex(coin => coin.id === existingCoin.id);
            if (index > -1) {
                portfolio.splice(index, 1);
            }
        }
    }
}

function updateTradesTable() {
    const tbody = document.querySelector('#trades-table tbody');
    tbody.innerHTML = '';
    
    if (trades.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center" style="padding: 40px;">
                    <i class="fas fa-chart-line" style="font-size: 48px; color: #444; margin-bottom: 15px;"></i>
                    <p style="color: #888;">No trades recorded yet. Start tracking your trading activity!</p>
                    <button class="btn btn-primary" onclick="openTradeModal()" style="margin-top: 15px;">
                        <i class="fas fa-plus"></i>Add Your First Trade
                    </button>
                </td>
            </tr>
        `;
        return;
    }
    
    const sortedTrades = [...trades].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedTrades.forEach(trade => {
        const row = createTradeRow(trade);
        tbody.appendChild(row);
    });
}

function createTradeRow(trade) {
    const row = document.createElement('tr');
    row.className = 'animate-slide-in-right';
    
    const pnlClass = getChangeClass(trade.pnl || 0);
    const typeClass = trade.type === 'buy' ? 'bg-green' : 'bg-red';
    
    row.innerHTML = `
        <td>${formatDate(trade.date)}</td>
        <td>
            <div class="coin-cell">
                <div class="coin-icon">${getCoinIcon(trade.coin)}</div>
                <span class="font-bold">${trade.coin.toUpperCase()}</span>
            </div>
        </td>
        <td>
            <span class="badge ${typeClass}">${trade.type.toUpperCase()}</span>
        </td>
        <td class="font-bold">${formatNumber(trade.amount, 6)}</td>
        <td class="font-bold">${formatCurrency(trade.price, 4)}</td>
        <td class="font-bold">${formatCurrency(trade.price, 4)}</td>
        <td class="font-bold">${formatCurrency(trade.totalValue)}</td>
        <td class="font-bold ${pnlClass}">${formatCurrency(trade.pnl || 0)}</td>
        <td>
            <button class="btn btn-sm btn-danger" onclick="deleteTrade('${trade.id}')" title="Delete Trade">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    
    return row;
}

function deleteTrade(tradeId) {
    if (!confirm('Are you sure you want to delete this trade?')) {
        return;
    }
    
    const tradeIndex = trades.findIndex(trade => trade.id === tradeId);
    if (tradeIndex > -1) {
        trades.splice(tradeIndex, 1);
        
        if (saveTrades()) {
            showNotification('Trade deleted successfully', 'success');
            updateTradesTable();
            updateDashboard();
        }
    }
}
// Watchlist Functions
function loadWatchlist() {
    watchlist = loadFromLocalStorage('crypto-watchlist', []);
    console.log('👀 Loaded watchlist:', watchlist.length, 'coins');
}

function saveWatchlist() {
    return saveToLocalStorage('crypto-watchlist', watchlist);
}

function openWatchlistModal() {
    document.getElementById('watchlist-modal').classList.add('show');
    document.getElementById('watchlist-modal').style.display = 'flex';
    
    setTimeout(() => {
        document.getElementById('watchlist-coin').focus();
    }, 100);
}

async function addToWatchlist() {
    const symbol = document.getElementById('watchlist-coin').value.trim().toLowerCase();
    
    if (!symbol) {
        showNotification('Please enter a coin symbol', 'error');
        return;
    }
    
    if (watchlist.find(coin => coin.symbol.toLowerCase() === symbol)) {
        showNotification('Coin is already in your watchlist', 'warning');
        return;
    }
    
    try {
        const priceData = await fetchCoinPrice(symbol);
        
        const newWatchlistItem = {
            id: generateId(),
            symbol: symbol,
            name: symbol.charAt(0).toUpperCase() + symbol.slice(1),
            currentPrice: priceData.price,
            change24h: priceData.change24h,
            dateAdded: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        };
        
        watchlist.push(newWatchlistItem);
        
        if (saveWatchlist()) {
            showNotification(`Added ${symbol.toUpperCase()} to watchlist`, 'success');
            updateWatchlistDisplay();
            closeModal('watchlist-modal');
            document.getElementById('watchlist-form').reset();
        }
        
    } catch (error) {
        console.error('Error adding to watchlist:', error);
        showNotification('Failed to add coin to watchlist', 'error');
    }
}

function removeFromWatchlist(coinId) {
    if (!confirm('Remove this coin from your watchlist?')) {
        return;
    }
    
    const index = watchlist.findIndex(coin => coin.id === coinId);
    if (index > -1) {
        const removedCoin = watchlist.splice(index, 1)[0];
        
        if (saveWatchlist()) {
            showNotification(`Removed ${removedCoin.symbol.toUpperCase()} from watchlist`, 'success');
            updateWatchlistDisplay();
        }
    }
}

async function updateWatchlistDisplay() {
    const grid = document.getElementById('watchlist-grid');
    grid.innerHTML = '';
    
    if (watchlist.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                <i class="fas fa-eye-slash" style="font-size: 64px; color: #444; margin-bottom: 20px;"></i>
                <h3 style="color: #888; margin-bottom: 15px;">Your watchlist is empty</h3>
                <p style="color: #666; margin-bottom: 25px;">Add coins to track their prices and market movements</p>
                <button class="btn btn-primary" onclick="openWatchlistModal()">
                    <i class="fas fa-plus"></i>Add Your First Coin
                </button>
            </div>
        `;
        return;
    }
    
    for (const coin of watchlist) {
        const priceData = await fetchCoinPrice(coin.symbol);
        if (priceData) {
            coin.currentPrice = priceData.price;
            coin.change24h = priceData.change24h;
            coin.lastUpdated = new Date().toISOString();
        }
    }
    
    saveWatchlist();
    
    watchlist.forEach(coin => {
        const card = createWatchlistCard(coin);
        grid.appendChild(card);
    });
}

function createWatchlistCard(coin) {
    const card = document.createElement('div');
    card.className = 'watchlist-card animate-bounce-in';
    
    const changeClass = getPercentageClass(coin.change24h);
    const changeText = formatPercentage(coin.change24h);
    
    card.innerHTML = `
        <div class="watchlist-header">
            <div class="watchlist-coin">${coin.symbol.toUpperCase()}</div>
            <button class="btn btn-sm btn-danger" onclick="removeFromWatchlist('${coin.id}')" title="Remove from Watchlist">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="watchlist-price">${formatCurrency(coin.currentPrice, 4)}</div>
        <div class="watchlist-change ${changeClass}">${changeText}</div>
        <div style="margin-top: 15px; display: flex; gap: 10px;">
            <button class="btn btn-sm btn-primary" onclick="addCoinFromWatchlist('${coin.symbol}')" title="Add to Portfolio">
                <i class="fas fa-plus"></i>Add
            </button>
            <button class="btn btn-sm btn-secondary" onclick="createAlertFromWatchlist('${coin.symbol}', ${coin.currentPrice})" title="Set Price Alert">
                <i class="fas fa-bell"></i>Alert
            </button>
        </div>
    `;
    
    return card;
}

function addCoinFromWatchlist(symbol) {
    document.getElementById('coin-symbol').value = symbol;
    openAddCoinModal();
}

function createAlertFromWatchlist(symbol, currentPrice) {
    document.getElementById('alert-coin').value = symbol;
    document.getElementById('alert-price').value = (currentPrice * 1.1).toFixed(2);
    openAlertModal();
}
// Alerts System
function loadAlerts() {
    alerts = loadFromLocalStorage('crypto-alerts', []);
    triggeredAlerts = loadFromLocalStorage('crypto-triggered-alerts', []);
    console.log('🔔 Loaded alerts:', alerts.length, 'active,', triggeredAlerts.length, 'triggered');
}

function saveAlerts() {
    saveToLocalStorage('crypto-alerts', alerts);
    return saveToLocalStorage('crypto-triggered-alerts', triggeredAlerts);
}

function openAlertModal() {
    document.getElementById('alert-modal').classList.add('show');
    document.getElementById('alert-modal').style.display = 'flex';
    
    setTimeout(() => {
        document.getElementById('alert-coin').focus();
    }, 100);
}

function createAlert() {
    const coin = document.getElementById('alert-coin').value.trim().toLowerCase();
    const type = document.getElementById('alert-type').value;
    const targetPrice = parseFloat(document.getElementById('alert-price').value);
    
    if (!coin || !type || isNaN(targetPrice) || targetPrice <= 0) {
        showNotification('Please fill all fields with valid values', 'error');
        return;
    }
    
    const newAlert = {
        id: generateId(),
        coin: coin,
        type: type,
        targetPrice: targetPrice,
        isActive: true,
        dateCreated: new Date().toISOString()
    };
    
    alerts.push(newAlert);
    
    if (saveAlerts()) {
        showNotification(`Price alert created for ${coin.toUpperCase()}`, 'success');
        updateAlertsDisplay();
        closeModal('alert-modal');
        document.getElementById('alert-form').reset();
    }
}

function removeAlert(alertId) {
    const index = alerts.findIndex(alert => alert.id === alertId);
    if (index > -1) {
        alerts.splice(index, 1);
        
        if (saveAlerts()) {
            showNotification('Alert removed', 'success');
            updateAlertsDisplay();
        }
    }
}

function updateAlertsDisplay() {
    updateActiveAlerts();
    updateTriggeredAlerts();
}

function updateActiveAlerts() {
    const container = document.getElementById('active-alerts-list');
    container.innerHTML = '';
    
    const activeAlerts = alerts.filter(alert => alert.isActive);
    
    if (activeAlerts.length === 0) {
        container.innerHTML = `
            <div class="alert-item">
                <div style="text-align: center; color: #888;">
                    <i class="fas fa-bell-slash" style="font-size: 32px; margin-bottom: 10px;"></i>
                    <p>No active alerts</p>
                    <button class="btn btn-sm btn-primary" onclick="openAlertModal()" style="margin-top: 10px;">
                        Create Alert
                    </button>
                </div>
            </div>
        `;
        return;
    }
    
    activeAlerts.forEach(alert => {
        const alertElement = createAlertElement(alert, true);
        container.appendChild(alertElement);
    });
}

function updateTriggeredAlerts() {
    const container = document.getElementById('triggered-alerts-list');
    container.innerHTML = '';
    
    const recentTriggered = triggeredAlerts.slice(-10).reverse();
    
    if (recentTriggered.length === 0) {
        container.innerHTML = `
            <div class="alert-item">
                <div style="text-align: center; color: #888;">
                    <i class="fas fa-history" style="font-size: 32px; margin-bottom: 10px;"></i>
                    <p>No triggered alerts yet</p>
                </div>
            </div>
        `;
        return;
    }
    
    recentTriggered.forEach(alert => {
        const alertElement = createAlertElement(alert, false);
        container.appendChild(alertElement);
    });
}

function createAlertElement(alert, isActive) {
    const element = document.createElement('div');
    element.className = 'alert-item';
    
    const typeText = alert.type === 'above' ? 'rises above' : 'falls below';
    const statusBadge = isActive ? 
        '<span class="badge bg-green">Active</span>' : 
        '<span class="badge bg-blue">Triggered</span>';
    
    element.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
                <div class="alert-coin">${alert.coin.toUpperCase()}</div>
                <div class="alert-condition">When price ${typeText}</div>
                <div class="alert-target">${formatCurrency(alert.targetPrice, 4)}</div>
                ${alert.triggeredAt ? `<div class="text-sm" style="color: #888; margin-top: 5px;">Triggered: ${formatDate(alert.triggeredAt)}</div>` : ''}
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
                ${statusBadge}
                ${isActive ? `<button class="btn btn-sm btn-danger" onclick="removeAlert('${alert.id}')" title="Remove Alert"><i class="fas fa-times"></i></button>` : ''}
            </div>
        </div>
    `;
    
    return element;
}
// Charts Implementation
function initializeCharts() {
    try {
        initPortfolioChart();
        initPerformanceChart();
        console.log('📊 Charts initialized successfully');
    } catch (error) {
        console.error('Error initializing charts:', error);
    }
}

function initPortfolioChart() {
    const ctx = document.getElementById('portfolioChart');
    if (!ctx) return;
    
    if (portfolioChart) {
        portfolioChart.destroy();
    }
    
    portfolioChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#00d4ff', '#ff6b6b', '#4ecdc4', '#45b7d1',
                    '#f39c12', '#9b59b6', '#e74c3c', '#2ecc71'
                ],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#ffffff',
                        padding: 20,
                        usePointStyle: true
                    }
                }
            }
        }
    });
}

function initPerformanceChart() {
    const ctx = document.getElementById('performanceChart');
    if (!ctx) return;
    
    if (performanceChart) {
        performanceChart.destroy();
    }
    
    performanceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Portfolio Value',
                data: [],
                borderColor: '#00d4ff',
                backgroundColor: 'rgba(0, 212, 255, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#ffffff'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#b0b0b0'
                    }
                },
                y: {
                    ticks: {
                        color: '#b0b0b0',
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            }
        }
    });
}

function updateCharts() {
    updatePortfolioChart();
    updatePerformanceChart();
}

function updatePortfolioChart() {
    if (!portfolioChart || portfolio.length === 0) return;
    
    const sortedPortfolio = [...portfolio]
        .filter(coin => coin.marketValue > 0)
        .sort((a, b) => b.marketValue - a.marketValue);
    
    const labels = sortedPortfolio.map(coin => coin.symbol.toUpperCase());
    const data = sortedPortfolio.map(coin => coin.marketValue);
    
    portfolioChart.data.labels = labels;
    portfolioChart.data.datasets[0].data = data;
    portfolioChart.update('active');
}

function updatePerformanceChart() {
    if (!performanceChart) return;
    
    const performanceData = generatePerformanceData();
    
    performanceChart.data.labels = performanceData.labels;
    performanceChart.data.datasets[0].data = performanceData.values;
    performanceChart.update('active');
}

function generatePerformanceData() {
    const days = 30;
    const labels = [];
    const values = [];
    const currentValue = portfolio.reduce((sum, coin) => sum + coin.marketValue, 0);
    
    for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        
        const variation = (Math.random() - 0.5) * 0.1;
        const baseValue = currentValue * (0.8 + Math.random() * 0.4);
        values.push(Math.max(0, baseValue * (1 + variation)));
    }
    
    return { labels, values };
}

// Live Chat System
let chatExpanded = true;

function toggleChat() {
    const chatWidget = document.getElementById('live-chat');
    const chatToggle = chatWidget.querySelector('.chat-toggle');
    
    chatExpanded = !chatExpanded;
    
    if (chatExpanded) {
        chatWidget.classList.remove('collapsed');
        chatToggle.style.transform = 'rotate(0deg)';
    } else {
        chatWidget.classList.add('collapsed');
        chatToggle.style.transform = 'rotate(180deg)';
    }
}

function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    addChatMessage('user', message);
    input.value = '';
    
    setTimeout(() => {
        const botResponse = generateBotResponse(message);
        addChatMessage('bot', botResponse);
    }, 1000);
}

function addChatMessage(sender, message) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.className = `chat-message ${sender}`;
    
    messageElement.innerHTML = `
        <div class="message-content">
            <p>${message}</p>
        </div>
    `;
    
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function generateBotResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    if (message.includes('price')) {
        return "I can help you check cryptocurrency prices! The current price data is updated every 30 seconds.";
    }
    
    if (message.includes('portfolio')) {
        if (portfolio.length === 0) {
            return "Your portfolio is currently empty. Click the 'Add Coin' button to start tracking your investments!";
        }
        const totalValue = portfolio.reduce((sum, coin) => sum + coin.marketValue, 0);
        return `Your portfolio contains ${portfolio.length} cryptocurrencies with a total value of ${formatCurrency(totalValue)}.`;
    }
    
    if (message.includes('help')) {
        return "I'm here to help with your crypto tracking! You can add coins, track trades, set alerts, and monitor your watchlist. What would you like to know more about?";
    }
    
    return "That's interesting! I can help you with crypto portfolio tracking and price alerts. What would you like to know?";
}

// Modal Management
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
        
        const forms = modal.querySelectorAll('form');
        forms.forEach(form => form.reset());
    }
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.classList.remove('show');
        modal.style.display = 'none';
    });
}

// Notification System
function showNotification(message, type = 'info', duration = 4000) {
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    let icon = 'fas fa-info-circle';
    if (type === 'success') icon = 'fas fa-check-circle';
    else if (type === 'error') icon = 'fas fa-exclamation-circle';
    else if (type === 'warning') icon = 'fas fa-exclamation-triangle';
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <i class="${icon}" style="font-size: 18px;"></i>
            <span style="flex: 1;">${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: inherit; cursor: pointer; font-size: 18px;">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.transform = 'translateX(100%)';
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }
    }, duration);
}

// Initialize chat with welcome message
setTimeout(() => {
    addChatMessage('bot', "Hi! I'm your crypto assistant. Ask me about coin prices, market trends, or trading advice!");
}, 2000);

// Error Handling
window.addEventListener('error', function(event) {
    console.error('Application Error:', event.error);
    showNotification('An error occurred. Please refresh if issues persist.', 'error');
});

// Auto-save data before page unload
window.addEventListener('beforeunload', function() {
    if (portfolio.length > 0 || trades.length > 0) {
        savePortfolio();
        saveTrades();
        saveWatchlist();
        saveAlerts();
    }
});

console.log('🚀 CryptoTracker Pro - All modules loaded successfully!');

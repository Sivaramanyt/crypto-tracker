js_full_content = '''// Core Variables and Data Storage
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

// API Functions
async function fetchCoinPrice(symbol) {
    try {
        // Check cache first
        const cacheKey = symbol.toLowerCase();
        const now = Date.now();
        
        if (priceCache.has(cacheKey) && (now - lastPriceUpdate) < PRICE_UPDATE_INTERVAL) {
            return priceCache.get(cacheKey);
        }
        
        // Fetch from CoinGecko API
        const response = await fetch(
            `${API_BASE}/simple/price?ids=${symbol.toLowerCase()}&vs_currencies=usd&include_24hr_change=true`
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const coinData = data[symbol.toLowerCase()];
        
        if (!coinData) {
            // Try alternative API or return mock data
            return await fetchFromAlternativeAPI(symbol);
        }
        
        const priceData = {
            price: coinData.usd,
            change24h: coinData.usd_24h_change || 0,
            lastUpdated: now
        };
        
        // Update cache
        priceCache.set(cacheKey, priceData);
        lastPriceUpdate = now;
        
        return priceData;
        
    } catch (error) {
        console.error(`Error fetching price for ${symbol}:`, error);
        return await getMockPriceData(symbol);
    }
}

async function fetchMultipleCoins(symbols) {
    try {
        const symbolsString = symbols.map(s => s.toLowerCase()).join(',');
        const response = await fetch(
            `${API_BASE}/simple/price?ids=${symbolsString}&vs_currencies=usd&include_24hr_change=true`
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const results = {};
        
        symbols.forEach(symbol => {
            const key = symbol.toLowerCase();
            if (data[key]) {
                results[symbol] = {
                    price: data[key].usd,
                    change24h: data[key].usd_24h_change || 0,
                    lastUpdated: Date.now()
                };
                priceCache.set(key, results[symbol]);
            }
        });
        
        return results;
        
    } catch (error) {
        console.error('Error fetching multiple coin prices:', error);
        return await getMockMultiplePrices(symbols);
    }
}

async function fetchFromAlternativeAPI(symbol) {
    try {
        // Using Binance API as fallback
        const response = await fetch(`${BINANCE_API}/ticker/24hr?symbol=${symbol.toUpperCase()}USDT`);
        
        if (response.ok) {
            const data = await response.json();
            return {
                price: parseFloat(data.lastPrice),
                change24h: parseFloat(data.priceChangePercent),
                lastUpdated: Date.now()
            };
        }
        
        throw new Error('Alternative API failed');
        
    } catch (error) {
        console.error(`Alternative API failed for ${symbol}:`, error);
        return await getMockPriceData(symbol);
    }
}

// Mock price data for demo/offline mode
async function getMockPriceData(symbol) {
    const mockPrices = {
        'bitcoin': { price: 43250.50, change24h: 2.5 },
        'ethereum': { price: 2685.75, change24h: -1.2 },
        'binancecoin': { price: 308.90, change24h: 0.8 },
        'cardano': { price: 0.52, change24h: 3.2 },
        'solana': { price: 98.45, change24h: -2.1 },
        'polkadot': { price: 7.23, change24h: 1.5 },
        'chainlink': { price: 15.67, change24h: 4.3 },
        'litecoin': { price: 73.21, change24h: -0.9 },
        'polygon': { price: 0.89, change24h: 2.8 },
        'avalanche': { price: 37.56, change24h: -1.7 }
    };
    
    const key = symbol.toLowerCase();
    const baseData = mockPrices[key] || { price: Math.random() * 1000 + 100, change24h: (Math.random() - 0.5) * 10 };
    
    // Add some randomness to simulate live prices
    const priceVariation = (Math.random() - 0.5) * 0.02; //  B11% variation
    const changeVariation = (Math.random() - 0.5) * 2; //  B11% change variation
    
    return {
        price: baseData.price * (1 + priceVariation),
        change24h: baseData.change24h + changeVariation,
        lastUpdated: Date.now()
    };
}

async function getMockMultiplePrices(symbols) {
    const results = {};
    for (const symbol of symbols) {
        results[symbol] = await getMockPriceData(symbol);
    }
    return results;
}

// Start automatic price updates
function startPriceUpdates() {
    console.log('F504 Starting automatic price updates...');
    
    // Initial update
    updateAllPrices();
    
    // Set up interval updates
    setInterval(() => {
        updateAllPrices();
    }, PRICE_UPDATE_INTERVAL);
}

async function updateAllPrices() {
    try {
        const allSymbols = new Set();
        
        // Collect all unique symbols
        portfolio.forEach(coin => allSymbols.add(coin.symbol));
        watchlist.forEach(coin => allSymbols.add(coin.symbol));
        alerts.forEach(alert => allSymbols.add(alert.coin));
        
        if (allSymbols.size === 0) return;
        
        console.log('F504 Updating prices for:', Array.from(allSymbols));
        
        // Fetch prices in batches to avoid API limits
        const symbolsArray = Array.from(allSymbols);
        const batchSize = 10;
        
        for (let i = 0; i < symbolsArray.length; i += batchSize) {
            const batch = symbolsArray.slice(i, i + batchSize);
            await fetchMultipleCoins(batch);
            
            // Small delay between batches
            if (i + batchSize < symbolsArray.length) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        
        // Update displays after price refresh
        updateDashboard();
        updatePortfolioTable();
        updateWatchlistDisplay();
        checkPriceAlerts();
        
    } catch (error) {
        console.error('Error updating all prices:', error);
    }
}'''

import zipfile

zip_filename_js = 'crypto_portfolio_tracker_js.zip'

with zipfile.ZipFile(zip_filename_js, 'w') as zf:
    zf.writestr('app.js', js_full_content)

zip_filename_js

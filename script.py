import zipfile
import os

# File contents
html_content = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CryptoTracker Pro - Professional Portfolio Management</title>
    <link rel="stylesheet" href="styles.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body>
    <!-- Header -->
    <header class="header">
        <div class="container">
            <div class="logo">
                <i class="fas fa-chart-line"></i>
                <h1>CryptoTracker Pro</h1>
            </div>
            <nav class="nav">
                <a href="#dashboard" class="nav-link active" data-tab="dashboard">
                    <i class="fas fa-tachometer-alt"></i>Dashboard
                </a>
                <a href="#portfolio" class="nav-link" data-tab="portfolio">
                    <i class="fas fa-wallet"></i>Portfolio
                </a>
                <a href="#trades" class="nav-link" data-tab="trades">
                    <i class="fas fa-exchange-alt"></i>Trades
                </a>
                <a href="#watchlist" class="nav-link" data-tab="watchlist">
                    <i class="fas fa-eye"></i>Watchlist
                </a>
                <a href="#alerts" class="nav-link" data-tab="alerts">
                    <i class="fas fa-bell"></i>Alerts
                </a>
            </nav>
            <div class="header-actions">
                <button class="btn btn-primary" onclick="openAddCoinModal()">
                    <i class="fas fa-plus"></i>Add Coin
                </button>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main class="main">
        <!-- Dashboard Tab -->
        <div id="dashboard" class="tab-content active">
            <div class="container">
                <div class="dashboard-header">
                    <h2>Portfolio Overview</h2>
                    <div class="portfolio-summary">
                        <div class="summary-card">
                            <div class="card-icon green">
                                <i class="fas fa-dollar-sign"></i>
                            </div>
                            <div class="card-content">
                                <h3 id="total-value">$0.00</h3>
                                <p>Total Portfolio Value</p>
                            </div>
                        </div>
                        <div class="summary-card">
                            <div class="card-icon blue">
                                <i class="fas fa-chart-line"></i>
                            </div>
                            <div class="card-content">
                                <h3 id="total-pnl">$0.00</h3>
                                <p>Total P&L</p>
                            </div>
                        </div>
                        <div class="summary-card">
                            <div class="card-icon purple">
                                <i class="fas fa-percentage"></i>
                            </div>
                            <div class="card-content">
                                <h3 id="monthly-pnl">0%</h3>
                                <p>This Month</p>
                            </div>
                        </div>
                        <div class="summary-card">
                            <div class="card-icon orange">
                                <i class="fas fa-coins"></i>
                            </div>
                            <div class="card-content">
                                <h3 id="total-coins">0</h3>
                                <p>Total Coins</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="dashboard-charts">
                    <div class="chart-container">
                        <h3>Portfolio Distribution</h3>
                        <canvas id="portfolioChart"></canvas>
                    </div>
                    <div class="chart-container">
                        <h3>Monthly Performance</h3>
                        <canvas id="performanceChart"></canvas>
                    </div>
                </div>

                <div class="recent-trades">
                    <h3>Recent Trades</h3>
                    <div class="table-container">
                        <table id="recent-trades-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Coin</th>
                                    <th>Type</th>
                                    <th>Amount</th>
                                    <th>Price</th>
                                    <th>P&L</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- Portfolio Tab -->
        <div id="portfolio" class="tab-content">
            <div class="container">
                <div class="section-header">
                    <h2>My Portfolio</h2>
                    <button class="btn btn-primary" onclick="openAddCoinModal()">
                        <i class="fas fa-plus"></i>Add Coin
                    </button>
                </div>
                <div class="table-container">
                    <table id="portfolio-table">
                        <thead>
                            <tr>
                                <th>Coin</th>
                                <th>Holdings</th>
                                <th>Current Price</th>
                                <th>Market Value</th>
                                <th>Avg Buy Price</th>
                                <th>P&L</th>
                                <th>P&L %</th>
                                <th>24h Change</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Trades Tab -->
        <div id="trades" class="tab-content">
            <div class="container">
                <div class="section-header">
                    <h2>Trading History</h2>
                    <button class="btn btn-primary" onclick="openTradeModal()">
                        <i class="fas fa-plus"></i>Add Trade
                    </button>
                </div>
                <div class="trades-filters">
                    <select id="trade-filter-coin">
                        <option value="">All Coins</option>
                    </select>
                    <select id="trade-filter-type">
                        <option value="">All Types</option>
                        <option value="buy">Buy</option>
                        <option value="sell">Sell</option>
                    </select>
                    <input type="date" id="trade-filter-from">
                    <input type="date" id="trade-filter-to">
                    <button class="btn btn-secondary" onclick="filterTrades()">Filter</button>
                </div>
                <div class="table-container">
                    <table id="trades-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Coin</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Entry Price</th>
                                <th>Exit Price</th>
                                <th>Total Value</th>
                                <th>P&L</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Watchlist Tab -->
        <div id="watchlist" class="tab-content">
            <div class="container">
                <div class="section-header">
                    <h2>Watchlist</h2>
                    <button class="btn btn-primary" onclick="openWatchlistModal()">
                        <i class="fas fa-plus"></i>Add to Watchlist
                    </button>
                </div>
                <div class="watchlist-grid" id="watchlist-grid"></div>
            </div>
        </div>

        <!-- Alerts Tab -->
        <div id="alerts" class="tab-content">
            <div class="container">
                <div class="section-header">
                    <h2>Price Alerts</h2>
                    <button class="btn btn-primary" onclick="openAlertModal()">
                        <i class="fas fa-plus"></i>Add Alert
                    </button>
                </div>
                <div class="alerts-container">
                    <div class="active-alerts">
                        <h3>Active Alerts</h3>
                        <div id="active-alerts-list"></div>
                    </div>
                    <div class="triggered-alerts">
                        <h3>Recent Triggered Alerts</h3>
                        <div id="triggered-alerts-list"></div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <!-- Modals -->
    <div id="add-coin-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Add Coin to Portfolio</h3>
                <span class="close" onclick="closeModal('add-coin-modal')">&times;</span>
            </div>
            <div class="modal-body">
                <form id="add-coin-form">
                    <div class="form-group">
                        <label>Coin Symbol</label>
                        <input type="text" id="coin-symbol" placeholder="e.g., BTC, ETH" required>
                    </div>
                    <div class="form-group">
                        <label>Holdings</label>
                        <input type="number" id="coin-holdings" step="0.00000001" placeholder="Amount you hold" required>
                    </div>
                    <div class="form-group">
                        <label>Average Buy Price</label>
                        <input type="number" id="coin-buy-price" step="0.01" placeholder="Your average buy price" required>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal('add-coin-modal')">Cancel</button>
                <button class="btn btn-primary" onclick="addCoin()">Add Coin</button>
            </div>
        </div>
    </div>

    <!-- Trade Modal -->
    <div id="trade-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Add Trade</h3>
                <span class="close" onclick="closeModal('trade-modal')">&times;</span>
            </div>
            <div class="modal-body">
                <form id="trade-form">
                    <div class="form-group">
                        <label>Coin</label>
                        <input type="text" id="trade-coin" placeholder="e.g., BTC" required>
                    </div>
                    <div class="form-group">
                        <label>Trade Type</label>
                        <select id="trade-type" required>
                            <option value="">Select Type</option>
                            <option value="buy">Buy</option>
                            <option value="sell">Sell</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Amount</label>
                        <input type="number" id="trade-amount" step="0.00000001" required>
                    </div>
                    <div class="form-group">
                        <label>Price</label>
                        <input type="number" id="trade-price" step="0.01" required>
                    </div>
                    <div class="form-group">
                        <label>Date</label>
                        <input type="datetime-local" id="trade-date" required>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal('trade-modal')">Cancel</button>
                <button class="btn btn-primary" onclick="addTrade()">Add Trade</button>
            </div>
        </div>
    </div>

    <!-- Watchlist Modal -->
    <div id="watchlist-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Add to Watchlist</h3>
                <span class="close" onclick="closeModal('watchlist-modal')">&times;</span>
            </div>
            <div class="modal-body">
                <form id="watchlist-form">
                    <div class="form-group">
                        <label>Coin Symbol</label>
                        <input type="text" id="watchlist-coin" placeholder="e.g., BTC, ETH" required>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal('watchlist-modal')">Cancel</button>
                <button class="btn btn-primary" onclick="addToWatchlist()">Add to Watchlist</button>
            </div>
        </div>
    </div>

    <!-- Alert Modal -->
    <div id="alert-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Create Price Alert</h3>
                <span class="close" onclick="closeModal('alert-modal')">&times;</span>
            </div>
            <div class="modal-body">
                <form id="alert-form">
                    <div class="form-group">
                        <label>Coin Symbol</label>
                        <input type="text" id="alert-coin" placeholder="e.g., BTC" required>
                    </div>
                    <div class="form-group">
                        <label>Alert Type</label>
                        <select id="alert-type" required>
                            <option value="">Select Type</option>
                            <option value="above">Price Above</option>
                            <option value="below">Price Below</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Target Price</label>
                        <input type="number" id="alert-price" step="0.01" required>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal('alert-modal')">Cancel</button>
                <button class="btn btn-primary" onclick="createAlert()">Create Alert</button>
            </div>
        </div>
    </div>

    <!-- Live Chat Widget -->
    <div id="live-chat" class="chat-widget">
        <div class="chat-header" onclick="toggleChat()">
            <i class="fas fa-comments"></i>
            <span>Live Chat</span>
            <i class="fas fa-chevron-up chat-toggle"></i>
        </div>
        <div class="chat-body">
            <div class="chat-messages" id="chat-messages">
                <div class="chat-message bot">
                    <div class="message-content">
                        <p>Hi! I'm your crypto assistant. Ask me about any coin prices, market trends, or trading advice!</p>
                    </div>
                </div>
            </div>
            <div class="chat-input">
                <input type="text" id="chat-input" placeholder="Ask about any coin..." onkeypress="handleChatKeyPress(event)">
                <button onclick="sendMessage()"><i class="fas fa-paper-plane"></i></button>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="app.js"></script>
</body>
</html>'''

css_content = '''/* Paste the entire styles.css content here */'''

js_content = '''// Paste the entire app.js content here '''

# Create zip file
zip_filename = 'crypto_portfolio_tracker.zip'

with zipfile.ZipFile(zip_filename, 'w') as zf:
    zf.writestr('index.html', html_content)
    zf.writestr('styles.css', css_content)
    zf.writestr('app.js', js_content)

zip_filename

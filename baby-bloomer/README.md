# Baby Bloomer | Financial Dashboard

A premium, high-fidelity financial dashboard built to track market indices with deep statistical insights, now powered by Yahoo Finance.

## Features
- **Live Market Feed**: Real-time intraday data for major global indices.
- **Deep Statistics**:
    - **Mean**: Calculates the rolling average of indices in the current window.
    - **Sigma (Volatility)**: Real-time standard deviation calculation, representing market volatility relative to the mean.
    - **Multiple**: A momentum/valuation proxy (Current Price / Mean).
- **Premium Design**: Dark mode aesthetic with glassmorphism and modern typography, optimized for high information density.

## Data Source
Initially, the dashboard runs in a **Simulated Live Feed** mode. You can switch to real market data using the toggle in the header.
- **Real Data**: Fetched via Yahoo Finance (using AllOrigins proxy for client-side access).
- **Indexes Tracked**: S&P 500, Nasdaq-100, Dow Jones Industrial Average, and Russell 2000.

## How to use Real Data
1. Open the dashboard.
2. Click **"Switch to Real Data"** in the global control bar.
3. The app will fetch intraday data for the major indexes.
4. Statistics (Mean, Sigma, Multiple) will recalculate based on this real market data.

## How to Deploy to Netlify
1. **Initialize Git**: `git init && git add . && git commit -m "initial dashboard"`
2. **Push to GitHub**: Create a repo on GitHub and push your code.
3. **Connect to Netlify**: Import the repo to Netlify. It will go live instantly.

## Next Steps
- [ ] Add Kurtosis and Skewness for deeper statistical analysis.
- [ ] Integration of individual stock tickers (Custom Watchlist).
- [ ] Historical data comparison (vs. previous month).

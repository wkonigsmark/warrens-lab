# Baby Bloomer | Financial Dashboard

A premium, high-fidelity financial dashboard built to track market indices (like the S&P 500) with deep statistical insights.

## Features
- **Live Simulated Feed**: Real-time price movement visualization with a smooth line chart.
- **Deep Statistics**:
    - **Mean**: Calculates the rolling average of indices in the current window.
    - **Sigma (Volatility)**: Real-time standard deviation calculation, representing market volatility relative to the mean.
    - **Multiple**: A momentum/valuation proxy (Current Price / Mean).
- **Premium Design**: Dark mode aesthetic with glassmorphism and modern typography.

## Security & API Key
To keep your data safe and avoid exposing your API key on GitHub:
1.  **Local Development**: Your key is stored in `config.js`. 
2.  **Git Ignore**: I have created a `.gitignore` file that prevents `config.js` from being uploaded to GitHub.
3.  **Deployment (Netlify)**: When you deploy, you won't upload `config.js`. Instead, you can use the **"Switch to Real Data"** button in the UI. (In a future update, we can make this pull from Netlify environment variables for a fully automated setup).

## How to use Real Data
1.  Open the dashboard.
2.  Click **"Switch to Real Data"**.
3.  The app will fetch the last 50 data points for **SPY** (S&P 500 ETF) via Alpha Vantage.
4.  Statistics (Mean, Sigma, Multiple) will recalculate based on this real market data.

*Note: The Alpha Vantage free tier is limited to 25 calls per day. If you hit the limit, the app will automatically fall back to the simulation.*

## How to Deploy to Netlify
1. **Initialize Git**: `git init && git add . && git commit -m "initial dashboard"`
2. **Push to GitHub**: Create a repo on GitHub and push your code.
3. **Connect to Netlify**: Import the repo to Netlify. It will go live instantly.

## Next Steps
- [ ] Add Kurtosis and Skewness for deeper statistical analysis.
- [ ] Support for multiple symbols (Nasdaq, Crypto).
- [ ] Historical data comparison (vs. previous month).

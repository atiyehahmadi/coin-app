import { fetcher } from '@/lib/coingecko.actions';
import { formatCurrency, formatPercentage, cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Globe, Activity, Coins, BarChart3 } from 'lucide-react';

const GlobalMarketPage = async () => {
  let globalData: GlobalMarketData | null = null;

  try {
    globalData = await fetcher<GlobalMarketData>('/global');
  } catch (error) {
    console.error('Error fetching global market data:', error);
    return (
      <main id="global-page">
        <div className="error-state">
          <p>Failed to load global market data. Please try again later.</p>
        </div>
      </main>
    );
  }

  const { data } = globalData;
  const isPositiveChange = data.market_cap_change_percentage_24h_usd > 0;

  // Get top 5 market cap dominance
  const dominanceEntries = Object.entries(data.market_cap_percentage)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <main id="global-page">
      <div className="content">
        <div className="page-header">
          <h1>Global Crypto Market</h1>
          <p className="subtitle">Real-time cryptocurrency market overview</p>
        </div>

        {/* Main Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card featured">
            <div className="stat-icon">
              <BarChart3 size={24} />
            </div>
            <div className="stat-content">
              <p className="label">Total Market Cap</p>
              <h2>{formatCurrency(data.total_market_cap.usd)}</h2>
              <div className={cn('change', isPositiveChange ? 'positive' : 'negative')}>
                {isPositiveChange ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span>{formatPercentage(data.market_cap_change_percentage_24h_usd)} (24h)</span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Activity size={24} />
            </div>
            <div className="stat-content">
              <p className="label">24h Trading Volume</p>
              <h3>{formatCurrency(data.total_volume.usd)}</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Coins size={24} />
            </div>
            <div className="stat-content">
              <p className="label">Active Cryptocurrencies</p>
              <h3>{data.active_cryptocurrencies.toLocaleString()}</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Globe size={24} />
            </div>
            <div className="stat-content">
              <p className="label">Markets</p>
              <h3>{data.markets.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        {/* Market Dominance */}
        <section className="dominance-section">
          <h2>Market Dominance</h2>
          <div className="dominance-grid">
            {dominanceEntries.map(([symbol, percentage]) => (
              <div key={symbol} className="dominance-card">
                <div className="dominance-header">
                  <span className="symbol">{symbol.toUpperCase()}</span>
                  <span className="percentage">{percentage.toFixed(2)}%</span>
                </div>
                <div className="dominance-bar">
                  <div
                    className="dominance-fill"
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ICO Stats */}
        <section className="ico-section">
          <h2>ICO Statistics</h2>
          <div className="ico-grid">
            <div className="ico-card">
              <p className="value">{data.upcoming_icos}</p>
              <p className="label">Upcoming ICOs</p>
            </div>
            <div className="ico-card">
              <p className="value">{data.ongoing_icos}</p>
              <p className="label">Ongoing ICOs</p>
            </div>
            <div className="ico-card">
              <p className="value">{data.ended_icos}</p>
              <p className="label">Ended ICOs</p>
            </div>
          </div>
        </section>

        <p className="last-updated">
          Last updated: {new Date(data.updated_at * 1000).toLocaleString()}
        </p>
      </div>
    </main>
  );
};

export default GlobalMarketPage;

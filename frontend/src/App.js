import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

// ─── Utils ────────────────────────────────────────────────────────────────────
const fmt = (n, dec = 2) => n?.toFixed(dec) ?? '—';
const fmtBig = (n) => {
  if (!n) return '—';
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toFixed(0)}`;
};
const fmtVol = (n) => {
  if (!n) return '—';
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n;
};

// ─── Sparkline ────────────────────────────────────────────────────────────────
const Sparkline = ({ data, color }) => (
  <ResponsiveContainer width="100%" height={40}>
    <LineChart data={data}>
      <Line type="monotone" dataKey="price" stroke={color} strokeWidth={1.5} dot={false} />
    </LineChart>
  </ResponsiveContainer>
);

// ─── Mini Chart ───────────────────────────────────────────────────────────────
const MiniChart = ({ data, symbol }) => {
  const color = data.length > 1 && data[data.length - 1].price >= data[0].price ? '#22c55e' : '#ef4444';
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data.slice(-60)}>
        <defs>
          <linearGradient id={`grad-${symbol}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="t" tick={{ fontSize: 9, fill: '#666' }} tickLine={false} />
        <YAxis domain={['auto', 'auto']} tick={{ fontSize: 9, fill: '#666' }} tickLine={false} axisLine={false} width={55} tickFormatter={(v) => `$${v.toFixed(0)}`} />
        <Tooltip
          contentStyle={{ background: '#0f1117', border: '1px solid #1e2030', borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: '#888' }}
          formatter={(v) => [`$${fmt(v)}`, 'Price']}
        />
        <Area type="monotone" dataKey="price" stroke={color} strokeWidth={2} fill={`url(#grad-${symbol})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
};

// ─── Volume Chart ─────────────────────────────────────────────────────────────
const VolumeChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={80}>
    <BarChart data={data.slice(-30)} barSize={4}>
      <Bar dataKey="volume" fill="#3b82f6" opacity={0.6} />
      <YAxis tick={false} axisLine={false} width={0} />
      <XAxis tick={false} axisLine={false} />
      <Tooltip
        contentStyle={{ background: '#0f1117', border: '1px solid #1e2030', borderRadius: 8, fontSize: 11 }}
        formatter={(v) => [fmtVol(v), 'Volume']}
      />
    </BarChart>
  </ResponsiveContainer>
);

// ─── Index Badge ─────────────────────────────────────────────────────────────
const IndexBadge = ({ name, value, change }) => {
  const up = change >= 0;
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 12, padding: '10px 16px', minWidth: 150
    }}>
      <div style={{ fontSize: 11, color: '#666', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>{name}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: '#e8eaf0', fontFamily: 'var(--mono)' }}>{value?.toLocaleString()}</div>
      <div style={{ fontSize: 12, color: up ? '#22c55e' : '#ef4444', marginTop: 2 }}>
        {up ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
      </div>
    </div>
  );
};

// ─── Stock Row ────────────────────────────────────────────────────────────────
const StockRow = ({ stock, sparkData, isSelected, onClick }) => {
  const up = stock.change >= 0;
  const [flash, setFlash] = useState(null);
  const prevPrice = useRef(stock.price);

  useEffect(() => {
    if (stock.price !== prevPrice.current) {
      setFlash(stock.price > prevPrice.current ? 'up' : 'down');
      prevPrice.current = stock.price;
      const t = setTimeout(() => setFlash(null), 600);
      return () => clearTimeout(t);
    }
  }, [stock.price]);

  return (
    <tr
      onClick={onClick}
      style={{
        cursor: 'pointer',
        background: isSelected
          ? 'rgba(59,130,246,0.12)'
          : flash === 'up'
          ? 'rgba(34,197,94,0.08)'
          : flash === 'down'
          ? 'rgba(239,68,68,0.08)'
          : 'transparent',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        transition: 'background 0.3s',
      }}
    >
      <td style={{ padding: '10px 12px', fontWeight: 700, color: '#e8eaf0', fontSize: 13 }}>{stock.symbol}</td>
      <td style={{ padding: '10px 4px', color: '#888', fontSize: 12, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stock.name}</td>
      <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 13, color: '#e8eaf0', fontWeight: 600 }}>
        ${fmt(stock.price)}
      </td>
      <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 13, color: up ? '#22c55e' : '#ef4444' }}>
        {up ? '+' : ''}{fmt(stock.change)}
      </td>
      <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 12 }}>
        <span style={{
          background: up ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
          color: up ? '#22c55e' : '#ef4444',
          padding: '2px 8px', borderRadius: 6, fontWeight: 600
        }}>
          {up ? '+' : ''}{fmt(stock.changePercent)}%
        </span>
      </td>
      <td style={{ padding: '10px 12px', color: '#555', fontSize: 12, textAlign: 'right' }}>{fmtVol(stock.volume)}</td>
      <td style={{ padding: '10px 12px', width: 90 }}>
        <Sparkline
          data={sparkData}
          color={up ? '#22c55e' : '#ef4444'}
        />
      </td>
    </tr>
  );
};

// ─── Detail Panel ─────────────────────────────────────────────────────────────
const DetailPanel = ({ stock, history }) => {
  if (!stock) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#444', fontSize: 14 }}>
      Select a stock to view details
    </div>
  );

  const up = stock.change >= 0;
  const chartData = history.map((p, i) => ({
    price: p.price,
    volume: p.volume,
    t: i % 30 === 0 ? new Date(p.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
  }));

  const statBox = (label, value) => (
    <div key={label} style={{
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 8, padding: '10px 14px'
    }}>
      <div style={{ fontSize: 11, color: '#555', marginBottom: 4, letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 14, color: '#ccc', fontFamily: 'var(--mono)', fontWeight: 600 }}>{value}</div>
    </div>
  );

  return (
    <div style={{ padding: '0 4px', height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#e8eaf0' }}>{stock.symbol}</div>
          <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>{stock.name}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--mono)', color: '#f0f2f8' }}>
            ${fmt(stock.price)}
          </div>
          <div style={{ fontSize: 14, color: up ? '#22c55e' : '#ef4444', fontFamily: 'var(--mono)' }}>
            {up ? '+' : ''}{fmt(stock.change)} ({up ? '+' : ''}{fmt(stock.changePercent)}%)
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 8, fontSize: 11, color: '#444', textTransform: 'uppercase', letterSpacing: 1 }}>Price · Today</div>
      <MiniChart data={chartData} symbol={stock.symbol} />

      <div style={{ marginTop: 8, marginBottom: 4, fontSize: 11, color: '#444', textTransform: 'uppercase', letterSpacing: 1 }}>Volume</div>
      <VolumeChart data={chartData} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 16 }}>
        {statBox('Open', `$${fmt(stock.open)}`)}
        {statBox('Prev Close', `$${fmt(stock.previousClose)}`)}
        {statBox('Day High', `$${fmt(stock.high)}`)}
        {statBox('Day Low', `$${fmt(stock.low)}`)}
        {statBox('52W High', `$${fmt(stock.weekHigh52)}`)}
        {statBox('52W Low', `$${fmt(stock.weekLow52)}`)}
        {statBox('Market Cap', fmtBig(stock.marketCap))}
        {statBox('P/E Ratio', fmt(stock.peRatio))}
        {statBox('Volume', fmtVol(stock.volume))}
        {statBox('Avg Volume', fmtVol(stock.avgVolume))}
        {statBox('Sector', stock.sector || '—')}
        {statBox('Updated', new Date(stock.lastUpdated).toLocaleTimeString())}
      </div>
    </div>
  );
};

// ─── Market Movers ────────────────────────────────────────────────────────────
const MoversList = ({ title, stocks, color }) => (
  <div style={{
    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 12, padding: 16, flex: 1
  }}>
    <div style={{ fontSize: 12, color: '#555', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>{title}</div>
    {stocks.map(s => (
      <div key={s.symbol} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#d0d4e0' }}>{s.symbol}</span>
          <span style={{ fontSize: 11, color: '#555', marginLeft: 8 }}>${fmt(s.price)}</span>
        </div>
        <span style={{ fontSize: 13, color, fontFamily: 'var(--mono)', fontWeight: 600 }}>
          {s.changePercent >= 0 ? '+' : ''}{fmt(s.changePercent)}%
        </span>
      </div>
    ))}
  </div>
);

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [stocks, setStocks] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [priceHistories, setPriceHistories] = useState({});
  const [marketSummary, setMarketSummary] = useState(null);
  const [connected, setConnected] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // all | gainers | losers | active
  const stompRef = useRef(null);

  // Fetch initial data
  useEffect(() => {
    fetch('/api/stocks')
      .then(r => r.json())
      .then(data => {
        setStocks(data);
        if (data.length > 0) setSelectedSymbol(data[0].symbol);
      })
      .catch(console.error);

    fetch('/api/stocks/market/summary')
      .then(r => r.json())
      .then(setMarketSummary)
      .catch(console.error);
  }, []);

  // Fetch price history when selected stock changes
  useEffect(() => {
    if (!selectedSymbol || priceHistories[selectedSymbol]) return;
    fetch(`/api/stocks/${selectedSymbol}/history`)
      .then(r => r.json())
      .then(data => {
        setPriceHistories(prev => ({ ...prev, [selectedSymbol]: data }));
      })
      .catch(console.error);
  }, [selectedSymbol]);

  // WebSocket connection
  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      reconnectDelay: 3000,
      onConnect: () => {
        setConnected(true);

        client.subscribe('/topic/stocks', msg => {
          const data = JSON.parse(msg.body);
          setStocks(data);
          // Update price history for selected symbol
          const selected = data.find(s => s.symbol === selectedSymbol);
          if (selected) {
            setPriceHistories(prev => {
              const existing = prev[selectedSymbol] || [];
              const newPoint = { price: selected.price, volume: selected.volume, timestamp: selected.lastUpdated };
              return { ...prev, [selectedSymbol]: [...existing.slice(-499), newPoint] };
            });
          }
        });

        client.subscribe('/topic/market-summary', msg => {
          setMarketSummary(JSON.parse(msg.body));
        });
      },
      onDisconnect: () => setConnected(false),
    });

    client.activate();
    stompRef.current = client;

    return () => client.deactivate();
  }, [selectedSymbol]);

  const filteredStocks = stocks.filter(s =>
    s.symbol.toLowerCase().includes(search.toLowerCase()) ||
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const sortedStocks = [...filteredStocks].sort((a, b) => {
    if (activeTab === 'gainers') return b.changePercent - a.changePercent;
    if (activeTab === 'losers') return a.changePercent - b.changePercent;
    if (activeTab === 'active') return b.volume - a.volume;
    return a.symbol.localeCompare(b.symbol);
  });

  const selectedStock = stocks.find(s => s.symbol === selectedSymbol);
  const selectedHistory = priceHistories[selectedSymbol] || [];

  const gainers = [...stocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5);
  const losers = [...stocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5);

  const TAB = ({ id, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      style={{
        padding: '6px 14px',
        background: activeTab === id ? 'rgba(59,130,246,0.2)' : 'transparent',
        border: activeTab === id ? '1px solid rgba(59,130,246,0.4)' : '1px solid transparent',
        borderRadius: 8,
        color: activeTab === id ? '#60a5fa' : '#555',
        fontSize: 12,
        cursor: 'pointer',
        fontWeight: 600,
        letterSpacing: 0.3,
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#080a0f', color: '#e8eaf0', fontFamily: 'var(--sans)' }}>
      <style>{`
        :root {
          --sans: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          --mono: 'JetBrains Mono', 'Fira Code', monospace;
        }
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e2030; border-radius: 4px; }
        tbody tr:hover { background: rgba(255,255,255,0.04) !important; }
      `}</style>

      {/* Header */}
      <div style={{
        background: 'rgba(10,12,18,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(20px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 800
          }}>⬡</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#f0f2f8', letterSpacing: -0.3 }}>StockPulse</div>
            <div style={{ fontSize: 10, color: '#444', letterSpacing: 1 }}>REAL-TIME ANALYTICS</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, overflowX: 'auto' }}>
          {marketSummary && <>
            <IndexBadge name="S&P 500" value={marketSummary.sp500} change={marketSummary.sp500Change} />
            <IndexBadge name="NASDAQ" value={marketSummary.nasdaq} change={marketSummary.nasdaqChange} />
            <IndexBadge name="DOW" value={marketSummary.dowJones} change={marketSummary.dowJonesChange} />
          </>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: connected ? '#22c55e' : '#ef4444',
            boxShadow: connected ? '0 0 8px #22c55e' : '0 0 8px #ef4444',
            animation: connected ? 'pulse 2s infinite' : 'none'
          }} />
          <span style={{ fontSize: 11, color: connected ? '#22c55e' : '#ef4444' }}>
            {connected ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>

      {/* Market breadth bar */}
      {marketSummary && (
        <div style={{ padding: '8px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: 16, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#444' }}>MARKET BREADTH</span>
          {[
            { label: `▲ ${marketSummary.advancers} Advancing`, color: '#22c55e' },
            { label: `▼ ${marketSummary.decliners} Declining`, color: '#ef4444' },
            { label: `— ${marketSummary.unchanged} Unchanged`, color: '#555' },
          ].map(b => (
            <span key={b.label} style={{ fontSize: 11, color: b.color }}>{b.label}</span>
          ))}
          <span style={{ fontSize: 11, color: '#3b82f6', marginLeft: 'auto', padding: '2px 10px', background: 'rgba(59,130,246,0.1)', borderRadius: 6 }}>
            ● {marketSummary.marketStatus}
          </span>
        </div>
      )}

      {/* Main Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 0, height: 'calc(100vh - 120px)' }}>

        {/* Left: Table */}
        <div style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>

          {/* Toolbar */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search stocks..."
              style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8, padding: '6px 12px', color: '#d0d4e0', fontSize: 12,
                outline: 'none', width: 180
              }}
            />
            <TAB id="all" label="All" />
            <TAB id="gainers" label="▲ Gainers" />
            <TAB id="losers" label="▼ Losers" />
            <TAB id="active" label="⚡ Active" />
            <span style={{ marginLeft: 'auto', fontSize: 11, color: '#444' }}>{sortedStocks.length} stocks</span>
          </div>

          {/* Table */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: 80 }} />
                <col style={{ width: 160 }} />
                <col style={{ width: 90 }} />
                <col style={{ width: 80 }} />
                <col style={{ width: 90 }} />
                <col style={{ width: 70 }} />
                <col style={{ width: 90 }} />
              </colgroup>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Symbol', 'Name', 'Price', 'Change', '%', 'Volume', 'Trend'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: h === 'Symbol' || h === 'Name' || h === 'Trend' ? 'left' : 'right', fontSize: 10, color: '#444', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedStocks.map(stock => (
                  <StockRow
                    key={stock.symbol}
                    stock={stock}
                    sparkData={(priceHistories[stock.symbol] || []).slice(-20)}
                    isSelected={stock.symbol === selectedSymbol}
                    onClick={() => setSelectedSymbol(stock.symbol)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Movers */}
          <div style={{ padding: 16, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 12 }}>
            <MoversList title="Top Gainers" stocks={gainers} color="#22c55e" />
            <MoversList title="Top Losers" stocks={losers} color="#ef4444" />
          </div>
        </div>

        {/* Right: Detail Panel */}
        <div style={{ padding: 20, overflowY: 'auto' }}>
          <DetailPanel stock={selectedStock} history={selectedHistory} />
        </div>
      </div>
    </div>
  );
}

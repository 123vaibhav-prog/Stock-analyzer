# StockPulse — Real-Time Stock Analysis

A full-stack real-time stock analysis application built with **Spring Boot** (backend) and **React** (frontend), using **WebSockets (STOMP)** for live data streaming.

---

## 📁 Project Structure

```
stock-analyzer/
├── backend/                        # Spring Boot application
│   ├── pom.xml
│   └── src/main/java/com/stockanalyzer/
│       ├── StockAnalyzerApplication.java
│       ├── config/
│       │   ├── WebSocketConfig.java     # STOMP WebSocket setup
│       │   └── SecurityConfig.java      # Permit all (demo mode)
│       ├── controller/
│       │   └── StockController.java     # REST API endpoints
│       ├── model/
│       │   ├── Stock.java               # Stock entity
│       │   ├── PricePoint.java          # Historical price data
│       │   └── MarketSummary.java       # Index + breadth data
│       └── service/
│           ├── StockService.java            # Business logic & simulation
│           └── WebSocketBroadcastService.java  # Scheduled real-time push
│
└── frontend/                       # React application
    ├── package.json
    ├── public/index.html
    └── src/
        ├── index.js
        └── App.js                   # Full app (charts, table, detail panel)
```

---

## 🚀 Quick Start

### Prerequisites
- **Java 21+**
- **Maven 3.8+**
- **Node.js 18+** and **npm**

---

### 1. Start the Backend

```bash
cd backend
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`

---

### 2. Start the Frontend

```bash
cd frontend
npm install
npm start
```

The app opens at `http://localhost:3000`

> The frontend proxies API calls to `localhost:8080` via the `"proxy"` field in `package.json`.

---

## 🌐 REST API Endpoints

| Method | Endpoint                        | Description                    |
|--------|---------------------------------|--------------------------------|
| GET    | `/api/stocks`                   | All 20 stocks with live prices |
| GET    | `/api/stocks/{symbol}`          | Single stock detail            |
| GET    | `/api/stocks/{symbol}/history`  | Price history (up to 500 pts)  |
| GET    | `/api/stocks/market/summary`    | S&P 500, NASDAQ, DOW + breadth |
| GET    | `/api/stocks/market/gainers`    | Top 5 gainers                  |
| GET    | `/api/stocks/market/losers`     | Top 5 losers                   |
| GET    | `/api/stocks/market/active`     | Most active by volume          |
| GET    | `/api/stocks/search?q={query}`  | Search by symbol or name       |

---

## 📡 WebSocket (STOMP)

Connect to: `ws://localhost:8080/ws` (via SockJS)

| Topic                  | Payload            | Frequency    |
|------------------------|--------------------|--------------|
| `/topic/stocks`        | `Stock[]`          | Every 1.5s   |
| `/topic/market-summary`| `MarketSummary`    | Every 1.5s   |

---

## ✨ Features

- **Real-time prices** — WebSocket push every 1.5 seconds
- **20 stocks** across Technology, Financials, Healthcare, Energy, and more
- **Interactive table** — sortable by gainers, losers, most active
- **Price + volume charts** — live-updating area and bar charts via Recharts
- **Sparklines** — per-row mini trend charts
- **Detail panel** — full stats: open, high, low, 52-week range, P/E, market cap
- **Market indices** — S&P 500, NASDAQ, Dow Jones with % change
- **Market breadth** — Advancing / Declining / Unchanged counts
- **Top movers** — Gainers and Losers at a glance
- **Price flash animation** — green/red flash on price changes
- **Search** — filter by symbol or company name
- **Live indicator** — green pulsing dot when WebSocket is connected

---

## 🔧 Configuration

Edit `backend/src/main/resources/application.properties`:

```properties
server.port=8080                  # Change backend port
```

Edit `frontend/package.json`:
```json
"proxy": "http://localhost:8080"  # Must match backend port
```

To connect to a real market data provider (e.g. Alpha Vantage, Polygon.io, Yahoo Finance), replace the simulation logic in `StockService.java` — all other layers (WebSocket, REST, frontend) remain unchanged.

---

## 🏗 Architecture

```
React Frontend
     │
     ├── REST (axios)     → Spring Boot REST Controller
     │                         └── StockService (in-memory)
     │
     └── WebSocket STOMP  → Spring WebSocket Broker
                               └── WebSocketBroadcastService
                                       └── @Scheduled every 1.5s
                                               └── StockService.updatePrices()
```

---

## 📦 Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Backend   | Java 21, Spring Boot 3.2, Spring WebSocket, Spring Security |
| Frontend  | React 18, Recharts, STOMP.js, SockJS   |
| Real-time | STOMP over SockJS WebSocket             |
| Build     | Maven (backend), Create React App (frontend) |

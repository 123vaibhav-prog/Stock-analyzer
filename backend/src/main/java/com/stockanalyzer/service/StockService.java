package com.stockanalyzer.service;

import com.stockanalyzer.model.MarketSummary;
import com.stockanalyzer.model.PricePoint;
import com.stockanalyzer.model.Stock;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class StockService {

    private final Map<String, Stock> stockMap = new ConcurrentHashMap<>();
    private final Map<String, List<PricePoint>> priceHistory = new ConcurrentHashMap<>();
    private final Random random = new Random();

    private double sp500 = 5234.18;
    private double nasdaq = 16742.39;
    private double dowJones = 39127.80;

    public StockService() {
        initializeStocks();
        initializePriceHistory();
    }

    private void initializeStocks() {
        List<Stock> stocks = Arrays.asList(
            new Stock("AAPL", "Apple Inc.", 189.30, 187.15, "Technology", 2900000000000.0, 29.8, 199.62, 124.17, 57800000),
            new Stock("MSFT", "Microsoft Corp.", 415.50, 412.80, "Technology", 3080000000000.0, 36.2, 430.82, 241.51, 21500000),
            new Stock("GOOGL", "Alphabet Inc.", 175.98, 173.72, "Technology", 2170000000000.0, 25.1, 180.25, 102.21, 24300000),
            new Stock("AMZN", "Amazon.com Inc.", 198.12, 194.50, "Consumer Discretionary", 2060000000000.0, 62.4, 201.20, 101.26, 38700000),
            new Stock("NVDA", "NVIDIA Corp.", 875.40, 850.20, "Technology", 2160000000000.0, 73.5, 974.00, 222.97, 44800000),
            new Stock("META", "Meta Platforms Inc.", 524.60, 518.30, "Communication Services", 1340000000000.0, 28.9, 531.49, 173.88, 16200000),
            new Stock("TSLA", "Tesla Inc.", 248.50, 255.00, "Consumer Discretionary", 790000000000.0, 68.3, 299.29, 138.80, 104000000),
            new Stock("BRK.B", "Berkshire Hathaway B", 395.80, 393.10, "Financials", 870000000000.0, 22.1, 401.55, 310.65, 3800000),
            new Stock("JPM", "JPMorgan Chase & Co.", 200.45, 198.70, "Financials", 578000000000.0, 12.1, 205.88, 135.19, 9800000),
            new Stock("V", "Visa Inc.", 280.75, 278.50, "Financials", 577000000000.0, 30.4, 290.96, 216.89, 7100000),
            new Stock("JNJ", "Johnson & Johnson", 158.20, 159.80, "Healthcare", 381000000000.0, 15.8, 175.97, 144.95, 7600000),
            new Stock("WMT", "Walmart Inc.", 64.85, 63.90, "Consumer Staples", 521000000000.0, 28.6, 67.88, 47.27, 21300000),
            new Stock("MA", "Mastercard Inc.", 477.30, 472.80, "Financials", 444000000000.0, 33.7, 496.18, 350.16, 3100000),
            new Stock("PG", "Procter & Gamble Co.", 164.50, 165.20, "Consumer Staples", 387000000000.0, 25.8, 168.57, 131.03, 6500000),
            new Stock("HD", "Home Depot Inc.", 382.60, 379.40, "Consumer Discretionary", 380000000000.0, 22.4, 396.66, 274.26, 3300000),
            new Stock("XOM", "Exxon Mobil Corp.", 115.30, 113.80, "Energy", 462000000000.0, 14.2, 123.75, 95.77, 17800000),
            new Stock("BAC", "Bank of America Corp.", 37.80, 37.20, "Financials", 297000000000.0, 12.5, 39.99, 24.96, 42600000),
            new Stock("ABBV", "AbbVie Inc.", 168.40, 165.90, "Healthcare", 297000000000.0, 17.3, 175.71, 124.24, 6200000),
            new Stock("COST", "Costco Wholesale", 828.50, 820.30, "Consumer Staples", 368000000000.0, 51.2, 887.97, 591.10, 2600000),
            new Stock("NFLX", "Netflix Inc.", 628.20, 618.50, "Communication Services", 270000000000.0, 43.8, 691.44, 344.73, 4500000)
        );

        stocks.forEach(s -> stockMap.put(s.getSymbol(), s));
    }

    private void initializePriceHistory() {
        stockMap.forEach((symbol, stock) -> {
            List<PricePoint> history = new ArrayList<>();
            double basePrice = stock.getPrice() * 0.95;
            Instant now = Instant.now();

            for (int i = 390; i >= 0; i--) {
                double drift = (random.nextGaussian() * 0.003);
                basePrice = basePrice * (1 + drift);
                basePrice = Math.max(basePrice, stock.getPrice() * 0.90);

                long vol = (long)(stock.getAvgVolume() / 390 * (0.5 + random.nextDouble()));
                history.add(new PricePoint(
                    now.minus(i, ChronoUnit.MINUTES),
                    Math.round(basePrice * 100.0) / 100.0,
                    vol
                ));
            }
            priceHistory.put(symbol, history);
        });
    }

    public void updatePrices() {
        stockMap.forEach((symbol, stock) -> {
            // Simulate realistic price movement
            double volatility = getVolatility(symbol);
            double drift = (random.nextGaussian() * volatility);

            // Add slight momentum
            double momentum = (stock.getPrice() - stock.getOpen()) / stock.getOpen() * 0.1;
            double priceChange = stock.getPrice() * (drift + momentum * 0.01);

            double newPrice = Math.round((stock.getPrice() + priceChange) * 100.0) / 100.0;
            newPrice = Math.max(newPrice, stock.getWeekLow52() * 0.8);

            stock.setPrice(newPrice);
            stock.setHigh(Math.max(stock.getHigh(), newPrice));
            stock.setLow(Math.min(stock.getLow(), newPrice));
            stock.setVolume(stock.getVolume() + (long)(stock.getAvgVolume() / 390 * (0.5 + random.nextDouble())));
            stock.setLastUpdated(Instant.now());
            stock.computeChange();

            // Update price history
            List<PricePoint> history = priceHistory.get(symbol);
            if (history != null) {
                history.add(new PricePoint(Instant.now(), newPrice, stock.getVolume()));
                if (history.size() > 500) history.remove(0);
            }
        });

        // Update indices
        sp500 = sp500 * (1 + random.nextGaussian() * 0.0005);
        nasdaq = nasdaq * (1 + random.nextGaussian() * 0.0006);
        dowJones = dowJones * (1 + random.nextGaussian() * 0.0004);
    }

    private double getVolatility(String symbol) {
        return switch (symbol) {
            case "TSLA", "NVDA" -> 0.004;
            case "AAPL", "MSFT", "GOOGL" -> 0.002;
            case "BRK.B", "JNJ", "PG" -> 0.001;
            default -> 0.0025;
        };
    }

    public List<Stock> getAllStocks() {
        return new ArrayList<>(stockMap.values());
    }

    public Optional<Stock> getStock(String symbol) {
        return Optional.ofNullable(stockMap.get(symbol.toUpperCase()));
    }

    public List<PricePoint> getPriceHistory(String symbol) {
        return priceHistory.getOrDefault(symbol.toUpperCase(), Collections.emptyList());
    }

    public List<Stock> getTopGainers() {
        return stockMap.values().stream()
            .sorted((a, b) -> Double.compare(b.getChangePercent(), a.getChangePercent()))
            .limit(5)
            .collect(Collectors.toList());
    }

    public List<Stock> getTopLosers() {
        return stockMap.values().stream()
            .sorted(Comparator.comparingDouble(Stock::getChangePercent))
            .limit(5)
            .collect(Collectors.toList());
    }

    public List<Stock> getMostActive() {
        return stockMap.values().stream()
            .sorted((a, b) -> Long.compare(b.getVolume(), a.getVolume()))
            .limit(5)
            .collect(Collectors.toList());
    }

    public MarketSummary getMarketSummary() {
        MarketSummary summary = new MarketSummary();
        summary.setSp500(Math.round(sp500 * 100.0) / 100.0);
        summary.setSp500Change(Math.round((sp500 - 5200.0) / 5200.0 * 100 * 100.0) / 100.0);
        summary.setNasdaq(Math.round(nasdaq * 100.0) / 100.0);
        summary.setNasdaqChange(Math.round((nasdaq - 16700.0) / 16700.0 * 100 * 100.0) / 100.0);
        summary.setDowJones(Math.round(dowJones * 100.0) / 100.0);
        summary.setDowJonesChange(Math.round((dowJones - 39000.0) / 39000.0 * 100 * 100.0) / 100.0);

        long advancers = stockMap.values().stream().filter(s -> s.getChange() > 0).count();
        long decliners = stockMap.values().stream().filter(s -> s.getChange() < 0).count();
        summary.setAdvancers((int) advancers);
        summary.setDecliners((int) decliners);
        summary.setUnchanged((int)(stockMap.size() - advancers - decliners));
        summary.setMarketStatus("OPEN");

        return summary;
    }

    public List<Stock> searchStocks(String query) {
        String q = query.toLowerCase();
        return stockMap.values().stream()
            .filter(s -> s.getSymbol().toLowerCase().contains(q) || s.getName().toLowerCase().contains(q))
            .collect(Collectors.toList());
    }
}

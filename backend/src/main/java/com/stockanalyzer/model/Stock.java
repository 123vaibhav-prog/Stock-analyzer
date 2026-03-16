package com.stockanalyzer.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;

public class Stock {
    private String symbol;
    private String name;
    private double price;
    private double previousClose;
    private double open;
    private double high;
    private double low;
    private long volume;
    private double change;
    private double changePercent;
    private String trend; // UP, DOWN, NEUTRAL
    private Instant lastUpdated;
    private double marketCap;
    private double peRatio;
    private double weekHigh52;
    private double weekLow52;
    private double avgVolume;
    private String sector;

    public Stock() {}

    public Stock(String symbol, String name, double price, double previousClose,
                 String sector, double marketCap, double peRatio,
                 double weekHigh52, double weekLow52, double avgVolume) {
        this.symbol = symbol;
        this.name = name;
        this.price = price;
        this.previousClose = previousClose;
        this.open = price;
        this.high = price;
        this.low = price;
        this.volume = (long)(avgVolume * 0.3);
        this.sector = sector;
        this.marketCap = marketCap;
        this.peRatio = peRatio;
        this.weekHigh52 = weekHigh52;
        this.weekLow52 = weekLow52;
        this.avgVolume = avgVolume;
        this.lastUpdated = Instant.now();
        computeChange();
    }

    public void computeChange() {
        this.change = this.price - this.previousClose;
        this.changePercent = (this.change / this.previousClose) * 100;
        if (this.change > 0) this.trend = "UP";
        else if (this.change < 0) this.trend = "DOWN";
        else this.trend = "NEUTRAL";
    }

    // Getters and Setters
    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public double getPreviousClose() { return previousClose; }
    public void setPreviousClose(double previousClose) { this.previousClose = previousClose; }

    public double getOpen() { return open; }
    public void setOpen(double open) { this.open = open; }

    public double getHigh() { return high; }
    public void setHigh(double high) { this.high = high; }

    public double getLow() { return low; }
    public void setLow(double low) { this.low = low; }

    public long getVolume() { return volume; }
    public void setVolume(long volume) { this.volume = volume; }

    public double getChange() { return change; }
    public void setChange(double change) { this.change = change; }

    @JsonProperty("changePercent")
    public double getChangePercent() { return changePercent; }
    public void setChangePercent(double changePercent) { this.changePercent = changePercent; }

    public String getTrend() { return trend; }
    public void setTrend(String trend) { this.trend = trend; }

    public Instant getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(Instant lastUpdated) { this.lastUpdated = lastUpdated; }

    public double getMarketCap() { return marketCap; }
    public void setMarketCap(double marketCap) { this.marketCap = marketCap; }

    public double getPeRatio() { return peRatio; }
    public void setPeRatio(double peRatio) { this.peRatio = peRatio; }

    public double getWeekHigh52() { return weekHigh52; }
    public void setWeekHigh52(double weekHigh52) { this.weekHigh52 = weekHigh52; }

    public double getWeekLow52() { return weekLow52; }
    public void setWeekLow52(double weekLow52) { this.weekLow52 = weekLow52; }

    public double getAvgVolume() { return avgVolume; }
    public void setAvgVolume(double avgVolume) { this.avgVolume = avgVolume; }

    public String getSector() { return sector; }
    public void setSector(String sector) { this.sector = sector; }
}

package com.stockanalyzer.model;

public class MarketSummary {
    private double sp500;
    private double sp500Change;
    private double nasdaq;
    private double nasdaqChange;
    private double dowJones;
    private double dowJonesChange;
    private int advancers;
    private int decliners;
    private int unchanged;
    private String marketStatus; // OPEN, CLOSED, PRE_MARKET, AFTER_HOURS

    public MarketSummary() {}

    // Getters and Setters
    public double getSp500() { return sp500; }
    public void setSp500(double sp500) { this.sp500 = sp500; }

    public double getSp500Change() { return sp500Change; }
    public void setSp500Change(double sp500Change) { this.sp500Change = sp500Change; }

    public double getNasdaq() { return nasdaq; }
    public void setNasdaq(double nasdaq) { this.nasdaq = nasdaq; }

    public double getNasdaqChange() { return nasdaqChange; }
    public void setNasdaqChange(double nasdaqChange) { this.nasdaqChange = nasdaqChange; }

    public double getDowJones() { return dowJones; }
    public void setDowJones(double dowJones) { this.dowJones = dowJones; }

    public double getDowJonesChange() { return dowJonesChange; }
    public void setDowJonesChange(double dowJonesChange) { this.dowJonesChange = dowJonesChange; }

    public int getAdvancers() { return advancers; }
    public void setAdvancers(int advancers) { this.advancers = advancers; }

    public int getDecliners() { return decliners; }
    public void setDecliners(int decliners) { this.decliners = decliners; }

    public int getUnchanged() { return unchanged; }
    public void setUnchanged(int unchanged) { this.unchanged = unchanged; }

    public String getMarketStatus() { return marketStatus; }
    public void setMarketStatus(String marketStatus) { this.marketStatus = marketStatus; }
}

package com.stockanalyzer.model;

import java.time.Instant;

public class PricePoint {
    private Instant timestamp;
    private double price;
    private long volume;

    public PricePoint(Instant timestamp, double price, long volume) {
        this.timestamp = timestamp;
        this.price = price;
        this.volume = volume;
    }

    public Instant getTimestamp() { return timestamp; }
    public double getPrice() { return price; }
    public long getVolume() { return volume; }
}

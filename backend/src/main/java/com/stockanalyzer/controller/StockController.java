package com.stockanalyzer.controller;

import com.stockanalyzer.model.MarketSummary;
import com.stockanalyzer.model.PricePoint;
import com.stockanalyzer.model.Stock;
import com.stockanalyzer.service.StockService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stocks")
@CrossOrigin(origins = "*")
public class StockController {

    @Autowired
    private StockService stockService;

    @GetMapping
    public ResponseEntity<List<Stock>> getAllStocks() {
        return ResponseEntity.ok(stockService.getAllStocks());
    }

    @GetMapping("/{symbol}")
    public ResponseEntity<Stock> getStock(@PathVariable String symbol) {
        return stockService.getStock(symbol)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{symbol}/history")
    public ResponseEntity<List<PricePoint>> getPriceHistory(@PathVariable String symbol) {
        List<PricePoint> history = stockService.getPriceHistory(symbol);
        if (history.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(history);
    }

    @GetMapping("/market/summary")
    public ResponseEntity<MarketSummary> getMarketSummary() {
        return ResponseEntity.ok(stockService.getMarketSummary());
    }

    @GetMapping("/market/gainers")
    public ResponseEntity<List<Stock>> getTopGainers() {
        return ResponseEntity.ok(stockService.getTopGainers());
    }

    @GetMapping("/market/losers")
    public ResponseEntity<List<Stock>> getTopLosers() {
        return ResponseEntity.ok(stockService.getTopLosers());
    }

    @GetMapping("/market/active")
    public ResponseEntity<List<Stock>> getMostActive() {
        return ResponseEntity.ok(stockService.getMostActive());
    }

    @GetMapping("/search")
    public ResponseEntity<List<Stock>> searchStocks(@RequestParam String q) {
        return ResponseEntity.ok(stockService.searchStocks(q));
    }
}

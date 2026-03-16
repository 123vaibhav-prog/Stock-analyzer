package com.stockanalyzer.service;

import com.stockanalyzer.model.Stock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WebSocketBroadcastService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private StockService stockService;

    @Scheduled(fixedRate = 1500) // Update every 1.5 seconds
    public void broadcastStockUpdates() {
        stockService.updatePrices();

        // Broadcast all stock updates
        List<Stock> stocks = stockService.getAllStocks();
        messagingTemplate.convertAndSend("/topic/stocks", stocks);

        // Broadcast market summary
        messagingTemplate.convertAndSend("/topic/market-summary", stockService.getMarketSummary());
    }
}

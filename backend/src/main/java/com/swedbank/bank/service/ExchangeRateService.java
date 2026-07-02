package com.swedbank.bank.service;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Map;

@Service
public class ExchangeRateService {

    private static final Map<String, Map<String, BigDecimal>> RATES = Map.of(
        "EUR", Map.of("USD", new BigDecimal("1.18"), "SEK", new BigDecimal("10.50"), "GBP", new BigDecimal("0.85"), "VND", new BigDecimal("27000")),
        "USD", Map.of("EUR", new BigDecimal("0.85"), "SEK", new BigDecimal("8.90"), "GBP", new BigDecimal("0.72"), "VND", new BigDecimal("23000")),
        "SEK", Map.of("EUR", new BigDecimal("0.095"), "USD", new BigDecimal("0.11"), "GBP", new BigDecimal("0.081"), "VND", new BigDecimal("2570")),
        "GBP", Map.of("EUR", new BigDecimal("1.18"), "USD", new BigDecimal("1.39"), "SEK", new BigDecimal("12.35"), "VND", new BigDecimal("31765")),
        "VND", Map.of("EUR", new BigDecimal("0.000037"), "USD", new BigDecimal("0.000043"), "SEK", new BigDecimal("0.00039"), "GBP", new BigDecimal("0.000031"))
    );

    public BigDecimal getRate(String from, String to) {
        if (from.equals(to)) return BigDecimal.ONE;
        Map<String, BigDecimal> fromRates = RATES.get(from);
        if (fromRates == null) throw new IllegalArgumentException("Unknown currency: " + from);
        BigDecimal rate = fromRates.get(to);
        if (rate == null) throw new IllegalArgumentException("Unknown currency: " + to);
        return rate;
    }

    public BigDecimal convert(BigDecimal amount, String from, String to) {
        return amount.multiply(getRate(from, to));
    }
}

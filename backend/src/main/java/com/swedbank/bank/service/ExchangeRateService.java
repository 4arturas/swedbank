package com.swedbank.bank.service;

import com.swedbank.bank.dto.ExchangeRateDto;
import com.swedbank.bank.model.ExchangeRate;
import com.swedbank.bank.repository.ExchangeRateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExchangeRateService {

    private final ExchangeRateRepository exchangeRateRepository;

    public BigDecimal getRate(String from, String to) {
        if (from.equals(to)) return BigDecimal.ONE;
        return exchangeRateRepository
            .findByFromCurrency_CodeAndToCurrency_Code(from, to)
            .map(ExchangeRate::getRate)
            .orElseThrow(() -> new IllegalArgumentException("Exchange rate not found for " + from + " -> " + to));
    }

    public BigDecimal convert(BigDecimal amount, String from, String to) {
        return amount.multiply(getRate(from, to))
            .setScale(2, RoundingMode.HALF_UP);
    }

    public List<ExchangeRateDto> getAllRates() {
        return exchangeRateRepository.findAllByOrderByFromCurrency_CodeAscToCurrency_CodeAsc()
            .stream()
            .map(r -> new ExchangeRateDto(
                r.getId(),
                r.getFromCurrency().getCode(),
                r.getToCurrency().getCode(),
                r.getRate()))
            .toList();
    }
}

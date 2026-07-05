package com.swedbank.bank.dto;

import java.math.BigDecimal;

public record ExchangeRateDto(Long id, String fromCurrency, String toCurrency, BigDecimal rate) {}

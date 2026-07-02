package com.swedbank.bank.dto;

import java.math.BigDecimal;

public record ExchangeRequest(Long fromAccountId, Long toAccountId, BigDecimal amount) {}

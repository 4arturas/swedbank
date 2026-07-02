package com.swedbank.bank.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TransactionDto(Long id, Long accountId, String type, BigDecimal amount, String currency,
                             BigDecimal balanceBefore, BigDecimal balanceAfter, LocalDateTime timestamp) {}

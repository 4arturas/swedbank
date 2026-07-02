package com.swedbank.bank.dto;

import java.math.BigDecimal;

public record AccountDto(Long id, Long userId, String currency, BigDecimal balance) {}

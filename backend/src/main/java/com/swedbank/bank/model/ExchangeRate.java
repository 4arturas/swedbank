package com.swedbank.bank.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Getter
@NoArgsConstructor
@Table(name = "exchange_rates", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"from_currency_code", "to_currency_code"})
})
public class ExchangeRate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_currency_code", nullable = false)
    private Currency fromCurrency;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_currency_code", nullable = false)
    private Currency toCurrency;

    @Column(nullable = false, precision = 19, scale = 6)
    private BigDecimal rate;

    public ExchangeRate(Currency fromCurrency, Currency toCurrency, BigDecimal rate) {
        this.fromCurrency = fromCurrency;
        this.toCurrency = toCurrency;
        this.rate = rate;
    }
}

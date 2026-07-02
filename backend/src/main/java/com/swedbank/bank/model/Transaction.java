package com.swedbank.bank.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "account_id")
    private Account account;

    private String type;

    private BigDecimal amount;

    private String currency;

    private BigDecimal balanceBefore;

    private BigDecimal balanceAfter;

    private LocalDateTime timestamp;

    public Transaction(Account account, String type, BigDecimal amount, String currency,
                       BigDecimal balanceBefore, BigDecimal balanceAfter) {
        this.account = account;
        this.type = type;
        this.amount = amount;
        this.currency = currency;
        this.balanceBefore = balanceBefore;
        this.balanceAfter = balanceAfter;
        this.timestamp = LocalDateTime.now();
    }
}

package com.swedbank.bank.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "accounts")
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String currency;

    private BigDecimal balance;

    public Account(User user, String currency, BigDecimal balance) {
        this.user = user;
        this.currency = currency;
        this.balance = balance;
    }
}

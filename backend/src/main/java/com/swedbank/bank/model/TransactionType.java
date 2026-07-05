package com.swedbank.bank.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "transaction_types")
public class TransactionType {

    @Id
    @Column(nullable = false, length = 20)
    private String code;

    @Column(nullable = false)
    private String name;

    public TransactionType(String code, String name) {
        this.code = code;
        this.name = name;
    }
}

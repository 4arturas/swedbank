package com.swedbank.bank.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
@Table(name = "currencies")
public class Currency {

    @Id
    @Column(nullable = false, length = 10)
    private String code;

    @Column(nullable = false)
    private String name;

    public Currency(String code, String name) {
        this.code = code;
        this.name = name;
    }
}

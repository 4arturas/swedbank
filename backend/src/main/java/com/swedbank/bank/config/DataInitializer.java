package com.swedbank.bank.config;

import com.swedbank.bank.model.Currency;
import com.swedbank.bank.model.ExchangeRate;
import com.swedbank.bank.model.User;
import com.swedbank.bank.repository.CurrencyRepository;
import com.swedbank.bank.repository.ExchangeRateRepository;
import com.swedbank.bank.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CurrencyRepository currencyRepository;
    private final ExchangeRateRepository exchangeRateRepository;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            userRepository.save(new User("Alice"));
            userRepository.save(new User("Bob"));
        }

        if (currencyRepository.count() == 0) {
            Currency eur = currencyRepository.save(new Currency("EUR", "Euro"));
            Currency usd = currencyRepository.save(new Currency("USD", "US Dollar"));
            Currency sek = currencyRepository.save(new Currency("SEK", "Swedish Krona"));
            Currency gbp = currencyRepository.save(new Currency("GBP", "British Pound"));
            Currency vnd = currencyRepository.save(new Currency("VND", "Vietnamese Dong"));

            exchangeRateRepository.saveAll(List.of(
                new ExchangeRate(eur, usd, new BigDecimal("1.18")),
                new ExchangeRate(eur, sek, new BigDecimal("10.50")),
                new ExchangeRate(eur, gbp, new BigDecimal("0.85")),
                new ExchangeRate(eur, vnd, new BigDecimal("27000")),
                new ExchangeRate(usd, eur, new BigDecimal("0.85")),
                new ExchangeRate(usd, sek, new BigDecimal("8.90")),
                new ExchangeRate(usd, gbp, new BigDecimal("0.72")),
                new ExchangeRate(usd, vnd, new BigDecimal("23000")),
                new ExchangeRate(sek, eur, new BigDecimal("0.095")),
                new ExchangeRate(sek, usd, new BigDecimal("0.11")),
                new ExchangeRate(sek, gbp, new BigDecimal("0.081")),
                new ExchangeRate(sek, vnd, new BigDecimal("2570")),
                new ExchangeRate(gbp, eur, new BigDecimal("1.18")),
                new ExchangeRate(gbp, usd, new BigDecimal("1.39")),
                new ExchangeRate(gbp, sek, new BigDecimal("12.35")),
                new ExchangeRate(gbp, vnd, new BigDecimal("31765")),
                new ExchangeRate(vnd, eur, new BigDecimal("0.000037")),
                new ExchangeRate(vnd, usd, new BigDecimal("0.000043")),
                new ExchangeRate(vnd, sek, new BigDecimal("0.00039")),
                new ExchangeRate(vnd, gbp, new BigDecimal("0.000031"))
            ));
        }
    }
}

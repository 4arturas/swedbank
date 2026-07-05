package com.swedbank.bank.repository;

import com.swedbank.bank.model.ExchangeRate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ExchangeRateRepository extends JpaRepository<ExchangeRate, Long> {
    Optional<ExchangeRate> findByFromCurrency_CodeAndToCurrency_Code(String fromCode, String toCode);
    List<ExchangeRate> findAllByOrderByFromCurrency_CodeAscToCurrency_CodeAsc();
}

package com.swedbank.bank.service;

import com.swedbank.bank.dto.ExchangeRateDto;
import com.swedbank.bank.model.Currency;
import com.swedbank.bank.model.ExchangeRate;
import com.swedbank.bank.repository.ExchangeRateRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ExchangeRateServiceTest {

    @Mock
    private ExchangeRateRepository exchangeRateRepository;

    private ExchangeRateService exchangeRateService;

    private Currency eur;
    private Currency usd;
    private Currency vnd;

    @BeforeEach
    void setUp() {
        exchangeRateService = new ExchangeRateService(exchangeRateRepository);
        eur = new Currency("EUR", "Euro");
        usd = new Currency("USD", "US Dollar");
        vnd = new Currency("VND", "Vietnamese Dong");
    }

    @Test
    void getRate_shouldReturnOne_whenSameCurrency() {
        BigDecimal rate = exchangeRateService.getRate("EUR", "EUR");
        assertThat(rate).isEqualByComparingTo(BigDecimal.ONE);
    }

    @Test
    void getRate_shouldReturnRate_whenRateExists() {
        when(exchangeRateRepository.findByFromCurrency_CodeAndToCurrency_Code("EUR", "USD"))
            .thenReturn(Optional.of(new ExchangeRate(eur, usd, new BigDecimal("1.18"))));

        BigDecimal rate = exchangeRateService.getRate("EUR", "USD");
        assertThat(rate).isEqualByComparingTo(new BigDecimal("1.18"));
    }

    @Test
    void getRate_shouldThrow_whenRateNotFound() {
        when(exchangeRateRepository.findByFromCurrency_CodeAndToCurrency_Code("EUR", "VND"))
            .thenReturn(Optional.empty());

        assertThatThrownBy(() -> exchangeRateService.getRate("EUR", "VND"))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Exchange rate not found");
    }

    @Test
    void getRate_shouldBeCaseSensitive() {
        assertThatThrownBy(() -> exchangeRateService.getRate("eur", "usd"))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Exchange rate not found");
    }

    @Test
    void convert_shouldMultiplyAmountByRate() {
        when(exchangeRateRepository.findByFromCurrency_CodeAndToCurrency_Code("EUR", "USD"))
            .thenReturn(Optional.of(new ExchangeRate(eur, usd, new BigDecimal("1.18"))));

        BigDecimal result = exchangeRateService.convert(new BigDecimal("100"), "EUR", "USD");
        assertThat(result).isEqualByComparingTo(new BigDecimal("118.00"));
        assertThat(result.scale()).isEqualTo(2);
    }

    @Test
    void convert_shouldRoundSmallCurrencyToTwoDecimals() {
        when(exchangeRateRepository.findByFromCurrency_CodeAndToCurrency_Code("VND", "EUR"))
            .thenReturn(Optional.of(new ExchangeRate(vnd, eur, new BigDecimal("0.000037"))));

        BigDecimal result = exchangeRateService.convert(new BigDecimal("100000"), "VND", "EUR");
        assertThat(result).isEqualByComparingTo(new BigDecimal("3.70"));
    }

    @Test
    void getAllRates_shouldReturnAllRatesMappedToDto() {
        ExchangeRate rate1 = new ExchangeRate(eur, usd, new BigDecimal("1.18"));
        ExchangeRate rate2 = new ExchangeRate(usd, eur, new BigDecimal("0.85"));
        when(exchangeRateRepository.findAllByOrderByFromCurrency_CodeAscToCurrency_CodeAsc())
            .thenReturn(List.of(rate1, rate2));

        List<ExchangeRateDto> rates = exchangeRateService.getAllRates();
        assertThat(rates).hasSize(2);
        assertThat(rates.get(0).fromCurrency()).isEqualTo("EUR");
        assertThat(rates.get(0).toCurrency()).isEqualTo("USD");
        assertThat(rates.get(0).rate()).isEqualByComparingTo(new BigDecimal("1.18"));
    }

    @Test
    void convert_shouldReturnOriginalAmount_whenSameCurrency() {
        BigDecimal result = exchangeRateService.convert(new BigDecimal("100"), "EUR", "EUR");
        assertThat(result).isEqualByComparingTo(new BigDecimal("100"));
    }

    @Test
    void convert_shouldRoundExcessiveDecimalPlaces() {
        when(exchangeRateRepository.findByFromCurrency_CodeAndToCurrency_Code("VND", "EUR"))
            .thenReturn(Optional.of(new ExchangeRate(vnd, eur, new BigDecimal("0.000037"))));

        BigDecimal result = exchangeRateService.convert(new BigDecimal("123456"), "VND", "EUR");
        assertThat(result).isEqualByComparingTo(new BigDecimal("4.57"));
        assertThat(result.scale()).isEqualTo(2);
    }

    @Test
    void convert_shouldRoundWhenRateFromDbHasScale6() {
        when(exchangeRateRepository.findByFromCurrency_CodeAndToCurrency_Code("EUR", "USD"))
            .thenReturn(Optional.of(new ExchangeRate(eur, usd, new BigDecimal("1.180000"))));

        BigDecimal result = exchangeRateService.convert(new BigDecimal("99.99"), "EUR", "USD");
        assertThat(result).isEqualByComparingTo(new BigDecimal("117.99"));
        assertThat(result.scale()).isEqualTo(2);
    }
}

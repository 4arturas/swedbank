package com.swedbank.bank.service;

import com.swedbank.bank.dto.AccountDto;
import com.swedbank.bank.model.Account;
import com.swedbank.bank.model.Currency;
import com.swedbank.bank.model.Transaction;
import com.swedbank.bank.model.TransactionType;
import com.swedbank.bank.model.User;
import com.swedbank.bank.repository.AccountRepository;
import com.swedbank.bank.repository.CurrencyRepository;
import com.swedbank.bank.repository.TransactionRepository;
import com.swedbank.bank.repository.TransactionTypeRepository;
import com.swedbank.bank.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AccountServiceExchangeTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private AccountRepository accountRepository;
    @Mock
    private TransactionRepository transactionRepository;
    @Mock
    private TransactionTypeRepository transactionTypeRepository;
    @Mock
    private CurrencyRepository currencyRepository;
    @Mock
    private ExchangeRateService exchangeRateService;

    private AccountService accountService;

    private User user;
    private Currency eur;
    private Currency usd;
    private Account eurAccount;
    private Account usdAccount;
    private TransactionType exchangeOutType;
    private TransactionType exchangeInType;

    @Captor
    private ArgumentCaptor<Transaction> transactionCaptor;

    @BeforeEach
    void setUp() {
        accountService = new AccountService(
            userRepository, accountRepository, transactionRepository,
            transactionTypeRepository, currencyRepository, exchangeRateService
        );

        user = new User("Alice");

        eur = new Currency("EUR", "Euro");
        usd = new Currency("USD", "US Dollar");

        eurAccount = new Account(user, eur, new BigDecimal("1000.00"));
        usdAccount = new Account(user, usd, new BigDecimal("500.00"));

        exchangeOutType = new TransactionType();
        exchangeOutType.setCode("EXCHANGE_OUT");

        exchangeInType = new TransactionType();
        exchangeInType.setCode("EXCHANGE_IN");
    }

    @Test
    void exchange_shouldConvertFromEurToUsd() {
        when(accountRepository.findById(1L)).thenReturn(Optional.of(eurAccount));
        when(accountRepository.findById(2L)).thenReturn(Optional.of(usdAccount));
        when(exchangeRateService.convert(new BigDecimal("100"), "EUR", "USD"))
            .thenReturn(new BigDecimal("118.00"));
        when(transactionTypeRepository.findById("EXCHANGE_OUT"))
            .thenReturn(Optional.of(exchangeOutType));
        when(transactionTypeRepository.findById("EXCHANGE_IN"))
            .thenReturn(Optional.of(exchangeInType));

        List<AccountDto> result = accountService.exchange(1L, 2L, new BigDecimal("100"));

        assertThat(result).hasSize(2);
        assertThat(result.get(0).balance()).isEqualByComparingTo(new BigDecimal("900.00"));
        assertThat(result.get(1).balance()).isEqualByComparingTo(new BigDecimal("618.00"));

        verify(accountRepository, times(2)).save(any(Account.class));
        verify(transactionRepository, times(2)).save(transactionCaptor.capture());
        List<Transaction> savedTransactions = transactionCaptor.getAllValues();

        Transaction outTx = savedTransactions.get(0);
        assertThat(outTx.getType().getCode()).isEqualTo("EXCHANGE_OUT");
        assertThat(outTx.getAmount()).isEqualByComparingTo(new BigDecimal("100"));
        assertThat(outTx.getBalanceBefore()).isEqualByComparingTo(new BigDecimal("1000.00"));
        assertThat(outTx.getBalanceAfter()).isEqualByComparingTo(new BigDecimal("900.00"));

        Transaction inTx = savedTransactions.get(1);
        assertThat(inTx.getType().getCode()).isEqualTo("EXCHANGE_IN");
        assertThat(inTx.getAmount()).isEqualByComparingTo(new BigDecimal("118.00"));
        assertThat(inTx.getBalanceBefore()).isEqualByComparingTo(new BigDecimal("500.00"));
        assertThat(inTx.getBalanceAfter()).isEqualByComparingTo(new BigDecimal("618.00"));
    }

    @Test
    void exchange_shouldConvertFromUsdToEur() {
        when(accountRepository.findById(1L)).thenReturn(Optional.of(usdAccount));
        when(accountRepository.findById(2L)).thenReturn(Optional.of(eurAccount));
        when(exchangeRateService.convert(new BigDecimal("100"), "USD", "EUR"))
            .thenReturn(new BigDecimal("85.00"));
        when(transactionTypeRepository.findById("EXCHANGE_OUT"))
            .thenReturn(Optional.of(exchangeOutType));
        when(transactionTypeRepository.findById("EXCHANGE_IN"))
            .thenReturn(Optional.of(exchangeInType));

        List<AccountDto> result = accountService.exchange(1L, 2L, new BigDecimal("100"));

        assertThat(result.get(0).balance()).isEqualByComparingTo(new BigDecimal("400.00"));
        assertThat(result.get(1).balance()).isEqualByComparingTo(new BigDecimal("1085.00"));
    }

    @Test
    void exchange_shouldThrow_whenFromAccountNotFound() {
        when(accountRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> accountService.exchange(99L, 2L, new BigDecimal("100")))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("From account not found");
    }

    @Test
    void exchange_shouldThrow_whenToAccountNotFound() {
        when(accountRepository.findById(1L)).thenReturn(Optional.of(eurAccount));
        when(accountRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> accountService.exchange(1L, 99L, new BigDecimal("100")))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("To account not found");
    }

    @Test
    void exchange_shouldThrow_whenInsufficientFunds() {
        when(accountRepository.findById(1L)).thenReturn(Optional.of(eurAccount));
        when(accountRepository.findById(2L)).thenReturn(Optional.of(usdAccount));

        assertThatThrownBy(() -> accountService.exchange(1L, 2L, new BigDecimal("2000")))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("Insufficient funds");

        verify(accountRepository, never()).save(any());
        verify(transactionRepository, never()).save(any());
    }

    @Test
    void exchange_shouldAllowSameCurrency() {
        Account anotherEurAccount = new Account(user, eur, new BigDecimal("500.00"));
        when(accountRepository.findById(1L)).thenReturn(Optional.of(eurAccount));
        when(accountRepository.findById(3L)).thenReturn(Optional.of(anotherEurAccount));
        when(exchangeRateService.convert(new BigDecimal("100"), "EUR", "EUR"))
            .thenReturn(new BigDecimal("100"));
        when(transactionTypeRepository.findById("EXCHANGE_OUT"))
            .thenReturn(Optional.of(exchangeOutType));
        when(transactionTypeRepository.findById("EXCHANGE_IN"))
            .thenReturn(Optional.of(exchangeInType));

        List<AccountDto> result = accountService.exchange(1L, 3L, new BigDecimal("100"));

        assertThat(result.get(0).balance()).isEqualByComparingTo(new BigDecimal("900.00"));
        assertThat(result.get(1).balance()).isEqualByComparingTo(new BigDecimal("600.00"));
    }

    @Test
    void exchange_shouldConvertPrecisely() {
        when(accountRepository.findById(1L)).thenReturn(Optional.of(eurAccount));
        when(accountRepository.findById(2L)).thenReturn(Optional.of(usdAccount));

        BigDecimal eurAmount = new BigDecimal("99.99");
        BigDecimal usdResult = new BigDecimal("117.9882");
        when(exchangeRateService.convert(eurAmount, "EUR", "USD"))
            .thenReturn(usdResult);
        when(transactionTypeRepository.findById("EXCHANGE_OUT"))
            .thenReturn(Optional.of(exchangeOutType));
        when(transactionTypeRepository.findById("EXCHANGE_IN"))
            .thenReturn(Optional.of(exchangeInType));

        List<AccountDto> result = accountService.exchange(1L, 2L, eurAmount);

        assertThat(result.get(0).balance()).isEqualByComparingTo(new BigDecimal("900.01"));
        assertThat(result.get(1).balance()).isEqualByComparingTo(new BigDecimal("617.9882"));
    }

    @Test
    void exchange_shouldHandleLargeAmounts() {
        Account richAccount = new Account(user, eur, new BigDecimal("1000000.00"));
        when(accountRepository.findById(1L)).thenReturn(Optional.of(richAccount));
        when(accountRepository.findById(2L)).thenReturn(Optional.of(usdAccount));
        when(exchangeRateService.convert(new BigDecimal("999999.99"), "EUR", "USD"))
            .thenReturn(new BigDecimal("1179999.9882"));
        when(transactionTypeRepository.findById("EXCHANGE_OUT"))
            .thenReturn(Optional.of(exchangeOutType));
        when(transactionTypeRepository.findById("EXCHANGE_IN"))
            .thenReturn(Optional.of(exchangeInType));

        List<AccountDto> result = accountService.exchange(1L, 2L, new BigDecimal("999999.99"));

        assertThat(result.get(0).balance()).isEqualByComparingTo(new BigDecimal("0.01"));
        assertThat(result.get(1).balance()).isEqualByComparingTo(new BigDecimal("1180499.9882"));
    }

    @Test
    void exchange_shouldNotAllowExchangeToItself() {
        assertThatThrownBy(() -> accountService.exchange(1L, 1L, new BigDecimal("100")))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("Cannot exchange to the same account");
    }

    @Test
    void exchange_shouldNotAllowNegativeAmount() {
        assertThatThrownBy(() -> accountService.exchange(1L, 2L, new BigDecimal("-100")))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("Amount must be positive");
    }

    @Test
    void exchange_shouldNotAllowZeroAmount() {
        assertThatThrownBy(() -> accountService.exchange(1L, 2L, BigDecimal.ZERO))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("Amount must be positive");
    }
}

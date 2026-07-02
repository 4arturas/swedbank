package com.swedbank.bank.controller;

import com.swedbank.bank.dto.AccountDto;
import com.swedbank.bank.dto.ExchangeRequest;
import com.swedbank.bank.dto.TransactionDto;
import com.swedbank.bank.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;


    @GetMapping("/users/{userId}/accounts")
    public List<AccountDto> getAccounts(@PathVariable Long userId) {
        return accountService.getAccounts(userId);
    }

    @GetMapping("/accounts/{accountId}")
    public AccountDto getAccount(@PathVariable Long accountId) {
        return accountService.getAccount(accountId);
    }

    @PostMapping("/users/{userId}/accounts")
    public AccountDto createAccount(@PathVariable Long userId, @RequestParam String currency,
                                    @RequestParam(defaultValue = "0") BigDecimal initialBalance) {
        return accountService.createAccount(userId, currency, initialBalance);
    }

    @PostMapping("/accounts/{accountId}/deposit")
    public AccountDto deposit(@PathVariable Long accountId, @RequestParam BigDecimal amount) {
        return accountService.deposit(accountId, amount);
    }

    @PostMapping("/accounts/{accountId}/debit")
    public AccountDto debit(@PathVariable Long accountId, @RequestParam BigDecimal amount) {
        return accountService.debit(accountId, amount);
    }

    @PostMapping("/exchange")
    public List<AccountDto> exchange(@RequestBody ExchangeRequest request) {
        return accountService.exchange(request.fromAccountId(), request.toAccountId(), request.amount());
    }

    @GetMapping("/accounts/{accountId}/transactions")
    public List<TransactionDto> getTransactions(@PathVariable Long accountId,
                                                 @RequestParam(defaultValue = "0") int page,
                                                 @RequestParam(defaultValue = "20") int size) {
        return accountService.getTransactionHistory(accountId, page, size);
    }

    @GetMapping("/transactions/{transactionId}")
    public TransactionDto getTransaction(@PathVariable Long transactionId) {
        return accountService.getTransaction(transactionId);
    }

    @GetMapping("/accounts/{accountId}/transactions/all")
    public List<TransactionDto> getAllTransactions(@PathVariable Long accountId) {
        return accountService.getAllTransactionsForChart(accountId);
    }
}

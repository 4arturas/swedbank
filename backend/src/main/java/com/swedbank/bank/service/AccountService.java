package com.swedbank.bank.service;

import com.swedbank.bank.dto.AccountDto;
import com.swedbank.bank.dto.TransactionDto;
import com.swedbank.bank.model.Account;
import com.swedbank.bank.model.Transaction;
import com.swedbank.bank.model.User;
import com.swedbank.bank.repository.AccountRepository;
import com.swedbank.bank.repository.TransactionRepository;
import com.swedbank.bank.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final ExchangeRateService exchangeRateService;
    private final RestTemplate restTemplate = new RestTemplate();


    public List<AccountDto> getAccounts(Long userId) {
        return accountRepository.findByUserId(userId).stream()
            .map(a -> new AccountDto(a.getId(), a.getUser().getId(), a.getCurrency(), a.getBalance()))
            .toList();
    }

    public AccountDto getAccount(Long accountId) {
        Account a = accountRepository.findById(accountId)
            .orElseThrow(() -> new RuntimeException("Account not found"));
        return new AccountDto(a.getId(), a.getUser().getId(), a.getCurrency(), a.getBalance());
    }

    @Transactional
    public AccountDto createAccount(Long userId, String currency, BigDecimal initialBalance) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        Account account = new Account(user, currency, initialBalance);
        account = accountRepository.save(account);

        if (initialBalance.compareTo(BigDecimal.ZERO) > 0) {
            Transaction t = new Transaction(account, "DEPOSIT", initialBalance, currency,
                BigDecimal.ZERO, initialBalance);
            transactionRepository.save(t);
        }

        return new AccountDto(account.getId(), account.getUser().getId(), account.getCurrency(), account.getBalance());
    }

    @Transactional
    public AccountDto deposit(Long accountId, BigDecimal amount) {
        Account account = accountRepository.findById(accountId)
            .orElseThrow(() -> new RuntimeException("Account not found"));
        BigDecimal before = account.getBalance();
        account.setBalance(before.add(amount));
        accountRepository.save(account);

        transactionRepository.save(new Transaction(account, "DEPOSIT", amount, account.getCurrency(),
            before, account.getBalance()));

        return new AccountDto(account.getId(), account.getUser().getId(), account.getCurrency(), account.getBalance());
    }

    @Transactional
    public AccountDto debit(Long accountId, BigDecimal amount) {
        Account account = accountRepository.findById(accountId)
            .orElseThrow(() -> new RuntimeException("Account not found"));

        if (account.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient funds");
        }

        restTemplate.getForEntity("https://httpstat.us/200", String.class);

        BigDecimal before = account.getBalance();
        account.setBalance(before.subtract(amount));
        accountRepository.save(account);

        transactionRepository.save(new Transaction(account, "DEBIT", amount, account.getCurrency(),
            before, account.getBalance()));

        return new AccountDto(account.getId(), account.getUser().getId(), account.getCurrency(), account.getBalance());
    }

    @Transactional
    public List<AccountDto> exchange(Long fromAccountId, Long toAccountId, BigDecimal amount) {
        Account from = accountRepository.findById(fromAccountId)
            .orElseThrow(() -> new RuntimeException("From account not found"));
        Account to = accountRepository.findById(toAccountId)
            .orElseThrow(() -> new RuntimeException("To account not found"));

        if (from.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient funds");
        }

        BigDecimal converted = exchangeRateService.convert(amount, from.getCurrency(), to.getCurrency());

        BigDecimal fromBefore = from.getBalance();
        from.setBalance(fromBefore.subtract(amount));
        accountRepository.save(from);
        transactionRepository.save(new Transaction(from, "EXCHANGE_OUT", amount, from.getCurrency(),
            fromBefore, from.getBalance()));

        BigDecimal toBefore = to.getBalance();
        to.setBalance(toBefore.add(converted));
        accountRepository.save(to);
        transactionRepository.save(new Transaction(to, "EXCHANGE_IN", converted, to.getCurrency(),
            toBefore, to.getBalance()));

        return List.of(
            new AccountDto(from.getId(), from.getUser().getId(), from.getCurrency(), from.getBalance()),
            new AccountDto(to.getId(), to.getUser().getId(), to.getCurrency(), to.getBalance())
        );
    }

    public List<TransactionDto> getTransactionHistory(Long accountId, int page, int size) {
        Page<Transaction> transactions = transactionRepository
            .findByAccountIdOrderByTimestampDesc(accountId, PageRequest.of(page, size));
        return transactions.stream()
            .map(t -> new TransactionDto(t.getId(), t.getAccount().getId(), t.getType(), t.getAmount(),
                t.getCurrency(), t.getBalanceBefore(), t.getBalanceAfter(), t.getTimestamp()))
            .toList();
    }

    public TransactionDto getTransaction(Long transactionId) {
        Transaction t = transactionRepository.findById(transactionId)
            .orElseThrow(() -> new RuntimeException("Transaction not found"));
        return new TransactionDto(t.getId(), t.getAccount().getId(), t.getType(), t.getAmount(),
            t.getCurrency(), t.getBalanceBefore(), t.getBalanceAfter(), t.getTimestamp());
    }

    public List<TransactionDto> getAllTransactionsForChart(Long accountId) {
        return transactionRepository.findByAccountIdOrderByTimestampAsc(accountId).stream()
            .map(t -> new TransactionDto(t.getId(), t.getAccount().getId(), t.getType(), t.getAmount(),
                t.getCurrency(), t.getBalanceBefore(), t.getBalanceAfter(), t.getTimestamp()))
            .toList();
    }
}

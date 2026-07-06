package com.swedbank.bank.service;

import com.swedbank.bank.dto.AccountDto;
import com.swedbank.bank.dto.TransactionDto;
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
    private final TransactionTypeRepository transactionTypeRepository;
    private final CurrencyRepository currencyRepository;
    private final ExchangeRateService exchangeRateService;
    private final RestTemplate restTemplate = new RestTemplate();


    public List<AccountDto> getAccounts(Long userId) {
        return accountRepository.findByUserId(userId).stream()
            .map(a -> new AccountDto(a.getId(), a.getUser().getId(), a.getCurrency().getCode(), a.getBalance()))
            .toList();
    }

    public AccountDto getAccount(Long accountId) {
        Account a = accountRepository.findById(accountId)
            .orElseThrow(() -> new RuntimeException("Account not found"));
        return new AccountDto(a.getId(), a.getUser().getId(), a.getCurrency().getCode(), a.getBalance());
    }

    @Transactional
    public AccountDto createAccount(Long userId, String currencyCode, BigDecimal initialBalance) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        Currency currency = currencyRepository.findById(currencyCode)
            .orElseThrow(() -> new RuntimeException("Currency not found: " + currencyCode));

        Account account = new Account(user, currency, initialBalance);
        account = accountRepository.save(account);

        if (initialBalance.compareTo(BigDecimal.ZERO) > 0) {
            TransactionType depositType = transactionTypeRepository.findById("DEPOSIT")
                .orElseThrow(() -> new RuntimeException("Transaction type not found: DEPOSIT"));
            Transaction t = new Transaction(account, depositType, initialBalance,
                BigDecimal.ZERO, initialBalance);
            transactionRepository.save(t);
        }

        return new AccountDto(account.getId(), account.getUser().getId(), account.getCurrency().getCode(), account.getBalance());
    }

    @Transactional
    public AccountDto deposit(Long accountId, BigDecimal amount) {
        Account account = accountRepository.findById(accountId)
            .orElseThrow(() -> new RuntimeException("Account not found"));
        BigDecimal before = account.getBalance();
        account.setBalance(before.add(amount));
        accountRepository.save(account);

        TransactionType depositType = transactionTypeRepository.findById("DEPOSIT")
            .orElseThrow(() -> new RuntimeException("Transaction type not found: DEPOSIT"));
        transactionRepository.save(new Transaction(account, depositType, amount,
            before, account.getBalance()));

        return new AccountDto(account.getId(), account.getUser().getId(), account.getCurrency().getCode(), account.getBalance());
    }

    @Transactional
    public AccountDto debit(Long accountId, BigDecimal amount) {
        Account account = accountRepository.findById(accountId)
            .orElseThrow(() -> new RuntimeException("Account not found"));

        if (account.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient funds");
        }

//        restTemplate.getForEntity("https://tools-httpstatus.pickup-services.com/200", String.class);
//        restTemplate.getForEntity("https://httpstat.us/200", String.class);
//        restTemplate.getForEntity("https://www.lrt.lt/", String.class);

        BigDecimal before = account.getBalance();
        account.setBalance(before.subtract(amount));
        accountRepository.save(account);

        TransactionType debitType = transactionTypeRepository.findById("DEBIT")
            .orElseThrow(() -> new RuntimeException("Transaction type not found: DEBIT"));
        transactionRepository.save(new Transaction(account, debitType, amount,
            before, account.getBalance()));

        return new AccountDto(account.getId(), account.getUser().getId(), account.getCurrency().getCode(), account.getBalance());
    }

    @Transactional
    public List<AccountDto> exchange(Long fromAccountId, Long toAccountId, BigDecimal amount) {
        if (fromAccountId.equals(toAccountId)) {
            throw new RuntimeException("Cannot exchange to the same account");
        }
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Amount must be positive");
        }

        Account from = accountRepository.findById(fromAccountId)
            .orElseThrow(() -> new RuntimeException("From account not found"));
        Account to = accountRepository.findById(toAccountId)
            .orElseThrow(() -> new RuntimeException("To account not found"));

        if (from.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient funds");
        }

        BigDecimal converted = exchangeRateService.convert(amount, from.getCurrency().getCode(), to.getCurrency().getCode());

        BigDecimal fromBefore = from.getBalance();
        from.setBalance(fromBefore.subtract(amount));
        accountRepository.save(from);
        TransactionType exchangeOutType = transactionTypeRepository.findById("EXCHANGE_OUT")
            .orElseThrow(() -> new RuntimeException("Transaction type not found: EXCHANGE_OUT"));
        transactionRepository.save(new Transaction(from, exchangeOutType, amount,
            fromBefore, from.getBalance()));

        BigDecimal toBefore = to.getBalance();
        to.setBalance(toBefore.add(converted));
        accountRepository.save(to);
        TransactionType exchangeInType = transactionTypeRepository.findById("EXCHANGE_IN")
            .orElseThrow(() -> new RuntimeException("Transaction type not found: EXCHANGE_IN"));
        transactionRepository.save(new Transaction(to, exchangeInType, converted,
            toBefore, to.getBalance()));

        return List.of(
            new AccountDto(from.getId(), from.getUser().getId(), from.getCurrency().getCode(), from.getBalance()),
            new AccountDto(to.getId(), to.getUser().getId(), to.getCurrency().getCode(), to.getBalance())
        );
    }

    public List<TransactionDto> getTransactionHistory(Long accountId, int page, int size) {
        Page<Transaction> transactions = transactionRepository
            .findByAccountIdOrderByTimestampDesc(accountId, PageRequest.of(page, size));
        return transactions.stream()
            .map(t -> new TransactionDto(t.getId(), t.getAccount().getId(), t.getType().getCode(), t.getAmount(),
                t.getAccount().getCurrency().getCode(), t.getBalanceBefore(), t.getBalanceAfter(), t.getTimestamp()))
            .toList();
    }

    public TransactionDto getTransaction(Long transactionId) {
        Transaction t = transactionRepository.findById(transactionId)
            .orElseThrow(() -> new RuntimeException("Transaction not found"));
        return new TransactionDto(t.getId(), t.getAccount().getId(), t.getType().getCode(), t.getAmount(),
            t.getAccount().getCurrency().getCode(), t.getBalanceBefore(), t.getBalanceAfter(), t.getTimestamp());
    }

    public List<TransactionDto> getAllTransactionsForChart(Long accountId) {
        return transactionRepository.findByAccountIdOrderByTimestampAsc(accountId).stream()
            .map(t -> new TransactionDto(t.getId(), t.getAccount().getId(), t.getType().getCode(), t.getAmount(),
                t.getAccount().getCurrency().getCode(), t.getBalanceBefore(), t.getBalanceAfter(), t.getTimestamp()))
            .toList();
    }
}

package com.swedbank.bank.repository;

import com.swedbank.bank.model.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    Page<Transaction> findByAccountIdOrderByTimestampDesc(Long accountId, Pageable pageable);
    List<Transaction> findByAccountIdOrderByTimestampAsc(Long accountId);
}

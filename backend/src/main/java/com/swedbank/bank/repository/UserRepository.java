package com.swedbank.bank.repository;

import com.swedbank.bank.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}

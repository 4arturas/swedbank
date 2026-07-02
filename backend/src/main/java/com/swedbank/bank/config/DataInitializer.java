package com.swedbank.bank.config;

import com.swedbank.bank.model.User;
import com.swedbank.bank.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;


    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            userRepository.save(new User("Alice"));
            userRepository.save(new User("Bob"));
        }
    }
}

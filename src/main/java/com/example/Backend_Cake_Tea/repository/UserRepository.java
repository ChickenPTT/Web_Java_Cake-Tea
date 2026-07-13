package com.example.Backend_Cake_Tea.repository;

import com.example.Backend_Cake_Tea.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);

    List<User> findByBirthday(LocalDate birthday);

    List<User> findByEmailMarketingTrue();
}

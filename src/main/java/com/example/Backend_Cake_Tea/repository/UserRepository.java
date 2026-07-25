package com.example.Backend_Cake_Tea.repository;

import com.example.Backend_Cake_Tea.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.birthday IS NOT NULL " +
           "AND FUNCTION('MONTH', u.birthday) = :month " +
           "AND FUNCTION('DAY', u.birthday) = :day")
    List<User> findByBirthdayMonthAndDay(@Param("month") int month, @Param("day") int day);

    List<User> findByEmailMarketingTrue();
}

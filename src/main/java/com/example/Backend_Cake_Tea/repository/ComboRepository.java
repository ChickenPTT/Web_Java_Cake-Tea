package com.example.Backend_Cake_Tea.repository;

import com.example.Backend_Cake_Tea.model.Combo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ComboRepository extends JpaRepository<Combo, Long> {

    @Query("SELECT DISTINCT c FROM Combo c LEFT JOIN FETCH c.items i LEFT JOIN FETCH i.food " +
           "WHERE c.active = true " +
           "AND (c.startDate IS NULL OR c.startDate <= :now) " +
           "AND (c.endDate IS NULL OR c.endDate >= :now)")
    List<Combo> findActiveAt(@Param("now") LocalDateTime now);

    @Query("SELECT DISTINCT c FROM Combo c LEFT JOIN FETCH c.items i LEFT JOIN FETCH i.food WHERE c.id = :id")
    java.util.Optional<Combo> findByIdWithItems(@Param("id") Long id);
}
